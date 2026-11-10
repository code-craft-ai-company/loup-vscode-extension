// ============================================================================
// Time-Travel Session Manager — Trace event stream & timeline navigation
// ============================================================================

import * as vscode from 'vscode';

export type TraceEventKind =
  | 'Call'
  | 'Return'
  | 'Line'
  | 'Exception'
  | 'Await'
  | 'Resume'
  | 'Portal'
  | 'Signal';

export interface TraceEvent {
  seq: number;
  timestamp: number;
  kind: TraceEventKind;
  threadId: number;
  source?: string;
  line?: number;
  column?: number;
  functionName?: string;
  portalName?: string;
  signalName?: string;
  signalValue?: string;
  returnValue?: string;
  exceptionType?: string;
  exceptionMessage?: string;
  variables?: Record<string, { value: string; type: string }>;
}

export interface TimeTravelState {
  capturing: boolean;
  replaying: boolean;
  events: TraceEvent[];
  currentIndex: number;
  totalEvents: number;
}

export class TimeTravelManager {
  private state: TimeTravelState = {
    capturing: false,
    replaying: false,
    events: [],
    currentIndex: -1,
    totalEvents: 0,
  };

  private _onDidUpdate = new vscode.EventEmitter<TimeTravelState>();
  readonly onDidUpdate = this._onDidUpdate.event;

  getState(): TimeTravelState {
    return { ...this.state };
  }

  // ---- Capture lifecycle ----

  startCapture(): void {
    this.state.capturing = true;
    this.state.events = [];
    this.state.currentIndex = -1;
    this.state.totalEvents = 0;
    this._onDidUpdate.fire(this.state);
  }

  stopCapture(): void {
    this.state.capturing = false;
    this._onDidUpdate.fire(this.state);
  }

  addEvent(event: TraceEvent): void {
    this.state.events.push(event);
    this.state.totalEvents = this.state.events.length;
    if (!this.state.replaying) {
      this.state.currentIndex = this.state.events.length - 1;
    }
    this._onDidUpdate.fire(this.state);
  }

  // ---- Replay navigation ----

  stepTo(seq: number): TraceEvent | undefined {
    const idx = this.state.events.findIndex(e => e.seq === seq);
    if (idx >= 0) {
      this.state.replaying = true;
      this.state.currentIndex = idx;
      this._onDidUpdate.fire(this.state);
      return this.state.events[idx];
    }
    return undefined;
  }

  stepForward(): TraceEvent | undefined {
    if (this.state.currentIndex < this.state.events.length - 1) {
      this.state.replaying = true;
      this.state.currentIndex++;
      this._onDidUpdate.fire(this.state);
      return this.state.events[this.state.currentIndex];
    }
    return undefined;
  }

  stepBackward(): TraceEvent | undefined {
    if (this.state.currentIndex > 0) {
      this.state.replaying = true;
      this.state.currentIndex--;
      this._onDidUpdate.fire(this.state);
      return this.state.events[this.state.currentIndex];
    }
    return undefined;
  }

  stepBackToCall(): TraceEvent | undefined {
    for (let i = this.state.currentIndex - 1; i >= 0; i--) {
      if (this.state.events[i].kind === 'Call') {
        this.state.replaying = true;
        this.state.currentIndex = i;
        this._onDidUpdate.fire(this.state);
        return this.state.events[i];
      }
    }
    return undefined;
  }

  stepForwardToReturn(): TraceEvent | undefined {
    for (let i = this.state.currentIndex + 1; i < this.state.events.length; i++) {
      if (this.state.events[i].kind === 'Return') {
        this.state.replaying = true;
        this.state.currentIndex = i;
        this._onDidUpdate.fire(this.state);
        return this.state.events[i];
      }
    }
    return undefined;
  }

  stepToNextPortal(): TraceEvent | undefined {
    for (let i = this.state.currentIndex + 1; i < this.state.events.length; i++) {
      if (this.state.events[i].kind === 'Portal') {
        this.state.replaying = true;
        this.state.currentIndex = i;
        this._onDidUpdate.fire(this.state);
        return this.state.events[i];
      }
    }
    return undefined;
  }

  stepToPrevPortal(): TraceEvent | undefined {
    for (let i = this.state.currentIndex - 1; i >= 0; i--) {
      if (this.state.events[i].kind === 'Portal') {
        this.state.replaying = true;
        this.state.currentIndex = i;
        this._onDidUpdate.fire(this.state);
        return this.state.events[i];
      }
    }
    return undefined;
  }

  exitReplay(): void {
    this.state.replaying = false;
    this.state.currentIndex = this.state.events.length - 1;
    this._onDidUpdate.fire(this.state);
  }

  // ---- Filtering ----

  getEventsByKind(kind: TraceEventKind): TraceEvent[] {
    return this.state.events.filter(e => e.kind === kind);
  }

  getCurrentEvent(): TraceEvent | undefined {
    return this.state.events[this.state.currentIndex];
  }

  getEvents(): TraceEvent[] {
    return this.state.events;
  }

  // ---- Load / Save trace recordings (.loup-trace) ----

  async saveRecording(uri: vscode.Uri): Promise<void> {
    const data = JSON.stringify({
      version: '1.20',
      timestamp: Date.now(),
      events: this.state.events,
    }, null, 2);
    await vscode.workspace.fs.writeFile(uri, Buffer.from(data, 'utf-8'));
  }

  async loadRecording(uri: vscode.Uri): Promise<void> {
    const raw = await vscode.workspace.fs.readFile(uri);
    const data = JSON.parse(Buffer.from(raw).toString('utf-8'));
    if (Array.isArray(data.events)) {
      this.state.events = data.events;
      this.state.totalEvents = data.events.length;
      this.state.currentIndex = 0;
      this.state.replaying = true;
      this.state.capturing = false;
      this._onDidUpdate.fire(this.state);
    }
  }
}
