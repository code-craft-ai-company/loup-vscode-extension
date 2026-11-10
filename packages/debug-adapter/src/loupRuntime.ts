// ============================================================================
// Loup Runtime Interface — Bridge between DAP and the Loup CLI/runtime
// ============================================================================

import { EventEmitter } from 'events';
import { ChildProcess, spawn } from 'child_process';

export interface LoupBreakpoint {
  id: number;
  line: number;
  column?: number;
  verified: boolean;
  source: string;
}

export interface LoupStackFrame {
  id: number;
  name: string;
  source: string;
  line: number;
  column: number;
  execMode?: 'interpreted' | 'compiled' | 'native';
  traceLevel?: 'off' | 'minimal' | 'full';
  isPortal?: boolean;
  portalName?: string;
  portalCondition?: string;
}

export interface LoupVariable {
  name: string;
  value: string;
  type: string;
  variablesReference: number;
  namedVariables?: number;
  indexedVariables?: number;
}

export interface LoupScope {
  name: string;
  variablesReference: number;
  expensive: boolean;
}

export type StopReason = 'breakpoint' | 'step' | 'exception' | 'pause' | 'entry' | 'portal';

export interface RuntimeEvents {
  stopOnBreakpoint: (threadId: number, reason: StopReason) => void;
  stopOnStep: (threadId: number) => void;
  stopOnException: (threadId: number, message: string) => void;
  breakpointValidated: (bp: LoupBreakpoint) => void;
  output: (category: string, text: string, source?: string, line?: number) => void;
  end: () => void;
  error: (message: string) => void;
}

/**
 * LoupRuntime manages the lifecycle of a Loup process and translates
 * between the DAP protocol and the Loup runtime debug API.
 *
 * Communication with the Loup process uses a JSON-line protocol over stderr:
 *   <- {"event": "stopped", "reason": "breakpoint", "threadId": 1, ...}
 *   -> {"command": "continue", "threadId": 1}
 */
export class LoupRuntime extends EventEmitter {
  private process: ChildProcess | null = null;
  private breakpoints = new Map<string, LoupBreakpoint[]>();
  private breakpointIdCounter = 1;
  private stackFrames: LoupStackFrame[] = [];
  private variables = new Map<number, LoupVariable[]>();
  private nextVarRef = 1000;
  private running = false;

  // ---- Lifecycle ----

  async launch(program: string, args: string[], target: string, env: Record<string, string>, enableTimeTravel: boolean, traceLevel?: string): Promise<void> {
    const loupArgs = ['run', program, '--target', target];
    if (enableTimeTravel) {
      loupArgs.push('--enable-time-travel');
    }
    if (traceLevel && traceLevel !== 'off') {
      loupArgs.push('--trace-level', traceLevel);
    }
    if (args.length > 0) {
      loupArgs.push('--', ...args);
    }

    const loupPath = process.env['LOUP_PATH'] || 'loup';

    this.process = spawn(loupPath, loupArgs, {
      cwd: this.workingDir(program),
      env: { ...process.env, ...env, LOUP_DEBUG: '1' },
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    this.running = true;

    this.process.stdout?.on('data', (data: Buffer) => {
      this.emit('output', 'stdout', data.toString());
    });

    this.process.stderr?.on('data', (data: Buffer) => {
      const text = data.toString();
      // Try to parse debug protocol messages (JSON lines)
      for (const line of text.split('\n')) {
        const trimmed = line.trim();
        if (trimmed.startsWith('{')) {
          try {
            const msg = JSON.parse(trimmed);
            this.handleDebugMessage(msg);
            continue;
          } catch {
            // Not a debug message, treat as stderr output
          }
        }
        if (trimmed.length > 0) {
          this.emit('output', 'stderr', trimmed + '\n');
        }
      }
    });

    this.process.on('exit', (code) => {
      this.running = false;
      this.emit('output', 'console', `Process exited with code ${code}\n`);
      this.emit('end');
    });

    this.process.on('error', (err) => {
      this.running = false;
      this.emit('error', `Failed to launch Loup: ${err.message}`);
      this.emit('end');
    });
  }

  async attach(host: string, port: number): Promise<void> {
    // Future: connect to a running Loup process debug server
    this.emit('output', 'console', `Attaching to ${host}:${port}...\n`);
    this.emit('error', 'Attach mode is not yet implemented. Use launch mode.');
    this.emit('end');
  }

  disconnect(): void {
    if (this.process) {
      this.sendCommand({ command: 'disconnect' });
      this.process.kill();
      this.process = null;
    }
    this.running = false;
  }

  // ---- Breakpoints ----

  setBreakpoints(source: string, lines: number[]): LoupBreakpoint[] {
    const bps: LoupBreakpoint[] = lines.map(line => ({
      id: this.breakpointIdCounter++,
      line,
      verified: true,
      source,
    }));
    this.breakpoints.set(source, bps);

    // Send to runtime
    this.sendCommand({
      command: 'setBreakpoints',
      source,
      breakpoints: bps.map(bp => ({ line: bp.line })),
    });

    return bps;
  }

  setExceptionBreakpoints(filters: string[]): void {
    this.sendCommand({
      command: 'setExceptionBreakpoints',
      filters,
    });
  }

  // ---- Execution control ----

  continue(threadId: number): void {
    this.sendCommand({ command: 'continue', threadId });
  }

  next(threadId: number): void {
    this.sendCommand({ command: 'next', threadId });
  }

  stepIn(threadId: number): void {
    this.sendCommand({ command: 'stepIn', threadId });
  }

  stepOut(threadId: number): void {
    this.sendCommand({ command: 'stepOut', threadId });
  }

  pause(threadId: number): void {
    this.sendCommand({ command: 'pause', threadId });
  }

  // ---- Stack & variables ----

  getStackTrace(_threadId: number): LoupStackFrame[] {
    return this.stackFrames;
  }

  getScopes(frameId: number): LoupScope[] {
    return [
      { name: 'Locals', variablesReference: frameId * 10 + 1, expensive: false },
      { name: 'Globals', variablesReference: frameId * 10 + 2, expensive: true },
    ];
  }

  getVariables(variablesReference: number): LoupVariable[] {
    return this.variables.get(variablesReference) || [];
  }

  // ---- Evaluation ----

  evaluate(expression: string, frameId?: number): { result: string; type: string; variablesReference: number } {
    this.sendCommand({ command: 'evaluate', expression, frameId });
    return {
      result: `<evaluating: ${expression}>`,
      type: 'string',
      variablesReference: 0,
    };
  }

  // ---- Portal support (Phase 3 prep) ----

  getPortals(): string[] {
    return [];
  }

  activatePortal(name: string): void {
    this.sendCommand({ command: 'activatePortal', name });
  }

  deactivatePortal(name: string): void {
    this.sendCommand({ command: 'deactivatePortal', name });
  }

  activatePortalWithCondition(name: string, condition: string): void {
    this.sendCommand({ command: 'activatePortal', name, condition });
  }

  // ---- Internal ----

  private handleDebugMessage(msg: Record<string, unknown>): void {
    switch (msg['event']) {
      case 'stopped': {
        const reason = msg['reason'] as StopReason;
        const threadId = (msg['threadId'] as number) || 1;

        // Update stack frames from the message
        if (Array.isArray(msg['stackFrames'])) {
          this.stackFrames = (msg['stackFrames'] as Record<string, unknown>[]).map((f, i) => ({
            id: i,
            name: String(f['name'] || '<unknown>'),
            source: String(f['source'] || ''),
            line: Number(f['line'] || 0),
            column: Number(f['column'] || 0),
            execMode: (f['execMode'] as LoupStackFrame['execMode']) || 'interpreted',
            traceLevel: (f['traceLevel'] as LoupStackFrame['traceLevel']) || 'off',
            isPortal: Boolean(f['isPortal']),
            portalName: f['portalName'] as string | undefined,
            portalCondition: f['portalCondition'] as string | undefined,
          }));
        }

        // Update variables
        if (msg['locals'] && typeof msg['locals'] === 'object') {
          const locals: LoupVariable[] = [];
          for (const [name, info] of Object.entries(msg['locals'] as Record<string, Record<string, unknown>>)) {
            locals.push({
              name,
              value: String(info['value'] || ''),
              type: String(info['type'] || 'Any'),
              variablesReference: info['children'] ? this.nextVarRef++ : 0,
            });
          }
          // Store locals for the first frame
          if (this.stackFrames.length > 0) {
            this.variables.set(this.stackFrames[0].id * 10 + 1, locals);
          }
        }

        this.emit('stopOnBreakpoint', threadId, reason);
        break;
      }

      case 'output': {
        const category = (msg['category'] as string) || 'stdout';
        const text = (msg['text'] as string) || '';
        this.emit('output', category, text, msg['source'] as string, msg['line'] as number);
        break;
      }

      case 'breakpointValidated': {
        const bp: LoupBreakpoint = {
          id: msg['id'] as number,
          line: msg['line'] as number,
          verified: msg['verified'] as boolean,
          source: msg['source'] as string,
        };
        this.emit('breakpointValidated', bp);
        break;
      }

      case 'exited': {
        this.running = false;
        this.emit('end');
        break;
      }
    }
  }

  private sendCommand(cmd: Record<string, unknown>): void {
    if (this.process?.stdin?.writable) {
      this.process.stdin.write(JSON.stringify(cmd) + '\n');
    }
  }

  private workingDir(program: string): string {
    const path = require('path');
    return path.dirname(path.resolve(program));
  }
}
