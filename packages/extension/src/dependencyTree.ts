// ============================================================================
// Package Dependency Tree View — Parse .lppkg / loup.pkg and display deps
// ============================================================================

import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export interface PackageDep {
  name: string;
  version: string;
  isDev: boolean;
  isOverride?: boolean;
  path?: string;
  git?: string;
}

export interface TargetProfile {
  name: string;
  includes: string[];
  excludes: string[];
}

export interface ParsedManifest {
  packageName: string;
  version: string;
  loupVersion?: string;
  sharedAbiVersion?: string;
  mode?: string;
  deps: PackageDep[];
  devDeps: PackageDep[];
  devOverrides: PackageDep[];
  targets: TargetProfile[];
}

export class DependencyTreeProvider implements vscode.TreeDataProvider<DepTreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<DepTreeItem | undefined>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;
  private manifest: ParsedManifest | null = null;

  constructor() {
    this.reload();
  }

  refresh(): void {
    this.reload();
    this._onDidChangeTreeData.fire(undefined);
  }

  private async reload(): Promise<void> {
    const pkgFiles = await vscode.workspace.findFiles('**/*.{lppkg,pkg}', '**/node_modules/**', 5);
    const loupPkg = pkgFiles.find(u =>
      u.fsPath.endsWith('.lppkg') || path.basename(u.fsPath) === 'loup.pkg'
    );
    if (!loupPkg) {
      this.manifest = null;
      return;
    }

    try {
      const content = fs.readFileSync(loupPkg.fsPath, 'utf-8');
      this.manifest = this.parse(content);
      this._onDidChangeTreeData.fire(undefined);
    } catch {
      this.manifest = null;
    }
  }

  private parse(content: string): ParsedManifest {
    const result: ParsedManifest = {
      packageName: 'unnamed',
      version: '0.0.0',
      deps: [],
      devDeps: [],
      devOverrides: [],
      targets: [],
    };

    let currentSection = '';
    let currentTarget: TargetProfile | null = null;

    for (const rawLine of content.split('\n')) {
      const line = rawLine.replace(/(#|\/\/).*$/, '').trim();
      if (!line) continue;

      // Section header
      const secMatch = line.match(/^\[([^\]]+)\]$/);
      if (secMatch) {
        if (currentTarget) {
          result.targets.push(currentTarget);
          currentTarget = null;
        }
        currentSection = secMatch[1].trim();
        if (currentSection.startsWith('target.') || currentSection.startsWith('delivery.')) {
          currentTarget = {
            name: currentSection.replace(/^(target|delivery)\./, ''),
            includes: [],
            excludes: [],
          };
        }
        continue;
      }

      // Top-level keys (both `package my-app` and `name = "my-app"` syntax)
      if (!currentSection) {
        const pkgMatch = line.match(/^(?:package|name)\s+(?:=\s*)?"?([^\s"]+)"?/);
        if (pkgMatch) { result.packageName = pkgMatch[1]; continue; }
        const verMatch = line.match(/^version\s+(?:=\s*)?"?([^\s"]+)"?/);
        if (verMatch) { result.version = verMatch[1]; continue; }
        const loupMatch = line.match(/^loup\s+(?:=\s*)?"?([^"]+)"?/);
        if (loupMatch) { result.loupVersion = loupMatch[1].trim(); continue; }
        const abiMatch = line.match(/^shared_abi_version\s+(?:=\s*)?(\S+)/);
        if (abiMatch) { result.sharedAbiVersion = abiMatch[1]; continue; }
      }

      if (currentSection === 'build') {
        const modeMatch = line.match(/^mode\s*=\s*"([^"]+)"/);
        if (modeMatch) { result.mode = modeMatch[1]; continue; }
      }

      // Deps (`[deps]` or `[dependencies]`)
      if (currentSection === 'deps' || currentSection === 'dependencies') {
        const dep = this.parseDep(line, false);
        if (dep) result.deps.push(dep);
      } else if (currentSection === 'dev-deps' || currentSection === 'dev-dependencies') {
        const dep = this.parseDep(line, true);
        if (dep) result.devDeps.push(dep);
      } else if (currentSection === 'dev-overrides') {
        const dep = this.parseDep(line, true);
        if (dep) {
          dep.isOverride = true;
          result.devOverrides.push(dep);
        }
      } else if (currentTarget) {
        const incMatch = line.match(/^include\s+(\S+)/);
        if (incMatch) currentTarget.includes.push(incMatch[1]);
        const excMatch = line.match(/^exclude\s+(\S+)/);
        if (excMatch) currentTarget.excludes.push(excMatch[1]);
      }
    }

    if (currentTarget) {
      result.targets.push(currentTarget);
    }

    return result;
  }

  private parseDep(line: string, isDev: boolean): PackageDep | null {
    // Simple: name = "^1.0"
    const simpleMatch = line.match(/^([a-zA-Z0-9_.-]+)\s*=\s*"([^"]+)"/);
    if (simpleMatch) {
      return { name: simpleMatch[1], version: simpleMatch[2], isDev };
    }
    // Table: name = { path = "...", git = "..." }
    const tableMatch = line.match(/^([a-zA-Z0-9_.-]+)\s*=\s*\{(.+)\}/);
    if (tableMatch) {
      const inner = tableMatch[2];
      const pathMatch = inner.match(/path\s*=\s*"([^"]+)"/);
      const gitMatch = inner.match(/git\s*=\s*"([^"]+)"/);
      const verMatch = inner.match(/version\s*=\s*"([^"]+)"/);
      return {
        name: tableMatch[1],
        version: verMatch?.[1] || (pathMatch ? `path:${pathMatch[1]}` : gitMatch ? `git:${gitMatch[1]}` : '*'),
        isDev,
        path: pathMatch?.[1],
        git: gitMatch?.[1],
      };
    }
    return null;
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
            new vscode.ThemeIcon('DebugStepOver'),
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
