// ============================================================================
// Time-Travel Manager — Manages capture server and trace file replay
// ============================================================================

import * as vscode from 'vscode';
import * as path from 'path';

export interface TraceEvent {
  timestamp: number;
  kind: 'line' | 'call' | 'return' | 'portal_enter' | 'portal_exit' | 'exception' | 'spawn' | 'await';
  portal?: string;
  source: string;
  line: number;
  column?: number;
  functionName?: string;
  data?: Record<string, unknown>;
}

export interface CaptureSession {
  id: string;
  startTime: number;
  endTime?: number;
  events: TraceEvent[];
  portals: string[];
  filePath?: string;
}

export class TimeTravelManager {
  private sessions = new Map<string, CaptureSession>();
  private activeSession: CaptureSession | null = null;
  private _onSessionChanged = new vscode.EventEmitter<CaptureSession | null>();
  readonly onSessionChanged = this._onSessionChanged.event;

  // ---- Capture ----

  startCapture(): CaptureSession {
    const session: CaptureSession = {
      id: `capture-${Date.now()}`,
      startTime: Date.now(),
      events: [],
      portals: [],
    };
    this.sessions.set(session.id, session);
    this.activeSession = session;
    this._onSessionChanged.fire(session);
    return session;
  }

  stopCapture(): CaptureSession | null {
    if (this.activeSession) {
      this.activeSession.endTime = Date.now();
      const session = this.activeSession;
      this.activeSession = null;
      this._onSessionChanged.fire(null);
      return session;
    }
    return null;
  }

  addEvent(event: TraceEvent): void {
    if (this.activeSession) {
      this.activeSession.events.push(event);
      if (event.portal && !this.activeSession.portals.includes(event.portal)) {
        this.activeSession.portals.push(event.portal);
      }
    }
  }

  // ---- Trace file ----

  async loadTraceFile(filePath: string): Promise<CaptureSession> {
    const uri = vscode.Uri.file(filePath);
    const content = await vscode.workspace.fs.readFile(uri);
    const text = new TextDecoder().decode(content);
    const data = JSON.parse(text);

    const session: CaptureSession = {
      id: path.basename(filePath, '.loup-trace'),
      startTime: data.startTime || 0,
      endTime: data.endTime,
      events: data.events || [],
      portals: data.portals || [],
      filePath,
    };

    this.sessions.set(session.id, session);
    return session;
  }

  async saveTraceFile(sessionId: string, filePath: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error(`Session ${sessionId} not found`);

    const data = {
      version: 1,
      startTime: session.startTime,
      endTime: session.endTime,
      portals: session.portals,
      events: session.events,
    };

    const uri = vscode.Uri.file(filePath);
    const content = new TextEncoder().encode(JSON.stringify(data, null, 2));
    await vscode.workspace.fs.writeFile(uri, content);
    session.filePath = filePath;
  }

  // ---- Query ----

  getSession(id: string): CaptureSession | undefined {
    return this.sessions.get(id);
  }

  getActiveSession(): CaptureSession | null {
    return this.activeSession;
  }

  getAllSessions(): CaptureSession[] {
    return Array.from(this.sessions.values());
  }

  getEventsForPortal(sessionId: string, portalName: string): TraceEvent[] {
    const session = this.sessions.get(sessionId);
    if (!session) return [];
    return session.events.filter(e => e.portal === portalName);
  }

  getEventsInRange(sessionId: string, startTime: number, endTime: number): TraceEvent[] {
    const session = this.sessions.get(sessionId);
    if (!session) return [];
    return session.events.filter(e => e.timestamp >= startTime && e.timestamp <= endTime);
  }

  getEventAtIndex(sessionId: string, index: number): TraceEvent | undefined {
    const session = this.sessions.get(sessionId);
    if (!session) return undefined;
    return session.events[index];
  }
}
