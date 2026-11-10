# Loup Language Reference v1.20 — Volume 1: Core Language

**Status:** Release — current normative reference
**Version:** 1.20.0
**Date:** 2026-05-07
**Supersedes:** 1.19.0
**Scope:** Syntax, types, expressions, control flow, OOP, modules, templates, macros, failure policy, formal grammar, tooling, progressive disclosure, future directions, and appendices.

**Related volumes:**
- [Volume 1 — Core Language](loup-language-core-v1_20.md)
- [Volume 2 — Runtime](loup-language-runtime-v1_20.md)
- [Volume 3 — Compilation](loup-language-compilation-v1_20.md)
- [Volume 4 — Data Formats](loup-language-data-v1_20.md)

**Companion documents:**
- [Loup Standard Library Reference v1.20](loup-stdlib-reference-v1_20.md)
- [Loup Packages Reference v1.12](loup-packages-reference-v1_12.md)
- [Loup Fortran HPC Packages v1.0](loup-fortran-hpc-packages-v1_0.md)
- [Loup COBOL & Mainframe Packages v1.0.1](loup-cobol-mainframe-packages-v1_0_1.md)
- [Loup Testing Reference v1.10](loup-testing-reference-v1_10.md)

**Section numbering convention.** Section numbers in v1.20 use the form
`§V-N` where `V` is the volume number (1–4) and `N` is the section index
within that volume. Subsections continue with dots: `§1-4.1.4.1` is
Volume 1, Section 4, subsection 1.4.1. Cross-references to sections in
other volumes use the same format. References of the form `§21.N` refer
to sections numbered §21.X in either the Standard Library Reference or the
Packages Reference, both of which retain their own internal numbering
scheme. By convention §21.1–§21.27 live in the Standard Library Reference
(`core.*` modules), while §21.28+ live in the Packages Reference (the
`loup.*` first-party packages).

**Changes from v1.19.**

This volume reflects the v1.20 release. Two categories of change apply:

*Structural.* The previously-monolithic Language Reference is split into four
volumes (Core, Runtime, Compilation, Data Formats). Section numbers use the
volume-prefixed `§V-N` form. Cross-references in companion documents have been
updated to the new format. See `loup-changes-v1_19-to-v1_20.md` for the
complete v1.19 → v1.20 section number translation table.

*Semantic additions in this volume.*

- **§1-3.6 (Literals).** Complex number literals: the `i`, `i32`, and `i64`
  suffixes produce pure-imaginary `complex64`, `complex32`, and `complex64`
  values respectively. Mixed real/imaginary literals are constructed via
  constant-expression addition (`1.5 + 2.3i`).
- **§1-4.1.6 (new).** `complex32` and `complex64` first-class primitive types.
  IEEE 754 complex with C99 `_Complex`-compatible layout for FFI to BLAS,
  LAPACK, FFTW, and Fortran `ISO_C_BINDING` complex types. `complex` is an
  alias for `complex64`.
- **§1-4.1.7 (new).** Floating-point environment specification: scoped
  rounding modes via `withRounding`, exception flag tracking, and signaling
  NaN support. Distinct from the decimal `RoundingMode` of §1-4.1.4.2 which
  applies to `decimal(p, s)` arithmetic.
- **§1-4.10 (new).** `array[T, rank]` primitive type for multi-dimensional
  arrays. Statically-known rank (1–7), per-array `Order.RowMajor` /
  `Order.ColumnMajor` storage layout, and configurable index base (0 or 1)
  for translation compatibility with Fortran-style code. Supports
  whole-array operations, indexing, and slicing. Distinct from `list[T]`
  (1-D dynamic) and `loup.tensor.Tensor` (lazy computation graph).
- **§1-5.9 (new).** Array section expressions: first-class slicing syntax
  `a[1:5, :, 2:8:2]` returning views over the source array's storage with
  adjusted shape and stride.
- **§1-19.18 (new).** Grammar productions for the v1.20 syntactic additions
  (imaginary literals, array section expressions, `for concurrent`
  statement, multi-dimensional array type expressions).

---

## Table of Contents

- [§1-1 Design Goals](#1-1-design-goals)
- [§1-2 Execution Model](#1-2-execution-model)
  - [§1-2.1 Script-Mode Runtime (JIT)](#1-21-script-mode-runtime-jit)
  - [§1-2.2 Module Introspection Dunders](#1-22-module-introspection-dunders)
  - [§1-2.3 Origination Introspection Dunders](#1-23-origination-introspection-dunders)
- [§1-2.4 Execution Modes](#1-24-execution-modes)
  - [§1-2.4.1 `web.scripted` — Browser JIT](#1-241-webscripted--browser-jit)
  - [§1-2.4.2 `web.compiled` — Browser AOT](#1-242-webcompiled--browser-aot)
  - [§1-2.4.3 `host.scripted` — Host JIT](#1-243-hostscripted--host-jit)
  - [§1-2.4.4 `host.dual` — Host Hybrid](#1-244-hostdual--host-hybrid)
  - [§1-2.4.5 `host.native` — Host AOT](#1-245-hostnative--host-aot)
  - [§1-2.4.6 `freestanding` — Bare Metal](#1-246-freestanding--bare-metal)
  - [§1-2.4.7 `portable` — Compiled in the Importer's Mode](#1-247-portable--compiled-in-the-importers-mode)
- [§1-2.5 File Mode Declarations](#1-25-file-mode-declarations)
  - [§1-2.5.1 The `@mode` Directive](#1-251-the-mode-directive)
  - [§1-2.5.2 Mode and Build Target Consistency](#1-252-mode-and-build-target-consistency)
  - [§1-2.5.3 Tooling Semantics](#1-253-tooling-semantics)
  - [§1-2.5.4 Mode-Related Error Codes](#1-254-mode-related-error-codes)
- [§1-2.6 Mode Feature Matrix](#1-26-mode-feature-matrix)
- [§1-3 Lexical Structure](#1-3-lexical-structure)
  - [§1-3.1 Source Encoding](#1-31-source-encoding)
  - [§1-3.2 Comments](#1-32-comments)
  - [§1-3.3 Statement Termination](#1-33-statement-termination)
  - [§1-3.4 Keywords](#1-34-keywords)
  - [§1-3.5 Identifiers](#1-35-identifiers)
  - [§1-3.6 Literals](#1-36-literals)
  - [§1-3.7 Operators](#1-37-operators)
  - [§1-3.8 Collection Literals](#1-38-collection-literals)
- [§1-4 Types and Type System](#1-4-types-and-type-system)
  - [§1-4.0 Core Numeric Trait Interfaces (v1.18)](#1-40-core-numeric-trait-interfaces-v118)
  - [§1-4.1 Primitive Types](#1-41-primitive-types)
    - [§1-4.1.1 Fixed-Width Integer Overflow](#1-411-fixed-width-integer-overflow)
    - [§1-4.1.2 Numeric Conversions](#1-412-numeric-conversions)
    - [§1-4.1.3 `bigint` — Arbitrary-Precision Integer](#1-413-bigint--arbitrary-precision-integer)
    - [§1-4.1.4 `decimal` — Arbitrary-Precision Decimal](#1-414-decimal--arbitrary-precision-decimal)
      - [§1-4.1.4.1 `decimal(p, s)` — Fixed-Precision Decimal](#1-4141-decimalp-s--fixed-precision-decimal)
      - [§1-4.1.4.2 Rounding and Overflow Policy](#1-4142-rounding-and-overflow-policy)
    - [§1-4.1.5 `char` — Unicode Scalar Value](#1-415-char--unicode-scalar-value)
    - [§1-4.1.6 `complex32` and `complex64` — Complex Numbers](#1-416-complex32-and-complex64--complex-numbers)
    - [§1-4.1.7 Floating-Point Environment](#1-417-floating-point-environment)
  - [§1-4.2 Box Types](#1-42-box-types)
  - [§1-4.3 `Any`](#1-43-any)
  - [§1-4.4 Function Types](#1-44-function-types)
  - [§1-4.4a `noreturn`](#1-44a-noreturn)
  - [§1-4.4b `impossible`](#1-44b-impossible)
  - [§1-4.5 Union Types](#1-45-union-types)
  - [§1-4.6 Type Aliases](#1-46-type-aliases)
  - [§1-4.7 `typeof` and `instanceof` Operators](#1-47-typeof-and-instanceof-operators)
  - [§1-4.8 Generics](#1-48-generics)
  - [§1-4.9 Tuple Type Details](#1-49-tuple-type-details)
  - [§1-4.10 Multi-Dimensional Arrays](#1-410-multi-dimensional-arrays)
- [§1-5 Expressions](#1-5-expressions)
  - [§1-5.1 Operator Semantics](#1-51-operator-semantics)
  - [§1-5.2 Comprehensions](#1-52-comprehensions)
  - [§1-5.3 Slicing](#1-53-slicing)
  - [§1-5.4 Conditional Expressions](#1-54-conditional-expressions)
  - [§1-5.5 Null-Safe Indexing](#1-55-null-safe-indexing)
  - [§1-5.6 Optionality Sugar](#1-56-optionality-sugar)
  - [§1-5.7 `?` Propagation Operator](#1-57--propagation-operator)
  - [§1-5.8 Spread Operators](#1-58-spread-operators)
  - [§1-5.9 Array Section Expressions](#1-59-array-section-expressions)
  - [§1-5.10 `attempt` Operator](#1-510-attempt-operator)
  - [§1-5.11 `unreachable`](#1-511-unreachable)
- [§1-6 Statements and Control Flow](#1-6-statements-and-control-flow)
  - [§1-6.1 Blocks and Scope](#1-61-blocks-and-scope)
  - [§1-6.2 Variable Declarations](#1-62-variable-declarations)
  - [§1-6.3 Conditionals](#1-63-conditionals)
  - [§1-6.4 Loops](#1-64-loops)
  - [§1-6.5 Defer](#1-65-defer)
  - [§1-6.6 `with` (Scoped Resources)](#1-66-with-scoped-resources)
  - [§1-6.7 Portal Statement](#1-67-portal-statement)
  - [§1-6.8 Destructuring](#1-68-destructuring)
  - [§1-6.9 `try`/`catch`/`finally`](#1-69-trycatchfinally)
  - [§1-6.10 Exception Chaining](#1-610-exception-chaining)
  - [§1-6.11 `del` Statement](#1-611-del-statement)
  - [§1-6.12 Reachability of Statements](#1-612-reachability-of-statements)
- [§1-7 Functions and Closures](#1-7-functions-and-closures)
  - [§1-7.1 Function Declarations](#1-71-function-declarations)
    - [§1-7.1.1 Default Parameter Values](#1-711-default-parameter-values)
  - [§1-7.2 Lambdas](#1-72-lambdas)
  - [§1-7.3 Closures](#1-73-closures)
  - [§1-7.4 Rest Parameters and Keyword-Only Parameters](#1-74-rest-parameters-and-keyword-only-parameters)
  - [§1-7.5 Generators and `yield`](#1-75-generators-and-yield)
  - [§1-7.6 Decorators](#1-76-decorators)
  - [§1-7.7 Property Getters and Setters](#1-77-property-getters-and-setters)
  - [§1-7.8 Divergence and Definite Completion](#1-78-divergence-and-definite-completion)
- [§1-8 Classes and Objects](#1-8-classes-and-objects)
  - [§1-8.1 Class Declarations](#1-81-class-declarations)
  - [§1-8.1.1 Memory Strategy Modifiers](#1-811-memory-strategy-modifiers)
    - [§1-8.1.1.1 Implementation Allowance (Non-Normative)](#1-8111-implementation-allowance-non-normative)
    - [§1-8.1.1.2 Syntax and Placement](#1-8112-syntax-and-placement)
    - [§1-8.1.1.3 Field Type Constraints](#1-8113-field-type-constraints)
    - [§1-8.1.1.4 Finalizers](#1-8114-finalizers)
    - [§1-8.1.1.5 Mode Availability Summary](#1-8115-mode-availability-summary)
  - [§1-8.2 Visibility](#1-82-visibility)
  - [§1-8.3 Inheritance](#1-83-inheritance)
  - [§1-8.3.1 `override` and `final`](#1-831-override-and-final)
  - [§1-8.3.2 `sealed`](#1-832-sealed)
  - [§1-8.4 Constructors, `this`, and `Self`](#1-84-constructors-this-and-self)
  - [§1-8.5 Static Members](#1-85-static-members)
  - [§1-8.6 Instance Fields](#1-86-instance-fields)
  - [§1-8.7 Dynamic Objects](#1-87-dynamic-objects)
  - [§1-8.8 Annotations](#1-88-annotations)
  - [§1-8.9 Finalization](#1-89-finalization)
  - [§1-8.10 Generic Classes](#1-810-generic-classes)
  - [§1-8.11 `unique class` Declaration](#1-811-unique-class-declaration)
  - [§1-8.12 Safety Annotations](#1-812-safety-annotations)
  - [§1-8.12.1 `@total` — Fault-Free Over Untrusted Input](#1-8121-total--fault-free-over-untrusted-input)
  - [§1-8.12.2 `@complete(T)` — Every Variant Carries the Completion Value](#1-8122-completet--every-variant-carries-the-completion-value)
  - [§1-8.12.3 `@must_resolve` — Consumption Required Before Scope Exit](#1-8123-mustresolve--consumption-required-before-scope-exit)
  - [§1-8.12.4 `@noderef` — Sealed Handle, No Read-Through](#1-8124-noderef--sealed-handle-no-read-through)
  - [§1-8.12.5 Error Codes](#1-8125-error-codes)
- [§1-9 Enums and Pattern Matching](#1-9-enums-and-pattern-matching)
  - [§1-9.1 Enum Declarations](#1-91-enum-declarations)
  - [§1-9.2 Enum/`Any` Boundary](#1-92-enumany-boundary)
  - [§1-9.3 Built-in Enums](#1-93-built-in-enums)
  - [§1-9.4 `match` Expression](#1-94-match-expression)
  - [§1-9.5 Union Type Matching](#1-95-union-type-matching)
- [§1-10 Structs](#1-10-structs)
  - [§1-10.1 Auto-Generated Constructors](#1-101-auto-generated-constructors)
  - [§1-10.1.1 Default Initialization of Uninitialized Struct Locals](#1-1011-default-initialization-of-uninitialized-struct-locals)
  - [§1-10.2 Immutability and Mutability](#1-102-immutability-and-mutability)
  - [§1-10.2.1 Field Visibility](#1-1021-field-visibility)
  - [§1-10.3 Value Semantics](#1-103-value-semantics)
  - [§1-10.3.1 Pure Value Type Invariant](#1-1031-pure-value-type-invariant)
  - [§1-10.3.2 Move Semantics for Structs with `unique` Fields](#1-1032-move-semantics-for-structs-with-unique-fields)
  - [§1-10.4 Relationship to `Any`](#1-104-relationship-to-any)
  - [§1-10.5 Methods](#1-105-methods)
  - [§1-10.6 Generic Structs](#1-106-generic-structs)
  - [§1-10.7 `with` Copy Expression](#1-107-with-copy-expression)
  - [§1-10.8 Struct Destructuring](#1-108-struct-destructuring)
  - [§1-10.9 Compiled Mode](#1-109-compiled-mode)
  - [§1-10.10 Relationship to Other Types](#1-1010-relationship-to-other-types)
  - [§1-10.11 Lifetime-Parameterized Structs](#1-1011-lifetime-parameterized-structs)
- [§1-11 Interfaces](#1-11-interfaces)
  - [§1-11.1 Interface Declarations](#1-111-interface-declarations)
  - [§1-11.2 Standard Interfaces](#1-112-standard-interfaces)
  - [§1-11.3 Iteration Protocol](#1-113-iteration-protocol)
  - [§1-11.4 Lifetime-Parameterized Interfaces](#1-114-lifetime-parameterized-interfaces)
  - [§1-11.5 Where Clauses](#1-115-where-clauses)
- [§1-12 Generics](#1-12-generics)
  - [§1-12.1 Lifetime Parameters in Generics](#1-121-lifetime-parameters-in-generics)
- [§1-13 Modules and Imports](#1-13-modules-and-imports)
  - [§1-13.0 Namespace Declarations](#1-130-namespace-declarations)
  - [§1-13.0.0 Source File Extensions](#1-1300-source-file-extensions)
  - [§1-13.1 Import Syntax](#1-131-import-syntax)
  - [§1-13.2 Re-Exports](#1-132-re-exports)
  - [§1-13.3 Package Manifest (`.lppkg`)](#1-133-package-manifest-lppkg)
  - [§1-13.4 Module Initialization](#1-134-module-initialization)
  - [§1-13.5 Package Registry](#1-135-package-registry)
  - [§1-13.6 Reserved Namespaces](#1-136-reserved-namespaces)
  - [§1-13.7 Module Fallback Pairs](#1-137-module-fallback-pairs)
    - [§1-13.7.1 Resolution Algorithm](#1-1371-resolution-algorithm)
    - [§1-13.7.2 Artefact Search Paths](#1-1372-artefact-search-paths)
    - [§1-13.7.3 API Compatibility](#1-1373-api-compatibility)
    - [§1-13.7.4 `__execmode__` Under Fallback Resolution](#1-1374-execmode-under-fallback-resolution)
    - [§1-13.7.5 Shipping Fallback Pairs](#1-1375-shipping-fallback-pairs)
    - [§1-13.7.6 `ModuleLoadError`](#1-1376-moduleloaderror)
  - [§1-13.8 Core Package Set](#1-138-core-package-set)
  - [§1-13.9 `LOUPPATH` — Development Package Search Path](#1-139-louppath--development-package-search-path)
  - [§1-13.10 Circular Imports and Deferred Type Resolution](#1-1310-circular-imports-and-deferred-type-resolution)
    - [§1-13.10.1 Circular Import Policy](#1-13101-circular-import-policy)
    - [§1-13.10.2 `defer import` — Deferred Type Resolution](#1-13102-defer-import--deferred-type-resolution)
    - [§1-13.10.3 Error Codes](#1-13103-error-codes)
- [§1-14 Multiline Strings](#1-14-multiline-strings)
- [§1-15 Interpolated Strings](#1-15-interpolated-strings)
- [§1-16 Template Fences](#1-16-template-fences)
  - [§1-16.1 Fence Syntax and Descriptors](#1-161-fence-syntax-and-descriptors)
  - [§1-16.2 Inline Expressions and Directives](#1-162-inline-expressions-and-directives)
  - [§1-16.3 Template as a Value](#1-163-template-as-a-value)
  - [§1-16.4 Rendering Semantics](#1-164-rendering-semantics)
  - [§1-16.5 Failure Policy (Templates)](#1-165-failure-policy-templates)
  - [§1-16.6 HTML Context Rendering](#1-166-html-context-rendering)
    - [§1-16.6.1 HTML Context Tracking](#1-1661-html-context-tracking)
    - [§1-16.6.2 Text Context Escaping](#1-1662-text-context-escaping)
    - [§1-16.6.3 Attribute Value Context Escaping](#1-1663-attribute-value-context-escaping)
    - [§1-16.6.4 URL Attribute Context](#1-1664-url-attribute-context)
    - [§1-16.6.5 `<script>` and `<style>` Prohibition](#1-1665-script-and-style-prohibition)
    - [§1-16.6.6 Raw Output Opt-Out](#1-1666-raw-output-opt-out)
    - [§1-16.6.7 `SafeHtml` and `Url` Types](#1-1667-safehtml-and-url-types)
    - [§1-16.6.8 Context Escaping in SSR Output](#1-1668-context-escaping-in-ssr-output)
  - [§1-16.7 CSS Context Fences](#1-167-css-context-fences)
    - [§1-16.7.1 `StyleSheet` and `ClassName`](#1-1671-stylesheet-and-classname)
    - [§1-16.7.2 Dynamic Values](#1-1672-dynamic-values)
    - [§1-16.7.3 Injection into Documents and Components](#1-1673-injection-into-documents-and-components)
    - [§1-16.7.4 Media Queries and Pseudo-Selectors](#1-1674-media-queries-and-pseudo-selectors)
    - [§1-16.7.5 Availability](#1-1675-availability)
  - [§1-16.8 GPU Shader Fence Descriptors](#1-168-gpu-shader-fence-descriptors)
    - [§1-16.8.1 `wgsl` — WebGPU Shading Language](#1-1681-wgsl--webgpu-shading-language)
    - [§1-16.8.2 `metal` — Metal Shading Language](#1-1682-metal--metal-shading-language)
    - [§1-16.8.3 `glsl` — OpenGL/Vulkan Shader](#1-1683-glsl--openglvulkan-shader)
    - [§1-16.8.4 Fence Body Compilation Model](#1-1684-fence-body-compilation-model)
- [§1-17 Macros and Metaprogramming](#1-17-macros-and-metaprogramming)
- [§1-18 Failure Policy](#1-18-failure-policy)
  - [§1-18.1 Exception Hierarchy](#1-181-exception-hierarchy)
  - [§1-18.2 User-Defined Exceptions](#1-182-user-defined-exceptions)
  - [§1-18.3 Exception Categories](#1-183-exception-categories)
  - [§1-18.4 Exception Propagation Rules](#1-184-exception-propagation-rules)
  - [§1-18.5 Catch Pattern Matching](#1-185-catch-pattern-matching)
  - [§1-18.6 Template Exceptions](#1-186-template-exceptions)
  - [§1-18.7 Task Failures](#1-187-task-failures)
  - [§1-18.8 FFI Exceptions](#1-188-ffi-exceptions)
  - [§1-18.9 Signal Handling](#1-189-signal-handling)
- [§1-19 Grammar](#1-19-grammar)
  - [§1-19.1 Lexical Grammar](#1-191-lexical-grammar)
  - [§1-19.2 Syntactic Grammar — Programs and Modules](#1-192-syntactic-grammar--programs-and-modules)
  - [§1-19.3 Syntactic Grammar — Imports and Exports](#1-193-syntactic-grammar--imports-and-exports)
  - [§1-19.4 Syntactic Grammar — Statements](#1-194-syntactic-grammar--statements)
  - [§1-19.5 Syntactic Grammar — Expressions](#1-195-syntactic-grammar--expressions)
  - [§1-19.6 Syntactic Grammar — Patterns](#1-196-syntactic-grammar--patterns)
  - [§1-19.7 Syntactic Grammar — Types](#1-197-syntactic-grammar--types)
  - [§1-19.8 Syntactic Grammar — Declarations](#1-198-syntactic-grammar--declarations)
  - [§1-19.9 Syntactic Grammar — FFI Declarations](#1-199-syntactic-grammar--ffi-declarations)
  - [§1-19.10 Syntactic Grammar — Template Directives](#1-1910-syntactic-grammar--template-directives)
  - [§1-19.11 Syntactic Grammar — Macro Declarations](#1-1911-syntactic-grammar--macro-declarations)
  - [§1-19.12 Syntactic Grammar — Additional Productions](#1-1912-syntactic-grammar--additional-productions)
  - [§1-19.13 Syntactic Grammar — Template Fence and HTML Context Productions](#1-1913-syntactic-grammar--template-fence-and-html-context-productions)
  - [§1-19.14 Syntactic Grammar — v1.14 Additions](#1-1914-syntactic-grammar--v114-additions)
  - [§1-19.15 Syntactic Grammar — v1.15 Additions](#1-1915-syntactic-grammar--v115-additions)
  - [§1-19.16 Syntactic Grammar — v1.16 Additions](#1-1916-syntactic-grammar--v116-additions)
  - [§1-19.17 Syntactic Grammar — v1.17 Additions](#1-1917-syntactic-grammar--v117-additions)
  - [§1-19.18 Syntactic Grammar — v1.20 Additions](#1-1918-syntactic-grammar--v120-additions)
- [§1-20 Tooling](#1-20-tooling)
  - [§1-20.1 Command-Line Interface](#1-201-command-line-interface)
  - [§1-20.2 Shebang Support](#1-202-shebang-support)
  - [§1-20.3 REPL](#1-203-repl)
  - [§1-20.4 Formatter](#1-204-formatter)
  - [§1-20.5 Language Server](#1-205-language-server)
  - [§1-20.6 Browser Bootstrap and Performance](#1-206-browser-bootstrap-and-performance)
  - [§1-20.6.1 Source Map Delivery](#1-2061-source-map-delivery)
  - [§1-20.6.2 Debug Server Bootstrap (`--inspect`)](#1-2062-debug-server-bootstrap---inspect)
  - [§1-20.7 Module Wasm Cache](#1-207-module-wasm-cache)
  - [§1-20.8 Project-Local Cache and Development Isolation](#1-208-project-local-cache-and-development-isolation)
  - [§1-20.9 Hardware Management Commands](#1-209-hardware-management-commands)
- [§1-21 Progressive Disclosure](#1-21-progressive-disclosure)
- [§1-22 Future Directions](#1-22-future-directions)
- [§1-23 Composable Architecture Templates](#1-23-composable-architecture-templates)
  - [§1-23.1 Foundation and Overlay](#1-231-foundation-and-overlay)
  - [§1-23.2 Parts: the per-target seam](#1-232-parts-the-per-target-seam)
  - [§1-23.3 Terminal selection](#1-233-terminal-selection)
  - [§1-23.4 Composition semantics](#1-234-composition-semantics)
  - [§1-23.5 Grammar](#1-235-grammar)

---

## §1-1 Design Goals

*(This section is non-normative.)*

Loup is a statically-typed, cooperatively-scheduled programming language designed for scripting, code generation, and full-stack application development. The following goals guide the language design:

- **Embeddable syntaxes.** The language is built so that other language syntaxes (Python, TypeScript, HTML, SQL, etc.) are easy to embed directly via template literals ("template fences"), with formatting and interpolation.

- **Runs anywhere.** The language is meant to run at any layer of the stack — CLI tools, servers, services, and in the web browser. A portable bytecode target (WebAssembly) ensures broad deployability and sandboxing.

- **Type-forward.** The language emphasizes types, interfaces, and type safety. It supports primitives, classes, nominal interfaces, reified generics, sum types, structs, union types, and reflection — balancing safety with dynamic capabilities for scripting and generation workflows.

- **Progressive adoption.** The language is one coherent model, but its tooling and documentation let users begin with a small script-first surface and adopt advanced features only when needed.

- **Dynamic debuggability.** The runtime is designed to support native tracing, in-process time-travel capture, and remotely activated debugging via named portals and callable entry points. The JIT compilation pipeline preserves full source maps for line-level debugging.

- **Memory safety.** Loup provides memory safety guarantees comparable to Rust through a layered ownership system: ownership transfer verbs (`reads`, `edits`, `takes`, `shares`) enforce shared-XOR-mutable at call sites in all execution modes; the `modifier` keyword enforces exclusive access for class mutation; `safe` contexts extend enforcement to multi-statement borrow tracking; `synchronized` classes serialize mutation at runtime for concurrent and async contexts; and `distinct()` contracts replace unverified aliasing assertions with statically-verified or explicitly auditable guarantees. `atomic {}` blocks close TOCTOU races in cooperative async code by providing compiler-enforced suspension-free regions. Unlike Rust, these guarantees are available in all execution modes, not gated to native compilation.

- **Explicit meaning.** Core syntax avoids "magic fallback" behaviors. Where dynamic behavior exists, it is opt-in and syntactically explicit.

- **Cross-platform viability.** The language and its toolchain are designed to work uniformly across CLI tools, server applications, native desktop applications, and the web browser. Platform-specific capabilities are capability-gated and enforced at build time via platform profiles.

- **Compiled mode.** For performance-critical code, Loup supports a compiled mode that restricts the language to a statically-analyzable subset suitable for ahead-of-time compilation to optimized Wasm or native code. Portal statements and `core.reflect` are available in compiled mode.

- **Native compilation.** Loup programs can be compiled to native binaries via LLVM or Cranelift backends using mandatory ARC memory management, bidirectional C header interop, and deployment without a Wasm runtime.

- **True parallelism.** On native targets, the async executor is optionally reconfigurable to a work-stealing multi-threaded model that distributes async tasks across all CPU cores. CPU-bound work runs on a dedicated blocking thread pool via `spawnBlocking`. In scripted mode and Wasm targets, `spawnBlocking` offloads synchronous work to a host-managed thread pool, and `ScriptWorker` provides isolated parallel Wasm instances with typed message channels. The `Sendable` interface enforces data-race freedom at compile time across all targets.

- **Unified UI model.** The Loup Common UI framework (the `loup.ui.*` packages, reached from hosted code through the stdlib alias `ui`) provides one reactive component model and the `ui` fence. Its core is portable library code: signals, layout, rendering and input run unchanged on every lane, and every desktop backend renders the same tree with identical geometry and no platform-native widgets. Platform integration (windows, menus, dialogs) is opt-in through `ui.desktop`; the browser host is deferred with the way paved (§2-4, re-pointed in v1.21).

---

## §1-2 Execution Model

*(This section is normative.)*

Loup defines seven execution modes — `@mode(web.scripted)`, `@mode(web.compiled)`, `@mode(host.scripted)`, `@mode(host.dual)`, `@mode(host.native)`, `@mode(freestanding)` and `@mode(portable)` — described fully in §1-2.4 and §1-2.6. The first six organize along two orthogonal axes:

- **Deployment environment** — `web.*` targets the browser sandbox, `host.*` targets an operating system process, `freestanding` targets bare metal with no runtime.
- **Compilation strategy** — `.scripted` denotes JIT compilation at load time, `.compiled` and `.native` denote AOT compilation at build time, `.dual` denotes source that is deliverable either as JIT-compiled script or AOT-compiled native binary.

The seventh, `portable`, sits on neither axis: a portable module is a library checked against the subset of features every importing mode shares, and compiled in the mode of each unit that imports it (§1-2.4.7).

The seven modes are not a strict subset hierarchy — each of the first six combines an environment and a strategy with specific capability implications. The modes are specified fully in §3-1 (web modes), §3-2 (host modes), §3-3 (freestanding) and §1-2.4.7 (portable).

**Design principles.**

1. **One language, delivery choice.** Features depend on the deployment environment, not on the compilation strategy. A file written for `host.scripted` can generally be compiled by the `host.native` AOT pipeline without modification. Delivery (JIT vs AOT) is a build decision, not a language decision.

2. **Statically-checkable capability surfaces.** The `@mode` declaration at the top of a file statically determines which runtime capabilities, standard-library modules, and language features are available. The linter, compiler, completion menus, and error messages use the mode as authoritative. A file declaring `@mode(web.scripted)` cannot reach for `runtime.proc.runAsync` even if the underlying JIT runtime would permit it.

3. **Import transparency.** An imported module's `@mode` does not leak through its public interface. Code in `host.scripted` may import a `host.native` module without knowing which delivery pipeline produced it; the runtime bridges the boundary (§3-2.5).

4. **Script-first portability.** Any module written in `web.scripted` or `host.scripted` that avoids build-time-only features can be compiled AOT (to `web.compiled` or `host.native` respectively) without source changes. This lets libraries ship as source and run without the native compiler toolchain installed.

### §1-2.1 Script-Mode Runtime (JIT)

*(This subsection specifies the JIT runtime used by `@mode(web.scripted)` and `@mode(host.scripted)`. The AOT pipelines are specified in §3-1 and §3-2.)*

Script-mode execution uses a cooperative, single-threaded runtime with first-class `async`/`await`.

**Runtime model.** The runtime SHALL execute Loup code cooperatively on a single thread by default, suspending only at explicit `await` expressions. All asynchronous work is represented as `Task[T]` values scheduled on the host event loop. Evaluation is deterministic between suspension points; only external I/O completion order may affect when suspended tasks resume. On `host.native` targets, the executor may be reconfigured to a work-stealing multi-threaded model via `runtime.configure` (§2-1.9.1) to enable parallelism across CPU cores. In script-mode runtimes and on all Wasm targets, `spawnBlocking` (§2-1.10.1) offloads CPU-bound synchronous work to a host-managed thread pool, and `ScriptWorker` (§2-1.10.2) provides isolated parallel Wasm instances with `Sendable`-typed message channels.

**JIT compilation pipeline.** The `loup run` command uses a JIT compilation pipeline rather than ahead-of-time batch compilation:

1. **Cache lookup** — Before compiling, the runtime checks the module Wasm cache (§1-20.7) for an up-to-date compiled artifact matching the module's source hash and current toolchain version. If a cache hit is found, step 2 is skipped and the cached Wasm is instantiated directly.
2. **Parse and JIT compile to Wasm** — If no cache entry exists, the source file is parsed into an AST and each top-level statement (or function body) is compiled to WebAssembly incrementally.
3. **Execute** — Compiled Wasm is executed immediately.

This pipeline ensures that execution begins immediately and each statement is individually addressable by a debugger. There is no separate build step for script modes. For packages installed via `loup install`, step 1 will nearly always be a cache hit, reducing script-mode startup latency to near-zero for imported modules.

**Statement-level execution.** In `@mode(host.scripted)`, the runtime SHALL treat every source-level statement as a discrete execution step. When a module is loaded, its top-level statements execute sequentially in source order. The JIT pipeline is the default execution mode for `loup run` and REPL sessions. Sequential top-level execution is specific to `host.scripted` — other modes use architectural entry points (web bootstrap, `main()`, `@entry`) described in §1-2.4.

**Source maps and debugging.** The runtime SHALL maintain a source map from every emitted Wasm instruction back to its originating Loup source line and column, enabling line-level breakpoints on any statement including imports and type definitions. JIT-compiled Wasm retains full debug metadata (source maps, local variable names, scope boundaries) by default.

**Source map delivery (normative).** When `loup build --debug --target browser` is invoked the toolchain SHALL:

1. Emit an external source map file `app.wasm.map` in the `dist/` output alongside `app.wasm`. Inline base64 source maps are permitted only for `loup serve` development mode; external files are required for all `loup build` outputs.
2. Append a `//# sourceMappingURL=app.wasm.map` comment at the end of the `app.wasm` binary so V8's Wasm debugger discovers the map automatically.
3. Annotate each portal entry point in the source map using the custom extension field `x-loup-portals`: a JSON object mapping portal names to their Wasm byte offsets. This enables the Loup DevTools browser extension to look up portals by name for CDP breakpoint placement.

`loup serve` SHALL serve `*.wasm.map` files with `Content-Type: application/json` and the response header `Access-Control-Allow-Origin: *` so Chrome DevTools can fetch source maps across the local origin boundary. Production deployments are responsible for configuring equivalent headers on their static file servers; Loup does not enforce this at build time but the tooling documentation SHALL note the requirement.

**Bytecode target.** The primary bytecode target for all Wasm-delivered modes (`web.scripted`, `web.compiled`, `host.scripted`, and the JIT side of `host.dual`) is WebAssembly. The specification defines:

- The mapping from Loup values to their Wasm representation — host-managed references (`externref`) over the runtime heap, with class and enum field layouts carried in the `loup_class_layouts` / `loup_enum_layouts` custom sections, and `§2-2` aggregates backed by linear memory (see §3-1)
- How Loup exceptions lower — an exception global, an active-flag, and post-call checks branching to the enclosing handler, preserving the §1-18 observable semantics without requiring host exception support
- How `Task[T]` and async/await map to Wasm execution (stack switching or CPS transform)
- The Wasm module interface (imports/exports) that the Loup runtime host must provide
- The source map format that maps Wasm instruction offsets to Loup source locations (file, line, column)

An implementation MAY instead target the WebAssembly GC and Exception Handling proposals — Loup classes as `struct` types collected by the engine, Loup exceptions as tags with `try_table` — provided the observable semantics of §1-8 and §1-18 are unchanged. The v1.20 toolchain does not; see §3-1.

**AOT compilation.** The `loup build` command uses an ahead-of-time (AOT) compilation mode that produces optimized Wasm modules (for `web.compiled`) or native binaries (for `host.native`, `host.dual`, `freestanding`) for deployment. Debug info inclusion is controlled by a `--debug` flag. AOT-compiled artifacts strip debug metadata unless `--debug` is specified.

**Statement-level execution semantics.** The following rules define precisely what "executing" each kind of top-level statement means in `@mode(host.scripted)`:

- **Import statement:** (a) Resolve the module path. (b) If the module is not already loaded, JIT-compile the target module's source, set its `__name__` to its fully-qualified module name and `__file__` to its source path, then execute its top-level statements in order. (c) Cache the module's bindings. (d) Bind the imported names into the current scope. If the module was already loaded, step (b) is skipped and cached bindings are reused. A module is initialized at most once.
- **`class` declaration:** (a) Evaluate any superclass/interface references. (b) Register the class type in the runtime type registry with its fields, methods, and metadata. (c) Make the class name available in the current scope.
- **`enum` declaration:** (a) Register the enum type and all its variants in the runtime type registry. (b) Make the enum name and variant constructors available in the current scope.
- **`interface` declaration:** (a) Register the interface in the runtime type registry. (b) Make the interface name available in the current scope.
- **`func` declaration:** (a) Capture the current lexical environment for closures. (b) Register the function name in the current scope with a lazy-compiled function value — the body is JIT-compiled on first invocation.
- **`let`/`var` declaration:** (a) Evaluate the initializer expression (if present). (b) Bind the name in the current scope to the resulting value.
- **Expression statement:** (a) Evaluate the expression for its side effects. (b) Discard the result value.

Module initialization order: top-level statements execute in source order, and a module is initialized at most once (subsequent imports of the same module reuse the cached bindings). The `__name__` and `__file__` dunder variables are set before the first top-level statement executes (see §1-2.2).

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

The runtime SHALL emit `Line` trace events (as defined in §2-5.3) at every source-level statement boundary, enabling trace hooks to observe execution at line granularity.

**Debug information and source maps.** The compiler SHALL emit DWARF debug information or a Wasm-compatible source map for every compiled Wasm module, mapping instruction offsets to Loup source locations (file path, line, column). Debug metadata includes:

- Local variable name and scope boundary information, so debuggers can display variable values at any point in execution.
- Type information, including enum variants, generic type parameters, and boxed/unboxed state, so debuggers can display typed values.

When JIT-compiling, the runtime attaches debug metadata to each compiled Wasm function immediately, without requiring a post-processing step. When AOT-compiling with `loup build --debug`, the compiler embeds debug metadata in the output Wasm module or emits a companion `.loup-debug` sidecar file. When AOT-compiling without `--debug`, the compiler strips debug metadata from the output Wasm module for minimal binary size.

The source map format is defined in relation to existing standards: DWARF for Wasm (for native and AOT targets) and the Wasm Source Map proposal (for browser-hosted execution).

**Tracing.** When a debug server or trace hook is active, the runtime SHALL maintain rolling trace history for time-travel debugging. Named `portal` statements and callable entry points may activate trace capture for the current task.

**Failure model.** Failures are hard by default; see §1-18 for the complete failure policy.

**Wasm call-stack exhaustion (normative).** A Wasm call-stack exhaustion trap encountered during execution of a Loup Wasm-delivered program SHALL be caught by the Loup runtime host and rethrown as `StackOverflowError`, which extends `RuntimeError` (§1-18.1) at the point of the deepest active Loup call frame. `StackOverflowError` is catchable by user `try/catch` blocks. The maximum call-stack depth is engine-defined and is not specified by Loup; programs MUST NOT rely on a particular limit. Recursive algorithms with unbounded depth SHOULD use explicit work-list patterns or `gen func` (§1-7.5) to avoid stack exhaustion.

### §1-2.2 Module Introspection Dunders

Every Loup module has three implicit read-only bindings available at module scope:

| Dunder | Type | Description |
|---|---|---|
| `__name__` | `string` | The module's identity name |
| `__file__` | `string` | The absolute filesystem path of the source file |
| `__execmode__` | `string` | The mode string: `"web.scripted"`, `"web.compiled"`, `"host.scripted"`, `"host.dual"`, `"host.native"`, `"freestanding"`, or `"portable"` |

**`__name__` rules:**

- In `@mode(host.scripted)`, when a file is executed directly via `loup run`, `__name__` is `"__main__"`. When loaded as an import, `__name__` is the module's fully-qualified dotted name (e.g., `"mypackage.utils"`).
- In `@mode(host.dual)` and `@mode(host.native)`, `__name__` is always the module's fully-qualified dotted name. Entry is via the `main()` function, not via file identity.
- In `@mode(web.scripted)` and `@mode(web.compiled)`, `__name__` is always the module's fully-qualified dotted name. Web modules are loaded by the browser bootstrap (§1-20.6); there is no "run this file directly" disposition, so `"__main__"` is never a meaningful value.
- In `@mode(freestanding)`, `__name__` is always the module's fully-qualified dotted name. Entry is via the `@entry` annotation (§3-3.5).
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
- `@mode(portable)`: `"portable"` — whichever unit imports the module and in whichever mode it is lowered (§1-2.4.7)
- In the REPL: `"host.scripted"`

In all AOT-compiled modes (`web.compiled`, `host.native`, `freestanding`, and the AOT side of `host.dual`), `__execmode__` is a compile-time string constant baked into the binary. It does not require the Loup runtime to evaluate. `core.reflect` is not needed to read `__execmode__` — it is always a compile-time constant in all AOT modes. In `host.dual`, the value is fixed at source-declaration time and does not vary between JIT and AOT delivery paths; user code wishing to detect the current delivery pipeline SHOULD use `runtime.delivery` (§2-5.1) instead. A `portable` module's value is a compile-time constant in every importer, on the same precedent: it does not vary with the importing unit, whose facts portable code reads through `if const` keys (§1-2.4.7).

**Read-only semantics.** The compiler SHALL treat `__name__`, `__file__`, and `__execmode__` as read-only implicit `let` bindings. Attempting to reassign any of them is a compile-time error (`E_LET_REASSIGN`).

**AOT-mode constants.** In any AOT-compiled file, `__name__`, `__file__`, and `__execmode__` are compile-time string constants baked into the binary — they do not require the runtime to evaluate. `__name__` is the module's dotted name, `__file__` is the source path at compile time, and `__execmode__` is the mode string for that file.

**Dunder reservation.** Identifiers beginning and ending with double underscores (`__*__`) follow the Python dunder naming convention and are reserved for language-defined module introspection variables. User code SHALL NOT declare variables with dunder names. The language-reserved dunders are: `__name__`, `__file__`, `__execmode__`, and `__module__` (the declaration-level property on named types and functions, §1-2.3). Additional language-level introspection variables follow the same `__dunder__` pattern.

**Main guard pattern.** The idiomatic way to write code that runs only when a file is executed directly:

```
# utils.loup — a dual-purpose module (host.scripted)
pub func greet(name: string): string {
  return i"Hello, {$ name $}!";
}

if (__name__ == "__main__") {
  # This block runs only when executed via `loup run utils.loup`
  let message = greet("world");
  print(message);
}
```

This pattern is available only in `@mode(host.scripted)`. It is a compile-time error in all other modes:

- **In `web.scripted` and `web.compiled`** — web modules are loaded by the browser bootstrap and have no direct-execution disposition. The guard would be statically dead. (`E_MAIN_GUARD_NOT_APPLICABLE`)
- **In `host.dual` and `host.native`** — entry is via a declared `main()` function (§1-2.4.4, §1-2.4.5); top-level control flow is prohibited, which the compiler enforces separately. (`E_TOPLEVEL_CONTROL_AOT`)
- **In `freestanding`** — entry is via `@entry` (§3-3.5); top-level control flow is prohibited. (`E_TOPLEVEL_CONTROL_AOT`)

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

# In host.scripted:
if (__name__ == "__main__") {
  await main();
}

# In host.dual / host.native: main() is called by the runtime; no guard needed.
```

### §1-2.3 Origination Introspection Dunders

Classes have declaration-level dunders that are accessible as properties on named types and functions:

| Dunder | Available on | Type | Description |
|---|---|---|---|
| `__module__` | class, struct, enum, interface, func | `Module` | The module that declared this value |


**`__module__` on named declarations.** Every named class, struct, enum, interface, and function declaration carries an implicit `__module__` property that returns a `Module` value representing the module where the declaration was made. This is accessible via dot syntax on any named type or function value:
```loup
Encoder.__module__.__execmode__    # e.g., "host.scripted", "host.native", "web.compiled"
decode.__module__.__name__         # "mylib.codec"
Shape.__module__.__file__          # "/path/to/shapes.loup"
```

`__module__` is not a module-scope dunder — it is a property on type and function values. It is available in all six modes. In any AOT-compiled mode (`web.compiled`, `host.native`, `freestanding`, and the AOT side of `host.dual`), `.__module__` returns compile-time-baked metadata requiring no runtime evaluation.

**`Module` built-in type.** `Module` is a built-in class with read-only properties mirroring the module-scope dunders:
```loup
pub class Module : Any {
  pub let __name__: string;      # fully-qualified module name
  pub let __file__: string;      # source file path at compile time
  pub let __execmode__: string;  # one of the seven mode strings

  # Runtime module reflection — available when the Module value is the result of
  # runtime.compile() or obtained via __module__ on a dynamically-loaded type.
  pub func exports(): list[string];                  # exported symbol names
  pub func get(name: string): Any;                   # throws KeyError if not found
  pub func has(name: string): bool;                  # check if name is exported
  pub func call(name: string, args: list[Any]): Any; # call exported function
}
```

`Module` values are not constructable by user code — they are produced only by the runtime in response to `.__module__` access. Two `.__module__` accesses on declarations from the same module return the same `Module` instance (referential equality).

**`prefer compiled` and `__execmode__`.** When a module is loaded via `prefer compiled` resolution (§1-13.1, §1-13.7), its `__execmode__` reflects which path was taken: the AOT mode string if a compiled artifact was loaded, `"host.scripted"` or `"web.scripted"` if the scripted fallback was used. This is the canonical way to inspect fallback resolution from user code:
```loup
from codec import (Encoder) prefer compiled;

if (Encoder.__module__.__execmode__ == "host.scripted") {
  log.warn("codec running in pure script mode — performance may be reduced");
}
```

---

## §1-2.4 Execution Modes

*(This section is normative.)*

Loup defines seven execution modes. Each of the first six represents a specific combination of deployment environment and compilation strategy, determining runtime support, memory management strategy, permitted language features, and target deployment artifact; the seventh, `portable` (§1-2.4.7), takes all of these from the unit that imports it. A source file declares its mode with the `@mode` directive (§1-2.5); the build system, compiler, linter, formatter, and language server treat the declared mode as authoritative for that file.

The modes organize as a 2D grid:

| Environment ↓ / Strategy → | JIT (scripted) | AOT (compiled) | Hybrid (dual) |
|---|---|---|---|
| **Web** (browser, Wasm) | `web.scripted` | `web.compiled` | — |
| **Host** (OS process) | `host.scripted` | `host.native` | `host.dual` |
| **Bare metal** (no runtime) | — | `freestanding` | — |
| **Portable** — compiled in the importer's mode | `portable` | `portable` | `portable` |

There is no runtime compatibility between environments; modules compiled for different environments produce distinct binary artifacts. Within an environment, modules freely mix strategies:

- A `host.scripted` file may import `host.native` or `host.dual` modules; the runtime bridges the GC/ARC boundary (§3-2.5). Consumer code does not need to know which delivery strategy produced the imported module — this is the **import transparency** principle in action.
- A `web.scripted` file may import `web.compiled` modules; both sides run on the shared Wasm runtime.
- A `host.dual` file may import from any host-environment mode (`host.scripted`, `host.native`, or other `host.dual`), carrying the import transparency guarantee through both delivery paths.
- A `host.scripted`, `host.dual`, `host.native` or `freestanding` file may import a `portable` module, which is compiled into the importing unit in that unit's mode (§1-2.4.7). A portable module imports only portable modules.

A `host.native` binary that uses `runtime.compile` (§2-5.1) embeds a JIT runtime and can dynamically load `host.scripted` or `host.dual` modules at runtime, further extending the import-transparency principle to runtime module loading.

### §1-2.4.1 `web.scripted` — Browser JIT

The web-environment script mode. Loup source is delivered to the browser; `loup-rt.js` JIT-compiles each module to Wasm at load time (§1-2.1, §1-20.6).

**Entry point.** Architectural — the browser bootstrap fetches `app.wasm` (compiled from source at load time), runs top-level declarations, wires `data-loup-ev` event handlers, and invokes the registered `mount(...)` call. There is no `main()` function; top-level control flow is permitted for setup but `__name__ == "__main__"` is not meaningful (§1-2.2).

**Features:**

- Dynamic typing (full `Any` usage), `dynamic class`, `core.reflect`, `core.inspect`
- ARC memory model (`local class` default, `shared class` opt-in; §1-8.1.1); implementation may use Wasm GC under the hood as an optimization (§1-8.1.1.1)
- `async`/`await` with cooperative event loop
- Template fences (HTML, CSS, WGSL, Metal, GLSL), reactive UI (`ui.web`), Web Components (`@webcomponent`) — the last two deferred with the browser host since v1.21 (§2-4.7, §2-4.10)
- Compile-time ownership features: `reads`, `edits`, `takes`, `shares`, `modifier`, `safe {}` / `safe func`, `synchronized`, `distinct()`, `borrow`, `excl borrow`, `borrow[~name]`, `lifetime ~name`, `noescape fn`, `unique let`/`var`/`class`, `unowned[~name]`, `MaybeUninit[T]`, `reinterpret[T, U]`, `atomic {}`
- `weak` references (§1-8) on any `local class` or `shared class` instance
- `runtime.compile` — dynamic JIT of additional modules
- `spawnBlocking`, `ScriptWorker` (§2-1.10), shared-memory concurrency (§2-2)
- Full standard library except host-capability APIs

**Restrictions.** Host-environment capabilities (`runtime.fs`, `runtime.proc`, `runtime.net` with non-browser semantics, `ThreadLocal[T]`) are not available — calling them is a compile-time error (`E_CAPABILITY_NOT_WEB`) or throws `CapabilityError` at runtime when the call site is dynamically resolved.

Build-time-only features (`asm { }` inline Wasm, static layout control via `@repr`) are unavailable; source must be reprocessed by the JIT pipeline at load time.

### §1-2.4.2 `web.compiled` — Browser AOT

The web-environment compiled mode. Loup source is AOT-compiled at build time to a `.wasm` module that is fetched and instantiated by the browser bootstrap (§3-1, §1-20.6).

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

### §1-2.4.3 `host.scripted` — Host JIT

The host-environment script mode. Files are executed by `loup run` on a host runtime (`node`, `bun`, `deno`, or the standalone `loup` CLI), JIT-compiled to Wasm inside the host process (§1-2.1).

**Entry point.** Sequential top-level execution — when a file is invoked via `loup run foo.loup`, its top-level statements execute in source order, with `__name__ == "__main__"` available as a runtime-executable branch.

**Features.**

- Script-mode runtime: dynamic typing, `dynamic class`, `core.reflect`, `core.inspect`, JIT compilation with incremental re-compilation
- ARC memory model (`local class` default, `shared class` opt-in; §1-8.1.1); implementation may use Wasm GC under the hood as an optimization (§1-8.1.1.1)
- `async`/`await` with cooperative event loop
- Template fences (HTML, CSS, WGSL, Metal, GLSL)
- Reactive UI via `ui.desktop` — the desktop API (`loup.ui.desktop`) over the UI backends (§2-4.8)
- Compile-time ownership features (universal, §3-2.4): `reads`, `edits`, `takes`, `shares`, `modifier`, `safe {}` / `safe func`, `synchronized`, `distinct()`, `borrow`, `excl borrow`, `borrow[~name]`, `lifetime ~name`, `noescape fn`, `unique let`/`var`/`class`, `unowned[~name]`, `MaybeUninit[T]`, `reinterpret[T, U]`, `atomic {}`
- `weak` references (§1-8) on any `local class` or `shared class` instance
- `runtime.compile` — dynamic JIT of additional modules
- Sequential top-level execution and `__name__ == "__main__"` guard pattern
- Full host capability surface: `runtime.fs`, `runtime.proc`, `runtime.net`, file system, process spawning, environment variables
- `spawnBlocking` backed by the host's OS thread pool (default 512 threads)
- `ScriptWorker` with host-side isolation (§2-1.10), shared-memory concurrency (§2-2)

**Restrictions.**

- **Web-specific features** — `ui.web`, `@webcomponent`, browser DOM APIs are unavailable.
- **Build-time-only features** — `asm { }`, static layout control via `@repr`, hardware intrinsics are unavailable.

**Cross-mode imports.** A `host.scripted` module may import `host.native` or `host.dual` modules. The import is transparent at the source level; the runtime inserts the ARC/GC bridge described in §3-2.5. If the imported native module is unavailable (the native toolchain was not installed, or the binding failed to compile), resolution may fall back to a scripted implementation via `prefer compiled` (§1-13.7). This realizes the **import transparency** design principle (§1-2): consumer code does not need to know whether an imported module is script-delivered or AOT-delivered.

### §1-2.4.4 `host.dual` — Host Hybrid

The host-environment hybrid mode. Files declare `@mode(host.dual)` to signal that the module is deliverable via either the JIT pipeline (like `host.scripted`) or the AOT native compiler (like `host.native`), and that the author intends to use ARC-backed safety features that require runtime support (`weak` references, `arc let`).

**Host.dual semantics.** A single `host.dual` source file behaves identically on both delivery paths. Features that fundamentally cannot round-trip between JIT and AOT are prohibited in `host.dual`. Features that *can* work on both paths — even if the AOT binary must embed a runtime component (a JIT compiler for `runtime.compile`, a minimal Wasm runtime for `ScriptWorker`) — are permitted; the build system handles the embedding automatically. The programmer writes one thing and it works the same way on both paths.

**Entry point.** A declared `main()` function. Top-level control flow is prohibited (`E_TOPLEVEL_CONTROL_AOT`); only declarations and constant initializers are permitted at module scope. The runtime invokes `main()` after module initialization — the JIT pipeline calls `main()` after compiling the module, and the AOT pipeline emits a binary whose entry point calls `main()`. `main`'s `int` result is the process exit status on both paths (*Compiler's rule (main's exit status)*, §1-2.4.5).

**Features.**

- All `host.scripted` source-level features (dynamic typing, template fences, ownership verbs, compile-time ownership analysis, full host capability surface, `ui.desktop`)
- `weak` references — the JIT path uses a runtime-maintained weak table over the host heap; the AOT path uses an ARC zeroing side table; the programmer sees identical semantics
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

**Delivery choice.** The build system selects the delivery pipeline based on project configuration (`[build]` in `.lppkg`) and the availability of the native toolchain. A `host.dual` module built with `loup build --native` produces an AOT binary; the same source run via `loup run` uses the JIT pipeline. Source behaves identically on both paths. The current delivery path is observable via `runtime.delivery` (§2-5.1) — returns `"jit"` or `"aot"` — but user code SHOULD NOT need this; delivery differences are runtime implementation details.

**Binary size implications (AOT path).** Using `runtime.compile` in a `host.dual` module causes the AOT build to embed the JIT runtime (approximately 300 KB uncompressed). Using `ScriptWorker` causes the AOT build to embed a minimal Wasm runtime (approximately 500 KB uncompressed, inclusive of the JIT). Projects that need minimum binary size should use `host.native` for the hot path and isolate any JIT-requiring code into separate `host.dual` modules that can be linked conditionally or omitted in constrained builds.

**Purpose.** `host.dual` is the "write once, ship either way" mode. A dependency published as `host.dual` can be consumed in a `host.scripted` project (JIT'd on the fly) or in a `host.native` project (linked as a native module) without source changes. This supports the **script-first portability** design principle (§1-2): libraries can use ARC safety features and dynamic capabilities without forcing consumers to install the native compiler toolchain.

### §1-2.4.5 `host.native` — Host AOT

The host-environment AOT native mode. Compiles to a platform-native binary via LLVM or Cranelift (§3-2) with ARC memory management, zero-overhead C FFI, and direct machine-code emission. Intended for performance-critical applications, system utilities, and deliverables where binary size and startup time matter.

**Entry point.** A declared `main()` function. Top-level control flow is prohibited (`E_TOPLEVEL_CONTROL_AOT`); only declarations and constant initializers are permitted at module scope.

*Compiler's rule (main's exit status).* On every delivery path that invokes a declared `main()` — the AOT binary, the Wasm launcher, and `loup run` of an AOT-mode entry (`host.dual`, `host.native`) — the process exit status is `main`'s return value when `main` is declared `int`, reduced to its low byte (`0..255`, as the C library's `exit` takes it: `263` exits 7, `-1` exits 255); a `main` that returns `void` exits 0 (any other return type is `E_MAIN_SIGNATURE`, below). An uncaught exception ends the process with status 1 whatever `main` would have returned, and a compile error or bad invocation exits 2 (`loup run`, §2-5 / source-runner Requirement 9); `exit(code)` (§2-5.2) ends the process with `code` before `main` returns. A `host.scripted` script that calls `main()` itself from the top level is not under this rule: its exit status is the runner's — 0 unless an exception escapes — and the explicit call's result is an ordinary value. (Ruling EXIT-1, loup#576.)

*Compiler's rule (main's signature).* In a mode whose runner invokes `main` (`host.dual`, `host.native`, `web.compiled`, `freestanding` — the modes of the rule below), a module-level `main` takes NO parameters and returns `void` or `int` (`int64`, the same type); an `async main` may also spell them `Task[void]` / `Task[int]`. Anything else — `func main(args: list[string])`, `func main(): string` — is `E_MAIN_SIGNATURE` on every checker: nothing passes a `main` arguments, and only an `int` result is an exit status. Command-line arguments come from `runtime.args()` (§2-5.1) only. A `host.scripted` script's own `main` is an ordinary function, which the script calls itself, so the rule does not reach it. (Ruling MAIN-1, loup#750: both checkers accepted a parameterised `main`; the interpreters then failed at run time and both native lanes segfaulted.)

*Compiler's rule (who invokes `main`).* A runner invokes the entry's declared `main()` after module initialization exactly when the entry is an AOT-mode entry — its in-file mode is `host.dual`, `host.native`, `web.compiled` or `freestanding` — that declares `main()` and has no top-level control flow (which, in those modes, `E_TOPLEVEL_CONTROL_AOT` already rules out). Any other entry — a `host.scripted` script, a legacy `@compiled` file that calls `main();` itself — IS its top-level statements, run once; a `main()` it calls runs as an ordinary call, once. Every runner applies this one rule: `loup run`, the AOT binary, and each Wasm runner — the packaged launcher, `loup-launcher --run-bare` (the reference host with no package manifest) and the pure-Loup engine — for which the build records the decision in the artifact itself: an artifact whose entry `main` the runner invokes exports it a second time as `__loup_entry_main`, and a Wasm runner runs `_start` (module initialization; for a script, the whole program) and then that export, whose `int` is the exit status under EXIT-1. No runner calls an exported `main` it was not told to call. (Ruling ENTRY-1, loup#592: `--run-bare` had run `_start` only, so a compiled module's program never ran there and it exited 0, while the packaged launcher called any exported `main` after `_start`, so a script that calls its own `main()` ran it twice.)

**Features.** All host-environment features, including those requiring direct machine access that are prohibited in `host.dual`:

- All `host.dual` source-level features (dynamic typing, ownership verbs, compile-time ownership analysis, `weak`, `arc let`, full host capability surface, `Thread` / `ThreadPool` / `ThreadLocal[T]`, etc.)
- `asm { }` inline assembly (with `@unsafe`)
- `native.simd`, `Vec[T, N]`, hardware vector intrinsics
- `native.atomic` — OS-level atomics, memory fences, hardware barriers
- `native.mem.alloc` / `native.mem.free` — raw memory operations
- `volatile borrow` parameters and `Volatile[T]` (§3-3.8, §3-3.9) — memory-mapped device access from a hosted process (a register block mapped through UIO / VFIO / `/dev/mem`). LLVM backend only: a backend that cannot express a volatile memory access refuses the function rather than weaken the guarantee
- Work-stealing multi-threaded async executor (`runtime.configure`)
- `PinnedRef[T]`, `OwnedHandle`, `BorrowedHandle` — FFI ownership types (§2-3.4)
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

### §1-2.4.6 `freestanding` — Bare Metal

The freestanding mode. Compiles to a native binary with **no Loup runtime linked** — designed for kernels, bootloaders, embedded firmware, and bare-metal environments.

**Entry point.** A function annotated with `@entry` (§3-3.5). There is no `main()`; there is no runtime to call `main()`. The `@entry` function is wired directly to the linker-defined entry symbol.

**Features.**

- Full compile-time ownership and lifetime system (`borrow`, `unique`, `lifetime ~name`, `noescape fn`, `unowned[~name]`, `MaybeUninit[T]`, etc.)
- `reads`, `edits`, `takes`, `shares`, `modifier`, `safe {}`, `distinct()`
- `asm { }` inline assembly, `volatile`, `Volatile[T]`, `@repr`, `@interrupt`, `@naked`, `@callconv`, `@entry`, `@panic_handler`, `@allocator`, `@deallocator`, `@scheduler`
- v1.16 hardware-safety additions: `@interruptSafe`, `InterruptGuard` (§3-3.24), `DmaBuffer[T]` and `native.dma` (§3-3.20), `native.mpu.installStackGuard` (§3-3.20), `native.atomic.hwFence` with `MemoryOrder` (§3-3.20), `PartialInit[T]` (§3-3.17a), `reinterpretChecked[T, U]` (§3-3.18)
- Freestanding debug portal service in `--debug` builds — `portal` statements, `@debug_control_channel`, `@debug_trace_channel`, time-travel replay (§3-3.25)

**Restrictions.** Classes require an `@allocator` registration; without one, class construction is a compile-time error. Async/await, exceptions, template fences, UI, `core.reflect`, `core.inspect`, `dynamic class`, `weak` references, `arc let`, `Any` as a declared type — all unavailable. See §3-3 for the complete freestanding specification.

### §1-2.4.7 `portable` — Compiled in the Importer's Mode

The portable mode (ruling PORT-1). A `@mode(portable)` module is a library written once and compiled into every unit that imports it, in that unit's mode: the same source runs in a `host.scripted` script and under `loup test`, in a `host.dual` or `host.native` program, and in a `freestanding` image. The Loup Common UI packages (`loup.ui.*`) and `core.sensitivity` are portable modules.

**Checked against the PORTABLE-SUBSET.** A portable module may use exactly the features the `portable` column of §1-2.6 marks ✓, together with the features marked ✓ in the table below (those without a row in §1-2.6). A feature is in the subset only if it is ✓ (not ⚠) in `host.scripted`, `host.dual`, `host.native`, `freestanding` and `web.compiled`, has the same observable semantics in all five (integer overflow excepted, below), and builds under `no_float = true` (§3-3.21). Any other feature is `E_PORTABLE_FEATURE`, and the message names the feature's row. The verdict does not depend on the importer:

- every branch of an `if const` is fully checked (§1-6.3);
- where a rule of the language differs between the modes that may import a portable module, the portable module is held to the strictest form: a rule one of them relaxes is applied as written (the safe-context and `modifier` rules of §1-7.1, which `freestanding` relaxes), and an analysis one of them adds runs (the freestanding frame-escape and return-provenance rules of CLSID-1, §1-8.1.1).

**Imports.** A portable module may import only `@mode(portable)` modules; any other import is `E_PORTABLE_IMPORT` (§3-3.2). The prelude is implicit. Of the standard library, the portable modules are `core.sensitivity` (§3-3.20) and, once it exists, `core.text`. A `host.scripted`, `host.dual`, `host.native` or `freestanding` module may import a portable module. A `web.scripted` or `web.compiled` module that imports one is `E_PORTABLE_IMPORTER` in v1: that is a lane limit, not a rule of the mode — PSTORE and the toolkit are not built on the Wasm lanes — and lifting it later narrows nothing, because the subset already holds in `web.compiled`.

**Lowered in the importer's mode.** A portable module has no lowering of its own. Imported by a `host.scripted` unit (and by `loup test`), it runs on that unit's interpreter; imported by a `host.native` unit, the managed native back end emits it; imported by a `host.dual` unit, it follows that unit's delivery path; imported by a `freestanding` unit, the freestanding back end emits it. Class construction follows the importing unit's model: ARC in the host modes, and in `freestanding` the storage the construction's owning declaration gives it (§1-8.1.1, CLSID-1). When two units in different modes import one portable module, each gets its own lowering. A portable module produces no artifact: `loup build` of a portable package alone checks it and produces nothing, and `loup run` of a portable file checks it and runs nothing (a portable module has no top-level statements and no `main()`).

**Compile-time keys.** An `if const` over `freestanding.*`, `options.*`, `build.*` or `target.*` (Vol 3 §3-3.21, "Reading these keys from source") is evaluated in the importing unit's build, so the branch selected can differ per importer. `freestanding.*`, `build.*` and `target.*` are the importing unit's keys; `options.*` is the portable module's OWN package's options, which the importing build sets (`--option <package>.<name>=<value>`, the root manifest's `[options."<package>"]`) or leaves at their declared defaults (§1-13.3, v1.21, v21.portable.13). Each branch is still inside the subset; "the same observable semantics" applies to the subset's features, not to the author's own `if const` choices.

**Integer overflow follows the importing unit.** This is the one stated exception to "the same observable semantics". Plain integer arithmetic in a portable module follows the IMPORTING unit's integer rules (§1-4.1.1, per mode: checked, `NumericOverflowError`, in `host.scripted`, `host.dual` and for `int` / `int64` in `host.native`; wrapping by default for the other widths in `host.native` and in `freestanding`) and that unit's overflow setting (`--overflow=trap`, §3-2.4.8; `[freestanding] overflow`, §3-3.21). Code whose result must not depend on the importer uses the explicit overflow methods (`wrappingAdd`, `checkedMul`, …), which are in the subset.

**`__execmode__`** reads `"portable"` in a portable module, whichever unit imports it (§1-2.2). Code that needs the importing build's facts reads `if const` keys instead.

**Storage (PSTORE).** The growable collections are outside the v1 subset. A portable module's storage is the owned `buffer[T, N]` field: a field of a `unique class` or of a struct, with `T` a portable type and `N` a compile-time constant. It has the value semantics of §3-3.17b: every copy copies the elements, and a default value's field is zeroed storage of its own. It is built on both interpreters, on the managed LLVM lanes of both toolchains and on the freestanding routes (§3-3.17b, "Owned buffer fields").

**Module scope.** A portable module holds declarations, module-level `let` constants and `const` bindings (a `const` is compile-time data, not module state; §1-6.2, ruling CONST-AGG-1, v1.21). A module-level `let` initialiser is a *constant initialiser*: a literal, a reference to another module-level `let` or to a function, an enum variant, a struct construction, a tuple, or a unary or binary operator, over constant initialisers. A `const` binding is evaluated at compile time (§1-6.2; its initialiser is the const evaluator's, `E_CONST_NOT_EVALUABLE` when it cannot be evaluated), so it is never load-time execution and the subset does not inspect its initialiser: `pub const N: int = f(2);` over a `const func f` is in the subset, `pub let n = f(2);` is not (v1.21, lead ruling L11). Sequential top-level statements, `main()` and module-level `var` are outside the subset (§1-2.6).

**The PORTABLE-SUBSET for features without a row in §1-2.6.**

| Feature | `portable` | Notes |
|---|---|---|
| Integer types, `bool`, `char` | ✓ | |
| `float`, `float32`, `float64`, float literals | ✗ | the subset builds under `no_float = true` |
| `bigint`, `decimal` | ✗ | `E_FREESTANDING_RUNTIME` in `freestanding` |
| Structs, enums with payloads, `match`, `Option`, `Result`, tuples of portable types | ✓ | *INTERIM within v1.21's development (lead ruling L10, 2026-11-04):* the freestanding routes refuse a tuple (construction, a tuple-returning function, a tuple pattern) with `E-BUILD-NATIVE` until row v21.portable.14 lowers tuples there as anonymous structs; Stage0's route built one static block per site, so two live tuples of one site aliased |
| Generics over portable types; interfaces as generic bounds; operator methods on structs (§1-3.7) | ✓ | |
| Interface-typed values (a binding, parameter, field or result whose type is an interface) | ✗ (v1) | dispatch by `enum` + `match`, or by function values |
| Function values and closures | ✓ | |
| `string` read-only: literals, parameters, `length()` / `len()`, `byteLength()`, `byteAt(i)`, `scalarAt(i)` (§1-4.1.5), `==` and the ordering operators, `compareTo`; `char`'s `toInt()` | ✓ | (v1.21, row v21.portable.11) `scalarAt` is O(i) on UTF-8 storage; a byte-oriented reader (the UI core's text input) reads bytes |
| `for` over a `string` | ✗ | (v1.21, row v21.portable.11) its element is a one-character `string` in the host modes and a byte in `freestanding` (§1-4.1.5), so the loop variable's type would differ by importer, as `del`'s behaviour does |
| Every other `string` operation: concatenation, interpolation, `format`, and every other method (`startsWith`, `charAt`, `isEmpty`, `slice`, …) | ✗ | the allocating ones need ARC in the host modes and an allocator in `freestanding`; the other read methods are not lowered on the freestanding routes |
| `list`, `dict`, `set` (types and literals) | ✗ (v1) | no normative freestanding semantics for growable collections (§3-3.17b); use PSTORE |
| `buffer[T, N]` local, struct field, `unique class` field | ✓ | PSTORE |
| `buffer[T, N] = addr` (overlay) | ✗ | a portable module holds no address |
| Module-level `let` with a constant initialiser | ✓ | |
| `const` bindings, struct and enum constants included (§1-6.2) | ✓ | compile-time data, not module state (ruling CONST-AGG-1, v1.21) |
| Module-level `var` | ✗ | a freestanding unit that hosts threads zeroes module globals per thread; state lives in values the importer owns |
| `defer` (§1-6.5), `with` over `Scoped[T]` (§1-6.6) | ✓ | `AsyncScoped[T]` is ✗ (no async in `freestanding`) |
| `del` (§1-6.11) | ✗ | its behaviour differs by mode |
| `as` / `as?` to a concrete type (§1-4.3), type aliases (§1-4.6), re-exports (§1-13.2) | ✓ | |
| `__module__` (§1-2.3) | ✗ (v1) | |
| `@unsafe`, `@interchange` | ✗ | |
| `DesktopGrant` | ✗ | `freestanding` and `web.compiled` have none |
| `runtime` (the runtime root object, §2-5.1) — every member, not only the rows of §1-2.6 | ✗ | `freestanding` has no `runtime`; reach the host through values the importer passes in |
| `consume` (§1-8.11) | ✗ | ARC-only (`host.native`, `host.dual`) |
| `box` expressions | ✗ | `E_BOX_IN_FREESTANDING` in `freestanding` |

**Mode name.** `portable` is a bare identifier, like `freestanding` (§1-2.5.1). A manifest's `[build] mode` or `[modes]` entry may say `"portable"` (§1-13.9).

---

## §1-2.5 File Mode Declarations

*(This section is normative.)*

### §1-2.5.1 The `@mode` Directive

Every Loup source file carries an explicit or implicit mode declaration. The `@mode` directive MUST appear as the first non-comment, non-blank token:

```loup
@mode(web.scripted)      # browser JIT
@mode(web.compiled)      # browser AOT
@mode(host.scripted)     # host JIT (default for host targets)
@mode(host.dual)         # host hybrid — either JIT or AOT
@mode(host.native)       # host AOT native binary
@mode(freestanding)      # bare-metal; no runtime
@mode(portable)          # a library compiled in each importer's mode (§1-2.4.7)
```

**Syntax.** The argument to `@mode` is a dotted identifier path: `family.subfamily` where `family ∈ {web, host}` and `subfamily ∈ {scripted, compiled, dual, native}`, or the bare identifiers `freestanding` and `portable`. The dotted form parses identically to namespace paths (§1-19.3) — no new lexical rules are required.

**Rules:**

- `@mode` must be the first active token in the file; later placement is `E_MODE_POSITION`.
- Only one `@mode` per file; duplicates are `E_MODE_DUPLICATE`.
- Unrecognized mode names produce `E_MODE_UNKNOWN`, at the directive, on every lane. A manifest's `[build] mode`, `[modes]` entry or dependency `mode` that names no mode is `E_MODE_UNKNOWN` as well (§1-13.9).
- Files without an explicit `@mode` inherit the project-level default (§1-2.5.2). In the absence of a project default, the implicit mode is `@mode(host.scripted)`.

*Compiler's rule (`@mode` position).* Comments are not tokens, so any number of comment lines (`#`, `##`, block comments) may precede `@mode`; the module directive `@compiled` may also precede it. Any other token before `@mode` — an `import`, a `namespace`, a declaration, another annotation — is `E_MODE_POSITION`, reported at the `@mode` directive on every lane (a late `@mode` was otherwise not the module's mode: one lane fell back to `host.scripted` while another honoured it). A second `@mode` in the file is `E_MODE_DUPLICATE` at the second directive. Both are parse-time errors, so an imported module's misplaced `@mode` is reported against that module.

**Family matching.** Linters and tooling may pattern-match mode families using the dotted form:

- `@mode(web.*)` — all web-environment modes
- `@mode(host.*)` — all host-environment modes
- `@mode(*.scripted)` — all JIT-delivered modes

Family-based lint rules apply uniformly within a family (for example, the no-host-capabilities rule fires on all `@mode(web.*)` files regardless of JIT vs AOT).

### §1-2.5.2 Mode and Build Target Consistency

| `@mode` | Compatible `--target` | Delivery |
|---|---|---|
| `@mode(web.scripted)` | `browser` | Source + JIT at load time |
| `@mode(web.compiled)` | `browser`, `wasm` | AOT-compiled Wasm module |
| `@mode(host.scripted)` | `node`, `bun`, `deno`, `cli` | Source + JIT at `loup run` |
| `@mode(host.dual)` | `node`, `bun`, `deno`, `cli`, `service`, `desktop`, `native` | Either JIT or AOT native |
| `@mode(host.native)` | `native`, `cli`, `service`, `desktop` | AOT native binary |
| `@mode(freestanding)` | `freestanding` | AOT native binary, no runtime |
| `@mode(portable)` | every target an importer builds for, except `browser` and `wasm` in v1 (`E_PORTABLE_IMPORTER`) | none of its own: compiled into each importing unit (§1-2.4.7) |

A mismatch between file `@mode` and `--target` is `E_MODE_TARGET_MISMATCH`.

**Note on host targets.** The `cli`, `service`, and `desktop` build targets accept `@mode(host.scripted)`, `@mode(host.dual)`, or `@mode(host.native)`. Mixed-mode projects where script files import native modules use the script/native interop boundary (§3-2.5) — the boundary is transparent to source code; import transparency is a design principle (§1-2).

**Project-wide mode.** A `.lppkg` manifest may declare `mode = "web.scripted"` (or another mode string) in its `[build]` table. All files without an explicit `@mode` inherit the project mode. When no project mode is declared, the implicit mode is `host.scripted`.

### §1-2.5.3 Tooling Semantics

Tools MUST use the `@mode` declaration to determine:

- **Syntax highlighting profile.** `freestanding` enables `asm`, `@interrupt`, `volatile`, etc. `host.native` and `host.dual` enable `weak`, `arc let`, `@signalSafe`; `host.native` also enables `volatile`. All modes except `freestanding` enable template fences, the ownership verb system, and compile-time ownership keywords (`borrow`, `unique`, `lifetime ~name`, etc.). `host.*` modes enable host-capability APIs; `web.*` modes do not.
- **Lint rule set.** Per-mode and per-family lint rules are enforced. `freestanding` adds hardware-safety lints (`no-float-in-freestanding`). `web.*` adds no-host-capability lints. AOT modes add `W_ANY_IN_AOT_MODE` advisory.
- **Completion menus.** Only features available in the file's declared mode appear in completion suggestions.
- **Error display.** Errors referencing features unavailable in the current mode include the mode name and the mode(s) that would permit the feature.

### §1-2.5.4 Mode-Related Error Codes

*(This subsection catalogs error codes introduced by the seven-mode system. The complete error catalog appears in §1-18.)*

| Code | Severity | Condition |
|---|---|---|
| `E_MODE_POSITION` | error | `@mode` directive appears after other non-comment tokens |
| `E_MODE_DUPLICATE` | error | Multiple `@mode` directives in a single file |
| `E_MODE_UNKNOWN` | error | Unrecognized mode name (not one of the seven), in an `@mode` directive or a manifest mode entry |
| `E_MODE_TARGET_MISMATCH` | error | File `@mode` is incompatible with the build `--target` (§1-2.5.2) |
| `E_MAIN_GUARD_NOT_APPLICABLE` | error | `__name__ == "__main__"` guard used in a mode other than `host.scripted` — web modes have no direct-execution disposition; AOT modes prohibit top-level control flow |
| `E_TOPLEVEL_CONTROL_AOT` | error | `if`, `while`, `for`, `match`, or expression statement at file top level in `host.dual`, `host.native`, `web.compiled`, or `freestanding` — these modes have no sequential top-level execution model |
| `E_MAIN_SIGNATURE` | error | A module-level `main` in `host.dual`, `host.native`, `web.compiled`, or `freestanding` declares parameters, or returns something other than `void` / `int` (`Task[void]` / `Task[int]` for an `async main`); arguments come from `runtime.args()` (ruling MAIN-1) |
| `E_CAPABILITY_NOT_WEB` | error | Host-environment API (`runtime.fs`, `runtime.proc`, `runtime.net` host variants, `ThreadLocal[T]`) used in a `@mode(web.*)` file |
| `E_NATIVE_ONLY_IN_DUAL` | error | Feature that cannot round-trip JIT↔AOT (`asm { }`, `native.simd`, `@vectorize`, raw memory APIs) used in `@mode(host.dual)`; use `host.native` instead |
| `E_PORTABLE_FEATURE` | error | A `@mode(portable)` module uses a feature outside the PORTABLE-SUBSET (the `portable` column of §1-2.6, or §1-2.4.7's table); the message names the feature's row. Raised whoever imports the module |
| `E_PORTABLE_IMPORT` | error | A `@mode(portable)` module imports a module that is not `@mode(portable)` — a user module, a package module or a standard-library module outside §1-2.4.7's list (§3-3.2) |
| `E_PORTABLE_IMPORTER` | error | A `@mode(web.scripted)` or `@mode(web.compiled)` module imports a `@mode(portable)` module. A v1 lane limit, not a rule of the mode: PSTORE and the toolkit are not built on the Wasm lanes (§1-2.4.7) |
| `W_ANY_IN_AOT_MODE` | warning | `Any`, `dynamic class`, or `core.inspect` used in an AOT mode (`web.compiled`, `host.dual`, `host.native`) — generates tagged-dispatch code with runtime cost. Advisory only; promote with `--warnings-as-errors=W_ANY_IN_AOT_MODE` |

Error codes specific to a single mode are cataloged in that mode's specification section: §3-1 (web modes), §3-2 (host modes), §3-3.22 (freestanding).

---

## §1-2.6 Mode Feature Matrix

*(This section is normative with respect to feature availability.)*

Column key: **w.s** = `web.scripted`, **w.c** = `web.compiled`, **h.s** = `host.scripted`, **h.d** = `host.dual`, **h.n** = `host.native`, **fs** = `freestanding`, **pt** = `portable`.

**The `portable` column and the six-mode statements.** The **pt** column is the PORTABLE-SUBSET (§1-2.4.7): a feature is ✓ there only if it is ✓ (not ⚠) in h.s, h.d, h.n, fs and w.c, behaves the same in all five, and builds under `no_float = true`. A statement elsewhere in the volumes that a feature is available "in all six modes" covers the six non-portable modes; in a `@mode(portable)` module a feature is available exactly when the **pt** column marks it ✓, or, for a feature without a row here, when §1-2.4.7's table does. A ✗ in **pt** is `E_PORTABLE_FEATURE`, whichever unit imports the module.

| Feature | w.s | w.c | h.s | h.d | h.n | fs | pt |
|---|---|---|---|---|---|---|---|
| Dynamic typing (`Any`, untyped params) | ✓ | ⚠ | ✓ | ⚠ | ⚠ | ✗ | ✗ |
| `dynamic class` | ✓ | ⚠ | ✓ | ⚠ | ⚠ | ✗ | ✗ |
| `core.inspect` (live type registry) | ✓ | ⚠ | ✓ | ⚠ | ⚠ | ✗ | ✗ |
| Runtime memory management | ARC¹ | ARC¹ | ARC¹ | ARC¹ | ARC | manual (`@allocator`) | importer's |
| `local class` (default `class`) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ (≠)¹⁴ |
| `shared class` (cross-thread, cross-mode) | ✓ | ✓ | ✓ | ✓ | ✓ | ⚠² | ✗ |
| `SharedRef[T]` / `SharedBuffer[T]` / `SharedArray[T]` | ✓ | ✓ | ✓ | ✓ | ✓ | ⚠² | ✗ |
| `core.atomic` operations | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ (subset) | ✗ |
| `SharedMutex[T]` / `SharedRwLock[T]` / `SharedQueue[T]` | ✓ | ✓ | ✓ | ✓ | ✓ | ⚠² | ✗ |
| `Serializable` / `Deserializable` (§4-1) | ✓ | ✓ | ✓ | ✓ | ✓ | ⚠³ | ✗ |
| `@polymorphic` / `@tagged` / `sealed` | ✓ | ✓ | ✓ | ✓ | ✓ | ⚠³ | ✗ |
| `@serialField` / `@alias` / `@skip` / `@sensitive` | ✓ | ✓ | ✓ | ✓ | ✓ | ⚠³ | ✗ |
| `@serializationId` / `@migrateFrom` | ✓ | ✓ | ✓ | ✓ | ✓ | ⚠³ | ✗ |
| `core.serialization.Value` | ✓ | ✓ | ✓ | ✓ | ✓ | ⚠³ | ✗ |
| `RemoteException` / Exception serialization | ✓ | ✓ | ✓ | ✓ | ✓ | ✗⁴ | ✗ |
| `arc let` / `arc var` (advisory pinning) | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ |
| `weak` references¹ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ |
| `unique let` / `unique var` / `unique class` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `borrow` / `excl borrow` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `borrow[~name]` / `lifetime ~name` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `noescape fn` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `unowned[~name]` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `MaybeUninit[T]` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |
| `reinterpret[T, U]` / `reinterpretChecked[T, U]` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |
| `PartialInit[T]` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |
| `reads` / `edits` / `takes` / `shares` verbs | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `modifier` method keyword | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ (required on `synchronized`-class guarded methods — §3-2.4.13) | ✓ |
| `safe {}` / `safe func` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `synchronized` class | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ (reduced per-class CAS model; `attachLock` for per-instance locks — §3-2.4.13) | ✗ (≠) |
| `distinct()` in `requires` clause | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `atomic {}` block | ✓ | ✓ | ✓ | ✓ | ✗ (use `synchronized`/`Mutex`) | ✗ (use `InterruptGuard`) | ✗ |
| `async` / `await` | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ |
| `throw` / `try` / `catch` | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ |
| Template fences | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ |
| Reactive UI (`ui.*`) | ✓ (`ui.web`)¹³ | ✓ (`ui.web`)¹³ | ✓ (`ui.desktop`)¹³ | ✓ (`ui.desktop`)¹³ | ✓ (`ui.desktop`)¹³ | ✗¹³ | ✗¹³ |
| `@webcomponent` / Web Components | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| `core.reflect` | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ |
| `runtime.compile` (dynamic JIT) | ✓ | ✓ | ✓ | ✓ | ✓ (embedded JIT) | ✗ | ✗ |
| `runtime.fs` / `runtime.proc` / `runtime.net` (host) | ✗ | ✗ | ✓ | ✓ | ✓ | ✗ | ✗ |
| `from X defer import` (deferred type stubs) | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ |
| Sequential top-level execution | ✗ | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ |
| `__name__ == "__main__"` guard | ✗ | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ |
| `main()` entry-point convention | ✗ | ✗ | ✗ | ✓ | ✓ | ✗ | ✗ |
| `@entry` annotation | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ |
| `asm { }` inline assembly | ✗ | ✓ (Wasm, `@unsafe`) | ✗ | ✗ | ✓ (native, `@unsafe`) | ✓ | ✗ |
| `volatile` / `Volatile[T]` | ✗ | ✗ | ✗ | ✗ | ✓ (LLVM backend) | ✓ | ✗ |
| `@interrupt` / `@naked` / `@callconv` | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ |
| `@entry` / `@panic_handler` | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ |
| `@allocator` / `@deallocator` | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ |
| `@scheduler` — user-supplied scheduler for `for concurrent` (§3-3.16a) | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ |
| `@repr` / `@align` / `@section` | ✗ | Wasm subset | ✗ | ✗ | ✗ | ✓ | ✗ |
| Overflow arithmetic methods | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `--overflow=trap` flag | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ | importer's |
| `Sendable` interface | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `for`-loop implicit borrow guard | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `gen func` (synchronous generators) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ (needs `@allocator`) | ✗ |
| `async gen func` (async generators) | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ |
| Macros (`macro` / `pub macro` / `name!(args)`) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `@interruptSafe` annotation | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ |
| `InterruptGuard` — interrupt-masking scope | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ |
| `PinnedRef[T]` — ARC-pinned FFI lifetime anchor | ✗ | ✗ | ✗ | ✓ | ✓ | ✗ | ✗ |
| `NativeHandle` / `OwnedHandle` / `BorrowedHandle` | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ | ✗ |
| `@lockOrder(n)` — lock ordering annotation | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ | ✗ |
| `DmaBuffer[T]` — ownership-mapped DMA | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ |
| `native.atomic.hwFence(order)` — hardware barrier | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ | ✗ |
| `native.mpu` — MPU stack-guard API | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ |
| `native.dma` — DMA ownership API | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ |
| `native.simd` / `Vec[T, N]` / `@vectorize` | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ | ✗ |
| `native.mem.alloc` / `native.mem.free` | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ | ✗ |
| `ThreadLocal[T]` | ✗ | ✗ | ✗ | ✓ | ✓ | ✗ | ✗ |
| `Thread` / `ThreadPool` | ✗ | ✗ | ✗ | ✓ | ✓ | ✗ | ✗ |
| `portal` statements | ✓ (`--debug`) | ✓ (`--debug`) | ✓ (`--debug`) | ✓ (`--debug`) | ✓ (`--debug`) | ✓ (`--debug` + channel) | ✗ (≠) |
| Freestanding debug service (§3-3.25) | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ |
| Recording and replay (§2-5.3 time-travel protocol; specified 2026-11-09, pending implementation — feature spec `2-runtime-4-time-travel`, roadmap `docs/loup-ttd-mcp-agent-roadmap.md`) | ✓ | ✓ | ✓ (armed by default; captures on activated portals) | ✓ | ✓ (`--record`) | ✗ (subset: next row and `debug.recording`) | ✗ |
| On-target time-travel ring (§3-3.25.9) | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ (`--debug` + enabled) | ✗ |
| `@debug_control_channel` / `@debug_trace_channel` | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ |
| `--stack-size N` build flag | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ (via `.lppkg`) | importer's |
| `@signalSafe` annotation | ✗ | ✗ | ✗ | ✓ | ✓ | ✗ | ✗ |
| `extern native` — C FFI declarations | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ | ✗ |
| `portal_ring_size` — time-travel ring buffer | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ (`--debug`) | ✗ |
| `spawnBlocking` | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ |
| `ScriptWorker` / `WorkerChannel[T]` | ✓ | ✓ | ✓ | ✓ | ✓ (embedded Wasm) | ✗ | ✗ |
| Work-stealing multi-threaded executor | ✗ | ✗ | ✗ | ✓ | ✓ | ✗ | ✗ |
| `complex32` / `complex64` — basic arithmetic (`+`, `-`, `*`, `/`, `==`, `re()`, `im()`, `conj()`, `norm()`) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |
| Complex transcendental functions (`abs`, `arg`, `polar`, `fromPolar`, `core.complex` `cexp`/`clog`/`csqrt`/trig/hyperbolic) | ✓ | ✓ | ✓ | ✓ | ✓ | ⚠⁵ | ✗ |
| `array[T, rank]` (§1-4.10) — multi-dimensional array primitive | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |
| Array section expressions (§1-5.9) — `a[1:5, :, 2:8:2]` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |
| `for concurrent` (§2-1.11) — sequential strategy (default) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |
| `for concurrent` `@strategy(simd)` | ✗ | ✓ | ✗ | ✓ | ✓ | ✓ | ✗ |
| `for concurrent` `@strategy(threadPool)` | ✗ | ⚠⁶ | ✗ | ✓ | ✓ | ⚠⁷ | ✗ |
| `for concurrent` `@strategy(accelerator)` | ✗ | ⚠⁸ | ✗ | ⚠⁸ | ⚠⁸ | ✗ | ✗ |
| `core.fpenv.withRounding` (§1-4.1.7) | ⚠⁹ | ⚠⁹ | ⚠⁹ | ✓ | ✓ | ✓ | ✗ |
| `core.fpenv` exception flags / signaling NaN (§1-4.1.7) | ⚠⁹ | ⚠⁹ | ⚠⁹ | ✓ | ✓ | ✓ | ✗ |
| `attempt` (§1-5.10) — `Result` unwrap into a `catch Err` arm | ✓ | ✓ | ✓ | ✓ | ✓ | ✓¹¹ | ✓ |
| `const func` / const evaluation (§1-7.1) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `if const` (§1-6.3) — compile-time branch selection | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `[options]` build options (§1-13.3), read as `options.*` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Error return traces (§1-5.7) | ✓¹² | ✓¹² | ✓¹² | ✓¹² | ✓¹² | ✓¹² | ✓¹² |
| `noreturn` return type (§1-4.4a) | ✓¹⁰ | ✓¹⁰ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `unreachable` expression (§1-5.11) — traps in every profile | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `impossible` type argument (§1-4.4b) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

**Legend:**

- ✓ — Feature is available.
- ✗ — Feature is not available; use is a compile-time error.
- ⚠ — Feature is available but produces the `W_ANY_IN_AOT_MODE` lint advisory (AOT modes generate tagged-dispatch code with runtime cost).
- ✗ (≠) — in **pt** only: the feature is ✓ in the five importing modes but behaves differently between them, so it is outside the PORTABLE-SUBSET.
- importer's — in **pt** only: decided by the importing unit's mode or build (§1-2.4.7).

**Footnotes:**

1. **ARC memory model.** All modes present the ARC-equivalent observable contract described in §1-8.1.1 for `local class` and `shared class`. Scripted and web modes are permitted to back `local class` with Wasm GC as an implementation optimization; see §1-8.1.1.1 for the non-normative implementation allowance. `shared class` and `SharedRef[T]` always use atomic reference counting regardless of mode.

2. **Freestanding shared-memory features.** In `@mode(freestanding)`, `shared class` and `SharedRef[T]` are available only when the target provides a `@allocator`-backed arena satisfying the shared-arena header contract (§2-2.5). Targets without multi-core coherent memory or without an arena implementation produce `E_SHARED_ALLOCATOR_UNAVAILABLE` at the first `shared` allocation site. Atomic operations are always available but map to target-specific instructions (see §2-2.4).

3. **Freestanding serialization features.** In `@mode(freestanding)`, the serialization trait surface is available but depends on an allocator for dynamically-sized `Value` content (`List`, `Map`, `String`, `Bytes`). Targets without a heap-capable `@allocator` may implement a restricted serialization subset limited to fixed-layout primitives and enums; wire-format packages declare their allocator requirements in `.lppkg`.

4. **No `RemoteException` in freestanding.** Freestanding targets have no `BaseException` hierarchy (exceptions are unavailable per §1-2.6 row for `throw`/`try`/`catch`); consequently no `RemoteException` is meaningful. Freestanding code that receives serialized exception data through a communication channel must handle exception-typed payloads explicitly at the application layer.

5. **Complex transcendentals in freestanding.** Functions that internally require `sqrt`, `log`, `exp`, `sin`, `cos`, `tan`, or their inverses (and any complex method that depends on them — `abs`, `arg`, `polar`, `fromPolar`, plus the entire `core.complex` transcendental family) require a math runtime that is not linked in `@mode(freestanding)` by default. Calling them without an explicitly-linked math runtime is `E_FREESTANDING_COMPLEX_TRANSCENDENTAL`. The freestanding build supports linking `libm`-equivalent implementations via `extern native`. Bare arithmetic (`+`, `-`, `*`, `/`, `==`, `re()`, `im()`, `conj()`, `norm()`) does not require a math runtime and is unconditionally available.

6. **`for concurrent` thread-pool strategy in `web.compiled`.** The `@strategy(threadPool)` annotation requires the host browser environment to provide Wasm threads. When unavailable, applying the annotation is `E_FOR_CONCURRENT_STRATEGY_NOT_AVAILABLE`. Without the annotation, `web.compiled` `for concurrent` falls back to sequential execution on the main JS thread.

7. **`for concurrent` thread-pool strategy in `freestanding`.** Freestanding targets have no built-in thread pool. `@strategy(threadPool)` requires a user-supplied scheduler registered via `@scheduler` (§3-3.16a); without one, applying the annotation is `E_FOR_CONCURRENT_STRATEGY_NOT_AVAILABLE`.

8. **`for concurrent` accelerator strategy.** `@strategy(accelerator)` requires the body to be expressible as an accelerator kernel and the array values to be bound to a HAL device (§21.32) or be `loup.tensor.Tensor` values. Available in modes where HAL is available (`web.compiled`, `host.dual`, `host.native`); unavailable in scripted modes (no AOT-compiled kernel pipeline) and in freestanding (no HAL surface). Where unavailable, `E_FOR_CONCURRENT_STRATEGY_NOT_AVAILABLE`.

9. **`core.fpenv` in scripted/JIT modes.** The JIT and Wasm runtimes do not expose the host floating-point control word; the API surface is provided as a no-op so portable code may use it without conditional compilation. `withRounding` runs the body unchanged, exception flag queries always report empty, and `signalingNan[T]()` returns a quiet NaN. Code requiring deterministic non-default rounding behavior must compile to `host.native`, `host.dual`, or `freestanding`.

10. **`noreturn` in Wasm-targeting modes.** `noreturn` is a front-end construct with no representation in the Wasm value-type space — the specification's `bot` exists only in validation and is not a representable value type. In `@mode(web.scripted)` and `@mode(web.compiled)` it is therefore checked and then **erased before codegen**; an implementer should not look for a lowering. The checks it drives (`E_NORETURN_FALLTHROUGH`, `E_NORETURN_RETURNS`, `E_NORETURN_POSITION`, `E_NORETURN_UNREACHABLE_CODE`) apply unchanged in those modes, which is why the row reads ✓ rather than ⚠.

11. **`attempt` in freestanding.** `attempt` requires an enclosing `try` block with a `catch Err` arm, and the row above for `throw`/`try`/`catch` reads ✗ for freestanding — so this row looks like a contradiction and is not one. A `catch Err` arm handles a `Result`; it is not exception machinery, and `attempt` compiles in `@mode(freestanding)` on both compiler lanes (measured 2026-09-09). What remains unavailable there is the *exception* form: `throw` and `catch (Exception as e)` are `E_FREESTANDING_EXCEPTIONS` exactly as before. The two constructs share the `try` keyword and nothing else.

12. **Error return traces are governed by their own switch.** Availability here means the facility exists in the mode, not that every build carries it. Capture is enabled by an independent build switch — not by portal enablement, though it reuses the portal substrate for storage and egress — and a build that captures nothing carries none of the machinery, which is what makes traces admissible in a release-shaped freestanding image. The freestanding store is `error_trace_depth` slots (§3-3.21), default 16. See §1-5.7.

13. **Reactive UI (v1.21, §2-4).** `ui.*` is the stdlib alias of the `loup.ui` packages (§2-4). In the web modes `ui.web` is deferred with the browser host (§2-4.7) and is not part of v1 conformance. In the host modes `ui.desktop` is `loup.ui.desktop` over the UI backends (§2-4.8), and a desktop backend needs the permission `"ui.desktop"` (§2-5.1). The ✗ for freestanding covers the alias and `runtime.ui` (`E_FREESTANDING_UI`, §3-3.3). The Loup Common UI packages are `@mode(portable)` modules (§1-2.4.7) and a freestanding unit imports them like any portable module (ruling FS-UI). The **pt** ✗ is for the same alias: a portable module imports the `loup.ui` packages themselves.

14. **`local class` in a portable module.** A `local class` instance is reference-counted in the host modes, so it lives while any reference does; in `freestanding` it lives in the storage its owning declaration gave it (§1-8.1.1, CLSID-1), so its life ends with that declaration's. The same program would observe different lifetimes. Portable code uses `unique class`, which has a single owner on every lane.

---

## §1-3 Lexical Structure

*(This section is normative.)*

### §1-3.1 Source Encoding

All Loup source files SHALL be encoded in UTF-8. A byte order mark (BOM) at the start of a file is permitted but not required; if present, it is ignored. Source files that are not valid UTF-8 produce a compile-time error (`E_INVALID_UTF8`).

| Code | Mode | Condition |
|---|---|---|
| `E_INVALID_UTF8` | All | Source file contains byte sequences that are not valid UTF-8 |

### §1-3.2 Comments

Loup supports three comment forms:

**Single-line comments** begin with `#` and extend to the end of the line:

```
let x = 42;  # this is a comment
```

`//` is NOT a comment: it is the floor-division operator (§1-3.7). A `#` on
the first line of a file that starts `#!` is the Unix shebang (§1-20.2), which
is simply a comment under this rule.

**Multi-line comments** are delimited by `/*` and `*/`. Multi-line comments do NOT nest — the first `*/` encountered closes the comment:

```
/* This is a
   multi-line comment */
```

**Doc comments** begin with `##` and extend to the end of the line. Doc comments are attached to the immediately following declaration and are accessible via reflection:

```
## Computes the factorial of n.
## Returns 1 for n <= 1.
func factorial(n: int): int {
  if (n <= 1) { return 1; }
  return n * factorial(n - 1);
}
```

Comments are lexically transparent: for any valid Loup program, removing all comments SHALL produce an AST identical to the original program's AST. Comments do not affect parsing, type-checking, or execution.

**Reserved character: `\`.** Outside a string, char, or template literal the backslash is a reserved lexical character. It has no meaning in v1.20 — it is NOT a line-continuation marker (continuation is automatic, §1-3.3) and does not introduce an escape in identifiers or comments — and the lexer SHALL reject it as an invalid character. The character is reserved for a future *operator-escaping* form (spelling new operators), so no other v1.x extension may assign it a different meaning. A comment line ending in `\` does NOT continue onto the next line.

### §1-3.3 Statement Termination

Loup uses **newline-terminated statements**. A statement ends at the newline following its last token. An explicit semicolon (`;`) may be written at the end of any simple statement for style or compatibility but is not required:

```loup
let x = 42       # valid — newline terminates
let y = 43;      # also valid — explicit semicolon
```

The reference formatter (§1-20.4) preserves semicolons as written. Block statements (those ending in `}`) never take a trailing semicolon.

**Continuation lines.** An expression that ends with a binary operator, open bracket, or comma automatically continues on the next line without a statement boundary:

```loup
let total = a +
            b        # continuation — no new statement here
```

### §1-3.4 Keywords

The following identifiers are keywords and SHALL NOT be used as variable, function, type, or module names:

```
abstract   and        as         async      attempt    await      bnot       borrow
break      catch      class      const      continue   defer      del
do         dynamic    else       enum       extern     false
final      finally    fn         for        from       func       gen
global     if         implements import     in
instanceof interface  is         let        lifetime   macro      match      new
namespace  noescape   nonlocal   not        onstack    or         override
portal     prefer     pub        return     sealed     static     super
struct     suspend    throw      true       try        type       Self
this       typeof     unique     var        volatile   where      while      with       yield      consume
reads      edits      takes      shares     modifier   safe
synchronized unsafe   requires   atomic
unreachable
```

`this` and `unsafe` are reserved like every word above although neither is lexed as a keyword: `this` is the implicit receiver (a binding named `this` would shadow it), and `unsafe` opens the `unsafe("…") { }` region (a function or binding named `unsafe` would be ambiguous at the start of a statement). `none` is NOT reserved: it has no grammatical role (`None` is the `Option` constructor, §1-9.3), so it is an ordinary identifier. `arc`, `operator`, `noreturn` and `impossible` are contextual (below). (Ruling RESWORD-1, loup#889.)

**Contextual keywords.** The following identifiers have special meaning only in specific syntactic positions and may be used as ordinary identifiers elsewhere:

- `self` — contextual in closure capture lists (`[weak self]`, `[unowned self]`) as an alias for the enclosing method's implicit `this` receiver; also valid as an ordinary identifier (e.g., first parameter name in UFCS-style functions: `func map(self: Iterable[T], ...)`)
- `get` — contextual as a property-getter declaration keyword (`get propName(): T { ... }`, §1-7.7); valid as an ordinary identifier (e.g., method name `func get(key: K): V`) in all other positions
- `set` — contextual as a property-setter declaration keyword (`set propName(v: T) { ... }`, §1-7.7); valid as an ordinary identifier (e.g., method name `func set(value: T): void`) in all other positions
- `quote` — contextual as the macro body keyword (`macro name(p) { quote { ... } }`, §1-17, §1-19.11); valid as an ordinary identifier elsewhere
- `box` — contextual in prefix expression position (`box expr`); makes widening to `Any` explicit. Permitted in all modes except `@mode(freestanding)`, where it is `E_BOX_IN_FREESTANDING`; in `@mode(web.compiled)`, `@mode(host.dual)`, and `@mode(host.native)` it emits the `W_ANY_IN_AOT_MODE` advisory. Valid as an identifier elsewhere.
- `group` — contextual in `await group { ... }`
- `once` — contextual in debug activation requests
- `distinct` — contextual in `requires distinct(...)` clauses and call-site contract acknowledgments (§3-2.4.10)
- `excl` — contextual immediately before `borrow` in parameter declarations (`excl borrow param: StructType`); see §3-2.4.1.1
- `concurrent` — contextual immediately after `for` to introduce the parallel-iteration form (`for concurrent (let i in 0..n) { ... }`); see §2-1.11. Reserved only in this position and may be used as an ordinary identifier elsewhere (preserving backward source compatibility with code that uses `concurrent` as a variable name)
- `compiled`, `native`, `scripted`, `dual`, `freestanding` — contextual in `@mode(X)` directives and `prefer compiled` import clauses; valid identifiers elsewhere
- `reinterpret` — contextual in `reinterpret[T, U](expr)` expressions; available in all modes (§1-2.6); requires `@unsafe` (§3-3.18)
- `reinterpretChecked` — contextual in `reinterpretChecked[T, U](expr)` expressions; available in all modes (§1-2.6); no `@unsafe` required; returns `Result[U, AlignmentError]` (§3-3.18)
- `size_of` — contextual in `size_of[T]()` expressions; `@mode(host.native)` and `@mode(freestanding)` (§3-3.4.1)
- `align_of` — contextual in `align_of[T]()` expressions; `@mode(host.native)` and `@mode(freestanding)` (§3-3.4.1)
- `from` — although `from` is a hard keyword (used in import statements §1-13.1 and `throw ... from ...` chaining §1-6.9), it is additionally permitted as a **method name** in method-declaration headers and in method-call position after `.` (e.g., `static func from(err: E): Self` declarations and `F.from(e)` calls on the `From[E]` interface, §1-11.2). This carve-out is limited to method-name position only; `from` remains reserved as a field name, variable name, parameter name, type name, or module name.
- `arc` — contextual immediately before `let` / `var` as the explicit ARC ownership binding qualifier (`arc let x = …`, §1-6.2, §3-2.4.8); valid as an ordinary identifier elsewhere
- `operator` — contextual immediately before `func` (or `modifier func`) as the operator-overload method qualifier (`operator func +(…)`, §1-7.7, §1-11.2); valid as an ordinary identifier elsewhere, a method name included
- `noreturn`, `impossible` — the built-in return-type marker and uninhabited type (below, §1-4.4a, §1-4.4b). Because they name built-in types, neither may name a TYPE — a class, struct, enum, interface or type alias — or a type parameter (that would shadow the built-in); that is the reserved-word error below. Both remain valid value, binding, parameter, field, function and method names (`var noreturn = 3`, a factory method `Type.noreturn()`)
- `spawn` — contextual as the task-spawn keyword in primary-expression position only (`spawn Expr`, §2-1.2; grammar `SpawnExpr` §1-19.5). It is additionally permitted as a **method name** in method-declaration headers (`func spawn(): T`), as a **class or struct field name**, and in method-call position after `.` (`obj.spawn()`). Mirroring the `from` carve-out, this is limited to those positions; `spawn` remains reserved in primary-expression position, so it may not be used as a variable name, parameter name, type name, or module name.

*Compiler's rule (a reserved word as a name).* A reserved word written where a declaration introduces a name — a parameter (of a function, method, constructor, lambda or macro), a function or method name, a type name (class, struct, interface, enum, type alias), a type parameter, a field (class, struct, enum payload), an enum variant, a macro name, an import alias, or a binding (`let` / `var`, destructuring, `for`-in, `catch`, `with`, and a `match` pattern binding for `this` / `unsafe`) — is ONE error at the word on every lane; so is `noreturn` or `impossible` as a type name or a type parameter: "`<word>` is a reserved word (§1-3.4) and cannot name a <position>", with the note "rename the <position> — e.g. `<word>_value`". The parser keeps the word as the name and parses on, so the rest of the declaration is checked normally (a reserved parameter name used to cascade into half a dozen unrelated parse errors on one lane, and the other lane accepted it in every position but a binding). The contextual carve-outs above stay legal in their positions (`self`, `get`, `set`, `modifier` as parameter names; `from`, `get`, `set`, `modifier`, `spawn`, `new`, `template` as method names; `Some` / `None` as variant names).

**Dunder identifiers.** Identifiers beginning and ending with double underscores (`__name__`, `__file__`, `__execmode__`) are reserved for language-defined module introspection variables. User code SHALL NOT declare bindings with dunder names.

**`borrow`** is a parameter modifier keyword and field qualifier keyword. It is permitted in all execution modes (§1-2.6). See §3-2.4.1.

**`lifetime`** is a lifetime-parameter keyword. It is used only in the `[...]` generic-parameter brackets of functions, structs, enums, and interfaces to declare a named region. `lifetime` is permitted in all execution modes (§1-2.6).

**Lifetime labels.** A lifetime label is a lowercase identifier prefixed with the `~` sigil (e.g. `~src`, `~origin`). The `~` sigil is used exclusively for lifetime labels and may not appear in any other context. Lifetime labels are not identifiers — they cannot be used as variable names, type names, or in any position other than `[lifetime ~name]` declarations and `borrow[~name]` references. `~static` is a reserved lifetime label with special semantics (see §1-7.1, §3-2.4.2); it may not be declared as a user lifetime parameter.

**`unique`** is a binding and field qualifier keyword. `unique let`/`unique var` declares a single-owner binding for a class instance with no ARC reference counting. `unique var` on a struct field declares a uniquely-owned class field. `unique` is permitted in all execution modes (§1-2.6). See §3-2.4.7.

**`onstack`** is a local binding storage-class modifier. `onstack let` / `onstack var` **guarantees** that the declared binding's aggregate storage is materialized in the enclosing invocation's stack frame rather than in a compiler-chosen static block, so two concurrent (or re-entrant) invocations get two distinct blocks. It is a guarantee, not a hint: when the compiler cannot honour it the build FAILS with a diagnostic naming why — it never silently falls back to static storage. `onstack` is permitted only in `@mode(freestanding)` (`E_ONSTACK_NOT_FREESTANDING` elsewhere) and only on a *local* binding (`E_ONSTACK_NOT_LOCAL`). See §3-3.17c.

**`consume`** is a unary expression keyword. `consume expr` explicitly downgrades a `unique` binding to a regular ARC-managed reference, transferring ownership and consuming the source binding. `consume` requires an ARC runtime to transfer ownership into, so it is permitted only in `@mode(host.native)` and `@mode(host.dual)`. Using `consume` in `@mode(host.scripted)`, `@mode(web.scripted)`, `@mode(web.compiled)`, or `@mode(freestanding)` is a compile-time error (`E_CONSUME_NOT_AVAILABLE`). Applying `consume` to a non-`unique` binding is `E_CONSUME_NON_UNIQUE`. See §3-2.4.7.

> **Enforcement status.** All three rules — `E_CONSUME_NOT_AVAILABLE`, `E_CONSUME_NON_UNIQUE`, and `E_UNIQUE_CLASS_CONSUME` (§1-8.11) — are enforced by both compilers, and each is pinned in the checker-parity corpus. `E_CONSUME_NON_UNIQUE` requires knowing the operand is a `unique` *binding*, so it depends on §1-7.1's binding qualifier being carried past the parser on both sides.

**`noescape`** is a function type modifier keyword. It is permitted as a modifier on `fn` types in all execution modes (§1-2.6).

**`noreturn`** is a **return-type marker**, not a type values can have. `func halt(): noreturn` promises that a call never completes: control leaves by `throw`, by calling another `noreturn` function, or by entering a loop with no reachable exit. Every other position — a parameter, a binding, a field, a cast target, a union member, a type argument — is `E_NORETURN_POSITION`. A body with a path that completes normally breaks the promise and is `E_NORETURN_FALLTHROUGH`; a `return` inside such a body is `E_NORETURN_RETURNS`. `noreturn` is permitted in all execution modes (§1-2.6), and in Wasm-targeting modes it is erased entirely before codegen. See §1-4.4a, §1-7.8.

**`unreachable`** is a primary **expression** of type `noreturn`, written where a program asserts control cannot arrive. Reaching it at run time is a panic in **every** build profile, including `--release` and `--profile safety` — it is not an optimisation hint, and Loup deliberately parts company here with languages that make the same spelling undefined behaviour once optimisation is on. Because its type is `noreturn` it stands in any expression position without widening the surrounding type: a `match` arm spelled `_ => unreachable` leaves the other arms' common type alone. `unreachable` is permitted in all execution modes (§1-2.6). See §1-5.11.

**`impossible`** is the **uninhabited type**: no value of it can exist. It is legal only as a type argument, and only where that argument lands in an enum variant payload — `Result[T, impossible]`, `Option[impossible]`, or a user enum's parameter used directly as a payload. Every other position, `list[impossible]` and `dict[K, impossible]` included, is `E_IMPOSSIBLE_POSITION`. Its purpose is to let a signature state that a case cannot occur and have `match` exhaustiveness agree: the arm for an uninhabited payload may be omitted. `impossible` is a type-checker construct with no runtime footprint and is permitted in all execution modes (§1-2.6). See §1-4.4b, §1-9.4.

**`noreturn` and `impossible` are not two spellings of one idea.** `noreturn` describes an *expression* that never yields a value; `impossible` describes a *type* that has no values. The first is about control flow, the second about inhabitation, and neither is legal in the other's position.

**`prefer`** is a keyword used in the two-token sequence `prefer compiled`, valid only in import statements (see §1-13.1). `prefer` is a reserved keyword and SHALL NOT be used as an identifier.

**`reads`, `edits`, `takes`, `shares`** are ownership transfer verb keywords. They are used as parameter modifiers in function and method declarations, and as call-site acknowledgment labels. `reads` is the implicit default for parameters declared without any verb. Available in all execution modes. See §3-2.4.9.

**`modifier`** is a method declaration keyword. `modifier` declares a class method that writes `var` fields on `self`. Available in all execution modes; not valid on struct methods (`E_MODIFIER_ON_STRUCT`). See §3-2.4.11.

**`safe`** is a context keyword. `safe {}` introduces a safe context for its lexical scope; `safe func` declares a function that both requires and provides a safe context. Available in all execution modes. See §3-2.4.12.

**`synchronized`** is a class declaration modifier. In the runtime modes (`@mode(web.scripted)`, `@mode(web.compiled)`, `@mode(host.scripted)`, `@mode(host.dual)`, `@mode(host.native)`), `synchronized class` equips each instance with a per-instance mutex that serializes all `modifier` method invocations. In `@mode(freestanding)` it is also available, with a reduced per-class compare-and-swap lock model (acquired on entry to any method); the runtime code `E_SYNCHRONIZED_FREESTANDING` (RETIRED) is retired. See §3-2.4.13.

**`unsafe`** introduces a programmer-asserted-safe statement region: `unsafe("reason") { ... }`. The reason is mandatory (`E_UNSAFE_NO_REASON`). The region is valid in **any** function or method body (§3-2.4.6); inside a `modifier` method on a `synchronized` class it *additionally* releases the per-instance lock for the block's duration (§3-2.4.14), and everywhere else it carries no lock semantics and is purely an auditable record.

**`requires`** is a contract clause keyword. A `requires` clause appears after the parameter list of a function or method declaration and before the return type. Available in all execution modes. See §3-2.4.10.

**`atomic`** is a block keyword. `atomic { ... }` introduces a cooperative atomicity scope that the compiler verifies contains no suspension points (`await`, `for await`, `spawn`). Available in `@mode(web.scripted)`, `@mode(web.compiled)`, `@mode(host.scripted)`, and `@mode(host.dual)`; usage in `@mode(host.native)` or `@mode(freestanding)` is `E_ATOMIC_NOT_WASM` (use `synchronized`/`Mutex` or `InterruptGuard` instead). See §2-1.7.

**`reinterpretChecked`** is a contextual expression keyword. `reinterpretChecked[T, U](expr)` reinterprets the bit pattern of a value of type `T` as type `U`, with a runtime alignment check that returns `Result[U, AlignmentError]` rather than requiring `@unsafe`. Available in all modes (§1-2.6). See §3-3.18.

### §1-3.5 Identifiers

An identifier is a sequence of Unicode letters, digits, and underscores that does not begin with a digit:

```
Identifier    ::= IdentStart { IdentContinue }
IdentStart    ::= UNICODE_LETTER | "_"
IdentContinue ::= UNICODE_LETTER | UNICODE_DIGIT | "_"
```
*(Canonical grammar in §1-19.1. `UNICODE_LETTER` = any Unicode letter or underscore;
`UNICODE_DIGIT` = any Unicode decimal digit.)*

Identifiers are case-sensitive. By convention:

- **Lowercase** names are used for variables, functions, parameters, and primitive types (`int`, `float`, `bool`, `char`, `string`, `bytes`).
- **PascalCase** names are used for classes, interfaces, enums, structs, type aliases, and type parameters (`MyClass`, `Option[T]`, `Task[T]`).
- **SCREAMING_SNAKE_CASE** is used for constants by convention but is not enforced by the language.

### §1-3.6 Literals

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

*Compiler's rule (negated literals).* A unary `-` written directly before a literal with a fixed-width suffix (`i8` … `u64`) is part of the literal: the range check applies to the negated value, so `-128i8` is `int8`'s minimum and `-9223372036854775808i64` is `int64`'s, while `-1u8` is `E_LITERAL_OVERFLOW`. A parenthesized operand (`-(128i8)`) is an ordinary negation of a literal that must itself fit. An unsuffixed literal keeps its 64-bit two's-complement reading (`0xFFFF_FFFF_FFFF_FFFF` is `-1`), and a `bigint` literal has no range. The diagnostic names the literal as written and the type's range: ``integer literal `300i8` does not fit in `int8` (-128..=127)``. (loup#550)

The `int` type is a signed 64-bit integer (range: −2⁶³ to 2⁶³−1). Integer overflow behaviour is specified in §1-4.1.1.

**Explicit conversions.** See §1-4.1.2 for the full conversion function set. Mixed `int`/`float` arithmetic is a compile-time error — convert one operand explicitly (see §1-3.7).

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

#### Complex Number Literals

Complex literals are written as a numeric literal immediately followed by an `i` suffix:

```
2.3i             // pure imaginary, type complex
1.5i             // pure imaginary, type complex
0.0i             // imaginary zero, type complex
3i               // imaginary integer becomes complex (3.0i)
1.5e-3i          // scientific imaginary, type complex
```

The `i` suffix produces a value of type `complex` (alias for `complex64`) by default. To produce a `complex32` value, use the `i32` form of the suffix: `1.5i32`. To produce a `complex64` value explicitly, use `i64`: `1.5i64`.

| Suffix | Type | Example |
|---|---|---|
| `i` | `complex` (`complex64`) | `2.3i`, `1.5e-3i`, `3i` |
| `i32` | `complex32` | `2.3i32`, `1.5e-3i32` |
| `i64` | `complex64` | `2.3i64`, `1.5e-3i64` |

**Integer-form vs float-form disambiguation.** The bare `i` suffix is unambiguously imaginary on any numeric form (integer or float). The `i32` and `i64` suffixes, however, were already reserved as `int32` / `int64` integer-type suffixes (§1-3.6 integer literal table) before v1.20. To preserve backward compatibility, when these suffixes appear on a bare integer-form literal they parse as the integer type:

```
42i32     // int32 — integer-suffix form (existing v1.x behavior)
42i64     // int64 — integer-suffix form
42i       // complex — bare i is unambiguously imaginary
42.0i32   // complex32 — float-form forces imaginary parsing
42.0i64   // complex64
```

To write an integer-valued imaginary explicitly, use `42i` (produces `complex`), `42.0i32` (produces `complex32`), or `42.0i64` (produces `complex64`).

A pure-imaginary literal has zero real part and the literal value as imaginary part. To construct a complex number with both parts, combine a real numeric literal and an imaginary literal using addition or subtraction:

```
let z: complex = 1.5 + 2.3i;     # (1.5, 2.3)
let w: complex = 4.0 - 1.0i;     # (4.0, -1.0)
let u: complex = 0.0 + 0.0i;     # origin
```

The compiler folds the constant expression `<real> + <imaginary>` (or `<real> - <imaginary>`) at compile time into a single complex literal. The real and imaginary literals must have compatible suffixes — combining `complex32` and `complex64` literals is a compile-time error (`E_COMPLEX_LITERAL_KIND_MISMATCH`). A bare `int` or untyped float literal as the real part is widened to match the imaginary part's precision.

**Constant folding of float arithmetic.** A binary arithmetic expression (`+`, `-`, `*`, `/`, `%`) whose operands are both float literals of the same width is folded to a single float literal at compile time, using IEEE-754 semantics identical to the runtime operation (overflow yields `±inf`, `inf - inf` yields `NaN`, etc.). This folding is bottom-up, so nested constant expressions fold to a single literal (e.g. `(1.0e308 * 10.0) - (1.0e308 * 10.0)` folds to `NaN`). The fold is value-preserving — it does not change the observed result — and notably keeps a constant float expression off the runtime floating-point path, so a `@mode(freestanding)` target without hardware floating point (and linked `-nostdlib`, without soft-float helpers) can use constant float values without pulling in a soft-float runtime. Operands that are not both same-width float literals (a variable, a mixed-width pair, a non-arithmetic operator) are left as a runtime operation.

**Disambiguation with identifiers named `i`.** The lexer recognizes the `i` suffix only when it immediately follows a numeric literal with no intervening whitespace and is followed by a non-identifier character. An identifier named `i` (e.g., a loop variable) is unaffected:

```
for (let i in 0..n) {
    let z = 2.0 + 3.0i;    # imaginary literal
    let k = z * i;         # identifier i — multiplication
}
```

The token `2i` is always an imaginary literal; the token `2 i` (with whitespace) is a syntax error (juxtaposition without operator).

**Construction from variables.** Imaginary literals construct *constants*. To construct a complex value from runtime real and imaginary `float` values, use the `complex(re, im)` function from `core.complex` (§21.9):

```
from core.complex import (complex);

let re: float = computeReal();
let im: float = computeImaginary();
let z: complex = complex(re, im);
```

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

*Compiler's rule (`\u` escapes).* After `\u`, a `{` starts the braced form: one to six hex digits and a closing `}`. Otherwise EXACTLY four hex digits (either case) follow and form one scalar, so `"\u00411"` is `A1`. Anything else after `\u` (fewer than four hex digits, an empty or unclosed brace) is `E0004` "invalid escape sequence '\u' (expected \uNNNN with 4 hex digits, or \u{N...} with 1-6)" at the escape. A well-formed escape whose value is no Unicode scalar value (a surrogate `D800`–`DFFF`, or above `10FFFF`) is `E0004` "invalid Unicode scalar value '\uD800'" (`'\u{D800}'` for the braced spelling). The rule is the same in string, char and bytes literals on both front ends, and in interpolated and multiline strings on Stage0; raw strings take no escapes. Open: the self-hosted front end does not decode ANY escape inside `i"…"` and `"""…"""` strings yet, so there they print as written. (Both lexers accepted only the braced form until v21.)

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

*Compiler's rule (bytes literal content).* `\xHH` takes exactly two hexadecimal digits and contributes that one byte; `\u{…}` / `\uXXXX` contributes the UTF-8 encoding of its scalar, and every other character between the quotes its UTF-8 encoding (`b"é"` is the two bytes `c3 a9`). Any other escape — including `\x` without two hex digits — is an error at the literal. Both quote characters are accepted (`b"…"`, `b'…'`), and each may be escaped inside the other. (loup#550)

A `bytes` value (whether a literal, the result of `bytesFromInts(...)`/`readBytes(...)`, or a captured `exec(...).stdout`/`.stderr`) supports the following intrinsic methods:

| Method | Returns | Description |
|---|---|---|
| `length()` / `len()` | `int` | Number of bytes. |
| `is_empty()` / `isEmpty()` | `bool` | True when the length is 0. |
| `b[i]` / `at(i)` / `get(i)` | `int` | The byte at index `i` as an `int` in `0..=255`. Negative indices count from the end; an out-of-range index raises a catchable `IndexError`. |
| `toString()` / `to_string()` / `decode()` / `decodeUtf8()` / `toText()` | `string` | Decode as UTF-8. Decoding is lossy — invalid sequences become U+FFFD (`�`) rather than raising: each maximal subpart of an ill-formed sequence (Unicode §3.9 — a lead byte and as many of its continuation bytes as are in range) becomes one U+FFFD, and an invalid lead byte one of its own. |
| `toHex()` / `to_hex()` / `hex()` | `string` | Lowercase hexadecimal rendering (two chars per byte, no separators). |
| `toList()` / `to_list()` / `toInts()` | `list[int]` | Each byte as an `int` (the inverse of `bytesFromInts`). |
| `slice(start, end = length)` | `bytes` | Exactly the bracket slice (§1-5.3): `b.slice(a)` is `b[a:]` and `b.slice(a, b)` is `b[a:b]` — a negative bound counts from the end, out-of-range bounds clamp (ruling SLICE-2). |
| `substring(start, end)` | `bytes` | The sub-range `[start, end)`. Indices clamp into `[0, length]` (a negative index is `0`, not counted from the end). |
| `contains(sub)` | `bool` | Whether `sub` (a `bytes`) occurs as a contiguous subsequence. |

Equality on `bytes` is structural (content-wise) per §1-3.x: two `bytes` values compare equal with `==` iff they have identical length and bytes.

*Compiler's rule (the bytes table on every lane).* Both checkers hold this table with the same signatures (arity and argument types; a name not in it is ``type 'bytes' has no method 'm'``), and every method of it is available in every execution mode — natively a `bytes` value is a `list[int]`, one byte per element, and the methods only `bytes` has run on the bytes runtime (loup#612).

#### `char` Literals

A `char` literal represents a single Unicode scalar value and has type `char`. It is prefixed with `c` and delimited by double or single quotes:

```loup
let a: char = c"A";
let newline: char = c"\n";
let snowman: char = c"☃";
let hi: char = c"\u{1F600}";    # 😀
```

`char` literals support the same escape sequences as string literals. The `\xHH` escape is not permitted in `char` literals — use `\u{HH}` instead (`E_CHAR_LITERAL_INVALID`). A `char` literal containing zero Unicode scalar values or more than one is also `E_CHAR_LITERAL_INVALID`:

```loup
let bad1: char = c"";    # E_CHAR_LITERAL_INVALID: empty char literal
let bad2: char = c"ab";  # E_CHAR_LITERAL_INVALID: multiple scalar values
```

A `char` value is not implicitly coercible to `string`. Use `c.toString()` or string interpolation `i"{$ c $}"` to convert.

#### Boolean Literals

The boolean type `bool` has exactly two values: `true` and `false`.

### §1-3.7 Operators

Loup defines the following operators, listed from highest to lowest precedence. Operators at the same precedence level associate as indicated.

| Precedence | Operator(s) | Description | Associativity |
|---|---|---|---|
| 1 | `()` `[]` `.` `?.` `!{}` `?.[` | Call, index, member access, safe nav, dynamic access, null-safe index | Left |
| 2 | `typeof` | Type-of operator | Prefix |
| 3 | `-` (unary) `not` `!` `bnot` `attempt` | Unary negation, logical not, bitwise not; `Result` unwrap to the enclosing `catch Err` arm (§1-5.10) | Prefix |
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
| 21 | *(none — Loup has no ternary operator; `?` after an operand is always postfix propagation, §1-5.7; use `if`/`else` as an expression, §1-5.4)* | | |
| 22 | `?` (postfix) | Result propagation | Postfix |
| 23 | `=` `+=` `-=` `*=` `/=` `//=` `%=` `**=` `<<=` `>>=` `&=` `\|=` `^=` | Assignment | Right |
| 24 | `*` `**` (prefix, spread) | Spread | Prefix |

**Arithmetic operators** (`+`, `-`, `*`, `/`, `//`, `%`, `**`) operate on `int` and `float`. Mixed `int`/`float` operands (arithmetic, ordering or equality) are a compile-time error, `E_NUMERIC_TYPE_MISMATCH` — convert one operand explicitly (`as float` / `as int`). Loup does not promote implicitly between the integer and floating-point families; predictability and explicitness rank above convenience (ruled 2026-09-04, loup#289). Lossless widenings inside a family (§1-4.1.2) stay implicit. Division of two `int` values (`/`) produces `int` (truncating toward zero); `//` is floor division — it truncates toward negative infinity and always returns the same type as its operands (`int // int` → `int`, `float // float` → `float`, `bigint // bigint` → `bigint`, `decimal // decimal` → `decimal`). The `+` operator also concatenates `string` values and `list` values.

**An `Option` is not a number.** An `Option[T]` operand of an arithmetic operator (`+`, `-`, `*`, `/`, `//`, `%`, `**`, unary `-`) or of an ordering operator (`<`, `<=`, `>`, `>=`, and `compareTo` through them), on either side, is a compile-time error in both spellings — the operator and its desugared `op_*` / `compareTo` call (§1-5.1): `E_OPERATOR_MISSING` for arithmetic, a type error naming `compareTo` for ordering. Open the option first — `o.unwrap()`, `o ?? default`, `match`. In particular `d.get(k)` is an `Option[V]`, not a `V`: write `sum + d.get(k).unwrap()` or `sum + (d.get(k) ?? 0)`, never `sum + d.get(k)`. `==` and `!=` stay legal between options (`d.get(k) == Some(1)`, structural equality below). (Ruled 2026-10-31; the earlier "nullable-value convention" that admitted `int + Option[int]` is retired.)

**Comparison operators** (`<`, `>`, `<=`, `>=`) operate on types that implement the `Comparable[T]` interface. Primitives (`int`, `float`, `string`) are comparable by default.

**Equality operators** (`==`, `!=`) use structural equality for primitives, enums, structs, and tuples. For class instances, `==` compares by reference identity unless the class overrides equality via the `Equatable[T]` interface (see §1-5.1, §1-11.2). Equality is reflexive (`a == a`), symmetric (`a == b` implies `b == a`), and transitive.

**Logical operators** (`and`/`&&`, `or`/`||`, `not`/`!`) operate on `bool` values. `and` and `or` are short-circuit: the right operand is not evaluated if the left operand determines the result.

**Canonical style.** The keyword forms `and`, `or`, and `not` are the idiomatic Loup style. The symbol aliases `&&`, `||`, and `!` are legal and semantically identical but are considered non-canonical. The reference formatter (§1-20.4) rewrites symbol forms to keyword forms. Code using symbol forms is accepted by the compiler but produces a lint advisory (`symbol-logical-ops`) that can be suppressed per-line with `// loup:allow(symbol-logical-ops)`. New code should use keyword forms exclusively. This rule applies uniformly in scripted mode, compiled mode, and template fence expressions.

**User-defined operator overloading** is supported via the operator interface protocol. See §1-5.1 for desugar rules and §1-11.2 for the full operator interface set.

**Cast operators** (`as`, `as?`) perform narrowing from `Any` to a concrete type. `expr as T` throws `TypeError` on mismatch; `expr as? T` returns `Option[T]`. See §1-4.3.

**`box` operator** widens a value type to `Any`. See §1-4.3.

### §1-3.8 Collection Literals

Loup provides literal syntax for the built-in collection types:

**List literals:**
```
let empty: list[int] = [];
let nums = [1, 2, 3, 4, 5];
let mixed: list[Any] = [1, "hello", true];   # implicit widening
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
let single = (42,);  # trailing comma distinguishes from parenthesized expression
```

Trailing commas are permitted in all collection literals.

*Compiler's rule (a collection literal takes its expected type).* A non-empty list, set or dict literal in a position whose expected type is a collection type of the same kind takes that type, and each element (each key and value of a dict) is checked for assignability to the expected element type rather than for agreement with the other elements. The positions are an annotated binding (`let xs: list[Base] = [b, d]`), a `return`, an assignment, a collection element nested in one of these, and an argument of ANY call — free function, constructor, instance method or static method, positional or named (§1-19.5) — whose parameter type contains no type parameter. So `[base, derived]` passed where `list[Base]` is expected is a `list[Base]` (a subclass value is a `Base`, §1-8.3), while an element that is not assignable is an error (`cannot assign 'Unrelated' to element of 'list[Base]'`). A parameter whose type names a type parameter (`items: list[T]`) is no expected type: the literal's own type drives inference. Only a literal with no expected type must be homogeneous on its own (`list literal has heterogeneous elements`). (loup#312; row LITEXP-1. Stage0 typed a METHOD's arguments before it looked the method up, so `s.count([base, derived])` was rejected while `count([base, derived])` was accepted; the self-hosted checker did not apply the rule to NAMED arguments.)

**Spread in collection literals.** The `*` and `**` spread operators may be used inside collection literals to expand existing collections inline. See §1-5.8 for full details.

```
let a = [1, 2, 3];
let b = [0, *a, 4];       # [0, 1, 2, 3, 4]

let base = {"x": 1};
let extended = {**base, "y": 2};  # {"x": 1, "y": 2}
```



---

## §1-4 Types and Type System

*(This section is normative.)*

Loup is a statically-typed language with type inference. Every value has a type known at compile time. The type system supports primitives, classes, interfaces, enums, structs, tuples, union types, generics, and function types.

### §1-4.0 Core Numeric Trait Interfaces (v1.18)

The following marker interfaces live in the `core` namespace and are
automatically implemented by built-in numeric types. They serve as trait
bounds for generic numeric code.

```loup
namespace core;

# Marker trait for fixed-width integer primitives.
# Implemented by: int8, int16, int32, int64, uint8, uint16, uint32, uint64.
# Explicitly NOT implemented by `bigint` (no fixed width).
pub interface Integer {}

# IEEE 754 floating-point trait.
# Implemented by: float32, float64.
# Carries `static let` members for IEEE 754 metadata + the standard
# decomposition methods. Per-type concrete values for `radix`,
# `digits`, `minExponent`, `maxExponent`, `epsilon`, `tiny`, `huge`
# come from stdlib §21.11.5 — the table specifies f32 and f64
# values separately. Generic code with `T: Float` can access these
# as `T.epsilon`, `T.huge`, etc.; the typechecker dispatches via
# `current_where_bounds` and the codegen specialises per
# conforming type.
pub interface Float {
    static let radix: int;
    static let digits: int;
    static let minExponent: int;
    static let maxExponent: int;
    static let epsilon: float;
    static let tiny: float;
    static let huge: float;

    func mantissa(): (int, int, int);
    func nextUp(): Self;
    func nextDown(): Self;
    func ulpDistance(other: Self): int;
}

# Union marker — implemented by every primitive with fixed-width numeric
# semantics (all Integer types + all Float types + `decimal` for its
# fixed-precision variants + `complex32` / `complex64`).
pub interface Numeric {}
```

`Integer` and `Numeric` have empty bodies — they carry no methods.
Their purpose is to gate generic code on the type category (e.g.,
the atomic RMW operations in §2-2.4 require `T: Integer +
Shareable`). They are declared in §1-4 rather than being introduced
inline at each use site to avoid the appearance of ad-hoc
per-operation trait invention.

`Float` carries a non-trivial member set per §21.11.5 / §1-4.1.7.
The `static let` form declares signatures only — conforming
primitive types (`float32`, `float64`) provide concrete values
through the per-type IEEE 754 metadata table; the compiler
specialises generic accesses at call sites.

### §1-4.1 Primitive Types

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

**Complex types:**

| Type | Description | Size |
|---|---|---|
| `complex` | IEEE 754 double-precision complex (alias for `complex64`) | 16 bytes |
| `complex32` | IEEE 754 single-precision complex (`[float32 re, float32 im]`) | 8 bytes |
| `complex64` | IEEE 754 double-precision complex (`[float64 re, float64 im]`) | 16 bytes |

See §1-4.1.6 for full semantics including operators, methods, the literal-suffix syntax (`i`, `i32`, `i64`), and freestanding-mode availability constraints on transcendental operations.

**Other primitive types:**

| Type | Description | Size |
|---|---|---|
| `bool` | Boolean (`true` or `false`) | 1 byte |
| `char` | A single Unicode scalar value (U+0000–U+10FFFF, excluding surrogates) | 4 bytes |
| `string` | Immutable UTF-8 sequence of Unicode scalar values. `s.length` counts scalar values; `s[i]` returns a one-character `string` (§1-4.1.5). | Variable |
| `bytes` | Arbitrary byte sequence (not required to be valid UTF-8). `b[i]` returns `uint8`. | Variable |

`int` is an alias for `int64`. `float` is an alias for `float64`. `uint` is an alias for `uint64` on 64-bit targets and `uint32` on 32-bit targets — it is the platform-native pointer-sized unsigned integer used for raw addresses in `@mode(host.native)` and `@mode(freestanding)` (`native.mem`, `native.atomic`, `@allocator`, `native.ffi.ptrAdd`). Using `int` and `float` is preferred for general-purpose numeric work; the explicit-width names exist for systems programming, FFI, and numerical computing requiring specific memory layouts.

"Passed by value" refers to the language's assignment/call semantics. The runtime may use efficient representations (handles, copy-on-write, etc.) as long as observable semantics match.

#### §1-4.1.1 Fixed-Width Integer Overflow

In scripted modes (`@mode(web.scripted)`, `@mode(host.scripted)`) and Wasm targets (`@mode(web.compiled)`), arithmetic on fixed-width integer types (`int8`, `int16`, `int32`, `int64`, `uint8`, `uint16`, `uint32`, `uint64`) that would overflow the type's range is a `NumericOverflowError` at runtime. `@mode(host.dual)` uses the same checked semantics as scripted modes for fixed-width integers.

In `@mode(host.native)` and `@mode(freestanding)`, the default is **wrapping arithmetic**: overflow silently wraps at the type boundary (two's complement for signed types, modular for unsigned). This is the C-compatible behavior required for systems programming and SIMD work.

`int` / `int64` are an exception in `@mode(host.native)`: they default to **checked arithmetic** (throwing `NumericOverflowError` on overflow), matching scripted-mode and `@mode(host.dual)` semantics. `uint` follows the same rule as other fixed-width unsigned integers — it wraps by default in `@mode(host.native)` and `@mode(freestanding)`. In `@mode(freestanding)`, exceptions are unavailable, so `int` / `int64` wrap on overflow the same as other fixed-width integers — use `--overflow=trap` to trap instead, or `checkedAdd` / `saturatingAdd` for explicit overflow handling. Use `@overflowWrapping` on a function to opt into wrapping for all fixed-width arithmetic within it. When `--overflow=trap` is also set, `@overflowWrapping` on a function overrides the trap flag for that function's body — the function uses wrapping arithmetic regardless of the project-wide trap setting:

```loup
@mode(host.native)
@overflowWrapping
func addWrapping(a: int32, b: int32): int32 {
  return a + b;   # wraps silently on overflow
}
```

**Explicit checked and saturating arithmetic.** All fixed-width integer types provide methods for explicit overflow handling regardless of the ambient mode:

```loup
let a: int32 = 2_147_483_647i32;
let b: Option[int32] = int32.checkedAdd(a, 1);  # Option[int32] — None on overflow
let c: int32 = int32.saturatingAdd(a, 1);       # int32 — clamps to 2_147_483_647
let d: int32 = int32.wrappingAdd(a, 1);         # int32 — wraps to -2_147_483_648
```

`bigint` and `decimal` never overflow — they grow as needed.

#### §1-4.1.2 Numeric Conversions

All narrowing conversions between numeric types are **explicit** — no implicit narrowing. The compiler emits a type error if a narrower type is assigned from a wider type without an explicit conversion call.

**Implicit widenings (no call required):**
- Signed integer widenings: `int8` → `int16` → `int32` → `int64` (`int`) → `bigint`
- Unsigned integer widenings: `uint8` → `uint16` → `uint32` → `uint64` (`uint` on 64-bit) → `bigint`
- Float widening: `float32` → `float64` (`float`)
- Any integer or float → `decimal`

**Explicit conversion functions:**

```loup
int8(x)     # truncate / wrap to int8
int16(x)    # truncate / wrap to int16
int32(x)    # truncate / wrap to int32
int64(x)    # alias: int(x)
uint8(x)    # truncate / wrap to uint8
uint16(x)   # truncate / wrap to uint16
uint32(x)   # truncate / wrap to uint32
uint64(x)   # truncate / wrap to uint64
float32(x)  # narrow to float32 (possible precision loss)
float64(x)  # alias: float(x)
bigint(x)   # convert int or float to bigint (truncates fractional part)
decimal(x)  # convert any number or string to decimal
```

Conversion that cannot represent the value (e.g. `int8(300)`) wraps on native targets and throws `NumericOverflowError` in scripted mode.

*Compiler's rule (numeric `as`).* `x as T` where `x` has a numeric static type (a fixed-width integer, `int`, `uint`, `float`, `float32`) and `T` is one of those types is this explicit CONVERSION, not the §1-4.3 assertion. An integer target takes the value unchanged when it can represent it — a float source truncated toward zero first; a float target rounds to nearest (`float32`: IEEE single precision, never an error). A value the integer target cannot represent (and a NaN or infinite float) is, on a native target (`@mode(host.native)`, `@mode(freestanding)`), the two's-complement WRAP of an integer source into the target's width (`300 as uint8` is `44`, `-1 as uint8` is `255`, `200 as int8` is `-56`) and the SATURATION of a float source at the target's nearest bound (`1.0e30 as int32` is `2147483647`, `-5.5 as uint8` is `0`, a NaN is `0`); on every other target — the interpreters and both Wasm hosts — it is a `NumericOverflowError` (`conversion overflow: 300 does not fit uint8`). The target, not the build flags, decides: `--overflow=trap` and `@overflowWrapping` govern arithmetic, not conversions (loup#662; row CAST-2 in `specs/x-update-v1_20-to-v1_21/design.md`).

**Mixed-type arithmetic.** In expressions mixing `int` and `float` the operands must be converted explicitly (`as float` / `as int`); there is no implicit promotion between the integer and floating-point families (`E_NUMERIC_TYPE_MISMATCH`, ruled 2026-09-04 loup#289). Likewise all other mixed combinations are compile-time errors (`E_NUMERIC_TYPE_MISMATCH`) — use an explicit conversion.

| Code | Mode | Condition |
|---|---|---|
| `E_NUMERIC_TYPE_MISMATCH` | All | Mixed arithmetic, ordering or equality between the integer and floating-point families (incl. `int`/`float`), or between other numeric types, without an explicit conversion (e.g. `int8 + int32`, `bigint + int`) |

#### §1-4.1.3 `bigint` — Arbitrary-Precision Integer

`bigint` is an arbitrary-precision signed integer. Values grow without bound, limited only by available memory. This matches the behavior of Python's `int` built-in and JavaScript's `BigInt`.

**Literal syntax.** Append `n` to any integer literal:

```loup
let x: bigint = 99_999_999_999_999_999_999n;
let y: bigint = 0xFF_FF_FF_FF_FF_FF_FF_FFn;
let z: bigint = bigint(42);    # construct from int
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

#### §1-4.1.4 `decimal` — Arbitrary-Precision Decimal

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

##### §1-4.1.4.1 `decimal(p, s)` — Fixed-Precision Decimal

`decimal(p, s)` is a fixed-precision decimal subset of `decimal` with declared total digits `p` (precision) and digits after the decimal point `s` (scale). `decimal(11, 2)` represents values up to ±999_999_999.99 with two decimal places — the exact shape of a typical money column.

**Why a separate type.** Arbitrary-precision `decimal` is correct for any base-10 calculation but has three properties that matter when the shape of the value is known and bounded:

1. *Database mapping.* SQL `NUMERIC(11, 2)` maps to `decimal(11, 2)` directly with no runtime range check. Arbitrary `decimal` requires per-row truncation or rejection logic.
2. *Interchange representation.* COBOL `PIC S9(9)V99 COMP-3` and FIX `Price` fields have declared scale; pack/unpack code (§4-2) emits direct conversion when the scale is part of the type, and a runtime scale check otherwise.
3. *Performance.* Arithmetic on `decimal(11, 2)` compiles to fixed-width 64-bit integer operations with implicit scaling; arbitrary-precision `decimal` invokes the decimal128 runtime per operation.

**Type syntax.** Precision is required; scale defaults to 0. Both must be compile-time integer constants:

```loup
let price:    decimal(11, 2) = 19.99d;
let rate:     decimal(15, 6) = 0.075000d;
let count:    decimal(9)     = 42d;          # scale defaults to 0 — integer-valued
```

`p` is in the range 1..38. `s` is in the range 0..p. Out-of-range values are `E_DECIMAL_PRECISION_RANGE` and `E_DECIMAL_SCALE_RANGE`.

**Optional arithmetic policy parameters.** `decimal(p, s)` accepts two optional named type parameters declaring how arithmetic on the type behaves when results don't fit:

```loup
let price:    decimal(11, 2, rounding: HalfEven, overflow: Trap)   = 19.99d;
let estimate: decimal(11, 2, rounding: HalfUp,   overflow: Saturate) = 19.99d;
```

`rounding` defaults to `HalfEven` (banker's rounding, IEEE 754-2019 default). `overflow` defaults to `Trap` (raise `NumericOverflowError`). Full enumeration of values and semantics is given in §1-4.1.4.2.

**Implicit widening.** Three implicit-widening rules apply:

1. *To arbitrary `decimal`.* `decimal(p, s)` widens implicitly to arbitrary `decimal`, losing the precision/scale envelope but gaining arbitrary range. The `rounding` and `overflow` policies are discarded — arbitrary `decimal` has no envelope to overflow.

2. *From statically-bounded sources to `decimal(p, s)`.* Compile-time-known values (literals and `const` bindings) widen if the value fits in the destination's envelope. Runtime values of source types whose entire static range fits in the envelope (e.g., `int8` → `decimal(3, 0)` or wider) widen losslessly. Sources whose static range exceeds the envelope (e.g., `int64` → `decimal(11, 2)`) do *not* widen implicitly under this rule — use the third rule below.

3. *From arbitrary `decimal` or wider `decimal(p, s)` to narrower `decimal(p, s)`.* Implicit widening is permitted, with the destination binding's `rounding` and `overflow` policies applied at the conversion. A value that does not fit raises `NumericOverflowError` under `Trap`, saturates under `Saturate`, wraps under `Wrap`, or has its high-order digits dropped under `TruncateHigh`. This is the rule that lets `let b: decimal(11, 2) = decimal("12345678.99");` compile and run cleanly without an explicit `.into()`.

The `into(decimal(p, s))` form remains available for explicit conversion at call sites where surrounding code needs the operation to be visually unambiguous; it applies the destination's policy identically to rule 3.

**Arithmetic result type rules.** Operations on `decimal(p, s)` produce a `decimal(p′, s′)` whose precision and scale are determined by the operation:

| Operation | Result precision `p′` | Result scale `s′` |
|---|---|---|
| `a + b`, `a - b` | `max(p_a − s_a, p_b − s_b) + max(s_a, s_b) + 1` | `max(s_a, s_b)` |
| `a * b` | `p_a + p_b` | `s_a + s_b` |
| `a / b` | `p_a − s_a + s_b + max(s_a, 6)` | `max(s_a, 6)` |
| `a // b` | `p_a − s_a + s_b` | `0` |
| `a % b` | `min(p_a − s_a, p_b − s_b) + max(s_a, s_b)` | `max(s_a, s_b)` |

If `p′` exceeds 38, the result type is arbitrary `decimal` (precision and policy are discarded). Subsequent assignment of that result to a `decimal(p, s)` binding follows implicit-widening rule 3 above and re-applies the binding's policy.

The formulas above apply directly to operands of identical scale. For mixed-scale operands, the operand with the smaller scale is conceptually scaled up to the larger scale before the operation by zero-padding fractional digits — this is exact and lossless. The formulas as written use `s_a` and `s_b` independently, but readers may equivalently substitute `s = max(s_a, s_b)` for both operands; the result is the same because the smaller-scale operand has been padded.

Assignment from a wider result back to a narrower binding (e.g. assigning `decimal(22, 4)` into a `decimal(11, 2)`) applies the **target's** rounding and overflow policy. This is the operation that must propagate financial intent: if the binding declares `overflow: Saturate`, the assignment saturates; if `Trap`, the assignment raises `NumericOverflowError`.

**Per-operation overrides.** Methods on `decimal(p, s)` provide per-operation policy overrides regardless of the type's declared defaults:

```loup
let a: decimal(11, 2) = 100.00d;
let b: decimal(11, 2) =   3.00d;

let r1 = a.addRounded(b, HalfUp);          # decimal(11, 2)
let r2 = a.addSaturating(b);               # decimal(11, 2) — clamps on overflow
let r3 = a.divRounded(b, scale: 4, rounding: HalfEven);  # decimal(15, 4)
```

The full set is `addRounded`, `subRounded`, `mulRounded`, `divRounded` (each taking an explicit `RoundingMode`), and `addSaturating`, `subSaturating`, `mulSaturating` (each forcing `OverflowPolicy.Saturate` for that single operation). `divRounded` additionally takes an explicit `scale:` because division does not have a natural scale.

There is intentionally no `divSaturating`. Division of finite, non-zero `decimal(p, s)` values cannot produce a result that exceeds the divisor-scaled result-type envelope of §1-4.1.4.1, so saturation has no work to do. Division by zero raises `NumericDivisionError` regardless of any policy parameter — saturation is not a meaningful response to division by zero.

**Construction.** A `decimal(p, s)` is constructed from a `decimal` literal, a string, an integer, or another `decimal` value:

```loup
let a: decimal(11, 2) = 19.99d;                       # literal — checked at compile time
let b: decimal(11, 2) = decimal("12345678.99");        # string — runtime parse
let c: decimal(11, 2) = 42;                            # implicit widening from int literal
let raw: decimal       = decimal("12.34");             # arbitrary-precision intermediate
let d: decimal(11, 2) = raw.into(decimal(11, 2));      # explicit conversion from `decimal`
```

If the literal value cannot be represented (too many digits, scale exceeds declared scale), `E_DECIMAL_PRECISION_RANGE` is emitted at compile time. Runtime constructions that exceed the envelope follow the binding's `overflow` policy.

**Literal scale promotion.** A `decimal` literal with fewer fractional digits than the target's scale is zero-padded on assignment. A literal with more fractional digits than the target's scale is rounded according to the target's `rounding` policy and emits the `decimal-literal-rounded` advisory:

```loup
let a: decimal(11, 2) = 19.999d;       # advisory: literal rounded from 3 digits to 2
let b: decimal(11, 2, rounding: Truncate) = 19.999d;  # truncated to 19.99
```

**Database mapping.** Drivers in `loup.db.*` map `decimal(p, s)` to `NUMERIC(p, s)` / `DECIMAL(p, s)` columns directly. Reading a column whose declared scale exceeds the binding's scale follows the binding's `overflow` policy at row materialization time.

**Availability.** Same as arbitrary `decimal` — all modes except `@mode(freestanding)`.

**Error codes.**

| Code | Mode | Condition |
|---|---|---|
| `E_DECIMAL_PRECISION_RANGE` | All except freestanding | `p` not in 1..38, or value at compile time exceeds declared precision |
| `E_DECIMAL_SCALE_RANGE` | All except freestanding | `s` not in 0..p |
| `E_DECIMAL_OVERFLOW_AT_ASSIGNMENT` | All except freestanding | Assignment from wider arithmetic result to narrower binding under `overflow: Trap` (compile-time when statically detectable; otherwise `NumericOverflowError` at runtime) |

##### §1-4.1.4.2 Rounding and Overflow Policy

`RoundingMode` and `OverflowPolicy` are enums in the `core.numeric` namespace. They appear as type-level parameters on `decimal(p, s)` and as method arguments on per-operation override methods.

```loup
namespace core.numeric;

pub enum RoundingMode {
    HalfEven;       # banker's rounding — ties to nearest even (IEEE 754-2019 default)
    HalfUp;         # ties away from zero
    HalfDown;       # ties toward zero
    Up;             # away from zero (ceiling for positive, floor for negative)
    Down;           # toward zero (truncation)
    Ceiling;        # toward +∞
    Floor;          # toward −∞
    Truncate;       # alias for Down — preserved for COBOL semantic clarity
}

pub enum OverflowPolicy {
    Trap;            # raise NumericOverflowError (default)
    Saturate;        # clamp to the type's representable extreme
    Wrap;            # modular wrap at the precision boundary
    TruncateHigh;    # discard high-order digits silently — matches COBOL TRUNCATED
}
```

**Naming note.** `OverflowPolicy.TruncateHigh` discards *high-order* digits when a value will not fit; `RoundingMode.Truncate` (an alias for `Down`) discards *low-order* fractional digits when scale must be reduced. The two operations have opposite directionality. The names were deliberately chosen to make this distinction visible at every call site. COBOL's `TRUNCATED` clause maps to `OverflowPolicy.TruncateHigh`, not `RoundingMode.Truncate`.

**Default selection.** `decimal(p, s)` without explicit policy uses `HalfEven` rounding and `Trap` overflow. Both defaults match IEEE 754-2019's recommended behavior for financial arithmetic and refuse silent value corruption.

**Per-binding scope.** Policy parameters apply to all arithmetic where the binding's type appears as a destination — assignment, function-parameter passing, and method-return materialization. They do not affect intermediate result types within a single expression; intermediate results follow the result-type rules of §1-4.1.4.1.

**`Wrap` semantics.** `OverflowPolicy.Wrap` performs modular wrap at the type's precision boundary. For `decimal(11, 2)`, the modulus is 10^11 (one trillion). Negative wrapped values follow two's-complement conventions on the integer representation. Use cases: cycle counters, hash mixing, certain CRC-like checksum computations. Not appropriate for monetary arithmetic.

**`TruncateHigh` semantics.** `OverflowPolicy.TruncateHigh` matches the COBOL `TRUNCATED` behavior — high-order digits beyond the declared precision are discarded silently and no error is raised. This is provided for translator fidelity, not as a recommendation. Code translated from COBOL with `TRUNCATED` clauses can preserve exact bit-for-bit behavior; new code should use `Trap` or `Saturate`.

**`NumericOverflowError` exception.** When `overflow: Trap` is in effect and a value will not fit the declared envelope, the runtime raises `NumericOverflowError`:

```loup
namespace core.numeric;

pub class NumericOverflowError : Exception {
    pub let sourceType: string;     # e.g. "decimal(22, 4)" — the wider type
    pub let targetType: string;     # e.g. "decimal(11, 2)" — the narrower binding
    pub let value:      string;     # canonical decimal repr of the offending value
    pub let location:   string;     # diagnostic location: source file, line, expression
}
```

`NumericOverflowError` extends `Exception` (§1-18.1) and is catchable. It is the exception type raised by both arithmetic-result-narrowing under `overflow: Trap` and by explicit `into(decimal(p, s))` conversion when the value will not fit.

`NumericDivisionError` is the exception type raised by division-by-zero on `decimal` and `decimal(p, s)`. It is also defined in `core.numeric`:

```loup
namespace core.numeric;

pub class NumericDivisionError : Exception {
    pub let dividendType: string;     # e.g. "decimal(11, 2)" — the dividend's type
    pub let dividend:     string;     # canonical decimal repr of the dividend
    pub let location:     string;     # diagnostic location: source file, line, expression
}
```

Division by zero on integer types raises `IntegerDivisionError` (§1-18.1) under unchecked arithmetic (§1-4.1), or returns `Option.None` from the `checkedDiv` family.

**Interaction with arbitrary `decimal`.** Arbitrary `decimal` has neither precision nor scale, so neither rounding nor overflow policy applies — arbitrary `decimal` never overflows. Widening from `decimal(p, s)` to `decimal` discards the policy. Narrowing from arbitrary `decimal` back to `decimal(p, s)` re-applies the destination's policy under both the implicit form (§1-4.1.4.1 widening rule 3) and the explicit `into(decimal(p, s))` form; both raise `NumericOverflowError` under `Trap` if the value will not fit.

**Cross-reference with §1-4.1.4.** Per-operation override methods on `decimal(p, s)` (`addRounded`, `addSaturating`, etc.) take a `RoundingMode` or imply an `OverflowPolicy.Saturate` for a single operation, regardless of the binding's declared policy. This lets a call site override the policy without redeclaring the destination type.


#### §1-4.1.5 `char` — Unicode Scalar Value

`char` is a primitive type representing a single Unicode scalar value.

**`char` is not the element type of `string`.** Indexing (`s[i]`), `s.char_at(i)` and iteration (`for c in s`) all yield a **one-character `string`**, not a `char`. This follows the value kernel's string model, in which a string is a slice and a single character is simply a slice of length one; it keeps character-level scanning — the dominant use — free of conversions:

```loup
let s = "hello";
let first = s[0];                  # string: "h"
if (first >= "a" and first <= "z") { … }   # ordinary string comparison
for (c in s) { … }                 # c is a one-character string
```

A `char` is therefore obtained explicitly, from a `char` literal (`c"h"`), and is used where a *scalar value* is the point — code-point arithmetic, Unicode classification, case mapping — rather than as the currency of string traversal.

**Valid range.** A `char` holds a Unicode code point in the range U+0000–U+10FFFF, excluding the surrogate range U+D800–U+DFFF. All 1,112,064 valid scalar values are representable. No runtime operation produces an out-of-range `char`.

**`char` is not `int` and not `string`.** Implicit conversion is prohibited in both directions:

```loup
let c: char = c"A";
let n: int    = c.toInt();         # 65  — explicit
let s: string = c.toString();      # "A" — explicit
let s2: string = i"{$ c $}";        # "A" — interpolation auto-converts

let c2: char  = char.of(65)?;      # Option[char]: Some(c"A")  — see note below

let bad: char = "hello"[0];        # ERROR: indexing yields `string`, not `char`
let bad2: char = 65 as char;      # ERROR: E_CHAR_CAST — use char.of(65)
let bad3: int  = c as int;         # ERROR: E_CHAR_CAST — use c.toInt()
```

> **Implementation status.** `char` literals, the method table below and the
> constructors are implemented in script mode and in both compiled-native
> backends. The constructors are split by argument type — `of` for a code point,
> `fromString` for a string — rather than overloaded on `of`, because Loup has no
> overloading and a single `Any`-taking declaration could only work in the tagged
> interpreter. Indexing
> (`s[i]`, `s.char_at(i)`) and iteration (`for (c in s)`) yield a one-character
> `string` in script mode and in both compiled-native backends. Freestanding
> mode iterates a string by BYTE (an `int` per UTF-8 byte) — there is no
> allocator there to build a one-character slice with.

**Methods on `char`:**

```loup
# Code point value
c.toInt(): int                    # Unicode code point as int
c.toString(): string              # single-character string

# Character class (Unicode property based)
c.isAlpha(): bool                 # Unicode general category: letter (L*)
c.isDigit(): bool                 # ASCII digits 0–9
c.isAlphaNumeric(): bool
c.isWhitespace(): bool            # Unicode White_Space property
c.isAscii(): bool                 # code point ≤ 127
c.isUpper(): bool                 # has uppercase simple mapping
c.isLower(): bool                 # has lowercase simple mapping

# Case conversion (Unicode, one scalar to one scalar; see below)
c.toUpper(): char
c.toLower(): char
c.toAsciiUpper(): char            # ASCII-only; no-op for non-ASCII
c.toAsciiLower(): char

# Constructors
char.of(codePoint: int): Option[char]        # None if out-of-range or surrogate
char.fromString(s: string): Option[char]     # None if s is not exactly 1 scalar value
```

**Compiler's rule (`char` case conversion).** `c.toUpper()` / `c.toLower()` are the full Unicode case mapping of the scalar — UnicodeData plus the unconditional SpecialCasing rules, as Rust's `char::to_uppercase` / `to_lowercase` — when that mapping is ONE scalar, and `c` unchanged when it expands to several: `'À'.toLower()` is `'à'`, `'ǅ'.toUpper()` is `'Ǆ'`, `'ẞ'.toLower()` is `'ß'`, while `'ß'.toUpper()`, `'İ'.toLower()` and `'ᾀ'.toUpper()` are unchanged (their mappings are `"SS"`, `"i̇"`, `"ἈΙ"`; the string methods `to_uppercase()` / `to_lowercase()` produce those). The mapping is locale-independent and identical on every lane: both interpreters, the Wasm hosts and every native runtime (whose tables are generated from the same mapping, `gen_case_tables.py`). `toAsciiUpper()` / `toAsciiLower()` change only `a`–`z` / `A`–`Z`. (This revision replaces the earlier wording "simple 1:1 Unicode mapping", which no lane implemented: the UnicodeData simple mapping would take `'İ'` to `'i'` and `'ᾀ'` to `'ᾈ'`.)

**Scalar access on `string`.** Indexing and iteration yield one-character strings (above); the scalar forms are explicit methods on `string`:

```loup
s.chars(): list[string]          # one one-character string per scalar value, in order
s.scalarAt(i: int): char         # the scalar value at index i; IndexError unless 0 <= i < s.length()
s.scalars(): list[char]          # every scalar value, in order
```

**Byte access on `string` (v1.21; the maintainer, 2026-11-04).** A string's UTF-8 encoding is readable byte by byte, without allocating, in every mode:

```loup
s.byteLength(): int              # the length of the UTF-8 encoding, in bytes
s.byteAt(i: int): int            # the byte at BYTE index i, 0..255; IndexError unless 0 <= i < s.byteLength()
```

`byteAt` indexes the encoding, not the scalars: `"é".length()` is `1`, `"é".byteLength()` is `2`, and `"é".byteAt(0)` / `"é".byteAt(1)` are `195` / `169`. Both are O(1); `scalarAt(i)` is O(i) (it walks the scalars before `i`). In `freestanding`, where a string is a borrowed slice, an out-of-range `byteAt` or `scalarAt` is the bounds panic of §3-3.6 (`PanicSource.BoundsCheck`, message `string index out of range`), whatever `[freestanding] bounds` says: the slice's length is a word the read already holds. These methods are the primitive; `core.text` may offer functions over them.

`s.scalarAt(i)` is total on a valid index — a one-character string holds exactly one scalar by construction — so it returns `char`, not `Option[char]`; `char.fromString` remains the bridge for a string that may not be one scalar.

**`char` in compiled mode.** All `char` operations are available in compiled mode. `char` maps to `i32` on the Wasm target and to `uint32_t` at the C ABI boundary. The companion box type `Char` (§1-4.2) is ABI-internal.

| Code | Mode | Condition |
|---|---|---|
| `E_CHAR_LITERAL_INVALID` | All | `c"..."` literal contains zero or more than one Unicode scalar value |
| `E_CHAR_CAST` | All | `as` or `as?` between `char` and any type other than `char`, `Any` or a type parameter (§1-4.3 *Type-parameter operands and targets*) — the conversions are `char.of`, `c.toInt()`, `char.fromString`, `c.toString()` |

**`char` and equality.** `char` implements `Comparable[char]` and `Equatable[char]`, ordered by Unicode code point value.

**Generic collection primitives:**

| Type | Description |
|---|---|
| `list[T]` | Ordered, indexable sequence of `T` |
| `dict[K, V]` | Ordered map from `K` to `V` (insertion order) |
| `set[T]` | Unordered collection of unique `T` values |
| `tuple[T1, T2, ...]` | Fixed-size heterogeneous sequence |

##### Intrinsic methods on `list[T]`

Every `list[T]` value supports the following intrinsic methods. Any other name is
a type error (`type 'list[T]' has no method 'X'`), and so is an arity mismatch
(`function 'X' expects N argument(s), but M provided`): none of these methods is
variadic, because Loup has no overloading (§1-4.1.5), and only one parameter is
optional — `slice`'s `end`, whose default is the length (ruling SLICE-2; the
arity mismatch then reads `function 'slice' expects 1 to 2 argument(s), but M
provided`). User-declared functions may declare default parameter values (§1-7.1.1, ruling DEF-1).

| Method | Parameters | Returns | Description |
|---|---|---|---|
| `length()` / `len()` | — | `int` | Number of elements. |
| `is_empty()` / `isEmpty()` | — | `bool` | True when the length is 0. |
| `push(element)` / `append(element)` | `T` | `void` | Append to the end. |
| `pop()` | — | `T` | Remove and return the last element; `IndexError` when empty. |
| `get(index)` | `int` | `T` | Element at `index`. Negative indices count from the end; out of range raises a catchable `IndexError` (§1-18.3). Prefer `xs[index]`. |
| `set(index, value)` | `int`, `T` | `void` | Replace the element at `index`; same range rule. Prefer `xs[index] = value`. |
| `remove(index)` | `int` | `T` | Remove the element at `index` and return it. |
| `first()` / `last()` | — | `T` | The first / last element; `IndexError` when empty. |
| `clear()` | — | `void` | Remove every element. |
| `contains(element)` | `T` | `bool` | Whether `element` occurs, by structural equality (§1-3.x). |
| `indexOf(element)` / `index_of(element)` | `T` | `int` | Index of the first occurrence, or `-1`. |
| `slice(start, end = length)` | `int`, `int` | `list[T]` | Exactly the bracket slice (§1-5.3): `xs.slice(a)` is `xs[a:]` and `xs.slice(a, b)` is `xs[a:b]` — a new list; a negative bound counts from the end, out-of-range bounds clamp, `start >= end` is empty. |
| `reverse()` | — | `void` | Reverse in place. |
| `sort(comparator)` | `fn(T, T): int` | `void` | Sort in place. The comparator is REQUIRED — see the note below. |
| `join(separator)` | `string` | `string` | Render each element and join with `separator`. |
| `clone()` | — | `list[T]` | A shallow copy. |
| `iter()` | — | iterator over `T` | An explicit iterator; `for (x in xs)` does not need it. |
| `map(transform)` | `fn(T): U` | `list[U]` | Each element transformed. |
| `filter(predicate)` | `fn(T): bool` | `list[T]` | The elements satisfying `predicate`. |
| `reduce(init, reducer)` / `fold(init, reducer)` | `U`, `fn(U, T): U` | `U` | Left fold. |
| `any(predicate)` / `all(predicate)` | `fn(T): bool` | `bool` | Whether any / every element satisfies `predicate`. |
| `to_string()` / `toString()` | — | `string` | Rendering. |

**Empty-list identities.** `any` on an empty list is `false` and `all` on an
empty list is `true`; both short-circuit — `any` stops at the first `true`, `all`
at the first `false`.

**`get` and the subscript agree.** `xs.get(i)` is the method spelling of `xs[i]`:
same negative-index rule, and out of range raises the same catchable `IndexError`
with the same message. A method that answered `None` where the subscript raises
would be a silent difference between two spellings of one operation.

**This table is normative over every implementation** (ruling LIST-1): where an
implementation answered differently — `None` from `pop()`, `first()` or `last()`
on an empty list, a silent no-op from `set` or `remove` out of range, a
`forEach` / `for_each` method — the table wins. `forEach` and `for_each` are not
list methods (`type 'list[T]' has no method 'forEach'`); iterate with
`for (x in xs)`.

*Compiler's rule (one index rule).* `set(index, value)`, `remove(index)` and
`xs[index] = value` resolve their index exactly as `xs[index]` does — a negative
index counts from the end — and out of range raise the subscript's `IndexError`,
whose message names the index as written (`list index 5 out of range (len 3)`).
`first()`, `last()` and `pop()` are positions: `first()` is `xs[0]`, `last()` is
`xs[-1]` and `pop()` removes `xs[-1]`, so on an empty list each raises the
subscript's `IndexError` for that index (`list index 0 out of range (len 0)`,
`list index -1 out of range (len 0)`).

**`sort` takes a required comparator.** There is no zero-argument `sort()`. Loup
has no overloading, so a natural-order sort would have to be a separately named
method rather than an optional parameter; none is defined. `xs.sort()` is
therefore an arity error, not a natural-order sort.

##### Intrinsic methods on `dict[K, V]`

| Method | Parameters | Returns | Description |
|---|---|---|---|
| `length()` / `len()` | — | `int` | Number of entries. |
| `is_empty()` / `isEmpty()` | — | `bool` | True when the dict has no entries. |
| `get(key)` | `K` | `Option[V]` | The value, or `None` when absent. Distinct from `d[key]`, which raises `KeyError` (§1-18.3). |
| `set(key, value)` | `K`, `V` | `void` | Insert or replace. |
| `remove(key)` | `K` | `Option[V]` | Remove and return the value, or `None` when absent. |
| `contains(key)` / `contains_key(key)` / `containsKey(key)` | `K` | `bool` | Whether `key` is present. |
| `keys()` / `values()` | — | `list[K]` / `list[V]` | The keys / values, in insertion order. |
| `entries()` | — | `list[tuple[K, V]]` | The entries, in insertion order. |
| `clear()` | — | `void` | Remove every entry. |
| `clone()` | — | `dict[K, V]` | A shallow copy. |
| `to_string()` / `toString()` | — | `string` | Rendering. |

**Alias spellings are normative.** Where two names appear for one method
(`length`/`len`, `index_of`/`indexOf`, `contains_key`/`containsKey`), both are
part of the surface and an implementation SHALL accept both. They are the same
method, not overloads.

**Ordering.** `dict[K, V]` preserves INSERTION order, and `keys()`, `values()`,
`entries()` and `for (k in d)` all observe it. A rehash or copy does not
reorder.

#### §1-4.1.6 `complex32` and `complex64` — Complex Numbers

`complex32` and `complex64` are first-class primitive types representing IEEE 754-based complex numbers. `complex` is an alias for `complex64`, parallel to `float` being an alias for `float64`.

A complex value consists of two contiguous IEEE 754 floating-point components: the *real part* (declared first in memory) and the *imaginary part* (declared second). For `complex32`, both components are `float32`; for `complex64`, both are `float64`.

| Type | Description | Size | Layout |
|---|---|---|---|
| `complex32` | Single-precision complex | 8 bytes | `[float32 re, float32 im]` |
| `complex64` | Double-precision complex | 16 bytes | `[float64 re, float64 im]` |
| `complex` | Alias for `complex64` | 16 bytes | `[float64 re, float64 im]` |

**Memory layout and ABI compatibility.** The in-memory representation is byte-compatible with the C99 `_Complex` type for the corresponding precision (`float _Complex` and `double _Complex` respectively). This enables zero-copy FFI to numerical libraries that consume complex arrays — BLAS (`cgemm`, `zgemm`), LAPACK (`cgeev`, `zgeev`), FFTW (`fftwf_plan_dft_*`, `fftw_plan_dft_*`), and similar — without conversion or wrapper allocation. The same layout is mandated by the Fortran 2003 `ISO_C_BINDING` module for `C_FLOAT_COMPLEX` and `C_DOUBLE_COMPLEX`, supporting direct interop with translated Fortran code.

**Literal syntax.** Pure-imaginary literals use the `i` suffix (§1-3.6). Mixed real/imaginary values are constructed from a constant real expression plus or minus an imaginary literal:

```loup
let z1: complex   = 2.3i;            # (0.0, 2.3)
let z2: complex   = 1.5 + 2.3i;      # (1.5, 2.3)
let z3: complex32 = 1.5f32 + 2.3i32; # (1.5, 2.3) at single precision
```

For runtime construction from `float` values, use `core.complex.complex(re, im)` (§21.9).

**Supported operations.** All standard arithmetic operators are defined on complex values:

| Operator | Meaning |
|---|---|
| `+`, `-` | Component-wise addition, subtraction |
| `*` | Complex multiplication: `(a+bi)(c+di) = (ac−bd) + (ad+bc)i` |
| `/` | Complex division (with denominator-scaling for numerical stability) |
| Unary `-` | Negation: `-(a+bi) = -a + -bi` |
| `==`, `!=` | Equality / inequality comparisons |

Ordering operators (`<`, `<=`, `>`, `>=`) are **not defined** on complex values — complex numbers are not totally ordered. Attempting to compare complex values with an ordering operator is a compile-time error (`E_COMPLEX_NOT_ORDERED`).

Mixed-precision operations (e.g., `complex32 + complex64`) require an explicit conversion: `complex64(c32) + c64`.

**Methods on complex values.**

```loup
# On both complex32 and complex64 (with appropriate float type):
pub func re(): float        # real part
pub func im(): float        # imaginary part
pub func conj(): complex    # complex conjugate: (a+bi).conj() == (a-bi)
pub func abs(): float       # magnitude (modulus): sqrt(re² + im²)
pub func arg(): float       # argument (phase angle in radians, range (-π, π])
pub func norm(): float      # squared magnitude: re² + im²

# Polar-form conversion:
pub func polar(): (mag: float, phase: float)
```

Construction-style operations (`fromPolar`, polar-from-components, signaling-NaN producers, etc.) live in `core.complex` (§21.9) as free functions rather than as static methods on the type. Free-function variants of the instance methods above are also provided in `core.complex` for use in functional pipelines.

**Special values.** Each component independently follows IEEE 754 special-value rules. A complex value is "NaN" if *either* component is NaN; `core.complex.isNan(z)` (§21.9.5) returns `true` in that case. Equality comparison follows IEEE 754: `nan != nan` and `nan + 0i != nan + 0i`. `0.0 + 0.0i` and `-0.0 + -0.0i` compare equal. Infinities are component-wise: `complex(inf, 1.0)` is a "directed infinity" along the positive real axis.

**Arithmetic edge cases.** Division by zero (`z / (0.0 + 0.0i)`) is permitted and follows IEEE 754: the result is `inf + nan*i` or `nan + nan*i` depending on the dividend. No exception is raised. Multiplication of an infinity by zero produces NaN per IEEE 754. The `core.complex` module provides safe-division and predicate helpers (§21.9).

**Conversion to and from `float`.** A `float` value is implicitly *not* convertible to `complex` — all conversions are explicit:

```loup
let r: float = 3.0;
let z: complex = r;                 # E_NUMERIC_TYPE_MISMATCH
let z2: complex = complex(r, 0.0);  # OK — explicit construction via core.complex
let z3: complex = complex64(r);     # OK — type-conversion form (real part = r, im = 0)
```

This is consistent with Loup's rule against implicit narrowing (§1-4.1.2). The reverse direction — extracting `float` from `complex` — uses the `re()` and `im()` methods.

**Explicit conversion functions.** Following the `int8(x)` / `float32(x)` pattern of §1-4.1.2, complex types provide single-argument conversion forms:

```loup
complex32(z)        # narrow complex64 -> complex32 (possible precision loss in both components)
complex64(z)        # widen complex32 -> complex64 (lossless)
complex32(r)        # float32 or float -> complex32 (im = 0.0)
complex64(r)        # float32 or float -> complex64 (im = 0.0)
```

The two-argument constructor forms `complex(re, im)`, `complex32(re, im)`, and `complex64(re, im)` are provided by `core.complex` (§21.9.1) and are distinct overloads of the same names.

**Transcendental functions.** Complex versions of `exp`, `log`, `sqrt`, and the trigonometric / hyperbolic family are defined in `core.complex` (`cexp`, `clog`, `csqrt`, `csin`, `ccos`, `ctan`, `casin`, `cacos`, `catan`, `csinh`, `ccosh`, `ctanh`, `casinh`, `cacosh`, `catanh`). They are specified normatively in stdlib §21.9.

**`Sendable` and `Shareable`.** Both `complex32` and `complex64` are unconditionally `Sendable` and `Shareable` — they are passed by value with no internal references and can be freely copied across threads or stored in shared arenas (§2-2.2).

**`Numeric` trait.** Both types implement the `Numeric` marker trait (§1-4.0). Generic numeric code constrained on `T: Numeric` accepts complex values for the operations that are defined on them; ordering-dependent generic code must additionally constrain on `T: Comparable[T]`, which complex values do not satisfy.

**Availability.** `complex32` and `complex64` are available in `@mode(web.scripted)`, `@mode(web.compiled)`, `@mode(host.scripted)`, `@mode(host.dual)`, `@mode(host.native)`, and `@mode(freestanding)` for basic arithmetic operations (`+`, `-`, `*`, `/`, comparison, `re()`, `im()`, `conj()`, `norm()`). Operations requiring transcendental floating-point — `abs()` (uses `sqrt`), `arg()` (uses `atan2`), `polar()`, `fromPolar()`, and the `core.complex` transcendental family — require a math runtime that is **not** linked in `@mode(freestanding)` by default. Calling these functions in freestanding mode is `E_FREESTANDING_COMPLEX_TRANSCENDENTAL`. Bare-metal targets that need complex-valued transcendentals must link a math runtime explicitly (the freestanding build supports linking `libm`-equivalent implementations via `extern native`).

**Interchange representation.** When packed into a byte-precise external format (§4-2), `complex32` uses `Encoding.Complex32` (8 bytes: `[float32 re, float32 im]` in declared endianness) and `complex64` uses `Encoding.Complex64` (16 bytes: `[float64 re, float64 im]`). See §4-2.4.

| Code | Mode | Condition |
|---|---|---|
| `E_COMPLEX_NOT_ORDERED` | All | An ordering operator (`<`, `<=`, `>`, `>=`) is applied to a `complex32` or `complex64` value |
| `E_COMPLEX_PRECISION_MISMATCH` | All | A binary arithmetic operator combines `complex32` and `complex64` values without an explicit conversion |
| `E_FREESTANDING_COMPLEX_TRANSCENDENTAL` | `freestanding` | A transcendental complex function (`abs()`, `arg()`, `polar()`, `fromPolar()`, or any `core.complex` member that requires `sqrt`, `log`, `exp`, `sin`, `cos`, `tan`, or their inverses) is called without an explicitly-linked math runtime |



#### §1-4.1.7 Floating-Point Environment

The floating-point environment specifies rounding behaviour and exception flag tracking for binary IEEE 754 operations on `float32`, `float64`, `complex32`, and `complex64`. It is parallel in structure to the decimal arithmetic policy (§1-4.1.4.2) but applies to *binary* IEEE 754 rather than decimal arithmetic.

**Default behaviour.** Without explicit configuration, all binary floating-point operations use IEEE 754 round-to-nearest-even and silently produce the IEEE 754 special values (`±inf`, `nan`) on overflow, underflow, division by zero, and invalid operations. This is the universal default expected by numerical libraries (BLAS, LAPACK, FFTW, NumPy-style code) and matches the behaviour of `float` arithmetic in C, Fortran, Python, JavaScript, and Rust.

This default is **distinct from** the decimal `OverflowPolicy.Trap` default (§1-4.1.4.2). The two policies serve different audiences: financial code on `decimal(p, s)` benefits from trap-by-default to refuse silent corruption; scientific code on `float` benefits from IEEE-default to allow `nan` and `inf` to propagate through computations as intended.

**Scoped rounding mode.** The `core.fpenv.withRounding` function executes a closure under a specified rounding mode, restoring the previous mode on exit:

```loup
from core.fpenv import (RoundingMode, withRounding);

let r1 = withRounding(RoundingMode.Upward, func() {
    return 1.0 / 3.0;          # rounded toward +∞
});

let r2 = withRounding(RoundingMode.Downward, func() {
    return 1.0 / 3.0;          # rounded toward −∞
});
# r2 < r1 — interval-arithmetic-style bracketing
```

**`RoundingMode` enum.** Distinct from the `RoundingMode` of `core.numeric` used for `decimal(p, s)`. The binary FP rounding mode lives in `core.fpenv`:

```loup
namespace core.fpenv;

pub enum RoundingMode {
    ToNearestEven;     # IEEE 754 default — banker's rounding
    ToNearestAway;     # round half away from zero (POSIX default)
    Upward;            # round toward +∞
    Downward;          # round toward −∞
    TowardZero;        # truncate (round toward 0)
}
```

The rounding mode parameter is taken by reference at function entry; the runtime saves the host floating-point control word, sets the requested mode, runs the closure, and restores the saved mode on normal return *and* on exception unwind. Nested `withRounding` calls compose correctly.

**Exception flags.** IEEE 754 sticky exception flags track whether any operation in a region produced an inexact result, underflow, overflow, division by zero, or invalid operation. The full API surface is specified in stdlib §21.11.3; the representative subset:

```loup
pub enum FpFlag {
    Inexact;
    Underflow;
    Overflow;
    DivideByZero;
    Invalid;
}

pub func exceptionFlags(): list[FpFlag];     # currently-set flags
pub func clearExceptionFlags(): void;         # clear all flags
pub func clearExceptionFlag(flag: FpFlag): void;
```

Typical usage for end-of-region detection:

```loup
import core.fpenv;

core.fpenv.clearExceptionFlags();
let result = expensiveComputation(data);
let flags = core.fpenv.exceptionFlags();
if (flags.contains(FpFlag.Overflow) || flags.contains(FpFlag.Invalid)) {
    log.warn("computation produced overflow or NaN");
}
```

Exception flags are *thread-local* and *task-local* — each thread maintains its own flag state, and async tasks inherit the calling task's flags at `await` boundaries but a newly-spawned task starts with cleared flags.

**Signaling NaN.** A signaling NaN (sNaN) is an IEEE 754 NaN encoding that triggers the Invalid exception flag on any arithmetic operation that consumes it (in contrast to a quiet NaN, which propagates through arithmetic without setting flags). The `core.fpenv.signalingNan[T]()` function produces a signaling NaN of the target type:

```loup
let s: float = core.fpenv.signalingNan[float]();
core.fpenv.clearExceptionFlags();
let r = s + 1.0;                                          # r is qNaN
let f = core.fpenv.exceptionFlags();
assert(f.contains(FpFlag.Invalid));
```

Once consumed by an arithmetic operation, the signaling NaN is converted to a quiet NaN per IEEE 754; the result of `s + 1.0` is a quiet NaN, and subsequent operations do not re-trigger the Invalid flag.

**Trapping on exception flags.** IEEE 754 specifies that exception flags *may* be promoted to actual traps (signals or hardware interrupts), but Loup does not expose this. The flag-based query model is the only supported mechanism. This matches the behaviour of all modern Loup-target hardware ABIs (x86-64, AArch64, RISC-V, WebAssembly) where flag-based reporting is the practical default and trap-on-flag is implementation-specific and rarely portable.

**Availability.**

| Mode | `RoundingMode` | `withRounding` | Exception flags | Signaling NaN |
|---|---|---|---|---|
| `host.native`, `host.dual`, `freestanding` | ✓ | ✓ | ✓ | ✓ |
| `host.scripted` | ✓ | ⚠ (no-op; runs body with default mode) | ⚠ (always returns empty list) | ⚠ (returns quiet NaN) |
| `web.compiled` | ✓ | ⚠ (no-op) | ⚠ (always returns empty list) | ⚠ (returns quiet NaN) |
| `web.scripted` | ✓ | ⚠ (no-op) | ⚠ (always returns empty list) | ⚠ (returns quiet NaN) |

In scripted and Wasm modes, the JIT/Wasm runtime does not expose host floating-point control word manipulation; calls succeed but have no effect on rounding behaviour and the flag query always reports empty. Code that requires reproducible cross-platform behaviour under non-default rounding must compile to native (`@mode(host.native)` or `@mode(freestanding)`).

The mode-aware no-op behaviour (rather than an error) is deliberate: it allows code to be written portably with `withRounding` for documentation and reproducibility intent, while running efficiently in scripted environments where the precision of the default rounding is sufficient.

**Numerical reproducibility.** Bit-exact reproduction of floating-point results across platforms is not guaranteed by IEEE 754 alone — fused-multiply-add availability, intermediate precision (especially x87), and library implementations vary. Loup's contract is: *under identical `RoundingMode` and identical compiler optimization level, the AOT pipeline (`@mode(host.native)`) produces bit-identical results across runs on the same `os × arch`*. Cross-platform reproducibility requires additional discipline (avoiding FMA, locking optimization level, controlling library versions) and is documented in the stdlib reference.


### §1-4.2 Box Types

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

The `box` contextual keyword (see §1-4.3) and implicit widening coercions (see §1-4.3) are the correct user-facing mechanisms for value-type-to-`Any` conversion. Use `as` or `as?` for narrowing from `Any`.

### §1-4.3 `Any`

`Any` is the root type for all heap-allocated and boxed values. Class instances are `Any`. Primitives, enums, and structs are not `Any` in their unboxed form.

**Implicit widening.** A primitive, enum, or struct value is **implicitly widened** to `Any` whenever it appears in a position that is statically typed as `Any`. The compiler inserts the boxing instruction silently — no user syntax is required:

```
func log(value: Any): void { print(value.render()); }

log(42);           # int widened to Any implicitly
log("hello");      # string widened to Any implicitly
log(true);         # bool widened to Any implicitly

let values: list[Any] = [1, "hello", true];   # all widened implicitly
```

Implicit widening is available in all modes where `Any` is available. In `@mode(web.compiled)`, `@mode(host.dual)`, and `@mode(host.native)`, `Any` is permitted with the `W_ANY_IN_AOT_MODE` advisory (§1-2.4.2). In `@mode(freestanding)`, `Any` is entirely prohibited, so implicit widening never activates in that mode except at the specific error-boundary positions where `Option[Any]` is permitted.

**`box` keyword — explicit widening.** When the programmer wants to document that a value is deliberately crossing a type boundary, the `box` prefix keyword makes it explicit:

```
let a: Any = box 42;             # explicit widening of int → Any
let b: Any = box myStruct;       # explicit widening of struct → Any
let c: Any = box MyEnum.Variant; # explicit widening of enum → Any
```

`box expr` and implicit widening produce identical compiled output. `box` carries no additional runtime cost or semantics. `box expr` where `expr` is already `Any`-typed is a compile-time warning. `box` is a contextual keyword — special only in prefix expression position. In `@mode(freestanding)`, `Any` is entirely prohibited, so `box` is a compile-time error (`E_BOX_IN_FREESTANDING`); in `@mode(host.native)`, `box` is permitted but emits the `W_ANY_IN_AOT_MODE` advisory.

**`as` — asserting cast (narrowing).** Extracts a value of type `T` from an `Any`-typed expression. Throws `TypeError` if the runtime type does not match — a primitive target by the value's kind, a class, struct, enum or interface target by the subtype test `is` makes (§1-4.7); `None` and an `Option` value match no such target (`o as int` on an `Option[Any]` throws — unwrap it first). An `Option` target matches an `Option` value only (a `Some` or `None`), and a `Result` target a `Result` value only: `(5 as Any) as Option[int]` throws (the interpreters, whose `Option` is always tagged, answered `Some(5)`). A union target `A | B` is asserted member by member, as `is` tests it (§1-4.7 *Compiler's rule (`as` / `as?` with a union target)*). The `TypeError`'s message is `value is not an instance of '<T>'`, `<T>` the target as written (`list[int]`, `int | string`, `tuple[int, string]`), on every lane (b36f-caswc: the interpreters said `cannot cast <kind> to <T>`). A numeric target converts any number (§1-4.1.2) (b36f hostwc H3):

```
let n = value as int;        # int — throws TypeError if not an int
let s = value as string;     # string — throws TypeError if not a string
```

**`as?` — safe cast (narrowing).** Returns `Option[T]`, never throws:

```
let n = value as? int;            # int? — Some(n) or None
let s = value as? string;         # string? — Some(s) or None
let n2 = (value as? int) ?? 0;    # int, defaulting to 0
```

**Collection targets.** Against a built-in collection type — `list[T]`, `dict[K, V]`, `set[T]` — `is`, `as` and `as?` test the value's CONTAINER KIND; the element types are not checked at run time, because a collection value does not record them. So `value is list[int]` is true for any list, `value as dict[string, Any]` throws `TypeError` for a string, an int or a list, and `value as? list[Any]` is `None` for anything that is not a list (loup#505; ruling RT-1). A tuple target — `tuple[A, B]` or `(A, B)` — is read the same way: `value is tuple[int, string]` is true for any tuple and `value as tuple[int, string]` throws `TypeError` for anything else (b36f hostwc H5).

**Type-parameter operands and targets.** On an operand whose static type is a type parameter `T` (§1-12), `as` and `as?` are the asserting and safe casts of this section — narrowing by the value's run-time type, never the numeric conversion of §1-4.1.2 and never `E_CHAR_CAST`: `t as char` is legal and throws `TypeError` unless `T` is `char`, and `t as float` throws `TypeError` when `T` is `int` (ruling Q7). A type parameter, and a user generic class, struct or interface applied to type arguments, may be the target of `is`, `as` and `as?`; the type arguments are checked at run time (§1-12 *Compiler's rule (reified type arguments)*).

`as` and `as?` are available in all six modes. In `@mode(web.scripted)` and `@mode(host.scripted)`, both work freely since `Any` is unrestricted. In `@mode(web.compiled)`, `@mode(host.dual)`, and `@mode(host.native)`, they are valid for concrete type narrowing; uses at `Any` boundaries produce the `W_ANY_IN_AOT_MODE` advisory (§1-2.4.2). In `@mode(freestanding)`, `Any` is entirely prohibited — `as`/`as?` work for concrete narrowing (e.g., `value as int32`) but not for `Any`-typed boundaries.

`match` over `Any` continues to work and is equivalent to a chain of `as?` checks:

```
# These are equivalent for narrowing:
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

### §1-4.4 Function Types

Function types describe callable values:

```loup
fn(int, int): int                  # function taking two ints, returning int
fn(): void                         # function taking no args, returning void
fn(string): Task[int]              # function taking string, returning async task
async fn(string): int              # shorthand for fn(string): Task[int]
gen fn(int): Iterable[int]         # generator function type (shorthand for fn(int): Iterable[int])
async gen fn(string): AsyncIterable[string]  # async generator function type
noescape fn(int): void             # non-escaping function (all modes; see §1-2.6)
async noescape fn(string): int     # non-escaping async function
```

Function types are first-class: they can be stored in variables, passed as arguments, and returned from functions. See §1-7 for function declarations and lambdas.

**The shorthands.** `async fn(P): R` *is* `fn(P): Task[R]` — the type an `async func` declaration or an `async func(…)` lambda has — and a written `Task[R]` return is not wrapped a second time. `gen fn(P): Iterable[T]` *is* `fn(P): Iterable[T]`: the return type already names what a call produces, so `gen` documents the function and adds nothing to the type. For the same reason `async gen fn(P): AsyncIterable[T]` returns its `AsyncIterable[T]` directly, not in a `Task`. The prefixes are written in the order `async gen noescape` (§1-19.7).

**Parameter spelling.** Each parameter of a function type is `[verb] [name:] Type`: an optional ownership verb (`reads`, `edits`, `takes`, `shares`, `borrow`, `excl borrow` — see "Verb modifiers in function types" below), an optional documentation name, then the type. `borrow` is the verb only when no `[` follows it; `fn(borrow[~src] T): R` takes the lifetime-tied borrow *type* of §3-2.4.2.

**Structural compatibility.** Function-type compatibility is structural: it is determined by the parameter *types* (contravariant), the return type (covariant), the async-ness, and any verb/`noescape` modifiers — **not** by parameter *names*. `fn(x: int): bool` and `fn(y: int): bool` are the same type, and a lambda `func(y: int) => y > 0` is assignable wherever an `fn(int): bool` is expected. Parameter names in a function-type spelling are documentation only.

Contravariance means a function that accepts a *wider* parameter type serves a slot that will pass it a narrower one: with `class Dog : Animal`, a `func(a: Animal)` is assignable to `fn(Dog): void`, and a `func(d: Dog)` is **not** assignable to `fn(Animal): void` — the slot's caller may pass any `Animal`. Async-ness is compared through the return type, since `async fn(P): R` is `fn(P): Task[R]`: an async function never fits a synchronous slot, nor the reverse. A lambda's parameter verbs are part of its type exactly as a declared function's are (`func(edits buf) { … }` is an `fn(edits T): …`). An incompatible assignment, argument or return is an ordinary type mismatch.

**`noescape fn` — non-escaping function type.** The `noescape` modifier on a function type asserts that the function value will only be called within the current call frame and will not be stored, returned, or spawned into a task. This allows the compiler to elide the ARC retain/release on the closure and potentially stack-allocate its captured variables.

`noescape fn` is valid in all execution modes (§1-2.6). In modes with ARC (`@mode(host.native)`, `@mode(host.dual)`) it elides retain/release; on the Wasm target it enables escape-analysis-driven stack allocation of captures.

**Subtype rule.** `fn(T): R` is a subtype of `noescape fn(T): R` at call sites. A value of type `fn(T): R` may be passed where `noescape fn(T): R` is expected — the callee's contract is more restrictive, which is safe. The reverse is not true: a `noescape fn` value may not be widened to `fn`.

**Storage prohibition.** A value of type `noescape fn(T): R` may not be stored in any position whose lifetime extends beyond the current call frame: no class fields, no struct fields, no module-level bindings, no `let`/`var` whose scope outlives the frame. Attempting to store a `noescape fn` value is a compile-time error (`E_NOESCAPE_ESCAPE`).

Concretely, `E_NOESCAPE_ESCAPE` is reported for a `noescape fn` **type** written as the type of a class or struct field, of a module-level binding, as the return type of a function, method, lambda or function type, or as a type argument (`list[noescape fn(int): void]`, `Option[noescape fn(): void]`, a user generic); and for a `noescape fn` **value** assigned to a field or a collection element, or returned. A parameter — of a declaration or of a function type — and a local binding are the positions a `noescape fn` may occupy. Widening a `noescape fn` value into an escaping `fn` slot (a local, an argument) is the type mismatch of the subtype rule below.

**Compiler's rule (capture).** A closure that refers to a `noescape fn` binding declared outside it — a `noescape fn` parameter of the enclosing function, or a local holding one — captures the frame-bound value and is itself a `noescape fn` value: it may be called, bound to a local and passed to a `noescape fn` parameter, and every rule of this section applies to it. Passing it to an escaping `fn` parameter, binding or assigning it to an escaping `fn`-typed binding, returning it or storing it is `E_NOESCAPE_ESCAPE` — reported as the escape, not as the widening mismatch of the subtype rule, since the closure was never written `noescape`. A `noescape fn` binding, or a closure that captured one, may not be handed to a thread — an argument of `Thread.spawn`, `Thread.spawnWith`, `ThreadPool.run` or `spawnBlocking` — nor be the callee or an argument of a `spawn` expression: the thread or task outlives the frame (`E_NOESCAPE_ESCAPE`; ruling NOESC-1).

**ARC semantics.** A `noescape fn` parameter is passed as a raw function pointer and captured environment pointer without ARC-retaining the closure object. For closures whose captures are all stack-resident values, the compiler may represent the entire closure on the stack with no heap allocation.

**Type aliases with `noescape fn`:**

```loup
type Predicate[T] = noescape fn(reads T): bool;
type Transform[T, R] = noescape fn(reads T): R;
type Mutator[T] = noescape fn(edits T): void;
type Action = noescape fn(): void;
```

These aliases are valid in all execution modes (§1-2.6).

| Code | Mode | Condition |
|---|---|---|
| `E_NOESCAPE_ESCAPE` | All | `noescape fn` value stored in a position that outlives the current call frame (field, module binding, spawn closure) |

**Verb modifiers in function types.** Each parameter position in a `fn(...)` type may carry an optional verb modifier. The verb is part of the type and determines the acknowledgment the caller must provide:

```loup
fn(reads Buffer): void               # explicit reads — same as fn(Buffer): void
fn(Buffer): void                     # implicit reads — equivalent to above
fn(edits Buffer): void               # caller must use edits: acknowledgment
fn(takes Buffer): void               # caller must use takes: acknowledgment
fn(reads Buffer, edits Buffer): void # mixed: first implicit-ok, second required
```

**Calling a verb-typed function.** When calling a value whose function type declares a verb modifier, the call site must provide the matching verb acknowledgment, exactly as it would for a named parameter:

```loup
let fill: fn(edits Buffer, uint8): void = func(edits buf, v) { ... }

fill(edits: myBuf, 0xFF)         # ✓ edits: acknowledgment — required
fill(myBuf, 0xFF)                # ✗ E_VERB_REQUIRED — edits must be acknowledged

let render: fn(reads Buffer): string = func(reads buf) { ... }

render(reads: myBuf)             # ✓ explicit reads acknowledgment
render(myBuf)                    # ✓ implicit reads — no acknowledgment needed
```

**Higher-order functions.** Verb-typed function parameters correctly express the ownership contract for callbacks:

```loup
func forEach(
  items: list[Buffer],
  body:  fn(reads Buffer): void
): void {
  for (item in items) {
    body(item)                    # ✓ implicit reads — no acknowledgment needed
    # body(reads: item)          // also valid — explicit reads
  }
}

func transform(
  src:  Buffer,
  dst:  Buffer,
  body: fn(reads Buffer, edits Buffer): void
) requires edits(dst): void {    # src is implicitly reads; no requires needed
  body(reads: src, edits: dst)
}
```

**Subtype rule for verb-typed functions.** The implicit `reads` equivalence applies to all function type forms that carry `FnTypeParamList`: `fn(T): R` and `fn(reads T): R` are the same type; `async fn(T): R` and `async fn(reads T): R` are the same type; `noescape fn(T): R` and `noescape fn(reads T): R` are the same type. No-verb is implicit `reads` in every position. A function declared with `reads` or without a verb on a given parameter is assignable to either form. `fn(edits T): R`, `fn(takes T): R`, and `fn(shares T): R` are each distinct types. None is a subtype of another, and none is a subtype of `fn(reads T): R` — calling semantics and ownership contracts differ. Exact verb matching is required for assignment compatibility of `edits`, `takes`, and `shares` function types. The same distinctness rules apply to `async fn` and `noescape fn` forms.

**`requires distinct()` in function types.** `requires` clauses with `distinct()` need to reference parameters by name. Function types use positional parameters without names, so `distinct()` contracts are not supported in function type positions. Express disjointness contracts at the declaration site of the function that accepts the callback, not in the function type itself.

**Return-position markers in function types.** A function type's return position accepts the two markers that are not types values can have: `fn(): void`, which yields nothing, and `fn(): noreturn`, which never yields because the call does not complete. `noreturn` in a function type carries the same promise as on a declaration, so a *value* of type `fn(): noreturn` is a diverging call when invoked, and code after that invocation is subject to §1-6.12's reachability rule exactly as a direct call would be.

A field, binding or parameter **of** such a function type is legal — `var onFatal: fn(string): noreturn` holds a callable, not a `noreturn` value. What is illegal is a field, binding or parameter whose own type is `noreturn`, which is `E_NORETURN_POSITION`. The distinction is the same one that makes `fn(): void` legal while a `void` parameter is `E_VOID_POSITION`: a marker is admissible in the return slot of a function type and nowhere else.

`impossible` is a type, not a marker, so it obeys the type-argument restriction of §1-4.4b in function types as anywhere else: `fn(): Result[int, impossible]` is legal, `fn(impossible): int` is `E_IMPOSSIBLE_POSITION`.

**`noescape fn` and `Callable[A, R]`.** `noescape fn` is not a subtype of the `Callable[A, R]` interface (§1-11.2). `Callable` is for escaping callable values that may be stored and called later. Non-escaping callable parameters are expressed via `noescape fn` types directly. A `list[noescape fn(int): void]` is a compile-time error.

### §1-4.4a `noreturn`

*(This section is normative.)*

`noreturn` is the **return-type marker of a call that does not complete**. It is not in the primitive table of §1-4.1 and it is not a type a value can have: like `void` it describes what happens at a return position, not what may be stored (see the type glossary, and BV-2 for why `void`'s absence from §1-4.1 is likewise deliberate).

```loup
func halt(msg: string): noreturn {
    throw FatalError(msg)
}

func idle(): noreturn {
    while (true) { }
}
```

**The one legal position.** `noreturn` SHALL appear only as the return type of a function declaration or of a function type (§1-4.4). In any other position — a parameter, a binding, a field, a struct or class member, a cast target, a union member, a type argument, a generic bound — it is `E_NORETURN_POSITION`.

> The restriction is enforced by keeping the name out of the named-type table entirely and recognising it only where it is legal. That is why every illegal position is an error without a position flag threaded through type resolution, and why the diagnostic is uniform.

**What a `noreturn` body SHALL do.** Every path through the body diverges. A path diverges when it ends in a `throw`, a call to another function whose return type is `noreturn`, an `unreachable` expression (§1-5.11), or a loop with no reachable exit. A body with a path that completes normally is `E_NORETURN_FALLTHROUGH`; a `return` statement anywhere in the body is `E_NORETURN_RETURNS` (§1-7.8).

**Divergence is not proven through inline assembly.** A body whose only non-completing construct is an `asm` block — a bare `asm { "1: b 1b" }` with no enclosing loop — does **not** satisfy the rule. The compiler does not model assembly, and a rule that assumed divergence there would hold in cases where it is false. Write the loop in Loup and place the assembly inside it. This is the shape a freestanding idle loop and a `@panic_handler` (§3-3.6) both take.

**What a caller may do with the result: nothing.** A call to a `noreturn` function yields no value. What makes the type useful is that such a call is accepted wherever a value of any type is expected, because control never arrives at the point that would consume it:

```loup
func pick(n: int): int {
    if (n > 0) { return n; }
    halt("negative")               # no `return` needed: the call ends the path
}

func choose(t: int): int {
    return match t {
        0 => 10,
        _ => halt("unknown tag")   # arm type is `noreturn`; the match is still `int`
    };
}
```

**Coercion rule (normative).** A `noreturn`-typed expression is compatible with every type and is **excluded from any common-type computation** it participates in — `match` arms (§1-9.4), conditional expressions (§1-5.4), and block-expression results. The common type of a set of arms is computed over the arms that are *not* `noreturn`; if every arm is `noreturn`, the whole expression is `noreturn`. This is what lets a diverging arm sit beside typed arms without widening them, and it is a different rule from the coercion of a *value* — there is no value here to convert.

**Completion analysis.** A `noreturn` call is an end of control flow for every analysis that asks whether a path completes: the missing-`return` check, definite assignment, and the reachability rule of §1-6.12. A function whose last statement is a `noreturn` call needs no `return`.

| Code | Mode | Condition |
|---|---|---|
| `E_NORETURN_POSITION` | All | `noreturn` in any position other than a function or function-type return type |
| `E_VOID_POSITION` | All | `void` as a parameter, binding or field type — like `noreturn` it marks a return position, not a type a value can have (BV-2) |

### §1-4.4b `impossible`

*(This section is normative.)*

`impossible` is the **uninhabited type**: no value of it can be constructed, so a signature naming it declares that the case cannot occur. It is a type-checker construct with no runtime footprint in any mode.

```loup
func parse(text: string): Result[Ast, ParseError] { … }

# This parser cannot fail — and says so in the type, not in a comment.
func parseTrusted(text: string): Result[Ast, impossible] { … }
```

**Where it is legal.** `impossible` SHALL appear only as a **type argument**, and only where that argument lands in an **enum variant payload**. Concretely:

| Form | Legal | Why |
|---|---|---|
| `Result[T, impossible]` | yes | the argument is the `Err` variant's payload |
| `Option[impossible]` | yes | the argument is `Some`'s payload |
| `E[impossible]` for `enum E[T] { A(T), B }` | yes | the parameter is used directly as a payload |
| `E[impossible]` for `enum E[T] { A(T), B(list[T]) }` | **no** | `B(list[impossible])` is inhabited — an empty list exists |
| `list[impossible]`, `dict[K, impossible]` | **no** | a collection of an uninhabited type is inhabited (it can be empty) |
| a parameter, binding, field, return type, union member | **no** | `E_IMPOSSIBLE_POSITION` |

The transitive condition is the load-bearing half: a generic enum admits `impossible` for a parameter only if **every** occurrence of that parameter in the declaration is a direct variant payload. Otherwise the instantiated type is inhabited and the exhaustiveness carve-out of §1-9.4 would be unsound.

**Why the restriction rather than a general uninhabited type.** A zero-variant `enum` is illegal (`E_ENUM_NO_VARIANTS`, §1-9.1), so `impossible` is the *only* uninhabited type in the language, and confining it to the position where it has a defined meaning is the whole containment story. There is no second spelling for a user to reach for, and no position where the compiler must decide what an uninhabited element type means.

**`impossible` is not `noreturn`.** `noreturn` says an expression never yields; `impossible` says a type has no values. `func f(): noreturn` is legal and `func f(): impossible` is `E_IMPOSSIBLE_POSITION`; `Result[T, impossible]` is legal and `Result[T, noreturn]` is `E_NORETURN_POSITION`.

**Generic instantiation (§1-4.8).** `impossible` as a type argument participates in constraint checking like any other: a parameter declared `where T: Comparable` is not satisfied by `impossible`, because the type implements nothing. In practice the admissible positions are payload slots of `Result`, `Option` and user enums, whose parameters are unconstrained; a constrained parameter and `impossible` are mutually exclusive by construction rather than by a separate rule.

| Code | Mode | Condition |
|---|---|---|
| `E_IMPOSSIBLE_POSITION` | All | `impossible` in any position other than a type argument landing in an enum variant payload |

### §1-4.5 Union Types

Union types express that a value may be one of several types without declaring a named enum:

```
let value: string | int = "hello";
let result: string | int | None = None;

func parse(input: string): int | float | None {
  # ...
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
    # value is narrowed to string in this branch
    print(value.toUpperCase());
  } else {
    # value is narrowed to int in this branch
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

**Neither `noreturn` nor `impossible` is a legal union member.** A union is a set of types a value may have, and both of these describe the absence of that: `noreturn` is a return-position marker rather than a type (`E_NORETURN_POSITION`), and `impossible` has no values to contribute, so `string | impossible` would mean exactly `string` while inviting the reader to think otherwise (`E_IMPOSSIBLE_POSITION`). `void` is excluded on the same grounds (`E_VOID_POSITION`). Where the intent is "this case cannot occur", express it in the enum payload that carries the case — `Result[T, impossible]` (§1-4.4b) — not by adding an empty alternative to a union.

**Union types in compiled, native, and freestanding modes.** Union values are represented as tagged values where the tag identifies the active type. All constituent types must be statically known. `Any` is not permitted as a union member in these modes — all types in the union must be concrete and statically resolvable.

**Relationship to enums.** Enums are nominal, closed, and declared — they define named variants with optional payloads. Union types are structural, open, and inline — they combine existing types without a declaration. Enums are preferred when variants have semantic meaning (e.g., `Shape`). Union types are preferred for ad-hoc "one of these types" situations (e.g., `string | int`). A union type cannot contain enum variants directly — use the enum type itself: `Shape | None`, not `Circle | Rect | None`.

### §1-4.6 Type Aliases

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
type Bad = list[Bad];   # E_TYPE_ALIAS_RECURSIVE: recursive type alias
```

| Code | Mode | Condition |
|---|---|---|
| `E_TYPE_ALIAS_RECURSIVE` | All | Type alias definition expands to itself, creating infinite expansion |

**Mode availability.** Type aliases are available in all six execution modes. The aliased type must conform to the respective mode's type restrictions (e.g., `Any` is not available as an alias target in `@mode(host.native)` or `@mode(freestanding)`; in `@mode(web.compiled)` it produces the `W_ANY_IN_AOT_MODE` advisory per §1-2.4.2).

### §1-4.7 `typeof` and `instanceof` Operators

Loup provides inline operators for type inspection as surface sugar over `core.reflect`:

**`typeof` operator.** Returns a `Type` value for any expression:

```
let t = typeof 42;              # Type for int
let t2 = typeof someObject;     # Type for the object's runtime type
let name = (typeof x).name;     # "int", "string", "MyClass", etc.
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
    # value is narrowed to string here
    print(value.toUpperCase());
  } else if (value instanceof int) {
    # value is narrowed to int here
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

*Compiler's rule (`is Any`).* Every value is a subtype of `Any`, so `expr is Any` (and `expr instanceof Any`) is `true` for every value — a class instance, a struct value, a scalar, a string, a collection, `None` — on every lane, whatever `expr`'s static type. A class the program never constructs matches nothing, and a struct target matches a value of that struct only. (loup#572: the Stage0 interpreter alone answered `false`; ruling IS-2.)

*Compiler's rule (`is` on a statically scalar operand).* When the static type of `expr` is a scalar — `int` or a fixed-width integer, `float`, `float32`, `bool`, `char` or `string` — and the target is one too, `expr is P` is decided by that static type: `true` exactly when they are the same scalar, `false` otherwise. Every integer width is its own scalar (`let u: uint8 = 3; u is int` is `false`, `u is uint8` is `true`); `int64` is `int`. The operand is still evaluated. Every lane answers so (the checker decides it and both lowerings fold the test); an operand of static type `Any`, a union or a type parameter is tested at run time by the value's kind. (b36f: natively a scalar carries no run-time kind, so `let x = 5; x is int` was `false` on Stage0's LLVM and Cranelift lanes and refused by the self-hosted emitter and the C backend, and the interpreters disagreed on the integer widths.)

*Compiler's rule (`is` with a union target).* `expr is A | B …` holds when the value is one of the members: it is `expr is A or expr is B or …` with `expr` evaluated once (a nested union's members count as the outer union's). Each member is tested exactly as it would be alone — a class or interface by the subtype test, a scalar by the value's kind, a string or container by its kind, an enum or an enum variant by the value's identity — and when `expr`'s static type is a scalar the static type decides, as in the rule above: `true` exactly when a member is that scalar or `Any`. Every lane answers so. (b36f-slotwc7, coordinator NOTE 18 (a): both interpreters answered `false` for every union target — their run-time test knew no union — and the managed native lanes `true` for every value, because the union rewrite of Volume 3 had made the target `Any`.)

*Compiler's rule (`as` / `as?` with a union target).* `expr as A | B …` asserts that the value is one of the members, by exactly the test `expr is A | B …` makes (the rule above: `expr` evaluated once, each member tested as it would be alone, a statically scalar operand decided by its static type): when it holds the cast is the value itself, as a value of the union (on the managed native lanes a union with a non-object member is an `Any` word, so an `Any` operand's word is kept and any other value enters it as an `Any` position takes it, Volume 3); otherwise it throws a catchable `TypeError("value is not an instance of 'A | B'")`, the union as written. `expr as? A | B …` is `Some(expr)` exactly when the test holds and `None` otherwise. Every lane answers so. (b36f-caswc: both interpreters' `as` never threw and their `as?` always answered `None` — their cast test knew no union —, and on the managed native lanes `as` never threw, kept the payload rather than the word, and `as?` never answered `None`, because the union rewrite of Volume 3 had made the target `Any`; Stage0 refused an object-only union's `as?`.)

*Compiler's rule (`is` on classes and interfaces).* `expr is C` for a class `C` is `true` when the runtime class of `expr` is `C` or extends it through any number of `: Base` links — a grandchild included, a sibling or a parent never. `expr is I` for an interface `I` is `true` when the runtime class, or any class on its superclass chain, implements `I` directly (an `implements` clause, or the `class C : I` supertype form) or implements an interface that extends `I` through any number of `interface J : I` links; an unrelated interface is `false`. A struct value answers an interface target by its own `implements` clause (structs have no superclass), wherever it is held — a struct-typed binding, an `Any`, a collection element; a struct TARGET matches a value of that struct only. Every lane answers so — both interpreters, every native backend, both wasm hosts (maintainer ruling IS-1, loup#595; until then every lane answered the exact class).

*Compiler's rule (a path as the `is` target).* The target of `is` or `as?` may name a type by its braced-namespace PATH (`x is ns.B`, `x is a.b.Deep`, `x as? ns.B`) and an enum variant through one (`e is ns.E.Y`); the path is resolved as any type path is — through the namespace's members to the declaration — so `x is ns.B` is exactly `x is B` inside the namespace. Every lane answers so (loup#666; a two-segment path was read only as `Enum.Variant`, and Stage0's interpreter and native backends answered `false` for a `ns.B` instance).

*Compiler's rule (a variant target names the operand's enum).* When the target of `is` is an enum VARIANT — `x is E.V`, through a namespace path (`x is ns.E.V`) or an import alias — `V` must be a variant of `E`: otherwise it is the error a construction naming no variant gets (`variant 'V' not found in enum 'E'`). And when the operand's static type is a known enum (or `Option`), `E` must be that enum: an `is` test that names another enum's variant (`x is F.Q` with `x: E`) is `E_MATCH_WRONG_ENUM`, exactly as a qualified variant pattern naming another enum is (§1-9.4). The rule does not apply when the operand is `Any` or a type variable; the test is then answered from the value at run time. (b36f-capwc2, ruling of 2026-10-31: both checkers accepted both shapes and every lane compared the variant's TAG alone, so `x is E.Q` tested another enum's `Q` and `x is F.Q` on an `E.B(3)` answered `true`.)

*Compiler's rule (`as?` is `is`, then the cast).* `expr as? T` for a class, struct or interface `T` is `Some(expr)` exactly when `expr is T` holds by the rule above, and `None` otherwise — never a trap, never the bare value, on every lane: both interpreters, every native backend that lowers it, both wasm hosts; a primitive or collection target keeps §1-4.3's rule (a value that already is the requested primitive, a collection by its container kind — ruling RT-1). So `dog as? Named` is `Some` when `Dog` implements `Named`, and `dog as? Cat` is `None` for a sibling class (design row CAST-1, loup#598: the wasm hosts trapped on the mismatch, the interpreters walked the superclass chain only, and the native lanes answered `None`, `Some` or refused, whatever the runtime class). The asserting `as` is not changed by this rule. On the native lanes a scalar held in an `Any` is a tagged box (Volume 3 native `Any`), so `x as? int|float|bool|char` on an `Any` reads the box's tag exactly as `x is int` does — `Some(payload)` when it matches, `None` otherwise (an unboxed word is never one of the scalars) — and a string or collection target stays refused at build time there (RT-1; design row ASQ-1, loup#691: Stage0 refused every primitive target and the self-hosted lane answered `Some` for every one).

**Negated checks.** A negated `instanceof` or `is` check narrows nothing in its own body — there the variable retains its original type:

```
if (!(x instanceof string)) {
  // x is NOT narrowed here — type remains unchanged
}
```

*Compiler's rule (a diverging guard).* What a negated test excludes holds AFTER a guard that diverges: when `if (not (x is E.V)) { … }` has no `else` and its body always leaves (`return`, `throw`, `break`, `continue`, a `noreturn` call, or an `if` whose every branch leaves), the rest of the block knows `x is E.V`, and after `if (not (a is E.V) or not (b is F.W)) { return; }` it knows both tests. For an enum VARIANT test this is the narrowing §1-9.1's payload-access rule reads (`x.N` after the guard is legal); a class, interface or union target keeps the variable's declared type after the guard as in its body. (Ruling ENUMNARROW-1, which replaced "a negated check does not narrow" for enum variants.)

*Compiler's rule (a disjunction of `is` checks).* `if (x is A or x is B)` does not narrow `x` either: in the branch it keeps its declared type, so a member read through it is judged against that type — on a union, §1-4.5's rule applies (`x.name` with `x: A | B | C` is an error when `C` has no `name`, "Use 'is' narrowing"; with `x: A | B` it is permitted when both classes declare `name`), and on an `Any` it is the gradual `Any` access. Every lane reads such a member from the runtime class's own layout, wherever that class declares it. When the union mixes a value type (a struct) with a reference class that both declare the member, the native lanes classify the receiver at run time and read the member at the layout of what it is (compilation §3-2.4 *no name-based guess across value and reference types*); narrowing with `is` and binding the value to a declared type gives the static layout. (Row DISJ-1, loup#681: both checkers already left the variable unnarrowed; the self-hosted one also accepted a member only some union classes have, and its native lanes read a union's common field at the wrong offset.) A disjunction of enum VARIANT tests, `x is E.A or x is E.B`, is different: it narrows `x` to that set of variants for a payload access, which is legal when the variants agree at the position (§1-9.1, ruling ENUMNARROW-1).

**Compiled, native, and freestanding modes.** `typeof` is permitted in all compiled modes — it returns compile-time-baked `Type` metadata with no runtime overhead. `instanceof` is permitted for concrete types where the check resolves to a tag comparison or static type knowledge. In `@mode(freestanding)`, `core.reflect` is unavailable, so `typeof` and `instanceof` work only for compile-time-resolvable types — using them against `Any` or dynamic types is a compile-time error (`E_FREESTANDING_REFLECT`).

### §1-4.8 Generics

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
  return if (a > b) { a } else { b };
}

class SortedList[T: Comparable[T]] : Any {
  # ...
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
let x = identity(42);        # T inferred as int
let y = identity("hello");   # T inferred as string
```

Explicit type arguments may be provided when inference is ambiguous:

```
let empty = Box[int](value=0);
```

See §1-12 for the full generics specification, including detailed rules for constraints, reification, variance, and inference across all declaration forms (functions, classes, interfaces, enums, and structs).

### §1-4.9 Tuple Type Details

Tuples are fixed-size, heterogeneous sequences with positional access:

```
let pair: tuple[int, string] = (42, "hello");
let triple: tuple[bool, float, string] = (true, 3.14, "pi");
```

**Type-annotation syntax.** A tuple type is written in either of two equivalent
forms, both resolving to the same tuple type:

- **Parenthesized** — `(T1, T2, …)`, mirroring the value-construction syntax.
  This is the canonical form and the only form available in *return-type*
  position, where the leading `tuple` keyword would otherwise be required:

  ```
  func divmod(a: int, b: int): (int, int) {   # tuple return type
      return (a / b, a % b);
  }
  let q: (int, int) = divmod(17, 5);          # parenthesized let annotation
  func first(p: (int, string)): int { return p.0; }   # parameter annotation
  ```

- **Generic** — `tuple[T1, T2, …]`, the explicit named form (shown above).

A parenthesized type with exactly one element, **no** trailing comma, and **no**
label is a *grouped type*, not a 1-tuple: `(int)` is `int`. This mirrors the
value-side rule that `(42)` is an `int` while `(42,)` is a 1-tuple (see
**Single-element tuples** below). Tuple types nest (`((int, int), bool)`).

**Labeled elements.** A parenthesized tuple-type element may carry an optional
*descriptive label* — `name: T`:

```
func toPolar(r: float, t: float): (mag: float, phase: float) { return (r, t); }
let p: (mag: float, phase: float) = toPolar(2.5, 0.9);   # p.0, p.1 unchanged
```

Labels are **documentary only**: they do not participate in type identity,
subtyping, or assignability, and element access remains positional (`p.0`,
`p.1` — *not* `p.mag`). A labeled tuple type and the same type without labels
are the **same type** — `(mag: float, phase: float)` and `(float, float)` are
mutually assignable. Labels may be mixed with unlabeled elements
(`(count: int, string, ok: bool)`). Because a label is meaningless on a grouped
type, a labeled single element is always a 1-tuple: `(only: int)` is
`tuple[int]`, not `int`. Labels are preserved by the formatter but otherwise
carry no runtime or type-system weight.

> Tuples are a *managed* aggregate (heap-allocated, like `list`/`dict`), so
> tuple values are available in script, interpreted, and Wasm-compiled modes
> but not under `@mode(freestanding)` (§3-3); the type annotation parses in all
> modes, but constructing a tuple value freestanding is unsupported.

**Element access** uses zero-based indexing with compile-time constant indices:

```
let first = pair.0;    # 42 : int
let second = pair.1;   # "hello" : string
```

**Destructuring:**

```
let (x, y) = pair;
let (a, b, c) = triple;
let (head, *rest) = (1, 2, 3, 4);  # head = 1, rest = (2, 3, 4)
```

**Single-element tuples** require a trailing comma to distinguish from parenthesized expressions:

```
let single = (42,);    # tuple[int]
let parens = (42);     # int (not a tuple)
```

Tuples have value semantics: two tuples are equal if all their elements are equal (structural equality). Tuples are hashable if all their elements are hashable.



### §1-4.10 Multi-Dimensional Arrays

`array[T, rank]` is a primitive type representing a strided multi-dimensional array of element type `T` with statically-known *rank* (number of dimensions). It is distinct from `list[T]` (a 1-D dynamically-resized vector) and from `loup.tensor.Tensor` (a lazy computation graph for accelerator dispatch). Multi-dimensional arrays are the foundation type for numerical computing, scientific applications, hardware register tables, and as a translation target for languages with first-class multi-dimensional array semantics (Fortran, MATLAB, NumPy, Julia).

**Type parameters.**

```loup
array[T, rank, order: Order = RowMajor, base: int = 0]
```

| Parameter | Kind | Description |
|---|---|---|
| `T` | type | Element type. Must be `Sendable` for the array as a whole to be `Sendable`. Common choices: `int32`, `int64`, `float32`, `float64`, `complex32`, `complex64`. Element types may also be arbitrary structs and classes. |
| `rank` | `int` literal, 1–7 | Number of dimensions. Statically fixed. Rank 0 (scalar) and rank > 7 are not permitted (`E_ARRAY_RANK_RANGE`). |
| `order` | `Order` enum, optional | `Order.RowMajor` (default) or `Order.ColumnMajor`. Determines memory layout: row-major iterates the rightmost (last) axis fastest; column-major iterates the leftmost (first) axis fastest. |
| `base` | `int` literal, 0 or 1, optional | Index base. `0` (default) means index 0 refers to the first element along each axis (Loup default, C/Python convention). `1` means index 1 refers to the first element (Fortran/MATLAB convention). |

`Order` is an enum in `core.array`:

```loup
namespace core.array;

pub enum Order {
    RowMajor;
    ColumnMajor;
}
```

**Base interconversion.** Because `base` is a type parameter, `array[T, rank, base: 0]` and `array[T, rank, base: 1]` are distinct types. They are not implicitly interconvertible — passing a `base: 1` array to a function that accepts `base: 0` (or vice versa) is a compile-time type error at the call site. To convert between bases, use `core.array.rebase` (specified in §21.10.4) which returns a view sharing the same storage but with the index base reinterpreted in the type system; the underlying data is not touched. The destination base must be 0 or 1 — `E_ARRAY_BASE_RANGE` otherwise. Typical usage relies on type ascription on the result binding to drive inference, e.g. `let a0: array[float, 2, base: 0] = rebase(a1)`. Generic code that should accept arrays of either base should declare its base parameter as a generic literal: `func op[T, r: int, b: int](a: array[T, r, base: b])`; the body is responsible for using `0..a.shape[i]`-style iteration that is base-agnostic, or normalising the array to base 0 with `rebase` at function entry.

**Shape.** Every array carries a runtime shape — a `list[int]` of length equal to `rank`, where each element is the count of items along that axis. Shape is observed via the `.shape` field; it is immutable after construction. The total number of elements (`size`) equals the product of the shape's dimensions. Symmetric with the `shape:` parameter of `core.array` constructors, which accept a `list[int]` of the same form.

```loup
let a: array[float, 2] = arr.zeros[float, 2]([3, 4]);
print(a.shape);   # [3, 4]
print(a.size);    # 12
print(a.rank);    # 2
```

**Construction.** The `core.array` module (§21.10) provides constructors:

```loup
import core.array as arr;

let zeros: array[float, 2]   = arr.zeros[float, 2]([3, 4]);          # 3×4, all 0.0
let ones:  array[int32, 1]   = arr.ones[int32, 1]([10]);             # 1-D length 10
let id:    array[float, 2]   = arr.eye[float](4);                    # 4×4 identity
let rng:   array[int, 1]     = arr.arange(0, 100, 5);                # 0,5,10,...,95
let lin:   array[float, 1]   = arr.linspace(0.0, 1.0, 11);           # 11 values, 0..1

# From a flat list with explicit shape:
let m: array[float, 2] = arr.fromList(
    data:  [1.0, 2.0, 3.0, 4.0, 5.0, 6.0],
    shape: [2, 3],
    order: arr.Order.RowMajor,
);
```

Constructing an array of size that exceeds memory is `E_ARRAY_ALLOC` at runtime (heap arrays in `@mode(host.*)`) or a compile-time error if the size is statically known and exceeds a configured limit (`E_ARRAY_SIZE_LIMIT`).

**Indexing.** Multi-dimensional arrays use comma-separated indices within square brackets:

```loup
let a: array[float, 3] = arr.zeros[float, 3]([2, 3, 4]);
a[1, 2, 3] = 5.0;
let v = a[0, 0, 0];

# 1-based:
let f: array[float, 1, base: 1] = arr.fromList(data: [10.0, 20.0, 30.0], shape: [3]);
let x = f[1];   # 10.0 (first element, 1-based)
let y = f[3];   # 30.0 (last element)
let z = f[0];   # E_ARRAY_INDEX_OUT_OF_RANGE (index 0 invalid for 1-based array)
```

Indices must be `int`-typed. Integer overflow on the index expression is checked under the same rules as ordinary integer arithmetic (§1-4.1.1).

**Negative indexing.** A negative scalar index in `a[i, j, ...]` is interpreted as a count-from-the-end offset for `base: 0` arrays — `a[-1]` is the last element along the first axis, equivalent to `a[a.shape.0 - 1]`. Negative scalar indices are **not permitted** on `base: 1` arrays — for those, a negative integer is unambiguously out-of-range (since the valid index domain starts at 1), so applying one is `E_ARRAY_SCALAR_NEGATIVE_BASE_1` at compile time when statically known, or `ArrayIndexError` at runtime. The slicing syntax of §1-5.9 supports negative bounds in *both* base modes: `a[-3:]` is the last three elements regardless of the array's `base:` setting, because slice negative resolution is unambiguous.

**Whole-array operations.** Operators on arrays of compatible shapes produce element-wise results without requiring explicit loops:

```loup
let a: array[float, 2] = arr.fromList(data: [1.0, 2.0, 3.0, 4.0], shape: [2, 2]);
let b: array[float, 2] = arr.ones[float, 2]([2, 2]);
let c = a + b;          # [[2, 3], [4, 5]]
let d = a * 3.0;        # [[3, 6], [9, 12]]   — scalar broadcast
let e = a == b;         # array[bool, 2]      — element-wise comparison
```

When the shapes are not statically known to conform, the compiler emits a runtime conformance check; element types must be compatible (numerical broadcasts: `int + float` produces `float` per §1-3.7). Fully-static shape conformance produces an unconditional vectorized loop with no runtime check (`E_ARRAY_SHAPE_MISMATCH` at compile time for static mismatches).

**Linear-algebra operations.** Beyond element-wise arithmetic, the dot product and matrix multiplication operations are native methods:

```loup
let x: array[float, 1] = arr.fromList(data: [1.0, 2.0, 3.0], shape: [3]);
let y: array[float, 1] = arr.fromList(data: [4.0, 5.0, 6.0], shape: [3]);
let s: float = x.dot(y);                       # 32.0

let m: array[float, 2] = arr.zeros[float, 2]([3, 3]);
let n: array[float, 2] = arr.zeros[float, 2]([3, 3]);
let p: array[float, 2] = m.matmul(n);          # 3×3 result

# Transpose (rank-2 only, swapping the two axes):
let t = m.transpose();                          # shape (3, 3) with order swapped

# Reshape (must preserve total element count):
let v: array[float, 1] = m.reshape([9]);        # flatten
```

For high-performance linear algebra dispatched to BLAS/LAPACK, GPUs, or TPUs, see `loup.blas`, `loup.lapack`, and the `loup.tensor` package. The primitive `array[T, rank]` provides correct sequential implementations; package-level alternatives provide accelerated implementations.

**Order conversion.** `RowMajor` and `ColumnMajor` arrays of the same shape and element type are convertible via `.toOrder(order)`:

```loup
import core.array as arr;

let row: array[float, 2, order: arr.Order.RowMajor]    = ...;
let col: array[float, 2, order: arr.Order.ColumnMajor] = row.toOrder(arr.Order.ColumnMajor);
```

Conversion is a *rearrangement* — the bytes are moved into the destination order. For zero-copy passing to a Fortran or BLAS routine that expects column-major, declare the array as `ColumnMajor` from the start; for passing to C-style row-major code, declare it as `RowMajor` (the default).

**Distinct from `list[T]`.** `list[T]` is 1-D and dynamically resizable; `array[T, 1]` has a fixed shape after construction. List operations like `append`, `pop`, and `insert` are not defined on arrays. Arrays support shape-changing operations (`reshape`, `transpose`) that produce new arrays sharing or copying the underlying storage.

**`Iterable[T]` conformance.** `array[T, rank]` implements `Iterable[T]` (§1-11.2) for any rank. The for-in form `for (x in a)` desugars to `for (x in core.array.iter(a))` and visits all elements in the array's storage order (last-axis-fastest for `RowMajor`, first-axis-fastest for `ColumnMajor`). For sub-array iteration along a chosen axis, use `core.array.iterAxis` explicitly (§21.10.6); for index-bearing iteration, use `core.array.enumerate`.

**Distinct from `loup.tensor.Tensor`.** `loup.tensor.Tensor` is a high-level lazy computation graph designed for backend dispatch (CUDA, Metal, WebGPU, TPU). `array[T, rank]` is a low-level primitive with predictable in-memory layout, suitable as the FFI exchange type and as the translation target for legacy numerical code. The two interoperate: `Tensor.fromArray(arr)` constructs a tensor from an eager array, and `tensor.toArray[T, rank]()` materialises an evaluated tensor's data back into an eager array (both specified in `loup.tensor`, package reference §21.28).

**Memory ownership.** An `array[T, rank]` value owns its underlying storage by default. Slicing (§1-5.9) produces *views* — new array values that reference the same storage with adjusted shape and stride. Whole-array assignment (`a = b`) is a value copy by default; views can be passed by `borrow` for cheap aliasing. Specifically:

- `arr.fromList(...)` allocates and owns the storage.
- An array section expression `a[i:j, k:l]` (§1-5.9) returns a view; the view's lifetime cannot exceed the original.
- `let b = a;` is a value copy; mutating `b` does not affect `a`.
- `a.copy()` produces an independent copy explicitly.

Lifetime tracking for views uses the same labelled-borrow machinery as `borrow[~name]` (§3-2.4.2 in the compilation volume); a view-producing operation returns `array[T, rank']` with an inferred lifetime tied to the source.

**Compile-time vs runtime shape.** Shape is in general a runtime value, but the compiler may statically infer it for arrays constructed from literal shapes or with fully-typed parameters. When the shape is statically known, conformance checks for whole-array operations are eliminated and SIMD/vectorization opportunities are enabled (`@vectorize` hints become effective). The `array[T, rank, shape: [N1, N2, ...]]` form (with `shape` as a const-list type parameter) declares a fully-static-shaped array; this form is principally used for hardware register tables and compile-time-constant lookup arrays.

**`@interchange` integration.** An array field within an `@interchange` type uses `Encoding.Array` with explicit `element:`, `shape:`, and `order:` parameters (see §4-2.4). The auto-derived pack/unpack methods handle stride conversion automatically when the in-memory `order` differs from the wire-format `order`.

**`Sendable`, `Shareable`, and `Numeric`.** An `array[T, rank]` is `Sendable` if `T` is `Sendable`, and `Shareable` if `T` is `Shareable`. The element type need not be `Numeric` for the array to exist, but element-wise arithmetic and linear-algebra methods require `T: Numeric`.

**Element type constraints when used as a struct field.** When `array[T, rank]` appears as a field of a `struct` (§1-10.3.1), the value-type invariant propagates to `T`: the element type must itself satisfy the struct value-type rule. An `array[SomeClass, 2]` is permitted as a top-level value or as a class field, but **not** as a struct field — the compiler emits `E_STRUCT_CLASS_FIELD` at the struct-field declaration site, with the diagnostic referring to the array's element type. Use `array[unique SomeClass, 2]` (single-owned class references) or wrap the class instances in a value-type adapter when array-of-class storage in a struct is needed.

**Availability.** `array[T, rank]` is available in all execution modes including `@mode(freestanding)`. Stack-allocated arrays with statically-known shape (`array[T, rank, shape: [...]]`) require no allocator. Heap-allocated arrays require an `@allocator` to be registered in the freestanding case (§3-3) and use the standard runtime allocator otherwise. Element-wise arithmetic on `complex32`/`complex64`-typed arrays is subject to the freestanding restrictions on complex transcendental functions (§1-4.1.6).

**Performance characteristics.**

- Element access by static index: O(1), single load instruction on most hardware.
- Slicing: O(1), produces a view with no element copy.
- Whole-array `+`, `-`, `*` on element types ≤ 64 bits with statically-known shape: SIMD-vectorized when targeting `@mode(host.native)` and the target architecture supports it. For Wasm targets, SIMD is gated on `@mode(web.compiled)` with the relevant target flags.
- `matmul` for matrices: dispatches to the platform's BLAS implementation when `loup.blas` is installed; otherwise uses a tiled scalar implementation. Performance is documented per package.
- Storage layout is contiguous within `RowMajor` / `ColumnMajor` constraints; arbitrary stride patterns produced by slicing are also contiguous along the slow axis but may have non-unit stride along the fast axis.

| Code | Mode | Condition |
|---|---|---|
| `E_ARRAY_RANK_RANGE` | All | `rank` parameter outside the range 1–7 |
| `E_ARRAY_INDEX_OUT_OF_RANGE` | All | Index expression outside the array's bounds for the relevant axis |
| `E_ARRAY_SHAPE_MISMATCH` | All | Whole-array operation between arrays of statically-incompatible shapes |
| `E_ARRAY_SIZE_LIMIT` | All | Statically-known total size exceeds the configured per-allocation limit |
| `E_ARRAY_ALLOC` | Runtime | Heap allocation failed at array construction |
| `E_ARRAY_BASE_RANGE` | All | `base` parameter is not 0 or 1 |
| `E_ARRAY_ORDER_MISMATCH` | All | Method called on an array with the wrong `order` (e.g., a Fortran-only routine called on `RowMajor`) |
| `E_ARRAY_NOT_ORDERED` | All | An ordering-dependent operation (`min`, `max`, `argmin`, `argmax`, `sort`) is applied to an array of an unordered element type, e.g. `array[complex64, _]` |
| `E_ARRAY_AXIS_RANK_TOO_LOW` | All | An axis-reduction operation (`sumAxis`, `meanAxis`, etc.) called on a rank-1 array (the result type would degenerate to rank 0). Use the scalar reduction form (`sum`, `mean`, etc.) instead |


---

---

## §1-5 Expressions

*(This section is normative.)*

### §1-5.1 Operator Semantics

Operators in Loup are defined on primitive types and may be extended to user-defined types through the `Comparable[T]` interface. This section specifies the semantics of every operator category.

**Evaluation order (normative).** Operands are evaluated **left to right**, in source order, regardless of operator precedence or associativity. Precedence determines how operands are *grouped*, not the order in which they are *evaluated*: in `a() + b() * c()` the calls run `a`, `b`, `c` even though the multiplication binds tighter. The same rule governs calls — a method's receiver stands to the left of its arguments and is evaluated first, and arguments are evaluated left to right — and it holds for operators that are dispatched through an overload (`a + b` invoking `a.op_+(b)`, §1-5.2) exactly as for built-in ones.

Each operand is evaluated **exactly once**. The short-circuit operators `and` and `or` are the sole exception to full evaluation: they may skip their right operand entirely (see *Logical Operators* below), but when it is evaluated it is still evaluated after the left.

#### Arithmetic Operators (`+`, `-`, `*`, `/`, `//`, `%`, `**`)

| Left | Op | Right | Result | Notes |
|---|---|---|---|---|
| `int` | `+` `-` `*` `/` `%` | `int` | `int` | `/` truncates toward zero; `%` follows truncation sign |
| `int` | `//` | `int` | `int` | Floor division — truncates toward −∞ (e.g. `-7 // 2 = -4`) |
| `float` | `+` `-` `*` `/` `%` | `float` | `float` | IEEE 754 double-precision arithmetic |
| `float` | `//` | `float` | `float` | Floor division toward −∞; same sign rules as `int` |
| `bigint` | `//` | `bigint` | `bigint` | Floor division toward −∞ |
| `decimal` | `//` | `decimal` | `decimal` | Floor division toward −∞; result has zero fractional part |
| `int` | any | `float` | (compile error) | `E_NUMERIC_TYPE_MISMATCH` — no implicit promotion between the integer and floating-point families; convert explicitly (loup#289) |
| `float` | any | `int` | `float` | The `int` operand is promoted to `float` |
| `complex64` | `+` `-` `*` `/` | `complex64` | `complex64` | Component-wise IEEE 754 complex arithmetic per C99 §6.5; `/` is the algebraic division |
| `complex32` | `+` `-` `*` `/` | `complex32` | `complex32` | Single-precision complex arithmetic |
| `complex32` | any | `complex64` | (compile error) | Mixed-precision complex arithmetic is `E_COMPLEX_PRECISION_MISMATCH`; explicit conversion required (see §1-4.1.6) |
| `complex` | `%`, `//`, `**` | any | (compile error) | Complex types do not support `%` (no remainder), `//` (no ordering), or `**` (use `core.complex.cpow`) |
| `array[T, rank]` | `+` `-` `*` `/` | `array[T, rank]` | `array[T, rank]` | Element-wise; both operands must have identical statically-known shape (`E_ARRAY_SHAPE_MISMATCH` otherwise). The element-type operation must itself be defined for `T` |
| `array[T, rank]` | `+` `-` `*` `/` | `T` (scalar) | `array[T, rank]` | Scalar broadcast — applies the operation element-wise with the scalar; commutative form `T op array[T, rank]` is also accepted |
| `string` | `+` | `string` | `string` | Concatenation |
| `list[T]` | `+` | `list[T]` | `list[T]` | Concatenation (produces a new list) |
| `int` | `**` | `int` | `int` | Integer exponentiation; negative exponent is a runtime error |
| `float` | `**` | `float` | `float` | Floating-point exponentiation — see the rounding note below |

Unary `-` negates `int`, `float`, `complex32`, `complex64`, and `array[T, rank]` (element-wise) values. Unary `+` is the identity on `int`, `float`, and complex types.

Division by zero (`/` or `%` with a zero right operand) throws `IntegerDivisionError` (§1-18.1) for integer types and produces IEEE 754 infinity or NaN for `float`. Floor division (`//`) by zero is also `IntegerDivisionError` for integer types; for `float`, it returns `±Infinity` or `NaN` per IEEE 754. The `decimal` types raise `NumericDivisionError` (a separate exception, §21.7.4) on division by zero — `decimal` arithmetic is policy-driven and uses its own error class. Use `checkedDiv`/`checkedRem` (§3-3.19) to receive `Option.None` instead of an exception.

**`**` rounding.** For an integer exponent the result is exact where representable — implementations compute it by repeated multiplication, so every conforming backend agrees. For a FRACTIONAL exponent the result is **implementation-defined in the final ulp**: backends route `float ** float` through the host's `pow`, which IEEE-754 does not require to be correctly rounded (unlike `sqrt`, which it does). Two conforming implementations may therefore differ by one ulp — measured, `4.9e16 ** 0.5` yields `221359436.21178657` on the Rust bootstrap and `221359436.21178654` (the correctly-rounded square root) elsewhere. Programs that require a reproducible root across implementations should use `core.math.sqrt` rather than `** 0.5`, and conformance corpora should restrict `**` with a fractional exponent to inputs whose result is exactly representable.

**`/` vs `//`:** `/` truncates toward zero (`-7 / 2 = -3`); `//` truncates toward negative infinity (`-7 // 2 = -4`). For positive operands both produce the same result.

#### Comparison Operators (`<`, `>`, `<=`, `>=`)

Comparison operators are available on types that implement the `Comparable[T]` interface (see §1-11.2):

```
interface Comparable[T] : Equatable[T] {
  func compareTo(other: T): int;
  # Default == provided automatically; may be overridden by operator func ==
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
| `int` (and width-suffixed variants) | Numeric ordering |
| `float`, `float32`, `float64` | IEEE 754 total ordering (NaN is unordered — comparisons involving NaN return `false`) |
| `decimal`, `decimal(p, s)` | Numeric ordering |
| `string` | Lexicographic ordering over Unicode scalar values |
| `bytes` | Lexicographic ordering over byte values |
| `char` | Code-point ordering |

**Types that do NOT implement `Comparable`:**

- `complex32`, `complex64` — complex values are not totally ordered (the field of complex numbers admits no order compatible with arithmetic). Applying `<`, `>`, `<=`, or `>=` to a complex value is `E_COMPLEX_NOT_ORDERED` at compile time. Use component projections (`.re()`, `.im()`) or magnitudes (`.abs()`) for ordering-dependent operations.
- `array[T, rank]` — arrays are not totally ordered as values. Element-wise comparison of two arrays produces an `array[bool, rank]`; whole-array Boolean reductions are obtained through `core.array.all` and `core.array.any` (§21.10.3). Direct use of `<`, `>`, `<=`, `>=` between array values is `E_NOT_COMPARABLE`.

User-defined classes and structs may implement `Comparable[T]` to enable comparison operators. If a comparison operator is applied to a type that does not implement `Comparable[T]`, the compiler emits `E_NOT_COMPARABLE`.

#### Equality Operators (`==`, `!=`)

Equality semantics depend on the type category:

- **Primitives** (`int`, `float`, `bool`, `string`, `bytes`): structural equality (value comparison).
- **Complex types** (`complex32`, `complex64`): structural equality — both real and imaginary components must be equal under IEEE 754 (so `nan + 0i != nan + 0i`, and `0.0 + 0.0i == -0.0 + -0.0i`). Complex types do **not** support ordering operators (`<`, `>`, `<=`, `>=`); see §1-4.1.6.
- **`array[T, rank]`**: structural equality — same shape and same element values pairwise (using `T`'s equality semantics). `order` and `base` differences do not affect equality. The compiler synthesizes the comparison; arrays of unequal shape compare unequal without raising. See §1-4.10.
- **Enums**: structural equality — same variant and same payload values (compared recursively).
- **Structs**: structural equality — all fields are equal (compared recursively).
- **Tuples**: structural equality — all elements are equal (compared recursively).
- **Collections** (`list[T]`, `dict[K,V]`, `set[T]`): **referential identity** — two collections are equal only if they are the same object. `[1,2] == [1,2]` is `false`; `let a = [1,2]; a == a` is `true`. This is deliberate and matches what every backend lowers `==` to for them. Compare contents explicitly (element-wise, or via a helper) when structural comparison is what you want. Note the asymmetry with tuples above: a tuple is a fixed-shape value, whereas a collection is a mutable reference, so structural equality on it would change meaning as the object is mutated.
- **Classes**: if the class implements `Equatable[T]`, `==` calls `op_==(other)`. Otherwise, referential identity (two references equal only if they point to the same object). `Comparable[T]` implies `Equatable[T]` — implementing it provides `==` as `compareTo(other) == 0`, which may be overridden by an explicit `operator func ==`.
- `None == None` is `true`.

*Compiler's rule (struct equality).* `a == b` on a struct type that defines no equality of its own (no `operator func ==`, not `Equatable` / `Comparable`) compares the two values STRUCTURALLY, field by field in declaration order: a number by value (IEEE for a float), a `string` or `bytes` by content, an enum by variant and payload, a nested struct, a tuple and an `Option` / `Result` recursively, and a `list` / `dict` / `set` held in the struct's value (a field, or anywhere inside one) by its ELEMENTS — the same length, key set or members, each compared by this rule — rather than by the collections bullet's identity. A struct is a pure value whose copies are fully independent (§1-10.3.1), so `let b = a; a == b` holds for every struct value. A nested struct is compared by this rule even when its own type declares `op_==`; that method applies where its type is an operand of `==`. A `unique` class reference or a function value in a struct's value compares by identity. The same answer on every lane: both interpreters, both Wasm hosts, and every native backend (loup#682; row EQ-2 in `specs/x-update-v1_20-to-v1_21/design.md`).

*Compiler's rule (equality through `Any`).* When an operand of `==` / `!=` is an `Any` (or a union with a non-object member, which is an `Any` position), the comparison is decided at run time by the two VALUES' categories, by the rules above: two numbers of one family by value (every integer width is one family; `float` and `float32` are one, by IEEE value; an integer and a floating-point number are never equal — no promotion; a `bool` is no integer, nor a `char` a string), two strings by content, two enum values of the SAME enum by variant and payload (an equal tag of another enum is unequal), two `Option` / `Result` values recursively, two structs of the same type field by field, a class instance or a collection by identity; values of different categories or types are unequal (never an error). A class or struct that defines its own equality runs its `op_==` only when the right operand is of its own type (a subtype included); with any other right operand the answer is `false`. The same holds where an `Any` sits inside a compared value (an `Option[Any]` payload, an `Any` enum payload, a tuple element) and for `contains` / `indexOf` on a `list[Any]`. The same answer on every lane: both interpreters, both Wasm hosts and every native backend (natively each `Any` word is classified without dereferencing a word nothing vouches for, `__loup_runtime_value_eq_dyn`; §3 *Compiler's rule (union positions, enum identity and the descriptor box through `Any`)*). Stage0's hosted C backend has no `Any` box protocol and refuses such a comparison at build time (`E-BUILD-NATIVE`). (Before: the native lanes compared the words — a string by its address, `false == 0` true, an enum or an `Option` by its block, `any == "x"` on an integer crashed —, Stage0's interpreter answered `E.A == F.A` true, both interpreters compared structs through `Any` by identity and ran a user `op_==` on a value of another type, the self-hosted one promoted `1 == 1.0`.) (b36wc enumwc3 round 5, ruling B1; coordinator NOTES 9 / 11 / 13.)

Equality is reflexive (`a == a`), symmetric (`a == b` implies `b == a`), and transitive (`a == b` and `b == c` implies `a == c`) for all types.

`!=` is always the logical negation of `==` — including for a class or struct with its own `operator func ==`, where `a != b` is `not a.op_==(b)` (loup#668).

*Compiler's rule (equality operands).* Which operand-type pairs `==` and `!=` accept — one rule for both operators and for every spelling (a literal left operand, which stays a primitive comparison, and a variable one, which is dispatched as `a.op_==(b)`):

1. A `NativeHandle` operand (§2-3) is opaque — it has no operators, equality included (`E_OPERATOR_MISSING`, whatever the other operand); a `NativeHandle?` compared with `None` is an `Option` comparison (rule 3). Otherwise an operand of type `Any`, of an unresolved type, or of a type holding a type parameter is accepted: the comparison is decided at run time (gradual typing).
2. Numeric operands: an integer with a floating-point operand is `E_NUMERIC_TYPE_MISMATCH` (no implicit promotion, ruling SQ-2), and so are two DIFFERENT fixed integer widths (`uint8 == uint16`, ruling RT-2); `int` with a fixed-width partner, any other pair of integers and two floating-point operands are accepted.
3. `None` with `None` or with an `Option[T]` is accepted.
4. A class or struct that defines its own equality — an `operator func ==`, or `Equatable[T]` / `Comparable[T]` in its `implements` clause — on the LEFT takes a right operand of its own type (assignable to it).
5. Otherwise the operands must be of one type or of related types: the same type (a class, struct, enum or interface by its declaration), collections, `Option`s, `Task`s or tuples whose element types are related the same way, or one type assignable to the other (a subclass and its base, a class and an interface it implements, a union and one of its members).

Any other pair — `bytes == 1`, `"3" == n`, a class and an unrelated class, an enum and a string — is `E_EQUALITY_TYPE_MISMATCH` at compile time: its answer would be `false` whatever the values, so the comparison is a mistake, not a test. A class, struct or interface-typed operand compared under rule 5 has no `op_==` to call; the comparison is the category's own (identity for a class instance, through an interface-typed reference too) in both spellings. (loup#625; row EQ-1 in `specs/x-update-v1_20-to-v1_21/design.md`, approved by the maintainer.)

| Code | Mode | Condition |
|---|---|---|
| `E_EQUALITY_TYPE_MISMATCH` | All | `==` / `!=` on operands of unrelated types (the *Compiler's rule (equality operands)* above) |

**Consistency rule.** Implementing `Equatable[T]` on a type used as a `set[T]` element or `dict` key without also implementing `Hashable` is a compile-time error. Elsewhere, it is a compile-time warning.

#### Logical Operators (`and`, `or`, `not`)

- `a and b` — short-circuit: evaluates `b` only if `a` is `true`. Both operands must have type `bool`; result is `bool`.
- `a or b` — short-circuit: evaluates `b` only if `a` is `false`. Both operands must have type `bool`; result is `bool`.
- `not a` — logical negation. Operand must have type `bool`; result is `bool`.

Non-`bool` operands are a compile-time error (`E_LOGICAL_NOT_BOOL`). There is no truthy/falsy coercion.

#### Bitwise Operators (`&`, `|`, `^`, `bnot`, `<<`, `>>`)

Bitwise operators are defined on all integer types: `int`, `uint`, `int8`, `int16`, `int32`, `int64`, `uint8`, `uint16`, `uint32`, `uint64`. Both operands must have the same integer type; no implicit promotion occurs across integer types (narrowing or widening is explicit — see §1-4.1.2).

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
- `string[i]` → the one-character `string` at scalar index `i` (§1-4.1.5; `s.char_at(i)` is the same operation). Out-of-range throws `IndexError` — `0 <= i < s.length()` is the whole valid range: strings have no count-from-the-end form, so a negative index is out of range.
- `bytes[i]` → `uint8` byte value at index `i`.
- `tuple.N` → element at compile-time constant index `N` (integer literal: `pair.0`, `triple.2`). §1-4.9

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
  pub operator func +(other: BigInt): BigInt { ... }  # non-mutating — returns new value
  pub modifier operator func +=(other: BigInt): void { ... }  # mutating — modifier required
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

### §1-5.2 Comprehensions

Loup supports list, dict, and set comprehensions for concise collection construction.

**List comprehensions** produce `list[T]` where `T` is inferred from the expression before `for`. The source of a `for` clause is any `Iterable[T]`, or the range form `start..end` (§1-6.4):

```
let squares = [x * x for x in 0..10];
let evens = [x for x in 0..100 if x % 2 == 0];
let pairs = [(x, y) for x in 0..3 for y in 0..3];
```

**Dict comprehensions** produce `dict[K, V]` where `K` and `V` are inferred from the key and value expressions:

```
let index = {name: i for (i, name) in names.enumerate()};
let upper = {k: v.toUpperCase() for (k, v) in headers.entries()};
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
# equivalent to:
# var __result: list[T] = [];
# for (row in matrix) { for (cell in row) { __result = __result + [cell]; } }
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

A comprehension containing `await` requires the enclosing context to be async. Iteration is sequential (one `await` per iteration), not concurrent — use `TaskGroup.collect` for concurrent execution (see §2-1.3).

**Template expressions.** Comprehensions are permitted inside template inline expressions:

```
{$ [item.name for item in items] | join(", ") $}
```

**Compiled mode.** Comprehensions are permitted in compiled mode — they desugar to statically-typed loops with no `Any` or reflection involved. The element, key, and value types must be statically known.

Comprehensions eagerly build the full collection. For lazy evaluation, use generator expressions (see §1-7.5).

### §1-5.3 Slicing

Loup supports Python-style slice syntax on indexable types:

```
let items = [10, 20, 30, 40, 50];
let sub = items[1:4];          # [20, 30, 40]
let every2 = items[0:5:2];    # [10, 30, 50]
let tail = items[2:];          # [30, 40, 50]
let head = items[:3];          # [10, 20, 30]
let copy = items[:];           # [10, 20, 30, 40, 50] (shallow copy)
let rev = items[::-1];         # [50, 40, 30, 20, 10]
```

**Negative indices** count from the end:

```
let last2 = items[-2:];        # [40, 50]
let noEnds = items[1:-1];      # [20, 30, 40]
```

**Supported types:**

| Type | Slice Result |
|---|---|
| `list[T]` | `list[T]` |
| `string` | `string` (operates on Unicode scalar values — NOT bytes, NOT grapheme clusters) |
| `bytes` | `bytes` |
| `tuple[...]` | `tuple[...]` (only when start/end are compile-time constants) |

**Tuple slices.** A tuple is sliced only when every bound written — start, end and step — is a *compile-time constant*: an integer literal, optionally negated (`t[-2:]`, `t[::-1]`). Any other bound, a named binding included, is a compile-time error, because the result's static type is the tuple of the selected elements' types in slice order: `(1, "a", 2.5)[::-1]` is `tuple[float, string, int]`, and `t[3:1]` is the empty tuple `()`.

**Receivers and bound types.** Every bound and the step of a slice must be `int`. Slicing any type other than those in the table above (or an array, §1-5.9) is a compile-time error, as is more than one axis on a sequence (`xs[1:2, 0:1]`) or a single-index axis in slice position.

For multi-dimensional arrays (`array[T, rank]`, §1-4.10), the slice syntax extends to multi-axis section expressions (`a[1:5, :, 2:8:2]`) which return *views* over the source array's storage rather than copies. The full semantics — view lifetime tracking, multi-axis section selection, and assignment-through-view — are specified in §1-5.9.

**Slice bounds behavior:**

- `start` defaults to `0` if omitted.
- `end` defaults to `len(collection)` if omitted.
- `step` defaults to `1` if omitted.
- Out-of-range indices are **clamped** to valid bounds without error (matching Python semantics).
- A `step` of `0` is a runtime `ValueError` ("slice step cannot be zero"). A step written as a literal zero (`xs[::0]`) is rejected at compile time (`E_ARRAY_INDEX_STEP_ZERO`, §1-5.9). In a compiled module without handler machinery a zero step is a guarded fault (§1-18.4).
- Negative `step` reverses iteration direction.

**Slice assignment** on mutable collections:

```
var items = [1, 2, 3, 4, 5];
items[1:3] = [20, 30, 40];    # items = [1, 20, 30, 40, 4, 5]
items[2:] = [];                # items = [1, 20]
```

Slice assignment is only valid on `var` bindings of `list[T]`. The replacement list element type must be assignable to `T`.

**Compiler's rule (slice assignment).** The sliced expression must *name* a `var` binding — a local or module-level `var`; a `let` binding, a parameter, a field, an element or any other expression is a compile-time error, as is slice assignment to a `string`, `bytes` or tuple (an array section is §1-5.9's). The slice takes no step: `xs[a:b:s] = ys` is a compile-time error. The assignment REBINDS the variable: `xs[a:b] = ys` is `xs = xs[:lo] + ys + xs[max(lo, hi):]`, where `lo` and `hi` are `a` and `b` resolved exactly as a slice's bounds (negative from the end, clamped to `[0, len]`; `a` defaults to `0` and `b` to `len`). So the length may change, and a slice that selects nothing inserts at `lo` (`xs[3:1] = ys` inserts `ys` before element 3). The operands are evaluated left to right — `xs`, `a`, `b`, then `ys` — each once. Because the variable is rebound to a fresh list, another binding that referred to the old list keeps it unchanged (ruling SLICE-1).

**The `slice` method (ruling SLICE-2).** `list[T]`, `string` and `bytes` each have a method `slice(start: int, end: int = length)` that is the method spelling of this operator and nothing else: `x.slice(a)` is `x[a:]` and `x.slice(a, b)` is `x[a:b]`, under every rule of this section — a negative bound counts from the end, out-of-range bounds clamp, `start >= end` selects nothing, a string slices by Unicode scalar, and the result is a fresh value of the receiver's type. `end` is a default argument: omitted, the slice runs to the end. There is no step argument (`x[a:b:s]` is the only strided form).

*Compiler's rule (slice method).* Every lane evaluates `x.slice(a, b)` as it evaluates `x[a:b]` — the interpreters through the same bound resolution as the operator, the native backends through the same runtime call (`start` always written, `end` written only when passed, a unit step). `string.substring(start, end)` and `bytes.substring(start, end)` are NOT aliases of the operator: they clamp a negative index to `0`.

**Negative indexing** (single element, not a slice):

```
let last = items[-1];          # last element
let secondLast = items[-2];
```

Out-of-range negative indices throw `IndexError`.

**String slicing performance.** Because UTF-8 is variable-width, string slicing requires scanning from the beginning to find byte boundaries and is O(n) in the string length. For byte-level slicing, convert to `bytes` first: `core.text.toBytes(s)[a:b]`. For grapheme-level slicing, use `core.text.graphemeSlice(s, a, b)` (§21.1).

Slicing is permitted in template expressions (`{$ name[:10] $}`) and in compiled mode.

### §1-5.4 Conditional Expressions

Loup has **no ternary operator**. A `?` that follows a complete operand is always the §1-5.7 propagation operator; nothing else may be spelled with `?`. Inline conditional selection is written with `if`/`else` used **as an expression** (ruled 2026-09-05, loup#294 / SQ-3; `if` as an expression is normative per BV-4, §1-6.3):

```loup
let label = if (count > 0) { "items" } else { "empty" };
let abs = if (x >= 0) { x } else { -x };
let display = if (user != None) { user.name } else { "Anonymous" };
```

**Rules:**

- The condition must have type `bool`; a non-`bool` condition is a compile-time error (`E_CONDITION_NOT_BOOL`).
- An `if` used as an expression MUST have an `else` branch (an `else if` chain must end in `else`); every branch's block yields the value of its final expression.
- The branches must have a compatible type. The result type is the common supertype of the branches.
- A branch whose type is `noreturn` (§1-4.4a) is **excluded from that computation**: the common type is taken over the branches that can yield. `let x = if (ok) { compute() } else { halt("no") };` has type of `compute()`, not a union with anything. If every branch is `noreturn` the expression is `noreturn`, and the code after it is unreachable (§1-6.12).
- *Compiler's rule (the branch join).* The type of an `if` expression is computed over the branches whose block ends in an expression statement (a branch ending in a binding, a `return`, a statement-form `if` or a loop contributes nothing), `noreturn` branches excluded as above: when they are all of one NOMINAL kind — the same class, interface or enum declaration, or collections / `Option`s whose element types are, where an element typed by an empty literal (`[]`, `{}`) is compatible with any — the type is the first branch type without such an empty-literal element (so `if (c) { [] } else { [1] }` is a `list[int]`); otherwise, when every branch is `None` or one `Option[T]`, it is `Option[T]`; otherwise it is `Any` (two unrelated classes, or two different primitives). Both checkers compute the same join (row IFJ-1, loup#687: the self-hosted checker typed a multi-statement branch `Any` and read the THEN branch alone; Stage0 joined a `noreturn` branch into `Any`). An `if` whose only contributing branches are all `None` is `None`, and `let x = …` then reports that a bare `None` names no type to infer.
- Only the selected branch is evaluated (short-circuit).
- A conditional expression is valid anywhere an expression is valid: variable initializers, function arguments, return values, template expressions, comprehensions.
- Permitted in compiled mode.

**Rationale.** One meaning per symbol is easier to read and to analyse than a context-sensitive `?`; the `? :` form was never parseable next to postfix `?` propagation on either lane (loup#294), and `if`/`else` already carries the same power explicitly.

### §1-5.5 Null-Safe Indexing

Null-safe indexing allows safe element access on optional collections:

```
let items: list[int]? = Some([10, 20, 30]);
let first = items?.[0];          # Option[int] — Some(10)

let empty: list[int]? = None;
let missing = empty?.[0];        # Option[int] — None
```

**Null-safe slicing:**

```
let sub = items?.[1:3];          # Option[list[int]] — Some([20, 30])
let none = empty?.[1:3];         # Option[list[int]] — None
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
let port = config?.["port"];     # Option[int] — Some(8080)
```

Permitted in compiled mode.

### §1-5.6 Optionality Sugar

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

**Option accessors (`unwrap` / `expect`).** Unlike `??` and `?.`, which are total,
the accessors are partial and SHALL fail when there is no value:

- `opt.unwrap()` evaluates to `v` when `opt` is `Some(v)`. When `opt` is `None` it
  SHALL throw `UnwrapError` (§1-18.1) with the message
  ``called `unwrap()` on a None value``.
- `opt.expect(msg)` behaves identically except that the thrown `UnwrapError`
  carries `msg` as its message.
- `res.unwrap()` on a `Result[T, E]` evaluates to `v` for `Ok(v)` and SHALL throw
  `UnwrapError` for `Err`; `res.unwrapErr()` is the mirror.

An implementation SHALL NOT satisfy these by reading through the `None`
representation. `Some` and `None` may share a representation in a given
compilation mode (a niche encoding, §3-2.4), but the failure is a language-level
outcome, not a memory-safety accident: a fault is not an `UnwrapError`, cannot be
caught, and carries no message.

### §1-5.7 `?` Propagation Operator

The postfix `?` operator propagates errors out of the enclosing function. It may only appear inside a function whose return type is `Result[T, E]`:

```
func process(path: string): Result[string, AppError] {
  let raw = readText(path)?;       # readText returns Result[string, IoError]
  let parsed = parse(raw)?;        # parse returns Result[Data, ParseError]
  return Ok(transform(parsed));
}
```

**Semantics:**

- If `expr` evaluates to `Ok(v)`, the `?` expression evaluates to `v` (the unwrapped success value).
- If `expr` evaluates to `Err(e)`, the enclosing function returns `Err(F.from(e))` immediately, where `F` is the enclosing function's error type.
- Error conversion uses the `From[E]` interface: `F.from(e)` converts error `e` of type `E` to the enclosing function's error type `F`. If `E == F`, the identity conversion is used.
- If no `From[E]` implementation exists for the required conversion, the compiler emits `E_PROPAGATE_MISSING_FROM`.
- **`?` on a `Result[T, impossible]` needs no `From[E]`.** The `Err` arm is uninhabited (§1-4.4b), so the conversion the operator would perform has no reachable instance and requiring an implementation for it would demand code that can never run. `let v = parseTrusted(text)?;` is therefore legal inside any `Result`-returning function regardless of its error type, and `E_PROPAGATE_MISSING_FROM` is not emitted. This is the same reasoning that lets §1-9.4 omit the `Err` arm of such a `match`: what cannot occur imposes no obligation.

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
| `E_CONDITION_NOT_BOOL` | All | Condition expression in `if` (statement or expression), `while`, or `for` is not `bool` |
| `E_PROPAGATE_MISSING_FROM` | All | `?` applied inside a function returning `Result[T, F]` where the error type `E` has no `impl From[E] for F` |
| `E_PROPAGATE_NOT_RESULT` | All | `?` applied to a value not of type `Result[T, E]` |
| `E_PROPAGATE_WRONG_RETURN` | All | `?` used in a function whose return type is not `Result[T, F]` |

**Error return traces.** In a build that asks for them, each `?` that
propagates an `Err` records the function the error travelled out of, giving the
chain of frames an error passed through — the provenance that `Result`
propagation otherwise discards, and that `@mode(freestanding)` has no other way
to obtain (it has no unwinding and no `cause` chain, §1-6.10).

```
func loadProfile(path: string): Result[Profile, AppError] {
    let cfg  = readConfig(path)?;
    let user = fetchUser(cfg.userId)?;
    return Ok(Profile(user));
}

# at the point of final handling:
match loadProfile(p) {
    Ok(profile) => { render(profile); }
    Err(e) => {
        print(i"failed: {$ e $}");
        for (var i = 0; i < errorTraceDepth(); i = i + 1) {
            print(i"  via {$ errorTraceSite(i) $}");
        }
        if (errorTraceTruncated()) { print("  (trace truncated)"); }
    }
}
```

- **Availability.** Traces are captured only in a build that asks for them: on
  by default with `--debug`, absent from a release build, and either way
  overridable with `--error-traces` / `--no-error-traces`. The switch is
  independent of portal enablement, because a trace is most valuable in exactly
  the release-shaped freestanding builds where portal instrumentation is too
  costly to carry.
- **The reading API is index-addressed**: `errorTraceDepth(): int` gives the
  number of sites recorded, `errorTraceSite(i: int): string` the `i`-th,
  `errorTraceTruncated(): bool` whether the bound was hit, and
  `errorTraceClear()` resets the trace. No collection type appears in any
  signature, deliberately: a `list[string]` names a type
  `@mode(freestanding)` does not have, and freestanding is the mode traces
  exist for.
- **The store is a fixed chain of `error_trace_depth` slots.** The bound is
  normative anyway (below), so a fixed slot count is not a compromise but the
  representation the rule describes. It allocates nothing, which is the
  property a trace taken on an error path wants, and it lowers in every mode.
- **The API exists only in a build that captures traces.** The switch governs
  the whole facility, not merely the capture: an unused store is still
  machinery, and §5.4 rule 1 says a build that captures nothing carries none of
  it. Reading a trace in such a build is `E_ERROR_TRACES_DISABLED`, a
  diagnostic that names the switch, rather than an empty answer that reads as
  "no error ever propagated". `if const` does NOT guard such a call: every
  `if const` branch is still fully type-checked (§1-6.3), which is the
  deliberate correction to Zig's `comptime if`, so the name has to exist either
  way. `build.error_traces` reports the resolved switch for code that wants to
  SAY whether traces are on. On the self-hosted toolchain, which has no
  `--error-traces` flag of its own yet, `LOUP_ERROR_TRACES=1` in the
  environment turns capture on.
- **Bounded and marked.** A trace records at most `error_trace_depth` sites
  (`[freestanding]`, default 16). Beyond that the trace is truncated and
  `errorTraceTruncated()` reports it. A silently short trace is worse than a
  marked one: it reads as a complete origin story while being a partial one.
- **Capture does not change the error.** The recorded site is a side channel;
  the value and type of the propagated `Err` are exactly what they would have
  been without traces.
- Traces apply to `?` on `Result[T, E]` in **all modes** — freestanding is
  merely where the value is highest. `expr!` (force-unwrap, §1-5.7) panics
  rather than propagating, so it records nothing.

| Code | Mode | Condition |
|---|---|---|
| `E_ERROR_TRACES_DISABLED` | All | `errorTrace()`, `errorTraceTruncated()` or `errorTraceClear()` is referenced in a build that does not capture error return traces |

- Exceptions keep the `cause` chain (§1-6.10) as their sole provenance
  mechanism; two overlapping facilities would give two answers to "where did
  this come from".

### §1-5.8 Spread Operators

The spread operators `*` and `**` expand collections in call sites and collection literals.

**Positional spread (`*`) in calls:**

```
let args = [1, 2, 3];
f(*args);                    # equivalent to f(1, 2, 3)
```

**Keyword spread (`**`) in calls:**

```
let opts = {"timeout": 5000, "retries": 3};
request(url, **opts);        # equivalent to request(url, timeout=5000, retries=3)
```

**Spread in collection literals:**

```
# List spread
let a = [1, 2];
let b = [3, 4];
let combined = [0, *a, *b, 5];   # [0, 1, 2, 3, 4, 5]

# Dict spread (later entries override earlier on key collision)
let defaults = {"host": "localhost", "port": 8080};
let config = {**defaults, "port": 9090};  # {"host": "localhost", "port": 9090}

# Dict merge
let merged = {**defaults, **overrides};

# Set spread
let s1 = {1, 2, 3};
let s2 = {3, 4, 5};
let all = {*s1, *s2};            # {1, 2, 3, 4, 5}
```

**Equivalence.** For any list `xs` and function call `f(*xs)`, the call is equivalent to passing each element of `xs` as a separate positional argument. For any dict `d` and call `f(**d)`, the call is equivalent to passing each entry as a keyword argument.

**Type-checking rules:**

- `*expr` in a call requires `expr` to have type `list[T]` where `T` is assignable to the expected parameter types at the spread position.
- `**expr` in a call requires `expr` to have type `dict[string, T]` where `T` is assignable to the expected keyword parameter types.
- `*expr` in a list literal requires `expr` to have type `list[T]` (or `Iterable[T]`); the resulting list element type is the union of all element types.
- `**expr` in a dict literal requires `expr` to have type `dict[K, V]`.
- `*expr` in a set literal requires `expr` to have type `set[T]` (or `Iterable[T]`).

**Compiled mode.** Spread operators are permitted in compiled mode provided all types are statically known. `**kwargs` with type `dict[string, Any]` in `@mode(web.compiled)` produces the `W_ANY_IN_AOT_MODE` advisory (§1-2.4.2) but is permitted. In `@mode(host.native)` and `@mode(freestanding)`, where `Any` is prohibited, `**kwargs` must use a concrete value type.

| Code | Mode | Condition |
|---|---|---|
| `E_SPREAD_NOT_LIST` | All | `*expr` in a positional-spread position where `expr` is not `list[T]` or `Iterable[T]` |
| `E_SPREAD_NOT_DICT` | All | `**expr` in a keyword-spread position where `expr` is not `dict[string, T]` |

### §1-5.9 Array Section Expressions

Array section expressions extend the indexing syntax of multi-dimensional arrays (§1-4.10) with first-class slicing along one or more axes. A section expression returns a *view* of the source array — a new array value with adjusted shape and stride that shares the source's underlying storage.

**Single-axis slicing.** Within array indexing brackets, an axis may carry a slice expression of the form `start:stop`, `start:stop:step`, or special abbreviations:

| Form | Meaning |
|---|---|
| `start:stop` | Half-open interval `[start, stop)`, stride 1 |
| `start:stop:step` | Half-open interval, custom stride |
| `:` | Full extent along the axis (equivalent to `0:n`) |
| `start:` | From `start` to the end of the axis |
| `:stop` | From the beginning to `stop` (exclusive) |
| `::step` | Full extent with custom stride |
| `::-1` | Reversed (full extent, stride −1) |

Examples on a 1-D array:

```loup
let a: array[int, 1] = arr.fromList(data: [10, 20, 30, 40, 50, 60], shape: [6]);

let s1 = a[1:4];       # [20, 30, 40] — shape (3,)
let s2 = a[::2];       # [10, 30, 50] — shape (3,) stride 2
let s3 = a[::-1];      # [60, 50, 40, 30, 20, 10] — reversed
let s4 = a[2:];        # [30, 40, 50, 60]
let s5 = a[:3];        # [10, 20, 30]
```

**Negative indices.** Within a slice expression, a negative index counts from the end: `-1` is the last element, `-2` is the second-to-last, and so on. Negative indices in slice expressions resolve at evaluation time to non-negative offsets relative to the axis length:

```loup
let s6 = a[-3:];       # [40, 50, 60] — last 3 elements
let s7 = a[:-2];       # [10, 20, 30, 40] — all but last 2
let s8 = a[-1];        # 60 — single-element extraction (NOT a section)
```

A bare negative index (without `:`) is a single-element extraction and returns a value of the element type, not an array.

**Multi-axis sections.** For arrays of rank ≥ 2, sections may be applied per-axis with comma separators:

```loup
let m: array[float, 2] = arr.fromList(
    data: [1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0, 11.0, 12.0],
    shape: [3, 4],
);
#  [[1, 2, 3, 4],
#   [5, 6, 7, 8],
#   [9,10,11,12]]

let row1 = m[1, :];          # [5, 6, 7, 8]              shape (4,)  rank 1
let col2 = m[:, 2];          # [3, 7, 11]                shape (3,)  rank 1
let sub  = m[0:2, 1:3];      # [[2,3],[6,7]]             shape (2,2) rank 2
let stride = m[::2, ::2];    # [[1,3],[9,11]]            shape (2,2) rank 2
let flip = m[::-1, :];       # rows reversed              shape (3,4) rank 2
```

**Trailing axes default to `:`.** When the number of section expressions is less than the array's rank, missing axes are treated as `:` (full extent):

```loup
let row0 = m[0];             # equivalent to m[0, :]    [1, 2, 3, 4]
let cube: array[int, 3] = arr.zeros[int, 3]([2, 3, 4]);
let plane = cube[1];         # equivalent to cube[1, :, :] — a 3×4 view
```

This is consistent with row-major iteration order; for column-major arrays the same convention applies (the missing axes are still trailing in the index list, regardless of memory order).

**Result rank.** A section produces an array with rank equal to the number of *non-scalar* axis expressions:

| Source rank | Index pattern | Result type |
|---|---|---|
| 2 | `m[1, 2]` | `T` (a scalar of the element type — not an array) |
| 2 | `m[1, :]` | `array[T, 1]` |
| 2 | `m[:, :]` | `array[T, 2]` (full view) |
| 2 | `m[0:2, 1:3]` | `array[T, 2]` |
| 3 | `c[1, :, :]` | `array[T, 2]` |
| 3 | `c[1, 2, :]` | `array[T, 1]` |

A "scalar axis" is one with a single `int` index (no colon); a "section axis" is one with `:`, `start:stop`, or `start:stop:step`. The compiler infers the result rank statically from the syntactic form.

**Views and lifetimes.** Sections produce *views* — array values that share storage with the source. The view's lifetime cannot exceed the source's lifetime; the lifetime tracking uses the same labelled-borrow machinery as `borrow[~name]` (§3-2.4.2 in the compilation volume). Mutation through a view affects the source:

```loup
var a = arr.zeros[float, 1]([10]);
let s = a[2:5];
s[0] = 99.0;
print(a[2]);     # 99.0 — the view's element 0 is the source's element 2
```

To produce an independent copy, call `.copy()` on the view:

```loup
let s = a[2:5].copy();      # independent storage
s[0] = 99.0;
print(a[2]);     # unchanged
```

**Bounds checking.** Out-of-range slice bounds — `start < 0` (after negative-index resolution), `stop > a.shape[axis]`, or `stop < start` with positive step — raise `ArrayIndexError` at runtime. The error includes the offending axis and the bounds. Where bounds are statically known (literal indices on a fully-shaped array), bound checks are performed at compile time (`E_ARRAY_INDEX_OUT_OF_RANGE`).

**Base-aware slice semantics.** For a `base: 0` array of shape `[n]`, valid slice bounds are in `[0, n]`. For a `base: 1` array of shape `[n]`, slice bounds are interpreted in the array's base: valid bounds are in `[1, n+1]`, and `f[1:3]` selects elements at indices 1 and 2 (inclusive of 1, exclusive of 3) — *not* the elements at base-0 indices 1 and 2. Whole-axis abbreviations (`:`, `start:`, `:stop`) automatically select the array's full base-aware extent, so `f[:]` on a `base: 1` array is equivalent to `f[1:n+1]`. Negative slice bounds resolve relative to axis length regardless of base — `a[-3:]` selects the last three elements in either base mode.

**Stride and step semantics.** A slice with step `s` and bounds `[a, b)` produces an array with elements `source[a], source[a+s], source[a+2s], ..., source[a+ks]` where `a+ks < b` is the largest such index. The result length is `ceil((b - a) / s)` for positive `s`, or `ceil((a - b) / -s)` for negative `s`. Step zero is `E_ARRAY_INDEX_STEP_ZERO`.

**Mutation through views.** A view returned by a section is mutable if the source array is mutable. Whole-section assignment is supported:

```loup
var m: array[float, 2] = arr.zeros[float, 2]([3, 4]);
m[0, :] = arr.fromList(data: [1.0, 2.0, 3.0, 4.0], shape: [4]);   # assign row 0
m[:, 1] = 99.0;                                                    # scalar broadcast to column
m[0:2, 0:2] = arr.eye[float](2);                                  # 2×2 sub-block
```

Whole-section assignment requires shape conformance; broadcasting a scalar to a section is permitted. Mismatched shapes are `E_ARRAY_SHAPE_MISMATCH`.

**Interaction with `for concurrent`.** Array sections are first-class arguments to `for concurrent` loops (§2-1.11), enabling parallel iteration over slices of large arrays. The compiler verifies that distinct iterations write to non-overlapping sections.

**Grammar.** The section syntax is specified by the `IndexExpr` production in §1-19.18 (Syntactic Grammar — v1.20 Additions). The single-axis `PostfixOp` index forms in §1-19.5 are the one-element case of the `IndexList` form.

| Code | Mode | Condition |
|---|---|---|
| `E_ARRAY_INDEX_STEP_ZERO` | All | Slice expression with `step` of zero |
| `E_ARRAY_SECTION_RANK_EXCEEDED` | All | Section index list contains more axes than the array's rank |
| `E_ARRAY_SCALAR_NEGATIVE_BASE_1` | All | Negative scalar index used on a `base: 1` array (ambiguous) |


---

### §1-5.10 `attempt` Operator

The prefix `attempt` operator unwraps a `Result[T, E]` to `T`, transferring the
error to the enclosing `try` block's `catch Err(e)` arm (§1-6.9) rather than
returning from the function.

```
func loadProfile(path: string): Profile {
  try {
    let cfg  = attempt loadConfig(path);
    let user = attempt fetchUser(cfg.userId);
    let prefs = attempt loadPrefs(user.id);
    return Profile(user, prefs);
  } catch Err(e) {
    metrics.record(i"load_profile failed: {$ e $}");
    return Profile.default();
  }
}
```

**Semantics:**

- If `expr` evaluates to `Ok(v)`, the `attempt` expression evaluates to `v`.
- If `expr` evaluates to `Err(e)`, the expression produces no value: control
  transfers to the nearest lexically enclosing `try` block's `catch Err(e)`
  arm, binding `e`. Statements after the failed `attempt` in that block do not
  run.
- After the arm completes, control resumes after the `try` statement — unless
  the arm itself returns or throws.

**The arm's bound type** (ruling AT-1, loup#404). A bare `catch Err(e)` binds `e`
at the one error type every `attempt` operand of the block shares; operands
whose error types differ are `E_ATTEMPT_ERROR_MISMATCH`. The arm may declare its
type instead — `catch Err(e: AppError)` — and then each operand's error type
must be that type, a subtype of it, `impossible`, or a type the declared one
converts from (`AppError implements From[E]`); `e` is bound through
`AppError.from(err)` as `?` converts (§1-5.7). A declared type is how operands
with different error types share one arm.

**`attempt` and `?` are two different destinations for one situation**, which is
why both exist and why neither is context-sensitive:

| Written | On `Ok(v)` | On `Err(e)` |
|---|---|---|
| `expr?` | `v` | returns from the **enclosing function** as `Err(F.from(e))` |
| `attempt expr` | `v` | transfers to the enclosing **`catch Err` arm**, binding `e` |

`?` inside a `try` block still returns from the function; it is never captured
by a `catch Err` arm.

**Precedence.** `attempt` binds at the unary level (§1-3.7), the same level as
`-x` and `bnot x`. Its operand is the one expression that produced the
`Result`, so `attempt readCount() + 1` groups as `(attempt readCount()) + 1`,
and postfix binds tighter still, so `attempt cfg.loader.read(p)` keeps the whole
call chain inside the operand.

**Restrictions:**

- `attempt` may only appear inside a `try` block that has a `catch Err` arm.
  Outside any `try` block it is `E_ATTEMPT_OUTSIDE_BLOCK`; inside one with no
  Result arm it is `E_ATTEMPT_NO_HANDLER`. A lambda body is a boundary: an
  `attempt` inside a closure is not bound by a `try` block that encloses the
  closure lexically.
- The operand must be a `Result[T, E]` (`E_ATTEMPT_NOT_RESULT`).
- With `await`, the legal order is `attempt await f()` — the `Result` is
  resolved first, then unwrapped. `await attempt f()` is
  `E_ATTEMPT_AWAIT_ORDER`.
- `attempt` is available in **all execution modes, including
  `@mode(freestanding)`**. It desugars to a `match` expression plus, where the
  handler can fall through, a labelled escape — no exception machinery is
  required.

| Code | Mode | Condition |
|---|---|---|
| `E_ATTEMPT_OUTSIDE_BLOCK` | All | `attempt <expr>` with no enclosing `try` block — the error edge has no destination |
| `E_ATTEMPT_NOT_RESULT` | All | operand of `attempt` is not a `Result[T, E]` |
| `E_ATTEMPT_NO_HANDLER` | All | `try` block whose body contains an `attempt` operator but which has no `catch Err` arm |
| `E_ATTEMPT_ERROR_MISMATCH` | All | operands in one block carry error types with no `From[E]` conversion to the arm's bound type — the declared `catch Err(e: T)` type, or, for a bare `catch Err(e)`, the error type the block's operands must share |
| `E_ATTEMPT_DUPLICATE_ARM` | All | more than one `catch Err` arm on a single `try` block |
| `E_ATTEMPT_AWAIT_ORDER` | hosted | `await attempt f()` — the legal order is `attempt await f()` |

---

### §1-5.11 `unreachable`

*(This section is normative.)*

`unreachable` is a primary expression of type `noreturn` (§1-4.4a). It is written at a point the programmer asserts control cannot reach:

```loup
func classify(tag: int): string {
    return match tag {
        0 => "idle",
        1 => "busy",
        _ => unreachable          # the caller guarantees 0 or 1
    };
}
```

**Reaching it is a panic in EVERY build profile** — including `--release` and `--profile safety`. It is an assertion, not an optimisation hint, and its behaviour does not vary with optimisation level. The panic is delivered as `PanicSource.Unreachable` where a `@panic_handler` is installed (§3-3.6).

> **This is a deliberate divergence.** Languages that spell an assumed-unreachable point this way generally make reaching it undefined behaviour once optimisation is on, so the same source has different meanings in debug and release builds. Loup follows its own existing precedent instead: an `unowned` reference used after its referent is freed traps in all configurations including `--release` (§3-3). A safety check whose presence depends on the optimisation level is the anomaly, not the check that stays.

**It is not catchable.** Reaching `unreachable` is a panic, not a `throw`: it does not raise an exception, no `catch` arm intercepts it, and `finally` blocks are not a recovery path. A program that must handle the condition has not established the invariant `unreachable` was asserting and should test for it instead.

**Typing.** Because the type is `noreturn`, the expression is admissible wherever a value is expected and contributes nothing to the surrounding type (§1-4.4a's coercion rule): a `_ => unreachable` arm leaves the other arms' common type alone, and `func f(): int { unreachable; }` needs no `return`. A statement that lexically follows `unreachable` in the same block is `E_NORETURN_UNREACHABLE_CODE` (§1-6.12).

**No assuming form in v1.20.** A second form that permits the compiler to *assume* the point is not reached — trading the trap for optimisation freedom, and with it undefined behaviour when the assumption is wrong — is deliberately **not** specified in this version. It buys only optimisation, and it would be the sole construct in the language whose semantics vary by build profile. Adding it later is additive; removing it later would break code already written against it (ruled: DV-3).

---

## §1-6 Statements and Control Flow

*(This section is normative.)*

### §1-6.1 Blocks and Scope

Blocks are delimited by braces `{ ... }` and introduce lexical scope. Declarations within a block are visible after their point of declaration. Inner bindings shadow outer bindings of the same name. Declaring two bindings with the same name in the **same** lexical scope is a compile-time error (`E_REDECLARED`).

```
let x = 1;
{
  let x = 2;    # shadows outer x
  print(x);     # 2
}
print(x);       # 1 — outer x is restored
```

**Prelude and library shadowing.** A module-level declaration shadows a
same-named prelude or imported-library binding: a top-level `func polar(...)`
takes precedence over the prelude/`core.complex` `polar` for every unqualified
reference in that module. This shadowing is silent (no diagnostic) and applies
uniformly across resolution and runtime dispatch — the user's definition is the
one that runs. The shadowed library function remains reachable through its
qualified name (e.g. `core.complex.polar`). This is distinct from same-scope
redeclaration, which is an `E_REDECLARED` error.

This rule extends to the **capability prelude helpers** — the entry-script
sugar `readText` / `writeText` / `readBytes` / `writeBytes` / `exec` / `args` /
`env` (and their `…Async` forms), which otherwise desugar to `runtime.*`
capability calls (§2-…). A top-level `func env(...)` defined by the script
shadows the helper: the call binds to the user's function and does **not**
silently perform the underlying file/process/environment access. The capability
itself remains available through the explicit `runtime.*` form
(e.g. `runtime.fs().readText(path)`). The **reactive-UI names** `signal` /
`derived` / `effect` / `mount` need no such rule since v1.21 (ruling SIG-LIB):
they are library functions resolved through the program's imports, not
intrinsics (§2-4.1), so a same-named user function is simply that function.

**Reserved constructors.** The variant-constructor names `Some`, `Ok`, and
`Err` are an exception: they are **not** user-shadowable, because the language's
own desugaring depends on them (optionality and `Result` literals lower to these
constructors). A top-level function with one of these names does not take
precedence — calls to `Some`/`Ok`/`Err` always construct the corresponding
`Option`/`Result` variant.

**Built-in exception names are not reserved.** The shadowing rule covers the
built-in exception CLASSES of §1-18.1 like any other prelude binding: a module
may declare `class KeyError { ... }`, and within that module the name means the
declared class at every stage — type checking, construction, layout and
dispatch. The declared class has exactly the fields it declares; it carries
`message` / `stackTrace` / `cause`, and is throwable, only if it (transitively)
extends an exception class, which a class of that name need not. A subclass
`class Sub : KeyError` extends the DECLARED class. Built-in exceptions whose
names the module does not redeclare are unaffected, including those the runtime
itself raises.

**Cross-module name independence.** Two different modules may each define a
free function with the same bare name (`parse`, `init`, `tag`, …) without
interfering: every call invokes the function it *resolves* to. In particular, a
module's call to its own local function always reaches that local function, even
when another module in the program defines a function of the same name. (This is
guaranteed regardless of compilation/link order; the implementation gives such
colliding library functions module-unique internal names.)

**Cross-module type-name collisions.** Classes and structs get the same
module-unique internal treatment, so two library modules may each define a type
with the same bare name as long as their field lists agree, and an entry module
may shadow a library type. Two *different* types sharing one name is a
compile-time error, not a silent merge: below the type checker a type is keyed
by its bare name, so a field access on one would otherwise be resolved against
the other's layout and read the wrong field.

Interfaces are held to the stricter rule — two modules defining the same
interface name with different method signatures is an error wherever it occurs,
including an entry module shadowing a library interface. An interface's identity
is spread across every `implements` clause and the per-class method symbols the
dispatch tables are built from, so it carries no module-unique renaming to fall
back on; merging two would dispatch each implementing class against the other
interface's methods. In both cases the fix is to give the types distinct names.

**The discard `_`** (ruling DISCARD-1, loup#787). `_` written where a name is bound — a `let` / `var`, a parameter, a for-in or destructuring leaf, a `catch (T as _)` binding — is a DISCARD: it binds nothing. A `let _ = e;` / `var _ = e;` still evaluates `e` for its effects, exactly as the expression statement `e;` does, and reserves no storage. Because nothing is bound, `_` may be written any number of times in one scope (`let _ = a; let _ = b;`, `func f(_: int, _: int)`), and a reference to `_` — reading it or assigning it — is `E_DISCARD_READ`. In a pattern `_` is the wildcard, which is the same thing.

*Compiler's rule (redeclaration).* A second binding of a name (other than the discard `_`) in the SAME lexical scope is `E_REDECLARED` whatever introduces the two — two `let` / `var` / `const` bindings (a destructuring `let`'s leaves included), a parameter and a `let` in the function body (the parameters and the body's top-level bindings share one scope), a `for` loop variable and a binding at the top of the loop body, a module-level binding and a module-level class / function / enum, two bindings in one braced namespace body (§1-13.0) — and a binding in an INNER block of the same name shadows instead. Both front ends report it with the code in the message text (``duplicate declaration of `x` in the same scope (E_REDECLARED)``; loup#591 — measured, neither accepted a same-scope redeclaration, but they said `E0001` and `E0110`, and neither said the spec's code).

*Compiler's rule (declarations in a block).* A `func` declared in a block (any function form of §1-19.4's `BlockStmt`) binds its name in that block from its point of declaration and is visible in its own body, so it may call itself; it is a CLOSURE over its enclosing scopes with §1-7.3's capture rules (a `let` by value, a `var` by reference; `global` / `nonlocal` for writes), exactly as a lambda. A class, struct, enum or interface declared in a block binds its name throughout that block (as a module-level type is visible throughout its module); it is a module-level type below the checker, so its members may name the enclosing block's TYPES but not its values — a local, a parameter or a nested function of an enclosing function is `E_LOCAL_TYPE_CAPTURE` — and its name must be unique among the module's types (module level, braced namespace bodies, other blocks), else `E_TYPE_NAME_COLLISION`. The `E_LOCAL_TYPE_CAPTURE` message names the kind of scope that owns the captured binding — "belongs to the function / method / lambda enclosing this type", or, for a type declared in a script's module-level `if` / loop body, "belongs to the module-level block enclosing this type" (loup#626). A second binding of one name in the block — a `let`, a parameter, another declaration — is `E_REDECLARED` in either order. (loup#610; rows LOCAL-1 / LOCAL-2 in `specs/x-update-v1_20-to-v1_21/design.md`, approved by the maintainer, as is the loup#626 wording amendment.)

| Code | Mode | Condition |
|---|---|---|
| `E_REDECLARED` | All | Two `let` or `var` declarations with the same name appear in the same lexical scope |
| `E_DISCARD_READ` | All | A reference to the discard `_` — a read or an assignment; `_` binds nothing (DISCARD-1) |
| `E_LOCAL_TYPE_CAPTURE` | All | A member of a type declared in a block names a local, parameter or nested function of the enclosing function, method or lambda, or a local or nested function of the script's module-level block that declares it; the message names which kind of scope owns the binding (loup#626) |
| `E_TYPE_NAME_COLLISION` | All | A type declared in a block or a braced namespace shares its name with another type of the module |

### §1-6.2 Variable Declarations

**`let` declarations** create immutable bindings:

```
let name: string = "Alice";
let age = 30;                  # type inferred as int
```

Attempting to reassign a `let` binding is a compile-time error (`E_LET_REASSIGN`).

**`const` declarations** create COMPILE-TIME constants:

```
const MAX = 1024;
const STRIDE = MAX * 4;        # const arithmetic over other constants
const TABLE_SIZE = nextPow2(MAX);   # a `const func` call (§1-7.1)
```

A `const` binding is immutable like `let`, and additionally its value is known
to the compiler. Its initializer MUST be a **const-expression**: a literal,
another `const` binding, an operator applied to const-expressions, a tuple or
list of them, a call to a `const func` with const arguments, or an enum variant
or struct construction over const-expressions (below). An initializer outside
that set is a compile-time error (`E_CONST_NOT_EVALUABLE`) — use `let` for a
value that is only known at run time.

**Struct and enum constants** *(v1.21, ruling CONST-AGG-1, the maintainer,
2026-11-04)*. An enum UNIT variant (`Level.Open`, and `None`) is a
const-expression, and so is an enum variant whose positional payload is made of
const-expressions (`Shape.Square(3)`, `Some(3)`, `Ok(1)`, `Err(2)`). A STRUCT
CONSTRUCTION (§1-10.1) is a const-expression when every field value is one: each
named argument written (`f = c`, `f: c`) and the declared default of each field it
omits; nested struct constructions and enum variants count, recursively. The
type may be the module's own, imported by name (`from M import (S)`, aliased or
through `pub from` re-exports, a standard-library module included) or read
through a module import (`M.S(…)`, `M.E.V`, `M.E.V(…)`). `==` and `!=` between
two such values are const operators with their run-time answer (structural
equality, §1-3.x), so `if const (MODE == Level.Open)` selects at compile time.
A struct that declares its own equality (`operator func ==`, `Equatable`) is not
compared at compile time, and no other operator, field read (`C.f`) or method
call on a struct or enum value is a const-expression: each is
`E_CONST_NOT_EVALUABLE`. An omitted field with no declared default (an owned
`buffer` field's zeroed storage included) gives the construction no
compile-time value, which is `E_CONST_NOT_EVALUABLE` too.

A struct or enum `const` is immutable DATA. It has no identity and no shared
storage: every read is a copy (a struct's value semantics, §1-10.3.1), so
mutating a copy (`var m = C; m.f = 2;`) never changes what `C` reads. A `const`
is not module state, so a `@mode(portable)` module may declare one (§1-2.4.7).
A `const func` body (§1-7.1) does not build struct or enum values in v1.21:
constructing a struct there calls its constructor, which is not a `const func`
(`E_CONST_CALLS_NON_CONST`), and an enum variant there is not evaluable.

```
enum Level { Open, Private, Secret }
struct Mark {
    let level: Level;
    let rank: int = 0;
}
const L = Level.Private;
const M: Mark = Mark(level = L);                 # rank takes its default, 0
const SAME = M == Mark(level = Level.Private);   # true, at compile time
```

The `const` binding and the `const func` may be IMPORTED. A `pub const` brought
in with `from M import (…)` — under an alias, or through a chain of `pub from`
re-exports (§1-13.2) — is "another `const` binding", and so is `M.NAME` read
through a module import `import M;` / `import a.b as M;`. A `pub const func`
imported with `from M import (…)` may be called. Either one is evaluated in its
DEFINING module: its initializer or body sees that module's constants, `const
func`s and imports, never the importer's names, so an importer's own `SCALE`
does not change what an imported `const func` that reads `SCALE` returns. An
imported `let` or `var` is a run-time value and stays outside the set, and so
does an imported `const` whose own initializer is not a const-expression (its
module reports that error).

```
# keys.loup
pub const N: int = 3;
pub const func scaled(n: int): int { return n * 10; }

# main.loup
from keys import (N, scaled);
const NEXT = N + 1;            # an imported constant
const BIG = scaled(N);         # an imported `const func`: 30
```

`const` is one keyword with one meaning: **compile-time**. It is not an
alternative spelling of `let`.

**`var` declarations** create mutable bindings:

```
var count: int = 0;
count = count + 1;             # ok
```

**Type annotations** are optional when the type can be inferred from the initializer. When no initializer is provided, a type annotation is required:

```
let x = 42;                   # inferred as int
var name: string;              # declared but uninitialized — must be assigned before use
                                 #   (E_USE_BEFORE_ASSIGN if read before first assignment)
```


**Uninitialized `var` reads.** A `var` binding declared without an initializer must be assigned before its value is read. The compiler performs definite-assignment analysis: reading a `var` that may not have been assigned on all control-flow paths leading to the read is a compile-time error (`E_USE_BEFORE_ASSIGN`). `let` bindings always require an initializer at declaration time, so this error applies only to `var`. Example:

```loup
var count: int;
if (flag) { count = 1; }
print(count);   # E_USE_BEFORE_ASSIGN — count may not be assigned when flag is false
```

**Exception — struct-typed locals.** In `@mode(host.native)` and `@mode(freestanding)`, a `var` local of struct type declared without an initializer (`var x: T;`, `T` a struct) is *default-initialized* at its declaration — each field materializes its declared default or zero value — so it is fully assigned on every path and is **not** subject to `E_USE_BEFORE_ASSIGN`. See §1-10.1.1.

| Code | Mode | Condition |
|---|---|---|
| `E_LET_REASSIGN` | All | Assignment to a `let` (immutable) binding after its initial declaration |
| `E_LITERAL_OVERFLOW` | All | Integer or float literal value does not fit in the declared suffix type (e.g., `300i8`) |
| `E_USE_BEFORE_ASSIGN` | All | A `var` binding is read before it has been assigned on all control-flow paths (definite-assignment analysis) |

**`arc let` and `arc var` declarations** create explicit ARC-managed bindings (`@mode(host.native)` or `@mode(host.dual)`):

```loup
@mode(host.native)

arc let conn = Connection.open(addr)    # explicit ARC; aliases permitted
arc var cache = Cache.new()             # mutable ARC binding, reassignable
```

`arc let` / `arc var` are semantically identical to plain `let` / `var` for class types in modes where ARC is the ownership model — both produce ARC-managed references. The distinction is intent declaration: the qualifier makes the ARC ownership explicit at the binding site, aiding code review, auditing, and tooling.

Under `--require-explicit-arc` (build flag, §3-2.4.8), constructing a class into a plain `let` or `var` without `arc let` or `unique let` emits the lint advisory `implicit-arc-binding`. `arc let` suppresses this advisory.

`arc let` is a compile-time error in `@mode(web.scripted)`, `@mode(web.compiled)`, `@mode(host.scripted)`, and `@mode(freestanding)` (`E_ARC_LET_NOT_NATIVE`). On value types (structs, enums, primitives), `arc let` is always an error (`E_ARC_LET_NOT_CLASS`).

**`arc let` is a local binding qualifier only.** Using `arc let` or `arc var` on a class field or struct field is a compile-time error (`E_ARC_LET_ON_FIELD`). Class fields in `@mode(host.native)` are always ARC-managed via plain `let`/`var`; the explicit `arc` qualifier is reserved for local binding sites where ownership intent is declared. Struct fields use `unique var` for uniquely-owned class references (§1-10.3.2); plain `var` for all other types.

**`onstack let` and `onstack var` declarations** pin a local binding's aggregate storage to the stack frame (`@mode(freestanding)` only):

```loup
@mode(freestanding)

func btreeLookup(key: uint64): uint64 {
    onstack var walk: buffer[uint64, 64];   # per-invocation, never a shared global
    ...
}
```

Without the modifier a freestanding `buffer` local, and a struct local the placement analysis declines to promote, are materialized in a per-function *static* block — one block shared by every invocation, which is neither re-entrant nor SMP-safe. `onstack` makes per-invocation storage a checked guarantee: if the address escapes the frame, or the placement analysis cannot model the function, the build fails (`E_ONSTACK_ESCAPES` / `E_ONSTACK_UNMODELED`) rather than demoting to a static block. See §3-3.17c for the full contract, the diagnostics, and the DMA/stack-budget hazards.

**Destructuring declarations.** Both `let` and `var` support destructuring patterns for tuples, lists, and dicts. See §1-6.8 for full destructuring syntax and semantics.

### §1-6.3 Conditionals

```
if (cond1) {
  // ...
} else if (cond2) {
  // ...
} else {
  // ...
}
```

*Compiler's rule (parenthesized conditions — ruling PAREN-1, loup#785).* The condition of every `if`, `else if` and `while`, of an `if` expression, and the header of every `for` loop are written inside parentheses (§1-19.4: `IfStmt`, `IfExpr`, `WhileStmt`, `ForStmt`, `ForInStmt`). One written without them — `if ready {`, `} else if n > 0 {`, `while running {`, `for x in xs {` — is the parse error `E_CONDITION_PARENS`, whose fix-it adds the parentheses (`if (ready) {`); the bare condition is still parsed, so the rest of the statement is checked. Both parsers report it, and neither formatter prints the bare form.

| Code | Mode | Condition |
|---|---|---|
| `E_CONDITION_PARENS` | All | An `if` / `else if` / `while` condition, an `if`-expression condition or a `for` header written without its parentheses (PAREN-1) |

**`if` as an expression (normative, BV-4).** An `if`/`else` chain is also an expression: each branch block yields the value of its final expression, the else branch is mandatory in expression position, and the branch types must unify. This is Loup's only inline conditional form — there is no ternary operator (§1-5.4).

The condition expression must have type `bool`. If the condition is statically known to not be `bool`, the compiler emits `E_CONDITION_NOT_BOOL`. If the condition is dynamically not `bool`, the runtime throws a `TypeError`.

**`if const` — compile-time selection.** `if const (…)` decides its branch at
COMPILE time, and only the selected branch is lowered into the artifact:

```
if const (options.tls == "mbedtls") {
    from net.tls.mbedtls import (Session);
} else if const (options.tls == "wolfssl") {
    from net.tls.wolfssl import (Session);
} else {
    from net.tls.stub import (Session);
}
```

The condition must be a const-expression (§1-5.10) of type `bool` — an imported
`pub const` counts (§1-6.2); one that is not is `E_CONST_NOT_EVALUABLE`, never a
quiet fallback to a runtime test. An
`if const` with no `else` whose conditions are all false selects nothing, which
is a legal way to compile nothing.

**Reachability analysis and branch selection (§1-6.12).** The two do not
interact, and the reason is worth stating so no implementer looks for an
ordering constraint. §1-6.12's rule never crosses a branch boundary, so a
diverging call inside one arm says nothing about statements following the whole
construct — and because every branch is fully type-checked whether or not it is
selected, dead code *inside* an eliminated branch is diagnosed just the same.
The consequence is that `E_NORETURN_UNREACHABLE_CODE` is **independent of the
resolved option vector**: the same source yields the same diagnostics under every
configuration. There is therefore no question of running the analysis before or
after branch selection.

**Every branch is fully type-checked, whether or not it is selected.** This is
normative and load-bearing: a configuration that is never built has still
passed the compiler front end. Diagnostics in unselected branches are reported
exactly as in any other code. Only the *lowering* is conditional — the
*checking* is not. Without this rule, a build could ship a configuration whose
code has never been compiled at all.

`else if const` and plain `else if` may be mixed in one chain; each arm carries
its own selection.

### §1-6.4 Loops

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

The binding `x` is `let` (immutable) by default. Use `for (var x in items)` for a mutable binding. See §1-11.3 for the iteration protocol and desugaring.

*Compiler's rule (loop binding keyword, loup#676).* Both `for (let x in xs)` and `for (var x in xs)` parse (with a name or a destructuring pattern), the keyword taken only when a pattern followed by `in` comes next — `for (var i = 0; …)` stays a counted loop. A `var` binding is a fresh MUTABLE binding each iteration: assigning it changes that iteration's copy, never the collection or the next element. A plain `for (x in xs)` / `for (let x in xs)` binding is immutable whatever is iterated — a range, an iterator, a destructuring pattern — and assigning it is the same error as assigning a `let` (loup#745; the identifier binding of an iterator loop, which the desugaring binds through a `Some(x)` pattern, carries the loop's mutability).

**Range form `start..end`.** The iteration source of a `for-in` loop, a `for concurrent` loop, or a comprehension `for` clause (§1-5.2) may be the range form `start..end`. Both operands are `int` expressions, evaluated once, before the first iteration. The loop visits `start`, `start + 1`, …, `end - 1` in that order and visits nothing when `start >= end`; the end bound is exclusive, and there is no inclusive form in v1.20. The range form is a syntactic form of the loop header, not a value: it has no type, cannot be bound, passed, returned, or nested in another expression, and is rejected anywhere other than an iteration source (`E_RANGE_FORM_MISPLACED`). It is equivalent to the counted loop `for (var __i = start; __i < end; __i = __i + 1)` with the loop variable bound immutably each iteration, and implementations MAY lower it directly to that loop without an iterator object.

```
for (i in 0..n) { … }                       # i = 0, 1, …, n-1
let squares = [x * x for x in 0..10];       # §1-5.2
let r = 0..3;                               # ERROR: E_RANGE_FORM_MISPLACED
```

**For-loop implicit borrow (all modes).**

In all modes, a `for (x in items)` statement creates an **implicit `reads` borrow** of `items` for the entire duration of the loop body. Any of the following inside the loop body is a compile-time error (`E_BORROW_LOOP_MUTATION`):

- Assigning to `items`
- Calling any method requiring `edits: items` (e.g., `append`, `remove`, `clear`)
- Passing `items` as an `edits` argument

```loup
@mode(host.native)

var items = [1, 2, 3]
for (x in items) {
    items = items + [x]   # E_BORROW_LOOP_MUTATION: `items` implicitly
                          # borrowed by for-loop; cannot mutate
}
```

Read-only access inside the loop is permitted:

```loup
@mode(host.native)

var items = [1, 2, 3]
for (x in items) {
    let len = items.length   # OK — read-only
    print(x)                 # OK
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

**`for concurrent` loop (v1.20).** A parallel-iteration form for data-parallel work, available in all modes. Specified in Vol 2 §2-1.11; the Range grammar production is in §1-19.18. `for concurrent` is statically analyzed for data-race-freedom and dispatches to the implementation-selected execution strategy (sequential, SIMD, thread pool, or accelerator) — see §2-1.11 for the full semantic model.

```loup
for concurrent (let i in 0..n) {
    c[i] = a[i] + b[i];
}
```

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
| `E_RANGE_FORM_MISPLACED` | All | the range form `start..end` used anywhere other than the iteration source of a `for-in`/`for concurrent` loop or a comprehension `for` clause |

### §1-6.5 Defer

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

### §1-6.6 `with` (Scoped Resources)

The `with` statement provides deterministic resource management via the `Scoped[T]` protocol (see §1-11.2):

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

**`Closeable` and `Releasable` types** work with `with` blocks immediately because both interfaces extend `Scoped[Self]` and provide default `scope_enter`/`scope_exit` implementations driven by `close()` / `release()` respectively (§1-11.2). A type implementing `Closeable` (e.g., `FileHandle`, `TcpStream`) or `Releasable` (e.g., `MutexGuard[T]`, `InterruptGuard`) inherits the with-block compatibility through normal interface inheritance — no further declarations are needed.

**Async context managers** use `AsyncScoped[T]` (see §1-11.2). The runtime `await`s both `scope_enter()` and `scope_exit()`.

| Code | Mode | Condition |
|---|---|---|
| `E_WITH_NOT_SCOPED` | All | `with (x = expr)` where `expr` does not implement `Scoped[T]` or `AsyncScoped[T]` |

**Mode notes.** `Scoped[T]` is available in all six modes; `AsyncScoped[T]` is unavailable in `@mode(freestanding)` (no async). In `@mode(freestanding)`, `scope_exit(error)` is always called with `None` — exceptions cannot occur, so the error-suppression steps (5–7) in the execution semantics never apply. The `error` parameter type `Option[Any]` in `scope_exit` is accepted as a special case in all compiled modes since it only carries exception values at the protocol boundary.

### §1-6.7 Portal Statement

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
- Duplicate portal names are permitted for explicit `portal` blocks and implicit callable-entry portals. This is distinct from `@webcomponent` tag names (§2-4.10), which must be unique within a compilation unit.
- All named functions and methods are **implicit portals** at entry, with stable fully-qualified portal names derived from the module path and callable name (e.g., `"myapp.server.handleRequest"`). *Compiler's rule (loup#671):* this includes a STRUCT's methods, whose portal was left empty on both lanes; a method's portal is labelled with its dispatch name (`op_+` for `operator func +`), as a class method's is.
- Explicit `portal` statements and implicit callable portals share a single activation registry maintained by the runtime host.
- If a portal is entered and no matching activation exists, it is observationally inert — the body executes normally with zero overhead.
- If a portal is entered and a matching activation exists with a true condition, the runtime activates tracing for the current task.

**Portal names in compiled code.** In compiled-mode files, portal names are resolved from the static metadata table (see §2-5.3) registered at module load time. The fully-qualified callable name for implicit portals is available via `core.reflect.callableName(f)` from the `core.reflect` module.

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

**Portal statement in freestanding mode (`--debug` builds only, normative).** `portal` statements are permitted in `@mode(freestanding)` when `loup build --debug` is active and at least one debug channel or ring buffer is configured (see §3-3.25). In release builds, all portal instrumentation is stripped unconditionally and `E_FREESTANDING_PORTAL` is the compile-time error for any portal statement, as before.

Freestanding portals carry the following restrictions relative to other modes:

- **No condition expressions.** `portal name(condition) { ... }` syntax is prohibited; conditions always evaluate as unconditionally true when a portal is activated. Using a condition expression is `E_FREESTANDING_PORTAL_CONDITION`.
- **`TraceLevel.PortalOnly` only.** Full local-variable capture (`TraceLevel.Full`) is unavailable without a GC heap. Trace frames are `FreestandingDebugFrame` values (§3-3.25.2) — fixed-size structs with source location offsets, no heap allocation.
- **Static activation table.** Activation is controlled via a BSS-resident atomic byte table indexed by compile-time portal ID, not via the runtime `DebugRuntime` interface. The host activates portals over the control channel protocol (§3-3.25.6) or via direct JTAG memory write.
- **Implicit callable portals.** All named `@interruptSafe` and non-`@interruptSafe` functions are instrumented at entry with implicit portals, matching the `@mode(host.native)` behavior.
- **Time-travel replay.** When `FreestandingDebugConfig.timeTravelEnabled = true`, the compiler allocates a static on-target ring buffer (`.debug_ttravel` section) that records the most recent N portal events regardless of host connectivity. The host retrieves the ring at any point via the `READ_REPLAY_BUFFER` control-channel command (§3-3.25.6); no trace channel is required. See §3-3.25.9.

### §1-6.8 Destructuring

Loup supports destructuring in declarations, assignments, function parameters, loops, and match arms.

**Tuple destructuring:**

```
let (x, y, z) = (1, 2, 3);
let (first, *rest) = (1, 2, 3, 4);   # first = 1, rest = (2, 3, 4)
let (a, _, c) = triple;               # _ discards the second element
```

**List destructuring:**

```
let [head, *tail] = [1, 2, 3, 4];    # head = 1, tail = [2, 3, 4]
let [a, b] = pair;                     # runtime DestructureError if length != 2
let [first, _, third] = items;
```

**Dict destructuring:**

```
let {"host": host, "port": port} = config;
let {"name": name, **rest} = record;  # rest is a dict with remaining keys
let {"host": host, "port": port = 8080} = config;  # default value
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
(a, b) = (b, a);   # swap
```

**Type checking:**

- Tuple destructuring requires matching arity (or `*rest` for overflow).
- List destructuring checks at runtime; length mismatch throws `DestructureError`.
- Dict destructuring checks keys at runtime; missing keys without defaults throw `DestructureError`.
- All bound names receive inferred types from the destructured value's type.

Destructuring is permitted in compiled mode — all types must be statically known.

### §1-6.9 `try`/`catch`/`finally`

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

- If the `finally` block itself throws, its exception replaces any pending exception. The original exception is attached as the `cause` of the new exception (see §1-6.10).
- `return`, `break`, and `continue` inside a `finally` block are compile-time errors (`E_FINALLY_CONTROL`) — `finally` must not alter the control flow of the enclosing `try` statement.

| Code | Mode | Condition |
|---|---|---|
| `E_FINALLY_CONTROL` | All | `return`, `break`, or `continue` statement inside a `finally` block — control flow from `finally` must not alter the enclosing `try` statement's flow |

**Interaction with `defer`.** `defer` actions registered inside a `try` body run before the `catch` handler (as part of the `try` block's scope exit). `finally` runs after both the `try` scope (including defers) and any `catch` handler.

**Async `finally`.** `finally` blocks may contain `await` in async contexts. The runtime awaits the `finally` block to completion before propagating any exception.

**Multi-type catch.** `catch` supports multi-type patterns: `catch (TypeError | MatchError as err)`.

**Bare catch.** A `catch` clause without a type filter is equivalent to `catch (Exception as err)` — it catches all `Exception` subtypes but does NOT catch `BaseException`-only subtypes (`SystemExit`, `KeyboardInterrupt`, `GeneratorExit`). To catch everything, use `catch (BaseException as err)`. See §1-18.5 for full catch semantics.

**Result arm: `catch Err(e)`.** A `try` block MAY carry one `catch Err(e)` arm.
It is not an exception handler: it receives the error value transferred by an
`attempt` operator in the block body (§1-5.10), binding it to `e`.

```
try {
  let cfg  = attempt loadConfig(path);
  let user = attempt fetchUser(cfg.userId);
  render(user);
} catch Err(e) {
  log(i"load failed: {$ e $}");
} finally {
  cleanup();
}
```

The two arm shapes match disjoint things, so their order does not disambiguate:
`catch (T as e)` matches a thrown exception, `catch Err(e)` an `attempt`
failure. A block MAY carry both, plus `finally`.

- At most ONE `catch Err` arm per block (`E_ATTEMPT_DUPLICATE_ARM`).
  Discriminate inside it with `match`.
- A block whose body contains an `attempt` operator MUST have a `catch Err`
  arm (`E_ATTEMPT_NO_HANDLER`). Its absence is a static error, not a
  fallthrough.
- Blocks nest; an `attempt` binds to the nearest enclosing `try`.
- `finally` is unchanged and runs on every exit edge, including the transfer
  out of a `catch Err` arm.
- `?` inside a `try` block still returns from the FUNCTION. It is not captured
  by the `catch Err` arm — which is what keeps both symbols context-free.

`try` blocks restricted to `catch Err` arms and `finally` are available in
`@mode(freestanding)`: the construct carries no exception machinery.

### §1-6.10 Exception Chaining

All exception types carry an optional `cause` property of type `Option[Any]` that links to the underlying exception:

**Explicit chaining with `throw from`:**

```
try {
  let data = runtime.fs.readText(path);
} catch (IoError as e) {
  throw AppError("failed to load config") from e;
  # AppError.cause == Some(e)
}
```

`throw expr from cause_expr;` constructs the exception with `cause` set to `Some(cause_expr)`.

*Compiler's rule (`throw … from …` — loup#770).* `expr` is evaluated first, then `cause_expr`; the exception's `cause` is set to `Some(cause_expr)` — or to `None` when `cause_expr` is the literal `None` (below) — before the exception is thrown. The write is not a mutation another binding can observe (the exception has not escaped yet), so it needs no safe context. `cause_expr` may be any value (`cause` is `Option[Any]`); it is usually the caught exception.

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

### §1-6.11 `del` Statement

The `del` statement provides deterministic finalization for objects implementing the `Finalizable` interface (see §1-8.9):

```
let handle = NativeResource.open("data.bin");
# ... use handle ...
del handle;   # calls handle.finalize() immediately, then unbinds the name
```

**Rules:**

- `del expr;` is a simple statement.
- `expr` must evaluate to a value that implements `Finalizable`; otherwise it is a compile-time error (`E_DEL_NOT_FINALIZABLE`).
- `del` calls `finalize()` immediately and synchronously.
- After `del`, the binding is considered uninitialized — any subsequent use of the name is a compile-time error (`E_USE_AFTER_DEL`; similar to use-after-move). "Subsequent" is by CONTROL FLOW, not by source position: a `del` on a path that leaves the enclosing block (`return`, `throw`, `break`, `continue`) does not make the binding uninitialized on the paths that continue past it, and a fresh declaration of the same name rebinds it live.
- `del` on an already-finalized object calls `finalize()` again — it is the implementer's responsibility to make `finalize()` idempotent.
- **`modifier func finalize()` and safe contexts.** A class may declare `modifier func finalize()` to strengthen the `Finalizable` contract (§1-11.1 permits this). `del expr` implicitly satisfies the safe context requirement for the `finalize()` invocation: after `del`, the binding is consumed and no new aliases can be created, so exclusivity is provably maintained. No explicit `safe {}` wrapper is needed around `del` statements.
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

**Module-level-only statements:** `from ... import` (standard import), `from ... defer import` (deferred type stub import, §1-13.10), `pub from ... import` (re-export) — valid only as top-level items, not inside function bodies or blocks.

**Block statements:** `if`/`else`, `while`, `for`, `for-in`, `for await`, `do-while`, `try`/`catch`/`finally`, `with`, `defer` (block form), `dynamic ... as`, `portal`, `match`, `await group`, `safe { }` (safe context block, §3-2.4.12), `unsafe("reason") { }` (lock-release block inside `synchronized` modifier, §3-2.4.14), function declarations, class declarations, enum declarations, interface declarations, struct declarations, `asm { }` (inline assembly; `@mode(host.native)` requires `@unsafe("asm: reason")` prefix; §3-3.7).

Note: `do { ... } while (cond);` is a block statement that includes a trailing `;` as part of its construct syntax.



---

### §1-6.12 Reachability of Statements

*(This section is normative.)*

A statement that lexically follows a **`noreturn`-typed expression statement** in the same block cannot execute, and is a compile-time error: `E_NORETURN_UNREACHABLE_CODE`.

```loup
func f(): void {
    halt("stop")              # `halt` returns `noreturn`
    println("never")          # E_NORETURN_UNREACHABLE_CODE
}
```

**This is an error, not a suppressible advisory.** Unreachable code after a diverging call is either a mistake about which call diverges or a leftover; in both cases the fix is to delete it or restructure. It is also the reason the rule exists in a form a certification argument can use: a warning that a project may switch off is not structural-coverage evidence, and structural coverage is what the rule is for (ruled: DV-4).

**The diagnostic identifies the statement, not the block.** A reader needs to know *which* statement cannot run.

**Scope of the rule, stated precisely.** It covers a statement following a `noreturn`-typed **expression statement**. It does not currently extend to statements after `throw`, after `return`, or after `break`/`continue`, which remain accepted. That is a narrower rule than "any statement after any diverging statement", and the narrowness is deliberate: widening it later is additive, whereas narrowing it later would reject-then-accept code and invalidate evidence gathered under the wider rule. Whether to widen it to `throw` and `return` is a separate question and is not settled here.

| Code | Mode | Condition |
|---|---|---|
| `E_NORETURN_UNREACHABLE_CODE` | All | a statement lexically follows a `noreturn`-typed expression statement in the same block |

**Interaction with `if const` (§1-6.3).** The analysis does not cross a branch boundary, so a diverging call inside one arm of an `if const` says nothing about statements after the whole construct — and because *every* branch of an `if const` is fully type-checked whether or not it is selected, dead code inside a branch that the build eliminates is diagnosed just the same. The rule is therefore **independent of the resolved build configuration**: the same source produces the same diagnostics under every option vector. That is a stronger property than a configuration-dependent rule would have, and it means the rule agrees with, rather than contradicts, per-file mode legality.

---

## §1-7 Functions and Closures

*(This section is normative.)*

### §1-7.1 Function Declarations

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

- `async func name(...): Task[T] { ... }` declares a function whose call result
  is `Task[T]`. The annotation is the CALL RESULT type, so an `async func`
  returning a `string` is written `: Task[string]` — as every example and every
  `TaskGroup`/`Actor` signature in these volumes does — while its `return`
  expressions have the inner type `T`.
- The bare form `async func name(...): T` is also accepted and means exactly the
  same thing: the compiler wraps the annotation in `Task[...]` only when it is
  not already a `Task`, so `: Task[string]` is never double-wrapped into
  `Task[Task[string]]`. `Task[T]` is the canonical spelling.
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

See §1-7.5 for full generator semantics.

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

**Const-evaluable function:**

```
const func nextPow2(n: int): int {
  var p = 1;
  while (p < n) { p = p * 2; }
  return p;
}

const TABLE_SIZE = nextPow2(300);      # evaluated at compile time
let runtimeSize = nextPow2(userCount); # the SAME function, called at run time
```

The `const` modifier declares a **pure, compile-time-evaluable** function. It is
also an ordinary function: the same body is callable in runtime positions with
identical observable behaviour, which is what makes compile-time code
unit-testable with the ordinary `testing` module rather than a separate dialect.

A `const func` body is a **closed feature set**. The following are compile-time
errors inside one (`E_CONST_FORBIDDEN_CONSTRUCT`): I/O of any kind, `extern` /
FFI calls, `core.reflect` and `core.inspect`, `dynamic class` and `!{}`,
`async` / `await` / `spawn`, `throw` and exception handling, template fences,
`portal` statements, and any construct whose result is not a pure function of
its inputs. Calling a function that is not itself `const func` is
`E_CONST_CALLS_NON_CONST`, and reading or writing module-scope mutable state is
`E_CONST_MUTABLE_STATE`. Ordinary computation — locals, loops, branches,
recursion, collections — is unrestricted. A `const func` imported with `from M
import (…)` is a `const func` here too, and its body runs in its defining module
(§1-6.2).

**Divergence inside const evaluation.** `unreachable` and `noreturn` keep their
meanings in a const context, and both become build outcomes rather than run-time
ones. If const evaluation reaches an `unreachable` expression, or calls a
function whose return type is `noreturn`, the constant the program asked for
cannot be produced: the build fails with `E_NORETURN_UNREACHABLE_CONST`
(§3-3.6's table), whose message names which of the two occurred. One code covers
both cases — the distinction is a message, not a separate obligation, and every
code carries a test obligation of its own (§4.4 of the qualification plan).

Today the code has **no reachable instance**: neither `const N = die("x")` nor
`const N = unreachable` gets as far as evaluation, because both are rejected
earlier as not being constant expressions. It is specified now because the rule
should exist before the instance does — const evaluation widening to admit calls
is what would make it reachable, and that is an additive change that should not
also have to invent a diagnostic.

**Error return traces do not interact with const evaluation.** A `?` inside a
`const func` body propagates as it does anywhere, but no trace is captured: the
trace store is a run-time structure (§1-5.7), const evaluation produces a value
at build time, and there is no site for a trace to be attached to or read from.
An implementer should not look for a trace edge here, and none is emitted.

**Budgets.** Const evaluation runs under a fixed **fuel** budget and a fixed
**allocation** budget. Exhausting either is a diagnostic
(`E_CONST_FUEL_EXHAUSTED`, `E_CONST_ALLOC_EXCEEDED`), never a silent truncation
and never a compiler hang: non-termination is a decidable build outcome. The
defaults are normative, not implementation-defined, so a program that compiles
on one machine compiles on every machine. A package may move them deliberately
in a `[const_eval]` manifest section (`fuel`, `alloc`) — a closed, per-key
validated section, like `[freestanding]`.

**Arithmetic is checked.** Integer arithmetic that leaves the representable
range is `E_CONST_NOT_EVALUABLE`, not a wrap — a wrapped constant would be a
wrong answer baked into the binary. Division and modulo by zero are errors at
compile time for the same reason. Mixed `int`/`float` operands are rejected, as
they are at run time (§1-4.1.2): const evaluation and runtime evaluation give
the same answer for the same expression, or they give none.

Const evaluation is **interpreted, never JIT-compiled**, and resolves
`size_of`, `align_of`, integer widths, endianness, `@repr` layout and
floating-point behaviour against the BUILD TARGET rather than the compiler
host, so a cross-compiled build computes the target's answers and every host
computes the same ones.

| Code | Mode | Condition |
|---|---|---|
| `E_CONST_NOT_EVALUABLE` | All | the initializer of a `const` binding is not a const-expression |
| `E_CONST_FORBIDDEN_CONSTRUCT` | All | a `const func` body uses a construct outside the closed feature set |
| `E_CONST_CALLS_NON_CONST` | All | a `const func` body calls a function that is not `const func` |
| `E_CONST_MUTABLE_STATE` | All | a `const func` body reads or writes module-scope mutable state |
| `E_CONST_FUEL_EXHAUSTED` | All | const evaluation ran past its fuel budget — the computation may not terminate |
| `E_CONST_ALLOC_EXCEEDED` | All | const evaluation ran past its allocation budget |
| `E_OPTION_UNKNOWN` | All | a build option name that no `[options]` declaration introduces |
| `E_OPTION_VALUE_INVALID` | All | a supplied option value outside the option's declared domain |
| `E_OPTION_UNSET` | All | a declared option with no default that the build did not supply |

The `safe` modifier may prefix `func`, `async func`, `gen func`, or `async gen func`. A `safe func` (in any of these forms) both requires and provides a safe context (§3-2.4.12): it may call other `safe func`s and `modifier` methods freely, and its callers must either also be `safe func` or anchor the call inside a `safe {}` block. Available in all execution modes.

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
let c = a + b;   # Vec2(x=4.0, y=6.0) — desugars to a.op_+(b)
```

**Rules for `operator func`:**

- `operator func` is valid only inside interface bodies, class bodies, and struct bodies.
- The method name must be one of the operator symbols defined in §1-11.2, or `contains` (for `Contains[T]`).
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

# Without borrow — ARC retains config on call, releases on return
func processConfig(config: Config): Result[void, AppError] {
  return validateFields(config);
}

# With borrow — zero ARC overhead
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
  let name = config.name;         # OK — read
  validate(borrow config);        # OK — pass to borrow param
  GlobalCache.store(config);      # E_BORROW_ESCAPE — escapes frame
  let t = spawn process(config);  # E_TASK_SCOPE_ESCAPE — task outlives frame
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
~src       # a lifetime label named "src"
~origin    # a lifetime label named "origin"
~static    # the reserved forever-lifetime (see below)
```

**`lifetime ~name` — declaring a region.** Lifetime parameters are declared in the `[...]` generic brackets of a function or type using the `lifetime` keyword. The `lifetime` keyword introduces the label into scope for the function signature and body:

```loup
@mode(host.native)

# Declare a single lifetime region ~src
func firstWord[lifetime ~src](borrow[~src] text: string): borrow[~src] string {
  let end = text.find(' ') ?? text.len();
  return text[0:end];
}

# Two lifetime regions and a type parameter — mixed freely
func merge[lifetime ~a, lifetime ~b, T](
  borrow[~a] left:  string,
  borrow[~b] right: string,
  config: T,
): borrow[~a] string {
  return left;
}
```

**`borrow[~name]` — referencing a declared region.** Inside a function or type that declares `[lifetime ~name]`, the type `borrow[~name] T` is a non-owning reference to `T` tied to that region. It behaves identically to plain `borrow T` for ARC elision, but the compiler additionally tracks that it flows from the named source.

**`~static` — the forever lifetime.** `~static` is a reserved lifetime label that requires no declaration. A `borrow[~static] T` is valid for the entire program execution. Module-level `let` bindings, string literals, and compile-time constants carry implicit `~static` lifetime. Via covariance (§3-2.4.2), `borrow[~static]` satisfies any `borrow[~name]` requirement:

```loup
@mode(host.native)

let SEPARATOR: string = " | ";   # implicit ~static lifetime

func wrap[lifetime ~src](
  borrow[~src]   text: string,
  borrow[~static] sep: string,
): borrow[~src] string {
  return sep + text + sep;
}

wrap(borrow userInput, borrow SEPARATOR);  # ~static satisfies ~src by covariance
```

**`async func` restriction.** A function declared `async` may not have `borrow[~label]` parameters. The async runtime suspends the function at `await` points; the caller's stack frame may no longer be valid when the function resumes. Plain `borrow` (unlabeled) inside an `async` function body is permitted provided the compiler verifies it does not cross any `await` point. Violation is `E_BORROW_ASYNC`.

```loup
@mode(host.native)

# COMPILE-TIME ERROR — E_BORROW_ASYNC
async func process[lifetime ~src](borrow[~src] template: string): Task[string] {
  let page = await http.get(url);   # suspension point — template may be gone on resume
  return render(borrow template);
}

# CORRECT — take ownership; ARC handles the class case for free
async func process(template: string): Task[string] {
  let page = await http.get(url);
  return render(borrow template);  # plain borrow inside body — no label, no suspension issue
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
    return borrow x   # E_BORROW_ESCAPE: borrow of local `x`
                      # would escape function scope; add a
                      # lifetime annotation: borrow[~src] int
}
```

The fix is to return by value, or annotate the function with `[lifetime ~name]` that ties the return borrow to an input borrow:

```loup
# Return by value:
func getValue(): int {
    let x = 42
    return x
}

# Return borrow of an input — lifetime annotation required:
func firstOf[lifetime ~src](borrow[~src] items: list[int]): borrow[~src] int {
    return borrow items[0]   # safe: tied to ~src
}
```

`E_BORROW_ESCAPE` applies in `@mode(host.native)` and `@mode(freestanding)`.

**Reborrowing.** A `borrow[~a]` value may be passed to a `borrow[~b]` parameter when `~b` does not appear in the callee's return type, output fields, or any out-parameter position. The compiler creates an implicit sub-region of `~a` and unifies it with `~b` for the duration of the call. No annotation is needed at call sites:

```loup
@mode(host.native)

func validate[lifetime ~v](borrow[~v] text: string): bool { ... }
# ~v does not appear in the return type — reborrowing applies

func pipeline[lifetime ~src](borrow[~src] input: string): borrow[~src] string {
  let ok = validate(borrow input);   # OK: ~v unified with sub-region of ~src
  return input;
}
```

**Lifetime labels and generic containers.** `Option[borrow[~src] T]`, `list[borrow[~src] T]`, and `Result[borrow[~src] T, E]` are valid. The container transitively carries the `~src` lifetime and cannot outlive the source region. The compiler tracks this without requiring a new lifetime parameter on `Option`, `list`, or `Result` themselves.

`borrow[~name]` is valid in all execution modes (§1-2.6). In modes with ARC (`@mode(host.native)`, `@mode(host.dual)`) the borrow also elides retain/release on the referenced value; in Wasm GC modes it lowers to GC-tracked non-owning references with stack-frame escape analysis.

#### §1-7.1.1 Default Parameter Values

*(This section is normative; ruling DEF-1, loup#710.)*

A parameter of a module-level function, a class method, a constructor, or an interface method may declare a default value: `func make(size: int = 64): Buffer`. A call may omit a trailing argument whose parameter has a default, and a named argument (§1-19.5) may skip any parameter that has one; the arity check accepts from the number of parameters without a default up to the number of parameters (`function 'make' expects 0 to 1 argument(s), but 2 provided`). Skipping a parameter without a default through a named argument is an error naming it.

```loup
func greet(name: string, greeting: string = "hello", times: int = 1): string { … }

greet("bo");                 # greeting = "hello", times = 1
greet("bo", "hi");           # times = 1
greet("bo", times = 2);      # greeting = "hello"
```

**Evaluated on each call.** The default expression is evaluated every time a call omits the argument, never once at declaration: `func stamp(n: int = tick())` calls `tick()` on every `stamp()`, and `func f(xs: list[int] = [])` hands each call a fresh list.

**Scope.** A default is evaluated in the scope that ENCLOSES the declaration (the module): it may name module-level functions, globals, types and constants, but not the declaration's other parameters, and not `this` (a reference to a parameter is an undefined identifier there). Its type must be assignable to the parameter's.

**Order.** Once a parameter has a default, every later parameter must have one too (`E_PARAM_ORDER`): a positional call fills parameters left to right, so a required parameter after an optional one could never be reached by omitting the earlier.

**Inheritance.** An override that declares no default for a parameter keeps the default of the nearest ancestor method that declares one; a class implementing an interface inherits the interface method's defaults (§1-11.1). A default declared by the implementation wins for calls through the concrete type; the interface's applies to calls through the interface type.

**Named arguments through a hierarchy** *(ruling NARG-1, approved by the maintainer 2026-10-31)*. A named argument binds the parameter of that name in the declaration the call resolves to through its receiver's static type — the class's own or inherited declaration for a class-typed receiver, the interface's for an interface-typed receiver, the direct superclass's for `super.m(…)` — so an override or implementation that renames a parameter is called by the names of the type the caller sees, as defaults already are (above). The receiver, then the arguments as written, are evaluated left to right (§1-5.1) before binding.

**Function values carry no defaults.** Defaults belong to the declaration, not to its function type: a call through a value of type `fn(int): int` — a local, a parameter, a field — supplies every argument.

*Compiler's rule (implementation).* Each default becomes a synthetic module-level function `<owner>$default$<index>` (`f$default$1`, `Box$area$default$0`, `Box$constructor$default$0`, `Greeter$greet$default$1`) whose body returns the expression; a call that omits the argument calls it. Defaults on lambda parameters and on functions declared inside a block, and on functions inside a braced namespace, are not supported: such a parameter stays required (an arity error when omitted). Design row DEF-1.

| Code | Mode | Condition |
|---|---|---|
| `E_PARAM_ORDER` | All | A parameter without a default value follows one with a default (also the §1-7.4 ordering rule) |

### §1-7.2 Lambdas

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
let doubled = nums.map(func(x) => x * 2);  # x inferred as int
```

### §1-7.3 Closures

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
    nonlocal count;              # mutates 'count' from enclosing function
    global moduleCount;          # mutates 'moduleCount' from module scope
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
- *Compiler's rule (loup#773).* The declaration is required in a CLOSURE — a lambda, or a function declared inside another body (§1-6.1's block-level functions) — for an assignment to a `var` declared outside that closure's own parameters and body. A module-level function or a method assigning a module-level `var` needs no `global` (the compiler's own sources do so pervasively; design row GLOB-1). A `global` / `nonlocal` statement must be the closure's first statements; `global x` with no module-level `x`, or `nonlocal x` with no `x` in an enclosing function, is `E_GLOBAL_NOT_FOUND`; naming a `let` is `E_GLOBAL_LET`.
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
  fns = fns + [func() => i];    # each closure captures a distinct 'i'
}
# fns[0]() == 0, fns[1]() == 1, ... fns[4]() == 4
```

`for` loops using `var` share a single mutable binding across iterations. The compiler SHALL emit a warning when a closure captures a `var` loop variable.

*Compiler's rule (captured bindings).* A closure may capture ANY binding of its enclosing scopes — a `let` / `var`, a parameter, a for-in loop variable (plain or destructured, and the range form's), a match-arm or `catch` binding — and reads it as the enclosing code does, on every lane. A for-in loop variable, like the range form's (§1-6.4, "bound immutably each iteration"), is a fresh binding per iteration: a closure created in an iteration sees that iteration's value (`for (i in 0..3) { fs.push(func() => i); }` gives 0, 1, 2). Where a captured name is shared by reference (a captured `var`), every binding of that name in the function is so held, whatever form declares it. (loup#623: a for-in variable, a destructured element or a parameter captured under a name that some `var` in the module also bears was stored raw while its reads expected the shared cell — "Index on non-indexable" on both interpreters, a segfault natively — and the range form's closures all saw the final counter.)

*Compiler's rule (what a closure names by declaration).* A closure captures BINDINGS only. A name in its body that is not a binding of an enclosing scope — a type (a struct or class construction `S(name = "s")`, an enum variant `E.A(1)`, a static member `C.make()`), a module function, or a named argument's label (`g(b = 1, a = 2)`, `S(name = name)`, whose label is never an assignment, §1-19.5) — is resolved exactly as in the enclosing code: a closure body builds a struct or class by its fields' declarations and defaults and binds a named argument by the callee's parameter names, as a function body does. A label that names an enclosing binding captures nothing; the argument's value is captured as usual. (b36f-capwc: Stage0 lowered every closure before it had collected the module's field and parameter declarations — inside one, `S(name = "s", n = 2)` assigned its arguments to locals and built no fields, `K()` lost its defaults and `g(b = 1, a = 2)` bound by position — and both lowerings captured type names and labels as if they were locals, which trapped on the Wasm lanes.)

*Compiler's rule (capturing a `unique` value — row CAPMV-1, ruled 2026-10-13).* Capture by reference cannot hold a value that MOVES — a `unique class` instance, a move-only struct (§1-10.3.2), or a collection, `Option`, tuple or other aggregate holding one (§1-8.11) — because the binding and the closure would then be two owners. Capturing such a binding therefore MOVES it into the closure, exactly as a `Thread.spawn` closure takes a `unique` value (§1-8.11, "Thread transfer"): the closure OWNS it from its creation, and a later use of the binding is `E_USE_AFTER_MOVE` (in a loop, LOOPMV-1's "in a previous iteration" form). This holds for every closure — a lambda, and a function declared in a block (§1-6.1, which captures "exactly as a lambda"); a module-level binding is referenced, not captured, and stays usable. A capture of something the enclosing code only borrows is `E_MOVE_OUT_OF_BORROW`, with MOVEB-1's and UNIQCOLL-1's texts: a parameter without `takes`, the receiver (`this` / `self`) of a method that is not `takes`, or an element accessed in place (a `for`-in variable over such a collection). A closure may run more than once, so its body only BORROWS what it captured: moving a capture, or a path through one, inside the body is `E_MOVE_OUT_OF_BORROW` "cannot move `<path>` out of the capture `<name>` — a closure owns what it captured and may run again, so its body only borrows it (§1-7.3, row CAPMV-1)". Reading a capture and passing it to a borrowing parameter are not moves; a copyable capture is unaffected. A captured `var` stays shared with the closure (capture by reference, above): the enclosing code may still ASSIGN it, and the closure sees the new value, but the closure owns the variable's storage for the rest of its scope, so any later MOVE out of it — a `takes` argument, `let m = l`, `return l`, a capture by another closure, destructuring — is `E_USE_AFTER_MOVE` "binding '<name>' was captured by <a lambda / the block function `f`>, which owns its storage — it may be assigned a new value, but nothing moves out of it (§1-7.3, row CAPMV-1)", even after an assignment (Rust's rule: nothing moves out of a variable a live closure borrows). Reads and borrows of it (a method call, a borrowing argument) stay allowed; a `var` declared in a loop body is a fresh variable every iteration. On the native lanes the closure's environment owns what it captured; releasing the environment, which drops it, comes with reference-counted closure environments (not yet on any native lane), so until then a captured `unique` value is reclaimed with nothing — a bounded leak per closure created, never a free under the closure (design row CAPMV-1).

*Compiler's rule (capturing a reference on the native lanes).* A capture is a store into the closure's environment, which may outlive the frame, so on the native (ARC) lanes the environment takes its OWN strong count on every captured class instance — and on a niche `Option[C]` (the reference itself) or a counted enum value — whether the captured binding is a `let`, a parameter, the receiver (`this` / `self`), or a `var`, whose shared cell owns a count of the value it holds (its initial value and any value assigned to it later; a fresh producer assigned to it is moved in). The binding's release at scope exit then drops only the binding's count, so the object stays alive for the closure ("kept alive by the closure", *Closure lifetime* below). A `unique` capture is moved instead (CAPMV-1). The environment is the counted closure record of compilation §3-2.4.1 *Compiler's rule (closure environments)* (row CLOSENV-1): its last release releases each capture's count once, so the count is neither a free under the closure nor a leak. (2026-11-01, macOS sample apps: a handler closure stored in a module-level list read freed fields of a captured `let` object once its creating function returned — garbage on Stage0 native, the next allocation's fields on the self-hosted native build.)

*Compiler's rule (a capture keeps its static type).* Inside the lifted closure body a capture has the static type of the binding it captures: the class of a captured `let`, parameter or local, the class a captured `var`'s cell holds, the receiver's class for `this` / `self`, and so through nested closures. A field read or write on a captured object therefore uses that class's layout (an inherited field included) and a method call on it that class's dispatch, on every lane — never a guess from the field or method name. (T3-field, 2026-11-02, macOS sample apps: both native drivers typed a closure's capture parameters as unknown, so `c.handle` on a captured `Canvas` — `handle` declared on its base class `View`, which the program never constructs directly — was read without the ARC header offset and printed the header's type-id word, a base-class string field printed empty, and a method call on a captured struct answered 0.)

**Closure lifetime.** A closure may outlive its enclosing scope (e.g., returned from a function, stored in a data structure):

- Captured `let` bindings are safe to access after the enclosing scope exits — their values are immutable and kept alive by the closure.
- Captured `var` bindings are kept alive by the closure; the variable's storage persists as long as any closure referencing it is alive.
- In compiled mode, closures that capture `var` bindings allocate the captured variable on the heap rather than the stack.

**Variable resolution.** The compiler resolves variable references using lexical scope chain lookup. Unlike Python, there is no ambiguity because Loup requires explicit `let`/`var` for all declarations — bare assignment without `let`/`var` is always a reference to an existing binding.

**Structural typing for closures.** Closures are structurally typed for assignment compatibility: a closure is assignable to any `fn(ParamTypes): ReturnType` where the parameter types and return type match, regardless of what the closure captures.

**No built-in partial application.** Loup does not provide built-in partial application or currying syntax. Developers use lambdas to achieve the same effect:

```
func add(a: int, b: int): int { return a + b; }
let add5 = func(b: int) => add(5, b);   # manual partial application
```

**Closures in compiled mode.** Closures in compiled-mode files follow the same capture rules. Captured `var` bindings typed as `Any` in `@mode(web.compiled)` produce the `W_ANY_IN_AOT_MODE` advisory (§1-2.4.2) but are permitted; `Any` remains prohibited in `@mode(host.native)` and `@mode(freestanding)`. The compiler may optimize non-escaping closures to avoid heap allocation of captured variables.

**ARC capture lists (`@mode(host.native)` or `@mode(host.dual)`).** In ARC-managed modes, closures that create ARC retain cycles must break them with weak or unowned capture list entries:

```
class Timer {
  pub var onTick: fn(): void = func() {};
  pub func stop(): void { ... }
}

# Without capture list: the timer holds the closure and the closure holds the timer — retain cycle
let timer = Timer();
timer.onTick = func() { timer.stop(); };

# With capture list: weak breaks the cycle
timer.onTick = func() [weak timer] { timer?.stop(); };   # timer is now Option[Timer]
```

*(v1.21.)* Before v1.21 this example used an `effect` closure that disposed its own `EffectHandle`. Ruling SIG-LIB made
signal and effect handles indices into a store (§2-4.1), so that closure makes no cycle and needs no capture list.

**Capture list syntax:** `func(params) [weak name, unowned other] { body }` or `func(params) [weak name] => expr`. Captured names with `weak` become `T?` inside the closure body. Captured names with `unowned` retain type `T`. Accessing a deallocated `unowned` capture is a `LifetimeError` trap in **all builds** — there is no opt-out from this trap.

```loup
# Safe: LifetimeError trap in all builds if self is freed before handler fires.
let handler = callback(func() [unowned self] { self.onFire(); });

# Prefer weak when you cannot prove self outlives the closure:
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
  doProtectedWork();   # lambda is not heap-allocated
});
```

A closure that captures `borrow` or `reads` values (non-owning borrows) may only be passed to `noescape fn` parameters — passing it to a plain `fn` parameter is a compile-time error, because the `fn` parameter may store the closure, causing the borrowed value to escape its frame (`E_BORROW_ESCAPE`).

### §1-7.4 Rest Parameters and Keyword-Only Parameters

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
  # options contains all keyword arguments not matched by named parameters
}

configure("app", timeout=5000, retries=3);
configure("app", timeout: 5000, retries: 3);    # equivalent — see below
```

`**kwargs` collects extra keyword arguments into a `dict[string, T]`.

**Named-argument syntax: `=` and `:` are interchangeable.** Per the
grammar (§1-19.5), a named argument may be written either as `name=value`
or as `name:value`. The two forms have identical semantics and may be
mixed within a single argument list. Both forms appear throughout this
document and the standard library: `=` is conventional at imperative
call sites (where it visually distinguishes a call from a colon-typed
parameter declaration), and `:` is conventional in annotations and in
declarative struct- or record-shaped constructor calls. The four
ownership-verb keywords `reads`, `edits`, `takes`, `shares` followed by
`:` are always parsed as verb acknowledgments (§3-2.4.9) and never as
named arguments; those four words cannot be used as parameter names.

**Keyword-only parameters.** A bare `*` in the parameter list forces all subsequent parameters to be keyword-only:

```
func connect(host: string, port: int, *, timeout: int = 5000, tls: bool = true) {
  # timeout and tls must be passed as keyword arguments
}

connect("localhost", 8080, timeout=3000);  # ok
connect("localhost", 8080, 3000);          # compile-time error
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
  # method and url are positional
  # headers collects extra positional args
  # timeout is keyword-only (after *args) with a default
  # opts collects extra keyword args
}
```

**Type checking.** The compiler type-checks rest parameters and spread operators:

- `*args` must have type `list[T]` for some `T`; the individual arguments must be assignable to `T`.
- `**kwargs` must have type `dict[string, T]` for some `T`; the individual keyword argument values must be assignable to `T`.
- Spread in calls: `*expr` requires `expr` to be `list[T]` where `T` matches the expected parameter types; `**expr` requires `expr` to be `dict[string, T]`.

**compiled mode restrictions.** `**kwargs` with type `dict[string, Any]` in `@mode(web.compiled)` produces the `W_ANY_IN_AOT_MODE` advisory (§1-2.4.2) but is permitted. In `@mode(host.native)` and `@mode(freestanding)`, where `Any` is prohibited, `**kwargs` must use a concrete value type. `*args` with a concrete element type (e.g., `*args: list[int]`) is permitted in all modes.

### §1-7.5 Generators and `yield`

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
let squares = (x * x for x in range(1000000));  # lazy Iterable[int]
```

Generator expressions use parentheses `(expr for x in xs)` and produce `Iterable[T]`. They are lazy — no values are computed until iterated. This contrasts with list comprehensions `[expr for x in xs]` which eagerly build the full list.

Generators implement the `Iterator[T]` interface (or `AsyncIterator[T]`), making them compatible with all iteration infrastructure.

Generators are permitted in compiled mode — they compile to state machines with no dynamic dispatch.

### §1-7.6 Decorators

Decorators attach metadata to or transform functions, classes, and methods:

```
@route("/users")
func getUsers(): Response {
  return Response.ok(fetchUsers());
}

@cache(ttl=60)
func expensiveComputation(x: int): int {
  # ...
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
# Applied as: log(auth(route(adminUsers, "/admin/users"), "admin"))
```

**Execution timing:**

- In scripted mode: decorators run at declaration time as part of statement-level execution.
- In compiled mode: decorators that only attach metadata are evaluated at compile time; decorators with runtime side effects execute at module initialization.

**Metadata access.** Decorator metadata is accessible via `core.reflect.annotations(target)`, returning a `dict[string, Any]`.

**User-defined decorators and built-in annotations.** All user-defined decorators follow the `func(target: T, ...args): T` protocol. There are no language-defined decorators — the language-defined annotations (such as `@jsexport`, `@mode`, `@entry`, `@panic_handler`, `@interruptSafe`, `@lockOrder`, `@overflowWrapping`, and all other `@name` forms listed in §1-8.8) do **not** follow the decorator protocol. They have special compiler semantics and are not callable functions. Applying a language-defined annotation where a decorator function is expected is a compile-time error.

All other `@name` annotations in user code are user-defined decorators following the protocol above.

**Type checking.** The compiler verifies that the decorator's parameter and return types are compatible with the decorated item's type.

### §1-7.7 Property Getters and Setters

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

  pub set diameter(value: float) {    # implicitly modifier — writes radius
    radius = value / 2.0;
  }
}

let c = Circle(radius=5.0);
let a = c.area;           # calls get area()  — no safe context needed
safe { c.diameter = 20.0; }  # calls set diameter(20.0) — safe context required
```

**Rules:**

- Properties are accessed with field syntax (no parentheses).
- A `get` property takes no parameters and returns a value.
- A `set` property takes exactly one parameter and returns `void`.
- A `get` without a `set` is read-only; a `set` without a `get` is write-only. Attempting to read a write-only property is `E_PROPERTY_WRITE_ONLY`; attempting to write a read-only property is `E_PROPERTY_READ_ONLY`.
- A `get`/`set` pair for the same name must have compatible types (`E_PROPERTY_TYPE_MISMATCH` if they differ).
- A stored field and a `get`/`set` property with the same name on the same class is a compile-time error (`E_PROPERTY_FIELD_CONFLICT`).
- **`set` accessors are implicitly `modifier`.** A `set` property automatically carries the `modifier` mutation contract (§3-2.4.11). Calling a setter on a plain ARC class instance requires a safe context (`E_SAFE_CONTEXT_REQUIRED`). On `unique` or `synchronized` receivers, no safe context is needed.

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

### §1-7.8 Divergence and Definite Completion

*(This section is normative.)*

A function's declared return type says what a completing call yields. `noreturn` (§1-4.4a) says a call does not complete, and this section states what the compiler checks of a body that makes that promise.

**Definite completion.** A path through a body *completes normally* when control reaches the end of the body without leaving by `return`, `throw`, or a diverging construct. The analysis is the same one that reports a missing `return` on a value-returning function; `noreturn` inverts what it is looking for.

**A path diverges** when it ends in any of:

- a `throw`;
- a call to a function or function value whose return type is `noreturn`;
- an `unreachable` expression (§1-5.11);
- a loop with no reachable exit — `while (true)` with no `break` that can execute, and the equivalent `loop`/`for` shapes.

**`E_NORETURN_FALLTHROUGH`.** A function declared `noreturn` with any path that completes normally is a compile-time error. The promise is not a hint that the function *usually* diverges; a caller is entitled to treat the call as the end of its own control flow, and a body that can fall off the end is that promise broken.

```loup
func halt(): noreturn {
    println("about to stop")     # E_NORETURN_FALLTHROUGH: this path completes
}
```

**The diagnostic sits on the declaration, not on any call site.** That is where the promise was made; a caller that trusted it has done nothing wrong.

**`E_NORETURN_RETURNS`.** A `return` statement anywhere in a `noreturn` function's body is a compile-time error, including a bare `return;`. A `return` is a normal completion by definition, so the two cannot coexist. This is diagnosed separately from fall-through because the fix differs: a stray `return` is removed, whereas a falling-through body needs a diverging path added.

**Divergence is not proven through inline assembly.** The compiler does not model the contents of an `asm` block, so a body whose only non-completing construct is assembly — `asm { "1: b 1b" }`, `asm { "hlt" }` — completes normally as far as this analysis can tell, and is `E_NORETURN_FALLTHROUGH`. Wrap it in a loop the compiler can see:

```loup
@panic_handler
func kernelPanic(msg: string, file: string, line: int): noreturn {
    serialWrite(msg)
    asm { "cli" }
    while (true) { asm { "hlt" } }     # the loop is what satisfies the rule
}
```

The alternative — treating a trailing `asm` block as diverging — was rejected: it would hold in the many cases where the assembly does loop and fail silently in every case where it does not, weakening the rule for every function that happens to end in assembly.

**`@naked` functions.** A `@naked` function declared `noreturn` does not draw the `naked-missing-return` lint (§3-3.14): the lint exists to catch a `@naked` body that omits its own return sequence, and a `noreturn` function has no return sequence to omit.

| Code | Mode | Condition |
|---|---|---|
| `E_NORETURN_FALLTHROUGH` | All | a function declared `noreturn` has a path that completes normally |
| `E_NORETURN_RETURNS` | All | a `return` statement inside a function declared `noreturn` |

---

## §1-8 Classes and Objects

*(This section is normative.)*

### §1-8.1 Class Declarations

```
class HttpClient : Any implements Closeable {
  pub let baseUrl: string;
  pub var timeout: int = 5000;

  new(baseUrl: string, timeout: int = 5000) {
    this.baseUrl = baseUrl;
    this.timeout = timeout;
  }

  pub func get(path: string): Task[Response] {
    # ...
  }

  pub static func create(url: string): HttpClient {
    return HttpClient(baseUrl=url);
  }

  pub func close(): void {
    # cleanup
  }
}
```

**Syntax:**

```
class Name[T] : SuperClass implements Interface1, Interface2 {
  # fields, constructor, methods, static methods, properties
}
```

*Compiler's rule (method names).* A method a class, struct or interface declares may share its name with a method of a built-in type — the collection methods (`get`, `set`, `length`, `contains`, `remove`, `first`, `push`, `keys`, …). (The reactive-handle methods `get`, `set`, `update`, `dispose`, `merge` and `unmount` were listed here until v1.21; ruling SIG-LIB made them methods of library types, §2-4.1, so no compiler treats their names specially.) A call on a receiver of the declaring type (or a subtype, or an implementer of the interface) calls the declared method, however the receiver is reached — a local, a parameter, a field, a collection element, a loop variable, a call result — on every compiler lane (loup#558).

### §1-8.1.1 Memory Strategy Modifiers

*(This subsection is normative.)*

A class declaration may optionally carry a **memory strategy modifier** — `local` or `shared` — that selects how instances are allocated, reference-counted, and synchronized. The bare `class` keyword is a shorthand for `local class`:

```
class Point3D { ... }          # equivalent to `local class Point3D { ... }`
local class Point3D { ... }    # explicit form
shared class Vertex { ... }    # shared-arena, atomic refcount, cross-thread
```

The two modifiers represent two different points on the ARC tradeoff curve:

| Modifier | Allocation | Refcount | Thread safety | Cross-mode ABI |
|---|---|---|---|---|
| `local class` (default) | Local heap | Non-atomic | Thread-confined by convention | Not guaranteed |
| `shared class` | Shared arena (§2-2.5) | Atomic | Safe for cross-thread access under ownership verbs | Guaranteed stable (§2-2.7) |

**Uniform ARC contract.** Regardless of implementation backing, instances of `local class` and `shared class` present the following **ARC-equivalent observable contract** in all modes:

- **Lifetime by reference count.** An instance is reachable for as long as at least one strong reference to it exists. The instance's `finalize()` method (if declared) runs at the point when the last strong reference is released, within a bounded delay.
- **Deterministic destruction.** Memory is reclaimed promptly after the final reference is released. The runtime SHALL NOT accumulate unreclaimed instances indefinitely in the presence of reachability chains that would free them under ARC semantics.
- **Cycles are the user's responsibility.** Cyclic reference graphs must be broken with `weak` references (§1-8). Programs MUST NOT rely on automatic cycle collection; the specification makes no guarantee that cyclic garbage will be reclaimed.
- **Identity is preserved.** Two strong references to the same instance compare equal via `===` and observe each other's mutations.

These four rules are the contract users program against. The contract is identical across `@mode(web.scripted)`, `@mode(web.compiled)`, `@mode(host.scripted)`, `@mode(host.dual)`, `@mode(host.native)`, and (for `local class` only) `@mode(freestanding)`.

**Freestanding identity, storage, lifetimes and return provenance (ruling CLSID-1, loup#872; amended 2026-10-15 by the maintainer: the full Rust model, and Q-F, the Rust model of storage, E0506; Q-G, dispatched calls and lambdas, and Q-H, escaping parameters, 2026-10-16).** In `@mode(freestanding)` no allocator stands behind a `local class` instance: it lives in the storage its owning declaration gave it — a frame slot of the block that declares a local, its static block for a module global. Identity holds there all the same. A class-typed binding (`var b: Ring = t`, of a local or a global), an assignment (`b = t`), a field store (`h.r = t` — a class-typed field is a reference, so re-pointing it leaves the old instance intact), a class- or interface-typed parameter, an interface conversion and a payload name the SAME instance as their source, so a mutation through either name is seen through the other; nothing copies a class instance implicitly. A FRESH value — a constructor, or a call whose result the caller owns — gets storage of its own. *Storage.* Every class-typed local owns ONE storage slot in its declaring block, and every class-typed module global its own static slot: a fresh value bound or assigned to one (`var t = Ring.make()`, `t = Ring.make()`, `gRing = Ring.make()`) is built in that variable's own slot, and the variable then names its slot again, while `x = <name>` still shares — `x` names that instance and its own slot is untouched until its next fresh assignment. Stored into a global's field a fresh value gets a static home; stored into a field of a local, a parameter or `self`, or handed to a constructor whose result a local receives, it is a temporary of the current block. *Reassigning while shared.* A fresh assignment `x = <fresh>` overwrites the instance in x's slot, so it is a compile-time error (`E_INSTANCE_REASSIGNED_WHILE_SHARED`, §3-3.17d; Rust's E0506, "cannot assign to a borrowed value") when another name that may refer to that instance — a local or interface local bound to `x`, a field of a holder that received it, a payload, a call result borrowed from it, and, for a global `x`, any global or global field that received it — is used after the assignment, on a later loop iteration included. `prev = keep; keep = Ring.make(); use(prev)` is that error; `cur = Ring.make()` in a loop with no other live name is not, and builds each iteration's instance in `cur`'s slot. The fixes: a separate local for the new instance, no further use of the other name, or — if value semantics were meant — a struct. *Lifetimes.* A named local, and a block's temporary, lives as long as its declaring block; a parameter (`self` included) borrows the caller's storage. Every name that receives a frame-held instance inherits that lifetime — `keep = t`, `h` after `h.r = t`, an interface-typed local — and storing such a name into a longer-lived place (a local declared in an enclosing block, a module global, a field of an object outside the block, a collection element or a payload), or returning it, is a compile-time error (`E_FRAME_INSTANCE_ESCAPES`, §3-3.17d). *Return provenance.* What a function's result names is part of its contract, computed over the whole program (to a fixed point over recursion): FRESH — the caller owns it (a constructor, a fresh call, the function's own local moved out), and it may HOLD instances of some parameters (`return C(p)`, a holder whose field is a parameter); BORROWED from parameter i — `return self` (`self` is parameter 0), `return p`, or a call forwarding such a result; or STATIC — `return gR`, a module global's instance. At a call site a BORROWED result is a name for the argument's instance and inherits its lifetime (`t.me().mutate()` mutates `t`), a STATIC one names the global and never dangles, and a FRESH one is the caller's own while its binding inherits the lifetime of every argument it holds. Return paths join: STATIC with BORROWED(i) is BORROWED(i), BORROWED(i) with BORROWED(j) borrows from both (the shorter lifetime); a function returning a fresh instance on one path and a name it does not own on another is an error (`E_RETURN_PROVENANCE_MIXED`) — return a fresh instance on every path, or a name on every path. A dispatched call (through an interface, or to an overridden method) has the join of every implementation it may reach as its provenance — a virtual `t.me()` returning `self` everywhere names `t` — and implementations that disagree are the same error at the method's root declaration. A function TYPE carries a provenance too — the join over every function and lambda used as a value of it — so a call through a function value binds as its members return, and members that disagree are the same error at a value use. A lambda body is checked like a function whose captures belong to the creating frame: it may not store or return a capture, and the lambda value holds its captures, so a lambda that captured a frame's instance may not be stored into a longer-lived place or returned — nor passed to a parameter its callee lets escape (stores, or passes on to one that does), which the checkers infer for every function (Rust's `F: 'static`, inferred; a `noescape fn` parameter never escapes). The fixes for an escape: an explicit copy (a call that builds a fresh instance), passing the instance in from the caller, keeping it in a module global, or — where a holder should own the value — making the nested type a struct.

#### §1-8.1.1.1 Implementation Allowance (Non-Normative)

*(This subsubsection is non-normative.)*

An implementation MAY back `local class` allocation with a tracing garbage collector — for example, the Wasm GC heap in `web.scripted`, `web.compiled`, `host.scripted`, and the JIT side of `host.dual` — provided that the four rules of the ARC-equivalent contract above are preserved as observable behavior. In practice this means:

- A tracer-backed implementation must ensure `finalize()` runs at reachability-to-zero (not at the next major-GC cycle after an arbitrary delay).
- A tracer-backed implementation must reclaim memory promptly enough that programs running within a bounded working-set do not accumulate reachable-only-via-cycle objects indefinitely. The runtime MAY include a best-effort cycle collector to satisfy this requirement, but the language specification does not require one and programs must not assume it exists.
- A tracer-backed implementation must preserve identity semantics, including `===` and hash stability, across any compaction or movement the tracer performs.

The typical implementation strategy on Wasm GC hosts is to allocate each `local class` instance as a Wasm GC struct whose first word is a Loup-managed refcount; retain/release operate on the refcount and the struct becomes unreachable to the Wasm GC exactly when the refcount drops to zero. This gives the Wasm GC runtime a prompt hint to reclaim the memory while preserving ARC semantics at the language level.

`shared class` has no such implementation freedom: its memory layout, header format, and refcount protocol are normatively specified in §2-2.5–§2-2.7 to enable cross-mode interop.

#### §1-8.1.1.2 Syntax and Placement

The memory strategy modifier, when present, appears immediately before the `class` keyword:

```
<visibility>? <strategy>? (abstract | dynamic | unique)? class Name ...
```

where `<strategy>` is `local` or `shared`. The modifier combines with other class-declaration modifiers (`abstract`, `dynamic`, `unique`) subject to the following rules:

- `unique class` and `shared class` are mutually exclusive (`E_UNIQUE_SHARED`). A `unique class` forbids aliasing; `shared class` presupposes it.
- `dynamic class` combines with `local` only — `shared dynamic class` is `E_SHARED_DYNAMIC` because shared classes have a statically committed layout (§2-2.7).
- `abstract` combines with either strategy.

#### §1-8.1.1.3 Field Type Constraints

A `shared class` may declare fields only of types that implement `Shareable` (§2-2.2). Attempting to declare a field of a non-`Shareable` type in a `shared class` is a compile-time error (`E_SHARED_FIELD_NOT_SHAREABLE`).

A `local class` may declare fields of any type, including `SharedRef[T]` — a `local class` instance may hold references to `shared class` instances. The reverse — a `shared class` holding a reference to a `local class` instance — is forbidden because `local class` does not implement `Shareable`.

#### §1-8.1.1.4 Finalizers

Either strategy may declare a finalizer by implementing the `Finalizable` interface (§1-8.9) or by declaring a `finalize()` method directly. Declaring `func finalize(): void` on a class implicitly implements `Finalizable` and is the idiomatic form; the explicit `implements Finalizable` declaration is optional but permitted for documentation.

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
- The `finalizer-live-access` lint (§1-8.9) applies identically to `local class` and `shared class` finalizers: accessing a field whose declared type implements `Finalizable` directly (without a `weak` read) produces an advisory warning.

#### §1-8.1.1.5 Mode Availability Summary

| Strategy | w.s | w.c | h.s | h.d | h.n | fs |
|---|---|---|---|---|---|---|
| `local class` (default) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `shared class` | ✓ | ✓ | ✓ | ✓ | ✓ | ⚠ (arena required) |

Both strategies are available in `@mode(host.dual)` without restriction — dual-mode classes may use either modifier and will behave identically on both the JIT and AOT pipelines.

### §1-8.2 Visibility

Loup uses two visibility levels:

- `pub` — public, accessible from any module.
- (default) — module-private, accessible only within the declaring module.

There is no `protected` or `private` keyword. Loup uses module-level encapsulation, with one exception: class fields.

*Class fields (row FPRIV-1, amended 2026-10-15 — protected-style).* A non-`pub` field `f` declared in class `D` is accessible only when both of these hold:

1. the access is inside the body of a class `C` (its methods, constructors and static methods, and the lambdas nested in them), where `C` is `D` or a subclass of `D`;
2. the receiver's STATIC type is `C` or a subclass of `C`.

For example, with `Savings : Acct` and `Checking : Acct`:
- in a method of `Acct`, `o.bal` is legal for any `o: Acct`, and also for `s: Savings`;
- in a method of `Savings`, `this.bal` and `s.bal` (`s: Savings`) are legal;
- in a method of `Savings`, `a.bal` with `a: Acct` and `c.bal` with `c: Checking` (a sibling subclass) are not, because a subclass cannot reach into a base-typed or sibling object and bypass that class's invariants.

Anywhere else (a module-level function, top-level code, a sibling class, even in the same module) reading or writing `f` is the compile-time error `E_FIELD_PRIVATE`. It is reported at the access site and names the field and its declaring class `D`. Non-`pub` methods, struct fields (§1-10.2.1) and module-level declarations stay module-private.

### §1-8.3 Inheritance

Loup supports single inheritance from one superclass (defaulting to `Any` if omitted) plus implementation of multiple interfaces. A class that (directly or transitively) inherits from itself creates a circular class hierarchy and is a compile-time error (`E_CIRCULAR_CLASS`).

*Compiler's rule (an interface as the supertype).* `class C : I` where `I` names an INTERFACE is `class C implements I` — the class has no superclass (it extends `Any`), `I` heads its interface list (`class C : I implements J` implements both), and it must provide `I`'s methods exactly as the `implements` form must; `x is I`, `C` assignable to `I` and dispatch through `I` follow (§1-4.7 names the form). A supertype that names neither a class nor an interface is an error ("supertype of 'C' must be a class type"). The supertype and every `implements` entry may name a type in a braced namespace by its path (`class C : ns.B`, `implements ns.I`), resolved through the namespace's members as any type path is. (loup#667; row SUP-1. Stage0 rejected `class C : I`, the self-hosted checker took `I` for a superclass and checked no methods; both rejected `implements ns.I`.)

*Compiler's rule (subclass assignability is order- and module-independent).* A value of class `C` is assignable wherever any class on `C`'s superclass chain, or any interface a class on that chain implements, is expected. The relation is a property of the declarations alone: it does not depend on which module declares `C` or its ancestors, on declaration order (a function's parameter or result, a field, or a class's supertype may name a class declared later in the module or in another module), or on how the value was obtained (a constructor call, a call result, an un-annotated binding, a parameter). It applies equally to arguments, bindings, returns, collection elements (§1-3.8), `with` resources and `throw` (§1-18.1). (Row SUBSTUB-1. Both checkers resolved such forward or cross-module names to a provisional, member-less view of the class and kept it in the signature, so `show(makeLeaf())` with `func makeLeaf(): Leaf` collected before `class Leaf : Base` was "argument 1 of 'show': expected 'Base', found 'Leaf'", while `let l: Leaf = makeLeaf(); show(l)` was accepted.)

*Compiler's rule (an inherited member is the subclass's member).* A method a class inherits is called on a subclass receiver with the signature of the nearest ancestor that declares it: the call's result has that method's declared result type, ownership (an owned or a borrowed result) and alias behaviour, whether the result is bound (`let r = leaf.make()`), annotated, chained (`leaf.make().release()`), iterated (`for (x in leaf.all())`) or cast (`leaf.ratio() as int`), in any module, and through any number of inheritance levels. An override in a nearer class is that class's own member and keeps its own signature. Dispatch stays virtual over the receiver's runtime class (§1-8.3.1). (Row INHMEM-1. Stage0's native build keyed a method's result facts by the DECLARING class, while the call names the receiver's class, so the result of `Leaf().make()` with `make` declared on `Base` was untyped there: `size.w as int` on an inherited `frame(): Rect` converted the f64 bit pattern (4648840715353194496 for 640.0), a `for` over an inherited `list[C]` result crashed, an owned result was never released, and in round 2 `r.release()` failed to link through the prelude's freestanding `InterruptGuard.release`. Inherited property accessors (`get`/`set`, §1-7.7) are not covered by this rule's implementation yet.)



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

### §1-8.3.1 `override` and `final`

*(This section is normative.)*

Loup requires explicit `override` when a class re-declares a method that already has a concrete implementation in some ancestor, and provides `final` to prevent further extension or override. Together these protect against accidental shadowing and let API authors seal extension points.

**`override` requirement.** A method declaration that re-declares a method present **as a concrete implementation** in any ancestor (superclass concrete method, or interface default method) MUST be marked `override`. Omitting `override` in this case is `E_OVERRIDE_REQUIRED`.

A method declaration marked `override` MUST have a corresponding inherited method to override. If no ancestor declares a method with a matching signature, the modifier is spurious and the declaration is `E_OVERRIDE_NO_TARGET`.

*Compiler's rule (inherited members of an instantiated supertype).* A field or method a class inherits from a generic superclass has that superclass's type parameters replaced by the arguments the class's supertype clause gives them, through every level of the chain: with `class IntBox : Box[int]`, `b.value` and `b.get()` on an `IntBox` are `int`; with `class ListBox[U] : Box[list[U]]`, on a `ListBox[bool]` they are `list[bool]`. (b36f-reify NOTE 11: Stage0 left them typed by the superclass's own parameter, so `IntBox(4).value + 1` was rejected; the self-hosted checker applied the rule. Stage0 applies it where the substituted type is concrete; inside a generic subclass's own body, where it would mention the subclass's parameter, the member keeps its declared type for now.)

*Compiler's rule (a matching signature; task v21.p8.226).* A method re-declaring an inherited method matches it when it has the same arity; each parameter's type is IDENTICAL to the inherited one's once the superclass's type arguments are substituted (`class IntBox : Box[int]` overrides `put(x: T)` as `put(x: int)`; a `buffer[T, _]` parameter matches only `_`, a `buffer[T, N]` only the same `N`, §3-3.17b); each parameter's ownership verb is the same (no verb is `reads`, §3-2.4.9); and its result is the inherited result or a subtype of it. The result is COVARIANT, as §1-4's function-type compatibility is in the result ("the return type (covariant)"), and because `Self` is the implementing type (§1-8.4) — an override of a `Self`-returning method returns its own class; parameters are not contravariant (identical, as the matching-signature rule reads). Covariance is memory-safe on every lane: a class result is an ARC pointer on the hosted lanes, and on the freestanding lanes every class block has one program-wide size, so the caller's result storage for the static type holds any subclass the override returns (measured: a covariant override and a `Self` interface dispatch called through the base type leave canary words around the caller's result intact on Stage0's LLVM and llbe routes and the self-hosted clang and llbe routes). (Override result covariance APPROVED by the maintainer 2026-10-16.) A mismatch is `E_OVERRIDE_NO_TARGET`, naming the first difference with both types: `method 'feed' in class 'Zoo' has parameter 1 of type 'Animal', but overridden method 'Keeper.feed' takes 'Dog'`, `… has 2 parameter(s), but overridden method 'Base.step' has 1`, `… takes parameter 1 as 'edits', but overridden method 'Base.fill' takes it as 'reads'`, `… has return type 'int', incompatible with overridden return type 'string'`; a different `static`-ness stays `E0001`. A class's or struct's implementation of an interface method is held to the same rule and reported with the conformance code `E0001` (`method 'put' in class 'Box' has parameter 1 of type 'string', but interface 'Sink' requires 'int'`); a built-in interface (`Equatable[T]`, `Add[T]`, …), which the checker registers with `Any` standing for its type parameter, is compared against the type argument the implementation names, and an operator method (`op_+`, …) is matched through the operator registry instead. Both checkers apply the rule with the same codes and texts. (Spec compliance, no ruling needed; until 1.26.0 neither checker compared parameter types or verbs, and Stage0 alone required an identical result.)

**`override` is not required for abstract implementations.** Implementing an inherited *abstract* method (from an `abstract class` or an interface without a default body) does not require `override`, because the abstract declaration is itself an explicit "must be implemented" signal — there is no shadowing risk to guard against. Adding `override` in this case is permitted but not required, and is not a warning.

```
abstract class Shape : Any {
  abstract func area(): float;             # abstract — implementations don't need `override`
  pub func describe(): string {            # concrete — overrides require `override`
    return i"Shape with area {$ area() $}";
  }
}

class Circle : Shape {
  pub let radius: float;
  new(radius: float) { this.radius = radius; }

  pub func area(): float {                                  # ✓ implementing abstract — `override` optional
    return 3.14159 * radius * radius;
  }

  pub override func describe(): string {                    # ✓ overriding concrete — `override` required
    return i"Circle of radius {$ radius $}";
  }
}

class BadCircle : Shape {
  pub func describe(): string { return "circle"; }          # ✗ E_OVERRIDE_REQUIRED
}

class StrayMethod : Shape {
  pub override func paint(): void { }                       # ✗ E_OVERRIDE_NO_TARGET — Shape has no `paint`
}
```

**`final class`.** A class marked `final` cannot be subclassed. Any class declaration whose superclass is `final` is `E_FINAL_EXTEND`. `final` may not be combined with `abstract` on the same class declaration — an unsubclassable class with required-to-be-overridden abstract members is contradictory (`E_FINAL_ABSTRACT`).

```
final class Singleton : Any {
  pub static let instance: Singleton = Singleton();
  new() { /* private by default */ }
}

class Subclass : Singleton { }                              # ✗ E_FINAL_EXTEND
```

**`final func`.** A method marked `final` cannot be overridden in a subclass. Any subclass that re-declares a `final` method (whether or not it also marks it `override`) is `E_FINAL_OVERRIDE`. `final` may not be combined with `abstract` on the same method declaration (`E_FINAL_ABSTRACT`).

The combination `override final` is permitted and idiomatic — the method overrides its parent's implementation and seals further override:

```
class Base : Any {
  pub func tick(): void { /* default */ }
}

class Derived : Base {
  pub override final func tick(): void { /* sealed */ }     # ✓ overrides Base.tick, seals further override
}

class Further : Derived {
  pub override func tick(): void { }                        # ✗ E_FINAL_OVERRIDE
}
```

**Interaction with `abstract`.** Marking an abstract method `final` is contradictory and is `E_FINAL_ABSTRACT`. Marking an abstract class `final` is also `E_FINAL_ABSTRACT` — abstract classes exist to be subclassed.

**Interaction with `dynamic`.** `final` and `dynamic` are orthogonal. A `dynamic class` may be `final`; it accepts dynamic property assignment but cannot be subclassed.

**Interaction with interfaces.** `final` does not apply to interface methods (interface methods are always abstract or default-implementable; sealing is meaningless on a contract). Declaring `final` on an interface member is `E_FINAL_INTERFACE_MEMBER`.

**Interaction with `modifier`.** A `final modifier func` and a `final func` follow the same rule — neither can be overridden in a subclass.

**Top-level functions.** `final` and `override` apply only to class methods. Both modifiers on a top-level (module-scope) function declaration are `E_FINAL_AT_TOPLEVEL` / `E_OVERRIDE_AT_TOPLEVEL` respectively.

### §1-8.3.2 `sealed`

*(This section is normative.)*

A class marked `sealed` declares that all subclasses are known at compile time and must reside in the declaring module. An external module attempting to extend a `sealed` class is `E_SEALED_EXTERNAL`. Sealed hierarchies enable closed polymorphism for serialization (§4-1.6): deserialization of an unknown type URI in a sealed hierarchy raises `DeserializationError` rather than producing a `RemoteException` fallback.

`sealed` combines with `abstract` — `abstract sealed class` is an abstract base with a closed set of concrete subclasses, the standard shape for closed sum-of-products data models. `sealed` is mutually exclusive with `final` (`E_FINAL_SEALED`); `final` permits no subclasses while `sealed` permits a closed set, so combining them is contradictory.

```
sealed class Shape {
  pub let color: string;
  new(color: string) { this.color = color; }
}

class Circle    : Shape { pub let radius: float;          /* ... */ }   # ✓ same module
class Rectangle : Shape { pub let width: float; pub let height: float; }   # ✓ same module

# In a different module:
# class Hexagon : Shape { /* ... */ }                                       // ✗ E_SEALED_EXTERNAL
```

```
abstract sealed class Result[T, E] {
  abstract func isOk(): bool;
}

class Ok[T, E]  : Result[T, E] { pub let value: T;  pub override func isOk(): bool { return true;  } }
class Err[T, E] : Result[T, E] { pub let error: E; pub override func isOk(): bool { return false; } }
```

**Interaction with `dynamic`.** `sealed` and `dynamic` are orthogonal. A `dynamic class` may be `sealed` — it accepts dynamic property assignment and has a closed subclass set.

**Interaction with `unique`.** `sealed` and `unique` are orthogonal — both modifiers may apply, with the standard `unique class` rule that subclasses of a `unique` class must also be declared `unique`.

### §1-8.4 Constructors, `this`, and `Self`

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
  # auto-generated: new(x: float, y: float) { this.x = x; this.y = y; }
}

let p = Point(x=1.0, y=2.0);
```

*Compiler's rule (the auto-generated constructor's arguments).* Each argument is checked against the field it initialises, exactly as a struct constructor's are (`field 'x' of 'Point': expected 'float', found 'string'`). The fields are the class's LAYOUT — an ancestor's fields first, then the class's own, each in declaration order — and the arguments are placed as a struct constructor's are: a named argument fills the field it names wherever it stands (`Point(y=2.0, x=1.0)` sets `x` to `1.0`), and a positional argument fills the lowest field not yet filled, as for a function's parameters (§1-19.5). A field no argument fills takes its declared default; a field declared without a default that no argument fills is an error (`missing required field 'x' in 'Point' constructor call`), so a call may leave out exactly the defaulted fields (`Q(c = 9)` when `a` and `b` have defaults). Three kinds of field count as defaulted: a `buffer[T, N]` field in its allocate form (its declaration materialises zero-filled storage, §3-3.17b), a throwable class's `message`, `stackTrace` and `cause` (§1-18.1 — the failure machinery fills them), and the lock word the compiler adds to a `synchronized` class. A field filled twice (`duplicate field 'x' in 'Point' constructor call`), a name that is no field (`unknown field 'z' in class 'Point' constructor`) and an argument beyond the last field are errors too. The arguments are evaluated in source order, and a named argument is never an assignment: `Point(x=1.0)` leaves a local `x` alone. A class whose base is a built-in exception class is not checked this way. For a GENERIC class, type arguments written at the call (`Box[int](v: 5)`) are the class's and the fields declared with its type parameters are checked against them; without them, an argument for a field declared exactly a type parameter binds that parameter, and a call that binds every parameter (written or bound) is typed as the instantiated class (`Box(v: 5)` is a `Box[int]`, so `Box(v: 5).v + 1` checks), as a call of a declared constructor is; a parameter no field argument binds leaves the call typed as the bare class. (Row IMPCTOR-1 in `specs/x-update-v1_20-to-v1_21/design.md`; b36f-reify NOTE 11: Stage0 typed every such call as the bare class and ignored written arguments.)

**`this`** is always implicitly available inside instance methods and constructors. It refers to the current instance and is read-only — it cannot be reassigned.

**`super(args)`** calls the direct superclass constructor from within a subclass constructor body. It must appear as a statement before any access to `this` fields or methods. A subclass whose superclass has a non-default constructor MUST call `super(args)`; omitting it is a compile-time error (`E_SUPER_NOT_CALLED`). `super()` may not be called from instance methods — only from constructor bodies.

**Implicit superclass construction.** Because `super(args)` is required only for a NON-default superclass constructor, a DEFAULT (zero-argument) superclass constructor runs implicitly: a subclass constructor whose body does not call `super(...)` runs its superclass's zero-argument constructor before its own first statement, and a subclass that declares no constructor of its own runs the nearest ancestor's zero-argument constructor at construction. The subclass's own assignments therefore always win. A superclass constructor that takes arguments is never called implicitly — there are no arguments to supply, which is what `E_SUPER_NOT_CALLED` reports.

**Calling the superclass's method: `super.m(args)`** (ruling SUPER-1, loup#786). Inside an instance method or a constructor of a class that has a superclass, `super.m(args)` calls the DIRECT superclass's implementation of `m` — the one the enclosing class overrides or inherits, whether the direct superclass declares it or inherits it from further up — with `this` as the receiver. The call is bound statically: it never dispatches on the receiver's runtime class, so an override that calls `super.m(...)` extends its parent's behaviour instead of re-entering itself, however deep the chain. Arguments and the result are checked as for `this.m(args)` against that implementation's signature. `super` is not a value: `super(args)` and `super.name(args)` are its only forms, and anything else (`super`, `super.field`, `super.m` without a call) is a parse error. It is an error (`E_SUPER_OUTSIDE_METHOD`) outside an instance method or constructor — at the top level, in a free function, in a `static` method — and (`E_SUPER_NO_SUPERCLASS`) in a class with no superclass; it is `E_SUPER_NO_METHOD` when the superclass chain has no instance method `m` with a body (none at all, a `static` one only, or an `abstract` one). Inside a constructor, `super.m(...)` reads `this`, so before a required `super(args)` it is `E_SUPER_NOT_CALLED` like any other use of `this`. A lambda written inside a method may call `super.m(...)`; it captures `this`. Interface default methods are not reachable through `super` (SUPER-1 leaves them out of scope). *Compiler's rule:* the constructor case is the compiler's reading of "an instance method" (constructors run on an instance and may need the parent's behaviour); design row SUPER-1a.

**Error codes.**

| Code | Mode | Condition |
|---|---|---|
| `E_CIRCULAR_CLASS` | All | Class hierarchy contains a cycle (e.g. `class A : B` and `class B : A`) |
| `E_ABSTRACT_INSTANTIATION` | All | Attempt to directly instantiate an `abstract class` — only concrete subclasses may be instantiated |
| `E_ABSTRACT_NOT_IMPLEMENTED` | All | A non-abstract class extends an `abstract class` but does not implement all inherited abstract methods |
| `E_OVERRIDE_REQUIRED` | All | Re-declaring an inherited concrete method without the `override` modifier (§1-8.3.1) |
| `E_OVERRIDE_NO_TARGET` | All | `override` modifier present but no inherited method matches the signature; a method re-declaring an inherited one with a different arity, a parameter type or verb that is not identical, or a result that is not the inherited one or a subtype (§1-8.3.1) |
| `E_FINAL_EXTEND` | All | Class declaration extends a class marked `final` (§1-8.3.1) |
| `E_FINAL_OVERRIDE` | All | Subclass method re-declares a method marked `final` in an ancestor (§1-8.3.1) |
| `E_FINAL_ABSTRACT` | All | A declaration is marked both `final` and `abstract` — contradictory (§1-8.3.1) |
| `E_FINAL_INTERFACE_MEMBER` | All | `final` applied to an interface member; sealing has no meaning on a contract (§1-8.3.1) |
| `E_FINAL_AT_TOPLEVEL` | All | `final` modifier on a top-level (module-scope) function declaration; `final` applies only to class methods (§1-8.3.1) |
| `E_OVERRIDE_AT_TOPLEVEL` | All | `override` modifier on a top-level (module-scope) function declaration; `override` applies only to class methods (§1-8.3.1) |
| `E_FINAL_SEALED` | All | A class is marked both `final` and `sealed` — contradictory (§1-8.3.2) |
| `E_SEALED_EXTERNAL` | All | A class outside the declaring module attempts to extend a `sealed` class (§1-8.3.2) |
| `E_DUPLICATE_CONSTRUCTOR` | All | Two `new(...)` constructor blocks declared in the same class |
| `E_SUPER_NOT_CALLED` | All | Subclass constructor body accesses `this` or returns without calling `super(args)` when the superclass has a non-default constructor |
| `E_SUPER_NOT_CONSTRUCTOR` | All | `super(args)` appears outside a constructor body |
| `E_SUPER_WRONG_ARGS` | All | `super(args)` argument types or count do not match any superclass constructor signature |
| `E_SUPER_OUTSIDE_METHOD` | All | `super.m(args)` outside an instance method or constructor of a class (top level, free function, `static` method) — ruling SUPER-1 |
| `E_SUPER_NO_SUPERCLASS` | All | `super.m(args)` in a class that has no superclass — ruling SUPER-1 |
| `E_SUPER_NO_METHOD` | All | `super.m(args)`: the superclass chain has no concrete instance method `m` (missing, `static` only, or `abstract`) — ruling SUPER-1 |

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

*Compiler's rule (`Self`; task v21.p8.226).* Inside a class's or struct's own members — a parameter, a result, a field, a local, a nested type argument, a static factory's result — `Self` names the enclosing type; in a generic type it carries the type's parameters (`Self` in `class Cell[T]` is `Cell[T]`). Inside an interface body it names the interface, and in a default method synthesized into an implementing class (§1-11.1) the implementing class. So `override func clone(): Self` in `class B : A` is `clone(): B` over `A`'s `clone(): A` — a covariant result (§1-8.3.1) — and a call through an `A`-typed receiver on a `B` returns the `B` the override built. Both checkers and both lowerings resolve it the same way (until 1.26.0 `Self` was `undefined type 'Self'` in a class or struct body on every lane).

### §1-8.5 Static Members

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

Static fields are initialized when the class declaration is executed (see §1-2.1) and are shared across all instances.

### §1-8.6 Instance Fields

```
class User : Any {
  pub let name: string;          # immutable after construction
  pub var email: string;         # mutable
  pub let createdAt: Instant = Instant.now();  # default value
}
```

Instance fields without a default value must be initialized in the constructor (`E_FIELD_NOT_INITIALIZED` if any remain unset after the constructor body).

*Compiler's rule (the field keyword — ruling FIELD-1, loup#784).* A class field is declared `let` or `var` (§1-19.8 `FieldDecl`; a template's fields too, §1-23). A field written with neither — `name: T;` — is the parse error `E_BARE_FIELD`, whose fix-it names both keywords; it used to compile as a field that was mutable AND exempt from the `modifier` / `safe` rules. A `var` field is held to those rules like any other: a method that assigns it is a `modifier` (§3-2.4.1); assigning it, or calling a `modifier` method, on an instance reached through anything but `this` needs a safe context (below, and §3-2.4.11); and doing either through a parameter needs an `edits` parameter (§3-2.4.9). A STRUCT field keeps the `StructField` grammar, which needs no keyword.

| Code | Mode | Condition |
|---|---|---|
| `E_BARE_FIELD` | All | A class (or template) field declared without `let` or `var` (FIELD-1) |

**External writes to `pub var` fields and safe contexts.** A direct write to a `pub var` field on a plain ARC class instance from outside the class — such as `user.email = "new@example.com"` — requires a safe context, identically to calling a `modifier` method on that instance (§3-2.4.11). On `unique` receivers, direct field writes are unconditionally safe. On `synchronized` class instances, external field writes acquire the per-instance lock automatically.

**`weak` field qualifier.** A `weak` field holds a non-owning reference to a `local class` or `shared class` instance. Under the ARC memory model (§1-8.1.1), `weak` fields do not increment the strong refcount; when the referent is deallocated (strong count reaches zero), the `weak` field automatically reads as `None`. The implementation maintains a weak-reference side table that records live weak references to each instance so they can be atomically zeroed at destruction time.

`weak` fields are always typed `T?` (i.e., `Option[T]`). Assigning a non-optional value to a `weak` field is permitted and automatically wraps it in `Some`. Reading a `weak` field always yields `Option[T]`.

```
class Node : Any {
  pub let value: int;
  pub weak var parent: Node?;   # weak — does not prevent deallocation
  pub var children: list[Node]; # strong reference
  new(value: int) { this.value = value; this.parent = None; }
}
```

**Mode availability (updated in v1.18).** `weak` references are available in all modes that have an ARC memory model: `@mode(web.scripted)`, `@mode(web.compiled)`, `@mode(host.scripted)`, `@mode(host.dual)`, and `@mode(host.native)`. In modes where the runtime backs `local class` with a tracing collector (per §1-8.1.1.1), the runtime maintains the required weak-reference side table as part of its ARC-equivalent contract. `weak` is **not available** in `@mode(freestanding)` — the target does not provide the side-table infrastructure required (`E_FREESTANDING_WEAK`).

**`weak` references to `shared class` instances.** A `weak` field referencing a `shared class` instance compiles to a `SharedWeakRef[T]` (see Loup Standard Library Reference §21.1.6) and is backed by the arena's weak-reference side table (§2-2.5 header offset 32). Weak-upgrade uses the compare-exchange protocol specified in §2-2.7 under "Refcount protocol". Cross-thread weak-upgrade is atomic — a `weak` read that observes a live instance is guaranteed to see that instance remain live for the duration of the read.

**`unowned[~name]` field qualifier.** An `unowned[~name]` field holds a non-owning reference whose safety is **compile-time proven** via the existing region system (§3-2.4.2). The class must declare `[lifetime ~name]` as a class-level lifetime parameter. The referent must originate from a scope that the compiler can statically verify contains (outlives) the `~name` region.

`unowned[~name]` fields do not increment `strong_count` and are not tracked by the ARC zeroing side table. Because safety is proven at compile time, **no runtime null-trap is inserted** — access is zero-cost, equivalent to a raw pointer load.

```loup
@mode(host.native)

# The class carries [lifetime ~owner] anchoring all unowned fields.
class TreeNode[lifetime ~owner] : Any {
  pub let value: int;

  # Compile-time proven: every value assigned here must originate from
  # a scope that the compiler verifies contains (outlives) ~owner.
  unowned[~owner] var parent: TreeNode[~owner]?

  pub var children: list[TreeNode[~owner]] = [];

  new(value: int, parent: TreeNode[~owner]?) {
    this.value = value;
    this.parent = parent;
  }
}
```

**Compile-time verification rules.** At every assignment site for an `unowned[~name]` field the compiler applies the region containment rules from §3-2.4.2:

- The value being assigned must have been declared in a scope whose ARC lifetime the compiler can verify contains `~name`.
- The class instance itself may not outlive `~name` (enforced via rule 4 of §3-2.4.2 applied to the class's `[lifetime ~name]` parameter).
- Assigning a value from a narrower or unrelated scope is `E_UNOWNED_LIFETIME_MISMATCH`.
- A class with an `unowned[~name]` field that does not declare `[lifetime ~name]` as a class parameter is `E_UNOWNED_CLASS_NO_PARAM`.
- Bare `unowned` on a class field without a lifetime annotation is `E_UNOWNED_NO_LIFETIME`.

**What the proof covers.** The region model proves strictly hierarchical (nested) lifetime relationships: a parent scope containing the referent outlives a child scope containing the holder. This covers the common cases — trees, scene graphs, parent-child UI hierarchies, and similar structures — where the lifetime ordering is statically evident from scope nesting. For nodes at equal or unordered lifetimes, `weak` remains the correct choice; such references cannot be proven safe without a runtime side table.

**Scope.** `unowned[~name]` fields are available in all six modes (see §1-2.6 and §3-2.4). The region model is enforced identically across modes; the absence of a runtime side table is what distinguishes `unowned[~name]` from `weak`, and that absence is meaningful on every target.

**`weak` vs `unowned[~name]`.** `weak` is always safe on all targets and requires no lifetime annotation. Use `unowned[~name]` only when: (a) the lifetime relationship is strictly hierarchical and provable from scope nesting, and (b) the absence of a runtime side-table lookup is measurable and meaningful for the workload.

```loup
@mode(host.native)

# Correct: parent is created in scope ~tree, which outlives all nodes.
func buildTree[lifetime ~tree](): TreeNode[~tree] {
  let root = TreeNode[~tree](value=0, parent=None);
  let child = TreeNode[~tree](value=1, parent=Some(root));  # OK: root is in ~tree
  return root;
}

# Compile-time error: cannot assign a value from a narrower scope.
func bad[lifetime ~tree](): void {
  let root = TreeNode[~tree](value=0, parent=None);
  let inner = TreeNode[~tree](value=2, parent=None);
  root.parent = Some(inner);  # E_UNOWNED_LIFETIME_MISMATCH: inner is not in ~tree
}
```

| Code | Mode | Condition |
|---|---|---|
| `E_FIELD_NOT_INITIALIZED` | All | Constructor body exits without initializing one or more `let` or `var` fields that have no declared default value |

### §1-8.7 Dynamic Objects

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
  func hasField(name: string): bool;
  func getField(name: string): Any;
  func setField(name: string, value: Any): void;
  func deleteField(name: string): bool;
  func fieldNames(): list[string];
}
```

**Dynamic field access** uses `!{...}` syntax — never `.`:

```
obj!{count} = 123;        # auto-boxes to Int
let n: int = obj!{count}; # auto-unboxes Int to int
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
  let x = dobj.foo;        # same as obj!{foo}
  dobj.foo = 1;            # same as obj.setField("foo", Int.box(1))
}
```

**Interpretation notes (loup#520).** Where the rules above leave a choice open, both compilers implement the following:

- *Missing field.* `getField` (and so `obj!{f}`) of a field that was never set, or was deleted, throws `KeyError`. `hasField` is the non-throwing probe.
- *`deleteField`* answers whether the field existed before the call (`false` for a field that was not set); it never throws.
- *`fieldNames`* lists the currently set dynamic fields in insertion order; declared members are not included.
- *"Statically known" receiving type.* A read auto-unboxes when it is the initializer of a `let`/`var` declared with a type other than `Any` (`let n: int = obj!{count}`): the read becomes a checked `as` cast, so a value of another type throws `TypeError`. Every other position receives `Any` (write `obj!{count} as int` there).
- *`Any` is not `Dynamic`.* `!{…}` on an `Any`-typed value is `E_DYNAMIC_ACCESS_NOT_DYNAMIC`; narrow it to a `Dynamic` first.
- *Declared members win.* A `dynamic class` that declares one of the five `Dynamic` methods itself keeps its own; only the missing ones are provided.
- *Dynamic view.* The source expression is evaluated once and bound to the view name. Inside the block, `dobj.foo` reads and `dobj.foo = v` writes the dynamic field `foo`; a method call `dobj.m(…)` calls the declared method `m` (so `dobj.hasField("x")` works); the bare name `dobj` is the object itself.
- *Modes.* `dynamic class` in `@mode(freestanding)` is `E_FREESTANDING_DYNAMIC`; in `web.compiled`, `host.dual` and `host.native` it draws one `W_ANY_IN_AOT_MODE` advisory on the class declaration and compiles.

### §1-8.8 Annotations

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
| `@jsexport` | `func`, `async func` | Marks a function as callable from JavaScript (see §2-3.2) |
| `@concurrent` | `async func` | Asserts function is safe from any executor thread; enforces Sendable captures (§2-1.9.5) |
| `@unsafe(reason)` | `extern native func`, `class`, `func`, a `var` / `let` / `const` binding, an expression statement | Programmer-asserted safety claim, bypassing compiler verification; see §3-2.4.6. On a binding it is the declaration-level acknowledgement of an overlay or of the struct copy its initializer makes (§3-3.17b, row OVL-1) |
| `@symbol("c_name")` | `extern native func` | Binds the declaration to the C symbol `c_name` instead of its own name; several declarations may bind one symbol, each with its own signature (Runtime §2-3.4) |
| `@vectorize` | `for` loop | Hints compiler to auto-vectorize the loop body |
| `@vectorize(width=N)` | `for` loop | Same with suggested SIMD lane count |
| `@overflowWrapping` | `func` | Opt-in wrapping arithmetic for all fixed-width integers in the function (§1-4.1.1) |
| `@deprecated(msg)` | `func`, `class`, `interface`, `enum`, `struct`, method | Marks a symbol as intended for removal in a future version. Any use of a `@deprecated` symbol at a call site or reference site emits a compile-time warning that includes `msg`. The symbol remains usable. |
| `@mode(m)` | File (first line) | Declares the execution mode: `@mode(host.scripted)` (default), `@mode(web.compiled)`, `@mode(host.native)`, or `@mode(freestanding)` — must be the first active token (§1-2.5) |
| `@entry` | module-level `func` | Freestanding: bare binary entry point (§3-3.5) |
| `@panic_handler` | `func` | Freestanding: called on panic when `--panic=custom` (§3-3.6) |
| `@interrupt(...)` | `func` | Freestanding: interrupt service routine (§3-3.13) |
| `@naked` | module-level `func` | Freestanding: suppresses prologue/epilogue (§3-3.14) |
| `@no_zero_locals` | `func` | Freestanding/native: suppresses prologue zero-initialization of register/local slots (§3-3.16b) |
| `@callconv(c)` | `func` | Freestanding: overrides calling convention (§3-3.15) |
| `@allocator` | `func` | Freestanding: registers custom heap allocator (§3-3.16) |
| `@deallocator` | `func` | Freestanding: registers matching deallocator (§3-3.16) |
| `@repr(layout)` | `struct` | Freestanding/native: controls struct memory layout (§3-3.10) |
| `@align(n)` | `struct`, `func`, static | Freestanding/native: minimum alignment in bytes (§3-3.11) |
| `@section(name)` | `func`, static | Freestanding: ELF section placement (§3-3.12) |
| `@interruptSafe` | `func`, interface method signature | Freestanding: declares a function safe to call from interrupt handler context; enforces `native.atomic`-only access to `static var` bindings (§3-3.24.1). On an interface method signature (abstract or default — the only annotation an interface method takes, row ISRIFACE-1) it is a contract: every implementation must be `@interruptSafe`, and a call through the interface is colour-checked against it |
| `@signalSafe` | `func` | Native: declares a function safe to call from OS signal handler context; enforces signal-safe operations only (§1-18.9) |
| `@lockOrder(n)` | any `class` | Native/freestanding: assigns a lock-ordering level `n` to a class (`synchronized` or plain); prevents lock-ordering inversions at compile time (§3-2.4.13) |
| `@total` | `func` | Asserts the function is total over untrusted input — it may reject, loop, and index, but never fault. The body may contain no unchecked operation (`unsafe("reason") { }` / inline `asm`); violation is `E_TOTALITY` (§1-8.12.1) |
| `@complete(T)` | `enum` | Requires every variant to carry a field of the completion type `T`, so no variant can drop a moved-in value; violation is `E_INCOMPLETE_VARIANT` (§1-8.12.2) |
| `@must_resolve` | `class` (typically `unique class`) | Every binding of the class type must be consumed (moved to a `takes` parameter or `consume`d) before block exit; violation is `E_UNRESOLVED` (§1-8.12.3) |
| `@noderef` | `class`, `struct` | Seals a pointer/handle type against read-through: no member method may return the sealed pointee; violation is `E_NODEREF` (§1-8.12.4) |
| `@debug_control_channel` | `func` | Freestanding (`--debug`): registers the bidirectional control transport for the freestanding debug service (§3-3.25.3). **Specified pending implementation — accepted but inert; see the status notice at §3-3.25.** |
| `@debug_trace_channel` | `func` | Freestanding (`--debug`): registers the unidirectional trace transport for the freestanding debug service (§3-3.25.3). **Specified pending implementation — accepted but inert; see the status notice at §3-3.25.** |
| `@webcomponent(name)` | `class` | Registers the class as a Custom Element with the given tag name (see §2-4.10). `browser` target only. |
| `@attribute` | `var` field or property `get`/`set` pair | Declares an observed HTML attribute on a `@webcomponent` class (see §2-4.10). |

All other annotations are user-defined. Language-defined annotations have special compiler semantics and are not ordinary functions.

*Compiler's rule (where an annotation may stand, and what reaches HIR — loup#672).* A run of annotations may precede a declaration, a `let` / `var` / `const` binding, or an expression statement (a statement-level `@unsafe("reason")` there is the single-statement `unsafe("reason") { … }` region, §3-2.4.6); before any other statement — `while`, `for`, `if`, `return`, `namespace`, … — it is "expected declaration after annotation", unless every annotation in it is a module directive (`@mode`, `@compiled`). (Open: the table's LOOP annotations — `@vectorize` on a `for` loop, `@strategy` on `for concurrent` — are therefore rejected on a loop by both parsers today, though both HIRs have a slot for them.) `sealed` is a keyword (§1-8.3.3), so `@sealed` names no annotation. A retired annotation (§3-2.4.6) is `E_RETIRED_ANNOTATION` wherever it is written, including a position whose annotations are otherwise dropped (a constructor, an interface, a binding). Each language-defined annotation above is carried in HIR on every function, method, class, struct, enum, field and `extern native` declaration it is written on (its target rule is a checker diagnostic, e.g. `E_ANNOTATION_TARGET`, not a silent drop); an interface's, a constructor's and a binding's annotations are not carried (a struct method's are, as a function's; an interface METHOD's `@interruptSafe` is, row ISRIFACE-1; a binding's `@unsafe("reason")` is carried as its acknowledgement flag, §3-3.17b). Both compilers hold these identically.

*Compiler's rule (module-level functions only — loup#752, ruling NAKED-1 of loup#749).* `@entry`, `@naked` and `@callconv(naked)` are valid only on a MODULE-LEVEL function (a member of a braced namespace counts). Written on a method — of a class, struct, enum, interface or template —, on a field, on a type declaration, or on a function declared inside a block, each is `E_ANNOTATION_TARGET`, reported by both parsers wherever the declaration's own annotations are dropped: the image's entry symbol and a prologue-less body belong to a free function, and a method needs its receiver. The mode rules (`E_ENTRY_NOT_FREESTANDING`, `E_NAKED_NOT_FREESTANDING`, …) and `E_ENTRY_DUPLICATE` / `E_ENTRY_PARAMS` / `E_ENTRY_NONVOID` apply to the module-level function, which is therefore the only place they can be met.

*Compiler's rule (a misplaced annotation is never dropped — row ANNTGT-1).* The table above is the allow-list both parsers judge an annotation against, by name, at a position whose annotations no later phase reads: a `let` / `var` / `const` binding (only `@section` and `@align` stand on a binding, and only on a MODULE-LEVEL `var` / `let`, §3-3.11 / §3-3.12 — plus `@unsafe("reason")` on any binding, OVL-1's acknowledgement of an overlay or of the struct copy its initializer makes, §3-3.17b), an expression statement (only `@unsafe(reason)`), a class or a struct (the annotations whose sole target is a function — `@entry`, `@interruptSafe`, `@panic_handler`, `@total`, … — which neither declaration's checks read), and an interface member (only `@interruptSafe`, and only on a method signature — row ISRIFACE-1; the target is named "an interface method", or "an interface `static let` or `type` member"). Any other annotation there is `E_ANNOTATION_TARGET`, reported at the annotation with one text on both lanes: "E_ANNOTATION_TARGET: `@<name>` does not apply to <the kind> — it applies to <its targets> (<§>)". A user-defined annotation is a decorator (§1-7.6) and applies to a function, a class or a method, so on a binding or a statement it is `E_ANNOTATION_TARGET` too. Module directives (`@mode`, `@compiled`) and the annotations with their own placement rules (`@entry` / `@naked` / `@callconv(naked)` above, `@lockOrder` §3-2.4.13) keep their own diagnostics. (Before, `@section(".x") var ring: …` was accepted and the section silently dropped — the Helios ask that started this rule.)

| Code | Mode | Condition |
|---|---|---|
| `E_ANNOTATION_TARGET` | All | A language-defined annotation written on a declaration kind it does not apply to (e.g. `@polymorphic` on a function, `@entry` / `@naked` / `@callconv(naked)` anywhere but on a module-level function) |

**User-defined annotations.** User-defined annotations follow the decorator protocol (see §1-7.6). User-defined annotations can carry typed parameters — the annotation function's parameter types define the accepted argument types:

```
func cached(ttl: int) {
  return func(target: fn): fn {
    # wrap target with caching logic
  };
}

@cached(ttl=60)
func expensiveComputation(x: int): int { ... }
```

**Unknown annotations.** The compiler SHALL emit a compile-time warning (not error) for unknown annotations, allowing tooling-defined annotations to coexist with language-defined ones.

**Reflection access.** Annotations are accessible via `core.reflect.annotations(target)`, returning a `dict[string, Any]` mapping annotation names to their argument values.

### §1-8.9 Finalization

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

**Deterministic finalization** is provided by the `del` statement (see §1-6.11) and `with`/`Scoped[T]` (see §1-6.6).

**Finalization ordering (normative).** The order in which `finalize()` is called on a set of simultaneously unreachable objects is unspecified. A `finalize()` implementation MUST NOT access any field whose declared type implements `Finalizable` directly — that object may have already been finalized. Access such fields only through `weak` references, checking for `None` before use. The compiler emits the `finalizer-live-access` lint warning when a `finalize()` body accesses a field whose declared type implements `Finalizable` without going through a `weak` reference.

**Panic or exception during ARC `finalize()` (normative, native target).** If `finalize()` throws or panics while the ARC runtime is releasing the last strong reference, the ARC runtime SHALL: (1) catch the exception; (2) complete deallocation of the object's storage; (3) log the caught exception via `debug.log` with severity `Error`. The exception SHALL NOT propagate out of the release operation. It is undefined behavior to retain or access any reference to the partially-finalized object after `finalize()` returns.

**Relationship between cleanup mechanisms:**

- `Closeable` types that also implement `Finalizable` should call `close()` from `finalize()` as a safety net.
- `with`/`Scoped[T]` is preferred for scope-aligned lifetimes.
- `del` is preferred for non-scope-aligned lifetimes.
- GC finalization is the last resort.

### §1-8.10 Generic Classes

```
class Box[T] : Any {
  pub let value: T;
  new(value: T) { this.value = value; }
}

class SortedList[T: Comparable[T]] : Any {
  # T must implement Comparable[T]
}
```

Type parameter constraints use the syntax `T: InterfaceName`.
---

### §1-8.11 `unique class` Declaration

*(This section is normative. Applies to all six modes per §1-2.6; semantics around ARC elision are most consequential in `@mode(host.dual)` and `@mode(host.native)`.)*

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
unique let fh = FileHandle.open("/etc/hosts")   # OK
let fh        = FileHandle.open("/etc/hosts")   # E_UNIQUE_CLASS_ARC_BINDING
arc let fh    = FileHandle.open("/etc/hosts")   # E_UNIQUE_CLASS_ARC_BINDING
```

**Move semantics.** Assigning a `unique class` binding to another binding moves ownership; the source is consumed:

```loup
unique let a = FileHandle.open("/etc/hosts")
unique let b = a    # MOVE: b owns the handle; a consumed
a.close()           # E_USE_AFTER_MOVE
```

*Compiler's rule (a move is a copy into the destination — ruling CLSID-1 Q-I, approved by the maintainer 2026-10-16).* As in Rust, where a move is a memcpy into the new place, moving a `unique` instance out of a NAME — a binding `let c = b`, an assignment `c = b`, a store into a global or a global's field, an argument to a `takes` parameter — puts the instance in the DESTINATION's own storage. On the freestanding lane, where an instance is a value block (§1-8.1.1), the move copies the block's fields there; on the reference-counted lanes it transfers the reference. Either way the moved-from variable's storage backs no live instance afterwards, so re-initialising it (`var b = …; let c = b; b = FileHandle.open(…)`) is legal and `c` and the new `b` are distinct instances; reading `b` before the re-initialisation stays `E_USE_AFTER_MOVE`. A FRESH result (a constructor, a call that builds a new instance) is built in its destination directly, with no extra copy. Nothing may depend on a `unique` instance's ADDRESS staying fixed across a move.

**Borrowing.** Both `reads` (shared immutable borrow) and `edits` (exclusive mutable borrow) are valid on `unique` values. Because single ownership is compiler-proven, exclusivity for `edits` requires no alias check:

```loup
unique let fh = FileHandle.open("/data/log.txt")
inspect(reads: fh)        # shared borrow — fh not consumed
inspect(fh)               # identical — implicit reads
write(edits: fh)          # exclusive borrow — trivially safe, no alias scan
```

*Compiler's rule (no move out of a borrow — row MOVEB-1).* A parameter declared without a verb, `reads`, `edits`, `borrow` or `excl borrow` is a BORROW of the caller's value, and so is the receiver of a method that is not `takes` (§3-2.4.9); only a `takes` parameter or a `takes` method owns what it was given (`requires takes(p)` counts, §3-2.4.10). A value that MOVES — a `unique` value, a move-only struct (§1-10.3.2), or an aggregate holding one — reached through such a borrow (the parameter itself, `self`, or a field or element path from either) may not be moved out of it: returned or thrown, bound by `let` / `var`, assigned to anything, passed to a `takes` parameter or used as the receiver of a `takes` method, stored by a constructor (an auto-generated constructor's arguments are stored in its fields), or placed in a tuple / list / set / dict / enum literal or yielded by an `if` / `match` arm in one of those positions. Each is `E_MOVE_OUT_OF_BORROW` at the moved expression, on every lane and in every mode (Rust's E0507 shape): "cannot move `<path>` out of the borrowed parameter `<p>` — only a `takes` parameter owns its value (§1-8.11); declare it `takes <p>`" (for a receiver: "… out of the borrowed receiver `self` — only a `takes` method owns its receiver (§1-8.11); declare the method `takes func`"). Reading it, calling its `reads` / `edits` methods and passing it on to another borrowing parameter (a reborrow) are not moves, and a copyable value is copied, never moved. Without this rule a borrow could hand out the caller's unique value — `func alias(z: Buf): Buf { return z; }` leaves the caller's `b` and the result aliasing one buffer. A generic body is held to it at each instantiation with a moving type (the §3-3.20 monomorphization re-check).

*Compiler's rule (a move inside a loop — row LOOPMV-1).* A loop body may run more than once, so a value moved in it (a `unique` value, a move-only struct, or an aggregate holding one; §1-10.3.2) and NOT re-initialised on every path back to the loop head is consumed at the top of the next iteration: a second move or a use of it there is `E_USE_AFTER_MOVE` (or `E_USE_AFTER_TAKE` for a `takes` hand-on), reported at that use with "… was moved in a previous iteration of the loop …" (Rust's E0382 shape). The paths back to the head are the body's fall-through end and each `continue`; a `break`, `return` or `throw` leaves the loop instead, so a move followed by one of them is not a second-iteration move (a move before `break` still counts after the loop). A binding introduced in the body — `let` / `var`, a `for`-in variable, a `match` / `if let` pattern binding, a `catch` variable — holds a fresh value on every iteration, so a token created and consumed in each iteration is not one. Both checkers decide this the same way: the branch that leaves the block (`break` / `continue` / `return` / `throw`) carries its moves to the loop exit or the next iteration, never to the statements after the branch.

**`consume` is prohibited.** `consume` downgrades a `unique` value to ARC. For `unique class` types this downgrade is structurally forbidden — the type can never enter ARC:

```loup
unique let fh = FileHandle.open("/data/log.txt")
let shared = consume fh   # E_UNIQUE_CLASS_CONSUME
```

**Subclassing.** A subclass of a `unique class` MUST also be `unique class`. A non-`unique` subclass could escape the constraint via the base type:

```loup
unique class Handle : Any { ... }

unique class FileHandle : Handle { ... }   # OK
class FileHandle : Handle { ... }
# E_UNIQUE_CLASS_SUBCLASS: Handle is a unique class;
# all subclasses must also be declared unique class
```

**No erasure into `Any`.** A value that holds a `unique` — a `unique class` instance, a `unique T` reference, or a collection, `Option`, tuple or generic instantiation of one — is NOT implicitly widened to `Any` (§1-4.3), in any position: a binding, an argument, a `return`, an assignment, a collection-literal element. A handle typed `Any` is freely copyable and carries no ownership, so the widening would let the single owner be aliased. This includes an `Any` PARAMETER — the callee may store, copy or return it — so `print(fh)` is rejected like `let a: Any = fh`; render the fields instead. The same holds for an interface type and for a non-`unique` base class.

```loup
unique let fh = FileHandle.open("/data/log.txt")
let a: Any = fh          # error: cannot assign 'FileHandle' to binding 'a' of type 'Any'
log(fh)                  # error: argument 1 of 'log': expected 'Any', found 'FileHandle'
```

**Collections (row UNIQCOLL-1).** A collection — a `list`, a `set`, a `dict` (its values, and its keys), an `array`, any built-in collection — may hold `unique class` instances, move-only structs (§1-10.3.2) and aggregates holding one. Ownership follows the element, under five rules:

1. **Insertion consumes.** `push` / `append`, `set(i, v)`, a set's `add`, a dict's `set(k, v)`, an element or key store (`c[i] = v`, `d[k] = v`) and a collection-literal element each take the inserted value as a `takes` parameter does: a later use of its source is `E_USE_AFTER_TAKE` (a method's argument) or `E_USE_AFTER_MOVE` (a store, a literal element). Every other argument of a collection method — `contains(x)`, `indexOf(x)`, the key of `remove(k)` — is a borrow.
2. **Extraction moves.** `pop()`, `remove(i)`, a dict's `remove(k)` (its `Option`) and destructuring the collection (`let [a, b] = c`, which moves `c`) hand the element to the caller, who owns it.
3. **In-place access borrows.** `c[i]`, `d[k]`, `get`, `first()` / `last()` and a `for`-in variable borrow the element where it lies — `reads` by default, `edits` through an `edits` path — under §3-2.4.9's borrow rules (two `reads` borrows of one element are fine). Binding it, assigning it, returning or throwing it, storing it, or handing it to a `takes` parameter or a `takes` method moves it out of the borrow: `E_MOVE_OUT_OF_BORROW` (row MOVEB-1), "cannot move `c[…]` out of the collection `c` — an element accessed in place is a borrow (§1-8.11); move it out with `remove` or `pop`". An operation that would COPY the elements out — `clone()`, `slice` and `c[a:b]`, `filter`, `+`, a set's `union` / `intersection` / `difference`, a dict's `entries()` (and `keys()` / `values()` over keys / values that move), an explicit `iter()` — is `E_MOVE_OUT_OF_BORROW` too ("cannot move the elements of `c` out through `clone()` — …"); iterate with `for (x in c)`, which borrows each element.
4. **A store releases the old element.** An element store, `set(i, v)` and a dict store over an existing key drop the element they replace; an assignment to a variable or field that holds such a collection drops the collection it replaces.
5. **The collection is move-only.** A collection whose element type holds a `unique` value is itself move-only (§1-10.3.2): `let c2 = c` moves it (a later use of `c` is `E_USE_AFTER_MOVE`), COLL-2's copy-on-build does not apply (stored into another collection, a field or a payload, it is moved, not copied), moving it moves every element, and a move of it inside a loop is LOOPMV-1's. A struct holds one in a `unique var` field (and is then move-only, so a `with`-copy of it is `E_WITH_COPY_MOVE_ONLY`); a class that is not a `unique class` may not hold one in a field (`E_UNIQUE_FIELD_IN_COPYABLE`, below).

Dropping a collection — its owner leaving scope, the `unique class` instance that holds it being finalized, a store replacing it — releases each element exactly once; a collection moved away is not released where it was.

```loup
unique var handles: list[FileHandle] = []
unique let fh = FileHandle.open("/a")
handles.append(fh)                        # MOVE into list; `fh` is consumed
unique let h2 = handles.remove(0)         # MOVE out of list
handles.append(FileHandle.open("/b"))
inspect(handles[0])                       # implicit reads borrow in place
for (h in handles) { inspect(h); }        # each element borrowed in turn
let h3 = handles[0]                       # E_MOVE_OUT_OF_BORROW
let all = handles                         # MOVE: `handles` is consumed
```

**Struct fields.** A struct may hold a `unique class` field with `unique var`:

```loup
struct Connection {
    var host:   string;
    unique var sock: Socket;
}
```

A struct with a `unique class` field is move-only (§1-10.3.2).

**Thread transfer.** A `unique class` value may be moved into a `Thread.spawn` closure; the caller loses access at the move point:

```loup
unique let fh = FileHandle.open("/data/log.txt")
let t = Thread.spawn(func() { process(fh) })
fh.close()   # E_USE_AFTER_MOVE
```

Every closure takes a captured `unique` value this way, not only a `Thread.spawn` closure (§1-7.3, row CAPMV-1); inside the closure the value is borrowed, so `process` here takes it as a borrowing parameter.

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

Type parameter constraints apply normally: `unique class SortedPool[T: Comparable[T]]` is valid. The grammar production `class_decl ::= 'unique'? 'class' IDENT type_params? ...` covers both forms. A `unique class` type argument in a generic position, such as `list[FileHandle]`, is valid — the list holds the uniquely-owned values by move (extraction moves an element out; in-place access returns a `borrow`; the Collections rules above).

**`unique class` and `Sendable`.** `unique class` instances are not `Sendable` under the standard rule — they cannot be shared across threads since `Sendable` implies safe concurrent aliasing and `unique` prohibits aliasing entirely. A `unique class` value may be **moved** into a `Thread.spawn` closure, transferring ownership to the spawned thread with no concurrent access. Attempting to capture a `unique class` value by reference (without moving) in a `Thread.spawn` closure is a compile-time error. `unique class` types may not declare `implements Sendable` — doing so is `E_UNIQUE_CLASS_SENDABLE`.

**Freestanding mode.** In `@mode(freestanding)`, all classes with an `@allocator` effectively behave as `unique class` — ARC is unavailable. Declaring `unique class` in freestanding is valid and documents the intent. For multi-core freestanding code, inter-CPU data sharing uses `native.atomic` primitives directly — `Mutex[T]` and `RwLock[T]` are not available in freestanding mode.

**Error codes.**

| Code | Condition |
|---|---|
| `E_UNIQUE_CLASS_ARC_BINDING` | `unique class` type constructed into a non-`unique` binding |
| `E_UNIQUE_CLASS_CONSUME` | `consume` applied to a `unique class` value |
| `E_UNIQUE_CLASS_SUBCLASS` | Non-`unique` subclass declared for a `unique class` parent |
| `E_UNIQUE_CLASS_SENDABLE` | `unique class` type declares `implements Sendable` — prohibited |
| `E_UNIQUE_FIELD_IN_COPYABLE` | A field of a class that is not a `unique class` holds a `unique` value — a `unique class` instance, a move-only struct, or a collection, `Option`, tuple or generic instantiation of one: a copy of the class would alias it (declare the class `unique class`). Also a generic with no body to re-check instantiated with such a type (row UNIQCOLL-1) |

---

### §1-8.12 Safety Annotations

*(This section is normative. Applies to all six modes per §1-2.6.)*

Four language-defined annotations state a **safety or ownership guarantee** at a declaration site: `@total` (§1-8.12.1) on a function, `@complete(T)` (§1-8.12.2) on an enum, `@must_resolve` (§1-8.12.3) on a class, and `@noderef` (§1-8.12.4) on a class or struct. Each is enforced by the typechecker: a declaration that cannot uphold the guarantee is a compile-time error. They are grouped here because they share a shape — a *declaration-site contract* whose obligations are discharged structurally, by inspecting the annotated declaration and (for `@must_resolve`) the bindings of its type.

These annotations add no runtime representation, no runtime cost, and no codegen effect; they constrain what a program is permitted to say. They are available in every execution mode. They are most consequential in code that must not fault — a bare-metal program, a freestanding kernel, or any routine handling untrusted input — but nothing about them is mode-specific.

#### §1-8.12.1 `@total` — Fault-Free Over Untrusted Input

```
func_annotation ::= ... | '@total'
```

`@total` on a function declaration asserts that the function is **total over untrusted input**: for every input, the function terminates in a defined state or rejects. Concretely, a `@total` function MAY:

- **reject** — return an error value (`Result`, `Option`, a failure enum) or throw (§1-18);
- **loop** — `@total` is not a termination assertion;
- **index, slice, and do arithmetic** — every such operation in the memory-safe subset is bounds- and overflow-checked, so it can at worst reject, never fault.

A `@total` function MUST NOT **fault** — that is, it must not perform an operation whose failure is undefined rather than surfaced.

**What the compiler enforces (normative).** The compiler discharges the checkable half of the contract: the body of a `@total` function MUST NOT contain an **unchecked operation**. There are exactly two unchecked-operation surfaces in the language, and both are prohibited:

- an `unsafe("reason") { }` statement region (§3-2.4.6), and
- an inline `asm` block (§3-3.7).

The check descends recursively through control flow — the bodies of `if` / `else if` / `else`, `while`, `for`, `for await`, `for concurrent`, `safe`, `atomic`, `await` groups, `portal`, `try` / `catch` / `finally`, `defer` blocks, and `with` bodies are all searched. The check does NOT descend into a nested function or lambda declaration: a nested callable is its own declaration and is discharged by its own `@total`, if it carries one.

An `unsafe("reason") { }` region or inline `asm` reachable in the body of a `@total` function is `E_TOTALITY`, reported at the offending operation.

```loup
@total
pub func parseHeader(bytes: buffer[uint8, 64], len: int): Result[Header, ParseError] {
    if len < 4 {
        return Result.Err(ParseError.Truncated);   # rejecting is total
    }
    var i = 0;
    while i < len {                                 # looping is total
        if bytes[i] == 0 { break; }                 # bounds-checked indexing is total
        i = i + 1;
    }
    return Result.Ok(Header.new(bytes[0], bytes[1]));
}

@total
func bad(p: int): int {
    unsafe("load: raw pointer") { return load(p); }   # E_TOTALITY: unchecked operation in a `@total` function
}
```

**Conservative approximation (normative).** `@total` is a **sound but conservative** approximation, and the specification is explicit about what it does and does not prove:

- It **is** a proof that the function body stays inside the memory-safe subset — no unchecked-operation surface is reachable from it.
- It is **not** a termination proof. A `@total` function may loop forever.
- It is **not** a proof of deeper totality properties — it does not reason about resource exhaustion, unbounded recursion, or the behavior of functions the body calls. It bans the two unchecked surfaces syntactically; it does not perform an interprocedural analysis.

A function that satisfies `@total` therefore cannot fault *in its own body*. Callers of a `@total` function should read the annotation as "this code will refuse bad input rather than corrupt state on it", not as "this code always returns".

#### §1-8.12.2 `@complete(T)` — Every Variant Carries the Completion Value

```
enum_annotation ::= ... | '@complete' '(' ( IDENT | string_lit ) ')'
```

`@complete(T)` on an **enum declaration** requires that **every variant of the enum carries a field of the completion type `T`**. It is the enum-level guarantee that a moved-in value cannot be silently dropped by choosing the "wrong" variant.

The motivating shape is an outcome enum that consumes an owned request, token, or resource. Without `@complete`, a variant that simply omits the payload compiles cleanly, and the moved value is forgotten:

```loup
@complete(Request)
enum Outcome {
    Completed(req: Request, bytes: int),
    Rejected(req: Request, reason: string),
    Cancelled(req: Request),
}
```

Every variant above carries a `Request`, so whatever path the code takes, the moved-in `Request` is still reachable from the result and can be returned, released, or re-queued by the caller. A variant that lacks it is a leak the type system can see:

```loup
@complete(Request)
enum Outcome {
    Completed(req: Request, bytes: int),
    Dropped(reason: string),   # E_INCOMPLETE_VARIANT — no `Request` field
}
```

**Rule (normative).** For each variant of a `@complete(T)`-annotated enum, at least one field's declared type MUST be the named type `T`. The match is by type name. A variant with no such field is `E_INCOMPLETE_VARIANT`, reported at the variant. A variant may carry additional fields of any type, and may carry more than one `T`.

**Argument.** The argument is a type name, written as an identifier (`@complete(Request)`) or as a string literal (`@complete("Request")`). `@complete` with no argument is a compile-time error: *"@complete requires a completion type argument: @complete(TypeName)"*.

**Target.** `@complete` is enum-only. Applying it to a function, class, struct, or interface declaration is a compile-time error: *"'@complete' can only be applied to enum declarations"*.

**Relationship to `takes` (§1-7.2) and `@must_resolve` (§1-8.12.3).** `@complete(T)` and `@must_resolve` are complementary halves of the same discipline. `@must_resolve` guarantees the *caller* cannot let an owned value evaporate at scope exit; `@complete(T)` guarantees the *callee's result type* cannot evaporate it on any branch. A function that takes ownership of a `@must_resolve` value and returns a `@complete(T)` enum over it has both ends of the transfer closed by the compiler.

#### §1-8.12.3 `@must_resolve` — Consumption Required Before Scope Exit

```
class_annotation ::= ... | '@must_resolve'
```

`@must_resolve` on a class declaration makes every binding of that class type **move-required, not merely move-only**. An ordinary owned value may be moved; a `@must_resolve` value MUST be moved. Letting it simply fall out of scope, unused, is an error.

This is the guarantee wanted for a type that represents an obligation rather than a mere resource — an in-flight transfer that must be completed or aborted, an acquired permit that must be handed back, a promise that must be settled. `@must_resolve` is typically applied to a `unique class` (§1-8.11), since the two disciplines compose: `unique class` forbids aliasing the obligation, `@must_resolve` forbids abandoning it.

```loup
@must_resolve
unique class Transfer : Any {
    pub var id: int;
}

func commit(t: takes Transfer): void { ... }

func good(): void {
    unique let t = Transfer.new(1);
    commit(t);              # consumed — the obligation is discharged
}

func bad(): void {
    unique let t = Transfer.new(2);
    # E_UNRESOLVED: 't' is a `@must_resolve` value and must be consumed
    # (moved to a `takes` parameter or `consume`d) before it goes out of scope
}
```

**Rule (normative).**

1. A `let` or `var` binding whose type is a `@must_resolve` class is a **resolution obligation**, recorded at the binding site.
2. An obligation is **discharged** by consuming the binding — moving it into a `takes` parameter (§1-7.2), or applying `consume` to it. (Consumption is the same move-tracking used by `E_USE_AFTER_TAKE`; a consumed binding may not be used again.)
3. The obligation is checked at **block exit**, block-locally. At the end of each block, every obligation *introduced inside that block* that was not discharged is `E_UNRESOLVED`, reported at the binding's declaration site. Bindings introduced in an enclosing block are not reported by an inner block — they are checked when their own block exits.

**Target.** `@must_resolve` is class-only. Applying it to a function, struct, enum, or interface declaration is a compile-time error: *"'@must_resolve' can only be applied to class declarations"*.

Note that when the annotated class is also a `unique class`, `consume` is unavailable on it (`E_UNIQUE_CLASS_CONSUME`, §1-8.11) and the obligation is discharged by a `takes` move alone.

**Scope of the check.** The obligation is tracked on **local bindings**. A `@must_resolve` value stored into a field or a collection is not tracked as a scope-local obligation; ownership discipline for such a value is the containing type's responsibility.

#### §1-8.12.4 `@noderef` — Sealed Handle, No Read-Through

```
class_annotation  ::= ... | '@noderef'
struct_annotation ::= ... | '@noderef'
```

`@noderef` on a class or struct declaration seals a **pointer or handle type against read-through of its pointee**. Holders of a `@noderef` handle may store it, pass it, compare it, and hand it back — but the type itself may not offer any member that hands out the pointed-to value. The handle is a *name for* a location, never a *window onto* it.

The motivating shape is a handle to memory the current context does not trust or does not own: an address supplied by untrusted code, a pointer into another address space, a token that only a privileged routine may dereference. Sealing the type means that no amount of ordinary, safe code holding the handle can turn it into a value — the read must go through an audited boundary that copies in or out.

```loup
@repr(transparent)
@noderef
struct UserPtr[T] {
    let addr: uint64;
}
```

**Rule (normative).** For a `@noderef` class or struct, **no member method may declare a return type that is one of the type's own type parameters**. The type parameter is the sealed pointee; a method returning it is a read-through, regardless of what the method is called. This uniformly rejects `func deref(): T`, `func read(): T`, `func get(): T`, and the index operator `func op_index(i: int): T` — all of them return `T`. Such a method is `E_NODEREF`, reported at the method.

Members that do NOT return the sealed pointee are unaffected: a method returning `uint64`, `bool`, `string`, `Option[uint64]`, the handle type itself, or nothing at all is legal. `@noderef` constrains the *type's own surface*; it places no restriction on passing the handle around, storing it in a field, or including it in a collection.

**Audited boundary.** A single copy-in/copy-out boundary may be exempted from the seal. On a `@noderef` **class**, a method annotated `@unsafeMemory` is exempt — it is the declared, audited boundary at which a checked copy crosses the trust line, and it is expected to validate the address before touching it. A `@noderef` **struct** has no member-level exemption (struct methods carry no annotations); the audited boundary for a value-type handle is a free function, which lives outside the member seal by construction.

```loup
@noderef
class UserSlice[T] : Any {
    pub var addr: uint64;
    pub var count: int;

    pub func length(): int { return count; }              # OK — not the pointee
    pub func read(i: int): T { ... }                      # E_NODEREF — read-through of the seal

    @unsafeMemory
    pub func copyOut(dst: buffer[T, 64], n: int): int { ... }   # OK — the audited boundary
}
```

**Target.** `@noderef` is valid on class and struct declarations only. Applying it to a function, enum, or interface declaration is a compile-time error: *"'@noderef' can only be applied to struct or class declarations"*.

#### §1-8.12.5 Error Codes

| Code | Condition |
|---|---|
| `E_TOTALITY` | A `@total` function's body contains an unchecked operation — an `unsafe("reason") { }` region or inline `asm` (§1-8.12.1) |
| `E_INCOMPLETE_VARIANT` | A variant of a `@complete(T)` enum does not carry a field of the completion type `T` (§1-8.12.2) |
| `E_UNRESOLVED` | A binding of a `@must_resolve` class type reaches block exit without being consumed (§1-8.12.3) |
| `E_NODEREF` | A member method of a `@noderef` type returns the sealed pointee (§1-8.12.4) |


## §1-9 Enums and Pattern Matching

*(This section is normative.)*

### §1-9.1 Enum Declarations

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
- **Rendering.** Every enum value has the intrinsic `to_string()`; it is the §1-16.4 rendering sink, so `e.to_string()`, `str(e)`, `println(e)` and `{$ e $}` produce the same text (`Circle(2.0)`, `Point`). A user-declared `to_string()` method on the enum takes precedence (ruling SQ-10).
- Enum declarations are block-level declarations (no trailing `;`).
- **At least one variant.** An enum declares one or more variants; `enum Empty {}` is a compile-time error, `E_ENUM_NO_VARIANTS` (the §1-19 `VariantList` has no empty alternative). The uninhabited type is spelled `impossible`, never an empty enum (ruled 2026-09-04, loup#291 / BV-5).
- **Variant separator.** Two styles are both normative:
  - **Comma style** (canonical for variants with payloads): variants are separated by `,` with an optional trailing comma.
  - **Semicolon style** (idiomatic for unit-only enums): each unit variant is terminated with `;` like a field or statement.
  The formatter accepts both and normalises to comma style for payload enums and semicolon style for unit-only enums. Mixing both separators in a single enum body is a compile-time error (`E_ENUM_MIXED_SEP`).


| Code | Mode | Condition |
|---|---|---|
| `E_ENUM_MIXED_SEP` | All | Enum body uses both `,` and `;` as variant separators |
| `E_ENUM_NO_VARIANTS` | All | Enum body declares no variants (`enum Empty {}`); an enum must declare at least one variant — spell an uninhabited type `impossible` |
| `E_NAMED_FIELD_MIXED_SEP` | All | Named-payload variant body (e.g. `Variant { tag: string; fields: Value }`) uses both `,` and `;` as field separators within a single body |
| `E_ENUM_PAYLOAD_UNNARROWED` | All | A payload access `x.N` / `x.f` on an enum value that is not narrowed, at that point, to one variant or to variants that agree at the position (by `is`, a diverging guard, `match`, or a variant construction — the payload-access rule below) |

*Compiler's rule (payload access needs narrowing).* A payload access on an enum value — `x.N` for a positional payload, `x.f` for a named one — reads the payload of the variant `x` holds, so `x` SHALL be NARROWED at that point: to one variant, or to a set of variants that all declare that position (or that field) with the same type. Anything else is a compile-time error, `E_ENUM_PAYLOAD_UNNARROWED`, naming `x` and the variants it may hold. A value nothing is known about may hold every variant of its enum, so an access on which every variant agrees needs no test; an access no variant can reach (the tests before it exclude every one) never runs and is not judged. Narrowing is flow-sensitive; these shapes narrow:

- the then-branch of `x is E.V`, through `and` chains (and in the right operand of `and`);
- `x is E.A or x is E.B` — the set {A, B};
- a DIVERGING guard (§1-4.7): after `if (not (x is E.V)) { return; }` with no `else`, `x` holds `V`, and an `or` of negated tests narrows each subject (`if (not (a is E.V) or not (b is F.W)) { return; }`);
- the `else` of `if (x is E.V)`, and each `else if` — the variants that remain;
- a `match` arm whose pattern is a variant — the scrutinee holds it inside the arm;
- a binding initialized by a variant construction (`let c = E.V(…)`) and an assignment `x = E.V(…)` — `x` holds `V`.

Where control flow merges, a subject keeps only what every branch that falls through says.

*Compiler's rule (stable subjects).* Narrowing applies to a STABLE subject: a `let`, a parameter or a `var`, or a member or index chain from one (`p.kind`, `xs[0]`, `xs[i]`). Any assignment to the subject or to a prefix of it ends its narrowing (an assignment of a variant construction starts a new fact, as above); a loop forgets, from its first iteration on, what its body, condition and step assign; a binding a closure assigns is never narrowed, and a closure body sees only the facts about bindings its function never assigns. A CALL between the test and the use ends a member-path fact when it may write a field on the path, and the compiler decides that from a whole-program fixed point: the (class, field) pairs each function may assign, directly or through the calls it makes (an element write of a list-typed field counts as a write of the field, and a field of a sub- or superclass of the path's class counts), plus the module globals it may assign. A call that takes the subject's root or a prefix of it by `edits` or `takes` ends the fact too; a path rooted at a module global ends at any call that may write that global; an index path `a[i]` ends at an assignment to `a`, to `i` or to `a[…]` and at any call that may write `a`. A fact about a plain local or parameter outlives every other call (a callee cannot assign its caller's binding unless it is handed it by `edits` or `takes`), except for a binding a closure assigns. A `.unwrap()` or any other call is not a path segment: bind its result first (`let k = o.unwrap().kind; if (k is E.V) { … k.0 … }`).

Both checkers compute this narrowing and mark each accepted access with the variants it may hold; every lane reads the payload from that mark, by the narrowed variants' layout. (Ruling ENUMNARROW-1, task v21.p8.229, 2026-10-16: before it neither checker judged payload access, and Stage0's native lowering re-derived narrowing for some shapes only, so `if (… or not (x is E.V)) { return; }` followed by `x.0` read another variant's word on the native lanes. Rejected: narrowing in the lowerings only, which leaves an unnarrowed read a silent garbage read, and a native-build refusal, which comes late and makes the lanes disagree.)

**Enum lifetime parameters.** An enum may declare lifetime parameters to allow `borrow[~name]` variant payloads. The syntax follows the same `[lifetime ~name]` convention used for structs (§1-10.11) and interfaces (§1-11.4):

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

A lifetime-parameterized enum is implicitly non-`Sendable` (§2-1.8.1). Lifetime parameters on enums are valid in all six modes.

### §1-9.2 Enum/`Any` Boundary

When an enum value is stored in an `Any`-typed position, the runtime wraps it in a heap-allocated box preserving the enum's full type identity (declared type name, type parameters, and active variant):

- **Boxing:** Assigning an enum value to an `Any`-typed variable boxes it automatically. The resulting `Any` carries the enum's full type.
- **Unboxing:** Extracting an enum from `Any` requires `match` or `as`/`as?` cast operators (§1-4.3). There is no implicit unboxing coercion.
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

### §1-9.3 Built-in Enums

`Option[T]` and `Result[T,E]` are built-in enums available without import:

```
enum Option[T] { Some(T), None }
enum Result[T, E] { Ok(T), Err(E) }
```

See §1-5.6 for optionality sugar and §1-5.7 for `?` propagation.

**Representation of an uninhabited variant (normative).** When a variant's payload type is uninhabited, that variant cannot exist at run time, and the enum's representation SHALL collapse to the representation of its remaining inhabited variants. `Result[T, impossible]` therefore has **exactly the representation of `T`**: no discriminant, no `Err` payload slot, no padding for one. `Option[impossible]` is likewise the representation of `None` alone.

This is stated normatively rather than left to the optimiser. A discriminant that can hold only one value is a state a structural-coverage analysis would otherwise have to account for and justify, and "the optimiser usually removes it" is not something a certification argument can rest on. Making it a rule also makes it testable.

The collapse is a representation rule, not a typing rule: `Result[T, impossible]` and `T` remain distinct types, and a value of one is not assignable to the other. Only the memory layout coincides.

> **Not a new coupling.** Representation already depends on payload inhabitation and shape elsewhere — `Option[T]` selects between a niche encoding and a boxed one from the payload's properties — so this rule follows an existing pattern rather than introducing a dependency. Nor does it disturb `@interchange`: that surface admits only fixed-width integers and `decimal(p, s)`, never a `Result`, so no declared wire layout can observe the collapse.

### §1-9.4 `match` Expression

`match` is an expression that branches on patterns:

```
let area: float = match shape {
  Circle(r)    => 3.14159 * r * r,
  Rect(w, h)   => w * h,
  Point        => 0.0,
};
```

**Rules:**

- `match` is an expression; all arms must have a compatible result type. An arm whose type is `noreturn` (§1-4.4a) is **excluded from the common-type computation**: the result type is taken over the arms that can yield, so `_ => unreachable` or `_ => halt("bad tag")` beside `int` arms leaves the `match` an `int`. If every arm is `noreturn`, so is the `match`.
- The compiler enforces exhaustiveness: every variant must be covered, or a wildcard `_` arm must be present (`E_MATCH_NONEXHAUSTIVE`).
- **Compiler's rule (loup#699, MATCH-2).** Arms are tried in source order and an arm is selected only when its WHOLE pattern matches — a pattern nested in a variant payload (`Ok(None)`, `Some(1)`, `Some(int(n))`) is tested, not only the outer variant. When an arm's nested pattern or its guard fails, matching continues with the next arm that can accept the value; the value is never read through a pattern that did not match.
- **Uninhabited-payload carve-out (normative).** A variant whose payload type is uninhabited (§1-4.4b) cannot exist, so its arm MAY be omitted and exhaustiveness still holds. `match` on a `Result[T, impossible]` needs only the `Ok` arm; no `E_MATCH_NONEXHAUSTIVE`.

  ```loup
  # Exhaustive: `Err` cannot occur, so it need not be written.
  let ast = match parseTrusted(text) {
      Ok(a) => a
  };
  ```

  The carve-out is **narrow by construction**: it applies only where the payload type is uninhabited, which — since a zero-variant `enum` is illegal (§1-9.1) — means only where `impossible` appears in one of the positions §1-4.4b admits. The same `match` on `Result[T, ParseError]` with the `Err` arm omitted is still `E_MATCH_NONEXHAUSTIVE`. An exhaustiveness rule with an exception is exactly the kind of change that can silently disable the rule, so a conformance test for this carve-out SHALL include that negative half.

  Writing the dead arm anyway is **permitted and draws no diagnostic** (ruled: DV-13). `Err(e) => …` on a `Result[T, impossible]` is harmless — the code is unreachable and the compiler knows it — and an advisory on correct code teaches suppression habits rather than anything about the program. The silence here is a decision, not an oversight.
- Patterns may be: variant names (with positional or named bindings), wildcards (`_`), guards (`Some(x) if (x > 0)`), and nested patterns (`Ok(Some(x))`).
- **Variant-name resolution in patterns.** A variant name in a `match` pattern resolves against the **scrutinee's enum type**: the bare form (`Ok(v)`, `Idle`) is valid for any enum without qualification — including enums whose constructors require qualification in expression position (`Result.Ok(v)`). The qualified form (`TcpState.Closed`) is equally valid and must name the scrutinee's enum. Bare and qualified arms may be mixed in one `match`. The rule holds for a user enum that declares variants named `None` or `Some` (`enum Flow { None, Row, Column }`): `None =>` and `Flow.None =>` over a `Flow` both test `Flow`'s own `None`, and only a match on an `Option[T]` tests `Option`'s representation. *Compiler's rule (F5, 2026-11-04):* lowering decides that a `match` reads an `Option` from the scrutinee's TYPE — a qualified arm's enum, else the checker's type of the scrutinee — never from the variant names alone (up to 1.29.0 the native lanes inverted `Flow.None => …, _ => …`, and a bare `None` arm took `Option`'s tag on every lane).
- Each `match` arm has exactly **one pattern**. Or-patterns (multiple patterns per arm separated by `|`) are not supported; use separate arms or a guard expression to match multiple cases.
- Patterns are matched top-to-bottom; the first matching arm executes.
- Bindings introduced in a pattern arm are scoped to that arm's expression only.
- **A pattern binding has the type of what it binds.** A name bound in a payload position has that position's declared type with the scrutinee's type arguments substituted — `e` in `Err(e)` over a `Result[int, UiError]`, in `Some(e)` over an `Option[UiError]` and in `Just(e)` over a user `Maybe[UiError]` is a `UiError`, at any depth (`Some(Err(e))`, `Ok(Some(e))`) — and a catch-all binding (`other => …`) has the scrutinee's type. Every operation on the binding behaves as on any other value of that type: `==` / `!=` on an enum is its structural equality (§1-5.1), a `uint64` prints, compares, divides and shifts unsigned, and methods, fields and renders dispatch on the type. *Compiler's rule (FNF2, v21.p10.13, 2026-11-05):* the native lowerings type such a binding from the checker's type of it — the declared payload type, instantiated — and a catch-all binding from the scrutinee's enum; up to 1.29.x the native lanes left a binding of a type-parameter position untyped, so `Err(e) => e == UiError.Budget(Pool.Signals)` compared the payload's words and was `false`, and `Ok(u)` of a `Result[uint64, E]` printed `-1`.
- *Compiler's rule (block arms).* An arm whose body is a BLOCK yields the value of the block's final statement when that statement is an expression statement — exactly as an `if` branch block does (§1-6.3, BV-4) — and `void` otherwise (an empty block, or one ending in a binding, a loop or a statement-form `if`). The block arm's type takes part in the common-type computation like an expression arm's; a block ending in `return`, `throw`, `break` or `continue`, or in a `noreturn` expression, is excluded from it. A `match` used as a statement discards the value, and its block arms run for their effect. So `let x = match v { 1 => { let t = 4; t + 1 } _ => { 6 } };` binds an `int`. (loup#620; row MATCH-1 in `specs/x-update-v1_20-to-v1_21/design.md`, approved by the maintainer.)
- *Compiler's rule (qualified variant paths).* The qualifier of a variant pattern may be a braced-namespace PATH before the enum — `u.R.A(v)`, `a.b.E.X` — exactly as an expression names the same variant (`u.R.A(3)`, §1-13.0). The path resolves as the expression form resolves it: its first segment in module scope (a pattern names a type, and a type path resolves there, as in `x is S.Circle`), each further segment as a member of the namespace before it (`` member `Q` not found in namespace `u` ``), and the enum it ends at must declare the variant (`` variant `Z` not found in enum `R` ``); a path that runs through a non-namespace (`` `R` is not a namespace ``) or ends at a non-enum (`` `u.K` is not an enum ``) is an error. The arm then matches exactly as `R.A(v)` does — a namespace's types keep their bare names below the checker (row NS-2). (loup#624; row NS-3.)
- *Compiler's rule (the qualifier names the scrutinee's enum).* Every qualifier is resolved — a single segment (`R.A`) in module scope like a dotted path's head, so a qualifier naming nothing is an undefined identifier — and the type it names (through an import alias to the aliased enum; `Option` / `Result` are the built-in enums) must be the scrutinee's enum: the same declaration, or `Option` for an `Option[T]` scrutinee. Anything else — another enum (`Q.A` against an `R`), a class, `Result.Ok` against an `Option` — is `E_MATCH_WRONG_ENUM`; it matched the scrutinee's variant of the same TAG before. A nested qualified pattern is judged against its payload's type (`W.P(Q.A)` on a `W.P(R)` payload). The rule does not apply when the scrutinee's type is not a known enum (`Any`, a type variable) — the variant is then looked up by the qualifier — nor to a `match` the compiler synthesizes from an operator (`?`, `?.`, `??`, `attempt`), whose own arms may name `Result` for an `Option` operand. (loup#684; row NS-4.) The variant must also be one of the named enum's variants — `R.Zz` is `variant 'Zz' not found in enum 'R'` whatever the scrutinee (b36f-capwc2: a single-segment qualifier's variant was never looked up, so `R.Zz` matched nothing and `R.Q` matched another enum's `Q` tag).
- `match` is a block statement (no trailing `;` on the construct itself).

- **A variant pattern requires an enum.** Since a variant name resolves against
  the scrutinee's enum type, a `match` whose scrutinee is a type with no
  variants — `int`, `string`, `bool`, a `list`, a `dict`, a tuple — cannot use
  one (`E_MATCH_NOT_ENUM`). `Option[T]` counts as an enum for this rule:
  `Some`/`None` are its variants. Literal, binding and wildcard arms are
  unaffected; they match any scrutinee and say nothing about its type.

| Code | Mode | Condition |
|---|---|---|
| `E_MATCH_NONEXHAUSTIVE` | All | `match` over a statically-typed enum or union has no wildcard `_` arm and does not cover all variants/types. **Exception:** an arm for a variant whose payload type is uninhabited (§1-4.4b) may be omitted — such a variant cannot exist |
| `E_MATCH_NOT_ENUM` | All | a `match` arm uses a variant pattern but the scrutinee's type has no variants |
| `E_MATCH_WRONG_ENUM` | All | a qualified variant pattern's qualifier does not name the scrutinee's enum (loup#684), or an `is` test's variant target does not name its operand's enum (§1-4.7) |

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

### §1-9.5 Union Type Matching

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
    # value is narrowed to string in this branch
    print(value.toUpperCase());
  } else {
    # value is narrowed to int in this branch
    print(value + 1);
  }
}
```

After an `is` check, the compiler narrows the type in the corresponding branch. In the `else` branch, the compiler narrows to the remaining types in the union.

---

## §1-10 Structs

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
  a: int = 255;   # default value
}
```

### §1-10.1 Auto-Generated Constructors

The compiler auto-generates a constructor from the struct's fields. All fields become named parameters in declaration order, with default values where specified:

```
let p = Point(x=1.0, y=2.0);
let c = Color(r=255, g=0, b=0);          # a defaults to 255
let c2 = Color(r=0, g=0, b=0, a=128);   # explicit alpha
```

### §1-10.1.1 Default Initialization of Uninitialized Struct Locals

*(This section is normative. Applies to `@mode(host.native)` and `@mode(freestanding)`.)*

A `var` local of struct type declared with no initializer and no subsequent field writes — `var x: T;` where `T` is a struct — is **default-initialized**: each field receives its declared default value (§1-10.1), or, for a field without a declared default, the field type's zero value (`0`, `0.0`, `false`, the empty string/bytes, `None` for `Option[U]`, and recursively the default-initialized form for nested struct/array fields). This is distinct from the constructor path (§1-10.1): no constructor is invoked and no named arguments are supplied; the storage is materialized directly with the per-field defaults.

*Compiler's rule (nested struct fields, batch 32).* "Recursively the default-initialized form" means a struct-typed field without a declared default holds its OWN default-initialized value, owned by the outer value, on every lane (both interpreters, the Wasm hosts and the native backends alike), and so does a module-level `var g: T;`: after `var h: Holder; h.id.raw = 7`, `h.id` is `h`'s own `PlainId` with `raw = 7` and its other fields at their declared defaults. (Before batch 32 every lane left such a field `None`: the interpreters raised on `h.id.raw = 7`, host.native faulted, and the freestanding lane wrote address 0.)

```loup
@mode(freestanding)

struct Color { r: int; g: int; b: int; a: int = 255; }

func black(): Color {
  var c: Color;     # default-initialized: r=0, g=0, b=0, a=255
  return c;         # observes the declared defaults, not indeterminate storage
}
```

Default initialization is guaranteed on **every control-flow path** reaching a read of the local, including early returns — `return x` always observes the declared defaults. Because such a local is fully initialized at declaration, it is **not** subject to the definite-assignment `E_USE_BEFORE_ASSIGN` rule (§1-6.2); that rule applies to scalar and non-struct `var` locals whose first assignment may be skipped on some path. A struct local that *is* written field-by-field before its first whole-value read follows the ordinary definite-assignment rules instead.

This default-initialization guarantee is independent of `@no_zero_locals` (§3-3.16b): `@no_zero_locals` suppresses the implicit prologue zeroing of *uninitialized* register/local slots, but a struct local whose declared/zero field defaults are materialized here is an *initialized* local and retains its defaults regardless of the annotation. See Vol 3 §3-3.16b for the interaction with prologue zero-initialization on the native and freestanding backends.

### §1-10.2 Immutability and Mutability

Struct fields are immutable (`let`) by default. Mutable fields must be explicitly declared with `var`:

```
struct Counter {
  name: string;        # immutable
  var count: int = 0;  # mutable
}
```

*Compiler's rule (field immutability).* Both checkers reject an assignment, compound assignment included, whose target's last member is a field declared without `var` on a struct-typed value, however that value is reached: a local, a parameter (`edits` included), a field path (`r.inner.x = …` when `x` is not `var`), an element, or a struct imported from another module. The error is `E0001` "cannot assign to immutable field 'x' of struct 'P'" at the assignment, in every mode; there is no constructor or `this` exemption. (The self-hosted checker accepted these writes until v21 — a driver divergence.)

### §1-10.2.1 Field Visibility

*(This section is normative.)*

Struct fields follow the module-level encapsulation of §1-8.2. (A CLASS field is different: it is reachable only inside its class family, protected-style, §1-8.2, row FPRIV-1.) A struct field is declared with optional `pub` visibility:

- `pub` field — public, accessible (read, and write if `var`) from any module.
- (default) — **module-local**: readable and (if `var`) writable from any function or method in the **same module** (the declaring `.loup` file / namespace), and inaccessible — for both read and write — from any other module.

```loup
# file: geometry.loup
struct Point {
  pub x: float;     # public — readable from any module
  var y: float;     # module-local — accessible only within geometry.loup
}
```

A non-`pub` field is not private to the struct: it is freely accessible to all code in the declaring module, including free functions and other types in the same file. The boundary is the module, not the struct body — consistent with the absence of `private`/`protected` levels in the language (§1-8.2).

Reading or writing a non-`pub` struct field from a different module is a compile-time error (`E_FIELD_PRIVATE`), at the access site.

```loup
# file: shapes.loup
import geometry;

let p = Point(x=1.0, y=2.0);
let dx = p.x;       # OK — pub field
let dy = p.y;       # E_FIELD_PRIVATE — module-local field of geometry.loup
p.y = 3.0;          # E_FIELD_PRIVATE — read and write are both gated
```

The auto-generated constructor (§1-10.1) accepts all fields as named parameters regardless of visibility; field visibility gates direct field access (`value.field`), not construction.

**Error codes.**

| Code | Meaning |
|---|---|
| `E_FIELD_PRIVATE` | Cross-module access (read or write) of a non-`pub` struct field. Also (§1-8.2, row FPRIV-1, protected-style) access to a non-`pub` CLASS field declared in `D` anywhere except the body of a class `C` that is `D` or a subclass of `D`, through a receiver whose static type is `C` or a subclass of `C`, even in the same module. Emitted at the access site; it names the field and the struct, or the field's declaring class |

### §1-10.3 Value Semantics

Structs have value semantics:

- Structs are passed by value (copied on assignment and function call).
- Two struct values are equal if all their fields are equal (structural equality).
- Structs are hashable if all their fields are hashable.
- The runtime may use copy-on-write or other optimizations as long as observable semantics match.

*Compiler's rule (constructor arguments).* A constructor call — `C(args)` and `new C(args)` alike — is a function call: a struct argument is copied, exactly as at any other call, whatever the parameter's declared type (a struct type, a type parameter or `Any`). Storing the parameter in a field therefore never shares the caller's value — after `let h = Holder(p); p.x = 9;` the value `h` holds still has its old `x` — on every lane (loup#615: Stage0 lowered constructor arguments uncopied, so the value stored through an `Any` parameter aliased the caller's).

*Compiler's rule (reads of a struct).* Binding a struct value READ out of somewhere else — a list element (`var q = xs[i]`), a dict value (`d[k]`), a field (`o.f`), a for-in element (`for (e in xs)`), the payload of an `Option` / `Result` through `unwrap()` / `expect(…)`, or the result of a function or method (a getter handing back a field) — is an assignment: the binding (and an assignment `q = xs[i]`, and such a read passed as an argument) holds an independent copy, at every depth, on every lane, whether the container is a local, a parameter or a module global. A struct handed to an `edits` parameter is the exception: §3-2.4.9 makes it a mutable BORROW, so the argument is the caller's value itself and the callee's writes are the caller's. (loup#642: the interpreters and both Wasm hosts aliased the element, for-in, dict, `Option` and call-result cases — `var g2 = a[2]; g2.x = 99` changed `a[2]` — and the native lanes the dict and `Option` ones; every lane copied an `edits` struct argument, so `edits` lost its writes.)

*Compiler's rule (returns, nested-field stores and interface bindings of a struct, batch 32).* A `return` of a struct value the function does not own — a parameter (a `takes` parameter excepted: it is the callee's own value), `self` / `this`, a module global, a field read (`return o.id`) or an element read (`return b[i]`) — hands back a copy, so the caller's argument and the callee's result are never one block; the function's own local is moved out, not copied. The freestanding lane makes the copy at the `return` (in the caller-provided result block where the function returns through one); the hosted lanes already copy the call result where the caller binds it. A store into a nested struct field (`o.f = v`) copies `v` into the storage `o.f` already designates, so two values whose field one function sets never share it; and an interface-typed binding of a struct value (`let m: Maker = s`) holds a copy, like any other binding. A CLASS instance bound to an interface is not copied: the interface value is the same instance (§1-8.1.1 "Identity is preserved", which holds for a freestanding `local class` too), so a mutation made through it reaches the class variable it was bound from (hotfix 1.22.1). A class instance is not copied at a class-typed binding, a parameter, an assignment, a field store or a `return` either (ruling CLSID-1, the full Rust model): each names the same instance — a function returning `self`, a parameter or a module global's instance hands back that instance (its result is BORROWED or STATIC, §1-8.1.1), and only a FRESH result is the caller's own — while §1-8.1.1's lifetime rule keeps a frame-held one inside its block.

*Compiler's rule (collection values).* A `list`, `dict` or `set` is a value (§1-10.3.1 counts the built-in collections among the value types; a parameter is a read-only borrow of one, §3-2.4.9). A collection READ out of somewhere else — another binding (a local, a parameter, a module global), a field (`o.f`), an element or dict value (`xs[i]`, `d[k]`), the payload of an `Option` / `Result` through `unwrap()` / `expect(…)` / `unwrapOr(…)`, a list's `first()` / `last()` — is COPIED where it is BOUND: a `let` / `var` initializer, an assignment (to a variable, a field `o.f = xs` or an element `rows[i] = xs`), a for-in loop variable, or a `match` pattern binding out of a read that the arm writes through (`Shape.Poly(xs) => { xs.push(1); }` — a payload is immutable, so a binding nothing writes through may share it); and where it is STORED: an element of a list, set, dict or tuple literal (`[xs]`, `{"k": xs}`, `(xs, 1)`), a payload (`Some(xs)`, `Ok(xs)`, `Shape.Poly(xs)`), a field of a constructed value (`Bag(items = xs)`, and an implicit constructor's POSITIONAL argument `Bag(xs)`, which fills the same field; a class's field initializer), the element a list's `push` / `append` / `set`, a set's `add` or a dict's `set` keeps. An `if` or `match` expression (`??` included) whose branch TAIL is such a read hands that read on: binding, assigning, returning or storing the expression copies each tail that reads a collection (`let v = if (c) { xs } else { ys }`, `g = o ?? fallback`), and a fresh tail moves in. A `return` of such a read hands back a copy — a function's result is its own value, so a getter never exposes its field (`var g = c.items(); g.push(x)` leaves `c` unchanged; `c.items().push(x)` is the compile-time error below); a function's own local is moved out, not copied, and so is a `takes` parameter (§1-10.3.2: the callee's own value) at a `return` or a store into a field or an element. A struct copy copies the collections in its fields (§1-10.3.1: its copies are fully independent), and a STRUCT held in a copied collection is copied with it (`var b = pts; b[0].x = 5` leaves `pts[0]` unchanged) — as is a struct read stored in a literal, a payload or a constructed value's field. The copy is independent at every depth of nested collections (`list[list[T]]`, `dict[K, list[T]]`), so a later mutation through either side is invisible to the other; a mutating method or an element or field store applied to a field or an element in place (`o.items.push(x)`, `rows[0].push(x)`) mutates that field or element. An implementation may share storage until a write, as long as these answers hold. A collection handed to a call is a borrow (§3-2.4.9), not a store: the callee copies it where it binds, stores or returns it. Code compiled once over a type parameter (or holding an `Any`) cannot see that a `T` word is a collection, so it copies by the word's RUN-TIME kind: a store of a `T` or `Any` word into a field, an element or a captured environment copies a collection it finds there (COLL-2; §3-2.4 *Compiler's rule (strings and collections held by run-time classification)*); and a call whose callee DECLARES a bare type parameter or `Any` as its result (`get(): T`, `ident[T](x: T): T`, `get(): Any`) hands back a value of its own: binding, returning or storing its result holds an independent copy of a collection (`var g = box.get(); g.push(x)` leaves `box` unchanged; row VALFN-1) — the generic callee copies it at its own `return` by its run-time kind, or (on the native lanes, where the callee hands back the word it holds) the caller copies it by the type the call is instantiated with: one copy per crossing on every lane. The same on every lane: both interpreters, both Wasm hosts, every native backend (loup#674: the native lanes shared a list bound from a parameter, re-assigned, or a struct copy's list field — Cranelift also an element, field or dict-value alias — and EVERY lane shared a getter's result, a for-in element, a pattern binding, every stored read and a copied collection's struct elements; row COLL-1 in `specs/x-update-v1_20-to-v1_21/design.md`; batch 36, row CLOSENV-1 amendment HOLD-1: the native lanes shared a collection an `if` / `match` tail forwarded, and every lane an implicit constructor's positional argument).

*Compiler's rule (writes through a temporary — ruling COLL-2, loup#753).* A write — a field or element store (`f().x = v`, `o.unwrap()[0] = v`), a mutating collection method (`push`, `append`, `insert`, `set`, `remove`, `pop`, `clear`, `sort`, `reverse`, `extend`, a set's `add` / `discard`, a dict's `set` / `remove` / `clear`) or an `edits:` argument — lands in the storage its target reaches through VALUE-type steps: a struct's field, a collection's element. When that path starts at a variable (a local, a parameter, `this`, a module global) the write lands in the variable. When it starts at anything else — a call's result (`o.unwrap()`, `box.get()`, `d.get(k).unwrap()`, `xs.first()`, `f()`; a function's result is its own value), a cast (`h.a as list[int]`), a tuple's element (`t.0`, `t.0 = v`: a tuple is immutable, so its element is a temporary), a literal (`[1, 2].push(3)`) or any other computed value (an operator's, an `if` / `match` expression's, a `with` copy's) — the write would act on a copy and be lost, and it is a compile-time error, `E_WRITE_THROUGH_TEMPORARY`, on both checkers and in every mode (Swift rejects the same). A step into a class instance ends the path: an object is shared by reference, so `c.me().items.push(x)` and `mk().field = v` write that object and are not errors. To keep the write, bind the value and write to the binding (`var g = box.get(); g.push(x)`), or write to the place it was read from (`d[k].push(x)` for `d.get(k).unwrap().push(x)` — an element written in place is the dict's own, as above).

| Code | Meaning |
|---|---|
| `E_WRITE_THROUGH_TEMPORARY` | A write — a field or element store, a mutating collection method or an `edits:` argument — through a temporary: a call's result, a cast, a tuple element, a literal or another computed value, reached through value-type steps only (ruling COLL-2, loup#753; the rule above) |

### §1-10.3.1 Pure Value Type Invariant

*(This section is normative. Applies to all targets and all execution modes.)*

A struct field may not have a class type. The field's declared type must be one of:

- A primitive type (`int`, `float`, `bool`, `char`, `string`, `bytes`, `bigint`, `decimal`, `complex32`, `complex64`, `complex`, or any fixed-width numeric type)
- The `array[T, rank]` primitive (§1-4.10), provided `T` also satisfies this rule recursively
- An owned `buffer[T, N]` (compilation §3-3.17b; a `buffer` field declared with no overlay initializer), provided `T` also satisfies this rule — its `N` elements are part of the struct value: copied with it, zeroed in a default-initialized value, never shared by two values (loup#864, row BUFV-1). An overlay buffer field (`= addr`) is a view of memory the struct does not own; a copy of the struct copies the address
- A built-in collection type (`list[T]`, `dict[K, V]`, `set[T]`, `tuple[...]`) where all type arguments also satisfy this rule recursively
- Another struct, provided that struct also satisfies this rule
- An enum, provided all variant payloads satisfy this rule
- A function type (`fn(...)`, `noescape fn(...)`)
- `Option[T]` or `Result[T, E]` where `T` and `E` satisfy this rule
- A `borrow[~name]` reference (available in all modes, §1-2.6)
- A `unique T` reference where `T` is a class type (available in all modes, §1-2.6) — permitted because `unique` carries no ARC retain/release and no aliasing; the compiler proves single ownership at all times (§3-2.4.7)

Declaring a struct field whose resolved type is a plain ARC class reference is a compile-time error (`E_STRUCT_CLASS_FIELD`). A `unique T` field is explicitly not a plain ARC reference and does not trigger this error.

The rule — like the `ValueType` bound and the instantiation check below — is judged against the COMPLETE declarations of the program: declaration order does not matter, so an enum, struct or generic type declared after the struct (later in the module, or in another module) is judged by its declaration exactly as one declared before it.

```loup
class Connection : Any { ... }

# COMPILE ERROR — class reference in struct field
struct Request {
  var path: string;       # OK — primitive
  var conn: Connection;   # E_STRUCT_CLASS_FIELD
}

# OK — all fields are value types
struct Request {
  var path: string;
  var headers: dict[string, string];
  var body: bytes;
}
```

**Generic structs.** For a generic struct with an unconstrained type parameter `T`, the compiler checks §1-10.3.1 at each instantiation site against the resolved concrete type. If the resolved type is a class, `E_STRUCT_CLASS_FIELD` is emitted at the instantiation site.

To enforce the constraint at the definition site and produce a clearer error at call sites, annotate the type parameter with the `ValueType` constraint:

```loup
# Unconstrained — error surfaces at instantiation site
struct Box[T] {
  var value: T;
}
let b = Box[Connection](value=conn)      # E_STRUCT_CLASS_FIELD

# Constrained — error at definition if violated; clearer message at call sites
struct Box[T: ValueType] {
  var value: T;
}
let b = Box[Connection](value=conn)      # E_VALUETYPE_CONSTRAINT: Connection does not satisfy ValueType
```

**`ValueType` constraint.** `ValueType` is a compiler-intrinsic type constraint. It is satisfied automatically by any type that passes §1-10.3.1 — primitives, structs, enums, built-in collections with `ValueType` type arguments, function types, and `unique T` references. It is never satisfied by a plain ARC class type. `ValueType` cannot be implemented or extended by user code; it is not an interface.

**Rationale.** Permitting class-typed fields would introduce shared heap aliasing through struct copy semantics — two copies of the same struct would reference the same heap object, violating the independence that value semantics implies. Keeping structs free of class references ensures that copies are always fully independent, that `edits` (exclusive borrow) on structs is always deeply exclusive, and that the struct/class boundary is unambiguous across all targets and execution modes.

**When you need a reference-typed container holding other reference-typed objects**, use a class. The `structures.*` module provides class-based mutable container types for this purpose.

**Error codes.**

| Code | Meaning |
|---|---|
| `E_STRUCT_CLASS_FIELD` | Struct field's resolved type is a plain ARC class reference — at definition for concrete fields, at instantiation for generic fields; `unique T` fields are exempt |
| `E_VALUETYPE_CONSTRAINT` | Type argument does not satisfy the `ValueType` constraint |
| `E_GENERIC_BOUND_UNSATISFIED` | Type argument violates an interface or intrinsic-marker bound declared on a generic parameter (`ValueType` has the more specific `E_VALUETYPE_CONSTRAINT`) |

### §1-10.3.2 Move Semantics for Structs with `unique` Fields

*(This section is normative. Applies to `@mode(host.native)` and `@mode(freestanding)`.)*

A struct containing one or more `unique`-qualified fields — or one or more **overlay fields** (`var f: buffer[T, N] = addr;`, compilation §3-3.17b) — is a **move-only struct**. Move-only structs have different assignment semantics from ordinary structs.

**Ordinary structs** (no `unique` fields) retain copy semantics — assignment produces an independent copy, and the source binding remains valid:

```loup
@mode(web.compiled)

struct Point { x: float; y: float; }

let a = Point(x=1.0, y=2.0)
let b = a        # copy — a and b are independent values
use(a)           # OK — a is still valid
```

**Move-only structs** (one or more `unique` fields) transfer ownership on assignment — the source binding is consumed and may not be used again:

```loup
@mode(host.native)

struct Request {
  var path: string;
  unique var conn: Connection;   # unique field — makes Request move-only
}

let r1 = Request(path="/api", conn=Connection.open(addr))
let r2 = r1        # MOVE — r1 is consumed; r2 owns the Connection
use(r1)            # E_USE_AFTER_MOVE: r1 was moved to r2
```

**Function call semantics.** A no-verb parameter on a move-only struct is an implicit `reads` borrow — the caller retains ownership after the call. To transfer ownership into the function, declare the parameter with `takes`:

```loup
# Implicit reads borrow (default) — caller retains ownership
func inspect(req: Request): string { return req.path; }  # implicit reads

let r = Request(path="/api", conn=Connection.open(addr))
inspect(r)           # ✓ implicit reads — r still valid after call
inspect(reads: r)    # ✓ explicit reads — identical
use(r)               # OK — r still valid
```

To transfer ownership, declare the parameter with `takes` and acknowledge at the call site:

```loup
func handle(takes req: Request): void { ... }

let r = Request(path="/api", conn=Connection.open(addr))
handle(takes: r)     # MOVE — r is consumed by the call
use(r)               # E_USE_AFTER_TAKE
```

For a mutable borrow without consuming, use `edits`:

```loup
func update(edits req: Request): void { req.path = "/updated"; }

update(edits: r)     # exclusive mutable borrow — r not consumed
use(r)               # OK — r still valid
```

**`with`-copy is prohibited on move-only structs.** The `with` copy expression (`s with (field=val)`) is not available for move-only structs — it would produce a copy, violating the uniqueness of the `unique` fields. Use destructuring or field-by-field construction instead (`E_WITH_COPY_MOVE_ONLY`).

**The compiler distinguishes categories at the struct definition site.** A struct is move-only if and only if it has at least one `unique`-qualified field, at least one overlay field (a `buffer[T, N]` field declared with an initializer, compilation §3-3.17b), or a field whose type holds a `unique` value (a field of another move-only struct; row UNIQCOLL-1 — a collection of `unique` values is held in a `unique var` field, §1-8.11). This determination is made at definition time and does not depend on the concrete types substituted for generic parameters. A generic struct with a `unique` field is unconditionally move-only regardless of what `T` is instantiated with.

**`unique` fields are not copied in struct copies.** Because move-only structs are moved rather than copied, there is no scenario where a `unique` field would need to be duplicated. The move transfers the `unique` field's ownership to the destination binding; the source binding loses access to the field.

**Structs with overlay fields (loup#864, row OVL-1).** An overlay field is a raw view of memory the compiler cannot check, and a copy of the struct would silently leave two values viewing one block — so the struct moves rather than copies, with the assignment and call semantics above. An *implicit* copy — a use of the source binding after the move, or a `with` copy — is `W_OVERLAY_STRUCT_COPY` in 1.23 and `E_OVERLAY_STRUCT_COPY` under `[freestanding] overlays = "error"` (compilation §3-3.17b's staged rollout), in place of `E_USE_AFTER_MOVE` / `E_WITH_COPY_MOVE_ONLY`; a struct that also has a `unique` field keeps those two codes. A second view that is really wanted is made **explicitly**, reusing the unsafe acknowledgement rather than new syntax: the copy taken as the initializer of a binding written `@unsafe("reason")`, or any copy made inside an `unsafe("reason") { … }` region, is a deliberate duplication and does not consume the source:

```loup
@mode(freestanding)

struct Uart {
    @unsafe("overlay: UART0's MMIO register block")
    var regs: buffer[uint32, 16] = 0x10000000;
}

func demo(): void {
    let a = Uart();
    let b = a;                      # MOVE — `a` is consumed
    # let x = a.regs[0];            # W_OVERLAY_STRUCT_COPY (E_ under overlays = "error")
    @unsafe("overlay: a read-only second view of UART0")
    let shadow = b;                 # explicit duplication — `b` stays valid
    let y = b.regs[0] + shadow.regs[1];
}
```

A `takes:` argument keeps its ordinary rule: the binding is consumed and a later use is `E_USE_AFTER_TAKE`.

**Error codes.**

| Code | Meaning |
|---|---|
| `E_USE_AFTER_MOVE` | Binding accessed after its value was moved to another binding via assignment, or into a closure that captured it; or a value moved out of a `var` a closure captured, even after an assignment (§1-7.3, row CAPMV-1) |
| `E_USE_AFTER_TAKE` | Binding accessed after ownership was transferred at a `takes:` call site (§3-2.4.9) |
| `E_OVERLAY_STRUCT_COPY` | Implicit copy of a struct holding an overlay field (a use after its move, or a `with` copy) outside an explicit `@unsafe` / `unsafe { }` acknowledgement, under `[freestanding] overlays = "error"` (compilation §3-3.17b, row OVL-1) |
| `W_OVERLAY_STRUCT_COPY` | The same site in the default `overlays = "warn"` mode (1.23) |




### §1-10.4 Relationship to `Any`

Structs do NOT inherit from `Any` and are NOT classes:

- No inheritance — structs cannot extend other structs or classes.
- No `Any` — a struct value is not `Any` unless explicitly boxed.
- Boxing: use the `box` keyword expression (`box myStruct`) or assign to an `Any`-typed variable (implicit widening). There is no `Any.box()` static method — box types are ABI-internal (§1-4.2).
- Structs may implement interfaces.

### §1-10.5 Methods

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

### §1-10.6 Generic Structs

```
struct Pair[A, B] {
  first: A;
  second: B;
}

let p = Pair(first="hello", second=42);
```

### §1-10.7 `with` Copy Expression

The `with` expression creates modified copies of structs. Using `with` on a class (not a struct) is a compile-time error (`E_WITH_COPY_WRONG_TYPE`).

The `with` expression creates modified copies of structs:

```
let p1 = Point(x=1.0, y=2.0);
let p2 = p1 with (x=3.0);        # Point(x=3.0, y=2.0)
let p3 = p1 with (x=0.0, y=0.0); # Point(x=0.0, y=0.0)
```

For any struct value `s` and a `with` expression `s with (field=newValue)`, the result is a new struct where the specified field has `newValue` and all other fields are copied from `s`.

**`with`-copy and `borrow[~name]` fields.** When a struct carries `borrow[~name]` fields, a `with`-copy expression `s with (field = newVal)` is valid only when `newVal` is a `borrow[~name]` value from a region that satisfies `~name` by covariance (the same label or a longer-lived source, including `~static`). Supplying a value from a mismatched lifetime region is a compile-time error (`E_BORROW_WITH_MISMATCH`). Fields that are not `borrow[~name]` fields are unaffected by this rule.

| Code | Mode | Condition |
|---|---|---|
| `E_WITH_COPY_WRONG_TYPE` | All | `with` copy expression used on a class instance — only structs support `with` copying |
| `E_WITH_COPY_MOVE_ONLY` | All | `with` copy expression used on a move-only struct (one with `unique` fields, or a field holding a `unique` value — §1-10.3.2) |
| `E_WITH_COPY_UNKNOWN_FIELD` | All | `with` copy expression names a field that does not exist on the struct type |

### §1-10.8 Struct Destructuring

```
let Point(x=px, y=py) = somePoint;

match shape {
  Point(x=0.0, y=0.0) => "origin",
  Point(x=x, y=y)     => i"({$ x $}, {$ y $})",
}
```

### §1-10.9 Compiled Mode

Structs are the preferred type for compiled mode data records — they map directly to a flat Wasm representation or native C-compatible structs with no boxing, no vtable, and no GC overhead for stack-allocated instances.

### §1-10.10 Relationship to Other Types

| Type | Fields | Semantics | Inheritance | Use Case |
|---|---|---|---|---|
| `struct` | Named | Value (pure — no class fields, §1-10.3.1) | None | Plain data records |
| `class` | Named | Reference | Single + interfaces | Objects with identity, polymorphism |
| `tuple` | Positional | Value | None | Ad-hoc groupings |
| `enum` | Named variants | Value (payloads must satisfy §1-10.3.1) | None | Sum types / tagged unions |


### §1-10.11 Lifetime-Parameterized Structs

*(This section is normative. Available in all six modes; see §1-2.6.)*

A struct may declare one or more lifetime parameters to allow `borrow[~name]` fields whose source region is tracked across function boundaries. Lifetime parameters are declared in the struct's `[...]` generic brackets using the `lifetime` keyword:

```loup
@mode(host.native)

struct Slice[lifetime ~src] {
  borrow[~src] data: string;   # non-owning — tied to ~src region
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
- `[lifetime ~name]` declarations are available in all six modes (see §1-2.6 and §3-2.4). The region model is enforced identically across modes — region containment and borrow-escape checks are compile-time properties that do not depend on the runtime memory model.
- A struct may declare multiple lifetime parameters and freely mix them with type parameters: `struct Foo[lifetime ~a, lifetime ~b, T]`.
- A struct that declares a `[lifetime ~name]` parameter or that contains any `borrow[~name]` field is implicitly non-`Sendable`. Explicitly writing `implements Sendable` on such a struct is a compile-time error (`E_SENDABLE_LIFETIME`). See §2-1.8.1.
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

  # Return type inferred to borrow from self's ~src lifetime
  pub func view(): borrow string {
    return data[start:end];
  }

  # Same semantics, written explicitly for documentation clarity
  pub func viewExplicit(): borrow[~src] string {
    return data[start:end];
  }
}
```

**Constructing a lifetime-parameterized struct.** The auto-generated constructor (§1-10.1) accepts `borrow[~name]` values for borrow fields. The compiler ties the resulting struct's lifetime to the provided source region:

```loup
@mode(host.native)

func tokenize[lifetime ~src](borrow[~src] input: string): list[string] {
  var stream = Slice(data=input, start=0, end=input.len());
  # stream's ~src is anchored to input — stream cannot outlive input
  var tokens = list[string]();
  while (stream.len() > 0) {
    tokens = tokens + [readNext(borrow stream)];
  }
  return tokens;   # OK: returns an owned list, not the stream
}
```

**`with`-copy on lifetime-parameterized structs.** See §1-10.7.

**Cyclic lifetime parameters.** A struct whose `[lifetime ~name]` parameter appears, directly or transitively via field types, in a cycle through itself is a compile-time error (`E_LIFETIME_CYCLE`).

**Type aliases with lifetime parameters.** Type aliases may carry lifetime parameters using the same `[lifetime ~name]` syntax:

```loup
@mode(host.native)

type StrSlice[lifetime ~src]     = Slice[~src];
type ParseState[lifetime ~src, T] = Parser[~src, T];
```

---

## §1-11 Interfaces

*(This section is normative.)*

### §1-11.1 Interface Declarations

Interfaces define contracts that classes and structs explicitly implement. Interface methods may be declared as abstract signatures (using `;`) or with a default implementation (using a `{ body }` block). A class implementing the interface may override a default-body method; if it does not, the default implementation is used. Abstract interface methods (ending in `;`) must be provided by every implementing class:

```loup
interface Greetable {
  func name(): string;            # abstract — must be implemented
  func greet(): string {          # default implementation
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

*Compiler's rule (an implementer's subclasses implement — round 4 X).* `implements I` is inherited: a class whose superclass, at any depth, implements `I` (or an interface that extends `I`) is an `I` (`x is I` holds, §1-4.7) and may be passed, stored and called as one. Its implementation of each of `I`'s methods is the method its own class has: the one it declares, or else the nearest one up its superclass chain (§1-8.3). A call through an `I`-typed receiver runs that method — an override in the subclass wins over the implementer's — on every lane, interpreted and native alike, whatever the result type. A class that names `I` in `implements` but inherits the method from a superclass that does not name `I` implements it with the inherited method. (Both native drivers called, through an interface, only classes that name the interface themselves: an inherited-only implementer answered 0 — an empty string, 0, 0.0 or a null object — and an implementer that inherits the method failed to link; compilation §3-3.2.)

**Interface inheritance.** An interface may extend one or more superinterfaces using the `:` clause: `interface IMutableMap[K, V] : IReadableMap[K, V] { ... }`. A sub-interface inherits all abstract and default method declarations from its superinterfaces. A class that `implements` the sub-interface must implement all inherited members in addition to the directly-declared ones. Multiple superinterfaces are permitted: `interface Foo : Bar, Baz { ... }`. Circular interface hierarchies are a compile-time error (`E_CIRCULAR_INTERFACE`).

**Sealed interfaces.** An interface declared `sealed` may only be implemented by types in the declaring module. An external module attempting to declare `implements SealedInterface` is `E_SEALED_EXTERNAL_IMPL`. Sealed interfaces are useful for closed protocols where the implementer set is part of the module's API contract — algebraic-data-style models, plugin registries with a fixed set of providers, or protocol families intended for internal extension only.

| Code | Mode | Condition |
|---|---|---|
| `E_INTERFACE_NOT_IMPLEMENTED` | All | A class declares `implements I` but does not provide a concrete implementation for one or more abstract methods of `I` (or its superinterfaces) |
| `E_SEALED_EXTERNAL_IMPL` | All | An external-module type declares `implements I` where `I` is a sealed interface (§1-11.1) |
| `E_CIRCULAR_INTERFACE` | All | Interface hierarchy contains a cycle (e.g. `interface A : B` and `interface B : A`) |
| `E_INTERFACE_CONFLICT` | All | Two superinterfaces declare incompatible default method implementations for the same method name (neither interface extends the other) and the implementing class does not define the method itself |
| `E_INTERFACE_SUPER_NOT_INTERFACE` | All | A name in an interface's `:` clause is not an interface (loup#419) |

**Interface method visibility.** Interface method declarations without an explicit access modifier are implicitly `pub`. Interfaces define public contracts — their members are callable from any module that holds a value of the interface type. An explicit `pub` is permitted and encouraged for documentation clarity but has the same effect as omitting it. Module-private interface methods (which would be inaccessible outside the declaring module) are not supported; the compiler treats all interface members as `pub` regardless of whether the keyword is written.

**`modifier` methods in interfaces.** An interface may declare `modifier` abstract or default methods. A class implementing the interface must declare the corresponding method as `modifier`; implementing a `modifier` interface method with a non-`modifier` method is `E_MODIFIER_OVERRIDE_MISMATCH`. This mirrors the rule for superclass overrides (§1-8.3): the mutation contract is part of the observable interface and cannot be silently dropped by an implementation. Overriding a non-`modifier` interface method with a `modifier` implementation is permitted — the implementing class strengthens the contract.

**`safe func` methods in interfaces.** An interface may declare `safe func` abstract or default methods. When a class implements a `safe func` interface method, the implementing method's `safe` status determines calling semantics for the concrete type: if the implementation omits `safe`, callers through the concrete type do not require a safe context; calls dispatched through the interface type always require one. Implementing a `safe func` interface method with a non-`safe func` method is permitted (less restrictive); implementing a non-`safe func` interface method with a `safe func` method is also permitted (more restrictive — callers of the concrete type must provide a safe context).

**`async func` members.** An interface method may be declared `async func m(…): Task[T]` (§1-11.2's `AsyncIterator[T]` is one); its signature is the `Task[T]` a class's async method has, and an implementation is an `async func` returning `Task[T]` (loup#767). An `async` METHOD's body returns the `T` of its declared `Task[T]`, exactly as a free async function's does (runtime §2-1; loup#734).

**Default parameter values in interface methods.** Interface method declarations may include default parameter values. An implementing class inherits those defaults: if the implementation omits a default value, callers may still call the method with that parameter omitted and the interface default is used. An implementation may provide a different default value; the implementation's default takes precedence for calls dispatched through the concrete type, while the interface default applies when the call is dispatched through the interface type. The compiler verifies that the implementation's parameter types match the interface's declared types regardless of default values.

### §1-11.2 Standard Interfaces

The following interfaces are defined by the language and standard library:

```
interface Iterable[T]       { func iter(): Iterator[T]; }
interface Iterator[T]       { func next(): Option[T]; }
interface AsyncIterable[T]  { func asyncIter(): AsyncIterator[T]; }
interface AsyncIterator[T]  { async func next(): Task[Option[T]]; }
interface KeyLookup[K, V]   { func has(key: K): bool; func get(key: K): Option[V]; }
interface Readable          { func read(n: int): bytes; }
interface Writable          { func write(b: bytes): int; }
interface Sized             { func len(): int; }
interface From[E]           { static func from(err: E): Self; }
interface Comparable[T] : Equatable[T] {
                              func compareTo(other: T): int;
                              operator func ==(other: T): bool { return compareTo(other) == 0; } }
interface Equatable[T]      { operator func ==(other: T): bool; }
interface Hashable          { func hashCode(): int; }
interface Renderable        { func render(ctx: RenderContext): string; }

# Numeric trait markers — see §1-4.0 for the canonical declaration.
# Implementers are listed in §21.2.4 of the stdlib reference.
interface Integer           { /* marker — fixed-width integer types */ }
interface Float             { /* marker through v1.18; v1.20 adds IEEE 754
                                 metadata members — see §21.11.5 for the
                                 full member set */ }
interface Numeric           { /* marker — Integer ∪ Float ∪ decimal ∪ complex */ }
interface Dynamic {
                              func hasField(name: string): bool;
                              func getField(name: string): Any;
                              func setField(name: string, value: Any): void;
                              func deleteField(name: string): bool;
                              func fieldNames(): list[string]; }
interface Finalizable       { func finalize(): void; }

# Web Component lifecycle — implemented by @webcomponent classes (§2-4.10).
# All methods have default no-op implementations; override only what is needed.
interface WebComponentLifecycle {
  func connected(): void { }        # element inserted into a document
  func disconnected(): void { }     # element removed from a document
  func adopted(): void { }          # element moved to a new document
  func attributeChanged(name: string, oldValue: string?, newValue: string?): void { }
}

# Map interfaces — implemented by dict[K,V] and structures.* types
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

# IMutableMap extends IReadableMap with write operations.
# dict[K, V] implements IMutableMap[K, V].
interface IMutableMap[K, V] : IReadableMap[K, V] {
  func put(key: K, value: V): void;           # insert or update
  func putIfAbsent(key: K, value: V): bool;   # returns true if inserted
  func remove(key: K): Option[V];             # returns removed value
  func clear(): void;
  func putAll(other: IReadableMap[K, V]): void;
}
```

**Relationship between `Comparable[T]` and `Equatable[T]`.** `Comparable[T]` is a subtype of `Equatable[T]` — implementing `Comparable[T]` automatically provides an `==` implementation via `compareTo(other) == 0`. This default `==` may be overridden by an explicit `operator func ==` declaration.

**Comparable and Hashable.** Because `Comparable[T]` implies `Equatable[T]`, any type that implements `Comparable[T]` and is used as a `set[T]` element or `dict[T, V]` key must also implement `Hashable` — the same consistency requirement that applies to `Equatable[T]` directly (§1-5.1). The compiler enforces this: if a `Comparable[T]` type is used in a `set` or as a `dict` key without `Hashable`, the compiler emits compile-time error `E_HASHABLE_REQUIRED`. This transitivity is intentional.

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

`Closeable` and `Releasable` (declared below) both extend `Scoped[Self]` with default `scope_enter`/`scope_exit` driven by `close()` / `release()` respectively — implementers gain `with`-block compatibility automatically.

**`Releasable` (scope-bound resource protocol):**

```
interface Releasable : Scoped[Self] {
  func release(): void;

  # Default scope protocol: `scope_enter` returns the releasable itself
  # (so the user binds the guard, not a wrapped value), and `scope_exit`
  # calls `release()` without suppressing exceptions.
  func scope_enter(): Self { return this; }
  func scope_exit(error: Option[Any]): bool {
    release();
    return false;
  }
}
```

`Releasable` is the protocol for types whose lifetime is bounded by a lexical scope and that perform a cleanup action on exit — most commonly lock guards and interrupt-masking guards. Because `Releasable` extends `Scoped[Self]` and provides default `scope_enter`/`scope_exit` implementations driven by `release()`, an implementing type works with `with` blocks immediately:

```
with (g = mutex.lock()) {     // g : MutexGuard[T]
  g.set(newValue);            // g is the guard, can be operated on
}                             // release() called automatically on exit
```

A `Releasable` type may override the default `scope_enter`/`scope_exit` (using the `override` modifier per §1-8.3.1) when finer control is needed — for instance, to suppress specific exceptions or to perform additional cleanup.

**`ReadGuard[T]` and `WriteGuard[T]` (guard pattern):**

```
interface ReadGuard[T] : Releasable {
  func get(): T;
}

interface WriteGuard[T] : ReadGuard[T] {
  func set(value: T): void;
  func update(fn: fn(T): T): void;
}
```

`ReadGuard[T]` is a scope-bound, read-only view of a value of type `T`. `WriteGuard[T]` adds in-place mutation (`set`) and read-modify-write (`update`). Both extend `Releasable`, so they inherit `release()` and the auto-`Scoped[Self]` behaviour. Concrete guard types in the standard library implement these:

| Guard type                    | Implements           | Use site               |
|---|---|---|
| `MutexGuard[T]`               | `WriteGuard[T]`      | §2-1.8.2 native mutex   |
| `SharedMutexGuard[T]`         | `WriteGuard[T]`      | §2-2 shared mutex      |
| `SharedRwReadGuard[T]`        | `ReadGuard[T]`       | §2-2 shared rw-lock    |
| `SharedRwWriteGuard[T]`       | `WriteGuard[T]`      | §2-2 shared rw-lock    |
| `InterruptGuard`              | `Releasable`         | §3-3 freestanding     |

**`Closeable` (resource-cleanup protocol):**

```
interface Closeable : Scoped[Self] {
  func close(): void;

  # Default scope protocol: `scope_enter` returns the closeable itself,
  # `scope_exit` calls `close()` without suppressing exceptions.
  func scope_enter(): Self { return this; }
  func scope_exit(error: Option[Any]): bool {
    close();
    return false;
  }
}
```

`Closeable` is the protocol for types whose lifetime ends with a permanent cleanup action — file handles, network connections, database sessions. Like `Releasable`, it extends `Scoped[Self]` with default `scope_enter`/`scope_exit` driven by `close()`, so any `Closeable` type works with `with` blocks immediately:

```
with (fh = runtime.fs.open("out.txt")) {
  fh.write("ok");
}                         // close() called automatically on exit
```

**`Closeable` vs. `Releasable`.** Both protocols arrange automatic cleanup on scope exit, but they capture different semantics. `close()` signals that the underlying resource is permanently released — the file handle, connection, or session is over. `release()` signals that a scope-bound operation is complete — the lock is given back, the interrupt mask is lifted — but the underlying resource (the mutex, the interrupt controller) continues to exist and can be re-acquired. Types choose the protocol matching their semantics; types implementing both are unusual and signal an unusually rich resource model.

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

### §1-11.3 Iteration Protocol

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
# for (x in expr) { body }
# desugars to:
{
  let __iter = expr.iter();
  loop: while (true) {
    match __iter.next() {
      Some(x) => { body },
      None    => { break loop; },
    }
  }
  # if __iter has a close() method, it is called on early exit
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

**Generators and iteration.** Generators (see §1-7.5) automatically implement `Iterable[T]` (or `AsyncIterable[T]` for async generators), providing a simpler way to create custom iterators without writing separate iterator classes:

```
gen func countdown(from: int): Iterable[int] {
  var i = from;
  while (i > 0) {
    yield i;
    i = i - 1;
  }
}

for (n in countdown(5)) {
  print(n);   # 5, 4, 3, 2, 1
}
```

**Compiled mode.** User-defined iterables are permitted in compiled mode — the `Iterable[T]`/`Iterator[T]` interfaces are statically dispatched with no virtual call overhead when the concrete type is known. The element type `T` must be statically known.

**`len` vs `count`.** `len(x)` is for values with intrinsic length (primitives implementing `Sized`). `count(xs: Iterable[T]): int` explicitly iterates to count items.


### §1-11.4 Lifetime-Parameterized Interfaces

*(This section is normative. Available in all six modes; see §1-2.6.)*

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

### §1-11.5 Where Clauses

*(This section is normative.)*

The `where` keyword introduces type-parameter constraints in two contexts.

**Per-method type constraints.** A method on a generic type may declare additional bounds on the enclosing type's type parameters, restricting the method's availability to instantiations satisfying those bounds:

```
class Container[T] {
  pub let items: List[T];

  pub func sum(): T where T: Numeric {
    var total: T = T.zero();
    for (item in items) { total = total + item; }
    return total;
  }
}

let ints: Container[int] = ...;
ints.sum();              # ✓ int is Numeric

let strs: Container[string] = ...;
strs.sum();              # ✗ E_WHERE_BOUND_NOT_MET
```

The same shape applies to `func`, `async func`, `gen func`, `async gen func`, abstract methods on interfaces, and static methods.

**Conditional `implements` clauses.** A class declaration may attach a `where` clause to each `implements` clause to make trait implementation conditional on type-parameter bounds. The implementation participates in resolution only when the bounds are satisfied:

```
class Pair[A, B] : Any
    implements Eq          where A: Eq,       B: Eq,
    implements Hashable    where A: Hashable, B: Hashable {
  pub let first:  A;
  pub let second: B;
}
```

`Pair[int, string]` implements both `Eq` and `Hashable`. `Pair[Connection, int]` implements neither — `Connection` is not `Eq` or `Hashable`. Calling `==` on a `Pair[Connection, int]` is `E_OPERATOR_MISSING`.

**Constraint shape.** Each `WhereConstraint` has the form `( Identifier | "Self" ) ":" TypeConstraint`, where `TypeConstraint` is a single interface type or a sum of interface types joined by `+`. The constrained name is a type parameter declared on the enclosing scope or the implicit `Self`:

```
where T: Numeric                  // single bound
where T: Hashable + Comparable    // multiple bounds (intersection)
where T: Numeric, U: Hashable     // multiple constraints, distinct parameters
```

Each constrained parameter must already be declared on the enclosing function, method, class, or interface. A `where` clause does not introduce new type parameters.

**Grammar.** See §1-19.8 for `WhereClause` and `WhereConstraint` productions, and the integration into `FuncDecl`, `AsyncFuncDecl`, `GenFuncDecl`, `AsyncGenFuncDecl`, `MethodDecl`, `StaticMethodDecl`, `InterfaceMember`, and `ImplementsClause`.

**Error codes.**

| Code | Mode | Condition |
|---|---|---|
| `E_WHERE_UNDECLARED_PARAM` | All | `where` clause references an identifier that is not a type parameter of the enclosing function, method, class, or interface |
| `E_WHERE_BOUND_NOT_MET` | All | Method or trait implementation guarded by a `where` clause is referenced at a type instantiation that does not satisfy the constraint |
| `E_WHERE_BOUND_NOT_INTERFACE` | All | `where` constraint right-hand side names a non-interface type |

## §1-12 Generics

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
  return if (a > b) { a } else { b };
}
```

Multiple constraints use `+`: `T: Comparable[T] + Hashable`.

*Compiler's rule (the members of a bounded type parameter).* A value whose declared type is a type parameter `T` bounded by an interface — inline (`func f[T: I](t: T)`) or in a `where` clause (§1-11.5), on a function, on a class's or struct's method, or on the class or struct itself — has the members its bounds declare: `t.m(…)` calls the `m` of the bound that declares one, dispatched on the value's run-time type. The call is checked against that declaration and typed by its result, and the bound plays the part an interface-typed receiver's static type plays in §1-7.1.1: a named argument binds that declaration's parameter of that name (ruling NARG-1), whatever the implementing type calls it, and an omitted argument takes that declaration's default. (b36f-capwc: Stage0 refused every such call through an inline bound and every one inside a method — `type 'T0' has no method 'm'` — and bound a `where`-bounded function's named arguments by position; the self-hosted checker typed `t` as `Any` and bound them by position on every lane.)

**Class-kind bounds (v1.18).** In addition to trait bounds, a generic
parameter may carry a **class-kind bound** that constrains which class
memory strategy (§1-8.1.1) the type must declare:

```
func handleShared[T: shared class](ref: SharedRef[T]): void { ... }
func handleLocal[T: local class](value: T): void { ... }
func handleAny[T: class](value: Any): void { ... }   # either strategy
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

A class-kind bound also requires that the argument **be a class at all**. This
includes the bare `T: class` form, which discriminates between the two
strategies but still excludes non-class types: `Holder[int]` is
`E_CLASS_KIND_MISMATCH` for any class-kind bound.

**Where bounds are checked.** Bounds are checked at every site that supplies
type arguments — a type annotation (`func take(b: Box[Connection])`) and a
constructor call (`Box[Connection](value = c)`) alike. The constructor form
names its type arguments on the callee rather than in an annotation, so an
implementation that checks only annotations satisfies neither this rule nor the
§1-10.3.1 example written in that form.

Satisfaction is decided per bound kind:

| Bound | Satisfied when |
|---|---|
| `ValueType` (§1-10.3.1) | the argument is a pure value type — decided structurally, never by declaration |
| `Shareable` (§2-2.3) | the argument is a primitive, a `shared class`, or a collection whose components are all Shareable — likewise structural |
| an interface name | the argument conforms to that interface, whether by an `implements` clause, by inheriting a conforming supertype, or as a built-in type that intrinsically conforms |
| a class-kind (`shared`/`local`/`class`) | the argument is a class whose declared memory strategy matches |

`ValueType` and `Shareable` are **compiler-intrinsic marker traits**: they are
not user-implementable, an `implements` clause for them is meaningless, and
satisfaction is decided structurally. An implementation must not route them
through ordinary interface-conformance lookup.

Bounds apply on every generic declaration form that takes type parameters —
`struct`, `class`, and `enum` alike. A bound written on one form and enforced
only on another is not a conforming implementation.

Violating an interface or intrinsic-marker bound is
`E_GENERIC_BOUND_UNSATISFIED`; violating `ValueType` is the more specific
`E_VALUETYPE_CONSTRAINT`.

> **Implementation allowance (non-normative).** A conforming implementation may
> decline to check a bound whose name it cannot resolve to a declared interface
> — marker traits established by structural analysis rather than by an
> `implements` clause are the motivating case. Accepting an unverifiable bound
> is permitted; reporting `E_GENERIC_BOUND_UNSATISFIED` for one is not, since
> that would reject valid programs on the strength of a missing lookup.

**Reification.** Generics are reified at runtime. `core.reflect.typeOf` on a `Box[int]` returns a `Type` whose `params()` includes the `Type` for `int`.

*Compiler's rule (reified type arguments).* On every managed lane — the interpreters, the Wasm hosts and the managed native lanes — a generic function, a generic method and a static member of a generic type receives the run-time type of each of its type parameters, and every instance of a generic class or struct records the type arguments it was constructed with (freestanding code is monomorphized, §3-3, and keeps no run-time type). So, inside generic code:

- `v is X`, `v as X` and `v as? X` on an operand whose static type is a type parameter `T` test the value against `X` exactly as non-generic code would test a value of `T`'s instantiation: `tis[T](v: T)` answers `v is int` true for `tis(5)` and false for `tis("s")`, `v is E.V` asks the value's variant, and `v as float` with `T` = `int` throws `TypeError` (on a `T` operand `as` / `as?` is the asserting / safe cast of §1-4.3, never a numeric conversion — ruling Q7);
- a type parameter may be the TARGET: `a is T`, `a as T` and `a as? T` test against `T`'s instantiation (`isT[int](5)` is true, `isT[int]("x")` is false, `asT[C](4)` throws `TypeError`);
- `a is G[A1, …]`, `a as G[A1, …]` and `a as? G[A1, …]`, where `G` is a user generic class, struct or interface, check the instance's type ARGUMENTS as well as its type (ruling Q1): a `Box(5)` is a `Box[int]` and not a `Box[string]`, an instance of `class IntBox : Box[int]` is a `Box[int]`, and an argument written as a type parameter stands for that parameter's instantiation. Against a built-in collection the container-kind rule of §1-4.3 stands — a collection value does not record its element type — and so does a generic ENUM: an enum value records no type arguments, so `a is Tree[int]` tests that `a` is a `Tree` and does not check `int` at run time;
- `==` / `!=` on values of a type parameter compare by the instantiation's equality (§1-5.1: strings by content, enums and structs structurally, a class by its own `op_==` or by identity, a collection by identity — inside an `Option`, a `Result`, an enum or a tuple payload too), and `<` / `<=` / `>` / `>=` / `compareTo` through a `Comparable` bound order a built-in instantiation by its built-in order (ruling Q10);
- a value of a type parameter is an `Any` (implicit widening, §1-4.3), and it renders — `to_string()`, `str`, interpolation, `print` — as its instantiation renders.

Type arguments written explicitly at a call win over inference: `f[int]()` and a static call through an applied type, `Box[int].make()` or `P[float].q()` for a generic struct `P`, bind `T` even where no argument does, and inference fills only the parameters left unwritten (an argument that contradicts a written type argument is the ordinary argument-type error; ruling of 2026-10-31). A type parameter nothing binds (an OPEN argument: `mk()` for `func mk[T](): Option[T]`) is `Any` at run time, and a type parameter bound to `Any` holds its value exactly as an `Any` binding does. The run-time type is what the descriptor ABI of §3-2 *Compiler's rule (reified type arguments on the managed lanes)* carries; the `core.reflect` API above is not part of 1.28.0 (ruling Q3), and a generic function as a VALUE remains an error (ruling Q4). (b36f-reify: the native lanes answered every scalar `is` on a `T` false, compared strings through `T` by identity and printed raw words, and no lane — the interpreters and the Wasm hosts included — answered `a is T`, `a as T` or `a is Box[int]`.)

**Variance:**

- Covariance (`out T`): read-only positions.
- Contravariance (`in T`): write-only positions.
- Invariance (default): both read and write positions.

The compiler infers variance when possible.

**Type inference.** The compiler infers type arguments from argument types:

```
let x = identity(42);        # T inferred as int
```

*Compiler's rule (inferring a generic function call).* Each parameter type is matched against its argument's type — through `list` / `set` / `dict` / `Option` / `Task` elements, tuple positions, the type arguments of the same class, struct, interface or enum, and a function type's parameters and return (a lambda argument binds `R` in `fn(T): R` from its return type). A type parameter one argument constrains takes that type, and the call's parameter and return types are instantiated with it: `wrapo(5)` for `func wrapo[T](v: T): Option[T]` is an `Option[int]`, and each argument is then checked against its instantiated parameter. A type parameter nothing constrains stays OPEN (`func mk[T](): Option[T]` called as `mk()` is an `Option[T]`, which no concrete `Option[int]` binding accepts — supply the type argument: `mk[int]()`). A type parameter constrained by two DIFFERENT types (`pair(1, 2.5)` for `pair[T](a: T, b: T)`) is an error: the call is checked against the uninstantiated signature, whose parameters take neither argument. Explicit type arguments of the right count replace inference; of the wrong count they are an error ("expects 1 type argument(s), but 2 provided"). Both checkers type a generic function call so (loup#654; row GEN-1 — the self-hosted checker typed it from the gradually checked signature, `Option[Any]` / `Any`, and checked no argument of a generic signature).

Explicit type arguments when needed. The type arguments are written in `[...]` immediately before the call's argument list — on a constructor, a free function, or a method:

```
let empty = Box[int](value=0);       # constructor
let id    = identity[int](42);       # free function: f[T](args)
let first = pair.firstOf[int]();     # method: obj.m[T]()
```

This call-site form lowers to a generic call with explicit type arguments (an explicit `type_args` list), not to an index expression. The grammar is the `TypeArgs "(" ArgList ")"` alternative of `PostfixOp` (§1-19.5).

**Index-vs-type-arguments disambiguation.** A `[...]` immediately preceding a call's `(` is parsed as type arguments — not as a value index — when, and only when, all of the following hold:

1. the first token inside the brackets is type-leading (a type name or other type-position token),
2. the bracket content has no top-level `:` (which would indicate a slice or named/dict form), and
3. the closing `]` is immediately followed by `(`.

When any condition fails, the brackets parse as an ordinary value index (`a[k]`, §1-5). A consequence: `dictOfFns[Key](x)` — where `dictOfFns` is a value whose elements are callables — reads as a *generic call* `dictOfFns` with type argument `Key`, because `Key` is type-leading and a `(` follows. To force value-index-then-call (look up the function value at key `Key`, then call it), parenthesize the index:

```
(dictOfFns[Key])(x)     // value index, then call
dictOfFns[Key](x)       // generic call with explicit type argument Key
```

**Compile-time integer parameters (v1.20).** Generic parameters may carry the type `int` (or other compile-time-evaluable scalar types), constraining the parameter to be a compile-time-known integer rather than a type. The canonical use is the `rank` parameter of the `array[T, rank]` primitive (§1-4.10):

```
pub func zeros[T: Numeric, rank: int](shape: list[int]): array[T, rank];
pub func reshape[T, rank1: int, rank2: int](a: array[T, rank1], shape: list[int]): array[T, rank2];
```

Compile-time integer parameters compose with type parameters in the same brackets. Arithmetic on them (e.g., `rank-1`, `rank+1` in shape-manipulation function return types) is permitted in type-position contexts where the compiler can statically evaluate the expression. The valid operand types for compile-time integer arithmetic in generic positions are limited to integer literals, compile-time-integer parameters, and the binary operators `+`, `-`, and (for shape products) `*`. Use of a compile-time integer parameter in a runtime expression position is permitted unconditionally — it appears as an ordinary `int` value.

See §1-4.8 for additional type system details.

### §1-12.1 Lifetime Parameters in Generics

*(This section is normative. Available in all six modes; see §1-2.6.)*

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

**Reification.** Lifetime parameters are compile-time constructs only. They are erased after type-checking and do not appear in `core.reflect.typeOf` output — `typeOf` on a `Slice[~src]` returns the same `Type` as `typeOf` on `Slice` with no lifetime argument. See §3-2.4.2.


---

## §1-13 Modules and Imports

*(This section is normative.)*

### §1-13.0.0 Source File Extensions

Loup source files use one of five extensions. All five are lexed and parsed
identically and resolve as importable modules everywhere a source file is
looked up — a module may import another regardless of either file's extension.

A source file **declares its execution mode at the top** via an `@mode(…)` /
`@compiled` directive; that declaration is **authoritative**. The mode-flavored
extensions are a **tooling and shell identification convention by filename**
(for editors, build tooling, and `loup run`'s entry guard) — they are not a
substitute for the in-file declaration. The extension supplies a *fallback*
default execution mode only when the source declares none (an explicit
directive always wins):

| Extension | Meaning | Fallback mode (when no `@mode`) |
|---|---|---|
| `.loup`   | General source (library or any mode) | content-detected (host-scripted) |
| `.lpscr`  | Host-script or dual-mode file | `@mode(host.scripted)` |
| `.lpfree` | Freestanding-exclusive code | `@mode(freestanding)` |
| `.lpweb`  | Web-hosted-exclusive code | `@mode(web.scripted)` |
| `.lphc`   | Host-compiled (native) code | `@mode(host.native)` |

`.lpfree`, `.lpweb`, and `.lphc` name **mode-exclusive** code, but the
extension is identification, not semantics: the in-file `@mode(…)` declaration
is authoritative, so `loup run` treats a `.lphc` file exactly as the same text
in a `.loup` file declaring `@mode(host.native)` — it compiles the module,
reports every diagnostic of that mode, and, for an AOT-mode entry, invokes
`main()` (§1-2.4). Building a module for a target its declared mode cannot run
on is `E_MODE_TARGET_MISMATCH` (`loup build --target …`). The extension does not
change parsing or the resolved module's public surface — a well-formed
mode-flavored file still carries its `@mode(…)` declaration at the top
(ruling MODE-5, loup#444).

### §1-13.0 Namespace Declarations

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
- The dotted path must be an `AbsolutePath` (§1-19.3). It cannot be relative (`./`).
- The namespace path should match the file's location relative to the package root, though the compiler does not enforce this — mismatches produce a lint advisory `namespace-path-mismatch`.
- Files without a `namespace` declaration belong to the default namespace derived from their file path relative to the package root.
- `namespace` is a keyword (§1-3.4).

*Compiler's rule (braced namespace block).* Both front ends also accept a BRACED form, `namespace a.b { … }`, wherever a declaration may appear (`NamespaceBlock`, §1-19.2). Its body is a statement list — the items a module's top level admits (`TopLevelItem`), a `let` / `var` binding and a destructuring `let` included, not declarations only — and it is ONE lexical scope: every declaration in the body sees the body's bindings, as a module's declarations see its module-level bindings, and a second binding of one name in the body is `E_REDECLARED` (§1-6.1). Both front ends give the block the same HIR (loup#584; row NS-1 in `specs/x-update-v1_20-to-v1_21/design.md`, approved by the maintainer). Its members are reached from OUTSIDE it by their QUALIFIED name, as the file-scoped form's declarations are reached under its path: `a.b.m` names member `m` of `namespace a.b { … }` from anywhere in the declaring module — before the block too, as a module-level function may be called before its declaration — while `m` unqualified outside the block is undefined; `pub` is not required within the module (loup#611).

*Compiler's rule (qualified access to a braced namespace block).* A member of a braced block is named `a.b.m` (a nested block extends its enclosing block's path); blocks that share a path prefix share it, and a block may reopen a path, its members joining those already under it (one name declared twice under one path is `E_REDECLARED`). A namespace's functions and bindings are isolated from the module's other names: a `func f` in `namespace a` and a module-level `func f` are two functions, each reached by its own name. Its types are not — a type keeps its bare name below the checker, so a class, struct, enum or interface in a braced block that shares its name with another type of the module is `E_TYPE_NAME_COLLISION` (§1-6.1); `a.b.K(…)` constructs and `a.b.E.V` names a variant. A namespace names a scope, not a value (`let x = a;` is an error). A block's statements are type-checked like the module's own. The qualified path reaches a block's members only within the declaring module; another module imports the module's own declarations as before (row NS-2, approved by the maintainer).

### §1-13.1 Import Syntax

**All import forms are module-level only** — they may not appear inside function bodies, class bodies, or any nested scope. See §1-6 "Statement Classification".

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

A grouped import is pure syntax over a shared prefix. Each sub-import's path is
JOINED onto the prefix, and the group binds exactly what the corresponding
individual imports would bind — the block above is equivalent to:

```loup
from mylib.sub.widgets import (ThingA, Other as OA);
from mylib.sub.network.http import (ThingB);
```

Each sub-import is terminated by `;`, may carry its own `prefer compiled`
clause, and may alias names with `as` under the rules above. A group's prefix
may be leading dots alone (`from . { … }`), in which case every path segment
comes from the sub-imports.

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

**Aliased names (`as`).** `Name as Alias` binds the imported symbol in the
importing module under `Alias`. The alias REPLACES the original name rather than
adding to it: `from m import (helper as h)` binds `h` and does not bind
`helper`. Both names may be bound by naming the symbol twice — `from m import
(helper as h, helper)` — in which case they denote the same symbol.

An alias is an ordinary module-scope binding and is subject to the same rules as
any other: it participates in `E_IMPORT_CONFLICT` against a same-named
declaration in the importing module, and an inner binding of the same name (a
local, parameter, or nested declaration) shadows it for the extent of that
scope, exactly as it would shadow a directly-imported name.

An alias is a naming construct only. It has no effect on the identity, type, or
dispatch of the symbol it names: a call through an alias SHALL resolve to the
same definition, and behave identically, as a call through the original name.

**Module imports (`import`).** `import core.math as m;` binds the MODULE under
the name `m`; `import core.math;` binds it under its dotted path. Its public
declarations are then reached qualified — `m.sqrt(x)`, `m.Point(1, 2)`,
`m.Color.Red`, a type `let c: m.Color`, a variant pattern `m.Color.Blue(n) =>` —
or, for the path form, `core.math.sqrt(x)`. A relative path needs `as`
(`import .util as u;`). `prefer compiled` may follow, as on a `from` import.

*Compiler's rule (module imports, loup#686).* A module import binds a
NAMESPACE (§1-13.0) whose members are exactly the module's exports — what
`from core.math import (…every pub name…)` would bind; a private name is not a
member ("member `x` not found in namespace `m`"). A qualified reference through
it resolves to, and behaves as, the same declaration a `from` import of that
name reaches. The bound name is a module-scope binding like any alias: a
clash with a module-level declaration is `imported name … conflicts with
existing declaration`, an inner binding shadows it, and `m` alone is not a
value ("`m` is a namespace, not a value"). The alias is private to the
importing module — a module import is never a re-export. (Row MODIMP-1 in
`specs/x-update-v1_20-to-v1_21/design.md`.)

**Wildcard `*` imports are prohibited** (determinism).

**Deferred imports** (`from X defer import (...)`) create type stubs to break import cycles. See §1-13.10.

**Namespace packages.** Dotted names map to directories, and a package's name may be dotted (`loup.webworks`, §1-13.3). The packages of one namespace may come from different roots and sources (§1-13.9). An import resolves through its PACKAGE — the longest dotted prefix that names one — or, where no prefix does, module by module; across `LOUPPATH` roots the first root that resolves the import wins, and a package in a later root is shadowed as a whole (§1-13.9).

**`prefer compiled` clause.** An import statement may carry the `prefer compiled` modifier to request runtime fallback resolution:

```loup
from codec import (Encoder, decode) prefer compiled;
```

When the runtime encounters `prefer compiled` on an import, it attempts to load a compiled artefact before falling back to the scripted source. See §1-13.7 for full resolution semantics.

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

### §1-13.2 Re-Exports

Re-exports allow barrel modules to expose symbols from internal modules:

```
# components/index.loup — barrel module
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

### §1-13.3 Package Manifest (`.lppkg`)

Every distributable package or application root contains a manifest file with the `.lppkg` extension. The manifest may be named either `package.lppkg` (the canonical name used by tooling by default) or `<package-name>.lppkg` (matching the `package` field in the manifest). The toolchain accepts both forms; `<name>.lppkg` takes precedence over `package.lppkg` when both exist in the same directory.

**Project root discovery.** A command that operates on *the current project* — `loup build`, `loup check`, `loup bench`, and the language server (§1-20.5) — locates that project by resolving the invocation directory under the rules of this section, and then, if it resolves to no manifest, each ancestor directory in turn, stopping at the first that does. The **nearest enclosing** package therefore wins: a package nested inside another builds itself, not its parent. A directory that resolves to no manifest — including a namespace directory (§1-13.4) — does not halt the search, so grouping directories are transparent to it. A search that reaches the filesystem root without resolving a manifest is a hard error naming the invocation directory, never a silent fallback.

`loup init` is the deliberate exception: it does **not** search upward. Its "a manifest already exists here" refusal applies to the target directory alone, so a new package may be created inside an existing one.

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
# and stripped from the published manifest. See §1-13.9.
# loup.http = { path = "../loup-http/loup/http" }
# my-utils  = { path = "/home/dev/my-utils" }

[delivery.browser]
exclude = ["io.fs", "io.proc"]

[delivery.cli]
include = ["io.fs", "io.proc"]

[delivery.service]
include = ["io.fs", "io.proc", "net.net"]

[delivery.desktop]
include = ["io.fs", "io.proc", "net.net", "ui.desktop"]

[delivery.native]
include = ["io.fs", "io.proc", "net.net"]
```

**Manifest rules:**

- **Package names.** A `package` name (spelled `name =` in the TOML form) is one or more **segments** joined by `.`; a name with two or more segments is a **namespaced** package (`loup.webworks`, `acme.http-tools`). Each segment is a lowercase, hyphen-separated identifier: it starts with a lowercase ASCII letter, continues with lowercase letters, digits and hyphens, and does not end with a hyphen (`acme.http-tools`, not `acme.Http`, `acme.http_tools` or `acme.3d`).
- **Directory spelling.** A segment's **directory spelling** — the name of its directory, and the spelling an import uses — is the segment with every `-` replaced by `_`: the package `loup-fmt` sits in `loup_fmt/`, `acme.http-tools` in `acme/http_tools/`, and its modules are imported as `from acme.http_tools.client import (…)`. Underscores are therefore not allowed in a name, so the mapping is one-to-one.
- **Location.** A namespaced package's manifest sits in a directory whose path ENDS with the directory spellings of its segments: `loup.webworks` in `…/loup/webworks/`, `acme.http-tools` in `…/acme/http_tools/`. A manifest whose dotted name does not match its own directory is a manifest error, `E_PACKAGE_LOCATION`, naming both the declared name and the directory. A single-segment package's directory may be named freely. Under a `LOUPPATH` root the location is also how a package is found (§1-13.9).
- **Namespaced dependency keys.** In `[dependencies]` / `[deps]` / `[dev-deps]` / `[dev-overrides]`, a namespaced name may be a quoted key (`"loup.webworks" = { path = "…" }`) or TOML dotted keys (`loup.webworks = { path = "…" }`, which TOML reads as a table `loup` holding `webworks`): both name the package `loup.webworks`. A table with a `path` or `version` key is a dependency; any other table is a namespace level. A namespaced PATH dependency's `path` names its own directory, which ends with the name's directory spellings (the location rule above, `E_PACKAGE_LOCATION`); the build searches the ROOT that directory sits under, so the dependency's modules resolve by the dependency's full name exactly as under `LOUPPATH` (Packages Reference §1-13.4c).
- **Dependency paths.** A dependency's `path` (in `[dependencies]` / `[deps]` / `[dev-deps]` / `[dev-overrides]`, bare `name = "…"` or `{ path = "…" }`) is either ABSOLUTE (`/home/dev/my-utils`; on a Windows host also a drive or UNC path) and names that directory as written, or relative and is resolved against the directory of the manifest that declares it — never against the invocation directory. Every build driver resolves it the same way.
- **Reserved names.** A name whose FIRST segment is a reserved stdlib namespace (§1-13.6) is an error. A name whose first segment is `loup` is reserved for the first-party packages of the Core Package Set (§1-13.8): any other `loup.…` name is an error (§1-13.6). The bare name `loup` is not reserved.
- `version` follows semantic versioning (`MAJOR.MINOR.PATCH`).
- `loup` specifies the minimum required toolchain version.
- Dependency versions use constraint expressions: `^` (compatible), `~` (patch-compatible), `>=`, `<=`, exact, or range.
- A `loup.lock` lockfile records exact resolved versions of all transitive dependencies.
- **Delivery profiles** (`[delivery.X]`) declare which stdlib capabilities are available for each artifact shape. `include` and `exclude` take a TOML array. A `.lppkg` is a TOML document, so a bare directive (`include io.fs`) makes the whole file unreadable and can never appear in a manifest a build accepts — earlier revisions of this section showed that form (loup#376). The compiler enforces these at build time. The build's shape is selected by `[build] delivery = "…"` or `loup build --delivery <shape>`.
- Default delivery shapes: `cli`, `browser`, `service`.
- **The default delivery is `native`** (v1.21, v21.portable.10; maintainer ruling 2026-11-04): a manifest that names
  no `[build] delivery` (nor its former spelling `target`) and a build given no `--delivery` build `native`, on both
  toolchains.
- `core.text`, `data.json`, `core.time`, and `core.collections` are available on every delivery shape without restriction.
- **Former spelling.** These sections were `[target.X]`, the key was `[build] target`, and the flag was `--target`. `target` now names the build TRIPLE (`arch-platform[-family]`), so the artifact-shape axis takes the name the language already used for it — "one language covers two delivery shapes". **All former spellings remain accepted**; a manifest written either way loads, and both flags work.
- **Dependency provider sets** are `[providers.<name>]`, selected by `loup build --providers <name>`. Each carries `provides.<import-name> = "<package>"`, so a package can supply a different implementation of the same import per named set — the only form of conditional compilation the language offers, resolved at the package boundary rather than inside a module. Formerly `[profile.<name>]` and `--profile <name>`; both remain accepted. `--profile` otherwise means `debug` | `release` and nothing else.

**`[dev-overrides]` section:**

`[dev-overrides]` maps package names to local filesystem paths, redirecting resolution to a local checkout during development:

```toml
[dev-overrides]
loup.http = { path = "../loup-http/loup/http" }
my-utils  = { path = "/home/dev/my-utils" }
```

- Each entry overrides the version resolved from `loup.lock` for that package name. The `path` must contain a valid `.lppkg` manifest. The package name in that manifest must match the key, and a namespaced package's `path` names its own directory, which ends with the name's directory spellings (`loup/http`, the location rule above).
- Packages listed in `[dev-overrides]` are compiled via the JIT pipeline and their artifacts are written to the **project-local cache** (`.loup/cache/` — see §1-20.7) instead of the global cache (`~/.loup/cache/`). This prevents overwriting cached artifacts that other projects depend on.
- `[dev-overrides]` entries are **ignored** when `loup install --locked` is used (CI mode).
- `[dev-overrides]` entries are **stripped** from the published manifest. `loup publish` emits a warning if any `[dev-overrides]` entries are present and proceeds only after confirmation.
- The `loup link` and `loup unlink` commands (§1-20.1) manage `[dev-overrides]` entries automatically.

**Namespace package installation layout:**

Installed packages follow the same layout as a `LOUPPATH` root (§1-13.9): a project's package directory is a ROOT, a namespaced package sits at its name's path under it with its own manifest, and the directories above it are namespace directories with none.

```
# Installed layout under a project's package root:
packages/
  loup/                          # namespace directory (no .lppkg here)
    http/
      loup.http.lppkg            # name = "loup.http"
      …
    db/
      loup.db.lppkg
    crypto/
      loup.crypto.lppkg
  my_utils/
    my-utils.lppkg
```

- The **namespace directory** (e.g., `loup/`) is created when the first package under that namespace is installed. It contains no `.lppkg` of its own — it is purely a grouping directory.
- Each installed package's `.lppkg` file is named `<package-name>.lppkg` (the full dotted name) and placed in the package's own directory, at its name's path.
- Multiple packages under the same namespace can be installed, upgraded, and removed independently. Installing `loup.http` does not affect `loup.db`.
- The `loup install` command manages this layout automatically. Manual manipulation of the `packages/` directory is not supported. A dependency whose name `loup install` cannot place under this layout — a name that breaks the rules above — is refused, naming the rule.
- **The manifest of a directory.** Wherever a tool needs THE manifest of a directory `D` (project root discovery above, a path dependency, a package directory under a root), it is resolved as follows: (1) exactly one `<name>.lppkg` — that is `D`'s manifest; (2) otherwise a `<name>.lppkg` whose stem equals `D`'s directory name — that one; (3) otherwise `package.lppkg` if present; (4) otherwise, with two or more `<name>.lppkg`, `D` has no manifest (an older layout grouped several packages' manifests side by side in one directory; such a directory is a namespace directory, not a package, and must not be resolved to any of its members).

**`[freestanding] error_trace_depth`** — maximum number of `?` propagation
sites an error return trace records (§1-5.7), default 16. Beyond it the trace
is truncated and marked as truncated.

**`[options]` — user-declared build options.**

A package may declare its own build axes, read from source as compile-time
constants under the `options` namespace (§1-6.3 `if const`):

```toml
[options]
tls       = { values = ["off", "mbedtls", "wolfssl"], default = "off" }
log_level = { values = ["none", "error", "info", "trace"], default = "error" }
device    = { values = ["stm32f4", "stm32h7"] }   # no default — must be supplied
```

- A domain is **finite and enumerated**: a list of permitted values. No open
  strings, no unbounded integers, no domain computed by a `const func`. This
  keeps the configuration space countable, which is what makes coverage over
  configurations tractable rather than unbounded.
- `default` is optional and must be one of the declared values. An option with
  **no** default MUST be supplied at build time; omission is a build error
  (`E_OPTION_UNSET`), never a silent fallback.
- Values are supplied with `--option <name>=<value>`, repeatable. A name no
  declaration introduces is `E_OPTION_UNKNOWN`; a value outside the declared
  domain is `E_OPTION_VALUE_INVALID`.

**A package's options are its own (v1.21, v21.portable.13).** `options.<name>`
reads the options of the package the READING module belongs to: the package whose
manifest is nearest above the module's file ("The manifest of a directory", above,
applied from the module's own directory upward). A module of the package being
built — the ROOT: the project `loup build` and `loup check` build, the entry file's
package under `loup run` and `loup test` (below) — reads the root's options. A
module of any other package (a path dependency, a package under a `LOUPPATH` root
or the toolchain's bundled packages, at any depth) reads that package's own
`[options]`, each at its declared default unless the build sets it, and never the
root's. A module that no manifest owns, in a program whose root has one, declares
no options. The build sets a dependency's option on the command line or in the
root manifest, the command line winning:

```toml
# loup build --option loup.ui.budget=small      (the command line), or, in the ROOT manifest:
[options."loup.ui"]          # `[options.loup.ui]` names the same package
budget = "small"
```

- On the command line the option is `<package>.<name>`, split at the LAST dot (an
  option name is an identifier; a package name may be dotted). In `[options]`, an
  entry whose table has a `values` array is a declaration; any other table sets the
  options of the package it names, `<name> = "<value>"`. Only the ROOT manifest's
  settings apply: a package's own `[options."<other>"]` tables are read only when
  that package is itself the root. Where it is a dependency, each such table is
  not applied, and the compile warns, naming the manifest and the table; it is
  never ignored silently.
- Every driver checks each setting before it compiles anything, against the
  package it names, found by name as the build reaches it: a path dependency of
  the root manifest (transitively), else the package of that name under the root
  package's own namespace root, a `LOUPPATH` root or the toolchain's bundled
  packages, in that order (§1-13.9). A package found nowhere, the root's own name
  (the root's options are set with `--option <name>=<value>`) and an option the
  package does not declare are `E_OPTION_UNKNOWN`; a value outside the declared
  domain is `E_OPTION_VALUE_INVALID`. An `[options]` entry of the root manifest
  that is neither a declaration nor the name of a package found this way is
  `E_OPTION_UNKNOWN`, and the message says both: no such package, and a
  declaration needs `values = [...]`. A setting for a package the program then
  does not compile is unused, not an error: a test file need not import every
  package its package configures. Because a package is found by name, a package
  that the program reaches only by a plain import (a directory beside the
  importing file, neither a path dependency nor under a root) cannot be
  configured until the root manifest declares it as a path dependency.
- A dependency's option that has no default and that the build does not set is
  `E_OPTION_UNSET` when the program compiles a module of that package; a package
  the program does not compile needs no value.
- The rule is the same on every driver (`loup run`, `loup test`, `loup check`,
  `loup build` and every route it takes, including one that hands the program to
  another front end) and on both toolchains. An imported `const func` reads its
  HOME module's package's options wherever it is called, as a constant does where
  it is declared. A `@mode(portable)` module reads its own package's options and
  the importing unit's closed keys (§1-2.4.7).

*(Maintainer ruling 2026-11-04, "package-scoped options (A)"; lead rulings K9 and
K10 on how a setting is checked and told from a declaration; task row
v21.portable.13 in `specs/1-bootstrap-3-mode-portable/tasks.md`.)*

**The compile-time read namespace: you read it where you wrote it.** Each
sub-namespace mirrors the manifest section that sets it, so a reader who knows
where a value is configured knows how to read it, and the reverse:

| Read as | Set in | Kind |
|---|---|---|
| `options.*` | `[options]` | open — the author declares name, domain and default; a module reads its OWN package's (v21.portable.13) |
| `freestanding.*` | `[freestanding]` | closed — the compiler knows the keys and validates each |
| `build.*` | `[build]` | closed |
| `target.*` | derived, not written | closed — facts about the selected target |

`[options]` is additive: the language-defined sections keep their closed,
per-key-validated key sets, so a misspelled key there remains a manifest error
rather than becoming a silently ignored one.

**Every driver defines the closed keys (v1.21, v21.portable.10).** Every key of
the three closed sub-namespaces is defined on every driver — `loup run`,
`loup test`, `loup check` and `loup build` with every route it takes, including a
route that hands the program to another front end — on both toolchains and in
every mode. A module therefore reads a key the same way wherever it is compiled,
and a `@mode(portable)` module reads the keys of the unit that imports it
(row PORT-1 in `specs/x-update-v1_20-to-v1_21/design.md`). The closed keys are:

- `freestanding.<key>` for every SCALAR key of `[freestanding]` (Vol 3 §3-3.21)
  except `overlays`, which is a checker policy, not a value the program reads;
  the table- and list-valued keys (`preempt_defer`, `portal_filter`) are not
  readable either;
- `build.<key>` for the scalar `[build]` keys `entry`, `delivery`, `mode`, `arch`,
  `panic`, `separate`, `strict_deps` and `embed_jit`, and `build.error_traces`, the
  compile's error-trace switch (§1-5.7). `build.target` is not readable: `target`
  names the build triple (above), whose facts are `target.*`; `[build] target`
  written as the former spelling of `delivery` is read as `build.delivery`;
- `target.arch`, `target.pointer_width` and `target.endian`.

Each key reads the value the build uses: the command line over the manifest
(`--overflow=trap`, `--double-fault`, `--stack-report` / `--stack-enforce`,
`--separate` / `--no-separate`, `--mode`, `--arch`), the manifest over the
default. A key that neither sets reads its default:

| Key | Default |
|---|---|
| `freestanding.stack_size` | `"0"` (no stack size declared) |
| `freestanding.stack_check` | `"off"` |
| `freestanding.interrupt_nesting` | `"1"` |
| `freestanding.no_float` | `false` |
| `freestanding.no_simd` | `false` |
| `freestanding.overflow` | `"wrap"` |
| `freestanding.relocatable` | `false` |
| `freestanding.endianness` | the arch's byte order (`"big"` for s390x, else `"little"`) |
| `freestanding.double_fault` | `"halt"` |
| `freestanding.portal_ring_size` | `"0"` |
| `freestanding.error_trace_depth` | `"16"` |
| `freestanding.portal_trace_buffer_size` | `"8192"` |
| `build.entry` | `"src/main.loup"` |
| `build.delivery` | `"native"` (the default delivery, above) |
| `build.mode` | `"host.scripted"` |
| `build.arch` | `target.arch` |
| `build.panic` | `"halt"` |
| `build.separate`, `build.strict_deps` | `false` |
| `build.embed_jit` | `true` |
| `build.error_traces` | whether this compile captures error return traces (§1-5.7) |
| `target.arch` | the arch the unit is compiled for; under `loup run` and `loup test`, the host's |
| `target.pointer_width` | `"32"` or `"64"`, from `target.arch` |
| `target.endian` | the byte order of `target.arch` |

A boolean key reads as `bool`; every other key reads as a string.

*Compiler's rule (which manifest).* `loup build` and `loup check` read the
project's manifest (project root discovery, above). `loup run` and `loup test`
read the manifest of the package the program's entry file belongs to: the nearest
manifest from the entry file's own directory upward, each directory resolved by
"The manifest of a directory" (above); `loup test` reads each test file's.
`--package-of <file>` on `loup run` names another file whose package to read (the
test runner passes the test file when it runs a driver generated elsewhere). A
program with no manifest declares no `options.*` and reads every closed key at its
default. A front end invoked directly on a file, with no configuration from a driver
(`loup-llvm <file> <out.ll>` per file or `--merged`, as a test lane runs it), is a
driver too: it reads the entry file's package as `loup run` does, its `[options]`,
the settings it gives its dependencies and every closed key, and the entries a
driver does forward (`option=<key>=<value>`) apply over that table, never instead of
it, so a partial forward cannot leave a closed key undefined. (v1.21, lead ruling
K11, v21.portable.13.) `--option <name>=<value>` is accepted by `loup run` and `loup test` as by
`loup build`, validated the same way, and an option with no default that is not
supplied is `E_OPTION_UNSET` there too.

*Compiler's rule (closed sections fail explicitly).* `[build]` and
`[freestanding]` are closed: a key they do not have is a manifest error
(`E-BUILD-MANIFEST`), never a silently ignored setting. A key this specification
defines that a toolchain does not yet implement is accepted only at its default
value; any other value is `E-BUILD-MANIFEST`, naming the key and saying that the
toolchain does not implement it.

A name that no closed set defines is `E_OPTION_UNKNOWN`, as is an `options.*` name
that no `[options]` entry of the reading module's own package declares. **An imported module is held to the same rule
as the entry module:** a key it cannot read, or an `if const` condition that is
otherwise not evaluable, fails the program exactly as the same error in the entry
module does. It is never a branch left silently unselected.

### §1-13.4 Module Initialization

When a module is imported, its top-level statements execute sequentially in source order (see §1-2.1). Module initialization has the following properties:

- **Permitted top-level statements.** A module's top-level code may contain: import statements, declarations (`class`, `enum`, `interface`, `struct`, `func`, `async func`, `type`), `let`/`var` initializers, and expression statements.
- **At-most-once execution.** A module's top-level statements execute at most once. Subsequent imports reuse cached bindings.
- **Import-order initialization.** When a module contains multiple import statements, each imported module is fully initialized before the next import statement executes. For example, if a file imports module A then module B, module A's top-level statements run to completion before module B's initialization begins.
- **Circular imports.** Standard circular imports — where module A imports module B and module B imports module A via `from X import (...)` — are a compile-time error (`E_CIRCULAR_IMPORT`). Use `from X defer import (...)` (§1-13.10) to break cycles explicitly: deferred imports create type stubs that are resolved after the outermost import chain completes.
- **No suspension.** `await` is prohibited during module initialization (see §1-7.1).

The module dunders (`__name__`, `__file__`, `__execmode__`) are set before any top-level statements execute (see §1-2.2).

### §1-13.5 Package Registry

*(Full specification moved to the [Loup Packages Reference](loup-packages-reference-v1_12.md).)*

The Loup package registry is a signed, content-addressed registry of Loup
packages.  Packages are identified by name and version and authenticated with
Ed25519 signatures.  CLI commands: `loup install`, `loup cache`, `loup publish`.
See the Packages Reference for the full registry protocol, signing requirements,
and CLI reference.

### §1-13.6 Reserved Namespaces

The following root namespaces are reserved for the standard library. User packages cannot use any of these as a package name or top-level namespace prefix:

| Namespace | Contents | Availability |
|---|---|---|
| `core` | Universal language primitives | All targets |
| `io` | Filesystem, process, stream I/O | `cli`, `service`, `desktop`, `native` |
| `data` | Structured data serialization formats | All targets |
| `net` | Networking — HTTP, WebSocket, TCP, TLS, DNS | `cli`, `service`, `desktop`, `native` |
| `sync` | OS-thread concurrency primitives | `cli`, `service`, `desktop`, `native` |
| `concurrent` | Worker integration — `ScriptWorker`, `WorkerChannel[T]` for isolated parallel workers | All non-freestanding targets |
| `web` | Browser-specific APIs | `browser` only |
| `ui` | Cross-platform reactive UI: since v1.21 the alias of the `loup.ui.*` packages (§2-4) | Hosted targets; the `loup.ui.*` core packages are portable (§2-4) |
| `native` | Native-compiled-only numerical, memory, GPU, and WebGPU primitives | `@mode(host.native)` and `@mode(freestanding)` only (WebGPU also `browser`) |
| `lang` | Language interop, macro support, template runtime | All targets |
| `debug` | Debugging, tracing, profiling, MCP agent tooling | All targets (when enabled) |
| `structures` | Data structures beyond primitive collections | All targets |

The `loup.` namespace prefix remains reserved for first-party packages (see §1-13.8). User packages cannot use `loup.` as a prefix. The previously reserved `system` prefix is retired; `system` may be used as a user package name beginning with v1.1.

*Compiler's rule (the `loup.` reservation, ruling PATH-1).* A package is **first-party** when its name is in the Core Package Set (§1-13.8); that set is the toolchain's, versioned with this specification. A manifest — on disk under a `LOUPPATH` root or the toolchain's bundled package root (§1-13.9), a path dependency, a `[dev-overrides]` checkout, or the package being built — whose `name` is `loup.…` and not in the set is `E_PACKAGE_RESERVED_NAME`, as is a name whose first segment is one of the reserved stdlib namespaces above. The reservation covers the EMBEDDED stdlib too: an import whose full dotted path names an embedded stdlib module (`loup.log`, `core.math`) resolves to the embedded module, never to a package or module on disk — except the importing package's OWN source tree, which may shadow a reserved prefix (Helios Ask L2) — and the Core Package Set and the embedded modules share no name, so no on-disk package can claim one. (Row PATH-2 in `specs/x-update-v1_20-to-v1_21/design.md`.)

*Compiler's rule (an import under a reserved namespace).* An import whose first segment is a reserved stdlib namespace (or whose full dotted path names an embedded stdlib module) resolves to the program's OWN source tree when that tree has the module (Helios Ask L2), else to the standard library. When neither has it, the import is an error at the import's path, reported once: `E_IMPORT_RESERVED_NAMESPACE` when a `LOUPPATH` root (or another package) has a file for the module — the message names the namespace and the first such file, with "(and N more)" for further roots, and says to rename the module outside the namespace or move it into the program's tree; the file is never used — and otherwise an error saying the module is not a standard-library module of that reserved namespace. This holds for an import made from ANY module of the program's tree, not only the entry's directory: a module the program's tree supplies under a reserved namespace is the program's module, not a standard-library module, so its own imports resolve like the program's — a sibling `from io.b import` inside `src/io/` binds `src/io/b`, also where the standard library has a module of the same name (hotfix 1.22.1).

| Code | Mode | Condition |
|---|---|---|
| `E_PACKAGE_RESERVED_NAME` | All | A manifest's `name` has a reserved stdlib namespace as its first segment, or is a `loup.…` name outside the Core Package Set (§1-13.8) |
| `E_IMPORT_RESERVED_NAMESPACE` | All | An import names a module under a reserved stdlib namespace that neither the standard library nor the program's own source tree has, while a `LOUPPATH` root or another package has a file for it — only the program's own tree may define modules under a reserved namespace (Helios Ask L2) |
| `E_PACKAGE_LOCATION` | All | A namespaced package's manifest (or a namespaced path dependency) is not in a directory ending with its name's directory spellings (§1-13.3) |

### §1-13.7 Module Fallback Pairs

*(This section is normative.)*

A **module fallback pair** consists of a compiled artefact and a scripted source file that export compatible APIs for the same logical module path. The `prefer compiled` import clause (§1-13.1) activates fallback resolution for the named module.

#### §1-13.7.1 Resolution Algorithm

When the runtime encounters `from mylib.codec import (...) prefer compiled`, it executes the following sequence. The result is cached — a module resolves to exactly one implementation per session, consistent with the "module initialises at most once" rule (§1-2.1).

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

The fallback is always silent on success. Developers who need to detect which path was taken use `TypeName.__module__.__execmode__` (§1-2.2).

#### §1-13.7.2 Artefact Search Paths

The compiled artefact search path is:

1. The directory containing the scripted source file.
2. Any paths specified in `.lppkg` under `[compiled_search_paths]`.
3. The platform's standard shared library search path (for native targets).

```toml
# <name>.lppkg
[compiled_search_paths]
paths = ["./native", "/usr/local/lib/loup"]
```

#### §1-13.7.3 API Compatibility

The spec does not require compiled and scripted module versions to export identical APIs. The import statement determines what is required: only the names listed in the import statement must be present in whichever version is loaded.

The recommended practice is for both versions to implement the same named interface (§1-11.1), ensuring compile-time verification of API compatibility on both sides independently:

```loup
# codec/Api.loup — shared contract
interface Codec {
  func encode(data: bytes): bytes;
  func decode(data: bytes): bytes;
}

# codec.loup (scripted fallback)
from codec import (Api);
pub class Encoder : Any implements Api.Codec { ... }

# codec_native.loup (compiled artefact source)
@mode(web.compiled)
from codec import (Api);
pub class Encoder : Any implements Api.Codec { ... }
```

#### §1-13.7.4 `__execmode__` Under Fallback Resolution

After resolution, the loaded module's `__execmode__` (accessible via `TypeName.__module__.__execmode__`) reflects which path was taken. The value is whichever of the seven mode strings from §1-2.2 applies to the loaded artifact:

- The AOT mode string (`"web.compiled"`, `"host.native"`, or the AOT side of `"host.dual"`) — a compiled artefact was instantiated successfully.
- `"host.scripted"` or `"web.scripted"` — the scripted fallback was loaded.

```loup
from codec import (Encoder) prefer compiled;

let compiledVariants = ["web.compiled", "host.native", "host.dual"];
let supportsStreaming = compiledVariants.contains(Encoder.__module__.__execmode__);
```

#### §1-13.7.5 Shipping Fallback Pairs

A package ships both files at the same module path:

```
src/
  codec.loup        # scripted implementation — always present
  codec.wasm        # compiled Wasm — for browser/CLI targets
  codec.so          # compiled native — for native target
```

The package registry stores and serves all variants. Consumers use `prefer compiled` and receive whichever variant matches their platform.

#### §1-13.7.6 `ModuleLoadError`

```loup
class RuntimeError : Exception {}
  (* General-purpose runtime error base class. Extend for specific runtime error categories.
     The standard library uses RuntimeError as the base for: StackOverflowError, TaskQueueFullError,
     NullHandleError, AlignmentError, AllocError, and other infrastructure-level errors. *)

pub class ModuleLoadError : Exception {
  pub let modulePath: string;
  pub let compiledAttempted: bool;
  pub let scriptedAttempted: bool;
}
```

Thrown when both the compiled artifact and the scripted source fail to load. `cause` carries the underlying instantiation error if one was produced. Catchable via `try`/`catch`.

### §1-13.8 Core Package Set

*(Full specification: [Loup Packages Reference v1.12](loup-packages-reference-v1_12.md).)*

The first-party packages ship under the `loup.` namespace and are available
via `loup install`. As of v1.20, the set is:

**General first-party packages:**

| Package | Purpose |
|---|---|
| `loup.ai` | Multi-provider AI client (`Client`, `StructuredOutput[T]`, streaming) |
| `loup.db` | Database access (query builder, connection pool, migrations) |
| `loup.testing` | Testing framework (`describe`, `it`, `expect`) |
| `loup.bench` | Micro-benchmark harness |
| `loup.format` | Document formatting utilities |
| `loup.webworks` | Web application framework (in-tree at `source/packages/loup/webworks/`, loup#794) |
| `loup.crypto` | Pure-Loup cryptography — hashes, MACs, AEAD, KDFs, signatures, key agreement, X.509 ([Loup Cryptography Packages v0.1](loup-crypto-packages-v0_1.md), Draft; in-tree at `source/packages/loup/crypto/`; bundled with the Full-edition toolchain, §1-13.9) |
| `loup.ui` | Loup Common UI toolkit — the portable core (`loup.ui.core`, `loup.ui.fixed`, `loup.ui.signal`, …) in every mode, freestanding included, and the host backends (`loup.ui.desktop`, host modes only) ([Loup UI framework](loup-ui-framework-spec.md), Draft; in-tree at `source/packages/loup/ui/`) *(v1.21)* |
| `loup.mcp` | JSON-RPC 2.0 and the Model Context Protocol server core — framing, lifecycle, a tool registry with profiles, transports; the base of `loup mcp` and of `runtime.debug.startMcpServer` (feature spec `4-packages-6-loup-mcp`; in-tree at `source/packages/loup/mcp/`; pre-release) |

**HPC and numerical packages** (see [Loup Fortran HPC Packages v1.0](loup-fortran-hpc-packages-v1_0.md)):

| Package | Purpose |
|---|---|
| `loup.fortran.fmt` / `loup.fortran.io` / `loup.fortran.array` / `loup.fortran.intrinsic` | Fortran format strings, I/O conventions, allocatable arrays, intrinsics |
| `loup.blas` / `loup.lapack` / `loup.scalapack` | Numerical linear algebra (FFI to BLAS/LAPACK/ScaLAPACK reference and accelerated implementations) |
| `loup.openmp` / `loup.mpi` | Parallel programming primitives |

**Mainframe and enterprise packages** (see [Loup COBOL & Mainframe Packages v1.0.1](loup-cobol-mainframe-packages-v1_0_1.md)):

| Package | Purpose |
|---|---|
| `loup.pic` / `loup.record` / `loup.date.mainframe` | COBOL PIC clauses, record I/O, EBCDIC date conventions |
| `loup.batch` / `loup.report` | Job-step composition, control-break reports |
| `loup.db.db2` / `loup.mq` / `loup.cics` | DB2, IBM MQ, CICS integration |

See the Packages References for full API documentation.


### §1-13.9 `LOUPPATH` — Development Package Search Path

*(This section is normative.)*

`LOUPPATH` is an environment variable that extends the module resolver's search path for package imports, enabling development-time use of local package checkouts without modifying `loup.lock` or running `loup install`.

**Format.** `LOUPPATH` is a colon-separated list of directory paths on Unix/macOS and a semicolon-separated list on Windows. Each entry is a **root**: a directory that CONTAINS packages and plain module trees. An entry need not hold a manifest of its own (ruling PATH-1, loup#775):

```sh
# Unix — two roots on the search path
export LOUPPATH="/home/dev/checkouts:/home/dev/vendor"

# Windows
set LOUPPATH=C:\dev\checkouts;C:\dev\vendor
```

```
/home/dev/checkouts/              # a root
  acme/                           # a namespace directory: no manifest
    tools/                        #   another namespace directory
      http/                       # package `acme.tools.http`
        acme.tools.http.lppkg     #   name = "acme.tools.http"
        client.loup               #   from acme.tools.http.client import (…)
        wire/frames.loup          #   from acme.tools.http.wire.frames import (…)
/home/dev/vendor/                 # a second root
  acme/
    db/                           # package `acme.db` — the same namespace, another root
      acme.db.lppkg
      query.loup
  my_utils/                       # package `my-utils` (directory spelling, §1-13.3)
    my-utils.lppkg
    strings.loup                  # from my_utils.strings import (…)
```

**Package location.** A package named `a.b` (§1-13.3) lives at `<root>/a/b/` — each name segment in its directory spelling — and that directory holds its manifest, whose `name` is the full dotted name. A single-segment package `p` lives at `<root>/p/`. The package's modules resolve under its directory: `from a.b.x.y import (…)` finds `<root>/a/b/x/y.<ext>` (or the directory index `<root>/a/b/x/y/`), and an import of the package itself (`from a.b import (…)`) finds the package directory's index (`index.<ext>` / `mod.<ext>`). Under a root a package's modules resolve under its directory ONLY: sources kept in a subdirectory are named through it (`from a.b.src.x import`) or re-exported from a module in the package directory — only a path dependency also reaches its **source root** by name (Packages Reference §1-13.4c). *(Compiler's rule; row PATH-4.)*

**Namespace directories.** A directory on the way to a package (`<root>/a/` above) is a **namespace directory**: it needs no manifest, and without one naming it (below) it is never a package. A namespace is **open**: packages of one namespace may come from different roots and from different sources (`[dev-overrides]`, `LOUPPATH`, `loup.lock`, the cache) — `acme.tools.http` from one root and `acme.db` from another, above.

**Package identity.** A directory `<root>/s1/…/sk/` is the PACKAGE `s1.….sk` exactly when its manifest (resolved by §1-13.3's directory rule) declares that name — segment by segment, in directory spelling. A directory whose manifest declares any other name is not that package: modules under it resolve module by module, as in a manifest-less tree. (The toolchain relies on this: `compiler.loup_llvm.*` resolves under the root `source/runtime` through `compiler/loup_llvm/`, which holds the manifest of the package `loup-llvm`.) A manifest's dotted `name` must match its own location (§1-13.3, `E_PACKAGE_LOCATION`).

**Resolution order.** For any non-relative, non-stdlib import, the resolver searches in the following order and uses the first match:

1. `[dev-overrides]` entries in the project's `.lppkg` (§1-13.3) — highest priority.
2. `LOUPPATH` roots, left to right.
3. Installed packages from `loup.lock` — resolved via the global or project-local Wasm cache (§1-20.7).
4. Global cache (`~/.loup/cache/`) — fallback for packages installed globally.
5. The toolchain's **bundled package root** (below) — lowest priority.

(The program's own source tree and, for an entry inside a namespaced package, that package's root come before all of these, and a build's declared path dependencies follow the `LOUPPATH` roots — Packages Reference §1-13.4c; the bundled root follows them too.)

Within one root, resolution is **per package**, not per namespace and not per module. For an import `s1.….sn`, the import's package is the LONGEST prefix `s1.….sk` (k ≤ n) that names a package in that root; the module is then looked up in that package only (above). When no prefix names a package in the root, the import is a **plain module tree** lookup, `<root>/s1/…/sn.<ext>`, exactly as before — manifest-less trees (the toolchain's own `LOUPPATH=$RT:$RT/compiler` roots) keep resolving module by module. The first root that resolves the import — through the import's package, or as a plain module — wins; a root that holds the import's package decides the import, found or not.

**A namespaced package imports itself by name.** When the program's entry belongs to a namespaced package — the manifest nearest above the entry declares a dotted name and sits at its name's path — that package's root is searched FIRST among the roots, ahead of the `LOUPPATH` entries, so `from loup.webworks.routing import (…)` inside `…/loup/webworks/` resolves to the copy being worked on whether or not its root is on `LOUPPATH` and whatever other copy a `LOUPPATH` root holds. *(Compiler's rule; row PATH-5 in `specs/x-update-v1_20-to-v1_21/design.md`.)*

**Shadowing.** A package found in two roots resolves to the FIRST. The package in a later root is shadowed as a whole: a module the first root's package lacks is an error naming that package and where it was found (`E_IMPORT_NOT_FOUND`), never a lookup in the shadowed copy. Modules are not merged across two copies of one package.

**The toolchain's bundled packages.** An installed toolchain is a directory tree `<prefix>/bin/` (its executables) and `<prefix>/share/loup/` (its data, e.g. `share/loup/hosted_runtime/`), and, optionally, `<prefix>/share/loup/packages/` — the packages it ships with (a toolchain edition decides which; `loup.crypto` ships in the Full edition, §1-13.8). The root lives under `share/loup/`, never at `<prefix>/packages/`: a toolchain installed into a SHARED prefix (`/usr/local`, `~/.local`) must not search a generic `/usr/local/packages/`, so a `packages/` directory directly under the prefix is not searched. `<prefix>` is the parent of the directory holding the RUNNING toolchain executable, symbolic links to the executable resolved first (so a `bin` of links into the install finds the install's packages); the root is spelled canonically (on Windows without a `\\?\` prefix). When `<prefix>/share/loup/packages/` exists it is a **root** exactly like a `LOUPPATH` entry — a namespaced package `loup.crypto` sits at `<prefix>/share/loup/packages/loup/crypto/` with its own manifest, resolution under it is per package, its packages bring their manifests (below), and its manifests are held to §1-13.3's name rules (`E_PACKAGE_RESERVED_NAME`) — searched LAST, after every other root (item 5 above), on every command (`run`, `check`, `build` on every target, `test`, the REPL) and on both toolchains. So `from loup.crypto.hash.sha512 import (sha512)` resolves right after installing a toolchain that bundles it, with no `LOUPPATH`. When the directory does not exist (a development tree: `target/release/loup-bootstrap` has no `target/share/loup/packages/`), nothing is searched. A root that names the same directory as a `LOUPPATH` entry is searched once, in its `LOUPPATH` place. A build driver that hands its roots to another tool of the toolchain in the child's `LOUPPATH` (`loup-bootstrap` → `loup-llvm` on the `llbe` route, `loup-build` → the per-file `loup-llvm`) puts its bundled root at the end of that list, so both resolve the same files; a child that computes the dependency roots itself (`loup-llvm --merged`) appends its own bundled root after them. *(Compiler's rule; row PKGROOT-1 in `specs/x-update-v1_20-to-v1_21/design.md`.)*

- **Precedence.** Being last, a bundled package is SHADOWED as a whole by a same-named package in any earlier root (Shadowing, below) — a `LOUPPATH` checkout of `loup.crypto` replaces the bundled copy, the documented way to develop or patch a dependency, first-party or not — and by a version a project installed from `loup.lock`.
- **Official packages.** A `loup.…` package is first-party by NAME (the Core Package Set, §1-13.8), wherever it is found: the reservation keeps unofficial `loup.` names out of every root alike, the bundled one included, and a `loup.` package a developer puts on `LOUPPATH` is a deliberate override of the official one, not an impersonation. The reserved stdlib namespaces (§1-13.6) are no different under the bundled root: a module there under `core`/`io`/… is never used (`E_IMPORT_RESERVED_NAMESPACE` names it).
- **`--locked`.** The bundled root ships WITH the toolchain — its contents are fixed by the toolchain's version, so it is part of the toolchain's identity, not of the developer's environment — and it stays searched when `LOUPPATH` is ignored (CI isolation, below).

**Package identity and version.** The resolver reads a package's `.lppkg` to determine its name and version. The version is used only for diagnostic messages — `LOUPPATH` packages take precedence over the `loup.lock`-resolved version regardless of version number. This allows a developer to test an unreleased or patched version of a dependency without bumping version numbers.

**A package brings its own manifest.** Every module belongs to the package whose manifest is nearest above it (the ownership rule of the Packages Reference §1-13.4c). A package reached through a root therefore brings its manifest into the program, on every command (`run`, `check`, `build`, `test`):

- **Mode.** A module of the package that declares no `@mode` takes the package's `[modes]` entry for it, else its `[build] mode` (§1-2.5.2) — not the importing project's. Either may say `"portable"`: the module is then a `@mode(portable)` module (§1-2.4.7), checked against the PORTABLE-SUBSET and compiled in each importer's mode, and `loup build` of the package alone checks it and produces no artifact. A mode name that is none of the seven is `E_MODE_UNKNOWN`.
- **Exports.** An import into the package from outside it must name one of its `[exports] modules` (`E_IMPORT_PRIVATE_MODULE`, Packages Reference §1-13.4d).
- **Declared imports.** With `[build] strict_deps = true`, an import from the package into another package must name a package its manifest declares (`E_IMPORT_UNDECLARED`, Packages Reference §1-13.4c).
- **Path dependencies.** The package's own `[dependencies]` path entries are search roots for ITS modules' imports — after the `LOUPPATH` roots — and for no other package's.

Modules of the project being run that sit under no package found through a root keep the project's rules (§1-2.5.2).

**JIT-only.** `LOUPPATH` packages are always resolved via the JIT pipeline and bypass the Wasm cache. Because `LOUPPATH` sources are under active development and change frequently, cache validation overhead would exceed the benefit. The JIT pipeline uses incremental compilation so only changed modules are recompiled on each `loup run`.

**CI isolation.** `LOUPPATH` is **ignored** when `loup install --locked` is in effect. This ensures that CI builds are fully reproducible and unaffected by the developer's local environment. The toolchain's bundled package root is not: it is reproducible with the toolchain version (above).

**Diagnostic.** `loup run --verbose` logs each `LOUPPATH` root consulted, then the toolchain's bundled package root when it has one (`[resolve] bundled package root: '<prefix>/share/loup/packages'`), the package each import resolved to and the root it came from, any same-named package a later root shadows, and which packages were resolved from `LOUPPATH` versus `loup.lock`. An unresolved package import lists the roots searched — the bundled root last — and the package path tried in each (`unresolved package import 'a.b.x': searched roots ['…/checkouts', '…/vendor', '<prefix>/share/loup/packages'] for package path 'a/b'`). `loup check` searches the same roots as `loup build` — `LOUPPATH` included.

**Interaction with namespace packages.** If a `LOUPPATH` entry resolves a package that is part of a namespace (e.g., `loup.http`), only that specific package is overridden. Other packages in the same namespace (e.g., `loup.db`) continue to resolve from `loup.lock` as usual.

---

### §1-13.10 Circular Imports and Deferred Type Resolution

*(This section is normative.)*

#### §1-13.10.1 Circular Import Policy

A **standard circular import** exists when the module dependency graph contains a
cycle reachable through `from X import (...)` statements. The compiler detects such
cycles during the dependency resolution phase and emits `E_CIRCULAR_IMPORT` naming
both modules. This applies in all six execution modes.

Good architecture avoids cycles. Common remedies: extract shared types into a third
module that both depend on; merge tightly-coupled modules; or use `defer import`
(§1-13.10.2) when the cycle is unavoidable.

#### §1-13.10.2 `defer import` — Deferred Type Resolution

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
# nodes.loup
from edges defer import (Edge)

class Node : Any {
  pub let id: int;
  pub var edges: list[Edge] = [];   # ✓ — field type annotation, stub ok

  pub func addEdge(edge: Edge): void {  # ✓ — parameter type, stub ok
    edges.append(edge);
  }
}
```

```loup
# edges.loup
from nodes defer import (Node)

class Edge : Any {
  pub let src: Node;               # ✓ — field type annotation, stub ok
  pub let to:  Node;               # ✓ — field type annotation, stub ok

  new(src: Node, to: Node) {       # ✓ — parameter type, stub ok
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

#### §1-13.10.3 Error Codes

| Code | Condition |
|---|---|
| `E_CIRCULAR_IMPORT` | See §1-13.1 — `import` chain creates a module dependency cycle |
| `E_DEFERRED_USE_BEFORE_RESOLVED` | A value operation (construction, method call, cast, field access) on a deferred type stub during module top-level initialization, before the stub is resolved |
| `E_DEFERRED_RESOLUTION_FAILED` | The target module of a `defer import` did not export the requested name, or exported an incompatible type |
| `E_DEFERRED_NOT_FREESTANDING` | `defer import` used in `@mode(freestanding)` — no runtime module loader |

## §1-14 Multiline Strings

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

- Every content line must start with `P`. A content line that does not is a
  WARNING (`E_MLS_ALIGN`), not an error: the line is taken literally, keeping
  whatever leading whitespace it has, and compilation continues. A blank line is
  exempt — it has no content to align.
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
| `E_MLS_ALIGN` | Content line does not start with the alignment anchor prefix `P` — **warning**; the line is taken literally |

This rule is a warning rather than an error, and applies identically to
multiline strings and to template fences (§1-16). It was previously specified as
an error, which nothing implemented: the string lexer warned, template fences
were silent, and the `AlignmentViolation` / `TemplateAlignmentViolation`
uncatchable kinds were declared but never constructed — three severities for one
rule. Warning is what both lexers now emit, and the unreachable uncatchable kinds
have been removed.

## §1-15 Interpolated Strings

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

## §1-16 Template Fences

*(This section is normative.)*

### §1-16.1 Fence Syntax and Descriptors

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

### §1-16.2 Inline Expressions and Directives

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

### §1-16.3 Template as a Value

```
pub class Template {
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

### §1-16.4 Rendering Semantics

The rendering pipeline converts values to text when inserted via `{$ expr $}` in templates and interpolated strings. The template's `RenderContext` (carrying `language` and `format`) is passed to rendering methods. This is the ONE rendering pipeline for every text sink: the prelude `print`, `println` and `str` functions and the `to_string()` method of `Option`, `Result` and enum values render through the same table with `RenderContext(language="text", format="none")`, so a value renders identically whether it is interpolated, printed, or converted (loup#343). No sink has a private rendering. Consequently a `Result` holding `Err` reaching ANY of these sinks is a rendering error and throws `RenderError` (§1-18.1); the diagnostic renderer `repr` (below) is the explicit, never-throwing way to look at any value.

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
| `bytes` | In a template fence: **Error** (`E_TEMPLATE_BYTES`) — `bytes` insertion is a compile-time error unless converted via a filter (e.g., `{$ data \| base64 $}`). At the other sinks (`print` / `println` / `printErr`, `str`, a composite's `to_string`): its lossy UTF-8 text, exactly `b.to_string()`; nested in a composite: `b"<text>"` (see *Compiler's rule (rendering `bytes`)* below) |
| Class implementing `Renderable` | Calls `instance.render(ctx)` |
| Class NOT implementing `Renderable` | Falls through to `Any.render()` (see below) |
| `enum` variants | Auto-boxed at the render boundary; rendered via the boxed enum's `render(ctx)` method, which produces the variant name and payload (e.g., `"Circle(2.0)"`, `"Square"` for `enum Shape { Circle(float), Square }`); `Option` and `Result` are NOT rendered this way — see their own rows below |
| `Option[T]` — `Some(v)` | Renders the inner value `v` using `v`'s rendering rule |
| `Option[T]` — `None` | Renders as the empty string `""` |
| `Result[T,E]` — `Ok(v)` | Renders the inner value `v` using `v`'s rendering rule |
| `Result[T,E]` — `Err(e)` | **Runtime error** — an `Err` value reaching any sink of this pipeline (template, interpolation, `print`/`println`/`str`/`to_string`) throws `RenderError` (§1-18.1); handle it with `match`/`?` first, or use `repr` to look at it (hard fail) |
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
| `strip` | `strip` | Alias of `trim` |
| `escape_html` | `escape_html` | Alias of `escape` |
| `title` | `title` | Uppercase the first character of each whitespace-separated word, lowercase the rest; whitespace runs are preserved verbatim |
| `reverse` | `reverse` | Reverse the rendered string by Unicode codepoint |
| `length` | `length` | The rendered string's length in codepoints, itself rendered as a string |

**Diagnostic rendering: `repr`.** `repr(value: Any): string` renders a value STRUCTURALLY for diagnostics (logs, assertion messages, debugging) and never throws. It is deliberately NOT a sink of the rendering pipeline: it takes no `RenderContext`, no filter applies to it, and its output is not meant for end users. Its rules:

| Value | `repr` |
|---|---|
| `string` | quoted, with escapes: `"a\"b"` |
| `char` | the literal form: `c"x"` |
| `bytes` | `b` and its lossy UTF-8 text quoted with escapes as a `string`'s: `b"hi\n"` |
| `int`, `float`, `bool` | as the rendering pipeline (whole floats keep `.0`) |
| `Option[T]` | `Some(<repr v>)` / `None` |
| `Result[T,E]` | `Ok(<repr v>)` / `Err(<repr e>)` — never an error |
| enum variant | variant name and payload: `Circle(2.0)`, `Square` |
| `list`, `set`, `tuple`, `dict` | element-wise with `repr`: `[1, "a"]`, `{"k": 1}`, `(1, "b")` |
| class instance | `Name(field: <repr>, …)` in declaration order |
| any composite | under *Compiler's rule (render depth and cycles)*: `...` past 100 levels, and for an object already being rendered |

```loup
let r: Result[int, string] = Err("boom");
println(repr(r));   # Err("boom")
println(r);         # throws RenderError
```
| `utf8` | `utf8` | Identity; asserts the value is already UTF-8 text |
| `hex` | `hex` | Lowercase hex-encode a `bytes` value |

Most built-in filters take the **rendered string** of the piped expression. Three are typed over the value itself, because stringifying first would destroy exactly the input they need: `join` over `Iterable[T]`, and `base64`/`hex` over `bytes`.

The built-in filters are ordinary functions in the prelude rather than per-backend intrinsics, so one implementation serves every execution mode. A filter name that is not built in is left as written and resolves as a user-defined filter (below).

User-defined filters may be implemented as functions with signature `func(value: string, ...args): string` and called identically: `{$ expr | myFilter $}` or `{$ expr | myFilter(arg) $}`. The first argument is always the rendered-string result of the preceding expression or filter; additional arguments come from the call's argument list. A compile-time error is emitted if a filter function cannot be resolved (`E_FILTER_UNRESOLVED`) or if the argument count does not match (`E_FILTER_ARITY`).

| Code | Mode | Condition |
|---|---|---|
| `E_FILTER_UNRESOLVED` | All | `\| filterName` in a template fence refers to a name that does not resolve to a callable function |
| `E_FILTER_ARITY` | All | Filter function invocation argument count does not match the function's declared parameters |
| `E_TEMPLATE_BYTES` | All | `{$ byteValue $}` directly inserted into a template without a conversion filter (e.g. `\| base64`) |
| `E_TEMPLATE_AMBIGUOUS_TERMINAL` | All | More than one template terminal is in scope for a composition; the build must bring exactly one into scope (§1-23) |
| `E_TEMPLATE_PART_UNFILLED` | All | A template part in a composition chain is left unfilled; the diagnostic names the part and the chain (§1-23) |

**Default `Any.render()` behavior:**

The default `Any.render()` produces a debug-style string representation: `<TypeName>` for class instances without `Renderable`, or the result of the boxed value's own rendering if the underlying type has one. User classes can override this by implementing `Renderable`, which takes precedence over the default `Any.render()` fallback. The runtime uses `core.reflect.typeOf` to determine the boxed value's type name for the default representation.

**Compiler's rule (rendering struct and class instances).** Every lane — both interpreters and every native backend — renders a struct or class instance without `Renderable` STRUCTURALLY at every sink of this pipeline, in place of the `<TypeName>` default above: `Name(f1: v1, f2: v2)` — every instance field in declaration order, inherited fields first, each value in its NESTED form (strings quoted, whole floats `2.0`, chars bare, a `None` as `none`, collections element-wise), a field-less instance `Name()`. The name is the instance's RUNTIME class: a subclass held through its base renders as the subclass. An enum variant renders `Variant` / `Variant(p1, p2)` with nested payloads. The same forms appear wherever such a value is nested — a list element, a dict value, a tuple element, an `Option` payload, another object's field. A user-declared `to_string()` is what an explicit `x.to_string()` call runs; `println(x)` / `str(x)` / `{$ x $}` render structurally (loup#358, loup#587). A field of a type parameter renders by the instance's type argument, an `Any` field by the value it holds, and a function-typed field in canon's spelling: a named function or a non-capturing lambda as its quoted name (`FnHolder(f: "inc")`, a lambda `"__lambda_<id>"` — `<id>` is the compiler's internal ordinal for the lambda, the same on every lane for the same program: the HirId the lowering gives it, with the prelude numbered first and the program's modules chained after it, so the spelling moves when the prelude or anything declared before the lambda changes; loup#630), a capturing closure `__loup_closure()` (loup#607). The native lanes render these values through one runtime renderer and a per-program render table the emitter publishes (Volume 3 §3-2.4 *Compiler's rule (native rendering of user types)*): a type-parameter field by the instantiation the declaration names, else — like an `Any` field — by the run-time classification of the word; only a field of a type no native renderer describes (an `array`, a `decimal`, a `buffer`) is refused at build time (`E-BUILD-NATIVE`, naming the type and the field) rather than rendered as something else (ruling REND-1).

**Compiler's rule (an `Err` anywhere in a rendered value).** The `Err` row above holds for an `Err` NESTED in the rendered value as for one at the top: every sink of this pipeline (`print` / `println` / `printErr`, `str`, interpolation, `to_string()`) raises `RenderError` for the first `Err` its rendering reaches — in render order: an `Option` / `Ok` payload looked through, collection elements left to right, a dict's key then value per entry, fields in declaration order (inherited first), an enum's payload — with the message ``rendered an `Err` value: <repr of that Err>``. `Some(Err("x"))`, `[Ok(1), Err("e")]` and `Holder(r: Err("bad"))` raise alike; `repr` never raises and spells the `Err` out, and an `UnwrapError`'s payload text (not a sink) renders it as `Err(…)`. Every lane — both interpreters and every native backend — applies this one rule (ruling REND-2, loup#608: a nested `Err` rendered as `Err(…)` while a top-level one raised).

**Compiler's rule (rendering `bytes`).** On every lane — both interpreters, both Wasm hosts and every native backend — a `bytes` value reaching a sink of this pipeline other than a template fence renders as its text: the lossy UTF-8 decoding `b.to_string()` gives (§1-3, loup#501), so `println(bytesFromInts([104, 105]))` prints `hi`. An `Option[bytes]` renders its payload that way (`None` the empty string, as every `Option`). Nested in a composite — a list, set or tuple element, a dict key or value, a struct or class field, an enum or `Option` payload — it is `b"<text>"`, the nested-string form with the literal's `b` prefix (`[b"BC", b""]`, `Pk(data: b"z")`); `repr` quotes the text with a string's escapes (`b"hi\n"`). Natively a `bytes` is a `list[int]` (§1-3 *the bytes table on every lane*), so the static type decides: an `Any` word holding a `bytes` cannot be told from a `list[int]` at run time and renders as one. (Design row BREND-1 — approved by the lead, pending the maintainer: the lanes printed `Bytes(2 bytes)`, the text, `Bytes([7, 7])`, `<value>`, `[7, 7]` and, for an `Option[bytes]`, an address; a `bytes` field refused the native build.)

**Compiler's rule (render depth and cycles).** A rendering — every sink of this pipeline, `repr`, and the `Err` scan above — descends at most 100 levels of COMPOSITES: a list, set, dict or tuple, a struct or class instance, and a user enum variant with a payload are composites (the built-in `Option` and `Result` wrappers add no level). A composite with 100 composites enclosing it renders as `...` in place of its text, and so does an object that is already being rendered further up the same walk — a cyclic object graph (`a.next = b; b.next = a`) renders `Node(v: 1, next: Node(v: 2, next: ...))`, never recursing without end; the same object reached twice WITHOUT being its own ancestor renders both times. Both interpreters and every native lane count the same way, so the text is identical everywhere (ruling REND-3, loup#608: the interpreters exhausted the stack on a cycle, the natives printed `...` past 200 user-type levels only; 100 keeps the deepest walk within an 8 MB stack on every lane, the libOS core's included).

**Compiler's rule (where a template interpolation renders).** A template's `{$ expr $}` evaluates `expr` and RENDERS it when the fence is evaluated — when the `Template` value is built — and `render(scope)` / `renderWith` join the text rendered then (every lane, both interpreters and both Wasm hosts, shares this eager model). So the `RenderError` an `Err` raises at this sink (the rule above) is raised where the fence is evaluated, before any `render` call, and text ahead of the failing interpolation is never produced. Both interpreters rendered the `Err` as `Err("…")` at this one sink while every other sink raised (loup#665, design row TPL-1).

### §1-16.5 Failure Policy (Templates)

- **Hard fail by default** for evaluation errors, formatter errors, and bad descriptors.
- **Emitter try/catch (buffered):** the `try` body buffers; on failure emits nothing. An empty `catch` body swallows the error.
- `render` and `renderWith` fail if evaluation reaches `await`; use `renderAsync` or `renderWithAsync`.
- **Uncatchable:** parse/lex errors and alignment violations.

### §1-16.6 HTML Context Rendering

*(This section is normative. It applies only to `language=html` fences. Other language fences are unaffected.)*

`html` fences apply **context-aware auto-escaping** to all interpolated values. The position of a `{$ expr $}` in the HTML output determines how the rendered string is escaped before insertion. This is the primary defence against cross-site scripting (XSS) injection.

#### §1-16.6.1 HTML Context Tracking

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

#### §1-16.6.2 Text Context Escaping

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
# name = "<script>alert(1)</script>"
# Output: <div class="card">&lt;script&gt;alert(1)&lt;/script&gt;</div>
```

#### §1-16.6.3 Attribute Value Context Escaping

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

#### §1-16.6.4 URL Attribute Context

The following HTML attributes are recognised as URL-valued: `href`, `src`, `action`, `formaction`, `data`, `poster`, `cite`, `ping`, `manifest`, `itemid`.

When an interpolation appears in a URL-valued attribute, the compiler:

1. Requires the interpolated value to be of type `core.text.Url` (see §1-16.6.7). A bare `string` emits a compile-time lint warning.
2. Validates that the URL's scheme is not `javascript:` or `vbscript:`. A `javascript:` scheme is a **compile-time error** (`E_URL_SCHEME_UNSAFE`) when statically detectable. At runtime, `Url.of()` throws `UrlError` for disallowed schemes.

| Code | Mode | Condition |
|---|---|---|
| `E_URL_SCHEME_UNSAFE` | All | `Url` fence interpolation or literal uses `javascript:` or `vbscript:` scheme — statically detectable only |
3. Applies attribute encoding to the rendered URL string (same rules as §1-16.6.3).

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

#### §1-16.6.5 `<script>` and `<style>` Prohibition

Interpolations inside `<script>` or `<style>` blocks in an `html` fence are a **compile-time error** (`E_SCRIPT_STYLE_INTERPOLATION`). Encoding for JavaScript and CSS contexts is significantly more complex than HTML encoding and cannot be specified as a simple character substitution table. The correct patterns are:

| Code | Mode | Condition |
|---|---|---|
| `E_SCRIPT_STYLE_INTERPOLATION` | All | `{$ expr $}` or `{% directive %}` inside a `<script>` or `<style>` block in an `html` fence |

- Pass data from Loup to JavaScript via the structured state serialization mechanism (§2-4.7) or via `data-` attributes, then read those from JavaScript after the Wasm module loads.
- Never inject Loup values directly into inline `<script>` blocks.

```
# COMPILE-TIME ERROR:
<script>
  var name = i"{$ userName $}";
</script>

# CORRECT: data attribute + read from JS/Wasm interop
<div id="app" data-user=i"{$ userName $}"></div>
```

#### §1-16.6.6 Raw Output Opt-Out

When pre-escaped HTML must be inserted without further escaping, the `raw` filter is required:

```
{$ trustedHtmlContent | raw $}
```

The `raw` filter suppresses all context-aware escaping. The compiler emits a lint warning when `raw` is applied to a value that is not:

- A compile-time string literal.
- A value of type `SafeHtml` (see §1-16.6.7).
- A value returned by `renderToString` or another function whose declared return type is `SafeHtml`.

#### §1-16.6.7 `SafeHtml` and `Url` Types

**`SafeHtml`** is a wrapper type for pre-escaped, trusted HTML content. Values of type `SafeHtml` are inserted without escaping in text and attribute-value contexts. Defined in `lang.template`, available on all targets:

```
class SafeHtml : Any implements Renderable {
  let content: string;

  # Trusted constructor — compile-time constants and Loup rendering output only.
  # Using this with user-provided input is a security defect.
  pub static func of(trusted: string): SafeHtml;

  pub func render(ctx: RenderContext): string => content;  # no escaping
}
```

`SafeHtml` values produced by Loup's own rendering pipeline (e.g., output of `renderToString`, or a nested `View` rendered to string) are automatically typed as `SafeHtml` and pass through without double-escaping.

**`Url`** is a wrapper type for validated URLs. Defined in `core.text`, available on all targets:

```
namespace core.text;

pub class Url : Any implements Renderable {
  pub let href: string;

  # Validates scheme (rejects javascript:, vbscript:) and normalises.
  # Throws UrlError for malformed or disallowed URLs.
  pub static func of(raw: string): Url;

  # Trusted constructor — bypasses validation. Use only for compile-time string literals.
  pub static func trusted(literal: string): Url;

  pub func render(ctx: RenderContext): string => href;
}

pub class UrlError : Exception {
  pub let scheme: string?;
}
```

#### §1-16.6.8 Context Escaping in SSR Output

When `renderToString` renders a component tree containing `html` fences, the context-aware escaping in this section applies at render time. The return value of `renderToString` is typed as `SafeHtml` — it has passed through the full escaping pipeline and may be safely embedded in an outer HTML context without further escaping.

---

### §1-16.7 CSS Context Fences

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

# styles.container → ClassName("container-a3f9b2")
# styles.button    → ClassName("button-a3f9b2")
```

#### §1-16.7.1 `StyleSheet` and `ClassName`

```loup
namespace web.css;

# A scoped CSS class name string (e.g. "container-a3f9b2")
# Implements Renderable — renders as the class name string
class ClassName : Any implements Renderable {
  pub let raw: string;          # the scoped, collision-free class name
  pub func render(ctx: RenderContext): string;   # returns raw (ctx is ignored for ClassName)
  pub func toString(): string;                   # same as render(ctx), context-free
}

# The product of a css fence.
# Each top-level rule becomes a property of type ClassName.
# Use styles.ruleName to retrieve the ClassName for a rule.
class StyleSheet : Any {
  # Dynamic lookup — for programmatic access by rule name (camelCase)
  pub func get(ruleName: string): ClassName;

  # Returns the full compiled CSS string (all rules, scoped names substituted)
  pub func toCSS(): string;
}
```

**Name mangling.** The scope suffix is a 6-character hash derived from the source file path and the fence's source location. This guarantees that two components defining `.button` produce distinct class names (`button-a3f9b2` and `button-c7d412`) that do not conflict when mounted in the same document.

**Shadow-root CSS encapsulation (normative).** When a `css` fence is evaluated inside the `render()` method of a `@webcomponent` class (§2-4.10), hash-scoped class name mangling is suppressed. Instead, the compiled `StyleSheet` is attached to the element's shadow root via the Constructable Stylesheets API (`CSSStyleSheet.replace()` + `shadowRoot.adoptedStyleSheets`). The shadow root boundary provides equivalent isolation without name mangling. This rule applies only to `css` fences whose lexically enclosing function is the `render()` method of a `@webcomponent` class; all other `css` fences continue to use hash-scoped mangling.

**Rule access.** CSS selectors that are valid Loup identifiers are accessible as direct property names on the `StyleSheet` value. Selectors containing non-identifier characters (e.g. `.my-button`, `.grid-2col`) are accessed via `styles.get("myButton")` using camelCase:

```loup
let cls = styles.get("gridItem");   # for rule .grid-item
```

#### §1-16.7.2 Dynamic Values

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

Dynamic values are interpolated at the time the fence expression is evaluated. The resulting `StyleSheet` is immutable — it captures the values at evaluation time. For styles that must react to signal changes, re-evaluate the fence expression inside an `effect` or computed value (§2-4.1).

**Type safety.** Expressions inside CSS fences must evaluate to `string`, `int`, `float`, or `float32`. Values of other types are a compile-time error. `int` and `float` values are rendered without units — append the unit string explicitly: `{$ value $}px`.

#### §1-16.7.3 Injection into Documents and Components

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

#### §1-16.7.4 Media Queries and Pseudo-Selectors

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

# styles.hero is a ClassName — the @media and @keyframes are in toCSS() output
```

#### §1-16.7.5 Availability

`css` fences are available in `@mode(web.scripted)`, `@mode(web.compiled)`, `@mode(host.scripted)`, `@mode(host.dual)`, and `@mode(host.native)`. They are **not available** in `@mode(freestanding)` — there is no UI runtime (`E_FREESTANDING_FENCE`).

| Target | Behavior |
|---|---|
| `browser` | `StyleSheet.toCSS()` is injected into a `<style>` element by the Loup runtime |
| `service` / SSR | `toCSS()` is inlined in the SSR `<style>` block |
| `native` | `toCSS()` returns the CSS string, as on `cli`. *(Changed in v1.21: `StyleSheet` was passed to `ui.desktop` as a style descriptor translated to a platform rendering model. No desktop backend has one any more (§2-4.8); the UI framework styles through theme roles, `loup-ui-controls-theme.md` §C.3.)* |
| `cli` | `css` fences are valid but `toCSS()` simply returns the CSS string — no DOM is available |
| `freestanding` | Not available — compile-time error (`E_FREESTANDING_FENCE`) |


---

### §1-16.8 GPU Shader Fence Descriptors

*(This section is normative. Applies to `@mode(host.native)`, `@mode(host.dual)`, and `@mode(web.compiled)`/`@mode(web.scripted)` targets where WebGPU is available.)*

Three additional language descriptors extend the template fence system (§1-16.1) for GPU shader authoring — both compute kernels and graphics pipeline stages (vertex, fragment). The fence body is a shader program in the target shading language; `{$ expr $}` interpolations inject Loup compile-time constant expressions as shader constants.

**Fence value type.** A `wgsl`, `metal`, or `glsl` fence evaluates to a `string` containing the shader source after constant substitution. The fence-produced source flows into one of two compilation paths depending on the shader's role:

- **Compute kernels** are compiled via `native.gpu.GpuKernel.compile(source, constants, label)` (§21.30) into a `GpuKernel` for dispatch through `native.gpu.dispatch(...)`.
- **Render pipeline stages** are compiled via `native.webgpu.GpuDevice.createShaderModule(source)` (§21.29) into a `GpuShaderModule` for use in a `GpuRenderPipelineDescriptor` as either the `vertex.module` or `fragment.module` field.

A single fence body may declare multiple entry points (`@compute`, `@vertex`, `@fragment` in WGSL; analogous in Metal and GLSL) and feed both paths — the same source string is acceptable to both consumers; the consumer selects the entry point at pipeline-creation time.

#### §1-16.8.1 `wgsl` — WebGPU Shading Language

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
- The fence body must be valid WGSL. Syntax errors in the fence body are reported as compile-time errors when the containing file is processed by `loup build --check`; at runtime, `GpuKernel.compile` and `GpuDevice.createShaderModule` throw `GpuCompileError` on shader compilation failure.
- Multiple entry points (`@compute`, `@vertex`, `@fragment`) are permitted in a single fence; consumers select the entry point at pipeline-creation time.

**Render-shader example.** The same fence syntax produces source for a vertex/fragment pipeline. The fence value flows into `device.createShaderModule(...)` rather than `GpuKernel.compile(...)`:

```loup
from native.webgpu import (GpuDevice, GpuShaderModule);

let shader = ```(wgsl):(none)
  struct VsOut {
    @builtin(position) clip: vec4f,
    @location(0)        color: vec3f,
  }

  @vertex
  fn vs_main(@location(0) pos: vec3f, @location(1) col: vec3f) -> VsOut {
    var out: VsOut;
    out.clip  = vec4f(pos, 1.0);
    out.color = col;
    return out;
  }

  @fragment
  fn fs_main(in: VsOut) -> @location(0) vec4f {
    return vec4f(in.color, 1.0);
  }
```;

let module = device.createShaderModule(shader);
# module is used in GpuRenderPipelineDescriptor.vertex.module and
# .fragment.module — see §21.29.
```

| Code | Mode | Condition |
|---|---|---|
| `E_GPU_FENCE_RUNTIME` | All | `{$ expr $}` interpolation inside a GPU shader fence references a non-compile-time-constant value |
| `E_GPU_FENCE_TARGET` | All | `metal` fence used on a non-macOS/iOS target; or `glsl`/`stablehlo`/`hlo` on an unsupported target |

#### §1-16.8.2 `metal` — Metal Shading Language

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

#### §1-16.8.3 `glsl` — OpenGL/Vulkan Shader

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
- The `glsl` descriptor targets Vulkan compute and graphics shaders on Linux, Windows, and Android native targets.
- GLSL version must be `#version 450` or higher (Vulkan GLSL).
- `{$ expr $}` interpolations are valid for compile-time integer constants only.
- Graphics shaders (vertex, fragment, geometry, tessellation control, tessellation evaluation) follow the same fence-value model as compute shaders: the resulting source is passed to `device.createShaderModule(source)` (§21.29) rather than `GpuKernel.compile`. The pipeline stage is implied by the GLSL `#pragma shader_stage(...)` directive or by separating stages across distinct fences.

#### §1-16.8.4 Fence Body Compilation Model

GPU shader fences follow the same multi-backtick nesting rules as all other fences (§1-16.1). The fence value is a `string` carrying the shader source after constant substitution. Two compilation sinks are defined; the fence value is consumed by exactly one of them per use site:

| Sink | Defined in | Use |
|---|---|---|
| `native.gpu.GpuKernel.compile(source, constants, label)` | §21.30 | Compute kernels for dispatch via `native.gpu.dispatch(...)`. The `constants` argument is a `dict[string, Any]` whose values must be compile-time constants; values are documented for diagnostic purposes only — the substitution itself was already performed by the fence at the call site. |
| `native.webgpu.GpuDevice.createShaderModule(source)` | §21.29 | Vertex, fragment, and other graphics stages for use in a `GpuRenderPipelineDescriptor`. Compile-time constants flow through the fence body in the same way; stage selection occurs in the descriptor's `entryPoint` field, not at module construction. |

The fence interpolations `{$ expr $}` are evaluated at the time the fence expression is evaluated and substituted into the shader source string before it is passed to either sink. This allows loop unrolling counts, workgroup sizes, vertex attribute counts, and compile-time feature flags to be expressed as Loup values rather than magic numbers in the shader source.

The same fence can serve both sinks when it declares multiple entry points. For example, a single WGSL fence may contain `@compute`, `@vertex`, and `@fragment` entries; the resulting source string can be passed to `GpuKernel.compile` (selecting the compute entry by name) for kernel dispatch, and separately to `device.createShaderModule` for use as the vertex and fragment stages of a render pipeline. Loup does not duplicate the source string in this case; the call sites pass the same `string` value.


---

## §1-17 Macros and Metaprogramming

*(This section is normative.)*

Loup provides a hygienic macro system for compile-time code generation:

**Hygiene.** Macro-introduced bindings do not capture or shadow caller bindings. The macro body has its own scope. Spliced parameters (`${param}`) are substituted as syntactic AST fragments before name resolution — the caller's names are never visible inside the macro body unless explicitly spliced.

*Compiler's rule (hygiene).* Each expansion renames every binding the `quote` body introduces — `let`/`var`/`const`, function and lambda parameters, loop, `catch`, `with` and destructuring bindings, and lower-case match-pattern bindings (a capitalized identifier pattern names a variant) — to `__m<N>_<name>`, where `N` numbers the module's expansions in the order they begin (1, 2, …; an invocation inside an argument is expanded where, and each time in a new category, the argument is spliced), together with every reference that resolves, lexically within the quote, to one of those bindings. The renaming is deterministic and identical on every compiler lane; diagnostics print the names as the macro spells them. The names of declarations a quote introduces (`func`, `class`, `struct`, `enum`, `interface`, type alias) are the macro's output and are not renamed. A spliced argument is the caller's code: it is never renamed, and it is evaluated as many times as it is spliced.

*Compiler's rule (free names).* A name the quote uses but does not bind (a free name — in an expression, or in a type annotation, `catch` clause, cast or enum-qualified pattern) resolves in the macro's HOME module, the module that declares it: the macro body's own scope. For a macro declared in the module being expanded, the home module is where the expansion lies, so that module's names are visible. For an imported macro, a free name its home module declares (a `func`, `class`, `struct`, `enum`, `interface`, type alias or module-level binding) or imports is imported into the expansion site's module on the macro's behalf — one `import` per module the expansion needs, from the home module (or from the module the home module imported the name from), inserted after the module's last top-level import, each name under its own spelling, or as `__mh<K>_<name>` (K = 1, 2, … in first-use order) when the expansion site's module already binds that spelling; so a `pub macro` that calls a helper of its own module works in a module that never imports the helper, and neither module's name captures the other's. The import path is composed along the chain of imports that reached the macro, identically on every compiler lane. A home declaration that is not `pub` cannot be imported, so an expansion that needs one is `E_MACRO_TYPE_ERROR` at the expansion site (declare it `pub`). A free name its home module does not bind (a built-in such as `println`) keeps its spelling. The caller's names stay invisible: a free name that keeps a spelling the expansion site's enclosing function binds as a local would see that local, and so would a built-in name an imported macro uses that the expansion site's module binds at module level — both are rejected with `E_MACRO_TYPE_ERROR` at the expansion site (pass the value as an argument). Diagnostics print `__mh<K>_<name>` as `<name>`.

**Expansion timing.** Macros are expanded at compile time before type-checking. Macro output must be well-typed; ill-typed macro output is `E_MACRO_TYPE_ERROR` at the expansion site.

*Compiler's rule (expansion site).* Expansion runs on the syntax tree before name resolution, so an expansion lowers exactly as the equivalent hand-written code would. Every node a quote contributes carries the span of its invocation `name!(…)` (a spliced argument keeps its own), so any diagnostic inside an expansion — and a runtime stack frame in expanded code — points at the expansion site. A type-checker error located on quote-contributed code is reported as `E_MACRO_TYPE_ERROR` with the message ``in the expansion of `name!`: …``. A mode restriction keeps its own code (below): a `throw` a macro emits in `@mode(freestanding)` is `E_FREESTANDING_EXCEPTIONS` at the expansion site.

**Macros and const evaluation are different phases and do not meet.** A macro
constructs SYNTAX: it runs at expansion time, before name resolution, and its output is
source that is then checked like any other. Const evaluation (§1-7.1, §1-6.3) computes
VALUES: it runs after type checking, over the closed const-evaluation feature set, and its
output is a value or a selected branch. Neither can invoke the other. A macro body may not
call a `const func` to obtain a value (a `quote` splice is an AST node, not a computed
result), and a `const func` body may not expand a macro (macro invocations are gone before
const evaluation begins; one that survives to it is `E_CONST_FORBIDDEN_CONSTRUCT`). A
macro MAY of course emit source that contains `const` bindings, `const func`s or `if
const` — that source is evaluated in the ordinary phase, exactly as if the author had
typed it.

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

**Quasiquote AST categories.** A `quote` block may contain any syntactically valid Loup constructs: statements, expressions, declarations, and type annotations. Splice positions (`${param}`) are resolved by the macro expander using the category of the surrounding syntax — a splice in expression position must receive an expression, a splice in type position must receive a type, and so on. The splice fixes the category a position requires, but macro parameters are untyped identifiers, so the category of what fills it is known only when the macro is invoked. A category mismatch is therefore `E_MACRO_SPLICE_CATEGORY` at the expansion site — the `name!(...)` invocation whose argument does not fit — and the diagnostic identifies the `${param}` splice it failed to fill. A parameter spliced into positions of different categories is not by itself an error; each argument is checked against every position its parameter is spliced into.

*(Ruling MAC-1.)* A macro argument is a balanced **token tree** (§1-19.11), not an expression: it is parsed only at expansion, once for each category its parameter is spliced into — as an expression, a type or a statement (a statement may be a declaration) — and it must parse completely in that category. So every type is expressible as an argument: `box_of!(fn(int): int, f)`, `box_of!(int?, None)` (the `Option` type, not `?`-propagation), `box_of!(dict[string, list[int]], d)`.

*Compiler's rule (categories).* A `quote` body is an **expression body** when it holds exactly one expression statement with no terminating `;` (`quote { ${a} * ${a} }`); otherwise it is a **statement list**. An `if` or `match` written as the whole body is a statement — parenthesize it (`quote { (if (${c}) { ${a} } else { ${b} }) }`) to make an expression body. An invocation that is a whole expression statement (`assert_eq!(a, b);`) is in **statement position**: the expansion's statements take the invocation's place in the enclosing statement list (an expression body becomes one expression statement). Any other invocation is in **expression position** and needs an expression body; a statement-list macro there is `E_MACRO_SPLICE_CATEGORY` at the invocation (the invocation position cannot receive the node the macro produces). A spliced argument is substituted as a parsed node, so precedence is structural (`${x} * ${x}` with `x` = `1 + 2` is `(1 + 2) * (1 + 2)`). A splice that is a whole statement (`${s};`) is a statement position: the argument is parsed as one statement (an expression statement, an assignment, a declaration). An expression position accepts an assignment (`x = e`), as call arguments do. The `E_MACRO_SPLICE_CATEGORY` diagnostic names the argument, the macro and the `${param}` splice; a parameter spliced several times in one category is parsed once. A splice `${p}` whose `p` is not a parameter of its macro, and an invocation `name!(…)` of a name that is no macro in scope, are `E_MACRO_UNDEFINED`. A splice outside a `quote` body — including in an argument written outside one — is a syntax error.

*Compiler's rule (name splices).* A splice where the syntax requires a NAME — the name a `let`, `var` or `const` binds, a loop or destructuring binding (`for (${x} in …)`, `let (${a}, ${b}) = …`), or the declared name of a `func`, `class`, `struct` or `enum` (`func ${f}(…)`) — is a fourth category, a name position: the argument must be exactly one identifier, else `E_MACRO_SPLICE_CATEGORY`. The name is the CALLER's, not the macro's: hygiene does not rename it, so after a statement-position expansion the caller uses it (`define!(answer, 42); println(answer);`), and a free name of the quote with the same spelling would see it, which is rejected as above. An argument written inside another macro's `quote` is that quote's name, renamed with that quote's bindings. A splice in any other name position (a parameter, a field, member or method name, a label) is a syntax error. A whole declaration is spliced in statement position (`quote { ${d}; }` — ruling MAC-1: a statement may be a declaration); the body of a `class`, `struct`, `enum` or `interface` holds no splice position.

**Parameters and arity.** Macro parameters are positional identifiers. Macros do not support default values, rest parameters, or keyword arguments. Invoking a macro with the wrong number of arguments is a compile-time error (`E_MACRO_ARITY`).

*(Ruling MAC-1.)* The arguments of `name!(…)` are counted as its top-level token trees: the invocation's parenthesised contents split at the commas that are outside every `()`, `[]` and `{}` (a comma inside `dict[K, V]`, a call, a lambda body or a string literal does not split); a trailing comma is allowed, an empty argument is not. An argument that is never spliced is never parsed.

| Code | Mode | Condition |
|---|---|---|
| `E_MACRO_TYPE_ERROR` | All | Macro expansion produces ill-typed output — type error at the expansion call site |
| `E_MACRO_SPLICE_CATEGORY` | All | `${param}` splice position category (expression, type, statement) does not match the AST node being spliced — reported at the expansion site |
| `E_MACRO_ARITY` | All | Macro invoked with a different number of arguments than declared parameters |
| `E_MACRO_RECURSIVE` | All | Macro directly or indirectly invokes itself — recursive macros are prohibited |
| `E_MACRO_UNDEFINED` | All | *(Compiler's rule.)* `name!(…)` names no macro in scope, or `${p}` names no parameter of its macro |

**Limitations.**
- Macros cannot perform I/O, import modules, or access runtime state.
- Macros cannot be recursive (`E_MACRO_RECURSIVE`; a macro may not invoke itself, directly or indirectly).
- Macros operate on syntactic structure only; they cannot inspect types of their arguments.
- `quote` bodies may not contain `await` or `yield` at the top level (they may appear inside lambdas within the quote body).

*Compiler's rule (declaration checks).* Every macro declaration is checked once, at the declaration, whether or not it is invoked: recursion is detected on the graph of the macro invocations the bodies contain and reported as `E_MACRO_RECURSIVE` at each macro on a cycle; a quote body is neither an async nor a generator context, so a top-level `await` (including `await group` and `for await`) is `E_AWAIT_NOT_ASYNC` and a top-level `yield` is `E_YIELD_OUTSIDE_GEN` (a lambda or function declared inside the quote is its own context). An invocation of a macro whose declaration is in error expands to nothing further (no cascade).

**Mode availability.** Macro declarations (`macro`, `pub macro`) and invocations (`name!(...)`) are compile-time features available in all six execution modes. The macro is expanded before type-checking; the expanded output must conform to the restrictions of the target mode. For example, a macro that expands to `throw SomeError(...)` will produce a compile-time error when expanded in a `@mode(freestanding)` file because exceptions are unavailable there.

**Scope and export.** Macro definitions are scoped to the module where they are declared. Export a macro with `pub macro name(...) { ... }`. Consumers import macro names with the standard import syntax; the `!` invocation suffix is used at the call site.

*Compiler's rule (scope).* A macro is declared at module top level (a macro declaration inside a body is an error); a module's macros may be invoked before their declaration. An imported `pub macro` is named in an ordinary `from m import (name)` or `(name as alias)` list; the import itself remains a module dependency. Macros travel like the module system's other names (§1-13): a module exports the `pub macro`s it declares and the macros it re-exports with `pub from m import (name)`, followed transitively through any chain of re-exports; a plain import does not re-export, so a macro a module merely imports is not visible through it, and importing a macro that is not `pub` fails like importing any unexported name. A macro's body resolves the macros IT invokes in its home module — among those the module declares, private ones included, and those it imports — however many modules away the invocation is.

*Compiler's rule (const).* A `const func` body may invoke a macro — the invocation is expanded before const evaluation begins, like every other — and a macro body may call a `const func` (ordinary syntax). An invocation can survive to a `const func` body only when it names no macro in a module that declares and imports none; it is then `E_CONST_FORBIDDEN_CONSTRUCT` there, besides `E_MACRO_UNDEFINED`.

**Rules:**

- Macros are declared with `macro name(params) { ... }` syntax.
- Macros are invoked with `name!(args)` syntax (the `!` distinguishes macro invocations from function calls).
- Macros are a separate compilation phase and cannot perform I/O or runtime operations.
- Macro definitions are scoped to the module where they are declared and can be exported with `pub`.
- The formal grammar for macro declarations and invocations is in §1-19.11.

---

## §1-18 Failure Policy

*(This section is normative. This section applies to all modes except `@mode(freestanding)` — specifically `@mode(web.scripted)`, `@mode(web.compiled)`, `@mode(host.scripted)`, `@mode(host.dual)`, and `@mode(host.native)`. In `@mode(freestanding)`, the exception system is unavailable — `throw`, `try`, and `catch` are compile-time errors (`E_FREESTANDING_EXCEPTIONS`). Freestanding failure handling is specified in §3-3.6 (`@panic_handler` and `--panic` policy).)*

This section consolidates all failure behaviors across the Loup language.

### §1-18.1 Exception Hierarchy

All exception types extend a root `BaseException` class. The catchable subset extends `Exception`, which itself extends `BaseException`. Not all exceptional conditions are errors — `SystemExit` is a deliberate process termination, `KeyboardInterrupt` is an external signal, and `GeneratorExit` is a generator lifecycle event. These extend `BaseException` directly and are not caught by `catch (Exception)`.

**Built-in availability (normative).** `BaseException` and `Exception` are compiler-provided built-in types: they resolve in every module — including a compiled `@compiled` / `@mode(host.native)` entry file — without an import. A user error class extends `Exception` (or, for the non-`Exception` subset, `BaseException`) directly: `class MyError : Exception { ... }`. The three base properties `message: string`, `cause: Option[Any]`, and `stackTrace` are inherited from `BaseException` and need not (and must not) be redeclared by subclasses; an error class that extends `Exception` therefore satisfies the §1-18.1 base-property requirement automatically. The element type of the inherited `stackTrace` is `StackFrame` where that stdlib type is in scope and an implementation-provided opaque frame type otherwise (a compiled native target need not surface `StackFrame`). A class that extends `Exception` is recognized as throwable and catchable by name; the recognition does not depend on importing or redeclaring the base.

*Compiler's rule (`stackTrace`, loup#771).* `stackTrace` reads as a `list[StackFrame]`, innermost frame first, captured when the exception is CONSTRUCTED — a built-in fault at its raise site, a `throw KindError(msg)` and a user exception class at the construction expression. `StackFrame` is a built-in class (Appendix C) resolvable without an import, with the read-only fields `file: string`, `line: int`, `column: int` and `function: Option[string]` (the enclosing callable's name, `<main>` for module code). The interpreters list the frames; a native target answers an empty list (the sentence above: it need not surface frames). Volume 4's serialized `StackFrame` (§4-1.9) is the symbolic transfer form, not this class.

*Compiler's rule (a built-in exception's own fields, loup#709).* A built-in exception class's own fields follow the three inherited ones. `IoError.code` is the platform error number of the failure (`errno` on POSIX — `2` for a missing file; the `(os error N)` its message ends with) and `0` when the failure carries none — so the number, and the host's text before it, can differ between hosts for one failure (`readText` of a directory is `EISDIR` 21 on Linux and macOS, `EACCES` 13 in a Windows native program, §3-2.1); `RuntimeConfigError.field` names the refused configuration field. A user subclass of a built-in exception inherits its own fields with the three base ones (`class ConfigMissing : IoError {}` has `code`, `0` until something sets it).

*Compiler's rule (an fs failure is an `IoError`).* A failing `io.fs` read or write — `readText`, `writeText`, `readBytes`, `writeBytes`, and `readText` of a directory — raises `IoError` on every lane, catchable by `catch (IoError)` and `catch (Exception)` like any `Exception`, with the message `<op> failed on '<path>': <host text> (os error N)` and `code` = `N`. `<op>` is `read_text`, `write_text`, `read` (`readBytes`) or `write` (`writeBytes`). The self-hosted interpreter used to die with its own runtime's report instead (it runs on the native runtime, which could only report the failure — §1-18.4), so no guest `catch` saw it; a byte read of a missing file answered empty bytes there, a byte write into a missing directory went on silently on it and on the native lanes, and a directory read as `""` there and natively.

**Serialization contract.** All `BaseException` subclasses have a normative serialization contract (§4-1.9). Every `BaseException` is implicitly `@polymorphic` — when serialized via `Serializable`, its dynamic type is preserved via the type URI mechanism. Receivers that do not recognize the incoming type URI reconstruct the exception as a `RemoteException` carrying the original URI, message, cause chain, and symbolic stack trace. This design guarantees that exceptions crossing process or language boundaries never silently lose their identity, and that deserialization of unknown exception types can never execute arbitrary code.

```
class BaseException : Any {
  pub let message: string;
  pub let cause: Option[Any];
  pub let stackTrace: list[StackFrame];
}

class Exception : BaseException {}

# RemoteException — see §4-1.9. Reconstructed from a serialized exception
# whose type URI is not registered as Deserializable on the receiver.
# Carries the originating URI, message, cause chain, and symbolic stack
# trace for diagnostic purposes without exposing a code-execution surface.
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

# Discriminant for LifetimeError — identifies which runtime check triggered.
enum LifetimeErrorKind {
  TaskEscapedScope;     # a spawned task reference outlived its await-group scope
  UseAfterFree;         # an unowned field was accessed after its referent was freed
  BridgeDeallocated;    # del was called on a GC↔ARC bridge wrapper; subsequent access throws LifetimeError
}

# Simple marker exceptions — no extra fields beyond BaseException
class TypeError            : Exception {}  # type mismatch at runtime (as, as?, mismatched overload)
class MatchError           : Exception {}  # non-exhaustive match reached end without matching
class AssertionError       : Exception {}  # assert statement failed
class DestructureError     : Exception {}  # list/dict destructure failed (length or key mismatch)
class IndexError           : Exception {}  # sequence index out of range
class KeyError             : Exception {}  # dict key not found
class UnwrapError          : Exception {}  # unwrap()/expect() on None or Err (§1-5.6)
class CancellationError    : Exception {}  # task cancelled via TaskGroup cancellation
class NumericOverflowError : Exception {}  # fixed-width integer overflow in scripted/compiled mode
class IntegerDivisionError : Exception {}  # integer division or modulo by zero (§1-5.1)
class IoError              : Exception { pub let code: int; }
class TimeoutError         : Exception {}  # operation timed out (spawnBlocking, etc.)
class RuntimeConfigError   : Exception { pub let field: string; }  # runtime.configure() called after first await
class CapabilityError      : Exception { pub let capability: string; }  # unavailable capability object called
class FfiTypeError         : Exception {}  # FFI boundary type mismatch (extern js / @jsexport)
class WsNetworkError       : Exception {}  # WebSocket network failure
class WsStateError         : Exception {}  # WebSocket operation in wrong connection state

# Root class for runtime-environment faults — distinct from user-domain errors.
# Subclasses include stack overflow, task queue exhaustion, null FFI handle,
# misalignment, and freestanding allocator exhaustion.
class RuntimeError         : Exception {}

# Raised by the runtime on lifetime-violation detection. Inspect `.kind` to
# distinguish the specific check that triggered. See §3-2.4.14, §3-2.5, §1-18.3.
class LifetimeError        : Exception { pub let kind: LifetimeErrorKind; }

# Time-travel protocol (§2-5.3). ReplayDiverged: a replay requests a value the recording does not hold, an output or
# a checkpoint differs, or a secret substitution changes control flow. TraceError: a trace's source identity differs,
# the file is corrupt or of an unsupported version, or recording would miss a seam. ForkRefused: a fork reaches an
# unmatched effect with side effects that is neither stubbed nor allow-listed.
enum DivergenceReason { Input; Output; State; Secret; }
enum TraceErrorKind   { Incompatible; Format; Unsupported; }
class ReplayDiverged : Exception {
  pub let reason: DivergenceReason;
  pub let step: int;
  pub let anchor: string;
  pub let expected: string;
  pub let actual: string;
}
class TraceError  : Exception { pub let kind: TraceErrorKind; pub let detail: string; }
class ForkRefused : Exception { pub let callee: string; }

class StackOverflowError : RuntimeError {}

class TaskQueueFullError : RuntimeError {
  pub let queueDepth: int;    # configured maxTaskQueueDepth at time of throw
}

class NullHandleError : RuntimeError {
  pub let functionName: string;   # extern native function that returned null
}

class AlignmentError : RuntimeError {
  pub let requiredAlign: int;
  pub let actualAlign: int;
}

class AllocError : RuntimeError {
  pub let requestedSize: uint64;
  pub let requestedAlign: uint64;
}

# v1.20 numerical exceptions — see also §21.9.6 and §21.10.5
class ComplexArithmeticError : Exception {
  pub let operation: string;     # e.g., "clog of zero"
  pub let argument:  string;     # canonical decimal repr of the offending value
}

class ArrayShapeError : Exception {
  pub let operation:  string;     # operation that failed (e.g., "reshape", "concat")
  pub let actual:     list[int];  # shape encountered
  pub let expected:   string;     # human-readable expectation
  pub let kind:       ArrayShapeErrorKind;
}

class ArrayIndexError : Exception {
  pub let arrayShape: list[int];
  pub let index:      list[int];   # attempted index
  pub let axis:       Option[int]; # None if index has wrong arity
}

enum ArrayShapeErrorKind {
  Mismatch;            # operands have non-conformant shapes
  InvalidRank;         # rank requested out of range
  EmptyReduction;      # reduction on an empty array
  InvalidAxis;         # axis index out of range
  InvalidPermutation;  # permuteAxes argument is not a valid permutation
  DimensionInvalid;    # shape contains a negative dimension (zero is allowed; produces empty array)
}

# Thrown when a `for concurrent` (§2-1.11) iteration body raises an
# exception. The iteration's exception is attached as `cause`. The first
# iteration to throw determines the cause; later iterations may complete,
# continue, or be cancelled at the implementation's discretion.
class ConcurrentIterationError : Exception {
  pub let iterationIndex: list[int];   # multi-axis index tuple of the offending iteration
}

class StackFrame : Any {
  pub let file: string;
  pub let line: int;
  pub let column: int;
  pub let function: Option[string];
}

pub class ModuleLoadError : Exception {
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
        │   ├── TaskQueueFullError              (task queue depth limit exceeded, §2-1.3/§2-5.1)
        │   ├── NullHandleError                 (NativeHandle return was null, §2-3.4)
        │   ├── AlignmentError                  (reinterpretChecked[T,U] alignment mismatch, §3-3.18)
        │   └── AllocError                      (allocator returned None, §3-3.16)
        ├── AssertionError
        ├── RuntimeConfigError
        ├── BlockingTimeoutError                (defined in §2-1.9.3)
        ├── WsNetworkError
        ├── WsStateError
        ├── UrlError                             (disallowed URL scheme or malformed URL, §1-16.6.4)
        ├── WorkerTerminatedError                 (send/receive on already-terminated ScriptWorker, §2-1.10.2)
        ├── WorkerPanicError                      (ScriptWorker exited via unhandled exception; carries `message` and `stack`, §2-1.10.2)
        ├── ValueError                              (value semantically invalid for the operation, e.g. slice step=0)
        ├── GpuCompileError                         (shader/kernel compilation failed, §1-16.8)
        ├── WorkerTransferError                   (runtime serialization failure during channel transfer or spawnBlocking, §2-1.10.4)
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

### §1-18.2 User-Defined Exceptions

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

**The built-in constructor (normative).** `BaseException`, `Exception` and the built-in exception classes have exactly one constructor, `new(message: string = "")`: constructing one directly takes zero or one argument (`Exception()`, `ValueError("bad")`, `IoError("bad")` — whose own `code` reads `0`, §1-18.1), and so does `super(...)` from a user exception's constructor, as in the example above. `super(message)` sets `message`. Any other arity, or a non-`string` argument, is `E_SUPER_WRONG_ARGS` at the `super(...)` call. The same holds through user exception classes that declare no constructor of their own: with `class AppError : Exception {}`, a subclass of `AppError` reaches the built-in constructor. A declared constructor anywhere on the way up decides instead — `super(...)` then matches ITS signature (§1-8.4). A user constructor that neither calls `super(message)` nor assigns `this.message` leaves `message` the empty string; `message` is a `string`, never `None`.

**A constructor is not an override.** A subclass's constructor may take any parameters it needs, whatever its superclass's constructor takes — `NotFoundError(resource)` above, under `AppError(message, code)`. The method-override rules of §1-8.3.1 (matching arity, `override`) do not apply to constructors under either spelling, `new(...)` or the legacy `func constructor(...)`.

Throwing a value that does not extend `BaseException` is a compile-time error (`E_THROW_NOT_EXCEPTION`).

| Code | Mode | Condition |
|---|---|---|
| `E_THROW_NOT_EXCEPTION` | All | `throw expr` where `expr` has a type that does not extend `BaseException` |

Users MAY extend `BaseException` directly for exceptions that should not be caught by `catch (Exception)`. The compiler SHALL emit a warning when a user-defined type extends `BaseException` directly (rather than `Exception`), advising that the type will not be caught by generic exception handlers.

### §1-18.3 Exception Categories

**Compile-time errors (uncatchable — not part of the exception hierarchy):**
- Parse/lex errors
- Type errors (static)
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
- `IntegerDivisionError` — integer division or modulo by zero (scripted/Wasm mode and checked native paths)
- `UnwrapError` — `unwrap()` or `expect()` called on `Option.None`, or `unwrap()` on `Result.Err` (§1-5.6)
- `RenderError` — a `Result.Err` value reached a rendering sink: a template, interpolation, `print`/`println`/`str`, or `to_string` (§1-16.4); use `match`/`?` first, or `repr` to inspect it
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
- `WorkerTerminatedError` — `send()` called on a `ScriptWorker` that has already exited (§2-1.10.2)
- `WorkerPanicError` — `ScriptWorker.join()` awaited a worker that threw an unhandled exception; carries `message: string` and `stack: Option[string]` (§2-1.10.2)
- `WorkerTransferError` — runtime-level serialization failure while transferring a value across a `ScriptWorker` channel or through `spawnBlocking` (e.g. a cycle in a `Sendable` class) (§2-1.10.4)
- `ComplexArithmeticError` — mathematically-undefined complex transcendental (e.g., `clog(0)`, `casin` at branch-cut endpoints); carries `operation: string`, `argument: string` (§21.9.6)
- `ArrayShapeError` — operation on `array[T, rank]` violates shape contract (mismatch, invalid rank, empty reduction, invalid axis, invalid permutation, invalid dimension); carries `kind: ArrayShapeErrorKind` and operation-specific fields (§21.10.5)
- `ArrayIndexError` — out-of-range indexing on `array[T, rank]`; carries `arrayShape: list[int]`, `index: list[int]`, `axis: Option[int]` (§21.10.5)
- `ConcurrentIterationError` — `for concurrent` (§2-1.11) iteration body raised an exception; carries `iterationIndex: list[int]` and the original exception as `cause`

**Runtime exceptions NOT caught by `catch (Exception)` (BaseException-only):**
- `SystemExit` — deliberate process exit request via `runtime.exit(code)`. Carries `code: int`.
- `KeyboardInterrupt` — external interrupt signal (SIGINT). Carries `signal: int`.
- `GeneratorExit` — generator/iterator cleanup when closed before exhaustion.
- `BaseExceptionGroup` — group of exceptions that includes at least one `BaseException`-only subtype.

**Result-based errors (propagated via `?`):**
- Typed, recoverable errors using `Result[T, E]`.
- The `?` operator converts between error types via `From[E]`.

### §1-18.4 Exception Propagation Rules

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
    defer print("D: outer defer");     # runs last — belongs to func scope
    try {
      defer print("D: try-block defer"); # runs before catch — inside try block
      throw IoError("fail");
    } catch (IoError as err) {
      print("C: catch");               # runs after try-block defer
    } finally {
      print("F: finally");             # runs after catch
    }
    # output order: "D: try-block defer", "C: catch", "F: finally", "D: outer defer"
  }
  ```
  If a `defer` action itself throws, the exception propagates out of the scope exit
  and is not caught by any `catch` clause in the same `try` statement — it propagates
  to the enclosing scope. The original exception (if any) is attached as `.cause`.
- In structured concurrency, a failing child cancels siblings; `CancellationError` propagates to the group scope.
- Exception chaining via `cause` preserves the full error context.
- The runtime's default error reporting prints the full cause chain.

**Guarded faults in compilation modes without handler machinery.** Several
operations are defined to throw rather than to fault: integer `/` and `%` by zero
(`IntegerDivisionError`, §1-3.7), an out-of-range sequence index (`IndexError`),
a missing dict key (`KeyError`), `unwrap()`/`expect()` on `None`
(`UnwrapError`, §1-5.6), and a slice step of zero (`ValueError`, §1-5.3). A
compiled module that declares no handler has nothing
to divert to, and an implementation MAY therefore be unable to make these
catchable. It SHALL NOT use that as licence to omit the check. In such a module
the operation SHALL still fail, deterministically: the implementation SHALL
terminate the program with a non-zero exit status and SHALL report the same
message on the standard error stream that the catchable form would carry, so the
diagnosis does not depend on the compilation mode.

In particular an implementation SHALL NOT fabricate a value for a failed
operation, and SHALL NOT rest the failure on undefined behaviour in an underlying
code generator — a hardware fault that the optimiser is entitled to assume cannot
happen is not a fault path. Where the module DOES declare handler machinery,
these operations throw and are catchable as normal.

*Compiler's rule (the native uncaught report).* On the native lanes — every AOT
binary, on every backend and foundation: Stage0's LLVM, Cranelift and hosted C
backends, and the self-hosted emitter over the C runtime or the Loup libOS, bare
metal included where the target has a console — an exception that escapes
`main`, and a guarded fault in a module without handler machinery, end the
process with status 1 — the status every delivery path gives an uncaught
exception (§1-2.4.5, ruling EXIT-1) — after writing exactly one line to the
standard error stream: `<Class>: <message>`, the exception's class name and its
`message`. The
line is the same whether or not the program happens to carry handler machinery
elsewhere, and on a lane whose runtime is folded into every program (the libOS,
which makes every program handler-bearing) it is the same line as on the others.
A target with no console at all reports by status alone. The interpreters and the
Wasm runners report `Uncaught <Class>: <message>` (the interpreters add the stack
trace) and exit 1 (EXIT-1). The same holds for a Loup exception the native
runtime can only report, not raise: the line and status 1. Status 134
(the SIGABRT status) is left to aborts that are not Loup exceptions: the
runtime's allocation failure, a failed thread creation, a missing C-library
symbol, and a foreign (C++) exception that unwinds past the last frame
(loup-llbe's unwinder) — none of them has a class or a `message` to report.
(Ruling UNC-1, loup#590: the libOS lane's `_start` exited 134 in silence, and
the C runtime's lanes printed `<Class>: <message>` for a guarded fault in a
handler-free module but `Uncaught exception: <message>`, the class unnamed, once
any function held a `try`. loup#602: the natives kept 134 for the uncaught
exception after EXIT-1 had made it 1 on every delivery path.)

*Compiler's rule (runtime faults the program can catch).* The native runtime
cannot build an exception — its type id and layout belong to the program — so a
fault the RUNTIME detects reaches a `catch` through a bridge: where the module has
handler machinery, the call site ARMS the bridge before the call, the runtime
records the fault's message (and, for an `IoError`, its errno) and returns a
harmless value, and the site TAKES the fault after the call and raises the
exception through its own unwind path. On the LLVM lanes — Stage0's LLVM backend
and the self-hosted emitter over the C runtime — this makes catchable an
`IoError` from an fs read or write (§1-18.1; `readText`, `writeText`,
`readBytes`, `writeBytes`) and a `LifetimeError` from a `sync.thread` misuse
(loup#730, ruling RTF-1). Where nothing is armed — a module without handler
machinery, or a lane whose runtime cannot hand the fault over (Cranelift and the
hosted C backend for an `IoError`) — the runtime itself writes the uncaught line
above and exits 1, which is where the raise would have ended. (The libOS's fs
primitives do not report a failure yet: they answer an empty value. Its bridge
entry points exist and never hand a fault over.) An `IoError` was report-only on
every native lane until 2026-11: `catch (IoError)` around a `readText` never ran
there, and `e.code` did not compile.

### §1-18.5 Catch Pattern Matching

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

### §1-18.6 Template Exceptions

- Hard fail by default for evaluation and formatting errors.
- Buffered `try`/`catch` in template fences.
- `render`/`renderWith` fail if evaluation reaches `await`.
- Parse/lex errors and alignment violations are uncatchable (compile-time errors, not part of the exception hierarchy — they prevent the program from running at all).

### §1-18.7 Task Failures

- A task that fails and is never awaited becomes an unhandled task failure reported by the runtime.
- `await` on a failed task rethrows the failure.
- In `await group`, a failing child cancels all siblings.
- When multiple tasks fail in a `TaskGroup`, the exceptions are collected into an `ExceptionGroup` (if all are `Exception` subtypes) or a `BaseExceptionGroup` (if any are `BaseException`-only subtypes).

### §1-18.8 FFI Exceptions

- Outbound: type mismatches at `extern js`/`extern native` boundaries produce `FfiTypeError`.
- Inbound: unmarshalable JS arguments to `@jsexport` functions produce `FfiTypeError`.
- `@jsexport async func` failures cause the returned Promise to reject.

### §1-18.9 Signal Handling

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
- Writes to `Atomic[T]` fields (§2-1.8.2) — signal-safe
- `Mutex[T].tryLock()` — non-blocking; signal-safe (may return `None`)
- Static field reads of `let` (immutable) bindings — signal-safe

```loup
@mode(host.native)

let signalFlag = Atomic[bool].new(false)

# ✓ @signalSafe — only touches an Atomic[bool]
@signalSafe
func sigtermHandler(): void {
    signalFlag.store(true)
}

# Register at startup:
io.proc.onSignal(SIGTERM, sigtermHandler)
```

`@signalSafe` is valid in `@mode(host.dual)` and `@mode(host.native)` (see §1-2.6). Using it in other modes is `E_SIGNAL_SAFE_NOT_NATIVE`. The `signal-unsafe-call` lint fires when a non-`@signalSafe` function is called from a `@signalSafe` context.

**Error codes.**

| Code | Mode | Condition |
|---|---|---|
| `E_SIGNAL_SAFE_NOT_NATIVE` | web.scripted, web.compiled, host.scripted, freestanding | `@signalSafe` annotation used outside `@mode(host.dual)` or `@mode(host.native)` |
| `E_SIGNAL_UNSAFE_CALL` | host.native | Signal-unsafe operation (ARC retain/release, heap allocation, mutex lock, `core.reflect`) inside a `@signalSafe` context |



---

## §1-19 Grammar

*(This section is normative.)*

This section provides the complete formal grammar for the Loup language in Extended Backus-Naur Form (EBNF). The grammar covers all syntactic constructs defined in this specification. The grammar is target-independent — it applies equally to the Wasm bytecode target (§1-2.1, §3-1) and the native compilation target (§3-2). Target-specific semantics (e.g., Wasm type mappings, native ABI conventions) are defined in their respective sections.

**Notation conventions:**

- `::=` defines a production rule.
- `|` separates alternatives.
- `( ... )` groups alternatives.
- `[ ... ]` denotes optional elements (zero or one).
- `{ ... }` denotes repetition (zero or more).
- `"..."` denotes terminal symbols (keywords, punctuation).
- `UPPER_CASE` denotes lexical tokens.
- `PascalCase` denotes non-terminal symbols.

### §1-19.1 Lexical Grammar

```ebnf
(* Source encoding: UTF-8 *)

(* Whitespace and comments *)
Whitespace     ::= " " | "\t" | "\r" | "\n"
LineComment    ::= "#" { ANY_CHAR - "\n" } "\n"
BlockComment   ::= "/*" { ANY_CHAR - "*/" } "*/"
                   (* Block comments do NOT nest. The first "*/" closes the comment.
                      Nested "/*" sequences inside a block comment are literal content. *)
DocComment     ::= "##" { ANY_CHAR - "\n" } "\n"
                   (* "\" outside a literal is a RESERVED character (§1-3.2): rejected by the
                      lexer in v1.20, reserved for a future operator-escaping form. *)

(* Identifiers *)
Identifier     ::= IdentStart { IdentContinue }
IdentStart     ::= UNICODE_LETTER | "_"
IdentContinue  ::= UNICODE_LETTER | UNICODE_DIGIT | "_"
UpperIdent     ::= UPPER_LETTER { IdentContinue }
LowerIdent     ::= ( LOWER_LETTER | "_" ) { IdentContinue }
(* UpperIdent and LowerIdent encode the casing conventions described in §1-3.5.
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

(* Imaginary literals (v1.20) — see §1-3.6, §1-19.18, §1-4.1.6 *)
ImaginaryLiteral ::= ( DecimalLit ImaginarySuffixI )
                   | ( FloatLiteralUnsuffixed ImaginarySuffix )
ImaginarySuffix  ::= "i" | "i32" | "i64"
ImaginarySuffixI ::= "i"   (* bare "i" only on integer-form literal — "i32" / "i64"
                              on a DecimalLit always denotes the IntLiteral
                              suffix (int32/int64), preserving v1.x source
                              compatibility *)
FloatLiteralUnsuffixed ::= ( DIGIT { DIGIT } "." DIGIT { DIGIT } [ Exponent ]
                           | DIGIT { DIGIT } Exponent )
(* Lexer: ImaginaryLiteral takes precedence over FloatLiteral-followed-by-
   identifier when the suffix is exactly "i", "i32", or "i64" and is not
   followed by an identifier-continuation character. On a bare integer-form
   literal (e.g. "42i32"), the "i32" / "i64" suffixes are always parsed as
   IntSuffix (int32 / int64), not as ImaginarySuffix; to write an integer-
   valued imaginary use either "42i" (complex64), "42.0i32" (complex32), or
   "42.0i64" (complex64). *)

(* String literals *)
StringLiteral  ::= DoubleString | SingleString | InterpDoubleString | InterpSingleString | RawDoubleString | RawSingleString
DoubleString   ::= '"' { StringChar | EscapeSeq } '"'
SingleString   ::= "'" { StringChar | EscapeSeq } "'"
InterpDoubleString ::= "i" '"' { InterpStringChar | EscapeSeq | InlineExpr } '"'
                       (* Interpolated: evaluates {$ expr $} inline expressions. §1-15 *)
InterpSingleString ::= "i" "'" { InterpStringChar | EscapeSeq | InlineExpr } "'"
                       (* Single-quoted interpolated form. §1-15 *)
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
                      valid only in BytesLiteral. §1-3.6 *)
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
                        indent (±N), eol. See §1-14 for valid keys and values. *)
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


### §1-19.2 Syntactic Grammar — Programs and Modules

```ebnf
Program        ::= [ ModeDirective ] [ NamespaceDecl ] { TopLevelItem }
                   (* ModeDirective is the optional @mode(...) file-level annotation;
                      when present it must be the first non-comment token in the file.
                      NamespaceDecl, if present, immediately follows ModeDirective
                      and precedes all imports and declarations. §1-13.0 *)
ModeDirective  ::= "@mode" "(" ModeName ")" NEWLINE
ModeName       ::= "web" "." ( "scripted" | "compiled" )
                 | "host" "." ( "scripted" | "dual" | "native" )
                 | "freestanding"
NamespaceDecl  ::= "namespace" AbsolutePath ";"
                   (* Associates the file with a module namespace path. §1-13.0 *)

TopLevelItem   ::= ImportStmt ";"
                   (* Parenthesized form: from X import (...); — requires trailing ";" *)
                 | ModuleImportStmt ";"
                   (* Module import: import X [as Y]; — §1-13.1, loup#686 *)
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
                 | ConstFuncDecl
                   (* v1.21 — §1-7.1. Admissible wherever a `func` is, including inside a
                      block: a const-evaluable helper is often local to the one place that
                      needs it. *)
                 | ClassDecl
                 | EnumDecl
                 | InterfaceDecl
                 | StructDecl
                 | TypeAliasDecl ";"
                 | MacroDecl
                   (* Macro declaration: pub macro name(params) { quote { ... } }. §1-19.11 *)
                 | ExternJsFunc
                 | ExternJsVal
                   (* JavaScript FFI declarations; ";" is part of their own syntax. §1-19.9 *)
                 | ExternNative
                   (* Native C FFI declaration; ";" is part of its own syntax. §1-19.9 *)
                 | ExternNativeVal
                   (* Native C constant/variable import; ";" is part of its own syntax. §1-19.9 *)
                 | NamespaceBlock
                   (* Braced namespace block — Compiler's rule in §1-13.0 (loup#584). *)
                 | AnnotatedDecl
NamespaceBlock ::= "namespace" AbsolutePath "{" { TopLevelItem } "}"
                   (* One lexical scope; its body admits what a module's top level admits. *)
AnnotatedDecl  ::= Annotation { Annotation } VarDecl
                   (* One or more annotations on a module-level binding: @deprecated("use NEW_MAX") let MAX = 100.
                      Requires at least one annotation to avoid ambiguity with SimpleStmt. *)
```

### §1-19.3 Syntactic Grammar — Imports and Exports

```ebnf
ImportStmt     ::= "from" ModulePath "import" "(" ImportList ")" [ "prefer" "compiled" ]
                 | "from" ModulePath "defer" "import" "(" ImportList ")"
                   (* Deferred import: creates type stubs resolved after initialization.
                      Breaks module dependency cycles. "prefer compiled" not permitted
                      on defer imports. Available in all modes except @mode(freestanding). §1-13.10 *)
                   (* Both forms require a trailing ";" provided by TopLevelItem. *)
GroupedImportStmt ::= "from" ModulePath "{" GroupedImportList "}"
                   (* Block form — no trailing ";"; appears directly in TopLevelItem. *)
ModuleImportStmt ::= "import" ModulePath [ "as" Identifier ] [ "prefer" "compiled" ]
                   (* Binds the module as a namespace: under the alias, or — without
                      "as" — under its dotted AbsolutePath (a RelativePath needs "as").
                      Compiler's rule in §1-13.1 (loup#686). *)

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

### §1-19.4 Syntactic Grammar — Statements

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

VarDecl        ::= ( [ "unique" ] | [ "arc" ] ) ( "let" | "var" | "const" ) DestructPattern [ ":" Type ] [ "=" Expr ]
                   (* v1.21 — `const` is a THIRD introducer, not a spelling of `let`. It
                      declares a COMPILE-TIME constant: the initialiser must be a
                      const-expression and is evaluated at compile time, and one that is
                      not evaluable is E_CONST_NOT_EVALUABLE. `let` already produces an
                      immutable binding, so `const` would be redundant if it meant that.
                      An initialiser is not optional in practice for a `const`: there is
                      nothing to evaluate without one. §1-6.2, §1-7.1 *)
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
                   (* Annotation on a block statement: @vectorize for (...) {}. §1-8.8 *)
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
                      is E_ATOMIC_NOT_WASM. §2-1.7 *)
                 | AsmBlock
                   (* Valid in @mode(web.compiled) (Wasm, @unsafe),
                      @mode(host.native) (native, @unsafe), and @mode(freestanding). §3-3.7 *)
                 | IfConstStmt
                   (* v1.21 — compile-time selection. A STATEMENT only: there is no
                      `if const` expression form, because a construct whose branches are
                      all type-checked but only one lowered has no single value to yield
                      in the arms that are dropped. §1-6.3 *)
                 | ForConcurrentStmt
                   (* v1.20 — parallel iteration form. Defined in §1-19.18.
                      Valid in all modes; @strategy(...) availability varies by mode
                      per §1-2.6 footnotes 6-8. §2-1.11 *)
                 | FuncDecl
                 | AsyncFuncDecl
                 | GenFuncDecl
                 | AsyncGenFuncDecl
                 | ConstFuncDecl
                   (* v1.21 — §1-7.1. Admissible wherever a `func` is, including inside a
                      block: a const-evaluable helper is often local to the one place that
                      needs it. *)
                 | ClassDecl
                 | EnumDecl
                 | InterfaceDecl
                 | StructDecl

IfStmt         ::= "if" "(" Expr ")" Block { "else" "if" "(" Expr ")" Block } [ "else" Block ]
(* As an EXPRESSION (§1-5.4 / §1-6.3) the else branch is mandatory:                          *)
IfExpr         ::= "if" "(" Expr ")" Block { "else" "if" "(" Expr ")" Block } "else" Block
(* v1.21 — compile-time branch selection (§1-6.3). Every arm's condition must be a
   const-expression; `const` may be omitted on a later arm of the chain, and a plain
   `else if` may be mixed in, so the two forms are one chain rather than two grammars.
   Structurally identical to IfStmt apart from the keyword, and DELIBERATELY so: the
   branches are ordinary blocks, they are all fully type-checked whether selected or not,
   and only the selected one is lowered. A separate block grammar would have implied
   otherwise.                                                                              *)
IfConstStmt    ::= "if" "const" "(" Expr ")" Block
                   { "else" "if" [ "const" ] "(" Expr ")" Block } [ "else" Block ]
WhileStmt      ::= "while" "(" Expr ")" Block
ForStmt        ::= [ Label ":" ] "for" "(" VarDecl ";" Expr ";" Expr ")" Block
ForInStmt      ::= [ Label ":" ] "for" "(" [ "let" | "var" ] DestructPattern "in" Expr ")" Block
ForAwaitStmt   ::= [ Label ":" ] "for" "await" "(" [ "let" | "var" ] DestructPattern "in" Expr ")" Block
                   (* "let"/"var" are optional; default binding is immutable ("let"). §1-6.4 *)
DoWhileStmt    ::= [ Label ":" ] "do" Block "while" "(" Expr ")" ";"
TryStmt        ::= "try" Block { CatchClause } [ FinallyClause ]
CatchClause    ::= "catch" "(" TypePattern "as" Identifier ")" Block
                 | "catch" "Err" "(" Identifier [ ":" Type ] ")" Block   (* §1-5.10 *)
TypePattern    ::= Type { "|" Type }
FinallyClause  ::= "finally" Block
WithStmt       ::= "with" "(" WithBindingList ")" Block
WithBindingList ::= WithBinding { "," WithBinding }
WithBinding    ::= Identifier "=" Expr
DeferBlock        ::= "defer" Block
SafeBlock         ::= "safe" Block
SyncUnsafeBlock   ::= "unsafe" "(" StringLiteral ")" Block
AtomicBlock       ::= "atomic" Block
                      (* No await/spawn inside; see §2-1.7 for full restriction list.
                         Valid in @mode(web.scripted), @mode(web.compiled),
                         @mode(host.scripted), and @mode(host.dual) per §1-2.6.
                         Usage in @mode(host.native) or @mode(freestanding) is E_ATOMIC_NOT_WASM. *)
AnnotatedStmt     ::= Annotation { Annotation } BlockStmt
                      (* One or more annotations on a block statement.
                         Use case: @vectorize for (...) { } §1-8.8 *)
AsmBlock          ::= [ "@unsafe" "(" StringLiteral ")" ] "asm" "{" AsmBody "}"
                      (* In @mode(host.native), @unsafe annotation is required. In
                         @mode(freestanding), it is optional (omitting emits asm-unchecked
                         lint). Semantics, operand grammar, and constraint strings: §3-3.7 *)
AsmBody           ::= StringLiteral { StringLiteral } [ AsmOps ]
AsmOps            ::= [ AsmOut ] [ AsmIn ] [ AsmClobbers ]
AsmOut            ::= "out" ":" AsmOutOp { "," AsmOutOp }
AsmIn             ::= "in"  ":" AsmInOp  { "," AsmInOp  }
AsmClobbers       ::= "clobbers" ":" "[" { StringLiteral } "]"
AsmOutOp          ::= Identifier "=" StringLiteral
AsmInOp           ::= StringLiteral "=" Expr
DynamicView    ::= "dynamic" Expr "as" Identifier Block
                   (* Scoped dynamic-field access. See §1-8.7 for semantics.
                      Expr must implement the Dynamic interface. The Identifier
                      is bound within Block and provides dot-access to dynamic
                      fields: `dobj.foo` desugars to `expr.getField("foo")` and
                      `dobj.foo = v` desugars to `expr.setField("foo", box v)`. *)
PortalStmt     ::= "portal" ( Identifier | StringLiteral ) Block
AwaitGroupStmt ::= "await" "group" Block

Label          ::= Identifier
Block          ::= "{" { Stmt } "}"
```

### §1-19.5 Syntactic Grammar — Expressions

```ebnf
Expr           ::= AssignExpr | SpreadExpr | WithCopyExpr

(* There is no ternary operator: a "?" after an operand is always postfix propagation. *)
AssignExpr     ::= NullCoalExpr AssignOp Expr

(* Canonical style: "or" and "and" are idiomatic; "||" and "&&" are legal aliases.    *)
(* The formatter rewrites symbol forms to keyword forms. See §1-3.7 and §1-20.4.            *)
(* Precedence (low→high): ??(20) < or(19) < and(18) < equality < ...     *)
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
                 | TypeArgs "(" ArgList ")"
                   (* Explicit type arguments on a generic call: f[T](x), obj.m[T]().
                      Lowers to Call { type_args }, NOT an index. A "[" ... "]"
                      immediately preceding a call's "(" is parsed as TypeArgs
                      (not a value index) when, and only when, all three hold:
                      (1) the first token after "[" is type-leading,
                      (2) it contains no top-level ":" (which would mark a slice
                          or a dict/named form), and
                      (3) the "]" is immediately followed by "(".
                      Otherwise "[" Expr "]" (value index) applies. To force a
                      value-index-then-call where the brackets would otherwise read
                      as type arguments, parenthesize the indexing:
                      (dictOfFns[Key])(x). TypeArgs reuses "[" TypeList "]" (§1-19.7). *)
                 | "[" Expr "]"
                 | "[" [ Expr ] ":" [ Expr ] [ ":" [ Expr ] ] "]"
                   (* Single-axis index and single-axis slice forms.
                      In v1.20, both are subsumed as the one-element case
                      of the more general comma-separated IndexList form
                      defined in §1-19.18 (multi-axis array sections). *)
                 | "." Identifier
                 | "." IntLiteral
                   (* Tuple element access: pair.0, triple.2. Index must be a
                      compile-time non-negative integer constant. §1-4.9 *)
                 | "?." Identifier
                 | "?." Identifier "(" ArgList ")"
                 | "?." "[" Expr "]"
                 | "?." "[" [ Expr ] ":" [ Expr ] [ ":" [ Expr ] ] "]"
                 | "!{" ( Identifier | StringLiteral ) "}"
                 | "?"

PrimaryExpr    ::= Identifier
                 | IfExpr
                 | "unreachable"
                   (* type `noreturn`; reaching it panics in every profile — §1-5.11 *)
                 | IntLiteral
                 | FloatLiteral
                 | ImaginaryLiteral
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
                      Chains to the direct superclass constructor. §1-8.4 *)
                 | "super" "." Identifier "(" [ ArgList ] ")"
                   (* Superclass method call (ruling SUPER-1) — valid in instance
                      methods and constructors; statically bound to the direct
                      superclass's implementation, `this` as receiver. §1-8.4 *)
                 | "reinterpret" "[" Type "," Type "]" "(" Expr ")"
                   (* SourceType = declared type of input expr; TargetType = desired interpretation.
                      Requires @unsafe. Available in all modes (§1-2.6). §3-3.18 *)
                 | "reinterpretChecked" "[" Type "," Type "]" "(" Expr ")"
                   (* SourceType = declared type of the input expr; TargetType = desired interpretation.
                      Returns Result[TargetType, AlignmentError]; no @unsafe required. §3-3.18 *)
                 | "size_of" "[" Type "]" "(" ")"
                   (* Compile-time size in bytes; @mode(host.native) and @mode(freestanding). §3-3.4.1 *)
                 | "align_of" "[" Type "]" "(" ")"
                   (* Compile-time alignment in bytes; @mode(host.native) and @mode(freestanding). §3-3.4.1 *)
                 | MacroInvoke
                   (* Macro invocation: name!(args). §1-19.11. The "!" sigil
                      distinguishes macro calls from regular function calls. *)

SpreadExpr     ::= "*" Expr | "**" Expr

WithCopyExpr   ::= PostfixExpr "with" "(" WithCopyList ")"
                   (* Struct copy-with-modification: `s with (field=newVal)` produces
                      a copy of s with the named fields replaced. §1-10.7. Valid on struct
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
                 | Identifier ( "=" | ":" ) Expr
                   (* Named/keyword argument. The "=" and ":" forms are
                      semantically identical and may be mixed within a single
                      argument list. The "=" form is conventional at imperative
                      call sites (where it visually distinguishes a call from
                      the colon-typed parameter declaration); the ":" form is
                      conventional in annotations and in declarative constructor
                      calls that mirror struct- or record-shaped data. Either
                      form is accepted everywhere. The four ownership-verb
                      keywords (`reads`, `edits`, `takes`, `shares`) followed by
                      ":" are reserved for verb acknowledgments (VerbAckArg)
                      and never parse as named arguments — those keywords
                      cannot be used as parameter names. *)
                 | "*" Expr
                 | "**" Expr

VerbAckArg     ::= ( "reads" | "edits" | "takes" | "shares" ) ":" Expr
RequiresAckArg ::= ( "reads" | "edits" | "takes" | "shares" ) "(" Expr { "," Expr } ")"
                 | "distinct" "(" DistinctAckArg { "," DistinctAckArg } ")"
DistinctAckArg ::= Expr | Expr "[" Expr ":" Expr "]"
UnsafeAckArg   ::= "@unsafe" "(" StringLiteral ")"
```

### §1-19.6 Syntactic Grammar — Patterns

```ebnf
Pattern        ::= "_"
                 | Identifier
                 | Identifier "(" [ PatternList ] ")"
                   (* Positional: Circle(r) or Rect(w, h) *)
                 | Identifier "(" [ NamedAssignPatternList ] ")"
                   (* Named with =: Point(x=px, y=py) or Point(x=0.0, y=0.0) *)
                 | Identifier "{" [ NamedPatternList ] "}"
                 | VariantPath [ "(" [ PatternList | NamedAssignPatternList ] ")"
                               | "{" [ NamedPatternList ] "}" ]
                   (* Qualified variant: `Shape.Circle(r)`, `TcpState.Closed`, or
                      a braced-namespace path before the enum, `u.R.A(v)` (§1-9.4
                      *Compiler's rule (qualified variant paths)*, loup#624) *)
                 | "(" PatternList ")"
                 | "[" PatternList "]"
                 | "{" DictPatternList "}"
                 | Type "(" Identifier ")"
                 | "borrow" [ "[" "~" Identifier "]" ] Identifier
                   (* Binds a borrow[~name] payload from a lifetime-parameterized
                      enum variant. Available in all modes (§1-2.6).
                      Example: Token.Word(borrow[~src] w) — §1-9.1, §3-2.4.2 *)
                 | Literal

PatternList    ::= Pattern { "," Pattern } [ "," "*" Identifier ]
VariantPath    ::= Identifier { "." Identifier } "." ( Identifier | "Some" | "None" )
NamedPatternList ::= NamedPattern { "," NamedPattern }
NamedPattern         ::= Identifier ":" Pattern [ "=" Expr ]
NamedAssignPatternList ::= NamedAssignPattern { "," NamedAssignPattern }
NamedAssignPattern   ::= Identifier "=" Pattern
                        (* Named binding using = notation: x=px, y=py.
                           Used in struct/enum patterns: Point(x=px, y=py). §1-10.8 *)
DictPatternList ::= DictPattern { "," DictPattern } [ "," "**" Identifier ]
DictPattern    ::= StringLiteral ":" Identifier [ "=" Expr ]

DestructPattern ::= Identifier
                  | Identifier "(" NamedAssignDestructList ")"
                    (* Struct/enum constructor destructuring: Point(x=px, y=py) §1-10.8 *)
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

Literal        ::= IntLiteral | FloatLiteral | ImaginaryLiteral | StringLiteral | BytesLiteral | CharLiteral | BoolLiteral | "None"
```

### §1-19.7 Syntactic Grammar — Types

```ebnf
Type           ::= UnionType
UnionType      ::= BaseType { "|" BaseType }
BaseType       ::= PrimaryType [ "?" ]
PrimaryType    ::= "int"    | "int8"  | "int16"  | "int32"  | "int64"
                 | "uint"   | "uint8" | "uint16" | "uint32" | "uint64"
                 | "bigint"
                 | "float"  | "float32" | "float64"
                 | "complex" | "complex32" | "complex64"
                   (* v1.20 — IEEE 754 complex types; §1-4.1.6, §1-19.18 *)
                 | "bool" | "char" | "string" | "bytes" | "void"
                 | "noreturn"
                   (* RETURN POSITION ONLY — a function or function-type return
                      type. Admitted by this production so the grammar can spell
                      it; every other position is rejected semantically with
                      E_NORETURN_POSITION. §1-4.4a *)
                 | "impossible"
                   (* TYPE-ARGUMENT POSITION ONLY, and only where the argument
                      lands in an enum variant payload; every other position is
                      E_IMPOSSIBLE_POSITION. §1-4.4b *)
                   (* "uint" is the platform-native pointer-sized unsigned integer:
                      alias for uint64 on 64-bit targets, uint32 on 32-bit. Used in
                      @mode(host.native) and @mode(freestanding) for raw addresses
                      and FFI interop. §1-4.1 *)
                 | DecimalType
                 | ArrayType
                   (* v1.20 — multi-dimensional array primitive; expanded in §1-19.18 *)
                 | Identifier [ TypeArgs ]
                 | FunctionType
                   (* fn(…): R, async fn, gen fn, noescape fn and their
                      combinations; §1-4.4 *)
                 | "borrow" [ "[" "~" Identifier "]" ] Type
                   (* non-owning reference type; available in all modes (§1-2.6);
                      "borrow[~name] T" ties the reference to a declared
                      lifetime region (§3-2.4.2) *)
                 | "list" "[" Type "]"
                 | "dict" "[" Type "," Type "]"
                 | "set" "[" Type "]"
                 | "tuple" "[" TypeList "]"
                 | "MaybeUninit" "[" Type "]"
                   (* Uninitialised-memory wrapper; available in all modes (§1-2.6). §3-3.17 *)
                 | "Volatile" "[" Type "]"
                   (* MMIO type wrapper; freestanding only. §3-3.9 *)
                 | "(" Type ")"

TypeArgs       ::= "[" TypeList "]"
TypeList       ::= Type { "," Type } [ "," ]

DecimalType    ::= "decimal" [ "(" DecimalParams ")" ]
                   (* "decimal" alone is the arbitrary-precision form (§1-4.1.4);
                      the parenthesized form is the fixed-precision form (§1-4.1.4.1) *)
DecimalParams  ::= IntLiteral [ "," IntLiteral ]
                   { "," DecimalNamedParam }
DecimalNamedParam ::= "rounding" ":" Identifier
                    | "overflow" ":" Identifier
                   (* Identifier resolves to a RoundingMode or OverflowPolicy
                      enum variant; §1-4.1.4.2 *)
FunctionType    ::= [ "async" ] [ "gen" ] [ "noescape" ] ( "fn" | "func" ) "(" [ FnTypeParamList ] ")" ":" Type
                   (* `fn` is the normative spelling of a function TYPE; `func`
                      declares functions and lambdas. `func` is accepted in type
                      position as a transitional alias — both front ends parse it —
                      but new code SHOULD write `fn`. `gen` is a shorthand that
                      adds nothing to the type (§1-4.4). *)
FnTypeParamList ::= FnTypeParam { "," FnTypeParam }
FnTypeParam     ::= [ FnTypeVerbMod ] [ Identifier ":" ] Type
                   (* The optional `Identifier ":"` is a documentation name: it is
                      not part of the type (§1-4.4 "Structural compatibility"). *)
FnTypeVerbMod   ::= "reads" | "edits" | "takes" | "shares"
                  | "borrow" | "excl" "borrow"
                   (* `borrow` is the verb only when no `[` follows it:
                      `fn(borrow[~src] T): R` names the lifetime-tied borrow
                      TYPE of the `PrimaryType` production (§3-2.4.2). `excl` is
                      contextual, as in a parameter list. *)
```

### §1-19.8 Syntactic Grammar — Declarations

```ebnf
FuncDecl         ::= { Annotation } [ "pub" ] [ "safe" ] "func" Identifier [ TypeParams ] "(" [ ParamList ] ")"
                     [ RequiresClause ] [ ":" Type ] [ WhereClause ] Block
AsyncFuncDecl    ::= { Annotation } [ "pub" ] [ "safe" ] "async" "func" Identifier [ TypeParams ] "(" [ ParamList ] ")"
                     [ RequiresClause ] [ ":" Type ] [ WhereClause ] Block
GenFuncDecl      ::= { Annotation } [ "pub" ] [ "safe" ] "gen" "func" Identifier [ TypeParams ] "(" [ ParamList ] ")"
                     [ RequiresClause ] [ ":" Type ] [ WhereClause ] Block
AsyncGenFuncDecl ::= { Annotation } [ "pub" ] [ "safe" ] "async" "gen" "func" Identifier [ TypeParams ] "(" [ ParamList ] ")"
                     [ RequiresClause ] [ ":" Type ] [ WhereClause ] Block
(* v1.21 — a const-evaluable function (§1-7.1). No `async`, `gen` or `safe` combination
   exists: const evaluation admits no suspension and no generator state, so those forms
   would name something unimplementable rather than merely unimplemented. The body is an
   ordinary Block whose admissible CONTENTS are restricted semantically, not syntactically
   — the closed feature set is a list of rules with their own diagnostics
   (E_CONST_FORBIDDEN_CONSTRUCT, E_CONST_CALLS_NON_CONST, E_CONST_MUTABLE_STATE), and a
   grammar that tried to encode it would report a violation as a parse error.            *)
ConstFuncDecl    ::= { Annotation } [ "pub" ] "const" "func" Identifier [ TypeParams ] "(" [ ParamList ] ")"
                     [ RequiresClause ] [ ":" Type ] [ WhereClause ] Block

RequiresClause   ::= "requires" RequiresContract { "," RequiresContract }
RequiresContract ::= VerbReq | DistinctReq
VerbReq          ::= ( "reads" | "edits" | "takes" | "shares" ) "(" Identifier { "," Identifier } ")"
DistinctReq      ::= "distinct" "(" DistinctArg { "," DistinctArg } ")"
DistinctArg      ::= Identifier | Identifier "[" Expr ":" Expr "]"

ParamList      ::= Param { "," Param } [ "," "*" [ Identifier ":" Type ] ] [ "," ParamList_KW ] [ "," "**" Identifier ":" Type ]
                 | "*" [ "," ParamList_KW ]
ParamList_KW   ::= Param { "," Param }
Param          ::= [ "reads" | "edits" | "takes" | "shares"
                  | "excl" "borrow"
                  | [ "volatile" ] "borrow" [ "[" "~" Identifier "]" ] ]
                  DestructPattern ":" Type [ "=" Expr ]
                   (* `volatile` may only precede `borrow`/`borrow[~name]`
                      (`E_VOLATILE_NOT_BORROW`) and only in `@mode(freestanding)` or
                      `@mode(host.native)` (`E_VOLATILE_WRONG_MODE`); see §3-3.8 for
                      MMIO semantics. Both rules are the type checker's: the parser
                      accepts `volatile` before any parameter modifier. *)
                  (* Identifier is the common case. DestructPattern supports
                     tuple and list destructuring in parameter position:
                     func f((x, y): tuple[float, float]) — see §1-6.8.
                     "borrow[~name]" binds the parameter to a named lifetime region.
                     Available in all modes (§1-2.6). §3-2.4.2 *)

TypeParams     ::= "[" TypeParam { "," TypeParam } "]"
TypeParam      ::= [ "out" | "in" ] Identifier [ ":" TypeConstraint ]
                 (* variance annotation: "out" = covariant, "in" = contravariant,
                    no annotation = inferred by compiler (default invariant) *)
                 | "lifetime" "~" Identifier
                 (* lifetime parameter — declares a named region for borrow tracking.
                    Available in all modes (§1-2.6). See §3-2.4.2. *)
                 | Identifier ":" "int"
                 (* compile-time integer parameter (v1.20). The argument at the
                    instantiation site must be a compile-time-evaluable integer
                    literal or constant expression. Used by the v1.20 array
                    primitive `array[T, rank]` and shape-manipulation
                    operations like `reshape[T, rank1, rank2]`. See §1-12. *)
TypeConstraint ::= Type { "+" Type }

WhereClause      ::= "where" WhereConstraint { "," WhereConstraint }
                     (* Per-method or per-implements type constraint. Used to
                        constrain a generic method to specific bounds beyond
                        the type parameter's primary bound (e.g. `T: Integer`
                        on a method when the type-parameter bound is only
                        `T: Shareable`), and on `implements` clauses for
                        conditional trait implementation (§4-1.6). See §1-11.5 for normative semantics. *)
WhereConstraint  ::= ( Identifier | "Self" ) ":" TypeConstraint
                     (* The constrained name is a type parameter or the
                        implicit Self. The bound on the right is a TypeConstraint
                        — one or more types separated by "+", matching how
                        bounds are written on TypeParams. *)

ClassDecl      ::= { Annotation } [ "pub" ] [ "synchronized" ] [ "local" | "shared" ]
                   [ "unique" ] [ "abstract" | "final" ] [ "sealed" ] [ "dynamic" ]
                   "class" Identifier [ TypeParams ]
                   [ ":" Type ] [ ImplementsClauseList ] "{" { ClassMember } "}"
                   (* Memory strategy: bare `class` is shorthand for `local class`;
                      `shared class` opts into atomic ARC and shared-arena allocation.
                      `local` and `shared` are mutually exclusive (`E_PARSE_DUAL_STRATEGY`).
                      `shared unique` is `E_UNIQUE_SHARED`; `shared dynamic` is
                      `E_SHARED_DYNAMIC`. §1-8.1.1.
                      `abstract` and `final` are mutually exclusive (`E_FINAL_ABSTRACT`).
                      `final` and `sealed` are mutually exclusive (`E_FINAL_SEALED`).
                      `abstract sealed` is permitted — abstract base with a closed set of
                      concrete subclasses. `final class` cannot be subclassed
                      (`E_FINAL_EXTEND`); `sealed class` may only be subclassed from
                      within the declaring module (`E_SEALED_EXTERNAL`). §1-8.3.1, §1-8.3.2 *)
ImplementsClauseList ::= ImplementsClause { "," ImplementsClause }
ImplementsClause     ::= "implements" TypeList [ WhereClause ]
                         (* Each "implements" clause may carry its own where
                            constraint, enabling conditional trait implementation:
                              class Box[T] : Any
                                implements Serializable   where T: Serializable,
                                implements Deserializable where T: Deserializable
                                { ... }
                            The legacy form `implements A, B, C` is `ImplementsClauseList`
                            with a single `ImplementsClause` whose `TypeList` is `A, B, C`. §4-1.6 *)
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
MethodDecl     ::= { Annotation } [ "pub" ] [ "abstract" | "override" ] [ "final" ]
                   ( [ "safe" ] [ "async" ] [ "gen" ] "func" | "modifier" )
                   Identifier [ TypeParams ] "(" [ ParamList ] ")"
                   [ RequiresClause ] [ ":" Type ] [ WhereClause ] ( Block | ";" )
                   (* `abstract` and `override` are mutually exclusive at the
                      grammar level (an abstract method declares an interface,
                      not an override of an existing implementation).
                      `abstract` and `final` are mutually exclusive (`E_FINAL_ABSTRACT`).
                      `override final` is permitted — overrides the parent's
                      method, then seals further override. §1-8.3.1 *)
StaticMethodDecl ::= { Annotation } [ "pub" ] "static" [ "safe" ] [ "async" ] [ "gen" ] "func" Identifier [ TypeParams ] "(" [ ParamList ] ")" [ ":" Type ] [ WhereClause ] Block
StaticFieldDecl ::= [ "pub" ] "static" ( "let" | "var" ) Identifier ":" Type [ "=" Expr ]
PropertyDecl   ::= [ "pub" ] ( "get" Identifier "(" ")" ":" Type Block
                             | "set" Identifier "(" Param ")" Block )

OperatorMethodDecl ::= { Annotation } [ "pub" ] [ "static" ] [ "modifier" ] "operator" "func"
                       OperatorSymbol [ TypeParams ] "(" [ ParamList ] ")" [ ":" Type ] Block
                       (* "modifier" is optional; when present, declares that this
                          operator method writes var fields on self and requires
                          safe context at call sites. Operator methods are NOT
                          implicitly modifier — explicit declaration required. §3-2.4.11 *)
OperatorSymbol ::= "+" | "-" | "*" | "/" | "//" | "%" | "**"
                 | "&" | "|" | "^" | "bnot" | "<<" | ">>"
                 | "[]" | "[]=" | "contains" | "()"
                 | "==" | "+=" | "-=" | "*=" | "/=" | "//=" | "%="
                 | "**=" | "<<=" | ">>=" | "&=" | "|=" | "^="

EnumDecl       ::= { Annotation } [ "pub" ] "enum" Identifier [ TypeParams ] "{" VariantList "}"
VariantList    ::= Variant { VariantSep Variant } [ VariantSep ]
                   (* Both comma and semicolon separators are normative. §1-9.1.
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
NamedFieldList ::= NamedField { NamedFieldSep NamedField } [ NamedFieldSep ]
                   (* Both "," and ";" separators are normative, matching
                      VariantSep above. The "," form is conventional in the
                      paren shape (Circle(radius: float, theta: float)); the
                      ";" form is conventional in the brace shape that mirrors
                      struct-field declaration syntax (Variant { tag: string;
                      fields: Value }). Mixing "," and ";" within one named
                      field list is `E_NAMED_FIELD_MIXED_SEP`; enforced
                      semantically rather than grammatically. *)
NamedFieldSep  ::= "," | ";"
NamedField     ::= Identifier ":" Type

InterfaceDecl  ::= [ "pub" ] [ "sealed" ] "interface" Identifier [ TypeParams ] [ ":" TypeList ]
                   "{" { InterfaceMember } "}"
                   (* `sealed interface` may only be implemented by types in the
                      declaring module (`E_SEALED_EXTERNAL_IMPL`). §1-11.1 *)
                   (* TypeList names zero or more superinterfaces.
                      A superinterface extends the contract: all members of the
                      superinterface become members of the declaring interface.
                      A class implementing the sub-interface must implement all
                      inherited members as well. §1-11 *)
InterfaceMember ::= { Annotation } [ "pub" ] [ "static" ] [ "safe" ] [ "async" ] [ "gen" ] "func"
                    Identifier [ TypeParams ] "(" [ ParamList ] ")"
                    [ RequiresClause ] [ ":" Type ] [ WhereClause ] ( Block | ";" )
                    (* The only annotation an interface method takes is
                       `@interruptSafe`; any other is E_ANNOTATION_TARGET.
                       §1-8.8, row ISRIFACE-1 *)
                  | [ "pub" ] "modifier" Identifier [ TypeParams ]
                    "(" [ ParamList ] ")" [ RequiresClause ] [ ":" Type ] [ WhereClause ] ( Block | ";" )
                    (* modifier methods cannot be static, async, or gen;
                       implementing classes must also declare the method as modifier *)
                  | [ "pub" ] [ "modifier" ] "operator" "func" OperatorSymbol "(" [ ParamList ] ")" [ ":" Type ] ( Block | ";" )
                    (* "modifier" on operator func: same semantics as modifier on regular func;
                       implementing classes must also declare modifier. §3-2.4.11 *)
                  | [ "pub" ] ( "get" | "set" ) Identifier "(" [ Param ] ")" [ ":" Type ] ( Block | ";" )
                  (* A ";" terminates an abstract method declaration; a Block provides a default implementation. *)

StructDecl     ::= { Annotation } [ "pub" ] "struct" Identifier [ TypeParams ] [ "implements" TypeList ] "{" { StructMember } "}"
StructMember   ::= StructField ";"
                 | MethodDecl
                 | StaticMethodDecl
                 | OperatorMethodDecl
                 | TypeAliasDecl ";"
StructField    ::= [ "pub" ] [ "unique" "var" | "var" ] Identifier ":" Type [ "=" Expr ]
                 | [ "pub" ] "borrow" [ "[" "~" Identifier "]" ] Identifier ":" Type
                   (* borrow struct fields hold non-owning references; no default values.
                      "borrow[~name]" ties the field to a named lifetime region (§3-2.4.2).
                      Available in all modes (§1-2.6). *)

TypeAliasDecl  ::= [ "pub" ] "type" Identifier [ TypeParams ] "=" Type

Annotation     ::= "@" Identifier [ "(" ArgList ")" ]
```

### §1-19.9 Syntactic Grammar — FFI Declarations

**`NativeHandle?` in `extern native` return type position (§2-3.4).** `NativeHandle?` is parsed by the existing `T?` nullable-type grammar (§1-4.3). No new production is needed; the compiler maps an optional return type to automatic null-to-`None` checking at the FFI boundary. Plain `NativeHandle` (non-optional) maps null to a runtime `NullHandleError`.

```ebnf
ExternJsFunc    ::= "extern" "js" "func" Identifier "(" [ ParamList ] ")" ":" Type ";"
ExternJsVal     ::= "extern" "js" "val" Identifier ":" Type ";"
ExternNative    ::= { Annotation } "extern" "native" StringLiteral "func" Identifier
                    "(" [ ParamList ] ")" ":" Type ";"
                    (* Annotation supports @unsafe("reason") for thread-safety and
                       escaping-borrow assertions on native C functions. §3-2.4.6 *)
ExternNativeVal ::= "extern" "native" StringLiteral "val" Identifier ":" Type ";"
                    (* Imports a native constant or variable by name from a C library. *)
```

### §1-19.10 Syntactic Grammar — Template Directives

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
                   (* Template match arm: {% Variant(x) => %} ... §1-9.4 *)
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

### §1-19.11 Syntactic Grammar — Macro Declarations

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
MacroInvoke    ::= Identifier "!" "(" [ MacroArg { "," MacroArg } [ "," ] ] ")"
                   (* Ruling MAC-1: the arguments are TOKEN TREES, split at the
                      commas outside every bracket pair; each is parsed at
                      expansion in the category (Expr, Type, Stmt — and a
                      Name, §1-17 compiler's rule) of every splice position
                      its parameter fills (§1-17). *)
MacroArg       ::= TokenTree { TokenTree }
TokenTree      ::= "(" { TokenTree | "," } ")"
                 | "[" { TokenTree | "," } "]"
                 | "{" { TokenTree | "," } "}"
                 | ANY_TOKEN_EXCEPT_BRACKET_OR_COMMA
                   (* A string, interpolated string or template fence is ONE
                      token tree: its contents never split an argument. *)
```

For any valid Loup source text, parsing it into an AST and then pretty-printing that AST back to source text and parsing again SHALL produce an equivalent AST (round-trip property).

### §1-19.12 Syntactic Grammar — Additional Productions

*(CastExpr is fully defined in §1-19.5 as part of the canonical expression hierarchy. The `box` prefix operator is fully defined in §1-19.5 UnaryExpr. §1-19.12 contains additional productions not covered in §1-19.5.)*

#### Field Qualifier Keywords

*(FieldDecl is fully defined in §1-19.8. The qualifier forms `weak` and `unowned[~name]` are inlined there.)*

`unowned[~name]` is valid in `@mode(host.native)` and `@mode(freestanding)` files. Bare `unowned` (without a lifetime annotation) on a class field is `E_UNOWNED_NO_LIFETIME`. The class must carry `[lifetime ~name]` as a class-level lifetime parameter.

#### Operator Method Modifier

*(MethodDecl, OperatorMethodDecl, and OperatorSymbol are fully defined in §1-19.8. Operator methods use the form `[ "modifier" ] "operator" "func" OperatorSymbol ...` as a separate production from regular method declarations.)*

*(CaptureList and CaptureItem are now defined in §1-19.5 as part of the canonical LambdaExpr production. Capture lists are valid in `@mode(host.dual)` and `@mode(host.native)` files; the compiler emits a compile-time error otherwise.)*

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

### §1-19.13 Syntactic Grammar — Template Fence and HTML Context Productions

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
| `html` | HTML context-tracking template | §1-16.6 |
| `css` | CSS stylesheet fence | §1-16.7 |
| `wgsl` | WebGPU Shading Language shader fence (compute, vertex, fragment) | §1-16.8.1 |
| `metal` | Metal Shading Language shader fence (compute, vertex, fragment) | §1-16.8.2 |
| `glsl` | OpenGL/Vulkan shader fence (compute, vertex, fragment, geometry, tessellation) | §1-16.8.3 |
| `sql` | SQL query fence (§21) | stdlib |
| `ui` | Reactive UI layout fence | §2-4.6 |
| `stablehlo` / `hlo` | XLA HLO tensor computation fence (§21) | stdlib |

Unrecognised language tokens are not a compile-time error; they produce a `Template` value whose body is the raw fence content as a `string`.

#### HTML context tracking (compile-time)

The following new compile-time error categories apply inside `html` fences (§1-16.6):

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
| `()` `[]` `.` `?.` `!{}` `?.[` | 1 | Call, index, member access | §1-5.1 |
| `typeof` | 2 | Type-of operator | §1-4.7 |
| `-` (unary) `not` `!` `bnot` | 3 | Unary operators | §1-5.1 |
| `box` `consume` | 4 | Boxing/widening (`box`); unique-to-ARC downgrade (`consume`, `@mode(host.native)` or `@mode(host.dual)`) | §1-4.3, §3-2.4.7 |
| `**` | 5 | Exponentiation | §1-5.1 |
| `*` `/` `//` `%` | 6 | Multiplicative / floor division | §1-5.1 |
| `+` `-` | 7 | Additive | §1-5.1 |
| `<<` `>>` | 8 | Bitwise shift | §1-5.1 |
| `&` | 9 | Bitwise AND | §1-5.1 |
| `^` | 10 | Bitwise XOR | §1-5.1 |
| `\|` | 11 | Bitwise OR | §1-5.1 |
| `[:]` | 12 | Slice | §1-5.3 |
| `in` `not in` | 13 | Membership | §1-5.1 |
| `<` `>` `<=` `>=` | 14 | Comparison | §1-5.1 |
| `==` `!=` | 15 | Equality | §1-5.1 |
| `is` `instanceof` | 16 | Type check | §1-4.5, §1-4.7, §1-9.5 |
| `as` `as?` | 17 | Cast | §1-4.3 |
| `and` `&&` | 18 | Logical AND (`and` canonical; `&&` alias) | §1-3.7 |
| `or` `\|\|` | 19 | Logical OR (`or` canonical; `\|\|` alias) | §1-3.7 |
| `??` | 20 | Null coalescing | §1-5.6 |
| `? :` | 21 | Ternary | §1-5.4 |
| `?` (postfix) | 22 | Result propagation | §1-5.7 |
| `=` `+=` `-=` etc. | 23 | Assignment | §1-6.2 |
| `*` `**` (prefix) | 24 | Spread | §1-5.8 |



---


### §1-19.14 Syntactic Grammar — v1.14 Additions

*(This section is normative. Applies to `@mode(host.native)` and `@mode(freestanding)`. Productions new in v1.14.)*

**Mode directive (historical — v1.14 form):**

```
mode_directive ::= '@mode' '(' mode_name ')'
mode_name      ::= 'scripted' | 'compiled' | 'native' | 'freestanding'    (* v1.14 — superseded *)
```

Valid only as the first non-comment, non-blank token in a source file.

*Note:* The v1.14 `mode_name` production above is preserved for historical record. The canonical v1.17 grammar uses the dotted form (`web.scripted`, `web.compiled`, `host.scripted`, `host.dual`, `host.native`, `freestanding`) — see the `ModeDirective`/`ModeName` productions in §1-19.2, which are the authoritative normative grammar.

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
                   (* 'unique' is new in v1.14; 'abstract' and 'dynamic' are from §1-19.8.
                      'unique abstract' and 'unique dynamic' are mutually exclusive
                      compile-time errors; 'abstract dynamic' is also an error.
                      Renamed from `modifier` in v1.15 to avoid conflict with the
                      `modifier` method declaration keyword introduced in §3-2.4.11. *)
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

**`volatile` parameter modifier:** `volatile` immediately precedes a `borrow` parameter modifier.

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



### §1-19.15 Syntactic Grammar — v1.15 Additions

*(This section is normative. Productions new in v1.15. Applies to all modes unless noted.)*

**Ownership transfer verbs — parameter modifiers (§3-2.4.9):**

```
param_modifier  ::= 'reads' | 'edits' | 'takes' | 'shares'
                  | 'borrow' | 'borrow' '[' '~' IDENT ']'
                  | 'excl' 'borrow'

param_decl      ::= param_modifier? IDENT ':' type
```

The first four productions are the v1.15 verb system. The remainder are retained for backward compatibility in `@mode(host.native)` and `@mode(freestanding)`.

**Verb acknowledgment at call sites (§3-2.4.9):**

```
arg             ::= verb_ack_arg | value_arg
verb_ack_arg    ::= verb_ack ':' expr
verb_ack        ::= 'reads' | 'edits' | 'takes' | 'shares'
value_arg       ::= (IDENT ':')? expr
```

**`requires` clause (§3-2.4.10):**

```
func_decl         ::= func_mods 'func' IDENT type_params? '(' param_list ')'
                      requires_clause? ':' type block

requires_clause   ::= 'requires' requires_contract (',' requires_contract)*
requires_contract ::= verb_req | distinct_req
verb_req          ::= ('reads'|'edits'|'takes'|'shares') '(' IDENT (',' IDENT)* ')'
distinct_req      ::= 'distinct' '(' distinct_arg (',' distinct_arg)* ')'
distinct_arg      ::= IDENT | IDENT '[' expr ':' expr ']'
func_mods         ::= ('safe')? ('async')?  (* 'safe' precedes 'async'; both optional. §1-19.8 *)
```

**`requires` acknowledgments at call sites (§3-2.4.10):**

```
call_arg_list   ::= call_arg (',' call_arg)*
call_arg        ::= verb_ack_arg | value_arg | requires_ack | unsafe_ack
requires_ack    ::= verb_req | distinct_req
unsafe_ack      ::= '@unsafe' '(' string_lit ')'
```

**`modifier` method declaration (§3-2.4.11):**

```
method_kw       ::= 'func' | 'modifier' | 'get' | 'set' | 'gen'
method_decl     ::= visibility? method_kw IDENT type_params? '(' param_list ')' ':' type block
```

`set` accessors are implicitly `modifier`.

**`safe {}` block (§3-2.4.12):**

```
safe_block      ::= 'safe' '{' stmt* '}'
stmt            ::= ... | safe_block
```

**`synchronized` class declaration (§3-2.4.13):**

```
class_decl_mod  ::= ('synchronized')? ('local' | 'shared')? ('unique')? ('abstract')? ('dynamic')?
class_decl      ::= class_decl_mod 'class' IDENT type_params? (':' type)?
                    ('implements' type_list)? '{' class_body '}'
```

`synchronized` is valid in `@mode(freestanding)` with a reduced per-class lock model (§3-2.4.13). `synchronized unique`, `synchronized abstract`, and `synchronized dynamic` are mutually exclusive compile-time errors.

**Memory-strategy modifier (v1.18).** The optional `'local' | 'shared'` modifier selects the class's memory strategy (§1-8.1.1). If omitted, the class defaults to `local`. The modifier is mutually exclusive with the opposing strategy — both `local` and `shared` together is a parse error (`E_PARSE_DUAL_STRATEGY`). `shared unique` is `E_UNIQUE_SHARED`; `shared dynamic` is `E_SHARED_DYNAMIC`. `local` combines with all other modifiers.

**Shared-constructor expression (v1.18).** A `shared class` instance is allocated with the `shared` keyword prefix on the constructor call:

```
shared_expr     ::= 'shared' ('(' expr ')')? type_name arg_list
                    (* type_name must name a `shared class` type *)
                    (* optional ( expr ) argument is a SharedRef[SharedArena] *)
                    (* without the optional arena, allocation uses the current
                       context's default arena per §2-2.5 *)
```

Examples:

- `shared Vertex(1.0, 2.0, 3.0)` — allocate in default arena
- `shared(myArena) Vertex(4.0, 5.0, 6.0)` — allocate in specific arena

The `shared` prefix is a compile-time marker; `shared T(...)` evaluates to `SharedRef[T]`. Applying `shared` to a non-`shared class` type is `E_SHARED_ON_LOCAL`. Omitting the `shared` prefix when calling a `shared class` constructor is `E_SHARED_MISSING_PREFIX`.

The `class_decl_mod` production was introduced in §1-19.14 to replace the production formerly named `modifier`, avoiding conflict with the `modifier` method declaration keyword.

**`unsafe {}` lock-release block (§3-2.4.14):**

```
sync_unsafe_block ::= 'unsafe' '(' string_lit ')' '{' stmt* '}'
```

The `string_lit` reason is mandatory (`E_UNSAFE_NO_REASON`). The region is valid in any function or method body (§3-2.4.6); the *lock-release* semantics this production is named for apply only inside a `modifier` method body on a `synchronized` class (§3-2.4.14). Using the region elsewhere is not an error — it simply carries no lock semantics.


### §1-19.16 Syntactic Grammar — v1.16 Additions

*(This section is normative. Productions new in v1.16. Applies to all modes unless noted.)*

**`atomic {}` block (§2-1.7, scripted and compiled only):**

```
atomic_block    ::= 'atomic' '{' stmt* '}'
stmt            ::= ... | atomic_block
```

`atomic` is a new reserved keyword. Usage in `@mode(host.native)` or `@mode(freestanding)` is `E_ATOMIC_NOT_WASM`.

**`reinterpretChecked[T, U]` expression (§3-3.18):**

```
reinterpret_expr ::= 'reinterpret' '[' type ',' type ']' '(' expr ')'
                   | 'reinterpretChecked' '[' type ',' type ']' '(' expr ')'
```

`reinterpretChecked` does not require `@unsafe`. `reinterpret` still requires `@unsafe`.

**`@lockOrder` annotation (§3-2.4.13):**

```
lock_order_annotation ::= '@lockOrder' '(' integer_lit ')'
class_annotation      ::= ... | lock_order_annotation
```

`@lockOrder(n)` is valid on any class declaration (`synchronized` or plain — plain classes use it for explicitly-managed locks such as freestanding spinlocks); it is available in all compiled modes including `@mode(freestanding)`. See §3-2.4.13 for the ordering rules. `n` must be a positive integer literal.

**`@interruptSafe` annotation (§3-3.24.1, freestanding only):**

```
func_annotation ::= ... | '@interruptSafe'
```

**`@signalSafe` annotation (§1-18.9, native only):**

```
func_annotation ::= ... | '@signalSafe'
```

**`@debug_control_channel` and `@debug_trace_channel` annotations (§3-3.25.3, freestanding `--debug` only):**

```
func_annotation     ::= ... | '@debug_control_channel' | '@debug_trace_channel'
```

`@debug_control_channel` and `@debug_trace_channel` are valid only on `func` declarations at module scope in `@mode(freestanding)` `--debug` builds. Using either in a release build is `E_FREESTANDING_MODULE`. Wrong return type is `E_FREESTANDING_CONTROL_CHANNEL_SIG` or `E_FREESTANDING_TRACE_CHANNEL_SIG`. Multiple definitions of either are `E_FREESTANDING_CONTROL_CHANNEL_DUPLICATE` or `E_FREESTANDING_TRACE_CHANNEL_DUPLICATE`.

**Specified pending implementation.** Both annotations parse and are accepted on functions, but they are currently **inert** — no debug channel is synthesized and none of the four validation diagnostics above are raised. See the status notice at §3-3.25.

**`@naked` with required `@unsafe` (§3-3.14):**

The grammar for `@naked` functions is unchanged. The normative requirement is semantic: a `@naked` function MUST have `@unsafe("naked: ...")` in its annotation list. The compiler enforces this as `E_NAKED_NOT_UNSAFE` at the declaration site.

**`NativeHandle?` return type (§2-3.4):**

`NativeHandle?` in an `extern native` return type position is parsed as `type_nullable` (the existing `T?` grammar, §1-4.3). No new grammar production is required; the compiler maps optional `NativeHandle` to null-pointer checking at the FFI boundary.

**`field_ref[T, F]` — compile-time field reference (§3-3.17a):**

```
field_ref_expr  ::= '.' IDENT
```

A bare `.fieldName` expression (leading dot, no receiver) in the argument position of `PartialInit.set(field, value)` is parsed as a `field_ref[T, F]` compile-time expression. It is not valid in any other expression position. The type `T` is inferred from the `PartialInit[T]` receiver; `F` is the field type. `E_FIELD_REF_INVALID` if the identifier does not name a field of `T`.

**`PanicSource` (§3-3.6):**

The `PanicSource` enum is a new built-in enum type available in `@mode(freestanding)`. Its definition and use as an optional extended parameter to `@panic_handler` are specified in §3-3.6. No new grammar productions are needed — it uses the existing enum and function-parameter grammar.

**New keywords added in v1.16:**

| Keyword | Section | Notes |
|---|---|---|
| `atomic` | §2-1.7 | Reserved in all modes; only usable in scripted/compiled |

### §1-19.17 Syntactic Grammar — v1.17 Additions

*(This section is normative. Applies to all modes unless noted.)*

v1.17 adds no new grammar rules beyond the dotted `ModeName` form (§1-2.5.1). The `ModeDirective` production was updated in §1-19.2 to accept the new `web.scripted` / `web.compiled` / `host.scripted` / `host.dual` / `host.native` / `freestanding` mode names.

### §1-19.18 Syntactic Grammar — v1.20 Additions

The following productions are added in v1.20.

**Imaginary literals (§1-3.6).**

```ebnf
ImaginaryLiteral ::= ( DecimalLit ImaginarySuffixI )
                   | ( FloatLiteralUnsuffixed ImaginarySuffix )
ImaginarySuffix  ::= "i" | "i32" | "i64"
ImaginarySuffixI ::= "i"
```

`FloatLiteralUnsuffixed` is the existing `FloatLiteral` production without its type suffix portion — the imaginary suffix replaces the float suffix at the same position.

The lexer rule for `ImaginaryLiteral` takes precedence over the float-followed-by-identifier rule when the suffix is exactly `i`, `i32`, or `i64` and is not followed by an identifier-continuation character. A literal like `2.3in` (which would be ambiguous between "2.3 imaginary, then identifier `n`" and a hypothetical `2.3in` literal) is parsed as `2.3i` followed by the identifier `n`.

**Disambiguation from integer suffixes.** A bare integer-form literal followed by `i32` or `i64` (e.g. `42i32`, `42i64`) parses as an `IntLiteral` with the `IntSuffix` `i32`/`i64`, not as an `ImaginaryLiteral`. The integer-suffix `i32`/`i64` interpretation always wins on integer-form literals, preserving v1.x source compatibility for existing `int32`/`int64` literals. To write an integer-valued imaginary, use `42i` (which produces `complex` since `i` is unambiguously imaginary), `42.0i32` (`complex32`), or `42.0i64` (`complex64`).

**Array section expressions (§1-5.9).**

The existing single-axis `PostfixOp` index forms in §1-19.5 — `"[" Expr "]"` (single-element index) and `"[" [Expr] ":" [Expr] [":" [Expr]] "]"` (single-axis slice) — are subsumed in v1.20 by the more general comma-separated form below. The pre-existing single-axis forms remain valid as the one-element case of `IndexList`.

```ebnf
IndexExpr        ::= PostfixExpr "[" IndexList "]"
IndexList        ::= IndexElement { "," IndexElement }
IndexElement     ::= ScalarIndex | SliceIndex
ScalarIndex      ::= Expression
SliceIndex       ::= [ Expression ] ":" [ Expression ] [ ":" Expression ]
                   | "::" Expression                              (* full extent with stride *)
```

A `SliceIndex` with both `start` and `stop` omitted is `:`. A `SliceIndex` with `step` of `-1` (and no `start`/`stop`) is the reversal form `::-1`. When all `IndexElement` entries are `ScalarIndex`, this is the existing single-element index form; when any element is a `SliceIndex`, this is a section expression returning a view.

**`for concurrent` statement (§2-1.11).**

```ebnf
ForConcurrentStmt     ::= "for" "concurrent" "(" ConcurrentBindingList ")" Block
ConcurrentBindingList ::= ConcurrentBinding { "," ConcurrentBinding }
ConcurrentBinding     ::= "let" Identifier "in" Range
Range                 ::= Expression ".." Expression
                        | Expression
```

`for` and `concurrent` are reserved keywords; `concurrent` is a *contextual* keyword — it is reserved only after `for` and may appear as an identifier in other positions (for backward source compatibility with code that uses `concurrent` as a variable name). The grammar production for an ordinary `for` loop (`ForStmt`) is unchanged; the `for concurrent` form is selected at parse time when the next token after `for` is `concurrent`.

**Multi-dimensional array type (§1-4.10).**

The existing `GenericType` production already accommodates `array[T, rank]` syntax. The named-parameter forms `array[T, rank, order: ..., base: ...]` use the standard named-argument grammar:

```ebnf
ArrayType         ::= "array" "[" ArrayTypeArgs "]"
ArrayTypeArgs     ::= Type "," Expression { "," NamedTypeArg }
NamedTypeArg      ::= Identifier ":" Expression
```

`Expression` here is restricted to compile-time-evaluable forms: integer literals, `Order` enum variants (`RowMajor`, `ColumnMajor`), and constant expressions of those.

**Complex number type (§1-4.1.6).**

The complex types `complex`, `complex32`, and `complex64` are added to the `PrimaryType` production in §1-19.7 as new alternatives alongside the existing primitive types. No new dedicated production is introduced — they participate in the `PrimaryType` enumeration directly.

**`Order` enum reference and `array.shape:` parameter.** The `Order` enum and the `shape:` parameter for `Array` interchange encoding use the standard enum-reference and named-argument grammars; no new productions are required beyond those above.

**`@strategy` annotation (§2-1.11).**

```ebnf
StrategyAnnotation ::= "@strategy" "(" StrategyKind ")"
StrategyKind       ::= "sequential" | "simd"
                     | "threadPool" [ "(" StrategyArgs ")" ]
                     | "accelerator" [ "(" StrategyArgs ")" ]
StrategyArgs       ::= NamedArg { "," NamedArg }
```

This is a special case of the general annotation production; specified here for completeness.

**Safety annotations (§1-8.12).**

```ebnf
func_annotation   ::= ... | "@total"
enum_annotation   ::= ... | "@complete" "(" ( Identifier | StringLiteral ) ")"
class_annotation  ::= ... | "@must_resolve" | "@noderef"
struct_annotation ::= ... | "@noderef"
```

`@total`, `@must_resolve`, and `@noderef` take no arguments. `@complete` requires exactly one argument — a type name written as an identifier or a string literal; the no-argument form `@complete` is a compile-time error. Each annotation is valid only on the target shown: `@total` on a function, `@complete` on an enum, `@must_resolve` on a class, `@noderef` on a class or struct. Any other target is a compile-time error. See §1-8.12 for the enforced semantics and §1-8.12.5 for the error codes (`E_TOTALITY`, `E_INCOMPLETE_VARIANT`, `E_UNRESOLVED`, `E_NODEREF`).

**Architecture templates (§1-23).**

```ebnf
TemplateDecl        ::= [ Modifiers ] "template" ( TemplateFoundation | TemplateOverlay )
TemplateFoundation  ::= "foundation" Identifier [ ImplementsClause ] TemplateBody
TemplateOverlay     ::= "overlay" Identifier "onto" Identifier TemplateBody
TemplateBody        ::= "{" { TemplateMember } "}"
TemplateMember      ::= { Annotation } ( FieldDecl
                                       | MethodDecl
                                       | PartMember )
PartMember          ::= "part" MethodDecl          (* with body  = DEFAULTED *)
                      | "part" MethodSignature ";"  (* no body    = REQUIRED  *)
```

A template member takes annotations exactly as a class member does, written before the
member (`@interruptSafe part func poke(): void { … }`, loup#988), and they are judged by
the same member rules (`@lockOrder` is a class declaration's, `@entry` / `@naked` a
module-level function's). They ride the composed member (§1-23.4).

`foundation`, `overlay`, `onto`, and `part` are contextual keywords: a `template`
declaration parses as a `TemplateDecl` only when immediately followed by `foundation`
or `overlay` (otherwise the `template` fence forms of §1-16 apply). `MethodDecl` /
`MethodSignature` / `FieldDecl` / `ImplementsClause` / `Modifiers` are the existing
productions (§1-8, §1-10, §1-11). The composed product is an ordinary `StructDecl`
(§1-19.7) synthesized by the compiler; see §1-23 for the composition semantics.

**Compile-time evaluation and selection (§1-7.1, §1-6.3, §1-13.3).**

```ebnf
VarDecl        ::= … ( "let" | "var" | "const" ) DestructPattern [ ":" Type ] [ "=" Expr ]
ConstFuncDecl  ::= { Annotation } [ "pub" ] "const" "func" Identifier [ TypeParams ]
                   "(" [ ParamList ] ")" [ RequiresClause ] [ ":" Type ] [ WhereClause ] Block
IfConstStmt    ::= "if" "const" "(" Expr ")" Block
                   { "else" "if" [ "const" ] "(" Expr ")" Block } [ "else" Block ]
```

`const` is added to `VarDecl` as a third introducer rather than treated as a spelling of
`let`: it declares a compile-time constant, and `let` already produces an immutable
binding. `ConstFuncDecl` joins both `Declaration` alternative lists — a const-evaluable
helper is admissible wherever a `func` is, including inside a block. `IfConstStmt` joins
`BlockStmt` and is a **statement only**; there is no `if const` expression form, because a
construct whose branches are all type-checked but only one lowered has no value to yield in
the arms that are dropped.

Three restrictions are deliberately **semantic rather than syntactic**, and stating why
matters more than the productions:

- A `const func` body is an ordinary `Block`. The closed feature set is a list of rules
  with their own diagnostics (`E_CONST_FORBIDDEN_CONSTRUCT`, `E_CONST_CALLS_NON_CONST`,
  `E_CONST_MUTABLE_STATE`); a grammar that encoded it would report a violation as a parse
  error, which tells a reader where the parser stopped rather than which rule they broke.
- An `if const` condition is an ordinary `Expr`. That it must be const-evaluable is
  `E_CONST_NOT_EVALUABLE`, not a narrower production.
- There is **no new production for `options.<name>`**. It is an ordinary member access on
  an identifier, already covered by the `PostfixOp` `"." Identifier` form of §1-19.5, and
  what makes it a build-option read is const evaluation resolving the four reserved
  namespaces (`options`, `freestanding`, `build`, `target`) rather than any syntax. Giving
  it a production would imply the namespaces are keywords — they are not, and `options` is
  a perfectly ordinary identifier everywhere else.

No addition is needed in §1-19.1: that section has no `Keyword` production, and the
reserved list it would draw on lives in §1-3.4, which carries `const` already.

**Divergence markers (§1-4.4a, §1-4.4b, §1-5.11).**

Three reserved words are added, all in §1-3.4. Two are admitted by `PrimaryType`
(§1-19.7) and one by `PrimaryExpr` (§1-19.5):

```ebnf
PrimaryExpr    ::= … | "unreachable"
PrimaryType    ::= … | "noreturn" | "impossible"
```

The grammar spells them without restricting where they may appear, and the position
restrictions are semantic rather than syntactic:

- `noreturn` is legal only as a function or function-type return type; every other
  position is `E_NORETURN_POSITION`.
- `impossible` is legal only as a type argument landing in an enum variant payload;
  every other position, `list[impossible]` included, is `E_IMPOSSIBLE_POSITION`.

They are stated this way deliberately. Encoding the restrictions in the grammar would
require a separate production per admissible position and would report a violation as a
parse error, which tells a reader where the parser stopped rather than what rule they
broke. A semantic check names the rule.


---

---

## §1-20 Tooling

*(This section is non-normative.)*

### §1-20.1 Command-Line Interface

**`loup run path/to/file.loup`** — Execute a Loup source file using the JIT compilation pipeline. This is the baseline single-file execution workflow. The script prelude (§2-5.2) is available in the entry file.

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

**Diagnostics of a build.** `loup build` reports every diagnostic the front end gives the program — its warnings as well as its errors — whether or not the build succeeds, on every target and backend, as `loup check` reports them: the same rows (code, message, file, line and column, source excerpt), in the same order, each once (a diagnostic of an imported module is not repeated for each module that imports it). A warning never changes the exit status or the artefact. A warm build reports what a cold one does: a module served from the build's artifact cache replays the diagnostics its compile produced, and a cached module stands only for a compile with the same options (the manifest's modes and `[freestanding]` check knobs, `LOUP_OVERLAYS`), so a changed option recompiles it. *(loup#987, 1.29.0: Stage0's build routes used to report a module's diagnostics only when it had errors, so a successful build printed no warning.)*

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

**`loup add <package>[@version]`** — Resolve and add a dependency to `.lppkg`, update `loup.lock`, and precompile the newly added package's modules to the Wasm cache (§1-20.7).

**`loup install`** — Install all dependencies recorded in `loup.lock` and precompile each installed module to the Wasm cache. `loup install` is idempotent: packages with up-to-date cache entries are not recompiled.

```
loup install                    # install + precompile all deps
loup install --no-precompile    # install source only, skip Wasm cache
loup install --offline          # use only local cache; error if any dep is missing
loup install --locked           # CI mode: error if loup.lock would change;
                                #   ignores [dev-overrides] and LOUPPATH
```

When `loup install` processes `[dev-overrides]` entries, it compiles those packages to the **project-local cache** (`.loup/cache/`) rather than the global cache, so that locally-patched artifacts do not overwrite globally-shared entries. Published dependencies from `loup.lock` are written to the global cache as usual.

**`loup test`** — Discover and run test files. Test files match `**/*.test.loup`. Requires the `testing` core package (§1-13.8).

```
loup test                              # run all tests in the project
loup test path/to/file.test.loup       # run a specific test file
loup test --filter "addition"          # run tests whose name contains the filter string
loup test --watch                      # re-run on file change
```

**`loup publish`** — Publish a package to a registry. Requires prior `loup auth login`. If the project's `.lppkg` contains a `[dev-overrides]` section with any active entries, `loup publish` emits a warning listing the overridden packages and requires explicit confirmation (`--force`) before proceeding. The `[dev-overrides]` section is stripped from the manifest uploaded to the registry.

**`loup auth login`** — Authenticate with a registry and store credentials in the system keychain.

**`loup fmt`** — Format Loup source files using the reference formatter. Rewrites symbol logical operators to their canonical keyword forms: `&&` → `and`, `||` → `or`, `!` → `not` (see §1-3.7, §1-20.4).

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

**`loup debug attach`** — Connect to a running freestanding debug service (§3-3.25.8):

```
loup debug attach --uart /dev/ttyUSB0 --baud 115200
loup debug attach --tcp 192.168.1.100:2345
loup debug attach --semihosting
loup debug attach --uart /dev/ttyUSB0 --trace-swo /dev/ttyUSB1
```

Reads the portal name table from the target via `QUERY_PORTALS`, presents the portal activation interface, and optionally streams time-travel replay (`READ_REPLAY_BUFFER`). Requires a `--debug` freestanding binary with at least one channel configured (§3-3.25). See §3-3.25.8 for the full transport option reference.

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

### §1-20.2 Shebang Support

Unix-style shebang execution is supported:

```
#!/usr/bin/env loup run
let name = env("USER") ?? "world";
print(i"Hello, {$ name $}!");
```

### §1-20.3 REPL

The reference toolchain provides a REPL for exploratory scripting. The REPL:

- Supports `await` at the top level.
- Provides the script prelude.
- Sets `__name__` to `"__main__"` and `__file__` to `"<repl>"`.

### §1-20.4 Formatter

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

**Semicolons.** Semicolons are optional in Loup (§1-3.3). The formatter preserves semicolons exactly as the programmer wrote them — it does not add missing semicolons or remove present ones.

### §1-20.5 Language Server

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
| `textDocument/formatting` | Invokes the reference formatter (§1-20.4) |
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

**Workspace detection.** The language server locates the project of an opened file
by §1-13.3's project root discovery (the nearest enclosing manifest; namespace
directories carry none and are transparent), so a file inside a namespaced
package (`…/loup/webworks/`) belongs to that package, and resolves imports as
§1-13.9 does. Multi-root workspaces are supported.

**Template fence support.** Inside template fences, completions and hover are
provided for Loup interpolation expressions (`{$ ... $}`). The fence body
(HTML, CSS, SQL, etc.) is forwarded to an embedded sub-server for that
language when available.

### §1-20.6 Browser Bootstrap and Performance

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
4. **Hydration (SSR only).** If `<script id="__loup_state__" type="application/json">` is present, reads the serialized state and initializes signals before mounting. Verifies `data-integrity` hash if present (§2-4.7).
5. **Mount.** Calls the application's entry point (`mount(App(), "#root")`).
6. **Web Component registration.** Before step 5, `loup-rt.js` calls `customElements.define(name, cls)` for each class annotated with `@webcomponent` in the loaded Wasm module. Registration follows source declaration order within each module and dependency module order across modules. This step occurs after Wasm instantiation (step 1) but before event wiring (step 3) and mount (step 5) to ensure custom elements are defined before any component tree that references them is rendered. The revised bootstrap order is therefore: **instantiate → initialize → register custom elements → wire events → hydrate → mount**.

**MIME type requirement.** Wasm modules must be served with `Content-Type: application/wasm` for streaming instantiation to succeed. `loup serve` sets this automatically. Production servers must be configured explicitly — many default configurations serve `.wasm` as `application/octet-stream`, which disables streaming and roughly doubles initialization time.

**Minimizing bootstrap latency.** The dominant factors affecting time-to-interactive, in decreasing order of impact:

1. **Wasm module size.** Use `loup build --target browser --release` for an optimized, stripped module. The `--release` flag enables dead-code elimination and Wasm-level optimization. A typical small-to-medium Loup application produces a 100–400 KB gzipped Wasm module. `loup-rt.js` is approximately 30 KB gzipped and is versioned for long-term caching.

2. **Brotli compression.** Deploy with Brotli when the server and client support it (all major browsers do). `loup build` produces pre-compressed `app.wasm.br` and `app.wasm.gz` files. Serve the `.br` variant with `Content-Encoding: br` when `Accept-Encoding` includes `br`. Brotli typically reduces size by 15–25% versus gzip.

3. **Preload hints.** The generated HTML shell includes `<link rel="preload">` for the Wasm module, instructing the browser to fetch it immediately on HTML parse — before `loup-rt.js` has executed — eliminating one network round-trip from the critical path.

4. **Runtime caching.** `loup-rt.js` uses a versioned filename (e.g., `loup-rt.1.0.0.js`) served with `Cache-Control: max-age=31536000, immutable`. Application Wasm filenames are content-hashed. Returning users skip both downloads entirely.

5. **SSR + hydration.** For content-heavy or SEO-sensitive applications, use the SSR path (`ui.web.renderToString`, §2-4.7). The browser receives meaningful HTML immediately; the Wasm bundle loads in the background and hydrates the rendered tree without a visible layout shift.

6. **Streaming Wasm compilation.** Modern browsers compile Wasm in a background thread while bytes are still downloading, provided the MIME type is correct. This is automatic when the MIME type is set correctly — no developer action required.

**`loup serve` (development server).** The development server:

- Serves `dist/` with correct MIME types including `application/wasm`.
- Serves `*.wasm.map` files with `Content-Type: application/json` and `Access-Control-Allow-Origin: *` so Chrome DevTools can fetch source maps from any local port.
- Watches source files and triggers incremental `loup build` on change.
- Sends a reload signal to connected browsers via a lightweight WebSocket after each successful rebuild.
- Sets `Cache-Control: no-cache` on all responses so rebuilt artifacts are always fresh.
- When started with `--inspect`, injects a debug bootstrap `<script>` into the served `index.html` that calls `debug.browser.start()` before the application entry point. See §1-20.6.2.

**CSP configuration.** The minimum required Content Security Policy is:

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'wasm-unsafe-eval';
  connect-src 'self';
```

No `'unsafe-inline'` or `'unsafe-eval'` is required. `'wasm-unsafe-eval'` permits Wasm evaluation but not `eval()` or `new Function()`.

### §1-20.6.1 Source Map Delivery

*(This section cross-references §1-2.1, which defines normative source map rules.)*

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

### §1-20.6.2 Debug Server Bootstrap (`--inspect`)

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

### §1-20.7 Module Wasm Cache

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
        net_http.lppkg.sig       # signature sidecar (§1-13.5)
```

A package's cache directory is its FULL dotted name as one path component (`loup.http/`, never `loup/http/`): the cache keys packages by name and version, while the namespace layout of §1-13.3 / §1-13.9 belongs to package roots.

**Cache key.** A cache entry is valid if and only if:

1. The package name and version match.
2. The Loup toolchain version matches (ABI-breaking toolchain changes invalidate all entries).
3. The SHA-256 hash of the module's source files matches the `.hash` sidecar.

`loup run` checks all three conditions before deciding whether to JIT-compile or instantiate from cache. The check requires a single file read (the `.hash` sidecar) and is fast.

**Cache population.** `loup install` compiles each installed module's source to Wasm using the same optimizer settings as `loup build --target cli --release`, stores the result in the appropriate cache tier, and writes the source hash sidecar:

- **Registry packages** (resolved from `loup.lock`) → written to the global cache.
- **Dev-override packages** (from `[dev-overrides]` or `loup link`) → written to the project-local cache.

Precompilation runs in parallel across modules using all available CPU cores. On a modern machine with a warm build cache, `loup install` for a medium-sized project (20–50 packages) typically completes in under 10 seconds.

**`LOUPPATH` packages bypass the cache entirely** and always use the JIT pipeline. They are assumed to change frequently and cache invalidation on every save would exceed the benefit. See §1-13.9.

**Cache invalidation.** A cache entry is invalidated when:

- The module's source changes (hash mismatch).
- The Loup toolchain is upgraded (toolchain version component of the cache path changes).
- `loup cache clean` (global) or `loup cache clean --local` (project-local) is run explicitly.

Cache entries for removed packages are not automatically cleaned — use `loup cache clean --prune-orphans` to remove entries for packages no longer in `loup.lock`.

**Interaction with `prefer compiled`.** The fallback resolution algorithm (§1-13.7) checks both cache tiers (project-local first, then global) as part of its compiled-artefact search, before searching the source directory. A cache hit at either tier satisfies `prefer compiled`.

**User-authored modules.** The Wasm cache covers installed packages only. User-authored modules in the project's `src/` tree use the JIT pipeline with incremental re-compilation (§1-2.1). Persistent caching of user modules is left to a future incremental compilation cache feature (§1-22).

**.gitignore recommendation.** The following entries are recommended for projects using version control:

```
.loup/cache/
```

The global cache (`~/.loup/cache/`) is never committed — it lives outside the project tree. The project-local cache contains compiled artifacts that are fully reproducible from source and should not be committed.


### §1-20.8 Project-Local Cache and Development Isolation

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


### §1-20.9 Hardware Management Commands

*(Full specification moved to the [Loup Packages Reference](loup-packages-reference-v1_12.md).)*

Hardware management commands (`loup hardware detect`, `loup hardware compile`,
`loup hardware list`) are available when hardware backend packages are
installed.  See the Packages Reference §1-20.9 for the complete CLI reference.

## §1-21 Progressive Disclosure

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
- `string`'s byte reads (`byteLength`, `byteAt`, §1-4.1.5), `core.text` (including `char`, `graphemes`, `normalize`), `data.json`, `core.collections`

### Tier 2: Intermediate

- Enums and `match`
- `Result[T,E]` and `?` propagation
- `attempt` — unwrap a `Result` into an enclosing `catch Err` arm (§1-5.10)
- `Option[T]` / `T?` / `?.` / `??`
- `async`/`await`
- Template fences
- `core.time`
- Explicit `portal` blocks
- Structs
- Union types
- Ownership verbs: `reads`, `edits`, `takes`, `shares` — parameter ownership contracts available in all modes (§3-2.4.9)
- `modifier` — class method mutation contracts (§3-2.4.11)
- `complex32` / `complex64` — complex arithmetic for scientific computing (§1-4.1.6)
- `array[T, rank]` — multi-dimensional array primitive with slicing (§1-4.10, §1-5.9)
- `for concurrent` — parallel iteration with implementation-chosen strategy (§2-1.11)

### Tier 3: Advanced

- Structured concurrency (`await group`, `TaskGroup`, `for await`)
- `ui` components and `ComponentRegistry`
- FFI (`extern js`, `extern native`, `@jsexport`)
- Reflection (`core.reflect`)
- Dynamic objects (`dynamic class`, `!{}`)
- Generators and `yield`
- Decorators
- `@mode(web.compiled)`, `@mode(host.dual)`, `@mode(host.native)`, `@mode(freestanding)` — execution modes (§1-2.4)
- `safe {}` / `safe func` — compile-time shared-XOR-mutable enforcement (§3-2.4.12)
- `synchronized` class — runtime-locked mutation for async and multi-threaded contexts (§3-2.4.13)
- `requires distinct()` — parameter disjointness contracts (§3-2.4.10)
- `noreturn` / `unreachable` / `impossible` — stating that control does not return, that a point cannot be reached, and that a case cannot occur (§1-4.4a, §1-5.11, §1-4.4b)
- `const func` and `if const` — computing at compile time, and selecting a branch before lowering (§1-7.1, §1-6.3)
- `[options]` — declared build options, read as `options.*` from `if const` (§1-13.3)
- Error return traces — the propagation path of a `Result` error, in builds that capture it (§1-5.7)
- `unique class`, `arc let` — explicit ownership at the type and binding level (§1-8.11, §1-6.2)
- Freestanding mode: `asm { }`, `@interrupt`, `volatile`, `@repr` (§3-3)
- Lifetime parameters (`lifetime ~name`, `borrow[~name]`) and region inference
- Macros
- Actors and supervision
- Direct capability objects (`runtime.fs`, `runtime.proc`, `runtime.net`)
- `debug` and time-travel debugging
- `atomic {}` — cooperative atomicity scope (§2-1.7)
- Freestanding debug portals and time-travel replay — dual-channel debug service, `FreestandingDebugConfig`, `ControlPollMode`, ring buffer retrieval via `READ_REPLAY_BUFFER` (§3-3.25)
- `@lockOrder(n)` — lock ordering contracts on `synchronized` classes (§3-2.4.13)
- `@interruptSafe` + `InterruptGuard` — interrupt-context safety in freestanding mode (§3-3.24)
- `@signalSafe` — signal handler safety annotation, native mode (§1-18.9)
- `reinterpretChecked[T, U]` — runtime-checked type reinterpretation (§3-3.18)
- `PartialInit[T]` — compile-time field-tracked struct initialization (§3-3.17a)
- `DmaBuffer[T]`, `native.dma` — ownership-mapped DMA for freestanding (§3-3.20)
- `native.atomic.hwFence` + `MemoryOrder` — hardware memory barriers (§3-3.20)
- `native.mpu` — MPU stack-guard installation (§3-3.20)
- `PinnedRef[T]`, `OwnedHandle`, `BorrowedHandle` — FFI ownership types (§2-3.4)
- `core.fpenv` — IEEE 754 environment access for scientific reproducibility: scoped rounding modes, exception flag tracking, signaling NaN (§1-4.1.7, §21.11)
- `for concurrent @strategy(...)` — explicit parallelism strategy: `simd`, `threadPool`, `accelerator` (§2-1.11)
- `@assume(distinct(...))` — programmer-asserted index disjointness for indirect-indexed concurrent loops (§2-1.11)
- `Encoding.Array` interchange encoding — auto-derived pack/unpack for byte-precise multi-dimensional array layouts with row/column-major conversion (§4-2.4)
- HPC packages: `loup.blas`, `loup.lapack`, `loup.scalapack`, `loup.openmp`, `loup.mpi`, `loup.fortran.*` — see [Loup Fortran HPC Packages v1.0](loup-fortran-hpc-packages-v1_0.md)

### Guidance

- Compiler diagnostics explicitly explain when a user crosses into advanced concepts.
- Generated project templates prefer task-focused entry points: `script`, `cli`, `generator`, `service`, `webapp`.
- Beginner-facing materials teach interpolated strings before template fences, `Option[T]` before `Result[T,E]`, and sync examples before async.
- WCET (worst-case execution time) and real-time deadline modeling are intentionally outside the language specification; see §1-22 for the rationale and future tooling integration notes.

---

## §1-22 Future Directions

*(This section is non-normative.)*

The following features are under consideration for future versions of the Loup specification:

- **WCET and timing constraints.** Worst-case execution time analysis, hard real-time deadline modeling, and timing-constraint annotations for safety-critical targets (automotive, medical, aviation) are explicitly out of scope for the Loup language specification. These capabilities belong in external static analysis tooling (e.g., a future `loup analyze --wcet` command) that operates on the compiled binary rather than the source language. The specification will document WCET tool integration points when such tooling is standardized.

- **Incremental compilation cache.** Fine-grained caching of compilation artifacts for faster rebuilds.
- **`loup lsp` improvements.** ARC cycle detection code actions, operator interface scaffolding, HTML context escaping hints.
- **Loup Common UI desktop backends.** `ui.desktop` is `loup.ui.desktop` over the UI backend contract (§2-4.8, `loup-ui-backend-contract.md`); the Wayland, macOS and Win32 backends are the UI program's phases P8, P13 and P14 (`status/ui-program.md`). *(Replaced in v1.21: this entry said Skia, WebGPU and platform-native widget backends were under development; ruling M20 struck the implementation-defined renderer and native widgets.)*
- **WASI target.** `loup build --target wasi` for non-browser Wasm hosts.
- **`Url` type extensions.** `Url.parse`, relative URL resolution, query parameter construction.
- **`SafeHtml` builder API.** Fluent programmatic HTML construction without template fences.
- **Effect system.** Tracking side effects in the type system for purity guarantees.
- **Dependent types.** Limited dependent typing for array lengths and numeric constraints.
- **Module-level `async`.** Allowing `await` during module initialization with explicit opt-in.
- **Pattern matching extensions.** Active patterns, view patterns, and pattern synonyms.
- **Hot module replacement (HMR).** Atomic replacement of an existing module's code at runtime, preserving live references and reachable state. `runtime.compile` (§2-5.1) already provides the foundational primitive — JIT-compiling a Loup source string into a `Module` and invoking exports — but it loads *new* modules; it does not swap the implementation of a module other code is already holding references to. Full HMR adds three capabilities: (1) atomic replacement of a module's exported function bindings such that next-call resolution sees the new implementations without invalidating in-flight calls; (2) class-identity preservation across replacement so that already-instantiated objects of a replaced class continue to behave correctly, with method dispatch picking up the new method bodies; (3) state migration hooks that let the program move data from the old module's globals into the new module's globals before the swap completes. The primary motivating use case is editor iteration in long-running interactive programs — game engines reloading gameplay code during a play session, simulation tools refreshing analysis modules without losing scene state, server processes adopting bug fixes without dropping connections. The challenges are mostly around ARC retain-count migration and weak-reference re-binding during the swap window; the portal infrastructure (§1-6.7, §2-5.3) provides a natural integration point for marking module-replacement boundaries in trace history.
- **XLA kernel cache.** Persistent caching of compiled XLA/StableHLO executables across process restarts, keyed on program hash and device topology.
- **`native.simd` on Wasm.** General `Vec[T, N]` and `@vectorize` access via the `native.simd` API on Wasm targets. Partially addressed in v1.20: `for concurrent` with `@strategy(simd)` in `@mode(web.compiled)` lowers to Wasm SIMD instructions (gated on browser support). Direct `native.simd` API access on Wasm targets remains future work.
- **Extended numeric math.** `core.math` module extended with additional transcendental functions for `float32` variants and SIMD vectors.
- **Verb modifiers in function types with named parameters.** Full `fn(reads src: T, edits dst: T) requires distinct(src, dst): R` syntax for function type positions, enabling disjointness contracts on higher-order function parameters. Currently blocked by positional-only parameters in function types (§1-4.4).
- **Algebraic effects.** First-class effect handlers as an alternative to exceptions and async.

- **Async work-stealing tuning.** Adaptive work-stealing strategies and executor affinity hints for NUMA-aware scheduling.
- **Cycle-tolerant class kind details.** (`traced class` entry above.) Design details: an opt-in class modifier that commits to tracing-GC semantics in scripted and web modes — cycles are automatically reclaimed, finalizer timing is non-deterministic, scripted-only deployment. Deferred from v1.18 pending evidence of user demand beyond what manual `weak`-based cycle breaking provides.
- **User-module incremental compilation cache.** Persistent caching of compiled Wasm artifacts for user-authored modules (not just installed packages) across `loup run` invocations.
- **`net.ws` browser target.** Native `net.ws` client support on the `browser` target (currently uses `lang.interop.js` bridge).
- **`ThreadLocal[T]` on Wasm.** Now partially addressed in v1.18 via `SharedRef[T]` and shared-arena allocation; a full `ThreadLocal` emulation remains future work for cases where per-context storage is specifically desired rather than shared storage.
- **`loup.db` driver ecosystem.** Reference driver implementations for PostgreSQL, SQLite, and MySQL under the `loup.db.*` namespace.
- **`loup.ai` ecosystem.** Expand provider sub-packages and add `loup.ai.embeddings`, `loup.ai.vision`, and structured agent-loop primitives built on the actor model (§2-1.6) and portal debug infrastructure (§1-6.7).
- **TPU `ptx`-equivalent fence.** A `triton` or `mosaic` fence descriptor for authoring TPU kernels in a higher-level IR without writing raw StableHLO.
- **`native.hal` NUMA-aware scheduling.** Affinity hints for multi-socket CPU + multi-GPU + multi-TPU systems.
- **`loup.backend.rocm`.** AMD ROCm/HIP backend for AMD GPU ML workloads (alternative to Vulkan for compute-heavy tasks).
- **Int4 / FP8 dtypes.** `DType.Int4`, `DType.Float8E4M3`, `DType.Float8E5M2` for next-generation quantised inference on NVIDIA Hopper, AMD CDNA3, and TPU v5+.
- **Distributed tensor ops.** `loup.tensor.distributed` — multi-device tensor sharding, all-reduce, and pipeline parallelism primitives.
- **`loup.backend.tpu.pjrt` auto-discovery.** Automatic detection of third-party PJRT plugins from standard install paths without requiring `PJRT_PLUGIN_PATH`.
- **Streaming serialization.** Extension of §4-1.10 `FormatDriver` with full streaming contracts — chunked encoding, progressive validation, partial-value emit, and back-pressure handling. The `StreamingFormat` sub-interface is declared in v1.18 but its contract is thin; a future revision pins down streaming semantics for each format-driver category.
- **IDL / schema generation.** A `loup schema export --format proto|fbs|openapi|...` command that produces wire-format schema files from `Serializable` types. Enables cross-language interop where the peer ecosystem consumes a schema file (Python/TypeScript/Rust) rather than importing Loup's type graph directly.
- **Cross-language type-mapping registry.** A normative mapping from Loup types (`int32`, `decimal`, `Instant`, `Option[T]`, `Result[T, E]`, etc.) to equivalent types in Python, TypeScript, Rust, Go, and JVM languages, to aid interop library authors.
- **RPC library (`loup.rpc`).** A first-party package building on §4-1 for request/response framing, timeout/retry semantics, bidirectional streaming, service discovery, and automatic exception forwarding via `RemoteException`. Will integrate with `debug.mcp` for agent-accessible RPC inspection.
- **Content-addressed data store (`loup.content`).** Built on the `deterministic: true` mode of §4-1.10 `EncodeConfig` — a persistent key-value store keyed by blake3 hash of the canonicalised `Value` representation. Enables cache-like semantics, Merkle-style data structures, and signed-data workflows without per-project encoding conventions.
- **Partial deserialization / lazy fields.** Annotation (`@lazy`) for fields whose deserialization is deferred until first access. Reduces deserialization cost for large values where most fields are never read.
- **Cycle-tolerant class kind (`traced class`).** Previously noted: an opt-in class modifier that commits to tracing-GC semantics in scripted and web modes for cyclic data structures.


---

## §1-23 Composable Architecture Templates

*(This section is normative. Added in v1.20.)*

Architecture templates let a single source tree describe one logical type whose
**shared** behaviour is written once and whose **per-target** behaviour (CPU
architecture, board, build profile) is supplied as a separate, intentional layer.
Composition happens entirely at **compile time**: the selected layers are folded
into one ordinary value-type `struct` before HIR lowering, so there is **no runtime
dispatch, no vtable, and no allocation** — the result is identical to a hand-written
`struct`. This is the mechanism the freestanding HAL uses to give every architecture
its own `Cpu`/`Mmu` implementation from a shared scaffold.

This feature reuses the `template` keyword introduced for template fences (§1-16) but
is syntactically and semantically disjoint: a `template` declaration is an
architecture template **iff** the next token is `foundation` or `overlay`. The words
`foundation`, `overlay`, `onto`, and `part` are **contextual keywords** — they are
ordinary identifiers everywhere except in the positions defined below.

### §1-23.1 Foundation and Overlay

A **foundation** is the base layer. It MAY declare fields, ordinary methods (shared
scaffolding, carried verbatim), and `part` members (the per-target **seams**). It MAY
carry `implements` clauses; the composed struct inherits them.

```loup
template foundation HalCpu implements Cpu {
    pub var cpuId: uint32 = 0;
    func id(): CpuId { var c: CpuId; c.raw = self.cpuId; return c; }  # shared scaffolding
    part func halt(): void;                                          # a REQUIRED seam
    part func contextSwitch(fromSpSave: uint64, toSp: uint64): void; # a REQUIRED seam
}
```

An **overlay** patches a parent named by `onto`. The parent is exactly one foundation
**or** another overlay, so a foundation's overlays form a tree; a linear path from a
leaf up to the foundation is a **chain**. An overlay supplies bodies for `part`
members and MAY introduce further fields/methods/parts.

```loup
template overlay ArmHalCpu onto HalCpu {           # the MIDDLE: fills one shared seam,
    part func halt(): void { asm { "wfi" } }       #   leaves the others REQUIRED
}
template overlay AArch64Cpu onto ArmHalCpu {       # the TERMINAL: completes the chain
    part func contextSwitch(fromSpSave: uint64, toSp: uint64): void { cpuContextSwitch(fromSpSave, toSp); }
}
```

`onto` is **directional binding, not discovery**: an overlay names its parent; a parent
never enumerates its overlays. An overlay onto an overlay is the `overlay onto a
template-overlay` form — the middle layer (`ArmHalCpu` above) is itself an overlay that
must be overlaid again because it still has unfilled required parts.

### §1-23.2 Parts: the per-target seam

A `part func` is a method that the overlay chain MAY override:

- **`part func name(...): T;`** (no body) is **REQUIRED** — some layer in the selected
  chain MUST supply a body, or composition fails (§1-23.4).
- **`part func name(...): T { ... }`** (with body) is **DEFAULTED** — the body is used
  unless a more-derived layer overrides it.

When several layers in a chain supply a part, the **most-derived layer wins** (the one
nearest the terminal). An ordinary `func` (no `part`) is shared scaffolding and MUST NOT
be redefined by an overlay.

### §1-23.3 Terminal selection

A chain's **terminal** is its most-derived overlay — equivalently, a layer that is not
itself the parent of any in-scope overlay. *Completeness decides the terminal*: there is
no terminal keyword. For a given foundation, exactly one terminal SHALL be in scope per
build; the **import graph performs the selection** (a build pulls in only its own
architecture's terminal overlay).

- Zero overlays in scope → the foundation composes alone (all parts must be defaulted).
- Exactly one terminal → it auto-composes (no annotation required).
- More than one terminal for the same foundation → a hard error
  (`E_TEMPLATE_AMBIGUOUS_TERMINAL`); the build must bring exactly one into scope.
  *(Selection by an explicit machine descriptor is a planned later increment.)*

### §1-23.4 Composition semantics

For the selected chain `[terminal, …, foundation]` (most-derived first), the compiler:

1. Collects fields and ordinary methods (first definition of each name wins);
2. Resolves each `part` to its most-derived body;
3. Checks **totality** — every required part MUST be filled, or it is an error
   (`E_TEMPLATE_PART_UNFILLED`) naming the unfilled part and the chain;
4. Emits one `struct` named after the **foundation**, carrying the foundation's
   `implements` clauses and `pub`/visibility modifiers, with members in declaration
   order (fields, then shared methods, then composed parts).

Each composed member keeps its annotations: a field or shared method those it was
declared with, a part those of the layer whose body step 2 chose (a REQUIRED declaration
contributes no body and no annotations). So an `@interruptSafe` part filled by an overlay
is an `@interruptSafe` method of the composed struct — the colour rule reads it
(compilation §3-3.24.1), including the conformance of an implemented interface's
`@interruptSafe` method (row ISRIFACE-1) — and its body is checked as an
interrupt-context method body.

The overlay declarations are then dropped. Because the product is a value-type `struct`,
a composed template is used exactly like a hand-written one (`var c: HalCpu; …`), and a
function returning the foundation interface (`func archCpu(): Cpu { var c: HalCpu; …
let i: Cpu = c; return i; }`) is **identical across architectures** — only the in-scope
terminal differs, so the build selects the realization.

Composition is intra-module, but the chain may span **source files** via `import`: a
module **imports** the foundation/overlay it needs —

```loup
from ...shared.arm_cpu_seam import (HalCpu, ArmHalCpu);   # the shared foundation + middle
template overlay AArch64Cpu onto ArmHalCpu { … }          # this build's terminal
```

— and the compiler splices the named `template` decls (plus their transitive `onto`
ancestors) out of the imported file into the importing module before composition, then
**strips those names from the import**. This lets a shared foundation + middle live in
ONE file that several builds reuse (e.g. an ARM HAL seam imported by both an aarch64 and
an armv7 build), each supplying only its own terminal — the dependency is explicit and
named (no directory scan), resolved by the ordinary import path. Because the template
names are stripped, the import binds nothing for the name resolver. A foundation with no
terminal in a file (e.g. the seam file viewed alone — its middle overlay is an incomplete
leaf) is a template *library* whose required parts are filled at a terminal's site;
**completeness decides terminal**, so composing such a foundation alone is a silent no-op
rather than a totality error. (A non-template name in the same import is left for the
ordinary resolver; resolution into installed packages is unchanged.)

### §1-23.5 Grammar

See §1-19.18 for the `TemplateDecl` / `TemplateMember` productions added to the grammar.

---

## Appendix A: Keyword Index

**Keywords** — These identifiers SHALL NOT be used as variable, function, type, or module names:

| Keyword | Section | Description |
|---|---|---|
| `abstract` | §1-8.3 | Abstract class/method declaration |
| `and` | §1-3.7 | Logical AND operator |
| `as` | §1-13.1 | Import alias, catch binding, dynamic view |
| `async` | §1-7.1 | Async function declaration |
| `attempt` | §1-5.10 | Unwrap a `Result`, transferring `Err` to the enclosing `catch Err` arm |
| `await` | §2-1.1 | Suspend until task completes |
| `break` | §1-6.4 | Exit loop |
| `catch` | §1-6.9 | Exception handler; `catch Err(e)` is the `attempt` Result arm |
| `class` | §1-8.1 | Class declaration |
| `const` | §1-6.2, §1-7.1 | Compile-time constant binding; `const func` is a const-evaluable function |
| `consume` | §3-2.4.7 | Downgrade `unique` binding to ARC-managed reference (`@mode(host.native)` or `@mode(host.dual)`) |
| `continue` | §1-6.4 | Skip to next loop iteration |
| `defer` | §1-6.5, §1-13.10 | Register cleanup action (`defer expr`/`defer { }`); also `from X defer import (...)` for deferred type stubs that break import cycles |
| `del` | §1-6.11 | Deterministic finalization |
| `do` | §1-6.4 | Do-while loop |
| `dynamic` | §1-8.7 | Dynamic class declaration, dynamic view |
| `else` | §1-6.3 | Alternative branch |
| `enum` | §1-9.1 | Enum declaration |
| `extern` | §2-3 | FFI declaration |
| `false` | §1-3.6 | Boolean literal |
| `final` | §1-8.3.1 | Class/method modifier sealing further extension or override |
| `finally` | §1-6.9 | Unconditional cleanup block |
| `fn` | §1-4.4 | Function type |
| `for` | §1-6.4 | Loop |
| `from` | §1-13.1 | Import source, exception chaining |
| `func` | §1-7.1 | Function declaration |
| `gen` | §1-7.5 | Generator function |
| `get` | §1-7.7 | Property getter keyword (contextual — also valid as a method or field name) |
| `global` | §1-7.3 | Module-scope variable mutation |
| `if` | §1-6.3 | Conditional |
| `implements` | §1-11.1 | Interface implementation |
| `import` | §1-13.1 | Import declaration |
| `in` | §1-6.4, §1-3.7 | For-in loop, membership test |
| `instanceof` | §1-4.7 | Type check operator |
| `interface` | §1-11.1 | Interface declaration |
| `is` | §1-4.5, §1-9.5 | Type narrowing check |
| `let` | §1-6.2 | Immutable binding |
| `lifetime` | §1-7.1, §1-10.11, §1-11.4, §1-12.1, §3-2.4.2 | Lifetime region parameter declaration |
| `local` | §1-8.1.1, §1-19 | Class memory-strategy modifier (v1.18). `local class Foo` is the explicit form of the default `class Foo`; thread-local, non-atomic ARC. `local` is a **contextual keyword** — permitted as an identifier in non-class-modifier positions |
| `macro` | §1-19.11 | Macro declaration: `pub macro name(params) { quote { ... } }` |
| `match` | §1-9.4 | Pattern matching |
| `new` | §1-8.4 | Constructor |
| `namespace` | §1-13, §1-19.2 | File-level namespace declaration: `namespace pkg.module;` |
| `nonlocal` | §1-7.3 | Enclosing-scope variable mutation |
| `not` | §1-3.7 | Logical NOT |
| `or` | §1-3.7 | Logical OR |
| `override` | §1-8.3.1 | Method modifier marking a re-declaration of an inherited concrete method; required to prevent accidental shadowing |
| `portal` | §1-6.7 | Debug activation point |
| `prefer` | §1-13.1 | Import keyword for `prefer compiled` clause |
| `pub` | §1-8.2 | Public visibility |
| `return` | §1-7.1 | Return from function |
| `sealed` | §1-8.3.2, §1-11.1, §4-1.6 | Class/interface modifier marking the extension or implementation set as closed to the declaring module; combinable with `abstract`, mutually exclusive with `final` |
| `Self` | §1-8.4, §1-11 | Type alias for the implementing type; available inside class, struct, interface, and enum bodies |
| `set` | §1-7.7 | Property setter keyword (contextual — also valid as a method or field name) |
| `shared` | §1-8.1.1, §2-2, §1-19 | Class memory-strategy modifier and constructor prefix (v1.18). `shared class Foo` declares an atomic-ARC, shared-arena-allocated class; `shared Foo(...)` / `shared(arena) Foo(...)` allocates a `shared class` instance. Also used as a field qualifier in existing `Sendable` contexts |
| `spawn` | §2-1.2, §1-3.4 | Spawn task in await group (contextual — reserved only in primary-expression position `spawn Expr`; also valid as a method name, field name, or in method-call position after `.`) |
| `super` | §1-8.4 | Superclass constructor call: `super(args)` inside a subclass constructor body; superclass method call: `super.m(args)` inside an instance method or constructor (SUPER-1) |
| `static` | §1-8.5 | Static member |
| `struct` | §1-10 | Struct declaration |
| `suspend` | §2-4.5 | Async component loading |
| `this` | §1-3.4, §1-8.4 | Implicit current-instance reference inside instance methods and constructors. Lexed as an identifier but strictly reserved: it may not name any declaration or binding (RESWORD-1) |
| `throw` | §1-6.10 | Throw exception |
| `true` | §1-3.6 | Boolean literal |
| `try` | §1-6.9 | Exception handling |
| `type` | §1-4.6 | Type alias |
| `weak` | §1-8 | Field qualifier for non-owning references to `local class` or `shared class` instances. Available in all modes with an ARC model (not `freestanding`). v1.18 generalized availability from ARC-only modes to all ARC-backed modes |
| `typeof` | §1-4.7 | Type-of operator |
| `unique` | §1-8, §3-2.4.7 | Ownership qualifier: `unique let`/`var` (single-owner binding), `unique class` (single-owner class type) |
| `var` | §1-6.2 | Mutable binding |
| `volatile` | §3-3.8 | Freestanding and `host.native`: parameter modifier preceding `borrow`, marking MMIO semantics — reads/writes are observable side effects that the optimizer must not reorder, merge, hoist, sink, or eliminate |
| `where` | §1-11.5, §4-1.6 | Per-method type constraint and conditional `implements` clause: `func foo(...): T where T: Bound` and `class Foo : Any implements Bar where T: X` |
| `while` | §1-6.4 | While loop |
| `with` | §1-6.6, §1-10.7 | Scoped resource management (`with (x = expr) { ... }`); also struct copy-with-modification (`s with (field=newValue)`) |
| `yield` | §1-7.5 | Generator yield |
| `reads` | §3-2.4.9 | Ownership verb: shared immutable borrow — parameter modifier and call-site acknowledgment (all modes) |
| `edits` | §3-2.4.9 | Ownership verb: exclusive mutable borrow — parameter modifier and call-site acknowledgment (all modes) |
| `takes` | §3-2.4.9 | Ownership verb: ownership transfer — parameter modifier and call-site acknowledgment (all modes) |
| `shares` | §3-2.4.9 | Ownership verb: ARC retain — parameter modifier and call-site acknowledgment (all modes) |
| `modifier` | §3-2.4.11 | Method declaration keyword: declares a method that writes `var` fields on `self` (all modes) |
| `requires` | §3-2.4.10 | Contract clause keyword: applies verbs to multiple parameters, declares `distinct()` contracts (all modes) |
| `safe` | §3-2.4.12 | Context keyword: `safe {}` activates shared-XOR-mutable enforcement; `safe func` propagates the requirement (all modes) |
| `synchronized` | §3-2.4.13 | Class modifier: per-instance mutex serializing all `modifier` invocations (web.scripted, web.compiled, host.scripted, host.dual, host.native) |
| `unsafe` | §1-3.4, §3-2.4.14 | Lock-release block statement inside a `synchronized` modifier: `unsafe("reason") { ... }` (web.scripted, web.compiled, host.scripted, host.dual, host.native). Lexed as an identifier but strictly reserved: it may not name any declaration or binding (RESWORD-1) |
| `borrow` | §1-7.1, §3-2.4.1, §3-2.4.2 | Parameter modifier / field qualifier / lifetime-tracked reference — prefer `reads`/`edits` verbs in new code |
| `atomic` | §2-1.7 | Cooperative atomicity scope — no suspension points within the block (scripted/compiled) |
| `bnot` | §1-3.7, §1-5.1 | Bitwise NOT operator |
| `noescape` | §1-4.4, §3-2.4.1 | Function type modifier |
| `unreachable` | §1-5.11 | Expression asserting control cannot arrive; panics in every profile |

**Annotations** — Compile-time annotations recognised by the Loup toolchain:

| Annotation | Section | Description |
|---|---|---|
| `@mode` | §1-2.5 | File-level execution mode declaration |
| `@entry` | §3-3.5 | Freestanding: marks the bare binary entry point |
| `@panic_handler` | §3-3.6 | Freestanding: custom panic hook (`--panic=custom`) |
| `@interrupt` | §3-3.13 | Freestanding: interrupt service routine calling convention |
| `@naked` | §3-3.14 | Freestanding: suppresses function prologue and epilogue |
| `@no_zero_locals` | §3-3.16b | Freestanding/native: suppresses prologue zero-initialization of register/local slots |
| `@callconv` | §3-3.15 | Freestanding: overrides calling convention |
| `@allocator` | §3-3.16 | Freestanding: registers custom heap allocator |
| `@deallocator` | §3-3.16 | Freestanding: registers matching deallocator |
| `@repr` | §3-3.10 | Freestanding/native: struct memory layout control |
| `@align` | §3-3.11 | Freestanding/native: minimum alignment in bytes |
| `@section` | §3-3.12 | Freestanding: ELF section placement |
| `@jsexport` | §2-3.2 | Export a function as callable from JavaScript |
| `@concurrent` | §2-1.9.5 | Asserts an `async func` is safe to call from any executor thread |
| `@deprecated(msg)` | §1-8.8 | Mark a symbol for future removal; usages emit a compile-time warning |
| `@webcomponent(name)` | §2-4.10 | Register a class as a Custom Element with the given tag name |
| `@attribute` | §2-4.10 | Declare an observed HTML attribute on a `@webcomponent` class |
| `@unsafe(reason)` | §3-2.4.6 | Programmer-asserted safety boundary; bypasses specific compiler verification |
| `@symbol("c_name")` | §2-3.4 | Binds an `extern native` declaration to another C symbol |
| `@overflowWrapping` | §1-4.1.1 | Opt-in wrapping arithmetic for all fixed-width integers in a function |
| `@interruptSafe` | §3-3.24.1 | Freestanding: declare a function safe to call from interrupt handler context |
| `@signalSafe` | §1-18.9 | Native: declare a function safe to call from OS signal handler context |
| `@lockOrder(n)` | §3-2.4.13 | Native/freestanding: assign a lock-ordering level to a class (`synchronized` or plain) |
| `@debug_control_channel` | §3-3.25.3 | Freestanding `--debug`: register the bidirectional control transport |
| `@debug_trace_channel` | §3-3.25.3 | Freestanding `--debug`: register the unidirectional trace transport |
| `@vectorize` | §1-8.8 | Hint the compiler to auto-vectorize a `for` loop |
| `@vectorize(width=N)` | §1-8.8 | Auto-vectorize hint with explicit SIMD lane count |

**Contextual keywords** — Special meaning only in specific syntactic positions; may be used as ordinary identifiers elsewhere:

| Contextual Keyword | Section | Description |
|---|---|---|
| `self` | §1-3.4 | Contextual in closure capture lists (`[weak self]`, `[unowned self]`) as an alias for the enclosing method's implicit `this` receiver; valid as an ordinary identifier elsewhere (e.g., first parameter name in UFCS-style functions) |
| `quote` | §1-3.4, §1-17, §1-19.11 | Contextual as the macro body keyword (`macro name(p) { quote { ... } }`); valid as an ordinary identifier elsewhere |
| `box` | §1-3.4, §1-4.3 | Contextual in prefix position; makes widening to `Any` explicit. `E_BOX_IN_FREESTANDING` in `@mode(freestanding)`; permitted in `@mode(host.native)` with the `W_ANY_IN_AOT_MODE` advisory |
| `excl` | §1-3.4, §3-2.4.1.1 | Contextual immediately before `borrow`: `excl borrow param: T`; available in all modes (§1-2.6) |
| `group` | §2-1.2 | Contextual in `await group { ... }` |
| `once` | §2-5.3 | Contextual in debug activation requests |
| `distinct` | §3-2.4.10 | Contextual in `requires` clauses and call-site contract acknowledgments |
| `compiled` | §1-2.4.2, §1-2.5 | Mode name in `@mode(web.compiled)` and `prefer compiled` import clauses; valid identifier elsewhere |
| `scripted` | §1-2.4.1, §1-2.4.3, §1-2.5 | Mode name in `@mode(web.scripted)` (§1-2.4.1) and `@mode(host.scripted)` (§1-2.4.3); valid identifier elsewhere |
| `native` | §1-2.4.5, §3-2 | Mode name in `@mode(host.native)`; valid identifier elsewhere |
| `dual` | §1-2.4.4, §1-2.5 | Mode name in `@mode(host.dual)`; valid identifier elsewhere |
| `freestanding` | §1-2.4.6, §3-3 | Mode name in `@mode(freestanding)`; valid identifier elsewhere |
| `portable` | §1-2.4.7 | Mode name in `@mode(portable)`; valid identifier elsewhere |
| `reinterpret` | §1-3.4, §3-3.18 | Contextual in `reinterpret[T, U](expr)`; requires `@unsafe`; available in all modes (§1-2.6) |
| `reinterpretChecked` | §1-3.4, §3-3.18 | Contextual in `reinterpretChecked[T, U](expr)`; no `@unsafe` required; returns `Result[U, AlignmentError]`; available in all modes (§1-2.6) |
| `size_of` | §1-3.4, §3-3.4.1 | Contextual in `size_of[T]()`; `@mode(host.native)` and `@mode(freestanding)` only |
| `align_of` | §1-3.4, §3-3.4.1 | Contextual in `align_of[T]()`; `@mode(host.native)` and `@mode(freestanding)` only |
| `arc` | §1-3.4, §1-6.2, §3-2.4.8 | Contextual immediately before `let` / `var`: the explicit ARC ownership binding qualifier (`arc let`, `arc var`); valid identifier elsewhere (RESWORD-1) |
| `operator` | §1-3.4, §1-7.7, §1-11.2 | Contextual immediately before `func`: `operator func SymOp` declares an operator overload; `modifier operator func` for mutating overloads; valid identifier elsewhere, a method name included (RESWORD-1) |
| `noreturn` | §1-3.4, §1-4.4a, §1-7.8 | Return-type marker: the call never completes. May not name a type or a type parameter (it would shadow the built-in); a valid value, function and method name elsewhere (RESWORD-1) |
| `impossible` | §1-3.4, §1-4.4b, §1-9.4 | The uninhabited type, as an enum-payload type argument. May not name a type or a type parameter (it would shadow the built-in); a valid value, function and method name elsewhere (RESWORD-1) |
| `from` (method-name carve-out) | §1-3.4, §1-11.2 | `from` is a hard keyword (import statements §1-13.1; `throw ... from ...` chaining §1-6.9), but is additionally permitted as a method name in method-declaration headers and method-call position after `.` (e.g., `static func from(err: E): Self` and `F.from(e)`). Not permitted as a field, variable, parameter, type, or module name. |
| `foundation` | §1-23.1 | Contextual immediately after `template`: declares an architecture-template base (`template foundation Id { ... }`); valid identifier elsewhere |
| `overlay` | §1-23.1 | Contextual immediately after `template`: declares an architecture-template overlay (`template overlay Id onto Parent { ... }`); valid identifier elsewhere |
| `onto` | §1-23.1 | Contextual in an overlay header, naming the parent foundation/overlay; valid identifier elsewhere |
| `part` | §1-23.2 | Contextual before a method declaration inside a template body, marking an overridable seam (`part func ...;` REQUIRED / `part func ... { }` DEFAULTED); valid identifier elsewhere |

Note that `template` itself is the same keyword used for template fences (§1-16); the
two are disambiguated by the token that follows (`foundation`/`overlay` ⇒ an
architecture template, §1-23).

**Lifetime labels** — Reserved sigil for compile-time region identifiers (available in all modes, §1-2.6):

| Identifier | Section | Description |
|---|---|---|
| `~static` | §1-7.1, §3-2.4.2 | Reserved forever-lifetime label; satisfies any `borrow[~name]` by covariance |
| `~name` (user-defined) | §1-7.1, §1-10.11, §3-2.4.2 | Lowercase identifier prefixed with `~`; declared via `lifetime ~name`; erased at compile time |

**Dunder identifiers** — Reserved for language-defined module introspection:

| Identifier | Section | Description |
|---|---|---|
| `__name__` | §1-2.2 | Module name (`"__main__"` for entry script) |
| `__file__` | §1-2.2 | Absolute file path of the module |
| `__execmode__` | §1-2.2 | One of the seven mode strings: `"web.scripted"`, `"web.compiled"`, `"host.scripted"` (also used by REPL), `"host.dual"`, `"host.native"`, `"freestanding"`, or `"portable"` |
| `__module__` | §1-2.3 | Declaration-level dunder on named types and functions |

---

## Appendix B: Operator Index

| Operator | Precedence | Associativity | Description | Section |
|---|---|---|---|---|
| `()` `[]` `.` `?.` `!{}` `?.[` | 1 | Left | Call, index, member access, safe nav, dynamic access, null-safe index | §1-5.1 |
| `typeof` | 2 | Prefix | Type-of operator | §1-4.7 |
| `-` (unary) `not` `!` `bnot` | 3 | Prefix | Unary negation, logical not, bitwise not | §1-5.1 |
| `box` `consume` | 4 | Prefix | Boxing/widening (`box`); unique-to-ARC downgrade (`consume`, `@mode(host.native)` or `@mode(host.dual)`) | §1-4.3, §3-2.4.7 |
| `**` | 5 | Right | Exponentiation | §1-5.1 |
| `*` `/` `//` `%` | 6 | Left | Multiplication, division, floor division, modulo | §1-5.1 |
| `+` `-` | 7 | Left | Addition, subtraction, string concatenation | §1-5.1 |
| `<<` `>>` | 8 | Left | Bitwise shift | §1-5.1 |
| `&` | 9 | Left | Bitwise AND | §1-5.1 |
| `^` | 10 | Left | Bitwise XOR | §1-5.1 |
| `\|` | 11 | Left | Bitwise OR | §1-5.1 |
| `[:]` | 12 | N/A | Slice | §1-5.3 |
| `in` `not in` | 13 | Left | Membership | §1-5.1 |
| `<` `>` `<=` `>=` | 14 | Left | Comparison | §1-5.1 |
| `==` `!=` | 15 | Left | Equality | §1-5.1 |
| `is` `instanceof` | 16 | Left | Type check | §1-4.5, §1-4.7, §1-9.5 |
| `as` `as?` | 17 | Left | Cast operators (narrowing) | §1-4.3 |
| `and` `&&` | 18 | Left | Logical AND (short-circuit) | §1-3.7 |
| `or` `\|\|` | 19 | Left | Logical OR (short-circuit) | §1-3.7 |
| `??` | 20 | Left | Null coalescing | §1-5.6 |
| `? :` | 21 | Right | Ternary conditional | §1-5.4 |
| `?` (postfix) | 22 | Postfix | Result propagation | §1-5.7 |
| `=` `+=` `-=` `*=` `/=` `//=` `%=` `**=` `<<=` `>>=` `&=` `\|=` `^=` | 23 | Right | Assignment | §1-6.2 |
| `*` `**` (prefix, spread) | 24 | Prefix | Spread | §1-5.8 |

---

## Appendix C: Built-in Type Index

This appendix lists built-in language types only.  Standard library types are indexed in the [Loup Standard Library Reference](loup-stdlib-reference-v1_20.md) Appendix C.  Package types are indexed in the [Loup Packages Reference](loup-packages-reference-v1_12.md) Appendix C.


### Primitive Types

| Type | Description | Section |
|---|---|---|
| `int` | 64-bit signed integer (alias for `int64`) | §1-4.1 |
| `int8` | 8-bit signed integer | §1-4.1 |
| `int16` | 16-bit signed integer | §1-4.1 |
| `int32` | 32-bit signed integer | §1-4.1 |
| `int64` | 64-bit signed integer | §1-4.1 |
| `uint` | Pointer-sized unsigned integer (alias for `uint64` on 64-bit, `uint32` on 32-bit) | §1-4.1 |
| `uint8` | 8-bit unsigned integer | §1-4.1 |
| `uint16` | 16-bit unsigned integer | §1-4.1 |
| `uint32` | 32-bit unsigned integer | §1-4.1 |
| `uint64` | 64-bit unsigned integer | §1-4.1 |
| `bigint` | Arbitrary-precision signed integer | §1-4.1.3 |
| `float` | IEEE 754 double-precision (alias for `float64`) | §1-4.1 |
| `float32` | IEEE 754 single-precision | §1-4.1 |
| `float64` | IEEE 754 double-precision | §1-4.1 |
| `decimal` | Arbitrary-precision decimal | §1-4.1.4 |
| `complex` | IEEE 754 double-precision complex (alias for `complex64`) | §1-4.1.6 |
| `complex32` | IEEE 754 single-precision complex | §1-4.1.6 |
| `complex64` | IEEE 754 double-precision complex | §1-4.1.6 |
| `bool` | Boolean (`true`/`false`) | §1-4.1 |
| `char` | Single Unicode scalar value | §1-4.1.5 |
| `string` | UTF-8 sequence of Unicode scalar values | §1-4.1 |
| `bytes` | Arbitrary byte sequence | §1-4.1 |
| `list[T]` | Ordered sequence | §1-4.1 |
| `dict[K, V]` | Ordered map | §1-4.1 |
| `set[T]` | Unordered unique collection | §1-4.1 |
| `tuple[...]` | Fixed-size heterogeneous sequence | §1-4.9 |
| `array[T, rank]` | Multi-dimensional array — strided storage with statically-known rank, configurable order and base | §1-4.10 |
| `void` | No return value | §1-4.4 |
| `noreturn` | Return marker: the call never completes | §1-4.4a |
| `impossible` | The uninhabited type: no value of it exists | §1-4.4b |

### Box Types (ABI-internal)

Box types are ABI-internal. User code should not reference them directly. See §1-4.2.

| Type | Boxes | Section |
|---|---|---|
| `Int` | `int` | §1-4.2 |
| `Char` | `char` | §1-4.2 |
| `Float` | `float` | §1-4.2 |
| `Bool` | `bool` | §1-4.2 |
| `String` | `string` | §1-4.2 |
| `Bytes` | `bytes` | §1-4.2 |

### Built-in Enums

| Type | Variants | Section |
|---|---|---|
| `Option[T]` | `Some(T)`, `None` | §1-9.3 |
| `Result[T, E]` | `Ok(T)`, `Err(E)` | §1-9.3 |

### Language Built-in Class Types

These types are defined by the language specification and are available without any import.

| Type | Description | Section |
|---|---|---|
| `Any` | Root type for all heap-allocated and boxed values; all classes inherit from `Any` | §1-4.3 |
| `Module` | Represents a compiled or loaded module; carries `__name__`, `__file__`, `__execmode__` and reflection methods | §1-2.3 |
| `Template` | Compile-time value produced by a template fence; carries `language`, `format`, and rendering methods | §1-16.3 |
| `RenderContext` | Rendering context (language + format) passed to `Renderable.render()` | §1-16.3 |
| `SafeHtml` | Pre-escaped trusted HTML content; inserted without further escaping in `html` fences | §1-16.6.7 |
| `Url` | Validated URL wrapper; rejects disallowed schemes (e.g. `javascript:`) | §1-16.6.7 |
| `ClassName` | Scoped CSS class name string produced by a `css` fence; implements `Renderable` | §1-16.7.1 |
| `StyleSheet` | Collection of `ClassName` values produced by a `css` fence; provides `toCSS()` | §1-16.7.1 |
| `ActorContext` | Implicit context inside `Actor.spawn` handler for replying to `ask` calls | §2-1.6 |
| `Type` | Reified type value produced by `typeof expr`; carries `name`, `params()`, and reflection methods | §1-4.7 |
| `StackFrame` | One frame in an exception's `stackTrace`; carries `file`, `line`, `column`, `function` | §1-18.1 |
| `PanicSource` | Discriminant enum identifying the source of a freestanding panic | §3-3.6 |
| `NativeHandle` | Opaque built-in C-pointer type at the FFI boundary; non-`Sendable` by default | §2-3.4 |
| `DebugFrame` | One frame in the debug trace ring buffer; carries file, line, callable, exec-mode, and locals | §2-5.3 |
| `TraceEvent` | Entry recorded by the tracing subsystem; carries `kind`, `portal`, `callable`, `file`, `line` | §2-5.3 |
| `FreestandingDebugFrame` | Fixed-size freestanding trace frame (no heap); carries source-location offsets only | §3-3.25.2 |

**Library types, not built in (v1.21, rulings SIG-LIB and M20).** `Signal[T]` and `EffectHandle` (§2-4.1) are library
types of the package `loup.ui.signal`; `MountHandle` (§2-4.3) is `loup.ui.desktop`'s; `ComponentRegistry` (§2-4.2) is
the `ui` fence's. Each is imported, directly or through the alias `ui` (§2-4). Before v1.21 this table listed them as
built in.

### UI Built-in Types

The following opaque types are produced exclusively by the `ui` subsystem and are available on all targets, except
`DesktopGrant`, which is available in hosted modes only (not in `@mode(freestanding)`, and not in portable code)
(v1.21, ruling RT-UI).

| Type | Description | Section |
|---|---|---|
| `View` | Opaque type of a `ui` fence's, a tree literal's or a component's result; its meaning is its `TreeData` | §2-4.4 |
| `MountTarget` | Opaque platform rendering root; obtained from `runtime.ui.rootMount()`, a `Window`, or (deferred, browser) selector strings and `Element` | §2-4.3 |
| `DesktopGrant` | The authority to open a hosted UI backend; produced only by `runtime.ui.desktop()`; no constructor, members or zero value; not FFI-legal | §2-4.8 |

### Freestanding and Native Built-in Types

The following types are available in `@mode(host.native)` and `@mode(freestanding)` unless otherwise noted.

| Type | Description | Mode | Section |
|---|---|---|---|
| `MaybeUninit[T]` | Wrapper for memory not yet initialized | host.native, freestanding | §3-3.17 |
| `Volatile[T]` | MMIO wrapper enforcing volatile load/store semantics | freestanding, host.native | §3-3.9 |
| `InterruptFrame` | CPU exception frame layout (architecture-specific `@repr(C)` struct) | freestanding | §3-3.13 |
| `PartialInit[T]` | Tracks incremental field initialization of a `@repr(C)` struct at compile time | host.native, freestanding | §3-3.17a |
| `DmaBuffer[T]` | Exclusive DMA-safe memory buffer with CPU/DMA access arbitration | freestanding | §3-3.20 |
| `DmaTransfer` | Active DMA transfer token — holds exclusive borrow of the associated `DmaBuffer[T]` | freestanding | §3-3.20 |
| `InterruptGuard` | RAII scope guard that disables interrupts on entry and re-enables on drop | freestanding | §3-3.24 |
| `PinnedRef[T]` | ARC-pinned lifetime anchor preventing GC collection while a native library holds a raw pointer | host.dual, host.native | §2-3.4 |
| `OwnedHandle` | Owned `NativeHandle` wrapper with destructor registration | host.dual, host.native, freestanding | §2-3.4 |
| `BorrowedHandle` | Borrowed `NativeHandle` wrapper with lifetime tracking | host.dual, host.native, freestanding | §2-3.4 |
| `Mutex[T]` | OS-thread mutex wrapping `T`; always `Sendable` | host.dual, host.native | §2-1.8.2 |
| `RwLock[T]` | OS-thread reader/writer lock wrapping `T`; always `Sendable` | host.dual, host.native | §2-1.8.2 |
| `Atomic[T]` | Atomic cell for sequentially-consistent load/store/RMW on primitives | host.dual, host.native, freestanding | §2-1.8.2 |
| `Thread` | OS thread handle — spawn, join, detach | host.dual, host.native | §2-1.8.3 |
| `ThreadHandle[T]` | Typed join handle returned by `Thread.spawnWith` | host.dual, host.native | §2-1.8.3 |
| `ThreadPool` | Work-submission pool bridging async tasks to OS threads | host.dual, host.native | §2-1.8.4 |
| `ThreadLocal[T]` | Per-OS-thread storage, initialized lazily | host.dual, host.native | §2-1.9.7 |
| `TaskLocal[T]` | Per-async-task storage that follows the task across resumptions | All non-freestanding | §2-1.9.8 |
| `ScriptWorker[M]` | Isolated worker Wasm instance with typed `Sendable` message channel | All non-freestanding | §2-1.10.2 |
| `WorkerChannel[T]` | Worker-side message channel, valid only inside `workerMain` | All non-freestanding | §2-1.10.3 |
| `CancellationToken` | Cooperative cancellation signal for `TaskGroup.withCancellation` | All | §2-1.3 |
| `Task[T]` | Async task handle returned by `async func` invocations | All non-freestanding | §2-1.1 |
| `Actor[M]` | Supervised message-processing actor handle | All non-freestanding | §2-1.6 |

