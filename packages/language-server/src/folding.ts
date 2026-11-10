// ============================================================================
// Folding ranges, computed from tokens so that braces inside strings, comments
// and template fences do not open or close a fold.
// ============================================================================

import { Lexer, TokenKind } from './parser/lexer.js';

export interface PlainFoldingRange {
  startLine: number;
  endLine: number;
  kind?: 'comment' | 'region';
}

export function computeFoldingRanges(text: string): PlainFoldingRange[] {
  const tokens = new Lexer(text).tokenize();
  const ranges: PlainFoldingRange[] = [];
  const stack: number[] = [];
  let commentRun: { start: number; end: number } | undefined;

  const flushComments = (): void => {
    if (commentRun && commentRun.end > commentRun.start) {
      ranges.push({ startLine: commentRun.start, endLine: commentRun.end, kind: 'comment' });
    }
    commentRun = undefined;
  };

  for (const tok of tokens) {
    const isLineComment = tok.kind === TokenKind.LineComment || tok.kind === TokenKind.DocComment;
    if (isLineComment) {
      // consecutive comment lines fold together
      if (commentRun && tok.line === commentRun.end + 1) {
        commentRun.end = tok.line;
      } else if (!commentRun || tok.line !== commentRun.end) {
        flushComments();
        commentRun = { start: tok.line, end: tok.line };
      }
      continue;
    }
    flushComments();

    switch (tok.kind) {
      case TokenKind.LeftBrace:
      case TokenKind.LeftBracket:
      case TokenKind.LeftParen:
        stack.push(tok.line);
        break;
      case TokenKind.RightBrace:
      case TokenKind.RightBracket:
      case TokenKind.RightParen: {
        const startLine = stack.pop();
        // keep the closing line visible
        if (startLine !== undefined && tok.line - 1 > startLine) {
          ranges.push({ startLine, endLine: tok.line - 1 });
        }
        break;
      }
      case TokenKind.BlockComment:
        if (tok.endLine > tok.line) ranges.push({ startLine: tok.line, endLine: tok.endLine, kind: 'comment' });
        break;
      case TokenKind.TemplateFenceOpen:
      case TokenKind.MultilineStringLiteral:
      case TokenKind.RawStringLiteral:
      case TokenKind.InterpolatedStringLiteral:
        if (tok.endLine - 1 > tok.line) ranges.push({ startLine: tok.line, endLine: tok.endLine - 1, kind: 'region' });
        break;
      default:
        break;
    }
  }
  flushComments();

  ranges.sort((a, b) => a.startLine - b.startLine || b.endLine - a.endLine);
  return ranges;
}
