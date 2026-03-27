// ============================================================================
// Timeline Webview — Interactive trace event timeline panel
// ============================================================================

import * as vscode from 'vscode';
import { CaptureSession, TraceEvent } from './timeTravelManager.js';

export class TimelinePanel {
  public static currentPanel: TimelinePanel | undefined;
  private readonly panel: vscode.WebviewPanel;
  private disposables: vscode.Disposable[] = [];

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this.panel = panel;
    this.panel.onDidDispose(() => this.dispose(), null, this.disposables);
    this.panel.webview.html = this.getHtml(extensionUri);

    this.panel.webview.onDidReceiveMessage(
      (message: { command: string; index?: number; portal?: string }) => {
        switch (message.command) {
          case 'selectEvent':
            if (message.index !== undefined) {
              vscode.commands.executeCommand('loom.navigateToEvent', message.index);
            }
            break;
          case 'filterPortal':
            if (message.portal !== undefined) {
              vscode.commands.executeCommand('loom.filterTimeline', message.portal);
            }
            break;
        }
      },
      null,
      this.disposables
    );
  }

  static createOrShow(extensionUri: vscode.Uri): TimelinePanel {
    const column = vscode.ViewColumn.Beside;

    if (TimelinePanel.currentPanel) {
      TimelinePanel.currentPanel.panel.reveal(column);
      return TimelinePanel.currentPanel;
    }

    const panel = vscode.window.createWebviewPanel(
      'loomTimeline',
      'Loom Timeline',
      column,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [extensionUri],
      }
    );

    TimelinePanel.currentPanel = new TimelinePanel(panel, extensionUri);
    return TimelinePanel.currentPanel;
  }

  updateSession(session: CaptureSession): void {
    this.panel.webview.postMessage({
      command: 'updateSession',
      session: {
        id: session.id,
        startTime: session.startTime,
        endTime: session.endTime,
        eventCount: session.events.length,
        portals: session.portals,
        events: session.events.slice(0, 10000), // Cap for performance
      },
    });
  }

  highlightEvent(index: number): void {
    this.panel.webview.postMessage({
      command: 'highlightEvent',
      index,
    });
  }

  dispose(): void {
    TimelinePanel.currentPanel = undefined;
    this.panel.dispose();
    while (this.disposables.length) {
      const d = this.disposables.pop();
      if (d) d.dispose();
    }
  }

  private getHtml(_extensionUri: vscode.Uri): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Loom Timeline</title>
  <style>
    :root {
      --bg: var(--vscode-editor-background);
      --fg: var(--vscode-editor-foreground);
      --border: var(--vscode-panel-border);
      --accent: var(--vscode-focusBorder);
      --portal-color: #7c4dff;
      --call-color: #00bcd4;
      --exception-color: #ff5252;
      --line-color: var(--vscode-editorLineNumber-foreground);
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: var(--vscode-font-family, 'Segoe UI', sans-serif);
      font-size: var(--vscode-font-size, 13px);
      color: var(--fg);
      background: var(--bg);
      overflow: hidden;
    }

    .header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 16px;
      border-bottom: 1px solid var(--border);
      background: var(--vscode-titleBar-activeBackground);
    }

    .header h2 {
      font-size: 14px;
      font-weight: 600;
      flex: 1;
    }

    .header .stats {
      font-size: 11px;
      opacity: 0.7;
    }

    .controls {
      display: flex;
      gap: 8px;
      padding: 8px 16px;
      border-bottom: 1px solid var(--border);
      flex-wrap: wrap;
    }

    .filter-btn {
      padding: 2px 10px;
      border: 1px solid var(--border);
      border-radius: 12px;
      background: transparent;
      color: var(--fg);
      font-size: 11px;
      cursor: pointer;
      transition: all 0.15s;
    }

    .filter-btn:hover, .filter-btn.active {
      background: var(--accent);
      border-color: var(--accent);
      color: var(--vscode-button-foreground, #fff);
    }

    .filter-btn.portal {
      border-color: var(--portal-color);
    }

    .filter-btn.portal.active {
      background: var(--portal-color);
    }

    .timeline-container {
      height: calc(100vh - 100px);
      overflow-y: auto;
      padding: 0;
    }

    .event-row {
      display: flex;
      align-items: center;
      padding: 2px 16px;
      border-bottom: 1px solid transparent;
      cursor: pointer;
      font-size: 12px;
      min-height: 24px;
      transition: background 0.1s;
    }

    .event-row:hover {
      background: var(--vscode-list-hoverBackground);
    }

    .event-row.selected {
      background: var(--vscode-list-activeSelectionBackground);
      color: var(--vscode-list-activeSelectionForeground);
    }

    .event-row .timestamp {
      width: 80px;
      flex-shrink: 0;
      color: var(--line-color);
      font-family: var(--vscode-editor-font-family, monospace);
      font-size: 11px;
    }

    .event-row .kind-badge {
      width: 24px;
      height: 16px;
      border-radius: 3px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 9px;
      font-weight: 700;
      margin-right: 8px;
      flex-shrink: 0;
      text-transform: uppercase;
    }

    .kind-line     { background: var(--line-color);       color: var(--bg); }
    .kind-call     { background: var(--call-color);       color: #000; }
    .kind-return   { background: var(--call-color);       color: #000; opacity: 0.7; }
    .kind-portal_enter  { background: var(--portal-color); color: #fff; }
    .kind-portal_exit   { background: var(--portal-color); color: #fff; opacity: 0.7; }
    .kind-exception     { background: var(--exception-color); color: #fff; }
    .kind-spawn    { background: #ff9800; color: #000; }
    .kind-await    { background: #ff9800; color: #000; opacity: 0.7; }

    .event-row .location {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-family: var(--vscode-editor-font-family, monospace);
    }

    .event-row .portal-tag {
      padding: 1px 6px;
      border-radius: 3px;
      font-size: 10px;
      background: var(--portal-color);
      color: #fff;
      margin-left: 8px;
      flex-shrink: 0;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 60vh;
      opacity: 0.5;
      text-align: center;
      gap: 12px;
    }

    .empty-state .icon { font-size: 48px; }
  </style>
</head>
<body>
  <div class="header">
    <h2 id="title">Loom Timeline</h2>
    <span class="stats" id="stats"></span>
  </div>
  <div class="controls" id="controls"></div>
  <div class="timeline-container" id="timeline">
    <div class="empty-state">
      <div class="icon">⏱</div>
      <div>No trace loaded.<br>Start a time-travel capture or open a .loom-trace file.</div>
    </div>
  </div>

  <script>
    const vscode = acquireVsCodeApi();
    let events = [];
    let selectedIndex = -1;
    let activePortalFilter = null;

    const kindLabels = {
      line: 'L', call: 'C', return: 'R',
      portal_enter: 'P→', portal_exit: 'P←',
      exception: 'E', spawn: 'S', await: 'A',
    };

    window.addEventListener('message', (event) => {
      const msg = event.data;
      switch (msg.command) {
        case 'updateSession':
          renderSession(msg.session);
          break;
        case 'highlightEvent':
          selectEvent(msg.index);
          break;
      }
    });

    function renderSession(session) {
      document.getElementById('title').textContent = 'Timeline: ' + session.id;
      document.getElementById('stats').textContent =
        session.eventCount + ' events · ' + session.portals.length + ' portals';

      // Portal filter buttons
      const controls = document.getElementById('controls');
      controls.innerHTML = '<button class="filter-btn active" onclick="filterAll()">All</button>';
      for (const p of session.portals) {
        controls.innerHTML +=
          '<button class="filter-btn portal" data-portal="' + p + '" onclick="filterPortal(\\'' + p + '\\')">' + p + '</button>';
      }

      events = session.events;
      renderEvents(events);
    }

    function renderEvents(evts) {
      const container = document.getElementById('timeline');
      if (evts.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="icon">📭</div><div>No matching events.</div></div>';
        return;
      }

      let html = '';
      const startTime = evts[0]?.timestamp || 0;
      for (let i = 0; i < evts.length; i++) {
        const e = evts[i];
        const relMs = ((e.timestamp - startTime) / 1000).toFixed(1);
        const label = kindLabels[e.kind] || '?';
        const basename = e.source ? e.source.split('/').pop() : '';
        const loc = basename + ':' + e.line + (e.functionName ? ' · ' + e.functionName : '');
        const portalTag = e.portal ? '<span class="portal-tag">' + e.portal + '</span>' : '';
        html += '<div class="event-row" data-index="' + i + '" onclick="clickEvent(' + i + ')">' +
          '<span class="timestamp">' + relMs + 'ms</span>' +
          '<span class="kind-badge kind-' + e.kind + '">' + label + '</span>' +
          '<span class="location">' + loc + '</span>' +
          portalTag +
          '</div>';
      }
      container.innerHTML = html;
    }

    function clickEvent(index) {
      selectEvent(index);
      vscode.postMessage({ command: 'selectEvent', index });
    }

    function selectEvent(index) {
      document.querySelectorAll('.event-row.selected').forEach(el => el.classList.remove('selected'));
      const row = document.querySelector('[data-index="' + index + '"]');
      if (row) {
        row.classList.add('selected');
        row.scrollIntoView({ block: 'nearest' });
      }
      selectedIndex = index;
    }

    function filterAll() {
      activePortalFilter = null;
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      document.querySelector('.filter-btn').classList.add('active');
      renderEvents(events);
    }

    function filterPortal(portal) {
      activePortalFilter = portal;
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      document.querySelector('[data-portal="' + portal + '"]')?.classList.add('active');
      renderEvents(events.filter(e => e.portal === portal));
      vscode.postMessage({ command: 'filterPortal', portal });
    }
  </script>
</body>
</html>`;
  }
}
