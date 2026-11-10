// ============================================================================
// Trace view model — the JSON a `.ltrace` file is shown from, and navigation
// over it. No `vscode` import: this module is unit-tested under plain Node.
//
// The JSON is written by the Loup toolchain's trace-view tool
// (`loup_debug view <file.ltrace>`, schema_version 1). The extension never
// parses `.ltrace` bytes itself: the trace library in the toolchain is the
// single reader of that format.
// ============================================================================

export const TRACE_VIEW_SCHEMA_VERSION = 1;

export interface ViewSite {
  file: string;
  line: number;
  column: number;
  callable: string;
}

export interface ViewItem {
  seq: number;
  /** "Seam" | "Sched" | "Output" | "Gap" | an anchor kind | an event kind. */
  kind: string;
  task: number;
  /** Index into `TraceView.sites`, or -1. */
  site: number;
  /** Lane-local step; stored events only. */
  step: number | null;
  /** The point spelling when this item is an anchor (`exception#0`, …). */
  point: string | null;
  summary: string;
  detail: Record<string, string>;
}

export interface ViewLane {
  lane: string;
  baseStep: number;
  checkpoints: number;
}

export interface ViewCapture {
  id: number;
  portal: string;
  ordinal: number;
  /** The capture's own point: `portal(<name>)#<n>`. */
  anchor: string;
  task: number;
  site: number;
  exit: string;
  tasks: number[];
  bytes: number;
  hasCheckpoint: boolean;
  items: ViewItem[];
  lanes: ViewLane[];
}

export interface ViewBookmark {
  name: string;
  anchor: string;
  note: string;
  capture: number;
}

export interface ViewGap {
  capture: number;
  seq: number;
  seam: string;
  reason: string;
}

export interface TraceView {
  schema_version: number;
  trace: {
    id: string;
    file: string;
    identity: { toolchain: string; modules: { path: string; hash: string }[] };
    recording: {
      mode: string;
      executionMode: string;
      target: string;
      lane: string;
      threadQuantum: number;
      chaosSeed: number | null;
    };
  };
  sites: ViewSite[];
  captures: ViewCapture[];
  bookmarks: ViewBookmark[];
  gaps: ViewGap[];
}

export interface QueryHit {
  capture: number;
  seq: number;
  point: string | null;
  kind: string;
  site: number;
  summary: string;
}

export interface QueryResult {
  schema_version: number;
  query: string;
  count: number;
  truncated: boolean;
  /** Hits the recording could not decide (a `where` clause over values it does not hold). */
  unavailable: number;
  hits: QueryHit[];
}

/** What the tool prints instead of a result when it fails. */
export interface ToolError {
  kind: string;
  message: string;
}

export class TraceViewError extends Error {
  constructor(message: string, readonly kind: string = 'format') {
    super(message);
    this.name = 'TraceViewError';
  }
}

// ---- Parsing --------------------------------------------------------------

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function need<T>(cond: T | undefined | null | false, what: string): T {
  if (cond === undefined || cond === null || cond === false) {
    throw new TraceViewError(`not a trace view: ${what}`);
  }
  return cond;
}

function str(v: unknown, what: string): string {
  if (typeof v !== 'string') throw new TraceViewError(`not a trace view: ${what} is not a string`);
  return v;
}

function num(v: unknown, what: string): number {
  if (typeof v !== 'number' || !Number.isFinite(v)) {
    throw new TraceViewError(`not a trace view: ${what} is not a number`);
  }
  return v;
}

function arr(v: unknown, what: string): unknown[] {
  if (!Array.isArray(v)) throw new TraceViewError(`not a trace view: ${what} is not a list`);
  return v;
}

/** The tool's `{error: {kind, message}}` document, when `doc` is one. */
export function toolErrorOf(doc: unknown): ToolError | undefined {
  if (isObject(doc) && isObject(doc.error)) {
    return {
      kind: typeof doc.error.kind === 'string' ? doc.error.kind : 'other',
      message: typeof doc.error.message === 'string' ? doc.error.message : 'the trace tool failed',
    };
  }
  return undefined;
}

function checkVersion(doc: Record<string, unknown>): void {
  const v = doc.schema_version;
  if (v !== TRACE_VIEW_SCHEMA_VERSION) {
    throw new TraceViewError(
      `this trace view has schema_version ${JSON.stringify(v)}; this extension reads version ` +
        `${TRACE_VIEW_SCHEMA_VERSION}. Update the extension or the Loup toolchain so they match.`,
      'version'
    );
  }
}

function parseItem(v: unknown, where: string): ViewItem {
  const o = need(isObject(v) && v, `${where} is not an object`);
  const detail: Record<string, string> = {};
  if (isObject(o.detail)) {
    for (const [k, val] of Object.entries(o.detail)) {
      detail[k] = typeof val === 'string' ? val : JSON.stringify(val);
    }
  }
  return {
    seq: num(o.seq, `${where}.seq`),
    kind: str(o.kind, `${where}.kind`),
    task: num(o.task, `${where}.task`),
    site: typeof o.site === 'number' ? o.site : -1,
    step: typeof o.step === 'number' ? o.step : null,
    point: typeof o.point === 'string' ? o.point : null,
    summary: typeof o.summary === 'string' ? o.summary : '',
    detail,
  };
}

function parseCapture(v: unknown, i: number): ViewCapture {
  const where = `captures[${i}]`;
  const o = need(isObject(v) && v, `${where} is not an object`);
  const items = arr(o.items, `${where}.items`).map((it, k) => parseItem(it, `${where}.items[${k}]`));
  const lanes = Array.isArray(o.lanes)
    ? o.lanes.filter(isObject).map((l) => ({
        lane: typeof l.lane === 'string' ? l.lane : '',
        baseStep: typeof l.baseStep === 'number' ? l.baseStep : 0,
        checkpoints: typeof l.checkpoints === 'number' ? l.checkpoints : 0,
      }))
    : [];
  return {
    id: num(o.id, `${where}.id`),
    portal: str(o.portal, `${where}.portal`),
    ordinal: num(o.ordinal, `${where}.ordinal`),
    anchor: str(o.anchor, `${where}.anchor`),
    task: typeof o.task === 'number' ? o.task : 0,
    site: typeof o.site === 'number' ? o.site : -1,
    exit: typeof o.exit === 'string' ? o.exit : '',
    tasks: Array.isArray(o.tasks) ? o.tasks.filter((t): t is number => typeof t === 'number') : [],
    bytes: typeof o.bytes === 'number' ? o.bytes : 0,
    hasCheckpoint: o.hasCheckpoint === true,
    items,
    lanes,
  };
}

/** Parse and check the tool's `view` document. Throws `TraceViewError`. */
export function parseTraceView(text: string): TraceView {
  let doc: unknown;
  try {
    doc = JSON.parse(text);
  } catch (e) {
    throw new TraceViewError(`the trace tool did not print JSON: ${(e as Error).message}`);
  }
  const o = need(isObject(doc) && doc, 'the document is not an object');
  const err = toolErrorOf(o);
  if (err) throw new TraceViewError(err.message, err.kind);
  checkVersion(o);
  const t = need(isObject(o.trace) && o.trace, 'no `trace` member');
  const identity = isObject(t.identity) ? t.identity : {};
  const recording = isObject(t.recording) ? t.recording : {};
  const sites = arr(o.sites, 'sites').map((s, i) => {
    const so = need(isObject(s) && s, `sites[${i}] is not an object`);
    return {
      file: typeof so.file === 'string' ? so.file : '',
      line: typeof so.line === 'number' ? so.line : 0,
      column: typeof so.column === 'number' ? so.column : 0,
      callable: typeof so.callable === 'string' ? so.callable : '',
    };
  });
  return {
    schema_version: TRACE_VIEW_SCHEMA_VERSION,
    trace: {
      id: str(t.id, 'trace.id'),
      file: typeof t.file === 'string' ? t.file : '',
      identity: {
        toolchain: typeof identity.toolchain === 'string' ? identity.toolchain : '',
        modules: Array.isArray(identity.modules)
          ? identity.modules.filter(isObject).map((m) => ({
              path: typeof m.path === 'string' ? m.path : '',
              hash: typeof m.hash === 'string' ? m.hash : '',
            }))
          : [],
      },
      recording: {
        mode: typeof recording.mode === 'string' ? recording.mode : '',
        executionMode: typeof recording.executionMode === 'string' ? recording.executionMode : '',
        target: typeof recording.target === 'string' ? recording.target : '',
        lane: typeof recording.lane === 'string' ? recording.lane : '',
        threadQuantum: typeof recording.threadQuantum === 'number' ? recording.threadQuantum : 0,
        chaosSeed: typeof recording.chaosSeed === 'number' ? recording.chaosSeed : null,
      },
    },
    sites,
    captures: arr(o.captures, 'captures').map(parseCapture),
    bookmarks: Array.isArray(o.bookmarks)
      ? o.bookmarks.filter(isObject).map((b) => ({
          name: typeof b.name === 'string' ? b.name : '',
          anchor: typeof b.anchor === 'string' ? b.anchor : '',
          note: typeof b.note === 'string' ? b.note : '',
          capture: typeof b.capture === 'number' ? b.capture : -1,
        }))
      : [],
    gaps: Array.isArray(o.gaps)
      ? o.gaps.filter(isObject).map((g) => ({
          capture: typeof g.capture === 'number' ? g.capture : -1,
          seq: typeof g.seq === 'number' ? g.seq : 0,
          seam: typeof g.seam === 'string' ? g.seam : '',
          reason: typeof g.reason === 'string' ? g.reason : '',
        }))
      : [],
  };
}

/** Parse the tool's `query` document. Throws `TraceViewError` (kind `parse`, `needs-engine`, …). */
export function parseQueryResult(text: string): QueryResult {
  let doc: unknown;
  try {
    doc = JSON.parse(text);
  } catch (e) {
    throw new TraceViewError(`the trace tool did not print JSON: ${(e as Error).message}`);
  }
  const o = need(isObject(doc) && doc, 'the document is not an object');
  const err = toolErrorOf(o);
  if (err) throw new TraceViewError(err.message, err.kind);
  checkVersion(o);
  return {
    schema_version: TRACE_VIEW_SCHEMA_VERSION,
    query: typeof o.query === 'string' ? o.query : '',
    count: num(o.count, 'count'),
    truncated: o.truncated === true,
    unavailable: typeof o.unavailable === 'number' ? o.unavailable : 0,
    hits: arr(o.hits, 'hits')
      .filter(isObject)
      .map((h) => ({
        capture: typeof h.capture === 'number' ? h.capture : -1,
        seq: typeof h.seq === 'number' ? h.seq : -1,
        point: typeof h.point === 'string' ? h.point : null,
        kind: typeof h.kind === 'string' ? h.kind : '',
        site: typeof h.site === 'number' ? h.site : -1,
        summary: typeof h.summary === 'string' ? h.summary : '',
      })),
  };
}

// ---- Navigation -----------------------------------------------------------

/** A position in a trace view: a capture (by index) and an item in it (by index). */
export interface Cursor {
  capture: number;
  item: number;
}

export type Direction = 'forward' | 'backward';

/** `pt:<traceId>:<point>` → `<point>`; anything else unchanged. */
export function stripAgentPoint(text: string, traceId: string): string {
  const t = text.trim();
  const prefix = `pt:${traceId}:`;
  if (t.startsWith(prefix)) return t.slice(prefix.length);
  if (t.startsWith('pt:')) {
    // Another trace's point: say so rather than resolving it here by accident.
    const rest = t.slice(3);
    const colon = rest.indexOf(':');
    if (colon > 0) {
      throw new TraceViewError(
        `that point belongs to trace ${rest.slice(0, colon)}, and this is trace ${traceId}`,
        'other-trace'
      );
    }
  }
  return t;
}

/**
 * One open trace and where the reader is in it.
 *
 * It moves over what the FILE holds: recorded inputs, outputs, anchors and any
 * stored events. Locals and the stack at a point come from a replay engine, not
 * from the file, so they are not here.
 */
export class TraceSession {
  private cursor: Cursor = { capture: 0, item: 0 };

  constructor(readonly view: TraceView) {
    this.cursor = this.firstInteresting();
  }

  // ---- Where am I ----

  position(): Cursor {
    return { ...this.cursor };
  }

  currentCapture(): ViewCapture | undefined {
    return this.view.captures[this.cursor.capture];
  }

  currentItem(): ViewItem | undefined {
    return this.currentCapture()?.items[this.cursor.item];
  }

  siteOf(item: { site: number } | undefined): ViewSite | undefined {
    if (!item || item.site < 0) return undefined;
    return this.view.sites[item.site];
  }

  /** The point to show for the cursor: the item's own, else `<capture anchor> + seq`. */
  currentPointLabel(): string {
    const c = this.currentCapture();
    const it = this.currentItem();
    if (!c) return '';
    if (it?.point) return it.point;
    return it ? `${c.anchor} · seq ${it.seq}` : c.anchor;
  }

  /** `pt:<trace>:<point>`, when the cursor is on an anchor (what an agent tool accepts). */
  currentAgentPoint(): string | undefined {
    const it = this.currentItem();
    return it?.point ? `pt:${this.view.trace.id}:${it.point}` : undefined;
  }

  // ---- Summaries ----

  /** Item kinds of one capture (or all), with counts, most frequent first. */
  kindCounts(capture?: number): { kind: string; count: number }[] {
    const counts = new Map<string, number>();
    const caps = capture === undefined ? this.view.captures : [this.view.captures[capture]];
    for (const c of caps) {
      if (!c) continue;
      for (const it of c.items) counts.set(it.kind, (counts.get(it.kind) ?? 0) + 1);
    }
    return [...counts.entries()]
      .map(([kind, count]) => ({ kind, count }))
      .sort((a, b) => b.count - a.count || a.kind.localeCompare(b.kind));
  }

  /** Every item of `kind` across the trace, in order. */
  itemsOfKind(kind: string): { capture: number; item: number; value: ViewItem }[] {
    const out: { capture: number; item: number; value: ViewItem }[] = [];
    this.view.captures.forEach((c, ci) =>
      c.items.forEach((it, ii) => {
        if (it.kind === kind) out.push({ capture: ci, item: ii, value: it });
      })
    );
    return out;
  }

  /** Where a reader should start: the first exception if there is one, else the start. */
  private firstInteresting(): Cursor {
    const ex = this.itemsOfKind('Exception')[0];
    if (ex) return { capture: ex.capture, item: ex.item };
    return { capture: 0, item: 0 };
  }

  // ---- Moving ----

  private set(c: Cursor): ViewItem | undefined {
    this.cursor = c;
    return this.currentItem();
  }

  /** Go to capture index `capture`, item index `item` (clamped). */
  goto(capture: number, item: number): ViewItem | undefined {
    const caps = this.view.captures;
    if (caps.length === 0) return undefined;
    const ci = Math.min(Math.max(0, capture), caps.length - 1);
    const n = caps[ci].items.length;
    const ii = n === 0 ? 0 : Math.min(Math.max(0, item), n - 1);
    return this.set({ capture: ci, item: ii });
  }

  /** Go to the item with sequence number `seq` in the capture with id `captureId`. */
  gotoSeq(captureId: number, seq: number): ViewItem | undefined {
    const ci = this.view.captures.findIndex((c) => c.id === captureId);
    if (ci < 0) return undefined;
    const ii = this.view.captures[ci].items.findIndex((it) => it.seq === seq);
    if (ii < 0) return undefined;
    return this.set({ capture: ci, item: ii });
  }

  /**
   * One item forward or backward. Crosses into the neighbouring capture at an
   * edge; the time between captures was not recorded, and the caller can tell
   * from the changed `position().capture`.
   */
  step(dir: Direction): ViewItem | undefined {
    return this.find(dir, () => true);
  }

  /** The nearest item in `dir` that satisfies `pred`, searching across captures. */
  find(dir: Direction, pred: (it: ViewItem, capture: ViewCapture) => boolean): ViewItem | undefined {
    const caps = this.view.captures;
    const delta = dir === 'forward' ? 1 : -1;
    let ci = this.cursor.capture;
    let ii = this.cursor.item + delta;
    while (ci >= 0 && ci < caps.length) {
      const items = caps[ci].items;
      while (ii >= 0 && ii < items.length) {
        if (pred(items[ii], caps[ci])) return this.set({ capture: ci, item: ii });
        ii += delta;
      }
      ci += delta;
      if (ci >= 0 && ci < caps.length) {
        ii = delta > 0 ? 0 : caps[ci].items.length - 1;
      }
    }
    return undefined;
  }

  /** The nearest item of one of `kinds` in `dir`. */
  stepToKind(dir: Direction, kinds: string[]): ViewItem | undefined {
    return this.find(dir, (it) => kinds.includes(it.kind));
  }

  /** The nearest item in `dir` at the same source line as the cursor (another hit of this line). */
  stepToSameLine(dir: Direction): ViewItem | undefined {
    const here = this.siteOf(this.currentItem());
    if (!here) return undefined;
    return this.find(dir, (it) => {
      const s = this.siteOf(it);
      return !!s && s.file === here.file && s.line === here.line;
    });
  }

  /** The first item of the next or previous capture. */
  stepCapture(dir: Direction): ViewItem | undefined {
    const ci = this.cursor.capture + (dir === 'forward' ? 1 : -1);
    if (ci < 0 || ci >= this.view.captures.length) return undefined;
    return this.set({ capture: ci, item: 0 });
  }

  /**
   * Go to a point written the one way points are written: an anchor
   * (`exception#0`, `portal(shop.checkout)#2`, `output#3`), a bookmark name, or
   * the agent form `pt:<trace>:<point>`. Throws `TraceViewError` naming what the
   * file does hold when the point is not in it.
   */
  gotoPoint(text: string): ViewItem | undefined {
    const point = stripAgentPoint(text, this.view.trace.id);
    if (point.length === 0) throw new TraceViewError('no point given', 'usage');

    const bookmark = this.view.bookmarks.find((b) => b.name === point);
    const target = bookmark ? bookmark.anchor : point;

    for (let ci = 0; ci < this.view.captures.length; ci++) {
      const c = this.view.captures[ci];
      const ii = c.items.findIndex((it) => it.point === target);
      if (ii >= 0) return this.set({ capture: ci, item: ii });
    }
    // A capture's own anchor names its start.
    const ci = this.view.captures.findIndex((c) => c.anchor === target);
    if (ci >= 0) return this.set({ capture: ci, item: 0 });

    if (/@\d+$/.test(target) || /^\d+$/.test(target)) {
      throw new TraceViewError(
        `${target} is a lane-local step. A step is resolved by a replay engine, and this view shows ` +
          `the file alone. Use an anchor such as ${this.sampleAnchors().join(', ')}.`,
        'needs-engine'
      );
    }
    throw new TraceViewError(
      `no point ${target} in this trace. It holds ${this.sampleAnchors().join(', ')}` +
        (this.view.bookmarks.length > 0
          ? ` and the bookmarks ${this.view.bookmarks.map((b) => b.name).join(', ')}.`
          : '.'),
      'no-such-point'
    );
  }

  private sampleAnchors(): string[] {
    const out: string[] = [];
    for (const c of this.view.captures) {
      out.push(c.anchor);
      for (const it of c.items) {
        if (it.point && it.point !== c.anchor && out.length < 6) out.push(it.point);
      }
      if (out.length >= 6) break;
    }
    return out.slice(0, 6);
  }
}
