# Loom Language Specification v0.6

**Status:** Working Draft
**Version:** 0.6.0
**Date:** 2026-03-28
**Purpose:** Scripting + code generation with strong typing and first-class templating

---

## Table of Contents

- [§1 Design Goals (non-normative)](#1-design-goals)
- [§2 Execution Model](#2-execution-model)
  - [§2.1 Scripted Mode (JIT)](#21-scripted-mode-jit)
  - [§2.2 Module Introspection Dunders](#22-module-introspection-dunders)
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
- [§11 Interfaces](#11-interfaces)
  - [§11.1 Interface Declarations](#111-interface-declarations)
  - [§11.2 Standard Interfaces](#112-standard-interfaces)
  - [§11.3 Iteration Protocol](#113-iteration-protocol)
- [§12 Generics](#12-generics)
- [§13 Modules and Imports](#13-modules-and-imports)
  - [§13.1 Import Syntax](#131-import-syntax)
  - [§13.2 Re-Exports](#132-re-exports)
  - [§13.3 Package Manifest (`loom.pkg`)](#133-package-manifest-loompkg)
  - [§13.4 Module Initialization](#134-module-initialization)
  - [§13.5 Package Registry](#135-package-registry)
  - [§13.6 Reserved Namespace](#136-reserved-namespace)
- [§14 Multiline Strings](#14-multiline-strings)
- [§15 Interpolated Strings](#15-interpolated-strings)
- [§16 Template Fences](#16-template-fences)
  - [§16.1 Fence Syntax and Descriptors](#161-fence-syntax-and-descriptors)
  - [§16.2 Inline Expressions and Directives](#162-inline-expressions-and-directives)
  - [§16.3 Template as a Value](#163-template-as-a-value)
  - [§16.4 Rendering Semantics](#164-rendering-semantics)
  - [§16.5 Failure Policy (Templates)](#165-failure-policy-templates)
- [§17 Concurrency](#17-concurrency)
  - [§17.1 `async`/`await`](#171-asyncawait)
  - [§17.2 `await group`](#172-await-group)
  - [§17.3 `TaskGroup`](#173-taskgroup)
  - [§17.4 Async Iterators and `for await`](#174-async-iterators-and-for-await)
  - [§17.5 Async Iterator Combinators](#175-async-iterator-combinators)
  - [§17.6 Actors and Supervision](#176-actors-and-supervision)
- [§18 FFI and Host Interop](#18-ffi-and-host-interop)
  - [§18.1 JavaScript Interop (`extern js`)](#181-javascript-interop-extern-js)
  - [§18.2 `@jsexport`](#182-jsexport)
  - [§18.3 Typed JS Facades (`system.interop`)](#183-typed-js-facades-systeminterop)
  - [§18.4 Native Interop (`extern native`)](#184-native-interop-extern-native)
- [§19 Reactive UI (`system.ui`)](#19-reactive-ui)
  - [§19.1 Signals](#191-signals)
  - [§19.2 Components and `ComponentRegistry`](#192-components-and-componentregistry)
  - [§19.3 Mounting (Universal)](#193-mounting-universal)
  - [§19.4 `View` Type](#194-view-type)
  - [§19.5 Async Component Loading](#195-async-component-loading)
  - [§19.6 `ui` Fence — Cross-Platform Layout Primitives](#196-ui-fence--cross-platform-layout-primitives)
  - [§19.7 Web Backend (`system.ui.web`)](#197-web-backend-systemuiweb)
  - [§19.8 Desktop Backend (`system.ui.desktop`)](#198-desktop-backend-systemuidesktop)
  - [§19.9 Cross-Platform Example](#199-cross-platform-example)
  - [§19.1 Signals](#191-signals)
  - [§19.2 Components and `ComponentRegistry`](#192-components-and-componentregistry)
  - [§19.3 Mounting](#193-mounting)
  - [§19.4 Server-Side Rendering](#194-server-side-rendering)
  - [§19.5 Async Component Loading](#195-async-component-loading)
- [§20 Runtime Root and Capabilities](#20-runtime-root-and-capabilities)
  - [§20.1 `runtime` Object](#201-runtime-object)
  - [§20.2 Script Prelude](#202-script-prelude)
  - [§20.3 Dynamic Tracing and Time-Travel Debugging](#203-dynamic-tracing-and-time-travel-debugging)
- [§21 Standard Library](#21-standard-library)
  - [§21.1 `system.text`](#211-systemtext)
  - [§21.2 `system.json`](#212-systemjson)
  - [§21.3 `system.time`](#213-systemtime)
  - [§21.4 `system.collections`](#214-systemcollections)
  - [§21.5 `system.regex`](#215-systemregex)
  - [§21.6 `system.env`](#216-systemenv)
  - [§21.7 `system.fs`](#217-systemfs)
  - [§21.8 `system.proc`](#218-systemproc)
  - [§21.9 `system.net`](#219-systemnet)
  - [§21.10 Set Operations](#2110-set-operations)
  - [§21.11 `system.reflect`](#2111-systemreflect)
- [§22 Compiled Mode](#22-compiled-mode)
  - [§22.1 `@compiled` Directive](#221-compiled-directive)
  - [§22.2 Restrictions](#222-restrictions)
  - [§22.3 Execution Semantics](#223-execution-semantics)
- [§23 Native Compilation](#23-native-compilation)
  - [§23.1 Platform Targets and Output Formats](#231-platform-targets-and-output-formats)
  - [§23.2 Compiler Backends](#232-compiler-backends)
  - [§23.3 Linker](#233-linker)
  - [§23.4 ARC Memory Management](#234-arc-memory-management)
  - [§23.5 ARC and the Interpreted/Compiled Boundary](#235-arc-and-the-interpretedcompiled-boundary)
  - [§23.6 ABI Stability](#236-abi-stability)
  - [§23.7 C Header Interop](#237-c-header-interop)
  - [§23.8 Build Pipeline and `loom.pkg` for Native](#238-build-pipeline-and-loompkg-for-native)
  - [§23.9 Requirements](#239-requirements)
- [§24 Macros and Metaprogramming](#24-macros-and-metaprogramming)
- [§25 Failure Policy](#25-failure-policy)
  - [§25.1 Error Hierarchy](#251-error-hierarchy)
  - [§25.2 User-Defined Errors](#252-user-defined-errors)
  - [§25.3 Error Categories](#253-error-categories)
  - [§25.4 Error Propagation Rules](#254-error-propagation-rules)
  - [§25.5 Catch Pattern Matching](#255-catch-pattern-matching)
  - [§25.6 Template Errors](#256-template-errors)
  - [§25.7 Task Failures](#257-task-failures)
  - [§25.8 FFI Errors](#258-ffi-errors)
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
- [§28 Progressive Disclosure (non-normative)](#28-progressive-disclosure)
- [§29 Future Directions (non-normative)](#29-future-directions)
- [Appendix A: Keyword Index](#appendix-a-keyword-index)
- [Appendix B: Operator Index](#appendix-b-operator-index)
- [Appendix C: Built-in Type Index](#appendix-c-built-in-type-index)
- [Appendix D: Changelog from v0.4](#appendix-d-changelog-from-v04)

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

- **Compiled mode.** For performance-critical code, Loom supports a `@compiled` mode that restricts the language to a statically-analyzable subset suitable for ahead-of-time compilation to optimized Wasm or native code. Portal statements and `system.reflect` are available in compiled mode.

- **Native compilation.** Loom programs can be compiled to native binaries via LLVM or Cranelift backends using mandatory ARC memory management, bidirectional C header interop, and deployment without a Wasm runtime.

- **Unified UI model.** The `system.ui` module provides a single reactive component model and `ui` fence that targets both web browsers (via Wasm) and native desktop platforms. Components written against the universal core are cross-platform by default; platform-specific enrichment is opt-in.

---

## §2 Execution Model

*(This section is normative.)*

Loom defines two execution modes: **scripted mode** (the default) and **compiled mode** (opt-in via the `@compiled` directive; see §22). This section specifies scripted mode. Compiled mode execution semantics are defined in §22.

### §2.1 Scripted Mode (JIT)

Loom's scripted mode uses a cooperative, single-threaded runtime with first-class `async`/`await`.

**Runtime model.** The runtime SHALL execute Loom code cooperatively on a single thread, suspending only at explicit `await` expressions. All asynchronous work is represented as `Task[T]` values scheduled on the host event loop. Evaluation is deterministic between suspension points; only external I/O completion order may affect when suspended tasks resume.

**JIT compilation pipeline.** The `loom run` command uses a JIT compilation pipeline rather than ahead-of-time batch compilation:

1. **Parse** — The source file is parsed into an AST.
2. **JIT compile to Wasm** — Each top-level statement (or function body) is compiled to WebAssembly (GC+EH) incrementally.
3. **Execute** — Compiled Wasm is executed immediately.

This pipeline ensures that execution begins immediately and each statement is individually addressable by a debugger. There is no separate build step for scripted mode.

**Statement-level execution.** The runtime SHALL treat every source-level statement as a discrete execution step. This is analogous to Python's line-by-line execution model. When a module is loaded, its top-level statements execute sequentially in source order. The JIT pipeline is the default execution mode for `loom run` and REPL sessions.

**Source maps and debugging.** The runtime SHALL maintain a source map from every emitted Wasm instruction back to its originating Loom source line and column, enabling line-level breakpoints on any statement including imports and type definitions. JIT-compiled Wasm retains full debug metadata (source maps, local variable names, scope boundaries) by default.

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
- **`fun` declaration:** (a) Capture the current lexical environment for closures. (b) Register the function name in the current scope with a lazy-compiled function value — the body is JIT-compiled on first invocation.
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

**Dunder reservation.** Identifiers beginning and ending with double underscores (`__*__`) follow the Python dunder naming convention and are reserved for language-defined module introspection variables. User code SHALL NOT declare variables with dunder names. The complete set of language-reserved dunders in v0.5 is: `__name__`, `__file__`, and `__execmode__`. Future language-level introspection variables will use the same `__name__` pattern.

**Main guard pattern.** The idiomatic way to write code that runs only when a file is executed directly:

```
// utils.loom — a dual-purpose module
pub fun greet(name: string): string {
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
async fun fetchData(url: string): Task[string] {
  let response = await runtime.net.get(url);
  return response.body;
}

async fun main() {
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
fun factorial(n: int): int {
  if (n <= 1) { return 1; }
  return n * factorial(n - 1);
}
```

Comments are lexically transparent: for any valid Loom program, removing all comments SHALL produce an AST identical to the original program's AST. Comments do not affect parsing, type-checking, or execution.

### §3.3 Keywords and Reserved Words

The following identifiers are keywords and SHALL NOT be used as variable, function, type, or module names:

```
abstract   and        as         async      await      break
catch      class      continue   defer      del        do
dynamic    else       enum       extern     false      finally
fn         for        from       fun        gen        get
global     if         implements import     in         instanceof
interface  is         let        match      new        nonlocal
none       not        or         portal     pub        return
set        spawn      static     struct     suspend    throw
true       try        type       typeof     var        while
with       yield
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

All integer literal bases represent the same `int` type: `0xFF`, `0b11111111`, `0o377`, and `255` all parse to the same value.

The `int` type is a signed 64-bit integer (range: −2⁶³ to 2⁶³−1). Integer overflow is a runtime error.

**Explicit conversions.** Use `float(n)` to convert an `int` to `float`, and `int(f)` to convert a `float` to `int` (truncating toward zero). These are the only implicit-free conversion paths between numeric types; mixed `int`/`float` arithmetic promotes the `int` operand automatically (see §3.6).

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

#### Boolean Literals

The boolean type `bool` has exactly two values: `true` and `false`.

### §3.6 Operators

Loom defines the following operators, listed from highest to lowest precedence. Operators at the same precedence level associate as indicated.

| Precedence | Operator(s) | Description | Associativity |
|---|---|---|---|
| 1 | `()` `[]` `.` `?.` `!{}` `?.[` | Call, index, member access, safe nav, dynamic access, null-safe index | Left |
| 2 | `typeof` `instanceof` | Type operators | Prefix |
| 3 | `-` (unary) `not` `!` `~` | Unary negation, logical not, bitwise not | Prefix |
| 4 | `box` | Boxing/widening operator (contextual keyword) | Prefix |
| 5 | `**` | Exponentiation | Right |
| 6 | `*` `/` `%` | Multiplication, division, modulo | Left |
| 7 | `+` `-` | Addition, subtraction, string concatenation | Left |
| 8 | `<<` `>>` | Bitwise shift | Left |
| 9 | `&` | Bitwise AND | Left |
| 10 | `^` | Bitwise XOR | Left |
| 11 | `\|` | Bitwise OR | Left |
| 12 | `[:]` | Slice | N/A |
| 13 | `in` `not in` | Membership | Left |
| 14 | `<` `>` `<=` `>=` | Comparison | Left |
| 15 | `==` `!=` | Equality | Left |
| 16 | `is` | Type check | Left |
| 17 | `as` `as?` | Cast operators (narrowing) | Left |
| 18 | `and` `&&` | Logical AND (short-circuit) | Left |
| 19 | `or` `\|\|` | Logical OR (short-circuit) | Left |
| 20 | `??` | Null coalescing | Left |
| 21 | `? :` | Ternary conditional | Right |
| 22 | `?` (postfix) | Result propagation | Postfix |
| 23 | `=` `+=` `-=` `*=` `/=` `%=` `**=` `<<=` `>>=` `&=` `\|=` `^=` | Assignment | Right |
| 24 | `*` `**` (prefix, spread) | Spread | Prefix |

**Arithmetic operators** (`+`, `-`, `*`, `/`, `%`, `**`) operate on `int` and `float`. Mixed `int`/`float` arithmetic promotes the `int` operand to `float`. Division of two `int` values produces `int` (truncating); use `float` division for fractional results. The `+` operator also concatenates `string` values and `list` values.

**Comparison operators** (`<`, `>`, `<=`, `>=`) operate on types that implement the `Comparable[T]` interface. Primitives (`int`, `float`, `string`) are comparable by default.

**Equality operators** (`==`, `!=`) use structural equality for primitives, enums, structs, and tuples. For class instances, `==` compares by reference identity unless the class overrides equality via the `Comparable[T]` interface. Equality is reflexive (`a == a`), symmetric (`a == b` implies `b == a`), and transitive.

**Logical operators** (`and`/`&&`, `or`/`||`, `not`/`!`) operate on `bool` values. `and` and `or` are short-circuit: the right operand is not evaluated if the left operand determines the result.

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

| Type | Description | Size |
|---|---|---|
| `int` | Signed 64-bit integer | 8 bytes |
| `float` | IEEE 754 double-precision float | 8 bytes |
| `bool` | Boolean (`true` or `false`) | 1 byte |
| `string` | UTF-8 encoded Unicode string | Variable |
| `bytes` | Arbitrary byte sequence | Variable |

"Passed by value" refers to the language's assignment/call semantics. The runtime may use efficient representations (handles, copy-on-write, etc.) as long as observable semantics match.

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
class String : Any { ... }
class Bytes  : Any { ... }
```

Box types are **ABI-internal**. Their `box()` and `unbox()` static methods are marked `@internal` and are not part of the user-facing API. User code SHALL NOT reference `Int`, `Float`, `Bool`, `String`, or `Bytes` directly as types. The compiler emits a deprecation warning for any direct reference.

The `box` contextual keyword (see §4.3) and implicit widening coercions (see §4.3) are the correct user-facing mechanisms for value-type-to-`Any` conversion. `Int.unbox()`, `String.unbox()` etc. are removed; use `as` or `as?` instead.

### §4.3 `Any`

`Any` is the root type for all heap-allocated and boxed values. Class instances are `Any`. Primitives, enums, and structs are not `Any` in their unboxed form.

**Implicit widening.** A primitive, enum, or struct value is **implicitly widened** to `Any` whenever it appears in a position that is statically typed as `Any`. The compiler inserts the boxing instruction silently — no user syntax is required:

```
fun log(value: Any): void { print(value.render()); }

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
- **`system.inspect` writes and invocations** accept primitives and enum values; typed helpers auto-unbox primitive outputs.

**Default rendering.** All `Any` values support rendering for templates and meta-output:

```
class Any {
  pub fun render(ctx: RenderContext = RenderContext(language="repr", format="none")): string;
}
```

### §4.4 Function Types

Function types describe callable values:

```
fn(int, int): int           // function taking two ints, returning int
fn(): void                  // function taking no args, returning void
fn(string): Task[int]       // function taking string, returning async task
async fn(string): int       // shorthand for fn(string): Task[int]
```

Function types are first-class: they can be stored in variables, passed as arguments, and returned from functions. See §7 for function declarations and lambdas.

### §4.5 Union Types

Union types express that a value may be one of several types without declaring a named enum:

```
let value: string | int = "hello";
let result: string | int | None = None;

fun parse(input: string): int | float | None {
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
fun display(value: string | int | bool): string {
  return match value {
    string(s) => "string: {$ s $}",
    int(n)    => "int: {$ n $}",
    bool(b)   => if (b) { "true" } else { "false" },
  };
}

fun process(value: string | int) {
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

fun first[T](items: list[T | None]): T | None { ... }
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

**Resolution.** Type aliases are resolved at compile time. They do not exist at runtime — `system.reflect.typeOf` on a value typed as `UserId` returns the `Type` for `string`, not a separate `UserId` type.

**Scope.** Type aliases may appear at module top level, inside class bodies, and inside struct bodies. Exported aliases use `pub type`:

```
pub type Handler = fn(Request): Task[Response];

class HttpClient : Any {
  type Response = HttpResponse;
  type Error = HttpError;

  pub fun get(url: string): Task[Response] { ... }
}
```

**Recursion rejection.** The compiler SHALL detect and reject recursive type aliases that would create infinite expansion:

```
type Bad = list[Bad];   // compile-time error: recursive type alias
```

**Compiled mode.** Type aliases are permitted in both scripted and `@compiled` mode. In compiled mode, the aliased type must conform to compiled-mode restrictions.

### §4.7 `typeof` and `instanceof` Operators

Loom provides inline operators for type inspection as surface sugar over `system.reflect`:

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

`typeof expr` returns the same `Type` value as `system.reflect.typeOf(expr)`.

**`instanceof` operator.** Checks whether a value is an instance of a given type:

```
if (x instanceof MyClass) {
  x.myMethod();  // x is narrowed to MyClass
}
```

`expr instanceof Type` returns `bool` — `true` if the runtime type of `expr` is `Type` or a subtype of `Type`. The compiler applies flow-sensitive type narrowing after `instanceof` checks:

```
fun process(value: Any) {
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

- `x instanceof T` is equivalent to `system.reflect.is(x, T)`.
- `x is T` (from union type narrowing) is a synonym for `instanceof` — both are permitted.
- `typeof x` is equivalent to `system.reflect.typeOf(x)`.

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
fun identity[T](x: T): T { return x; }

class Box[T] : Any {
  pub let value: T;
  new(value: T) { this.value = value; }
}

interface Container[T] {
  fun get(): T;
  fun set(value: T): void;
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
fun max[T: Comparable[T]](a: T, b: T): T {
  return a > b ? a : b;
}

class SortedList[T: Comparable[T]] : Any {
  // ...
}
```

**Reification.** Generics are reified at runtime — type parameters are available via reflection. `system.reflect.typeOf` on a `Box[int]` returns a `Type` whose `params()` includes the `Type` for `int`.

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
  fun compareTo(other: T): int;
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
- **Classes**: referential identity by default (two references are equal only if they point to the same object). A class may override equality by implementing `Comparable[T]`, in which case `==` uses `compareTo(other) == 0`.
- `None == None` is `true`.

Equality is reflexive (`a == a`), symmetric (`a == b` implies `b == a`), and transitive (`a == b` and `b == c` implies `a == c`) for all types.

`!=` is always the logical negation of `==`.

#### Logical Operators (`and`, `or`, `not`)

- `a and b` — short-circuit: evaluates `b` only if `a` is `true`. Both operands must have type `bool`; result is `bool`.
- `a or b` — short-circuit: evaluates `b` only if `a` is `false`. Both operands must have type `bool`; result is `bool`.
- `not a` — logical negation. Operand must have type `bool`; result is `bool`.

Non-`bool` operands are a compile-time error. There is no truthy/falsy coercion.

#### Bitwise Operators (`&`, `|`, `^`, `~`, `<<`, `>>`)

Bitwise operators are defined on `int` only:

- `a & b` — bitwise AND
- `a | b` — bitwise OR
- `a ^ b` — bitwise XOR
- `~a` — bitwise NOT (unary)
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
- `string[i]` → single-character string at index `i`.
- `bytes[i]` → `int` byte value at index `i`.
- `tuple[i]` → element at compile-time constant index `i`.

#### Equality Operators (amended)

Equality semantics depend on the type category:

- **Primitives** (`int`, `float`, `bool`, `string`, `bytes`): structural equality (value comparison).
- **Enums**: structural equality — same variant and same payload values (compared recursively).
- **Structs**: structural equality — all fields are equal (compared recursively).
- **Tuples**: structural equality — all elements are equal (compared recursively).
- **Classes**: if the class implements `Equatable[T]`, `==` calls `op_==(other)`. Otherwise, referential identity (two references equal only if they point to the same object). `Comparable[T]` implies `Equatable[T]` — implementing it provides `==` as `compareTo(other) == 0`, which may be overridden by an explicit `operator fun ==`.
- `None == None` is `true`.

Equality is reflexive, symmetric, and transitive for all types. `!=` is always the logical negation of `==`.

**Consistency rule.** Implementing `Equatable[T]` on a type used as a `set[T]` element or `dict` key without also implementing `Hashable` is a compile-time error. Elsewhere, it is a compile-time warning.

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
| `a ** b` | `a.op_**(b)` | `Pow[typeof b, R]` |
| `-a` | `a.op_neg()` | `Neg` |
| `a & b` | `a.op_band(b)` | `BitAnd[typeof b, R]` |
| `a \| b` | `a.op_bor(b)` | `BitOr[typeof b, R]` |
| `a ^ b` | `a.op_xor(b)` | `BitXor[typeof b, R]` |
| `~a` | `a.op_bnot()` | `BitNot` |
| `a << b` | `a.op_shl(b)` | `Shl[typeof b, R]` |
| `a >> b` | `a.op_shr(b)` | `Shr[typeof b, R]` |
| `a[k]` | `a.op_index(k)` | `Index[typeof k, V]` |
| `a[k] = v` | `a.op_index_set(k, v)` | `IndexSet[typeof k, typeof v]` |
| `x in a` | `a.op_contains(x)` | `Contains[typeof x]` |
| `a(arg)` | `a.op_call(arg)` | `Callable[typeof arg, R]` |

Built-in types satisfy these interfaces implicitly — the compiler emits specialised instructions for performance, but the semantic contract is identical.

**Augmented assignment desugar.** `x += y` desugars to `x = x + y`. If a class also defines an explicit `operator fun +=`, that definition is used instead:

```
class BigInt : Any implements Add[BigInt] {
  pub operator fun +(other: BigInt): BigInt { ... }
  pub operator fun +=(other: BigInt): void { ... }  // explicit in-place override
}
```

Explicit augmented assignment override is **classes only**. Writing `operator fun +=` (or any augmented assignment override) on a struct is a compile-time error. Augmented assignment on struct values is always auto-derived as `x = x + y`.

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
| `string` | `string` (operates on Unicode scalar values) |
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
fun process(path: string): Result[string, AppError] {
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
  static fun from(err: E): Self;
}
```

User-defined error types implement `From[E]` to enable automatic conversion:

```
class AppError implements From[IoError], From[ParseError] {
  pub let message: string;
  pub let cause: Option[Any];

  static fun from(err: IoError): Self {
    return AppError(message: "IO: {$ err.message $}", cause: Some(err));
  }

  static fun from(err: ParseError): Self {
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

  pub fun scope_enter(): Transaction {
    return db.begin();
  }

  pub fun scope_exit(error: Option[Any]): bool {
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
- Duplicate portal names are permitted.
- All named functions and methods are **implicit portals** at entry, with stable fully-qualified portal names derived from the module path and callable name (e.g., `"myapp.server.handleRequest"`).
- Explicit `portal` statements and implicit callable portals share a single activation registry maintained by the runtime host.
- If a portal is entered and no matching activation exists, it is observationally inert — the body executes normally with zero overhead.
- If a portal is entered and a matching activation exists with a true condition, the runtime activates tracing for the current task.

**Portal names in compiled code.** In `@compiled` files, portal names are resolved from the static metadata table (see §20.3) registered at module load time. The fully-qualified callable name for implicit portals is available via `system.reflect.callableName(f)` (§21.11).

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
for ([index, item] in items.enumerate()) { /* ... */ }
for await ((id, result) in stream) { /* ... */ }
```

**In function parameters:**

```
fun distance((x1, y1): tuple[float, float], (x2, y2): tuple[float, float]): float {
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

### §6.10 Exception Chaining

All error types carry an optional `cause` property of type `Option[Any]` that links to the underlying exception:

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
fun printChain(err: Any): void {
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
fun add(a: int, b: int): int {
  return a + b;
}
```

**Async function:**

```
async fun fetchUser(id: string): Task[User] {
  let response = await runtime.net.get("/users/{$ id $}");
  return parseUser(await response.json());
}
```

- `async fun name(...): T { ... }` declares a function whose call result is `Task[T]`.
- Calling an async function starts the task immediately and returns its `Task[T]`.
- `await expr` requires `expr` to have type `Task[T]`; it suspends the current async context until the task completes and then evaluates to `T`.
- If the awaited task has failed, `await` rethrows the failure at the await site.
- `await` is permitted inside `async fun` bodies, entry scripts, REPL sessions, and async template rendering contexts.
- `await` is prohibited during module initialization (imported modules may not suspend during initialization).

**Generator function:**

```
gen fun fibonacci(): Iterable[int] {
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
async gen fun fetchPages(urls: list[string]): AsyncIterable[string] {
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

  pub operator fun +(other: Vec2): Vec2 =>
    Vec2(x=x + other.x, y=y + other.y);

  pub operator fun -(other: Vec2): Vec2 =>
    Vec2(x=x - other.x, y=y - other.y);

  pub operator fun -(): Vec2 =>
    Vec2(x=-x, y=-y);
}

let a = Vec2(x=1.0, y=2.0);
let b = Vec2(x=3.0, y=4.0);
let c = a + b;   // Vec2(x=4.0, y=6.0) — desugars to a.op_+(b)
```

**Rules for `operator fun`:**

- `operator fun` is valid only inside interface bodies, class bodies, and struct bodies.
- The method name must be one of the operator symbols defined in §11.2, or `contains` (for `Contains[T]`).
- The method must satisfy the signature required by the corresponding operator interface.
- Implementing an operator interface without declaring the corresponding `operator fun` is a compile-time error.
- Declaring `operator fun` without `implements OperatorInterface` is a compile-time error.
- `operator fun` is permitted in `@compiled` mode.

### §7.2 Lambdas

Lambdas (anonymous functions) come in two forms:

**Expression body** — evaluates `expr` and returns the result:

```
let double = fun(x: int) => x * 2;
let greet = fun(name: string) => "Hello, {$ name $}!";
```

**Block body** — executes the block; requires explicit `return`:

```
let process = fun(data: string) {
  let parsed = parse(data);
  return transform(parsed);
};
```

**Async variants:**

```
let fetchAsync = async fun(url: string) => await runtime.net.get(url);
let processAsync = async fun(data: string) {
  let result = await compute(data);
  return result;
};
```

**Zero-parameter shorthand:**

```
let now = fun() => Instant.now();
```

**Type annotations** on parameters are optional when the expected type is known from context:

```
let nums = [1, 2, 3];
let doubled = nums.map(fun(x) => x * 2);  // x inferred as int
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

fun makeCounter(start: int): fn(): int {
  var count = start;
  return fun(): int {
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
  fns = fns + [fun() => i];    // each closure captures a distinct 'i'
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
fun add(a: int, b: int): int { return a + b; }
let add5 = fun(b: int) => add(5, b);   // manual partial application
```

**Closures in `@compiled` mode.** Closures in `@compiled` files follow the same capture rules with the restriction that captured `var` bindings must have statically-known types (no `Any`). The compiler may optimize non-escaping closures to avoid heap allocation of captured variables.

**ARC capture lists (native target only).** On `--target native` builds, closures that create ARC retain cycles must break them with weak or unowned capture list entries:

```
// Without capture list: handle captures itself via the closure — retain cycle
let handle = effect(fun() {
  if (count.get() > 10) { handle.dispose(); }
});

// With capture list: weak breaks the cycle
let handle = effect(fun() [weak handle] {
  if (count.get() > 10) { handle?.dispose(); }  // handle is now Option[EffectHandle]
});
```

**Capture list syntax:** `fun(params) [weak name, unowned other] { body }` or `fun(params) [weak name] => expr`. Captured names with `weak` become `T?` inside the closure body. Captured names with `unowned` retain type `T` but accessing a deallocated `unowned` referent is a `LifetimeError` trap in debug builds and undefined behaviour in release builds.

Capture lists are valid only in `@compiled` files targeting `--target native`. Using a capture list in scripted code or non-native compiled targets is a compile-time error.

The compiler SHALL emit a warning when it detects a probable ARC retain cycle in a closure on native targets without a corresponding capture list entry.

### §7.4 Rest Parameters and Keyword-Only Parameters

**Rest parameters** collect extra positional arguments:

```
fun log(level: string, *messages: list[string]) {
  for (msg in messages) {
    print("[{$ level $}] {$ msg $}");
  }
}

log("INFO", "starting", "loading config", "ready");
```

`*args` collects extra positional arguments into a `list[T]`.

**Keyword rest parameters** collect extra keyword arguments:

```
fun configure(name: string, **options: dict[string, Any]) {
  // options contains all keyword arguments not matched by named parameters
}

configure("app", timeout=5000, retries=3);
```

`**kwargs` collects extra keyword arguments into a `dict[string, T]`.

**Keyword-only parameters.** A bare `*` in the parameter list forces all subsequent parameters to be keyword-only:

```
fun connect(host: string, port: int, *, timeout: int = 5000, tls: bool = true) {
  // timeout and tls must be passed as keyword arguments
}

connect("localhost", 8080, timeout=3000);  // ok
connect("localhost", 8080, 3000);          // compile-time error
```

A bare `*` does not collect any arguments — it only marks the boundary. A bare `*` and a named `*args` are mutually exclusive. Parameters after `*` or `*args` must be passed by name; passing them positionally is a compile-time error. Keyword-only parameters may have default values; those without defaults are required keyword arguments.

**Parameter ordering.** The compiler enforces the following order in function declarations: regular positional parameters first, then `*args` (or bare `*`), then keyword-only parameters (if any), then `**kwargs`. A function may have at most one `*` parameter and at most one `**` parameter.

**Combining rest with regular parameters:**

```
fun request(method: string, url: string, *headers: list[string], timeout: int = 5000, **opts: dict[string, Any]) {
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
gen fun range(start: int, end: int): Iterable[int] {
  var i = start;
  while (i < end) {
    yield i;
    i = i + 1;
  }
}
```

**`yield` statement.** `yield expr;` suspends the generator, produces the value of `expr` to the consumer, and resumes when the consumer requests the next value. `yield` is only permitted inside `gen fun` and `async gen fun` bodies — using `yield` in a regular `fun` or `async fun` is a compile-time error.

**`yield*` (yield-from).** Delegates to another iterable, yielding all of its values:

```
gen fun chain(a: Iterable[int], b: Iterable[int]): Iterable[int] {
  yield* a;
  yield* b;
}
```

**Async generators:**

```
async gen fun fetchPages(urls: list[string]): AsyncIterable[string] {
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

1. Calling a `gen fun` returns an `Iterable[T]` (or `AsyncIterable[T]`) without executing any of the body.
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
fun getUsers(): Response {
  return Response.ok(fetchUsers());
}

@cache(ttl=60)
fun expensiveComputation(x: int): int {
  // ...
}
```

**Decorator signature.** A decorator is a callable with signature `fun(target: T, ...args): T` where `T` is the type of the decorated item. The first argument is always the item being decorated; additional arguments come from the decorator invocation.

**Supported targets:**

- Functions: `@decorator fun name(...) { ... }`
- Classes: `@decorator class Name { ... }`
- Methods: `@decorator pub fun name(...) { ... }` inside a class body

**Stacking.** Multiple decorators are applied bottom-up (innermost first):

```
@log
@auth("admin")
@route("/admin/users")
fun adminUsers(): Response { ... }
// Applied as: log(auth(route(adminUsers, "/admin/users"), "admin"))
```

**Execution timing:**

- In scripted mode: decorators run at declaration time as part of statement-level execution.
- In `@compiled` mode: decorators that only attach metadata are evaluated at compile time; decorators with runtime side effects execute at module initialization.

**Metadata access.** Decorator metadata is accessible via `system.reflect.annotations(target)`, returning a `dict[string, Any]`.

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

  pub fun get(path: string): Task[Response] {
    // ...
  }

  pub static fun create(url: string): HttpClient {
    return HttpClient(baseUrl=url);
  }

  pub fun close(): void {
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
  abstract fun area(): float;
  abstract fun perimeter(): float;

  pub fun describe(): string {
    return "Shape with area {$ area() $}";
  }
}

class Circle : Shape {
  pub let radius: float;
  new(radius: float) { this.radius = radius; }

  pub fun area(): float { return 3.14159 * radius * radius; }
  pub fun perimeter(): float { return 2.0 * 3.14159 * radius; }
}
```

Abstract classes cannot be instantiated directly.

### §8.4 Constructors, `this`, and `Self`

**Constructors** use `new(params) { ... }` inside the class body. A class may have at most one constructor. If no constructor is declared, the compiler generates a default constructor that accepts all declared fields as named parameters:

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
  fun copy(): Self;
}

class Config : Any implements Copyable {
  pub let name: string;
  pub let value: int;

  pub fun copy(): Self {
    return Config(name=name, value=value);
  }
}
```

### §8.5 Static Members

**Static methods** belong to the class itself, not to instances:

```
class MathUtils : Any {
  pub static fun clamp(value: float, min: float, max: float): float {
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

**`unowned` field qualifier.** An `unowned` field holds a non-owning reference with the assertion that the referent will outlive the declaring object. On the native ARC target, `unowned` fields do not increment the retain count and are not tracked by the zeroing side table. Accessing an `unowned` field after the referent has been deallocated is a `LifetimeError` trap in debug builds and undefined behaviour in release builds.

`unowned` fields have type `T` (not `T?`). They are permitted only in `@compiled` files targeting `--target native`. Using `unowned` in scripted mode, Wasm-targeted compiled mode, or any other context is a compile-time error: "unowned references are only valid in @compiled native builds."

```
@compiled

class Child : Any {
  unowned let parent: Parent;   // parent must outlive child — no retain increment
  new(parent: Parent) { this.parent = parent; }
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
  pub fun hasField(name: string): bool;
  pub fun getField(name: string): Any;
  pub fun setField(name: string, value: Any): void;
  pub fun deleteField(name: string): bool;
  pub fun fieldNames(): list[string];
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
fun onMessage(data: string): void {
  process(data);
}

@deprecated("Use newMethod instead")
pub fun oldMethod(): void { ... }
```

**Language-defined annotations:**

| Annotation | Target | Description |
|---|---|---|
| `@compiled` | File (first line) | Marks a file as compiled mode (see §22) |
| `@jsexport` | `fun`, `async fun` | Marks a function as callable from JavaScript (see §18.2) |

All other annotations are user-defined. Language-defined annotations have special compiler semantics and are not ordinary functions.

**User-defined annotations.** User-defined annotations follow the decorator protocol (see §7.6). User-defined annotations can carry typed parameters — the annotation function's parameter types define the accepted argument types:

```
fun cached(ttl: int) {
  return fun(target: fn): fn {
    // wrap target with caching logic
  };
}

@cached(ttl=60)
fun expensiveComputation(x: int): int { ... }
```

**Unknown annotations.** The compiler SHALL emit a compile-time warning (not error) for unknown annotations, allowing tooling-defined annotations to coexist with language-defined ones.

**Reflection access.** Annotations are accessible via `system.reflect.annotations(target)`, returning a `dict[string, Any]` mapping annotation names to their argument values.

### §8.9 Finalization

The `Finalizable` interface declares cleanup logic:

```
interface Finalizable {
  fun finalize(): void;
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

### §9.2 Enum/`Any` Boundary

When an enum value is stored in an `Any`-typed position, the runtime wraps it in a heap-allocated box preserving the enum's full type identity (declared type name, type parameters, and active variant):

- **Boxing:** Assigning an enum value to an `Any`-typed variable boxes it automatically. The resulting `Any` carries the enum's full type.
- **Unboxing:** Extracting an enum from `Any` requires `match` or `system.reflect.as(x, T)`. There is no implicit unboxing coercion.
- **`match` over `Any`:** Dispatch proceeds on the actual boxed enum type at runtime. If no arm matches and no wildcard is present, a `MatchError` is thrown.
- **`typeOf` on a boxed enum:** Returns a `Type` with `kind == "enum"`, the declared name, and instantiated type arguments.

```
fun describe(x: Any): string {
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
fun display(value: string | int | bool): string {
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
fun process(value: string | int) {
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
- Boxing: `Any.box(myStruct)` boxes a struct value for use in `Any`-typed contexts.
- Structs may implement interfaces.

### §10.5 Methods

```
struct Vector2 {
  x: float;
  y: float;

  pub fun length(): float {
    return (x * x + y * y).sqrt();
  }

  pub fun add(other: Vector2): Vector2 {
    return Vector2(x=x + other.x, y=y + other.y);
  }

  pub static fun zero(): Vector2 {
    return Vector2(x=0.0, y=0.0);
  }
}
```

Instance methods receive an implicit `this` (read-only for immutable structs). Static methods work the same as on classes.

**Operator overloading on structs.** All binary operator interfaces (`Add`, `Sub`, `Mul`, `Div`, `Mod`, `Pow`, `BitAnd`, `BitOr`, `BitXor`, `Shl`, `Shr`, `Index`, `IndexSet`, `Contains`, `Callable`) and unary operator interfaces (`Neg`, `BitNot`) may be implemented on structs using `operator fun`:

```
struct Vector2 {
  x: float;
  y: float;

  pub fun length(): float { return (x * x + y * y).sqrt(); }

  pub operator fun +(other: Vector2): Vector2 =>
    Vector2(x=x + other.x, y=y + other.y);

  pub operator fun *(scale: float): Vector2 =>
    Vector2(x=x * scale, y=y * scale);
}
```

**Augmented assignment override is prohibited on structs.** Writing `operator fun +=` (or any other explicit augmented assignment override) on a struct is a compile-time error. The rationale: structs are value types and `this` inside a struct method is not the caller's binding, so in-place mutation cannot update the caller's variable. Augmented assignment on struct values always auto-derives as `x = x + y`.

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

---

## §11 Interfaces

*(This section is normative.)*

### §11.1 Interface Declarations

Interfaces define contracts that classes and structs explicitly implement:

```
interface Serializable {
  fun serialize(): bytes;
  fun deserialize(data: bytes): Self;
}

class Config : Any implements Serializable {
  pub let data: dict[string, string];

  pub fun serialize(): bytes {
    return system.json.stringify(data).toBytes();
  }

  pub static fun deserialize(data: bytes): Self {
    let json = system.json.parse(system.text.fromBytes(data)?)?;
    return Config(data=json);
  }
}
```

Interfaces are nominal (not structural); a class must explicitly declare `implements`. Interface declarations are block statements (no trailing `;`).

### §11.2 Standard Interfaces

The following interfaces are defined by the language and standard library:

```
interface Iterable[T]       { fun iter(): Iterator[T]; }
interface Iterator[T]       { fun next(): Option[T]; }
interface AsyncIterable[T]  { fun asyncIter(): AsyncIterator[T]; }
interface AsyncIterator[T]  { fun next(): Task[Option[T]]; }
interface KeyLookup[K, V]   { fun has(key: K): bool; fun get(key: K): Option[V]; }
interface Readable          { fun read(n: int): bytes; }
interface Writable          { fun write(b: bytes): int; }
interface Closeable         { fun close(): void; }
interface Sized             { fun len(): int; }
interface From[E]           { static fun from(err: E): Self; }
interface Comparable[T]     { fun compareTo(other: T): int; }
interface Equatable[T]      { operator fun ==(other: T): bool; }
interface Hashable          { fun hashCode(): int; }
interface Renderable        { fun render(ctx: RenderContext): string; }
interface Dynamic           { fun hasField(name: string): bool; fun getField(name: string): Any; fun setField(name: string, value: Any): void; fun deleteField(name: string): bool; fun fieldNames(): list[string]; }
interface Finalizable       { fun finalize(): void; }
```

**Relationship between `Comparable[T]` and `Equatable[T]`.** `Comparable[T]` is a subtype of `Equatable[T]` — implementing `Comparable[T]` automatically provides an `==` implementation via `compareTo(other) == 0`. This default `==` may be overridden by an explicit `operator fun ==` declaration.

**Operator interfaces.** The following interfaces extend operator behaviour to user-defined types. The `R = Self` default means the return type equals the implementing type in the common case. Provide `R` explicitly for mixed-type operations (e.g., `Mul[float, Vec2]`):

```
interface Add[T, R = Self]     { operator fun +(other: T): R; }
interface Sub[T, R = Self]     { operator fun -(other: T): R; }
interface Mul[T, R = Self]     { operator fun *(other: T): R; }
interface Div[T, R = Self]     { operator fun /(other: T): R; }
interface Mod[T, R = Self]     { operator fun %(other: T): R; }
interface Pow[T, R = Self]     { operator fun **(other: T): R; }
interface Neg                  { operator fun -(): Self; }
interface BitAnd[T, R = Self]  { operator fun &(other: T): R; }
interface BitOr[T, R = Self]   { operator fun |(other: T): R; }
interface BitXor[T, R = Self]  { operator fun ^(other: T): R; }
interface BitNot               { operator fun ~(): Self; }
interface Shl[T, R = Self]     { operator fun <<(other: T): R; }
interface Shr[T, R = Self]     { operator fun >>(other: T): R; }
interface Index[K, V]          { operator fun [](key: K): V; }
interface IndexSet[K, V]       { operator fun []=(key: K, value: V): void; }
interface Contains[T]          { operator fun contains(item: T): bool; }
interface Callable[A, R]       { operator fun ()(arg: A): R; }
```

**Built-in operator interface implementations.** The built-in types satisfy operator interfaces implicitly. The compiler emits specialised instructions for performance, but the semantic contract is identical to user-defined operator implementations:

| Type | Implements |
|---|---|
| `int`, `float` | `Add`, `Sub`, `Mul`, `Div`, `Mod`, `Pow`, `Neg`, `Comparable[T]`, `Equatable[T]`, `BitAnd`, `BitOr`, `BitXor`, `BitNot`, `Shl`, `Shr` |
| `string` | `Add` (concatenation), `Comparable[T]`, `Equatable[T]`, `Index[int, string]`, `Contains[string]` |
| `list[T]` | `Add` (concatenation), `Index[int, T]`, `IndexSet[int, T]`, `Contains[T]` |
| `dict[K, V]` | `Index[K, V]`, `IndexSet[K, V]`, `Contains[K]` |
| `set[T]` | `Contains[T]` |
| `bytes` | `Index[int, int]`, `Comparable[bytes]` |

**`Scoped[T]` (context manager protocol):**

```
interface Scoped[T] {
  fun scope_enter(): T;
  fun scope_exit(error: Option[Any]): bool;
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
  fun scope_enter(): Task[T];
  fun scope_exit(error: Option[Any]): Task[bool];
}
```

Used with `with` in async contexts. The runtime `await`s both methods.

`Scoped[T]` and `AsyncScoped[T]` are permitted in `@compiled` mode.

### §11.3 Iteration Protocol

The iteration protocol defines how types participate in `for` and `for await` loops.

**`Iterable[T]`** is the sole mechanism for making a type usable in `for (x in expr) { ... }`:

```
interface Iterable[T] {
  fun iter(): Iterator[T];
}
```

Each call to `iter()` MUST return a new, independent iterator.

**`Iterator[T]`** is a stateful, single-pass cursor:

```
interface Iterator[T] {
  fun next(): Option[T];
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
| `string` | `string` | Unicode scalar values as single-char strings |
| `bytes` | `int` | Individual byte values (0–255) |
| `tuple[...]` | `Any` | Heterogeneous; not available in `@compiled` mode |

**User-defined iterables:**

```
class Range : Any implements Iterable[int] {
  let start: int;
  let end: int;
  new(start: int, end: int) { this.start = start; this.end = end; }

  pub fun iter(): Iterator[int] {
    return RangeIterator(start, end);
  }
}

class RangeIterator : Any implements Iterator[int], Iterable[int] {
  var current: int;
  let end: int;
  new(start: int, end: int) { current = start; this.end = end; }

  pub fun next(): Option[int] {
    if (current >= end) { return None; }
    let value = current;
    current = current + 1;
    return Some(value);
  }

  pub fun iter(): Iterator[int] { return this; }
}
```

**Optional iterator methods:**

- `fun close(): void` — called on early exit (`break`, `return`, exception) to release resources.
- `fun sizeHint(): Option[int]` — returns an estimate of remaining elements for pre-allocation.

**Concurrent modification.** Modifying a collection while iterating it is undefined behavior in scripted mode and a compile-time error in `@compiled` mode when statically detectable.

**Generators and iteration.** Generators (see §7.5) automatically implement `Iterable[T]` (or `AsyncIterable[T]` for async generators), providing a simpler way to create custom iterators without writing separate iterator classes:

```
gen fun countdown(from: int): Iterable[int] {
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

---

## §12 Generics

*(This section is normative.)*

Loom supports generic type parameters on functions, classes, interfaces, enums, and structs. This section consolidates the generic type system rules.

**Declaration syntax:**

```
fun identity[T](x: T): T { return x; }
class Box[T] : Any { pub let value: T; }
interface Container[T] { fun get(): T; }
enum Tree[T] { Leaf(value: T), Node(left: Tree[T], right: Tree[T]) }
struct Pair[A, B] { first: A; second: B; }
```

**Constraints:**

```
fun max[T: Comparable[T]](a: T, b: T): T {
  return a > b ? a : b;
}
```

Multiple constraints use `+`: `T: Comparable[T] + Hashable`.

**Reification.** Generics are reified at runtime. `system.reflect.typeOf` on a `Box[int]` returns a `Type` whose `params()` includes the `Type` for `int`.

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

### §13.3 Package Manifest (`loom.pkg`)

Every distributable package or application root must contain a `loom.pkg` manifest:

```
# loom.pkg — manifest format (TOML-like, line-oriented)

package   my-app
version   1.4.0
loom      ">=0.5"

[deps]
system.http  = "^2.0"
jsonschema   = "^1.4"
ui-toolkit   = "^0.8"

[dev-deps]
test-runner  = "^3.1"

[target.browser]
exclude system.fs
exclude system.proc

[target.cli]
include system.fs
include system.proc

[target.service]
include system.fs
include system.proc
include system.net

[target.desktop]
include system.fs
include system.proc
include system.net
include system.ui.desktop

[target.native]
include system.fs
include system.proc
include system.net
```

**Rules:**

- `package` names are lowercase, hyphen-separated identifiers.
- `version` follows semantic versioning (`MAJOR.MINOR.PATCH`).
- `loom` specifies the minimum required toolchain version.
- Dependency versions use constraint expressions: `^` (compatible), `~` (patch-compatible), `>=`, `<=`, exact, or range.
- A `loom.lock` lockfile records exact resolved versions of all transitive dependencies.
- **Platform profiles** (`[target.X]`) declare which `system.*` capabilities are available. The compiler enforces these at build time.
- Default targets: `cli`, `browser`, `service`.
- `system.text`, `system.json`, `system.time`, and `system.collections` are available on all targets without restriction.

### §13.4 Module Initialization

When a module is imported, its top-level statements execute sequentially in source order (see §2.1). Module initialization has the following properties:

- **Permitted top-level statements.** A module's top-level code may contain: import statements, declarations (`class`, `enum`, `interface`, `struct`, `fun`, `async fun`, `type`), `let`/`var` initializers, and expression statements.
- **At-most-once execution.** A module's top-level statements execute at most once. Subsequent imports reuse cached bindings.
- **Import-order initialization.** When a module contains multiple import statements, each imported module is fully initialized before the next import statement executes. For example, if a file imports module A then module B, module A's top-level statements run to completion before module B's initialization begins.
- **Circular imports.** If module A imports module B and module B imports module A, the compiler detects the cycle. The second import sees the partially-initialized bindings of the first module (only those declarations that have already executed). Circular imports are permitted but discouraged; the partially-initialized state can lead to `None` bindings for declarations not yet reached.
- **No suspension.** `await` is prohibited during module initialization (see §7.1).

The module dunders (`__name__`, `__file__`, `__execmode__`) are set before any top-level statements execute (see §2.2).

### §13.5 Package Registry

The Loom ecosystem defines a registry protocol for publishing, discovering, and fetching packages:

- `loom publish` publishes a package to a registry.
- Authentication and authorization are required for publishing.
- Package naming follows the same rules as `loom.pkg` `package` names.
- Version conflict resolution uses semantic versioning.
- Yanking/deprecation policies allow removing broken versions.
- The protocol supports both a hosted reference registry and self-hosted instances.

### §13.6 Reserved Namespace

The `system` root namespace is reserved for the standard library. User packages cannot use `system` as a package name.



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

Template fences produce `system.template.Template` values:

````
```(language):(format)
... content ...
```
````

Fences follow the same anchor `P` alignment rule as multiline strings.

**Descriptors:**

| Key | Description | Example |
|---|---|---|
| `language` | Target language | `py`, `ts`, `html`, `sql` |
| `format` | Formatter | `prettier`, `black`, `none` (default) |
| `indent_type` | Indent unit | `"space"`, `"tab"` |
| `indent` | Indent shift | `+2`, `-1` |
| `eol` | Line ending | `"LF"`, `"CRLF"`, `"source"` |
| `components` | Component registry | `registry` (valid only for `language=html`) |

**Alternative delimiters** for meta-templating:

| Key | Default | Description |
|---|---|---|
| `stmt_open` | `{%` | Directive opener |
| `stmt_close` | `%}` | Directive closer |
| `expr_open` | `{$` | Expression opener |
| `expr_close` | `$}` | Expression closer |

````
```(html):(format=prettier, stmt_open="[[", stmt_close="]]", expr_open="<<", expr_close=">>")
[[ if (users.isEmpty()) ]]
  <p>No users.</p>
[[ end ]]
```
````

Delimiter requirements: each opener/closer must be non-empty; `stmt_*` delimiters must not equal `expr_*` delimiters.

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

  pub fun render(scope: dict[string, Any]): string;
  pub fun renderWith(ctx: RenderContext, scope: dict[string, Any]): string;
  pub fun renderAsync(scope: dict[string, Any]): Task[string];
  pub fun renderWithAsync(ctx: RenderContext, scope: dict[string, Any]): Task[string];

  pub fun concat(other: Template): Template;
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
  fun render(ctx: RenderContext): string;
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

The default `Any.render()` produces a debug-style string representation: `<TypeName>` for class instances without `Renderable`, or the result of the boxed value's own rendering if the underlying type has one. User classes can override this by implementing `Renderable`, which takes precedence over the default `Any.render()` fallback. The runtime uses `system.reflect.typeOf` (§21.11) to determine the boxed value's type name for the default representation.

### §16.5 Failure Policy (Templates)

- **Hard fail by default** for evaluation errors, formatter errors, and bad descriptors.
- **Emitter try/catch (buffered):** the `try` body buffers; on failure emits nothing. An empty `catch` body swallows the error.
- `render` and `renderWith` fail if evaluation reaches `await`; use `renderAsync` or `renderWithAsync`.
- **Uncatchable:** parse/lex errors and alignment violations.



---

## §17 Concurrency

*(This section is normative.)*

### §17.1 `async`/`await`

Loom supports asynchronous functions and explicit suspension via `await`:

```
async fun buildPage(): Task[string] {
  let userTask = fetchUser();
  let postsTask = fetchPosts();
  let user = await userTask;
  let posts = await postsTask;
  return renderPage(user, posts);
}
```

- `async fun name(...): T { ... }` declares a function whose call result is `Task[T]`.
- Calling an async function starts the task immediately and returns its `Task[T]`.
- `await expr` requires `expr` to have type `Task[T]`; it suspends until the task completes and evaluates to `T`.
- If the awaited task has failed, `await` rethrows the failure.
- `await` is permitted inside `async fun` bodies, entry scripts, REPL sessions, and async template rendering contexts.
- `await` is prohibited during module initialization — imported modules may not suspend during initialization.
- `try`/`catch`, `finally`, `defer`, and lexical scope behave identically across suspension points as in synchronous code.
- `Task[T]` is a first-class class value (`Any`); it is never implicitly converted to `T`.
- Inserting a `Task[T]` into templates without `await` is an error.

### §17.2 `await group`

The `await group` block is the primary structured concurrency primitive for heterogeneous concurrent tasks:

```
async fun loadDashboard(userId: string): Task[Dashboard] {
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
async fun loadWithTimeout(): Task[Dashboard] {
  return await TaskGroup.withTimeout(5000, async fun() {
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
  pub static async fun collect[T, R](items: list[T], body: async fun(T): R): Task[list[R]];
  pub static fun race[T, R](items: list[T], body: async fun(T): R): AsyncIterable[R];
  pub static async fun withTimeout[T](ms: int, body: async fun(): T): Task[T];
  pub static async fun withCancellation[T](body: async fun(token: CancellationToken): T): Task[T];
}

class CancellationToken : Any {
  pub fun cancel(): void;
  pub fun isCancelled(): bool;
}
```

- `collect` runs `body` concurrently for each item and collects results. If any task fails, all remaining are cancelled.
- `race` returns results in completion order via `AsyncIterable[R]`.
- `withTimeout` cancels and throws `TimeoutError` if not complete within `ms` milliseconds.
- `withCancellation` provides a `CancellationToken` the caller can signal.

### §17.4 Async Iterators and `for await`

```
async fun processLines(path: string): Task[void] {
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
fun map[T, R](self: AsyncIterable[T], fn: fn(T): R): AsyncIterable[R];
fun filter[T](self: AsyncIterable[T], fn: fn(T): bool): AsyncIterable[T];
fun take[T](self: AsyncIterable[T], n: int): AsyncIterable[T];
fun merge[T](a: AsyncIterable[T], b: AsyncIterable[T]): AsyncIterable[T];
fun zip[A, B](a: AsyncIterable[A], b: AsyncIterable[B]): AsyncIterable[tuple[A, B]];
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
  pub fun send(msg: M): void;
  pub fun ask[R](msg: M): Task[R];
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

---

## §18 FFI and Host Interop

*(This section is normative.)*

Loom provides an explicit foreign function interface for calling JavaScript APIs and native shared libraries. FFI declarations are opt-in and syntactically visible.

### §18.1 JavaScript Interop (`extern js`)

```
extern js fun fetch(url: string, opts: Any): Task[Any];
extern js fun parseInt(s: string, radix: int): int;
extern js val document: Any;
extern js val window: Any;
```

**Rules:**

- `extern js fun` and `extern js val` are simple declarations (trailing `;`).
- Declared Loom types are trusted and not verified at compile time; type mismatches produce runtime errors.
- `extern js fun` returning a JS Promise is declared with return type `Task[T]`; the runtime wraps the Promise automatically.
- `extern js` declarations are only valid in modules not excluded from the active platform target.

### §18.2 `@jsexport`

`@jsexport` marks Loom functions as callable from JavaScript:

```
@jsexport
fun onMessage(data: string): void {
  process(data);
}

@jsexport
async fun fetchSummary(userId: string): Task[string] {
  let user = await fetchUser(userId);
  return buildSummary(user);
}
```

**Rules:**

- `@jsexport` may annotate `fun` or `async fun` declarations at module level, or `fun` expressions.
- The runtime marshals JS arguments to declared Loom types using boundary coercions. Unmarshalable arguments produce `FfiTypeError`.
- `async fun` exports return a `Promise<T>` to JS.
- Synchronous `@jsexport` functions must not contain `await` (compile-time error).
- `@jsexport` is only valid on `browser` and `service` targets.
- Module-level `@jsexport` functions are accessible as named exports of the compiled module's JS representation.

### §18.3 Typed JS Facades (`system.interop`)

`system.interop` provides typed wrappers over common Web and Node.js APIs:

```
namespace system.interop;

// HTTP
class Request  : Any { pub url: string; pub method: string; pub body: Option[bytes]; }
class Response : Any {
  pub status: int;
  pub ok: bool;
  pub fun text(): Task[string];
  pub fun json(): Task[Any];
  pub fun bytes(): Task[bytes];
}
fun fetch(url: string): Task[Response];
fun fetch(req: Request): Task[Response];

// Timers
fun setTimeout(ms: int, callback: fn(): void): TimerHandle;
fun clearTimeout(handle: TimerHandle): void;
fun setInterval(ms: int, callback: fn(): void): TimerHandle;
fun clearInterval(handle: TimerHandle): void;
class TimerHandle : Any { }

// DOM (browser only)
fun querySelector(selector: string): Option[Element];
fun querySelectorAll(selector: string): list[Element];
class Element : Any {
  pub id: string;
  pub className: string;
  pub fun getAttribute(name: string): Option[string];
  pub fun setAttribute(name: string, value: string): void;
  pub fun addEventListener(event: string, handler: fn(Event): void): void;
  pub fun removeEventListener(event: string, handler: fn(Event): void): void;
  pub fun appendChild(child: Element): void;
  pub fun remove(): void;
  pub innerHTML: string;
  pub textContent: string;
}
class Event : Any {
  pub type: string;
  pub fun preventDefault(): void;
  pub fun stopPropagation(): void;
}
```

DOM facades are restricted to the `browser` target. Typed facades are recommended over raw `extern js` declarations.

### §18.4 Native Interop (`extern native`)

```
extern native "libsqlite3" fun sqlite3_open(path: string): NativeHandle;
extern native "libsqlite3" fun sqlite3_close(db: NativeHandle): int;
```

**Rules:**

- `extern native "libname"` specifies the shared library by name (without platform-specific prefix/extension; the runtime resolves `libname.so`, `libname.dylib`, `libname.dll`).
- `NativeHandle` is an opaque type for C pointers — cannot be inspected or dereferenced in Loom code.
- `extern native` is only valid on `cli` and `service` targets.
- Passing a Loom `string` to a native function expecting a C string provides a null-terminated UTF-8 copy for the duration of the call.
- Memory management of native resources is the caller's responsibility; use `defer` for cleanup.

---

## §19 Reactive UI (`system.ui`)

*(This section is normative.)*

`system.ui` provides a single reactive component model targeting both web browsers and native desktop platforms. It is divided into three layers:

1. **Universal core** (`system.ui`) — signals, effects, component model, `View` type. Available on all targets including `browser`, `desktop`, `service` (for SSR), and `cli` (for testing).
2. **Web backend** (`system.ui.web`) — DOM rendering, `html` fence integration, SSR, hydration. Available on `browser` and `service` targets.
3. **Desktop backend** (`system.ui.desktop`) — native window management, platform chrome, implementation-defined rendering. Available on `desktop` target.

Components written using `system.ui` and the `ui` fence are cross-platform by default. Platform-specific enrichment is opt-in via the backend submodules.

### §19.1 Signals

```
class Signal[T] : Any {
  pub fun get(): T;
  pub fun set(value: T): void;
  pub fun update(fn: fn(T): T): void;
}

fun signal[T](initial: T): Signal[T];
fun derived[T](compute: fn(): T): Signal[T];
fun effect(fn: fn(): void): EffectHandle;

class EffectHandle : Any {
  pub fun dispose(): void;
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
let doubled = derived(fun() => count.get() * 2);

effect(fun() {
  log("count is now: {$ count.get() $}");
});

count.set(1);   // effect runs; doubled is now 2
```

### §19.2 Components and `ComponentRegistry`

Components are functions returning `View`:

```
fun Counter(initialValue: int): View {
  let count = signal(initialValue);
  return ```(ui):(components=registry)
    <Column spacing={$ 8 $}>
      <Text>{$ count.get() $}</Text>
      <Button onclick={$ fun() { count.set(count.get() + 1); } $}>
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
  pub static fun of(entries: dict[string, Any]): ComponentRegistry;
  pub fun merge(other: ComponentRegistry): ComponentRegistry;
  pub fun get(name: string): Option[Any];
}
```

- `of(entries)` constructs a registry from a dict.
- `merge(other)` merges registries; the right operand takes precedence on collision.
- The `components` descriptor key is valid for both `language=ui` and `language=html` fences.

**Tag resolution rules:**

- Uppercase-initial tags are looked up in the registry by exact string match. Not found → compile-time error.
- Lowercase/hyphenated tags in `html` fences are emitted as literal HTML. In `ui` fences they are a compile-time error (all primitives use PascalCase).
- `html` and `ui` fences without `components` treat all uppercase tags as compile-time errors.

**Component rules:**

- Components are not classes; no lifecycle methods. Setup code runs once at instantiation.
- Signal reads inside fences establish reactive dependencies.
- Async components (`async fun` returning `Task[View]`) are supported.
- When a registered value in a `ComponentRegistry` is not a function returning `View` or `Task[View]`, the compiler emits a compile-time error.

### §19.3 Mounting (Universal)

```
fun mount(component: View, target: MountTarget): MountHandle;

class MountHandle : Any {
  pub fun unmount(): void;
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
  pub static fun all(v: int): Insets;
  pub static fun symmetric(horizontal: int, vertical: int): Insets;
}

struct Color {
  r: int; g: int; b: int; a: int = 255;
  pub static fun hex(value: string): Color;
  pub static let transparent: Color;
}

struct SelectOption[T] { label: string; value: T; }
```

**Rendering contract.** The `ui` fence produces a `View` value. The active rendering backend maps each primitive to its platform representation:

- On `browser`: primitives map to HTML elements with CSS layout (`Row` → `<div style="display:flex;flex-direction:row">`, etc.).
- On `desktop`: primitives map to the implementation-defined rendering backend.

The rendering contract guarantees that `Row`, `Column`, `Stack`, `Text`, `Button`, and `Image` produce visually equivalent results across backends. Platform-specific visual details (native scrollbar chrome, button appearance, font rendering) are left to the backend.

**All `ui` fence directives from §16.2 are supported.** `{% if %}`, `{% for %}`, `{% match %}`, `{% let %}`, `{% try %}`, and `{% suspend %}` all work inside `ui` fences identically to `html` fences.

### §19.7 Web Backend (`system.ui.web`)

*(Available on `browser` and `service` targets.)*

**`html` fence integration.** The `html` fence (§16) continues to work as the web-enrichment path. Components using `html` fences compile only on `browser`/`service` targets.

**`renderToString` (SSR):**

```
namespace system.ui.web;
fun renderToString(component: View): string;
```

`renderToString` renders a component tree to static HTML on `service` targets.

**`hydrate`:**

```
fun hydrate(component: View, selector: string): MountHandle;
```

Attaches event handlers and reactive state to server-rendered HTML on `browser` targets. Hydration reuses existing DOM nodes rather than re-creating them. If server-rendered HTML doesn't match the client component tree, the runtime emits a hydration mismatch warning and falls back to full client-side rendering.

**State serialization format:**

The server serializes component state (signal initial values) as a JSON object embedded in the HTML output:

```html
<script id="__loom_state__" type="application/json">
  {"count": 0, "items": ["a", "b"]}
</script>
```

The `hydrate` function reads this state to initialize signals with server-computed values, ensuring the client component tree matches the server-rendered HTML.

**`mount` (web form):**

```
fun mount(component: View, selector: string): MountHandle;
fun mount(component: View, element: Element): MountHandle;
```

### §19.8 Desktop Backend (`system.ui.desktop`)

*(Available on `desktop` target only.)*

The desktop rendering backend is **implementation-defined**. This specification defines the API contract only. Conforming implementations may use Skia, WebGPU, platform-native widgets, or any other rendering technology, provided they satisfy the primitive rendering contract in §19.6.

**Window management:**

```
namespace system.ui.desktop;

class Window : Any {
  pub var title: string;
  pub var width: int;
  pub var height: int;
  pub var minWidth: int?;
  pub var minHeight: int?;
  pub var resizable: bool = true;
  pub var fullscreen: bool = false;
  pub var visible: bool = true;

  pub fun close(): void;
  pub fun minimize(): void;
  pub fun maximize(): void;
  pub fun focus(): void;
  pub fun setIcon(path: string): void;
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

fun createWindow(cfg: WindowConfig): Window;
```

**Mounting:**

```
fun mount(component: View, window: Window): MountHandle;
```

**Menu and system integration:**

```
class MenuBar : Any { ... }

class Menu : Any {
  pub let title: string;
  pub fun addItem(item: MenuItem): void;
  pub fun addSeparator(): void;
  pub fun addSubmenu(menu: Menu): void;
}

class MenuItem : Any {
  pub let label: string;
  pub var enabled: bool = true;
  pub var checked: bool = false;
  pub var shortcut: string?;
  pub let onclick: fn(): void;
}

fun setMenuBar(window: Window, menuBar: MenuBar): void;

class Tray : Any {
  pub fun setIcon(path: string): void;
  pub fun setTooltip(text: string): void;
  pub fun setMenu(menu: Menu): void;
  pub fun show(): void;
  pub fun hide(): void;
  pub fun destroy(): void;
}
fun createTray(): Tray;
```

**Native dialogs:**

```
struct FileDialogOptions {
  title: string?;
  defaultPath: string?;
  filters: list[FileFilter] = [];
}
struct FileFilter { name: string; extensions: list[string]; }

async fun openFileDialog(options: FileDialogOptions = FileDialogOptions()): Task[Option[string]];
async fun openFilesDialog(options: FileDialogOptions = FileDialogOptions()): Task[list[string]];
async fun saveFileDialog(options: FileDialogOptions = FileDialogOptions()): Task[Option[string]];
async fun openDirectoryDialog(options: FileDialogOptions = FileDialogOptions()): Task[Option[string]];
async fun alertDialog(title: string, message: string): Task[void];
async fun confirmDialog(title: string, message: string): Task[bool];
```

**`runtime.ui` namespace:**

```
interface UiRuntime {
  pub let backend: string;      // "dom" | "desktop" | "headless"
  pub fun rootMount(): MountTarget;
  pub fun screen(): ScreenInfo;
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
// app.loom — shared, uses only system.ui and ui fence
from system.ui import (signal, mount);

fun TodoApp(): View {
  let items = signal(list[string]());
  let input  = signal("");

  return ```(ui)
    <Column spacing={$ 12 $}>
      <Row spacing={$ 8 $}>
        <TextField value={$ input $} placeholder="Add item..." />
        <Button onclick={$ fun() {
          items.update(fun(xs) => xs + [input.get()]);
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

## §20 Runtime Root and Capabilities

*(This section is normative.)*

### §20.1 `runtime` Object

A root-level identifier `runtime` is always available in scope:

```
interface Runtime {
  fun args(): list[string];
  fun env(name: string): Option[string];
  fun capabilities(): list[string];
  fun has(name: string): bool;

  // Capability sub-namespaces (accessed as properties, not method calls)
  let fs: system.fs.Fs;
  let proc: system.proc.Proc;
  let net: system.net.Net;
  let debug: system.debug.DebugRuntime;
  let interop: system.interop.Interop;
  let ui: system.ui.UiRuntime;
}
```

Capability sub-namespaces are properties on `runtime`: `runtime.fs.open(path)`, not `runtime.fs().open(path)`.

If a capability is not available on the current platform target, calling any method on the capability object throws `CapabilityError`.

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
namespace system.debug;

enum TraceEventKind { Call, Return, Line, Exception, Await, Resume, Portal, Signal }

class TraceEvent {
  pub kind: TraceEventKind;
  pub portal: Option[string];
  pub callable: Option[string];
  pub file: string;
  pub line: int;
}

interface TraceHook {
  fun onEvent(ev: TraceEvent): void;
}

class PortalActivation {
  pub name: string;
  pub condition: Option[string];
  pub once: bool;
}

interface DebugRuntime {
  pub fun tracingAvailable(): bool;
  pub fun tracingActive(): bool;
  pub fun setTraceHook(hook: Option[TraceHook]): Option[TraceHook];
  pub fun activatePortal(name: string, condition: Option[string] = None, once: bool = false): void;
  pub fun deactivatePortal(name: string): void;
  pub fun activePortals(): list[PortalActivation];
  pub fun startCaptureServer(cfg: CaptureServerConfig): TraceServerHandle;
  pub fun startMcpServer(cfg: McpServerConfig): TraceServerHandle;
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
  pub callable: string;    // always present from static metadata or system.reflect
  pub execMode: string;    // "interpreted" | "compiled"
  pub traceLevel: TraceLevel;
  pub fun locals(): dict[string, Any];  // populated only when traceLevel == Full
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

The runtime uses the metadata table to populate `TraceEvent.callable` for compiled frames using the same string representation as `system.reflect.callableName` (§21.11). Portal names are therefore consistent whether accessed from interpreted or compiled contexts.

**Boundary crossing semantics.** When execution crosses from interpreted code into a compiled function call:

1. A `Call` trace event fires. `callable` is populated from the compiled module's metadata table.
2. The frame's `execMode` is set to `"compiled"`.
3. `traceLevel` is set based on the compiled module's build mode: `Full` if built with `--debug`; `PortalOnly` if built in release mode with explicit portal blocks; `Opaque` if built in release mode with no portal blocks.
4. Trace events continue appending to the shared ring buffer.

When returning from compiled to interpreted code, a `Return` event fires (callable from metadata table), and subsequent events resume at `traceLevel=Full` in the interpreted context.

**Opaque frames.** When an interpreted caller calls an opaque compiled function, the ring buffer receives a synthetic boundary `Call` event followed by a synthetic `Return` event after completion. The interior is invisible to the time-travel recorder — equivalent to stepping over a native C library in a conventional debugger.

**Reflection integration.** `TraceEvent.callable` is populated via `system.reflect.callableName` (§21.11), which is available in all modes including `@compiled`. This eliminates the dependency on `system.inspect` for trace event population.



---

## §21 Standard Library

*(This section is normative.)*

### §21.1 `system.text`

String utilities. Pure-computation module available on all targets.

```
namespace system.text;

// Splitting and joining
fun split(s: string, sep: string): list[string];
fun splitN(s: string, sep: string, n: int): list[string];
fun join(parts: list[string], sep: string): string;

// Trimming
fun trim(s: string): string;
fun trimStart(s: string): string;
fun trimEnd(s: string): string;
fun trimChars(s: string, chars: string): string;

// Searching
fun startsWith(s: string, prefix: string): bool;
fun endsWith(s: string, suffix: string): bool;
fun contains(s: string, sub: string): bool;
fun indexOf(s: string, sub: string): Option[int];
fun lastIndexOf(s: string, sub: string): Option[int];
fun count(s: string, sub: string): int;

// Transformation
fun replace(s: string, from: string, to: string): string;
fun replaceAll(s: string, from: string, to: string): string;
fun toUpper(s: string): string;
fun toLower(s: string): string;
fun capitalize(s: string): string;
fun padStart(s: string, len: int, ch: string): string;
fun padEnd(s: string, len: int, ch: string): string;
fun repeat(s: string, n: int): string;
fun reverse(s: string): string;

// Parsing
fun parseInt(s: string): Result[int, string];
fun parseInt(s: string, base: int): Result[int, string];
fun parseFloat(s: string): Result[float, string];
fun parseBool(s: string): Result[bool, string];

// Encoding
fun toBytes(s: string): bytes;
fun fromBytes(b: bytes): Result[string, string];
fun toHex(b: bytes): string;
fun fromHex(s: string): Result[bytes, string];
fun toBase64(b: bytes): string;
fun fromBase64(s: string): Result[bytes, string];
```

### §21.2 `system.json`

JSON parsing and serialization. Pure-computation module available on all targets.

```
namespace system.json;

fun parse(s: string): Result[Any, string];
fun stringify(v: Any): string;
fun stringify(v: Any, indent: int): string;

// Typed access helpers
fun getString(v: Any, key: string): Result[string, string];
fun getInt(v: Any, key: string): Result[int, string];
fun getFloat(v: Any, key: string): Result[float, string];
fun getBool(v: Any, key: string): Result[bool, string];
fun getObject(v: Any, key: string): Result[dict[string, Any], string];
fun getArray(v: Any, key: string): Result[list[Any], string];
```

`parse` returns `Any` which may be `string`, `int`, `float`, `bool`, `list[Any]`, `dict[string, Any]`, or `None` (for JSON null).

For any valid JSON string, `parse` then `stringify` then `parse` produces an equivalent value (round-trip property).

```
from system.json import (parse, stringify, getString);

let cfg = parse(readText("config.json"))?;
let host = getString(cfg, "host")?;
let output = stringify(cfg, 2);
```

### §21.3 `system.time`

Time and duration types. Pure-computation module available on all targets (except `sleep` which requires async context).

```
namespace system.time;

class Instant : Any {
  pub static fun now(): Instant;
  pub static fun fromMillis(ms: int): Instant;
  pub static fun fromIso(s: string): Result[Instant, string];
  pub fun toMillis(): int;
  pub fun toIso(): string;
  pub fun plus(d: Duration): Instant;
  pub fun minus(d: Duration): Instant;
  pub fun durationSince(earlier: Instant): Duration;
  pub fun isBefore(other: Instant): bool;
  pub fun isAfter(other: Instant): bool;
}

class Duration : Any {
  pub millis: int;
  pub static fun ofMillis(ms: int): Duration;
  pub static fun ofSeconds(s: int): Duration;
  pub static fun ofMinutes(m: int): Duration;
  pub static fun ofHours(h: int): Duration;
  pub fun plus(other: Duration): Duration;
  pub fun minus(other: Duration): Duration;
  pub fun toMillis(): int;
  pub fun toSeconds(): float;
}

fun sleep(d: Duration): Task[void];
```

For any `Instant` values `a` and `b` where `a.isBefore(b)`, `a.durationSince(b)` produces a non-positive duration and `b.durationSince(a)` produces a non-negative duration.

```
from system.time import (Instant, Duration, sleep);

let start = Instant.now();
await sleep(Duration.ofMillis(500));
let elapsed = Instant.now().durationSince(start);
log("took {$ elapsed.toMillis() $}ms");
```

### §21.4 `system.collections`

Higher-order collection utilities. Pure-computation module available on all targets. All functions are pure and do not mutate their inputs.

```
namespace system.collections;

// Transformation
fun map[T, R](xs: list[T], fn: fn(T): R): list[R];
fun flatMap[T, R](xs: list[T], fn: fn(T): list[R]): list[R];
fun filter[T](xs: list[T], fn: fn(T): bool): list[T];
fun filterMap[T, R](xs: list[T], fn: fn(T): Option[R]): list[R];
fun reduce[T, R](xs: list[T], init: R, fn: fn(R, T): R): R;

// Search
fun find[T](xs: list[T], fn: fn(T): bool): Option[T];
fun findIndex[T](xs: list[T], fn: fn(T): bool): Option[int];
fun any[T](xs: list[T], fn: fn(T): bool): bool;
fun all[T](xs: list[T], fn: fn(T): bool): bool;
fun none[T](xs: list[T], fn: fn(T): bool): bool;

// Ordering
fun sortBy[T, K](xs: list[T], key: fn(T): K): list[T];
fun sortByDesc[T, K](xs: list[T], key: fn(T): K): list[T];
fun reverse[T](xs: list[T]): list[T];

// Grouping
fun groupBy[T, K](xs: list[T], key: fn(T): K): dict[K, list[T]];
fun partition[T](xs: list[T], fn: fn(T): bool): tuple[list[T], list[T]];
fun zip[A, B](as: list[A], bs: list[B]): list[tuple[A, B]];
fun unzip[A, B](pairs: list[tuple[A, B]]): tuple[list[A], list[B]];

// Set operations on lists
fun unique[T](xs: list[T]): list[T];
fun uniqueBy[T, K](xs: list[T], key: fn(T): K): list[T];
fun flatten[T](xs: list[list[T]]): list[T];
fun chunk[T](xs: list[T], size: int): list[list[T]];

// Generation
fun range(end: int): list[int];
fun range(start: int, end: int): list[int];
fun range(start: int, end: int, step: int): list[int];
fun repeat[T](value: T, n: int): list[T];
fun tabulate[T](n: int, fn: fn(int): T): list[T];

// Aggregation
fun sum(xs: list[int]): int;
fun sumFloat(xs: list[float]): float;
fun min[T](xs: list[T]): Option[T];
fun max[T](xs: list[T]): Option[T];
fun minBy[T, K](xs: list[T], key: fn(T): K): Option[T];
fun maxBy[T, K](xs: list[T], key: fn(T): K): Option[T];
fun countWhere[T](xs: list[T], fn: fn(T): bool): int;

// Dict utilities
fun mapValues[K, V, R](d: dict[K, V], fn: fn(V): R): dict[K, R];
fun filterKeys[K, V](d: dict[K, V], fn: fn(K): bool): dict[K, V];
fun mergeWith[K, V](a: dict[K, V], b: dict[K, V], fn: fn(V, V): V): dict[K, V];
fun fromEntries[K, V](pairs: list[tuple[K, V]]): dict[K, V];
fun toEntries[K, V](d: dict[K, V]): list[tuple[K, V]];
```

### §21.5 `system.regex`

Regular expression module. Pure-computation module available on all targets.

```
namespace system.regex;

class Regex : Any {
  pub static fun compile(pattern: string): Result[Regex, string];
  pub fun isMatch(s: string): bool;
  pub fun findFirst(s: string): Option[Match];
  pub fun findAll(s: string): list[Match];
  pub fun replace(s: string, replacement: string): string;
}

class Match : Any {
  pub value: string;
  pub start: int;
  pub end: int;
  pub fun group(index: int): Option[string];
  pub fun group(name: string): Option[string];
}
```

For any compiled `Regex` and input string `s`, `regex.isMatch(s)` returns `true` if and only if `regex.findFirst(s)` returns `Some(match)`.

### §21.6 `system.env`

Environment and configuration module. Available on all targets.

```
namespace system.env;

fun loadDotenv(path: string): void;
fun get(key: string): Option[string];
fun getOrDefault(key: string, default: string): string;
fun platform(): string;   // "browser", "cli", or "service"
fun validate(schema: dict[string, Any], config: dict[string, Any]): Result[dict[string, Any], string];
```

### §21.7 `system.fs`

Filesystem API. Capability-gated; available on `cli` and `service` targets only.

```
namespace system.fs;

enum SeekFrom { Start, Current, End }

class DirEntry : Any {
  pub name: string;
  pub path: string;
  pub isFile: bool;
  pub isDir: bool;
  pub size: int;
}

class FileStat : Any {
  pub size: int;
  pub isFile: bool;
  pub isDir: bool;
  pub modified: system.time.Instant;
  pub created: Option[system.time.Instant];
}

class FileHandle : Any implements Readable, Writable, Closeable, Scoped[FileHandle] {
  // Incremental I/O
  pub fun read(n: int): bytes;
  pub fun readAll(): bytes;
  pub fun readLine(): Option[string];
  pub fun write(data: bytes): int;
  pub fun writeText(text: string): int;
  pub fun seek(offset: int, from: SeekFrom): int;
  pub fun tell(): int;
  pub fun flush(): void;
  pub fun close(): void;

  // Async variants
  pub fun readAsync(n: int): Task[bytes];
  pub fun readAllAsync(): Task[bytes];
  pub fun readLineAsync(): Task[Option[string]];
  pub fun writeAsync(data: bytes): Task[int];
  pub fun flushAsync(): Task[void];
}

class Fs : Any {
  // File open/close
  pub fun open(path: string, mode: string = "r"): FileHandle;
  pub fun openAsync(path: string, mode: string = "r"): Task[FileHandle];

  // Whole-file convenience methods
  pub fun read(path: string): bytes;
  pub fun readText(path: string): string;
  pub fun write(path: string, data: bytes): void;
  pub fun writeText(path: string, text: string): void;
  pub fun append(path: string, data: bytes): void;

  // Async whole-file methods
  pub fun readAsync(path: string): Task[bytes];
  pub fun readTextAsync(path: string): Task[string];
  pub fun writeAsync(path: string, data: bytes): Task[void];
  pub fun writeTextAsync(path: string, text: string): Task[void];

  // Streaming line-by-line reading
  pub fun lines(path: string): Iterable[string];
  pub fun linesAsync(path: string): AsyncIterable[string];

  // Directory operations
  pub fun mkdir(path: string): void;
  pub fun mkdirAll(path: string): void;
  pub fun readDir(path: string): list[DirEntry];
  pub fun readDirAsync(path: string): Task[list[DirEntry]];

  // Path and metadata operations
  pub fun exists(path: string): bool;
  pub fun stat(path: string): FileStat;
  pub fun remove(path: string): void;
  pub fun removeDir(path: string): void;
  pub fun removeDirAll(path: string): void;
  pub fun rename(from: string, to: string): void;
  pub fun copy(from: string, to: string): void;
  pub fun copyAsync(from: string, to: string): Task[void];

  // Path manipulation utilities
  pub fun join(parts: list[string]): string;
  pub fun dirname(path: string): string;
  pub fun basename(path: string): string;
  pub fun extension(path: string): Option[string];
  pub fun resolve(path: string): string;
  pub fun isAbsolute(path: string): bool;

  // Temporary file/directory creation
  pub fun tempFile(prefix: string): FileHandle;
  pub fun tempDir(prefix: string): string;
}
```

`FileHandle` implements `Readable`, `Writable`, and `Closeable`; it is intended for use with `with` blocks or `defer` for deterministic cleanup. The `mode` parameter accepts `"r"`, `"w"`, `"a"`, `"rw"`, etc.

For any byte sequence `data` and file path, `runtime.fs.write(path, data)` followed by `runtime.fs.read(path)` returns `data`.

### §21.8 `system.proc`

Process execution API. Capability-gated; available on `cli` and `service` targets only.

```
namespace system.proc;

class ProcOptions : Any {
  pub cwd: Option[string];
  pub env: Option[dict[string, string]];
  pub stdin: Option[bytes];
  pub timeout: Option[int];
}

class ProcResult : Any {
  pub exitCode: int;
  pub stdout: bytes;
  pub stderr: bytes;
  pub success: bool;   // true if exitCode == 0
}

class ChildProcess : Any implements Closeable {
  pub stdin: Option[Writable];
  pub stdout: AsyncIterable[bytes];
  pub stderr: AsyncIterable[bytes];
  pub pid: int;
  pub fun wait(): Task[ProcResult];
  pub fun kill(): void;
  pub fun close(): void;
}

class Proc : Any {
  // Synchronous execution
  pub fun run(argv: list[string]): ProcResult;
  pub fun run(argv: list[string], opts: ProcOptions): ProcResult;

  // Async execution
  pub fun runAsync(argv: list[string]): Task[ProcResult];
  pub fun runAsync(argv: list[string], opts: ProcOptions): Task[ProcResult];

  // Streaming process I/O
  pub fun spawn(argv: list[string]): ChildProcess;
  pub fun spawn(argv: list[string], opts: ProcOptions): ChildProcess;

  // Environment and process info
  pub fun pid(): int;
  pub fun exit(code: int): void;
}
```

`ProcOptions` allows specifying a working directory, environment variables (merged with or replacing inherited env), data to pipe to stdin, and a timeout in milliseconds (throws `TimeoutError` if exceeded).

`runtime.proc.exit(code)` exits the process after running `defer` actions in the current scope.

### §21.9 `system.net`

Networking API. Capability-gated; available on `cli` and `service` targets only. Browser networking uses `system.interop.fetch`.

All socket and HTTP operations are async-first — synchronous wrappers are not provided for networking because blocking the single-threaded runtime on network I/O would stall all tasks.

```
namespace system.net;

class SocketAddr : Any {
  pub host: string;
  pub port: int;
}

class TcpStream : Any implements Readable, Writable, Closeable {
  pub localAddr: SocketAddr;
  pub remoteAddr: SocketAddr;
  pub fun read(n: int): Task[bytes];
  pub fun readAll(): Task[bytes];
  pub fun readLine(): Task[Option[string]];
  pub fun write(data: bytes): Task[int];
  pub fun writeText(text: string): Task[int];
  pub fun flush(): Task[void];
  pub fun close(): void;
}

class TcpListener : Any implements Closeable {
  pub localAddr: SocketAddr;
  pub fun accept(): Task[TcpStream];
  pub fun acceptAll(): AsyncIterable[TcpStream];
  pub fun close(): void;
}

class UdpSocket : Any implements Closeable {
  pub localAddr: SocketAddr;
  pub fun send(data: bytes, addr: SocketAddr): Task[int];
  pub fun recv(maxBytes: int): Task[tuple[bytes, SocketAddr]];
  pub fun close(): void;
}

class HttpRequest : Any {
  pub url: string;
  pub method: string;
  pub headers: dict[string, string];
  pub body: Option[bytes];
  pub timeout: Option[int];
}

class HttpResponse : Any {
  pub status: int;
  pub ok: bool;   // true if 200 <= status < 300
  pub headers: dict[string, string];
  pub fun body(): Task[bytes];
  pub fun text(): Task[string];
  pub fun json(): Task[Any];
}

class Net : Any {
  // TCP client
  pub fun connect(host: string, port: int): Task[TcpStream];
  pub fun connectTls(host: string, port: int): Task[TcpStream];

  // TCP server
  pub fun listen(host: string, port: int): Task[TcpListener];

  // UDP
  pub fun bindUdp(host: string, port: int): Task[UdpSocket];

  // HTTP client
  pub fun get(url: string): Task[HttpResponse];
  pub fun post(url: string, body: bytes): Task[HttpResponse];
  pub fun request(req: HttpRequest): Task[HttpResponse];

  // DNS
  pub fun resolve(hostname: string): Task[list[string]];
}
```

`TcpStream`, `TcpListener`, and `UdpSocket` implement `Closeable` and are intended for use with `with` blocks or `defer` for deterministic resource cleanup.

### §21.10 Set Operations

Methods on `set[T]`:

```
// On set[T]:
fun add(value: T): set[T];
fun remove(value: T): set[T];
fun contains(value: T): bool;
fun union(other: set[T]): set[T];
fun intersection(other: set[T]): set[T];
fun difference(other: set[T]): set[T];
fun symmetricDifference(other: set[T]): set[T];
fun isSubset(other: set[T]): bool;
fun isSuperset(other: set[T]): bool;
fun isDisjoint(other: set[T]): bool;
```

All set operations return new sets — `set[T]` is immutable. Use `var` bindings to accumulate changes.

`set[T]` requires `T` to be a hashable, equality-comparable type. Primitives and enums are hashable by default. Classes must implement `Hashable`.

**Set algebra laws.** For any sets `A` and `B`:
- `A.union(B)` equals `B.union(A)` (commutativity).
- `A.intersection(B)` is a subset of both `A` and `B`.
- `A.difference(B).union(A.intersection(B))` equals `A`.

### §21.11 `system.reflect`

**Universal structural reflection module — available on all targets including `@compiled` mode.**

`system.reflect` provides read-only, structural introspection. In `@compiled` mode, all operations resolve from the static metadata table baked into the binary at compile time. In scripted mode, they resolve from the live runtime type registry. The API is identical in both modes.

```
namespace system.reflect;

// Type queries
fun typeOf[T](): Type;               // compile-time type reference (no value required)
fun typeOf(x: Any): Type;            // runtime type of a boxed value
fun is(x: Any, T: Type): bool;       // isinstance check (sugar: instanceof operator)
fun callableName(f: fn): string;     // "module.Class.method" — for portals and traces

// Structural introspection
fun fields(T: Type): list[FieldInfo];
fun methods(T: Type): list[MethodInfo];
fun constructors(T: Type): list[MethodInfo];
fun annotations(T: Type): dict[string, Any];
fun variants(T: Type): list[VariantInfo];

// Type metadata
class Type {
  pub name: string;
  pub kind: string;    // "class" | "enum" | "struct" | "interface" | "primitive" | "function"
  pub module: string;  // declaring module's fully-qualified name
  pub fun params(): list[Type];
  pub fun super(): Option[Type];
  pub fun interfaces(): list[Type];
  pub fun variants(): list[VariantInfo];
}

class FieldInfo {
  pub name: string;
  pub fieldType: Type;
  pub isMutable: bool;
  pub isPublic: bool;
  pub isWeak: bool;      // true if declared with `weak` (v0.6)
  pub isUnowned: bool;   // true if declared with `unowned` (v0.6)
}

class MethodInfo {
  pub name: string;
  pub qualifiedName: string;   // "module.Class.method" — same as callableName result
  pub fun paramTypes(): list[Type];
  pub returnType: Type;
  pub isAsync: bool;
  pub isStatic: bool;
  pub isOperator: bool;        // true if declared with `operator fun` (v0.6)
}

class VariantInfo {
  pub name: string;
  pub fun fields(): list[FieldInfo];
}
```

**In `@compiled` mode**, `system.reflect` resolves from the static metadata table baked into the binary at compile time. The runtime type registry is not consulted. `typeOf(x)` on a value in an `Option[Any]` boundary position resolves from the tagged representation. `callableName(f)` returns the fully-qualified name from the symbol table.

**Relationship to `typeof`/`instanceof`.** The `typeof` and `instanceof` operators (§4.7) are surface sugar over `system.reflect.typeOf` and `system.reflect.is` respectively. Both remain available in `@compiled` mode via static metadata resolution.

**Enum reflection.** `typeOf` on an enum value returns a `Type` with `kind == "enum"`. `variants()` returns `VariantInfo` entries with `name` and `fields` for each variant. See §9.2 for enum/`Any` boundary rules.

**Annotation reflection.** `annotations(T)` returns decorator metadata attached to a type or its members. See §8.8 for annotation declaration syntax.

**`callableName`.** Returns the fully-qualified portal name for any callable value: `"myapp.geometry.Vec2.add"`. Used by the portal registry and trace system to populate `TraceEvent.callable` in both scripted and compiled frames.

### §21.12 `system.inspect`

**Dynamic inspection module — interpreted mode only. Using `system.inspect` in a `@compiled` file is a compile-time error.**

`system.inspect` provides dynamic construction, invocation, and field access on live `Any`-typed values. These operations require the live runtime type registry and heap.

```
namespace system.inspect;

// Dynamic construction
fun new(T: Type, *args: list[Any]): Any;

// Dynamic field access (requires Any-typed receiver)
fun get(obj: Any, field: string): Any;
fun getAs(obj: Any, field: string, T: Type): T;
fun set(obj: Any, field: string, value: Any): void;

// Dynamic invocation
fun invoke(obj: Any, method: string, *args: list[Any]): Any;
fun invokeAs(obj: Any, method: string, T: Type, *args: list[Any]): T;

// Safe dynamic cast
fun as(x: Any, T: Type): Option[T];
```

**Boundary coercions.** Primitive arguments passed to `system.inspect` functions are auto-boxed at the API boundary. Typed helpers (`getAs`, `invokeAs`, `as`) auto-unbox primitive results when the target type is a primitive.

**Migration note.** In v0.5, `system.reflect` contained both structural introspection and dynamic operations. In v0.6, the structural operations remain in `system.reflect` (now universal); the dynamic operations move to `system.inspect` (interpreted only). Update `from system.reflect import (new, invoke, get, set, ...)` to `from system.inspect import (...)`.

### Standard Library Module Taxonomy

| Module | Capability-Gated | Available Targets | Compiled Mode |
|---|---|---|---|
| `system.text` | No | All | Yes |
| `system.json` | No | All | Yes |
| `system.time` | No (except `sleep`) | All | Yes |
| `system.collections` | No | All | Yes |
| `system.regex` | No | All | Yes |
| `system.env` | No | All | Yes |
| `system.template` | No | All | Yes |
| `system.reflect` | No | All | **Yes** (v0.6) |
| `system.inspect` | No | All (not `@compiled`) | **No** (v0.6, new) |
| `system.fs` | Yes | cli, service, desktop, native | Yes |
| `system.proc` | Yes | cli, service, desktop, native | Yes |
| `system.net` | Yes | cli, service, desktop, native | Yes |
| `system.interop` | Yes | browser, service | No |
| `system.ui` | Yes | All | No |
| `system.ui.web` | Yes | browser, service | No |
| `system.ui.desktop` | Yes | desktop | No |
| `system.debug` | Yes | All (when enabled) | Yes |



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

fun distance(a: Point, b: Point): float {
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
| `system.inspect` usage | Requires live runtime registry (use `system.reflect` for structural queries) |
| Top-level control flow (`if`, `while`, `for`, `match`, expression statements) | No sequential top-level execution |
| `extern js` and `@jsexport` | No JavaScript interop in compiled mode |
| Non-constant top-level initializers | All top-level data must be statically determinable |
| `unowned` outside `--target native` | Meaningful only under ARC; no-op under GC |
| `[weak ...] ` capture lists outside `--target native` | Meaningful only under ARC |
| Explicit augmented assignment `operator fun` on structs | Value-type semantics incompatible with in-place mutation |

**Newly permitted in `@compiled` mode (v0.6):**

- `system.reflect` — structural introspection from static metadata (§21.11).
- `portal` blocks — registered with shared activation registry at module load.
- `weak` field qualifier — maps to ARC zeroing weak pointer (native) or GC weak reference (Wasm).
- `operator fun` method modifier — desugars to named method slots at compile time.
- `box` keyword expression — explicit widening at `Option[Any]` boundary positions.
- `as` and `as?` cast operators — narrowing at `Option[Any]` boundary positions.

The `if (__name__ == "__main__")` guard pattern is prohibited in `@compiled` files — not because `__name__` is unavailable, but because top-level branching is prohibited (see above). `__name__` and `__file__` remain available as compile-time string constants for use inside function bodies (e.g., logging, error messages).

Only declarations are permitted at file top level in `@compiled` files: `class`, `enum`, `struct`, `interface`, `fun`, `let`, `var`, `type`, and `import`.

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
- **Compile-time type resolution.** All type declarations in `@compiled` files are resolved entirely at compile time. There is no runtime type registry for compiled types. `system.reflect.typeOf` on a compiled-mode type returns a `Type` value with static metadata baked in at compile time.
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

**`unowned` reference runtime semantics (native ARC).** An `unowned` field does not increment `strong_count` and is not tracked in the side table. Accessing an `unowned` field after the referent has been freed:
- In debug builds (`--debug`): traps with a `LifetimeError` and a diagnostic message.
- In release builds: undefined behaviour (typically an access violation at the point of use).

Use `unowned` only when the lifetime relationship is provably correct — the referent must outlive the `unowned` holder.

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
# loom.pkg
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
// mymodule.h — generated by loom export-headers v0.6
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
| `int` | `int64_t` | |
| `float` | `double` | |
| `bool` | `bool` | |
| `string` | `LoomString*` | Caller frees via `loom_string_free` |
| `bytes` | `LoomBytes*` | Caller frees via `loom_bytes_free` |
| `struct T` | `LoomT` | By value for small structs |
| `class T` | `LoomT*` (opaque) | Caller manages via `loom_T_retain`/`loom_T_release` |
| `Option[T]` (primitive) | `T` with sentinel or bool out-param | Configurable via `@cexport` |
| `void` | `void` | |

**`@cexport` annotation** provides fine-grained control over the generated C signature:

```
@cexport(name="get_user_name", nullable=true)
pub fun getUserName(id: string): string? { ... }
```

#### §23.7.2 `loom import-headers` — C → Loom

Generates Loom `extern native` declarations from a C header file, eliminating hand-written FFI bindings:

```
loom import-headers --lib sqlite3 /usr/include/sqlite3.h -o sqlite3.loom
```

**Generated binding format:**

```loom
// sqlite3.loom — generated by loom import-headers v0.6
// DO NOT EDIT

@compiled

extern native "libsqlite3" fun sqlite3_open(filename: string, ppDb: NativeHandle): int;
extern native "libsqlite3" fun sqlite3_close(db: NativeHandle): int;
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

### §23.8 Build Pipeline and `loom.pkg` for Native

**Manifest additions:**

```
# loom.pkg
stable_abi   true
abi_version  1

[target.native]
include system.fs
include system.proc
include system.net
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
- All types must be statically known. `Any` as a declared type, `dynamic class`, and `system.inspect` are prohibited.
- `extern js` and `@jsexport` are prohibited.
- ARC is mandatory; there is no GC option for `--target native`.

## §24 Macros and Metaprogramming

*(This section is normative.)*

Loom provides a hygienic macro system for compile-time code generation:

**Hygiene.** Macro-introduced bindings do not capture or shadow caller bindings. The macro's internal names are in a separate scope from the caller's names.

**Expansion timing.** Macros are expanded at compile time before type-checking. Macro output must be well-typed; ill-typed macro output is a compile-time error.

**Typed quasiquotes.** Macros use typed quasiquote syntax for constructing and deconstructing AST fragments:

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

**Rules:**

- Macros are declared with `macro name(params) { ... }` syntax.
- Macros are invoked with `name!(args)` syntax (the `!` distinguishes macro invocations from function calls).
- Macros are a separate compilation phase and cannot perform I/O or runtime operations.
- Macro definitions are scoped to the module where they are declared and can be exported with `pub`.

---

## §25 Failure Policy

*(This section is normative.)*

This section consolidates all failure behaviors across the Loom language.

### §25.1 Error Hierarchy

All error types extend a base `Error` class:

```
class Error : Any {
  pub let message: string;
  pub let cause: Option[Any];
  pub let stackTrace: list[StackFrame];
}

class StackFrame : Any {
  pub file: string;
  pub line: int;
  pub column: int;
  pub function: Option[string];
}
```

**Built-in error types:**

```
Any
├── Error (base)
│   ├── TypeError
│   ├── MatchError
│   ├── CapabilityError
│   ├── FfiTypeError
│   ├── LifetimeError
│   ├── TimeoutError
│   ├── CancellationError
│   ├── DestructureError
│   ├── IndexError
│   ├── KeyError
│   ├── IoError
│   └── User-defined errors
```

All error types carry `message: string`, `cause: Option[Any]`, and `stackTrace: list[StackFrame]`.

### §25.2 User-Defined Errors

User-defined error types MUST extend `Error` (directly or transitively). Any class that extends `Error` is a valid error type and can be thrown and caught:

```
class AppError : Error {
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

Throwing a value that does not extend `Error` is a compile-time error.

### §25.3 Error Categories

**Compile-time errors (uncatchable):**
- Parse/lex errors
- Type errors (static)
- Alignment violations (`E_MLS_ALIGN`)
- Component resolution errors
- Exhaustiveness failures
- Compiled-mode restriction violations
- Unknown label references
- Invalid destructuring patterns

**Runtime errors (catchable via `try`/`catch`):**
- `TypeError` — dynamic type mismatch (e.g., non-`bool` condition)
- `MatchError` — no matching arm in `match` over `Any`
- `CapabilityError` — accessing unavailable capability
- `FfiTypeError` — FFI argument marshalling failure
- `LifetimeError` — spawned task escaping `await group` scope
- `TimeoutError` — `TaskGroup.withTimeout` exceeded
- `CancellationError` — task cancelled in structured concurrency
- `DestructureError` — destructuring pattern mismatch at runtime
- `IndexError` — out-of-range index access
- `KeyError` — missing dict key
- `IoError` — filesystem, network, or process errors

**Result-based errors (propagated via `?`):**
- Typed, recoverable errors using `Result[T, E]`.
- The `?` operator converts between error types via `From[E]`.

### §25.4 Error Propagation Rules

- Exceptions propagate up the call stack through `try`/`catch`/`finally` and `defer` blocks.
- `finally` always executes; if `finally` throws, its exception replaces the pending exception with the original attached as `cause`.
- `return`, `break`, `continue` inside `finally` are compile-time errors.
- `defer` actions run before `catch` handlers (as part of scope exit).
- In structured concurrency, a failing child cancels siblings; `CancellationError` propagates to the group scope.
- Exception chaining via `cause` preserves the full error context.
- The runtime's default error reporting prints the full cause chain.

### §25.5 Catch Pattern Matching

The `catch` clause supports union type patterns to catch multiple error types in a single handler:

```
try {
  riskyOperation();
} catch (TypeError | MatchError as err) {
  // err is typed as TypeError | MatchError
  print("Logic error: {$ err.message $}");
} catch (IoError as err) {
  // err is typed as IoError
  print("I/O error: {$ err.message $}");
} catch (Error as err) {
  // catches any remaining Error subtype
  print("Unexpected: {$ err.message $}");
}
```

Catch clauses are evaluated top-to-bottom. The first clause whose type pattern matches the thrown error's runtime type (via `instanceof`) handles the exception. A `catch (Error as err)` clause catches all errors since every error extends `Error`.

Catching a parent type also catches all its subtypes. For example, `catch (AppError as err)` catches `NotFoundError` if `NotFoundError` extends `AppError`.

### §25.6 Template Errors

- Hard fail by default for evaluation and formatting errors.
- Buffered `try`/`catch` in template fences.
- `render`/`renderWith` fail if evaluation reaches `await`.
- Parse/lex errors and alignment violations are uncatchable.

### §25.7 Task Failures

- A task that fails and is never awaited becomes an unhandled task failure reported by the runtime.
- `await` on a failed task rethrows the failure.
- In `await group`, a failing child cancels all siblings.

### §25.8 FFI Errors

- Outbound: type mismatches at `extern js`/`extern native` boundaries produce `FfiTypeError`.
- Inbound: unmarshalable JS arguments to `@jsexport` functions produce `FfiTypeError`.
- `@jsexport async fun` failures cause the returned Promise to reject.



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
BlockComment   ::= "/*" { ANY_CHAR } "*/"
DocComment     ::= "///" { ANY_CHAR - "\n" } "\n"

(* Identifiers *)
Identifier     ::= IdentStart { IdentContinue }
IdentStart     ::= UNICODE_LETTER | "_"
IdentContinue  ::= UNICODE_LETTER | UNICODE_DIGIT | "_"
UpperIdent     ::= UPPER_LETTER { IdentContinue }
LowerIdent     ::= ( LOWER_LETTER | "_" ) { IdentContinue }

(* Integer literals *)
IntLiteral     ::= DecimalLit | HexLit | BinaryLit | OctalLit
DecimalLit     ::= DIGIT { DIGIT | "_" }
HexLit         ::= "0" ( "x" | "X" ) HEX_DIGIT { HEX_DIGIT | "_" }
BinaryLit      ::= "0" ( "b" | "B" ) BIN_DIGIT { BIN_DIGIT | "_" }
OctalLit       ::= "0" ( "o" | "O" ) OCT_DIGIT { OCT_DIGIT | "_" }

(* Float literals *)
FloatLiteral   ::= DIGIT { DIGIT } "." DIGIT { DIGIT } [ Exponent ]
                 | DIGIT { DIGIT } Exponent
Exponent       ::= ( "e" | "E" ) [ "+" | "-" ] DIGIT { DIGIT }

(* String literals *)
StringLiteral  ::= DoubleString | SingleString | RawDoubleString | RawSingleString
DoubleString   ::= '"' { StringChar | EscapeSeq | InlineExpr } '"'
SingleString   ::= "'" { StringChar | EscapeSeq | InlineExpr } "'"
RawDoubleString ::= "r" '"' { ANY_CHAR - '"' } '"'
RawSingleString ::= "r" "'" { ANY_CHAR - "'" } "'"

StringChar     ::= ANY_CHAR - ( '"' | "'" | "\\" | "{$" )
EscapeSeq      ::= "\\" ( "\\" | "'" | '"' | "n" | "r" | "t" | "0"
                         | "u" HEX4 | "u{" HEX1_6 "}" | "x" HEX2 )
HEX4           ::= HEX_DIGIT HEX_DIGIT HEX_DIGIT HEX_DIGIT
HEX2           ::= HEX_DIGIT HEX_DIGIT
HEX1_6         ::= HEX_DIGIT { HEX_DIGIT }   (* 1 to 6 hex digits *)

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

(* Template fence *)
TemplateFence  ::= ANCHOR "```" "(" TmplDescriptor ")" NEWLINE
                   { TmplContentLine }
                   ANCHOR "```" [ NEWLINE ]
TmplDescriptor ::= Language [ ":" "(" TmplSpec ")" ]
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

Declaration    ::= FunDecl
                 | AsyncFunDecl
                 | GenFunDecl
                 | AsyncGenFunDecl
                 | ClassDecl
                 | EnumDecl
                 | InterfaceDecl
                 | StructDecl
                 | TypeAliasDecl ";"
                 | AnnotatedDecl
```

### §26.3 Syntactic Grammar — Imports and Exports

```ebnf
ImportStmt     ::= "from" ModulePath "import" "(" ImportList ")"
                 | "from" ModulePath "{" GroupedImportList "}"

ReExportStmt   ::= "pub" "from" ModulePath "import" "(" ImportList ")"
                 | "pub" "from" ModulePath "{" GroupedImportList "}"

ModulePath     ::= RelativePath | AbsolutePath
RelativePath   ::= "." [ "." ] [ "|" ".." ] [ "." Identifier { "." Identifier } ]
AbsolutePath   ::= Identifier { "." Identifier }

ImportList     ::= ImportItem { "," ImportItem } [ "," ]
ImportItem     ::= Identifier [ "as" Identifier ]

GroupedImportList ::= GroupedImport { ";" GroupedImport } [ ";" ]
GroupedImport  ::= Identifier { "." Identifier } "import" "(" ImportList ")"
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
                 | FunDecl
                 | AsyncFunDecl
                 | GenFunDecl
                 | AsyncGenFunDecl
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
PortalStmt     ::= "portal" ( Identifier | StringLiteral ) Block
AwaitGroupStmt ::= "await" "group" Block

Label          ::= Identifier
Block          ::= "{" { Stmt } "}"
```

### §26.5 Syntactic Grammar — Expressions

```ebnf
Expr           ::= TernaryExpr | AssignExpr | SpreadExpr

TernaryExpr    ::= LogicalOrExpr "?" Expr ":" Expr
AssignExpr     ::= LogicalOrExpr AssignOp Expr

LogicalOrExpr  ::= LogicalAndExpr { ( "or" | "||" ) LogicalAndExpr }
LogicalAndExpr ::= NullCoalExpr { ( "and" | "&&" ) NullCoalExpr }
NullCoalExpr   ::= EqualityExpr { "??" EqualityExpr }
EqualityExpr   ::= CompareExpr { ( "==" | "!=" ) CompareExpr }
CompareExpr    ::= TypeCheckExpr { ( "<" | ">" | "<=" | ">=" ) TypeCheckExpr }
TypeCheckExpr  ::= MembershipExpr [ ( "is" | "instanceof" ) Type ]
MembershipExpr ::= AdditiveExpr [ ( "in" | "not" "in" ) AdditiveExpr ]
AdditiveExpr   ::= MultiplicativeExpr { ( "+" | "-" ) MultiplicativeExpr }
MultiplicativeExpr ::= ExponentExpr { ( "*" | "/" | "%" ) ExponentExpr }
ExponentExpr   ::= UnaryExpr [ "**" ExponentExpr ]
UnaryExpr      ::= ( "-" | "not" | "!" | "typeof" ) UnaryExpr | PostfixExpr
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

(* Lambda expressions *)
LambdaExpr     ::= "fun" "(" [ ParamList ] ")" "=>" Expr
                 | "fun" "(" [ ParamList ] ")" Block
AsyncLambdaExpr ::= "async" "fun" "(" [ ParamList ] ")" "=>" Expr
                  | "async" "fun" "(" [ ParamList ] ")" Block

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
```

### §26.8 Syntactic Grammar — Declarations

```ebnf
FunDecl        ::= { Annotation } "fun" Identifier [ TypeParams ] "(" [ ParamList ] ")" [ ":" Type ] Block
AsyncFunDecl   ::= { Annotation } "async" "fun" Identifier [ TypeParams ] "(" [ ParamList ] ")" [ ":" Type ] Block
GenFunDecl     ::= { Annotation } "gen" "fun" Identifier [ TypeParams ] "(" [ ParamList ] ")" [ ":" Type ] Block
AsyncGenFunDecl ::= { Annotation } "async" "gen" "fun" Identifier [ TypeParams ] "(" [ ParamList ] ")" [ ":" Type ] Block

ParamList      ::= Param { "," Param } [ "," "*" [ Identifier ":" Type ] ] [ "," ParamList_KW ] [ "," "**" Identifier ":" Type ]
                 | "*" [ "," ParamList_KW ]
ParamList_KW   ::= Param { "," Param }
Param          ::= Identifier ":" Type [ "=" Expr ]

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

FieldDecl      ::= [ "pub" ] ( "let" | "var" ) Identifier ":" Type [ "=" Expr ]
ConstructorDecl ::= "new" "(" [ ParamList ] ")" Block
MethodDecl     ::= { Annotation } [ "pub" ] [ "abstract" ] [ "async" ] [ "gen" ] "fun" Identifier [ TypeParams ] "(" [ ParamList ] ")" [ ":" Type ] ( Block | ";" )
StaticMethodDecl ::= { Annotation } [ "pub" ] "static" [ "async" ] "fun" Identifier [ TypeParams ] "(" [ ParamList ] ")" [ ":" Type ] Block
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
InterfaceMember ::= [ "pub" ] [ "static" ] [ "async" ] [ "gen" ] "fun" Identifier [ TypeParams ] "(" [ ParamList ] ")" [ ":" Type ] ";"
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
ExternJsFun    ::= "extern" "js" "fun" Identifier "(" [ ParamList ] ")" ":" Type ";"
ExternJsVal    ::= "extern" "js" "val" Identifier ":" Type ";"
ExternNative   ::= "extern" "native" StringLiteral "fun" Identifier "(" [ ParamList ] ")" ":" Type ";"
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
MacroBody      ::= "quote" Block
MacroInvoke    ::= Identifier "!" "(" [ ArgList ] ")"
```

For any valid Loom source text, parsing it into an AST and then pretty-printing that AST back to source text and parsing again SHALL produce an equivalent AST (round-trip property).

### §26.12 Syntactic Grammar — v0.6 Amendments

#### Cast Operators (new)

```ebnf
CastExpr       ::= PostfixExpr "as" Type
                 | PostfixExpr "as?" Type
```

`as?` is the two-token sequence `"as" "?"`. The parser resolves the ambiguity with the postfix `?` (result propagation) by context: `as?` must be immediately followed by a type expression.

#### Box Operator (new)

```ebnf
BoxExpr        ::= "box" UnaryExpr
```

`box` is contextual: it is only treated as `BoxExpr` when it appears in a position where an expression is expected AND is followed by a valid expression start token. Otherwise it is parsed as an identifier.

#### Amended UnaryExpr

```ebnf
UnaryExpr      ::= ( "-" | "not" | "!" | "~" | "typeof" ) UnaryExpr
                 | BoxExpr
                 | PostfixExpr "as" Type
                 | PostfixExpr "as?" Type
                 | PostfixExpr
```

#### Field Qualifier Keywords (new)

```ebnf
FieldQualifier ::= "weak" | "unowned"

FieldDecl      ::= [ AccessMod ] [ FieldQualifier ] ( "let" | "var" )
                   Identifier ":" Type [ "=" Expr ] ";"
```

`unowned` is only valid in `@compiled` files with `--target native`. The compiler emits a compile-time error otherwise.

#### Operator Method Modifier (new)

```ebnf
MethodDecl     ::= [ AccessMod ] [ "static" ] [ "operator" ] "fun"
                   OperatorMethodName "(" [ ParamList ] ")" ":" Type FunBody

OperatorMethodName ::= Identifier | OperatorSymbol

OperatorSymbol ::= "+" | "-" | "*" | "/" | "%" | "**"
                 | "&" | "|" | "^" | "~" | "<<" | ">>"
                 | "[]" | "[]=" | "contains" | "()"
                 | "==" | "+=" | "-=" | "*=" | "/=" | "%="
                 | "**=" | "<<=" | ">>=" | "&=" | "|=" | "^="
```

#### ARC Capture List (new)

```ebnf
LambdaExpr     ::= "fun" "(" [ ParamList ] ")" [ CaptureList ]
                   ( "=>" Expr | Block )
               | "async" "fun" "(" [ ParamList ] ")" [ CaptureList ]
                   ( "=>" Expr | Block )

CaptureList    ::= "[" CaptureItem { "," CaptureItem } "]"
CaptureItem    ::= ( "weak" | "unowned" ) Identifier
```

Capture lists are valid only when `@compiled` and `--target native`. The compiler emits a compile-time error otherwise.

#### `ui` Fence Language Descriptor (new)

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

#### Amended Appendix B Operator Index (v0.6)

| Operator | Precedence | Description | Section |
|---|---|---|---|
| `()` `[]` `.` `?.` `!{}` `?.[` | 1 | Call, index, member access | §5.1 |
| `typeof` `instanceof` | 2 | Type operators | §4.7 |
| `-` (unary) `not` `!` `~` | 3 | Unary operators | §5.1 |
| `box` | 4 | Boxing/widening | §4.3 |
| `**` | 5 | Exponentiation | §5.1 |
| `*` `/` `%` | 6 | Multiplicative | §5.1 |
| `+` `-` | 7 | Additive | §5.1 |
| `<<` `>>` | 8 | Bitwise shift | §5.1 |
| `&` | 9 | Bitwise AND | §5.1 |
| `^` | 10 | Bitwise XOR | §5.1 |
| `\|` | 11 | Bitwise OR | §5.1 |
| `[:]` | 12 | Slice | §5.3 |
| `in` `not in` | 13 | Membership | §5.1 |
| `<` `>` `<=` `>=` | 14 | Comparison | §5.1 |
| `==` `!=` | 15 | Equality | §5.1 |
| `is` | 16 | Type check | §4.5 |
| `as` `as?` | 17 | Cast | §4.3 |
| `and` `&&` | 18 | Logical AND | §3.6 |
| `or` `\|\|` | 19 | Logical OR | §3.6 |
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
```

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

**`loom add <package>`** — Resolve and add a dependency to `loom.pkg` and update `loom.lock`.

**`loom publish`** — Publish a package to a registry.

**`loom fmt`** — Format Loom source files using the reference formatter.

**`loom check`** — Type-check without executing.

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

The reference formatter shares the parser and rendering rules used by execution. It formats Loom source files to a canonical style.

### §27.5 Language Server

The reference toolchain provides language-server diagnostics (LSP) for IDE integration, including:

- Real-time type checking and error reporting
- Autocompletion
- Go-to-definition
- Hover information
- Rename refactoring

---

## §28 Progressive Disclosure

*(This section is non-normative.)*

Loom is a single language and semantic model. There are no separate beginner and advanced dialects. However, the language is designed for progressive adoption with a three-tier learning path:

### Tier 1: Core Scripting

- Variable declarations (`let`, `var`)
- Functions (`fun`)
- Control flow (`if`/`else`, `while`, `for`, `for-in`)
- Collections (`list`, `dict`, `set`, `tuple`)
- Imports (`from ... import`)
- Script prelude (`readText`, `writeText`, `exec`, `env`, `args`)
- Interpolated strings (`"Hello, {$ name $}"`)
- `system.text`, `system.json`, `system.collections`

### Tier 2: Intermediate

- Enums and `match`
- `Result[T,E]` and `?` propagation
- `Option[T]` / `T?` / `?.` / `??`
- `async`/`await`
- Template fences
- `system.time`
- Explicit `portal` blocks
- Structs
- Union types

### Tier 3: Advanced

- Structured concurrency (`await group`, `TaskGroup`, `for await`)
- `system.ui` components and `ComponentRegistry`
- FFI (`extern js`, `extern native`, `@jsexport`)
- Reflection (`system.reflect`)
- Dynamic objects (`dynamic class`, `!{}`)
- Generators and `yield`
- Decorators
- `@compiled` mode and native compilation
- Macros
- Actors and supervision
- Direct capability objects (`runtime.fs`, `runtime.proc`, `runtime.net`)
- `system.debug` and time-travel debugging

### Guidance

- Compiler diagnostics explicitly explain when a user crosses into advanced concepts.
- Generated project templates prefer task-focused entry points: `script`, `cli`, `generator`, `service`, `webapp`.
- Beginner-facing materials teach interpolated strings before template fences, `Option[T]` before `Result[T,E]`, and sync examples before async.

---

## §29 Future Directions

*(This section is non-normative.)*

The following features are under consideration for future versions of the Loom specification:

- **Effect system.** Tracking side effects in the type system for purity guarantees.
- **Dependent types.** Limited dependent typing for array lengths and numeric constraints.
- **Trait-based dispatch.** Structural protocol matching as an alternative to nominal interfaces.
- **Module-level `async`.** Allowing `await` during module initialization with explicit opt-in.
- **Pattern matching extensions.** Active patterns, view patterns, and pattern synonyms.
- **Incremental compilation.** Fine-grained caching of compilation artifacts for faster rebuilds.
- **Hot module replacement.** Replacing modules at runtime without restarting the application.
- **WebGPU integration.** GPU compute shaders accessible from Loom via a `system.gpu` module.
- **Formal verification.** Integration with proof assistants for verifying critical code paths.
- **Algebraic effects.** First-class effect handlers as an alternative to exceptions and async.

---

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
| `fun` | §7.1 | Function declaration |
| `gen` | §7.5 | Generator function |
| `get` | §7.7 | Property getter |
| `global` | §7.3 | Module-scope variable mutation |
| `if` | §6.3 | Conditional |
| `implements` | §11.1 | Interface implementation |
| `import` | §13.1 | Import declaration |
| `in` | §6.4, §3.6 | For-in loop, membership test |
| `instanceof` | §4.7 | Type check operator |
| `interface` | §11.1 | Interface declaration |
| `is` | §4.5 | Type narrowing check |
| `let` | §6.2 | Immutable binding |
| `match` | §9.4 | Pattern matching |
| `new` | §8.4 | Constructor |
| `nonlocal` | §7.3 | Enclosing-scope variable mutation |
| `none` | §9.3 | None value |
| `not` | §3.6 | Logical NOT |
| `or` | §3.6 | Logical OR |
| `portal` | §6.7 | Debug activation point |
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

**Dunder identifiers** — Reserved for language-defined module introspection:

| Identifier | Section | Description |
|---|---|---|
| `__name__` | §2.2 | Module name (`"__main__"` for entry script) |
| `__file__` | §2.2 | Absolute file path of the module |
| `__execmode__` | §2.2 | `"scripted"` or `"compiled"` |

---

## Appendix B: Operator Index

| Operator | Precedence | Associativity | Description | Section |
|---|---|---|---|---|
| `()` | 1 | Left | Function call | §5.1 |
| `[]` | 1 | Left | Index access | §5.1 |
| `.` | 1 | Left | Member access | §5.1 |
| `?.` | 1 | Left | Safe navigation | §5.6 |
| `!{}` | 1 | Left | Dynamic field access | §8.7 |
| `?.[` | 1 | Left | Null-safe indexing | §5.5 |
| `typeof` | 2 | Prefix | Type-of operator | §4.7 |
| `instanceof` | 2 | Prefix | Instance check | §4.7 |
| `-` (unary) | 3 | Prefix | Negation | §5.1 |
| `not` / `!` | 3 | Prefix | Logical NOT | §3.6 |
| `**` | 4 | Right | Exponentiation | §5.1 |
| `*` `/` `%` | 5 | Left | Multiply, divide, modulo | §5.1 |
| `+` `-` | 6 | Left | Add, subtract, concat | §5.1 |
| `[:]` | 7 | N/A | Slice | §5.3 |
| `in` `not in` | 8 | Left | Membership | §5.1 |
| `<` `>` `<=` `>=` | 9 | Left | Comparison | §5.1 |
| `==` `!=` | 10 | Left | Equality | §5.1 |
| `is` | 11 | Left | Type check | §4.5 |
| `and` / `&&` | 12 | Left | Logical AND | §3.6 |
| `or` / `\|\|` | 13 | Left | Logical OR | §3.6 |
| `??` | 14 | Left | Null coalescing | §5.6 |
| `? :` | 15 | Right | Ternary conditional | §5.4 |
| `?` (postfix) | 16 | Postfix | Result propagation | §5.7 |
| `=` `+=` `-=` `*=` `/=` `%=` | 17 | Right | Assignment | §6.2 |
| `*` `**` (spread) | 18 | Prefix | Spread | §5.8 |

---

## Appendix C: Built-in Type Index

### Primitive Types

| Type | Description | Section |
|---|---|---|
| `int` | 64-bit signed integer | §4.1 |
| `float` | IEEE 754 double-precision float | §4.1 |
| `bool` | Boolean (`true`/`false`) | §4.1 |
| `string` | UTF-8 Unicode string | §4.1 |
| `bytes` | Arbitrary byte sequence | §4.1 |
| `list[T]` | Ordered sequence | §4.1 |
| `dict[K, V]` | Ordered map | §4.1 |
| `set[T]` | Unordered unique collection | §4.1 |
| `tuple[...]` | Fixed-size heterogeneous sequence | §4.9 |
| `void` | No return value | §4.4 |

### Box Types (ABI-internal)

Box types are ABI-internal in v0.6. User code should not reference them directly. See §4.2.

| Type | Boxes | Section |
|---|---|---|
| `Int` | `int` | §4.2 |
| `Float` | `float` | §4.2 |
| `Bool` | `bool` | §4.2 |
| `String` | `string` | §4.2 |
| `Bytes` | `bytes` | §4.2 |

### Built-in Enums

| Type | Variants | Section |
|---|---|---|
| `Option[T]` | `Some(T)`, `None` | §9.3 |
| `Result[T, E]` | `Ok(T)`, `Err(E)` | §9.3 |

### Standard Library Types

| Type | Module | Section |
|---|---|---|
| `Any` | (built-in) | §4.3 |
| `Task[T]` | (built-in) | §17.1 |
| `TaskGroup` | (built-in) | §17.3 |
| `CancellationToken` | (built-in) | §17.3 |
| `Actor[M]` | (built-in) | §17.6 |
| `Signal[T]` | `system.ui` | §19.1 |
| `View` | `system.ui` | §19.2 |
| `ComponentRegistry` | `system.ui` | §19.2 |
| `MountHandle` | `system.ui` | §19.3 |
| `Template` | `system.template` | §16.3 |
| `RenderContext` | `system.template` | §16.3 |
| `Type` | `system.reflect` | §4.7, §21.11 |
| `VariantInfo` | `system.reflect` | §4.7, §21.11 |
| `FieldInfo` | `system.reflect` | §21.11 |
| `MethodInfo` | `system.reflect` | §21.11 |
| `TraceLevel` | `system.debug` | §20.3 |
| `DebugFrame` | `system.debug` | §20.3 |
| `Window` | `system.ui.desktop` | §19.8 |
| `WindowConfig` | `system.ui.desktop` | §19.8 |
| `Tray` | `system.ui.desktop` | §19.8 |
| `TextStyle` | `system.ui` | §19.6 |
| `Color` | `system.ui` | §19.6 |
| `Insets` | `system.ui` | §19.6 |
| `SelectOption[T]` | `system.ui` | §19.6 |
| `Instant` | `system.time` | §21.3 |
| `Duration` | `system.time` | §21.3 |
| `Regex` | `system.regex` | §21.5 |
| `Match` | `system.regex` | §21.5 |
| `NativeHandle` | (FFI) | §18.4 |
| `DebugRuntime` | `system.debug` | §20.3 |
| `StackFrame` | (built-in) | §25.1 |

### Standard Interfaces

| Interface | Section | Description |
|---|---|---|
| `Iterable[T]` | §11.2, §11.3 | Sync iteration protocol |
| `Iterator[T]` | §11.2, §11.3 | Stateful single-pass cursor |
| `AsyncIterable[T]` | §11.2 | Async iteration protocol |
| `AsyncIterator[T]` | §11.2 | Async stateful cursor |
| `KeyLookup[K, V]` | §11.2 | Key-based lookup |
| `Readable` | §11.2 | Byte reading |
| `Writable` | §11.2 | Byte writing |
| `Closeable` | §11.2 | Resource cleanup |
| `Sized` | §11.2 | Intrinsic length |
| `From[E]` | §11.2 | Error conversion |
| `Comparable[T]` | §11.2 | Ordering comparison |
| `Equatable[T]` | §11.2 | Equality comparison (new in v0.6) |
| `Hashable` | §11.2 | Hash code generation |
| `Add[T, R]` | §11.2 | `+` operator |
| `Sub[T, R]` | §11.2 | `-` operator |
| `Mul[T, R]` | §11.2 | `*` operator |
| `Div[T, R]` | §11.2 | `/` operator |
| `Mod[T, R]` | §11.2 | `%` operator |
| `Pow[T, R]` | §11.2 | `**` operator |
| `Neg` | §11.2 | Unary `-` |
| `BitAnd[T, R]` | §11.2 | `&` operator |
| `BitOr[T, R]` | §11.2 | `\|` operator |
| `BitXor[T, R]` | §11.2 | `^` operator |
| `BitNot` | §11.2 | `~` operator |
| `Shl[T, R]` | §11.2 | `<<` operator |
| `Shr[T, R]` | §11.2 | `>>` operator |
| `Index[K, V]` | §11.2 | `[]` operator |
| `IndexSet[K, V]` | §11.2 | `[]=` operator |
| `Contains[T]` | §11.2 | `in` operator |
| `Callable[A, R]` | §11.2 | `()` call operator |
| `Renderable` | §11.2 | Template rendering |
| `Dynamic` | §11.2 | Dynamic field access |
| `Finalizable` | §11.2, §8.9 | GC finalization |
| `Scoped[T]` | §11.2, §6.6 | Sync context manager |
| `AsyncScoped[T]` | §11.2, §6.6 | Async context manager |

### Error Types

| Type | Description | Section |
|---|---|---|
| `Error` | Base error type | §25.1 |
| `TypeError` | Dynamic type mismatch | §25.2 |
| `MatchError` | No matching arm | §25.2 |
| `CapabilityError` | Unavailable capability | §25.2 |
| `FfiTypeError` | FFI marshalling failure | §25.2 |
| `LifetimeError` | Task escaping scope | §25.2 |
| `TimeoutError` | Timeout exceeded | §25.2 |
| `CancellationError` | Task cancelled | §25.2 |
| `DestructureError` | Destructuring mismatch | §25.2 |
| `IndexError` | Out-of-range index | §25.2 |
| `KeyError` | Missing dict key | §25.2 |
| `IoError` | I/O failure | §25.2 |

---

## Appendix D: Changelog from v0.5

This appendix summarises all changes from Loom Language Specification v0.5 to v0.6.

### Structural Changes

- §21.11 `system.reflect` amended: now universal, available in `@compiled` mode. Structural introspection only. Dynamic operations moved to new §21.12.
- New §21.12 `system.inspect`: dynamic construction, invocation, field access; interpreted-only.
- §22.2 restrictions table updated: `system.inspect` prohibited (replaces old `system.reflect` prohibition); `system.reflect` now permitted; added `unowned`, capture lists, and augmented assignment on structs.
- §19 Reactive UI fully restructured: universal core + `system.ui.web` (§19.7) + `system.ui.desktop` (§19.8) + `ui` fence primitives (§19.6).
- §23 Native Compilation expanded from 1 paragraph to 9 subsections.
- §17.7 added: `weak` references in concurrent contexts.
- §26.12 added: grammar productions for all v0.6 additions.

### New Language Features

| Feature | Section | Description |
|---|---|---|
| Implicit primitive widening | §4.3 | Primitives assignable to `Any` without explicit syntax |
| `box` keyword | §4.3 | Explicit widening operator (contextual keyword) |
| `as` cast operator | §4.3 | Asserting narrowing from `Any` — throws `TypeError` on mismatch |
| `as?` cast operator | §4.3 | Safe narrowing from `Any` — returns `Option[T]` |
| `weak` field qualifier | §8.6 | Non-owning reference; `T?` type; both modes; GC weak or ARC zeroing |
| `unowned` field qualifier | §8.6 | Non-retaining reference; `@compiled --target native` only |
| ARC capture lists | §7.3 | `[weak name, unowned other]` in closures; native target only |
| `operator fun` modifier | §7.1 | Declares operator interface implementation method |
| `Equatable[T]` interface | §11.2 | Equality operator protocol, separated from `Comparable[T]` |
| Operator interface set | §11.2 | `Add`, `Sub`, `Mul`, `Div`, `Mod`, `Pow`, `Neg`, `BitAnd`, `BitOr`, `BitXor`, `BitNot`, `Shl`, `Shr`, `Index`, `IndexSet`, `Contains`, `Callable` |
| Augmented assignment on classes | §5.1 | Explicit `operator fun +=` etc. for in-place mutation |
| `ui` fence | §19.6 | Cross-platform layout primitives producing `View` trees |
| `system.ui.desktop` | §19.8 | Desktop window management API |
| `runtime.ui.rootMount()` | §19.8 | Target-agnostic mount target |
| Two-tier portal conditions | §6.7 | Full lexical scope (scripted) vs predicate-only (compiled) |
| `DebugFrame` / `TraceLevel` | §20.3 | Typed trace frame model with `execMode` and `traceLevel` per frame |
| Static metadata table | §20.3 | Compiled module portal/callable registration protocol |
| `system.reflect.callableName` | §21.11 | Fully-qualified callable name for portals and traces |
| `system.reflect.typeOf[T]()` | §21.11 | Compile-time type reference without a value |
| `FieldInfo.isWeak`/`isUnowned` | §21.11 | Reflect weak/unowned field qualifiers |
| `MethodInfo.isOperator` | §21.11 | Reflect `operator fun` declarations |
| `Type.module` | §21.11 | Declaring module name on `Type` |
| ARC memory management | §23.4 | Mandatory for `--target native` |
| ARC weak side table | §23.4 | Atomic zeroing of weak references on deallocation |
| ARC `unowned` traps | §23.4 | `LifetimeError` in debug builds for stale unowned access |
| ARC/GC bridge retain | §23.5 | Cross-boundary object lifetime protocol |
| ABI stability | §23.6 | `stable_abi` manifest flag, versioning, layout rules |
| `loom export-headers` | §23.7.1 | Generate C headers from compiled Loom modules |
| `loom import-headers` | §23.7.2 | Generate Loom FFI from C headers; `.hints` files |
| `desktop` target profile | §13.3 | New `[target.desktop]` platform profile in `loom.pkg` |
| `native` target profile | §13.3 | New `[target.native]` platform profile in `loom.pkg` |
| `TraceLevel` enum | §20.3 | `Full` / `PortalOnly` / `Opaque` per-frame trace fidelity |

### Changed Semantics

- `Int.box()`, `String.box()` etc. are `@internal`. Implicit widening replaces them in all contexts.
- `Int.unbox()`, `String.unbox()` etc. are removed. Use `as` or `as?` instead.
- `Comparable[T]` is now a subtype of `Equatable[T]`. It provides `==` via `compareTo(other) == 0`, overridable by `operator fun ==`.
- Class `==` uses `Equatable[T].op_==` if implemented; referential identity otherwise. Previously `Comparable[T]` was the only override mechanism.
- `system.ui` availability changed from `browser` only to all targets.
- Portal conditions are now two-tier: full lexical scope in scripted mode, predicate-only in compiled mode.
- `TraceEvent.callable` is now always populated via `system.reflect.callableName` — works in compiled mode without `system.inspect`.
- `Finalizable.finalize()` is called deterministically under ARC. The "may never run" caveat applies only to GC targets.
- `LifetimeError` extended to cover ARC `unowned` access violations (debug builds only).
- `html` fence's `components` descriptor is now also valid for `ui` fences.
- `system.fs`, `system.proc`, `system.net` are now available on `desktop` and `native` targets in addition to `cli` and `service`.
- `system.reflect` restrictions in §22.2 replaced: `system.reflect` is now permitted in compiled mode; `system.inspect` is the prohibited module.

### Removed/Deprecated

- `Int.box()`, `Float.box()`, `Bool.box()`, `String.box()`, `Bytes.box()` — deprecated, `@internal` in v0.6, planned removal in v0.7.
- `Int.unbox()`, `Float.unbox()`, `Bool.unbox()`, `String.unbox()`, `Bytes.unbox()` — removed in v0.6.
- Direct references to box types `Int`, `Float`, `Bool`, `String`, `Bytes` in user code — compile-time deprecation warning in v0.6.
- `system.reflect.new()`, `system.reflect.invoke()`, `system.reflect.get()`, `system.reflect.set()`, `system.reflect.as()` — moved to `system.inspect`; old import paths emit a deprecation error with migration hint.

---

**End of Loom Language Specification v0.6**
