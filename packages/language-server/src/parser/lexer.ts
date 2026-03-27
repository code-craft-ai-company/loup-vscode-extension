// ============================================================================
// Loom Lexer — Tokenizer for Loom v0.4
// ============================================================================

export enum TokenKind {
  // Literals
  IntLiteral = 'IntLiteral',
  FloatLiteral = 'FloatLiteral',
  StringLiteral = 'StringLiteral',
  MultilineStringLiteral = 'MultilineStringLiteral',
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

  // Keywords — declarations
  Let = 'let',
  Var = 'var',
  Fun = 'fun',
  Async = 'async',
  Class = 'class',
  Dynamic = 'dynamic',
  Interface = 'interface',
  Enum = 'enum',
  Extern = 'extern',
  Pub = 'pub',
  Static = 'static',

  // Keywords — misc
  From = 'from',
  Import = 'import',
  As = 'as',
  In = 'in',
  Is = 'is',
  Defer = 'defer',
  With = 'with',
  Portal = 'portal',
  Group = 'group',
  Js = 'js',
  Native = 'native',
  Val = 'val',

  // Booleans
  True = 'true',
  False = 'false',

  // Operators
  Plus = '+',
  Minus = '-',
  Star = '*',
  Slash = '/',
  Percent = '%',
  Assign = '=',
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

  // Dynamic field access
  BangLeftBrace = '!{',

  // Template delimiters
  ExprOpen = '{$',
  ExprClose = '$}',
  StmtOpen = '{%',
  StmtClose = '%}',

  // Comments
  LineComment = 'LineComment',
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
  'let': TokenKind.Let,
  'var': TokenKind.Var,
  'fun': TokenKind.Fun,
  'async': TokenKind.Async,
  'class': TokenKind.Class,
  'dynamic': TokenKind.Dynamic,
  'interface': TokenKind.Interface,
  'enum': TokenKind.Enum,
  'extern': TokenKind.Extern,
  'pub': TokenKind.Pub,
  'static': TokenKind.Static,
  'from': TokenKind.From,
  'import': TokenKind.Import,
  'as': TokenKind.As,
  'in': TokenKind.In,
  'is': TokenKind.Is,
  'defer': TokenKind.Defer,
  'with': TokenKind.With,
  'portal': TokenKind.Portal,
  'group': TokenKind.Group,
  'js': TokenKind.Js,
  'native': TokenKind.Native,
  'val': TokenKind.Val,
  'true': TokenKind.True,
  'false': TokenKind.False,
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

    // Two-char operators
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
    this.pos += 3;
    this.column += 3;

    // Read descriptor: (language):(format)
    if (this.pos < this.source.length && this.source[this.pos] === '(') {
      while (this.pos < this.source.length && this.source[this.pos] !== '\n') {
        this.pos++;
        this.column++;
      }
    }

    // Find closing ```
    while (this.pos < this.source.length) {
      if (this.source[this.pos] === '`' && this.peek(1) === '`' && this.peek(2) === '`') {
        // Make sure it's not 4 backticks (doc syntax)
        if (this.peek(3) !== '`') {
          this.pos += 3;
          this.column += 3;
          break;
        }
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
