// ============================================================================
// Loup Debug Session — DAP session handler
// ============================================================================

import {
  LoggingDebugSession,
  InitializedEvent,
  StoppedEvent,
  TerminatedEvent,
  BreakpointEvent,
  OutputEvent,
  Thread,
  StackFrame,
  Scope,
  Source,
  Breakpoint,
} from '@vscode/debugadapter';

import { DebugProtocol } from '@vscode/debugprotocol';
import { LoupRuntime, LoupBreakpoint, StopReason } from './loupRuntime.js';
import * as path from 'path';

interface LaunchRequestArguments extends DebugProtocol.LaunchRequestArguments {
  program: string;
  args?: string[];
  target?: string; // cli | browser | wasm | node | bun | deno | service | desktop | native | freestanding
  env?: Record<string, string>;
  enableTimeTravel?: boolean;
  traceLevel?: 'off' | 'minimal' | 'full';
  portalBreakpoints?: string[];
  stopOnEntry?: boolean;
}

interface AttachRequestArguments extends DebugProtocol.AttachRequestArguments {
  host?: string;
  port?: number;
}

const THREAD_ID = 1;

export class LoupDebugSession extends LoggingDebugSession {
  private runtime: LoupRuntime;

  constructor() {
    super('loup-debug.log');

    this.setDebuggerLinesStartAt1(true);
    this.setDebuggerColumnsStartAt1(true);

    this.runtime = new LoupRuntime();

    // Wire runtime events to DAP events
    this.runtime.on('stopOnBreakpoint', (threadId: number, reason: StopReason) => {
      this.sendEvent(new StoppedEvent(reason, threadId));
    });

    this.runtime.on('stopOnStep', (threadId: number) => {
      this.sendEvent(new StoppedEvent('step', threadId));
    });

    this.runtime.on('stopOnException', (threadId: number, message: string) => {
      const event = new StoppedEvent('exception', threadId, message);
      this.sendEvent(event);
    });

    this.runtime.on('breakpointValidated', (bp: LoupBreakpoint) => {
      const breakpoint = new Breakpoint(bp.verified, bp.line);
      (breakpoint as DebugProtocol.Breakpoint).id = bp.id;
      this.sendEvent(new BreakpointEvent('changed', breakpoint));
    });

    this.runtime.on('output', (category: string, text: string, source?: string, line?: number) => {
      const event = new OutputEvent(text, category);
      if (source) {
        (event.body as DebugProtocol.OutputEvent['body']).source = new Source(
          path.basename(source),
          source
        );
      }
      if (line !== undefined) {
        (event.body as DebugProtocol.OutputEvent['body']).line = line;
      }
      this.sendEvent(event);
    });

    this.runtime.on('end', () => {
      this.sendEvent(new TerminatedEvent());
    });
  }

  // ---- Initialize ----

  protected initializeRequest(
    response: DebugProtocol.InitializeResponse,
    _args: DebugProtocol.InitializeRequestArguments
  ): void {
    response.body = response.body || {};

    // Capabilities
    response.body.supportsConfigurationDoneRequest = true;
    response.body.supportsFunctionBreakpoints = false;
    response.body.supportsConditionalBreakpoints = false;
    response.body.supportsHitConditionalBreakpoints = false;
    response.body.supportsEvaluateForHovers = true;
    response.body.exceptionBreakpointFilters = [
      {
        filter: 'all',
        label: 'All Exceptions',
        description: 'Break on all thrown exceptions',
        default: false,
      },
      {
        filter: 'uncaught',
        label: 'Uncaught Exceptions',
        description: 'Break on exceptions not caught by try/catch',
        default: true,
      },
    ];
    response.body.supportsStepBack = false; // Phase 3: time-travel
    response.body.supportsSetVariable = false;
    response.body.supportsRestartFrame = false;
    response.body.supportsGotoTargetsRequest = false;
    response.body.supportsStepInTargetsRequest = false;
    response.body.supportsCompletionsRequest = false;
    response.body.supportsModulesRequest = false;
    response.body.supportsRestartRequest = true;
    response.body.supportsExceptionOptions = false;
    response.body.supportsValueFormattingOptions = false;
    response.body.supportsExceptionInfoRequest = true;
    response.body.supportTerminateDebuggee = true;
    response.body.supportsDelayedStackTraceLoading = false;
    response.body.supportsLoadedSourcesRequest = false;
    response.body.supportsTerminateThreadsRequest = false;
    response.body.supportsSetExpression = false;
    response.body.supportsTerminateRequest = true;
    response.body.supportsDataBreakpoints = false;
    response.body.supportsReadMemoryRequest = false;
    response.body.supportsDisassembleRequest = false;
    response.body.supportsCancelRequest = false;
    response.body.supportsBreakpointLocationsRequest = false;
    response.body.supportsClipboardContext = false;
    response.body.supportsSteppingGranularity = false;
    response.body.supportsInstructionBreakpoints = false;
    response.body.supportsExceptionFilterOptions = false;

    this.sendResponse(response);
    this.sendEvent(new InitializedEvent());
  }

  protected configurationDoneRequest(
    response: DebugProtocol.ConfigurationDoneResponse,
    _args: DebugProtocol.ConfigurationDoneArguments
  ): void {
    super.configurationDoneRequest(response, _args);
  }

  // ---- Launch / Attach ----

  protected async launchRequest(
    response: DebugProtocol.LaunchResponse,
    args: LaunchRequestArguments
  ): Promise<void> {
    try {
      await this.runtime.launch(
        args.program,
        args.args || [],
        args.target || 'cli',
        args.env || {},
        args.enableTimeTravel || false,
        args.traceLevel || 'off'
      );

      // Set portal breakpoints if specified
      if (args.portalBreakpoints && args.portalBreakpoints.length > 0) {
        for (const portal of args.portalBreakpoints) {
          this.runtime.activatePortal(portal);
        }
      }

      this.sendResponse(response);
    } catch (err) {
      this.sendErrorResponse(response, 1, `Failed to launch: ${err}`);
    }
  }

  protected async attachRequest(
    response: DebugProtocol.AttachResponse,
    args: AttachRequestArguments
  ): Promise<void> {
    try {
      await this.runtime.attach(args.host || 'localhost', args.port || 9229);
      this.sendResponse(response);
    } catch (err) {
      this.sendErrorResponse(response, 2, `Failed to attach: ${err}`);
    }
  }

  protected terminateRequest(
    response: DebugProtocol.TerminateResponse,
    _args: DebugProtocol.TerminateArguments
  ): void {
    this.runtime.disconnect();
    this.sendResponse(response);
  }

  protected disconnectRequest(
    response: DebugProtocol.DisconnectResponse,
    _args: DebugProtocol.DisconnectArguments
  ): void {
    this.runtime.disconnect();
    this.sendResponse(response);
  }

  protected restartRequest(
    response: DebugProtocol.RestartResponse,
    _args: DebugProtocol.RestartArguments
  ): void {
    this.runtime.disconnect();
    this.sendResponse(response);
  }

  // ---- Breakpoints ----

  protected setBreakPointsRequest(
    response: DebugProtocol.SetBreakpointsResponse,
    args: DebugProtocol.SetBreakpointsArguments
  ): void {
    const source = args.source.path || '';
    const requestedLines = args.breakpoints?.map(bp => bp.line) || [];

    const bps = this.runtime.setBreakpoints(source, requestedLines);

    response.body = {
      breakpoints: bps.map(bp => ({
        id: bp.id,
        verified: bp.verified,
        line: bp.line,
        source: new Source(path.basename(source), source),
      })),
    };

    this.sendResponse(response);
  }

  protected setExceptionBreakPointsRequest(
    response: DebugProtocol.SetExceptionBreakpointsResponse,
    args: DebugProtocol.SetExceptionBreakpointsArguments
  ): void {
    this.runtime.setExceptionBreakpoints(args.filters);
    this.sendResponse(response);
  }

  // ---- Threads ----

  protected threadsRequest(response: DebugProtocol.ThreadsResponse): void {
    response.body = {
      threads: [new Thread(THREAD_ID, 'Main Thread')],
    };
    this.sendResponse(response);
  }

  // ---- Stack trace ----

  protected stackTraceRequest(
    response: DebugProtocol.StackTraceResponse,
    args: DebugProtocol.StackTraceArguments
  ): void {
    const frames = this.runtime.getStackTrace(args.threadId);

    response.body = {
      stackFrames: frames.map(f => {
        const sf = new StackFrame(
          f.id,
          f.name,
          new Source(path.basename(f.source), f.source),
          f.line,
          f.column
        );
        if (f.isPortal) {
          sf.presentationHint = 'subtle';
        }
        if (f.execMode === 'native') {
          sf.presentationHint = 'label';
        }
        return sf;
      }),
      totalFrames: frames.length,
    };

    this.sendResponse(response);
  }

  // ---- Scopes & Variables ----

  protected scopesRequest(
    response: DebugProtocol.ScopesResponse,
    args: DebugProtocol.ScopesArguments
  ): void {
    const scopes = this.runtime.getScopes(args.frameId);

    response.body = {
      scopes: scopes.map(s => new Scope(s.name, s.variablesReference, s.expensive)),
    };

    this.sendResponse(response);
  }

  protected variablesRequest(
    response: DebugProtocol.VariablesResponse,
    args: DebugProtocol.VariablesArguments
  ): void {
    const variables = this.runtime.getVariables(args.variablesReference);

    response.body = {
      variables: variables.map(v => ({
        name: v.name,
        value: v.value,
        type: v.type,
        variablesReference: v.variablesReference,
        namedVariables: v.namedVariables,
        indexedVariables: v.indexedVariables,
      })),
    };

    this.sendResponse(response);
  }

  // ---- Execution control ----

  protected continueRequest(
    response: DebugProtocol.ContinueResponse,
    args: DebugProtocol.ContinueArguments
  ): void {
    this.runtime.continue(args.threadId);
    response.body = { allThreadsContinued: true };
    this.sendResponse(response);
  }

  protected nextRequest(
    response: DebugProtocol.NextResponse,
    args: DebugProtocol.NextArguments
  ): void {
    this.runtime.next(args.threadId);
    this.sendResponse(response);
  }

  protected stepInRequest(
    response: DebugProtocol.StepInResponse,
    args: DebugProtocol.StepInArguments
  ): void {
    this.runtime.stepIn(args.threadId);
    this.sendResponse(response);
  }

  protected stepOutRequest(
    response: DebugProtocol.StepOutResponse,
    args: DebugProtocol.StepOutArguments
  ): void {
    this.runtime.stepOut(args.threadId);
    this.sendResponse(response);
  }

  protected pauseRequest(
    response: DebugProtocol.PauseResponse,
    args: DebugProtocol.PauseArguments
  ): void {
    this.runtime.pause(args.threadId);
    this.sendResponse(response);
  }

  // ---- Evaluation ----

  protected evaluateRequest(
    response: DebugProtocol.EvaluateResponse,
    args: DebugProtocol.EvaluateArguments
  ): void {
    const result = this.runtime.evaluate(args.expression, args.frameId);

    response.body = {
      result: result.result,
      type: result.type,
      variablesReference: result.variablesReference,
    };

    this.sendResponse(response);
  }

  // ---- Exception info ----

  protected exceptionInfoRequest(
    response: DebugProtocol.ExceptionInfoResponse,
    _args: DebugProtocol.ExceptionInfoArguments
  ): void {
    response.body = {
      exceptionId: 'LoupException',
      description: 'An exception was thrown',
      breakMode: 'always',
    };
    this.sendResponse(response);
  }
}
