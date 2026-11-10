// ============================================================================
// Loup Debug Session — runs a Loup program under VS Code's Run and Debug.
//
// It runs the program and shows its output. It reports every breakpoint as
// not set, because nothing in the toolchain can stop at one yet.
// ============================================================================

import {
  LoggingDebugSession,
  InitializedEvent,
  TerminatedEvent,
  ExitedEvent,
  OutputEvent,
  Thread,
} from '@vscode/debugadapter';
import { DebugProtocol } from '@vscode/debugprotocol';
import { LoupRuntime } from './loupRuntime.js';

interface LaunchRequestArguments extends DebugProtocol.LaunchRequestArguments {
  program: string;
  args?: string[];
  runArgs?: string[];
  cwd?: string;
  env?: Record<string, string>;
  /** Set by the extension from the `loup.executable` setting. */
  loupExecutable?: string;
}

const THREAD_ID = 1;
const NO_BREAKPOINTS = 'Loup cannot stop at breakpoints from VS Code yet; the program runs to the end.';

function strings(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [];
}

export class LoupDebugSession extends LoggingDebugSession {
  private runtime = new LoupRuntime();

  constructor() {
    super('loup-debug.log');
    this.setDebuggerLinesStartAt1(true);
    this.setDebuggerColumnsStartAt1(true);

    this.runtime.on('output', (category: string, text: string) => {
      this.sendEvent(new OutputEvent(text, category));
    });
    this.runtime.on('exit', (code: number) => {
      this.sendEvent(new ExitedEvent(code));
    });
    this.runtime.on('end', () => {
      this.sendEvent(new TerminatedEvent());
    });
  }

  protected initializeRequest(
    response: DebugProtocol.InitializeResponse,
    _args: DebugProtocol.InitializeRequestArguments
  ): void {
    response.body = response.body || {};
    response.body.supportsConfigurationDoneRequest = true;
    response.body.supportsTerminateRequest = true;
    response.body.supportTerminateDebuggee = true;
    this.sendResponse(response);
    this.sendEvent(new InitializedEvent());
  }

  protected async launchRequest(
    response: DebugProtocol.LaunchResponse,
    args: LaunchRequestArguments
  ): Promise<void> {
    if (typeof args.program !== 'string' || args.program.length === 0) {
      this.sendErrorResponse(response, 1, 'The launch configuration needs "program": the Loup file to run.');
      return;
    }
    try {
      await this.runtime.launch({
        executable: args.loupExecutable || process.env['LOUP_PATH'] || 'loup',
        program: args.program,
        runArgs: strings(args.runArgs),
        args: strings(args.args),
        cwd: args.cwd,
        env: args.env && typeof args.env === 'object' ? args.env : {},
      });
      this.sendResponse(response);
    } catch (err) {
      this.sendErrorResponse(response, 2, `Could not run the program: ${err instanceof Error ? err.message : err}`);
    }
  }

  protected attachRequest(response: DebugProtocol.AttachResponse, _args: DebugProtocol.AttachRequestArguments): void {
    this.sendErrorResponse(response, 3, 'Loup does not support attaching from VS Code yet.');
  }

  protected terminateRequest(response: DebugProtocol.TerminateResponse, _args: DebugProtocol.TerminateArguments): void {
    this.runtime.stop();
    this.sendResponse(response);
  }

  protected disconnectRequest(response: DebugProtocol.DisconnectResponse, _args: DebugProtocol.DisconnectArguments): void {
    this.runtime.stop();
    this.sendResponse(response);
  }

  /** Breakpoints set in other languages' files still arrive here: say plainly that none is set. */
  protected setBreakPointsRequest(
    response: DebugProtocol.SetBreakpointsResponse,
    args: DebugProtocol.SetBreakpointsArguments
  ): void {
    response.body = {
      breakpoints: (args.breakpoints ?? []).map((bp) => ({ verified: false, line: bp.line, message: NO_BREAKPOINTS })),
    };
    this.sendResponse(response);
  }

  protected threadsRequest(response: DebugProtocol.ThreadsResponse): void {
    response.body = { threads: [new Thread(THREAD_ID, 'main')] };
    this.sendResponse(response);
  }
}
