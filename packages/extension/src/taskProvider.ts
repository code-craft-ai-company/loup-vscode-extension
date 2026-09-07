// ============================================================================
// Loup Task Provider — Auto-detect loup run/build/test tasks from loup.pkg
// ============================================================================

import * as vscode from 'vscode';
import * as path from 'path';

export class LoupTaskProvider implements vscode.TaskProvider {
  static readonly type = 'loup';

  async provideTasks(): Promise<vscode.Task[]> {
    const tasks: vscode.Task[] = [];
    const pkgFiles = await vscode.workspace.findFiles('**/loup.pkg', '**/node_modules/**');

    for (const pkgUri of pkgFiles) {
      const content = new TextDecoder().decode(await vscode.workspace.fs.readFile(pkgUri));
      const dir = path.dirname(pkgUri.fsPath);
      const name = this.extractPackageName(content) || path.basename(dir);

      // Standard tasks
      tasks.push(this.createTask('run', `Run ${name}`, dir, ['run', '.']));
      tasks.push(this.createTask('build', `Build ${name}`, dir, ['build']));
      tasks.push(this.createTask('test', `Test ${name}`, dir, ['test']));

      // Check for scripts section
      const scripts = this.extractScripts(content);
      for (const [scriptName, scriptCmd] of scripts) {
        tasks.push(this.createTask(
          `script:${scriptName}`,
          `${name}: ${scriptName}`,
          dir,
          ['run', '--script', scriptName]
        ));
      }

      // Target-specific tasks
      const targets = this.extractTargets(content);
      for (const target of targets) {
        tasks.push(this.createTask(
          `run:${target}`,
          `Run ${name} (${target})`,
          dir,
          ['run', '.', '--target', target]
        ));
        // v0.7: browser target gets build and serve tasks
        if (target === 'browser') {
          tasks.push(this.createTask(
            'build:browser',
            `Build ${name} (browser)`,
            dir,
            ['build', '--target', 'browser']
          ));
          tasks.push(this.createTask(
            'serve',
            `Serve ${name} (dev server)`,
            dir,
            ['serve']
          ));
        }
      }
    }

    return tasks;
  }

  resolveTask(task: vscode.Task): vscode.Task | undefined {
    const definition = task.definition;
    if (definition.type === LoupTaskProvider.type && definition.command) {
      return this.createTask(
        definition.command,
        task.name,
        definition.cwd || '.',
        definition.args || [definition.command]
      );
    }
    return undefined;
  }

  private createTask(command: string, label: string, cwd: string, args: string[]): vscode.Task {
    const definition: vscode.TaskDefinition = {
      type: LoupTaskProvider.type,
      command,
      cwd,
      args,
    };

    const execution = new vscode.ShellExecution('loup', args, { cwd });

    const task = new vscode.Task(
      definition,
      vscode.TaskScope.Workspace,
      label,
      'Loup',
      execution,
      '$loup'  // problem matcher
    );

    task.group = command === 'test'
      ? vscode.TaskGroup.Test
      : command === 'build'
        ? vscode.TaskGroup.Build
        : undefined;

    task.presentationOptions = {
      reveal: vscode.TaskRevealKind.Always,
      panel: vscode.TaskPanelKind.Shared,
    };

    return task;
  }

  private extractPackageName(content: string): string | null {
    const match = content.match(/^name\s*=\s*"([^"]+)"/m);
    return match ? match[1] : null;
  }

  private extractScripts(content: string): [string, string][] {
    const scripts: [string, string][] = [];
    const scriptSection = content.match(/\[scripts\]([\s\S]*?)(?=\[|$)/);
    if (scriptSection) {
      const lines = scriptSection[1].split('\n');
      for (const line of lines) {
        const match = line.match(/^\s*(\w+)\s*=\s*"([^"]+)"/);
        if (match) {
          scripts.push([match[1], match[2]]);
        }
      }
    }
    return scripts;
  }

  private extractTargets(content: string): string[] {
    const targets: string[] = [];
    const matches = content.matchAll(/\[target\.(\w+)\]/g);
    for (const match of matches) {
      targets.push(match[1]);
    }
    return targets;
  }
}
