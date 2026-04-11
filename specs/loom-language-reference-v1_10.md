# Loom Language Reference v1.10

**Status:** Release
**Version:** 1.10.0
**Date:** 2026-04-09
**Supersedes:** 1.9.0
**Scope:** Core language — syntax, semantics, type system, concurrency, FFI,
  template fences, reactive UI, compiled mode, native compilation, macros,
  failure policy, formal grammar, and tooling.

**Related documents:**
- [Loom Standard Library Reference v1.10](loom-stdlib-reference-v1_10.md)
- [Loom Packages Reference v1.10](loom-packages-reference-v1_10.md)

---

## Table of Contents

- [§1 Design Goals (non-normative)](#1-design-goals)
- [§2 Execution Model](#2-execution-model)
  - [§2.1 Scripted Mode (JIT)](#21-scripted-mode-jit)
  - [§2.2 Module Introspection Dunders](#22-module-introspection-dunders)
  - [§2.3 Origination Introspection Dunders](#23-origination-introspection-dunders)
- [§3 Lexical Structure](#3-lexical-structure)
  - [§3.1 Source Encoding](#31-source-encoding)
  - [§3.2 Comments](#32-comments)
  - [§3.3 Keywords and Reserved Words](#33-keywords-and-reserved-words)
  - [§3.4 Identifiers](#34-identifiers)
  - [§3.5 Literals](#35-literals)
  - [§3.6 Operators](#36-operators)
  - [§3.7 Collection Literals](#37-collection-literals)
- [§4 Types and Type System](#4-types-and-type-system)
  - [§4.1 Primitive Types](#41-primitive-types)
    - [§4.1.1 Fixed-Width Integer Overflow](#411-fixed-width-integer-overflow)
    - [§4.1.2 Numeric Conversions](#412-numeric-conversions)
    - [§4.1.3 `bigint` — Arbitrary-Precision Integer](#413-bigint--arbitrary-precision-integer)
    - [§4.1.4 `decimal` — Arbitrary-Precision Decimal](#414-decimal--arbitrary-precision-decimal)
    - [§4.1.5 `char` — Unicode Scalar Value](#415-char--unicode-scalar-value)
  - [§4.2 Box Types](#42-box-types)
  - [§4.3 `Any`](#43-any)
  - [§4.4 Function Types](#44-function-types)
  - [§4.5 Union Types](#45-union-types)
  - [§4.6 Type Aliases](#46-type-aliases)
  - [§4.7 `typeof` and `instanceof` Operators](#47-typeof-and-instanceof-operators)
  - [§4.8 Generics](#48-generics)
  - [§4.9 Tuple Type Details](#49-tuple-type-details)
- [§5 Expressions](#5-expressions)
  - [§5.1 Operator Semantics](#51-operator-semantics)
  - [§5.2 Comprehensions](#52-comprehensions)
  - [§5.3 Slicing](#53-slicing)
  - [§5.4 Ternary Expression](#54-ternary-expression)
  - [§5.5 Null-Safe Indexing](#55-null-safe-indexing)
  - [§5.6 Optionality Sugar](#56-optionality-sugar)
  - [§5.7 `?` Propagation Operator](#57--propagation-operator)
  - [§5.8 Spread Operators](#58-spread-operators)
- [§6 Statements and Control Flow](#6-statements-and-control-flow)
  - [§6.1 Blocks and Scope](#61-blocks-and-scope)
  - [§6.2 Variable Declarations](#62-variable-declarations)
  - [§6.3 Conditionals](#63-conditionals)
  - [§6.4 Loops](#64-loops)
  - [§6.5 Defer](#65-defer)
  - [§6.6 `with` (Scoped Resources)](#66-with-scoped-resources)
  - [§6.7 Portal Statement](#67-portal-statement)
  - [§6.8 Destructuring](#68-destructuring)
  - [§6.9 `try`/`catch`/`finally`](#69-trycatchfinally)
  - [§6.10 Exception Chaining](#610-exception-chaining)
  - [§6.11 `del` Statement](#611-del-statement)
- [§7 Functions and Closures](#7-functions-and-closures)
  - [§7.1 Function Declarations](#71-function-declarations)
  - [§7.2 Lambdas](#72-lambdas)
  - [§7.3 Closures](#73-closures)
  - [§7.4 Rest Parameters and Keyword-Only Parameters](#74-rest-parameters-and-keyword-only-parameters)
  - [§7.5 Generators and `yield`](#75-generators-and-yield)
  - [§7.6 Decorators](#76-decorators)
  - [§7.7 Property Getters and Setters](#77-property-getters-and-setters)
- [§8 Classes and Objects](#8-classes-and-objects)
  - [§8.1 Class Declarations](#81-class-declarations)
  - [§8.2 Visibility](#82-visibility)
  - [§8.3 Inheritance](#83-inheritance)
  - [§8.4 Constructors, `this`, and `Self`](#84-constructors-this-and-self)
  - [§8.5 Static Members](#85-static-members)
  - [§8.6 Instance Fields](#86-instance-fields)
  - [§8.7 Dynamic Objects](#87-dynamic-objects)
  - [§8.8 Annotations](#88-annotations)
  - [§8.9 Finalization](#89-finalization)
  - [§8.10 Generic Classes](#810-generic-classes)
- [§9 Enums and Pattern Matching](#9-enums-and-pattern-matching)
  - [§9.1 Enum Declarations](#91-enum-declarations)
  - [§9.2 Enum/`Any` Boundary](#92-enumany-boundary)
  - [§9.3 Built-in Enums](#93-built-in-enums)
  - [§9.4 `match` Expression](#94-match-expression)
  - [§9.5 Union Type Matching](#95-union-type-matching)
- [§10 Structs](#10-structs)
  - [§10.1 Auto-Generated Constructors](#101-auto-generated-constructors)
  - [§10.2 Immutability and Mutability](#102-immutability-and-mutability)
  - [§10.3 Value Semantics](#103-value-semantics)
  - [§10.4 Relationship to `Any`](#104-relationship-to-any)
  - [§10.5 Methods](#105-methods)
  - [§10.6 Generic Structs](#106-generic-structs)
  - [§10.7 `with` Copy Expression](#107-with-copy-expression)
  - [§10.8 Struct Destructuring](#108-struct-destructuring)
  - [§10.9 Compiled Mode](#109-compiled-mode)
  - [§10.10 Relationship to Other Types](#1010-relationship-to-other-types)
  - [§10.11 Lifetime-Parameterized Structs](#1011-lifetime-parameterized-structs)
- [§11 Interfaces](#11-interfaces)
  - [§11.1 Interface Declarations](#111-interface-declarations)
  - [§11.2 Standard Interfaces](#112-standard-interfaces)
  - [§11.3 Iteration Protocol](#113-iteration-protocol)
  - [§11.4 Lifetime-Parameterized Interfaces](#114-lifetime-parameterized-interfaces)
- [§12 Generics](#12-generics)
  - [§12.1 Lifetime Parameters in Generics](#121-lifetime-parameters-in-generics)
- [§13 Modules and Imports](#13-modules-and-imports)
  - [§13.1 Import Syntax](#131-import-syntax)
  - [§13.2 Re-Exports](#132-re-exports)
  - [§13.3 Package Manifest (`.lmpkg`)](#133-package-manifest-lmpkg)
  - [§13.4 Module Initialization](#134-module-initialization)
  - [§13.5 Package Registry](#135-package-registry)
  - [§13.6 Reserved Namespace](#136-reserved-namespace)
  - [§13.7 Module Fallback Pairs](#137-module-fallback-pairs)
  - [§13.8 Core Package Set](#138-core-package-set)
  - [§13.9 `LOOMPATH` — Development Package Search Path](#139-loompath--development-package-search-path)
- [§14 Multiline Strings](#14-multiline-strings)
- [§15 Interpolated Strings](#15-interpolated-strings)
- [§16 Template Fences](#16-template-fences)
  - [§16.1 Fence Syntax and Descriptors](#161-fence-syntax-and-descriptors)
  - [§16.2 Inline Expressions and Directives](#162-inline-expressions-and-directives)
  - [§16.3 Template as a Value](#163-template-as-a-value)
  - [§16.4 Rendering Semantics](#164-rendering-semantics)
  - [§16.5 Failure Policy (Templates)](#165-failure-policy-templates)
  - [§16.6 HTML Context Rendering](#166-html-context-rendering)
  - [§16.7 CSS Context Fences](#167-css-context-fences)
  - [§16.8 GPU/Compute Fence Descriptors (`wgsl`, `metal`, `glsl`)](#168-gpucompute-fence-descriptors)
- [§17 Concurrency](#17-concurrency)
  - [§17.1 `async`/`await`](#171-asyncawait)
  - [§17.2 `await group`](#172-await-group)
  - [§17.3 `TaskGroup`](#173-taskgroup)
  - [§17.4 Async Iterators and `for await`](#174-async-iterators-and-for-await)
  - [§17.5 Async Iterator Combinators](#175-async-iterator-combinators)
  - [§17.6 Actors and Supervision](#176-actors-and-supervision)
  - [§17.7 `weak` References in Concurrent Contexts](#177-weak-references-in-concurrent-contexts)
  - [§17.8 OS Thread Parallelism (`--target native`)](#178-os-thread-parallelism---target-native)
  - [§17.9 Multi-Threaded Async Executor](#179-multi-threaded-async-executor)
    - [§17.9.1 `ExecutorConfig` and `RuntimeConfig`](#1791-executorconfig-and-runtimeconfig)
    - [§17.9.2 Work-Stealing Executor Semantics](#1792-work-stealing-executor-semantics)
    - [§17.9.3 `spawnBlocking` — Blocking Work Bridge](#1793-spawnblocking--blocking-work-bridge)
    - [§17.9.4 Task Sendability Rules (Multi-Threaded Executor)](#1794-task-sendability-rules-multi-threaded-executor)
    - [§17.9.5 `@concurrent` Annotation](#1795-concurrent-annotation)
    - [§17.9.6 Actor Isolation in Multi-Threaded Contexts](#1796-actor-isolation-in-multi-threaded-contexts)
    - [§17.9.7 Thread-Local Storage (`ThreadLocal[T]`)](#1797-thread-local-storage-threadlocalt)
    - [§17.9.8 Task-Local Storage (`TaskLocal[T]`)](#1798-task-local-storage-tasklocalt)
- [§17.10 Script-Mode Parallelism](#1710-script-mode-parallelism)
  - [§17.10.1 `spawnBlocking` in Scripted Mode](#17101-spawnblocking-in-scripted-mode)
  - [§17.10.2 `ScriptWorker` — Isolated Worker Instances](#17102-scriptworker--isolated-worker-instances)
  - [§17.10.3 `WorkerChannel[T]` — Typed Message Channel](#17103-workerchannel--typed-message-channel)
  - [§17.10.4 Serialization Contract](#17104-serialization-contract)
  - [§17.10.5 Worker Scope Restrictions](#17105-worker-scope-restrictions)
  - [§17.10.6 Future Evolution Path](#17106-future-evolution-path)
- [§18 FFI and Host Interop](#18-ffi-and-host-interop)
  - [§18.1 JavaScript Interop (`extern js`)](#181-javascript-interop-extern-js)
  - [§18.2 `@jsexport`](#182-jsexport)
  - [§18.3 Typed JS Facades (`lang.interop.js`)](#183-typed-js-facades-langinteropjs)
  - [§18.4 Native Interop (`extern native`)](#184-native-interop-extern-native)
  - [§18.5 FFI Thread Safety (`@threadSafe`, `ThreadSafeHandle`)](#185-ffi-thread-safety)
- [§19 Reactive UI (`ui`)](#19-reactive-ui)
  - [§19.1 Signals](#191-signals)
  - [§19.2 Components and `ComponentRegistry`](#192-components-and-componentregistry)
  - [§19.3 Mounting (Universal)](#193-mounting-universal)
  - [§19.4 `View` Type](#194-view-type)
  - [§19.5 Async Component Loading](#195-async-component-loading)
  - [§19.6 `ui` Fence — Cross-Platform Layout Primitives](#196-ui-fence--cross-platform-layout-primitives)
  - [§19.7 Web Backend (`ui.web`)](#197-web-backend-uiweb)
  - [§19.8 Desktop Backend (`ui.desktop`)](#198-desktop-backend-uidesktop)
  - [§19.9 Cross-Platform Example](#199-cross-platform-example)
  - [§19.10 Web Components](#1910-web-components)
- [§20 Runtime Root and Capabilities](#20-runtime-root-and-capabilities)
  - [§20.1 `runtime` Object](#201-runtime-object)
  - [§20.2 Script Prelude](#202-script-prelude)
  - [§20.3 Dynamic Tracing and Time-Travel Debugging](#203-dynamic-tracing-and-time-travel-debugging)
- [§21 Standard Library](#21-standard-library)
  - [§21.1 `core.text`](#211-coretext)
  - [§21.2 `data.json`](#212-datajson)
  - [§21.3 `core.time`](#213-coretime)
  - [§21.4 `core.collections`](#214-corecollections)
  - [§21.5 `core.regex`](#215-coreregex)
  - [§21.6 `core.env`](#216-coreenv)
  - [§21.7 `io.fs`](#217-iofs)
  - [§21.8 `io.proc`](#218-ioproc)
  - [§21.9 `net.net`](#219-netnet)
  - [§21.10 Set Operations](#2110-set-operations)
  - [§21.11 `core.reflect`](#2111-corereflect)
  - [§21.12 `core.inspect`](#2112-coreinspect)
  - [§21.13 `net.http`](#2113-nethttp)
  - [§21.14 `net.ws`](#2114-netws)
  - [§21.15 `net.tcp`, `net.tls`, `net.dns` — Additional Network Modules](#2115-nettcp-nettls-netdns--additional-network-modules)
  - [§21.16 `native.simd`](#2116-nativesimd)
  - [§21.17 `web.css`](#2117-webcss)
  - [§21.18 `core.math`](#2118-coremath)
  - [§21.19 `io.streams` and `io.path`](#2119-iostreams-and-iopath)
  - [§21.20 `data.yaml`, `data.toml`, `data.csv`, `data.xml`](#2120-datayaml-datatoml-datacsv-dataxml)
  - [§21.21 `sync.mutex`, `sync.atomic`, `sync.channel`](#2121-syncmutex-syncatomic-syncchannel)
  - [§21.22 `web.dom`, `web.storage`, `web.components`, `web.workers`](#2122-webdom-webstorage-webcomponents-webworkers)
  - [§21.23 `native.ffi` and `native.mem`](#2123-nativeffi-and-nativemem)
  - [§21.24 `lang.template` and `lang.macro`](#2124-langtemplate-and-langmacro)
  - [§21.25 `debug.mcp` and `debug.capture`](#2125-debugmcp-and-debugcapture)
  - [§21.26 `debug.browser`](#2126-debugbrowser)
  - [§21.27 `structures.*` — Data Structures](#2127-structures--data-structures)
    - [§21.27.1 `structures.CaseInsensitiveDictionary`](#21271-structurescaseinsensitivedictionary)
    - [§21.27.2 `structures.OrderedDictionary`](#21272-structuresordereddictionary)
    - [§21.27.3 `structures.Map`](#21273-structuresmap)
    - [§21.27.4 `structures.MergeMap`](#21274-structuresmergemap)
                      - [§22 Compiled Mode](#22-compiled-mode)
  - [§22.1 `@compiled` Directive](#221-compiled-directive)
  - [§22.2 Restrictions](#222-restrictions)
  - [§22.3 Execution Semantics](#223-execution-semantics)
- [§23 Native Compilation](#23-native-compilation)
  - [§23.1 Platform Targets and Output Formats](#231-platform-targets-and-output-formats)
  - [§23.2 Compiler Backends](#232-compiler-backends)
  - [§23.3 Linker](#233-linker)
  - [§23.4 ARC Memory Management](#234-arc-memory-management)
    - [§23.4.1 ARC Elision via `borrow` and `noescape fn`](#2341-arc-elision-via-borrow-and-noescape-fn)
    - [§23.4.2 Lifetime Tracking and Region Inference](#2342-lifetime-tracking-and-region-inference)
    - [§23.4.3 Lifetime-Verified `unowned[~name]` Fields](#2343-lifetime-verified-unownedname-fields)
    - [§23.4.4 Inferred Struct Lifetimes](#2344-inferred-struct-lifetimes)
    - [§23.4.5 `@noalias` — Disjoint Buffer Annotation](#2345-noalias--disjoint-buffer-annotation)
  - [§23.5 ARC and the Interpreted/Compiled Boundary](#235-arc-and-the-interpretedcompiled-boundary)
  - [§23.6 ABI Stability](#236-abi-stability)
  - [§23.7 C Header Interop](#237-c-header-interop)
  - [§23.8 Build Pipeline and `.lmpkg` for Native](#238-build-pipeline-and-lmpkg-for-native)
  - [§23.9 Requirements](#239-requirements)
- [§24 Macros and Metaprogramming](#24-macros-and-metaprogramming)
- [§25 Failure Policy](#25-failure-policy)
  - [§25.1 Exception Hierarchy](#251-exception-hierarchy)
  - [§25.2 User-Defined Exceptions](#252-user-defined-exceptions)
  - [§25.3 Exception Categories](#253-exception-categories)
  - [§25.4 Exception Propagation Rules](#254-exception-propagation-rules)
  - [§25.5 Catch Pattern Matching](#255-catch-pattern-matching)
  - [§25.6 Template Exceptions](#256-template-exceptions)
  - [§25.7 Task Failures](#257-task-failures)
  - [§25.8 FFI Exceptions](#258-ffi-exceptions)
  - [§25.9 Signal Handling](#259-signal-handling)
- [§26 Grammar](#26-grammar)
  - [§26.1 Lexical Grammar](#261-lexical-grammar)
  - [§26.2 Syntactic Grammar — Programs and Modules](#262-syntactic-grammar--programs-and-modules)
  - [§26.3 Syntactic Grammar — Imports and Exports](#263-syntactic-grammar--imports-and-exports)
  - [§26.4 Syntactic Grammar — Statements](#264-syntactic-grammar--statements)
  - [§26.5 Syntactic Grammar — Expressions](#265-syntactic-grammar--expressions)
  - [§26.6 Syntactic Grammar — Patterns](#266-syntactic-grammar--patterns)
  - [§26.7 Syntactic Grammar — Types](#267-syntactic-grammar--types)
  - [§26.8 Syntactic Grammar — Declarations](#268-syntactic-grammar--declarations)
  - [§26.9 Syntactic Grammar — FFI Declarations](#269-syntactic-grammar--ffi-declarations)
  - [§26.10 Syntactic Grammar — Template Directives](#2610-syntactic-grammar--template-directives)
  - [§26.11 Syntactic Grammar — Macro Declarations](#2611-syntactic-grammar--macro-declarations)
- [§27 Tooling (non-normative)](#27-tooling)
  - [§27.1 Command-Line Interface](#271-command-line-interface)
  - [§27.2 Shebang Support](#272-shebang-support)
  - [§27.3 REPL](#273-repl)
  - [§27.4 Formatter](#274-formatter)
  - [§27.5 Language Server](#275-language-server)
  - [§27.6 Browser Bootstrap and Performance](#276-browser-bootstrap-and-performance)
    - [§27.6.1 Source Map Delivery](#2761-source-map-delivery)
    - [§27.6.2 Debug Server Bootstrap (`--inspect`)](#2762-debug-server-bootstrap---inspect)
  - [§27.7 Module Wasm Cache](#277-module-wasm-cache)
  - [§27.8 Project-Local Cache and Development Isolation](#278-project-local-cache-and-development-isolation)
  - [§27.9 Hardware Management Commands](#279-hardware-management-commands)
- [§28 Progressive Disclosure (non-normative)](#28-progressive-disclosure)
- [§29 Future Directions (non-normative)](#29-future-directions)
- [§30 Hardware Backend Lifecycle (non-normative)](#30-hardware-backend-lifecycle)
- [Appendix A: Keyword Index](#appendix-a-keyword-index)
- [Appendix B: Operator Index](#appendix-b-operator-index)
- [Appendix C: Built-in Type Index](#appendix-c-built-in-type-index)

---

## §1 Design Goals

*(This section is non-normative.)*

Loom is a statically-typed, cooperatively-scheduled programming language designed for scripting, code generation, and full-stack application development. The following goals guide the language design:

- **Embeddable syntaxes.** The language is built so that other language syntaxes (Python, TypeScript, HTML, SQL, etc.) are easy to embed directly via template literals ("template fences"), with formatting and interpolation.

- **Runs anywhere.** The language is meant to run at any layer of the stack — CLI tools, servers, services, and in the web browser. A portable bytecode target (WebAssembly with GC+EH) ensures broad deployability and sandboxing.

- **Type-forward.** The language emphasizes types, interfaces, and type safety. It supports primitives, classes, nominal interfaces, reified generics, sum types, structs, union types, and reflection — balancing safety with dynamic capabilities for scripting and generation workflows.

- **Progressive adoption.** The language is one coherent model, but its tooling and documentation let users begin with a small script-first surface and adopt advanced features only when needed.

- **Dynamic debuggability.** The runtime is designed to support native tracing, in-process time-travel capture, and remotely activated debugging via named portals and callable entry points. The JIT compilation pipeline preserves full source maps for line-level debugging.

- **Explicit meaning.** Core syntax avoids "magic fallback" behaviors. Where dynamic behavior exists, it is opt-in and syntactically explicit.

- **Cross-platform viability.** The language and its toolchain are designed to work uniformly across CLI tools, server applications, native desktop applications, and the web browser. Platform-specific capabilities are capability-gated and enforced at build time via platform profiles.

- **Compiled mode.** For performance-critical code, Loom supports a `@compiled` mode that restricts the language to a statically-analyzable subset suitable for ahead-of-time compilation to optimized Wasm or native code. Portal statements and `core.reflect` are available in compiled mode.

- **Native compilation.** Loom programs can be compiled to native binaries via LLVM or Cranelift backends using mandatory ARC memory management, bidirectional C header interop, and deployment without a Wasm runtime.

- **True parallelism.** On native targets, the async executor is optionally reconfigurable to a work-stealing multi-threaded model that distributes async tasks across all CPU cores. CPU-bound work runs on a dedicated blocking thread pool via `spawnBlocking`. In scripted mode and Wasm targets, `spawnBlocking` offloads synchronous work to a host-managed thread pool, and `ScriptWorker` provides isolated parallel Wasm instances with typed message channels. The `Sendable` interface enforces data-race freedom at compile time across all targets.

- **Unified UI model.** The `ui` module provides a single reactive component model and `ui` fence that targets both web browsers (via Wasm) and native desktop platforms. Components written against the universal core are cross-platform by default; platform-specific enrichment is opt-in.

---

## §2 Execution Model

*(This section is normative.)*

Loom defines two execution modes: **scripted mode** (the default) and **compiled mode** (opt-in via the `@compiled` directive; see §22). This section specifies scripted mode. Compiled mode execution semantics are defined in §22.

### §2.1 Scripted Mode (JIT)

Loom's scripted mode uses a cooperative, single-threaded runtime with first-class `async`/`await`.

**Runtime model.** The runtime SHALL execute Loom code cooperatively on a single thread by default, suspending only at explicit `await` expressions. All asynchronous work is represented as `Task[T]` values scheduled on the host event loop. Evaluation is deterministic between suspension points; only external I/O completion order may affect when suspended tasks resume. On `--target native`, the executor may be reconfigured to a work-stealing multi-threaded model via `runtime.configure` (§17.9.1) to enable parallelism across CPU cores. In scripted mode and Wasm targets, `spawnBlocking` (§17.10.1) offloads CPU-bound synchronous work to a host-managed thread pool, and `ScriptWorker` (§17.10.2) provides isolated parallel Wasm instances with `Sendable`-typed message channels.

**JIT compilation pipeline.** The `loom run` command uses a JIT compilation pipeline rather than ahead-of-time batch compilation:

1. **Cache lookup** — Before compiling, the runtime checks the module Wasm cache (§27.7) for an up-to-date compiled artifact matching the module's source hash and current toolchain version. If a cache hit is found, step 2 is skipped and the cached Wasm is instantiated directly.
2. **Parse and JIT compile to Wasm** — If no cache entry exists, the source file is parsed into an AST and each top-level statement (or function body) is compiled to WebAssembly (GC+EH) incrementally.
3. **Execute** — Compiled Wasm is executed immediately.

This pipeline ensures that execution begins immediately and each statement is individually addressable by a debugger. There is no separate build step for scripted mode. For packages installed via `loom install`, step 1 will nearly always be a cache hit, reducing scripted-mode startup latency to near-zero for imported modules.

**Statement-level execution.** The runtime SHALL treat every source-level statement as a discrete execution step. This is analogous to Python's line-by-line execution model. When a module is loaded, its top-level statements execute sequentially in source order. The JIT pipeline is the default execution mode for `loom run` and REPL sessions.

**Source maps and debugging.** The runtime SHALL maintain a source map from every emitted Wasm instruction back to its originating Loom source line and column, enabling line-level breakpoints on any statement including imports and type definitions. JIT-compiled Wasm retains full debug metadata (source maps, local variable names, scope boundaries) by default.

**Source map delivery (normative).** When `loom build --debug --target browser` is invoked the toolchain SHALL:

1. Emit an external source map file `app.wasm.map` in the `dist/` output alongside `app.wasm`. Inline base64 source maps are permitted only for `loom serve` development mode; external files are required for all `loom build` outputs.
2. Append a `//# sourceMappingURL=app.wasm.map` comment at the end of the `app.wasm` binary so V8's Wasm debugger discovers the map automatically.
3. Annotate each portal entry point in the source map using the custom extension field `x-loom-portals`: a JSON object mapping portal names to their Wasm byte offsets. This enables the Loom DevTools extension (§21.26) to look up portals by name for CDP breakpoint placement.

`loom serve` SHALL serve `*.wasm.map` files with `Content-Type: application/json` and the response header `Access-Control-Allow-Origin: *` so Chrome DevTools can fetch source maps across the local origin boundary. Production deployments are responsible for configuring equivalent headers on their static file servers; Loom does not enforce this at build time but the tooling documentation SHALL note the requirement.

**Bytecode target.** The primary bytecode target is WebAssembly with GC and Exception Handling proposals. The specification defines:

- The mapping from Loom types to Wasm GC types (structs, arrays, `i31ref`, `funcref`, etc.)
- How Loom exceptions map to Wasm EH tags
- How `Task[T]` and async/await map to Wasm execution (stack switching or CPS transform)
- The Wasm module interface (imports/exports) that the Loom runtime host must provide
- The source map format that maps Wasm instruction offsets to Loom source locations (file, line, column)

**AOT compilation.** The `loom build` command uses an ahead-of-time (AOT) compilation mode that produces optimized Wasm modules for deployment. Debug info inclusion is controlled by a `--debug` flag. AOT-compiled Wasm strips debug metadata unless `--debug` is specified.

**Statement-level execution semantics.** The following rules define precisely what "executing" each kind of top-level statement means:

- **Import statement:** (a) Resolve the module path. (b) If the module is not already loaded, JIT-compile the target module's source, set its `__name__` to its fully-qualified module name and `__file__` to its source path, then execute its top-level statements in order. (c) Cache the module's bindings. (d) Bind the imported names into the current scope. If the module was already loaded, step (b) is skipped and cached bindings are reused. A module is initialized at most once.
- **`class` declaration:** (a) Evaluate any superclass/interface references. (b) Register the class type in the runtime type registry with its fields, methods, and metadata. (c) Make the class name available in the current scope.
- **`enum` declaration:** (a) Register the enum type and all its variants in the runtime type registry. (b) Make the enum name and variant constructors available in the current scope.
- **`interface` declaration:** (a) Register the interface in the runtime type registry. (b) Make the interface name available in the current scope.
- **`func` declaration:** (a) Capture the current lexical environment for closures. (b) Register the function name in the current scope with a lazy-compiled function value — the body is JIT-compiled on first invocation.
- **`let`/`var` declaration:** (a) Evaluate the initializer expression (if present). (b) Bind the name in the current scope to the resulting value.
- **Expression statement:** (a) Evaluate the expression for its side effects. (b) Discard the result value.

Module initialization order: top-level statements execute in source order, and a module is initialized at most once (subsequent imports of the same module reuse the cached bindings). The `__name__` and `__file__` dunder variables are set before the first top-level statement executes (see §2.2).

For all top-level statement kinds, the runtime SHALL fire a `Line` trace event before executing the statement, enabling debuggers to pause at that point.

**Incremental re-compilation.** The JIT pipeline supports incremental re-compilation: when a module's source changes during a REPL session, only the changed definitions are re-compiled. Unchanged definitions retain their compiled Wasm and are not reprocessed.

**Line-level debuggability.** The runtime supports setting breakpoints on any source line that corresponds to an executable step, including: import statements, `class`/`enum`/`interface` declarations, `let`/`var` declarations, expression statements, control flow statements, `defer` registrations, and `portal` entries. When a breakpoint is hit, the runtime suspends execution and exposes the current lexical scope (all visible bindings and their values) to the debugger.

The runtime supports the following debug operations:

- **Step-over:** Advance execution one source-level statement at a time, skipping into function calls.
- **Step-into:** Enter a function call or import statement and step through its statements.
- **Step-out:** Complete the current function and return to the caller.
- **Conditional breakpoints:** The condition is a Loom expression evaluated in the breakpoint's lexical scope.
- **Watch expressions:** Re-evaluated at each debugger pause using the current scope.

When stepping into an import statement, the debugger enters the imported module and allows stepping through its top-level statements one by one. Line-level debugging is available in both `loom run` (JIT) mode and when running Wasm modules compiled with `loom build --debug`.

The runtime SHALL emit `Line` trace events (as defined in §20.3) at every source-level statement boundary, enabling trace hooks to observe execution at line granularity.

**Debug information and source maps.** The compiler SHALL emit DWARF debug information or a Wasm-compatible source map for every compiled Wasm module, mapping instruction offsets to Loom source locations (file path, line, column). Debug metadata includes:

- Local variable name and scope boundary information, so debuggers can display variable values at any point in execution.
- Type information, including enum variants, generic type parameters, and boxed/unboxed state, so debuggers can display typed values.

When JIT-compiling, the runtime attaches debug metadata to each compiled Wasm function immediately, without requiring a post-processing step. When AOT-compiling with `loom build --debug`, the compiler embeds debug metadata in the output Wasm module or emits a companion `.loom-debug` sidecar file. When AOT-compiling without `--debug`, the compiler strips debug metadata from the output Wasm module for minimal binary size.

The source map format is defined in relation to existing standards: DWARF for Wasm (for native and AOT targets) and the Wasm Source Map proposal (for browser-hosted execution).

**Tracing.** When a debug server or trace hook is active, the runtime SHALL maintain rolling trace history for time-travel debugging. Named `portal` statements and callable entry points may activate trace capture for the current task.

**Failure model.** Failures are hard by default; see §25 for the complete failure policy.

### §2.2 Module Introspection Dunders

Every Loom module has three implicit read-only bindings available at module scope:

| Dunder | Type | Description |
|---|---|---|
| `__name__` | `string` | The module's identity name |
| `__file__` | `string` | The absolute filesystem path of the source file |
| `__execmode__` | `string` | `"interpreted"` or `"compiled"` |

**`__name__` rules:**

- When a file is executed directly via `loom run`, `__name__` is `"__main__"`.
- When a file is loaded as an import, `__name__` is the module's fully-qualified dotted name (e.g., `"mypackage.utils"`).
- In `@compiled` files, `__name__` is never `"__main__"` — compiled files cannot be entry points.
- In the REPL, `__name__` is `"__main__"`.

**`__file__` rules:**

- `__file__` is the absolute path to the source file on disk.
- In the REPL, `__file__` is `"<repl>"`.

**`__execmode__` rules:**

- For files without `@compiled`, `__execmode__` is `"interpreted"`.
- For files with `@compiled`, `__execmode__` is `"compiled"`.
- In the REPL, `__execmode__` is `"interpreted"`.

**Read-only semantics.** The compiler SHALL treat `__name__`, `__file__`, and `__execmode__` as read-only implicit `let` bindings. Attempting to reassign any of them is a compile-time error.

**Compiled-mode constants.** In `@compiled` files, `__name__`, `__file__`, and `__execmode__` are compile-time string constants baked into the binary. `__name__` is the module's dotted name (never `"__main__"`), `__file__` is the source path at compile time, and `__execmode__` is `"compiled"`.

**Dunder reservation.** Identifiers beginning and ending with double underscores (`__*__`) follow the Python dunder naming convention and are reserved for language-defined module introspection variables. User code SHALL NOT declare variables with dunder names. The language-reserved dunders are: `__name__`, `__file__`, and `__execmode__`. Additional language-level introspection variables follow the same `__dunder__` pattern.

**Main guard pattern.** The idiomatic way to write code that runs only when a file is executed directly:

```
// utils.loom — a dual-purpose module
pub func greet(name: string): string {
  return "Hello, {$ name $}!";
}

if (__name__ == "__main__") {
  // This block runs only when executed via `loom run utils.loom`
  let message = greet("world");
  print(message);
}
```

This pattern allows a module to be both importable (exporting functions and types) and directly executable.

**Async execution example.** The following demonstrates the cooperative async model with `Task[T]`:

```
async func fetchData(url: string): Task[string] {
  let response = await runtime.net.get(url);
  return response.body;
}

async func main() {
  // Tasks start immediately when called
  let task1 = fetchData("https://api.example.com/users");
  let task2 = fetchData("https://api.example.com/posts");

  // Await suspends until each task completes
  let users = await task1;
  let posts = await task2;

  print("Users: {$ users $}");
  print("Posts: {$ posts $}");
}

if (__name__ == "__main__") {
  await main();
}
```

### §2.3 Origination Introspection Dunders

Classes have declaration-level dunders that are accessible as properties on named types and functions:

| Dunder | Available on | Type | Description |
|---|---|---|---|
| `__module__` | class, struct, enum, interface, func | `Module` | The module that declared this value |


**`__module__` on named declarations.** Every named class, struct, enum, interface, and function declaration carries an implicit `__module__` property that returns a `Module` value representing the module where the declaration was made. This is accessible via dot syntax on any named type or function value:
```loom
Encoder.__module__.__execmode__    // "compiled" or "interpreted"
decode.__module__.__name__         // "mylib.codec"
Shape.__module__.__file__          // "/path/to/shapes.loom"
```

`__module__` is not a module-scope dunder — it is a property on type and function values. It is available in both scripted and `@compiled` modes. In `@compiled` mode, `.__module__` returns compile-time-baked metadata.

**`Module` built-in type.** `Module` is a built-in class with read-only properties mirroring the module-scope dunders:
```loom
class Module : Any {
  pub let __name__: string;      // fully-qualified module name
  pub let __file__: string;      // source file path at compile time
  pub let __execmode__: string;  // "interpreted" | "compiled"
}
```

`Module` values are not constructable by user code — they are produced only by the runtime in response to `.__module__` access. Two `.__module__` accesses on declarations from the same module return the same `Module` instance (referential equality).

**`prefer compiled` and `__execmode__`.** When a module is loaded via `prefer compiled` resolution (§13.1, §13.7), its `__execmode__` reflects which path was taken: `"compiled"` if a compiled artefact was loaded, `"interpreted"` if the scripted fallback was used. This is the canonical way to inspect fallback resolution from user code:
```loom
from codec import (Encoder) prefer compiled;

if (Encoder.__module__.__execmode__ == "interpreted") {
  log.warn("codec running in pure scripted mode — performance may be reduced");
}
```

---

## §3 Lexical Structure

*(This section is normative.)*

### §3.1 Source Encoding

All Loom source files SHALL be encoded in UTF-8. A byte order mark (BOM) at the start of a file is permitted but not required; if present, it is ignored. Source files that are not valid UTF-8 produce a compile-time error.

### §3.2 Comments

Loom supports three comment forms:

**Single-line comments** begin with `//` and extend to the end of the line:

```
let x = 42;  // this is a comment
```

**Multi-line comments** are delimited by `/*` and `*/`. Multi-line comments do NOT nest — the first `*/` encountered closes the comment:

```
/* This is a
   multi-line comment */
```

**Doc comments** begin with `///` and extend to the end of the line. Doc comments are attached to the immediately following declaration and are accessible via reflection:

```
/// Computes the factorial of n.
/// Returns 1 for n <= 1.
func factorial(n: int): int {
  if (n <= 1) { return 1; }
  return n * factorial(n - 1);
}
```

Comments are lexically transparent: for any valid Loom program, removing all comments SHALL produce an AST identical to the original program's AST. Comments do not affect parsing, type-checking, or execution.

### §3.3 Keywords and Reserved Words

The following identifiers are keywords and SHALL NOT be used as variable, function, type, or module names:

```
abstract   and        as         async      await      bnot       borrow
break      catch      class      continue   defer      del
do         dynamic    else       enum       extern     false
finally    fn         for        from       func        gen
get        global     if         implements import     in
instanceof interface  is         let        lifetime   match      new
noescape   nonlocal   none       not        or         portal
prefer     pub        return     set        spawn      static
struct     suspend    throw      true       try        type
typeof     var        while      with       yield
```

The following identifiers are **reserved for future use** and SHALL NOT be used as user identifiers:

```
macro      where      trait      module     package    super
self       Self       override   final      sealed     volatile
```

**Contextual keywords.** The following identifiers have special meaning only in specific syntactic positions and may be used as ordinary identifiers elsewhere:

- `group` — contextual in `await group { ... }`
- `once` — contextual in debug activation requests

**Dunder identifiers.** Identifiers beginning and ending with double underscores (`__name__`, `__file__`, `__execmode__`) are reserved for language-defined module introspection variables. User code SHALL NOT declare bindings with dunder names.

**`borrow`** is a parameter modifier keyword and field qualifier keyword. It is permitted only in `@compiled` files targeting `--target native`. Using `borrow` in scripted mode or in `@compiled` files targeting Wasm is a compile-time error.

**`lifetime`** is a lifetime-parameter keyword. It is used only in the `[...]` generic-parameter brackets of functions, structs, enums, and interfaces to declare a named region. `lifetime` is permitted only in `@compiled` files targeting `--target native`. Using `lifetime` in scripted mode or in `@compiled` files targeting Wasm is a compile-time error.

**Lifetime labels.** A lifetime label is a lowercase identifier prefixed with the `~` sigil (e.g. `~src`, `~origin`). The `~` sigil is used exclusively for lifetime labels and may not appear in any other context. Lifetime labels are not identifiers — they cannot be used as variable names, type names, or in any position other than `[lifetime ~name]` declarations and `borrow[~name]` references. `~static` is a reserved lifetime label with special semantics (see §7.1, §23.4.2); it may not be declared as a user lifetime parameter.

**`noescape`** is a function type modifier keyword. It is permitted only in `@compiled` files targeting `--target native` as a modifier on `fn` types. Using `noescape` in scripted mode or in `@compiled` files targeting Wasm is a compile-time error.

**`prefer`** is a keyword used in the two-token sequence `prefer compiled`, valid only in import statements (see §13.1). `prefer` is a reserved keyword and SHALL NOT be used as an identifier.

### §3.4 Identifiers

An identifier is a sequence of Unicode letters, digits, and underscores that does not begin with a digit:

```
Identifier ::= IdentStart IdentContinue*
IdentStart ::= UnicodeLetterOrUnderscore
IdentContinue ::= UnicodeLetterOrUnderscore | UnicodeDigit
```

Identifiers are case-sensitive. By convention:

- **Lowercase** names are used for variables, functions, parameters, and primitive types (`int`, `float`, `bool`, `string`, `bytes`).
- **PascalCase** names are used for classes, interfaces, enums, structs, type aliases, and type parameters (`MyClass`, `Option[T]`, `Task[T]`).
- **SCREAMING_SNAKE_CASE** is used for constants by convention but is not enforced by the language.

### §3.5 Literals

#### Integer Literals

Integer literals represent values of type `int`. Loom supports four bases:

| Base | Prefix | Digits | Example |
|---|---|---|---|
| Decimal | (none) | `0`–`9` | `42`, `1_000_000` |
| Hexadecimal | `0x` or `0X` | `0`–`9`, `a`–`f`, `A`–`F` | `0xFF`, `0x1A_2B` |
| Binary | `0b` or `0B` | `0`, `1` | `0b1010`, `0b1111_0000` |
| Octal | `0o` or `0O` | `0`–`7` | `0o777`, `0o17` |

Underscores (`_`) may appear between digits for readability and are ignored. A leading underscore after the prefix or a trailing underscore is not permitted.

An unsuffixed integer literal has type `int` (int64). A **type suffix** produces a literal of the named type:

| Suffix | Type | Example |
|---|---|---|
| *(none)* | `int` (`int64`) | `255`, `0xFF` |
| `i8` | `int8` | `127i8` |
| `i16` | `int16` | `1_000i16` |
| `i32` | `int32` | `0xDEAD_BEEFi32` |
| `i64` | `int64` | `42i64` |
| `u8` | `uint8` | `255u8` |
| `u16` | `uint16` | `65535u16` |
| `u32` | `uint32` | `0xFFFF_FFFFu32` |
| `u64` | `uint64` | `18_446_744_073_709_551_615u64` |
| `n` | `bigint` | `99_999_999_999_999_999_999n` |

The suffix is case-sensitive. A value that does not fit in the declared type is a compile-time error.

The `int` type is a signed 64-bit integer (range: −2⁶³ to 2⁶³−1). Integer overflow behaviour is specified in §4.1.1.

**Explicit conversions.** See §4.1.2 for the full conversion function set. Mixed `int`/`float` arithmetic promotes the `int` operand automatically (see §3.6).

#### Float Literals

Float literals represent values of type `float`, which is an IEEE 754 double-precision (64-bit) floating-point number:

```
3.14
2.0
1.5e10
1.5E-3
0.0
```

A float literal must contain a decimal point or an exponent (or both). A bare integer like `42` is always `int`; write `42.0` for `float`.

**Type suffixes for float literals:**

| Suffix | Type | Example |
|---|---|---|
| *(none)* | `float` (`float64`) | `3.14`, `1.5e10` |
| `f32` | `float32` | `3.14f32`, `1.0f32` |
| `f64` | `float64` | `2.718f64` |
| `d` | `decimal` | `19.99d`, `0.1d` |

A `float32` literal may lose precision relative to the source value — the compiler emits a warning if the value cannot be represented exactly in single precision.

#### String Literals

String literals are delimited by double quotes (`"`) or single quotes (`'`). All strings are UTF-8 encoded sequences of Unicode scalar values.

```
"hello, world"
'single-quoted string'
"line one\nline two"
```

**Escape sequences:**

| Escape | Meaning |
|---|---|
| `\\` | Backslash |
| `\'` | Single quote |
| `\"` | Double quote |
| `\n` | Newline (LF) |
| `\r` | Carriage return (CR) |
| `\t` | Horizontal tab |
| `\0` | Null character |
| `\uXXXX` | Unicode code point (4 hex digits) |
| `\u{XXXXXX}` | Unicode code point (1–6 hex digits) |

**Raw strings** disable escape processing. They are prefixed with `r`:

```
r"no \n escape here"
r'C:\Users\name\file.txt'
```

Raw strings may not contain the delimiter character (use the other quote style or a multiline string).

**String concatenation** uses the `+` operator:

```
let greeting = "Hello, " + name + "!";
```

#### Bytes Literals

Bytes literals represent values of type `bytes` and are prefixed with `b`:

```
b"hello"
b'\x00\xFF'
```

Bytes literals support the same escape sequences as string literals, plus `\xHH` for arbitrary byte values. The content is not required to be valid UTF-8.

#### `char` Literals

A `char` literal represents a single Unicode scalar value and has type `char`. It is prefixed with `c` and delimited by double or single quotes:

```loom
let a: char = c"A";
let newline: char = c"\n";
let snowman: char = c"☃";
let hi: char = c"\u{1F600}";    // 😀
```

`char` literals support the same escape sequences as string literals. The `\xHH` escape is not permitted in `char` literals — use `\u{HH}` instead. A `char` literal containing zero Unicode scalar values or more than one is a **compile-time error**:

```loom
let bad1: char = c"";    // compile-time error: empty char literal
let bad2: char = c"ab";  // compile-time error: multiple scalar values
```

A `char` value is not implicitly coercible to `string`. Use `c.toString()` or string interpolation `"{$ c $}"` to convert.

#### Boolean Literals

The boolean type `bool` has exactly two values: `true` and `false`.

### §3.6 Operators

Loom defines the following operators, listed from highest to lowest precedence. Operators at the same precedence level associate as indicated.

| Precedence | Operator(s) | Description | Associativity |
|---|---|---|---|
| 1 | `()` `[]` `.` `?.` `!{}` `?.[` | Call, index, member access, safe nav, dynamic access, null-safe index | Left |
| 2 | `typeof` | Type-of operator | Prefix |
| 3 | `-` (unary) `not` `!` `bnot` | Unary negation, logical not, bitwise not | Prefix |
| 4 | `box` | Boxing/widening operator (contextual keyword) | Prefix |
| 5 | `**` | Exponentiation | Right |
| 6 | `*` `/` `//` `%` | Multiplication, division, floor division, modulo | Left |
| 7 | `+` `-` | Addition, subtraction, string concatenation | Left |
| 8 | `<<` `>>` | Bitwise shift | Left |
| 9 | `&` | Bitwise AND | Left |
| 10 | `^` | Bitwise XOR | Left |
| 11 | `\|` | Bitwise OR | Left |
| 12 | `[:]` | Slice | N/A |
| 13 | `in` `not in` | Membership | Left |
| 14 | `<` `>` `<=` `>=` | Comparison | Left |
| 15 | `==` `!=` | Equality | Left |
| 16 | `is` `instanceof` | Type check | Left |
| 17 | `as` `as?` | Cast operators (narrowing) | Left |
| 18 | `and` `&&` | Logical AND (short-circuit) | Left |
| 19 | `or` `\|\|` | Logical OR (short-circuit) | Left |
| 20 | `??` | Null coalescing | Left |
| 21 | `? :` | Ternary conditional | Right |
| 22 | `?` (postfix) | Result propagation | Postfix |
| 23 | `=` `+=` `-=` `*=` `/=` `%=` `**=` `<<=` `>>=` `&=` `\|=` `^=` | Assignment | Right |
| 24 | `*` `**` (prefix, spread) | Spread | Prefix |

**Arithmetic operators** (`+`, `-`, `*`, `/`, `//`, `%`, `**`) operate on `int` and `float`. Mixed `int`/`float` arithmetic promotes the `int` operand to `float`. Division of two `int` values (`/`) produces `int` (truncating toward zero); `//` is floor division — it truncates toward negative infinity and always returns the same type as its operands (`int // int` → `int`, `float // float` → `float`, `bigint // bigint` → `bigint`, `decimal // decimal` → `decimal`). The `+` operator also concatenates `string` values and `list` values.

**Comparison operators** (`<`, `>`, `<=`, `>=`) operate on types that implement the `Comparable[T]` interface. Primitives (`int`, `float`, `string`) are comparable by default.

**Equality operators** (`==`, `!=`) use structural equality for primitives, enums, structs, and tuples. For class instances, `==` compares by reference identity unless the class overrides equality via the `Equatable[T]` interface (see §5.1, §11.2). Equality is reflexive (`a == a`), symmetric (`a == b` implies `b == a`), and transitive.

**Logical operators** (`and`/`&&`, `or`/`||`, `not`/`!`) operate on `bool` values. `and` and `or` are short-circuit: the right operand is not evaluated if the left operand determines the result.

**Canonical style.** The keyword forms `and`, `or`, and `not` are the idiomatic Loom style. The symbol aliases `&&`, `||`, and `!` are legal and semantically identical but are considered non-canonical. The reference formatter (§27.4) rewrites symbol forms to keyword forms. Code using symbol forms is accepted by the compiler but produces a lint advisory (`symbol-logical-ops`) that can be suppressed per-line with `// loom:allow(symbol-logical-ops)`. New code should use keyword forms exclusively. This rule applies uniformly in scripted mode, `@compiled` mode, and template fence expressions.

**User-defined operator overloading** is supported via the operator interface protocol. See §5.1 for desugar rules and §11.2 for the full operator interface set.

**Cast operators** (`as`, `as?`) perform narrowing from `Any` to a concrete type. `expr as T` throws `TypeError` on mismatch; `expr as? T` returns `Option[T]`. See §4.3.

**`box` operator** widens a value type to `Any`. See §4.3.

### §3.7 Collection Literals

Loom provides literal syntax for the built-in collection types:

**List literals:**
```
let empty: list[int] = [];
let nums = [1, 2, 3, 4, 5];
let mixed: list[Any] = [1, "hello", true];   // implicit widening
```

**Dict literals:**
```
let empty: dict[string, int] = {};
let ages = {"alice": 30, "bob": 25};
```

**Set literals:**
```
let primes = {2, 3, 5, 7, 11};
```

An empty `{}` is ambiguous between dict and set; it defaults to `dict`. Use a type annotation or `set[T]()` constructor for an empty set.

**Tuple literals:**
```
let pair = (1, "hello");
let triple = (true, 3.14, "pi");
let single = (42,);  // trailing comma distinguishes from parenthesized expression
```

Trailing commas are permitted in all collection literals.

**Spread in collection literals.** The `*` and `**` spread operators may be used inside collection literals to expand existing collections inline. See §5.8 for full details.

```
let a = [1, 2, 3];
let b = [0, *a, 4];       // [0, 1, 2, 3, 4]

let base = {"x": 1};
let extended = {**base, "y": 2};  // {"x": 1, "y": 2}
```



---

## §4 Types and Type System

*(This section is normative.)*

Loom is a statically-typed language with type inference. Every value has a type known at compile time. The type system supports primitives, classes, interfaces, enums, structs, tuples, union types, generics, and function types.

### §4.1 Primitive Types

Primitive types use lowercase names and are unboxed, passed-by-value types that do not inherit from `Any`.

**Signed integer types:**

| Type | Description | Size | Range |
|---|---|---|---|
| `int` | Signed 64-bit integer (alias for `int64`) | 8 bytes | −2⁶³ to 2⁶³−1 |
| `int8` | Signed 8-bit integer | 1 byte | −128 to 127 |
| `int16` | Signed 16-bit integer | 2 bytes | −32 768 to 32 767 |
| `int32` | Signed 32-bit integer | 4 bytes | −2³¹ to 2³¹−1 |
| `int64` | Signed 64-bit integer | 8 bytes | −2⁶³ to 2⁶³−1 |
| `bigint` | Arbitrary-precision signed integer | Variable | Unbounded |

**Unsigned integer types:**

| Type | Description | Size | Range |
|---|---|---|---|
| `uint8` | Unsigned 8-bit integer | 1 byte | 0 to 255 |
| `uint16` | Unsigned 16-bit integer | 2 bytes | 0 to 65 535 |
| `uint32` | Unsigned 32-bit integer | 4 bytes | 0 to 2³²−1 |
| `uint64` | Unsigned 64-bit integer | 8 bytes | 0 to 2⁶⁴−1 |

**Floating-point types:**

| Type | Description | Size |
|---|---|---|
| `float` | IEEE 754 double-precision (alias for `float64`) | 8 bytes |
| `float32` | IEEE 754 single-precision | 4 bytes |
| `float64` | IEEE 754 double-precision | 8 bytes |
| `decimal` | Arbitrary-precision decimal | Variable |

**Other primitive types:**

| Type | Description | Size |
|---|---|---|
| `bool` | Boolean (`true` or `false`) | 1 byte |
| `char` | A single Unicode scalar value (U+0000–U+10FFFF, excluding surrogates) | 4 bytes |
| `string` | Immutable UTF-8 sequence of Unicode scalar values. `s.length` counts scalar values; `s[i]` returns `char`. See §4.1.5. | Variable |
| `bytes` | Arbitrary byte sequence (not required to be valid UTF-8). `b[i]` returns `uint8`. | Variable |

`int` is an alias for `int64`. `float` is an alias for `float64`. Using `int` and `float` is preferred for general-purpose numeric work; the explicit-width names exist for systems programming, FFI, and numerical computing requiring specific memory layouts.

"Passed by value" refers to the language's assignment/call semantics. The runtime may use efficient representations (handles, copy-on-write, etc.) as long as observable semantics match.

#### §4.1.1 Fixed-Width Integer Overflow

In scripted mode and Wasm targets, arithmetic on fixed-width integer types (`int8`, `int16`, `int32`, `int64`, `uint8`, `uint16`, `uint32`, `uint64`) that would overflow the type's range is a `NumericOverflowError` at runtime.

In `@compiled --target native`, the default is **wrapping arithmetic**: overflow silently wraps at the type boundary (two's complement for signed types, modular for unsigned). This is the C-compatible behavior required for systems programming and SIMD work.

`int` / `int64` are an exception: they default to **checked arithmetic** (throwing `NumericOverflowError` on overflow) in compiled native mode, matching scripted-mode semantics. Use `@overflowWrapping` on a function to opt into wrapping for all fixed-width arithmetic within it:

```loom
@compiled
@overflowWrapping
func addWrapping(a: int32, b: int32): int32 {
  return a + b;   // wraps silently on overflow
}
```

**Explicit checked and saturating arithmetic.** All fixed-width integer types provide methods for explicit overflow handling regardless of the ambient mode:

```loom
let a: int32 = 2_147_483_647i32;
let b: int32 = a.checkedAdd(1);      // Option[int32] — None on overflow
let c: int32 = a.saturatingAdd(1);   // int32 — clamps to 2_147_483_647
let d: int32 = a.wrappingAdd(1);     // int32 — wraps to -2_147_483_648
```

`bigint` and `decimal` never overflow — they grow as needed.

#### §4.1.2 Numeric Conversions

All narrowing conversions between numeric types are **explicit** — no implicit narrowing. The compiler emits a type error if a narrower type is assigned from a wider type without an explicit conversion call.

**Implicit widenings (no call required):**
- Signed integer widenings: `int8` → `int16` → `int32` → `int64` (`int`) → `bigint`
- Unsigned integer widenings: `uint8` → `uint16` → `uint32` → `uint64`
- Float widening: `float32` → `float64` (`float`)
- Any integer or float → `decimal`

**Explicit conversion functions:**

```loom
int8(x)     // truncate / wrap to int8
int16(x)    // truncate / wrap to int16
int32(x)    // truncate / wrap to int32
int64(x)    // alias: int(x)
uint8(x)    // truncate / wrap to uint8
uint16(x)   // truncate / wrap to uint16
uint32(x)   // truncate / wrap to uint32
uint64(x)   // truncate / wrap to uint64
float32(x)  // narrow to float32 (possible precision loss)
float64(x)  // alias: float(x)
bigint(x)   // convert int or float to bigint (truncates fractional part)
decimal(x)  // convert any number or string to decimal
```

Conversion that cannot represent the value (e.g. `int8(300)`) wraps on native targets and throws `NumericOverflowError` in scripted mode.

**Mixed-type arithmetic.** In expressions mixing `int` and `float`, the `int` operand is promoted to `float` automatically. All other mixed combinations are compile-time errors — use an explicit conversion.

#### §4.1.3 `bigint` — Arbitrary-Precision Integer

`bigint` is an arbitrary-precision signed integer. Values grow without bound, limited only by available memory. This matches the behavior of Python's `int` built-in and JavaScript's `BigInt`.

**Literal syntax.** Append `n` to any integer literal:

```loom
let x: bigint = 99_999_999_999_999_999_999n;
let y: bigint = 0xFF_FF_FF_FF_FF_FF_FF_FFn;
let z: bigint = bigint(42);    // construct from int
```

**Supported operations:**

| Operation | Notes |
|---|---|
| `+`, `-`, `*`, `**` | All return `bigint` |
| `//` | Floor division (truncates toward −∞) — returns `bigint` |
| `%` | Modulo — returns `bigint` |
| `/` | Exact division — returns `decimal` |
| `&`, `\|`, `^`, `bnot`, `<<`, `>>` | Bitwise — return `bigint` |
| `==`, `!=`, `<`, `>`, `<=`, `>=` | Comparison — return `bool` |

`bigint` does not mix with fixed-width integers without explicit conversion. `42n + 1` is a type error; write `42n + bigint(1)` or `bigint(42) + 1n`.

**Availability.** `bigint` is available on all targets: scripted, Wasm, and native. On native targets it is backed by a multi-precision library (GMP-compatible). On Wasm it is emulated in software. Performance is substantially slower than fixed-width integer arithmetic.

#### §4.1.4 `decimal` — Arbitrary-Precision Decimal

`decimal` is an arbitrary-precision decimal floating-point type. Unlike `float` and `float32`, `decimal` can exactly represent base-10 fractions: `0.1 + 0.2 == 0.3d` is `true`.

Based on the IEEE 754-2019 decimal128 arithmetic model. Suitable for financial calculations, currency, and scientific work requiring exact decimal semantics.

**Literal syntax.** Append `d` to any numeric literal, or construct from a string for values beyond literal range:

```loom
let price: decimal = 19.99d;
let rate:  decimal = 0.075d;
let pi:    decimal = decimal("3.14159265358979323846264338327950288");
```

**Supported operations:** all arithmetic operators, all comparisons. Division is exact (produces a `decimal` result with full precision). `//` is floor division (truncates toward −∞) returning `decimal`. The result is a `decimal` value with zero fractional part, not an `int`.

**Availability.** `decimal` is available on all targets. Performance is substantially slower than `float` — use `float` for numerical computing and `decimal` where exactness of base-10 fractions is required.


#### §4.1.5 `char` — Unicode Scalar Value

`char` is a primitive type representing a single Unicode scalar value. It is the element type of `string` — produced by indexing (`s[i]`) and iteration (`for c in s`).

**Valid range.** A `char` holds a Unicode code point in the range U+0000–U+10FFFF, excluding the surrogate range U+D800–U+DFFF. All 1,112,064 valid scalar values are representable. No runtime operation produces an out-of-range `char`.

**`char` is not `int` and not `string`.** Implicit conversion is prohibited in both directions:

```loom
let c: char = c"A";
let n: int    = c.toInt();         // 65  — explicit
let s: string = c.toString();      // "A" — explicit
let s2: string = "{$ c $}";        // "A" — interpolation auto-converts

let c2: char  = char.of(65)?;      // Option[char]: Some(c"A")
let c3: char  = "hello"[0];        // char: c"h"
```

**Methods on `char`:**

```loom
// Code point value
c.toInt(): int                    // Unicode code point as int
c.toString(): string              // single-character string

// Character class (Unicode property based)
c.isAlpha(): bool                 // Unicode general category: letter (L*)
c.isDigit(): bool                 // ASCII digits 0–9
c.isAlphaNumeric(): bool
c.isWhitespace(): bool            // Unicode White_Space property
c.isAscii(): bool                 // code point ≤ 127
c.isUpper(): bool                 // has uppercase simple mapping
c.isLower(): bool                 // has lowercase simple mapping

// Case conversion (simple 1:1 Unicode mapping)
c.toUpper(): char
c.toLower(): char
c.toAsciiUpper(): char            // ASCII-only; no-op for non-ASCII
c.toAsciiLower(): char

// Constructors
char.of(codePoint: int): Option[char]   // None if out-of-range or surrogate
char.of(s: string): Option[char]        // None if s is not exactly 1 scalar value
```

**`char` in `@compiled` mode.** All `char` operations are available in `@compiled` mode. `char` maps to `i32` in Wasm GC and to `uint32_t` at the C ABI boundary. The companion box type `Char` (§4.2) is ABI-internal.

**`char` and equality.** `char` implements `Comparable[char]` and `Equatable[char]`, ordered by Unicode code point value.

**Generic collection primitives:**

| Type | Description |
|---|---|
| `list[T]` | Ordered, indexable sequence of `T` |
| `dict[K, V]` | Ordered map from `K` to `V` (insertion order) |
| `set[T]` | Unordered collection of unique `T` values |
| `tuple[T1, T2, ...]` | Fixed-size heterogeneous sequence |

### §4.2 Box Types

Each primitive type has an associated boxed class type with a PascalCase name. Box types inherit from `Any` and are used internally by the runtime for representation at `Any`-typed positions:

```
class Int    : Any { ... }
class Float  : Any { ... }
class Bool   : Any { ... }
class Char   : Any { ... }
class String : Any { ... }
class Bytes  : Any { ... }
```

Box types are **ABI-internal**. Their `box()` and `unbox()` static methods are marked `@internal` and are not part of the user-facing API. User code SHALL NOT reference `Int`, `Float`, `Bool`, `Char`, `String`, or `Bytes` directly as types.

The `box` contextual keyword (see §4.3) and implicit widening coercions (see §4.3) are the correct user-facing mechanisms for value-type-to-`Any` conversion. Use `as` or `as?` for narrowing from `Any`.

### §4.3 `Any`

`Any` is the root type for all heap-allocated and boxed values. Class instances are `Any`. Primitives, enums, and structs are not `Any` in their unboxed form.

**Implicit widening.** A primitive, enum, or struct value is **implicitly widened** to `Any` whenever it appears in a position that is statically typed as `Any`. The compiler inserts the boxing instruction silently — no user syntax is required:

```
func log(value: Any): void { print(value.render()); }

log(42);           // int widened to Any implicitly
log("hello");      // string widened to Any implicitly
log(true);         // bool widened to Any implicitly

let values: list[Any] = [1, "hello", true];   // all widened implicitly
```

Implicit widening is available in both scripted and `@compiled` mode. In compiled mode, `Any` as a declared type is still prohibited (§22.2); implicit widening therefore never activates in compiled code except at the specific error-boundary positions where `Option[Any]` is permitted.

**`box` keyword — explicit widening.** When the programmer wants to document that a value is deliberately crossing a type boundary, the `box` prefix keyword makes it explicit:

```
let a: Any = box 42;             // explicit widening of int → Any
let b: Any = box myStruct;       // explicit widening of struct → Any
let c: Any = box MyEnum.Variant; // explicit widening of enum → Any
```

`box expr` and implicit widening produce identical compiled output. `box` carries no additional runtime cost or semantics. `box expr` where `expr` is already `Any`-typed is a compile-time warning. `box` is a contextual keyword — special only in prefix expression position.

**`as` — asserting cast (narrowing).** Extracts a value of type `T` from an `Any`-typed expression. Throws `TypeError` if the runtime type does not match:

```
let n = value as int;        // int — throws TypeError if not an int
let s = value as string;     // string — throws TypeError if not a string
```

**`as?` — safe cast (narrowing).** Returns `Option[T]`, never throws:

```
let n = value as? int;            // int? — Some(n) or None
let s = value as? string;         // string? — Some(s) or None
let n2 = (value as? int) ?? 0;    // int, defaulting to 0
```

Both `as` and `as?` are available in both modes. In `@compiled` mode they are valid at permitted `Option[Any]` boundary positions.

`match` over `Any` continues to work and is equivalent to a chain of `as?` checks:

```
// These are equivalent for narrowing:
let n = value as? int ?? 0;

let n = match value {
  int(i) => i,
  _      => 0,
};
```

**Boundary coercions.** Implicit widening applies universally at all `Any`-typed positions:

- **Template insertion and interpolated strings** accept primitives, enums, and structs directly.
- **Dynamic-field writes** accept primitives and enum values; reads auto-unbox when the receiving type is statically known.
- **`core.inspect` writes and invocations** accept primitives and enum values; typed helpers auto-unbox primitive outputs.

**Default rendering.** All `Any` values support rendering for templates and meta-output:

```
class Any {
  pub func render(ctx: RenderContext = RenderContext(language="repr", format="none")): string;
}
```

### §4.4 Function Types

Function types describe callable values:

```loom
fn(int, int): int                  // function taking two ints, returning int
fn(): void                         // function taking no args, returning void
fn(string): Task[int]              // function taking string, returning async task
async fn(string): int              // shorthand for fn(string): Task[int]
noescape fn(int): void             // non-escaping function (@compiled --target native only)
async noescape fn(string): int     // non-escaping async function
```

Function types are first-class: they can be stored in variables, passed as arguments, and returned from functions. See §7 for function declarations and lambdas.

**`noescape fn` — non-escaping function type.** The `noescape` modifier on a function type asserts that the function value will only be called within the current call frame and will not be stored, returned, or spawned into a task. This allows the compiler to elide the ARC retain/release on the closure and potentially stack-allocate its captured variables.

`noescape fn` is only valid in `@compiled` files targeting `--target native`. Using `noescape fn` in scripted mode or in Wasm-targeted compiled files is a compile-time error.

**Subtype rule.** `fn(T): R` is a subtype of `noescape fn(T): R` at call sites. A value of type `fn(T): R` may be passed where `noescape fn(T): R` is expected — the callee's contract is more restrictive, which is safe. The reverse is not true: a `noescape fn` value may not be widened to `fn`.

**Storage prohibition.** A value of type `noescape fn(T): R` may not be stored in any position whose lifetime extends beyond the current call frame: no class fields, no struct fields, no module-level bindings, no `let`/`var` whose scope outlives the frame. Attempting to store a `noescape fn` value is a compile-time error.

**ARC semantics.** A `noescape fn` parameter is passed as a raw function pointer and captured environment pointer without ARC-retaining the closure object. For closures whose captures are all stack-resident values, the compiler may represent the entire closure on the stack with no heap allocation.

**Type aliases with `noescape fn`:**

```loom
type Predicate[T] = noescape fn(borrow T): bool;
type Transform[T, R] = noescape fn(borrow T): R;
type Action = noescape fn(): void;
```

These aliases are `@compiled --target native` only — using them outside that context is a compile-time error.

**`noescape fn` and `Callable[A, R]`.** `noescape fn` is not a subtype of the `Callable[A, R]` interface (§11.2). `Callable` is for escaping callable values that may be stored and called later. Non-escaping callable parameters are expressed via `noescape fn` types directly. A `list[noescape fn(int): void]` is a compile-time error.

### §4.5 Union Types

Union types express that a value may be one of several types without declaring a named enum:

```
let value: string | int = "hello";
let result: string | int | None = None;

func parse(input: string): int | float | None {
  // ...
}
```

**Semantics:**

- `A | B` is a type that can hold a value of type `A` or type `B`.
- Union types are **unordered**: `A | B` is the same type as `B | A`.
- Duplicate types are **collapsed**: `A | A` is just `A`.
- Nested unions are **flattened**: `(A | B) | C` is `A | B | C`.
- `T | None` is interchangeable with `Option[T]` — the compiler treats them as the same type.
- Union types are **structural**, not nominal — unlike enums, they don't need a declaration.

**Narrowing.** Union types can be narrowed via `match` (using type-based patterns) or `is`/`instanceof` checks in `if` statements:

```
func display(value: string | int | bool): string {
  return match value {
    string(s) => "string: {$ s $}",
    int(n)    => "int: {$ n $}",
    bool(b)   => if (b) { "true" } else { "false" },
  };
}

func process(value: string | int) {
  if (value is string) {
    // value is narrowed to string in this branch
    print(value.toUpper());
  } else {
    // value is narrowed to int in this branch
    print(value + 1);
  }
}
```

**Usage positions.** Union types may appear in function parameters, return types, variable declarations, field types, and generic type arguments:

```
class Config : Any {
  pub let value: string | int | bool;
}

func first[T](items: list[T | None]): T | None { ... }
```

**Common methods.** Calling a method that is common to all types in the union is permitted without narrowing. Calling a method that exists on only some types is a compile-time error.

**Union types in compiled mode.** Union values are represented as tagged values where the tag identifies the active type. All constituent types must be statically known. `Any` is not permitted as a union member in compiled mode.

**Relationship to enums.** Enums are nominal, closed, and declared — they define named variants with optional payloads. Union types are structural, open, and inline — they combine existing types without a declaration. Enums are preferred when variants have semantic meaning (e.g., `Shape`). Union types are preferred for ad-hoc "one of these types" situations (e.g., `string | int`). A union type cannot contain enum variants directly — use the enum type itself: `Shape | None`, not `Circle | Rect | None`.

### §4.6 Type Aliases

Type aliases give short names to complex types:

```
type UserId = string;
type Handler = fn(Request): Task[Response];
type JsonValue = string | int | float | bool | list[Any] | dict[string, Any] | None;
```

**Generic type aliases:**

```
type AppResult[T] = Result[T, AppError];
type AsyncResult[T] = Task[Result[T, AppError]];
type Pair[A, B] = tuple[A, B];
type Callback[T] = fn(T): void;
```

**Transparency.** Type aliases are fully transparent — they are interchangeable with the type they alias. A `UserId` is a `string` and a `string` is a `UserId`. The compiler treats them as the same type for assignment, dispatch, overload resolution, and type checking.

**Resolution.** Type aliases are resolved at compile time. They do not exist at runtime — `core.reflect.typeOf` on a value typed as `UserId` returns the `Type` for `string`, not a separate `UserId` type.

**Scope.** Type aliases may appear at module top level, inside class bodies, and inside struct bodies. Exported aliases use `pub type`:

```
pub type Handler = fn(Request): Task[Response];

class HttpClient : Any {
  type Response = HttpResponse;
  type Error = HttpError;

  pub func get(url: string): Task[Response] { ... }
}
```

**Recursion rejection.** The compiler SHALL detect and reject recursive type aliases that would create infinite expansion:

```
type Bad = list[Bad];   // compile-time error: recursive type alias
```

**Compiled mode.** Type aliases are permitted in both scripted and `@compiled` mode. In compiled mode, the aliased type must conform to compiled-mode restrictions.

### §4.7 `typeof` and `instanceof` Operators

Loom provides inline operators for type inspection as surface sugar over `core.reflect`:

**`typeof` operator.** Returns a `Type` value for any expression:

```
let t = typeof 42;              // Type for int
let t2 = typeof someObject;     // Type for the object's runtime type
let name = (typeof x).name;     // "int", "string", "MyClass", etc.
```

`typeof` can also be applied to types directly for compile-time type references:

```
let intType = typeof int;
let listType = typeof list[string];
if (typeof x == typeof int) { /* x is an int */ }
```

`typeof expr` returns the same `Type` value as `core.reflect.typeOf(expr)`.

**`instanceof` operator.** Checks whether a value is an instance of a given type:

```
if (x instanceof MyClass) {
  x.myMethod();  // x is narrowed to MyClass
}
```

`expr instanceof Type` returns `bool` — `true` if the runtime type of `expr` is `Type` or a subtype of `Type`. The compiler applies flow-sensitive type narrowing after `instanceof` checks:

```
func process(value: Any) {
  if (value instanceof string) {
    // value is narrowed to string here
    print(value.toUpper());
  } else if (value instanceof int) {
    // value is narrowed to int here
    print(value + 1);
  }
}
```

**Relationship between operators:**

- `x instanceof T` is equivalent to `core.reflect.is(x, T)`.
- `x is T` (from union type narrowing) is a synonym for `instanceof` — both are permitted.
- `typeof x` is equivalent to `core.reflect.typeOf(x)`.

`instanceof` works with union types, enums, interfaces, classes, structs, and primitives:

```
if (x instanceof Iterable[int]) { /* interface check */ }
if (x instanceof Shape) { /* enum type check */ }
if (x instanceof Point) { /* struct check */ }
```

**Negated checks.** Negated `instanceof` checks do NOT narrow the type — the variable retains its original type in the body:

```
if (!(x instanceof string)) {
  // x is NOT narrowed here — type remains unchanged
}
```

**Compiled mode.** `typeof` is permitted in `@compiled` mode — it returns compile-time-baked `Type` metadata. `instanceof` is permitted in compiled mode for concrete types where the check can be resolved to a tag comparison.

### §4.8 Generics

Loom supports generic type parameters on functions, classes, interfaces, enums, and structs:

```
func identity[T](x: T): T { return x; }

class Box[T] : Any {
  pub let value: T;
  new(value: T) { this.value = value; }
}

interface Container[T] {
  func get(): T;
  func set(value: T): void;
}

enum Tree[T] {
  Leaf(value: T),
  Node(left: Tree[T], right: Tree[T]),
}

struct Pair[A, B] {
  first: A;
  second: B;
}
```

**Constraints.** Type parameters may be constrained to types that implement specific interfaces:

```
func max[T: Comparable[T]](a: T, b: T): T {
  return a > b ? a : b;
}

class SortedList[T: Comparable[T]] : Any {
  // ...
}
```

**Reification.** Generics are reified at runtime — type parameters are available via reflection. `core.reflect.typeOf` on a `Box[int]` returns a `Type` whose `params()` includes the `Type` for `int`.

**Variance.** Generic types have the following variance rules:

- **Covariance** (`out T`): If `A` is a subtype of `B`, then `Container[A]` is a subtype of `Container[B]`. Used for read-only positions.
- **Contravariance** (`in T`): If `A` is a subtype of `B`, then `Consumer[B]` is a subtype of `Consumer[A]`. Used for write-only positions.
- **Invariance** (default): No subtyping relationship. Used when the type parameter appears in both read and write positions.

Variance annotations are optional; the compiler infers variance when possible.

**Type inference.** The compiler infers type arguments for generic function calls when they can be determined from the argument types:

```
let x = identity(42);        // T inferred as int
let y = identity("hello");   // T inferred as string
```

Explicit type arguments may be provided when inference is ambiguous:

```
let empty = Box[int](value=0);
```

See §12 for the full generics specification, including detailed rules for constraints, reification, variance, and inference across all declaration forms (functions, classes, interfaces, enums, and structs).

### §4.9 Tuple Type Details

Tuples are fixed-size, heterogeneous sequences with positional access:

```
let pair: tuple[int, string] = (42, "hello");
let triple: tuple[bool, float, string] = (true, 3.14, "pi");
```

**Element access** uses zero-based indexing with compile-time constant indices:

```
let first = pair.0;    // 42 : int
let second = pair.1;   // "hello" : string
```

**Destructuring:**

```
let (x, y) = pair;
let (a, b, c) = triple;
let (head, *rest) = (1, 2, 3, 4);  // head = 1, rest = (2, 3, 4)
```

**Single-element tuples** require a trailing comma to distinguish from parenthesized expressions:

```
let single = (42,);    // tuple[int]
let parens = (42);     // int (not a tuple)
```

Tuples have value semantics: two tuples are equal if all their elements are equal (structural equality). Tuples are hashable if all their elements are hashable.



---

## §5 Expressions

*(This section is normative.)*

### §5.1 Operator Semantics

Operators in Loom are defined on primitive types and may be extended to user-defined types through the `Comparable[T]` interface. This section specifies the semantics of every operator category.

#### Arithmetic Operators (`+`, `-`, `*`, `/`, `%`, `**`)

| Left | Op | Right | Result | Notes |
|---|---|---|---|---|
| `int` | `+` `-` `*` `/` `%` | `int` | `int` | `/` truncates toward zero; `%` follows truncation sign |
| `float` | `+` `-` `*` `/` `%` | `float` | `float` | IEEE 754 double-precision arithmetic |
| `int` | any | `float` | `float` | The `int` operand is promoted to `float` |
| `float` | any | `int` | `float` | The `int` operand is promoted to `float` |
| `string` | `+` | `string` | `string` | Concatenation |
| `list[T]` | `+` | `list[T]` | `list[T]` | Concatenation (produces a new list) |
| `int` | `**` | `int` | `int` | Integer exponentiation; negative exponent is a runtime error |
| `float` | `**` | `float` | `float` | Floating-point exponentiation |

Unary `-` negates `int` and `float` values. Unary `+` is the identity on `int` and `float`.

Division by zero (`/` or `%` with a zero right operand) throws a runtime error for `int` and produces IEEE 754 infinity or NaN for `float`.

#### Comparison Operators (`<`, `>`, `<=`, `>=`)

Comparison operators are available on types that implement the `Comparable[T]` interface (see §11.2):

```
interface Comparable[T] {
  func compareTo(other: T): int;
}
```

`compareTo` returns a negative `int` if `this < other`, zero if equal, and a positive `int` if `this > other`. The comparison operators desugar as follows:

- `a < b`  → `a.compareTo(b) < 0`
- `a > b`  → `a.compareTo(b) > 0`
- `a <= b` → `a.compareTo(b) <= 0`
- `a >= b` → `a.compareTo(b) >= 0`

Built-in `Comparable` implementations:

| Type | Ordering |
|---|---|
| `int` | Numeric ordering |
| `float` | IEEE 754 total ordering (NaN is unordered — comparisons involving NaN return `false`) |
| `string` | Lexicographic ordering over Unicode scalar values |
| `bytes` | Lexicographic ordering over byte values |

User-defined classes and structs may implement `Comparable[T]` to enable comparison operators. If a comparison operator is applied to a type that does not implement `Comparable[T]`, the compiler emits a compile-time error.

#### Equality Operators (`==`, `!=`)

Equality semantics depend on the type category:

- **Primitives** (`int`, `float`, `bool`, `string`, `bytes`): structural equality (value comparison).
- **Enums**: structural equality — same variant and same payload values (compared recursively).
- **Structs**: structural equality — all fields are equal (compared recursively).
- **Tuples**: structural equality — all elements are equal (compared recursively).
- **Classes**: if the class implements `Equatable[T]`, `==` calls `op_==(other)`. Otherwise, referential identity (two references equal only if they point to the same object). `Comparable[T]` implies `Equatable[T]` — implementing it provides `==` as `compareTo(other) == 0`, which may be overridden by an explicit `operator func ==`.
- `None == None` is `true`.

Equality is reflexive (`a == a`), symmetric (`a == b` implies `b == a`), and transitive (`a == b` and `b == c` implies `a == c`) for all types.

`!=` is always the logical negation of `==`.

**Consistency rule.** Implementing `Equatable[T]` on a type used as a `set[T]` element or `dict` key without also implementing `Hashable` is a compile-time error. Elsewhere, it is a compile-time warning.

#### Logical Operators (`and`, `or`, `not`)

- `a and b` — short-circuit: evaluates `b` only if `a` is `true`. Both operands must have type `bool`; result is `bool`.
- `a or b` — short-circuit: evaluates `b` only if `a` is `false`. Both operands must have type `bool`; result is `bool`.
- `not a` — logical negation. Operand must have type `bool`; result is `bool`.

Non-`bool` operands are a compile-time error. There is no truthy/falsy coercion.

#### Bitwise Operators (`&`, `|`, `^`, `bnot`, `<<`, `>>`)

Bitwise operators are defined on `int` only:

- `a & b` — bitwise AND
- `a | b` — bitwise OR
- `a ^ b` — bitwise XOR
- `bnot a` — bitwise NOT (unary)
- `a << n` — left shift by `n` bits
- `a >> n` — arithmetic right shift by `n` bits

Shift amounts must be non-negative; a negative shift amount is a runtime error.

#### Membership Operators (`in`, `not in`)

- `x in set` → `bool` (set membership)
- `key in dict` → `bool` (key membership)
- `sub in string` → `bool` (substring test)

#### Indexing (`[]`)

- `list[i]` → element at index `i` (0-based). Negative indices count from the end. Out-of-range throws `IndexError`.
- `dict[key]` → value for `key`. Missing key throws `KeyError`.
- `string[i]` → `char` at index `i` (Unicode scalar value).
- `bytes[i]` → `uint8` byte value at index `i`.
- `tuple[i]` → element at compile-time constant index `i`.

#### Operator Overloading

Loom supports user-defined operator overloading via the **operator interface protocol**. When `a + b` is evaluated and `a` is not a built-in numeric/string/collection type, the compiler looks up the `Add` interface on the type of `a`. If found, `a + b` desugars to `a.op_+(b)`. If not found, a compile-time error is emitted.

**Desugar rules for binary operator expressions:**

| Expression | Desugars to | Interface required |
|---|---|---|
| `a + b` | `a.op_+(b)` | `Add[typeof b, R]` |
| `a - b` | `a.op_-(b)` | `Sub[typeof b, R]` |
| `a * b` | `a.op_*(b)` | `Mul[typeof b, R]` |
| `a / b` | `a.op_/(b)` | `Div[typeof b, R]` |
| `a % b` | `a.op_%(b)` | `Mod[typeof b, R]` |
| `a // b` | `a.op_floordiv(b)` | `FloorDiv[typeof b, R]` |
| `a ** b` | `a.op_**(b)` | `Pow[typeof b, R]` |
| `-a` | `a.op_neg()` | `Neg` |
| `a & b` | `a.op_band(b)` | `BitAnd[typeof b, R]` |
| `a \| b` | `a.op_bor(b)` | `BitOr[typeof b, R]` |
| `a ^ b` | `a.op_xor(b)` | `BitXor[typeof b, R]` |
| `bnot a` | `a.op_bnot()` | `BitNot` |
| `a << b` | `a.op_shl(b)` | `Shl[typeof b, R]` |
| `a >> b` | `a.op_shr(b)` | `Shr[typeof b, R]` |
| `a[k]` | `a.op_index(k)` | `Index[typeof k, V]` |
| `a[k] = v` | `a.op_index_set(k, v)` | `IndexSet[typeof k, typeof v]` |
| `x in a` | `a.op_contains(x)` | `Contains[typeof x]` |
| `a(arg)` | `a.op_call(arg)` | `Callable[typeof arg, R]` |

Built-in types satisfy these interfaces implicitly — the compiler emits specialised instructions for performance, but the semantic contract is identical.

**Augmented assignment desugar.** `x += y` desugars to `x = x + y`. If a class also defines an explicit `operator func +=`, that definition is used instead:

```
class BigInt : Any implements Add[BigInt] {
  pub operator func +(other: BigInt): BigInt { ... }
  pub operator func +=(other: BigInt): void { ... }  // explicit in-place override
}
```

Explicit augmented assignment override is **classes only**. Writing `operator func +=` (or any augmented assignment override) on a struct is a compile-time error. Augmented assignment on struct values is always auto-derived as `x = x + y`.

**Non-overloadable operators.** The following operators cannot be overloaded:

| Operator | Reason |
|---|---|
| `and`, `or`, `not` | Short-circuit evaluation must be preserved |
| `??` | Semantics defined by `Option[T]` |
| `?` (propagation) | Semantics defined by `Result[T,E]` |
| `=` (assignment) | Must always mean binding |
| `.`, `?.` | Member access must remain unambiguous |
| `typeof`, `instanceof`, `is` | Type system operations |
| `as`, `as?` | Type narrowing operations |
| `box` | Type widening operation |

No custom operator symbols are permitted. Only the existing operator set is extensible.

### §5.2 Comprehensions

Loom supports list, dict, and set comprehensions for concise collection construction.

**List comprehensions** produce `list[T]` where `T` is inferred from the expression before `for`:

```
let squares = [x * x for x in range(10)];
let evens = [x for x in range(100) if x % 2 == 0];
let pairs = [(x, y) for x in range(3) for y in range(3)];
```

**Dict comprehensions** produce `dict[K, V]` where `K` and `V` are inferred from the key and value expressions:

```
let index = {name: i for (i, name) in names.enumerate()};
let upper = {k: v.toUpper() for (k, v) in headers.entries()};
let filtered = {k: v for (k, v) in entries if v > 0};
```

**Set comprehensions** produce `set[T]` where `T` is inferred from the expression. Set comprehensions use `{ expr for ... }` (single expression, no colon) to distinguish from dict comprehensions (`{ key: value for ... }`):

```
let unique_lengths = {s.len() for s in words};
let remainders = {x % 10 for x in numbers};
```

**Filters.** All comprehension forms support optional `if` filters after each `for` clause. The filter expression must have type `bool`:

```
let adults = [p.name for p in people if p.age >= 18];
```

**Nested `for` clauses.** Multiple `for` clauses iterate in left-to-right order (the leftmost `for` is the outer loop):

```
let flat = [cell for row in matrix for cell in row];
// equivalent to:
// var __result: list[T] = [];
// for (row in matrix) { for (cell in row) { __result = __result + [cell]; } }
```

**Destructuring** in the iteration variable is supported:

```
let values = [v for (k, v) in dict.entries()];
```

**Desugaring.** Comprehensions are surface sugar for equivalent `for` loops with accumulation. They desugar before type-checking and do not introduce new runtime primitives. For any list comprehension `[expr for x in xs if cond]`, the result equals the list produced by:

```
{
  var __result: list[T] = [];
  for (x in xs) {
    if (cond) {
      __result = __result + [expr];
    }
  }
  __result
}
```

**Async comprehensions.** Comprehensions may contain `await` in the expression or filter when the enclosing context is async:

```
let results = [await fetch(url) for url in urls];
```

A comprehension containing `await` requires the enclosing context to be async. Iteration is sequential (one `await` per iteration), not concurrent — use `TaskGroup.collect` for concurrent execution (see §17.3).

**Template expressions.** Comprehensions are permitted inside template inline expressions:

```
{$ [item.name for item in items] | join(", ") $}
```

**Compiled mode.** Comprehensions are permitted in `@compiled` mode — they desugar to statically-typed loops with no `Any` or reflection involved. The element, key, and value types must be statically known.

Comprehensions eagerly build the full collection. For lazy evaluation, use generator expressions (see §7.5).

### §5.3 Slicing

Loom supports Python-style slice syntax on indexable types:

```
let items = [10, 20, 30, 40, 50];
let sub = items[1:4];          // [20, 30, 40]
let every2 = items[0:5:2];    // [10, 30, 50]
let tail = items[2:];          // [30, 40, 50]
let head = items[:3];          // [10, 20, 30]
let copy = items[:];           // [10, 20, 30, 40, 50] (shallow copy)
let rev = items[::-1];         // [50, 40, 30, 20, 10]
```

**Negative indices** count from the end:

```
let last2 = items[-2:];        // [40, 50]
let noEnds = items[1:-1];      // [20, 30, 40]
```

**Supported types:**

| Type | Slice Result |
|---|---|
| `list[T]` | `list[T]` |
| `string` | `string` (operates on Unicode scalar values — NOT bytes, NOT grapheme clusters) |
| `bytes` | `bytes` |
| `tuple[...]` | `tuple[...]` (only when start/end are compile-time constants) |

**Slice bounds behavior:**

- `start` defaults to `0` if omitted.
- `end` defaults to `len(collection)` if omitted.
- `step` defaults to `1` if omitted.
- Out-of-range indices are **clamped** to valid bounds without error (matching Python semantics).
- A `step` of `0` is a runtime error.
- Negative `step` reverses iteration direction.

**Slice assignment** on mutable collections:

```
var items = [1, 2, 3, 4, 5];
items[1:3] = [20, 30, 40];    // items = [1, 20, 30, 40, 4, 5]
items[2:] = [];                // items = [1, 20]
```

Slice assignment is only valid on `var` bindings of `list[T]`. The replacement list element type must be assignable to `T`.

**Negative indexing** (single element, not a slice):

```
let last = items[-1];          // last element
let secondLast = items[-2];
```

Out-of-range negative indices throw `IndexError`.

**String slicing performance.** Because UTF-8 is variable-width, string slicing requires scanning from the beginning to find byte boundaries and is O(n) in the string length. For byte-level slicing, convert to `bytes` first: `core.text.toBytes(s)[a:b]`. For grapheme-level slicing, use `core.text.graphemeSlice(s, a, b)` (§21.1).

Slicing is permitted in template expressions (`{$ name[:10] $}`) and in `@compiled` mode.

### §5.4 Ternary Expression

The ternary conditional expression provides concise inline branching:

```
let label = count > 0 ? "items" : "empty";
let abs = x >= 0 ? x : -x;
let display = user != None ? user.name : "Anonymous";
```

**Rules:**

- `cond` must have type `bool`; a non-`bool` condition is a compile-time error.
- `then_expr` and `else_expr` must have a compatible type. The result type is the common supertype of both branches. With union types, the result may be `A | B` if the branches have different types.
- Only the selected branch is evaluated (short-circuit).
- Ternary expressions are right-associative: `a ? b : c ? d : e` parses as `a ? b : (c ? d : e)`.
- Nested ternaries are permitted but the compiler MAY emit a style warning for deeply nested ternaries recommending `match` or `if`/`else`.
- Ternary expressions are valid anywhere an expression is valid: variable initializers, function arguments, return values, template expressions, comprehensions.
- Permitted in `@compiled` mode.

### §5.5 Null-Safe Indexing

Null-safe indexing allows safe element access on optional collections:

```
let items: list[int]? = Some([10, 20, 30]);
let first = items?.[0];          // Option[int] — Some(10)

let empty: list[int]? = None;
let missing = empty?.[0];        // Option[int] — None
```

**Null-safe slicing:**

```
let sub = items?.[1:3];          // Option[list[int]] — Some([20, 30])
let none = empty?.[1:3];         // Option[list[int]] — None
```

**Chaining:**

```
let name = users?.[0]?.profile?.displayName ?? "Unknown";
```

**Desugaring.** `expr?.[index]` desugars to:

```
match expr {
  Some(v) => Some(v[index]),
  None    => None,
}
```

The result type is `Option[T]` where `T` is the element type of the indexed collection.

**Index errors are not suppressed.** `?.` only guards against the collection itself being `None`. If the collection exists (`Some`) but the index is out of range, the runtime throws `IndexError`.

**Dict support:**

```
let config: dict[string, int]? = Some({"port": 8080});
let port = config?.["port"];     // Option[int] — Some(8080)
```

Permitted in `@compiled` mode.

### §5.6 Optionality Sugar

As a convenience, the following shorthand forms are available:

| Sugar | Desugars to |
|---|---|
| `T?` | `Option[T]` |
| `expr?.member` | `match expr { Some(v) => Some(v.member), None => None }` |
| `expr?.method(args)` | `match expr { Some(v) => Some(v.method(args)), None => None }` |
| `expr ?? default` | `match expr { Some(v) => v, None => default }` |

**Rules:**

- `T?` is syntactic sugar only; the underlying type is always `Option[T]`. Reflection, type errors, and interface checks refer to the desugared form.
- `?.` chains preserve the `Option` wrapper: `a?.b?.c` has type `Option[C]`, not `C`.
- `??` unwraps the `Option`; its right-hand side is evaluated lazily (only if the left-hand side is `None`).
- `?.` and `??` do not interact with `Result[T,E]`; use `match` or `?` propagation for result types.
- These forms desugar before type-checking.

```
let name: string = user?.profile?.displayName ?? "Anonymous";
let port: int = config("PORT")?.let(parseInt) ?? 8080;
```

### §5.7 `?` Propagation Operator

The postfix `?` operator propagates errors out of the enclosing function. It may only appear inside a function whose return type is `Result[T, E]`:

```
func process(path: string): Result[string, AppError] {
  let raw = readText(path)?;       // readText returns Result[string, IoError]
  let parsed = parse(raw)?;        // parse returns Result[Data, ParseError]
  return Ok(transform(parsed));
}
```

**Semantics:**

- If `expr` evaluates to `Ok(v)`, the `?` expression evaluates to `v` (the unwrapped success value).
- If `expr` evaluates to `Err(e)`, the enclosing function returns `Err(F.from(e))` immediately, where `F` is the enclosing function's error type.
- Error conversion uses the `From[E]` interface: `F.from(e)` converts error `e` of type `E` to the enclosing function's error type `F`. If `E == F`, the identity conversion is used.
- If no `From[E]` implementation exists for the required conversion, the compiler emits a compile-time error.

**The `From[E]` interface:**

```
interface From[E] {
  static func from(err: E): Self;
}
```

User-defined error types implement `From[E]` to enable automatic conversion:

```
class AppError implements From[IoError], From[ParseError] {
  pub let message: string;
  pub let cause: Option[Any];

  static func from(err: IoError): Self {
    return AppError(message: "IO: {$ err.message $}", cause: Some(err));
  }

  static func from(err: ParseError): Self {
    return AppError(message: "Parse: {$ err.message $}", cause: Some(err));
  }
}
```

**Restrictions:**

- `?` may only appear on expressions of type `Result[T, E]`. Using `?` on a non-`Result` type is a compile-time error.
- `?` may only appear inside a function whose return type is `Result[T, F]` for some `T` and `F`. Using `?` at the top level or inside a function returning a non-`Result` type is a compile-time error.
- `?` works in both synchronous and `async` functions, provided the return type is `Result[T, E]` (or `Task[Result[T, E]]` for async).
- `?` interacts correctly with `defer` — deferred actions execute before the early return propagates.
- `?` is permitted in `@compiled` mode.

### §5.8 Spread Operators

The spread operators `*` and `**` expand collections in call sites and collection literals.

**Positional spread (`*`) in calls:**

```
let args = [1, 2, 3];
f(*args);                    // equivalent to f(1, 2, 3)
```

**Keyword spread (`**`) in calls:**

```
let opts = {"timeout": 5000, "retries": 3};
request(url, **opts);        // equivalent to request(url, timeout=5000, retries=3)
```

**Spread in collection literals:**

```
// List spread
let a = [1, 2];
let b = [3, 4];
let combined = [0, *a, *b, 5];   // [0, 1, 2, 3, 4, 5]

// Dict spread (later entries override earlier on key collision)
let defaults = {"host": "localhost", "port": 8080};
let config = {**defaults, "port": 9090};  // {"host": "localhost", "port": 9090}

// Dict merge
let merged = {**defaults, **overrides};

// Set spread
let s1 = {1, 2, 3};
let s2 = {3, 4, 5};
let all = {*s1, *s2};            // {1, 2, 3, 4, 5}
```

**Equivalence.** For any list `xs` and function call `f(*xs)`, the call is equivalent to passing each element of `xs` as a separate positional argument. For any dict `d` and call `f(**d)`, the call is equivalent to passing each entry as a keyword argument.

**Type-checking rules:**

- `*expr` in a call requires `expr` to have type `list[T]` where `T` is assignable to the expected parameter types at the spread position.
- `**expr` in a call requires `expr` to have type `dict[string, T]` where `T` is assignable to the expected keyword parameter types.
- `*expr` in a list literal requires `expr` to have type `list[T]` (or `Iterable[T]`); the resulting list element type is the union of all element types.
- `**expr` in a dict literal requires `expr` to have type `dict[K, V]`.
- `*expr` in a set literal requires `expr` to have type `set[T]` (or `Iterable[T]`).

**Compiled mode.** Spread operators are permitted in `@compiled` mode provided all types are statically known. `**kwargs` with type `dict[string, Any]` is prohibited in compiled mode since `Any` is not available (see §22.2).

---

## §6 Statements and Control Flow

*(This section is normative.)*

### §6.1 Blocks and Scope

Blocks are delimited by braces `{ ... }` and introduce lexical scope. Declarations within a block are visible after their point of declaration. Inner bindings shadow outer bindings of the same name.

```
let x = 1;
{
  let x = 2;    // shadows outer x
  print(x);     // 2
}
print(x);       // 1 — outer x is restored
```

### §6.2 Variable Declarations

**`let` declarations** create immutable bindings:

```
let name: string = "Alice";
let age = 30;                  // type inferred as int
```

Attempting to reassign a `let` binding is a compile-time error.

**`var` declarations** create mutable bindings:

```
var count: int = 0;
count = count + 1;             // ok
```

**Type annotations** are optional when the type can be inferred from the initializer. When no initializer is provided, a type annotation is required:

```
let x = 42;                   // inferred as int
var name: string;              // declared but uninitialized — must be assigned before use
```

**Destructuring declarations.** Both `let` and `var` support destructuring patterns for tuples, lists, and dicts. See §6.8 for full destructuring syntax and semantics.

### §6.3 Conditionals

```
if (cond1) {
  // ...
} else if (cond2) {
  // ...
} else {
  // ...
}
```

The condition expression must have type `bool`. If the condition is statically known to not be `bool`, the compiler emits a compile-time error. If the condition is dynamically not `bool`, the runtime throws a `TypeError`.

### §6.4 Loops

**`while` loop:**

```
while (cond) {
  // ...
}
```

**C-style `for` loop:**

```
for (let i = 0; i < n; i = i + 1) {
  // ...
}
```

**`for-in` loop** (iterates any `Iterable[T]`):

```
for (x in items) {
  // ...
}
```

The binding `x` is `let` (immutable) by default. Use `for (var x in items)` for a mutable binding. See §11.3 for the iteration protocol and desugaring.

**`do-while` loop:**

```
do {
  // ...
} while (cond);
```

Note: `do { ... } while (cond);` includes a trailing `;` as part of its syntax.

**Labels.** A label may be attached immediately before a loop:

```
outer: for (let i = 0; i < n; i = i + 1) {
  inner: for (let j = 0; j < m; j = j + 1) {
    if (found(i, j)) { break outer; }
  }
}
```

`break label;` exits the labeled loop. `continue label;` goes to that loop's next iteration (running any `defer`s on the way out). Labels have their own namespace and do not conflict with variable names. Referencing an unknown label is a compile-time error.

### §6.5 Defer

`defer` registers cleanup actions that run when the current lexical block ends (via fallthrough, `return`, `break`, `continue`, or exception). Multiple `defer`s execute in LIFO (last-in, first-out) order.

**Call form** (simple statement):

```
defer close(handle);
```

**Block form** (block statement):

```
defer {
  log("leaving scope");
  cleanup();
}
```

**Async defers.** In async code, deferred actions may themselves use `await`; scope exit awaits each deferred action to completion in LIFO order.

**Exception handling.** Exceptions inside a deferred action propagate unless caught by an outer `try`/`catch`.

### §6.6 `with` (Scoped Resources)

The `with` statement provides deterministic resource management via the `Scoped[T]` protocol (see §11.2):

```
with (fh = runtime.fs.open("out.txt")) {
  fh.write("ok");
} // fh is closed at block end
```

**Execution semantics:**

1. Evaluate the expression to get the context manager (must implement `Scoped[T]`).
2. Call `scope_enter()` on the context manager; bind the result to the variable.
3. Execute the block body.
4. Call `scope_exit(error)` on the context manager, passing `None` if the block completed normally or `Some(err)` if an exception was thrown.
5. If `scope_exit` returns `true` and an exception occurred, the exception is suppressed.
6. If `scope_exit` returns `false` and an exception occurred, the exception propagates.
7. If `scope_exit` itself throws, its exception replaces the original.

The binding type is `T` (the return type of `scope_enter()`), not the type of the expression. This allows context managers to return a different value for use inside the block:

```
class TransactionManager : Any implements Scoped[Transaction] {
  let db: Database;
  new(db: Database) { this.db = db; }

  pub func scope_enter(): Transaction {
    return db.begin();
  }

  pub func scope_exit(error: Option[Any]): bool {
    match error {
      None    => { db.commit(); return true; },
      Some(e) => { db.rollback(); return false; },
    }
  }
}

with (tx = TransactionManager(db)) {
  tx.execute("INSERT INTO users VALUES ('alice')");
}
```

**Multiple bindings** are entered left-to-right and exited right-to-left (LIFO):

```
with (a = openFile("in.txt"), b = openFile("out.txt")) {
  b.write(a.readAll());
}
```

If an inner `scope_enter()` fails, already-entered context managers have their `scope_exit` called.

**`Closeable` types** (e.g., `FileHandle`, `TcpStream`) automatically satisfy `Scoped[Self]` with a default implementation where `scope_enter()` returns `this` and `scope_exit(error)` calls `this.close()` and returns `false` (never suppresses exceptions). This means existing `Closeable` types work with `with` blocks without implementing `Scoped` explicitly.

**Async context managers** use `AsyncScoped[T]` (see §11.2). The runtime `await`s both `scope_enter()` and `scope_exit()`.

**Compiled mode.** `Scoped[T]` and `AsyncScoped[T]` are permitted in `@compiled` mode — the protocol is statically dispatched. The `error` parameter type `Option[Any]` in `scope_exit` is permitted as a special case since it only carries exception values at the protocol boundary.

### §6.7 Portal Statement

`portal` injects a named activation point for tracing and time-travel debugging:

```
portal request_start {
  // ...
}

portal "checkout.enter" {
  // ...
}
```

**Rules (common to both modes):**

- `portal name { ... }` is a block statement.
- `name` may be an identifier or string literal. Portal names are runtime strings.
- Duplicate portal names are permitted for explicit `portal` blocks and implicit callable-entry portals. This is distinct from `@webcomponent` tag names (§19.10), which must be unique within a compilation unit.
- All named functions and methods are **implicit portals** at entry, with stable fully-qualified portal names derived from the module path and callable name (e.g., `"myapp.server.handleRequest"`).
- Explicit `portal` statements and implicit callable portals share a single activation registry maintained by the runtime host.
- If a portal is entered and no matching activation exists, it is observationally inert — the body executes normally with zero overhead.
- If a portal is entered and a matching activation exists with a true condition, the runtime activates tracing for the current task.

**Portal names in compiled code.** In `@compiled` files, portal names are resolved from the static metadata table (see §20.3) registered at module load time. The fully-qualified callable name for implicit portals is available via `core.reflect.callableName(f)` (§21.11).

**Two-tier condition model:**

*Scripted mode — full lexical scope evaluation.* Conditions in `activatePortal` calls against scripted portals are Loom expressions parsed and evaluated in the lexical environment of the target portal at activation time. The full scope of the portal's enclosing function is available:

```
// Scripted portal condition — full lexical scope accessible
runtime.debug.activatePortal("myapp.server.handleRequest",
  condition="request.userId == \"admin\" and request.method == \"DELETE\"");
```

*Compiled mode — parameter-and-constant predicates only.* Conditions for compiled portals are restricted to predicate expressions over the portal function's parameters and module-level constants. Dynamic lexical scope evaluation is unavailable in compiled code. The condition is type-checked at activation time against the function's static signature from the metadata table; a type mismatch throws `CapabilityError`:

```
// Compiled portal condition — parameters and constants only
runtime.debug.activatePortal("myapp.geo.distance",
  condition="a.x > 100.0");    // a and b are the function's parameters
```

The runtime identifies whether a portal is scripted or compiled from the module's metadata table registration and applies the appropriate condition evaluation strategy. Attempting a full lexical-scope condition against a compiled portal throws `CapabilityError` with a diagnostic message.

**Portal statement in `@compiled` mode.** Explicit `portal` blocks are syntactically and semantically permitted in `@compiled` files. They register with the shared runtime activation registry on module load. The body executes in all cases; tracing is activated when a matching registry entry exists with a true condition.

### §6.8 Destructuring

Loom supports destructuring in declarations, assignments, function parameters, loops, and match arms.

**Tuple destructuring:**

```
let (x, y, z) = (1, 2, 3);
let (first, *rest) = (1, 2, 3, 4);   // first = 1, rest = (2, 3, 4)
let (a, _, c) = triple;               // _ discards the second element
```

**List destructuring:**

```
let [head, *tail] = [1, 2, 3, 4];    // head = 1, tail = [2, 3, 4]
let [a, b] = pair;                     // runtime DestructureError if length != 2
let [first, _, third] = items;
```

**Dict destructuring:**

```
let {"host": host, "port": port} = config;
let {"name": name, **rest} = record;  // rest is a dict with remaining keys
let {"host": host, "port": port = 8080} = config;  // default value
```

**Nested destructuring:**

```
let (name, (x, y)) = ("origin", (0.0, 0.0));
let {"user": {"name": name, "age": age}} = response;
```

**In loops:**

```
for ((key, value) in dict.entries()) { /* ... */ }
for ((index, item) in items.enumerate()) { /* ... */ }
for await ((id, result) in stream) { /* ... */ }
```

**In function parameters:**

```
func distance((x1, y1): tuple[float, float], (x2, y2): tuple[float, float]): float {
  return ((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1)).sqrt();
}
```

**Destructuring assignment:**

```
var a = 0;
var b = 0;
(a, b) = (b, a);   // swap
```

**Type checking:**

- Tuple destructuring requires matching arity (or `*rest` for overflow).
- List destructuring checks at runtime; length mismatch throws `DestructureError`.
- Dict destructuring checks keys at runtime; missing keys without defaults throw `DestructureError`.
- All bound names receive inferred types from the destructured value's type.

Destructuring is permitted in `@compiled` mode — all types must be statically known.

### §6.9 `try`/`catch`/`finally`

```
try {
  let data = runtime.fs.readText(path);
  process(data);
} catch (IoError as e) {
  log("read failed: {$ e.message $}");
} catch (TypeError | MatchError as e) {
  log("type/match error: {$ e.message $}");
} finally {
  cleanup();
}
```

**Execution order:**

1. If the `try` body completes normally, `finally` runs, then execution continues after the `try` statement.
2. If the `try` body throws and a `catch` arm matches, the `catch` body runs, then `finally` runs.
3. If the `try` body throws and no `catch` arm matches, `finally` runs, then the exception propagates.
4. If a `catch` body throws, `finally` runs, then the new exception propagates.
5. `finally` always runs exactly once per `try` entry.

**`try`/`finally` without `catch`** is valid — the `finally` block runs whether or not an exception occurred, and any exception propagates after `finally` completes.

**`finally` restrictions:**

- If the `finally` block itself throws, its exception replaces any pending exception. The original exception is attached as the `cause` of the new exception (see §6.10).
- `return`, `break`, and `continue` inside a `finally` block are compile-time errors — `finally` must not alter the control flow of the enclosing `try` statement.

**Interaction with `defer`.** `defer` actions registered inside a `try` body run before the `catch` handler (as part of the `try` block's scope exit). `finally` runs after both the `try` scope (including defers) and any `catch` handler.

**Async `finally`.** `finally` blocks may contain `await` in async contexts. The runtime awaits the `finally` block to completion before propagating any exception.

**Multi-type catch.** `catch` supports multi-type patterns: `catch (TypeError | MatchError as err)`.

**Bare catch.** A `catch` clause without a type filter is equivalent to `catch (Exception as err)` — it catches all `Exception` subtypes but does NOT catch `BaseException`-only subtypes (`SystemExit`, `KeyboardInterrupt`, `GeneratorExit`). To catch everything, use `catch (BaseException as err)`. See §25.5 for full catch semantics.

### §6.10 Exception Chaining

All exception types carry an optional `cause` property of type `Option[Any]` that links to the underlying exception:

**Explicit chaining with `throw from`:**

```
try {
  let data = runtime.fs.readText(path);
} catch (IoError as e) {
  throw AppError("failed to load config") from e;
  // AppError.cause == Some(e)
}
```

`throw expr from cause_expr;` constructs the exception with `cause` set to `Some(cause_expr)`.

**Implicit chaining.** When a `catch` body throws a new exception without `from`, and the original exception is still in scope, the runtime automatically sets the new exception's `cause` to the caught exception. This can be suppressed with `throw expr from None;`.

**Cause chain traversal:**

```
func printChain(err: Any): void {
  var current: Option[Any] = Some(err);
  while (current != None) {
    match current {
      Some(e) => {
        print("Caused by: {$ e $}");
        current = e.cause ?? None;
      },
      None => {},
    }
  }
}
```

The runtime's default error reporting (uncaught exceptions, unhandled task failures) prints the full cause chain.

Exception chaining is permitted in `@compiled` mode — `cause` is typed as `Option[Any]` which is permitted at the error boundary.

### §6.11 `del` Statement

The `del` statement provides deterministic finalization for objects implementing the `Finalizable` interface (see §8.9):

```
let handle = NativeResource.open("data.bin");
// ... use handle ...
del handle;   // calls handle.finalize() immediately, then unbinds the name
```

**Rules:**

- `del expr;` is a simple statement.
- `expr` must evaluate to a value that implements `Finalizable`; otherwise it is a compile-time error.
- `del` calls `finalize()` immediately and synchronously.
- After `del`, the binding is considered uninitialized — any subsequent use of the name is a compile-time error (similar to use-after-move).
- `del` on an already-finalized object calls `finalize()` again — it is the implementer's responsibility to make `finalize()` idempotent.
- `del` does NOT deallocate memory — the GC still manages memory. `del` only triggers the cleanup logic.
- `del` on fields: `del obj.field;` calls `finalize()` on the field value and sets the field to an uninitialized state (the field must be `var`, not `let`).
- `del` on collection elements is not supported — remove the element from the collection and `del` the value separately.

The compiler SHALL emit a warning when a `Finalizable` object goes out of scope without being passed to `del`, used in a `with` block, or passed to another owner.

**Relationship to `Closeable` and `Scoped[T]`.** `Closeable` types that also implement `Finalizable` should call `close()` from `finalize()` as a safety net. `with`/`Scoped[T]` is preferred for scope-aligned lifetimes; `del` is preferred for non-scope-aligned lifetimes; GC finalization is the last resort when neither `with` nor `del` was used.

`del` is permitted in `@compiled` mode.

### Statement Classification

Loom distinguishes **simple statements** and **block statements**:

- **Simple statements** end with `;`.
- **Block statements** do NOT end with `;`.

**Simple statements:** `let`/`var` declarations, expression statements, `break`, `continue`, `return`, `throw`, `import`, `defer` (call form), `del`, `pub from ... import`.

**Block statements:** `if`/`else`, `while`, `for`, `for-in`, `for await`, `do-while`, `try`/`catch`/`finally`, `with`, `defer` (block form), `dynamic ... as`, `portal`, `match`, `await group`, function declarations, class declarations, enum declarations, interface declarations, struct declarations.

Note: `do { ... } while (cond);` is a block statement that includes a trailing `;` as part of its construct syntax.



---

## §7 Functions and Closures

*(This section is normative.)*

### §7.1 Function Declarations

Loom supports four function declaration forms:

**Synchronous function:**

```
func add(a: int, b: int): int {
  return a + b;
}
```

**Async function:**

```
async func fetchUser(id: string): Task[User] {
  let response = await runtime.net.get("/users/{$ id $}");
  return parseUser(await response.json());
}
```

- `async func name(...): T { ... }` declares a function whose call result is `Task[T]`.
- Calling an async function starts the task immediately and returns its `Task[T]`.
- `await expr` requires `expr` to have type `Task[T]`; it suspends the current async context until the task completes and then evaluates to `T`.
- If the awaited task has failed, `await` rethrows the failure at the await site.
- `await` is permitted inside `async func` bodies, entry scripts, REPL sessions, and async template rendering contexts.
- `await` is prohibited during module initialization (imported modules may not suspend during initialization).

**Generator function:**

```
gen func fibonacci(): Iterable[int] {
  var a = 0;
  var b = 1;
  while (true) {
    yield a;
    let next = a + b;
    a = b;
    b = next;
  }
}
```

See §7.5 for full generator semantics.

**Async generator function:**

```
async gen func fetchPages(urls: list[string]): AsyncIterable[string] {
  for (url in urls) {
    let response = await runtime.net.get(url);
    yield await response.text();
  }
}
```

**Rules common to all functions:**

- `try`/`catch`, `finally`, `defer`, and lexical scope behave identically across suspension as in synchronous code.
- Functions that do not call `Task[T]`-returning APIs remain entirely synchronous; `async`/`await` is adopted incrementally.
- Function declarations are block statements (no trailing `;`).

**`operator` method modifier.** A method may be annotated with the `operator` modifier to declare that it implements a specific operator interface slot:

```
struct Vec2 implements Add[Vec2], Sub[Vec2], Neg {
  x: float;
  y: float;

  pub operator func +(other: Vec2): Vec2 =>
    Vec2(x=x + other.x, y=y + other.y);

  pub operator func -(other: Vec2): Vec2 =>
    Vec2(x=x - other.x, y=y - other.y);

  pub operator func -(): Vec2 =>
    Vec2(x=-x, y=-y);
}

let a = Vec2(x=1.0, y=2.0);
let b = Vec2(x=3.0, y=4.0);
let c = a + b;   // Vec2(x=4.0, y=6.0) — desugars to a.op_+(b)
```

**Rules for `operator func`:**

- `operator func` is valid only inside interface bodies, class bodies, and struct bodies.
- The method name must be one of the operator symbols defined in §11.2, or `contains` (for `Contains[T]`).
- The method must satisfy the signature required by the corresponding operator interface.
- Implementing an operator interface without declaring the corresponding `operator func` is a compile-time error.
- Declaring `operator func` without `implements OperatorInterface` is a compile-time error.
- `operator func` is permitted in `@compiled` mode.

**`borrow` parameter modifier.** Prefixing a parameter declaration with `borrow` asserts that the caller's binding of that value is guaranteed to outlive the function call. The compiler elides the ARC `retain()` on entry and `release()` on exit for that parameter. `borrow` is valid only in `@compiled` files targeting `--target native`.

```loom
@compiled

// Without borrow — ARC retains config on call, releases on return
func processConfig(config: Config): Result[void, AppError] {
  return validateFields(config);
}

// With borrow — zero ARC overhead
func processConfig(borrow config: Config): Result[void, AppError] {
  return validateFields(borrow config);
}
```

**`borrow` parameter rules:**

- A `borrow` parameter has the same declared type as its non-borrow equivalent. Callers pass values normally.
- Within the function body, a `borrow` value may be: read, called (if a function), indexed, passed to another `borrow` parameter, or passed to a `noescape fn` parameter.
- A `borrow` value may NOT be: stored in a class field, struct field, or module-level binding; returned as an owned value; passed to an escaping `fn` parameter; or used as a `spawn` argument.

```loom
@compiled

func processConfig(borrow config: Config): Result[void, AppError] {
  let name = config.name;         // OK — read
  validate(borrow config);        // OK — pass to borrow param
  GlobalCache.store(config);      // COMPILE-TIME ERROR — escapes frame
  let t = spawn process(config);  // COMPILE-TIME ERROR — task outlives frame
  return Ok(());
}
```

**`borrow` and `noescape fn` together.** The combination produces zero ARC activity on hot iteration paths:

```loom
@compiled

func forEach[T](borrow items: list[T], body: noescape fn(borrow T): void): void {
  for (item in items) {
    body(borrow item);
  }
}

func filter[T](borrow items: list[T], pred: noescape fn(borrow T): bool): list[T] {
  var result = list[T]();
  for (item in items) {
    if (pred(borrow item)) { result = result + [item]; }
  }
  return result;
}
```

**`borrow` on struct fields.** A struct field declared with `borrow` holds a non-owning reference. The struct cannot outlive the source data:

```loom
@compiled

struct TokenStream {
  borrow source: string;
  pos: int;

  pub func peek(): string? {
    if (pos >= source.len()) { return None; }
    return Some(source[pos:pos+1]);
  }

  pub func remaining(): string => source[pos:];
}

func tokenise(borrow input: string): list[string] {
  var stream = TokenStream(source=input, pos=0);
  var tokens = list[string]();
  while (stream.peek() != None) {
    let tok = readNext(borrow stream);
    tokens = tokens + [tok];
  }
  return tokens;
}
```

`borrow` on a struct field is valid only in `@compiled` files targeting `--target native`. `borrow` and `weak`/`unowned` are mutually exclusive on a single field.

**`borrow[~name]` — Tracked Lifetime References**

The plain `borrow` modifier above is a frame-escape constraint: the compiler verifies the borrowed value does not outlive the call and elides ARC activity. It carries no lifetime identity and requires no annotation beyond the keyword itself.

When a non-owning reference must flow beyond the call frame — as a return value, stored in a struct field that is returned, or as a variant payload in a returned enum — a lifetime label records which source region the reference comes from. The compiler uses this label to verify that the reference cannot outlive its source.

**Lifetime label syntax.** A lifetime label is a lowercase identifier prefixed with `~`. The `~` sigil visually distinguishes lifetime labels from type parameters (`T`, `E`, `K`) and from ordinary identifiers:

```loom
~src       // a lifetime label named "src"
~origin    // a lifetime label named "origin"
~static    // the reserved forever-lifetime (see below)
```

**`lifetime ~name` — declaring a region.** Lifetime parameters are declared in the `[...]` generic brackets of a function or type using the `lifetime` keyword. The `lifetime` keyword introduces the label into scope for the function signature and body:

```loom
@compiled

// Declare a single lifetime region ~src
func firstWord[lifetime ~src](borrow[~src] text: string): borrow[~src] string {
  let end = text.find(' ') ?? text.len();
  return text[0:end];
}

// Two lifetime regions and a type parameter — mixed freely
func merge[lifetime ~a, lifetime ~b, T](
  borrow[~a] left:  string,
  borrow[~b] right: string,
  config: T,
): borrow[~a] string {
  return left;
}
```

**`borrow[~name]` — referencing a declared region.** Inside a function or type that declares `[lifetime ~name]`, the type `borrow[~name] T` is a non-owning reference to `T` tied to that region. It behaves identically to plain `borrow T` for ARC elision, but the compiler additionally tracks that it flows from the named source.

**`~static` — the forever lifetime.** `~static` is a reserved lifetime label that requires no declaration. A `borrow[~static] T` is valid for the entire program execution. Module-level `let` bindings, string literals, and compile-time constants carry implicit `~static` lifetime. Via covariance (§23.4.2), `borrow[~static]` satisfies any `borrow[~name]` requirement:

```loom
@compiled

let SEPARATOR: string = " | ";   // implicit ~static lifetime

func wrap[lifetime ~src](
  borrow[~src]   text: string,
  borrow[~static] sep: string,
): borrow[~src] string {
  return sep + text + sep;
}

wrap(borrow userInput, borrow SEPARATOR);  // ~static satisfies ~src by covariance
```

**`async func` restriction.** A function declared `async` may not have `borrow[~label]` parameters. The async runtime suspends the function at `await` points; the caller's stack frame may no longer be valid when the function resumes. Plain `borrow` (unlabeled) inside an `async` function body is permitted provided the compiler verifies it does not cross any `await` point. Violation is `E_BORROW_ASYNC`.

```loom
@compiled

// COMPILE-TIME ERROR — E_BORROW_ASYNC
async func process[lifetime ~src](borrow[~src] template: string): Task[string] {
  let page = await http.get(url);   // suspension point — template may be gone on resume
  return render(borrow template);
}

// CORRECT — take ownership; ARC handles the class case for free
async func process(template: string): Task[string] {
  let page = await http.get(url);
  return render(borrow template);  // plain borrow inside body — no label, no suspension issue
}
```

**Closure capture of `borrow[~name]`.** A closure that captures a `borrow[~name]` binding transitively carries that lifetime label. Such a closure may only be: (a) passed to a `noescape fn` parameter, or (b) stored in a `[lifetime ~name]`-parameterized struct field whose region matches. Assigning a lifetime-capturing closure to a plain escaping `fn` binding is `E_BORROW_CLOSURE_ESCAPE`.

**`borrow[~name]` parameter rules (extends plain `borrow` rules).** In addition to all restrictions on plain `borrow`, a `borrow[~name]` value:

- May be returned when the function's declared return type is `borrow[~name] T`.
- May be stored in a `[lifetime ~name]`-parameterized struct field declared `borrow[~name] T`.
- May not be stored in a class field regardless of lifetime label — class instances may outlive any stack frame.
- May not be captured in closures passed to `Thread.spawn`, `Thread.spawnWith`, or `spawnBlocking` (`E_BORROW_THREAD_CAPTURE`).

**Lifetime elision rules.** The compiler infers lifetime labels in the following cases, requiring no explicit annotation at call sites:

| Situation | Rule |
|---|---|
| `borrow` param, return is owned | No lifetime tracking needed — plain `borrow` |
| `borrow` param passed to another `borrow` param (no escape) | Frame-scoped, no label required |
| Single `borrow[~x]` input, return type is `borrow` | Return inferred to borrow from `~x` |
| Method on `struct[lifetime ~name]`, return type is `borrow` | Inferred from `self`'s lifetime |
| `borrow[~a]` passed to `borrow[~b]` where `~b` is call-local | Reborrowing — compiler creates implicit sub-region |

**Reborrowing.** A `borrow[~a]` value may be passed to a `borrow[~b]` parameter when `~b` does not appear in the callee's return type, output fields, or any out-parameter position. The compiler creates an implicit sub-region of `~a` and unifies it with `~b` for the duration of the call. No annotation is needed at call sites:

```loom
@compiled

func validate[lifetime ~v](borrow[~v] text: string): bool { ... }
// ~v does not appear in the return type — reborrowing applies

func pipeline[lifetime ~src](borrow[~src] input: string): borrow[~src] string {
  let ok = validate(borrow input);   // OK: ~v unified with sub-region of ~src
  return input;
}
```

**Lifetime labels and generic containers.** `Option[borrow[~src] T]`, `list[borrow[~src] T]`, and `Result[borrow[~src] T, E]` are valid. The container transitively carries the `~src` lifetime and cannot outlive the source region. The compiler tracks this without requiring a new lifetime parameter on `Option`, `list`, or `Result` themselves.

`borrow[~name]` is valid only in `@compiled` files targeting `--target native`. Using `borrow[~name]` in scripted mode or Wasm targets is a compile-time error.

### §7.2 Lambdas

Lambdas (anonymous functions) come in two forms:

**Expression body** — evaluates `expr` and returns the result:

```
let double = func(x: int) => x * 2;
let greet = func(name: string) => "Hello, {$ name $}!";
```

**Block body** — executes the block; requires explicit `return`:

```
let process = func(data: string) {
  let parsed = parse(data);
  return transform(parsed);
};
```

**Async variants:**

```
let fetchAsync = async func(url: string) => await runtime.net.get(url);
let processAsync = async func(data: string) {
  let result = await compute(data);
  return result;
};
```

**Zero-parameter shorthand:**

```
let now = func() => Instant.now();
```

**Type annotations** on parameters are optional when the expected type is known from context:

```
let nums = [1, 2, 3];
let doubled = nums.map(func(x) => x * 2);  // x inferred as int
```

### §7.3 Closures

Lambdas are closures: they capture variables from their lexically enclosing scope. Capture is implicit — the compiler determines which outer variables are referenced.

**Capture by reference.** Closures capture variables by reference, not by value:

- Reading a captured `let` binding returns its value (immutable, safe).
- Reading a captured `var` binding returns its current value at the time of the read (the closure sees mutations made after creation).
- Writing to a captured `var` binding mutates the original variable in the enclosing scope.

**`global` and `nonlocal` declarations.** When a closure or nested function assigns to an outer `var`, it must declare the intent explicitly:

```
var moduleCount = 0;

func makeCounter(start: int): fn(): int {
  var count = start;
  return func(): int {
    nonlocal count;              // mutates 'count' from enclosing function
    global moduleCount;          // mutates 'moduleCount' from module scope
    count = count + 1;
    moduleCount = moduleCount + 1;
    return count;
  };
}
```

**Rules for `global`/`nonlocal`:**

- `global` and `nonlocal` are simple statements that must appear at the top of a function body, before any other statements.
- The named variable must exist in the appropriate scope and must be a `var` binding; using `global`/`nonlocal` on a `let` binding is a compile-time error.
- `global` and `nonlocal` are REQUIRED when a closure assigns to an outer `var`. Without the declaration, assignment to a name that exists in an outer scope is a compile-time error.
- Reading an outer variable does NOT require `global`/`nonlocal` — only mutation does.
- `nonlocal` walks up enclosing function scopes but stops at module level; `global` always refers to module-level scope.
- A single function may use both `global` and `nonlocal` declarations for different variables.

**For-loop binding freshness.** `for` loops using `let` create a fresh binding per iteration, avoiding the stale-closure problem:

```
let fns: list[fn(): int] = [];
for (let i = 0; i < 5; i = i + 1) {
  fns = fns + [func() => i];    // each closure captures a distinct 'i'
}
// fns[0]() == 0, fns[1]() == 1, ... fns[4]() == 4
```

`for` loops using `var` share a single mutable binding across iterations. The compiler SHALL emit a warning when a closure captures a `var` loop variable.

**Closure lifetime.** A closure may outlive its enclosing scope (e.g., returned from a function, stored in a data structure):

- Captured `let` bindings are safe to access after the enclosing scope exits — their values are immutable and kept alive by the closure.
- Captured `var` bindings are kept alive by the closure; the variable's storage persists as long as any closure referencing it is alive.
- In `@compiled` mode, closures that capture `var` bindings allocate the captured variable on the heap rather than the stack.

**Variable resolution.** The compiler resolves variable references using lexical scope chain lookup. Unlike Python, there is no ambiguity because Loom requires explicit `let`/`var` for all declarations — bare assignment without `let`/`var` is always a reference to an existing binding.

**Structural typing for closures.** Closures are structurally typed for assignment compatibility: a closure is assignable to any `fn(ParamTypes): ReturnType` where the parameter types and return type match, regardless of what the closure captures.

**No built-in partial application.** Loom does not provide built-in partial application or currying syntax. Developers use lambdas to achieve the same effect:

```
func add(a: int, b: int): int { return a + b; }
let add5 = func(b: int) => add(5, b);   // manual partial application
```

**Closures in `@compiled` mode.** Closures in `@compiled` files follow the same capture rules with the restriction that captured `var` bindings must have statically-known types (no `Any`). The compiler may optimize non-escaping closures to avoid heap allocation of captured variables.

**ARC capture lists (native target only).** On `--target native` builds, closures that create ARC retain cycles must break them with weak or unowned capture list entries:

```
// Without capture list: handle captures itself via the closure — retain cycle
let handle = effect(func() {
  if (count.get() > 10) { handle.dispose(); }
});

// With capture list: weak breaks the cycle
let handle = effect(func() [weak handle] {
  if (count.get() > 10) { handle?.dispose(); }  // handle is now Option[EffectHandle]
});
```

**Capture list syntax:** `func(params) [weak name, unowned other] { body }` or `func(params) [weak name] => expr`. Captured names with `weak` become `T?` inside the closure body. Captured names with `unowned` retain type `T`. Accessing a deallocated `unowned` capture is a `LifetimeError` trap in **all builds** — there is no opt-out from this trap.

```loom
// Safe: LifetimeError trap in all builds if self is freed before handler fires.
let handler = callback(func() [unowned self] { self.onFire(); });

// Prefer weak when you cannot prove self outlives the closure:
let handler = callback(func() [weak self] { self?.onFire(); });
```

Capture lists are valid only in `@compiled` files targeting `--target native`. Using a capture list in scripted code or non-native compiled targets is a compile-time error.

The compiler SHALL emit `E_ARC_CYCLE` as a **compile-time error** for any statically-detectable case where:
- An `unowned` capture is used in a closure whose static lifetime may exceed the lifetime of the captured object within the same lexical scope, or
- A probable ARC retain cycle is detected in a closure on native targets without a corresponding capture list entry.

For cases where the relationship cannot be statically determined, the compiler emits a `cycle-advisory` lint. `weak` is always the safe fallback for such cases.

**`noescape fn` closures.** When a closure is passed to a `noescape fn` parameter, the compiler verifies the closure body does not attempt to escape any `borrow` values it receives. The compiler may stack-allocate the closure's captured variables if they are all stack-resident, eliminating heap allocation entirely.

```loom
@compiled

func withLock(lock: Mutex, body: noescape fn(): void): void {
  lock.acquire();
  defer lock.release();
  body();
}

withLock(myMutex, func() {
  doProtectedWork();   // lambda is not heap-allocated
});
```

A closure that captures `borrow` values may only be passed to `noescape fn` parameters — passing it to a plain `fn` parameter is a compile-time error, because the `fn` parameter may store the closure, causing the borrowed value to escape its frame.

### §7.4 Rest Parameters and Keyword-Only Parameters

**Rest parameters** collect extra positional arguments:

```
func log(level: string, *messages: list[string]) {
  for (msg in messages) {
    print("[{$ level $}] {$ msg $}");
  }
}

log("INFO", "starting", "loading config", "ready");
```

`*args` collects extra positional arguments into a `list[T]`.

**Keyword rest parameters** collect extra keyword arguments:

```
func configure(name: string, **options: dict[string, Any]) {
  // options contains all keyword arguments not matched by named parameters
}

configure("app", timeout=5000, retries=3);
```

`**kwargs` collects extra keyword arguments into a `dict[string, T]`.

**Keyword-only parameters.** A bare `*` in the parameter list forces all subsequent parameters to be keyword-only:

```
func connect(host: string, port: int, *, timeout: int = 5000, tls: bool = true) {
  // timeout and tls must be passed as keyword arguments
}

connect("localhost", 8080, timeout=3000);  // ok
connect("localhost", 8080, 3000);          // compile-time error
```

A bare `*` does not collect any arguments — it only marks the boundary. A bare `*` and a named `*args` are mutually exclusive. Parameters after `*` or `*args` must be passed by name; passing them positionally is a compile-time error. Keyword-only parameters may have default values; those without defaults are required keyword arguments.

**Parameter ordering.** The compiler enforces the following order in function declarations: regular positional parameters first, then `*args` (or bare `*`), then keyword-only parameters (if any), then `**kwargs`. A function may have at most one `*` parameter and at most one `**` parameter.

**Combining rest with regular parameters:**

```
func request(method: string, url: string, *headers: list[string], timeout: int = 5000, **opts: dict[string, Any]) {
  // method and url are positional
  // headers collects extra positional args
  // timeout is keyword-only (after *args) with a default
  // opts collects extra keyword args
}
```

**Type checking.** The compiler type-checks rest parameters and spread operators:

- `*args` must have type `list[T]` for some `T`; the individual arguments must be assignable to `T`.
- `**kwargs` must have type `dict[string, T]` for some `T`; the individual keyword argument values must be assignable to `T`.
- Spread in calls: `*expr` requires `expr` to be `list[T]` where `T` matches the expected parameter types; `**expr` requires `expr` to be `dict[string, T]`.

**`@compiled` mode restrictions.** `**kwargs` with type `dict[string, Any]` is prohibited in `@compiled` files (since `Any` is prohibited in compiled mode). `*args` with a concrete element type (e.g., `*args: list[int]`) is permitted in compiled mode.

### §7.5 Generators and `yield`

Generator functions produce lazy sequences of values:

```
gen func range(start: int, end: int): Iterable[int] {
  var i = start;
  while (i < end) {
    yield i;
    i = i + 1;
  }
}
```

**`yield` statement.** `yield expr;` suspends the generator, produces the value of `expr` to the consumer, and resumes when the consumer requests the next value. `yield` is only permitted inside `gen func` and `async gen func` bodies — using `yield` in a regular `func` or `async func` is a compile-time error.

**`yield*` (yield-from).** Delegates to another iterable, yielding all of its values:

```
gen func chain(a: Iterable[int], b: Iterable[int]): Iterable[int] {
  yield* a;
  yield* b;
}
```

**Async generators:**

```
async gen func fetchPages(urls: list[string]): AsyncIterable[string] {
  for (url in urls) {
    let response = await runtime.net.get(url);
    yield await response.text();
  }
}

for await (page in fetchPages(urls)) {
  process(page);
}
```

**Generator lifecycle:**

1. Calling a `gen func` returns an `Iterable[T]` (or `AsyncIterable[T]`) without executing any of the body.
2. The body executes lazily: it runs up to the first `yield` when the consumer requests the first value, then suspends.
3. Each subsequent request resumes from the last `yield` point and runs to the next `yield` or to the end.
4. When the function body completes, the iterator signals completion (`None` from `next()`).
5. `return expr;` in a generator is a compile-time error — use `yield` for values and `return;` (no value) for early termination.

**Generator cleanup:**

- `defer` blocks inside a generator execute when the generator is finalized (by exhaustion or by the consumer breaking out).
- When a consumer `break`s out of a `for` loop over a generator, the runtime calls `close()` on the iterator, triggering `defer` cleanup.
- For async generators, `defer` blocks may contain `await`.

**Generator expressions** (inline generators):

```
let squares = (x * x for x in range(1000000));  // lazy Iterable[int]
```

Generator expressions use parentheses `(expr for x in xs)` and produce `Iterable[T]`. They are lazy — no values are computed until iterated. This contrasts with list comprehensions `[expr for x in xs]` which eagerly build the full list.

Generators implement the `Iterator[T]` interface (or `AsyncIterator[T]`), making them compatible with all iteration infrastructure.

Generators are permitted in `@compiled` mode — they compile to state machines with no dynamic dispatch.

### §7.6 Decorators

Decorators attach metadata to or transform functions, classes, and methods:

```
@route("/users")
func getUsers(): Response {
  return Response.ok(fetchUsers());
}

@cache(ttl=60)
func expensiveComputation(x: int): int {
  // ...
}
```

**Decorator signature.** A decorator is a callable with signature `func(target: T, ...args): T` where `T` is the type of the decorated item. The first argument is always the item being decorated; additional arguments come from the decorator invocation.

**Supported targets:**

- Functions: `@decorator func name(...) { ... }`
- Classes: `@decorator class Name { ... }`
- Methods: `@decorator pub func name(...) { ... }` inside a class body

**Stacking.** Multiple decorators are applied bottom-up (innermost first):

```
@log
@auth("admin")
@route("/admin/users")
func adminUsers(): Response { ... }
// Applied as: log(auth(route(adminUsers, "/admin/users"), "admin"))
```

**Execution timing:**

- In scripted mode: decorators run at declaration time as part of statement-level execution.
- In `@compiled` mode: decorators that only attach metadata are evaluated at compile time; decorators with runtime side effects execute at module initialization.

**Metadata access.** Decorator metadata is accessible via `core.reflect.annotations(target)`, returning a `dict[string, Any]`.

**Built-in decorators:**

- `@jsexport` — marks a function as callable from JavaScript (language-defined).
- `@compiled` — marks a file as compiled mode (language-defined, file-level only).

All other decorators are user-defined. Language-defined decorators have special compiler semantics and are not ordinary functions.

**Type checking.** The compiler verifies that the decorator's parameter and return types are compatible with the decorated item's type.

### §7.7 Property Getters and Setters

Computed properties use `get`/`set` syntax inside class bodies:

```
class Circle : Any {
  pub var radius: float;

  pub get area(): float {
    return 3.14159 * radius * radius;
  }

  pub get diameter(): float {
    return radius * 2.0;
  }

  pub set diameter(value: float) {
    radius = value / 2.0;
  }
}

let c = Circle(radius=5.0);
let a = c.area;           // calls get area()
c.diameter = 20.0;        // calls set diameter(20.0)
```

**Rules:**

- Properties are accessed with field syntax (no parentheses).
- A `get` property takes no parameters and returns a value.
- A `set` property takes exactly one parameter and returns `void`.
- A `get` without a `set` is read-only; a `set` without a `get` is write-only. Attempting to read a write-only property or write a read-only property is a compile-time error.
- A `get`/`set` pair for the same name must have compatible types.
- A stored field and a `get`/`set` property with the same name on the same class is a compile-time error.

**Interface participation:**

```
interface HasArea {
  get area(): float;
}

class Circle : Any implements HasArea {
  pub var radius: float;
  pub get area(): float { return 3.14159 * radius * radius; }
}
```

Properties are permitted in `@compiled` mode — they compile to direct function calls.



---

## §8 Classes and Objects

*(This section is normative.)*

### §8.1 Class Declarations

```
class HttpClient : Any implements Closeable {
  pub let baseUrl: string;
  pub var timeout: int = 5000;

  new(baseUrl: string, timeout: int = 5000) {
    this.baseUrl = baseUrl;
    this.timeout = timeout;
  }

  pub func get(path: string): Task[Response] {
    // ...
  }

  pub static func create(url: string): HttpClient {
    return HttpClient(baseUrl=url);
  }

  pub func close(): void {
    // cleanup
  }
}
```

**Syntax:**

```
class Name[T] : SuperClass implements Interface1, Interface2 {
  // fields, constructor, methods, static methods, properties
}
```

### §8.2 Visibility

Loom uses two visibility levels:

- `pub` — public, accessible from any module.
- (default) — module-private, accessible only within the declaring module.

There is no `protected` or `private`. Loom uses module-level encapsulation.

### §8.3 Inheritance

Loom supports single inheritance from one superclass (defaulting to `Any` if omitted) plus implementation of multiple interfaces:

```
class Animal : Any {
  pub let name: string;
  new(name: string) { this.name = name; }
}

class Dog : Animal implements Comparable[Dog] {
  pub let breed: string;
  new(name: string, breed: string) {
    super(name);
    this.breed = breed;
  }
}
```

**Abstract classes** may contain abstract method signatures that subclasses must implement:

```
abstract class Shape : Any {
  abstract func area(): float;
  abstract func perimeter(): float;

  pub func describe(): string {
    return "Shape with area {$ area() $}";
  }
}

class Circle : Shape {
  pub let radius: float;
  new(radius: float) { this.radius = radius; }

  pub func area(): float { return 3.14159 * radius * radius; }
  pub func perimeter(): float { return 2.0 * 3.14159 * radius; }
}
```

Abstract classes cannot be instantiated directly.

### §8.4 Constructors, `this`, and `Self`

**Constructors** use `new(params) { ... }` inside the class body. A class may have at most one constructor. If no constructor is declared, the compiler generates a default constructor that accepts all declared fields as named parameters.

**Multiple construction strategies** are expressed using `pub static func` factory methods rather than overloaded constructors. This is the idiomatic Loom pattern:

```
class Connection : Any {
  let host: string;
  let port: int;

  new(host: string, port: int) { this.host = host; this.port = port; }

  pub static func fromUrl(url: string): Connection {
    let parts = parseUrl(url);
    return Connection(host=parts.host, port=parts.port);
  }

  pub static func default(): Connection {
    return Connection(host="localhost", port=8080);
  }
}
```

Attempting to declare two `new(...)` blocks in one class is a compile-time error. If no constructor is declared, the compiler generates a default constructor that accepts all declared fields as named parameters:

```
class Point : Any {
  pub let x: float;
  pub let y: float;
  // auto-generated: new(x: float, y: float) { this.x = x; this.y = y; }
}

let p = Point(x=1.0, y=2.0);
```

**`this`** is always implicitly available inside instance methods and constructors. It refers to the current instance and is read-only — it cannot be reassigned.

**`Self`** is a type alias available inside class and interface bodies that refers to the implementing type. It is useful in static factory methods and interface definitions:

```
interface Copyable {
  func copy(): Self;
}

class Config : Any implements Copyable {
  pub let name: string;
  pub let value: int;

  pub func copy(): Self {
    return Config(name=name, value=value);
  }
}
```

### §8.5 Static Members

**Static methods** belong to the class itself, not to instances:

```
class MathUtils : Any {
  pub static func clamp(value: float, min: float, max: float): float {
    if (value < min) { return min; }
    if (value > max) { return max; }
    return value;
  }
}

let clamped = MathUtils.clamp(1.5, 0.0, 1.0);
```

Static methods have no `this` binding. If a static method needs to reference its own class type, it uses the class name explicitly or the `Self` type alias.

**Static fields:**

```
class Counter : Any {
  pub static var instanceCount: int = 0;

  new() {
    Counter.instanceCount = Counter.instanceCount + 1;
  }
}
```

Static fields are initialized when the class declaration is executed (see §2.1) and are shared across all instances.

### §8.6 Instance Fields

```
class User : Any {
  pub let name: string;          // immutable after construction
  pub var email: string;         // mutable
  pub let createdAt: Instant = Instant.now();  // default value
}
```

Instance fields without a default value must be initialized in the constructor.

**`weak` field qualifier.** A `weak` field holds a non-owning reference. Under ARC (native target), `weak` fields do not increment the retain count; when the referent is deallocated the field automatically becomes `None` via zeroing through the ARC side table. Under GC runtimes (scripted, Wasm), `weak` fields map to GC weak references; the GC may collect the referent even if this field holds a reference, and subsequent reads yield `None`.

`weak` fields are always typed `T?` (i.e., `Option[T]`). Assigning a non-optional value to a `weak` field is permitted and automatically wraps it in `Some`. Reading a `weak` field always yields `Option[T]`.

```
class Node : Any {
  pub let value: int;
  pub weak var parent: Node?;   // weak — does not prevent collection/deallocation
  pub var children: list[Node]; // strong reference
  new(value: int) { this.value = value; this.parent = None; }
}
```

`weak` is valid in both scripted and `@compiled` mode on all targets.

**`unowned[~name]` field qualifier.** An `unowned[~name]` field holds a non-owning reference whose safety is **compile-time proven** via the existing region system (§23.4.2). The class must declare `[lifetime ~name]` as a class-level lifetime parameter. The referent must originate from a scope that the compiler can statically verify contains (outlives) the `~name` region.

`unowned[~name]` fields do not increment `strong_count` and are not tracked by the ARC zeroing side table. Because safety is proven at compile time, **no runtime null-trap is inserted** — access is zero-cost, equivalent to a raw pointer load.

```loom
@compiled

// The class carries [lifetime ~owner] anchoring all unowned fields.
class TreeNode[lifetime ~owner] : Any {
  pub let value: int;

  // Compile-time proven: every value assigned here must originate from
  // a scope that the compiler verifies contains (outlives) ~owner.
  unowned[~owner] var parent: TreeNode[~owner]?

  pub var children: list[TreeNode[~owner]] = []

  new(value: int, parent: TreeNode[~owner]?) {
    this.value = value;
    this.parent = parent;
  }
}
```

**Compile-time verification rules.** At every assignment site for an `unowned[~name]` field the compiler applies the region containment rules from §23.4.2:

- The value being assigned must have been declared in a scope whose ARC lifetime the compiler can verify contains `~name`.
- The class instance itself may not outlive `~name` (enforced via rule 4 of §23.4.2 applied to the class's `[lifetime ~name]` parameter).
- Assigning a value from a narrower or unrelated scope is `E_UNOWNED_LIFETIME_MISMATCH`.
- A class with an `unowned[~name]` field that does not declare `[lifetime ~name]` as a class parameter is `E_UNOWNED_CLASS_NO_PARAM`.
- Bare `unowned` on a class field without a lifetime annotation is `E_UNOWNED_NO_LIFETIME`.

**What the proof covers.** The region model proves strictly hierarchical (nested) lifetime relationships: a parent scope containing the referent outlives a child scope containing the holder. This covers the common cases — trees, scene graphs, parent-child UI hierarchies, and similar structures — where the lifetime ordering is statically evident from scope nesting. For nodes at equal or unordered lifetimes, `weak` remains the correct choice; such references cannot be proven safe without a runtime side table.

**Scope restriction.** `unowned[~name]` fields are valid only in `@compiled` files targeting `--target native`. Using `unowned[~name]` in scripted mode or Wasm-targeted compiled mode is a compile-time error.

**`weak` vs `unowned[~name]`.** `weak` is always safe on all targets and requires no lifetime annotation. Use `unowned[~name]` only when: (a) the lifetime relationship is strictly hierarchical and provable from scope nesting, and (b) the absence of a runtime side-table lookup is measurable and meaningful for the workload.

```loom
@compiled

// Correct: parent is created in scope ~tree, which outlives all nodes.
func buildTree[lifetime ~tree](): TreeNode[~tree] {
  let root = TreeNode[~tree](value=0, parent=None);
  let child = TreeNode[~tree](value=1, parent=Some(root));  // OK: root is in ~tree
  return root;
}

// Compile-time error: cannot assign a value from a narrower scope.
func bad[lifetime ~tree](): void {
  let root = TreeNode[~tree](value=0, parent=None);
  let inner = TreeNode[~tree](value=2, parent=None);
  root.parent = Some(inner);  // E_UNOWNED_LIFETIME_MISMATCH: inner is not in ~tree
}
```

### §8.7 Dynamic Objects

Dynamic fields are opt-in via `dynamic class`:

```
dynamic class Config : Any {
  pub let name: string;
  new(name: string) { this.name = name; }
}
```

A `dynamic class` instance carries an additional hidden field map and implements the `Dynamic` interface:

```
interface Dynamic {
  pub func hasField(name: string): bool;
  pub func getField(name: string): Any;
  pub func setField(name: string, value: Any): void;
  pub func deleteField(name: string): bool;
  pub func fieldNames(): list[string];
}
```

**Dynamic field access** uses `!{...}` syntax — never `.`:

```
obj!{count} = 123;        // auto-boxes to Int
let n: int = obj!{count}; // auto-unboxes Int to int
let raw: Any = obj!{count};
```

- `obj!{foo}` ≡ `obj.getField("foo")`
- `obj!{"foo-bar"}` ≡ `obj.getField("foo-bar")`
- `obj.member` NEVER falls back to dynamic fields.
- `!{...}` requires the left operand to implement `Dynamic`; otherwise it is a compile-time error.

**Dynamic view** (scoped dot-as-dynamic):

```
dynamic obj as dobj {
  let x = dobj.foo;        // same as obj!{foo}
  dobj.foo = 1;            // same as obj.setField("foo", Int.box(1))
}
```

### §8.8 Annotations

Annotations attach metadata to declarations using `@name` or `@name(args)` syntax:

```
@jsexport
func onMessage(data: string): void {
  process(data);
}

@deprecated("Use newMethod instead")
pub func oldMethod(): void { ... }
```

**Language-defined annotations:**

| Annotation | Target | Description |
|---|---|---|
| `@compiled` | File (first line) | Marks a file as compiled mode (see §22) |
| `@jsexport` | `func`, `async func` | Marks a function as callable from JavaScript (see §18.2) |
| `@concurrent` | `async func` | Asserts function is safe from any executor thread; enforces Sendable captures (§17.9.5) |
| `@threadSafe` | `extern native func` | Declares FFI function safe for concurrent multi-thread calls (§18.5.1) |
| `@vectorize` | `for` loop | Hints compiler to auto-vectorize the loop body (§21.16) |
| `@vectorize(width=N)` | `for` loop | Same with suggested SIMD lane count (§21.16) |
| `@overflowWrapping` | `func` | Opt-in wrapping arithmetic for all fixed-width integers in the function (§4.1.1) |
| `@webcomponent(name)` | `class` | Registers the class as a Custom Element with the given tag name (see §19.10). `browser` target only. |
| `@attribute` | `var` field or property `get`/`set` pair | Declares an observed HTML attribute on a `@webcomponent` class (see §19.10). |

All other annotations are user-defined. Language-defined annotations have special compiler semantics and are not ordinary functions.

**User-defined annotations.** User-defined annotations follow the decorator protocol (see §7.6). User-defined annotations can carry typed parameters — the annotation function's parameter types define the accepted argument types:

```
func cached(ttl: int) {
  return func(target: fn): fn {
    // wrap target with caching logic
  };
}

@cached(ttl=60)
func expensiveComputation(x: int): int { ... }
```

**Unknown annotations.** The compiler SHALL emit a compile-time warning (not error) for unknown annotations, allowing tooling-defined annotations to coexist with language-defined ones.

**Reflection access.** Annotations are accessible via `core.reflect.annotations(target)`, returning a `dict[string, Any]` mapping annotation names to their argument values.

### §8.9 Finalization

The `Finalizable` interface declares cleanup logic:

```
interface Finalizable {
  func finalize(): void;
}
```

**Under GC runtimes (Wasm/scripted).** The runtime SHALL call `finalize()` on any `Finalizable` object that becomes unreachable and is collected by the garbage collector. This is a last-resort safety net:

- `finalize()` called by the GC must not throw (exceptions are silently swallowed and logged).
- `finalize()` called by the GC must not use `await`.
- `finalize()` may run on any task context.
- `finalize()` may never run if the program exits before GC collects the object.

**Under ARC (native target).** `finalize()` is called deterministically when the last strong reference to the object is released — either by `del`, by going out of scope, or when the containing owner is released. The "may never run" caveat does not apply to ARC builds. `finalize()` is called synchronously during the release operation. The restrictions above (no throw, no await) still apply.

**Deterministic finalization** is provided by the `del` statement (see §6.11) and `with`/`Scoped[T]` (see §6.6).

**Relationship between cleanup mechanisms:**

- `Closeable` types that also implement `Finalizable` should call `close()` from `finalize()` as a safety net.
- `with`/`Scoped[T]` is preferred for scope-aligned lifetimes.
- `del` is preferred for non-scope-aligned lifetimes.
- GC finalization is the last resort.

### §8.10 Generic Classes

```
class Box[T] : Any {
  pub let value: T;
  new(value: T) { this.value = value; }
}

class SortedList[T: Comparable[T]] : Any {
  // T must implement Comparable[T]
}
```

Type parameter constraints use the syntax `T: InterfaceName`.

---

## §9 Enums and Pattern Matching

*(This section is normative.)*

### §9.1 Enum Declarations

Enums define closed sets of named variants with optional typed payloads:

```
enum Shape {
  Circle(radius: float),
  Rect(w: float, h: float),
  Point,
}

enum Tree[T] {
  Leaf(value: T),
  Node(left: Tree[T], right: Tree[T]),
}
```

**Rules:**

- Enum names and variant names are PascalCase.
- Variants may be unit variants (no payload), positional payload variants, or named payload variants. A single variant may not mix both styles.
- Enums are nominal types: two enums with identical structure are distinct types.
- Enums may be generic.
- Enums are NOT classes and do not inherit from `Any` directly; they are first-class value types.
- Enum declarations are block-level declarations (no trailing `;`).
- **Variant separator.** Two styles are both normative:
  - **Comma style** (canonical for variants with payloads): variants are separated by `,` with an optional trailing comma.
  - **Semicolon style** (idiomatic for unit-only enums): each unit variant is terminated with `;` like a field or statement.
  The formatter accepts both and normalises to comma style for payload enums and semicolon style for unit-only enums. Mixing both separators in a single enum body is a compile-time error.


**Enum lifetime parameters.** An enum may declare lifetime parameters to allow `borrow[~name]` variant payloads. The syntax follows the same `[lifetime ~name]` convention used for structs (§10.11) and interfaces (§11.4):

```loom
@compiled

enum Token[lifetime ~src] {
  Word(borrow[~src] string),
  Number(int),
  Symbol(char),
}
```

Destructuring a lifetime-parameterized enum variant extracts the borrow with its label intact:

```loom
match tok {
  Token.Word(borrow[~src] w) => process(borrow w),
  Token.Number(n)            => display(n),
  Token.Symbol(c)            => emit(c),
}
```

A lifetime-parameterized enum is implicitly non-`Sendable` (§17.8.1). Lifetime parameters on enums are valid only in `@compiled` files targeting `--target native`.

### §9.2 Enum/`Any` Boundary

When an enum value is stored in an `Any`-typed position, the runtime wraps it in a heap-allocated box preserving the enum's full type identity (declared type name, type parameters, and active variant):

- **Boxing:** Assigning an enum value to an `Any`-typed variable boxes it automatically. The resulting `Any` carries the enum's full type.
- **Unboxing:** Extracting an enum from `Any` requires `match` or `as`/`as?` cast operators (§4.3). There is no implicit unboxing coercion.
- **`match` over `Any`:** Dispatch proceeds on the actual boxed enum type at runtime. If no arm matches and no wildcard is present, a `MatchError` is thrown.
- **`typeOf` on a boxed enum:** Returns a `Type` with `kind == "enum"`, the declared name, and instantiated type arguments.

```
func describe(x: Any): string {
  return match x {
    Circle(r)  => "circle with radius {$ r $}",
    Rect(w, h) => "rect {$ w $}x{$ h $}",
    Point      => "a point",
    _          => "something else",
  };
}
```

### §9.3 Built-in Enums

`Option[T]` and `Result[T,E]` are built-in enums available without import:

```
enum Option[T] { Some(T), None }
enum Result[T, E] { Ok(T), Err(E) }
```

See §5.6 for optionality sugar and §5.7 for `?` propagation.

### §9.4 `match` Expression

`match` is an expression that branches on patterns:

```
let area: float = match shape {
  Circle(r)    => 3.14159 * r * r,
  Rect(w, h)   => w * h,
  Point        => 0.0,
};
```

**Rules:**

- `match` is an expression; all arms must have a compatible result type.
- The compiler enforces exhaustiveness: every variant must be covered, or a wildcard `_` arm must be present.
- Patterns may be: variant names (with positional or named bindings), wildcards (`_`), guards (`Some(x) if (x > 0)`), and nested patterns (`Ok(Some(x))`).
- Patterns are matched top-to-bottom; the first matching arm executes.
- Bindings introduced in a pattern arm are scoped to that arm's expression only.
- `match` is a block statement (no trailing `;` on the construct itself).

**`match` in templates:**

```
{$ match status { Active => "active", Inactive => "inactive", _ => "unknown" } $}

{% match result %}
  {% Ok(v) => %}
    <p>Result: {$ v $}</p>
  {% Err(e) => %}
    <p class="error">{$ e.message $}</p>
{% end %}
```

### §9.5 Union Type Matching

`match` over union types uses type-based patterns:

```
func display(value: string | int | bool): string {
  return match value {
    string(s) => "string: {$ s $}",
    int(n)    => "int: {$ n $}",
    bool(b)   => if (b) { "true" } else { "false" },
  };
}
```

The compiler enforces exhaustiveness — all types in the union must be covered or a wildcard `_` arm must be present.

**Narrowing via `is` checks.** Union types can also be narrowed using `is` checks in `if` statements (flow-sensitive typing):

```
func process(value: string | int) {
  if (value is string) {
    // value is narrowed to string in this branch
    print(value.toUpper());
  } else {
    // value is narrowed to int in this branch
    print(value + 1);
  }
}
```

After an `is` check, the compiler narrows the type in the corresponding branch. In the `else` branch, the compiler narrows to the remaining types in the union.

---

## §10 Structs

*(This section is normative.)*

Structs are lightweight value types for plain data records:

```
struct Point {
  x: float;
  y: float;
}

struct Color {
  r: int;
  g: int;
  b: int;
  a: int = 255;   // default value
}
```

### §10.1 Auto-Generated Constructors

The compiler auto-generates a constructor from the struct's fields. All fields become named parameters in declaration order, with default values where specified:

```
let p = Point(x=1.0, y=2.0);
let c = Color(r=255, g=0, b=0);          // a defaults to 255
let c2 = Color(r=0, g=0, b=0, a=128);   // explicit alpha
```

### §10.2 Immutability and Mutability

Struct fields are immutable (`let`) by default. Mutable fields must be explicitly declared with `var`:

```
struct Counter {
  name: string;        // immutable
  var count: int = 0;  // mutable
}
```

### §10.3 Value Semantics

Structs have value semantics:

- Structs are passed by value (copied on assignment and function call).
- Two struct values are equal if all their fields are equal (structural equality).
- Structs are hashable if all their fields are hashable.
- The runtime may use copy-on-write or other optimizations as long as observable semantics match.

### §10.4 Relationship to `Any`

Structs do NOT inherit from `Any` and are NOT classes:

- No inheritance — structs cannot extend other structs or classes.
- No `Any` — a struct value is not `Any` unless explicitly boxed.
- Boxing: use the `box` keyword expression (`box myStruct`) or assign to an `Any`-typed variable (implicit widening). There is no `Any.box()` static method — box types are ABI-internal (§4.2).
- Structs may implement interfaces.

### §10.5 Methods

```
struct Vector2 {
  x: float;
  y: float;

  pub func length(): float {
    return (x * x + y * y).sqrt();
  }

  pub func add(other: Vector2): Vector2 {
    return Vector2(x=x + other.x, y=y + other.y);
  }

  pub static func zero(): Vector2 {
    return Vector2(x=0.0, y=0.0);
  }
}
```

Instance methods receive an implicit `this` (read-only for immutable structs). Static methods work the same as on classes.

**Operator overloading on structs.** All binary operator interfaces (`Add`, `Sub`, `Mul`, `Div`, `Mod`, `Pow`, `BitAnd`, `BitOr`, `BitXor`, `Shl`, `Shr`, `Index`, `IndexSet`, `Contains`, `Callable`) and unary operator interfaces (`Neg`, `BitNot`) may be implemented on structs using `operator func`:

```
struct Vector2 {
  x: float;
  y: float;

  pub func length(): float { return (x * x + y * y).sqrt(); }

  pub operator func +(other: Vector2): Vector2 =>
    Vector2(x=x + other.x, y=y + other.y);

  pub operator func *(scale: float): Vector2 =>
    Vector2(x=x * scale, y=y * scale);
}
```

**Augmented assignment override is prohibited on structs.** Writing `operator func +=` (or any other explicit augmented assignment override) on a struct is a compile-time error. The rationale: structs are value types and `this` inside a struct method is not the caller's binding, so in-place mutation cannot update the caller's variable. Augmented assignment on struct values always auto-derives as `x = x + y`.

### §10.6 Generic Structs

```
struct Pair[A, B] {
  first: A;
  second: B;
}

let p = Pair(first="hello", second=42);
```

### §10.7 `with` Copy Expression

The `with` expression creates modified copies of structs:

```
let p1 = Point(x=1.0, y=2.0);
let p2 = p1 with (x=3.0);        // Point(x=3.0, y=2.0)
let p3 = p1 with (x=0.0, y=0.0); // Point(x=0.0, y=0.0)
```

For any struct value `s` and a `with` expression `s with (field=newValue)`, the result is a new struct where the specified field has `newValue` and all other fields are copied from `s`.

**`with`-copy and `borrow[~name]` fields.** When a struct carries `borrow[~name]` fields, a `with`-copy expression `s with (field = newVal)` is valid only when `newVal` is a `borrow[~name]` value from a region that satisfies `~name` by covariance (the same label or a longer-lived source, including `~static`). Supplying a value from a mismatched lifetime region is a compile-time error (`E_BORROW_WITH_MISMATCH`). Fields that are not `borrow[~name]` fields are unaffected by this rule.

### §10.8 Struct Destructuring

```
let Point(x=px, y=py) = somePoint;

match shape {
  Point(x=0.0, y=0.0) => "origin",
  Point(x=x, y=y)     => "({$ x $}, {$ y $})",
}
```

### §10.9 Compiled Mode

Structs are the preferred type for `@compiled` mode data records — they map directly to Wasm GC structs or native C-compatible structs with no boxing, no vtable, and no GC overhead for stack-allocated instances.

### §10.10 Relationship to Other Types

| Type | Fields | Semantics | Inheritance | Use Case |
|---|---|---|---|---|
| `struct` | Named | Value | None | Plain data records |
| `class` | Named | Reference | Single + interfaces | Objects with identity, polymorphism |
| `tuple` | Positional | Value | None | Ad-hoc groupings |
| `enum` | Named variants | Value | None | Sum types / tagged unions |


### §10.11 Lifetime-Parameterized Structs

*(This section is normative. Requires `@compiled --target native`.)*

A struct may declare one or more lifetime parameters to allow `borrow[~name]` fields whose source region is tracked across function boundaries. Lifetime parameters are declared in the struct's `[...]` generic brackets using the `lifetime` keyword:

```loom
@compiled

struct Slice[lifetime ~src] {
  borrow[~src] data: string;   // non-owning — tied to ~src region
  len: int;
}

struct Parser[lifetime ~src, T] {
  borrow[~src] input: string;
  var items: list[T];
  var pos: int;
}
```

**Rules for lifetime-parameterized structs:**

- `[lifetime ~name]` declares a named region into scope for the struct's fields, methods, and type references.
- Only `@compiled --target native` structs may declare lifetime parameters. Using `[lifetime ~name]` in scripted mode or Wasm targets is a compile-time error.
- A struct may declare multiple lifetime parameters and freely mix them with type parameters: `struct Foo[lifetime ~a, lifetime ~b, T]`.
- A struct that declares a `[lifetime ~name]` parameter or that contains any `borrow[~name]` field is implicitly non-`Sendable`. Explicitly writing `implements Sendable` on such a struct is a compile-time error (`E_SENDABLE_LIFETIME`). See §17.8.1.
- A lifetime-parameterized struct may not be stored in a class field. Class instances are heap-allocated and may outlive any stack frame; storing a borrow-field struct in a class instance would allow the borrow to escape its source region.

**Methods on lifetime-parameterized structs.** Methods have implicit access to the struct's declared lifetime parameters. The compiler infers that a `borrow` return type on a method borrows from `self`'s lifetime — no explicit annotation is required for the common case:

```loom
@compiled

struct Slice[lifetime ~src] {
  borrow[~src] data: string;
  start: int;
  end: int;

  pub func len(): int {
    return end - start;
  }

  // Return type inferred to borrow from self's ~src lifetime
  pub func view(): borrow string {
    return data[start:end];
  }

  // Same semantics, written explicitly for documentation clarity
  pub func viewExplicit(): borrow[~src] string {
    return data[start:end];
  }
}
```

**Constructing a lifetime-parameterized struct.** The auto-generated constructor (§10.1) accepts `borrow[~name]` values for borrow fields. The compiler ties the resulting struct's lifetime to the provided source region:

```loom
@compiled

func tokenize[lifetime ~src](borrow[~src] input: string): list[string] {
  var stream = Slice(data=input, start=0, end=input.len());
  // stream's ~src is anchored to input — stream cannot outlive input
  var tokens = list[string]();
  while (stream.len() > 0) {
    tokens = tokens + [readNext(borrow stream)];
  }
  return tokens;   // OK: returns an owned list, not the stream
}
```

**`with`-copy on lifetime-parameterized structs.** See §10.7.

**Cyclic lifetime parameters.** A struct whose `[lifetime ~name]` parameter appears, directly or transitively via field types, in a cycle through itself is a compile-time error (`E_LIFETIME_CYCLE`).

**Type aliases with lifetime parameters.** Type aliases may carry lifetime parameters using the same `[lifetime ~name]` syntax:

```loom
@compiled

type StrSlice[lifetime ~src]     = Slice[~src];
type ParseState[lifetime ~src, T] = Parser[~src, T];
```

---

## §11 Interfaces

*(This section is normative.)*

### §11.1 Interface Declarations

Interfaces define contracts that classes and structs explicitly implement:

```
interface Serializable {
  func serialize(): bytes;
  static func deserialize(data: bytes): Self;
}

class Config : Any implements Serializable {
  pub let data: dict[string, string];

  pub func serialize(): bytes {
    return json.stringify(data).toBytes();
  }

  pub static func deserialize(raw: bytes): Self {
    let parsed = json.parse(core.text.fromBytes(raw)?)?;
    return Config(data=parsed);
  }
}
```

Interfaces are nominal (not structural); a class must explicitly declare `implements`. Interface declarations are block statements (no trailing `;`).

**Default parameter values in interface methods.** Interface method declarations may include default parameter values. An implementing class inherits those defaults: if the implementation omits a default value, callers may still call the method with that parameter omitted and the interface default is used. An implementation may provide a different default value; the implementation's default takes precedence for calls dispatched through the concrete type, while the interface default applies when the call is dispatched through the interface type. The compiler verifies that the implementation's parameter types match the interface's declared types regardless of default values.

### §11.2 Standard Interfaces

The following interfaces are defined by the language and standard library:

```
interface Iterable[T]       { func iter(): Iterator[T]; }
interface Iterator[T]       { func next(): Option[T]; }
interface AsyncIterable[T]  { func asyncIter(): AsyncIterator[T]; }
interface AsyncIterator[T]  { func next(): Task[Option[T]]; }
interface KeyLookup[K, V]   { func has(key: K): bool; func get(key: K): Option[V]; }
interface Readable          { func read(n: int): bytes; }
interface Writable          { func write(b: bytes): int; }
interface Closeable         { func close(): void; }
interface Sized             { func len(): int; }
interface From[E]           { static func from(err: E): Self; }
interface Comparable[T]     { func compareTo(other: T): int; }
interface Equatable[T]      { operator func ==(other: T): bool; }
interface Hashable          { func hashCode(): int; }
interface Renderable        { func render(ctx: RenderContext): string; }
interface Dynamic           { func hasField(name: string): bool; func getField(name: string): Any; func setField(name: string, value: Any): void; func deleteField(name: string): bool; func fieldNames(): list[string]; }
interface Finalizable       { func finalize(): void; }

// Web Component lifecycle — implemented by @webcomponent classes (§19.10).
// All methods have default no-op implementations; override only what is needed.
interface WebComponentLifecycle {
  func connected(): void;        // element inserted into a document
  func disconnected(): void;     // element removed from a document
  func adopted(): void;          // element moved to a new document
  func attributeChanged(name: string, oldValue: string?, newValue: string?): void;
}

// Map interfaces — implemented by dict[K,V] and structures.* types
interface IReadableMap[K, V] {
  func has(key: K): bool;
  func get(key: K): Option[V];
  func getOrDefault(key: K, default: V): V;
  func keys(): Iterable[K];
  func values(): Iterable[V];
  func entries(): Iterable[(K, V)];
  func len(): int;
  func isEmpty(): bool;
}

// IMutableMap extends IReadableMap with write operations.
// dict[K, V] implements IMutableMap[K, V].
interface IMutableMap[K, V] : IReadableMap[K, V] {
  func put(key: K, value: V): void;           // insert or update
  func putIfAbsent(key: K, value: V): bool;   // returns true if inserted
  func remove(key: K): Option[V];             // returns removed value
  func clear(): void;
  func putAll(other: IReadableMap[K, V]): void;
}
```

**Relationship between `Comparable[T]` and `Equatable[T]`.** `Comparable[T]` is a subtype of `Equatable[T]` — implementing `Comparable[T]` automatically provides an `==` implementation via `compareTo(other) == 0`. This default `==` may be overridden by an explicit `operator func ==` declaration.

**Comparable and Hashable.** Because `Comparable[T]` implies `Equatable[T]`, any type that implements `Comparable[T]` and is used as a `set[T]` element or `dict[T, V]` key must also implement `Hashable` — the same consistency requirement that applies to `Equatable[T]` directly (§5.1). The compiler enforces this: if a `Comparable[T]` type is used in a `set` or as a `dict` key without `Hashable`, the compiler emits a compile-time error (`E_HASHABLE_REQUIRED`). This transitivity is intentional and should be documented in any `Comparable[T]` implementation guide.

**Operator interfaces.** The following interfaces extend operator behaviour to user-defined types. The `R = Self` default means the return type equals the implementing type in the common case. Provide `R` explicitly for mixed-type operations (e.g., `Mul[float, Vec2]`):

```
interface Add[T, R = Self]     { operator func +(other: T): R; }
interface Sub[T, R = Self]     { operator func -(other: T): R; }
interface Mul[T, R = Self]     { operator func *(other: T): R; }
interface Div[T, R = Self]     { operator func /(other: T): R; }
interface Mod[T, R = Self]     { operator func %(other: T): R; }
interface FloorDiv[T, R = Self]{ operator func //(other: T): R; }
interface Pow[T, R = Self]     { operator func **(other: T): R; }
interface Neg                  { operator func -(): Self; }
interface BitAnd[T, R = Self]  { operator func &(other: T): R; }
interface BitOr[T, R = Self]   { operator func |(other: T): R; }
interface BitXor[T, R = Self]  { operator func ^(other: T): R; }
interface BitNot               { operator func bnot(): Self; }
interface Shl[T, R = Self]     { operator func <<(other: T): R; }
interface Shr[T, R = Self]     { operator func >>(other: T): R; }
interface Index[K, V]          { operator func [](key: K): V; }
interface IndexSet[K, V]       { operator func []=(key: K, value: V): void; }
interface Contains[T]          { operator func contains(item: T): bool; }
interface Callable[A, R]       { operator func ()(arg: A): R; }
```
**`noescape fn` and `Callable`.** `noescape fn(T): R` is not a subtype of `Callable[T, R]`. The `Callable` interface is for escaping callable values that may be stored in collections or fields and called later. Non-escaping callable parameters are expressed via `noescape fn` types directly. A value of type `noescape fn(T): R` may not be stored in a `list[Callable[T, R]]` or any other escaping container — this is a compile-time error.

**Built-in operator interface implementations.** The built-in types satisfy operator interfaces implicitly. The compiler emits specialised instructions for performance, but the semantic contract is identical to user-defined operator implementations:

| Type | Implements |
|---|---|
| `int`, `float` | `Add`, `Sub`, `Mul`, `Div`, `FloorDiv`, `Mod`, `Pow`, `Neg`, `Comparable[T]`, `Equatable[T]`, `BitAnd`, `BitOr`, `BitXor`, `BitNot`, `Shl`, `Shr` |
| `string` | `Add` (concatenation), `Comparable[string]`, `Equatable[string]`, `Index[int, char]`, `Contains[string]` |
| `list[T]` | `Add` (concatenation), `Index[int, T]`, `IndexSet[int, T]`, `Contains[T]` |
| `dict[K, V]` | `Index[K, V]`, `IndexSet[K, V]`, `Contains[K]`, `IReadableMap[K, V]`, `IMutableMap[K, V]` |
| `set[T]` | `Contains[T]` |
| `bytes` | `Index[int, uint8]`, `Comparable[bytes]` |

**`Scoped[T]` (context manager protocol):**

```
interface Scoped[T] {
  func scope_enter(): T;
  func scope_exit(error: Option[Any]): bool;
}
```

- `scope_enter()` is called when the `with` block is entered. Returns a value of type `T` bound to the `with` variable.
- `scope_exit(error)` is called on block exit. `error` is `None` on normal exit, `Some(err)` on exception. Returns `true` to suppress the exception, `false` to propagate.

`Closeable` types automatically satisfy `Scoped[Self]` with a default implementation: `scope_enter()` returns `this`, `scope_exit(error)` calls `this.close()` and returns `false`.

**Exception replacement.** If `scope_exit` itself throws, its exception replaces the original exception.

**Multiple `with` bindings.** Multiple bindings in a single `with` statement are entered left-to-right and exited right-to-left (LIFO):

```
with (a = openFile("in.txt"), b = openFile("out.txt")) {
  b.write(a.readAll());
}
```

If an inner `scope_enter()` fails, already-entered context managers have their `scope_exit` called.

**`AsyncScoped[T]` (async context manager):**

```
interface AsyncScoped[T] {
  func scope_enter(): Task[T];
  func scope_exit(error: Option[Any]): Task[bool];
}
```

Used with `with` in async contexts. The runtime `await`s both methods.

`Scoped[T]` and `AsyncScoped[T]` are permitted in `@compiled` mode.

### §11.3 Iteration Protocol

The iteration protocol defines how types participate in `for` and `for await` loops.

**`Iterable[T]`** is the sole mechanism for making a type usable in `for (x in expr) { ... }`:

```
interface Iterable[T] {
  func iter(): Iterator[T];
}
```

Each call to `iter()` MUST return a new, independent iterator.

**`Iterator[T]`** is a stateful, single-pass cursor:

```
interface Iterator[T] {
  func next(): Option[T];
}
```

- An `Iterator[T]` is mutable — each `next()` advances its position.
- After returning `None`, all subsequent calls to `next()` MUST also return `None`.
- An `Iterator[T]` itself also implements `Iterable[T]` (returning `this` from `iter()`).

**`for` loop desugaring:**

```
// for (x in expr) { body }
// desugars to:
{
  let __iter = expr.iter();
  loop: while (true) {
    match __iter.next() {
      Some(x) => { body },
      None    => { break loop; },
    }
  }
  // if __iter has a close() method, it is called on early exit
}
```

- `expr` must implement `Iterable[T]`; otherwise it is a compile-time error.
- `x` is bound as `let` (immutable) in each iteration. To get a mutable binding, use `for (var x in expr)`.
- Destructuring is supported: `for ((key, value) in dict.entries()) { ... }`.

**`for await` desugaring** is analogous, awaiting each `next()` call.

**Built-in iterable types:**

| Type | Iterable Over | Notes |
|---|---|---|
| `list[T]` | `T` | Index order |
| `set[T]` | `T` | Implementation-defined order |
| `dict[K, V]` | `K` | Insertion order. Also: `.values()`, `.entries()` |
| `string` | `char` | Unicode scalar values in source order |
| `bytes` | `uint8` | Individual byte values (0–255) |
| `tuple[...]` | `Any` | Heterogeneous; not available in `@compiled` mode |

**User-defined iterables:**

```
class Range : Any implements Iterable[int] {
  let start: int;
  let end: int;
  new(start: int, end: int) { this.start = start; this.end = end; }

  pub func iter(): Iterator[int] {
    return RangeIterator(start, end);
  }
}

class RangeIterator : Any implements Iterator[int], Iterable[int] {
  var current: int;
  let end: int;
  new(start: int, end: int) { current = start; this.end = end; }

  pub func next(): Option[int] {
    if (current >= end) { return None; }
    let value = current;
    current = current + 1;
    return Some(value);
  }

  pub func iter(): Iterator[int] { return this; }
}
```

**Optional iterator methods:**

- `func close(): void` — called on early exit (`break`, `return`, exception) to release resources.
- `func sizeHint(): Option[int]` — returns an estimate of remaining elements for pre-allocation.

**Concurrent modification.** Modifying a collection while iterating it is undefined behavior in scripted mode and a compile-time error in `@compiled` mode when statically detectable.

**Generators and iteration.** Generators (see §7.5) automatically implement `Iterable[T]` (or `AsyncIterable[T]` for async generators), providing a simpler way to create custom iterators without writing separate iterator classes:

```
gen func countdown(from: int): Iterable[int] {
  var i = from;
  while (i > 0) {
    yield i;
    i = i - 1;
  }
}

for (n in countdown(5)) {
  print(n);   // 5, 4, 3, 2, 1
}
```

**Compiled mode.** User-defined iterables are permitted in `@compiled` mode — the `Iterable[T]`/`Iterator[T]` interfaces are statically dispatched with no virtual call overhead when the concrete type is known. The element type `T` must be statically known.

**`len` vs `count`.** `len(x)` is for values with intrinsic length (primitives implementing `Sized`). `count(xs: Iterable[T]): int` explicitly iterates to count items.


### §11.4 Lifetime-Parameterized Interfaces

*(This section is normative. Requires `@compiled --target native`.)*

An interface may declare lifetime parameters to express contracts involving `borrow[~name]` return values or method parameters:

```loom
@compiled

interface Sliceable[lifetime ~src] {
  func slice(start: int, end: int): borrow[~src] string;
}

interface Source[lifetime ~src, T] {
  func read(): borrow[~src] T;
  func remaining(): int;
}
```

**Implementing a lifetime-parameterized interface.** The implementing type must declare a matching lifetime parameter by position. The names of the parameters need not match:

```loom
@compiled

struct Buffer[lifetime ~buf] implements Sliceable[~buf] {
  borrow[~buf] data: string;
  var pos: int;

  pub func slice(start: int, end: int): borrow[~buf] string {
    return data[start:end];
  }
}
```

**Rules:**

- A class may not implement a lifetime-parameterized interface. Class instances are heap-allocated and may outlive any stack frame; they cannot safely provide borrow-returning method contracts.
- Lifetime-parameterized interfaces are valid only in `@compiled` files targeting `--target native`.
- The lifetime parameter positions on the implementing type must be compatible by covariance with the declared interface positions.

---

## §12 Generics

*(This section is normative.)*

Loom supports generic type parameters on functions, classes, interfaces, enums, and structs. This section consolidates the generic type system rules.

**Declaration syntax:**

```
func identity[T](x: T): T { return x; }
class Box[T] : Any { pub let value: T; }
interface Container[T] { func get(): T; }
enum Tree[T] { Leaf(value: T), Node(left: Tree[T], right: Tree[T]) }
struct Pair[A, B] { first: A; second: B; }
```

**Constraints:**

```
func max[T: Comparable[T]](a: T, b: T): T {
  return a > b ? a : b;
}
```

Multiple constraints use `+`: `T: Comparable[T] + Hashable`.

**Reification.** Generics are reified at runtime. `core.reflect.typeOf` on a `Box[int]` returns a `Type` whose `params()` includes the `Type` for `int`.

**Variance:**

- Covariance (`out T`): read-only positions.
- Contravariance (`in T`): write-only positions.
- Invariance (default): both read and write positions.

The compiler infers variance when possible.

**Type inference.** The compiler infers type arguments from argument types:

```
let x = identity(42);        // T inferred as int
```

Explicit type arguments when needed:

```
let empty = Box[int](value=0);
```


See §4.8 for additional type system details.

### §12.1 Lifetime Parameters in Generics

*(This section is normative. Requires `@compiled --target native`.)*

Lifetime parameters extend the generic parameter system. They are declared alongside type parameters in `[...]` brackets and follow all generic scoping rules with two distinctions:

- Lifetime parameters use the `lifetime` keyword and the `~` sigil: `[lifetime ~src]`.
- Type parameters use PascalCase names without a sigil: `[T]`, `[K, V]`.

Lifetime parameters and type parameters may be freely mixed in any order: `[lifetime ~src, T, lifetime ~out, E]`.

**Mixed generic brackets:**

```loom
@compiled

func transform[lifetime ~src, T, R](
  borrow[~src] input: T,
  mapper: noescape fn(borrow[~src] T): R,
): R {
  return mapper(borrow input);
}

struct Pipeline[lifetime ~src, T, R] {
  borrow[~src] source: T;
  handler: noescape fn(borrow[~src] T): R;
}
```

**Constraints.** Lifetime parameters do not support interface constraints (`T: SomeInterface` style). A lifetime label is a region identifier only — it carries no interface contract.

**Variance.** Lifetime labels are covariant: a `borrow[~a]` may be used where `borrow[~b]` is required if the source region of `~a` strictly contains (outlives) the source region of `~b`. `borrow[~static]` satisfies any `borrow[~name]` constraint. This is the only subtyping rule for lifetime labels; there is no contravariance.

**Reification.** Lifetime parameters are compile-time constructs only. They are erased after type-checking and do not appear in `core.reflect.typeOf` output — `typeOf` on a `Slice[~src]` returns the same `Type` as `typeOf` on `Slice` with no lifetime argument. See §23.4.2.


---

## §13 Modules and Imports

*(This section is normative.)*

### §13.1 Import Syntax

**Standard imports:**

```
from package.sub.module import (Name1, Name2 as Alias);
```

**Grouped imports:**

```
from package.sub {
  modulea import (ThingA, Other as OA);
  moduleb.sub import (ThingB);
}
```

**Relative imports:**

```
from . {
  modulea import (Foo);
  sub.moduleb import (Bar);
}

from ..|.. {
  packagea.modulea import (Alpha);
  packagea.moduleb import (Beta as B);
}
```

**Wildcard `*` imports are prohibited** (determinism).

**Namespace packages.** Dotted names map to directories; segments can be spread across multiple roots. First unique file wins; duplicate ambiguity is an error unless disambiguated.

**`prefer compiled` clause.** An import statement may carry the `prefer compiled` modifier to request runtime fallback resolution:

```loom
from codec import (Encoder, decode) prefer compiled;
```

When the runtime encounters `prefer compiled` on an import, it attempts to load a compiled artefact before falling back to the scripted source. See §13.7 for full resolution semantics.

`prefer compiled` is valid in scripted mode only. Using `prefer compiled` in a `@compiled` file is a compile-time lint warning — compiled modules are already resolved statically and the clause has no effect at runtime.

`prefer compiled` may appear on individual imports within a grouped import block:

```loom
from mylib {
  fast import (Encoder) prefer compiled;
  utils import (format);
}
```

### §13.2 Re-Exports

Re-exports allow barrel modules to expose symbols from internal modules:

```
// components/index.loom — barrel module
pub from .counter import (Counter);
pub from .header import (Header, HeaderProps);
pub from .sidebar import (Sidebar as AppSidebar);
```

Consumers import from the barrel module:

```
from mylib.components import (Counter, Header, AppSidebar);
```

**Grouped re-exports:**

```
pub from .components {
  counter import (Counter);
  header import (Header, HeaderProps);
  sidebar import (Sidebar as AppSidebar);
}
```

**Rules:**

- Re-exported symbols are treated as if declared `pub` in the re-exporting module.
- Only `pub` symbols from the source module can be re-exported; re-exporting a non-`pub` symbol is a compile-time error.
- Re-exports do not execute the source module twice — cached bindings are reused.
- Wildcard re-exports (`pub from .module import *`) are prohibited.
- Re-exports are permitted in both scripted and `@compiled` mode.

For any symbol re-exported via `pub from .internal import (Foo)`, importing `Foo` from the barrel module yields the same binding as importing `Foo` directly from the internal module.

### §13.3 Package Manifest (`.lmpkg`)

Every distributable package or application root contains a manifest file with the `.lmpkg` extension. The manifest may be named either `package.lmpkg` (the canonical name used by tooling by default) or `<package-name>.lmpkg` (matching the `package` field in the manifest). The toolchain accepts both forms; `<name>.lmpkg` takes precedence over `package.lmpkg` when both exist in the same directory.

```toml
# my-app.lmpkg — Loom package manifest

package   my-app
version   1.4.0
loom      ">=1.3"

[deps]
net.http     = "^2.0"
jsonschema   = "^1.4"
ui-toolkit   = "^0.8"

[dev-deps]
test-runner  = "^3.1"

[dev-overrides]
# Local filesystem overrides for development. Ignored by loom install --locked
# and stripped from the published manifest. See §13.9.
# loom.http = { path = "../loom-http" }
# my-utils  = { path = "/home/dev/my-utils" }

[target.browser]
exclude io.fs
exclude io.proc

[target.cli]
include io.fs
include io.proc

[target.service]
include io.fs
include io.proc
include net.net

[target.desktop]
include io.fs
include io.proc
include net.net
include ui.desktop

[target.native]
include io.fs
include io.proc
include net.net
```

**Manifest rules:**

- `package` names are lowercase, hyphen-separated identifiers.
- `version` follows semantic versioning (`MAJOR.MINOR.PATCH`).
- `loom` specifies the minimum required toolchain version.
- Dependency versions use constraint expressions: `^` (compatible), `~` (patch-compatible), `>=`, `<=`, exact, or range.
- A `loom.lock` lockfile records exact resolved versions of all transitive dependencies.
- **Platform profiles** (`[target.X]`) declare which stdlib capabilities are available. The compiler enforces these at build time.
- Default targets: `cli`, `browser`, `service`.
- `core.text`, `data.json`, `core.time`, and `core.collections` are available on all targets without restriction.

**`[dev-overrides]` section:**

`[dev-overrides]` maps package names to local filesystem paths, redirecting resolution to a local checkout during development:

```toml
[dev-overrides]
loom.http = { path = "../loom-http" }
my-utils  = { path = "/home/dev/my-utils" }
```

- Each entry overrides the version resolved from `loom.lock` for that package name. The `path` must contain a valid `.lmpkg` manifest. The package name in that manifest must match the key.
- Packages listed in `[dev-overrides]` are compiled via the JIT pipeline and their artifacts are written to the **project-local cache** (`.loom/cache/` — see §27.7) instead of the global cache (`~/.loom/cache/`). This prevents overwriting cached artifacts that other projects depend on.
- `[dev-overrides]` entries are **ignored** when `loom install --locked` is used (CI mode).
- `[dev-overrides]` entries are **stripped** from the published manifest. `loom publish` emits a warning if any `[dev-overrides]` entries are present and proceeds only after confirmation.
- The `loom link` and `loom unlink` commands (§27.1) manage `[dev-overrides]` entries automatically.

**Namespace package installation layout:**

When multiple packages share the same root namespace (e.g., `loom.http`, `loom.db`, `loom.crypto`), the toolchain installs their `.lmpkg` files side-by-side under a shared namespace directory rather than giving each package its own isolated directory. This mirrors Python's namespace package convention and allows packages to be developed and versioned independently while presenting a coherent import tree.

```
# Installed layout under a project's package root:
packages/
  loom/                          # namespace directory (no .lmpkg here)
    loom.http.lmpkg              # package file named after the package
    loom.db.lmpkg
    loom.crypto.lmpkg
  my-utils/
    my-utils.lmpkg
```

- The **namespace directory** (e.g., `loom/`) is created when the first package under that namespace is installed. It contains no `.lmpkg` of its own — it is purely a grouping directory.
- Each installed package's `.lmpkg` file is named `<package-name>.lmpkg` and placed inside the namespace directory.
- The resolver identifies a directory as a namespace package root when it contains one or more `.lmpkg` files but no `package.lmpkg` or `<name>.lmpkg` at the directory level itself.
- Multiple packages under the same namespace can be installed, upgraded, and removed independently. Installing `loom.http` does not affect `loom.db`.
- The `loom install` command manages this layout automatically. Manual manipulation of the `packages/` directory is not supported.

### §13.4 Module Initialization

When a module is imported, its top-level statements execute sequentially in source order (see §2.1). Module initialization has the following properties:

- **Permitted top-level statements.** A module's top-level code may contain: import statements, declarations (`class`, `enum`, `interface`, `struct`, `func`, `async func`, `type`), `let`/`var` initializers, and expression statements.
- **At-most-once execution.** A module's top-level statements execute at most once. Subsequent imports reuse cached bindings.
- **Import-order initialization.** When a module contains multiple import statements, each imported module is fully initialized before the next import statement executes. For example, if a file imports module A then module B, module A's top-level statements run to completion before module B's initialization begins.
- **Circular imports.** If module A imports module B and module B imports module A, the compiler detects the cycle. The second import sees the partially-initialized bindings of the first module (only those declarations that have already executed). Circular imports are permitted but discouraged; the partially-initialized state can lead to `None` bindings for declarations not yet reached.
- **No suspension.** `await` is prohibited during module initialization (see §7.1).

The module dunders (`__name__`, `__file__`, `__execmode__`) are set before any top-level statements execute (see §2.2).

### §13.5 Package Registry

*(Full specification moved to the [Loom Packages Reference](loom-packages-reference-v1_10.md).)*

The Loom package registry is a signed, content-addressed registry of Loom
packages.  Packages are identified by name and version and authenticated with
Ed25519 signatures.  CLI commands: `loom install`, `loom cache`, `loom publish`.
See the Packages Reference for the full registry protocol, signing requirements,
and CLI reference.

### §13.6 Reserved Namespaces

The following root namespaces are reserved for the standard library. User packages cannot use any of these as a package name or top-level namespace prefix:

| Namespace | Contents | Availability |
|---|---|---|
| `core` | Universal language primitives | All targets |
| `io` | Filesystem, process, stream I/O | `cli`, `service`, `desktop`, `native` |
| `data` | Structured data serialization formats | All targets |
| `net` | Networking — HTTP, WebSocket, TCP, TLS, DNS | `cli`, `service`, `desktop`, `native` |
| `sync` | OS-thread concurrency primitives | `cli`, `service`, `desktop`, `native` |
| `web` | Browser-specific APIs | `browser` only |
| `ui` | Cross-platform reactive UI | All targets |
| `native` | Native-compiled-only numerical, memory, GPU, and WebGPU primitives | `@compiled --target native` only (WebGPU also `browser`) |
| `lang` | Language interop, macro support, template runtime | All targets |
| `debug` | Debugging, tracing, profiling, MCP agent tooling | All targets (when enabled) |
| `structures` | Data structures beyond primitive collections | All targets |

The `loom.` namespace prefix remains reserved for first-party packages (see §13.8). User packages cannot use `loom.` as a prefix. The previously reserved `system` prefix is retired; `system` may be used as a user package name beginning with v1.1.

### §13.7 Module Fallback Pairs

*(This section is normative.)*

A **module fallback pair** consists of a compiled artefact and a scripted source file that export compatible APIs for the same logical module path. The `prefer compiled` import clause (§13.1) activates fallback resolution for the named module.

#### §13.7.1 Resolution Algorithm

When the runtime encounters `from module.path import (...) prefer compiled`, it executes the following sequence. The result is cached — a module resolves to exactly one implementation per session, consistent with the "module initialises at most once" rule (§2.1).

1. **Search for compiled artefact.** The runtime searches for a compiled artefact at the module's resolved file path with a platform-appropriate extension:
   - `module/path.wasm` — Wasm module (browser and CLI Wasm targets)
   - `module/path.so` / `module/path.dylib` / `module/path.dll` — native shared library (native target)
   The search follows the same directory resolution rules as for `.loom` source files.

2. **Attempt instantiation.** If a compiled artefact is found, the runtime attempts to load and instantiate it. Instantiation failure for any of the following reasons is treated identically as "compiled artefact unavailable":
   - The host environment does not support Wasm.
   - A required native shared library is not present.
   - The artefact's ABI version is incompatible with the current Loom runtime.
   - The artefact's exports do not include all names listed in the import statement.
   - Any other instantiation error.

3. **Fall back to scripted source.** If no compiled artefact is found or instantiation fails, the runtime locates the scripted source at the same module path with `.loom` extension and proceeds with the normal JIT pipeline.

4. **Failure.** If neither the compiled artefact nor the scripted source can be loaded, the runtime throws `ModuleLoadError`.

The fallback is always silent on success. Developers who need to detect which path was taken use `TypeName.__module__.__execmode__` (§2.2).

#### §13.7.2 Artefact Search Paths

The compiled artefact search path is:

1. The directory containing the scripted source file.
2. Any paths specified in `.lmpkg` under `[compiled_search_paths]`.
3. The platform's standard shared library search path (for native targets).

```toml
# <name>.lmpkg
[compiled_search_paths]
paths = ["./native", "/usr/local/lib/loom"]
```

#### §13.7.3 API Compatibility

The spec does not require compiled and scripted module versions to export identical APIs. The import statement determines what is required: only the names listed in the import statement must be present in whichever version is loaded.

The recommended practice is for both versions to implement the same named interface (§11.1), ensuring compile-time verification of API compatibility on both sides independently:

```loom
// codec/Api.loom — shared contract
interface Codec {
  func encode(data: bytes): bytes;
  func decode(data: bytes): bytes;
}

// codec.loom (scripted fallback)
from codec import (Api);
pub class Encoder : Any implements Api.Codec { ... }

// codec_native.loom (compiled artefact source)
@compiled
from codec import (Api);
pub class Encoder : Any implements Api.Codec { ... }
```

#### §13.7.4 `__execmode__` Under Fallback Resolution

After resolution, the loaded module's `__execmode__` (accessible via `TypeName.__module__.__execmode__`) reflects which path was taken:

- `"compiled"` — a compiled artefact was instantiated successfully.
- `"interpreted"` — the scripted fallback was loaded.

```loom
from codec import (Encoder) prefer compiled;

let supportsStreaming = Encoder.__module__.__execmode__ == "compiled";
```

#### §13.7.5 Shipping Fallback Pairs

A package ships both files at the same module path:

```
src/
  codec.loom        # scripted implementation — always present
  codec.wasm        # compiled Wasm — for browser/CLI targets
  codec.so          # compiled native — for native target
```

The package registry stores and serves all variants. Consumers use `prefer compiled` and receive whichever variant matches their platform.

#### §13.7.6 `ModuleLoadError`

```loom
class ModuleLoadError : Exception {
  pub let modulePath: string;
  pub let compiledAttempted: bool;
  pub let scriptedAttempted: bool;
}
```

Thrown when both the compiled artifact and the scripted source fail to load. `cause` carries the underlying instantiation error if one was produced. Catchable via `try`/`catch`.

### §13.8 Core Package Set

*(Full specification moved to the [Loom Packages Reference](loom-packages-reference-v1_10.md).)*

Five first-party packages ship under the `loom.` namespace and are available
via `loom install`:

| Package | Purpose |
|---|---|
| `loom.ai` | Multi-provider AI client (`Client`, `StructuredOutput[T]`, streaming) |
| `loom.db` | Database access (query builder, connection pool, migrations) |
| `testing` | Testing framework (`describe`, `it`, `expect`) |
| `loom.bench` | Micro-benchmark harness |
| `loom.format` | Document formatting utilities |

See the Packages Reference for full API documentation.

### §13.9 `LOOMPATH` — Development Package Search Path

*(This section is normative.)*

`LOOMPATH` is an environment variable that extends the module resolver's search path for package imports, enabling development-time use of local package checkouts without modifying `loom.lock` or running `loom install`.

**Format.** `LOOMPATH` is a colon-separated list of directory paths on Unix/macOS and a semicolon-separated list on Windows. Each entry is a directory that contains a valid `.lmpkg` manifest:

```sh
# Unix — two local checkouts on the search path
export LOOMPATH="/home/dev/loom-http:/home/dev/my-utils"

# Windows
set LOOMPATH=C:\dev\loom-http;C:\dev\my-utils
```

**Resolution order.** For any non-relative, non-stdlib import, the resolver searches in the following order and uses the first match:

1. `[dev-overrides]` entries in the project's `.lmpkg` (§13.3) — highest priority.
2. `LOOMPATH` directories, left to right — each directory is checked for a `.lmpkg` whose `package` field matches the import's package name.
3. Installed packages from `loom.lock` — resolved via the global or project-local Wasm cache (§27.7).
4. Global cache (`~/.loom/cache/`) — fallback for packages installed globally.

**Package identity.** Each `LOOMPATH` directory is treated as an independent package source. The resolver reads the directory's `.lmpkg` to determine the package name and version. The version is used only for diagnostic messages — `LOOMPATH` entries take precedence over the `loom.lock`-resolved version regardless of version number. This allows a developer to test an unreleased or patched version of a dependency without bumping version numbers.

**JIT-only.** `LOOMPATH` packages are always resolved via the JIT pipeline and bypass the Wasm cache. Because `LOOMPATH` sources are under active development and change frequently, cache validation overhead would exceed the benefit. The JIT pipeline uses incremental compilation so only changed modules are recompiled on each `loom run`.

**CI isolation.** `LOOMPATH` is **ignored** when `loom install --locked` is in effect. This ensures that CI builds are fully reproducible and unaffected by the developer's local environment.

**Diagnostic.** `loom run --verbose` logs each `LOOMPATH` entry consulted and reports which packages were resolved from `LOOMPATH` versus `loom.lock`.

**Interaction with namespace packages.** If a `LOOMPATH` entry resolves a package that is part of a namespace (e.g., `loom.http`), only that specific package is overridden. Other packages in the same namespace (e.g., `loom.db`) continue to resolve from `loom.lock` as usual.

---

## §14 Multiline Strings

*(This section is normative.)*

Multiline strings are delimited by triple quotes with optional descriptor parentheses:

```
let text = """
  Hello, world!
  This is a multiline string.
  """;
```

**Delimiters:** `"""( ... )` or `'''( ... )` (descriptor parentheses optional when defaults are used).

**Left-alignment anchor `P`.** `P` is the exact whitespace (spaces/tabs) before the opening triple quotes on its line:

- Every content line must start with `P` — otherwise `E_MLS_ALIGN`.
- The parser strips exactly one `P` prefix from each content line.
- The newline after the opener is NOT included.
- The closing delimiter line must be exactly `P` followed by the closing triple quotes on its own line.
- The newline right before the closer is NOT included.
- A line that equals exactly `P` becomes an empty line in the resulting string.

**Formatting parameters:**

| Parameter | Values | Default | Description |
|---|---|---|---|
| `indent_type` | `"space"`, `"tab"` | `"space"` | Unit for `indent` |
| `indent` | `+N`, `-N` | no shift | Adds/removes N units of `indent_type` to/from non-blank lines |
| `eol` | `"source"`, `"LF"`, `"CRLF"` | `"source"` | End-of-line normalization (applied after anchoring/indent) |

---

## §15 Interpolated Strings

*(This section is normative.)*

Interpolated strings embed expressions in single- or double-quoted strings using `{$ ... $}` delimiters:

```
let greeting = "Hello, {$ name $}";
let path = 'out/{$ fileStem $}.txt';
```

**Rules:**

- Interpolated strings produce `string` values immediately.
- They use the same inline-expression rendering rules as template fences, with `RenderContext(language="text", format="none")`.
- Filters/pipes are supported: `{$ expr | upper | wrap("<b>","</b>") $}`.
- Trim flags are supported: `{$- expr -$}` trims surrounding whitespace/newlines.
- Directives, formatter descriptors, and alternate delimiters are NOT supported.
- If an embedded expression uses `await`, the enclosing evaluation context must be async.

Interpolated strings are the recommended default for everyday text generation.

---

## §16 Template Fences

*(This section is normative.)*

### §16.1 Fence Syntax and Descriptors

Template fences produce `lang.template.Template` values. The opener is a run of **3 or more backticks** at the anchor position, followed by the descriptor. The closer is a line containing a backtick run of **exactly the same length** as the opener at the anchor position, with nothing else on the line.

**Basic form (3 backticks):**

`````
```(language):(format)
... content ...
```
`````

**Extended form (4+ backticks) for nesting.** When a fence body must contain literal backtick sequences (for example, when generating Loom source that itself contains template fences), use more backticks on the outer fence. The parser only closes the fence when it encounters the exact same backtick count as the opener:

``````
````(loom):(none)
  func render(): View {
    return ```(html):(none)
      <p>hello</p>
    ```;          ← 3 backticks: literal content inside a 4-backtick fence
  }
````              ← 4 backticks: closes the outer fence
``````

**Exact-match rule.** A closer must have exactly the same number of backticks as its opener — no more, no fewer. A line inside the fence with fewer backticks than the opener is always literal content. A line with more backticks than the opener is also literal content. Only an exact match at the anchor position closes the fence. This is deliberately stricter than CommonMark (which allows "same or longer") to ensure unambiguous intent when reading nested fences.

**Practical nesting depths:**

```
3 backticks  → closes at 3  → use as outermost when content has no fences
4 backticks  → closes at 4  → use when content contains 3-backtick fences
5 backticks  → closes at 5  → use when content contains 3- and 4-backtick fences
```

In practice, generation tasks rarely require more than 4-backtick fences. Five or more indicates a deeply recursive generation pipeline that should probably be restructured.

Fences follow the same anchor `P` alignment rule as multiline strings.

**Descriptors:**

| Key | Description | Example |
|---|---|---|
| `language` | Target language | `py`, `ts`, `html`, `sql`, `ui` |
| `format` | Formatter | `prettier`, `black`, `none` (default) |
| `indent_type` | Indent unit | `"space"`, `"tab"` |
| `indent` | Indent shift | `+2`, `-1` |
| `eol` | Line ending | `"LF"`, `"CRLF"`, `"source"` |
| `components` | Component registry | `registry` (valid for `language=html` and `language=ui`) |

**Alternative delimiters** for meta-templating (handles `{$ $}` and `{% %}` collisions in generated output):

| Key | Default | Description |
|---|---|---|
| `stmt_open` | `{%` | Directive opener |
| `stmt_close` | `%}` | Directive closer |
| `expr_open` | `{$` | Expression opener |
| `expr_close` | `$}` | Expression closer |

`````
````(html):(format=prettier, stmt_open="[[", stmt_close="]]", expr_open="<<", expr_close=">>")
[[ if (users.isEmpty()) ]]
  <p>No users.</p>
[[ end ]]
````
`````

Delimiter requirements: each opener/closer must be non-empty; `stmt_*` delimiters must not equal `expr_*` delimiters.

**Combining extended backticks with alternative delimiters.** When generating Loom that itself generates HTML, use extended backticks for the fence delimiter and alternative expression delimiters for interpolation:

``````
`````(loom):(expr_open="<<", expr_close=">>")
  let page = ````(html):(none)
    <h1>{$ title $}</h1>     ← {$ $} is literal in the output
    <p><< body >></p>        ← << >> is the outer interpolation
  ````;
`````
``````

### §16.2 Inline Expressions and Directives

**Inline expressions** insert rendered values:

```
{$ expr $}
{$- expr -$}           // trim flags
{$ expr | upper $}     // filter/pipe
```

**Template directives** provide control flow:

```
{% if (cond) %} ... {% elif (cond) %} ... {% else %} ... {% end %}
{% while (cond) %} ... {% end %}
{% for (init; cond; step) %} ... {% end %}
{% for (x in xs) %} ... {% end %}
{% do %} ... {% while (cond) %} ... {% end %}
{% match expr %} {% Variant(x) => %} ... {% end %}
```

**Named loops in templates:**

```
{% outer: for (let i=0; i<n; i=i+1) %} ... {% end %}
{% break outer %} / {% continue outer %}
```

**Try/catch emitter (buffered):**

```
{% try %} ... {% catch (Type | Other as err) %} ... {% finally %} ... {% end %}
```

**Compute-only statements** (emit nothing):

```
{% let x = expr; %}
{% var acc = 0; %}
{% do expr; %}
```

Bare expression statements in templates are NOT permitted; use `do` for side effects.

**Escaping.** Emit literal delimiter openers with backslash: `\{%`, `\{$` (or the active alternative delimiters).

### §16.3 Template as a Value

```
class Template {
  pub language: string;
  pub format: string;

  pub func render(scope: dict[string, Any]): string;
  pub func renderWith(ctx: RenderContext, scope: dict[string, Any]): string;
  pub func renderAsync(scope: dict[string, Any]): Task[string];
  pub func renderWithAsync(ctx: RenderContext, scope: dict[string, Any]): Task[string];

  pub func concat(other: Template): Template;
}

class RenderContext {
  pub language: string;
  pub format: string;
}
```

### §16.4 Rendering Semantics

The rendering pipeline converts values to text when inserted via `{$ expr $}` in templates and interpolated strings. The template's `RenderContext` (carrying `language` and `format`) is passed to rendering methods.

**`Renderable` interface:**

```
interface Renderable {
  func render(ctx: RenderContext): string;
}
```

Any class implementing `Renderable` controls its own text representation in templates.

**Rendering pipeline by type category:**

| Type Category | Rendering Behavior |
|---|---|
| `string` | Inserted as-is (no conversion) |
| `int`, `float`, `bool` | Auto-boxed at the render boundary; rendered via the boxed type's `render(ctx)` method (e.g., `Int.render(ctx)` produces the decimal string representation) |
| `Int`, `Float`, `Bool`, `String`, `Bytes` (boxed) | Rendered via their `render(ctx)` method |
| `bytes` | **Error** — `bytes` insertion is a compile-time error unless converted via a filter (e.g., `{$ data \| base64 $}`) |
| Class implementing `Renderable` | Calls `instance.render(ctx)` |
| Class NOT implementing `Renderable` | Falls through to `Any.render()` (see below) |
| `enum` variants | Auto-boxed at the render boundary; rendered via the boxed enum's `render(ctx)` method, which produces the variant name and payload (e.g., `"Some(42)"`, `"Err(\"not found\")"`) |
| `Option[T]` — `Some(v)` | Renders the inner value `v` using `v`'s rendering rule |
| `Option[T]` — `None` | Renders as the empty string `""` |
| `Result[T,E]` — `Ok(v)` | Renders the inner value `v` using `v`'s rendering rule |
| `Result[T,E]` — `Err(e)` | **Runtime error** — inserting an `Err` value is a rendering error (hard fail) |
| `Task[T]` | **Error** — `Task[T]` values are never auto-awaited; inserting a `Task` without `await` is a compile-time error in both templates and interpolated strings |
| `None` (standalone) | Renders as the empty string `""` |
| `Any` | Dispatches to the runtime type's `render(ctx)` method if the boxed value implements `Renderable`; otherwise uses `Any.render()` default |

**Default `Any.render()` behavior:**

The default `Any.render()` produces a debug-style string representation: `<TypeName>` for class instances without `Renderable`, or the result of the boxed value's own rendering if the underlying type has one. User classes can override this by implementing `Renderable`, which takes precedence over the default `Any.render()` fallback. The runtime uses `core.reflect.typeOf` (§21.11) to determine the boxed value's type name for the default representation.

### §16.5 Failure Policy (Templates)

- **Hard fail by default** for evaluation errors, formatter errors, and bad descriptors.
- **Emitter try/catch (buffered):** the `try` body buffers; on failure emits nothing. An empty `catch` body swallows the error.
- `render` and `renderWith` fail if evaluation reaches `await`; use `renderAsync` or `renderWithAsync`.
- **Uncatchable:** parse/lex errors and alignment violations.

### §16.6 HTML Context Rendering

*(This section is normative. It applies only to `language=html` fences. Other language fences are unaffected.)*

`html` fences apply **context-aware auto-escaping** to all interpolated values. The position of a `{$ expr $}` in the HTML output determines how the rendered string is escaped before insertion. This is the primary defence against cross-site scripting (XSS) injection.

#### §16.6.1 HTML Context Tracking

The parser tracks the current HTML context as it processes the fence body. The four recognised contexts are:

| Context | Example position | Escaping applied |
|---|---|---|
| `text` | Between element tags: `<p>{$ x $}</p>` | HTML entity encoding |
| `attr-value` | Inside quoted attribute: `class="{$ x $}"` | HTML attribute encoding |
| `url-attr` | URL-valued attribute: `href="{$ x $}"` | URL validation + attribute encoding |
| `raw` | Via `raw` filter: `{$ x \| raw $}` | None — developer asserts safety |

Unquoted attribute values (`<tag attr={$ x $}>` without surrounding quotes) are a **compile-time error** in `html` fences. All dynamic attributes must be quoted.

#### §16.6.2 Text Context Escaping

An interpolation `{$ expr $}` in text position (between element tags) applies HTML entity encoding to the rendered string before insertion:

| Character | Escaped as |
|---|---|
| `&` | `&amp;` |
| `<` | `&lt;` |
| `>` | `&gt;` |

```
func UserCard(name: string): View {
  return ```(html):(none)
    <div class="card">{$ name $}</div>
  ```;
}
// name = "<script>alert(1)</script>"
// Output: <div class="card">&lt;script&gt;alert(1)&lt;/script&gt;</div>
```

#### §16.6.3 Attribute Value Context Escaping

An interpolation inside a quoted attribute value applies attribute encoding — entity-encoding `&`, `<`, `>`, `"`, and `'`:

| Character | Escaped as |
|---|---|
| `&` | `&amp;` |
| `<` | `&lt;` |
| `>` | `&gt;` |
| `"` | `&quot;` |
| `'` | `&#x27;` |

```
<input value="{$ userInput $}" placeholder="{$ hint $}" />
// userInput = `say "hello"` → value="say &quot;hello&quot;"
```

#### §16.6.4 URL Attribute Context

The following HTML attributes are recognised as URL-valued: `href`, `src`, `action`, `formaction`, `data`, `poster`, `cite`, `ping`, `manifest`, `itemid`.

When an interpolation appears in a URL-valued attribute, the compiler:

1. Requires the interpolated value to be of type `core.text.Url` (see §16.6.7). A bare `string` emits a compile-time lint warning.
2. Validates that the URL's scheme is not `javascript:` or `vbscript:`. A `javascript:` scheme is a **compile-time error** when statically detectable. At runtime, `Url.of()` throws `UrlError` for disallowed schemes.
3. Applies attribute encoding to the rendered URL string (same rules as §16.6.3).

```
// Compile-time error: javascript: scheme detected statically
<a href="{$ "javascript:alert(1)" $}">click</a>

// Lint warning: bare string — Url.of() validation bypassed
<a href="{$ userProvidedPath $}">link</a>

// Correct: Url.of() validates scheme and encodes
<a href="{$ Url.of(userProvidedPath) $}">link</a>

// Compile-time constant — trusted, no warning
<a href="{$ Url.trusted("/about") $}">about</a>
```

#### §16.6.5 `<script>` and `<style>` Prohibition

Interpolations inside `<script>` or `<style>` blocks in an `html` fence are a **compile-time error**. Encoding for JavaScript and CSS contexts is significantly more complex than HTML encoding and cannot be specified as a simple character substitution table. The correct patterns are:

- Pass data from Loom to JavaScript via the structured state serialization mechanism (§19.7) or via `data-` attributes, then read those from JavaScript after the Wasm module loads.
- Never inject Loom values directly into inline `<script>` blocks.

```
// COMPILE-TIME ERROR:
<script>
  var name = "{$ userName $}";
</script>

// CORRECT: data attribute + read from JS/Wasm interop
<div id="app" data-user="{$ userName $}"></div>
```

#### §16.6.6 Raw Output Opt-Out

When pre-escaped HTML must be inserted without further escaping, the `raw` filter is required:

```
{$ trustedHtmlContent | raw $}
```

The `raw` filter suppresses all context-aware escaping. The compiler emits a lint warning when `raw` is applied to a value that is not:

- A compile-time string literal.
- A value of type `SafeHtml` (see §16.6.7).
- A value returned by `renderToString` or another function whose declared return type is `SafeHtml`.

#### §16.6.7 `SafeHtml` and `Url` Types

**`SafeHtml`** is a wrapper type for pre-escaped, trusted HTML content. Values of type `SafeHtml` are inserted without escaping in text and attribute-value contexts. Defined in `lang.template`, available on all targets:

```
class SafeHtml : Any implements Renderable {
  let content: string;

  // Trusted constructor — compile-time constants and Loom rendering output only.
  // Using this with user-provided input is a security defect.
  pub static func of(trusted: string): SafeHtml;

  pub func render(ctx: RenderContext): string => content;  // no escaping
}
```

`SafeHtml` values produced by Loom's own rendering pipeline (e.g., output of `renderToString`, or a nested `View` rendered to string) are automatically typed as `SafeHtml` and pass through without double-escaping.

**`Url`** is a wrapper type for validated URLs. Defined in `core.text`, available on all targets:

```
namespace core.text;

class Url : Any implements Renderable {
  pub let href: string;

  // Validates scheme (rejects javascript:, vbscript:) and normalises.
  // Throws UrlError for malformed or disallowed URLs.
  pub static func of(raw: string): Url;

  // Trusted constructor — bypasses validation. Use only for compile-time string literals.
  pub static func trusted(literal: string): Url;

  pub func render(ctx: RenderContext): string => href;
}

class UrlError : Exception {
  pub let scheme: string?;
}
```

#### §16.6.8 Context Escaping in SSR Output

When `renderToString` renders a component tree containing `html` fences, the context-aware escaping in this section applies at render time. The return value of `renderToString` is typed as `SafeHtml` — it has passed through the full escaping pipeline and may be safely embedded in an outer HTML context without further escaping.

---

### §16.7 CSS Context Fences

*(This section is normative.)*

The `css` language descriptor in a template fence produces a **`StyleSheet`** value — a typed, scoped bundle of CSS rules. Class names are automatically mangled to a hash-scoped form, preventing collisions between components.

```loom
let styles = ``(css)
  .container {
    display: flex;
    flex-direction: column;
    padding: 16px;
    gap: 8px;
  }

  .button {
    font-size: 14px;
    font-weight: 600;
    border-radius: 4px;
  }

  .button:hover {
    opacity: 0.85;
  }
``;

// styles.container → ClassName("container-a3f9b2")
// styles.button    → ClassName("button-a3f9b2")
```

#### §16.7.1 `StyleSheet` and `ClassName`

```loom
namespace web.css;

// A scoped CSS class name string (e.g. "container-a3f9b2")
// Implements Renderable — renders as the class name string
class ClassName : Any implements Renderable {
  pub let raw: string;          // the scoped, collision-free class name
  pub func render(ctx: RenderContext): string;   // returns raw (ctx is ignored for ClassName)
  pub func toString(): string;                   // same as render(ctx), context-free
}

// The product of a css fence.
// Each top-level rule becomes a property of type ClassName.
// Use styles.ruleName to retrieve the ClassName for a rule.
class StyleSheet : Any {
  // Dynamic lookup — for programmatic access by rule name (camelCase)
  pub func get(ruleName: string): ClassName;

  // Returns the full compiled CSS string (all rules, scoped names substituted)
  pub func toCSS(): string;
}
```

**Name mangling.** The scope suffix is a 6-character hash derived from the source file path and the fence's source location. This guarantees that two components defining `.button` produce distinct class names (`button-a3f9b2` and `button-c7d412`) that do not conflict when mounted in the same document.

**Shadow-root CSS encapsulation (normative).** When a `css` fence is evaluated inside the `render()` method of a `@webcomponent` class (§19.10), hash-scoped class name mangling is suppressed. Instead, the compiled `StyleSheet` is attached to the element's shadow root via the Constructable Stylesheets API (`CSSStyleSheet.replace()` + `shadowRoot.adoptedStyleSheets`). The shadow root boundary provides equivalent isolation without name mangling. This rule applies only to `css` fences whose lexically enclosing function is the `render()` method of a `@webcomponent` class; all other `css` fences continue to use hash-scoped mangling.

**Rule access.** CSS selectors that are valid Loom identifiers are accessible as direct property names on the `StyleSheet` value. Selectors containing non-identifier characters (e.g. `.my-button`, `.grid-2col`) are accessed via `styles.get("myButton")` using camelCase:

```loom
let cls = styles.get("gridItem");   // for rule .grid-item
```

#### §16.7.2 Dynamic Values

CSS property values may embed Loom expressions with `{$ expr $}`:

```loom
let spacing: int = 16;
let brand: string = "#0066cc";

let styles = ``(css)
  .card {
    padding: {$ spacing $}px;
    border-color: {$ brand $};
    border-width: {$ spacing / 4 $}px;
  }
``;
```

Dynamic values are interpolated at the time the fence expression is evaluated. The resulting `StyleSheet` is immutable — it captures the values at evaluation time. For styles that must react to signal changes, re-evaluate the fence expression inside an `effect` or computed value (§19.1).

**Type safety.** Expressions inside CSS fences must evaluate to `string`, `int`, `float`, or `float32`. Values of other types are a compile-time error. `int` and `float` values are rendered without units — append the unit string explicitly: `{$ value $}px`.

#### §16.7.3 Injection into Documents and Components

**In `html` fences.** Use `styles.toCSS()` to inject a `<style>` block, or reference class names directly:

```loom
let page = ``(html)
  <style>{$ styles.toCSS() | raw $}</style>
  <div class="{$ styles.container $}">
    <button class="{$ styles.button $}">Click</button>
  </div>
``;
```

**In `ui` fences.** The `class` attribute accepts `ClassName` directly:

```loom
let view = ``(ui)
  <Column class={styles.container}>
    <Button class={styles.button}>Click</Button>
  </Column>
``;
```

**Server-side rendering.** When rendering to string via `ui.web.renderToString`, all `ClassName` values referenced in the component tree are collected and their CSS is included in the generated `<style>` block automatically.

#### §16.7.4 Media Queries and Pseudo-Selectors

Media queries and pseudo-selectors are supported within `css` fences. Only top-level class selectors (`.ruleName { ... }`) produce `ClassName` properties on the returned `StyleSheet`. Other rule types (media queries, keyframes, `@font-face`) are compiled into the CSS output but are not directly addressable:

```loom
let styles = ``(css)
  .hero {
    font-size: 32px;
  }

  @media (max-width: 768px) {
    .hero {
      font-size: 22px;
    }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
``;

// styles.hero is a ClassName — the @media and @keyframes are in toCSS() output
```

#### §16.7.5 Availability

`css` fences are available on all targets:

| Target | Behavior |
|---|---|
| `browser` | `StyleSheet.toCSS()` is injected into a `<style>` element by the Loom runtime |
| `service` / SSR | `toCSS()` is inlined in the SSR `<style>` block |
| `native` | `StyleSheet` is passed to `ui.desktop` as a style descriptor; CSS properties are translated to the platform rendering model |
| `cli` | `css` fences are valid but `toCSS()` simply returns the CSS string — no DOM is available |


---

## §16.8 GPU/Compute Fence Descriptors

*(This section is normative. Applies to `@compiled --target native` and `browser` targets where WebGPU is available.)*

Three additional language descriptors extend the template fence system (§16.1) for GPU kernel authoring. These fences produce `GpuKernel` values (§21.30) rather than `Template` strings. The fence body is a shader program in the target shading language; `{$ expr $}` interpolations inject Loom compile-time constant expressions as shader constants.

### §16.8.1 `wgsl` — WebGPU Shading Language

```loom
from native.gpu import (GpuKernel, GpuBuffer, dispatch);

let WGSIZE: int = 256;

let addKernel = GpuKernel.compile(```(wgsl):(none)
  @group(0) @binding(0) var<storage, read_write> out: array<f32>;
  @group(0) @binding(1) var<storage, read>       a  : array<f32>;
  @group(0) @binding(2) var<storage, read>       b  : array<f32>;

  @compute @workgroup_size({$ WGSIZE $}, 1, 1)
  fn main(@builtin(global_invocation_id) gid: vec3u) {
    let i = gid.x;
    if (i < arrayLength(&out)) {
      out[i] = a[i] + b[i];
    }
  }
```, constants={ WGSIZE: WGSIZE });
```

**Rules:**
- The `wgsl` descriptor is valid on `browser` targets and on native targets with a WebGPU-capable GPU backend.
- Only compile-time constant Loom expressions (`int`, `float32`, `bool`) are permitted in `{$ expr $}` interpolations inside `wgsl` fences. Runtime values are a compile-time error.
- The fence body must be valid WGSL. Syntax errors in the fence body are reported as compile-time errors when the containing file is processed by `loom build --check`; at runtime, `GpuKernel.compile` throws `GpuCompileError` on shader compilation failure.
- Multiple entry points (`@compute`, `@vertex`, `@fragment`) are permitted in a single fence.

### §16.8.2 `metal` — Metal Shading Language

```loom
from native.gpu import (GpuKernel, dispatch);

let kernel = GpuKernel.compile(```(metal):(none)
  #include <metal_stdlib>
  using namespace metal;

  kernel void vectorAdd(
    device const float* a [[ buffer(0) ]],
    device const float* b [[ buffer(1) ]],
    device       float* c [[ buffer(2) ]],
    uint id [[ thread_position_in_grid ]]
  ) {
    c[id] = a[id] + b[id];
  }
```, entryPoint="vectorAdd");
```

**Rules:**
- The `metal` descriptor is valid on `--os macos` and `--os ios` native targets only. Using it on other targets is a compile-time error.
- Only `int`, `float32`, and `bool` compile-time constants are permitted in `{$ expr $}` interpolations.

### §16.8.3 `glsl` — OpenGL/Vulkan Compute Shader

```loom
from native.gpu import (GpuKernel, dispatch);

let kernel = GpuKernel.compile(```(glsl):(none)
  #version 450
  layout(local_size_x = {$ LOCAL_X $}) in;

  layout(std430, binding = 0) buffer Out { float data[]; } out_buf;
  layout(std430, binding = 1) buffer A   { float data[]; } a_buf;
  layout(std430, binding = 2) buffer B   { float data[]; } b_buf;

  void main() {
    uint i = gl_GlobalInvocationID.x;
    out_buf.data[i] = a_buf.data[i] + b_buf.data[i];
  }
```, constants={ LOCAL_X: 64 });
```

**Rules:**
- The `glsl` descriptor targets Vulkan compute shaders on Linux, Windows, and Android native targets.
- GLSL version must be `#version 450` or higher (Vulkan GLSL).
- `{$ expr $}` interpolations are valid for compile-time integer constants only.

### §16.8.4 Fence Body Compilation Model

GPU compute fences follow the same multi-backtick nesting rules as all other fences (§16.1). The `constants` map in `GpuKernel.compile` receives a `dict[string, Any]` whose values must be compile-time constants. The fence interpolations `{$ expr $}` are evaluated at the time the fence expression is evaluated and substituted into the shader source string before it is passed to the GPU driver for compilation. This allows loop unrolling counts, workgroup sizes, and compile-time feature flags to be expressed as Loom values rather than magic numbers in the shader source.


---

## §17 Concurrency

*(This section is normative.)*

### §17.1 `async`/`await`

Loom supports asynchronous functions and explicit suspension via `await`:

```
async func buildPage(): Task[string] {
  let userTask = fetchUser();
  let postsTask = fetchPosts();
  let user = await userTask;
  let posts = await postsTask;
  return renderPage(user, posts);
}
```

- `async func name(...): T { ... }` declares a function whose call result is `Task[T]`.
- Calling an async function starts the task immediately and returns its `Task[T]`.
- `await expr` requires `expr` to have type `Task[T]`; it suspends until the task completes and evaluates to `T`.
- If the awaited task has failed, `await` rethrows the failure.
- `await` is permitted inside `async func` bodies, entry scripts, REPL sessions, and async template rendering contexts.
- `await` is prohibited during module initialization — imported modules may not suspend during initialization.
- `try`/`catch`, `finally`, `defer`, and lexical scope behave identically across suspension points as in synchronous code.
- `Task[T]` is a first-class class value (`Any`); it is never implicitly converted to `T`.
- Inserting a `Task[T]` into templates without `await` is an error.

### §17.2 `await group`

The `await group` block is the primary structured concurrency primitive for heterogeneous concurrent tasks:

```
async func loadDashboard(userId: string): Task[Dashboard] {
  let user: User;
  let config: Config;
  let flags: FeatureFlags;

  await group {
    user   = spawn fetchUser(userId);
    config = spawn fetchConfig();
    flags  = spawn fetchFlags(userId);
  }

  return buildDashboard(user, config, flags);
}
```

**Rules:**

- `await group { ... }` is a block statement requiring an `async` context.
- `spawn expr` starts `expr` (type `Task[T]`) as a child task owned by the group. `spawn` is a contextual keyword valid only inside `await group`.
- `binding = spawn expr` is sugar: the binding receives the resolved `T` value after the group exits normally.
- All spawned tasks must complete or be cancelled before the block exits.
- Storing a spawned `Task[T]` outside the group scope is a compile-time error (when statically detectable) or a runtime `LifetimeError`.
- If any spawned task fails, the group cancels all other children, waits for all to settle, then re-raises the failure.
- `CancellationError` is thrown at the next `await` point inside a cancelled task.
- `defer` inside `await group` runs after all children have settled.

**Nesting with timeout:**

```
async func loadWithTimeout(): Task[Dashboard] {
  return await TaskGroup.withTimeout(5000, async func() {
    let user: User;
    let feeds: list[Feed];
    await group {
      user  = spawn fetchUser("me");
      feeds = spawn fetchFeeds("me");
    }
    return buildDashboard(user, feeds);
  });
}
```

### §17.3 `TaskGroup`

`TaskGroup` provides static methods for homogeneous concurrent work:

```
class TaskGroup {
  pub static async func collect[T, R](items: list[T], body: async func(T): R): Task[list[R]];
  pub static func race[T, R](items: list[T], body: async func(T): R): AsyncIterable[R];
  pub static async func withTimeout[T](ms: int, body: async func(): T): Task[T];
  pub static async func withCancellation[T](body: async func(token: CancellationToken): T): Task[T];
}

class CancellationToken : Any {
  pub func cancel(): void;
  pub func isCancelled(): bool;
}
```

- `collect` runs `body` concurrently for each item and collects results. If any task fails, all remaining are cancelled.
- `race` returns results in completion order via `AsyncIterable[R]`.
- `withTimeout` cancels and throws `TimeoutError` if not complete within `ms` milliseconds.
- `withCancellation` provides a `CancellationToken` the caller can signal.

### §17.4 Async Iterators and `for await`

```
async func processLines(path: string): Task[void] {
  for await (line in runtime.fs.linesAsync(path)) {
    process(line);
  }
}
```

- `for await (x in xs) { ... }` requires an `async` context and `xs` to implement `AsyncIterable[T]`.
- `break` on a `for await` loop calls `asyncIter().close()` if that method exists.
- `for await` participates in structured concurrency cancellation.
- `CancellationError` thrown inside a `for await` loop body propagates normally (it is not caught by the loop itself).
- `for await` is permitted in template directives during async rendering.

### §17.5 Async Iterator Combinators

`AsyncIterable[T]` provides combinators mirroring the sync collection API:

```
func map[T, R](self: AsyncIterable[T], fn: fn(T): R): AsyncIterable[R];
func filter[T](self: AsyncIterable[T], fn: fn(T): bool): AsyncIterable[T];
func take[T](self: AsyncIterable[T], n: int): AsyncIterable[T];
func merge[T](a: AsyncIterable[T], b: AsyncIterable[T]): AsyncIterable[T];
func zip[A, B](a: AsyncIterable[A], b: AsyncIterable[B]): AsyncIterable[tuple[A, B]];
```

**Rules:**

- Combinators are lazy: they produce new `AsyncIterable` values without eagerly consuming the source.
- Cancellation propagates through combinator chains: cancelling a downstream consumer cancels upstream producers.
- Combinators compose naturally with `for await`: `for await (x in stream.filter(pred).map(transform)) { ... }`.
- Within structured concurrency blocks (`await group`), cancellation of the group propagates through any active combinator chains owned by the group's tasks.

### §17.6 Actors and Supervision

Actors provide sequential message processing with supervision:

**`Actor[M]`** processes messages of type `M` sequentially from a mailbox:

```
class Actor[M] : Any {
  pub func send(msg: M): void;
  pub func ask[R](msg: M): Task[R];
}
```

- `actor.send(msg)` delivers a message asynchronously. Messages are processed sequentially in send order.
- `actor.ask(msg)` sends a message and returns a `Task[R]` that resolves with the response.

**Supervision strategies:**

| Strategy | Behavior |
|---|---|
| `OneForOne` | Restart only the failed child actor |
| `AllForOne` | Restart all children when one fails |
| `RestForOne` | Restart the failed child and all children started after it |

**Actor lifecycle:** start → running → stopping → stopped. `defer` interacts with actor shutdown: deferred actions run during the stopping phase.

Actors and supervision trees are built on top of `await group` and `TaskGroup` primitives.

### §17.7 `weak` References in Concurrent Contexts

On the native ARC target, `weak` references interact with concurrency as follows:

- A `weak` field read in one task may yield `None` if the referent was released concurrently. ARC weak reference zeroing is atomic — this is not a data race.
- `Actor[M]` supervision trees that hold bidirectional parent↔child references should use `weak` for the child-to-parent reference to avoid retain cycles: the parent owns the child (strong reference), the child back-references the parent (weak reference).
- `await group` child tasks hold a strong reference to the group's scope for the duration of the task. Storing a spawned task handle in a `weak` field is permitted; the reference will be `None` once the task completes.
- Closures in `effect()` calls (§19.1) that reference the `EffectHandle` should use `[weak handle]` capture lists (§7.3) to avoid retain cycles.

On GC runtimes (scripted/Wasm), `weak` references behave consistently — the GC may collect the referent, after which reads return `None`. No additional concurrency rules apply since the runtime is cooperatively single-threaded.

### §17.8 OS Thread Parallelism (`--target native`)

*(This section is normative. It applies only to `@compiled` files targeting `--target native`. All constructs in this section are compile-time errors in scripted mode or `@compiled` files targeting Wasm.)*

Loom's cooperative async runtime runs on a single OS thread by default. For CPU-bound workloads on `--target native`, true parallelism is available via OS threads using the primitives in this section. For parallelizing async work itself across cores, see §17.9 (Multi-Threaded Async Executor). OS thread primitives are a lower-level interface intended for compute-heavy work and synchronous blocking operations.

#### §17.8.1 `Sendable` Interface

`Sendable` is a marker interface indicating that a type is safe to transfer across thread boundaries:

```loom
interface Sendable {}
```

**Implicit `Sendable` implementations.** The following types are implicitly `Sendable` without an explicit `implements Sendable` declaration:

- All primitive types: `int`, `float`, `bool`, `string`, `bytes`.
- All enum types whose variant payloads are all `Sendable`.
- All struct types whose fields are all `Sendable`, **except** structs that declare a `[lifetime ~name]` parameter or that contain any `borrow[~name]` field — such structs are implicitly non-`Sendable` regardless of the `Sendable`-ness of their field types. Explicitly declaring `implements Sendable` on a lifetime-parameterized struct is `E_SENDABLE_LIFETIME`.
- All enum types whose variant payloads are all `Sendable`, **except** enums that declare a `[lifetime ~name]` parameter or that contain `borrow[~name]` variant payloads — these are implicitly non-`Sendable` for the same reason.
- `Option[T]` and `Result[T, E]` when `T` and `E` are `Sendable`.
- `list[T]`, `set[T]`, `dict[K, V]` when all type arguments are `Sendable`. (Note: the collection itself is a value copy when passed across threads; mutations after transfer are not visible to the sender.)
- `Mutex[T]`, `RwLock[T]`, and `Atomic[T]` (see §17.8.2), regardless of `T`.
- Closures whose captured values are all `Sendable` are themselves `Sendable`.

**Explicit `Sendable`.** Classes must explicitly declare `implements Sendable`. The compiler does not infer `Sendable` for classes. A class declaring `Sendable` asserts that its author guarantees thread-safe access. The compiler does not verify this assertion — the author is responsible for correctness (typically by holding all mutable state in `Mutex[T]` or `RwLock[T]` fields).

```loom
@compiled

class EventCounter : Any implements Sendable {
  // All mutable state is protected by a mutex — safe to share across threads.
  let count: Mutex[int] = Mutex.new(0);

  pub func increment(): void {
    count.withLock(func(g) => g.set(g.get() + 1));
  }

  pub func value(): int {
    return count.withLock(func(g) => g.get());
  }
}
```

**Non-`Sendable` types.** Types not implementing `Sendable` may not cross thread boundaries. Attempting to capture a non-`Sendable` value in a `Thread.spawn` closure is a compile-time error.

#### §17.8.2 Shared Mutable State: `Mutex[T]`, `RwLock[T]`, `Atomic[T]`

```loom
namespace sync.thread;

class MutexGuard[T] : Any implements Scoped[T] {
  pub func get(): T;
  pub func set(value: T): void;
  pub func update(fn: fn(T): T): void;
  pub func release(): void;
}

class Mutex[T] : Any implements Sendable {
  pub static func new(initial: T): Mutex[T];
  pub func lock(): MutexGuard[T];
  pub func tryLock(): Option[MutexGuard[T]];
  pub async func lockAsync(): Task[MutexGuard[T]];
  pub func withLock[R](body: fn(MutexGuard[T]): R): R;
  pub func tryWithLock[R](body: fn(MutexGuard[T]): R): Option[R];
}

class RwLockReadGuard[T] : Any {
  pub func get(): T;
  pub func release(): void;
}

class RwLockWriteGuard[T] : Any {
  pub func get(): T;
  pub func set(value: T): void;
  pub func update(fn: fn(T): T): void;
  pub func release(): void;
}

class RwLock[T] : Any implements Sendable {
  pub static func new(initial: T): RwLock[T];
  pub func readLock(): RwLockReadGuard[T];
  pub func writeLock(): RwLockWriteGuard[T];
  pub func tryReadLock(): Option[RwLockReadGuard[T]];
  pub func tryWriteLock(): Option[RwLockWriteGuard[T]];
  pub func withRead[R](body: fn(RwLockReadGuard[T]): R): R;
  pub func withWrite[R](body: fn(RwLockWriteGuard[T]): R): R;
}

class Atomic[T] : Any implements Sendable {
  // T is restricted to int8, int16, int32, int64, uint8–uint64, float, or bool.
  pub static func new(initial: T): Atomic[T];
  pub func load(): T;
  pub func store(value: T): void;
  pub func swap(value: T): T;
  pub func compareExchange(expected: T, desired: T): bool;
  pub func fetchAdd(delta: T): T;   // numeric T only
  pub func fetchSub(delta: T): T;
  pub func fetchAnd(mask: T): T;    // integer T only
  pub func fetchOr(mask: T): T;
  pub func fetchXor(mask: T): T;
}
```

All operations on `Atomic[T]` use sequentially-consistent memory ordering. Weaker orderings are not exposed.

`Mutex[T]` and `RwLock[T]` implement `Sendable` unconditionally. Their internal lock is a native OS mutex/rwlock. Re-entrant locking (acquiring the same lock from within a `withLock`/`withRead`/`withWrite` callback) is a `LifetimeError` trap in debug builds and undefined behaviour in release builds.

All three types are in the `sync.thread` module and require `@compiled --target native`.

#### §17.8.3 `Thread` and `ThreadHandle`

```loom
namespace sync.thread;

class Thread : Any {
  // Spawn a new OS thread running `body`.
  // All values captured by `body` must implement Sendable — compile-time enforced.
  pub static func spawn(body: fn(): void): Thread;

  // Spawn and return a value. T must be Sendable.
  pub static func spawnWith[T: Sendable](body: fn(): T): ThreadHandle[T];

  // Block the calling thread until this thread completes.
  pub func join(): void;

  // Detach the thread; join() is no longer valid after this.
  pub func detach(): void;

  pub static func current(): Thread;
  pub static func sleep(ms: int): void;
  pub static func hardwareConcurrency(): int;

  pub let name: Option[string];
}

class ThreadHandle[T: Sendable] : Any {
  pub func join(): T;
  pub func detach(): void;
}
```

**Sendable enforcement.** The compiler inspects the free variables of the closure passed to `Thread.spawn` or `Thread.spawnWith`. If any captured variable's type does not implement `Sendable`, the compiler emits a compile-time error naming the non-`Sendable` captures. This is the primary mechanism preventing data races.

**`borrow[~label]` capture restriction.** Closures passed to `Thread.spawn` or `Thread.spawnWith` may not capture any `borrow[~label]` binding (`E_BORROW_THREAD_CAPTURE`). Because lifetime-parameterized structs are implicitly non-`Sendable`, the `Sendable` check prevents most cases; this rule additionally covers direct captures of `borrow[~label]` values that are not wrapped in a struct.

**Example — parallel chunk processing:**

```loom
@compiled

from sync.thread import (Thread, Mutex);

func parallelSum(chunks: list[list[int]]): int {
  let total = Mutex.new(0);   // Mutex[int] is Sendable

  let threads = chunks.map(func(chunk) =>
    Thread.spawn(func() {
      let local = chunk.fold(0, func(a, b) => a + b);
      total.withLock(func(g) => g.set(g.get() + local));
    })
  );

  for (t in threads) { t.join(); }

  return total.withLock(func(g) => g.get());
}
```

**Interaction with ARC.** ARC retain/release operations are atomic (see §23.4), making it safe to share strong references across threads. Closures passed to `Thread.spawn` retain their captured objects; the retain count is decremented when the closure completes or the `Thread` is joined. `weak` references may read `None` if the referent is released on another thread — ARC zeroing is atomic and always produces either a valid `None` or a valid pointer.

**Interaction with `async`/`await`.** OS threads and async tasks are separate execution models. A thread may not `await` async tasks. An async task may not call `Thread.spawn` directly (compile-time error in async context). To run thread-parallel work from an async context, use `ThreadPool.run` (§17.8.4).

#### §17.8.4 `ThreadPool`

```loom
namespace sync.thread;

class ThreadPool : Any implements Sendable {
  pub static func new(size: int): ThreadPool;
  pub static func withHardwareConcurrency(): ThreadPool;

  // Submit work to the pool. Returns a Task[T] that resolves when complete.
  // This is the bridge between the async event loop and OS thread parallelism.
  pub func run[T: Sendable](body: fn(): T): Task[T];

  pub func shutdown(): void;
}
```

`ThreadPool.run` submits work to the pool and returns a `Task[T]` that resolves when the work completes. An async function can `await pool.run(heavyWork)` to offload CPU work to a thread without blocking the event loop.

**`borrow[~label]` capture restriction.** Closures passed to `ThreadPool.run` may not capture any `borrow[~label]` binding (`E_BORROW_THREAD_CAPTURE`). The pool work item runs on a separate OS thread and may outlive the calling frame, invalidating any lifetime-labeled borrow. Plain `borrow` captures are separately prevented by the existing `Sendable` requirement on the closure's captured types.

```loom
@compiled

from sync.thread import (ThreadPool);

let pool = ThreadPool.withHardwareConcurrency();

async func renderAllFrames(frames: list[Frame]): Task[list[bytes]] {
  return await TaskGroup.collect(frames, async func(frame) {
    return await pool.run(func() => frame.render());  // CPU work on thread
  });
}
```

#### §17.8.5 Restrictions

| Restriction | Reason |
|---|---|
| Non-`Sendable` captures in `Thread.spawn` / `spawnWith` closures | Prevents data races — compile-time error |
| `await` inside thread body closures | Async tasks are event-loop-bound — compile-time error |
| `core.inspect` inside thread bodies | Live runtime registry is not thread-safe — compile-time error |
| `dynamic class` instances crossing thread boundaries | Dynamic fields are not thread-safe — non-`Sendable` by default |
| `Thread`, `ThreadPool`, `Mutex`, `RwLock`, `Atomic` in scripted mode or Wasm targets | OS threads unavailable — compile-time error |
| `spawnBlocking` in scripted mode or Wasm targets | Available — backed by host thread pool; see §17.10.1 |
| `native.simd` and `Vec[T, N]` outside `--target native` | SIMD intrinsics require native code generation |
| `@vectorize` outside `@compiled` | Ignored in scripted mode; compile-time warning |

**Data race freedom guarantee.** Any program that passes all compile-time `Sendable` checks is free of data races on objects visible to `core.reflect`. The guarantee does not extend to `extern native` objects accessed from multiple threads — native thread safety is the FFI caller's responsibility.



---

## §17.9 Multi-Threaded Async Executor

*(This section is normative. Executor configuration (`RuntimeConfig`, `ExecutorConfig`, work-stealing executor, `@concurrent`, actor isolation, `ThreadLocal[T]`) applies to `@compiled` files targeting `--target native` and is a compile-time error elsewhere. `spawnBlocking` is available on all targets including scripted mode and Wasm — see §17.10.1. `TaskLocal[T]` is available on all targets including scripted mode and Wasm.)*

The default Loom async executor is a cooperative, single-threaded event loop. For programs that require true parallel execution of async tasks across CPU cores, the executor may be reconfigured to a **work-stealing multi-threaded model** via the `RuntimeConfig` API.

### §17.9.1 `ExecutorConfig` and `RuntimeConfig`

```loom
namespace runtime;

enum ExecutorConfig {
  SingleThreaded;                    // Default — cooperative, single OS thread
  MultiThreaded(workers: int);       // Explicit worker count
  MultiThreaded;                     // Defaults to Thread.hardwareConcurrency()
}

struct RuntimeConfig {
  asyncExecutor: ExecutorConfig = ExecutorConfig.SingleThreaded;
  blockingPoolSize: int = 512;       // Max threads in the blocking pool (§17.9.3)
}

// Configure the runtime. Must be called before any await expression evaluates.
// Typically the first call in main(). Calling after the event loop starts
// throws RuntimeConfigError.
func configure(config: RuntimeConfig): void;
```

**Single-threaded (default).** `ExecutorConfig.SingleThreaded` preserves the cooperative, single-threaded model exactly as specified in §2.1. No additional `Sendable` constraints are applied to async task captures — the executor is deterministic and race-free by construction.

**Multi-threaded.** `ExecutorConfig.MultiThreaded` activates a work-stealing executor:

- Each worker thread runs the Loom async task scheduler cooperatively on its own OS thread.
- Tasks are load-balanced automatically via work-stealing: each worker has a local task queue and steals from peer queues when idle.
- The worker count defaults to `Thread.hardwareConcurrency()` when not specified.
- The executor is created at `runtime.configure()` time and persists for the process lifetime.

**Example — opting into multi-threaded execution:**

```loom
@compiled

from runtime import (RuntimeConfig, ExecutorConfig);

async func main(): Task[void] {
  // Must be the first statement — before any await
  runtime.configure(RuntimeConfig(
    asyncExecutor: ExecutorConfig.MultiThreaded,
  ));

  // From this point, spawned async tasks run on any worker thread
  let results = await TaskGroup.collect(urls, async func(url) => fetch(url));
}
```

`runtime.configure` is a top-level call that SHALL appear before any `await` expression in the entry point. The compiler emits a warning if `await` precedes `runtime.configure` in the same function. At runtime, calling `runtime.configure` after the event loop has started is a `RuntimeConfigError`.

### §17.9.2 Work-Stealing Executor Semantics

When `ExecutorConfig.MultiThreaded` is active:

- **Task distribution.** Tasks spawned via `spawn`, `TaskGroup.collect`, and `async func` calls are placed on the spawning thread's local task queue. Idle worker threads steal tasks from peer queues.
- **Cooperative scheduling.** Each worker cooperatively schedules tasks at `await` points. A task does not preempt another task on the same worker.
- **Thread affinity.** There is no guaranteed affinity between a task and a specific worker thread. A task may resume on a different worker after an `await` — this is the fundamental reason `Sendable` constraints apply (§17.9.4).
- **Completion ordering.** Tasks within a single `await group` or `TaskGroup.collect` call complete in arbitrary order, as in single-threaded mode. Result assembly is handled by the structured concurrency primitives.
- **Sendability enforcement.** In multi-threaded executor mode, async task captures are subject to `Sendable` constraints at the call site (§17.9.4).

### §17.9.3 `spawnBlocking` — Blocking Work Bridge

```loom
namespace sync.thread;

// Runs `body` on the dedicated blocking thread pool.
// Returns a Task[T] that resolves when body completes.
// T must be Sendable so the result can cross back to the async executor.
// Available on all targets including scripted mode and Wasm (see §17.10.1).
func spawnBlocking[T: Sendable](body: fn(): T): Task[T];

// Variant with timeout (ms). Throws BlockingTimeoutError if body does not
// complete within the allotted milliseconds.
func spawnBlockingWithTimeout[T: Sendable](ms: int, body: fn(): T): Task[T];

class BlockingTimeoutError : Exception {
  pub let timeoutMs: int;
}
```

`spawnBlocking` runs a synchronous closure on a **blocking thread pool** that is separate from the async executor's worker threads. This prevents CPU-bound or synchronous blocking work from stalling the event loop.

**Blocking pool sizing.** The pool is sized by `RuntimeConfig.blockingPoolSize` (default 512). Threads are created on demand and reused. If all threads are occupied and the pool is at capacity, `spawnBlocking` enqueues the work and the calling task suspends until a thread is available.

**Availability.** `spawnBlocking` is available in all executor modes and on all targets including scripted mode, Wasm, and `--target native`. See §17.10.1 for scripted-mode and Wasm-specific semantics. In all cases it offloads work off the async event loop and is the recommended path for any synchronous operation that could block for more than ~1 ms.

**`ThreadPool` vs `spawnBlocking`.** `ThreadPool` (§17.8.4) is a manually-managed pool with explicit lifecycle, suitable when the program controls pool sizing and shutdown timing. `spawnBlocking` uses the runtime-managed blocking pool and is the recommended default for ad-hoc blocking work.

**Error semantics.** If `body` throws an exception, the exception propagates from the `await spawnBlocking(...)` call site as if thrown directly in the async context.

**Example:**

```loom
@compiled

from sync.thread import (spawnBlocking);

async func processImage(path: string): Task[bytes] {
  let raw = await runtime.fs.readAsync(path);
  // encode() is CPU-bound synchronous work — offload to blocking pool
  let encoded = await spawnBlocking(func() => encode(raw));
  return encoded;
}
```

### §17.9.4 Task Sendability Rules (Multi-Threaded Executor)

The executor mode determines whether `Sendable` constraints apply to async task closures:

**Rule 1 — Single-threaded executor.** In `SingleThreaded` executor mode, async task closures (the body of `spawn`, `async func` calls, `TaskGroup.collect` callbacks) may capture any type. No `Sendable` constraint is imposed.

**Rule 2 — Multi-threaded executor.** In `MultiThreaded` executor mode, async task closures SHALL only capture values whose types implement `Sendable`. A non-`Sendable` capture at a `spawn` or `async func` call site is a compile-time error naming the offending captured variables.

```loom
@compiled

// In MultiThreaded executor mode:
let sharedCache: Cache = Cache.new();   // Cache does not implement Sendable

async func fetch(): Task[void] {
  let data = await spawn download();          // OK: captures nothing non-Sendable
  let r = await spawn process(sharedCache);   // ERROR: Cache is not Sendable
}
```

**Rule 3 — Binary-level enforcement.** The executor mode is a property of the binary, determined by the `runtime.configure()` call in the entry point. The compiler enforces Rule 2 for all async captures in all `@compiled --target native` files when the program is configured for `MultiThreaded` execution.

**Rule 4 — `@concurrent` forces Sendable regardless of mode.** Functions annotated `@concurrent` (§17.9.5) are always subject to `Sendable` capture constraints, regardless of the active executor mode.

### §17.9.5 `@concurrent` Annotation

`@concurrent` on an `async func` declaration asserts that the function is safe to invoke from any executor thread. The compiler enforces:

- All values captured in the function body and its nested async closures implement `Sendable`.
- The function body does not directly read or write any module-level `var` bindings (module-level mutable state is not thread-safe without explicit synchronization).

```loom
@compiled

@concurrent
async func fetchAll(urls: list[Url]): Task[list[Response]] {
  return await TaskGroup.collect(urls, async func(url) => fetch(url));
}
```

`@concurrent` is checked at compile time. It does not alter runtime behavior — it is a documentation and safety-enforcement tool for library authors writing functions intended to work correctly in multi-threaded executor contexts. Callers are not required to verify whether a callee is `@concurrent`; enforcement is on the declared function's own captures and body.

### §17.9.6 Actor Isolation in Multi-Threaded Contexts

The `Actor[M]` model (§17.6) is inherently safe in multi-threaded executor contexts without changes to the actor API.

**Rule: Actors are implicitly `Sendable`.** `Actor[M]` instances implement `Sendable` unconditionally. The actor's internal state is accessed only from the actor's serial message handler, which processes one message at a time on a single thread at a time regardless of which worker is executing. This makes `Actor[M]` a safe island of serial state within a concurrent executor.

**Rule: Non-`Sendable` state may be held inside actors.** Because the message handler is serial, actor-private state does not need to implement `Sendable`. Non-`Sendable` types may be used freely as internal actor state.

**Rule: Message types must be `Sendable` in multi-threaded mode.** Messages sent via `Actor[M].send(msg)` or `Actor[M].ask(msg)` cross thread boundaries (from the sender's worker to the actor's handler). When `ExecutorConfig.MultiThreaded` is active, `M` must implement `Sendable`. This is enforced at the call sites of `send` and `ask` — compile-time error if `M` is not `Sendable`.

```loom
@compiled

// Internal state does not need to be Sendable — stays inside the actor
class LocalState : Any {
  var counter: int = 0;
}

// Messages DO need to be Sendable — they cross thread boundaries
enum CounterMsg {
  Increment;
  Reset;
}

// CounterMsg is implicitly Sendable (all-unit enum with no non-Sendable payloads)
// so Actor[CounterMsg] is valid in MultiThreaded executor mode.
```

In `SingleThreaded` executor mode, `M` has no `Sendable` constraint. The restriction is imposed only when the active executor is `MultiThreaded`.

### §17.9.7 Thread-Local Storage (`ThreadLocal[T]`)

```loom
namespace sync.thread;

// Available on --target native only; compile-time error on Wasm and scripted mode.
class ThreadLocal[T] : Any {
  // Creates a new ThreadLocal. `init` is called once per OS thread on first access.
  pub static func new(init: fn(): T): ThreadLocal[T];

  // Returns this thread's value, initializing lazily on first call.
  pub func get(): T;

  // Replaces this thread's value.
  pub func set(value: T): void;

  // Resets to uninitialized; `init` will be called on next `get()`.
  pub func reset(): void;
}
```

`ThreadLocal[T]` is implicitly `Sendable` regardless of `T`, because the `T` value is never shared across threads — each OS thread holds an independent instance.

**Semantics:**

- `get()` in an async task body returns the value for the **OS worker thread** currently executing the task, not the task itself. In a multi-threaded executor, a task may observe different thread-local values if it resumes on a different worker after an `await`. If thread-following semantics are required, use `TaskLocal[T]` (§17.9.8).
- `get()` in a `spawnBlocking` body returns the value for the blocking pool thread executing the closure.
- Thread-local values are destroyed when the OS thread exits.

**Use cases:** Per-thread allocator scratch buffers, PRNG state, thread-specific profiling contexts.

### §17.9.8 Task-Local Storage (`TaskLocal[T]`)

```loom
namespace runtime;

// Available on all targets including Wasm and scripted mode.
class TaskLocal[T] : Any {
  pub static func new(): TaskLocal[T];

  // Installs `value` for the current task and all child tasks spawned within `body`.
  // Returns a Task[R] that resolves with body's result.
  pub func withValue[R](value: T, body: async fn(): R): Task[R];

  // Returns the value set by the nearest enclosing withValue() in this task's
  // ancestry, or None if not set.
  pub func get(): Option[T];
}
```

`TaskLocal[T]` provides values that follow the **logical task tree** rather than the physical OS thread, making them stable across thread hops in a multi-threaded executor.

**Semantics:**

- `get()` returns `Some(value)` within the dynamic extent of a `withValue` call, including in all child tasks spawned during that extent.
- `get()` returns `None` outside any `withValue` call.
- Child tasks inherit the task-local value at the time of spawning. Subsequent `withValue` calls in the parent task do not affect already-running children.
- `get()` inside a `spawnBlocking` body returns `None` — task-local values do not cross the async-to-blocking-thread boundary.

**Example — request-scoped tracing ID:**

```loom
@compiled

from runtime import (TaskLocal);

let requestId = TaskLocal[string].new();

async func handleRequest(id: string): Task[void] {
  return await requestId.withValue(id, async func() {
    await processStep1();        // requestId.get() == Some(id)
    await processStep2();        // still Some(id), even after a thread hop

    await TaskGroup.collect(subTasks, async func(task) {
      print(requestId.get()!);   // inherited by child tasks
      await task.execute();
    });
  });
}
```

`TaskLocal[T]` is the primary mechanism for propagating request-scoped context (trace IDs, authentication principals, locale settings) through async server applications without explicit parameter threading.


---

## §17.10 Script-Mode Parallelism

*(This section is normative. All constructs in this section are available in scripted mode and on all Wasm targets. `ScriptWorker` and `WorkerChannel[T]` are additionally available in `@compiled` Wasm targets. They are not available in `@compiled --target native` files, where §17.8 and §17.9 primitives apply instead.)*

Loom's scripted runtime executes cooperatively on a single thread by default (§2.1). Two mechanisms provide parallelism within the scripted and Wasm execution environments without requiring a shared GC heap across threads:

- **`spawnBlocking`** (§17.10.1) — offloads synchronous CPU-bound closures to a host-managed blocking thread pool.
- **`ScriptWorker`** (§17.10.2) — spawns an isolated Wasm instance with its own heap, communicating via `Sendable`-typed message channels.

These two primitives are deliberately complementary: `spawnBlocking` is for short synchronous compute tasks that return a single value; `ScriptWorker` is for long-running or stateful parallel workloads that require bidirectional communication.

### §17.10.1 `spawnBlocking` in Scripted Mode

`spawnBlocking` is declared in `sync.thread` (§17.9.3) and is available on all targets. This subsection specifies its behaviour specifically in scripted mode and Wasm targets.

**Host thread pool.** On browser targets (`--target browser`), `spawnBlocking` dispatches the closure to the browser's dedicated worker thread pool managed by the Loom runtime bootstrap. On non-browser Wasm and scripted CLI targets, the runtime maintains a native OS thread pool equivalent to the `--target native` blocking pool, sized by the host runtime configuration (default 512 threads; not configurable via `RuntimeConfig` in scripted mode).

**Sendable constraint.** The closure passed to `spawnBlocking` SHALL only capture values whose types implement `Sendable`. Captured values are serialized for transfer to the blocking thread and the return value `T` is serialized back. The serialization mechanism is the same structured-clone protocol used by `ScriptWorker` channels (§17.10.4). A closure capturing a non-`Sendable` type is a compile-time error (`E_BLOCKING_CAPTURE`).

**GC object restriction.** The body of a `spawnBlocking` closure executes in an environment where the Loom GC heap of the calling script is not accessible. GC-managed objects (classes, closures, `list`, `dict`, `set`) may only be passed if they are `Sendable` and are therefore serialized by value. Mutable class instances are not `Sendable` by default; only classes explicitly declaring `implements Sendable` (with appropriate internal synchronization) may cross the boundary.

**No `await` inside `spawnBlocking`.** The body closure is synchronous. `await` expressions inside `spawnBlocking` are a compile-time error (`E_AWAIT_IN_BLOCKING`).

**Example — CPU-bound work in scripted mode:**

```loom
from sync.thread import (spawnBlocking);

async func compressData(raw: bytes): Task[bytes] {
  // compress() is synchronous and CPU-bound — offload to blocking pool
  let compressed = await spawnBlocking(func() => compress(raw));
  return compressed;
}
```

**Equivalence.** `spawnBlocking` in scripted mode is semantically equivalent to its `--target native` form (§17.9.3). The only difference is the backing implementation: native OS threads on `--target native`, host thread pool on Wasm/scripted.

### §17.10.2 `ScriptWorker` — Isolated Worker Instances

`ScriptWorker` provides true parallelism in scripted and Wasm environments by spawning an isolated Loom Wasm instance with its own GC heap. Workers communicate with the host script exclusively through typed `WorkerChannel[T]` message channels. Because workers do not share a heap, all values transferred across the channel must implement `Sendable` and are serialized by copy (§17.10.4).

```loom
namespace concurrent;

// Spawns a new isolated Wasm worker instance running the module at `modulePath`.
// `modulePath` must be a string literal resolvable at compile time.
// The worker's entry point is the exported `async func workerMain(channel: WorkerChannel[M]): Task[void]`.
// M must implement Sendable.
class ScriptWorker[M: Sendable] : Any {
  pub static async func spawn(modulePath: string): Task[ScriptWorker[M]];

  // Send a message to the worker. Returns immediately; delivery is asynchronous.
  // Throws WorkerTerminatedError if the worker has already exited.
  pub func send(msg: M): void;

  // Receive the next message sent by the worker via channel.reply().
  // Suspends until a message is available or the worker exits.
  // Returns None when the worker has terminated and all queued replies are drained.
  pub async func receive(): Task[Option[M]];

  // Wait for the worker to exit cleanly (workerMain returns).
  // Throws WorkerPanicError if the worker threw an unhandled exception.
  pub async func join(): Task[void];

  // Signal the worker to terminate. Pending messages are discarded.
  // It is not an error to terminate an already-terminated worker.
  pub func terminate(): void;

  pub let isTerminated: bool;
}

class WorkerTerminatedError : Exception {}
class WorkerPanicError : Exception {
  pub let message: string;
  pub let stack: Option[string];
}
```

**Worker entry point.** The module referenced by `modulePath` SHALL export an `async func workerMain(channel: WorkerChannel[M]): Task[void]`. This function is the worker's entry point. When `workerMain` returns, the worker exits cleanly. When `workerMain` throws an unhandled exception, the worker exits with a panic; the error is surfaced to the host via `join()`.

**Bidirectional communication.** `ScriptWorker[M]` uses a single message type `M` for both directions. The host sends `M` via `worker.send(msg)` and receives `M` via `worker.receive()`. Inside the worker, `channel.receive()` receives host messages and `channel.reply(msg)` sends back to the host. This symmetry simplifies the common request/response pattern; for asymmetric protocols, use a sum type as `M`.

**Lifecycle.** A worker is created in the spawning state, transitions to running once `workerMain` begins executing, and transitions to terminated when it exits (cleanly or via panic). Calling `send()` or `receive()` on a terminated worker returns `None` (receive) or throws `WorkerTerminatedError` (send).

**Example — parallel data processing:**

```loom
// host.loom
from concurrent import (ScriptWorker);

async func processChunks(chunks: list[bytes]): Task[list[bytes]] {
  let workers = await TaskGroup.collect(chunks, async func(chunk) {
    let w = await ScriptWorker[bytes].spawn("./worker.loom");
    w.send(chunk);
    let result = await w.receive();
    await w.join();
    return result!;
  });
  return workers;
}
```

```loom
// worker.loom
from concurrent import (WorkerChannel);

async func workerMain(channel: WorkerChannel[bytes]): Task[void] {
  while (true) {
    let msg = await channel.receive();
    if (msg == None) { break; }
    let result = transform(msg!);
    channel.reply(result);
  }
}
```

### §17.10.3 `WorkerChannel[T]` — Typed Message Channel

`WorkerChannel[T]` is the worker-side counterpart to `ScriptWorker[T]`. It is only accessible inside a worker module's `workerMain` function.

```loom
namespace concurrent;

// Available only inside a worker entry point (workerMain parameter).
// T must implement Sendable.
class WorkerChannel[T: Sendable] : Any {
  // Receive the next message from the host. Returns None when the host has
  // called terminate() or the host script exits.
  pub async func receive(): Task[Option[T]];

  // Send a reply message to the host.
  // Throws WorkerTerminatedError if the host has terminated the channel.
  pub func reply(msg: T): void;

  // Close the channel from the worker side. The host's receive() will drain
  // any queued replies and then return None.
  pub func close(): void;
}
```

`WorkerChannel[T]` may not be stored as a module-level `var` or captured in a `Thread.spawn` closure. It is valid only within the dynamic extent of `workerMain`. Attempting to store it outside `workerMain` is a compile-time error (`E_CHANNEL_ESCAPE`).

### §17.10.4 Serialization Contract

All values transferred across a `ScriptWorker` channel or through `spawnBlocking` are serialized by the **Loom structured transfer protocol**, which is defined as follows:

**Transfer rules:**

| Type | Transfer behaviour |
|---|---|
| `int`, `float`, `bool`, `string`, `bytes` | Copied by value; no allocation on the receiving side shares memory with the sender. |
| `list[T]`, `set[T]`, `dict[K,V]` where all element types are `Sendable` | Deep-copied. Subsequent mutations in either direction are independent. |
| Structs where all fields are `Sendable` | Copied field-by-field. |
| Enums where all variant payloads are `Sendable` | Copied. |
| `Option[T]`, `Result[T,E]` where `T`, `E` are `Sendable` | Copied. |
| Classes implementing `Sendable` | Serialized via their `Sendable` contract; see note below. |
| Non-`Sendable` types | Compile-time error (`E_TRANSFER_NONSENDABLE`). |

**Class serialization note.** Classes implementing `Sendable` are transferred by serializing their fields using the same rules above. The receiving side constructs a new instance; the two instances do not share identity. Classes with `extern native` fields or non-`Sendable` fields may not declare `implements Sendable` and cannot cross the channel boundary.

**Observable semantics.** The observable contract is: after a value is transferred, the sender and receiver hold **independent copies**. Mutations to the transferred value in one context are never visible in the other. This contract holds regardless of the underlying implementation (copy, move, or — in future Wasm GC shared-heap implementations — immutable reference sharing for frozen objects). User code must not rely on shared identity across a transfer boundary.

**Transfer errors.** If the serialization of a value fails at runtime (e.g. due to a cycle in a `Sendable` class instance that cannot be represented), the transfer throws `WorkerTransferError` at the call site of `send()`, `reply()`, or `spawnBlocking(...)`.

```loom
class WorkerTransferError : Exception {
  pub let typeName: string;
  pub let reason: string;
}
```

### §17.10.5 Worker Scope Restrictions

A `ScriptWorker` module executes in a restricted scope:

| Feature | Available in worker? | Notes |
|---|---|---|
| `async`/`await`, `TaskGroup` | ✅ | Full cooperative scheduler runs inside the worker. |
| `spawnBlocking` | ✅ | Uses a separate blocking pool per worker. |
| `ScriptWorker` (nested workers) | ✅ | Workers may spawn child workers. Max nesting depth is implementation-defined (SHOULD be ≥ 4). |
| `ui` module | ❌ | Workers have no UI context. |
| `web.dom`, `web.storage` | ❌ | DOM APIs are main-thread only. |
| `extern js` | ❌ | JS interop unavailable in worker scope. |
| `debug.mcp`, `debug.capture` | ✅ | Debug portals are forwarded to the host debug server. |
| `runtime.configure` | ❌ | Worker executor configuration is not supported; always `SingleThreaded`. |
| Module-level `var` state | ✅ | Each worker has its own independent module state. |

### §17.10.6 Future Evolution Path

The `ScriptWorker` and `spawnBlocking` APIs are designed to evolve transparently as the Wasm platform matures:

**Wasm GC shared-heap threads (standards track).** When the Wasm GC + shared-heap thread proposal is ratified and implemented by host engines, the runtime MAY transition `ScriptWorker` channel transfers for immutable `Sendable` values from copy semantics to zero-copy reference passing. The observable contract (§17.10.4 — independent copies after transfer) remains guaranteed; the implementation may become cheaper. No user code changes are required.

**Multi-threaded executor on Wasm.** Once shared-heap Wasm threads are available, the restriction on `ExecutorConfig.MultiThreaded` (currently `--target native` only, §17.9.1) will be lifted to include Wasm targets. The `RuntimeConfig` API will remain identical.

**Native script path.** If scripted mode gains a non-Wasm native execution path, the §17.8 OS thread layer (`Thread.spawn`, `Mutex`, `RwLock`, `ThreadPool`) will become available in scripted mode on that target without new language surface. `ScriptWorker` will remain available as a higher-level abstraction.

These evolution steps are additive — no API defined in §17.10 will be removed or altered in a breaking way as the platform evolves.


---

## §18 FFI and Host Interop

*(This section is normative.)*

Loom provides an explicit foreign function interface for calling JavaScript APIs and native shared libraries. FFI declarations are opt-in and syntactically visible.

### §18.1 JavaScript Interop (`extern js`)

```
extern js func fetch(url: string, opts: Any): Task[Any];
extern js func parseInt(s: string, radix: int): int;
extern js val document: Any;
extern js val window: Any;
```

**Rules:**

- `extern js func` and `extern js val` are simple declarations (trailing `;`).
- Declared Loom types are trusted and not verified at compile time; type mismatches produce runtime errors.
- `extern js func` returning a JS Promise is declared with return type `Task[T]`; the runtime wraps the Promise automatically.
- `extern js` declarations are only valid in modules not excluded from the active platform target.

### §18.2 `@jsexport`

`@jsexport` marks Loom functions as callable from JavaScript:

```
@jsexport
func onMessage(data: string): void {
  process(data);
}

@jsexport
async func fetchSummary(userId: string): Task[string] {
  let user = await fetchUser(userId);
  return buildSummary(user);
}
```

**Rules:**

- `@jsexport` may annotate `func` or `async func` declarations at module level, or `func` expressions.
- The runtime marshals JS arguments to declared Loom types using boundary coercions. Unmarshalable arguments produce `FfiTypeError`.
- `async func` exports return a `Promise<T>` to JS.
- Synchronous `@jsexport` functions must not contain `await` (compile-time error).
- `@jsexport` is only valid on `browser` and `service` targets.
- Module-level `@jsexport` functions are accessible as named exports of the compiled module's JS representation.

### §18.3 Typed JS Facades (`lang.interop.js`)

`lang.interop.js` provides typed wrappers over common Web and Node.js APIs:

```
namespace lang.interop.js;

// HTTP
class Request  : Any { pub url: string; pub method: string; pub body: Option[bytes]; }
class Response : Any {
  pub status: int;
  pub ok: bool;
  pub func text(): Task[string];
  pub func json(): Task[Any];
  pub func bytes(): Task[bytes];
}
func fetch(target: string | Request): Task[Response];

// Timers
func setTimeout(ms: int, callback: fn(): void): TimerHandle;
func clearTimeout(handle: TimerHandle): void;
func setInterval(ms: int, callback: fn(): void): TimerHandle;
func clearInterval(handle: TimerHandle): void;
class TimerHandle : Any { }

// DOM (browser only)
func querySelector(selector: string): Option[Element];
func querySelectorAll(selector: string): list[Element];
class Element : Any {
  pub id: string;
  pub className: string;
  pub func getAttribute(name: string): Option[string];
  pub func setAttribute(name: string, value: string): void;
  pub func addEventListener(event: string, handler: fn(Event): void): void;
  pub func removeEventListener(event: string, handler: fn(Event): void): void;
  pub func appendChild(child: Element): void;
  pub func remove(): void;
  pub innerHTML: string;
  pub textContent: string;
}
class Event : Any {
  pub type: string;
  pub func preventDefault(): void;
  pub func stopPropagation(): void;
}
```

DOM facades are restricted to the `browser` target. Typed facades are recommended over raw `extern js` declarations.

### §18.4 Native Interop (`extern native`)

```
extern native "libsqlite3" func sqlite3_open(path: string): NativeHandle;
extern native "libsqlite3" func sqlite3_close(db: NativeHandle): int;
```

**Rules:**

- `extern native "libname"` specifies the shared library by name (without platform-specific prefix/extension; the runtime resolves `libname.so`, `libname.dylib`, `libname.dll`).
- `NativeHandle` is an opaque type for C pointers — cannot be inspected or dereferenced in Loom code.
- `extern native` is only valid on `cli` and `service` targets.
- Passing a Loom `string` to a native function expecting a C string provides a null-terminated UTF-8 copy for the duration of the call.
- Memory management of native resources is the caller's responsibility; use `defer` for cleanup.
- All `extern native` function parameters that receive `borrow` or `borrow[~label]` values are implicitly `noescape`. The compiler verifies that no `borrow[~label]` value escapes the native call. A native function that requires the pointer to outlive the call must be annotated `@escapingBorrow`; every call site must carry `@unsafeEscapingBorrow` to acknowledge that the caller asserts the borrowed value outlives the native call.

---



---

### §18.5 FFI Thread Safety (`@threadSafe`, `ThreadSafeHandle`)

*(This section is normative. Applies to `@compiled` files targeting `--target native`.)*

Native libraries accessed via `extern native` vary widely in their thread-safety properties. The FFI layer provides two constructs for expressing and enforcing thread safety of native handles: the `@threadSafe` annotation and the `ThreadSafeHandle` wrapper type.

#### §18.5.1 `@threadSafe` Annotation

```loom
// Declares that the external function is safe to call concurrently from multiple threads.
// This is a programmer assertion — the compiler does not verify it.
@threadSafe
extern native "libpq" func pq_exec(conn: NativeHandle, query: string): NativeHandle;
```

`@threadSafe` on an `extern native` declaration:

- Marks the function as safe to call from any OS thread.
- Allows the function to be called from `Thread.spawn` closures and `spawnBlocking` bodies without triggering a non-`Sendable` capture error on the handle argument.
- Is a **programmer assertion** — the compiler trusts the declaration. If the underlying library is not actually thread-safe, data races and undefined behaviour are the programmer's responsibility.

Without `@threadSafe`, an `extern native` function is assumed non-thread-safe. Its `NativeHandle` arguments are non-`Sendable` by default and may not cross thread boundaries.

#### §18.5.2 `ThreadSafeHandle`

```loom
namespace native.ffi;

// A Sendable wrapper for a NativeHandle the programmer asserts is thread-safe.
// Implements Sendable, allowing it to cross thread and task boundaries.
class ThreadSafeHandle : Any implements Sendable {
  // Wraps a NativeHandle. Programmer asserts the underlying resource is thread-safe.
  pub static func wrap(handle: NativeHandle): ThreadSafeHandle;

  // Unwraps the underlying NativeHandle for use in native calls.
  pub func inner(): NativeHandle;
}
```

`ThreadSafeHandle` bridges the gap between a raw `NativeHandle` (non-`Sendable`) and the `Sendable` requirement for cross-thread use. Wrapping a handle with `ThreadSafeHandle.wrap` is an explicit assertion at the type level that the programmer has verified the underlying library resource is thread-safe.

**Example — sharing a thread-safe connection pool across async tasks:**

```loom
@compiled

from native.ffi import (ThreadSafeHandle);

extern native "libpq" func pq_connect(connstr: string): NativeHandle;

@threadSafe
extern native "libpq" func pq_exec(conn: NativeHandle, query: string): NativeHandle;

async func runQuery(handle: ThreadSafeHandle, query: string): Task[NativeHandle] {
  return await spawnBlocking(func() => pq_exec(handle.inner(), query));
}
```

**Safety contract.** `ThreadSafeHandle` does not provide any runtime enforcement — it is a visible, explicit type-level assertion. Wrapping a non-thread-safe handle and sharing it across threads will produce data races. The restriction on `NativeHandle` (non-`Sendable` by default) exists precisely to prevent accidental cross-thread sharing; `ThreadSafeHandle.wrap` is the opt-in escape hatch.


---

## §19 Reactive UI (`ui`)

*(This section is normative.)*

`ui` provides a single reactive component model targeting both web browsers and native desktop platforms. It is divided into three layers:

1. **Universal core** (`ui`) — signals, effects, component model, `View` type. Available on all targets including `browser`, `desktop`, `service` (for SSR), and `cli` (for testing).
2. **Web backend** (`ui.web`) — DOM rendering, `html` fence integration, SSR, hydration. Available on `browser` and `service` targets.
3. **Desktop backend** (`ui.desktop`) — native window management, platform chrome, implementation-defined rendering. Available on `desktop` target.

Components written using `ui` and the `ui` fence are cross-platform by default. Platform-specific enrichment is opt-in via the backend submodules.

### §19.1 Signals

```
class Signal[T] : Any {
  pub func get(): T;
  pub func set(value: T): void;
  pub func update(fn: fn(T): T): void;
}

func signal[T](initial: T): Signal[T];
func derived[T](compute: fn(): T): Signal[T];
func effect(fn: fn(): void): EffectHandle;

class EffectHandle : Any {
  pub func dispose(): void;
}
```

- `signal(v)` creates a writable signal with initial value `v`.
- `derived(fn)` creates a read-only signal recomputed when dependencies change.
- `effect(fn)` runs `fn` immediately and re-runs when any signal read during execution changes.
- Signal reads inside component bodies and template fences establish fine-grained reactive dependencies.
- When a `Signal[T]` is written, the runtime invalidates and re-evaluates all dependents.
- Under ARC (native target), `effect(fn)` closures that reference the `EffectHandle` must use `[weak handle]` capture lists (§7.3) to avoid retain cycles.

```
let count = signal(0);
let doubled = derived(func() => count.get() * 2);

effect(func() {
  log("count is now: {$ count.get() $}");
});

count.set(1);   // effect runs; doubled is now 2
```

### §19.2 Components and `ComponentRegistry`

Components are functions returning `View`:

```
func Counter(initialValue: int): View {
  let count = signal(initialValue);
  return ```(ui):(components=registry)
    <Column spacing={$ 8 $}>
      <Text>{$ count.get() $}</Text>
      <Button onclick={$ func() { count.set(count.get() + 1); } $}>
        <Text>+</Text>
      </Button>
    </Column>
  ```;
}
```

`View` is an opaque type produced by `ui` and `html` template fences. It carries a description of the UI tree that the active rendering backend materialises into pixels or DOM nodes.

**`ComponentRegistry`:**

```
class ComponentRegistry : Any {
  pub static func of(entries: dict[string, Any]): ComponentRegistry;
  pub func merge(other: ComponentRegistry): ComponentRegistry;
  pub func get(name: string): Option[Any];
}
```

- `of(entries)` constructs a registry from a dict.
- `merge(other)` merges registries; the right operand takes precedence on collision.
- The `components` descriptor key is valid for both `language=ui` and `language=html` fences.

**Tag resolution rules:**

- Uppercase-initial tags are looked up in the registry by exact string match. Not found → compile-time error.
- Hyphenated tags are first looked up in the `ComponentRegistry`. If the matched entry is a `@webcomponent` class (§19.10), the tag is treated as a web component invocation: attribute values are mapped to the component's `@attribute` fields, and the element is emitted as a custom element tag in HTML output. If no registry match is found: in `html` fences the tag is emitted as literal HTML; in `ui` fences it is a compile-time error.
- Plain lowercase (non-hyphenated) tags in `html` fences are emitted as literal HTML. In `ui` fences they are a compile-time error (all primitives use PascalCase).
- `html` and `ui` fences without `components` treat all uppercase tags and unrecognised hyphenated tags as compile-time errors.

**Component rules:**

- Components are not classes; no lifecycle methods. Setup code runs once at instantiation.
- Signal reads inside fences establish reactive dependencies.
- Async components (`async func` returning `Task[View]`) are supported.
- When a registered value in a `ComponentRegistry` is not a function returning `View` or `Task[View]`, and is not a `@webcomponent` class, the compiler emits a compile-time error.

**Event handler compilation in `html` fences.** Event handler attributes (`onclick`, `oninput`, `onchange`, `onsubmit`, `onkeydown`, `onfocus`, `onblur`, and all other `on*` attributes) in `html` fences accept Loom callable values typed as `fn(): void` or `fn(Event): void`. They do **not** produce inline JavaScript handler strings.

The compiler transforms event handler attribute bindings:

```
// Source written by the developer:
<button onclick={$ func() { count.set(count.get() + 1); } $}>+</button>

// Compiled output (what reaches the DOM):
<button data-loom-ev="click:__ev_7f3a2b">+</button>
```

The compiler assigns a stable, deterministic event slot ID (content-addressed from the closure's source location and module path) and registers the handler in the Wasm module's event table. After the Wasm module loads, the Loom runtime wires all `data-loom-ev` elements via `addEventListener` — no inline JavaScript is emitted. See §27.6 for the bootstrap sequence.

Passing a literal JavaScript string as an event handler value is a **compile-time error**:

```
// COMPILE-TIME ERROR: inline JavaScript string not permitted
<button onclick="count++">bad</button>

// Correct: Loom callable
<button onclick={$ func() { count.update(func(n) => n + 1); } $}>+</button>
```

This design requires no `'unsafe-inline'` in the Content Security Policy `script-src` directive.

### §19.3 Mounting (Universal)

```
func mount(component: View, target: MountTarget): MountHandle;

class MountHandle : Any {
  pub func unmount(): void;
}
```

`MountTarget` is resolved per backend:

- On `browser`: `mount(view, "#selector")` or `mount(view, element: Element)`.
- On `desktop`: `mount(view, window: Window)`.
- `runtime.ui.rootMount()` returns the platform-appropriate default mount target, enabling target-agnostic entry points.

### §19.4 `View` Type

`View` is an opaque built-in type representing a description of UI content. It is produced by `ui` and `html` template fences and by component function return values. `View` values are immutable descriptions; the rendering backend materialises them.

### §19.5 Async Component Loading

The `suspend` directive specifies a fallback `View` while an async component resolves:

```
{% suspend fallback={$ LoadingSpinner() $} %}
  <AsyncDataTable query={$ query $} />
{% end %}
```

- The fallback renders immediately; it is replaced when the async component's `Task[View]` completes.
- If the async task fails, an error boundary renders or the failure propagates per the enclosing failure policy.
- `suspend` blocks may be nested. Each manages its own fallback independently.
- Multiple async components within a single `suspend` block resolve concurrently; the fallback is replaced when all have completed.

### §19.6 `ui` Fence — Cross-Platform Layout Primitives

The `ui` template fence (`language=ui`) produces `View` trees using platform-neutral layout primitives. A `ui` fence compiles on all targets. No HTML-specific semantics apply inside a `ui` fence.

**`ui` fence syntax:**

````
```(ui):(components=registry)
<Column spacing={$ 12 $}>
  <Text style={$ TextStyle(size=18, weight=500) $}>Hello {$ name $}</Text>
  <Button onclick={$ handler $}>
    <Text>Submit</Text>
  </Button>
</Column>
```
````

**Primitive vocabulary:**

*Layout containers:*

```
Row(spacing: int = 0, alignment: Alignment = Alignment.Center, children: View)
Column(spacing: int = 0, alignment: Alignment = Alignment.Start, children: View)
Stack(alignment: Alignment = Alignment.TopStart, children: View)
Scroll(axis: Axis = Axis.Vertical, children: View)
Spacer(size: int?)
Divider(axis: Axis = Axis.Horizontal, color: Color?)
Padding(insets: Insets, children: View)
```

*Content:*

```
Text(style: TextStyle?)
Button(onclick: fn(): void, disabled: bool = false, children: View)
Image(src: string, alt: string = "", fit: ImageFit = ImageFit.Contain)
Icon(name: string, size: int = 24, color: Color?)
Canvas(width: int, height: int, draw: fn(DrawContext): void)
```

*Input:*

```
TextField(value: Signal[string], placeholder: string = "", multiline: bool = false)
Checkbox(checked: Signal[bool], label: string = "")
Slider(value: Signal[float], min: float, max: float, step: float = 1.0)
Select[T](value: Signal[T], options: list[SelectOption[T]])
```

*Supporting types:*

```
enum Axis      { Horizontal, Vertical }
enum Alignment { Start, Center, End, TopStart, TopCenter, TopEnd,
                 BottomStart, BottomCenter, BottomEnd }
enum ImageFit  { Contain, Cover, Fill, ScaleDown }

struct TextStyle {
  size: int?;
  weight: int?;       // 400 = regular, 500 = medium, 700 = bold
  color: Color?;
  italic: bool = false;
}

struct Insets {
  top: int = 0; right: int = 0; bottom: int = 0; left: int = 0;
  pub static func all(v: int): Insets;
  pub static func symmetric(horizontal: int, vertical: int): Insets;
}

struct Color {
  r: int; g: int; b: int; a: int = 255;
  pub static func hex(value: string): Color;
  pub static let transparent: Color;
}

struct SelectOption[T] { label: string; value: T; }
```

**Rendering contract.** The `ui` fence produces a `View` value. The active rendering backend maps each primitive to its platform representation:

- On `browser`: primitives map to HTML elements with CSS layout (`Row` → `<div style="display:flex;flex-direction:row">`, etc.).
- On `desktop`: primitives map to the implementation-defined rendering backend.

The rendering contract guarantees that `Row`, `Column`, `Stack`, `Text`, `Button`, `Image`, and `Slot` produce visually equivalent results across backends. `Slot` is valid only inside the `render()` method of a `@webcomponent` class (§19.10); it maps to the browser's `<slot>` element on `browser` target and is a compile-time error on all other targets. Platform-specific visual details (native scrollbar chrome, button appearance, font rendering) are left to the backend.

**All `ui` fence directives from §16.2 are supported.** `{% if %}`, `{% for %}`, `{% match %}`, `{% let %}`, `{% try %}`, and `{% suspend %}` all work inside `ui` fences identically to `html` fences.

### §19.7 Web Backend (`ui.web`)

*(Available on `browser` and `service` targets.)*

**`html` fence integration.** The `html` fence (§16) continues to work as the web-enrichment path. Components using `html` fences compile only on `browser`/`service` targets.

**`renderToString` (SSR):**

```
namespace ui.web;

struct RenderToStringOptions {
  stateIntegrity: bool = false;  // if true, add data-integrity SHA-256 hash attribute
}

func renderToString(component: View,
                   options: RenderToStringOptions = RenderToStringOptions()): string;
```

`renderToString` renders a component tree to static HTML on `service` targets.

**`hydrate`:**

```
func hydrate(component: View, selector: string): MountHandle;
```

Attaches event handlers and reactive state to server-rendered HTML on `browser` targets. Hydration reuses existing DOM nodes rather than re-creating them. If server-rendered HTML doesn't match the client component tree, the runtime emits a hydration mismatch warning and falls back to full client-side rendering.

**State serialization format:**

The server serializes component state (signal initial values) as a JSON object embedded in the HTML output. The serializer applies Unicode escape encoding to `<` and `>` throughout the JSON output, guaranteeing that the literal byte sequence `</` can never appear in the state block:

```html
<script id="__loom_state__" type="application/json">
  {"count": 0, "comment": "example \u003C/script\u003E is safe"}
</script>
```

The `StateSerializer` class (internal to `ui.web`) is responsible for this encoding:

```
namespace ui.web;

class StateSerializer {
  // Serializes state to JSON with < and > escaped as < / >.
  // The output SHALL NOT contain the literal byte sequence </ in any case variant.
  pub static func serialize(state: dict[string, Any]): string;
}
```

**Normative rule.** The runtime SHALL escape all occurrences of `<` as `<` and `>` as `>` in the JSON-serialized state block. The serialized string SHALL NOT contain the literal byte sequence `</` in any case variant (`</`, `</`, `</`, etc.).

`renderToString` accepts options for enhanced integrity. When `stateIntegrity = true`, the state script tag includes a `data-integrity` attribute containing the SHA-256 hash of the serialized content (hex-encoded). The `hydrate` function verifies this hash before reading state.

The `hydrate` function reads this state to initialize signals with server-computed values, ensuring the client component tree matches the server-rendered HTML.

**Minimum required Content Security Policy.** A Loom browser application compiled with `loom build --target browser` requires the following minimum CSP — no `'unsafe-inline'` or `'unsafe-eval'` is needed:

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'wasm-unsafe-eval';
  connect-src 'self';
```

`'wasm-unsafe-eval'` permits Wasm module evaluation, which is required by all Wasm-based applications and is a narrower permission than `'unsafe-eval'` (which also permits `eval()` and `new Function()`). The absence of `'unsafe-inline'` is ensured by the `data-loom-ev` event handler compilation model (§19.2).

**`mount` (web form):**

```
func mount(component: View, selector: string): MountHandle;
func mount(component: View, element: Element): MountHandle;
```

### §19.8 Desktop Backend (`ui.desktop`)

*(Available on `desktop` target only.)*

The desktop rendering backend is **implementation-defined**. This specification defines the API contract only. Conforming implementations may use Skia, WebGPU, platform-native widgets, or any other rendering technology, provided they satisfy the primitive rendering contract in §19.6.

**Window management:**

```
namespace ui.desktop;

class Window : Any {
  pub var title: string;
  pub var width: int;
  pub var height: int;
  pub var minWidth: int?;
  pub var minHeight: int?;
  pub var resizable: bool = true;
  pub var fullscreen: bool = false;
  pub var visible: bool = true;

  pub func close(): void;
  pub func minimize(): void;
  pub func maximize(): void;
  pub func focus(): void;
  pub func setIcon(path: string): void;
}

struct WindowConfig {
  title: string;
  width: int = 800;
  height: int = 600;
  minWidth: int?;
  minHeight: int?;
  resizable: bool = true;
  centered: bool = true;
}

func createWindow(cfg: WindowConfig): Window;
```

**Mounting:**

```
func mount(component: View, window: Window): MountHandle;
```

**Menu and system integration:**

```
class MenuBar : Any { ... }

class Menu : Any {
  pub let title: string;
  pub func addItem(item: MenuItem): void;
  pub func addSeparator(): void;
  pub func addSubmenu(menu: Menu): void;
}

class MenuItem : Any {
  pub let label: string;
  pub var enabled: bool = true;
  pub var checked: bool = false;
  pub var shortcut: string?;
  pub let onclick: fn(): void;
}

func setMenuBar(window: Window, menuBar: MenuBar): void;

class Tray : Any {
  pub func setIcon(path: string): void;
  pub func setTooltip(text: string): void;
  pub func setMenu(menu: Menu): void;
  pub func show(): void;
  pub func hide(): void;
  pub func destroy(): void;
}
func createTray(): Tray;
```

**Native dialogs:**

```
struct FileDialogOptions {
  title: string?;
  defaultPath: string?;
  filters: list[FileFilter] = [];
}
struct FileFilter { name: string; extensions: list[string]; }

async func openFileDialog(options: FileDialogOptions = FileDialogOptions()): Task[Option[string]];
async func openFilesDialog(options: FileDialogOptions = FileDialogOptions()): Task[list[string]];
async func saveFileDialog(options: FileDialogOptions = FileDialogOptions()): Task[Option[string]];
async func openDirectoryDialog(options: FileDialogOptions = FileDialogOptions()): Task[Option[string]];
async func alertDialog(title: string, message: string): Task[void];
async func confirmDialog(title: string, message: string): Task[bool];
```

**`runtime.ui` namespace:**

```
interface UiRuntime {
  pub let backend: string;      // "dom" | "desktop" | "headless"
  pub func rootMount(): MountTarget;
  pub func screen(): ScreenInfo;
}

struct ScreenInfo {
  width: int;
  height: int;
  dpr: float;    // device pixel ratio
}
```

`runtime.ui.rootMount()` returns `"#root"` on browser targets and the primary `Window` on desktop targets, enabling target-agnostic entry points.

### §19.9 Cross-Platform Example

```
// app.loom — shared, uses only ui and ui fence
from ui import (signal, mount);

func TodoApp(): View {
  let items = signal(list[string]());
  let input  = signal("");

  return ```(ui)
    <Column spacing={$ 12 $}>
      <Row spacing={$ 8 $}>
        <TextField value={$ input $} placeholder="Add item..." />
        <Button onclick={$ func() {
          items.update(func(xs) => xs + [input.get()]);
          input.set("");
        } $}>
          <Text>Add</Text>
        </Button>
      </Row>
      {% for (item in items.get()) %}
        <Text>{$ item $}</Text>
      {% end %}
    </Column>
  ```;
}

// Entry point — works on both browser and desktop
mount(TodoApp(), runtime.ui.rootMount());
```

This file compiles and runs unchanged on `browser`, `desktop`, and `service` targets. Adding web-specific enrichment (SSR, DOM access) or desktop-specific features (native menus, file dialogs) is opt-in via the respective backend submodules.


## §19.10 Web Components

*(This section is normative. Available on `browser` target only.)*

Loom provides first-class support for the W3C Custom Elements v1 standard via the `@webcomponent` annotation and the `WebComponentLifecycle` interface (§11.2). A `@webcomponent` class compiles to a `customElements.define()` registration in the browser bootstrap (§27.6).

### §19.10.1 Declaring a Web Component

```loom
from ui import (signal, View);
from web.dom import (ShadowRoot);

@webcomponent("my-counter")
class CounterElement implements WebComponentLifecycle {

  // Observed attributes — declared with @attribute
  @attribute var label: string = "Count";
  @attribute var step: int = 1;

  // Internal reactive state
  let count = signal(0);

  func connected(): void {
    // called when element is inserted into the document
  }

  func disconnected(): void {
    // called when element is removed from the document
  }

  func attributeChanged(name: string, old: string?, next: string?): void {
    // @attribute fields are updated automatically before this fires
  }

  func render(): View {
    return ```(ui)
      <Column spacing={$ 8 $}>
        <Text>{$ label $}: {$ count.get() $}</Text>
        <Button onclick={$ func() { count.update(func(n) => n + step); } $}>
          <Text>+{$ step $}</Text>
        </Button>
        <Slot />
      </Column>
    ```;
  }
}
```

### §19.10.2 `@webcomponent` Rules

- The annotation argument must be a compile-time string literal that is a valid Custom Elements tag name: it must contain at least one hyphen and consist only of ASCII lowercase letters, digits, hyphens, periods, and underscores. The compiler SHALL reject invalid tag names.
- The class must declare a `func render(): View` method. The absence of `render()` is a compile-time error.
- The `@webcomponent` annotation is only valid on `browser` target. Using it on other targets is a compile-time error.
- Duplicate tag name registrations within a compilation unit are a compile-time error.
- `@webcomponent` classes may not use `@compiled` mode.

### §19.10.3 `@attribute` Rules

`@attribute` marks a class member as an observed HTML attribute. It is valid on:

- **`var` fields:** The field type must be `string`, `int`, `float`, or `bool`. The compiler generates the coercion from the HTML attribute string to the declared type. For `int` and `float`, a malformed attribute string leaves the field at its default value and emits a runtime warning. For `bool`, presence of the attribute (any value) sets `true`; absence sets `false`.
- **Property `get`/`set` pairs:** The `set` parameter type determines the coercion rule (same rules as for fields). A `get`-only property (no `set`) declares a reflected read-only attribute; the value is readable from the DOM but setting it via HTML markup has no effect and emits a runtime warning.
- `@attribute` on a `get`-only property without a backing stored field is a compile-time error — the runtime requires a stable stored value to service `getAttribute` calls.

The compiler generates:
1. A static `observedAttributes` array from the names of all `@attribute` members. The attribute name is derived from the member name: camelCase names are lowercased verbatim (no kebab-case conversion). If a different attribute name is required, pass it explicitly: `@attribute("my-label") var myLabel: string = ""`.
2. An `attributeChangedCallback` dispatcher that updates the corresponding field or calls the `set` accessor, then calls `attributeChanged(name, old, next)` on the class.

### §19.10.4 Shadow DOM and Slots

Every `@webcomponent` class renders into an open shadow root created automatically by the runtime. The shadow root is accessible via `this.shadowRoot: ShadowRoot` (see §21.22).

`<Slot>` (in `ui` fences) or `<slot>` (in `html` fences) maps to the browser's native `<slot>` element. Named slots use `<Slot name="footer" />` or `<slot name="footer"></slot>`. Slot elements are only valid inside the `render()` method of a `@webcomponent` class; their use elsewhere is a compile-time error.

### §19.10.5 CSS Inside Web Components

`css` fences used inside `render()` are attached to the shadow root via Constructable Stylesheets rather than the document `<head>`. Hash-scoped class name mangling is suppressed (see §16.7.1). The shadow boundary provides native encapsulation.

```loom
func render(): View {
  let styles = ``(css)
    .button { background: navy; color: white; padding: 8px 16px; }
  ``;  // attached to shadow root, not document head

  return ```(ui)
    <Button class={styles.button} onclick={$ handleClick $}>
      <Text>Go</Text>
    </Button>
  ```;
}
```

### §19.10.6 Using Web Components in Fences

Registered web components may be used inside `html` and `ui` fences via a `ComponentRegistry`:

```loom
let registry = ComponentRegistry.of({
  "my-counter": CounterElement,
});

let view = ```(html):(components=registry)
  <div>
    <my-counter label="Score" step={$ 5 $}>
      <span slot="footer">Footer content</span>
    </my-counter>
  </div>
```;
```

Attribute values in web component tags follow the same escaping rules as regular HTML attributes (§16.6.3). Non-`@attribute` properties are a compile-time error in this context.

### §19.10.7 Bootstrap Registration

The Loom runtime registers all `@webcomponent` classes via `customElements.define()` during bootstrap step 6 (§27.6), before `mount()` is called. Registration order follows source declaration order within each module and dependency order across modules.

## §20 Runtime Root and Capabilities

*(This section is normative.)*

### §20.1 `runtime` Object

A root-level identifier `runtime` is always available in scope:

```
interface Runtime {
  func args(): list[string];
  func env(name: string): Option[string];
  func capabilities(): list[string];
  func has(name: string): bool;
  func compile(source: string): Module;
  func compile(source: string, options: CompileOptions): Module;

  // Capability sub-namespaces (accessed as properties, not method calls)
  let fs: io.fs.Fs;
  let proc: io.proc.Proc;
  let net: net.net.Net;
  let debug: debug.DebugRuntime;
  let interop: lang.interop.js.Interop;
  let ui: ui.UiRuntime;
}

class CompileOptions {
  /// Optional module name for diagnostics and `__module__` dunder.
  pub let name: string = "<dynamic>";
  /// Whether to type-check the module (default: true).
  pub let typeCheck: bool = true;
}

class Module {
  /// The module's exported names.
  pub func exports(): list[string];
  /// Get an exported value by name. Throws `KeyError` if not found.
  pub func get(name: string): Any;
  /// Check whether a name is exported.
  pub func has(name: string): bool;
  /// Call an exported function by name with positional arguments.
  pub func call(name: string, args: list[Any]): Any;
}
```

Capability sub-namespaces are properties on `runtime`: `runtime.fs.open(path)`, not `runtime.fs().open(path)`.

If a capability is not available on the current platform target, calling any method on the capability object throws `CapabilityError`.

**`runtime.compile(source)` — Dynamic module compilation:**

`runtime.compile(source)` compiles a Loom source string through the standard pipeline (parse → HIR → resolve → typecheck → MIR) and returns a `Module` value representing the compiled module. The module's top-level statements are NOT executed — only declarations are collected. To invoke an exported function, use `Module.call(name, args)` or `Module.get(name)`.

```
let mod = runtime.compile("""
  pub func greet(name: string): string {
    return "Hello, {$ name $}!";
  }

  pub func add(a: int, b: int): int {
    return a + b;
  }
""");

let result = mod.call("greet", ["world"]);   // "Hello, world!"
let sum = mod.call("add", [1, 2]);           // 3
let names = mod.exports();                    // ["greet", "add"]
```

The compiled module inherits the caller's capability set. Imports within the compiled source are resolved against the same module graph as the caller.

`runtime.compile` requires the `eval` capability. It is available on `cli`, `service`, `desktop`, and `native` targets. On `browser` targets, it throws `CapabilityError`. In `@compiled` mode, it is a compile-time error.

The optional `CompileOptions` parameter controls the module name (used in stack traces and `__module__` dunder) and whether type-checking is performed.

**Async capability methods:**

```
runtime.fs.readAsync(path): Task[bytes]
runtime.fs.writeAsync(path, data): Task[void]
runtime.fs.linesAsync(path): AsyncIterable[string]
runtime.proc.runAsync(argv): Task[ProcResult]
runtime.net.requestAsync(req): Task[Response]
```

### §20.2 Script Prelude

Entry scripts and REPL sessions receive convenience helpers as surface sugar over `runtime`:

| Helper | Equivalent |
|---|---|
| `args()` | `runtime.args()` |
| `env(name)` | `runtime.env(name)` |
| `readBytes(path)` | `runtime.fs.read(path)` |
| `readText(path)` | UTF-8 read via `runtime.fs` |
| `writeBytes(path, data)` | `runtime.fs.write(path, data)` |
| `writeText(path, text)` | UTF-8 write via `runtime.fs` |
| `exec(argv)` | `runtime.proc.run(argv)` |
| `readBytesAsync(path)` | `runtime.fs.readAsync(path)` |
| `readTextAsync(path)` | UTF-8 async read via `runtime.fs` |
| `writeBytesAsync(path, data)` | `runtime.fs.writeAsync(path, data)` |
| `writeTextAsync(path, text)` | UTF-8 async write via `runtime.fs` |
| `execAsync(argv)` | `runtime.proc.runAsync(argv)` |

```
let cfg = readText("loom.json");
let who = env("USER");
let result = exec(["echo", "hi"]);
```

Prelude helpers are the recommended default surface for beginner-facing examples and small scripts. They provide the same capability checks and failure behavior as the corresponding `runtime.*` calls.

### §20.3 Dynamic Tracing and Time-Travel Debugging

The runtime maintains an activation registry for portals:

```
namespace debug;

enum TraceEventKind { Call, Return, Line, Exception, Await, Resume, Portal, Signal }

class TraceEvent {
  pub kind: TraceEventKind;
  pub portal: Option[string];
  pub callable: Option[string];
  pub file: string;
  pub line: int;
}

interface TraceHook {
  func onEvent(ev: TraceEvent): void;
}

class PortalActivation {
  pub name: string;
  pub condition: Option[string];
  pub once: bool;
}

interface DebugRuntime {
  pub func tracingAvailable(): bool;
  pub func tracingActive(): bool;
  pub func setTraceHook(hook: Option[TraceHook]): Option[TraceHook];
  pub func activatePortal(name: string, condition: Option[string] = None, once: bool = false): void;
  pub func deactivatePortal(name: string): void;
  pub func activePortals(): list[PortalActivation];
  pub func startCaptureServer(cfg: CaptureServerConfig): TraceServerHandle;
  pub func startMcpServer(cfg: McpServerConfig): TraceServerHandle;
}
```

**Activation model:**

- Activations may include a name, optional condition expression, and `once` flag.
- Condition expressions are Loom expressions parsed and evaluated in the lexical environment of the target portal.
- Invalid condition expressions reject the activation request.
- Condition evaluation failures are treated as false without changing application semantics.
- When a matching portal is entered and the condition is true, tracing activates for the entering task.

**Trace event kinds:** `Call`, `Return`, `Line`, `Exception`, `Await`, `Resume`, `Portal`, `Signal`.

**Server types:**

- **Capture server:** optimized in-process time-travel server.
- **MCP server:** MCP-compatible server for agent-driven debugging.

Both share the same portal registry and tracing substrate.

**`DebugFrame` and `TraceLevel`.** Each frame in the trace ring buffer carries execution context:

```
class DebugFrame {
  pub file: string;
  pub line: int;           // -1 if source map unavailable
  pub column: int;         // -1 if source map unavailable
  pub callable: string;    // always present from static metadata or core.reflect
  pub execMode: string;    // "interpreted" | "compiled"
  pub traceLevel: TraceLevel;
  pub func locals(): dict[string, Any];  // populated only when traceLevel == Full
}

enum TraceLevel {
  Full,       // all events: line, locals, callables. Interpreted or --debug compiled.
  PortalOnly, // portal activation + call/return only. Release compiled with portals.
  Opaque,     // single boundary Call/Return frame only. Release compiled, no portals.
}
```

**Static metadata table.** When a compiled module is loaded, it registers a static metadata table with the runtime host before any function in the module can be called. This table contains:

- The fully-qualified names of all exported functions, methods, and explicit portal blocks.
- The parameter types and return types for each callable (for compiled-mode condition type-checking).
- Whether each callable has an explicit portal declaration.
- The source file and module name (baked at compile time).

The runtime uses the metadata table to populate `TraceEvent.callable` for compiled frames using the same string representation as `core.reflect.callableName` (§21.11). Portal names are therefore consistent whether accessed from interpreted or compiled contexts.

**Boundary crossing semantics.** When execution crosses from interpreted code into a compiled function call:

1. A `Call` trace event fires. `callable` is populated from the compiled module's metadata table.
2. The frame's `execMode` is set to `"compiled"`.
3. `traceLevel` is set based on the compiled module's build mode: `Full` if built with `--debug`; `PortalOnly` if built in release mode with explicit portal blocks; `Opaque` if built in release mode with no portal blocks.
4. Trace events continue appending to the shared ring buffer.

When returning from compiled to interpreted code, a `Return` event fires (callable from metadata table), and subsequent events resume at `traceLevel=Full` in the interpreted context.

**Opaque frames.** When an interpreted caller calls an opaque compiled function, the ring buffer receives a synthetic boundary `Call` event followed by a synthetic `Return` event after completion. The interior is invisible to the time-travel recorder — equivalent to stepping over a native C library in a conventional debugger.

**Reflection integration.** `TraceEvent.callable` is populated via `core.reflect.callableName` (§21.11), which is available in all modes including `@compiled`. This eliminates the dependency on `core.inspect` for trace event population.



---


---

## §21 Standard Library

*(Full specification in the [Loom Standard Library Reference](loom-stdlib-reference-v1_10.md).)*

The standard library provides `core.*`, `io.*`, `net.*`, `data.*`, `web.*`, `sync.*`, `lang.*`, `debug.*`, `structures.*`, and `ui.*` modules available on all targets without a separate `loom install` step. GPU/accelerator packages (`loom.tensor`, `native.gpu`, `native.hal`, etc.) are documented in the [Loom Packages Reference](loom-packages-reference-v1_10.md).

---

## §22 Compiled Mode

*(This section is normative.)*

Compiled mode enables ahead-of-time (AOT) compilation of Loom source files. The primary AOT target is WebAssembly with GC and Exception Handling proposals (Wasm GC+EH), the same bytecode target used by the JIT pipeline (§2.1). Compiled mode may also target native binaries via LLVM or Cranelift (§23). The Wasm GC+EH type mappings and exception tag mappings defined in §2.1 apply equally to AOT-compiled Wasm modules; AOT compilation produces optimized Wasm modules where debug metadata is stripped unless `--debug` is specified (see §27.1).

### §22.1 `@compiled` Directive

The `@compiled` directive marks a file for ahead-of-time compilation with restricted semantics:

```
@compiled

struct Point {
  x: float;
  y: float;
}

func distance(a: Point, b: Point): float {
  let dx = b.x - a.x;
  let dy = b.y - a.y;
  return (dx * dx + dy * dy).sqrt();
}
```

**Placement rules:**

- `@compiled` must appear as the first non-comment, non-blank line in the file.
- `@compiled` is a file-level directive, not a function or block annotation.
- A file is either entirely compiled or entirely scripted.

### §22.2 Restrictions

The following constructs are prohibited in `@compiled` files:

| Prohibited Construct | Reason |
|---|---|
| `Any` as a declared type | No dynamic dispatch |
| `dynamic class` | No dynamic fields |
| `core.inspect` usage | Requires live runtime registry (use `core.reflect` for structural queries) |
| Top-level control flow (`if`, `while`, `for`, `match`, expression statements) | No sequential top-level execution |
| `extern js` and `@jsexport` | No JavaScript interop in compiled mode |
| Non-constant top-level initializers | All top-level data must be statically determinable |
| `unowned[~name]` outside `--target native` | Meaningful only under ARC; no-op under GC |
| Bare `unowned` on a class field (without `[~name]` annotation) | Compile-time error `E_UNOWNED_NO_LIFETIME` — all `unowned` class fields must use `unowned[~name]` (§23.4.3) |
| `[weak ...] ` capture lists outside `--target native` | Meaningful only under ARC |
| `Thread.spawn`, `ThreadPool`, `Mutex`, `RwLock`, `Atomic` outside `--target native` | OS threads unavailable on Wasm targets |
| Non-`Sendable` captures in `Thread.spawn` closures | Data race prevention (§17.8) |
| Non-`Sendable` captures in async task closures with `MultiThreaded` executor | Data race prevention (§17.9.4) |
| `runtime.configure` called after first `await` | `RuntimeConfigError` — executor is already started |
| `spawnBlocking` on Wasm or scripted targets | OS threads unavailable — compile-time error |
| `ThreadLocal[T]` on Wasm or scripted targets | OS threads unavailable — compile-time error |
| Explicit augmented assignment `operator func` on structs | Value-type semantics incompatible with in-place mutation |
| `borrow` outside `@compiled --target native` | ARC elision requires static ownership analysis; meaningless under GC |
| `noescape fn` outside `@compiled --target native` | Non-escaping closure optimisation only meaningful under ARC |

**Additionally permitted in `@compiled` mode:**

- `core.reflect` — structural introspection from static metadata (§21.11).
- `portal` blocks — registered with shared activation registry at module load.
- `weak` field qualifier — maps to ARC zeroing weak pointer (native) or GC weak reference (Wasm).
- `operator func` method modifier — desugars to named method slots at compile time.
- `box` keyword expression — explicit widening at `Option[Any]` boundary positions.
- `as` and `as?` cast operators — narrowing at `Option[Any]` boundary positions.
- `borrow` parameter modifier — ARC retain/release elision for provably non-escaping values; `--target native` only.
- `borrow[~name]` parameter — lifetime-tracked non-owning reference; `--target native` only (§7.1, §23.4.2).
- `borrow` struct field qualifier — non-owning struct field; `--target native` only.
- `lifetime ~name` generic parameter — declares a named region for lifetime tracking; `--target native` only (§10.11, §11.4, §12.1, §23.4.2).
- `noescape fn(T): R` function type — non-escaping closure contract; allows stack allocation of captured variables; `--target native` only.

The `if (__name__ == "__main__")` guard pattern is prohibited in `@compiled` files — not because `__name__` is unavailable, but because top-level branching is prohibited (see above). `__name__` and `__file__` remain available as compile-time string constants for use inside function bodies (e.g., logging, error messages).

Only declarations are permitted at file top level in `@compiled` files: `class`, `enum`, `struct`, `interface`, `func`, `let`, `var`, `type`, and `import`.

**Permitted in compiled mode:**

- Structs, classes (non-dynamic), enums, interfaces
- Functions (sync, async, gen, async gen)
- `async`/`await` and `Task[T]` — the async runtime for native targets uses OS threads or a lightweight coroutine scheduler rather than a host event loop
- Generics (with statically-known type parameters)
- `try`/`catch`/`finally`, `defer`, `with`/`Scoped[T]`
- `del` and `Finalizable`
- Union types (with statically-known constituent types)
- Type aliases, `typeof`, `instanceof`
- Comprehensions, slicing, ternary expressions
- Destructuring, property getters/setters, decorators (metadata-only)
- Generators (compile to state machines)
- `extern native` declarations with zero-overhead FFI — native function calls compile to direct call instructions with no marshalling layer
- `Option[Any]` at error boundaries (`Scoped[T].scope_exit`, exception `cause`)

The compiler SHALL emit a compile-time error for any prohibited construct in a `@compiled` file.

**Import rules.** `@compiled` files may import other `@compiled` files. Importing a scripted-mode file from a `@compiled` file is a compile-time error. Conversely, scripted-mode files may import `@compiled` files — the JIT runtime loads the compiled module's exports as pre-compiled native or Wasm code.

The restriction is subtractive, not a different language: `@compiled` files use the same Loom syntax, type system, and semantics as scripted files for all permitted features.

### §22.3 Execution Semantics

Compiled mode files have different execution semantics from scripted mode:

- **No sequential top-level execution.** Top-level code in `@compiled` files consists only of declarations (types, functions, constants). There is no statement-by-statement execution. Only function bodies execute at call time.
- **Static data.** All top-level `let`/`var` bindings must have compile-time-constant initializers (literals, const arithmetic, enum variant constructors). These are compiled as static data, initialized before `main` or module load.
- **Compile-time type resolution.** All type declarations in `@compiled` files are resolved entirely at compile time. There is no runtime type registry for compiled types. `core.reflect.typeOf` on a compiled-mode type returns a `Type` value with static metadata baked in at compile time.
- **Module introspection dunders.** `__name__` is set to the module's fully-qualified dotted name and `__file__` is set to the source file path, both as compile-time string constants baked into the binary. `__name__` is never `"__main__"` in compiled mode. `__execmode__` is `"compiled"`.

**Exports.** Compiled modules may export functions, classes, enums, interfaces, structs, and constants. The export mechanism uses the same `pub` visibility rules as scripted mode.

**Interop boundary.** Compiled modules can be imported by scripted modules and vice versa (subject to the import rules in §22.2). At the boundary:

- **Scripted importing compiled:** The compiled module's exports appear as pre-resolved bindings — the JIT runtime does not step through the compiled module's declarations. Arguments are type-checked at the call site; compiled code receives statically-typed values.
- **Scripted passing `Any` to compiled:** When a scripted-mode caller passes an `Any`-typed value to a compiled function that expects a concrete type, the runtime performs an unboxing check at the call boundary and throws `TypeError` on mismatch.
- **Compiled calling scripted:** The compiled module declares the expected types; the runtime verifies at the boundary.

---

## §23 Native Compilation

*(This section is normative.)*

Loom supports compilation to native binaries via LLVM or Cranelift backends as an alternative to the primary Wasm GC+EH target. Native compilation produces platform-specific binaries with ARC memory management, zero-overhead C FFI, and deployment without a Wasm runtime.

```
loom build --target native
```

### §23.1 Platform Targets and Output Formats

**Supported host platforms:**

| Platform | Output Format | Default ABI |
|---|---|---|
| Linux (x86_64, aarch64) | ELF `.so` / executable | System V AMD64 / AAPCS64 |
| macOS (x86_64, arm64) | Mach-O `.dylib` / executable | macOS ABI |
| Windows (x86_64) | PE `.dll` / `.exe` | Microsoft x64 |

**Cross-compilation:**

```
loom build --target native --arch aarch64 --os linux     # ARM64 Linux
loom build --target native --arch arm64 --os macos       # Apple Silicon
loom build --target native --arch x86_64 --os windows    # Windows from Linux/macOS
```

Cross-compilation requires a cross-linker and target sysroot. The toolchain searches `PATH` for `<arch>-<os>-lld` or accepts `--linker` override.

**Output types:**

```
loom build --target native                  # executable (default)
loom build --target native --lib shared     # shared library (.so/.dylib/.dll)
loom build --target native --lib static     # static library (.a/.lib)
```

### §23.2 Compiler Backends

The native compilation pipeline:

1. Parse and type-check all `@compiled` source files.
2. Lower to MIR (mid-level intermediate representation).
3. Emit LLVM IR or Cranelift IR (selected by `--backend llvm|cranelift`; default: `llvm`).
4. Optimise (LLVM: `O0`–`O3` via `--opt`; Cranelift: speed-focused).
5. Link with the Loom native runtime library and any `extern native` libraries.
6. Produce the final binary.

**LLVM backend:** Provides the full LLVM optimisation pipeline including LTO, vectorisation, and profile-guided optimisation. Recommended for production builds.

**Cranelift backend:** Provides fast compilation with moderate optimisation. Recommended for development and CI. Does not support LTO.

### §23.3 Linker

**Reference linker:** `lld` (LLVM linker). `lld` ships with LLVM, supports all three output platforms from a single binary, and enables LTO across Loom and C/C++ translation units.

The toolchain searches for `lld` in the following order:
1. The path specified by `--linker <path>`.
2. `loom-lld` in the toolchain's `bin/` directory (bundled).
3. `lld` on `PATH`.
4. Platform fallback: `ld.lld` (Linux), `ld64.lld` (macOS), `lld-link` (Windows).

**Platform toolchain overrides.** For Apple platforms, the Apple `ld` linker is available for code signing and entitlements:

```
loom build --target native --os macos --linker ld
```

**Linker flags passthrough:**

```
loom build --target native -- -Wl,--version-script=exports.map
```

Arguments after `--` are passed verbatim to the linker.

**Link-time optimisation (LTO):**

```
loom build --target native --lto thin     # ThinLTO (recommended)
loom build --target native --lto full     # Full LTO (slower, better)
```

LTO requires the LLVM backend and is disabled by default.

### §23.4 ARC Memory Management

**Native builds use Automatic Reference Counting (ARC) as the mandatory memory management strategy.** There is no GC option for `--target native`. All class instances are heap-allocated with embedded reference counts.

**Reference counting model:**

- Every class instance carries an inline `strong_count: atomic_int` and `weak_count: atomic_int`.
- Assigning a reference increments `strong_count`. Releasing a variable decrements it.
- When `strong_count` reaches zero, `finalize()` is called (if the class implements `Finalizable`) and memory is freed.
- `weak` references track `weak_count`. When `strong_count` reaches zero, `weak_count` is decremented. Memory is freed when both counts reach zero.
- Reference count operations are atomic, enabling safe use across OS threads in future multi-threaded extensions.

**Compiler-inserted retain/release.** The compiler analyses ownership at each assignment, function call, and scope exit and inserts `retain()` and `release()` calls automatically. User code never calls `retain()` or `release()` directly — these are `@internal` runtime functions.

**Value types.** Structs, enums, tuples, and primitives are not reference counted. They are copied by value. Structs containing class fields carry reference count operations when copied.

**Deterministic finalization.** `finalize()` is called when the last strong reference drops. `del handle;` releases the strong reference immediately. `with`/`Scoped[T]` releases at block exit. Both remain the preferred idioms for resource management; under ARC they provide early release rather than a safety net.

**`weak` reference runtime semantics (native ARC).** A `weak var` field does not increment `strong_count`. The ARC runtime maintains a side table of weak references to each object. When `strong_count` reaches zero, the runtime atomically zeroes all weak references to the object. Subsequent reads of a `weak` field load through the side table and return `None` if the entry is null. The side-table lookup is a single atomic load.

**`unowned` reference runtime semantics (native ARC).** An `unowned` field does not increment `strong_count` and is not tracked in the side table. Accessing an `unowned` field after the referent has been freed unconditionally traps with a `LifetimeError` in **all** build configurations, including release builds (`--release`). The trap is a single null-pointer check inserted by the compiler at each dereference site; its cost is comparable to a bounds check and is typically eliminated by the optimiser when the compiler can statically prove liveness.

Use `unowned[~name]` (§23.4.3) for class fields whose lifetime relationship can be proven from scope nesting. Use `weak` when in doubt — it is always safe.

### §23.4.1 ARC Elision via `borrow` and `noescape fn`

Two constructs guide the compiler to elide ARC operations on specific hot paths:

**`borrow` parameters.** The compiler omits `retain()` on function entry and `release()` on function exit for `borrow` parameters. The ABI passes the value as a raw pointer with no reference count modification. The compiler verifies via escape analysis that the value does not outlive the call frame — any violation is a compile-time error before the elision is applied.

**`noescape fn` closure parameters.** The compiler may pass a `noescape fn` closure as a raw function pointer and captured-environment pointer pair, without ARC-retaining the closure object. For closures whose captures are all stack-resident values (no heap-allocated `var` bindings, no class instances captured by reference), the compiler may represent the entire closure on the stack with zero heap allocation.

The combined pattern produces zero ARC activity on hot iteration paths. For lifetime tracking of `borrow[~name]` references that flow beyond the call frame, see §23.4.2.

```loom
@compiled

func forEach[T](borrow items: list[T], body: noescape fn(borrow T): void): void {
  for (item in items) {
    body(borrow item);
  }
}

// Call site — no retain on items, no retain on the closure, no retain on each item
forEach(borrow myList, func(borrow item) {
  process(item);
});
```

### §23.4.2 Lifetime Tracking and Region Inference

*(This section is normative. Applies to `@compiled --target native`.)*

Lifetime tracking is a compile-time mechanism for verifying the safety of non-owning references (`borrow[~name]`) that flow beyond the call frame. It is entirely orthogonal to ARC: ARC manages the reference-counted heap lifetime of class instances; lifetime tracking manages the stack-frame lifetime of borrowed struct and value data. Neither system interferes with the other — a `borrow[~src] T` still elides ARC retain/release activity on `T` exactly as a plain `borrow T` would.

**Region model.** Each `[lifetime ~name]` parameter declaration introduces a *region* — a named scope to which borrowed references are anchored. A region declared on a function's parameter list is anchored to the lifetime of the argument provided by the caller. `~static` is the built-in forever region, anchored to the program's entire execution.

**Region containment and covariance.** If region `~a`'s source strictly outlives region `~b`'s source, then `~a` *contains* `~b`. A `borrow[~a]` value satisfies a `borrow[~b]` requirement whenever `~a` contains `~b`. `borrow[~static]` contains every user-declared region and therefore satisfies any `borrow[~name]` requirement.

**Compiler verification rules.** The following rules are enforced at compile time:

1. A `borrow[~name]` value may only be stored in a location whose declared type also carries `~name` (or a longer-lived region by covariance).
2. A `borrow[~name]` value may only be returned when the function's declared return type carries a region label that is the same as or shorter-lived than `~name`.
3. A `borrow[~name]` value may not be captured in a closure that escapes the frame where `~name` was declared, except via a `noescape fn` parameter or a lifetime-parameterized struct field that is itself constrained by `~name`.
4. A struct or enum carrying `[lifetime ~name]` parameters may not outlive the source region of `~name`.
5. `borrow[~name]` parameters are prohibited in `async func` signatures because async functions may suspend and resume after the caller's frame has exited (`E_BORROW_ASYNC`).
6. `borrow[~name]` bindings may not be captured by closures passed to `Thread.spawn`, `Thread.spawnWith`, or `ThreadPool.run` (`E_BORROW_THREAD_CAPTURE`).

7. **`unowned[~name]` field assignment.** A value assigned to a field declared `unowned[~name]` must originate from a scope that the compiler can statically verify contains (outlives) the `~name` region. Specifically: the value must have been declared in a scope `S` such that `S`'s lifetime strictly contains the `~name` region's source scope at the point of assignment. Values from equal, narrower, or unrelated scopes are `E_UNOWNED_LIFETIME_MISMATCH`. This rule is enforced by the same region containment rules as rule 1 — `~name` is treated as the target region and the value's declaration scope is treated as the source region.

**Reborrowing.** When a `borrow[~a]` is passed to a `borrow[~b]` parameter where `~b` does not appear in the callee's output positions (return type, output struct fields), the compiler creates a sub-region of `~a` for the call duration and unifies it with `~b`. This permits lifetime-labeled borrows to flow through helper functions without annotation at call sites.

**Lifetime erasure.** All lifetime labels are erased after the type-checking phase. The compiled binary carries no lifetime metadata. Lifetime tracking is a purely static compile-time analysis with zero runtime cost and zero binary size impact.

**Error codes.**

| Code | Meaning |
|---|---|
| `E_BORROW_ASYNC` | `borrow[~label]` parameter declared in an `async func` signature |
| `E_BORROW_THREAD_CAPTURE` | `borrow[~label]` value captured by `Thread.spawn`, `Thread.spawnWith`, or `ThreadPool.run` closure |
| `E_SENDABLE_LIFETIME` | Lifetime-parameterized type explicitly declares `implements Sendable` |
| `E_BORROW_CLOSURE_ESCAPE` | Lifetime-capturing closure assigned to a plain escaping `fn` binding |
| `E_BORROW_WITH_MISMATCH` | `with`-copy expression supplies a value from a mismatched lifetime for a `borrow[~name]` field |
| `E_LIFETIME_CYCLE` | Struct's `[lifetime ~name]` parameter creates a cyclic dependency through its own field types |
| `E_UNOWNED_NO_LIFETIME` | `unowned` field on a class has no lifetime annotation — must use `unowned[~name]` |
| `E_UNOWNED_CLASS_NO_PARAM` | Class has an `unowned[~name]` field but does not declare `[lifetime ~name]` as a class parameter |
| `E_UNOWNED_LIFETIME_MISMATCH` | Value assigned to `unowned[~name]` field does not originate from a scope that contains `~name` |

**Relationship to ARC.** ARC and lifetime tracking address separate questions:

| Concern | Mechanism | Checked at |
|---|---|---|
| How long does a heap object live? | ARC retain/release | Runtime |
| Does a non-owning reference outlive its source stack frame? | Lifetime tracking (`borrow[~name]`) | Compile time |
| Does an `unowned[~name]` field referent outlive the holder? | Region containment (rule 7) | Compile time |
| Can a class instance be shared across threads safely? | `Sendable` marker | Compile time |

These three mechanisms are independent. A function may use all three simultaneously: an ARC-managed class parameter, a `borrow` parameter (ARC elided), and a `borrow[~src]` parameter (ARC elided, lifetime tracked) without any interaction between the systems.


### §23.4.3 Lifetime-Verified `unowned[~name]` Fields

*(This section is normative. Applies to `@compiled --target native`.)*

`unowned[~name]` is a field qualifier that holds a non-owning, non-retaining reference whose validity is **proven at compile time** via the region system (§23.4.2). It is the only form of `unowned` permitted on class fields. Bare `unowned` on a class field (without a lifetime annotation) is a compile-time error (`E_UNOWNED_NO_LIFETIME`).

Because safety is compiler-proven, `unowned[~name]` fields do not insert any runtime null-trap. Every access is zero-cost: a raw pointer load with no check. There are no unsafe annotations, no runtime opt-outs, and no undefined behaviour paths.

#### Class declaration requirements

A class with `unowned[~name]` fields must declare `[lifetime ~name]` as a class-level lifetime parameter. This anchors the class instance's own lifetime to the `~name` region, which the compiler uses to verify that the class cannot outlive any of its `unowned[~name]` referents.

```loom
@compiled

class TreeNode[lifetime ~owner] : Any {
  pub let value: int;

  // Compile-time proven: every assigned value must be declared in a scope
  // that the compiler verifies contains (outlives) ~owner.
  unowned[~owner] var parent: TreeNode[~owner]?

  pub var children: list[TreeNode[~owner]] = []

  new(value: int, parent: TreeNode[~owner]?) {
    this.value = value;
    this.parent = parent;
  }
}
```

#### Assignment verification

The compiler applies rule 7 of §23.4.2 at every site that writes to an `unowned[~name]` field. The value's declaration scope must statically contain the `~name` region:

```loom
@compiled

func buildTree[lifetime ~tree](): TreeNode[~tree] {
  // root is declared in ~tree — it is the ~tree anchor.
  let root = TreeNode[~tree](value=0, parent=None);

  // Allowed: root was declared in ~tree, which contains ~tree (trivially).
  let child = TreeNode[~tree](value=1, parent=Some(root));

  return root;
}

// Compile-time error examples:
func errors[lifetime ~tree](): void {
  let root = TreeNode[~tree](value=0, parent=None);

  {
    // inner is declared in a sub-scope narrower than ~tree.
    let inner = TreeNode[~tree](value=2, parent=None);
    root.parent = Some(inner);   // E_UNOWNED_LIFETIME_MISMATCH — inner does not
                                 // outlive ~tree; inner's scope is nested inside it.
  }
}
```

#### Subclassing

A subclass of a `[lifetime ~owner]` class automatically inherits the lifetime parameter. If the subclass adds its own `unowned[~name]` fields, `~name` must be the same parameter or a declared superset region. A subclass may not introduce a new, unrelated lifetime parameter for its own `unowned` fields without also declaring that parameter at the class level.

#### Error codes

| Code | Meaning |
|---|---|
| `E_UNOWNED_NO_LIFETIME` | Bare `unowned` on a class field — must use `unowned[~name]` |
| `E_UNOWNED_CLASS_NO_PARAM` | Class has `unowned[~name]` field but does not declare `[lifetime ~name]` |
| `E_UNOWNED_LIFETIME_MISMATCH` | Value assigned to `unowned[~name]` does not originate from a scope containing `~name` |

#### Relationship to `weak`

`weak` fields are always safe on all targets and require no lifetime parameters — they zero automatically through the ARC side table. Use `unowned[~name]` only when the lifetime relationship is strictly hierarchical and provable from scope nesting, and when avoiding the side-table lookup is measurable and important. When in doubt, use `weak`.

---

### §23.4.4 Inferred Struct Lifetimes

*(This section is normative. Applies to `@compiled --target native`.)*

When a struct's fields are all declared with `borrow` or `borrow[~name]` qualifiers, the compiler infers an implicit single lifetime for the struct without requiring explicit `[lifetime ~name]` parameter declarations. This covers the common "temporary view" pattern — a struct that borrows into a larger buffer for the duration of a local computation — without any user-visible lifetime annotation burden.

**Inference rule.** If every field of a struct (that is not a primitive, enum, or by-value struct) carries a `borrow` qualifier, the compiler:

1. Creates an implicit region `~self` anchored to the struct value's own declaration scope.
2. Treats all `borrow` fields as `borrow[~self]` for the purposes of escape analysis.
3. Verifies that the struct value does not outlive any of its borrowed fields' source scopes.
4. Emits `E_INFERRED_LIFETIME_ESCAPE` if the struct value would outlive a borrowed field.

The inferred lifetime is transparent to the programmer: no `[lifetime ~self]` appears in source code, no annotation is required at the constructor call site, and the compiled binary carries no lifetime metadata.

```loom
@compiled

// All fields are borrow — lifetime inferred; no annotation needed
struct PacketView {
  borrow header: bytes;   // borrows into a larger buffer
  borrow payload: bytes;  // borrows into the same buffer
}

func parsePacket(borrow buf: bytes): void {
  let view = PacketView(
    header  = borrow buf[0:20],
    payload = borrow buf[20:],
  );
  process(view);   // fine — view stays within buf's scope
  // view cannot be returned or stored in a longer-lived location
}
```

**Limitations.** Inferred lifetimes only apply when all non-trivial fields carry `borrow`. A struct with a mix of owned and borrowed fields must use explicit `[lifetime ~name]` parameters (§10.11). The inference is purely single-lifetime — multi-lifetime structs (where different fields borrow from different sources with independent lifetimes) require explicit parameterisation.

**Error codes.**

| Code | Meaning |
|---|---|
| `E_INFERRED_LIFETIME_ESCAPE` | A struct with inferred lifetime is assigned to a location that outlives one of its borrowed fields |
| `E_INFERRED_LIFETIME_RETURN` | A struct with inferred lifetime is returned from a function without explicit lifetime annotation on the return type |

---

### §23.4.5 `@noalias` — Disjoint Buffer Annotation

*(This section is normative. Applies to `@compiled --target native`.)*

`@noalias` is a function-parameter annotation that asserts two or more `borrow` parameters do not alias — that is, they do not point to overlapping memory regions. It is a programmer assertion that the compiler trusts without verification.

**Motivation.** The LLVM and Cranelift backends can auto-vectorise loops operating on disjoint buffers, but only when they can prove no aliasing exists. For `borrow` parameters, the compiler cannot statically determine aliasing in the general case. `@noalias` provides the missing information, unlocking auto-vectorisation and enabling the compiler to emit C `restrict`-qualified pointers in the ABI, matching the performance of carefully written C or Fortran numerical code.

**Syntax.** `@noalias` is placed before the parameter modifier keyword:

```loom
@compiled

func vectorAdd(
  @noalias borrow out: bytes,
  @noalias borrow a: bytes,
  @noalias borrow b: bytes,
  n: int,
): void {
  // Compiler is permitted to auto-vectorise this loop because @noalias
  // asserts out, a, and b do not overlap.
  for (let i = 0; i < n; i = i + 1) {
    out[i] = a[i] + b[i];
  }
}
```

**Rules:**

- `@noalias` is valid only on `borrow` and `borrow[~name]` parameters.
- `@noalias` on a non-`borrow` parameter is a compile-time error.
- `@noalias` is a programmer assertion — the compiler does not verify disjointness. If the programmer lies and passes overlapping buffers, the resulting behaviour is undefined in release builds.
- `@noalias` applies to all call sites of the annotated function. There is no per-call-site override.
- `@noalias` is valid only in `@compiled` files. Using it in scripted-mode files is a compile-time error.
- The reference formatter emits a `noalias-unchecked` lint advisory for every `@noalias` parameter as a reminder during code review.
- Multiple `@noalias` parameters in the same function signature assert pairwise disjointness: all pairs `(p_i, p_j)` where `i ≠ j` are asserted non-overlapping.

**ABI effect.** On native targets, `@noalias borrow T` parameters are emitted with the `noalias` LLVM IR attribute (equivalent to C's `__restrict__`). This propagates the aliasing information through the optimisation pipeline.


### §23.5 ARC and the Interpreted/Compiled Boundary

When a compiled (ARC) object is passed into interpreted (GC) code, the runtime inserts a **bridge retain**:

1. The runtime allocates a thin GC-managed wrapper object on the GC heap.
2. The wrapper holds a strong ARC retain on the native object (incrementing `strong_count`).
3. The GC manages the wrapper object's lifetime.
4. When the GC collects the wrapper, the wrapper's finalizer calls `release()` on the ARC object.

From the interpreted side, the ARC object appears as a normal class instance. From the compiled side, the retain count is elevated by one for each live interpreted reference.

When an interpreted (GC-managed) object is passed into compiled (ARC) code:

1. The compiled function's entry point registers the GC object reference as a GC root.
2. The root is released when the compiled function returns or when the last local binding to the object is released within compiled code.

**`del` at the boundary.** Calling `del handle;` on a bridge wrapper releases the ARC retain immediately and invalidates the GC wrapper. Subsequent access to `handle` from interpreted code throws `LifetimeError`.

**Cross-boundary cycles.** Cross-boundary cycles (ARC object → GC object → ARC object) are not automatically broken. Use `weak` references on one side. The compiler emits a lint warning when it detects a probable cross-boundary cycle in static analysis.

### §23.6 ABI Stability

Loom native modules export a stable C-compatible ABI for `pub` functions and types when opted in:

```
# <name>.lmpkg
stable_abi  true      # opt in to ABI stability guarantees
abi_version 1         # increment on breaking changes
```

**ABI-stable type layout rules:**

- `struct` fields are laid out in declaration order with C-compatible alignment.
- `class` instances: header (`strong_count`, `weak_count`, vtable pointer) followed by fields in declaration order.
- Enums: discriminant tag (`uint32`) followed by the largest variant's payload, padded to alignment.
- Primitives use their natural C ABI types (`int64_t`, `double`, `bool`, etc.).

**ABI versioning.** The `abi_version` is embedded in the binary and generated header. Consumers check version compatibility at link time. An incompatible version is a linker error.

**ABI-breaking changes** (require `abi_version` increment): adding/removing/reordering fields on exported structs or classes; changing parameter or field types; adding parameters to exported functions.

**ABI-compatible changes** (no increment): adding new `pub` functions; adding private fields at the end of a class with padding; changing function bodies without altering signatures.

### §23.7 C Header Interop

Loom provides bidirectional C header interop for native builds.

#### §23.7.1 `loom export-headers` — Loom → C

Generates a C header file from a compiled Loom module's public API, allowing C/C++ code to call Loom:

```
loom export-headers --target native mymodule.loom -o mymodule.h
```

**Generated header format:**

```c
// mymodule.h — generated by loom export-headers
// DO NOT EDIT

#pragma once
#include <stdint.h>
#include <stdbool.h>

#ifdef __cplusplus
extern "C" {
#endif

typedef struct { double x; double y; } LoomPoint;

double loom_mymodule_distance(LoomPoint a, LoomPoint b);

typedef struct LoomString LoomString;
LoomString* loom_mymodule_greet(const char* name);
const char* loom_string_cstr(const LoomString* s);
void        loom_string_free(LoomString* s);

#ifdef __cplusplus
}
#endif
```

**Type mapping:**

| Loom type | C type | Notes |
|---|---|---|
| `int` / `int64` | `int64_t` | |
| `int8` | `int8_t` | |
| `int16` | `int16_t` | |
| `int32` | `int32_t` | |
| `uint8` | `uint8_t` | |
| `uint16` | `uint16_t` | |
| `uint32` | `uint32_t` | |
| `uint64` | `uint64_t` | |
| `float` / `float64` | `double` | |
| `float32` | `float` | |
| `bigint` | `LoomBigInt*` | Opaque; caller manages via `loom_bigint_retain`/`loom_bigint_release` |
| `decimal` | `LoomDecimal*` | Opaque; caller manages via `loom_decimal_retain`/`loom_decimal_release` |
| `bool` | `bool` | |
| `string` | `LoomString*` | Caller frees via `loom_string_free` |
| `bytes` | `LoomBytes*` | Caller frees via `loom_bytes_free` |
| `Vec[T, N]` | `T[N]` (array) | Must be 16/32/64-byte aligned; pass by pointer for N > 4 |
| `struct T` | `LoomT` | By value for small structs |
| `class T` | `LoomT*` (opaque) | Caller manages via `loom_T_retain`/`loom_T_release` |
| `Option[T]` (primitive) | `T` with sentinel or bool out-param | Configurable via `@cexport` |
| `void` | `void` | |

**`@cexport` annotation** provides fine-grained control over the generated C signature:

```
@cexport(name="get_user_name", nullable=true)
pub func getUserName(id: string): string? { ... }
```

#### §23.7.2 `loom import-headers` — C → Loom

Generates Loom `extern native` declarations from a C header file, eliminating hand-written FFI bindings:

```
loom import-headers --lib sqlite3 /usr/include/sqlite3.h -o sqlite3.loom
```

**Generated binding format:**

```loom
// sqlite3.loom — generated by loom import-headers
// DO NOT EDIT

@compiled

extern native "libsqlite3" func sqlite3_open(filename: string, ppDb: NativeHandle): int;
extern native "libsqlite3" func sqlite3_close(db: NativeHandle): int;
extern native "libsqlite3" val SQLITE_OK: int;
extern native "libsqlite3" val SQLITE_ERROR: int;
```

**Import rules:**

- C functions with pointer parameters produce `NativeHandle` for opaque pointers.
- `char*` input strings map to `string`. `char*` output strings remain `NativeHandle` (ownership ambiguous without annotations).
- `int`/`long`/`short` map to `int`. `double`/`float` map to `float`.
- Variadic C functions are emitted with a comment noting they require a wrapper.
- C macros are not imported.
- C function pointers are emitted as `NativeHandle` with a comment showing the original signature.

**`.hints` files** annotate the import to improve generated types:

```toml
# sqlite3.hints
[sqlite3_exec.params.sql]
type = "string"

[sqlite3_errmsg]
return_type = "string"
```

**Multi-library imports:**

```
loom import-headers --lib ssl --lib crypto /usr/include/openssl/ssl.h -o openssl.loom
```

### §23.8 Build Pipeline and `.lmpkg` for Native

**Manifest additions:**

```
# <name>.lmpkg
stable_abi   true
abi_version  1

[target.native]
include io.fs
include io.proc
include net.net
link sqlite3              # pass -lsqlite3 to the linker
link_path /opt/local/lib  # extra library search path
framework CoreFoundation  # macOS framework (ignored on non-Apple)
```

**Full build command set:**

```
loom build --target native                        # debug build
loom build --target native --release              # release build
loom build --target native --release --lto thin   # release with ThinLTO
loom build --target native --debug                # release with DWARF debug info
loom build --target native --backend cranelift    # fast Cranelift backend
loom build --target native --lib shared           # shared library
loom build --target native --lib static           # static library
loom build --target native --arch aarch64 --os linux  # cross-compile
loom export-headers --target native mymodule.loom -o include/mymodule.h
loom import-headers --lib sqlite3 sqlite3.h -o bindings/sqlite3.loom
```

### §23.9 Requirements

- Native compilation requires `@compiled` mode for all source files in the compilation unit.
- All types must be statically known. `Any` as a declared type, `dynamic class`, and `core.inspect` are prohibited.
- `extern js` and `@jsexport` are prohibited.
- ARC is mandatory; there is no GC option for `--target native`.

## §24 Macros and Metaprogramming

*(This section is normative.)*

Loom provides a hygienic macro system for compile-time code generation:

**Hygiene.** Macro-introduced bindings do not capture or shadow caller bindings. The macro body has its own scope. Spliced parameters (`${param}`) are substituted as syntactic AST fragments before name resolution — the caller's names are never visible inside the macro body unless explicitly spliced.

**Expansion timing.** Macros are expanded at compile time before type-checking. Macro output must be well-typed; ill-typed macro output is a compile-time error at the expansion site.

**Typed quasiquotes.** Macros use `quote { }` blocks to construct AST fragments. Inside a `quote` block, `${param}` splices the AST node bound to the named parameter into the output:

```
macro assert_eq(a, b) {
  quote {
    let __left = ${a};
    let __right = ${b};
    if (__left != __right) {
      throw AssertionError("Expected {$ __left $} == {$ __right $}");
    }
  }
}

assert_eq!(compute(), expected);
```

**Quasiquote AST categories.** A `quote` block may contain any syntactically valid Loom constructs: statements, expressions, declarations, and type annotations. Splice positions (`${param}`) are resolved by the macro expander using the category of the surrounding syntax — a splice in expression position must receive an expression, a splice in type position must receive a type, and so on. A category mismatch is a compile-time error at the macro declaration site.

**Parameters and arity.** Macro parameters are positional identifiers. Macros do not support default values, rest parameters, or keyword arguments. Invoking a macro with the wrong number of arguments is a compile-time error.

**Limitations.**
- Macros cannot perform I/O, import modules, or access runtime state.
- Macros cannot be recursive (a macro may not invoke itself, directly or indirectly).
- Macros operate on syntactic structure only; they cannot inspect types of their arguments.
- `quote` bodies may not contain `await` or `yield` at the top level (they may appear inside lambdas within the quote body).

**Scope and export.** Macro definitions are scoped to the module where they are declared. Export a macro with `pub macro name(...) { ... }`. Consumers import macro names with the standard import syntax; the `!` invocation suffix is used at the call site.

**Rules:**

- Macros are declared with `macro name(params) { ... }` syntax.
- Macros are invoked with `name!(args)` syntax (the `!` distinguishes macro invocations from function calls).
- Macros are a separate compilation phase and cannot perform I/O or runtime operations.
- Macro definitions are scoped to the module where they are declared and can be exported with `pub`.
- The formal grammar for macro declarations and invocations is in §26.11.

---

## §25 Failure Policy

*(This section is normative.)*

This section consolidates all failure behaviors across the Loom language.

### §25.1 Exception Hierarchy

All exception types extend a root `BaseException` class. The catchable subset extends `Exception`, which itself extends `BaseException`. Not all exceptional conditions are errors — `SystemExit` is a deliberate process termination, `KeyboardInterrupt` is an external signal, and `GeneratorExit` is a generator lifecycle event. These extend `BaseException` directly and are not caught by `catch (Exception)`.

```
class BaseException : Any {
  pub let message: string;
  pub let cause: Option[Any];
  pub let stackTrace: list[StackFrame];
}

class Exception : BaseException {}

class SystemExit : BaseException {
  pub let code: int;
}

class KeyboardInterrupt : BaseException {
  pub let signal: int;
}

class GeneratorExit : BaseException {}

class BaseExceptionGroup : BaseException {
  pub let exceptions: list[BaseException];
}

class ExceptionGroup : Exception {
  pub let exceptions: list[Exception];
}

// Discriminant for LifetimeError — identifies which runtime check triggered.
enum LifetimeErrorKind {
  TaskEscapedScope;     // a spawned task reference outlived its await-group scope
  UseAfterFree;         // an unowned field was accessed after its referent was freed
  BridgeDeallocated;    // del was called on a GC↔ARC bridge wrapper; subsequent access
}

class StackFrame : Any {
  pub file: string;
  pub line: int;
  pub column: int;
  pub function: Option[string];
}

class ModuleLoadError : Exception {
  pub let modulePath: string;
  pub let compiledAttempted: bool;
  pub let scriptedAttempted: bool;
}
```

**Complete exception hierarchy:**

```
Any
└── BaseException (message, cause, stackTrace)
    ├── SystemExit (code: int)
    ├── KeyboardInterrupt (signal: int)
    ├── GeneratorExit
    ├── BaseExceptionGroup (exceptions: list[BaseException])
    └── Exception
        ├── ExceptionGroup (exceptions: list[Exception])
        ├── TypeError
        ├── MatchError
        ├── CapabilityError
        ├── FfiTypeError
        ├── LifetimeError (kind: LifetimeErrorKind)
        ├── ModuleLoadError
        ├── TimeoutError
        ├── CancellationError
        ├── DestructureError
        ├── IndexError
        ├── KeyError
        ├── IoError
        ├── NumericOverflowError
        ├── RuntimeError
        ├── RuntimeConfigError
        ├── BlockingTimeoutError
        ├── WsNetworkError
        ├── WsStateError
        └── User-defined exceptions (extending Exception)
```

All exception types carry `message: string`, `cause: Option[Any]`, and `stackTrace: list[StackFrame]`.

**Catch semantics by type:**

| Catch clause | Catches |
|---|---|
| `catch (Exception as err)` | All `Exception` subtypes (TypeError, IoError, etc.) and `ExceptionGroup`. Does NOT catch `SystemExit`, `KeyboardInterrupt`, `GeneratorExit`, or `BaseExceptionGroup`. |
| `catch (BaseException as err)` | Everything — all `BaseException` subtypes including `SystemExit`, `KeyboardInterrupt`, `GeneratorExit`, `BaseExceptionGroup`, and all `Exception` subtypes. |
| `catch (SystemExit as err)` | Only `SystemExit`. |
| Bare `catch` (no type) | Same as `catch (Exception as err)`. |

All `BaseException` subtypes — including those not caught by `catch (Exception)` — still execute cleanup frames (`defer`, `with`, `finally`) during propagation.

### §25.2 User-Defined Exceptions

User-defined exception types MUST extend `Exception` (directly or transitively) for catchable exceptions. Any class that extends `Exception` is a valid exception type and can be thrown and caught:

```
class AppError : Exception {
  pub let code: int;

  new(message: string, code: int) {
    super(message);
    this.code = code;
  }
}

class NotFoundError : AppError {
  new(resource: string) {
    super("Not found: {$ resource $}", code=404);
  }
}
```

Throwing a value that does not extend `BaseException` is a compile-time error.

Users MAY extend `BaseException` directly for exceptions that should not be caught by `catch (Exception)`. The compiler SHALL emit a warning when a user-defined type extends `BaseException` directly (rather than `Exception`), advising that the type will not be caught by generic exception handlers.

### §25.3 Exception Categories

**Compile-time errors (uncatchable — not part of the exception hierarchy):**
- Parse/lex errors
- Type errors (static)
- Alignment violations (`E_MLS_ALIGN`)
- Component resolution errors
- Exhaustiveness failures
- Compiled-mode restriction violations
- Unknown label references
- Invalid destructuring patterns

**Runtime exceptions caught by `catch (Exception)` (catchable):**
- `TypeError` — dynamic type mismatch (e.g., non-`bool` condition)
- `MatchError` — no matching arm in `match` over `Any`
- `CapabilityError` — accessing unavailable capability
- `FfiTypeError` — FFI argument marshalling failure
- `LifetimeError` — runtime lifetime violation; inspect `.kind` (a `LifetimeErrorKind`) to distinguish `TaskEscapedScope` (task outlived its `await group`), `UseAfterFree` (`unowned` field accessed after referent freed), and `BridgeDeallocated` (`del` called on a GC↔ARC bridge wrapper)
- `TimeoutError` — `TaskGroup.withTimeout` exceeded
- `CancellationError` — task cancelled in structured concurrency
- `DestructureError` — destructuring pattern mismatch at runtime
- `IndexError` — out-of-range index access
- `KeyError` — missing dict key
- `NumericOverflowError` — integer overflow on fixed-width types (scripted/Wasm mode)
- `IoError` — filesystem, network, or process errors
- `ExceptionGroup` — group of `Exception` subtypes from concurrent task failures

**Runtime exceptions NOT caught by `catch (Exception)` (BaseException-only):**
- `SystemExit` — deliberate process exit request via `runtime.exit(code)`. Carries `code: int`.
- `KeyboardInterrupt` — external interrupt signal (SIGINT). Carries `signal: int`.
- `GeneratorExit` — generator/iterator cleanup when closed before exhaustion.
- `BaseExceptionGroup` — group of exceptions that includes at least one `BaseException`-only subtype.

**Result-based errors (propagated via `?`):**
- Typed, recoverable errors using `Result[T, E]`.
- The `?` operator converts between error types via `From[E]`.

### §25.4 Exception Propagation Rules

- Exceptions propagate up the call stack through `try`/`catch`/`finally` and `defer` blocks.
- ALL `BaseException` subtypes propagate through cleanup frames (`defer`, `with`, `finally`). `BaseException`-only subtypes (`SystemExit`, `KeyboardInterrupt`, `GeneratorExit`) bypass `catch (Exception)` handlers but still execute cleanup.
- `finally` always executes; if `finally` throws, its exception replaces the pending exception with the original attached as `cause`.
- `return`, `break`, `continue` inside `finally` are compile-time errors.
- `defer` is **block-scoped**, not function-scoped. A `defer` registered inside a
  `try` block runs when the `try` block exits (as part of that block's scope exit),
  which is **before** the `catch` handler executes. A `defer` registered outside
  the `try` block runs when its own enclosing block exits, after any `catch` or
  `finally` that belongs to that block:
  ```
  func example(): void {
    defer print("D: outer defer");     // runs last — belongs to func scope
    try {
      defer print("D: try-block defer"); // runs before catch — inside try block
      throw IoError("fail");
    } catch (IoError as err) {
      print("C: catch");               // runs after try-block defer
    } finally {
      print("F: finally");             // runs after catch
    }
    // output order: "D: try-block defer", "C: catch", "F: finally", "D: outer defer"
  }
  ```
  If a `defer` action itself throws, the exception propagates out of the scope exit
  and is not caught by any `catch` clause in the same `try` statement — it propagates
  to the enclosing scope. The original exception (if any) is attached as `.cause`.
- In structured concurrency, a failing child cancels siblings; `CancellationError` propagates to the group scope.
- Exception chaining via `cause` preserves the full error context.
- The runtime's default error reporting prints the full cause chain.

### §25.5 Catch Pattern Matching

The `catch` clause supports union type patterns to catch multiple exception types in a single handler:

```
try {
  riskyOperation();
} catch (TypeError | MatchError as err) {
  // err is typed as TypeError | MatchError
  print("Logic error: {$ err.message $}");
} catch (IoError as err) {
  // err is typed as IoError
  print("I/O error: {$ err.message $}");
} catch (Exception as err) {
  // catches any remaining Exception subtype
  // does NOT catch SystemExit, KeyboardInterrupt, GeneratorExit
  print("Unexpected: {$ err.message $}");
}
```

Catch clauses are evaluated top-to-bottom. The first clause whose type pattern matches the thrown exception's runtime type (via `instanceof`) handles the exception.

**`catch (Exception as err)`** catches all `Exception` subtypes since every standard exception extends `Exception`. It does NOT catch `BaseException`-only subtypes (`SystemExit`, `KeyboardInterrupt`, `GeneratorExit`, `BaseExceptionGroup`).

**`catch (BaseException as err)`** catches everything — all `BaseException` subtypes including `SystemExit`, `KeyboardInterrupt`, and all `Exception` subtypes.

**Bare `catch`** (without a type filter) is equivalent to `catch (Exception as err)`.

Catching a parent type also catches all its subtypes. For example, `catch (AppError as err)` catches `NotFoundError` if `NotFoundError` extends `AppError`.

```
// Catching BaseException-only subtypes requires explicit type:
try {
  runtime.exit(0);
} catch (SystemExit as err) {
  // Intercept exit — e.g., in a test harness
  print("Exit with code: {$ err.code $}");
}

// catch (Exception) would NOT catch SystemExit:
try {
  runtime.exit(0);
} catch (Exception as err) {
  // This handler is NEVER reached for SystemExit
  print("This won't print");
}
// SystemExit propagates past catch(Exception), runs cleanup, exits process
```

### §25.6 Template Exceptions

- Hard fail by default for evaluation and formatting errors.
- Buffered `try`/`catch` in template fences.
- `render`/`renderWith` fail if evaluation reaches `await`.
- Parse/lex errors and alignment violations are uncatchable (compile-time errors, not part of the exception hierarchy).

### §25.7 Task Failures

- A task that fails and is never awaited becomes an unhandled task failure reported by the runtime.
- `await` on a failed task rethrows the failure.
- In `await group`, a failing child cancels all siblings.
- When multiple tasks fail in a `TaskGroup`, the exceptions are collected into an `ExceptionGroup` (if all are `Exception` subtypes) or a `BaseExceptionGroup` (if any are `BaseException`-only subtypes).

### §25.8 FFI Exceptions

- Outbound: type mismatches at `extern js`/`extern native` boundaries produce `FfiTypeError`.
- Inbound: unmarshalable JS arguments to `@jsexport` functions produce `FfiTypeError`.
- `@jsexport async func` failures cause the returned Promise to reject.

### §25.9 Signal Handling

The runtime provides signal handling for graceful shutdown and interrupt processing on `cli`, `service`, `desktop`, and `native` targets. Signal handling is not available on `browser` or `wasm` targets.

**Default signal behavior:**

| Signal | Default Action |
|---|---|
| `SIGINT` (Ctrl+C) | Raise `KeyboardInterrupt(signal=2)` in the main task |
| `SIGTERM` | Raise `SystemExit(code=143)` in the main task (128 + 15) |
| `SIGHUP` | Raise `SystemExit(code=129)` in the main task (128 + 1) |
| `SIGUSR1` | No-op (available for user handlers) |
| `SIGUSR2` | No-op (available for user handlers) |

**Signal delivery.** When a signal is received, the runtime schedules the handler to execute on the event loop at the next safe point — not inside the OS signal handler context. This ensures that Loom code (including cleanup frames) executes safely.

**Double-interrupt protection.** If a second `SIGINT` is received while a `KeyboardInterrupt` is already propagating (e.g., during cleanup), the runtime force-terminates the process immediately with exit code 130, without further cleanup. This prevents hung cleanup from blocking termination.

**`runtime.exit(code)`.** The `runtime.exit(code: int)` function raises `SystemExit(code)` rather than immediately terminating the process. This allows `defer`, `with`, and `finally` cleanup frames to execute before the process exits. When `SystemExit` reaches the top of the main task without being caught, the process terminates with the specified exit code.

**Custom signal handlers.** The `io.proc` module provides `onSignal(signal, handler)` to register custom signal handlers, `resetSignal(signal)` to restore defaults, and `awaitSignal(signal)` for async signal-driven workflows. See §21.8 for the full API.



---

## §26 Grammar

*(This section is normative.)*

This section provides the complete formal grammar for the Loom language in Extended Backus-Naur Form (EBNF). The grammar covers all syntactic constructs defined in this specification. The grammar is target-independent — it applies equally to the Wasm GC+EH bytecode target (§2.1, §22) and the native compilation target (§23). Target-specific semantics (e.g., Wasm type mappings, native ABI conventions) are defined in their respective sections.

**Notation conventions:**

- `::=` defines a production rule.
- `|` separates alternatives.
- `( ... )` groups alternatives.
- `[ ... ]` denotes optional elements (zero or one).
- `{ ... }` denotes repetition (zero or more).
- `"..."` denotes terminal symbols (keywords, punctuation).
- `UPPER_CASE` denotes lexical tokens.
- `PascalCase` denotes non-terminal symbols.

### §26.1 Lexical Grammar

```ebnf
(* Source encoding: UTF-8 *)

(* Whitespace and comments *)
Whitespace     ::= " " | "\t" | "\r" | "\n"
LineComment    ::= "//" { ANY_CHAR - "\n" } "\n"
BlockComment   ::= "/*" { ANY_CHAR - "*/" } "*/"
                   (* Block comments do NOT nest. The first "*/" closes the comment.
                      Nested "/*" sequences inside a block comment are literal content. *)
DocComment     ::= "///" { ANY_CHAR - "\n" } "\n"

(* Identifiers *)
Identifier     ::= IdentStart { IdentContinue }
IdentStart     ::= UNICODE_LETTER | "_"
IdentContinue  ::= UNICODE_LETTER | UNICODE_DIGIT | "_"
UpperIdent     ::= UPPER_LETTER { IdentContinue }
LowerIdent     ::= ( LOWER_LETTER | "_" ) { IdentContinue }
(* UpperIdent and LowerIdent encode the casing conventions described in §3.4.
   They are used by the reference formatter and linter to flag violations but are
   NOT used in syntactic grammar productions — all declaration sites accept the
   general Identifier token. Casing violations are lint advisories, not errors. *)

(* Integer literals *)
IntLiteral     ::= ( DecimalLit | HexLit | BinaryLit | OctalLit ) [ IntSuffix ]
DecimalLit     ::= DIGIT { DIGIT | "_" }
HexLit         ::= "0" ( "x" | "X" ) HEX_DIGIT { HEX_DIGIT | "_" }
BinaryLit      ::= "0" ( "b" | "B" ) BIN_DIGIT { BIN_DIGIT | "_" }
OctalLit       ::= "0" ( "o" | "O" ) OCT_DIGIT { OCT_DIGIT | "_" }
IntSuffix      ::= "i8" | "i16" | "i32" | "i64"
                 | "u8" | "u16" | "u32" | "u64"
                 | "n"   (* bigint *)

(* Float literals *)
FloatLiteral   ::= ( DIGIT { DIGIT } "." DIGIT { DIGIT } [ Exponent ]
                   | DIGIT { DIGIT } Exponent ) [ FloatSuffix ]
FloatSuffix    ::= "f32" | "f64" | "d"   (* d = decimal *)
Exponent       ::= ( "e" | "E" ) [ "+" | "-" ] DIGIT { DIGIT }

(* String literals *)
StringLiteral  ::= DoubleString | SingleString | RawDoubleString | RawSingleString
DoubleString   ::= '"' { StringChar | EscapeSeq | InlineExpr } '"'
SingleString   ::= "'" { StringChar | EscapeSeq | InlineExpr } "'"
RawDoubleString ::= "r" '"' { ANY_CHAR - '"' } '"'
RawSingleString ::= "r" "'" { ANY_CHAR - "'" } "'"

StringChar     ::= ANY_CHAR - ( '"' | "'" | "\\" | "{$" )
BytesChar      ::= ANY_CHAR - ( '"' | "'" | "\\" )
                   (* any byte value that is not a quote delimiter or backslash;
                      hex-byte escapes \xHH are handled via EscapeSeq *)
EscapeSeq      ::= "\\" ( "\\" | "'" | '"' | "n" | "r" | "t" | "0"
                         | "u" HEX4 | "u{" HEX1_6 "}" | "x" HEX2 )
HEX4           ::= HEX_DIGIT HEX_DIGIT HEX_DIGIT HEX_DIGIT
HEX2           ::= HEX_DIGIT HEX_DIGIT
HEX1_6         ::= HEX_DIGIT
               | HEX_DIGIT HEX_DIGIT
               | HEX_DIGIT HEX_DIGIT HEX_DIGIT
               | HEX_DIGIT HEX_DIGIT HEX_DIGIT HEX_DIGIT
               | HEX_DIGIT HEX_DIGIT HEX_DIGIT HEX_DIGIT HEX_DIGIT
               | HEX_DIGIT HEX_DIGIT HEX_DIGIT HEX_DIGIT HEX_DIGIT HEX_DIGIT
               (* exactly 1 to 6 hex digits; values above U+10FFFF are a compile-time error *)

(* Char literal — exactly one Unicode scalar value after escape resolution *)
CharLiteral    ::= "c" ( '"' CharContent '"'
                        | "'" CharContent "'" )
CharContent    ::= EscapeSeq | ANY_CHAR - ( '"' | "'" | "\\" )
                   (* compile-time error if content ≠ exactly 1 scalar value *)

(* Bytes literals *)
BytesLiteral   ::= "b" ( '"' { BytesChar | EscapeSeq } '"'
                        | "'" { BytesChar | EscapeSeq } "'" )

(* Boolean literals *)
BoolLiteral    ::= "true" | "false"

(* Multiline string literals *)
MultilineString ::= TripleDoubleOpen [ MlsDescriptor ] NEWLINE
                    { MlsContentLine }
                    ANCHOR TripleDoubleClose
                  | TripleSingleOpen [ MlsDescriptor ] NEWLINE
                    { MlsContentLine }
                    ANCHOR TripleSingleClose
TripleDoubleOpen  ::= '"""'
TripleDoubleClose ::= '"""'
TripleSingleOpen  ::= "'''"
TripleSingleClose ::= "'''"
MlsDescriptor    ::= "(" DescriptorList ")"
MlsContentLine   ::= ANCHOR { ANY_CHAR } NEWLINE

(* Template fence — variable-length backtick runs, exact-match closing *)
(* N = number of backtick characters in the opener (minimum 3)            *)
(* The closer must contain exactly N backtick characters at ANCHOR        *)
TemplateFence  ::= ANCHOR BACKTICK_N "(" Language ")" [ ":" "(" TmplSpec ")" ] NEWLINE
                   { TmplContentLine }
                   ANCHOR BACKTICK_N NEWLINE

BACKTICK_N     ::= "`" "`" "`" { "`" }
                   (* 3 or more backticks; opener and closer must match exactly *)
TmplSpec       ::= TmplKV { "," TmplKV }
TmplKV         ::= Identifier "=" ( StringLiteral | Identifier | IntLiteral )
Language       ::= Identifier

(* Inline expression (in strings and templates) *)
InlineExpr     ::= ExprOpen [ "-" ] Expr [ "|" FilterChain ] [ "-" ] ExprClose
ExprOpen       ::= "{$"    (* or active alternative *)
ExprClose      ::= "$}"    (* or active alternative *)
FilterChain    ::= FilterCall { "|" FilterCall }
FilterCall     ::= Identifier [ "(" ArgList ")" ]

(* Template directive *)
Directive      ::= StmtOpen TmplStmt StmtClose
StmtOpen       ::= "{%"    (* or active alternative *)
StmtClose      ::= "%}"    (* or active alternative *)
```


### §26.2 Syntactic Grammar — Programs and Modules

```ebnf
Program        ::= [ CompiledDirective ] { TopLevelItem }
CompiledDirective ::= "@compiled" NEWLINE

TopLevelItem   ::= ImportStmt ";"
                 | ReExportStmt ";"
                 | Declaration
                 | SimpleStmt ";"
                 | BlockStmt

Declaration    ::= FuncDecl
                 | AsyncFuncDecl
                 | GenFuncDecl
                 | AsyncGenFuncDecl
                 | ClassDecl
                 | EnumDecl
                 | InterfaceDecl
                 | StructDecl
                 | TypeAliasDecl ";"
                 | AnnotatedDecl
```

### §26.3 Syntactic Grammar — Imports and Exports

```ebnf
ImportStmt     ::= "from" ModulePath "import" "(" ImportList ")" [ "prefer" "compiled" ] ";"
                 | "from" ModulePath "{" GroupedImportList "}"

ReExportStmt   ::= "pub" "from" ModulePath "import" "(" ImportList ")"
                 | "pub" "from" ModulePath "{" GroupedImportList "}"

ModulePath     ::= RelativePath | AbsolutePath
RelativePath   ::= "." [ "." ] [ "|" ".." ] [ "." Identifier { "." Identifier } ]
AbsolutePath   ::= Identifier { "." Identifier }

ImportList     ::= ImportItem { "," ImportItem } [ "," ]
ImportItem     ::= Identifier [ "as" Identifier ]

(* GroupedImportList covers both forms: items with and without "prefer compiled".
   The clause is optional per item, so a single production handles both cases. *)
GroupedImportList  ::= GroupedImportItem { ";" GroupedImportItem } [ ";" ]
GroupedImportItem  ::= Identifier { "." Identifier } "import" "(" ImportList ")"
                       [ "prefer" "compiled" ]
```

### §26.4 Syntactic Grammar — Statements

```ebnf
Stmt           ::= SimpleStmt ";" | BlockStmt

SimpleStmt     ::= VarDecl
                 | ExprStmt
                 | ReturnStmt
                 | ThrowStmt
                 | BreakStmt
                 | ContinueStmt
                 | DeferCall
                 | DelStmt
                 | GlobalDecl
                 | NonlocalDecl
                 | YieldStmt
                 | YieldFromStmt

VarDecl        ::= ( "let" | "var" ) DestructPattern [ ":" Type ] [ "=" Expr ]
ExprStmt       ::= Expr [ AssignOp Expr ]
ReturnStmt     ::= "return" [ Expr ]
ThrowStmt      ::= "throw" Expr [ "from" Expr ]
BreakStmt      ::= "break" [ Identifier ]
ContinueStmt   ::= "continue" [ Identifier ]
DeferCall      ::= "defer" Expr
DelStmt        ::= "del" Expr
GlobalDecl     ::= "global" Identifier
NonlocalDecl   ::= "nonlocal" Identifier
YieldStmt      ::= "yield" Expr
YieldFromStmt  ::= "yield" "*" Expr

AssignOp       ::= "=" | "+=" | "-=" | "*=" | "/=" | "%="
                 | "**=" | "<<=" | ">>=" | "&=" | "|=" | "^="

BlockStmt      ::= IfStmt
                 | WhileStmt
                 | ForStmt
                 | ForInStmt
                 | ForAwaitStmt
                 | DoWhileStmt
                 | TryStmt
                 | WithStmt
                 | DeferBlock
                 | DynamicView
                 | PortalStmt
                 | MatchExpr
                 | AwaitGroupStmt
                 | FuncDecl
                 | AsyncFuncDecl
                 | GenFuncDecl
                 | AsyncGenFuncDecl
                 | ClassDecl
                 | EnumDecl
                 | InterfaceDecl
                 | StructDecl

IfStmt         ::= "if" "(" Expr ")" Block { "else" "if" "(" Expr ")" Block } [ "else" Block ]
WhileStmt      ::= "while" "(" Expr ")" Block
ForStmt        ::= [ Label ":" ] "for" "(" VarDecl ";" Expr ";" Expr ")" Block
ForInStmt      ::= [ Label ":" ] "for" "(" ( "let" | "var" ) DestructPattern "in" Expr ")" Block
ForAwaitStmt   ::= [ Label ":" ] "for" "await" "(" ( "let" | "var" ) DestructPattern "in" Expr ")" Block
DoWhileStmt    ::= [ Label ":" ] "do" Block "while" "(" Expr ")" ";"
TryStmt        ::= "try" Block { CatchClause } [ FinallyClause ]
CatchClause    ::= "catch" "(" TypePattern "as" Identifier ")" Block
TypePattern    ::= Type { "|" Type }
FinallyClause  ::= "finally" Block
WithStmt       ::= "with" "(" WithBindingList ")" Block
WithBindingList ::= WithBinding { "," WithBinding }
WithBinding    ::= Identifier "=" Expr
DeferBlock     ::= "defer" Block
DynamicView    ::= "dynamic" Expr "as" Identifier Block
                   (* Scoped dynamic-field access. See §8.7 for semantics.
                      Expr must implement the Dynamic interface. The Identifier
                      is bound within Block and provides dot-access to dynamic
                      fields: `dobj.foo` desugars to `expr.getField("foo")` and
                      `dobj.foo = v` desugars to `expr.setField("foo", box v)`. *)
PortalStmt     ::= "portal" ( Identifier | StringLiteral ) Block
AwaitGroupStmt ::= "await" "group" Block

Label          ::= Identifier
Block          ::= "{" { Stmt } "}"
```

### §26.5 Syntactic Grammar — Expressions

```ebnf
Expr           ::= TernaryExpr | AssignExpr | SpreadExpr

TernaryExpr    ::= NullCoalExpr "?" Expr ":" Expr
AssignExpr     ::= NullCoalExpr AssignOp Expr

(* Canonical style: "or" and "and" are idiomatic; "||" and "&&" are legal aliases.    *)
(* The formatter rewrites symbol forms to keyword forms. See §3.6 and §27.4.            *)
(* Precedence (low→high): ternary(21) < ??(20) < or(19) < and(18) < equality < ...     *)
NullCoalExpr   ::= LogicalOrExpr { "??" LogicalOrExpr }
LogicalOrExpr  ::= LogicalAndExpr { ( "or" | "||" ) LogicalAndExpr }
LogicalAndExpr ::= CastExpr { ( "and" | "&&" ) CastExpr }
CastExpr       ::= TypeCheckExpr [ ( "as" | "as?" ) Type ]
TypeCheckExpr  ::= EqualityExpr [ ( "is" | "instanceof" ) Type ]
EqualityExpr   ::= CompareExpr { ( "==" | "!=" ) CompareExpr }
CompareExpr    ::= MembershipExpr { ( "<" | ">" | "<=" | ">=" ) MembershipExpr }
MembershipExpr ::= SliceExpr [ ( "in" | "not" "in" ) SliceExpr ]
SliceExpr      ::= BitwiseOrExpr
BitwiseOrExpr  ::= BitwiseXorExpr { "|" BitwiseXorExpr }
BitwiseXorExpr ::= BitwiseAndExpr { "^" BitwiseAndExpr }
BitwiseAndExpr ::= ShiftExpr { "&" ShiftExpr }
ShiftExpr      ::= AdditiveExpr { ( "<<" | ">>" ) AdditiveExpr }
AdditiveExpr   ::= MultiplicativeExpr { ( "+" | "-" ) MultiplicativeExpr }
MultiplicativeExpr ::= ExponentExpr { ( "*" | "/" | "//" | "%" ) ExponentExpr }
ExponentExpr   ::= UnaryExpr [ "**" ExponentExpr ]
UnaryExpr      ::= ( "-" | "not" | "!" | "bnot" | "typeof" ) UnaryExpr
                 | "box" UnaryExpr
                 | PostfixExpr
(* box is contextual: treated as BoxExpr only when followed by a valid expression start. *)
(* as? is the two-token sequence "as" "?"; parser resolves ambiguity with postfix ? by  *)
(* context: as? must be immediately followed by a type expression.                       *)
PostfixExpr    ::= PrimaryExpr { PostfixOp }
PostfixOp      ::= "(" ArgList ")"
                 | "[" Expr "]"
                 | "[" [ Expr ] ":" [ Expr ] [ ":" [ Expr ] ] "]"
                 | "." Identifier
                 | "?." Identifier
                 | "?." Identifier "(" ArgList ")"
                 | "?." "[" Expr "]"
                 | "?." "[" [ Expr ] ":" [ Expr ] [ ":" [ Expr ] ] "]"
                 | "!{" ( Identifier | StringLiteral ) "}"
                 | "?"

PrimaryExpr    ::= Identifier
                 | IntLiteral
                 | FloatLiteral
                 | StringLiteral
                 | BytesLiteral
                 | BoolLiteral
                 | "None"
                 | MultilineString
                 | TemplateFence
                 | ListLiteral
                 | DictLiteral
                 | SetLiteral
                 | TupleLiteral
                 | ListComprehension
                 | DictComprehension
                 | SetComprehension
                 | GeneratorExpr
                 | LambdaExpr
                 | AsyncLambdaExpr
                 | MatchExpr
                 | AwaitExpr
                 | SpawnExpr
                 | "(" Expr ")"
                 | "new" Type "(" ArgList ")"

SpreadExpr     ::= "*" Expr | "**" Expr

(* Collection literals *)
ListLiteral    ::= "[" [ ExprList ] "]"
DictLiteral    ::= "{" [ DictEntryList ] "}"
SetLiteral     ::= "{" Expr "," [ ExprList ] "}"
TupleLiteral   ::= "(" Expr "," [ ExprList ] ")"

ExprList       ::= Expr { "," Expr } [ "," ]
DictEntryList  ::= DictEntry { "," DictEntry } [ "," ]
DictEntry      ::= Expr ":" Expr | "**" Expr

(* Comprehensions *)
ListComprehension ::= "[" Expr ComprehensionClause "]"
DictComprehension ::= "{" Expr ":" Expr ComprehensionClause "}"
SetComprehension  ::= "{" Expr ComprehensionClause "}"
GeneratorExpr     ::= "(" Expr ComprehensionClause ")"
ComprehensionClause ::= "for" "(" DestructPattern "in" Expr ")" { ComprehensionFilter | ComprehensionFor }
ComprehensionFilter ::= "if" "(" Expr ")"
ComprehensionFor    ::= "for" "(" DestructPattern "in" Expr ")"

(* Lambda expressions — CaptureList is only valid in @compiled --target native files *)
LambdaExpr     ::= "func" "(" [ ParamList ] ")" [ CaptureList ] ( "=>" Expr | Block )
               | "async" "func" "(" [ ParamList ] ")" [ CaptureList ] ( "=>" Expr | Block )

CaptureList    ::= "[" CaptureItem { "," CaptureItem } "]"
CaptureItem    ::= ( "weak" | "unowned" ) Identifier
(* @unownedUnchecked is removed. All unowned closure captures trap on dangling access. *)

(* AsyncLambdaExpr is now unified into LambdaExpr above. *)
AsyncLambdaExpr ::= "async" "func" "(" [ ParamList ] ")" [ CaptureList ] ( "=>" Expr | Block )

(* Match expression *)
MatchExpr      ::= "match" Expr "{" { MatchArm } "}"
MatchArm       ::= Pattern [ "if" "(" Expr ")" ] "=>" Expr ","

(* Await and spawn *)
AwaitExpr      ::= "await" Expr
SpawnExpr      ::= "spawn" Expr

(* Function call arguments *)
ArgList        ::= Arg { "," Arg } [ "," ]
Arg            ::= Expr | Identifier "=" Expr | "*" Expr | "**" Expr
```

### §26.6 Syntactic Grammar — Patterns

```ebnf
Pattern        ::= "_"
                 | Identifier
                 | Identifier "(" [ PatternList ] ")"
                 | Identifier "{" [ NamedPatternList ] "}"
                 | "(" PatternList ")"
                 | "[" PatternList "]"
                 | "{" DictPatternList "}"
                 | Type "(" Identifier ")"
                 | Literal

PatternList    ::= Pattern { "," Pattern } [ "," "*" Identifier ]
NamedPatternList ::= NamedPattern { "," NamedPattern }
NamedPattern   ::= Identifier ":" Pattern [ "=" Expr ]
DictPatternList ::= DictPattern { "," DictPattern } [ "," "**" Identifier ]
DictPattern    ::= StringLiteral ":" Identifier [ "=" Expr ]

DestructPattern ::= Identifier
                  | "(" DestructList ")"
                  | "[" DestructList "]"
                  | "{" DictDestructList "}"
DestructList   ::= DestructItem { "," DestructItem } [ "," "*" Identifier ]
DestructItem   ::= Identifier | "_" | DestructPattern
DictDestructList ::= DictDestructItem { "," DictDestructItem } [ "," "**" Identifier ]
DictDestructItem ::= StringLiteral ":" Identifier [ "=" Expr ]

Literal        ::= IntLiteral | FloatLiteral | StringLiteral | BoolLiteral | "None"
```

### §26.7 Syntactic Grammar — Types

```ebnf
Type           ::= UnionType
UnionType      ::= BaseType { "|" BaseType }
BaseType       ::= PrimaryType [ "?" ]
PrimaryType    ::= "int" | "float" | "bool" | "string" | "bytes" | "void"
                 | Identifier [ TypeArgs ]
                 | "fn" "(" [ TypeList ] ")" ":" Type
                 | "async" "fn" "(" [ TypeList ] ")" ":" Type
                 | "list" "[" Type "]"
                 | "dict" "[" Type "," Type "]"
                 | "set" "[" Type "]"
                 | "tuple" "[" TypeList "]"
                 | "(" Type ")"

TypeArgs       ::= "[" TypeList "]"
TypeList       ::= Type { "," Type } [ "," ]
FunctionType   ::= [ "async" ] [ "noescape" ] "fn" "(" [ TypeList ] ")" ":" Type
```

### §26.8 Syntactic Grammar — Declarations

```ebnf
FuncDecl        ::= { Annotation } "func" Identifier [ TypeParams ] "(" [ ParamList ] ")" [ ":" Type ] Block
AsyncFuncDecl   ::= { Annotation } "async" "func" Identifier [ TypeParams ] "(" [ ParamList ] ")" [ ":" Type ] Block
GenFuncDecl     ::= { Annotation } "gen" "func" Identifier [ TypeParams ] "(" [ ParamList ] ")" [ ":" Type ] Block
AsyncGenFuncDecl ::= { Annotation } "async" "gen" "func" Identifier [ TypeParams ] "(" [ ParamList ] ")" [ ":" Type ] Block

ParamList      ::= Param { "," Param } [ "," "*" [ Identifier ":" Type ] ] [ "," ParamList_KW ] [ "," "**" Identifier ":" Type ]
                 | "*" [ "," ParamList_KW ]
ParamList_KW   ::= Param { "," Param }
Param          ::= [ "borrow" ] Identifier ":" Type [ "=" Expr ]

TypeParams     ::= "[" TypeParam { "," TypeParam } "]"
TypeParam      ::= Identifier [ ":" TypeConstraint ]
TypeConstraint ::= Type { "+" Type }

ClassDecl      ::= { Annotation } [ "abstract" ] [ "dynamic" ] "class" Identifier [ TypeParams ]
                   [ ":" Type ] [ "implements" TypeList ] "{" { ClassMember } "}"
ClassMember    ::= FieldDecl ";"
                 | ConstructorDecl
                 | MethodDecl
                 | StaticMethodDecl
                 | StaticFieldDecl ";"
                 | PropertyDecl
                 | TypeAliasDecl ";"

FieldDecl      ::= [ AccessMod ] [ "weak" | "unowned" | "borrow" ] ( "let" | "var" )
                   Identifier ":" Type [ "=" Expr ] ";"
ConstructorDecl ::= "new" "(" [ ParamList ] ")" Block
MethodDecl     ::= { Annotation } [ "pub" ] [ "abstract" ] [ "async" ] [ "gen" ] "func" Identifier [ TypeParams ] "(" [ ParamList ] ")" [ ":" Type ] ( Block | ";" )
StaticMethodDecl ::= { Annotation } [ "pub" ] "static" [ "async" ] "func" Identifier [ TypeParams ] "(" [ ParamList ] ")" [ ":" Type ] Block
StaticFieldDecl ::= [ "pub" ] "static" ( "let" | "var" ) Identifier ":" Type [ "=" Expr ]
PropertyDecl   ::= [ "pub" ] ( "get" Identifier "(" ")" ":" Type Block
                             | "set" Identifier "(" Param ")" Block )

EnumDecl       ::= { Annotation } "enum" Identifier [ TypeParams ] "{" VariantList "}"
VariantList    ::= Variant { "," Variant } [ "," ]
Variant        ::= Identifier
                 | Identifier "(" FieldList ")"
                 | Identifier "{" NamedFieldList "}"
FieldList      ::= Type { "," Type }
NamedFieldList ::= NamedField { "," NamedField }
NamedField     ::= Identifier ":" Type

InterfaceDecl  ::= "interface" Identifier [ TypeParams ] "{" { InterfaceMember } "}"
InterfaceMember ::= [ "pub" ] [ "static" ] [ "async" ] [ "gen" ] "func" Identifier [ TypeParams ] "(" [ ParamList ] ")" [ ":" Type ] ";"
                  | [ "pub" ] ( "get" | "set" ) Identifier "(" [ Param ] ")" [ ":" Type ] ";"

StructDecl     ::= { Annotation } "struct" Identifier [ TypeParams ] [ "implements" TypeList ] "{" { StructMember } "}"
StructMember   ::= StructField ";"
                 | MethodDecl
                 | StaticMethodDecl
StructField    ::= [ "pub" ] [ "var" ] Identifier ":" Type [ "=" Expr ]

TypeAliasDecl  ::= [ "pub" ] "type" Identifier [ TypeParams ] "=" Type

Annotation     ::= "@" Identifier [ "(" ArgList ")" ]
```

### §26.9 Syntactic Grammar — FFI Declarations

```ebnf
ExternJsFunc    ::= "extern" "js" "func" Identifier "(" [ ParamList ] ")" ":" Type ";"
ExternJsVal    ::= "extern" "js" "val" Identifier ":" Type ";"
ExternNative   ::= "extern" "native" StringLiteral "func" Identifier "(" [ ParamList ] ")" ":" Type ";"
```

### §26.10 Syntactic Grammar — Template Directives

```ebnf
TmplStmt       ::= TmplIf | TmplWhile | TmplFor | TmplForIn | TmplForAwait
                 | TmplDoWhile | TmplMatch | TmplTry | TmplCompute
                 | TmplBreak | TmplContinue | TmplEnd | TmplSuspend

TmplIf         ::= "if" "(" Expr ")"
TmplElif       ::= "elif" "(" Expr ")"
TmplElse       ::= "else"
TmplWhile      ::= "while" "(" Expr ")"
TmplFor        ::= [ Label ":" ] "for" "(" VarDecl ";" Expr ";" Expr ")"
TmplForIn      ::= [ Label ":" ] "for" "(" DestructPattern "in" Expr ")"
TmplForAwait   ::= [ Label ":" ] "for" "await" "(" DestructPattern "in" Expr ")"
TmplDoWhile    ::= "do" | "while" "(" Expr ")"
TmplMatch      ::= "match" Expr
TmplTry        ::= "try" | "catch" "(" TypePattern "as" Identifier ")" | "finally"
TmplCompute    ::= ( "let" | "var" ) Identifier "=" Expr ";"
                 | "do" Expr ";"
TmplBreak      ::= "break" [ Identifier ]
TmplContinue   ::= "continue" [ Identifier ]
TmplEnd        ::= "end" [ IntLiteral ]
TmplSuspend    ::= "suspend" [ "fallback" "=" InlineExpr ]

(* Component tags in html fences *)
ComponentTag   ::= "<" UpperIdent { CompAttr } ( "/>" | ">" TmplContent "</" UpperIdent ">" )
CompAttr       ::= LowerIdent "=" ExprOpen Expr ExprClose
                 | LowerIdent
```

### §26.11 Syntactic Grammar — Macro Declarations

```ebnf
MacroDecl      ::= [ "pub" ] "macro" Identifier "(" [ MacroParamList ] ")" "{" MacroBody "}"
MacroParamList ::= Identifier { "," Identifier }
MacroBody      ::= "quote" QuoteBlock
QuoteBlock     ::= "{" { QuoteItem } "}"
QuoteItem      ::= MacroSplice | ANY_LOOM_CONSTRUCT
                   (* ANY_LOOM_CONSTRUCT is any syntactically valid Loom
                      statement, expression, declaration, or type. *)
MacroSplice    ::= "${" Identifier "}"
                   (* Splices the AST node bound to the named macro parameter
                      into the quote body at the point of the splice. *)
MacroInvoke    ::= Identifier "!" "(" [ ArgList ] ")"
```

For any valid Loom source text, parsing it into an AST and then pretty-printing that AST back to source text and parsing again SHALL produce an equivalent AST (round-trip property).

### §26.12 Syntactic Grammar — Additional Productions

#### Cast Operators

```ebnf
CastExpr       ::= PostfixExpr "as" Type
                 | PostfixExpr "as?" Type
```

`as?` is the two-token sequence `"as" "?"`. The parser resolves the ambiguity with the postfix `?` (result propagation) by context: `as?` must be immediately followed by a type expression.

#### Box Operator

```ebnf
BoxExpr        ::= "box" UnaryExpr
```

`box` is contextual: it is only treated as `BoxExpr` when it appears in a position where an expression is expected AND is followed by a valid expression start token. Otherwise it is parsed as an identifier.

*(The UnaryExpr and LambdaExpr productions below are now fully defined in §26.5. §26.12 continues with additional productions not covered in §26.5.)*

#### Field Qualifier Keywords

```ebnf
FieldQualifier ::= "weak"
               | "unowned" "[" "~" Identifier "]"

FieldDecl      ::= [ AccessMod ] [ FieldQualifier ] ( "let" | "var" )
                   Identifier ":" Type [ "=" Expr ] ";"
```

`unowned[~name]` is only valid in `@compiled` files with `--target native`. Bare `unowned` (without a lifetime annotation) on a class field is `E_UNOWNED_NO_LIFETIME`. The class must carry `[lifetime ~name]` as a class-level lifetime parameter.

#### Operator Method Modifier

```ebnf
MethodDecl     ::= [ AccessMod ] [ "static" ] [ "operator" ] "func"
                   OperatorMethodName "(" [ ParamList ] ")" ":" Type FunBody

OperatorMethodName ::= Identifier | OperatorSymbol

OperatorSymbol ::= "+" | "-" | "*" | "/" | "%" | "**"
                 | "&" | "|" | "^" | "bnot" | "<<" | ">>"
                 | "[]" | "[]=" | "contains" | "()"
                 | "==" | "+=" | "-=" | "*=" | "/=" | "%="
                 | "**=" | "<<=" | ">>=" | "&=" | "|=" | "^="
```

*(CaptureList and CaptureItem are now defined in §26.5 as part of the canonical LambdaExpr production. Capture lists are valid only in `@compiled --target native` files; the compiler emits a compile-time error otherwise.)*

#### `ui` Fence Language Descriptor

The `ui` language descriptor extends the existing fence language grammar:

```ebnf
Language       ::= Identifier   (* now includes "ui" as a valid language descriptor *)
```

Component tags in `ui` fences follow the same grammar as in `html` fences:

```ebnf
UiComponentTag ::= "<" UpperIdent { CompAttr } ( "/>" | ">" UiContent "</" UpperIdent ">" )
CompAttr       ::= LowerIdent "=" ExprOpen Expr ExprClose
                 | LowerIdent
```

Lowercase tags are a compile-time error in `ui` fences (all primitives use PascalCase). This contrasts with `html` fences where lowercase tags are emitted as literal HTML.

### §26.13 Syntactic Grammar — Template Fence and HTML Context Productions

#### Variable-length fence backtick runs

```ebnf
(* Amended TemplateFenceOpen and TemplateFenceClose *)
(* The parser tracks N (backtick count of the opener) and requires     *)
(* exactly N backticks on the closing line. Lines with != N backticks   *)
(* inside the fence are literal content.                                *)

TemplateFenceOpen  ::= ANCHOR BACKTICK_N "(" Language ")" [ ":" "(" TmplSpec ")" ] NEWLINE
TemplateFenceClose ::= ANCHOR BACKTICK_EXACT_N NEWLINE

BACKTICK_N         ::= "`" "`" "`" { "`" }   (* 3+ backticks *)
BACKTICK_EXACT_N   ::= (* exactly the same number of backticks as the opener *)
```

The parser is stateful: on encountering a `TemplateFenceOpen`, it records `N` and only produces a `TemplateFenceClose` token when it sees exactly `N` backticks (no more, no fewer) at the anchor position on a line by itself.

#### HTML context tracking (compile-time)

The following new compile-time error categories apply inside `html` fences (§16.6):

```ebnf
HtmlInterpolation  ::= ExprOpen [ "-" ] Expr [ "|" FilterChain ] [ "-" ] ExprClose

(* Inside html fences, the compiler tracks HTML parse context:          *)
(* - text context: between element open/close tags                      *)
(* - attr-value context: inside quoted attribute values                 *)
(* - url-attr context: inside URL-valued attribute values               *)
(* Unquoted attr interpolation is a compile-time error:                 *)
UnquotedAttrInterpolation ::= (* PROHIBITED — compile-time error *)

(* Inside <script> or <style> blocks:                                   *)
ScriptBodyInterpolation ::= (* PROHIBITED — compile-time error *)
StyleBodyInterpolation  ::= (* PROHIBITED — compile-time error *)
```

#### Operator Precedence Reference

| Operator | Precedence | Description | Section |
|---|---|---|---|
| `()` `[]` `.` `?.` `!{}` `?.[` | 1 | Call, index, member access | §5.1 |
| `typeof` | 2 | Type-of operator | §4.7 |
| `-` (unary) `not` `!` `bnot` | 3 | Unary operators | §5.1 |
| `box` | 4 | Boxing/widening | §4.3 |
| `**` | 5 | Exponentiation | §5.1 |
| `*` `/` `//` `%` | 6 | Multiplicative / floor division | §5.1 |
| `+` `-` | 7 | Additive | §5.1 |
| `<<` `>>` | 8 | Bitwise shift | §5.1 |
| `&` | 9 | Bitwise AND | §5.1 |
| `^` | 10 | Bitwise XOR | §5.1 |
| `\|` | 11 | Bitwise OR | §5.1 |
| `[:]` | 12 | Slice | §5.3 |
| `in` `not in` | 13 | Membership | §5.1 |
| `<` `>` `<=` `>=` | 14 | Comparison | §5.1 |
| `==` `!=` | 15 | Equality | §5.1 |
| `is` `instanceof` | 16 | Type check | §4.5, §4.7, §9.5 |
| `as` `as?` | 17 | Cast | §4.3 |
| `and` `&&` | 18 | Logical AND (`and` canonical; `&&` alias) | §3.6 |
| `or` `\|\|` | 19 | Logical OR (`or` canonical; `\|\|` alias) | §3.6 |
| `??` | 20 | Null coalescing | §5.6 |
| `? :` | 21 | Ternary | §5.4 |
| `?` (postfix) | 22 | Result propagation | §5.7 |
| `=` `+=` `-=` etc. | 23 | Assignment | §6.2 |
| `*` `**` (prefix) | 24 | Spread | §5.8 |



---

## §27 Tooling

*(This section is non-normative.)*

### §27.1 Command-Line Interface

**`loom run path/to/file.loom`** — Execute a Loom source file using the JIT compilation pipeline. This is the baseline single-file execution workflow. The script prelude (§20.2) is available in the entry file.

**`loom build`** — Compile a Loom project for deployment:

```
loom build --target browser         # Wasm module for browser
loom build --target cli             # Wasm module for CLI
loom build --target service         # Wasm module for server
loom build --target desktop         # Native desktop app (requires @compiled)
loom build --target native          # Native binary (requires @compiled)
loom build --target native --lib shared   # Shared library
loom build --target native --lib static   # Static library
loom build --debug                  # Include DWARF debug info in output
loom build --release                # Optimised release build
loom build --lto thin               # ThinLTO (LLVM backend only)
loom build --lto full               # Full LTO
loom build --backend cranelift      # Use Cranelift instead of LLVM
loom build --arch aarch64 --os linux   # Cross-compile
loom build --check                      # Type-check and validate fence syntax; no output produced
```

`loom build --check` parses and type-checks the entire project, validates template fence syntax (including `stablehlo`, `hlo`, `wgsl`, `metal`, and `glsl` fences), and reports all compile-time errors without producing any output artefact. Exit code is 0 if the project is error-free, non-zero otherwise. Equivalent to a dry-run of `loom build` without writing to disk.

**`loom export-headers`** — Generate C headers from a compiled Loom module:

```
loom export-headers --target native mymodule.loom -o include/mymodule.h
loom export-headers --target native mymodule.loom -o mymodule.h --lang cpp
```

**`loom import-headers`** — Generate Loom `extern native` bindings from C headers:

```
loom import-headers --lib sqlite3 /usr/include/sqlite3.h -o bindings/sqlite3.loom
loom import-headers --lib ssl --lib crypto /usr/include/openssl/ssl.h -o openssl.loom
loom import-headers --hints openssl.hints /usr/include/openssl/ssl.h -o openssl.loom
```

**`loom add <package>[@version]`** — Resolve and add a dependency to `.lmpkg`, update `loom.lock`, and precompile the newly added package's modules to the Wasm cache (§27.7).

**`loom install`** — Install all dependencies recorded in `loom.lock` and precompile each installed module to the Wasm cache. `loom install` is idempotent: packages with up-to-date cache entries are not recompiled.

```
loom install                    # install + precompile all deps
loom install --no-precompile    # install source only, skip Wasm cache
loom install --offline          # use only local cache; error if any dep is missing
loom install --locked           # CI mode: error if loom.lock would change;
                                #   ignores [dev-overrides] and LOOMPATH
```

When `loom install` processes `[dev-overrides]` entries, it compiles those packages to the **project-local cache** (`.loom/cache/`) rather than the global cache, so that locally-patched artifacts do not overwrite globally-shared entries. Published dependencies from `loom.lock` are written to the global cache as usual.

**`loom test`** — Discover and run test files. Test files match `**/*.test.loom`. Requires the `testing` core package (§13.8).

```
loom test                              # run all tests in the project
loom test path/to/file.test.loom       # run a specific test file
loom test --filter "addition"          # run tests whose name contains the filter string
loom test --watch                      # re-run on file change
```

**`loom publish`** — Publish a package to a registry. Requires prior `loom auth login`. If the project's `.lmpkg` contains a `[dev-overrides]` section with any active entries, `loom publish` emits a warning listing the overridden packages and requires explicit confirmation (`--force`) before proceeding. The `[dev-overrides]` section is stripped from the manifest uploaded to the registry.

**`loom auth login`** — Authenticate with a registry and store credentials in the system keychain.

**`loom fmt`** — Format Loom source files using the reference formatter. Rewrites symbol logical operators to their canonical keyword forms: `&&` → `and`, `||` → `or`, `!` → `not` (see §3.6, §27.4).

**`loom check`** — Type-check without executing.

**`loom link <path>`** — Register a local package directory as a `[dev-overrides]` entry in the current project's `.lmpkg`. Reads the `.lmpkg` at `<path>`, adds an entry mapping its package name to that path, and compiles it to the project-local cache (`.loom/cache/`). Idempotent — running `loom link` on an already-linked path updates the cache if the source has changed.

```
loom link ../loom-http          # links the package at ../loom-http
loom link /home/dev/my-utils    # absolute path also accepted
```

**`loom unlink <package-name>`** — Remove the `[dev-overrides]` entry for `<package-name>` from the current project's `.lmpkg` and delete the corresponding project-local cache entry. The package reverts to the version resolved from `loom.lock`.

```
loom unlink loom.http
loom unlink my-utils
```

**`loom cache clean`** — Remove all entries from the global Wasm cache (`~/.loom/cache/`). Does not affect the project-local cache.

**`loom cache clean --local`** — Remove all entries from the project-local cache (`.loom/cache/`) only. Does not affect the global cache.

**`loom cache clean --prune-orphans`** — Remove only global cache entries for packages no longer in `loom.lock`. Add `--local` to also prune the project-local cache.

**`loom cache info`** — List all cached entries with source hashes, toolchain versions, and sizes. Entries are grouped and labeled by cache tier:

```
Project-local cache (.loom/cache/):
  loom.http  2.1.0-dev  [toolchain 1.3.0]  src_hash: a1b2...  312 KB

Global cache (~/.loom/cache/):
  loom.http  2.0.4  [toolchain 1.3.0]  src_hash: c3d4...  308 KB
  loom.db    1.5.2  [toolchain 1.3.0]  src_hash: e5f6...  204 KB
```

### §27.2 Shebang Support

Unix-style shebang execution is supported:

```
#!/usr/bin/env loom run
let name = env("USER") ?? "world";
print("Hello, {$ name $}!");
```

### §27.3 REPL

The reference toolchain provides a REPL for exploratory scripting. The REPL:

- Supports `await` at the top level.
- Provides the script prelude.
- Sets `__name__` to `"__main__"` and `__file__` to `"<repl>"`.

### §27.4 Formatter

The reference formatter shares the parser and rendering rules used by execution. It formats Loom source files to a canonical style. Key formatting rules include:

**Canonical logical operators.** The formatter rewrites symbol logical operators to keyword forms in all positions — expressions, template fences, and condition clauses:

| Input (non-canonical) | Formatted output (canonical) |
|---|---|
| `a && b` | `a and b` |
| `a \|\| b` | `a or b` |
| `!expr` | `not expr` |
| `!!expr` | `not not expr` |
| `!(a && b)` | `not (a and b)` |

This rewrite is applied unconditionally. Lines annotated with `// loom:allow(symbol-logical-ops)` are exempt from the rewrite but must still parse as valid Loom. The annotation is preserved in the formatted output.

**Indentation.** The formatter uses 2-space indentation by default. The `indent_type` and `indent` descriptors on template fences are preserved.

**Trailing commas.** The formatter adds trailing commas to multi-line collection literals, function argument lists, and parameter lists.

**Semicolons.** The formatter preserves required semicolons and does not add or remove them where optional.

### §27.5 Language Server

*(This section is non-normative.)*

The Loom reference toolchain ships a Language Server Protocol (LSP) 3.17-compatible
language server, `loom-lsp`. It integrates with any LSP-capable editor (VS Code,
Neovim, Emacs, JetBrains IDEs via the LSP plugin).

**Capabilities provided:**

| Capability | Notes |
|---|---|
| `textDocument/completion` | Keyword, type, identifier, and import completions |
| `textDocument/hover` | Type, doc-comment, and inferred-type display |
| `textDocument/definition` | Go-to-definition across files and packages |
| `textDocument/references` | Find all references including `@compiled` files |
| `textDocument/rename` | Safe rename across the project; respects `pub` visibility |
| `textDocument/diagnostics` | Type errors, lint advisories, and `E_*` error codes |
| `textDocument/formatting` | Invokes the reference formatter (§27.4) |
| `textDocument/inlayHint` | Inferred types on `let`/`var` bindings; lifetime labels |
| `textDocument/codeAction` | Quick-fixes for lint advisories (e.g. `symbol-logical-ops`) |
| `textDocument/semanticTokens` | Full semantic token classification |
| `workspace/symbol` | Project-wide symbol search |
| `loom/portals` | Non-standard: lists active portal names for the current module |

**Startup.** Start the server with:

```
loom lsp              # stdio transport (default, for most editors)
loom lsp --tcp 7777   # TCP transport
```

**Workspace detection.** The language server searches upward from the opened file
for a `.lmpkg` manifest to determine the project root and dependency graph.
Multi-root workspaces are supported.

**Template fence support.** Inside template fences, completions and hover are
provided for Loom interpolation expressions (`{$ ... $}`). The fence body
(HTML, CSS, SQL, etc.) is forwarded to an embedded sub-server for that
language when available.

### §27.6 Browser Bootstrap and Performance

*(This section is non-normative.)*

A Loom browser application compiled with `loom build --target browser` produces the following output structure:

```
dist/
  index.html          # Minimal HTML shell (generated or user-provided)
  loom-rt.js          # Loom runtime bootstrap (~30 KB gzipped, versioned filename)
  app.wasm            # Compiled application module
  app.wasm.br         # Brotli-compressed variant (served when client supports it)
  app.wasm.gz         # Gzip-compressed variant
  app.wasm.map        # External source map (emitted only with --debug)
  assets/             # Static assets copied from src/assets/
```

**Minimal generated HTML shell:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Loom App</title>
  <!-- Preload hints: fetch Wasm before loom-rt.js has executed -->
  <link rel="preload" href="/app.wasm" as="fetch" type="application/wasm" crossorigin>
  <link rel="modulepreload" href="/loom-rt.1.0.0.js">
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/loom-rt.1.0.0.js"></script>
</body>
</html>
```

**Bootstrap sequence.** `loom-rt.js` executes the following steps on page load:

1. **Streaming instantiation.** Fetches `app.wasm` using `WebAssembly.instantiateStreaming()` so browser compilation begins as bytes arrive — download and compilation overlap. Falls back to `WebAssembly.instantiate()` when streaming is unavailable.
2. **Module initialization.** Runs the Wasm module's start function, executing top-level declarations.
3. **Event wiring.** Scans the DOM for `data-loom-ev` attributes and registers Wasm event handlers via `addEventListener`.
4. **Hydration (SSR only).** If `<script id="__loom_state__" type="application/json">` is present, reads the serialized state and initializes signals before mounting. Verifies `data-integrity` hash if present (§19.7).
5. **Mount.** Calls the application's entry point (`mount(App(), "#root")`).
6. **Web Component registration.** Before step 5, `loom-rt.js` calls `customElements.define(name, cls)` for each class annotated with `@webcomponent` in the loaded Wasm module. Registration follows source declaration order within each module and dependency module order across modules. This step occurs after Wasm instantiation (step 1) but before event wiring (step 3) and mount (step 5) to ensure custom elements are defined before any component tree that references them is rendered. The revised bootstrap order is therefore: **instantiate → initialize → register custom elements → wire events → hydrate → mount**.

**MIME type requirement.** Wasm modules must be served with `Content-Type: application/wasm` for streaming instantiation to succeed. `loom serve` sets this automatically. Production servers must be configured explicitly — many default configurations serve `.wasm` as `application/octet-stream`, which disables streaming and roughly doubles initialization time.

**Minimizing bootstrap latency.** The dominant factors affecting time-to-interactive, in decreasing order of impact:

1. **Wasm module size.** Use `loom build --target browser --release` for an optimized, stripped module. The `--release` flag enables dead-code elimination and Wasm-level optimization. A typical small-to-medium Loom application produces a 100–400 KB gzipped Wasm module. `loom-rt.js` is approximately 30 KB gzipped and is versioned for long-term caching.

2. **Brotli compression.** Deploy with Brotli when the server and client support it (all major browsers do). `loom build` produces pre-compressed `app.wasm.br` and `app.wasm.gz` files. Serve the `.br` variant with `Content-Encoding: br` when `Accept-Encoding` includes `br`. Brotli typically reduces size by 15–25% versus gzip.

3. **Preload hints.** The generated HTML shell includes `<link rel="preload">` for the Wasm module, instructing the browser to fetch it immediately on HTML parse — before `loom-rt.js` has executed — eliminating one network round-trip from the critical path.

4. **Runtime caching.** `loom-rt.js` uses a versioned filename (e.g., `loom-rt.1.0.0.js`) served with `Cache-Control: max-age=31536000, immutable`. Application Wasm filenames are content-hashed. Returning users skip both downloads entirely.

5. **SSR + hydration.** For content-heavy or SEO-sensitive applications, use the SSR path (`ui.web.renderToString`, §19.7). The browser receives meaningful HTML immediately; the Wasm bundle loads in the background and hydrates the rendered tree without a visible layout shift.

6. **Streaming Wasm compilation.** Modern browsers compile Wasm in a background thread while bytes are still downloading, provided the MIME type is correct. This is automatic when the MIME type is set correctly — no developer action required.

**`loom serve` (development server).** The development server:

- Serves `dist/` with correct MIME types including `application/wasm`.
- Serves `*.wasm.map` files with `Content-Type: application/json` and `Access-Control-Allow-Origin: *` so Chrome DevTools can fetch source maps from any local port.
- Watches source files and triggers incremental `loom build` on change.
- Sends a reload signal to connected browsers via a lightweight WebSocket after each successful rebuild.
- Sets `Cache-Control: no-cache` on all responses so rebuilt artifacts are always fresh.
- When started with `--inspect`, injects a debug bootstrap `<script>` into the served `index.html` that calls `debug.browser.start()` before the application entry point. See §27.6.2.

**CSP configuration.** The minimum required Content Security Policy is:

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'wasm-unsafe-eval';
  connect-src 'self';
```

No `'unsafe-inline'` or `'unsafe-eval'` is required. `'wasm-unsafe-eval'` permits Wasm evaluation but not `eval()` or `new Function()`.

### §27.6.1 Source Map Delivery

*(This section cross-references §2.1, which defines normative source map rules.)*

The following conventions apply to source map serving in both development and production contexts:

**File naming.** The source map for `app.wasm` is named `app.wasm.map`. The `//# sourceMappingURL=app.wasm.map` comment appended to the Wasm binary uses a relative URL. Absolute URLs are permitted when the map is served from a CDN separate from the Wasm file.

**MIME type.** Source map files must be served as `Content-Type: application/json`. Serving as `text/plain` or `application/octet-stream` causes Chrome DevTools to silently ignore the map.

**CORS.** Chrome DevTools fetches source maps from its own internal origin. The server must include `Access-Control-Allow-Origin: *` (or the specific DevTools origin) on source map responses. `loom serve` sets this automatically. Production servers must be configured explicitly.

**Inline maps.** `loom serve --inline-source-maps` appends a base64-encoded data URL as the `sourceMappingURL` instead of a separate file. Useful for single-origin development setups where CORS is not desired. Not recommended for production debug builds because inline maps significantly increase Wasm binary size.

**`x-loom-portals` extension field.** When `--debug` is specified, the source map includes a top-level `x-loom-portals` extension field: a JSON object mapping portal name strings to their Wasm byte offsets. Example:

```json
{
  "version": 3,
  "sources": ["src/app.loom"],
  "x-loom-portals": {
    "handlePayment": 4096,
    "onUserLogin": 8192
  }
}
```

The Loom DevTools Extension reads this field to place CDP breakpoints at portal entry points by name.

### §27.6.2 Debug Server Bootstrap (`--inspect`)

`loom serve --inspect` and `loom build --debug --inspect` activate the browser debug bridge:

**`loom serve --inspect`.** The development server injects the following script block immediately before the closing `</body>` tag of the served `index.html`:

```html
<script type="module">
  import { startDebug } from "/loom-rt.1.0.0.js";
  startDebug({ captureLocals: true, maxFrames: 10000 });
</script>
```

`startDebug` is an export of `loom-rt.js` that calls `debug.browser.start()` with the provided config. This wires the `postMessage` bridge before the application entry point runs, ensuring all portal registrations are visible to the Loom DevTools Extension.

**`loom build --debug --inspect`.** Embeds the `startDebug` call directly in the generated `index.html` shell. This is intended for staging environments where the Loom DevTools Extension should be connectable without running the development server.

**CSP note.** `--inspect` does not require `'unsafe-inline'`. The injected bootstrap is a `<script type="module" src="...">` external reference, not an inline script.

**Production note.** `--inspect` should not be used in production builds. The portal registry and trace event stream expose internal application structure. `loom build --release` without `--inspect` strips all `debug.browser` calls to no-ops.

### §27.7 Module Wasm Cache

*(This section is non-normative.)*

The **module Wasm cache** stores compiled Wasm artifacts for installed package modules, eliminating JIT compilation overhead on subsequent `loom run` invocations. The cache is managed automatically by `loom install` and `loom add`.

**Two-tier cache architecture.** The Wasm cache operates as two independent tiers looked up in order:

| Tier | Location | Written by | Cleared by |
|------|----------|-----------|------------|
| Project-local | `.loom/cache/` (relative to project root) | `loom link`, `loom install` for `[dev-overrides]` packages | `loom cache clean --local` |
| Global | `~/.loom/cache/` (or `$LOOM_CACHE_DIR`) | `loom install` for registry packages | `loom cache clean` |

On every cache lookup, the project-local tier is checked first. If a valid entry exists there, it is used and the global tier is not consulted. Otherwise, the global tier is checked.

**Cache location and layout:**

```
# Project-local cache
.loom/cache/
  loom.http/
    2.1.0-dev/
      1.3.0/                     # loom toolchain version
        net_http.wasm            # compiled module artifact
        net_http.hash            # SHA-256 of the source used to compile
        net_http.lmpkg.sig       # absent for dev-override packages

# Global cache
~/.loom/cache/
  loom.http/
    2.0.4/
      1.3.0/
        net_http.wasm
        net_http.hash
        net_http.lmpkg.sig       # signature sidecar (§13.5)
```

**Cache key.** A cache entry is valid if and only if:

1. The package name and version match.
2. The Loom toolchain version matches (ABI-breaking toolchain changes invalidate all entries).
3. The SHA-256 hash of the module's source files matches the `.hash` sidecar.

`loom run` checks all three conditions before deciding whether to JIT-compile or instantiate from cache. The check requires a single file read (the `.hash` sidecar) and is fast.

**Cache population.** `loom install` compiles each installed module's source to Wasm using the same optimizer settings as `loom build --target cli --release`, stores the result in the appropriate cache tier, and writes the source hash sidecar:

- **Registry packages** (resolved from `loom.lock`) → written to the global cache.
- **Dev-override packages** (from `[dev-overrides]` or `loom link`) → written to the project-local cache.

Precompilation runs in parallel across modules using all available CPU cores. On a modern machine with a warm build cache, `loom install` for a medium-sized project (20–50 packages) typically completes in under 10 seconds.

**`LOOMPATH` packages bypass the cache entirely** and always use the JIT pipeline. They are assumed to change frequently and cache invalidation on every save would exceed the benefit. See §13.9.

**Cache invalidation.** A cache entry is invalidated when:

- The module's source changes (hash mismatch).
- The Loom toolchain is upgraded (toolchain version component of the cache path changes).
- `loom cache clean` (global) or `loom cache clean --local` (project-local) is run explicitly.

Cache entries for removed packages are not automatically cleaned — use `loom cache clean --prune-orphans` to remove entries for packages no longer in `loom.lock`.

**Interaction with `prefer compiled`.** The fallback resolution algorithm (§13.7) checks both cache tiers (project-local first, then global) as part of its compiled-artefact search, before searching the source directory. A cache hit at either tier satisfies `prefer compiled`.

**User-authored modules.** The Wasm cache covers installed packages only. User-authored modules in the project's `src/` tree use the JIT pipeline with incremental re-compilation (§2.1). Persistent caching of user modules is left to a future incremental compilation cache feature (§29).

**.gitignore recommendation.** The following entries are recommended for projects using version control:

```
.loom/cache/
```

The global cache (`~/.loom/cache/`) is never committed — it lives outside the project tree. The project-local cache contains compiled artifacts that are fully reproducible from source and should not be committed.


### §27.8 Project-Local Cache and Development Isolation

*(This section is non-normative.)*

This section explains the design rationale for the two-tier cache and development isolation workflow.

**The problem.** The global Wasm cache (`~/.loom/cache/`) is shared across all projects on the machine. Its cache key is content-addressed: identical source + toolchain version always produces an identical entry. This means multiple projects can share cached artifacts for common dependencies with no duplication penalty.

The problem arises during **package development**: when a developer is actively modifying `loom.http` (for example) and that package has the same `name` and `version` as an entry already in the global cache, writing a newly-compiled artifact to the global cache would corrupt the entry that every other project on the machine depends on. A colleague's unrelated project that imports `loom.http@2.1.0` would silently pick up a partially-working development build.

**The solution.** Rather than replicating Python's full virtual environment model (which duplicates the entire stdlib and toolchain per project), Loom scopes isolation to the minimum needed:

- `[dev-overrides]` packages write to `.loom/cache/` (project-local) only.
- `LOOMPATH` packages bypass the cache entirely and use JIT.
- All other packages continue to use the global cache.

The project-local cache uses the same content-addressed key structure as the global cache, so the toolchain can find and validate entries using the same code path.

**Workflow summary:**

| How package is provided | Cache written | Cache read priority | Signature verified |
|------------------------|---------------|--------------------|--------------------|
| `loom.lock` (registry) | Global | Project-local, then global | Yes |
| `[dev-overrides]` / `loom link` | Project-local | Project-local only | No (local source) |
| `LOOMPATH` | None (JIT) | Not cached | No (local source) |

**Starting a development session:**

```sh
# Working on loom.http locally
git clone https://github.com/loom-lang/loom-http ../loom-http
cd my-project
loom link ../loom-http     # adds to [dev-overrides], compiles to .loom/cache/

loom run src/main.loom     # picks up local loom.http from .loom/cache/

# When done:
loom unlink loom.http      # reverts to registry version from loom.lock
```

**CI/CD.** In CI, always use `loom install --locked`. This ignores `[dev-overrides]`, `LOOMPATH`, and any local state, ensuring a fully reproducible build from `loom.lock` only.




The reference toolchain provides language-server diagnostics (LSP) for IDE integration, including:

- Real-time type checking and error reporting
- Autocompletion
- Go-to-definition
- Hover information
- Rename refactoring


### §27.9 Hardware Management Commands

*(Full specification moved to the [Loom Packages Reference](loom-packages-reference-v1_10.md).)*

Hardware management commands (`loom hardware detect`, `loom hardware compile`,
`loom hardware list`) are available when hardware backend packages are
installed.  See the Packages Reference §27.9 for the complete CLI reference.

## §28 Progressive Disclosure

*(This section is non-normative.)*

Loom is a single language and semantic model. There are no separate beginner and advanced dialects. However, the language is designed for progressive adoption with a three-tier learning path:

### Tier 1: Core Scripting

- Variable declarations (`let`, `var`)
- Functions (`func`)
- Control flow (`if`/`else`, `while`, `for`, `for-in`)
- Collections (`list`, `dict`, `set`, `tuple`)
- Imports (`from ... import`)
- Script prelude (`readText`, `writeText`, `exec`, `env`, `args`)
- Interpolated strings (`"Hello, {$ name $}"`)
- `core.text` (including `char`, `byteLength`, `graphemes`, `normalize`), `data.json`, `core.collections`

### Tier 2: Intermediate

- Enums and `match`
- `Result[T,E]` and `?` propagation
- `Option[T]` / `T?` / `?.` / `??`
- `async`/`await`
- Template fences
- `core.time`
- Explicit `portal` blocks
- Structs
- Union types

### Tier 3: Advanced

- Structured concurrency (`await group`, `TaskGroup`, `for await`)
- `ui` components and `ComponentRegistry`
- FFI (`extern js`, `extern native`, `@jsexport`)
- Reflection (`core.reflect`)
- Dynamic objects (`dynamic class`, `!{}`)
- Generators and `yield`
- Decorators
- `@compiled` mode and native compilation
- Lifetime parameters (`lifetime ~name`, `borrow[~name]`) and region inference
- Macros
- Actors and supervision
- Direct capability objects (`runtime.fs`, `runtime.proc`, `runtime.net`)
- `debug` and time-travel debugging

### Guidance

- Compiler diagnostics explicitly explain when a user crosses into advanced concepts.
- Generated project templates prefer task-focused entry points: `script`, `cli`, `generator`, `service`, `webapp`.
- Beginner-facing materials teach interpolated strings before template fences, `Option[T]` before `Result[T,E]`, and sync examples before async.

---

## §29 Future Directions

*(This section is non-normative.)*

The following features are under consideration for future versions of the Loom specification:

- **Incremental compilation cache.** Fine-grained caching of compilation artifacts for faster rebuilds.
- **`loom lsp` improvements.** ARC cycle detection code actions, operator interface scaffolding, HTML context escaping hints.
- **`ui.desktop` rendering backend reference implementations.** The `ui.desktop` API contract is specified; Skia, WebGPU, and platform-native widget backends are reference implementations under active development.
- **WASI target.** `loom build --target wasi` for non-browser Wasm hosts.
- **`Url` type extensions.** `Url.parse`, relative URL resolution, query parameter construction.
- **`SafeHtml` builder API.** Fluent programmatic HTML construction without template fences.
- **Effect system.** Tracking side effects in the type system for purity guarantees.
- **Dependent types.** Limited dependent typing for array lengths and numeric constraints.
- **Module-level `async`.** Allowing `await` during module initialization with explicit opt-in.
- **Pattern matching extensions.** Active patterns, view patterns, and pattern synonyms.
- **Hot module replacement.** Replacing modules at runtime without restarting the application.
- **XLA kernel cache.** Persistent caching of compiled XLA/StableHLO executables across process restarts, keyed on program hash and device topology.
- **SIMD on Wasm.** `native.simd` mapped to the WebAssembly SIMD proposal for browser and Wasm targets.
- **Extended numeric math.** `core.math` module extended with additional transcendental functions for `float32` variants and SIMD vectors (see §21.18).
- **Algebraic effects.** First-class effect handlers as an alternative to exceptions and async.

- **Async work-stealing tuning.** Adaptive work-stealing strategies and executor affinity hints for NUMA-aware scheduling.
- **User-module incremental compilation cache.** Persistent caching of compiled Wasm artifacts for user-authored modules (not just installed packages) across `loom run` invocations.
- **`net.ws` browser target.** Native `net.ws` client support on the `browser` target (currently uses `lang.interop.js` bridge).
- **`ThreadLocal[T]` on Wasm.** Emulated thread-local storage for multi-threaded Wasm (threads proposal) when available.
- **`loom.db` driver ecosystem.** Reference driver implementations for PostgreSQL, SQLite, and MySQL under the `loom.db.*` namespace.
- **`loom.ai` ecosystem.** Expand provider sub-packages and add `loom.ai.embeddings`, `loom.ai.vision`, and structured agent-loop primitives built on the actor model (§17.6) and portal debug infrastructure (§6.7).
- **TPU `ptx`-equivalent fence.** A `triton` or `mosaic` fence descriptor for authoring TPU kernels in a higher-level IR without writing raw StableHLO.
- **`native.hal` NUMA-aware scheduling.** Affinity hints for multi-socket CPU + multi-GPU + multi-TPU systems.
- **`loom.backend.rocm`.** AMD ROCm/HIP backend for AMD GPU ML workloads (alternative to Vulkan for compute-heavy tasks).
- **Int4 / FP8 dtypes.** `DType.Int4`, `DType.Float8E4M3`, `DType.Float8E5M2` for next-generation quantised inference on NVIDIA Hopper, AMD CDNA3, and TPU v5+.
- **Distributed tensor ops.** `loom.tensor.distributed` — multi-device tensor sharding, all-reduce, and pipeline parallelism primitives.
- **`loom.backend.tpu.pjrt` auto-discovery.** Automatic detection of third-party PJRT plugins from standard install paths without requiring `PJRT_PLUGIN_PATH`.


---

## §30 Hardware Backend Lifecycle

*(Non-normative. Full specification moved to the [Loom Packages Reference](loom-packages-reference-v1_10.md).)*

The hardware backend lifecycle (detection, compilation, registration, staleness
policy) is described in the Packages Reference §30.

## Appendix A: Keyword Index

**Keywords** — These identifiers SHALL NOT be used as variable, function, type, or module names:

| Keyword | Section | Description |
|---|---|---|
| `abstract` | §8.3 | Abstract class/method declaration |
| `and` | §3.6 | Logical AND operator |
| `as` | §13.1 | Import alias, catch binding, dynamic view |
| `async` | §7.1 | Async function declaration |
| `await` | §17.1 | Suspend until task completes |
| `break` | §6.4 | Exit loop |
| `catch` | §6.9 | Exception handler |
| `class` | §8.1 | Class declaration |
| `continue` | §6.4 | Skip to next loop iteration |
| `defer` | §6.5 | Register cleanup action |
| `del` | §6.11 | Deterministic finalization |
| `do` | §6.4 | Do-while loop |
| `dynamic` | §8.7 | Dynamic class declaration, dynamic view |
| `else` | §6.3 | Alternative branch |
| `enum` | §9.1 | Enum declaration |
| `extern` | §18 | FFI declaration |
| `false` | §3.5 | Boolean literal |
| `finally` | §6.9 | Unconditional cleanup block |
| `fn` | §4.4 | Function type |
| `for` | §6.4 | Loop |
| `from` | §13.1 | Import source, exception chaining |
| `func` | §7.1 | Function declaration |
| `gen` | §7.5 | Generator function |
| `get` | §7.7 | Property getter |
| `global` | §7.3 | Module-scope variable mutation |
| `if` | §6.3 | Conditional |
| `implements` | §11.1 | Interface implementation |
| `import` | §13.1 | Import declaration |
| `in` | §6.4, §3.6 | For-in loop, membership test |
| `instanceof` | §4.7 | Type check operator |
| `interface` | §11.1 | Interface declaration |
| `is` | §4.5, §9.5 | Type narrowing check |
| `let` | §6.2 | Immutable binding |
| `lifetime` | §7.1, §10.11, §11.4, §12.1, §23.4.2 | Lifetime region parameter declaration |
| `match` | §9.4 | Pattern matching |
| `new` | §8.4 | Constructor |
| `nonlocal` | §7.3 | Enclosing-scope variable mutation |
| `none` | §9.3 | None value |
| `not` | §3.6 | Logical NOT |
| `or` | §3.6 | Logical OR |
| `portal` | §6.7 | Debug activation point |
| `prefer` | §13.1 | Import keyword for `prefer compiled` clause |
| `pub` | §8.2 | Public visibility |
| `return` | §7.1 | Return from function |
| `set` | §7.7 | Property setter |
| `spawn` | §17.2 | Spawn task in await group |
| `static` | §8.5 | Static member |
| `struct` | §10 | Struct declaration |
| `suspend` | §19.5 | Async component loading |
| `throw` | §6.10 | Throw exception |
| `true` | §3.5 | Boolean literal |
| `try` | §6.9 | Exception handling |
| `type` | §4.6 | Type alias |
| `typeof` | §4.7 | Type-of operator |
| `var` | §6.2 | Mutable binding |
| `while` | §6.4 | While loop |
| `with` | §6.6 | Scoped resource management |
| `yield` | §7.5 | Generator yield |
| `borrow` | §7.1, §23.4.1, §23.4.2 | Parameter modifier / field qualifier / lifetime-tracked reference |
| `bnot` | §3.6, §5.1 | Bitwise NOT operator |
| `noescape` | §4.4, §23.4.1 | Function type modifier |

**Reserved words** — Reserved for future use; SHALL NOT be used as user identifiers:

| Reserved Word | Section | Description |
|---|---|---|
| `final` | §3.3 | Reserved for future use |
| `macro` | §3.3, §24 | Reserved; used in macro declarations |
| `module` | §3.3 | Reserved for future use |
| `override` | §3.3 | Reserved for future use |
| `package` | §3.3 | Reserved for future use |
| `sealed` | §3.3 | Reserved for future use |
| `self` | §3.3 | Reserved for future use |
| `Self` | §3.3 | Reserved; used as self-type in interfaces |
| `super` | §3.3 | Reserved for future use |
| `trait` | §3.3 | Reserved for future use |
| `volatile` | §3.3 | Reserved for future use |
| `where` | §3.3 | Reserved for future use |

**Contextual keywords** — Special meaning only in specific syntactic positions; may be used as ordinary identifiers elsewhere:

| Contextual Keyword | Section | Description |
|---|---|---|
| `group` | §17.2 | Contextual in `await group { ... }` |
| `once` | §20.3 | Contextual in debug activation requests |

**Lifetime labels** — Reserved sigil for compile-time region identifiers (`--target native` only):

| Identifier | Section | Description |
|---|---|---|
| `~static` | §7.1, §23.4.2 | Reserved forever-lifetime label; satisfies any `borrow[~name]` by covariance |
| `~name` (user-defined) | §7.1, §10.11, §23.4.2 | Lowercase identifier prefixed with `~`; declared via `lifetime ~name`; erased at compile time |

**Dunder identifiers** — Reserved for language-defined module introspection:

| Identifier | Section | Description |
|---|---|---|
| `__name__` | §2.2 | Module name (`"__main__"` for entry script) |
| `__file__` | §2.2 | Absolute file path of the module |
| `__execmode__` | §2.2 | `"interpreted"` or `"compiled"` |
| `__module__` | §2.3 | Declaration-level dunder on named types and functions |

---

## Appendix B: Operator Index

| Operator | Precedence | Associativity | Description | Section |
|---|---|---|---|---|
| `()` `[]` `.` `?.` `!{}` `?.[` | 1 | Left | Call, index, member access, safe nav, dynamic access, null-safe index | §5.1 |
| `typeof` | 2 | Prefix | Type-of operator | §4.7 |
| `-` (unary) `not` `!` `bnot` | 3 | Prefix | Unary negation, logical not, bitwise not | §5.1 |
| `box` | 4 | Prefix | Boxing/widening operator | §4.3 |
| `**` | 5 | Right | Exponentiation | §5.1 |
| `*` `/` `//` `%` | 6 | Left | Multiplication, division, floor division, modulo | §5.1 |
| `+` `-` | 7 | Left | Addition, subtraction, string concatenation | §5.1 |
| `<<` `>>` | 8 | Left | Bitwise shift | §5.1 |
| `&` | 9 | Left | Bitwise AND | §5.1 |
| `^` | 10 | Left | Bitwise XOR | §5.1 |
| `\|` | 11 | Left | Bitwise OR | §5.1 |
| `[:]` | 12 | N/A | Slice | §5.3 |
| `in` `not in` | 13 | Left | Membership | §5.1 |
| `<` `>` `<=` `>=` | 14 | Left | Comparison | §5.1 |
| `==` `!=` | 15 | Left | Equality | §5.1 |
| `is` `instanceof` | 16 | Left | Type check | §4.5, §4.7, §9.5 |
| `as` `as?` | 17 | Left | Cast operators (narrowing) | §4.3 |
| `and` `&&` | 18 | Left | Logical AND (short-circuit) | §3.6 |
| `or` `\|\|` | 19 | Left | Logical OR (short-circuit) | §3.6 |
| `??` | 20 | Left | Null coalescing | §5.6 |
| `? :` | 21 | Right | Ternary conditional | §5.4 |
| `?` (postfix) | 22 | Postfix | Result propagation | §5.7 |
| `=` `+=` `-=` `*=` `/=` `%=` `**=` `<<=` `>>=` `&=` `\|=` `^=` | 23 | Right | Assignment | §6.2 |
| `*` `**` (prefix, spread) | 24 | Prefix | Spread | §5.8 |

---

## Appendix C: Built-in Type Index

This appendix lists built-in language types only.  Standard library types are indexed in the [Loom Standard Library Reference](loom-stdlib-reference-v1_10.md) Appendix C.  Package types are indexed in the [Loom Packages Reference](loom-packages-reference-v1_10.md) Appendix C.


### Primitive Types

| Type | Description | Section |
|---|---|---|
| `int` | 64-bit signed integer (alias for `int64`) | §4.1 |
| `int8` | 8-bit signed integer | §4.1 |
| `int16` | 16-bit signed integer | §4.1 |
| `int32` | 32-bit signed integer | §4.1 |
| `int64` | 64-bit signed integer | §4.1 |
| `uint8` | 8-bit unsigned integer | §4.1 |
| `uint16` | 16-bit unsigned integer | §4.1 |
| `uint32` | 32-bit unsigned integer | §4.1 |
| `uint64` | 64-bit unsigned integer | §4.1 |
| `bigint` | Arbitrary-precision signed integer | §4.1.3 |
| `float` | IEEE 754 double-precision (alias for `float64`) | §4.1 |
| `float32` | IEEE 754 single-precision | §4.1 |
| `float64` | IEEE 754 double-precision | §4.1 |
| `decimal` | Arbitrary-precision decimal | §4.1.4 |
| `bool` | Boolean (`true`/`false`) | §4.1 |
| `char` | Single Unicode scalar value | §4.1.5 |
| `string` | UTF-8 sequence of Unicode scalar values | §4.1 |
| `bytes` | Arbitrary byte sequence | §4.1 |
| `list[T]` | Ordered sequence | §4.1 |
| `dict[K, V]` | Ordered map | §4.1 |
| `set[T]` | Unordered unique collection | §4.1 |
| `tuple[...]` | Fixed-size heterogeneous sequence | §4.9 |
| `void` | No return value | §4.4 |

### Box Types (ABI-internal)

Box types are ABI-internal. User code should not reference them directly. See §4.2.

| Type | Boxes | Section |
|---|---|---|
| `Int` | `int` | §4.2 |
| `Char` | `char` | §4.2 |
| `Float` | `float` | §4.2 |
| `Bool` | `bool` | §4.2 |
| `String` | `string` | §4.2 |
| `Bytes` | `bytes` | §4.2 |

### Built-in Enums

| Type | Variants | Section |
|---|---|---|
| `Option[T]` | `Some(T)`, `None` | §9.3 |
| `Result[T, E]` | `Ok(T)`, `Err(E)` | §9.3 |

