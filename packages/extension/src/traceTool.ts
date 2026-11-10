// ============================================================================
// Trace tool runner — asks the Loup toolchain to read a `.ltrace` file.
//
// The toolchain's trace library is the one reader of the `.ltrace` format. This
// module only decides which command to run and hands its JSON to `traceView`.
// No `vscode` import: the caller passes the settings in.
// ============================================================================

import { execFile } from 'child_process';
import * as path from 'path';
import { QueryResult, TraceView, TraceViewError, parseQueryResult, parseTraceView } from './traceView';

export interface TraceToolSettings {
  /** The `loup` executable (setting `loup.executable`; default `loup`). */
  executable: string;
  /** A Loup source checkout (setting `loup.toolchainRoot`), or ''. */
  toolchainRoot: string;
  /** A full command override (setting `loup.trace.toolCommand`), or []. */
  toolCommand: string[];
  /** Milliseconds before the tool is stopped (setting `loup.trace.timeoutMs`). */
  timeoutMs: number;
}

export interface ToolInvocation {
  command: string;
  args: string[];
  env: Record<string, string>;
}

/** The trace-view tool's entry script inside a Loup checkout. */
export const TOOL_SCRIPT = path.join('source', 'runtime', 'tools', 'loup_debug', 'main.loup');

/**
 * The command that runs the trace tool with `toolArgs` (`view <file>`, …).
 *
 *  1. `loup.trace.toolCommand`, when set: that command, then the arguments.
 *  2. `loup.toolchainRoot`, when set: the tool run as a script from the checkout,
 *     which is how it runs until the `loup debug` command ships.
 *  3. Otherwise `loup debug <args>`.
 */
export function toolInvocation(settings: TraceToolSettings, toolArgs: string[]): ToolInvocation {
  if (settings.toolCommand.length > 0) {
    return { command: settings.toolCommand[0], args: [...settings.toolCommand.slice(1), ...toolArgs], env: {} };
  }
  const exe = settings.executable.length > 0 ? settings.executable : 'loup';
  if (settings.toolchainRoot.length > 0) {
    const root = settings.toolchainRoot;
    const louppath = [
      path.join(root, 'source', 'packages'),
      path.join(root, 'source', 'runtime'),
      path.join(root, 'source'),
    ].join(path.delimiter);
    return {
      command: exe,
      args: ['run', path.join(root, TOOL_SCRIPT), '--allow-fs', '--', ...toolArgs],
      env: { LOUPPATH: louppath },
    };
  }
  return { command: exe, args: ['debug', ...toolArgs], env: {} };
}

function describe(inv: ToolInvocation): string {
  return [inv.command, ...inv.args].join(' ');
}

/** Run the tool and return its stdout. A nonzero exit still returns stdout when it is JSON. */
function run(inv: ToolInvocation, timeoutMs: number, cwd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile(
      inv.command,
      inv.args,
      { cwd, timeout: timeoutMs, maxBuffer: 256 * 1024 * 1024, env: { ...process.env, ...inv.env } },
      (err, stdout, stderr) => {
        const out = String(stdout ?? '');
        if (!err) return resolve(out);
        const e = err as NodeJS.ErrnoException & { killed?: boolean };
        if (e.code === 'ENOENT') {
          return reject(
            new TraceViewError(
              `could not run \`${inv.command}\`. Set "loup.executable" to the loup binary, or ` +
                `"loup.trace.toolCommand" to the full trace tool command.`,
              'no-tool'
            )
          );
        }
        if (e.killed) {
          return reject(
            new TraceViewError(
              `the trace tool did not finish in ${Math.round(timeoutMs / 1000)} s (\`${describe(inv)}\`). ` +
                `Raise "loup.trace.timeoutMs" for a large trace.`,
              'timeout'
            )
          );
        }
        // The tool reports its own failures as JSON on stdout with a nonzero exit.
        if (out.trimStart().startsWith('{')) return resolve(out);
        const detail = String(stderr ?? '').trim().split('\n').slice(0, 6).join('\n');
        reject(
          new TraceViewError(
            `the trace tool failed (\`${describe(inv)}\`)` + (detail.length > 0 ? `:\n${detail}` : '.'),
            'tool'
          )
        );
      }
    );
  });
}

/**
 * The file as the tool is given it. The tool runs in the file's directory and
 * gets the bare name: the trace library refuses a path with a space or other
 * shell-special character, and a directory is where those usually are.
 */
function toolPath(file: string): string {
  const name = path.basename(file);
  if (!/^[A-Za-z0-9._+@%=,-]+$/.test(name)) {
    throw new TraceViewError(
      `the Loup trace library does not open a file whose name has spaces or special characters ` +
        `(${JSON.stringify(name)}). Rename the file; its folder may be named anything.`,
      'usage'
    );
  }
  return name;
}

/** Read `file` (a `.ltrace`) into a view. */
export async function loadTraceView(settings: TraceToolSettings, file: string): Promise<TraceView> {
  const inv = toolInvocation(settings, ['view', toolPath(file)]);
  const text = await run(inv, settings.timeoutMs, path.dirname(file));
  return parseTraceView(text);
}

/** Run a trace query (the Loup trace query language) against `file`. */
export async function queryTrace(
  settings: TraceToolSettings,
  file: string,
  query: string,
  limit: number
): Promise<QueryResult> {
  const inv = toolInvocation(settings, ['query', toolPath(file), query, '--limit', String(limit)]);
  const text = await run(inv, settings.timeoutMs, path.dirname(file));
  return parseQueryResult(text);
}
