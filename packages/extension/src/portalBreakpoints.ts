// ============================================================================
// Portal Breakpoints Manager — Custom breakpoint type for Loup portals
// ============================================================================

import * as vscode from 'vscode';

export interface PortalBreakpoint {
  name: string;
  condition?: string;
  once: boolean;
  enabled: boolean;
}

export class PortalBreakpointManager {
  private portals = new Map<string, PortalBreakpoint>();
  private _onDidChange = new vscode.EventEmitter<void>();
  readonly onDidChange = this._onDidChange.event;

  constructor(private context: vscode.ExtensionContext) {
    // Restore saved portal breakpoints
    const saved = context.workspaceState.get<PortalBreakpoint[]>('loup.portalBreakpoints', []);
    for (const bp of saved) {
      this.portals.set(bp.name, bp);
    }
  }

  getAll(): PortalBreakpoint[] {
    return Array.from(this.portals.values());
  }

  getEnabled(): PortalBreakpoint[] {
    return this.getAll().filter(p => p.enabled);
  }

  add(name: string, condition?: string, once = false): void {
    this.portals.set(name, { name, condition, once, enabled: true });
    this.save();
    this._onDidChange.fire();
  }

  remove(name: string): void {
    this.portals.delete(name);
    this.save();
    this._onDidChange.fire();
  }

  toggle(name: string): void {
    const existing = this.portals.get(name);
    if (existing) {
      existing.enabled = !existing.enabled;
    } else {
      this.portals.set(name, { name, once: false, enabled: true });
    }
    this.save();
    this._onDidChange.fire();
  }

  setCondition(name: string, condition: string | undefined): void {
    const bp = this.portals.get(name);
    if (bp) {
      bp.condition = condition;
      this.save();
      this._onDidChange.fire();
    }
  }

  clear(): void {
    this.portals.clear();
    this.save();
    this._onDidChange.fire();
  }

  private save(): void {
    this.context.workspaceState.update('loup.portalBreakpoints', this.getAll());
  }
}

// ---- Tree View Provider for Portal Breakpoints sidebar ----

export class PortalBreakpointsTreeProvider implements vscode.TreeDataProvider<PortalBreakpointItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<PortalBreakpointItem | undefined>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  constructor(private manager: PortalBreakpointManager) {
    manager.onDidChange(() => this._onDidChangeTreeData.fire(undefined));
  }

  getTreeItem(element: PortalBreakpointItem): vscode.TreeItem {
    return element;
  }

  getChildren(): PortalBreakpointItem[] {
    return this.manager.getAll().map(bp => new PortalBreakpointItem(bp));
  }
}

export class PortalBreakpointItem extends vscode.TreeItem {
  constructor(public readonly portal: PortalBreakpoint) {
    super(portal.name, vscode.TreeItemCollapsibleState.None);

    this.description = [
      portal.enabled ? '●' : '○',
      portal.condition ? `when: ${portal.condition}` : '',
      portal.once ? '(once)' : '',
    ].filter(Boolean).join(' ');

    this.tooltip = `Portal: ${portal.name}\nEnabled: ${portal.enabled}${
      portal.condition ? `\nCondition: ${portal.condition}` : ''
    }${portal.once ? '\nTriggers once' : ''}`;

    this.contextValue = 'portalBreakpoint';

    this.iconPath = new vscode.ThemeIcon(
      portal.enabled ? 'debug-breakpoint' : 'debug-breakpoint-disabled'
    );

    this.command = {
      command: 'loup.portal.toggle',
      title: 'Toggle Portal Breakpoint',
      arguments: [portal.name],
    };
  }
}

// ---- CodeLens Provider for `portal` declarations in .loup files ----

export class PortalCodeLensProvider implements vscode.CodeLensProvider {
  private _onDidChangeCodeLenses = new vscode.EventEmitter<void>();
  readonly onDidChangeCodeLenses = this._onDidChangeCodeLenses.event;

  constructor(private manager: PortalBreakpointManager) {
    manager.onDidChange(() => this._onDidChangeCodeLenses.fire());
  }

  provideCodeLenses(document: vscode.TextDocument): vscode.CodeLens[] {
    if (document.languageId !== 'loup') return [];

    const lenses: vscode.CodeLens[] = [];
    const text = document.getText();
    const portalRegex = /\bportal\s+(?:([a-zA-Z_][a-zA-Z0-9_]*)|"([^"]+)"|'([^']+)')\s*\{/g;

    let match: RegExpExecArray | null;
    while ((match = portalRegex.exec(text)) !== null) {
      const portalName = match[1] || match[2] || match[3];
      const pos = document.positionAt(match.index);
      const range = new vscode.Range(pos, pos);

      const active = this.manager.getAll().find(p => p.name === portalName && p.enabled);

      lenses.push(
        new vscode.CodeLens(range, {
          title: active ? `🔴 Breakpoint Active (${portalName})` : `⚪ Activate Portal (${portalName})`,
          command: 'loup.portal.toggle',
          arguments: [portalName],
          tooltip: active
            ? `Click to deactivate portal breakpoint "${portalName}"`
            : `Click to break when portal "${portalName}" is entered`,
        })
      );
    }

    return lenses;
  }
}
