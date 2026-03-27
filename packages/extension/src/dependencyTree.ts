// ============================================================================
// Loom Dependency Tree — Tree view for loom.pkg dependencies
// ============================================================================

import * as vscode from 'vscode';
import * as path from 'path';

interface DependencyItem {
  name: string;
  version: string;
  kind: 'dependency' | 'devDependency' | 'target';
  children?: DependencyItem[];
}

export class DependencyTreeProvider implements vscode.TreeDataProvider<DependencyItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<DependencyItem | undefined>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private dependencies: DependencyItem[] = [];

  refresh(): void {
    this.loadDependencies();
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(element: DependencyItem): vscode.TreeItem {
    const hasChildren = element.children && element.children.length > 0;
    const item = new vscode.TreeItem(
      element.name,
      hasChildren
        ? vscode.TreeItemCollapsibleState.Collapsed
        : vscode.TreeItemCollapsibleState.None
    );

    item.description = element.version;
    item.tooltip = `${element.name}@${element.version} (${element.kind})`;

    switch (element.kind) {
      case 'dependency':
        item.iconPath = new vscode.ThemeIcon('package');
        item.contextValue = 'dependency';
        break;
      case 'devDependency':
        item.iconPath = new vscode.ThemeIcon('beaker');
        item.contextValue = 'devDependency';
        break;
      case 'target':
        item.iconPath = new vscode.ThemeIcon('device-desktop');
        item.contextValue = 'target';
        break;
    }

    return item;
  }

  getChildren(element?: DependencyItem): DependencyItem[] {
    if (element) {
      return element.children || [];
    }
    return this.dependencies;
  }

  private async loadDependencies(): Promise<void> {
    this.dependencies = [];
    const pkgFiles = await vscode.workspace.findFiles('**/loom.pkg', '**/node_modules/**', 1);
    if (pkgFiles.length === 0) return;

    const content = new TextDecoder().decode(
      await vscode.workspace.fs.readFile(pkgFiles[0])
    );

    this.parseDependencies(content);
  }

  private parseDependencies(content: string): void {
    const sections = this.parseSections(content);

    // Dependencies
    if (sections['dependencies']) {
      const deps = this.parseKeyValuePairs(sections['dependencies']);
      for (const [name, version] of deps) {
        this.dependencies.push({ name, version, kind: 'dependency' });
      }
    }

    // Dev dependencies
    if (sections['dev-dependencies']) {
      const devDeps = this.parseKeyValuePairs(sections['dev-dependencies']);
      for (const [name, version] of devDeps) {
        this.dependencies.push({ name, version, kind: 'devDependency' });
      }
    }

    // Targets
    for (const [key, value] of Object.entries(sections)) {
      if (key.startsWith('target.')) {
        const targetName = key.slice(7);
        const pairs = this.parseKeyValuePairs(value);
        const targetItem: DependencyItem = {
          name: targetName,
          version: '',
          kind: 'target',
          children: pairs.map(([k, v]) => ({
            name: k,
            version: v,
            kind: 'dependency' as const,
          })),
        };
        this.dependencies.push(targetItem);
      }
    }
  }

  private parseSections(content: string): Record<string, string> {
    const sections: Record<string, string> = {};
    const sectionRegex = /^\[([^\]]+)\]\s*$/gm;
    let lastKey: string | null = null;
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

  private parseKeyValuePairs(text: string): [string, string][] {
    const pairs: [string, string][] = [];
    const lines = text.split('\n');
    for (const line of lines) {
      const match = line.match(/^\s*(\S+)\s*=\s*"([^"]+)"/);
      if (match) {
        pairs.push([match[1], match[2]]);
      }
    }
    return pairs;
  }
}
