// ============================================================================
// Loup Task Provider — Auto-detect tasks from package.lppkg / loup.pkg
// ============================================================================

import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export class LoupTaskProvider implements vscode.TaskProvider {
  static readonly type = 'loup';

  async provideTasks(): Promise<vscode.Task[]> {
    const tasks: vscode.Task[] = [];
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) return tasks;

    for (const folder of workspaceFolders) {
      const manifestPath = this.findManifest(folder.uri.fsPath);
      if (manifestPath) {
        const pkgContent = fs.readFileSync(manifestPath, 'utf-8');
        const pkgName = this.parsePackageName(pkgContent) || folder.name;

        // Standard tasks: run, build, test, fmt, check
        tasks.push(this.createTask('run', `loup run`, folder, pkgName, vscode.TaskGroup.Build));
        tasks.push(this.createTask('build', `loup build`, folder, pkgName, vscode.TaskGroup.Build));
        tasks.push(this.createTask('test', `loup test`, folder, pkgName, vscode.TaskGroup.Test));
        tasks.push(this.createTask('fmt', `loup fmt`, folder, pkgName));
        tasks.push(this.createTask('check', `loup check`, folder, pkgName, vscode.TaskGroup.Build));

        // Delivery target-specific build tasks
        const targets = this.parseTargets(pkgContent);
        for (const target of targets) {
          tasks.push(
            this.createTask(
              `build:${target}`,
              `loup build --target ${target}`,
              folder,
              pkgName,
              vscode.TaskGroup.Build
            )
          );
        }
      }
    }

    return tasks;
  }

  resolveTask(task: vscode.Task): vscode.Task | undefined {
    const definition = task.definition;
    if (definition.type === LoupTaskProvider.type && definition.command) {
      const execution = new vscode.ShellExecution(definition.command);
      return new vscode.Task(
        definition,
        task.scope ?? vscode.TaskScope.Workspace,
        definition.task || definition.command,
        'loup',
        execution,
        '$loup'
      );
    }
    return undefined;
  }

  private findManifest(dir: string): string | undefined {
    const candidates = ['package.lppkg', 'loup.pkg'];
    for (const candidate of candidates) {
      const fullPath = path.join(dir, candidate);
      if (fs.existsSync(fullPath)) {
        return fullPath;
      }
    }
    try {
      const entries = fs.readdirSync(dir);
      const lppkg = entries.find(e => e.endsWith('.lppkg'));
      if (lppkg) {
        return path.join(dir, lppkg);
      }
    } catch {
      // Ignore read errors
    }
    return undefined;
  }

  private createTask(
    name: string,
    command: string,
    folder: vscode.WorkspaceFolder,
    pkgName: string,
    group?: vscode.TaskGroup
  ): vscode.Task {
    const definition: vscode.TaskDefinition = {
      type: LoupTaskProvider.type,
      task: name,
      command,
    };

    const execution = new vscode.ShellExecution(command, { cwd: folder.uri.fsPath });
    const task = new vscode.Task(
      definition,
      folder,
      `${pkgName}: ${name}`,
      'loup',
      execution,
      '$loup'
    );

    if (group) {
      task.group = group;
    }

    return task;
  }

  private parsePackageName(content: string): string | undefined {
    const pkgMatch = content.match(/^(?:package|name)\s+(?:=\s*)?"?([^\s"]+)"?/m);
    return pkgMatch?.[1];
  }

  private parseTargets(content: string): string[] {
    const targets: string[] = [];
    const regex = /\[(?:delivery|target)\.([a-zA-Z0-9_-]+)\]/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
      targets.push(match[1]);
    }
    return targets;
  }
}
