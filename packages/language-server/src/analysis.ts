// ============================================================================
// Loup document analysis — parse, symbol table and diagnostics for one text.
// Pure (no LSP connection), so it can be tested and reused by every handler.
// ============================================================================

import { Parser } from './parser/parser.js';
import * as AST from './parser/ast.js';
import { SymbolTable, SymbolInfo } from './symbols/symbolTable.js';

export interface PlainPosition {
  line: number;
  character: number;
}

export interface PlainRange {
  start: PlainPosition;
  end: PlainPosition;
}

/** A diagnostic in LSP coordinates (0-based line, UTF-16 character). */
export interface PlainDiagnostic {
  severity: 'error' | 'warning' | 'info';
  range: PlainRange;
  message: string;
}

export interface Analysis {
  program: AST.Program;
  symbols: SymbolInfo[];
  symbolTable: SymbolTable;
  diagnostics: PlainDiagnostic[];
}

/** Package manifests (`package.lppkg`, `loup.pkg`) are TOML, not Loup source. */
export function isManifestUri(uri: string): boolean {
  const path = uri.split(/[?#]/)[0].toLowerCase();
  return path.endsWith('.lppkg') || path.endsWith('.pkg');
}

export function toPlainRange(range: AST.Range): PlainRange {
  return {
    start: { line: range.start.line, character: range.start.column },
    end: { line: range.end.line, character: range.end.column },
  };
}

export function analyze(text: string): Analysis {
  const { program, diagnostics: parseDiagnostics } = new Parser().parse(text);
  const symbolTable = new SymbolTable();
  const symbols = symbolTable.build(program);
  const diagnostics = parseDiagnostics.map((d): PlainDiagnostic => ({
    severity: d.severity,
    range: toPlainRange(d.range),
    message: d.message,
  }));
  return { program, symbols, symbolTable, diagnostics };
}

/** The syntax diagnostics for a Loup source text. */
export function computeDiagnostics(text: string): PlainDiagnostic[] {
  return analyze(text).diagnostics;
}

const WORD_CHAR = /[\p{L}\p{Nd}_]/u;

/** The identifier at `offset` (or ending exactly there), or null. */
export function getWordAtOffset(text: string, offset: number): string | null {
  let start = Math.max(0, Math.min(offset, text.length));
  let end = start;
  while (start > 0 && WORD_CHAR.test(text[start - 1])) start--;
  while (end < text.length && WORD_CHAR.test(text[end])) end++;
  return end > start ? text.slice(start, end) : null;
}

/**
 * The line an auto-import may be inserted at: after the leading comments, the
 * `@mode(...)` directive and the `namespace` declaration, which must stay first
 * (§1-13.0).
 */
export function importInsertLine(text: string): number {
  const lines = text.split('\n');
  let insertAt = 0;
  let inBlockComment = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (inBlockComment) {
      if (line.includes('*/')) inBlockComment = false;
      insertAt = i + 1;
      continue;
    }
    if (line === '' || line.startsWith('#')) continue;
    if (line.startsWith('/*')) {
      inBlockComment = !line.includes('*/');
      continue;
    }
    if (/^@mode\b/.test(line) || /^@compiled\b/.test(line) || /^namespace\b[^{]*;?$/.test(line)) {
      insertAt = i + 1;
      continue;
    }
    break;
  }
  return Math.min(insertAt, lines.length);
}

/** Split a parameter list at the commas outside every bracket pair. */
export function splitTopLevel(text: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = '';
  for (const ch of text) {
    if (ch === '(' || ch === '[' || ch === '{') depth++;
    else if (ch === ')' || ch === ']' || ch === '}') depth--;
    if (ch === ',' && depth === 0) {
      parts.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  if (current.trim() !== '') parts.push(current.trim());
  return parts;
}
