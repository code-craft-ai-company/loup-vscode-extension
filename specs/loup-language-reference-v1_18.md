# Loup Language Reference v1.18

**Status:** Release
**Version:** 1.18.0
**Date:** 2026-04-20
**Supersedes:** 1.17.0
**Scope:** Core language — syntax, semantics, type system, concurrency (including
  shared-memory concurrency), FFI, template fences, reactive UI, compiled mode,
  native compilation, freestanding mode, macros, failure policy, formal grammar,
  and tooling.

**Changes from v1.17:**

- **Unified memory model (§8.1.1).** A class may be declared `local class` (the
  default — thread-local ARC) or `shared class` (atomic ARC in a shared arena,
  cross-thread and cross-mode capable). The bare `class` keyword is a shorthand
  for `local class`. The ARC contract is uniform across all execution modes;
  scripted and web runtimes are permitted to back `local class` with Wasm GC
  as an implementation optimization provided the ARC-equivalent contract holds.
- **Shared-memory concurrency (§17b).** New chapter specifying the `Shareable`
  trait, `SharedBuffer[T]` / `SharedArray[T]`, the `core.atomic` namespace,
  `SharedRef[T]`, the cross-mode `shared class` ABI, shared-arena allocation,
  and shared synchronization primitives (`SharedMutex`, `SharedRwLock`,
  `SharedQueue`, `SharedBarrier`, `SharedSemaphore`).
- **`ScriptWorker` extensions (§17.10.2).** `ScriptWorker.share(arena)` passes
  a shared-arena handle to a worker; `SharedRef[T]` values may cross the worker
  boundary without serialization.
- **Cross-mode ABI (§17b.7).** `shared class` declarations have a normatively
  specified layout and vtable contract that both the JIT (Wasm GC+EH) and AOT
  (native) pipelines honor bit-for-bit, enabling zero-copy interop between
  `host.scripted` and `host.native` code operating on the same shared arena.
- **ARC features generalized.** `weak` references and retain/release elision
  via `borrow` on `local class` and `shared class` instances are now available
  in **all** modes with an ARC memory model (`web.scripted`, `web.compiled`,
  `host.scripted`, `host.dual`, `host.native`); previously restricted to
  `host.dual` and `host.native`. `@mode(freestanding)` remains an exception
  (`E_FREESTANDING_WEAK`). The §8 `weak` field qualifier specification has
  been updated to reflect this generalization. The `arc let` / `arc var`
  keywords remain advisory-only pinning hints and retain their prior
  availability.
- **Serialization foundation (§32).** Normative contracts for trait-based
  value serialization, laying the groundwork for future RPC libraries,
  wire-format packages, and persistence layers. Introduces the `Serializable`
  and `Deserializable` traits, the format-agnostic `Value` intermediate
  representation, type-identity URIs, polymorphic dispatch rules,
  field-level annotations (`@serialField`, `@sensitive`, `@alias`,
  `@skipIfDefault`, `@polymorphic`, `@tagged`), type-evolution compatibility
  rules, a normative Exception serialization contract with `RemoteException`
  fallback for unknown exception types, the format-driver protocol that
  wire-format packages implement, and an explicit security model preventing
  deserialization-as-code-execution.

**Related documents:**
- [Loup Standard Library Reference v1.18](loup-stdlib-reference-v1_18.md)
- [Loup Packages Reference v1.11](loup-packages-reference-v1_11.md)

---

## Table of Contents

- [§1 Design Goals (non-normative)](#1-design-goals)
- [§2 Execution Model](#2-execution-model)
  - [§2.1 Script-Mode Runtime (JIT)](#21-script-mode-runtime-jit)
  - [§2.2 Module Introspection Dunders](#22-module-introspection-dunders)
  - [§2.3 Origination Introspection Dunders](#23-origination-introspection-dunders)
  - [§2.4 Execution Modes](#24-execution-modes)
  - [§2.5 File Mode Declarations](#25-file-mode-declarations)
  - [§2.6 Mode Feature Matrix](#26-mode-feature-matrix)
- [§3 Lexical Structure](#3-lexical-structure)
  - [§3.1 Source Encoding](#31-source-encoding)
  - [§3.2 Comments](#32-comments)
  - [§3.3 Statement Termination](#33-statement-termination)
  - [§3.4 Keywords and Reserved Words](#34-keywords-and-reserved-words)
  - [§3.5 Identifiers](#35-identifiers)
  - [§3.6 Literals](#36-literals)
  - [§3.7 Operators](#37-operators)
  - [§3.8 Collection Literals](#38-collection-literals)
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
  - [§8.1.1 Memory Strategy Modifiers (`local class`, `shared class`)](#811-memory-strategy-modifiers)
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
  - [§8.11 `unique class` Declaration](#811-unique-class-declaration)
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
  - [§10.3.1 Pure Value Type Invariant](#1031-pure-value-type-invariant)
  - [§10.3.2 Move Semantics for Structs with `unique` Fields](#1032-move-semantics-for-structs-with-unique-fields)
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
  - [§13.0 Namespace Declarations](#130-namespace-declarations)
  - [§13.1 Import Syntax](#131-import-syntax)
  - [§13.2 Re-Exports](#132-re-exports)
  - [§13.3 Package Manifest (`.lppkg`)](#133-package-manifest-lppkg)
  - [§13.4 Module Initialization](#134-module-initialization)
  - [§13.5 Package Registry](#135-package-registry)
  - [§13.6 Reserved Namespaces](#136-reserved-namespaces)
  - [§13.7 Module Fallback Pairs](#137-module-fallback-pairs)
  - [§13.8 Core Package Set](#138-core-package-set)
  - [§13.9 `LOUPPATH` — Development Package Search Path](#139-louppath--development-package-search-path)
  - [§13.10 Circular Imports and Deferred Type Resolution](#1310-circular-imports-and-deferred-type-resolution)
    - [§13.10.1 Circular Import Policy](#13101-circular-import-policy)
    - [§13.10.2 `defer import` — Deferred Type Resolution](#13102-defer-import--deferred-type-resolution)
    - [§13.10.3 Error Codes](#13103-error-codes)
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
  - [§16.8 GPU/Compute Fence Descriptors](#168-gpucompute-fence-descriptors)
- [§17 Concurrency](#17-concurrency)
  - [§17.1 `async`/`await`](#171-asyncawait)
  - [§17.2 `await group`](#172-await-group)
  - [§17.3 `TaskGroup`](#173-taskgroup)
  - [§17.4 Async Iterators and `for await`](#174-async-iterators-and-for-await)
  - [§17.5 Async Iterator Combinators](#175-async-iterator-combinators)
  - [§17.6 Actors and Supervision](#176-actors-and-supervision)
  - [§17.7 `atomic {}` — Cooperative Atomicity Scope](#177-atomic---cooperative-atomicity-scope)
  - [§17.7b `weak` References in Concurrent Contexts](#177b-weak-references-in-concurrent-contexts)
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
- [§17b Shared-Memory Concurrency](#17b-shared-memory-concurrency)
  - [§17b.1 Overview and Mode Availability](#17b1-overview-and-mode-availability)
  - [§17b.2 `Shareable` Marker Trait](#17b2-shareable-marker-trait)
  - [§17b.3 `SharedBuffer[T]` and `SharedArray[T]`](#17b3-sharedbuffert-and-sharedarrayt)
  - [§17b.4 `core.atomic` — Atomic Operations](#17b4-coreatomic--atomic-operations)
  - [§17b.5 `SharedArena` and Allocation](#17b5-sharedarena-and-allocation)
  - [§17b.6 `SharedRef[T]` and `shared class`](#17b6-sharedreft-and-shared-class)
  - [§17b.7 Cross-Mode ABI Contract](#17b7-cross-mode-abi-contract)
  - [§17b.8 Shared Synchronization Primitives](#17b8-shared-synchronization-primitives)
  - [§17b.9 Ownership Verbs and Shared Types](#17b9-ownership-verbs-and-shared-types)
  - [§17b.10 Worker Integration](#17b10-worker-integration)
  - [§17b.11 Error Codes](#17b11-error-codes)
- [§18 FFI and Host Interop](#18-ffi-and-host-interop)
  - [§18.1 JavaScript Interop (`extern js`)](#181-javascript-interop-extern-js)
  - [§18.2 `@jsexport`](#182-jsexport)
  - [§18.3 Typed JS Facades (`lang.interop.js`)](#183-typed-js-facades-langinteropjs)
  - [§18.4 Native Interop (`extern native`)](#184-native-interop-extern-native)
    - [§18.4.1 `native.ffi.ptrAdd` — Raw Pointer Arithmetic](#1841-nativeffiptradd--raw-pointer-arithmetic)
  - [§18.5 FFI Thread Safety (`@unsafe("threadSafe: ...")`, `ThreadSafeHandle`)](#185-ffi-thread-safety)
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
- [§22 Web Compiled Mode](#22-web-compiled-mode)
  - [§22.1 Compiled Mode Declaration](#221-compiled-mode-declaration)
  - [§22.2 Restrictions](#222-restrictions)
  - [§22.3 Execution Semantics](#223-execution-semantics)
- [§23 Native Compilation](#23-native-compilation)
  - [§23.1 Platform Targets and Output Formats](#231-platform-targets-and-output-formats)
  - [§23.2 Compiler Backends](#232-compiler-backends)
  - [§23.3 Linker](#233-linker)
  - [§23.4 ARC Memory Management](#234-arc-memory-management)
    - [§23.4.1 ARC Elision via `borrow` and `noescape fn`](#2341-arc-elision-via-borrow-and-noescape-fn)
    - [§23.4.1.1 `excl borrow` on Structs](#23411-excl-borrow-on-structs)
    - [§23.4.2 Lifetime Tracking and Region Inference](#2342-lifetime-tracking-and-region-inference)
    - [§23.4.3 Lifetime-Verified `unowned[~name]` Fields](#2343-lifetime-verified-unownedname-fields)
    - [§23.4.4 Inferred Struct Lifetimes](#2344-inferred-struct-lifetimes)
    - [§23.4.5 Buffer Disjointness Contracts](#2345-buffer-disjointness-contracts)
    - [§23.4.6 `@unsafe` — Programmer-Asserted Safety Boundary](#2346-unsafe--programmer-asserted-safety-boundary)
    - [§23.4.7 `unique` Ownership](#2347-unique-ownership)
    - [§23.4.8 `arc let`, `unique class`, and Integer Safety Error Codes](#2348-arc-let-unique-class-and-integer-safety-error-codes)
    - [§23.4.9 Ownership Transfer Verbs](#2349-ownership-transfer-verbs)
    - [§23.4.10 `requires` Clauses and `distinct()`](#23410-requires-clauses-and-distinct)
    - [§23.4.11 `modifier` — Method Mutation Contract](#23411-modifier--method-mutation-contract)
    - [§23.4.12 `safe` Contexts and `safe func` Propagation](#23412-safe-contexts-and-safe-func-propagation)
    - [§23.4.13 `synchronized` Class — Runtime-Locked Mutation](#23413-synchronized-class--runtime-locked-mutation)
    - [§23.4.14 `unsafe {}` Within `synchronized` Classes — Lock-Release Regions](#23414-unsafe--within-synchronized-classes--lock-release-regions)
  - [§23.5 ARC and the Scripted/Native Mode Boundary](#235-arc-and-the-scriptednative-mode-boundary)
  - [§23.6 ABI Stability](#236-abi-stability)
  - [§23.7 C Header Interop](#237-c-header-interop)
  - [§23.8 Build Pipeline and `.lppkg` for Native](#238-build-pipeline-and-lppkg-for-native)
  - [§23.9 Requirements](#239-requirements)
- [§24 Freestanding Mode](#24-freestanding-mode)
  - [§24.1 Overview](#241-overview)
  - [§24.2 Target Declaration and Compilation](#242-target-declaration-and-compilation)
  - [§24.3 Stripped Features](#243-stripped-features)
  - [§24.4 Available Features](#244-available-features)
  - [§24.5 `@entry` — Bare Entry Point](#245-entry--bare-entry-point)
  - [§24.6 `@panic_handler` and Panic Policy](#246-panic_handler-and-panic-policy)
  - [§24.7 `asm { }` — Inline Assembly](#247-asm----inline-assembly)
  - [§24.8 `@volatile` — MMIO Semantics](#248-volatile--mmio-semantics)
  - [§24.9 `Volatile[T]` — MMIO Type Wrapper](#249-volatile--mmio-type-wrapper)
  - [§24.10 `@repr` — Struct Layout Control](#2410-repr--struct-layout-control)
  - [§24.11 `@align` — Alignment Annotations](#2411-align--alignment-annotations)
  - [§24.12 `@section` — ELF/Mach-O Section Placement](#2412-section--elfmacho-section-placement)
  - [§24.13 `@interrupt` — Interrupt Service Routines](#2413-interrupt--interrupt-service-routines)
  - [§24.14 `@naked` — Naked Functions](#2414-naked--naked-functions)
  - [§24.15 `@callconv` — Calling Convention Override](#2415-callconv--calling-convention-override)
  - [§24.16 `@allocator` and `@deallocator`](#2416-allocator-and-deallocator)
  - [§24.17 `MaybeUninit[T]` — Uninitialized Memory](#2417-maybuninit--uninitialized-memory)
  - [§24.18 `reinterpret[T, U]` — Type-Safe Reinterpretation](#2418-reinterpretu--type-safe-reinterpretation)
  - [§24.19 Integer Overflow Arithmetic Methods](#2419-integer-overflow-arithmetic-methods)
  - [§24.20 Available Standard Library Subset](#2420-available-standard-library-subset)
  - [§24.21 `.lppkg` Extensions for Freestanding](#2421-lppkg-extensions-for-freestanding)
  - [§24.22 Freestanding Error Codes](#2422-freestanding-error-codes)
  - [§24.23 Example — x86_64 Kernel Stub](#2423-example--x8664-kernel-stub)
  - [§24.24 `@interruptSafe` Annotation and `InterruptGuard`](#2424-interruptsafe-annotation-and-interruptguard)
  - [§24.25 Freestanding Debug Service](#2425-freestanding-debug-service)
    - [§24.25.1 Overview](#24251-overview)
    - [§24.25.2 `FreestandingDebugFrame`](#24252-freestandingdebugframe)
    - [§24.25.3 Channel Annotations](#24253-channel-annotations)
    - [§24.25.4 Starting the Debug Service](#24254-starting-the-debug-service)
    - [§24.25.5 Channel Fallback Matrix](#24255-channel-fallback-matrix)
    - [§24.25.6 Control Channel Protocol](#24256-control-channel-protocol)
    - [§24.25.7 Trace Channel Protocol](#24257-trace-channel-protocol)
    - [§24.25.8 Host Tooling](#24258-host-tooling)
    - [§24.25.9 Time-Travel Replay for Freestanding](#24259-time-travel-replay-for-freestanding)
    - [§24.25.10 Design Notes](#242510-design-notes)
- [§25 Macros and Metaprogramming](#25-macros-and-metaprogramming)
- [§26 Failure Policy](#26-failure-policy)
  - [§26.1 Exception Hierarchy](#261-exception-hierarchy)
  - [§26.2 User-Defined Exceptions](#262-user-defined-exceptions)
  - [§26.3 Exception Categories](#263-exception-categories)
  - [§26.4 Exception Propagation Rules](#264-exception-propagation-rules)
  - [§26.5 Catch Pattern Matching](#265-catch-pattern-matching)
  - [§26.6 Template Exceptions](#266-template-exceptions)
  - [§26.7 Task Failures](#267-task-failures)
  - [§26.8 FFI Exceptions](#268-ffi-exceptions)
  - [§26.9 Signal Handling](#269-signal-handling)
- [§27 Grammar](#27-grammar)
  - [§27.1 Lexical Grammar](#271-lexical-grammar)
  - [§27.2 Syntactic Grammar — Programs and Modules](#272-syntactic-grammar--programs-and-modules)
  - [§27.3 Syntactic Grammar — Imports and Exports](#273-syntactic-grammar--imports-and-exports)
  - [§27.4 Syntactic Grammar — Statements](#274-syntactic-grammar--statements)
  - [§27.5 Syntactic Grammar — Expressions](#275-syntactic-grammar--expressions)
  - [§27.6 Syntactic Grammar — Patterns](#276-syntactic-grammar--patterns)
  - [§27.7 Syntactic Grammar — Types](#277-syntactic-grammar--types)
  - [§27.8 Syntactic Grammar — Declarations](#278-syntactic-grammar--declarations)
  - [§27.9 Syntactic Grammar — FFI Declarations](#279-syntactic-grammar--ffi-declarations)
  - [§27.10 Syntactic Grammar — Template Directives](#2710-syntactic-grammar--template-directives)
  - [§27.11 Syntactic Grammar — Macro Declarations](#2711-syntactic-grammar--macro-declarations)
  - [§27.12 Syntactic Grammar — Additional Productions](#2712-syntactic-grammar--additional-productions)
  - [§27.13 Syntactic Grammar — Template Fence and HTML Context Productions](#2713-syntactic-grammar--template-fence-and-html-context-productions)
  - [§27.14 Syntactic Grammar — v1.14 Additions](#2714-syntactic-grammar--v114-additions)
  - [§27.15 Syntactic Grammar — v1.15 Additions](#2715-syntactic-grammar--v115-additions)
  - [§27.16 Syntactic Grammar — v1.16 Additions](#2716-syntactic-grammar--v116-additions)
  - [§27.17 Syntactic Grammar — v1.17 Additions](#2717-syntactic-grammar--v117-additions)
- [§28 Tooling (non-normative)](#28-tooling)
  - [§28.1 Command-Line Interface](#281-command-line-interface)
  - [§28.2 Shebang Support](#282-shebang-support)
  - [§28.3 REPL](#283-repl)
  - [§28.4 Formatter](#284-formatter)
  - [§28.5 Language Server](#285-language-server)
  - [§28.6 Browser Bootstrap and Performance](#286-browser-bootstrap-and-performance)
    - [§28.6.1 Source Map Delivery](#2861-source-map-delivery)
    - [§28.6.2 Debug Server Bootstrap (`--inspect`)](#2862-debug-server-bootstrap---inspect)
  - [§28.7 Module Wasm Cache](#287-module-wasm-cache)
  - [§28.8 Project-Local Cache and Development Isolation](#288-project-local-cache-and-development-isolation)
  - [§28.9 Hardware Management Commands](#289-hardware-management-commands)
- [§29 Progressive Disclosure (non-normative)](#29-progressive-disclosure)
- [§30 Future Directions (non-normative)](#30-future-directions)
- [§31 Hardware Backend Lifecycle (non-normative)](#31-hardware-backend-lifecycle)
- [§32 Serialization Foundation](#32-serialization-foundation)
  - [§32.1 Overview and Design Principles](#321-overview-and-design-principles)
  - [§32.2 The `Value` Intermediate Representation](#322-the-value-intermediate-representation)
  - [§32.3 `Serializable` and `Deserializable` Traits](#323-serializable-and-deserializable-traits)
  - [§32.4 Auto-Derivation Rules](#324-auto-derivation-rules)
  - [§32.5 Type Identity and URIs](#325-type-identity-and-uris)
  - [§32.6 Polymorphic Serialization](#326-polymorphic-serialization)
  - [§32.7 Field-Level Annotations](#327-field-level-annotations)
  - [§32.8 Evolution and Compatibility Rules](#328-evolution-and-compatibility-rules)
  - [§32.9 Exception Serialization](#329-exception-serialization)
  - [§32.10 Format Driver Protocol](#3210-format-driver-protocol)
  - [§32.11 Security Model](#3211-security-model)
  - [§32.12 Interaction with `Sendable`, `Shareable`, and `shared class`](#3212-interaction-with-sendable-shareable-and-shared-class)
  - [§32.13 Error Codes](#3213-error-codes)
- [Appendix A: Keyword Index](#appendix-a-keyword-index)
- [Appendix B: Operator Index](#appendix-b-operator-index)
- [Appendix C: Built-in Type Index](#appendix-c-built-in-type-index)

---

## §1 Design Goals

*(This section is non-normative.)*

Loup is a statically-typed, cooperatively-scheduled programming language designed for scripting, code generation, and full-stack application development. The following goals guide the language design:

- **Embeddable syntaxes.** The language is built so that other language syntaxes (Python, TypeScript, HTML, SQL, etc.) are easy to embed directly via template literals ("template fences"), with formatting and interpolation.

- **Runs anywhere.** The language is meant to run at any layer of the stack — CLI tools, servers, services, and in the web browser. A portable bytecode target (WebAssembly with GC+EH) ensures broad deployability and sandboxing.

- **Type-forward.** The language emphasizes types, interfaces, and type safety. It supports primitives, classes, nominal interfaces, reified generics, sum types, structs, union types, and reflection — balancing safety with dynamic capabilities for scripting and generation workflows.

- **Progressive adoption.** The language is one coherent model, but its tooling and documentation let users begin with a small script-first surface and adopt advanced features only when needed.

- **Dynamic debuggability.** The runtime is designed to support native tracing, in-process time-travel capture, and remotely activated debugging via named portals and callable entry points. The JIT compilation pipeline preserves full source maps for line-level debugging.

- **Memory safety.** Loup provides memory safety guarantees comparable to Rust through a layered ownership system: ownership transfer verbs (`reads`, `edits`, `takes`, `shares`) enforce shared-XOR-mutable at call sites in all execution modes; the `modifier` keyword enforces exclusive access for class mutation; `safe` contexts extend enforcement to multi-statement borrow tracking; `synchronized` classes serialize mutation at runtime for concurrent and async contexts; and `distinct()` contracts replace unverified aliasing assertions with statically-verified or explicitly auditable guarantees. `atomic {}` blocks close TOCTOU races in cooperative async code by providing compiler-enforced suspension-free regions. Unlike Rust, these guarantees are available in all execution modes, not gated to native compilation.

- **Explicit meaning.** Core syntax avoids "magic fallback" behaviors. Where dynamic behavior exists, it is opt-in and syntactically explicit.

- **Cross-platform viability.** The language and its toolchain are designed to work uniformly across CLI tools, server applications, native desktop applications, and the web browser. Platform-specific capabilities are capability-gated and enforced at build time via platform profiles.

- **Compiled mode.** For performance-critical code, Loup supports a compiled mode that restricts the language to a statically-analyzable subset suitable for ahead-of-time compilation to optimized Wasm or native code. Portal statements and `core.reflect` are available in compiled mode.

- **Native compilation.** Loup programs can be compiled to native binaries via LLVM or Cranelift backends using mandatory ARC memory management, bidirectional C header interop, and deployment without a Wasm runtime.

- **True parallelism.** On native targets, the async executor is optionally reconfigurable to a work-stealing multi-threaded model that distributes async tasks across all CPU cores. CPU-bound work runs on a dedicated blocking thread pool via `spawnBlocking`. In scripted mode and Wasm targets, `spawnBlocking` offloads synchronous work to a host-managed thread pool, and `ScriptWorker` provides isolated parallel Wasm instances with typed message channels. The `Sendable` interface enforces data-race freedom at compile time across all targets.

- **Unified UI model.** The `ui` module provides a single reactive component model and `ui` fence that targets both web browsers (via Wasm) and native desktop platforms. Components written against the universal core are cross-platform by default; platform-specific enrichment is opt-in.

---

## §2 Execution Model

*(This section is normative.)*

Loup defines six execution modes — `@mode(web.scripted)`, `@mode(web.compiled)`, `@mode(host.scripted)`, `@mode(host.dual)`, `@mode(host.native)`, and `@mode(freestanding)` — described fully in §2.4 and §2.6. The modes organize along two orthogonal axes:

- **Deployment environment** — `web.*` targets the browser sandbox, `host.*` targets an operating system process, `freestanding` targets bare metal with no runtime.
- **Compilation strategy** — `.scripted` denotes JIT compilation at load time, `.compiled` and `.native` denote AOT compilation at build time, `.dual` denotes source that is deliverable either as JIT-compiled script or AOT-compiled native binary.

The six modes are not a strict subset hierarchy — each combines an environment and a strategy with specific capability implications. The modes are specified fully in §22 (web modes), §23 (host modes), and §24 (freestanding).

**Design principles.**

1. **One language, delivery choice.** Features depend on the deployment environment, not on the compilation strategy. A file written for `host.scripted` can generally be compiled by the `host.native` AOT pipeline without modification. Delivery (JIT vs AOT) is a build decision, not a language decision.

2. **Statically-checkable capability surfaces.** The `@mode` declaration at the top of a file statically determines which runtime capabilities, standard-library modules, and language features are available. The linter, compiler, completion menus, and error messages use the mode as authoritative. A file declaring `@mode(web.scripted)` cannot reach for `runtime.proc.runAsync` even if the underlying JIT runtime would permit it.

3. **Import transparency.** An imported module's `@mode` does not leak through its public interface. Code in `host.scripted` may import a `host.native` module without knowing which delivery pipeline produced it; the runtime bridges the boundary (§23.5).

4. **Script-first portability.** Any module written in `web.scripted` or `host.scripted` that avoids build-time-only features can be compiled AOT (to `web.compiled` or `host.native` respectively) without source changes. This lets libraries ship as source and run without the native compiler toolchain installed.

### §2.1 Script-Mode Runtime (JIT)

*(This subsection specifies the JIT runtime used by `@mode(web.scripted)` and `@mode(host.scripted)`. The AOT pipelines are specified in §22 and §23.)*

Script-mode execution uses a cooperative, single-threaded runtime with first-class `async`/`await`.

**Runtime model.** The runtime SHALL execute Loup code cooperatively on a single thread by default, suspending only at explicit `await` expressions. All asynchronous work is represented as `Task[T]` values scheduled on the host event loop. Evaluation is deterministic between suspension points; only external I/O completion order may affect when suspended tasks resume. On `host.native` targets, the executor may be reconfigured to a work-stealing multi-threaded model via `runtime.configure` (§17.9.1) to enable parallelism across CPU cores. In script-mode runtimes and on all Wasm targets, `spawnBlocking` (§17.10.1) offloads CPU-bound synchronous work to a host-managed thread pool, and `ScriptWorker` (§17.10.2) provides isolated parallel Wasm instances with `Sendable`-typed message channels.

**JIT compilation pipeline.** The `loup run` command uses a JIT compilation pipeline rather than ahead-of-time batch compilation:

1. **Cache lookup** — Before compiling, the runtime checks the module Wasm cache (§28.7) for an up-to-date compiled artifact matching the module's source hash and current toolchain version. If a cache hit is found, step 2 is skipped and the cached Wasm is instantiated directly.
2. **Parse and JIT compile to Wasm** — If no cache entry exists, the source file is parsed into an AST and each top-level statement (or function body) is compiled to WebAssembly (GC+EH) incrementally.
3. **Execute** — Compiled Wasm is executed immediately.

This pipeline ensures that execution begins immediately and each statement is individually addressable by a debugger. There is no separate build step for script modes. For packages installed via `loup install`, step 1 will nearly always be a cache hit, reducing script-mode startup latency to near-zero for imported modules.

**Statement-level execution.** In `@mode(host.scripted)`, the runtime SHALL treat every source-level statement as a discrete execution step. When a module is loaded, its top-level statements execute sequentially in source order. The JIT pipeline is the default execution mode for `loup run` and REPL sessions. Sequential top-level execution is specific to `host.scripted` — other modes use architectural entry points (web bootstrap, `main()`, `@entry`) described in §2.4.

**Source maps and debugging.** The runtime SHALL maintain a source map from every emitted Wasm instruction back to its originating Loup source line and column, enabling line-level breakpoints on any statement including imports and type definitions. JIT-compiled Wasm retains full debug metadata (source maps, local variable names, scope boundaries) by default.

**Source map delivery (normative).** When `loup build --debug --target browser` is invoked the toolchain SHALL:

1. Emit an external source map file `app.wasm.map` in the `dist/` output alongside `app.wasm`. Inline base64 source maps are permitted only for `loup serve` development mode; external files are required for all `loup build` outputs.
2. Append a `//# sourceMappingURL=app.wasm.map` comment at the end of the `app.wasm` binary so V8's Wasm debugger discovers the map automatically.
3. Annotate each portal entry point in the source map using the custom extension field `x-loup-portals`: a JSON object mapping portal names to their Wasm byte offsets. This enables the Loup DevTools extension (§21.26) to look up portals by name for CDP breakpoint placement.

`loup serve` SHALL serve `*.wasm.map` files with `Content-Type: application/json` and the response header `Access-Control-Allow-Origin: *` so Chrome DevTools can fetch source maps across the local origin boundary. Production deployments are responsible for configuring equivalent headers on their static file servers; Loup does not enforce this at build time but the tooling documentation SHALL note the requirement.

**Bytecode target.** The primary bytecode target for all Wasm-delivered modes (`web.scripted`, `web.compiled`, `host.scripted`, and the JIT side of `host.dual`) is WebAssembly with GC and Exception Handling proposals. The specification defines:

- The mapping from Loup types to Wasm GC types (structs, arrays, `i31ref`, `funcref`, etc.)
- How Loup exceptions map to Wasm EH tags
- How `Task[T]` and async/await map to Wasm execution (stack switching or CPS transform)
- The Wasm module interface (imports/exports) that the Loup runtime host must provide
- The source map format that maps Wasm instruction offsets to Loup source locations (file, line, column)

**AOT compilation.** The `loup build` command uses an ahead-of-time (AOT) compilation mode that produces optimized Wasm modules (for `web.compiled`) or native binaries (for `host.native`, `host.dual`, `freestanding`) for deployment. Debug info inclusion is controlled by a `--debug` flag. AOT-compiled artifacts strip debug metadata unless `--debug` is specified.

**Statement-level execution semantics.** The following rules define precisely what "executing" each kind of top-level statement means in `@mode(host.scripted)`:

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
- **Conditional breakpoints:** The condition is a Loup expression evaluated in the breakpoint's lexical scope.
- **Watch expressions:** Re-evaluated at each debugger pause using the current scope.

When stepping into an import statement, the debugger enters the imported module and allows stepping through its top-level statements one by one. Line-level debugging is available in both `loup run` (JIT) mode and when running Wasm modules compiled with `loup build --debug`.

The runtime SHALL emit `Line` trace events (as defined in §20.3) at every source-level statement boundary, enabling trace hooks to observe execution at line granularity.

**Debug information and source maps.** The compiler SHALL emit DWARF debug information or a Wasm-compatible source map for every compiled Wasm module, mapping instruction offsets to Loup source locations (file path, line, column). Debug metadata includes:

- Local variable name and scope boundary information, so debuggers can display variable values at any point in execution.
- Type information, including enum variants, generic type parameters, and boxed/unboxed state, so debuggers can display typed values.

When JIT-compiling, the runtime attaches debug metadata to each compiled Wasm function immediately, without requiring a post-processing step. When AOT-compiling with `loup build --debug`, the compiler embeds debug metadata in the output Wasm module or emits a companion `.loup-debug` sidecar file. When AOT-compiling without `--debug`, the compiler strips debug metadata from the output Wasm module for minimal binary size.

The source map format is defined in relation to existing standards: DWARF for Wasm (for native and AOT targets) and the Wasm Source Map proposal (for browser-hosted execution).

**Tracing.** When a debug server or trace hook is active, the runtime SHALL maintain rolling trace history for time-travel debugging. Named `portal` statements and callable entry points may activate trace capture for the current task.

**Failure model.** Failures are hard by default; see §26 for the complete failure policy.

**Wasm call-stack exhaustion (normative).** A Wasm call-stack exhaustion trap encountered during execution of a Loup Wasm-delivered program SHALL be caught by the Loup runtime host and rethrown as `StackOverflowError extends RuntimeError` (§26.1) at the point of the deepest active Loup call frame. `StackOverflowError` is catchable by user `try/catch` blocks. The maximum call-stack depth is engine-defined and is not specified by Loup; programs MUST NOT rely on a particular limit. Recursive algorithms with unbounded depth SHOULD use explicit work-list patterns or `gen func` (§7.5) to avoid stack exhaustion.

### §2.2 Module Introspection Dunders

Every Loup module has three implicit read-only bindings available at module scope:

| Dunder | Type | Description |
|---|---|---|
| `__name__` | `string` | The module's identity name |
| `__file__` | `string` | The absolute filesystem path of the source file |
| `__execmode__` | `string` | The mode string: `"web.scripted"`, `"web.compiled"`, `"host.scripted"`, `"host.dual"`, `"host.native"`, or `"freestanding"` |

**`__name__` rules:**

- In `@mode(host.scripted)`, when a file is executed directly via `loup run`, `__name__` is `"__main__"`. When loaded as an import, `__name__` is the module's fully-qualified dotted name (e.g., `"mypackage.utils"`).
- In `@mode(host.dual)` and `@mode(host.native)`, `__name__` is always the module's fully-qualified dotted name. Entry is via the `main()` function, not via file identity.
- In `@mode(web.scripted)` and `@mode(web.compiled)`, `__name__` is always the module's fully-qualified dotted name. Web modules are loaded by the browser bootstrap (§28.6); there is no "run this file directly" disposition, so `"__main__"` is never a meaningful value.
- In `@mode(freestanding)`, `__name__` is always the module's fully-qualified dotted name. Entry is via the `@entry` annotation (§24.5).
- In the REPL, `__name__` is `"__main__"`.

**`__file__` rules:**

- `__file__` is the absolute path to the source file on disk.
- In the REPL, `__file__` is `"<repl>"`.

**`__execmode__` rules:**

- `@mode(web.scripted)` (or no mode directive with `--target browser`): `"web.scripted"`
- `@mode(web.compiled)`: `"web.compiled"`
- `@mode(host.scripted)` (or no mode directive with a host target): `"host.scripted"`
- `@mode(host.dual)`: `"host.dual"` — regardless of whether the current execution path is the JIT or AOT side
- `@mode(host.native)`: `"host.native"`
- `@mode(freestanding)`: `"freestanding"`
- In the REPL: `"host.scripted"`

In all AOT-compiled modes (`web.compiled`, `host.native`, `freestanding`, and the AOT side of `host.dual`), `__execmode__` is a compile-time string constant baked into the binary. It does not require the Loup runtime to evaluate. `core.reflect` is not needed to read `__execmode__` — it is always a compile-time constant in all AOT modes. In `host.dual`, the value is fixed at source-declaration time and does not vary between JIT and AOT delivery paths; user code wishing to detect the current delivery pipeline SHOULD use `runtime.delivery` (§20.1) instead.

**Read-only semantics.** The compiler SHALL treat `__name__`, `__file__`, and `__execmode__` as read-only implicit `let` bindings. Attempting to reassign any of them is a compile-time error (`E_LET_REASSIGN`).

**AOT-mode constants.** In any AOT-compiled file, `__name__`, `__file__`, and `__execmode__` are compile-time string constants baked into the binary — they do not require the runtime to evaluate. `__name__` is the module's dotted name, `__file__` is the source path at compile time, and `__execmode__` is the mode string for that file.

**Dunder reservation.** Identifiers beginning and ending with double underscores (`__*__`) follow the Python dunder naming convention and are reserved for language-defined module introspection variables. User code SHALL NOT declare variables with dunder names. The language-reserved dunders are: `__name__`, `__file__`, `__execmode__`, and `__module__` (the declaration-level property on named types and functions, §2.3). Additional language-level introspection variables follow the same `__dunder__` pattern.

**Main guard pattern.** The idiomatic way to write code that runs only when a file is executed directly:

```
// utils.loup — a dual-purpose module (host.scripted)
pub func greet(name: string): string {
  return i"Hello, {$ name $}!";
}

if (__name__ == "__main__") {
  // This block runs only when executed via `loup run utils.loup`
  let message = greet("world");
  print(message);
}
```

This pattern is available only in `@mode(host.scripted)`. It is a compile-time error in all other modes:

- **In `web.scripted` and `web.compiled`** — web modules are loaded by the browser bootstrap and have no direct-execution disposition. The guard would be statically dead. (`E_MAIN_GUARD_NOT_APPLICABLE`)
- **In `host.dual` and `host.native`** — entry is via a declared `main()` function (§2.4.4, §2.4.5); top-level control flow is prohibited, which the compiler enforces separately. (`E_TOPLEVEL_CONTROL_AOT`)
- **In `freestanding`** — entry is via `@entry` (§24.5); top-level control flow is prohibited. (`E_TOPLEVEL_CONTROL_AOT`)

**Async execution example.**

```
async func fetchData(url: string): Task[string] {
  let response = await runtime.net.get(url);
  return response.body;
}

async func main() {
  let task1 = fetchData("https://api.example.com/users");
  let task2 = fetchData("https://api.example.com/posts");

  let users = await task1;
  let posts = await task2;

  print(i"Users: {$ users $}");
  print(i"Posts: {$ posts $}");
}

// In host.scripted:
if (__name__ == "__main__") {
  await main();
}

// In host.dual / host.native: main() is called by the runtime; no guard needed.
```

### §2.3 Origination Introspection Dunders

Classes have declaration-level dunders that are accessible as properties on named types and functions:

| Dunder | Available on | Type | Description |
|---|---|---|---|
| `__module__` | class, struct, enum, interface, func | `Module` | The module that declared this value |


**`__module__` on named declarations.** Every named class, struct, enum, interface, and function declaration carries an implicit `__module__` property that returns a `Module` value representing the module where the declaration was made. This is accessible via dot syntax on any named type or function value:
```loup
Encoder.__module__.__execmode__    // e.g., "host.scripted", "host.native", "web.compiled"
decode.__module__.__name__         // "mylib.codec"
Shape.__module__.__file__          // "/path/to/shapes.loup"
```

`__module__` is not a module-scope dunder — it is a property on type and function values. It is available in all six modes. In any AOT-compiled mode (`web.compiled`, `host.native`, `freestanding`, and the AOT side of `host.dual`), `.__module__` returns compile-time-baked metadata requiring no runtime evaluation.

**`Module` built-in type.** `Module` is a built-in class with read-only properties mirroring the module-scope dunders:
```loup
class Module : Any {
  pub let __name__: string;      // fully-qualified module name
  pub let __file__: string;      // source file path at compile time
  pub let __execmode__: string;  // one of the six mode strings

  // Runtime module reflection — available when the Module value is the result of
  // runtime.compile() or obtained via __module__ on a dynamically-loaded type.
  pub func exports(): list[string];                  // exported symbol names
  pub func get(name: string): Any;                   // throws KeyError if not found
  pub func has(name: string): bool;                  // check if name is exported
  pub func call(name: string, args: list[Any]): Any; // call exported function
}
```

`Module` values are not constructable by user code — they are produced only by the runtime in response to `.__module__` access. Two `.__module__` accesses on declarations from the same module return the same `Module` instance (referential equality).

**`prefer compiled` and `__execmode__`.** When a module is loaded via `prefer compiled` resolution (§13.1, §13.7), its `__execmode__` reflects which path was taken: the AOT mode string if a compiled artifact was loaded, `"host.scripted"` or `"web.scripted"` if the scripted fallback was used. This is the canonical way to inspect fallback resolution from user code:
```loup
from codec import (Encoder) prefer compiled;

if (Encoder.__module__.__execmode__ == "host.scripted") {
  log.warn("codec running in pure script mode — performance may be reduced");
}
```

---

## §2.4 Execution Modes

*(This section is normative.)*

Loup defines six execution modes. Each mode represents a specific combination of deployment environment and compilation strategy, determining runtime support, memory management strategy, permitted language features, and target deployment artifact. A source file declares its mode with the `@mode` directive (§2.5); the build system, compiler, linter, formatter, and language server treat the declared mode as authoritative for that file.

The modes organize as a 2D grid:

| Environment ↓ / Strategy → | JIT (scripted) | AOT (compiled) | Hybrid (dual) |
|---|---|---|---|
| **Web** (browser, Wasm GC) | `web.scripted` | `web.compiled` | — |
| **Host** (OS process) | `host.scripted` | `host.native` | `host.dual` |
| **Bare metal** (no runtime) | — | `freestanding` | — |

There is no runtime compatibility between environments; modules compiled for different environments produce distinct binary artifacts. Within an environment, modules freely mix strategies:

- A `host.scripted` file may import `host.native` or `host.dual` modules; the runtime bridges the GC/ARC boundary (§23.5). Consumer code does not need to know which delivery strategy produced the imported module — this is the **import transparency** principle in action.
- A `web.scripted` file may import `web.compiled` modules; both sides run on the shared Wasm GC runtime.
- A `host.dual` file may import from any host-environment mode (`host.scripted`, `host.native`, or other `host.dual`), carrying the import transparency guarantee through both delivery paths.

A `host.native` binary that uses `runtime.compile` (§20.1) embeds a JIT runtime and can dynamically load `host.scripted` or `host.dual` modules at runtime, further extending the import-transparency principle to runtime module loading.

### §2.4.1 `web.scripted` — Browser JIT

The web-environment script mode. Loup source is delivered to the browser; `loup-rt.js` JIT-compiles each module to Wasm GC+EH at load time (§2.1, §28.6).

**Entry point.** Architectural — the browser bootstrap fetches `app.wasm` (compiled from source at load time), runs top-level declarations, wires `data-loup-ev` event handlers, and invokes the registered `mount(...)` call. There is no `main()` function; top-level control flow is permitted for setup but `__name__ == "__main__"` is not meaningful (§2.2).

**Features:**

- Dynamic typing (full `Any` usage), `dynamic class`, `core.reflect`, `core.inspect`
- ARC memory model (`local class` default, `shared class` opt-in; §8.1.1); implementation may use Wasm GC under the hood as an optimization (§8.1.1.1)
- `async`/`await` with cooperative event loop
- Template fences (HTML, CSS, WGSL, Metal, GLSL), reactive UI (`ui.web`), Web Components (`@webcomponent`)
- Compile-time ownership features: `reads`, `edits`, `takes`, `shares`, `modifier`, `safe {}` / `safe func`, `synchronized`, `distinct()`, `borrow`, `excl borrow`, `borrow[~name]`, `lifetime ~name`, `noescape fn`, `unique let`/`var`/`class`, `unowned[~name]`, `MaybeUninit[T]`, `reinterpret[T, U]`, `atomic {}`
- `weak` references (§8) on any `local class` or `shared class` instance
- `runtime.compile` — dynamic JIT of additional modules
- `spawnBlocking`, `ScriptWorker` (§17.10), shared-memory concurrency (§17b)
- Full standard library except host-capability APIs

**Restrictions.** Host-environment capabilities (`runtime.fs`, `runtime.proc`, `runtime.net` with non-browser semantics, `ThreadLocal[T]`) are not available — calling them is a compile-time error (`E_CAPABILITY_NOT_WEB`) or throws `CapabilityError` at runtime when the call site is dynamically resolved.

Build-time-only features (`asm { }` inline Wasm, static layout control via `@repr`) are unavailable; source must be reprocessed by the JIT pipeline at load time.

### §2.4.2 `web.compiled` — Browser AOT

The web-environment compiled mode. Loup source is AOT-compiled at build time to a `.wasm` module that is fetched and instantiated by the browser bootstrap (§22, §28.6).

**Entry point.** Architectural, identical to `web.scripted` — the browser bootstrap runs top-level declarations, wires event handlers, and invokes the registered `mount(...)` call.

**Features.** A strict superset of `web.scripted` features plus build-time-only constructs:

- All `web.scripted` features (dynamic typing, ownership verbs, template fences, UI, `runtime.compile`, etc.)
- `asm { }` Wasm inline assembly (with `@unsafe`)
- Static data layout control applicable to Wasm (`@repr` subset)
- Full AOT optimization: inlining, LTO, dead-code elimination, tree-shaking
- Smaller shipped bundle (no JIT pipeline embedded)

**Restrictions.** None beyond those inherited from the web environment (no host capabilities, no ARC-specific features).

**Lint advisory.** Using `Any` as a declared type, `dynamic class`, or `core.inspect` in `web.compiled` produces `W_ANY_IN_AOT_MODE` — the AOT compiler emits tagged-value dispatch code and embeds a static type registry, which carries a runtime cost. This is an advisory, not an error; projects that prefer to enforce static typing can promote the warning with `--warnings-as-errors=W_ANY_IN_AOT_MODE`.

**Relationship to `web.scripted`.** Every `web.scripted` module is a valid `web.compiled` module — the AOT pipeline accepts the same source with no changes required. The converse is not true: a `web.compiled` module using `asm { }` or other build-time-only features cannot be JIT-compiled. This asymmetry is why no `web.dual` mode is needed: `web.scripted` is inherently dual-deliverable, and `web.compiled` flags the one-way cases.

### §2.4.3 `host.scripted` — Host JIT

The host-environment script mode. Files are executed by `loup run` on a host runtime (`node`, `bun`, `deno`, or the standalone `loup` CLI), JIT-compiled to Wasm GC+EH inside the host process (§2.1).

**Entry point.** Sequential top-level execution — when a file is invoked via `loup run foo.loup`, its top-level statements execute in source order, with `__name__ == "__main__"` available as a runtime-executable branch.

**Features.**

- Script-mode runtime: dynamic typing, `dynamic class`, `core.reflect`, `core.inspect`, JIT compilation with incremental re-compilation
- ARC memory model (`local class` default, `shared class` opt-in; §8.1.1); implementation may use Wasm GC under the hood as an optimization (§8.1.1.1)
- `async`/`await` with cooperative event loop
- Template fences (HTML, CSS, WGSL, Metal, GLSL)
- Reactive UI via `ui.desktop` — native desktop UI backend
- Compile-time ownership features (universal, §23.4.x): `reads`, `edits`, `takes`, `shares`, `modifier`, `safe {}` / `safe func`, `synchronized`, `distinct()`, `borrow`, `excl borrow`, `borrow[~name]`, `lifetime ~name`, `noescape fn`, `unique let`/`var`/`class`, `unowned[~name]`, `MaybeUninit[T]`, `reinterpret[T, U]`, `atomic {}`
- `weak` references (§8) on any `local class` or `shared class` instance
- `runtime.compile` — dynamic JIT of additional modules
- Sequential top-level execution and `__name__ == "__main__"` guard pattern
- Full host capability surface: `runtime.fs`, `runtime.proc`, `runtime.net`, file system, process spawning, environment variables
- `spawnBlocking` backed by the host's OS thread pool (default 512 threads)
- `ScriptWorker` with host-side isolation (§17.10), shared-memory concurrency (§17b)

**Restrictions.**

- **Web-specific features** — `ui.web`, `@webcomponent`, browser DOM APIs are unavailable.
- **Build-time-only features** — `asm { }`, static layout control via `@repr`, hardware intrinsics are unavailable.

**Cross-mode imports.** A `host.scripted` module may import `host.native` or `host.dual` modules. The import is transparent at the source level; the runtime inserts the ARC/GC bridge described in §23.5. If the imported native module is unavailable (the native toolchain was not installed, or the binding failed to compile), resolution may fall back to a scripted implementation via `prefer compiled` (§13.7). This realizes the **import transparency** design principle (§2): consumer code does not need to know whether an imported module is script-delivered or AOT-delivered.

### §2.4.4 `host.dual` — Host Hybrid

The host-environment hybrid mode. Files declare `@mode(host.dual)` to signal that the module is deliverable via either the JIT pipeline (like `host.scripted`) or the AOT native compiler (like `host.native`), and that the author intends to use ARC-backed safety features that require runtime support (`weak` references, `arc let`).

**Host.dual semantics.** A single `host.dual` source file behaves identically on both delivery paths. Features that fundamentally cannot round-trip between JIT and AOT are prohibited in `host.dual`. Features that *can* work on both paths — even if the AOT binary must embed a runtime component (a JIT compiler for `runtime.compile`, a minimal Wasm runtime for `ScriptWorker`) — are permitted; the build system handles the embedding automatically. The programmer writes one thing and it works the same way on both paths.

**Entry point.** A declared `main()` function. Top-level control flow is prohibited (`E_TOPLEVEL_CONTROL_AOT`); only declarations and constant initializers are permitted at module scope. The runtime invokes `main()` after module initialization — the JIT pipeline calls `main()` after compiling the module, and the AOT pipeline emits a binary whose entry point calls `main()`.

**Features.**

- All `host.scripted` source-level features (dynamic typing, template fences, ownership verbs, compile-time ownership analysis, full host capability surface, `ui.desktop`)
- `weak` references — JIT path uses a runtime-maintained weak table over Wasm GC; AOT path uses ARC zeroing side table; programmer sees identical semantics
- `arc let` / `arc var` — JIT path treats as regular GC-managed bindings; AOT path uses ARC; programmer sees identical observable semantics
- `runtime.compile` — JIT path uses its native JIT; AOT path embeds a JIT runtime into the produced binary
- `ScriptWorker` — JIT path uses standard Wasm isolates; AOT path embeds a minimal Wasm runtime capable of spawning isolates
- `Thread` / `ThreadPool` — JIT path emulates via `spawnBlocking`-backed workers; AOT path uses OS threads
- `ThreadLocal[T]` — JIT path uses a per-worker map; AOT path uses OS thread-local storage
- `@lockOrder(n)` on `synchronized` classes
- `@signalSafe` annotation
- Zero-overhead `extern native` C FFI (AOT path); JIT path provides a typed FFI bridge

**Restrictions.** Features prohibited in `host.dual` because they fundamentally cannot work on one of the delivery paths:

- **AOT-only / native-only features:** `asm { }` inline assembly, `native.simd`, `Vec[T, N]`, `@vectorize` hint, `native.mem.alloc`, `native.atomic` hardware fences — require direct machine-code emission or hardware SIMD and have no Wasm equivalent. Use `host.native` instead. (`E_NATIVE_ONLY_IN_DUAL`)
- **Top-level control flow:** `if`, `while`, `for`, `match`, or expression statements at file scope — the AOT pipeline has no sequential top-level execution model. Use `main()` instead. (`E_TOPLEVEL_CONTROL_AOT`)
- **Non-constant top-level initializers:** permitted only if the initializer is a compile-time constant; otherwise move the assignment into a module-init call invoked from `main()`.

**Delivery choice.** The build system selects the delivery pipeline based on project configuration (`[build]` in `.lppkg`) and the availability of the native toolchain. A `host.dual` module built with `loup build --native` produces an AOT binary; the same source run via `loup run` uses the JIT pipeline. Source behaves identically on both paths. The current delivery path is observable via `runtime.delivery` (§20.1) — returns `"jit"` or `"aot"` — but user code SHOULD NOT need this; delivery differences are runtime implementation details.

**Binary size implications (AOT path).** Using `runtime.compile` in a `host.dual` module causes the AOT build to embed the JIT runtime (approximately 300 KB uncompressed). Using `ScriptWorker` causes the AOT build to embed a minimal Wasm runtime (approximately 500 KB uncompressed, inclusive of the JIT). Projects that need minimum binary size should use `host.native` for the hot path and isolate any JIT-requiring code into separate `host.dual` modules that can be linked conditionally or omitted in constrained builds.

**Purpose.** `host.dual` is the "write once, ship either way" mode. A dependency published as `host.dual` can be consumed in a `host.scripted` project (JIT'd on the fly) or in a `host.native` project (linked as a native module) without source changes. This supports the **script-first portability** design principle (§2): libraries can use ARC safety features and dynamic capabilities without forcing consumers to install the native compiler toolchain.

### §2.4.5 `host.native` — Host AOT

The host-environment AOT native mode. Compiles to a platform-native binary via LLVM or Cranelift (§23) with ARC memory management, zero-overhead C FFI, and direct machine-code emission. Intended for performance-critical applications, system utilities, and deliverables where binary size and startup time matter.

**Entry point.** A declared `main()` function. Top-level control flow is prohibited (`E_TOPLEVEL_CONTROL_AOT`); only declarations and constant initializers are permitted at module scope.

**Features.** All host-environment features, including those requiring direct machine access that are prohibited in `host.dual`:

- All `host.dual` source-level features (dynamic typing, ownership verbs, compile-time ownership analysis, `weak`, `arc let`, full host capability surface, `Thread` / `ThreadPool` / `ThreadLocal[T]`, etc.)
- `asm { }` inline assembly (with `@unsafe`)
- `native.simd`, `Vec[T, N]`, hardware vector intrinsics
- `native.atomic` — OS-level atomics, memory fences, hardware barriers
- `native.mem.alloc` / `native.mem.free` — raw memory operations
- Work-stealing multi-threaded async executor (`runtime.configure`)
- `PinnedRef[T]`, `OwnedHandle`, `BorrowedHandle` — FFI ownership types (§18.4)
- `@vectorize` hints honored by the backend
- Full LLVM optimization: LTO, PGO, target-specific tuning
- `runtime.compile` — the AOT binary embeds a JIT runtime so that `host.native` code can evaluate and call into dynamically-loaded script modules. Embedding adds approximately 300 KB and may be suppressed via `[build] embed_jit = false` in `.lppkg` if `runtime.compile` is not used in the project.
- `ScriptWorker` — the AOT binary may embed a minimal Wasm runtime for isolate-based parallelism; opt-in via usage or explicit configuration

**Restrictions.** Host-native binaries are platform-specific (one binary per `os × arch` target) and are not deliverable as web modules. Web-environment features (`ui.web`, `@webcomponent`, browser DOM APIs) are unavailable; use `ui.desktop` for native UI.

**Relationship to `host.dual`.** Every `host.dual` source file compiles cleanly as `host.native` (one-way superset in source). The converse is not true: a `host.native` file using `asm { }`, `native.simd`, or `@vectorize` cannot be JIT-delivered as script.

**When to use which.**

- **`host.native`** — binary is the primary deliverable; need direct hardware access (SIMD, inline assembly, target-specific intrinsics); want maximum optimization and minimum runtime footprint.
- **`host.dual`** — want the module consumable by projects without the native toolchain; publishing a library intended to work in any host project regardless of its chosen compilation strategy; ARC safety features are valuable but peak performance is not paramount.
- **`host.scripted`** — write-and-run scripting; no ARC safety features needed; fastest iteration cycle.

### §2.4.6 `freestanding` — Bare Metal

The freestanding mode. Compiles to a native binary with **no Loup runtime linked** — designed for kernels, bootloaders, embedded firmware, and bare-metal environments.

**Entry point.** A function annotated with `@entry` (§24.5). There is no `main()`; there is no runtime to call `main()`. The `@entry` function is wired directly to the linker-defined entry symbol.

**Features.**

- Full compile-time ownership and lifetime system (`borrow`, `unique`, `lifetime ~name`, `noescape fn`, `unowned[~name]`, `MaybeUninit[T]`, etc.)
- `reads`, `edits`, `takes`, `shares`, `modifier`, `safe {}`, `distinct()`
- `asm { }` inline assembly, `@volatile`, `Volatile[T]`, `@repr`, `@interrupt`, `@naked`, `@callconv`, `@entry`, `@panic_handler`, `@allocator`, `@deallocator`
- v1.16 hardware-safety additions: `@interruptSafe`, `InterruptGuard` (§24.24), `DmaBuffer[T]` and `native.dma` (§24.20), `native.mpu.installStackGuard` (§24.20), `native.atomic.hwFence` with `MemoryOrder` (§24.20), `PartialInit[T]` (§24.17a), `reinterpretChecked[T, U]` (§24.18)
- Freestanding debug portal service in `--debug` builds — `portal` statements, `@debug_control_channel`, `@debug_trace_channel`, time-travel replay (§24.25)

**Restrictions.** Classes require an `@allocator` registration; without one, class construction is a compile-time error. Async/await, exceptions, template fences, UI, `core.reflect`, `core.inspect`, `dynamic class`, `weak` references, `arc let`, `Any` as a declared type — all unavailable. See §24 for the complete freestanding specification.

---

## §2.5 File Mode Declarations

*(This section is normative.)*

### §2.5.1 The `@mode` Directive

Every Loup source file carries an explicit or implicit mode declaration. The `@mode` directive MUST appear as the first non-comment, non-blank token:

```loup
@mode(web.scripted)      // browser JIT
@mode(web.compiled)      // browser AOT
@mode(host.scripted)     // host JIT (default for host targets)
@mode(host.dual)         // host hybrid — either JIT or AOT
@mode(host.native)       // host AOT native binary
@mode(freestanding)      // bare-metal; no runtime
```

**Syntax.** The argument to `@mode` is a dotted identifier path: `family.subfamily` where `family ∈ {web, host}` and `subfamily ∈ {scripted, compiled, dual, native}`, or the bare identifier `freestanding`. The dotted form parses identically to namespace paths (§27.3) — no new lexical rules are required.

**Rules:**

- `@mode` must be the first active token in the file; later placement is `E_MODE_POSITION`.
- Only one `@mode` per file; duplicates are `E_MODE_DUPLICATE`.
- Unrecognized mode names produce `E_MODE_UNKNOWN`.
- Files without an explicit `@mode` inherit the project-level default (§2.5.2). In the absence of a project default, the implicit mode is `@mode(host.scripted)`.

**Family matching.** Linters and tooling may pattern-match mode families using the dotted form:

- `@mode(web.*)` — all web-environment modes
- `@mode(host.*)` — all host-environment modes
- `@mode(*.scripted)` — all JIT-delivered modes

Family-based lint rules apply uniformly within a family (for example, the no-host-capabilities rule fires on all `@mode(web.*)` files regardless of JIT vs AOT).

### §2.5.2 Mode and Build Target Consistency

| `@mode` | Compatible `--target` | Delivery |
|---|---|---|
| `@mode(web.scripted)` | `browser` | Source + JIT at load time |
| `@mode(web.compiled)` | `browser`, `wasm` | AOT-compiled Wasm module |
| `@mode(host.scripted)` | `node`, `bun`, `deno`, `cli` | Source + JIT at `loup run` |
| `@mode(host.dual)` | `node`, `bun`, `deno`, `cli`, `service`, `desktop`, `native` | Either JIT or AOT native |
| `@mode(host.native)` | `native`, `cli`, `service`, `desktop` | AOT native binary |
| `@mode(freestanding)` | `freestanding` | AOT native binary, no runtime |

A mismatch between file `@mode` and `--target` is `E_MODE_TARGET_MISMATCH`.

**Note on host targets.** The `cli`, `service`, and `desktop` build targets accept `@mode(host.scripted)`, `@mode(host.dual)`, or `@mode(host.native)`. Mixed-mode projects where script files import native modules use the script/native interop boundary (§23.5) — the boundary is transparent to source code; import transparency is a design principle (§2).

**Project-wide mode.** A `.lppkg` manifest may declare `mode = "web.scripted"` (or another mode string) in its `[build]` table. All files without an explicit `@mode` inherit the project mode. When no project mode is declared, the implicit mode is `host.scripted`.

### §2.5.3 Tooling Semantics

Tools MUST use the `@mode` declaration to determine:

- **Syntax highlighting profile.** `freestanding` enables `asm`, `@interrupt`, `@volatile`, etc. `host.native` and `host.dual` enable `weak`, `arc let`, `@signalSafe`. All modes except `freestanding` enable template fences, the ownership verb system, and compile-time ownership keywords (`borrow`, `unique`, `lifetime ~name`, etc.). `host.*` modes enable host-capability APIs; `web.*` modes do not.
- **Lint rule set.** Per-mode and per-family lint rules are enforced. `freestanding` adds hardware-safety lints (`no-float-in-freestanding`). `web.*` adds no-host-capability lints. AOT modes add `W_ANY_IN_AOT_MODE` advisory.
- **Completion menus.** Only features available in the file's declared mode appear in completion suggestions.
- **Error display.** Errors referencing features unavailable in the current mode include the mode name and the mode(s) that would permit the feature.

### §2.5.4 Mode-Related Error Codes

*(This subsection catalogs error codes introduced by the six-mode system. The complete error catalog appears in §26.)*

| Code | Severity | Condition |
|---|---|---|
| `E_MODE_POSITION` | error | `@mode` directive appears after other non-comment tokens |
| `E_MODE_DUPLICATE` | error | Multiple `@mode` directives in a single file |
| `E_MODE_UNKNOWN` | error | Unrecognized mode name (not one of the six) |
| `E_MODE_TARGET_MISMATCH` | error | File `@mode` is incompatible with the build `--target` (§2.5.2) |
| `E_MAIN_GUARD_NOT_APPLICABLE` | error | `__name__ == "__main__"` guard used in a mode other than `host.scripted` — web modes have no direct-execution disposition; AOT modes prohibit top-level control flow |
| `E_TOPLEVEL_CONTROL_AOT` | error | `if`, `while`, `for`, `match`, or expression statement at file top level in `host.dual`, `host.native`, `web.compiled`, or `freestanding` — these modes have no sequential top-level execution model |
| `E_CAPABILITY_NOT_WEB` | error | Host-environment API (`runtime.fs`, `runtime.proc`, `runtime.net` host variants, `ThreadLocal[T]`) used in a `@mode(web.*)` file |
| `E_NATIVE_ONLY_IN_DUAL` | error | Feature that cannot round-trip JIT↔AOT (`asm { }`, `native.simd`, `@vectorize`, raw memory APIs) used in `@mode(host.dual)`; use `host.native` instead |
| `W_ANY_IN_AOT_MODE` | warning | `Any`, `dynamic class`, or `core.inspect` used in an AOT mode (`web.compiled`, `host.dual`, `host.native`) — generates tagged-dispatch code with runtime cost. Advisory only; promote with `--warnings-as-errors=W_ANY_IN_AOT_MODE` |

Error codes specific to a single mode are cataloged in that mode's specification section: §22 (web modes), §23 (host modes), §24.22 (freestanding).

---

## §2.6 Mode Feature Matrix

*(This section is normative with respect to feature availability.)*

Column key: **w.s** = `web.scripted`, **w.c** = `web.compiled`, **h.s** = `host.scripted`, **h.d** = `host.dual`, **h.n** = `host.native`, **fs** = `freestanding`.

| Feature | w.s | w.c | h.s | h.d | h.n | fs |
|---|---|---|---|---|---|---|
| Dynamic typing (`Any`, untyped params) | ✓ | ⚠ | ✓ | ⚠ | ⚠ | ✗ |
| `dynamic class` | ✓ | ⚠ | ✓ | ⚠ | ⚠ | ✗ |
| `core.inspect` (live type registry) | ✓ | ⚠ | ✓ | ⚠ | ⚠ | ✗ |
| Runtime memory management | ARC¹ | ARC¹ | ARC¹ | ARC¹ | ARC | manual (`@allocator`) |
| `local class` (default `class`) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `shared class` (cross-thread, cross-mode) | ✓ | ✓ | ✓ | ✓ | ✓ | ⚠² |
| `SharedRef[T]` / `SharedBuffer[T]` / `SharedArray[T]` | ✓ | ✓ | ✓ | ✓ | ✓ | ⚠² |
| `core.atomic` operations | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ (subset) |
| `SharedMutex[T]` / `SharedRwLock[T]` / `SharedQueue[T]` | ✓ | ✓ | ✓ | ✓ | ✓ | ⚠² |
| `Serializable` / `Deserializable` (§32) | ✓ | ✓ | ✓ | ✓ | ✓ | ⚠³ |
| `@polymorphic` / `@tagged` / `@sealed` | ✓ | ✓ | ✓ | ✓ | ✓ | ⚠³ |
| `@serialField` / `@alias` / `@skip` / `@sensitive` | ✓ | ✓ | ✓ | ✓ | ✓ | ⚠³ |
| `@serializationId` / `@migrateFrom` | ✓ | ✓ | ✓ | ✓ | ✓ | ⚠³ |
| `core.serialization.Value` | ✓ | ✓ | ✓ | ✓ | ✓ | ⚠³ |
| `RemoteException` / Exception serialization | ✓ | ✓ | ✓ | ✓ | ✓ | ✗⁴ |
| `arc let` / `arc var` (advisory pinning) | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |
| `weak` references¹ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |
| `unique let` / `unique var` / `unique class` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `borrow` / `excl borrow` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `borrow[~name]` / `lifetime ~name` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `noescape fn` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `unowned[~name]` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `MaybeUninit[T]` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `reinterpret[T, U]` / `reinterpretChecked[T, U]` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `PartialInit[T]` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `reads` / `edits` / `takes` / `shares` verbs | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `modifier` method keyword | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ (`unique` class only) |
| `safe {}` / `safe func` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `synchronized` class | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |
| `distinct()` in `requires` clause | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `atomic {}` block | ✓ | ✓ | ✓ | ✓ | ✗ (use `synchronized`/`Mutex`) | ✗ (use `InterruptGuard`) |
| `async` / `await` | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |
| `throw` / `try` / `catch` | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |
| Template fences | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |
| Reactive UI (`ui.*`) | ✓ (`ui.web`) | ✓ (`ui.web`) | ✓ (`ui.desktop`) | ✓ (`ui.desktop`) | ✓ (`ui.desktop`) | ✗ |
| `@webcomponent` / Web Components | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| `core.reflect` | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |
| `runtime.compile` (dynamic JIT) | ✓ | ✓ | ✓ | ✓ | ✓ (embedded JIT) | ✗ |
| `runtime.fs` / `runtime.proc` / `runtime.net` (host) | ✗ | ✗ | ✓ | ✓ | ✓ | ✗ |
| `from X defer import` (deferred type stubs) | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |
| Sequential top-level execution | ✗ | ✗ | ✓ | ✗ | ✗ | ✗ |
| `__name__ == "__main__"` guard | ✗ | ✗ | ✓ | ✗ | ✗ | ✗ |
| `main()` entry-point convention | ✗ | ✗ | ✗ | ✓ | ✓ | ✗ |
| `@entry` annotation | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ |
| `asm { }` inline assembly | ✗ | ✓ (Wasm, `@unsafe`) | ✗ | ✗ | ✓ (native, `@unsafe`) | ✓ |
| `@volatile` / `Volatile[T]` | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ |
| `@interrupt` / `@naked` / `@callconv` | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ |
| `@entry` / `@panic_handler` | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ |
| `@allocator` / `@deallocator` | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ |
| `@repr` / `@align` / `@section` | ✗ | Wasm subset | ✗ | ✗ | ✗ | ✓ |
| Overflow arithmetic methods | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `--overflow=trap` flag | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ |
| `Sendable` interface | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `for`-loop implicit borrow guard | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `gen func` (synchronous generators) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ (needs `@allocator`) |
| `async gen func` (async generators) | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |
| Macros (`macro` / `pub macro` / `name!(args)`) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `@interruptSafe` annotation | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ |
| `InterruptGuard` — interrupt-masking scope | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ |
| `PinnedRef[T]` — ARC-pinned FFI lifetime anchor | ✗ | ✗ | ✗ | ✓ | ✓ | ✗ |
| `NativeHandle` / `OwnedHandle` / `BorrowedHandle` | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ |
| `@lockOrder(n)` — lock ordering annotation | ✗ | ✗ | ✗ | ✓ | ✓ | ✗ |
| `DmaBuffer[T]` — ownership-mapped DMA | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ |
| `native.atomic.hwFence(order)` — hardware barrier | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ |
| `native.mpu` — MPU stack-guard API | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ |
| `native.dma` — DMA ownership API | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ |
| `native.simd` / `Vec[T, N]` / `@vectorize` | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ |
| `native.mem.alloc` / `native.mem.free` | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ |
| `ThreadLocal[T]` | ✗ | ✗ | ✗ | ✓ | ✓ | ✗ |
| `Thread` / `ThreadPool` | ✗ | ✗ | ✗ | ✓ | ✓ | ✗ |
| `portal` statements | ✓ (`--debug`) | ✓ (`--debug`) | ✓ (`--debug`) | ✓ (`--debug`) | ✓ (`--debug`) | ✓ (`--debug` + channel) |
| Freestanding debug service (§24.25) | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ |
| Time-travel replay (§24.25.9) | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ (`--debug` + enabled) |
| `@debug_control_channel` / `@debug_trace_channel` | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ |
| `--stack-size N` build flag | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ (via `.lppkg`) |
| `@signalSafe` annotation | ✗ | ✗ | ✗ | ✓ | ✓ | ✗ |
| `extern native` — C FFI declarations | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ |
| `portal_ring_size` — time-travel ring buffer | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ (`--debug`) |
| `spawnBlocking` | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |
| `ScriptWorker` / `WorkerChannel[T]` | ✓ | ✓ | ✓ | ✓ | ✓ (embedded Wasm) | ✗ |
| Work-stealing multi-threaded executor | ✗ | ✗ | ✗ | ✓ | ✓ | ✗ |

**Legend:**

- ✓ — Feature is available.
- ✗ — Feature is not available; use is a compile-time error.
- ⚠ — Feature is available but produces the `W_ANY_IN_AOT_MODE` lint advisory (AOT modes generate tagged-dispatch code with runtime cost).

**Footnotes:**

1. **ARC memory model.** All modes present the ARC-equivalent observable contract described in §8.1.1 for `local class` and `shared class`. Scripted and web modes are permitted to back `local class` with Wasm GC as an implementation optimization; see §8.1.1.1 for the non-normative implementation allowance. `shared class` and `SharedRef[T]` always use atomic reference counting regardless of mode.

2. **Freestanding shared-memory features.** In `@mode(freestanding)`, `shared class` and `SharedRef[T]` are available only when the target provides a `@allocator`-backed arena satisfying the shared-arena header contract (§17b.5). Targets without multi-core coherent memory or without an arena implementation produce `E_SHARED_ALLOCATOR_UNAVAILABLE` at the first `shared` allocation site. Atomic operations are always available but map to target-specific instructions (see §17b.4).

3. **Freestanding serialization features.** In `@mode(freestanding)`, the serialization trait surface is available but depends on an allocator for dynamically-sized `Value` content (`List`, `Map`, `String`, `Bytes`). Targets without a heap-capable `@allocator` may implement a restricted serialization subset limited to fixed-layout primitives and enums; wire-format packages declare their allocator requirements in `.lppkg`.

4. **No `RemoteException` in freestanding.** Freestanding targets have no `BaseException` hierarchy (exceptions are unavailable per §2.6 row for `throw`/`try`/`catch`); consequently no `RemoteException` is meaningful. Freestanding code that receives serialized exception data through a communication channel must handle exception-typed payloads explicitly at the application layer.

---

## §3 Lexical Structure

*(This section is normative.)*

### §3.1 Source Encoding

All Loup source files SHALL be encoded in UTF-8. A byte order mark (BOM) at the start of a file is permitted but not required; if present, it is ignored. Source files that are not valid UTF-8 produce a compile-time error (`E_INVALID_UTF8`).

| Code | Mode | Condition |
|---|---|---|
| `E_INVALID_UTF8` | All | Source file contains byte sequences that are not valid UTF-8 |

### §3.2 Comments

Loup supports three comment forms:

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

Comments are lexically transparent: for any valid Loup program, removing all comments SHALL produce an AST identical to the original program's AST. Comments do not affect parsing, type-checking, or execution.

### §3.3 Statement Termination

Loup uses **newline-terminated statements**. A statement ends at the newline following its last token. An explicit semicolon (`;`) may be written at the end of any simple statement for style or compatibility but is not required:

```loup
let x = 42       // valid — newline terminates
let y = 43;      // also valid — explicit semicolon
```

The reference formatter (§28.4) preserves semicolons as written. Block statements (those ending in `}`) never take a trailing semicolon.

**Continuation lines.** An expression that ends with a binary operator, open bracket, or comma automatically continues on the next line without a statement boundary:

```loup
let total = a +
            b        // continuation — no new statement here
```

### §3.4 Keywords and Reserved Words

The following identifiers are keywords and SHALL NOT be used as variable, function, type, or module names:

```
abstract   and        as         async      await      bnot       borrow
break      catch      class      continue   defer      del
do         dynamic    else       enum       extern     false
finally    fn         for        from       func       gen
global     if         implements import     in
instanceof interface  is         let        lifetime   macro      match      new
namespace  noescape   nonlocal   none       not        or         portal
prefer     pub        return     spawn      static     super
struct     suspend    throw      true       try        type       Self
this       typeof     unique     var        while      with       yield      consume
arc        operator
reads      edits      takes      shares     modifier   safe
synchronized unsafe   requires   atomic
```

The following identifiers are **reserved for future use** and SHALL NOT be used as user identifiers:

```
where      trait      module     package
override   final      sealed     volatile
```

**Contextual keywords.** The following identifiers have special meaning only in specific syntactic positions and may be used as ordinary identifiers elsewhere:

- `self` — contextual in closure capture lists (`[weak self]`, `[unowned self]`) as an alias for the enclosing method's implicit `this` receiver; also valid as an ordinary identifier (e.g., first parameter name in UFCS-style functions: `func map(self: Iterable[T], ...)`)
- `get` — contextual as a property-getter declaration keyword (`get propName(): T { ... }`, §7.7); valid as an ordinary identifier (e.g., method name `func get(key: K): V`) in all other positions
- `set` — contextual as a property-setter declaration keyword (`set propName(v: T) { ... }`, §7.7); valid as an ordinary identifier (e.g., method name `func set(value: T): void`) in all other positions
- `quote` — contextual as the macro body keyword (`macro name(p) { quote { ... } }`, §25, §27.11); valid as an ordinary identifier elsewhere
- `box` — contextual in prefix expression position (`box expr`); makes widening to `Any` explicit. Permitted in all modes except `@mode(freestanding)`, where it is `E_BOX_IN_FREESTANDING`; in `@mode(web.compiled)`, `@mode(host.dual)`, and `@mode(host.native)` it emits the `W_ANY_IN_AOT_MODE` advisory. Valid as an identifier elsewhere.
- `group` — contextual in `await group { ... }`
- `once` — contextual in debug activation requests
- `distinct` — contextual in `requires distinct(...)` clauses and call-site contract acknowledgments (§23.4.10)
- `excl` — contextual immediately before `borrow` in parameter declarations (`excl borrow param: StructType`); see §23.4.1.1
- `compiled`, `native`, `scripted`, `dual`, `freestanding` — contextual in `@mode(X)` directives and `prefer compiled` import clauses; valid identifiers elsewhere
- `reinterpret` — contextual in `reinterpret[T, U](expr)` expressions; available in all modes (§2.6); requires `@unsafe` (§24.18)
- `reinterpretChecked` — contextual in `reinterpretChecked[T, U](expr)` expressions; available in all modes (§2.6); no `@unsafe` required; returns `Result[U, AlignmentError]` (§24.18)
- `size_of` — contextual in `size_of[T]()` expressions; `@mode(host.native)` and `@mode(freestanding)` (§24.4.1)
- `align_of` — contextual in `align_of[T]()` expressions; `@mode(host.native)` and `@mode(freestanding)` (§24.4.1)
- `from` — although `from` is a hard keyword (used in import statements §13.1 and `throw ... from ...` chaining §6.9), it is additionally permitted as a **method name** in method-declaration headers and in method-call position after `.` (e.g., `static func from(err: E): Self` declarations and `F.from(e)` calls on the `From[E]` interface, §11.2). This carve-out is limited to method-name position only; `from` remains reserved as a field name, variable name, parameter name, type name, or module name.

**Dunder identifiers.** Identifiers beginning and ending with double underscores (`__name__`, `__file__`, `__execmode__`) are reserved for language-defined module introspection variables. User code SHALL NOT declare bindings with dunder names.

**`borrow`** is a parameter modifier keyword and field qualifier keyword. It is permitted in all execution modes (§2.6). See §23.4.1.

**`lifetime`** is a lifetime-parameter keyword. It is used only in the `[...]` generic-parameter brackets of functions, structs, enums, and interfaces to declare a named region. `lifetime` is permitted in all execution modes (§2.6).

**Lifetime labels.** A lifetime label is a lowercase identifier prefixed with the `~` sigil (e.g. `~src`, `~origin`). The `~` sigil is used exclusively for lifetime labels and may not appear in any other context. Lifetime labels are not identifiers — they cannot be used as variable names, type names, or in any position other than `[lifetime ~name]` declarations and `borrow[~name]` references. `~static` is a reserved lifetime label with special semantics (see §7.1, §23.4.2); it may not be declared as a user lifetime parameter.

**`unique`** is a binding and field qualifier keyword. `unique let`/`unique var` declares a single-owner binding for a class instance with no ARC reference counting. `unique var` on a struct field declares a uniquely-owned class field. `unique` is permitted in all execution modes (§2.6). See §23.4.7.

**`consume`** is a unary expression keyword. `consume expr` explicitly downgrades a `unique` binding to a regular ARC-managed reference, transferring ownership and consuming the source binding. `consume` requires an ARC runtime to transfer ownership into, so it is permitted only in `@mode(host.native)` and `@mode(host.dual)`. Using `consume` in `@mode(host.scripted)`, `@mode(web.scripted)`, `@mode(web.compiled)`, or `@mode(freestanding)` is a compile-time error (`E_CONSUME_NOT_AVAILABLE`). Applying `consume` to a non-`unique` binding is `E_CONSUME_NON_UNIQUE`. See §23.4.7.

**`noescape`** is a function type modifier keyword. It is permitted as a modifier on `fn` types in all execution modes (§2.6).

**`prefer`** is a keyword used in the two-token sequence `prefer compiled`, valid only in import statements (see §13.1). `prefer` is a reserved keyword and SHALL NOT be used as an identifier.

**`reads`, `edits`, `takes`, `shares`** are ownership transfer verb keywords. They are used as parameter modifiers in function and method declarations, and as call-site acknowledgment labels. `reads` is the implicit default for parameters declared without any verb. Available in all execution modes. See §23.4.9.

**`modifier`** is a method declaration keyword. `modifier` declares a class method that writes `var` fields on `self`. Available in all execution modes; not valid on struct methods (`E_MODIFIER_ON_STRUCT`). See §23.4.11.

**`safe`** is a context keyword. `safe {}` introduces a safe context for its lexical scope; `safe func` declares a function that both requires and provides a safe context. Available in all execution modes. See §23.4.12.

**`synchronized`** is a class declaration modifier. `synchronized class` equips each instance with a per-instance mutex that serializes all `modifier` method invocations. Available in `@mode(web.scripted)`, `@mode(web.compiled)`, `@mode(host.scripted)`, `@mode(host.dual)`, and `@mode(host.native)`. Not available in `@mode(freestanding)` (`E_SYNCHRONIZED_FREESTANDING`). See §23.4.13.

**`unsafe`** is the lock-release block keyword within `synchronized` modifier methods. `unsafe("reason") { ... }` releases the per-instance lock for the block's duration. Valid only inside a `modifier` method body on a `synchronized` class (`E_UNSAFE_NOT_SYNCHRONIZED` otherwise). Available wherever `synchronized` is available — `@mode(web.scripted)`, `@mode(web.compiled)`, `@mode(host.scripted)`, `@mode(host.dual)`, and `@mode(host.native)`. See §23.4.14.

**`requires`** is a contract clause keyword. A `requires` clause appears after the parameter list of a function or method declaration and before the return type. Available in all execution modes. See §23.4.10.

**`atomic`** is a block keyword. `atomic { ... }` introduces a cooperative atomicity scope that the compiler verifies contains no suspension points (`await`, `for await`, `spawn`). Available in `@mode(web.scripted)`, `@mode(web.compiled)`, `@mode(host.scripted)`, and `@mode(host.dual)`; usage in `@mode(host.native)` or `@mode(freestanding)` is `E_ATOMIC_NOT_WASM` (use `synchronized`/`Mutex` or `InterruptGuard` instead). See §17.7.

**`reinterpretChecked`** is a contextual expression keyword. `reinterpretChecked[T, U](expr)` reinterprets the bit pattern of a value of type `T` as type `U`, with a runtime alignment check that returns `Result[U, AlignmentError]` rather than requiring `@unsafe`. Available in all modes (§2.6). See §24.18.

### §3.5 Identifiers

An identifier is a sequence of Unicode letters, digits, and underscores that does not begin with a digit:

```
Identifier    ::= IdentStart { IdentContinue }
IdentStart    ::= UNICODE_LETTER | "_"
IdentContinue ::= UNICODE_LETTER | UNICODE_DIGIT | "_"
```
*(Canonical grammar in §27.1. `UNICODE_LETTER` = any Unicode letter or underscore;
`UNICODE_DIGIT` = any Unicode decimal digit.)*

Identifiers are case-sensitive. By convention:

- **Lowercase** names are used for variables, functions, parameters, and primitive types (`int`, `float`, `bool`, `char`, `string`, `bytes`).
- **PascalCase** names are used for classes, interfaces, enums, structs, type aliases, and type parameters (`MyClass`, `Option[T]`, `Task[T]`).
- **SCREAMING_SNAKE_CASE** is used for constants by convention but is not enforced by the language.

### §3.6 Literals

#### Integer Literals

Integer literals represent values of type `int`. Loup supports four bases:

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

The suffix is case-sensitive. A value that does not fit in the declared type is a compile-time error (`E_LITERAL_OVERFLOW`).

The `int` type is a signed 64-bit integer (range: −2⁶³ to 2⁶³−1). Integer overflow behaviour is specified in §4.1.1.

**Explicit conversions.** See §4.1.2 for the full conversion function set. Mixed `int`/`float` arithmetic promotes the `int` operand automatically (see §3.7).

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

Loup supports three standard forms of string literals: **normal strings**, **interpolated strings**, and **raw strings**. All strings are UTF-8 encoded sequences of Unicode scalar values.

**Normal Strings**
Normal strings are delimited by double quotes (`"`) or single quotes (`'`). They process escape sequences but **do not** evaluate inline expressions (`{$...$}`).

```
"hello, world"
'single-quoted string'
"line one\nline two"
```

**Interpolated Strings**
Interpolated strings process escape sequences and evaluate inline expressions. They are prefixed with `i`:

```
let name = "Alice";
i"hello, {$ name $}"
i'single-quoted with {$ 42 $}'
```

**Raw Strings**
Raw strings process neither escape sequences nor inline expressions. They are prefixed with `r`:

```
r"no \n escape here"
r'C:\Users\name\file.txt'
r"backslashes are literal\"
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

```loup
let a: char = c"A";
let newline: char = c"\n";
let snowman: char = c"☃";
let hi: char = c"\u{1F600}";    // 😀
```

`char` literals support the same escape sequences as string literals. The `\xHH` escape is not permitted in `char` literals — use `\u{HH}` instead (`E_CHAR_LITERAL_INVALID`). A `char` literal containing zero Unicode scalar values or more than one is also `E_CHAR_LITERAL_INVALID`:

```loup
let bad1: char = c"";    // E_CHAR_LITERAL_INVALID: empty char literal
let bad2: char = c"ab";  // E_CHAR_LITERAL_INVALID: multiple scalar values
```

A `char` value is not implicitly coercible to `string`. Use `c.toString()` or string interpolation `i"{$ c $}"` to convert.

#### Boolean Literals

The boolean type `bool` has exactly two values: `true` and `false`.

### §3.7 Operators

Loup defines the following operators, listed from highest to lowest precedence. Operators at the same precedence level associate as indicated.

| Precedence | Operator(s) | Description | Associativity |
|---|---|---|---|
| 1 | `()` `[]` `.` `?.` `!{}` `?.[` | Call, index, member access, safe nav, dynamic access, null-safe index | Left |
| 2 | `typeof` | Type-of operator | Prefix |
| 3 | `-` (unary) `not` `!` `bnot` | Unary negation, logical not, bitwise not | Prefix |
| 4 | `box` `consume` | Boxing/widening (`box`); unique-to-ARC downgrade (`consume`, `@mode(host.native)` or `@mode(host.dual)`) | Prefix |
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
| 23 | `=` `+=` `-=` `*=` `/=` `//=` `%=` `**=` `<<=` `>>=` `&=` `\|=` `^=` | Assignment | Right |
| 24 | `*` `**` (prefix, spread) | Spread | Prefix |

**Arithmetic operators** (`+`, `-`, `*`, `/`, `//`, `%`, `**`) operate on `int` and `float`. Mixed `int`/`float` arithmetic promotes the `int` operand to `float`. Division of two `int` values (`/`) produces `int` (truncating toward zero); `//` is floor division — it truncates toward negative infinity and always returns the same type as its operands (`int // int` → `int`, `float // float` → `float`, `bigint // bigint` → `bigint`, `decimal // decimal` → `decimal`). The `+` operator also concatenates `string` values and `list` values.

**Comparison operators** (`<`, `>`, `<=`, `>=`) operate on types that implement the `Comparable[T]` interface. Primitives (`int`, `float`, `string`) are comparable by default.

**Equality operators** (`==`, `!=`) use structural equality for primitives, enums, structs, and tuples. For class instances, `==` compares by reference identity unless the class overrides equality via the `Equatable[T]` interface (see §5.1, §11.2). Equality is reflexive (`a == a`), symmetric (`a == b` implies `b == a`), and transitive.

**Logical operators** (`and`/`&&`, `or`/`||`, `not`/`!`) operate on `bool` values. `and` and `or` are short-circuit: the right operand is not evaluated if the left operand determines the result.

**Canonical style.** The keyword forms `and`, `or`, and `not` are the idiomatic Loup style. The symbol aliases `&&`, `||`, and `!` are legal and semantically identical but are considered non-canonical. The reference formatter (§28.4) rewrites symbol forms to keyword forms. Code using symbol forms is accepted by the compiler but produces a lint advisory (`symbol-logical-ops`) that can be suppressed per-line with `// loup:allow(symbol-logical-ops)`. New code should use keyword forms exclusively. This rule applies uniformly in scripted mode, compiled mode, and template fence expressions.

**User-defined operator overloading** is supported via the operator interface protocol. See §5.1 for desugar rules and §11.2 for the full operator interface set.

**Cast operators** (`as`, `as?`) perform narrowing from `Any` to a concrete type. `expr as T` throws `TypeError` on mismatch; `expr as? T` returns `Option[T]`. See §4.3.

**`box` operator** widens a value type to `Any`. See §4.3.

### §3.8 Collection Literals

Loup provides literal syntax for the built-in collection types:

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

Loup is a statically-typed language with type inference. Every value has a type known at compile time. The type system supports primitives, classes, interfaces, enums, structs, tuples, union types, generics, and function types.

### §4.0 Core Numeric Trait Interfaces (v1.18)

The following marker interfaces live in the `core` namespace and are
automatically implemented by built-in numeric types. They serve as trait
bounds for generic numeric code.

```loup
namespace core;

// Marker trait for fixed-width integer primitives.
// Implemented by: int8, int16, int32, int64, uint8, uint16, uint32, uint64.
// Explicitly NOT implemented by `bigint` (no fixed width).
pub interface Integer {}

// Marker trait for IEEE 754 floating-point primitives.
// Implemented by: float32, float64.
pub interface Float {}

// Union marker — implemented by every primitive with fixed-width numeric
// semantics (all Integer types + all Float types + `decimal` for its
// fixed-precision variants).
pub interface Numeric {}
```

These interfaces have empty bodies — they carry no methods. Their purpose
is to gate generic code on the type category (e.g., the atomic RMW
operations in §17b.4 require `T: Integer + Shareable`). They are declared
in §4 rather than being introduced inline at each use site to avoid the
appearance of ad-hoc per-operation trait invention.

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
| `uint` | Pointer-sized unsigned integer (alias for `uint64` on 64-bit targets, `uint32` on 32-bit) | Platform | 0 to 2ⁿ−1 |
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

`int` is an alias for `int64`. `float` is an alias for `float64`. `uint` is an alias for `uint64` on 64-bit targets and `uint32` on 32-bit targets — it is the platform-native pointer-sized unsigned integer used for raw addresses in `@mode(host.native)` and `@mode(freestanding)` (`native.mem`, `native.atomic`, `@allocator`, `native.ffi.ptrAdd`). Using `int` and `float` is preferred for general-purpose numeric work; the explicit-width names exist for systems programming, FFI, and numerical computing requiring specific memory layouts.

"Passed by value" refers to the language's assignment/call semantics. The runtime may use efficient representations (handles, copy-on-write, etc.) as long as observable semantics match.

#### §4.1.1 Fixed-Width Integer Overflow

In scripted modes (`@mode(web.scripted)`, `@mode(host.scripted)`) and Wasm targets (`@mode(web.compiled)`), arithmetic on fixed-width integer types (`int8`, `int16`, `int32`, `int64`, `uint8`, `uint16`, `uint32`, `uint64`) that would overflow the type's range is a `NumericOverflowError` at runtime. `@mode(host.dual)` uses the same checked semantics as scripted modes for fixed-width integers.

In `@mode(host.native)` and `@mode(freestanding)`, the default is **wrapping arithmetic**: overflow silently wraps at the type boundary (two's complement for signed types, modular for unsigned). This is the C-compatible behavior required for systems programming and SIMD work.

`int` / `int64` are an exception in `@mode(host.native)`: they default to **checked arithmetic** (throwing `NumericOverflowError` on overflow), matching scripted-mode and `@mode(host.dual)` semantics. `uint` follows the same rule as other fixed-width unsigned integers — it wraps by default in `@mode(host.native)` and `@mode(freestanding)`. In `@mode(freestanding)`, exceptions are unavailable, so `int` / `int64` wrap on overflow the same as other fixed-width integers — use `--overflow=trap` to trap instead, or `checkedAdd` / `saturatingAdd` for explicit overflow handling. Use `@overflowWrapping` on a function to opt into wrapping for all fixed-width arithmetic within it. When `--overflow=trap` is also set, `@overflowWrapping` on a function overrides the trap flag for that function's body — the function uses wrapping arithmetic regardless of the project-wide trap setting:

```loup
@mode(host.native)
@overflowWrapping
func addWrapping(a: int32, b: int32): int32 {
  return a + b;   // wraps silently on overflow
}
```

**Explicit checked and saturating arithmetic.** All fixed-width integer types provide methods for explicit overflow handling regardless of the ambient mode:

```loup
let a: int32 = 2_147_483_647i32;
let b: Option[int32] = int32.checkedAdd(a, 1);  // Option[int32] — None on overflow
let c: int32 = int32.saturatingAdd(a, 1);       // int32 — clamps to 2_147_483_647
let d: int32 = int32.wrappingAdd(a, 1);         // int32 — wraps to -2_147_483_648
```

`bigint` and `decimal` never overflow — they grow as needed.

#### §4.1.2 Numeric Conversions

All narrowing conversions between numeric types are **explicit** — no implicit narrowing. The compiler emits a type error if a narrower type is assigned from a wider type without an explicit conversion call.

**Implicit widenings (no call required):**
- Signed integer widenings: `int8` → `int16` → `int32` → `int64` (`int`) → `bigint`
- Unsigned integer widenings: `uint8` → `uint16` → `uint32` → `uint64` (`uint` on 64-bit) → `bigint`
- Float widening: `float32` → `float64` (`float`)
- Any integer or float → `decimal`

**Explicit conversion functions:**

```loup
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

**Mixed-type arithmetic.** In expressions mixing `int` and `float`, the `int` operand is promoted to `float` automatically. All other mixed combinations are compile-time errors (`E_NUMERIC_TYPE_MISMATCH`) — use an explicit conversion.

| Code | Mode | Condition |
|---|---|---|
| `E_NUMERIC_TYPE_MISMATCH` | All | Mixed arithmetic between numeric types other than `int`/`float` without an explicit conversion (e.g. `int8 + int32`, `bigint + int`) |

#### §4.1.3 `bigint` — Arbitrary-Precision Integer

`bigint` is an arbitrary-precision signed integer. Values grow without bound, limited only by available memory. This matches the behavior of Python's `int` built-in and JavaScript's `BigInt`.

**Literal syntax.** Append `n` to any integer literal:

```loup
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

**Availability.** `bigint` is available in all modes except `@mode(freestanding)` — specifically `@mode(web.scripted)`, `@mode(web.compiled)`, `@mode(host.scripted)`, `@mode(host.dual)`, and `@mode(host.native)`. On native targets it is backed by a multi-precision library (GMP-compatible). On Wasm it is emulated in software. `bigint` is **not available** in `@mode(freestanding)` — no multi-precision runtime library is linked (`E_FREESTANDING_RUNTIME`). Use fixed-width integer arithmetic with `checkedAdd`/`wrappingAdd` for overflow control instead.

#### §4.1.4 `decimal` — Arbitrary-Precision Decimal

`decimal` is an arbitrary-precision decimal floating-point type. Unlike `float` and `float32`, `decimal` can exactly represent base-10 fractions: `0.1d + 0.2d == 0.3d` is `true`.

Based on the IEEE 754-2019 decimal128 arithmetic model. Suitable for financial calculations, currency, and scientific work requiring exact decimal semantics.

**Literal syntax.** Append `d` to any numeric literal, or construct from a string for values beyond literal range:

```loup
let price: decimal = 19.99d;
let rate:  decimal = 0.075d;
let pi:    decimal = decimal("3.14159265358979323846264338327950288");
```

**Supported operations:** all arithmetic operators, all comparisons. Division is exact (produces a `decimal` result with full precision). `//` is floor division (truncates toward −∞) returning `decimal`. The result is a `decimal` value with zero fractional part, not an `int`.

**Availability.** `decimal` is available in all modes except `@mode(freestanding)` — specifically `@mode(web.scripted)`, `@mode(web.compiled)`, `@mode(host.scripted)`, `@mode(host.dual)`, and `@mode(host.native)`. `decimal` is **not available** in `@mode(freestanding)` — no decimal runtime library is linked (`E_FREESTANDING_RUNTIME`). Performance is substantially slower than `float` — use `float` for numerical computing and `decimal` where exactness of base-10 fractions is required.


#### §4.1.5 `char` — Unicode Scalar Value

`char` is a primitive type representing a single Unicode scalar value. It is the element type of `string` — produced by indexing (`s[i]`) and iteration (`for c in s`).

**Valid range.** A `char` holds a Unicode code point in the range U+0000–U+10FFFF, excluding the surrogate range U+D800–U+DFFF. All 1,112,064 valid scalar values are representable. No runtime operation produces an out-of-range `char`.

**`char` is not `int` and not `string`.** Implicit conversion is prohibited in both directions:

```loup
let c: char = c"A";
let n: int    = c.toInt();         // 65  — explicit
let s: string = c.toString();      // "A" — explicit
let s2: string = i"{$ c $}";        // "A" — interpolation auto-converts

let c2: char  = char.of(65)?;      // Option[char]: Some(c"A")
let c3: char  = "hello"[0];        // char: c"h"
```

**Methods on `char`:**

```loup
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

**`char` in compiled mode.** All `char` operations are available in compiled mode. `char` maps to `i32` in Wasm GC and to `uint32_t` at the C ABI boundary. The companion box type `Char` (§4.2) is ABI-internal.

| Code | Mode | Condition |
|---|---|---|
| `E_CHAR_LITERAL_INVALID` | All | `c"..."` literal contains zero or more than one Unicode scalar value |

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

Implicit widening is available in all modes where `Any` is available. In `@mode(web.compiled)`, `@mode(host.dual)`, and `@mode(host.native)`, `Any` is permitted with the `W_ANY_IN_AOT_MODE` advisory (§2.4.2). In `@mode(freestanding)`, `Any` is entirely prohibited, so implicit widening never activates in that mode except at the specific error-boundary positions where `Option[Any]` is permitted.

**`box` keyword — explicit widening.** When the programmer wants to document that a value is deliberately crossing a type boundary, the `box` prefix keyword makes it explicit:

```
let a: Any = box 42;             // explicit widening of int → Any
let b: Any = box myStruct;       // explicit widening of struct → Any
let c: Any = box MyEnum.Variant; // explicit widening of enum → Any
```

`box expr` and implicit widening produce identical compiled output. `box` carries no additional runtime cost or semantics. `box expr` where `expr` is already `Any`-typed is a compile-time warning. `box` is a contextual keyword — special only in prefix expression position. In `@mode(freestanding)`, `Any` is entirely prohibited, so `box` is a compile-time error (`E_BOX_IN_FREESTANDING`); in `@mode(host.native)`, `box` is permitted but emits the `W_ANY_IN_AOT_MODE` advisory.

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

`as` and `as?` are available in all six modes. In `@mode(web.scripted)` and `@mode(host.scripted)`, both work freely since `Any` is unrestricted. In `@mode(web.compiled)`, `@mode(host.dual)`, and `@mode(host.native)`, they are valid for concrete type narrowing; uses at `Any` boundaries produce the `W_ANY_IN_AOT_MODE` advisory (§2.4.2). In `@mode(freestanding)`, `Any` is entirely prohibited — `as`/`as?` work for concrete narrowing (e.g., `value as int32`) but not for `Any`-typed boundaries.

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

```loup
fn(int, int): int                  // function taking two ints, returning int
fn(): void                         // function taking no args, returning void
fn(string): Task[int]              // function taking string, returning async task
async fn(string): int              // shorthand for fn(string): Task[int]
gen fn(int): Iterable[int]         // generator function type (shorthand for fn(int): Iterable[int])
async gen fn(string): AsyncIterable[string]  // async generator function type
noescape fn(int): void             // non-escaping function (all modes; see §2.6)
async noescape fn(string): int     // non-escaping async function
```

Function types are first-class: they can be stored in variables, passed as arguments, and returned from functions. See §7 for function declarations and lambdas.

**`noescape fn` — non-escaping function type.** The `noescape` modifier on a function type asserts that the function value will only be called within the current call frame and will not be stored, returned, or spawned into a task. This allows the compiler to elide the ARC retain/release on the closure and potentially stack-allocate its captured variables.

`noescape fn` is valid in all execution modes (§2.6). In modes with ARC (`@mode(host.native)`, `@mode(host.dual)`) it elides retain/release; in Wasm GC modes it enables escape-analysis-driven stack allocation of captures.

**Subtype rule.** `fn(T): R` is a subtype of `noescape fn(T): R` at call sites. A value of type `fn(T): R` may be passed where `noescape fn(T): R` is expected — the callee's contract is more restrictive, which is safe. The reverse is not true: a `noescape fn` value may not be widened to `fn`.

**Storage prohibition.** A value of type `noescape fn(T): R` may not be stored in any position whose lifetime extends beyond the current call frame: no class fields, no struct fields, no module-level bindings, no `let`/`var` whose scope outlives the frame. Attempting to store a `noescape fn` value is a compile-time error (`E_NOESCAPE_ESCAPE`).

**ARC semantics.** A `noescape fn` parameter is passed as a raw function pointer and captured environment pointer without ARC-retaining the closure object. For closures whose captures are all stack-resident values, the compiler may represent the entire closure on the stack with no heap allocation.

**Type aliases with `noescape fn`:**

```loup
type Predicate[T] = noescape fn(reads T): bool;
type Transform[T, R] = noescape fn(reads T): R;
type Mutator[T] = noescape fn(edits T): void;
type Action = noescape fn(): void;
```

These aliases are valid in all execution modes (§2.6).

| Code | Mode | Condition |
|---|---|---|
| `E_NOESCAPE_ESCAPE` | All | `noescape fn` value stored in a position that outlives the current call frame (field, module binding, spawn closure) |

**Verb modifiers in function types.** Each parameter position in a `fn(...)` type may carry an optional verb modifier. The verb is part of the type and determines the acknowledgment the caller must provide:

```loup
fn(reads Buffer): void               // explicit reads — same as fn(Buffer): void
fn(Buffer): void                     // implicit reads — equivalent to above
fn(edits Buffer): void               // caller must use edits: acknowledgment
fn(takes Buffer): void               // caller must use takes: acknowledgment
fn(reads Buffer, edits Buffer): void // mixed: first implicit-ok, second required
```

**Calling a verb-typed function.** When calling a value whose function type declares a verb modifier, the call site must provide the matching verb acknowledgment, exactly as it would for a named parameter:

```loup
let fill: fn(edits Buffer, uint8): void = func(edits buf, v) { ... }

fill(edits: myBuf, 0xFF)         // ✓ edits: acknowledgment — required
fill(myBuf, 0xFF)                // ✗ E_VERB_REQUIRED — edits must be acknowledged

let render: fn(reads Buffer): string = func(reads buf) { ... }

render(reads: myBuf)             // ✓ explicit reads acknowledgment
render(myBuf)                    // ✓ implicit reads — no acknowledgment needed
```

**Higher-order functions.** Verb-typed function parameters correctly express the ownership contract for callbacks:

```loup
func forEach(
  items: list[Buffer],
  body:  fn(reads Buffer): void
): void {
  for (item in items) {
    body(item)                    // ✓ implicit reads — no acknowledgment needed
    // body(reads: item)          // also valid — explicit reads
  }
}

func transform(
  src:  Buffer,
  dst:  Buffer,
  body: fn(reads Buffer, edits Buffer): void
) requires edits(dst): void {    // src is implicitly reads; no requires needed
  body(reads: src, edits: dst)
}
```

**Subtype rule for verb-typed functions.** The implicit `reads` equivalence applies to all function type forms that carry `FnTypeParamList`: `fn(T): R` and `fn(reads T): R` are the same type; `async fn(T): R` and `async fn(reads T): R` are the same type; `noescape fn(T): R` and `noescape fn(reads T): R` are the same type. No-verb is implicit `reads` in every position. A function declared with `reads` or without a verb on a given parameter is assignable to either form. `fn(edits T): R`, `fn(takes T): R`, and `fn(shares T): R` are each distinct types. None is a subtype of another, and none is a subtype of `fn(reads T): R` — calling semantics and ownership contracts differ. Exact verb matching is required for assignment compatibility of `edits`, `takes`, and `shares` function types. The same distinctness rules apply to `async fn` and `noescape fn` forms.

**`requires distinct()` in function types.** `requires` clauses with `distinct()` need to reference parameters by name. Function types use positional parameters without names, so `distinct()` contracts are not supported in function type positions. Express disjointness contracts at the declaration site of the function that accepts the callback, not in the function type itself.

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
    string(s) => i"string: {$ s $}",
    int(n)    => i"int: {$ n $}",
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

**Common methods.** Calling a method that is common to all types in the union is permitted without narrowing. Calling a method that exists on only some types is a compile-time error (`E_UNION_METHOD_PARTIAL`).

| Code | Mode | Condition |
|---|---|---|
| `E_UNION_METHOD_PARTIAL` | All | Method call on a union type where the method does not exist on all constituent types — requires narrowing first |

**Union types in compiled, native, and freestanding modes.** Union values are represented as tagged values where the tag identifies the active type. All constituent types must be statically known. `Any` is not permitted as a union member in these modes — all types in the union must be concrete and statically resolvable.

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
type Bad = list[Bad];   // E_TYPE_ALIAS_RECURSIVE: recursive type alias
```

| Code | Mode | Condition |
|---|---|---|
| `E_TYPE_ALIAS_RECURSIVE` | All | Type alias definition expands to itself, creating infinite expansion |

**Mode availability.** Type aliases are available in all six execution modes. The aliased type must conform to the respective mode's type restrictions (e.g., `Any` is not available as an alias target in `@mode(host.native)` or `@mode(freestanding)`; in `@mode(web.compiled)` it produces the `W_ANY_IN_AOT_MODE` advisory per §2.4.2).

### §4.7 `typeof` and `instanceof` Operators

Loup provides inline operators for type inspection as surface sugar over `core.reflect`:

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

**Compiled, native, and freestanding modes.** `typeof` is permitted in all compiled modes — it returns compile-time-baked `Type` metadata with no runtime overhead. `instanceof` is permitted for concrete types where the check resolves to a tag comparison or static type knowledge. In `@mode(freestanding)`, `core.reflect` is unavailable, so `typeof` and `instanceof` work only for compile-time-resolvable types — using them against `Any` or dynamic types is a compile-time error (`E_FREESTANDING_REFLECT`).

### §4.8 Generics

Loup supports generic type parameters on functions, classes, interfaces, enums, and structs:

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

Operators in Loup are defined on primitive types and may be extended to user-defined types through the `Comparable[T]` interface. This section specifies the semantics of every operator category.

#### Arithmetic Operators (`+`, `-`, `*`, `/`, `//`, `%`, `**`)

| Left | Op | Right | Result | Notes |
|---|---|---|---|---|
| `int` | `+` `-` `*` `/` `%` | `int` | `int` | `/` truncates toward zero; `%` follows truncation sign |
| `int` | `//` | `int` | `int` | Floor division — truncates toward −∞ (e.g. `-7 // 2 = -4`) |
| `float` | `+` `-` `*` `/` `%` | `float` | `float` | IEEE 754 double-precision arithmetic |
| `float` | `//` | `float` | `float` | Floor division toward −∞; same sign rules as `int` |
| `bigint` | `//` | `bigint` | `bigint` | Floor division toward −∞ |
| `decimal` | `//` | `decimal` | `decimal` | Floor division toward −∞; result has zero fractional part |
| `int` | any | `float` | `float` | The `int` operand is promoted to `float` |
| `float` | any | `int` | `float` | The `int` operand is promoted to `float` |
| `string` | `+` | `string` | `string` | Concatenation |
| `list[T]` | `+` | `list[T]` | `list[T]` | Concatenation (produces a new list) |
| `int` | `**` | `int` | `int` | Integer exponentiation; negative exponent is a runtime error |
| `float` | `**` | `float` | `float` | Floating-point exponentiation |

Unary `-` negates `int` and `float` values. Unary `+` is the identity on `int` and `float`.

Division by zero (`/` or `%` with a zero right operand) throws a runtime error for `int` and produces IEEE 754 infinity or NaN for `float`. Floor division (`//`) by zero is also a runtime error for integer types; for `float`, it returns `±Infinity` or `NaN` per IEEE 754.

**`/` vs `//`:** `/` truncates toward zero (`-7 / 2 = -3`); `//` truncates toward negative infinity (`-7 // 2 = -4`). For positive operands both produce the same result.

#### Comparison Operators (`<`, `>`, `<=`, `>=`)

Comparison operators are available on types that implement the `Comparable[T]` interface (see §11.2):

```
interface Comparable[T] : Equatable[T] {
  func compareTo(other: T): int;
  // Default == provided automatically; may be overridden by operator func ==
  operator func ==(other: T): bool { return compareTo(other) == 0; }
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

User-defined classes and structs may implement `Comparable[T]` to enable comparison operators. If a comparison operator is applied to a type that does not implement `Comparable[T]`, the compiler emits `E_NOT_COMPARABLE`.

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

Non-`bool` operands are a compile-time error (`E_LOGICAL_NOT_BOOL`). There is no truthy/falsy coercion.

#### Bitwise Operators (`&`, `|`, `^`, `bnot`, `<<`, `>>`)

Bitwise operators are defined on all integer types: `int`, `uint`, `int8`, `int16`, `int32`, `int64`, `uint8`, `uint16`, `uint32`, `uint64`. Both operands must have the same integer type; no implicit promotion occurs across integer types (narrowing or widening is explicit — see §4.1.2).

- `a & b` — bitwise AND
- `a | b` — bitwise OR
- `a ^ b` — bitwise XOR
- `bnot a` — bitwise NOT (unary); flips all bits
- `a << n` — left shift by `n` bits; vacated low bits are zero-filled
- `a >> n` — right shift by `n` bits; vacated high bits are **sign-filled** for signed types (`int`, `int8`, `int16`, `int32`, `int64`) and **zero-filled** for unsigned types (`uint`, `uint8`, `uint16`, `uint32`, `uint64`)

`n` (the shift amount) must be a non-negative integer expression; it may be any integer type and is implicitly converted to `int` for the shift. A shift amount ≥ the bit width of the left operand is implementation-defined; portable code should mask: `a << (n & 63)`.

**Note on `int` bitwise.** Because `int` is signed 64-bit, `bnot 1` produces `-2` (all bits flipped including the sign bit). For bit-manipulation code that treats the value as a 64-bit pattern, use `uint64` or `uint` to avoid sign-extension surprises.

#### Membership Operators (`in`, `not in`)

- `x in set` → `bool` (set membership)
- `key in dict` → `bool` (key membership)
- `sub in string` → `bool` (substring test)

#### Indexing (`[]`)

- `list[i]` → element at index `i` (0-based). Negative indices count from the end. Out-of-range throws `IndexError`.
- `dict[key]` → value for `key`. Missing key throws `KeyError`.
- `string[i]` → `char` at index `i` (Unicode scalar value).
- `bytes[i]` → `uint8` byte value at index `i`.
- `tuple.N` → element at compile-time constant index `N` (integer literal: `pair.0`, `triple.2`). §4.9

#### Operator Overloading

Loup supports user-defined operator overloading via the **operator interface protocol**. When `a + b` is evaluated and `a` is not a built-in numeric/string/collection type, the compiler looks up the `Add` interface on the type of `a`. If found, `a + b` desugars to `a.op_+(b)`. If not found, `E_OPERATOR_MISSING` is emitted.

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

Built-in types satisfy these interfaces implicitly — the compiler emits specialised instructions for performance, but the semantic contract is identical. In particular, the bitwise interfaces (`BitAnd`, `BitOr`, `BitXor`, `BitNot`, `Shl`, `Shr`) are satisfied implicitly by all integer types (`int`, `uint`, `int8`–`int64`, `uint8`–`uint64`), not only `int`. Floating-point types (`float`, `float32`, `float64`) do NOT implement bitwise interfaces — bitwise operations on IEEE 754 values have no defined meaning.

**Augmented assignment desugar.** `x += y` desugars to `x = x + y`, and `x //= y` desugars to `x = x // y`. If a class also defines an explicit `operator func +=` (or `operator func //=`), that definition is used instead:

```
class BigInt : Any implements Add[BigInt] {
  pub operator func +(other: BigInt): BigInt { ... }  // non-mutating — returns new value
  pub modifier operator func +=(other: BigInt): void { ... }  // mutating — modifier required
}
```

Explicit augmented assignment override is **classes only**. Writing `operator func +=` (or any augmented assignment override) on a struct is a compile-time error (`E_STRUCT_OPERATOR_AUGMENTED`). Augmented assignment on struct values is always auto-derived as `x = x + y`.

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

Loup supports list, dict, and set comprehensions for concise collection construction.

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
let unique_lengths = {s.length for s in words};
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

**Compiled mode.** Comprehensions are permitted in compiled mode — they desugar to statically-typed loops with no `Any` or reflection involved. The element, key, and value types must be statically known.

Comprehensions eagerly build the full collection. For lazy evaluation, use generator expressions (see §7.5).

### §5.3 Slicing

Loup supports Python-style slice syntax on indexable types:

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
- A `step` of `0` is a runtime `ValueError` ("slice step cannot be zero").
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

Slicing is permitted in template expressions (`{$ name[:10] $}`) and in compiled mode.

### §5.4 Ternary Expression

The ternary conditional expression provides concise inline branching:

```
let label = count > 0 ? "items" : "empty";
let abs = x >= 0 ? x : -x;
let display = user != None ? user.name : "Anonymous";
```

**Rules:**

- `cond` must have type `bool`; a non-`bool` condition is a compile-time error (`E_CONDITION_NOT_BOOL`).
- `then_expr` and `else_expr` must have a compatible type. The result type is the common supertype of both branches. With union types, the result may be `A | B` if the branches have different types.
- Only the selected branch is evaluated (short-circuit).
- Ternary expressions are right-associative: `a ? b : c ? d : e` parses as `a ? b : (c ? d : e)`.
- Nested ternaries are permitted but the compiler MAY emit a style warning for deeply nested ternaries recommending `match` or `if`/`else`.
- Ternary expressions are valid anywhere an expression is valid: variable initializers, function arguments, return values, template expressions, comprehensions.
- Permitted in compiled mode.

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

Permitted in compiled mode.

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
- If no `From[E]` implementation exists for the required conversion, the compiler emits `E_PROPAGATE_MISSING_FROM`.

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
    return AppError(message=i"IO: {$ err.message $}", cause=Some(err));
  }

  static func from(err: ParseError): Self {
    return AppError(message=i"Parse: {$ err.message $}", cause=Some(err));
  }
}
```

**Restrictions:**

- `?` may only appear on expressions of type `Result[T, E]`. Using `?` on a non-`Result` type is a compile-time error (`E_PROPAGATE_NOT_RESULT`).
- `?` may only appear inside a function whose return type is `Result[T, F]` for some `T` and `F`. Using `?` at the top level or inside a function returning a non-`Result` type is a compile-time error (`E_PROPAGATE_WRONG_RETURN`).
- `?` works in both synchronous and `async` functions, provided the return type is `Result[T, E]` (or `Task[Result[T, E]]` for async).
- `?` interacts correctly with `defer` — deferred actions execute before the early return propagates.
- `?` is available in all execution modes. It desugars to a `match` expression plus an early `return` — no exception machinery is required. In `@mode(freestanding)`, `Result[T, E]`-based error handling with `?` is the idiomatic replacement for exceptions.

| Code | Mode | Condition |
|---|---|---|
| `E_CONDITION_NOT_BOOL` | All | Condition expression in ternary `? :`, `if`, `while`, or `for` is not `bool` |
| `E_PROPAGATE_MISSING_FROM` | All | `?` applied inside a function returning `Result[T, F]` where the error type `E` has no `impl From[E] for F` |
| `E_PROPAGATE_NOT_RESULT` | All | `?` applied to a value not of type `Result[T, E]` |
| `E_PROPAGATE_WRONG_RETURN` | All | `?` used in a function whose return type is not `Result[T, F]` |

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

**Compiled mode.** Spread operators are permitted in compiled mode provided all types are statically known. `**kwargs` with type `dict[string, Any]` in `@mode(web.compiled)` produces the `W_ANY_IN_AOT_MODE` advisory (§2.4.2) but is permitted. In `@mode(host.native)` and `@mode(freestanding)`, where `Any` is prohibited, `**kwargs` must use a concrete value type.

| Code | Mode | Condition |
|---|---|---|
| `E_SPREAD_NOT_LIST` | All | `*expr` in a positional-spread position where `expr` is not `list[T]` or `Iterable[T]` |
| `E_SPREAD_NOT_DICT` | All | `**expr` in a keyword-spread position where `expr` is not `dict[string, T]` |

---

## §6 Statements and Control Flow

*(This section is normative.)*

### §6.1 Blocks and Scope

Blocks are delimited by braces `{ ... }` and introduce lexical scope. Declarations within a block are visible after their point of declaration. Inner bindings shadow outer bindings of the same name. Declaring two bindings with the same name in the **same** lexical scope is a compile-time error (`E_REDECLARED`).

```
let x = 1;
{
  let x = 2;    // shadows outer x
  print(x);     // 2
}
print(x);       // 1 — outer x is restored
```

| Code | Mode | Condition |
|---|---|---|
| `E_REDECLARED` | All | Two `let` or `var` declarations with the same name appear in the same lexical scope |

### §6.2 Variable Declarations

**`let` declarations** create immutable bindings:

```
let name: string = "Alice";
let age = 30;                  // type inferred as int
```

Attempting to reassign a `let` binding is a compile-time error (`E_LET_REASSIGN`).

**`var` declarations** create mutable bindings:

```
var count: int = 0;
count = count + 1;             // ok
```

**Type annotations** are optional when the type can be inferred from the initializer. When no initializer is provided, a type annotation is required:

```
let x = 42;                   // inferred as int
var name: string;              // declared but uninitialized — must be assigned before use
                                 //   (E_USE_BEFORE_ASSIGN if read before first assignment)
```


**Uninitialized `var` reads.** A `var` binding declared without an initializer must be assigned before its value is read. The compiler performs definite-assignment analysis: reading a `var` that may not have been assigned on all control-flow paths leading to the read is a compile-time error (`E_USE_BEFORE_ASSIGN`). `let` bindings always require an initializer at declaration time, so this error applies only to `var`. Example:

```loup
var count: int;
if (flag) { count = 1; }
print(count);   // E_USE_BEFORE_ASSIGN — count may not be assigned when flag is false
```

| Code | Mode | Condition |
|---|---|---|
| `E_LET_REASSIGN` | All | Assignment to a `let` (immutable) binding after its initial declaration |
| `E_LITERAL_OVERFLOW` | All | Integer or float literal value does not fit in the declared suffix type (e.g., `300i8`) |
| `E_USE_BEFORE_ASSIGN` | All | A `var` binding is read before it has been assigned on all control-flow paths (definite-assignment analysis) |

**`arc let` and `arc var` declarations** create explicit ARC-managed bindings (`@mode(host.native)` or `@mode(host.dual)`):

```loup
@mode(host.native)

arc let conn = Connection.open(addr)    // explicit ARC; aliases permitted
arc var cache = Cache.new()             // mutable ARC binding, reassignable
```

`arc let` / `arc var` are semantically identical to plain `let` / `var` for class types in modes where ARC is the ownership model — both produce ARC-managed references. The distinction is intent declaration: the qualifier makes the ARC ownership explicit at the binding site, aiding code review, auditing, and tooling.

Under `--require-explicit-arc` (build flag, §23.4.8), constructing a class into a plain `let` or `var` without `arc let` or `unique let` emits the lint advisory `implicit-arc-binding`. `arc let` suppresses this advisory.

`arc let` is a compile-time error in `@mode(web.scripted)`, `@mode(web.compiled)`, `@mode(host.scripted)`, and `@mode(freestanding)` (`E_ARC_LET_NOT_NATIVE`). On value types (structs, enums, primitives), `arc let` is always an error (`E_ARC_LET_NOT_CLASS`).

**`arc let` is a local binding qualifier only.** Using `arc let` or `arc var` on a class field or struct field is a compile-time error (`E_ARC_LET_ON_FIELD`). Class fields in `@mode(host.native)` are always ARC-managed via plain `let`/`var`; the explicit `arc` qualifier is reserved for local binding sites where ownership intent is declared. Struct fields use `unique var` for uniquely-owned class references (§10.3.2); plain `var` for all other types.

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

The condition expression must have type `bool`. If the condition is statically known to not be `bool`, the compiler emits `E_CONDITION_NOT_BOOL`. If the condition is dynamically not `bool`, the runtime throws a `TypeError`.

### §6.4 Loops

**`while` loop:**

```
while (cond) {
  // ...
}
```

The condition `cond` must have type `bool` (`E_CONDITION_NOT_BOOL` if statically non-bool).

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

**For-loop implicit borrow (all modes).**

In all modes, a `for (x in items)` statement creates an **implicit `reads` borrow** of `items` for the entire duration of the loop body. Any of the following inside the loop body is a compile-time error (`E_BORROW_LOOP_MUTATION`):

- Assigning to `items`
- Calling any method requiring `edits: items` (e.g., `append`, `remove`, `clear`)
- Passing `items` as an `edits` argument

```loup
@mode(host.native)

var items = [1, 2, 3]
for (x in items) {
    items = items + [x]   // E_BORROW_LOOP_MUTATION: `items` implicitly
                          // borrowed by for-loop; cannot mutate
}
```

Read-only access inside the loop is permitted:

```loup
@mode(host.native)

var items = [1, 2, 3]
for (x in items) {
    let len = items.length   // OK — read-only
    print(x)                 // OK
}
```

In scripted mode the compiler emits a runtime warning `borrow-loop-mutation` rather than a compile-time error, since scripted mode is the most permissive mode. Promote to an error with `// loup:error(borrow-loop-mutation)`.



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

`break label;` exits the labeled loop. `continue label;` goes to that loop's next iteration (running any `defer`s on the way out). Labels have their own namespace and do not conflict with variable names. Referencing an unknown label is a compile-time error (`E_UNKNOWN_LABEL`).

| Code | Mode | Condition |
|---|---|---|
| `E_UNKNOWN_LABEL` | All | `break label` or `continue label` where `label` does not name any enclosing loop |

### §6.5 Defer

`defer` registers cleanup actions that run when the current lexical block ends (via fallthrough, `return`, `break`, `continue`, or exception). Multiple `defer`s execute in LIFO (last-in, first-out) order. `defer` is available in all six execution modes.

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

**Async defers.** In async code, deferred actions may themselves use `await`; scope exit awaits each deferred action to completion in LIFO order. In `@mode(freestanding)`, async is unavailable — `await` inside a deferred action is `E_FREESTANDING_ASYNC`. Deferred synchronous actions work normally.

**Exception handling.** Exceptions inside a deferred action propagate unless caught by an outer `try`/`catch`.

### §6.6 `with` (Scoped Resources)

The `with` statement provides deterministic resource management via the `Scoped[T]` protocol (see §11.2):

```
with (fh = runtime.fs.open("out.txt")) {
  fh.write("ok");
} // fh is closed at block end
```

**Execution semantics:**

1. Evaluate the expression to get the context manager (must implement `Scoped[T]`; a compile-time error if it does not: `E_WITH_NOT_SCOPED`).
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

| Code | Mode | Condition |
|---|---|---|
| `E_WITH_NOT_SCOPED` | All | `with (x = expr)` where `expr` does not implement `Scoped[T]` or `AsyncScoped[T]` |

**Mode notes.** `Scoped[T]` is available in all six modes; `AsyncScoped[T]` is unavailable in `@mode(freestanding)` (no async). In `@mode(freestanding)`, `scope_exit(error)` is always called with `None` — exceptions cannot occur, so the error-suppression steps (5–7) in the execution semantics never apply. The `error` parameter type `Option[Any]` in `scope_exit` is accepted as a special case in all compiled modes since it only carries exception values at the protocol boundary.

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

**Rules (common to all modes where portal is available — scripted, compiled, native):**

- `portal name { ... }` is a block statement.
- `name` may be an identifier or string literal. Portal names are runtime strings.
- Duplicate portal names are permitted for explicit `portal` blocks and implicit callable-entry portals. This is distinct from `@webcomponent` tag names (§19.10), which must be unique within a compilation unit.
- All named functions and methods are **implicit portals** at entry, with stable fully-qualified portal names derived from the module path and callable name (e.g., `"myapp.server.handleRequest"`).
- Explicit `portal` statements and implicit callable portals share a single activation registry maintained by the runtime host.
- If a portal is entered and no matching activation exists, it is observationally inert — the body executes normally with zero overhead.
- If a portal is entered and a matching activation exists with a true condition, the runtime activates tracing for the current task.

**Portal names in compiled code.** In compiled-mode files, portal names are resolved from the static metadata table (see §20.3) registered at module load time. The fully-qualified callable name for implicit portals is available via `core.reflect.callableName(f)` (§21.11).

**Two-tier condition model:**

*Scripted mode — full lexical scope evaluation.* Conditions in `activatePortal` calls against scripted portals are Loup expressions parsed and evaluated in the lexical environment of the target portal at activation time. The full scope of the portal's enclosing function is available:

```
// Scripted portal condition — full lexical scope accessible
runtime.debug.activatePortal("myapp.server.handleRequest",
  condition="request.userId == \"admin\" and request.method == \"DELETE\"");
```

*Compiled and native modes — parameter-and-constant predicates only.* Conditions for portals in compiled-mode and native-mode files are restricted to predicate expressions over the portal function's parameters and module-level constants. Dynamic lexical scope evaluation is unavailable. The condition is type-checked at activation time against the function's static signature from the metadata table; a type mismatch throws `CapabilityError` (in native) or traps (in freestanding, if portals were somehow invoked — they are stripped):

```
// Compiled portal condition — parameters and constants only
runtime.debug.activatePortal("myapp.geo.distance",
  condition="a.x > 100.0");    // a and b are the function's parameters
```

The runtime identifies the portal's mode from the module's metadata table registration and applies the appropriate condition evaluation strategy: full lexical scope for scripted-mode portals, parameter/constant predicates only for compiled-mode and native-mode portals. Attempting a full lexical-scope condition against a compiled or native portal throws `CapabilityError` with a diagnostic message.

**Portal statement in compiled mode.** Explicit `portal` blocks are syntactically and semantically permitted in compiled-mode files. They register with the shared runtime activation registry on module load. The body executes in all cases; tracing is activated when a matching registry entry exists with a true condition.

**Portal statement in freestanding mode (`--debug` builds only, normative).** `portal` statements are permitted in `@mode(freestanding)` when `loup build --debug` is active and at least one debug channel or ring buffer is configured (see §24.25). In release builds, all portal instrumentation is stripped unconditionally and `E_FREESTANDING_PORTAL` is the compile-time error for any portal statement, as before.

Freestanding portals carry the following restrictions relative to other modes:

- **No condition expressions.** `portal name(condition) { ... }` syntax is prohibited; conditions always evaluate as unconditionally true when a portal is activated. Using a condition expression is `E_FREESTANDING_PORTAL_CONDITION`.
- **`TraceLevel.PortalOnly` only.** Full local-variable capture (`TraceLevel.Full`) is unavailable without a GC heap. Trace frames are `FreestandingDebugFrame` values (§24.25.2) — fixed-size structs with source location offsets, no heap allocation.
- **Static activation table.** Activation is controlled via a BSS-resident atomic byte table indexed by compile-time portal ID, not via the runtime `DebugRuntime` interface. The host activates portals over the control channel protocol (§24.25.6) or via direct JTAG memory write.
- **Implicit callable portals.** All named `@interruptSafe` and non-`@interruptSafe` functions are instrumented at entry with implicit portals, matching the `@mode(host.native)` behavior.
- **Time-travel replay.** When `FreestandingDebugConfig.timeTravelEnabled = true`, the compiler allocates a static on-target ring buffer (`.debug_ttravel` section) that records the most recent N portal events regardless of host connectivity. The host retrieves the ring at any point via the `READ_REPLAY_BUFFER` control-channel command (§24.25.6); no trace channel is required. See §24.25.9.

### §6.8 Destructuring

Loup supports destructuring in declarations, assignments, function parameters, loops, and match arms.

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

Destructuring is permitted in compiled mode — all types must be statically known.

### §6.9 `try`/`catch`/`finally`

```
try {
  let data = runtime.fs.readText(path);
  process(data);
} catch (IoError as e) {
  log(i"read failed: {$ e.message $}");
} catch (TypeError | MatchError as e) {
  log(i"type/match error: {$ e.message $}");
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
- `return`, `break`, and `continue` inside a `finally` block are compile-time errors (`E_FINALLY_CONTROL`) — `finally` must not alter the control flow of the enclosing `try` statement.

| Code | Mode | Condition |
|---|---|---|
| `E_FINALLY_CONTROL` | All | `return`, `break`, or `continue` statement inside a `finally` block — control flow from `finally` must not alter the enclosing `try` statement's flow |

**Interaction with `defer`.** `defer` actions registered inside a `try` body run before the `catch` handler (as part of the `try` block's scope exit). `finally` runs after both the `try` scope (including defers) and any `catch` handler.

**Async `finally`.** `finally` blocks may contain `await` in async contexts. The runtime awaits the `finally` block to completion before propagating any exception.

**Multi-type catch.** `catch` supports multi-type patterns: `catch (TypeError | MatchError as err)`.

**Bare catch.** A `catch` clause without a type filter is equivalent to `catch (Exception as err)` — it catches all `Exception` subtypes but does NOT catch `BaseException`-only subtypes (`SystemExit`, `KeyboardInterrupt`, `GeneratorExit`). To catch everything, use `catch (BaseException as err)`. See §26.5 for full catch semantics.

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
        print(i"Caused by: {$ e $}");
        current = e.cause ?? None;
      },
      None => {},
    }
  }
}
```

The runtime's default error reporting (uncaught exceptions, unhandled task failures) prints the full cause chain.

Exception chaining is permitted in compiled mode — `cause` is typed as `Option[Any]` which is permitted at the error boundary.

### §6.11 `del` Statement

The `del` statement provides deterministic finalization for objects implementing the `Finalizable` interface (see §8.9):

```
let handle = NativeResource.open("data.bin");
// ... use handle ...
del handle;   // calls handle.finalize() immediately, then unbinds the name
```

**Rules:**

- `del expr;` is a simple statement.
- `expr` must evaluate to a value that implements `Finalizable`; otherwise it is a compile-time error (`E_DEL_NOT_FINALIZABLE`).
- `del` calls `finalize()` immediately and synchronously.
- After `del`, the binding is considered uninitialized — any subsequent use of the name is a compile-time error (`E_USE_AFTER_DEL`; similar to use-after-move).
- `del` on an already-finalized object calls `finalize()` again — it is the implementer's responsibility to make `finalize()` idempotent.
- **`modifier finalize()` and safe contexts.** A class may declare `modifier finalize()` to strengthen the `Finalizable` contract (§11.1 permits this). `del expr` implicitly satisfies the safe context requirement for the `finalize()` invocation: after `del`, the binding is consumed and no new aliases can be created, so exclusivity is provably maintained. No explicit `safe {}` wrapper is needed around `del` statements.
- **Memory management.** In `@mode(host.scripted)` and `@mode(web.compiled)` (GC modes), `del` calls `finalize()` but does not deallocate memory — the GC manages the object's lifetime. In `@mode(host.native)` (ARC mode), `del` calls `finalize()` and explicitly releases the ARC strong reference; if the reference count reaches zero, the object is deallocated synchronously. In `@mode(freestanding)`, `del` on a `unique` class value calls the `@deallocator` and frees the memory.
- `del` on fields: `del obj.field;` calls `finalize()` on the field value and sets the field to an uninitialized state (the field must be `var`, not `let`).
- `del` on collection elements is not supported — remove the element from the collection and `del` the value separately.

| Code | Mode | Condition |
|---|---|---|
| `E_DEL_NOT_FINALIZABLE` | All | `del expr` where `expr`'s type does not implement `Finalizable` |
| `E_USE_AFTER_DEL` | All | A binding is read or written after it was passed to `del` |

The compiler SHALL emit a warning when a `Finalizable` object goes out of scope without being passed to `del`, used in a `with` block, or passed to another owner.

**Relationship to `Closeable` and `Scoped[T]`.** `Closeable` types that also implement `Finalizable` should call `close()` from `finalize()` as a safety net. `with`/`Scoped[T]` is preferred for scope-aligned lifetimes; `del` is preferred for non-scope-aligned lifetimes; GC finalization is the last resort when neither `with` nor `del` was used.

`del` is available in all six execution modes. Behaviour differs by mode as described above — in GC modes it triggers cleanup only; in ARC and freestanding modes it also deallocates.

### Statement Classification

Loup distinguishes **simple statements** and **block statements**:

- **Simple statements** conventionally end with `;`, but the semicolon is **optional**. Newlines terminate statements; an explicit `;` may always be added for style or clarity.
- **Block statements** do NOT end with `;`.

**Simple statements:** `let`/`var` declarations, expression statements, `break`, `continue`, `return`, `throw`, `defer` (call form), `del`, `global`, `nonlocal`, `yield`, `yield*`.

**Module-level-only statements:** `from ... import` (standard import), `from ... defer import` (deferred type stub import, §13.10), `pub from ... import` (re-export) — valid only as top-level items, not inside function bodies or blocks.

**Block statements:** `if`/`else`, `while`, `for`, `for-in`, `for await`, `do-while`, `try`/`catch`/`finally`, `with`, `defer` (block form), `dynamic ... as`, `portal`, `match`, `await group`, `safe { }` (safe context block, §23.4.12), `unsafe("reason") { }` (lock-release block inside `synchronized` modifier, §23.4.14), function declarations, class declarations, enum declarations, interface declarations, struct declarations, `asm { }` (inline assembly; `@mode(host.native)` requires `@unsafe("asm: reason")` prefix; §24.7).

Note: `do { ... } while (cond);` is a block statement that includes a trailing `;` as part of its construct syntax.



---

## §7 Functions and Closures

*(This section is normative.)*

### §7.1 Function Declarations

Loup supports four function declaration forms:

**Synchronous function:**

```
func add(a: int, b: int): int {
  return a + b;
}
```

**Async function:**

```
async func fetchUser(id: string): Task[User] {
  let response = await runtime.net.get(i"/users/{$ id $}");
  return parseUser(await response.json());
}
```

- `async func name(...): T { ... }` declares a function whose call result is `Task[T]`.
- Calling an async function starts the task immediately and returns its `Task[T]`.
- `await expr` requires `expr` to have type `Task[T]`; it suspends the current async context until the task completes and then evaluates to `T`.
- If the awaited task has failed, `await` rethrows the failure at the await site.
- `await` is permitted inside `async func` bodies, entry scripts, REPL sessions, and async template rendering contexts. Using `await` anywhere else is `E_AWAIT_NOT_ASYNC`.
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

**Safe function:**

```
safe func fill(edits buf: Buffer, value: uint8): void { ... }
safe async func loadAndFill(url: string, edits buf: Buffer): void { ... }
```

The `safe` modifier may prefix `func`, `async func`, `gen func`, or `async gen func`. A `safe func` (in any of these forms) both requires and provides a safe context (§23.4.12): it may call other `safe func`s and `modifier` methods freely, and its callers must either also be `safe func` or anchor the call inside a `safe {}` block. Available in all execution modes.

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
- Implementing an operator interface without declaring the corresponding `operator func` is a compile-time error (`E_OPERATOR_MISSING_FUNC`).
- Declaring `operator func` without `implements OperatorInterface` is a compile-time error (`E_OPERATOR_NO_INTERFACE`).
- `operator func` is available in all execution modes — it is a compile-time desugaring to a named method slot with no runtime cost.

| Code | Mode | Condition |
|---|---|---|
| `E_NOT_COMPARABLE` | All | Comparison operator (`<` `>` `<=` `>=`) applied to a type that does not implement `Comparable[T]` |
| `E_STRUCT_OPERATOR_AUGMENTED` | All | `operator func +=` (or any augmented-assignment override) declared on a struct |
| `E_LOGICAL_NOT_BOOL` | All | `and`, `or`, or `not` applied to a non-`bool` operand — no truthy/falsy coercion |
| `E_OPERATOR_MISSING` | All | Binary operator applied to a type that does not implement the corresponding operator interface (e.g. `a + b` where `typeof a` does not implement `Add`) |
| `E_OPERATOR_MISSING_FUNC` | All | Class declares `implements OperatorInterface` but the required `operator func` body is absent |
| `E_OPERATOR_NO_INTERFACE` | All | `operator func Symbol` declared without the corresponding `implements OperatorInterface` declaration |

**`borrow` parameter modifier.** Prefixing a parameter declaration with `borrow` asserts that the caller's binding of that value is guaranteed to outlive the function call. The compiler elides the ARC `retain()` on entry and `release()` on exit for that parameter. `borrow` is available in all six modes; the ARC-elision benefit applies in modes that use ARC (`@mode(host.dual)` and `@mode(host.native)`), while the frame-escape constraint is enforced uniformly.

```loup
@mode(host.native)

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
- A `borrow` parameter value may NOT escape the call frame by: assignment into a class field, assignment into an existing mutable struct field, assignment to a module-level binding, return as an owned value, passing to an escaping `fn` parameter, or use as a `spawn` argument. (Note: declaring a struct field *of* `borrow` type in the struct definition is valid — see `borrow` on struct fields below. The restriction is on runtime assignment from a `borrow` parameter, not on struct field declarations.)

```loup
@mode(host.native)

func processConfig(borrow config: Config): Result[void, AppError] {
  let name = config.name;         // OK — read
  validate(borrow config);        // OK — pass to borrow param
  GlobalCache.store(config);      // E_BORROW_ESCAPE — escapes frame
  let t = spawn process(config);  // E_TASK_SCOPE_ESCAPE — task outlives frame
  return Ok(());
}
```

**`borrow` and `noescape fn` together.** The combination produces zero ARC activity on hot iteration paths:

```loup
@mode(host.native)

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

```loup
@mode(host.native)

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

`borrow` on a struct field is available in all six modes. `borrow` and `weak`/`unowned` are mutually exclusive on a single field.

**`borrow[~name]` — Tracked Lifetime References**

The plain `borrow` modifier above is a frame-escape constraint: the compiler verifies the borrowed value does not outlive the call and elides ARC activity. It carries no lifetime identity and requires no annotation beyond the keyword itself.

When a non-owning reference must flow beyond the call frame — as a return value, stored in a struct field that is returned, or as a variant payload in a returned enum — a lifetime label records which source region the reference comes from. The compiler uses this label to verify that the reference cannot outlive its source.

**Lifetime label syntax.** A lifetime label is a lowercase identifier prefixed with `~`. The `~` sigil visually distinguishes lifetime labels from type parameters (`T`, `E`, `K`) and from ordinary identifiers:

```loup
~src       // a lifetime label named "src"
~origin    // a lifetime label named "origin"
~static    // the reserved forever-lifetime (see below)
```

**`lifetime ~name` — declaring a region.** Lifetime parameters are declared in the `[...]` generic brackets of a function or type using the `lifetime` keyword. The `lifetime` keyword introduces the label into scope for the function signature and body:

```loup
@mode(host.native)

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

```loup
@mode(host.native)

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

```loup
@mode(host.native)

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


**`E_BORROW_ESCAPE` — Borrow of local escaping scope.** When a plain `borrow` of a stack-local variable would escape the current call frame — via a return statement, a function-typed argument, or a struct field — the compiler emits `E_BORROW_ESCAPE`:

```loup
@mode(host.native)

func dangle(): borrow int {
    let x = 42
    return borrow x   // E_BORROW_ESCAPE: borrow of local `x`
                      // would escape function scope; add a
                      // lifetime annotation: borrow[~src] int
}
```

The fix is to return by value, or annotate the function with `[lifetime ~name]` that ties the return borrow to an input borrow:

```loup
// Return by value:
func getValue(): int {
    let x = 42
    return x
}

// Return borrow of an input — lifetime annotation required:
func firstOf[lifetime ~src](borrow[~src] items: list[int]): borrow[~src] int {
    return borrow items[0]   // safe: tied to ~src
}
```

`E_BORROW_ESCAPE` applies in `@mode(host.native)` and `@mode(freestanding)`.

**Reborrowing.** A `borrow[~a]` value may be passed to a `borrow[~b]` parameter when `~b` does not appear in the callee's return type, output fields, or any out-parameter position. The compiler creates an implicit sub-region of `~a` and unifies it with `~b` for the duration of the call. No annotation is needed at call sites:

```loup
@mode(host.native)

func validate[lifetime ~v](borrow[~v] text: string): bool { ... }
// ~v does not appear in the return type — reborrowing applies

func pipeline[lifetime ~src](borrow[~src] input: string): borrow[~src] string {
  let ok = validate(borrow input);   // OK: ~v unified with sub-region of ~src
  return input;
}
```

**Lifetime labels and generic containers.** `Option[borrow[~src] T]`, `list[borrow[~src] T]`, and `Result[borrow[~src] T, E]` are valid. The container transitively carries the `~src` lifetime and cannot outlive the source region. The compiler tracks this without requiring a new lifetime parameter on `Option`, `list`, or `Result` themselves.

`borrow[~name]` is valid in all execution modes (§2.6). In modes with ARC (`@mode(host.native)`, `@mode(host.dual)`) the borrow also elides retain/release on the referenced value; in Wasm GC modes it lowers to GC-tracked non-owning references with stack-frame escape analysis.

### §7.2 Lambdas

Lambdas (anonymous functions) come in two forms:

**Expression body** — evaluates `expr` and returns the result:

```
let double = func(x: int) => x * 2;
let greet = func(name: string) => i"Hello, {$ name $}!";
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
- The named variable must exist in the appropriate scope and must be a `var` binding; using `global`/`nonlocal` on a `let` binding is a compile-time error (`E_GLOBAL_LET`).
- `global` and `nonlocal` are REQUIRED when a closure assigns to an outer `var`. Without the declaration, assignment to a name that exists in an outer scope is a compile-time error (`E_GLOBAL_MISSING`).
- Reading an outer variable does NOT require `global`/`nonlocal` — only mutation does.
- `nonlocal` walks up enclosing function scopes but stops at module level; `global` always refers to module-level scope.
- A single function may use both `global` and `nonlocal` declarations for different variables.

| Code | Mode | Condition |
|---|---|---|
| `E_GLOBAL_LET` | All | `global` or `nonlocal` applied to a `let` (immutable) binding |
| `E_GLOBAL_MISSING` | All | Assignment to an outer-scope `var` inside a function or closure without a preceding `global`/`nonlocal` declaration |
| `E_GLOBAL_NOT_FOUND` | All | `global x` where `x` does not exist at module scope; `nonlocal x` where `x` is not in any enclosing function scope |

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
- In compiled mode, closures that capture `var` bindings allocate the captured variable on the heap rather than the stack.

**Variable resolution.** The compiler resolves variable references using lexical scope chain lookup. Unlike Python, there is no ambiguity because Loup requires explicit `let`/`var` for all declarations — bare assignment without `let`/`var` is always a reference to an existing binding.

**Structural typing for closures.** Closures are structurally typed for assignment compatibility: a closure is assignable to any `fn(ParamTypes): ReturnType` where the parameter types and return type match, regardless of what the closure captures.

**No built-in partial application.** Loup does not provide built-in partial application or currying syntax. Developers use lambdas to achieve the same effect:

```
func add(a: int, b: int): int { return a + b; }
let add5 = func(b: int) => add(5, b);   // manual partial application
```

**Closures in compiled mode.** Closures in compiled-mode files follow the same capture rules. Captured `var` bindings typed as `Any` in `@mode(web.compiled)` produce the `W_ANY_IN_AOT_MODE` advisory (§2.4.2) but are permitted; `Any` remains prohibited in `@mode(host.native)` and `@mode(freestanding)`. The compiler may optimize non-escaping closures to avoid heap allocation of captured variables.

**ARC capture lists (`@mode(host.native)` or `@mode(host.dual)`).** In ARC-managed modes, closures that create ARC retain cycles must break them with weak or unowned capture list entries:

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

```loup
// Safe: LifetimeError trap in all builds if self is freed before handler fires.
let handler = callback(func() [unowned self] { self.onFire(); });

// Prefer weak when you cannot prove self outlives the closure:
let handler = callback(func() [weak self] { self?.onFire(); });
```

Capture lists are valid in `@mode(host.dual)` and `@mode(host.native)` files, where ARC manages object lifetimes. ARC retain cycles cannot occur in `@mode(freestanding)` (no ARC runtime is present) or in `@mode(host.scripted)`/`@mode(web.scripted)`/`@mode(web.compiled)` (GC manages memory). Using a capture list outside `@mode(host.dual)` or `@mode(host.native)` is a compile-time error.

The compiler SHALL emit `E_ARC_CYCLE` as a **compile-time error** for any statically-detectable case where:
- An `unowned` capture is used in a closure whose static lifetime may exceed the lifetime of the captured object within the same lexical scope, or
- A probable ARC retain cycle is detected in a closure on native targets without a corresponding capture list entry.

For cases where the relationship cannot be statically determined, the compiler emits a `cycle-advisory` lint. `weak` is always the safe fallback for such cases.

| Error / Lint | Condition |
|---|---|
| `E_ARC_CYCLE` | Statically-detectable ARC retain cycle in a closure without a corresponding capture list entry breaking the cycle |

**`noescape fn` closures.** When a closure is passed to a `noescape fn` parameter, the compiler verifies the closure body does not attempt to escape any `borrow` or `reads` values it receives (both are non-owning borrows with zero ARC overhead in `@mode(host.native)`). The compiler may stack-allocate the closure's captured variables if they are all stack-resident, eliminating heap allocation entirely.

```loup
@mode(host.native)

func withLock(lock: Mutex, body: noescape fn(): void): void {
  lock.acquire();
  defer lock.release();
  body();
}

withLock(myMutex, func() {
  doProtectedWork();   // lambda is not heap-allocated
});
```

A closure that captures `borrow` or `reads` values (non-owning borrows) may only be passed to `noescape fn` parameters — passing it to a plain `fn` parameter is a compile-time error, because the `fn` parameter may store the closure, causing the borrowed value to escape its frame (`E_BORROW_ESCAPE`).

### §7.4 Rest Parameters and Keyword-Only Parameters

**Rest parameters** collect extra positional arguments:

```
func log(level: string, *messages: list[string]) {
  for (msg in messages) {
    print(i"[{$ level $}] {$ msg $}");
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

A bare `*` does not collect any arguments — it only marks the boundary. A bare `*` and a named `*args` are mutually exclusive. Parameters after `*` or `*args` must be passed by name; passing them positionally is a compile-time error (`E_KEYWORD_ONLY_POSITIONAL`). Keyword-only parameters may have default values; those without defaults are required keyword arguments.

**Parameter ordering.** The compiler enforces the following order in function declarations (`E_PARAM_ORDER` if violated): regular positional parameters first, then `*args` (or bare `*`), then keyword-only parameters (if any), then `**kwargs`. A function may have at most one `*` parameter (`E_DUPLICATE_REST`) and at most one `**` parameter (`E_DUPLICATE_KWARGS`).

| Code | Mode | Condition |
|---|---|---|
| `E_KEYWORD_ONLY_POSITIONAL` | All | Keyword-only parameter (after `*` or `*args`) passed positionally at call site |
| `E_PARAM_ORDER` | All | Function parameter declaration order violates: positional → `*args`/`*` → keyword-only → `**kwargs` |
| `E_DUPLICATE_REST` | All | More than one `*args` parameter in a single function declaration |
| `E_DUPLICATE_KWARGS` | All | More than one `**kwargs` parameter in a single function declaration |

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

**compiled mode restrictions.** `**kwargs` with type `dict[string, Any]` in `@mode(web.compiled)` produces the `W_ANY_IN_AOT_MODE` advisory (§2.4.2) but is permitted. In `@mode(host.native)` and `@mode(freestanding)`, where `Any` is prohibited, `**kwargs` must use a concrete value type. `*args` with a concrete element type (e.g., `*args: list[int]`) is permitted in all modes.

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

**`safe gen func`.** The `safe` modifier may also prefix `gen func` and `async gen func`. A `safe gen func` requires and provides a safe context throughout the generator's execution — each `edits:` call and `modifier` call inside the body is independently verified. `requires` clauses with `distinct()` are also supported on generator function declarations.

**Mode availability.** `gen func` (synchronous generators) is available in all modes including `@mode(host.native)` and `@mode(freestanding)`. In `@mode(freestanding)`, iterator state is heap-allocated via the registered `@allocator`; without one, constructing an iterator is a compile-time error (same as any class construction). `async gen func` is unavailable in `@mode(freestanding)` — `async` is stripped (`E_FREESTANDING_ASYNC`).

**Generator lifecycle:**

1. Calling a `gen func` returns an `Iterable[T]` (or `AsyncIterable[T]`) without executing any of the body.
2. The body executes lazily: it runs up to the first `yield` when the consumer requests the first value, then suspends.
3. Each subsequent request resumes from the last `yield` point and runs to the next `yield` or to the end.
4. When the function body completes, the iterator signals completion (`None` from `next()`).
5. `return expr;` in a generator is a compile-time error (`E_GEN_RETURN_VALUE`) — use `yield` for values and `return;` (no value) for early termination.

**Generator error codes.**

| Code | Mode | Condition |
|---|---|---|
| `E_GEN_RETURN_VALUE` | All | `return expr;` (with a value) inside a `gen func` body — use `yield` for values; bare `return;` is allowed |
| `E_YIELD_OUTSIDE_GEN` | All | `yield` or `yield*` used in a regular `func` or `async func` body |

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

Generators are permitted in compiled mode — they compile to state machines with no dynamic dispatch.

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
- In compiled mode: decorators that only attach metadata are evaluated at compile time; decorators with runtime side effects execute at module initialization.

**Metadata access.** Decorator metadata is accessible via `core.reflect.annotations(target)`, returning a `dict[string, Any]`.

**User-defined decorators and built-in annotations.** All user-defined decorators follow the `func(target: T, ...args): T` protocol. There are no language-defined decorators — the language-defined annotations (such as `@jsexport`, `@mode`, `@entry`, `@panic_handler`, `@interruptSafe`, `@lockOrder`, `@overflowWrapping`, and all other `@name` forms listed in §8.8) do **not** follow the decorator protocol. They have special compiler semantics and are not callable functions. Applying a language-defined annotation where a decorator function is expected is a compile-time error.

All other `@name` annotations in user code are user-defined decorators following the protocol above.

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

  pub set diameter(value: float) {    // implicitly modifier — writes radius
    radius = value / 2.0;
  }
}

let c = Circle(radius=5.0);
let a = c.area;           // calls get area()  — no safe context needed
safe { c.diameter = 20.0; }  // calls set diameter(20.0) — safe context required
```

**Rules:**

- Properties are accessed with field syntax (no parentheses).
- A `get` property takes no parameters and returns a value.
- A `set` property takes exactly one parameter and returns `void`.
- A `get` without a `set` is read-only; a `set` without a `get` is write-only. Attempting to read a write-only property is `E_PROPERTY_WRITE_ONLY`; attempting to write a read-only property is `E_PROPERTY_READ_ONLY`.
- A `get`/`set` pair for the same name must have compatible types (`E_PROPERTY_TYPE_MISMATCH` if they differ).
- A stored field and a `get`/`set` property with the same name on the same class is a compile-time error (`E_PROPERTY_FIELD_CONFLICT`).
- **`set` accessors are implicitly `modifier`.** A `set` property automatically carries the `modifier` mutation contract (§23.4.11). Calling a setter on a plain ARC class instance requires a safe context (`E_SAFE_CONTEXT_REQUIRED`). On `unique` or `synchronized` receivers, no safe context is needed.

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

| Code | Mode | Condition |
|---|---|---|
| `E_PROPERTY_READ_ONLY` | All | Assignment to a `get`-only (no `set`) property |
| `E_PROPERTY_WRITE_ONLY` | All | Read of a `set`-only (no `get`) property |
| `E_PROPERTY_TYPE_MISMATCH` | All | `get` and `set` for the same property name have incompatible types |
| `E_PROPERTY_FIELD_CONFLICT` | All | A stored field and a `get`/`set` property share the same name in the same class |

Properties are permitted in compiled mode — they compile to direct function calls.



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

### §8.1.1 Memory Strategy Modifiers

*(This subsection is normative.)*

A class declaration may optionally carry a **memory strategy modifier** — `local` or `shared` — that selects how instances are allocated, reference-counted, and synchronized. The bare `class` keyword is a shorthand for `local class`:

```
class Point3D { ... }          // equivalent to `local class Point3D { ... }`
local class Point3D { ... }    // explicit form
shared class Vertex { ... }    // shared-arena, atomic refcount, cross-thread
```

The two modifiers represent two different points on the ARC tradeoff curve:

| Modifier | Allocation | Refcount | Thread safety | Cross-mode ABI |
|---|---|---|---|---|
| `local class` (default) | Local heap | Non-atomic | Thread-confined by convention | Not guaranteed |
| `shared class` | Shared arena (§17b.5) | Atomic | Safe for cross-thread access under ownership verbs | Guaranteed stable (§17b.7) |

**Uniform ARC contract.** Regardless of implementation backing, instances of `local class` and `shared class` present the following **ARC-equivalent observable contract** in all modes:

- **Lifetime by reference count.** An instance is reachable for as long as at least one strong reference to it exists. The instance's `finalize()` method (if declared) runs at the point when the last strong reference is released, within a bounded delay.
- **Deterministic destruction.** Memory is reclaimed promptly after the final reference is released. The runtime SHALL NOT accumulate unreclaimed instances indefinitely in the presence of reachability chains that would free them under ARC semantics.
- **Cycles are the user's responsibility.** Cyclic reference graphs must be broken with `weak` references (§8). Programs MUST NOT rely on automatic cycle collection; the specification makes no guarantee that cyclic garbage will be reclaimed.
- **Identity is preserved.** Two strong references to the same instance compare equal via `===` and observe each other's mutations.

These four rules are the contract users program against. The contract is identical across `@mode(web.scripted)`, `@mode(web.compiled)`, `@mode(host.scripted)`, `@mode(host.dual)`, `@mode(host.native)`, and (for `local class` only) `@mode(freestanding)`.

#### §8.1.1.1 Implementation Allowance (Non-Normative)

*(This subsubsection is non-normative.)*

An implementation MAY back `local class` allocation with a tracing garbage collector — for example, the Wasm GC heap in `web.scripted`, `web.compiled`, `host.scripted`, and the JIT side of `host.dual` — provided that the four rules of the ARC-equivalent contract above are preserved as observable behavior. In practice this means:

- A tracer-backed implementation must ensure `finalize()` runs at reachability-to-zero (not at the next major-GC cycle after an arbitrary delay).
- A tracer-backed implementation must reclaim memory promptly enough that programs running within a bounded working-set do not accumulate reachable-only-via-cycle objects indefinitely. The runtime MAY include a best-effort cycle collector to satisfy this requirement, but the language specification does not require one and programs must not assume it exists.
- A tracer-backed implementation must preserve identity semantics, including `===` and hash stability, across any compaction or movement the tracer performs.

The typical implementation strategy on Wasm GC hosts is to allocate each `local class` instance as a Wasm GC struct whose first word is a Loup-managed refcount; retain/release operate on the refcount and the struct becomes unreachable to the Wasm GC exactly when the refcount drops to zero. This gives the Wasm GC runtime a prompt hint to reclaim the memory while preserving ARC semantics at the language level.

`shared class` has no such implementation freedom: its memory layout, header format, and refcount protocol are normatively specified in §17b.5–§17b.7 to enable cross-mode interop.

#### §8.1.1.2 Syntax and Placement

The memory strategy modifier, when present, appears immediately before the `class` keyword:

```
<visibility>? <strategy>? (abstract | dynamic | unique)? class Name ...
```

where `<strategy>` is `local` or `shared`. The modifier combines with other class-declaration modifiers (`abstract`, `dynamic`, `unique`) subject to the following rules:

- `unique class` and `shared class` are mutually exclusive (`E_UNIQUE_SHARED`). A `unique class` forbids aliasing; `shared class` presupposes it.
- `dynamic class` combines with `local` only — `shared dynamic class` is `E_SHARED_DYNAMIC` because shared classes have a statically committed layout (§17b.7).
- `abstract` combines with either strategy.

#### §8.1.1.3 Field Type Constraints

A `shared class` may declare fields only of types that implement `Shareable` (§17b.2). Attempting to declare a field of a non-`Shareable` type in a `shared class` is a compile-time error (`E_SHARED_FIELD_NOT_SHAREABLE`).

A `local class` may declare fields of any type, including `SharedRef[T]` — a `local class` instance may hold references to `shared class` instances. The reverse — a `shared class` holding a reference to a `local class` instance — is forbidden because `local class` does not implement `Shareable`.

#### §8.1.1.4 Finalizers

Either strategy may declare a finalizer by implementing the `Finalizable` interface (§8.9) or by declaring a `finalize()` method directly. Declaring `func finalize(): void` on a class implicitly implements `Finalizable` and is the idiomatic form; the explicit `implements Finalizable` declaration is optional but permitted for documentation.

```
shared class FileHandle {
  let fd: int;

  new(path: string) { this.fd = openFile(path); }

  func finalize(): void {
    closeFile(this.fd);
  }
}
```

Finalizer rules:

- `finalize()` is invoked exactly once, at the point when the instance's last strong reference is released.
- A finalizer MUST NOT store `this` in any location reachable from a strong root. Attempting to do so is a runtime `ResurrectionError` and the program SHALL abort.
- A finalizer MUST NOT block indefinitely. Implementations MAY enforce a timeout, after which the program is aborted with `FinalizerTimeoutError`.
- A finalizer MAY throw. An exception raised in a finalizer propagates to the caller that triggered the final release. Implementations SHALL NOT swallow finalizer exceptions silently.
- The `finalizer-live-access` lint (§8.9) applies identically to `local class` and `shared class` finalizers: accessing a field whose declared type implements `Finalizable` directly (without a `weak` read) produces an advisory warning.

#### §8.1.1.5 Mode Availability Summary

| Strategy | w.s | w.c | h.s | h.d | h.n | fs |
|---|---|---|---|---|---|---|
| `local class` (default) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `shared class` | ✓ | ✓ | ✓ | ✓ | ✓ | ⚠ (arena required) |

Both strategies are available in `@mode(host.dual)` without restriction — dual-mode classes may use either modifier and will behave identically on both the JIT and AOT pipelines.

### §8.2 Visibility

Loup uses two visibility levels:

- `pub` — public, accessible from any module.
- (default) — module-private, accessible only within the declaring module.

There is no `protected` or `private`. Loup uses module-level encapsulation.

### §8.3 Inheritance

Loup supports single inheritance from one superclass (defaulting to `Any` if omitted) plus implementation of multiple interfaces. A class that (directly or transitively) inherits from itself creates a circular class hierarchy and is a compile-time error (`E_CIRCULAR_CLASS`).



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
    return i"Shape with area {$ area() $}";
  }
}

class Circle : Shape {
  pub let radius: float;
  new(radius: float) { this.radius = radius; }

  pub func area(): float { return 3.14159 * radius * radius; }
  pub func perimeter(): float { return 2.0 * 3.14159 * radius; }
}
```

Abstract classes cannot be instantiated directly — attempting to do so is a compile-time error (`E_ABSTRACT_INSTANTIATION`). Concrete subclasses that implement all abstract methods may be instantiated normally.

**Abstract method completeness.** A non-abstract class that extends an `abstract class` must implement all inherited abstract methods. Leaving any abstract method unimplemented is `E_ABSTRACT_NOT_IMPLEMENTED`, naming the missing method(s). A subclass may itself be declared `abstract` to defer implementation — `abstract class` subclasses are not required to implement parent abstract methods immediately.

**`synchronized` inheritance.** A class that inherits from a `synchronized` class is automatically `synchronized`. The per-instance mutex is part of the base class instance layout and is present in every subclass instance. A subclass cannot opt out of synchronization if the base is `synchronized`. Declaring `synchronized` explicitly on a subclass that already inherits `synchronized` is permitted but redundant.

**`modifier` method overrides.** A method that overrides a `modifier` method in a superclass must itself be declared `modifier` — `E_MODIFIER_OVERRIDE_MISMATCH`. The mutation contract is part of the method's observable interface and cannot be silently removed by a subclass. Overriding a non-`modifier` method with a `modifier` method is permitted — the subclass strengthens the contract. Abstract `modifier` methods may be declared in abstract classes; implementing subclasses must provide a `modifier` implementation.

### §8.4 Constructors, `this`, and `Self`

**Constructors** use `new(params) { ... }` inside the class body. A class may have at most one constructor. If no constructor is declared, the compiler generates a default constructor that accepts all declared fields as named parameters.

**Multiple construction strategies** are expressed using `pub static func` factory methods rather than overloaded constructors. This is the idiomatic Loup pattern:

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

Attempting to declare two `new(...)` blocks in one class is a compile-time error (`E_DUPLICATE_CONSTRUCTOR`). If no constructor is declared, the compiler generates a default constructor that accepts all declared fields as named parameters:

```
class Point : Any {
  pub let x: float;
  pub let y: float;
  // auto-generated: new(x: float, y: float) { this.x = x; this.y = y; }
}

let p = Point(x=1.0, y=2.0);
```

**`this`** is always implicitly available inside instance methods and constructors. It refers to the current instance and is read-only — it cannot be reassigned.

**`super(args)`** calls the direct superclass constructor from within a subclass constructor body. It must appear as a statement before any access to `this` fields or methods. A subclass whose superclass has a non-default constructor MUST call `super(args)`; omitting it is a compile-time error (`E_SUPER_NOT_CALLED`). `super()` may not be called from instance methods — only from constructor bodies.

**Error codes.**

| Code | Mode | Condition |
|---|---|---|
| `E_CIRCULAR_CLASS` | All | Class hierarchy contains a cycle (e.g. `class A : B` and `class B : A`) |
| `E_ABSTRACT_INSTANTIATION` | All | Attempt to directly instantiate an `abstract class` — only concrete subclasses may be instantiated |
| `E_ABSTRACT_NOT_IMPLEMENTED` | All | A non-abstract class extends an `abstract class` but does not implement all inherited abstract methods |
| `E_DUPLICATE_CONSTRUCTOR` | All | Two `new(...)` constructor blocks declared in the same class |
| `E_SUPER_NOT_CALLED` | All | Subclass constructor body accesses `this` or returns without calling `super(args)` when the superclass has a non-default constructor |
| `E_SUPER_NOT_CONSTRUCTOR` | All | `super(args)` appears outside a constructor body |
| `E_SUPER_WRONG_ARGS` | All | `super(args)` argument types or count do not match any superclass constructor signature |

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

Instance fields without a default value must be initialized in the constructor (`E_FIELD_NOT_INITIALIZED` if any remain unset after the constructor body).

**External writes to `pub var` fields and safe contexts.** A direct write to a `pub var` field on a plain ARC class instance from outside the class — such as `user.email = "new@example.com"` — requires a safe context, identically to calling a `modifier` method on that instance (§23.4.11). On `unique` receivers, direct field writes are unconditionally safe. On `synchronized` class instances, external field writes acquire the per-instance lock automatically.

**`weak` field qualifier.** A `weak` field holds a non-owning reference to a `local class` or `shared class` instance. Under the ARC memory model (§8.1.1), `weak` fields do not increment the strong refcount; when the referent is deallocated (strong count reaches zero), the `weak` field automatically reads as `None`. The implementation maintains a weak-reference side table that records live weak references to each instance so they can be atomically zeroed at destruction time.

`weak` fields are always typed `T?` (i.e., `Option[T]`). Assigning a non-optional value to a `weak` field is permitted and automatically wraps it in `Some`. Reading a `weak` field always yields `Option[T]`.

```
class Node : Any {
  pub let value: int;
  pub weak var parent: Node?;   // weak — does not prevent deallocation
  pub var children: list[Node]; // strong reference
  new(value: int) { this.value = value; this.parent = None; }
}
```

**Mode availability (updated in v1.18).** `weak` references are available in all modes that have an ARC memory model: `@mode(web.scripted)`, `@mode(web.compiled)`, `@mode(host.scripted)`, `@mode(host.dual)`, and `@mode(host.native)`. In modes where the runtime backs `local class` with a tracing collector (per §8.1.1.1), the runtime maintains the required weak-reference side table as part of its ARC-equivalent contract. `weak` is **not available** in `@mode(freestanding)` — the target does not provide the side-table infrastructure required (`E_FREESTANDING_WEAK`).

**`weak` references to `shared class` instances.** A `weak` field referencing a `shared class` instance compiles to a `SharedWeakRef[T]` (see Loup Standard Library Reference §21.1.6) and is backed by the arena's weak-reference side table (§17b.5 header offset 32). Weak-upgrade uses the compare-exchange protocol specified in §17b.7 under "Refcount protocol". Cross-thread weak-upgrade is atomic — a `weak` read that observes a live instance is guaranteed to see that instance remain live for the duration of the read.

**`unowned[~name]` field qualifier.** An `unowned[~name]` field holds a non-owning reference whose safety is **compile-time proven** via the existing region system (§23.4.2). The class must declare `[lifetime ~name]` as a class-level lifetime parameter. The referent must originate from a scope that the compiler can statically verify contains (outlives) the `~name` region.

`unowned[~name]` fields do not increment `strong_count` and are not tracked by the ARC zeroing side table. Because safety is proven at compile time, **no runtime null-trap is inserted** — access is zero-cost, equivalent to a raw pointer load.

```loup
@mode(host.native)

// The class carries [lifetime ~owner] anchoring all unowned fields.
class TreeNode[lifetime ~owner] : Any {
  pub let value: int;

  // Compile-time proven: every value assigned here must originate from
  // a scope that the compiler verifies contains (outlives) ~owner.
  unowned[~owner] var parent: TreeNode[~owner]?

  pub var children: list[TreeNode[~owner]] = [];

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

**Scope.** `unowned[~name]` fields are available in all six modes (see §2.6 and §23.4). The region model is enforced identically across modes; the absence of a runtime side table is what distinguishes `unowned[~name]` from `weak`, and that absence is meaningful on every target.

**`weak` vs `unowned[~name]`.** `weak` is always safe on all targets and requires no lifetime annotation. Use `unowned[~name]` only when: (a) the lifetime relationship is strictly hierarchical and provable from scope nesting, and (b) the absence of a runtime side-table lookup is measurable and meaningful for the workload.

```loup
@mode(host.native)

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

| Code | Mode | Condition |
|---|---|---|
| `E_FIELD_NOT_INITIALIZED` | All | Constructor body exits without initializing one or more `let` or `var` fields that have no declared default value |

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
- `!{...}` requires the left operand to implement `Dynamic`; otherwise it is a compile-time error (`E_DYNAMIC_ACCESS_NOT_DYNAMIC`).

| Code | Mode | Condition |
|---|---|---|
| `E_DYNAMIC_ACCESS_NOT_DYNAMIC` | All | `obj!{field}` where `obj`'s type does not implement the `Dynamic` interface |

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
| `@jsexport` | `func`, `async func` | Marks a function as callable from JavaScript (see §18.2) |
| `@concurrent` | `async func` | Asserts function is safe from any executor thread; enforces Sendable captures (§17.9.5) |
| `@unsafe(reason)` | `extern native func`, `class`, `func` | Programmer-asserted safety claim, bypassing compiler verification; see §23.4.6 |
| `@vectorize` | `for` loop | Hints compiler to auto-vectorize the loop body (§21.16) |
| `@vectorize(width=N)` | `for` loop | Same with suggested SIMD lane count (§21.16) |
| `@overflowWrapping` | `func` | Opt-in wrapping arithmetic for all fixed-width integers in the function (§4.1.1) |
| `@deprecated(msg)` | `func`, `class`, `interface`, `enum`, `struct`, method | Marks a symbol as intended for removal in a future version. Any use of a `@deprecated` symbol at a call site or reference site emits a compile-time warning that includes `msg`. The symbol remains usable. |
| `@mode(m)` | File (first line) | Declares the execution mode: `@mode(host.scripted)` (default), `@mode(web.compiled)`, `@mode(host.native)`, or `@mode(freestanding)` — must be the first active token (§2.5) |
| `@entry` | `func` | Freestanding: bare binary entry point (§24.5) |
| `@panic_handler` | `func` | Freestanding: called on panic when `--panic=custom` (§24.6) |
| `@interrupt(...)` | `func` | Freestanding: interrupt service routine (§24.13) |
| `@naked` | `func` | Freestanding: suppresses prologue/epilogue (§24.14) |
| `@callconv(c)` | `func` | Freestanding: overrides calling convention (§24.15) |
| `@allocator` | `func` | Freestanding: registers custom heap allocator (§24.16) |
| `@deallocator` | `func` | Freestanding: registers matching deallocator (§24.16) |
| `@repr(layout)` | `struct` | Freestanding/native: controls struct memory layout (§24.10) |
| `@align(n)` | `struct`, `func`, static | Freestanding/native: minimum alignment in bytes (§24.11) |
| `@section(name)` | `func`, static | Freestanding: ELF/Mach-O section placement (§24.12) |
| `@volatile` | parameter | Freestanding: volatile MMIO borrow parameter (§24.8) |
| `@interruptSafe` | `func` | Freestanding: declares a function safe to call from interrupt handler context; enforces `native.atomic`-only access to `static var` bindings (§24.24.1) |
| `@signalSafe` | `func` | Native: declares a function safe to call from OS signal handler context; enforces signal-safe operations only (§26.9) |
| `@lockOrder(n)` | `synchronized class` | Native: assigns a lock-ordering level `n` to a `synchronized` class; prevents lock-ordering inversions at compile time (§23.4.13) |
| `@debug_control_channel` | `func` | Freestanding (`--debug`): registers the bidirectional control transport for the freestanding debug service (§24.25.3) |
| `@debug_trace_channel` | `func` | Freestanding (`--debug`): registers the unidirectional trace transport for the freestanding debug service (§24.25.3) |
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

**Finalization ordering (normative).** The order in which `finalize()` is called on a set of simultaneously unreachable objects is unspecified. A `finalize()` implementation MUST NOT access any field whose declared type implements `Finalizable` directly — that object may have already been finalized. Access such fields only through `weak` references, checking for `None` before use. The compiler emits the `finalizer-live-access` lint warning when a `finalize()` body accesses a field whose declared type implements `Finalizable` without going through a `weak` reference.

**Panic or exception during ARC `finalize()` (normative, native target).** If `finalize()` throws or panics while the ARC runtime is releasing the last strong reference, the ARC runtime SHALL: (1) catch the exception; (2) complete deallocation of the object's storage; (3) log the caught exception via `debug.log` with severity `Error`. The exception SHALL NOT propagate out of the release operation. It is undefined behavior to retain or access any reference to the partially-finalized object after `finalize()` returns.

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

### §8.11 `unique class` Declaration

*(This section is normative. Applies to all six modes per §2.6; semantics around ARC elision are most consequential in `@mode(host.dual)` and `@mode(host.native)`.)*

`unique class` declares a class whose instances are **always uniquely owned** — ARC is never applied and aliases are structurally prohibited. It is the class-level analogue of `unique let`/`unique var`: instead of marking a binding as unique, it marks the entire type as ownership-locked.

```loup
@mode(host.native)

unique class FileHandle : Any {
    pub var fd:   int;
    pub var path: string;

    pub static func open(path: string): FileHandle { ... }
    pub func close(): void { ... }
}
```

**Construction.** `unique class` instances must always be bound with `unique let` or `unique var`. Any non-`unique` binding position is `E_UNIQUE_CLASS_ARC_BINDING`:

```loup
unique let fh = FileHandle.open("/etc/hosts")   // OK
let fh        = FileHandle.open("/etc/hosts")   // E_UNIQUE_CLASS_ARC_BINDING
arc let fh    = FileHandle.open("/etc/hosts")   // E_UNIQUE_CLASS_ARC_BINDING
```

**Move semantics.** Assigning a `unique class` binding to another binding moves ownership; the source is consumed:

```loup
unique let a = FileHandle.open("/etc/hosts")
unique let b = a    // MOVE: b owns the handle; a consumed
a.close()           // E_USE_AFTER_MOVE
```

**Borrowing.** Both `reads` (shared immutable borrow) and `edits` (exclusive mutable borrow) are valid on `unique` values. Because single ownership is compiler-proven, exclusivity for `edits` requires no alias check:

```loup
unique let fh = FileHandle.open("/data/log.txt")
inspect(reads: fh)        // shared borrow — fh not consumed
inspect(fh)               // identical — implicit reads
write(edits: fh)          // exclusive borrow — trivially safe, no alias scan
```

**`consume` is prohibited.** `consume` downgrades a `unique` value to ARC. For `unique class` types this downgrade is structurally forbidden — the type can never enter ARC:

```loup
unique let fh = FileHandle.open("/data/log.txt")
let shared = consume fh   // E_UNIQUE_CLASS_CONSUME
```

**Subclassing.** A subclass of a `unique class` MUST also be `unique class`. A non-`unique` subclass could escape the constraint via the base type:

```loup
unique class Handle : Any { ... }

unique class FileHandle : Handle { ... }   // OK
class FileHandle : Handle { ... }
// E_UNIQUE_CLASS_SUBCLASS: Handle is a unique class;
// all subclasses must also be declared unique class
```

**Collections.** `unique class` instances may be stored in collections; extraction moves the element out. In-place access returns an implicit `reads` borrow:

```loup
unique var handles: list[FileHandle] = []
unique let fh = FileHandle.open("/a")
handles.append(fh)                        // MOVE into list
unique let h2 = handles.remove(0)         // MOVE out of list
inspect(handles[0])                       // implicit reads borrow in place
```

**Struct fields.** A struct may hold a `unique class` field with `unique var`:

```loup
struct Connection {
    var host:   string;
    unique var sock: Socket;
}
```

A struct with a `unique class` field is move-only (§10.3.2).

**Thread transfer.** A `unique class` value may be moved into a `Thread.spawn` closure; the caller loses access at the move point:

```loup
unique let fh = FileHandle.open("/data/log.txt")
let t = Thread.spawn(func() { process(fh) })
fh.close()   // E_USE_AFTER_MOVE
```

**Type parameters.** `unique class` supports type parameters normally:

```loup
@mode(host.native)

unique class Pool[T] : Any {
    pub var items: list[T] = [];
    pub func put(item: T): void { items = items + [item] }
    pub func take(): Option[T] { ... }
}

unique let pool = Pool[Connection].new()
```

Type parameter constraints apply normally: `unique class SortedPool[T: Comparable[T]]` is valid. The grammar production `class_decl ::= 'unique'? 'class' IDENT type_params? ...` covers both forms. A `unique class` type argument in a generic position, such as `list[FileHandle]`, is valid — the list holds the uniquely-owned values by move (extraction moves an element out; in-place access returns a `borrow`).

**`unique class` and `Sendable`.** `unique class` instances are not `Sendable` under the standard rule — they cannot be shared across threads since `Sendable` implies safe concurrent aliasing and `unique` prohibits aliasing entirely. A `unique class` value may be **moved** into a `Thread.spawn` closure, transferring ownership to the spawned thread with no concurrent access. Attempting to capture a `unique class` value by reference (without moving) in a `Thread.spawn` closure is a compile-time error. `unique class` types may not declare `implements Sendable` — doing so is `E_UNIQUE_CLASS_SENDABLE`.

**Freestanding mode.** In `@mode(freestanding)`, all classes with an `@allocator` effectively behave as `unique class` — ARC is unavailable. Declaring `unique class` in freestanding is valid and documents the intent. For multi-core freestanding code, inter-CPU data sharing uses `native.atomic` primitives directly — `Mutex[T]` and `RwLock[T]` are not available in freestanding mode.

**Error codes.**

| Code | Condition |
|---|---|
| `E_UNIQUE_CLASS_ARC_BINDING` | `unique class` type constructed into a non-`unique` binding |
| `E_UNIQUE_CLASS_CONSUME` | `consume` applied to a `unique class` value |
| `E_UNIQUE_CLASS_SUBCLASS` | Non-`unique` subclass declared for a `unique class` parent |
| `E_UNIQUE_CLASS_SENDABLE` | `unique class` type declares `implements Sendable` — prohibited |


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
  The formatter accepts both and normalises to comma style for payload enums and semicolon style for unit-only enums. Mixing both separators in a single enum body is a compile-time error (`E_ENUM_MIXED_SEP`).


| Code | Mode | Condition |
|---|---|---|
| `E_ENUM_MIXED_SEP` | All | Enum body uses both `,` and `;` as variant separators |

**Enum lifetime parameters.** An enum may declare lifetime parameters to allow `borrow[~name]` variant payloads. The syntax follows the same `[lifetime ~name]` convention used for structs (§10.11) and interfaces (§11.4):

```loup
@mode(host.native)

enum Token[lifetime ~src] {
  Word(borrow[~src] string),
  Number(int),
  Symbol(char),
}
```

Destructuring a lifetime-parameterized enum variant extracts the borrow with its label intact:

```loup
match tok {
  Token.Word(borrow[~src] w) => process(borrow w),
  Token.Number(n)            => display(n),
  Token.Symbol(c)            => emit(c),
}
```

A lifetime-parameterized enum is implicitly non-`Sendable` (§17.8.1). Lifetime parameters on enums are valid in all six modes.

### §9.2 Enum/`Any` Boundary

When an enum value is stored in an `Any`-typed position, the runtime wraps it in a heap-allocated box preserving the enum's full type identity (declared type name, type parameters, and active variant):

- **Boxing:** Assigning an enum value to an `Any`-typed variable boxes it automatically. The resulting `Any` carries the enum's full type.
- **Unboxing:** Extracting an enum from `Any` requires `match` or `as`/`as?` cast operators (§4.3). There is no implicit unboxing coercion.
- **`match` over `Any`:** Dispatch proceeds on the actual boxed enum type at runtime. If no arm matches and no wildcard is present, a `MatchError` is thrown.
- **`typeOf` on a boxed enum:** Returns a `Type` with `kind == "enum"`, the declared name, and instantiated type arguments.

```
func describe(x: Any): string {
  return match x {
    Circle(r)  => i"circle with radius {$ r $}",
    Rect(w, h) => i"rect {$ w $}x{$ h $}",
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
- The compiler enforces exhaustiveness: every variant must be covered, or a wildcard `_` arm must be present (`E_MATCH_NONEXHAUSTIVE`).
- Patterns may be: variant names (with positional or named bindings), wildcards (`_`), guards (`Some(x) if (x > 0)`), and nested patterns (`Ok(Some(x))`).
- Each `match` arm has exactly **one pattern**. Or-patterns (multiple patterns per arm separated by `|`) are not supported; use separate arms or a guard expression to match multiple cases.
- Patterns are matched top-to-bottom; the first matching arm executes.
- Bindings introduced in a pattern arm are scoped to that arm's expression only.
- `match` is a block statement (no trailing `;` on the construct itself).

| Code | Mode | Condition |
|---|---|---|
| `E_MATCH_NONEXHAUSTIVE` | All | `match` over a statically-typed enum or union has no wildcard `_` arm and does not cover all variants/types |

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
    string(s) => i"string: {$ s $}",
    int(n)    => i"int: {$ n $}",
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

### §10.3.1 Pure Value Type Invariant

*(This section is normative. Applies to all targets and all execution modes.)*

A struct field may not have a class type. The field's declared type must be one of:

- A primitive type (`int`, `float`, `bool`, `char`, `string`, `bytes`, `bigint`, `decimal`, or any fixed-width numeric type)
- A built-in collection type (`list[T]`, `dict[K, V]`, `set[T]`, `tuple[...]`) where all type arguments also satisfy this rule recursively
- Another struct, provided that struct also satisfies this rule
- An enum, provided all variant payloads satisfy this rule
- A function type (`fn(...)`, `noescape fn(...)`)
- `Option[T]` or `Result[T, E]` where `T` and `E` satisfy this rule
- A `borrow[~name]` reference (available in all modes, §2.6)
- A `unique T` reference where `T` is a class type (available in all modes, §2.6) — permitted because `unique` carries no ARC retain/release and no aliasing; the compiler proves single ownership at all times (§23.4.7)

Declaring a struct field whose resolved type is a plain ARC class reference is a compile-time error (`E_STRUCT_CLASS_FIELD`). A `unique T` field is explicitly not a plain ARC reference and does not trigger this error.

```loup
class Connection : Any { ... }

// COMPILE ERROR — class reference in struct field
struct Request {
  var path: string;       // OK — primitive
  var conn: Connection;   // E_STRUCT_CLASS_FIELD
}

// OK — all fields are value types
struct Request {
  var path: string;
  var headers: dict[string, string];
  var body: bytes;
}
```

**Generic structs.** For a generic struct with an unconstrained type parameter `T`, the compiler checks §10.3.1 at each instantiation site against the resolved concrete type. If the resolved type is a class, `E_STRUCT_CLASS_FIELD` is emitted at the instantiation site.

To enforce the constraint at the definition site and produce a clearer error at call sites, annotate the type parameter with the `ValueType` constraint:

```loup
// Unconstrained — error surfaces at instantiation site
struct Box[T] {
  var value: T;
}
let b = Box[Connection](value=conn)      // E_STRUCT_CLASS_FIELD

// Constrained — error at definition if violated; clearer message at call sites
struct Box[T: ValueType] {
  var value: T;
}
let b = Box[Connection](value=conn)      // E_VALUETYPE_CONSTRAINT: Connection does not satisfy ValueType
```

**`ValueType` constraint.** `ValueType` is a compiler-intrinsic type constraint. It is satisfied automatically by any type that passes §10.3.1 — primitives, structs, enums, built-in collections with `ValueType` type arguments, function types, and `unique T` references. It is never satisfied by a plain ARC class type. `ValueType` cannot be implemented or extended by user code; it is not an interface.

**Rationale.** Permitting class-typed fields would introduce shared heap aliasing through struct copy semantics — two copies of the same struct would reference the same heap object, violating the independence that value semantics implies. Keeping structs free of class references ensures that copies are always fully independent, that `edits` (exclusive borrow) on structs is always deeply exclusive, and that the struct/class boundary is unambiguous across all targets and execution modes.

**When you need a reference-typed container holding other reference-typed objects**, use a class. The `structures.*` module provides class-based mutable container types for this purpose.

**Error codes.**

| Code | Meaning |
|---|---|
| `E_STRUCT_CLASS_FIELD` | Struct field's resolved type is a plain ARC class reference — at definition for concrete fields, at instantiation for generic fields; `unique T` fields are exempt |
| `E_VALUETYPE_CONSTRAINT` | Type argument does not satisfy the `ValueType` constraint |

### §10.3.2 Move Semantics for Structs with `unique` Fields

*(This section is normative. Applies to `@mode(host.native)` and `@mode(freestanding)`.)*

A struct containing one or more `unique`-qualified fields is a **move-only struct**. Move-only structs have different assignment semantics from ordinary structs.

**Ordinary structs** (no `unique` fields) retain copy semantics — assignment produces an independent copy, and the source binding remains valid:

```loup
@mode(web.compiled)

struct Point { x: float; y: float; }

let a = Point(x=1.0, y=2.0)
let b = a        // copy — a and b are independent values
use(a)           // OK — a is still valid
```

**Move-only structs** (one or more `unique` fields) transfer ownership on assignment — the source binding is consumed and may not be used again:

```loup
@mode(host.native)

struct Request {
  var path: string;
  unique var conn: Connection;   // unique field — makes Request move-only
}

let r1 = Request(path="/api", conn=Connection.open(addr))
let r2 = r1        // MOVE — r1 is consumed; r2 owns the Connection
use(r1)            // E_USE_AFTER_MOVE: r1 was moved to r2
```

**Function call semantics.** A no-verb parameter on a move-only struct is an implicit `reads` borrow — the caller retains ownership after the call. To transfer ownership into the function, declare the parameter with `takes`:

```loup
// Implicit reads borrow (default) — caller retains ownership
func inspect(req: Request): string { return req.path; }  // implicit reads

let r = Request(path="/api", conn=Connection.open(addr))
inspect(r)           // ✓ implicit reads — r still valid after call
inspect(reads: r)    // ✓ explicit reads — identical
use(r)               // OK — r still valid
```

To transfer ownership, declare the parameter with `takes` and acknowledge at the call site:

```loup
func handle(takes req: Request): void { ... }

let r = Request(path="/api", conn=Connection.open(addr))
handle(takes: r)     // MOVE — r is consumed by the call
use(r)               // E_USE_AFTER_TAKE
```

For a mutable borrow without consuming, use `edits`:

```loup
func update(edits req: Request): void { req.path = "/updated"; }

update(edits: r)     // exclusive mutable borrow — r not consumed
use(r)               // OK — r still valid
```

**`with`-copy is prohibited on move-only structs.** The `with` copy expression (`s with (field=val)`) is not available for move-only structs — it would produce a copy, violating the uniqueness of the `unique` fields. Use destructuring or field-by-field construction instead (`E_WITH_COPY_MOVE_ONLY`).

**The compiler distinguishes categories at the struct definition site.** A struct is move-only if and only if it has at least one `unique`-qualified field. This determination is made at definition time and does not depend on the concrete types substituted for generic parameters. A generic struct with a `unique` field is unconditionally move-only regardless of what `T` is instantiated with.

**`unique` fields are not copied in struct copies.** Because move-only structs are moved rather than copied, there is no scenario where a `unique` field would need to be duplicated. The move transfers the `unique` field's ownership to the destination binding; the source binding loses access to the field.

**Error codes.**

| Code | Meaning |
|---|---|
| `E_USE_AFTER_MOVE` | Binding accessed after its value was moved to another binding via assignment |
| `E_USE_AFTER_TAKE` | Binding accessed after ownership was transferred at a `takes:` call site (§23.4.9) |




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

The `with` expression creates modified copies of structs. Using `with` on a class (not a struct) is a compile-time error (`E_WITH_COPY_WRONG_TYPE`).

The `with` expression creates modified copies of structs:

```
let p1 = Point(x=1.0, y=2.0);
let p2 = p1 with (x=3.0);        // Point(x=3.0, y=2.0)
let p3 = p1 with (x=0.0, y=0.0); // Point(x=0.0, y=0.0)
```

For any struct value `s` and a `with` expression `s with (field=newValue)`, the result is a new struct where the specified field has `newValue` and all other fields are copied from `s`.

**`with`-copy and `borrow[~name]` fields.** When a struct carries `borrow[~name]` fields, a `with`-copy expression `s with (field = newVal)` is valid only when `newVal` is a `borrow[~name]` value from a region that satisfies `~name` by covariance (the same label or a longer-lived source, including `~static`). Supplying a value from a mismatched lifetime region is a compile-time error (`E_BORROW_WITH_MISMATCH`). Fields that are not `borrow[~name]` fields are unaffected by this rule.

| Code | Mode | Condition |
|---|---|---|
| `E_WITH_COPY_WRONG_TYPE` | All | `with` copy expression used on a class instance — only structs support `with` copying |
| `E_WITH_COPY_MOVE_ONLY` | All | `with` copy expression used on a move-only struct (one with `unique` fields) |
| `E_WITH_COPY_UNKNOWN_FIELD` | All | `with` copy expression names a field that does not exist on the struct type |

### §10.8 Struct Destructuring

```
let Point(x=px, y=py) = somePoint;

match shape {
  Point(x=0.0, y=0.0) => "origin",
  Point(x=x, y=y)     => i"({$ x $}, {$ y $})",
}
```

### §10.9 Compiled Mode

Structs are the preferred type for compiled mode data records — they map directly to Wasm GC structs or native C-compatible structs with no boxing, no vtable, and no GC overhead for stack-allocated instances.

### §10.10 Relationship to Other Types

| Type | Fields | Semantics | Inheritance | Use Case |
|---|---|---|---|---|
| `struct` | Named | Value (pure — no class fields, §10.3.1) | None | Plain data records |
| `class` | Named | Reference | Single + interfaces | Objects with identity, polymorphism |
| `tuple` | Positional | Value | None | Ad-hoc groupings |
| `enum` | Named variants | Value (payloads must satisfy §10.3.1) | None | Sum types / tagged unions |


### §10.11 Lifetime-Parameterized Structs

*(This section is normative. Available in all six modes; see §2.6.)*

A struct may declare one or more lifetime parameters to allow `borrow[~name]` fields whose source region is tracked across function boundaries. Lifetime parameters are declared in the struct's `[...]` generic brackets using the `lifetime` keyword:

```loup
@mode(host.native)

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
- `[lifetime ~name]` declarations are available in all six modes (see §2.6 and §23.4). The region model is enforced identically across modes — region containment and borrow-escape checks are compile-time properties that do not depend on the runtime memory model.
- A struct may declare multiple lifetime parameters and freely mix them with type parameters: `struct Foo[lifetime ~a, lifetime ~b, T]`.
- A struct that declares a `[lifetime ~name]` parameter or that contains any `borrow[~name]` field is implicitly non-`Sendable`. Explicitly writing `implements Sendable` on such a struct is a compile-time error (`E_SENDABLE_LIFETIME`). See §17.8.1.
- A lifetime-parameterized struct may not be stored in a class field. Class instances are heap-allocated and may outlive any stack frame; storing a borrow-field struct in a class instance would allow the borrow to escape its source region.

**Methods on lifetime-parameterized structs.** Methods have implicit access to the struct's declared lifetime parameters. The compiler infers that a `borrow` return type on a method borrows from `self`'s lifetime — no explicit annotation is required for the common case:

```loup
@mode(host.native)

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

```loup
@mode(host.native)

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

```loup
@mode(host.native)

type StrSlice[lifetime ~src]     = Slice[~src];
type ParseState[lifetime ~src, T] = Parser[~src, T];
```

---

## §11 Interfaces

*(This section is normative.)*

### §11.1 Interface Declarations

Interfaces define contracts that classes and structs explicitly implement. Interface methods may be declared as abstract signatures (using `;`) or with a default implementation (using a `{ body }` block). A class implementing the interface may override a default-body method; if it does not, the default implementation is used. Abstract interface methods (ending in `;`) must be provided by every implementing class:

```loup
interface Greetable {
  func name(): string;            // abstract — must be implemented
  func greet(): string {          // default implementation
    return i"Hello, {$ name() $}!";
  }
}
```

```loup
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

**Interface inheritance.** An interface may extend one or more superinterfaces using the `:` clause: `interface IMutableMap[K, V] : IReadableMap[K, V] { ... }`. A sub-interface inherits all abstract and default method declarations from its superinterfaces. A class that `implements` the sub-interface must implement all inherited members in addition to the directly-declared ones. Multiple superinterfaces are permitted: `interface Foo : Bar, Baz { ... }`. Circular interface hierarchies are a compile-time error (`E_CIRCULAR_INTERFACE`).

| Code | Mode | Condition |
|---|---|---|
| `E_INTERFACE_NOT_IMPLEMENTED` | All | A class declares `implements I` but does not provide a concrete implementation for one or more abstract methods of `I` (or its superinterfaces) |
| `E_CIRCULAR_INTERFACE` | All | Interface hierarchy contains a cycle (e.g. `interface A : B` and `interface B : A`) |
| `E_INTERFACE_CONFLICT` | All | Two superinterfaces declare incompatible default method implementations for the same method name |

**Interface method visibility.** Interface method declarations without an explicit access modifier are implicitly `pub`. Interfaces define public contracts — their members are callable from any module that holds a value of the interface type. An explicit `pub` is permitted and encouraged for documentation clarity but has the same effect as omitting it. Module-private interface methods (which would be inaccessible outside the declaring module) are not supported; the compiler treats all interface members as `pub` regardless of whether the keyword is written.

**`modifier` methods in interfaces.** An interface may declare `modifier` abstract or default methods. A class implementing the interface must declare the corresponding method as `modifier`; implementing a `modifier` interface method with a non-`modifier` method is `E_MODIFIER_OVERRIDE_MISMATCH`. This mirrors the rule for superclass overrides (§8.3): the mutation contract is part of the observable interface and cannot be silently dropped by an implementation. Overriding a non-`modifier` interface method with a `modifier` implementation is permitted — the implementing class strengthens the contract.

**`safe func` methods in interfaces.** An interface may declare `safe func` abstract or default methods. When a class implements a `safe func` interface method, the implementing method's `safe` status determines calling semantics for the concrete type: if the implementation omits `safe`, callers through the concrete type do not require a safe context; calls dispatched through the interface type always require one. Implementing a `safe func` interface method with a non-`safe func` method is permitted (less restrictive); implementing a non-`safe func` interface method with a `safe func` method is also permitted (more restrictive — callers of the concrete type must provide a safe context).

**Default parameter values in interface methods.** Interface method declarations may include default parameter values. An implementing class inherits those defaults: if the implementation omits a default value, callers may still call the method with that parameter omitted and the interface default is used. An implementation may provide a different default value; the implementation's default takes precedence for calls dispatched through the concrete type, while the interface default applies when the call is dispatched through the interface type. The compiler verifies that the implementation's parameter types match the interface's declared types regardless of default values.

### §11.2 Standard Interfaces

The following interfaces are defined by the language and standard library:

```
interface Iterable[T]       { func iter(): Iterator[T]; }
interface Iterator[T]       { func next(): Option[T]; }
interface AsyncIterable[T]  { func asyncIter(): AsyncIterator[T]; }
interface AsyncIterator[T]  { async func next(): Task[Option[T]]; }
                              // optional: async func close(): Task[void]
interface KeyLookup[K, V]   { func has(key: K): bool; func get(key: K): Option[V]; }
interface Readable          { func read(n: int): bytes; }
interface Writable          { func write(b: bytes): int; }
interface Closeable         { func close(): void; }
interface Sized             { func len(): int; }
interface From[E]           { static func from(err: E): Self; }
interface Comparable[T] : Equatable[T] {
                              func compareTo(other: T): int;
                              operator func ==(other: T): bool { return compareTo(other) == 0; } }
interface Equatable[T]      { operator func ==(other: T): bool; }
interface Hashable          { func hashCode(): int; }
interface Renderable        { func render(ctx: RenderContext): string; }
interface Dynamic           { pub func hasField(name: string): bool; pub func getField(name: string): Any; pub func setField(name: string, value: Any): void; pub func deleteField(name: string): bool; pub func fieldNames(): list[string]; }
interface Finalizable       { func finalize(): void; }

// Web Component lifecycle — implemented by @webcomponent classes (§19.10).
// All methods have default no-op implementations; override only what is needed.
interface WebComponentLifecycle {
  func connected(): void { }        // element inserted into a document
  func disconnected(): void { }     // element removed from a document
  func adopted(): void { }          // element moved to a new document
  func attributeChanged(name: string, oldValue: string?, newValue: string?): void { }
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

**Comparable and Hashable.** Because `Comparable[T]` implies `Equatable[T]`, any type that implements `Comparable[T]` and is used as a `set[T]` element or `dict[T, V]` key must also implement `Hashable` — the same consistency requirement that applies to `Equatable[T]` directly (§5.1). The compiler enforces this: if a `Comparable[T]` type is used in a `set` or as a `dict` key without `Hashable`, the compiler emits compile-time error `E_HASHABLE_REQUIRED`. This transitivity is intentional.

| Code | Condition |
|---|---|
| `E_HASHABLE_REQUIRED` | `Comparable[T]` type used as a `set` element or `dict` key without also implementing `Hashable` |

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
| `int`, `uint`, `int8`–`int64`, `uint8`–`uint64` | `Add`, `Sub`, `Mul`, `Div`, `FloorDiv`, `Mod`, `Pow`, `Neg`, `Comparable[T]`, `Equatable[T]`, `BitAnd`, `BitOr`, `BitXor`, `BitNot`, `Shl`, `Shr` |
| `float`, `float32`, `float64` | `Add`, `Sub`, `Mul`, `Div`, `FloorDiv`, `Mod`, `Pow`, `Neg`, `Comparable[T]`, `Equatable[T]` |
| `bigint` | `Add`, `Sub`, `Mul`, `Div`, `FloorDiv`, `Mod`, `Pow`, `Neg`, `Comparable[T]`, `Equatable[T]` |
| `decimal` | `Add`, `Sub`, `Mul`, `Div`, `FloorDiv`, `Mod`, `Neg`, `Comparable[T]`, `Equatable[T]` |
| `string` | `Add` (concatenation), `Comparable[string]`, `Equatable[string]`, `Index[int, char]`, `Contains[string]` |
| `list[T]` | `Add` (concatenation), `Index[int, T]`, `IndexSet[int, T]`, `Contains[T]` |
| `dict[K, V]` | `Index[K, V]`, `IndexSet[K, V]`, `Contains[K]`, `IReadableMap[K, V]`, `IMutableMap[K, V]` |
| `set[T]` | `Contains[T]` |
| `bytes` | `Index[int, uint8]`, `Comparable[bytes]`, `Equatable[bytes]` |

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

`Scoped[T]` and `AsyncScoped[T]` are permitted in compiled mode.

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

- `expr` must implement `Iterable[T]`; otherwise it is a compile-time error (`E_NOT_ITERABLE`).
| Code | Mode | Condition |
|---|---|---|
| `E_NOT_ITERABLE` | All | `for (x in expr)` where `expr`'s type does not implement `Iterable[T]` |

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
| `tuple[...]` | `Any` | Heterogeneous `Any`-typed iteration; not available in compiled/native/freestanding modes (use typed tuple destructuring instead) |

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

**Concurrent modification.** Modifying a collection while iterating it is undefined behavior in scripted mode and a compile-time error in compiled mode when statically detectable.

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

**Compiled mode.** User-defined iterables are permitted in compiled mode — the `Iterable[T]`/`Iterator[T]` interfaces are statically dispatched with no virtual call overhead when the concrete type is known. The element type `T` must be statically known.

**`len` vs `count`.** `len(x)` is for values with intrinsic length (primitives implementing `Sized`). `count(xs: Iterable[T]): int` explicitly iterates to count items.


### §11.4 Lifetime-Parameterized Interfaces

*(This section is normative. Available in all six modes; see §2.6.)*

An interface may declare lifetime parameters to express contracts involving `borrow[~name]` return values or method parameters:

```loup
@mode(host.native)

interface Sliceable[lifetime ~src] {
  func slice(start: int, end: int): borrow[~src] string;
}

interface Source[lifetime ~src, T] {
  func read(): borrow[~src] T;
  func remaining(): int;
}
```

**Implementing a lifetime-parameterized interface.** The implementing type must declare a matching lifetime parameter by position. The names of the parameters need not match:

```loup
@mode(host.native)

struct BorrowedSlice[lifetime ~buf] implements Sliceable[~buf] {
  borrow[~buf] data: string;
  var pos: int;

  pub func slice(start: int, end: int): borrow[~buf] string {
    return data[start:end];
  }
}
```

**Rules:**

- A class may not implement a lifetime-parameterized interface. Class instances are heap-allocated and may outlive any stack frame; they cannot safely provide borrow-returning method contracts.
- Lifetime-parameterized interfaces are valid in all six modes.
- The lifetime parameter positions on the implementing type must be compatible by covariance with the declared interface positions.

---

## §12 Generics

*(This section is normative.)*

Loup supports generic type parameters on functions, classes, interfaces, enums, and structs. This section consolidates the generic type system rules.

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

**Class-kind bounds (v1.18).** In addition to trait bounds, a generic
parameter may carry a **class-kind bound** that constrains which class
memory strategy (§8.1.1) the type must declare:

```
func handleShared[T: shared class](ref: SharedRef[T]): void { ... }
func handleLocal[T: local class](value: T): void { ... }
func handleAny[T: class](value: Any): void { ... }   // either strategy
```

Class-kind bounds compose with trait bounds via `+`:

```
func saveShared[T: shared class + Serializable](ref: SharedRef[T]): bytes {
  return serialize[T, JsonFormat](ref.get());
}
```

A class-kind bound is satisfied if `T` is declared with the matching memory
strategy (including the default implicit `local`). Violating the bound is
`E_CLASS_KIND_MISMATCH`. Class-kind bounds are resolved at compile time
from the type's declaration; they incur no runtime overhead.

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

*(This section is normative. Available in all six modes; see §2.6.)*

Lifetime parameters extend the generic parameter system. They are declared alongside type parameters in `[...]` brackets and follow all generic scoping rules with two distinctions:

- Lifetime parameters use the `lifetime` keyword and the `~` sigil: `[lifetime ~src]`.
- Type parameters use PascalCase names without a sigil: `[T]`, `[K, V]`.

Lifetime parameters and type parameters may be freely mixed in any order: `[lifetime ~src, T, lifetime ~out, E]`.

**Mixed generic brackets:**

```loup
@mode(host.native)

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

### §13.0 Namespace Declarations

A **namespace declaration** associates a source file with a dotted module path. All public declarations in the file are exposed under that path when other modules import from it:

```loup
namespace core.text;

pub class Url : Any { ... }
pub func encode(s: string): string { ... }
```

```loup
from core.text import (Url, encode);
```

**Rules:**

- The `namespace` declaration, if present, must be the first non-comment, non-blank statement in the file — immediately after the optional `@mode(...)` directive and before any imports or declarations.
- At most one `namespace` declaration per file is permitted.
- The dotted path must be an `AbsolutePath` (§27.3). It cannot be relative (`./`).
- The namespace path should match the file's location relative to the package root, though the compiler does not enforce this — mismatches produce a lint advisory `namespace-path-mismatch`.
- Files without a `namespace` declaration belong to the default namespace derived from their file path relative to the package root.
- `namespace` is a keyword (§3.4).

### §13.1 Import Syntax

**All import forms are module-level only** — they may not appear inside function bodies, class bodies, or any nested scope. See §6 "Statement Classification".

**Standard imports:**

```
from mylib.sub.utils import (Name1, Name2 as Alias);
```

**Grouped imports:**

```
from mylib.sub {
  widgets import (ThingA, Other as OA);
  network.http import (ThingB);
}
```

**Relative imports:**

```
from . {
  modulea import (Foo);
  sub.moduleb import (Bar);
}

from .. {
  packagea.modulea import (Alpha);
  packagea.moduleb import (Beta as B);
}
```

**Wildcard `*` imports are prohibited** (determinism).

**Deferred imports** (`from X defer import (...)`) create type stubs to break import cycles. See §13.10.

**Namespace packages.** Dotted names map to directories; segments can be spread across multiple roots. First unique file wins; duplicate ambiguity is an error unless disambiguated.

**`prefer compiled` clause.** An import statement may carry the `prefer compiled` modifier to request runtime fallback resolution:

```loup
from codec import (Encoder, decode) prefer compiled;
```

When the runtime encounters `prefer compiled` on an import, it attempts to load a compiled artefact before falling back to the scripted source. See §13.7 for full resolution semantics.

`prefer compiled` is valid in scripted modes — `@mode(web.scripted)`, `@mode(host.scripted)`, and `@mode(host.dual)`:

- In `@mode(web.compiled)`: compile-time lint warning (`prefer-compiled-redundant`) — compiled modules are already resolved statically; the clause has no runtime effect.
- In `@mode(host.native)` or `@mode(freestanding)`: compile-time error (`E_PREFER_COMPILED_NOT_SCRIPTED`) — dynamic module loading is unavailable; all imports are resolved statically at link time.

`prefer compiled` may appear on individual imports within a grouped import block:

```loup
from mylib {
  fast import (Encoder) prefer compiled;
  utils import (format);
}
```

| Code | Mode | Condition |
|---|---|---|
| `E_IMPORT_NOT_FOUND` | All | Imported name does not exist in the source module |
| `E_IMPORT_CONFLICT` | All | Import introduces a name that conflicts with an existing binding in the same scope |
| `E_CIRCULAR_IMPORT` | All | `import` chain creates a module dependency cycle |

### §13.2 Re-Exports

Re-exports allow barrel modules to expose symbols from internal modules:

```
// components/index.loup — barrel module
pub from .counter import (Counter);
pub from .header import (Header, HeaderProps);
pub from .sidebar import (Sidebar as AppSidebar);
```

| Code | Mode | Condition |
|---|---|---|
| `E_REEXPORT_NOT_PUB` | All | `pub from X import (name)` where `name` is not `pub` in module `X` |

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
- Only `pub` symbols from the source module can be re-exported; re-exporting a non-`pub` symbol is a compile-time error (`E_REEXPORT_NOT_PUB`).
- Re-exports do not execute the source module twice — cached bindings are reused.
- Wildcard re-exports (`pub from .module import *`) are prohibited.
- Re-exports are available in all six execution modes.

For any symbol re-exported via `pub from .internal import (Foo)`, importing `Foo` from the barrel module yields the same binding as importing `Foo` directly from the internal module.

### §13.3 Package Manifest (`.lppkg`)

Every distributable package or application root contains a manifest file with the `.lppkg` extension. The manifest may be named either `package.lppkg` (the canonical name used by tooling by default) or `<package-name>.lppkg` (matching the `package` field in the manifest). The toolchain accepts both forms; `<name>.lppkg` takes precedence over `package.lppkg` when both exist in the same directory.

```toml
# my-app.lppkg — Loup package manifest

package   my-app
version   1.4.0
loup      ">=1.3"

[deps]
net.http     = "^2.0"
jsonschema   = "^1.4"
ui-toolkit   = "^0.8"

[dev-deps]
test-runner  = "^3.1"

[dev-overrides]
# Local filesystem overrides for development. Ignored by loup install --locked
# and stripped from the published manifest. See §13.9.
# loup.http = { path = "../loup-http" }
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
- `loup` specifies the minimum required toolchain version.
- Dependency versions use constraint expressions: `^` (compatible), `~` (patch-compatible), `>=`, `<=`, exact, or range.
- A `loup.lock` lockfile records exact resolved versions of all transitive dependencies.
- **Platform profiles** (`[target.X]`) declare which stdlib capabilities are available. The compiler enforces these at build time.
- Default targets: `cli`, `browser`, `service`.
- `core.text`, `data.json`, `core.time`, and `core.collections` are available on all targets without restriction.

**`[dev-overrides]` section:**

`[dev-overrides]` maps package names to local filesystem paths, redirecting resolution to a local checkout during development:

```toml
[dev-overrides]
loup.http = { path = "../loup-http" }
my-utils  = { path = "/home/dev/my-utils" }
```

- Each entry overrides the version resolved from `loup.lock` for that package name. The `path` must contain a valid `.lppkg` manifest. The package name in that manifest must match the key.
- Packages listed in `[dev-overrides]` are compiled via the JIT pipeline and their artifacts are written to the **project-local cache** (`.loup/cache/` — see §28.7) instead of the global cache (`~/.loup/cache/`). This prevents overwriting cached artifacts that other projects depend on.
- `[dev-overrides]` entries are **ignored** when `loup install --locked` is used (CI mode).
- `[dev-overrides]` entries are **stripped** from the published manifest. `loup publish` emits a warning if any `[dev-overrides]` entries are present and proceeds only after confirmation.
- The `loup link` and `loup unlink` commands (§28.1) manage `[dev-overrides]` entries automatically.

**Namespace package installation layout:**

When multiple packages share the same root namespace (e.g., `loup.http`, `loup.db`, `loup.crypto`), the toolchain installs their `.lppkg` files side-by-side under a shared namespace directory rather than giving each package its own isolated directory. This mirrors Python's namespace package convention and allows packages to be developed and versioned independently while presenting a coherent import tree.

```
# Installed layout under a project's package root:
packages/
  loup/                          # namespace directory (no .lppkg here)
    loup.http.lppkg              # package file named after the package
    loup.db.lppkg
    loup.crypto.lppkg
  my-utils/
    my-utils.lppkg
```

- The **namespace directory** (e.g., `loup/`) is created when the first package under that namespace is installed. It contains no `.lppkg` of its own — it is purely a grouping directory.
- Each installed package's `.lppkg` file is named `<package-name>.lppkg` and placed inside the namespace directory.
- The resolver identifies a directory as a namespace package root when it contains one or more `.lppkg` files but no `package.lppkg` or `<name>.lppkg` at the directory level itself.
- Multiple packages under the same namespace can be installed, upgraded, and removed independently. Installing `loup.http` does not affect `loup.db`.
- The `loup install` command manages this layout automatically. Manual manipulation of the `packages/` directory is not supported.

### §13.4 Module Initialization

When a module is imported, its top-level statements execute sequentially in source order (see §2.1). Module initialization has the following properties:

- **Permitted top-level statements.** A module's top-level code may contain: import statements, declarations (`class`, `enum`, `interface`, `struct`, `func`, `async func`, `type`), `let`/`var` initializers, and expression statements.
- **At-most-once execution.** A module's top-level statements execute at most once. Subsequent imports reuse cached bindings.
- **Import-order initialization.** When a module contains multiple import statements, each imported module is fully initialized before the next import statement executes. For example, if a file imports module A then module B, module A's top-level statements run to completion before module B's initialization begins.
- **Circular imports.** Standard circular imports — where module A imports module B and module B imports module A via `from X import (...)` — are a compile-time error (`E_CIRCULAR_IMPORT`). Use `from X defer import (...)` (§13.10) to break cycles explicitly: deferred imports create type stubs that are resolved after the outermost import chain completes.
- **No suspension.** `await` is prohibited during module initialization (see §7.1).

The module dunders (`__name__`, `__file__`, `__execmode__`) are set before any top-level statements execute (see §2.2).

### §13.5 Package Registry

*(Full specification moved to the [Loup Packages Reference](loup-packages-reference-v1_11.md).)*

The Loup package registry is a signed, content-addressed registry of Loup
packages.  Packages are identified by name and version and authenticated with
Ed25519 signatures.  CLI commands: `loup install`, `loup cache`, `loup publish`.
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
| `native` | Native-compiled-only numerical, memory, GPU, and WebGPU primitives | `@mode(host.native)` and `@mode(freestanding)` only (WebGPU also `browser`) |
| `lang` | Language interop, macro support, template runtime | All targets |
| `debug` | Debugging, tracing, profiling, MCP agent tooling | All targets (when enabled) |
| `structures` | Data structures beyond primitive collections | All targets |

The `loup.` namespace prefix remains reserved for first-party packages (see §13.8). User packages cannot use `loup.` as a prefix. The previously reserved `system` prefix is retired; `system` may be used as a user package name beginning with v1.1.

### §13.7 Module Fallback Pairs

*(This section is normative.)*

A **module fallback pair** consists of a compiled artefact and a scripted source file that export compatible APIs for the same logical module path. The `prefer compiled` import clause (§13.1) activates fallback resolution for the named module.

#### §13.7.1 Resolution Algorithm

When the runtime encounters `from mylib.codec import (...) prefer compiled`, it executes the following sequence. The result is cached — a module resolves to exactly one implementation per session, consistent with the "module initialises at most once" rule (§2.1).

1. **Search for compiled artefact.** The runtime searches for a compiled artefact at the module's resolved file path with a platform-appropriate extension:
   - `module/path.wasm` — Wasm module (browser and CLI Wasm targets)
   - `module/path.so` / `module/path.dylib` / `module/path.dll` — native shared library (native target)
   The search follows the same directory resolution rules as for `.loup` source files.

2. **Attempt instantiation.** If a compiled artefact is found, the runtime attempts to load and instantiate it. Instantiation failure for any of the following reasons is treated identically as "compiled artefact unavailable":
   - The host environment does not support Wasm.
   - A required native shared library is not present.
   - The artefact's ABI version is incompatible with the current Loup runtime.
   - The artefact's exports do not include all names listed in the import statement.
   - Any other instantiation error.

3. **Fall back to scripted source.** If no compiled artefact is found or instantiation fails, the runtime locates the scripted source at the same module path with `.loup` extension and proceeds with the normal JIT pipeline.

4. **Failure.** If neither the compiled artefact nor the scripted source can be loaded, the runtime throws `ModuleLoadError`.

The fallback is always silent on success. Developers who need to detect which path was taken use `TypeName.__module__.__execmode__` (§2.2).

#### §13.7.2 Artefact Search Paths

The compiled artefact search path is:

1. The directory containing the scripted source file.
2. Any paths specified in `.lppkg` under `[compiled_search_paths]`.
3. The platform's standard shared library search path (for native targets).

```toml
# <name>.lppkg
[compiled_search_paths]
paths = ["./native", "/usr/local/lib/loup"]
```

#### §13.7.3 API Compatibility

The spec does not require compiled and scripted module versions to export identical APIs. The import statement determines what is required: only the names listed in the import statement must be present in whichever version is loaded.

The recommended practice is for both versions to implement the same named interface (§11.1), ensuring compile-time verification of API compatibility on both sides independently:

```loup
// codec/Api.loup — shared contract
interface Codec {
  func encode(data: bytes): bytes;
  func decode(data: bytes): bytes;
}

// codec.loup (scripted fallback)
from codec import (Api);
pub class Encoder : Any implements Api.Codec { ... }

// codec_native.loup (compiled artefact source)
@mode(web.compiled)
from codec import (Api);
pub class Encoder : Any implements Api.Codec { ... }
```

#### §13.7.4 `__execmode__` Under Fallback Resolution

After resolution, the loaded module's `__execmode__` (accessible via `TypeName.__module__.__execmode__`) reflects which path was taken. The value is whichever of the six mode strings from §2.2 applies to the loaded artifact:

- The AOT mode string (`"web.compiled"`, `"host.native"`, or the AOT side of `"host.dual"`) — a compiled artefact was instantiated successfully.
- `"host.scripted"` or `"web.scripted"` — the scripted fallback was loaded.

```loup
from codec import (Encoder) prefer compiled;

let compiledVariants = ["web.compiled", "host.native", "host.dual"];
let supportsStreaming = compiledVariants.contains(Encoder.__module__.__execmode__);
```

#### §13.7.5 Shipping Fallback Pairs

A package ships both files at the same module path:

```
src/
  codec.loup        # scripted implementation — always present
  codec.wasm        # compiled Wasm — for browser/CLI targets
  codec.so          # compiled native — for native target
```

The package registry stores and serves all variants. Consumers use `prefer compiled` and receive whichever variant matches their platform.

#### §13.7.6 `ModuleLoadError`

```loup
class RuntimeError : Exception {}
  (* General-purpose runtime error base class. Extend for specific runtime error categories.
     The standard library uses RuntimeError as the base for: StackOverflowError, TaskQueueFullError,
     NullHandleError, AlignmentError, AllocError, and other infrastructure-level errors. *)

class ModuleLoadError : Exception {
  pub let modulePath: string;
  pub let compiledAttempted: bool;
  pub let scriptedAttempted: bool;
}
```

Thrown when both the compiled artifact and the scripted source fail to load. `cause` carries the underlying instantiation error if one was produced. Catchable via `try`/`catch`.

### §13.8 Core Package Set

*(Full specification moved to the [Loup Packages Reference](loup-packages-reference-v1_11.md).)*

Five first-party packages ship under the `loup.` namespace and are available
via `loup install`:

| Package | Purpose |
|---|---|
| `loup.ai` | Multi-provider AI client (`Client`, `StructuredOutput[T]`, streaming) |
| `loup.db` | Database access (query builder, connection pool, migrations) |
| `loup.testing` | Testing framework (`describe`, `it`, `expect`) |
| `loup.bench` | Micro-benchmark harness |
| `loup.format` | Document formatting utilities |

See the Packages Reference for full API documentation.


### §13.9 `LOUPPATH` — Development Package Search Path

*(This section is normative.)*

`LOUPPATH` is an environment variable that extends the module resolver's search path for package imports, enabling development-time use of local package checkouts without modifying `loup.lock` or running `loup install`.

**Format.** `LOUPPATH` is a colon-separated list of directory paths on Unix/macOS and a semicolon-separated list on Windows. Each entry is a directory that contains a valid `.lppkg` manifest:

```sh
# Unix — two local checkouts on the search path
export LOUPPATH="/home/dev/loup-http:/home/dev/my-utils"

# Windows
set LOUPPATH=C:\dev\loup-http;C:\dev\my-utils
```

**Resolution order.** For any non-relative, non-stdlib import, the resolver searches in the following order and uses the first match:

1. `[dev-overrides]` entries in the project's `.lppkg` (§13.3) — highest priority.
2. `LOUPPATH` directories, left to right — each directory is checked for a `.lppkg` whose `package` field matches the import's package name.
3. Installed packages from `loup.lock` — resolved via the global or project-local Wasm cache (§28.7).
4. Global cache (`~/.loup/cache/`) — fallback for packages installed globally.

**Package identity.** Each `LOUPPATH` directory is treated as an independent package source. The resolver reads the directory's `.lppkg` to determine the package name and version. The version is used only for diagnostic messages — `LOUPPATH` entries take precedence over the `loup.lock`-resolved version regardless of version number. This allows a developer to test an unreleased or patched version of a dependency without bumping version numbers.

**JIT-only.** `LOUPPATH` packages are always resolved via the JIT pipeline and bypass the Wasm cache. Because `LOUPPATH` sources are under active development and change frequently, cache validation overhead would exceed the benefit. The JIT pipeline uses incremental compilation so only changed modules are recompiled on each `loup run`.

**CI isolation.** `LOUPPATH` is **ignored** when `loup install --locked` is in effect. This ensures that CI builds are fully reproducible and unaffected by the developer's local environment.

**Diagnostic.** `loup run --verbose` logs each `LOUPPATH` entry consulted and reports which packages were resolved from `LOUPPATH` versus `loup.lock`.

**Interaction with namespace packages.** If a `LOUPPATH` entry resolves a package that is part of a namespace (e.g., `loup.http`), only that specific package is overridden. Other packages in the same namespace (e.g., `loup.db`) continue to resolve from `loup.lock` as usual.

---

### §13.10 Circular Imports and Deferred Type Resolution

*(This section is normative.)*

#### §13.10.1 Circular Import Policy

A **standard circular import** exists when the module dependency graph contains a
cycle reachable through `from X import (...)` statements. The compiler detects such
cycles during the dependency resolution phase and emits `E_CIRCULAR_IMPORT` naming
both modules. This applies in all six execution modes.

Good architecture avoids cycles. Common remedies: extract shared types into a third
module that both depend on; merge tightly-coupled modules; or use `defer import`
(§13.10.2) when the cycle is unavoidable.

#### §13.10.2 `defer import` — Deferred Type Resolution

`from X defer import (Name, ...)` breaks import cycles by creating **deferred type
stubs**. The stub gives the name a valid type identity immediately while deferring
the binding of its full definition until after the importing module's top-level
initialization completes.

**Syntax:**

```loup
from geometry defer import (Point, Transform)
from events defer import (EventBus, Handler)
```

`defer` is a keyword. The `prefer compiled` modifier is NOT permitted on a `defer
import` statement — deferred imports always use the module's default resolution.

**Stub lifecycle.** The runtime goes through three phases for each deferred name:

| Phase | State | Description |
|---|---|---|
| 1. Import statement reached | Stub created | Name is bound to an opaque type stub. No definition available yet. |
| 2. Importing module's top-level code completes | Pending resolution | All deferred imports for this module are queued for resolution. |
| 3. Target module finishes loading | Resolved | Stub is replaced by the real type. All declaration sites using the stub are updated. |

**What is permitted with a stub (before resolution):**

| Usage | Permitted | Notes |
|---|---|---|
| Type annotation on `let`/`var` declaration | ✓ | `let x: Point;` — uninitialized binding |
| Function parameter type | ✓ | `func f(p: Point): void` |
| Function return type | ✓ | `func g(): Point` |
| Class/struct field type | ✓ | `pub let origin: Point;` |
| Interface method signature | ✓ | `func transform(t: Transform): Self;` |
| Type parameter constraint | ✓ | `func h[T: Comparable[Point]]()` |
| `instanceof` / `is` type check | ✓ | `x instanceof Point` |
| Union type member | ✓ | `Point \| None` |
| Generic type argument | ✓ | `list[Point]` |

**What is NOT permitted with a stub (before resolution):**

| Usage | Error |
|---|---|
| Construction: `Point(x=1.0, y=2.0)` | `E_DEFERRED_USE_BEFORE_RESOLVED` |
| Method call on stub-typed value at top level | `E_DEFERRED_USE_BEFORE_RESOLVED` |
| `as` / `as?` cast to stub type | `E_DEFERRED_USE_BEFORE_RESOLVED` |
| Accessing a stub-typed field at top level | `E_DEFERRED_USE_BEFORE_RESOLVED` |
| Using stub type in `@mode(freestanding)` | `E_DEFERRED_NOT_FREESTANDING` |

The restriction applies only during **module initialization** (top-level execution).
Inside function bodies, method bodies, and closures that execute after initialization,
deferred names are always fully resolved — these usages are unrestricted.

**Example — mutual reference cycle:**

```loup
// nodes.loup
from edges defer import (Edge)

class Node : Any {
  pub let id: int;
  pub var edges: list[Edge] = [];   // ✓ — field type annotation, stub ok

  pub func addEdge(edge: Edge): void {  // ✓ — parameter type, stub ok
    edges.append(edge);
  }
}
```

```loup
// edges.loup
from nodes defer import (Node)

class Edge : Any {
  pub let src: Node;               // ✓ — field type annotation, stub ok
  pub let to:  Node;               // ✓ — field type annotation, stub ok

  new(src: Node, to: Node) {       // ✓ — parameter type, stub ok
    this.src = src;
    this.to  = to;
  }
}
```

Both modules compile. At runtime, whichever is loaded first creates stubs for the
other's deferred names. After both have initialized, all stubs resolve to their real
types. Code that constructs `Node` or `Edge` values runs in function bodies, which
execute after initialization — no `E_DEFERRED_USE_BEFORE_RESOLVED` can fire there.

**Stub identity.** A deferred type stub participates in the type system as a proper
named type. Two stubs for the same fully-qualified name from different `defer import`
sites in the same module are the same type. A stub is a subtype of `Any`. Stubs do
not satisfy interface constraints until resolved; the compiler defers interface
satisfaction checking to the resolution phase.

**Resolution failure.** If the target module fails to export a `defer`-imported name
(export missing, type mismatch, or module load error), it is `E_DEFERRED_RESOLUTION_FAILED`.
The error identifies the importing module, the target module, and the unresolved name.

**`defer import` and generics.** A deferred type may be used as a type argument in
declarations: `list[Point]` as a field type is valid before resolution. Instantiation
(`list[Point].new()` at top level) follows the same rule as construction — not
permitted before resolution.

**Mode availability.** `defer import` is available in all modes except `@mode(freestanding)` —
specifically `@mode(web.scripted)`, `@mode(web.compiled)`, `@mode(host.scripted)`,
`@mode(host.dual)`, and `@mode(host.native)`. It is NOT available in `@mode(freestanding)` —
freestanding modules are statically linked with no runtime module loader, so deferred
resolution has no mechanism (`E_DEFERRED_NOT_FREESTANDING`).

#### §13.10.3 Error Codes

| Code | Condition |
|---|---|
| `E_CIRCULAR_IMPORT` | See §13.1 — `import` chain creates a module dependency cycle |
| `E_DEFERRED_USE_BEFORE_RESOLVED` | A value operation (construction, method call, cast, field access) on a deferred type stub during module top-level initialization, before the stub is resolved |
| `E_DEFERRED_RESOLUTION_FAILED` | The target module of a `defer import` did not export the requested name, or exported an incompatible type |
| `E_DEFERRED_NOT_FREESTANDING` | `defer import` used in `@mode(freestanding)` — no runtime module loader |

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

**Multiline string error codes:**

| Code | Condition |
|---|---|
| `E_MLS_ALIGN` | Content line does not start with the alignment anchor prefix `P` |

## §15 Interpolated Strings

*(This section is normative.)*

Interpolated strings embed expressions in single- or double-quoted strings using `{$ ... $}` delimiters:

```
let greeting = i"Hello, {$ name $}";
let path = i'out/{$ fileStem $}.txt';
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

**Extended form (4+ backticks) for nesting.** When a fence body must contain literal backtick sequences (for example, when generating Loup source that itself contains template fences), use more backticks on the outer fence. The parser only closes the fence when it encounters the exact same backtick count as the opener:

``````
````(loup):(none)
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

**Combining extended backticks with alternative delimiters.** When generating Loup that itself generates HTML, use extended backticks for the fence delimiter and alternative expression delimiters for interpolation:

``````
`````(loup):(expr_open="<<", expr_close=">>")
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
  pub let language: string;
  pub let format: string;

  pub func render(scope: dict[string, Any]): string;
  pub func renderWith(ctx: RenderContext, scope: dict[string, Any]): string;
  pub func renderAsync(scope: dict[string, Any]): Task[string];
  pub func renderWithAsync(ctx: RenderContext, scope: dict[string, Any]): Task[string];

  pub func concat(other: Template): Template;
}

class RenderContext {
  pub let language: string;
  pub let format: string;
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
| `bytes` | **Error** (`E_TEMPLATE_BYTES`) — `bytes` insertion is a compile-time error unless converted via a filter (e.g., `{$ data \| base64 $}`) |
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

**Built-in filter functions.** The following filters are available in all `{$ expr | filter $}` positions in template fences and interpolated strings. Filters are applied as post-processing steps on the rendered string produced by the expression. Multiple filters may be chained: `{$ expr | upper | trim $}`.

| Filter | Signature | Description |
|---|---|---|
| `upper` | `upper` | Convert to ASCII uppercase |
| `lower` | `lower` | Convert to ASCII lowercase |
| `trim` | `trim` | Remove leading and trailing whitespace |
| `trim_start` | `trim_start` | Remove leading whitespace only |
| `trim_end` | `trim_end` | Remove trailing whitespace only |
| `escape` | `escape` | HTML-entity-encode `&`, `<`, `>`, `"`, `'` |
| `raw` | `raw` | Suppress all context-aware escaping; insert value as-is (`SafeHtml`/`Url` values bypass this) |
| `base64` | `base64` | Base64-encode a `bytes` value; required for inserting `bytes` in templates |
| `join` | `join(sep)` | Join an `Iterable[T]` with separator string `sep` |
| `wrap` | `wrap(open, close)` | Prepend `open` and append `close` to the rendered string |
| `default` | `default(fallback)` | If the rendered string is empty, substitute `fallback` |
| `truncate` | `truncate(n)` | Truncate rendered string to at most `n` characters, appending `…` |
| `replace` | `replace(from, to)` | String-replace all occurrences of `from` with `to` |

User-defined filters may be implemented as functions with signature `func(value: string, ...args): string` and called identically: `{$ expr | myFilter $}` or `{$ expr | myFilter(arg) $}`. The first argument is always the rendered-string result of the preceding expression or filter; additional arguments come from the call's argument list. A compile-time error is emitted if a filter function cannot be resolved (`E_FILTER_UNRESOLVED`) or if the argument count does not match (`E_FILTER_ARITY`).

| Code | Mode | Condition |
|---|---|---|
| `E_FILTER_UNRESOLVED` | All | `\| filterName` in a template fence refers to a name that does not resolve to a callable function |
| `E_FILTER_ARITY` | All | Filter function invocation argument count does not match the function's declared parameters |
| `E_TEMPLATE_BYTES` | All | `{$ byteValue $}` directly inserted into a template without a conversion filter (e.g. `\| base64`) |

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

Unquoted attribute values (`<tag attr={$ x $}>` without surrounding quotes) are a **compile-time error** (`E_HTML_UNQUOTED_ATTR`) in `html` fences. All dynamic attributes must be quoted.

| Code | Mode | Condition |
|---|---|---|
| `E_HTML_UNQUOTED_ATTR` | All | `{$ expr $}` interpolation inside an unquoted HTML attribute value in an `html` fence |

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
<input value=i"{$ userInput $}" placeholder=i"{$ hint $}" />
// userInput = `say "hello"` → value="say &quot;hello&quot;"
```

#### §16.6.4 URL Attribute Context

The following HTML attributes are recognised as URL-valued: `href`, `src`, `action`, `formaction`, `data`, `poster`, `cite`, `ping`, `manifest`, `itemid`.

When an interpolation appears in a URL-valued attribute, the compiler:

1. Requires the interpolated value to be of type `core.text.Url` (see §16.6.7). A bare `string` emits a compile-time lint warning.
2. Validates that the URL's scheme is not `javascript:` or `vbscript:`. A `javascript:` scheme is a **compile-time error** (`E_URL_SCHEME_UNSAFE`) when statically detectable. At runtime, `Url.of()` throws `UrlError` for disallowed schemes.

| Code | Mode | Condition |
|---|---|---|
| `E_URL_SCHEME_UNSAFE` | All | `Url` fence interpolation or literal uses `javascript:` or `vbscript:` scheme — statically detectable only |
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

Interpolations inside `<script>` or `<style>` blocks in an `html` fence are a **compile-time error** (`E_SCRIPT_STYLE_INTERPOLATION`). Encoding for JavaScript and CSS contexts is significantly more complex than HTML encoding and cannot be specified as a simple character substitution table. The correct patterns are:

| Code | Mode | Condition |
|---|---|---|
| `E_SCRIPT_STYLE_INTERPOLATION` | All | `{$ expr $}` or `{% directive %}` inside a `<script>` or `<style>` block in an `html` fence |

- Pass data from Loup to JavaScript via the structured state serialization mechanism (§19.7) or via `data-` attributes, then read those from JavaScript after the Wasm module loads.
- Never inject Loup values directly into inline `<script>` blocks.

```
// COMPILE-TIME ERROR:
<script>
  var name = i"{$ userName $}";
</script>

// CORRECT: data attribute + read from JS/Wasm interop
<div id="app" data-user=i"{$ userName $}"></div>
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

  // Trusted constructor — compile-time constants and Loup rendering output only.
  // Using this with user-provided input is a security defect.
  pub static func of(trusted: string): SafeHtml;

  pub func render(ctx: RenderContext): string => content;  // no escaping
}
```

`SafeHtml` values produced by Loup's own rendering pipeline (e.g., output of `renderToString`, or a nested `View` rendered to string) are automatically typed as `SafeHtml` and pass through without double-escaping.

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

```loup
let styles = ```(css)
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
```;

// styles.container → ClassName("container-a3f9b2")
// styles.button    → ClassName("button-a3f9b2")
```

#### §16.7.1 `StyleSheet` and `ClassName`

```loup
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

**Rule access.** CSS selectors that are valid Loup identifiers are accessible as direct property names on the `StyleSheet` value. Selectors containing non-identifier characters (e.g. `.my-button`, `.grid-2col`) are accessed via `styles.get("myButton")` using camelCase:

```loup
let cls = styles.get("gridItem");   // for rule .grid-item
```

#### §16.7.2 Dynamic Values

CSS property values may embed Loup expressions with `{$ expr $}`:

```loup
let spacing: int = 16;
let brand: string = "#0066cc";

let styles = ```(css)
  .card {
    padding: {$ spacing $}px;
    border-color: {$ brand $};
    border-width: {$ spacing / 4 $}px;
  }
```;
```

Dynamic values are interpolated at the time the fence expression is evaluated. The resulting `StyleSheet` is immutable — it captures the values at evaluation time. For styles that must react to signal changes, re-evaluate the fence expression inside an `effect` or computed value (§19.1).

**Type safety.** Expressions inside CSS fences must evaluate to `string`, `int`, `float`, or `float32`. Values of other types are a compile-time error. `int` and `float` values are rendered without units — append the unit string explicitly: `{$ value $}px`.

#### §16.7.3 Injection into Documents and Components

**In `html` fences.** Use `styles.toCSS()` to inject a `<style>` block, or reference class names directly:

```loup
let page = ```(html)
  <style>{$ styles.toCSS() | raw $}</style>
  <div class="{$ styles.container $}">
    <button class="{$ styles.button $}">Click</button>
  </div>
```;
```

**In `ui` fences.** The `class` attribute accepts `ClassName` directly:

```loup
let view = ```(ui)
  <Column class={styles.container}>
    <Button class={styles.button}>Click</Button>
  </Column>
```;
```

**Server-side rendering.** When rendering to string via `ui.web.renderToString`, all `ClassName` values referenced in the component tree are collected and their CSS is included in the generated `<style>` block automatically.

#### §16.7.4 Media Queries and Pseudo-Selectors

Media queries and pseudo-selectors are supported within `css` fences. Only top-level class selectors (`.ruleName { ... }`) produce `ClassName` properties on the returned `StyleSheet`. Other rule types (media queries, keyframes, `@font-face`) are compiled into the CSS output but are not directly addressable:

```loup
let styles = ```(css)
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
```;

// styles.hero is a ClassName — the @media and @keyframes are in toCSS() output
```

#### §16.7.5 Availability

`css` fences are available in `@mode(web.scripted)`, `@mode(web.compiled)`, `@mode(host.scripted)`, `@mode(host.dual)`, and `@mode(host.native)`. They are **not available** in `@mode(freestanding)` — there is no UI runtime (`E_FREESTANDING_FENCE`).

| Target | Behavior |
|---|---|
| `browser` | `StyleSheet.toCSS()` is injected into a `<style>` element by the Loup runtime |
| `service` / SSR | `toCSS()` is inlined in the SSR `<style>` block |
| `native` | `StyleSheet` is passed to `ui.desktop` as a style descriptor; CSS properties are translated to the platform rendering model |
| `cli` | `css` fences are valid but `toCSS()` simply returns the CSS string — no DOM is available |
| `freestanding` | Not available — compile-time error (`E_FREESTANDING_FENCE`) |


---

### §16.8 GPU/Compute Fence Descriptors

*(This section is normative. Applies to `@mode(host.native)`, `@mode(host.dual)`, and `@mode(web.compiled)`/`@mode(web.scripted)` targets where WebGPU is available.)*

Three additional language descriptors extend the template fence system (§16.1) for GPU kernel authoring. These fences produce `GpuKernel` values (defined in `native.gpu`; see the stdlib reference) rather than `Template` strings. The fence body is a shader program in the target shading language; `{$ expr $}` interpolations inject Loup compile-time constant expressions as shader constants.

#### §16.8.1 `wgsl` — WebGPU Shading Language

```loup
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
- Only compile-time constant Loup expressions (`int`, `float32`, `bool`) are permitted in `{$ expr $}` interpolations inside `wgsl` fences. Runtime values are a compile-time error (`E_GPU_FENCE_RUNTIME`).
- The fence body must be valid WGSL. Syntax errors in the fence body are reported as compile-time errors when the containing file is processed by `loup build --check`; at runtime, `GpuKernel.compile` throws `GpuCompileError` on shader compilation failure.
- Multiple entry points (`@compute`, `@vertex`, `@fragment`) are permitted in a single fence.

| Code | Mode | Condition |
|---|---|---|
| `E_GPU_FENCE_RUNTIME` | All | `{$ expr $}` interpolation inside a GPU/compute fence references a non-compile-time-constant value |
| `E_GPU_FENCE_TARGET` | All | `metal` fence used on a non-macOS/iOS target; or `glsl`/`stablehlo`/`hlo` on an unsupported target |

#### §16.8.2 `metal` — Metal Shading Language

```loup
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
- The `metal` descriptor is valid on `--os macos` and `--os ios` native targets only. Using it on other targets is a compile-time error (`E_GPU_FENCE_TARGET`).
- Only `int`, `float32`, and `bool` compile-time constants are permitted in `{$ expr $}` interpolations.

#### §16.8.3 `glsl` — OpenGL/Vulkan Compute Shader

```loup
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

#### §16.8.4 Fence Body Compilation Model

GPU compute fences follow the same multi-backtick nesting rules as all other fences (§16.1). The `constants` map in `GpuKernel.compile` receives a `dict[string, Any]` whose values must be compile-time constants. The fence interpolations `{$ expr $}` are evaluated at the time the fence expression is evaluated and substituted into the shader source string before it is passed to the GPU driver for compilation. This allows loop unrolling counts, workgroup sizes, and compile-time feature flags to be expressed as Loup values rather than magic numbers in the shader source.


---

## §17 Concurrency

*(This section is normative. This chapter covers async/await, structured concurrency, actors, OS-thread parallelism, the multi-threaded async executor, and script-mode parallelism. Shared-memory concurrency — the `Shareable` trait, `SharedBuffer[T]`, `SharedRef[T]`, `shared class`, atomics, and shared synchronization primitives — is specified separately in §17b.)*

### §17.1 `async`/`await`

Loup supports asynchronous functions and explicit suspension via `await`:

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
- Inserting a `Task[T]` into templates without `await` is `E_UNAWAITED_TASK`.

| Code | Mode | Condition |
|---|---|---|
| `E_UNAWAITED_TASK` | All | `Task[T]` value used in a template fence interpolation without `await` |
| `E_AWAIT_NOT_ASYNC` | All | `await` expression used outside an `async func` body, entry script, or REPL |

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
- `spawn expr` starts `expr` (type `Task[T]`) as a child task. `spawn` is a keyword valid in any `async` context. Inside `await group`, the spawned task is owned by the group and its result is available after the group exits.
- `binding = spawn expr` is sugar: the binding receives the resolved `T` value after the group exits normally.
- All spawned tasks must complete or be cancelled before the block exits.
- Storing a spawned `Task[T]` outside the group scope is `E_TASK_SCOPE_ESCAPE` (when statically detectable) or a runtime `LifetimeError`.
| Code | Mode | Condition |
|---|---|---|
| `E_TASK_SCOPE_ESCAPE` | All | Spawned `Task[T]` from `await group` is stored or returned outside the group's lexical scope (statically detectable cases) |

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

  // Bounded concurrency — at most `n` body invocations run simultaneously.
  // Throws TaskQueueFullError if the internal work queue reaches capacity (see §20.1).
  pub static async func collectBounded[T, R](items: list[T], maxConcurrency: int, body: async func(T): R): Task[list[R]];
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

- `for await (x in xs) { ... }` requires an `async` context and `xs` to implement `AsyncIterable[T]` (`E_NOT_ASYNC_ITERABLE` if it does not).
- `break` on a `for await` loop calls `asyncIter().close()` if that method exists.
- `for await` participates in structured concurrency cancellation.
- `CancellationError` thrown inside a `for await` loop body propagates normally (it is not caught by the loop itself).
- `for await` is permitted in template directives during async rendering.

| Code | Mode | Condition |
|---|---|---|
| `E_NOT_ASYNC_ITERABLE` | All | `for await (x in expr)` where `expr` does not implement `AsyncIterable[T]` |

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
  // Create and start an actor.  `handler` is called once per message in
  // delivery order; it runs inside a dedicated structured-concurrency child
  // task and must not itself await indefinitely between messages.
  pub static async func spawn(handler: async fn(msg: M): Task[void]): Task[Actor[M]];

  // Simplified synchronous-handler overload for actors that do not need await.
  pub static async func spawn(handler: fn(msg: M): void): Task[Actor[M]];

  pub func send(msg: M): void;
  pub async func ask[R](msg: M): Task[R];

  // Request orderly shutdown: no new messages are accepted; in-flight
  // messages drain before the actor task exits.
  pub func stop(): void;
}
```

- `Actor.spawn(handler)` starts the actor in a new child task and returns an `Actor[M]` handle. The call must be `await`-ed inside an `async` context (the actor runs for the lifetime of its enclosing `await group` or until `stop()` is called).
- `actor.send(msg)` delivers a message asynchronously. Messages are processed sequentially in send order.
- `actor.ask(msg)` sends a message and returns a `Task[R]` that resolves with the response. The `handler` must reply via the implicit `ActorContext` (see below) or the `Task[R]` never resolves.
- `actor.stop()` signals orderly shutdown; the handler finishes the current message, then the actor task exits.

**`ActorContext`** is an implicit value available inside the handler body for replying to `ask` calls:

```
// Full actor example
enum CounterMsg {
  Increment;
  GetCount;
}

async func runCounter(): Task[void] {
  var count = 0;

  let counter = await Actor.spawn(async func(msg: CounterMsg) {
    match msg {
      CounterMsg.Increment => { count = count + 1; }
      CounterMsg.GetCount  => { ActorContext.reply(count); }
    }
  });

  counter.send(CounterMsg.Increment);
  counter.send(CounterMsg.Increment);
  let total = await counter.ask(CounterMsg.GetCount);  // 2
  counter.stop();
}
```

```
class ActorContext : Any {
  // Reply to the current ask() call. No-op if called from a send()-originated invocation.
  // Only the first reply is delivered; subsequent calls on the same invocation are ignored.
  pub static func reply[R](value: R): void;
}
```

`ActorContext.reply(value)` sends the response for the current `ask` call. Calling `reply` from a `send`-originated invocation is a no-op. Calling `reply` more than once per `ask` is a runtime warning; only the first reply is delivered.

**Supervision strategies:**

| Strategy | Behavior |
|---|---|
| `OneForOne` | Restart only the failed child actor |
| `AllForOne` | Restart all children when one fails |
| `RestForOne` | Restart the failed child and all children started after it |

**Actor lifecycle:** start → running → stopping → stopped. `defer` interacts with actor shutdown: deferred actions run during the stopping phase.

Actors and supervision trees are built on top of `await group` and `TaskGroup` primitives.

### §17.7 `atomic {}` — Cooperative Atomicity Scope

*(This section is normative. Applies to `@mode(web.scripted)`, `@mode(web.compiled)`, `@mode(host.scripted)`, and `@mode(host.dual)` per §2.6.)*

An `atomic {}` block guarantees that no suspension point occurs within its lexical scope. It is the primary mechanism for closing TOCTOU (time-of-check/time-of-use) races in cooperative async code: all statements between the opening and closing brace execute without interleaving from other tasks.

**Semantics.** The compiler rejects `await` expressions, `for await` loops, and `spawn` statements inside an `atomic {}` block (`E_ATOMIC_AWAIT`). No call to a function declared `async` is permitted inside `atomic {}` unless it is statically proven to not contain any suspension point — in practice, only `safe func` and non-`async` functions are permitted. The cooperative scheduler does not preempt within an `atomic {}` block; other tasks do not run until the block exits.

```loup
// Without atomic {}: TOCTOU window between check and act
if (cache.has(key)) {
  await expensiveOperation()   // another task may evict key here
  return cache.get(key)        // key may be gone — returns None unexpectedly
}

// With atomic {}: check and act are uninterruptible
var cached: Option[string] = None
atomic {
  if (cache.has(key)) { cached = Some(cache.get(key)) }
}
if (cached != None) { return cached.unwrap() }

let result = await expensiveOperation()
atomic {
  cache.set(key, result)
}
return result
```

**`atomic {}` is not a mutex.** It does not prevent interleaving across OS threads — for that, use `synchronized` (§23.4.13) or `Mutex[T]` (§17.8.2). `atomic {}` requires a cooperatively-scheduled environment: it prevents interleaving only by statically forbidding suspension points (`await`, `for await`, `spawn`, calls to `async func` not proven suspension-free) inside the block. In `@mode(host.dual)`, which may host OS threads, the compiler enforces the same no-suspension rule — OS threads are orthogonal to `atomic {}`, which only coordinates cooperative scheduling within a single logical task.

**Permitted and prohibited inside `atomic {}`:**

| Operation | Permitted |
|---|---|
| Synchronous function calls | ✓ |
| `modifier` calls on `synchronized` instances | ✓ (acquires runtime lock — does not block scheduler) |
| `reads`/`edits`/`takes`/`shares` verb operations | ✓ |
| `await` expression | ✗ `E_ATOMIC_AWAIT` |
| `for await` loop | ✗ `E_ATOMIC_AWAIT` |
| `spawn` / `TaskGroup.collect` | ✗ `E_ATOMIC_AWAIT` |
| `async func` call (unless proven suspension-free) | ✗ `E_ATOMIC_AWAIT` |

**Error codes.**

| Code | Mode | Condition |
|---|---|---|
| `E_ATOMIC_AWAIT` | web.scripted, web.compiled, host.scripted, host.dual | Suspension point inside `atomic {}` block |
| `E_ATOMIC_NOT_WASM` | host.native, freestanding | `atomic {}` used in `@mode(host.native)` or `@mode(freestanding)`; use `synchronized` or `InterruptGuard` |

**Task queue exhaustion (normative).** Spawning tasks in an unbounded loop without awaiting results can exhaust available memory. The runtime enforces a configurable maximum pending-task queue depth via `runtime.configure` (§20.1). When the queue is full, further `spawn` operations throw `TaskQueueFullError` (§26.1). The default limit is `0` (unlimited); set a positive `maxTaskQueueDepth` in `RuntimeConfig` to bound the queue. Use `TaskGroup.collectBounded` (§17.3) as the preferred pattern for high-throughput task production.

---

### §17.7b `weak` References in Concurrent Contexts

On the native ARC target, `weak` references interact with concurrency as follows:

- A `weak` field read in one task may yield `None` if the referent was released concurrently. ARC weak reference zeroing is atomic — this is not a data race.
- `Actor[M]` supervision trees that hold bidirectional parent↔child references should use `weak` for the child-to-parent reference to avoid retain cycles: the parent owns the child (strong reference), the child back-references the parent (weak reference).
- `await group` child tasks hold a strong reference to the group's scope for the duration of the task. Storing a spawned task handle in a `weak` field is permitted; the reference will be `None` once the task completes.
- Closures in `effect()` calls (§19.1) that reference the `EffectHandle` should use `[weak handle]` capture lists (§7.3) to avoid retain cycles.

On GC runtimes (scripted/Wasm), `weak` references behave consistently — the GC may collect the referent, after which reads return `None`. No additional concurrency rules apply since the runtime is cooperatively single-threaded.

### §17.8 OS Thread Parallelism (`--target native`)

*(This section is normative. It applies only to `@mode(host.dual)` and `@mode(host.native)` files. All constructs in this section are compile-time errors in scripted mode, in `@mode(web.compiled)` files targeting Wasm, or in `@mode(freestanding)` files.)*

Loup's cooperative async runtime runs on a single OS thread by default. For CPU-bound workloads on `--target native`, true parallelism is available via OS threads using the primitives in this section. For parallelizing async work itself across cores, see §17.9 (Multi-Threaded Async Executor). OS thread primitives are a lower-level interface intended for compute-heavy work and synchronous blocking operations.

#### §17.8.1 `Sendable` Interface

`Sendable` is a marker interface indicating that a type is safe to transfer across thread boundaries:

```loup
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

**Explicit `Sendable` with structural verification.** Classes must explicitly declare `implements Sendable`. The compiler does not infer `Sendable` for classes. When a class declares `implements Sendable`, the compiler performs **structural `Sendable` verification**: every `var` field must be of type `Mutex[T]`, `RwLock[T]`, or `Atomic[T]`. `let` fields are exempt — immutable fields are inherently safe to share across threads regardless of type. The one exception to this rule is `synchronized` classes: a class that declares both `synchronized` and `implements Sendable` is exempt from the `var` field restriction — the per-instance mutex provides equivalent thread safety (§23.4.13).

A `var` field of any other type — including `Sendable` types such as `int` or `string` — on a class declaring `implements Sendable` is a compile-time error (`E_SENDABLE_UNPROTECTED_VAR`). Even `Sendable` value types are unsafe as unprotected `var` fields because two threads could simultaneously read-modify-write the field, producing a data race.

```loup
@mode(host.native)

// COMPILE ERROR — unprotected var field
class UnsafeCounter : Any implements Sendable {
  var count: int = 0;   // E_SENDABLE_UNPROTECTED_VAR
}

// OK — all mutable state behind Mutex
class SafeCounter : Any implements Sendable {
  let count: Mutex[int] = Mutex.new(0);

  pub func increment(): void {
    count.withLock(func(g) => g.set(g.get() + 1));
  }

  pub func value(): int {
    return count.withLock(func(g) => g.get());
  }
}
```

To opt out of structural verification when the compiler cannot see the synchronization mechanism — for example, when safety is ensured by an external lock or protocol — annotate the class with `@unsafe("sendable: <reason>")` (see §23.4.6). The `@unsafe` annotation is the explicit, auditable record of the programmer's assertion.

```loup
@mode(web.compiled)

// OK — programmer asserts external synchronization via @unsafe
@unsafe("sendable: access is serialized by the event loop; no concurrent mutation occurs")
class LegacyState : Any implements Sendable {
  var value: int = 0;
}
```

**Error code.**

| Code | Meaning |
|---|---|
| `E_SENDABLE_UNPROTECTED_VAR` | Class declares `implements Sendable` but has a `var` field not of type `Mutex[T]`, `RwLock[T]`, or `Atomic[T]`; suppressed for `synchronized` classes (§23.4.13) |

**Non-`Sendable` types.** Types not implementing `Sendable` may not cross thread boundaries. Attempting to capture a non-`Sendable` value in a `Thread.spawn` closure is a compile-time error.

#### §17.8.2 Shared Mutable State: `Mutex[T]`, `RwLock[T]`, `Atomic[T]`

```loup
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

`Mutex[T]` and `RwLock[T]` are in the `sync.thread` module and require `@mode(host.dual)` or `@mode(host.native)` — they depend on OS thread primitives unavailable in `@mode(freestanding)` and in the web/scripted modes. `Atomic[T]` is available in both `@mode(host.native)` and `@mode(freestanding)`; for bare-metal multi-core synchronisation use `Atomic[T]` directly or the `native.atomic` functions (§24.20). Using `Mutex[T]` or `RwLock[T]` in `@mode(freestanding)` is `E_FREESTANDING_RUNTIME`.

#### §17.8.3 `Thread` and `ThreadHandle`

```loup
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

```loup
@mode(host.native)

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

```loup
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

```loup
@mode(host.native)

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
| `Thread`, `ThreadPool`, `Mutex`, `RwLock` in scripted mode, compiled-mode Wasm targets, or `@mode(freestanding)` | OS threads unavailable — compile-time error (`E_FREESTANDING_RUNTIME` in freestanding) |
| `Atomic[T]` in scripted mode or compiled-mode Wasm targets | Available in `@mode(host.native)` and `@mode(freestanding)` (see §17.8.2); compile-time error elsewhere |
| `spawnBlocking` in scripted mode or Wasm targets | Available — backed by host thread pool; see §17.10.1 |
| `native.simd` and `Vec[T, N]` outside `@mode(host.native)` or `@mode(freestanding)` | SIMD intrinsics require native code generation |
| `@vectorize` in `@mode(host.scripted)` | Auto-vectorization hint ignored — JIT does not honour compile-time SIMD hints; compile-time lint advisory |

**Data race freedom guarantee.** Any program that passes all compile-time `Sendable` checks is free of data races on objects visible to `core.reflect`. The guarantee does not extend to `extern native` objects accessed from multiple threads — native thread safety is the FFI caller's responsibility.



---

### §17.9 Multi-Threaded Async Executor

*(This section is normative. Executor configuration (`RuntimeConfig`, `ExecutorConfig`, work-stealing executor, `@concurrent`, actor isolation, `ThreadLocal[T]`) applies to `@mode(host.dual)` and `@mode(host.native)` — the only modes with OS threads (§2.6). `spawnBlocking` is available in all non-freestanding modes — see §17.10.1. `TaskLocal[T]` is available in all non-freestanding modes. `TaskLocal[T]` is not available in `@mode(freestanding)` — there is no async task scheduler to bind task-local storage to.)*

The default Loup async executor is a cooperative, single-threaded event loop. For programs that require true parallel execution of async tasks across CPU cores, the executor may be reconfigured to a **work-stealing multi-threaded model** via the `RuntimeConfig` API.

#### §17.9.1 `ExecutorConfig` and `RuntimeConfig`

```loup
namespace runtime;

enum ExecutorConfig {
  SingleThreaded;                    // Default — cooperative, single OS thread
  MultiThreaded(workers: int);       // Explicit worker count
  MultiThreaded;                     // Defaults to Thread.hardwareConcurrency()
}

struct RuntimeConfig {
  asyncExecutor:     ExecutorConfig = ExecutorConfig.SingleThreaded;
  blockingPoolSize:  int = 512;    // Max threads in the blocking pool (§17.9.3)
  maxTaskQueueDepth: int = 0;      // 0 = unlimited; positive value caps pending spawn queue (§20.1)
}

// Configure the runtime. Must be called before any await expression evaluates.
// Typically the first call in main(). Calling after the event loop starts
// throws RuntimeConfigError.
func configure(config: RuntimeConfig): void;
```

**Single-threaded (default).** `ExecutorConfig.SingleThreaded` preserves the cooperative, single-threaded model exactly as specified in §2.1. No additional `Sendable` constraints are applied to async task captures — the executor is deterministic and race-free by construction.

**Multi-threaded.** `ExecutorConfig.MultiThreaded` activates a work-stealing executor:

- Each worker thread runs the Loup async task scheduler cooperatively on its own OS thread.
- Tasks are load-balanced automatically via work-stealing: each worker has a local task queue and steals from peer queues when idle.
- The worker count defaults to `Thread.hardwareConcurrency()` when not specified.
- The executor is created at `runtime.configure()` time and persists for the process lifetime.

**Example — opting into multi-threaded execution:**

```loup
@mode(host.native)

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

#### §17.9.2 Work-Stealing Executor Semantics

When `ExecutorConfig.MultiThreaded` is active:

- **Task distribution.** Tasks spawned via `spawn`, `TaskGroup.collect`, and `async func` calls are placed on the spawning thread's local task queue. Idle worker threads steal tasks from peer queues.
- **Cooperative scheduling.** Each worker cooperatively schedules tasks at `await` points. A task does not preempt another task on the same worker.
- **Thread affinity.** There is no guaranteed affinity between a task and a specific worker thread. A task may resume on a different worker after an `await` — this is the fundamental reason `Sendable` constraints apply (§17.9.4).
- **Completion ordering.** Tasks within a single `await group` or `TaskGroup.collect` call complete in arbitrary order, as in single-threaded mode. Result assembly is handled by the structured concurrency primitives.
- **Sendability enforcement.** In multi-threaded executor mode, async task captures are subject to `Sendable` constraints at the call site (§17.9.4).

#### §17.9.3 `spawnBlocking` — Blocking Work Bridge

```loup
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

**Availability.** `spawnBlocking` is available in `@mode(web.scripted)`, `@mode(web.compiled)` (Wasm), `@mode(host.scripted)`, `@mode(host.dual)`, and `@mode(host.native)`. It is **not available** in `@mode(freestanding)` — there is no async event loop to suspend. See §17.10.1 for scripted-mode and Wasm-specific semantics. In all available modes it offloads synchronous work off the async event loop and is the recommended path for any operation that could block for more than ~1 ms.

**`ThreadPool` vs `spawnBlocking`.** `ThreadPool` (§17.8.4) is a manually-managed pool with explicit lifecycle, suitable when the program controls pool sizing and shutdown timing. `spawnBlocking` uses the runtime-managed blocking pool and is the recommended default for ad-hoc blocking work.

**Error semantics.** If `body` throws an exception, the exception propagates from the `await spawnBlocking(...)` call site as if thrown directly in the async context.

**Example:**

```loup
@mode(host.native)

from sync.thread import (spawnBlocking);

async func processImage(path: string): Task[bytes] {
  let raw = await runtime.fs.readAsync(path);
  // encode() is CPU-bound synchronous work — offload to blocking pool
  let encoded = await spawnBlocking(func() => encode(raw));
  return encoded;
}
```

**`spawnBlocking` error codes:**

| Code | Condition |
|---|---|
| `E_BLOCKING_CAPTURE` | Non-`Sendable` type captured by a `spawnBlocking` closure |
| `E_AWAIT_IN_BLOCKING` | `await` expression used inside a `spawnBlocking` body closure |

#### §17.9.4 Task Sendability Rules (Multi-Threaded Executor)

The executor mode determines whether `Sendable` constraints apply to async task closures:

**Rule 1 — Single-threaded executor.** In `SingleThreaded` executor mode, async task closures (the body of `spawn`, `async func` calls, `TaskGroup.collect` callbacks) may capture any type. No `Sendable` constraint is imposed.

**Rule 2 — Multi-threaded executor.** In `MultiThreaded` executor mode, async task closures SHALL only capture values whose types implement `Sendable`. A non-`Sendable` capture at a `spawn` or `async func` call site is a compile-time error naming the offending captured variables.

```loup
@mode(host.native)

// In MultiThreaded executor mode:
let sharedCache: Cache = Cache.new();   // Cache does not implement Sendable

async func fetch(): Task[void] {
  let data = await spawn download();          // OK: captures nothing non-Sendable
  let r = await spawn process(sharedCache);   // ERROR: Cache is not Sendable
}
```

**Rule 3 — Binary-level enforcement.** The executor mode is a property of the binary, determined by the `runtime.configure()` call in the entry point. The compiler enforces Rule 2 for all async captures in `@mode(host.native)` files when the program is configured for `MultiThreaded` execution. `@mode(freestanding)` has no async executor and Rule 3 does not apply.

**Rule 4 — `@concurrent` forces Sendable regardless of mode.** Functions annotated `@concurrent` (§17.9.5) are always subject to `Sendable` capture constraints, regardless of the active executor mode.

#### §17.9.5 `@concurrent` Annotation

`@concurrent` on an `async func` declaration asserts that the function is safe to invoke from any executor thread. The compiler enforces:

- All values captured in the function body and its nested async closures implement `Sendable`.
- The function body does not directly read or write any module-level `var` bindings (module-level mutable state is not thread-safe without explicit synchronization).

```loup
@mode(host.native)

@concurrent
async func fetchAll(urls: list[Url]): Task[list[Response]] {
  return await TaskGroup.collect(urls, async func(url) => fetch(url));
}
```

`@concurrent` is checked at compile time. It does not alter runtime behavior — it is a documentation and safety-enforcement tool for library authors writing functions intended to work correctly in multi-threaded executor contexts. Callers are not required to verify whether a callee is `@concurrent`; enforcement is on the declared function's own captures and body.

#### §17.9.6 Actor Isolation in Multi-Threaded Contexts

The `Actor[M]` model (§17.6) is inherently safe in multi-threaded executor contexts without changes to the actor API.

**Rule: Actors are implicitly `Sendable`.** `Actor[M]` instances implement `Sendable` unconditionally. The actor's internal state is accessed only from the actor's serial message handler, which processes one message at a time on a single thread at a time regardless of which worker is executing. This makes `Actor[M]` a safe island of serial state within a concurrent executor.

**Rule: Non-`Sendable` state may be held inside actors.** Because the message handler is serial, actor-private state does not need to implement `Sendable`. Non-`Sendable` types may be used freely as internal actor state.

**Rule: Message types must be `Sendable` in multi-threaded mode.** Messages sent via `Actor[M].send(msg)` or `Actor[M].ask(msg)` cross thread boundaries (from the sender's worker to the actor's handler). When `ExecutorConfig.MultiThreaded` is active, `M` must implement `Sendable`. This is enforced at the call sites of `send` and `ask` — compile-time error if `M` is not `Sendable`.

```loup
@mode(host.native)

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

#### §17.9.7 Thread-Local Storage (`ThreadLocal[T]`)

```loup
namespace sync.thread;

// Available in @mode(host.dual) and @mode(host.native); compile-time error in
// @mode(web.scripted), @mode(web.compiled), @mode(host.scripted), and @mode(freestanding).
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

#### §17.9.8 Task-Local Storage (`TaskLocal[T]`)

```loup
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

```loup
@mode(web.compiled)

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

### §17.10 Script-Mode Parallelism

*(This section is normative. All constructs in this section are available in scripted mode and on all Wasm targets. `ScriptWorker` and `WorkerChannel[T]` are additionally available in `@mode(web.compiled)` Wasm targets and in `@mode(host.native)` via an embedded Wasm runtime (see §2.6). They are not available in `@mode(freestanding)`, which has no async or thread primitives; use `native.atomic` and `InterruptGuard` (§24.20, §24.24) instead.)*

Loup's scripted runtime executes cooperatively on a single thread by default (§2.1). Three mechanisms provide parallelism within the scripted and Wasm execution environments:

- **`spawnBlocking`** (§17.10.1) — offloads synchronous CPU-bound closures to a host-managed blocking thread pool.
- **`ScriptWorker`** (§17.10.2) — spawns an isolated Wasm instance with its own heap, communicating via `Sendable`-typed message channels.
- **Shared-memory concurrency** (§17b) — `SharedBuffer[T]`, `SharedRef[T]`, `shared class`, atomics, and shared synchronization primitives enable zero-copy cross-thread data access on top of the Wasm threads proposal's shared linear memory and `atomic.*` opcodes.

These three mechanisms are complementary: `spawnBlocking` is for short synchronous compute tasks that return a single value; `ScriptWorker` is for long-running or stateful parallel workloads that require bidirectional communication; the §17b shared-memory model is for data that must be concurrently read/written by multiple workers without copy overhead.

#### §17.10.1 `spawnBlocking` in Scripted Mode

`spawnBlocking` is declared in `sync.thread` (§17.9.3) and is available on all targets. This subsection specifies its behaviour specifically in scripted mode and Wasm targets.

**Host thread pool.** On browser targets (`--target browser`), `spawnBlocking` dispatches the closure to the browser's dedicated worker thread pool managed by the Loup runtime bootstrap. On non-browser Wasm and scripted CLI targets, the runtime maintains a native OS thread pool equivalent to the `--target native` blocking pool, sized by the host runtime configuration (default 512 threads; not configurable via `RuntimeConfig` in scripted mode).

**Sendable constraint.** The closure passed to `spawnBlocking` SHALL only capture values whose types implement `Sendable`. Captured values are serialized for transfer to the blocking thread and the return value `T` is serialized back. The serialization mechanism is the same structured-clone protocol used by `ScriptWorker` channels (§17.10.4). A closure capturing a non-`Sendable` type is a compile-time error (`E_BLOCKING_CAPTURE`).

**GC object restriction.** The body of a `spawnBlocking` closure executes in an environment where the Loup GC heap of the calling script is not accessible. GC-managed objects (classes, closures, `list`, `dict`, `set`) may only be passed if they are `Sendable` and are therefore serialized by value. Mutable class instances are not `Sendable` by default; only classes explicitly declaring `implements Sendable` (with appropriate internal synchronization) may cross the boundary.

**No `await` inside `spawnBlocking`.** The body closure is synchronous. `await` expressions inside `spawnBlocking` are a compile-time error (`E_AWAIT_IN_BLOCKING`).

**Example — CPU-bound work in scripted mode:**

```loup
from sync.thread import (spawnBlocking);

async func compressData(raw: bytes): Task[bytes] {
  // compress() is synchronous and CPU-bound — offload to blocking pool
  let compressed = await spawnBlocking(func() => compress(raw));
  return compressed;
}
```

**Equivalence.** `spawnBlocking` in scripted mode is semantically equivalent to its `--target native` form (§17.9.3). The only difference is the backing implementation: native OS threads on `--target native`, host thread pool on Wasm/scripted.

#### §17.10.2 `ScriptWorker` — Isolated Worker Instances

`ScriptWorker` provides true parallelism in scripted and Wasm environments by spawning an isolated Loup Wasm instance with its own GC heap. Workers communicate with the host script exclusively through typed `WorkerChannel[T]` message channels. Because workers do not share a heap, all values transferred across the channel must implement `Sendable` and are serialized by copy (§17.10.4).

```loup
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

```loup
// host.loup
from concurrent import (ScriptWorker);

async func processChunks(chunks: list[bytes]): Task[list[bytes]] {
  let workers = await TaskGroup.collect(chunks, async func(chunk) {
    let w = await ScriptWorker[bytes].spawn("./worker.loup");
    w.send(chunk);
    let result = await w.receive();
    await w.join();
    return result!;
  });
  return workers;
}
```

```loup
// worker.loup
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

#### §17.10.3 `WorkerChannel[T]` — Typed Message Channel

`WorkerChannel[T]` is the worker-side counterpart to `ScriptWorker[T]`. It is only accessible inside a worker module's `workerMain` function.

```loup
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

#### §17.10.4 Serialization Contract

All values transferred across a `ScriptWorker` channel or through `spawnBlocking` are serialized by the **Loup structured transfer protocol**, which is defined as follows:

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

**Transfer error codes:**

| Code | Condition |
|---|---|
| `E_CHANNEL_ESCAPE` | `WorkerChannel[T]` stored outside `workerMain` scope |
| `E_TRANSFER_NONSENDABLE` | Non-`Sendable` type used in a channel transfer or `spawnBlocking` argument |

**Observable semantics.** The observable contract is: after a value is transferred, the sender and receiver hold **independent copies**. Mutations to the transferred value in one context are never visible in the other. This contract holds regardless of the underlying implementation (copy, move, or — in future Wasm GC shared-heap implementations — immutable reference sharing for frozen objects). User code must not rely on shared identity across a transfer boundary.

**Transfer errors.** If the serialization of a value fails at runtime (e.g. due to a cycle in a `Sendable` class instance that cannot be represented), the transfer throws `WorkerTransferError` at the call site of `send()`, `reply()`, or `spawnBlocking(...)`.

```loup
class WorkerTransferError : Exception {
  pub let typeName: string;
  pub let reason: string;
}
```

#### §17.10.5 Worker Scope Restrictions

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
| Shared arenas (§17b) | ✅ | A worker may attach to arenas shared via `ScriptWorker.share(arena)`. |



---

## §17b Shared-Memory Concurrency

*(This section is normative.)*

This section specifies Loup's shared-memory concurrency model: mechanisms by
which multiple execution contexts — worker Wasm instances, native OS threads,
and a mixture of both — operate on the same underlying memory without copying.
The model complements the message-passing primitives of §17.10 and the native
OS-thread primitives of §17.8–§17.9; it is not a replacement for either.

### §17b.1 Overview and Mode Availability

Shared-memory concurrency in Loup rests on five layered primitives:

1. **The `Shareable` marker trait** (§17b.2) — identifies types whose values may be simultaneously accessed by multiple execution contexts.
2. **`SharedBuffer[T]` and `SharedArray[T]`** (§17b.3) — flat, typed views over shared linear memory for POD data (numeric arrays, byte buffers, fixed-size structs).
3. **`core.atomic` operations** (§17b.4) — atomic load, store, read-modify-write, and compare-exchange primitives mapping directly to Wasm `atomic.*` opcodes on Wasm targets and to platform atomic instructions on native targets.
4. **`SharedRef[T]` and `shared class`** (§17b.5–§17b.6) — atomic reference-counted handles to objects allocated in a shared arena. `shared class` has a normatively specified layout and vtable enabling cross-mode interop (§17b.7).
5. **Shared synchronization primitives** (§17b.8) — `SharedMutex[T]`, `SharedRwLock[T]`, `SharedCondVar`, `SharedSemaphore`, `SharedBarrier`, and `SharedQueue[T]`, built on atomics and the Wasm threads proposal's `memory.atomic.wait` / `memory.atomic.notify` primitives (or platform equivalents).

**Mode availability.** The shared-memory model is available in all execution
modes except where noted. The concrete availability matrix is:

| Construct | w.s | w.c | h.s | h.d | h.n | fs |
|---|---|---|---|---|---|---|
| `Shareable` trait and auto-derivation | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `SharedBuffer[T]` / `SharedArray[T]` | ✓ | ✓ | ✓ | ✓ | ✓ | ⚠¹ |
| `core.atomic` (full surface) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ (subset²) |
| `SharedArena`, `SharedRef[T]`, `shared class` | ✓ | ✓ | ✓ | ✓ | ✓ | ⚠¹ |
| `SharedMutex[T]`, `SharedRwLock[T]`, `SharedCondVar` | ✓ | ✓ | ✓ | ✓ | ✓ | ⚠¹ |
| `SharedQueue[T]`, `SharedSemaphore`, `SharedBarrier` | ✓ | ✓ | ✓ | ✓ | ✓ | ⚠¹ |

1. **Freestanding.** Shared-memory constructs requiring arena allocation are
   available only when the target provides a `@allocator`-backed arena
   satisfying the arena header contract (§17b.5) AND the target platform
   provides multi-core coherent memory with atomic operations. Single-core
   freestanding targets (most microcontrollers) receive `E_SHARED_ALLOCATOR_UNAVAILABLE`
   at the first `shared` allocation.

2. **Atomic subset.** On freestanding targets, only atomic operations supported
   by the target instruction set are available. ARMv7-M and older do not
   support 64-bit atomics and reject `atomicLoad[int64]` / `atomicStore[int64]`
   with `E_ATOMIC_WIDTH_UNSUPPORTED`. `compareExchange` is available whenever
   the target supports LL/SC or CAS instructions.

**Runtime substrate.** On Wasm targets (`w.s`, `w.c`, `h.s`, and the JIT side
of `h.d`), the shared-memory model builds on the **Wasm threads proposal**:
shared linear memory declared with the `shared` memory attribute, `atomic.*`
instructions, and `memory.atomic.wait` / `memory.atomic.notify`. On native
targets (`h.n`, AOT side of `h.d`, freestanding where supported), the model
builds on platform atomics (C11 `<stdatomic.h>` semantics on POSIX; Interlocked
intrinsics on Windows) and futex-like waiting primitives (`futex` on Linux,
`ulock_wait` on macOS, `WaitOnAddress` on Windows).

**Runtime host requirements (Wasm).** A Wasm runtime host hosting Loup MUST:

- Provide a shared linear memory (one instance per `SharedArena`) with a minimum initial size of 64 KiB and a maximum size of at least 4 GiB.
- Expose `memory.atomic.wait32`, `memory.atomic.wait64`, and `memory.atomic.notify` imports, or use the native Wasm instructions if available.
- Permit posting the shared memory handle to worker instances via `postMessage` with transfer (browser) or structured clone with transfer (Node, Bun, Deno, Wasmtime).

These are the Wasm threads proposal's standard requirements. Loup does not
extend them.

**Relationship to `host.dual`.** A `host.dual` module may freely declare and
use `shared class`, `SharedRef[T]`, `SharedBuffer[T]`, and all synchronization
primitives in this section. The cross-mode ABI contract (§17b.7) guarantees
that a `shared class` compiled via the JIT pipeline and the AOT native pipeline
produces byte-identical memory layouts, enabling a scripted caller and a native
callee to operate on the same arena-allocated object without marshalling.

### §17b.2 `Shareable` Marker Trait

`Shareable` is a marker interface indicating that a type is safe for simultaneous
access by multiple execution contexts:

```
namespace core;

pub interface Shareable extends Sendable {}
```

`Shareable` is a strict subset of `Sendable` (§17.8.1): every `Shareable` type
is also `Sendable`, but not every `Sendable` type is `Shareable`. `Sendable`
permits transfer across a thread boundary by value copy; `Shareable` permits
simultaneous reference from multiple threads to the same memory.

**Implicit `Shareable` implementations.** The following types are implicitly
`Shareable` without an explicit `implements Shareable` declaration:

- All primitive types whose in-memory representation is a fixed-width value: `int8`, `int16`, `int32`, `int64`, `uint8`, `uint16`, `uint32`, `uint64`, `float32`, `float64`, `bool`, `char`.
- All `struct` types whose fields are all `Shareable`, provided the struct does not declare a `[lifetime ~name]` parameter and contains no `borrow[~name]` fields.
- All `enum` types whose variant payloads are all `Shareable`, with the same lifetime restrictions as structs.
- `SharedRef[T]` for any `T` that is a `shared class`.
- `SharedBuffer[T]` and `SharedArray[T]` for any `T` that is `Shareable`.
- Fixed-size arrays `T[N]` where `T` is `Shareable`.
- `Atomic[T]` (§17b.4) for primitive `T`.

**Non-`Shareable` types.** The following types are not `Shareable` and cannot
be fields of a `shared class` or elements of `SharedArray[T]`:

- `string` (internally GC-managed with a mutable representation in some backends).
- `list[T]`, `dict[K,V]`, `set[T]` — the built-in growable collections.
- `local class` instances and references to them.
- Closures (`fn(...): T` with captured environment) that capture non-`Shareable` values.
- `Task[T]` (async task handles are scheduler-bound).
- `WorkerChannel[T]` (bound to `workerMain` scope per §17.10.3).

To share a string across threads, copy it into a `SharedArray[char]` or wrap
it in a `shared class StringHandle { chars: SharedArray[char]; }`. To share a
growable collection, use the shared collection types in §17b.8 (`SharedQueue[T]`,
`SharedStack[T]`).

**Explicit opt-in.** A class may explicitly declare `implements Shareable` only
if it is a `shared class` — a `local class` cannot implement `Shareable`. The
compiler enforces this at the class declaration:

```
shared class LockFreeCounter implements Shareable {   // OK — shared class can
  let count: Atomic[int64];
  new() { this.count = Atomic[int64].new(0); }
  func increment(): int64 { return this.count.fetchAdd(1); }
}

local class FooLocal implements Shareable {   // E_SHAREABLE_LOCAL_CLASS
  ...
}
```

A `shared class` with all-`Shareable` fields implicitly implements `Shareable`;
the explicit declaration is optional but permitted for documentation.

### §17b.3 `SharedBuffer[T]` and `SharedArray[T]`

`SharedBuffer[T]` and `SharedArray[T]` provide flat, typed views over shared
linear memory for plain-old-data.

```
namespace core;

// A raw shared memory region of `byteLength` bytes, divisible into typed
// views. The underlying bytes are allocated in a SharedArrayBuffer (Wasm)
// or mmap'd shared region (native). The buffer is reference-counted; the
// backing memory is freed when all SharedBuffer handles and all views into
// it are dropped.
pub shared class SharedBuffer[T: Shareable] {
  pub static func create(elementCount: int): SharedBuffer[T];
  pub static func fromRaw(bytes: bytes): SharedBuffer[T];   // copies input

  pub let length: int;                 // element count
  pub let byteLength: int;             // length * sizeof(T)

  pub func get(index: int): T;         // atomic on index boundaries when T is primitive
  pub func set(index: int, value: T): void;

  pub func slice(start: int, end: int): SharedArray[T];   // non-owning view
  pub func asArray(): SharedArray[T];                     // full-range view

  // Bulk transfer. Copies memory atomically word-by-word; does not provide
  // cross-element atomicity (use a SharedMutex for that).
  pub func copyTo(dst: SharedBuffer[T], srcStart: int, dstStart: int, count: int): void;
  pub func fill(value: T, start: int = 0, end: int? = None): void;
}

// A non-owning typed view over a SharedBuffer. Multiple SharedArray views may
// exist over the same underlying SharedBuffer. Views carry their own bounds
// but share the backing memory.
pub shared class SharedArray[T: Shareable] {
  pub let length: int;

  pub func get(index: int): T;
  pub func set(index: int, value: T): void;

  pub func slice(start: int, end: int): SharedArray[T];

  // Parallel iteration helper — splits the range across workers.
  // body runs on the current execution context; workers must be spawned
  // separately to actually parallelize.
  pub func forEach(body: fn(i: int, v: T): void): void;
}
```

**Access semantics (non-atomic).** The `get` and `set` methods on
`SharedBuffer[T]` and `SharedArray[T]` perform **non-atomic** loads and stores
when `T` is a primitive wider than the target's natural atomic width. For
race-free access to a specific element across threads, use the methods in
§17b.4 (`atomicLoad`, `atomicStore`, etc.) which take a `SharedArray[T]` and
an index as arguments.

**Bounds checking.** All indexed accesses are bounds-checked. Out-of-range
access throws `IndexError` at runtime. The compiler MAY elide bounds checks
when the index is statically provable to be in range.

**Endianness.** Multi-byte primitives in `SharedBuffer[T]` are stored in
**native endianness** of the target platform. Programs that need
byte-exchangeable representations across platforms must serialize through
`data.bytes` explicitly.

**Layout.** `SharedBuffer[T]` for primitive `T` uses the natural alignment
of `T` (aligned on `sizeof(T)` boundaries). For `struct` `T`, the layout
follows the `@repr(C)` rules — field order, natural alignment, and trailing
padding as specified by the target C ABI.

### §17b.4 `core.atomic` — Atomic Operations

The `core.atomic` namespace provides atomic operations on `SharedArray[T]`
indices and on `Atomic[T]` cell wrappers.

```
namespace core.atomic;

// Memory ordering parameter — semantics match C11 and Wasm.
pub enum Ordering {
  Relaxed;         // no ordering constraint
  Acquire;         // no prior ops can be reordered after
  Release;         // no subsequent ops can be reordered before
  AcqRel;          // Acquire + Release (RMW ops only)
  SeqCst;          // sequential consistency (default for all ops unless specified)
}

// Atomic load. T must be one of: int8, int16, int32, int64, uint8, uint16,
// uint32, uint64, float32, float64, bool.
pub func atomicLoad[T: Shareable](arr: borrow SharedArray[T], index: int,
                                    ord: Ordering = SeqCst): T;

pub func atomicStore[T: Shareable](arr: borrow SharedArray[T], index: int,
                                     value: T, ord: Ordering = SeqCst): void;

// Read-modify-write operations. Return the old value.
pub func fetchAdd[T: Integer + Shareable](arr: borrow SharedArray[T], index: int,
                                           delta: T, ord: Ordering = SeqCst): T;
pub func fetchSub[T: Integer + Shareable](arr: borrow SharedArray[T], index: int,
                                           delta: T, ord: Ordering = SeqCst): T;
pub func fetchAnd[T: Integer + Shareable](arr: borrow SharedArray[T], index: int,
                                           mask: T, ord: Ordering = SeqCst): T;
pub func fetchOr[T: Integer + Shareable](arr: borrow SharedArray[T], index: int,
                                          mask: T, ord: Ordering = SeqCst): T;
pub func fetchXor[T: Integer + Shareable](arr: borrow SharedArray[T], index: int,
                                           mask: T, ord: Ordering = SeqCst): T;
pub func exchange[T: Shareable](arr: borrow SharedArray[T], index: int,
                                 newValue: T, ord: Ordering = SeqCst): T;

// Compare-and-swap. Succeeds if current value == expected; stores `desired`
// on success. Returns (success, actualValue).
pub func compareExchange[T: Shareable](arr: borrow SharedArray[T], index: int,
                                        expected: T, desired: T,
                                        successOrd: Ordering = SeqCst,
                                        failureOrd: Ordering = Acquire):
                                        (bool, T);

// Wait/notify — block until the value at `index` differs from `expected`.
// `timeoutMs` of None means wait indefinitely; 0 means poll without blocking.
// Returns: Ok if woken by notify, Timeout if timed out, NotEqual if value
// already differed.
pub enum WaitResult { Ok; Timeout; NotEqual; }

pub func wait[T: Integer + Shareable](arr: borrow SharedArray[T], index: int,
                                       expected: T, timeoutMs: int? = None): WaitResult;

// Wake up to `count` waiters blocked on (arr, index). Returns the number
// actually woken. `count = -1` wakes all.
pub func notify[T: Integer + Shareable](arr: borrow SharedArray[T], index: int,
                                         count: int = 1): int;

// Memory fences — order prior/subsequent operations without data operation.
pub func fence(ord: Ordering): void;

// Atomic cell — a single-element shared atomic of type T. Implemented as
// an inline value type (struct-like) so it can be embedded directly as a
// field of a shared class without an extra level of indirection.
pub struct Atomic[T: Shareable] implements Shareable, Sendable {
  pub static func new(initial: T): Atomic[T];

  pub func load(ord: Ordering = SeqCst): T;
  pub func store(value: T, ord: Ordering = SeqCst): void;
  pub func fetchAdd(delta: T, ord: Ordering = SeqCst): T where T: Integer;
  pub func fetchSub(delta: T, ord: Ordering = SeqCst): T where T: Integer;
  pub func exchange(newValue: T, ord: Ordering = SeqCst): T;
  pub func compareExchange(expected: T, desired: T,
                            successOrd: Ordering = SeqCst,
                            failureOrd: Ordering = Acquire): (bool, T);
}
```

`Atomic[T]` is a value type — when declared as a field of a `shared class`,
it is laid out inline (consuming `sizeof(T) + alignment padding` bytes in
the enclosing object). This is a deliberate departure from the default
where `shared class` fields are accessed via `SharedRef[T]`; `Atomic[T]`
is specifically designed for inline embedding because its atomic access
requires the data to live at a stable address within the enclosing object's
layout.

**Wasm mapping.** On Wasm targets, these operations lower directly to the
Wasm threads proposal's `atomic.*` opcodes:

| Loup function | Wasm opcode |
|---|---|
| `atomicLoad[int32]` | `i32.atomic.load` |
| `atomicStore[int32]` | `i32.atomic.store` |
| `fetchAdd[int32]` | `i32.atomic.rmw.add` |
| `compareExchange[int32]` | `i32.atomic.rmw.cmpxchg` |
| `wait[int32]` | `memory.atomic.wait32` |
| `notify[int32]` | `memory.atomic.notify` |
| `fence(SeqCst)` | `atomic.fence` |

64-bit atomics use the `i64.atomic.*` variants. Float atomics are implemented
by bit-casting to the integer of matching width.

**Native mapping.** On native targets, these operations lower to the target's
native atomic instructions (LOCK-prefixed on x86-64, LDXR/STXR on ARM64) or
the C11 atomic intrinsics equivalent to `atomic_load_explicit` etc. The
`wait`/`notify` operations use `futex` on Linux, `__ulock_wait`/`__ulock_wake`
on macOS, and `WaitOnAddress`/`WakeByAddressSingle` on Windows.

**Memory-ordering defaults.** The default `Ordering` is `SeqCst`, matching
C11, C++, and Wasm. `SeqCst` is conservative but correct for all programs.
Performance-sensitive code should profile before relaxing.

### §17b.5 `SharedArena` and Allocation

`SharedArena` is the memory region in which `shared class` instances,
`SharedBuffer[T]` backing stores, and synchronization-primitive state live.
Arenas are the unit of cross-context memory sharing: two execution contexts
(workers, native threads, native modules in the same process) share data by
attaching to the same arena.

```
namespace core;

// A handle to a shared memory region. Reference-counted itself — the arena
// is freed when the last SharedArena handle AND all objects allocated within
// it are dropped.
pub shared class SharedArena {
  // Create a new shared arena.
  // - `capacityBytes` — initial size (rounded up to the Wasm page boundary of 64 KiB).
  // - `maxBytes` — maximum size the arena may grow to; None means "same as capacity".
  // The arena grows automatically up to maxBytes when allocation pressure requires.
  pub static func create(capacityBytes: int, maxBytes: int? = None): SharedArena;

  pub let capacityBytes: int;
  pub let usedBytes: int;
  pub let maxBytes: int;   // matches capacityBytes if non-growable

  // Bytes allocated and not yet freed. Changes as shared classes are allocated
  // and released within this arena.
  pub func liveBytes(): int;

  // Force compaction of the arena's free list. Does not move live objects;
  // only coalesces free regions. Optional — the allocator runs this opportunistically.
  pub func compact(): void;
}
```

**Arena header.** Every shared arena begins with a fixed-layout header that
both JIT-compiled and AOT-compiled code parse identically:

```
Offset  Size  Field                    Description
---------------------------------------------------------------------------
 0      4     magic                    0x4C4F4F4D ("LOUP" in ASCII)
 4      4     abiVersion               see §17b.7
 8      8     capacityBytes            total arena size
16      8     usedBytes                high-water mark of allocator
24      8     freeListRoot             offset of free-list head
32      8     weakTableRoot            offset of weak-reference side table
40      8     metadataRoot             offset of type-info registry
48      8     refcount                 arena's own refcount
56      8     flags                    bit 0 = growable; bit 1 = read-only
64      ...   (allocator-managed)
```

All fields in the header are stored in little-endian byte order regardless
of target endianness, to enable cross-platform arena portability (e.g., an
arena written by an x86-64 native process consumed by an ARM64 Wasm runtime
via a serialized dump).

**Bootstrap.** `SharedArena` is itself a `shared class` whose instances
live in shared memory. This creates an apparent bootstrap problem: an arena
must exist before any `shared class` (including `SharedArena` itself) can
be allocated. The runtime resolves this by maintaining a **primordial arena**
per execution context — a fixed-size shared memory region allocated by the
runtime host during context initialization (browser bootstrap, `loup run`
startup, native thread creation, etc.). The primordial arena is reserved
for `SharedArena` instances themselves and a small set of runtime-internal
bookkeeping objects; it is never exposed to user code as a target for
`shared T(...)` allocations. User-created `SharedArena` instances live in
the primordial arena; user `shared class` instances live in user-created
arenas. The primordial arena's size is implementation-defined (SHOULD be
at least 1 MiB) and is never growable.

**Allocator.** The arena allocator is a segregated-free-list allocator with
size classes matching the sizes of declared `shared class` types plus a
fallback for larger allocations. The specific implementation is not
normative, provided:

- Allocation is thread-safe under concurrent access.
- Free-list updates are ordered such that no allocation returns memory currently in use.
- The allocator maintains the arena's `usedBytes` and `liveBytes` counters accurately within a bounded delay.

**Growth.** If an arena is created with `maxBytes > capacityBytes`, the
allocator MAY grow the arena up to `maxBytes` when allocation pressure
requires. Growth on a Wasm-hosted shared memory uses `memory.grow` on the
shared memory instance. Growth on a native-hosted arena uses `mremap` (Linux)
or equivalent platform API. Growth SHALL be coordinated across all attached
contexts via an arena-internal rwlock on the header.

**Attachment from workers and native modules.** A `SharedArena` handle can be
transferred to a `ScriptWorker` (§17.10.2) via `ScriptWorker.share(arena)`,
after which the worker's attached arena is the same memory region. Similarly,
a native thread spawned via `Thread.spawn` (§17.8) inherits the spawning
thread's attached arenas. Detachment is automatic when the context exits.

**Module-level initialization.** The main execution context's default shared
arena is created lazily on first `shared` allocation, including allocations
performed during module-level top-level statement execution (§2.4.3 for
`host.scripted`; equivalent architectural-entry setup for other modes). A
module that declares a top-level binding initialized with `shared T(...)`
triggers default-arena creation at that point. Once any shared allocation has
occurred in a context, `runtime.configureDefaultSharedArena(...)` produces
`DefaultArenaAlreadyInitializedError`. Programs that need a custom default
arena configuration MUST call `configureDefaultSharedArena` before any
top-level shared allocation; the recommended practice is to place the
configuration call in a dedicated `init.loup` module imported before any
module that allocates shared objects.

**Error codes:**

| Code | Condition |
|---|---|
| `E_SHARED_ALLOCATOR_UNAVAILABLE` | Shared allocation attempted on a target without arena support (typically freestanding single-core) |
| `E_SHARED_ARENA_OOM` | Arena grew to `maxBytes` and cannot satisfy the allocation |
| `E_SHARED_ARENA_CORRUPTED` | Arena header magic/version mismatch at attach time |

### §17b.6 `SharedRef[T]` and `shared class`

`SharedRef[T]` is the ref-counted handle to a `shared class` instance. It is
Loup's analogue to Rust's `Arc<T>` with a stable cross-mode ABI.

**On the `T` parameter.** `SharedRef[T]` accepts a type parameter `T` that
MUST be a `shared class` type. The bound `T: shared class` is a v1.18
**class-kind bound** — a new form of generic bound (§12) that constrains
`T` to a specific class memory strategy. Class-kind bounds are distinct
from trait bounds: they restrict which *declarations* of `T` are allowed
(which is decidable at compile time from the type's declaration form),
not which *interfaces* `T` implements. Other class-kind bounds are
`T: local class` and `T: class` (matches either). Class-kind bounds may
be combined with trait bounds via `+`: `T: shared class + Serializable`.

```
namespace core;

// Value type, not itself a shared class — see §21.1.5 rationale.
pub struct SharedRef[T: shared class] implements Shareable, Sendable {
  // Clone — increments the atomic refcount and returns a new handle
  // to the same instance. Runs in O(1).
  pub func clone(): SharedRef[T];

  // Downgrade to a weak reference. `SharedWeakRef[T]` is the shared-arena
  // weak reference type; see §8 (weak field qualifier) and the Loup
  // Standard Library Reference §21.1.6 for the full contract.
  pub func downgrade(): SharedWeakRef[T];

  // Strong reference count (observational only; inherently racy — use for
  // diagnostics, not logic).
  pub func strongCount(): int;

  // Weak reference count (observational only).
  pub func weakCount(): int;

  // Pointer equality — true iff both handles refer to the same instance.
  pub func same(other: borrow SharedRef[T]): bool;
}
```

**Allocation syntax.** A `shared class` instance is allocated by calling the
class's constructor with the `shared` keyword prefix, optionally naming an
arena:

```
// Allocate in the default arena for the current context.
let v: SharedRef[Vertex] = shared Vertex(1.0, 2.0, 3.0);

// Allocate in a specific arena.
let myArena = SharedArena.create(16.MiB);
let v2: SharedRef[Vertex] = shared(myArena) Vertex(4.0, 5.0, 6.0);
```

The `shared` prefix is a compile-time marker, not a runtime expression.
`shared Vertex(...)` evaluates to a `SharedRef[Vertex]`, not to a bare
`Vertex`. There is no way to obtain a non-refcounted reference to a `shared
class` instance except via `borrow` (§17b.9).

**Default arena.** Each execution context has a **default shared arena**
that receives allocations made without an explicit arena argument. The
default arena is created lazily on first use with implementation-defined
default capacity (SHOULD be at least 16 MiB, growable). Contexts may replace
their default arena via `runtime.setDefaultSharedArena(arena)`.

**Retain/release semantics.** Every strong-reference duplication (via
`clone`, via parameter passing that doesn't use `borrow`, via storage in a
field) increments the atomic refcount. Every drop decrements. When the
refcount hits zero:

1. The instance's `finalize()` method is invoked (if declared).
2. All strong references held in fields of the instance are released, which may cascade.
3. Any `WeakRef[T]` handles pointing at the instance are atomically zeroed.
4. The memory is returned to the arena's free list.

These steps happen synchronously on the thread that released the last
reference, matching the ARC-equivalent contract of §8.1.1.

**Cross-thread access.** Multiple threads may simultaneously hold
`SharedRef[T]` handles to the same instance. Simultaneous read access is
always safe. Simultaneous mutation of a field without synchronization is a
data race and produces undefined behavior unless the field type is an
`Atomic[T]` or unless access is gated by a `SharedMutex`/`SharedRwLock`.
Loup's borrow checker enforces this statically via the ownership verbs
(§17b.9).

**Cycle handling.** `SharedRef[T]` does not automatically collect cycles.
Users must break cycles with `WeakRef[T]`. The specification explicitly does
not mandate a cycle collector for shared objects; implementations SHOULD
document whether they provide one as a diagnostic aid.

### §17b.7 Cross-Mode ABI Contract

*(This subsection is normative.)*

The cross-mode ABI is the set of layout and protocol rules that both the
JIT (Wasm GC+EH) and AOT (native) compilers honor when compiling `shared
class` declarations. Conformance to this contract enables byte-identical
representation of `shared class` instances across modes, which in turn
enables zero-copy interop between `host.scripted` and `host.native` code
attached to the same arena.

**Object layout.** A `shared class` instance has the following layout:

```
Offset  Size  Field                Description
---------------------------------------------------------------------------
 0      8     refcount             atomic strong-reference count (u64)
 8      8     weakcount            atomic weak-reference count (u64)
16      8     typeDescriptor       offset into arena's metadata registry
24      8     vtablePtr            offset into arena's vtable region
32      ...   (fields)             fields in declaration order, C-ABI-aligned
```

All header fields are stored in little-endian. The 32-byte header is fixed
for all `shared class` instances regardless of the class. The `typeDescriptor`
and `vtablePtr` fields are arena-relative offsets, not absolute pointers, so
an arena can be relocated in a process's address space (e.g., via `mremap`
growth) without invalidating object references.

**Field layout.** Fields follow the header in **declaration order**, laid
out per the target platform's C ABI:

- Natural alignment (a field of type `T` starts at an offset that is a
  multiple of `alignof(T)`).
- Trailing padding to bring the total size to a multiple of the class's
  maximum field alignment.
- No reordering. Unlike some managed runtimes, Loup does not reorder fields
  for packing; programmers may rely on declared order.

For fields of `shared class` type (via `SharedRef[T]`), the stored value is
an arena-relative offset to the referenced instance plus a 1-bit discriminant
in the high bit indicating whether the reference is null.

**Refcount protocol.**

- *Retain* — atomic `fetchAdd(1, Relaxed)` on the `refcount` word. Relaxed
  ordering is sufficient because the caller already has a valid reference.
- *Release* — atomic `fetchSub(1, AcqRel)` on the `refcount` word. If the
  returned prior value was 1, the releasing thread enters the destruction
  path. AcqRel ordering synchronizes the destruction with prior mutations
  from other threads.
- *Weak retain* — atomic `fetchAdd(1, Relaxed)` on the `weakcount` word.
- *Weak release* — atomic `fetchSub(1, AcqRel)`. If both `refcount` and
  `weakcount` reach zero, the instance's memory is returned to the arena.
- *Upgrade* — `compareExchange` loop on `refcount`: succeed if old value > 0,
  incrementing it by 1; fail if old value == 0 (the instance has been
  destroyed). Ordering: AcqRel on success, Acquire on failure.

**Vtable.** Each `shared class` has a vtable stored in the arena's vtable
region. The vtable is an array of function pointers, one per virtual method
in declaration order, followed by the entries for inherited virtual methods
in superclass-first order. The first entry is always the `finalize()`
function pointer (null if not declared).

On Wasm targets, "function pointer" means a `funcref` (Wasm table index).
On native targets, it means a native function pointer. The JIT and AOT
compilers each populate the vtable with the appropriate pointer type when
the arena is attached; a given arena contains vtable entries for the mode
that produced the instance, plus fallback entries for cross-mode calls.

**Cross-mode vtable coordination.** When an arena is first attached by a
given mode, the runtime walks the arena's type metadata registry and
populates per-mode vtable entries for each `shared class`:

- JIT attach: populates a "jit\_funcref" slot per vtable entry with Wasm
  `funcref` values.
- AOT attach: populates a "aot\_ptr" slot per vtable entry with native
  function pointers.

Each `shared class` has one vtable per attached mode; all slots point to
implementations of the same Loup method with identical observable behavior.
When a method is invoked on a `SharedRef[T]`, the call site selects the
slot matching the caller's mode.

**ABI versioning.** The 32-bit `abiVersion` field in the arena header
identifies the shared-class ABI version. v1.18 defines `abiVersion = 1`.
Attempting to attach to an arena with `abiVersion` not supported by the
attaching toolchain produces `E_SHARED_ARENA_VERSION_MISMATCH`.

**What the ABI does NOT guarantee.**

- Methods' internal control flow and performance characteristics may differ
  between modes. Only the observable behavior (arguments, return values,
  field mutations, side effects) must match.
- Arena memory is not intended to be persistent across process lifetimes —
  the contract applies to live arenas shared between attached contexts
  within a single process. Serialization to disk is a separate concern
  handled by `data.bytes` / `data.json` (not via raw arena copy).

### §17b.8 Shared Synchronization Primitives

The following primitives build on `core.atomic` and the wait/notify operations
of §17b.4. All are `shared class` types allocated in a specific arena.

```
namespace sync.shared;

// Mutex guarding a single shared value. Methods use ownership verbs —
// lock() returns a guard granting exclusive (edits) access.
pub shared class SharedMutex[T: Shareable] {
  pub static func new(initial: T, arena: SharedArena? = None): SharedRef[SharedMutex[T]];

  // Acquire exclusive access. Blocks until lock is acquired.
  pub async func lock(): MutexGuard[T];

  // Non-blocking attempt. Returns None if the lock is held.
  pub func tryLock(): Option[MutexGuard[T]];
}

// Guard value returned by lock(). Exclusive access to the protected T is
// modeled via `edits` (§17b.9). Dropping the guard releases the lock.
pub shared class MutexGuard[T: Shareable] {
  // Access the protected value for reading.
  pub func reads(body: fn(reads T): void): void;

  // Access the protected value for mutation.
  pub func edits(body: fn(edits T): void): void;
}

// Reader-writer lock. Many readers or one writer, not both.
pub shared class SharedRwLock[T: Shareable] {
  pub static func new(initial: T, arena: SharedArena? = None): SharedRef[SharedRwLock[T]];

  pub async func readLock(): RwReadGuard[T];
  pub async func writeLock(): RwWriteGuard[T];

  pub func tryReadLock(): Option[RwReadGuard[T]];
  pub func tryWriteLock(): Option[RwWriteGuard[T]];
}

// Condition variable — for waiting on a predicate over the protected state.
pub shared class SharedCondVar {
  pub static func new(arena: SharedArena? = None): SharedRef[SharedCondVar];

  pub async func wait[T: Shareable](guard: MutexGuard[T]): void;
  pub func notifyOne(): void;
  pub func notifyAll(): void;
}

// Counting semaphore.
pub shared class SharedSemaphore {
  pub static func new(count: int, arena: SharedArena? = None): SharedRef[SharedSemaphore];

  pub async func acquire(): void;
  pub func release(count: int = 1): void;
  pub func tryAcquire(): bool;
}

// Barrier — n threads each call wait(); they all proceed together.
pub shared class SharedBarrier {
  pub static func new(parties: int, arena: SharedArena? = None): SharedRef[SharedBarrier];

  pub async func wait(): void;
}

// Multi-producer, multi-consumer channel. Lock-free internally.
pub shared class SharedQueue[T: Shareable] {
  pub static func new(capacity: int, arena: SharedArena? = None): SharedRef[SharedQueue[T]];

  pub async func send(value: T): void;          // blocks if full
  pub async func receive(): T;                  // blocks if empty
  pub func trySend(value: T): bool;
  pub func tryReceive(): Option[T];
  pub func close(): void;                       // wakes all waiters; future sends fail

  pub let length: int;                          // observational
  pub let capacity: int;
}

pub class QueueClosedError : Exception {}
```

**Lock ordering.** When a program acquires multiple shared locks, the
`@lockOrder(n)` annotation (§23.4.x) applies to `SharedMutex` and
`SharedRwLock` identically to native locks. Cross-mode lock ordering is
enforced by the compiler on both the JIT and AOT sides.

**Poison policy.** If a thread panics while holding a `SharedMutex` or
`SharedRwLock`, the lock is **poisoned** — subsequent acquisitions throw
`PoisonedLockError` unless the caller explicitly uses `lockRecover()` to
acquire the lock with awareness that the protected state may be inconsistent.
This matches Rust's `std::sync::Mutex` poisoning.

**Wait semantics.** `async func lock()`, `async func readLock()`, etc.,
integrate with the async executor: if the lock is contended, the current
task is parked on the lock's internal wait queue and another task may run.
On Wasm, parking uses `memory.atomic.wait32`. On native, it uses the
platform's futex equivalent. The scheduler is responsible for re-polling
the task when the lock becomes available.

### §17b.9 Ownership Verbs and Shared Types

The existing ownership verbs (§23.4.x) apply to `SharedRef[T]` and `shared
class` with the following refinements:

| Verb | Meaning on `SharedRef[T]` / shared class |
|---|---|
| `reads` | Shared-read access. Multiple threads may hold `reads` simultaneously. Atomic refcount unchanged (elided). Compiler emits acquire fences where needed for cross-thread visibility. |
| `edits` | Exclusive access. Requires the caller to prove exclusivity — typically by holding a `MutexGuard` or an `excl borrow`. At most one thread may hold `edits` at a time. |
| `takes` | Consumes the handle. If this is the last reference, triggers destruction. Crossing a thread boundary is permitted (unlike `local class`). |
| `shares` | Grants a cloned strong reference for the duration of the scope. Atomic `fetchAdd(1)` on entry, `fetchSub(1)` on exit. |
| `borrow` | Lifetime-bounded non-refcounted reference. Zero atomic ops inside the borrow scope. Primary optimization path for hot loops over shared data. |
| `excl borrow` | Exclusive `borrow`. Requires proof of exclusivity. Equivalent to a single-threaded mutable borrow. |

**Refcount elision via `borrow`.** The common pattern for hot-loop
performance is to retain once at the outer scope and pass `borrow` references
throughout the loop:

```
async func processGraph(g: shared Graph): void {
  let guard = await g.nodes.readLock();
  guard.reads(func(reads nodes: SharedArray[SharedRef[Node]]) {
    for i in 0..<nodes.length {
      let node = nodes.get(i);       // one retain at index
      processNode(borrow node);       // zero refcount traffic inside loop
    }                                 // release at end-of-scope
  });
}
```

**Cross-thread capture.** A closure passed to `Thread.spawn`,
`spawnBlocking`, `ScriptWorker.send`, or `TaskGroup.collect` may capture
`SharedRef[T]` freely — the capture triggers an atomic `fetchAdd` and the
captured handle is a fully independent owner. By contrast, `borrow T` in
the captured closure is `E_BORROW_THREAD_CAPTURE` (existing rule), as the
borrow's lifetime cannot be proven to outlive the spawned context.

**`Sendable` vs. `Shareable`.** A value that is only `Sendable` (not
`Shareable`) may be sent across a thread boundary by value copy (e.g., via
`ScriptWorker.send`). A value that is `Shareable` may additionally be
shared by reference — multiple threads hold live references to the same
underlying memory. `SharedRef[T]` is `Shareable` because its clone is a
reference-sharing operation; `string` is `Sendable` but not `Shareable`
because copying is the only cross-thread mode.

### §17b.10 Worker Integration

`ScriptWorker` (§17.10.2) is extended with arena-sharing methods:

```
namespace concurrent;

// Extension to ScriptWorker[M] — methods in this section appear on the
// same class defined in §17.10.2.
class ScriptWorker[M: Sendable] {
  // Share an arena with this worker. The worker's default shared arena is
  // augmented with this arena; the worker may allocate in it and reference
  // existing objects within it. May be called multiple times to share
  // additional arenas.
  pub func share(arena: SharedRef[SharedArena]): void;

  // Send a SharedRef to the worker without serialization. The worker must
  // have access to the referenced object's arena (via share() or by creating
  // the arena itself).
  pub func sendRef[T: shared class](ref: SharedRef[T]): void;

  // Receive a SharedRef sent by the worker via channel.replyRef().
  pub async func receiveRef[T: shared class](): Option[SharedRef[T]];
}

class WorkerChannel[T: Sendable] {
  // Worker-side counterpart to host's sendRef/receiveRef.
  pub async func receiveRef[S: shared class](): Option[SharedRef[S]];
  pub func replyRef[S: shared class](ref: SharedRef[S]): void;
}
```

**Zero-copy semantics.** `sendRef` / `receiveRef` do not serialize.
Internally they transfer the arena-relative offset of the referenced
instance, increment the atomic refcount, and deliver the offset to the
receiver. The receiver constructs a `SharedRef[T]` pointing to the same
instance. This is the primary mechanism for cross-worker data sharing
with zero marshalling cost.

**Arena compatibility check.** At the moment of `sendRef`, the runtime
verifies that the worker has the referenced arena attached. If not,
`sendRef` throws `WorkerArenaNotAttachedError` at the caller site. The
programmer must call `worker.share(arena)` before sending refs into objects
in that arena.

### §17b.11 Error Codes

| Code | Condition |
|---|---|
| `E_SHARED_FIELD_NOT_SHAREABLE` | Field declared in a `shared class` has a non-`Shareable` type |
| `E_UNIQUE_SHARED` | Class declares both `unique` and `shared` modifiers |
| `E_SHARED_DYNAMIC` | Class declares both `dynamic` and `shared` modifiers |
| `E_SHAREABLE_LOCAL_CLASS` | `local class` explicitly declares `implements Shareable` |
| `E_SHARED_ALLOCATOR_UNAVAILABLE` | Shared allocation attempted on a target without arena support |
| `E_SHARED_ARENA_OOM` | Arena grew to `maxBytes` and cannot satisfy allocation |
| `E_SHARED_ARENA_CORRUPTED` | Arena header magic/version mismatch at attach time |
| `E_SHARED_ARENA_VERSION_MISMATCH` | Arena ABI version not supported by attaching toolchain |
| `E_ATOMIC_WIDTH_UNSUPPORTED` | Atomic operation requested at a width unsupported by target (e.g., 64-bit on ARMv7-M) |
| `E_BORROW_THREAD_CAPTURE` | `borrow T` captured in a cross-thread closure (existing; now applies to shared refs too) |
| `E_CLASS_KIND_MISMATCH` | Generic type argument violates a class-kind bound (e.g., `T: shared class` receives a `local class`) |
| `E_GUARD_RELEASED` | Use of a `SharedMutexGuard` / `SharedRwReadGuard` / `SharedRwWriteGuard` after `release()` (statically-detectable cases) |

| Runtime error | Condition |
|---|---|
| `WorkerArenaNotAttachedError` | `sendRef` target worker lacks the referenced arena |
| `PoisonedLockError` | Acquired a `SharedMutex` / `SharedRwLock` poisoned by a prior panic |
| `QueueClosedError` | Send/receive on a closed `SharedQueue` |
| `ResurrectionError` | Finalizer stored `this` in a reachable location |
| `FinalizerTimeoutError` | Finalizer exceeded implementation-defined time limit |
| `ReleasedGuardError` | Use of a released guard (dynamically-detected cases) |

---

## §18 FFI and Host Interop

*(This section is normative.)*

Loup provides an explicit foreign function interface for calling JavaScript APIs and native shared libraries. FFI declarations are opt-in and syntactically visible.

### §18.1 JavaScript Interop (`extern js`)

```
extern js func fetch(url: string, opts: Any): Task[Any];
extern js func parseInt(s: string, radix: int): int;
extern js val document: Any;
extern js val window: Any;
```

**Rules:**

- `extern js func` and `extern js val` are simple declarations (trailing `;`).
- Declared Loup types are trusted and not verified at compile time; type mismatches produce runtime errors.
- `extern js func` returning a JS Promise is declared with return type `Task[T]`; the runtime wraps the Promise automatically.
- `extern js` declarations are only valid on `browser`, `node`, `bun`, and `deno` targets (i.e. targets where a JavaScript runtime is present). Using `extern js` in `@mode(host.native)` or `@mode(freestanding)` files is a compile-time error (`E_EXTERN_JS_NOT_NATIVE`, defined in §24.22).

**SharedArrayBuffer aliasing (normative).** Any `extern js` declaration that accepts or returns a typed array (e.g., `Uint8Array`, `Float32Array`) backed by a `SharedArrayBuffer` MUST carry `@unsafe("sharedMemory: <reason>")` at the declaration site. The reason string SHALL document which Loup tasks or workers share the buffer and the synchronization protocol used. Without this annotation, the compiler treats the buffer as exclusively owned by the Loup side. Concurrent access by JS code to memory also accessed by Loup constitutes a data race outside Loup's ownership model.

`lang.interop.js` provides `SharedView[T]` as a safe wrapper for `SharedArrayBuffer` access — all reads and writes go through `native.atomic`-backed operations, making the shared-memory protocol explicit at the type level:

```loup
from lang.interop.js import (SharedView);

// Safe: all accesses are atomic
let view = SharedView[uint32].fromBuffer(sharedBuf)
view.store(0, 42u32)
let val = view.load(0)   // returns uint32
```

Raw `extern js` declarations of `SharedArrayBuffer`-backed types must use `@unsafe("sharedMemory: ...")` and are subject to the programmer's own synchronization discipline.

### §18.2 `@jsexport`

`@jsexport` marks Loup functions as callable from JavaScript:

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
- The runtime marshals JS arguments to declared Loup types using boundary coercions. Unmarshalable arguments produce `FfiTypeError`.
- `async func` exports return a `Promise<T>` to JS.
- Synchronous `@jsexport` functions must not contain `await` (`E_JSEXPORT_AWAIT`).
- `@jsexport` is only valid on `browser` and `service` targets.
- Module-level `@jsexport` functions are accessible as named exports of the compiled module's JS representation.

| Code | Mode | Condition |
|---|---|---|
| `E_JSEXPORT_AWAIT` | web.scripted, web.compiled | `await` expression inside a non-`async` `@jsexport` function body |
| `E_JSEXPORT_NOT_BROWSER` | All | `@jsexport` used on a target other than `browser` or `service` |

### §18.3 Typed JS Facades (`lang.interop.js`)

`lang.interop.js` provides typed wrappers over common Web and Node.js APIs:

```
namespace lang.interop.js;

// HTTP
class Request  : Any { pub let url: string; pub let method: string; pub let body: Option[bytes]; }
class Response : Any {
  pub let status: int;
  pub let ok: bool;
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
  pub var id: string;
  pub var className: string;
  pub func getAttribute(name: string): Option[string];
  pub func setAttribute(name: string, value: string): void;
  pub func addEventListener(event: string, handler: fn(Event): void): void;
  pub func removeEventListener(event: string, handler: fn(Event): void): void;
  pub func appendChild(child: Element): void;
  pub func remove(): void;
  pub var innerHTML: string;
  pub var textContent: string;
}
class Event : Any {
  pub let type: string;
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
- `NativeHandle` is an opaque built-in type for C pointers — cannot be inspected, dereferenced, or constructed in Loup code. Its definition is compiler-internal: `@repr(C) struct NativeHandle { /* opaque */ }`. Values of type `NativeHandle` are only obtained from `extern native` function return values or by calling `OwnedHandle.inner()` / `BorrowedHandle.inner()`. `NativeHandle` is implicitly non-`Sendable`; cross-thread use requires `@unsafe("threadSafe: ...")` (§18.5).
- `extern native` is valid in `@mode(host.native)` (all native targets: `native`, `cli`, `service`, `desktop`) and `@mode(freestanding)`. It is not available in `@mode(host.scripted)` or `@mode(web.compiled)` Wasm targets — there is no native ABI at the Wasm GC boundary (`E_EXTERN_JS_NOT_NATIVE` does not apply here; using `extern native` in a Wasm target is `E_EXTERN_NATIVE_WASM`).
- Passing a Loup `string` to a native function expecting a C string provides a null-terminated UTF-8 copy for the duration of the call.
- Memory management of native resources is the caller's responsibility; use `defer` for cleanup.
- All `extern native` function parameters that receive `borrow` or `borrow[~label]` values are implicitly `noescape`. The compiler verifies that no `borrow[~label]` value escapes the native call. A native function that requires the pointer to outlive the call must be annotated `@unsafe("escapingBorrow: <reason>")` at the declaration site; every call site must also carry `@unsafe("escapingBorrow: <reason>")` to acknowledge that the caller asserts the borrowed value outlives the native call. See §23.4.6.

---

| Code | Mode | Condition |
|---|---|---|
| `E_EXTERN_NATIVE_WASM` | web.scripted, web.compiled, host.scripted | `extern native` declaration in a file targeting Wasm — no native ABI at the Wasm GC boundary |
| `E_EXTERN_STRUCT_NOT_REPR_C` | host.dual, host.native, freestanding | Struct parameter or return type in `extern native` signature is not annotated `@repr(C)` |

**`@repr(C)` requirement for struct parameters.** Any Loup `struct` type passed to or returned from an `extern native` function MUST be annotated `@repr(C)`. Without `@repr(C)`, the compiler cannot guarantee that the Loup struct layout matches the C ABI layout expected by the native function, which would produce silent data corruption. A struct without `@repr(C)` used in an `extern native` signature is `E_EXTERN_STRUCT_NOT_REPR_C`. This requirement applies in all compiled modes (`@mode(web.compiled)` Wasm targets are exempt since C structs are not valid Wasm types; the requirement applies to `@mode(host.native)` and `@mode(freestanding)`).

**Nullable return types — `NativeHandle?` (normative).** An `extern native` function declaration whose return type is `NativeHandle?` (optional `NativeHandle`) maps a null pointer return to `None` automatically. A non-optional `NativeHandle` return maps null to a runtime `NullHandleError` (§26.1). The compiler enforces the distinction at the declaration site:

```loup
// Null → None: caller uses ?.  pattern-matching
extern native "libsqlite3" func sqlite3_open(path: string): NativeHandle?

// Null → NullHandleError at runtime (legacy C APIs that document "never null")
extern native "libfoo" func foo_create(): NativeHandle
```

`NullHandleError extends RuntimeError` (§26.1) and is catchable.

**`PinnedRef[T]` — ARC-pinned lifetime anchor for FFI (normative).** `PinnedRef[T]` holds a strong ARC retain specifically to prevent collection while a native library holds a raw pointer to the object. The constructor increments `strong_count`; `release()` decrements it. `rawPtr()` requires `@unsafe` to acknowledge the transition out of Loup's ownership model:

```loup
namespace native.ffi;

class PinnedRef[T] : Any {
  // Increment strong_count; object will not be collected while pin lives.
  pub static func new(value: T): PinnedRef[T]

  // Raw pointer for native calls. @unsafe — pointer is valid only while pin is live.
  @unsafe("pin: pointer is valid only while this PinnedRef is not released")
  pub func rawPtr(): uint

  // Decrement strong_count. Subsequent rawPtr() calls are invalid.
  pub func release(): void
}
```

Usage pattern:

```loup
let pin = PinnedRef.new(myObject)
someNativeLib_register(pin.rawPtr())   // ✓ — object pinned
// ... later:
pin.release()                          // ARC retain dropped
```

**`OwnedHandle` and `BorrowedHandle` — FFI heap ownership types (normative).** These types in `native.ffi` encode ownership intent at the type level, replacing the informal comment convention:

```loup
namespace native.ffi;

// OwnedHandle: this side is responsible for freeing the resource.
// Move-only (unique semantics): cannot be aliased.
// finalize() calls the registered @deallocator automatically.
unique class OwnedHandle : Any {
  pub static func wrap(raw: NativeHandle): OwnedHandle
  pub func inner(): NativeHandle
  pub func release(): void   // explicit early release; after this, inner() is invalid
}

// BorrowedHandle: this side does NOT own the resource and must not free it.
// ARC-managed; the underlying C pointer is valid for the handle's lifetime.
class BorrowedHandle : Any {
  pub static func wrap(raw: NativeHandle): BorrowedHandle
  pub func inner(): NativeHandle
}
```

A C library function that allocates (e.g., `sqlite3_open`) should be declared to return `OwnedHandle`; one that lends a pointer (e.g., `sqlite3_db_handle`) should return `BorrowedHandle`. The type-level distinction eliminates the double-free and forget-to-free classes of bug at declaration time.

#### §18.4.1 `native.ffi.ptrAdd` — Raw Pointer Arithmetic

*(This section is normative. Applies to `@mode(host.native)` and `@mode(freestanding)`.)*

`native.ffi.ptrAdd` performs raw address arithmetic on `uint`-typed pointer values. It is the single supported mechanism for offsetting raw addresses at the FFI boundary and requires `@unsafe` at each call site because offset validity cannot be checked statically:

```loup
namespace native.ffi;

// Add a byte offset to a raw address. Requires @unsafe acknowledgment at
// every call site.
@unsafe("ptr: caller ensures the offset does not escape the allocation")
func ptrAdd(base: uint, offset: uint64): uint
```

`ptrAdd` does not dereference, allocate, or validate. It is pointer-width integer arithmetic surfaced as a named function so that call sites are greppable for audit. Callers MUST carry `@unsafe("ptr: <reason>")` at the acknowledgment position (§23.4.6).

`size_of[T]()` and `align_of[T]()` — the typical companions for computing element offsets — are specified in §24.4.1 and are available in both `@mode(host.native)` and `@mode(freestanding)`.

### §18.5 FFI Thread Safety (`@unsafe("threadSafe: ...")`, `ThreadSafeHandle`)

*(This section is normative. Applies to `@mode(host.native)` and `@mode(freestanding)`.)*

Native libraries accessed via `extern native` vary widely in their thread-safety properties. The FFI layer provides two constructs for expressing and enforcing thread safety of native handles: the `@unsafe("threadSafe: ...")` annotation (§23.4.6) and the `ThreadSafeHandle` wrapper type.

#### §18.5.1 `@unsafe("threadSafe: ...")` Annotation

```loup
// Declares that the external function is safe to call concurrently from multiple threads.
// This is a programmer assertion — use @unsafe to make the assertion auditable.
@unsafe("threadSafe: libpq pq_exec is documented as thread-safe when using separate connections")
extern native "libpq" func pq_exec(conn: NativeHandle, query: string): NativeHandle;
```

`@unsafe("threadSafe: <reason>")` on an `extern native` declaration:

- Marks the function as safe to call from any OS thread.
- Allows the function to be called from `Thread.spawn` closures and `spawnBlocking` bodies without triggering a non-`Sendable` capture error on the handle argument.
- Is a **programmer assertion** via the unified `@unsafe` surface (§23.4.6) — the compiler trusts the declaration. If the underlying library is not actually thread-safe, data races and undefined behaviour are the programmer's responsibility.
- The required reason string documents the basis for the thread-safety claim, making the assertion greppable and auditable.

Without `@unsafe("threadSafe: ...")`, an `extern native` function is assumed non-thread-safe. Its `NativeHandle` arguments are non-`Sendable` by default and may not cross thread boundaries.

Thread-safety assertions on `extern native` declarations use `@unsafe("threadSafe: <reason>")`.

#### §18.5.2 `ThreadSafeHandle`

```loup
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

```loup
@mode(host.native)

from native.ffi import (ThreadSafeHandle);

extern native "libpq" func pq_connect(connstr: string): NativeHandle;

@unsafe("threadSafe: libpq pq_exec is documented thread-safe with separate connection handles")
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
  log(i"count is now: {$ count.get() $}");
});

count.set(1);   // effect runs; doubled is now 2
```

### §19.2 Components and `ComponentRegistry`

Components are functions returning `View`. `signal` must be imported from the `ui` module; the `components` fence descriptor requires a `ComponentRegistry` value to be in scope:

```loup
@mode(host.scripted)

from ui import (signal, ComponentRegistry);
import ui.primitives;   // Row, Column, Text, Button, Image, Slot

// Module-level registry registers built-in primitives:
let registry = ComponentRegistry.of(ui.primitives.components);

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

**`registry` scoping.** The identifier after `components=` in the fence descriptor must be a `ComponentRegistry` value in the enclosing lexical scope at the point the fence expression is evaluated. Referencing an undefined name is a compile-time error. The registry can be a module-level binding, a function parameter, or a local variable — but must be defined before use.

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

- Uppercase-initial tags are looked up in the registry by exact string match. Not found → `E_COMPONENT_NOT_FOUND`.
- Hyphenated tags are first looked up in the `ComponentRegistry`. If the matched entry is a `@webcomponent` class (§19.10), the tag is treated as a web component invocation: attribute values are mapped to the component's `@attribute` fields, and the element is emitted as a custom element tag in HTML output. If no registry match is found: in `html` fences the tag is emitted as literal HTML; in `ui` fences it is a compile-time error.
- Plain lowercase (non-hyphenated) tags in `html` fences are emitted as literal HTML. In `ui` fences they are a compile-time error (`E_UI_LOWERCASE_TAG`; all primitives use PascalCase).
- `html` and `ui` fences without `components` treat all uppercase tags and unrecognised hyphenated tags as `E_COMPONENT_NOT_FOUND`.

| Code | Mode | Condition |
|---|---|---|
| `E_COMPONENT_NOT_FOUND` | All | PascalCase or hyphenated tag in a template fence has no matching entry in the `ComponentRegistry` |
| `E_COMPONENT_NOT_VIEW` | All | Registry entry for a tag name is not a function returning `View` or `Task[View]` |
| `E_UI_LOWERCASE_TAG` | All | Lowercase non-hyphenated tag in a `ui` fence (all `ui` primitives are PascalCase) |

**Component rules:**

- Components are not classes; no lifecycle methods. Setup code runs once at instantiation.
- Signal reads inside fences establish reactive dependencies.
- Async components (`async func` returning `Task[View]`) are supported.
- When a registered value in a `ComponentRegistry` is not a function returning `View` or `Task[View]` (`E_COMPONENT_NOT_VIEW`), and is not a `@webcomponent` class, the compiler emits a compile-time error.

**Event handler compilation in `html` fences.** Event handler attributes (`onclick`, `oninput`, `onchange`, `onsubmit`, `onkeydown`, `onfocus`, `onblur`, and all other `on*` attributes) in `html` fences accept Loup callable values typed as `fn(): void` or `fn(Event): void`. They do **not** produce inline JavaScript handler strings.

The compiler transforms event handler attribute bindings:

```
// Source written by the developer:
<button onclick={$ func() { count.set(count.get() + 1); } $}>+</button>

// Compiled output (what reaches the DOM):
<button data-loup-ev="click:__ev_7f3a2b">+</button>
```

The compiler assigns a stable, deterministic event slot ID (content-addressed from the closure's source location and module path) and registers the handler in the Wasm module's event table. After the Wasm module loads, the Loup runtime wires all `data-loup-ev` elements via `addEventListener` — no inline JavaScript is emitted. See §28.6 for the bootstrap sequence.

Passing a literal JavaScript string as an event handler value is a **compile-time error** (`E_INLINE_JS_EVENT_HANDLER`):

```
// COMPILE-TIME ERROR: inline JavaScript string not permitted
<button onclick="count++">bad</button>

// Correct: Loup callable
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

`MountTarget` is a built-in opaque type representing a platform-specific rendering root. Values are obtained via:

- `"#selector"` string literal (browser DOM selector — accepted by implicit coercion)
- `Element` value (browser DOM node)
- `Window` value (desktop window)
- `runtime.ui.rootMount()` — returns the platform-appropriate default target

```
// MountTarget is an opaque built-in; values are constructed implicitly from
// selector strings, Element values, or Window values, or via runtime.ui.rootMount().
opaque class MountTarget : Any {}
```

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

The rendering contract guarantees that `Row`, `Column`, `Stack`, `Text`, `Button`, `Image`, and `Slot` produce visually equivalent results across backends. `Slot` is valid only inside the `render()` method of a `@webcomponent` class (§19.10); it maps to the browser's `<slot>` element on `browser` target and is a compile-time error on all other targets (`E_SLOT_NOT_WEBCOMPONENT`). Platform-specific visual details (native scrollbar chrome, button appearance, font rendering) are left to the backend.

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
                   options: RenderToStringOptions = RenderToStringOptions()): SafeHtml;
```

`renderToString` renders a component tree to static HTML on `service` targets. The return type is `SafeHtml` (§16.6.7) — the output has passed through the full context-aware escaping pipeline and may be embedded in another HTML context without further escaping or double-encoding.

**`hydrate`:**

```
func hydrate(component: View, selector: string): MountHandle;
```

Attaches event handlers and reactive state to server-rendered HTML on `browser` targets. Hydration reuses existing DOM nodes rather than re-creating them. If server-rendered HTML doesn't match the client component tree, the runtime emits a hydration mismatch warning and falls back to full client-side rendering.

**State serialization format:**

The server serializes component state (signal initial values) as a JSON object embedded in the HTML output. The serializer applies Unicode escape encoding to `<` and `>` throughout the JSON output, guaranteeing that the literal byte sequence `</` can never appear in the state block:

```html
<script id="__loup_state__" type="application/json">
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

**Normative rule.** The runtime SHALL escape all occurrences of `<` as `\u003C` and `>` as `\u003E` in the JSON-serialized state block. The serialized string SHALL NOT contain the literal byte sequence `</` in any case variant — neither the raw two-byte sequence `0x3C 0x2F` nor any Unicode-escape variant (`\u003C/`, `\u003c/`) — guaranteeing the state block cannot prematurely terminate its enclosing `<script>` element.

`renderToString` accepts options for enhanced integrity. When `stateIntegrity = true`, the state script tag includes a `data-integrity` attribute containing the SHA-256 hash of the serialized content (hex-encoded). The `hydrate` function verifies this hash before reading state.

The `hydrate` function reads this state to initialize signals with server-computed values, ensuring the client component tree matches the server-rendered HTML.

**Minimum required Content Security Policy.** A Loup browser application compiled with `loup build --target browser` requires the following minimum CSP — no `'unsafe-inline'` or `'unsafe-eval'` is needed:

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'wasm-unsafe-eval';
  connect-src 'self';
```

`'wasm-unsafe-eval'` permits Wasm module evaluation, which is required by all Wasm-based applications and is a narrower permission than `'unsafe-eval'` (which also permits `eval()` and `new Function()`). The absence of `'unsafe-inline'` is ensured by the `data-loup-ev` event handler compilation model (§19.2).

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

| Code | Mode | Condition |
|---|---|---|
| `E_INLINE_JS_EVENT_HANDLER` | web.scripted, web.compiled | Event handler attribute value is a literal JavaScript string (e.g. `onclick="count++"`) rather than a Loup closure |

### §19.9 Cross-Platform Example

```
// app.loup — shared, uses only ui and ui fence
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


### §19.10 Web Components

*(This section is normative. Available on `browser` target only.)*

Loup provides first-class support for the W3C Custom Elements v1 standard via the `@webcomponent` annotation and the `WebComponentLifecycle` interface (§11.2). A `@webcomponent` class compiles to a `customElements.define()` registration in the browser bootstrap (§28.6).

#### §19.10.1 Declaring a Web Component

```loup
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

  func attributeChanged(name: string, oldValue: string?, newValue: string?): void {
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

#### §19.10.2 `@webcomponent` Rules

- The annotation argument must be a compile-time string literal that is a valid Custom Elements tag name: it must contain at least one hyphen and consist only of ASCII lowercase letters, digits, hyphens, periods, and underscores. The compiler SHALL reject invalid tag names.
- The class must declare a `func render(): View` method. The absence of `render()` is a compile-time error.
- The `@webcomponent` annotation is only valid on `browser` target. Using it on other targets is a compile-time error.
- Duplicate tag name registrations within a compilation unit are a compile-time error.
- `@webcomponent` is only valid in `@mode(web.scripted)` and `@mode(web.compiled)` files (per §2.6). A `@webcomponent` class in `@mode(host.scripted)`, `@mode(host.dual)`, `@mode(host.native)`, or `@mode(freestanding)` files is a compile-time error (`E_WEBCOMPONENT_NOT_WEB`).

**`@webcomponent` error codes:**

| Code | Condition |
|---|---|
| `E_WEBCOMPONENT_NOT_WEB` | `@webcomponent` class declared outside `@mode(web.scripted)` or `@mode(web.compiled)` |

#### §19.10.3 `@attribute` Rules

| Code | Mode | Condition |
|---|---|---|
| `E_ATTRIBUTE_NO_BACKING_FIELD` | web.scripted, web.compiled | `@attribute` on a `get`-only property with no backing stored field |
| `E_ATTRIBUTE_NOT_WEBCOMPONENT` | web.scripted, web.compiled | `@attribute` used on a class that is not annotated `@webcomponent` |



`@attribute` marks a class member as an observed HTML attribute. It is valid on:

- **`var` fields:** The field type must be `string`, `int`, `float`, or `bool`. The compiler generates the coercion from the HTML attribute string to the declared type. For `int` and `float`, a malformed attribute string leaves the field at its default value and emits a runtime warning. For `bool`, presence of the attribute (any value) sets `true`; absence sets `false`.
- **Property `get`/`set` pairs:** The `set` parameter type determines the coercion rule (same rules as for fields). A `get`-only property (no `set`) declares a reflected read-only attribute; the value is readable from the DOM but setting it via HTML markup has no effect and emits a runtime warning.
- `@attribute` on a `get`-only property without a backing stored field is a compile-time error (`E_ATTRIBUTE_NO_BACKING_FIELD`) — the runtime requires a stable stored value to service `getAttribute` calls.

The compiler generates:
1. A static `observedAttributes` array from the names of all `@attribute` members. The attribute name is derived from the member name: camelCase names are lowercased verbatim (no kebab-case conversion). If a different attribute name is required, pass it explicitly: `@attribute("my-label") var myLabel: string = ""`.
2. An `attributeChangedCallback` dispatcher that updates the corresponding field or calls the `set` accessor, then calls `attributeChanged(name, oldValue, newValue)` on the class.

#### §19.10.4 Shadow DOM and Slots

Every `@webcomponent` class renders into an open shadow root created automatically by the runtime. The shadow root is accessible via `this.shadowRoot: ShadowRoot` (see §21.22).

`<Slot>` (in `ui` fences) or `<slot>` (in `html` fences) maps to the browser's native `<slot>` element. Named slots use `<Slot name="footer" />` or `<slot name="footer"></slot>`. Slot elements are only valid inside the `render()` method of a `@webcomponent` class; their use elsewhere is a compile-time error (`E_SLOT_NOT_WEBCOMPONENT`).

| Code | Mode | Condition |
|---|---|---|
| `E_SLOT_NOT_WEBCOMPONENT` | All | `<Slot>` or `<slot>` used outside the `render()` method of a `@webcomponent` class |

#### §19.10.5 CSS Inside Web Components

`css` fences used inside `render()` are attached to the shadow root via Constructable Stylesheets rather than the document `<head>`. Hash-scoped class name mangling is suppressed (see §16.7.1). The shadow boundary provides native encapsulation.

```loup
func render(): View {
  let styles = ```(css)
    .button { background: navy; color: white; padding: 8px 16px; }
  ```;  // attached to shadow root, not document head

  return ```(ui)
    <Button class={styles.button} onclick={$ handleClick $}>
      <Text>Go</Text>
    </Button>
  ```;
}
```

#### §19.10.6 Using Web Components in Fences

Registered web components may be used inside `html` and `ui` fences via a `ComponentRegistry`:

```loup
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

Attribute values in web component tags follow the same escaping rules as regular HTML attributes (§16.6.3). Non-`@attribute` properties are a compile-time error (`E_ATTRIBUTE_NOT_WEBCOMPONENT`) in this context.

#### §19.10.7 Bootstrap Registration

The Loup runtime registers all `@webcomponent` classes via `customElements.define()` during bootstrap step 6 (§28.6), before `mount()` is called. Registration order follows source declaration order within each module and dependency order across modules.

## §20 Runtime Root and Capabilities

*(This section is normative.)*

### §20.1 `runtime` Object

A root-level identifier `runtime` is available in scope in all non-freestanding modes: `@mode(web.scripted)`, `@mode(web.compiled)`, `@mode(host.scripted)`, `@mode(host.dual)`, and `@mode(host.native)`. In `@mode(freestanding)`, the Loup runtime is not linked and `runtime` is **not available** — using it is a compile-time error (`E_FREESTANDING_RUNTIME`). Bare-metal entry points interact with hardware directly using `@entry`, `asm { }`, and the `native.mem` / `native.atomic` modules (§24).

```
interface Runtime {
  func args(): list[string];
  func env(name: string): Option[string];
  func capabilities(): list[string];
  func has(name: string): bool;
  func compile(source: string): Module;
  func compile(source: string, options: CompileOptions): Module;

  // Configure the runtime executor, blocking pool, and task queue.
  // Must be called before any await expression evaluates; throws RuntimeConfigError
  // if called after the event loop starts. See §17.9.1 for RuntimeConfig fields.
  func configure(config: RuntimeConfig): void;

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
```

`Module` is the built-in type for compiled modules (full declaration in §2.3): it carries `__name__`, `__file__`, `__execmode__` introspection properties and the reflection methods `exports()`, `get(name)`, `has(name)`, and `call(name, args)`.

**`runtime.configure` — task queue depth (normative).** The `runtime.configure` call (§17.9.1) accepts a `RuntimeConfig` value. The `maxTaskQueueDepth: int` field caps the pending spawn queue: when the queue already contains `maxTaskQueueDepth` entries, further `spawn` operations throw `TaskQueueFullError` (§26.1). The default value `0` means unlimited. Set a positive value to bound memory usage under heavy task production; the runtime's release notes MUST document the platform-specific default behaviour.

```loup
runtime.configure(RuntimeConfig(maxTaskQueueDepth: 10_000))
```

Capability sub-namespaces are properties on `runtime`: `runtime.fs.open(path)`, not `runtime.fs().open(path)`.

If a capability is not available on the current platform target, calling any method on the capability object throws `CapabilityError`.

**`runtime.compile(source)` — Dynamic module compilation:**

`runtime.compile(source)` compiles a Loup source string through the standard pipeline (parse → HIR → resolve → typecheck → MIR) and returns a `Module` value representing the compiled module. The module's top-level statements are NOT executed — only declarations are collected. To invoke an exported function, use `Module.call(name, args)` or `Module.get(name)`.

```
let mod = runtime.compile("""
  pub func greet(name: string): string {
    return i"Hello, {$ name $}!";
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

`runtime.compile` requires the `eval` capability. It is available on `cli`, `service`, `desktop`, and `native` targets. On `browser` targets, it throws `CapabilityError`. In `@mode(web.compiled)`, it is a compile-time error — compiled Wasm modules cannot JIT-compile new modules at runtime. In `@mode(freestanding)`, the entire `runtime` object is unavailable (`E_FREESTANDING_RUNTIME`).

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
| `print(value)` | Write `value` rendered as a string to stdout, followed by a newline. Accepts any `Renderable` value or primitive. `runtime.proc.stdout.writeLine(value.render(...))` |
| `printErr(value)` | Same as `print` but writes to stderr |
| `readLine()` | Read one line from stdin (blocking); returns `string?` — `None` at EOF. `runtime.proc.stdin.readLine()` |
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
let cfg = readText("loup.json");
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
  pub let kind: TraceEventKind;
  pub let portal: Option[string];
  pub let callable: Option[string];
  pub let file: string;
  pub let line: int;
}

interface TraceHook {
  func onEvent(ev: TraceEvent): void;
}

class PortalActivation {
  pub let name: string;
  pub let condition: Option[string];
  pub let once: bool;
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
- Condition expressions are Loup expressions parsed and evaluated in the lexical environment of the target portal.
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
  pub let file: string;
  pub let line: int;           // -1 if source map unavailable
  pub let column: int;         // -1 if source map unavailable
  pub let callable: string;    // always present from static metadata or core.reflect
  pub let execMode: string;    // one of the six __execmode__ strings (§2.2): "web.scripted", "web.compiled", "host.scripted", "host.dual", "host.native", "freestanding"
  pub let traceLevel: TraceLevel;
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

The runtime uses the metadata table to populate `TraceEvent.callable` for compiled frames using the same string representation as `core.reflect.callableName` (§21.11). Portal names are therefore consistent whether accessed from scripted or native contexts.

**Boundary crossing semantics.** When execution crosses from scripted (GC) code into a native (ARC) function call:

1. A `Call` trace event fires. `callable` is populated from the compiled module's metadata table.
2. The frame's `execMode` is set to the AOT mode string (`"host.native"`, `"web.compiled"`, or the AOT side of `"host.dual"`).
3. `traceLevel` is set based on the compiled module's build mode: `Full` if built with `--debug`; `PortalOnly` if built in release mode with explicit portal blocks; `Opaque` if built in release mode with no portal blocks.
4. Trace events continue appending to the shared ring buffer.

When returning from compiled to interpreted code, a `Return` event fires (callable from metadata table), and subsequent events resume at `traceLevel=Full` in the interpreted context.

**Opaque frames.** When an interpreted caller calls an opaque compiled function, the ring buffer receives a synthetic boundary `Call` event followed by a synthetic `Return` event after completion. The interior is invisible to the time-travel recorder — equivalent to stepping over a native C library in a conventional debugger.

**Reflection integration.** `TraceEvent.callable` is populated via `core.reflect.callableName` (§21.11), which is available in all modes including `@mode(web.compiled)`. This eliminates the dependency on `core.inspect` for trace event population.



---

## §21 Standard Library

*(Full specification in the [Loup Standard Library Reference](loup-stdlib-reference-v1_18.md).)*

The standard library provides `core.*`, `io.*`, `net.*`, `data.*`, `web.*`, `sync.*`, `lang.*`, `debug.*`, `structures.*`, and `ui.*` modules available on all targets without a separate `loup install` step. GPU/accelerator packages (`loup.tensor`, `native.gpu`, `native.hal`, etc.) are documented in the [Loup Packages Reference](loup-packages-reference-v1_11.md).

Numbered subsections §21.1–§21.27 are defined in the stdlib reference document. Cross-references in this specification of the form §21.N refer to those sections.

---

## §22 Web Compiled Mode

*(This section is normative for `@mode(web.compiled)` — it is the detailed specification; §2.4.2 is the summary.)*

Web compiled mode enables ahead-of-time (AOT) compilation of Loup source files to WebAssembly with GC and Exception Handling proposals (Wasm GC+EH), the same bytecode target used by the JIT pipeline (§2.1). The Wasm GC+EH type mappings and exception tag mappings defined in §2.1 apply equally to AOT-compiled Wasm modules; AOT compilation produces optimized Wasm modules where debug metadata is stripped unless `--debug` is specified (see §28.1). Native binary targets (executables, shared libraries, freestanding images) are specified separately in §23 under `@mode(host.native)` and `@mode(freestanding)`; they are distinct modes with distinct restrictions and do not share this section's rules.

### §22.1 Compiled Mode Declaration

The `@mode(web.compiled)` directive marks a file for ahead-of-time compilation with restricted semantics:

```
@mode(web.compiled)

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

- `@mode(web.compiled)` must appear as the first non-comment, non-blank line in the file.
- `@mode(web.compiled)` is a file-level directive, not a function or block annotation.
- A file is either entirely compiled or entirely scripted.



### §22.2 Restrictions

`Any`, `dynamic class`, and `core.inspect` are available in `@mode(web.compiled)` but emit the `W_ANY_IN_AOT_MODE` advisory because the AOT compiler must emit tagged-dispatch code with runtime cost (§2.4.2). They are not prohibited — projects that prefer to enforce static typing can promote the warning with `--warnings-as-errors=W_ANY_IN_AOT_MODE`.

The following constructs are prohibited in `@mode(web.compiled)` files (consult §2.6 for the authoritative per-mode feature matrix):

| Prohibited Construct | Reason |
|---|---|
| Top-level control flow (`if`, `while`, `for`, `match`, expression statements) (`E_TOPLEVEL_CONTROL_AOT`) | No sequential top-level execution |
| Non-constant top-level initializers | All top-level data must be statically determinable |
| Bare `unowned` on a class field (without `[~name]` annotation) | Compile-time error `E_UNOWNED_NO_LIFETIME` — all `unowned` class fields must use `unowned[~name]` (§23.4.3) |
| `arc let` / `arc var` | Requires an ARC runtime — not present under Wasm GC (`E_ARC_LET_NOT_NATIVE`) |
| `[weak ...]` capture lists / `weak` references | Requires ARC zeroing side table — not available under Wasm GC |
| `consume` expression | Requires an ARC runtime to downgrade into (`E_CONSUME_NOT_AVAILABLE`) |
| `Thread.spawn`, `ThreadPool`, `Mutex`, `RwLock`, `Atomic` | OS threads unavailable on Wasm targets |
| Non-`Sendable` captures in `Thread.spawn` closures | Data race prevention (§17.8) |
| Non-`Sendable` captures in async task closures with `MultiThreaded` executor | Data race prevention (§17.9.4) |
| `runtime.configure` called after first `await` | `RuntimeConfigError` — executor is already started |
| `ThreadLocal[T]` | OS threads unavailable under Wasm — compile-time error |
| Explicit augmented assignment `operator func` on structs | Value-type semantics incompatible with in-place mutation |

The ownership keywords `borrow`, `borrow[~name]`, `excl borrow`, `lifetime ~name`, `unique`, `noescape fn`, and `unowned[~name]` ARE available in `@mode(web.compiled)` — see §2.6 and §23.4. They lower to Wasm GC operations rather than ARC retain/release.

**Additionally permitted in `@mode(web.compiled)`:**

- `core.reflect` — structural introspection from static metadata (§21.11).
- `portal` blocks — registered with shared activation registry at module load.
- `box` keyword expression — explicit widening to `Any` (permitted with the `W_ANY_IN_AOT_MODE` advisory; not available in `@mode(freestanding)`, where `Any` is prohibited).
- `as` and `as?` cast operators — narrowing from `Any`. Uses on `Any` produce the `W_ANY_IN_AOT_MODE` advisory.

The `if (__name__ == "__main__")` guard pattern is prohibited in `@mode(web.compiled)` files — not because `__name__` is unavailable, but because top-level branching is prohibited (see above). `__name__` and `__file__` remain available as compile-time string constants for use inside function bodies (e.g., logging, error messages).

| Code | Condition |
|---|---|
| `E_TOPLEVEL_CONTROL_AOT` | `if`, `while`, `for`, `match`, or expression statement at file top level in `@mode(web.compiled)` (see §2.4.2 for the unified code covering all AOT modes) |
| `E_BOX_IN_FREESTANDING` | `box expr` used in `@mode(freestanding)` where `Any` is prohibited |

Only declarations are permitted at file top level in `@mode(web.compiled)` files: `class`, `enum`, `struct`, `interface`, `func`, `let`, `var`, `type`, and `import`.

**Permitted in `@mode(web.compiled)`:**

- Ownership transfer verbs: `reads`, `edits`, `takes`, `shares` — call-site ownership contracts available in all modes (§23.4.9)
- `modifier` method keyword, `safe {}` blocks, `safe func` — mutation contracts and safe contexts available in all modes (§23.4.11–§23.4.12)
- `synchronized` class — runtime-locked mutation (§23.4.13)
- `requires` clauses with `distinct()` — parameter contracts available in all modes (§23.4.10)
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
- `Option[Any]` at error boundaries (`Scoped[T].scope_exit`, exception `cause`)

The compiler SHALL emit a compile-time error for any prohibited construct in a `@mode(web.compiled)` file.

**Import rules.** `@mode(web.compiled)` files may import other `@mode(web.compiled)` files. Importing a scripted-mode file from a `@mode(web.compiled)` file is a compile-time error. Conversely, scripted-mode files may import `@mode(web.compiled)` files — the JIT runtime loads the compiled module's exports as pre-compiled native or Wasm code. `@mode(freestanding)` modules may not be imported by any other mode — see §24.2 for complete cross-mode import rules.

The restriction is subtractive, not a different language: `@mode(web.compiled)` files use the same Loup syntax, type system, and semantics as scripted files for all permitted features.

**v1.16 features available in `@mode(web.compiled)`:** `atomic {}` blocks (§17.7), `reinterpretChecked[T, U]` (§24.18). The `atomic {}` block is permitted because `@mode(web.compiled)` targets the same Wasm cooperative-scheduler environment as scripted Wasm modes.

### §22.3 Execution Semantics

`@mode(web.compiled)` files have different execution semantics from scripted modes:

- **No sequential top-level execution.** Top-level code in `@mode(web.compiled)` files consists only of declarations (types, functions, constants). There is no statement-by-statement execution. Only function bodies execute at call time.
- **Static data.** All top-level `let`/`var` bindings must have compile-time-constant initializers (literals, const arithmetic, enum variant constructors). These are compiled as static data, initialized before `main` or module load.
- **Compile-time type resolution.** All type declarations in `@mode(web.compiled)` files are resolved entirely at compile time. There is no runtime type registry for compiled types. `core.reflect.typeOf` on a `@mode(web.compiled)` type returns a `Type` value with static metadata baked in at compile time.
- **Module introspection dunders.** `__name__` is set to the module's fully-qualified dotted name and `__file__` is set to the source file path, both as compile-time string constants baked into the binary. `__name__` is never `"__main__"` in `web.compiled`. `__execmode__` is `"web.compiled"`.

**Exports.** Compiled modules may export functions, classes, enums, interfaces, structs, and constants. The export mechanism uses the same `pub` visibility rules as scripted mode.

**Wasm call-stack exhaustion.** The Wasm call-stack exhaustion contract from §2.1 applies identically to compiled mode. `StackOverflowError` (§26.1) is thrown at the deepest active compiled call frame and propagates through any `try/catch` blocks in the compiled module normally.

**Interop boundary.** Compiled modules can be imported by scripted modules and vice versa (subject to the import rules in §22.2). At the boundary:

- **Scripted importing compiled:** The compiled module's exports appear as pre-resolved bindings — the JIT runtime does not step through the compiled module's declarations. Arguments are type-checked at the call site; compiled code receives statically-typed values.
- **Scripted passing `Any` to compiled:** When a scripted-mode caller passes an `Any`-typed value to a compiled function that expects a concrete type, the runtime performs an unboxing check at the call boundary and throws `TypeError` on mismatch.
- **Compiled calling scripted:** The compiled module declares the expected types; the runtime verifies at the boundary.

---

## §23 Native Compilation

*(This section is normative.)*

Loup supports compilation to native binaries via LLVM or Cranelift backends as an alternative to the primary Wasm GC+EH target. Native compilation produces platform-specific binaries with ARC memory management, zero-overhead C FFI, and deployment without a Wasm runtime.

```
loup build --target native
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
loup build --target native --arch aarch64 --os linux     # ARM64 Linux
loup build --target native --arch arm64 --os macos       # Apple Silicon
loup build --target native --arch x86_64 --os windows    # Windows from Linux/macOS
```

Cross-compilation requires a cross-linker and target sysroot. The toolchain searches `PATH` for `<arch>-<os>-lld` or accepts `--linker` override.

**Output types:**

```
loup build --target native                  # executable (default)
loup build --target native --lib shared     # shared library (.so/.dylib/.dll)
loup build --target native --lib static     # static library (.a/.lib)
```

### §23.2 Compiler Backends

The native compilation pipeline:

1. Parse and type-check all `@mode(host.native)` source files (and, for AOT builds of dual-deliverable modules, `@mode(host.dual)`).
2. Lower to MIR (mid-level intermediate representation).
3. Emit LLVM IR or Cranelift IR (selected by `--backend llvm|cranelift`; default: `llvm`).
4. Optimise (LLVM: `O0`–`O3` via `--opt`; Cranelift: speed-focused).
5. Link with the Loup native runtime library and any `extern native` libraries.
6. Produce the final binary.

**LLVM backend:** Provides the full LLVM optimisation pipeline including LTO, vectorisation, and profile-guided optimisation. Recommended for production builds.

**Cranelift backend:** Provides fast compilation with moderate optimisation. Recommended for development and CI. Does not support LTO.

### §23.3 Linker

**Reference linker:** `lld` (LLVM linker). `lld` ships with LLVM, supports all three output platforms from a single binary, and enables LTO across Loup and C/C++ translation units.

The toolchain searches for `lld` in the following order:
1. The path specified by `--linker <path>`.
2. `loup-lld` in the toolchain's `bin/` directory (bundled).
3. `lld` on `PATH`.
4. Platform fallback: `ld.lld` (Linux), `ld64.lld` (macOS), `lld-link` (Windows).

**Platform toolchain overrides.** For Apple platforms, the Apple `ld` linker is available for code signing and entitlements:

```
loup build --target native --os macos --linker ld
```

**Linker flags passthrough:**

```
loup build --target native -- -Wl,--version-script=exports.map
```

Arguments after `--` are passed verbatim to the linker.

**Link-time optimisation (LTO):**

```
loup build --target native --lto thin     # ThinLTO (recommended)
loup build --target native --lto full     # Full LTO (slower, better)
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

**Value types.** Structs, enums, tuples, and primitives are not reference counted. They are copied by value. Structs may contain `unique`-qualified class fields (§23.4.7); such structs are move-only (§10.3.2) — assignment transfers ownership rather than copying, and no ARC retain/release is inserted.

**Deterministic finalization.** `finalize()` is called when the last strong reference drops. `del handle;` releases the strong reference immediately. `with`/`Scoped[T]` releases at block exit. Both remain the preferred idioms for resource management; under ARC they provide early release rather than a safety net.

**`weak` reference runtime semantics (native ARC).** A `weak var` field does not increment `strong_count`. The ARC runtime maintains a side table of weak references to each object. When `strong_count` reaches zero, the runtime atomically zeroes all weak references to the object. Subsequent reads of a `weak` field load through the side table and return `None` if the entry is null. The side-table lookup is a single atomic load.

**`unowned` reference runtime semantics (native ARC).** An `unowned` field does not increment `strong_count` and is not tracked in the side table. Accessing an `unowned` field after the referent has been freed unconditionally traps with a `LifetimeError` in **all** build configurations, including release builds (`--release`). The trap is a single null-pointer check inserted by the compiler at each dereference site; its cost is comparable to a bounds check and is typically eliminated by the optimiser when the compiler can statically prove liveness.

Use `unowned[~name]` (§23.4.3) for class fields whose lifetime relationship can be proven from scope nesting. Use `weak` when in doubt — it is always safe.

### §23.4.1 ARC Elision via `borrow` and `noescape fn`

*(This section is normative. Applies to `@mode(host.native)`. In `@mode(freestanding)`, `borrow` and `noescape fn` serve their memory-safety and stack-allocation roles without ARC retain/release elision, since no ARC runtime is present. See §24.4 for freestanding availability.)*

Two constructs guide the compiler to elide ARC operations on specific hot paths:

**`borrow` parameters.** The compiler omits `retain()` on function entry and `release()` on function exit for `borrow` parameters. The ABI passes the value as a raw pointer with no reference count modification. The compiler verifies via escape analysis that the value does not outlive the call frame — any violation is a compile-time error before the elision is applied.

**`noescape fn` closure parameters.** The compiler may pass a `noescape fn` closure as a raw function pointer and captured-environment pointer pair, without ARC-retaining the closure object. For closures whose captures are all stack-resident values (no heap-allocated `var` bindings, no class instances captured by reference), the compiler may represent the entire closure on the stack with zero heap allocation.

The combined pattern produces zero ARC activity on hot iteration paths. For lifetime tracking of `borrow[~name]` references that flow beyond the call frame, see §23.4.2.
### §23.4.1.1 `excl borrow` on Structs

*(This section is normative. Applies to all six modes; see §2.6.)*

`excl borrow` is an exclusive borrow modifier for struct-typed parameters. It extends `borrow` with a compile-time exclusivity guarantee: the compiler verifies that no other `borrow` or `excl borrow` of the same binding is active simultaneously at the call site.

**Syntax.**

```loup
func fill(excl borrow buf: Buffer): void {
  buf.data = bytes.alloc(1024);
  buf.pos = 0;
}
```

`excl borrow` appears immediately before the parameter name, after the optional `borrow` keyword position. The two-token sequence `excl borrow` is the full modifier; `excl` alone is not a keyword.

**Why the exclusivity guarantee is deep.** Because §10.3.1 prohibits class-typed fields in structs, every field of a struct is a value type — a pure, independent copy. There is no aliased heap state reachable through a struct's fields. An exclusive borrow of a struct is therefore a genuinely complete exclusivity guarantee with no caveats, unlike a hypothetical exclusive borrow of a class instance which could have hidden ARC aliases.

**Compiler verification.** At each call site, the compiler verifies that the argument binding has no simultaneous active `borrow` or `excl borrow`. If the same binding is borrowed — either shared or exclusively — at the point of a `excl borrow` call, `E_EXCL_BORROW_ALIAS` is emitted.

```loup
@mode(host.native)

struct Cursor {
  var pos: int;
  var source: string;
}

func advance(excl borrow cursor: Cursor): void {
  cursor.pos += 1;
}

func peek(borrow cursor: Cursor): string {
  return cursor.source[cursor.pos : cursor.pos + 1];
}

func process(): void {
  var c = Cursor(pos=0, source="hello");

  advance(excl borrow c);         // OK — no other borrow active
  peek(borrow c);                // OK — advance has returned

  // COMPILE ERROR: simultaneous borrows
  let p = peek(borrow c);
  advance(excl borrow c);         // E_EXCL_BORROW_ALIAS: c is already borrowed by peek
}
```

**What is permitted inside a `excl borrow` body.** The parameter may be read, have its fields mutated, be passed to `borrow` or `excl borrow` parameters, and be used as a `borrow[~name]` source. It may not be returned as an owned value and may not be stored in a class field.

**`excl borrow` and ARC elision.** `excl borrow` inherits all ARC elision properties of `borrow`: no `retain()` on entry, no `release()` on exit. The exclusivity guarantee is a static analysis property only; it has zero runtime cost.

**Restrictions.**

- `excl borrow` is valid on struct-typed parameters and on `unique`-typed parameters. For `unique` values, exclusivity is trivially guaranteed — the compiler has already proven single ownership, so no simultaneous borrow alias check is required. Using `excl borrow` on a plain ARC class type, primitive, enum, or `Any` is `E_EXCL_BORROW_NOT_STRUCT`.
- `excl borrow` is prohibited in `async func` signatures — async functions may suspend after the caller's frame has advanced (`E_EXCL_BORROW_ASYNC`).
- `excl borrow` bindings may not be captured by `Thread.spawn`, `Thread.spawnWith`, or `ThreadPool.run` closures (`E_EXCL_BORROW_THREAD_CAPTURE`).
- `excl borrow` is available in all six modes (see §2.6). The exclusivity guarantee is enforced as a compile-time static-analysis property and does not depend on the runtime memory model.

**Error codes.**

| Code | Meaning |
|---|---|
| `E_EXCL_BORROW_ALIAS` | A `excl borrow` argument binding has a simultaneous active `borrow` or `excl borrow` at the call site |
| `E_EXCL_BORROW_NOT_STRUCT` | `excl borrow` applied to a plain ARC class type, primitive, enum, or `Any`; structs and `unique`-typed values are valid targets |
| `E_EXCL_BORROW_ASYNC` | `excl borrow` parameter declared in an `async func` signature |
| `E_EXCL_BORROW_THREAD_CAPTURE` | `excl borrow` binding captured by a thread-spawning closure |



```loup
@mode(host.native)

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

*(This section is normative. Applies to `@mode(host.native)` and `@mode(freestanding)`.)*

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
| Can a class instance be shared across threads safely? | `Sendable` + structural verification (§17.8.1) | Compile time |
| Is a class instance exclusively owned with no ARC overhead? | `unique` qualifier (§23.4.7) | Compile time |

These three mechanisms are independent. A function may use all three simultaneously: an ARC-managed class parameter, a `borrow` parameter (ARC elided), and a `borrow[~src]` parameter (ARC elided, lifetime tracked) without any interaction between the systems.


### §23.4.3 Lifetime-Verified `unowned[~name]` Fields

*(This section is normative. Applies to `@mode(host.native)` and `@mode(freestanding)`.)*

`unowned[~name]` is a field qualifier that holds a non-owning, non-retaining reference whose validity is **proven at compile time** via the region system (§23.4.2). It is the only form of `unowned` permitted on class fields. Bare `unowned` on a class field (without a lifetime annotation) is a compile-time error (`E_UNOWNED_NO_LIFETIME`).

Because safety is compiler-proven, `unowned[~name]` fields do not insert any runtime null-trap. Every access is zero-cost: a raw pointer load with no check. There are no unsafe annotations, no runtime opt-outs, and no undefined behaviour paths.

#### Class declaration requirements

A class with `unowned[~name]` fields must declare `[lifetime ~name]` as a class-level lifetime parameter. This anchors the class instance's own lifetime to the `~name` region, which the compiler uses to verify that the class cannot outlive any of its `unowned[~name]` referents.

```loup
@mode(host.native)

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

```loup
@mode(host.native)

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
| `E_UNOWNED_NO_LIFETIME` | See §23.4.3 |
| `E_UNOWNED_CLASS_NO_PARAM` | See §23.4.3 |
| `E_UNOWNED_LIFETIME_MISMATCH` | See §23.4.3 |

#### Relationship to `weak`

`weak` fields are always safe on all targets and require no lifetime parameters — they zero automatically through the ARC side table. Use `unowned[~name]` only when the lifetime relationship is strictly hierarchical and provable from scope nesting, and when avoiding the side-table lookup is measurable and important. When in doubt, use `weak`.

---

### §23.4.4 Inferred Struct Lifetimes

*(This section is normative. Applies to `@mode(host.native)` and `@mode(freestanding)`.)*

When a struct's fields are all declared with `borrow` or `borrow[~name]` qualifiers, the compiler infers an implicit single lifetime for the struct without requiring explicit `[lifetime ~name]` parameter declarations. This covers the common "temporary view" pattern — a struct that borrows into a larger buffer for the duration of a local computation — without any user-visible lifetime annotation burden.

**Inference rule.** If every field of a struct (that is not a primitive, enum, or by-value struct) carries a `borrow` qualifier, the compiler:

1. Creates an implicit region `~self` anchored to the struct value's own declaration scope.
2. Treats all `borrow` fields as `borrow[~self]` for the purposes of escape analysis.
3. Verifies that the struct value does not outlive any of its borrowed fields' source scopes.
4. Emits `E_INFERRED_LIFETIME_ESCAPE` if the struct value would outlive a borrowed field.

The inferred lifetime is transparent to the programmer: no `[lifetime ~self]` appears in source code, no annotation is required at the constructor call site, and the compiled binary carries no lifetime metadata.

```loup
@mode(host.native)

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

### §23.4.5 Buffer Disjointness Contracts

*(This section is normative. Applies to all execution modes.)*

Buffer disjointness contracts are expressed using `distinct()` in a `requires` clause (§23.4.10). `distinct(a, b, ...)` asserts that the listed parameters do not point to overlapping memory regions and is statically verified by the compiler where possible, with an auditable `@unsafe` escape path for statically unknowable cases. The LLVM `noalias` ABI attribute is emitted for all `distinct()` parameters on native targets, providing the same auto-vectorisation benefit as the removed `@noalias` annotation.

See §23.4.10 for the complete specification of `distinct()` contracts.

### §23.4.6 `@unsafe` — Programmer-Asserted Safety Boundary

*(This section is normative. Applies to `@mode(host.native)` and `@mode(freestanding)` unless otherwise noted.)*

`@unsafe(reason: string)` is the single, unified annotation for all programmer-asserted safety claims in Loup. It consolidates what were previously scattered, ad-hoc annotations into one auditable surface. Every use of `@unsafe` is a greppable record of a specific safety property that the programmer asserts and the compiler cannot verify.

**The required `reason` string** documents what is being asserted. It is not optional — `@unsafe` without a reason string is a compile-time error. The reason string is preserved in the binary's debug metadata and is accessible via `core.reflect`.

**Valid targets.**

| Target | What `@unsafe` asserts |
|---|---|
| `extern native func` declaration | The function has programmer-asserted safety properties — thread safety, escaping borrow lifetime, or both |
| `class` declaration | The class's `implements Sendable` claim is valid despite having `var` fields that do not pass structural verification (§17.8.1) |
| `func` declaration | The function body calls `@unsafe`-annotated APIs; marks the function as an auditable unsafe boundary |
| `distinct()` call-site acknowledgment | The caller asserts that the listed parameters do not alias despite the compiler being unable to statically prove disjointness (§23.4.10); form: `@unsafe("distinct: reason")` in the argument list |
| `asm {}` block (native mode) | The inline assembly block is programmer-verified safe; required in `@mode(host.native)` (§24.7); form: `@unsafe("asm: reason")` preceding the `asm {}` block |

**Thread-safety assertion on `extern native`:**

```loup
@unsafe("threadSafe: sqlite3 is documented thread-safe in serialized mode")
extern native "libsqlite3" func sqlite3_exec(
  db: NativeHandle,
  sql: string,
  callback: NativeHandle,
  arg: NativeHandle,
  errmsg: NativeHandle,
): int;
```

**Escaping borrow assertion on `extern native`:**

```loup
// Declaration site — asserts the pointer may outlive the call
@unsafe("escapingBorrow: libfoo_register stores the pointer; caller must ensure buf outlives the registration")
extern native "libfoo" func libfoo_register(buf: NativeHandle): void;

// Call site — acknowledges the escape
@unsafe("escapingBorrow: buf is a module-level static; it outlives all registrations")
libfoo_register(borrow buf);
```

Both the declaration site and every call site must carry `@unsafe` when a borrow is asserted to escape the native call.

**`Sendable` opt-out for classes.** When structural `Sendable` verification (§17.8.1) cannot be satisfied — for example, when thread safety is ensured by an external protocol invisible to the compiler — annotate the class:

```loup
@unsafe("sendable: mutations are confined to the initialization phase; fully immutable after construction")
class ImmutableAfterInit : Any implements Sendable {
  var data: list[int] = [];  // written only during init, never thereafter

  pub func build(items: list[int]): void {
    data = items;   // only called before sharing
  }
}
```

**Auditing `@unsafe` usage.** All `@unsafe` annotations in a codebase can be found with a single grep:

```
grep -rn "@unsafe" src/
```

This is the primary safety audit tool. The reason strings provide context for each assertion. New `@unsafe` annotations in a code review are immediately visible.

**`@unsafe` does not suppress other errors.** `@unsafe` bypasses only the specific verification it is designed to opt out of. It does not suppress unrelated compile-time errors. A `@unsafe` class with a `borrow[~name]` field still violates `E_SENDABLE_LIFETIME`. A `@unsafe` `extern native` function still requires correct parameter types.



### §23.4.7 `unique` Ownership

*(This section is normative. Applies to `@mode(host.native)` and `@mode(freestanding)`.)*

`unique` is a compile-time ownership qualifier for class instances. A `unique`-qualified binding or field holds a class instance with **compiler-proven single ownership**: no other binding or field may alias the same instance. There is no `strong_count`, no ARC retain/release, and no side-table tracking. The entire ownership model is static — the compiler enforces exclusivity at all use sites.

**`unique` is not ARC.** ARC allows unlimited aliasing; `unique` prohibits it entirely. A `unique` value is therefore always safe to access without synchronization, always safe to pass as `edits` (exclusive borrow requires no alias scan), and always zero-overhead in terms of reference counting.

#### Syntax — standalone bindings

```loup
@mode(host.native)

unique let conn = Connection.open(addr)      // immutable unique binding
unique var buf = Buffer.alloc(1024)          // mutable unique binding
```

`unique let` — the binding is unique and the local binding itself is immutable (the object's `var` fields may still be mutated via methods or `edits` borrow).
`unique var` — the binding is unique and may be reassigned to a different `unique` instance.

#### Syntax — struct fields

```loup
@mode(host.native)

struct Request {
  var path: string;
  unique var conn: Connection;   // uniquely-owned class field
}
```

A struct with `unique` fields is move-only (§10.3.2). The `unique` qualifier on a struct field is valid in all six modes.

#### Move semantics

Assigning a `unique` binding to another binding **moves** ownership — the source is consumed and may not be used again:

```loup
unique let a = Connection.open(addr)
unique let b = a         // MOVE: b owns the Connection; a is consumed
use(a)                   // E_USE_AFTER_MOVE
```

To transfer ownership of a `unique` value into a function, declare the parameter with `takes`. A no-verb parameter is an implicit `reads` borrow and does not consume the binding:

```loup
// takes — ownership transferred; caller's binding consumed
func process(takes conn: unique Connection): void { ... }

unique let c = Connection.open(addr)
process(takes: c)        // MOVE: c consumed
use(c)                   // E_USE_AFTER_TAKE
```

```loup
// reads (implicit) — borrow only; caller retains ownership
func inspect(conn: unique Connection): void { ... }  // implicit reads

unique let c = Connection.open(addr)
inspect(c)               // borrow — c still valid
use(c)                   // OK — c not consumed
```

#### Borrowing `unique` values

`reads` and `edits` are both valid on `unique` bindings. Because single ownership is compiler-proven, exclusivity for `edits` is trivially guaranteed — no alias check is needed:

```loup
unique let conn = Connection.open(addr)

read(conn)                   // implicit reads borrow — conn not consumed
read(reads: conn)            // explicit reads — identical
write(edits: conn)           // exclusive borrow — trivially safe, conn not consumed
use(conn)                    // OK — conn still uniquely owned
```

#### `consume` — explicit downgrade to ARC

`consume expr` explicitly transfers a `unique` value into the ARC ownership model, producing a regular ARC-managed reference. The source binding is consumed. The downgrade is **one-way and irreversible** — once a value enters ARC, the compiler no longer tracks uniqueness.

```loup
unique let conn = Connection.open(addr)

// Configure conn exclusively before sharing
write(edits: conn)

// Hand off to shared ARC ownership
let shared: Connection = consume conn     // conn consumed; shared is normal ARC
let alias: Connection = shared            // ARC alias — fine, uniqueness is gone
use(conn)                                 // E_USE_AFTER_MOVE
```

`consume` is required for passing a `unique` value to a function that expects a plain ARC class reference, storing it in an ARC-managed collection, or returning it from a factory function that produces shared values.

`consume` applied to a non-`unique` binding is `E_CONSUME_NON_UNIQUE`.

#### `unique` and `Sendable`

`unique` values are not `Sendable` under the standard rule — `Sendable` is about safe sharing across threads, and `unique` values are not shared. However, a `unique` value may be **moved** into a `Thread.spawn` closure, transferring ownership to the spawned thread. This is safe because the caller loses access to the value at the move point — there is no concurrent access.

```loup
unique let conn = Connection.open(addr)

let handle = Thread.spawn(func() {
  use(consume conn)    // conn moved into thread — caller loses access
})
use(conn)              // E_USE_AFTER_MOVE — conn was moved into the closure
```

`consume` inside the closure downgrades to ARC within the thread's ownership context, which is correct since the thread may share the value within its own scope.

#### `unique` and `finalize` / `del`

`del` on a `unique` binding calls `finalize()` immediately and releases the memory — there is no ARC decrement since there is no reference count. The binding is consumed by `del`:

```loup
unique let handle = NativeResource.open("data.bin")
// ... use handle ...
del handle    // finalize() called; memory freed immediately; handle consumed
```

`with`/`Scoped[T]` works identically — the `unique` value is finalized at block exit and consumed.

#### Restrictions

- `unique` is valid in all execution modes (§2.6). In Wasm GC modes it lowers to GC references with compile-time-proven single ownership; in ARC modes it is the ARC-free single-owner form.
- `consume` (the unique-to-ARC downgrade) requires an ARC runtime and is therefore only valid in `@mode(host.native)` and `@mode(host.dual)` — see §23.4.7.
- `unique let` on a struct field is a compile-time error — struct fields must use `unique var` (`E_UNIQUE_FIELD_LET`). `unique` is not valid as a qualifier on class fields: class instances are ARC-managed (or GC-managed) and aliasable by definition, which is incompatible with the single-owner invariant. Use `unique let` or `unique var` as a local binding qualifier, or a `unique var` struct field, to hold a uniquely-owned class instance.
- A `unique` binding may not be captured by closures that escape the frame (e.g., assigned to an escaping `fn` binding or passed to `Thread.spawn` without moving via a function parameter — the closure capture must be a move, not a reference).
- `unique` on a non-class type (struct, primitive, enum) is a compile-time error — value types are already exclusively owned by nature (`E_UNIQUE_NOT_CLASS`).

#### Error codes

| Code | Meaning |
|---|---|
| `E_CONSUME_NON_UNIQUE` | `consume` applied to a non-`unique` binding |
| `E_CONSUME_NOT_AVAILABLE` | `consume` used outside `@mode(host.native)`/`@mode(host.dual)` — no ARC runtime to transfer ownership into |
| `E_UNIQUE_NOT_CLASS` | `unique` qualifier applied to a non-class type |
| `E_UNIQUE_FIELD_LET` | `unique let` used on a struct field — struct fields must use `unique var` |



### §23.4.8 `arc let`, `unique class`, and Integer Safety Error Codes

*(This section is normative. Applies to `@mode(host.native)` and `@mode(freestanding)` unless noted.)*

| Code | Mode | Condition |
|---|---|---|
| `E_ARC_LET_NOT_NATIVE` | All | `arc let` / `arc var` used outside `@mode(host.dual)` or `@mode(host.native)` |
| `E_ARC_LET_NOT_CLASS` | host.dual, host.native | `arc let` applied to a value type |
| `E_ARC_LET_ON_FIELD` | host.dual, host.native | `arc let` or `arc var` used as a class or struct field qualifier |
| `E_BORROW_ESCAPE` | host.dual, host.native, freestanding | Plain `borrow` of a local escapes function scope without lifetime annotation |
| `E_BORROW_LOOP_MUTATION` | All | Collection mutated inside a `for-in` loop that holds an implicit borrow of it |
| `E_MODE_POSITION` | All | `@mode` directive not the first active token in the file |
| `E_MODE_DUPLICATE` | All | More than one `@mode` directive in a single file |
| `E_MODE_UNKNOWN` | All | Unrecognised mode name in `@mode(...)` |
| `E_MODE_TARGET_MISMATCH` | All | File `@mode` incompatible with the `--target` build flag |
| `E_BOUNDS_LITERAL` | All | Array/list indexed with a compile-time constant that is out of range |
| `E_PREFER_COMPILED_NOT_SCRIPTED` | host.native, freestanding | `prefer compiled` import clause used in `@mode(host.native)` or `@mode(freestanding)` |

**`--require-explicit-arc`** (build flag, `@mode(host.native)` or `@mode(host.dual)`). When set, constructing a class into a plain `let` or `var` without `arc let` or `unique let` emits lint advisory `implicit-arc-binding`. Promote to an error with `// loup:error(implicit-arc-binding)`.

**`--overflow=trap`** (build flag, `@mode(host.native)` and `@mode(freestanding)`). When set, plain `+`, `-`, `*`, `/` on fixed-width integer types trap on overflow in all build configurations (debug and release), providing stronger guarantees than Rust's default (release builds silently wrap). The explicit overflow arithmetic methods (§24.19) remain available alongside this flag.



### §23.4.9 Ownership Transfer Verbs

*(This section is normative. Applies to all execution modes.)*

The ownership transfer verb system provides a unified, mode-agnostic vocabulary for expressing ownership relationships at parameter declaration sites and call sites. Verbs replace `borrow` and `excl borrow` in function signatures with English words that declare intent and require a matching acknowledgment at every call site.

**The four verbs.**

| Verb | Semantics | Replaces |
|---|---|---|
| `reads` | Shared immutable borrow — caller retains ownership. May be written explicitly or omitted (implicit default). | `borrow` |
| `edits` | Exclusive mutable borrow — no concurrent reads or writes | `excl borrow` |
| `takes` | Ownership transfer — caller's binding is consumed at the call site | by-value move |
| `shares` | ARC retain — both caller and callee hold the value after the call | by-value ARC |

**Availability.** Verbs are available in all execution modes: `@mode(host.scripted)`, `@mode(web.compiled)`, `@mode(host.native)`, and `@mode(freestanding)`. This removes the mode gate that previously restricted `borrow` and `excl borrow` to `@mode(host.native)` and `@mode(freestanding)`.

**Declaration syntax.**

```loup
func f(reads  x: T): void { ... }   // explicit reads — shared immutable borrow
func f(        x: T): void { ... }  // implicit reads — identical to the line above
func f(edits  x: T): void { ... }   // exclusive mutable borrow
func f(takes  x: T): void { ... }   // ownership transfer
func f(shares x: T): void { ... }   // ARC retain
```

**Implicit default — `reads`.** A parameter declared without a verb is implicitly `reads`. Omitting the verb on a parameter is exactly equivalent to writing `reads`. This makes the safe, common case — passing a value for reading — require no annotation:

```loup
func render(buf: Buffer): string { ... }     // implicitly reads buf
func render(reads buf: Buffer): string { ... } // explicitly reads buf — identical
```

**Call site syntax.** `reads` is the implicit default and its acknowledgment is optional. `edits`, `takes`, and `shares` are explicit and their acknowledgments are required — omitting them is `E_VERB_REQUIRED`. A mismatched verb is `E_VERB_MISMATCH`:

```loup
// reads — both forms are always valid; explicit form preferred for clarity
f(reads:  x)   // ✓ explicit reads acknowledgment — always valid
f(x)           // ✓ implicit reads — valid when intent is clear

// edits / takes / shares — acknowledgment required
f(edits:  x)   // ✓
f(takes:  x)   // ✓
f(shares: x)   // ✓
f(x)           // ✗  E_VERB_REQUIRED — edits/takes/shares must be acknowledged
```

**`reads` semantics.** A `reads` parameter accepts a shared immutable borrow. `reads` is also the implicit default: a parameter declared without any verb is treated identically to one declared with `reads`. Both forms are fully valid — use `reads` explicitly when making the read-only contract visible in the signature aids clarity; omit it when the intent is obvious from context. Multiple `reads` borrows on the same value may be active simultaneously. The function body may not write to the parameter (`E_READS_MUTATION`). The caller retains ownership after the call returns. Zero ARC overhead.

**`edits` semantics.** An `edits` parameter accepts an exclusive mutable borrow. The compiler verifies at the call site that no other active borrow of the same value exists. The function may read and write the parameter freely. The caller retains ownership after the call returns. On `unique` values, the exclusivity check is trivially satisfied — no liveness scan needed. On plain ARC values, the compiler performs a live-borrow scan at the call site.

**`takes` semantics.** A `takes` parameter accepts an ownership transfer. The source binding is consumed at the call site and may not be used thereafter (`E_USE_AFTER_TAKE`). On ARC values, the retain count is transferred rather than incremented. On `unique` values, the move is zero-cost with no ARC operation.

**`shares` semantics.** A `shares` parameter accepts an ARC retain. Both the caller and the callee hold a reference after the call returns. On `unique` values, `shares` triggers an implicit unique-to-ARC downgrade, permanently surrendering the exclusivity proof. After `shares` on a `unique` binding, the binding becomes a plain ARC reference.

**Interaction with `unique`.**

| Verb on `unique` | Runtime cost | Uniqueness proof after call |
|---|---|---|
| `reads` | Zero | Retained |
| `edits` | Zero — no liveness scan | Retained |
| `takes` | Zero — no ARC decrement | Consumed |
| `shares` | One ARC retain | **Permanently surrendered** |

**Backward compatibility.** `borrow` and `excl borrow` remain valid in `@mode(host.native)` and `@mode(freestanding)`.

**ARC behavior change for no-verb parameters.** In prior ARC semantics, a plain parameter `func f(x: Buffer)` in `@mode(host.native)` implicitly ARC-retained `x` on entry and released it on exit. With the implicit `reads` default, `x` is now a zero-overhead borrow — no retain or release is inserted. Code that relied on the retain to extend the lifetime of `x` beyond the call frame must now use `shares` explicitly. The compiler catches this: in `@mode(host.native)` and `@mode(freestanding)`, attempting to store or return a `reads` parameter beyond the call frame emits `E_BORROW_ESCAPE`, guiding the programmer to use `shares` instead. `E_READS_MUTATION` is a separate error that fires when the function body attempts to write to a `reads` parameter directly — for example, assigning to one of its fields. `reads` is semantically equivalent to `borrow`. `edits` on struct-typed and `unique`-typed parameters is semantically equivalent to `excl borrow`. However, `edits` extends exclusive borrowing to plain ARC class instance parameters — a capability that `excl borrow` does not provide (`excl borrow` on a plain ARC class type is `E_EXCL_BORROW_NOT_STRUCT`, §23.4.1.1). This extension is the primary safety improvement of the verb system over the prior `borrow`/`excl borrow` vocabulary. The reference formatter emits a `prefer-verbs` lint advisory for `borrow` and `excl borrow` usage in new code.

**`edits` in `async func` signatures.** `edits` on a struct-typed parameter is semantically equivalent to `excl borrow` and inherits the `E_EXCL_BORROW_ASYNC` restriction (§23.4.1.1): it may not appear in `async func` signatures because the caller's stack frame may no longer be valid when the function resumes after suspension. `edits` on a class-typed parameter does not inherit this restriction — ARC keeps the object alive across suspension points, and exclusivity is verified per-call rather than as a persistent live borrow.

**Error codes.**

| Code | Mode | Condition |
|---|---|---|
| `E_VERB_REQUIRED` | All | Call site omits required verb acknowledgment for an `edits`, `takes`, or `shares` parameter — `reads` and no-verb parameters do not require acknowledgment |
| `E_VERB_MISMATCH` | All | Call site verb does not match declaration verb |
| `E_USE_AFTER_TAKE` | All | Value used after being transferred via `takes` |
| `E_EDITS_WHILE_READS` | All | `edits` called while an active `reads` borrow of the same value is live |
| `E_EDITS_ALIAS` | All | Same value passed as `edits` more than once in a single call |
| `E_EDITS_READS_ALIAS` | All | Same value passed as both `edits` and `reads` in a single call |
| `E_EDITS_AFTER_SHARES` | All | `edits` attempted after `shares` downgraded a `unique` binding to ARC |
| `E_READS_MUTATION` | All | `reads` parameter written inside the function body |
| `E_EDITS_STRUCT_ASYNC` | All | `edits` on a struct-typed parameter declared in an `async func` signature |

---

### §23.4.10 `requires` Clauses and `distinct()`

*(This section is normative. Applies to all execution modes.)*

A `requires` clause expresses ownership contracts that span multiple parameters simultaneously or assert spatial relationships between parameters. It appears after the parameter list and before the return type annotation.

**Syntax.**

```
requires_clause   ::= 'requires' requires_contract (',' requires_contract)*
requires_contract ::= verb_req | distinct_req
verb_req          ::= ('reads'|'edits'|'takes'|'shares') '(' IDENT (',' IDENT)* ')'
distinct_req      ::= 'distinct' '(' distinct_arg (',' distinct_arg)* ')'
distinct_arg      ::= IDENT | IDENT '[' expr ':' expr ']'
```

Multiple contracts are comma-separated. When stacked for readability:

```loup
func merge(dst: Buffer, src: Buffer, aux: Buffer)
  requires
    edits(dst),             // overrides implicit reads on dst
    distinct(dst, src, aux) // src and aux are implicitly reads
: void { ... }
```

**Multi-parameter verb shorthand.** Applying a verb to multiple parameters in `requires` is exactly equivalent to placing that verb inline on each parameter individually:

```loup
// Both declaration forms are valid and mean exactly the same thing.
// Explicit reads is recommended when making the read-only contract visible matters:
func compare(reads x: Buffer, reads y: Buffer): bool  // explicit — contract visible in signature
func compare(x: Buffer, y: Buffer): bool              // implicit — concise when obvious

// The redundant form is requires reads(...) on a parameter that is already reads
// (either explicit or implicit) — the compiler emits a redundant-requires lint:
func compare(x: Buffer, y: Buffer) requires reads(x, y): bool  // redundant-requires lint

// requires is valuable for edits, takes, shares, and distinct:
func fillAll(dst: Buffer, src: Buffer)
  requires edits(dst), distinct(dst, src): void { ... }
```

When a parameter already carries an inline verb, repeating it in `requires` is redundant and the compiler emits a `redundant-requires` lint advisory. The same applies to no-verb parameters: `requires reads(x)` on a no-verb parameter is redundant because no-verb is already implicitly `reads`. A `requires` clause may specify a verb for a no-verb parameter to override the implicit default — `requires edits(dst)` on a no-verb `dst` parameter makes it `edits`, which is equivalent to declaring `edits dst: Buffer` inline.

**Call site acknowledgment.** `requires edits(...)`, `requires takes(...)`, `requires shares(...)`, and `requires distinct(...)` contracts must be acknowledged at every call site. `requires reads(...)` acknowledgments are optional at call sites — consistent with `reads` being the implicit default:

```loup
merge(dstBuf, srcBuf, auxBuf,
  edits(dstBuf),                      // required — edits must be acknowledged
  distinct(dstBuf, srcBuf, auxBuf),   // required — distinct must be acknowledged
  // reads(srcBuf, auxBuf)            // optional — implicit reads, may be omitted
)
```

**Implicit `safe func`.** A function is implicitly `safe func` (§23.4.12) when its `requires` clause contains any `edits(...)` or `distinct(...)` contract. A function with only `reads(...)` contracts is not implicitly safe.

**`distinct()` contract.** `distinct(a, b, ...)` asserts that the listed parameters do not point to overlapping memory regions. Valid only on `reads`- or `edits`-qualified parameters. See §23.4.5 for the relationship to buffer disjointness contracts.

The compiler produces one of three outcomes at each call site:

1. **Statically provable.** Parameters originate from separate heap allocations. Verified at compile time; no additional annotation required.

2. **Statically refutable.** The same binding appears more than once. `E_DISTINCT_ALIAS` is emitted.

3. **Statically unknowable.** Parameters are derived slices of the same allocation. The caller must add `@unsafe("distinct: reason")` to acknowledge explicitly. The annotation is preserved in debug metadata and is greppable for audit. The LLVM `noalias` ABI attribute is emitted for cases 1 and 3. Case 2 is a compile-time error — no code is generated.

**Error codes.**

| Code | Mode | Condition |
|---|---|---|
| `E_DISTINCT_ALIAS` | All | Same binding appears more than once in `distinct()` |
| `E_DISTINCT_NOT_READS_EDITS` | All | `distinct()` applied to a non-`reads`/`edits` parameter |
| `E_REQUIRES_UNACKNOWLEDGED` | All | Call site omits acknowledgment of a `requires` contract |
| `E_REQUIRES_MISMATCH` | All | Call site acknowledgment does not match declaration contract |

---

### §23.4.11 `modifier` — Method Mutation Contract

*(This section is normative. Applies to all execution modes.)*

A `modifier` method declares that it writes to one or more `var` fields on `self`. `modifier` applies only to **class** methods. Struct methods do not use `modifier` — structs have value semantics (copy on assignment, §10.3), so no aliasing can occur through struct method calls; the safety enforcement that `modifier` provides for class instances is unnecessary and inapplicable. A `modifier` declaration on a struct method is a compile-time error (`E_MODIFIER_ON_STRUCT`).

The compiler enforces this declaration bidirectionally for class methods.

**Declaration syntax.**

```loup
class Foo {
  var _count: int = 0

  pub modifier increment(): void { _count = _count + 1 }   // writes self
  pub func     value(): int      { return _count }          // read only
}
```

**Compiler-enforced invariants.**

1. *Declaration invariant.* A non-`modifier` method that writes to any `var` field on `self` is `E_MODIFIER_REQUIRED`. This is enforced for direct field assignments and for calls to `modifier` methods on `self` from within a non-modifier body.

2. *Call site invariant.* A `modifier` method called on a plain ARC instance requires a safe context (§23.4.12). The compiler verifies that no other live reference to the receiver exists at the point of the call.

**Setters are automatically `modifier`.** All `set` accessors are implicitly `modifier` and enforce the same call site rules. No additional annotation is required.

**`operator func` methods and `modifier`.** Operator methods are not implicitly `modifier` — the `modifier` keyword must be written explicitly when the body writes `var` fields on `self`. The syntax is `modifier operator func +=` (the `modifier` keyword precedes `operator`). Without `modifier`, writing to a `var` field inside an `operator func` body is `E_MODIFIER_REQUIRED`. With `modifier`, calling the operator on a plain ARC instance requires safe context at the call site, exactly like any other `modifier` method.

```loup
class Config {
  var _timeout: int = 30
  pub get timeout(): int  { return _timeout }   // non-modifier
  pub set timeout(t: int) { _timeout = t    }   // implicitly modifier
}
```

**`modifier` on `unique` receivers.** No safe context required — `unique` proves exclusivity statically.

**`modifier` on `synchronized` receivers.** No safe context required — the runtime lock provides exclusivity dynamically (§23.4.13).

**Direct external writes to `pub var` fields.** A direct external write to a `pub var` field on a plain ARC class instance — such as `config.timeout = 60` from outside the class — is subject to the same safe context requirement as calling a `modifier` method on that instance. The compiler enforces this as `E_SAFE_CONTEXT_REQUIRED`. On `unique` receivers, direct field writes are unconditionally safe. On `synchronized` class instances, direct external field writes acquire the instance lock automatically, identical to calling a `modifier`.

**`modifier` propagation.** When any function body — whether a top-level function, a class method, or a static method — calls a `modifier` method on a plain ARC class receiver, that call requires a safe context. The function may either wrap the call in a `safe {}` block, or declare itself `safe func` — which propagates the requirement to its callers in the same way `async` propagates upward through the call stack. A `safe func` may call `modifier` methods on plain ARC receivers freely within its body without additional `safe {}` wrappers.

**Error codes.**

| Code | Mode | Condition |
|---|---|---|
| `E_MODIFIER_REQUIRED` | All | Non-`modifier` method writes to a `var` field on `self` |
| `E_MODIFIER_ON_STRUCT` | All | `modifier` declaration used on a struct method |
| `E_MODIFIER_OVERRIDE_MISMATCH` | All | Non-`modifier` method overrides a `modifier` method in a superclass or implements a `modifier` interface method (§11.1) |
| `E_SAFE_CONTEXT_REQUIRED` | All | `modifier` called on plain ARC receiver outside safe context |

---

### §23.4.12 `safe` Contexts and `safe func` Propagation

*(This section is normative. Applies to all execution modes.)*

A `safe` context is a lexical scope within which the compiler activates shared-XOR-mutable enforcement across all values visible in that scope, including plain ARC class instances. Outside a safe context, ARC semantics apply without ownership enforcement. Inside, the compiler verifies:

1. No `edits` borrow is active while any other borrow of the same value is live.
2. No `modifier` method is called while any other live reference to the receiver exists.
3. No `var` field write occurs through an aliased ARC reference.

**`safe {}` block.** Introduces a safe context for its lexical scope. Values declared before the block that remain in scope are subject to enforcement within it:

```loup
let config = Config()
let alias  = config

safe {
  config.setTimeout(60)    // ✗ E_SAFE_ALIAS_MUTABLE — alias is live in scope
}

safe {
  let cfg = Config()       // no alias
  cfg.setTimeout(60)       // ✓
}
```

**`safe func` declaration.** A function declared `safe func` both requires and provides a safe context. It may call other `safe func`s and `modifier` methods freely without additional `safe {}` wrappers:

```loup
safe func process(edits buf: Buffer): void {
  fill(edits: buf)    // ✓ safe context active
}
```

**Propagation.** `safe` propagates identically to `async`: a `safe func` is a context requirement that travels upward through the call stack until anchored by a `safe {}` block:

```loup
safe func fill(edits buf: Buffer): void { ... }

// Option 1 — propagate upward
safe func prepare(edits buf: Buffer): void {
  fill(edits: buf)                    // ✓ already in safe func
}

// Option 2 — anchor inline
func setup(edits buf: Buffer): void {
  safe { fill(edits: buf) }           // ✓ safe{} anchors the requirement
}
```

**`safe {}` blocks and `await`.** A `safe {}` block may not contain an `await` expression — `E_SAFE_BLOCK_AWAIT`. The compiler cannot maintain exclusivity proofs across suspension points: after an `await`, another task may have obtained a reference to any ARC value that was subject to `edits` or `modifier` enforcement inside the block. Use `synchronized` (§23.4.13) for mutation that must span `await` boundaries.

**`safe async func`, `safe gen func`, `safe async gen func`.** `safe` may be combined with `async`, `gen`, or both. A `safe async func` enforces safety checks at each individual call site within the function body — each `edits:` call and each `modifier` call is independently verified at the moment it executes. The `await` between calls is not a problem because the exclusivity check is per-call, not a persistent live borrow spanning the suspension point:

```loup
safe async func loadAndProcess(edits buf: Buffer): void {
  let data = await fetchData()    // ✓ async context
  fill(edits: buf)                 // ✓ safe context
}
```

**Implicit `safe func`.** A function is implicitly `safe func` when any parameter carries `edits`, or when the `requires` clause contains `edits(...)` or `distinct(...)` contracts. Both conditions are visible in the function signature and deterministic from the outside.

When a function body calls a `modifier` on a plain ARC receiver outside a `safe {}` block, the compiler emits `E_SAFE_CONTEXT_REQUIRED` at that call site. The function does not become implicitly `safe func`. The programmer must explicitly choose: wrap the call in `safe {}`, or declare the function `safe func`. This keeps propagation visible and intentional, consistent with the explicit meaning design goal (§1).

**Availability.** `safe {}` and `safe func` are available in all execution modes. This removes the mode gate that previously restricted ownership enforcement to `@mode(host.native)` and `@mode(freestanding)`.

**Error codes.**

| Code | Mode | Condition |
|---|---|---|
| `E_SAFE_CONTEXT_REQUIRED` | All | `safe func`, `modifier`, or `edits` called outside safe context on non-unique, non-synchronized value |
| `E_SAFE_ALIAS_MUTABLE` | All | `modifier` called or `edits` taken while an alias of the receiver is live inside safe context |
| `E_SAFE_BLOCK_AWAIT` | All | `await` expression inside a `safe {}` block |

---

### §23.4.13 `synchronized` Class — Runtime-Locked Mutation

*(This section is normative. Applies to `@mode(web.scripted)`, `@mode(web.compiled)`, `@mode(host.scripted)`, `@mode(host.dual)`, and `@mode(host.native)`.)*

A `synchronized` class serializes all `modifier` method invocations through a per-instance mutex, providing mutation safety in contexts where compile-time proof is impossible: across `await` suspension points, across OS thread boundaries, and from event callbacks.

**Declaration syntax.**

```loup
synchronized class Config {
  var _timeout:  int    = 30
  var _endpoint: string = ""

  pub modifier setTimeout(t: int): void     { _timeout  = t }
  pub modifier setEndpoint(e: string): void { _endpoint = e }
  pub func     isReady(): bool { return _endpoint != "" }
}
```

**Lock semantics.** Each instance carries a per-instance mutex acquired automatically on entry to any `modifier` method and released automatically on return or exception unwind. The programmer never calls lock or unlock explicitly. The lock is not reentrant: a `modifier` that calls another `modifier` on the same `self` is `E_SYNCHRONIZED_REENTRANT`.

**Call site.** `modifier` methods on `synchronized` instances require no safe context:

```loup
let config = Config()    // synchronized
let alias  = config      // ARC alias

config.setTimeout(60)    // ✓ lock acquired at runtime
alias.setTimeout(90)     // ✓ blocks until first modifier finishes
```

**Non-modifier methods.** Do not acquire the lock. Verified read-only by the compiler. Callable from any context.

**The three-tier safety model.**

| Tier | Mechanism | Cost | Use case |
|---|---|---|---|
| 1 | `unique` binding | Zero — static proof | Local exclusive processing |
| 2 | `safe {}` / `safe func` | Zero — compile-time enforcement | Shared ARC, bounded scope |
| 3 | `synchronized` class | Runtime lock per call | Async, threads, callbacks |

A `safe {}` context cannot span an `await` suspension point, a thread boundary, or a callback — the compiler's exclusivity proof is invalidated at each boundary. `synchronized` handles these cases correctly because the lock is acquired and released independently at each call site.

**`synchronized` in the type system.** `synchronized` is part of the class declaration and is visible in the type. A function parameter typed `synchronized Config` communicates that modifiers may be called without a safe context.

**`synchronized` and `Sendable`.** A `synchronized` class may declare `implements Sendable`. The compiler recognises `synchronized` as providing thread safety equivalent to `Mutex[T]`-wrapped fields and suppresses `E_SENDABLE_UNPROTECTED_VAR` for `var` fields on classes that declare both `synchronized` and `implements Sendable`. This is the only exception to the structural `Sendable` verification rule (§17.8.1). Non-modifier read methods on a `synchronized Sendable` class are inherently thread-safe because the compiler verifies they contain no `var` field writes.

```loup
synchronized class Counter : Any implements Sendable {
  var _value: int = 0            // ✓ no E_SENDABLE_UNPROTECTED_VAR
                                 //   synchronized exempts var fields
  pub modifier increment(): void { _value = _value + 1 }
  pub func     value(): int      { return _value }
}

let counter = Counter()          // Sendable — can be passed to Thread.spawn
```

**`@lockOrder(n: int)` — lock ordering annotation (normative).** To prevent deadlock from inconsistent lock acquisition order, `synchronized` classes may be annotated with `@lockOrder(n)` where `n` is a positive integer. Within a `modifier` method body, if the method calls a `modifier` on another `synchronized` object of a different class, that object's `@lockOrder` value MUST be strictly greater than the current class's `@lockOrder` value. Violations are compile-time errors (`E_LOCK_ORDER_VIOLATION`).

```loup
@lockOrder(1)
synchronized class Account : Any {
  var _balance: int = 0
  pub modifier debit(amount: int): void { _balance -= amount }
  pub func balance(): int { return _balance }
}

@lockOrder(2)
synchronized class Ledger : Any {
  pub modifier transfer(edits account: Account, amount: int): void {
    // ✓ Account (lockOrder 1) < Ledger (lockOrder 2)
    account.debit(amount)
  }
}

@lockOrder(1)
synchronized class BudgetAccount : Any {
  pub modifier settle(edits ledger: Ledger): void {
    // ✗ E_LOCK_ORDER_VIOLATION — Ledger (lockOrder 2) > BudgetAccount (lockOrder 1)
    // ledger.transfer(...)
  }
}
```

Classes without `@lockOrder` may not call `modifier` methods on other `synchronized` objects from within their own `modifier` bodies — this would be an unordered lock acquisition (`E_LOCK_ORDER_MISSING`). Assign `@lockOrder` to all `synchronized` classes that participate in multi-object locking.

**Freestanding mode.** `@lockOrder` is only valid on `synchronized` classes. Since `synchronized` is unavailable in `@mode(freestanding)` (`E_SYNCHRONIZED_FREESTANDING`), `@lockOrder` is implicitly unavailable in freestanding mode as well. `@lockOrder` on a non-`synchronized` class in any mode is `E_LOCK_ORDER_NOT_SYNCHRONIZED`.

**Error codes for `@lockOrder`:**

| Code | Mode | Condition |
|---|---|---|
| `E_LOCK_ORDER_VIOLATION` | All non-freestanding | A `modifier` calls a `modifier` on a `synchronized` object whose `@lockOrder` is ≤ the current class's `@lockOrder` |
| `E_LOCK_ORDER_MISSING` | All non-freestanding | A `modifier` calls a `modifier` on a `synchronized` object when neither class has `@lockOrder` |
| `E_LOCK_ORDER_NOT_SYNCHRONIZED` | All | `@lockOrder` applied to a non-`synchronized` class |

**Error codes.**

| Code | Mode | Condition |
|---|---|---|
| `E_SYNCHRONIZED_REENTRANT` | All non-freestanding | A `modifier` on a `synchronized` instance calls another `modifier` on the same `self` |
| `E_SYNCHRONIZED_FREESTANDING` | Freestanding | `synchronized` class declared in `@mode(freestanding)` — no mutex primitive is provided |

---

### §23.4.14 `unsafe {}` Within `synchronized` Classes — Lock-Release Regions

*(This section is normative. Applies to `@mode(web.scripted)`, `@mode(web.compiled)`, `@mode(host.scripted)`, `@mode(host.dual)`, and `@mode(host.native)`.)*

Inside a `modifier` method on a `synchronized` class, an `unsafe {}` block explicitly releases the per-instance lock for its lexical scope, allowing expensive work to proceed without holding the lock.

**The default is locked.** Inside a `synchronized` modifier, the lock is always held unless explicitly released via `unsafe {}`. This is an inversion of the traditional lock()/unlock() model and eliminates the bug class where a programmer forgets to reacquire a lock after releasing it.

**Semantics.** On entry to an `unsafe {}` block, the instance lock is released. On exit (normal or exception), the lock is reacquired before execution continues. The compiler enforces that no `self` field is accessed within the block.

**Syntax and required reason string.**

```loup
synchronized class Cache {
  var _entries: dict[string, string] = {}
  var _hits:    int = 0

  pub modifier fetch(key: string): string {
    // Lock held — self fully accessible
    if (_entries.has(key)) {
      _hits = _hits + 1                   // ✓ write under lock
      return _entries[key]                // ✓ read under lock
    }

    // Declare result variable before the lock-release region
    var value = ""

    // Lock released for duration of unsafe{} block
    unsafe("fetching from remote — lock released for network call duration") {
      value = remoteFetch(key)            // ✓ assigns to outer var — fine
      let ttl = computeTTL(value)         // ✓ local computation — fine
      _entries[key] = value               // ✗  E_SELF_ACCESS_UNSAFE — lock not held
    }
    // Lock reacquired automatically on unsafe{} exit

    // Lock held again — value is in scope, self is accessible
    _entries[key] = value                 // ✓ write under lock
    return value
  }
}
```

**Required reason string.** The reason string is mandatory — `unsafe {}` without a reason string is `E_UNSAFE_NO_REASON`. The reason is preserved in debug metadata. Grepping for `unsafe(` inside `synchronized` class definitions provides a complete audit trail of every lock-release region in a codebase.

**Permitted and prohibited operations inside `unsafe {}` in a `synchronized` modifier.**

| Operation | Permitted |
|---|---|
| Read or write `self` fields | ✗ `E_SELF_ACCESS_UNSAFE` |
| Call `modifier` on `self` | ✗ `E_SELF_ACCESS_UNSAFE` |
| Call non-`modifier` on `self` | ✗ `E_SELF_ACCESS_UNSAFE` |
| Read/write local variables and parameters | ✓ |
| Call external functions | ✓ |
| `await` expressions | ✓ |
| Call `modifier` on other `synchronized` instances | ✓ (acquires their locks independently) |

**Nesting.** `unsafe {}` blocks may not be nested inside each other within a `synchronized` modifier — `E_UNSAFE_NESTED`. Functions called from within `unsafe {}` that are themselves `synchronized` modifiers acquire their own instance locks independently.

**Relationship to other safety mechanisms.**

| Mechanism | Purpose |
|---|---|
| `safe {}` / `safe func` | Compile-time exclusivity scope |
| `@unsafe(reason)` | Auditable assertion of an unverifiable safety property |
| `unsafe {}` in `synchronized` modifier | Runtime lock-release region within a `synchronized` modifier |

These three mechanisms are independent and address separate concerns. `unsafe {}` in a `synchronized` modifier does not suppress borrow-checker errors, does not bypass `distinct()` contracts, and does not interact with `safe {}` scope tracking.

**Error codes.**

| Code | Mode | Condition |
|---|---|---|
| `E_SELF_ACCESS_UNSAFE` | All non-freestanding | `self` field or method accessed inside `unsafe {}` in a `synchronized` modifier |
| `E_UNSAFE_NESTED` | All non-freestanding | Nested `unsafe {}` blocks inside a `synchronized` modifier |
| `E_UNSAFE_NO_REASON` | All | `unsafe {}` block used without a reason string |
| `E_UNSAFE_NOT_SYNCHRONIZED` | All | `unsafe {}` block used outside a `synchronized` modifier |

---

### §23.5 ARC and the Scripted/Native Mode Boundary

When a compiled (ARC) object is passed into interpreted (GC) code, the runtime inserts a **bridge retain**:

1. The runtime allocates a thin GC-managed wrapper object on the GC heap.
2. The wrapper holds a strong ARC retain on the native object (incrementing `strong_count`).
3. The GC manages the wrapper object's lifetime.
4. When the GC collects the wrapper, the wrapper's finalizer calls `release()` on the ARC object.

From the scripted side, the ARC object appears as a normal class instance. From the native side, the retain count is elevated by one for each live scripted reference.

When a scripted (GC-managed) object is passed into native (ARC-managed) code:

1. The compiled function's entry point registers the GC object reference as a GC root.
2. The root is released when the compiled function returns or when the last local binding to the object is released within native code.

**`del` at the boundary.** Calling `del handle;` on a bridge wrapper releases the ARC retain immediately and invalidates the GC wrapper. Subsequent access to `handle` from scripted code throws `LifetimeError`.

**Cross-boundary cycles (normative).** Cross-boundary cycles (ARC object → GC object → ARC object) are not automatically broken by either runtime. An ARC object whose fields include a GC-managed object type that in turn statically holds the original ARC type constitutes a cycle that neither collector will reclaim — this is a permanent memory leak in long-running programs.

The compiler SHALL emit `E_CROSS_BOUNDARY_CYCLE` as a **compile-time error** for any statically-detectable case where: (1) an ARC-managed class field holds a GC-managed class type, AND (2) that GC-managed class statically holds a strong reference back to the ARC class type. Break cycles by using a `weak` reference on the ARC side: the `weak var` field does not keep the GC-managed object alive from the ARC side, allowing the GC to collect it and thus drop the reference back to the ARC object.

For cases that are not statically detectable — for example, reference graphs constructed at runtime — the compiler emits the `cross-boundary-cycle` lint advisory. ARC objects that participate in such graphs MUST hold references to GC-managed objects only via `weak` fields on the ARC side. Failure to do so causes a permanent, unrecoverable memory leak.

| Code | Mode | Condition |
|---|---|---|
| `E_CROSS_BOUNDARY_CYCLE` | host.dual, host.native | Statically-detectable ARC→GC→ARC reference cycle without `weak` on the ARC side |

### §23.6 ABI Stability

Loup native modules export a stable C-compatible ABI for `pub` functions and types when opted in:

```
# <name>.lppkg
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

Loup provides bidirectional C header interop for native builds.

#### §23.7.1 `loup export-headers` — Loup → C

Generates a C header file from a compiled Loup module's public API, allowing C/C++ code to call Loup:

```
loup export-headers --target native mymodule.loup -o mymodule.h
```

**Generated header format:**

```c
// mymodule.h — generated by loup export-headers
// DO NOT EDIT

#pragma once
#include <stdint.h>
#include <stdbool.h>

#ifdef __cplusplus
extern "C" {
#endif

typedef struct { double x; double y; } LoupPoint;

double loup_mymodule_distance(LoupPoint a, LoupPoint b);

typedef struct LoupString LoupString;
LoupString* loup_mymodule_greet(const char* name);
const char* loup_string_cstr(const LoupString* s);
void        loup_string_free(LoupString* s);

#ifdef __cplusplus
}
#endif
```

**Type mapping:**

| Loup type | C type | Notes |
|---|---|---|
| `int` / `int64` | `int64_t` | |
| `int8` | `int8_t` | |
| `int16` | `int16_t` | |
| `int32` | `int32_t` | |
| `uint` | `uintptr_t` (64-bit targets) / `uint32_t` (32-bit targets) | Pointer-sized; maps the same as `uint64`/`uint32` on the respective platform |
| `char` | `uint32_t` | Unicode scalar value (§4.1.5); maps to 32-bit unsigned at the ABI boundary |
| `uint8` | `uint8_t` | |
| `uint16` | `uint16_t` | |
| `uint32` | `uint32_t` | |
| `uint64` | `uint64_t` | |
| `float` / `float64` | `double` | |
| `float32` | `float` | |
| `bigint` | `LoupBigInt*` | Opaque; caller manages via `loup_bigint_retain`/`loup_bigint_release` |
| `decimal` | `LoupDecimal*` | Opaque; caller manages via `loup_decimal_retain`/`loup_decimal_release` |
| `bool` | `bool` | |
| `string` | `LoupString*` | Caller frees via `loup_string_free` |
| `bytes` | `LoupBytes*` | Caller frees via `loup_bytes_free` |
| `Vec[T, N]` | `T[N]` (array) | Must be 16/32/64-byte aligned; pass by pointer for N > 4 |
| `struct T` | `LoupT` | By value for small structs |
| `class T` | `LoupT*` (opaque) | Caller manages via `loup_T_retain`/`loup_T_release` |
| `Option[T]` (primitive) | `T` with sentinel or bool out-param | Configurable via `@cexport` |
| `void` | `void` | |

**`@cexport` annotation** provides fine-grained control over the generated C signature:

```
@cexport(name="get_user_name", nullable=true)
pub func getUserName(id: string): string? { ... }
```

#### §23.7.2 `loup import-headers` — C → Loup

Generates Loup `extern native` declarations from a C header file, eliminating hand-written FFI bindings:

```
loup import-headers --lib sqlite3 /usr/include/sqlite3.h -o sqlite3.loup
```

**Generated binding format:**

```loup
// sqlite3.loup — generated by loup import-headers
// DO NOT EDIT

@mode(host.native)

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
loup import-headers --lib ssl --lib crypto /usr/include/openssl/ssl.h -o openssl.loup
```

### §23.8 Build Pipeline and `.lppkg` for Native

**Manifest additions:**

```
# <name>.lppkg
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
loup build --target native                        # debug build
loup build --target native --release              # release build
loup build --target native --release --lto thin   # release with ThinLTO
loup build --target native --debug                # release with DWARF debug info
loup build --target native --backend cranelift    # fast Cranelift backend
loup build --target native --lib shared           # shared library
loup build --target native --lib static           # static library
loup build --target native --arch aarch64 --os linux  # cross-compile
loup build --target native --stack-size 8388608        # 8 MB stack (default: platform ABI default)
loup export-headers --target native mymodule.loup -o include/mymodule.h
loup import-headers --lib sqlite3 sqlite3.h -o bindings/sqlite3.loup
```

### §23.9 Requirements

- Native compilation requires `@mode(host.native)` for all source files.
- `extern js` and `@jsexport` are prohibited — no JavaScript runtime is present in a native binary (`E_EXTERN_JS_NOT_NATIVE`).
- Structs passed to `extern native` functions must be annotated `@repr(C)` (`E_EXTERN_STRUCT_NOT_REPR_C`).
- All types should be statically known. `Any` as a declared type, `dynamic class`, and `core.inspect` are permitted but produce the `W_ANY_IN_AOT_MODE` advisory (§2.4.2, §2.6); projects that prefer to enforce static typing can promote it with `--warnings-as-errors=W_ANY_IN_AOT_MODE`.
- ARC is mandatory; there is no GC option for `--target native`.

**Stack overflow in native mode (normative).** The `--stack-size N` build flag (bytes, must be a multiple of the platform page size) sets the OS thread stack size for the main thread and all `Thread.spawn` threads. The Loup native runtime SHALL install a stack guard page (one platform page below the stack bottom) on all platforms that support `mprotect`/`VirtualProtect`. An access to the guard page produces a signal (SIGBUS/SIGSEGV on POSIX, structured exception on Windows) that the runtime maps to `StackOverflowError` and delivers to the current thread's exception handler. On platforms that do not support guard pages, a `--stack-size` overflow produces undefined behavior; the runtime documentation MUST note this for each target triple. The `deep-async-stack` lint advisory fires when an `async func` declares local variables whose total stack footprint exceeds 64 KB — async coroutine frames are heap-allocated but can still be unexpectedly large.

**Overflow arithmetic methods.** Fixed-width integer types in all modes have `checkedAdd`, `wrappingAdd`, `saturatingAdd` (and the equivalent `Sub`, `Mul`, `Div` families) for explicit overflow control. See §24.19 for the full specification.


---

## §24 Freestanding Mode

*(This section is normative.)*

### §24.1 Overview

Freestanding mode (`@mode(freestanding)`) compiles Loup source to a native binary with **no Loup runtime linked**. It targets kernels, bootloaders, embedded firmware, hypervisors, and any environment where no OS, no libc, and no host runtime exists. The binary contains only what Loup source files explicitly produce plus any `extern native` libraries the programmer declares.

**Design goals:**

1. **Zero-cost memory safety** — the full ownership system: `reads`/`edits`/`takes`/`shares` verbs, `modifier`, `safe {}`, and `distinct()` contracts (v1.15, all modes); `unique`/`borrow`/`excl borrow`/`lifetime ~name` (all modes per §2.6). No ARC overhead or runtime support required. v1.16 adds `@interruptSafe`, `InterruptGuard`, `DmaBuffer[T]`, `PartialInit[T]`, `native.mpu`, and `native.atomic.hwFence` to close hardware-specific safety gaps (§24.20, §24.24).
2. **Direct hardware access** — inline assembly, volatile MMIO, interrupt handlers, and raw linker section control.
3. **Auditable unsafe surface** — every unsafe operation requires `@unsafe` or a purpose-specific annotation; the surface is greppable and minimal.
4. **Rust-equivalent or stronger guarantees** — the memory-safety properties in `@mode(freestanding)` match or exceed those provided by Rust's `no_std` environment (see §23.4 and release notes for the formal comparison).

### §24.2 Target Declaration and Compilation

```
loup build --target freestanding --arch x86_64
loup build --target freestanding --arch aarch64
loup build --target freestanding --arch riscv64 --march rv64imac
```

| `--arch` | Description |
|---|---|
| `x86_64` | 64-bit x86 (AMD64/Intel 64) |
| `aarch64` | 64-bit ARM (ARMv8-A) |
| `riscv64` | 64-bit RISC-V; `--march` specifies the extension string |
| `x86` | 32-bit x86 (IA-32) — limited support |

Output format defaults to ELF. Override with `--output-format elf|raw|pe|macho`.

Every source file in a freestanding compilation unit MUST declare `@mode(freestanding)` as its first active token (§2.5).

**Cross-mode import rules.** `@mode(freestanding)` files may import:

- Other `@mode(freestanding)` files in the same compilation unit.
- `extern native` C libraries declared with `extern native "libname"` — these are linked directly and require no Loup runtime.

`@mode(freestanding)` files may NOT import:

- `@mode(host.native)` modules — native modules require the ARC runtime, which is not available in freestanding mode (`E_FREESTANDING_IMPORT_NATIVE`).
- `@mode(web.compiled)` or `@mode(host.scripted)` modules — these require the Wasm GC runtime or the JIT runtime (`E_FREESTANDING_IMPORT_MANAGED`).
- Any standard library module not in the permitted subset (§24.20) (`E_FREESTANDING_MODULE`).

Conversely, `@mode(host.native)` files may NOT import `@mode(freestanding)` modules — freestanding modules lack an ARC runtime and expose raw pointer APIs that are incompatible with ARC memory management (`E_NATIVE_IMPORT_FREESTANDING`).

### §24.3 Stripped Features

| Feature | Error code | Reason |
|---|---|---|
| ARC runtime (`weak`, retain/release) | `E_FREESTANDING_ARC` | No runtime library |
| `async`/`await`, `Task[T]`, `spawn` | `E_FREESTANDING_ASYNC` | No event loop |
| `throw` / `try` / `catch` | `E_FREESTANDING_EXCEPTIONS` | No `.eh_frame`; unwinding is fatal |
| Template fences (HTML, CSS, etc.) | `E_FREESTANDING_FENCE` | No rendering pipeline |
| Reactive UI (`ui.*`) | `E_FREESTANDING_UI` | No UI framework |
| `core.reflect` / `core.inspect` | `E_FREESTANDING_REFLECT` | Requires runtime metadata |
| `dynamic class` / `!{}` | `E_FREESTANDING_DYNAMIC` | Requires runtime type table |
| `portal` statements | `E_FREESTANDING_PORTAL` (release) / `E_FREESTANDING_PORTAL_NO_CHANNEL` (debug, unconfigured) | Release builds: stripped unconditionally. `--debug` builds: permitted when at least one of `@debug_control_channel`, `@debug_trace_channel`, or `portal_ring_size > 0` is configured (§24.25). Otherwise `E_FREESTANDING_PORTAL_NO_CHANNEL`. Condition expressions always prohibited (`E_FREESTANDING_PORTAL_CONDITION`). |
| `bigint` | `E_FREESTANDING_RUNTIME` | Requires GMP-compatible multi-precision library |
| `decimal` | `E_FREESTANDING_RUNTIME` | Requires IEEE 754-2019 decimal128 library |
| Class construction without `@allocator` | `E_FREESTANDING_CLASS_NO_ALLOC` | No implicit heap |

Panics route through the `--panic` policy (§24.6) since exceptions are unavailable.

### §24.4 Available Features

All native-mode features not dependent on the ARC runtime, async executor, exceptions, or standard library. In particular:

- `reads`/`edits`/`takes`/`shares` verbs, `modifier`, `safe {}` / `safe func`, `distinct()` in `requires` clauses
- `unique let`/`unique var`/`unique class`
- `borrow`/`excl borrow`/`borrow[~name]`/`lifetime ~name`/`noescape fn`
- `unowned[~name]`, `@unsafe(reason)`, `Sendable`
- `extern native`, `MaybeUninit[T]`, `reinterpret[T, U]`
- Overflow arithmetic methods (§24.19)
- `native.mem`, `native.simd`, `native.atomic` (including `hwFence` and `MemoryOrder`), `native.ffi`, `core.math`, `core.text`
- `native.dma` — DMA buffer ownership (§24.20)
- `native.mpu` — MPU stack-guard installation (§24.20)
- `size_of[T]()`, `align_of[T]()` — compile-time layout queries (§24.4.1)
- `reinterpretChecked[T, U]` — checked type reinterpretation (§24.18)
- `PartialInit[T]` — field-tracked struct initialization (§24.17a)
- `@interruptSafe` annotation + `InterruptGuard` — interrupt-context safety (§24.24)
- `portal` statements — freestanding debug portal service (§24.25, `--debug` builds only)
- `debug.freestanding` — debug service startup and polling (§24.25, `--debug` builds only)

Plus the hardware-access features described in §24.5–§24.24 and the freestanding debug service in §24.25.

### §24.4.1 `size_of[T]()` and `align_of[T]()` — Compile-Time Layout Queries

*(This section is normative. Applies to `@mode(freestanding)` and `@mode(host.native)`.)*

`size_of[T]()` and `align_of[T]()` are compile-time built-in generic expressions that return the size and minimum alignment of type `T` in bytes, respectively. Both are evaluated entirely at compile time and produce a `uint64` constant; they have zero runtime cost and cannot be used on unsized types.

```loup
@mode(freestanding)

let sz  = size_of[PageTable]()      // uint64: 4096 (512 × 8-byte entries)
let al  = align_of[PageTable]()     // uint64: 4096 (from @align(4096))
let u32 = size_of[uint32]()         // uint64: 4
let ptr = size_of[uint]()           // uint64: 8 (on 64-bit targets)
```

**Rules:**
- `T` must be a type with a statically-known, finite size (`E_SIZE_OF_UNSIZED`). `Any`, open-ended union types, and function types are unsized.
- `T` must be a primitive, `@repr(C)` struct, enum, or tuple. Using `size_of` on a managed class type is `E_SIZE_OF_CLASS`.
- Both built-ins are valid in `@mode(host.native)` and `@mode(freestanding)`.
- The `~` sigil used in lifetime labels is not permitted in the type argument.

`size_of[T]()` and `align_of[T]()` are available in the `native.ffi` module scope. They are also available as bare expressions in `@mode(freestanding)` without an explicit import.



### §24.5 `@entry` — Bare Entry Point

`@entry` marks the single function the linker uses as the binary entry symbol. The function runs before any C runtime initialization.

```loup
@mode(freestanding)

@entry
@callconv(naked)
func _start(): void {
    asm {
        "lea rsp, [__stack_top]"
        "xor rbp, rbp"
        "call kernelMain"
        ::: "memory"
    }
}
```

Override the exported symbol name with `@entry(symbol: "_kernel_start")`.

**Rules:**
- One `@entry` per compilation unit (`E_ENTRY_DUPLICATE`).
- Return type must be `void` (`E_ENTRY_NONVOID`).
- Must have no parameters (`E_ENTRY_PARAMS`).
- Valid only in `@mode(freestanding)` (`E_ENTRY_NOT_FREESTANDING`).

### §24.6 `@panic_handler` and Panic Policy

**Panic sources:** bounds check failures, `--overflow=trap` violations, explicit `panic("msg")`, and `Option[T].unwrap()` on `None`.

**`PanicSource` — panic discriminant (normative).** The `@panic_handler` receives a `PanicSource` enum value as an additional parameter (appended to the signature) when `--panic=custom` is set, allowing handlers to distinguish the source of the panic:

```loup
enum PanicSource {
  Assertion;        // explicit panic("msg") or assert_eq! failure
  BoundsCheck;      // array/slice out-of-bounds access
  OverflowTrap;     // integer overflow with --overflow=trap
  UnwrapNone;       // Option[T].unwrap() on None
  StackOverflow;    // MPU guard-page fault (via native.mpu.installStackGuard)
  Unknown;          // unclassified runtime fault
}
```

`@panic_handler` with `PanicSource` has the extended signature:
`(msg: string, file: string, line: int, source: PanicSource): void`.
The compiler selects the correct signature variant based on the presence of the `source` parameter; both forms are valid.

**`--panic` build flag:**

| Flag | Behaviour |
|---|---|
| `--panic=halt` | Default. Disables interrupts; executes an infinite `hlt` loop. |
| `--panic=abort` | Triggers a CPU fault (x86_64: `ud2`). |
| `--panic=custom` | Calls the `@panic_handler` function. |

```loup
@mode(freestanding)

@panic_handler
func kernelPanic(msg: string, file: string, line: int): void {
    serialWrite("PANIC: ")
    serialWrite(msg)
    asm { "cli" }
    while (true) { asm { "hlt" } }
}
```

**Rules.** The `@panic_handler` function MUST match one of the two normative signatures defined above (basic `(msg, file, line): void` or extended `(msg, file, line, source: PanicSource): void`); any other signature is `E_PANIC_HANDLER_SIG`:

- **Basic:** `(msg: string, file: string, line: int): void`
- **Extended:** `(msg: string, file: string, line: int, source: PanicSource): void` — recommended when the handler needs to distinguish panic causes (e.g. routing stack-overflow panics to a different recovery path)

`--panic=custom` without a `@panic_handler` is `E_PANIC_HANDLER_MISSING`. The handler must not call any function that can itself panic (`E_PANIC_HANDLER_REENTRANT`).

**Bounds checking inside `@panic_handler`.** The compiler suppresses all runtime bounds checks inside the `@panic_handler` body. This prevents the handler from triggering a second panic (and infinite recursion) if it performs array or string indexing. The programmer is responsible for ensuring that all indexing inside the handler is in-range. Out-of-range accesses inside the handler produce undefined behavior rather than a second panic.

**Stack overflow inside `@panic_handler`.** If the handler itself overflows the stack, the behavior is undefined (the system will likely triple-fault or reset). Panic handlers SHOULD be written to use minimal stack space — avoid recursion, large local arrays, and deep function calls.

**`--double-fault` build flag (normative).** Specifies the system response when the `@panic_handler` itself triggers a panic (a "double fault"). This resolves the previously unspecified behavior of re-entrant panic handling.

| Flag | Behaviour |
|---|---|
| `--double-fault=halt` | Default. Disables interrupts; executes an infinite `hlt`/`wfi`/`wfe` loop. |
| `--double-fault=reset` | Triggers CPU reset via the architecture-specific reset mechanism (x86_64: triple-fault via invalid IDT; AArch64: `brk #0`; RISC-V: `ebreak` in M-mode with `mtvec` cleared). |
| `--double-fault=nop` | Silently ignores the second panic and returns from the handler. Intended for test environments that instrument panics. |

The double-fault handler is distinct from `@panic_handler` and does not receive a message string. It runs with the minimal stack that was valid at the point of double-fault entry.

### §24.7 `asm { }` — Inline Assembly

`asm { }` blocks embed inline assembly for CPU-specific instructions that have no higher-level Loup equivalent.

**Basic form:**

```loup
@mode(freestanding)

func disableInterrupts(): void { asm { "cli" } }
func enableInterrupts(): void  { asm { "sti" } }
func memoryBarrier(): void     { asm { "mfence" } }
```

**Full form with operands:**

```loup
@mode(freestanding)

func readMsr(msr: uint32): uint64 {
    var lo: uint32 = 0
    var hi: uint32 = 0
    asm {
        "rdmsr"
        out: lo = "=a", hi = "=d"
        in:  "ecx" = msr
        clobbers: []
    }
    return (hi as uint64 << 32) | lo as uint64
}
```

**Grammar:**

```
asm_block    ::= 'asm' '{' asm_string+ asm_ops? '}'
asm_ops      ::= asm_out? asm_in? asm_clobbers?
asm_out      ::= 'out' ':' (ident '=' string_lit) (',' ident '=' string_lit)*
asm_in       ::= 'in'  ':' (string_lit '=' expr)  (',' string_lit '=' expr)*
asm_clobbers ::= 'clobbers' ':' '[' string_lit* ']'
```

Constraint strings follow GCC/LLVM conventions. Output operands bind to mutable local variables. Type mismatches between operand variables and constraint widths are `E_ASM_OPERAND_TYPE`.

**`clobbers: "all"` shorthand.** The string literal `"all"` in the clobbers list is a normative shorthand for all caller-saved registers on the compilation target. It is the conservative safe choice when the clobber list is uncertain:

```loup
asm {
    "cpuid"
    out: eax = "=a", ebx = "=b", ecx = "=c", edx = "=d"
    in:  "eax" = leaf, "ecx" = subleaf
    clobbers: ["memory"]
}

// Conservative: clobbers all caller-saved regs
asm {
    "syscall"
    out: result = "=a"
    in:  "rax" = nr
    clobbers: ["all"]
}
```

**Architecture-specific clobber presets.** The following named presets expand to the correct register lists at compile time:

| Preset | Architecture | Expands to |
|---|---|---|
| `"msr-read"` | x86_64 | `["rcx", "rdx", "rax", "memory"]` |
| `"msr-write"` | x86_64 | `["memory"]` |
| `"cpuid"` | x86_64 | `["rax", "rbx", "rcx", "rdx"]` |
| `"sysenter"` | x86_64 | `["rax", "rcx", "r11", "memory"]` |
| `"svc"` | AArch64 | `["x0", "x1", "x2", "x3", "x4", "x5", "x6", "x7", "x8", "memory"]` |
| `"mret"` | RISC-V | `["a0", "a1", "memory"]` |

Use a preset or `"all"` rather than an incomplete manual list to avoid the silent register-corruption bug class.

**`borrow` values as `asm` input operands.** A `borrow T` parameter or binding may appear as an `asm` input operand. The address of the borrowed value is passed to the constraint as an integer pointer (equivalent to taking the address with `"=m"` or `"r"` constraints). The compiler verifies that the borrow's lifetime is still valid at the `asm` block. Passing a consumed or expired `borrow` as an `asm` input is `E_ASM_EXPIRED_BORROW`. In `@mode(freestanding)`, `asm` blocks do not require `@unsafe`; the compiler emits per-function lint advisory `asm-unchecked` (suppressible with `// loup:allow(asm-unchecked)`). In `@mode(host.native)`, `asm` blocks require `@unsafe("asm: <reason>")`.

### §24.8 `@volatile` — MMIO Semantics

`@volatile` on a `borrow` parameter asserts that reads/writes through that reference are observable side effects that the optimizer must not reorder, merge, hoist, sink, or eliminate.

```loup
@mode(freestanding)

@repr(packed)
struct UartRegs {
    var data: uint8;
    var lsr:  uint8;
}

func uartWrite(@volatile borrow uart: UartRegs, byte: uint8): void {
    while (uart.lsr & 0x20 == 0) {}  // volatile busy-wait
    uart.data = byte                   // volatile store
}
```

`@volatile` is valid only on `borrow`/`borrow[~name]` parameters (`E_VOLATILE_NOT_BORROW`) and only in `@mode(freestanding)` (`E_VOLATILE_NOT_FREESTANDING`). `@volatile` does not imply atomicity; use `native.atomic` for atomic hardware access.

### §24.9 `Volatile[T]` — MMIO Type Wrapper

`Volatile[T]` wraps a raw hardware address and enforces volatile semantics on all accesses.

```loup
@mode(freestanding)

let UART_DR = Volatile[uint8].at(0x3F8)

func serialWrite(byte: uint8): void { UART_DR.write(byte) }
func serialRead():  uint8          { return UART_DR.read() }
```

**API:**

```loup
struct Volatile[T] {
    @unsafe("mmio: address must be a valid mapped device register for T")
    pub static func at(addr: uint): Volatile[T]

    pub func read(): T
    pub func write(val: T): void
    // Modify: read-modify-write — NOT atomic; see note below
    pub func modify(f: noescape fn(T): T): void
    pub func addr(): uint
}
```

`T` must be a primitive or `@repr(C)` struct type (`E_VOLATILE_NOT_REPR`).

**`Volatile[T].modify` is not atomic.** The `modify` method performs a volatile read, calls the closure, then performs a volatile write — but these two operations are NOT a single atomic transaction. On multi-core systems, another CPU may write to the same address between the read and the write, causing a lost update. For atomic read-modify-write on multi-core hardware, use `native.atomic.fetchAdd`, `native.atomic.compareExchange`, or similar primitives from the `native.atomic` module (§24.20). Reserve `Volatile[T].modify` for single-core contexts or cases where the device register semantics guarantee that concurrent access cannot occur.

**Hardware barrier after volatile stores.** On weakly-ordered architectures (ARM, RISC-V), a volatile store alone does not guarantee that the peripheral device observes the write before subsequent CPU instructions execute. Follow every volatile store to a device register with `native.atomic.hwFence(MemoryOrder.DeviceRelease)` to insert the required hardware barrier. Example:

```loup
uart.data = byte                                          // volatile store
native.atomic.hwFence(MemoryOrder.DeviceRelease)          // hardware barrier — ARM DSB ST / RISC-V FENCE ow,ow
```

On x86/x86_64, the strong memory model makes this barrier a no-op (the instruction is emitted but elided by the CPU); the code is therefore portable across architectures without performance penalty on x86.

### §24.10 `@repr` — Struct Layout Control

`@repr` controls the memory layout of a struct — essential for hardware register maps, DMA descriptors, and any structure where byte layout is mandated by hardware spec.

```loup
@mode(freestanding)

@repr(C)
struct ElfHeader {
    var e_ident:   tuple[uint8; 16];
    var e_type:    uint16;
    var e_machine: uint16;
    // ... all fields
}

@repr(packed)
struct UdpHeader {
    var src_port:  uint16;
    var dst_port:  uint16;
    var length:    uint16;
    var checksum:  uint16;
}

@repr(transparent)
struct PageTableEntry {
    var raw: uint64;
}
```

| Variant | Meaning |
|---|---|
| `@repr(C)` | C layout: fields in declaration order, each at its ABI alignment. Required for `extern native` structs. |
| `@repr(packed)` | No padding. Potentially unaligned fields. Loup emits unaligned load/store sequences — defined behavior (not UB). |
| `@repr(transparent)` | Single-field wrapper; ABI identical to the inner type. |

Valid in `@mode(freestanding)` and `@mode(host.native)`. In `@mode(web.compiled)`, a Wasm-compatible subset of `@repr` is supported (see §2.6). Using `@repr` in `@mode(web.scripted)`, `@mode(host.scripted)`, or `@mode(host.dual)` is a compile-time error (`E_REPR_NOT_NATIVE`).

### §24.11 `@align` — Alignment Annotations

`@align(n)` specifies minimum alignment in bytes for a struct type, function, or static binding. `n` must be a power of two.

```loup
@mode(freestanding)

@align(4096)
@repr(C)
struct PageTable {
    var entries: tuple[uint64; 512]
}

@align(16)
static IDT: InterruptDescriptorTable = InterruptDescriptorTable.zero()
```

`@align` applies to all instances of the annotated type or binding; the linker inserts padding as needed.

### §24.12 `@section` — ELF/Mach-O Section Placement

`@section("name")` places a function or static binding into the named linker section. The linker script assigns virtual and physical addresses to each named section.

```loup
@mode(freestanding)

@section(".text.boot")
@entry
func _start(): void { ... }

@section(".rodata.strings")
static BANNER: string = "Loup Kernel v1.14"

@section(".data.percpu")
static CPU_STATE: CpuState = CpuState.zero()
```

Valid only in `@mode(freestanding)` (`E_SECTION_NOT_FREESTANDING`).

### §24.13 `@interrupt` — Interrupt Service Routines

`@interrupt` generates the ISR calling convention: saves/restores all registers and returns with `iretq`/`eret`/`mret` rather than a normal return.

```loup
@mode(freestanding)

@repr(C)
struct InterruptFrame {
    let rip: uint64; let cs: uint64; let rflags: uint64;
    let rsp: uint64; let ss:  uint64;
}

@interrupt(arch: "x86_64", has_error_code: true)
func pageFaultHandler(frame: borrow InterruptFrame, error: uint64): void {
    let addr = readCr2()
    handlePageFault(frame, addr, error)
}

@interrupt(arch: "x86_64", has_error_code: false)
func timerHandler(frame: borrow InterruptFrame): void {
    tickClock()
    sendEoi()
}
```

| `arch` | With error code signature | Without error code signature |
|---|---|---|
| `x86_64` | `(borrow InterruptFrame, uint64): void` | `(borrow InterruptFrame): void` |
| `aarch64` | N/A | `(borrow InterruptFrame): void` |
| `riscv64` | N/A | `(borrow InterruptFrame): void` |


**Architecture-specific `InterruptFrame` layouts.** `InterruptFrame` is a built-in `@repr(C)` struct whose fields match the CPU-pushed exception frame for the compilation target architecture. The compiler selects the correct definition based on `--arch`.

**x86_64 (`--arch x86_64`):**

```loup
@repr(C)
struct InterruptFrame {
    let rip:    uint64;  // saved instruction pointer
    let cs:     uint64;  // code segment (padded to 8 bytes)
    let rflags: uint64;  // RFLAGS register
    let rsp:    uint64;  // saved stack pointer (on privilege change)
    let ss:     uint64;  // stack segment (padded to 8 bytes)
}
```

**AArch64 (`--arch aarch64`):**

```loup
@repr(C)
struct InterruptFrame {
    let elr_el1:  uint64;  // exception link register (return address)
    let spsr_el1: uint64;  // saved program status register
    let sp_el0:   uint64;  // EL0 stack pointer (on EL0→EL1 transition)
    let esr_el1:  uint64;  // exception syndrome register (fault info)
}
```

**RISC-V 64-bit (`--arch riscv64`):**

```loup
@repr(C)
struct InterruptFrame {
    let mepc:   uint64;  // machine exception program counter
    let mcause: uint64;  // machine cause register
    let mstatus:uint64;  // machine status register
    let mtval:  uint64;  // machine trap value (fault address or instruction)
}
```

`InterruptFrame` values are produced by the CPU exception mechanism and passed to `@interrupt` functions by the compiler-generated trampoline. User code cannot construct `InterruptFrame` directly — attempting to do so is `E_INTERRUPT_FRAME_CONSTRUCT`.

`@interrupt` functions must not be called directly from Loup code (`E_INTERRUPT_DIRECT_CALL`), must not be `async` (`E_INTERRUPT_ASYNC`), and must return `void` (`E_INTERRUPT_NONVOID`).

### §24.14 `@naked` — Naked Functions

`@naked` suppresses compiler-generated prologue and epilogue. The function body must consist entirely of `asm { }` blocks.

**`@naked` requires `@unsafe` (normative).** Every `@naked` function MUST also be annotated `@unsafe("naked: <reason>")`. The reason string SHALL document which calling convention is used and that the programmer has verified register save/restore correctness. A `@naked` function without `@unsafe` is `E_NAKED_NOT_UNSAFE`. The `@unsafe` annotation is the explicit, auditable record that the programmer accepts full responsibility for calling convention correctness, stack alignment, and return instruction selection.

**Error codes.**

| Code | Mode | Condition |
|---|---|---|
| `E_NAKED_NOT_UNSAFE` | Freestanding | `@naked` function declared without `@unsafe("naked: <reason>")` |
| `E_NAKED_NON_ASM` | Freestanding | Non-`asm` statement in a `@naked` function body |
| `E_NAKED_ASYNC` | Freestanding | `@naked` function declared `async` |
| `E_NAKED_NOT_FREESTANDING` | All | `@naked` outside `@mode(freestanding)` |

```loup
@mode(freestanding)

@naked
@unsafe("naked: sysv64 ABI; saves rsp and rbp; returns via ret")
@section(".text.trampoline")
func contextSwitch(from_sp: uint, to_sp: uint): void {
    asm {
        "mov [rdi], rsp"
        "mov [rdi + 8], rbp"
        "mov rsp, [rsi]"
        "mov rbp, [rsi + 8]"
        "ret"
    }
}
```

Additionally, the compiler emits the `naked-missing-return` lint advisory when a `@naked` function's `asm {}` blocks do not contain any string that matches the target architecture's standard return instruction patterns (`"ret"` on x86_64, `"ret"` on AArch64, `"jalr zero, 0(ra)"` on RISC-V). This catches the common mistake of a naked function that falls through.

```loup
@mode(freestanding)

@unsafe("naked: hand-written context-switch prologue/epilogue")
@naked
@section(".text.trampoline")
func contextSwitch(from_sp: uint, to_sp: uint): void {
    asm {
        "mov [rdi], rsp"
        "mov [rdi + 8], rbp"
        "mov rsp, [rsi]"
        "mov rbp, [rsi + 8]"
        "ret"
    }
}
```

**Parameters in `@naked` functions.** A `@naked` function may declare parameters. They are passed to the function per the active calling convention (registers/stack positions, as selected by `@callconv`), but the compiler does NOT generate any code to spill, reload, or otherwise manage them. The function body must use `asm` input operands to access parameter values:

```loup
@mode(freestanding)

@unsafe("naked: hand-written context-switch prologue/epilogue")
@naked
func contextSwitch(from_ctx: uint, to_ctx: uint): void {
    // from_ctx is in rdi, to_ctx is in rsi (sysv64 calling convention)
    asm {
        "mov [rdi], rsp"
        "mov [rdi + 8], rbp"
        "mov rsp, [rsi]"
        "mov rbp, [rsi + 8]"
        "ret"
    }
}
```

Naming a parameter inside a non-`asm` Loup expression (e.g. `let x = from_ctx + 1`) inside a `@naked` function body is `E_NAKED_NON_ASM`.

Any non-`asm` statement in a `@naked` function is `E_NAKED_NON_ASM`. `@naked` functions must not be `async` (`E_NAKED_ASYNC`).

### §24.15 `@callconv` — Calling Convention Override

Overrides the calling convention for a function. The default in freestanding mode is the platform C ABI.

| Convention | Description |
|---|---|
| `C` | Platform default C ABI (default) |
| `sysv64` | System V AMD64 ABI — Linux, macOS x86_64 |
| `win64` | Microsoft x64 ABI — Windows and UEFI on x86_64 |
| `aapcs64` | ARM Procedure Call Standard 64-bit |
| `naked` | Equivalent to `@naked` |
| `interrupt` | Equivalent to `@interrupt` |

```loup
@mode(freestanding)

@callconv(win64)
func efiMain(image: uint64, table: uint64): uint64 { ... }
```

### §24.16 `@allocator` and `@deallocator`

Registers a custom heap allocator. Class construction is a compile-time error without a registered allocator (`E_FREESTANDING_CLASS_NO_ALLOC`). Once registered, class construction may return `unique T` or propagate `AllocError` if the allocator signals failure.

```loup
@mode(freestanding)

@allocator
func kernelAlloc(size: uint64, align: uint64): uint? {
    return slabAllocator.alloc(size, align)  // returns None if pool exhausted
}

@deallocator
func kernelFree(ptr: uint, size: uint64, align: uint64): void {
    slabAllocator.free(ptr, size, align)
}
```

**Signatures (normative):** `@allocator` must be `(size: uint64, align: uint64): uint?` (`E_ALLOCATOR_SIG`). The `?` return type is mandatory — an allocator whose return type is plain `uint` (without `?`) is `E_ALLOCATOR_SIG_V16`, not `E_ALLOCATOR_SIG`; `E_ALLOCATOR_SIG` covers other signature violations (wrong parameter count or types). A `None` return from the allocator signals allocation failure; the compiler maps this to `AllocError` (§26.1) and propagates it via `?` at every class-construction call site that is inside an error-propagating context, or panics (via `--panic` policy) if no propagation context is available.

`@deallocator` must be `(ptr: uint, size: uint64, align: uint64): void` (`E_DEALLOCATOR_SIG`). At most one of each per compilation unit. `@allocator` without a matching `@deallocator` is `E_ALLOCATOR_UNPAIRED`. `consume` on `unique class` values is always `E_UNIQUE_CLASS_CONSUME` in freestanding mode — ARC is unavailable.

`native.mem.alloc` gains a fallible sibling `native.mem.tryAlloc(n: uint64, align: uint64): Result[uint, AllocError]` that returns `Err(AllocError)` on failure without panicking. The existing `native.mem.alloc` retains its panic-on-failure behavior for backward compatibility.

### §24.17 `MaybeUninit[T]` — Uninitialized Memory

`MaybeUninit[T]` represents memory that may not yet be initialized — the safe mechanism for hardware-provided data, DMA buffers, and C-style out-parameter patterns.

```loup
@mode(freestanding)

var pt: MaybeUninit[PageTable] = MaybeUninit.uninit()
let raw = pt.rawPtr()
native.mem.zero(raw, size_of[PageTable]())

@unsafe("init: PageTable zeroed; all fields valid")
let table = pt.assumeInit()
```

**API:**

```loup
struct MaybeUninit[T] {
    pub static func uninit(): MaybeUninit[T]
    pub static func zeroed(): MaybeUninit[T]
    pub static func new(val: T): MaybeUninit[T]
    pub func rawPtr(): uint

    @unsafe("init: all fields of T written before calling")
    pub func assumeInit(): T

    @unsafe("init: fields may be partial; caller asserts validity")
    pub func assumeInitRef(): borrow T
}
```

**`assumeInit()` return ownership.** `assumeInit(): T` returns `T` by value. For primitive and `@repr(C)` struct types — the only permitted `T` values — this is a plain value copy. No ownership transfer or ARC retain occurs; the returned value is an independent copy of the bytes in the `MaybeUninit` storage. In `@mode(freestanding)` with an `@allocator` registered, `MaybeUninit[T]` may not be instantiated with a class type `T` (classes require the allocator path, not `MaybeUninit`) — `T` is restricted to primitives and `@repr(C)` structs.

Available in `@mode(host.native)` and `@mode(freestanding)`. `T` must be a primitive or `@repr(C)` type (`E_MAYBUNINIT_NOT_REPR`).

### §24.17a `PartialInit[T]` — Field-Tracked Struct Initialization

*(This section is normative. Applies to `@mode(host.native)` and `@mode(freestanding)`.)*

`PartialInit[T]` wraps a struct under construction and tracks which fields have been initialized at compile time. Reading an uninitialized field is a compile-time error (`E_PARTIAL_INIT_READ`). Calling `complete()` consumes the partial init and produces a fully initialized `T`, verifying completeness at compile time for structs of statically-known layout.

This closes the partial-initialization gap in `MaybeUninit[T]`: rather than relying on a single `@unsafe("init: all fields written")` assertion, each field write is individually tracked.

```loup
@mode(freestanding)

@repr(C)
struct NetworkHeader {
  var srcPort:  uint16;
  var dstPort:  uint16;
  var length:   uint16;
  var checksum: uint16;
}

func buildHeader(src: uint16, dst: uint16, len: uint16): NetworkHeader {
  var p = PartialInit[NetworkHeader].begin()
  p.set(.srcPort,  src)
  p.set(.dstPort,  dst)
  p.set(.length,   len)
  p.set(.checksum, 0u16)
  return p.complete()   // ✓ all fields set
}

// Compile-time error — .checksum not set:
func badHeader(src: uint16, dst: uint16, len: uint16): NetworkHeader {
  var p = PartialInit[NetworkHeader].begin()
  p.set(.srcPort, src)
  p.set(.dstPort, dst)
  return p.complete()   // ✗ E_PARTIAL_INIT_INCOMPLETE — .length and .checksum not set
}
```

**`field_ref[T, F]` — compile-time field reference.** `field_ref[T, F]` is a compile-time type representing a reference to a specific field `F` on struct type `T`. Field references are produced with the `.fieldName` dot-literal syntax in a `PartialInit.set` call and are resolved entirely at compile time — they have zero runtime representation. `field_ref` is not a first-class value type; it can only appear as a `PartialInit.set` argument.

**API:**

```loup
struct PartialInit[T] {
  pub static func begin(): PartialInit[T]
  pub func set[F](field: field_ref[T, F], value: F): void
  pub func complete(): T    // compile-time error if any field unset (E_PARTIAL_INIT_INCOMPLETE)
  pub func isComplete(): bool  // runtime check — always true before complete() or compile-time verified
}
```

`T` must be a `@repr(C)` struct type (`E_PARTIAL_INIT_NOT_REPR`). Available in `@mode(host.native)` and `@mode(freestanding)`.

| Code | Mode | Condition |
|---|---|---|
| `E_PARTIAL_INIT_READ` | host.native, freestanding | Reading a field of a `PartialInit[T]` that has not yet been set via `.set()` |
| `E_PARTIAL_INIT_INCOMPLETE` | host.native, freestanding | `complete()` called before all fields are set |
| `E_PARTIAL_INIT_NOT_REPR` | host.native, freestanding | `PartialInit[T]` with a non-`@repr(C)` struct type |
| `E_FIELD_REF_INVALID` | host.native, freestanding | `.fieldName` in `PartialInit.set` does not name a field of `T` |

### §24.18 `reinterpret[T, U]` — Type-Safe Memory Reinterpretation

`reinterpret[T, U](value)` reinterprets the bit pattern of a value of type `T` (the source type) as type `U` (the target type) without conversion — stricter than Rust's `transmute` because size/alignment mismatch is always a compile-time error rather than a lint warning.

```loup
@mode(freestanding)

@unsafe("transmute: float bit-pattern extraction")
let bits: uint32 = reinterpret[float32, uint32](f)
```

**Rules:**
- `size_of[T]()` must equal `size_of[U]()` (`E_REINTERPRET_SIZE_MISMATCH`).
- `align_of[T]()` must equal `align_of[U]()` (`E_REINTERPRET_ALIGN_MISMATCH`).
- Both `T` and `U` must be primitives or `@repr(C)` types (`E_REINTERPRET_NOT_REPR`).
- Always requires `@unsafe` with a reason string (`E_REINTERPRET_NOT_UNSAFE`).
- Available in all modes (§2.6).

**Alignment warning.** The compiler emits the `reinterpret-align-upcast` lint advisory when `align_of[U]() > align_of[T]()` is statically provable — for example, casting a `uint8` to a `uint64`. Misaligned access via `reinterpret` is the programmer's responsibility; the advisory makes the risk visible at the call site.

**`reinterpretChecked[T, U](value: T): Result[U, AlignmentError]` (normative). `T` is the source type of the input value; `U` is the desired target type.** This is the safe default variant. It performs the same compile-time size/alignment checks as `reinterpret[T, U]` and additionally verifies at runtime that the source value's address satisfies `align_of[U]()`. On alignment failure it returns `Err(AlignmentError)` rather than producing undefined behavior. `reinterpretChecked` does not require `@unsafe`. Use `reinterpret[T, U]` with `@unsafe` only when the caller has externally verified alignment through means invisible to the compiler.

```loup
// Safe default — checked at runtime
let result = reinterpretChecked[uint32, float32](rawBits)
match result {
  Ok(f)  => processFloat(f),
  Err(e) => panic(e.message),
}

// Unsafe shortcut — programmer asserts alignment is correct
@unsafe("transmute: float bit-pattern extraction; f is 4-byte aligned by construction")
let bits: uint32 = reinterpret[float32, uint32](f)
```

`AlignmentError extends RuntimeError` (§26.1) and is catchable.

### §24.19 Integer Overflow Arithmetic Methods

All fixed-width integer types (`int8`–`int64`, `uint8`–`uint64`) gain three method families in all execution modes.

**Checked — returns `Option[T]`:**

```loup
let result = uint8.checkedAdd(250u8, 10u8)    // Option[uint8]: None
let result = uint8.checkedSub(250u8, 10u8)    // Option[uint8]: Some(240)
let result = uint8.checkedMul(250u8, 10u8)    // Option[uint8]: None
let result = uint8.checkedDiv(250u8, 10u8)    // Option[uint8]: Some(25)
```

**Wrapping — always succeeds, wraps on overflow:**

```loup
let result = uint8.wrappingAdd(250u8, 10u8)   // uint8: 4
let result = uint8.wrappingSub(250u8, 10u8)   // uint8: 240
let result = uint8.wrappingMul(250u8, 10u8)   // uint8: 132
```

**Saturating — clamps to min/max:**

```loup
let result = uint8.saturatingAdd(250u8, 10u8) // uint8: 255
let result = uint8.saturatingSub(250u8, 10u8) // uint8: 240
let result = uint8.saturatingMul(250u8, 10u8) // uint8: 255
```

The naming convention is `TypeName.family(a, b)`. These methods are available in all execution modes. In `@mode(host.scripted)` and `@mode(web.compiled)`, plain `+`, `-`, `*` on fixed-width integers throw `NumericOverflowError` on overflow; the explicit methods let callers express their intent without relying on exceptions. In `@mode(host.native)` and `@mode(freestanding)`, plain arithmetic wraps by default, making `checkedAdd` and `saturatingAdd` the primary tools for defensive numeric code.

**`--overflow=trap` build flag.** When set, plain `+`, `-`, `*`, `/` on fixed-width integers trap on overflow in all build configurations. The explicit method families remain available alongside this flag.

### §24.20 Available Standard Library Subset

| Module | Description |
|---|---|
| `core.math` | Pure math functions — no heap |
| `core.text` | UTF-8 string operations on borrowed slices — no allocation |
| `native.mem` | Raw memory operations (see API below) |
| `native.simd` | SIMD vector types and intrinsics |
| `native.atomic` | Atomic load, store, CAS, fetch-add |
| `native.ffi` | C FFI utilities: size/align queries, pointer arithmetic, `PinnedRef`, `OwnedHandle`, `BorrowedHandle` |
| `native.dma` | DMA buffer ownership API — exclusive CPU/DMA access (see below) |
| `native.mpu` | MPU stack-guard installation — freestanding only (see below) |
| `debug.freestanding` | Freestanding debug service — `--debug` builds only; `E_FREESTANDING_MODULE` in release builds. Provides `debug.freestanding.start(cfg)` and `debug.freestanding.poll()` (§24.25) |

**`native.mem` API (freestanding and native):**

```loup
// Copy n bytes from src to dst (may overlap — uses memmove semantics)
func native.mem.copy(dst: uint, src: uint, n: uint64): void

// Zero n bytes starting at ptr
func native.mem.zero(ptr: uint, n: uint64): void

// Compare n bytes at a and b; returns 0 if equal, <0 if a < b, >0 if a > b
func native.mem.compare(a: uint, b: uint, n: uint64): int32

// Allocate n bytes with the given alignment via the registered @allocator.
// Panics if no @allocator is registered or allocation fails.
func native.mem.alloc(n: uint64, align: uint64): uint

// Free a pointer previously returned by native.mem.alloc.
func native.mem.free(ptr: uint, n: uint64, align: uint64): void
```

**`native.atomic` API (freestanding and native):**

```loup
// Atomic load with acquire ordering
func native.atomic.load[T](ptr: uint): T

// Atomic store with release ordering
func native.atomic.store[T](ptr: uint, val: T): void

// Atomic fetch-add; returns the previous value
func native.atomic.fetchAdd[T](ptr: uint, val: T): T

// Atomic fetch-sub; returns the previous value
func native.atomic.fetchSub[T](ptr: uint, val: T): T

// Compare-and-swap; returns true if the swap occurred
func native.atomic.compareExchange[T](ptr: uint, expected: T, desired: T): bool

// Compiler fence — prevents reordering of memory accesses across the fence.
// Prevents the COMPILER from reordering memory accesses; does not insert a hardware barrier instruction.
func native.atomic.fence(): void

// Save the current interrupt enable state and return it as an opaque uint.
// Used with writeInterruptFlags to implement save/restore critical sections.
// @mode(freestanding) only.
func native.atomic.readInterruptFlags(): uint

// Restore interrupt enable state saved by readInterruptFlags.
// @mode(freestanding) only.
func native.atomic.writeInterruptFlags(flags: uint): void

// Hardware memory barrier — inserts the architecture-specific barrier instruction.
// Required after volatile MMIO writes on weakly-ordered architectures (ARM, RISC-V).
// order: Acquire | Release | AcquireRelease | SeqCst | DeviceRelease
func native.atomic.hwFence(order: MemoryOrder): void
```

**`MemoryOrder` enum:**

```loup
namespace native.atomic;

enum MemoryOrder {
  // Prevent loads from being reordered before this point.
  Acquire;
  // Prevent stores from being reordered after this point.
  Release;
  // Both Acquire and Release.
  AcquireRelease;
  // Full sequentially consistent barrier — strongest ordering.
  SeqCst;
  // Device memory barrier — maps to DSB ST (ARM) / FENCE ow,ow (RISC-V) / SFENCE (x86_64).
  // Use after volatile writes to peripheral registers to ensure the device observes the write.
  DeviceRelease;
}
```

The normative MMIO pattern requiring a hardware barrier after a volatile store:

```loup
uart.data = byte                              // volatile store (optimizer-barrier)
native.atomic.hwFence(MemoryOrder.DeviceRelease)  // hardware-barrier (CPU reorder-barrier)
```

`T` must be a fixed-width integer type (`uint8`, `uint16`, `uint32`, `uint64`, `int8`, `int16`, `int32`, `int64`) or a pointer-sized type. Atomic operations on `T` that is not naturally aligned are `E_ATOMIC_UNALIGNED`.

**`native.mem` addition — `tryAlloc` (normative):**

```loup
// Fallible allocation: returns Ok(ptr) or Err(AllocError) without panicking.
func native.mem.tryAlloc(n: uint64, align: uint64): Result[uint, AllocError]
```

**`native.dma` API (freestanding only):**

`native.dma.DmaBuffer[T]` models DMA buffer ownership using Loup's ownership verb system. The CPU and the DMA controller cannot access the buffer simultaneously — the `startTransfer` call acquires an exclusive `edits` borrow that blocks CPU access for the transfer duration.

```loup
namespace native.dma;

// Allocate a cache-coherent, page-aligned DMA buffer for n elements of T.
// Returns Err(AllocError) if the DMA-capable region is exhausted.
func alloc[T](n: int): Result[DmaBuffer[T], AllocError]

unique class DmaBuffer[T] : Any {
  // Length in elements.
  pub func len(): int

  // CPU read access — valid only when no active DmaTransfer holds the buffer.
  pub func read(index: int): T

  // CPU write access — valid only when no active DmaTransfer holds the buffer.
  pub modifier write(index: int, value: T): void

  // Begin a DMA transfer. Returns an exclusive handle; CPU access is blocked
  // until DmaTransfer.complete() or DmaTransfer.abort() is called.
  // E_DMA_BUFFER_ACTIVE if a transfer is already in progress.
  pub func startTransfer(edits self, controller: DmaController, dest: uint): DmaTransfer[T]
}

unique class DmaTransfer[T] : Any {
  // Wait for transfer completion (synchronous busy-wait or interrupt-driven depending on controller).
  // Releases the edits borrow on the buffer; CPU access is re-enabled.
  pub func complete(): void

  // Abort the transfer immediately. Buffer contents are undefined; CPU access is re-enabled.
  pub func abort(): void
}
```

**`native.mpu` API (freestanding only):**

```loup
namespace native.mpu;

// Install a stack guard region. Accesses to [guardBase, guardBase+guardSize) trap as a fault.
// The @panic_handler receives PanicSource.StackOverflow when this guard fires.
// Returns Err if the MPU does not support the requested region configuration.
func installStackGuard(stackTop: uint, guardSize: uint): Result[void, MpuError]

// Remove a previously installed guard region.
func removeStackGuard(stackTop: uint): void

enum MpuError {
  NotSupported;    // platform MPU does not support guard pages
  RegionConflict;  // requested region overlaps an existing MPU region
  AlignmentError;  // base or size not aligned to MPU region requirements
}
```

All other standard library modules are unavailable (`E_FREESTANDING_MODULE`).

### §24.21 `.lppkg` Extensions for Freestanding

```toml
[build]
mode     = "freestanding"
target   = "freestanding"
arch     = "x86_64"
panic    = "custom"           # halt | abort | custom

[linker]
script   = "kernel.ld"       # path to linker script
entry    = "_start"           # entry symbol (matches @entry)
map      = "kernel.map"       # optional: emit linker map

[freestanding]
stack_size  = 65536           # NORMATIVE: stack size in bytes; must be page-size multiple
                              # The linker script SHALL reserve this many bytes for the stack region.
                              # Affects MPU guard placement when native.mpu.installStackGuard is called.
no_float    = true            # forbid float/float32/float64/decimal
no_simd     = false           # allow SIMD (requires FPU save in context switch)
overflow    = "trap"          # wrap | trap
double_fault = "halt"         # halt | reset | nop — see §24.6 --double-fault flag

# Debug portal configuration (--debug builds only; ignored in release)
portal_ring_size         = 4096   # bytes; JTAG-readable fallback ring buffer (default 4096)
                                   # Set to 0 to suppress BSS allocation
portal_trace_buffer_size = 8192   # bytes; trace channel DMA staging buffer (default 8192)
portal_filter            = ["*"]  # compile-time glob prune of activation table
                                   # e.g. ["mykernel.irq.*", "mykernel.boot"]
                                   # Unmatched portals stripped as in release
```

**`portal_ring_size`** — statically allocated in the `.debug_ring` linker section. Used as the sole trace store when no `@debug_trace_channel` is provided; readable by JTAG/OpenOCD without a live host connection. Set to `0` to suppress allocation when BSS space is critical.

**`portal_trace_buffer_size`** — staging buffer between portal event emission and `FreestandingTraceChannel.write`. Flushed when the buffer reaches `traceFlushThreshold` bytes or `traceFlushIntervalUs` microseconds elapse (configured in `FreestandingDebugConfig`).

**`portal_filter`** — glob patterns matched at compile time against fully-qualified portal names. Only matching portals are included in the activation table and instrumented. Default `["*"]` includes all portals.

**`no_float = true`** forbids all floating-point types in `@mode(freestanding)` source. Use is `E_FREESTANDING_FLOAT`. Critical on x86_64 where FPU state must be saved explicitly; most kernels forbid FP in kernel mode to avoid the overhead.

### §24.22 Freestanding Error Codes

| Code | Condition |
|---|---|
| `E_FREESTANDING_ARC` | ARC feature used in freestanding mode |
| `E_FREESTANDING_RUNTIME` | Feature requiring a linked runtime library used in freestanding mode (`bigint`, `decimal`, `runtime` object, or other runtime-backed stdlib) |
| `E_FREESTANDING_ASYNC` | `async`/`await`/`Task[T]`/`spawn` used in freestanding mode |
| `E_FREESTANDING_EXCEPTIONS` | `throw`/`try`/`catch` used in freestanding mode |
| `E_FREESTANDING_FENCE` | Template fence used in freestanding mode |
| `E_FREESTANDING_UI` | `ui.*` module used in freestanding mode |
| `E_FREESTANDING_REFLECT` | `core.reflect`/`core.inspect` used in freestanding mode |
| `E_FREESTANDING_DYNAMIC` | `dynamic class`/`!{}` used in freestanding mode |
| `E_FREESTANDING_PORTAL` | `portal` statement in a release freestanding build (portals unconditionally stripped) |
| `E_FREESTANDING_PORTAL_NO_CHANNEL` | `portal` in `--debug` freestanding build but no channel or ring buffer configured |
| `E_FREESTANDING_PORTAL_CONDITION` | Condition expression on a `portal` statement in `@mode(freestanding)` |
| `E_FREESTANDING_CONTROL_CHANNEL_SIG` | `@debug_control_channel` function has wrong signature or return type |
| `E_FREESTANDING_CONTROL_CHANNEL_DUPLICATE` | Multiple `@debug_control_channel` function definitions |
| `E_FREESTANDING_TRACE_CHANNEL_SIG` | `@debug_trace_channel` function has wrong signature or return type |
| `E_FREESTANDING_TRACE_CHANNEL_DUPLICATE` | Multiple `@debug_trace_channel` function definitions |
| `E_FREESTANDING_DEBUG_START_RELEASE` | `debug.freestanding.start()` or `debug.freestanding.poll()` called in a release build |
| `E_FREESTANDING_CLASS_NO_ALLOC` | Class constructed without `@allocator` |
| `E_FREESTANDING_MODULE` | Prohibited stdlib module imported |
| `E_FREESTANDING_IMPORT_NATIVE` | `@mode(freestanding)` file imports a `@mode(host.native)` module |
| `E_FREESTANDING_IMPORT_MANAGED` | `@mode(freestanding)` file imports a `@mode(web.compiled)` or `@mode(host.scripted)` module |
| `E_NATIVE_IMPORT_FREESTANDING` | `@mode(host.native)` file imports a `@mode(freestanding)` module |
| `E_FREESTANDING_FLOAT` | Float type used when `no_float = true` |
| `E_ENTRY_DUPLICATE` | Multiple `@entry` functions |
| `E_ENTRY_NONVOID` | `@entry` has non-`void` return type |
| `E_ENTRY_PARAMS` | `@entry` has parameters |
| `E_ENTRY_NOT_FREESTANDING` | `@entry` outside `@mode(freestanding)` |
| `E_PANIC_HANDLER_SIG` | `@panic_handler` wrong signature |
| `E_PANIC_HANDLER_MISSING` | `--panic=custom` with no `@panic_handler` |
| `E_PANIC_HANDLER_DUPLICATE` | Multiple `@panic_handler` functions |
| `E_PANIC_HANDLER_NOT_FREESTANDING` | `@panic_handler` outside `@mode(freestanding)` |
| `E_PANIC_HANDLER_REENTRANT` | `@panic_handler` calls a function that can panic |
| `E_ASM_OPERAND_TYPE` | ASM output operand type incompatible with constraint |
| `E_ASM_NOT_COMPILED` | `asm { }` in `@mode(web.scripted)`, `@mode(host.scripted)`, or `@mode(host.dual)` — `asm { }` is available only in `@mode(web.compiled)` (Wasm form, `@unsafe`), `@mode(host.native)` (native form, `@unsafe`), and `@mode(freestanding)` |
| `E_ASM_EXPIRED_BORROW` | `borrow` value used as `asm` input after its lifetime has ended |
| `E_ATOMIC_UNALIGNED` | `native.atomic` operation on a naturally-unaligned address |
| `E_VOLATILE_NOT_BORROW` | `@volatile` on a non-`borrow` parameter |
| `E_VOLATILE_NOT_FREESTANDING` | `@volatile` outside `@mode(freestanding)` |
| `E_VOLATILE_NOT_REPR` | `Volatile[T]` with non-primitive, non-`@repr(C)` type |
| `E_REPR_NOT_STRUCT` | `@repr` on a non-struct type |
| `E_REPR_NOT_NATIVE` | `@repr` in scripted or compiled mode |
| `E_REPR_TRANSPARENT_MULTI_FIELD` | `@repr(transparent)` struct has multiple non-zero-sized fields |
| `E_EXTERN_STRUCT_NOT_REPR_C` | `extern native` struct without `@repr(C)` |
| `E_EXTERN_JS_NOT_NATIVE` | `extern js` or `@jsexport` used in `@mode(host.native)` or `@mode(freestanding)` — no JavaScript runtime present |
| `E_ALIGN_NOT_POWER_OF_TWO` | `@align(n)` where `n` is not a power of two |
| `E_ALIGN_TOO_SMALL` | `@align(n)` less than the type's natural ABI alignment |
| `E_SECTION_INVALID_NAME` | `@section` name contains invalid characters |
| `E_SECTION_NOT_FREESTANDING` | `@section` outside `@mode(freestanding)` |
| `E_INTERRUPT_NONVOID` | `@interrupt` function non-`void` return type |
| `E_INTERRUPT_DIRECT_CALL` | `@interrupt` function called directly |
| `E_INTERRUPT_ASYNC` | `@interrupt` function declared `async` |
| `E_INTERRUPT_NOT_FREESTANDING` | `@interrupt` outside `@mode(freestanding)` |
| `E_INTERRUPT_FRAME_CONSTRUCT` | User code attempts to construct `InterruptFrame` directly |
| `E_NAKED_NON_ASM` | `@naked` function body contains non-`asm` statement |
| `E_NAKED_ASYNC` | `@naked` function declared `async` |
| `E_NAKED_NOT_FREESTANDING` | `@naked` outside `@mode(freestanding)` |
| `E_CALLCONV_NOT_FREESTANDING` | `@callconv` outside `@mode(freestanding)` |
| `E_ALLOCATOR_SIG` | `@allocator` wrong signature |
| `E_DEALLOCATOR_SIG` | `@deallocator` wrong signature |
| `E_ALLOCATOR_DUPLICATE` | Multiple `@allocator` functions |
| `E_DEALLOCATOR_DUPLICATE` | Multiple `@deallocator` functions |
| `E_ALLOCATOR_UNPAIRED` | `@allocator` without `@deallocator` or vice versa |
| `E_ALLOCATOR_NOT_FREESTANDING` | `@allocator`/`@deallocator` outside `@mode(freestanding)` |
| `E_MAYBUNINIT_NOT_REPR` | `MaybeUninit[T]` with non-primitive, non-`@repr(C)` type |
| `E_REINTERPRET_SIZE_MISMATCH` | `reinterpret[T, U]` where `size_of[T]() ≠ size_of[U]()` |
| `E_REINTERPRET_ALIGN_MISMATCH` | `reinterpret[T, U]` where `align_of[T]() ≠ align_of[U]()` |
| `E_REINTERPRET_NOT_REPR` | `reinterpret[T, U]` where `T` or `U` is not primitive or `@repr(C)` |
| `E_REINTERPRET_NOT_UNSAFE` | `reinterpret[T, U]` without `@unsafe` annotation |
| `E_SIZE_OF_UNSIZED` | `size_of[T]()` or `align_of[T]()` applied to an unsized type |
| `E_SIZE_OF_CLASS` | `size_of[T]()` or `align_of[T]()` applied to a managed class type |
| `E_DMA_BUFFER_ACTIVE` | `DmaBuffer[T]` operation attempted while a `DmaTransfer` holds the exclusive borrow |
| `E_INTERRUPT_SAFE_VIOLATION` | Non-`@interruptSafe` operation inside an `@interruptSafe` function |
| `E_INTERRUPT_GUARD_NOT_FREESTANDING` | `InterruptGuard` used outside `@mode(freestanding)` |
| `E_INTERRUPT_GUARD_NESTED` | `InterruptGuard` scopes nested — inner guard re-enables interrupts before outer exits; use save/restore pattern |
| `E_ALLOCATOR_SIG_V16` | `@allocator` return type is not `uint?` — missing `?` makes allocation failure undetectable |

*(Error codes for cross-mode features introduced in v1.16 — `E_ATOMIC_AWAIT`, `E_ATOMIC_NOT_WASM`, `E_LOCK_ORDER_*`, `E_CROSS_BOUNDARY_CYCLE`, `E_NAKED_NOT_UNSAFE`, `E_PARTIAL_INIT_*`, `E_FIELD_REF_INVALID`, `E_SIGNAL_SAFE_NOT_NATIVE` — are defined in their respective sections: §17.7, §23.4.13, §23.5, §24.14, §24.17a, §26.9, §27.16.)*

### §24.23 Example — x86_64 Kernel Stub

```loup
@mode(freestanding)

import native.mem
import native.atomic

// ── Hardware layouts ──────────────────────────────────────────────────────

@repr(packed) @align(1)
struct UartRegs {
    var data: uint8; var ier: uint8; var iir: uint8; var lcr: uint8;
    var mcr: uint8;  var lsr: uint8; var msr: uint8; var scr: uint8;
}

@repr(C)
struct InterruptFrame {
    let rip: uint64; let cs: uint64; let rflags: uint64
    let rsp: uint64; let ss:  uint64
}

// ── UART driver ───────────────────────────────────────────────────────────

let COM1 = Volatile[UartRegs].at(0x3F8)

func serialWrite(s: string): void {
    for (c in s) {
        while (COM1.read().lsr & 0x20 == 0) {}
        COM1.modify(func(r) => r with { data = c as uint8 })
    }
}

// ── CPU helpers ───────────────────────────────────────────────────────────

func readCr2(): uint64 {
    var cr2: uint64 = 0
    asm { "mov rax, cr2"  out: cr2 = "=a"  clobbers: [] }
    return cr2
}

// ── Interrupt handlers ────────────────────────────────────────────────────

@interrupt(arch: "x86_64", has_error_code: true)
func pageFaultHandler(frame: borrow InterruptFrame, error: uint64): void {
    serialWrite("PAGE FAULT
")
    while (true) { asm { "hlt" } }
}

@interrupt(arch: "x86_64", has_error_code: false)
func timerHandler(frame: borrow InterruptFrame): void {
    tickClock()
    sendEoi()
}

// ── Panic handler ─────────────────────────────────────────────────────────

@panic_handler
func kernelPanic(msg: string, file: string, line: int): void {
    serialWrite("PANIC: ")
    serialWrite(msg)
    serialWrite("\n")
    asm { "cli" }
    while (true) { asm { "hlt" } }
}

// ── Kernel entry ──────────────────────────────────────────────────────────

func kernelMain(): void {
    serialWrite("Loup kernel v1.17\n")
    // Load IDT, enable interrupts ...
    asm { "sti" }
    while (true) { asm { "hlt" } }
}

@unsafe("naked: kernel entry point, hand-written stack setup before any Loup code runs")
@entry @naked @section(".text.boot")
func _start(): void {
    asm {
        ".global _start"
        "lea rsp, [__stack_top]"
        "xor rbp, rbp"
        "call kernelMain"
        "cli"
        "1: hlt"
        "jmp 1b"
    }
}
```

**Corresponding `.lppkg`:**

```toml
[package]
name    = "mykernel"
version = "0.1.0"

[build]
mode  = "freestanding"
target = "freestanding"
arch  = "x86_64"
panic = "custom"

[linker]
script = "kernel.ld"
entry  = "_start"
map    = "kernel.map"

[freestanding]
stack_size = 65536
no_float   = true
overflow   = "trap"
```


### §24.24 `@interruptSafe` Annotation and `InterruptGuard`

*(This section is normative. Applies to `@mode(freestanding)` only.)*

#### §24.24.1 `@interruptSafe` — Interrupt-Context Safety Annotation

`@interruptSafe` declares that a function may be called from an interrupt handler context. The compiler enforces that `@interruptSafe` functions access `static var` bindings only through `native.atomic` operations — direct field reads or writes on a `static var` inside an `@interruptSafe` context are `E_INTERRUPT_SAFE_VIOLATION`.

This annotation closes the interrupt-reentrancy gap: a mutable global accessed from both the main loop and an interrupt handler is a data race that Loup's ownership system does not track by default. `@interruptSafe` makes the constraint statically enforced.

```loup
@mode(freestanding)

static var interruptCount: uint64 = 0

// ✓ @interruptSafe — accesses static var only via native.atomic
@interruptSafe
func onTimerIrq(): void {
    native.atomic.fetchAdd[uint64](
        native.ffi.addrOf(interruptCount),
        1u64
    )
}

// ✗ E_INTERRUPT_SAFE_VIOLATION — direct access to static var
@interruptSafe
func badIrqHandler(): void {
    interruptCount += 1   // not atomic — E_INTERRUPT_SAFE_VIOLATION
}
```

`@interruptSafe` functions may not call non-`@interruptSafe` functions. This transitively ensures the entire call tree is interrupt-safe. The `interrupt-unsafe-call` lint fires when a non-`@interruptSafe` function is called from an `@interruptSafe` context.

`@interrupt`-annotated ISR entry points (§24.13) are implicitly `@interruptSafe`.

#### §24.24.2 `InterruptGuard` — Interrupt-Masking Critical Section

`InterruptGuard` implements `Scoped[void]` and masks interrupts for the duration of its lexical scope. This provides mutual exclusion between the main execution path and interrupt handlers without requiring a runtime mutex.

```loup
namespace native.freestanding;

class InterruptGuard : Any implements Scoped[void] {
  // Disable interrupts (architecture-specific: CLI on x86_64, MSR DAIF on AArch64, CSRCI mstatus.MIE on RISC-V).
  pub static func disable(): InterruptGuard

  // Re-enable interrupts and release the guard (called automatically by `with` block exit).
  pub func release(): void
}
```

Usage with `with`:

```loup
@mode(freestanding)

static var sharedCounter: uint32 = 0

func incrementSafely(): void {
    with (g = InterruptGuard.disable()) {
        // Interrupts are masked — access to sharedCounter is race-free
        sharedCounter += 1
    }   // interrupts re-enabled automatically on with-block exit
}
```

`InterruptGuard` is not reentrant — nesting two `InterruptGuard` scopes results in the inner guard re-enabling interrupts on release before the outer guard exits (`E_INTERRUPT_GUARD_NESTED` lint advisory). When nesting is required, use an interrupt-save/restore pattern instead:

```loup
// Save and restore interrupt state across nested calls
let flags = native.atomic.readInterruptFlags()
InterruptGuard.disable()
// ... critical section ...
native.atomic.writeInterruptFlags(flags)
```

`InterruptGuard` is available only in `@mode(freestanding)`. Using it outside freestanding mode is `E_INTERRUPT_GUARD_NOT_FREESTANDING`.

---


### §24.25 Freestanding Debug Service

*(This section is normative. Applies to `@mode(freestanding)` with `--debug` only.)*

#### §24.25.1 Overview

When `loup build --debug --target freestanding` is invoked and at least one debug channel or ring buffer is configured via `.lppkg`, the compiler synthesizes a freestanding debug service that provides:

- A static **activation table** in BSS: one `atomic uint8` per portal, indexed by compile-time portal ID. All entries are zero-initialized. Portal sites perform a single aligned atomic byte load; a zero value is the fast path (inert). Inactive-portal cost: one aligned atomic load per portal site, no branch.
- A read-only **portal name table** in the `.debug_portals` linker section: maps portal IDs to fully-qualified name strings, source file paths, and line numbers. Baked at link time. Analogous to the static metadata table in `@mode(host.native)`.
- A compiler-emitted **`FreestandingDebugFrame`** value constructed at each active portal site and passed to the trace channel or written to the ring buffer.
- An optional **time-travel ring** (`.debug_ttravel` section) — a compiler-synthesized static circular array of `FreestandingDebugFrame` values for post-hoc replay (§24.25.9). This is not a user-instantiable type; it is allocated and managed entirely by the compiler when `timeTravelEnabled = true`.
- An optional **dual-channel debug service** started by calling `debug.freestanding.start()`.

Release builds strip all portal instrumentation, the activation table, the portal name table, the `.debug_ttravel` ring, and the `.debug_ring` fallback ring. No BSS overhead in release.

#### §24.25.2 `FreestandingDebugFrame`

```loup
@repr(C)
struct FreestandingDebugFrame {
    pub let eventKind:  uint8;   // 0=Portal, 1=Call, 2=Return
    pub let portalId:   uint32;
    pub let nameOffset: uint32;  // byte offset into .debug_portals name table
    pub let fileOffset: uint32;  // byte offset into .debug_portals file table
    pub let line:       uint32;
    pub let column:     uint32;
    pub let seqNum:     uint32;  // monotonic sequence number; wraps at uint32 max
}
```

No heap allocation. All pointer-like fields are offsets into read-only link-time sections. `TraceLevel` is always `PortalOnly` in freestanding debug builds — full local-variable capture requires a GC heap and is unavailable. `sizeof(FreestandingDebugFrame) = 28` bytes under `@repr(C)` on all supported targets (1 byte `eventKind` + 3 bytes alignment padding + six `uint32` fields).

`seqNum` is a per-portal monotonically incrementing counter maintained in the activation table's extended slot. The host uses it to detect dropped frames on lossy transports.

#### §24.25.3 Channel Annotations

Two optional annotations provide the compiler with user-supplied transport implementations. Neither is mandatory; §24.25.5 specifies behavior when one or both are absent.

**Transport and configuration types (normative):**

```loup
// Bidirectional control transport; returned by an @debug_control_channel function.
// read/write are function-pointer fields; both are mandatory.
@repr(C)
struct FreestandingControlChannel {
    pub let read:  fn(buf: borrow[~ch] *uint8, len: uint32): uint32;
    pub let write: fn(buf: borrow[~ch] *uint8, len: uint32): uint32;
}

// Unidirectional trace transport; returned by an @debug_trace_channel function.
// write is mandatory; flush is optional (set to None when not needed).
@repr(C)
struct FreestandingTraceChannel {
    pub let write: fn(buf: borrow[~ch] *uint8, len: uint32): uint32;
    pub let flush: Option[fn(): void];
}

// Selects how the debug service polls the control channel for incoming commands.
enum ControlPollMode {
    Polling;    // call debug.freestanding.poll() periodically from user code
    Interrupt;  // control ISR registered via @interrupt handles incoming bytes
}

// Configuration passed to debug.freestanding.start().
struct FreestandingDebugConfig {
    pub let controlPollMode:      ControlPollMode;
    pub let traceFlushThreshold:  uint32;   // flush when N bytes pending; 0 = flush every event
    pub let traceFlushIntervalUs: uint32;   // flush every N µs; 0 = disable timer flush
    pub let timeTravelEnabled:    bool;     // allocate .debug_ttravel ring (§24.25.9)
    pub let timeTravelRingFrames: uint32;   // ring capacity in frames; 0 uses default of 256
}
```

These types are available exclusively in `--debug` freestanding builds. Referencing them in release builds or in non-freestanding modes is `E_FREESTANDING_MODULE`.

**`@debug_control_channel`**

```loup
@debug_control_channel
func myControlChannel(): FreestandingControlChannel {
    return FreestandingControlChannel {
        read:  func(buf: borrow[~ch] *uint8, len: uint32): uint32 { ... },
        write: func(buf: borrow[~ch] *uint8, len: uint32): uint32 { ... },
    }
}
```

Bidirectional. Used for command/response traffic (portal query, activate, deactivate, replay buffer request). Low-volume. Typically backed by UART, semihosting, or a memory-mapped command FIFO.

**`@debug_trace_channel`**

```loup
@debug_trace_channel
func myTraceChannel(): FreestandingTraceChannel {
    return FreestandingTraceChannel {
        write: func(buf: borrow[~ch] *uint8, len: uint32): uint32 { ... },
        flush: func(): void { ... },   // optional; called on buffer drain or flush interval
    }
}
```

Write-only from the target perspective. `flush` is optional; if provided, the compiler calls it when the staging buffer drains or the flush interval elapses (configured in `FreestandingDebugConfig`). Suitable for ITM/SWO over CoreSight, DMA FIFOs, or any high-throughput unidirectional transport.

Both annotations follow the `@panic_handler` error pattern: wrong signature is the `_SIG` error code; multiple definitions is `_DUPLICATE`.

#### §24.25.4 Starting the Debug Service

```loup
// FreestandingDebugConfig field types:
//   controlPollMode:      ControlPollMode   // .Polling or .Interrupt
//   traceFlushThreshold:  uint32            // flush staging buffer when N bytes pending
//   traceFlushIntervalUs: uint32            // flush every N µs; 0 = disable timer flush
//   timeTravelEnabled:    bool              // allocate .debug_ttravel ring (§24.25.9)
//   timeTravelRingFrames: uint32            // ring capacity in frames; default 256

// Example — polling control, 512-byte flush threshold, time-travel enabled:
debug.freestanding.start(FreestandingDebugConfig {
    controlPollMode:      ControlPollMode.Polling,
    traceFlushThreshold:  512u32,
    traceFlushIntervalUs: 0u32,
    timeTravelEnabled:    true,
    timeTravelRingFrames: 256u32,
})
```

`debug.freestanding.start()` is available only in `--debug` builds. Calling it in a release build is `E_FREESTANDING_DEBUG_START_RELEASE`.

`controlPollMode`:
- `ControlPollMode.Interrupt` — the control channel read handler runs in a background interrupt. The user is responsible for registering the ISR via `@interrupt`.
- `ControlPollMode.Polling` — `debug.freestanding.poll()` must be called periodically (from a main loop or cooperative scheduler tick) to service incoming control commands. **`debug.freestanding.poll()` normative behaviour:** reads up to one complete control-channel message per call, dispatches the response (e.g. sends `PORTAL_TABLE` in reply to `QUERY_PORTALS`, activates a portal in reply to `ACTIVATE`), then returns immediately. It is the caller's responsibility to call it often enough that command latency meets the application's requirements. `poll()` is a no-op if no bytes are available on the control channel.

`timeTravelEnabled` — when `true`, the compiler allocates a static circular ring buffer (`.debug_ttravel` BSS section, capacity `timeTravelRingFrames` frames). Each portal event appends a `FreestandingDebugFrame` to the ring regardless of whether a `@debug_trace_channel` is configured. The host retrieves a snapshot of the ring at any time via `READ_REPLAY_BUFFER` over the control channel (§24.25.6). See §24.25.9 for full semantics.

#### §24.25.5 Channel Fallback Matrix

| `@debug_control_channel` | `@debug_trace_channel` | `portal_ring_size` | Behavior |
|---|---|---|---|
| Provided | Provided | Any | Commands over control; trace events stream over trace channel; time-travel ring available if `timeTravelEnabled` |
| Provided | Absent | > 0 | Commands over control; trace events queued in ring buffer; host retrieves via `READ_TRACE_BUFFER` command |
| Provided | Absent | 0 | Commands over control; trace events discarded; time-travel ring available if `timeTravelEnabled` (ring lives in BSS, retrieved via control channel) |
| Absent | Provided | Any | All portals unconditionally active; events stream over trace channel; no runtime activation control; time-travel ring available if `timeTravelEnabled` |
| Absent | Absent | > 0 | Ring buffer only; JTAG memory-read path; no live host connection. If `timeTravelEnabled = true`, the `.debug_ttravel` ring is also allocated and JTAG-readable, but `READ_REPLAY_BUFFER` is unavailable (no control channel) |
| Absent | Absent | 0 | `E_FREESTANDING_PORTAL_NO_CHANNEL` |

The "always-on trace" configuration (fourth row) is the embedded always-on logging path. Dynamic activation control is unavailable because there is no control channel; every portal fires unconditionally for the duration of the debug build.

#### §24.25.6 Control Channel Protocol

Binary protocol over the control channel. All integers little-endian.

**Host → Target:**

| Opcode | Name | Payload |
|---|---|---|
| `0x01` | `QUERY_PORTALS` | — |
| `0x02` | `ACTIVATE` | `portal_id: u32` |
| `0x03` | `DEACTIVATE` | `portal_id: u32` |
| `0x04` | `DEACTIVATE_ALL` | — |
| `0x05` | `READ_TRACE_BUFFER` | `max_bytes: u32` |
| `0x06` | `READ_REPLAY_BUFFER` | `max_frames: u32` — requests time-travel ring contents |

**Target → Host:**

| Opcode | Name | Payload |
|---|---|---|
| `0x81` | `PORTAL_TABLE` | `count: u32`, then `count` × `{id: u32, name_len: u16, name: utf8, file_len: u16, file: utf8, line: u32}` |
| `0x82` | `ACK` | `acked_opcode: u8` |
| `0x83` | `ERR` | `acked_opcode: u8, code: u8` |
| `0x84` | `TRACE_BUFFER_CHUNK` | `len: u16, data: bytes` |
| `0x85` | `REPLAY_BUFFER_CHUNK` | `frame_count: u16`, then `frame_count` × `FreestandingDebugFrame` (§24.25.2) |

#### §24.25.7 Trace Channel Protocol

Target → host only. All integers little-endian.

| Opcode | Name | Payload |
|---|---|---|
| `0x01` | `PORTAL_EVENT` | `id: u32, file_offset: u32, line: u32, column: u32, seq: u32` |
| `0x02` | `CALL_EVENT` | `id: u32, file_offset: u32, line: u32, column: u32, seq: u32` |
| `0x03` | `RETURN_EVENT` | `id: u32, file_offset: u32, line: u32, column: u32, seq: u32` |
| `0xFF` | `TRACE_SYNC` | `seq: u32` |

`seq` is the per-portal sequence number from `FreestandingDebugFrame.seqNum`. `TRACE_SYNC` is emitted periodically (compiler-configurable interval) so the host detects dropped events on lossy transports. The host tracks expected sequence per portal ID; a gap indicates lost frames.

#### §24.25.8 Host Tooling

The `loup debug attach` command connects to a running freestanding debug service:

```
loup debug attach --uart /dev/ttyUSB0 --baud 115200
loup debug attach --tcp 192.168.1.100:2345
loup debug attach --semihosting                          # ARM/RISC-V via debug probe
loup debug attach --uart /dev/ttyUSB0 --trace-swo /dev/ttyUSB1
```

`--trace-swo` (or `--trace-uart`, `--trace-tcp`) specifies a separate transport for the trace channel when control and trace are physically distinct. When only one transport is specified, it carries both channels multiplexed by opcode prefix. After attaching, the host reads the portal name table via `QUERY_PORTALS` and presents the standard portal activation interface.

Time-travel replay is available via `READ_REPLAY_BUFFER` over the control channel when `timeTravelEnabled = true`. The host renders the captured event ring as a portal-level trace timeline with `TraceLevel.PortalOnly` semantics — the same visualization produced by time-travel capture in `@mode(host.native)`. Unlike native mode, the ring buffer resides on-target rather than in host memory, making replay available even after a target reset when using a non-volatile ring placement.

#### §24.25.9 Time-Travel Replay for Freestanding

*(This section is normative.)*

When `FreestandingDebugConfig.timeTravelEnabled = true`, the compiler allocates a static circular ring of `FreestandingDebugFrame` values in the `.debug_ttravel` linker section. The ring size is `timeTravelRingFrames × sizeof(FreestandingDebugFrame)` bytes, statically allocated in BSS.

**Write path.** Each time an active portal fires, the debug service appends a `FreestandingDebugFrame` to the ring (overwriting the oldest frame when full). This write occurs independently of — and in addition to — any `@debug_trace_channel` emission. The ring is therefore populated even in the trace-only and ring-only configurations from §24.25.5. The write is interrupt-safe: the ring uses a lock-free single-producer scheme compatible with `@interruptSafe` portal sites.

**Read path.** The host requests ring contents via the `READ_REPLAY_BUFFER` control command (§24.25.6), receiving up to `max_frames` `FreestandingDebugFrame` records in `REPLAY_BUFFER_CHUNK` response messages. The ring state is not disturbed by a read — the target continues appending; the host receives a snapshot.

**Replay semantics.** Freestanding time-travel is `TraceLevel.PortalOnly` — the ring contains call/return/portal events with source locations, but no local-variable state. The host `loup debug attach` session renders the captured event sequence as a portal-level trace timeline. This is the same visualization produced by `TraceLevel.PortalOnly` capture in `@mode(host.native)`, with the distinction that the ring is stored on-target rather than in host memory.

**Zero-overhead when disabled.** When `timeTravelEnabled = false` (the default), no ring is allocated, no write path code is emitted, and BSS is unaffected. The `READ_REPLAY_BUFFER` opcode returns `ERR` with code `0x01` (feature disabled).

**Ring size guidance.** At `sizeof(FreestandingDebugFrame) = 28` bytes (7 fields, `@repr(C)` padded), a 256-frame ring occupies 7 KB of BSS. For interrupt-dense kernels with short capture windows, 256–1024 frames is typically sufficient. For extended capture across a full boot sequence, 4096 frames (112 KB) or a ring-and-flush strategy via the trace channel is recommended.

**Interaction with `portal_ring_size`.** `portal_ring_size` (§24.21) is the static JTAG-readable fallback ring (readable without a live host). The `.debug_ttravel` time-travel ring is the dynamic ring retrieved via the control channel when `@debug_control_channel` is configured. Both may coexist: the `portal_ring_size` ring stores a JTAG-accessible snapshot; the `.debug_ttravel` ring is the deeper history retrievable via `READ_REPLAY_BUFFER`.

#### §24.25.10 Design Notes

*(This section is non-normative.)*

**Why two channels.** Control and trace have fundamentally different traffic profiles. Control is low-volume and requires ACKs; trace is potentially high-volume and unidirectional. Sharing a channel creates back-pressure coupling: a burst of trace events can starve an incoming `ACTIVATE` command. On ARM targets, the natural split is UART for control and ITM/SWO over CoreSight for trace — ITM is hardware-buffered and DMA-friendly.

**Why dynamic activation is preserved.** The principal value of the portal system is surgical, zero-overhead transient capture. Always-on instrumentation obliterates performance in hot paths — interrupt handlers, scheduler ticks, DMA completion routines. Dynamic activation via the control channel preserves the ability to leave all portals dark during normal operation and activate only the portals of interest for a bounded capture window.

**Zero-overhead guarantee.** The activation table check at each portal site is a single aligned atomic byte load. When the byte is zero the fast path falls through with no branch misprediction penalty on any architecture targeted by freestanding mode. This matches the "observationally inert" guarantee specified in §6.7.

**Time-travel vs. always-on trace.** Always-on trace via `@debug_trace_channel` streams events to the host in real time. The time-travel ring is a circular buffer on-target: it captures the most recent N events regardless of host connectivity. The two are complementary — use the trace channel for live monitoring during normal operation and the time-travel ring to diagnose what happened immediately before an unexpected halt or reset.

---

## §25 Macros and Metaprogramming

*(This section is normative.)*

Loup provides a hygienic macro system for compile-time code generation:

**Hygiene.** Macro-introduced bindings do not capture or shadow caller bindings. The macro body has its own scope. Spliced parameters (`${param}`) are substituted as syntactic AST fragments before name resolution — the caller's names are never visible inside the macro body unless explicitly spliced.

**Expansion timing.** Macros are expanded at compile time before type-checking. Macro output must be well-typed; ill-typed macro output is `E_MACRO_TYPE_ERROR` at the expansion site.

**Typed quasiquotes.** Macros use `quote { }` blocks to construct AST fragments. Inside a `quote` block, `${param}` splices the AST node bound to the named parameter into the output:

```
macro assert_eq(a, b) {
  quote {
    let __left = ${a};
    let __right = ${b};
    if (__left != __right) {
      throw AssertionError(i"Expected {$ __left $} == {$ __right $}");
    }
  }
}

assert_eq!(compute(), expected);
```

**Quasiquote AST categories.** A `quote` block may contain any syntactically valid Loup constructs: statements, expressions, declarations, and type annotations. Splice positions (`${param}`) are resolved by the macro expander using the category of the surrounding syntax — a splice in expression position must receive an expression, a splice in type position must receive a type, and so on. A category mismatch is `E_MACRO_SPLICE_CATEGORY` at the macro declaration site.

**Parameters and arity.** Macro parameters are positional identifiers. Macros do not support default values, rest parameters, or keyword arguments. Invoking a macro with the wrong number of arguments is a compile-time error (`E_MACRO_ARITY`).

| Code | Mode | Condition |
|---|---|---|
| `E_MACRO_TYPE_ERROR` | All | Macro expansion produces ill-typed output — type error at the expansion call site |
| `E_MACRO_SPLICE_CATEGORY` | All | `${param}` splice position category (expression, type, statement) does not match the AST node being spliced |
| `E_MACRO_ARITY` | All | Macro invoked with a different number of arguments than declared parameters |
| `E_MACRO_RECURSIVE` | All | Macro directly or indirectly invokes itself — recursive macros are prohibited |

**Limitations.**
- Macros cannot perform I/O, import modules, or access runtime state.
- Macros cannot be recursive (`E_MACRO_RECURSIVE`; a macro may not invoke itself, directly or indirectly).
- Macros operate on syntactic structure only; they cannot inspect types of their arguments.
- `quote` bodies may not contain `await` or `yield` at the top level (they may appear inside lambdas within the quote body).

**Mode availability.** Macro declarations (`macro`, `pub macro`) and invocations (`name!(...)`) are compile-time features available in all six execution modes. The macro is expanded before type-checking; the expanded output must conform to the restrictions of the target mode. For example, a macro that expands to `throw SomeError(...)` will produce a compile-time error when expanded in a `@mode(freestanding)` file because exceptions are unavailable there.

**Scope and export.** Macro definitions are scoped to the module where they are declared. Export a macro with `pub macro name(...) { ... }`. Consumers import macro names with the standard import syntax; the `!` invocation suffix is used at the call site.

**Rules:**

- Macros are declared with `macro name(params) { ... }` syntax.
- Macros are invoked with `name!(args)` syntax (the `!` distinguishes macro invocations from function calls).
- Macros are a separate compilation phase and cannot perform I/O or runtime operations.
- Macro definitions are scoped to the module where they are declared and can be exported with `pub`.
- The formal grammar for macro declarations and invocations is in §27.11.

---

## §26 Failure Policy

*(This section is normative. This section applies to all modes except `@mode(freestanding)` — specifically `@mode(web.scripted)`, `@mode(web.compiled)`, `@mode(host.scripted)`, `@mode(host.dual)`, and `@mode(host.native)`. In `@mode(freestanding)`, the exception system is unavailable — `throw`, `try`, and `catch` are compile-time errors (`E_FREESTANDING_EXCEPTIONS`). Freestanding failure handling is specified in §24.6 (`@panic_handler` and `--panic` policy).)*

This section consolidates all failure behaviors across the Loup language.

### §26.1 Exception Hierarchy

All exception types extend a root `BaseException` class. The catchable subset extends `Exception`, which itself extends `BaseException`. Not all exceptional conditions are errors — `SystemExit` is a deliberate process termination, `KeyboardInterrupt` is an external signal, and `GeneratorExit` is a generator lifecycle event. These extend `BaseException` directly and are not caught by `catch (Exception)`.

**Serialization contract.** All `BaseException` subclasses have a normative serialization contract (§32.9). Every `BaseException` is implicitly `@polymorphic` — when serialized via `Serializable`, its dynamic type is preserved via the type URI mechanism. Receivers that do not recognize the incoming type URI reconstruct the exception as a `RemoteException` carrying the original URI, message, cause chain, and symbolic stack trace. This design guarantees that exceptions crossing process or language boundaries never silently lose their identity, and that deserialization of unknown exception types can never execute arbitrary code.

```
class BaseException : Any {
  pub let message: string;
  pub let cause: Option[Any];
  pub let stackTrace: list[StackFrame];
}

class Exception : BaseException {}

// RemoteException — see §32.9. Reconstructed from a serialized exception
// whose type URI is not registered as Deserializable on the receiver.
// Carries the originating URI, message, cause chain, and symbolic stack
// trace for diagnostic purposes without exposing a code-execution surface.
class RemoteException : Exception {
  pub let originalTypeUri: string;
  pub let originalFields: dict[string, Any];
}

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
  BridgeDeallocated;    // del was called on a GC↔ARC bridge wrapper; subsequent access throws LifetimeError
}

// Simple marker exceptions — no extra fields beyond BaseException
class TypeError            : Exception {}  // type mismatch at runtime (as, as?, mismatched overload)
class MatchError           : Exception {}  // non-exhaustive match reached end without matching
class AssertionError       : Exception {}  // assert statement failed
class DestructureError     : Exception {}  // list/dict destructure failed (length or key mismatch)
class IndexError           : Exception {}  // sequence index out of range
class KeyError             : Exception {}  // dict key not found
class CancellationError    : Exception {}  // task cancelled via TaskGroup cancellation
class NumericOverflowError : Exception {}  // fixed-width integer overflow in scripted/compiled mode
class IoError              : Exception { pub let code: int; }
class TimeoutError         : Exception {}  // operation timed out (spawnBlocking, etc.)
class RuntimeConfigError   : Exception { pub let field: string; }  // runtime.configure() called after first await
class CapabilityError      : Exception { pub let capability: string; }  // unavailable capability object called
class FfiTypeError         : Exception {}  // FFI boundary type mismatch (extern js / @jsexport)
class WsNetworkError       : Exception {}  // WebSocket network failure
class WsStateError         : Exception {}  // WebSocket operation in wrong connection state

// Root class for runtime-environment faults — distinct from user-domain errors.
// Subclasses include stack overflow, task queue exhaustion, null FFI handle,
// misalignment, and freestanding allocator exhaustion.
class RuntimeError         : Exception {}

// Raised by the runtime on lifetime-violation detection. Inspect `.kind` to
// distinguish the specific check that triggered. See §23.4.14, §23.5, §26.3.
class LifetimeError        : Exception { pub let kind: LifetimeErrorKind; }

class StackOverflowError : RuntimeError {}

class TaskQueueFullError : RuntimeError {
  pub let queueDepth: int;    // configured maxTaskQueueDepth at time of throw
}

class NullHandleError : RuntimeError {
  pub let functionName: string;   // extern native function that returned null
}

class AlignmentError : RuntimeError {
  pub let requiredAlign: int;
  pub let actualAlign: int;
}

class AllocError : RuntimeError {
  pub let requestedSize: uint64;
  pub let requestedAlign: uint64;
}

class StackFrame : Any {
  pub let file: string;
  pub let line: int;
  pub let column: int;
  pub let function: Option[string];
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
        │   ├── StackOverflowError              (web/host: from Wasm trap; native: from stack guard)
        │   ├── TaskQueueFullError              (task queue depth limit exceeded, §17.3/§20.1)
        │   ├── NullHandleError                 (NativeHandle return was null, §18.4)
        │   ├── AlignmentError                  (reinterpretChecked[T,U] alignment mismatch, §24.18)
        │   └── AllocError                      (allocator returned None, §24.16)
        ├── AssertionError
        ├── RuntimeConfigError
        ├── BlockingTimeoutError                (defined in §17.9.3)
        ├── WsNetworkError
        ├── WsStateError
        ├── UrlError                             (disallowed URL scheme or malformed URL, §16.6.4)
        ├── WorkerTerminatedError                 (send/receive on already-terminated ScriptWorker, §17.10.2)
        ├── WorkerPanicError                      (ScriptWorker exited via unhandled exception; carries `message` and `stack`, §17.10.2)
        ├── ValueError                              (value semantically invalid for the operation, e.g. slice step=0)
        ├── GpuCompileError                         (shader/kernel compilation failed, §16.8)
        ├── WorkerTransferError                   (runtime serialization failure during channel transfer or spawnBlocking, §17.10.4)
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

### §26.2 User-Defined Exceptions

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
    super(i"Not found: {$ resource $}", code=404);
  }
}
```

Throwing a value that does not extend `BaseException` is a compile-time error (`E_THROW_NOT_EXCEPTION`).

| Code | Mode | Condition |
|---|---|---|
| `E_THROW_NOT_EXCEPTION` | All | `throw expr` where `expr` has a type that does not extend `BaseException` |

Users MAY extend `BaseException` directly for exceptions that should not be caught by `catch (Exception)`. The compiler SHALL emit a warning when a user-defined type extends `BaseException` directly (rather than `Exception`), advising that the type will not be caught by generic exception handlers.

### §26.3 Exception Categories

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
- `AssertionError` — failed programmer assertion (e.g. from macro-expanded `assert_eq!`)
- `RuntimeError` — general-purpose runtime error for cases not covered by a more specific type
- `RuntimeConfigError` — invalid runtime configuration (e.g. `runtime.configure` called after first `await`)
- `BlockingTimeoutError` — `spawnBlockingWithTimeout` deadline exceeded; carries `timeoutMs: int`
- `ModuleLoadError` — module could not be loaded or instantiated; carries `modulePath`, `compiledAttempted`, `scriptedAttempted`
- `WsNetworkError` — WebSocket network-level error
- `WsStateError` — WebSocket operation in invalid state
- `StackOverflowError` — Wasm call-stack exhaustion (scripted/compiled) or native stack guard fault
- `TaskQueueFullError` — task queue depth limit exceeded; carries `queueDepth: int`
- `NullHandleError` — `extern native` function declared `NativeHandle` (non-optional) returned null
- `AlignmentError` — `reinterpretChecked[T, U]` detected misaligned source value
- `AllocError` — freestanding `@allocator` returned `None`; carries `requestedSize` and `requestedAlign`
- `UrlError` — `Url.of()` rejected a malformed or disallowed URL scheme (e.g. `javascript:`); carries `scheme: string?`
- `WorkerTerminatedError` — `send()` called on a `ScriptWorker` that has already exited (§17.10.2)
- `WorkerPanicError` — `ScriptWorker.join()` awaited a worker that threw an unhandled exception; carries `message: string` and `stack: Option[string]` (§17.10.2)
- `WorkerTransferError` — runtime-level serialization failure while transferring a value across a `ScriptWorker` channel or through `spawnBlocking` (e.g. a cycle in a `Sendable` class) (§17.10.4)

**Runtime exceptions NOT caught by `catch (Exception)` (BaseException-only):**
- `SystemExit` — deliberate process exit request via `runtime.exit(code)`. Carries `code: int`.
- `KeyboardInterrupt` — external interrupt signal (SIGINT). Carries `signal: int`.
- `GeneratorExit` — generator/iterator cleanup when closed before exhaustion.
- `BaseExceptionGroup` — group of exceptions that includes at least one `BaseException`-only subtype.

**Result-based errors (propagated via `?`):**
- Typed, recoverable errors using `Result[T, E]`.
- The `?` operator converts between error types via `From[E]`.

### §26.4 Exception Propagation Rules

- Exceptions propagate up the call stack through `try`/`catch`/`finally` and `defer` blocks.
- ALL `BaseException` subtypes propagate through cleanup frames (`defer`, `with`, `finally`). `BaseException`-only subtypes (`SystemExit`, `KeyboardInterrupt`, `GeneratorExit`) bypass `catch (Exception)` handlers but still execute cleanup.
- `finally` always executes; if `finally` throws, its exception replaces the pending exception with the original attached as `cause`.
- `return`, `break`, `continue` inside `finally` are compile-time errors (`E_FINALLY_CONTROL`).
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

### §26.5 Catch Pattern Matching

The `catch` clause supports union type patterns to catch multiple exception types in a single handler:

```
try {
  riskyOperation();
} catch (TypeError | MatchError as err) {
  // err is typed as TypeError | MatchError
  print(i"Logic error: {$ err.message $}");
} catch (IoError as err) {
  // err is typed as IoError
  print(i"I/O error: {$ err.message $}");
} catch (Exception as err) {
  // catches any remaining Exception subtype
  // does NOT catch SystemExit, KeyboardInterrupt, GeneratorExit
  print(i"Unexpected: {$ err.message $}");
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
  print(i"Exit with code: {$ err.code $}");
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

### §26.6 Template Exceptions

- Hard fail by default for evaluation and formatting errors.
- Buffered `try`/`catch` in template fences.
- `render`/`renderWith` fail if evaluation reaches `await`.
- Parse/lex errors and alignment violations are uncatchable (compile-time errors, not part of the exception hierarchy — they prevent the program from running at all).

### §26.7 Task Failures

- A task that fails and is never awaited becomes an unhandled task failure reported by the runtime.
- `await` on a failed task rethrows the failure.
- In `await group`, a failing child cancels all siblings.
- When multiple tasks fail in a `TaskGroup`, the exceptions are collected into an `ExceptionGroup` (if all are `Exception` subtypes) or a `BaseExceptionGroup` (if any are `BaseException`-only subtypes).

### §26.8 FFI Exceptions

- Outbound: type mismatches at `extern js`/`extern native` boundaries produce `FfiTypeError`.
- Inbound: unmarshalable JS arguments to `@jsexport` functions produce `FfiTypeError`.
- `@jsexport async func` failures cause the returned Promise to reject.

### §26.9 Signal Handling

The runtime provides signal handling for graceful shutdown and interrupt processing on `cli`, `service`, `desktop`, and `native` targets. Signal handling is not available on `browser` or `wasm` targets.

**Default signal behavior:**

| Signal | Default Action |
|---|---|
| `SIGINT` (Ctrl+C) | Raise `KeyboardInterrupt(signal=2)` in the main task |
| `SIGTERM` | Raise `SystemExit(code=143)` in the main task (128 + 15) |
| `SIGHUP` | Raise `SystemExit(code=129)` in the main task (128 + 1) |
| `SIGUSR1` | No-op (available for user handlers) |
| `SIGUSR2` | No-op (available for user handlers) |

**Signal delivery.** When a signal is received, the runtime schedules the handler to execute on the event loop at the next safe point — not inside the OS signal handler context. This ensures that Loup code (including cleanup frames) executes safely.

**Double-interrupt protection.** If a second `SIGINT` is received while a `KeyboardInterrupt` is already propagating (e.g., during cleanup), the runtime force-terminates the process immediately with exit code 130, without further cleanup. This prevents hung cleanup from blocking termination.

**`runtime.exit(code)`.** The `runtime.exit(code: int)` function raises `SystemExit(code)` rather than immediately terminating the process. This allows `defer`, `with`, and `finally` cleanup frames to execute before the process exits. When `SystemExit` reaches the top of the main task without being caught, the process terminates with the specified exit code.

**Custom signal handlers.** The `io.proc` module provides `onSignal(signal, handler)` to register custom signal handlers, `resetSignal(signal)` to restore defaults, and `awaitSignal(signal)` for async signal-driven workflows. See §21.8 for the full API.

**`@signalSafe` annotation (normative, `@mode(host.native)` or `@mode(host.dual)`).** Functions that may be called from OS signal handler context must be annotated `@signalSafe`. The compiler enforces that `@signalSafe` functions do not call any operation that is not signal-safe. The following are NOT signal-safe in Loup and are compile-time errors from a `@signalSafe` context:

- ARC `retain()` / `release()` — ARC operations are not signal-safe
- Any heap allocation — `malloc` and ARC `alloc` are not signal-safe
- Any `synchronized` modifier invocation — acquires a mutex, not signal-safe
- Any `Mutex[T].lock()` or `RwLock[T].writeLock()` — not signal-safe
- `core.reflect` — live runtime registry is not signal-safe
- `io.*` / `net.*` — async I/O primitives are not signal-safe

The following ARE signal-safe and are permitted inside `@signalSafe` contexts:

- `native.atomic.*` operations — all atomic operations are signal-safe
- Writes to `Atomic[T]` fields (§17.8.2) — signal-safe
- `Mutex[T].tryLock()` — non-blocking; signal-safe (may return `None`)
- Static field reads of `let` (immutable) bindings — signal-safe

```loup
@mode(host.native)

let signalFlag = Atomic[bool].new(false)

// ✓ @signalSafe — only touches an Atomic[bool]
@signalSafe
func sigtermHandler(): void {
    signalFlag.store(true)
}

// Register at startup:
io.proc.onSignal(SIGTERM, sigtermHandler)
```

`@signalSafe` is valid in `@mode(host.dual)` and `@mode(host.native)` (see §2.6). Using it in other modes is `E_SIGNAL_SAFE_NOT_NATIVE`. The `signal-unsafe-call` lint fires when a non-`@signalSafe` function is called from a `@signalSafe` context.

**Error codes.**

| Code | Mode | Condition |
|---|---|---|
| `E_SIGNAL_SAFE_NOT_NATIVE` | web.scripted, web.compiled, host.scripted, freestanding | `@signalSafe` annotation used outside `@mode(host.dual)` or `@mode(host.native)` |
| `E_SIGNAL_UNSAFE_CALL` | host.native | Signal-unsafe operation (ARC retain/release, heap allocation, mutex lock, `core.reflect`) inside a `@signalSafe` context |



---

## §27 Grammar

*(This section is normative.)*

This section provides the complete formal grammar for the Loup language in Extended Backus-Naur Form (EBNF). The grammar covers all syntactic constructs defined in this specification. The grammar is target-independent — it applies equally to the Wasm GC+EH bytecode target (§2.1, §22) and the native compilation target (§23). Target-specific semantics (e.g., Wasm type mappings, native ABI conventions) are defined in their respective sections.

**Notation conventions:**

- `::=` defines a production rule.
- `|` separates alternatives.
- `( ... )` groups alternatives.
- `[ ... ]` denotes optional elements (zero or one).
- `{ ... }` denotes repetition (zero or more).
- `"..."` denotes terminal symbols (keywords, punctuation).
- `UPPER_CASE` denotes lexical tokens.
- `PascalCase` denotes non-terminal symbols.

### §27.1 Lexical Grammar

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
(* UpperIdent and LowerIdent encode the casing conventions described in §3.5.
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
StringLiteral  ::= DoubleString | SingleString | InterpDoubleString | InterpSingleString | RawDoubleString | RawSingleString
DoubleString   ::= '"' { StringChar | EscapeSeq } '"'
SingleString   ::= "'" { StringChar | EscapeSeq } "'"
InterpDoubleString ::= "i" '"' { InterpStringChar | EscapeSeq | InlineExpr } '"'
                       (* Interpolated: evaluates {$ expr $} inline expressions. §15 *)
InterpSingleString ::= "i" "'" { InterpStringChar | EscapeSeq | InlineExpr } "'"
                       (* Single-quoted interpolated form. §15 *)
RawDoubleString ::= "r" '"' { ANY_CHAR - '"' } '"'
RawSingleString ::= "r" "'" { ANY_CHAR - "'" } "'"

StringChar     ::= ANY_CHAR - ( '"' | "'" | "\\" )
InterpStringChar ::= ANY_CHAR - ( '"' | "'" | "\\" | "{$" )
BytesChar      ::= ANY_CHAR - ( '"' | "'" | "\\" )
                   (* any byte value that is not a quote delimiter or backslash;
                      hex-byte escapes \xHH are handled via EscapeSeq *)
EscapeSeq      ::= "\\" ( "\\" | "'" | '"' | "n" | "r" | "t" | "0"
                         | "u" HEX4 | "u{" HEX1_6 "}" )
                   (* Shared escape sequences for strings and char literals.
                      Does NOT include \\xHH — that is bytes-literal-only. *)
BytesEscapeSeq ::= EscapeSeq | "\\" "x" HEX2
                   (* Extends EscapeSeq with \\xHH for arbitrary byte values;
                      valid only in BytesLiteral. §3.6 *)
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
CharLiteral    ::= "c" '"' CharContentD '"'
                 | "c" "'" CharContentS "'"
CharContentD   ::= EscapeSeq | ANY_CHAR - ( '"' | "\\" )
                   (* Double-quoted form; single-quote is a valid unescaped char. *)
CharContentS   ::= EscapeSeq | ANY_CHAR - ( "'" | "\\" )
                   (* Single-quoted form; double-quote is a valid unescaped char. *)
                   (* Both forms: compile-time error if content ≠ exactly 1 scalar value *)

(* Bytes literals *)
BytesLiteral   ::= "b" ( '"' { BytesChar | BytesEscapeSeq } '"'
                        | "'" { BytesChar | BytesEscapeSeq } "'" )

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
DescriptorList   ::= DescriptorKV { "," DescriptorKV }
DescriptorKV     ::= Identifier "=" ( StringLiteral | [ "+" | "-" ] IntLiteral )
                     (* Multiline string formatting parameters: indent_type,
                        indent (±N), eol. See §14 for valid keys and values. *)
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


### §27.2 Syntactic Grammar — Programs and Modules

```ebnf
Program        ::= [ ModeDirective ] [ NamespaceDecl ] { TopLevelItem }
                   (* ModeDirective is the optional @mode(...) file-level annotation;
                      when present it must be the first non-comment token in the file.
                      NamespaceDecl, if present, immediately follows ModeDirective
                      and precedes all imports and declarations. §13.0 *)
ModeDirective  ::= "@mode" "(" ModeName ")" NEWLINE
ModeName       ::= "web" "." ( "scripted" | "compiled" )
                 | "host" "." ( "scripted" | "dual" | "native" )
                 | "freestanding"
NamespaceDecl  ::= "namespace" AbsolutePath ";"
                   (* Associates the file with a module namespace path. §13.0 *)

TopLevelItem   ::= ImportStmt ";"
                   (* Parenthesized form: from X import (...); — requires trailing ";" *)
                 | GroupedImportStmt
                   (* Block form: from X { ... } — NO trailing ";" (ends with "}") *)
                 | ReExportStmt ";"
                   (* Parenthesized form: pub from X import (...); — requires trailing ";" *)
                 | GroupedReExportStmt
                   (* Block form: pub from X { ... } — NO trailing ";" (ends with "}") *)
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
                 | MacroDecl
                   (* Macro declaration: pub macro name(params) { quote { ... } }. §27.11 *)
                 | ExternJsFunc
                 | ExternJsVal
                   (* JavaScript FFI declarations; ";" is part of their own syntax. §27.9 *)
                 | ExternNative
                   (* Native C FFI declaration; ";" is part of its own syntax. §27.9 *)
                 | ExternNativeVal
                   (* Native C constant/variable import; ";" is part of its own syntax. §27.9 *)
                 | AnnotatedDecl
AnnotatedDecl  ::= Annotation { Annotation } VarDecl
                   (* One or more annotations on a module-level binding: @doc("...") let MAX = 100.
                      Requires at least one annotation to avoid ambiguity with SimpleStmt. *)
```

### §27.3 Syntactic Grammar — Imports and Exports

```ebnf
ImportStmt     ::= "from" ModulePath "import" "(" ImportList ")" [ "prefer" "compiled" ]
                 | "from" ModulePath "defer" "import" "(" ImportList ")"
                   (* Deferred import: creates type stubs resolved after initialization.
                      Breaks module dependency cycles. "prefer compiled" not permitted
                      on defer imports. Available in all modes except @mode(freestanding). §13.10 *)
                   (* Both forms require a trailing ";" provided by TopLevelItem. *)
GroupedImportStmt ::= "from" ModulePath "{" GroupedImportList "}"
                   (* Block form — no trailing ";"; appears directly in TopLevelItem. *)

ReExportStmt        ::= "pub" "from" ModulePath "import" "(" ImportList ")"
                        (* Requires trailing ";" provided by TopLevelItem. *)
GroupedReExportStmt ::= "pub" "from" ModulePath "{" GroupedImportList "}"
                        (* Block form — no trailing ";"; appears directly in TopLevelItem. *)

ModulePath     ::= RelativePath | AbsolutePath
RelativePath   ::= "." { "." } [ Identifier { "." Identifier } ]
AbsolutePath   ::= Identifier { "." Identifier }

ImportList     ::= ImportItem { "," ImportItem } [ "," ]
ImportItem     ::= Identifier [ "as" Identifier ]

(* GroupedImportList covers both forms: items with and without "prefer compiled".
   The clause is optional per item, so a single production handles both cases. *)
GroupedImportList  ::= GroupedImportItem { ";" GroupedImportItem } [ ";" ]
GroupedImportItem  ::= Identifier { "." Identifier } "import" "(" ImportList ")"
                       [ "prefer" "compiled" ]
```

### §27.4 Syntactic Grammar — Statements

```ebnf
Stmt           ::= SimpleStmt [ ";" ] | BlockStmt
                   (* Semicolon is optional after SimpleStmt; newline terminates. *)

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

VarDecl        ::= ( [ "unique" ] | [ "arc" ] ) ( "let" | "var" ) DestructPattern [ ":" Type ] [ "=" Expr ]
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

AssignOp       ::= "=" | "+=" | "-=" | "*=" | "/=" | "//=" | "%="
                 | "**=" | "<<=" | ">>=" | "&=" | "|=" | "^="

BlockStmt      ::= AnnotatedStmt
                   (* Annotation on a block statement: @vectorize for (...) {}. §8.8 *)
                 | IfStmt
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
                 | SafeBlock
                 | SyncUnsafeBlock
                 | AtomicBlock
                   (* Valid in @mode(web.scripted), @mode(web.compiled), @mode(host.scripted),
                      and @mode(host.dual). @mode(host.native)/@mode(freestanding) usage
                      is E_ATOMIC_NOT_WASM. §17.7 *)
                 | AsmBlock
                   (* Valid in @mode(web.compiled) (Wasm, @unsafe),
                      @mode(host.native) (native, @unsafe), and @mode(freestanding). §24.7 *)
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
ForInStmt      ::= [ Label ":" ] "for" "(" [ "let" | "var" ] DestructPattern "in" Expr ")" Block
ForAwaitStmt   ::= [ Label ":" ] "for" "await" "(" [ "let" | "var" ] DestructPattern "in" Expr ")" Block
                   (* "let"/"var" are optional; default binding is immutable ("let"). §6.4 *)
DoWhileStmt    ::= [ Label ":" ] "do" Block "while" "(" Expr ")" ";"
TryStmt        ::= "try" Block { CatchClause } [ FinallyClause ]
CatchClause    ::= "catch" "(" TypePattern "as" Identifier ")" Block
TypePattern    ::= Type { "|" Type }
FinallyClause  ::= "finally" Block
WithStmt       ::= "with" "(" WithBindingList ")" Block
WithBindingList ::= WithBinding { "," WithBinding }
WithBinding    ::= Identifier "=" Expr
DeferBlock        ::= "defer" Block
SafeBlock         ::= "safe" Block
SyncUnsafeBlock   ::= "unsafe" "(" StringLiteral ")" Block
AtomicBlock       ::= "atomic" Block
                      (* No await/spawn inside; see §17.7 for full restriction list.
                         Valid in @mode(web.scripted), @mode(web.compiled),
                         @mode(host.scripted), and @mode(host.dual) per §2.6.
                         Usage in @mode(host.native) or @mode(freestanding) is E_ATOMIC_NOT_WASM. *)
AnnotatedStmt     ::= Annotation { Annotation } BlockStmt
                      (* One or more annotations on a block statement.
                         Use case: @vectorize for (...) { } §8.8, §21.16 *)
AsmBlock          ::= [ "@unsafe" "(" StringLiteral ")" ] "asm" "{" AsmBody "}"
                      (* In @mode(host.native), @unsafe annotation is required. In
                         @mode(freestanding), it is optional (omitting emits asm-unchecked
                         lint). Semantics, operand grammar, and constraint strings: §24.7 *)
AsmBody           ::= StringLiteral { StringLiteral } [ AsmOps ]
AsmOps            ::= [ AsmOut ] [ AsmIn ] [ AsmClobbers ]
AsmOut            ::= "out" ":" AsmOutOp { "," AsmOutOp }
AsmIn             ::= "in"  ":" AsmInOp  { "," AsmInOp  }
AsmClobbers       ::= "clobbers" ":" "[" { StringLiteral } "]"
AsmOutOp          ::= Identifier "=" StringLiteral
AsmInOp           ::= StringLiteral "=" Expr
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

### §27.5 Syntactic Grammar — Expressions

```ebnf
Expr           ::= TernaryExpr | AssignExpr | SpreadExpr | WithCopyExpr

TernaryExpr    ::= NullCoalExpr "?" Expr ":" Expr
AssignExpr     ::= NullCoalExpr AssignOp Expr

(* Canonical style: "or" and "and" are idiomatic; "||" and "&&" are legal aliases.    *)
(* The formatter rewrites symbol forms to keyword forms. See §3.7 and §28.4.            *)
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
                 | "consume" UnaryExpr
                 | PostfixExpr
(* box is contextual: treated as the box prefix operator only when followed by a valid expression start. *)
(* as? is the two-token sequence "as" "?"; parser resolves ambiguity with postfix ? by  *)
(* context: as? must be immediately followed by a type expression.                       *)
PostfixExpr    ::= PrimaryExpr { PostfixOp }
PostfixOp      ::= "(" ArgList ")"
                 | "[" Expr "]"
                 | "[" [ Expr ] ":" [ Expr ] [ ":" [ Expr ] ] "]"
                 | "." Identifier
                 | "." IntLiteral
                   (* Tuple element access: pair.0, triple.2. Index must be a
                      compile-time non-negative integer constant. §4.9 *)
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
                 | CharLiteral
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
                 | MatchExpr
                 | AwaitExpr
                 | SpawnExpr
                 | "(" Expr ")"
                 | "super" "(" [ ArgList ] ")"
                   (* Superclass constructor call — valid only in constructor bodies.
                      Chains to the direct superclass constructor. §8.4 *)
                 | "reinterpret" "[" Type "," Type "]" "(" Expr ")"
                   (* SourceType = declared type of input expr; TargetType = desired interpretation.
                      Requires @unsafe. Available in all modes (§2.6). §24.18 *)
                 | "reinterpretChecked" "[" Type "," Type "]" "(" Expr ")"
                   (* SourceType = declared type of the input expr; TargetType = desired interpretation.
                      Returns Result[TargetType, AlignmentError]; no @unsafe required. §24.18 *)
                 | "size_of" "[" Type "]" "(" ")"
                   (* Compile-time size in bytes; @mode(host.native) and @mode(freestanding). §24.4.1 *)
                 | "align_of" "[" Type "]" "(" ")"
                   (* Compile-time alignment in bytes; @mode(host.native) and @mode(freestanding). §24.4.1 *)
                 | MacroInvoke
                   (* Macro invocation: name!(args). §27.11. The "!" sigil
                      distinguishes macro calls from regular function calls. *)

SpreadExpr     ::= "*" Expr | "**" Expr

WithCopyExpr   ::= PostfixExpr "with" "(" WithCopyList ")"
                   (* Struct copy-with-modification: `s with (field=newVal)` produces
                      a copy of s with the named fields replaced. §10.7. Valid on struct
                      values only; on a class instance this is `E_WITH_COPY_WRONG_TYPE`.
                      `with` is disambiguated from the WithStmt context manager by the
                      parser: WithCopyExpr requires PostfixExpr before "with". *)
WithCopyList   ::= WithCopyItem { "," WithCopyItem }
WithCopyItem   ::= Identifier "=" Expr

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

(* Lambda expressions — CaptureList is valid in @mode(host.dual) and @mode(host.native) files; ARC retain cycles cannot occur in other modes *)
LambdaExpr     ::= "func" "(" [ ParamList ] ")" [ CaptureList ] ( "=>" Expr | Block )
               | "async" "func" "(" [ ParamList ] ")" [ CaptureList ] ( "=>" Expr | Block )

CaptureList    ::= "[" CaptureItem { "," CaptureItem } "]"
CaptureItem    ::= ( "weak" | "unowned" ) Identifier
(* @unownedUnchecked is removed. All unowned closure captures trap on dangling access. *)


(* Match expression *)
MatchExpr      ::= "match" Expr "{" MatchArmList "}"
MatchArmList   ::= MatchArm { "," MatchArm } [ "," ]
                   (* Comma separates arms; trailing comma is optional. *)
MatchArm       ::= Pattern [ "if" "(" Expr ")" ] "=>" ( Expr | Block )
                   (* Block body: None => { db.commit(); return true; } *)

(* Await and spawn *)
AwaitExpr      ::= "await" Expr
SpawnExpr      ::= "spawn" Expr

(* Function call arguments *)
ArgList        ::= Arg { "," Arg } [ "," ]
Arg            ::= VerbAckArg       (* reads: x  /  edits: x  /  takes: x  /  shares: x *)
                 | RequiresAckArg   (* reads(a,b)  /  edits(a)  /  distinct(a,b) *)
                 | UnsafeAckArg     (* @unsafe("reason") — for statically unknowable distinct() *)
                 | Expr
                 | Identifier "=" Expr
                 | "*" Expr
                 | "**" Expr

VerbAckArg     ::= ( "reads" | "edits" | "takes" | "shares" ) ":" Expr
RequiresAckArg ::= ( "reads" | "edits" | "takes" | "shares" ) "(" Expr { "," Expr } ")"
                 | "distinct" "(" DistinctAckArg { "," DistinctAckArg } ")"
DistinctAckArg ::= Expr | Expr "[" Expr ":" Expr "]"
UnsafeAckArg   ::= "@unsafe" "(" StringLiteral ")"
```

### §27.6 Syntactic Grammar — Patterns

```ebnf
Pattern        ::= "_"
                 | Identifier
                 | Identifier "(" [ PatternList ] ")"
                   (* Positional: Circle(r) or Rect(w, h) *)
                 | Identifier "(" [ NamedAssignPatternList ] ")"
                   (* Named with =: Point(x=px, y=py) or Point(x=0.0, y=0.0) *)
                 | Identifier "{" [ NamedPatternList ] "}"
                 | "(" PatternList ")"
                 | "[" PatternList "]"
                 | "{" DictPatternList "}"
                 | Type "(" Identifier ")"
                 | "borrow" [ "[" "~" Identifier "]" ] Identifier
                   (* Binds a borrow[~name] payload from a lifetime-parameterized
                      enum variant. Available in all modes (§2.6).
                      Example: Token.Word(borrow[~src] w) — §9.1, §23.4.2 *)
                 | Literal

PatternList    ::= Pattern { "," Pattern } [ "," "*" Identifier ]
NamedPatternList ::= NamedPattern { "," NamedPattern }
NamedPattern         ::= Identifier ":" Pattern [ "=" Expr ]
NamedAssignPatternList ::= NamedAssignPattern { "," NamedAssignPattern }
NamedAssignPattern   ::= Identifier "=" Pattern
                        (* Named binding using = notation: x=px, y=py.
                           Used in struct/enum patterns: Point(x=px, y=py). §10.8 *)
DictPatternList ::= DictPattern { "," DictPattern } [ "," "**" Identifier ]
DictPattern    ::= StringLiteral ":" Identifier [ "=" Expr ]

DestructPattern ::= Identifier
                  | Identifier "(" NamedAssignDestructList ")"
                    (* Struct/enum constructor destructuring: Point(x=px, y=py) §10.8 *)
                  | "(" DestructList ")"
                  | "[" DestructList "]"
                  | "{" DictDestructList "}"
DestructList   ::= DestructItem { "," DestructItem } [ "," "*" Identifier ]
DestructItem   ::= Identifier | "_" | DestructPattern
DictDestructList ::= DictDestructItem { "," DictDestructItem } [ "," "**" Identifier ]
DictDestructItem ::= StringLiteral ":" Identifier [ "=" Expr ]
NamedAssignDestructList ::= NamedAssignDestructItem { "," NamedAssignDestructItem }
NamedAssignDestructItem ::= Identifier "=" DestructItem
                            (* field=binding: Point(x=px) binds field x to px;
                               DestructItem allows "_" and nested DestructPattern *)

Literal        ::= IntLiteral | FloatLiteral | StringLiteral | BytesLiteral | CharLiteral | BoolLiteral | "None"
```

### §27.7 Syntactic Grammar — Types

```ebnf
Type           ::= UnionType
UnionType      ::= BaseType { "|" BaseType }
BaseType       ::= PrimaryType [ "?" ]
PrimaryType    ::= "int" | "float" | "bool" | "char" | "string" | "bytes" | "void"
                 | "uint"
                   (* pointer-sized unsigned integer; alias for uint64 on 64-bit targets,
                      uint32 on 32-bit. Used in @mode(host.native) and @mode(freestanding)
                      for raw addresses and FFI interop. §4.1 *)
                 | Identifier [ TypeArgs ]
                 | "fn" "(" [ FnTypeParamList ] ")" ":" Type
                 | "async" "fn" "(" [ FnTypeParamList ] ")" ":" Type
                 | "borrow" [ "[" "~" Identifier "]" ] Type
                   (* non-owning reference type; available in all modes (§2.6);
                      "borrow[~name] T" ties the reference to a declared
                      lifetime region (§23.4.2) *)
                 | "noescape" "fn" "(" [ FnTypeParamList ] ")" ":" Type
                 | "async" "noescape" "fn" "(" [ FnTypeParamList ] ")" ":" Type
                 | "list" "[" Type "]"
                 | "dict" "[" Type "," Type "]"
                 | "set" "[" Type "]"
                 | "tuple" "[" TypeList "]"
                 | "MaybeUninit" "[" Type "]"
                   (* Uninitialised-memory wrapper; available in all modes (§2.6). §24.17 *)
                 | "(" Type ")"

TypeArgs       ::= "[" TypeList "]"
TypeList       ::= Type { "," Type } [ "," ]
FunctionType    ::= [ "async" ] [ "noescape" ] "fn" "(" [ FnTypeParamList ] ")" ":" Type
FnTypeParamList ::= FnTypeParam { "," FnTypeParam }
FnTypeParam     ::= [ FnTypeVerbMod ] Type
FnTypeVerbMod   ::= "reads" | "edits" | "takes" | "shares"
                  | "borrow" | "excl" "borrow"
```

### §27.8 Syntactic Grammar — Declarations

```ebnf
FuncDecl         ::= { Annotation } [ "safe" ] "func" Identifier [ TypeParams ] "(" [ ParamList ] ")"
                     [ RequiresClause ] [ ":" Type ] Block
AsyncFuncDecl    ::= { Annotation } [ "safe" ] "async" "func" Identifier [ TypeParams ] "(" [ ParamList ] ")"
                     [ RequiresClause ] [ ":" Type ] Block
GenFuncDecl      ::= { Annotation } [ "safe" ] "gen" "func" Identifier [ TypeParams ] "(" [ ParamList ] ")"
                     [ RequiresClause ] [ ":" Type ] Block
AsyncGenFuncDecl ::= { Annotation } [ "safe" ] "async" "gen" "func" Identifier [ TypeParams ] "(" [ ParamList ] ")"
                     [ RequiresClause ] [ ":" Type ] Block

RequiresClause   ::= "requires" RequiresContract { "," RequiresContract }
RequiresContract ::= VerbReq | DistinctReq
VerbReq          ::= ( "reads" | "edits" | "takes" | "shares" ) "(" Identifier { "," Identifier } ")"
DistinctReq      ::= "distinct" "(" DistinctArg { "," DistinctArg } ")"
DistinctArg      ::= Identifier | Identifier "[" Expr ":" Expr "]"

ParamList      ::= Param { "," Param } [ "," "*" [ Identifier ":" Type ] ] [ "," ParamList_KW ] [ "," "**" Identifier ":" Type ]
                 | "*" [ "," ParamList_KW ]
ParamList_KW   ::= Param { "," Param }
Param          ::= [ "reads" | "edits" | "takes" | "shares"
                  | "excl" "borrow" | "borrow" [ "[" "~" Identifier "]" ] ]
                  DestructPattern ":" Type [ "=" Expr ]
                  (* Identifier is the common case. DestructPattern supports
                     tuple and list destructuring in parameter position:
                     func f((x, y): tuple[float, float]) — see §6.8.
                     "borrow[~name]" binds the parameter to a named lifetime region.
                     Available in all modes (§2.6). §23.4.2 *)

TypeParams     ::= "[" TypeParam { "," TypeParam } "]"
TypeParam      ::= [ "out" | "in" ] Identifier [ ":" TypeConstraint ]
                 (* variance annotation: "out" = covariant, "in" = contravariant,
                    no annotation = inferred by compiler (default invariant) *)
                 | "lifetime" "~" Identifier
                 (* lifetime parameter — declares a named region for borrow tracking.
                    Available in all modes (§2.6). See §23.4.2. *)
TypeConstraint ::= Type { "+" Type }

ClassDecl      ::= { Annotation } [ "synchronized" ] [ "unique" ] [ "abstract" ] [ "dynamic" ]
                   "class" Identifier [ TypeParams ]
                   [ ":" Type ] [ "implements" TypeList ] "{" { ClassMember } "}"
ClassMember    ::= FieldDecl ";"
                 | ConstructorDecl
                 | MethodDecl
                 | StaticMethodDecl
                 | StaticFieldDecl ";"
                 | PropertyDecl
                 | OperatorMethodDecl
                 | TypeAliasDecl ";"

FieldDecl      ::= [ "pub" ] [ "weak" | "unowned" "[" "~" Identifier "]" ] ( "let" | "var" )
                   Identifier ":" Type [ "=" Expr ]
                   (* "pub" is the only access modifier. "unowned" requires a lifetime
                      annotation (bare unowned is E_UNOWNED_NO_LIFETIME). "borrow" is
                      not valid on class fields — use StructField for borrow fields.
                      Trailing ";" is provided by ClassMember ::= FieldDecl ";". *)
ConstructorDecl ::= "new" "(" [ ParamList ] ")" Block
MethodDecl     ::= { Annotation } [ "pub" ] [ "abstract" ]
                   ( [ "safe" ] [ "async" ] [ "gen" ] "func" | "modifier" )
                   Identifier [ TypeParams ] "(" [ ParamList ] ")"
                   [ RequiresClause ] [ ":" Type ] ( Block | ";" )
StaticMethodDecl ::= { Annotation } [ "pub" ] "static" [ "safe" ] [ "async" ] [ "gen" ] "func" Identifier [ TypeParams ] "(" [ ParamList ] ")" [ ":" Type ] Block
StaticFieldDecl ::= [ "pub" ] "static" ( "let" | "var" ) Identifier ":" Type [ "=" Expr ]
PropertyDecl   ::= [ "pub" ] ( "get" Identifier "(" ")" ":" Type Block
                             | "set" Identifier "(" Param ")" Block )

OperatorMethodDecl ::= { Annotation } [ "pub" ] [ "static" ] [ "modifier" ] "operator" "func"
                       OperatorSymbol [ TypeParams ] "(" [ ParamList ] ")" [ ":" Type ] Block
                       (* "modifier" is optional; when present, declares that this
                          operator method writes var fields on self and requires
                          safe context at call sites. Operator methods are NOT
                          implicitly modifier — explicit declaration required. §23.4.11 *)
OperatorSymbol ::= "+" | "-" | "*" | "/" | "//" | "%" | "**"
                 | "&" | "|" | "^" | "bnot" | "<<" | ">>"
                 | "[]" | "[]=" | "contains" | "()"
                 | "==" | "+=" | "-=" | "*=" | "/=" | "//=" | "%="
                 | "**=" | "<<=" | ">>=" | "&=" | "|=" | "^="

EnumDecl       ::= { Annotation } "enum" Identifier [ TypeParams ] "{" VariantList "}"
VariantList    ::= Variant { VariantSep Variant } [ VariantSep ]
                   (* Both comma and semicolon separators are normative. §9.1.
                      Mixing "," and ";" in one enum body is `E_ENUM_MIXED_SEP`;
                      enforced semantically rather than grammatically. *)
VariantSep     ::= "," | ";"
Variant        ::= Identifier
                 | Identifier "(" FieldList ")"
                 | Identifier "(" NamedFieldList ")"
                   (* Named payload in parens: Circle(radius: float) — common form *)
                 | Identifier "{" NamedFieldList "}"
                   (* Named payload in braces: Circle{ radius: float } — alt form *)
FieldList      ::= Type { "," Type }
                   (* Positional: Circle(float) — type-only list *)
NamedFieldList ::= NamedField { "," NamedField }
NamedField     ::= Identifier ":" Type

InterfaceDecl  ::= "interface" Identifier [ TypeParams ] [ ":" TypeList ]
                   "{" { InterfaceMember } "}"
                   (* TypeList names zero or more superinterfaces.
                      A superinterface extends the contract: all members of the
                      superinterface become members of the declaring interface.
                      A class implementing the sub-interface must implement all
                      inherited members as well. §11 *)
InterfaceMember ::= [ "pub" ] [ "static" ] [ "safe" ] [ "async" ] [ "gen" ] "func"
                    Identifier [ TypeParams ] "(" [ ParamList ] ")"
                    [ RequiresClause ] [ ":" Type ] ( Block | ";" )
                  | [ "pub" ] "modifier" Identifier [ TypeParams ]
                    "(" [ ParamList ] ")" [ RequiresClause ] [ ":" Type ] ( Block | ";" )
                    (* modifier methods cannot be static, async, or gen;
                       implementing classes must also declare the method as modifier *)
                  | [ "pub" ] [ "modifier" ] "operator" "func" OperatorSymbol "(" [ ParamList ] ")" [ ":" Type ] ( Block | ";" )
                    (* "modifier" on operator func: same semantics as modifier on regular func;
                       implementing classes must also declare modifier. §23.4.11 *)
                  | [ "pub" ] ( "get" | "set" ) Identifier "(" [ Param ] ")" [ ":" Type ] ( Block | ";" )
                  (* A ";" terminates an abstract method declaration; a Block provides a default implementation. *)

StructDecl     ::= { Annotation } "struct" Identifier [ TypeParams ] [ "implements" TypeList ] "{" { StructMember } "}"
StructMember   ::= StructField ";"
                 | MethodDecl
                 | StaticMethodDecl
                 | OperatorMethodDecl
                 | TypeAliasDecl ";"
StructField    ::= [ "pub" ] [ "unique" "var" | "var" ] Identifier ":" Type [ "=" Expr ]
                 | [ "pub" ] "borrow" [ "[" "~" Identifier "]" ] Identifier ":" Type
                   (* borrow struct fields hold non-owning references; no default values.
                      "borrow[~name]" ties the field to a named lifetime region (§23.4.2).
                      Available in all modes (§2.6). *)

TypeAliasDecl  ::= [ "pub" ] "type" Identifier [ TypeParams ] "=" Type

Annotation     ::= "@" Identifier [ "(" ArgList ")" ]
```

### §27.9 Syntactic Grammar — FFI Declarations

**`NativeHandle?` in `extern native` return type position (§18.4).** `NativeHandle?` is parsed by the existing `T?` nullable-type grammar (§4.3). No new production is needed; the compiler maps an optional return type to automatic null-to-`None` checking at the FFI boundary. Plain `NativeHandle` (non-optional) maps null to a runtime `NullHandleError`.

```ebnf
ExternJsFunc    ::= "extern" "js" "func" Identifier "(" [ ParamList ] ")" ":" Type ";"
ExternJsVal     ::= "extern" "js" "val" Identifier ":" Type ";"
ExternNative    ::= { Annotation } "extern" "native" StringLiteral "func" Identifier
                    "(" [ ParamList ] ")" ":" Type ";"
                    (* Annotation supports @unsafe("reason") for thread-safety and
                       escaping-borrow assertions on native C functions. §23.4.6 *)
ExternNativeVal ::= "extern" "native" StringLiteral "val" Identifier ":" Type ";"
                    (* Imports a native constant or variable by name from a C library. *)
```

### §27.10 Syntactic Grammar — Template Directives

```ebnf
TmplStmt       ::= TmplIf | TmplElif | TmplElse
                 | TmplWhile | TmplFor | TmplForIn | TmplForAwait
                 | TmplDoWhile | TmplMatch | TmplMatchArm
                 | TmplTry | TmplCompute
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
TmplMatchArm   ::= Pattern "=>"
                   (* Template match arm: {% Variant(x) => %} ... §9.4 *)
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
TmplContent    ::= { ComponentTag | HtmlInterpolation | TmplStmt | TextRun }
TextRun        ::= (* Any literal text that is not a component tag, interpolation,
                      or template directive — consumed verbatim by the fence renderer. *)
```

### §27.11 Syntactic Grammar — Macro Declarations

```ebnf
MacroDecl      ::= [ "pub" ] "macro" Identifier "(" [ MacroParamList ] ")" "{" MacroBody "}"
MacroParamList ::= Identifier { "," Identifier }
MacroBody      ::= "quote" QuoteBlock
QuoteBlock     ::= "{" { QuoteItem } "}"
QuoteItem      ::= MacroSplice | ANY_LOUP_CONSTRUCT
                   (* ANY_LOUP_CONSTRUCT is any syntactically valid Loup
                      statement, expression, declaration, or type. *)
MacroSplice    ::= "${" Identifier "}"
                   (* Splices the AST node bound to the named macro parameter
                      into the quote body at the point of the splice. *)
MacroInvoke    ::= Identifier "!" "(" [ ArgList ] ")"
```

For any valid Loup source text, parsing it into an AST and then pretty-printing that AST back to source text and parsing again SHALL produce an equivalent AST (round-trip property).

### §27.12 Syntactic Grammar — Additional Productions

*(CastExpr is fully defined in §27.5 as part of the canonical expression hierarchy. The `box` prefix operator is fully defined in §27.5 UnaryExpr. §27.12 contains additional productions not covered in §27.5.)*

#### Field Qualifier Keywords

*(FieldDecl is fully defined in §27.8. The qualifier forms `weak` and `unowned[~name]` are inlined there.)*

`unowned[~name]` is valid in `@mode(host.native)` and `@mode(freestanding)` files. Bare `unowned` (without a lifetime annotation) on a class field is `E_UNOWNED_NO_LIFETIME`. The class must carry `[lifetime ~name]` as a class-level lifetime parameter.

#### Operator Method Modifier

*(MethodDecl, OperatorMethodDecl, and OperatorSymbol are fully defined in §27.8. Operator methods use the form `[ "modifier" ] "operator" "func" OperatorSymbol ...` as a separate production from regular method declarations.)*

*(CaptureList and CaptureItem are now defined in §27.5 as part of the canonical LambdaExpr production. Capture lists are valid in `@mode(host.dual)` and `@mode(host.native)` files; the compiler emits a compile-time error otherwise.)*

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
UiContent      ::= { UiComponentTag | HtmlInterpolation | TextRun }
                   (* TextRun is any literal text not matched by the above alternatives *)
```

Lowercase tags are `E_UI_LOWERCASE_TAG` in `ui` fences (all primitives use PascalCase). This contrasts with `html` fences where lowercase tags are emitted as literal HTML.

### §27.13 Syntactic Grammar — Template Fence and HTML Context Productions

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

**Recognised `Language` tokens (normative).** The `Language` token in `TemplateFenceOpen` is an `Identifier`. The compiler recognises the following as named fence types with special semantics; all other identifiers are treated as user-defined fences with no special compiler processing:

| Language token | Fence type | Section |
|---|---|---|
| `html` | HTML context-tracking template | §16.6 |
| `css` | CSS stylesheet fence | §16.7 |
| `wgsl` | WebGPU Shading Language compute fence | §16.8.1 |
| `metal` | Metal Shading Language compute fence | §16.8.2 |
| `glsl` | OpenGL/Vulkan compute shader fence | §16.8.3 |
| `sql` | SQL query fence (§21) | stdlib |
| `ui` | Reactive UI layout fence | §19.6 |
| `stablehlo` / `hlo` | XLA HLO tensor computation fence (§21) | stdlib |

Unrecognised language tokens are not a compile-time error; they produce a `Template` value whose body is the raw fence content as a `string`.

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
| `box` `consume` | 4 | Boxing/widening (`box`); unique-to-ARC downgrade (`consume`, `@mode(host.native)` or `@mode(host.dual)`) | §4.3, §23.4.7 |
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
| `and` `&&` | 18 | Logical AND (`and` canonical; `&&` alias) | §3.7 |
| `or` `\|\|` | 19 | Logical OR (`or` canonical; `\|\|` alias) | §3.7 |
| `??` | 20 | Null coalescing | §5.6 |
| `? :` | 21 | Ternary | §5.4 |
| `?` (postfix) | 22 | Result propagation | §5.7 |
| `=` `+=` `-=` etc. | 23 | Assignment | §6.2 |
| `*` `**` (prefix) | 24 | Spread | §5.8 |



---


### §27.14 Syntactic Grammar — v1.14 Additions

*(This section is normative. Applies to `@mode(host.native)` and `@mode(freestanding)`. Productions new in v1.14.)*

**Mode directive (historical — v1.14 form):**

```
mode_directive ::= '@mode' '(' mode_name ')'
mode_name      ::= 'scripted' | 'compiled' | 'native' | 'freestanding'    (* v1.14 — superseded *)
```

Valid only as the first non-comment, non-blank token in a source file.

*Note:* The v1.14 `mode_name` production above is preserved for historical record. The canonical v1.17 grammar uses the dotted form (`web.scripted`, `web.compiled`, `host.scripted`, `host.dual`, `host.native`, `freestanding`) — see the `ModeDirective`/`ModeName` productions in §27.2, which are the authoritative normative grammar.

**`arc let` / `arc var`:**

```
var_decl ::= ('let' | 'var' | 'arc let' | 'arc var'
             | 'unique let' | 'unique var') pattern (':' type)? ('=' expr)? ';'
```

**`unique class` (v1.14 addition):**

```
class_decl     ::= class_decl_mod* 'class' IDENT type_params? ':' type
                   ('implements' type_list)? '{' class_body '}'

class_decl_mod ::= 'unique' | 'abstract' | 'dynamic'
                   (* 'unique' is new in v1.14; 'abstract' and 'dynamic' are from §27.8.
                      'unique abstract' and 'unique dynamic' are mutually exclusive
                      compile-time errors; 'abstract dynamic' is also an error.
                      Renamed from `modifier` in v1.15 to avoid conflict with the
                      `modifier` method declaration keyword introduced in §23.4.11. *)
```

**Inline assembly:**

```
asm_block    ::= 'asm' '{' asm_string+ asm_ops? '}'
asm_ops      ::= asm_out? asm_in? asm_clobbers?
asm_out      ::= 'out' ':' asm_out_op (',' asm_out_op)*
asm_in       ::= 'in'  ':' asm_in_op  (',' asm_in_op)*
asm_out_op   ::= IDENT '=' string_lit
asm_in_op    ::= string_lit '=' expr
asm_clobbers ::= 'clobbers' ':' '[' string_lit* ']'
```

**`@volatile` parameter modifier:** `@volatile` immediately precedes a `borrow` parameter modifier.

**`reinterpret[T, U]` expression:**

```
primary_expr ::= ... | 'reinterpret' '[' type ',' type ']' '(' expr ')'
```

**`MaybeUninit[T]` type:**

```
builtin_generic_type ::= ... | 'MaybeUninit' '[' type ']'
```

**`@entry` annotation (with optional symbol override):**

```
entry_annotation ::= '@entry' | '@entry' '(' 'symbol' ':' string_lit ')'
```

**`size_of` and `align_of` expressions:**

```
size_expr  ::= 'size_of'  '[' type ']' '(' ')'
align_expr ::= 'align_of' '[' type ']' '(' ')'
```

Both are compile-time constant expressions of type `uint64`.



### §27.15 Syntactic Grammar — v1.15 Additions

*(This section is normative. Productions new in v1.15. Applies to all modes unless noted.)*

**Ownership transfer verbs — parameter modifiers (§23.4.9):**

```
param_modifier  ::= 'reads' | 'edits' | 'takes' | 'shares'
                  | 'borrow' | 'borrow' '[' '~' IDENT ']'
                  | 'excl' 'borrow'

param_decl      ::= param_modifier? IDENT ':' type
```

The first four productions are the v1.15 verb system. The remainder are retained for backward compatibility in `@mode(host.native)` and `@mode(freestanding)`.

**Verb acknowledgment at call sites (§23.4.9):**

```
arg             ::= verb_ack_arg | value_arg
verb_ack_arg    ::= verb_ack ':' expr
verb_ack        ::= 'reads' | 'edits' | 'takes' | 'shares'
value_arg       ::= (IDENT ':')? expr
```

**`requires` clause (§23.4.10):**

```
func_decl         ::= func_mods 'func' IDENT type_params? '(' param_list ')'
                      requires_clause? ':' type block

requires_clause   ::= 'requires' requires_contract (',' requires_contract)*
requires_contract ::= verb_req | distinct_req
verb_req          ::= ('reads'|'edits'|'takes'|'shares') '(' IDENT (',' IDENT)* ')'
distinct_req      ::= 'distinct' '(' distinct_arg (',' distinct_arg)* ')'
distinct_arg      ::= IDENT | IDENT '[' expr ':' expr ']'
func_mods         ::= ('safe')? ('async')?  (* 'safe' precedes 'async'; both optional. §27.8 *)
```

**`requires` acknowledgments at call sites (§23.4.10):**

```
call_arg_list   ::= call_arg (',' call_arg)*
call_arg        ::= verb_ack_arg | value_arg | requires_ack | unsafe_ack
requires_ack    ::= verb_req | distinct_req
unsafe_ack      ::= '@unsafe' '(' string_lit ')'
```

**`modifier` method declaration (§23.4.11):**

```
method_kw       ::= 'func' | 'modifier' | 'get' | 'set' | 'gen'
method_decl     ::= visibility? method_kw IDENT type_params? '(' param_list ')' ':' type block
```

`set` accessors are implicitly `modifier`.

**`safe {}` block (§23.4.12):**

```
safe_block      ::= 'safe' '{' stmt* '}'
stmt            ::= ... | safe_block
```

**`synchronized` class declaration (§23.4.13):**

```
class_decl_mod  ::= ('synchronized')? ('local' | 'shared')? ('unique')? ('abstract')? ('dynamic')?
class_decl      ::= class_decl_mod 'class' IDENT type_params? (':' type)?
                    ('implements' type_list)? '{' class_body '}'
```

`synchronized` is not valid in `@mode(freestanding)`. `synchronized unique`, `synchronized abstract`, and `synchronized dynamic` are mutually exclusive compile-time errors.

**Memory-strategy modifier (v1.18).** The optional `'local' | 'shared'` modifier selects the class's memory strategy (§8.1.1). If omitted, the class defaults to `local`. The modifier is mutually exclusive with the opposing strategy — both `local` and `shared` together is a parse error (`E_PARSE_DUAL_STRATEGY`). `shared unique` is `E_UNIQUE_SHARED`; `shared dynamic` is `E_SHARED_DYNAMIC`. `local` combines with all other modifiers.

**Shared-constructor expression (v1.18).** A `shared class` instance is allocated with the `shared` keyword prefix on the constructor call:

```
shared_expr     ::= 'shared' ('(' expr ')')? type_name arg_list
                    (* type_name must name a `shared class` type *)
                    (* optional ( expr ) argument is a SharedRef[SharedArena] *)
                    (* without the optional arena, allocation uses the current
                       context's default arena per §17b.5 *)
```

Examples:

- `shared Vertex(1.0, 2.0, 3.0)` — allocate in default arena
- `shared(myArena) Vertex(4.0, 5.0, 6.0)` — allocate in specific arena

The `shared` prefix is a compile-time marker; `shared T(...)` evaluates to `SharedRef[T]`. Applying `shared` to a non-`shared class` type is `E_SHARED_ON_LOCAL`. Omitting the `shared` prefix when calling a `shared class` constructor is `E_SHARED_MISSING_PREFIX`.

The `class_decl_mod` production was introduced in §27.14 to replace the production formerly named `modifier`, avoiding conflict with the `modifier` method declaration keyword.

**`unsafe {}` lock-release block (§23.4.14):**

```
sync_unsafe_block ::= 'unsafe' '(' string_lit ')' '{' stmt* '}'
```

Valid only inside a `modifier` method body on a `synchronized` class. Usage elsewhere is `E_UNSAFE_NOT_SYNCHRONIZED`. The `string_lit` reason is mandatory.


### §27.16 Syntactic Grammar — v1.16 Additions

*(This section is normative. Productions new in v1.16. Applies to all modes unless noted.)*

**`atomic {}` block (§17.7, scripted and compiled only):**

```
atomic_block    ::= 'atomic' '{' stmt* '}'
stmt            ::= ... | atomic_block
```

`atomic` is a new reserved keyword. Usage in `@mode(host.native)` or `@mode(freestanding)` is `E_ATOMIC_NOT_WASM`.

**`reinterpretChecked[T, U]` expression (§24.18):**

```
reinterpret_expr ::= 'reinterpret' '[' type ',' type ']' '(' expr ')'
                   | 'reinterpretChecked' '[' type ',' type ']' '(' expr ')'
```

`reinterpretChecked` does not require `@unsafe`. `reinterpret` still requires `@unsafe`.

**`@lockOrder` annotation (§23.4.13):**

```
lock_order_annotation ::= '@lockOrder' '(' integer_lit ')'
class_annotation      ::= ... | lock_order_annotation
```

`@lockOrder(n)` is valid only on `synchronized` class declarations. `n` must be a positive integer literal.

**`@interruptSafe` annotation (§24.24.1, freestanding only):**

```
func_annotation ::= ... | '@interruptSafe'
```

**`@signalSafe` annotation (§26.9, native only):**

```
func_annotation ::= ... | '@signalSafe'
```

**`@debug_control_channel` and `@debug_trace_channel` annotations (§24.25.3, freestanding `--debug` only):**

```
func_annotation     ::= ... | '@debug_control_channel' | '@debug_trace_channel'
```

`@debug_control_channel` and `@debug_trace_channel` are valid only on `func` declarations at module scope in `@mode(freestanding)` `--debug` builds. Using either in a release build is `E_FREESTANDING_MODULE`. Wrong return type is `E_FREESTANDING_CONTROL_CHANNEL_SIG` or `E_FREESTANDING_TRACE_CHANNEL_SIG`. Multiple definitions of either are `E_FREESTANDING_CONTROL_CHANNEL_DUPLICATE` or `E_FREESTANDING_TRACE_CHANNEL_DUPLICATE`.

**`@naked` with required `@unsafe` (§24.14):**

The grammar for `@naked` functions is unchanged. The normative requirement is semantic: a `@naked` function MUST have `@unsafe("naked: ...")` in its annotation list. The compiler enforces this as `E_NAKED_NOT_UNSAFE` at the declaration site.

**`NativeHandle?` return type (§18.4):**

`NativeHandle?` in an `extern native` return type position is parsed as `type_nullable` (the existing `T?` grammar, §4.3). No new grammar production is required; the compiler maps optional `NativeHandle` to null-pointer checking at the FFI boundary.

**`field_ref[T, F]` — compile-time field reference (§24.17a):**

```
field_ref_expr  ::= '.' IDENT
```

A bare `.fieldName` expression (leading dot, no receiver) in the argument position of `PartialInit.set(field, value)` is parsed as a `field_ref[T, F]` compile-time expression. It is not valid in any other expression position. The type `T` is inferred from the `PartialInit[T]` receiver; `F` is the field type. `E_FIELD_REF_INVALID` if the identifier does not name a field of `T`.

**`PanicSource` (§24.6):**

The `PanicSource` enum is a new built-in enum type available in `@mode(freestanding)`. Its definition and use as an optional extended parameter to `@panic_handler` are specified in §24.6. No new grammar productions are needed — it uses the existing enum and function-parameter grammar.

**New keywords added in v1.16:**

| Keyword | Section | Notes |
|---|---|---|
| `atomic` | §17.7 | Reserved in all modes; only usable in scripted/compiled |

### §27.17 Syntactic Grammar — v1.17 Additions

*(This section is normative. Applies to all modes unless noted.)*

v1.17 adds no new grammar rules beyond the dotted `ModeName` form (§2.5.1). The `ModeDirective` production was updated in §27.2 to accept the new `web.scripted` / `web.compiled` / `host.scripted` / `host.dual` / `host.native` / `freestanding` mode names.

---

## §28 Tooling

*(This section is non-normative.)*

### §28.1 Command-Line Interface

**`loup run path/to/file.loup`** — Execute a Loup source file using the JIT compilation pipeline. This is the baseline single-file execution workflow. The script prelude (§20.2) is available in the entry file.

**`loup build`** — Compile a Loup project for deployment:

```
loup build --target browser         # Wasm module for browser
loup build --target cli             # Wasm module for CLI
loup build --target service         # Wasm module for server
loup build --target desktop         # Native desktop app (requires @mode(host.native) or @mode(host.dual))
loup build --target native          # Native binary (requires @mode(host.native) or @mode(host.dual))
loup build --target native --lib shared   # Shared library
loup build --target native --lib static   # Static library
loup build --target freestanding --arch x86_64   # Freestanding kernel/bare-metal
loup build --target freestanding --arch aarch64  # Freestanding AArch64
loup build --target freestanding --arch riscv64 --march rv64imac  # RISC-V
loup build --debug                  # Include DWARF debug info in output
loup build --release                # Optimised release build
loup build --lto thin               # ThinLTO (LLVM backend only)
loup build --lto full               # Full LTO
loup build --backend cranelift      # Use Cranelift instead of LLVM
loup build --arch aarch64 --os linux              # Cross-compile
loup build --target native --stack-size 4194304   # Set OS stack size to 4 MB (default: platform ABI default)
loup build --target native --overflow trap         # Trap on fixed-width integer overflow (native/freestanding)
loup build --target freestanding --panic custom --double-fault reset  # Double-fault policy (freestanding)
loup build --check                      # Type-check and validate fence syntax; no output produced
```

`loup build --check` parses and type-checks the entire project, validates template fence syntax (including `stablehlo`, `hlo`, `wgsl`, `metal`, and `glsl` fences), and reports all compile-time errors without producing any output artefact. Exit code is 0 if the project is error-free, non-zero otherwise. Equivalent to a dry-run of `loup build` without writing to disk.

**`loup export-headers`** — Generate C headers from a compiled Loup module:

```
loup export-headers --target native mymodule.loup -o include/mymodule.h
loup export-headers --target native mymodule.loup -o mymodule.h --lang cpp
```

**`loup import-headers`** — Generate Loup `extern native` bindings from C headers:

```
loup import-headers --lib sqlite3 /usr/include/sqlite3.h -o bindings/sqlite3.loup
loup import-headers --lib ssl --lib crypto /usr/include/openssl/ssl.h -o openssl.loup
loup import-headers --hints openssl.hints /usr/include/openssl/ssl.h -o openssl.loup
```

**`loup add <package>[@version]`** — Resolve and add a dependency to `.lppkg`, update `loup.lock`, and precompile the newly added package's modules to the Wasm cache (§28.7).

**`loup install`** — Install all dependencies recorded in `loup.lock` and precompile each installed module to the Wasm cache. `loup install` is idempotent: packages with up-to-date cache entries are not recompiled.

```
loup install                    # install + precompile all deps
loup install --no-precompile    # install source only, skip Wasm cache
loup install --offline          # use only local cache; error if any dep is missing
loup install --locked           # CI mode: error if loup.lock would change;
                                #   ignores [dev-overrides] and LOUPPATH
```

When `loup install` processes `[dev-overrides]` entries, it compiles those packages to the **project-local cache** (`.loup/cache/`) rather than the global cache, so that locally-patched artifacts do not overwrite globally-shared entries. Published dependencies from `loup.lock` are written to the global cache as usual.

**`loup test`** — Discover and run test files. Test files match `**/*.test.loup`. Requires the `testing` core package (§13.8).

```
loup test                              # run all tests in the project
loup test path/to/file.test.loup       # run a specific test file
loup test --filter "addition"          # run tests whose name contains the filter string
loup test --watch                      # re-run on file change
```

**`loup publish`** — Publish a package to a registry. Requires prior `loup auth login`. If the project's `.lppkg` contains a `[dev-overrides]` section with any active entries, `loup publish` emits a warning listing the overridden packages and requires explicit confirmation (`--force`) before proceeding. The `[dev-overrides]` section is stripped from the manifest uploaded to the registry.

**`loup auth login`** — Authenticate with a registry and store credentials in the system keychain.

**`loup fmt`** — Format Loup source files using the reference formatter. Rewrites symbol logical operators to their canonical keyword forms: `&&` → `and`, `||` → `or`, `!` → `not` (see §3.7, §28.4).

**`loup check`** — Type-check without executing.

**`loup link <path>`** — Register a local package directory as a `[dev-overrides]` entry in the current project's `.lppkg`. Reads the `.lppkg` at `<path>`, adds an entry mapping its package name to that path, and compiles it to the project-local cache (`.loup/cache/`). Idempotent — running `loup link` on an already-linked path updates the cache if the source has changed.

```
loup link ../loup-http          # links the package at ../loup-http
loup link /home/dev/my-utils    # absolute path also accepted
```

**`loup unlink <package-name>`** — Remove the `[dev-overrides]` entry for `<package-name>` from the current project's `.lppkg` and delete the corresponding project-local cache entry. The package reverts to the version resolved from `loup.lock`.

```
loup unlink loup.http
loup unlink my-utils
```

**`loup cache clean`** — Remove all entries from the global Wasm cache (`~/.loup/cache/`). Does not affect the project-local cache.

**`loup debug attach`** — Connect to a running freestanding debug service (§24.25.8):

```
loup debug attach --uart /dev/ttyUSB0 --baud 115200
loup debug attach --tcp 192.168.1.100:2345
loup debug attach --semihosting
loup debug attach --uart /dev/ttyUSB0 --trace-swo /dev/ttyUSB1
```

Reads the portal name table from the target via `QUERY_PORTALS`, presents the portal activation interface, and optionally streams time-travel replay (`READ_REPLAY_BUFFER`). Requires a `--debug` freestanding binary with at least one channel configured (§24.25). See §24.25.8 for the full transport option reference.

**`loup cache clean --local`** — Remove all entries from the project-local cache (`.loup/cache/`) only. Does not affect the global cache.

**`loup cache clean --prune-orphans`** — Remove only global cache entries for packages no longer in `loup.lock`. Add `--local` to also prune the project-local cache.

**`loup cache info`** — List all cached entries with source hashes, toolchain versions, and sizes. Entries are grouped and labeled by cache tier:

```
Project-local cache (.loup/cache/):
  loup.http  2.1.0-dev  [toolchain 1.3.0]  src_hash: a1b2...  312 KB

Global cache (~/.loup/cache/):
  loup.http  2.0.4  [toolchain 1.3.0]  src_hash: c3d4...  308 KB
  loup.db    1.5.2  [toolchain 1.3.0]  src_hash: e5f6...  204 KB
```

### §28.2 Shebang Support

Unix-style shebang execution is supported:

```
#!/usr/bin/env loup run
let name = env("USER") ?? "world";
print(i"Hello, {$ name $}!");
```

### §28.3 REPL

The reference toolchain provides a REPL for exploratory scripting. The REPL:

- Supports `await` at the top level.
- Provides the script prelude.
- Sets `__name__` to `"__main__"` and `__file__` to `"<repl>"`.

### §28.4 Formatter

The reference formatter shares the parser and rendering rules used by execution. It formats Loup source files to a canonical style. Key formatting rules include:

**Canonical logical operators.** The formatter rewrites symbol logical operators to keyword forms in all positions — expressions, template fences, and condition clauses:

| Input (non-canonical) | Formatted output (canonical) |
|---|---|
| `a && b` | `a and b` |
| `a \|\| b` | `a or b` |
| `!expr` | `not expr` |
| `!!expr` | `not not expr` |
| `!(a && b)` | `not (a and b)` |

This rewrite is applied unconditionally. Lines annotated with `// loup:allow(symbol-logical-ops)` are exempt from the rewrite but must still parse as valid Loup. The annotation is preserved in the formatted output.

**Indentation.** The formatter uses 2-space indentation by default. The `indent_type` and `indent` descriptors on template fences are preserved.

**Trailing commas.** The formatter adds trailing commas to multi-line collection literals, function argument lists, and parameter lists.

**Semicolons.** Semicolons are optional in Loup (§3.3). The formatter preserves semicolons exactly as the programmer wrote them — it does not add missing semicolons or remove present ones.

### §28.5 Language Server

*(This section is non-normative.)*

The Loup reference toolchain ships a Language Server Protocol (LSP) 3.17-compatible
language server, `loup-lsp`. It integrates with any LSP-capable editor (VS Code,
Neovim, Emacs, JetBrains IDEs via the LSP plugin).

**Capabilities provided:**

| Capability | Notes |
|---|---|
| `textDocument/completion` | Keyword, type, identifier, and import completions |
| `textDocument/hover` | Type, doc-comment, and inferred-type display |
| `textDocument/definition` | Go-to-definition across files and packages |
| `textDocument/references` | Find all references including compiled-mode files |
| `textDocument/rename` | Safe rename across the project; respects `pub` visibility |
| `textDocument/diagnostics` | Type errors, lint advisories, and `E_*` error codes |
| `textDocument/formatting` | Invokes the reference formatter (§28.4) |
| `textDocument/inlayHint` | Inferred types on `let`/`var` bindings; lifetime labels |
| `textDocument/codeAction` | Quick-fixes for lint advisories (e.g. `symbol-logical-ops`) |
| `textDocument/semanticTokens` | Full semantic token classification |
| `workspace/symbol` | Project-wide symbol search |
| `loup/portals` | Non-standard: lists active portal names for the current module |

**Startup.** Start the server with:

```
loup lsp              # stdio transport (default, for most editors)
loup lsp --tcp 7777   # TCP transport
```

**Workspace detection.** The language server searches upward from the opened file
for a `.lppkg` manifest to determine the project root and dependency graph.
Multi-root workspaces are supported.

**Template fence support.** Inside template fences, completions and hover are
provided for Loup interpolation expressions (`{$ ... $}`). The fence body
(HTML, CSS, SQL, etc.) is forwarded to an embedded sub-server for that
language when available.

### §28.6 Browser Bootstrap and Performance

*(This section is non-normative.)*

A Loup browser application compiled with `loup build --target browser` produces the following output structure:

```
dist/
  index.html          # Minimal HTML shell (generated or user-provided)
  loup-rt.js          # Loup runtime bootstrap (~30 KB gzipped, versioned filename)
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
  <title>My Loup App</title>
  <!-- Preload hints: fetch Wasm before loup-rt.js has executed -->
  <link rel="preload" href="/app.wasm" as="fetch" type="application/wasm" crossorigin>
  <link rel="modulepreload" href="/loup-rt.1.0.0.js">
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/loup-rt.1.0.0.js"></script>
</body>
</html>
```

**Bootstrap sequence.** `loup-rt.js` executes the following steps on page load:

1. **Streaming instantiation.** Fetches `app.wasm` using `WebAssembly.instantiateStreaming()` so browser compilation begins as bytes arrive — download and compilation overlap. Falls back to `WebAssembly.instantiate()` when streaming is unavailable.
2. **Module initialization.** Runs the Wasm module's start function, executing top-level declarations.
3. **Event wiring.** Scans the DOM for `data-loup-ev` attributes and registers Wasm event handlers via `addEventListener`.
4. **Hydration (SSR only).** If `<script id="__loup_state__" type="application/json">` is present, reads the serialized state and initializes signals before mounting. Verifies `data-integrity` hash if present (§19.7).
5. **Mount.** Calls the application's entry point (`mount(App(), "#root")`).
6. **Web Component registration.** Before step 5, `loup-rt.js` calls `customElements.define(name, cls)` for each class annotated with `@webcomponent` in the loaded Wasm module. Registration follows source declaration order within each module and dependency module order across modules. This step occurs after Wasm instantiation (step 1) but before event wiring (step 3) and mount (step 5) to ensure custom elements are defined before any component tree that references them is rendered. The revised bootstrap order is therefore: **instantiate → initialize → register custom elements → wire events → hydrate → mount**.

**MIME type requirement.** Wasm modules must be served with `Content-Type: application/wasm` for streaming instantiation to succeed. `loup serve` sets this automatically. Production servers must be configured explicitly — many default configurations serve `.wasm` as `application/octet-stream`, which disables streaming and roughly doubles initialization time.

**Minimizing bootstrap latency.** The dominant factors affecting time-to-interactive, in decreasing order of impact:

1. **Wasm module size.** Use `loup build --target browser --release` for an optimized, stripped module. The `--release` flag enables dead-code elimination and Wasm-level optimization. A typical small-to-medium Loup application produces a 100–400 KB gzipped Wasm module. `loup-rt.js` is approximately 30 KB gzipped and is versioned for long-term caching.

2. **Brotli compression.** Deploy with Brotli when the server and client support it (all major browsers do). `loup build` produces pre-compressed `app.wasm.br` and `app.wasm.gz` files. Serve the `.br` variant with `Content-Encoding: br` when `Accept-Encoding` includes `br`. Brotli typically reduces size by 15–25% versus gzip.

3. **Preload hints.** The generated HTML shell includes `<link rel="preload">` for the Wasm module, instructing the browser to fetch it immediately on HTML parse — before `loup-rt.js` has executed — eliminating one network round-trip from the critical path.

4. **Runtime caching.** `loup-rt.js` uses a versioned filename (e.g., `loup-rt.1.0.0.js`) served with `Cache-Control: max-age=31536000, immutable`. Application Wasm filenames are content-hashed. Returning users skip both downloads entirely.

5. **SSR + hydration.** For content-heavy or SEO-sensitive applications, use the SSR path (`ui.web.renderToString`, §19.7). The browser receives meaningful HTML immediately; the Wasm bundle loads in the background and hydrates the rendered tree without a visible layout shift.

6. **Streaming Wasm compilation.** Modern browsers compile Wasm in a background thread while bytes are still downloading, provided the MIME type is correct. This is automatic when the MIME type is set correctly — no developer action required.

**`loup serve` (development server).** The development server:

- Serves `dist/` with correct MIME types including `application/wasm`.
- Serves `*.wasm.map` files with `Content-Type: application/json` and `Access-Control-Allow-Origin: *` so Chrome DevTools can fetch source maps from any local port.
- Watches source files and triggers incremental `loup build` on change.
- Sends a reload signal to connected browsers via a lightweight WebSocket after each successful rebuild.
- Sets `Cache-Control: no-cache` on all responses so rebuilt artifacts are always fresh.
- When started with `--inspect`, injects a debug bootstrap `<script>` into the served `index.html` that calls `debug.browser.start()` before the application entry point. See §28.6.2.

**CSP configuration.** The minimum required Content Security Policy is:

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'wasm-unsafe-eval';
  connect-src 'self';
```

No `'unsafe-inline'` or `'unsafe-eval'` is required. `'wasm-unsafe-eval'` permits Wasm evaluation but not `eval()` or `new Function()`.

### §28.6.1 Source Map Delivery

*(This section cross-references §2.1, which defines normative source map rules.)*

The following conventions apply to source map serving in both development and production contexts:

**File naming.** The source map for `app.wasm` is named `app.wasm.map`. The `//# sourceMappingURL=app.wasm.map` comment appended to the Wasm binary uses a relative URL. Absolute URLs are permitted when the map is served from a CDN separate from the Wasm file.

**MIME type.** Source map files must be served as `Content-Type: application/json`. Serving as `text/plain` or `application/octet-stream` causes Chrome DevTools to silently ignore the map.

**CORS.** Chrome DevTools fetches source maps from its own internal origin. The server must include `Access-Control-Allow-Origin: *` (or the specific DevTools origin) on source map responses. `loup serve` sets this automatically. Production servers must be configured explicitly.

**Inline maps.** `loup serve --inline-source-maps` appends a base64-encoded data URL as the `sourceMappingURL` instead of a separate file. Useful for single-origin development setups where CORS is not desired. Not recommended for production debug builds because inline maps significantly increase Wasm binary size.

**`x-loup-portals` extension field.** When `--debug` is specified, the source map includes a top-level `x-loup-portals` extension field: a JSON object mapping portal name strings to their Wasm byte offsets. Example:

```json
{
  "version": 3,
  "sources": ["src/app.loup"],
  "x-loup-portals": {
    "handlePayment": 4096,
    "onUserLogin": 8192
  }
}
```

The Loup DevTools Extension reads this field to place CDP breakpoints at portal entry points by name.

### §28.6.2 Debug Server Bootstrap (`--inspect`)

`loup serve --inspect` and `loup build --debug --inspect` activate the browser debug bridge:

**`loup serve --inspect`.** The development server injects the following script block immediately before the closing `</body>` tag of the served `index.html`:

```html
<script type="module">
  import { startDebug } from "/loup-rt.1.0.0.js";
  startDebug({ captureLocals: true, maxFrames: 10000 });
</script>
```

`startDebug` is an export of `loup-rt.js` that calls `debug.browser.start()` with the provided config. This wires the `postMessage` bridge before the application entry point runs, ensuring all portal registrations are visible to the Loup DevTools Extension.

**`loup build --debug --inspect`.** Embeds the `startDebug` call directly in the generated `index.html` shell. This is intended for staging environments where the Loup DevTools Extension should be connectable without running the development server.

**CSP note.** `--inspect` does not require `'unsafe-inline'`. The injected bootstrap is a `<script type="module" src="...">` external reference, not an inline script.

**Production note.** `--inspect` should not be used in production builds. The portal registry and trace event stream expose internal application structure. `loup build --release` without `--inspect` strips all `debug.browser` calls to no-ops.

### §28.7 Module Wasm Cache

*(This section is non-normative.)*

The **module Wasm cache** stores compiled Wasm artifacts for installed package modules, eliminating JIT compilation overhead on subsequent `loup run` invocations. The cache is managed automatically by `loup install` and `loup add`.

**Two-tier cache architecture.** The Wasm cache operates as two independent tiers looked up in order:

| Tier | Location | Written by | Cleared by |
|------|----------|-----------|------------|
| Project-local | `.loup/cache/` (relative to project root) | `loup link`, `loup install` for `[dev-overrides]` packages | `loup cache clean --local` |
| Global | `~/.loup/cache/` (or `$LOUP_CACHE_DIR`) | `loup install` for registry packages | `loup cache clean` |

On every cache lookup, the project-local tier is checked first. If a valid entry exists there, it is used and the global tier is not consulted. Otherwise, the global tier is checked.

**Cache location and layout:**

```
# Project-local cache
.loup/cache/
  loup.http/
    2.1.0-dev/
      1.3.0/                     # loup toolchain version
        net_http.wasm            # compiled module artifact
        net_http.hash            # SHA-256 of the source used to compile
        net_http.lppkg.sig       # absent for dev-override packages

# Global cache
~/.loup/cache/
  loup.http/
    2.0.4/
      1.3.0/
        net_http.wasm
        net_http.hash
        net_http.lppkg.sig       # signature sidecar (§13.5)
```

**Cache key.** A cache entry is valid if and only if:

1. The package name and version match.
2. The Loup toolchain version matches (ABI-breaking toolchain changes invalidate all entries).
3. The SHA-256 hash of the module's source files matches the `.hash` sidecar.

`loup run` checks all three conditions before deciding whether to JIT-compile or instantiate from cache. The check requires a single file read (the `.hash` sidecar) and is fast.

**Cache population.** `loup install` compiles each installed module's source to Wasm using the same optimizer settings as `loup build --target cli --release`, stores the result in the appropriate cache tier, and writes the source hash sidecar:

- **Registry packages** (resolved from `loup.lock`) → written to the global cache.
- **Dev-override packages** (from `[dev-overrides]` or `loup link`) → written to the project-local cache.

Precompilation runs in parallel across modules using all available CPU cores. On a modern machine with a warm build cache, `loup install` for a medium-sized project (20–50 packages) typically completes in under 10 seconds.

**`LOUPPATH` packages bypass the cache entirely** and always use the JIT pipeline. They are assumed to change frequently and cache invalidation on every save would exceed the benefit. See §13.9.

**Cache invalidation.** A cache entry is invalidated when:

- The module's source changes (hash mismatch).
- The Loup toolchain is upgraded (toolchain version component of the cache path changes).
- `loup cache clean` (global) or `loup cache clean --local` (project-local) is run explicitly.

Cache entries for removed packages are not automatically cleaned — use `loup cache clean --prune-orphans` to remove entries for packages no longer in `loup.lock`.

**Interaction with `prefer compiled`.** The fallback resolution algorithm (§13.7) checks both cache tiers (project-local first, then global) as part of its compiled-artefact search, before searching the source directory. A cache hit at either tier satisfies `prefer compiled`.

**User-authored modules.** The Wasm cache covers installed packages only. User-authored modules in the project's `src/` tree use the JIT pipeline with incremental re-compilation (§2.1). Persistent caching of user modules is left to a future incremental compilation cache feature (§30).

**.gitignore recommendation.** The following entries are recommended for projects using version control:

```
.loup/cache/
```

The global cache (`~/.loup/cache/`) is never committed — it lives outside the project tree. The project-local cache contains compiled artifacts that are fully reproducible from source and should not be committed.


### §28.8 Project-Local Cache and Development Isolation

*(This section is non-normative.)*

This section explains the design rationale for the two-tier cache and development isolation workflow.

**The problem.** The global Wasm cache (`~/.loup/cache/`) is shared across all projects on the machine. Its cache key is content-addressed: identical source + toolchain version always produces an identical entry. This means multiple projects can share cached artifacts for common dependencies with no duplication penalty.

The problem arises during **package development**: when a developer is actively modifying `loup.http` (for example) and that package has the same `name` and `version` as an entry already in the global cache, writing a newly-compiled artifact to the global cache would corrupt the entry that every other project on the machine depends on. A colleague's unrelated project that imports `loup.http@2.1.0` would silently pick up a partially-working development build.

**The solution.** Rather than replicating Python's full virtual environment model (which duplicates the entire stdlib and toolchain per project), Loup scopes isolation to the minimum needed:

- `[dev-overrides]` packages write to `.loup/cache/` (project-local) only.
- `LOUPPATH` packages bypass the cache entirely and use JIT.
- All other packages continue to use the global cache.

The project-local cache uses the same content-addressed key structure as the global cache, so the toolchain can find and validate entries using the same code path.

**Workflow summary:**

| How package is provided | Cache written | Cache read priority | Signature verified |
|------------------------|---------------|--------------------|--------------------|
| `loup.lock` (registry) | Global | Project-local, then global | Yes |
| `[dev-overrides]` / `loup link` | Project-local | Project-local only | No (local source) |
| `LOUPPATH` | None (JIT) | Not cached | No (local source) |

**Starting a development session:**

```sh
# Working on loup.http locally
git clone https://github.com/loup-lang/loup-http ../loup-http
cd my-project
loup link ../loup-http     # adds to [dev-overrides], compiles to .loup/cache/

loup run src/main.loup     # picks up local loup.http from .loup/cache/

# When done:
loup unlink loup.http      # reverts to registry version from loup.lock
```

**CI/CD.** In CI, always use `loup install --locked`. This ignores `[dev-overrides]`, `LOUPPATH`, and any local state, ensuring a fully reproducible build from `loup.lock` only.




The reference toolchain provides language-server diagnostics (LSP) for IDE integration, including:

- Real-time type checking and error reporting
- Autocompletion
- Go-to-definition
- Hover information
- Rename refactoring


### §28.9 Hardware Management Commands

*(Full specification moved to the [Loup Packages Reference](loup-packages-reference-v1_11.md).)*

Hardware management commands (`loup hardware detect`, `loup hardware compile`,
`loup hardware list`) are available when hardware backend packages are
installed.  See the Packages Reference §28.9 for the complete CLI reference.

## §29 Progressive Disclosure

*(This section is non-normative.)*

Loup is a single language and semantic model. There are no separate beginner and advanced dialects. However, the language is designed for progressive adoption with a three-tier learning path:

### Tier 1: Core Scripting

- Variable declarations (`let`, `var`)
- Functions (`func`)
- Control flow (`if`/`else`, `while`, `for`, `for-in`)
- Collections (`list`, `dict`, `set`, `tuple`)
- Imports (`from ... import`)
- Script prelude (`readText`, `writeText`, `exec`, `env`, `args`)
- Interpolated strings (`i"Hello, {$ name $}"`)
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
- Ownership verbs: `reads`, `edits`, `takes`, `shares` — parameter ownership contracts available in all modes (§23.4.9)
- `modifier` — class method mutation contracts (§23.4.11)

### Tier 3: Advanced

- Structured concurrency (`await group`, `TaskGroup`, `for await`)
- `ui` components and `ComponentRegistry`
- FFI (`extern js`, `extern native`, `@jsexport`)
- Reflection (`core.reflect`)
- Dynamic objects (`dynamic class`, `!{}`)
- Generators and `yield`
- Decorators
- `@mode(web.compiled)`, `@mode(host.dual)`, `@mode(host.native)`, `@mode(freestanding)` — execution modes (§2.4)
- `safe {}` / `safe func` — compile-time shared-XOR-mutable enforcement (§23.4.12)
- `synchronized` class — runtime-locked mutation for async and multi-threaded contexts (§23.4.13)
- `requires distinct()` — parameter disjointness contracts (§23.4.10)
- `unique class`, `arc let` — explicit ownership at the type and binding level (§8.11, §6.2)
- Freestanding mode: `asm { }`, `@interrupt`, `@volatile`, `@repr` (§24)
- Lifetime parameters (`lifetime ~name`, `borrow[~name]`) and region inference
- Macros
- Actors and supervision
- Direct capability objects (`runtime.fs`, `runtime.proc`, `runtime.net`)
- `debug` and time-travel debugging
- `atomic {}` — cooperative atomicity scope (§17.7)
- Freestanding debug portals and time-travel replay — dual-channel debug service, `FreestandingDebugConfig`, `ControlPollMode`, ring buffer retrieval via `READ_REPLAY_BUFFER` (§24.25)
- `@lockOrder(n)` — lock ordering contracts on `synchronized` classes (§23.4.13)
- `@interruptSafe` + `InterruptGuard` — interrupt-context safety in freestanding mode (§24.24)
- `@signalSafe` — signal handler safety annotation, native mode (§26.9)
- `reinterpretChecked[T, U]` — runtime-checked type reinterpretation (§24.18)
- `PartialInit[T]` — compile-time field-tracked struct initialization (§24.17a)
- `DmaBuffer[T]`, `native.dma` — ownership-mapped DMA for freestanding (§24.20)
- `native.atomic.hwFence` + `MemoryOrder` — hardware memory barriers (§24.20)
- `native.mpu` — MPU stack-guard installation (§24.20)
- `PinnedRef[T]`, `OwnedHandle`, `BorrowedHandle` — FFI ownership types (§18.4)

### Guidance

- Compiler diagnostics explicitly explain when a user crosses into advanced concepts.
- Generated project templates prefer task-focused entry points: `script`, `cli`, `generator`, `service`, `webapp`.
- Beginner-facing materials teach interpolated strings before template fences, `Option[T]` before `Result[T,E]`, and sync examples before async.
- WCET (worst-case execution time) and real-time deadline modeling are intentionally outside the language specification; see §30 for the rationale and future tooling integration notes.

---

## §30 Future Directions

*(This section is non-normative.)*

The following features are under consideration for future versions of the Loup specification:

- **WCET and timing constraints.** Worst-case execution time analysis, hard real-time deadline modeling, and timing-constraint annotations for safety-critical targets (automotive, medical, aviation) are explicitly out of scope for the Loup language specification. These capabilities belong in external static analysis tooling (e.g., a future `loup analyze --wcet` command) that operates on the compiled binary rather than the source language. The specification will document WCET tool integration points when such tooling is standardized.

- **Incremental compilation cache.** Fine-grained caching of compilation artifacts for faster rebuilds.
- **`loup lsp` improvements.** ARC cycle detection code actions, operator interface scaffolding, HTML context escaping hints.
- **`ui.desktop` rendering backend reference implementations.** The `ui.desktop` API contract is specified; Skia, WebGPU, and platform-native widget backends are reference implementations under active development.
- **WASI target.** `loup build --target wasi` for non-browser Wasm hosts.
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
- **Verb modifiers in function types with named parameters.** Full `fn(reads src: T, edits dst: T) requires distinct(src, dst): R` syntax for function type positions, enabling disjointness contracts on higher-order function parameters. Currently blocked by positional-only parameters in function types (§4.4).
- **Algebraic effects.** First-class effect handlers as an alternative to exceptions and async.

- **Async work-stealing tuning.** Adaptive work-stealing strategies and executor affinity hints for NUMA-aware scheduling.
- **Cycle-tolerant class kind details.** (`traced class` entry above.) Design details: an opt-in class modifier that commits to tracing-GC semantics in scripted and web modes — cycles are automatically reclaimed, finalizer timing is non-deterministic, scripted-only deployment. Deferred from v1.18 pending evidence of user demand beyond what manual `weak`-based cycle breaking provides.
- **User-module incremental compilation cache.** Persistent caching of compiled Wasm artifacts for user-authored modules (not just installed packages) across `loup run` invocations.
- **`net.ws` browser target.** Native `net.ws` client support on the `browser` target (currently uses `lang.interop.js` bridge).
- **`ThreadLocal[T]` on Wasm.** Now partially addressed in v1.18 via `SharedRef[T]` and shared-arena allocation; a full `ThreadLocal` emulation remains future work for cases where per-context storage is specifically desired rather than shared storage.
- **`loup.db` driver ecosystem.** Reference driver implementations for PostgreSQL, SQLite, and MySQL under the `loup.db.*` namespace.
- **`loup.ai` ecosystem.** Expand provider sub-packages and add `loup.ai.embeddings`, `loup.ai.vision`, and structured agent-loop primitives built on the actor model (§17.6) and portal debug infrastructure (§6.7).
- **TPU `ptx`-equivalent fence.** A `triton` or `mosaic` fence descriptor for authoring TPU kernels in a higher-level IR without writing raw StableHLO.
- **`native.hal` NUMA-aware scheduling.** Affinity hints for multi-socket CPU + multi-GPU + multi-TPU systems.
- **`loup.backend.rocm`.** AMD ROCm/HIP backend for AMD GPU ML workloads (alternative to Vulkan for compute-heavy tasks).
- **Int4 / FP8 dtypes.** `DType.Int4`, `DType.Float8E4M3`, `DType.Float8E5M2` for next-generation quantised inference on NVIDIA Hopper, AMD CDNA3, and TPU v5+.
- **Distributed tensor ops.** `loup.tensor.distributed` — multi-device tensor sharding, all-reduce, and pipeline parallelism primitives.
- **`loup.backend.tpu.pjrt` auto-discovery.** Automatic detection of third-party PJRT plugins from standard install paths without requiring `PJRT_PLUGIN_PATH`.
- **Streaming serialization.** Extension of §32.10 `FormatDriver` with full streaming contracts — chunked encoding, progressive validation, partial-value emit, and back-pressure handling. The `StreamingFormat` sub-interface is declared in v1.18 but its contract is thin; a future revision pins down streaming semantics for each format-driver category.
- **IDL / schema generation.** A `loup schema export --format proto|fbs|openapi|...` command that produces wire-format schema files from `Serializable` types. Enables cross-language interop where the peer ecosystem consumes a schema file (Python/TypeScript/Rust) rather than importing Loup's type graph directly.
- **Cross-language type-mapping registry.** A normative mapping from Loup types (`int32`, `decimal`, `Instant`, `Option[T]`, `Result[T, E]`, etc.) to equivalent types in Python, TypeScript, Rust, Go, and JVM languages, to aid interop library authors.
- **RPC library (`loup.rpc`).** A first-party package building on §32 for request/response framing, timeout/retry semantics, bidirectional streaming, service discovery, and automatic exception forwarding via `RemoteException`. Will integrate with `debug.mcp` for agent-accessible RPC inspection.
- **Content-addressed data store (`loup.content`).** Built on the `deterministic: true` mode of §32.10 `EncodeConfig` — a persistent key-value store keyed by blake3 hash of the canonicalised `Value` representation. Enables cache-like semantics, Merkle-style data structures, and signed-data workflows without per-project encoding conventions.
- **Partial deserialization / lazy fields.** Annotation (`@lazy`) for fields whose deserialization is deferred until first access. Reduces deserialization cost for large values where most fields are never read.
- **Cycle-tolerant class kind (`traced class`).** Previously noted: an opt-in class modifier that commits to tracing-GC semantics in scripted and web modes for cyclic data structures.


---

## §31 Hardware Backend Lifecycle

*(Non-normative. Full specification moved to the [Loup Packages Reference](loup-packages-reference-v1_11.md).)*

The hardware backend lifecycle (detection, compilation, registration, staleness
policy) is described in the Packages Reference §31.

## §32 Serialization Foundation

*(This section is normative. It specifies the foundational contracts that
wire-format packages (JSON, MessagePack, CBOR, Protobuf, etc.) and RPC
libraries build upon. This section does NOT specify any particular wire
format — those are shipped as separate packages. It also does NOT specify
an RPC protocol — that is left to future work. The goal of this chapter is
to fix the shape of the serialization surface so that all future
serialization work in the Loup ecosystem is interoperable.)*

### §32.1 Overview and Design Principles

Loup's serialization foundation rests on six design principles:

1. **Trait-based, not reflection-based.** Types opt into serialization by
   implementing `Serializable` and/or `Deserializable`. The compiler can
   auto-derive implementations from type declarations (§32.4) but never
   serializes a type that has not been marked. This eliminates the entire
   class of deserialization-as-code-execution vulnerabilities that have
   plagued reflection-based systems.

2. **Format-agnostic intermediate representation.** Every `Serializable`
   type knows how to produce a `Value` (§32.2) — a tagged union covering the
   information categories that every reasonable wire format supports. Each
   format driver knows how to lower `Value` to its bytes. This decouples
   type authors from format authors.

3. **Strict composition.** A type is `Serializable` only if all of its
   serialized fields are `Serializable`. There is no "best effort" or
   silent field omission. If a class contains a field of a non-serializable
   type, the class author must either mark the field `@skip`, provide a
   manual `toValue`/`fromValue` implementation, or wrap the field in a
   serializable adapter type.

4. **Polymorphism preserves identity.** A value serialized as a subclass
   of its declared type can be reconstructed as that subclass, provided the
   receiver has registered the subclass as `Deserializable`. The default
   is structural (declared-type fields only); polymorphism is opt-in via
   `@polymorphic` or `@tagged(...)`. `BaseException` and all its subclasses
   are implicitly `@polymorphic` — this is a language-level guarantee.

5. **Evolution is explicit.** Adding a field with a default, adding an
   enum variant, and renaming-with-alias are all forward-compatible. Every
   other change is explicitly breaking, and the type author must bump the
   type's URI major version (§32.5) to reflect that.

6. **Security by construction.** Deserialization can only construct types
   registered as `Deserializable`. Unknown type URIs produce controlled
   errors, never silent fallbacks. Input size and depth are bounded by the
   format driver. No field initializers or constructors run during
   deserialization except the explicit deserialization path.

**Scope.** The foundation specifies:

- The `Value` intermediate representation
- The `Serializable` / `Deserializable` traits
- Auto-derivation rules for classes, structs, enums
- Type URI format and the `@serializationId` annotation
- Polymorphism via `@polymorphic` and `@tagged`
- Field-level annotations
- Compatibility rules for type evolution
- The Exception serialization contract including `RemoteException`
- The format driver protocol
- The security model

The foundation does NOT specify:

- Any specific wire format (JSON, MessagePack, etc. — these are packages)
- Streaming or chunked serialization (future work)
- Schema languages (IDLs) or cross-language code generation (future work)
- RPC semantics, versioning, or transports (future work)

### §32.2 The `Value` Intermediate Representation

Every `Serializable` type converts to and from a value of type `core.serialization.Value`:

```loup
namespace core.serialization;

pub enum TemporalKind {
  Instant;          // moment in time (UTC)
  DateTime;         // calendar date + time with offset
  Date;             // calendar date (no time)
  Time;             // time of day (no date)
  Duration;         // elapsed time (signed)
}

pub enum Value {
  Null;
  Bool(bool);
  Int(int64);
  UInt(uint64);
  BigInt(bigint);
  Float32(float32);
  Float64(float64);
  Decimal(decimal);
  String(string);
  Bytes(bytes);
  List(list[Value]);
  Map(list[(Value, Value)]);              // ordered — preserves insertion order
  Variant { tag: string; fields: Value }; // enum-with-payload
  Tagged { typeUri: string?; value: Value }; // optional type identity
  Temporal { kind: TemporalKind; repr: Value }; // calendar types
}
```

**Design notes:**

- **No `Any`.** Serialization of `Any` requires explicit `@polymorphic` with a concrete type registry; there is no wildcard escape.
- **Distinct `Float32` / `Float64`.** Some formats (Protobuf, CBOR) distinguish these; preserving the distinction avoids precision loss on round-trip.
- **Distinct `Int` / `UInt` / `BigInt`.** Arbitrary-precision integers are first-class — no "string-encoded integer" kludge is permitted at this layer.
- **`Decimal` is first-class.** Financial systems require exact decimal semantics; a float-based representation would silently corrupt values.
- **`Bytes` is first-class.** Binary blobs must not be string-encoded at this layer (formats may base64 them as they see fit).
- **`Map` preserves order.** JSON objects nominally don't, but every major JSON library does preserve insertion order, and deterministic serialization matters for content-addressed storage, cryptographic signing, and cache keys.
- **`Variant` separates tag from payload.** This matches the enum memory model and serializes cleanly to tagged wire representations (Protobuf `oneof`, JSON `{"type": "...", "payload": ...}`, etc.).
- **`Tagged` optionally carries a type URI.** Used by `@polymorphic` types; absent for structurally-serialized types.
- **`Temporal` is structured.** Date/time types are infamously mishandled in serialization. A structured representation prevents "accidentally a string" bugs and enables format-appropriate encoding (RFC 3339 for JSON, numeric nanoseconds for Protobuf, native `tag 0/1` for CBOR).

**Helper methods:**

```loup
namespace core.serialization;

class Value {
  // Type predicates
  pub func isNull(): bool;
  pub func isScalar(): bool;    // primitives only (no collections/variants)
  pub func isCollection(): bool; // List, Map
  pub func kind(): ValueKind;

  // Safe accessors — return Option, never throw
  pub func asBool(): Option[bool];
  pub func asInt64(): Option[int64];
  pub func asFloat64(): Option[float64];
  pub func asString(): Option[string];
  pub func asBytes(): Option[bytes];
  pub func asList(): Option[list[Value]];
  pub func asMap(): Option[list[(Value, Value)]];

  // Path navigation for ergonomic access (e.g. for hand-written parsers)
  pub func get(key: string): Option[Value];   // Map lookup
  pub func at(index: int): Option[Value];     // List lookup
  pub func path(path: string): Option[Value]; // "a.b.c" dotted notation
}

pub enum ValueKind {
  Null; Bool; Int; UInt; BigInt; Float32; Float64; Decimal;
  String; Bytes; List; Map; Variant; Tagged; Temporal;
}
```

### §32.3 `Serializable` and `Deserializable` Traits

Two trait interfaces form the core contract:

```loup
namespace core.serialization;

pub interface Serializable {
  // Convert this value to a Value. MUST be pure (no side effects) and
  // deterministic (same input produces same output). MUST NOT throw
  // under normal conditions; any failure indicates a programming error
  // and the implementation MUST raise SerializationError.
  func toValue(): Value;

  // The type URI of this instance's dynamic type (§32.5). For non-
  // polymorphic types, MAY return None; for @polymorphic types MUST
  // return the correct URI for the instance's dynamic type.
  func serializationId(): Option[string];
}

pub interface Deserializable {
  // Construct an instance of this type from a Value. MUST be pure and
  // idempotent: fromValue(x.toValue()) SHALL produce a value equivalent
  // to x for all x of this type.
  //
  // Throws DeserializationError on schema mismatch, field mismatch,
  // or any violation of the type's invariants.
  static func fromValue(v: Value): Self;

  // The type URI this type deserializes. Used by polymorphic dispatch
  // (§32.6) to locate the deserializer for a given incoming type URI.
  static func serializationId(): string;
}
```

**Self-type in `Deserializable`.** `Self` refers to the implementing type.
This is the only place in the Loup type system where `Self` appears as a
return type of a static method; the compiler emits the appropriate
dispatch to the concrete implementation.

**Symmetry.** A type MAY implement `Serializable` without `Deserializable`
(write-only, e.g. log records with constructor-computed fields that
cannot be round-tripped). A type MAY implement `Deserializable` without
`Serializable` (read-only, e.g. parsing an external format where
serialization is handled separately). A type that implements both is
called **round-trip serializable** and its implementations MUST satisfy
the idempotence rule above.

**Compile-time strict composition.** If a class declares
`implements Serializable` and contains a serialized field of a type that is
not `Serializable`, the compiler emits `E_FIELD_NOT_SERIALIZABLE` pointing
at the offending field. The type author resolves this by one of:

- Marking the field `@skip` (it will not be serialized; deserialization
  uses the field's default).
- Providing a `@serialVia[Adapter]` annotation pointing at a
  `SerializationAdapter[T]` that converts the field's type to a
  `Serializable` type.
- Making the field's type `Serializable`.
- Writing a manual `toValue()` implementation and using `@manual` on the
  class declaration to opt out of auto-derivation.

The same rule applies to `Deserializable`. A class cannot silently ship
with partially-working serialization.

**Serialization adapters.** For fields whose types are not directly
`Serializable` (e.g., external types from packages the author doesn't own),
users provide adapters:

```loup
namespace core.serialization;

pub interface SerializationAdapter[T] {
  static func toValue(value: T): Value;
  static func fromValue(v: Value): T;
}

// Usage:
class PaymentRecord implements Serializable, Deserializable {
  let id: string;
  let amount: decimal;
  @serialVia[LegacyTimestampAdapter]
  let createdAt: LegacyTimestamp;  // not Serializable on its own
}

class LegacyTimestampAdapter implements SerializationAdapter[LegacyTimestamp] {
  static func toValue(value: LegacyTimestamp): Value {
    return Value.Int(value.epochMillis);
  }
  static func fromValue(v: Value): LegacyTimestamp {
    match v {
      Value.Int(ms) => return LegacyTimestamp.fromEpochMillis(ms);
      _ => throw DeserializationError("expected integer for LegacyTimestamp");
    }
  }
}
```

Adapters are the clean escape hatch for third-party types and legacy
integrations, and they preserve strict composition at the type-checker level.

### §32.4 Auto-Derivation Rules

For the common case — classes and structs whose fields are all
`Serializable` / `Deserializable` — the compiler auto-derives the trait
implementations when the type declares `implements Serializable`,
`implements Deserializable`, or both:

```loup
class User implements Serializable, Deserializable {
  let id: string;
  let email: string;
  let createdAt: Instant;
  let roles: list[string];
}
// No explicit toValue / fromValue required — compiler generates both.
```

**Derivation output for classes and structs.** The generated `toValue()`
produces a `Value.Map` whose entries are `(Value.String(fieldName),
fieldValue.toValue())` in source-declaration order. Fields marked `@skip`
are excluded. Fields marked `@alias("wireName")` use the alias as their key.
`@skipIfDefault` fields are omitted when equal to their declared default.

The generated `fromValue()` matches the incoming `Value.Map` entries
against the type's fields and invokes the field types' `fromValue`
methods. Unknown keys are handled per §32.8. Missing required keys throw
`DeserializationError`.

**Derivation output for enums.** Enum variants with no payload serialize
as `Value.String(variantName)`. Variants with a payload serialize as
`Value.Variant { tag: variantName, fields: payloadAsValue }`. Enum
derivation automatically handles both cases and produces the matching
`fromValue`.

**Derivation output for tuples.** A tuple `(A, B, C)` where A, B, C are
all `Serializable` serializes as `Value.List([a.toValue(), b.toValue(),
c.toValue()])`. Deserialization reverses this.

**Derivation output for `Option[T]` and `Result[T, E]`.** `None` serializes
as `Value.Null`; `Some(v)` serializes as `v.toValue()`. `Ok(v)` serializes
as `Value.Variant { tag: "Ok"; fields: v.toValue() }`; `Err(e)` as
`Value.Variant { tag: "Err"; fields: e.toValue() }`.

**Derivation for `shared class`.** A `shared class` whose fields are all
`Serializable` may opt into auto-derivation via `implements Serializable`
identically to `local class`. The `toValue()` output is byte-compatible
with a structurally-equivalent `local class` — serialization is
memory-strategy-agnostic (see §32.12). `shared class` instances are
auto-derived as `Shareable` separately from `Serializable`; the two traits
are orthogonal.

**Inheritance.** When a class inherits from a class that implements
`Serializable`, the subclass's auto-derived `toValue` includes the
superclass's serialized fields first (in declaration order), followed by
the subclass's own fields. For polymorphic dispatch, the subclass's
`serializationId()` returns the subclass's URI.

**Generic types.** A generic class can be conditionally serializable —
`Box[T]` implements `Serializable` if and only if `T` does. This mirrors
the conditional-`Sendable` mechanism (§17.8.1). Declare the conditional
implementation with a `where` clause:

```loup
class Box[T] : Any
  implements Serializable   where T: Serializable,
  implements Deserializable where T: Deserializable
{
  pub let value: T;
  new(value: T) { this.value = value; }
}
```

Under the conditional implementation:

- `Box[int]` is `Serializable` and `Deserializable` (int satisfies both).
- `Box[User]` is `Serializable`/`Deserializable` iff `User` is.
- `Box[LocalFileHandle]` is neither, if `LocalFileHandle` is not serializable.

**Conditional-trait declaration syntax.** The `implements` clause on a
generic type may be constrained by `where` to apply only for certain type
argument combinations:

```loup
class Box[T] implements Serializable where T: Serializable,
                    implements Deserializable where T: Deserializable {
  pub let value: T;
  new(value: T) { this.value = value; }
}
```

Each `implements` clause may carry its own `where` constraint. A type
argument that satisfies the constraint participates in that implementation;
one that does not, does not. This is resolved at compile time when the
generic is instantiated.

Stdlib generic container types (`list[T]`, `dict[K, V]`, `set[T]`,
`Option[T]`, `Result[T, E]`, tuples, `SharedRef[T]`, `Atomic[T]`) all have
pre-declared conditional `Serializable` / `Deserializable` implementations
of this form — no user declaration is needed to serialize a `list[User]`
or a `SharedRef[Config]` once `User` / `Config` are themselves serializable.

**Opt-out from auto-derivation.** A class with `@manual` on its declaration
retains the `implements Serializable` declaration but does not get an
auto-derived body; the user must provide `toValue`/`fromValue` manually.

### §32.5 Type Identity and URIs

Every polymorphic type has a **type URI** — a globally unique, version-
scoped name that identifies the type on the wire. The canonical form is:

```
<package-name>/<module-path>/<type-name>@<major-version>
```

**Examples:**
- `loup.http/errors/HttpConnectionError@2`
- `myapp/models/User@1`
- `loup.stdlib/core/Option@1`

**Field meanings:**

- `<package-name>` — the package name from `.lppkg`. For stdlib types,
  this is `loup.stdlib`. For user-project types with no published package
  (running locally), this is `_local_` followed by the first 16 lowercase
  hex characters of SHA-256 applied to the absolute path of the project's
  `.lppkg` file — e.g., `_local_3a7b9c2d4e6f1a8b`. This prevents URI
  collisions when developers share serialized data across machines with
  independent projects, at the cost of a URI that changes if the project
  moves on disk. Packages that eventually publish (assign a real package
  name) become wire-incompatible with their `_local_*` predecessor — this
  is intentional; users who need wire stability across the publish boundary
  declare `@serializationId` explicitly from the start.
- `<module-path>` — dotted path from package root to the declaring module,
  e.g. `errors` for a module at `src/errors.loup` or `net.http.errors` for
  nested modules.
- `<type-name>` — the declared type name.
- `<major-version>` — a monotonically increasing integer matching the
  type's major-version number. Starts at 1. Bumped when a breaking change
  is made to the type (per §32.8).

**Automatic URIs.** The compiler automatically assigns a type URI to
every `Serializable` type with major-version 1. Users bump the version
explicitly when making breaking changes (see §32.8).

**Explicit URIs via `@serializationId`.** Users can override a type's URI
for cross-language interop or for renaming a type without breaking
wire compatibility:

```loup
@serializationId("com.example.auth/User@3")
class User implements Serializable, Deserializable {
  // ...
}
```

The explicit URI must match the canonical format (package/module/name@version)
and must be unique within the project. The compiler emits
`E_SERIAL_URI_COLLISION` if two types declare the same URI.

**URI stability rules.**

- The URI MUST NOT change for non-breaking edits (adding an optional field
  with a default, renaming a field with `@alias`, reordering fields).
- The URI's major-version MUST be bumped for breaking edits (removing a
  field, renaming without alias, changing a field's type incompatibly).
- A type that rolls out with multiple coexisting versions publishes both
  URIs and deserialization logic for both — typically by declaring the
  old type `@deprecated` and providing a migration function.

**URI resolution.** When a deserializer receives a `Value.Tagged` with a
URI, it consults its type registry to find the matching `Deserializable`
implementation. The registry is populated at compile time from all
`Deserializable` declarations visible to the compiled module. A URI with
no registered handler is handled per the polymorphism rules (§32.6) — for
exceptions, it becomes `RemoteException`; for other polymorphic families,
it produces `UnknownTypeError`.

### §32.6 Polymorphic Serialization

The default serialization behavior is **structural**: a value's static
(declared) type determines what gets serialized. A `list[Exception]`
with `IoError` and `TimeoutError` elements would, under structural rules,
lose the subclass distinction.

**Polymorphic types** carry their dynamic type identity on the wire. A
type opts into polymorphism in one of two ways:

**`@polymorphic` annotation.** Placed on a class declaration, marks the
class and all its subclasses as polymorphic. Serialized instances are
wrapped in `Value.Tagged` carrying the dynamic type's URI:

```loup
@polymorphic
class Shape implements Serializable, Deserializable {
  let color: string;
}

class Circle : Shape {
  let radius: float64;
}

class Rectangle : Shape {
  let width: float64;
  let height: float64;
}
```

A `list[Shape]` containing a `Circle` and a `Rectangle` serializes as:

```
Value.List([
  Value.Tagged {
    typeUri: "myapp/shapes/Circle@1",
    value: Value.Map([("color", "red"), ("radius", 5.0)])
  },
  Value.Tagged {
    typeUri: "myapp/shapes/Rectangle@1",
    value: Value.Map([("color", "blue"), ("width", 3.0), ("height", 4.0)])
  }
])
```

Deserialization dispatches on the URI to reconstruct the correct subclass.

**`@tagged(discriminator)` annotation.** Places the type tag inside the
serialized `Value.Map` as a named field rather than wrapping in
`Value.Tagged`. This matches how many wire formats (Protobuf `oneof`,
JSON discriminated unions) conventionally represent polymorphism:

```loup
@tagged("kind")
class Event implements Serializable, Deserializable {
  let timestamp: Instant;
}

class LoginEvent : Event {
  let userId: string;
}
```

A `LoginEvent` under `@tagged("kind")` serializes as:

```
Value.Map([
  ("kind", "myapp/events/LoginEvent@1"),
  ("timestamp", Value.Temporal { ... }),
  ("userId", "u123")
])
```

The `@tagged` form is friendlier for JSON consumers; the `@polymorphic`
form is more efficient for binary formats with native tagging.

**Implicit polymorphism for `BaseException`.** All `BaseException`
subclasses are implicitly `@polymorphic`. This is a language-level rule
that cannot be overridden — exceptions always carry their dynamic type on
the wire. See §32.9 for details.

**Sealed polymorphism.** Enum types are implicitly polymorphic without
annotation: their variant tag IS the dynamic type identity. No `@polymorphic`
is needed.

**Registry bounds for deserialization.** A `@polymorphic` family's
deserialization registry includes exactly those subclasses registered as
`Deserializable` at the receiver's compile time. An incoming URI not in
the registry is `UnknownTypeError` (for user types) or produces
`RemoteException` (for `BaseException` subclasses).

**Closed polymorphism with `@sealed`.** Users may declare a polymorphic
hierarchy `@sealed` to indicate that all valid subclasses are known at
compile time. Deserialization of an unknown URI in a sealed hierarchy is
a hard error (`DeserializationError`), not an unknown-type fallback.
Sealed hierarchies are appropriate for internal data models; open
hierarchies are appropriate for protocols designed for third-party
extension.

### §32.7 Field-Level Annotations

The following annotations control per-field serialization behavior:

**`@serialField(name: string)`** — Alias for `@alias`; overrides the wire
name of a field. Useful for matching external schemas or legacy data.

```loup
class User implements Serializable, Deserializable {
  @serialField("user_id")
  let id: string;

  @serialField("email_address")
  let email: string;
}
```

**`@alias(name: string, ...)`** — One or more additional names the
deserializer accepts for a field. The primary serialized name remains the
field's declared name (unless `@serialField` also applies). Used during
schema migrations.

```loup
class User implements Serializable, Deserializable {
  @alias("username", "user_name")    // accepts both on read
  let name: string;                   // writes as "name"
}
```

**`@skip`** — The field is not serialized. On deserialization the field
receives its declared default. A field marked `@skip` with no default
causes `E_SKIP_NO_DEFAULT` at compile time.

**`@skipIfDefault`** — The field is omitted from serialization when its
value equals the declared default. Useful for reducing wire size for
optional-ish fields.

**`@sensitive`** — Marks a field as containing sensitive data (passwords,
tokens, PII). Format drivers SHOULD redact sensitive fields in debug
output; compliant drivers MUST provide a mode flag to serialize or omit
them entirely. The default mode is **include-and-mark**: the field is
serialized normally, but the format driver attaches out-of-band metadata
flagging it. Drivers targeting logging or debugging contexts SHOULD
replace sensitive values with a redacted marker. RPC bodies sent across
network boundaries SHALL include them unless the caller opts into
sensitivity-aware serialization.

**`@serialVia[Adapter]`** — Specifies a serialization adapter for the
field (§32.3). The adapter converts the field's non-serializable type to
and from a `Value`.

**`@deprecated(reason: string)`** — Marks a field as deprecated. Does not
affect serialization behavior but emits a lint warning when the field is
accessed and a note in generated schema documents.

**`@optional`** — On a required-looking field (one without a declared
default), treats the field as optional for deserialization — missing
inputs produce an implicit `None` (for `Option[T]` fields) or the type's
zero value. Should be rare; prefer declaring defaults.

**Annotation interaction.**

- `@skip` and `@skipIfDefault` are mutually exclusive (`E_SKIP_BOTH`).
- `@alias` and `@serialField` may coexist; `@serialField` sets the primary
  name and `@alias` adds additional accepted names for reads.
- `@sensitive` is independent of and composes with all other annotations.

### §32.8 Evolution and Compatibility Rules

The foundation specifies the following changes and their compatibility
status:

| Change | Compatibility | Versioning |
|---|---|---|
| Add a field with a default | Forward- and backward-compatible | No URI bump; `@since` SHOULD be documented |
| Add a field without a default | Breaking | Major URI bump required |
| Remove a field | Breaking (old receivers miss it) | Major URI bump required |
| Rename a field (without alias) | Breaking | Major URI bump required |
| Rename a field (with `@alias` to old name) | Forward- and backward-compatible | No URI bump |
| Change a field's type to a compatible type (`int32` → `int64`, `string` → `string?`) | Forward-compatible (old senders work; new receivers OK) | No URI bump if documented |
| Change a field's type to an incompatible type | Breaking | Major URI bump required |
| Add an enum variant | Breaking for receivers that don't handle unknown variants | Major URI bump unless enum is `@open` (see below) |
| Remove an enum variant | Breaking (new receivers can't handle old values) | Major URI bump |
| Mark a field `@deprecated` | Non-breaking | No URI bump |
| Mark a field `@skip` | Breaking (previously-serialized data is now lost on round-trip) | Major URI bump |
| Change a polymorphism annotation (`@polymorphic` ↔ `@tagged`) | Breaking | Major URI bump |

**`@open` enums.** An enum may be marked `@open` to declare that new
variants may be added in future versions without a URI bump. Receivers
handling an unknown variant of an `@open` enum produce an
`UnknownEnumVariant` wrapper value (accessible via `match`); the message
remains deserializable. Most user enums should NOT be `@open`; protocol
enums designed for extension SHOULD be.

**Default-fallback behavior.** For fields added with defaults, if an old
serialized value doesn't contain the field, the deserializer inserts the
default. If a new serialized value contains a field that the deserializer's
type doesn't know about, the behavior depends on `@strictSchema`:

- Without `@strictSchema`, unknown fields are silently ignored (the
  default — permissive).
- With `@strictSchema`, unknown fields produce
  `DeserializationError`. Appropriate for cryptographic or financial
  contexts where extra fields may signal tampering or bugs.

**Migration helpers.** The stdlib provides `core.serialization.migrate`:

```loup
namespace core.serialization;

pub func migrate[T: Deserializable](
  oldValue: Value,
  oldTypeUri: string,
  fromOld: fn(Value): T,
): T;
```

`migrate` is invoked when a type has rolled over its major version and a
receiver encounters a serialized value with the old URI. The author of
the new type registers a migration function via `@migrateFrom`:

```loup
@serializationId("myapp/User@2")
@migrateFrom("myapp/User@1", migrateUserV1)
class User implements Serializable, Deserializable {
  let id: string;
  let fullName: string;   // was "name" in v1
}

func migrateUserV1(oldValue: Value): User {
  let m = oldValue.asMap()!;
  let id = m.findKey("id").asString()!;
  let name = m.findKey("name").asString()!;
  return User(id: id, fullName: name);
}
```

Multiple `@migrateFrom` annotations chain: v3 can specify migrations from
v2 and from v1 separately. The runtime picks the most specific match.

### §32.9 Exception Serialization

*(This subsection is normative.)*

All `BaseException` subclasses have a mandatory serialization contract.
Exception serialization preserves dynamic type, message, cause chain, and
symbolic stack trace across any process or language boundary.

**Contract.** Every `BaseException` subclass is implicitly
`@polymorphic`. The auto-derived `toValue()` produces a `Value.Tagged`
with:

- `typeUri` — the exception's type URI (per §32.5).
- `value` — a `Value.Map` containing the following keys in this order:
  - `"message"` — `Value.String`
  - `"cause"` — either `Value.Null` or a nested serialized exception (recursively)
  - `"stackTrace"` — a `Value.List` of serialized `StackFrame` entries
  - Any additional user-declared fields, serialized per their types

**StackFrame serialization.** `StackFrame` is a struct:

```loup
namespace core;

pub struct StackFrame implements Serializable, Deserializable {
  pub let module: string;          // e.g. "myapp.http.client"
  pub let function: string;         // e.g. "sendRequest"
  pub let file: Option[string];     // absolute path on originating machine
  pub let line: Option[int];
  pub let column: Option[int];
  pub let functionUri: Option[string];  // stable function identity (if available)
}
```

Serialization preserves frames symbolically — no machine-specific data
(process ID, absolute memory addresses) crosses the boundary. Receivers
can re-resolve `functionUri` against their own source maps if desired.

**`RemoteException` — the unknown-URI fallback.** When a deserializer
encounters a `Value.Tagged` whose `typeUri` refers to a `BaseException`
subclass that is not registered as `Deserializable` on the receiver, it
produces a `RemoteException` instance:

```loup
namespace core;

pub class RemoteException : Exception {
  pub let originalTypeUri: string;
  pub let originalFields: dict[string, Any];
  // Inherited: message (from BaseException), cause, stackTrace
}
```

`RemoteException` carries:

- `originalTypeUri` — the URI the sender attached.
- `originalFields` — every serialized field that wasn't reconstructed into
  a known field on `RemoteException`'s class (as deserialized `Value`
  converted to `Any`).
- The standard `message`, `cause`, and `stackTrace` inherited from
  `BaseException` — which ARE always reconstructed because they are part
  of the root exception contract.

This design means: **a Loup receiver can always debug a remote exception
even from a language or package it has never heard of.** The type URI tells
it what was thrown, the message tells it why, the cause chain shows the
upstream failure, and the stack trace shows where it came from.
`RemoteException` can itself be caught in normal `try`/`catch`; callers
match on `originalTypeUri` if they need to branch on specific remote types.

**Cause chain preservation.** A `BaseException` with a non-null `cause`
serializes the cause recursively. The cause may itself be a
`BaseException` (nested exception) or a non-exception value (arbitrary
`Serializable` caused-by annotation). Deeply-nested cause chains are
bounded by the format driver's depth limit (§32.11); exceeding the limit
truncates the chain and appends a synthetic `CauseTruncatedException` at
the deepest point.

**Receiver rewriting of stack traces.** Receivers MAY rewrite the
`stackTrace` frames upon receipt to mark them as remotely-sourced, prepend
frames showing the local call site that received the exception, or
otherwise aid debugging. This MUST be done in a non-destructive way — the
original frames MUST remain identifiable (e.g. by a `remote: bool` flag
added to each frame in a receiver-specific way, not specified normatively).

**Security implications.** Because `RemoteException` instantiation is
purely data-driven — no code path runs from the sender's side — there is
no deserialization-as-code-execution surface even when receiving
exceptions from fully untrusted senders.

**Non-catchable BaseException subclasses.** `SystemExit`,
`KeyboardInterrupt`, and `GeneratorExit` are serializable under this
contract (they are `BaseException` subclasses) but deserializing them into
a running program produces a `SecurityError` — allowing a remote endpoint
to inject a `SystemExit` into a local process would be a vulnerability.
The intent of these types is local-process lifecycle signaling, not cross-
boundary transport. Applications that legitimately need to propagate these
across boundaries do so by wrapping them in a regular `Exception`
subclass.

### §32.10 Format Driver Protocol

A **format driver** is a type that converts between `Value` and a specific
wire format (JSON, MessagePack, CBOR, etc.). Format drivers live in
separate packages (e.g., `loup.format.json`); the language foundation
specifies only the interface they implement.

```loup
namespace core.serialization;

pub interface FormatDriver {
  // Driver identity — stable name used in content-type headers, debug output.
  static func name(): string;
  static func contentType(): string;   // e.g. "application/json"

  // Serialize a Value to the driver's wire format.
  // MUST respect the config's limits (§32.11).
  static func encode(value: Value, config: EncodeConfig = EncodeConfig.default()): bytes;

  // Deserialize a Value from the driver's wire format.
  // MUST reject inputs exceeding the config's limits with DeserializationError.
  static func decode(bytes: borrow bytes, config: DecodeConfig = DecodeConfig.default()): Value;

  // Streaming form — encodes to a writer and decodes from a reader.
  // Optional for foundation; all drivers MUST provide the non-streaming form.
  static func encodeStream(value: Value, writer: io.Writer, config: EncodeConfig): void
    where Self: StreamingFormat;
  static func decodeStream(reader: io.Reader, config: DecodeConfig): Value
    where Self: StreamingFormat;
}

pub struct EncodeConfig {
  pub maxDepth: int = 64;
  pub maxSizeBytes: int = 16.MiB;
  pub pretty: bool = false;              // format-dependent; may be ignored
  pub sensitiveMode: SensitiveMode = SensitiveMode.Include;
  pub deterministic: bool = true;        // sort map keys, normalize encoding
}

pub struct DecodeConfig {
  pub maxDepth: int = 64;
  pub maxSizeBytes: int = 16.MiB;
  pub strictSchema: bool = false;
  pub unknownTypeBehavior: UnknownTypeBehavior = UnknownTypeBehavior.RemoteException;
}

pub enum SensitiveMode {
  Include;       // serialize sensitive values normally (flagged out-of-band)
  Redact;        // replace with a redaction marker
  Omit;          // drop sensitive fields entirely
}

pub enum UnknownTypeBehavior {
  RemoteException;       // for @polymorphic BaseException hierarchies
  Error;                 // throw DeserializationError (sealed hierarchies)
  Skip;                  // drop the value (appropriate for lossy imports)
}
```

**Convenience functions.** The stdlib provides top-level helpers that
accept a driver as a generic parameter:

```loup
namespace core.serialization;

pub func serialize[T: Serializable, D: FormatDriver](
  value: T,
  config: EncodeConfig = EncodeConfig.default(),
): bytes;

pub func deserialize[T: Deserializable, D: FormatDriver](
  bytes: borrow bytes,
  config: DecodeConfig = DecodeConfig.default(),
): T;

pub func roundtrip[T: Serializable + Deserializable, D: FormatDriver](
  value: T,
): T;   // diagnostic — serialize + deserialize; useful for testing
```

Example:

```loup
from loup.format.json import (JsonFormat);
from core.serialization import (serialize, deserialize);

let user = User(id: "u42", email: "alice@example.com");
let wire: bytes = serialize[User, JsonFormat](user);
let back: User = deserialize[User, JsonFormat](wire);
```

**Format driver compliance.** A format driver package declares compliance
with the foundation by declaring `implements FormatDriver` on its driver
type and passing the foundation's conformance test suite (published as
part of the Loup toolchain). A compliant driver guarantees:

- Round-trip fidelity for all `Value` variants the format can natively represent.
- Deterministic output when `deterministic: true` is specified (same input produces byte-identical output across platforms, architectures, and Loup versions).
- Depth and size limits are enforced and produce clean errors on violation.
- Sensitive-field handling honors the `SensitiveMode` configuration.

### §32.11 Security Model

The serialization foundation commits to the following security properties:

**Opt-in deserialization.** A type is constructible from serialized data
only if it has been declared `Deserializable` and is registered in the
deserialization target's compile-time type graph. No reflection-based
fallback exists.

**No code execution during deserialization.** The `fromValue` contract
explicitly forbids:

- Invoking user-declared constructors that have side effects beyond field
  initialization.
- Running field initializer expressions (auto-derived `fromValue` sets
  fields by direct assignment, not by re-running declared defaults).
- Triggering module initialization as a side effect of type resolution.
- Performing I/O, spawning tasks, or acquiring locks.

Manual `fromValue` implementations that violate these rules are
recommended to be rejected by linting; the compiler emits
`W_IMPURE_FROMVALUE` advisory warnings when it detects such calls in a
`fromValue` body.

**Resource bounds.** Format drivers enforce:

- **Maximum depth** — the deepest nesting level of `Value.List`,
  `Value.Map`, `Value.Variant`, `Value.Tagged`. Default 64. Exceeded
  inputs produce `DeserializationError`.
- **Maximum size** — the total byte count of the input. Default 16 MiB.
  Exceeded inputs produce `DeserializationError`.
- **Per-field size** — drivers MAY enforce per-string / per-bytes length
  limits, though the foundation does not require a specific value.

All limits are configurable per decode call. Applications accepting
untrusted input SHOULD tune these down aggressively; applications
round-tripping internal data MAY raise them for known-bounded payloads.

**Polymorphism registry.** A polymorphic type's deserialization registry
is populated from the compile-time type graph of the deserializing module.
Types not visible at compile time cannot be deserialized. Dynamic type
registration is not supported — this closes the attack vector where an
attacker causes code to be loaded that registers a malicious type.

**Unknown URI handling.** For `BaseException` subclasses,
`RemoteException` is the data-only fallback. For other polymorphic
families, the behavior is `DeserializationError` (default) or the
user-chosen `UnknownTypeBehavior`. In no case can an unknown URI cause
arbitrary code to run.

**Cycle detection.** Deserialization tracks visited values; cyclic `Value`
inputs produce `DeserializationError`. Serialization detects cycles in
the source object graph and either uses a `WeakRef` escape hatch (for
types declaring it) or raises `SerializationError`.

**Integer range checks.** When a wire-format value exceeds the range of
the target type (e.g., a wire `int64` being deserialized into an `int32`
field), the deserializer produces `DeserializationError` rather than
silently truncating.

**Floating-point edge cases.** NaN, positive infinity, and negative
infinity round-trip losslessly when the format supports them. Formats
without native infinity/NaN representation (strict JSON) MUST either
reject these values on encode (default) or accept an explicit opt-in
configuration to encode them as strings — the choice is per-driver and
documented.

### §32.12 Interaction with `Sendable`, `Shareable`, and `shared class`

`Serializable` is **independent** of `Sendable` and `Shareable`. A type
may be:

- `Serializable` only — safe to put on a wire but not to transfer across
  threads in-memory (unusual, but possible — e.g., types holding
  thread-local handles that serialize cleanly via adapters).
- `Sendable` only — safe to transfer across threads by copy but not to
  put on an external wire (e.g., types containing `extern native` handles).
- `Shareable` only — safe to share across threads by reference but not to
  put on an external wire (e.g., types containing `SharedMutex`).
- Any combination of the above.

The language does NOT imply any of these traits from any other. Each
trait is opt-in and independently checkable.

**`shared class` and serialization.** A `shared class` MAY implement
`Serializable` and `Deserializable`. When it does, **the wire format goes
through the normal `Value` intermediate representation** — the normative
cross-mode ABI layout (§17b.7) is an in-process memory contract and is
NOT used as a wire format. This keeps serialization format-independent
and layout-independent; wire data can be round-tripped through modes and
processes that have different `shared class` ABI versions.

A `shared class`'s `toValue()` produces `Value.Map` entries for its
fields in declaration order (same as `local class`). The atomic refcount,
weakcount, type descriptor, vtable pointer, and other header fields are
NOT serialized — they are reconstructed on deserialization into the
receiver's local arena. Deserialization constructs a new `SharedRef[T]` in
the receiver's default arena (or an explicitly-specified arena); the
receiver and sender do not share the same arena memory.

**`SharedRef[T]` as a `Serializable` type.** `SharedRef[T]` is conditionally
`Serializable`: `SharedRef[T]` is `Serializable` if and only if `T` is
`Serializable`. The compiler emits this conditional implementation
automatically, matching the pattern used for `Sendable` on generic types.

**`SharedRef[T]` field semantics.** A field of type `SharedRef[T]` in a
`Serializable` class serializes the pointed-to instance by value. On
deserialization, a fresh `SharedRef[T]` is constructed in the receiver's
arena. Receivers handling many instances should pool allocations in a
dedicated arena configured before the deserialization call.

**Cycles involving shared references.** If a `shared class` contains fields
that form a reference cycle via `SharedRef[T]`, serialization detects the
cycle per §32.11 and either uses a `WeakRef` escape hatch (when the cycle
is broken by a `weak` field) or raises `SerializationError`. The serializer
does NOT emit in-wire backreference markers — the `Value` intermediate
representation has no identity concept; every occurrence of an object in
the source graph produces an independent serialized copy. This means
non-cyclic shared-reference sharing (two paths in the graph reaching the
same instance) produces two independent copies on the wire, which
deserialize into two distinct instances on the receiver. Programs that
depend on receiver-side identity preservation MUST use a higher-level
protocol (e.g. a content-addressed dedup layer) above the foundation.

### §32.13 Error Codes

**Compile-time errors:**

| Code | Condition |
|---|---|
| `E_FIELD_NOT_SERIALIZABLE` | Field in `Serializable` class has type not implementing `Serializable` (and no `@serialVia` adapter, no `@skip`) |
| `E_FIELD_NOT_DESERIALIZABLE` | Field in `Deserializable` class has type not implementing `Deserializable` (and no `@serialVia` adapter, no `@skip`) |
| `E_SKIP_NO_DEFAULT` | `@skip` annotation on a field with no declared default |
| `E_SKIP_BOTH` | Field has both `@skip` and `@skipIfDefault` |
| `E_SERIAL_URI_COLLISION` | Two types declare the same `@serializationId` |
| `E_SERIAL_URI_MALFORMED` | `@serializationId` value does not match the canonical URI format |
| `E_ADAPTER_TYPE_MISMATCH` | `@serialVia[Adapter]` where Adapter's `T` doesn't match the field type |
| `E_OPEN_NOT_ENUM` | `@open` applied to a non-enum type |
| `E_TAGGED_CONFLICT` | Both `@polymorphic` and `@tagged(...)` applied to the same type |
| `E_MIGRATE_FROM_SAME_URI` | `@migrateFrom` references the declaring type's own URI |

**Runtime errors:**

| Exception | Thrown when |
|---|---|
| `SerializationError` | A `toValue` implementation detected an invariant violation (cycle not handled, adapter failure, etc.) |
| `DeserializationError` | Wire input is malformed, exceeds limits, has schema mismatch, or violates invariants |
| `UnknownTypeError` | Incoming type URI not registered in a non-`RemoteException`-configured polymorphic family |
| `CauseTruncatedException` | Synthetic exception inserted at the end of a truncated exception cause chain |
| `SecurityError` | Deserialization attempted a forbidden operation (e.g., reconstructing `SystemExit`) |
| `UnknownEnumVariant` | Unknown variant received for an `@open` enum; exposed via `match` |

---

## Appendix A: Keyword Index

**Keywords** — These identifiers SHALL NOT be used as variable, function, type, or module names:

| Keyword | Section | Description |
|---|---|---|
| `abstract` | §8.3 | Abstract class/method declaration |
| `and` | §3.7 | Logical AND operator |
| `as` | §13.1 | Import alias, catch binding, dynamic view |
| `async` | §7.1 | Async function declaration |
| `await` | §17.1 | Suspend until task completes |
| `break` | §6.4 | Exit loop |
| `catch` | §6.9 | Exception handler |
| `class` | §8.1 | Class declaration |
| `consume` | §23.4.7 | Downgrade `unique` binding to ARC-managed reference (`@mode(host.native)` or `@mode(host.dual)`) |
| `continue` | §6.4 | Skip to next loop iteration |
| `defer` | §6.5, §13.10 | Register cleanup action (`defer expr`/`defer { }`); also `from X defer import (...)` for deferred type stubs that break import cycles |
| `del` | §6.11 | Deterministic finalization |
| `do` | §6.4 | Do-while loop |
| `dynamic` | §8.7 | Dynamic class declaration, dynamic view |
| `else` | §6.3 | Alternative branch |
| `enum` | §9.1 | Enum declaration |
| `extern` | §18 | FFI declaration |
| `false` | §3.6 | Boolean literal |
| `finally` | §6.9 | Unconditional cleanup block |
| `fn` | §4.4 | Function type |
| `for` | §6.4 | Loop |
| `from` | §13.1 | Import source, exception chaining |
| `func` | §7.1 | Function declaration |
| `gen` | §7.5 | Generator function |
| `get` | §7.7 | Property getter keyword (contextual — also valid as a method or field name) |
| `global` | §7.3 | Module-scope variable mutation |
| `if` | §6.3 | Conditional |
| `implements` | §11.1 | Interface implementation |
| `import` | §13.1 | Import declaration |
| `in` | §6.4, §3.7 | For-in loop, membership test |
| `instanceof` | §4.7 | Type check operator |
| `interface` | §11.1 | Interface declaration |
| `is` | §4.5, §9.5 | Type narrowing check |
| `let` | §6.2 | Immutable binding |
| `lifetime` | §7.1, §10.11, §11.4, §12.1, §23.4.2 | Lifetime region parameter declaration |
| `local` | §8.1.1, §27 | Class memory-strategy modifier (v1.18). `local class Foo` is the explicit form of the default `class Foo`; thread-local, non-atomic ARC. `local` is a **contextual keyword** — permitted as an identifier in non-class-modifier positions |
| `macro` | §27.11 | Macro declaration: `pub macro name(params) { quote { ... } }` |
| `match` | §9.4 | Pattern matching |
| `new` | §8.4 | Constructor |
| `namespace` | §13, §27.2 | File-level namespace declaration: `namespace pkg.module;` |
| `nonlocal` | §7.3 | Enclosing-scope variable mutation |
| `none` | §3.4 | Reserved to prevent confusion with `None` (the uppercase absent-value literal, §9.3); `none` (lowercase) is not itself a value |
| `not` | §3.7 | Logical NOT |
| `or` | §3.7 | Logical OR |
| `operator` | §7.7, §11.2 | Method declaration qualifier: `operator func SymOp` declares an operator overload; `modifier operator func` for mutating overloads |
| `portal` | §6.7 | Debug activation point |
| `prefer` | §13.1 | Import keyword for `prefer compiled` clause |
| `pub` | §8.2 | Public visibility |
| `return` | §7.1 | Return from function |
| `Self` | §8.4, §11 | Type alias for the implementing type; available inside class, struct, interface, and enum bodies |
| `set` | §7.7 | Property setter keyword (contextual — also valid as a method or field name) |
| `shared` | §8.1.1, §17b, §27 | Class memory-strategy modifier and constructor prefix (v1.18). `shared class Foo` declares an atomic-ARC, shared-arena-allocated class; `shared Foo(...)` / `shared(arena) Foo(...)` allocates a `shared class` instance. Also used as a field qualifier in existing `Sendable` contexts |
| `spawn` | §17.2 | Spawn task in await group |
| `super` | §8.4 | Superclass constructor call: `super(args)` inside a subclass constructor body |
| `static` | §8.5 | Static member |
| `struct` | §10 | Struct declaration |
| `suspend` | §19.5 | Async component loading |
| `this` | §8.4 | Implicit current-instance reference inside instance methods and constructors |
| `throw` | §6.10 | Throw exception |
| `true` | §3.6 | Boolean literal |
| `try` | §6.9 | Exception handling |
| `type` | §4.6 | Type alias |
| `weak` | §8 | Field qualifier for non-owning references to `local class` or `shared class` instances. Available in all modes with an ARC model (not `freestanding`). v1.18 generalized availability from ARC-only modes to all ARC-backed modes |
| `typeof` | §4.7 | Type-of operator |
| `unique` | §8, §23.4.7 | Ownership qualifier: `unique let`/`var` (single-owner binding), `unique class` (single-owner class type) |
| `var` | §6.2 | Mutable binding |
| `while` | §6.4 | While loop |
| `with` | §6.6, §10.7 | Scoped resource management (`with (x = expr) { ... }`); also struct copy-with-modification (`s with (field=newValue)`) |
| `yield` | §7.5 | Generator yield |
| `reads` | §23.4.9 | Ownership verb: shared immutable borrow — parameter modifier and call-site acknowledgment (all modes) |
| `edits` | §23.4.9 | Ownership verb: exclusive mutable borrow — parameter modifier and call-site acknowledgment (all modes) |
| `takes` | §23.4.9 | Ownership verb: ownership transfer — parameter modifier and call-site acknowledgment (all modes) |
| `shares` | §23.4.9 | Ownership verb: ARC retain — parameter modifier and call-site acknowledgment (all modes) |
| `modifier` | §23.4.11 | Method declaration keyword: declares a method that writes `var` fields on `self` (all modes) |
| `requires` | §23.4.10 | Contract clause keyword: applies verbs to multiple parameters, declares `distinct()` contracts (all modes) |
| `safe` | §23.4.12 | Context keyword: `safe {}` activates shared-XOR-mutable enforcement; `safe func` propagates the requirement (all modes) |
| `synchronized` | §23.4.13 | Class modifier: per-instance mutex serializing all `modifier` invocations (web.scripted, web.compiled, host.scripted, host.dual, host.native) |
| `unsafe` | §23.4.14 | Lock-release block statement inside a `synchronized` modifier: `unsafe("reason") { ... }` (web.scripted, web.compiled, host.scripted, host.dual, host.native) |
| `borrow` | §7.1, §23.4.1, §23.4.2 | Parameter modifier / field qualifier / lifetime-tracked reference — prefer `reads`/`edits` verbs in new code |
| `arc` | §6.2, §23.4.8 | Explicit ARC ownership binding qualifier (`arc let`, `arc var`) |
| `atomic` | §17.7 | Cooperative atomicity scope — no suspension points within the block (scripted/compiled) |
| `bnot` | §3.7, §5.1 | Bitwise NOT operator |
| `noescape` | §4.4, §23.4.1 | Function type modifier |

**Annotations** — Compile-time annotations recognised by the Loup toolchain:

| Annotation | Section | Description |
|---|---|---|
| `@mode` | §2.5 | File-level execution mode declaration |
| `@entry` | §24.5 | Freestanding: marks the bare binary entry point |
| `@panic_handler` | §24.6 | Freestanding: custom panic hook (`--panic=custom`) |
| `@interrupt` | §24.13 | Freestanding: interrupt service routine calling convention |
| `@naked` | §24.14 | Freestanding: suppresses function prologue and epilogue |
| `@callconv` | §24.15 | Freestanding: overrides calling convention |
| `@allocator` | §24.16 | Freestanding: registers custom heap allocator |
| `@deallocator` | §24.16 | Freestanding: registers matching deallocator |
| `@volatile` | §24.8 | Freestanding: MMIO volatile borrow parameter modifier |
| `@repr` | §24.10 | Freestanding/native: struct memory layout control |
| `@align` | §24.11 | Freestanding/native: minimum alignment in bytes |
| `@section` | §24.12 | Freestanding: ELF/Mach-O section placement |
| `@jsexport` | §18.2 | Export a function as callable from JavaScript |
| `@concurrent` | §17.9.5 | Asserts an `async func` is safe to call from any executor thread |
| `@deprecated(msg)` | §8.8 | Mark a symbol for future removal; usages emit a compile-time warning |
| `@webcomponent(name)` | §19.10 | Register a class as a Custom Element with the given tag name |
| `@attribute` | §19.10 | Declare an observed HTML attribute on a `@webcomponent` class |
| `@unsafe(reason)` | §23.4.6 | Programmer-asserted safety boundary; bypasses specific compiler verification |
| `@overflowWrapping` | §4.1.1 | Opt-in wrapping arithmetic for all fixed-width integers in a function |
| `@interruptSafe` | §24.24.1 | Freestanding: declare a function safe to call from interrupt handler context |
| `@signalSafe` | §26.9 | Native: declare a function safe to call from OS signal handler context |
| `@lockOrder(n)` | §23.4.13 | Native: assign a lock-ordering level to a `synchronized` class |
| `@debug_control_channel` | §24.25.3 | Freestanding `--debug`: register the bidirectional control transport |
| `@debug_trace_channel` | §24.25.3 | Freestanding `--debug`: register the unidirectional trace transport |
| `@vectorize` | §8.8 | Hint the compiler to auto-vectorize a `for` loop |
| `@vectorize(width=N)` | §8.8 | Auto-vectorize hint with explicit SIMD lane count |

**Reserved words** — Reserved for future use; SHALL NOT be used as user identifiers:

| Reserved Word | Section | Description |
|---|---|---|
| `final` | §3.4 | Reserved for future use |
| `module` | §3.4 | Reserved for future use |
| `override` | §3.4 | Reserved for future use |
| `package` | §3.4 | Reserved for future use |
| `sealed` | §3.4 | Reserved for future use |
| `trait` | §3.4 | Reserved for future use |
| `volatile` | §3.4 | Reserved for future use |
| `where` | §3.4 | Reserved for future use |

**Contextual keywords** — Special meaning only in specific syntactic positions; may be used as ordinary identifiers elsewhere:

| Contextual Keyword | Section | Description |
|---|---|---|
| `self` | §3.4 | Contextual in closure capture lists (`[weak self]`, `[unowned self]`) as an alias for the enclosing method's implicit `this` receiver; valid as an ordinary identifier elsewhere (e.g., first parameter name in UFCS-style functions) |
| `quote` | §3.4, §25, §27.11 | Contextual as the macro body keyword (`macro name(p) { quote { ... } }`); valid as an ordinary identifier elsewhere |
| `box` | §3.4, §4.3 | Contextual in prefix position; makes widening to `Any` explicit. `E_BOX_IN_FREESTANDING` in `@mode(freestanding)`; permitted in `@mode(host.native)` with the `W_ANY_IN_AOT_MODE` advisory |
| `excl` | §3.4, §23.4.1.1 | Contextual immediately before `borrow`: `excl borrow param: T`; available in all modes (§2.6) |
| `group` | §17.2 | Contextual in `await group { ... }` |
| `once` | §20.3 | Contextual in debug activation requests |
| `distinct` | §23.4.10 | Contextual in `requires` clauses and call-site contract acknowledgments |
| `compiled` | §2.4.2, §2.5 | Mode name in `@mode(web.compiled)` and `prefer compiled` import clauses; valid identifier elsewhere |
| `scripted` | §2.4.1, §2.4.3, §2.5 | Mode name in `@mode(web.scripted)` (§2.4.1) and `@mode(host.scripted)` (§2.4.3); valid identifier elsewhere |
| `native` | §2.4.5, §23 | Mode name in `@mode(host.native)`; valid identifier elsewhere |
| `dual` | §2.4.4, §2.5 | Mode name in `@mode(host.dual)`; valid identifier elsewhere |
| `freestanding` | §2.4.6, §24 | Mode name in `@mode(freestanding)`; valid identifier elsewhere |
| `reinterpret` | §3.4, §24.18 | Contextual in `reinterpret[T, U](expr)`; requires `@unsafe`; available in all modes (§2.6) |
| `reinterpretChecked` | §3.4, §24.18 | Contextual in `reinterpretChecked[T, U](expr)`; no `@unsafe` required; returns `Result[U, AlignmentError]`; available in all modes (§2.6) |
| `size_of` | §3.4, §24.4.1 | Contextual in `size_of[T]()`; `@mode(host.native)` and `@mode(freestanding)` only |
| `align_of` | §3.4, §24.4.1 | Contextual in `align_of[T]()`; `@mode(host.native)` and `@mode(freestanding)` only |
| `from` (method-name carve-out) | §3.4, §11.2 | `from` is a hard keyword (import statements §13.1; `throw ... from ...` chaining §6.9), but is additionally permitted as a method name in method-declaration headers and method-call position after `.` (e.g., `static func from(err: E): Self` and `F.from(e)`). Not permitted as a field, variable, parameter, type, or module name. |

**Lifetime labels** — Reserved sigil for compile-time region identifiers (available in all modes, §2.6):

| Identifier | Section | Description |
|---|---|---|
| `~static` | §7.1, §23.4.2 | Reserved forever-lifetime label; satisfies any `borrow[~name]` by covariance |
| `~name` (user-defined) | §7.1, §10.11, §23.4.2 | Lowercase identifier prefixed with `~`; declared via `lifetime ~name`; erased at compile time |

**Dunder identifiers** — Reserved for language-defined module introspection:

| Identifier | Section | Description |
|---|---|---|
| `__name__` | §2.2 | Module name (`"__main__"` for entry script) |
| `__file__` | §2.2 | Absolute file path of the module |
| `__execmode__` | §2.2 | One of the six mode strings: `"web.scripted"`, `"web.compiled"`, `"host.scripted"` (also used by REPL), `"host.dual"`, `"host.native"`, or `"freestanding"` |
| `__module__` | §2.3 | Declaration-level dunder on named types and functions |

---

## Appendix B: Operator Index

| Operator | Precedence | Associativity | Description | Section |
|---|---|---|---|---|
| `()` `[]` `.` `?.` `!{}` `?.[` | 1 | Left | Call, index, member access, safe nav, dynamic access, null-safe index | §5.1 |
| `typeof` | 2 | Prefix | Type-of operator | §4.7 |
| `-` (unary) `not` `!` `bnot` | 3 | Prefix | Unary negation, logical not, bitwise not | §5.1 |
| `box` `consume` | 4 | Prefix | Boxing/widening (`box`); unique-to-ARC downgrade (`consume`, `@mode(host.native)` or `@mode(host.dual)`) | §4.3, §23.4.7 |
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
| `and` `&&` | 18 | Left | Logical AND (short-circuit) | §3.7 |
| `or` `\|\|` | 19 | Left | Logical OR (short-circuit) | §3.7 |
| `??` | 20 | Left | Null coalescing | §5.6 |
| `? :` | 21 | Right | Ternary conditional | §5.4 |
| `?` (postfix) | 22 | Postfix | Result propagation | §5.7 |
| `=` `+=` `-=` `*=` `/=` `//=` `%=` `**=` `<<=` `>>=` `&=` `\|=` `^=` | 23 | Right | Assignment | §6.2 |
| `*` `**` (prefix, spread) | 24 | Prefix | Spread | §5.8 |

---

## Appendix C: Built-in Type Index

This appendix lists built-in language types only.  Standard library types are indexed in the [Loup Standard Library Reference](loup-stdlib-reference-v1_18.md) Appendix C.  Package types are indexed in the [Loup Packages Reference](loup-packages-reference-v1_11.md) Appendix C.


### Primitive Types

| Type | Description | Section |
|---|---|---|
| `int` | 64-bit signed integer (alias for `int64`) | §4.1 |
| `int8` | 8-bit signed integer | §4.1 |
| `int16` | 16-bit signed integer | §4.1 |
| `int32` | 32-bit signed integer | §4.1 |
| `int64` | 64-bit signed integer | §4.1 |
| `uint` | Pointer-sized unsigned integer (alias for `uint64` on 64-bit, `uint32` on 32-bit) | §4.1 |
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

### Language Built-in Class Types

These types are defined by the language specification and are available without any import.

| Type | Description | Section |
|---|---|---|
| `Any` | Root type for all heap-allocated and boxed values; all classes inherit from `Any` | §4.3 |
| `Module` | Represents a compiled or loaded module; carries `__name__`, `__file__`, `__execmode__` and reflection methods | §2.3 |
| `Template` | Compile-time value produced by a template fence; carries `language`, `format`, and rendering methods | §16.3 |
| `RenderContext` | Rendering context (language + format) passed to `Renderable.render()` | §16.3 |
| `SafeHtml` | Pre-escaped trusted HTML content; inserted without further escaping in `html` fences | §16.6.7 |
| `Url` | Validated URL wrapper; rejects disallowed schemes (e.g. `javascript:`) | §16.6.7 |
| `ClassName` | Scoped CSS class name string produced by a `css` fence; implements `Renderable` | §16.7.1 |
| `StyleSheet` | Collection of `ClassName` values produced by a `css` fence; provides `toCSS()` | §16.7.1 |
| `EffectHandle` | Handle returned by `effect(fn)` for disposing a reactive effect | §19.1 |
| `Signal[T]` | Reactive signal — readable/writable cell that tracks dependents | §19.1 |
| `ComponentRegistry` | Mapping from tag names to component functions used by `ui` and `html` fences | §19.6 |
| `MountHandle` | Handle returned by `mount()` for unmounting a component tree | §19.3 |
| `ActorContext` | Implicit context inside `Actor.spawn` handler for replying to `ask` calls | §17.6 |
| `Type` | Reified type value produced by `typeof expr`; carries `name`, `params()`, and reflection methods | §4.7, §21.11 |
| `StackFrame` | One frame in an exception's `stackTrace`; carries `file`, `line`, `column`, `function` | §26.1 |
| `PanicSource` | Discriminant enum identifying the source of a freestanding panic | §24.6 |
| `NativeHandle` | Opaque built-in C-pointer type at the FFI boundary; non-`Sendable` by default | §18.4 |
| `DebugFrame` | One frame in the debug trace ring buffer; carries file, line, callable, exec-mode, and locals | §20.3 |
| `TraceEvent` | Entry recorded by the tracing subsystem; carries `kind`, `portal`, `callable`, `file`, `line` | §20.3 |
| `FreestandingDebugFrame` | Fixed-size freestanding trace frame (no heap); carries source-location offsets only | §24.25.2 |

### UI Built-in Types

The following opaque types are produced exclusively by the `ui` subsystem and are available on all targets.

| Type | Description | Section |
|---|---|---|
| `View` | Opaque description of UI content; produced by `ui` and `html` fences and component functions | §19.4 |
| `MountTarget` | Opaque platform rendering root; obtained from `runtime.ui.rootMount()`, selector strings, `Element`, or `Window` | §19.3 |

### Freestanding and Native Built-in Types

The following types are available in `@mode(host.native)` and `@mode(freestanding)` unless otherwise noted.

| Type | Description | Mode | Section |
|---|---|---|---|
| `MaybeUninit[T]` | Wrapper for memory not yet initialized | host.native, freestanding | §24.17 |
| `Volatile[T]` | MMIO wrapper enforcing volatile load/store semantics | freestanding | §24.9 |
| `InterruptFrame` | CPU exception frame layout (architecture-specific `@repr(C)` struct) | freestanding | §24.13 |
| `PartialInit[T]` | Tracks incremental field initialization of a `@repr(C)` struct at compile time | host.native, freestanding | §24.17a |
| `DmaBuffer[T]` | Exclusive DMA-safe memory buffer with CPU/DMA access arbitration | freestanding | §24.20 |
| `DmaTransfer` | Active DMA transfer token — holds exclusive borrow of the associated `DmaBuffer[T]` | freestanding | §24.20 |
| `InterruptGuard` | RAII scope guard that disables interrupts on entry and re-enables on drop | freestanding | §24.24 |
| `PinnedRef[T]` | ARC-pinned lifetime anchor preventing GC collection while a native library holds a raw pointer | host.dual, host.native | §18.4 |
| `OwnedHandle` | Owned `NativeHandle` wrapper with destructor registration | host.dual, host.native, freestanding | §18.4 |
| `BorrowedHandle` | Borrowed `NativeHandle` wrapper with lifetime tracking | host.dual, host.native, freestanding | §18.4 |
| `Mutex[T]` | OS-thread mutex wrapping `T`; always `Sendable` | host.dual, host.native | §17.8.2 |
| `RwLock[T]` | OS-thread reader/writer lock wrapping `T`; always `Sendable` | host.dual, host.native | §17.8.2 |
| `Atomic[T]` | Atomic cell for sequentially-consistent load/store/RMW on primitives | host.dual, host.native, freestanding | §17.8.2 |
| `Thread` | OS thread handle — spawn, join, detach | host.dual, host.native | §17.8.3 |
| `ThreadHandle[T]` | Typed join handle returned by `Thread.spawnWith` | host.dual, host.native | §17.8.3 |
| `ThreadPool` | Work-submission pool bridging async tasks to OS threads | host.dual, host.native | §17.8.4 |
| `ThreadLocal[T]` | Per-OS-thread storage, initialized lazily | host.dual, host.native | §17.9.7 |
| `TaskLocal[T]` | Per-async-task storage that follows the task across resumptions | All non-freestanding | §17.9.8 |
| `ScriptWorker[M]` | Isolated worker Wasm instance with typed `Sendable` message channel | All non-freestanding | §17.10.2 |
| `WorkerChannel[T]` | Worker-side message channel, valid only inside `workerMain` | All non-freestanding | §17.10.3 |
| `CancellationToken` | Cooperative cancellation signal for `TaskGroup.withCancellation` | All | §17.3 |
| `Task[T]` | Async task handle returned by `async func` invocations | All non-freestanding | §17.1 |
| `Actor[M]` | Supervised message-processing actor handle | All non-freestanding | §17.6 |

