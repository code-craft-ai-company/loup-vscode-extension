// ============================================================================
// Loom Lexer — Tokenizer for Loom v0.7
// ============================================================================

export enum TokenKind {
  // Literals
  IntLiteral = 'IntLiteral',
  FloatLiteral = 'FloatLiteral',
  StringLiteral = 'StringLiteral',
  MultilineStringLiteral = 'MultilineStringLiteral',
  BytesLiteral = 'BytesLiteral',
  RawStringLiteral = 'RawStringLiteral',
  TemplateFenceOpen = 'TemplateFenceOpen',
  TemplateFenceClose = 'TemplateFenceClose',

  // Identifiers & keywords
  Identifier = 'Identifier',
  TypeIdentifier = 'TypeIdentifier',

  // Keywords — control flow
  If = 'if',
  Else = 'else',
  For = 'for',
  While = 'while',
  Do = 'do',
  Match = 'match',
  Break = 'break',
  Continue = 'continue',
  Return = 'return',
  Throw = 'throw',
  Try = 'try',
  Catch = 'catch',
  Finally = 'finally',
  Await = 'await',
  Spawn = 'spawn',
  Yield = 'yield',
  Suspend = 'suspend',

  // Keywords — declarations
  Let = 'let',
  Var = 'var',
  Fun = 'fun',
  Async = 'async',
  Gen = 'gen',
  Class = 'class',
  Dynamic = 'dynamic',
  Abstract = 'abstract',
  Interface = 'interface',
  Enum = 'enum',
  Struct = 'struct',
  Extern = 'extern',
  Pub = 'pub',
  Static = 'static',
  Type = 'type',
  Macro = 'macro',

  // Keywords — misc
  From = 'from',
  Import = 'import',
  Prefer = 'prefer',
  Compiled = 'compiled',
  As = 'as',
  In = 'in',
  Is = 'is',
  Not = 'not',
  Instanceof = 'instanceof',
  Typeof = 'typeof',
  Defer = 'defer',
  With = 'with',
  Portal = 'portal',
  Group = 'group',
  Js = 'js',
  Native = 'native',
  Val = 'val',
  New = 'new',
  Del = 'del',
  Global = 'global',
  Nonlocal = 'nonlocal',
  Implements = 'implements',
  Operator = 'operator',
  Fn = 'fn',
  Get = 'get',
  Set = 'set',
  Box = 'box',
  Self = 'self',
  Bnot = 'bnot',
  Final = 'final',
  Lifetime = 'lifetime',
  Module = 'module',
  Override = 'override',
  Package = 'package',
  Sealed = 'sealed',
  Super = 'super',
  Trait = 'trait',
  Volatile = 'volatile',
  Where = 'where',

  // Field qualifiers
  Weak = 'weak',
  Unowned = 'unowned',
  Borrow = 'borrow',
  Noescape = 'noescape',

  // Booleans & none
  True = 'true',
  False = 'false',
  None = 'none',

  // Operators
  Plus = '+',
  Minus = '-',
  Star = '*',
  Slash = '/',
  Percent = '%',
  StarStar = '**',
  Tilde = '~',
  Ampersand = '&',
  Caret = '^',
  ShiftLeft = '<<',
  ShiftRight = '>>',
  Assign = '=',
  PlusAssign = '+=',
  MinusAssign = '-=',
  StarAssign = '*=',
  SlashAssign = '/=',
  PercentAssign = '%=',
  StarStarAssign = '**=',
  AmpersandAssign = '&=',
  PipeAssign = '|=',
  CaretAssign = '^=',
  ShiftLeftAssign = '<<=',
  ShiftRightAssign = '>>=',
  EqualEqual = '==',
  BangEqual = '!=',
  LessThan = '<',
  LessEqual = '<=',
  GreaterThan = '>',
  GreaterEqual = '>=',
  Arrow = '=>',
  And = '&&',
  Or = '||',
  Bang = '!',
  QuestionDot = '?.',
  QuestionQuestion = '??',
  Question = '?',
  Pipe = '|',
  Dot = '.',
  Colon = ':',

  // Delimiters
  LeftParen = '(',
  RightParen = ')',
  LeftBrace = '{',
  RightBrace = '}',
  LeftBracket = '[',
  RightBracket = ']',
  Comma = ',',
  Semicolon = ';',
  At = '@',
  Hash = '#',

  // Dynamic field access
  BangLeftBrace = '!{',

  // Template delimiters
  ExprOpen = '{$',
  ExprClose = '$}',
  StmtOpen = '{%',
  StmtClose = '%}',

  // Comments
  LineComment = 'LineComment',
  DocComment = 'DocComment',
  BlockComment = 'BlockComment',

  // Special
  EOF = 'EOF',
  Error = 'Error',
}

export interface Token {
  kind: TokenKind;
  text: string;
  offset: number;
  line: number;
  column: number;
  length: number;
}

const KEYWORDS: Record<string, TokenKind> = {
  'if': TokenKind.If,
  'else': TokenKind.Else,
  'for': TokenKind.For,
  'while': TokenKind.While,
  'do': TokenKind.Do,
  'match': TokenKind.Match,
  'break': TokenKind.Break,
  'continue': TokenKind.Continue,
  'return': TokenKind.Return,
  'throw': TokenKind.Throw,
  'try': TokenKind.Try,
  'catch': TokenKind.Catch,
  'finally': TokenKind.Finally,
  'await': TokenKind.Await,
  'spawn': TokenKind.Spawn,
  'yield': TokenKind.Yield,
  'suspend': TokenKind.Suspend,
  'let': TokenKind.Let,
  'var': TokenKind.Var,
  'fun': TokenKind.Fun,
  'func': TokenKind.Fun,
  'async': TokenKind.Async,
  'gen': TokenKind.Gen,
  'class': TokenKind.Class,
  'dynamic': TokenKind.Dynamic,
  'abstract': TokenKind.Abstract,
  'interface': TokenKind.Interface,
  'enum': TokenKind.Enum,
  'struct': TokenKind.Struct,
  'extern': TokenKind.Extern,
  'pub': TokenKind.Pub,
  'static': TokenKind.Static,
  'type': TokenKind.Type,
  'macro': TokenKind.Macro,
  'from': TokenKind.From,
  'import': TokenKind.Import,
  'prefer': TokenKind.Prefer,
  'compiled': TokenKind.Compiled,
  'as': TokenKind.As,
  'in': TokenKind.In,
  'is': TokenKind.Is,
  'not': TokenKind.Not,
  'instanceof': TokenKind.Instanceof,
  'typeof': TokenKind.Typeof,
  'defer': TokenKind.Defer,
  'with': TokenKind.With,
  'portal': TokenKind.Portal,
  'group': TokenKind.Group,
  'js': TokenKind.Js,
  'native': TokenKind.Native,
  'val': TokenKind.Val,
  'new': TokenKind.New,
  'del': TokenKind.Del,
  'global': TokenKind.Global,
  'nonlocal': TokenKind.Nonlocal,
  'implements': TokenKind.Implements,
  'operator': TokenKind.Operator,
  'fn': TokenKind.Fn,
  'get': TokenKind.Get,
  'set': TokenKind.Set,
  'box': TokenKind.Box,
  'self': TokenKind.Self,
  'bnot': TokenKind.Bnot,
  'final': TokenKind.Final,
  'lifetime': TokenKind.Lifetime,
  'module': TokenKind.Module,
  'override': TokenKind.Override,
  'package': TokenKind.Package,
  'sealed': TokenKind.Sealed,
  'super': TokenKind.Super,
  'trait': TokenKind.Trait,
  'volatile': TokenKind.Volatile,
  'where': TokenKind.Where,
  'and': TokenKind.And,
  'or': TokenKind.Or,
  'weak': TokenKind.Weak,
  'unowned': TokenKind.Unowned,
  'borrow': TokenKind.Borrow,
  'noescape': TokenKind.Noescape,
  'true': TokenKind.True,
  'false': TokenKind.False,
  'none': TokenKind.None,
};

export class Lexer {
  private source: string;
  private pos = 0;
  private line = 0;
  private column = 0;
  private tokens: Token[] = [];

  constructor(source: string) {
    this.source = source;
  }

  tokenize(): Token[] {
    this.tokens = [];
    this.pos = 0;
    this.line = 0;
    this.column = 0;

    // Skip shebang on line 1
    if (this.source.startsWith('#!')) {
      while (this.pos < this.source.length && this.source[this.pos] !== '\n') {
        this.pos++;
        this.column++;
      }
    }

    while (this.pos < this.source.length) {
      this.skipWhitespace();
      if (this.pos >= this.source.length) break;

      const token = this.nextToken();
      if (token) {
        this.tokens.push(token);
      }
    }

    this.tokens.push(this.makeToken(TokenKind.EOF, '', this.pos));
    return this.tokens;
  }

  private nextToken(): Token | null {
    const start = this.pos;
    const ch = this.source[this.pos];
    const next = this.pos + 1 < this.source.length ? this.source[this.pos + 1] : '';

    // Doc comments (must come before line comments)
    if (ch === '/' && next === '/' && this.peek(2) === '/') {
      return this.readDocComment();
    }
    // Line comments
    if (ch === '/' && next === '/') {
      return this.readLineComment();
    }
    // Block comments
    if (ch === '/' && next === '*') {
      return this.readBlockComment();
    }

    // Template fence (```)
    if (ch === '`' && next === '`' && this.peek(2) === '`') {
      return this.readTemplateFence();
    }

    // Multiline strings
    if (ch === '"' && next === '"' && this.peek(2) === '"') {
      return this.readMultilineString('"');
    }
    if (ch === "'" && next === "'" && this.peek(2) === "'") {
      return this.readMultilineString("'");
    }

    // Bytes literal: b"..." or b'...'
    if (ch === 'b' && (next === '"' || next === "'")) {
      return this.readBytesLiteral(next);
    }

    // Raw string literal: r"..." or r'...'
    if (ch === 'r' && (next === '"' || next === "'")) {
      return this.readRawString(next);
    }

    // Strings
    if (ch === '"') return this.readString('"');
    if (ch === "'") return this.readString("'");

    // Numbers
    if (this.isDigit(ch)) return this.readNumber();

    // Identifiers / keywords
    if (this.isIdentStart(ch)) return this.readIdentifier();

    // Annotation
    if (ch === '@') {
      this.pos++;
      this.column++;
      return this.makeToken(TokenKind.At, '@', start);
    }

    // Three-char operators
    if (ch === '*' && next === '*' && this.peek(2) === '=') return this.readFixed(TokenKind.StarStarAssign, 3);
    if (ch === '<' && next === '<' && this.peek(2) === '=') return this.readFixed(TokenKind.ShiftLeftAssign, 3);
    if (ch === '>' && next === '>' && this.peek(2) === '=') return this.readFixed(TokenKind.ShiftRightAssign, 3);

    // Two-char operators
    if (ch === '*' && next === '*') return this.readFixed(TokenKind.StarStar, 2);
    if (ch === '<' && next === '<') return this.readFixed(TokenKind.ShiftLeft, 2);
    if (ch === '>' && next === '>') return this.readFixed(TokenKind.ShiftRight, 2);
    if (ch === '+' && next === '=') return this.readFixed(TokenKind.PlusAssign, 2);
    if (ch === '-' && next === '=') return this.readFixed(TokenKind.MinusAssign, 2);
    if (ch === '*' && next === '=') return this.readFixed(TokenKind.StarAssign, 2);
    if (ch === '/' && next === '=') return this.readFixed(TokenKind.SlashAssign, 2);
    if (ch === '%' && next === '=') return this.readFixed(TokenKind.PercentAssign, 2);
    if (ch === '&' && next === '=') return this.readFixed(TokenKind.AmpersandAssign, 2);
    if (ch === '|' && next === '=') return this.readFixed(TokenKind.PipeAssign, 2);
    if (ch === '^' && next === '=') return this.readFixed(TokenKind.CaretAssign, 2);
    if (ch === '=' && next === '>') return this.readFixed(TokenKind.Arrow, 2);
    if (ch === '=' && next === '=') return this.readFixed(TokenKind.EqualEqual, 2);
    if (ch === '!' && next === '=') return this.readFixed(TokenKind.BangEqual, 2);
    if (ch === '!' && next === '{') return this.readFixed(TokenKind.BangLeftBrace, 2);
    if (ch === '<' && next === '=') return this.readFixed(TokenKind.LessEqual, 2);
    if (ch === '>' && next === '=') return this.readFixed(TokenKind.GreaterEqual, 2);
    if (ch === '&' && next === '&') return this.readFixed(TokenKind.And, 2);
    if (ch === '|' && next === '|') return this.readFixed(TokenKind.Or, 2);
    if (ch === '?' && next === '.') return this.readFixed(TokenKind.QuestionDot, 2);
    if (ch === '?' && next === '?') return this.readFixed(TokenKind.QuestionQuestion, 2);
    if (ch === '{' && next === '$') return this.readFixed(TokenKind.ExprOpen, 2);
    if (ch === '$' && next === '}') return this.readFixed(TokenKind.ExprClose, 2);
    if (ch === '{' && next === '%') return this.readFixed(TokenKind.StmtOpen, 2);
    if (ch === '%' && next === '}') return this.readFixed(TokenKind.StmtClose, 2);

    // Single-char operators / delimiters
    const singleCharTokens: Record<string, TokenKind> = {
      '+': TokenKind.Plus,
      '-': TokenKind.Minus,
      '*': TokenKind.Star,
      '/': TokenKind.Slash,
      '%': TokenKind.Percent,
      '=': TokenKind.Assign,
      '<': TokenKind.LessThan,
      '>': TokenKind.GreaterThan,
      '!': TokenKind.Bang,
      '?': TokenKind.Question,
      '|': TokenKind.Pipe,
      '&': TokenKind.Ampersand,
      '^': TokenKind.Caret,
      '~': TokenKind.Tilde,
      '.': TokenKind.Dot,
      ':': TokenKind.Colon,
      '(': TokenKind.LeftParen,
      ')': TokenKind.RightParen,
      '{': TokenKind.LeftBrace,
      '}': TokenKind.RightBrace,
      '[': TokenKind.LeftBracket,
      ']': TokenKind.RightBracket,
      ',': TokenKind.Comma,
      ';': TokenKind.Semicolon,
    };

    const kind = singleCharTokens[ch];
    if (kind) {
      this.pos++;
      this.column++;
      return this.makeToken(kind, ch, start);
    }

    // Unknown character — error token
    this.pos++;
    this.column++;
    return this.makeToken(TokenKind.Error, ch, start);
  }

  private readDocComment(): Token {
    const start = this.pos;
    while (this.pos < this.source.length && this.source[this.pos] !== '\n') {
      this.pos++;
      this.column++;
    }
    return this.makeToken(TokenKind.DocComment, this.source.slice(start, this.pos), start);
  }

  private readLineComment(): Token {
    const start = this.pos;
    while (this.pos < this.source.length && this.source[this.pos] !== '\n') {
      this.pos++;
      this.column++;
    }
    return this.makeToken(TokenKind.LineComment, this.source.slice(start, this.pos), start);
  }

  private readBlockComment(): Token {
    const start = this.pos;
    this.pos += 2; // skip /*
    this.column += 2;
    let depth = 1;
    while (this.pos < this.source.length && depth > 0) {
      if (this.source[this.pos] === '/' && this.peek(1) === '*') {
        depth++;
        this.pos += 2;
        this.column += 2;
      } else if (this.source[this.pos] === '*' && this.peek(1) === '/') {
        depth--;
        this.pos += 2;
        this.column += 2;
      } else {
        if (this.source[this.pos] === '\n') {
          this.line++;
          this.column = 0;
        } else {
          this.column++;
        }
        this.pos++;
      }
    }
    return this.makeToken(TokenKind.BlockComment, this.source.slice(start, this.pos), start);
  }

  private readString(quote: string): Token {
    const start = this.pos;
    this.pos++; // skip opening quote
    this.column++;
    while (this.pos < this.source.length && this.source[this.pos] !== quote) {
      if (this.source[this.pos] === '\\') {
        this.pos++; // skip escape
        this.column++;
      }
      if (this.source[this.pos] === '\n') {
        this.line++;
        this.column = 0;
      } else {
        this.column++;
      }
      this.pos++;
    }
    if (this.pos < this.source.length) {
      this.pos++; // skip closing quote
      this.column++;
    }
    return this.makeToken(TokenKind.StringLiteral, this.source.slice(start, this.pos), start);
  }

  private readBytesLiteral(quote: string): Token {
    const start = this.pos;
    this.pos++; // skip 'b'
    this.column++;
    this.pos++; // skip opening quote
    this.column++;
    while (this.pos < this.source.length && this.source[this.pos] !== quote) {
      if (this.source[this.pos] === '\\') {
        this.pos++;
        this.column++;
      }
      if (this.pos < this.source.length) {
        if (this.source[this.pos] === '\n') {
          this.line++;
          this.column = 0;
        } else {
          this.column++;
        }
        this.pos++;
      }
    }
    if (this.pos < this.source.length) {
      this.pos++;
      this.column++;
    }
    return this.makeToken(TokenKind.BytesLiteral, this.source.slice(start, this.pos), start);
  }

  private readRawString(quote: string): Token {
    const start = this.pos;
    this.pos++; // skip 'r'
    this.column++;
    this.pos++; // skip opening quote
    this.column++;
    // Raw strings do not process escapes
    while (this.pos < this.source.length && this.source[this.pos] !== quote) {
      if (this.source[this.pos] === '\n') {
        this.line++;
        this.column = 0;
      } else {
        this.column++;
      }
      this.pos++;
    }
    if (this.pos < this.source.length) {
      this.pos++;
      this.column++;
    }
    return this.makeToken(TokenKind.RawStringLiteral, this.source.slice(start, this.pos), start);
  }

  private readMultilineString(quote: string): Token {
    const start = this.pos;
    const delimiter = quote + quote + quote;
    this.pos += 3;
    this.column += 3;

    // Optional descriptor (...)
    if (this.pos < this.source.length && this.source[this.pos] === '(') {
      while (this.pos < this.source.length && this.source[this.pos] !== ')') {
        this.pos++;
        this.column++;
      }
      if (this.pos < this.source.length) {
        this.pos++;
        this.column++;
      }
    }

    // Find the closing delimiter
    while (this.pos < this.source.length) {
      if (this.source.slice(this.pos, this.pos + 3) === delimiter) {
        this.pos += 3;
        this.column += 3;
        break;
      }
      if (this.source[this.pos] === '\n') {
        this.line++;
        this.column = 0;
      } else {
        this.column++;
      }
      this.pos++;
    }
    return this.makeToken(TokenKind.MultilineStringLiteral, this.source.slice(start, this.pos), start);
  }

  private readTemplateFence(): Token {
    const start = this.pos;

    // Count opening backticks (3 or more)
    let fenceLen = 0;
    while (this.pos < this.source.length && this.source[this.pos] === '`') {
      fenceLen++;
      this.pos++;
      this.column++;
    }

    // Read descriptor: (language):(format) or (language):(key=value,...)
    if (this.pos < this.source.length && this.source[this.pos] === '(') {
      while (this.pos < this.source.length && this.source[this.pos] !== '\n') {
        this.pos++;
        this.column++;
      }
    }

    // Find closing fence with exact same backtick count
    while (this.pos < this.source.length) {
      if (this.source[this.pos] === '`') {
        // Count consecutive backticks
        let closeLen = 0;
        const closeStart = this.pos;
        while (this.pos < this.source.length && this.source[this.pos] === '`') {
          closeLen++;
          this.pos++;
          this.column++;
        }
        if (closeLen === fenceLen) {
          break;
        }
        // Not the right count — continue scanning
        continue;
      }
      if (this.source[this.pos] === '\n') {
        this.line++;
        this.column = 0;
      } else {
        this.column++;
      }
      this.pos++;
    }
    return this.makeToken(TokenKind.TemplateFenceOpen, this.source.slice(start, this.pos), start);
  }

  private readNumber(): Token {
    const start = this.pos;
    let isFloat = false;

    // Hex/Binary/Octal
    if (this.source[this.pos] === '0' && this.pos + 1 < this.source.length) {
      const prefix = this.source[this.pos + 1];
      if (prefix === 'x' || prefix === 'X' || prefix === 'b' || prefix === 'B' || prefix === 'o' || prefix === 'O') {
        this.pos += 2;
        this.column += 2;
        while (this.pos < this.source.length && (this.isHexDigit(this.source[this.pos]) || this.source[this.pos] === '_')) {
          this.pos++;
          this.column++;
        }
        return this.makeToken(TokenKind.IntLiteral, this.source.slice(start, this.pos), start);
      }
    }

    while (this.pos < this.source.length && (this.isDigit(this.source[this.pos]) || this.source[this.pos] === '_')) {
      this.pos++;
      this.column++;
    }

    if (this.pos < this.source.length && this.source[this.pos] === '.' && this.isDigit(this.peek(1) ?? '')) {
      isFloat = true;
      this.pos++;
      this.column++;
      while (this.pos < this.source.length && (this.isDigit(this.source[this.pos]) || this.source[this.pos] === '_')) {
        this.pos++;
        this.column++;
      }
    }

    // Exponent
    if (this.pos < this.source.length && (this.source[this.pos] === 'e' || this.source[this.pos] === 'E')) {
      isFloat = true;
      this.pos++;
      this.column++;
      if (this.pos < this.source.length && (this.source[this.pos] === '+' || this.source[this.pos] === '-')) {
        this.pos++;
        this.column++;
      }
      while (this.pos < this.source.length && (this.isDigit(this.source[this.pos]) || this.source[this.pos] === '_')) {
        this.pos++;
        this.column++;
      }
    }

    const kind = isFloat ? TokenKind.FloatLiteral : TokenKind.IntLiteral;
    return this.makeToken(kind, this.source.slice(start, this.pos), start);
  }

  private readIdentifier(): Token {
    const start = this.pos;
    while (this.pos < this.source.length && this.isIdentPart(this.source[this.pos])) {
      this.pos++;
      this.column++;
    }
    const text = this.source.slice(start, this.pos);
    const keyword = KEYWORDS[text];
    if (keyword) {
      return this.makeToken(keyword, text, start);
    }
    // PascalCase identifiers are type identifiers
    const kind = text[0] >= 'A' && text[0] <= 'Z' ? TokenKind.TypeIdentifier : TokenKind.Identifier;
    return this.makeToken(kind, text, start);
  }

  private readFixed(kind: TokenKind, length: number): Token {
    const start = this.pos;
    const text = this.source.slice(this.pos, this.pos + length);
    this.pos += length;
    this.column += length;
    return this.makeToken(kind, text, start);
  }

  private skipWhitespace(): void {
    while (this.pos < this.source.length) {
      const ch = this.source[this.pos];
      if (ch === ' ' || ch === '\t' || ch === '\r') {
        this.pos++;
        this.column++;
      } else if (ch === '\n') {
        this.pos++;
        this.line++;
        this.column = 0;
      } else {
        break;
      }
    }
  }

  private peek(offset: number): string {
    const idx = this.pos + offset;
    return idx < this.source.length ? this.source[idx] : '';
  }

  private isDigit(ch: string): boolean {
    return ch >= '0' && ch <= '9';
  }

  private isHexDigit(ch: string): boolean {
    return this.isDigit(ch) || (ch >= 'a' && ch <= 'f') || (ch >= 'A' && ch <= 'F');
  }

  private isIdentStart(ch: string): boolean {
    return (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || ch === '_';
  }

  private isIdentPart(ch: string): boolean {
    return this.isIdentStart(ch) || this.isDigit(ch);
  }

  private makeToken(kind: TokenKind, text: string, offset: number): Token {
    // Calculate line/column from offset for accuracy
    let line = 0;
    let col = 0;
    for (let i = 0; i < offset; i++) {
      if (this.source[i] === '\n') {
        line++;
        col = 0;
      } else {
        col++;
      }
    }
    return { kind, text, offset, line, column: col, length: text.length };
  }
}
