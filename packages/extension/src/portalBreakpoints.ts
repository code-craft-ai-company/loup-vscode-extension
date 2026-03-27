// ============================================================================
// Portal Breakpoints Provider — Tree view for managing Loom portal breakpoints
// ============================================================================

import * as vscode from 'vscode';

export interface PortalBreakpointItem {
  name: string;
  enabled: boolean;
  source?: string;
  line?: number;
  hitCount?: number;
}

export class PortalBreakpointsProvider implements vscode.TreeDataProvider<PortalBreakpointItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<PortalBreakpointItem | undefined>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private portals: PortalBreakpointItem[] = [];

  refresh(): void {
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(element: PortalBreakpointItem): vscode.TreeItem {
    const item = new vscode.TreeItem(element.name);
    item.description = element.enabled ? '● Active' : '○ Inactive';
    item.tooltip = new vscode.MarkdownString(
      `**Portal:** \`${element.name}\`\n\n` +
      `**Status:** ${element.enabled ? 'Active' : 'Inactive'}\n\n` +
      (element.source ? `**Source:** ${element.source}:${element.line}\n\n` : '') +
      (element.hitCount !== undefined ? `**Hits:** ${element.hitCount}` : '')
    );
    item.iconPath = new vscode.ThemeIcon(
      element.enabled ? 'debug-breakpoint' : 'debug-breakpoint-disabled',
      element.enabled
        ? new vscode.ThemeColor('debugIcon.breakpointForeground')
        : undefined
    );
    item.contextValue = element.enabled ? 'portalActive' : 'portalInactive';
    item.command = {
      command: 'loom.togglePortalBreakpoint',
      title: 'Toggle Portal Breakpoint',
      arguments: [element],
    };
    return item;
  }

  getChildren(): PortalBreakpointItem[] {
    return this.portals;
  }

  // ---- Management ----

  addPortal(name: string, source?: string, line?: number): void {
    const existing = this.portals.find(p => p.name === name);
    if (!existing) {
      this.portals.push({ name, enabled: true, source, line, hitCount: 0 });
      this.refresh();
    }
  }

  removePortal(name: string): void {
    this.portals = this.portals.filter(p => p.name !== name);
    this.refresh();
  }

  togglePortal(name: string): boolean {
    const portal = this.portals.find(p => p.name === name);
    if (portal) {
      portal.enabled = !portal.enabled;
      this.refresh();
      return portal.enabled;
    }
    return false;
  }

  setHitCount(name: string, count: number): void {
    const portal = this.portals.find(p => p.name === name);
    if (portal) {
      portal.hitCount = count;
      this.refresh();
    }
  }

  getEnabled(): string[] {
    return this.portals.filter(p => p.enabled).map(p => p.name);
  }

  clear(): void {
    this.portals = [];
    this.refresh();
  }

  /** Populate from AST portal statements found by the language server */
  populateFromDocument(portals: { name: string; source: string; line: number }[]): void {
    for (const p of portals) {
      if (!this.portals.find(existing => existing.name === p.name)) {
        this.portals.push({
          name: p.name,
          enabled: false,
          source: p.source,
          line: p.line,
          hitCount: 0,
        });
      }
    }
    this.refresh();
  }
}
