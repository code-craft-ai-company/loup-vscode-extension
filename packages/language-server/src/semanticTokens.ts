// ============================================================================
// Semantic token classification. Only the reserved words of §1-3.4 are keywords
// everywhere; a contextual keyword (`get`, `set`, `group`, `box`, `part`, ...)
// is classified like any other identifier unless it stands in its own position.
// ============================================================================

import { Lexer, Token, TokenKind, isKeywordKind, isReservedWord } from './parser/lexer.js';

export const TOKEN_TYPES = [
  'keyword', 'type', 'class', 'enum', 'enumMember', 'interface',
  'struct', 'typeParameter',
  'function', 'method', 'macro', 'variable', 'parameter', 'property',
  'decorator', 'namespace', 'string', 'number', 'operator', 'comment',
] as const;

export const TOKEN_MODIFIERS = [
  'declaration', 'definition', 'readonly', 'static', 'async',
  'modification', 'documentation', 'defaultLibrary',
] as const;

export type TokenTypeName = typeof TOKEN_TYPES[number];
export type TokenModifierName = typeof TOKEN_MODIFIERS[number];

export interface ClassifiedToken {
  line: number;
  character: number;
  length: number;
  type: TokenTypeName;
  modifiers: TokenModifierName[];
}

/** §1-4.1 primitives and the built-in generic collections. */
export const PRIMITIVE_TYPES: readonly string[] = [
  'int', 'int8', 'int16', 'int32', 'int64',
  'uint', 'uint8', 'uint16', 'uint32', 'uint64', 'bigint',
  'float', 'float32', 'float64', 'decimal',
  'complex', 'complex32', 'complex64', 'fixed',
  'bool', 'char', 'string', 'bytes', 'void', 'noreturn', 'impossible',
  'list', 'dict', 'set', 'tuple', 'buffer', 'array',
];

/** Is `tok` a contextual keyword standing in the position that makes it one? */
function isContextualKeywordUse(tokens: Token[], i: number): boolean {
  const tok = tokens[i];
  const prev = tokens[i - 1];
  const next = tokens[i + 1];
  if (prev && (prev.kind === TokenKind.Dot || prev.kind === TokenKind.QuestionDot)) return false;
  const nextIsWord = next !== undefined && next.line === tok.endLine
    && (next.kind === TokenKind.Identifier || next.kind === TokenKind.TypeIdentifier || isKeywordKind(next.kind));
  switch (tok.kind) {
    case TokenKind.Get:
    case TokenKind.Set:
      return nextIsWord && tokens[i + 2]?.kind === TokenKind.LeftParen;
    case TokenKind.Quote:
    case TokenKind.Asm:
      return next?.kind === TokenKind.LeftBrace;
    case TokenKind.Group:
      return prev?.kind === TokenKind.Await && next?.kind === TokenKind.LeftBrace;
    case TokenKind.Concurrent:
      return prev?.kind === TokenKind.For;
    case TokenKind.Excl:
      return next?.kind === TokenKind.Borrow;
    case TokenKind.Arc:
      return next?.kind === TokenKind.Let || next?.kind === TokenKind.Var;
    case TokenKind.Operator:
      return next?.kind === TokenKind.Fun || next?.kind === TokenKind.Modifier;
    case TokenKind.Compiled:
      return prev?.kind === TokenKind.Prefer;
    case TokenKind.Js:
    case TokenKind.Native:
      return prev?.kind === TokenKind.Extern;
    case TokenKind.Val:
      return prev?.kind === TokenKind.Js || prev?.kind === TokenKind.StringLiteral;
    case TokenKind.Foundation:
    case TokenKind.Overlay:
      return prev?.kind === TokenKind.Template;
    case TokenKind.Onto:
      return nextIsWord && tokens[i - 2]?.kind === TokenKind.Overlay;
    case TokenKind.Part:
      return next?.kind === TokenKind.Fun || (next !== undefined && isKeywordKind(next.kind) && tokens[i + 2]?.kind === TokenKind.Fun);
    case TokenKind.Spawn:
    case TokenKind.Box:
      return nextIsWord || next?.kind === TokenKind.LeftBrace;
    case TokenKind.Weak:
    case TokenKind.Unowned:
      return nextIsWord || next?.kind === TokenKind.LeftBracket;
    case TokenKind.SizeOf:
    case TokenKind.AlignOf:
    case TokenKind.Reinterpret:
    case TokenKind.ReinterpretChecked:
      return next?.kind === TokenKind.LeftBracket;
    case TokenKind.Distinct:
      return next?.kind === TokenKind.LeftParen
        && (prev?.kind === TokenKind.Requires || prev?.kind === TokenKind.Comma || prev?.kind === TokenKind.LeftParen);
    case TokenKind.None:
    case TokenKind.This:
    case TokenKind.Super:
      return true;
    default:
      return false;
  }
}

export function classifyTokens(text: string): ClassifiedToken[] {
  const tokens = new Lexer(text).tokenize();
  const primitives = new Set(PRIMITIVE_TYPES);
  const out: ClassifiedToken[] = [];

  const push = (tok: Token, length: number, type: TokenTypeName, modifiers: TokenModifierName[] = []): void => {
    out.push({ line: tok.line, character: tok.column, length, type, modifiers });
  };

  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i];
    if (tok.kind === TokenKind.EOF) break;
    // A semantic token cannot span lines; multi-line tokens keep their grammar colours.
    if (tok.endLine !== tok.line) continue;
    const prev = tokens[i - 1];
    const next = tokens[i + 1];

    switch (tok.kind) {
      case TokenKind.LineComment:
      case TokenKind.BlockComment:
        push(tok, tok.length, 'comment');
        continue;
      case TokenKind.DocComment:
        push(tok, tok.length, 'comment', ['documentation']);
        continue;
      case TokenKind.StringLiteral:
      case TokenKind.CharLiteral:
      case TokenKind.InterpolatedStringLiteral:
      case TokenKind.RawStringLiteral:
      case TokenKind.BytesLiteral:
      case TokenKind.MultilineStringLiteral:
        push(tok, tok.length, 'string');
        continue;
      case TokenKind.IntLiteral:
      case TokenKind.FloatLiteral:
        push(tok, tok.length, 'number');
        continue;
      case TokenKind.At:
        // @name — one decorator token when the name follows directly
        if (next && next.offset === tok.offset + tok.length && next.line === tok.line
          && (next.kind === TokenKind.Identifier || next.kind === TokenKind.TypeIdentifier || isKeywordKind(next.kind))) {
          push(tok, tok.length + next.length, 'decorator');
          i++;
        } else {
          push(tok, tok.length, 'decorator');
        }
        continue;
      default:
        break;
    }

    const isName = tok.kind === TokenKind.Identifier || tok.kind === TokenKind.TypeIdentifier;
    if (!isName && !isKeywordKind(tok.kind)) continue;

    const afterDot = prev !== undefined && (prev.kind === TokenKind.Dot || prev.kind === TokenKind.QuestionDot);

    if (!isName && !afterDot) {
      if (isReservedWord(tok.text) || isContextualKeywordUse(tokens, i)) {
        const modifiers: TokenModifierName[] = [];
        if (tok.kind === TokenKind.Async) modifiers.push('async');
        if (tok.kind === TokenKind.Static) modifiers.push('static');
        if (tok.kind === TokenKind.Let || tok.kind === TokenKind.Const) modifiers.push('readonly');
        if (tok.kind === TokenKind.Var) modifiers.push('modification');
        push(tok, tok.length, 'keyword', modifiers);
        continue;
      }
      // a contextual keyword used as an ordinary name: classified below
    }

    if (afterDot) {
      push(tok, tok.length, next?.kind === TokenKind.LeftParen ? 'method' : 'property');
      continue;
    }
    if (primitives.has(tok.text)) {
      push(tok, tok.length, 'type', ['defaultLibrary']);
      continue;
    }
    switch (prev?.kind) {
      case TokenKind.Class:
        push(tok, tok.length, 'class', ['declaration']);
        continue;
      case TokenKind.Struct:
        push(tok, tok.length, 'struct', ['declaration']);
        continue;
      case TokenKind.Enum:
        push(tok, tok.length, 'enum', ['declaration']);
        continue;
      case TokenKind.Interface:
        push(tok, tok.length, 'interface', ['declaration']);
        continue;
      case TokenKind.Type:
        push(tok, tok.length, 'type', ['declaration']);
        continue;
      case TokenKind.Fun:
        push(tok, tok.length, 'function', ['declaration']);
        continue;
      case TokenKind.Macro:
        push(tok, tok.length, 'macro', ['declaration']);
        continue;
      case TokenKind.Let:
      case TokenKind.Const:
        push(tok, tok.length, 'variable', ['declaration', 'readonly']);
        continue;
      case TokenKind.Var:
        push(tok, tok.length, 'variable', ['declaration', 'modification']);
        continue;
      default:
        break;
    }
    if (next?.kind === TokenKind.Bang && tokens[i + 2]?.kind === TokenKind.LeftParen && next.offset === tok.offset + tok.length) {
      push(tok, tok.length, 'macro');
    } else if (next?.kind === TokenKind.LeftParen) {
      push(tok, tok.length, tok.kind === TokenKind.TypeIdentifier ? 'type' : 'function');
    } else if (tok.kind === TokenKind.TypeIdentifier) {
      push(tok, tok.length, 'type');
    }
    // other identifiers: left to the TextMate grammar
  }
  return out;
}
