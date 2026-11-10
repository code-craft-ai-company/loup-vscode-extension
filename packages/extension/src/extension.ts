// ============================================================================
// Loup Language Extension for Visual Studio Code
// Entry point — grammar, language server, trace viewer, run, tasks, dependencies
// ============================================================================

import * as path from 'path';
import * as vscode from 'vscode';
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
} from 'vscode-languageclient/node';

import { TraceEditorProvider, TraceViewerPanel, openTraceViewer } from './traceViewerPanel';
import { LoupTaskProvider } from './taskProvider';
import { DependencyTreeProvider } from './dependencyTree';
import { loupExecutable } from './toolchain';
import { LOUP_MANIFEST_LANGUAGE, LOUP_SOURCE_LANGUAGES, isLoupSource } from './languages';

let client: LanguageClient | undefined;

const EXTENSION_MODE_INFO: Record<string, { label: string; defaultMode: string; description: string }> = {
  '.loup': {
    label: 'Loup',
    defaultMode: 'host.scripted',
    description: 'General Loup source file (any execution mode)',
  },
  '.lpscr': {
    label: 'Loup (host-script)',
    defaultMode: 'host.scripted',
    description: 'Host-script or dual-mode Loup source (.lpscr — host.scripted / host.dual)',
  },
  '.lpfree': {
    label: 'Loup (freestanding)',
    defaultMode: 'freestanding',
    description: 'Freestanding bare-metal Loup source (.lpfree — @mode(freestanding))',
  },
  '.lpweb': {
    label: 'Loup (web)',
    defaultMode: 'web.scripted',
    description: 'Web-hosted Loup source (.lpweb — web.scripted / web.compiled)',
  },
  '.lphc': {
    label: 'Loup (host-compiled)',
    defaultMode: 'host.native',
    description: 'Host-compiled native Loup source (.lphc — host.native / host.dual)',
  },
};

export function activate(context: vscode.ExtensionContext): void {
  const outputChannel = vscode.window.createOutputChannel('Loup Language');
  context.subscriptions.push(outputChannel);
  outputChannel.appendLine(`Loup Language extension v${context.extension.packageJSON.version} activated.`);

  // ---- Status bar item ----
  const statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );
  statusBarItem.text = '$(symbol-misc) Loup';
  statusBarItem.tooltip = 'Loup Language v1.20';
  context.subscriptions.push(statusBarItem);

  const updateStatusBar = (editor: vscode.TextEditor | undefined) => {
    if (
      editor &&
      (isLoupSource(editor.document.languageId) ||
        editor.document.languageId === LOUP_MANIFEST_LANGUAGE)
    ) {
      if (editor.document.languageId === LOUP_MANIFEST_LANGUAGE) {
        statusBarItem.text = '$(package) Loup Manifest';
        statusBarItem.tooltip = 'Loup Package Manifest (.lppkg) — v1.20';
      } else {
        const ext = path.extname(editor.document.fileName).toLowerCase();
        const extInfo = EXTENSION_MODE_INFO[ext] ?? EXTENSION_MODE_INFO['.loup'];
        const firstLines = editor.document.getText(new vscode.Range(0, 0, 20, 0));
        const modeMatch = firstLines.match(/@mode\(\s*([a-zA-Z0-9_.]+)\s*\)/);
        const activeMode = modeMatch ? modeMatch[1] : extInfo.defaultMode;
        statusBarItem.text = `$(symbol-misc) Loup [${activeMode}]`;
        statusBarItem.tooltip = `${extInfo.description}\nActive mode: @mode(${activeMode})`;
      }
      statusBarItem.show();
    } else {
      statusBarItem.hide();
    }
  };

  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(updateStatusBar),
    vscode.workspace.onDidChangeTextDocument((e) => {
      if (vscode.window.activeTextEditor?.document === e.document) {
        updateStatusBar(vscode.window.activeTextEditor);
      }
    })
  );
  updateStatusBar(vscode.window.activeTextEditor);

  // ---- Start LSP client ----
  startLanguageClient(context, outputChannel);

  // ---- Register debug configuration provider ----
  context.subscriptions.push(
    vscode.debug.registerDebugConfigurationProvider('loup', new LoupDebugConfigurationProvider())
  );

  // ---- The trace viewer ----
  //
  // A `.ltrace` file opens in the trace viewer (a custom editor). The Loup
  // toolchain reads the file; the viewer moves over what it holds.
  const withViewer = (act: (v: TraceViewerPanel) => void | Promise<void>) => async () => {
    const viewer = TraceViewerPanel.active;
    if (!viewer) {
      vscode.window.showInformationMessage('Open a .ltrace file first (Loup: Open Trace).');
      return;
    }
    await act(viewer);
  };

  context.subscriptions.push(
    vscode.window.registerCustomEditorProvider(
      TraceEditorProvider.viewType,
      new TraceEditorProvider(context, outputChannel),
      { webviewOptions: { retainContextWhenHidden: true }, supportsMultipleEditorsPerDocument: false }
    ),
    vscode.commands.registerCommand('loup.trace.open', async (uri?: vscode.Uri) => {
      let target = uri;
      if (!target) {
        const picked = await vscode.window.showOpenDialog({
          canSelectMany: false,
          filters: { 'Loup trace': ['ltrace'], 'Exported trace view': ['json'] },
          openLabel: 'Open Trace',
        });
        target = picked?.[0];
      }
      if (target) await openTraceViewer(target);
    }),
    vscode.commands.registerCommand('loup.trace.stepBack', withViewer((v) => v.step('backward'))),
    vscode.commands.registerCommand('loup.trace.stepForward', withViewer((v) => v.step('forward'))),
    vscode.commands.registerCommand(
      'loup.trace.previousException',
      withViewer((v) => v.stepKind('backward', ['Exception']))
    ),
    vscode.commands.registerCommand(
      'loup.trace.nextException',
      withViewer((v) => v.stepKind('forward', ['Exception']))
    ),
    vscode.commands.registerCommand('loup.trace.previousCapture', withViewer((v) => v.stepCapture('backward'))),
    vscode.commands.registerCommand('loup.trace.nextCapture', withViewer((v) => v.stepCapture('forward'))),
    vscode.commands.registerCommand('loup.trace.gotoPoint', withViewer((v) => v.promptGotoPoint())),
    vscode.commands.registerCommand('loup.trace.query', withViewer((v) => v.promptQuery())),
    vscode.commands.registerCommand('loup.trace.reload', withViewer((v) => v.reload()))
  );

  // ---- Tasks: loup run / build / test / fmt ----
  context.subscriptions.push(
    vscode.tasks.registerTaskProvider(LoupTaskProvider.type, new LoupTaskProvider())
  );

  // ---- Package dependency view ----
  const depTreeProvider = new DependencyTreeProvider();
  const manifestWatcher = vscode.workspace.createFileSystemWatcher('**/{*.lppkg,loup.pkg}');
  const refreshDeps = () => void depTreeProvider.refresh();
  context.subscriptions.push(
    vscode.window.registerTreeDataProvider('loupDependencies', depTreeProvider),
    vscode.commands.registerCommand('loup.refreshDependencies', refreshDeps),
    manifestWatcher,
    manifestWatcher.onDidChange(refreshDeps),
    manifestWatcher.onDidCreate(refreshDeps),
    manifestWatcher.onDidDelete(refreshDeps),
    vscode.workspace.onDidChangeWorkspaceFolders(refreshDeps)
  );
}

// ---- Debug Configuration Provider ----

class LoupDebugConfigurationProvider implements vscode.DebugConfigurationProvider {
  resolveDebugConfiguration(
    _folder: vscode.WorkspaceFolder | undefined,
    config: vscode.DebugConfiguration,
    _token?: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.DebugConfiguration> {
    // F5 with no launch.json: run the open Loup file.
    if (!config.type && !config.request && !config.name) {
      const editor = vscode.window.activeTextEditor;
      if (editor && isLoupSource(editor.document.languageId)) {
        config.type = 'loup';
        config.name = 'Run Loup File';
        config.request = 'launch';
        config.program = '${file}';
      }
    }

    if (!config.program) {
      return vscode.window
        .showInformationMessage('Open a Loup file to run, or set "program" in the launch configuration.')
        .then(() => undefined);
    }

    // The adapter is a separate process: hand it the configured executable.
    if (!config.loupExecutable) config.loupExecutable = loupExecutable();
    return config;
  }
}

// ---- Language Client ----

function startLanguageClient(
  context: vscode.ExtensionContext,
  outputChannel: vscode.OutputChannel
): void {
  const serverModule = context.asAbsolutePath(
    path.join('out', 'server.js')
  );

  const serverOptions: ServerOptions = {
    run: {
      module: serverModule,
      transport: TransportKind.ipc,
    },
    debug: {
      module: serverModule,
      transport: TransportKind.ipc,
      options: { execArgv: ['--nolazy', '--inspect=6009'] },
    },
  };

  const clientOptions: LanguageClientOptions = {
    documentSelector: [
      ...LOUP_SOURCE_LANGUAGES.map((language) => ({ scheme: 'file', language })),
      { scheme: 'file', language: 'loup-pkg' },
    ],
    synchronize: {
      fileEvents: vscode.workspace.createFileSystemWatcher('**/{*.loup,*.lpscr,*.lpfree,*.lpweb,*.lphc,*.lppkg,loup.pkg}'),
    },
    outputChannel,
  };

  client = new LanguageClient(
    'loupLanguageServer',
    'Loup Language Server',
    serverOptions,
    clientOptions
  );

  client.start().then(
    () => {
      outputChannel.appendLine('Loup Language Server started.');
    },
    (err) => {
      outputChannel.appendLine(`Failed to start Language Server: ${err}`);
    }
  );

}

export function deactivate(): Thenable<void> | undefined {
  const running = client;
  client = undefined;
  return running?.isRunning() ? running.stop() : undefined;
}
