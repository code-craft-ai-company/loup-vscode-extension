// ============================================================================
// Task Group Visualizer — Webview for structured concurrency visualization
// ============================================================================

import * as vscode from 'vscode';

export interface TaskNode {
  id: string;
  name: string;
  state: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  parentId?: string;
  portalName?: string;
  startTime?: number;
  endTime?: number;
  error?: string;
  children: TaskNode[];
}

export class TaskGroupPanel {
  public static currentPanel: TaskGroupPanel | undefined;
  private readonly panel: vscode.WebviewPanel;
  private disposables: vscode.Disposable[] = [];
  private rootTasks: TaskNode[] = [];

  private constructor(panel: vscode.WebviewPanel) {
    this.panel = panel;
    this.panel.onDidDispose(() => this.dispose(), null, this.disposables);
    this.panel.webview.html = this.getHtml();
  }

  static createOrShow(): TaskGroupPanel {
    if (TaskGroupPanel.currentPanel) {
      TaskGroupPanel.currentPanel.panel.reveal(vscode.ViewColumn.Beside);
      return TaskGroupPanel.currentPanel;
    }
    const panel = vscode.window.createWebviewPanel(
      'loupTaskGroup',
      'Loup Task Groups',
      vscode.ViewColumn.Beside,
      { enableScripts: true, retainContextWhenHidden: true }
    );
    TaskGroupPanel.currentPanel = new TaskGroupPanel(panel);
    return TaskGroupPanel.currentPanel;
  }

  updateTasks(tasks: TaskNode[]): void {
    this.rootTasks = tasks;
    this.panel.webview.postMessage({ command: 'updateTasks', tasks });
  }

  updateTask(task: TaskNode): void {
    this.panel.webview.postMessage({ command: 'updateTask', task });
  }

  dispose(): void {
    TaskGroupPanel.currentPanel = undefined;
    this.panel.dispose();
    while (this.disposables.length) {
      const d = this.disposables.pop();
      if (d) d.dispose();
    }
  }

  private getHtml(): string {
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
      <div class="icon">⚡</div>
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
        tree.innerHTML = '<div class="empty"><div class="icon">⚡</div><div>No active task groups.</div></div>';
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
}
