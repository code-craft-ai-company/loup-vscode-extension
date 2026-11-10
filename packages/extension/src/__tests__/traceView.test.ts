import { describe, it } from 'node:test';
import * as assert from 'node:assert/strict';
import * as fs from 'fs';
import * as path from 'path';
import {
  TraceSession,
  TraceViewError,
  parseQueryResult,
  parseTraceView,
  stripAgentPoint,
} from '../traceView.js';
import { TOOL_SCRIPT, toolInvocation } from '../traceTool.js';

const ROOT = process.cwd();

/** A small view in the tool's shape: two captures, an exception in the first. */
function sample(): string {
  const item = (seq: number, kind: string, site: number, point: string | null, summary: string) => ({
    seq, kind, task: 0, site, step: null, point, summary, detail: { note: summary },
  });
  return JSON.stringify({
    schema_version: 1,
    trace: {
      id: 't1',
      file: 'demo.ltrace',
      identity: { toolchain: '1.30.0', modules: [{ path: 'src/shop.loup', hash: 'ab12' }] },
      recording: { mode: 'armed', executionMode: 'host.scripted', target: 'cli', lane: 'sh.run', threadQuantum: 0, chaosSeed: null },
    },
    sites: [
      { file: 'src/shop.loup', line: 10, column: 5, callable: 'shop.checkout' },
      { file: 'src/shop.loup', line: 14, column: 9, callable: 'shop.checkout' },
      { file: 'src/pricing.loup', line: 3, column: 1, callable: 'pricing.total' },
    ],
    captures: [
      {
        id: 1, portal: 'shop.checkout', ordinal: 1, anchor: 'portal(shop.checkout)#1', task: 0, site: 0,
        exit: 'threw', tasks: [0], bytes: 400, hasCheckpoint: true, lanes: [],
        items: [
          item(0, 'Portal', 0, 'portal(shop.checkout)#1', 'enter shop.checkout'),
          item(1, 'Seam', 1, null, 'fs.read("shop.toml") -> "discount = 150"'),
          item(2, 'Output', 1, 'output#0', 'stdout "Total: -12"'),
          item(3, 'Exception', 1, 'exception#0', 'throw ValueError: negative total'),
        ],
      },
      {
        id: 2, portal: 'shop.checkout', ordinal: 2, anchor: 'portal(shop.checkout)#2', task: 0, site: 0,
        exit: 'returned', tasks: [0, 1], bytes: 380, hasCheckpoint: true,
        lanes: [{ lane: 'sh.run', baseStep: 300, checkpoints: 2 }],
        items: [
          item(0, 'Portal', 0, 'portal(shop.checkout)#2', 'enter shop.checkout'),
          item(1, 'Seam', 1, null, 'fs.read("shop.toml") -> "discount = 10"'),
          item(2, 'Gap', 2, null, 'ffi.round: not recordable'),
          item(3, 'Output', 1, 'output#1', 'stdout "Total: 108"'),
        ],
      },
    ],
    bookmarks: [{ name: 'good-order', anchor: 'portal(shop.checkout)#2', note: 'works', capture: 2 }],
    gaps: [{ capture: 2, seq: 2, seam: 'ffi.round', reason: 'not recordable' }],
  });
}

describe('trace view: parsing', () => {
  it('reads the tool document', () => {
    const v = parseTraceView(sample());
    assert.equal(v.trace.id, 't1');
    assert.equal(v.captures.length, 2);
    assert.equal(v.captures[0].items[3].point, 'exception#0');
    assert.equal(v.captures[1].lanes[0].checkpoints, 2);
    assert.equal(v.trace.recording.chaosSeed, null);
  });

  it('turns the tool\'s error document into an error of that kind', () => {
    const doc = JSON.stringify({ schema_version: 1, error: { kind: 'format', message: 'not a Loup trace: bad magic' } });
    assert.throws(() => parseTraceView(doc), (e: unknown) =>
      e instanceof TraceViewError && e.kind === 'format' && e.message.includes('bad magic'));
  });

  it('refuses another schema version, and says which', () => {
    const doc = JSON.parse(sample());
    doc.schema_version = 2;
    assert.throws(() => parseTraceView(JSON.stringify(doc)), (e: unknown) =>
      e instanceof TraceViewError && e.kind === 'version' && e.message.includes('schema_version 2'));
  });

  it('refuses output that is not JSON or not a view', () => {
    assert.throws(() => parseTraceView('Uncaught Exception: boom'), TraceViewError);
    assert.throws(() => parseTraceView('{"schema_version":1}'), TraceViewError);
    assert.throws(() => parseTraceView('[]'), TraceViewError);
  });

  it('reads query results and query errors', () => {
    const r = parseQueryResult(JSON.stringify({
      schema_version: 1, query: 'seam(fs.read)', count: 2, truncated: false,
      hits: [{ capture: 1, seq: 1, point: null, kind: 'Seam', site: 1, summary: 'fs.read' }],
    }));
    assert.equal(r.count, 2);
    assert.equal(r.hits[0].seq, 1);
    const bad = JSON.stringify({ schema_version: 1, query: 'seam(', error: { kind: 'parse', message: 'expected )' } });
    assert.throws(() => parseQueryResult(bad), (e: unknown) => e instanceof TraceViewError && e.kind === 'parse');
  });
});

describe('trace view: navigation', () => {
  const open = () => new TraceSession(parseTraceView(sample()));

  it('starts at the first exception', () => {
    const s = open();
    assert.deepEqual(s.position(), { capture: 0, item: 3 });
    assert.equal(s.currentPointLabel(), 'exception#0');
    assert.equal(s.currentAgentPoint(), 'pt:t1:exception#0');
  });

  it('steps back and forward, and crosses captures at the edges', () => {
    const s = open();
    assert.equal(s.step('backward')?.kind, 'Output');
    assert.equal(s.step('forward')?.kind, 'Exception');
    assert.equal(s.step('forward')?.point, 'portal(shop.checkout)#2');
    assert.deepEqual(s.position(), { capture: 1, item: 0 });
    assert.equal(s.step('backward')?.kind, 'Exception');
    s.goto(1, 99);
    assert.deepEqual(s.position(), { capture: 1, item: 3 });
    assert.equal(s.step('forward'), undefined);
    assert.deepEqual(s.position(), { capture: 1, item: 3 }, 'a failed step leaves the cursor alone');
    s.goto(0, 0);
    assert.equal(s.step('backward'), undefined);
  });

  it('finds the nearest record of a kind in either direction', () => {
    const s = open();
    assert.equal(s.stepToKind('forward', ['Gap'])?.summary, 'ffi.round: not recordable');
    assert.equal(s.stepToKind('backward', ['Exception'])?.point, 'exception#0');
    assert.equal(s.stepToKind('backward', ['Exception']), undefined);
    assert.equal(s.stepToKind('forward', ['Seam', 'Output'])?.kind, 'Seam');
  });

  it('moves between hits of the same source line', () => {
    const s = open();
    s.goto(0, 1); // src/shop.loup:14
    assert.equal(s.stepToSameLine('forward')?.seq, 2);
    assert.equal(s.stepToSameLine('forward')?.seq, 3);
    assert.equal(s.stepToSameLine('forward')?.summary.includes('discount = 10'), true);
    s.goto(1, 2); // pricing.loup:3 — only hit
    assert.equal(s.stepToSameLine('forward'), undefined);
    assert.equal(s.stepToSameLine('backward'), undefined);
  });

  it('goes to anchors, capture anchors, bookmarks and agent points', () => {
    const s = open();
    assert.equal(s.gotoPoint('output#1')?.summary, 'stdout "Total: 108"');
    assert.equal(s.gotoPoint('portal(shop.checkout)#1')?.seq, 0);
    assert.deepEqual(s.position(), { capture: 0, item: 0 });
    s.gotoPoint('good-order');
    assert.deepEqual(s.position(), { capture: 1, item: 0 });
    assert.equal(s.gotoPoint('  pt:t1:exception#0 ')?.kind, 'Exception');
  });

  it('explains a point it cannot go to', () => {
    const s = open();
    const before = s.position();
    assert.throws(() => s.gotoPoint('exception#7'), (e: unknown) =>
      e instanceof TraceViewError && e.kind === 'no-such-point' &&
      e.message.includes('portal(shop.checkout)#1') && e.message.includes('good-order'));
    assert.throws(() => s.gotoPoint('sh.run@412'), (e: unknown) =>
      e instanceof TraceViewError && e.kind === 'needs-engine');
    assert.throws(() => s.gotoPoint('pt:other:exception#0'), (e: unknown) =>
      e instanceof TraceViewError && e.kind === 'other-trace');
    assert.throws(() => s.gotoPoint('   '), TraceViewError);
    assert.deepEqual(s.position(), before, 'a refused point leaves the cursor alone');
  });

  it('goes to a record by capture id and seq (query hits)', () => {
    const s = open();
    assert.equal(s.gotoSeq(2, 2)?.kind, 'Gap');
    assert.equal(s.gotoSeq(9, 0), undefined);
    assert.equal(s.gotoSeq(2, 77), undefined);
  });

  it('counts kinds and resolves sites', () => {
    const s = open();
    assert.deepEqual(s.kindCounts(0).map((k) => `${k.kind}:${k.count}`), ['Exception:1', 'Output:1', 'Portal:1', 'Seam:1']);
    assert.equal(s.kindCounts().find((k) => k.kind === 'Seam')?.count, 2);
    assert.equal(s.siteOf(s.currentItem())?.file, 'src/shop.loup');
    assert.equal(s.siteOf({ site: -1 }), undefined);
  });

  it('opens an empty trace without failing', () => {
    const doc = JSON.parse(sample());
    doc.captures = [];
    const s = new TraceSession(parseTraceView(JSON.stringify(doc)));
    assert.equal(s.currentItem(), undefined);
    assert.equal(s.step('forward'), undefined);
    assert.equal(s.goto(0, 0), undefined);
    assert.equal(s.currentPointLabel(), '');
  });

  it('keeps another trace\'s agent point apart', () => {
    assert.equal(stripAgentPoint('pt:t1:output#3', 't1'), 'output#3');
    assert.equal(stripAgentPoint('output#3', 't1'), 'output#3');
    assert.throws(() => stripAgentPoint('pt:t2:output#3', 't1'), TraceViewError);
  });
});

describe('trace tool: which command runs', () => {
  const base = { executable: 'loup', toolchainRoot: '', toolCommand: [] as string[], timeoutMs: 1000 };

  it('defaults to `loup debug`', () => {
    const inv = toolInvocation(base, ['view', 'a.ltrace']);
    assert.equal(inv.command, 'loup');
    assert.deepEqual(inv.args, ['debug', 'view', 'a.ltrace']);
  });

  it('runs the tool script from a checkout, with LOUPPATH', () => {
    const inv = toolInvocation({ ...base, toolchainRoot: '/src/loup' }, ['view', 'a.ltrace']);
    assert.deepEqual(inv.args, ['run', path.join('/src/loup', TOOL_SCRIPT), '--allow-fs', '--', 'view', 'a.ltrace']);
    assert.ok(inv.env.LOUPPATH.split(path.delimiter).includes(path.join('/src/loup', 'source')));
  });

  it('lets a full command override both', () => {
    const inv = toolInvocation({ ...base, toolchainRoot: '/src/loup', toolCommand: ['mytool', '--json'] }, ['query', 'a', 'q']);
    assert.equal(inv.command, 'mytool');
    assert.deepEqual(inv.args, ['--json', 'query', 'a', 'q']);
  });
});

describe('trace viewer: the sample trace and the manifest', () => {
  it('opens the checked-in sample view, when present', () => {
    const file = path.join(ROOT, 'samples/traces/demo.ltrace.view.json');
    if (!fs.existsSync(file)) return;
    const s = new TraceSession(parseTraceView(fs.readFileSync(file, 'utf8')));
    assert.ok(s.view.captures.length >= 2, 'the demo has several captures');
    assert.ok(s.itemsOfKind('Exception').length >= 1, 'the demo has an exception');
    assert.equal(s.currentItem()?.kind, 'Exception');
    for (const c of s.view.captures) {
      for (let i = 1; i < c.items.length; i++) {
        assert.ok(c.items[i - 1].seq <= c.items[i].seq, 'items are in seq order');
      }
      for (const it of c.items) {
        assert.ok(it.site === -1 || s.view.sites[it.site], 'every site index resolves');
      }
    }
    const text = fs.readFileSync(file, 'utf8');
    assert.ok(!/9f2c41aa|hunter2|s3cret/i.test(text), 'no secret value in clear');
  });

  it('registers the custom editor, its commands and its settings', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'packages/extension/package.json'), 'utf8'));
    const c = pkg.contributes;
    assert.ok(c.customEditors.some((e: { viewType: string; selector: { filenamePattern: string }[] }) =>
      e.viewType === 'loup.traceViewer' && e.selector[0].filenamePattern === '*.ltrace'));
    const commands = c.commands.map((x: { command: string }) => x.command);
    for (const name of ['loup.trace.open', 'loup.trace.stepBack', 'loup.trace.gotoPoint', 'loup.trace.query']) {
      assert.ok(commands.includes(name), name);
    }
    assert.ok(!commands.some((n: string) => n.startsWith('loup.timeTravel.')), 'the old invented commands are gone');
    for (const key of ['loup.executable', 'loup.toolchainRoot', 'loup.trace.toolCommand']) {
      assert.ok(c.configuration.properties[key], key);
    }
    const src = fs.readFileSync(path.join(ROOT, 'packages/extension/src/extension.ts'), 'utf8');
    for (const name of commands.filter((n: string) => n.startsWith('loup.trace.'))) {
      assert.ok(src.includes(`'${name}'`), `${name} is registered in extension.ts`);
    }
  });

  it('never puts trace text into the page as HTML', () => {
    const js = fs.readFileSync(path.join(ROOT, 'packages/extension/media/traceViewer.js'), 'utf8');
    assert.ok(!/innerHTML|insertAdjacentHTML|document\.write/.test(js));
  });
});
