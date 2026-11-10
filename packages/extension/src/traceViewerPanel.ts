// ============================================================================
// Trace viewer — the custom editor for `.ltrace` files.
//
// One webview per open trace. The webview draws; this side owns the session
// (where the reader is), runs the toolchain's trace tool, and moves the source
// editor to the line of the current record.
// ============================================================================

import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { TraceToolSettings, loadTraceView, queryTrace } from './traceTool';
import { Direction, TraceSession, TraceView, TraceViewError, ViewSite, parseTraceView } from './traceView';

export function traceToolSettings(): TraceToolSettings {
  const cfg = vscode.workspace.getConfiguration('loup');
  return {
    executable: cfg.get<string>('executable', '') || process.env['LOUP_PATH'] || 'loup',
    toolchainRoot: cfg.get<string>('toolchainRoot', ''),
    toolCommand: cfg.get<string[]>('trace.toolCommand', []),
    timeoutMs: cfg.get<number>('trace.timeoutMs', 60000),
  };
}

/** A pre-exported view (`loup_debug view … > x.view.json`) opens without the toolchain. */
function isViewJson(file: string): boolean {
  return file.toLowerCase().endsWith('.json');
}

type FromWebview =
  | { type: 'ready' }
  | { type: 'goto'; capture: number; item: number }
  | { type: 'gotoSeq'; capture: number; seq: number }
  | { type: 'step'; dir: Direction }
  | { type: 'stepKind'; dir: Direction; kinds: string[] }
  | { type: 'stepLine'; dir: Direction }
  | { type: 'stepCapture'; dir: Direction }
  | { type: 'gotoPoint'; text: string }
  | { type: 'query'; text: string }
  | { type: 'openSite'; site: number }
  | { type: 'copy'; text: string }
  | { type: 'reload' }
  | { type: 'settings' };

export class TraceViewerPanel {
  /** The viewer that last had focus; the `loup.trace.*` commands act on it. */
  static active: TraceViewerPanel | undefined;
  private static readonly all = new Set<TraceViewerPanel>();

  private session: TraceSession | undefined;
  private readonly lineDecoration: vscode.TextEditorDecorationType;
  private readonly disposables: vscode.Disposable[] = [];
  private ready = false;
  private loadError: string | undefined;

  constructor(
    private readonly context: vscode.ExtensionContext,
    private readonly file: string,
    private readonly panel: vscode.WebviewPanel,
    private readonly log: vscode.OutputChannel
  ) {
    TraceViewerPanel.all.add(this);
    TraceViewerPanel.active = this;

    this.lineDecoration = vscode.window.createTextEditorDecorationType({
      isWholeLine: true,
      backgroundColor: new vscode.ThemeColor('editor.stackFrameHighlightBackground'),
      overviewRulerColor: new vscode.ThemeColor('editorOverviewRuler.infoForeground'),
      overviewRulerLane: vscode.OverviewRulerLane.Full,
    });

    const media = vscode.Uri.joinPath(context.extensionUri, 'media');
    panel.webview.options = { enableScripts: true, localResourceRoots: [media] };
    panel.webview.html = this.html(media);

    this.disposables.push(
      panel.webview.onDidReceiveMessage((m: FromWebview) => this.onMessage(m)),
      panel.onDidChangeViewState((e) => {
        if (e.webviewPanel.active) TraceViewerPanel.active = this;
      }),
      panel.onDidDispose(() => this.dispose())
    );

    void this.load();
  }

  // ---- Loading ----

  private async load(): Promise<void> {
    this.loadError = undefined;
    this.post({ type: 'loading', file: path.basename(this.file) });
    try {
      let view: TraceView;
      if (isViewJson(this.file)) {
        view = parseTraceView(await fs.promises.readFile(this.file, 'utf8'));
      } else {
        view = await loadTraceView(traceToolSettings(), this.file);
      }
      this.session = new TraceSession(view);
      this.panel.title = `${path.basename(this.file)} — Loup trace`;
      this.postView();
      void this.revealSource(false);
    } catch (e) {
      this.session = undefined;
      this.loadError = this.explain(e);
      this.log.appendLine(`[trace] ${this.file}: ${this.loadError}`);
      this.post({ type: 'loadError', message: this.loadError, canConfigure: true });
    }
  }

  private explain(e: unknown): string {
    if (e instanceof TraceViewError) {
      if (e.kind === 'no-tool' || e.kind === 'tool') {
        return (
          e.message +
          '\n\nA `.ltrace` file is read by the Loup toolchain. If `loup debug` is not available in your ' +
          'toolchain yet, set "loup.toolchainRoot" to a Loup source checkout.'
        );
      }
      return e.message;
    }
    return e instanceof Error ? e.message : String(e);
  }

  // ---- Webview traffic ----

  private post(message: Record<string, unknown>): void {
    if (this.ready) void this.panel.webview.postMessage(message);
  }

  private postView(): void {
    if (!this.session) return;
    this.post({
      type: 'view',
      view: this.session.view,
      file: this.file,
      canQuery: !isViewJson(this.file),
      cursor: this.cursorMessage(),
    });
  }

  private cursorMessage(): Record<string, unknown> {
    const s = this.session!;
    return {
      ...s.position(),
      pointLabel: s.currentPointLabel(),
      agentPoint: s.currentAgentPoint() ?? null,
    };
  }

  private moved(found: unknown, missMessage: string, crossedFrom?: number): void {
    if (!this.session) return;
    if (found === undefined) {
      this.post({ type: 'note', message: missMessage });
      return;
    }
    const pos = this.session.position();
    this.post({
      type: 'cursor',
      cursor: this.cursorMessage(),
      note:
        crossedFrom !== undefined && crossedFrom !== pos.capture
          ? 'Moved to another capture. The time between captures was not recorded.'
          : '',
    });
    void this.revealSource(false);
  }

  private async onMessage(m: FromWebview): Promise<void> {
    if (m.type === 'ready') {
      this.ready = true;
      if (this.session) this.postView();
      else if (this.loadError) this.post({ type: 'loadError', message: this.loadError, canConfigure: true });
      else this.post({ type: 'loading', file: path.basename(this.file) });
      return;
    }
    if (m.type === 'reload') return this.load();
    if (m.type === 'settings') {
      await vscode.commands.executeCommand('workbench.action.openSettings', 'loup.toolchainRoot');
      return;
    }
    if (m.type === 'copy') {
      await vscode.env.clipboard.writeText(m.text);
      this.post({ type: 'note', message: `Copied ${m.text}` });
      return;
    }
    if (!this.session) return;
    const from = this.session.position().capture;
    switch (m.type) {
      case 'goto':
        return this.moved(this.session.goto(m.capture, m.item), 'Nothing there.');
      case 'gotoSeq':
        return this.moved(this.session.gotoSeq(m.capture, m.seq), 'That record is not in this view.');
      case 'step':
        return this.step(m.dir);
      case 'stepKind':
        return this.stepKind(m.dir, m.kinds);
      case 'stepLine':
        return this.moved(
          this.session.stepToSameLine(m.dir),
          `No ${m.dir === 'forward' ? 'later' : 'earlier'} record at this source line.`,
          from
        );
      case 'stepCapture':
        return this.stepCapture(m.dir);
      case 'gotoPoint':
        return this.gotoPoint(m.text);
      case 'query':
        return this.query(m.text);
      case 'openSite':
        return void this.revealSite(this.session.view.sites[m.site], true);
    }
  }

  // ---- Commands (also reachable from the command palette and keybindings) ----

  step(dir: Direction): void {
    if (!this.session) return;
    const from = this.session.position().capture;
    this.moved(
      this.session.step(dir),
      dir === 'forward' ? 'This is the last record of the trace.' : 'This is the first record of the trace.',
      from
    );
  }

  stepKind(dir: Direction, kinds: string[]): void {
    if (!this.session) return;
    const from = this.session.position().capture;
    this.moved(
      this.session.stepToKind(dir, kinds),
      `No ${dir === 'forward' ? 'later' : 'earlier'} ${kinds.join(' / ')} record.`,
      from
    );
  }

  stepCapture(dir: Direction): void {
    if (!this.session) return;
    this.moved(
      this.session.stepCapture(dir),
      dir === 'forward' ? 'This is the last capture.' : 'This is the first capture.'
    );
  }

  gotoPoint(text: string): void {
    if (!this.session) return;
    try {
      this.moved(this.session.gotoPoint(text), 'That point has no record in this trace.');
    } catch (e) {
      this.post({ type: 'note', message: this.explain(e), error: true });
    }
  }

  async promptGotoPoint(): Promise<void> {
    if (!this.session) return;
    const text = await vscode.window.showInputBox({
      prompt: 'Go to a point in the trace',
      placeHolder: 'exception#0, portal(shop.checkout)#2, output#3, a bookmark name, or pt:<trace>:<point>',
    });
    if (text) this.gotoPoint(text);
  }

  async promptQuery(): Promise<void> {
    if (!this.session) return;
    const text = await vscode.window.showInputBox({
      prompt: 'Trace query',
      placeHolder: 'exception(ValueError) · seam(fs.read) where path.endsWith(".toml") · output(stderr)',
    });
    if (text) {
      this.panel.reveal(undefined, true);
      await this.query(text);
    }
  }

  private async query(text: string): Promise<void> {
    const q = text.trim();
    if (q.length === 0) return;
    if (isViewJson(this.file)) {
      this.post({
        type: 'queryResult',
        query: q,
        error: 'Queries run against the `.ltrace` file. This is an exported view; open the trace itself to query it.',
      });
      return;
    }
    this.post({ type: 'queryBusy', query: q });
    try {
      const limit = vscode.workspace.getConfiguration('loup').get<number>('trace.queryLimit', 200);
      const result = await queryTrace(traceToolSettings(), this.file, q, limit);
      this.post({ type: 'queryResult', query: q, result });
    } catch (e) {
      this.post({ type: 'queryResult', query: q, error: this.explain(e) });
    }
  }

  reload(): void {
    void this.load();
  }

  // ---- The source editor ----

  /**
   * Where a site's file is on disk. Site paths are relative to the package root,
   * which is a workspace folder or a directory above the trace file.
   */
  private resolveSiteFile(site: ViewSite): string | undefined {
    if (site.file.length === 0) return undefined;
    if (path.isAbsolute(site.file)) return fs.existsSync(site.file) ? site.file : undefined;
    const roots: string[] = [];
    for (const f of vscode.workspace.workspaceFolders ?? []) roots.push(f.uri.fsPath);
    let dir = path.dirname(this.file);
    for (let i = 0; i < 8; i++) {
      roots.push(dir);
      const up = path.dirname(dir);
      if (up === dir) break;
      dir = up;
    }
    for (const root of roots) {
      const candidate = path.join(root, site.file);
      if (fs.existsSync(candidate)) return candidate;
    }
    return undefined;
  }

  private async revealSource(takeFocus: boolean): Promise<void> {
    if (!this.session) return;
    await this.revealSite(this.session.siteOf(this.session.currentItem()), takeFocus);
  }

  private async revealSite(site: ViewSite | undefined, takeFocus: boolean): Promise<void> {
    if (!site) return;
    const file = this.resolveSiteFile(site);
    if (!file) {
      if (takeFocus) {
        this.post({
          type: 'note',
          message: `${site.file} is not in this workspace, so the source cannot be shown.`,
          error: true,
        });
      }
      return;
    }
    try {
      const doc = await vscode.workspace.openTextDocument(file);
      const line = Math.min(Math.max(0, site.line - 1), Math.max(0, doc.lineCount - 1));
      const column = this.panel.viewColumn === vscode.ViewColumn.One ? vscode.ViewColumn.Beside : vscode.ViewColumn.One;
      const editor = await vscode.window.showTextDocument(doc, {
        viewColumn: column,
        preserveFocus: !takeFocus,
        preview: true,
      });
      const pos = new vscode.Position(line, Math.max(0, site.column - 1));
      editor.selection = new vscode.Selection(pos, pos);
      editor.revealRange(new vscode.Range(pos, pos), vscode.TextEditorRevealType.InCenterIfOutsideViewport);
      for (const ed of vscode.window.visibleTextEditors) ed.setDecorations(this.lineDecoration, []);
      editor.setDecorations(this.lineDecoration, [new vscode.Range(line, 0, line, 0)]);
    } catch (e) {
      this.log.appendLine(`[trace] could not show ${file}: ${e}`);
    }
  }

  // ---- HTML ----

  private html(media: vscode.Uri): string {
    const w = this.panel.webview;
    const nonce = Array.from({ length: 32 }, () =>
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'.charAt(Math.floor(Math.random() * 62))
    ).join('');
    const css = w.asWebviewUri(vscode.Uri.joinPath(media, 'traceViewer.css'));
    const js = w.asWebviewUri(vscode.Uri.joinPath(media, 'traceViewer.js'));
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy"
        content="default-src 'none'; style-src ${w.cspSource}; script-src 'nonce-${nonce}';">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="${css}">
  <title>Loup trace</title>
</head>
<body>
  <div id="app"></div>
  <script nonce="${nonce}" src="${js}"></script>
</body>
</html>`;
  }

  dispose(): void {
    TraceViewerPanel.all.delete(this);
    if (TraceViewerPanel.active === this) {
      TraceViewerPanel.active = [...TraceViewerPanel.all].pop();
    }
    for (const ed of vscode.window.visibleTextEditors) ed.setDecorations(this.lineDecoration, []);
    this.lineDecoration.dispose();
    for (const d of this.disposables) d.dispose();
  }
}

// ---- The custom editor ----------------------------------------------------

class TraceDocument implements vscode.CustomDocument {
  constructor(readonly uri: vscode.Uri) {}
  dispose(): void {}
}

export class TraceEditorProvider implements vscode.CustomReadonlyEditorProvider<TraceDocument> {
  static readonly viewType = 'loup.traceViewer';

  constructor(
    private readonly context: vscode.ExtensionContext,
    private readonly log: vscode.OutputChannel
  ) {}

  openCustomDocument(uri: vscode.Uri): TraceDocument {
    return new TraceDocument(uri);
  }

  resolveCustomEditor(document: TraceDocument, panel: vscode.WebviewPanel): void {
    new TraceViewerPanel(this.context, document.uri.fsPath, panel, this.log);
  }
}

/** Open `uri` in the trace viewer (a `.ltrace`, or an exported `.view.json`). */
export async function openTraceViewer(uri: vscode.Uri): Promise<void> {
  await vscode.commands.executeCommand('vscode.openWith', uri, TraceEditorProvider.viewType, vscode.ViewColumn.Beside);
}
