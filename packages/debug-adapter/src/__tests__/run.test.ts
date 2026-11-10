import { test } from 'node:test';
import * as assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { chmodSync, mkdtempSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { exitLine, runCommandArgs } from '../loupRuntime';

const ROOT = join(__dirname, '..');
const ADAPTER = join(ROOT, 'packages', 'debug-adapter', 'out', 'debugAdapter.js');

test('runCommandArgs: options before the program, program arguments after --', () => {
  assert.deepEqual(runCommandArgs({ program: 'a.loup', runArgs: [], args: [] }), ['run', 'a.loup']);
  assert.deepEqual(runCommandArgs({ program: 'a.loup', runArgs: ['--allow-fs'], args: ['x', 'y'] }), [
    'run', '--allow-fs', 'a.loup', '--', 'x', 'y',
  ]);
});

test('exitLine', () => {
  assert.equal(exitLine(0, null), 'Program exited with code 0.');
  assert.equal(exitLine(null, 'SIGTERM'), 'Program stopped by signal SIGTERM.');
});

interface Msg { type: string; event?: string; command?: string; success?: boolean; message?: string; body?: any }

/** Drive the built adapter over stdio with `requests`; resolve with every message it sent. */
function session(requests: { command: string; arguments?: unknown }[], until: string): Promise<Msg[]> {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [ADAPTER], { stdio: ['pipe', 'pipe', 'inherit'] });
    const got: Msg[] = [];
    let buf = Buffer.alloc(0);
    const timer = setTimeout(() => { child.kill(); reject(new Error('adapter timed out: ' + JSON.stringify(got))); }, 15000);
    child.stdout.on('data', (d: Buffer) => {
      buf = Buffer.concat([buf, d]);
      for (;;) {
        const head = buf.indexOf('\r\n\r\n');
        if (head < 0) return;
        const len = Number(/Content-Length: (\d+)/.exec(buf.subarray(0, head).toString())![1]);
        if (buf.length < head + 4 + len) return;
        const msg = JSON.parse(buf.subarray(head + 4, head + 4 + len).toString()) as Msg;
        buf = buf.subarray(head + 4 + len);
        got.push(msg);
        if (msg.event === until || (msg.type === 'response' && msg.command === until)) {
          clearTimeout(timer);
          child.kill();
          resolve(got);
        }
      }
    });
    requests.forEach((r, i) => {
      const body = JSON.stringify({ seq: i + 1, type: 'request', ...r });
      child.stdin.write(`Content-Length: ${Buffer.byteLength(body)}\r\n\r\n${body}`);
    });
  });
}

/** A stand-in for `loup` that echoes its arguments, writes to stderr, and exits 3. */
function fakeLoup(): string {
  const dir = mkdtempSync(join(ROOT, '.test-out', 'fake-'));
  const file = join(dir, 'loup');
  writeFileSync(file, `#!${process.execPath}\nprocess.stdout.write('args=' + JSON.stringify(process.argv.slice(2)) + '\\n');\nprocess.stderr.write('oops\\n');\nprocess.exit(3);\n`);
  chmodSync(file, 0o755);
  return file;
}

test('launch runs the program, forwards output and reports the exit code', { skip: process.platform === 'win32' }, async () => {
  const program = join(ROOT, 'samples', 'showcase.loup');
  const got = await session(
    [
      { command: 'initialize', arguments: { adapterID: 'loup' } },
      { command: 'launch', arguments: { program, runArgs: ['--allow-all'], args: ['one'], loupExecutable: fakeLoup() } },
      { command: 'configurationDone' },
    ],
    'terminated'
  );
  const out = got.filter((m) => m.event === 'output').map((m) => `${m.body.category}:${m.body.output}`).join('');
  assert.match(out, /stdout:args=\["run","--allow-all",".*showcase\.loup","--","one"\]/);
  assert.match(out, /stderr:oops/);
  assert.match(out, /console:Program exited with code 3\./);
  assert.equal(got.find((m) => m.event === 'exited')?.body.exitCode, 3);
  assert.equal(got.filter((m) => m.event === 'terminated').length, 1);
  assert.equal(got.find((m) => m.command === 'launch')?.success, true);
});

test('a missing loup executable fails the launch with a message that names the setting', async () => {
  const got = await session(
    [
      { command: 'initialize', arguments: { adapterID: 'loup' } },
      { command: 'launch', arguments: { program: 'x.loup', loupExecutable: join(ROOT, 'no-such-loup') } },
    ],
    'launch'
  );
  const launch = got.find((m) => m.command === 'launch')!;
  assert.equal(launch.success, false);
  assert.match(String(launch.body?.error?.format ?? launch.message), /loup\.executable/);
});

test('breakpoints are reported as not set, and attach is refused', async () => {
  const got = await session(
    [
      { command: 'initialize', arguments: { adapterID: 'loup' } },
      { command: 'setBreakpoints', arguments: { source: { path: '/w/a.loup' }, breakpoints: [{ line: 3 }] } },
      { command: 'attach', arguments: {} },
    ],
    'attach'
  );
  const bp = got.find((m) => m.command === 'setBreakpoints')!.body.breakpoints[0];
  assert.equal(bp.verified, false);
  assert.match(bp.message, /cannot stop at breakpoints/);
  assert.equal(got.find((m) => m.command === 'attach')!.success, false);
});
