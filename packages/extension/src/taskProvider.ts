// ============================================================================
// Loup Task Provider — `loup build` / `loup test` for a package folder,
// `loup run` for the open file, and tasks written in tasks.json.
// ============================================================================

import * as vscode from 'vscode';
import * as path from 'path';
import { LoupTaskDefinition, manifestPackageName, taskArgs } from './loupTasks';
import { loupExecutable } from './toolchain';
import { isLoupSource } from './languages';

const MANIFEST_NAMES = ['package.lppkg', 'loup.pkg'];

export class LoupTaskProvider implements vscode.TaskProvider {
  static readonly type = 'loup';

  async provideTasks(): Promise<vscode.Task[]> {
    const tasks: (vscode.Task | undefined)[] = [];

    for (const folder of vscode.workspace.workspaceFolders ?? []) {
      const pkgName = await this.packageName(folder);
      if (pkgName === undefined) continue;
      const label = pkgName.length > 0 ? pkgName : folder.name;
      tasks.push(this.make({ type: LoupTaskProvider.type, task: 'build' }, folder, `build ${label}`, folder.uri.fsPath));
      tasks.push(this.make({ type: LoupTaskProvider.type, task: 'test' }, folder, `test ${label}`, folder.uri.fsPath));
    }

    const doc = vscode.window.activeTextEditor?.document;
    if (doc && isLoupSource(doc.languageId) && doc.uri.scheme === 'file') {
      const folder = vscode.workspace.getWorkspaceFolder(doc.uri);
      const def: LoupTaskDefinition = { type: LoupTaskProvider.type, task: 'run', file: doc.uri.fsPath };
      tasks.push(
        this.make(def, folder ?? vscode.TaskScope.Workspace, `run ${path.basename(doc.uri.fsPath)}`, path.dirname(doc.uri.fsPath))
      );
    }

    return tasks.filter((t): t is vscode.Task => t !== undefined);
  }

  resolveTask(task: vscode.Task): vscode.Task | undefined {
    const def = task.definition as LoupTaskDefinition;
    if (def.type !== LoupTaskProvider.type) return undefined;
    const scope = task.scope ?? vscode.TaskScope.Workspace;
    const cwd =
      typeof scope === 'object' ? scope.uri.fsPath : vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    return this.make(def, scope, task.name, cwd);
  }

  /** The folder's package name ('' when the manifest names none), or undefined without a manifest. */
  private async packageName(folder: vscode.WorkspaceFolder): Promise<string | undefined> {
    for (const name of MANIFEST_NAMES) {
      try {
        const bytes = await vscode.workspace.fs.readFile(vscode.Uri.joinPath(folder.uri, name));
        return manifestPackageName(Buffer.from(bytes).toString('utf-8')) ?? '';
      } catch {
        // No such manifest (or unreadable): try the next name.
      }
    }
    return undefined;
  }

  private make(
    def: LoupTaskDefinition,
    scope: vscode.WorkspaceFolder | vscode.TaskScope,
    name: string,
    cwd: string | undefined
  ): vscode.Task | undefined {
    const args = taskArgs(def);
    if (!args) return undefined;
    const execution = new vscode.ProcessExecution(loupExecutable(), args, cwd ? { cwd } : undefined);
    const task = new vscode.Task(def, scope, name, 'loup', execution, '$loup');
    if (def.task === 'build') task.group = vscode.TaskGroup.Build;
    if (def.task === 'test') task.group = vscode.TaskGroup.Test;
    return task;
  }
}
