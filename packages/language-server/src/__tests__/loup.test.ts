import { describe, it } from 'node:test';
import * as assert from 'node:assert/strict';
import * as fs from 'fs';
import * as path from 'path';
import { Lexer, TokenKind } from '../parser/lexer.js';
import { Parser } from '../parser/parser.js';
import { SymbolTable } from '../symbols/symbolTable.js';

const ROOT = process.cwd();

describe('Loup VSCode Extension Manifest & Grammars', () => {
  it('registers all five mode-flavored source extensions and .lppkg manifest', () => {
    const extPkg = JSON.parse(
      fs.readFileSync(path.join(ROOT, 'packages/extension/package.json'), 'utf8')
    );
    assert.equal(extPkg.name, 'loup-lang');
    assert.equal(extPkg.version, '1.20.0');

    const loupLang = extPkg.contributes.languages.find((l: { id: string }) => l.id === 'loup');
    assert.ok(loupLang);
    assert.deepEqual(loupLang.extensions, ['.loup', '.lpscr', '.lpfree', '.lpweb', '.lphc']);

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
