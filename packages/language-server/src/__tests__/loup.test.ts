import { describe, it } from 'node:test';
import * as assert from 'node:assert/strict';
import * as fs from 'fs';
import * as path from 'path';
import { Lexer, TokenKind, isReservedWord } from '../parser/lexer.js';
import { Parser } from '../parser/parser.js';
import { SymbolTable } from '../symbols/symbolTable.js';
import { analyze, computeDiagnostics, getWordAtOffset, importInsertLine, isManifestUri, splitTopLevel } from '../analysis.js';
import { computeFoldingRanges } from '../folding.js';
import { formatSource } from '../formatting.js';
import { classifyTokens } from '../semanticTokens.js';

const ROOT = process.cwd();

describe('Loup VSCode Extension Manifest & Grammars', () => {
  it('registers all five mode-flavored source extensions and .lppkg manifest', () => {
    const extPkg = JSON.parse(
      fs.readFileSync(path.join(ROOT, 'packages/extension/package.json'), 'utf8')
    );
    assert.equal(extPkg.name, 'loup-lang');
    assert.equal(extPkg.version, '1.21.0');

    const loupLang = extPkg.contributes.languages.find((l: { id: string }) => l.id === 'loup');
    assert.ok(loupLang);
    assert.deepEqual(loupLang.extensions, ['.loup']);
    // Each mode-flavored extension is its own language id, so each has its own file icon.
    const sourceExts = extPkg.contributes.languages
      .filter((l: { id: string }) => l.id !== 'loup-pkg')
      .flatMap((l: { extensions: string[] }) => l.extensions);
    assert.deepEqual(sourceExts, ['.loup', '.lpscr', '.lpfree', '.lpweb', '.lphc']);

    const pkgLang = extPkg.contributes.languages.find((l: { id: string }) => l.id === 'loup-pkg');
    assert.ok(pkgLang);
    assert.ok(pkgLang.extensions.includes('.lppkg'));
    assert.ok(pkgLang.filenames.includes('package.lppkg'));
  });

  it('provides valid TextMate grammars for source.loup and source.loup-pkg', () => {
    const loupGrammar = JSON.parse(
      fs.readFileSync(path.join(ROOT, 'packages/extension/syntaxes/loup.tmLanguage.json'), 'utf8')
    );
    assert.equal(loupGrammar.scopeName, 'source.loup');
    assert.deepEqual(loupGrammar.fileTypes, ['loup', 'lpscr', 'lpfree', 'lpweb', 'lphc']);

    const pkgGrammar = JSON.parse(
      fs.readFileSync(path.join(ROOT, 'packages/extension/syntaxes/loup-pkg.tmLanguage.json'), 'utf8')
    );
    assert.equal(pkgGrammar.scopeName, 'source.loup-pkg');
    assert.ok(pkgGrammar.fileTypes.includes('lppkg'));
  });
});

describe('Loup v1.20 Lexer & Parser', () => {
  it('lexes # comments, ## doc comments, // floor division, and complex literals', () => {
    const src = [
      '## Doc comment',
      '# Single-line comment',
      'let q = 17 // 3;',
      'let z: complex = 1.5 + 2.3i;',
      'let c32: complex32 = 1.0i32;',
      'let ch: char = c"A";',
    ].join('\n');

    const tokens = new Lexer(src).tokenize();
    assert.ok(tokens.some(t => t.kind === TokenKind.DocComment));
    assert.ok(tokens.some(t => t.kind === TokenKind.LineComment));
    assert.ok(tokens.some(t => t.kind === TokenKind.SlashSlash));
    assert.ok(tokens.some(t => t.kind === TokenKind.FloatLiteral && t.text === '2.3i'));
    assert.ok(tokens.some(t => t.kind === TokenKind.FloatLiteral && t.text === '1.0i32'));
    assert.ok(tokens.some(t => t.kind === TokenKind.CharLiteral && t.text === 'c"A"'));
  });

  it('parses all seven @mode directives cleanly', () => {
    const modes = [
      'web.scripted',
      'web.compiled',
      'host.scripted',
      'host.dual',
      'host.native',
      'freestanding',
      'portable',
    ];
    for (const mode of modes) {
      const { diagnostics } = new Parser().parse(`@mode(${mode})\nconst X: int = 1;\n`);
      assert.deepEqual(diagnostics, []);
    }
  });

  it('parses test.loup and samples/showcase.loup with zero diagnostics', () => {
    for (const relPath of ['test.loup', 'samples/showcase.loup']) {
      const content = fs.readFileSync(path.join(ROOT, relPath), 'utf8');
      const { program, diagnostics } = new Parser().parse(content);
      assert.deepEqual(diagnostics, []);
      const symbols = new SymbolTable().build(program);
      assert.ok(symbols.length > 0);
    }
  });
});

// ---------------------------------------------------------------------------
// Regression tests: each case below was a false diagnostic, a crash or a hang
// before the parser was brought in line with §1-19 of the language reference.
// ---------------------------------------------------------------------------

function messages(source: string): string[] {
  return computeDiagnostics(source).map(d => d.message);
}

function assertClean(source: string): void {
  assert.deepEqual(messages(source), [], source);
}

function withTimeLimit<T>(limitMs: number, run: () => T): T {
  const started = Date.now();
  const result = run();
  const elapsed = Date.now() - started;
  assert.ok(elapsed < limitMs, `took ${elapsed} ms (limit ${limitMs} ms)`);
  return result;
}

describe('Lexer: §1-3.4 keywords and §1-19.1 literals', () => {
  it('does not turn Object.prototype member names into keyword tokens', () => {
    for (const name of ['constructor', 'toString', 'valueOf', 'hasOwnProperty', '__proto__']) {
      const [tok] = new Lexer(name).tokenize();
      assert.equal(tok.kind, TokenKind.Identifier, name);
    }
    assertClean('class Node { pub func constructor(left: int) { this.left = left; } }');
  });

  it('lexes `local` and `shared` as keywords; `fun` and `none` as ordinary identifiers', () => {
    assert.equal(new Lexer('local').tokenize()[0].kind, TokenKind.Local);
    assert.equal(new Lexer('shared').tokenize()[0].kind, TokenKind.Shared);
    assert.ok(isReservedWord('local') && isReservedWord('shared') && isReservedWord('where'));
    for (const name of ['fun', 'none']) {
      assert.equal(new Lexer(name).tokenize()[0].kind, TokenKind.Identifier, name);
      assert.ok(!isReservedWord(name));
    }
    assert.ok(!isReservedWord('get') && !isReservedWord('val') && !isReservedWord('group'));
    assertClean('let none = 3; let fun = 4; let val = 5;');
  });

  it('accepts Unicode letters and digits in identifiers (§1-3.5)', () => {
    const tokens = new Lexer('let café = 名前٣;').tokenize();
    assert.deepEqual(tokens.slice(0, 4).map(t => t.text), ['let', 'café', '=', '名前٣']);
    assert.ok(!tokens.some(t => t.kind === TokenKind.Error));
    assertClean('let café = 1; let 名前 = café;');
  });

  it('lexes every multi-character operator of §1-3.7 as one token', () => {
    const ops = ['<<', '>>', '<<=', '>>=', '**', '**=', '//', '//=', '&=', '|=', '^=', '??', '?.', '..', '..=', '...', '=>', '==', '!=', '<=', '>='];
    for (const op of ops) {
      const tokens = new Lexer(`a ${op} b`).tokenize();
      assert.equal(tokens.length, 4, op);
      assert.equal(tokens[1].text, op);
    }
    assertClean('let a = 17 // 3; a //= 2; a <<= 1; a >>= 1; a **= 2; let b = x ?? y?.z?.[0]; let d = v as? T; let e = g()?;');
  });

  it('lexes numeric suffixes: 42i32 is an int, 42i and 1.5i32 are imaginary', () => {
    const kinds = (src: string) => new Lexer(src).tokenize().slice(0, -1).map(t => `${t.kind}:${t.text}`);
    assert.deepEqual(kinds('42i32'), ['IntLiteral:42i32']);
    assert.deepEqual(kinds('42i'), ['FloatLiteral:42i']);
    assert.deepEqual(kinds('1.5i32'), ['FloatLiteral:1.5i32']);
    assert.deepEqual(kinds('0xFF_FFu8 0b1_0 0o17 3n 2d 1.0f32 1e-3'),
      ['IntLiteral:0xFF_FFu8', 'IntLiteral:0b1_0', 'IntLiteral:0o17', 'IntLiteral:3n', 'FloatLiteral:2d', 'FloatLiteral:1.0f32', 'FloatLiteral:1e-3']);
    // `e` with no exponent digits is not an exponent
    assert.deepEqual(kinds('1else'), ['IntLiteral:1', 'else:else']);
  });

  it('lexes prefixed strings in both quote styles and nested quotes in interpolation', () => {
    const kinds = (src: string) => new Lexer(src).tokenize().slice(0, -1).map(t => t.kind);
    assert.deepEqual(kinds(`i'a' r"b\\" b'\\x00' c'x' c"y"`),
      ['InterpolatedStringLiteral', 'RawStringLiteral', 'BytesLiteral', 'CharLiteral', 'CharLiteral']);
    // the inline expression holds a string literal of its own
    const tokens = new Lexer('let s = i"a {$ d["k"] $} b";').tokenize();
    assert.equal(tokens[3].kind, TokenKind.InterpolatedStringLiteral);
    assert.equal(tokens[3].text, 'i"a {$ d["k"] $} b"');
    assertClean('let s = i"a {$ d["k"] $} b";');
  });

  it('closes a template fence only on a run of exactly N backticks', () => {
    const src = 'let t = ````(text)\n```inner```\n````;\nlet after = 1;';
    const fence = new Lexer(src).tokenize().find(t => t.kind === TokenKind.TemplateFenceOpen)!;
    assert.ok(fence.text.endsWith('````'));
    assert.ok(fence.text.includes('```inner```'));
    assert.equal(fence.endLine, 2);
    assertClean(src);
  });

  it('does not nest block comments, and treats // as floor division, not a comment', () => {
    assertClean('/* a /* b */ let x = 1;');
    const tokens = new Lexer('let q = 17 // 3;').tokenize();
    assert.ok(!tokens.some(t => t.kind === TokenKind.LineComment));
  });

  it('distinguishes obj!{field} from a force-unwrap before a block', () => {
    assertClean('let a = x!{name}; let b = x!{"name"};');
    assertClean('let a = match x! { _ => 1 };');
    assertClean('let val = d!.name; let c = back.capture(1)!; let s = v! as? string;');
  });

  it('records the end position of multi-line tokens', () => {
    const tok = new Lexer('"""\n  body\n  """ + 1').tokenize()[0];
    assert.equal(tok.line, 0);
    assert.equal(tok.endLine, 2);
    assert.equal(tok.endColumn, 5);
  });
});

describe('Parser: valid Loup produces no diagnostics', () => {
  it('accepts contextual keywords as ordinary identifiers (§1-3.4)', () => {
    assertClean('let r = d.get(k); d.set(k, 1); let group = 1; var part: int = 2; let once = 3; let box = 4;');
    assertClean('let quote = 1; let operator = 3; let arc = 4; let excl = 5; let weak = 6; let unowned = 7;');
    assertClean('let concurrent = 1; let distinct = 2; let compiled = 3; let scripted = 4; let dual = 5; let freestanding = 6;');
    assertClean('let val = 1; let js = 2; let native = 3; let asm = 4; let size_of = 5; let reinterpret = 6; let noreturn = 7; let impossible = 8;');
    assertClean('x.from(e); x.spawn(); x.new(); x.template(); x.type; let n = obj.match;');
    assertClean('class C { func spawn(): int { return 1; } func get(k: int): int { return k; } func set(v: int): void { } let spawn: int = 0; }');
    assertClean('func map(self: int, get: int, set: int, modifier: int): int { return self; }');
  });

  it('accepts the class memory-strategy modifiers and the shared allocation prefix (§1-8.1.1)', () => {
    assertClean('shared class A {} local class B {} pub shared abstract class C {} synchronized local class D {}');
    assertClean('let x = shared Foo(1); let y = shared(arena) Foo(2);');
    assertClean('class E { shared var x: T; pub shared let y: T = z; }');
  });

  it('accepts statements ended by a newline or by the closing brace (§1-19.4)', () => {
    assertClean('func f(): int {\n  let x = 1\n  return x\n}');
    assertClean('func f(): int { return 1 }');
    assert.deepEqual(messages('func f() { g() h() }'), ["Expected ';' but found 'h'"]);
  });

  it('accepts match arms with block bodies, guards, qualified variants and jumps', () => {
    assertClean('func f(a: Axis): bool { match a { Axis.Horizontal => { return true; } Axis.Vertical => { return false; } } }');
    assertClean('let v = match x { Some(v) => { let rr = v * v; rr * 3 }, None => 0 };');
    assertClean('let v = match x { n if (n > 1) => 3, A => return 1, _ => throw E() };');
    assertClean('let v = match p { Point(x=px, y=_) => px, Shape.Circle{ radius: r } => r, (a, b) => a, [h, *t] => h, _ => unreachable };');
    assertClean('let m = match k { "a" => {"k": 1}, _ => {} };');
  });

  it('has no ternary operator: postfix ? is propagation', () => {
    assertClean('func f(): Result[int, E] { let x = g()?; return Ok(x); }');
    assert.ok(messages('let x = a ? b : c;').length > 0);
  });

  it('accepts if blocks in value position and `if const`', () => {
    assertClean('let x = if (a) { 1 } else if (b) { 2 } else { 3 };');
    assertClean('func f() { if const (N > 1) { g(); } else if (b) { h(); } }');
  });

  it('accepts every call-argument form', () => {
    assertClean('let p = Parser(takes: Lexer.tokenize(src)); damagePut(edits: d, d.count, r);');
    assertClean('f(a = 1, b: 2, *rest, **named); g(reads(a, b), distinct(a, b), @unsafe("aliasing checked"));');
    assertClean('p.set(.srcPort, src); let t = x.0; let u = a[1, 2:3, ::2]; let w = s with (a = 1);');
    assertClean('let r = __staticMeta__.typeOf[T](); let n = TreeNode[~tree](value=0, parent=None);');
  });

  it('accepts lambdas and comprehensions', () => {
    assertClean('let f = func(x) => x; let g = func(x: int): int => x * 2; let h = func(x: int): int { return x; };');
    assertClean('let a = async func() { }; let g = gen func(): Iterable[int] { yield 10; };');
    assertClean('fs.push(func(): int { return k * 10 + v; });');
    assertClean('let xs = [x * 2 for (x in ys) if (x > 1)]; let zs = [x for x in 0..3]; let d = {k: v for ((k, v) in ps)}; let s = {x for (x in ys)};');
  });

  it('accepts every loop header form (§1-19.4, §1-19.18)', () => {
    assertClean('func f() { for (let i in xs) { } for (i in xs) { } for (var [a, b] in ys) { } for ((k, v) in ps) { } }');
    assertClean('func f() { for (let i = 0; i < 3; i += 1) { } for (;;) { } outer: for (x in xs) { break outer; } }');
    assertClean('async func f() { for await (x in s) { } for concurrent (let i in 0..n) { } }');
    assertClean('func f() { while (a) { } do { } while (b); }');
  });

  it('accepts function signatures with verbs, lifetimes, contracts and bounds', () => {
    assertClean('func uartWrite(volatile borrow uart: UartRegs, byte: uint8): void { }');
    assertClean('func f(volatile: int, excl borrow r: Reg, borrow[~a] s: S, edits d: D, takes t: T): int { return 1; }');
    assertClean('func ltw[T](a: T, b: T): bool where T: Comparable { return a < b; }');
    assertClean('func f[T: A + B, lifetime ~a, N: int](x: borrow[~a] T): T where T: C + D { return x; }');
    assertClean('func f(x: int) requires distinct(a, b), reads(a) : int { return x; }');
    assertClean('pub func hkdf(hmacFn: func(list[int], list[int]): list[int], n: int): list[int] { return []; }');
    assertClean('const func square(x: int): int { return x * x; }');
  });

  it('accepts type expressions of §1-19.7', () => {
    assertClean('type A = int | string | None; type F = fn(int, x: string): bool; type G = async fn(): void; type H = (int | string)?;');
    assertClean('let x: a.b.C[int] = 1; let price: decimal(11, 2) = 19; onstack var t: buffer[uint64, 1536]; let u: uint = 0;');
    assertClean('let f: func(buffer[uint64, _]): uint64 = fixed; let m: array[float, 2, order: RowMajor] = z;');
  });

  it('accepts class, struct, enum, interface and template bodies', () => {
    assertClean('class C : B implements D, E { new(id: int) { this.id = id; } pub new() { } get p(): int { return 1; } set p(v: int) { } pub static let N: int = 1; weak var w: C?; unowned[~o] var u: C; pub override func m(): int { return super.m() + 1; } modifier func inc() { } reads func me(): C { return self; } }');
    assertClean('class C { operator func [](i: int): int { return 1; } operator func []=(i: int, v: int) { } operator func ()(x: int): int { return 1; } operator func ==(o: C): bool { return true; } pub static operator func +(a: C, b: C): C { return a; } }');
    assertClean('pub struct NodeId implements Equatable[NodeId], Hashable { pub a: int; pub var l: list[int] = []; pub borrow[~a] z: T; x: int; func f(): int { return 1; } }');
    assertClean('enum Either[A, B] { Left(A); Right(B); } enum E { None, Some(int), Poly(list[int]), Named(x: int, y: string) }');
    assertClean('interface Solid : Shape, Named { func volume(): int; func name(): string { return "s"; } type Item; get p(): int; modifier func m(); func pick(x: T): string where T: Show; }');
    assertClean('pub template foundation W implements Poker { let n: int = 0; part func poke(): void; part func tick(): void { } } template overlay X onto W { func extra(): void { } }');
    assertClean('final sealed class Shape { pub var n: int = 1; } abstract class A { abstract func f(): int; } dynamic class D { } unique class U { }');
  });

  it('accepts module-level forms: imports, namespaces, externs, annotations, macros', () => {
    assertClean('@mode(host.native)\nnamespace a.b;\nfrom core.text import (split, join as j,);\nfrom . import (x);\nfrom ..pkg.mod defer import (y);\nimport core.math as m;\npub from core.text import (trim);');
    assertClean('from pkg { mod.a import (A); mod.b import (B) prefer compiled; }');
    assertClean('namespace u { pub class B { pub var v: int = 3; } pub func double(x: int): int { return x * 2; } }');
    assertClean('extern js func alert(msg: string): void;\nextern js val document: Any;\npub extern native "c" func labs(x: int): int;\nextern native "m" val M_PI: float;');
    assertClean('@interchange(endianness: BigEndian, charset: Ascii)\nstruct R { @field(offset: 0, length: 5, picture: "9(5)") id: int; }');
    assertClean('macro square(x) { quote { ${x} * ${x} } }\nlet y = square!(3 + 1);');
  });

  it('accepts the block statements of §1-19.4', () => {
    assertClean('func f() { asm { "strh w1, [x0]" "ret" clobbers: ["memory"] } unsafe("asm: halt") asm { "cli" "hlt" } }');
    assertClean('func f() { atomic { n += 1; } safe { g(); } unsafe("threadSafe: lock released") { return; } }');
    assertClean('async func f() { await group { spawn g(); } portal p { } portal "q" { } defer { h(); } defer h(); }');
    assertClean('func f() { try { g(); } catch (E as e) { } catch (A | B as e) { } catch Err(e: T) { } catch (e) { } catch { } finally { } }');
    assertClean('func f() { with (a = open(), b = open()) { } dynamic obj as d { d.x = 1; } del m[k]; throw E("x") from cause; }');
    assertClean('@vectorize for (i in xs) { }');
  });
});

describe('Parser: reserved words as names (§1-3.4)', () => {
  it('reports a reserved word that names a binding, once, and parses on', () => {
    for (const word of ['local', 'shared', 'where', 'spawn', 'type', 'class', 'this', 'unsafe', 'template', 'suspend']) {
      assert.deepEqual(messages(`func main(): void { let ${word} = 3; println("ran"); }`),
        [`\`${word}\` is a reserved word (§1-3.4) and cannot name a binding`]);
    }
    assert.deepEqual(messages('func f(where: int): void { }'), ['`where` is a reserved word (§1-3.4) and cannot name a parameter']);
    assert.deepEqual(messages('class type { }'), ['`type` is a reserved word (§1-3.4) and cannot name a type']);
    assert.deepEqual(messages('enum E { A, class }'), ['`class` is a reserved word (§1-3.4) and cannot name an enum variant']);
  });

  it('keeps the contextual carve-outs legal', () => {
    assertClean('class C { static func from(e: int): C { return C(); } func new(): int { return 1; } func template(): int { return 2; } }');
    assertClean('enum Option2 { Some(int), None }');
    assertClean('var noreturn = 3; let impossible = 4;');
  });
});

describe('Parser: malformed input', () => {
  it('terminates on input that made the old parser loop until memory ran out', () => {
    for (const src of ['let (1', 'let [1', 'let {1', 'with (1', 'func main(): void { let (this, b) = (1, 2); }']) {
      withTimeLimit(2000, () => new Parser().parse(src));
    }
    assert.ok(messages('let (1').length > 0);
  });

  it('terminates quickly on truncations of a real program and on deep nesting', () => {
    const content = fs.readFileSync(path.join(ROOT, 'samples/showcase.loup'), 'utf8');
    withTimeLimit(10000, () => {
      for (let cut = 0; cut < content.length; cut += 37) {
        const { program } = new Parser().parse(content.slice(0, cut));
        new SymbolTable().build(program);
      }
    });
    const pathological = [
      '('.repeat(5000), '['.repeat(5000), '{'.repeat(5000), 'f('.repeat(3000), 'a+'.repeat(50000) + 'a',
      'if (a) {} else '.repeat(20000) + '{}', 'x = '.repeat(5000) + '1', 'a ? '.repeat(3000),
      'match x { '.repeat(2000), 'func f() { '.repeat(3000), 'let x: ' + 'list['.repeat(3000),
      '!'.repeat(10000) + 'a', 'a' + '.b'.repeat(50000), 'a' + '(1)'.repeat(50000), '"' + 'a'.repeat(100000),
      '', ' ', '\n', '@', '@a(', '${', '\\', '\u0000', '\ud83d', 'a.', 'for (', 'from', '```', '"""', 'i"{$',
    ];
    for (const src of pathological) {
      withTimeLimit(5000, () => new Parser().parse(src));
    }
  });

  it('reports one diagnostic for one broken statement and keeps the rest of the file', () => {
    const src = 'func ok(): int { return 1; }\nfunc broken() {\n  let x = ;\n  let y = 2;\n}\nfunc alsoOk(): int { return 2; }\n';
    const { symbols, diagnostics } = analyze(src);
    assert.equal(diagnostics.length, 1);
    assert.equal(diagnostics[0].range.start.line, 2);
    assert.deepEqual(symbols.map(s => s.name), ['ok', 'broken', 'alsoOk']);
  });

  it('keeps a declaration in the outline while its body is still open', () => {
    const { symbols, diagnostics } = analyze('func typing(a: int) {\n  if (a > 1) {\n    let x = 1;\n');
    assert.deepEqual(symbols.map(s => s.name), ['typing']);
    assert.deepEqual(diagnostics.map(d => d.message), ["Expected '}' but found end of file"]);
  });

  it('reports unterminated strings and unclosed brackets', () => {
    assert.deepEqual(messages('let s = "abc;\nlet t = 1;'), ['Unterminated string literal']);
    assert.ok(messages('let x = f(1, 2;').length > 0);
    assert.ok(messages('func f() { if x { } }').length > 0);
  });

  it('places diagnostics in 0-based UTF-16 coordinates, after astral characters too', () => {
    const [diag] = computeDiagnostics('let s = "😀"; let = 1;');
    assert.equal(diag.range.start.line, 0);
    assert.equal(diag.range.start.character, 18);
  });
});

describe('Symbols', () => {
  it('selects the name of a declaration, inside its full range', () => {
    const { symbols } = analyze('pub func add(a: int, b: int): int {\n  return a + b;\n}\nclass Point { let x: int = 0; }\n');
    const add = symbols[0];
    assert.equal(add.name, 'add');
    assert.deepEqual([add.selectionRange.start.line, add.selectionRange.start.column, add.selectionRange.end.column], [0, 9, 12]);
    assert.equal(add.range.end.line, 2);
    assert.equal(symbols[1].name, 'Point');
    assert.deepEqual(symbols[1].children!.map(c => c.name), ['x']);
  });

  it('lists constructors, properties, struct fields and namespace members', () => {
    const { symbols } = analyze('class C { new(id: int) { } get size(): int { return 1; } }\nstruct S { pub a: int; func f(): int { return 1; } }\nnamespace u { func g() { } }\n');
    assert.deepEqual(symbols[0].children!.map(c => c.name), ['new', 'size']);
    assert.deepEqual(symbols[1].children!.map(c => c.name), ['a', 'f']);
    assert.deepEqual(symbols[2].children!.map(c => c.name), ['g']);
  });
});

describe('Editor features', () => {
  it('formats by bracket depth and never touches multi-line string, fence or comment content', () => {
    const src = 'func f() {\nlet s = """\n        keep this indent\n        """;\n/* c\n      aligned */\nlet d = { "k": [\n1,\n],\n};\n}\n';
    const out = formatSource(src, '  ');
    assert.equal(out, 'func f() {\n  let s = """\n        keep this indent\n        """;\n  /* c\n      aligned */\n  let d = { "k": [\n    1,\n  ],\n  };\n}\n');
    assert.equal(formatSource(out, '  '), out);
    // a brace inside a string or comment is not structure
    assert.equal(formatSource('let a = "{";\nlet b = 1; # {\nlet c = 2;\n', '  '), 'let a = "{";\nlet b = 1; # {\nlet c = 2;\n');
  });

  it('keeps CRLF line endings when formatting', () => {
    assert.equal(formatSource('func f() {\r\nreturn;\r\n}\r\n', '\t'), 'func f() {\r\n\treturn;\r\n}\r\n');
  });

  it('folds on tokens: braces in strings and comments do not fold', () => {
    const ranges = computeFoldingRanges('func f() {\n  let a = "{";\n  # }\n  g();\n}\n# one\n# two\n');
    assert.deepEqual(ranges, [{ startLine: 0, endLine: 3 }, { startLine: 5, endLine: 6, kind: 'comment' }]);
    assert.deepEqual(computeFoldingRanges(''), []);
  });

  it('classifies only reserved words as keywords; contextual ones by position', () => {
    const typeAt = (src: string, word: string) => {
      const col = src.indexOf(word);
      return classifyTokens(src).find(t => t.character === col)?.type;
    };
    assert.equal(typeAt('let r = d.get(k);', 'get'), 'method');
    assert.equal(typeAt('let group = 1;', 'group'), 'variable');
    assert.equal(typeAt('await group { }', 'group'), 'keyword');
    assert.equal(typeAt('get size(): int { }', 'get'), 'keyword');
    assert.equal(typeAt('let x: uint = 1;', 'uint'), 'type');
    assert.equal(typeAt('return x;', 'return'), 'keyword');
    assert.equal(typeAt('shared class A { }', 'shared'), 'keyword');
    assert.equal(typeAt('x.from(e);', 'from'), 'method');
    // tokens are positive-length and never span lines
    const tokens = classifyTokens('@mode(host.native)\nlet s = """\n x\n """;\nfunc f() { }\n');
    assert.ok(tokens.every(t => t.length > 0));
    assert.ok(!tokens.some(t => t.line === 1 && t.character === 8));
  });

  it('finds words with Unicode letters and handles offsets at the edges', () => {
    assert.equal(getWordAtOffset('let café = 1;', 5), 'café');
    assert.equal(getWordAtOffset('', 0), null);
    assert.equal(getWordAtOffset('abc', 99), 'abc');
    assert.equal(getWordAtOffset('a + b', 2), null);
  });

  it('inserts an auto-import below @mode and namespace, not above them', () => {
    assert.equal(importInsertLine('@mode(host.native)\nnamespace a.b;\n\nfunc f() { }\n'), 2);
    assert.equal(importInsertLine('# header\n@mode(portable)\nlet x = 1;\n'), 2);
    assert.equal(importInsertLine('let x = 1;\n'), 0);
    assert.equal(importInsertLine(''), 0);
  });

  it('splits parameter lists at top-level commas only', () => {
    assert.deepEqual(splitTopLevel('a: dict[K, V], b: fn(int, int): int'), ['a: dict[K, V]', 'b: fn(int, int): int']);
    assert.deepEqual(splitTopLevel(''), []);
  });

  it('recognises package manifests, which are TOML and are not parsed as Loup', () => {
    assert.ok(isManifestUri('file:///p/package.lppkg'));
    assert.ok(isManifestUri('file:///p/loup.pkg'));
    assert.ok(!isManifestUri('file:///p/main.loup'));
  });
});
