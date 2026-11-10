// ============================================================================
// Loup Language Server — Out-of-process LSP server (v1.20)
// P1: Diagnostics, Completions, Hover, Document Symbols, Go-to-Definition, Folding
// P4: Semantic Tokens, Formatting, Code Actions, Signature Help, Workspace Symbols
// ============================================================================

import {
  createConnection,
  TextDocuments,
  Diagnostic,
  DiagnosticSeverity,
  ProposedFeatures,
  InitializeParams,
  InitializeResult,
  TextDocumentSyncKind,
  CompletionItem,
  CompletionItemKind,
  Hover,
  MarkupKind,
  DocumentSymbol,
  SymbolKind as LspSymbolKind,
  Location,
  FoldingRange,
  FoldingRangeKind,
  TextDocumentPositionParams,
  DocumentSymbolParams,
  FoldingRangeParams,
  DefinitionParams,
  SemanticTokensBuilder,
  SemanticTokensLegend,
  SemanticTokensParams,
  SemanticTokens,
  DocumentFormattingParams,
  TextEdit,
  CodeAction,
  CodeActionKind,
  CodeActionParams,
  SignatureHelp,
  SignatureInformation,
  ParameterInformation,
  WorkspaceSymbolParams,
  WorkspaceSymbol,
} from 'vscode-languageserver/node.js';

import { TextDocument } from 'vscode-languageserver-textdocument';
import { Parser } from './parser/parser.js';
import { Lexer, TokenKind } from './parser/lexer.js';
import * as AST from './parser/ast.js';
import { SymbolTable, SymbolInfo, SymbolKind } from './symbols/symbolTable.js';

// ---- Server setup ----

const connection = createConnection(ProposedFeatures.all);
const documents = new TextDocuments(TextDocument);

// Cache parsed ASTs and symbol tables per document URI
const astCache = new Map<string, AST.Program>();
const symbolCache = new Map<string, SymbolInfo[]>();
const scopeCache = new Map<string, SymbolTable>();

// ---- Initialization ----

// Semantic token types and modifiers
const tokenTypes = [
  'keyword', 'type', 'class', 'enum', 'enumMember', 'interface',
  'struct', 'typeParameter',
  'function', 'method', 'macro', 'variable', 'parameter', 'property',
  'decorator', 'namespace', 'string', 'number', 'operator', 'comment',
];
const tokenModifiers = [
  'declaration', 'definition', 'readonly', 'static', 'async',
  'modification', 'documentation', 'defaultLibrary',
];

const semanticTokensLegend: SemanticTokensLegend = {
  tokenTypes,
  tokenModifiers,
};

connection.onInitialize((_params: InitializeParams): InitializeResult => {
  return {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      completionProvider: {
        resolveProvider: false,
        triggerCharacters: ['.', ':', '@', '{', '('],
      },
      hoverProvider: true,
      documentSymbolProvider: true,
      definitionProvider: true,
      foldingRangeProvider: true,
      semanticTokensProvider: {
        legend: semanticTokensLegend,
        full: true,
      },
      documentFormattingProvider: true,
      codeActionProvider: {
        codeActionKinds: [CodeActionKind.QuickFix],
      },
      signatureHelpProvider: {
        triggerCharacters: ['(', ','],
      },
      workspaceSymbolProvider: true,
    },
  };
});

// ---- Document validation (Diagnostics) ----

documents.onDidChangeContent((change) => {
  validateDocument(change.document);
});

function validateDocument(textDocument: TextDocument): void {
  const text = textDocument.getText();
  const uri = textDocument.uri;

  // Skip package manifests (.lppkg / loup.pkg) for AST parsing
  if (uri.endsWith('.lppkg') || uri.endsWith('loup.pkg') || uri.endsWith('.pkg')) {
    connection.sendDiagnostics({ uri, diagnostics: [] });
    return;
  }

  const parser = new Parser();
  const { program, diagnostics: parseDiags } = parser.parse(text);

  // Cache AST and symbols
  astCache.set(uri, program);
  const symTable = new SymbolTable();
  const symbols = symTable.build(program);
  symbolCache.set(uri, symbols);
  scopeCache.set(uri, symTable);

  // Convert parse diagnostics to LSP diagnostics
  const lspDiagnostics: Diagnostic[] = parseDiags.map(d => ({
    severity: d.severity === 'error'
      ? DiagnosticSeverity.Error
      : d.severity === 'warning'
        ? DiagnosticSeverity.Warning
        : DiagnosticSeverity.Information,
    range: {
      start: { line: d.range.start.line, character: d.range.start.column },
      end: { line: d.range.end.line, character: d.range.end.column },
    },
    message: d.message,
    source: 'loup',
  }));

  connection.sendDiagnostics({ uri, diagnostics: lspDiagnostics });
}

// ---- Completions ----

const LOUP_KEYWORDS = [
  'let', 'var', 'const', 'func', 'fun', 'gen', 'macro', 'quote', 'return', 'yield', 'suspend',
  'if', 'else', 'for', 'while', 'do', 'match', 'break', 'continue', 'defer', 'with',
  'portal', 'async', 'await', 'spawn', 'group', 'concurrent', 'try', 'catch', 'finally', 'throw',
  'attempt', 'unreachable',
  'from', 'import', 'as', 'in', 'is', 'instanceof', 'typeof', 'not', 'and', 'or', 'bnot',
  'del', 'global', 'nonlocal', 'pub', 'static', 'override', 'final', 'sealed',
  'class', 'struct', 'abstract', 'dynamic', 'interface', 'implements', 'enum', 'type', 'namespace',
  'template', 'foundation', 'overlay', 'onto', 'part',
  'extern', 'js', 'native', 'val', 'new', 'box', 'true', 'false', 'None', 'this', 'Self', 'super',
  'fn', 'once', 'operator',
  'weak', 'unowned', 'arc', 'borrow', 'excl', 'unique', 'onstack', 'lifetime', 'noescape', 'consume',
  'noreturn', 'impossible',
  'prefer', 'compiled', 'scripted', 'dual', 'freestanding', 'portable',
  'reads', 'edits', 'takes', 'shares', 'modifier', 'safe', 'synchronized', 'unsafe',
  'requires', 'distinct', 'atomic', 'asm', 'volatile', 'where',
  'size_of', 'align_of', 'reinterpret', 'reinterpretChecked', 'get', 'set',
];

const LOUP_MODES = [
  { label: '@mode(host.scripted)', detail: 'Host JIT mode (default for .loup / .lpscr)', doc: 'Write-and-run scripting on the host environment.' },
  { label: '@mode(host.dual)', detail: 'Host hybrid mode — JIT or AOT (.lpscr / .lphc)', doc: 'Compiles cleanly to either script JIT or AOT native binary.' },
  { label: '@mode(host.native)', detail: 'Host AOT native binary (.lphc)', doc: 'Full LLVM/Cranelift AOT with ARC, SIMD, inline asm, and C FFI.' },
  { label: '@mode(web.scripted)', detail: 'Browser JIT mode (.lpweb)', doc: 'Runs in browser Wasm JIT engine with DOM/WebComponent access.' },
  { label: '@mode(web.compiled)', detail: 'Browser AOT Wasm mode (.lpweb)', doc: 'Compiles ahead-of-time to a standalone Wasm module.' },
  { label: '@mode(freestanding)', detail: 'Bare-metal mode — no runtime (.lpfree)', doc: 'Compiles to bare-metal binary with @entry and manual @allocator.' },
  { label: '@mode(portable)', detail: 'Portable library mode — compiled in importer\'s mode', doc: 'Checked against PORTABLE-SUBSET (§1-2.4.7) and lowered in each importing unit\'s mode.' },
];

const LOUP_TYPES = [
  'int', 'int8', 'int16', 'int32', 'int64',
  'uint8', 'uint16', 'uint32', 'uint64', 'bigint',
  'float', 'float32', 'float64', 'decimal',
  'complex', 'complex32', 'complex64', 'fixed',
  'bool', 'char', 'string', 'bytes', 'void', 'noreturn', 'impossible',
  'list', 'dict', 'set', 'tuple', 'fn', 'buffer', 'array',
  'Any', 'Self', 'Task', 'TaskGroup', 'Option', 'Result', 'Some', 'None', 'Ok', 'Err',
  'Signal', 'ReadonlySignal', 'View', 'Template', 'Scoped', 'AsyncScoped',
  'Channel', 'WaitGroup', 'Semaphore', 'Barrier', 'Mutex', 'RwLock',
  'CancellationToken', 'CancellationError', 'NativeHandle', 'Ptr',
  'Equatable', 'Comparable', 'Hashable', 'Display', 'Debug',
  'Iterable', 'Iterator', 'AsyncIterable', 'AsyncIterator',
  'From', 'Into', 'Clone', 'Default', 'Index', 'IndexMut', 'Slice', 'Contains', 'Len',
  'Sendable', 'ValueType',
  'SharedRef', 'SharedBuffer', 'SharedArray', 'SharedMutex', 'SharedRwLock', 'SharedQueue',
  'Serializable', 'Deserializable', 'RemoteException',
  'MaybeUninit', 'PartialInit', 'Volatile', 'PinnedRef', 'OwnedHandle', 'BorrowedHandle',
  'Thread', 'ThreadPool', 'ThreadLocal', 'ScriptWorker',
  'InterruptGuard', 'DmaBuffer', 'MemoryOrder', 'AlignmentError',
  'DesktopGrant', 'Order', 'RoundingMode', 'OverflowPolicy',
  'ComplexArithmeticError', 'ArrayShapeError', 'ArrayShapeErrorKind', 'ArrayIndexError',
  'ConcurrentIterationError', 'Interchange', 'InterchangeError', 'InterchangeErrorKind',
  'Encoding', 'Charset', 'Endianness', 'Sign', 'Padding', 'Justify', 'PriorityQueue', 'Mark',
];

const STDLIB_MODULES: Record<string, { label: string; detail: string; exports: string[] }> = {
  'core.text': {
    label: 'core.text',
    detail: 'String manipulation, formatting, and regex (§21.1)',
    exports: ['split', 'join', 'trim', 'trimStart', 'trimEnd', 'toUpper', 'toLower', 'startsWith', 'endsWith', 'contains', 'replace', 'replaceAll', 'padStart', 'padEnd', 'repeat', 'charAt', 'indexOf', 'substring', 'format', 'Regex', 'Match'],
  },
  'core.math': {
    label: 'core.math',
    detail: 'Mathematical constants and functions (§21.2)',
    exports: ['PI', 'E', 'TAU', 'INF', 'NAN', 'abs', 'min', 'max', 'clamp', 'floor', 'ceil', 'round', 'trunc', 'sqrt', 'cbrt', 'pow', 'exp', 'log', 'log2', 'log10', 'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'atan2', 'hypot', 'sign', ' isNan', 'isInf', 'isFinite'],
  },
  'core.complex': {
    label: 'core.complex',
    detail: 'Complex numbers and transcendental functions (§21.9)',
    exports: ['complex', 'complex32', 'complex64', 'fromPolar', 'abs', 'arg', 'conj', 'norm', 'polar', 'sqrt', 'exp', 'log', 'pow', 'sin', 'cos', 'tan', 'sinh', 'cosh', 'tanh', 'ComplexArithmeticError'],
  },
  'core.array': {
    label: 'core.array',
    detail: 'Rank-typed N-dimensional arrays (§21.10)',
    exports: ['zeros', 'ones', 'full', 'fromBuffer', 'fromList', 'iota', 'reshape', 'transpose', 'slice', 'Order', 'RowMajor', 'ColumnMajor', 'ArrayShapeError', 'ArrayShapeErrorKind', 'ArrayIndexError'],
  },
  'core.fpenv': {
    label: 'core.fpenv',
    detail: 'IEEE 754 floating-point environment control (§21.11)',
    exports: ['RoundingMode', 'withRounding', 'getRounding', 'testExceptions', 'clearExceptions', 'signalingNan'],
  },
  'core.numeric': {
    label: 'core.numeric',
    detail: 'Fixed-point and decimal rounding/overflow policies (§21.12)',
    exports: ['RoundingMode', 'OverflowPolicy'],
  },
  'core.interchange': {
    label: 'core.interchange',
    detail: 'Declarative binary/text record interchange (§4-2)',
    exports: ['Interchange', 'InterchangeError', 'InterchangeErrorKind', 'Encoding', 'Charset', 'Endianness', 'Sign', 'Padding', 'Justify'],
  },
  'core.sensitivity': {
    label: 'core.sensitivity',
    detail: 'Zero-overhead data sensitivity marking (§3-3.20)',
    exports: ['Mark', 'mark', 'unmark'],
  },
  'core.random': {
    label: 'core.random',
    detail: 'Random number generation (§21.3)',
    exports: ['nextInt', 'nextFloat', 'nextBool', 'nextBytes', 'choice', 'shuffle', 'Rng', 'SeededRng'],
  },
  'core.time': {
    label: 'core.time',
    detail: 'Clocks, durations, and timers (§21.4)',
    exports: ['Instant', 'Duration', 'sleep', 'timeout', 'interval'],
  },
  'core.datetime': {
    label: 'core.datetime',
    detail: 'Calendar dates, times, and timezones (§21.5)',
    exports: ['DateTime', 'LocalDate', 'LocalTime', 'TimeZone', 'Weekday', 'parseIso', 'formatIso'],
  },
  'core.uuid': {
    label: 'core.uuid',
    detail: 'UUID generation and parsing (§21.6)',
    exports: ['Uuid', 'v4', 'v7', 'parse', 'NIL'],
  },
  'core.collections': {
    label: 'core.collections',
    detail: 'Functional collection utilities and iterators (§21.7)',
    exports: ['map', 'filter', 'reduce', 'fold', 'flatMap', 'zip', 'enumerate', 'range', 'take', 'skip', 'chunk', 'groupBy', 'partition', 'sortBy', 'unique', 'find', 'any', 'all', 'count', 'sum', 'min', 'max'],
  },
  'core.atomic': {
    label: 'core.atomic',
    detail: 'Lock-free atomic primitives (§21.8)',
    exports: ['AtomicInt', 'AtomicBool', 'AtomicRef', 'MemoryOrder'],
  },
  'core.reflect': {
    label: 'core.reflect',
    detail: 'Compile-time and runtime type reflection (§1-16)',
    exports: ['typeOf', 'TypeInfo', 'FieldInfo', 'MethodInfo', 'getAnnotations'],
  },
  'core.inspect': {
    label: 'core.inspect',
    detail: 'Live runtime type and object inspection (§1-16)',
    exports: ['inspect', 'fields', 'methods', 'typeName', 'isInstance'],
  },
  'core.serialization': {
    label: 'core.serialization',
    detail: 'Format-agnostic serialization framework (§4-1)',
    exports: ['Value', 'Serializer', 'Deserializer', 'Serializable', 'Deserializable', 'toValue', 'fromValue'],
  },
  'core.waiting': {
    label: 'core.waiting',
    detail: 'Polling and backoff waiting helpers',
    exports: ['waitFor', 'Backoff', 'ExponentialBackoff'],
  },
  'core.shlex': {
    label: 'core.shlex',
    detail: 'POSIX shell-style lexical splitting and quoting',
    exports: ['split', 'quote', 'join'],
  },
  'io.fs': {
    label: 'io.fs',
    detail: 'Filesystem operations (host capability)',
    exports: ['readText', 'writeText', 'readBytes', 'writeBytes', 'exists', 'mkdir', 'remove', 'listDir', 'stat', 'open', 'linesAsync', 'watch', 'File', 'FileStat'],
  },
  'io.path': {
    label: 'io.path',
    detail: 'Cross-platform path manipulation',
    exports: ['Path', 'join', 'resolve', 'dirname', 'basename', 'extname', 'normalize', 'isAbsolute', 'relative'],
  },
  'io.streams': {
    label: 'io.streams',
    detail: 'Buffered and async byte/text streams',
    exports: ['Reader', 'Writer', 'BufferedReader', 'BufferedWriter', 'ByteStream', 'pipe'],
  },
  'io.proc': {
    label: 'io.proc',
    detail: 'Process execution and environment (host capability)',
    exports: ['exec', 'spawn', 'env', 'args', 'cwd', 'exit', 'pid', 'Command', 'ChildProcess'],
  },
  'net.http': {
    label: 'net.http',
    detail: 'HTTP client and server',
    exports: ['fetch', 'get', 'post', 'Request', 'Response', 'Headers', 'Server', 'serve', 'StatusCode'],
  },
  'net.websocket': {
    label: 'net.websocket',
    detail: 'WebSocket client and server',
    exports: ['WebSocket', 'connect', 'WebSocketServer', 'Message'],
  },
  'net.addressing': {
    label: 'net.addressing',
    detail: 'IP addresses and socket endpoints',
    exports: ['IpAddr', 'Ipv4Addr', 'Ipv6Addr', 'SocketAddr', 'Cidr'],
  },
  'net.tcp': {
    label: 'net.tcp',
    detail: 'TCP sockets and listeners',
    exports: ['TcpStream', 'TcpListener', 'connect', 'bind'],
  },
  'net.tls': {
    label: 'net.tls',
    detail: 'TLS streams and certificate configuration',
    exports: ['TlsStream', 'TlsConfig', 'Certificate', 'wrapClient', 'wrapServer'],
  },
  'net.dns': {
    label: 'net.dns',
    detail: 'DNS resolution',
    exports: ['lookupHost', 'lookupIp', 'resolveTxt', 'resolveMx'],
  },
  'data.json': {
    label: 'data.json',
    detail: 'JSON parsing, serialization, and accessors',
    exports: ['parse', 'stringify', 'getString', 'getInt', 'getFloat', 'getBool', 'getList', 'getDict', 'JsonValue', 'JsonError'],
  },
  'data.csv': {
    label: 'data.csv',
    detail: 'CSV reader and writer',
    exports: ['parse', 'stringify', 'CsvReader', 'CsvWriter'],
  },
  'data.toml': {
    label: 'data.toml',
    detail: 'TOML configuration parsing and serialization',
    exports: ['parse', 'stringify', 'TomlValue'],
  },
  'data.yaml': {
    label: 'data.yaml',
    detail: 'YAML parsing and serialization',
    exports: ['parse', 'stringify', 'YamlValue'],
  },
  'data.xml': {
    label: 'data.xml',
    detail: 'XML DOM and streaming parser',
    exports: ['parse', 'stringify', 'XmlElement', 'XmlNode'],
  },
  'data.ini': {
    label: 'data.ini',
    detail: 'INI configuration file parser',
    exports: ['parse', 'stringify', 'IniDocument'],
  },
  'data.query': {
    label: 'data.query',
    detail: 'Structured data querying and path selectors',
    exports: ['select', 'query', 'QueryPath'],
  },
  'data.msgpack': {
    label: 'data.msgpack',
    detail: 'MessagePack binary serialization',
    exports: ['encode', 'decode', 'pack', 'unpack'],
  },
  'data.cbor': {
    label: 'data.cbor',
    detail: 'CBOR binary serialization (RFC 8949)',
    exports: ['encode', 'decode'],
  },
  'sync.primitives': {
    label: 'sync.primitives',
    detail: 'Synchronization primitives and shared locks',
    exports: ['Mutex', 'RwLock', 'Semaphore', 'Barrier', 'WaitGroup', 'Condvar', 'SharedMutex', 'SharedRwLock', 'SharedQueue'],
  },
  'sync.channels': {
    label: 'sync.channels',
    detail: 'Typed async and cross-thread channels',
    exports: ['Channel', 'bounded', 'unbounded', 'oneshot', 'select', 'Sender', 'Receiver'],
  },
  'structures.collections': {
    label: 'structures.collections',
    detail: 'Specialized data structures',
    exports: ['Deque', 'BTreeMap', 'BTreeSet', 'OrderedMap', 'RingBuffer', 'BitSet', 'LruCache'],
  },
  'structures.priority_queue': {
    label: 'structures.priority_queue',
    detail: 'Binary heap priority queue',
    exports: ['PriorityQueue', 'MinHeap', 'MaxHeap'],
  },
  'ui.web': {
    label: 'ui.web',
    detail: 'Browser reactive UI, signals, and Web Components (@mode(web.*))',
    exports: ['signal', 'derived', 'effect', 'batch', 'View', 'ComponentRegistry', 'mount', 'html'],
  },
  'ui.desktop': {
    label: 'ui.desktop',
    detail: 'Native desktop reactive UI (@mode(host.*))',
    exports: ['signal', 'derived', 'effect', 'batch', 'View', 'Window', 'App', 'runApp', 'DesktopGrant'],
  },
  'debug.runtime': {
    label: 'debug.runtime',
    detail: 'Portals, trace capture, time-travel, and MCP debug server (§2-6)',
    exports: ['DebugRuntime', 'activatePortal', 'deactivatePortal', 'startCaptureServer', 'startMcpServer', 'TraceEvent'],
  },
  'debug.assert': {
    label: 'debug.assert',
    detail: 'Runtime assertions and invariant checks',
    exports: ['assert', 'assertEq', 'assertNe', 'assertThrows', 'unreachable'],
  },
  'debug.profiler': {
    label: 'debug.profiler',
    detail: 'CPU and allocation profiling',
    exports: ['startProfile', 'stopProfile', 'ProfileReport', 'span'],
  },
  'debug.recording': {
    label: 'debug.recording',
    detail: 'Time-travel trace recording and replay',
    exports: ['startRecording', 'stopRecording', 'saveRecording', 'loadRecording', 'Recording'],
  },
  'native.simd': {
    label: 'native.simd',
    detail: 'Hardware vector intrinsics (@mode(host.native) / @mode(freestanding))',
    exports: ['Vec', 'f32x4', 'f64x2', 'i32x4', 'i64x2', 'u8x16', 'splat', 'load', 'store'],
  },
  'native.atomic': {
    label: 'native.atomic',
    detail: 'Hardware atomics and memory fences (@mode(host.native) / @mode(freestanding))',
    exports: ['hwFence', 'compilerFence', 'MemoryOrder', 'compareExchange', 'fetchAdd'],
  },
  'native.mem': {
    label: 'native.mem',
    detail: 'Raw memory operations (@mode(host.native) / @mode(freestanding))',
    exports: ['alloc', 'free', 'copy', 'zero', 'Ptr', 'Volatile', 'MaybeUninit', 'PartialInit'],
  },
  'native.dma': {
    label: 'native.dma',
    detail: 'DMA-safe buffer management (@mode(freestanding), §3-3.20)',
    exports: ['DmaBuffer', 'allocCoherent', 'syncForCpu', 'syncForDevice'],
  },
  'native.mpu': {
    label: 'native.mpu',
    detail: 'Memory Protection Unit configuration (@mode(freestanding), §3-3.20)',
    exports: ['installStackGuard', 'configureRegion', 'MpuRegion'],
  },
  'native.window': {
    label: 'native.window',
    detail: 'OS windowing and input events',
    exports: ['Window', 'WindowOptions', 'EventLoop', 'KeyEvent', 'MouseEvent'],
  },
  'native.audio': {
    label: 'native.audio',
    detail: 'Low-latency native audio streams',
    exports: ['AudioDevice', 'AudioStream', 'AudioFormat'],
  },
  'native.webgpu': {
    label: 'native.webgpu',
    detail: 'WebGPU compute and rendering pipeline',
    exports: ['Adapter', 'Device', 'Queue', 'Buffer', 'ShaderModule', 'ComputePipeline', 'RenderPipeline'],
  },
  'testing': {
    label: 'testing',
    detail: 'Loup testing framework (loup-testing-reference-v1_10)',
    exports: ['test', 'describe', 'it', 'expect', 'assertEqual', 'assertThrows', 'beforeEach', 'afterEach', 'mock', 'spy'],
  },
  'loup.log': {
    label: 'loup.log',
    detail: 'Structured logging package',
    exports: ['Logger', 'info', 'warn', 'error', 'debug', 'trace', 'withFields'],
  },
  'loup.config': {
    label: 'loup.config',
    detail: 'Layered configuration loader',
    exports: ['Config', 'load', 'fromEnv', 'fromFile'],
  },
  'loup.cli': {
    label: 'loup.cli',
    detail: 'Command-line argument parser and subcommands',
    exports: ['App', 'Command', 'Arg', 'Flag', 'parse'],
  },
  'loup.tensor': {
    label: 'loup.tensor',
    detail: 'Multi-dimensional tensor operations and accelerator dispatch',
    exports: ['Tensor', 'zeros', 'ones', 'randn', 'matmul', 'einsum', 'Device'],
  },
  'loup.autodiff': {
    label: 'loup.autodiff',
    detail: 'Reverse- and forward-mode automatic differentiation',
    exports: ['grad', 'valueAndGrad', 'jvp', 'vjp', ' Dual'],
  },
  'loup.tpu': {
    label: 'loup.tpu',
    detail: 'TPU / accelerator compilation and mesh collectives',
    exports: ['TpuDevice', 'Mesh', 'ShardSpec', 'compileKernel', 'allReduce'],
  },
  'loup.crypto': {
    label: 'loup.crypto',
    detail: 'Cryptographic primitives (loup-crypto-packages-v0_1)',
    exports: ['sha256', 'sha512', 'blake3', 'hmac', 'aead', 'ed25519', 'x25519', 'hkdf'],
  },
  'loup.fortran': {
    label: 'loup.fortran',
    detail: 'Fortran & HPC interop (loup-fortran-hpc-packages-v1_0)',
    exports: ['FortranArray', 'ColumnMajor', 'blas', 'lapack', 'fftw', 'mpi'],
  },
  'loup.ui': {
    label: 'loup.ui',
    detail: 'Loup Common UI portable packages (@mode(portable), §2-4)',
    exports: ['Node', 'Layout', 'Style', 'Color', 'Event', 'Widget', 'Painter'],
  },
};

connection.onCompletion((params: TextDocumentPositionParams): CompletionItem[] => {
  const document = documents.get(params.textDocument.uri);
  if (!document) return [];

  const text = document.getText();
  const offset = document.offsetAt(params.position);
  const lineText = text.split('\n')[params.position.line] || '';
  const linePrefix = lineText.slice(0, params.position.character);

  const items: CompletionItem[] = [];

  // Check if we're in an @mode or annotation context
  if (linePrefix.trimStart().startsWith('@')) {
    for (const m of LOUP_MODES) {
      items.push({
        label: m.label,
        kind: CompletionItemKind.Keyword,
        detail: m.detail,
        documentation: m.doc,
        insertText: m.label.slice(1), // strip leading @ since user typed @
      });
    }
    const annotations = [
      { label: 'jsexport', detail: 'Export function to JS host' },
      { label: 'unsafe("reason")', detail: 'Mark declaration as unsafe with mandatory reason' },
      { label: 'compiled', detail: 'Legacy compiled directive (use @mode)' },
      { label: 'inline', detail: 'Hint inlining to compiler' },
      { label: 'repr(C)', detail: 'C ABI struct layout (@mode(freestanding) / FFI)' },
      { label: 'repr(packed)', detail: 'Packed struct layout' },
      { label: 'entry', detail: 'Bare-metal entry point (@mode(freestanding))' },
      { label: 'panic_handler', detail: 'Bare-metal panic handler (@mode(freestanding))' },
      { label: 'interrupt', detail: 'Hardware interrupt handler (@mode(freestanding))' },
      { label: 'interruptSafe', detail: 'Callable from interrupt context (§3-3.24)' },
      { label: 'allocator', detail: 'Register custom heap allocator (@mode(freestanding))' },
      { label: 'deallocator', detail: 'Register custom heap deallocator (@mode(freestanding))' },
      { label: 'scheduler', detail: 'Register custom scheduler for for concurrent (@mode(freestanding), §3-3.16a)' },
      { label: 'vectorize', detail: 'SIMD vectorization hint (@mode(host.native))' },
      { label: 'signalSafe', detail: 'Signal-safe function verification' },
      { label: 'webcomponent("tag-name")', detail: 'Register class as Custom Element (@mode(web.*))' },
      { label: 'polymorphic', detail: 'Enable polymorphic serialization (§4-1)' },
      { label: 'tagged("field")', detail: 'Discriminator tag for polymorphic serialization' },
      { label: 'serialField("name")', detail: 'Custom serialized field name' },
      { label: 'sensitive', detail: 'Redact field in Debug/logs' },
      { label: 'total', detail: 'Verify function is total — no panic, throw, or divergence (§1-8.12)' },
      { label: 'complete', detail: 'Verify match/enum handling has no wildcard fallback (§1-8.12)' },
      { label: 'must_resolve', detail: 'Require Result/Option return value to be explicitly handled (§1-8.12)' },
      { label: 'noderef', detail: 'Pointer/address value that must not be dereferenced directly (§1-8.12)' },
      { label: 'strategy(threadPool)', detail: 'Execution strategy for for concurrent (§2-1.11)' },
      { label: 'assume(ivdep)', detail: 'Loop independence assumption for for concurrent (§2-1.11)' },
      { label: 'domain', detail: 'Declare execution domain constraint' },
      { label: 'interchange', detail: 'Declarative binary/text record layout (§4-2)' },
      { label: 'field', detail: 'Field descriptor inside @interchange struct (§4-2)' },
    ];
    for (const a of annotations) {
      items.push({
        label: `@${a.label}`,
        kind: CompletionItemKind.Property,
        detail: a.detail,
        insertText: a.label,
      });
    }
    return items;
  }

  // Check if we're in a `from <module>` context
  const fromMatch = linePrefix.match(/\bfrom\s+([a-zA-Z0-9_.]*)$/);
  if (fromMatch) {
    for (const mod of Object.values(STDLIB_MODULES)) {
      items.push({
        label: mod.label,
        kind: CompletionItemKind.Module,
        detail: mod.detail,
      });
    }
    return items;
  }

  // Check if we're in an `import (...)` context after `from <module> import (`
  const importMatch = linePrefix.match(/\bfrom\s+([a-zA-Z0-9_.]+)\s+(?:defer\s+)?import\s*\([^)]*$/);
  if (importMatch) {
    const modName = importMatch[1];
    const mod = STDLIB_MODULES[modName];
    if (mod) {
      for (const exp of mod.exports) {
        items.push({
          label: exp.trim(),
          kind: CompletionItemKind.Function,
          detail: `from ${modName}`,
        });
      }
      return items;
    }
  }

  // Check if completing after `<namespace>.` (e.g., `core.`, `io.`, `net.`, `data.`, `loup.`)
  const nsDotMatch = linePrefix.match(/\b(core|io|net|data|sync|structures|ui|debug|native|loup)\.\s*([a-zA-Z0-9_]*)$/);
  if (nsDotMatch) {
    const prefix = `${nsDotMatch[1]}.`;
    for (const [key, mod] of Object.entries(STDLIB_MODULES)) {
      if (key.startsWith(prefix)) {
        const subName = key.slice(prefix.length);
        items.push({
          label: subName,
          kind: CompletionItemKind.Module,
          detail: mod.detail,
        });
      }
    }
  }

  // Check if completing after `<module>.` (e.g., `core.text.`)
  for (const [modName, mod] of Object.entries(STDLIB_MODULES)) {
    const escaped = modName.replace('.', '\\.');
    if (new RegExp(`\\b${escaped}\\.\\s*$`).test(linePrefix)) {
      for (const exp of mod.exports) {
        items.push({
          label: exp.trim(),
          kind: CompletionItemKind.Function,
          detail: `${modName}.${exp.trim()}`,
        });
      }
      return items;
    }
  }

  // Check if completing after `runtime.`
  if (/\bruntime\.\s*$/.test(linePrefix)) {
    const runtimeMethods = [
      { name: 'fs', detail: 'func fs(): FileSystem — Host filesystem access' },
      { name: 'proc', detail: 'func proc(): Process — Host process & env access' },
      { name: 'net', detail: 'func net(): Network — Host network access' },
      { name: 'ui', detail: 'func ui(): UiRuntime — Reactive UI runtime' },
      { name: 'debug', detail: 'func debug(): DebugRuntime — Debug & portal runtime' },
      { name: 'compile', detail: 'func compile(source: string): Module — Dynamic JIT compilation' },
      { name: 'configure', detail: 'func configure(opts: RuntimeOptions): void — Executor configuration' },
      { name: 'args', detail: 'func args(): list[string] — Command-line arguments (§2-5.1)' },
    ];
    for (const m of runtimeMethods) {
      items.push({
        label: m.name,
        kind: CompletionItemKind.Method,
        detail: m.detail,
      });
    }
    return items;
  }

  // Document symbols in scope
  const symbols = symbolCache.get(params.textDocument.uri) || [];
  for (const sym of symbols) {
    items.push({
      label: sym.name,
      kind: symbolKindToCompletionKind(sym.kind),
      detail: sym.type || sym.kind,
    });
  }

  // Keywords
  for (const kw of LOUP_KEYWORDS) {
    items.push({
      label: kw,
      kind: CompletionItemKind.Keyword,
    });
  }

  // Built-in types
  for (const t of LOUP_TYPES) {
    items.push({
      label: t,
      kind: CompletionItemKind.TypeParameter,
    });
  }

  // Stdlib modules
  for (const mod of Object.values(STDLIB_MODULES)) {
    items.push({
      label: mod.label,
      kind: CompletionItemKind.Module,
      detail: mod.detail,
    });
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
      return CompletionItemKind.Function;
    case SymbolKind.Class:
      return CompletionItemKind.Class;
    case SymbolKind.Struct:
      return CompletionItemKind.Struct;
    case SymbolKind.Enum:
      return CompletionItemKind.Enum;
    case SymbolKind.EnumVariant:
      return CompletionItemKind.EnumMember;
    case SymbolKind.Interface:
      return CompletionItemKind.Interface;
    case SymbolKind.TypeAlias:
      return CompletionItemKind.TypeParameter;
    case SymbolKind.Macro:
      return CompletionItemKind.Keyword;
    case SymbolKind.Variable:
    case SymbolKind.ExternValue:
      return CompletionItemKind.Variable;
    case SymbolKind.Parameter:
      return CompletionItemKind.Variable;
    case SymbolKind.Field:
      return CompletionItemKind.Field;
    case SymbolKind.Operator:
      return CompletionItemKind.Operator;
    case SymbolKind.Portal:
      return CompletionItemKind.Event;
    case SymbolKind.Import:
      return CompletionItemKind.Reference;
  }
}

// ---- Hover ----

const KEYWORD_DOCS: Record<string, string> = {
  portal: '**`portal`** — Named diagnostic and debug observation point (§2-6).\n\nZero cost when inactive; can be activated at runtime or in the debugger with optional conditions.',
  defer: '**`defer`** — Schedules a call or block to execute when the enclosing scope exits (§1-6.5).',
  with: '**`with`** — Scoped resource management (`Scoped[T]` / `AsyncScoped[T]`, §1-6.6). Automatically closes the resource on scope exit.',
  spawn: '**`spawn`** — Starts a concurrent child task inside an `await group` block (§2-1.2).',
  concurrent: '**`for concurrent`** — Structured parallel iteration over a range or array (§2-1.11). Supports `@strategy(threadPool)` and `@strategy(accelerator)`.',
  match: '**`match`** — Exhaustive pattern matching expression (§1-5.5).',
  attempt: '**`attempt`** — Unwraps `Ok(v)` from a `Result[T, E]` or branches to the enclosing `try ... catch Err` arm (§1-5.10).',
  unreachable: '**`unreachable`** — Expression of type `noreturn` asserting that control flow can never reach this point (§1-5.11). Panics in all build profiles if reached.',
  noreturn: '**`noreturn`** — Return-type marker for functions that never return normally (§1-4.4a).',
  impossible: '**`impossible`** — Uninhabited type with no values, legal in enum payload type arguments such as `Result[T, impossible]` (§1-4.4b).',
  const: '**`const`** — Compile-time constant binding (`const N = ...`), compile-time evaluable function (`const func`), or compile-time conditional (`if const (...)`) (§1-6.2, §1-6.3, §1-7.1).',
  dynamic: '**`dynamic`** — Declares a dynamic class supporting `!{field}` access, or opens a `dynamic obj as alias` view block.',
  extern: '**`extern`** — Foreign Function Interface declaration (`extern js` or `extern native "lib"`).',
  box: '**`box`** — Explicitly widens a value type to `Any` (§1-4.3). Prohibited in `@mode(freestanding)`.',
  gen: '**`gen`** — Declares a generator function (`gen func` or `async gen func`) that yields values lazily via `yield`.',
  yield: '**`yield`** — Produces a value from a generator function (`yield expr;`) or delegates to another generator (`yield* iterable;`).',
  macro: '**`macro`** — Declares a hygienic compile-time AST macro using `quote { ... }` (§1-17).',
  struct: '**`struct`** — Declares a stack-allocated value type with copy semantics (§1-8).',
  type: '**`type`** — Declares a type alias (`type Name[T] = TargetType;`, §1-4.6).',
  del: '**`del`** — Deletes a key/slice from a mutable collection (`del dict[key];`).',
  borrow: '**`borrow`** — Non-owning parameter or field reference (§3-2.4.1). Use `excl borrow` for exclusive mutable access.',
  unique: '**`unique`** — Single-owner binding (`unique let`/`unique var`) or class (`unique class`) with zero ARC overhead (§1-8.11, §3-2.4.7).',
  onstack: '**`onstack`** — Guarantees local aggregate storage is materialized in the stack frame (`@mode(freestanding)`, §3-3.17c).',
  consume: '**`consume`** — Explicitly transfers a `unique` binding into an ARC-managed reference (`@mode(host.native)` / `@mode(host.dual)`, §3-2.4.7).',
  lifetime: '**`lifetime`** — Declares a named lifetime region parameter (`[lifetime ~a]`, §3-2.4.2).',
  noescape: '**`noescape`** — Guarantees a closure parameter does not escape the call (`noescape fn(...)`, §3-2.4.3).',
  reads: '**`reads`** — Ownership verb: function inspects the parameter without mutating or retaining it (default, §3-2.4.9).',
  edits: '**`edits`** — Ownership verb: function mutates the parameter in place (§3-2.4.9).',
  takes: '**`takes`** — Ownership verb: function consumes ownership of the parameter (§3-2.4.9).',
  shares: '**`shares`** — Ownership verb: function retains a shared reference to the parameter (§3-2.4.9).',
  modifier: '**`modifier`** — Marks a class method that mutates `var` fields on `this` (§3-2.4.11).',
  safe: '**`safe`** — Introduces a compile-time verified safe ownership context (`safe {}` or `safe func`, §3-2.4.12).',
  synchronized: '**`synchronized`** — Equips a class with a mutex serializing all `modifier` methods (§3-2.4.13).',
  unsafe: '**`unsafe`** — Programmer-audited unsafe block (`unsafe("reason") { ... }`, §3-2.4.6).',
  requires: '**`requires`** — Function contract precondition clause (`requires distinct(a, b)`, §3-2.4.10).',
  atomic: '**`atomic`** — Cooperative atomicity block verified to contain no suspension points (`await`, `spawn`) (§2-1.7).',
  volatile: '**`volatile`** — Hardware register / memory-mapped access qualifier (`@mode(host.native)` / `@mode(freestanding)`, §3-3.8).',
  portable: '**`@mode(portable)`** — Portable library mode (§1-2.4.7). Checked against the PORTABLE-SUBSET and compiled in each importing unit\'s mode.',
  complex: '**`complex`** — 128-bit complex floating-point primitive (`complex64`, pair of `float64` real/imaginary parts, §1-4.1.6). Also `complex32` (pair of `float32`).',
  fixed: '**`fixed`** — Signed 64-bit Q32.32 fixed-point primitive type.',
  array: '**`array[T, rank]`** — Rank-typed N-dimensional dense array type (§1-4.10, `core.array`).',
  reinterpretChecked: '**`reinterpretChecked[T, U](expr)`** — Safe bit-cast with runtime alignment check returning `Result[U, AlignmentError]` (§3-3.18).',
};

connection.onHover((params: TextDocumentPositionParams): Hover | null => {
  const document = documents.get(params.textDocument.uri);
  if (!document) return null;

  const text = document.getText();
  const offset = document.offsetAt(params.position);
  const word = getWordAtOffset(text, offset);
  if (!word) return null;

  // Check keyword docs
  if (word in KEYWORD_DOCS) {
    return {
      contents: {
        kind: MarkupKind.Markdown,
        value: KEYWORD_DOCS[word],
      },
    };
  }

  // Check symbols in the current document
  const symTable = scopeCache.get(params.textDocument.uri);
  if (symTable) {
    const sym = symTable.findSymbol(word);
    if (sym) {
      const codeBlock = sym.type
        ? `\`\`\`loup\n${sym.name}: ${sym.type}\n\`\`\``
        : `\`\`\`loup\n(${sym.kind}) ${sym.name}\n\`\`\``;
      return {
        contents: {
          kind: MarkupKind.Markdown,
          value: codeBlock,
        },
      };
    }
  }

  // Check stdlib modules
  for (const [modName, mod] of Object.entries(STDLIB_MODULES)) {
    if (mod.exports.map(e => e.trim()).includes(word)) {
      return {
        contents: {
          kind: MarkupKind.Markdown,
          value: `\`\`\`loup\nfrom ${modName} import (${word})\n\`\`\`\n${mod.detail}`,
        },
      };
    }
  }

  return null;
});

// ---- Document Symbols (Outline) ----

connection.onDocumentSymbol((params: DocumentSymbolParams): DocumentSymbol[] => {
  const symbols = symbolCache.get(params.textDocument.uri) || [];
  return symbols.map(sym => symbolInfoToDocumentSymbol(sym));
});

function symbolInfoToDocumentSymbol(sym: SymbolInfo): DocumentSymbol {
  return {
    name: sym.name,
    detail: sym.type,
    kind: symbolKindToLspKind(sym.kind),
    range: {
      start: { line: sym.range.start.line, character: sym.range.start.column },
      end: { line: sym.range.end.line, character: sym.range.end.column },
    },
    selectionRange: {
      start: { line: sym.selectionRange.start.line, character: sym.selectionRange.start.column },
      end: { line: sym.selectionRange.end.line, character: sym.selectionRange.end.column },
    },
    children: sym.children?.map(c => symbolInfoToDocumentSymbol(c)),
  };
}

function symbolKindToLspKind(kind: SymbolKind): LspSymbolKind {
  switch (kind) {
    case SymbolKind.Function:
    case SymbolKind.AsyncFunction:
    case SymbolKind.GenFunction:
    case SymbolKind.AsyncGenFunction:
    case SymbolKind.ExternFunction:
      return LspSymbolKind.Function;
    case SymbolKind.Class:
      return LspSymbolKind.Class;
    case SymbolKind.Struct:
      return LspSymbolKind.Struct;
    case SymbolKind.Enum:
      return LspSymbolKind.Enum;
    case SymbolKind.EnumVariant:
      return LspSymbolKind.EnumMember;
    case SymbolKind.Interface:
      return LspSymbolKind.Interface;
    case SymbolKind.TypeAlias:
      return LspSymbolKind.TypeParameter;
    case SymbolKind.Macro:
      return LspSymbolKind.Function;
    case SymbolKind.Variable:
    case SymbolKind.ExternValue:
      return LspSymbolKind.Variable;
    case SymbolKind.Parameter:
      return LspSymbolKind.Variable;
    case SymbolKind.Field:
      return LspSymbolKind.Field;
    case SymbolKind.Operator:
      return LspSymbolKind.Operator;
    case SymbolKind.Portal:
      return LspSymbolKind.Event;
    case SymbolKind.Import:
      return LspSymbolKind.Package;
  }
}

// ---- Go to Definition ----

connection.onDefinition((params: DefinitionParams): Location | null => {
  const document = documents.get(params.textDocument.uri);
  if (!document) return null;

  const text = document.getText();
  const offset = document.offsetAt(params.position);
  const word = getWordAtOffset(text, offset);
  if (!word) return null;

  const symTable = scopeCache.get(params.textDocument.uri);
  if (!symTable) return null;

  // Search for symbol (also check portal: prefix)
  const sym = symTable.findSymbol(word) || symTable.findSymbol(`portal:${word}`);
  if (!sym) return null;

  return {
    uri: params.textDocument.uri,
    range: {
      start: { line: sym.range.start.line, character: sym.range.start.column },
      end: { line: sym.range.end.line, character: sym.range.end.column },
    },
  };
});

// ---- Folding Ranges ----

connection.onFoldingRanges((params: FoldingRangeParams): FoldingRange[] => {
  const document = documents.get(params.textDocument.uri);
  if (!document) return [];

  const ranges: FoldingRange[] = [];
  const text = document.getText();
  const lines = text.split('\n');

  // Brace-based folding, template fences, multiline strings, block comments
  const stack: { line: number; kind?: FoldingRangeKind }[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Block comment start
    if (line.startsWith('/*') && !line.includes('*/')) {
      stack.push({ line: i, kind: FoldingRangeKind.Comment });
      continue;
    }
    if (line.includes('*/') && stack.length > 0 && stack[stack.length - 1].kind === FoldingRangeKind.Comment) {
      const start = stack.pop()!;
      ranges.push({ startLine: start.line, endLine: i, kind: FoldingRangeKind.Comment });
      continue;
    }

    // Template fence
    if (line.startsWith('```') && stack.length > 0 && stack[stack.length - 1].kind === FoldingRangeKind.Region) {
      const start = stack.pop()!;
      ranges.push({ startLine: start.line, endLine: i, kind: FoldingRangeKind.Region });
      continue;
    }
    if (line.startsWith('```')) {
      stack.push({ line: i, kind: FoldingRangeKind.Region });
      continue;
    }

    // Multiline strings
    if ((line.includes('"""') || line.includes("'''"))) {
      if (stack.length > 0 && stack[stack.length - 1].kind === FoldingRangeKind.Region) {
        const start = stack.pop()!;
        ranges.push({ startLine: start.line, endLine: i, kind: FoldingRangeKind.Region });
      } else {
        stack.push({ line: i, kind: FoldingRangeKind.Region });
      }
      continue;
    }

    // Braces
    for (const ch of line) {
      if (ch === '{') {
        stack.push({ line: i });
      } else if (ch === '}' && stack.length > 0) {
        const start = stack.pop()!;
        if (i > start.line) {
          ranges.push({ startLine: start.line, endLine: i, kind: start.kind });
        }
      }
    }
  }

  return ranges;
});

// ---- Helpers ----

function getWordAtOffset(text: string, offset: number): string | null {
  let start = offset;
  let end = offset;

  while (start > 0 && /[a-zA-Z0-9_]/.test(text[start - 1])) {
    start--;
  }
  while (end < text.length && /[a-zA-Z0-9_]/.test(text[end])) {
    end++;
  }

  const word = text.slice(start, end);
  return word.length > 0 ? word : null;
}

// ============================================================================
// P4 Providers: Semantic Tokens, Formatting, Code Actions, Signature Help,
//               Workspace Symbols
// ============================================================================

// ---- Semantic Tokens ----

const tokenTypeMap = new Map<string, number>();
tokenTypes.forEach((t, i) => tokenTypeMap.set(t, i));

const tokenModMap = new Map<string, number>();
tokenModifiers.forEach((m, i) => tokenModMap.set(m, 1 << i));

connection.languages.semanticTokens.on((params: SemanticTokensParams): SemanticTokens => {
  const document = documents.get(params.textDocument.uri);
  if (!document) return { data: [] };

  const text = document.getText();
  const lexer = new Lexer(text);
  const tokens = lexer.tokenize();
  const builder = new SemanticTokensBuilder();

  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i];
    if (tok.kind === TokenKind.EOF) continue;
    // Skip multi-line tokens (template fences, multiline strings, block comments)
    if (tok.text.includes('\n')) continue;

    let typeIdx: number | undefined;
    let modBits = 0;

    switch (tok.kind) {
      // Comments
      case TokenKind.LineComment:
      case TokenKind.BlockComment:
        typeIdx = tokenTypeMap.get('comment');
        break;
      case TokenKind.DocComment:
        typeIdx = tokenTypeMap.get('comment');
        modBits |= tokenModMap.get('documentation') || 0;
        break;

      // Strings
      case TokenKind.StringLiteral:
      case TokenKind.CharLiteral:
      case TokenKind.InterpolatedStringLiteral:
      case TokenKind.RawStringLiteral:
      case TokenKind.BytesLiteral:
        typeIdx = tokenTypeMap.get('string');
        break;

      // Numbers
      case TokenKind.IntLiteral:
      case TokenKind.FloatLiteral:
        typeIdx = tokenTypeMap.get('number');
        break;

      // Annotations: @jsexport, @unsafe, @mode, etc.
      case TokenKind.At: {
        typeIdx = tokenTypeMap.get('decorator');
        if (tokens[i + 1]?.kind === TokenKind.Identifier) {
          builder.push(tok.line, tok.column, tok.length + tokens[i + 1].length, typeIdx!, 0);
          i++; // skip annotation name
          continue;
        }
        break;
      }

      // Portal keyword + name
      case TokenKind.Portal:
        typeIdx = tokenTypeMap.get('keyword');
        break;

      // Async modifier
      case TokenKind.Async:
        typeIdx = tokenTypeMap.get('keyword');
        modBits |= tokenModMap.get('async') || 0;
        break;

      // Static / pub modifiers
      case TokenKind.Static:
        typeIdx = tokenTypeMap.get('keyword');
        modBits |= tokenModMap.get('static') || 0;
        break;

      // Declaration keywords
      case TokenKind.Let:
      case TokenKind.Const:
        typeIdx = tokenTypeMap.get('keyword');
        modBits |= tokenModMap.get('readonly') || 0;
        break;

      case TokenKind.Var:
        typeIdx = tokenTypeMap.get('keyword');
        modBits |= tokenModMap.get('modification') || 0;
        break;

      // Type identifiers
      case TokenKind.TypeIdentifier:
        if (LOUP_TYPES.includes(tok.text)) {
          typeIdx = tokenTypeMap.get('type');
          modBits |= tokenModMap.get('defaultLibrary') || 0;
        } else if (tokens[i - 1]?.kind === TokenKind.Class) {
          typeIdx = tokenTypeMap.get('class');
          modBits |= tokenModMap.get('declaration') || 0;
        } else if (tokens[i - 1]?.kind === TokenKind.Struct) {
          typeIdx = tokenTypeMap.get('struct');
          modBits |= tokenModMap.get('declaration') || 0;
        } else if (tokens[i - 1]?.kind === TokenKind.Enum) {
          typeIdx = tokenTypeMap.get('enum');
          modBits |= tokenModMap.get('declaration') || 0;
        } else if (tokens[i - 1]?.kind === TokenKind.Interface) {
          typeIdx = tokenTypeMap.get('interface');
          modBits |= tokenModMap.get('declaration') || 0;
        } else if (tokens[i - 1]?.kind === TokenKind.Type) {
          typeIdx = tokenTypeMap.get('type');
          modBits |= tokenModMap.get('declaration') || 0;
        } else {
          typeIdx = tokenTypeMap.get('type');
        }
        break;

      // Regular identifiers — classify by context
      case TokenKind.Identifier:
        if (LOUP_TYPES.includes(tok.text)) {
          typeIdx = tokenTypeMap.get('type');
          modBits |= tokenModMap.get('defaultLibrary') || 0;
        } else if (tokens[i - 1]?.kind === TokenKind.Fun) {
          typeIdx = tokenTypeMap.get('function');
          modBits |= tokenModMap.get('declaration') || 0;
        } else if (tokens[i - 1]?.kind === TokenKind.Macro) {
          typeIdx = tokenTypeMap.get('macro');
          modBits |= tokenModMap.get('declaration') || 0;
        } else if (tokens[i + 1]?.kind === TokenKind.Bang && tokens[i + 2]?.kind === TokenKind.LeftParen) {
          typeIdx = tokenTypeMap.get('macro');
        } else if (tokens[i + 1]?.kind === TokenKind.LeftParen) {
          typeIdx = tokenTypeMap.get('function');
        } else if (tokens[i - 1]?.kind === TokenKind.Dot || tokens[i - 1]?.kind === TokenKind.QuestionDot) {
          typeIdx = tokens[i + 1]?.kind === TokenKind.LeftParen
            ? tokenTypeMap.get('method')
            : tokenTypeMap.get('property');
        } else if (tokens[i - 1]?.kind === TokenKind.Let || tokens[i - 1]?.kind === TokenKind.Const) {
          typeIdx = tokenTypeMap.get('variable');
          modBits |= (tokenModMap.get('declaration') || 0) | (tokenModMap.get('readonly') || 0);
        } else if (tokens[i - 1]?.kind === TokenKind.Var) {
          typeIdx = tokenTypeMap.get('variable');
          modBits |= (tokenModMap.get('declaration') || 0) | (tokenModMap.get('modification') || 0);
        }
        break;

      default:
        // All other keywords
        if (LOUP_KEYWORDS.includes(tok.text)) {
          typeIdx = tokenTypeMap.get('keyword');
        }
        break;
    }

    if (typeIdx !== undefined) {
      builder.push(tok.line, tok.column, tok.length, typeIdx, modBits);
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
  const indentUnit = params.options.insertSpaces
    ? ' '.repeat(params.options.tabSize || 2)
    : '\t';

  let indentLevel = 0;
  let inTemplateFence = false;
  let inMultilineString = false;
  const formattedLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const trimmed = raw.trim();

    // Preserve empty lines as empty
    if (trimmed.length === 0) {
      formattedLines.push('');
      continue;
    }

    // Track template fences & multiline strings — preserve inner indentation
    if (trimmed.startsWith('```')) {
      if (inTemplateFence) {
        inTemplateFence = false;
        indentLevel = Math.max(0, indentLevel - 1);
        formattedLines.push(indentUnit.repeat(indentLevel) + trimmed);
        continue;
      } else {
        formattedLines.push(indentUnit.repeat(indentLevel) + trimmed);
        inTemplateFence = true;
        indentLevel++;
        continue;
      }
    }

    if (inTemplateFence || inMultilineString) {
      if (trimmed.startsWith('"""') || trimmed.startsWith("'''")) {
        inMultilineString = false;
        indentLevel = Math.max(0, indentLevel - 1);
        formattedLines.push(indentUnit.repeat(indentLevel) + trimmed);
        continue;
      }
      formattedLines.push(raw); // Keep original indentation inside fences/MLS
      continue;
    }

    if ((trimmed.includes('"""') || trimmed.includes("'''")) && !trimmed.endsWith('"""') && !trimmed.endsWith("'''")) {
      formattedLines.push(indentUnit.repeat(indentLevel) + trimmed);
      inMultilineString = true;
      indentLevel++;
      continue;
    }

    // Decrease indent before closing brackets
    if (/^[}\])]/.test(trimmed)) {
      indentLevel = Math.max(0, indentLevel - 1);
    }

    formattedLines.push(indentUnit.repeat(indentLevel) + trimmed);

    // Increase indent after opening brackets at end of line (ignoring # comments)
    const withoutComment = trimmed.replace(/#.*$/, '').trim();
    if (/[{[(]\s*$/.test(withoutComment)) {
      indentLevel++;
    }
  }

  const formatted = formattedLines.join('\n');
  if (formatted === text) return [];

  return [
    TextEdit.replace(
      {
        start: { line: 0, character: 0 },
        end: { line: lines.length, character: 0 },
      },
      formatted
    ),
  ];
});

// ---- Code Actions (Quick Fixes) ----

connection.onCodeAction((params: CodeActionParams): CodeAction[] => {
  const document = documents.get(params.textDocument.uri);
  if (!document) return [];

  const actions: CodeAction[] = [];
  const text = document.getText();
  const uri = params.textDocument.uri;

  // Check diagnostics at current range
  for (const diag of params.context.diagnostics) {
    // Quick fix: auto-import stdlib function
    const word = getWordAtOffset(text, document.offsetAt(diag.range.start));
    if (word) {
      for (const [modName, mod] of Object.entries(STDLIB_MODULES)) {
        if (mod.exports.map(e => e.trim()).includes(word)) {
          if (!text.includes(`from ${modName}`)) {
            actions.push({
              title: `Import '${word}' from ${modName}`,
              kind: CodeActionKind.QuickFix,
              diagnostics: [diag],
              edit: {
                changes: {
                  [uri]: [
                    TextEdit.insert(
                      { line: 0, character: 0 },
                      `from ${modName} import (${word});\n`
                    ),
                  ],
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
              newText: '\n  _ => { # TODO }',
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

function findSymbolByName(symbols: SymbolInfo[], name: string): SymbolInfo | undefined {
  for (const sym of symbols) {
    if (sym.name === name) return sym;
    if (sym.children) {
      const found = findSymbolByName(sym.children, name);
      if (found) return found;
    }
  }
  return undefined;
}

// ---- Workspace Symbols ----

connection.onWorkspaceSymbol((_params: WorkspaceSymbolParams): WorkspaceSymbol[] => {
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
