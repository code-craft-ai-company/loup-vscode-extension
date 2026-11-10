// The TextMate grammars, checked against the Loup language spec (core volume
// §1-3 lexical structure, §1-19.1 lexical grammar, §1-13.3 package manifest).
import { test } from 'node:test';
import * as assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import * as tm from 'vscode-textmate';
import * as onig from 'vscode-oniguruma';

const ROOT = join(__dirname, '..');
const SYNTAXES = join(ROOT, 'packages', 'extension', 'syntaxes');
const FILES: Record<string, string> = {
  'source.loup': 'loup.tmLanguage.json',
  'source.loup-pkg': 'loup-pkg.tmLanguage.json',
};

const wasm = readFileSync(require.resolve('vscode-oniguruma/release/onig.wasm'));
const onigLib = onig.loadWASM(wasm.buffer.slice(wasm.byteOffset, wasm.byteOffset + wasm.byteLength)).then(() => ({
  createOnigScanner: (patterns: string[]) => new onig.OnigScanner(patterns),
  createOnigString: (s: string) => new onig.OnigString(s),
}));
const registry = new tm.Registry({
  onigLib,
  loadGrammar: async (scope) =>
    FILES[scope] ? tm.parseRawGrammar(readFileSync(join(SYNTAXES, FILES[scope]), 'utf8'), FILES[scope]) : null,
});

interface Tok { text: string; scopes: string }

async function tokenize(scope: string, text: string): Promise<Tok[]> {
  const grammar = (await registry.loadGrammar(scope))!;
  let stack = tm.INITIAL;
  const out: Tok[] = [];
  for (const line of text.split('\n')) {
    const r = grammar.tokenizeLine(line, stack);
    stack = r.ruleStack;
    for (const t of r.tokens) {
      const piece = line.slice(t.startIndex, t.endIndex);
      if (piece.trim()) out.push({ text: piece, scopes: t.scopes.slice(1).join(' ') });
    }
  }
  return out;
}

/** The scopes of the first token whose text is exactly `text`. */
async function scopeOf(src: string, text: string, scope = 'source.loup'): Promise<string> {
  const tok = (await tokenize(scope, src)).find((t) => t.text === text);
  assert.ok(tok, `no token ${JSON.stringify(text)} in ${JSON.stringify(src)}`);
  return tok.scopes;
}

// §1-3.4: the reserved words.
const KEYWORDS = `abstract and as async attempt await bnot borrow break catch class const continue defer del
do dynamic else enum extern false final finally fn for from func gen global if implements import in
instanceof interface is let lifetime macro match new namespace noescape nonlocal not onstack or override
portal prefer pub return sealed static super struct suspend throw true try type Self this typeof unique
var volatile where while with yield consume reads edits takes shares modifier safe synchronized unsafe
requires atomic unreachable`.split(/\s+/);

test('every reserved word of §1-3.4 is given a scope other than a plain name', async () => {
  for (const kw of KEYWORDS) {
    const toks = await tokenize('source.loup', `${kw} x`);
    const scopes = toks[0].text === kw ? toks[0].scopes : '';
    assert.ok(scopes !== '' && !/^variable\.other/.test(scopes), `${kw}: ${JSON.stringify(scopes)}`);
  }
});

test('words the spec does not reserve stay plain names', async () => {
  for (const word of ['none', 'nil', 'null']) {
    assert.match(await scopeOf(`let ${word} = 1`, word), /^variable\.other/, word);
  }
});

test('contextual keywords are keywords only in their own positions (§1-3.4)', async () => {
  const plain = `get quote box group once distinct excl concurrent compiled native scripted dual
reinterpret size_of arc operator spawn foundation overlay onto part template weak`.split(/\s+/);
  for (const word of plain) {
    assert.match(await scopeOf(`let ${word} = 1`, word), /^variable\.other/, word);
  }
  const inPlace: [string, string][] = [
    ['await group { }', 'group'], ['for concurrent (let i in 0..n) { }', 'concurrent'],
    ['x = spawn work()', 'spawn'], ['import a prefer compiled', 'compiled'],
    ['func k(excl borrow f: S) requires distinct(a, b) { }', 'excl'], ['arc let a = 1', 'arc'],
    ['let b = box v', 'box'], ['macro m(p) { quote { } }', 'quote'],
    ['template overlay O onto Base { }', 'onto'], ['template foundation B { part func p(): void }', 'part'],
    ['operator func +(o: T): T { }', 'operator'], ['get size(): int { }', 'get'], ['size_of[T]()', 'size_of'],
  ];
  for (const [src, word] of inPlace) {
    assert.match(await scopeOf(src, word), /^(meta\.\S+ )?(keyword|storage)\./, `${word} in ${src}`);
  }
});

test('local and shared: class memory strategy, shared constructor, field qualifier (§1-8.1.1, Appendix A)', async () => {
  assert.match(await scopeOf('local class P { }', 'local'), /storage\.modifier/);
  assert.match(await scopeOf('pub shared abstract class V { }', 'shared'), /storage\.modifier/);
  assert.match(await scopeOf('synchronized local class L { }', 'synchronized'), /storage\.modifier/);
  assert.match(await scopeOf('let v = shared Vertex(1.0)', 'shared'), /keyword\.other\.shared-constructor/);
  assert.match(await scopeOf('let v = shared(arena) Vertex(1.0)', 'shared'), /keyword\.other\.shared-constructor/);
  assert.match(await scopeOf('class N { shared var s: T }', 'shared'), /storage\.modifier/);
  // Both Loup compilers reject `local` and `shared` as names ("is a reserved word"), so they are
  // keywords in every position, as the Appendix A keyword table lists them.
  assert.match(await scopeOf('let local = 1', 'local'), /storage\.modifier/);
  assert.match(await scopeOf('f(shared)', 'shared'), /storage\.modifier/);
});

test('every modifier before func or class is scoped, not only the last', async () => {
  const src = 'pub static override final func f(): int { }';
  for (const word of ['pub', 'static', 'override', 'final']) assert.match(await scopeOf(src, word), /storage\.modifier/, word);
  assert.match(await scopeOf(src, 'f'), /entity\.name\.function/);
  assert.match(await scopeOf('operator func +(o: T): T { }', '+'), /entity\.name\.function/);
});

test('a name after a dot is a member, even when the word is reserved elsewhere', async () => {
  assert.match(await scopeOf('F.from(e)', 'from'), /entity\.name\.function\.call/);
  assert.match(await scopeOf('d.get(k)', 'get'), /entity\.name\.function\.call/);
  assert.match(await scopeOf('s.length', 'length'), /variable\.other\.member/);
  assert.match(await scopeOf('for (i in 0..n) { }', 'n'), /^variable\.other\.loup/);
});

test('comments: # line, ## doc, /* block */ without nesting; // is floor division', async () => {
  assert.match(await scopeOf('x # note', '#'), /comment\.line/);
  assert.match(await scopeOf('## doc', '##'), /comment\.line\.documentation/);
  assert.match(await scopeOf('/* a /* b */ let after = 1', 'after'), /^variable\.other/);
  assert.match(await scopeOf('let q = 7 // 2', '//'), /keyword\.operator\.arithmetic/);
});

test('operators of §1-3.7 are whole tokens', async () => {
  const src = 'z = a << 2 >> 1 ** 3; z <<= 1; z >>= 2; z **= 2; z //= 4; z &= 1; z |= 2; z ^= 3; a ?? b; a?.b';
  assert.match(await scopeOf(src, '<<'), /bitwise\.shift/);
  assert.match(await scopeOf(src, '>>'), /bitwise\.shift/);
  assert.match(await scopeOf(src, '**'), /arithmetic/);
  for (const op of ['<<=', '>>=', '**=', '//=', '&=', '|=', '^=']) {
    assert.match(await scopeOf(src, op), /assignment\.compound/, op);
  }
  assert.match(await scopeOf(src, '??'), /null-coalescing/);
  assert.match(await scopeOf(src, '?.'), /optional-chain/);
  assert.match(await scopeOf('f(*args, **kw)', '**'), /spread/);
  assert.match(await scopeOf('let p = a *b', '*'), /arithmetic/);
});

test('numeric literals of §1-19.1, with their suffixes', async () => {
  for (const lit of ['42', '1_000', '42i64', '0xFF_FFu8', '0b1010', '0o17', '10n', '1.5e-3f32', '2.0d', '3e10', '2.5i', '42i', '1.0i32']) {
    assert.match(await scopeOf(`let v = ${lit}`, lit), /constant\.numeric/, lit);
  }
});

test('primitive types of §1-4.1', async () => {
  const types = `int int8 int16 int32 int64 bigint uint uint8 uint16 uint32 uint64 float float32 float64
decimal complex complex32 complex64 bool char string bytes`.split(/\s+/);
  for (const t of types) assert.match(await scopeOf(`let v: ${t} = x`, t), /storage\.type\.primitive/, t);
});

test('string forms: plain, i, r, b, c, with the escapes each allows', async () => {
  assert.match(await scopeOf('"a\\n"', '\\n'), /constant\.character\.escape/);
  assert.match(await scopeOf('"a\\x41"', '\\x'), /invalid/); // \xHH is bytes-only
  assert.match(await scopeOf('b"a\\x41"', '\\x41'), /constant\.character\.escape/);
  assert.match(await scopeOf('"\\u{1F600}"', '\\u{1F600}'), /escape/);
  assert.match(await scopeOf('i"hi {$ name $}"', 'name'), /meta\.template\.expression/);
  assert.match(await scopeOf('r"raw \\n"', 'raw \\n'), /string\.quoted\.double\.raw/);
  assert.match(await scopeOf("c'x'", 'x'), /char/);
});

test('a template fence closes only on a run of the same length', async () => {
  const src = '````(markdown)\n```\ninner\n```\n````\nlet done = 1';
  const toks = await tokenize('source.loup', src);
  assert.match(toks.find((t) => t.text === 'inner')!.scopes, /template-fence/);
  assert.match(toks.find((t) => t.text === 'done')!.scopes, /^variable\.other/);
});

test('identifiers may be any Unicode letters (§1-3.5)', async () => {
  assert.match(await scopeOf('let 名前 = 2', '名前'), /^variable\.other/);
  assert.match(await scopeOf('func café() { }', 'café'), /entity\.name\.function/);
});

test('lifetime labels and the mode directive', async () => {
  assert.match(await scopeOf('func l[lifetime ~src](x: borrow[~src] S) { }', '~src'), /lifetime/);
  assert.match(await scopeOf('@mode(host.native)', 'host.native'), /constant\.language\.mode/);
});

test('the sample files tokenize with nothing marked invalid', async () => {
  for (const [scope, file] of [['source.loup', 'showcase.loup'], ['source.loup-pkg', 'package.lppkg']]) {
    const toks = await tokenize(scope, readFileSync(join(ROOT, 'samples', file), 'utf8'));
    assert.deepEqual(toks.filter((t) => /invalid/.test(t.scopes)), [], file);
  }
});

test('manifest: delivery lists are TOML arrays; a bare directive is marked invalid (§1-13.3)', async () => {
  const pkg = 'source.loup-pkg';
  assert.match(await scopeOf('[delivery.cli]\ninclude = ["io.fs"]', 'io.fs', pkg), /string\.quoted/);
  assert.match(await scopeOf('[delivery.cli]\ninclude io.fs', 'include io.fs', pkg), /invalid/);
  assert.match(await scopeOf('[deps]\n"loup.webworks" = { path = "../w" }', 'path', pkg), /table-key/);
  assert.match(await scopeOf('package   my-app', 'package', pkg), /keyword/);
});
