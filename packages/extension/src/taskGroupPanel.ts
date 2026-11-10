// ============================================================================
// Task Group Visualizer — Webview showing structured concurrency task state
// ============================================================================

import * as vscode from 'vscode';

export interface TaskNode {
  id: string;
  name: string;
  state: 'running' | 'suspended' | 'completed' | 'failed' | 'cancelled';
  parentGroupId?: string;
  children: TaskNode[];
  startTime: number;
  endTime?: number;
  result?: string;
  error?: string;
}

export class TaskGroupPanel {
  public static readonly viewType = 'loup.taskGroups';
  private panel: vscode.WebviewPanel | undefined;
  private tasks: TaskNode[] = [];

  constructor(private context: vscode.ExtensionContext) {}

  updateTasks(tasks: TaskNode[]): void {
    this.tasks = tasks;
    this.updateWebview();
  }

  show(): void {
    if (this.panel) {
      this.panel.reveal(vscode.ViewColumn.Beside);
      return;
    }

    this.panel = vscode.window.createWebviewPanel(
      TaskGroupPanel.viewType,
      'Loup Task Groups',
      vscode.ViewColumn.Beside,
      { enableScripts: true }
    );

    this.updateWebview();

    this.panel.onDidDispose(() => {
      this.panel = undefined;
    });
  }

  private updateWebview(): void {
    if (!this.panel) return;
    this.panel.webview.html = this.getHtml();
  }

  private renderTaskTree(nodes: TaskNode[], depth = 0): string {
    if (nodes.length === 0) {
      return '<div class="empty">No active task groups. Start debugging an async Loup program using <code>await group</code> to see task trees here.</div>';
    }

    const stateIcons: Record<string, string> = {
      running: '🟢',
      suspended: '🟡',
      completed: '✅',
      failed: '❌',
      cancelled: '🚫',
    };

    const stateColors: Record<string, string> = {
      running: '#4ade80',
      suspended: '#facc15',
      completed: '#60a5fa',
      failed: '#f87171',
      cancelled: '#9ca3af',
    };

    return nodes.map(node => {
      const icon = stateIcons[node.state] || '⚪';
      const color = stateColors[node.state] || '#fff';
      const duration = node.endTime
        ? `${node.endTime - node.startTime}ms`
        : 'running...';
      const childrenHtml = node.children.length > 0
        ? `<div class="children">${this.renderTaskTree(node.children, depth + 1)}</div>`
        : '';

      return `
        <div class="task-node" style="margin-left: ${depth * 20}px">
          <div class="task-header">
            <span class="icon">${icon}</span>
            <span class="name">${node.name}</span>
            <span class="badge" style="color: ${color}; border-color: ${color}">${node.state}</span>
            <span class="duration">${duration}</span>
          </div>
          ${node.result ? `<div class="detail">Result: ${node.result}</div>` : ''}
          ${node.error ? `<div class="detail error">Error: ${node.error}</div>` : ''}
          ${childrenHtml}
        </div>
      `;
    }).join('');
  }

  private getHtml(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Loup Task Groups</title>
  <style>
    body {
      font-family: var(--vscode-font-family, sans-serif);
      font-size: var(--vscode-font-size, 13px);
      color: var(--vscode-foreground);
      background: var(--vscode-editor-background);
      margin: 0;
      padding: 12px;
    }
    h2 {
      font-size: 14px;
      margin: 0 0 12px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .task-node {
      border-left: 2px solid var(--vscode-panel-border);
      padding: 6px 0 6px 12px;
      margin: 4px 0;
    }
    .task-header {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .name {
      font-weight: 600;
      font-family: var(--vscode-editor-font-family, monospace);
    }
    .badge {
      font-size: 10px;
      padding: 1px 6px;
      border: 1px solid;
      border-radius: 8px;
      text-transform: uppercase;
      font-weight: 600;
    }
    .duration {
      font-size: 11px;
      opacity: 0.6;
      margin-left: auto;
    }
    .detail {
      font-size: 11px;
      opacity: 0.8;
      margin-top: 2px;
      padding-left: 24px;
      font-family: var(--vscode-editor-font-family, monospace);
    }
    .detail.error {
      color: #f87171;
    }
    .empty {
      text-align: center;
      padding: 40px 16px;
      opacity: 0.5;
    }
    code {
      background: var(--vscode-badge-background);
      padding: 1px 4px;
      border-radius: 3px;
    }
  </style>
</head>
<body>
  <h2>⚡ Structured Concurrency — Task Groups</h2>
  ${this.renderTaskTree(this.tasks)}
</body>
</html>`;
  }
}
