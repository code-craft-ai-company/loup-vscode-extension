// ============================================================================
// Loup tasks — what a `loup` task definition runs. No `vscode` import, so the
// rules can be tested on their own.
// ============================================================================

import { parseManifest } from './loupManifest';

export const LOUP_TASK_COMMANDS = ['run', 'build', 'test', 'fmt', 'check'] as const;
export type LoupTaskCommand = (typeof LOUP_TASK_COMMANDS)[number];

export interface LoupTaskDefinition {
  type: string;
  task: string;
  file?: string;
  args?: string[];
}

/** `run` and `fmt` are given a file; `build`, `test` and `check` work on the folder. */
export function taskNeedsFile(task: string): boolean {
  return task === 'run' || task === 'fmt';
}

/**
 * The arguments after `loup` for a task definition, or undefined when the
 * definition names no known command or lacks the file its command needs.
 */
export function taskArgs(def: Pick<LoupTaskDefinition, 'task' | 'file' | 'args'>): string[] | undefined {
  if (!(LOUP_TASK_COMMANDS as readonly string[]).includes(def.task)) return undefined;
  const file = typeof def.file === 'string' ? def.file.trim() : '';
  if (taskNeedsFile(def.task) && file.length === 0) return undefined;
  const extra = Array.isArray(def.args) ? def.args.filter((a) => typeof a === 'string') : [];
  return [def.task, ...(file.length > 0 ? [file] : []), ...extra];
}

/** The package name a manifest declares, or undefined when it names none. */
export function manifestPackageName(content: string): string | undefined {
  const name = parseManifest(content).packageName;
  return name === 'unnamed' ? undefined : name;
}
