// ============================================================================
// Loup Parser — Recursive-descent, error-recovering parser for Loup v1.20
//
// The parser exists to feed the language server: an outline, a symbol table and
// syntax diagnostics. It follows the grammar of §1-19 of the language reference
// and, where the reference and the toolchain's own parser differ, accepts both
// spellings: a diagnostic on valid code costs the user more than a miss.
//
// Error handling is panic mode at statement granularity. The first error in a
// statement is reported and thrown as a ParseError; the enclosing statement
// list catches it, skips to the next statement boundary and carries on. Every
// loop therefore either consumes a token or throws, and one broken statement
// produces one diagnostic instead of a cascade.
// ============================================================================

import { Lexer, Token, TokenKind, isKeywordKind } from './lexer.js';
import * as AST from './ast.js';

/** Thrown after a diagnostic has been recorded; caught by the statement loops. */
class ParseError extends Error {
  constructor() {
    super('parse error');
    this.name = 'ParseError';
  }
}

/** Thrown when the parser gives up on the rest of the file (work budget exhausted). */
class ParseAbort extends Error {
  constructor() {
    super('parse aborted');
    this.name = 'ParseAbort';
  }
}

/** Where a statement list sits; decides which member forms are admissible. */
type Context = 'top' | 'block' | 'class' | 'struct' | 'interface';

const MAX_DIAGNOSTICS = 200;
const MAX_NESTING = 200;

const K = TokenKind;

/** Words that may precede a declaration keyword (`pub static async func`, `unique let`, ...). */
const MODIFIER_KINDS: ReadonlySet<TokenKind> = new Set([
  K.Pub, K.Static, K.Abstract, K.Override, K.Final, K.Sealed, K.Safe, K.Async, K.Gen,
  K.Synchronized, K.Local, K.Shared, K.Unique, K.Dynamic, K.Modifier, K.Operator,
  K.Reads, K.Edits, K.Takes, K.Shares, K.Arc, K.Onstack, K.Weak, K.Unowned, K.Borrow,
  K.Excl, K.Volatile, K.Part,
]);

/** Parameter and type prefixes: `borrow[~a] T`, `excl borrow x`, `volatile borrow r`. */
const OWNERSHIP_KINDS: ReadonlySet<TokenKind> = new Set([
  K.Reads, K.Edits, K.Takes, K.Shares, K.Borrow, K.Excl, K.Weak, K.Unowned, K.Unique,
  K.Volatile, K.Noescape,
]);

/**
 * Keyword tokens that can never begin an expression. Every other word is taken
 * as a name: Loup's contextual keywords (`get`, `set`, `box`, `group`, `part`,
 * `native`, ...) are ordinary identifiers outside their one position.
 */
const NOT_AN_EXPRESSION: ReadonlySet<TokenKind> = new Set([
  K.Let, K.Var, K.Const, K.Else, K.For, K.While, K.Do, K.Defer, K.With, K.Portal,
  K.Try, K.Catch, K.Finally, K.Import, K.As, K.In, K.Is, K.Instanceof, K.Del,
  K.Global, K.Nonlocal, K.Pub, K.Static, K.Override, K.Final, K.Sealed, K.Class,
  K.Struct, K.Abstract, K.Interface, K.Implements, K.Enum, K.Namespace, K.Extern,
  K.Macro, K.Where, K.Requires, K.Prefer, K.Synchronized, K.And, K.Or, K.Local,
]);

const COMPOUND_ASSIGN: ReadonlySet<TokenKind> = new Set([
  K.PlusAssign, K.MinusAssign, K.StarAssign, K.SlashAssign, K.SlashSlashAssign,
  K.PercentAssign, K.StarStarAssign, K.AmpersandAssign, K.PipeAssign, K.CaretAssign,
  K.ShiftLeftAssign, K.ShiftRightAssign,
]);

/** Tokens at which a recovering statement list may resume on a new line. */
const STATEMENT_START: ReadonlySet<TokenKind> = new Set([
  K.Let, K.Var, K.Const, K.Fun, K.Class, K.Struct, K.Enum, K.Interface, K.If, K.For,
  K.While, K.Do, K.Return, K.Try, K.Match, K.Pub, K.Static, K.From, K.Import, K.At,
  K.Break, K.Continue, K.Throw, K.Defer, K.With, K.Portal, K.Extern, K.Macro,
  K.Abstract, K.Namespace, K.Del, K.Yield,
]);

/** What a declaration is naming, as the reserved-word diagnostic words it. */
type NamePosition =
  | 'binding' | 'parameter' | 'function' | 'type' | 'type parameter'
  | 'field' | 'enum variant' | 'macro' | 'import alias';

/**
 * Reserved words (§1-3.4) that cannot name anything. The sets below were taken
 * from the toolchain's own verdicts, position by position, so that the
 * contextual carve-outs stay legal: `from` / `new` / `spawn` / `template` as
 * method names, `spawn` as a field, the ownership verbs as parameter modifiers,
 * `Some` / `None` as variant names, `noreturn` / `impossible` as value names.
 * `local` and `shared` are included: Appendix A lists them as keywords and both
 * compilers reject them as names, although §1-3.4's own list omits them.
 */
const RESERVED_EVERYWHERE: ReadonlySet<string> = new Set([
  'Self', 'abstract', 'and', 'as', 'async', 'atomic', 'await', 'bnot', 'break', 'catch', 'class',
  'const', 'consume', 'continue', 'defer', 'del', 'do', 'dynamic', 'else', 'enum', 'extern',
  'false', 'final', 'finally', 'fn', 'for', 'func', 'gen', 'global', 'if', 'implements', 'import',
  'in', 'instanceof', 'interface', 'is', 'let', 'local', 'macro', 'match', 'namespace', 'noescape',
  'nonlocal', 'not', 'onstack', 'or', 'override', 'portal', 'pub', 'requires', 'return', 'safe',
  'sealed', 'shared', 'static', 'struct', 'super', 'suspend', 'synchronized', 'this', 'throw',
  'true', 'try', 'type', 'typeof', 'unique', 'unsafe', 'var', 'where', 'while', 'with', 'yield',
]);

const VERBS = ['borrow', 'edits', 'reads', 'shares', 'takes', 'volatile'];

const RESERVED_BY_POSITION: Record<NamePosition, ReadonlySet<string>> = {
  'binding': new Set(['None', 'Some', 'from', 'lifetime', 'new', 'spawn', 'template', ...VERBS]),
  'parameter': new Set(['None', 'Some', 'from', 'lifetime', 'new', 'spawn', 'template']),
  'function': new Set(['None', 'Some', 'lifetime', ...VERBS]),
  'type': new Set(['None', 'Some', 'from', 'impossible', 'lifetime', 'new', 'noreturn', 'spawn', 'template', ...VERBS]),
  'type parameter': new Set(['None', 'Some', 'from', 'impossible', 'new', 'noreturn', 'spawn', 'template', ...VERBS]),
  'field': new Set(['None', 'Some', 'from', 'lifetime', 'new', 'template', ...VERBS]),
  'enum variant': new Set(['from', 'lifetime', 'new', 'spawn', 'template', ...VERBS]),
  'macro': new Set(['None', 'Some', 'from', 'lifetime', 'new', 'spawn', 'template', ...VERBS]),
  'import alias': new Set(['None', 'Some', 'from', 'lifetime', 'new', 'spawn', 'template', ...VERBS]),
};

const CLOSERS: Partial<Record<TokenKind, TokenKind>> = {
  [K.LeftParen]: K.RightParen,
  [K.LeftBracket]: K.RightBracket,
  [K.LeftBrace]: K.RightBrace,
  [K.BangLeftBrace]: K.RightBrace,
};

export class Parser {
  private tokens: Token[] = [];
  private pos = 0;
  private diagnostics: AST.ParseDiagnostic[] = [];
  private source = '';
  private eof: Token = { kind: K.EOF, text: '', offset: 0, line: 0, column: 0, length: 0, endLine: 0, endColumn: 0 };
  private depth = 0;
  private work = 0;
  private workLimit = 0;

  parse(source: string): { program: AST.Program; diagnostics: AST.ParseDiagnostic[] } {
    this.source = source;
    const lexer = new Lexer(source);
    this.tokens = lexer.tokenize().filter(
      t => t.kind !== K.LineComment && t.kind !== K.BlockComment && t.kind !== K.DocComment
    );
    this.eof = this.tokens[this.tokens.length - 1];
    this.pos = 0;
    this.diagnostics = [];
    this.depth = 0;
    this.work = 0;
    // A watchdog, not a tuning knob: a correct parser spends a bounded number of
    // token inspections per token. If a defect ever made it stop advancing, the
    // budget ends the parse instead of hanging the server.
    this.workLimit = 100_000 + this.tokens.length * 4_000;

    let statements: AST.Statement[] = [];
    try {
      statements = this.parseStatementList(K.EOF, 'top');
    } catch (err) {
      // ParseAbort: budget exhausted. RangeError: pathological nesting overflowed the
      // stack. Either way keep the diagnostics gathered so far and report nothing new.
      if (!(err instanceof ParseAbort) && !(err instanceof RangeError)) throw err;
    }

    const program: AST.Program = {
      kind: 'Program',
      statements,
      isCompiled: false,
      range: {
        start: { line: 0, column: 0, offset: 0 },
        end: { line: this.eof.line, column: this.eof.column, offset: this.eof.offset },
      },
    };

    return { program, diagnostics: this.diagnostics };
  }

  // ==========================================================================
  // Statement lists and recovery
  // ==========================================================================

  /**
   * Parse statements up to (not including) `close`. A statement that fails is
   * reported once, skipped, and parsing resumes at the next statement boundary.
   */
  private parseStatementList(close: TokenKind, ctx: Context): AST.Statement[] {
    const statements: AST.Statement[] = [];
    while (!this.at(close) && !this.atEnd()) {
      const startPos = this.pos;
      const depth = this.depth;
      try {
        const stmt = this.parseStatement(ctx);
        if (stmt) statements.push(stmt);
      } catch (err) {
        if (!(err instanceof ParseError)) throw err;
        this.depth = depth;
        this.recover(startPos);
      }
      if (this.pos === startPos && !this.atEnd()) {
        this.advance();
      }
    }
    return statements;
  }

  /** Skip to the next statement boundary after an error. */
  private recover(startPos: number): void {
    let nesting = 0;
    while (!this.atEnd()) {
      const tok = this.cur();
      if (nesting === 0) {
        if (tok.kind === K.Semicolon) {
          this.advance();
          return;
        }
        if (tok.kind === K.RightBrace) return; // closes the enclosing block
        if (this.pos > startPos && STATEMENT_START.has(tok.kind) && this.startsLine()) return;
      }
      if (tok.kind === K.LeftBrace || tok.kind === K.LeftParen || tok.kind === K.LeftBracket || tok.kind === K.BangLeftBrace) {
        nesting++;
      } else if (tok.kind === K.RightBrace || tok.kind === K.RightParen || tok.kind === K.RightBracket) {
        if (nesting > 0) {
          nesting--;
          if (nesting === 0 && tok.kind === K.RightBrace) {
            this.advance();
            if (this.at(K.Semicolon)) this.advance();
            return;
          }
        }
      }
      this.advance();
    }
  }

  // ==========================================================================
  // Statements
  // ==========================================================================

  private parseStatement(ctx: Context): AST.Statement | null {
    this.enter();
    try {
      return this.parseStatementInner(ctx);
    } finally {
      this.depth--;
    }
  }

  private parseStatementInner(ctx: Context): AST.Statement | null {
    const tok = this.cur();

    switch (tok.kind) {
      case K.Semicolon:
        this.advance();
        return null;
      case K.At:
        return this.parseAnnotated(ctx);
      case K.LeftBrace:
        if (ctx === 'top' || ctx === 'block') return this.parseBlock();
        break;
      default:
        break;
    }

    const decl = this.tryParseDeclaration(ctx);
    if (decl) return decl;

    switch (tok.kind) {
      case K.If: return this.parseIfStmt();
      case K.While: return this.parseWhileStmt();
      case K.For: return this.parseForStmt();
      case K.Do: return this.parseDoWhileStmt();
      case K.Try: return this.parseTryStmt();
      case K.With: return this.parseWithStmt();
      case K.Defer: return this.parseDeferStmt();
      case K.Portal: return this.parsePortalStmt();
      case K.Del: return this.parseDelStmt();
      case K.Global: return this.parseGlobalDecl();
      case K.Nonlocal: return this.parseNonlocalDecl();
      case K.Yield: return this.parseYieldStmt();
      case K.From: return this.parseImportStmt(false);
      case K.Import: return this.parseModuleImport();
      case K.Namespace: return this.parseNamespaceDecl();
      case K.Extern: return this.parseExternDecl();
      case K.Return:
      case K.Break:
      case K.Continue:
      case K.Throw: {
        const expression = this.parseJump();
        this.endStatement();
        return this.jumpToStatement(expression, tok);
      }
      case K.Match: {
        const expression = this.parseMatchExpr();
        return this.finishBlockExpression(expression, tok);
      }
      case K.Await:
        if (this.kindAt(1) === K.Group && this.kindAt(2) === K.LeftBrace) return this.parseAwaitGroupStmt();
        break;
      case K.Safe:
      case K.Atomic:
        if (this.kindAt(1) === K.LeftBrace) {
          this.advance();
          return this.parseBlock();
        }
        break;
      case K.Unsafe:
        if (this.kindAt(1) === K.LeftParen) {
          const close = this.matchingClose(this.pos + 1);
          const body = close >= 0 ? this.tokens[close + 1] : undefined;
          if (body?.kind === K.LeftBrace) {
            this.advance();
            this.skipBalanced();
            return this.parseBlock();
          }
          if (body?.kind === K.Asm && this.tokens[close + 2]?.kind === K.LeftBrace) {
            // unsafe("reason") asm { ... }
            this.advance();
            this.skipBalanced();
            return this.parseOpaqueBlock('asm');
          }
        }
        break;
      case K.Asm:
        if (this.kindAt(1) === K.LeftBrace) return this.parseOpaqueBlock('asm');
        break;
      case K.Quote:
        if (this.kindAt(1) === K.LeftBrace) return this.parseOpaqueBlock('quote');
        break;
      case K.Dynamic:
        return this.parseDynamicViewStmt();
      default:
        break;
    }

    if (this.isWord(tok) && this.kindAt(1) === K.Colon) {
      const after = this.kindAt(2);
      if (after === K.For || after === K.While || after === K.Do) return this.parseLabeledStmt();
      // A keyword-less field: `x: int;` (a struct field; in a class the toolchain
      // reports E_BARE_FIELD, which is its diagnostic to make, not a parse failure here).
      if (ctx === 'class' || ctx === 'struct' || ctx === 'interface') {
        return this.parseFieldDecl(tok, new Set<string>());
      }
    }

    return this.parseExpressionStmt();
  }

  /** `return` / `break` / `continue` / `throw` are parsed as expressions so match arms can hold them. */
  private jumpToStatement(expression: AST.Expression, start: Token): AST.Statement {
    if (expression.kind === 'StatementExpr') return expression.statement;
    return { kind: 'ExpressionStmt', expression, range: this.rangeFrom(start) };
  }

  /** A `match` / `if` in statement position needs no terminator, but may carry one or a postfix chain. */
  private finishBlockExpression(expression: AST.Expression, start: Token): AST.Statement {
    if (this.at(K.Dot) || this.at(K.QuestionDot) || this.at(K.Question)) {
      this.parsePostfixOps(expression);
      this.endStatement();
    } else if (this.at(K.Semicolon)) {
      this.advance();
    }
    return { kind: 'ExpressionStmt', expression, range: this.rangeFrom(start) };
  }

  // ---- Annotations ----

  private parseAnnotated(ctx: Context): AST.AnnotatedDecl {
    const start = this.cur();
    const annotation = this.parseAnnotation();
    // `@mode(...)` is a file-level directive; an annotation at the end of a block
    // has nothing to attach to either.
    if (annotation === 'mode' || this.at(K.RightBrace) || this.atEnd()) {
      return { kind: 'AnnotatedDecl', annotation, range: this.rangeFrom(start) };
    }
    const declaration = this.parseStatement(ctx) ?? undefined;
    return { kind: 'AnnotatedDecl', annotation, declaration, range: this.rangeFrom(start) };
  }

  /** `@name`, `@name(args)`, `@pkg.name(args)`. The arguments are skipped as a token tree. */
  private parseAnnotation(): string {
    this.expect(K.At);
    let name = this.expectWord('an annotation name').text;
    while (this.at(K.Dot) && this.isWord(this.peekTok(1))) {
      this.advance();
      name += '.' + this.advance().text;
    }
    if (this.at(K.LeftParen)) this.skipBalanced();
    return name;
  }

  private skipAnnotations(): void {
    while (this.at(K.At)) this.parseAnnotation();
  }

  // ---- Declarations ----

  /**
   * Parse a declaration if one starts here. The modifier words are contextual, so
   * the decision is made on the token after them: `part = 3;` and `shared.x` are
   * expressions, `part func f()` and `shared class C` are declarations.
   */
  private tryParseDeclaration(ctx: Context): AST.Statement | null {
    let i = this.pos;
    while (MODIFIER_KINDS.has(this.kindAt(i - this.pos))) {
      i++;
      if (this.tokens[i]?.kind === K.LeftBracket && this.tokens[i + 1]?.kind === K.LifetimeLabel && this.tokens[i + 2]?.kind === K.RightBracket) {
        i += 3;
      }
    }
    const head = this.tokens[i] ?? this.eof;
    const next = this.tokens[i + 1] ?? this.eof;
    const after = this.tokens[i + 2] ?? this.eof;
    const hasModifiers = i > this.pos;
    const inType = ctx === 'class' || ctx === 'struct' || ctx === 'interface';
    const lastModifier = hasModifiers ? this.tokens[i - 1] : undefined;

    let form: 'func' | 'bareMethod' | 'class' | 'struct' | 'enum' | 'interface' | 'type' | 'macro' | 'binding'
      | 'const' | 'template' | 'ctor' | 'property' | 'reexport' | 'namespace' | 'extern' | 'field' | 'fieldLastModifier' | null = null;

    switch (head.kind) {
      case K.Fun:
        // `func (` is a lambda unless it is `operator func ()(...)`.
        if (next.kind !== K.LeftParen || lastModifier?.kind === K.Operator) form = 'func';
        break;
      case K.Class: if (this.isNameToken(next)) form = 'class'; break;
      case K.Struct: if (this.isNameToken(next)) form = 'struct'; break;
      case K.Enum: if (this.isNameToken(next)) form = 'enum'; break;
      case K.Interface: if (this.isNameToken(next)) form = 'interface'; break;
      case K.Type:
        if (this.isNameToken(next) && (
          after.kind === K.Assign || after.kind === K.LeftBracket ||
          // an associated type in an interface: `type Item;`
          (inType && (after.kind === K.Semicolon || after.kind === K.Colon || after.kind === K.RightBrace || after.line > next.endLine))
        )) {
          form = 'type';
        }
        break;
      case K.Macro: if (this.isNameToken(next) && after.kind === K.LeftParen) form = 'macro'; break;
      case K.Let:
      case K.Var:
        form = 'binding';
        break;
      case K.Const:
        form = 'const';
        break;
      case K.Template: if (this.isWord(next) && this.isNameToken(after)) form = 'template'; break;
      case K.New: if (next.kind === K.LeftParen && (inType || hasModifiers)) form = 'ctor'; break;
      case K.Get:
      case K.Set:
        if (inType && this.isNameToken(next) && after.kind === K.LeftParen) form = 'property';
        break;
      case K.From: if (hasModifiers && i === this.pos + 1 && this.at(K.Pub)) form = 'reexport'; break;
      case K.Namespace: if (hasModifiers) form = 'namespace'; break;
      case K.Extern: if (hasModifiers) form = 'extern'; break;
      default:
        break;
    }

    if (form === null && hasModifiers) {
      if (lastModifier!.kind === K.Modifier && this.isNameToken(head) && (next.kind === K.LeftParen || next.kind === K.LeftBracket) && i - 1 >= this.pos) {
        // `modifier name(...)`: the keyword stands in for `func`.
        form = 'bareMethod';
      } else if (inType && this.isNameToken(head) && next.kind === K.Colon) {
        form = 'field';
      } else if (inType && head.kind === K.Colon && i - 1 > this.pos) {
        // `pub part: int;` — the last "modifier" is the field's name.
        form = 'fieldLastModifier';
      }
    }

    if (form === null) return null;

    const start = this.cur();
    const modifierEnd = form === 'fieldLastModifier' ? i - 1 : i;
    const modifiers = new Set<string>();
    while (this.pos < modifierEnd) modifiers.add(this.advance().text);

    switch (form) {
      case 'func': return this.parseFunDecl(start, modifiers, ctx, false);
      case 'bareMethod': return this.parseFunDecl(start, modifiers, ctx, true);
      case 'class': return this.parseClassDecl(start, modifiers);
      case 'struct': return this.parseStructDecl(start);
      case 'enum': return this.parseEnumDecl(start);
      case 'interface': return this.parseInterfaceDecl(start);
      case 'type': return this.parseTypeAliasDecl(start);
      case 'macro': return this.parseMacroDecl(start);
      case 'binding': {
        const decl = this.parseBindingDecl(start, inType ? 'field' : 'binding');
        this.endStatement();
        return decl;
      }
      case 'const':
        if (this.kindAt(1) === K.Fun) {
          this.advance(); // const
          return this.parseFunDecl(start, modifiers, ctx, false);
        } else {
          const decl = this.parseBindingDecl(start, inType ? 'field' : 'binding');
          this.endStatement();
          return decl;
        }
      case 'template': return this.parseTemplateDecl(start);
      case 'ctor': return this.parseConstructorDecl(start, modifiers);
      case 'property': return this.parsePropertyDecl(start, modifiers);
      case 'reexport': return this.parseImportStmt(true, start);
      case 'namespace': return this.parseNamespaceDecl(start);
      case 'extern': return this.parseExternDecl(start);
      case 'field':
      case 'fieldLastModifier':
        return this.parseFieldDecl(start, modifiers);
    }
  }

  /** `let` / `var` / `const` binding, without its terminator. */
  private parseBindingDecl(start: Token, position: NamePosition = 'binding'): AST.LetDecl | AST.VarDecl {
    const keyword = this.advance();
    const pattern = this.parseDestructPattern(position);
    const typeAnnotation = this.eat(K.Colon) ? this.parseType() : undefined;
    const initializer = this.eat(K.Assign) ? this.parseExpression() : undefined;
    const kind = keyword.kind === K.Var ? 'VarDecl' : 'LetDecl';
    return { kind, pattern, typeAnnotation, initializer, range: this.rangeFrom(start) };
  }

  /** A field written without `let` / `var`: `[pub] [borrow[~a]] name: Type [= default];` */
  private parseFieldDecl(start: Token, modifiers: Set<string>): AST.VarDecl {
    const nameTok = this.advance();
    this.expect(K.Colon);
    const typeAnnotation = this.parseType();
    const initializer = this.eat(K.Assign) ? this.parseExpression() : undefined;
    this.endStatement();
    void modifiers;
    return {
      kind: 'VarDecl',
      pattern: { kind: 'IdentifierPattern', name: nameTok.text, range: this.tokenRange(nameTok) },
      typeAnnotation,
      initializer,
      range: this.rangeFrom(start),
    };
  }

  private parseDestructPattern(position: NamePosition = 'binding'): AST.DestructPattern {
    this.enter();
    try {
      return this.parseDestructPatternInner(position);
    } finally {
      this.depth--;
    }
  }

  private parseDestructPatternInner(position: NamePosition): AST.DestructPattern {
    const start = this.cur();
    if (this.at(K.LeftParen) || this.at(K.LeftBracket)) {
      const isTuple = this.at(K.LeftParen);
      const close = isTuple ? K.RightParen : K.RightBracket;
      this.advance();
      const elements: AST.DestructPattern[] = [];
      let rest: string | undefined;
      while (!this.at(close)) {
        if (this.at(K.Star)) {
          this.advance();
          rest = this.expectDeclaredName(position).text;
        } else {
          elements.push(this.parseDestructPattern(position));
        }
        if (!this.eat(K.Comma)) break;
      }
      this.expect(close);
      return { kind: isTuple ? 'TuplePattern' : 'ListPattern', elements, rest, range: this.rangeFrom(start) };
    }
    if (this.at(K.LeftBrace)) {
      this.advance();
      const fields: AST.DictDestructField[] = [];
      let rest: string | undefined;
      while (!this.at(K.RightBrace)) {
        if (this.at(K.StarStar)) {
          this.advance();
          rest = this.expectName('a name after "**"').text;
        } else if (this.at(K.Star) && this.kindAt(1) === K.Star) {
          this.advance();
          this.advance();
          rest = this.expectName('a name after "**"').text;
        } else {
          const fStart = this.cur();
          let key: string;
          if (this.at(K.StringLiteral)) {
            key = this.advance().text.slice(1, -1);
          } else {
            key = this.expectName('a key').text;
          }
          let alias: string | undefined;
          if (this.eat(K.Colon)) alias = this.expectDeclaredName(position).text;
          const defaultValue = this.eat(K.Assign) ? this.parseExpression() : undefined;
          fields.push({ kind: 'DictDestructField', key, alias, defaultValue, range: this.rangeFrom(fStart) });
        }
        if (!this.eat(K.Comma)) break;
      }
      this.expect(K.RightBrace);
      return { kind: 'DictPattern', fields, rest, range: this.rangeFrom(start) };
    }

    if (this.isNameToken(this.cur()) && this.kindAt(1) === K.LeftParen && this.peekTok(1).line === this.cur().endLine) {
      // Constructor destructuring: Point(x=px, y=_)
      this.advance();
      this.advance();
      const elements: AST.DestructPattern[] = [];
      while (!this.at(K.RightParen)) {
        if (this.isWord(this.cur()) && this.kindAt(1) === K.Assign) {
          this.advance();
          this.advance();
        }
        elements.push(this.parseDestructPattern(position));
        if (!this.eat(K.Comma)) break;
      }
      this.expect(K.RightParen);
      return { kind: 'TuplePattern', elements, range: this.rangeFrom(start) };
    }
    const nameTok = this.expectDeclaredName(position);
    return { kind: 'IdentifierPattern', name: nameTok.text, range: this.tokenRange(nameTok) };
  }

  private parseFunDecl(
    start: Token,
    modifiers: Set<string>,
    ctx: Context,
    bare: boolean
  ): AST.FunDecl | AST.AsyncFunDecl | AST.GenFunDecl | AST.AsyncGenFunDecl {
    if (!bare) this.expect(K.Fun);
    const isOperator = modifiers.has('operator');
    const nameTok = this.cur();
    const name = isOperator ? this.parseOperatorSymbol() : this.expectDeclaredName('function').text;
    const nameRange = isOperator ? this.rangeFrom(nameTok) : this.tokenRange(nameTok);
    const typeParams = this.parseOptionalTypeParams();
    this.expect(K.LeftParen);
    const params = this.parseParamList();
    this.expect(K.RightParen);
    const returnType = this.parseSignatureTail();

    let body: AST.Block;
    if (this.at(K.LeftBrace)) {
      body = this.parseBlock();
    } else if (this.at(K.Arrow)) {
      this.advance();
      const exprStart = this.cur();
      this.parseExpression();
      this.endStatement();
      body = { kind: 'Block', statements: [], range: this.rangeFrom(exprStart) };
    } else if (this.at(K.Semicolon)) {
      body = { kind: 'Block', statements: [], range: this.tokenRange(this.advance()) };
    } else if (
      (ctx === 'interface' || ctx === 'class' || ctx === 'struct' || modifiers.has('abstract') || modifiers.has('part')) &&
      (this.at(K.RightBrace) || this.atEnd() || this.startsLine())
    ) {
      // A signature with no body and no `;`, ended by the line.
      body = { kind: 'Block', statements: [], range: this.rangeFrom(this.prev()) };
    } else {
      this.fail(`Expected '{' but found ${this.describe(this.cur())}`);
    }

    const common = {
      name,
      nameRange,
      params,
      returnType,
      body,
      isPublic: modifiers.has('pub'),
      isStatic: modifiers.has('static'),
      typeParams,
      range: this.rangeFrom(start),
    };
    const isAsync = modifiers.has('async');
    const isGen = modifiers.has('gen');
    if (isAsync && isGen) return { kind: 'AsyncGenFunDecl', ...common };
    if (isGen) return { kind: 'GenFunDecl', ...common };
    if (isAsync) return { kind: 'AsyncFunDecl', isAbstract: modifiers.has('abstract'), ...common };
    return { kind: 'FunDecl', isAbstract: modifiers.has('abstract'), isOperator, ...common };
  }

  /** After a parameter list: `requires ...`, `: ReturnType` and `where ...`, in any order. */
  private parseSignatureTail(): AST.TypeExpr | undefined {
    let returnType: AST.TypeExpr | undefined;
    for (;;) {
      if (this.at(K.Requires)) {
        this.advance();
        do {
          this.expectWord('a contract');
          if (this.at(K.LeftParen)) this.skipBalanced();
        } while (this.eat(K.Comma));
      } else if (this.at(K.Colon)) {
        this.advance();
        returnType = this.parseType();
      } else if (this.at(K.Where)) {
        this.parseWhereClause();
      } else {
        return returnType;
      }
    }
  }

  /** `where T: A + B, U: C` */
  private parseWhereClause(): void {
    this.expect(K.Where);
    for (;;) {
      this.expectWord('a type parameter name');
      this.expect(K.Colon);
      this.parseType();
      while (this.eat(K.Plus)) this.parseType();
      if (this.at(K.Comma) && this.isWord(this.peekTok(1)) && this.kindAt(2) === K.Colon) {
        this.advance();
        continue;
      }
      return;
    }
  }

  /** The symbol of an `operator func`: `+`, `[]`, `[]=`, `()`, `==`, `contains`, ... */
  private parseOperatorSymbol(): string {
    if (this.at(K.LeftBracket)) {
      this.advance();
      this.expect(K.RightBracket);
      if (this.at(K.Assign) && this.kindAt(1) !== K.Assign) {
        this.advance();
        return '[]=';
      }
      return '[]';
    }
    if (this.at(K.LeftParen) && this.kindAt(1) === K.RightParen) {
      this.advance();
      this.advance();
      return '()';
    }
    if (this.at(K.LeftParen) || this.atEnd()) {
      this.fail(`Expected an operator symbol but found ${this.describe(this.cur())}`);
    }
    return this.advance().text;
  }

  private parseConstructorDecl(start: Token, modifiers: Set<string>): AST.FunDecl {
    const nameTok = this.expect(K.New);
    this.expect(K.LeftParen);
    const params = this.parseParamList();
    this.expect(K.RightParen);
    const returnType = this.parseSignatureTail();
    const body = this.parseBlock();
    return {
      kind: 'FunDecl', name: 'new', nameRange: this.tokenRange(nameTok), params, returnType, body,
      isPublic: modifiers.has('pub'), isStatic: false, isAbstract: false, isOperator: false,
      range: this.rangeFrom(start),
    };
  }

  /** `get name(): T { ... }` / `set name(v: T) { ... }` (a `;` body in an interface). */
  private parsePropertyDecl(start: Token, modifiers: Set<string>): AST.FunDecl {
    this.advance(); // get | set
    const nameTok = this.expectName('a property name');
    this.expect(K.LeftParen);
    const params = this.parseParamList();
    this.expect(K.RightParen);
    const returnType = this.parseSignatureTail();
    let body: AST.Block;
    if (this.at(K.LeftBrace)) {
      body = this.parseBlock();
    } else {
      body = { kind: 'Block', statements: [], range: this.rangeFrom(this.prev()) };
      this.endStatement();
    }
    return {
      kind: 'FunDecl', name: nameTok.text, nameRange: this.tokenRange(nameTok), params, returnType, body,
      isPublic: modifiers.has('pub'), isStatic: modifiers.has('static'), isAbstract: false, isOperator: false,
      range: this.rangeFrom(start),
    };
  }

  /** Supertypes after `:` and any number of `implements A, B [where ...]` clauses. */
  private parseHeritage(): { superClass?: string; implementsList: string[] } {
    let superClass: string | undefined;
    const implementsList: string[] = [];
    if (this.eat(K.Colon)) {
      superClass = this.typeName(this.parseType());
      while (this.at(K.Comma) && this.kindAt(1) !== K.Implements) {
        this.advance();
        this.parseType();
      }
    }
    for (;;) {
      if (this.at(K.Comma) && this.kindAt(1) === K.Implements) this.advance();
      if (!this.at(K.Implements)) break;
      this.advance();
      implementsList.push(this.typeName(this.parseType()));
      while (this.at(K.Comma) && this.kindAt(1) !== K.Implements) {
        this.advance();
        implementsList.push(this.typeName(this.parseType()));
      }
      if (this.at(K.Where)) this.parseWhereClause();
    }
    if (this.at(K.Where)) this.parseWhereClause();
    return { superClass, implementsList };
  }

  private typeName(type: AST.TypeExpr): string {
    return type.kind === 'SimpleType' || type.kind === 'GenericType' ? type.name : '';
  }

  /** `{ members }`. A body left open at end of file is reported but still returned. */
  private parseBody(ctx: Context): AST.Statement[] {
    this.expect(K.LeftBrace);
    const members = this.parseStatementList(K.RightBrace, ctx);
    this.closeBrace();
    return members;
  }

  private parseClassDecl(start: Token, modifiers: Set<string>): AST.ClassDecl {
    this.expect(K.Class);
    const nameTok = this.expectDeclaredName('type');
    const typeParams = this.parseOptionalTypeParams();
    const { superClass, implementsList } = this.parseHeritage();
    const members = this.parseBody('class');
    return {
      kind: 'ClassDecl', name: nameTok.text, nameRange: this.tokenRange(nameTok),
      isDynamic: modifiers.has('dynamic'), isAbstract: modifiers.has('abstract'),
      superClass, implements: implementsList.length > 0 ? implementsList : undefined,
      members, typeParams, range: this.rangeFrom(start),
    };
  }

  /** `template foundation Name [implements ...] { ... }` / `template overlay Name onto Base { ... }` */
  private parseTemplateDecl(start: Token): AST.ClassDecl {
    this.expect(K.Template);
    this.advance(); // foundation | overlay
    const nameTok = this.expectName('a template name');
    let superClass: string | undefined;
    if (this.at(K.Onto)) {
      this.advance();
      superClass = this.expectName('a template name').text;
    }
    const { implementsList } = this.parseHeritage();
    const members = this.parseBody('class');
    return {
      kind: 'ClassDecl', name: nameTok.text, nameRange: this.tokenRange(nameTok),
      isDynamic: false, isAbstract: false, superClass,
      implements: implementsList.length > 0 ? implementsList : undefined,
      members, range: this.rangeFrom(start),
    };
  }

  private parseStructDecl(start: Token): AST.StructDecl {
    this.expect(K.Struct);
    const nameTok = this.expectDeclaredName('type');
    const typeParams = this.parseOptionalTypeParams();
    const { implementsList } = this.parseHeritage();
    const members = this.parseBody('struct');

    const fields: AST.StructField[] = [];
    const methods: (AST.FunDecl | AST.AsyncFunDecl)[] = [];
    for (const rawMember of members) {
      const member = this.unwrapAnnotated(rawMember);
      if (!member) continue;
      if (member.kind === 'FunDecl' || member.kind === 'AsyncFunDecl') {
        methods.push(member);
      } else if ((member.kind === 'LetDecl' || member.kind === 'VarDecl') && member.pattern.kind === 'IdentifierPattern') {
        fields.push({
          kind: 'StructField',
          name: member.pattern.name,
          type: member.typeAnnotation ?? { kind: 'SimpleType', name: '', range: member.pattern.range },
          defaultValue: member.initializer,
          isVar: member.kind === 'VarDecl',
          range: member.range,
        });
      }
    }
    return {
      kind: 'StructDecl', name: nameTok.text, nameRange: this.tokenRange(nameTok), fields, methods,
      implements: implementsList.length > 0 ? implementsList : undefined,
      typeParams, range: this.rangeFrom(start),
    };
  }

  private unwrapAnnotated(stmt: AST.Statement): AST.Statement | undefined {
    let current: AST.Statement | undefined = stmt;
    while (current && current.kind === 'AnnotatedDecl') current = current.declaration;
    return current;
  }

  private parseInterfaceDecl(start: Token): AST.InterfaceDecl {
    this.expect(K.Interface);
    const nameTok = this.expectDeclaredName('type');
    const typeParams = this.parseOptionalTypeParams();
    this.parseHeritage();
    const members = this.parseBody('interface');
    const methods: AST.FunDecl[] = [];
    for (const rawMember of members) {
      const member = this.unwrapAnnotated(rawMember);
      if (member && member.kind === 'FunDecl') methods.push(member);
    }
    return {
      kind: 'InterfaceDecl', name: nameTok.text, nameRange: this.tokenRange(nameTok),
      methods, typeParams, range: this.rangeFrom(start),
    };
  }

  private parseEnumDecl(start: Token): AST.EnumDecl {
    this.expect(K.Enum);
    const nameTok = this.expectDeclaredName('type');
    const typeParams = this.parseOptionalTypeParams();
    this.parseHeritage();
    this.expect(K.LeftBrace);
    const variants: AST.EnumVariant[] = [];
    while (!this.at(K.RightBrace) && !this.atEnd()) {
      if (this.at(K.Comma) || this.at(K.Semicolon)) {
        this.advance();
        continue;
      }
      this.skipAnnotations();
      if (this.at(K.RightBrace)) break;
      // Not in the grammar, but harmless to accept: a declaration inside the body.
      if (this.at(K.Fun) || this.at(K.Pub) || this.at(K.Static)) {
        const member = this.tryParseDeclaration('class');
        if (member) continue;
      }
      const varStart = this.cur();
      const varName = this.expectDeclaredName('enum variant').text;
      const fields: AST.Parameter[] = [];
      if (this.at(K.LeftParen) || this.at(K.LeftBrace)) {
        const close = this.at(K.LeftParen) ? K.RightParen : K.RightBrace;
        this.advance();
        while (!this.at(close)) {
          if (this.at(K.Comma) || this.at(K.Semicolon)) {
            this.advance();
            continue;
          }
          this.skipAnnotations();
          const fStart = this.cur();
          let fieldName = '';
          if (this.isWord(this.cur()) && this.kindAt(1) === K.Colon) {
            fieldName = this.advance().text;
            this.advance();
          }
          const type = this.parseType();
          const defaultValue = this.eat(K.Assign) ? this.parseExpression() : undefined;
          fields.push({ kind: 'Parameter', name: fieldName, type, defaultValue, range: this.rangeFrom(fStart) });
          if (!this.at(K.Comma) && !this.at(K.Semicolon) && !this.at(close) && !this.startsLine()) {
            this.fail(`Expected ',' or '${close}' but found ${this.describe(this.cur())}`);
          }
        }
        this.expect(close);
      }
      if (this.eat(K.Assign)) this.parseExpression();
      variants.push({ kind: 'EnumVariant', name: varName, fields, range: this.rangeFrom(varStart) });
      if (!this.at(K.Comma) && !this.at(K.Semicolon) && !this.at(K.RightBrace) && !this.atEnd() && !this.startsLine()) {
        this.fail(`Expected ',' or '}' but found ${this.describe(this.cur())}`);
      }
    }
    this.closeBrace();
    return { kind: 'EnumDecl', name: nameTok.text, nameRange: this.tokenRange(nameTok), variants, typeParams, range: this.rangeFrom(start) };
  }

  private parseTypeAliasDecl(start: Token): AST.TypeAliasDecl {
    this.expect(K.Type);
    const nameTok = this.expectDeclaredName('type');
    const typeParams = this.parseOptionalTypeParams();
    let value: AST.TypeExpr = { kind: 'SimpleType', name: '', range: this.tokenRange(nameTok) };
    if (this.eat(K.Colon)) {
      // a bounded associated type: `type Item: Comparable;`
      this.parseType();
      while (this.eat(K.Plus)) this.parseType();
    }
    if (this.eat(K.Assign)) value = this.parseType();
    this.endStatement();
    return { kind: 'TypeAliasDecl', name: nameTok.text, nameRange: this.tokenRange(nameTok), typeParams, value, range: this.rangeFrom(start) };
  }

  private parseMacroDecl(start: Token): AST.MacroDecl {
    this.expect(K.Macro);
    const nameTok = this.expectDeclaredName('macro');
    this.expect(K.LeftParen);
    const params = this.parseParamList();
    this.expect(K.RightParen);
    const body = this.parseBlock();
    return { kind: 'MacroDecl', name: nameTok.text, nameRange: this.tokenRange(nameTok), params, body, range: this.rangeFrom(start) };
  }

  /** `namespace a.b.c;` or `namespace a.b { ... }` */
  private parseNamespaceDecl(start: Token = this.cur()): AST.NamespaceDecl {
    this.expect(K.Namespace);
    let name = this.expectName('a namespace name').text;
    while (this.at(K.Dot)) {
      this.advance();
      name += '.' + this.expectName('a namespace name').text;
    }
    let body: AST.Statement[] | undefined;
    if (this.at(K.LeftBrace)) {
      body = this.parseBody('top');
    } else {
      this.endStatement();
    }
    return { kind: 'NamespaceDecl', name, body, range: this.rangeFrom(start) };
  }

  // ---- Imports ----

  /** The module path of an import: `core.text`, `.`, `..sibling`, `.pkg.mod`. */
  private parseModulePath(): string {
    let path = '';
    for (;;) {
      const tok = this.cur();
      if (tok.kind === K.Import || tok.kind === K.Defer || tok.kind === K.As || tok.kind === K.Prefer) break;
      if (tok.kind === K.Dot || tok.kind === K.DotDot || tok.kind === K.DotDotDot || this.isWord(tok)) {
        if (path !== '' && !this.sameLine()) break;
        path += this.advance().text;
        continue;
      }
      break;
    }
    if (path === '') this.fail(`Expected a module path but found ${this.describe(this.cur())}`);
    return path;
  }

  private parseImportNames(): AST.ImportName[] {
    this.expect(K.LeftParen);
    const names: AST.ImportName[] = [];
    while (!this.at(K.RightParen)) {
      const nameTok = this.at(K.Star) ? this.advance() : this.expectName('an imported name');
      let alias: string | undefined;
      if (this.eat(K.As)) alias = this.expectDeclaredName('import alias').text;
      names.push({ kind: 'ImportName', name: nameTok.text, alias, range: this.rangeFrom(nameTok) });
      if (!this.eat(K.Comma)) break;
    }
    this.expect(K.RightParen);
    return names;
  }

  private parsePreferCompiled(): boolean {
    if (!this.at(K.Prefer)) return false;
    this.advance();
    this.expect(K.Compiled);
    return true;
  }

  /** `from path import (names) [prefer compiled];`, `from path defer import (...)`, `from path { ... }` */
  private parseImportStmt(isReExport: boolean, start: Token = this.cur()): AST.ImportStmt | AST.ImportBlockStmt | AST.ReExportStmt {
    this.expect(K.From);
    const path = this.parseModulePath();

    if (this.at(K.LeftBrace)) {
      this.advance();
      const imports: AST.ImportStmt[] = [];
      while (!this.at(K.RightBrace) && !this.atEnd()) {
        if (this.eat(K.Semicolon)) continue;
        const itemStart = this.cur();
        const subPath = this.parseModulePath();
        this.eat(K.Defer);
        this.expect(K.Import);
        const names = this.parseImportNames();
        const preferCompiled = this.parsePreferCompiled();
        imports.push({ kind: 'ImportStmt', path: subPath, names, preferCompiled, range: this.rangeFrom(itemStart) });
        if (!this.at(K.RightBrace)) this.endStatement();
      }
      this.closeBrace();
      return { kind: 'ImportBlockStmt', path, imports, range: this.rangeFrom(start) };
    }

    this.eat(K.Defer);
    this.expect(K.Import);
    const names = this.parseImportNames();
    const preferCompiled = this.parsePreferCompiled();
    this.endStatement();
    if (isReExport) return { kind: 'ReExportStmt', path, names, range: this.rangeFrom(start) };
    return { kind: 'ImportStmt', path, names, preferCompiled, range: this.rangeFrom(start) };
  }

  /** `import path [as name] [prefer compiled];` binds the module itself. */
  private parseModuleImport(): AST.ImportStmt {
    const start = this.cur();
    this.expect(K.Import);
    const pathStart = this.cur();
    const path = this.parseModulePath();
    const pathEnd = this.prev();
    const names: AST.ImportName[] = [];
    if (this.eat(K.As)) {
      const aliasTok = this.expectName('an alias');
      names.push({ kind: 'ImportName', name: aliasTok.text, range: this.tokenRange(aliasTok) });
    } else if (pathStart === pathEnd && this.isWord(pathStart)) {
      names.push({ kind: 'ImportName', name: path, range: this.tokenRange(pathStart) });
    }
    const preferCompiled = this.parsePreferCompiled();
    this.endStatement();
    return { kind: 'ImportStmt', path, names, preferCompiled, range: this.rangeFrom(start) };
  }

  /** `extern js func|val ...;`, `extern native "lib" func|val ...;` */
  private parseExternDecl(start: Token = this.cur()): AST.Statement {
    this.expect(K.Extern);
    let library: string | undefined;
    const isJs = this.at(K.Js);
    if (isJs) {
      this.advance();
    } else if (this.at(K.Native)) {
      this.advance();
    }
    if (this.at(K.StringLiteral)) library = this.advance().text.slice(1, -1);

    if (this.at(K.LeftBrace)) {
      const body = this.parseBody('interface');
      return { kind: 'Block', statements: body, range: this.rangeFrom(start) };
    }

    if (this.at(K.Fun)) {
      this.advance();
      const nameTok = this.expectName('a function name');
      this.parseOptionalTypeParams();
      this.expect(K.LeftParen);
      const params = this.parseParamList();
      this.expect(K.RightParen);
      const returnType = this.parseSignatureTail() ?? { kind: 'SimpleType', name: 'void', range: this.tokenRange(nameTok) };
      this.endStatement();
      if (isJs || library === undefined) {
        return { kind: 'ExternJsFunDecl', name: nameTok.text, nameRange: this.tokenRange(nameTok), params, returnType, range: this.rangeFrom(start) };
      }
      return { kind: 'ExternNativeFunDecl', library, name: nameTok.text, nameRange: this.tokenRange(nameTok), params, returnType, range: this.rangeFrom(start) };
    }

    if (this.at(K.Val) || this.at(K.Let) || this.at(K.Var)) {
      this.advance();
      const nameTok = this.expectName('a name');
      this.expect(K.Colon);
      const type = this.parseType();
      this.endStatement();
      if (isJs || library === undefined) {
        return { kind: 'ExternJsValDecl', name: nameTok.text, nameRange: this.tokenRange(nameTok), type, range: this.rangeFrom(start) };
      }
      return { kind: 'ExternNativeValDecl', library, name: nameTok.text, nameRange: this.tokenRange(nameTok), type, range: this.rangeFrom(start) };
    }

    this.fail(`Expected 'func' or 'val' in an extern declaration but found ${this.describe(this.cur())}`);
  }

  // ---- Control flow ----

  private parseCondition(): AST.Expression {
    this.expect(K.LeftParen);
    const condition = this.parseExpression();
    this.expect(K.RightParen);
    return condition;
  }

  private parseIfStmt(): AST.IfStmt {
    const start = this.cur();
    this.expect(K.If);
    this.eat(K.Const); // `if const (...)`
    const condition = this.parseCondition();
    const consequent = this.parseBlock();
    const root: AST.IfStmt = { kind: 'IfStmt', condition, consequent, range: this.rangeFrom(start) };

    // An `else if` chain is walked iteratively: a long chain must not deepen the stack.
    let tail = root;
    while (this.at(K.Else)) {
      this.advance();
      if (this.at(K.If)) {
        const elifStart = this.advance();
        this.eat(K.Const);
        const elifCondition = this.parseCondition();
        const elifBlock = this.parseBlock();
        const next: AST.IfStmt = { kind: 'IfStmt', condition: elifCondition, consequent: elifBlock, range: this.rangeFrom(elifStart) };
        tail.alternate = next;
        tail = next;
      } else {
        tail.alternate = this.parseBlock();
        break;
      }
    }
    root.range = this.rangeFrom(start);
    return root;
  }

  private parseWhileStmt(label?: string): AST.WhileStmt {
    const start = this.cur();
    this.expect(K.While);
    const condition = this.parseCondition();
    const body = this.parseBlock();
    return { kind: 'WhileStmt', condition, body, label, range: this.rangeFrom(start) };
  }

  private parseForStmt(label?: string): AST.ForStmt | AST.ForInStmt | AST.ForAwaitStmt {
    const start = this.cur();
    this.expect(K.For);
    this.eat(K.Concurrent); // for concurrent (§2-1.11)
    const isAwait = this.eat(K.Await);
    const open = this.expect(K.LeftParen);

    if (isAwait || this.hasInAhead()) {
      // for-in; `for concurrent` may bind several ranges: (let i in 0..n, let j in 0..m)
      let pattern: AST.DestructPattern | undefined;
      let iterable: AST.Expression | undefined;
      do {
        if (this.at(K.Let) || this.at(K.Var)) this.advance();
        const p = this.parseDestructPattern();
        this.expect(K.In);
        const it = this.parseExpression();
        pattern = pattern ?? p;
        iterable = iterable ?? it;
      } while (this.eat(K.Comma));
      this.expect(K.RightParen);
      const body = this.parseBlock();
      const kind = isAwait ? 'ForAwaitStmt' : 'ForInStmt';
      return { kind, pattern: pattern!, iterable: iterable!, body, label, range: this.rangeFrom(start) };
    }

    // C-style: for (init; condition; step) — each part may be empty
    let init: AST.Statement = { kind: 'Block', statements: [], range: this.tokenRange(open) };
    if (!this.at(K.Semicolon)) {
      const initStart = this.cur();
      if (this.at(K.Let) || this.at(K.Var) || this.at(K.Const)) {
        init = this.parseBindingDecl(initStart);
      } else {
        init = { kind: 'ExpressionStmt', expression: this.parseExpression(), range: this.rangeFrom(initStart) };
      }
    }
    this.expect(K.Semicolon);
    const condition: AST.Expression = this.at(K.Semicolon)
      ? { kind: 'BoolLiteral', value: true, range: this.tokenRange(this.cur()) }
      : this.parseExpression();
    this.expect(K.Semicolon);
    const step: AST.Expression = this.at(K.RightParen)
      ? { kind: 'BoolLiteral', value: true, range: this.tokenRange(this.cur()) }
      : this.parseExpression();
    this.expect(K.RightParen);
    const body = this.parseBlock();
    return { kind: 'ForStmt', init, condition, step, body, label, range: this.rangeFrom(start) };
  }

  /** Just past `for (`: is there an `in` at bracket depth 0 before a `;` or the closing `)`? */
  private hasInAhead(): boolean {
    return this.hasInAheadFrom(this.pos);
  }

  private hasInAheadFrom(from: number): boolean {
    let nesting = 0;
    for (let i = from; i < this.tokens.length; i++) {
      const kind = this.tokens[i].kind;
      if (kind === K.LeftParen || kind === K.LeftBracket || kind === K.LeftBrace || kind === K.BangLeftBrace) {
        nesting++;
      } else if (kind === K.RightParen || kind === K.RightBracket || kind === K.RightBrace) {
        if (nesting === 0) return false;
        nesting--;
      } else if (nesting === 0) {
        if (kind === K.In) return true;
        if (kind === K.Semicolon || kind === K.Assign) return false;
      }
    }
    return false;
  }

  private parseDoWhileStmt(label?: string): AST.DoWhileStmt {
    const start = this.cur();
    this.expect(K.Do);
    const body = this.parseBlock();
    this.expect(K.While);
    const condition = this.parseCondition();
    this.endStatement();
    return { kind: 'DoWhileStmt', body, condition, label, range: this.rangeFrom(start) };
  }

  private parseTryStmt(): AST.TryStmt {
    const start = this.cur();
    this.expect(K.Try);
    const tryBlock = this.parseBlock();
    const catchClauses: AST.CatchClause[] = [];
    while (this.at(K.Catch)) {
      const cStart = this.advance();
      const types: string[] = [];
      let name: string | undefined;
      // catch (A | B as e) { }, catch (e) { }, catch Err(e: T) { }, catch { }
      if (this.isWord(this.cur()) && this.kindAt(1) === K.LeftParen) {
        types.push(this.advance().text);
      }
      if (this.at(K.LeftParen)) {
        const close = this.matchingClose(this.pos);
        if (close < 0) this.fail("Expected ')' to close the catch clause", this.cur());
        for (let i = this.pos + 1; i < close; i++) {
          const tok = this.tokens[i];
          if (tok.kind === K.As && this.isWord(this.tokens[i + 1])) {
            name = this.tokens[i + 1].text;
            break;
          }
          if (this.isWord(tok) && this.tokens[i - 1].kind !== K.Dot) types.push(tok.text);
        }
        if (name === undefined && types.length > 0 && close - this.pos >= 2 && this.isWord(this.tokens[this.pos + 1])) {
          // catch (e) / catch Err(e: T): the first word is the binding
          const first = this.tokens[this.pos + 1].text;
          if (close - this.pos === 2 || this.tokens[this.pos + 2].kind === K.Colon) {
            name = first;
            types.splice(types.indexOf(first), 1);
          }
        }
        this.skipBalanced();
      }
      const body = this.parseBlock();
      catchClauses.push({ kind: 'CatchClause', types, name, body, range: this.rangeFrom(cStart) });
    }
    let finallyBlock: AST.Block | undefined;
    if (this.eat(K.Finally)) finallyBlock = this.parseBlock();
    return { kind: 'TryStmt', tryBlock, catchClauses, finallyBlock, range: this.rangeFrom(start) };
  }

  private parseWithStmt(): AST.WithStmt {
    const start = this.cur();
    this.expect(K.With);
    this.expect(K.LeftParen);
    const bindings: AST.WithBinding[] = [];
    while (!this.at(K.RightParen)) {
      const bStart = this.cur();
      let name = '';
      if (this.isWord(bStart) && this.kindAt(1) === K.Assign) {
        name = this.advance().text;
        this.advance();
      }
      const resource = this.parseExpression();
      bindings.push({ kind: 'WithBinding', name, resource, range: this.rangeFrom(bStart) });
      if (!this.eat(K.Comma)) break;
    }
    this.expect(K.RightParen);
    const body = this.parseBlock();
    return { kind: 'WithStmt', bindings, body, range: this.rangeFrom(start) };
  }

  private parseDeferStmt(): AST.DeferCallStmt | AST.DeferBlockStmt {
    const start = this.cur();
    this.expect(K.Defer);
    if (this.at(K.LeftBrace)) {
      const body = this.parseBlock();
      return { kind: 'DeferBlockStmt', body, range: this.rangeFrom(start) };
    }
    const expression = this.parseExpression();
    this.endStatement();
    return { kind: 'DeferCallStmt', expression, range: this.rangeFrom(start) };
  }

  private parsePortalStmt(): AST.PortalStmt {
    const start = this.cur();
    this.expect(K.Portal);
    let name: string;
    if (this.at(K.StringLiteral)) {
      name = this.advance().text.slice(1, -1);
    } else {
      name = this.expectName('a portal name').text;
    }
    const body = this.parseBlock();
    return { kind: 'PortalStmt', name, body, range: this.rangeFrom(start) };
  }

  private parseAwaitGroupStmt(): AST.AwaitGroupStmt {
    const start = this.cur();
    this.expect(K.Await);
    this.expect(K.Group);
    const body = this.parseBlock();
    return { kind: 'AwaitGroupStmt', body, range: this.rangeFrom(start) };
  }

  /** `dynamic obj as alias { ... }`; `dynamic` alone is an ordinary name. */
  private parseDynamicViewStmt(): AST.Statement {
    const start = this.cur();
    const next = this.peekTok(1);
    const startsOperand = next.line === start.endLine
      && (this.isWord(next) || next.kind === K.LeftParen)
      && !NOT_AN_EXPRESSION.has(next.kind);
    if (!startsOperand) return this.parseExpressionStmt();
    this.advance();
    let object = this.parseExpression();
    let alias = '';
    if (object.kind === 'CastExpr' && object.targetType.kind === 'SimpleType') {
      alias = object.targetType.name;
      object = object.expression;
    }
    const body = this.parseBlock();
    return { kind: 'DynamicViewStmt', object, alias, body, range: this.rangeFrom(start) };
  }

  /** `asm { ... }` and `quote { ... }`: the body is not Loup statement syntax; skip it as a token tree. */
  private parseOpaqueBlock(name: string): AST.ExpressionStmt {
    const start = this.advance();
    this.skipBalanced();
    this.eat(K.Semicolon);
    return {
      kind: 'ExpressionStmt',
      expression: { kind: 'Identifier', name, range: this.tokenRange(start) },
      range: this.rangeFrom(start),
    };
  }

  private parseDelStmt(): AST.DelStmt {
    const start = this.cur();
    this.expect(K.Del);
    const target = this.parseExpression();
    this.endStatement();
    return { kind: 'DelStmt', target, range: this.rangeFrom(start) };
  }

  private parseGlobalDecl(): AST.GlobalDecl {
    const start = this.cur();
    this.expect(K.Global);
    const name = this.expectName('a name').text;
    while (this.eat(K.Comma)) this.expectName('a name');
    this.endStatement();
    return { kind: 'GlobalDecl', name, range: this.rangeFrom(start) };
  }

  private parseNonlocalDecl(): AST.NonlocalDecl {
    const start = this.cur();
    this.expect(K.Nonlocal);
    const name = this.expectName('a name').text;
    while (this.eat(K.Comma)) this.expectName('a name');
    this.endStatement();
    return { kind: 'NonlocalDecl', name, range: this.rangeFrom(start) };
  }

  private parseYieldStmt(): AST.YieldStmt | AST.YieldFromStmt {
    const start = this.cur();
    this.expect(K.Yield);
    if (this.at(K.Star)) {
      this.advance();
      const iterable = this.parseExpression();
      this.endStatement();
      return { kind: 'YieldFromStmt', iterable, range: this.rangeFrom(start) };
    }
    const value = this.startsExpression() && this.sameLine() ? this.parseExpression() : undefined;
    this.endStatement();
    return { kind: 'YieldStmt', value, range: this.rangeFrom(start) };
  }

  private parseLabeledStmt(): AST.Statement {
    const label = this.advance().text;
    this.expect(K.Colon);
    if (this.at(K.For)) return this.parseForStmt(label);
    if (this.at(K.While)) return this.parseWhileStmt(label);
    return this.parseDoWhileStmt(label);
  }

  private parseExpressionStmt(): AST.ExpressionStmt {
    const start = this.cur();
    const expression = this.parseExpression();
    if (expression.kind === 'StatementExpr' && (start.kind === K.If || start.kind === K.Match)) {
      return this.finishBlockExpression(expression, start) as AST.ExpressionStmt;
    }
    this.endStatement();
    return { kind: 'ExpressionStmt', expression, range: this.rangeFrom(start) };
  }

  private parseBlock(): AST.Block {
    const start = this.cur();
    this.expect(K.LeftBrace);
    const statements = this.parseStatementList(K.RightBrace, 'block');
    this.closeBrace();
    return { kind: 'Block', statements, range: this.rangeFrom(start) };
  }

  /**
   * The `}` of a block or body. Reaching end of file instead is reported without
   * throwing, so the declaration being typed keeps its place in the outline.
   */
  private closeBrace(): void {
    if (this.at(K.RightBrace)) {
      this.advance();
      return;
    }
    if (this.atEnd()) {
      this.addDiagnostic("Expected '}' but found end of file", this.rangeAfterPrev());
      return;
    }
    this.fail(`Expected '}' but found ${this.describe(this.cur())}`);
  }

  // ==========================================================================
  // Expressions
  // ==========================================================================

  private parseExpression(): AST.Expression {
    this.enter();
    try {
      return this.parseAssignment();
    } finally {
      this.depth--;
    }
  }

  private parseAssignment(): AST.Expression {
    const left = this.parseNullCoalesce();
    if (this.at(K.Assign)) {
      this.advance();
      const value = this.parseExpression();
      return { kind: 'AssignExpr', target: left, value, range: this.spanFrom(left) };
    }
    if (COMPOUND_ASSIGN.has(this.cur().kind)) {
      const operator = this.advance().text;
      const value = this.parseExpression();
      return { kind: 'CompoundAssignExpr', operator, target: left, value, range: this.spanFrom(left) };
    }
    return left;
  }

  private parseNullCoalesce(): AST.Expression {
    let left = this.parseOr();
    while (this.at(K.QuestionQuestion)) {
      this.advance();
      const right = this.parseOr();
      left = { kind: 'NullCoalesceExpr', left, right, range: this.spanFrom(left) };
    }
    return left;
  }

  private parseOr(): AST.Expression {
    let left = this.parseAnd();
    while (this.at(K.Or)) {
      this.advance();
      const right = this.parseAnd();
      left = { kind: 'BinaryExpr', operator: '||', left, right, range: this.spanFrom(left) };
    }
    return left;
  }

  private parseAnd(): AST.Expression {
    let left = this.parseBitwiseOr();
    while (this.at(K.And)) {
      this.advance();
      const right = this.parseBitwiseOr();
      left = { kind: 'BinaryExpr', operator: '&&', left, right, range: this.spanFrom(left) };
    }
    return left;
  }

  private parseBitwiseOr(): AST.Expression {
    let left = this.parseBitwiseXor();
    while (this.at(K.Pipe)) {
      this.advance();
      const right = this.parseBitwiseXor();
      left = { kind: 'BinaryExpr', operator: '|', left, right, range: this.spanFrom(left) };
    }
    return left;
  }

  private parseBitwiseXor(): AST.Expression {
    let left = this.parseBitwiseAnd();
    while (this.at(K.Caret)) {
      this.advance();
      const right = this.parseBitwiseAnd();
      left = { kind: 'BinaryExpr', operator: '^', left, right, range: this.spanFrom(left) };
    }
    return left;
  }

  private parseBitwiseAnd(): AST.Expression {
    let left = this.parseEquality();
    while (this.at(K.Ampersand)) {
      this.advance();
      const right = this.parseEquality();
      left = { kind: 'BinaryExpr', operator: '&', left, right, range: this.spanFrom(left) };
    }
    return left;
  }

  private parseEquality(): AST.Expression {
    let left = this.parseComparison();
    while (this.at(K.EqualEqual) || this.at(K.BangEqual)) {
      const operator = this.advance().text;
      const right = this.parseComparison();
      left = { kind: 'BinaryExpr', operator, left, right, range: this.spanFrom(left) };
    }
    return left;
  }

  private parseComparison(): AST.Expression {
    let left = this.parseMembership();
    while (this.at(K.LessThan) || this.at(K.LessEqual) || this.at(K.GreaterThan) || this.at(K.GreaterEqual)) {
      const operator = this.advance().text;
      const right = this.parseMembership();
      left = { kind: 'BinaryExpr', operator, left, right, range: this.spanFrom(left) };
    }
    return left;
  }

  private parseMembership(): AST.Expression {
    let left = this.parseShift();
    while (this.at(K.In) || (this.at(K.Not) && this.kindAt(1) === K.In)) {
      const operator = this.at(K.Not) ? (this.advance(), 'not in') : 'in';
      this.expect(K.In);
      const right = this.parseShift();
      left = { kind: 'BinaryExpr', operator, left, right, range: this.spanFrom(left) };
    }
    return left;
  }

  private parseShift(): AST.Expression {
    let left = this.parseRange();
    while (this.at(K.ShiftLeft) || this.at(K.ShiftRight)) {
      const operator = this.advance().text;
      const right = this.parseRange();
      left = { kind: 'BinaryExpr', operator, left, right, range: this.spanFrom(left) };
    }
    return left;
  }

  private parseRange(): AST.Expression {
    let left = this.parseAddition();
    while (this.at(K.DotDot) || this.at(K.DotDotEqual)) {
      const operator = this.advance().text;
      // An open range (`0..`) has no upper bound.
      if (!this.startsExpression()) {
        return { kind: 'UnaryExpr', operator, operand: left, range: this.spanFrom(left) };
      }
      const right = this.parseAddition();
      left = { kind: 'BinaryExpr', operator, left, right, range: this.spanFrom(left) };
    }
    return left;
  }

  private parseAddition(): AST.Expression {
    let left = this.parseMultiplication();
    while (this.at(K.Plus) || this.at(K.Minus)) {
      const operator = this.advance().text;
      const right = this.parseMultiplication();
      left = { kind: 'BinaryExpr', operator, left, right, range: this.spanFrom(left) };
    }
    return left;
  }

  private parseMultiplication(): AST.Expression {
    let left = this.parseExponentiation();
    while (this.at(K.Star) || this.at(K.Slash) || this.at(K.SlashSlash) || this.at(K.Percent)) {
      const operator = this.advance().text;
      const right = this.parseExponentiation();
      left = { kind: 'BinaryExpr', operator, left, right, range: this.spanFrom(left) };
    }
    return left;
  }

  private parseExponentiation(): AST.Expression {
    const left = this.parseUnary();
    if (this.at(K.StarStar)) {
      const operator = this.advance().text;
      const right = this.parseExponentiation(); // right-associative
      return { kind: 'BinaryExpr', operator, left, right, range: this.spanFrom(left) };
    }
    return left;
  }

  private parseUnary(): AST.Expression {
    this.enter();
    try {
      return this.parseUnaryInner();
    } finally {
      this.depth--;
    }
  }

  private parseUnaryInner(): AST.Expression {
    const start = this.cur();
    switch (start.kind) {
      case K.Bang:
      case K.Minus:
      case K.Plus:
      case K.Tilde:
      case K.Not:
      case K.Bnot:
      case K.Typeof:
      case K.Attempt:
      case K.Consume: {
        this.advance();
        const operand = this.parseUnary();
        return { kind: 'UnaryExpr', operator: start.text, operand, range: this.rangeFrom(start) };
      }
      case K.Star:
      case K.StarStar: {
        // Spread: *expr or **expr
        this.advance();
        let operator: '*' | '**' = start.kind === K.Star ? '*' : '**';
        if (operator === '*' && this.at(K.Star)) {
          this.advance();
          operator = '**';
        }
        const expression = this.parseUnary();
        return { kind: 'SpreadExpr', operator, expression, range: this.rangeFrom(start) };
      }
      case K.DotDot:
      case K.DotDotEqual: {
        // A range with no lower bound: `..n`
        this.advance();
        const operand = this.parseAddition();
        return { kind: 'UnaryExpr', operator: start.text, operand, range: this.rangeFrom(start) };
      }
      case K.Await: {
        this.advance();
        const expression = this.parseUnary();
        return { kind: 'AwaitExpr', expression, range: this.rangeFrom(start) };
      }
      case K.Spawn:
        if (this.startsExpressionAt(1) && this.kindAt(1) !== K.LeftParen) {
          this.advance();
          const expression = this.parseUnary();
          return { kind: 'SpawnExpr', expression, range: this.rangeFrom(start) };
        }
        break;
      case K.Box:
        // `box` is the widening prefix only when an operand follows on the same line.
        if (this.startsOperandAt(1)) {
          this.advance();
          const expression = this.parseUnary();
          return { kind: 'BoxExpr', expression, range: this.rangeFrom(start) };
        }
        break;
      case K.Shared:
        // `shared T(...)` / `shared(arena) T(...)` allocates a shared-class instance.
        this.advance();
        if (this.at(K.LeftParen)) this.skipBalanced();
        return this.parseUnary();
      default:
        break;
    }
    return this.parsePostfix();
  }

  /** Is the token `offset` ahead the start of an operand on the current token's line? */
  private startsOperandAt(offset: number): boolean {
    const tok = this.peekTok(offset);
    if (tok.line !== this.cur().endLine) return false;
    switch (tok.kind) {
      case K.Identifier:
      case K.TypeIdentifier:
      case K.IntLiteral:
      case K.FloatLiteral:
      case K.StringLiteral:
      case K.CharLiteral:
      case K.InterpolatedStringLiteral:
      case K.RawStringLiteral:
      case K.BytesLiteral:
      case K.MultilineStringLiteral:
      case K.True:
      case K.False:
      case K.None:
      case K.This:
      case K.Self:
      case K.LeftBrace:
      case K.MacroSplice:
      case K.Fun:
      case K.Match:
      case K.If:
      case K.Minus:
      case K.Not:
      case K.Box:
      case K.Await:
        return true;
      default:
        return isKeywordKind(tok.kind) && !NOT_AN_EXPRESSION.has(tok.kind) && this.peekTok(offset + 1).kind !== K.Assign;
    }
  }

  private parsePostfix(): AST.Expression {
    return this.parsePostfixOps(this.parsePrimary());
  }

  private parsePostfixOps(operand: AST.Expression): AST.Expression {
    let expr = operand;
    for (;;) {
      const tok = this.cur();
      switch (tok.kind) {
        case K.LeftParen: {
          const args = this.parseArgs();
          expr = { kind: 'CallExpr', callee: expr, args, range: this.spanFrom(expr) };
          continue;
        }
        case K.Dot: {
          this.advance();
          const member = this.cur();
          // `.name`, and tuple fields `.0` (`.0.1` lexes as a float)
          if (!this.isWord(member) && member.kind !== K.IntLiteral && member.kind !== K.FloatLiteral && member.kind !== K.MacroSplice) {
            this.fail(`Expected a member name after '.' but found ${this.describe(member)}`);
          }
          this.advance();
          expr = { kind: 'MemberExpr', object: expr, property: member.text, range: this.spanFrom(expr) };
          continue;
        }
        case K.QuestionDot: {
          this.advance();
          if (this.at(K.LeftBracket)) {
            expr = this.parseIndex(expr, true);
          } else {
            const member = this.cur();
            if (!this.isWord(member) && member.kind !== K.IntLiteral) {
              this.fail(`Expected a member name after '?.' but found ${this.describe(member)}`);
            }
            this.advance();
            expr = { kind: 'OptionalChainExpr', object: expr, property: member.text, range: this.spanFrom(expr) };
          }
          continue;
        }
        case K.LeftBracket:
          expr = this.parseIndex(expr, false);
          continue;
        case K.BangLeftBrace: {
          this.advance();
          const fieldTok = this.advance();
          const field = fieldTok.kind === K.StringLiteral ? fieldTok.text.slice(1, -1) : fieldTok.text;
          this.expect(K.RightBrace);
          expr = { kind: 'DynamicFieldExpr', object: expr, field, range: this.spanFrom(expr) };
          continue;
        }
        case K.Question:
          // Postfix propagation. Loup has no ternary operator.
          this.advance();
          expr = { kind: 'PropagationExpr', expression: expr, range: this.spanFrom(expr) };
          continue;
        case K.Bang:
          // Postfix force-unwrap: `opt!`
          this.advance();
          expr = { kind: 'UnaryExpr', operator: '!', operand: expr, range: this.spanFrom(expr) };
          continue;
        case K.As: {
          this.advance();
          let safe = false;
          if ((this.at(K.Question) || this.at(K.Bang)) && this.cur().offset === this.prev().offset + this.prev().length) {
            safe = this.at(K.Question);
            this.advance();
          }
          const targetType = this.parseTypeNoUnion();
          expr = { kind: 'CastExpr', expression: expr, targetType, safe, range: this.spanFrom(expr) };
          continue;
        }
        case K.Is: {
          this.advance();
          const negated = this.eat(K.Not);
          const targetType = this.parseTypeNoUnion();
          expr = { kind: 'IsExpr', expression: expr, targetType, range: this.spanFrom(expr) };
          if (negated) expr = { kind: 'UnaryExpr', operator: 'not', operand: expr, range: expr.range };
          continue;
        }
        case K.Instanceof: {
          this.advance();
          const targetType = this.parseTypeNoUnion();
          expr = { kind: 'IsExpr', expression: expr, targetType, range: this.spanFrom(expr) };
          continue;
        }
        case K.With:
          // Copy-with: `s with (field = value)`
          if (this.kindAt(1) === K.LeftParen && this.sameLine()) {
            this.advance();
            const args = this.parseArgs();
            expr = { kind: 'CallExpr', callee: expr, args, range: this.spanFrom(expr) };
            continue;
          }
          return expr;
        default:
          return expr;
      }
    }
  }

  /** `( args )`: positional, named (`a = 1`, `a: 1`), verb acknowledgments (`edits: x`), spreads. */
  private parseArgs(): AST.Expression[] {
    this.expect(K.LeftParen);
    const args: AST.Expression[] = [];
    while (!this.at(K.RightParen)) {
      if (this.at(K.At)) {
        // `@unsafe("reason")` acknowledgment
        this.parseAnnotation();
        if (this.at(K.Comma)) {
          this.advance();
          continue;
        }
        if (this.at(K.RightParen)) break;
      }
      if (this.isWord(this.cur()) && this.kindAt(1) === K.Colon) {
        this.advance();
        this.advance();
      }
      let arg = this.parseExpression();
      if (this.at(K.For)) arg = this.parseComprehensionTail(arg, 'list', arg);
      args.push(arg);
      if (!this.eat(K.Comma)) break;
    }
    this.expect(K.RightParen);
    return args;
  }

  /** `[i]`, `[a:b:c]`, `[i, j:k, ::2]` and explicit type arguments `f[T](x)`. */
  private parseIndex(object: AST.Expression, optional: boolean): AST.Expression {
    this.expect(K.LeftBracket);
    let first: AST.Expression | undefined;
    let slice: { start?: AST.Expression; end?: AST.Expression; step?: AST.Expression } | undefined;
    let count = 0;
    while (!this.at(K.RightBracket)) {
      let start: AST.Expression | undefined;
      if (!this.at(K.Colon)) start = this.parseExpression();
      if (this.at(K.Colon)) {
        this.advance();
        const end = this.atIndexBoundary() ? undefined : this.parseExpression();
        let step: AST.Expression | undefined;
        if (this.eat(K.Colon)) step = this.atIndexBoundary() ? undefined : this.parseExpression();
        if (count === 0) slice = { start, end, step };
      } else if (count === 0) {
        first = start;
      }
      count++;
      if (!this.eat(K.Comma)) break;
    }
    this.expect(K.RightBracket);
    const range = this.spanFrom(object);
    if (slice) {
      return { kind: 'SliceExpr', object, start: slice.start, end: slice.end, step: slice.step, optional: optional || undefined, range };
    }
    const index: AST.Expression = first ?? { kind: 'TupleLiteral', elements: [], range };
    return { kind: 'IndexExpr', object, index, optional: optional || undefined, range };
  }

  private atIndexBoundary(): boolean {
    return this.at(K.RightBracket) || this.at(K.Colon) || this.at(K.Comma);
  }

  private parsePrimary(): AST.Expression {
    const token = this.cur();

    switch (token.kind) {
      case K.IntLiteral:
        this.advance();
        return { kind: 'IntLiteral', value: token.text, range: this.tokenRange(token) };

      case K.FloatLiteral:
        this.advance();
        return { kind: 'FloatLiteral', value: token.text, range: this.tokenRange(token) };

      case K.StringLiteral:
      case K.CharLiteral:
      case K.RawStringLiteral:
      case K.MultilineStringLiteral:
        this.advance();
        this.checkTerminated(token, 'string literal');
        return { kind: 'StringLiteral', value: token.text, hasInterpolation: false, range: this.tokenRange(token) };

      case K.InterpolatedStringLiteral:
        this.advance();
        this.checkTerminated(token, 'string literal');
        return { kind: 'StringLiteral', value: token.text, hasInterpolation: token.text.includes('{$'), range: this.tokenRange(token) };

      case K.BytesLiteral:
        this.advance();
        this.checkTerminated(token, 'bytes literal');
        return { kind: 'BytesLiteral', value: token.text, range: this.tokenRange(token) };

      case K.TemplateFenceOpen:
        this.advance();
        this.checkTerminated(token, 'template fence');
        return { kind: 'TemplateFenceExpr', language: '', format: '', descriptors: {}, content: token.text, range: this.tokenRange(token) };

      case K.True:
      case K.False:
        this.advance();
        return { kind: 'BoolLiteral', value: token.kind === K.True, range: this.tokenRange(token) };

      case K.None:
        this.advance();
        return { kind: 'NoneLiteral', range: this.tokenRange(token) };

      case K.MacroSplice:
        this.advance();
        return { kind: 'Identifier', name: token.text, range: this.tokenRange(token) };

      case K.Match:
        return this.parseMatchExpr();

      case K.If: {
        const statement = this.parseIfStmt();
        return { kind: 'StatementExpr', statement, range: statement.range };
      }

      case K.Fun:
        return this.parseFunExpr();

      case K.Async:
        if (this.kindAt(1) === K.Fun || (this.kindAt(1) === K.Gen && this.kindAt(2) === K.Fun)) return this.parseFunExpr();
        break;

      case K.Gen:
        if (this.kindAt(1) === K.Fun) return this.parseFunExpr();
        this.fail(`Expected an expression but found ${this.describe(token)}`);
        break;

      case K.LifetimeLabel:
        // A lifetime argument where an expression is expected: `Node[~tree](...)`
        this.advance();
        return { kind: 'Identifier', name: token.text, range: this.tokenRange(token) };

      case K.Fn:
      case K.Noescape:
        if (this.kindAt(1) === K.LeftParen || this.kindAt(1) === K.Fn) {
          // A function type where an expression is expected: an explicit type argument, f[fn(int): int](g)
          const type = this.parseType();
          return { kind: 'Identifier', name: 'fn', range: type.range };
        }
        break;

      case K.Return:
      case K.Break:
      case K.Continue:
      case K.Throw:
        return this.parseJump();

      case K.Yield: {
        const statement = this.parseYieldExprAsStatement();
        return { kind: 'StatementExpr', statement, range: statement.range };
      }

      case K.Try: {
        const statement = this.parseTryStmt();
        return { kind: 'StatementExpr', statement, range: statement.range };
      }

      case K.Unsafe:
      case K.Safe:
      case K.Atomic:
        // A block in value position: `let v = unsafe("reason") { ... };`
        if ((token.kind === K.Unsafe && this.kindAt(1) === K.LeftParen) || this.kindAt(1) === K.LeftBrace) {
          const close = token.kind === K.Unsafe ? this.matchingClose(this.pos + 1) : this.pos;
          if (close >= 0 && this.tokens[close + 1]?.kind === K.LeftBrace) {
            this.advance();
            if (this.at(K.LeftParen)) this.skipBalanced();
            const statement = this.parseBlock();
            return { kind: 'StatementExpr', statement, range: this.rangeFrom(token) };
          }
        }
        break;

      case K.New:
        if (this.isWord(this.peekTok(1)) && this.peekTok(1).line === token.endLine) {
          // Legacy `new Type(args)`
          this.advance();
          const className = this.advance().text;
          const args = this.at(K.LeftParen) ? this.parseArgs() : [];
          return { kind: 'NewExpr', className, args, range: this.rangeFrom(token) };
        }
        break;

      case K.Dot:
        // A field reference with the receiver implied: `p.set(.srcPort, value)`
        if (this.isWord(this.peekTok(1))) {
          this.advance();
          const member = this.advance();
          return { kind: 'Identifier', name: '.' + member.text, range: this.rangeFrom(token) };
        }
        break;

      case K.At: {
        // An annotation in expression position: an `@unsafe("reason")` acknowledgment
        this.parseAnnotation();
        return this.parseExpression();
      }

      case K.LeftParen:
        return this.parseParenthesized();

      case K.LeftBracket:
        return this.parseListLiteral();

      case K.LeftBrace:
        return this.parseBraceLiteral();

      case K.Identifier:
      case K.TypeIdentifier:
        break;

      default:
        if (!isKeywordKind(token.kind) || NOT_AN_EXPRESSION.has(token.kind)) {
          this.fail(`Expected an expression but found ${this.describe(token)}`);
        }
        break;
    }

    // A name. Macro invocation: name!(token trees)
    this.advance();
    if (this.at(K.Bang) && this.kindAt(1) === K.LeftParen && this.cur().offset === token.offset + token.length) {
      this.advance();
      this.skipBalanced();
      return { kind: 'MacroInvocationExpr', name: token.text, args: [], range: this.rangeFrom(token) };
    }
    return { kind: 'Identifier', name: token.text, range: this.tokenRange(token) };
  }

  /** `return [expr]`, `throw expr [from cause]`, `break [label]`, `continue [label]`. */
  private parseJump(): AST.Expression {
    const start = this.advance();
    let statement: AST.Statement;
    switch (start.kind) {
      case K.Return: {
        // A value belongs to the `return` only when it starts on the same line.
        const value = this.startsExpression() && this.sameLine() ? this.parseExpression() : undefined;
        statement = { kind: 'ReturnStmt', value, range: this.rangeFrom(start) };
        break;
      }
      case K.Throw: {
        const value = this.parseExpression();
        const from = this.eat(K.From) ? this.parseExpression() : undefined;
        statement = { kind: 'ThrowStmt', value, from, range: this.rangeFrom(start) };
        break;
      }
      default: {
        const labelTok = this.cur();
        const label = (labelTok.kind === K.Identifier || labelTok.kind === K.TypeIdentifier) && this.sameLine()
          ? this.advance().text
          : undefined;
        statement = start.kind === K.Break
          ? { kind: 'BreakStmt', label, range: this.rangeFrom(start) }
          : { kind: 'ContinueStmt', label, range: this.rangeFrom(start) };
        break;
      }
    }
    return { kind: 'StatementExpr', statement, range: statement.range };
  }

  private parseYieldExprAsStatement(): AST.YieldStmt | AST.YieldFromStmt {
    const start = this.advance();
    if (this.at(K.Star)) {
      this.advance();
      const iterable = this.parseExpression();
      return { kind: 'YieldFromStmt', iterable, range: this.rangeFrom(start) };
    }
    const value = this.startsExpression() && this.sameLine() ? this.parseExpression() : undefined;
    return { kind: 'YieldStmt', value, range: this.rangeFrom(start) };
  }

  /** `()`, `(expr)`, `(a, b)`, `(expr for (x in xs))` */
  private parseParenthesized(): AST.Expression {
    const start = this.advance();
    if (this.at(K.RightParen)) {
      this.advance();
      return { kind: 'TupleLiteral', elements: [], range: this.rangeFrom(start) };
    }
    const first = this.parseTupleElement();
    if (this.at(K.For)) {
      const comprehension = this.parseComprehensionTail(first, 'list', first);
      this.expect(K.RightParen);
      comprehension.range = this.rangeFrom(start);
      return comprehension;
    }
    if (this.at(K.Comma)) {
      const elements: AST.Expression[] = [first];
      while (this.eat(K.Comma)) {
        if (this.at(K.RightParen)) break;
        elements.push(this.parseTupleElement());
      }
      this.expect(K.RightParen);
      return { kind: 'TupleLiteral', elements, range: this.rangeFrom(start) };
    }
    this.expect(K.RightParen);
    return { kind: 'GroupExpr', expression: first, range: this.rangeFrom(start) };
  }

  /** A tuple element; a named one (`(x: 1, y: 2)`) drops its label. */
  private parseTupleElement(): AST.Expression {
    if (this.isWord(this.cur()) && this.kindAt(1) === K.Colon) {
      this.advance();
      this.advance();
    }
    return this.parseExpression();
  }

  private parseListLiteral(): AST.Expression {
    const start = this.advance();
    const elements: AST.Expression[] = [];
    while (!this.at(K.RightBracket)) {
      const element = this.parseExpression();
      if (elements.length === 0 && this.at(K.For)) {
        const comprehension = this.parseComprehensionTail(element, 'list', element);
        this.expect(K.RightBracket);
        comprehension.range = this.rangeFrom(start);
        return comprehension;
      }
      // `[value; count]` repeat form
      if (elements.length === 0 && this.at(K.Semicolon)) {
        this.advance();
        this.parseExpression();
        elements.push(element);
        break;
      }
      elements.push(element);
      if (!this.eat(K.Comma)) break;
    }
    this.expect(K.RightBracket);
    return { kind: 'ListLiteral', elements, range: this.rangeFrom(start) };
  }

  /** `{}`, `{k: v, **rest}`, `{a, b}`, and the dict / set comprehensions. */
  private parseBraceLiteral(): AST.Expression {
    const start = this.advance();
    const entries: [AST.Expression, AST.Expression][] = [];
    const elements: AST.Expression[] = [];
    let isDict = this.at(K.RightBrace);
    while (!this.at(K.RightBrace)) {
      const key = this.parseExpression();
      if (this.at(K.Colon)) {
        this.advance();
        const value = this.parseExpression();
        if (entries.length === 0 && elements.length === 0 && this.at(K.For)) {
          const body: AST.TupleLiteral = { kind: 'TupleLiteral', elements: [key, value], range: this.spanFrom(key) };
          const comprehension = this.parseComprehensionTail(body, 'dict', body);
          this.expect(K.RightBrace);
          comprehension.range = this.rangeFrom(start);
          return comprehension;
        }
        isDict = true;
        entries.push([key, value]);
      } else {
        if (entries.length === 0 && elements.length === 0 && this.at(K.For)) {
          const comprehension = this.parseComprehensionTail(key, 'set', key);
          this.expect(K.RightBrace);
          comprehension.range = this.rangeFrom(start);
          return comprehension;
        }
        if (key.kind === 'SpreadExpr' && key.operator === '**') isDict = true;
        elements.push(key);
      }
      if (!this.eat(K.Comma)) break;
    }
    this.expect(K.RightBrace);
    if (isDict) return { kind: 'DictLiteral', entries, range: this.rangeFrom(start) };
    return { kind: 'SetLiteral', elements, range: this.rangeFrom(start) };
  }

  /** `for (pattern in iterable)` followed by any number of `if (cond)` / `for (...)` clauses. */
  private parseComprehensionTail(body: AST.Expression, resultKind: 'list' | 'dict' | 'set', anchor: AST.Expression): AST.ComprehensionExpr {
    let pattern: AST.DestructPattern | undefined;
    let iterable: AST.Expression | undefined;
    let condition: AST.Expression | undefined;
    while (this.at(K.For) || this.at(K.If)) {
      if (this.eat(K.If)) {
        const cond = this.parseExpression();
        condition = condition ?? cond;
        continue;
      }
      this.advance();
      // `for (x in xs)` is the reference form; the toolchain also takes `for x in xs`.
      const parenthesized = this.at(K.LeftParen) && this.hasInAheadFrom(this.pos + 1);
      if (parenthesized) this.advance();
      if (this.at(K.Let) || this.at(K.Var)) this.advance();
      const p = this.parseDestructPattern();
      this.expect(K.In);
      const it = this.parseExpression();
      if (parenthesized) this.expect(K.RightParen);
      pattern = pattern ?? p;
      iterable = iterable ?? it;
    }
    return { kind: 'ComprehensionExpr', resultKind, body, pattern: pattern!, iterable: iterable!, condition, range: this.spanFrom(anchor) };
  }

  private parseMatchExpr(): AST.MatchExpr {
    const start = this.cur();
    this.expect(K.Match);
    const subject = this.parseExpression();
    this.expect(K.LeftBrace);
    const arms: AST.MatchArm[] = [];
    while (!this.at(K.RightBrace) && !this.atEnd()) {
      if (this.at(K.Comma) || this.at(K.Semicolon)) {
        this.advance();
        continue;
      }
      const armStart = this.cur();
      this.skipAnnotations();
      const pattern = this.parsePattern();
      let guard: AST.Expression | undefined;
      if (this.eat(K.If)) guard = this.parseExpression();
      this.expect(K.Arrow);
      const body = this.parseArrowBody();
      arms.push({ kind: 'MatchArm', pattern, guard, body, range: this.rangeFrom(armStart) });
    }
    this.closeBrace();
    return { kind: 'MatchExpr', subject, arms, range: this.rangeFrom(start) };
  }

  /** After `=>`: an expression, or a block (`None => { db.commit(); return true; }`). */
  private parseArrowBody(): AST.Expression {
    if (this.at(K.LeftBrace) && this.looksLikeBlock()) {
      const statement = this.parseBlock();
      return { kind: 'StatementExpr', statement, range: statement.range };
    }
    return this.parseExpression();
  }

  /** At `{` in a position that admits both a block and a dict / set literal. */
  private looksLikeBlock(): boolean {
    const first = this.peekTok(1);
    const second = this.peekTok(2);
    if (first.kind === K.RightBrace) return true;
    if (first.kind === K.StarStar) return false;
    if (second.kind === K.Colon) {
      const third = this.kindAt(3);
      const isLabel = this.isWord(first) && (third === K.For || third === K.While || third === K.Do);
      return isLabel;
    }
    if (second.kind === K.Comma) {
      // {a, b} is a set; `{ return a, ... }` cannot occur
      return false;
    }
    return true;
  }

  // ---- Patterns ----

  private parsePattern(): AST.Pattern {
    this.enter();
    try {
      const first = this.parsePatternPrimary();
      // Alternation is not in the v1.20 grammar; accept it rather than misreport.
      while (this.at(K.Pipe)) {
        this.advance();
        this.parsePatternPrimary();
      }
      return first;
    } finally {
      this.depth--;
    }
  }

  private parsePatternPrimary(): AST.Pattern {
    const token = this.cur();

    switch (token.kind) {
      case K.Minus:
      case K.IntLiteral:
      case K.FloatLiteral:
      case K.StringLiteral:
      case K.CharLiteral:
      case K.RawStringLiteral:
      case K.BytesLiteral:
      case K.InterpolatedStringLiteral:
      case K.MultilineStringLiteral:
      case K.True:
      case K.False: {
        if (token.kind === K.Minus) this.advance();
        this.advance();
        if (this.at(K.DotDot) || this.at(K.DotDotEqual)) {
          this.advance();
          this.eat(K.Minus);
          if (this.at(K.IntLiteral) || this.at(K.FloatLiteral) || this.at(K.CharLiteral) || this.at(K.StringLiteral)) this.advance();
        }
        return { kind: 'IdentifierPattern', name: token.text, range: this.rangeFrom(token) };
      }
      case K.LeftParen:
      case K.LeftBracket: {
        const close = token.kind === K.LeftParen ? K.RightParen : K.RightBracket;
        this.advance();
        const fields = this.parsePatternItems(close);
        this.expect(close);
        return { kind: 'ConstructorPattern', name: '', fields, range: this.rangeFrom(token) };
      }
      case K.LeftBrace: {
        this.advance();
        const fields = this.parseNamedPatternItems();
        this.expect(K.RightBrace);
        return { kind: 'ConstructorPattern', name: '', fields, range: this.rangeFrom(token) };
      }
      case K.Star: {
        this.advance();
        const rest = this.expectName('a name after "*"');
        return { kind: 'IdentifierPattern', name: rest.text, range: this.rangeFrom(token) };
      }
      case K.Borrow:
        if (this.kindAt(1) === K.LeftBracket || this.isWord(this.peekTok(1))) {
          this.advance();
          if (this.at(K.LeftBracket)) this.skipBalanced();
          const bound = this.expectName('a binding name');
          return { kind: 'IdentifierPattern', name: bound.text, range: this.rangeFrom(token) };
        }
        break;
      default:
        break;
    }

    if (!this.isNameToken(token)) {
      this.fail(`Expected a pattern but found ${this.describe(token)}`);
    }
    this.advance();
    if (token.text === '_') return { kind: 'WildcardPattern', range: this.tokenRange(token) };

    let name = token.text;
    while (this.at(K.Dot) && this.isNameToken(this.peekTok(1))) {
      this.advance();
      name += '.' + this.advance().text;
    }
    if (this.at(K.LeftBracket)) this.skipBalanced(); // type arguments: Box[int](v)

    if (this.at(K.LeftParen)) {
      this.advance();
      const fields = this.parsePatternItems(K.RightParen);
      this.expect(K.RightParen);
      return { kind: 'ConstructorPattern', name, fields, range: this.rangeFrom(token) };
    }
    if (this.at(K.LeftBrace)) {
      this.advance();
      const fields = this.parseNamedPatternItems();
      this.expect(K.RightBrace);
      return { kind: 'ConstructorPattern', name, fields, range: this.rangeFrom(token) };
    }
    // `Type name`-style binding is not Loup; a bare path or name ends here.
    return { kind: 'IdentifierPattern', name, range: this.rangeFrom(token) };
  }

  /** Positional or `name = pattern` items up to `close`. */
  private parsePatternItems(close: TokenKind): AST.Pattern[] {
    const items: AST.Pattern[] = [];
    while (!this.at(close)) {
      if (this.at(K.DotDot) || this.at(K.DotDotDot)) {
        this.advance();
      } else {
        if (this.isWord(this.cur()) && (this.kindAt(1) === K.Assign || this.kindAt(1) === K.Colon)) {
          this.advance();
          this.advance();
        }
        items.push(this.parsePattern());
      }
      if (!this.eat(K.Comma)) break;
    }
    return items;
  }

  /** `{ name: pattern, "key": name = default, **rest }` */
  private parseNamedPatternItems(): AST.Pattern[] {
    const items: AST.Pattern[] = [];
    while (!this.at(K.RightBrace)) {
      if (this.at(K.StarStar)) {
        this.advance();
        this.expectName('a name after "**"');
      } else {
        const key = this.cur();
        if (key.kind !== K.StringLiteral && !this.isNameToken(key)) {
          this.fail(`Expected a field name but found ${this.describe(key)}`);
        }
        this.advance();
        if (this.eat(K.Colon)) {
          items.push(this.parsePattern());
        } else {
          items.push({ kind: 'IdentifierPattern', name: key.text, range: this.tokenRange(key) });
        }
        if (this.eat(K.Assign)) this.parseExpression();
      }
      if (!this.eat(K.Comma) && !this.eat(K.Semicolon)) break;
    }
    return items;
  }

  // ---- Lambdas ----

  /** `func(params) [: Type] [captures] => expr` or `... { block }`, optionally `async`. */
  private parseFunExpr(): AST.FunExpr | AST.AsyncFunExpr {
    const start = this.cur();
    const isAsync = this.eat(K.Async);
    this.eat(K.Gen);
    this.expect(K.Fun);
    this.expect(K.LeftParen);
    const params = this.parseParamList();
    this.expect(K.RightParen);
    let returnType: AST.TypeExpr | undefined;
    for (;;) {
      if (this.at(K.Colon)) {
        this.advance();
        returnType = this.parseType();
      } else if (this.at(K.LeftBracket)) {
        this.skipBalanced(); // capture list: [weak self]
      } else {
        break;
      }
    }
    let body: AST.Block | AST.Expression;
    if (this.eat(K.Arrow)) {
      body = this.at(K.LeftBrace) && this.looksLikeBlock() ? this.parseBlock() : this.parseExpression();
    } else {
      body = this.parseBlock();
    }
    return { kind: isAsync ? 'AsyncFunExpr' : 'FunExpr', params, returnType, body, range: this.rangeFrom(start) };
  }

  // ==========================================================================
  // Types
  // ==========================================================================

  private parseType(): AST.TypeExpr {
    const first = this.parseTypeNoUnion();
    if (!this.at(K.Pipe)) return first;
    const members: AST.TypeExpr[] = [first];
    while (this.eat(K.Pipe)) members.push(this.parseTypeNoUnion());
    return { kind: 'UnionType', members, range: this.spanFromRange(first.range) };
  }

  private parseTypeNoUnion(): AST.TypeExpr {
    this.enter();
    try {
      let type = this.parseTypePrimary();
      // Optional sugar: T?
      while (this.at(K.Question)) {
        this.advance();
        type = { kind: 'OptionalType', inner: type, range: this.spanFromRange(type.range) };
      }
      return type;
    } finally {
      this.depth--;
    }
  }

  private parseTypePrimary(): AST.TypeExpr {
    const token = this.cur();

    // Function types: [async] [gen] [noescape] fn(params)[: Return]
    let i = 0;
    while (this.kindAt(i) === K.Async || this.kindAt(i) === K.Gen || this.kindAt(i) === K.Noescape) i++;
    if ((this.kindAt(i) === K.Fn || this.kindAt(i) === K.Fun) && this.kindAt(i + 1) === K.LeftParen) {
      let isAsync = false;
      let isNoescape = false;
      for (; i > 0; i--) {
        const modifier = this.advance();
        if (modifier.kind === K.Async) isAsync = true;
        if (modifier.kind === K.Noescape) isNoescape = true;
      }
      this.advance(); // fn | func
      this.expect(K.LeftParen);
      const params: AST.TypeExpr[] = [];
      while (!this.at(K.RightParen)) {
        if (this.at(K.Star) || this.at(K.StarStar)) this.advance();
        while (OWNERSHIP_KINDS.has(this.cur().kind) && this.kindAt(1) !== K.LeftBracket && this.startsTypeAt(1)) this.advance();
        if (this.isWord(this.cur()) && this.kindAt(1) === K.Colon) {
          this.advance();
          this.advance();
        }
        params.push(this.parseType());
        if (this.eat(K.Assign)) this.parseExpression();
        if (!this.eat(K.Comma)) break;
      }
      this.expect(K.RightParen);
      const returnType: AST.TypeExpr = this.eat(K.Colon)
        ? this.parseTypeNoUnion()
        : { kind: 'SimpleType', name: 'void', range: this.tokenRange(this.prev()) };
      if (isAsync) return { kind: 'AsyncFunctionType', params, returnType, range: this.rangeFrom(token) };
      return { kind: 'FunctionType', params, returnType, isNoescape, range: this.rangeFrom(token) };
    }

    // (Type) and (A, B)
    if (token.kind === K.LeftParen) {
      this.advance();
      const elements: AST.TypeExpr[] = [];
      while (!this.at(K.RightParen)) {
        elements.push(this.parseType());
        if (!this.eat(K.Comma)) break;
      }
      this.expect(K.RightParen);
      if (elements.length === 1) return elements[0];
      return { kind: 'TupleType', elements, range: this.rangeFrom(token) };
    }

    // Ownership prefixes: borrow[~a] T, excl borrow T, unowned[~o] T, ...
    if (OWNERSHIP_KINDS.has(token.kind)) {
      if (this.kindAt(1) === K.LeftBracket && this.kindAt(2) === K.LifetimeLabel) {
        this.advance();
        this.skipBalanced();
        return this.parseTypeNoUnion();
      }
      if (this.startsTypeAt(1) && this.peekTok(1).line === token.endLine) {
        this.advance();
        return this.parseTypeNoUnion();
      }
    }

    if (token.kind === K.MacroSplice) {
      this.advance();
      return { kind: 'SimpleType', name: token.text, range: this.tokenRange(token) };
    }

    if (!this.isWord(token)) {
      this.fail(`Expected a type but found ${this.describe(token)}`);
    }
    this.advance();
    let name = token.text;
    while (this.at(K.Dot) && this.isWord(this.peekTok(1))) {
      this.advance();
      name += '.' + this.advance().text;
    }

    // decimal(11, 2): the fixed-precision form
    if (name === 'decimal' && this.at(K.LeftParen)) {
      this.skipBalanced();
      return { kind: 'SimpleType', name, range: this.rangeFrom(token) };
    }

    if (this.at(K.LeftBracket) && this.kindAt(1) !== K.Weak && this.kindAt(1) !== K.Unowned) {
      const args = this.parseTypeArgs();
      if (name === 'tuple') return { kind: 'TupleType', elements: args, range: this.rangeFrom(token) };
      return { kind: 'GenericType', name, args, range: this.rangeFrom(token) };
    }
    return { kind: 'SimpleType', name, range: this.rangeFrom(token) };
  }

  private startsTypeAt(offset: number): boolean {
    const tok = this.peekTok(offset);
    return this.isWord(tok) || tok.kind === K.LeftParen || tok.kind === K.MacroSplice;
  }

  /**
   * `[T, U]`. A type argument may also be a value (`buffer[uint8, 64]`,
   * `array[float, rank + 1]`, `decimal`-style `name: value`), a lifetime (`~a`) or `_`.
   */
  private parseTypeArgs(): AST.TypeExpr[] {
    this.expect(K.LeftBracket);
    const args: AST.TypeExpr[] = [];
    while (!this.at(K.RightBracket)) {
      const tok = this.cur();
      if (tok.kind === K.LifetimeLabel) {
        this.advance();
      } else if (this.isWord(tok) && this.kindAt(1) === K.Colon) {
        // named argument: `order: RowMajor`
        this.advance();
        this.advance();
        this.skipTypeArgValue();
      } else if (this.startsTypeAt(0) && !this.isValueWord(tok)) {
        args.push(this.parseType());
        // `N * 2`, `rank + 1`: the argument was a value expression after all
        if (!this.at(K.Comma) && !this.at(K.RightBracket)) this.skipTypeArgValue();
      } else {
        this.skipTypeArgValue();
      }
      if (!this.eat(K.Comma)) break;
    }
    this.expect(K.RightBracket);
    return args;
  }

  private isValueWord(tok: Token): boolean {
    return tok.kind === K.True || tok.kind === K.False;
  }

  /** Skip one value-typed generic argument: tokens up to the `,` or `]` at this bracket depth. */
  private skipTypeArgValue(): void {
    let consumed = false;
    for (;;) {
      const tok = this.cur();
      if (tok.kind === K.EOF) break;
      if (tok.kind === K.Comma || tok.kind === K.RightBracket) break;
      if (tok.kind === K.RightParen || tok.kind === K.RightBrace || tok.kind === K.Semicolon) break;
      if (CLOSERS[tok.kind] !== undefined) {
        this.skipBalanced();
      } else {
        this.advance();
      }
      consumed = true;
    }
    if (!consumed) this.fail(`Expected a type but found ${this.describe(this.cur())}`);
  }

  // ---- Parameters ----

  private parseParamList(): AST.Parameter[] {
    const params: AST.Parameter[] = [];
    while (!this.at(K.RightParen)) {
      params.push(this.parseParam());
      if (!this.eat(K.Comma)) break;
    }
    return params;
  }

  private parseParam(): AST.Parameter {
    const start = this.cur();
    this.skipAnnotations();

    // `*` (keyword-only marker), `*args: T`, `**kwargs: T`
    if (this.at(K.Star) || this.at(K.StarStar)) {
      const star = this.advance();
      if (star.kind === K.Star && this.at(K.Star)) this.advance();
      if (this.at(K.Comma) || this.at(K.RightParen)) {
        return { kind: 'Parameter', name: '*', range: this.rangeFrom(start) };
      }
    }

    // Ownership verbs and qualifiers. A qualifier word directly before `:`, `,`,
    // `)` or `=` is the parameter's own name (`func f(volatile: int)`).
    let qualifier: AST.Parameter['qualifier'];
    for (;;) {
      const tok = this.cur();
      if (!OWNERSHIP_KINDS.has(tok.kind)) break;
      const next = this.kindAt(1);
      if (next === K.Colon || next === K.Comma || next === K.RightParen || next === K.Assign) break;
      this.advance();
      if (tok.kind === K.Weak) qualifier = 'weak';
      else if (tok.kind === K.Unowned) qualifier = 'unowned';
      else if (tok.kind === K.Borrow) qualifier = qualifier === undefined && this.tokens[this.pos - 2]?.kind === K.Excl ? 'excl borrow' : 'borrow';
      if (this.at(K.LeftBracket) && this.kindAt(1) === K.LifetimeLabel) this.skipBalanced();
    }

    let name: string;
    let nameRange: AST.Range;
    if (this.at(K.LeftParen) || this.at(K.LeftBracket) || this.at(K.LeftBrace)) {
      const pattern = this.parseDestructPattern('parameter');
      name = '_';
      nameRange = pattern.range;
    } else {
      const nameTok = this.expectDeclaredName('parameter');
      name = nameTok.text;
      nameRange = this.tokenRange(nameTok);
    }
    const type = this.eat(K.Colon) ? this.parseType() : undefined;
    const defaultValue = this.eat(K.Assign) ? this.parseExpression() : undefined;
    return { kind: 'Parameter', name, nameRange, type, defaultValue, qualifier, range: this.rangeFrom(start) };
  }

  /** `[T, U: Bound + Other, lifetime ~a, out V, N: int]` */
  private parseOptionalTypeParams(): AST.TypeParam[] | undefined {
    if (!this.at(K.LeftBracket)) return undefined;
    this.advance();
    const params: AST.TypeParam[] = [];
    while (!this.at(K.RightBracket)) {
      const pStart = this.cur();
      if (this.at(K.Lifetime)) this.advance();
      if (this.at(K.LifetimeLabel)) {
        const label = this.advance();
        params.push({ kind: 'TypeParam', name: label.text, range: this.rangeFrom(pStart) });
      } else {
        // variance: `out T` / `in T`
        if ((this.at(K.In) || this.cur().text === 'out') && this.isWord(this.peekTok(1))) this.advance();
        const name = this.expectDeclaredName('type parameter').text;
        let constraint: AST.TypeExpr | undefined;
        if (this.eat(K.Colon)) {
          constraint = this.parseType();
          while (this.eat(K.Plus)) this.parseType();
        }
        if (this.eat(K.Assign)) this.parseType();
        params.push({ kind: 'TypeParam', name, constraint, range: this.rangeFrom(pStart) });
      }
      if (!this.eat(K.Comma)) break;
    }
    this.expect(K.RightBracket);
    return params.length > 0 ? params : undefined;
  }

  // ==========================================================================
  // Token helpers
  // ==========================================================================

  private cur(): Token {
    if (++this.work > this.workLimit) throw new ParseAbort();
    return this.tokens[this.pos] ?? this.eof;
  }

  private prev(): Token {
    return this.tokens[this.pos - 1] ?? this.tokens[0] ?? this.eof;
  }

  private peekTok(offset: number): Token {
    return this.tokens[this.pos + offset] ?? this.eof;
  }

  private kindAt(offset: number): TokenKind {
    const tok = this.tokens[this.pos + offset];
    return tok ? tok.kind : K.EOF;
  }

  private advance(): Token {
    const token = this.cur();
    if (token.kind !== K.EOF) this.pos++;
    return token;
  }

  private at(kind: TokenKind): boolean {
    return this.cur().kind === kind;
  }

  private eat(kind: TokenKind): boolean {
    if (this.cur().kind !== kind) return false;
    this.pos++;
    return true;
  }

  private atEnd(): boolean {
    return this.cur().kind === K.EOF;
  }

  /** Does the current token start on the line the previous token ended on? */
  private sameLine(): boolean {
    if (this.pos === 0) return false;
    return this.cur().line === this.tokens[this.pos - 1].endLine;
  }

  private startsLine(): boolean {
    return !this.sameLine();
  }

  /** Any identifier-like token: a name or a keyword spelling. */
  private isWord(tok: Token | undefined): boolean {
    if (!tok) return false;
    return tok.kind === K.Identifier || tok.kind === K.TypeIdentifier || isKeywordKind(tok.kind);
  }

  /** A token that can stand where a declaration or pattern introduces a name. */
  private isNameToken(tok: Token | undefined): boolean {
    return this.isWord(tok) || tok?.kind === K.MacroSplice;
  }

  private startsExpression(): boolean {
    return this.startsExpressionAt(0);
  }

  private startsExpressionAt(offset: number): boolean {
    const tok = this.peekTok(offset);
    switch (tok.kind) {
      case K.EOF:
      case K.Semicolon:
      case K.Comma:
      case K.RightParen:
      case K.RightBracket:
      case K.RightBrace:
      case K.Colon:
      case K.Arrow:
      case K.Assign:
      case K.Error:
        return false;
      default:
        return !NOT_AN_EXPRESSION.has(tok.kind);
    }
  }

  private expect(kind: TokenKind): Token {
    const token = this.cur();
    if (token.kind === kind) {
      this.pos++;
      return token;
    }
    this.fail(`Expected '${kind}' but found ${this.describe(token)}`);
  }

  private expectWord(what: string): Token {
    const token = this.cur();
    if (this.isWord(token)) {
      this.pos++;
      return token;
    }
    this.fail(`Expected ${what} but found ${this.describe(token)}`);
  }

  /** A name being introduced or referenced by a declaration: any word, or a macro splice. */
  private expectName(what: string): Token {
    const token = this.cur();
    if (this.isNameToken(token)) {
      this.pos++;
      return token;
    }
    this.fail(`Expected ${what} but found ${this.describe(token)}`);
  }

  /**
   * A name a declaration introduces. A reserved word is reported once and kept as
   * the name, so the rest of the declaration is still checked (§1-3.4).
   */
  private expectDeclaredName(position: NamePosition): Token {
    const token = this.expectName(position === 'enum variant' || position === 'import alias' ? `an ${position} name` : `a ${position} name`);
    if (
      token.kind !== K.Identifier &&
      (RESERVED_EVERYWHERE.has(token.text) || RESERVED_BY_POSITION[position].has(token.text))
    ) {
      this.addDiagnostic(
        `\`${token.text}\` is a reserved word (§1-3.4) and cannot name ${position === 'enum variant' || position === 'import alias' ? 'an' : 'a'} ${position}`,
        this.tokenRange(token)
      );
    }
    return token;
  }

  /**
   * End of a simple statement. `;` is optional before `}`, at end of file and
   * when the next statement starts on a new line (§1-19.4).
   */
  private endStatement(): void {
    if (this.eat(K.Semicolon)) return;
    if (this.at(K.RightBrace) || this.atEnd() || this.startsLine()) return;
    // Reported without abandoning the statement: what follows usually parses on its own.
    this.addDiagnostic(`Expected ';' but found ${this.describe(this.cur())}`, this.tokenRange(this.cur()));
  }

  /** Index of the bracket closing the one at `openIndex`, or -1. */
  private matchingClose(openIndex: number): number {
    let nesting = 0;
    for (let i = openIndex; i < this.tokens.length; i++) {
      const kind = this.tokens[i].kind;
      if (kind === K.LeftParen || kind === K.LeftBracket || kind === K.LeftBrace || kind === K.BangLeftBrace) {
        nesting++;
      } else if (kind === K.RightParen || kind === K.RightBracket || kind === K.RightBrace) {
        nesting--;
        if (nesting === 0) return i;
        if (nesting < 0) return -1;
      }
    }
    return -1;
  }

  /** At an opening bracket: consume through its matching closer, whatever lies between. */
  private skipBalanced(): void {
    const open = this.cur();
    const close = this.matchingClose(this.pos);
    if (close < 0) {
      this.fail(`'${open.text}' is never closed`, open);
    }
    this.pos = close + 1;
  }

  private enter(): void {
    if (++this.depth > MAX_NESTING) {
      this.fail('Nesting is too deep to analyse');
    }
  }

  private checkTerminated(token: Token, what: string): void {
    if (token.unterminated) {
      this.addDiagnostic(`Unterminated ${what}`, this.tokenRange(token));
    }
  }

  // ==========================================================================
  // Diagnostics & ranges
  // ==========================================================================

  private describe(token: Token): string {
    if (token.kind === K.EOF) return 'end of file';
    const text = token.text.length > 24 ? token.text.slice(0, 24).split('\n')[0] + '…' : token.text.split('\n')[0];
    return `'${text}'`;
  }

  /** Record a diagnostic at `token` (default: the current token) and abandon the statement. */
  private fail(message: string, token: Token = this.cur()): never {
    const range = token.kind === K.EOF ? this.rangeAfterPrev() : this.tokenRange(token);
    this.addDiagnostic(message, range);
    throw new ParseError();
  }

  private addDiagnostic(message: string, range: AST.Range): void {
    if (this.diagnostics.length >= MAX_DIAGNOSTICS) return;
    const last = this.diagnostics[this.diagnostics.length - 1];
    if (last && last.range.start.offset === range.start.offset) return; // one report per place
    this.diagnostics.push({ message, range, severity: 'error' });
  }

  private tokenRange(token: Token): AST.Range {
    return {
      start: { line: token.line, column: token.column, offset: token.offset },
      end: { line: token.endLine, column: token.endColumn, offset: token.offset + token.length },
    };
  }

  /** From `start` through the last token consumed. */
  private rangeFrom(start: Token): AST.Range {
    const last = this.pos > 0 ? this.tokens[this.pos - 1] : start;
    const end = last.offset + last.length >= start.offset + start.length ? last : start;
    return {
      start: { line: start.line, column: start.column, offset: start.offset },
      end: { line: end.endLine, column: end.endColumn, offset: end.offset + end.length },
    };
  }

  /** From the start of `node` through the last token consumed. */
  private spanFrom(node: AST.AstNode): AST.Range {
    return this.spanFromRange(node.range);
  }

  private spanFromRange(range: AST.Range): AST.Range {
    const last = this.pos > 0 ? this.tokens[this.pos - 1] : undefined;
    if (!last || last.offset + last.length < range.end.offset) return range;
    return {
      start: range.start,
      end: { line: last.endLine, column: last.endColumn, offset: last.offset + last.length },
    };
  }

  /** A zero-width range just past the last token consumed: where something is missing. */
  private rangeAfterPrev(): AST.Range {
    const last = this.pos > 0 ? this.tokens[this.pos - 1] : this.eof;
    const position = { line: last.endLine, column: last.endColumn, offset: last.offset + last.length };
    return { start: position, end: position };
  }
}
