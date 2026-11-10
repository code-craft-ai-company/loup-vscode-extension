// ============================================================================
// Loup Lexer — Tokenises .loup source into a stream of typed tokens
// ============================================================================

export enum TokenKind {
  // Literals
  IntLiteral = 'IntLiteral',
  FloatLiteral = 'FloatLiteral',
  StringLiteral = 'StringLiteral',
  CharLiteral = 'CharLiteral',
  InterpolatedStringLiteral = 'InterpolatedStringLiteral',
  RawStringLiteral = 'RawStringLiteral',
  BytesLiteral = 'BytesLiteral',
  MultilineStringLiteral = 'MultilineStringLiteral',
  BoolLiteral = 'BoolLiteral',
  NoneLiteral = 'NoneLiteral',

  // Template fences
  TemplateFenceOpen = 'TemplateFenceOpen',
  TemplateFenceClose = 'TemplateFenceClose',
  TemplateContent = 'TemplateContent',
  TemplateExprOpen = 'TemplateExprOpen',     // {$ or {$-
  TemplateExprClose = 'TemplateExprClose',   // $} or -$}
  TemplateDirOpen = 'TemplateDirOpen',       // {% or {%-
  TemplateDirClose = 'TemplateDirClose',     // %} or -%}
  TemplateComment = 'TemplateComment',       // {%-- ... --%}

  // Identifiers
  Identifier = 'Identifier',
  TypeIdentifier = 'TypeIdentifier',
  LifetimeLabel = 'LifetimeLabel',           // ~name or ~static

  // Keywords
  Let = 'let',
  Var = 'var',
  Const = 'const',
  Fun = 'fun',       // covers both `func` and `fun`
  Gen = 'gen',
  Macro = 'macro',
  Quote = 'quote',
  Return = 'return',
  Yield = 'yield',
  Suspend = 'suspend',
  If = 'if',
  Else = 'else',
  For = 'for',
  While = 'while',
  Do = 'do',
  Match = 'match',
  Break = 'break',
  Continue = 'continue',
  Defer = 'defer',
  With = 'with',
  Portal = 'portal',
  Async = 'async',
  Await = 'await',
  Spawn = 'spawn',
  Group = 'group',
  Concurrent = 'concurrent',
  Try = 'try',
  Catch = 'catch',
  Finally = 'finally',
  Throw = 'throw',
  Attempt = 'attempt',
  Unreachable = 'unreachable',
  From = 'from',
  Import = 'import',
  As = 'as',
  In = 'in',
  Is = 'is',
  Instanceof = 'instanceof',
  Typeof = 'typeof',
  Not = 'not',
  Bnot = 'bnot',
  Del = 'del',
  Global = 'global',
  Nonlocal = 'nonlocal',
  Pub = 'pub',
  Static = 'static',
  Override = 'override',
  Final = 'final',
  Sealed = 'sealed',
  Class = 'class',
  Struct = 'struct',
  Abstract = 'abstract',
  Dynamic = 'dynamic',
  Interface = 'interface',
  Implements = 'implements',
  Enum = 'enum',
  Type = 'type',
  Namespace = 'namespace',
  Template = 'template',
  Foundation = 'foundation',
  Overlay = 'overlay',
  Onto = 'onto',
  Part = 'part',
  Extern = 'extern',
  Js = 'js',
  Native = 'native',
  Val = 'val',
  New = 'new',
  Box = 'box',
  True = 'true',
  False = 'false',
  None = 'None',
  This = 'this',
  Self = 'Self',
  Super = 'super',
  Fn = 'fn',
  Once = 'once',
  Operator = 'operator',
  Weak = 'weak',
  Unowned = 'unowned',
  Arc = 'arc',
  Borrow = 'borrow',
  Excl = 'excl',
  Unique = 'unique',
  Onstack = 'onstack',
  Lifetime = 'lifetime',
  Noescape = 'noescape',
  Consume = 'consume',
  Noreturn = 'noreturn',
  Impossible = 'impossible',
  Prefer = 'prefer',
  Compiled = 'compiled',
  Scripted = 'scripted',
  Dual = 'dual',
  Freestanding = 'freestanding',
  Portable = 'portable',
  Reads = 'reads',
  Edits = 'edits',
  Takes = 'takes',
  Shares = 'shares',
  Modifier = 'modifier',
  Safe = 'safe',
  Synchronized = 'synchronized',
  Unsafe = 'unsafe',
  Requires = 'requires',
  Distinct = 'distinct',
  Atomic = 'atomic',
  Asm = 'asm',
  Volatile = 'volatile',
  Where = 'where',
  SizeOf = 'size_of',
  AlignOf = 'align_of',
  Reinterpret = 'reinterpret',
  ReinterpretChecked = 'reinterpretChecked',
  Get = 'get',
  Set = 'set',

  // Operators & Punctuation
  Plus = '+',
  Minus = '-',
  Star = '*',
  StarStar = '**',
  Slash = '/',
  SlashSlash = '//',
  Percent = '%',
  Assign = '=',
  PlusAssign = '+=',
  MinusAssign = '-=',
  StarAssign = '*=',
  SlashAssign = '/=',
  SlashSlashAssign = '//=',
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
  ShiftLeft = '<<',
  ShiftRight = '>>',
  And = '&&',
  Or = '||',
  Bang = '!',
  Ampersand = '&',
  Caret = '^',
  Tilde = '~',
  Question = '?',
  QuestionDot = '?.',
  QuestionQuestion = '??',
  Arrow = '=>',
  Pipe = '|',
  Dot = '.',
  DotDot = '..',
  DotDotEqual = '..=',
  DotDotDot = '...',
  Colon = ':',
  Semicolon = ';',
  Comma = ',',
  At = '@',
  BangLeftBrace = '!{',

  // Delimiters
  LeftParen = '(',
  RightParen = ')',
  LeftBrace = '{',
  RightBrace = '}',
  LeftBracket = '[',
  RightBracket = ']',

  // Comments & Trivia
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
  let: TokenKind.Let,
  var: TokenKind.Var,
  const: TokenKind.Const,
  fun: TokenKind.Fun,
  func: TokenKind.Fun,
  gen: TokenKind.Gen,
  macro: TokenKind.Macro,
  quote: TokenKind.Quote,
  return: TokenKind.Return,
  yield: TokenKind.Yield,
  suspend: TokenKind.Suspend,
  if: TokenKind.If,
  else: TokenKind.Else,
  for: TokenKind.For,
  while: TokenKind.While,
  do: TokenKind.Do,
  match: TokenKind.Match,
  break: TokenKind.Break,
  continue: TokenKind.Continue,
  defer: TokenKind.Defer,
  with: TokenKind.With,
  portal: TokenKind.Portal,
  async: TokenKind.Async,
  await: TokenKind.Await,
  spawn: TokenKind.Spawn,
  group: TokenKind.Group,
  concurrent: TokenKind.Concurrent,
  try: TokenKind.Try,
  catch: TokenKind.Catch,
  finally: TokenKind.Finally,
  throw: TokenKind.Throw,
  attempt: TokenKind.Attempt,
  unreachable: TokenKind.Unreachable,
  from: TokenKind.From,
  import: TokenKind.Import,
  as: TokenKind.As,
  in: TokenKind.In,
  is: TokenKind.Is,
  instanceof: TokenKind.Instanceof,
  typeof: TokenKind.Typeof,
  not: TokenKind.Not,
  and: TokenKind.And,
  or: TokenKind.Or,
  bnot: TokenKind.Bnot,
  del: TokenKind.Del,
  global: TokenKind.Global,
  nonlocal: TokenKind.Nonlocal,
  pub: TokenKind.Pub,
  static: TokenKind.Static,
  override: TokenKind.Override,
  final: TokenKind.Final,
  sealed: TokenKind.Sealed,
  class: TokenKind.Class,
  struct: TokenKind.Struct,
  abstract: TokenKind.Abstract,
  dynamic: TokenKind.Dynamic,
  interface: TokenKind.Interface,
  implements: TokenKind.Implements,
  enum: TokenKind.Enum,
  type: TokenKind.Type,
  namespace: TokenKind.Namespace,
  template: TokenKind.Template,
  foundation: TokenKind.Foundation,
  overlay: TokenKind.Overlay,
  onto: TokenKind.Onto,
  part: TokenKind.Part,
  extern: TokenKind.Extern,
  js: TokenKind.Js,
  native: TokenKind.Native,
  val: TokenKind.Val,
  new: TokenKind.New,
  box: TokenKind.Box,
  true: TokenKind.True,
  false: TokenKind.False,
  None: TokenKind.None,
  none: TokenKind.None,
  this: TokenKind.This,
  Self: TokenKind.Self,
  super: TokenKind.Super,
  fn: TokenKind.Fn,
  once: TokenKind.Once,
  operator: TokenKind.Operator,
  weak: TokenKind.Weak,
  unowned: TokenKind.Unowned,
  arc: TokenKind.Arc,
  borrow: TokenKind.Borrow,
  excl: TokenKind.Excl,
  unique: TokenKind.Unique,
  onstack: TokenKind.Onstack,
  lifetime: TokenKind.Lifetime,
  noescape: TokenKind.Noescape,
  consume: TokenKind.Consume,
  noreturn: TokenKind.Noreturn,
  impossible: TokenKind.Impossible,
  prefer: TokenKind.Prefer,
  compiled: TokenKind.Compiled,
  scripted: TokenKind.Scripted,
  dual: TokenKind.Dual,
  freestanding: TokenKind.Freestanding,
  portable: TokenKind.Portable,
  reads: TokenKind.Reads,
  edits: TokenKind.Edits,
  takes: TokenKind.Takes,
  shares: TokenKind.Shares,
  modifier: TokenKind.Modifier,
  safe: TokenKind.Safe,
  synchronized: TokenKind.Synchronized,
  unsafe: TokenKind.Unsafe,
  requires: TokenKind.Requires,
  distinct: TokenKind.Distinct,
  atomic: TokenKind.Atomic,
  asm: TokenKind.Asm,
  volatile: TokenKind.Volatile,
  where: TokenKind.Where,
  size_of: TokenKind.SizeOf,
  align_of: TokenKind.AlignOf,
  reinterpret: TokenKind.Reinterpret,
  reinterpretChecked: TokenKind.ReinterpretChecked,
  get: TokenKind.Get,
  set: TokenKind.Set,
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
    while (this.pos < this.source.length) {
      this.skipWhitespace();
      if (this.pos >= this.source.length) break;

      const token = this.nextToken();
      if (token) {
        this.tokens.push(token);
      }
    }

    this.tokens.push({
      kind: TokenKind.EOF,
      text: '',
      offset: this.pos,
      line: this.line,
      column: this.column,
      length: 0,
    });

    return this.tokens;
  }

  private peek(offset = 0): string {
    return this.source[this.pos + offset] ?? '';
  }

  private advance(count = 1): string {
    let result = '';
    for (let i = 0; i < count && this.pos < this.source.length; i++) {
      const ch = this.source[this.pos++];
      result += ch;
      if (ch === '\n') {
        this.line++;
        this.column = 0;
      } else {
        this.column++;
      }
    }
    return result;
  }

  private skipWhitespace(): void {
    while (this.pos < this.source.length) {
      const ch = this.peek();
      if (ch === ' ' || ch === '\t' || ch === '\r' || ch === '\n') {
        this.advance();
      } else {
        break;
      }
    }
  }

  private makeToken(kind: TokenKind, startOffset: number, startLine: number, startCol: number): Token {
    const text = this.source.slice(startOffset, this.pos);
    return {
      kind,
      text,
      offset: startOffset,
      line: startLine,
      column: startCol,
      length: this.pos - startOffset,
    };
  }

  private nextToken(): Token | null {
    const startOffset = this.pos;
    const startLine = this.line;
    const startCol = this.column;
    const ch = this.peek();

    // Comments (# single-line, ## doc comment, /* */ block comment)
    if (ch === '#') {
      if (this.peek(1) === '#') {
        return this.readDocComment(startOffset, startLine, startCol);
      }
      return this.readHashLineComment(startOffset, startLine, startCol);
    }
    if (ch === '/' && this.peek(1) === '*') {
      return this.readBlockComment(startOffset, startLine, startCol);
    }

    // Template fences: ```
    if (ch === '`' && this.peek(1) === '`' && this.peek(2) === '`') {
      return this.readTemplateFence(startOffset, startLine, startCol);
    }

    // Prefixed strings: r"...", i"...", b"...", c"...", and triple-quoted variants
    if ((ch === 'r' || ch === 'i' || ch === 'b' || ch === 'c') && (this.peek(1) === '"' || this.peek(1) === "'")) {
      const prefix = this.advance(); // consume prefix
      const q = this.peek();
      if (this.peek(1) === q && this.peek(2) === q) {
        return this.readMultilineString(startOffset, startLine, startCol, q, prefix);
      }
      const kind = prefix === 'r' ? TokenKind.RawStringLiteral
        : prefix === 'i' ? TokenKind.InterpolatedStringLiteral
        : prefix === 'c' ? TokenKind.CharLiteral
        : TokenKind.BytesLiteral;
      return this.readString(startOffset, startLine, startCol, q, kind);
    }

    // Multiline strings: """ or '''
    if (
      (ch === '"' && this.peek(1) === '"' && this.peek(2) === '"') ||
      (ch === "'" && this.peek(1) === "'" && this.peek(2) === "'")
    ) {
      return this.readMultilineString(startOffset, startLine, startCol, ch, '');
    }

    // Regular strings
    if (ch === '"' || ch === "'") {
      return this.readString(startOffset, startLine, startCol, ch, TokenKind.StringLiteral);
    }

    // Numbers
    if (this.isDigit(ch)) {
      return this.readNumber(startOffset, startLine, startCol);
    }

    // Identifiers & keywords
    if (this.isIdentStart(ch)) {
      return this.readIdentifier(startOffset, startLine, startCol);
    }

    // Dynamic field access: !{
    if (ch === '!' && this.peek(1) === '{') {
      this.advance(2);
      return this.makeToken(TokenKind.BangLeftBrace, startOffset, startLine, startCol);
    }

    // Lifetime label: ~name or ~static (when followed by lowercase letter or _)
    if (ch === '~' && (this.peek(1) >= 'a' && this.peek(1) <= 'z' || this.peek(1) === '_')) {
      this.advance(); // consume ~
      while (this.pos < this.source.length && this.isIdentContinue(this.peek())) {
        this.advance();
      }
      return this.makeToken(TokenKind.LifetimeLabel, startOffset, startLine, startCol);
    }

    // Multi-char operators
    if (ch === '=' && this.peek(1) === '>') {
      this.advance(2);
      return this.makeToken(TokenKind.Arrow, startOffset, startLine, startCol);
    }
    if (ch === '=' && this.peek(1) === '=') {
      this.advance(2);
      return this.makeToken(TokenKind.EqualEqual, startOffset, startLine, startCol);
    }
    if (ch === '!' && this.peek(1) === '=') {
      this.advance(2);
      return this.makeToken(TokenKind.BangEqual, startOffset, startLine, startCol);
    }
    if (ch === '<' && this.peek(1) === '<') {
      if (this.peek(2) === '=') {
        this.advance(3);
        return this.makeToken(TokenKind.ShiftLeftAssign, startOffset, startLine, startCol);
      }
      this.advance(2);
      return this.makeToken(TokenKind.ShiftLeft, startOffset, startLine, startCol);
    }
    if (ch === '>' && this.peek(1) === '>') {
      if (this.peek(2) === '=') {
        this.advance(3);
        return this.makeToken(TokenKind.ShiftRightAssign, startOffset, startLine, startCol);
      }
      this.advance(2);
      return this.makeToken(TokenKind.ShiftRight, startOffset, startLine, startCol);
    }
    if (ch === '<' && this.peek(1) === '=') {
      this.advance(2);
      return this.makeToken(TokenKind.LessEqual, startOffset, startLine, startCol);
    }
    if (ch === '>' && this.peek(1) === '=') {
      this.advance(2);
      return this.makeToken(TokenKind.GreaterEqual, startOffset, startLine, startCol);
    }
    if (ch === '&' && this.peek(1) === '&') {
      this.advance(2);
      return this.makeToken(TokenKind.And, startOffset, startLine, startCol);
    }
    if (ch === '|' && this.peek(1) === '|') {
      this.advance(2);
      return this.makeToken(TokenKind.Or, startOffset, startLine, startCol);
    }
    if (ch === '?' && this.peek(1) === '.') {
      this.advance(2);
      return this.makeToken(TokenKind.QuestionDot, startOffset, startLine, startCol);
    }
    if (ch === '?' && this.peek(1) === '?') {
      this.advance(2);
      return this.makeToken(TokenKind.QuestionQuestion, startOffset, startLine, startCol);
    }
    // ** and **=
    if (ch === '*' && this.peek(1) === '*') {
      if (this.peek(2) === '=') {
        this.advance(3);
        return this.makeToken(TokenKind.StarStarAssign, startOffset, startLine, startCol);
      }
      this.advance(2);
      return this.makeToken(TokenKind.StarStar, startOffset, startLine, startCol);
    }
    // // and //= (floor division & floor-division assignment, §1-3.7)
    if (ch === '/' && this.peek(1) === '/') {
      if (this.peek(2) === '=') {
        this.advance(3);
        return this.makeToken(TokenKind.SlashSlashAssign, startOffset, startLine, startCol);
      }
      this.advance(2);
      return this.makeToken(TokenKind.SlashSlash, startOffset, startLine, startCol);
    }
    // Compound assignment: +=, -=, *=, /=, %=, &=, |=, ^=
    if (ch === '+' && this.peek(1) === '=') { this.advance(2); return this.makeToken(TokenKind.PlusAssign, startOffset, startLine, startCol); }
    if (ch === '-' && this.peek(1) === '=') { this.advance(2); return this.makeToken(TokenKind.MinusAssign, startOffset, startLine, startCol); }
    if (ch === '*' && this.peek(1) === '=') { this.advance(2); return this.makeToken(TokenKind.StarAssign, startOffset, startLine, startCol); }
    if (ch === '/' && this.peek(1) === '=') { this.advance(2); return this.makeToken(TokenKind.SlashAssign, startOffset, startLine, startCol); }
    if (ch === '%' && this.peek(1) === '=') { this.advance(2); return this.makeToken(TokenKind.PercentAssign, startOffset, startLine, startCol); }
    if (ch === '&' && this.peek(1) === '=') { this.advance(2); return this.makeToken(TokenKind.AmpersandAssign, startOffset, startLine, startCol); }
    if (ch === '|' && this.peek(1) === '=') { this.advance(2); return this.makeToken(TokenKind.PipeAssign, startOffset, startLine, startCol); }
    if (ch === '^' && this.peek(1) === '=') { this.advance(2); return this.makeToken(TokenKind.CaretAssign, startOffset, startLine, startCol); }
    // .., ..=, ...
    if (ch === '.' && this.peek(1) === '.') {
      if (this.peek(2) === '.') {
        this.advance(3);
        return this.makeToken(TokenKind.DotDotDot, startOffset, startLine, startCol);
      }
      if (this.peek(2) === '=') {
        this.advance(3);
        return this.makeToken(TokenKind.DotDotEqual, startOffset, startLine, startCol);
      }
      this.advance(2);
      return this.makeToken(TokenKind.DotDot, startOffset, startLine, startCol);
    }

    // Single-char operators & punctuation
    const singleCharMap: Record<string, TokenKind> = {
      '+': TokenKind.Plus,
      '-': TokenKind.Minus,
      '*': TokenKind.Star,
      '/': TokenKind.Slash,
      '%': TokenKind.Percent,
      '=': TokenKind.Assign,
      '<': TokenKind.LessThan,
      '>': TokenKind.GreaterThan,
      '!': TokenKind.Bang,
      '&': TokenKind.Ampersand,
      '^': TokenKind.Caret,
      '~': TokenKind.Tilde,
      '?': TokenKind.Question,
      '|': TokenKind.Pipe,
      '.': TokenKind.Dot,
      ':': TokenKind.Colon,
      ';': TokenKind.Semicolon,
      ',': TokenKind.Comma,
      '@': TokenKind.At,
      '(': TokenKind.LeftParen,
      ')': TokenKind.RightParen,
      '{': TokenKind.LeftBrace,
      '}': TokenKind.RightBrace,
      '[': TokenKind.LeftBracket,
      ']': TokenKind.RightBracket,
    };

    if (ch in singleCharMap) {
      this.advance();
      return this.makeToken(singleCharMap[ch], startOffset, startLine, startCol);
    }

    // Unknown character — error token
    this.advance();
    return this.makeToken(TokenKind.Error, startOffset, startLine, startCol);
  }

  private readDocComment(startOffset: number, startLine: number, startCol: number): Token {
    this.advance(2); // skip ##
    while (this.pos < this.source.length && this.peek() !== '\n') {
      this.advance();
    }
    return this.makeToken(TokenKind.DocComment, startOffset, startLine, startCol);
  }

  private readHashLineComment(startOffset: number, startLine: number, startCol: number): Token {
    this.advance(1); // skip #
    while (this.pos < this.source.length && this.peek() !== '\n') {
      this.advance();
    }
    return this.makeToken(TokenKind.LineComment, startOffset, startLine, startCol);
  }

  private readBlockComment(startOffset: number, startLine: number, startCol: number): Token {
    this.advance(2); // skip /*
    while (this.pos < this.source.length) {
      if (this.peek() === '*' && this.peek(1) === '/') {
        this.advance(2);
        break;
      }
      this.advance();
    }
    return this.makeToken(TokenKind.BlockComment, startOffset, startLine, startCol);
  }

  private readTemplateFence(startOffset: number, startLine: number, startCol: number): Token {
    this.advance(3); // skip ```
    // Read descriptor and content until closing ```
    while (this.pos < this.source.length) {
      if (this.peek() === '`' && this.peek(1) === '`' && this.peek(2) === '`') {
        this.advance(3);
        break;
      }
      this.advance();
    }
    return this.makeToken(TokenKind.TemplateFenceOpen, startOffset, startLine, startCol);
  }

  private readMultilineString(startOffset: number, startLine: number, startCol: number, quote: string, prefix: string): Token {
    this.advance(3); // skip """ or '''
    while (this.pos < this.source.length) {
      if (this.peek() === quote && this.peek(1) === quote && this.peek(2) === quote) {
        this.advance(3);
        break;
      }
      if (prefix !== 'r' && this.peek() === '\\') {
        this.advance(2); // skip escape
      } else {
        this.advance();
      }
    }
    const kind = prefix === 'r' ? TokenKind.RawStringLiteral
      : prefix === 'i' ? TokenKind.InterpolatedStringLiteral
      : TokenKind.MultilineStringLiteral;
    return this.makeToken(kind, startOffset, startLine, startCol);
  }

  private readString(startOffset: number, startLine: number, startCol: number, quote: string, kind: TokenKind = TokenKind.StringLiteral): Token {
    this.advance(); // skip opening quote
    const isRaw = kind === TokenKind.RawStringLiteral;

    while (this.pos < this.source.length) {
      const ch = this.peek();
      if (!isRaw && ch === '\\') {
        this.advance(2); // skip escape
      } else if (ch === quote) {
        this.advance(); // skip closing quote
        break;
      } else if (ch === '\n') {
        // Unterminated string on newline
        break;
      } else {
        this.advance();
      }
    }

    return this.makeToken(kind, startOffset, startLine, startCol);
  }

  private readNumber(startOffset: number, startLine: number, startCol: number): Token {
    let isFloat = false;

    // Hex, binary, octal
    if (this.peek() === '0') {
      const next = this.peek(1);
      if (next === 'x' || next === 'X') {
        this.advance(2);
        while (this.pos < this.source.length && (this.isHexDigit(this.peek()) || this.peek() === '_')) {
          this.advance();
        }
        this.readIntTypeSuffix();
        return this.makeToken(TokenKind.IntLiteral, startOffset, startLine, startCol);
      }
      if (next === 'b' || next === 'B') {
        this.advance(2);
        while (this.pos < this.source.length && (this.peek() === '0' || this.peek() === '1' || this.peek() === '_')) {
          this.advance();
        }
        this.readIntTypeSuffix();
        return this.makeToken(TokenKind.IntLiteral, startOffset, startLine, startCol);
      }
      if (next === 'o' || next === 'O') {
        this.advance(2);
        while (this.pos < this.source.length && ((this.peek() >= '0' && this.peek() <= '7') || this.peek() === '_')) {
          this.advance();
        }
        this.readIntTypeSuffix();
        return this.makeToken(TokenKind.IntLiteral, startOffset, startLine, startCol);
      }
    }

    // Decimal integer or float
    while (this.pos < this.source.length && (this.isDigit(this.peek()) || this.peek() === '_')) {
      this.advance();
    }

    // Decimal point (but not `..` range operator)
    if (this.peek() === '.' && this.isDigit(this.peek(1))) {
      isFloat = true;
      this.advance(); // skip .
      while (this.pos < this.source.length && (this.isDigit(this.peek()) || this.peek() === '_')) {
        this.advance();
      }
    }

    // Exponent
    if (this.peek() === 'e' || this.peek() === 'E') {
      isFloat = true;
      this.advance();
      if (this.peek() === '+' || this.peek() === '-') {
        this.advance();
      }
      while (this.pos < this.source.length && (this.isDigit(this.peek()) || this.peek() === '_')) {
        this.advance();
      }
    }

    // Type suffix: f32, f64, d, i32, i64, i (on floats or ints), or i8/i16/i32/i64/u8/u16/u32/u64/n on ints
    if (this.readFloatOrComplexSuffix(isFloat)) {
      isFloat = true;
    } else if (!isFloat) {
      this.readIntTypeSuffix();
    }

    return this.makeToken(
      isFloat ? TokenKind.FloatLiteral : TokenKind.IntLiteral,
      startOffset,
      startLine,
      startCol
    );
  }

  private readIntTypeSuffix(): boolean {
    const ch = this.peek();
    if (ch === 'n' && !this.isIdentContinue(this.peek(1))) {
      this.advance();
      return true;
    }
    if (ch === 'i' || ch === 'u') {
      const rest = this.source.slice(this.pos, this.pos + 4);
      for (const sfx of ['i8', 'i16', 'i32', 'i64', 'u8', 'u16', 'u32', 'u64']) {
        if (rest.startsWith(sfx) && !this.isIdentContinue(this.peek(sfx.length))) {
          this.advance(sfx.length);
          return true;
        }
      }
    }
    return false;
  }

  private readFloatOrComplexSuffix(isFloatForm: boolean): boolean {
    const ch = this.peek();
    if (ch === 'd' && !this.isIdentContinue(this.peek(1))) {
      this.advance();
      return true;
    }
    if (ch === 'f') {
      const rest = this.source.slice(this.pos, this.pos + 4);
      for (const sfx of ['f32', 'f64']) {
        if (rest.startsWith(sfx) && !this.isIdentContinue(this.peek(sfx.length))) {
          this.advance(sfx.length);
          return true;
        }
      }
    }
    // Complex suffixes (§1-3.6): `i` on any numeric literal, or `i32`/`i64` on float literals
    if (ch === 'i') {
      const rest = this.source.slice(this.pos, this.pos + 4);
      for (const sfx of ['i32', 'i64', 'i']) {
        if (rest.startsWith(sfx) && !this.isIdentContinue(this.peek(sfx.length))) {
          if (sfx === 'i' || isFloatForm) {
            this.advance(sfx.length);
            return true;
          }
        }
      }
    }
    return false;
  }

  private readIdentifier(startOffset: number, startLine: number, startCol: number): Token {
    while (this.pos < this.source.length && this.isIdentContinue(this.peek())) {
      this.advance();
    }

    const text = this.source.slice(startOffset, this.pos);

    // Check keywords
    if (text in KEYWORDS) {
      return this.makeToken(KEYWORDS[text], startOffset, startLine, startCol);
    }

    // Type identifiers start with uppercase
    const firstChar = text[0];
    if (firstChar >= 'A' && firstChar <= 'Z') {
      return this.makeToken(TokenKind.TypeIdentifier, startOffset, startLine, startCol);
    }

    return this.makeToken(TokenKind.Identifier, startOffset, startLine, startCol);
  }

  private isDigit(ch: string): boolean {
    return ch >= '0' && ch <= '9';
  }

  private isHexDigit(ch: string): boolean {
    return (
      (ch >= '0' && ch <= '9') ||
      (ch >= 'a' && ch <= 'f') ||
      (ch >= 'A' && ch <= 'F')
    );
  }

  private isIdentStart(ch: string): boolean {
    return (
      (ch >= 'a' && ch <= 'z') ||
      (ch >= 'A' && ch <= 'Z') ||
      ch === '_'
    );
  }

  private isIdentContinue(ch: string): boolean {
    return this.isIdentStart(ch) || this.isDigit(ch);
  }
}
