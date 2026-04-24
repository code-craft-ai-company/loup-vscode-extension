// ============================================================================
// Loom Language Server — LSP entry point with all providers
// ============================================================================

import {
  createConnection,
  TextDocuments,
  ProposedFeatures,
  InitializeParams,
  InitializeResult,
  TextDocumentSyncKind,
  Diagnostic,
  DiagnosticSeverity,
  CompletionItem,
  CompletionItemKind,
  Hover,
  MarkupKind,
  DocumentSymbol,
  SymbolKind as LspSymbolKind,
  FoldingRange,
  FoldingRangeKind,
  DefinitionParams,
  Location,
  SemanticTokensBuilder,
  SemanticTokensLegend,
  TextDocumentPositionParams,
  CodeAction,
  CodeActionKind,
  TextEdit,
  SignatureHelp,
  SignatureInformation,
  ParameterInformation,
  SymbolInformation,
  WorkspaceSymbol,
  DocumentFormattingParams,
  CodeActionParams,
} from 'vscode-languageserver/node.js';

import { TextDocument } from 'vscode-languageserver-textdocument';
import { Parser } from './parser/parser.js';
import { Lexer } from './parser/lexer.js';
import * as AST from './parser/ast.js';
import { SymbolTable, SymbolInfo, SymbolKind } from './symbols/symbolTable.js';

// ---- Connection setup ----

const connection = createConnection(ProposedFeatures.all);
const documents = new TextDocuments(TextDocument);
const parser = new Parser();

// Document caches
const astCache = new Map<string, AST.Program>();
const symbolCache = new Map<string, SymbolInfo[]>();
const diagnosticsCache = new Map<string, AST.ParseDiagnostic[]>();
const symbolTableCache = new Map<string, SymbolTable>();

// ---- Semantic token types ----

const tokenTypes = [
  'keyword', 'type', 'enum', 'enumMember', 'function',
  'variable', 'parameter', 'property', 'namespace', 'decorator',
  'string', 'number', 'operator', 'comment',
];
const tokenModifiers = ['declaration', 'async', 'static', 'public'];

const semanticTokensLegend: SemanticTokensLegend = {
  tokenTypes,
  tokenModifiers,
};

// ---- Initialization ----

connection.onInitialize((_params: InitializeParams): InitializeResult => {
  return {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      completionProvider: {
        triggerCharacters: ['.', ':', '{', '$', '%', '!', '@', '"', "'"],
        resolveProvider: false,
      },
      hoverProvider: true,
      documentSymbolProvider: true,
      foldingRangeProvider: true,
      definitionProvider: true,
      semanticTokensProvider: {
        legend: semanticTokensLegend,
        full: true,
      },
      documentFormattingProvider: true,
      codeActionProvider: {
        codeActionKinds: [
          CodeActionKind.QuickFix,
          CodeActionKind.Source,
        ],
      },
      signatureHelpProvider: {
        triggerCharacters: ['(', ','],
        retriggerCharacters: [','],
      },
      workspaceSymbolProvider: true,
    },
  };
});

// ---- Document lifecycle ----

documents.onDidChangeContent((change: { document: TextDocument }) => {
  validateDocument(change.document);
});

function validateDocument(document: TextDocument): void {
  const uri = document.uri;
  const text = document.getText();

  const result = parser.parse(text);
  astCache.set(uri, result.program);
  diagnosticsCache.set(uri, result.diagnostics);

  // Build symbol table
  const table = new SymbolTable();
  const symbols = table.build(result.program);
  symbolCache.set(uri, symbols);
  symbolTableCache.set(uri, table);

  // Publish diagnostics
  const diagnostics: Diagnostic[] = result.diagnostics.map(d => ({
    severity: d.severity === 'error' ? DiagnosticSeverity.Error
      : d.severity === 'warning' ? DiagnosticSeverity.Warning
      : DiagnosticSeverity.Information,
    range: {
      start: { line: d.range.start.line, character: d.range.start.column },
      end: { line: d.range.end.line, character: d.range.end.column },
    },
    message: d.message,
    source: 'loom',
  }));

  connection.sendDiagnostics({ uri, diagnostics });
}

// ---- Completions ----

const LOOM_BUILTINS = [
  'print', 'println', 'len', 'assert', 'panic',
  'args', 'env', 'readBytes', 'readText', 'writeBytes', 'writeText', 'exec',
  'readBytesAsync', 'readTextAsync', 'writeBytesAsync', 'writeTextAsync', 'execAsync'
];

const LOOM_DUNDERS = [
  '__name__', '__file__', '__execmode__', '__module__'
];

// Strict keywords from Loom Language Reference v1.18 §3.4 (Appendix A)
const LOOM_KEYWORDS = [
  'abstract', 'and', 'as', 'async', 'await', 'bnot', 'borrow',
  'break', 'catch', 'class', 'continue', 'defer', 'del',
  'do', 'dynamic', 'else', 'enum', 'extern', 'false',
  'finally', 'fn', 'for', 'from', 'func', 'gen',
  'global', 'if', 'implements', 'import', 'in',
  'instanceof', 'interface', 'is', 'let', 'lifetime', 'macro', 'match', 'new',
  'namespace', 'noescape', 'nonlocal', 'none', 'not', 'or', 'portal',
  'prefer', 'pub', 'return', 'spawn', 'static', 'super',
  'struct', 'suspend', 'throw', 'true', 'try', 'type', 'Self',
  'this', 'typeof', 'unique', 'var', 'while', 'with', 'yield', 'consume',
  'arc', 'operator',
  'reads', 'edits', 'takes', 'shares', 'modifier', 'safe',
  'synchronized', 'unsafe', 'requires', 'atomic',
  // v1.18 additions — shared memory model (§8.1.1, §17b)
  'local', 'shared',
  // Contextual keywords surfaced for completion (§3.4)
  'get', 'set', 'quote', 'box', 'group', 'distinct', 'excl',
  'reinterpret', 'reinterpretChecked', 'size_of', 'align_of',
  // Dotted-mode-name tails (v1.18 §2.4.4, §2.5) — used inside @mode(...)
  'compiled', 'native', 'scripted', 'freestanding', 'dual',
  // FFI keywords
  'js', 'val',
  // Field and closure qualifiers
  'weak', 'unowned',
];

// Dotted file-mode names used in @mode(...) directives (v1.18 §2.5)
const LOOM_MODES = [
  'web.scripted', 'web.compiled',
  'host.scripted', 'host.dual', 'host.native',
  'freestanding',
];

// Built-in types from Loom Language Reference v1.18 §4, §24, §32, Appendix C
const LOOM_TYPES = [
  // Primitives (§4.1)
  'int', 'int8', 'int16', 'int32', 'int64',
  'uint', 'uint8', 'uint16', 'uint32', 'uint64', 'bigint',
  'float', 'float32', 'float64', 'decimal',
  'bool', 'char', 'string', 'bytes', 'void',
  // Generic collection types (§3.8)
  'list', 'dict', 'set', 'tuple', 'fn',
  // Well-known types
  'Any', 'Task', 'TaskGroup', 'Option', 'Result', 'Signal', 'View', 'Template', 'Type',
  'None', 'Some', 'Ok', 'Err',
  // Exceptions (§26.1)
  'BaseException', 'Exception', 'BaseExceptionGroup', 'ExceptionGroup',
  'AssertionError', 'TypeError', 'NotFoundError', 'Error', 'AppError',
  'SystemExit', 'KeyboardInterrupt', 'GeneratorExit',
  'ModuleLoadError', 'BlockingTimeoutError', 'AlignmentError',
  'RemoteException',
  // Time
  'Duration', 'Instant',
  // Text/regex
  'Regex', 'Match',
  // Concurrency — thread-local primitives
  'Actor', 'ActorContext', 'CancellationToken',
  'Sendable', 'Mutex', 'MutexGuard', 'RwLock', 'RwLockReadGuard', 'RwLockWriteGuard',
  'Atomic', 'Ordering', 'Thread', 'ThreadHandle', 'ThreadPool', 'ThreadLocal', 'TaskLocal',
  'ExecutorConfig', 'RuntimeConfig',
  'ScriptWorker', 'WorkerChannel',
  // v1.18 shared memory types (§17b, stdlib §21.1, §21.3)
  'Shareable',
  'SharedBuffer', 'SharedArray', 'SharedArena', 'SharedRef', 'SharedWeakRef', 'WeakRef',
  'SharedMutex', 'SharedRwLock', 'SharedCondVar', 'SharedSemaphore',
  'SharedBarrier', 'SharedQueue', 'SharedStack',
  // v1.18 serialization (§32, stdlib §21.6)
  'Value', 'ValueKind', 'TemporalKind',
  'Serializable', 'Deserializable', 'SerializationAdapter',
  'FormatDriver', 'SerializationError', 'DeserializationError',
  'UnknownEnumVariant',
  // Numeric traits (v1.18 stdlib §21.2)
  'Integer', 'Numeric',
  // UI
  'ComponentRegistry', 'MountHandle', 'MountTarget', 'EffectHandle',
  'Window', 'WindowConfig', 'Tray',
  'SafeHtml', 'Url', 'UrlError', 'StateSerializer',
  'StyleSheet', 'ClassName',
  // Native / ownership (§23, §24)
  'NativeHandle', 'OwnedHandle', 'BorrowedHandle', 'ThreadSafeHandle', 'PinnedRef',
  'MaybeUninit', 'Volatile', 'PartialInit',
  // Freestanding (§24)
  'InterruptFrame', 'InterruptGuard', 'DmaBuffer', 'DmaTransfer',
  'PanicSource', 'FreestandingDebugFrame',
  // Debug
  'DebugFrame', 'TraceEvent', 'TraceEventKind', 'StackFrame',
  'Module',
  // Standard interface types
  'Iterable', 'Iterator', 'AsyncIterable', 'AsyncIterator',
  'Comparable', 'Equatable', 'Hashable', 'Sized', 'Sliceable',
  'Display', 'Copyable', 'Callable', 'Finalizable',
  'From', 'Box', 'Vec',
];

// Standard library namespaces — Loom v1.16 uses `core.*`, `io.*`, `net.*`,
// `data.*`, `web.*`, `sync.*`, `lang.*`, `debug.*`, `structures.*`, `ui.*`
// (see §21 and the §13.3 manifest example).
const SYSTEM_MODULES = [
  { label: 'core.text', detail: 'String utilities', items: ['split', 'join', 'trim', 'trimStart', 'trimEnd', 'startsWith', 'endsWith', 'contains', 'indexOf', 'toUpper', 'toLower', 'replace', 'replaceAll', 'padStart', 'padEnd', 'repeat', 'reverse', 'parseInt', 'parseFloat', 'parseBool', 'toBytes', 'fromBytes', 'toHex', 'fromHex', 'toBase64', 'fromBase64', 'grapheme'] },
  { label: 'data.json', detail: 'JSON parsing/serialisation', items: ['parse', 'stringify', 'getString', 'getInt', 'getFloat', 'getBool', 'getObject', 'getArray'] },
  { label: 'data.bin', detail: 'Binary data utilities', items: ['pack', 'unpack'] },
  { label: 'core.time', detail: 'Instants, durations, and async sleep', items: ['Instant', 'Duration', 'sleep'] },
  { label: 'core.collections', detail: 'Higher-order collection utilities', items: ['map', 'flatMap', 'filter', 'filterMap', 'reduce', 'find', 'findIndex', 'any', 'all', 'none', 'sortBy', 'sortByDesc', 'reverse', 'groupBy', 'partition', 'zip', 'unzip', 'unique', 'uniqueBy', 'flatten', 'chunk', 'range', 'repeat', 'tabulate', 'sum', 'sumFloat', 'min', 'max', 'minBy', 'maxBy', 'countWhere', 'mapValues', 'filterKeys', 'mergeWith', 'fromEntries', 'toEntries'] },
  { label: 'core.math', detail: 'Extended numeric math', items: ['sin', 'cos', 'exp', 'log', 'tan', 'atan', 'sqrt', 'pow'] },
  { label: 'core.reflect', detail: 'Structural reflection (universal)', items: ['typeOf', 'is', 'fields', 'methods', 'constructors', 'annotations', 'variants', 'callableName'] },
  { label: 'core.inspect', detail: 'Dynamic introspection (scripted/compiled)', items: ['new', 'get', 'getAs', 'set', 'invoke', 'invokeAs', 'as'] },
  { label: 'core.atomic', detail: 'Hardware atomic primitives and ordering (v1.18 §21.2)', items: ['Ordering', 'Relaxed', 'Acquire', 'Release', 'AcqRel', 'SeqCst', 'Atomic', 'atomicLoad', 'atomicStore', 'atomicAdd', 'atomicSub', 'atomicOr', 'atomicAnd', 'atomicXor', 'compareExchange', 'Integer', 'Float', 'Numeric'] },
  { label: 'core.serialization', detail: 'Format-agnostic serialization foundation (v1.18 §32, §21.6)', items: ['Value', 'ValueKind', 'TemporalKind', 'Serializable', 'Deserializable', 'SerializationAdapter', 'FormatDriver', 'SerializationError', 'DeserializationError', 'RemoteException', 'migrate'] },
  { label: 'sync.shared', detail: 'Inter-thread shared-memory primitives (v1.18 §21.3)', items: ['SharedMutex', 'SharedRwLock', 'SharedCondVar', 'SharedSemaphore', 'SharedBarrier', 'SharedQueue', 'SharedStack'] },
  { label: 'concurrent', detail: 'Worker orchestration and arena bridging (v1.18 §21.4)', items: ['ScriptWorker', 'WorkerChannel', 'share'] },
  { label: 'io.fs', detail: 'Filesystem capability', items: ['read', 'write', 'readAsync', 'writeAsync', 'linesAsync'] },
  { label: 'io.proc', detail: 'Process execution', items: ['run', 'runAsync', 'on'] },
  { label: 'net.net', detail: 'Core networking', items: ['resolve', 'bind', 'connect'] },
  { label: 'net.http', detail: 'HTTP client and server', items: ['Client', 'Server', 'Request', 'Response', 'get', 'post', 'put', 'patch', 'delete', 'request'] },
  { label: 'net.ws', detail: 'WebSockets', items: ['WebSocket', 'connect', 'Server', 'Message'] },
  { label: 'debug.capture', detail: 'Time-travel capture server', items: ['start', 'stop', 'activate', 'deactivate'] },
  { label: 'debug.activate', detail: 'Portal activation registry', items: ['activate', 'deactivate', 'activePortals'] },
  { label: 'debug.log', detail: 'Debug logging', items: ['info', 'warn', 'error', 'debug'] },
  { label: 'debug.mcp', detail: 'MCP debug server', items: ['start', 'stop'] },
  { label: 'debug.browser', detail: 'Browser DevTools debug bridge', items: ['start', 'stop'] },
  { label: 'debug.freestanding', detail: 'Freestanding debug service (§24.25)', items: ['start', 'poll', 'stop'] },
  { label: 'ui.root', detail: 'Reactive UI root (universal)', items: ['signal', 'derived', 'effect', 'mount', 'Signal', 'View', 'ComponentRegistry', 'EffectHandle', 'MountHandle', 'MountTarget'] },
  { label: 'ui.primitives', detail: 'Cross-platform layout primitives', items: ['Row', 'Column', 'Stack', 'Scroll', 'Text', 'Button', 'Image', 'Icon', 'Canvas', 'TextField', 'Checkbox', 'Slider', 'Select', 'Axis', 'Alignment', 'TextStyle', 'Color', 'Insets'] },
  { label: 'ui.web', detail: 'Web-specific UI rendering and SSR', items: ['renderToString', 'hydrate', 'mount', 'StateSerializer', 'serializeState', 'deserializeState', 'render'] },
  { label: 'ui.desktop', detail: 'Desktop window management', items: ['Window', 'WindowConfig', 'Tray', 'showWindow', 'showDialog', 'showNotification'] },
  { label: 'web.dom', detail: 'DOM access', items: ['querySelector', 'querySelectorAll', 'Element', 'Event'] },
  { label: 'web.css', detail: 'CSS-in-Loom styling', items: ['StyleSheet', 'ClassName', 'css', 'keyframes', 'media'] },
  { label: 'web.storage', detail: 'Browser storage', items: ['localStorage', 'sessionStorage'] },
  { label: 'lang.template', detail: 'Templates and rendering', items: ['Template', 'RenderContext', 'Renderable', 'SafeHtml', 'escapeHtml', 'escapeAttribute', 'Url'] },
  { label: 'lang.interop.js', detail: 'Typed JS/native facades', items: ['fetch', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'querySelector', 'querySelectorAll', 'Request', 'Response', 'Element', 'Event', 'TimerHandle'] },
  { label: 'sync.thread', detail: 'OS thread parallelism (native)', items: ['Mutex', 'MutexGuard', 'RwLock', 'Atomic', 'Thread', 'ThreadHandle', 'ThreadPool', 'spawnBlocking'] },
  { label: 'structures', detail: 'Additional data structures', items: ['SortedList', 'TreeNode', 'Tree'] },
  { label: 'runtime', detail: 'Runtime configuration', items: ['configure', 'ExecutorConfig', 'RuntimeConfig', 'setDefaultSharedArena', 'configureDefaultSharedArena'] },
  { label: 'native.ffi', detail: 'Native FFI helpers', items: ['ThreadSafeHandle', 'ptrAdd'] },
  { label: 'native.atomic', detail: 'Hardware atomic primitives', items: ['hwFence'] },
  { label: 'native.gpu', detail: 'Low-level GPU kernel dispatch', items: ['GpuKernel', 'GpuBuffer', 'dispatch'] },
  { label: 'native.hal', detail: 'Hardware abstraction layer', items: ['AcceleratorDevice', 'AcceleratorBuffer'] },
  { label: 'native.mpu', detail: 'MPU stack-guard API (freestanding)', items: ['configure'] },
  { label: 'native.dma', detail: 'DMA ownership API (freestanding)', items: ['DmaBuffer', 'DmaTransfer', 'startTransfer'] },
];

connection.onCompletion((_params: TextDocumentPositionParams): CompletionItem[] => {
  const items: CompletionItem[] = [];

  // Built-ins
  for (const fn of LOOM_BUILTINS) {
    items.push({ label: fn, kind: CompletionItemKind.Function, detail: 'Built-in' });
  }

  // Dunders
  for (const dunder of LOOM_DUNDERS) {
    items.push({ label: dunder, kind: CompletionItemKind.Constant, detail: 'Built-in Dunder' });
  }

  // Keywords
  for (const kw of LOOM_KEYWORDS) {
    items.push({ label: kw, kind: CompletionItemKind.Keyword });
  }

  // Dotted mode names (v1.18 §2.5) — useful inside @mode(...)
  for (const mode of LOOM_MODES) {
    items.push({
      label: mode,
      kind: CompletionItemKind.EnumMember,
      detail: '@mode(...) target',
    });
  }

  // Types
  for (const t of LOOM_TYPES) {
    items.push({ label: t, kind: CompletionItemKind.Class });
  }

  // system.* modules
  for (const mod of SYSTEM_MODULES) {
    items.push({
      label: mod.label,
      kind: CompletionItemKind.Module,
      detail: mod.detail,
    });
    for (const fn of mod.items) {
      items.push({
        label: fn,
        kind: CompletionItemKind.Function,
        detail: mod.label,
      });
    }
  }

  // Symbols from the current document
  const uri = _params.textDocument.uri;
  const symbols = symbolCache.get(uri) || [];
  for (const sym of symbols) {
    items.push({
      label: sym.name,
      kind: symbolKindToCompletionKind(sym.kind),
      detail: sym.type,
    });
    if (sym.children) {
      for (const child of sym.children) {
        items.push({
          label: child.name,
          kind: symbolKindToCompletionKind(child.kind),
          detail: child.type,
        });
      }
    }
  }

  return items;
});

function symbolKindToCompletionKind(kind: SymbolKind): CompletionItemKind {
  switch (kind) {
    case SymbolKind.Function:
    case SymbolKind.AsyncFunction:
    case SymbolKind.GenFunction:
    case SymbolKind.AsyncGenFunction:
    case SymbolKind.ExternFunction:
    case SymbolKind.Operator:
      return CompletionItemKind.Function;
    case SymbolKind.Class: return CompletionItemKind.Class;
    case SymbolKind.Struct: return CompletionItemKind.Struct;
    case SymbolKind.Enum: return CompletionItemKind.Enum;
    case SymbolKind.EnumVariant: return CompletionItemKind.EnumMember;
    case SymbolKind.Interface: return CompletionItemKind.Interface;
    case SymbolKind.TypeAlias: return CompletionItemKind.TypeParameter;
    case SymbolKind.Macro: return CompletionItemKind.Function;
    case SymbolKind.Variable:
    case SymbolKind.ExternValue:
      return CompletionItemKind.Variable;
    case SymbolKind.Parameter: return CompletionItemKind.Variable;
    case SymbolKind.Portal: return CompletionItemKind.Event;
    case SymbolKind.Import: return CompletionItemKind.Module;
    case SymbolKind.Field: return CompletionItemKind.Field;
    default: return CompletionItemKind.Text;
  }
}

// ---- Hover ----

connection.onHover((params: TextDocumentPositionParams): Hover | null => {
  const uri = params.textDocument.uri;
  const symbols = symbolCache.get(uri) || [];
  const pos = params.position;

  // Find symbol at position
  const sym = findSymbolAtPosition(symbols, pos.line, pos.character);
  if (!sym) return null;

  const typeStr = sym.type ? `\`\`\`loom\n${sym.type}\n\`\`\`` : '';
  const kindStr = sym.kind.toString();

  return {
    contents: {
      kind: MarkupKind.Markdown,
      value: `**${sym.name}** *(${kindStr})*\n\n${typeStr}`,
    },
  };
});

function findSymbolAtPosition(symbols: SymbolInfo[], line: number, character: number): SymbolInfo | null {
  for (const sym of symbols) {
    if (isInRange(sym.range, line, character)) {
      // Check children first (more specific)
      if (sym.children) {
        const child = findSymbolAtPosition(sym.children, line, character);
        if (child) return child;
      }
      return sym;
    }
  }
  return null;
}

function isInRange(range: AST.Range, line: number, character: number): boolean {
  if (line < range.start.line || line > range.end.line) return false;
  if (line === range.start.line && character < range.start.column) return false;
  if (line === range.end.line && character > range.end.column) return false;
  return true;
}

// ---- Document Symbols ----

connection.onDocumentSymbol((params: { textDocument: { uri: string } }): DocumentSymbol[] => {
  const symbols = symbolCache.get(params.textDocument.uri) || [];
  return symbols.map(symbolToDocumentSymbol);
});

function symbolToDocumentSymbol(sym: SymbolInfo): DocumentSymbol {
  return {
    name: sym.name,
    kind: symbolKindToLspKind(sym.kind),
    range: {
      start: { line: sym.range.start.line, character: sym.range.start.column },
      end: { line: sym.range.end.line, character: sym.range.end.column },
    },
    selectionRange: {
      start: { line: sym.selectionRange.start.line, character: sym.selectionRange.start.column },
      end: { line: sym.selectionRange.end.line, character: sym.selectionRange.end.column },
    },
    detail: sym.type,
    children: sym.children?.map(symbolToDocumentSymbol),
  };
}

function symbolKindToLspKind(kind: SymbolKind): LspSymbolKind {
  switch (kind) {
    case SymbolKind.Function:
    case SymbolKind.AsyncFunction:
    case SymbolKind.GenFunction:
    case SymbolKind.AsyncGenFunction:
    case SymbolKind.ExternFunction:
    case SymbolKind.Operator:
      return LspSymbolKind.Function;
    case SymbolKind.Class: return LspSymbolKind.Class;
    case SymbolKind.Struct: return LspSymbolKind.Struct;
    case SymbolKind.Enum: return LspSymbolKind.Enum;
    case SymbolKind.EnumVariant: return LspSymbolKind.EnumMember;
    case SymbolKind.Interface: return LspSymbolKind.Interface;
    case SymbolKind.TypeAlias: return LspSymbolKind.TypeParameter;
    case SymbolKind.Macro: return LspSymbolKind.Function;
    case SymbolKind.Variable: return LspSymbolKind.Variable;
    case SymbolKind.ExternValue: return LspSymbolKind.Variable;
    case SymbolKind.Parameter: return LspSymbolKind.Variable;
    case SymbolKind.Portal: return LspSymbolKind.Event;
    case SymbolKind.Import: return LspSymbolKind.Module;
    case SymbolKind.Field: return LspSymbolKind.Field;
    default: return LspSymbolKind.Variable;
  }
}

// ---- Go to Definition ----

connection.onDefinition((params: DefinitionParams): Location | null => {
  const uri = params.textDocument.uri;
  const symbols = symbolCache.get(uri) || [];
  const document = documents.get(uri);
  if (!document) return null;

  // Get the word at cursor position
  const text = document.getText();
  const offset = document.offsetAt(params.position);
  const word = getWordAtOffset(text, offset);
  if (!word) return null;

  // Search for the symbol definition
  const sym = findSymbolByName(symbols, word);
  if (!sym) return null;

  return {
    uri,
    range: {
      start: { line: sym.range.start.line, character: sym.range.start.column },
      end: { line: sym.range.end.line, character: sym.range.end.column },
    },
  };
});

function getWordAtOffset(text: string, offset: number): string | null {
  let start = offset;
  let end = offset;
  while (start > 0 && isIdentChar(text[start - 1])) start--;
  while (end < text.length && isIdentChar(text[end])) end++;
  if (start === end) return null;
  return text.slice(start, end);
}

function isIdentChar(ch: string): boolean {
  return (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || (ch >= '0' && ch <= '9') || ch === '_';
}

function findSymbolByName(symbols: SymbolInfo[], name: string): SymbolInfo | null {
  for (const sym of symbols) {
    if (sym.name === name) return sym;
    if (sym.children) {
      const child = findSymbolByName(sym.children, name);
      if (child) return child;
    }
  }
  return null;
}

// ---- Folding Ranges ----

connection.onFoldingRanges((params: { textDocument: { uri: string } }): FoldingRange[] => {
  const uri = params.textDocument.uri;
  const program = astCache.get(uri);
  if (!program) return [];

  const ranges: FoldingRange[] = [];
  collectFoldingRanges(program, ranges);
  return ranges;
});

function collectFoldingRanges(node: AST.AstNode, ranges: FoldingRange[]): void {
  // Blocks always fold
  if ('body' in node && node.body && typeof node.body === 'object' && 'kind' in node.body) {
    const body = node.body as AST.Block;
    if (body.kind === 'Block' && body.range.start.line !== body.range.end.line) {
      ranges.push({
        startLine: body.range.start.line,
        endLine: body.range.end.line,
        kind: FoldingRangeKind.Region,
      });
    }
  }

  // Match expression arms
  if (node.kind === 'MatchExpr') {
    const match = node as AST.MatchExpr;
    if (match.range.start.line !== match.range.end.line) {
      ranges.push({
        startLine: match.range.start.line,
        endLine: match.range.end.line,
        kind: FoldingRangeKind.Region,
      });
    }
  }

  // Recurse
  for (const key of Object.keys(node)) {
    const val = (node as unknown as Record<string, unknown>)[key];
    if (Array.isArray(val)) {
      for (const item of val) {
        if (item && typeof item === 'object' && 'kind' in item) {
          collectFoldingRanges(item as AST.AstNode, ranges);
        }
      }
    } else if (val && typeof val === 'object' && 'kind' in val) {
      collectFoldingRanges(val as AST.AstNode, ranges);
    }
  }
}

// ---- Semantic Tokens ----

connection.languages.semanticTokens.on((params) => {
  const uri = params.textDocument.uri;
  const document = documents.get(uri);
  if (!document) return { data: [] };

  const text = document.getText();
  const lexer = new Lexer(text);
  const tokens = lexer.tokenize();

  const builder = new SemanticTokensBuilder();

  for (const token of tokens) {
    let tokenType = -1;
    const modifiers = 0;

    switch (token.kind) {
      case 'if': case 'else': case 'for': case 'while': case 'do':
      case 'match': case 'break': case 'continue': case 'return':
      case 'throw': case 'try': case 'catch': case 'finally':
      case 'await': case 'spawn': case 'yield': case 'suspend':
      case 'let': case 'var':
      case 'fun': case 'async': case 'gen': case 'macro':
      case 'class': case 'dynamic': case 'abstract': case 'struct':
      case 'interface': case 'enum': case 'extern': case 'type':
      case 'pub': case 'static': case 'operator':
      case 'from': case 'import': case 'as':
      case 'in': case 'is': case 'not': case 'instanceof': case 'typeof':
      case 'defer': case 'with':
      case 'portal': case 'group': case 'js': case 'native':
      case 'val': case 'true': case 'false': case 'none':
      case 'new': case 'del': case 'global': case 'nonlocal':
      case 'implements': case 'fn': case 'get': case 'set': case 'box':
      case 'weak': case 'unowned':
      // v1.16 additions
      case 'namespace': case 'modifier': case 'synchronized':
      case 'unique': case 'arc': case 'safe': case 'unsafe':
      case 'requires': case 'atomic': case 'consume':
      case 'Self': case 'this':
      case 'reads': case 'edits': case 'takes': case 'shares':
      case 'distinct': case 'reinterpret': case 'reinterpretChecked':
      case 'size_of': case 'align_of': case 'quote': case 'asm':
      // v1.18 additions — shared memory model (§8.1.1, §17b)
      case 'local': case 'shared':
        tokenType = 0; // keyword
        break;
      case 'TypeIdentifier':
        tokenType = 1; // type
        break;
      case 'Identifier':
        tokenType = 5; // variable
        break;
      case 'IntLiteral':
      case 'FloatLiteral':
        tokenType = 11; // number
        break;
      case 'StringLiteral':
      case 'MultilineStringLiteral':
      case 'BytesLiteral':
      case 'RawStringLiteral':
      case 'TemplateFenceOpen':
        tokenType = 10; // string
        break;
      case 'LineComment':
      case 'BlockComment':
      case 'DocComment':
        tokenType = 13; // comment
        break;
    }

    if (tokenType >= 0) {
      builder.push(token.line, token.column, token.length, tokenType, modifiers);
    }
  }

  return builder.build();
});

// ---- Document Formatting ----

connection.onDocumentFormatting((params: DocumentFormattingParams): TextEdit[] => {
  const document = documents.get(params.textDocument.uri);
  if (!document) return [];

  const text = document.getText();
  const lines = text.split('\n');
  const edits: TextEdit[] = [];
  const tabSize = params.options.tabSize || 2;
  const indent = params.options.insertSpaces ? ' '.repeat(tabSize) : '\t';

  let depth = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.length === 0) continue;

    // Decrease depth for closing braces
    if (trimmed.startsWith('}') || trimmed.startsWith(')') || trimmed.startsWith(']')) {
      depth = Math.max(0, depth - 1);
    }

    const expectedIndent = indent.repeat(depth);
    const currentIndent = line.match(/^(\s*)/)?.[1] || '';

    if (currentIndent !== expectedIndent) {
      edits.push({
        range: {
          start: { line: i, character: 0 },
          end: { line: i, character: currentIndent.length },
        },
        newText: expectedIndent,
      });
    }

    // Increase depth for opening braces
    for (const ch of trimmed) {
      if (ch === '{' || ch === '(' || ch === '[') depth++;
      if (ch === '}' || ch === ')' || ch === ']') depth = Math.max(0, depth - 1);
    }
    // Re-count from the trimmed line for balanced braces
    const opens = (trimmed.match(/[{(\[]/g) || []).length;
    const closes = (trimmed.match(/[})\]]/g) || []).length;
    depth = Math.max(0, depth - opens - closes + opens); // Reset
    // Simple: count opens and closes
    depth = 0;
    for (let j = 0; j <= i; j++) {
      const t = lines[j].trim();
      for (const ch of t) {
        if (ch === '{') depth++;
        if (ch === '}') depth = Math.max(0, depth - 1);
      }
    }
  }

  // Ensure trailing newline
  if (!text.endsWith('\n')) {
    edits.push({
      range: {
        start: { line: lines.length - 1, character: lines[lines.length - 1].length },
        end: { line: lines.length - 1, character: lines[lines.length - 1].length },
      },
      newText: '\n',
    });
  }

  // Remove trailing whitespace
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedRight = line.replace(/\s+$/, '');
    if (trimmedRight.length < line.length) {
      edits.push({
        range: {
          start: { line: i, character: trimmedRight.length },
          end: { line: i, character: line.length },
        },
        newText: '',
      });
    }
  }

  return edits;
});

// ---- Code Actions ----

connection.onCodeAction((params: CodeActionParams): CodeAction[] => {
  const uri = params.textDocument.uri;
  const diagnostics = params.context.diagnostics;
  const actions: CodeAction[] = [];

  for (const diag of diagnostics) {
    // Quick fix: missing 'await'
    if (diag.message.includes('await') || diag.message.includes('Task')) {
      actions.push({
        title: "Add 'await' keyword",
        kind: CodeActionKind.QuickFix,
        diagnostics: [diag],
        edit: {
          changes: {
            [uri]: [{
              range: {
                start: diag.range.start,
                end: diag.range.start,
              },
              newText: 'await ',
            }],
          },
        },
      });
    }

    // Quick fix: missing import
    if (diag.message.includes('not defined') || diag.message.includes('undeclared')) {
      const document = documents.get(uri);
      if (document) {
        const word = document.getText(diag.range);
        // Check if it's a system module function
        for (const mod of SYSTEM_MODULES) {
          if (mod.items.includes(word)) {
            actions.push({
              title: `Import '${word}' from '${mod.label}'`,
              kind: CodeActionKind.QuickFix,
              diagnostics: [diag],
              edit: {
                changes: {
                  [uri]: [{
                    range: {
                      start: { line: 0, character: 0 },
                      end: { line: 0, character: 0 },
                    },
                    newText: `from ${mod.label} import ${word}\n`,
                  }],
                },
              },
            });
          }
        }
      }
    }

    // Quick fix: missing match arms
    if (diag.message.includes('match') && diag.message.includes('exhaustive')) {
      actions.push({
        title: 'Add wildcard arm "_ => ..."',
        kind: CodeActionKind.QuickFix,
        diagnostics: [diag],
        edit: {
          changes: {
            [uri]: [{
              range: {
                start: diag.range.end,
                end: diag.range.end,
              },
              newText: '\n  _ => { /* TODO */ }',
            }],
          },
        },
      });
    }
  }

  return actions;
});

// ---- Signature Help ----

connection.onSignatureHelp((params: TextDocumentPositionParams): SignatureHelp | null => {
  const uri = params.textDocument.uri;
  const symbols = symbolCache.get(uri) || [];
  const document = documents.get(uri);
  if (!document) return null;

  // Find function call context
  const text = document.getText();
  const offset = document.offsetAt(params.position);

  // Walk backwards to find the opening paren and function name
  let parenDepth = 0;
  let commaCount = 0;
  let funcNameEnd = -1;

  for (let i = offset - 1; i >= 0; i--) {
    const ch = text[i];
    if (ch === ')') parenDepth++;
    else if (ch === '(') {
      if (parenDepth === 0) {
        funcNameEnd = i;
        break;
      }
      parenDepth--;
    } else if (ch === ',' && parenDepth === 0) {
      commaCount++;
    }
  }

  if (funcNameEnd < 0) return null;

  const funcName = getWordAtOffset(text, funcNameEnd);
  if (!funcName) return null;

  const sym = findSymbolByName(symbols, funcName);
  if (!sym || !sym.type) return null;

  // Parse signature from type string
  const sigMatch = sym.type.match(/^(?:async )?(?:func|fun)\((.*)\)(.*)$/);
  if (!sigMatch) return null;

  const paramsStr = sigMatch[1];
  const returnType = sigMatch[2] || '';
  const paramList = paramsStr ? paramsStr.split(',').map((p: string) => p.trim()) : [];

  const sig: SignatureInformation = {
    label: `${funcName}(${paramsStr})${returnType}`,
    parameters: paramList.map((p: string): ParameterInformation => ({
      label: p,
    })),
  };

  return {
    signatures: [sig],
    activeSignature: 0,
    activeParameter: commaCount,
  };
});

// ---- Workspace Symbols ----

connection.onWorkspaceSymbol((_params): WorkspaceSymbol[] => {
  const results: WorkspaceSymbol[] = [];
  const query = (_params.query || '').toLowerCase();

  for (const [uri, symbols] of symbolCache) {
    for (const sym of symbols) {
      if (query && !sym.name.toLowerCase().includes(query)) continue;
      results.push({
        name: sym.name,
        kind: symbolKindToLspKind(sym.kind),
        location: {
          uri,
          range: {
            start: { line: sym.range.start.line, character: sym.range.start.column },
            end: { line: sym.range.end.line, character: sym.range.end.column },
          },
        },
      });
      // Include children
      if (sym.children) {
        for (const child of sym.children) {
          if (query && !child.name.toLowerCase().includes(query)) continue;
          results.push({
            name: `${sym.name}.${child.name}`,
            kind: symbolKindToLspKind(child.kind),
            containerName: sym.name,
            location: {
              uri,
              range: {
                start: { line: child.range.start.line, character: child.range.start.column },
                end: { line: child.range.end.line, character: child.range.end.column },
              },
            },
          });
        }
      }
    }
  }

  return results;
});

// ---- Start ----

documents.listen(connection);
connection.listen();
