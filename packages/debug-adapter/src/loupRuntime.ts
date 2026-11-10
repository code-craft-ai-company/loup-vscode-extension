// ============================================================================
// Loup run — starts `loup run <program>` and reports its output and exit.
//
// The Loup toolchain has no debugger a VS Code session can drive yet, so this
// runs the program; it sets no breakpoints and does not pause.
// ============================================================================

import { EventEmitter } from 'events';
import { ChildProcess, spawn } from 'child_process';
import * as path from 'path';

export interface LaunchOptions {
  /** The `loup` executable. */
  executable: string;
  /** The Loup source file. */
  program: string;
  /** Options for `loup run`, placed before the program (`--allow-fs`, …). */
  runArgs: string[];
  /** Arguments for the program. */
  args: string[];
  /** Working directory; the program's folder when empty. */
  cwd?: string;
  env: Record<string, string>;
}

/** The arguments after the executable: `run <runArgs> <program> [-- <args>]`. */
export function runCommandArgs(opts: Pick<LaunchOptions, 'program' | 'runArgs' | 'args'>): string[] {
  const out = ['run', ...opts.runArgs, opts.program];
  if (opts.args.length > 0) out.push('--', ...opts.args);
  return out;
}

/** How the end of the process reads in the Debug Console. */
export function exitLine(code: number | null, signal: string | null): string {
  if (signal) return `Program stopped by signal ${signal}.`;
  return `Program exited with code ${code ?? 0}.`;
}

/**
 * Events: `output(category, text)`, `exit(code)`, and `end()` exactly once.
 */
export class LoupRuntime extends EventEmitter {
  private child: ChildProcess | null = null;
  private ended = false;

  /** Start the program. Rejects when the executable cannot be started. */
  launch(opts: LaunchOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      const program = path.resolve(opts.program);
      const child = spawn(opts.executable, runCommandArgs({ ...opts, program }), {
        cwd: opts.cwd && opts.cwd.length > 0 ? opts.cwd : path.dirname(program),
        env: { ...process.env, ...opts.env },
        stdio: ['ignore', 'pipe', 'pipe'],
      });
      this.child = child;
      let started = false;

      child.once('spawn', () => {
        started = true;
        resolve();
      });
      child.stdout?.setEncoding('utf8');
      child.stderr?.setEncoding('utf8');
      child.stdout?.on('data', (text: string) => this.emit('output', 'stdout', text));
      child.stderr?.on('data', (text: string) => this.emit('output', 'stderr', text));

      child.once('error', (err: NodeJS.ErrnoException) => {
        this.child = null;
        const why =
          err.code === 'ENOENT'
            ? `could not find \`${opts.executable}\`. Set "loup.executable" in the settings to the loup binary.`
            : err.message;
        if (!started) reject(new Error(why));
        else this.emit('output', 'stderr', `${why}\n`);
        this.end();
      });
      // `close` comes after the output streams have drained; `exit` can come before.
      child.once('close', (code, signal) => {
        this.child = null;
        this.emit('output', 'console', `${exitLine(code, signal)}\n`);
        this.emit('exit', code ?? (signal ? 1 : 0));
        this.end();
      });
    });
  }

  /** Stop the program if it is still running. */
  stop(): void {
    const child = this.child;
    if (!child) return;
    child.kill();
    // A program that ignores the request is stopped outright.
    const timer = setTimeout(() => {
      if (this.child === child) child.kill('SIGKILL');
    }, 2000);
    timer.unref();
  }

  private end(): void {
    if (this.ended) return;
    this.ended = true;
    this.emit('end');
  }
}
