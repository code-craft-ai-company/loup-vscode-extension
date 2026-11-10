import { test } from 'node:test';
import * as assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { manifestPackageName, taskArgs } from '../loupTasks';
import { parseManifest, stripComment } from '../loupManifest';

test('taskArgs: build and test need no file', () => {
  assert.deepEqual(taskArgs({ task: 'build' }), ['build']);
  assert.deepEqual(taskArgs({ task: 'test', args: ['--strict'] }), ['test', '--strict']);
  assert.deepEqual(taskArgs({ task: 'test', file: 'tests' }), ['test', 'tests']);
});

test('taskArgs: run and fmt need a file', () => {
  assert.equal(taskArgs({ task: 'run' }), undefined);
  assert.equal(taskArgs({ task: 'fmt', file: '  ' }), undefined);
  assert.deepEqual(taskArgs({ task: 'run', file: 'main.loup', args: ['--', 'x'] }), ['run', 'main.loup', '--', 'x']);
});

test('taskArgs: an unknown command resolves to nothing', () => {
  assert.deepEqual(taskArgs({ task: 'check' }), ['check']);
  assert.equal(taskArgs({ task: 'repl' }), undefined);
});

test('stripComment keeps # and // inside strings', () => {
  assert.equal(stripComment('a = "x#y" # note'), 'a = "x#y" ');
  assert.equal(stripComment('u = { git = "https://example.org/r.git" }'), 'u = { git = "https://example.org/r.git" }');
  assert.equal(stripComment('# whole line'), '');
});

test('parseManifest reads the sample manifest', () => {
  const text = readFileSync(join(__dirname, '..', 'samples', 'package.lppkg'), 'utf8');
  const m = parseManifest(text);
  assert.equal(m.packageName, 'my-app');
  assert.equal(m.version, '1.20.0');
  assert.equal(m.loupVersion, '>=1.20');
  assert.equal(m.mode, 'host.dual');
  assert.deepEqual(m.deps.map((d) => d.name), ['net.http', 'jsonschema', 'loup.ui']);
  assert.equal(m.devDeps.length, 1);
  assert.ok(m.targets.some((t) => t.name === 'browser' && t.excludes.includes('io.fs')));
});

test('parseManifest: git URL, key = value spelling, CRLF', () => {
  const m = parseManifest('name="pkg"\r\nversion = "2.0.0"\r\n[deps]\r\nu = { git = "https://example.org/r.git" }\r\n');
  assert.equal(m.packageName, 'pkg');
  assert.equal(m.version, '2.0.0');
  assert.equal(m.deps[0].git, 'https://example.org/r.git');
});

test('parseManifest: delivery arrays and quoted dependency keys (§1-13.3)', () => {
  const m = parseManifest(
    'package a\n[deps]\n"loup.webworks" = { path = "../w" }\n[delivery.service]\ninclude = ["io.fs", "net.net"]\nexclude = ["io.proc"]\n'
  );
  assert.equal(m.deps[0].name, 'loup.webworks');
  assert.equal(m.deps[0].path, '../w');
  assert.deepEqual(m.targets[0], { name: 'service', includes: ['io.fs', 'net.net'], excludes: ['io.proc'] });
});

test('manifestPackageName: undefined when the manifest names none', () => {
  assert.equal(manifestPackageName('[deps]\nname = "^1"\n'), undefined);
  assert.equal(manifestPackageName('package my-app\n'), 'my-app');
});

test('the problem matcher reads loup diagnostics, with or without a code', () => {
  const manifest = JSON.parse(readFileSync(join(__dirname, '..', 'packages', 'extension', 'package.json'), 'utf8'));
  const p = manifest.contributes.problemMatchers[0].pattern;
  const re = new RegExp(p.regexp);
  const a = re.exec("/w/bad.loup:2:1: error[E0001]: cannot assign 'string' to binding 'xs' of type 'Int'");
  assert.ok(a);
  assert.deepEqual([a[p.file], a[p.line], a[p.column], a[p.severity], a[p.code]], ['/w/bad.loup', '2', '1', 'error', 'E0001']);
  assert.match(a[p.message], /^cannot assign/);
  const b = re.exec('src/a.loup:10:4: warning: unused binding');
  assert.ok(b);
  assert.equal(b[p.severity], 'warning');
  assert.equal(b[p.message], 'unused binding');
});

test('every file the manifest points at exists', () => {
  const dir = join(__dirname, '..', 'packages', 'extension');
  const manifest = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'));
  const paths: string[] = [manifest.icon];
  for (const l of manifest.contributes.languages) {
    paths.push(l.configuration);
    if (l.icon) paths.push(l.icon.light, l.icon.dark);
  }
  for (const g of manifest.contributes.grammars) paths.push(g.path);
  for (const s of manifest.contributes.snippets) paths.push(s.path);
  for (const p of paths) assert.doesNotThrow(() => readFileSync(join(dir, p)), `missing ${p}`);
});

test('every contributed command is unique and palette entries name real commands', () => {
  const manifest = JSON.parse(
    readFileSync(join(__dirname, '..', 'packages', 'extension', 'package.json'), 'utf8')
  );
  const ids: string[] = manifest.contributes.commands.map((c: { command: string }) => c.command);
  assert.equal(new Set(ids).size, ids.length);
  for (const group of Object.values(manifest.contributes.menus) as { command: string }[][]) {
    for (const item of group) assert.ok(ids.includes(item.command), item.command);
  }
  for (const k of manifest.contributes.keybindings) assert.ok(ids.includes(k.command), k.command);
  const views = manifest.contributes.customEditors.map((e: { viewType: string }) => e.viewType);
  assert.equal(new Set(views).size, views.length);
});
