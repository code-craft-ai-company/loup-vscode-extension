// ============================================================================
// Time-Travel Timeline Webview Panel — Visual scrubber & trace event viewer
// ============================================================================

import * as vscode from 'vscode';
import { TimeTravelManager, TraceEvent, TraceEventKind } from './timeTravelManager';

export class TimelinePanel {
  public static readonly viewType = 'loup.timeTravelTimeline';
  private panel: vscode.WebviewPanel | undefined;

  constructor(
    private context: vscode.ExtensionContext,
    private manager: TimeTravelManager
  ) {
    manager.onDidUpdate(() => this.updateWebview());
  }

  show(): void {
    if (this.panel) {
      this.panel.reveal(vscode.ViewColumn.Two);
      return;
    }

    this.panel = vscode.window.createWebviewPanel(
      TimelinePanel.viewType,
      'Loup Time-Travel Timeline',
      vscode.ViewColumn.Two,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
      }
    );

    this.updateWebview();

    // Handle messages from the webview
    this.panel.webview.onDidReceiveMessage(
      (msg: { command: string; seq?: number; kind?: TraceEventKind }) => {
        switch (msg.command) {
          case 'stepTo':
            if (msg.seq !== undefined) {
              const ev = this.manager.stepTo(msg.seq);
              if (ev) this.navigateToEvent(ev);
            }
            break;
          case 'stepForward': {
            const ev = this.manager.stepForward();
            if (ev) this.navigateToEvent(ev);
            break;
          }
          case 'stepBackward': {
            const ev = this.manager.stepBackward();
            if (ev) this.navigateToEvent(ev);
            break;
          }
          case 'stepBackToCall': {
            const ev = this.manager.stepBackToCall();
            if (ev) this.navigateToEvent(ev);
            break;
          }
          case 'stepForwardToReturn': {
            const ev = this.manager.stepForwardToReturn();
            if (ev) this.navigateToEvent(ev);
            break;
          }
          case 'nextPortal': {
            const ev = this.manager.stepToNextPortal();
            if (ev) this.navigateToEvent(ev);
            break;
          }
          case 'prevPortal': {
            const ev = this.manager.stepToPrevPortal();
            if (ev) this.navigateToEvent(ev);
            break;
          }
          case 'startCapture':
            this.manager.startCapture();
            break;
          case 'stopCapture':
            this.manager.stopCapture();
            break;
          case 'exitReplay':
            this.manager.exitReplay();
            break;
        }
      },
      undefined,
      this.context.subscriptions
    );

    this.panel.onDidDispose(() => {
      this.panel = undefined;
    });
  }

  private async navigateToEvent(event: TraceEvent): Promise<void> {
    if (event.source && event.line !== undefined) {
      try {
        const doc = await vscode.workspace.openTextDocument(event.source);
        const editor = await vscode.window.showTextDocument(doc, vscode.ViewColumn.One, true);
        const pos = new vscode.Position(Math.max(0, event.line - 1), event.column || 0);
        editor.selection = new vscode.Selection(pos, pos);
        editor.revealRange(new vscode.Range(pos, pos), vscode.TextEditorRevealType.InCenter);
      } catch {
        // File might not exist locally
      }
    }
  }

  private updateWebview(): void {
    if (!this.panel) return;
    const state = this.manager.getState();
    this.panel.webview.html = this.getHtml(state);
  }

  private getHtml(state: ReturnType<TimeTravelManager['getState']>): string {
    const eventsJson = JSON.stringify(state.events.slice(-500)); // Last 500 for perf
    const currentIdx = state.currentIndex;
    const currentEvent = state.events[currentIdx];

    const kindBadgeColors: Record<string, string> = {
      Call: '#4ec9b0',
      Return: '#569cd6',
      Line: '#808080',
      Exception: '#f44747',
      Await: '#dcdcaa',
      Resume: '#c586c0',
      Portal: '#ce9178',
      Signal: '#9cdcfe',
    };

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Loup Time-Travel Timeline</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: var(--vscode-font-family, 'Segoe UI', sans-serif);
      font-size: var(--vscode-font-size, 13px);
      color: var(--vscode-foreground);
      background: var(--vscode-editor-background);
      padding: 12px;
    }

    /* Controls bar */
    .controls {
      display: flex;
      gap: 6px;
      align-items: center;
      padding: 8px 12px;
      background: var(--vscode-sideBar-background);
      border: 1px solid var(--vscode-panel-border);
      border-radius: 6px;
      margin-bottom: 12px;
      flex-wrap: wrap;
    }
    .controls button {
      background: var(--vscode-button-secondaryBackground);
      color: var(--vscode-button-secondaryForeground);
      border: none;
      padding: 5px 10px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .controls button:hover {
      background: var(--vscode-button-secondaryHoverBackground);
    }
    .controls button.primary {
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
    }
    .controls .status {
      margin-left: auto;
      font-size: 11px;
      opacity: 0.8;
    }

    /* Scrubber */
    .scrubber-container {
      margin-bottom: 12px;
    }
    .scrubber {
      width: 100%;
      height: 6px;
      -webkit-appearance: none;
      appearance: none;
      background: var(--vscode-scrollbarSlider-background);
      border-radius: 3px;
      outline: none;
    }
    .scrubber::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: var(--vscode-button-background);
      cursor: pointer;
    }

    /* Filter tabs */
    .filters {
      display: flex;
      gap: 4px;
      margin-bottom: 10px;
      flex-wrap: wrap;
    }
    .filter-btn {
      font-size: 11px;
      padding: 3px 8px;
      border-radius: 10px;
      border: 1px solid var(--vscode-panel-border);
      background: transparent;
      color: var(--vscode-foreground);
      cursor: pointer;
    }
    .filter-btn.active {
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      border-color: var(--vscode-button-background);
    }

    /* Current event inspector */
    .inspector {
      background: var(--vscode-sideBar-background);
      border: 1px solid var(--vscode-panel-border);
      border-radius: 6px;
      padding: 10px 12px;
      margin-bottom: 12px;
    }
    .inspector h3 {
      font-size: 12px;
      opacity: 0.7;
      margin-bottom: 6px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .inspector .field {
      display: flex;
      gap: 8px;
      padding: 2px 0;
      font-size: 12px;
    }
    .inspector .field .label {
      opacity: 0.6;
      min-width: 80px;
    }

    /* Event list */
    .event-list {
      max-height: 400px;
      overflow-y: auto;
      border: 1px solid var(--vscode-panel-border);
      border-radius: 6px;
    }
    .event-row {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 5px 10px;
      border-bottom: 1px solid var(--vscode-panel-border);
      cursor: pointer;
      font-size: 12px;
      font-family: var(--vscode-editor-font-family, monospace);
    }
    .event-row:hover {
      background: var(--vscode-list-hoverBackground);
    }
    .event-row.current {
      background: var(--vscode-list-activeSelectionBackground);
      color: var(--vscode-list-activeSelectionForeground);
    }
    .badge {
      font-size: 10px;
      padding: 1px 6px;
      border-radius: 3px;
      font-weight: 600;
      min-width: 56px;
      text-align: center;
      color: #1e1e1e;
    }
    .seq {
      opacity: 0.5;
      min-width: 40px;
      font-size: 11px;
    }
    .empty-state {
      text-align: center;
      padding: 40px;
      opacity: 0.5;
    }
  </style>
</head>
<body>
  <!-- Controls -->
  <div class="controls">
    ${state.capturing
      ? '<button onclick="send(\'stopCapture\')">⏹ Stop Capture</button>'
      : '<button class="primary" onclick="send(\'startCapture\')">⏺ Start Capture</button>'
    }
    <button onclick="send('stepBackToCall')" title="Step back to previous Call">⏮ Call</button>
    <button onclick="send('prevPortal')" title="Previous Portal">⏪ Portal</button>
    <button onclick="send('stepBackward')" title="Step backward">◀ Back</button>
    <button onclick="send('stepForward')" title="Step forward">▶ Forward</button>
    <button onclick="send('nextPortal')" title="Next Portal">⏩ Portal</button>
    <button onclick="send('stepForwardToReturn')" title="Step forward to Return">⏭ Return</button>
    ${state.replaying ? '<button onclick="send(\'exitReplay\')">🔴 Live</button>' : ''}
    <span class="status">
      ${state.capturing ? '🔴 Capturing' : state.replaying ? '⏪ Replaying' : '⏸ Idle'}
      — ${state.currentIndex + 1} / ${state.totalEvents} events
    </span>
  </div>

  <!-- Scrubber -->
  ${state.totalEvents > 0 ? `
  <div class="scrubber-container">
    <input type="range" class="scrubber" min="0" max="${state.totalEvents - 1}" value="${Math.max(0, currentIdx)}"
           oninput="scrubTo(this.value)" />
  </div>
  ` : ''}

  <!-- Filter buttons -->
  <div class="filters">
    <button class="filter-btn active" onclick="filterKind('ALL')">All (${state.totalEvents})</button>
    <button class="filter-btn" onclick="filterKind('Portal')" style="border-color:#ce9178">Portals</button>
    <button class="filter-btn" onclick="filterKind('Call')" style="border-color:#4ec9b0">Calls</button>
    <button class="filter-btn" onclick="filterKind('Return')" style="border-color:#569cd6">Returns</button>
    <button class="filter-btn" onclick="filterKind('Await')" style="border-color:#dcdcaa">Await/Resume</button>
    <button class="filter-btn" onclick="filterKind('Signal')" style="border-color:#9cdcfe">Signals</button>
    <button class="filter-btn" onclick="filterKind('Exception')" style="border-color:#f44747">Exceptions</button>
  </div>

  <!-- Current event detail -->
  ${currentEvent ? `
  <div class="inspector">
    <h3>Current Event #${currentEvent.seq}</h3>
    <div class="field"><span class="label">Kind:</span><span>${currentEvent.kind}</span></div>
    ${currentEvent.functionName ? `<div class="field"><span class="label">Function:</span><span>${currentEvent.functionName}</span></div>` : ''}
    ${currentEvent.portalName ? `<div class="field"><span class="label">Portal:</span><span>${currentEvent.portalName}</span></div>` : ''}
    ${currentEvent.signalName ? `<div class="field"><span class="label">Signal:</span><span>${currentEvent.signalName} = ${currentEvent.signalValue || ''}</span></div>` : ''}
    ${currentEvent.returnValue ? `<div class="field"><span class="label">Return:</span><span>${currentEvent.returnValue}</span></div>` : ''}
    ${currentEvent.exceptionMessage ? `<div class="field"><span class="label">Exception:</span><span>${currentEvent.exceptionType}: ${currentEvent.exceptionMessage}</span></div>` : ''}
    ${currentEvent.source ? `<div class="field"><span class="label">Location:</span><span>${currentEvent.source}:${currentEvent.line || 0}</span></div>` : ''}
    ${currentEvent.variables ? `
      <h3 style="margin-top:8px">Variables</h3>
      ${Object.entries(currentEvent.variables).map(([k, v]) =>
        `<div class="field"><span class="label">${k}:</span><span>${v.value} <em>(${v.type})</em></span></div>`
      ).join('')}
    ` : ''}
  </div>
  ` : ''}

  <!-- Event list -->
  <div class="event-list" id="eventList">
    ${state.events.length === 0
      ? '<div class="empty-state">No trace events recorded yet. Click "Start Capture" or open a .loup-trace file.</div>'
      : ''
    }
  </div>

  <script>
    const vscode = acquireVsCodeApi();
    const events = ${eventsJson};
    const currentSeq = ${currentEvent?.seq ?? -1};
    const badgeColors = ${JSON.stringify(kindBadgeColors)};
    let activeFilter = 'ALL';

    function send(command, data = {}) {
      vscode.postMessage({ command, ...data });
    }

    function scrubTo(idx) {
      const ev = events[Number(idx)];
      if (ev) send('stepTo', { seq: ev.seq });
    }

    function filterKind(kind) {
      activeFilter = kind;
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      event.target.classList.add('active');
      renderList();
    }

    function renderList() {
      const container = document.getElementById('eventList');
      if (events.length === 0) return;

      const filtered = activeFilter === 'ALL'
        ? events
        : activeFilter === 'Await'
          ? events.filter(e => e.kind === 'Await' || e.kind === 'Resume')
          : events.filter(e => e.kind === activeFilter);

      container.innerHTML = filtered.map(ev => {
        const isCurrent = ev.seq === currentSeq;
        const detail = ev.portalName
          ? 'portal ' + ev.portalName
          : ev.signalName
            ? 'signal ' + ev.signalName + ' = ' + (ev.signalValue || '')
            : ev.functionName
              ? ev.functionName + (ev.returnValue ? ' → ' + ev.returnValue : '')
              : ev.exceptionMessage
                ? (ev.exceptionType || 'Error') + ': ' + ev.exceptionMessage
                : ev.source
                  ? ev.source.split('/').pop() + ':' + (ev.line || '')
                  : '';

        return '<div class="event-row ' + (isCurrent ? 'current' : '') + '" onclick="send(\'stepTo\', {seq:' + ev.seq + '})">'
          + '<span class="seq">#' + ev.seq + '</span>'
          + '<span class="badge" style="background:' + (badgeColors[ev.kind] || '#888') + '">' + ev.kind + '</span>'
          + '<span>' + detail + '</span>'
          + '</div>';
      }).join('');
    }

    renderList();
  </script>
</body>
</html>`;
  }
}
