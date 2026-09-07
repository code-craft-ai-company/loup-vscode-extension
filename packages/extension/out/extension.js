"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/extension.ts
var extension_exports = {};
__export(extension_exports, {
  activate: () => activate,
  deactivate: () => deactivate
});
module.exports = __toCommonJS(extension_exports);
var vscode7 = __toESM(require("vscode"));
var path3 = __toESM(require("path"));
var import_node = require("vscode-languageclient/node");

// src/portalBreakpoints.ts
var vscode = __toESM(require("vscode"));
var PortalBreakpointsProvider = class {
  _onDidChangeTreeData = new vscode.EventEmitter();
  onDidChangeTreeData = this._onDidChangeTreeData.event;
  portals = [];
  refresh() {
    this._onDidChangeTreeData.fire(void 0);
  }
  getTreeItem(element) {
    const item = new vscode.TreeItem(element.name);
    item.description = element.enabled ? "\u25CF Active" : "\u25CB Inactive";
    item.tooltip = new vscode.MarkdownString(
      `**Portal:** \`${element.name}\`

**Status:** ${element.enabled ? "Active" : "Inactive"}

` + (element.source ? `**Source:** ${element.source}:${element.line}

` : "") + (element.hitCount !== void 0 ? `**Hits:** ${element.hitCount}` : "")
    );
    item.iconPath = new vscode.ThemeIcon(
      element.enabled ? "debug-breakpoint" : "debug-breakpoint-disabled",
      element.enabled ? new vscode.ThemeColor("debugIcon.breakpointForeground") : void 0
    );
    item.contextValue = element.enabled ? "portalActive" : "portalInactive";
    item.command = {
      command: "loup.togglePortalBreakpoint",
      title: "Toggle Portal Breakpoint",
      arguments: [element]
    };
    return item;
  }
  getChildren() {
    return this.portals;
  }
  // ---- Management ----
  addPortal(name, source, line) {
    const existing = this.portals.find((p) => p.name === name);
    if (!existing) {
      this.portals.push({ name, enabled: true, source, line, hitCount: 0 });
      this.refresh();
    }
  }
  removePortal(name) {
    this.portals = this.portals.filter((p) => p.name !== name);
    this.refresh();
  }
  togglePortal(name) {
    const portal = this.portals.find((p) => p.name === name);
    if (portal) {
      portal.enabled = !portal.enabled;
      this.refresh();
      return portal.enabled;
    }
    return false;
  }
  setHitCount(name, count) {
    const portal = this.portals.find((p) => p.name === name);
    if (portal) {
      portal.hitCount = count;
      this.refresh();
    }
  }
  getEnabled() {
    return this.portals.filter((p) => p.enabled).map((p) => p.name);
  }
  clear() {
    this.portals = [];
    this.refresh();
  }
  /** Populate from AST portal statements found by the language server */
  populateFromDocument(portals) {
    for (const p of portals) {
      if (!this.portals.find((existing) => existing.name === p.name)) {
        this.portals.push({
          name: p.name,
          enabled: false,
          source: p.source,
          line: p.line,
          hitCount: 0
        });
      }
    }
    this.refresh();
  }
};

// src/timeTravelManager.ts
var vscode2 = __toESM(require("vscode"));
var path = __toESM(require("path"));
var TimeTravelManager = class {
  sessions = /* @__PURE__ */ new Map();
  activeSession = null;
  _onSessionChanged = new vscode2.EventEmitter();
  onSessionChanged = this._onSessionChanged.event;
  // ---- Capture ----
  startCapture() {
    const session = {
      id: `capture-${Date.now()}`,
      startTime: Date.now(),
      events: [],
      portals: []
    };
    this.sessions.set(session.id, session);
    this.activeSession = session;
    this._onSessionChanged.fire(session);
    return session;
  }
  stopCapture() {
    if (this.activeSession) {
      this.activeSession.endTime = Date.now();
      const session = this.activeSession;
      this.activeSession = null;
      this._onSessionChanged.fire(null);
      return session;
    }
    return null;
  }
  addEvent(event) {
    if (this.activeSession) {
      this.activeSession.events.push(event);
      if (event.portal && !this.activeSession.portals.includes(event.portal)) {
        this.activeSession.portals.push(event.portal);
      }
    }
  }
  // ---- Trace file ----
  async loadTraceFile(filePath) {
    const uri = vscode2.Uri.file(filePath);
    const content = await vscode2.workspace.fs.readFile(uri);
    const text = new TextDecoder().decode(content);
    const data = JSON.parse(text);
    const session = {
      id: path.basename(filePath, ".loup-trace"),
      startTime: data.startTime || 0,
      endTime: data.endTime,
      events: data.events || [],
      portals: data.portals || [],
      filePath
    };
    this.sessions.set(session.id, session);
    return session;
  }
  async saveTraceFile(sessionId, filePath) {
    const session = this.sessions.get(sessionId);
    if (!session)
      throw new Error(`Session ${sessionId} not found`);
    const data = {
      version: 1,
      startTime: session.startTime,
      endTime: session.endTime,
      portals: session.portals,
      events: session.events
    };
    const uri = vscode2.Uri.file(filePath);
    const content = new TextEncoder().encode(JSON.stringify(data, null, 2));
    await vscode2.workspace.fs.writeFile(uri, content);
    session.filePath = filePath;
  }
  // ---- Query ----
  getSession(id) {
    return this.sessions.get(id);
  }
  getActiveSession() {
    return this.activeSession;
  }
  getAllSessions() {
    return Array.from(this.sessions.values());
  }
  getEventsForPortal(sessionId, portalName) {
    const session = this.sessions.get(sessionId);
    if (!session)
      return [];
    return session.events.filter((e) => e.portal === portalName);
  }
  getEventsInRange(sessionId, startTime, endTime) {
    const session = this.sessions.get(sessionId);
    if (!session)
      return [];
    return session.events.filter((e) => e.timestamp >= startTime && e.timestamp <= endTime);
  }
  getEventAtIndex(sessionId, index) {
    const session = this.sessions.get(sessionId);
    if (!session)
      return void 0;
    return session.events[index];
  }
};

// src/timelinePanel.ts
var vscode3 = __toESM(require("vscode"));
var TimelinePanel = class _TimelinePanel {
  static currentPanel;
  panel;
  disposables = [];
  constructor(panel, extensionUri) {
    this.panel = panel;
    this.panel.onDidDispose(() => this.dispose(), null, this.disposables);
    this.panel.webview.html = this.getHtml(extensionUri);
    this.panel.webview.onDidReceiveMessage(
      (message) => {
        switch (message.command) {
          case "selectEvent":
            if (message.index !== void 0) {
              vscode3.commands.executeCommand("loup.navigateToEvent", message.index);
            }
            break;
          case "filterPortal":
            if (message.portal !== void 0) {
              vscode3.commands.executeCommand("loup.filterTimeline", message.portal);
            }
            break;
        }
      },
      null,
      this.disposables
    );
  }
  static createOrShow(extensionUri) {
    const column = vscode3.ViewColumn.Beside;
    if (_TimelinePanel.currentPanel) {
      _TimelinePanel.currentPanel.panel.reveal(column);
      return _TimelinePanel.currentPanel;
    }
    const panel = vscode3.window.createWebviewPanel(
      "loupTimeline",
      "Loup Timeline",
      column,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [extensionUri]
      }
    );
    _TimelinePanel.currentPanel = new _TimelinePanel(panel, extensionUri);
    return _TimelinePanel.currentPanel;
  }
  updateSession(session) {
    this.panel.webview.postMessage({
      command: "updateSession",
      session: {
        id: session.id,
        startTime: session.startTime,
        endTime: session.endTime,
        eventCount: session.events.length,
        portals: session.portals,
        events: session.events.slice(0, 1e4)
        // Cap for performance
      }
    });
  }
  highlightEvent(index) {
    this.panel.webview.postMessage({
      command: "highlightEvent",
      index
    });
  }
  dispose() {
    _TimelinePanel.currentPanel = void 0;
    this.panel.dispose();
    while (this.disposables.length) {
      const d = this.disposables.pop();
      if (d)
        d.dispose();
    }
  }
  getHtml(_extensionUri) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Loup Timeline</title>
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
    <h2 id="title">Loup Timeline</h2>
    <span class="stats" id="stats"></span>
  </div>
  <div class="controls" id="controls"></div>
  <div class="timeline-container" id="timeline">
    <div class="empty-state">
      <div class="icon">\u23F1</div>
      <div>No trace loaded.<br>Start a time-travel capture or open a .loup-trace file.</div>
    </div>
  </div>

  <script>
    const vscode = acquireVsCodeApi();
    let events = [];
    let selectedIndex = -1;
    let activePortalFilter = null;

    const kindLabels = {
      line: 'L', call: 'C', return: 'R',
      portal_enter: 'P\u2192', portal_exit: 'P\u2190',
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
        session.eventCount + ' events \xB7 ' + session.portals.length + ' portals';

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
        container.innerHTML = '<div class="empty-state"><div class="icon">\u{1F4ED}</div><div>No matching events.</div></div>';
        return;
      }

      let html = '';
      const startTime = evts[0]?.timestamp || 0;
      for (let i = 0; i < evts.length; i++) {
        const e = evts[i];
        const relMs = ((e.timestamp - startTime) / 1000).toFixed(1);
        const label = kindLabels[e.kind] || '?';
        const basename = e.source ? e.source.split('/').pop() : '';
        const loc = basename + ':' + e.line + (e.functionName ? ' \xB7 ' + e.functionName : '');
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
};

// src/taskGroupPanel.ts
var vscode4 = __toESM(require("vscode"));
var TaskGroupPanel = class _TaskGroupPanel {
  static currentPanel;
  panel;
  disposables = [];
  rootTasks = [];
  constructor(panel) {
    this.panel = panel;
    this.panel.onDidDispose(() => this.dispose(), null, this.disposables);
    this.panel.webview.html = this.getHtml();
  }
  static createOrShow() {
    if (_TaskGroupPanel.currentPanel) {
      _TaskGroupPanel.currentPanel.panel.reveal(vscode4.ViewColumn.Beside);
      return _TaskGroupPanel.currentPanel;
    }
    const panel = vscode4.window.createWebviewPanel(
      "loupTaskGroup",
      "Loup Task Groups",
      vscode4.ViewColumn.Beside,
      { enableScripts: true, retainContextWhenHidden: true }
    );
    _TaskGroupPanel.currentPanel = new _TaskGroupPanel(panel);
    return _TaskGroupPanel.currentPanel;
  }
  updateTasks(tasks2) {
    this.rootTasks = tasks2;
    this.panel.webview.postMessage({ command: "updateTasks", tasks: tasks2 });
  }
  updateTask(task) {
    this.panel.webview.postMessage({ command: "updateTask", task });
  }
  dispose() {
    _TaskGroupPanel.currentPanel = void 0;
    this.panel.dispose();
    while (this.disposables.length) {
      const d = this.disposables.pop();
      if (d)
        d.dispose();
    }
  }
  getHtml() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Loup Task Groups</title>
  <style>
    :root {
      --bg: var(--vscode-editor-background);
      --fg: var(--vscode-editor-foreground);
      --border: var(--vscode-panel-border);
      --pending: var(--vscode-editorLineNumber-foreground);
      --running: #2196f3;
      --completed: #4caf50;
      --failed: #ff5252;
      --cancelled: #ff9800;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: var(--vscode-font-family, 'Segoe UI', sans-serif);
      font-size: 13px; color: var(--fg); background: var(--bg);
    }
    .header {
      padding: 10px 16px;
      border-bottom: 1px solid var(--border);
      font-weight: 600; font-size: 14px;
    }
    .task-tree { padding: 8px 0; }
    .task-node {
      display: flex; align-items: center; gap: 8px;
      padding: 4px 16px; min-height: 28px; cursor: default;
    }
    .task-node:hover { background: var(--vscode-list-hoverBackground); }
    .indent { display: inline-block; }
    .state-dot {
      width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0;
    }
    .state-pending   { background: var(--pending); }
    .state-running   { background: var(--running); animation: pulse 1s infinite; }
    .state-completed { background: var(--completed); }
    .state-failed    { background: var(--failed); }
    .state-cancelled { background: var(--cancelled); }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }
    .task-name { flex: 1; font-family: var(--vscode-editor-font-family, monospace); }
    .task-state {
      font-size: 11px; padding: 1px 6px; border-radius: 3px;
      text-transform: uppercase; font-weight: 600;
    }
    .task-state.running   { background: var(--running); color: #fff; }
    .task-state.completed { background: var(--completed); color: #fff; }
    .task-state.failed    { background: var(--failed); color: #fff; }
    .task-state.cancelled { background: var(--cancelled); color: #000; }
    .task-state.pending   { background: var(--pending); color: var(--bg); }
    .portal-badge {
      font-size: 10px; padding: 1px 6px; border-radius: 3px;
      background: #7c4dff; color: #fff;
    }
    .task-time { font-size: 11px; opacity: 0.6; }
    .error-msg {
      padding: 2px 16px 2px 52px; font-size: 11px;
      color: var(--failed); font-style: italic;
    }
    .empty {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; height: 50vh; opacity: 0.5; gap: 8px;
    }
    .empty .icon { font-size: 40px; }
    .legend {
      display: flex; gap: 12px; padding: 8px 16px;
      border-top: 1px solid var(--border); font-size: 11px;
    }
    .legend-item { display: flex; align-items: center; gap: 4px; }
  </style>
</head>
<body>
  <div class="header">Task Groups</div>
  <div class="task-tree" id="tree">
    <div class="empty">
      <div class="icon">\u26A1</div>
      <div>No active task groups.<br>Start debugging with structured concurrency to visualize tasks.</div>
    </div>
  </div>
  <div class="legend">
    <div class="legend-item"><span class="state-dot state-pending"></span> Pending</div>
    <div class="legend-item"><span class="state-dot state-running"></span> Running</div>
    <div class="legend-item"><span class="state-dot state-completed"></span> Completed</div>
    <div class="legend-item"><span class="state-dot state-failed"></span> Failed</div>
    <div class="legend-item"><span class="state-dot state-cancelled"></span> Cancelled</div>
  </div>
  <script>
    window.addEventListener('message', (event) => {
      const msg = event.data;
      if (msg.command === 'updateTasks') renderTree(msg.tasks);
      if (msg.command === 'updateTask') updateNode(msg.task);
    });

    function renderTree(tasks) {
      const tree = document.getElementById('tree');
      if (!tasks || tasks.length === 0) {
        tree.innerHTML = '<div class="empty"><div class="icon">\u26A1</div><div>No active task groups.</div></div>';
        return;
      }
      tree.innerHTML = tasks.map(t => renderNode(t, 0)).join('');
    }

    function renderNode(task, depth) {
      const indent = '<span class="indent" style="width:' + (depth * 20) + 'px"></span>';
      const portal = task.portalName ? '<span class="portal-badge">' + task.portalName + '</span>' : '';
      const duration = task.startTime && task.endTime
        ? '<span class="task-time">' + (task.endTime - task.startTime) + 'ms</span>' : '';
      const error = task.error
        ? '<div class="error-msg">' + task.error + '</div>' : '';
      const children = (task.children || []).map(c => renderNode(c, depth + 1)).join('');
      return '<div class="task-node">' + indent +
        '<span class="state-dot state-' + task.state + '"></span>' +
        '<span class="task-name">' + task.name + '</span>' +
        portal +
        '<span class="task-state ' + task.state + '">' + task.state + '</span>' +
        duration + '</div>' + error + children;
    }

    function updateNode(task) {
      // For simplicity, re-render entire tree on update
      // Could be optimized with targeted DOM updates
    }
  </script>
</body>
</html>`;
  }
};

// src/taskProvider.ts
var vscode5 = __toESM(require("vscode"));
var path2 = __toESM(require("path"));
var LoupTaskProvider = class _LoupTaskProvider {
  static type = "loup";
  async provideTasks() {
    const tasks2 = [];
    const pkgFiles = await vscode5.workspace.findFiles("**/loup.pkg", "**/node_modules/**");
    for (const pkgUri of pkgFiles) {
      const content = new TextDecoder().decode(await vscode5.workspace.fs.readFile(pkgUri));
      const dir = path2.dirname(pkgUri.fsPath);
      const name = this.extractPackageName(content) || path2.basename(dir);
      tasks2.push(this.createTask("run", `Run ${name}`, dir, ["run", "."]));
      tasks2.push(this.createTask("build", `Build ${name}`, dir, ["build"]));
      tasks2.push(this.createTask("test", `Test ${name}`, dir, ["test"]));
      const scripts = this.extractScripts(content);
      for (const [scriptName, scriptCmd] of scripts) {
        tasks2.push(this.createTask(
          `script:${scriptName}`,
          `${name}: ${scriptName}`,
          dir,
          ["run", "--script", scriptName]
        ));
      }
      const targets = this.extractTargets(content);
      for (const target of targets) {
        tasks2.push(this.createTask(
          `run:${target}`,
          `Run ${name} (${target})`,
          dir,
          ["run", ".", "--target", target]
        ));
        if (target === "browser") {
          tasks2.push(this.createTask(
            "build:browser",
            `Build ${name} (browser)`,
            dir,
            ["build", "--target", "browser"]
          ));
          tasks2.push(this.createTask(
            "serve",
            `Serve ${name} (dev server)`,
            dir,
            ["serve"]
          ));
        }
      }
    }
    return tasks2;
  }
  resolveTask(task) {
    const definition = task.definition;
    if (definition.type === _LoupTaskProvider.type && definition.command) {
      return this.createTask(
        definition.command,
        task.name,
        definition.cwd || ".",
        definition.args || [definition.command]
      );
    }
    return void 0;
  }
  createTask(command, label, cwd, args) {
    const definition = {
      type: _LoupTaskProvider.type,
      command,
      cwd,
      args
    };
    const execution = new vscode5.ShellExecution("loup", args, { cwd });
    const task = new vscode5.Task(
      definition,
      vscode5.TaskScope.Workspace,
      label,
      "Loup",
      execution,
      "$loup"
      // problem matcher
    );
    task.group = command === "test" ? vscode5.TaskGroup.Test : command === "build" ? vscode5.TaskGroup.Build : void 0;
    task.presentationOptions = {
      reveal: vscode5.TaskRevealKind.Always,
      panel: vscode5.TaskPanelKind.Shared
    };
    return task;
  }
  extractPackageName(content) {
    const match = content.match(/^name\s*=\s*"([^"]+)"/m);
    return match ? match[1] : null;
  }
  extractScripts(content) {
    const scripts = [];
    const scriptSection = content.match(/\[scripts\]([\s\S]*?)(?=\[|$)/);
    if (scriptSection) {
      const lines = scriptSection[1].split("\n");
      for (const line of lines) {
        const match = line.match(/^\s*(\w+)\s*=\s*"([^"]+)"/);
        if (match) {
          scripts.push([match[1], match[2]]);
        }
      }
    }
    return scripts;
  }
  extractTargets(content) {
    const targets = [];
    const matches = content.matchAll(/\[target\.(\w+)\]/g);
    for (const match of matches) {
      targets.push(match[1]);
    }
    return targets;
  }
};

// src/dependencyTree.ts
var vscode6 = __toESM(require("vscode"));
var DependencyTreeProvider = class {
  _onDidChangeTreeData = new vscode6.EventEmitter();
  onDidChangeTreeData = this._onDidChangeTreeData.event;
  dependencies = [];
  refresh() {
    this.loadDependencies();
    this._onDidChangeTreeData.fire(void 0);
  }
  getTreeItem(element) {
    const hasChildren = element.children && element.children.length > 0;
    const item = new vscode6.TreeItem(
      element.name,
      hasChildren ? vscode6.TreeItemCollapsibleState.Collapsed : vscode6.TreeItemCollapsibleState.None
    );
    item.description = element.version;
    item.tooltip = `${element.name}@${element.version} (${element.kind})`;
    switch (element.kind) {
      case "dependency":
        item.iconPath = new vscode6.ThemeIcon("package");
        item.contextValue = "dependency";
        break;
      case "devDependency":
        item.iconPath = new vscode6.ThemeIcon("beaker");
        item.contextValue = "devDependency";
        break;
      case "target":
        item.iconPath = new vscode6.ThemeIcon("device-desktop");
        item.contextValue = "target";
        break;
    }
    return item;
  }
  getChildren(element) {
    if (element) {
      return element.children || [];
    }
    return this.dependencies;
  }
  async loadDependencies() {
    this.dependencies = [];
    const pkgFiles = await vscode6.workspace.findFiles("**/loup.pkg", "**/node_modules/**", 1);
    if (pkgFiles.length === 0)
      return;
    const content = new TextDecoder().decode(
      await vscode6.workspace.fs.readFile(pkgFiles[0])
    );
    this.parseDependencies(content);
  }
  parseDependencies(content) {
    const sections = this.parseSections(content);
    if (sections["dependencies"]) {
      const deps = this.parseKeyValuePairs(sections["dependencies"]);
      for (const [name, version] of deps) {
        this.dependencies.push({ name, version, kind: "dependency" });
      }
    }
    if (sections["dev-dependencies"]) {
      const devDeps = this.parseKeyValuePairs(sections["dev-dependencies"]);
      for (const [name, version] of devDeps) {
        this.dependencies.push({ name, version, kind: "devDependency" });
      }
    }
    for (const [key, value] of Object.entries(sections)) {
      if (key.startsWith("target.")) {
        const targetName = key.slice(7);
        const pairs = this.parseKeyValuePairs(value);
        const targetItem = {
          name: targetName,
          version: "",
          kind: "target",
          children: pairs.map(([k, v]) => ({
            name: k,
            version: v,
            kind: "dependency"
          }))
        };
        this.dependencies.push(targetItem);
      }
    }
  }
  parseSections(content) {
    const sections = {};
    const sectionRegex = /^\[([^\]]+)\]\s*$/gm;
    let lastKey = null;
    let lastEnd = 0;
    let match;
    while ((match = sectionRegex.exec(content)) !== null) {
      if (lastKey !== null) {
        sections[lastKey] = content.slice(lastEnd, match.index).trim();
      }
      lastKey = match[1];
      lastEnd = match.index + match[0].length;
    }
    if (lastKey !== null) {
      sections[lastKey] = content.slice(lastEnd).trim();
    }
    return sections;
  }
  parseKeyValuePairs(text) {
    const pairs = [];
    const lines = text.split("\n");
    for (const line of lines) {
      const match = line.match(/^\s*(\S+)\s*=\s*"([^"]+)"/);
      if (match) {
        pairs.push([match[1], match[2]]);
      }
    }
    return pairs;
  }
};

// src/extension.ts
var client;
function activate(context) {
  console.log("Loup Language extension is now active.");
  const statusBarItem = vscode7.window.createStatusBarItem(
    vscode7.StatusBarAlignment.Right,
    100
  );
  statusBarItem.text = "$(symbol-event) Loup";
  statusBarItem.tooltip = "Loup Language v0.4";
  context.subscriptions.push(statusBarItem);
  const updateStatusBar = () => {
    const editor = vscode7.window.activeTextEditor;
    if (editor && (editor.document.languageId === "loup" || editor.document.languageId === "loup-pkg")) {
      statusBarItem.show();
    } else {
      statusBarItem.hide();
    }
  };
  context.subscriptions.push(
    vscode7.window.onDidChangeActiveTextEditor(updateStatusBar)
  );
  updateStatusBar();
  const serverModule = context.asAbsolutePath(
    path3.join("..", "language-server", "out", "server.js")
  );
  const serverOptions = {
    run: { module: serverModule, transport: import_node.TransportKind.ipc },
    debug: {
      module: serverModule,
      transport: import_node.TransportKind.ipc,
      options: { execArgv: ["--nolazy", "--inspect=6009"] }
    }
  };
  const clientOptions = {
    documentSelector: [
      { scheme: "file", language: "loup" },
      { scheme: "file", language: "loup-pkg" }
    ],
    synchronize: {
      fileEvents: vscode7.workspace.createFileSystemWatcher("**/*.loup")
    }
  };
  client = new import_node.LanguageClient(
    "loupLanguageServer",
    "Loup Language Server",
    serverOptions,
    clientOptions
  );
  client.start();
  context.subscriptions.push({
    dispose: () => {
      if (client) {
        client.stop();
      }
    }
  });
  const debugAdapterPath = context.asAbsolutePath(
    path3.join("..", "debug-adapter", "out", "debugAdapter.js")
  );
  const factory = new DebugAdapterExecutableFactory(debugAdapterPath);
  context.subscriptions.push(
    vscode7.debug.registerDebugAdapterDescriptorFactory("loup", factory)
  );
  const portalProvider = new PortalBreakpointsProvider();
  context.subscriptions.push(
    vscode7.window.registerTreeDataProvider("loupPortalBreakpoints", portalProvider)
  );
  context.subscriptions.push(
    vscode7.commands.registerCommand("loup.togglePortalBreakpoint", (item) => {
      const nowEnabled = portalProvider.togglePortal(item.name);
      vscode7.window.showInformationMessage(
        `Portal "${item.name}" ${nowEnabled ? "activated" : "deactivated"}`
      );
    }),
    vscode7.commands.registerCommand("loup.addPortalBreakpoint", async () => {
      const name = await vscode7.window.showInputBox({
        prompt: "Enter portal name",
        placeHolder: "e.g. request_start"
      });
      if (name) {
        portalProvider.addPortal(name);
        vscode7.window.showInformationMessage(`Portal breakpoint "${name}" added`);
      }
    }),
    vscode7.commands.registerCommand("loup.removePortalBreakpoint", (item) => {
      portalProvider.removePortal(item.name);
    }),
    vscode7.commands.registerCommand("loup.clearPortalBreakpoints", () => {
      portalProvider.clear();
    })
  );
  const timeTravel = new TimeTravelManager();
  context.subscriptions.push(
    vscode7.commands.registerCommand("loup.startCapture", () => {
      const session = timeTravel.startCapture();
      vscode7.window.showInformationMessage(`Time-travel capture started (${session.id})`);
      statusBarItem.text = "$(record) Loup (Recording)";
      statusBarItem.backgroundColor = new vscode7.ThemeColor("statusBarItem.warningBackground");
    }),
    vscode7.commands.registerCommand("loup.stopCapture", () => {
      const session = timeTravel.stopCapture();
      if (session) {
        vscode7.window.showInformationMessage(
          `Capture stopped: ${session.events.length} events recorded`
        );
        statusBarItem.text = "$(symbol-event) Loup";
        statusBarItem.backgroundColor = void 0;
        const panel = TimelinePanel.createOrShow(context.extensionUri);
        panel.updateSession(session);
      }
    }),
    vscode7.commands.registerCommand("loup.showTimeline", () => {
      const session = timeTravel.getActiveSession() || timeTravel.getAllSessions()[0];
      if (session) {
        const panel = TimelinePanel.createOrShow(context.extensionUri);
        panel.updateSession(session);
      } else {
        vscode7.window.showInformationMessage(
          "No trace session available. Start a capture or open a .loup-trace file."
        );
      }
    }),
    vscode7.commands.registerCommand("loup.openTraceFile", async () => {
      const files = await vscode7.window.showOpenDialog({
        canSelectFiles: true,
        canSelectFolders: false,
        filters: { "Loup Trace": ["loup-trace", "json"] }
      });
      if (files && files[0]) {
        const session = await timeTravel.loadTraceFile(files[0].fsPath);
        const panel = TimelinePanel.createOrShow(context.extensionUri);
        panel.updateSession(session);
        vscode7.window.showInformationMessage(
          `Loaded ${session.events.length} events from trace`
        );
      }
    }),
    vscode7.commands.registerCommand("loup.saveTrace", async () => {
      const sessions = timeTravel.getAllSessions();
      if (sessions.length === 0) {
        vscode7.window.showWarningMessage("No capture session to save.");
        return;
      }
      const session = sessions[sessions.length - 1];
      const uri = await vscode7.window.showSaveDialog({
        defaultUri: vscode7.Uri.file(`${session.id}.loup-trace`),
        filters: { "Loup Trace": ["loup-trace"] }
      });
      if (uri) {
        await timeTravel.saveTraceFile(session.id, uri.fsPath);
        vscode7.window.showInformationMessage(`Trace saved to ${uri.fsPath}`);
      }
    }),
    vscode7.commands.registerCommand("loup.navigateToEvent", (index) => {
      const sessions = timeTravel.getAllSessions();
      const session = sessions[sessions.length - 1];
      if (!session)
        return;
      const event = timeTravel.getEventAtIndex(session.id, index);
      if (event && event.source) {
        const uri = vscode7.Uri.file(event.source);
        vscode7.window.showTextDocument(uri, {
          selection: new vscode7.Range(
            event.line - 1,
            (event.column || 1) - 1,
            event.line - 1,
            (event.column || 1) - 1
          )
        });
      }
    }),
    vscode7.commands.registerCommand("loup.showTaskGroups", () => {
      TaskGroupPanel.createOrShow();
    })
  );
  const taskProvider = new LoupTaskProvider();
  context.subscriptions.push(
    vscode7.tasks.registerTaskProvider(LoupTaskProvider.type, taskProvider)
  );
  const depTree = new DependencyTreeProvider();
  context.subscriptions.push(
    vscode7.window.registerTreeDataProvider("loupDependencies", depTree)
  );
  context.subscriptions.push(
    vscode7.commands.registerCommand("loup.refreshDependencies", () => depTree.refresh())
  );
  context.subscriptions.push(
    vscode7.commands.registerCommand("loup.openRepl", () => {
      const terminal = vscode7.window.createTerminal({
        name: "Loup REPL",
        shellPath: "loup",
        shellArgs: ["repl"],
        iconPath: new vscode7.ThemeIcon("terminal")
      });
      terminal.show();
    })
  );
}
var DebugAdapterExecutableFactory = class {
  constructor(adapterPath) {
    this.adapterPath = adapterPath;
  }
  createDebugAdapterDescriptor(_session, _executable) {
    return new vscode7.DebugAdapterExecutable("node", [this.adapterPath]);
  }
};
function deactivate() {
  if (!client) {
    return void 0;
  }
  return client.stop();
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate,
  deactivate
});
