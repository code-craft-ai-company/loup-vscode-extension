// ============================================================================
// Indentation formatter. Re-indents lines by bracket depth, computed from
// tokens. Lines that begin inside a multi-line string, template fence or block
// comment are left exactly as written: their leading whitespace is content.
// ============================================================================

import { Lexer, TokenKind } from './parser/lexer.js';

const OPENERS = new Set<TokenKind>([TokenKind.LeftBrace, TokenKind.LeftBracket, TokenKind.LeftParen]);
const CLOSERS = new Set<TokenKind>([TokenKind.RightBrace, TokenKind.RightBracket, TokenKind.RightParen]);

/** The formatted text, with the document's own line endings. */
export function formatSource(text: string, indentUnit: string): string {
  const eol = text.includes('\r\n') ? '\r\n' : '\n';
  const lines = text.split('\n').map(line => (line.endsWith('\r') ? line.slice(0, -1) : line));
  const tokens = new Lexer(text).tokenize();

  const insideToken = new Array<boolean>(lines.length).fill(false);
  const indentLevel = new Array<number>(lines.length).fill(0);

  // One indent level per source line that still has an unclosed bracket, so
  // `call(arg, {` indents its body once, not twice.
  const openLines: number[] = [];
  const levelNow = (): number => {
    let level = 0;
    for (let i = 0; i < openLines.length; i++) {
      if (i === 0 || openLines[i] !== openLines[i - 1]) level++;
    }
    return level;
  };

  let currentLine = -1;
  let assigned = false;
  let leadingCloser = false;
  for (const tok of tokens) {
    if (tok.kind === TokenKind.EOF) break;
    if (tok.line !== currentLine) {
      currentLine = tok.line;
      assigned = false;
      leadingCloser = false;
    }
    const isCloser = CLOSERS.has(tok.kind);
    const openedOn = isCloser ? openLines.pop() : undefined;
    if (!assigned && tok.line < lines.length) {
      if (isCloser) {
        // a leading closer sits at the indentation of the line that opened it
        indentLevel[tok.line] = openedOn !== undefined && openedOn < tok.line ? indentLevel[openedOn] : levelNow();
      } else {
        if (!leadingCloser) indentLevel[tok.line] = levelNow();
        assigned = true;
      }
      leadingCloser = isCloser;
    }
    if (OPENERS.has(tok.kind) || tok.kind === TokenKind.BangLeftBrace) openLines.push(tok.line);
    for (let inner = tok.line + 1; inner <= tok.endLine && inner < lines.length; inner++) {
      insideToken[inner] = true;
    }
    if (tok.endLine !== tok.line) {
      currentLine = tok.endLine;
      assigned = true;
    }
  }

  const out: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    if (insideToken[i]) {
      out.push(raw);
      continue;
    }
    const trimmed = raw.trim();
    if (trimmed.length === 0) {
      out.push('');
      continue;
    }
    out.push(indentUnit.repeat(indentLevel[i]) + trimmed);
  }
  return out.join(eol);
}
