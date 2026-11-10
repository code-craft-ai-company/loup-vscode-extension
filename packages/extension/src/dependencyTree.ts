// ============================================================================
// Package Dependency Tree View — Parse .lppkg / loup.pkg and display deps
// ============================================================================

import * as vscode from 'vscode';

import { ParsedManifest, parseManifest } from './loupManifest';

export class DependencyTreeProvider implements vscode.TreeDataProvider<DepTreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<DepTreeItem | undefined>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;
  private manifest: ParsedManifest | null = null;

  private loads = 0;

  constructor() {
    void this.refresh();
  }

  /** Read the workspace's manifest again and redraw. */
  async refresh(): Promise<void> {
    const load = ++this.loads;
    let manifest: ParsedManifest | null = null;
    try {
      // The root manifest first; findFiles gives no order, so pick the shallowest.
      const found = await vscode.workspace.findFiles('**/{*.lppkg,loup.pkg}', '**/node_modules/**', 50);
      const depth = (u: vscode.Uri) => u.path.split('/').length;
      const first = found.sort((x, y) => depth(x) - depth(y) || x.path.localeCompare(y.path))[0];
      if (first) {
        const bytes = await vscode.workspace.fs.readFile(first);
        manifest = parseManifest(Buffer.from(bytes).toString('utf-8'));
      }
    } catch {
      manifest = null;
    }
    if (load !== this.loads) return; // a later refresh has taken over
    this.manifest = manifest;
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(element: DepTreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: DepTreeItem): DepTreeItem[] {
    if (!this.manifest) {
      return [new DepTreeItem('No package.lppkg found', '', vscode.TreeItemCollapsibleState.None)];
    }

    if (!element) {
      const items: DepTreeItem[] = [];

      // Package header
      const modeSuffix = this.manifest.mode ? ` [${this.manifest.mode}]` : '';
      const loupConstraint = this.manifest.loupVersion ? ` (loup ${this.manifest.loupVersion})` : '';
      items.push(
        new DepTreeItem(
          `${this.manifest.packageName} v${this.manifest.version}${modeSuffix}`,
          `Package${loupConstraint}`,
          vscode.TreeItemCollapsibleState.None,
          new vscode.ThemeIcon('package')
        )
      );

      if (this.manifest.deps.length > 0) {
        items.push(
          new DepTreeItem(
            'Dependencies',
            `${this.manifest.deps.length}`,
            vscode.TreeItemCollapsibleState.Expanded,
            new vscode.ThemeIcon('library'),
            'deps'
          )
        );
      }

      if (this.manifest.devDeps.length > 0) {
        items.push(
          new DepTreeItem(
            'Dev Dependencies',
            `${this.manifest.devDeps.length}`,
            vscode.TreeItemCollapsibleState.Collapsed,
            new vscode.ThemeIcon('tools'),
            'dev-deps'
          )
        );
      }

      if (this.manifest.devOverrides.length > 0) {
        items.push(
          new DepTreeItem(
            'Dev Overrides',
            `${this.manifest.devOverrides.length}`,
            vscode.TreeItemCollapsibleState.Collapsed,
            new vscode.ThemeIcon('debug-step-over'),
            'dev-overrides'
          )
        );
      }

      if (this.manifest.targets.length > 0) {
        items.push(
          new DepTreeItem(
            'Delivery Targets',
            `${this.manifest.targets.length}`,
            vscode.TreeItemCollapsibleState.Collapsed,
            new vscode.ThemeIcon('server-environment'),
            'targets'
          )
        );
      }

      return items;
    }

    // Children
    if (element.section === 'deps') {
      return this.manifest.deps.map(
        d => new DepTreeItem(d.name, d.version, vscode.TreeItemCollapsibleState.None, new vscode.ThemeIcon('symbol-package'))
      );
    }

    if (element.section === 'dev-deps') {
      return this.manifest.devDeps.map(
        d => new DepTreeItem(d.name, d.version, vscode.TreeItemCollapsibleState.None, new vscode.ThemeIcon('symbol-package'))
      );
    }

    if (element.section === 'dev-overrides') {
      return this.manifest.devOverrides.map(
        d => new DepTreeItem(d.name, d.version, vscode.TreeItemCollapsibleState.None, new vscode.ThemeIcon('symbol-package'))
      );
    }

    if (element.section === 'targets') {
      return this.manifest.targets.map(t => {
        const desc = [
          ...t.includes.map(i => `+${i}`),
          ...t.excludes.map(e => `-${e}`),
        ].join(', ');
        return new DepTreeItem(
          t.name,
          desc || 'default',
          vscode.TreeItemCollapsibleState.None,
          new vscode.ThemeIcon('device-desktop')
        );
      });
    }

    return [];
  }
}

class DepTreeItem extends vscode.TreeItem {
  constructor(
    label: string,
    description: string,
    collapsibleState: vscode.TreeItemCollapsibleState,
    icon?: vscode.ThemeIcon,
    public readonly section?: string
  ) {
    super(label, collapsibleState);
    this.description = description;
    if (icon) this.iconPath = icon;
  }
}
