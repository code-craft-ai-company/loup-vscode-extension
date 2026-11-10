# Loup Language Reference v1.20 — Volume 3: Compilation

**Status:** Release — current normative reference
**Version:** 1.20.0
**Date:** 2026-05-07
**Supersedes:** 1.19.0
**Scope:** Web compiled mode (WebAssembly), native compilation (LLVM/Cranelift), freestanding mode (bare metal), and hardware backend lifecycle.

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

This volume reflects the v1.20 release.

*Structural.* The previously-monolithic Language Reference is split into four
volumes (Core, Runtime, Compilation, Data Formats). Section numbers use the
volume-prefixed `§V-N` form. Cross-references in companion documents have been
updated to the new format. See `loup-changes-v1_19-to-v1_20.md` for the
complete v1.19 → v1.20 section number translation table.

*Semantic additions in this volume.* The compilation chapters (web compiled,
native, freestanding, hardware backend lifecycle) are largely content-stable
across the v1.19 → v1.20 transition. The Fortran-related semantic additions
in v1.20 (complex types, `array[T, rank]`, `for concurrent`) integrate with
the compilation pipelines specified here without requiring changes to those
pipelines' specifications — they appear principally in the type system,
runtime, and data-format volumes. The single content-level update in this
volume is in §3-3.3 (Freestanding Mode → Stripped Features): the freestanding
stripped-features table now lists complex transcendental functions
(`abs`, `arg`, `polar`, `fromPolar`, and the `core.complex` `cexp` /
`clog` / `csqrt` / trig / hyperbolic family — §1-4.1.6, §21.9) as
`E_FREESTANDING_COMPLEX_TRANSCENDENTAL`, requiring an explicitly-linked
math runtime.

---

## Table of Contents

- [§3-1 Web Compiled Mode](#3-1-web-compiled-mode)
  - [§3-1.1 Compiled Mode Declaration](#3-11-compiled-mode-declaration)
  - [§3-1.2 Restrictions](#3-12-restrictions)
  - [§3-1.3 Execution Semantics](#3-13-execution-semantics)
- [§3-2 Native Compilation](#3-2-native-compilation)
  - [§3-2.1 Platform Targets and Output Formats](#3-21-platform-targets-and-output-formats)
  - [§3-2.2 Compiler Backends](#3-22-compiler-backends)
  - [§3-2.3 Linker](#3-23-linker)
  - [§3-2.4 ARC Memory Management](#3-24-arc-memory-management)
  - [§3-2.4.1 ARC Elision via `borrow` and `noescape fn`](#3-241-arc-elision-via-borrow-and-noescape-fn)
  - [§3-2.4.1.1 `excl borrow` on Structs](#3-2411-excl-borrow-on-structs)
  - [§3-2.4.2 Lifetime Tracking and Region Inference](#3-242-lifetime-tracking-and-region-inference)
  - [§3-2.4.3 Lifetime-Verified `unowned[~name]` Fields](#3-243-lifetime-verified-unownedname-fields)
  - [§3-2.4.4 Inferred Struct Lifetimes](#3-244-inferred-struct-lifetimes)
  - [§3-2.4.5 Buffer Disjointness Contracts](#3-245-buffer-disjointness-contracts)
  - [§3-2.4.6 `@unsafe` — Programmer-Asserted Safety Boundary](#3-246-unsafe--programmer-asserted-safety-boundary)
  - [§3-2.4.7 `unique` Ownership](#3-247-unique-ownership)
  - [§3-2.4.8 `arc let`, `unique class`, and Integer Safety Error Codes](#3-248-arc-let-unique-class-and-integer-safety-error-codes)
  - [§3-2.4.9 Ownership Transfer Verbs](#3-249-ownership-transfer-verbs)
  - [§3-2.4.10 `requires` Clauses and `distinct()`](#3-2410-requires-clauses-and-distinct)
  - [§3-2.4.11 `modifier` — Method Mutation Contract](#3-2411-modifier--method-mutation-contract)
  - [§3-2.4.12 `safe` Contexts and `safe func` Propagation](#3-2412-safe-contexts-and-safe-func-propagation)
  - [§3-2.4.13 `synchronized` Class — Runtime-Locked Mutation](#3-2413-synchronized-class--runtime-locked-mutation)
  - [§3-2.4.14 `unsafe {}` Within `synchronized` Classes — Lock-Release Regions](#3-2414-unsafe--within-synchronized-classes--lock-release-regions)
  - [§3-2.5 ARC and the Scripted/Native Mode Boundary](#3-25-arc-and-the-scriptednative-mode-boundary)
  - [§3-2.6 ABI Stability](#3-26-abi-stability)
    - [§3-2.6.1 Aggregate Return Convention](#3-261-aggregate-return-convention)
  - [§3-2.7 C Header Interop](#3-27-c-header-interop)
    - [§3-2.7.1 `loup export-headers` — Loup → C](#3-271-loup-export-headers--loup--c)
    - [§3-2.7.2 `loup import-headers` — C → Loup](#3-272-loup-import-headers--c--loup)
  - [§3-2.8 Build Pipeline and `.lppkg` for Native](#3-28-build-pipeline-and-lppkg-for-native)
  - [§3-2.9 Requirements](#3-29-requirements)
- [§3-3 Freestanding Mode](#3-3-freestanding-mode)
  - [§3-3.1 Overview](#3-31-overview)
  - [§3-3.2 Target Declaration and Compilation](#3-32-target-declaration-and-compilation)
  - [§3-3.3 Stripped Features](#3-33-stripped-features)
  - [§3-3.4 Available Features](#3-34-available-features)
  - [§3-3.4.1 `size_of[T]()` and `align_of[T]()` — Compile-Time Layout Queries](#3-341-sizeoft-and-alignoft--compile-time-layout-queries)
  - [§3-3.4.2 Freestanding Compiler Intrinsics](#3-342-freestanding-compiler-intrinsics)
  - [§3-3.4.3 Interfaces and Generics in Freestanding](#3-343-interfaces-and-generics-in-freestanding)
  - [§3-3.5 `@entry` — Bare Entry Point](#3-35-entry--bare-entry-point)
  - [§3-3.6 `@panic_handler` and Panic Policy](#3-36-panichandler-and-panic-policy)
  - [§3-3.7 `asm { }` — Inline Assembly](#3-37-asm----inline-assembly)
  - [§3-3.8 `volatile` — MMIO Semantics](#3-38-volatile--mmio-semantics)
  - [§3-3.9 `Volatile[T]` — MMIO Type Wrapper](#3-39-volatilet--mmio-type-wrapper)
  - [§3-3.10 `@repr` — Struct Layout Control](#3-310-repr--struct-layout-control)
  - [§3-3.11 `@align` — Alignment Annotations](#3-311-align--alignment-annotations)
  - [§3-3.12 `@section` — ELF Section Placement](#3-312-section--elf-section-placement)
  - [§3-3.12a Static Data Relocations — Pointers in Global Data](#3-312a-static-data-relocations--pointers-in-global-data)
  - [§3-3.13 `@interrupt` — Interrupt Service Routines](#3-313-interrupt--interrupt-service-routines)
  - [§3-3.14 `@naked` — Naked Functions](#3-314-naked--naked-functions)
  - [§3-3.15 `@callconv` — Calling Convention Override](#3-315-callconv--calling-convention-override)
  - [§3-3.16 `@allocator` and `@deallocator`](#3-316-allocator-and-deallocator)
  - [§3-3.16a `@scheduler` — Freestanding Thread-Pool Extension Point](#3-316a-scheduler--freestanding-thread-pool-extension-point)
  - [§3-3.16b `@no_zero_locals` — Suppress Prologue Zero-Initialization](#3-316b-no_zero_locals--suppress-prologue-zero-initialization)
  - [§3-3.16c `@domain("name")` — Isolation Domains](#3-316c-domainname--isolation-domains)
  - [§3-3.17 `MaybeUninit[T]` — Uninitialized Memory](#3-317-maybeuninitt--uninitialized-memory)
  - [§3-3.17a `PartialInit[T]` — Field-Tracked Struct Initialization](#3-317a-partialinitt--field-tracked-struct-initialization)
  - [§3-3.17b `buffer[T, N]` — Fixed-Size Buffer](#3-317b-buffert-n--fixed-size-buffer)
  - [§3-3.17c `onstack` — Guaranteed Stack Placement](#3-317c-onstack--guaranteed-stack-placement)
  - [§3-3.17d Frame-Held Class Instances — Identity, Storage, Lifetimes and Return Provenance](#3-317d-frame-held-class-instances--identity-storage-lifetimes-and-return-provenance)
  - [§3-3.18 `reinterpret[T, U]` — Type-Safe Memory Reinterpretation](#3-318-reinterprett-u--type-safe-memory-reinterpretation)
  - [§3-3.19 Integer Overflow Arithmetic Methods](#3-319-integer-overflow-arithmetic-methods)
  - [§3-3.20 Available Standard Library Subset](#3-320-available-standard-library-subset)
  - [§3-3.21 `.lppkg` Extensions for Freestanding](#3-321-lppkg-extensions-for-freestanding)
  - [§3-3.21.1 `relocatable` — position-independent user programs](#3-3211-relocatable--position-independent-user-programs)
  - [§3-3.21.2 `separate` — per-package separate compilation](#3-3212-separate--per-package-separate-compilation)
  - [§3-3.21.3 `stack_check` — the static worst-case stack budget](#3-3213-stack_check--the-static-worst-case-stack-budget)
  - [§3-3.21.4 `preempt_defer` — preemption deferral for `synchronized` regions](#3-3214-preempt_defer--preemption-deferral-for-synchronized-regions)
  - [§3-3.22 Freestanding Error Codes](#3-322-freestanding-error-codes)
  - [§3-3.23 Example — x86_64 Kernel Stub](#3-323-example--x8664-kernel-stub)
  - [§3-3.24 `@interruptSafe` Annotation and `InterruptGuard`](#3-324-interruptsafe-annotation-and-interruptguard)
    - [§3-3.24.1 `@interruptSafe` — Interrupt-Context Safety Annotation](#3-3241-interruptsafe--interrupt-context-safety-annotation)
    - [§3-3.24.2 `InterruptGuard` — Interrupt-Masking Critical Section](#3-3242-interruptguard--interrupt-masking-critical-section)
  - [§3-3.25 Freestanding Debug Service](#3-325-freestanding-debug-service)
    - [§3-3.25.1 Overview](#3-3251-overview)
    - [§3-3.25.2 `FreestandingDebugFrame`](#3-3252-freestandingdebugframe)
    - [§3-3.25.3 Channel Annotations](#3-3253-channel-annotations)
    - [§3-3.25.4 Starting the Debug Service](#3-3254-starting-the-debug-service)
    - [§3-3.25.5 Channel Fallback Matrix](#3-3255-channel-fallback-matrix)
    - [§3-3.25.6 Control Channel Protocol](#3-3256-control-channel-protocol)
    - [§3-3.25.7 Trace Channel Protocol](#3-3257-trace-channel-protocol)
    - [§3-3.25.8 Host Tooling](#3-3258-host-tooling)
    - [§3-3.25.9 Time-Travel Replay for Freestanding](#3-3259-time-travel-replay-for-freestanding)
    - [§3-3.25.10 Design Notes](#3-32510-design-notes)
  - [§3-3.26 Channel Subsystem I/O — `native.css` (s390x)](#3-326-channel-subsystem-io--nativecss-s390x)
- [§3-4 Hardware Backend Lifecycle](#3-4-hardware-backend-lifecycle)

---

## §3-1 Web Compiled Mode

*(This section is normative for `@mode(web.compiled)` — it is the detailed specification; §1-2.4.2 is the summary.)*

Web compiled mode enables ahead-of-time (AOT) compilation of Loup source files to WebAssembly, the same bytecode target used by the JIT pipeline (§1-2.1). The value and exception representations defined in §1-2.1 apply equally to AOT-compiled Wasm modules; AOT compilation produces optimized Wasm modules where debug metadata is stripped unless `--debug` is specified (see §1-20.1). Native binary targets (executables, shared libraries, freestanding images) are specified separately in §3-2 under `@mode(host.native)` and `@mode(freestanding)`; they are distinct modes with distinct restrictions and do not share this section's rules.

**Value representation.** Loup values on the Wasm target are host-managed references (`externref`) over the runtime's own heap, not Wasm GC objects. Class and enum field layouts travel out of band in the `loup_class_layouts` and `loup_enum_layouts` custom sections, and field access resolves a field NAME to an index through them. Every enum value built from a declared enum (the built-in `Option` and `Result` included) carries its enum TYPE: the module's `loup_enum_variants` custom section lists each enum's variant names in tag order (sorted by enum name, the `loup_class_layouts` wire format), and the value is built by `enum_new_typed(tag, payload, type_id)`, `type_id` being the enum's 1-based position there. **Compiler's rule (rendering on the Wasm lane).** The host renders every value by core §1-16.4 from these sections — a class or struct instance structurally over its layout, a typed `Some(v)` / `Ok(v)` as `v`, a user variant by name, the first `Err` a sink's render reaches raised as `RenderError`, the 100-composite depth limit and the cycle rule — as both interpreters and every native lane do (rulings REND-1 / REND-2 / REND-3); `str(x)` and `repr(x)` are the host imports `render_str` and `repr` (loup#632). Aggregate operations (`§2-2` shared arenas and buffers, `Atomic[T]`, `sync.thread` locks) are backed by **linear memory** so that the host and the module address the same bytes.

**Exception representation.** Exceptions lower to a polyfill: a module-level exception global plus an `i32` active-flag, a sentinel return from the throwing function, and a post-call flag check at each call site that branches to the innermost enclosing handler. The observable semantics are those of §1-18 — this is a lowering strategy, not a semantic difference — and a conforming host needs no exception-handling support of its own.

> **Wasm GC and Exception Handling are a FUTURE target, not the current one.**
> Compiling Loup classes to Wasm GC struct types (`struct.new`, `ref.cast`,
> engine-collected object graphs) and Loup exceptions to Wasm EH tags with
> `try_table` would remove the layout side-channel, the manual heap, and the
> per-call-site flag check, and would let JavaScript hold Loup objects directly.
> The v1.20 toolchain does not emit either, and no rule in this specification
> depends on them. Earlier drafts of this section described the GC+EH shape as
> though it shipped; wording that cited it as the reason for a restriction has
> been restated against the reason that actually holds. The restrictions
> themselves are unchanged.

### §3-1.1 Compiled Mode Declaration

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



### §3-1.2 Restrictions

`Any`, `dynamic class`, and `core.inspect` are available in `@mode(web.compiled)` but emit the `W_ANY_IN_AOT_MODE` advisory because the AOT compiler must emit tagged-dispatch code with runtime cost (§1-2.4.2). They are not prohibited — projects that prefer to enforce static typing can promote the warning with `--warnings-as-errors=W_ANY_IN_AOT_MODE`.

The following constructs are prohibited in `@mode(web.compiled)` files (consult §1-2.6 for the authoritative per-mode feature matrix):

| Prohibited Construct | Reason |
|---|---|
| Top-level control flow (`if`, `while`, `for`, `match`, expression statements) (`E_TOPLEVEL_CONTROL_AOT`) | No sequential top-level execution |
| Non-constant top-level initializers | All top-level data must be statically determinable |
| Bare `unowned` on a class field (without `[~name]` annotation) | Compile-time error `E_UNOWNED_NO_LIFETIME` — all `unowned` class fields must use `unowned[~name]` (§3-2.4.3) |
| `arc let` / `arc var` | Requires an ARC runtime — the Wasm target provides none (`E_ARC_LET_NOT_NATIVE`) |
| `[weak ...]` capture lists / `weak` references | Requires an ARC zeroing side table — not available on the Wasm target |
| `consume` expression | Requires an ARC runtime to downgrade into (`E_CONSUME_NOT_AVAILABLE`) |
| `Thread.spawn`, `ThreadPool`, `Mutex`, `RwLock`, `Atomic` | OS threads unavailable on Wasm targets |
| Non-`Sendable` captures in `Thread.spawn` closures | Data race prevention (§2-1.8) |
| Non-`Sendable` captures in async task closures with `MultiThreaded` executor | Data race prevention (§2-1.9.4) |
| `runtime.configure` called after first `await` | `RuntimeConfigError` — executor is already started |
| `ThreadLocal[T]` | OS threads unavailable under Wasm — compile-time error |
| Explicit augmented assignment `operator func` on structs | Value-type semantics incompatible with in-place mutation |

The ownership keywords `borrow`, `borrow[~name]`, `excl borrow`, `lifetime ~name`, `unique`, `noescape fn`, and `unowned[~name]` ARE available in `@mode(web.compiled)` — see §1-2.6 and §3-2.4. On this target they are enforced statically and carry no runtime representation: they emit neither ARC retain/release nor any Wasm GC operation.

**Additionally permitted in `@mode(web.compiled)`:**

- `core.reflect` — structural introspection from static metadata.
- `portal` blocks — registered with shared activation registry at module load.
- `box` keyword expression — explicit widening to `Any` (permitted with the `W_ANY_IN_AOT_MODE` advisory; not available in `@mode(freestanding)`, where `Any` is prohibited).
- `as` and `as?` cast operators — narrowing from `Any`. Uses on `Any` produce the `W_ANY_IN_AOT_MODE` advisory.

The `if (__name__ == "__main__")` guard pattern is prohibited in `@mode(web.compiled)` files — not because `__name__` is unavailable, but because top-level branching is prohibited (see above). `__name__` and `__file__` remain available as compile-time string constants for use inside function bodies (e.g., logging, error messages).

| Code | Condition |
|---|---|
| `E_TOPLEVEL_CONTROL_AOT` | `if`, `while`, `for`, `match`, or expression statement at file top level in `@mode(web.compiled)` (see §1-2.4.2 for the unified code covering all AOT modes) |
| `E_BOX_IN_FREESTANDING` | `box expr` used in `@mode(freestanding)` where `Any` is prohibited |

Only declarations are permitted at file top level in `@mode(web.compiled)` files: `class`, `enum`, `struct`, `interface`, `func`, `let`, `var`, `type`, and `import`.

**Permitted in `@mode(web.compiled)`:**

- Ownership transfer verbs: `reads`, `edits`, `takes`, `shares` — call-site ownership contracts available in all modes (§3-2.4.9)
- `modifier` method keyword, `safe {}` blocks, `safe func` — mutation contracts and safe contexts available in all modes (§3-2.4.11–§3-2.4.12)
- `synchronized` class — runtime-locked mutation (§3-2.4.13)
- `requires` clauses with `distinct()` — parameter contracts available in all modes (§3-2.4.10)
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
- **v1.20 features:** `complex32`, `complex64`, `complex` (full surface — basic arithmetic plus `core.complex` transcendentals); `array[T, rank]` (§1-4.10) with full slicing and whole-array operations; array section expressions (§1-5.9); `for concurrent` (§2-1.11) with `@strategy(sequential)` default and `@strategy(simd)` lowering to Wasm SIMD when targeted; `core.fpenv` (§1-4.1.7) — see §1-2.6 footnotes for `withRounding` and exception-flag scope in JIT-aware paths; `Encoding.Complex32`, `Encoding.Complex64`, `Encoding.Array` for byte-precise interchange (§4-2.4)

The compiler SHALL emit a compile-time error for any prohibited construct in a `@mode(web.compiled)` file.

**Import rules.** `@mode(web.compiled)` files may import other `@mode(web.compiled)` files. Importing a scripted-mode file from a `@mode(web.compiled)` file is a compile-time error. Conversely, scripted-mode files may import `@mode(web.compiled)` files — the JIT runtime loads the compiled module's exports as pre-compiled native or Wasm code. `@mode(freestanding)` modules may not be imported by any other mode — see §3-3.2 for complete cross-mode import rules.

The restriction is subtractive, not a different language: `@mode(web.compiled)` files use the same Loup syntax, type system, and semantics as scripted files for all permitted features.

**v1.16 features available in `@mode(web.compiled)`:** `atomic {}` blocks (§2-1.7), `reinterpretChecked[T, U]` (§3-3.18). The `atomic {}` block is permitted because `@mode(web.compiled)` targets the same Wasm cooperative-scheduler environment as scripted Wasm modes.

### §3-1.3 Execution Semantics

`@mode(web.compiled)` files have different execution semantics from scripted modes:

- **No sequential top-level execution.** Top-level code in `@mode(web.compiled)` files consists only of declarations (types, functions, constants). There is no statement-by-statement execution. Only function bodies execute at call time.
- **Static data.** All top-level `let`/`var` bindings must have compile-time-constant initializers (literals, const arithmetic, enum variant constructors). These are compiled as static data, initialized before `main` or module load.
- **Compile-time type resolution.** All type declarations in `@mode(web.compiled)` files are resolved entirely at compile time. There is no runtime type registry for compiled types. `core.reflect.typeOf` on a `@mode(web.compiled)` type returns a `Type` value with static metadata baked in at compile time.
- **Module introspection dunders.** `__name__` is set to the module's fully-qualified dotted name and `__file__` is set to the source file path, both as compile-time string constants baked into the binary. `__name__` is never `"__main__"` in `web.compiled`. `__execmode__` is `"web.compiled"`.

**Exports.** Compiled modules may export functions, classes, enums, interfaces, structs, and constants. The export mechanism uses the same `pub` visibility rules as scripted mode.

**Wasm call-stack exhaustion.** The Wasm call-stack exhaustion contract from §1-2.1 applies identically to compiled mode. `StackOverflowError` (§1-18.1) is thrown at the deepest active compiled call frame and propagates through any `try/catch` blocks in the compiled module normally.

**Interop boundary.** Compiled modules can be imported by scripted modules and vice versa (subject to the import rules in §3-1.2). At the boundary:

- **Scripted importing compiled:** The compiled module's exports appear as pre-resolved bindings — the JIT runtime does not step through the compiled module's declarations. Arguments are type-checked at the call site; compiled code receives statically-typed values.
- **Scripted passing `Any` to compiled:** When a scripted-mode caller passes an `Any`-typed value to a compiled function that expects a concrete type, the runtime performs an unboxing check at the call boundary and throws `TypeError` on mismatch.
- **Compiled calling scripted:** The compiled module declares the expected types; the runtime verifies at the boundary.

---

## §3-2 Native Compilation

*(This section is normative.)*

Loup supports compilation to native binaries via LLVM or Cranelift backends as an alternative to the primary WebAssembly target. Native compilation produces platform-specific binaries with ARC memory management, zero-overhead C FFI, and deployment without a Wasm runtime.

```
loup build --target native
```

### §3-2.1 Platform Targets and Output Formats

**Supported host platforms.** As in §3-3.2, the **Status** column is normative documentation of *validation reach*, not of intent: it states what the toolchain actually emits today, so that a reader can tell a target that works from a target that merely parses.

| Platform | Output Format | Default ABI | Status |
|---|---|---|---|
| Linux x86_64 | ELF executable | System V AMD64 | **Supported — the reference hosted target.** Reached by the `llvm`, `cranelift`, and `c` backends. |
| Linux aarch64 | ELF executable | AAPCS64 | **Supported, on an arm64 Linux host or cross-built from x86_64.** On an arm64 host the hosted arch defaults to the host's (`aarch64-unknown-linux-gnu`), reached by the `llvm` (default), `c` and `cranelift` backends. From an x86_64 host, `--arch aarch64` is a cross build (`llvm` backend; `c` with a cross compiler in `$LOUP_CC`; `cranelift` refuses it). See "Linux hosts" below. |
| Linux riscv64 | ELF executable | RISC-V LP64D | **Emitter-level.** The LLVM path pins a hosted `riscv64-unknown-linux-gnu` triple, but the hosted lane is not validated on this arch; its freestanding sibling is boot-verified (§3-3.2). |
| macOS (x86_64, arm64) | Mach-O executable | Apple ARM64 / System V AMD64 | **Supported on a macOS host, `llvm` backend, `libc` foundation** (the default `loup build --target native`). The module names `arm64-apple-macosx` / `x86_64-apple-macosx`, the arch defaults to the host's, and Apple's clang and ld64 link it (`-arch arm64` / `-arch x86_64`). Both native drivers build it: Stage0 (`loup-bootstrap build --target native`) and the self-hosted `loup-build` (what the self-hosted `loup build` runs), which passes `loup-llvm` the host's arch and `os=macos` and has clang compile the `.ll` with the companion runtime (`loup-llbe`, which writes ELF objects, is not used there). Not available there: the `cranelift` backend (it writes ELF objects only), the `libos` foundation and `[linker].loup_runtime` (ELF images), freestanding images, and cross-OS builds. `--lib shared` / `static` (`.dylib` / `.a`) are not validated. See the note below. |
| Windows (x86_64) | PE `.exe` | Microsoft x64 | **Supported on a Windows host, `llvm` backend, `libc` foundation** (the default `loup build --target native`), with LLVM clang and Visual Studio Build Tools (the MSVC C runtime and the Windows SDK) installed. The module names `x86_64-pc-windows-msvc`; clang links it with lld and the static C runtime into `<name>.exe`. Not available there: any arch but x86_64, the `cranelift` and `c` backends, the `libos` foundation and `[linker].loup_runtime` (ELF images), `LOUP_NATIVE_SANITIZE`, and cross-OS builds; freestanding images and `--lib shared` / `static` (`.dll` / `.lib`) are not validated. See the note below. |

**Linux hosts (hosted).** A hosted module targets the compiler's own host OS and, when the build names no `--arch`, the host's arch: an x86_64 host emits `x86_64-unknown-linux-gnu` and links with `-m64` (`-m32` for `--arch x86`), an arm64 host emits `aarch64-unknown-linux-gnu` and links with no arch flag (clang and gcc reject `-m64` there). Between x86_64 and aarch64, `--arch` is a cross build: clang receives `--target=<arch>-linux-gnu` and finds the cross GCC installation (crt files, C library, `<arch>-linux-gnu-ld`) itself, as Debian/Ubuntu's `gcc-aarch64-linux-gnu` provides it. The `c` backend compiles with `gcc`, which takes no `--target`, so it cross-builds only with a cross compiler named by `$LOUP_CC` and refuses otherwise; the `cranelift` backend carries only its host's instruction set and refuses a cross `--arch`. The derived `target.arch` key an `if const` condition reads (LCP-5) names the arch the hosted build emits for. The `libos` foundation and `[linker].loup_runtime` keep their own arch rules (an image's arch, `x86_64` unless `--arch`); a freestanding image's arch is the image's (§3-3), never the build host's, and an x86 image (no `--arch`) is refused on a non-x86_64 host, whose toolchain cannot assemble its boot code.

**Apple targets (hosted, LLVM).** On the self-hosted route the driver, not `loup-llvm`, knows the host: `loup-build` reads `uname`, defaults a hosted build's arch to the host's on macOS (a freestanding image keeps its own default), and passes `os=macos` (`os=linux` is the default; any other value is `E-BUILD-OS`), so the same arguments always give the same `.ll`. A hosted module targets the compiler's own host OS: the hosted link is the host `clang` with no `--target`, so on a macOS host the LLVM emitter writes an `*-apple-macosx` triple with the Mach-O (`m:o`) datalayout, the build defaults `--arch` to the host's, and selects the arch with Apple's `-arch` flag. The managed C runtime is one text for every host: where glibc and macOS differ (the `FILE` type behind `stderr`, `malloc_usable_size` versus `malloc_size`, the `mmap` flag values) it uses the system headers or an `#if defined(__APPLE__)` branch. ld64, unlike an ELF linker, refuses an undefined WEAK reference, so a macOS build appends weak zero definitions of the two lane flags the runtime reads that way (`__loup_runtime_tuple_is_list`, `__loup_runtime_option_is_block`); a lane's strong definition still wins. ld64 signs every arm64 executable ad hoc. Of the Apple ABI differences listed below, LLVM lowers what the triple implies, and the Loup-emitted calls into the runtime pass 64-bit words and pointers and are never variadic, so neither difference arises at that boundary.

**Windows targets (hosted, LLVM).** On a Windows host the LLVM emitter writes an `x86_64-pc-windows-msvc` module with the COFF (`m:w`) datalayout, and the build links it with `clang --target=x86_64-pc-windows-msvc -fuse-ld=lld -fms-runtime-lib=static`: lld (it ships with LLVM), and the MSVC C runtime linked statically, so the executable needs no Visual C++ Redistributable. clang finds the Visual Studio installation (its MSVC libraries and the Windows SDK) itself; nothing is configured. The output is `<project>/<name>.exe`, and an `-o` path with no extension gains `.exe`. The main thread's stack is reserved at 8 MiB (`/STACK`), the size a Linux or macOS program starts with, and threads a program spawns take the same. Native exceptions are explicit return-path propagation (no unwinding), so Windows' structured exception handling plays no part. The managed C runtime is the text every host compiles, made a Windows unit at build time: Windows is LLP64 (`long` is 32 bits), and the runtime spells its 64-bit words `long`, so every `long` that is not already `long long` / `long double` is compiled as `long long` (with its integer-literal suffixes, `printf` length modifiers and `long` library names) — the LP64 meaning the runtime and the emitted IR (uniform `i64` words) assume; ahead of it a Win32 host layer implements the POSIX services the runtime uses (threads and locks, clocks and sleeping, files and directories, processes). Host behaviour there: standard streams and files are binary (no CRLF translation) and paths, arguments and the environment are UTF-8; console output is written as UTF-16; `execShell` and `execReplace` run the host shell `%COMSPEC% /d /s /c "<cmd>"` (stdlib reference §21.13; `execReplace` waits for it and exits with its status, as Windows has no `exec`); `exec(argv)` finds the program as `CreateProcess` does (`.exe` appended, then the application and system directories and `PATH`) and answers 127 when it cannot start; `core.math`'s functions reach the system C runtime (`ucrtbase.dll`) by name, since the program's own `sqrt`, `sin`, … wrappers win every static reference; and a runtime `abort` ends the process with status 134 (what a POSIX shell reports for `SIGABRT`) without an error-reporting dialog. A file path of any length the file system takes is accepted: Win32 parses a path only up to `MAX_PATH` (260 UTF-16 units with the terminator, 248 for a directory it creates), so one whose full form is 247 units or longer is passed in its extended-length `\\?\` form (made absolute against the working directory first, `\\?\UNC\…` for a UNC path), so neither the `LongPathsEnabled` registry setting nor a `longPathAware` manifest is needed; any other path is passed as written. `IoError.code` is the C runtime's `errno` (§1-18.1's platform error number): `2` for a missing file, and `13` (`EACCES`) for `readText` of a directory, where Linux and macOS report `21` (`EISDIR`). An exception that escapes `main` ends the program with status 1, as on every host (§1-18.4): the runtime's at-exit check is an `atexit` handler here, because the MSVC C runtime runs a C `destructor` as one of its own terminators, from which the check's exit re-entered itself (1.29.2; before, such a program ended on an NTSTATUS, which Git Bash shows as 127). `loup test --native` keeps its per-test deadline in process, as on macOS.

**Pending implementation — the remaining Windows and Apple lanes.** Only the LLVM lane emits PE/COFF (on a Windows host) and Mach-O (on a macOS host). The Cranelift emitter pins an **ELF** triple for every architecture it accepts, and the LLVM emitter pins `*-unknown-linux-gnu` hosted / `*-unknown-none-elf` freestanding everywhere but on a macOS or Windows host. Concretely:

- `--os macos` / `--os darwin` / `--os windows` are accepted by the CLI and normalise to `aarch64-apple-darwin`, `x86_64-apple-darwin`, and `x86_64-windows-msvc` triple **strings**. Those strings reach only the packaging layer, where they select an output-directory name and a library file extension. They never reach code generation: the hosted triple is the build host's, never `--os`'s.
- The `MacOsArm64`, `MacOsX86_64`, and `Win64` calling conventions, and the `ld64.lld` / `lld-link` linker fallbacks of §3-2.3, exist in the source tree but are reachable only from a backend entry point that returns an empty object. Their presence is not evidence of target support (the hosted Windows and Apple links above go through clang, not through them).

An Apple target is not a triple-string change, which is why the LLVM lane needed the runtime and link work above and why the other lanes stay refused rather than emitting an ELF object ld64 cannot link: the Apple ARM64 ABI diverges from AAPCS64 (variadic arguments are passed on the stack, and `i8`/`i16` arguments follow different promotion rules), `ld64` takes a different command vocabulary from `ld.lld` (`-platform_version` in place of the GNU flags), and arm64 macOS refuses to execute an unsigned binary — code signing is mandatory rather than optional. A revision that implements another of these lanes MUST update this table and this note.

**Cross-compilation:**

```
loup build --target native --arch aarch64 --os linux     # ARM64 Linux
loup build --target native --arch riscv64 --os linux     # RISC-V Linux
```

Cross-compilation requires a cross-linker and target sysroot. The toolchain searches `PATH` for `<arch>-<os>-lld` or accepts a `--linker` override. The validated hosted cross build is Linux x86_64 ↔ aarch64 (see "Linux hosts" above). Cross-compiling to a **non-ELF** platform is not available; see the pending-implementation note above. (On a macOS host, `--arch arm64` / `--arch x86_64` select either Apple architecture: that is the host OS, linked by Apple's toolchain, not a cross-OS build.)

**Output types:**

```
loup build --target native                  # executable (default)
loup build --target native --lib shared     # shared library — see the note below
loup build --target native --lib static     # static library — see the note below
```

**Pending implementation — library output.** Only the executable form is lowered to machine code. `--lib shared` and `--lib static` route through the packaging layer rather than the native backend, and the file they write — `lib<name>.so`, `lib<name>.dylib`, `<name>.dll`, `lib<name>.a`, `<name>.lib`, chosen from the resolved triple string — carries the module's **Wasm bytes** as its payload, not native machine code. This is a placeholder that preserves the module content for downstream tooling; it is not a loadable native library on any platform, including the supported ELF targets. A revision that lowers library output MUST update this note.

### §3-2.2 Compiler Backends

The native compilation pipeline:

1. Parse and type-check all `@mode(host.native)` source files (and, for AOT builds of dual-deliverable modules, `@mode(host.dual)`).
2. Lower to MIR (mid-level intermediate representation).
3. Emit backend input (selected by `--backend llvm|cranelift|llbe`; default: `llvm`).
4. Optimise (LLVM: `O0`–`O3` via `--opt`; Cranelift: speed-focused; `llbe`: its own `-O0` / `-O1` levels on x86_64, below).
5. Link with the Loup native runtime library and any `extern native` libraries.
6. Produce the final binary.

**LLVM backend (`--backend llvm`):** Emits LLVM IR *text* and compiles it through `clang` at `-O2` with ThinLTO — the standard LLVM optimisation pipeline (inlining, vectorisation, link-time optimisation). Recommended for production builds. (Profile-guided optimisation is not yet wired.) Requires a host `clang`.

**Cranelift backend (`--backend cranelift`):** Lowers MIR to Cranelift IR and emits relocatable objects in-process, then invokes the platform C toolchain to link. Provides fast compilation with moderate optimisation. Recommended for development and CI. Does not support LTO.

**Self-hosted backend (`--backend llbe`) — the clang-free path:** `llbe` is the Loup-authored native backend (`source/runtime/compiler/loup_llbe/`). It parses LLVM-IR *text* and emits ELF relocatable objects and machine code **directly**, using its own instruction encoder, assembler, and ELF writer. It links neither against the LLVM libraries nor through `clang`/`gcc`: no external C toolchain is required anywhere in the pipeline.

This is the distinguishing property of `llbe`. The `llvm` and `cranelift` backends stop at C source or IR/object level and delegate final code generation, objecting, and/or linking to an external toolchain; `llbe` performs those steps itself. A build machine with no LLVM and no C compiler installed can still produce a working native artifact via `--backend llbe`.

`llbe` targets the freestanding profile (§3-3) and the self-hosted hosted build (`loup build` without `--backend`), and is the choice where toolchain independence and byte-level control of the emitted object matter. Architecture coverage and maturity per arch are given in §3-3.2.

**Constants are read-only (compiler's rule, loup#920).** On every `llbe` target the object places a global the IR declares `constant` — whatever its linkage — in **`.rodata`** (`SHT_PROGBITS`, `SHF_ALLOC`, not writable), as clang places it: string literals' bytes, the freestanding `{ptr, len}` string descriptors, interned enum unit values, the value-type descriptor tables, and the backend's own floating-point constant pool. A constant that holds addresses goes there too, its pointers relocated through `.rela.rodata` (`.rel.rodata` on the REL arches `arm` and Thumb): every `llbe` route is a static link — `ld.lld -T <script>` for a freestanding image, `clang -no-pie` for the hosted build, the backend's own linker for `exe:` — so those relocations are applied by the linker and never by a loader, which is what clang does with a static relocation model (every bare-metal target, `-fno-pic` on x86_64). Writable globals stay in `.data`, a `thread_local` global in `.tdata`, and a global with an explicit `section "X"` (§3-3.12) in X. What protects `.rodata` at run time is the image's segment map: a hosted executable maps it read-only, the `exe:` executable is three `PT_LOAD`s — headers and code read + execute, the constants read only, the writable globals read + write — with a non-executable stack (`PT_GNU_STACK`), and a freestanding image follows its linker script (a script that places `.rodata` in a writable segment gets a writable `.rodata`). Before loup#920 every constant went to writable `.data` on every target but Thumb, and the `exe:` executable was one read/write/execute segment, so a stray store could rewrite a string literal or a constant table unnoticed. Gate: `tests/rodata_sections/` (`loup test`): each constant class against clang on eleven targets, the freestanding routes, the hosted lanes, and a store into a constant that must fault.

**The clang routes keep the same rule (loup#920).** Every freestanding route that hands a `.ll` to clang — loup-build's x86_64 kernel route (whole, `separate`, with the stack budget) and its Cortex-M recipe, and Stage0's `--backend llvm` on every arch, which loup-build reaches by delegation — compiles it **for the triple the `.ll` carries** (`--target=x86_64-unknown-none-elf`, `i386-unknown-none-elf`, `aarch64-unknown-none-elf`, `armv7-unknown-none-eabi`, …). For every such bare-metal triple clang's relocation model is **static**, the model of a fixed-address image (§3-3.21.1), so clang places the same constants in `.rodata`, an address-holding one included, its pointers resolved by the link. On x86 each input is compiled on its own (`-c`) for that triple and the objects are linked by the host driver's unchanged link line (for a bare-metal x86 triple clang's driver would link through the system `gcc` instead). Before loup#920 the x86 routes passed no `--target`: clang substituted the host triple and, on a Linux host, its position-independent default, which puts an address-holding constant (every string descriptor) in `.data.rel.ro`, writable, and a kernel script's `*(.data .data.*)` folds that into `.data`. Two consequences of the static model on x86_64: the image's code reaches its globals through 32-bit absolute references (clang's default *small* code model for the triple: `R_X86_64_32` for an address in a register, `R_X86_64_32S` for an indexed operand), so a freestanding x86_64 image is linked in the low 2 GiB of the address space and the linker refuses one placed elsewhere (`relocation truncated to fit`, never wrong code); and an unoptimised build (`-O0`, the kernel route's level) materialises each global's address with a 10-byte `movabs` where the position-independent model used a 7-byte `lea [rip]`. A `relocatable` program (§3-3.21.1) stays position-independent (`-fPIE`).

**Optimisation levels (x86_64; compiler's rule, batch 36, roadmap RR-P4 §9A).** `loup-llbe` takes a positional `-O0` / `-O1` / `-O2` / `-Os` token on its x86_64 object and `exe:` paths; the default is `-O1`. `-O0` is the Tier-1 stream — every IR value in a frame slot, RAX/RCX/RDX the only registers — byte-identical to every object the backend emitted before the levels existed, and what the library entry points `compile_ll_to_obj` / `compile_ll_to_exe` still produce. `-O1` runs, per function: inlining of the module's small functions (bounded in instructions and blocks; no `alloca`, inline asm, exception handling, varargs, indirect branch, float params or result, not self-recursive; the callee's returns join in a `phi` at the continuation; a per-function site budget bounds growth); promotion of non-escaping scalar `alloca`s to SSA values and `phi`s (mem2reg, linear in the function; an alloca named in any phi or EH text is left in memory; a load in a block with 16 predecessors or more stays a load and its alloca keeps its stores — a `phi` there would cost one copy per incoming edge, since this backend's out-of-SSA does not coalesce them, and a frame's shared exit has an edge per return and unwind site — while the variable's other loads are promoted, `LOUP_LLBE_NO_M2R_WT=1` off); the IR cleanups — unreachable blocks dropped, the three-way-compare idiom `(a > b) − (a < b)` tested against 0 folded to one `icmp` (signed or unsigned after the inner compares), `icmp ne (zext i1 x), 0` to `x`, same-width `ptrtoint` / `inttoptr` / `bitcast` dropped, pure unused values removed (a load, a division, a call, an atomic or a store is never removed); tail-recursion elimination with an accumulator — a self-call whose result the block returns, directly or through one wrapping `add` / `mul`, becomes a branch back to a header that carries the parameters and the running sum as `phi`s (exact, because those operations are wrapping and associative; the shape checked arithmetic lowers to never matches), never on a function with an `alloca`, inline asm or exception handling; runtime-call fusion — `s = s + i.to_string()`, lowered by the front end as an `int_to_string` / `str_append` / `str_free` triple on a temporary nothing else uses, becomes one call to the companion's `__loup_runtime_str_append_int`, which formats into a stack buffer and appends under `str_append`'s own ownership rule; only when the module declares that entry (loup-llvm declares it beside `str_append` from the build whose companion defines it, so older IR and the libOS lane are untouched); the `-O1` selector — immediate operands, compare-and-branch on the flags, constant-offset `getelementptr` chains folded into the memory operand (RIP-relative on a module global), a `select` as a conditional move, a scaled-index `getelementptr` as one `lea`, a constant stored through a pointer as a store-immediate, a `double` constant operand of an SSE operation loaded from a per-module RIP-relative constant pool (`@__llbe_fc_N`, internal 8-byte constants in the object's data) instead of a 64-bit immediate moved through a general register; store-to-load forwarding; a linear-scan register allocator over frame-slot live ranges (callee-saved RBX/R12–R15 across calls, caller-saved R10/R11/R8/R9/RSI/RDI where no call or write intervenes, xmm3–xmm15 for values that SSE instructions produce and consume); and the machine peepholes (scratch-register copy propagation and result retargeting, redundant moves, jump threading, the SSE copy chains: a value bridged through a general register to several SSE registers becomes `movaps` copies when nothing else reads the bridge; and pooled-register copy coalescing: `mov T, X; op T, Y; mov H, T` with the temporary dead afterwards becomes the one operation on `H`, under a register liveness computed across blocks). `LOUP_LLBE_NO_PEEPHOLE` also takes `pooled`. A hot slot whose range crosses calls, once every callee-saved register is busy, is split at those calls: it lives in a caller-saved register and is spilled to its frame slot before each call inside its range and reloaded after, when its accesses outnumber those two moves per call (`LOUP_LLBE_NO_SPLIT=1` off). An integer compare whose only use is a `select` of its block is not materialized as a 0/1: the select re-does the compare and takes its false arm with the negated condition's `cmov`. `-O2` is `-O1` today (reserved for the later §9A passes). `-Os` is `-O1` on the size-opt stream; the bare `size-opt` token keeps its level-0 meaning (the kernel route's contract). `LOUP_LLBE_OPT=0|1|2|s` overrides the token (the triage kill switch); `LOUP_LLBE_NO_INLINE`, `LOUP_LLBE_NO_MEM2REG`, `LOUP_LLBE_NO_TRE`, `LOUP_LLBE_NO_FUSE`, `LOUP_LLBE_NO_REGALLOC`, `LOUP_LLBE_NO_XMM` and `LOUP_LLBE_NO_PEEPHOLE[=moves,scratch,xmm,jumps]` switch single passes off; `LOUP_LLBE_VERIFY_OPT=1` re-verifies every function after the IR passes and fails the compile on an error; `LOUP_LLBE_PRINT_OPT=1` prints each function after them; `LOUP_LLBE_RA_TRACE=1` prints the allocator's choices. Every other arch keeps its tier as §3-3.2 describes it (aarch64 runs mem2reg on its size-opt stream, as before); the level is accepted and ignored there. The gate is `source/runtime/compiler/loup_llbe/opt_x86_e2e_run.sh` (the same IR at `-O0`, `-O1` and through clang must run identically) plus `opt_test.lpscr` / `inline_test.lpscr` / `tailrec_test.lpscr` / `fuse_test.lpscr` / `regalloc_test.lpscr` under `loup test`; the measurements are in the release-readiness roadmap §9A.8 and `bench/`.

**Hosted list access, reference counting and string literals (compiler's rule, batch 36, roadmap §9A Tracks A5, C-1 and C-2).** On the managed hosted lane the self-hosted emitter lowers `xs[i]`, `xs[i] = v` and `xs.push(v)` to an inline fast path over the companion's list handle `{ i64 len, i64 cap, ptr data, i64 width }` — one unsigned bounds compare, `i <u len` — with the original companion call as the cold path for a null handle, a negative index (resolved from the end there, as before), an out-of-range index or a full spine, so the fatal message and the growth path are the runtime's own; only for the external C runtime's symbols, never inside runtime functions, and `LOUP_LLVM_NO_INLINE_LIST=1` restores the calls. Retain and release of a class instance (§3-2.4) are lowered the same way: a null handle or a header without the object magic counts nothing, otherwise a locked 32-bit add or sub on the count; a release that reaches zero restores the count to one and calls the runtime's `loup_arc_release`, which decrements again, runs the finalizer and frees — the same sequence of observable effects, since only the releasing thread held that last reference; `LOUP_LLVM_NO_INLINE_ARC=1` restores the calls. When no reachable function of the program calls `__loup_system_thread_spawn` — the hosted lane's one way to make a thread, which `spawnBlocking` and `spawnWorker` reach — no second thread can touch a count, and the inline retain and release are a plain load, add or subtract, and store instead of locked atomics, their cold paths the runtime's `loup_arc_retain_plain` / `loup_arc_release_plain` (§3-2.4's atomic count is for programs that do spawn; `LOUP_LLVM_ATOMIC_ARC=1` keeps the atomics regardless). `d[k]` and `d.contains_key(k)` on an int-keyed dict inline the runtime's first probe — the index slot the key's hash selects, when the index is built for int keys, clean and not due a rebuild (the conditions under which the runtime's own lookup has no side effect): an empty slot is the miss, a slot whose key is k the hit, anything else the runtime call; `LOUP_LLVM_NO_INLINE_DICT=1` restores the calls. A string literal's descriptor is one initialized global `{ i64 -1, i64 0, ptr @.strlit, i64 len }` (the immortal header the runtime never writes, then the slice at +16) filled by the link, not a store pair per execution of the site — in both emitters, the self-hosted one and Stage0's; the relocatable lane keeps its stores (its loader applies no relocations). None of these changes anything a program can observe. A `list[bool]` is stored one byte per element: the companion's list header is `{ i64 len, i64 cap, ptr data, i64 width }`, `width` 1 for such a list and 8 — or any value a header nothing initialized carries — for every other list; the emitter creates a list literal typed `list[bool]` with width 1 (and a push on a `list[bool]`-typed receiver narrows an empty word-wide list first), the inline fast path reads the width and has a byte arm, and every runtime operation on a caller's list reads and writes elements by the width, copies, slices and concatenations inheriting it. A `list[float32]` is four bytes per element — the IEEE single; the uniform word holds a `float32` as a double already rounded to single precision (the `fptrunc`/`fpext` pair at every store), so single → double → single is exact. A `bytes` read from a file is one byte per element (core §1-4: `b[i]` is an `int` in 0..=255), and `toInts()`/`toList()` is a fresh word-wide `list[int]` (`__loup_runtime_bytes_to_ints`), never the buffer itself. Every other list stays word-wide. `LOUP_LLVM_NO_WIDTH_LISTS=1` creates every list word-wide. Nothing a program can observe changes; a `list[bool]` of 20 million entries takes 20 MB, not 160.

**Backend selection is honoured or refused, never silently swapped.** For a freestanding target the two lanes are `llbe` (the self-hosted clang-free chain, the default) and `llvm` (clang). A build MUST run the lane the flag names: it is an error — `E_BACKEND_UNAVAILABLE` — for a driver to accept `--backend <b>` and build through a different backend. This rule is not cosmetic. A harness that names one lane while another one runs reports coverage it does not have: instructions only one backend can encode "pass" without ever reaching code generation.

Correspondingly, `--backend llvm` on a freestanding target is a **valid selection**, not an unavailable one, and the driver routes it to the clang lane. Per-arch `llbe` coverage is tiered (§3-3.2), so a unit whose constructs that arch's tier does not yet lower is refused by `llbe` **by name** — and `llvm` is then the route that builds it. A driver that refuses `llvm` for freestanding leaves such a unit with no route at all. `E_BACKEND_UNAVAILABLE` remains correct for a backend that genuinely has no freestanding lane (`cranelift`, and the hosted `c` backend).

### §3-2.3 Linker

**Reference linker:** `lld` (LLVM linker). `lld` ships with LLVM, supports all three output platforms from a single binary, and enables LTO across Loup and C/C++ translation units.

The toolchain searches for `lld` in the following order:
1. The path specified by `--linker <path>`.
2. `loup-lld` in the toolchain's `bin/` directory (bundled).
3. `lld` on `PATH`.
4. Platform fallback: `ld.lld` (Linux). The `ld64.lld` (macOS) and `lld-link` (Windows) entries are declared in the fallback table but unreachable: the hosted macOS and Windows builds link through the host clang driver (Apple's ld64; lld's `lld-link` via `-fuse-ld=lld`), not through this search (§3-2.1).

**Platform toolchain overrides.** `--linker <path>` overrides the discovered linker for any target. An Apple-platform override — selecting the Apple `ld` for code signing and entitlements — is **not yet available**: it presupposes a Mach-O object this toolchain does not produce (§3-2.1).

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

### §3-2.4 ARC Memory Management

**Native builds use Automatic Reference Counting (ARC) as the mandatory memory management strategy.** There is no GC option for `--target native`. All class instances are heap-allocated with embedded reference counts.

**Reference counting model:**

- Every class instance carries an inline `strong_count: atomic_int` and `weak_count: atomic_int`.
- Assigning a reference increments `strong_count`. Releasing a variable decrements it.
- When `strong_count` reaches zero, `finalize()` is called (if the class implements `Finalizable`) and memory is freed.
- `weak` references track `weak_count`. When `strong_count` reaches zero, `weak_count` is decremented. Memory is freed when both counts reach zero.
- Reference count operations are atomic, enabling safe use across OS threads in future multi-threaded extensions.

**Compiler-inserted retain/release.** The compiler analyses ownership at each assignment, function call, and scope exit and inserts `retain()` and `release()` calls automatically. User code never calls `retain()` or `release()` directly — these are `@internal` runtime functions.

Compiler's rule (niche `Option` stores). An `Option[C]` value whose payload is a class `C` is represented as the reference itself — `Some(x)` is `x`, `None` is the null reference; there is no box — so storing `Some(x)`, an `Option[C]` binding, or `o.unwrap()` into a class field, a collection element or an enum payload is an assignment of that reference and increments `strong_count` exactly as storing `x` does; the source binding's release at scope exit then leaves the destination holding its own count. (loup#563: a `Some(local)` stored into a field took no count and the local's scope-exit release freed the object the field still held.)

Compiler's rule (runtime type tests on reference classes). `x is C` for a reference class `C` compares the runtime type id stamped in the object's header at allocation against `C`'s id — never a trailing slot of the object's block, which a reference object does not carry. When the receiver's static type does not prove a reference-class object (an `Any`, an untyped value — a method's `Any` parameter, a generic `T` slot, a raw scalar lowering could not box), an object is recognised by PROVENANCE, never by reading the word: every native runtime (the managed C runtime and the libOS core) marks each object's base in its ARC-object registry when `loup_arc_alloc` allocates it and clears the mark when the block is freed (at refcount zero, and for every object of a region when the region is left) — in a program that can ask the registry: one whose code runs such a test or constructs a class with an `Any` field defines `__loup_runtime_objreg_wanted()` answering 1, which the runtime reads once before its first allocation, and every other program never touches the registry (ruling IS-5, loup#647) — and the test asks `__loup_runtime_obj_is(word)` — which answers from the registry's own tables and never dereferences `word` — before it reads the header's type id; any word the registry does not hold (null, a small or LARGE raw integer, a tagged scalar box, a string, a collection, a value object, a freed object) answers `false`. (loup#614: the guard ruled out a word below 65536 and a tagged box and then read the header magic at any other word, so a raw integer such as 2000000 in a method's `Any` parameter was dereferenced — a SIGSEGV on every native lane.) The match set is §1-4.7's subtype set (maintainer ruling IS-1, loup#595): the type ids of `C` and of every reference class that extends it, OR-ed in one compare chain in ascending id order. An interface target `I` (no type id of its own) compares the header id against every reference class that implements `I` — directly, through an ancestor, or through an interface extending `I`; a receiver statically typed as a struct answers an interface target at compile time from the struct's `implements` clause; any other receiver asks the value-object registry first and a registered value object answers by its type-id slot against the implementing value types; a scalar, string or collection receiver answers `false`. (loup#566: both Stage0 emitters and the self-hosted one read the exception catch filter's trailing slot and answered `false` for every class `is`.) A target that is NOT a reference class — a struct, a value class, a class the program never constructs — is tested against the value object's trailing type-id slot (the slot `NewObject` stamps), and that read is made only where a value object is known to be there: a class the program never constructs (in neither construction census) answers `false` without a read; a receiver whose static type is a reference class, a scalar, a string or a collection answers `false` without a read; a receiver statically typed as a value object reads its slot; any other receiver (an `Any`, an untyped value) first rules out the null reference, a word below the first mapped page, a tagged scalar box and a block carrying the object header's magic word (a reference object has no trailing slot) — each `false` — and only then reads the slot. An exception-class target compares the slot against the target's id and every value-object class that extends it (loup#595). A value object is recognised by WHERE it lives (loup#589, design row IS-3): every managed-native value-object block that an untyped position can reach is a per-site static listed in the module's value-object table (`@__loup_vobj_table`, `{ i64 count, [count x ptr] }`) or a heap block the runtime's value-object allocator (`__loup_runtime_vobj_alloc`) registered (loup#596: a frame block is placed only where no untyped position can see it — *Compiler's rule (value-object storage)*); for a struct, exception or interface target on a receiver not proven to be a value object (an `Any`, an untyped value) the test first asks `__loup_runtime_vobj_is(word, table)`, which never dereferences the word, and reads the trailing slot only for a registered block — so a struct or an exception answers through every position that widens it into `Any`, and a string, a list or a dict is never read (the slot read ran past a 16-byte string descriptor — an AddressSanitizer global-buffer-overflow on a literal; an exception target faulted). The catch dispatch's operand and an F1-proven value-object receiver read the slot directly. `x is Any` is `true` for every value (§1-4.7, ruling IS-2). A `string`, `list`, `dict`, `tuple`, `Option` or `Result` target on a statically-`Any` operand answers from the word's kind (ruling KIND-2, loup#679: RT-1, a collection by its container kind): a string box or a descriptor box by its tag or its descriptor's head letter (`__loup_runtime_any_is_kind`), an unboxed word by `__loup_runtime_any_word_kind` (only a string can be told there) — a collection that reached the `Any` through a position lowering cannot see answers `false`. (loup#573: `let an: Any = A(8); an is B` with `B` never constructed read the slot 8 bytes past the 32-byte object; an `Any` holding a tagged scalar box faulted on the same read.)

Compiler's rule (union positions, enum identity and the descriptor box through `Any`). On the managed native lanes a union with a NON-object member — a scalar, a string, an enum, a collection, an `Option` / `Result`, a tuple or `None` beside its other members (`int | C`, `string | C`, `E | C`, `S | int`) — is an `Any` position (design (a) of the U+E stream, maintainer rulings 2026-10-31): its word does not say what it holds (a raw `5` and a `C` pointer, a bare enum block and a string slice are indistinguishable), so both lowerings treat every such annotation — a parameter, a result, a local, a field, a global, a container's element or a dict's value — as `Any`: a scalar entering it is a tagged box, a composite whose type the compiler knows a descriptor box, an `is` test asks the word (`__loup_runtime_any_is`, `__loup_runtime_any_is_kind`, `TypeCheck`, `__loup_runtime_any_is_enum`), and a narrowed read takes the payload. A union of objects only (`S | C`) keeps its word: every member is classified by the object and value-object registries. An `is` TARGET written as a union is no position: it is tested member by member over the operand's word (core §1-4.7 *Compiler's rule (`is` with a union target)*; the rewrite keeps each union's members for it). An `as` / `as?` target written as a union is tested the same way (core §1-4.7 *Compiler's rule (`as` / `as?` with a union target)*): the cast's value is the operand's `Any` word kept (another operand entering the `Any` as an `Any` position takes it: a scalar boxed, a known composite in its descriptor box), an object-only union's the object; `as?` is the NICHE `Option` — the word or object itself, or `0` for `None` — and a failed `as` raises through `__loup_gf_type_error` as below (b36f-caswc). Every value that enters an `Any` position describes itself (NOTE 7, option (a)): wherever a scalar or an enum value is stored into a position of static type `Any` — a binding, an assignment, an argument, a result, a field, a list / set element, a dict value, an `Option[Any]` payload — it is boxed, and every read of an expression the checker typed `Any` (the checker's word channel, `native_word_kinds`: `A` for an `Any` / such a union, `U<E>;` for an enum value) takes the payload, so no reader sees a box it does not expect; a string, an object and a value object are self-describing and enter as they are. The DESCRIPTOR BOX is the one representation of a composite value in an `Any` word: a counted value block `{LOUPANY! magic, 6, payload, desc}` (four words under the value header) whose WORD is the block address with the key `0x7FFA` in its top 16 bits (recognised without a dereference: `__loup_runtime_any_is_box`), `payload` the value's own word (an enum block, an interned unit variant, a list / dict spine, an `Option` / `Result` word), and `desc` the address of a static `{ptr, len}` slice spelling the value's render descriptor in its top-level form `^<d>` (§3 *Compiler's rule (native rendering of user types)* grammar): `^U<E>;` for a user enum `E` (`^U<E>[<d>…];` for an instantiated generic one), `^R<t><e>`, `^O<d>`, `^L<d>`, `^D<k><d>`, `^T<n>…`; a SCALAR box is `{magic, tag, payload}` with `tag` `0` int, `1` float, `2` bool, `3` char, `8` float32 (`4` string boxes, `6` descriptor boxes, `5` / `7` are word kinds). A box is immutable and shared by count; a descriptor box holds a count of a counted enum block and an exclusive copy of a collection, dropped at its own zero. `x is F.V` / `x is F` / `x as? F` on an `Any` word (an `Any`, such a union) asks the value's IDENTITY, never a bare tag compare: a descriptor box answers by its descriptor's type name and the payload's tag (`__loup_runtime_any_is_enum(word, "^U<F>;", tag | -1)`, `__loup_runtime_any_as_enum`); the interpreters and the Wasm hosts answer from the value itself (`TypeCheck`'s Path and Named arms); an operand whose static type is `F` keeps the tag compare; `Option` / `Result` targets keep their own tests; freestanding code has no boxes and refuses the test on such an operand (`E_FREESTANDING_RUNTIME`). (Before: `E.B(3) is F.Q` through an `Any` answered `true` — another enum's variant of the same tag —, `v is F` was `true` for every operand, a raw scalar's "tag" was read (SIGSEGV), `a as? F` answered `None`, and a union holding a scalar crashed every native lane.) The run-time WORD CLASSIFIER `__loup_runtime_word_kind(word)` is the one primitive every classified test builds on (B1 `==` included: core §1-5.1 *Compiler's rule (equality through `Any`)* — the checker marks such a site `deq$<dl>|<dr>` (each side's equality descriptor, `A` an `Any` word) and a `list[Any]` search `didx$<de>|<dx>`; both lowerings pass an `Any` side as its WORD to `__loup_runtime_value_eq_dyn(a, b)` / `__loup_runtime_value_eq_dyn_desc(a, b, "<dl>|<dr>")` / `__loup_runtime_list_index_of_dyn`, the equality walker's `A` letter is the same compare, and an `Option` / `Result` of scalars a lowering cannot type itself (a call's result, `d.get(k)`) takes its descriptor box from the checker's word channel, `^O<l>` / `^R<a><e>`; a string literal is told by its slice shape, as below): `0` raw, `1 | tag << 8` a scalar box, `2` a descriptor box, `3` a string (a counted descriptor, or a slice by its shape), `4` / `5` a counted list / dict spine, `6` a counted enum block, `7` an ARC object, `8` a registered value object, `9` mapped memory no registry claims — decided by the registries, the box key and the kernel's mapping answer, never by reading a word nothing vouches for; a module calling it asks both registries. `x as T` on an `Any` operand ASSERTS `T` (core §1-4.3; slotwc4, coordinator NOTE 9 / NOTE 11): the word is tested exactly as `x is T` tests it (every integer width reads the `int` box; an `Any` target passes) and a mismatch raises a catchable `TypeError("value is not an instance of '<T>'")` through `call __loup_gf_type_error [msg]` followed by `unreachable` — the one raise path the reified-generics lowering shares, which each native emitter raises as its guarded faults (the uncaught stop, `TypeError: <msg>` and exit 1, in a module with no handler machinery); a cast whose operand's static type can never hold a `T` (a string, bytes, collection, tuple or `Option` cast to a different one of those or to a scalar) always raises. Freestanding has neither the identity nor the exception and refuses both (`E_FREESTANDING_RUNTIME`). `Some(<scalar>)` entering an `Any` takes the descriptor box `^O<l>`. (Before: the native lanes read the payload unchecked — `"five" as int` was a pointer, `Option[Any] as int` a garbage word, `Some(3) is F` answered from the block's tag.) A value passed through a type parameter keeps today's rule until generics are reified (an `Any` word handed to a `T` parameter is handed on as the word).

Compiler's rule (methods on an `Any` receiver). On the managed native lanes a method call `a.m(args)` whose receiver is an `Any` word (an `Any`, a union with a non-object member) dispatches on what the word IS at run time (slotwc6, coordinator NOTES 10 / 14, rulings Q1–Q4): every class and struct of the program that declares `m` with this arity — less those whose superclass already declares it — is tested in name order (`TypeCheck`, the `is` test), and the first that holds calls that type's own method on the word (the `Class.m` call a typed receiver makes, dispatched by the object's run-time type, so a subclass reaches its override), its result BOXED by that type's own declared result (Q3: a scalar in a tagged box, a string, object or `Any` word held as it is, a collection, `Option`, `Result`, tuple or enum in its descriptor box, nothing as `None`) — the call on an `Any` receiver yields an `Any` word; no type holding, the word's built-in methods answer by its kind (`__loup_runtime_dyn_call<n>(word, "m", args…)`, the arguments as `Any` words): a string's `length` / `len` / `byte_length` / `is_empty` / `contains` / `starts_with` / `ends_with` / `index_of` / `last_index_of` / `char_at` / `substring` / `trim` / `trim_start` / `trim_end` / `to_uppercase` / `to_lowercase` / `to_int` / `to_float` / `split` / `chars` / `repeat` / `replace`, a list's `length` / `len` / `size` / `is_empty` / `first` / `last` / `get` / `contains` / `index_of` / `join`, a dict's `length` / `len` / `size` / `is_empty` / `contains_key` / `keys` / `values` (camelCase spellings alike); a collection element comes back as an owned `Any` word by its descriptor (`contains` / `index_of` compare by the element descriptor's equality; a collection of no known element kind, or of `Any` elements, compares by the dynamic equality `__loup_runtime_value_eq_dyn`, ruling Q1). Any other word or method — a scalar box, an enum, an object whose class lacks `m`, an unknown name, a wrong argument — raises a catchable `TypeError("no method '<m>' on a value of type <T>")` (Q2 / Q4: the text both interpreters now raise for that call, which was an uncatchable internal error there), and an element read out of range (`first` / `last` of an empty list, `get(i)`) the list subscript's `IndexError("list index <i> out of range (len <n>)")`, raised at the call site through the emitters' guarded faults (`__loup_gf_type_error`, `__loup_gf_index`: the runtime records the failure, `__loup_runtime_dyn_fail`), never a silent `0`. `to_string` keeps its render and an operator method its own lowering. The C backend refuses the shape (it lowers no managed virtual call); freestanding code has no `Any`. `a == b` / `a != b` whose LEFT operand is such a word, in a program declaring a user `op_==` (coordinator NOTE 16), tests each class or struct declaring it — deepest first (an override before the method it overrides), then by name — and the first that holds compares by that type's `op_==` (the typed call, dispatched by the object's run-time type) when `b` is of that type too, and answers unequal when it is not; no type holding, the dynamic equality decides (core §1-5.1 *Compiler's rule (equality through `Any`)*); the native lanes compared such an object by identity and such a struct field by field. The Wasm hosts raise the same catchable `TypeError` for a method no case implements on the receiver they hold (they trapped: "receiver kind not implemented", "length not supported on Int(5)"). On the interpreter and Wasm lowering, `x as <number>` on such an operand asserts the number's kind as the native lanes do — an `int` is no `float` (`TypeCheck`, then `throw TypeError(…)`, the native message); a statically numeric operand keeps the numeric conversion (§1-4.1.2). (Before: a list or string word reached the class vdispatch — SIGSEGV on Stage0's LLVM and Cranelift lanes, the clang-free lane and loup-build, a silent `0` from the self-hosted thunk, a build failure when no class declared the name — and a class's `bool` result rendered as `0` / `1`.)

Compiler's rule (`Result` payload access). A `Result[T, E]` value is always the boxed block `{tag, payload}` — there is no niche `Result` — so `unwrap()` / `expect()` read the payload word only after the tag says `Ok`, `unwrap_err()` only after it says `Err`, `unwrap_or(d)` yields the payload on `Ok` and `d` otherwise, and `is_ok()` / `is_err()` read the tag; the wrong variant (or a null word) raises `UnwrapError` with the interpreter's message: for the wrong variant, ``called `unwrap()` on an Err value: <payload>`` / ``called `unwrap_err()` on an Ok value: <payload>``, where `<payload>` is the other variant's value rendered by its static type through the `to_string` machinery (scalars and strings directly, a list or dict through its renderer, a struct, class or enum — or an `Option` / tuple of anything — through the runtime renderer and the render table below; loup#587 / #588), and `expect(msg)` reports `msg` verbatim; a payload no native renderer covers (a payload whose static type the F1 oracle does not know) leaves the message without the `: <payload>` suffix rather than inventing text, and a null word carries no payload (ruling UNW-1). Inside a libOS runtime function the self-hosted emitter skips the tag check, as it skips the `None` check there. The unwrap result carries the payload's static type (`T`; `E` for `unwrap_err`). (loup#568: the niche-identity default for `Option` handed the box itself back as the `Ok` payload. loup#574: the native lanes rendered no payload.)

Compiler's rule (native rendering of user types). A struct, class or enum value renders natively in core §1-16.4's structural form (*Compiler's rule (rendering struct and class instances)*) through ONE mechanism shared by the three emitters (Stage0 LLVM and Cranelift, the self-hosted emitter) and both runtime foundations (the managed C runtime, the libOS core). The runtime's descriptor renderer `__loup_runtime_coll_to_string(word, desc)` owns the spelling; its descriptor grammar (`i f g s b c`, `L<d>`, `O<d>`, `D<k><d>`, `T<n>…`) gains `U<Name>;` (a user type), `R<t><e>` (a nested `Result`: `Ok` renders its payload, `Err` renders `Err(e)`), `X` (no descriptor; see below) and a leading `^` (the TOP-LEVEL form a print / `str` / `to_string` sink uses: `None` renders empty, a string unquoted, a float in its top-level spelling); `O<d>` covers every payload (a scalar payload is boxed, anything else — a string, a collection, a tuple, an object, an enum — is the niche pointer), and a 1-tuple renders `(x,)`. What only an emitter knows — a field's slot, whether a class carries the 24-byte ARC header, a class's type id — it publishes as the program's RENDER TABLE, `__loup_runtime_render_table_into(out)` (it stores the table's string slice at `out`; the C runtime's weak default stores none; the libOS core declares it body-less and the self-hosted emitter always defines it on that lane): one entry per type, `Name=S f@slot:d …|` (a value block: struct, value class; a `@repr(C)` field as `f@offset.size:d`, read as its `GetField` reads it), `Name=C<tid>#f@slot:d …|` (a reference class: an instance whose header names another type id renders as that class), `Name=W f:d|` (a `@repr(transparent)` wrapper), `Name=E v1(d…)v2(d…)…|` (an enum: the tag word picks the variant, payload i is word i + 1). Each entry is built from the lowering's per-type descriptors (`MirModule.type_render_descs`, serialized as `TypeRender` lines, byte-identical on both lowerings: a struct or class's OWN instance fields with their descriptors — the emitter folds inherited ones in, inherited first — and an enum's variants with their payload descriptors) and closed over the types those descriptors name and over every subclass of a class. The roots are the user types the lowering's descriptors name (`U<Name>;` in a string constant handed to the renderer) and those the emitter's own sinks render (a print / `str` / `to_string` argument or an unwrap payload whose F1 type is a struct, class, enum, or an `Option` / tuple / collection of one). A sink's render records the first `Err` it reaches — a top-level `Result`'s or a nested one's — as that `Err`'s `repr` (`__loup_runtime_render_sink_err()` hands it over, once), and every sink whose descriptor can reach a `Result` (directly or through the table's entries) tests it after the render and raises the interpreter's `RenderError` (``rendered an `Err` value: <repr>``) — through the handler machinery where the module has it, else the `RenderError: <message>` line and exit 1, as every guarded fault (core §1-16.4 *Compiler's rule (an `Err` anywhere in a rendered value)*, ruling REND-2); a lowering-emitted collection render at a sink is tested the same way. The lowering renders a sink argument itself where the register typing cannot carry its declared type — an `Option` / `Result` holding a `Result`, an instantiated generic user type (`annotated_sink_desc`, both lowerings) — by its annotation's descriptor, and `repr` of one likewise (`__loup_runtime_coll_repr`). loup#607 adds four descriptor letters and a runtime mode: `A` — an `Any` word, classified at run time without reading it before it is known to be memory (a tagged scalar box by its tag, an ARC object by the ARC-object registry — `__loup_runtime_obj_is`, never its header magic — and then its header's type id and that class's entry, a registered value object — struct, value class — by the type id `__loup_runtime_vobj_tid_into(word, out)` reads, a string slice by its shape once neither registry claims the word, else the integer the word is; a module that renders such a word asks the registry — ruling IS-6, loup#680); loup#653 adds `Q<d>`, an `Option` over a type parameter: always the boxed form (ruling GBOX-1); `F` — a function value, whose record's word 0 (its thunk) names it through `__loup_runtime_fn_name_into(thunk, out)` (canon's spelling: a quoted MIR name, a capturing closure `__loup_closure()`); `P<i>` — the declaring type's i-th type parameter, bound by the emitter per INSTANTIATION: a root `U<Name>[<d1>…];` gets its own entry (`Box[i]=S v@0:i|`, the type's own `P<k>` letters replaced by the arguments, inherited fields as declared) and prints as `Name`, while a word whose instantiation no annotation names is classified like an `A`; and the `repr` mode (`__loup_runtime_coll_repr(word, desc)`: strings quoted with escapes, `c"x"`, `Some(v)` / `None`, `Ok(v)` / `Err(e)`), through which every emitter now renders `repr` of a compound value, so the per-type family is left as a fallback. When any entry can hold an `A` / `P` word, the table lists every struct, class and enum and a value block's entry carries its type id (`S<tid>#`); the emitter hooks are the emitters' (LLVM, the self-hosted emitter; weak defaults in the C runtime, body-less declarations the self-hosted emitter always defines on the libOS lane). Only a field of a type no descriptor describes (`X`: an `array`, a `decimal`, a `buffer`) is refused at build time (`E-BUILD-NATIVE`, naming the type and field; ruling REND-1). A native `Any` carries the kind of the value it holds wherever lowering sees the widening (native-compilation Requirement 4.14, ruling KIND-1): a scalar is a tagged box — through a module function's, a method's or a constructor's `Any` parameter and into an `Any` field too — and a `Result`, `Option`, list, dict, tuple or user enum a descriptor box `{…, "^<d>"}` rendered by `d`, so an `Err` held in an `Any` is the sink's `RenderError` like any other; an `Any` word printed at a sink that is an object or a registered value object renders through the table, which then lists every type; an un-annotated binding of a generic constructor call renders by the instantiation its arguments bind (`let b = Box(2.5)` → `Box[float]`). A scalar that reaches an `Any` or a type-parameter field through a position lowering cannot see (a lambda's parameter, a receiver whose class it cannot resolve, a collection element) is still the raw word and renders as that integer. Every render walk follows core §1-16.4 *Compiler's rule (render depth and cycles)*: a composite 100 levels deep, or an object already on the walk's path, renders `...` (ruling REND-3). (loup#587: a struct rendered an empty line on every native lane. loup#588: Cranelift had no class or enum renderer. loup#585: a dict, list or `Option` holding any of them, and an `Option[list]` / `Option[dict]` value, rendered an empty line.)

Compiler's rule (a list of unproven element kind at a sink). A list value whose element kind neither the lowering nor the register typing proves — an un-annotated `var nl = []` never filled — renders at a print / `str` / `to_string` sink by the descriptor `LA`: each element is classified as an `Any` word (`A` above), so an empty one renders canon's `[]`, as an empty dict of unknown kinds renders `{}` (ruling RENDU-1; loup#636: Stage0's sinks printed an empty line, the self-hosted emitter the list header's address).

Compiler's rule (`Option[C]` returns and fields). A function or method declared to return `Option[C]` with `C` a class hands its caller an owned reference — the same `+1` convention as a module function returning `C` (loup#508), applied to functions and methods alike: a `return` of an owning binding transfers its count (including `return Some(r)`, where the payload is the value), `None`, a construction, an owning call and a call under this convention already carry the caller's count, and every other returned value (a field read, a parameter, an element, `Some(o.f)`, `o.unwrap()`) is retained before the frame's releases. The caller owns that count: a `let` binding releases it at scope exit; a temporary compared against `None` is released after the comparison; a temporary passed to a user function, method or constructor is released after the call (the parameter is a borrow — a store of it retains, a return of it is under this rule); a store into a field, element or payload moves it. Consequently an `Option[C]` field is an owned reference like a `C` field: releasing the owner releases the payload, and reassigning the field (including to `None`) releases the previous payload; a raw `dict[K, C].get(k)` stored into such a field is retained (the dict keeps its count). An `Option[struct]` payload is a value and a `Result[..]` a boxed value — neither is released by the owner. (loup#570: the finalizer classified an `Option[C]` field as a scalar and the payload of every object that died holding a `Some` leaked, while `Option[C]`-returning functions sat under the enum rule, whose retain corrupts the word before a class payload.)

Compiler's rule (`Option[P]` over a type parameter). A function or method declared to return `Option[P]`, `P` one of its own or its type's generic parameters, is compiled once over a `P` it cannot see, so its `Some(v)` is the untyped niche word — the payload word itself, which is a raw scalar when `P` is instantiated with `int`, `bool`, `char` or `float`. Such a function is outside the enum return convention and the `Option[C]` convention above: its return sites take no count and its callers own none (the result is a borrow of whatever the payload's own holder keeps); (ruling GOPT-1). The `Option[P]` itself crosses the generic boundary in the BOXED form `{tag 0, payload}` whatever `P` is (ruling GBOX-1, loup#653): code compiled over a type parameter builds `Some(v)` as a box and reads every `Option[P]` it holds as one; the caller of such a function unboxes the result where the arguments bind `P` to a pointer kind (the concrete `Option[C]` is the niche form), and keeps the box for a primitive or unknown instantiation; an argument for a parameter declared `Option[P]` is boxed where the caller holds the niche form; `Some(0)`, `Some(false)`, `Some(0.0)` and `Some(c"\0")` therefore stay `Some` through a generic function or a generic class's method, and a generic `None.unwrap()` raises `UnwrapError`. (loup#616: the enum rule retained the raw scalar as a counted block — a read of address 5 for `wrapo(5)` — on every native lane. loup#653: the niche word made a zero-valued primitive `Some` a `None`.)

Compiler's rule (a `dict.get` miss at `unwrap`). `d.get(k)` on a dict whose declared VALUE type is a pointer kind — `string`, a `list`, a `dict`, a tuple, `bytes`, a class, a struct or an enum — returns the stored word or 0 for a missing key, and a stored value of those kinds is never 0; `unwrap()` / `expect(msg)` of that result (the call, or a local bound to it) therefore tests for 0 like any niche `Option` and raises the interpreter's `UnwrapError` (native-compilation Requirement 4.48). Both lowerings decide it with ONE predicate over the dict's declared value head (`dict_get_value_is_pointer`), so the recorded checks are identical; a primitive-valued dict's `get` is the boxed `Option` and a value type the lowering cannot name (`Any`, a type parameter, an unresolved receiver) stays unchecked (ruling DGET-1). The declared value type is that of a local, a parameter, a field or a module global alike (a global dict's stored `0` read as `None` until 1.28.0). The boxed `Option` holds in every context — receiver, argument, operand, element, field — save the one that reads no value: a comparison of `d.get(k)` with `None` is the key-presence test. (loup#627: the miss's 0 was read as the value — a SIGSEGV at the first field read.)

Compiler's rule (collections known by their register type). On every managed native lane a container access — an index read or write (`x[i]`, `x[i] = v`), the key kind of a dict access, `iter()` — is classified by what lowering recorded for the receiver OR by the receiver's register type (F1), whichever knows; an access neither classifies whose INDEX is a string is a dict access (only a dict is string-indexed), never a flat-block access with the key's address as the offset. The register type of a raw `d.get(k)` (above) maps the dict's declared value exactly as every other annotation maps — a `tuple`, `Option`, `Result` or function type included — and register typing completes a lowering seed that has a hole from the receiver's own dict type. A `for` over a list lowering could not classify (a static method's result) steps the list iterator through the desugar's `match it.next() { Some(x) => … None => … }`; the iterator answers the element word itself, so the `None` test is the iterator's own end state (Stage0: `has_next` taken just before the step; the self-hosted emitter: its done flag), never a test of the element (an element may be `0` or `false`), and the step's result is typed `Option(E)` for a pointer element `E` (b36f-cliwc: the self-hosted-built `loup` CLI faulted in its type checker on all three; Stage0's LLVM and Cranelift lanes stopped such a loop at a `0` element). The same holds for a built-in iterator used by hand (core §1-7 `Iterator[T].next(): Option[T]`): an iterator is typed by the collection it walks (`Iter(List(T))`; a dict walks its keys), a step is typed `Option[T]`, a step only matched in place (`OptionTag` / `OptionPayload` through copies and single-origin slots) keeps the element word and reads its end from the iterator, and a step whose `Option` goes anywhere else (an argument, a return, a store, `unwrap`, `!= None`) is built exactly as `Some(v)` / `None` are built — a scalar `T` boxed, a pointer the niche word — a borrow of the element unless boxed (b36f-cliwc r2: every native lane read the element as the Option).

Compiler's rule (fresh class temporaries). A call whose result is an owned `+1` by the conventions above — constructor sugar, a module function declared to return a class (loup#508), a method every one of whose return sites is a fresh construction (a STATIC method included: a static factory `Class.m(..)` hands back the same `+1`, row OWN-1) — and that is neither bound nor stored is a TEMPORARY, and the compiler releases its count at the end of the expression that consumed it: after a user function, method, static or constructor call it was passed to (the parameter is a borrow; a `takes` parameter owns it), bare or as the payload of a niche `Some(..)`; and after a member read of a scalar-typed field (`make(n).v`: a number, `bool` or `char` the object does not own). A member read of a reference-typed field — and, since the object owns its strings (*Compiler's rule (owners release what they keep)*), of a `string` field — keeps the temporary alive (the read value would dangle), and a call the compiler cannot classify as owning by convention alone — a getter whose result is a borrow, a call through a deeper receiver — is never released as a temporary: a wrong release frees a live value, a missed one is a bounded leak. (loup#582: `weight(make(1))`, `make(2).v` and `e.set(Some(make(7)))` each leaked one object per evaluation on every native lane; constructor arguments were the only call kind that released a fresh class temporary.)

Compiler's rule (release order at zero). When a strong count reaches zero the runtime runs the object finalizer — the nearest user `finalize()` once, then the release of every counted field (*Compiler's rule (owners release what they keep)*) the class declares OR INHERITS — before the block is freed, and it shields that finalizer from an exception already in flight and settles one the finalizer itself raises (§1-8.9), on every native runtime alike: the companion C runtime and the pure-Loup libOS (loup#581: the libOS freed the block without calling the finalizer, so the clang-free lane ran no `finalize()` and released no owned field; loup#579: the self-hosted emitter's finalizer released a class's own fields only, and its reassigned owning `var` never released the value it was left holding).

Compiler's rule (field reads through untyped references; inherited fields). A field name declared only on reference classes (on no value type) is read and written at the reference-class layout — past the object header — whatever the static type of the receiver register; the census counts the types that can have an instance: a REFERENCE owner is a class lowering constructs as a reference object, its ancestors and its descendants (so a base class constructed only through subclasses is one), a VALUE owner is a struct, an exception or a value class, and a type in neither has no instance and is not counted; a field name a reference class and a value type (a struct, an exception class, an enum's common field) both declare is read and written at the layout of what the receiver IS: a receiver the lowering proves a reference object (a tracked construction, a shared-class register type) or a value block (a struct, exception, value-class or enum register type) on every path takes that layout — a local that one path stores a class instance into and another something else (a union-typed local reassigned to the other kind) is proven neither — and any other — a type parameter's value (`g.get().n`, a `list[T]` element, a generic enum's payload), an `Any` cast, a union `S | C` — is classified at run time by the ARC-object registry (`__loup_runtime_obj_is`, which never dereferences the word), never by the name; a receiver whose DECLARED type is a union — a local, parameter or field declared `S | C`, an element or value of a container declared with union elements (`list[S | C]`, `dict[K, S | C]`, an `Option[S | C]` payload, a `for` variable or `match` binding over one), a local bound from such a value, also when a closure captures and reassigns it — is never proven by what one path stored into it (a literal's first element, the initializer) and never dispatched statically on that value's class; a method call dispatched by the receiver's type id — a union receiver, an interface or a bounded type parameter a struct implements, an untyped collection element — reads that id where the receiver keeps it, the ARC header's for a reference object and the trailing type-id slot for a struct, exception or value-class block, asking the same registry whenever a candidate type is such a value type and the receiver is not proven a reference object; and the declared type of a field a class inherits is the type its declaring ancestor gives it, on every lowering's type oracle, so the payload read through `d.f.unwrap()` or `match d.f { Ok(t) => t.x }` on an inherited `Option[C]` / `Result[C, E]` field is typed like the class's own field. (loup#577: the Stage0 Cranelift backend read the ARC header word for the payload's field — the register was neither tracked shared nor typed, and only the LLVM backend had the field-name proof — and both Stage0 backends and the self-hosted emitter handed `unwrap()` on an inherited `Result` field the box, the inherited field being untyped. b36wc slotwc: a name a struct also declares took the value-block offset on an unproven receiver — Stage0 LLVM and Cranelift and the self-hosted emitter read the class instance's header word for `g.get().n` or `(a.f as C).n`, and faulted on a union receiver; a union-typed local reassigned to the other kind was read at its first store's layout on every path; a method a struct and a class both declare, called on an `S | C` receiver or through an interface a struct implements, matched no dispatch case for the struct (an empty result) or ran the class's method on the struct block; round 4: an element of a `list[S | C]` literal of one kind grown with the other, a union `dict` value or `Option` payload, and a union local reassigned in a closure were typed by the literal's first element or the initializer — the other kind's field read the wrong word, its method ran the first kind's case (Stage0 statically, `C.describe` on the struct block) or crashed, and the hosted C backend's `for` loop over such a list stopped with `MethodError`.)

Compiler's rule (no name-based guess across value and reference types). A receiver whose static class the compiler knows — including a closure capture (§1-7.3), the result of `x as C`, and a binding with a declared type — is accessed with that class's layout and dispatch. A field or method name declared on BOTH a reference owner and a value owner is never resolved by name: an access through a receiver whose class the compiler cannot establish on every path (for example a member of the union `Pt | Box` read without narrowing) is classified at run time as the rule above says — the field at the layout of what the receiver IS, a method call dispatched on the type id read where the receiver keeps it (the ARC header of a reference object, the trailing type-id slot of a struct, exception or value-class block) — on both native drivers alike. (T3-field: both drivers read such a field at the headerless offset and called such a method through a header the struct does not have — the field printed the header's type-id word, the call answered 0. The macOS branch first refused such an access at build time with `E-BUILD-NATIVE`; merged with b36wc slotwc's run-time classification, which builds and runs the same programs correctly, that refusal is withdrawn — the refusal of an untyped access to a `@repr(C)` field name, §3-3.10, stays.) `LOUP_FIELD_GUESS_AUDIT=1` reports each build refusal on standard error instead of failing the build, and each untyped call whose candidates are unrelated class families (§3-3.2 *a receiver whose class is unknown dispatches on its runtime class*), a measurement aid.

Compiler's rule (value-object storage). Every construction (`NewObject`) and every copy (`StructCopy`) of a value object — a struct, a value class, an exception value — on the managed native lanes gets a block of its own for that execution; no per-construction-site static backs a managed value. The block lives in the FRAME (an entry-block allocation, reused by the same site across a loop) when a per-register proof shows no pointer to it can be seen after the site runs again or after the frame dies: each alias of the block (the producer register, its copies, the loads of the one slot the producer itself is bound to, and a read of a nested-struct field of it) is used only as the object of a field read or write, as the source of a copy, or as an argument of a user function whose corresponding parameter is proven non-retaining (a greatest fixpoint over the call graph); a block nested as a field value into another value object built in the same frame lives exactly as long as that one. Every other block is a fresh HEAP value block from `__loup_runtime_vobj_alloc` / `__loup_runtime_vobj_alloc_d`, registered in the value-object registry (so `x is S` finds it anywhere) and with exactly ONE owner, which frees it through `__loup_runtime_vobj_free` (a static, a frame block, a raw word or a second free is a no-op): the `list[S]` holding it, when every element entered the list as a fresh block read only by that store, the list handle is only pushed to, indexed, measured and iterated, and no element it surfaces outlives the frame (the list's scope-exit free takes its elements, and a re-store's free does too when no surfaced element is even bound to a slot); the CALLER of a function every one of whose returns hands back a fresh block nobody else holds (freed right after the caller's one use of it — its copy, a scalar field read, a non-retaining argument); and the enclosing value block, for a block nested in it, when the whole program stores only such exclusive fresh blocks into value types' nested-struct fields (each heap block then carries its type's descriptor `{count, slot…}` and its free releases its nested blocks); and the REFERENCE OBJECT holding it in a STRUCT-typed field, when over the whole program every store into a field of that name whose receiver may be such a class stores an exclusive fresh block (or the constructor's constant placeholder) and every read of one is consumed on the spot — copied, or read through for a scalar, a nested struct read the same way, or a string only runtime string operations read, with nothing between the read and its use that can run user code, release a value or rebind a slot: the class finalizer frees the block (`__loup_runtime_vobj_free`, which releases what the block counts) and a re-store frees the block it replaces (b36f-ownleak, row OWN-1: the holder's death leaked the block and its strings on every native lane at N; a read that escapes as the block itself — returned, pushed, passed, bound — keeps the field out, a bounded leak). A list keeps its elements' ownership when it is handed to a READ-ONLY list parameter — one whose every use reads the list and keeps no element (*Compiler's rule (borrowed collection parameters)*) — and a list literal handed only to such parameters is freed with its elements right after the call (ruling CBOR-1). The `dict[K, S]` holding a block owns it the same way: every value entered the dict as a fresh block read only by that store (a replaced value is left, never freed twice), the dict handle is only stored to, indexed, measured, tested, rendered or asked for its keys, and no value it surfaces outlives the frame — its scope-exit free `__loup_runtime_dict_free_vobj` takes the values, and a re-store's free does too when no surfaced value is even bound to a slot (ruling DVAL-1). A block that is a user enum's PAYLOAD, made right before the enum's construction, lives where the enum lives — in the frame when the enum does not escape: the enum's tag and payload reads are reads of it, a payload read out of it (a `match` binding) is its alias, an alias may be bound to a slot no read of which is reachable from the block's site before the slot is bound again, and an enum parameter whose every use only reads it is non-retaining (ruling EPAY-1; `Option` and `Result` payloads are not covered). A block held by an `Any` holder is owned by it (*Compiler's rule (`Any` fields)*, ruling AF-2): an `Any` field's own block (a fresh block adopted, any other copied), a local `Any` binding that owns its word, and a fresh block passed to a parameter that only reads or holds it (freed by the caller after the call). A block whose owner cannot be proven — a struct widened into an `Any` that escapes, a struct element of a list passed to a function that keeps or returns an element, a dict value that is returned or passed on, the payload of an enum that escapes, a raised exception nobody binds — is not freed (a bounded leak, never a double free); `LOUP_ARC_LIVE=1` reports the live heap value blocks as `vobj=`. (loup#596: structs constructed in a loop and pushed into a `list[Pt]` all aliased ONE per-site static natively — `list 48 9 4` where the interpreter prints `list 20 4 4` — a recursive function's local struct was overwritten by the recursion, and the self-hosted emitter allocated every construction from a never-freed arena while its copies still aliased per-site statics.)

Compiler's rule (`Any` fields). A field declared `Any` OWNS the value it holds (rulings AF-1, AF-2): one strong count on a reference object, one count on a tagged box (a scalar box or a descriptor box — boxes are immutable and shared by count), and a value block (a struct, a value class) of its own. Every store takes that ownership: a class-typed value is retained or moved in by the frontend's store rules as for a class field, any other reference object through `__loup_runtime_any_retain` (a store, a re-store, and the generated constructor's initialisation alike — loup#628: `Auto(x)` with `x: Any` holding an object stored it uncounted), a box made for the store or a fresh value block is adopted, and any other `Any` word goes through `__loup_runtime_any_hold` (a box: one more count; a registered heap value block: a deep copy by the block's size and descriptor; anything else unchanged); the old value on a re-store and the value the owner holds at its death are dropped through `__loup_runtime_any_release` (an object: `loup_arc_release`; a box: its count, freed at zero; a heap value block: `__loup_runtime_vobj_free`) — classified by the ARC-object registry, the box key and the value-object registry, never by reading a word. An `Any` field's word bound to a name, assigned to one or returned from a `: Any` function is held the same way, as the field may drop it first. A caller owns a fresh box or fresh value block it passes to a parameter whose every use only reads the word or holds it (`__loup_runtime_any_hold`; the hold-only proof extending *Compiler's rule (value-object storage)*) and drops it right after the call; a local `Any` binding whose every store is a word it owns and whose every read only reads or holds it owns that word, dropped at the next store and at every exit of the frame. A handler's binding (`catch (E as e)`) is such a local for the exception it catches: the caught word is read otherwise only by the dispatch's type tests and by a re-throw no binding reaches, so the binding owns it unless the handler lets it escape (`throw e`, a store, a return) — a raised value-object exception is freed at the binding's next store or at the frame's exit. A STRING and a COLLECTION are owned too (ruling AF-4 as amended by row VALFN-1, loup#795): a heap string takes one count (`__loup_runtime_any_hold`) and is released by its drop, a heap `list` / `set` / `bytes` / `dict` is held as an EXCLUSIVE copy (a collection is a value: COLL-1 / COLL-2) dropped with its elements, and a descriptor box owns the collection it carries the same way — a copy, or a fresh literal of scalars that nothing else reads, which the box adopts (`__loup_runtime_any_box_desc_take`) — and drops it at its own zero; *Compiler's rule (strings and collections held by run-time classification)*. An `Any` field's string bound to a name through a cast (`let t = h.a as string`, `t = h.a as string`) takes its own count, and a FRESH string (a concatenation, a conversion, a render) passed to a hold-only parameter is released by the caller after the call, as a fresh box is. A local `Any` binding also adopts a FRESH reference object stored into it — a construction read only by its constructor, or a module function's class result, whether the store widens it or (a re-store of a `var`) stores it as it stands — and drops it through `__loup_runtime_any_release` (ruling AF-3, loup#678); a borrowed object stays unowned. It adopts a FRESH string the same way — a concatenation, a conversion, a render, or a literal (immortal: its drop is a no-op) — and drops it by its classification (ruling AF-4). A read of the binding through a cast (`v as C`, the payload of the word) only reads it, and so does a runtime operation that reads its arguments and keeps none (a concatenation, a comparison, a search). Only a binding some store widens into is such a local: a `string` or class-typed binding keeps its own counts. (b36f-ownleak, row OWN-1: `let v: Any = C(7)` leaked its object — `var v: Any = C(8); v = C(7)` two — and `let x: Any = "s" + n` its string, on every native lane at N.) (loup#613: the release-old of an `Any` field ran `loup_arc_release` on whatever word the field held once the new value was class-typed — `PBox(5)` then `b.a = p` released the raw payload 5 and faulted — and it released a borrowed instance the constructor had stored without a count. loup#645: every box and struct an `Any` holder took leaked, 128 value blocks in `host_native_anyown_e2e`.)

Compiler's rule (type-parameter and interface fields). Code compiled once over a type parameter `T` cannot see what a `T` word is, and an interface-typed word may be a class instance or a struct implementer's value block, so on the managed native lanes a holder of such a word owns what it holds by the word's RUN-TIME classification, exactly as an `Any` field does (ruling TPOWN-1, loup#701; interface fields, loup#702): a field declared as one of its type's own type parameters (`v: T`), as an interface or as a union (`f: S | C`: whichever member the last store put there — b36f-ownleak; a union field was read and stored uncounted, so its source's release left it dangling), and every element of a `list[T]` / `dict[K, T]`. Every store into such a holder HOLDS the word through `__loup_runtime_tparam_hold` — a tagged box takes a count and a registered heap value block is copied (`__loup_runtime_any_hold`), a heap string takes a count and a heap collection is COPIED (row VALFN-1, *Compiler's rule (strings and collections held by run-time classification)*), then a reference object takes a count (`__loup_runtime_any_retain`); a raw scalar and an unregistered word (a literal, a stack descriptor) are held as they stand — unless the value is statically a class, which the frontend's store rules already count: a field store, the generated constructor's initialisation, a list `push` / `insert` / element set, a dict set and a list literal's elements. The word a field held is dropped through `__loup_runtime_any_release` on a re-store and in the owner's finalizer, and a `list[T]` field's elements are dropped through it when the finalizer frees that list (under the Task #204 fresh-store and escape census, which a `list[C]` field no longer needs since row OWN-1 — *Compiler's rule (owners release what they keep)*). A collection COPY (core §1-10.3 *Compiler's rule (collection values)*) made where the element type is a type parameter or `Any` holds each element the same way (its copy descriptor's `P`), as a copy counts a class element (`K`), so a `list[T]` field's finalizer never frees an element a copy still holds. The emitters find these positions from the lowering's F1 marks — a value register typed `TypeParam` entering a collection — and from the per-type render descriptors (a field whose descriptor is `P<i>` / `LP<i>`) or the declared interface type, so the MIR is unchanged; a program that holds such a word asks the ARC-object registry (IS-5). A `list[T]` element overwritten in place (`xs[i] = v`) keeps the count it had (a bounded leak per overwrite of an object; a held value block's copy per overwrite — a `list[C]` element's is released since row OWN-1: its reads hold counts of their own, a `T` element's do not), a value popped or removed carries its count out, a `dict[K, T]`'s values are not released when the dict is freed, and a field of a generic STRUCT is not covered (rulings TPOWN-2, IFACE-1). A caller's fresh string, `list` or `dict` argument for a type-parameter parameter is released after the call (the holder owns its own count or copy; row OWN-1), except where the callee may hand such a word back uncounted — it returns a type-parameter or `Any` word, or builds a closure — and there the argument's is a bounded leak. (loup#701: `Box(Ty(4))` and `Holder[Job]` freed the held instance under the container — the class-store retain fires only for a class-typed value and the caller released its fresh argument after the call; `PriorityQueue[Job]` printed `sync  `. loup#702: `Wrap(Src())` with `_inner: MyReadable` read freed memory.)

Compiler's rule (reified type arguments on the managed lanes). Generic code is compiled ONCE on every managed lane — the interpreters, the Wasm hosts, Stage0 LLVM / Cranelift / C, `loup-llvm` on both routes and `loup-llbe` with the libOS — and receives the run-time type of each type parameter as a TYPE DESCRIPTOR: a string value spelling the type in the descriptor grammar of *Compiler's rule (native rendering of user types)*, extended for identity (core §1-12 *Compiler's rule (reified type arguments)*; rulings Q1–Q10 of the reification design, 2026-10-31): `i` int, `f` float, `g` float32, `b` bool, `c` char, `s` string, `y` bytes, `u` uint64, `N1` / `N2` / `N3` int8 / int16 / int32, `N5` / `N6` / `N7` uint8 / uint16 / uint32, `M` decimal, `L<d>` list, `Z<d>` set, `D<k><v>` dict (any key descriptor), `T<n><d…>` tuple, `O<d>` Option — `Q<d>` for an `Option` over an in-scope type parameter, the boxed form of ruling GBOX-1; `Q` and `O` name the same type —, `R<a><b>` Result, `F` a function type, `A` `Any` and every OPEN argument, `V<n><d…>` a union (members sorted by their descriptors' bytes), `U<Name>;` a class, struct, enum or interface by its program-unique name, `U<Name>[<d1>…<dn>];` an instantiated one, and `X` a type no descriptor describes. Two descriptors name the same type when their bytes are equal with `Q` read as `O`. A native lane INTERNS every descriptor it composes (one process-global table of immortal strings), so a descriptor is never counted, copied or freed. In-scope type parameters are numbered — the enclosing generic type's first, then the function's or method's own — and the descriptor of a type that mentions them is a TEMPLATE with `P<k>` for the k-th, substituted at run time (`__loup_runtime_tdesc_subst1` … `__loup_runtime_tdesc_subst4(template, d0, …)` with the template's parameters renumbered from 0 in ascending `k`, `__loup_runtime_tdesc_substn(template, descs)` for more than four). Where descriptors live: (1) a generic FUNCTION, a generic METHOD, a static method of a generic class or struct and every method of a generic ENUM take one HIDDEN parameter `__td$<P>` per type parameter — the declaring type's for a static or enum method, then the method's own — after the declared parameters and the `buffer[T, _]` extent words (§3-3.17b), and every call passes them after its arguments; an override or interface implementation of a generic method has the same hidden parameters, so virtual and interface dispatch pass them; (2) an instance of a generic CLASS or STRUCT carries one HIDDEN field `__td$<D>$<P>` per type parameter of every generic class or struct `D` in its chain, after `D`'s declared fields in the flattened layout, set when the instance is allocated, before any constructor runs (a non-generic `class IntBox : Box[int]` stores `"i"` in `__td$Box$T`) and read by every method through `this`; a hidden field is a scalar to ARC and takes no part in rendering, equality, hashing, serialization or reflection over the declared fields; (3) a closure or block function captures `__td$<P>` like any binding. A `@repr(C)`, `@repr(transparent)` or `@interchange` struct and a `shared class` carry no hidden field — their layout is external, or the cross-mode arena ABI of runtime §2-2.7, whose words must not be process-local pointers — so an operation in their methods that needs a type parameter's descriptor (`is`, `as`, `as?`, `==`, `<`, rendering, widening to `Any`) is refused at build time with `E_GENERIC_NOT_REIFIED` (rulings Q8, Q9). A `@cexport` (C ABI, §3-2.7.1) or `@jsexport` of a generic function in a managed mode is `E_EXPORT_GENERIC`: its exported symbol would carry the hidden parameters, so it has no fixed signature (ruling Q5). Freestanding code is monomorphized (§3-3.4.3) and its lowering adds nothing. The consumers are runtime calls that every managed lane implements (the interpreters and the Wasm hosts answer from the value where it describes itself): `__loup_runtime_tparam_is(v, dT, x, tag)` for `v is X` on an operand of type parameter type (`tag` a variant's tag or -1), `__loup_runtime_tdesc_test(a, d)` for `a is T` and `a is G[args]` over an `Any` word, `__loup_runtime_tparam_unwrap` / `__loup_runtime_tdesc_unwrap` for the value an `as` yields and `__loup_runtime_tparam_as_opt` / `__loup_runtime_tdesc_as_opt` for `as?`, `__loup_runtime_tdesc_eq_kind` with `__loup_runtime_value_eq_desc` for `==` on a type parameter (by value, or by the type's own `op_==` / identity), `__loup_runtime_tdesc_ord_kind` with `__loup_runtime_compare_desc` for `<` / `compareTo` through `Comparable`, and on the native lanes `__loup_runtime_tparam_to_any(v, dT)` (a type-parameter value widened to `Any`: exactly the scalar box or descriptor box of *Compiler's rule (union positions, enum identity and the descriptor box through `Any`)*) and `__loup_runtime_tparam_to_string(v, dT)` (one at a render sink); a failed `as` raises `TypeError` ("value is not an instance of '<X>'") through `__loup_gf_type_error`. A value of a type parameter bound to `Any` (descriptor `A`) is an `Any` WORD — on the native lanes the tagged box where one exists — so an argument entering a parameter declared as a bare type parameter that its call binds to `Any` (inferred from an `Any` argument, written `[Any]` — on a function, `f[Any](5)`, or on a constructor, `Box[Any](5)` —, or bound by the receiver's instantiation, `Box[Any].put(x)`) is passed with its box, and a scalar argument there is boxed exactly as at an `Any` parameter. Conversely a READ of such a value at a site that instantiates the type parameter to `Any` — a field declared as a bare type parameter (`b.v` with `b: Box[Any]`, or with `b: AnyBox` for `class AnyBox : Box[Any]`), a call whose callee declares a bare type parameter as its result (`b.get()`, `id(a)` with `a: Any`) — reads an `Any` word, exactly as a field or a function declared `Any`: `is`, `as`, rendering and a holder's own count see the box, never an untyped word. `str(a)` of an `Any` word renders it by its tag, as `print(a)` does. The hosted C backend (`--backend c`) builds a class instance as a plain block with no run-time type, so it refuses at build time a run-time type test through a type parameter or `Any` (`__loup_runtime_tparam_is` / `_tparam_as_opt` / `_tdesc_test` / `_tdesc_as_opt`) whose target is computed at run time or names a class or an interface, as it refuses a `TypeCheck`; it answers scalar, string, collection, struct and enum targets, and `==` through a type parameter. The native emitters publish a TYPE TABLE beside the render table (`__loup_runtime_type_table_into(out)`: per user class, struct and enum its type id, its supertypes as descriptor templates over its own parameters, its hidden-field slots and whether it declares `op_==`), and a generic type's render entry binds its `P<k>` fields from the instance's hidden slots. (b36f-reify: the native lanes answered every scalar `is` on a type parameter false, read a variant tag from a raw scalar, compared strings through `T` by identity and printed raw words; no lane answered `a is T` or `a is Box[int]`, and `Box[T]` methods could not tell a class's `T` from a generic method's own `U`.)

Compiler's rule (borrowed collection parameters). A `list` or `dict` PARAMETER is BORROWED when every use of it and of its aliases (its copies, the local slots it is bound to and their loads) reads it and keeps nothing once the call returns: an element or key read, a length, a membership or position test, a rendering or a join into a fresh string, `keys()` / `values()`, an iteration whose iterator is only stepped, or a pass to another borrowed parameter (a greatest fixpoint over the call graph; for a virtual call every candidate method must borrow the position). A return, a phi, a store anywhere else, a mutation, a capture or any other call disqualifies it, as does an `async`, generator or concurrent body, a `takes` position (§1-10.3.2) and a parameter of a function that releases its container parameters itself. A pass to a borrowed parameter is not an escape of the caller's container, so the caller's scope-exit, overwrite and temporary frees reclaim it; and the caller takes NO count for the call when the argument is a load of a slot the frame owns for the whole call — a slot one of its reclaim analyses frees, a frame-backed list, or one of its own borrowed parameters — while any other argument keeps the caller's retain (a slot aliasing a field may lose its owner's count during the call). A borrowed `list` parameter every element of which stays in the frame (*Compiler's rule (value-object storage)*) is READ-ONLY: a `list[S]` that owns its element blocks may be passed there and still free them (ruling CBOR-1; loup#678: a `list[S]` handed to a function that only read it was never freed, nor its elements).

Compiler's rule (strings and collections held by run-time classification). On the managed native lanes (the managed C runtime and the libOS core) every holder that classifies its word at run time — a type-parameter or interface field, a `list[T]` / `dict[K, T]` element, an `Any` field or owned `Any` local, a descriptor box, a `P` letter of a collection copy (*Compiler's rule (type-parameter and interface fields)*, *Compiler's rule (`Any` fields)*) — owns a STRING and a COLLECTION it holds, recognised by PROVENANCE, never by reading the word (row VALFN-1, implementing rulings TPOWN-1 and AF-4; RULED by the maintainer 2026-10-26: approved as implemented). The runtime keeps a third root of the object registry's radix, the COUNTED-VALUE registry: every heap string descriptor (`__loup_runtime_str_desc_new`, the one allocator of every runtime string producer) and every heap list or dict spine (a set and a `bytes` are lists) is marked at its allocation and unmarked at its last free (the value block's free, the spine's free) and when a region frees its chunks; a list or dict carries a stamp in its header's second word (`LOUPLIST` / `LOUPDICT`), read only after the registry has answered (`__loup_runtime_cv_kind`; anything else marked is a string). A static literal, an interned character, a stack descriptor and a stack-header list are never marked and are held as they stand. On Stage0's managed lanes — the C runtime, and the libOS a Stage0 program links as a library — a COUNTED ENUM block (`__loup_runtime_val_alloc` with the counted-enum cap magic, the header's second word) is marked too and classified by that magic (b36f-ownleak): a HOLD gives it one more count — an enum value is immutable, so a count is exact sharing —, a descriptor box carrying one holds a count of its own, and a DROP releases one; at the last count the block is freed SHALLOW (the classifying holder does not know the block's type: the payloads its variant counts are left, a bounded leak), so a typed owner's release never frees a block under a `T` / `Any` holder. A module that hands a counted enum to such a holder (a descriptor box, `__loup_runtime_any_hold`, `__loup_runtime_tparam_hold`) asks the registry. An interned payload-less variant is an IMMORTAL static (`{-1, magic, tag, 0}`) and is not marked; since b37-f63 the self-hosted emitter's enum blocks (`loup-llvm` on both routes, `loup-llbe` with the libOS) are the same counted blocks and are marked alike (roadmap F63). A HOLD (`__loup_runtime_any_hold`, `__loup_runtime_tparam_hold`) gives a marked string one more count (strings are immutable: a count is exact sharing) and replaces a marked list or dict by an EXCLUSIVE deep copy — core §1-10.3: a collection is a value, so a holder never shares one — whose every element word is itself held by classification (a string counted, a collection copied, an object or a box counted, a value block copied; the bytes of a 1- or 4-byte list copied as they stand; the integer keys of an INT-keyed dict, by the dict's kind, never classified, and the copy keeps that kind); a DROP (`__loup_runtime_any_release`, `__loup_runtime_any_drop_value`) releases a marked string's count (`__loup_runtime_str_release`) and drops a marked collection by its count — at the last reference each element is released the same way, then the spine. A holder's word is therefore its OWN: a caller that receives one (a function value's result, row VALFN-1's interface to the function-value return convention) may free it as exclusively its own, a string through `__loup_runtime_str_release` or `__loup_runtime_str_free` (which frees the bytes only at the last count) and a collection through its typed free. The registry costs nothing in a program that never holds by classification: a module whose code can hold or drop a string or a collection so (a type-parameter hold, the construction of a class with an `Any`, type-parameter or interface field, a slot adopting a fresh object — as for the object registry, an `any_hold` / `any_drop_value` / descriptor-box call does not ask by itself: the words it reaches come from such a field, and with the registry off a hold and its drop count nothing, a consistent pair) defines `__loup_runtime_cvreg_wanted()` answering 1 (Stage0 LLVM and Cranelift, the self-hosted emitter; the libOS lane always defines it, 0 or 1; the hosted C lane when its module calls a classified hold or copy — `__loup_runtime_value_copy_classified`, `__loup_runtime_tparam_hold`, `__loup_runtime_any_hold`, a descriptor box, or a `__loup_runtime_value_copy` whose descriptor holds a `P`), the C runtime's weak default answers 0, and the allocators mark nothing; a program that asks it asks the ARC-object registry too (a classified copy counts the objects it holds). A raw integer equal to a live marked address is classified as what lives there (the IS-4 residual): a hold counts it, a collection hold copies it. On the interpreters and the Wasm hosts the same holds copy a collection at run time (COLL-2). (Before VALFN-1 a string or collection held through `T` was held uncounted: a `T` holder could neither own it nor hand it back owned.)

Compiler's rule (raised-exception messages). A built-in exception raised by a guarded fault (an index or key out of range, an unwrap of the wrong variant, an `Err` at a render sink — §1-18.4) whose message the fault COMPOSED (a rendered index, key, length or payload) OWNS that message: the exception's value block carries the header descriptor sentinel `LOUP_VOBJ_EXC_OWNED` (1; never a descriptor's address — no nested blocks, and a copy does not inherit it). A handler binding that owns the exception it caught (*Compiler's rule (`Any` fields)*, AF-2 item 4) and keeps nothing of it past the frame — every read of the binding a type test or a field read, every read of its `message` a call that copies, compares or measures it (a print sink the module does not itself define, a string method that returns a scalar or a fresh string) — drops it through `__loup_runtime_any_drop_exc(word, message index)`, which releases an owned message (`__loup_runtime_str_release`), stops publishing it as the in-flight message (`__loup_exc_message`), and drops the word as `__loup_runtime_any_drop_value` does. Every other exception keeps its message unowned — a source `throw` (its message may be borrowed or a literal), a handler that returns or stores the message (ruling EXC-1; loup#678 `x2`: a caught `IndexError` leaked its message on every native lane).

Compiler's rule (getter results). A method that returns one of its object's reference fields without a retain hands the caller a `+0` BORROW: the object keeps its count. A holder that keeps the value takes its own count — a store into a field, element, dict value, captured variable's cell, global or payload retains it (the store rules above), a `let` / `var` binding initialized by a call to a method declared to return a class that is not owning by convention retains it and releases it at scope exit, exactly as a binding of a field read does, and so does an assignment of such a call to an owning variable (one whose scope exit releases what it holds). The receiver may be any binding (`this` inside a lambda included), a field chain over one, or a call the lowering types by its DECLARED return (`this.me().peek()`); the method's type slot never makes such a result an owning one. The count is taken AT THE CALL, before the call releases its fresh temporary arguments, because the result may be one of them (`r = this.pick(4, Reg(30))` hands back the argument the caller frees right after the call); a call that releases such a temporary takes it whatever the consumer, and the caller then OWNS the result: a holder keeps that count, and a temporary use releases it like a fresh class temporary (above). A store into a field or a list element MOVES a fresh value (the backends elide the store's retain), so the count taken at the call is the one the holder keeps. A captured variable's cell takes its own count of what it stores (closure-environment ARC, row CLOSENV-1), so it never asks for the count at the call. (b36r-mis M3: `r = this.pass(r)` freed what it stored; a getter stored into a field, a global or a dict literal took no count; and the caller released a fresh argument before the store's retain of a result that was that argument — heap-use-after-free on every native lane.) The object's finalizer therefore releases such a field like any other, with no escape census: every holder that keeps the borrowed result has taken its own count (row OWN-1, *Compiler's rule (owners release what they keep)*; before it the census followed the borrow into every caller and kept the field out of the free set wherever it could not see a count — a bounded leak). (loup#600: a field exposed through a getter was kept out of its owner's finalizer, leaking one object per owner; and `let t = e.getter(); e.cur = Ty(2)` freed the value `t` still read.)

Compiler's rule (fresh field stores and reassigned owning bindings). A fresh producer result — a construction, an owning call, `Some(..)` of one — stored into a class field is moved: the field takes the value's own count and the compiler inserts no retain; a borrowed value stored into a field is retained. An owning `var` binding reassigned to another owned value releases the value it held before the store and, at scope exit, the value it holds then. Every native backend implements both rules identically (loup#578: Cranelift kept the retain — one leaked object per `env.f = make(n)` — and released only the binding's first value).

Compiler's rule (owners release what they keep). On the managed native lanes — Stage0 LLVM and Cranelift, `loup-llvm` on both routes, `loup-llbe` with the libOS; freestanding has no ARC and is unchanged — every holder of a counted value keeps ONE count of it, takes that count when the value is stored and releases it when it lets the value go (row OWN-1, ruled 2026-10-26). A counted value is a string (and the niche `Option` of one), a class instance (and the niche `Option` of one), a function value, a `list` / `dict` / `set` with everything it holds, and a word only run-time classification describes (a type parameter's, an `Any`'s). The OWNERS are a class field; a struct field (a struct value and every copy of it); a module global; a collection element and a dict's string KEY; a tuple element; an enum payload, a slot declared as the enum's own type parameter and the generic `Option` box (ruling GBOX-1) included; a closure capture; an owning binding; and an `Any` or type-parameter holder (*Compiler's rule (type-parameter and interface fields)*). (1) STORE: a fresh value — a construction, a concatenation or rendering, an owned runtime producer, a user call's result (item 4), a popped or removed element — MOVES into its owner; a borrowed value takes the owner's own count: a string a count (`__loup_runtime_str_share`; an immortal literal is left as it is), a reference object a retain, a `list` / `dict` an exclusive copy (core §1-10.3 *Compiler's rule (collection values)*, ruling COLL-1), a type-parameter or `Any` word its hold by classification (ruling TPOWN-1). The generated constructor's initialisation of a field is such a store, and the count it takes is decided by the field's DECLARED type — the same rule for every construction, whatever binding the argument comes from and whether it is passed by position or by name: a borrowed value into a class or `Option[C]` field (the niche form holds the class pointer; a reference owner, as the finalizer and a store's release-old treat it) takes a retain; a borrowed word into a field the holder classifies at run time (`Any`, the type's own parameter) is held by classification; a fresh value — a construction, a concatenation, an owned call result, the lowering's own count of a string read — moves in, exactly as an explicit constructor's `this.f = f` holds its borrowed parameter while the caller frees a fresh argument after the call. Never the value's inferred register type alone (b36f: `var w: Option[C] = None; w = Some(C(..)); return Holder(w)` loads `w` untyped, its slot holding both the `None` constant and the bare class word; the field took no count and the owning `w`'s release at scope exit freed the object it held; a fresh string bound for a `T` or `Any` field was held a second time and leaked). A niche `Option[string]` argument is lent to a user call like a string, so the caller frees a fresh one after the call and an owning binding passed to it keeps its own. A collection a built-in BUILDS out of another's elements — a list's `clone` / `slice` / `filter` / `+` and its section `xs[a:b]`, a set's `clone` / `union` / `intersection` / `difference` / `symmetric_difference` / `filter`, a dict's `clone` / `keys` / `values` — holds each element as a copy holds it, in place (`__loup_runtime_value_hold_elems`; COLL-2's native half). (2) RELEASE: an owner releases what it holds when it is overwritten — a field store (after the store; a collection's write-back of its own handle keeps it), an element set (`xs[i] = v`, `xs.set(i, v)`, `d[k] = v`, `d.set(k, v)`), a global store, a re-store of an owning binding — and when it dies: the class finalizer releases EVERY counted field by its declared drop descriptor with no escape census (every store gave the field a count of its own, and every holder that keeps a value read out of it takes its own), save the element walks of a `list[E]` / `dict[_, E]` field of enum blocks, which keep the Task #204 census (a collection copy still shares enum blocks uncounted) — a `list[T]` field releases the elements every store held, and a binding of a `+0` type-parameter getter result instantiated at a class takes its own count; a local collection is dropped DEEP by its descriptor at scope exit, at a re-store and at a temporary's death (`__loup_runtime_value_release_rc`: one reference, and with the last one everything it holds); an enum block by its typed release (a string, a class instance or its niche `Option`, a list with its strings, instances or enum blocks, a type-parameter slot by classification); a classified word through `__loup_runtime_any_release`. A popped or removed list element carries the list's count out to the caller. A dict owns its string keys: a store under a key the dict already holds releases the key it was handed, and a removal releases the stored key. The hosted C backend (`--backend c`) links the same runtime but counts nothing (it is not a managed lane): its string literals and the strings it builds carry the runtime's `{refcount, cap}` header marked immortal, and each of its string-key stores hands the dict a count of its own (`__loup_runtime_str_share`), so a count the runtime takes or drops never reads below a bare descriptor or frees a string that lane still holds (b36r merge: the runtime's key counts corrupted that lane's literals and freed its keys). (3) BORROWS: a value read out of an owner and still in use while code that may overwrite that owner runs holds a count of its own. A `let` / `var` binding of a field, element, global or payload read — or of `Some(..)`, an `if` / `match` / `??` of one, a raw `d.get(k)`, `first()` / `last()`, an `unwrap()` of a read — is an OWNING binding, released at a re-store and at scope exit; so is a binding of a borrowed read of an enum block, a `Result` or a dict entry, and an owning local assigned a generic payload's pattern binding. A `match` over such a borrowed read — of an enum block, a `Result`, an `Option[C]`, an interface value or an `Option[string]` — holds the scrutinee across arms that may overwrite its owner and gives it back at the join and on every exit. An argument that reads a field, an element or a global takes a CALL-SCOPED count of a string or a reference, and the callee reads a COPY of a `list` / `dict` read so; a receiver read takes a call-scoped count of a string or a reference (a `list` / `dict` receiver is acted on in place). A for-in over such a read iterates a COPY of a `list`, dropped at the loop's exit, and holds a loop-scoped count of a string (a dict's for-in iterates its `keys()`, a built list that holds its own counts). A count or copy is ELIDED only where the module's MAY-WRITE summary proves that nothing the call or the loop runs can write the source: per function, method and constructor, the fields (by name, on any object, the collection a field holds included) and the module globals its execution may write, transitively over direct calls by name, method calls by method name over every class (virtual dispatch included), constructors (less the new object's own initialisation), `super` calls, operator methods and a user type's `op_index`, lambda bodies (walked where they appear) and every user `finalize()` (a release may run one); a call through a function value, a spawned task, an `await`, a `yield`, a callback built-in handed anything but a lambda, and every construct the walk does not model may write everything; a prelude or runtime built-in writes nothing but runs the functions handed to it, and a print or render sink runs the renders. The summary over-approximates by construction, and without it every such borrow takes its count: the elision changes the cost, never the meaning. (A captured variable's cell keeps its HOLD-1 call-scoped count, which the summary does not consult.) (4) CONVENTIONS: a user function or method every return of which is concretely a string hands its caller the string at +1 — a returned parameter, field, element, payload or `Any` word takes a count at the `return` (generic code hands back a type-parameter word by TPOWN-1's holder rule). A user function whose returns are classified words (`Any`, a type parameter) hands its caller the result at +1 when ANY of its returns is owned — a value it built, a holder's count, an owned call's result: each borrowed return (a parameter, a field, element or payload read, a `+0` call) is held at the `return` by its run-time classification (`__loup_runtime_tparam_hold`), so the caller owns the result on every path; one whose every return is borrowed stays a `+0` getter — unless a borrowed return is ROOTED in an owner its frame drops (the result of a `+0` call one of whose arguments or receiver is a local binding or a value the frame built, a field or element read through such an owner, the load of a word local that may borrow one: `let c = C(..); return pick(c, ..);`): the frame's releases run before the `return`, so that word is held by its run-time classification where it is made (`__loup_runtime_tparam_hold`, which counts a reference object too; AF-2's own hold of it on the way to the `return` is then a move), the function hands back +1 and its other borrowed returns are held as a mixed function's are (b36f-ownleak, from F5 (d) and loup#508's rule for a class result rooted in the frame; the word dangled in the caller); a fresh construction returned beside a word is an owned return. A union result whose return legs disagree (`: S | C` returning a `C` here and an `S` there) is such a classified word on every lowering. So is every result DECLARED as a word — `Any`, a union, a type parameter — whatever its return legs are, and a local or parameter declared as one holds a classified word whatever it stores: the representation typing (F1) never types either by one return leg or one store, on either lowering (b36wc slotwc round 5: `func f(b): Any { var u: Any = s; if (b) { u = c; } return u; }` typed `u` and the result by the first typed store, so the function and its callers took a struct's or a class's convention for a word — a use-after-free, a crash or a heap overflow on every native lane). A caller that keeps such a result takes ONE count of it (row VALFN-1, b36r-valfn3): a holder's classified hold of a `+1` word is that word, moved; and where the caller keeps its own copy or count of what the word carries — a binding, assignment, return or store of the result or of its cast (`s.get() as list[int]` copies the list, `s.get() as string` counts the string) — it drops the `+1` word by its classification after the copy (`__loup_runtime_any_drop_value`), since the word may be a counted `Any` box whose payload its other holders share. Methods take this convention by name, all implementations together, so a virtual call sees one. It belongs to a function DECLARED to return `Any` or a type parameter (or not declared at all): one declared with a concrete return type hands back a value of that type, never a word to hold, whatever its body leaves untyped. A method (instance or static) one of whose returns is rooted in an owner its frame drops — an element of a local collection, a field or getter result of a local object, a local binding — hands its result back at +1 on every path (each other return takes a count), as does every same-named method of its class hierarchy, so a virtual call sees one convention; its callers release the result at every receiver depth. A generic function declared to return `Option[P]` hands back its box at +1 holding a count of the payload (ruling GBOX-1's caller protocol): the caller takes the payload out of the box, which it frees, and a `let` that keeps the payload owns it — released at a re-store and at scope exit by the payload's kind. A user call BORROWS its string, `list` and `dict` arguments: the callee counts a string it keeps and copies a collection it keeps (COLL-1), and the caller frees a fresh argument (a fresh struct value's block included) after the call — except at a `takes` position, and at a type-parameter or `Any` position of a callee that may hand such a word back uncounted (one that returns a type-parameter or `Any` word, or builds a closure). A method's class result stays a `+0` borrow unless every one of its returns is fresh (ruling ARC-3, *Compiler's rule (getter results)*), and a holder of it takes its own count — a bounded leak where a method that returns fresh on only some paths is stored. (5) STRUCT COPIES: a struct COPY is a new owner. Each counted field it shares with its source takes a count of its own — a string's `__loup_runtime_str_share`, a function value's retain, a classified word's `__loup_runtime_tparam_hold` — unless the source is a construction in the same block, whose fields move; a collection field gets its own copy from the lowering's per-field fix-up (loup#674), made by the field's OWNER descriptor — so the copy counts every element its own death drop releases (a string, a class instance, a function value, a classified word, a dict's string key) — which replaces the shared handle and releases nothing (the word it replaces is the source's); a struct block copied inside a collection copy (`__loup_runtime_value_copy`) takes the same counts. (6) VALUE DEATH: a struct value block releases every counted field when it dies — a frame block at every exit, a heap block through its descriptor's counted form (`__loup_runtime_vobj_free` releases, `__loup_runtime_vobj_copy` counts), a pass-through function's result being the caller's own argument copy — and a frame tuple releases the counted elements its construction stored (a destructure `let (a, b) = t` only reads `t`, which stays their owner); a block a loop re-produces releases what its previous production left. Not yet covered (bounded leaks, never a wrong release): an escaping heap tuple, an `Option` box (a dict's `remove` result among them) and an enum payload of a kind the teardown does not walk (a dict, a tuple, a nested collection) keep their contents unreleased; a niche `Option[string]` / `Option` of a collection that a NON-generic user function returns is not released by the `let` that keeps it; a list's `clear()` releases nothing; a `list[T]` / `Any` element is not released at an element set (*Compiler's rule (type-parameter and interface fields)*); a fresh result of a call to a function declared `: Any` is released only by a typed binding of it (`as string` / `list` / `dict`); and the self-hosted emitter's lanes (`loup-llvm` on both routes, `loup-llbe`) allocate Stage0's counted enum blocks (b37-f63: `__loup_runtime_val_alloc` with the counted-enum magic, the four-word immortal unit statics, the typed release family) and count and release them by Stage0's emitter rules — the typed `Retain` / `Release` and unwind releases, the construction counts of a borrowed counted-enum payload and of a counted enum a generated construction stores, the fresh push move, a field store's release of the value it replaces (an enum, an `Option[E]`, a `list[E]` field), the finalizer's `list[E]` field, the frame enums' payload drops and the enum-element list teardown; a `Retain` / `Release` of a register its typing cannot prove an enum where Stage0's says one (an untyped register, or a name an enum and a class both carry) counts by the counted-value registry's classification (`__loup_runtime_enum_retain_classified` / `_release_classified`, both runtimes: only a word the registry marks as a counted enum block is counted or dropped — the drop shallow at the last count, its payloads left — any other word is never read and takes the object operation) — and by Stage0's P2 death plan (b37-f63d, roadmap F63 step S3: an owned temporary, an owned slot, an owned return and a release-safe parameter, dropped shallow where the value dies, liveness including the exceptional edges), but not yet by P3 or the deep drops (roadmap F63, in progress): an enum block only those release (a list element, a payload of a released block) stays a bounded leak. A field store releases the counted enum it replaces only where the field OWNS a count: a reference object's field (b37-f63, ruling R7a; both Stage0 emitters and the self-hosted one) — a construction gives every borrowed counted enum it stores into a field declared as one, a `Result` included, a count of its own — while a VALUE block (a struct, an exception value) is built and copied word for word without counting the enum it holds, so a store into such a field never releases the old value (1.28.0 freed it under the construction's source or another copy of the struct: heap-use-after-free) — EXCEPT a value STRUCT's field declared as a counted user enum whose every read in the program lets nothing of the block outlive it uncounted (the class finalizer's proof, `compute_fin_enum_fields`, over value structs; b37-f63 step S7, ruling R8a): such a field COUNTS what it holds on every managed lane (Stage0 LLVM and Cranelift, `loup-llvm`) — a construction gives a borrowed value a count of its own (a fresh one moves in), a struct copy takes one (the emitter's counted copy `__loup_runtime_val_retain_opt`; the runtime's copy of a heap block through its descriptor), a store releases the old value through the typed releaser, and the block's death releases the last count (a frame block by the emitter, a heap block by `__loup_runtime_vobj_free`). The heap block's descriptor names such a field with counted-field kind 5, `(slot, 5, 8, &__loup_enum_release_<E>)`: its one data word is the typed releaser's ADDRESS (a relocation in the descriptor constant), so both runtimes call it on free and take `val_retain_opt` on copy; a runtime that does not know a kind skips its record by its length (a leak, never a wrong release). A struct's `Option[E]` / `Result` field, an enum the P2 pass manages deep, an exception or value-class field and a field a read rejects keep the uncounted rule (a bounded leak). (b36r-own census, 1290 owner × kind × operation probes at the batch-36 base: a string or a collection held by a class field, a `list` field, an `Any` or a `T` field, and a class instance, `Option[C]` or closure held by an element, a dict value, a tuple, a payload or a global, leaked on every store; `b.c = b.a` leaked at teardown (b36r-mis2 (b)); a struct field holding a closure and a tuple holding a list or dict, re-stored, and an `Any` field holding a list or dict faulted.)

Compiler's rule (counted enum blocks on both Stage0 native backends). Stage0's Cranelift backend gives enum values the counted model Stage0 LLVM gives them (Task #204's P0–P3 with row OWN-1's enum-payload owners; batch 36, coordinator ruling NOTE 20 (A): one model on every lane). A heap enum value is a COUNTED value block (`__loup_runtime_val_alloc` with the counted-enum cap magic, born with one count; the tag and payload words follow the 16-byte header, so every read site is unchanged); a payload-less variant aliases one immortal static per (type, tag); an enum the frame analysis proves non-escaping (Track 1) lives in the frame behind a zeroed header, its counted payloads dropped when the frame rebuilds or leaves it; a boxed `Some(prim)` is a counted two-word box. Counts are taken and dropped exactly where the LLVM backend takes and drops them, decided by the same shared analyses (`enum_store_release`, `value_free`) and never by a Cranelift-only one: a `Retain` / `Release` of an enum register (the value-header retain; the typed release `__loup_enum_release_<T>`, which at zero releases the variant's payloads by their declared kinds — a string, a class instance, a nested enum, a list with its elements, a type-parameter slot by classification — and frees the block); a borrowed enum payload's construction count; an enum, `Option[E]` or `list[E]` field's release of the value a store replaces; the class finalizer's `list[E]` and counted-dict fields; the scope-exit frees, on a `return` and on an exception leaving the frame; and Task #204's P2/P3 plan (owned temporaries and slots dropped at their death, element overwrites, owned `list[E]` slots, deep payload drops, the string and enum counts a store needs). A program whose reachable code builds an enum block links the managed runtime. Where an analysis proves no release, the block leaks (design I2), as on the LLVM lane. (Before it, the Cranelift backend allocated every enum block uncounted and never freed one: each construction leaked its block and everything its payload held.)

Compiler's rule (locals the borrowing code writes). Row OWN-1's borrow rule (3) weighs the frame's own LOCALS as it weighs fields and globals: a value read out of a local collection — `xs[0]`, `d[k]`, an element of a local list of lists — and still in use while a call or a loop body runs holds a count of its own (a copy of a `list` / `dict`) when that code writes the local: an element store, a mutating method or a re-store of it in the loop body, or an `edits:` / `takes:` argument of the call rooted in it (a plain call and a `super.` call alike). A function's may-write summary never carries its own locals to its callers, and a `match` over a read out of a local is always held. (b36r merge: the summary took a local as never written, so `f(edits: xs, xs[0])` whose callee stores `xs[0]`, and `for (s in g[0]) { g[0] = …; }`, freed the borrowed value under the borrow — and an accumulator seeded from such an argument appended in place under it.)

Compiler's rule (enum blocks a class holds). On Stage0's managed lanes (LLVM and Cranelift) an enum block owns the class instance its payload holds when the payload is a FRESH construction too — the construction's in-place constructor call (a borrow of the receiver) and the frontend's retain the store elides (the payload store moves the fresh object) are no second owners — so the binding's drop of such an enum is the deep one that releases the payload (P3's `obj_deep`). A class's ENUM-typed field owns one count of the block it holds, as row OWN-1 (2) has every counted field: a store's release-old already dropped it through the typed releaser `__loup_enum_release_<E>`; the generated constructor's initialisation now gives a BORROWED enum it stores a count of its own (`__loup_runtime_val_retain_opt`, keyed on the field's declared type or the value's enum type; a fresh one moves in), which makes that store a borrow of its source for the store-boundary pass (the source binding is dropped where it dies), and the class finalizer releases the field through the typed releaser — when its enum is flat or not managed by the store-boundary pass, and every read of a field of that name in the program lets nothing of the block outlive it uncounted (the pass's own borrow proof: a binding, a counted store, a release-safe argument, a counted return). A read that flows into a `T` or `Any` holder keeps the field out of the finalizer (a bounded leak): such a holder counts the block by its run-time classification (*Compiler's rule (strings and collections held by run-time classification)*), and its drop is a shallow one that cannot release the payloads. (b36f-ownleak round 2: before it a `T` / `Any` holder kept an enum block read out of a field UNCOUNTED, and the field's re-store freed it under the holder — `Box2(h.f); h.f = E.EA(1)` and `let a: Any = h.f` printed another block's value on Stage0 LLVM, ASan heap-use-after-free; and a store of an enum into an `Any` field retained the fresh DESCRIPTOR BOX the value was widened into as if it were the enum block, `h.a = e`: SIGSEGV on Stage0 LLVM and Cranelift. A box made for a store into an `Any` field is the field's, which adopts it: the store takes no other count.) The self-hosted emitter allocates the same counted blocks (b37-f63) and releases them by the emitter rules and the P2 plan, its finalizer releasing such an enum field by the same proof (b37-f63d), not yet by P3 (roadmap F63). (b36f-ownleak, row OWN-1: `let v: E = E.EK(C(7))` leaked its `C`, and a holder of an enum field leaked the block and its payload, on every native lane at N; `let x = E.EK(C(5)); let h = HV(x); h.f = E.EA(2); show(x)` was a heap-use-after-free on Stage0 LLVM under ASan at N — the generated constructor stored `x` uncounted and the field's release-old freed it.)

Compiler's rule (stores that outlive the frame). A store into a location that outlives the frame is a store into an OWNER of *Compiler's rule (owners release what they keep)* (row OWN-1) and takes that owner's own count exactly as a field or element store does — a borrowed value is retained, a fresh producer (a construction, an owning call, `Some(..)` of one) is moved — so the source binding's release at scope exit leaves the destination holding its own count, and the owner releases it when it is overwritten or dies. The owners this names, besides class fields and the elements of local or field collections: a MODULE GLOBAL (`g = x`, `g = Some(x)`, `g = o.unwrap()`); the elements of a global collection (`g.push(x)` / `append` / `set`, `g[i] = x`, `g[k] = x`), whose element type is the global's declared `list[E]` / `dict[K, E]`; a closure ENVIRONMENT (every captured class instance, niche `Option[C]` or counted enum, held by a `let`, a parameter, `this` / `self`, or a captured `var`'s cell — core §1-7.3, *Compiler's rule (capturing a reference on the native lanes)*; the record is the counted object of §3-2.4.1 *Compiler's rule (closure environments)*, row CLOSENV-1, which releases each capture once at its last release). Both lowerings apply the rule identically (the merged native MIR is the same). (2026-11-01, macOS sample apps: `let b = Box(2); g_list.push(b);` and `g = b` stored the object uncounted, so the frame's release freed it while the global still held it — the next allocation's fields read back through `g_list[0]`, `EXC_BAD_ACCESS` on Stage0 native.)

**Value types.** Structs, enums, tuples, and primitives are not reference counted. They are copied by value. Structs may contain `unique`-qualified class fields (§3-2.4.7); such structs are move-only (§1-10.3.2) — assignment transfers ownership rather than copying, and no ARC retain/release is inserted.

**Deterministic finalization.** `finalize()` is called when the last strong reference drops. `del handle;` releases the strong reference immediately. `with`/`Scoped[T]` releases at block exit. Both remain the preferred idioms for resource management; under ARC they provide early release rather than a safety net.

**`weak` reference runtime semantics (native ARC).** A `weak var` field does not increment `strong_count`. The ARC runtime maintains a side table of weak references to each object. When `strong_count` reaches zero, the runtime atomically zeroes all weak references to the object. Subsequent reads of a `weak` field load through the side table and return `None` if the entry is null. The side-table lookup is a single atomic load.

**`unowned` reference runtime semantics (native ARC).** An `unowned` field does not increment `strong_count` and is not tracked in the side table. Accessing an `unowned` field after the referent has been freed unconditionally traps with a `LifetimeError` in **all** build configurations, including release builds (`--release`). The trap is a single null-pointer check inserted by the compiler at each dereference site; its cost is comparable to a bounds check and is typically eliminated by the optimiser when the compiler can statically prove liveness.

Use `unowned[~name]` (§3-2.4.3) for class fields whose lifetime relationship can be proven from scope nesting. Use `weak` when in doubt — it is always safe.

### §3-2.4.1 ARC Elision via `borrow` and `noescape fn`

*(This section is normative. Applies to `@mode(host.native)`. In `@mode(freestanding)`, `borrow` and `noescape fn` serve their memory-safety and stack-allocation roles without ARC retain/release elision, since no ARC runtime is present. See §3-3.4 for freestanding availability.)*

Two constructs guide the compiler to elide ARC operations on specific hot paths:

**`borrow` parameters.** The compiler omits `retain()` on function entry and `release()` on function exit for `borrow` parameters. The ABI passes the value as a raw pointer with no reference count modification. The compiler verifies via escape analysis that the value does not outlive the call frame — any violation is a compile-time error before the elision is applied.

**`noescape fn` closure parameters.** The compiler may pass a `noescape fn` closure as a raw function pointer and captured-environment pointer pair, without ARC-retaining the closure object. For closures whose captures are all stack-resident values (no heap-allocated `var` bindings, no class instances captured by reference), the compiler may represent the entire closure on the stack with zero heap allocation.

The combined pattern produces zero ARC activity on hot iteration paths. For lifetime tracking of `borrow[~name]` references that flow beyond the call frame, see §3-2.4.2.

Compiler's rule (function values on the native lanes). On every native lane — `@mode(host.native)` (the managed runtime, the libOS seam, the hosted C backend) and `@mode(freestanding)` (both LLVM emitters, the C backend, the clang-free `loup-llbe` chain) — a function VALUE is a closure RECORD whose first payload word is the function's uniform thunk `(self, args…)` (word 0 of a freestanding record; on the managed lanes the record is an ARC object and the thunk follows its 24-byte header, see *Compiler's rule (closure environments)* below): a named module function used as a value (passed, bound, stored in a field or a global, returned) is boxed into a 1-word record holding its zero-capture thunk; a non-capturing lambda likewise; a capturing lambda's record carries its captures after the thunk. A call whose callee is not a module function by name — a parameter, a local, a field, a global, a call's result — is a call THROUGH such a value on every lane: load the thunk, call it with the record as `self`. No lane passes a function value as its name or calls a record as a raw code pointer. A backend that cannot lower function values refuses the program by name (`E-BUILD-NATIVE`), never builds it. (b34-cg: the self-hosted freestanding lane passed a named function as its NAME string and called into it, and the Stage0 LLVM and C emitters called the record itself as a raw pointer whenever their closure dataflow had not classified the callee — a struct field, a global written in another function, a call's result; the hosted C backend also passed named functions as strings.)
Compiler's rule (closure environments). On the managed native lanes (`@mode(host.native)`: the managed C runtime and the libOS) a FUNCTION VALUE is counted like a class instance (row CLOSENV-1, loup#902). A capturing closure's record is an ARC object of the runtime's closure type: the 24-byte object header, then the uniform thunk and the captures; the header's flags word holds the record's capture DESCRIPTOR. A named function or a non-capturing lambda is a static record `[0, 0, 0, thunk]` whose zero header no count touches. Creating a closure HOLDS each capture: a class or interface instance, a function value or an `Option` of one takes a count; a string, list, set or dict takes a count on its descriptor or spine (its elements untouched); a captured `var` lives in a CELL that owns the variable's current value — every store into the variable holds the new value and releases the one it replaces (a FRESH value — a construction, a closure, a list, dict or set literal, a concatenation — moves in instead of being held) — and the closure takes a count on the cell, as does the frame that declared the variable; a value holding a `unique` one, which the capture MOVES (core §1-7.3, row CAPMV-1), is taken as it stands; an `Any` word or a type-parameter word is held by its RUN-TIME classification, as a type-parameter field holds it (*Compiler's rule (type-parameter and interface fields)*: a box or a reference object takes a count, a registered heap value block is copied and the record keeps the copy) and released the same way, so a closure made in generic code keeps alive the instance it was handed (row CLOSENV-1, amendment HOLD-1); a scalar, a struct, an enum or a tuple is held as it stands. A capture is typed by the binding it names, whether a local (by its annotation, else by the list, set or dict type the checker inferred for it), a parameter of the enclosing function (by its annotation) or the receiver `this` of the method that makes the closure; a captured `var` is read through its cell whatever its annotation says. The creating frame keeps its own reference: where the capture RETAINS (a counted reference, a string, a spine, a cell) the frame releases its reference at its normal last use or scope exit, exactly as it would without the closure (the reclaim analyses see the record's hold as a counted alias of the value, and a function value's own counts — a binding's retain and release of a closure — stop none of them); where the capture TAKES (a CAPMV-1 move) there is no count and no release — the frame no longer owns it. The record's LAST release releases each capture exactly once and then frees the record (a cell's last release releases the value it holds); a moved move-only value is dropped through its drop path — a moved move-only STRUCT through its drop glue (the lowering's `{Struct}.__drop`, which drops the struct's owning fields, reached through the runtime's struct-drop dispatch by the block's type id), then its block is freed. A function value is owned as a class reference is (§3-2.4): a binding owns one count — a closure, a static record or a call of a function or method declared to return a function type hands over a fresh one, any other function value it is bound to is retained — and releases it on every scope exit; a function or method declared to return a function type hands its caller a count at every return site (a returned owning binding transfers its own, a fresh value carries one, anything else is retained); a store of a borrowed function value into a field, an element, a payload or a global takes a count of its own and a fresh one moves in; a function-typed class field releases the value a store replaces and its finalizer releases the one it holds; a fresh function value passed to a user function, method or constructor is released after the call, and one called where it is made (`(func() => …)()`, `mk()()`) is released after the call (the call's result is never borrowed out of the record: *Compiler's rule (function-value results)* below); a spawned thread holds its closure until it is reaped. A value read out of a closure record (a capture, inside the closure) or out of a captured `var`'s cell is a BORROW only where the read consumes it while the record or the cell is alive: as the receiver of a method that keeps nothing of it (any method of a counted reference; for a string, list, set or dict one answering a scalar, an element or a fresh copy), a field read, the callee of a call, an index, an operand of a comparison, `+`, `in` or `is`, a `println` / `print` argument, the iterator of a for-in over a capture that is not a cell, and — for a counted reference — an argument of a module function or constructor or the value of a `return` that already hands its caller a count. Any other read hands the value on under the rules below — a closure's `return` at +1 (*Compiler's rule (function-value results)*), a store into an owner (a binding, a field, an element, a payload, a module-level variable, a storing argument) with the owner's own count or, for a collection, its COLL-1 copy (*Compiler's rule (owner counts)*), an argument or a receiver read out of a cell with a call-scoped count — so re-pointing a function value, or assigning the cell, never frees what such a read handed on, and no read takes a count that nothing releases (row CLOSENV-1, amendment HOLD-1). The interpreters and Wasm are GC-managed. Freestanding records carry no header and nothing is counted: a capturing closure's environment is the per-site static of *Compiler's rule (function values on the native lanes)*. (loup#901: an escaping closure read a captured class instance, string or collection after its frame had released it; loup#902: no lane released a closure environment or what it captured.)
Compiler's rule (function-value results). On the managed native lanes every call THROUGH a function value hands its caller its result at +1 — ONE return convention for every kind, whoever made the value (row CLOSENV-1, amendment HOLD-1). (A) THE RESULT. A class instance, an interface value, a function value or an `Option` of one comes back with a count of its own; a string with one string count; a list, set or dict as an EXCLUSIVE copy — the caller's own value, never one the callee or a capture still holds (core §1-10.3); an `Any` or type-parameter word by its RUN-TIME classification, as `__loup_runtime_tparam_hold` holds it (a reference object or a box takes a count, a registered heap string a string count, a registered list or dict is replaced by an exclusive deep copy; dropped through `__loup_runtime_any_release`; row VALFN-1 — a module whose code may hold or drop such a word asks for the counted-value registry, *Compiler's rule (strings and collections held by run-time classification)*). A closure's body (a lambda, a function declared in a block) produces it at each `return`: a value it does not own — a capture, a parameter, a field or element read, a cell's value, a binding of any of these — is retained (a counted reference through the module-function return paths: loup#508 for a class, CLOSENV-1 for a function, loup#570 for an `Option` of a class; a string by a string count unless it is FRESH, below), copied (a collection, unless the `return` already copies it under COLL-1) or held by its classification (a type-parameter or `Any` word); a returned owning binding, a construction, a closure, a fresh string and a call that hands back +1 already carry their own. A named function used as a value whose own return convention hands back no count (one declared to return an interface, an `Option` of an interface or of a function, `Any`, a type parameter, or a string) is called through a wrapper that takes the count after the call — for a string, unless every value the function returns is FRESH, when the wrapper hands the result on as it is (its one count is the caller's already); a function declared to return a class, a function or an `Option` of a class already hands one back, and one returning a collection copies at its `return` (COLL-1). A returned string is FRESH when every value it may be — followed through the value of an `if` or `match` expression — is a string literal (static: a count of it is no count), a concatenation or an interpolation, `to_string()` of a non-string, a builtin string operation that builds a new string (`substring`, `trim`, `char_at`, a slice, a renderer: the native emitters' owned-string producers), the result of a call through a function value, or (for a named function) the result of a call of a module function declared to return `string` whose every return is fresh in turn (the greatest fixpoint: a recursive function by induction on the call depth), and when that value is used for nothing but the `return`. Anything else is not fresh — a parameter or capture, a variable (a binding of a fresh string included), a field, an element, a module-level variable, `to_string()` of a string (the string itself), a user method, any other call. Both lowerings decide it by the same pass over the lowered body (a closure's at its `return`, a named function's after every body of the PROGRAM is lowered); "not fresh" for a fresh string costs one count per call, never a free. The wrappers are the program's, not a module's: a route that lowers each module alone (the self-hosted `loup-llvm` behind `loup build` and the clang-free lane) names the wrapper wherever a function of ANY module is used as a value and defines every wrapper once over the combined program, so the wrapped function, the value and the functions a string's freshness depends on may each live in a different module and the result is the merged lowering's. The caller OWNS the result exactly as it owns a module function's class result: a binding takes it without a retain and releases it on every scope exit, a store moves it in, a temporary is released after its use (an argument after the call, a receiver or a field read after the read), a discarded result is released at once, and a list or dict result passed straight on as an argument is a fresh argument (moved, never retained). (B) THE CALLEE. The call's count of the RECORD ends with the call: a record read from a holder the call itself may re-point — a captured `var`'s cell, a module-level variable, a function-typed field, a collection element, or any value not known to be the frame's own — is retained before the call and released after it, so the running closure and its captures outlive a re-pointing of its holder from inside its own body; a fresh record made where it is called (`(func() => …)()`, `mk()()`) is released after the call, whatever its result (the result is never borrowed out of the record); a binding, a parameter or a non-cell capture of the frame, a named function and a non-capturing lambda need no count. (C) CALL-SCOPED COUNTS. A value the call may free through its holder before it is done with it takes a count for the call — retained where it is read, released after the call and after the call's own releases: a function value read out of a cell, a module-level variable, a function-typed field or a collection element as an argument; a class instance, interface value, function value, `Option` of one, string, list or dict read out of a captured `var`'s cell as an argument (of a user function, method or constructor, a `super` method or a call through a function value) or as the receiver of a method call; and a counted reference read out of a module-level variable that is assigned anywhere in the program (its owner releases the value it replaces, *Compiler's rule (owner counts)* below) as an argument or a receiver. (D) A closure made in generic code holds a captured `Any` or type-parameter word by its run-time classification (capture entry `P`, *Compiler's rule (closure environments)* above) and releases it the same way, so the instance, string or collection it was handed outlives the creating call's own argument. (E) An ARGUMENT of a call through a function value is a BORROW of the call, as an argument of a module function is (§3-2.4.9): whatever the callee keeps of it, it keeps by a count or a copy of its own — a lambda's store or `return` of a collection copies it (COLL-1), a capture of the parameter counts it — so the caller frees a list or dict it owns after the call as after a direct call; a `takes` argument is a MOVE into the callee. (HOLD-1: a closure returning its capture at +0 was freed with its record when a cell, field or global holding it was re-pointed during or right after the call, and `mk()()` kept the record alive instead; a function value's result was neither owned nor released, so a fresh result leaked and a borrowed one dangled once a holder was re-pointed; a `T`-typed capture was held as it stood, so `wrap(Tok(n))()` with `func wrap[T](x: T): fn(): T` read a freed instance; and a list passed to a call through a function value was never freed by its caller. Once callers owned function-value results: a named function returning a module-level string, a global object's field, a global list element or an element of its list parameter handed its caller, through a function value, a string the caller then freed (FVSTR); a closure returning `s.to_string()` of a string, a user method's string or a binding of a borrowed string took no count for it (P31STR); and `loup-llvm`'s per-module route wrapped only a module's own functions, so a function of another module returning an interface or a non-fresh string, used as a value, came back without its count and was freed by its caller (FVXMOD).)
Compiler's rule (owner counts). On the managed native lanes a STORE of a BORROWED counted value into an OWNER takes that owner's own count at the store, in every lowering — whatever KEEPS a value counts it, and a read takes none (row CLOSENV-1, amendment HOLD-1; ARC-1 / ARC-2). The owners: a module-level variable (typed as a class, an interface, a function or an `Option` of a class or interface, it retains the new value and releases the one it replaces, as it already did for an enum or a function value; an untyped or `Any` module-level variable and a static field retain it, with no release half, their type being unknown); a field, including one an implicit constructor's argument fills directly; the element or value a storing built-in method keeps (`push`, `append`, `add`, `unshift`, `prepend`, `push_front`, `enqueue`, `put` — its last argument — and `insert`, `set`, `setdefault` — its second); an element of a list, set or tuple literal and a key or value of a dict literal; an `Option` / `Result` / enum payload; an owning binding (`let o = Some(held)` included) and an assignment to an owning local; an in-flight exception (`throw` of a borrowed value); the caller of a `return` whose convention hands back no count of a value read out of a closure record, a cell or a re-assigned module-level variable; and an `if` / `match` expression forwarding into any of these, whose branch tails each take the owner's count (a fresh tail moves in; a `let x = if …` of a counted reference then owns its value). Per kind: a CLASS instance, interface value, function value or `Option` of one takes a count — read out of a plain local, a parameter or a field as much as out of a closure record or a cell; a STRING takes a string count only where its source can release it — a closure record or a captured `var`'s cell — since a plain local, parameter or field source cannot free it under the owner; a LIST or DICT takes no count: COLL-1 copies it into the owner (core §1-10.3), an `if` / `match` tail included. A for-in over a captured `var`'s cell holds the cell's value for the loop (a loop-scoped count released at the loop's exit, `break`, `return` and `throw` included). Transient positions — an argument, a receiver, an operand, a `print` argument, an index — take nothing beyond (C) of *Compiler's rule (function-value results)*. No never-released hold remains: each count names its owner, and the owner releases it — a module-level variable when it is assigned again; a field (overwrite and finalizer), a collection, tuple or payload, and a typed string owner through their release half, which follows in the same release (amendment HOLD-1, owners' release half). Until it lands such an owner keeps the count it took (a bounded leak where the 1.27.0 tools use-after-freed: a class instance pushed into a list or stored into a global from a borrowed read was freed under its new owner).

### §3-2.4.1.1 `excl borrow` on Structs

*(This section is normative. Applies to all six modes; see §1-2.6.)*

`excl borrow` is an exclusive borrow modifier for struct-typed parameters. It extends `borrow` with a compile-time exclusivity guarantee: the compiler verifies that no other `borrow` or `excl borrow` of the same binding is active simultaneously at the call site.

**Syntax.**

```loup
func fill(excl borrow buf: Buffer): void {
  buf.data = bytes.alloc(1024);
  buf.pos = 0;
}
```

`excl borrow` appears immediately before the parameter name, after the optional `borrow` keyword position. The two-token sequence `excl borrow` is the full modifier; `excl` alone is not a keyword.

**Why the exclusivity guarantee is deep.** Because §1-10.3.1 prohibits class-typed fields in structs, every field of a struct is a value type — a pure, independent copy. There is no aliased heap state reachable through a struct's fields. An exclusive borrow of a struct is therefore a genuinely complete exclusivity guarantee with no caveats, unlike a hypothetical exclusive borrow of a class instance which could have hidden ARC aliases.

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

  advance(excl borrow c);         # OK — no other borrow active
  peek(borrow c);                # OK — advance has returned

  # COMPILE ERROR: simultaneous borrows
  let p = peek(borrow c);
  advance(excl borrow c);         # E_EXCL_BORROW_ALIAS: c is already borrowed by peek
}
```

**What is permitted inside a `excl borrow` body.** The parameter may be read, have its fields mutated, be passed to `borrow` or `excl borrow` parameters, and be used as a `borrow[~name]` source. It may not be returned as an owned value and may not be stored in a class field.

**`excl borrow` and ARC elision.** `excl borrow` inherits all ARC elision properties of `borrow`: no `retain()` on entry, no `release()` on exit. The exclusivity guarantee is a static analysis property only; it has zero runtime cost.

**Restrictions.**

- `excl borrow` is valid on struct-typed parameters and on `unique`-typed parameters. For `unique` values, exclusivity is trivially guaranteed — the compiler has already proven single ownership, so no simultaneous borrow alias check is required. Using `excl borrow` on a plain ARC class type, primitive, enum, or `Any` is `E_EXCL_BORROW_NOT_STRUCT`.
- `excl borrow` is prohibited in `async func` signatures — async functions may suspend after the caller's frame has advanced (`E_EXCL_BORROW_ASYNC`).
- `excl borrow` bindings may not be captured by `Thread.spawn`, `Thread.spawnWith`, or `ThreadPool.run` closures (`E_EXCL_BORROW_THREAD_CAPTURE`).
- `excl borrow` is available in all six modes (see §1-2.6). The exclusivity guarantee is enforced as a compile-time static-analysis property and does not depend on the runtime memory model.

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

# Call site — no retain on items, no retain on the closure, no retain on each item
forEach(borrow myList, func(borrow item) {
  process(item);
});
```

### §3-2.4.2 Lifetime Tracking and Region Inference

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

**What is statically detected.** The compiler enforces the rules above as a conservative, syntactic subset, identically on every mode — lifetime syntax is available in all six (§1-2.6) and §1-10.11 states the region model does not depend on the memory model. Scope containment (rule 7, §3-2.4.4's escape rule and §1-10.7's `with` rule) is *block nesting*: a value "does not outlive" a location when the block that declares the value's root binding is strictly nested inside the block that declares the location's root binding (parameters belong to the function's outermost scope); a binding the analysis cannot place is never reported. Rule 3 is detected for a closure literal that captures a `borrow[~name]` parameter and is bound or assigned to a plain (non-`noescape`) `fn`-typed binding, or returned. `~static` satisfies every requirement, so a `borrow[~static]` parameter is never reported by rules 3, 5 and 6. `E_INFERRED_LIFETIME_ESCAPE` is detected for a store into a class field, a module-level binding, or a binding of an enclosing block.

**Lifetime erasure.** All lifetime labels are erased after the type-checking phase. The compiled binary carries no lifetime metadata. Lifetime tracking is a purely static compile-time analysis with zero runtime cost and zero binary size impact. *Compiler's rule (loup#671).* Both compilers run the lifetime checks on the parsed program, before HIR, so a declaration's `lifetime ~name` parameters are accepted, checked there and erased at HIR lowering: HIR (and its text) carries none on either lane. (Row REQ-1.)

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
| Can a class instance be shared across threads safely? | `Sendable` + structural verification (§2-1.8.1) | Compile time |
| Is a class instance exclusively owned with no ARC overhead? | `unique` qualifier (§3-2.4.7) | Compile time |

These three mechanisms are independent. A function may use all three simultaneously: an ARC-managed class parameter, a `borrow` parameter (ARC elided), and a `borrow[~src]` parameter (ARC elided, lifetime tracked) without any interaction between the systems.


### §3-2.4.3 Lifetime-Verified `unowned[~name]` Fields

*(This section is normative. Applies to `@mode(host.native)` and `@mode(freestanding)`.)*

`unowned[~name]` is a field qualifier that holds a non-owning, non-retaining reference whose validity is **proven at compile time** via the region system (§3-2.4.2). It is the only form of `unowned` permitted on class fields. Bare `unowned` on a class field (without a lifetime annotation) is a compile-time error (`E_UNOWNED_NO_LIFETIME`).

Because safety is compiler-proven, `unowned[~name]` fields do not insert any runtime null-trap. Every access is zero-cost: a raw pointer load with no check. There are no unsafe annotations, no runtime opt-outs, and no undefined behaviour paths.

#### Class declaration requirements

A class with `unowned[~name]` fields must declare `[lifetime ~name]` as a class-level lifetime parameter. This anchors the class instance's own lifetime to the `~name` region, which the compiler uses to verify that the class cannot outlive any of its `unowned[~name]` referents.

```loup
@mode(host.native)

class TreeNode[lifetime ~owner] : Any {
  pub let value: int;

  # Compile-time proven: every assigned value must be declared in a scope
  # that the compiler verifies contains (outlives) ~owner.
  unowned[~owner] var parent: TreeNode[~owner]?

  pub var children: list[TreeNode[~owner]] = []

  new(value: int, parent: TreeNode[~owner]?) {
    this.value = value;
    this.parent = parent;
  }
}
```

#### Assignment verification

The compiler applies rule 7 of §3-2.4.2 at every site that writes to an `unowned[~name]` field. The value's declaration scope must statically contain the `~name` region:

```loup
@mode(host.native)

func buildTree[lifetime ~tree](): TreeNode[~tree] {
  # root is declared in ~tree — it is the ~tree anchor.
  let root = TreeNode[~tree](value=0, parent=None);

  # Allowed: root was declared in ~tree, which contains ~tree (trivially).
  let child = TreeNode[~tree](value=1, parent=Some(root));

  return root;
}

# Compile-time error examples:
func errors[lifetime ~tree](): void {
  let root = TreeNode[~tree](value=0, parent=None);

  if (root.value == 0) {
    # inner is declared in a sub-scope narrower than ~tree.
    let inner = TreeNode[~tree](value=2, parent=None);
    root.parent = Some(inner);   # E_UNOWNED_LIFETIME_MISMATCH — inner does not
                                 # outlive ~tree; inner's scope is nested inside it.
  }
}
```

#### Subclassing

A subclass of a `[lifetime ~owner]` class automatically inherits the lifetime parameter. If the subclass adds its own `unowned[~name]` fields, `~name` must be the same parameter or a declared superset region. A subclass may not introduce a new, unrelated lifetime parameter for its own `unowned` fields without also declaring that parameter at the class level.

#### Error codes

| Code | Meaning |
|---|---|
| `E_UNOWNED_NO_LIFETIME` | See §3-2.4.3 |
| `E_UNOWNED_CLASS_NO_PARAM` | See §3-2.4.3 |
| `E_UNOWNED_LIFETIME_MISMATCH` | See §3-2.4.3 |

#### Relationship to `weak`

`weak` fields are always safe on all targets and require no lifetime parameters — they zero automatically through the ARC side table. Use `unowned[~name]` only when the lifetime relationship is strictly hierarchical and provable from scope nesting, and when avoiding the side-table lookup is measurable and important. When in doubt, use `weak`.

---

### §3-2.4.4 Inferred Struct Lifetimes

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

# All fields are borrow — lifetime inferred; no annotation needed
struct PacketView {
  borrow header: bytes;   # borrows into a larger buffer
  borrow payload: bytes;  # borrows into the same buffer
}

func parsePacket(borrow buf: bytes): void {
  let view = PacketView(
    header  = borrow buf[0:20],
    payload = borrow buf[20:],
  );
  process(view);   # fine — view stays within buf's scope
  # view cannot be returned or stored in a longer-lived location
}
```

**Inferred-lifetime structs, as detected.** A struct has an inferred lifetime when it declares no `[lifetime ~name]` parameter, has at least one `borrow` field, and every other field's declared type is a primitive, an enum, or a struct. Its return type counts as annotated when it carries a `~name` type argument or is written `borrow[~name] T`.

**Limitations.** Inferred lifetimes only apply when all non-trivial fields carry `borrow`. A struct with a mix of owned and borrowed fields must use explicit `[lifetime ~name]` parameters (§1-10.11). The inference is purely single-lifetime — multi-lifetime structs (where different fields borrow from different sources with independent lifetimes) require explicit parameterisation.

**Error codes.**

| Code | Meaning |
|---|---|
| `E_INFERRED_LIFETIME_ESCAPE` | A struct with inferred lifetime is assigned to a location that outlives one of its borrowed fields |
| `E_INFERRED_LIFETIME_RETURN` | A struct with inferred lifetime is returned from a function without explicit lifetime annotation on the return type |

---

### §3-2.4.5 Buffer Disjointness Contracts

*(This section is normative. Applies to all execution modes.)*

Buffer disjointness contracts are expressed using `distinct()` in a `requires` clause (§3-2.4.10). `distinct(a, b, ...)` asserts that the listed parameters do not point to overlapping memory regions and is statically verified by the compiler where possible, with an auditable `@unsafe` escape path for statically unknowable cases. The LLVM `noalias` ABI attribute is emitted for all `distinct()` parameters on native targets, providing the same auto-vectorisation benefit as the removed `@noalias` annotation.

See §3-2.4.10 for the complete specification of `distinct()` contracts.

### §3-2.4.6 `@unsafe` — Programmer-Asserted Safety Boundary

*(This section is normative. Applies to `@mode(host.native)` and `@mode(freestanding)` unless otherwise noted.)*

`@unsafe(reason: string)` is the single, unified annotation for all programmer-asserted safety claims in Loup. It consolidates what were previously scattered, ad-hoc annotations into one auditable surface. Every use of `@unsafe` is a greppable record of a specific safety property that the programmer asserts and the compiler cannot verify.

**The required `reason` string** documents what is being asserted. It is not optional — `@unsafe` without a reason string is a compile-time error. The reason string is preserved in the binary's debug metadata and is accessible via `core.reflect`.

**Valid targets.**

| Target | What `@unsafe` asserts |
|---|---|
| `extern native func` declaration | The function has programmer-asserted safety properties — thread safety, escaping borrow lifetime, or both |
| `class` declaration | The class's `implements Sendable` claim is valid despite having `var` fields that do not pass structural verification (§2-1.8.1) |
| `func` declaration | The function body calls `@unsafe`-annotated APIs; marks the function as an auditable unsafe boundary |
| `distinct()` call-site acknowledgment | The caller asserts that the listed parameters do not alias despite the compiler being unable to statically prove disjointness (§3-2.4.10); form: `@unsafe("distinct: reason")` in the argument list |
| `asm {}` block (native mode) | The inline assembly block is programmer-verified safe; required in `@mode(host.native)` (§3-3.7); form: `@unsafe("asm: reason")` preceding the `asm {}` block |
| overlay declaration (`let` / `var` binding or struct field) | The integer address the overlay views is valid memory of the declared `buffer[T, N]` shape for as long as the view is used (§3-3.17b, row OVL-1); form: `@unsafe("overlay: reason")` on the declaration. On a binding it is a flag on that binding — not the single-statement region an expression statement's `@unsafe` desugars to, which would end the binding's scope. On a binding whose initializer copies a struct holding an overlay field, it marks the copy as a deliberate second view (core §1-10.3.2) |
| `@assume(distinct(arr))` on a `for concurrent` loop | The asserted index-array elements are pairwise distinct, suppressing the disjointness check for index expressions reading from `arr` (§2-1.11). `@assume(distinct(...))` is the `for concurrent`-local sibling of `@unsafe("distinct: …")`; both share the same reasoning model — programmer assertion that aliasing/overlap is absent — and incorrect use causes data races and is undefined behaviour |

**Statement-level `unsafe("reason") { … }` region.** In addition to the `@unsafe` *annotation* above (which attaches to declarations / `distinct()` / a preceding `asm {}`), the bare *keyword* form `unsafe("reason") { … }` marks a STATEMENT region as programmer-asserted-safe. It is valid in **any** function or method body; the `reason` is mandatory (`E_UNSAFE_NO_REASON` otherwise). The shorthand `unsafe("reason") asm { … }` applies the region to a single inline-`asm` statement (sugar for `unsafe("reason") { asm { … } }`). Semantics are context-dependent: inside a `modifier` method of a `synchronized` class the region additionally releases the instance lock for its lexical scope (§3-2.4.14); **everywhere else it carries no lock semantics** and is purely an auditable record of an asserted-safe region (e.g. a freestanding kernel wrapping raw MMIO / inline-asm). `grep -E '@?unsafe\('` over a codebase yields the complete unsafe-assertion audit surface — both annotations and statement regions.

**Diagnostics.** A missing or empty reason string — on either the `@unsafe`
annotation or the `unsafe("reason") { … }` statement region — is
`E_UNSAFE_NO_REASON`. A call to an `extern native` function whose declaration
carries `@unsafe("escapingBorrow: …")` without a call-site acknowledgment is
`E_ESCAPING_BORROW_UNACKNOWLEDGED`; the acknowledgment is either a
statement-level `@unsafe("escapingBorrow: <reason>")` on the call statement —
which is sugar for the single-statement region `unsafe("escapingBorrow:
<reason>") { <call>; }`, the same sugar `unsafe("reason") asm { … }` receives —
or a lexically enclosing `unsafe("escapingBorrow: …") { … }` region. The
reason CATEGORY is what acknowledges: an enclosing region asserting a
different category (e.g. `threadSafe: …`) does not acknowledge an escaping
borrow. The three annotations this section consolidated
(`@threadSafe`, `@escapingBorrow`, `@unsafeEscapingBorrow`) are hard errors, not
deprecation warnings, and are reported as `E_RETIRED_ANNOTATION` with a hint
naming the replacement category:

| Retired annotation | Replacement | Scope |
|---|---|---|
| `@threadSafe` | `@unsafe("threadSafe: <reason>")` | `extern native func` declaration |
| `@escapingBorrow` | `@unsafe("escapingBorrow: <reason>")` | `extern native func` declaration |
| `@unsafeEscapingBorrow` | `@unsafe("escapingBorrow: <reason>")` | call site |

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
# Declaration site — asserts the pointer may outlive the call
@unsafe("escapingBorrow: libfoo_register stores the pointer; caller must ensure buf outlives the registration")
extern native "libfoo" func libfoo_register(buf: NativeHandle): void;

# Call site — acknowledges the escape
@unsafe("escapingBorrow: buf is a module-level static; it outlives all registrations")
libfoo_register(borrow buf);
```

Both the declaration site and every call site must carry `@unsafe` when a borrow is asserted to escape the native call.

**`Sendable` opt-out for classes.** When structural `Sendable` verification (§2-1.8.1) cannot be satisfied — for example, when thread safety is ensured by an external protocol invisible to the compiler — annotate the class:

```loup
@unsafe("sendable: mutations are confined to the initialization phase; fully immutable after construction")
class ImmutableAfterInit : Any implements Sendable {
  var data: list[int] = [];  # written only during init, never thereafter

  pub func build(items: list[int]): void {
    data = items;   # only called before sharing
  }
}
```

**Auditing `@unsafe` usage.** All `@unsafe` annotations in a codebase can be found with a single grep:

```
grep -rn "@unsafe" src/
```

This is the primary safety audit tool. The reason strings provide context for each assertion. New `@unsafe` annotations in a code review are immediately visible.

**`@unsafe` does not suppress other errors.** `@unsafe` bypasses only the specific verification it is designed to opt out of. It does not suppress unrelated compile-time errors. A `@unsafe` class with a `borrow[~name]` field still violates `E_SENDABLE_LIFETIME`. A `@unsafe` `extern native` function still requires correct parameter types.



### §3-2.4.7 `unique` Ownership

*(This section is normative. Applies to `@mode(host.native)` and `@mode(freestanding)`.)*

`unique` is a compile-time ownership qualifier for class instances. A `unique`-qualified binding or field holds a class instance with **compiler-proven single ownership**: no other binding or field may alias the same instance. There is no `strong_count`, no ARC retain/release, and no side-table tracking. The entire ownership model is static — the compiler enforces exclusivity at all use sites.

**`unique` is not ARC.** ARC allows unlimited aliasing; `unique` prohibits it entirely. A `unique` value is therefore always safe to access without synchronization, always safe to pass as `edits` (exclusive borrow requires no alias scan), and always zero-overhead in terms of reference counting.

#### Syntax — standalone bindings

```loup
@mode(host.native)

unique let conn = Connection.open(addr)      # immutable unique binding
unique var buf = Buffer.alloc(1024)          # mutable unique binding
```

`unique let` — the binding is unique and the local binding itself is immutable (the object's `var` fields may still be mutated via methods or `edits` borrow).
`unique var` — the binding is unique and may be reassigned to a different `unique` instance.

#### Syntax — struct fields

```loup
@mode(host.native)

struct Request {
  var path: string;
  unique var conn: Connection;   # uniquely-owned class field
}
```

A struct with `unique` fields is move-only (§1-10.3.2). The `unique` qualifier on a struct field is valid in all six modes.

#### Move semantics

Assigning a `unique` binding to another binding **moves** ownership — the source is consumed and may not be used again:

```loup
unique let a = Connection.open(addr)
unique let b = a         # MOVE: b owns the Connection; a is consumed
use(a)                   # E_USE_AFTER_MOVE
```

To transfer ownership of a `unique` value into a function, declare the parameter with `takes`. A no-verb parameter is an implicit `reads` borrow and does not consume the binding:

```loup
# takes — ownership transferred; caller's binding consumed
func process(takes conn: unique Connection): void { ... }

unique let c = Connection.open(addr)
process(takes: c)        # MOVE: c consumed
use(c)                   # E_USE_AFTER_TAKE
```

```loup
# reads (implicit) — borrow only; caller retains ownership
func inspect(conn: unique Connection): void { ... }  # implicit reads

unique let c = Connection.open(addr)
inspect(c)               # borrow — c still valid
use(c)                   # OK — c not consumed
```

#### Borrowing `unique` values

`reads` and `edits` are both valid on `unique` bindings. Because single ownership is compiler-proven, exclusivity for `edits` is trivially guaranteed — no alias check is needed:

```loup
unique let conn = Connection.open(addr)

read(conn)                   # implicit reads borrow — conn not consumed
read(reads: conn)            # explicit reads — identical
write(edits: conn)           # exclusive borrow — trivially safe, conn not consumed
use(conn)                    # OK — conn still uniquely owned
```

#### `consume` — explicit downgrade to ARC

`consume expr` explicitly transfers a `unique` value into the ARC ownership model, producing a regular ARC-managed reference. The source binding is consumed. The downgrade is **one-way and irreversible** — once a value enters ARC, the compiler no longer tracks uniqueness.

```loup
unique let conn = Connection.open(addr)

# Configure conn exclusively before sharing
write(edits: conn)

# Hand off to shared ARC ownership
let shared: Connection = consume conn     # conn consumed; shared is normal ARC
let alias: Connection = shared            # ARC alias — fine, uniqueness is gone
use(conn)                                 # E_USE_AFTER_MOVE
```

`consume` is required for passing a `unique` value to a function that expects a plain ARC class reference, storing it in an ARC-managed collection, or returning it from a factory function that produces shared values.

`consume` applied to a non-`unique` binding is `E_CONSUME_NON_UNIQUE`.

#### `unique` and `Sendable`

`unique` values are not `Sendable` under the standard rule — `Sendable` is about safe sharing across threads, and `unique` values are not shared. However, a `unique` value may be **moved** into a `Thread.spawn` closure, transferring ownership to the spawned thread. This is safe because the caller loses access to the value at the move point — there is no concurrent access.

```loup
unique let conn = Connection.open(addr)

let handle = Thread.spawn(func() {
  use(consume conn)    # conn moved into thread — caller loses access
})
use(conn)              # E_USE_AFTER_MOVE — conn was moved into the closure
```

`consume` inside the closure downgrades to ARC within the thread's ownership context, which is correct since the thread may share the value within its own scope.

#### `unique` and `finalize` / `del`

`del` on a `unique` binding calls `finalize()` immediately and releases the memory — there is no ARC decrement since there is no reference count. The binding is consumed by `del`:

```loup
unique let handle = NativeResource.open("data.bin")
# ... use handle ...
del handle    # finalize() called; memory freed immediately; handle consumed
```

`with`/`Scoped[T]` works identically — the `unique` value is finalized at block exit and consumed.

#### Restrictions

- `unique` is valid in all execution modes (§1-2.6). On the Wasm target it lowers to a host-managed reference with compile-time-proven single ownership; in ARC modes it is the ARC-free single-owner form.
- `consume` (the unique-to-ARC downgrade) requires an ARC runtime and is therefore only valid in `@mode(host.native)` and `@mode(host.dual)` — see §3-2.4.7.
- `unique let` on a struct field is a compile-time error — struct fields must use `unique var` (`E_UNIQUE_FIELD_LET`). `unique` is not valid as a qualifier on class fields: class instances are ARC-managed (or GC-managed) and aliasable by definition, which is incompatible with the single-owner invariant. Use `unique let` or `unique var` as a local binding qualifier, or a `unique var` struct field, to hold a uniquely-owned class instance. *Compiler's rule (`unique` fields).* A `unique` field of a class is `E_UNIQUE_CLASS_FIELD` — unless the class is itself a `unique class` (§1-8.11), whose instances are never aliased, so the rationale above does not reach it; a struct or a `unique class` may hold `unique var` fields. On every such field `E_UNIQUE_NOT_CLASS` (a type known not to be a class — an unresolved type or a type parameter is not evidence) and `E_UNIQUE_FIELD_LET` (`unique let`) apply, as on a binding. A `unique` BINDING keeps its class type: uniqueness is a property of the binding (`unique let b = a` moves `a`; `a` passed to a `borrow` parameter stays usable), never a distinct `unique T` type. Only a STRUCT with a `unique` field is move-only (§1-10.3.2). (loup#648; row UNQ-1 in `specs/x-update-v1_20-to-v1_21/design.md`, approved by the maintainer.) *Compiler's rule (a plain binding from a `unique` one, loup#685).* `let c = a` / `var c = a` with `a` a `unique` binding MOVES `a` exactly as `unique let c = a` does (a later use of `a` is `E_USE_AFTER_MOVE`), and `c` is itself a `unique` binding — the value keeps its single owner, and the one way into ARC stays the explicit `consume` (`let c = consume a`). (Row UNQ-2.)
- Capturing a `unique` binding — or any binding whose value holds a `unique` value — in a closure MOVES it into the closure, whether or not the closure escapes the frame (core §1-7.3, row CAPMV-1): a later use is `E_USE_AFTER_MOVE`, and the closure's body only borrows it.
- `unique` on a non-class type (struct, primitive, enum) is a compile-time error — value types are already exclusively owned by nature (`E_UNIQUE_NOT_CLASS`).

#### Error codes

| Code | Meaning |
|---|---|
| `E_CONSUME_NON_UNIQUE` | `consume` applied to a non-`unique` binding |
| `E_CONSUME_NOT_AVAILABLE` | `consume` used outside `@mode(host.native)`/`@mode(host.dual)` — no ARC runtime to transfer ownership into |
| `E_UNIQUE_NOT_CLASS` | `unique` qualifier applied to a type that is neither a class nor holds a `unique` value (`unique var handles: list[FileHandle]` is valid, core §1-8.11, row UNIQCOLL-1) |
| `E_UNIQUE_FIELD_LET` | `unique let` used on a struct field — struct fields must use `unique var` |
| `E_UNIQUE_CLASS_FIELD` | `unique` field declared in a class that is not a `unique class` (loup#648) |
| `E_UNIQUE_FIELD_IN_COPYABLE` | A field of a class that is not a `unique class` holds a `unique` value — a `unique class` instance, a move-only struct, or a collection, `Option`, tuple or generic instantiation of one (core §1-8.11): a copy of the class would alias it. Also a generic with no body to re-check instantiated with such a type. A collection of `unique` values is no longer refused (row UNIQCOLL-1) |



### §3-2.4.8 `arc let`, `unique class`, and Integer Safety Error Codes

*(This section is normative. Applies to `@mode(host.native)` and `@mode(freestanding)` unless noted.)*

| Code | Mode | Condition |
|---|---|---|
| `E_ARC_LET_NOT_NATIVE` | All | `arc let` / `arc var` used outside `@mode(host.dual)` or `@mode(host.native)` |
| `E_ARC_LET_NOT_CLASS` | host.dual, host.native | `arc let` applied to a value type |
| `E_ARC_LET_ON_FIELD` | host.dual, host.native | `arc let` or `arc var` used as a class or struct field qualifier |
| `E_BORROW_ESCAPE` | host.dual, host.native, freestanding | Plain `borrow` of a local escapes function scope without lifetime annotation |
| `E_BORROW_LOOP_MUTATION` | All | Collection mutated inside a `for-in` loop that holds an implicit borrow of it |
| `E_BOUNDS_LITERAL` | All | Array/list indexed with a compile-time constant that is out of range |
| `E_PREFER_COMPILED_NOT_SCRIPTED` | host.native, freestanding | `prefer compiled` import clause used in `@mode(host.native)` or `@mode(freestanding)` |

**`--require-explicit-arc`** (build flag, `@mode(host.native)` or `@mode(host.dual)`). When set, constructing a class into a plain `let` or `var` without `arc let` or `unique let` emits lint advisory `implicit-arc-binding`. Promote to an error with `// loup:error(implicit-arc-binding)`.

**`--overflow=trap`** (build flag, `@mode(host.native)` and `@mode(freestanding)`). When set, plain `+`, `-`, `*`, `/` on fixed-width integer types trap on overflow in all build configurations (debug and release), providing stronger guarantees than Rust's default (release builds silently wrap). The explicit overflow arithmetic methods (§3-3.19) remain available alongside this flag. *Implementation status (v1.21 interim, loup#1021; v21.portable.10).* Neither toolchain implements the overflow lever yet. A build that declares it — this flag, or `[freestanding] overflow = "trap"` (§3-3.21, the same rule) — is accepted, reads `freestanding.overflow` as `"trap"`, and warns `W-BUILD-OVERFLOW-TRAP` that the lever is declared but not implemented by this toolchain yet; both toolchains accept the flag.



### §3-2.4.9 Ownership Transfer Verbs

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
func f(reads  x: T): void { ... }   # explicit reads — shared immutable borrow
func f(        x: T): void { ... }  # implicit reads — identical to the line above
func f(edits  x: T): void { ... }   # exclusive mutable borrow
func f(takes  x: T): void { ... }   # ownership transfer
func f(shares x: T): void { ... }   # ARC retain
```

**Implicit default — `reads`.** A parameter declared without a verb is implicitly `reads`. Omitting the verb on a parameter is exactly equivalent to writing `reads`. This makes the safe, common case — passing a value for reading — require no annotation:

```loup
func render(buf: Buffer): string { ... }     # implicitly reads buf
func render(reads buf: Buffer): string { ... } # explicitly reads buf — identical
```

**Call site syntax.** `reads` is the implicit default and its acknowledgment is optional. `edits`, `takes`, and `shares` are explicit and their acknowledgments are required — omitting them is `E_VERB_REQUIRED`. A mismatched verb is `E_VERB_MISMATCH`:

```loup
# reads — both forms are always valid; explicit form preferred for clarity
f(reads:  x)   # ✓ explicit reads acknowledgment — always valid
f(x)           # ✓ implicit reads — valid when intent is clear

# edits / takes / shares — acknowledgment required
f(edits:  x)   # ✓
f(takes:  x)   # ✓
f(shares: x)   # ✓
f(x)           # ✗  E_VERB_REQUIRED — edits/takes/shares must be acknowledged
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

**ARC behavior change for no-verb parameters.** In prior ARC semantics, a plain parameter `func f(x: Buffer)` in `@mode(host.native)` implicitly ARC-retained `x` on entry and released it on exit. With the implicit `reads` default, `x` is now a zero-overhead borrow — no retain or release is inserted. Code that relied on the retain to extend the lifetime of `x` beyond the call frame must now use `shares` explicitly. The compiler catches this: in `@mode(host.native)` and `@mode(freestanding)`, attempting to store or return a `reads` parameter beyond the call frame emits `E_BORROW_ESCAPE`, guiding the programmer to use `shares` instead. `E_READS_MUTATION` is a separate error that fires when the function body attempts to write to a `reads` parameter directly — for example, assigning to one of its fields. `reads` is semantically equivalent to `borrow`. `edits` on struct-typed and `unique`-typed parameters is semantically equivalent to `excl borrow`. However, `edits` extends exclusive borrowing to plain ARC class instance parameters — a capability that `excl borrow` does not provide (`excl borrow` on a plain ARC class type is `E_EXCL_BORROW_NOT_STRUCT`, §3-2.4.1.1). This extension is the primary safety improvement of the verb system over the prior `borrow`/`excl borrow` vocabulary. The reference formatter emits a `prefer-verbs` lint advisory for `borrow` and `excl borrow` usage in new code.

*Compiler's rule (arguments are borrows; `E_READS_MUTATION` on value types).* On every lane an argument is a BORROW of the caller's value, whatever its type: no lane copies a `list`, `dict`, `set` or struct at the call (a struct handed to a `reads` parameter may be copied — it cannot be written — but one handed to `edits` never is), so the writes of an `edits` parameter are the caller's, through a function, a method, a lambda and a constructor alike. A parameter of VALUE type — a struct, `list`, `dict`, `set` or tuple — declared without a verb, `reads` or `borrow` is read-only through every path that stays inside the value: assigning to a field or an element reached from it through fields and elements that are themselves values (`p.x = v`, `xs[i] = v`, `bags[0].items[1] = v`), calling a mutating intrinsic method on such a place (`list`: `push` / `append` / `pop` / `set` / `remove` / `clear` / `reverse` / `sort` / `insert` / `extend`; `dict`: `set` / `remove` / `clear`; `set`: `add` / `remove` / `discard` / `clear`), or handing it on as an `edits:` argument, is `E_READS_MUTATION`. A step into a class instance ends the value path — the object is shared by reference and its own mutation rules apply. *Amended (loup#675, row BOR-3):* a CLASS- or INTERFACE-typed parameter declared without a verb, `reads` or `borrow` is read-only through its OWN object — assigning one of its fields (a setter included), calling one of its `modifier` methods (§3-2.4.11, the methods that write `this`; not on a `synchronized` class, whose lock makes it interior-mutable and shared by design — `edits` would demand an exclusivity it never has), writing through one of its value-type fields (`p.items.push(v)`), or handing it on as `edits:` is `E_READS_MUTATION`; a step into another object (`p.child.x = v`) still ends the path. A `requires edits(p)` / `takes(p)` / `shares(p)` contract (§3-2.4.10) makes `p` no `reads` borrow, and a `volatile borrow` parameter (§3-3.8) is exempt whatever its type: it is a device reference whose writes are the MMIO stores `volatile` exists to keep (`uart.data = byte`), and `volatile` is valid on no other verb (`E_VOLATILE_NOT_BORROW`). To change the caller's value declare the parameter `edits` (the call site then writes `edits: x`); to work on a private copy bind one (`var ys = xs;`, §1-10.3). (loup#642: both interpreters and both Wasm hosts deep-copied every collection argument of a function — an `edits` write was lost — while the native lanes shared it, so `func add(xs: list[int], v: int) { xs.push(v); }` answered two ways; the rule was specified here and enforced nowhere. Rows BOR-1 / BOR-2 in `specs/x-update-v1_20-to-v1_21/design.md`, approved by the maintainer.)

**`edits` in `async func` signatures.** `edits` on a struct-typed parameter is semantically equivalent to `excl borrow` and inherits the `E_EXCL_BORROW_ASYNC` restriction (§3-2.4.1.1): it may not appear in `async func` signatures because the caller's stack frame may no longer be valid when the function resumes after suspension. `edits` on a class-typed parameter does not inherit this restriction — ARC keeps the object alive across suspension points, and exclusivity is verified per-call rather than as a persistent live borrow.

**Error codes.**

| Code | Mode | Condition |
|---|---|---|
| `E_VERB_REQUIRED` | All | Call site omits required verb acknowledgment for an `edits`, `takes`, or `shares` parameter — `reads` and no-verb parameters do not require acknowledgment |
| `E_VERB_MISMATCH` | All | Call site verb does not match declaration verb |
| `E_USE_AFTER_TAKE` | All | Value used after being transferred via `takes` |
| `E_MOVE_OUT_OF_BORROW` | All | A `unique` value (or a move-only struct, or an aggregate holding one) moved out of a parameter or receiver the function only borrows — returned, thrown, bound, assigned, stored, or handed to a `takes` parameter or method (core §1-8.11, row MOVEB-1); or out of an element a collection holds, which in-place access (`c[i]`, `get`, `first()` / `last()`, a `for`-in variable) only borrows, or the elements copied out of a move-only collection (`clone()`, a slice, `filter`, `+`, an explicit `iter()`; core §1-8.11 Collections, row UNIQCOLL-1); or such a value captured out of a borrow by a closure, or moved, inside a closure's body, out of a capture the closure owns (core §1-7.3, row CAPMV-1) |
| `E_EDITS_WHILE_READS` | All | `edits` called while an active `reads` borrow of the same value is live |
| `E_EDITS_ALIAS` | All | Same value passed as `edits` more than once in a single call |
| `E_EDITS_READS_ALIAS` | All | Same value passed as both `edits` and `reads` in a single call |
| `E_EDITS_AFTER_SHARES` | All | `edits` attempted after `shares` downgraded a `unique` binding to ARC |
| `E_READS_MUTATION` | All | `reads` parameter written inside the function body — for a value-type parameter, any write through a field / element path that stays inside the value, a mutating collection method on it, or an `edits:` hand-on; for a class- or interface-typed parameter, the same on its own object plus a call of one of its `modifier` methods (see the Compiler's rule above) |
| `E_EDITS_STRUCT_ASYNC` | All | `edits` on a struct-typed parameter declared in an `async func` signature |

---

### §3-2.4.10 `requires` Clauses and `distinct()`

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
    edits(dst),             # overrides implicit reads on dst
    distinct(dst, src, aux) # src and aux are implicitly reads
: void { ... }
```

**Multi-parameter verb shorthand.** Applying a verb to multiple parameters in `requires` is exactly equivalent to placing that verb inline on each parameter individually:

```loup
# Both declaration forms are valid and mean exactly the same thing.
# Explicit reads is recommended when making the read-only contract visible matters:
func compare(reads x: Buffer, reads y: Buffer): bool  # explicit — contract visible in signature
func compare(x: Buffer, y: Buffer): bool              # implicit — concise when obvious

# The redundant form is requires reads(...) on a parameter that is already reads
# (either explicit or implicit) — the compiler emits a redundant-requires lint:
func compare(x: Buffer, y: Buffer) requires reads(x, y): bool  # redundant-requires lint

# requires is valuable for edits, takes, shares, and distinct:
func fillAll(dst: Buffer, src: Buffer)
  requires edits(dst), distinct(dst, src): void { ... }
```

When a parameter already carries an inline verb, repeating it in `requires` is redundant and the compiler emits a `redundant-requires` lint advisory. The same applies to no-verb parameters: `requires reads(x)` on a no-verb parameter is redundant because no-verb is already implicitly `reads`. A `requires` clause may specify a verb for a no-verb parameter to override the implicit default — `requires edits(dst)` on a no-verb `dst` parameter makes it `edits`, which is equivalent to declaring `edits dst: Buffer` inline.

**Call site acknowledgment.** `requires edits(...)`, `requires takes(...)`, `requires shares(...)`, and `requires distinct(...)` contracts must be acknowledged at every call site. `requires reads(...)` acknowledgments are optional at call sites — consistent with `reads` being the implicit default:

```loup
merge(dstBuf, srcBuf, auxBuf,
  edits(dstBuf),                      # required — edits must be acknowledged
  distinct(dstBuf, srcBuf, auxBuf),   # required — distinct must be acknowledged
  # reads(srcBuf, auxBuf)            // optional — implicit reads, may be omitted
)
```

**Implicit `safe func`.** A function is implicitly `safe func` (§3-2.4.12) when its `requires` clause contains any `edits(...)` or `distinct(...)` contract. A function with only `reads(...)` contracts is not implicitly safe.

*Compiler's rule (what the compilers carry, loup#671 / loup#672).* Both front ends parse the clause on a FUNCTION declaration where core §1-19.8 places it — between the parameter list and the return type — with `distinct` slice arguments (`dst[0:n]`), and keep it in HIR (and the HIR text: a `requires:` block) with each contract's span. A contract's verb applies to the named parameter for the `reads` rule (§3-2.4.9: `requires edits(p)` makes `p` no read-only borrow). An `edits(...)` or `distinct(...)` contract makes the function implicitly `safe func` (§3-2.4.12's Compiler's rule). Not implemented on either lane (open): the clause on METHODS (§1-19.8 `MethodDecl`), the call-site acknowledgment (`edits(dst)` among the arguments, `E_REQUIRES_UNACKNOWLEDGED` / `E_REQUIRES_MISMATCH`), the `distinct` outcomes (`E_DISTINCT_ALIAS`, `E_DISTINCT_NOT_READS_EDITS`) and the `redundant-requires` lint. (Row REQ-1.)

**`distinct()` contract.** `distinct(a, b, ...)` asserts that the listed parameters do not point to overlapping memory regions. Valid only on `reads`- or `edits`-qualified parameters. See §3-2.4.5 for the relationship to buffer disjointness contracts.

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

### §3-2.4.11 `modifier` — Method Mutation Contract

*(This section is normative. Applies to all execution modes.)*

A `modifier` method declares that it writes to one or more `var` fields on `self`. `modifier` applies only to **class** methods. Struct methods do not use `modifier` — structs have value semantics (copy on assignment, §1-10.3), so no aliasing can occur through struct method calls; the safety enforcement that `modifier` provides for class instances is unnecessary and inapplicable. A `modifier` declaration on a struct method is a compile-time error (`E_MODIFIER_ON_STRUCT`).

The compiler enforces this declaration bidirectionally for class methods.

**Declaration form.** `modifier` is a soft keyword valid only **immediately before `func`** in a method declaration: `[pub] [static] modifier func name(...)`. There is no `modifier name(...)` form without the `func` token — a bare `modifier` followed by anything other than `func` is parsed as an ordinary identifier (e.g. a field named `modifier`), not as a method modifier.

**Declaration syntax.**

```loup
class Foo {
  var _count: int = 0

  pub modifier func increment(): void { _count = _count + 1 }   # writes self
  pub func     value(): int      { return _count }          # read only
}
```

**Compiler-enforced invariants.**

1. *Declaration invariant.* A non-`modifier` method that writes to any `var` field on `self` is `E_MODIFIER_REQUIRED`. This is enforced for direct field assignments and for calls to `modifier` methods on `self` from within a non-modifier body.

2. *Call site invariant.* A `modifier` method called on a plain ARC instance requires a safe context (§3-2.4.12). The compiler verifies that no other live reference to the receiver exists at the point of the call.

**Setters are automatically `modifier`.** All `set` accessors are implicitly `modifier` and enforce the same call site rules. No additional annotation is required.

**`operator func` methods and `modifier`.** Operator methods are not implicitly `modifier` — the `modifier` keyword must be written explicitly when the body writes `var` fields on `self`. The syntax is `modifier operator func +=` (the `modifier` keyword precedes `operator`). Without `modifier`, writing to a `var` field inside an `operator func` body is `E_MODIFIER_REQUIRED`. With `modifier`, calling the operator on a plain ARC instance requires safe context at the call site, exactly like any other `modifier` method.

```loup
class Config {
  var _timeout: int = 30
  pub get timeout(): int  { return _timeout }   # non-modifier
  pub set timeout(t: int) { _timeout = t    }   # implicitly modifier
}
```

**`modifier` on `unique` receivers.** No safe context required — `unique` proves exclusivity statically.

**`modifier` on `synchronized` receivers.** No safe context required — the runtime lock provides exclusivity dynamically (§3-2.4.13).

**Direct external writes to `pub var` fields.** A direct external write to a `pub var` field on a plain ARC class instance — such as `config.timeout = 60` from outside the class — is subject to the same safe context requirement as calling a `modifier` method on that instance. The compiler enforces this as `E_SAFE_CONTEXT_REQUIRED`. On `unique` receivers, direct field writes are unconditionally safe. On `synchronized` class instances, direct external field writes acquire the instance lock automatically, identical to calling a `modifier`.

**`modifier` propagation.** When any function body — whether a top-level function, a class method, or a static method — calls a `modifier` method on a plain ARC class receiver, that call requires a safe context. The function may either wrap the call in a `safe {}` block, or declare itself `safe func` — which propagates the requirement to its callers in the same way `async` propagates upward through the call stack. A `safe func` may call `modifier` methods on plain ARC receivers freely within its body without additional `safe {}` wrappers.

**Error codes.**

| Code | Mode | Condition |
|---|---|---|
| `E_MODIFIER_REQUIRED` | All | Non-`modifier` method writes to a `var` field on `self` |
| `E_MODIFIER_ON_STRUCT` | All | `modifier` declaration used on a struct method |
| `E_MODIFIER_OVERRIDE_MISMATCH` | All | Non-`modifier` method overrides a `modifier` method in a superclass or implements a `modifier` interface method (§1-11.1) |
| `E_SAFE_CONTEXT_REQUIRED` | All | `modifier` called on plain ARC receiver outside safe context |

---

### §3-2.4.12 `safe` Contexts and `safe func` Propagation

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
  config.setTimeout(60)    # ✗ E_SAFE_ALIAS_MUTABLE — alias is live in scope
}

safe {
  let cfg = Config()       # no alias
  cfg.setTimeout(60)       # ✓
}
```

**`safe func` declaration.** A function declared `safe func` both requires and provides a safe context. It may call other `safe func`s and `modifier` methods freely without additional `safe {}` wrappers:

```loup
safe func process(edits buf: Buffer): void {
  fill(edits: buf)    # ✓ safe context active
}
```

**Propagation.** `safe` propagates identically to `async`: a `safe func` is a context requirement that travels upward through the call stack until anchored by a `safe {}` block:

```loup
safe func fill(edits buf: Buffer): void { ... }

# Option 1 — propagate upward
safe func prepare(edits buf: Buffer): void {
  fill(edits: buf)                    # ✓ already in safe func
}

# Option 2 — anchor inline
func setup(): void {
  let buf = Buffer()
  safe { fill(edits: buf) }           # ✓ safe{} anchors the requirement
}
```

**`safe {}` blocks and `await`.** A `safe {}` block may not contain an `await` expression — `E_SAFE_BLOCK_AWAIT`. The compiler cannot maintain exclusivity proofs across suspension points: after an `await`, another task may have obtained a reference to any ARC value that was subject to `edits` or `modifier` enforcement inside the block. Use `synchronized` (§3-2.4.13) for mutation that must span `await` boundaries.

**`safe async func`, `safe gen func`, `safe async gen func`.** `safe` may be combined with `async`, `gen`, or both. A `safe async func` enforces safety checks at each individual call site within the function body — each `edits:` call and each `modifier` call is independently verified at the moment it executes. The `await` between calls is not a problem because the exclusivity check is per-call, not a persistent live borrow spanning the suspension point:

```loup
safe async func loadAndProcess(edits buf: Buffer): void {
  let data = await fetchData()    # ✓ async context
  fill(edits: buf)                 # ✓ safe context
}
```

**Implicit `safe func`.** A function is implicitly `safe func` when any parameter carries `edits`, or when the `requires` clause contains `edits(...)` or `distinct(...)` contracts. Both conditions are visible in the function signature and deterministic from the outside.

*Compiler's rule (implicit `safe func`).* Both checkers treat the body of a function or method that has a parameter declared `edits`, or (functions only; methods take no `requires` clause yet, row REQ-1) a `requires` clause with an `edits(...)` or `distinct(...)` contract, as a safe context, exactly as for a declared `safe func`: a `modifier` call or a direct external `var`-field write on a plain ARC receiver inside it needs no `safe {}`. A receiver verb (`edits func`) and lambda parameters are not "a parameter carrying `edits`". The declaration's own `safe` flag is unchanged — the HIR/MIR text and the override rule see only what the source declares. Not enforced on either lane (open): the caller-side requirement that a `safe func`, explicit or implicit, be called from a safe context. (Both front ends reported `E_SAFE_CONTEXT_REQUIRED` inside such bodies until v21.)

When a function body calls a `modifier` on a plain ARC receiver outside a `safe {}` block, the compiler emits `E_SAFE_CONTEXT_REQUIRED` at that call site. The function does not become implicitly `safe func`. The programmer must explicitly choose: wrap the call in `safe {}`, or declare the function `safe func`. This keeps propagation visible and intentional, consistent with the explicit meaning design goal (§1-1).

**Availability.** `safe {}` and `safe func` are available in all execution modes. This removes the mode gate that previously restricted ownership enforcement to `@mode(host.native)` and `@mode(freestanding)`.

**Error codes.**

| Code | Mode | Condition |
|---|---|---|
| `E_SAFE_CONTEXT_REQUIRED` | All | `safe func`, `modifier`, or `edits` called outside safe context on non-unique, non-synchronized value |
| `E_SAFE_ALIAS_MUTABLE` | All | `modifier` called or `edits` taken while an alias of the receiver is live inside safe context |
| `E_SAFE_BLOCK_AWAIT` | All | `await` expression inside a `safe {}` block |

---

### §3-2.4.13 `synchronized` Class — Runtime-Locked Mutation

*(This section is normative. The per-instance runtime-mutex model described here applies to `@mode(web.scripted)`, `@mode(web.compiled)`, `@mode(host.scripted)`, `@mode(host.dual)`, and `@mode(host.native)`. `@mode(freestanding)` provides a distinct, reduced `synchronized` model — a per-class compare-and-swap lock — described under **Freestanding mode** below.)*

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
let config = Config()    # synchronized
let alias  = config      # ARC alias

config.setTimeout(60)    # ✓ lock acquired at runtime
alias.setTimeout(90)     # ✓ blocks until first modifier finishes
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

**`synchronized` and `Sendable`.** A `synchronized` class may declare `implements Sendable`. The compiler recognises `synchronized` as providing thread safety equivalent to `Mutex[T]`-wrapped fields and suppresses `E_SENDABLE_UNPROTECTED_VAR` for `var` fields on classes that declare both `synchronized` and `implements Sendable`. This is the only exception to the structural `Sendable` verification rule (§2-1.8.1). Non-modifier read methods on a `synchronized Sendable` class are inherently thread-safe because the compiler verifies they contain no `var` field writes.

```loup
synchronized class Counter : Any implements Sendable {
  var _value: int = 0            # ✓ no E_SENDABLE_UNPROTECTED_VAR
                                 #   synchronized exempts var fields
  pub modifier func increment(): void { _value = _value + 1 }
  pub func     value(): int      { return _value }
}

let counter = Counter()          # Sendable — can be passed to Thread.spawn
```

**`@lockOrder(n: int)` — lock ordering annotation (normative).** To prevent deadlock from inconsistent lock acquisition order, a class may be annotated with `@lockOrder(n)` where `n` is a positive integer. `@lockOrder` is valid on any **class** declaration — applying it to a non-class declaration (e.g. a function) is a compile-time error. On a `synchronized` class it orders the implicit lock; on a plain class it orders an explicitly-managed lock (`acquire()` / `release()`), the form freestanding spinlocks use (see **Freestanding mode** below). Within a `modifier` method body, if the method calls a `modifier` on another `synchronized` object of a different class, that object's `@lockOrder` value MUST be strictly greater than the current class's `@lockOrder` value. Violations are compile-time errors (`E_LOCK_ORDER_VIOLATION`).

```loup
@lockOrder(1)
synchronized class Account : Any {
  var _balance: int = 0
  pub modifier func debit(amount: int): void { _balance -= amount }
  pub func balance(): int { return _balance }
}

@lockOrder(2)
synchronized class Ledger : Any {
  pub modifier func transfer(edits account: Account, amount: int): void {
    # ✓ Account (lockOrder 1) < Ledger (lockOrder 2)
    account.debit(amount)
  }
}

@lockOrder(1)
synchronized class BudgetAccount : Any {
  pub modifier func settle(edits ledger: Ledger): void {
    # ✗ E_LOCK_ORDER_VIOLATION — Ledger (lockOrder 2) > BudgetAccount (lockOrder 1)
    # ledger.transfer(...)
  }
}
```

Classes without `@lockOrder` may not call `modifier` methods on other `synchronized` objects from within their own `modifier` bodies — this would be an unordered lock acquisition (`E_LOCK_ORDER_MISSING`). Assign `@lockOrder` to all `synchronized` classes that participate in multi-object locking.

**Freestanding mode.** `synchronized` **is** available in `@mode(freestanding)`, with a reduced model. A freestanding `synchronized class` lowers to a single **per-class** lock word (one compare-and-swap mutex shared by every instance of the class, not per-instance) acquired on entry to any **`modifier`** method and released on return. (Non-`modifier` methods do not acquire the lock; the lock CAS is emitted in the `modifier` prologue only.) The per-instance mutex, the `Sendable` exemption, and the `unsafe {}` lock-release region (§3-2.4.14) described above are runtime-mode features and do not apply to the freestanding model. The per-class granularity over-serializes multiple live instances of the same class; the **caller-addressable `attachLock` form** below provides per-instance lock words for callers that need them. A kernel that defers preemption while a lock is held names its deferral functions with `[freestanding] preempt_defer` (§3-3.21.4, row PREEMPT-1). The compiler then calls `enter()` before each `modifier`'s acquire, and `leave()` (then `drain()` on `1`) after each release.

Because the lock is held only inside `modifier` methods, a write to a `var` instance field of a freestanding `synchronized class` from a **non-`modifier`** method (or a `pub func` accessor) would mutate guarded state with no lock held. The general `E_MODIFIER_REQUIRED` rule (§3-2.4.13, "All" modes) therefore applies to a `synchronized` class in `@mode(freestanding)` exactly as in the runtime modes, and is **visibility-agnostic** — a non-`modifier` `pub func get`/`set` accessor re-exports the unguarded write across module boundaries and is rejected too. (A *non-`synchronized`* freestanding class is a struct-like value block with no lock, so a plain `self.field` write from any method remains legal there — the rule keys on the class being `synchronized`, not on the mode alone.)

**`synchronized`-class guarded-field READS (all modes).** Because the per-class (freestanding) / per-instance (runtime) lock is held only inside `modifier` methods, *reading* a `var` instance field of a `synchronized` class through `self`/`this` from a **non-`modifier`** method is also unsynchronized — the read can tear against a concurrent `modifier` write. Such a read is `E_MODIFIER_REQUIRED` in **all** modes; the read must occur inside a `modifier func` (which holds the lock), **or** inside an `unsafe("reason") { … }` region (§3-2.4.14) — the latter being the explicit opt-in to an asserted unsynchronized read (e.g. a deliberately relaxed/racy read). This is **visibility-agnostic** (a non-`modifier` `pub func` getter is rejected too) and applies to `var` fields only — an immutable (`let`) field never changes after initialization, so a non-`modifier` read of it is legal. The combined rule is: *a read or write of a `synchronized` class's mutable (`var`) instance field is permitted only inside a `modifier func`.* (A non-`synchronized` class has no lock, so a plain field read from any method remains legal — the read rule, unlike the write rule, keys solely on the class being `synchronized`.)

The in-class rules above govern field access *through `self`/`this`*. A **`pub var`** instance field, however, is also accessible from *outside* the class (`instance.field`) with no lock held — bypassing synchronization entirely, which the in-class `modifier`-required rules cannot reach. Declaring a `pub var` instance field on a `synchronized` class is therefore an `E_PUB_VAR_ON_SYNCHRONIZED` **warning** (all modes): make the field non-`pub` (a private `var`, mutated via a `modifier`) or `pub let` if it is immutable (an immutable field cannot tear). A private `var`, a `pub let`, and any field on a non-`synchronized` class are unaffected.

**`attachLock(addr: uint64): void` — caller-addressable per-instance lock (normative).** A freestanding `synchronized class` instance carries a hidden lock-address field that is zero on every fresh instance (it is materialized by the same default-initialization store as any other field default — see §3-3.16b — not by an explicit constructor). The built-in method `lk.attachLock(addr)` binds that instance's implicit lock to the caller-supplied stable address `addr`. `attachLock` is a compiler-recognised synthetic built-in (no user declaration); it resolves only on a `synchronized`-class receiver with an integer address argument, and its lock-address binding is lowered inline only in `@mode(freestanding)`. On any other receiver `attachLock` is not a defined method and is rejected by ordinary method resolution (there is no dedicated `attachLock` diagnostic).

After `attachLock(addr)`, the `modifier`-method prologue/epilogue compare-and-swap **`addr`** instead of the per-class static `__sync_lock_<C>`; release stores through the same address. An **unattached** instance (one on which `attachLock` was never called, so its lock-address field is still zero) falls back to the per-class static `__sync_lock_<C>` and is byte-identical to the unattached per-class form above. The target is selected per instance at each method entry as `self.<lock-addr-field> ?: &__sync_lock_<C>`. Distinct addresses therefore yield N independent lock words for one logical lock-class — e.g. one lock word per CPU runqueue — at caller-chosen locations. The caller is responsible for the stability and exclusive ownership of each attached address; `attachLock` does not allocate.

The `@lockOrder` lattice check is **unchanged** by `attachLock`: it is rank-only and address-agnostic. Sequential same-rank acquisition with a release between remains legal; only nested same-rank holding is rejected. Two instances of the same `@lockOrder(A) synchronized class` attached to different addresses share rank A for the lattice check exactly as the per-class form does — attaching distinct addresses does not change their rank.

`@lockOrder(n)` is valid in freestanding mode — indeed it is the mechanism that lets the runtime rank check be elided — and applies to both forms:

- On a `@lockOrder(A) synchronized class`, entering a method holds rank A for the body. A call into a method of another `@lockOrder(B) synchronized class` (which acquires rank B) while a rank ≥ B is held is a compile-time `E_LOCK_ORDER_VIOLATION`. The lattice is verified statically across nested synchronized-method calls; this includes a same-class self-call, which would self-deadlock on the non-reentrant lock.
- On a plain (non-`synchronized`) `@lockOrder(B)` class — the freestanding **spinlock** idiom — the lock is taken explicitly with `acquire()` / `release()`. Calling `acquire()` while a rank ≥ B is already held is a compile-time `E_LOCK_ORDER_ACQUIRE_VIOLATION`; `release()` drops rank B from the held set.

The check is intra-procedural (ranks acquired inside a separately-checked callee are not propagated to the caller).

**Error codes for `@lockOrder`:**

| Code | Mode | Condition |
|---|---|---|
| `E_LOCK_ORDER_VIOLATION` | All compiled modes (incl. freestanding) | A method holding rank A (an enclosing `@lockOrder(A) synchronized` class, or an explicitly-held lock) calls a method on a `@lockOrder(B) synchronized` class with B ≤ A |
| `E_LOCK_ORDER_ACQUIRE_VIOLATION` | All compiled modes (incl. freestanding) | An explicit `acquire()` on a `@lockOrder(B)` class while a lock of rank ≥ B is already held |
| `E_LOCK_ORDER_MISSING` | All compiled modes | A `modifier` calls a `modifier` on a `synchronized` object when neither class carries `@lockOrder` |

*(The v1.16 code `E_LOCK_ORDER_NOT_SYNCHRONIZED` (RETIRED) is retired: `@lockOrder` is valid on any class declaration, so applying it to a non-`synchronized` class is no longer an error. Misplacement on a non-class declaration is reported as a generic annotation-placement error.)*

**Error codes.**

| Code | Mode | Condition |
|---|---|---|
| `E_SYNCHRONIZED_REENTRANT` | Runtime modes | A `modifier` on a `synchronized` instance calls another `modifier` on the same `self` (in freestanding, a same-class self-call on a `@lockOrder` class surfaces as `E_LOCK_ORDER_VIOLATION` instead) |
| `E_PUB_VAR_ON_SYNCHRONIZED` | All compiled modes | A `pub var` instance field on a `synchronized` class — it is reachable from outside the class with no lock held, which bypasses the synchronization the in-class rules establish (§3-2.4.13) |
| `E_UNSAFE_NOT_SYNCHRONIZED` (RETIRED) | — | Allocated when the region was synchronized-only. §3-2.4.6 makes `unsafe("reason") { … }` valid in **any** function or method body, so the condition this code named no longer exists; outside a `synchronized` modifier the region simply carries no lock semantics. Both compilers deliberately raise nothing here. |

*(The v1.16 code `E_SYNCHRONIZED_FREESTANDING` (RETIRED) is retired: as of the freestanding `synchronized` model above, a `synchronized` class is permitted in `@mode(freestanding)` and lowers to a per-class compare-and-swap lock.)*

---

### §3-2.4.14 `unsafe {}` Within `synchronized` Classes — Lock-Release Regions

*(This section is normative. Applies to `@mode(web.scripted)`, `@mode(web.compiled)`, `@mode(host.scripted)`, `@mode(host.dual)`, and `@mode(host.native)`.)*

The `unsafe("reason") {}` statement region is valid in any function or method body as a general programmer-asserted-safe region (§3-2.4.6). This section specifies its *additional* behaviour in one context: inside a `modifier` method on a `synchronized` class, an `unsafe {}` block explicitly releases the per-instance lock for its lexical scope, allowing expensive work to proceed without holding the lock. Outside that context the region has no lock semantics (it neither acquires nor releases any lock) and the self-access restriction below does not apply.

**The default is locked.** Inside a `synchronized` modifier, the lock is always held unless explicitly released via `unsafe {}`. This is an inversion of the traditional lock()/unlock() model and eliminates the bug class where a programmer forgets to reacquire a lock after releasing it.

**Semantics.** On entry to an `unsafe {}` block, the instance lock is released. On exit (normal or exception), the lock is reacquired before execution continues. The compiler enforces that no `self` field is accessed within the block.

**Syntax and required reason string.**

```loup
synchronized class Cache {
  var _entries: dict[string, string] = {}
  var _hits:    int = 0

  pub modifier func fetch(key: string): string {
    # Lock held — self fully accessible
    if (_entries.has(key)) {
      _hits = _hits + 1                   # ✓ write under lock
      return _entries[key]                # ✓ read under lock
    }

    # Declare result variable before the lock-release region
    var value = ""

    # Lock released for duration of unsafe{} block
    unsafe("fetching from remote — lock released for network call duration") {
      value = remoteFetch(key)            # ✓ assigns to outer var — fine
      let ttl = computeTTL(value)         # ✓ local computation — fine
      _entries[key] = value               # ✗  E_SELF_ACCESS_UNSAFE — lock not held
    }
    # Lock reacquired automatically on unsafe{} exit

    # Lock held again — value is in scope, self is accessible
    _entries[key] = value                 # ✓ write under lock
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

---

### §3-2.5 ARC and the Scripted/Native Mode Boundary

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

**What is statically detected.** A class is ARC-managed when it is declared in a `host.native` or `host.dual` module and GC-managed when it is declared in a `host.scripted` or `web.scripted` module, each module's mode being its effective mode (its `@mode`, else its manifest `[modes]` entry, else the build's mode). A field *holds* every class its declared type names, including through generic arguments (`Option[G]`, `G?`, `list[G]`). Static fields and `weak` / `unowned` fields hold nothing (neither keeps its referent alive). The compiler reports a cycle formed by two such classes — an ARC class `A` with a field holding a GC class `G`, and `G` with a field holding `A` — once per offending field of `A`, at that field. The two classes are necessarily in different modules, so a program forms one only through a deferred or mutual import (§1-13). Longer cycles through intermediate classes are not statically detected; they fall under the lint advisory below.

For cases that are not statically detectable — for example, reference graphs constructed at runtime — the compiler emits the `cross-boundary-cycle` lint advisory. ARC objects that participate in such graphs MUST hold references to GC-managed objects only via `weak` fields on the ARC side. Failure to do so causes a permanent, unrecoverable memory leak.

| Code | Mode | Condition |
|---|---|---|
| `E_CROSS_BOUNDARY_CYCLE` | host.dual, host.native | Statically-detectable ARC→GC→ARC reference cycle without `weak` on the ARC side |

### §3-2.6 ABI Stability

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

### §3-2.6.1 Aggregate Return Convention

*(This section is normative. Applies to all native and freestanding targets.)*

§3-2.6 fixes the LAYOUT of an aggregate. This section fixes how one is RETURNED,
which layout alone does not determine and which was previously left to each
backend.

It is specified because Loup has two independent compiler implementations that
must agree byte-for-byte. An unspecified convention is drift in the one place
where drift is not a wrong answer but silent memory corruption: a caller reading
a returned value through a different convention than the callee wrote it reads
another object's memory. Rust can leave `extern "Rust"` unspecified because it
has a single compiler; Loup pays that cost and can never collect the benefit.

**Classification.** A function returning a fixed-layout aggregate (`struct`,
`enum`, tuple, or fixed `buffer`) returns it by one of exactly two forms,
selected by the target ABI's own rules for a value of that size and alignment:

1. **Register form** — the value fits the target's return-value register class.
   The callee places it in the return registers; no memory is involved.
2. **Memory form** — otherwise. The CALLER provides storage and passes its
   address as a hidden leading pointer parameter; the callee constructs the
   value there and returns that address.

The choice MUST be a function of the aggregate's layout and the target ABI
alone. It MUST NOT depend on the callee's body, on whether the result is used,
or on any analysis a backend performs — those differ between implementations,
and a classification that differs between two compilers is the corruption above.

**The storage is the caller's.** In both forms the returned value's storage
belongs to the caller's invocation. A callee MUST NOT return a value backed by
storage it owns — neither its own frame (which dies at the return) nor a
compiler-owned static (which is shared by every invocation, every CPU, and any
interrupt that re-enters). This is the same rule §3-3.24.1 enforces for
interrupt-context locals, stated for return values; the storage invariant that
checks it is described below.

**Conformance status (v1.20).** Recorded because it is not yet met, and a
specification that silently diverges from its implementations is worth less than
one whose gap is written down:

| return | current form | conforming |
|---|---|---|
| scalar | registers | yes |
| `struct` / `class` value | memory form, at every size | **partially** — sound, but the register form is not yet selected for aggregates that would fit it |
| `enum`, scalar payload, free function or non-dispatched method | memory form (caller-owned `%__sret`) | **partially** — same gap as `struct`: sound, register form not yet selected |
| `enum`, scalar payload, dynamically-dispatched method (whole implementer group admissible) | memory form — the `@ifacecall:` switch threads one caller-owned `ptr %__sret` into every case arm | **partially** — same missed-register-form gap as `struct`. Admission is all-or-nothing per (interface, method) group; a method in several groups needs all of them |
| `enum`, scalar payload, dynamically-dispatched method (group NOT admissible: an external or non-qualifying implementer, or a name colliding with a managed builtin arm) | compiler-owned mutable static | **no** — threading a partial group would mismatch the non-admitted members' signatures at the dispatch site |
| aggregate return CHAINED from a dispatch (`return iface.m(...)` — free function or group member) | memory form — struct-ness seeds through the `@ifacecall:` result, the dispatch is a phase-A blocker, and admission resolves it once the WHOLE implementer group is in the sret set: the site emitter passes the caller's `%__sret` straight through, and the payload-need fixpoint joins the group's need | **partially** — same missed-register-form gap as the other memory-form rows. A chain into a NON-admissible group keeps the per-callsite `@__sretbuf_` static, §D-marked |
| aggregate return, method whose NAME has a live THUNK-dispatched virtual-call (type-id vdispatch) site — group admissible (every `Class.name` member qualifies) | memory form — the `@__vdisp_<name>_<arity>` thunk takes a leading `ptr %__sret` and forwards it into every case arm; call sites use the same three-way buffer as a direct sret call | **partially** — same missed-register-form gap as the other memory-form rows; both emitters (Stage0 emits the thunk since loup#697) |
| aggregate return, THUNK-dispatched vdispatch name group NOT admissible (a member returns a parameter, chains an interface dispatch, or is not aggregate-returning) | compiler-owned mutable static | **no** — the whole name group is evicted, uniformly (loup#201): even a uniformly-admitted group would mismatch if the thunk did not thread, so admission and threading go together, all-or-nothing per name. An evicted member stays out: the chaining phase re-admitted one on its own until v21.portable.12, giving it the memory form its group's call sites do not pass (the receiver was read as the buffer). Two live results of one such method share its static. A name whose virtual-call sites are all DIRECT (below) is no group (lead ruling L8, 2026-11-04): until then `(a + b) + (c + d)` on a struct whose `+` returns a struct, with another type's `+` returning a scalar, read the second sum twice |
| `@repr(transparent)` newtype, returned (the bare named-local `var r: T; …; return r;` shape included) | memory form — the single scalar is stored into slot 0 of the caller-owned `%__sret` | **yes** — the transparent arm predated the ladder: it took the hidden pointer, never wrote it, and returned a per-callsite static's address, unmarked (the Helios "vacuous sret" set) |
| `enum`, aggregate payload (one level) | memory form — the payload copy is emplaced in a caller-owned PAYLOAD REGION appended to the return buffer (`sret_slots + idx·block_slots`), sized per callee by a need fixpoint over chained sret calls | **partially** — same missed-register-form gap; a payload nested DEEPER than one level, or one whose register feeds two different payload positions, keeps the flagged static |
| any sret-converted return whose result's ADDRESS escapes the caller (stored into an aggregate, a global, or an index) | per-callsite mutable static (`@__sretbuf_`) | **no** — deliberate: a caller-frame buffer would dangle; the static is flagged and counted rather than silently unsound |

The struct gap is a missed optimization: the memory form is always a legal
choice, so a program built this way is correct.

An `enum` return takes the caller's storage when the callee is a free function,
a method never reached by dynamic dispatch, or a member of a fully-admissible
interface-dispatch group: the `@ifacecall:` switch calls every implementer with
one shared argument list, so it threads one caller-owned buffer into every case
arm — legal only when the WHOLE group takes the sret ABI, which is why admission
is all-or-nothing per (interface, method) group and a method appearing in
several groups is admitted only when all of them are. A group with an external
or non-qualifying implementer, a bare name colliding with a managed builtin
dispatch arm, or a member whose returned value comes from another dispatch stays
on the static form. The type-id vdispatch (`@__vdisp_<method>_<arity>`) is NOT
managed-only: the self-hosted emitter routes a freestanding virtual call whose
receiver class it cannot statically resolve through it. A method NAME with a
live virtual-call site is therefore a dispatch group of its own — every
`Class.name` function is a potential thunk arm — and admission is all-or-
nothing per name: when every member qualifies (aggregate-returning, no returned
parameter, chained callees admitted, ret-flowing virtual results targeting
already-admitted names), the whole group joins the sret set and the thunk takes
a leading `ptr %__sret` forwarded into every case arm; otherwise the whole
group is evicted, uniformly, because a thunk that does not thread would
mismatch even a uniformly-admitted group (the loup#201 wedge: `HalMmu.map`
took the sret parameter while `__vdisp_map_3` still passed four registers).
The name scan counts REACHABLE THUNK-dispatched virtual-call sites only (the
prelude's dead capability shims otherwise evict every user method named
`write`/`read`). Compiler's rule (direct virtual calls, lead ruling L8,
2026-11-04): a virtual call on a receiver whose static class (or an ancestor)
defines the method and has no subclass (every `struct`) is a DIRECT call on
every lane, an operator method included; it passes the caller's buffer iff its
RESOLVED callee takes the memory form, exactly as a named call does, and it
makes the method's name no dispatch group: the callee is admitted or not on its
own merits (aggregate-returning, no returned parameter, chained callees
admitted). An operator name (`op_+`, `compareTo`, `op_neg`, …) on an operand
whose type does not define it is the primitive operator, lowered inline: no
call, and no member call of the name's group (an `int` helper returning `a + b`
no longer took a spurious buffer because a struct's `+` is aggregate-returning).
Both emitters classify every freestanding site the same way (Stage0 and the
self-hosted `vsite_kind`).

**Operator methods (v21.portable.12).** An operator applied to an operand whose
type defines the operator method (`a + b` on a `struct` with `operator func +`,
`a < b` through its `compareTo`, `a == b` through `operator func ==`, `-a`
through `op_neg`, `a[i]` through `operator func []`) is a call of that method on
every lane, under this section's return convention; the primitive operator
applies only to operands of a primitive type. Until v21.portable.12 the
freestanding LLVM lanes of both toolchains lowered the desugared call as the
primitive operator on the two object WORDS (loup#668 had fixed only the managed
lanes): `Fixed.fromRaw(7) + Fixed.fromRaw(1)` added two addresses and read the
sum back as a `Fixed` (a silent `0`). The freestanding C backend keeps every
struct value in one block per construction site, so the operands of
`a.f() + a.f()` and the two results of `(a + b) + (c + d)` would share a block:
it refuses every reachable such call (`E_OPERATOR_METHOD_LANE`, §3-3.22) rather
than lower it.

A returned sret-call result that the enclosing (non-sret) function cannot chain
into its own `%__sret` — including a returned DISPATCH result — is built into a
per-callsite `@__sretbuf_` static rather than a stack slot: the address outlives
the frame, and a stack buffer there is a dangling pointer, not a storage-class
trade-off.

A payload that is itself an aggregate is COPIED (§1-10.3.1 value semantics) into
the caller's payload region — a per-callee extension of the return buffer, sized
by a `need` fixpoint so scalar-payload enums cost the caller nothing. What
remains for that row is depth: a second level of aggregate nesting (an aggregate
inside the emplaced payload) still takes a flagged static, as does a payload
register the analysis cannot place unambiguously.

All three gaps are reported at build time as `W-STORAGE-INVARIANT` (§D of the
aggregate-value proposal), which marks each offending global in the emitted IR;
the mark follows the payload chain, so a nested block is counted rather than
silently omitted.

This row is the reason the classification rule above forbids depending on the
callee's body. The memory form here is selected by a whole-module analysis, not
by layout alone, so it is not yet the conforming rule even where it produces
caller-owned storage — two implementations agree today only because the analysis
is ported between them and diffed byte-for-byte by the freestanding e2e gate.

**Testing.** Conformance MUST be checked by calling across the boundary and
observing the values, not by inspecting emitted IR. IR inspection tests what one
backend emits; the property that matters is that a value returned by one
implementation is read correctly by the other.

### §3-2.7 C Header Interop

Loup provides bidirectional C header interop for native builds.

#### §3-2.7.1 `loup export-headers` — Loup → C

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
| `char` | `uint32_t` | Unicode scalar value (§1-4.1.5); maps to 32-bit unsigned at the ABI boundary |
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

#### §3-2.7.2 `loup import-headers` — C → Loup

Generates Loup `extern native` declarations from a C header file, eliminating hand-written FFI bindings:

```
loup import-headers --lib sqlite3 /usr/include/sqlite3.h -o sqlite3.loup
```

**Generated binding format:**

```loup
# sqlite3.loup — generated by loup import-headers
# DO NOT EDIT

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

### §3-2.8 Build Pipeline and `.lppkg` for Native

**Manifest additions:**

```toml
# <name>.lppkg
[delivery.native]                     # formerly [target.native]; both are read
include   = ["io.fs", "io.proc", "net.net"]
link      = ["sqlite3"]               # -lsqlite3
link_path = ["vendor/lib"]            # -L<project root>/vendor/lib (absolute paths as written)
framework = ["AppKit"]                # -framework AppKit on an Apple host; ignored elsewhere
```

The link keys are read by both native drivers for a hosted (`libc` foundation) build and follow the program's inputs on the link line (`-L` paths, then libraries, then frameworks), merged with the libraries the program's called `extern native` declarations name (Runtime §2-3.4), each once. Library and framework names follow §2-3.4's rule (`lib` prefix dropped; `c`, `m`, `pthread`, `dl`, `System` add nothing). On any profile but `[delivery.native]` they are a manifest error rather than keys read by nothing.

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

**Toolchain memory (implementation note, batch 36).** The self-hosted build driver runs its
compilers (`loup-llvm`, `loup-llbe`) with glibc's malloc on transparent huge pages
(`GLIBC_TUNABLES=glibc.malloc.hugetlb=1`, appended to a `GLIBC_TUNABLES` the caller already
sets unless that already names `glibc.malloc.hugetlb`). It changes no output — the same `.ll`,
objects and images — only the time their multi-gigabyte heaps spend faulting in 4 KiB pages
(about a fifth of a Helios kernel build). `LOUP_NO_THP=1` turns it off; it has no effect where
glibc or transparent huge pages are absent.

**Profile-guided optimization (implementation note, batch 36).** A hosted release link by
`loup-bootstrap` (libc foundation; not a sanitizer build, not the libOS library link) takes two
build-environment variables: `LOUP_NATIVE_PGO_USE=<file>` passes an LLVM instrumentation profile
(an `llvm-profdata merge` output) to clang as `-fprofile-use`, and `LOUP_NATIVE_PGO_GEN=<dir>`
builds an instrumented binary whose runs write their raw profiles there (it wins when both are
set; an empty value is unset). Neither changes what the program computes — only where clang
inlines and how it lays out code. A profile older than the source still applies to the functions
that did not change; one clang cannot read (another LLVM's format) never fails the build: the link
is retried without it. The toolchain's own units carry profiles beside their sources
(`<unit dir>/<name>.profdata`, refreshed by `source/sandboxes/agent/pgo_train.sh` from this
repository's inputs only), and `install.sh` builds each unit with its profile when one is
present: `loup-llvm`, `loup-llbe` and `loup run` run 15–18 % faster, with the same IR, objects,
images and program output.

**Hosted runtime object cache (implementation note, batch 36).** A hosted `loup build` on the
self-hosted route links its program against the managed runtime that `loup-llvm
--emit-companion` emits as C. With the artifact cache on (no `--no-cache`), `loup-build` compiles
that C once into `<package>/.loup-cache/objects/rt-<key>.o` — the key a SHA-256 over a format tag,
the clang driver (resolved path, size, modification time, `--version`), the compile flags and the C
text — and links the object; a release link also keeps a ThinLTO cache in
`<package>/.loup-cache/thinlto`. The executable is byte-identical to the one-step link (the same C,
compiled with the same flags, is the object that link made internally); only the time changes — a
second or so per build. A link that fails with the cached object is retried the one-step way;
`--clean` removes both caches with the rest of `.loup-cache`.

### §3-2.9 Requirements

- Native compilation requires `@mode(host.native)` for all source files.
- `extern js` and `@jsexport` are prohibited — no JavaScript runtime is present in a native binary (`E_EXTERN_JS_NOT_NATIVE`).
- Structs passed to `extern native` functions must be annotated `@repr(C)` (`E_EXTERN_STRUCT_NOT_REPR_C`).
- All types should be statically known. `Any` as a declared type, `dynamic class`, and `core.inspect` are permitted but produce the `W_ANY_IN_AOT_MODE` advisory (§1-2.4.2, §1-2.6); projects that prefer to enforce static typing can promote it with `--warnings-as-errors=W_ANY_IN_AOT_MODE`.
- ARC is mandatory; there is no GC option for `--target native`.

**Stack overflow in native mode (normative).** The `--stack-size N` build flag (bytes, must be a multiple of the platform page size) sets the OS thread stack size for the main thread and all `Thread.spawn` threads. The Loup native runtime SHALL install a stack guard page (one platform page below the stack bottom) on all platforms that support `mprotect`/`VirtualProtect`. An access to the guard page produces a signal (SIGBUS/SIGSEGV on POSIX, structured exception on Windows) that the runtime maps to `StackOverflowError` and delivers to the current thread's exception handler. On platforms that do not support guard pages, a `--stack-size` overflow produces undefined behavior; the runtime documentation MUST note this for each target triple. The `deep-async-stack` lint advisory fires when an `async func` declares local variables whose total stack footprint exceeds 64 KB — async coroutine frames are heap-allocated but can still be unexpectedly large.

**Overflow arithmetic methods.** Fixed-width integer types in all modes have `checkedAdd`, `wrappingAdd`, `saturatingAdd` (and the equivalent `Sub`, `Mul`, `Div` families) for explicit overflow control. See §3-3.19 for the full specification.


---

## §3-3 Freestanding Mode

*(This section is normative.)*

### §3-3.1 Overview

Freestanding mode (`@mode(freestanding)`) compiles Loup source to a native binary with **no Loup runtime linked**. It targets kernels, bootloaders, embedded firmware, hypervisors, and any environment where no OS, no libc, and no host runtime exists. The binary contains only what Loup source files explicitly produce plus any `extern native` libraries the programmer declares.

**Design goals:**

1. **Zero-cost memory safety** — the full ownership system: `reads`/`edits`/`takes`/`shares` verbs, `modifier`, `safe {}`, and `distinct()` contracts (v1.15, all modes); `unique`/`borrow`/`excl borrow`/`lifetime ~name` (all modes per §1-2.6). No ARC overhead or runtime support required. v1.16 adds `@interruptSafe`, `InterruptGuard`, `DmaBuffer[T]`, `PartialInit[T]`, `native.mpu`, and `native.atomic.hwFence` to close hardware-specific safety gaps (§3-3.20, §3-3.24).
2. **Direct hardware access** — inline assembly, volatile MMIO, interrupt handlers, and raw linker section control.
3. **Auditable unsafe surface** — every unsafe operation requires `@unsafe` or a purpose-specific annotation; the surface is greppable and minimal.
4. **Rust-equivalent or stronger guarantees** — the memory-safety properties in `@mode(freestanding)` match or exceed those provided by Rust's `no_std` environment (see §3-2.4 and release notes for the formal comparison).

### §3-3.2 Target Declaration and Compilation

```
loup build --target freestanding --arch x86_64
loup build --target freestanding --arch aarch64
loup build --target freestanding --arch riscv64 --march rv64imac
loup build --target freestanding --arch riscv32 --march rv32imac
loup build --target freestanding --arch armv7
loup build --target freestanding --arch thumbv8.1m.main                  # Cortex-M55, clang-free llbe (the default)
loup build --target freestanding --arch thumbv8.1m.main --backend llvm   # Cortex-M55, clang
loup build --target freestanding --arch s390x   --march z13

# Clang-free: the self-hosted backend emits the ELF object and machine code itself
loup build --target freestanding --arch aarch64 --backend llbe
```

**Supported architectures.** The **Maturity** column is normative documentation of *validation reach*, not of intent: it states how far each architecture has actually been exercised. Programmers targeting anything below *boot-verified* should expect to do their own bring-up.

| `--arch` | Description | Backends | Maturity |
|---|---|---|---|
| `x86_64` | 64-bit x86 (AMD64/Intel 64) | C, LLVM, `llbe` | **Boot-verified — most mature.** Freestanding images boot end-to-end under QEMU. The reference target. |
| `aarch64` | 64-bit ARM (ARMv8-A) | C, LLVM, `llbe` | **Boot-verified.** Complete freestanding kernels boot end-to-end under QEMU. |
| `riscv64` | 64-bit RISC-V; `--march` specifies the extension string | C, LLVM, `llbe` | **Boot-verified.** Freestanding images boot end-to-end under QEMU. |
| `riscv32` | 32-bit RISC-V (`riscv32-unknown-none-elf`); 64-bit integer arithmetic is synthesised from 32-bit operations | C, LLVM, `llbe` | **Boot-verified** under QEMU via the C/LLVM path. In the self-hosted `llbe` backend, **call fixups are not implemented** — cross-function relocations on this arch must go through the C/LLVM path — though its object container is now `ELFCLASS32` and links. |
| `armv7` | 32-bit ARM (`armv7-unknown-none-eabi`, ARMv7-A); 64-bit integer arithmetic is synthesised from 32-bit operations (division and variable shift via EABI helper routines) | C, LLVM, `llbe` | **Boot-verified** under QEMU on **both** paths. `llbe` owns an A32 encoder, Tier-1 lowering, and an inline-`asm` assembler, reached as `--arch arm` or `--arch armv7`; its encodings are byte-validated against a reference assembler and differential-tested against LLVM's disassembler, its `ELFCLASS32`/`R_ARM_CALL` objects link with `ld.lld`, and a naked `@entry` boot routine using `movw`/`movt` symbol halves and `strb` MMIO boots end-to-end. Its 64-bit divide and remainder, signed and unsigned, and its variable shifts are emitted inline (no EABI helper is linked): the signed forms divide the magnitudes and fix the signs (the quotient rounds toward zero, the remainder takes the dividend's sign), and on the edges with no common answer across arches (a zero divisor, `INT64_MIN / -1`) they give exactly what the platform's clang route gives (`x / 0` is ∓1, `x % 0` is `x`, `INT64_MIN / -1` is `INT64_MIN` with remainder 0; lead ruling L12, 2026-11-04 — batch 38 adds the panic guard for a zero divisor on every arch). Its Tier-1 lowering also covers `gep`, `switch` and a scalar `phi` (two-phase copies through a per-phi slot, as on the T32 lane, so a phi that reads another phi of its block sees the old value). Constructs outside the Tier-1 set (`select`, an aggregate `phi`, floating point, stack arguments beyond the two register pairs) are **reported by name**, never miscompiled — a unit that needs them takes the LLVM path. |
| `thumbv8.1m.main` | Arm Cortex-M, Armv8.1-M mainline (Cortex-M55), Thumb-only (`thumbv8.1m.main-unknown-none-eabi`) | LLVM, `llbe` | **Boot-verified** under QEMU `mps3-an547` on **both** paths: the LLVM path built by Stage0 and the self-hosted CLI with a byte-identical `.ll` (loup#465), and the clang-free `llbe` path (loup#521), whose image prints the same serial output. See **Cortex-M targets** below. |
| `thumbv8m.main` | Arm Cortex-M, Armv8-M mainline (Cortex-M33) (`thumbv8m.main-unknown-none-eabi`) | LLVM, `llbe` | **Built and run** under QEMU `mps3-an547` on both paths (an Armv8.1-M core executes the Armv8-M mainline image); no native M33 machine is exercised. |
| `thumbv7em` | Arm Cortex-M, Armv7E-M (Cortex-M4/M7) (`thumbv7em-unknown-none-eabi`) | LLVM, `llbe` | **Built and run** as `thumbv8m.main`, on both paths. |
| `thumbv6m` | Arm Cortex-M, Armv6-M (Cortex-M0/M0+), no FPU, no exclusive monitor (`thumbv6m-unknown-none-eabi`) | LLVM, `llbe` | **Built and run** as `thumbv8m.main`, on both paths (`llbe` in its Thumb-1 mode; every instruction checked to decode as Armv6-M); atomics are refused (below). |
| `x86` | 32-bit x86 (IA-32) | C, LLVM | **Limited.** Supported through the C/LLVM path only; not boot-verified as a first-class freestanding target. |
| `loongarch64` | 64-bit LoongArch | `llbe` | **Encoder-level only.** Instruction encodings are byte-validated against a reference assembler; **no image has been booted**. Bring-up is the programmer's responsibility. |
| `mips64el` | 64-bit MIPS, little-endian | `llbe` | **Encoder-level only.** Byte-validated encodings; **not boot-verified.** |
| `powerpc64le` | 64-bit PowerPC, little-endian (ELFv2) | `llbe` | **Encoder-level only.** Byte-validated encodings; **not boot-verified.** |
| `s390x` | 64-bit IBM Z (z/Architecture), **big-endian**; ELF `EM_S390` (machine 22). Backend triple `s390x-unknown-none`; default `--march` baseline `z13`/`arch11`, overridable via `--march` exactly as `riscv64`. ABI = z linkage convention / s390x SysV (`@callconv(C)` maps to it). `--output-format elf\|raw` is honored, ELF default. | `llbe` | **Specified + encoder-level; not boot-verified.** The only big-endian target; see the pending-implementation note below. |

**Backend dispatch.** The clang-free self-hosted backend (`--backend llbe`, §3-2.2) dispatches `x86_64`, `aarch64`, `riscv64`, `riscv32`, `arm`/`armv7`, `thumbv8.1m.main`/`thumbv8m.main`/`thumbv7em`/`thumbv6m` (one Thumb backend: Thumb-2, and Thumb-1 for v6m), `loongarch64`, `mips64el`, `powerpc64le`, and `s390x` — it owns the encoder for each. `x86` is reached only through the C/LLVM path, which delegates final code generation and linking to an external toolchain. The C and LLVM paths additionally cover every `llbe` arch for which a suitable cross `clang` is installed.

An arch outside that dispatch set is **rejected**. It is never encoded on a fallback arch: an unrecognised `--arch` used to fall through to the `x86_64` encoder and be written into an object labelled with the requested machine type, which is a silent miscompile rather than a build failure.

**Cortex-M targets (loup#465).** The four `thumb*` arches are **Thumb-only, M-profile** 32-bit ARM targets. The `--arch` spelling *is* the LLVM architecture, so there are no aliases (`thumbv8.1m`, `cortex-m55`, … are rejected with the supported list). They build on the **LLVM path** (`--backend llvm`, clang + `ld.lld`) and on the clang-free **`llbe` path** (loup-llvm's emitter → `loup-llbe`'s Thumb backend → `ld.lld`, loup#521), which is the **default** for all four, as it is for every freestanding arch (§3-2.2). The C path drives the host `gcc`, which has no Thumb target, and is refused with a message naming `--backend llvm`. A hosted (`native`) target with a Cortex-M arch is refused — these are freestanding-only.

| `--arch` | LLVM triple | Default core (`-mcpu`) | Inline atomics | FPU on the default core |
|---|---|---|---|---|
| `thumbv8.1m.main` | `thumbv8.1m.main-unknown-none-eabi` | `cortex-m55` | 8/16/32-bit (`LDAEX`/`STLEX`) | yes |
| `thumbv8m.main` | `thumbv8m.main-unknown-none-eabi` | `cortex-m33` | 8/16/32-bit (`LDAEX`/`STLEX`) | yes |
| `thumbv7em` | `thumbv7em-unknown-none-eabi` | `cortex-m7` | 8/16/32-bit (`LDREX`/`STREX`) | yes |
| `thumbv6m` | `thumbv6m-unknown-none-eabi` | `cortex-m0plus` | none | no |

Every row uses the ARM EABI datalayout `e-m:e-p:32:32-Fi8-i64:64-v128:64:128-a:0:32-n32-S64`, pinned into the emitted `.ll` together with the triple, and the image is compiled `--target=<triple> -mthumb -mcpu=<core> -mfloat-abi=<abi>` (plus the common freestanding flags, and `-O2` in a release build). As on the other 32-bit targets, 64-bit integer arithmetic is synthesised from 32-bit operations and the companion runtime supplies the ARM EABI division, shift and `mem*` helpers. Inline `asm` is assembled in **Thumb state** (T32 encodings) by the integrated assembler, and the ELF entry point is a Thumb (odd) address.

- **Core and float ABI.** `$LOUP_ARM_MCPU` overrides the default core. `$LOUP_ARM_FLOAT_ABI` selects the float ABI: `soft` (the default — no FP register is ever touched), `softfp`, or `hard`. `softfp`/`hard` on `thumbv6m` (no FPU) is refused, as is any other value. A unit built `hard` or `softfp` MUST enable the FPU itself (CPACR CP10/CP11) before the first floating-point instruction; nothing in the toolchain does it.
- **Atomics.** The `atomic*U32` family lowers to native LLVM atomics, which LLVM expands to an exclusive-monitor loop on `thumbv7em`/`thumbv8m.main`/`thumbv8.1m.main`. Anything the core cannot perform inline is **refused at compile time** rather than left to an `__atomic_*` library call the `-nostdlib` link cannot resolve: every atomic on `thumbv6m` (no `LDREX`/`STREX`), the `atomic*U64` family on every Cortex-M arch (M-profile has no `LDREXD`), and `synchronized` class methods (their lock is a 64-bit compare-and-swap). The diagnostic names the construct and the alternative: on a single core, guard the data with `InterruptGuard` (§3-3.24.2).
- **Interrupt mask.** `irqSaveDisable`/`irqRestore` (§3-3.4.2) — hence `InterruptGuard` — lower to `mrs primask` + `cpsid i` / `cpsie i` on every Cortex-M arch.
- **Frame storage.** Every `alloca` in the emitted `.ll` is in its function's entry block, so each is a static frame slot and a function's stack use does not depend on how often a loop runs — at `-O0` as at `-O2` (loup#529; this holds for every target the LLVM path emits).
- **The clang-free (`llbe`) lane.** `loup-llbe` selects and encodes the instructions itself: **T32** on `thumbv8.1m.main`, `thumbv8m.main` and `thumbv7em` (16-bit forms where they are free, 32-bit `.w` forms otherwise; local branches relaxed from the 16-bit forms to `b.w`/`b<cond>.w`; constants and symbol addresses through `movw`/`movt`, `R_ARM_THM_MOVW_ABS_NC` / `R_ARM_THM_MOVT_ABS`), and **Armv6-M Thumb-1** on `thumbv6m` (16-bit encodings plus `bl`, `dmb`/`dsb`/`isb`, `mrs`/`msr`: two-operand low-register data processing, no IT — conditional moves become short branches —, constants built a byte at a time and symbol addresses through `movs`/`lsls`/`adds` with `R_ARM_THM_ALU_ABS_G3`/`G2_NC`/`G1_NC`/`G0_NC`, as clang's `-mexecute-only` does, and far branches through `bl`). Neither mode uses a literal pool. Calls follow AAPCS (i64 arguments in even/odd register pairs, the rest on the stack, 8-aligned for i64) and are `bl` with `R_ARM_THM_CALL`; objects are `ELFCLASS32`, `EM_ARM`, EABI v5, `.rel`, every code symbol carries the Thumb bit, and `$t`/`$d` mapping symbols mark code and data. Constants go to `.rodata` and zero-initialized statics to `.bss`, so an image whose `.data` load address differs from its run address needs no copy loop for either. 64-bit multiply, divide/remainder and variable shifts are emitted inline on Thumb-2 (no EABI helper is linked); on `thumbv6m`, which has no hardware divide, integer division calls the runtime described next. **Floating point** (`float`/`float32`/`double`: `+ - * /` and `%`, every compare, int ↔ float and float ↔ float conversions) is **soft** on every Cortex-M arch: the backend calls an IEEE-754 binary32/binary64 runtime that it compiles itself and links **weak**, only as far as the program uses it — results are those of an Arm FPU with `FPSCR.DN = 0`, `FZ = 0`, round-to-nearest-even (NaN propagation, the default NaN, subnormals, and float → integer conversions that round toward zero and saturate, NaN → 0), bit-identical to the LLVM path running on the FPU. `$LOUP_ARM_FLOAT_ABI` selects the calling convention: `soft` (the default) and `softfp` pass floats in core registers; `hard` passes `float`/`double` arguments and results in `s0`–`s15`/`d0`–`d7` (AAPCS-VFP, with back-filling and the stack once they run out) and marks the object `EF_ARM_ABI_FLOAT_HARD`, so `llbe` and clang objects link with each other in either direction; the arithmetic stays soft (a unit using `hard` must still enable the FPU, as above). `softfp` and `hard` are refused on `thumbv6m` (no FPU), as on the LLVM path. The Loup `mem*` runtime is compiled through `loup-llbe` and linked when the program references it. Atomics lower to `LDAEX`/`STLEX` loops on Armv8-M/v8.1-M and to `DMB` + `LDREX`/`STREX` + `DMB` on v7E-M (8/16/32-bit); `irqSaveDisable`/`irqRestore` to PRIMASK exactly as on the LLVM path; inline `asm` is assembled as Thumb by the backend's own assembler — Thumb-1 encodings on `thumbv6m`, where a line with no Thumb-1 encoding is refused by name — and `.arm` / `.code 32` are refused (M-profile has no A32 state). The lane **refuses, by name**: everything the LLVM path refuses above (64-bit atomics, `synchronized`, every atomic on `thumbv6m`), and the IR shapes the Loup emitter never produces for a freestanding program — overflow intrinsics, `invoke`/exception handling, dynamic `alloca`, `va_arg` (its `phi` nodes are lowered). The x86_64 optimisation levels (§3-2.2) do not reach this lane yet: its code is the Tier-1 stream — a frame slot per value, with block-local values sharing slots, store-to-load forwarding and the zero-init prologue folded into a loop — and is about the size of clang `-O0`'s: on `tests/freestanding_qemu/cortex_m55` the functions' `.text` is 7.2 KB against clang `-O0`'s 7.1 KB for the same `.ll` (whose image also links the EABI helpers), the linked image 9.4 KB against the LLVM path's 15.9 KB (`thumbv6m`: 9.1 KB against 13.8 KB).
- **Vector table.** A vector table is written as `.long` directives in a `@callconv(naked)` function placed with `@section(".vectors")` (word 0 the initial stack pointer, word 1 the reset handler), and the linker script places that section at the table's address. Handler words must carry the **Thumb bit** (bit 0), or the core faults on exception entry. Write the bare symbol — **`.long handler`, never `.long handler+1`**: a Loup function on these targets is a Thumb `STT_FUNC`, and `ld.lld` resolves the `R_ARM_ABS32` against it with bit 0 already set, so `handler+1` produces an *even* (wrong) address. A handler referenced only from the table must be rooted like any other function (give it a `@section`), since `.long` is not a call. Installing the table at run time is a `Volatile[uint32]` write of its address to VTOR (`0xE000ED08`).

**Object container.** `llbe` emits an `ELFCLASS32` container for the 32-bit targets (`riscv32`, `arm`/`armv7`, the Cortex-M `thumb*` arches) and `ELFCLASS64` for the rest, selected from the arch. The relocation form follows the target's ABI rather than the container: `arm`/`armv7` and the `thumb*` arches emit `.rel` sections (`SHT_REL`, 8-byte entries, addend stored in the instruction) as the ARM ELF ABI requires, while `riscv32` and every 64-bit arch emit `.rela` (`SHT_RELA`). Objects for all arches link with `ld.lld`.

**Unsupported / experimental.** An **`xtensa`** instruction encoder exists in the toolchain source but is **not wired into the build driver**: `--arch xtensa` is not a supported value and no freestanding target triple selects it. It is not part of the supported surface and carries no compatibility guarantee.

*Specified pending implementation: the s390x freestanding target, its big-endian default, the PSW interrupt model (§3-3.13), the `Volatile[T]` endianness dimension (§3-3.9), the channel subsystem (§3-3.26), and the `[freestanding] endianness` manifest field (§3-3.21) are specified in this revision and tracked for implementation under `specs/1-bootstrap-5-mainframe-s390x/`.*

Output format defaults to ELF. Override with `--output-format elf|raw|pe|macho`.

**s390x addressing mode (AMODE-64 discipline).** s390x boots into **AMODE 64** in the `@entry`/`@naked` boot routine — the boot routine sets the PSW addressing-mode bits once (a single `SAM64`-class `asm` in the already-`@unsafe` `@naked` boot function) — and uses **flat 64-bit addresses** thereafter. The 24/31/64-bit addressing modes select address *truncation*, not a distinct *kind* of address; a sub-64 AMODE does not create a new address category, only a truncated one, which is forbidden post-boot. Consequently **no addressing-mode dimension is added to address types**: the flat-64 `@repr(transparent)` newtype model that distinguishes physical from virtual addresses (invariant I2) holds unchanged. A defense-in-depth freestanding lint `E_S390X_AMODE_SWITCH` (§3-3.22) MAY flag a mode-changing `SAM24`/`SAM31`/`BASSM`/`BSM` appearing in any `asm` block **outside** the designated `@section(".text.boot")` boot routine.

The freestanding feature-strip table (§3-3.3) and the cross-mode import barrier defined below (invariant I10) apply to `s390x` **unchanged** — they are arch-agnostic. No managed or native module may enter an s390x image; `E_FREESTANDING_IMPORT_NATIVE`, `E_FREESTANDING_IMPORT_MANAGED`, and `E_NATIVE_IMPORT_FREESTANDING` are emitted exactly as on the other arches.

Every source file in a freestanding compilation unit MUST declare `@mode(freestanding)` or `@mode(portable)` as its first active token (§1-2.5); a module of a portable package may take `portable` from its package's manifest instead (§1-13.9). A portable module is compiled into the freestanding unit in that unit's mode (§1-2.4.7).

Compiler's rule (nothing is dropped silently). An operation a freestanding emitter cannot lower — an instruction it has no lowering for, a field read or write outside every struct layout, a constant with no native representation, the construction of a non-struct type — fails the build (`E-BUILD-NATIVE`, naming it) on every lane, as it does on the managed lanes; it is never emitted as a comment with its result left at 0. The one exemption is constructing a built-in exception, whose only consumer on a lane without unwinding is the `throw` that follows: a fault stop.

Compiler's rule (a builtin receiver never dispatches to a user method). A method call whose receiver is statically a builtin value — a list, dict, string, tuple, `char` or float, by its type — is a call of that type's intrinsic method (Core §1-4.1.5), on every native lane, managed or freestanding. It is never sent through the type-id dispatch thunk (`__vdisp_<method>`) because some user class happens to declare a method of the same name: the thunk reads a type id out of the value's own bytes, matches no class, and its result is 0, so `xs.clear()` with a user `clear()` anywhere in the program was a silent no-op on the self-hosted lane. A builtin method a native lane does not lower fails the build (`E-BUILD-NATIVE` on Stage0, `E-CODEGEN-UNHANDLED-METHOD` on loup-llvm), as above. An `int`, `bool`, class-, interface- or untyped receiver keeps the thunk (an interface-typed value or an untyped element needs it). Every list and dict intrinsic of §1-4.1.5 that a native lane lowers is one runtime call there; `clear()` is `__loup_runtime_list_clear` / `__loup_runtime_dict_clear` (in place; the buffer is kept; elements are not released, the same policy as `remove`, so a borrowed element read before the clear stays valid).

Compiler's rule (a class-typed element dispatches virtually). An element of a `list[C]`, or a value of a `dict[K, C]`, with `C` a class, is a `C` on every native lane wherever the collection comes from — a parameter, a field, an annotated or inferred binding, a call result: a method called on it (`cells[0].name()`, `for (c in cells) c.name()`, `d["a"].name()`) dispatches on the element's runtime class, so a subclass override runs, exactly as for a `C`-typed binding. (Row INHMEM-1. Stage0's native build did not type a class element of a list or dict PARAMETER, so the call bound `View.name` statically and printed the base method's result for a `Label`; the self-hosted native build had the same defect for a dict parameter's value.)

Compiler's rule (a receiver whose class is unknown dispatches on its runtime class). A method call whose receiver's class a native emitter cannot establish dispatches on what the receiver is at run time; it is never bound to a class by its name. A receiver that is an `Any` word (an `Any`, a union with a non-object member) follows §3-2.4 *Compiler's rule (methods on an `Any` receiver)*; any other (an untyped word, a function value's untyped result, an untyped collection element) dispatches on the receiver's runtime type id over the REFERENCE classes whose chain defines the method, and over a value type (a struct, an exception, a value class) that also defines it by the id in that block's trailing type-id slot, classified by the ARC-object registry (§3-2.4 *field reads through untyped references* and *no name-based guess across value and reference types*). `LOUP_FIELD_GUESS_AUDIT=1` reports each such call whose candidates are unrelated class families (no common ancestor declaring the method and no common interface) — the shape a LOST static type takes — without failing the build, since an `Any` receiver is legitimately dynamic. (Row INHMEM-1. Not yet: outside an `Any` receiver, whose result is boxed by the called type's declared result, the RESULT of such a call is an untyped word, so a `float` or `string` result can be mis-read downstream — on both native lanes `a.size()` on an untyped word holding a class whose `size(): float` printed the f64 bit pattern.)

Compiler's rule (an interface call dispatches over every implementer — round 4 X). A method call through an interface-typed receiver (`@ifacecall:<I>:<m>`) dispatches on the receiver's runtime type id over EVERY concrete type that is an `I` (core §1-11.1: the type or an ancestor implements `I` or an interface extending it), each case calling the nearest definition of `m` up that type's own superclass chain, so an inherited implementation and a subclass override both run. Dead-code elimination keeps every `C.m` of the called name, as for an untyped call. On the freestanding lanes, a case whose target's sret ABI (§3-2.6.1) differs from the rest of the dispatch group is not called with the group's argument list; it is a dispatch miss (below) instead. Both native drivers emit the cases in ascending type-id order.

Compiler's rule (a dispatch miss is a stop — round 4 Y). A runtime type-id switch — an interface call, a call on a receiver whose class is unknown (Stage0's inline switch, the `__vdisp_<method>_<arity>` thunk) — whose receiver's type id matches no case never answers 0 and carries on (a call on an `Any` receiver is not such a switch: a value with no such method raises the catchable `TypeError` of §3-2.4 *Compiler's rule (methods on an `Any` receiver)*). On a hosted (managed) build it is the §1-18.4 no-handler stop: `RuntimeError: no implementation of method `<m>` for the receiver's runtime type` (for an interface call, `no implementation of `<I>.<m>` for the receiver's runtime type`) on standard error and exit status 1; it is not catchable. On a freestanding build it is the fault stop (`@llvm.trap()`, or the halt loop under `panic = "halt"`, §3-3.6). `finalize` dispatch (`del`, §1-6.11) keeps its no-op default: a class whose chain declares no `finalize` has nothing to run. A typed receiver's switch (its candidates are the static class and its subclasses) keeps its fall-through.

**Cross-mode import rules.** `@mode(freestanding)` files may import:

- Other `@mode(freestanding)` files in the same compilation unit.
- `extern native` C libraries declared with `extern native "libname"` — these are linked directly and require no Loup runtime.
- `@mode(portable)` modules (§1-2.4.7) — checked against the PORTABLE-SUBSET and emitted by the freestanding back end.

`@mode(freestanding)` files may NOT import:

- `@mode(host.native)` modules — native modules require the ARC runtime, which is not available in freestanding mode (`E_FREESTANDING_IMPORT_NATIVE`).
- `@mode(web.compiled)` or `@mode(host.scripted)` modules — these require the managed Wasm runtime or the JIT runtime (`E_FREESTANDING_IMPORT_MANAGED`).
- Any standard library module not in the permitted subset (§3-3.20) (`E_FREESTANDING_MODULE`).

Conversely, `@mode(host.native)` files may NOT import `@mode(freestanding)` modules — freestanding modules lack an ARC runtime and expose raw pointer APIs that are incompatible with ARC memory management (`E_NATIVE_IMPORT_FREESTANDING`).

**Portable modules (ruling PORT-1).** A `@mode(portable)` module may be imported from every mode: a `host.scripted`, `host.dual`, `host.native` or `freestanding` importer compiles it in its own mode (§1-2.4.7). In v1 a `web.scripted` or `web.compiled` importer is refused (`E_PORTABLE_IMPORTER`): a lane limit, because PSTORE and the toolkit are not built on the Wasm lanes, not a rule of the mode. A portable module may import only `@mode(portable)` modules — a user module, a package module and a standard-library module alike (`E_PORTABLE_IMPORT`; the portable standard-library modules are listed in §1-2.4.7); the prelude is implicit. The barrier is judged on each module's own mode, on both resolvers, and a module's `@mode` takes precedence over its package's manifest.

### §3-3.3 Stripped Features

| Feature | Error code | Reason |
|---|---|---|
| ARC runtime (`weak`, retain/release) | `E_FREESTANDING_ARC` | No runtime library |
| `async`/`await`, `Task[T]`, `spawn` | `E_FREESTANDING_ASYNC` | No event loop |
| `throw` / `catch (T as e)` | `E_FREESTANDING_EXCEPTIONS` | No `.eh_frame`; unwinding is fatal. ENFORCED by the checker on both lanes (loup#364 — the rule was specified from the start and enforced by neither until then). A `try` block restricted to `catch Err(e)` arms and `finally` IS permitted: it carries no exception machinery, desugaring to a `match` plus a labelled escape (§1-5.10, §1-6.9), and is what makes structured error handling available in the mode at all. |
| Template fences (HTML, CSS, etc.) | `E_FREESTANDING_FENCE` | No rendering pipeline |
| Reactive UI (`ui.*`) | `E_FREESTANDING_UI` | No `ui` runtime (the stdlib `ui` module and `runtime.ui`). The Loup Common UI packages are `@mode(portable)` modules (§1-2.4.7) and are importable (ruling FS-UI) |
| `core.reflect` / `core.inspect` | `E_FREESTANDING_REFLECT` | Requires runtime metadata |
| `dynamic class` / `!{}` | `E_FREESTANDING_DYNAMIC` | Requires runtime type table |
| `portal` statements | `E_FREESTANDING_PORTAL` (release) / `E_FREESTANDING_PORTAL_NO_CHANNEL` (debug, unconfigured) | Release builds: stripped unconditionally. `--debug` builds: permitted when at least one of `@debug_control_channel`, `@debug_trace_channel`, or `portal_ring_size > 0` is configured (§3-3.25). Otherwise `E_FREESTANDING_PORTAL_NO_CHANNEL`. Condition expressions always prohibited (`E_FREESTANDING_PORTAL_CONDITION`). |
| `bigint` | `E_FREESTANDING_RUNTIME` | Requires GMP-compatible multi-precision library |
| `decimal` | `E_FREESTANDING_RUNTIME` | Requires IEEE 754-2019 decimal128 library |
| Complex transcendental functions (`complex.abs`, `complex.arg`, `complex.polar`, `complex.fromPolar`, and the `core.complex` `cexp`/`clog`/`csqrt`/trig/hyperbolic family — §1-4.1.6, §21.9) | `E_FREESTANDING_COMPLEX_TRANSCENDENTAL` | Requires `libm`-equivalent math runtime; bare arithmetic (`+`, `-`, `*`, `/`, `re()`, `im()`, `conj()`, `norm()`) on `complex32`/`complex64` is permitted |
| Class construction without `@allocator` | `E_FREESTANDING_CLASS_NO_ALLOC` | No implicit heap |

Panics route through the `--panic` policy (§3-3.6) since exceptions are unavailable.

### §3-3.4 Available Features

All native-mode features not dependent on the ARC runtime, async executor, exceptions, or standard library. In particular:

- `reads`/`edits`/`takes`/`shares` verbs, `modifier`, `safe {}` / `safe func`, `distinct()` in `requires` clauses
- `unique let`/`unique var`/`unique class`
- `borrow`/`excl borrow`/`borrow[~name]`/`lifetime ~name`/`noescape fn`
- `unowned[~name]`, `@unsafe(reason)`, `Sendable`
- `extern native`, `MaybeUninit[T]`, `reinterpret[T, U]`
- Overflow arithmetic methods (§3-3.19)
- `native.mem`, `native.simd`, `native.atomic` (including `hwFence` and `MemoryOrder`), `native.ffi`, `core.math`, `core.text`
- `native.dma` — DMA buffer ownership (§3-3.20)
- `native.mpu` — MPU stack-guard installation (§3-3.20)
- `size_of[T]()`, `align_of[T]()` — compile-time layout queries (§3-3.4.1)
- Const evaluation — `const` bindings, `const func`, and `if const` (core §1-6.2, §1-7.1, §1-6.3). Interpretation only, resolved against the build target, fuel- and allocation-bounded; it runs inside the compiler and produces no code, so it is available in freestanding exactly as everywhere else. Its diagnostics are in qualified scope by the qualification plan's §3.2(3)
- The bare-name freestanding compiler intrinsics — `addressOf`, the `atomic*U64`/`atomic*U32` + `atomicFence` family, `makeBufferU64`/`makeBufferU32`, `bufGet*`/`bufSet*` (including the volatile byte forms), and `irqSaveDisable`/`irqRestore` (§3-3.4.2)
- `interface` declarations, `implements`, interface-typed values, and dynamic dispatch — no allocator required (§3-3.4.3)
- Generics — generic functions, structs, and classes, monomorphized at compile time, including explicit call-site type arguments (§3-3.4.3)
- `reinterpretChecked[T, U]` — checked type reinterpretation (§3-3.18)
- `PartialInit[T]` — field-tracked struct initialization (§3-3.17a)
- `@interruptSafe` annotation + `InterruptGuard` — interrupt-context safety (§3-3.24)
- `portal` statements — freestanding debug portal service (§3-3.25, `--debug` builds only)
- `debug.freestanding` — debug service startup and polling (§3-3.25, `--debug` builds only)
- `complex32` / `complex64` — basic arithmetic, comparison, `re()`, `im()`, `conj()`, `norm()` (Language Reference §1-4.1.6); transcendental functions are stripped per §3-3.3
- `array[T, rank]` (Language Reference §1-4.10) — multi-dimensional array primitive. Stack-allocated arrays with statically-known shape require no allocator; heap-allocated arrays require an `@allocator` to be registered (§3-3.16). Slicing (Language Reference §1-5.9) and whole-array operations are available unconditionally
- `for concurrent` (Language Reference §2-1.11) — sequential strategy is the default; `@strategy(simd)` is available; `@strategy(threadPool)` requires a user-supplied scheduler registered via `@scheduler` (§3-3.16a)
  - *Compiler's rule (until a native lowering exists).* No native backend lowers `for concurrent` yet; every native and freestanding lane refuses a program that contains one, naming the construct (`E-BUILD-NATIVE`), instead of building it without the loop. The interpreters run it.
- `@scheduler` (§3-3.16a) — registers a user-supplied scheduler for `@strategy(threadPool)` dispatch on `for concurrent` loops
- `core.fpenv` (Language Reference §1-4.1.7) — full active surface (rounding-mode control, exception flag tracking, signaling NaN production)
- `string` read-only (v1.21, row v21.portable.11) — a string is a borrowed slice `{ptr, len}`: literals, parameters, `length()` / `len()`, `for` iteration over its BYTES, the byte and scalar reads `byteLength()`, `byteAt(i)`, `scalarAt(i)` and `char`'s `toInt()` (Language Reference §1-4.1.5; an out-of-range `byteAt` / `scalarAt` is the §3-3.6 bounds panic, `string index out of range`, under every `bounds` setting), and `==`, `!=`, `<`, `>`, `<=`, `>=`, `compareTo` and string literal `match` patterns BY CONTENT (byte-wise, as on every other lane, Language Reference §1-5.1). Operations that allocate a new string (concatenation, interpolation, `format`) are outside this read-only set.
  - *Compiler's rule (until a freestanding lowering exists).* A string method no freestanding emitter lowers (`contains`, `startsWith`, `indexOf`, `slice`, `split`, `trim`, `toUpperCase`, `toInt`, … — the list is in `specs/1-bootstrap-3-mode-portable/design.md`, Layer 5) fails the build naming the method (`E-CODEGEN-UNHANDLED-METHOD`) on every freestanding route, instead of building a program that reads 0 or traps.

Plus the hardware-access features described in §3-3.5–§3-3.24 and the freestanding debug service in §3-3.25.

### §3-3.4.1 `size_of[T]()` and `align_of[T]()` — Compile-Time Layout Queries

*(This section is normative. Applies in **every mode** — see the third rule below; the
former "freestanding and host.native" scope was a runtime-availability statement applied
to a compile-time query, and LCP-3 removed it.)*

`size_of[T]()` and `align_of[T]()` are compile-time built-in generic expressions that return the size and minimum alignment of type `T` in bytes, respectively. Both are evaluated entirely at compile time and produce a `uint64` constant; they have zero runtime cost and cannot be used on unsized types.

```loup
@mode(freestanding)

let sz  = size_of[PageTable]()      # uint64: 4096 (512 × 8-byte entries)
let al  = align_of[PageTable]()     # uint64: 4096 (from @align(4096))
let u32 = size_of[uint32]()         # uint64: 4
let ptr = size_of[uint]()           # uint64: 8 (on 64-bit targets)
```

**Rules:**
- `T` must be a type with a statically-known, finite size (`E_SIZE_OF_UNSIZED`). `Any`, open-ended union types, and function types are unsized.
- `T` must be a primitive, `@repr(C)` struct, enum, or tuple. Using `size_of` on a managed class type is `E_SIZE_OF_CLASS`.
- Both built-ins are valid in **every mode**. The v1.20 text restricted them to
  `@mode(host.native)` and `@mode(freestanding)`; LCP-3 lifted that inside
  const contexts, and the implementation lifts it entirely. The restriction is
  a statement about RUNTIME availability, and these queries have no runtime
  component: they fold to a `uint64` literal against the BUILD TARGET during
  lowering, before the type checker runs, on every lane. Applying a
  runtime-availability rule to a compile-time query is the category error
  LCP-3's own rationale names. The surviving half was also unenforceable
  identically on the two front ends — Stage0's lowerer learns the mode from the
  build configuration and the self-hosted one from the `@mode` annotation it
  has lowered so far — and a rule two compilers enforce from different inputs
  is worse than no rule.
- The `~` sigil used in lifetime labels is not permitted in the type argument.

`size_of[T]()` and `align_of[T]()` are bare CONTEXTUAL expressions: the name is a layout query only immediately before `[`, so a program that already binds or calls something named `size_of` is unaffected. No import is required in any mode.

**Layout rules.** A scalar's alignment is its own size (`bool`/`byte`/`int8`/`uint8` 1, `int16`/`uint16` 2, `int32`/`uint32`/`float32`/`char` 4, `int64`/`uint64`/`float`/`float64` 8, `int`/`uint` the target's pointer width). A `@repr(C)` struct or class lays its instance fields out in declaration order, each at the next multiple of its own alignment, with the aggregate rounded up to the widest alignment it contains and never smaller than one byte; `@repr(packed)` drops both roundings; `@align(N)` raises the aggregate's alignment. A tuple lays out as a `@repr(C)` struct of its elements. `buffer[T, N]` (§3-3.17b) is `N` elements of `T`. A fieldless enum is its tag, one pointer-width word. These are the same rules the code generators already use (`StructLayouts`, `build_struct_layouts`) — a layout query that disagreed with the code generator would be a number that looks authoritative and describes a different object.



### §3-3.4.2 Freestanding Compiler Intrinsics

*(This section is normative. Applies to `@mode(freestanding)`.)*

In `@mode(freestanding)` the compiler recognises a fixed family of **bare-name intrinsics**: functions that are callable without any import or declaration and lower directly to machine operations. They are resolved as builtins only in freestanding mode; in every other mode the names are ordinary identifiers. The family is exactly:

| Group | Intrinsics |
| --- | --- |
| Address-of | `addressOf` |
| Atomics | `atomicLoadU64`, `atomicStoreU64`, `atomicFetchAddU64`, `atomicFetchSubU64`, `atomicCompareExchangeU64`, `atomicLoadU32`, `atomicStoreU32`, `atomicFetchAddU32`, `atomicFetchSubU32`, `atomicCompareExchangeU32`, `atomicFence` |
| Fixed buffers | `makeBufferU64`, `makeBufferU32`, `bufGetU64`, `bufSetU64`, `bufGetU32`, `bufSetU32`, `bufGetU8`, `bufSetU8` |
| Volatile byte access (MMIO) | `bufGetU8Vol`, `bufSetU8Vol` |
| Interrupt mask | `irqSaveDisable`, `irqRestore` |

These intrinsics are the **primitive layer** beneath the typed freestanding surfaces: `buffer[T, N]` (§3-3.17b) lowers to the fixed-buffer intrinsics, `native.atomic` (§3-3.20) to the atomic intrinsics, and `InterruptGuard` (§3-3.24.2) to the interrupt-mask intrinsics. New code should prefer the typed surfaces where they fit; the bare intrinsics remain normative for code that works with raw addresses (fixed scratch pages, lock words inside hand-rolled synchronization, MMIO).

**`addressOf(g): uint`** — takes exactly one argument, a bare identifier naming a **module-level global** (`var` or `let`) of the current module, and yields the address of the global's storage slot as a `uint`. The address is stable for the lifetime of the program (module-level globals are single persistent statics, §1-13), making it a valid operand for the atomic intrinsics and for `buffer` overlays. For a global of **class type**, the result is the object reference itself rather than the slot address. Any other operand form (a local, a field access, an arbitrary expression) is not accepted — the name does not resolve as an intrinsic call.

**`addressOf(f): uint` — a function's entry address (compiler's rule).** The operand may also be a bare identifier naming a **module-level function** of the current module; the result is the function's entry address, a C function pointer that native code may store and call — a C callback (`qsort`'s comparator), an Objective-C method implementation (`class_addMethod`), an interrupt vector entry. This form is available in `@mode(host.native)` as well as `@mode(freestanding)`: in `host.native` `addressOf` resolves as a builtin (the rest of this table's family stays freestanding-only), and its operand must name a module-level function, otherwise `E_ADDRESSOF_OPERAND`. It is not available in `host.dual`, whose modules also run interpreted, where a C function pointer means nothing. The function's C signature has each integer-like parameter and the result as a 64-bit word (`int`, `uint`, pointers, `bool`, and the narrow integer types `int32`, `uint8`, … widened), and each `float` / `float32` parameter or result as a C `double` / `float`, so a C caller with the matching prototype calls it directly. The native lanes pass every Loup value as a word internally, a `float` as its bit pattern, so a function with a floating-point parameter or result is handed out through a **C-ABI wrapper** `@<function>__cabi` that both drivers emit beside it: the wrapper takes the C types (on arm64 and x86-64 the doubles arrive in the FP registers), converts each floating-point argument to the word form (`float32` widened to `double` first), calls `@<function>`, and converts the result back (`fptrunc` for `float32`). The text of the wrapper is the same from both drivers. A function with only integer-like parameters and an integer-like or `void` result needs no wrapper. A function taken this way is kept by dead-code elimination like a direct callee. A callback runs on the calling thread with the program's runtime; an exception it throws must be caught inside it (it cannot unwind through C frames). Both native drivers (Stage0 and the self-hosted `loup-llvm`) emit it as `ptrtoint ptr @<function> to i64`, or `ptrtoint ptr @<function>__cabi to i64` for a wrapped function (golden `tests/programs/codegen/ffi_float_callback.lphc`).

**Atomic intrinsics.** All atomics operate on a naturally-aligned memory cell addressed by a `uint` (8-byte cells for the `U64` forms, 4-byte for `U32`; misaligned addresses are undefined behavior). The `U32` forms zero-extend their results to `uint64`.

```loup
atomicLoadU64(addr: uint, order: int): uint64                 # atomic load
atomicStoreU64(addr: uint, val: uint64, order: int): void     # atomic store
atomicFetchAddU64(addr: uint, delta: uint64, order: int): uint64   # returns the OLD value
atomicFetchSubU64(addr: uint, delta: uint64, order: int): uint64   # returns the OLD value
atomicCompareExchangeU64(addr: uint, expected: uint64,
                         desired: uint64, order: int): uint64 # strong CAS → 1 (success) / 0
atomicFence(order: int): void                                 # thread fence
```

- `atomicCompareExchangeU64`/`U32` is a **strong** compare-exchange: it stores `desired` iff the cell holds `expected`, and evaluates to `1` on success, `0` on failure — it does **not** return the old value. Success and failure use the same ordering.
  - **The flag is not the observed value, and testing it as one fails silently.** Writing `if (atomicCompareExchangeU64(a, cur, next, 5) == cur)` — the shape a "CAS returns the old value" habit produces — misreads the result, and *how* it misreads depends on `cur`:

    | `cur` | CAS succeeded | CAS failed |
    |---|---|---|
    | `0` | reads as **failure** | reads as **success** |
    | `1` | reads as success ✓ | reads as failure ✓ |
    | anything else | reads as **failure** | reads as failure ✓ |

    So the bug hides twice over: at `cur == 1` the test is accidentally correct, and for a general `cur` (a bitmask, a generation counter) every *success* is read as a failure while failures still read correctly — a permanent false negative that leaves the store applied with the caller believing it never happened. Nothing type-checks differently and nothing traps. Compare against `1`, or use the result directly as a condition.
  - **Not the same operation as `atomicCompareExchange` (§2-2.4).** The managed `SharedArray[T]` method of that name returns a `(bool, int)` pair — flag *and* observed value — over an element **index**. The freestanding intrinsics here take a byte **address**, carry an explicit `order`, and return the flag alone. Similar names, different surfaces; a search for "atomicCompareExchange" finds the managed one first.
- The `order` parameter uses the C11/GCC `__ATOMIC_*` numbering: `0` relaxed, `1` consume, `2` acquire, `3` release, `4` acq_rel, `5` seq_cst. A backend MAY strengthen the requested ordering (the self-hosted LLVM backend currently performs every atomic operation, other than `atomicFence`, with sequentially-consistent ordering regardless of `order`; the Stage0 C backend honors the argument). Portable code SHOULD pass `5` (seq_cst) unless a weaker ordering has been deliberately chosen and validated against the target backend.
- **Shadowing:** a user-defined module function with the same name as an atomic intrinsic shadows the intrinsic within that module. The other intrinsic groups are not shadowable.

**Fixed-buffer intrinsics.** `makeBufferU64(N)` / `makeBufferU32(N)` reserve a static, zero-initialized block of `N` 8-byte (resp. 4-byte) elements and evaluate to its base address as a `uint`; `N` must be an integer literal (an `as`-cast of a literal is looked through). `bufGetU64(base: uint, i: int): uint64` / `bufSetU64(base: uint, i: int, v: uint64): void` (and the `U32`/`U8` forms) read and write element `i` of the block at `base` with **element-scaled indexing** — `bufGetU32(base, i)` accesses `((uint32*)base)[i]`, so `i` is an element index, **not a byte offset** (for the `U8` forms the element is one byte, so index and byte offset coincide). Gets zero-extend to `uint64`; sets evaluate to `0` where a value is required. Indices are unchecked: an out-of-range index is undefined behavior. `buffer[T, N]` (§3-3.17b) is the typed, constant-index-checked surface over this family and should be preferred where the element count is statically known.

**Volatile byte access.** `bufGetU8Vol(base: uint, i: int): uint64` / `bufSetU8Vol(base: uint, i: int, v: uint64): void` are the volatile forms of the byte accessors: each call performs exactly one 1-byte load/store that the compiler never elides, merges, or reorders relative to other volatile accesses. They exist for byte-wide device registers (UART data/status ports and similar) and complement `Volatile[T]` (§3-3.9).

**Interrupt-mask intrinsics.** `irqSaveDisable(): uint64` saves the current interrupt-enable state and disables interrupts, returning an opaque restore token; bit `0x200` of the token is normalised to mean "interrupts were enabled at save time" on every architecture. `irqRestore(token: uint64): void` reinstates exactly the saved state. The per-architecture lowering (x86_64 `pushfq`/`cli`/`popfq`, AArch64 DAIF, Cortex-M PRIMASK `mrs`/`cpsid i`/`cpsie i`, s390x `stnsm`/`ssm`) is fixed by the backend. These are the primitives from which `InterruptGuard` (§3-3.24.2) is built; kernel code that needs an explicit save/restore pair (e.g. across a hand-rolled spinlock's IRQ-off acquire) may call them directly.

### §3-3.4.3 Interfaces and Generics in Freestanding

*(This section is normative. Applies to `@mode(freestanding)`.)*

**Interfaces.** `interface` declarations (§1-11), `implements` on structs and classes, interface-typed values (upcast by assignment, e.g. `let i: Cpu = c;`), and dynamic dispatch through an interface-typed value are all available in `@mode(freestanding)`, with **no allocator requirement** — declaring or dispatching through an interface never allocates. Restrictions:

- **Dispatch model.** An interface method call on an interface-typed value lowers to a **static type-id dispatch**: the compiler enumerates the closed set of implementing types in the program, reads the receiver's type-id slot, and branches to the implementing method directly. There is no heap-allocated vtable object, no ARC interaction, and no runtime type registration; the dispatch table is closed at compile time (a type that does not `implements` the interface at compile time can never be dispatched to).
- **Return types.** Interface methods may return any freestanding-legal type, including structs (returned by value) and `string`. A `string` returned through an interface method is lowered as a self-contained `{ptr, len}` slice descriptor with no runtime-support symbol, consistent with the freestanding string model (§3-3.20) and position-independent images.
- Default method bodies, `Any`-typed dispatch, and reflection over interfaces are not available (per §3-3.3).

**Generics.** Generic functions, generic structs, and generic classes (§1-12) are available in `@mode(freestanding)` and are **monomorphized**: every instantiation used by the program is compiled to its own concrete code and layout at compile time, and no runtime representation of a type parameter exists. This includes:

- **Explicit call-site type arguments** — `f[T](x)`, `obj.m[T]()` (§1-12, §1-19.5) — the usual way to instantiate a phantom-typed API (e.g. a capability `mintCap[uint64](…)`).
- **Static methods on a generic instantiation** — `Type[T].method(…)` (e.g. a `DmaBuffer[T].alloc(...)` factory).
- Generic type parameters in field types, method signatures, and method bodies of generic classes and structs, including `unique class` generics.

Because monomorphization is per-instantiation, unconstrained generic code that would require a runtime type witness (boxing into `Any`, reflection) is rejected under the §3-3.3 stripped-feature rules rather than by a generics-specific restriction.

### §3-3.5 `@entry` — Bare Entry Point

`@entry` marks the single function the linker uses as the binary entry symbol. The function runs before any C runtime initialization. It must be a MODULE-LEVEL function: on a method, a field, a type declaration or a function declared in a block it is `E_ANNOTATION_TARGET` (§1-8.8, loup#752).

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
- Valid only in `@mode(freestanding)` (`E_ENTRY_NOT_FREESTANDING`) — on every lane, `host.native` included (ruling ENTRY-2, loup#749). A `host.native` program's process entry (the libOS seams' `_start`) is an exported `@callconv(naked)` function with a `@section`, which the link step names as its entry symbol; it carries no `@entry`.
- **The entry function is the reachability root.** A freestanding image keeps the `@entry` function, every `@section` function, and what they reach; nothing else. So failing to recognise the entry does not merely misplace it — the whole program is dropped.
- **Layout is not syntax.** Whether `@entry`, `@section(…)`, `@naked` / `@callconv(naked)` (and any other annotation) apply to a declaration SHALL NOT depend on how they are laid out: one per line or several on a line, in any order, with comments between them and the declaration, with the declaration on the annotations' own line, and whatever run of modifiers (`pub`, `safe`, `modifier`, …) precedes `func`. (loup#463 — root discovery matched line PREFIXES, so `@unsafe("r") @naked @entry @section(".text.boot")` on one line rooted nothing, while the same annotations with `@entry` first worked; `@section` on a `safe func` was missed the same way.)
- **A missing entry symbol is a build error** (`E-BUILD-NO-ENTRY`). Linkers only warn ("cannot find entry symbol `_start`"), link an image with no entry point, and exit 0; the toolchain SHALL fail the build and remove the output.

`@entry` is **independent of** `@naked` / `@callconv(naked)` (§3-3.14) and does **not** imply it: an `@entry` function without a naked annotation receives the ordinary prologue/epilogue. An entry point that runs before a valid stack is established (so the prologue cannot run) must add `@naked`/`@callconv(naked)` explicitly — as in the example above — alongside the `@unsafe("naked: …")` that naked functions require. Bootloaders that hand `_start` a valid stack (e.g. Multiboot) may use a plain `@entry` function.

### §3-3.6 `@panic_handler` and Panic Policy

**Panic sources:** bounds check failures, `--overflow=trap` violations, explicit `panic("msg")`, and `Option[T].unwrap()` on `None`.

**`PanicSource` — panic discriminant (normative).** The `@panic_handler` receives a `PanicSource` enum value as an additional parameter (appended to the signature) when `--panic=custom` is set, allowing handlers to distinguish the source of the panic:

```loup
enum PanicSource {
  Assertion;        # explicit panic("msg") or assert_eq! failure
  BoundsCheck;      # array/slice out-of-bounds access
  OverflowTrap;     # integer overflow with --overflow=trap
  UnwrapNone;       # Option[T].unwrap() on None
  StackOverflow;    # MPU guard-page fault (via native.mpu.installStackGuard)
  Unknown;          # unclassified runtime fault
  Unreachable;      # a reached `unreachable` expression
}
```

**`Unreachable` is distinct from `Assertion`, and appended rather than inserted** (DV-5, ruled 2026-09-08). The two say different things: `Assertion` reports that a check the programmer wrote found a condition they anticipated, which a handler may be able to recover from; `Unreachable` reports that the program entered a state the programmer asserted could not exist, so the invariants are broken and continuing is unsound. A handler has a reason to route them differently, and folding them destroys that information irreversibly — a variant a handler ignores costs nothing, a distinction never made cannot be recovered.

**The variant order is ABI.** The discriminant is passed to the handler as its fourth argument, so a variant SHALL be appended to this list, never inserted: renumbering an existing variant silently changes what every deployed handler sees.

`@panic_handler` with `PanicSource` has the extended signature:
`(msg: string, file: string, line: int, source: PanicSource): noreturn`.
The compiler selects the correct signature variant based on the presence of the `source` parameter; both forms are valid.

Compiler's rule (the panic's source location). A panic the compiler lowers — a `bounds = "trap"` guard (§3-3.17b), a reached `unreachable` — passes the handler the location of the construct that panicked: `file` is that source file's path RELATIVE TO THE ENTRY FILE'S DIRECTORY (both paths symlink-resolved, `/`-separated: `main.lpfree`, `drv/table.lpfree`, `../lib/util.lpfree`) and `line` is the 1-based line of the construct's first byte. A lambda's site is located in the file of the declaration that contains it. Code from a standard-library module carries no source attribution and passes `""` and `0`. Every lane passes the same bytes (row FILELINE-1).

**`--panic` build flag:**

| Flag | Behaviour |
|---|---|
| `--panic=halt` | Default. Disables interrupts; executes an infinite `hlt` loop. The `@panic_handler` is not called. |
| `--panic=abort` | Triggers a CPU fault (x86_64: `ud2`). The `@panic_handler` is not called. |
| `--panic=custom` | Calls the `@panic_handler` function, then the fault of `abort` (should the handler return). |

**Compiler's rule (PANIC-1).** The policy is selected by `[build] panic` (§3-3.21): `"halt"`, `"abort"` or `"custom"`, and an ABSENT key is `"halt"`. Any other spelling fails the build with `E-BUILD-MANIFEST` (`[build] panic = "<v>" is not a known value (expected "halt", "abort", or "custom")`), on every driver. The policy decides two things at every panic STOP the compiler lowers — a failed `[freestanding] bounds = "trap"` guard (§3-3.17b), a reached `unreachable`, an explicit `panic(…)` (self-hosted lanes), and every other fault stop of a freestanding program (an `unwrap` of `None`, an uncaught `throw`):

- **Whether the handler is called.** Only `custom` calls the `@panic_handler` (with the site's message, `file`, `line` and, for the extended signature, its `PanicSource`). Under `halt` and `abort` the site is the stop alone, so neither needs a handler: a `bounds = "trap"` guard is emitted whether or not the program declares one, and a declared handler that nothing else calls is dead code (the image does not contain it). Under `custom`, an IMAGE whose linked program declares no handler fails to build (`E_PANIC_HANDLER_MISSING`, below), and a handler declared under `halt` or `abort` is reported as dead code (`W_PANIC_HANDLER_UNUSED`).
- **What the stop is.** `custom` and `abort` stop with the architecture's trap instruction (`@llvm.trap()` on the LLVM lanes — x86 `ud2`, AArch64 `brk #0x1`, Arm `udf`, RISC-V `unimp`, …; `__builtin_trap()` on the C backend). `halt` disables interrupts and parks the core in a wait-for-interrupt loop it never leaves, emitted as one inline-assembly sequence (a numeric local label, so a duplicated copy stays correct):

| Arch | `halt` sequence |
|---|---|
| `x86_64`, `x86` | `cli`; `1: hlt; jmp 1b` |
| `aarch64` | `msr daifset, #0xf`; `1: wfi; b 1b` |
| `armv7` / `arm` (A-profile) | `cpsid if`; `1: wfi; b 1b` |
| `thumb*` (Cortex-M) | `cpsid i`; `1: wfi; b 1b` |
| `riscv64`, `riscv32` | `csrci mstatus, 8`; `1: wfi; j 1b` (M-mode, the privilege a freestanding RISC-V image runs at — the `@interrupt` entries of §3-3.13 return with `mret` for the same reason) |
| `mips64`, `mips64el` | `di`; `1: wait; b 1b; nop` |
| `loongarch64` | CRMD.IE cleared with `csrxchg` (mask in `$t0`); `1: idle 0; b 1b` |
| `powerpc64`, `powerpc64le` | `li 0, 0; mtmsrd 0, 1` (MSR[EE] off); `1: b 1b` |
| `s390x` | `stnsm 16(%r15), 0xfc` (I/O and external interrupts masked; the old mask byte goes to the frame's callee save area); `1: j 1b` |

A woken `wfi` / `wait` (an interrupt that is pending but masked) loops back, so the core never proceeds past the stop. The stop is the same on every lane: Stage0's freestanding LLVM and C backends and the self-hosted `loup-llvm` (both the per-module and the `--merged` route; `loup-llbe` assembles every sequence above) emit it from one table each, and the two LLVM emitters' `.ll` is byte-identical under each policy. The drivers (`loup-bootstrap build`, the self-hosted `loup build` / `loup-build`) resolve the key and hand `loup-llvm` the policy as a `panic=<policy>` token; `loup-llvm` never reads the manifest and lowers `custom` when invoked without one. The policy changes the emitted `.ll`, so it reaches separate compilation (§3-3.21.2) through the partition text its object key hashes. The Loup `mem*` runtime unit (§3-3.16) has no panic site and is emitted the same under every policy. Hosted (non-freestanding) builds are unaffected.

```loup
@mode(freestanding)

@panic_handler
func kernelPanic(msg: string, file: string, line: int): noreturn {
    serialWrite("PANIC: ")
    serialWrite(msg)
    asm { "cli" }
    while (true) { asm { "hlt" } }
}
```

**Rules.** The `@panic_handler` function MUST match one of the two normative signatures defined above (basic `(msg, file, line): noreturn` or extended `(msg, file, line, source: PanicSource): noreturn`); any other signature is `E_PANIC_HANDLER_SIG`:

- **Basic:** `(msg: string, file: string, line: int): noreturn`
- **Extended:** `(msg: string, file: string, line: int, source: PanicSource): noreturn` — recommended when the handler needs to distinguish panic causes (e.g. routing stack-overflow panics to a different recovery path)

**The return type is `noreturn`, not `void`** (DV-2, ruled 2026-09-08). A handler is invoked at a point where a fault has already occurred; if it returns, control resumes into the very thing that faulted. The compiler has always relied on this — every site that calls a handler ends its block with a fault stop for exactly this reason — and `noreturn` is what turns that reliance into a promise the programmer states and the compiler checks. A handler body with a path that completes normally is `E_NORETURN_FALLTHROUGH` (§1-7), reported at the handler's declaration rather than never.

The idiomatic body therefore ends in a loop with no reachable exit, which is what satisfies the rule:

```loup
@panic_handler
func kernelPanic(msg: string, file: string, line: int): noreturn {
    serialWrite(msg)
    asm { "cli" }
    while (true) { asm { "hlt" } }
}
```

A handler that diverges only inside an `asm` block — a bare `asm { "1: b 1b" }` with no enclosing loop — does **not** satisfy the rule: the compiler cannot see inside the assembly, and a rule that guessed would be a rule that could not be trusted. Write the loop in Loup and put the assembly inside it.

*Compiler's rule (PANIC-1 (b), loup#881 — ruled 2026-10-15).* The panic policy is checked against the handlers when `loup build` links an IMAGE: the root unit being linked, not a library dependency. The policy is the ROOT package's `[build] panic`; a dependency's own key is not read. The handlers are every `@panic_handler` that the linked program declares in any module or package, as separate compilation (§3-3.21.2) links them.

- **Policy `custom`, no handler:** the build fails with `E_PANIC_HANDLER_MISSING`: `` `<unit>` is built with panic = "custom" but the linked program declares no `@panic_handler` — declare a `@panic_handler` or set panic = "halt" / "abort" ``.
- **Policy `halt` or `abort` (an absent key is `halt`), one or more handlers:** the build warns `W_PANIC_HANDLER_UNUSED` for each handler. The warning names the handler's site (`<file>:<line>`, the file relative to the entry file's directory) and the policy: `` the `@panic_handler` `<name>` (<site>) is never called: `<unit>` is built with panic = "<policy>", which stops without calling it — set panic = "custom" to use it ``. The build still succeeds, and the image is unchanged: under these policies the handler is dead code, not a hazard.

Neither diagnostic is raised by `loup check`. A library, or a type-check-only unit, links no image, and its handler may come from another package at link time. Every driver prints the same text.

The handler must not call any function that can itself panic (`E_PANIC_HANDLER_REENTRANT`).

**Bounds checking inside `@panic_handler`.** The compiler suppresses all runtime bounds checks inside the `@panic_handler` body. This prevents the handler from triggering a second panic (and infinite recursion) if it performs array or string indexing. The programmer is responsible for ensuring that all indexing inside the handler is in-range. Out-of-range accesses inside the handler produce undefined behavior rather than a second panic.

**Stack overflow inside `@panic_handler`.** If the handler itself overflows the stack, the behavior is undefined (the system will likely triple-fault or reset). Panic handlers SHOULD be written to use minimal stack space — avoid recursion, large local arrays, and deep function calls.

**`--double-fault` build flag (normative).** Specifies the system response when the `@panic_handler` itself triggers a panic (a "double fault"). This resolves the previously unspecified behavior of re-entrant panic handling.

| Flag | Behaviour |
|---|---|
| `--double-fault=halt` | Default. Disables interrupts; executes an infinite `hlt`/`wfi`/`wfe` loop. |
| `--double-fault=reset` | Triggers CPU reset via the architecture-specific reset mechanism (x86_64: triple-fault via invalid IDT; AArch64: `brk #0`; RISC-V: `ebreak` in M-mode with `mtvec` cleared). |
| `--double-fault=nop` | Silently ignores the second panic and returns from the handler. Intended for test environments that instrument panics. |

The double-fault handler is distinct from `@panic_handler` and does not receive a message string. It runs with the minimal stack that was valid at the point of double-fault entry.

### §3-3.7 `asm { }` — Inline Assembly

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

**Clobber names are a contract (normative).** Each name in `clobbers:` declares that the block may overwrite that register (or the flags, `"cc"`, or memory, `"memory"`). The compiler therefore keeps no live value in a clobbered register across the block, and preserves a clobbered callee-saved register for its caller (below). It either honours every declared name or refuses the build; it never drops one. A backend that silently ignores a name it does not recognise — LLVM does exactly that with `~{x30}` on AArch64, whose spelling there is `~{lr}` — leaves the register allocatable across a block that destroys it, so:

- On the LLVM lanes (`--backend llvm`, `--backend llbe`, and the self-hosted `loup build`), each name is **normalised per target** onto the spellings the backend honours: the target's register names and their architectural aliases, as clang's own C front end accepts them (`x30` → `lr` and `x29` → `fp` on AArch64, `r14` → `lr` on ARMv7 and Thumb, `ra` → `x1` and `a0` → `x10` on RISC-V, `a0` → `$4` on MIPS, `r1` → `$r1` on LoongArch), kept only where LLVM's instruction selection honours the spelling: `"cc"` on x86 is `flags` to LLVM (it discards `cc` there), and a name LLVM discards under every feature set of the target (x86 `fpcr` and `mm0`–`mm7`, a 64-bit register name on i386, an FPU register on ARMv6-M) is not a register of that target. A **wide register view** that exists only with an optional register file also names the narrower views it contains — x86 `ymm0` is `ymm0` + `xmm0`, AArch64 `z0` is `z0` + `v0`, ARM `q0` is `q0` + `d0` + `d1`, s390x `v0` is `v0` + `f0` — because LLVM discards the wide view in a build without that register file while the narrow view stays allocatable. The target is the architecture of the module's target triple, so every `[build] arch` spelling of one architecture (`arm`, `armv7a`, `arm64`, `riscv`, `rv32`, `i686`, `amd64`, …) gets the same answer. A name the target does not have is refused with `E-BUILD-NATIVE`: `inline asm: clobber 'NAME' is not a register LLVM recognises on ARCH — it would be silently DISCARDED and the register left allocatable`. `"memory"` and `"cc"` are accepted on every target (`"cc"` is a no-op where the target has no condition-code register: RISC-V, LoongArch, MIPS).
- On the C lane each name is spelled as the target's C compiler accepts it (GCC calls AArch64's `lr` / `fp` `x30` / `x29`, and x86's `cc` `flags`), and a preset or `"all"` is expanded the same way; a name the target does not have goes to the C compiler, which refuses it.
- **Implicit clobbers.** On a target whose C compilers treat every inline asm as clobbering registers of their own, every `asm { }` block clobbers them too, declared or not, on every lane: on x86 (`x86_64`, `i386`) the flags, the direction flag and the x87 status word (clang appends `~{dirflag},~{fpsr},~{flags}` to every asm; GCC's `ix86_md_asm_adjust` adds the flags and the x87 status word, and GCC never keeps a value in the direction flag), on MIPS the assembler temporary `$1` (an asm template runs under `.set at`, so the assembler may expand a macro instruction through it, and the compiler does allocate `$1`). The LLVM lanes append the set after the declared clobbers, never naming a register twice (a declared `"cc"` is `flags` on x86); the C lane gets it from its C compiler. A block whose template is empty executes nothing and clobbers nothing implicitly (the compiler barriers: `compilerFence()`, the `@domain` and preemption seams). Without the set, the compiler could keep a comparison's result in the x86 flags across a block that changes them and branch or select on the block's flags instead. On every other target (AArch64, ARM, RISC-V, LoongArch, PowerPC, s390x) the C compilers add none, so a block that changes the condition flags declares `"cc"`: the compiler may keep a comparison's result in them across a block that does not. The compiler's own templates declare what they write (x86 `irqRestore`'s `popfq` rewrites RFLAGS: `dirflag` and `flags`).
- A backend that cannot lower inline assembly refuses the block. Cranelift refuses a block with a template or operands (`--backend llvm` is the lane for it); an empty template with no operands executes nothing, so it is lowered: its `"memory"` clobber, a compiler barrier (`compilerFence()`, the `@domain` crossing barrier), becomes a Cranelift `fence` — Cranelift has no compiler-only fence, and its `fence` both bars its own load/store motion and is the target's full memory fence — and its register clobbers hold vacuously (each name is still checked like on the LLVM lanes). The Wasm backend refuses every `asm { }` block at build time with `E-BUILD-CODEGEN`: the Wasm form `E_ASM_NOT_COMPILED` refers to is not defined yet, and a block must never build as a run-time trap.

The per-target name table is derived, not hand-written: `source/sandboxes/agent/derive-clobber-tables.py` asks clang for every candidate name on every target triple either compiler emits, asks LLVM's instruction selection (`llc -stop-after=finalize-isel`) which of clang's spellings it honours under the target's widest feature set, asks the C lane's compiler for its spellings, reads each target's implicit clobbers from clang's own IR for an empty `__asm__ volatile("")`, and generates both compilers' copy from that one measurement (loup#215, loup#218).

**`clobbers: "all"` shorthand.** The string literal `"all"` in the clobbers list is a normative shorthand for all caller-saved registers on the compilation target. It is the conservative safe choice when the clobber list is uncertain. Per target (the architecture of the module's triple, as above) it expands to: every register the target has (the per-target name table), minus the registers its ABI makes callee-saved, minus the stack pointer and the program counter in every view (never clobberable), plus the return-address register (`lr` on AArch64 and ARM, `ra` on RISC-V, LoongArch and MIPS, `lr` on PowerPC, `r14` on s390x — a call writes it, so it is caller-saved on every ABI), plus `"cc"`. It does not include `"memory"`: `"all"` names registers only; write `["all", "memory"]` for both. A wide register view whose narrow part the ABI preserves (AArch64 `v8`–`v15`, whose low halves `d8`–`d15` are callee-saved) is included, so its caller-saved part is never left holding a live value; the function then preserves the callee-saved part as for any clobbered callee-saved register. The callee-saved set is the triple's default ABI's (soft-float where the triple defaults to it), so a build with a hard-float ABI preserves its callee-saved FP registers instead of the asm block being trusted with them. Registers of an optional register file are included and hold vacuously in a build without it, except where LLVM cannot compile their clobber at all without it (MIPS MSA `$w0`–`$w31`, left out). On the C lane the expansion is spelled as the C compiler accepts it, each register of an optional register file under the predefined macro the compiler defines exactly when it has that file (`#if defined(__SSE__)`: the freestanding x86 C lane builds with `-mno-sse`), and the registers the statement's own operands bind (x86 `=a` / `a` …) are left out, which the C compiler requires. Every register the expansion names is in the derived table; the expansion itself is derived with it.

```loup
asm {
    "cpuid"
    out: eax = "=a", ebx = "=b", ecx = "=c", edx = "=d"
    in:  "eax" = leaf, "ecx" = subleaf
    clobbers: ["memory"]
}

# Conservative: clobbers all caller-saved regs
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

A preset applies on its architecture only (`"svc"` on every AArch64 spelling, `"mret"` on 32- and 64-bit RISC-V); every lane expands it to the names above, normalised like any other clobber, and on another target its name is refused like an unknown register. Use a preset or `"all"` rather than an incomplete manual list to avoid the silent register-corruption bug class.

**Callee-saved registers.** An output operand, an input operand or a clobber that names a register the target's ABI makes callee-saved (x86_64 SysV: `rbx`, `r12`–`r15`) obliges the enclosing function, not the `asm` text, to preserve it for its caller: the compiler saves the register on entry and restores it on every return, exactly as for a register it allocated itself. (Implementation status: roadmap F51.)

**`borrow` values as `asm` input operands.** A `borrow T` parameter or binding may appear as an `asm` input operand. The address of the borrowed value is passed to the constraint as an integer pointer (equivalent to taking the address with `"=m"` or `"r"` constraints). The compiler verifies that the borrow's lifetime is still valid at the `asm` block. Passing a consumed or expired `borrow` as an `asm` input is `E_ASM_EXPIRED_BORROW`. In `@mode(freestanding)`, `asm` blocks do not require `@unsafe`; the compiler emits per-function lint advisory `asm-unchecked` (suppressible with `// loup:allow(asm-unchecked)`). In `@mode(host.native)`, `asm` blocks require `@unsafe("asm: <reason>")`.

### §3-3.8 `volatile` — MMIO Semantics

The `volatile` keyword preceding a `borrow` parameter asserts that reads/writes through that reference are observable side effects the optimizer must not reorder, merge, hoist, sink, or eliminate.

```loup
@mode(freestanding)

@repr(packed)
struct UartRegs {
    var data: uint8;
    var lsr:  uint8;
}

func uartWrite(volatile borrow uart: UartRegs, byte: uint8): void {
    while (uart.lsr & 0x20 == 0) {}  # volatile busy-wait
    uart.data = byte                   # volatile store
}
```

`volatile` is valid only on `borrow`/`borrow[~name]` parameters (`E_VOLATILE_NOT_BORROW`) and only in `@mode(freestanding)` or `@mode(host.native)` (`E_VOLATILE_WRONG_MODE`) — the two modes with the underlying primitive: a bare-metal image, and a hosted process that has mapped a device's registers (UIO, VFIO, `/dev/mem`). Both rules are the type checker's; the parser accepts `volatile` before any parameter modifier, so the author gets one diagnostic naming what was written rather than a parse cascade. In a mode that does not permit `volatile` at all, only `E_VOLATILE_WRONG_MODE` is reported. `volatile` does not imply atomicity; use `native.atomic` for atomic hardware access.

**Why only a borrow.** The guarantee covers accesses *through a reference to the device*. `takes` transfers ownership, so ARC would release — and possibly finalize — a register block at scope exit; a by-value form hands the callee a copy, which `volatile` would then faithfully guard. `excl borrow` is a separate grammar alternative without `volatile`.

**A volatile-tagged binding originates only as a `volatile` parameter.** Passing a plain value to a `volatile` parameter, or a volatile-tagged binding to a plain one, erases the contract at the call boundary (`E_VOLATILE_CONTRACT_ERASED`). No Loup code can therefore *start* a volatile call chain: its first function is entered by the platform (an interrupt vector, a boot trampoline, a mapping layer in assembly) and is kept reachable with `@section`.

**A `volatile borrow` argument is passed by reference.** When a volatile function hands its parameter on to another, the callee receives the same reference — never a value copy, including in `@mode(freestanding)`, which otherwise value-copies aggregate arguments (§1-10.3). With a copy, the callee would read a call-time snapshot of the registers and its stores would never reach the device; the guarantee would hold for the first call only.

**Lowering.** The parameter's slot is accessed with a volatile load/store (`load volatile` / `store volatile` in LLVM IR) at the parameter's own store and at every read of it. Re-reading the reference volatile-ly at each use is what protects the *dependent* field accesses as well: no two of them share a provably-equal address, so none can be merged, hoisted or eliminated. A backend whose IR cannot express a volatile memory access (Cranelift) SHALL refuse a reachable function with a `volatile` parameter rather than weaken the guarantee.

### §3-3.9 `Volatile[T]` — MMIO Type Wrapper

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
    # Modify: read-modify-write — NOT atomic; see note below
    pub func modify(f: noescape fn(T): T): void
    pub func addr(): uint
}
```

`T` must be a primitive or `@repr(C)` struct type (`E_VOLATILE_NOT_REPR`). Like the `volatile` parameter modifier, `Volatile[T]` is valid only in `@mode(freestanding)` and `@mode(host.native)`; an annotation naming it anywhere else is `E_VOLATILE_WRONG_MODE`.

**`Volatile[T].modify` is not atomic.** The `modify` method performs a volatile read, calls the closure, then performs a volatile write — but these two operations are NOT a single atomic transaction. On multi-core systems, another CPU may write to the same address between the read and the write, causing a lost update. For atomic read-modify-write on multi-core hardware, use `native.atomic.fetchAdd`, `native.atomic.compareExchange`, or similar primitives from the `native.atomic` module (§3-3.20). Reserve `Volatile[T].modify` for single-core contexts or cases where the device register semantics guarantee that concurrent access cannot occur.

**Hardware barrier after volatile stores.** On weakly-ordered architectures (ARM, RISC-V), a volatile store alone does not guarantee that the peripheral device observes the write before subsequent CPU instructions execute. Follow every volatile store to a device register with `native.atomic.hwFence(MemoryOrder.DeviceRelease)` to insert the required hardware barrier. Example:

```loup
uart.data = byte                                          # volatile store
native.atomic.hwFence(MemoryOrder.DeviceRelease)          # hardware barrier — ARM DSB ST / RISC-V FENCE ow,ow
```

On x86/x86_64, the strong memory model makes this barrier a no-op (the instruction is emitted but elided by the CPU); the code is therefore portable across architectures without performance penalty on x86.

**Endianness of volatile MMIO accesses (s390x and big-endian targets).**

*Implementation status — the scalar fast-path **(b)** (`Volatile[T, Big|Little|Native]` byte-swap on `read()`/`write()`) and the `E_VOLATILE_ENDIAN_UNDECLARED` lint **(a)** are **implemented** (validated end-to-end under QEMU x86_64; see `tests/freestanding_qemu/volatile_endian/`). The `@interchange` view form (`Volatile.view[I].at(addr).read()/.write(v)`) and `E_VOLATILE_ENDIAN_STRUCT` are also **implemented** (freestanding; validated under QEMU x86_64 — see `tests/freestanding_qemu/volatile_view/`): `.read()` lowers to `I.unpackFromVolatile(addr)` and `.write(v)` to `v.packIntoVolatile(addr)` — synthesized `@interchange` (un)packer variants that access the device bytes **`volatile`-qualified**, so each field is (de)serialised with its declared byte order AND the per-access volatile guarantee holds (a big-endian register block reads correctly on a little-endian host, and a polling / side-effect register block is sound — not just one-shot config). The non-volatile `unpackFrom`/`packInto` remain for on-disk / on-wire `@interchange` use. Per-element-width scalar access (each `Volatile[T]` touches exactly `sizeof(T)` bytes) is **implemented** — see "Access width" at the end of this section.*

The bare `Volatile[T].read()`/`write()` shown above are **host-endian pass-through**: they carry no declared byte order and insert no swap. On a little-endian target this is invisible, and on a big-endian target a big-endian device register is read correctly by coincidence (BE-on-BE). But a device whose byte order disagrees with the host — most importantly **virtio**, which is little-endian on a big-endian s390x guest, and many PCI devices — would be **silently byte-swapped** with no diagnostic. To close this gap, `Volatile` gains an endianness dimension with two composable forms.

**(a) `@interchange`-typed volatile view (primary idiom).** For any multi-byte or multi-field device-register block, declare the register layout as an `@interchange` type (Volume 4 §4-2) and access it through a volatile view:

```loup
@interchange(endianness: Little)        # virtio is little-endian regardless of host
struct VirtqConfig {
    @field(encoding: Binary) let queueSize:    uint16;
    @field(encoding: Binary) let queueEnable:  uint16;
    @field(encoding: Binary) let queueNotify:  uint32;
}

let cfg = Volatile.view[VirtqConfig].at(0xVIRTIO_BASE)
let v   = cfg.read()                    # volatile load of raw bytes, then VirtqConfig.unpack
cfg.write(v)                            # VirtqConfig.pack, then volatile store of raw bytes
```

`Volatile.view[I: Interchange](addr)` performs a volatile read of the raw `I.byteLength()` bytes followed by `I.unpack` (which applies `I`'s declared `endianness:`), and on write performs `I.pack` followed by a volatile store. This **reuses Volume 4 §4-2's proven byte-swap and bit-field codegen** (§4-2.6, §4-2.9); a little-endian virtio field declared `@interchange(endianness: Little)` reads correctly on a big-endian host with no hand-written swap. `Volatile.view` is the recommended idiom for every multi-byte or multi-field register block.

**(b) Scalar fast-path — endianness-parameterized `Volatile`.** For a single scalar register, the type parameter list carries an explicit byte order:

```loup
Volatile[uint32, Big]      # big-endian register
Volatile[uint32, Little]   # little-endian register (e.g. a virtio scalar field)
Volatile[uint32, Native]   # device is host-endian; no swap
```

`read()`/`write()` insert a byte-swap **iff the declared order ≠ the target byte order** (taken from the arch record, §3-3.2); `Native`, and a declared order that matches the target, are no-ops. A declared-`Little` view on big-endian s390x **inserts the swap — this is defined behavior, not an error.**

**Behavior on disagreement / diagnostics.**

- A plain `Volatile[T]` (no declared endianness) over a **multi-byte** `T` in `@mode(freestanding)` emits `E_VOLATILE_ENDIAN_UNDECLARED` — an advisory lint by default, **promotable to an error per package**. The developer must pick `Native` (explicitly asserting the device is host-endian), a `Big`/`Little` parameter, or the `@interchange` view. **Single-byte `T` (e.g. `Volatile[uint8]`) is exempt** — byte order is meaningless for one byte.
- A multi-**field** `@repr(C)` register block accessed as one `Volatile[T]`, where field byte order matters, requires the `@interchange` view: `E_VOLATILE_ENDIAN_STRUCT` ("use a `Volatile.view` over an `@interchange` type"). `@repr(C)` is already required for `Volatile[T]` (`E_VOLATILE_NOT_REPR`, §3-3.22); this adds the endianness obligation on top.

`Volatile.at`/`Volatile.view` are already `@unsafe`; the endianness dimension introduces **no new unsafe surface** — it removes a silent-corruption path.

**Access width (normative).** A `Volatile[T]` load/store accesses **exactly `sizeof(T)` bytes** with `T`'s signedness: `Volatile[uint8]` is a 1-byte access, `[uint16]` 2 bytes, `[uint32]` 4 bytes, `[uint64]`/`[int]`/`[uint]` 8 bytes (and `int8`/`int16`/`int32` are the signed forms, so a load sign-extends). A narrow access therefore never touches an adjacent register, and the byte-swap (form (b)) composes with the exact width. The untyped `mmioPtr(addr)` factory carries no element type and accesses the platform word width. *(Implemented — validated end-to-end under QEMU x86_64; see `tests/freestanding_qemu/volatile_width/`.)*

`Volatile.read()`/`write()` provide an optimizer/compiler barrier only and insert **no hardware fence** (§3-3.8); callers needing hardware memory ordering add `native.atomic.hwFence(MemoryOrder.*)` explicitly (the "Hardware barrier after volatile stores" note above). Strict access width and ordering are independent: width fixes which bytes are touched, `hwFence` fixes when the device observes them.

**Cross-reference — wire and on-disk structures are already covered.** For **on-disk and on-wire** big-endian structures (as opposed to live MMIO registers), no `Volatile` is involved and nothing new is required: `@interchange` (Volume 4 §4-2.2) already defaults `endianness: Big`, auto-derives endianness-correct `pack`/`unpack` for `Binary`/`Float*`/`Decimal128`/`Complex*` and MSB-first bit fields (§4-2.9), and lists hardware register maps as an explicit use case. A big-endian on-disk or wire struct is the §4-2 *default* and is correct on a big-endian s390x target unchanged.

### §3-3.10 `@repr` — Struct Layout Control

`@repr` controls the memory layout of a struct — essential for hardware register maps, DMA descriptors, and any structure where byte layout is mandated by hardware spec.

```loup
@mode(freestanding)

@repr(C)
struct ElfHeader {
    var e_ident:   tuple[uint8; 16];
    var e_type:    uint16;
    var e_machine: uint16;
    # ... all fields
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

Valid in `@mode(freestanding)` and `@mode(host.native)`. In `@mode(web.compiled)`, a Wasm-compatible subset of `@repr` is supported (see §1-2.6). Using `@repr` in `@mode(web.scripted)`, `@mode(host.scripted)`, or `@mode(host.dual)` is a compile-time error (`E_REPR_NOT_NATIVE`).

*Compiler's rule (`@repr(C)` offsets belong to their type).* A `@repr(C)` type's fields are at their C byte offsets on receivers of THAT type only; a same-named field of another type keeps its own layout, and rendering and buffer layout read each type's own offsets. With the receiver's type unknown, the C offset is used only when one `@repr(C)` type, and no other type, declares the name; any other such access fails the build with `E-BUILD-NATIVE` ("field `len` read through a value whose type is not known here: `len` is declared on @repr(C) type(s) Hdr and on type(s) Plain, which lay it out at different offsets; …"). (T3-field M2: both native drivers took the C offset whenever exactly one `@repr(C)` type declared the name, so `Plain.len` was written over `Plain.b`.) A parameter's DECLARED type — `f: S`, `f: borrow S`, an `@interrupt` handler's `frame: borrow InterruptFrame` — and a method's `self` are known receiver types on every native lane, freestanding included: a field read through one is at that type's layout, never refused and never resolved by name. (b37-isr: Stage0 typed them on the managed route only, so a freestanding read of a parameter's `@repr(C)` field whose name another type also declares failed the build — the user's `@repr(C) struct InterruptFrame`'s `frame.cs` beside the prelude's built-in `InterruptFrame`, which a user declaration shadows (§1-6.1 *Prelude and library shadowing*, so the handler's parameter is the user's type and its fields are read at the user's C offsets) — and before T3-field M2 such a read took the slot layout whenever two `@repr(C)` types declared the name.)

### §3-3.11 `@align` — Alignment Annotations

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

### §3-3.12 `@section` — ELF Section Placement

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

*Compiler's rule (a static binding — row SECVAR-1).* `@section("X")` on a module-level `var` / `let` places that global in section X on every lane that emits it — the Stage0 LLVM and C backends, the self-hosted `loup-llvm` (clang) path and llbe — and the global is pinned against dead-global elimination (`@llvm.used`; `__attribute__((used))` in C), since a linker script may be its only reader. A lane that cannot place it refuses the build naming the global and the section, never dropping the section: the Cranelift backend (`E_SECTION_UNSUPPORTED`), llbe's x86_64 exception-handling object writer and its executable (`exe:`) lane, and llbe's per-arch object tier for a global that holds pointers (it has no absolute data relocation for a named section). The binding form takes the function form's modes: in a file whose declared `@mode` is neither `freestanding` nor `host.native` it is `E_SECTION_WRONG_MODE`, reported by both parsers. `@section` on a local binding or a `const` is `E_ANNOTATION_TARGET` (core §1-8.8, row ANNTGT-1).

**Container.** Section placement targets **ELF**. `name` is written verbatim into the object's section header and therefore takes ELF section-name form (`.text.boot`, `.rodata.strings`). The Mach-O two-part `__SEGMENT,__section` form is **not** accepted, because no backend emits Mach-O (§3-2.1). A revision that adds an Apple target MUST define the segment/section mapping before this annotation can be used there.

### §3-3.12a Static Data Relocations — Pointers in Global Data

A freestanding program may place **pointers in static or global data**. Three forms occur naturally:

- a static binding whose value is the address of another global or function,
- a **pointer table** — an array of function or data addresses, such as an interrupt vector table or a driver dispatch table,
- a **string descriptor** — the `{ptr, len}` pair by which a `string` value in static data refers to its bytes in `.rodata`.

None of these addresses is known when the object is emitted; each is fixed only when the linker assigns final addresses. The toolchain therefore emits, for every pointer word appearing in initialized static data, an **absolute 64-bit data relocation** into the object's **`.rela.data`** section, which the linker resolves at link time.

**Emission.** On the clang-free self-hosted backend (`--backend llbe`, §3-2.2) the relocations are emitted directly by the toolchain's own ELF writer, using the architecture-correct ABS64 relocation type, with **addend 0**:

| Architecture | ABS64 relocation type | Value |
|---|---|---|
| `x86_64` | `R_X86_64_64` | 1 |
| `aarch64` | `R_AARCH64_ABS64` | 257 |
| `riscv64` | `R_RISCV_64` | 2 |
| `loongarch64` | `R_LARCH_64` | 2 |
| `powerpc64le` | `R_PPC64_ADDR64` | 38 |
| `s390x` | `R_390_64` | 22 |
| `mips64el` | `R_MIPS_64` | 18 |

`.rela.data` is emitted **only when the module actually contains at least one data pointer**. A program whose static data holds no addresses produces no `.rela.data` section at all, and the section adds nothing to the image.

**Read-only static data (loup#920).** A pointer-holding global the IR declares `constant` — a string descriptor, a constant pointer table — lives in `.rodata`, not `.data` (§3-2.2), and its relocations go to **`.rela.rodata`** (`.rel.rodata` on `arm` and Thumb, `R_ARM_ABS32`), by the same rule: emitted only when a constant holds an address, resolved by the (static) link. A writable pointer-holding global keeps `.rela.data`.

On the C and LLVM paths the same relocations are synthesized by the downstream toolchain from the pointer-bearing global initializers the backend emits; the object-level result is equivalent. On the LLVM path that includes the placement: clang compiles a freestanding `.ll` for the triple it carries, under the static relocation model (§3-2.2, *The clang routes keep the same rule*), so a constant pointer-holding global goes to `.rodata` with its relocations in `.rela.rodata` (`.rel.rodata` on `arm`), as on `llbe`.

**Interaction with `relocatable = true` — static data relocations are forbidden.** Under the position-independent copy-and-run mode (`[freestanding] relocatable = true`, §3-3.21.1) the image is defined to carry **no load-time relocations**: a loader copies the image to an arbitrary base and enters it *with no fixup step*, and there is consequently nothing in the loading path that could apply a `.rela.data` entry. A pointer baked into static data would be loaded verbatim at the wrong address.

In that mode the toolchain therefore does not emit static data relocations. Instead, a string `{ptr, len}` descriptor is **materialized at runtime as inline stores** — the code computes the descriptor's pointer field position-independently and stores it into the descriptor before use, rather than relying on the linker to have written an absolute address into `.data`. The zero-relocation property of the image is a load-bearing part of the loader ABI (§3-3.21.1), and it is checked: a relocatable build that would require a static data fixup fails rather than emitting an image the loader cannot correctly place.

### §3-3.13 `@interrupt` — Interrupt Service Routines

`@interrupt` generates the ISR calling convention: saves/restores all registers and returns with `iretq`/`eret`/`mret`/`rfe` rather than a normal return.

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
| `s390x` | N/A — uses `class:`, not `has_error_code:` | `(borrow InterruptFrame): void` |
| `arm` (A-profile AArch32) | N/A — uses `class:`, not `has_error_code:` | `(borrow InterruptFrame): void` |


**Architecture-specific `InterruptFrame` layouts.** `InterruptFrame` is a built-in `@repr(C)` struct whose fields match the CPU-pushed exception frame for the compilation target architecture. The compiler selects the correct definition based on `--arch`.

**x86_64 (`--arch x86_64`):**

```loup
@repr(C)
struct InterruptFrame {
    let rip:    uint64;  # saved instruction pointer
    let cs:     uint64;  # code segment (padded to 8 bytes)
    let rflags: uint64;  # RFLAGS register
    let rsp:    uint64;  # saved stack pointer (on privilege change)
    let ss:     uint64;  # stack segment (padded to 8 bytes)
}
```

**AArch64 (`--arch aarch64`):**

```loup
@repr(C)
struct InterruptFrame {
    let elr_el1:  uint64;  # exception link register (return address)
    let spsr_el1: uint64;  # saved program status register
    let sp_el0:   uint64;  # EL0 stack pointer (on EL0→EL1 transition)
    let esr_el1:  uint64;  # exception syndrome register (fault info)
}
```

**RISC-V 64-bit (`--arch riscv64`):**

```loup
@repr(C)
struct InterruptFrame {
    let mepc:   uint64;  # machine exception program counter
    let mcause: uint64;  # machine cause register
    let mstatus:uint64;  # machine status register
    let mtval:  uint64;  # machine trap value (fault address or instruction)
}
```

**A-profile AArch32 (`--arch arm`, ARMv7-A — loup-llbe's `a32` lane; row ISR-A32) — banked-mode exception model.**

An ARMv7-A core enters each exception in a banked mode of its own (IRQ, FIQ, Supervisor, Undefined, Abort), with the mode's own `LR` and `SPSR`, and its `LR` lies a class-dependent distance past the address to return to. `@interrupt` on `arch: "arm"` therefore takes a **`class:`** (as s390x does) instead of `has_error_code:`, naming the exception the handler is installed for; the class fixes the return-address adjustment:

| `class:` | Taken in mode | `LR` points at | Return address (`pc` in the frame) | The same return from the banked mode |
|---|---|---|---|---|
| `IRQ` | IRQ (`0x12`) | the next instruction + 4 | `LR - 4` (the interrupted instruction resumes) | `subs pc, lr, #4` |
| `FIQ` | FIQ (`0x11`) | the next instruction + 4 | `LR - 4` | `subs pc, lr, #4` |
| `SupervisorCall` | Supervisor (`0x13`) | the instruction after `svc` | `LR` | `movs pc, lr` |
| `Undefined` | Undefined (`0x1B`) | the instruction after the undefined one | `LR` (execution continues past it) | `movs pc, lr` |
| `PrefetchAbort` | Abort (`0x17`) | the aborted instruction + 4 | `LR - 4` (it re-executes) | `subs pc, lr, #4` |
| `DataAbort` | Abort (`0x17`) | the aborting instruction + 8 | `LR - 8` (it re-executes) | `subs pc, lr, #8` |

A missing `class:` (or a supplied `has_error_code:`) is `E_INTERRUPT_CLASS_REQUIRED`; one that is not in the table is `E_INTERRUPT_CLASS_INVALID`.

```loup
@repr(C)
struct InterruptFrame {      # arm — the entry's save area, lowest address first
    let r0:   uint32;  # the interrupted r0-r3 and r12 (AAPCS caller-saved)
    let r1:   uint32;
    let r2:   uint32;
    let r3:   uint32;
    let r12:  uint32;
    let lr:   uint32;  # LR_svc at entry (the interrupted Supervisor-mode LR; for
                       # `class: SupervisorCall` the exception has already
                       # overwritten it with the return address)
    let pc:   uint32;  # the return address (the banked LR after the class's adjustment)
    let spsr: uint32;  # the banked SPSR: the interrupted CPSR (mode, T, I, F, flags)
}
```

**Entry and stack.** The vector branches to the handler's entry, a compiler-generated A32 trampoline. It applies the class's adjustment to the banked `LR`, stores that return address and the banked `SPSR` on the **Supervisor-mode stack** (`srsdb sp!, #0x13`), and switches to Supervisor mode (`cps #0x13`, leaving the `I`/`F` masks as the exception set them), so the body runs on `SP_svc` with `LR_svc` its own (saved first) and a nested exception — should the body re-enable interrupts — cannot overwrite the banked pair the handler returns through. It then pushes `r0`–`r3`, `r12` and `LR_svc`; that save area and the stored pair ARE the `InterruptFrame` above, whose address the body receives. The call is made with the stack 8-byte aligned (AAPCS), the registers are restored, and `rfeia sp!` returns, loading `pc` and `CPSR` from the stored pair — the same return the table's last column makes from the banked mode, taken from the Supervisor stack instead. The banked stack pointers of the IRQ / FIQ / Undefined / Abort modes are never used: the kernel keeps `SP_svc` valid wherever such an exception can be taken. An `svc` executed in Supervisor mode itself overwrites `LR_svc` (architecturally), so such code treats `lr` as clobbered by the call.

**A32 versus Thumb.** The entry is A32 code: ARMv7-A takes exceptions in A32 state unless `SCTLR.TE` is set (its reset value is 0), and the trampoline assumes `SCTLR.TE = 0`. The interrupted code may run in either state — `rfeia` restores `CPSR.T` from the stored `SPSR` — and the vector table's `b` reaches the entry in A32.

**IBM Z / s390x (`--arch s390x`) — PSW-based interrupt model.**

*Specified pending implementation — the s390x interrupt model below is specified in this revision and tracked under `specs/1-bootstrap-5-mainframe-s390x/` (R2).*

z/Architecture has **no interrupt vector table and no architectural saved-GPR frame** at the ISR boundary. On an interruption the CPU **stores the current PSW into the class's old-PSW low-core location and loads the class's new-PSW**; there are six **interruption classes** at fixed low-core old/new-PSW pairs. The x86 `has_error_code:` notion does not apply. `@interrupt` for s390x therefore takes a **`class:`** parameter *instead of* `has_error_code:`:

```loup
@interrupt(arch: "s390x", class: IO)
func ioInterrupt(frame: borrow InterruptFrame): void { ... }

@interrupt(arch: "s390x", class: Program)
func programInterrupt(frame: borrow InterruptFrame): void { ... }
```

`class ∈ { External, IO, MachineCheck, Program, Restart, SupervisorCall }`. On `arch: "s390x"`:

- A missing `class:` (or a supplied `has_error_code:`) is `E_INTERRUPT_CLASS_REQUIRED`.
- A `class:` that is not one of the six interruption classes is `E_INTERRUPT_CLASS_INVALID`.

The s390x `InterruptFrame` variant is a builtin `@repr(C)`, `borrow`-only, non-constructible view of the saved old PSW plus the read-only, class-relevant low-core interruption parameters:

```loup
@repr(C)
struct InterruptFrame {           # s390x view — non-constructible (E_INTERRUPT_FRAME_CONSTRUCT)
    let psw_mask: uint64;  # saved old-PSW first doubleword (system mask, key, AMODE, …)
    let psw_addr: uint64;  # saved old-PSW second doubleword (instruction address)

    pub func interruptionCode(): uint16   # low-core interruption code for the class
    pub func ilc():             uint8     # instruction-length code
    pub func teid():            uint64    # Program class: translation-exception identification (TEID)
    pub func subchannelId():    uint32    # I/O class: interrupting subchannel-ID word
}
```

The class-specific accessors read the relevant low-core parameter for the handler's class (`teid()` for `class: Program`, `subchannelId()` for `class: IO`, and so on). As on the other arches, `InterruptFrame` is `borrow`-only and **non-constructible by user code** (`E_INTERRUPT_FRAME_CONSTRUCT`).

**Trampoline / return.** The compiler-generated prologue/epilogue performs the PSW-aware save/restore and **returns via `LPSWE`** (Load PSW Extended) — the z analog of `iretq`/`eret`/`mret`. Wiring each class to its handler means installing that class's **new-PSW** in low core so it points at the trampoline; that install is a HAL `Volatile`/`asm` step (the same auditable class as IDT/IVT setup on the other arches), not a language concern and not emitted by the compiler.

**Invariant I4 (no blocking in interrupt context) applies to s390x ISRs unchanged.** The `@interruptSafe` call-graph color rule (§3-3.24) is arch-agnostic: inside any `@interrupt`/`@interruptSafe` body it forbids `new`/`throw`/`await`/`spawn`, calls to non-`@interruptSafe` user functions, and direct `static var` access (which must instead go through `native.atomic.*`), emitting `E_INTERRUPT_SAFE_VIOLATION`. The six s390x classes are just additional valid `@interrupt` entries and are color-checked identically. `InterruptGuard` (§3-3.24.2) maps to z **system-mask** manipulation (`STNSM`/`STOSM`/`SSM` on the PSW system-mask byte); its `disable()`/`release()`/`with`-block contract and `E_INTERRUPT_GUARD_NESTED`/`E_INTERRUPT_GUARD_NOT_FREESTANDING` are unchanged.

`InterruptFrame` values are produced by the CPU exception mechanism and passed to `@interrupt` functions by the compiler-generated trampoline. User code cannot construct `InterruptFrame` directly — attempting to do so is `E_INTERRUPT_FRAME_CONSTRUCT`.

`@interrupt` functions must not be called directly from Loup code (`E_INTERRUPT_DIRECT_CALL`), must not be `async` (`E_INTERRUPT_ASYNC`), and must return `void` (`E_INTERRUPT_NONVOID`).

Compiler's rule (the interrupt entry). The handler's entry symbol is a compiler-generated naked trampoline and its body an ordinary function emitted as `<name>__isr_body`. On x86_64 the trampoline saves the nine caller-saved general registers (`rax rcx rdx rsi rdi r8–r11`; the body preserves the rest), passes the CPU-pushed `InterruptFrame` and, for `has_error_code: true`, the error code as the body's arguments, keeps the call 16-byte aligned, clears the direction flag, restores the registers, discards the error code and returns with `iretq`. On AArch64 (an EL1 exception vector branches to it) it saves `x0`–`x18` and the `x29`/`x30` pair, builds the `InterruptFrame` from `ELR_EL1`, `SPSR_EL1`, `SP_EL0` and `ESR_EL1` on the stack (exception entry selects `SP_EL1`, so the `SP_EL0` read is defined), passes its address, restores `ELR_EL1` and `SPSR_EL1` from the frame (a handler that re-enables interrupts may be nested, which overwrites both), restores the registers and returns with `eret`. On RISC-V 64 (machine mode; `mtvec` points at it) it saves `ra`, `t0`–`t6` and `a0`–`a7`, builds the frame from `mepc`, `mcause`, `mstatus` and `mtval`, passes its address, restores `mepc` and `mstatus` from the frame, restores the registers and returns with `mret`; the entry is 4-byte aligned, as a direct-mode `mtvec` requires (with the C extension a function is otherwise only 2-byte aligned). On A-profile AArch32 the trampoline is the A32 sequence the banked-mode model above describes (`sub lr, lr, #4` / `#8` by `class:`, `srsdb sp!, #0x13`, `cps #0x13`, `push {r0-r3, r12, lr}`, the body called with the frame address in `r0` and `r1 = 0` — an `i64` argument — on an 8-byte-aligned stack, `pop`, `rfeia sp!`; row ISR-A32). The 64-bit trampolines keep the stack 16-byte aligned. No floating-point or vector state is saved: a handler that uses those register files must save them itself (the freestanding x86 lanes forbid them outright, `-mno-sse`; AArch64 release builds compile with `-mgeneral-regs-only`). An `@interrupt` function is a reachability root on every lane: it is entered through a vector, never called. `@callconv(interrupt)` lowers the same way. `has_error_code: true` is meaningful on x86_64 only, and `class:` on s390x and AArch32 only (the table above). The C backend meets the x86 contract through GCC's x86 `interrupt` attribute, declaring the handler `(void *frame)`, or `(void *frame, unsigned long error_code)` for `has_error_code: true`, and refuses an interrupt handler for any other arch except a parameterless Cortex-M one (GCC's attribute is no AArch64 entry, and its RISC-V and ARM forms take no frame). A target this lowering does not cover — an `arch:` that is not the build's, an error code off x86_64, an AArch32 handler without a valid `class:`, an arch outside x86_64 / AArch64 / RISC-V 64 / A-profile AArch32 (s390x on the LLVM lanes), a Cortex-M handler that takes a frame — is refused at build time (`E-BUILD-NATIVE`), never emitted as a plain function; a parameterless Cortex-M handler is a plain function, since an AAPCS return through `EXC_RETURN` is the M-profile exception return (rows ISR-1, ISR-A32).

### §3-3.14 `@naked` — Naked Functions

`@naked` suppresses compiler-generated prologue and epilogue. The function body must consist entirely of `asm { }` blocks. `@naked` and `@callconv(naked)` are the same thing, and every backend SHALL treat them so. Both are valid only on a MODULE-LEVEL function — a method needs its receiver, which a prologue-less body cannot set up — and elsewhere are `E_ANNOTATION_TARGET` (§1-8.8; ruling NAKED-1, loup#749). (The Stage0 compiler set a function's calling convention from `@callconv` alone, so a bare-`@naked` function was emitted WITH a prologue — allocas and zeroing stores ahead of its `asm`, which for a boot entry is a write through a stack pointer nothing has set up yet. The self-hosted lane had honoured the bare form since loup#195; the two lanes' output differed on every such function until loup#463's lane comparison found it.)

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

**A `@naked` function declared `noreturn` does not draw this advisory.** The lint exists to catch a naked body that omits its own return sequence; a function whose return type is `noreturn` (§1-4.4a) has no return sequence to omit, and the promise it makes is checked by the analysis in §1-7.8 instead. Suppressing the advisory here is not a relaxation — it moves the check from a pattern-match on assembly text to a rule about control flow, which is the stronger of the two. Note that §1-7.8 does not accept assembly as proof of divergence, so such a function still needs a loop the compiler can see.

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
    # from_ctx is in rdi, to_ctx is in rsi (sysv64 calling convention)
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

### §3-3.15 `@callconv` — Calling Convention Override

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

### §3-3.16 `@allocator` and `@deallocator`

Registers a custom heap allocator. Class construction is a compile-time error without a registered allocator (`E_FREESTANDING_CLASS_NO_ALLOC`). Once registered, class construction may return `unique T` or propagate `AllocError` if the allocator signals failure.

```loup
@mode(freestanding)

@allocator
func kernelAlloc(size: uint64, align: uint64): uint? {
    return slabAllocator.alloc(size, align)  # returns None if pool exhausted
}

@deallocator
func kernelFree(ptr: uint, size: uint64, align: uint64): void {
    slabAllocator.free(ptr, size, align)
}
```

**Signatures (normative):** `@allocator` must be `(size: uint64, align: uint64): uint?` (`E_ALLOCATOR_SIG`). The `?` return type is mandatory — an allocator whose return type is plain `uint` (without `?`) is `E_ALLOCATOR_SIG_V16`, not `E_ALLOCATOR_SIG`; `E_ALLOCATOR_SIG` covers other signature violations (wrong parameter count or types). A `None` return from the allocator signals allocation failure; the compiler maps this to `AllocError` (§1-18.1) and propagates it via `?` at every class-construction call site that is inside an error-propagating context, or panics (via `--panic` policy) if no propagation context is available.

`@deallocator` must be `(ptr: uint, size: uint64, align: uint64): void` (`E_DEALLOCATOR_SIG`). At most one of each per compilation unit. `@allocator` without a matching `@deallocator` is `E_ALLOCATOR_UNPAIRED`. `consume` on `unique class` values is always `E_UNIQUE_CLASS_CONSUME` in freestanding mode — ARC is unavailable.

`native.mem.alloc` gains a fallible sibling `native.mem.tryAlloc(n: uint64, align: uint64): Result[uint, AllocError]` that returns `Err(AllocError)` on failure without panicking. The existing `native.mem.alloc` retains its panic-on-failure behavior for backward compatibility.

### §3-3.16a `@scheduler` — Freestanding Thread-Pool Extension Point

In `@mode(freestanding)`, the runtime has no built-in thread pool. The `@scheduler` annotation registers a user-supplied scheduler that `@strategy(threadPool)` on a `for concurrent` loop (§2-1.11) dispatches to. Without a registered scheduler, applying `@strategy(threadPool)` is `E_FOR_CONCURRENT_STRATEGY_NOT_AVAILABLE`.

```loup
@mode(freestanding)

# The scheduler receives an iteration count and a per-iteration kernel
# closure that takes the iteration's multi-axis index. The implementation
# dispatches the kernel across whatever execution resources the target
# provides — fixed-priority RTOS tasks, a co-processor, hardware threads,
# etc. — and returns when all iterations have completed.
@scheduler
func kernelScheduler(
    iterations: int,
    kernel:     fn(index: list[int]): void,
): void {
    # implementation-specific: dispatch and wait
    rtosForkJoin(iterations, kernel)
}
```

**Signatures (normative):** `@scheduler` must be
`(iterations: int, kernel: fn(index: list[int]): void): void`
(`E_SCHEDULER_SIG`). At most one `@scheduler` per compilation unit; declaring more than one is `E_SCHEDULER_DUPLICATE`. The `kernel` closure is invoked once per iteration with a `list[int]` carrying the multi-axis index for multi-variable `for concurrent` headers (length 1 for single-variable headers).

The scheduler is responsible for ensuring the kernel runs to completion for each iteration before returning; the compiler emits no synchronization barrier around the call. Exceptions thrown inside `kernel` cannot escape — `for concurrent` already disallows propagation through iteration bodies (§2-1.11). If the scheduler implementation has a way to signal failure, it must do so out-of-band (e.g., via a status flag observed by the caller).

`@scheduler` is unique to `@mode(freestanding)`. Declaring it in any other mode is `E_SCHEDULER_NOT_FREESTANDING`.

| Code | Condition |
|---|---|
| `E_SCHEDULER_SIG` | `@scheduler` function signature does not match `(int, fn(list[int]): void): void` |
| `E_SCHEDULER_DUPLICATE` | Multiple `@scheduler`-annotated functions in the same compilation unit |
| `E_SCHEDULER_NOT_FREESTANDING` | `@scheduler` declared in a mode other than `@mode(freestanding)` |

### §3-3.16b `@no_zero_locals` — Suppress Prologue Zero-Initialization

In `@mode(freestanding)`, the native-C backend emits a function prologue that declares all register slots and local slots with a zero initializer (`loup_int rN = 0;`, `loup_int loc_N = 0;`). This is safe by default and matches C's behavior for local variables with undefined initial values. However, for kernel hot paths where stack budget is constrained and the developer knows every local is written before use, this blanket zeroing is unnecessary overhead: on a function carrying a `Spinlock` instance plus a handful of other locals, the zero-init can reach ~1.5 KiB per call, which is significant against a 4 KiB kernel-thread stack.

`@no_zero_locals` suppresses the `= 0` initializer on every register and local-slot declaration in the function's native-C prologue. The function itself is unchanged in all other respects; the annotation is purely a codegen hint.

```loup
@mode(freestanding)

# Hot-path spinlock acquire — stack budget is tight; the developer
# guarantees every local is written before any read.
@no_zero_locals
func acquire(lock: uint): void {
    var expected: uint64 = 0 as uint64
    var desired:  uint64 = 1 as uint64
    # ... CAS loop ...
}
```

**Semantics:** `@no_zero_locals` instructs the native-C backend to omit `= 0` from all register-slot and local-slot declarations in the function prologue. Any local that is read before being written contains an indeterminate value; reading such a local is undefined behavior. The annotation is the developer's assertion that no such read occurs.

**Restrictions:**
- `@no_zero_locals` is valid only on top-level `func` declarations in `@mode(freestanding)` or `@mode(native)`. Applying it in `scripted` or `compiled` mode is `E_NO_ZERO_LOCALS_WRONG_MODE`; applying it to a `class`, `struct`, `interface`, `enum`, or `var` declaration is `E_NO_ZERO_LOCALS_NOT_FUNC`.
- `@no_zero_locals` has no effect on non-native backends (Wasm, interpreter). The compiler silently ignores it for those targets.
- `@no_zero_locals` does **not** suppress initialization of fields in a `struct` or `class`. Field defaults reach storage through two distinct code paths, neither of which is the prologue `= 0` slot-zeroing that `@no_zero_locals` elides: (1) a constructor invocation, and (2) the default-initialization of a no-initializer struct-typed local — `var x: T;` with no constructor call materializes each field's declared default (or zero/`None`) on every control-flow path (the core rule is normative in Volume 1 §1-10). That default-materialization is a semantic store mandated by the language, *not* an optimization-only slot zeroing, so `@no_zero_locals` does not suppress it: a `@no_zero_locals` function still emits declared field-default stores for any uninitialized struct-typed local it declares.

| Code | Condition |
|---|---|
| `E_NO_ZERO_LOCALS_WRONG_MODE` | `@no_zero_locals` applied in a mode other than `@mode(freestanding)` / `@mode(native)` |
| `E_NO_ZERO_LOCALS_NOT_FUNC` | `@no_zero_locals` applied to a non-function declaration |

### §3-3.16c `@domain("name")` — Isolation Domains

A freestanding program frequently partitions its code into **isolation domains**: a bare-metal kernel may separate its trusted supervisor core from a driver domain and an untrusted user-request domain, and wish for control transfers between those partitions to be hardened against speculative execution carrying data across the boundary.

`@domain("name")` applied to a function declares the isolation domain that code path belongs to. Domains are named by an arbitrary string; a function with no `@domain` annotation belongs to no domain.

```loup
@mode(freestanding)

@domain("kernel")
func handleSyscall(n: uint, arg: uint): uint {
    return dispatch(n, arg)      # domain crossing: kernel → driver
}

@domain("driver")
func dispatch(n: uint, arg: uint): uint {
    # ...
    return 0
}
```

**Domain crossing.** A direct call from a function annotated `@domain(A)` to a function annotated `@domain(B)`, where `B ≠ A`, is a **domain crossing**. At each crossing the compiler inserts a speculation/reorder barrier **immediately before the call instruction**. The intent is to prevent the processor from speculatively executing callee code — and thereby transiently touching callee-domain data — under a mispredicted or not-yet-resolved caller-domain condition.

The barrier reaches real machine code on both native backends: the C backend emits a `__asm__ volatile` barrier and the LLVM backend an `asm sideeffect` barrier, each ordered before the call in the emitted instruction stream. Both are opaque to the optimiser and are not reordered or elided across the call.

**Implementation.** `@domain` is carried on the function in HIR and consumed by the `insert_domain_barriers` pass (`src/ir/mir/domain_barrier.rs`) during MIR lowering, which walks call sites and injects the barrier instruction ahead of each crossing call.

---

**Maturity — this is a scaffold, and its security guarantee is not yet load-bearing.** `@domain` is specified and wired end-to-end, but a programmer MUST NOT presently rely on it as a speculative-execution mitigation. Four limitations are normative and deliberate:

1. **The barrier is conservative, not microarchitectural.** What is emitted today is a full compiler/memory barrier. It is **not** the architecture-specific microarchitectural sequence a hardened boundary requires — there is no `lfence` (x86_64), no `isb`/`dsb` (aarch64), and no cache- or branch-predictor-state flush. The correct per-architecture sequence is a policy question that this revision does not pin down.
2. **Direct named calls only.** Only statically resolved direct calls are instrumented. **Indirect calls and virtual/interface dispatch are not instrumented** — a crossing that occurs through a function pointer or a dynamic dispatch receives no barrier.
3. **No diagnostic is emitted.** The compiler reports nothing for any domain crossing, whether or not the crossing was intended. There is no error code, no warning, and no way to declare a crossing forbidden; `@domain` cannot presently be used to *enforce* a partitioning, only to annotate one.
4. **No-op for un-annotated programs.** A program containing no `@domain` annotation compiles to a byte-identical image with and without the pass. `@domain` imposes zero cost on code that does not use it.

Programmers requiring an actual speculation barrier today should emit the architecture's sequence explicitly with `asm { }` (§3-3.7) inside an `@unsafe` boundary. `@domain` is the surface that sequence will eventually attach to.

### §3-3.17 `MaybeUninit[T]` — Uninitialized Memory

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

### §3-3.17a `PartialInit[T]` — Field-Tracked Struct Initialization

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
  return p.complete()   # ✓ all fields set
}

# Compile-time error — .checksum not set:
func badHeader(src: uint16, dst: uint16, len: uint16): NetworkHeader {
  var p = PartialInit[NetworkHeader].begin()
  p.set(.srcPort, src)
  p.set(.dstPort, dst)
  return p.complete()   # ✗ E_PARTIAL_INIT_INCOMPLETE — .length and .checksum not set
}
```

**`field_ref[T, F]` — compile-time field reference.** `field_ref[T, F]` is a compile-time type representing a reference to a specific field `F` on struct type `T`. Field references are produced with the `.fieldName` dot-literal syntax in a `PartialInit.set` call and are resolved entirely at compile time — they have zero runtime representation. `field_ref` is not a first-class value type; it can only appear as a `PartialInit.set` argument.

**API:**

```loup
struct PartialInit[T] {
  pub static func begin(): PartialInit[T]
  pub func set[F](field: field_ref[T, F], value: F): void
  pub func complete(): T    # compile-time error if any field unset (E_PARTIAL_INIT_INCOMPLETE)
  pub func isComplete(): bool  # runtime check — always true before complete() or compile-time verified
}
```

`T` must be a `@repr(C)` struct type (`E_PARTIAL_INIT_NOT_REPR`). Available in `@mode(host.native)` and `@mode(freestanding)`.

| Code | Mode | Condition |
|---|---|---|
| `E_PARTIAL_INIT_READ` | host.native, freestanding | Reading a field of a `PartialInit[T]` that has not yet been set via `.set()` |
| `E_PARTIAL_INIT_INCOMPLETE` | host.native, freestanding | `complete()` called before all fields are set |
| `E_PARTIAL_INIT_NOT_REPR` | host.native, freestanding | `PartialInit[T]` with a non-`@repr(C)` struct type |
| `E_FIELD_REF_INVALID` | host.native, freestanding | `.fieldName` in `PartialInit.set` does not name a field of `T`; `PartialInit.set`'s first argument is not a `.fieldName`; or a `.fieldName` appears anywhere else |
| `E_PARTIAL_INIT_MODE` | host.scripted, web.* | `PartialInit[T]` used outside `@mode(host.native)` / `@mode(host.dual)` / `@mode(freestanding)` |

Field tracking follows statement order: a `.set` counts for every statement after it (including one inside a branch taken or not), so `E_PARTIAL_INIT_READ` / `E_PARTIAL_INIT_INCOMPLETE` report the fields no earlier statement has set. `begin()` is recognised as the initializer of a `let`/`var` binding.

### §3-3.17b `buffer[T, N]` — Fixed-Size Buffer

*(This section is normative. Applies to `@mode(freestanding)`.)*

`buffer[T, N]` is an unmanaged, fixed-size value block of exactly `N` elements of element type `T`, where `N` is a positive **compile-time integer** — a literal, or any const-expression (§1-6.2): a `const` binding, a `const func` call, `size_of[T]()`, and arithmetic over them. `buffer[Entry, PAGE_BYTES / size_of[Entry]()]` is the shape this exists for; a table sized by a number the source computes rather than by one the author restated. The count is evaluated during lowering, so everything after it sees an ordinary number — the rule reaches only the permitted-expression grammar in type position, never generic instantiation. A count that is not const-evaluable is `E_CONST_NOT_EVALUABLE`; one below 1 or above `uint32` range is `E_BUFFER_COUNT_RANGE`, the same rule the literal form has always had. It is the freestanding counterpart to a C `T[N]` array: no managed runtime, no header, no reference counting. A **compile-time-constant** index outside `0..N` is a compile error (`E_BUFFER_INDEX_RANGE`); a **runtime (non-constant)** index is unchecked — an out-of-range runtime index is undefined behavior, exactly like a C array or `bufGet/SetU64`. It is the natural representation for kernel data structures that today are hand-rolled over fixed scratch addresses: bitmaps, free-lists, per-CPU tables, and page-table blocks.

`buffer[T, N]` is **distinct from `array[T, N]`** (§1-4.10). `array[T, N]` is a *managed, reference-counted, rank-N strided* (multi-dimensional) array whose second argument is the **dimension count**, indexed `a[i, j, …]`; it is not freestanding-viable. `buffer[T, N]`'s second argument is the **element count**, and it is indexed by a single flat `int`.

```loup
@mode(freestanding)

func bitmapDemo(): uint64 {
    var bits: buffer[uint64, 4];   # C: a loup_int[4] value block
    bits[0] = 0xFF as uint64;      # indexed write (b[i] = v)
    bits[3] = 0x1 as uint64;
    return bits[0] + bits[3];      # indexed read (b[i]) → uint64
}
```

**Two forms: allocate and overlay.**

- **Allocate** — `var b: buffer[T, N];` (no initializer) allocates a fresh block; elements are zero-initialized. The block lives in the program's own storage at a compiler-chosen address.
- **Overlay** — `var b: buffer[T, N] = addr;` where `addr` is an integer (an address) does **not** allocate: it views the memory at `addr` as the buffer, so `b[i]` reads/writes `((T*)addr)[i]`. This is the typed, bounds-`N` equivalent of the `bufGetU64(addr, i)` / `bufSetU64(addr, i, v)` intrinsics (§3-3.4.2) — the idiomatic way to treat a fixed identity-mapped scratch page, a DMA buffer, or a hardware register block as an array. The integer initializer is the only non-`buffer` value accepted for a buffer binding; any other initializer type is a compile error. Two overlays over the same address alias the same memory.

**Overlays are unsafe views (loup#864, row OVL-1).** An overlay turns an integer into a typed view of memory the compiler cannot check — the counterpart of Rust's `&mut *(addr as *mut [T; N])`, which Rust admits only under `unsafe`. Creating one therefore needs an explicit acknowledgement through the language's existing unsafe mechanism (§3-2.4.6):

- `@unsafe("reason")` on the overlay's **declaration** — a local, a module global, or a struct field (below); or
- for a local, a lexically enclosing **`unsafe("reason") { … }` region**.

The reason is mandatory (`E_UNSAFE_NO_REASON`, as on every `@unsafe`); any non-empty reason acknowledges, and the convention is `overlay: <why this address is valid>`. An unacknowledged overlay is `W_OVERLAY_NOT_UNSAFE` at the declaration's name, with the fix-it in the message. A buffer binding initialized from another *buffer* value (`var page: buffer[uint64, 512] = rqBuf();`) is not an overlay — no integer becomes a view there — and needs no acknowledgement. `grep -E '@?unsafe\('` therefore lists every overlay in a codebase.

```loup
@mode(freestanding)

@unsafe("overlay: the local APIC's identity-mapped register page")
var lapic: buffer[uint32, 1024] = 0xFEE00000;

func zeroScratch(base: uint): void {
    unsafe("overlay: the boot scratch page the loader reserved at `base`") {
        var page: buffer[uint64, 512] = base;
        for (var i = 0; i < 512; i = i + 1) { page[i] = 0 as uint64; }
    }
}
```

**The declaration is the only entry point.** *Compiler's rule:* an integer becomes a buffer only through an overlay DECLARATION — the initializer of a `buffer[T, N]` binding or field, acknowledged as above. Every other position where a value flows into a `buffer[T, N]` takes only a buffer: an integer (or any other non-buffer value) **assigned** to a buffer variable (`b = addr;`), **stored** into a buffer field (`o.regs = addr;`), **passed** for a buffer parameter (`take(addr)`), given for a buffer field at **construction** (`Uart(regs = addr)`), or **returned** from a function declared to return a buffer (`return addr;`) is `E0001` — as is a non-buffer, non-integer initializer of a buffer binding or struct field (`= "s"`) and ANY non-buffer default of a CLASS's buffer field (a class has no overlay fields; the field form above is a struct's) — with the type mismatch's ordinary message (`cannot assign 'uint64' to 'buffer[uint64, 8]'`, `argument 1 of 'take': expected 'buffer[uint64, 8]', found 'uint64'`, `field 'regs' of 'Uart': expected …`, `return type 'uint64' is not assignable to expected return type …`). Otherwise an address could become a view with no acknowledgement at all. A buffer-valued expression — another buffer, or a call to a function returning one (`var page: buffer[uint64, 512] = rqBuf();`) — is a typed view and flows freely. Both checkers report the same code, text and span (the self-hosted checker types a buffer `Any` and keeps each slot's declared shape beside it, loup#864).

**Overlay fields.** A struct field may take the overlay form, `@unsafe("overlay: …") var regs: buffer[uint32, 16] = UART0_BASE;`: every value of the struct views the memory at the address its initializer names (evaluated per construction, like any field default). *Compiler's rule:* a `buffer[T, N]` field declared **with an initializer** is an overlay field — the classification is syntactic, so both checkers make it before the initializer is typed — and its integer initializer needs the field declaration's `@unsafe("…")` (rule above; `W_OVERLAY_NOT_UNSAFE` names the field and its struct). Copying a value of the struct copies the view, never the memory viewed, which is exactly the duplication the next rule governs. A struct with an overlay field is therefore **move-only** (core §1-10.3.2): `let b = a` moves `a`, and a later use of `a` — the implicit copy that would leave two values viewing one raw block — is `W_OVERLAY_STRUCT_COPY`, as is a `with` copy. A second view that is really wanted is written explicitly, with no new syntax: as the initializer of an `@unsafe("…")` binding (`@unsafe("overlay: a read-only second view") let shadow = uart;`), or inside an `unsafe("…") { … }` region; either copies without consuming the source. A `takes` transfer keeps its ordinary rule (`E_USE_AFTER_TAKE`).

**Staged rollout (row OVL-1).** In 1.23 both rules are **warnings**, so the overlays of the first freestanding consumer (Helios: 211 overlay locals) keep building while they migrate. `[freestanding] overlays = "error"` in the manifest (§3-3.21) turns them into `E_OVERLAY_NOT_UNSAFE` / `E_OVERLAY_STRUCT_COPY` for that package, and `LOUP_OVERLAYS=error` in the compiler's environment does the same for any compile (a bare-file `loup run`, a gate); the environment can only strengthen the manifest, never weaken `"error"`. The release after Helios migrates makes errors the default. Both checkers report the same codes, text and spans.

**Semantics.**

- A buffer is declared, not constructed — there is no buffer literal; the only initializer is an overlay address.
- **Indexing** `b[i]` yields `T`; `b[i] = v` stores `v`. The index is an `int`; a non-`int` index is a compile error.
- **Storage model (this revision).** Elements occupy machine-word (`loup_int`) slots: a `buffer[T, N]` is laid out as `N` word-sized slots regardless of `T`'s declared width, and indexing reads/writes a full slot. This is exact for word-width element types (`uint64`/`int64`) — the kernel's primary use — and value-correct (but not byte-packed) for narrower element types. Byte-exact packed layout for sub-word element types is a future refinement.
- **Struct elements (loup#704).** A `buffer[S, N]` whose `S` is a struct holds each element **inline**: every element owns the words of one `S` value (and of each struct nested in it), `b[i] = v` **copies** `v` into element `i` (a deep copy, like any struct assignment, §1-10.3), and `b[i]` designates element `i` itself — `b[i].f` reads and `b[i].f = x` writes that element's field. Each element is an independent value: storing into one never changes another. *Compiler's rule:* an element of a struct `S` occupies `S`'s own value block and one block per struct nested in it (the native backends' uniform struct block width), not one pointer; a `@repr(C)` or `@repr(transparent)` element type keeps its own layout (a transparent element is its single scalar). Reading an element into a binding, an argument or a `return` (`let e = b[i]`, `f(b[i])`, `return b[i]`) copies it like any struct read (§1-10.3), so a later store into element `i` never changes `e`. An element never stored holds the all-zero value of `S`, its nested structs included: each nested struct field designates that element's own zeroed nested block, never a null pointer. *Compiler's rule (batch 32):* the native backends write an element's nested-struct pointer words (the addresses of the element's own nested blocks) whenever they hand the element out, so they hold whatever produced the storage — a static, the frame, a module global, a struct's buffer field or a parameter.
- **Struct fields (loup#864).** An OWNED buffer field — `var f: buffer[T, N];` in a struct or class, with no overlay initializer — is an inline **value**, like Rust's `[T; N]`: its `N` elements are part of the value that holds it, wherever that value lives (a frame, a module global, a buffer element, a caller's result block, a nested struct, an enum payload). Every copy of the value — a binding, an argument the lane copies, a `return`, a field store, an element store, a `with` copy — copies the elements, so a copy is independent of its source; a default-initialized value's field is zeroed storage of its own, never a null pointer and never a block another value also uses; two values built at one site, or by two activations of one function (re-entry, recursion, an interrupt, another CPU), never share it. A copy whose source is provably dead, or which a callee provably cannot observe, may be elided. An OVERLAY buffer field (`= addr`) keeps designating the memory at its address: a copy of the struct copies the address, never that memory (its rules: loup#864 item 2). *Compiler's rule (BUFV-1):* the freestanding LLVM lanes (Stage0 `--backend llvm` and `--backend llbe`; the self-hosted loup-llvm through clang and through loup-llbe) and the managed (hosted) LLVM lanes of both toolchains (Stage0 `--target native --backend llvm`; the self-hosted loup-llvm's hosted route) give a value's block its field words (`block_slots` of them on the freestanding lanes; on a managed lane, a reference object's field words after its ARC header) followed by a TRAILING REGION holding each owned buffer field's elements (`elem_bytes × N`, rounded up to whole words; an `@align(A)` type's region starts `A`-aligned; a nested struct's block, a struct element and a result block are sized the same way), and the field's word always holds the address of its own region — a copy copies the region and re-points the destination's word, never the source's address. A copy whose only use is a `reads` argument of a direct call to a PURE READER (a callee, and everything it calls, that writes no memory but its own frame and the fresh values it builds) is not made: the callee reads the caller's value, which nothing it runs can change. On every lane the trailing region adds words to the types that own buffer fields and to no other: a type without one keeps its layout and its size (a layout-stability rule). The interpreters of both toolchains store an owned buffer field as `N` element slots of the value that holds it, zeroed at construction and copied with every copy of the value (PSTORE, §1-2.4.7). The C backend (freestanding and hosted) and Cranelift keep a buffer field OUT OF LINE, in one block per construction SITE, so it REFUSES (`E_BUFFER_FIELD_LANE`, naming each field) every program in which that block could be shared: reachable code other than module initialization constructs a value with an owned buffer field (each run of the site would reuse the block), or reachable code copies a value that holds one at any depth (the copy would share its source's block). A value built once by module initialization and never copied — a module-global page table — owns its block alone, and those lanes still build it. The Wasm lane implements no `buffer` storage: it refuses every program whose reachable code constructs a value with an owned buffer field, module initialization included (`E_BUFFER_FIELD_LANE`). COST: the elements are in the value, so a frame holding a copy holds them (a `buffer[uint64, 512]` field puts 4 KiB in each frame that copies its struct) — the number the freestanding stack-budget check counts (loup#864 item 3); row BUFV-1 in `specs/x-update-v1_20-to-v1_21/design.md`.
- **Element count `N`** must be ≥ 1; `buffer[T, 0]` (or negative) is `E_BUFFER_COUNT_RANGE` at parse time.
- **Constant-index bounds.** `b[K]` with a compile-time-constant `K` outside `0..N` (including negative `K`) is `E_BUFFER_INDEX_RANGE` — the safety win over unchecked `bufGet/SetU64`. A non-constant index `b[i]` is not bounds-checked by default.
- **Runtime bounds (`[freestanding] bounds = "trap"`).** With the manifest key set, a non-constant subscript of a buffer whose extent is visible from its DECLARED type — a module global, a local (an overlay included), a struct field, and a `buffer[T, N]` PARAMETER — and every subscript of a `buffer[T, _]` parameter (against its hidden extent word, below) is guarded at run time: an index outside `0..N` is a panic under the package's `[build] panic` policy (§3-3.6) — under `custom` it reaches the `@panic_handler` with `buffer index out of range`, under `halt` / `abort` the core halts or faults — instead of touching the neighbouring memory. `bounds = "off"` (the default) emits nothing at all. A subscript whose extent the compiler cannot see is left unguarded rather than guarded against a guessed `N`. The parameter's declared `N` is its bound because the call site holds the argument to it: `buffer[T, 16]` is not `buffer[T, 8192]`, and passing one for the other is a type error on every lane (loup#474 — until then a parameter subscript was never guarded, on either backend, and the self-hosted build lane accepted the mismatched argument).
- **Buffer arguments.** A `buffer[T, N]` argument's declared `N` and `T` SHALL match the parameter's exactly; there is no implicit narrowing or widening of a buffer's extent. The one exception is the wildcard-extent parameter below, which takes an argument of any `N`.
- **Wildcard-extent parameters (`buffer[T, _]`; row BUFX-1, loup#897).** A parameter may declare its extent `_`, for a helper that serves tables of different sizes and bounds its accesses by an argument it is given: `func capLoad(tbl: buffer[uint64, _], slot: uint64, words: uint64): uint64`.
  - *Binding.* Any `buffer[T, N]` argument binds to a `buffer[T, _]` parameter, whatever its `N`; `T` must still match exactly (`E0001`, with the ordinary `argument 1 of 'capLoad': expected 'buffer[uint64, _]', found 'buffer[uint32, 8]'`). A buffer of every form passes alike: a module global, a local (an overlay included, so a DMA window or a register block), a struct or class field, a parameter.
  - *The hidden extent word.* The callee's type does not say `N`, so the caller passes it. *Compiler's rule (the calling convention):* after the call's declared arguments — after any default values DEF-1 fills in, and after the receiver of a method, which stays first — the caller passes ONE HIDDEN WORD per `buffer[T, _]` parameter of the callee, in parameter order, holding the argument's declared `N` (an `int`-width word). The callee receives each as a parameter after its declared ones. Every call form passes them the same way — a direct call, a method call under any dispatch (static, virtual, interface), a constructor, a `super` call and a call through a FUNCTION VALUE (below) — on every lane that implements buffers (Stage0's LLVM and C emitters, the self-hosted loup-llvm on both routes, loup-llbe on every arch it targets, and both interpreters, which store buffers since PSTORE (§1-2.4.7) and receive the hidden words as arguments; the Wasm lane and Cranelift implement no `buffer` storage or indexing), and a bodiless declaration of a function with a `_` parameter is called with them too. The words are fixed when the whole program is lowered, so separate compilation (§3-3.21.2), which splits only the `.ll` → object step, sees them in every unit's text. A function with no `_` parameter is called exactly as before.
  - *Forwarding.* A `buffer[T, _]` parameter passed for another `buffer[T, _]` parameter forwards its own hidden word, so the callee sees the original caller's `N`. A `_` argument must name that parameter directly (`E_BUFFER_EXTENT_PLACEMENT` otherwise). Passed for a FIXED `buffer[T, M]` parameter — or returned, assigned or stored where a fixed buffer is expected — it is `E0001` (`… found 'buffer[uint64, _]'`): its extent is not known at compile time, so it is no `buffer[T, M]`.
  - *Bounds.* A `buffer[T, _]` parameter has no compile-time `N`: `E_BUFFER_INDEX_RANGE`'s constant-index check does not apply to its subscripts, and neither does the guard's literal in-range elision (loup#410). Under `[freestanding] bounds = "trap"` EVERY subscript of a `_` parameter — computed or constant — is guarded at run time against the hidden word (`0 <= i < N`), and fails exactly as a fixed extent's guard does; it is never left unguarded. Under `bounds = "off"` nothing is emitted, as for a fixed extent.
  - *Placement.* `buffer[T, _]` is a PARAMETER type only — of any parameter: of a module-level function, of a method or constructor of a class, struct or interface, of a lambda, of a block (nested) function, and of a FUNCTION TYPE (`func(buffer[T, _], int): uint64`, which may itself appear wherever a function type may: a parameter, a field, a global, a local, a type argument, a return type). Anywhere else a bare `buffer[T, _]` is `E_BUFFER_EXTENT_PLACEMENT` — one error, at the annotation, naming the position: a field or an enum variant payload, a module global, a local (declared, or inferred from a `_` parameter — `let t = tbl`), a return type (a function type's result included), a type argument (`Option[buffer[T, _]]`, `buffer[buffer[T, _], 4]`), and a parameter with a default value (its default would have no extent). A signature fixed for a foreign ABI has no hidden word, so `_` is refused ANYWHERE in one, a function-type parameter there included (`extern native … func ext(cb: func(buffer[T, _]): void)`): an `extern` declaration, a function whose signature an annotation fixes (`@jsexport`, `@callconv`, `@naked`, `@interrupt`), and a method of an `@interchange` type.
  - *Function values (row BUFX-1, amended 2026-10-15 by the maintainer: full function-value support).* A function, method, lambda or block function with a `_` parameter used as a VALUE has a function type carrying the `_` (`let f = capLoad` is a `fn(buffer[uint64, _], int): uint64`), and a call through any function value passes the hidden words exactly as a direct call does: the closure calling convention carries them after the declared arguments, and a named function's thunk takes and forwards them. *Compiler's rule (matching):* a function type's `buffer[T, _]` parameter matches ONLY `_` — the two calling conventions differ by the hidden word, so there is no conversion between `fn(buffer[T, _])` and `fn(buffer[T, N])` in either direction (no adapter thunks); assigning, passing, binding or returning one for the other is `E0001`, whose text adds `a function type's `buffer[T, _]` parameter matches only `_``. An override, and an implementation of an interface method, takes `_` exactly where the method it overrides or implements does, by core §1-8.3.1's matching-signature rule (`E_OVERRIDE_NO_TARGET` / `E0001`).
  - *Captures.* A closure capturing a `buffer[T, _]` parameter captures its address AND its hidden word: the closure environment holds both, and under `bounds = "trap"` every subscript of the captured buffer inside the closure is guarded against the captured `N`. An escaping closure capturing a buffer parameter follows the fixed-extent rule: the closure holds the address the parameter held — a buffer's storage is the program's for its whole run (a module global, a field's block, a local's per-function static block), except an `onstack` local's frame block, whose escape analysis (§3-3.17c) refuses passing it to a parameter that a closure captures (`E_ONSTACK_ESCAPES`) whatever the parameter's extent.
  - The buffer surface is unchanged: a `_` parameter, like every buffer, has only indexed get and set — no length method. A callee that needs a logical bound takes it as an argument.
- **Raw-poke gating (`[freestanding] rawpoke`).** The raw-poke intrinsics `bufGetU64` / `bufSetU64` / `bufGetU32` / `bufSetU32` / `bufGetU8` / `bufSetU8` / `bufGetU8Vol` / `bufSetU8Vol` (§3-3.4.2) read and write an ARBITRARY address, from any function of any module. The manifest key `[freestanding] rawpoke` makes `grep @unsafe` a complete audit of a package's raw-poke surface: with `"unsafe-only"` a call that is not acknowledged is `E_RAWPOKE_UNSAFE_ONLY` (an error), with `"warn"` the same calls are warnings and the package builds, and with `"allow"` — the default, and what a package without the key gets — nothing is reported. A call is acknowledged when the enclosing function or method (a `struct` method included) carries `@unsafe("reason")`, when it sits inside an `unsafe("reason") { … }` region (§3-2.4.6), or when the compiler synthesized the enclosing method (the `@interchange` `packInto` / `unpackFrom` family, §4-2), which has no source line to annotate. The acknowledgment reaches everything nested in it: a lambda or a nested declaration inside an `@unsafe` function is acknowledged. Any other spelling of the value is a build error naming the accepted ones, never a silent `"allow"`. `makeBufferU64` / `makeBufferU32` are not gated: they make a typed view, and every access through it is a `buffer[T, N]` subscript. *Compiler's rule (batch 34):* the check sees a call in EVERY expression position — a cast operand (`bufGetU8(a, i) as uint64`), a `match` scrutinee, guard or arm, an `if` expression, a lambda body, a field default, constructor and literal arguments, a `defer` body, an `asm` input operand — on both toolchains, which give the same diagnostics (the self-hosted build receives the key from `loup-build` as loup-llvm's `rawpoke=<value>` token). A parameter's default value is evaluated as its own module-level function (DEF-1), so an `@unsafe` on the declaring function does not acknowledge a raw-poke call written in the default. *Compiler's rule (RAWPOKE-1 (a), ruled 2026-10-12):* a CALL to one of the address-taking methods the compiler synthesizes for an `@interchange` type — `packInto(addr)`, `unpackFrom(addr)` and their `packIntoVolatile` / `unpackFromVolatile` forms — is a raw poke too: it reads or writes the record at a caller-supplied address. It is reported as `'<Type>.<method>'` and acknowledged exactly as an intrinsic call is. The receiver's TYPE decides — the type of a value receiver, or the type a bare name denotes in `T.unpackFrom(addr)` — never the method's name: a method called `packInto` on a type that is not `@interchange` is an ordinary call.
- A buffer is a value block with no growable operations: there is no `.push`, `.length`, resize, or any `list`/`array` method — only indexed get/set.

`buffer[T, N]` is the typed, ergonomic surface over the freestanding `makeBufferU64(N)` / `bufGetU64` / `bufSetU64` intrinsic family (§3-3.4.2): the compiler lowers a buffer declaration to the same backing block and its indexing to the same loup_int-slot accesses.

| Error code | Modes | Trigger |
| --- | --- | --- |
| `E_BUFFER_COUNT_RANGE` | freestanding | `buffer[T, N]` declared with element count `N < 1` |
| `E_BUFFER_INDEX_RANGE` | freestanding | `buffer[T, N]` indexed with a compile-time-constant index outside `0..N` |
| `E_BUFFER_EXTENT_PLACEMENT` | all | a bare wildcard extent `buffer[T, _]` anywhere but a parameter — of a function, method, constructor, lambda, block function or function type (a field, global, local, return type, type argument, defaulted parameter); `_` anywhere in an `extern` / `@jsexport` / `@callconv` / `@interchange` signature, a function-type parameter there included; a `_` argument that does not name a `_` parameter (row BUFX-1, loup#897, amended 2026-10-15) |
| `E_OVERLAY_NOT_UNSAFE` | freestanding | an overlay (`buffer[T, N]` declaration with an integer initializer — local, module global or struct field) with no `@unsafe("reason")` on its declaration and, for a local, no enclosing `unsafe("reason") { … }` region; reported under `[freestanding] overlays = "error"` (row OVL-1) |
| `W_OVERLAY_NOT_UNSAFE` | freestanding | the same site in the default `overlays = "warn"` mode (1.23) |
| `E_OVERLAY_STRUCT_COPY` | freestanding | an implicit copy of a struct holding an overlay field — a use of the source after a move, or a `with` copy — outside an explicit acknowledgement (core §1-10.3.2); reported under `overlays = "error"` |
| `W_OVERLAY_STRUCT_COPY` | freestanding | the same site in the default `overlays = "warn"` mode (1.23) |
| `E_BUFFER_FIELD_LANE` | all | a lane that keeps an owned `buffer[T, N]` field out of line (the C backend, Cranelift) builds a program whose reachable code constructs a value with one outside module initialization, or copies a value holding one; the Wasm lane, which has no `buffer` storage, builds a program whose reachable code constructs one at all (loup#864, BUFV-1, PSTORE) |
| `E_RAWPOKE_UNSAFE_ONLY` | freestanding (opt-in) | `[freestanding] rawpoke = "unsafe-only"` (error) or `"warn"` (warning): a raw-poke intrinsic, or an `@interchange` type's synthesized address-taking method (`packInto` / `unpackFrom` and their `…Volatile` forms), called outside an `@unsafe` function / method or an `unsafe("…") { … }` region |

### §3-3.17c `onstack` — Guaranteed Stack Placement

*(This section is normative. Applies to `@mode(freestanding)`.)*

`onstack` is a **storage-class modifier** on a local `let`/`var` declaration. It guarantees that the binding's aggregate storage is materialized in the enclosing invocation's stack frame:

```loup
@mode(freestanding)

func hfsBtreeLookup(key: uint64): uint64 {
    onstack var walk: buffer[uint64, 64];   # descent buffer — one per invocation
    onstack var b: BuddyAllocator;          # struct local — one per invocation
    ...
}
```

**Why it exists.** Freestanding lowering materializes a `buffer` local as a per-function static block (`__bufdata_<fn>_<reg>`), and a struct local as `__obj_<fn>_<reg>` whenever the placement analysis declines to promote it. Both are **one block shared by every invocation**: two concurrent CPUs, or a re-entrant call, or an interrupt landing inside the frame, all read and write the same bytes. `onstack` is how a function says "this local is a local".

**It is a guarantee, not a hint.** The motivation is re-entrancy, so a silent demotion to a shared block would be worse than no modifier at all — the author would believe the code re-entrant when it is not. Therefore:

> When `onstack` cannot be honoured the compiler SHALL emit an error naming the reason. It SHALL NOT warn-and-demote, and SHALL NOT fall back to static storage.

**Where it is accepted.**

- **Mode.** `@mode(freestanding)` only. Elsewhere it is `E_ONSTACK_NOT_FREESTANDING` (in the managed modes a local aggregate is already per-invocation or ARC-managed, so the modifier has nothing to guarantee).
- **Position.** A *local* declaration inside a function, method, or block body. On a module-scope binding, a parameter, or a field it is `E_ONSTACK_NOT_LOCAL`.
- **Single binding.** `onstack` applies to one declaration naming one aggregate. On a destructuring binding (§1-6.8) it is rejected at parse time — several names, no single block to place.
- **Declared form.** A declaration that materializes an aggregate block: the **allocate** form of `buffer[T, N]` (§3-3.17b) and a struct- or `local class`-typed local. On anything else — a scalar local, the **overlay** form `var b: buffer[T, N] = addr` (which allocates nothing; the storage is the caller's), or a managed collection — it is `E_ONSTACK_NOT_AGGREGATE`. The modifier is rejected rather than ignored, because a silently-accepted no-op reads as a guarantee that was never made.

**The escape rule.** The compiler runs a frame-escape analysis over the function's MIR, tracking the declared block's address. The address may be:

- read and written by indexing (`b[i]`, `b[i] = v`), field access, and the freestanding buffer intrinsics;
- passed as an argument to a callee whose corresponding parameter is proven non-escaping by the module-wide parameter fixpoint;
- named as an `asm` input operand (an `asm` block sees only its declared operands).

Anything else — returning it, storing it into a global or a field, passing it to a callee whose parameter is not proven non-escaping, passing it to an unresolved/indirect call — is an **escape**, and is `E_ONSTACK_ESCAPES`. The diagnostic names the escape site.

**The bail-out rule.** The placement analysis is exhaustive over the MIR instruction set: an instruction it does not model would make its answer unsound. Without `onstack` an unmodelled instruction merely loses an optimisation. **Under `onstack` it is `E_ONSTACK_UNMODELED`**, and the diagnostic names the instruction — otherwise the guarantee would be contingent on unrelated code elsewhere in the same body, which is the failure class this modifier exists to remove.

**Codegen contract.** An `onstack` binding lowers to an entry-block frame allocation (`alloca` on the LLVM/llbe backends; a C automatic array on the C backend), sized and aligned exactly as the corresponding static block would have been, including any `@align(N)` on the type. No `__bufdata_*` / `__obj_*` symbol is emitted for it, which makes the guarantee externally checkable with `readelf`/`nm`. A `buffer[T, N]` **field** of an `onstack` struct or class local travels with it: the field's backing block is a separate allocation, and placing only the object block would honour the modifier in form while leaving the bytes the code actually reads and writes in a shared static.

**Zero-initialization.** §3-3.17b's "elements are zero-initialized" still holds, and the static block got it for free from its zero initializer. A frame block is zeroed explicitly **once per invocation, in the prologue** — which is the guarantee this modifier makes, and strictly stronger than the once-per-*program* zeroing a shared static gave. Two consequences follow and are normative: an `onstack` block declared inside a loop is **not** re-zeroed on each iteration (it is zeroed on entry to the function), and `@no_zero_locals` (§3-3.16b) suppresses this zeroing exactly as it suppresses every other prologue zeroing.

**`register` is deliberately not part of this feature.** A stack guarantee can always be honoured except for escape, which is a static property that can be named. A register guarantee cannot — spilling under allocation pressure is legitimate and code-dependent — and it does not apply to the motivating case at all (a `buffer[uint64, 64]` is 512 B). If register placement control is added later it must carry a different name and an explicitly advisory contract.

**Hazards the author owns.**

1. **DMA.** A stack address handed to a device is safe only while the transfer completes inside the frame's lifetime (a synchronous, polled, queue-depth-1 driver). On an asynchronous submission path a stack buffer is a use-after-free with a DMA engine writing into a dead frame. `onstack` SHALL NOT be applied to a buffer whose address is handed to an asynchronous DMA seam; a typed DMA buffer surface is the correct answer there.
2. **Stack budget.** The modifier moves the cost from `.bss` to the frame. It does not create the cost — it makes it visible and measurable at the declaration, where a stack high-water receipt can bound it, and where the static stack budget (§3-3.21.3) charges it to the frame. A large block (tens of KiB) on a small kernel stack is a stack overflow the modifier will not diagnose.

| Error code | Modes | Trigger |
| --- | --- | --- |
| `E_ONSTACK_NOT_FREESTANDING` | all | `onstack` outside `@mode(freestanding)` |
| `E_ONSTACK_NOT_LOCAL` | freestanding | `onstack` on a module-scope binding, parameter, or field |
| `E_ONSTACK_NOT_AGGREGATE` | freestanding | `onstack` on a declaration that materializes no aggregate block (scalar, overlay-form `buffer`, managed collection) |
| `E_ONSTACK_ESCAPES` | freestanding | the `onstack` block's address escapes the frame; the diagnostic names the escape site |
| `E_ONSTACK_UNMODELED` | freestanding | the placement analysis met an instruction it does not model in this body; the diagnostic names it |

### §3-3.17d Frame-Held Class Instances — Identity, Storage, Lifetimes and Return Provenance

*(This section is normative. Applies to `@mode(freestanding)`. Ruling CLSID-1, loup#872, amended 2026-10-15 by the maintainer: the full Rust model, and Q-F, the Rust model of storage with Rust's E0506; Q-G, dispatched calls and lambdas, and Q-H, escaping parameters, 2026-10-16.)*

**Identity.** A freestanding `local class` instance is a value block with no allocator behind it: a local's instance lives in a frame slot of its declaring block (or, where the placement analysis declines to promote it, the per-function `__obj_<fn>_<reg>` static of §3-3.17c), a module global's in its static block. It keeps its identity (core §1-8.1.1): a class-typed binding of a local or a global (`var b: Ring = t`), an assignment (`b = t`), a field store (`h.r = t`), a class- or interface-typed parameter, an interface conversion and a payload name the SAME instance as their source — nothing copies a class instance implicitly, and a mutation through either name is seen through the other. A class-typed FIELD is a reference: storing into it re-points it (`h.r = t; h.r = u` leaves `t` intact), and a copy of its holder (a FRESH result moved into the caller's storage) copies the reference, never the instance it names. Only a nested STRUCT field is a nested value (core §1-10.3).

**Storage.** Every class-typed local declaration owns ONE storage slot in its declaring block, and every class-typed module global owns its own static slot (Rust's owned binding) — whether its type is written or inferred (`var u = Ring.make()`, `var gU = mkRing()`). A FRESH value — a constructor, or a call whose result the caller owns — bound or assigned to such a variable (`var t = Ring.make()`, `t = Ring.make()`, `gRing = Ring.make()`) is built in that variable's own slot, and the variable then names its own slot again: Rust's move-assignment into an owned binding. There is no per-site home for an assignment, so `cur = Ring.make()` in a loop builds each iteration's instance in `cur`'s slot, and `x = make()` in a loop body with `x` declared outside is not an escape — the instance lives in `x`'s slot, in `x`'s block. An assignment of a NAME, `x = t`, still shares: `x` names `t`'s instance, and `x`'s own slot is untouched until its next fresh assignment. A fresh value stored into a global's field gets a static home; stored into a field of a local, a parameter or `self` (`h.r = Ring.make()`), or handed to a constructor whose result a local receives (`let h = Holder(r = Ring.make())`), it is a TEMPORARY of the current block, held in a frame slot exactly like a named local.

**Lifetimes.** A named local, and a block's temporary, lives as long as its declaring block; a parameter (`self` included) borrows the caller's storage for the call. Every name that receives a frame-held instance inherits that lifetime: `keep = t`, `h` after `h.r = t`, an interface-typed local bound to `t`, and the binding of a call whose result borrows `t` or holds it (below).

**Return provenance.** Both checkers summarize what every function's result names — over the whole program, to a fixed point over recursion, on every build (§3-3.21.2). There is no package interface file: every cache that holds a lowering keys on the content of the whole program's sources, or on the lowered unit's own text, so a change to a dependency's provenance reaches its callers' lowering (gated warm-cache by `tests/freestanding_qemu/class_provenance_cache`):

| Summary | Returns | At the call site |
|---|---|---|
| FRESH, holding parameters `H` | a constructor, a FRESH call, or the function's own local moved out (core §1-10.3, row RETC-1); `H` lists the parameters whose instances the result holds (`return C(p)`; a holder whose field is a parameter — Rust's elided `fn f(x: &V) -> S<'_>`) | the caller owns the result; its binding inherits the lifetime of every argument in `H` |
| BORROWED from parameters `B` | `return self` (`self` is parameter 0), `return p`, or a BORROWED call forwarding one | a name for those arguments' instances, with the shortest of their lifetimes (`t.me().mutate()` mutates `t`) |
| STATIC | `return gR`, a module global's instance | a name for the global; it never dangles |

Return paths join: STATIC with BORROWED(i) is BORROWED(i), because a static outlives everything; BORROWED(i) with BORROWED(j) borrows from both; the `H` sets join by union. A function that returns a FRESH instance on one path and a BORROWED or STATIC one on another is `E_RETURN_PROVENANCE_MIXED`: its caller could not tell whether it owns the result, and copying one path would break identity. Return a fresh instance on every path, or a name on every path.

**Dispatched calls.** A call through an interface, or to a method a subclass overrides (or an abstract one), has the JOIN of every implementation it may reach in the whole program as its summary: on a class receiver of static type `C`, the method `C` runs and every override in a subclass of `C`; on an interface receiver `I`, the method each class implementing `I` (directly, through a superclass or a superinterface) runs. A virtual `t.me()` that returns `self` in the base and in every override is BORROWED from the receiver, so its result names `t`'s instance and nothing is copied. When one implementation returns a FRESH instance and another a BORROWED or STATIC one, the dispatched method has no single calling convention: `E_RETURN_PROVENANCE_MIXED` at the ROOT declaration of the method (the class method no ancestor declares, or the interface method), naming the two disagreeing implementations — the first FRESH one and the first BORROWED or STATIC one in name order. All implementations of a dispatched method therefore share one result ABI — a pointer when the join is BORROWED or STATIC, the caller's result block otherwise — chosen by the join; their result TYPES need not be identical (an override's result may be a subclass), since every result block is the uniform value-block width. **Function values.** A function TYPE carries a provenance like a function, as in Rust, where a function type's lifetime signature is part of the type: the JOIN over every function, static method and lambda USED AS A VALUE of that structural type anywhere in the program (`apply(same, t)`, `let f = mk;`, `let id = func(p: Ring): Ring { return p; };`). A call through a value of the type — a parameter, local, field or global of function type — takes that provenance: BORROWED or STATIC binds the result without a copy (`let r = id(t)` names `t`), FRESH makes it the caller's own. Members that disagree — one returns a FRESH instance and another a BORROWED or STATIC one — are `E_RETURN_PROVENANCE_MIXED` at the first value use of either, naming both; return a fresh copy from every one, or a name from every one. Every function used as a value of a type shares that type's single result ABI: a value is called through its thunk, and a thunk whose function builds its result in a caller-provided block hands it a block of the thunk's own, which the caller of a FRESH value copies into storage of its own.

**Lambdas.** A lambda body is analysed like a function. Its own parameters are parameters; the names it CAPTURES from the enclosing scopes — a captured class instance is the creating frame's instance, shared, not copied (a captured `var` is a cell holding it) — are parameters it may not hand on: storing a capture into a module global or an object outside the lambda's frame, or returning it (or a new instance holding it), is `E_FRAME_INSTANCE_ESCAPES`. The lambda VALUE holds what it captured, like a FRESH instance holding its arguments: a lambda that captured an instance held by a frame inherits that frame's lifetime, so storing the lambda — or a function-typed local bound to it — into a longer-lived place (a module global, an enclosing block's local, an object outside the frame, a collection or payload) or returning it is `E_FRAME_INSTANCE_ESCAPES`, naming the captured instance. A lambda used within its frame — called, or passed to a parameter that does not escape (below) — is legal.

**Escaping parameters (Q-H).** Both checkers summarize, in the same whole-program pass and fixed point as return provenance, which parameters of every function, method, constructor and lambda ESCAPE: the callee stores the parameter, or anything holding it (a local bound to it, a lambda that captured it, an object or collection it was stored into), into a module global or a global's field, a field of an object outside its frame (another parameter's, `self`'s outside a constructor), a collection element or payload that outlives the call; returns a non-class value holding it (a class parameter's return is BORROWED, which the caller tracks); or passes it to an escaping parameter of another call. A dispatched call or a call through a function value escapes a parameter when ANY of its targets does. A `noescape fn` parameter (§1-19.7) is a declared contract and never escapes; a caller may pass any lambda to it. Passing an argument that holds an instance of the caller's frame — a lambda that captured one, or an object whose fields hold one — to an escaping parameter is `E_FRAME_INSTANCE_ESCAPES` at the call site, naming the parameter, the callee and where it lets the value escape: Rust's `F: 'static` bound, inferred instead of written. `keep(func() { t.bump(); })` with `func keep(f: fn(): void) { gF = f; }` is that error; the same lambda passed to a parameter the callee only calls is legal. A lambda's own returns are checked like a function's (a fresh instance on one path and a name on another is `E_RETURN_PROVENANCE_MIXED`), its calls are marked for the lowering like any function's, and what its body may assign joins the whole-program facts of the reassignment rule below (a call through a function value may reach any function).

**The escape rule.** Storing a frame-held name into a longer-lived place, or returning one the caller cannot be handed, is `E_FRAME_INSTANCE_ESCAPES`. Both checkers name the escaping value and the site:

| Site | Example |
|---|---|
| a local declared in an enclosing block | `var keep: Ring = …; while (…) { var t: Ring = …; keep = t; }` |
| a module global | `gRing = t;`, `gS = pick(1, t);` (FRESH, holding `t`), `gS = me(t);` (BORROWED from `t`) |
| a field of an object outside the block — a parameter's, `self`'s, a module global's, an enclosing block's local's | `self.sink = t;`, `p.r = Ring.make();` (with `edits p`) |
| a collection element, an enum payload, a collection literal | `b[i] = t;`, `Option.Some(t)`, `[t]` |
| a `return` of an instance the function owns only through a name | `return alias;` where `let alias = t`; `return C(t)` with `t` its own local |
| a `return` of the owning local while one of its fields holds a frame instance or a temporary | `h.r = t; return h;`, `h.r = Ring.make(); return h;` |
| a lambda that captured a frame instance, stored or returned (Q-G) | `gCb = func() { t.bump(); };`, `return func() { t.bump(); };` |
| a capture stored or returned inside the lambda (Q-G) | `func() { global gR; gR = t; }`, `func(): Ring { return t; }` |
| a lambda that captured a frame instance, or an object holding one, passed to an escaping parameter (Q-H) | `keep(func() { t.bump(); })`, `keepBox(b)` after `b.cb = func() { t.bump(); }` |

**Reassigning while shared (Rust E0506, "cannot assign to a borrowed value").** A fresh assignment `x = <fresh>` overwrites the instance in `x`'s own slot. It is `E_INSTANCE_REASSIGNED_WHILE_SHARED` when another name that may refer to that instance is LIVE after the assignment — used later on some path, on a later loop iteration or after the loop included. The names that may refer to it are those the escape walk below tracks:

| Name | Example (each followed by a use of the name after `keep = Ring.make()`) |
|---|---|
| a local or an interface-typed local | `prev = keep;`, `let s: Sink = keep;` |
| a field of a block-held holder | `h.r = keep;` |
| an enum payload | `let o = Option.Some(keep);` |
| a call result BORROWED from it | `let b = pass(keep);` |
| for a module global `x`: any global or global field that received it | `gA = gK;` |

The diagnostic names `x`, the other name and its later use, and suggests: a separate local for the new instance; no further use of the other name before the assignment; or, if value semantics were meant, a struct. Liveness is computed per function by both checkers over the names that received an instance. For a module global the rule is whole-program and conservative: `gK = <fresh>` is an error when any other global or global field may name `gK`'s instance anywhere in the program (`gA = gK` makes `gK = make()` an error everywhere), and a call is an error when a local alias of `gK` is live across it and the callee may — transitively, by the call-graph summary "may fresh-assign `gK`" — assign `gK` a fresh instance; dispatched calls are joined over every method of their name and a function value over every function. `prev = keep; keep = Ring.make(); use(prev)` (L1) and `gA = gK; gK = make()` (G1) are errors; the `cur` loop with no other live name, an alias dead before the assignment and `prev = keep; keep = make()` with `prev` never used again are legal. A `unique` instance moved out of a name is COPIED into the destination's own storage (core §1-8.11, ruling Q-I: Rust's move is a memcpy) — a binding, an assignment, a store into a global or a global's field, a `takes` argument — so the destination is an OWNER, not an alias of the source's slot: `let c = b; b = DmaBuf.alloc()` is legal and `c` keeps its own instance, and the moved instance's lifetime is the destination's (`gU = b` stores an instance of its own, no escape).

The analysis is flow-insensitive within a function: a name that receives a frame-held instance on any path inherits its lifetime, and a value counts only when its checked type is a class or an interface (a struct is a value and copies, core §1-10.3). A `takes` parameter (and `self` in a `takes func`) is the callee's own (core §1-10.3.2), but its storage is the caller's: returning it is BORROWED, storing it is an escape. A `unique` instance bound or assigned from a name is MOVED, not aliased (core §1-8.11): the new name owns it exactly when the old one did. Inside a constructor, `this` is the instance under construction, in storage the caller provides: storing a parameter into one of its fields is containment, which the caller tracks; storing the constructor's own local or a temporary there is an escape. *Compiler's rule (block scope).* The lowering reuses one storage block per declaration site: a loop body's local is rebuilt in place by the next iteration, so a name declared outside the loop that kept it would see the next iteration's instance, and an `if` block's local is released when the block ends. The remedies, which the diagnostic suggests: an explicit copy (a call that builds a fresh instance); passing the instance in from the caller (a result may hold or borrow a parameter); keeping it in a module global; or, where a holder should own the value, making the nested type a struct.

**Lowering.** Both lowerings and every freestanding emitter (Stage0's LLVM and C backends, the self-hosted `loup-llvm` on both its merged and per-module routes, and `loup-llbe`, which consumes `loup-llvm`'s IR) agree:
- A BORROWED or STATIC function returns a pointer to the instance its result names, and the caller binds that pointer without a copy (`var x: Ring = ringOf()` aliases the global, as `let s: Sink = ringOf()` does).
- A FRESH function returns through a caller-provided result block (sret), which the caller's binding owns.
- The checkers hand the lowering the call sites whose result is BORROWED or STATIC; every other class-valued call result is FRESH.
- A store into a class-typed field is a pointer store, and a copy of a holder copies its class fields' pointers.
- A `unique` moved out of a name (the checkers mark the site, `mov$<Class>` at its HirId + 2^29) is a value-block copy into the destination: a StructCopy for a binding, a field store or a `takes` argument (into a block the callee's parameter owns), `CopyInto` the destination's slot for an assignment to a slot-owning variable. The copy routines copy the static type's slots plus, under a test of the type id, each subclass's extra slots — exactly the dynamic instance's fields, never the uniform width.
- A class-typed local that its function assigns a fresh value, and every module global declared with a class type, gets its own slot at its declaration: the block the declaration built (a fresh value's copy or a default construction), or, when the declaration names an existing instance, a default-initialized block of its own (a hidden local slot, a hidden global `__slot_<g>`). `x = <fresh>` copies the fresh result INTO that slot (MIR `CopyInto`: the type's slots, a subclass's extra fields under its type id, nested struct fields into the slot's own nested blocks, the type id) and `x` names the slot again; no StructCopy into a per-site home is emitted for the assignment. An unannotated variable's slot class is the one the checker inferred: both checkers mark such a binding (`qfc$<Class>` at its HirId + 2^29, beside the call-site provenance marks), so no lowering depends on an annotation being written.
- A function's thunk (the uniform `(self, args…)` adapter a function value is called through) of a function that takes the caller-provided result block passes a static result block of the thunk's own (`@__thunkret_<f>`).

The hosted lanes are unaffected: there a `local class` is an ARC reference type and every one of these sites is an ordinary second strong reference.

| Error code | Modes | Trigger |
| --- | --- | --- |
| `E_FRAME_INSTANCE_ESCAPES` | freestanding | a frame-held class instance — a local's, a parameter's, or a block's temporary — is stored into a longer-lived place (an enclosing block's local, a module global, a field of an object outside its block, a collection or payload), or returned through a name the function does not own; a lambda that captured one is stored or returned likewise, or stores or returns its capture, or a value holding one is passed to a parameter its callee lets escape; the diagnostic names the escape site |
| `E_RETURN_PROVENANCE_MIXED` | freestanding | a function returns a fresh class instance on one path and a parameter's, `self`'s or a module global's on another, or a dispatched method's implementations disagree that way (reported at the root declaration, naming two implementations), or the functions and lambdas used as values of one function type do (reported at a value use, naming two) |
| `E_INSTANCE_REASSIGNED_WHILE_SHARED` | freestanding | `x = <fresh>` rebuilds the instance in a class-typed variable's own slot while another name that may refer to it (a local, a holder's field, a payload, a borrowed call result; for a global, any global or global field) is used afterwards, or a call that may fresh-assign a global while a local alias of it is live; the diagnostic names `x`, the other name and its later use |

### §3-3.18 `reinterpret[T, U]` — Type-Safe Memory Reinterpretation

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
- Available in all modes (§1-2.6).

**Alignment warning.** The compiler emits the `reinterpret-align-upcast` lint advisory when `align_of[U]() > align_of[T]()` is statically provable — for example, casting a `uint8` to a `uint64`. Misaligned access via `reinterpret` is the programmer's responsibility; the advisory makes the risk visible at the call site.

**`reinterpretChecked[T, U](value: T): Result[U, AlignmentError]` (normative). `T` is the source type of the input value; `U` is the desired target type.** This is the safe default variant. It performs the same compile-time size/alignment checks as `reinterpret[T, U]` and additionally verifies at runtime that the source value's address satisfies `align_of[U]()`. On alignment failure it returns `Err(AlignmentError)` rather than producing undefined behavior. `reinterpretChecked` does not require `@unsafe`. Use `reinterpret[T, U]` with `@unsafe` only when the caller has externally verified alignment through means invisible to the compiler.

```loup
# Safe default — checked at runtime
let result = reinterpretChecked[uint32, float32](rawBits)
match result {
  Ok(f)  => processFloat(f),
  Err(e) => panic(e.message),
}

# Unsafe shortcut — programmer asserts alignment is correct
@unsafe("transmute: float bit-pattern extraction; f is 4-byte aligned by construction")
let bits: uint32 = reinterpret[float32, uint32](f)
```

`AlignmentError` extends `RuntimeError` (§1-18.1) and is catchable.

### §3-3.19 Integer Overflow Arithmetic Methods

All fixed-width integer types (`int8`–`int64`, `uint8`–`uint64`) gain three method families in all execution modes.

**Checked — returns `Option[T]`:**

```loup
let result = uint8.checkedAdd(250u8, 10u8)    # Option[uint8]: None
let result = uint8.checkedSub(250u8, 10u8)    # Option[uint8]: Some(240)
let result = uint8.checkedMul(250u8, 10u8)    # Option[uint8]: None
let result = uint8.checkedDiv(250u8, 10u8)    # Option[uint8]: Some(25)
```

**Wrapping — always succeeds, wraps on overflow:**

```loup
let result = uint8.wrappingAdd(250u8, 10u8)   # uint8: 4
let result = uint8.wrappingSub(250u8, 10u8)   # uint8: 240
let result = uint8.wrappingMul(250u8, 10u8)   # uint8: 132
```

**Saturating — clamps to min/max:**

```loup
let result = uint8.saturatingAdd(250u8, 10u8) # uint8: 255
let result = uint8.saturatingSub(250u8, 10u8) # uint8: 240
let result = uint8.saturatingMul(250u8, 10u8) # uint8: 255
```

The naming convention is `TypeName.family(a, b)`. These methods are available in all execution modes. In `@mode(host.scripted)` and `@mode(web.compiled)`, plain `+`, `-`, `*` on fixed-width integers throw `NumericOverflowError` on overflow; the explicit methods let callers express their intent without relying on exceptions. In `@mode(host.native)` and `@mode(freestanding)`, plain arithmetic wraps by default, making `checkedAdd` and `saturatingAdd` the primary tools for defensive numeric code.

**`--overflow=trap` build flag.** When set, plain `+`, `-`, `*`, `/` on fixed-width integers trap on overflow in all build configurations. The explicit method families remain available alongside this flag.

### §3-3.20 Available Standard Library Subset

| Module | Description |
|---|---|
| `core.math` | Pure math functions — no heap |
| `core.text` | UTF-8 string operations on borrowed slices — no allocation |
| `core.sensitivity` | Content-sensitivity marks (`Mark`, `Level`, `Retention`, `Reason`, `OPEN`, `raise`); `@mode(portable)`, no heap (ruling MARK-1; importable through the portable barrier, ruling FS-UI) |
| `core.complex` | Complex arithmetic — basic operations only; transcendentals (`cexp`, `clog`, `csqrt`, trig/hyperbolic) are stripped per §3-3.3 and require an explicitly-linked math runtime via `extern native` to use |
| `core.array` | Multi-dimensional array operations on `array[T, rank]`. Constructors that allocate (`zeros`, `ones`, `fromList`, etc.) require a registered `@allocator`; pure transformations on borrowed arrays (slicing, reshape views, reductions over already-allocated arrays) are heap-free |
| `core.fpenv` | IEEE 754 environment (rounding modes, exception flags, signaling NaN). Active surface — `withRounding` issues real hardware FPSCR/FPCR updates |
| `native.mem` | Raw memory operations (see API below) |
| `native.simd` | SIMD vector types and intrinsics |
| `native.atomic` | Atomic load, store, CAS, fetch-add |
| `native.ffi` | C FFI utilities: size/align queries, pointer arithmetic, `PinnedRef`, `OwnedHandle`, `BorrowedHandle` |
| `native.dma` | DMA buffer ownership API — exclusive CPU/DMA access (see below) |
| `native.mpu` | MPU stack-guard installation — freestanding only (see below) |
| `native.css` | Channel-subsystem I/O — freestanding only; the s390x channel analog of `native.dma`, with ownership-typed CCW channel programs and subchannels (§3-3.26). *Specified pending implementation (`specs/1-bootstrap-5-mainframe-s390x/`, R3).* |
| `core.interchange` | Freestanding-viable subset of the `@interchange`/`@field` byte-layout facility (§4-2): the `Encoding`, `Charset`, and `Sign` enum *surface* may be imported/referenced. The auto-derived pack/unpack are emitted as the **heap-free** `packInto(buf: uint)` / `static unpackFrom(buf: uint): Self` / `byteLength(): int` methods that read/write a caller-provided byte buffer with no allocation. Only the kernel-relevant encodings are available freestanding: `Binary` (8/16/32/64-bit, signed/unsigned, big- or little-endian, plus bit-level `bits:` fields), `Bytes`, and `BoolByte`, with `offset:`, `redefines:`, and fixed `count:`/`occurs:`. Decimal-runtime / charset-table encodings (`Zoned`, `Comp3`, `Decimal128`, `IbmHexFloat32/64`, charset-converted `Text`) and variable-length (`countFrom:` / identifier `occurs:`) remain rejected with `E_FREESTANDING_MODULE`. |
| `debug.freestanding` | Freestanding debug service — `--debug` builds only; `E_FREESTANDING_MODULE` in release builds. Provides `debug.freestanding.start(cfg)` and `debug.freestanding.poll()` (§3-3.25) |

**`native.mem` API (freestanding and native):**

```loup
# Copy n bytes from src to dst (may overlap — uses memmove semantics)
func native.mem.copy(dst: uint, src: uint, n: uint64): void

# Zero n bytes starting at ptr
func native.mem.zero(ptr: uint, n: uint64): void

# Compare n bytes at a and b; returns 0 if equal, <0 if a < b, >0 if a > b
func native.mem.compare(a: uint, b: uint, n: uint64): int32

# Allocate n bytes with the given alignment via the registered @allocator.
# Panics if no @allocator is registered or allocation fails.
func native.mem.alloc(n: uint64, align: uint64): uint

# Free a pointer previously returned by native.mem.alloc.
func native.mem.free(ptr: uint, n: uint64, align: uint64): void
```

**`native.atomic` API (freestanding and native):**

```loup
# Atomic load with acquire ordering
func native.atomic.load[T](ptr: uint): T

# Atomic store with release ordering
func native.atomic.store[T](ptr: uint, val: T): void

# Atomic fetch-add; returns the previous value
func native.atomic.fetchAdd[T](ptr: uint, val: T): T

# Atomic fetch-sub; returns the previous value
func native.atomic.fetchSub[T](ptr: uint, val: T): T

# Compare-and-swap; returns true if the swap occurred
func native.atomic.compareExchange[T](ptr: uint, expected: T, desired: T): bool

# Compiler fence — prevents reordering of memory accesses across the fence.
# Prevents the COMPILER from reordering memory accesses; does not insert a hardware barrier instruction.
func native.atomic.fence(): void

# Save the current interrupt enable state and return it as an opaque uint.
# Used with writeInterruptFlags to implement save/restore critical sections.
# @mode(freestanding) only.
func native.atomic.readInterruptFlags(): uint

# Restore interrupt enable state saved by readInterruptFlags.
# @mode(freestanding) only.
func native.atomic.writeInterruptFlags(flags: uint): void

# Hardware memory barrier — inserts the architecture-specific barrier instruction.
# Required after volatile MMIO writes on weakly-ordered architectures (ARM, RISC-V).
# order: Acquire | Release | AcquireRelease | SeqCst | DeviceRelease
func native.atomic.hwFence(order: MemoryOrder): void
```

**`MemoryOrder` enum:**

```loup
namespace native.atomic;

enum MemoryOrder {
  # Prevent loads from being reordered before this point.
  Acquire;
  # Prevent stores from being reordered after this point.
  Release;
  # Both Acquire and Release.
  AcquireRelease;
  # Full sequentially consistent barrier — strongest ordering.
  SeqCst;
  # Device memory barrier — maps to DSB ST (ARM) / FENCE ow,ow (RISC-V) / SFENCE (x86_64).
  # Use after volatile writes to peripheral registers to ensure the device observes the write.
  DeviceRelease;
}
```

The normative MMIO pattern requiring a hardware barrier after a volatile store:

```loup
uart.data = byte                              # volatile store (optimizer-barrier)
native.atomic.hwFence(MemoryOrder.DeviceRelease)  # hardware-barrier (CPU reorder-barrier)
```

`T` must be a fixed-width integer type (`uint8`, `uint16`, `uint32`, `uint64`, `int8`, `int16`, `int32`, `int64`) or a pointer-sized type. Atomic operations on `T` that is not naturally aligned are `E_ATOMIC_UNALIGNED`.

**`native.mem` addition — `tryAlloc` (normative):**

```loup
# Fallible allocation: returns Ok(ptr) or Err(AllocError) without panicking.
func native.mem.tryAlloc(n: uint64, align: uint64): Result[uint, AllocError]
```

**`native.dma` API (freestanding only):**

`native.dma.DmaBuffer[T]` models DMA buffer ownership using Loup's ownership verb system. The CPU and the DMA controller cannot access the buffer simultaneously — the `startTransfer` call acquires an exclusive `edits` borrow that blocks CPU access for the transfer duration.

```loup
namespace native.dma;

# Allocate a cache-coherent, page-aligned DMA buffer for n elements of T.
# Returns Err(AllocError) if the DMA-capable region is exhausted.
func alloc[T](n: int): Result[DmaBuffer[T], AllocError]

unique class DmaBuffer[T] : Any {
  # Length in elements.
  pub func len(): int

  # CPU read access — valid only when no active DmaTransfer holds the buffer.
  pub func read(index: int): T

  # CPU write access — valid only when no active DmaTransfer holds the buffer.
  pub modifier func write(index: int, value: T): void

  # Begin a DMA transfer. Returns an exclusive handle; CPU access is blocked
  # until DmaTransfer.complete() or DmaTransfer.abort() is called.
  # E_DMA_BUFFER_ACTIVE if a transfer is already in progress.
  pub func startTransfer(edits self, controller: DmaController, dest: uint): DmaTransfer[T]
}

unique class DmaTransfer[T] : Any {
  # Wait for transfer completion (synchronous busy-wait or interrupt-driven depending on controller).
  # Releases the edits borrow on the buffer; CPU access is re-enabled.
  pub func complete(): void

  # Abort the transfer immediately. Buffer contents are undefined; CPU access is re-enabled.
  pub func abort(): void
}
```

*Compiler's rule (a captured buffer — row CAPMV-1).* A closure that captures a binding holding a `DmaBuffer` (a `unique class`, or a value holding one) takes it by MOVE (core §1-7.3): the binding is unusable afterwards, so starting a transfer on it is `E_USE_AFTER_MOVE`. The closure may touch any buffer place it reaches at an invocation the checker cannot see, so a transfer started on such a place while the closure exists is also `E_DMA_BUFFER_ACTIVE`, the guard token named `<closure capture>`; a program that does both reports both. The second rule is what still guards a buffer the closure only references — a module-level one, which a closure does not capture.

**`native.mpu` API (freestanding only):**

```loup
namespace native.mpu;

# Install a stack guard region. Accesses to [guardBase, guardBase+guardSize) trap as a fault.
# The @panic_handler receives PanicSource.StackOverflow when this guard fires.
# Returns Err if the MPU does not support the requested region configuration.
func installStackGuard(stackTop: uint, guardSize: uint): Result[void, MpuError]

# Remove a previously installed guard region.
func removeStackGuard(stackTop: uint): void

enum MpuError {
  NotSupported;    # platform MPU does not support guard pages
  RegionConflict;  # requested region overlaps an existing MPU region
  AlignmentError;  # base or size not aligned to MPU region requirements
}
```

**Implementation ownership (normative).** `native.mpu.installStackGuard` is a *callable guard-region-install API*, **not** a per-function stack-probe codegen mode: the compiler does not emit a stack-limit check in any prologue, and `installStackGuard` carries no backend support beyond an ordinary `native.*` call. Installing the guard means mapping `[guardBase, guardBase+guardSize)` as no-access in the active page/region tables so the *first* write past the stack limit takes a clean fault, which the `@panic_handler` receives as `PanicSource.StackOverflow`. Consequently:

- In **hosted native** mode the Loup native runtime owns this: it installs a guard page below every thread stack via `mprotect`/`VirtualProtect` and maps the resulting signal to `StackOverflowError` (§3-3 "Stack overflow in native mode"). User code need not call `installStackGuard`.
- In **`@mode(freestanding)`** there is no Loup runtime and no portable MMU/MPU model, so `native.mpu.installStackGuard`/`removeStackGuard` are **provided by the target's HAL** — the freestanding program (e.g. an OS kernel) supplies the implementation that punches the guard page in its own page tables and routes the resulting page fault to its panic path. The `native.mpu` namespace and the signatures above are the normative *contract* that HAL implementation MUST match; the toolchain does not ship a freestanding implementation and emits no prologue probe.

**`native.mpu` on s390x — storage-key fetch-protection.**

*Specified pending implementation — the s390x realization below is tracked under `specs/1-bootstrap-5-mainframe-s390x/` (R6).*

- (i) On z, the `native.mpu` contract above is realized via **storage-key fetch-protection** (`SSKE`): the HAL sets the storage key of a guard frame so that the first access past the stack limit takes a **protection exception** — a `class: Program` interruption (§3-3.13) — which the HAL routes to `@panic_handler` as `PanicSource.StackOverflow`. This is purely a HAL realization of the existing `installStackGuard` contract; **no new language surface** is introduced.
- (ii) A dedicated **`native.storagekey`** wrapper (a typed `StorageKey` value with `SSKE`/`ISKE`/`RRBE`) is a **deferred, bare-metal-only candidate**, not implemented in this revision. Capability isolation (invariant I3) remains a type-system mechanism (`Cap[T]`); storage keys are **not** used for it — the 4-bit key gives only 15 usable domains, too coarse for capabilities, and is virtualized/typically unused on the KVM-guest path.

All other standard library modules are unavailable (`E_FREESTANDING_MODULE`).

### §3-3.21 `.lppkg` Extensions for Freestanding

```toml
[build]
mode     = "freestanding"
delivery = "freestanding"     # v1.21: `delivery`, core §1-13.3 (`target` is its former spelling and names the triple now)
arch     = "x86_64"           # any §3-3.2 arch, e.g. "thumbv8.1m.main" (Cortex-M; llbe by default, or --backend llvm)
panic    = "custom"           # halt (the default) | abort | custom — §3-3.6
separate = false              # optional: one cached object per package, linked (§3-3.21.2)

[linker]
script   = "kernel.ld"       # path to linker script
entry    = "_start"           # entry symbol (matches @entry)
map      = "kernel.map"       # optional: emit linker map
max_image_size = 8388608      # optional: hard byte budget for the final image (8 MiB); build FAILS if exceeded
size_opt = true               # optional: coalesce frame zero-init prologues into one loop (default false)

[freestanding]
stack_size  = 65536           # NORMATIVE: stack size in bytes; must be page-size multiple
                              # The linker script SHALL reserve this many bytes for the stack region.
                              # Affects MPU guard placement when native.mpu.installStackGuard is called.
stack_check = "off"           # off | report | enforce — the static worst-case stack budget (§3-3.21.3)
interrupt_nesting = 1         # handler activations that may stack on one stack at once (§3-3.21.3; 0 = own stacks)
no_float    = true            # forbid float/float32/float64/decimal
no_simd     = false           # allow SIMD (requires FPU save in context switch)
overflow    = "trap"          # wrap | trap
relocatable = false           # build a position-independent, relocatable user program (§3-3.21.1)
endianness  = "big"           # big | little | native — target byte order (default "big" for arch = "s390x",
                              # "little"/"native" elsewhere). The toolchain derives the target byte order
                              # and the @interchange / Volatile endianness defaults (§3-3.9, §4-2) from it.
double_fault = "halt"         # halt | reset | nop — see §3-3.6 --double-fault flag
overlays    = "warn"          # warn | error — how an unacknowledged overlay / an implicit copy of an
                              # overlay-holding struct is reported (§3-3.17b, row OVL-1; default "warn")
preempt_defer = { enter = "preemptEnter", leave = "preemptLeave", drain = "preemptDrain" }
                              # optional: the program's functions a `synchronized` region calls (§3-3.21.4)

# Debug portal configuration (--debug builds only; ignored in release)
portal_ring_size         = 4096   # bytes; JTAG-readable fallback ring buffer (default 4096)
error_trace_depth        = 16     # `?` propagation sites an error return trace records (default 16)
                                   # Set to 0 to suppress BSS allocation
portal_trace_buffer_size = 8192   # bytes; trace channel DMA staging buffer (default 8192)
portal_filter            = ["*"]  # compile-time glob prune of activation table
                                   # e.g. ["mykernel.irq.*", "mykernel.boot"]
                                   # Unmatched portals stripped as in release
time_travel_frames       = 256    # frames in the .debug_ttravel time-travel ring (§3-3.25.9);
                                   # absent or 0 = no ring is compiled in
```

**`max_image_size`** — Compiler's rule: the budget is checked after every freestanding link of both build drivers (Stage0's C / `--backend llvm` and `--backend llbe` routes; the self-hosted loup-build's kernel route — clang, Cortex-M, llbe, `separate` — and its route for the other arches). An image over it fails with `E-BUILD-IMAGE-SIZE`, naming its size, the budget and the overshoot, followed by the `image sections:` breakdown for an ELF64 image. The value is a TOML integer (decimal, `0x`, `0o`, `0b`; `_` separators); anything else is `E-BUILD-MANIFEST`, never "no budget".

**Path anchoring.** All relative paths in the manifest — including `[linker].script`, `[linker].map`, and `[build].entry` — are resolved against the **project root**, defined as the directory containing the manifest (`.lppkg` / `loup.pkg`), **not** the working directory at build time. Moving the project directory therefore preserves every relative path. (See the `.lppkg` manifest spec, `specs/4-packages-3-lppkg-manifest/`.)

**`error_trace_depth`** — the maximum number of `?` propagation sites an error return trace records (core §1-5.7). Default 16. The store is a fixed chain of exactly this many slots, so it allocates nothing on the error path; beyond it the trace is truncated and MARKED as truncated rather than silently cut. Must be a positive integer; `0` or a negative value is a manifest error, because a store of no slots is the switch turned off by another name and the switch is the honest way to say that. Capture is governed by its own build switch, not by this key: the key sizes the store when capture is on and is inert when it is off (LCP-6, core §1-2.6 footnote 12).

**Reading these keys from source (LCP-5).** Every SCALAR key in this section is readable from an `if const` condition under the reserved `freestanding.*` namespace — `freestanding.stack_size`, `stack_check`, `interrupt_nesting`, `no_float`, `no_simd`, `overflow`, `relocatable`, `endianness`, `double_fault`, `portal_ring_size`, `error_trace_depth` and `portal_trace_buffer_size` — under the rule "you read it where you wrote it", except `overlays` (below: a checker policy, not a value the program reads); the table- and list-valued keys (`preempt_defer`, `portal_filter`) are not readable (v1.21), and neither is `time_travel_frames` (it sizes a debug-only ring and is not part of a program's meaning). Boolean-valued keys read as `bool`, so `if const (freestanding.no_float)` is a condition rather than a string comparison. **None of these keys migrates to `[options]`**: `[options]` is the author's OPEN set with author-declared domains, while these are the compiler's CLOSED set with per-key validation, and `no_flaot = true` must stay a manifest error rather than become a silently ignored unknown option. The two sections coexist by design. Each of these keys is defined on every driver and in every mode, reading the value the build uses — the command line (`--overflow=trap`, `--double-fault`, `--stack-report` / `--stack-enforce`) over the manifest over the default — and the defaults are core §1-13.3's table (`no_float` and `no_simd` `false`, `overflow` `"wrap"`, `double_fault` `"halt"` (§3-3.6), `error_trace_depth` 16, `endianness` the arch's byte order). `endianness` is specified pending implementation: a toolchain that does not implement a key accepts only its default (core §1-13.3, "closed sections fail explicitly"). A key error in an imported module fails the program as it does in the entry module (core §1-13.3, "Every driver defines the closed keys"; v1.21, v21.portable.10).

**`portal_ring_size`** — statically allocated in the `.debug_ring` linker section. Used as the sole trace store when no `@debug_trace_channel` is provided; readable by JTAG/OpenOCD without a live host connection. Set to `0` to suppress allocation when BSS space is critical.

**`portal_trace_buffer_size`** — staging buffer between portal event emission and `FreestandingTraceChannel.write` (§3-3.25.3). Drained when it reaches `traceFlushThreshold` bytes (set via `FreestandingDebugConfig`), when the next event would not fit, or when `flushTrace()` is called. Staging is OFF unless `traceFlushThreshold` is non-zero, so this buffer costs BSS but changes no behaviour until asked for; set it to `0` to reclaim the bytes and force one `write` per event. (`traceFlushIntervalUs` would also drain it, on a timer, but has no clock seam to drive it — see §3-3.25.)

**`portal_filter`** — glob patterns matched at compile time against fully-qualified portal names. Only matching portals are included in the activation table and instrumented. Default `["*"]` includes all portals.

**`overlays`** — `"warn"` (the 1.23 default) or `"error"`: whether §3-3.17b's overlay rules report as `W_OVERLAY_NOT_UNSAFE` / `W_OVERLAY_STRUCT_COPY` or as `E_OVERLAY_NOT_UNSAFE` / `E_OVERLAY_STRUCT_COPY`. Any other spelling is a manifest error — a typo'd `"errors"` must not silently stay at warnings. `LOUP_OVERLAYS=error` in the compiler's environment strengthens an absent or `"warn"` key and never weakens `"error"`. It is a checker policy, not a value the program reads, so it is not among the `freestanding.*` keys `if const` can test.

**`no_float = true`** forbids all floating-point types in `@mode(freestanding)` source. Use is `E_FREESTANDING_FLOAT`. Critical on x86_64 where FPU state must be saved explicitly; most kernels forbid FP in kernel mode to avoid the overhead. *Compiler's rule (v1.21, v21.portable.10).* In a unit whose resolved `freestanding.no_float` is `true` (core §1-13.3: the manifest's value, which `loup run` and `loup test` read from the entry file's package), both checkers refuse a floating-point type — `float`, `float32`, `float64`, `complex32`, `complex64` — named anywhere in a freestanding module of the unit, and a floating-point literal, each `E_FREESTANDING_FLOAT` at the use, on every driver. `decimal` and `bigint` are outside the freestanding subset already (core §1-2.6), and a `@mode(portable)` module the unit imports is float-free by its own subset (§1-2.4.7).

**`[linker].max_image_size` — image-size budget.** A freestanding image is frequently loaded into a fixed, physically-constrained window: a boot loader's staging area, an SPI flash part, a reserved region of SRAM. Silently growing past that window produces an image that links cleanly and then fails at load or boot, far from the change that caused it. `max_image_size` moves that failure to build time.

`max_image_size` is an **integer count of bytes** (not KiB, not MiB — `8388608` is 8 MiB). After the image is linked, the toolchain measures the **final on-disk image size** and compares it against the budget. If the image exceeds the budget the **build fails**. It does not warn, and it does not truncate — an over-budget image is never written as a build product. The diagnostic names:

- the actual image size,
- the configured budget,
- the overage (actual − budget), and
- a **per-section size breakdown**, so the growth can be attributed to `.text`, `.rodata`, `.data`, `.bss`, or a user `@section` without a separate `size`/`readelf` step.

Enforcement is **freestanding-only**, and applies on both freestanding backends: on the default C/LLVM path the diagnostic is `E-BUILD-IMAGE-SIZE`, and on the clang-free self-hosted path (`--backend llbe`, §3-2.2) it is `E-BUILD-LLBE`. `max_image_size` does **not** apply to managed native builds (`--target native`, §3-2), where the image is loaded by an OS loader and no such window exists.

**`[linker].size_opt` — frame zero-init coalescing.** A boolean, default `false`. In unoptimized freestanding codegen, every function prologue zero-initializes its frame slot by slot, which for large frames dominates code size. With `size_opt = true` the compiler coalesces each function's per-register/per-slot zero-initialization prologue into a single loop over one frame array. This is a pure code-size optimization: it does not change semantics (locals are still fully zero-initialized unless the function is annotated `@no_zero_locals`, §3-3.16b), and it applies on both the C/LLVM path and the clang-free `llbe` backend (§3-2.2).

If the key is absent, **no budget is enforced** and image size is unconstrained — the check is opt-in.

`max_image_size` complements, and does not replace, a linker-script `ASSERT(. <= <addr>, "...")`: the `ASSERT` catches a region overflowing its *address* window during layout, while `max_image_size` bounds the *total artifact* the loader must transfer and gives an attributable breakdown when it grows.

#### §3-3.21.1 `relocatable` — position-independent user programs

`relocatable = true` builds the freestanding program as a **position-independent, relocatable user program** rather than a fixed-address kernel image. It is the toolchain support for loading ring-3 / user-mode programs written in ordinary Loup (e.g. a POSIX-compat shim) that a kernel copies to a runtime-chosen address and enters.

The program is compiled `-fPIE` and linked `-pie --no-dynamic-linker` with the toolchain's **canonical flat layout** — a single loadable image at base `0` with `.text`, `.rodata`, `.data`, and `.bss` contiguous and a `__program_end` marker. Because every reference within the image (rodata literals, compiler-synthesised string-slice globals, the in-image freestanding runtime) is RIP-relative and self-contained, the whole image is **copy-and-run**: it carries **no load-time relocations**, so a loader copies it as a unit to any address and the references resolve correctly with no fixups. (Contrast the default kernel build, which references kernel-image globals at fixed addresses and faults if only a function's bytes are relocated.)

When `relocatable = true` and no `[linker].script` is given, the toolchain supplies the canonical flat script (the layout is part of the loader ABI). The `[linker].entry` symbol (default `userEntry`) names the program entry. Alongside the linked ELF, the build emits a **`<output>.loup-user.json` loader sidecar**:

```json
{ "format": "loup-user/1", "arch": "x86_64",
  "entry_offset": 81, "vaddr": 0, "file_offset": 4096,
  "file_size": 1837, "mem_size": 2232 }
```

The sidecar describes the **whole image**, not one segment: `vaddr` and `file_offset` are those of the lowest loadable segment, `file_size` is the furthest file-backed byte of **any** `PT_LOAD` measured from that base, and `mem_size` is the furthest byte in memory of any `PT_LOAD`. A linker is free to split the flat image into several segments — GNU ld emits `R E` text followed by `RW` data whenever `.text` happens to end on a page boundary — and a sidecar that described only the first would have the loader truncate the image before `.rodata` and never map `.bss`. The flat copy is only valid if every file-backed segment lies as far from the first in the file as in memory; an ELF for which that does not hold cannot be described by this sidecar, and the build fails (`E-BUILD-FREESTANDING`) rather than emit numbers that are quietly wrong.

A minimal in-kernel loader needs no ELF parsing: allocate `mem_size` bytes at its chosen base, copy `file_size` bytes from the ELF at `file_offset`, zero the `mem_size − file_size` `.bss` tail, and enter at `base + entry_offset`. The relocatable program must be a self-contained compilation unit — it calls no kernel-image functions (only its own code and `syscall`/inline-asm) — since after relocation only its own image is mapped at a known offset.

**No static data relocations.** Because the loader applies no fixups, `relocatable = true` **forbids** the absolute data relocations that an ordinary freestanding object emits for pointers held in static data (§3-3.12a). String `{ptr, len}` descriptors are instead materialized at runtime as inline stores. The zero-relocation property is part of the loader ABI, not an optimisation, and the build fails rather than emit an image whose correctness would depend on a fixup step the loader does not perform.

**`endianness`** declares the target byte order. *Specified pending implementation — this field is tracked under `specs/1-bootstrap-5-mainframe-s390x/` (R8).* It defaults to `"big"` for `arch = "s390x"` and to `"little"`/`"native"` for the little-endian arches; from it the toolchain sets the compilation target's byte order and the `@interchange`/`Volatile` endianness defaults (§3-3.9, Volume 4 §4-2). Selecting a per-arch × per-workload profile (e.g. an `s390x` bare-metal vs. KVM-guest image) is done by swapping the `hal`/`features` `.lppkg` dependency, exactly as on the other arches; this field adds no new lock semantics.

**`overflow = "trap"`** (and the equivalent `--overflow=trap`, §3-3.19) maps on s390x to z's **fixed-point-overflow program interruption** — the existing trapping-overflow surface is reused with no new field.

#### §3-3.21.2 `separate` — per-package separate compilation

`[build] separate = true` (or `--separate` on the command line; `--no-separate` overrides the manifest back to the default) builds a freestanding image from **one object per package** instead of one object for the whole program, and reuses each package's object across builds while it is unchanged (loup#470). The default is `false`, and a build without the key is exactly the whole-program build described elsewhere in this volume — same `.ll`, same single backend invocation, same image bytes.

**What stays whole-program (normative).** Separate compilation splits **only** the last step, `.ll` → object. Every analysis and every lowering step runs over the whole module graph on every build, exactly as in a whole-program build, and produces the same single whole-program `.ll`:

- the type check, and every freestanding rule it enforces — the `@interruptSafe` colour closure across modules and packages (§3-3.24.1), the `@lockOrder` lattice (§3-2.4), `E_ONSTACK_ESCAPES` and the other placement guarantees;
- `@panic_handler` discovery, so a `[freestanding] bounds = "trap"` guard (§3-3.17b) emitted in one package calls the handler another package defines;
- MIR lowering of the merged program, and the backend's **reachability dead-code elimination**, which runs before the split: the set of functions in a separate image is exactly the set in the whole-program image, and the link needs no `--gc-sections`.

A violation of any of these is therefore reported identically in both modes; separate compilation cannot hide one.

**Partitioning.** The whole-program `.ll` is partitioned by **owning package**. A source module belongs to the package whose manifest is nearest above it; a module with no manifest above it belongs to the **root** package (the one being built) — a profile manifest may sit beside its sources rather than above them, and a directory reached only through `LOUPPATH` is part of the package that selected it. Prelude and stdlib code, compiler-generated helpers and the module initializer belong to no package and form one extra partition. The companion runtime (`.c`) and the Loup `mem*` runtime (§3-3.16) are units of their own. The partitioner guarantees, for **any** ownership assignment (ownership decides only where a definition lands, never whether the image is correct):

- every external function, and every global whose address is significant, is **defined in exactly one partition** and **declared** in each partition that references it; a definition with `internal`/`private` linkage that another partition references is given external linkage (names are unique within the whole-program module, so this cannot introduce a collision inside it);
- `unnamed_addr` internal constants (string literals — the language never observes their address) and internal functions are **duplicated** into each partition that references them;
- each function's `%loc<N>` locals — the one family of local names numbered by a whole-program counter (a binding's HirId, and HirIds chain across modules) — are renumbered `%loc<k>` in first-appearance order, so one package's edit cannot change another package's text through them; every other local name is already numbered per function, and nothing else in the text changes;
- a top-level construct the partitioner does not model (an alias, a comdat, module-level asm) **fails the build** rather than being guessed at.

**The cache key (normative).** A unit's object is cached under `<project>/.loup-cache/objects/<key>.o`, where `<key>` is the SHA-256 of: a partition-format tag, the toolchain version, the backend tool's identity (its resolved path and the SHA-256 of its bytes — clang, or `loup-llbe`), the exact compile argument vector (arch, target triple, `-O` level from the profile, float ABI and target-feature flags, `size-opt`, …), and the **exact text compiled**. Nothing else can change the object, so a unit whose key is unchanged is reused as-is, and any change to its text, the flags or the tool compiles it afresh. `--no-cache` compiles every unit. Misses are compiled in parallel; each new object is written under a temporary name and renamed into place, so an interrupted or concurrent build never leaves a partial object under a valid key. The image is then linked from every unit's object with the build's own link flags and linker script.

**Differences from a whole-program image (non-normative).** A separate image boots to the same behaviour but is not byte-identical to the whole-program image: each package is optimized alone (no cross-package inlining at `-O2`), and globals that were `internal` in the single module are external. Both drivers produce the same partitions from the same `.ll`. Some numbering in the emitted text is program-wide by design — struct field slots, runtime type ids, enum tags — so an edit that introduces a new field name or type in one package can change another package's text; that package then recompiles, which costs a cache hit and never correctness.

**Lanes.** Separate compilation is available on the LLVM lanes: `--backend llvm` (clang compiles each unit with `-c`; the Cortex-M targets included) and `--backend llbe` (each unit through `loup-llbe`, linked by `ld.lld`), in both `loup-bootstrap build` and the self-hosted `loup build`. The default freestanding C backend emits the image as one C translation unit and has no per-package seam: `separate = true` there fails the build (`E-BUILD-NATIVE`) naming the LLVM lanes. On a non-freestanding target the key has no effect and the build warns (`W-BUILD-FLAG-UNUSED`).

#### §3-3.21.3 `stack_check` — the static worst-case stack budget

*Ruling #864 item 3; design row STACK-1 (reversible: shipped OFF by default).* A freestanding kernel usually has no guard page below its stack, so an overflow does not fault: it silently overwrites whatever lies below. The build can **prove a bound instead**: it computes, from every entry the image has, the worst-case number of stack bytes any execution can use, and compares it with `[freestanding] stack_size`.

```toml
[freestanding]
stack_size        = 65536
stack_check       = "report"   # "off" (default) | "report" | "enforce"
interrupt_nesting = 1          # default 1
```

`--stack-report` and `--stack-enforce` on `loup build` override `stack_check` for one build. An unknown `stack_check` value fails the build (as `bounds` does): a mistyped safety switch must not read as "off".

- **`report`** prints the budget (below) and writes `<image>.stack.json` next to the image. An entry over budget is the warning `W_STACK_BUDGET_EXCEEDED`; an entry with no bound is `W_STACK_UNBOUNDED`. The image is the image the build produces with the check off, byte for byte.
- **`enforce`** does the same, but an entry over budget is the error `E_STACK_BUDGET_EXCEEDED` and an entry with no bound (or an image with no entry) is `E_STACK_UNBOUNDED`; the build fails and **removes the image** (an image whose stack bound is unproven is not a build product — the `max_image_size` discipline).

**Where it runs.** On a freestanding build through an LLVM lane — `--backend llvm` (clang) or `--backend llbe` (clang-free) — as one whole image (not `separate`, §3-3.21.2), for an arch whose call and interrupt facts the table below gives. Anywhere else the switch is a build error (`E-BUILD-STACK`), never a silent no-op: the C backend emits no LLVM IR to read the call graph from, and a `separate` image has one frame table per package. The self-hosted `loup-build` runs it on the freestanding kernel route (x86_64 and Cortex-M, `[linker] script`, not relocatable).

**Entries and handlers (normative).** The *entries* are every `@entry` function and the `[linker] entry` symbol. The *handlers* are every `@interrupt` function and every `@naked` function whose `asm` returns with an interrupt return (`iret`/`iretq`, `eret`, `rfe` / `subs pc, lr`, `mret`/`sret`). On Cortex-M an exception handler is an ordinary function (the core returns from it through `EXC_RETURN`), so it is a handler when it is `@interrupt`. An address-taken function that no entry or handler reaches is an **unattributed root**: the report gives its depth, but it is not charged to `stack_size`, because the build cannot know which stack it runs on (a thread start routine runs on a stack of its own; a hand-wired handler on the one it interrupts). Mark a handler `@interrupt` to have it charged.

**Frame sizes come from the backend (normative).** Only the backend knows its spills and allocas, so each function's frame is the one the backend reports, in the GCC `-fstack-usage` format (`<file>:<fn>⇥<bytes>⇥<static|dynamic>`): clang writes it per object (`-fstack-usage`; the build compiles each input on its own, with the link's own flags, and links the objects, which yields the same image); `loup-llbe` writes the same table for its own frames (positional `stack-usage` token). A `dynamic` frame, or an `alloca` whose size is only known at run time, makes the function UNBOUNDED. An alloca aligned past the target's stack alignment is charged the realignment slack. A function the IR defines but the frame table lacks is UNBOUNDED, except when the backend optimizes (`-O1` and above), where it was inlined into its callers and is charged 0 B of its own.

**The call graph comes from the LLVM IR of every linked input (normative):** the emitted `.ll`, the Loup `mem*` runtime `.ll` where one is linked, and the companion C runtime lowered with `clang -S -emit-llvm` under the build's own flags. When the backend optimizes, the graph is read from the OPTIMIZED IR of every input (the same flags, `-S -emit-llvm`), so inlining and specialised clones are what the analysis sees.

- A direct call is an edge. Interface and virtual dispatch are lowered to direct calls to every implementation, so every implementation is a callee.
- An indirect call (a function pointer or closure) may reach **every address-taken function with the same LLVM signature**; when none exists the caller is UNBOUNDED.
- A compiler **helper** the image defines (`memcpy`/`memmove`/`memset`/`memcmp`/`bcmp`, `__aeabi_*`, `__atomic_*`/`__sync_*`, and the libgcc-style `__<op><mode>` routines) is a possible callee of every function: a backend may call one where the IR has none.
- A call to a function no linked input defines, and a function the backend emitted that no IR defines (an outlined or specialised copy, whose callers are unknown), make the result UNBOUNDED.
- Inline `asm` is read instruction by instruction: pushes (and stack-pointer adjustments) count as stack bytes; a `call`/`bl`/`jal` (or a jump) out of the asm is an edge, UNBOUNDED when its target is an asm label or undefined; a write of the stack pointer is a stack switch and UNBOUNDED, except in an entry, where it establishes the stack (listed); a software exception (`int`/`svc`/`ecall`/…) runs its handler on this stack (charged by the interrupt model).

**Recursion is UNBOUNDED unless every function of the cycle states a bound.** `@maxDepth(n)` on a module-level function states that at most `n` activations of it are live at once. A recursive cycle (a strongly-connected component of the call graph) whose every member has one is charged each member's frame `n` times plus the return addresses between them, plus the deepest call out of the cycle. `@maxDepth` on a function that is not recursive has no effect (listed). The bound is trusted, not verified, and every use is listed.

**`@asmStack(n)`** on a module-level function states that its inline `asm`, and everything that asm calls, uses at most `n` bytes of stack. It replaces the asm analysis for that function (its asm calls and stack switches are not followed); every use is listed. `@maxDepth` and `@asmStack` are valid only on a module-level function (`E_ANNOTATION_TARGET`, as `@entry`): the build reads them by the function's symbol name. Their argument is ONE positive decimal integer literal (`E_ANNOTATION_ARGS` otherwise — a name, `0` or a second argument would read as no bound at all).

**Architecture facts (normative).**

| Arch family | Return address per call | Hardware interrupt frame | Stack alignment |
|---|---|---|---|
| x86_64 | 8 B (pushed by `call`) | 56 B (`SS`/`RSP`/`RFLAGS`/`CS`/`RIP`, an error code, 8 B of realignment) | 16 B |
| Cortex-M v6-M / v7-M (no FP context) | 0 (in `LR`; saved in the frame) | 36 B (8 words + 4 B alignment) | 8 B |
| other Cortex-M / 32-bit Arm (FP context) | 0 | 108 B (26 words + 4 B alignment) | 8 B |
| aarch64, RISC-V | 0 | 0 (the handler's own frame saves the state) | 16 B |

**The interrupt model (normative).** A handler runs **on the stack it interrupts**, and up to `interrupt_nesting` handler activations may be stacked on one stack at once (a handler that re-enables interrupts can be interrupted). Every entry is therefore charged `interrupt_nesting × (hardware interrupt frame + the worst handler's depth)` on top of its own deepest chain. `interrupt_nesting = 0` declares that handlers run on stacks of their own (an IST or a separate exception stack) and charges nothing here. A handler with no bound makes every entry UNBOUNDED.

**Depth.** An entry's depth is the deepest path: on each path, the sum of every frame (plus the stack bytes its inline asm pushes) and the return address of every call. The budget is met when *depth + interrupt charge ≤ `stack_size`*.

**The report.** Per entry: the worst case in bytes, against `stack_size` (with the percentage used), and the **deepest path** with each frame's size and its offset from the top of the stack; per handler, its depth and deepest path; every unattributed root; then **every site** where the analysis charged conservatively, trusted an annotation, or gave up, with the reason (`[UNBOUNDED]` marks the ones that remove the bound). For an unbounded entry the report still gives the known part (unbounded sites counted as 0 B), marked as NOT a budget. `<image>.stack.json` (format `"version": 1`) carries the same facts: `stack_size`, `return_address`, `interrupt_model` (`nesting`, `hardware_frame`, `handlers`, `worst_handler`, `charge`), `entries` (`name`, `bounded`, `bytes`, `known`, `total`, `known_total`, `verdict` ∈ `ok`/`exceeded`/`unbounded`/`no-budget`, `why`, `path`), `handlers`, `unattributed` and `sites` (`function`, `kind`, `unbounded`, `detail`). Given the same inputs, Stage0 (`loup-bootstrap build`) and the self-hosted `loup-build` print the same report and write the same file, byte for byte.

**Compiler's rule (what the bound covers).** The bound covers the code in the image as linked: an execution that leaves it (a jump to a loaded program, a return into firmware) is outside it. A function the analysis cannot see into is never assumed small — it is UNBOUNDED or charged and listed.

#### §3-3.21.4 `preempt_defer` — preemption deferral for `synchronized` regions

*Design row PREEMPT-1 (RULED 2026-10-15; Helios F12, restated 2026-10-13). The precedent is Linux's `preempt_disable(); spin_lock … spin_unlock; preempt_enable()`.* A freestanding `synchronized class` holds its lock word inside its `modifier` methods (§3-2.4.13, "Freestanding mode"); a scheduler that preempts a thread there leaves the lock held while another thread spins on it. A kernel defers such a preemption by counting the regions a CPU is inside and switching only when the count returns to zero. The optional key names the three functions of the program that do it:

```toml
[freestanding]
preempt_defer = { enter = "preemptEnter", leave = "preemptLeave", drain = "preemptDrain" }
```

**Absent (the default).** Nothing is called; the image is byte-identical to one built without the key.

**Present (normative).** Every `modifier` method of a `synchronized class` is a *region*. In each one, the compiler emits:
- `enter()` immediately BEFORE the region takes its lock;
- on EVERY exit, `leave()` immediately AFTER the region releases its lock, then `drain()` when `leave()` returned `1`.

Every exit means every return, early returns included. A `break` or `continue` cannot leave a method, and freestanding has no unwinding: a panic does not return (§3-3.6). Each region calls `enter`/`leave` once, so nested regions (a `modifier` that calls another class's `modifier`) nest the calls: the kernel's count is a depth. A non-`modifier` method takes no lock and is no region. `drain` therefore runs where the region holds no lock; it is where the kernel takes the deferred switch (a `leave()` of `1` means a tick fired inside the region and was deferred).

**Binding (normative).** Each name must be exactly ONE module-level function of the program's own modules (not the standard library), declared:
- `enter`: `func <enter>(): void`;
- `leave`: `func <leave>(): uint64`;
- `drain`: `func <drain>(): void`.

None of the three may be generic, `async` or a generator. They are kept in the image (dead-code elimination roots them) whether or not a region is reachable.

A key that is not an inline table, an unknown member, a missing member, a non-string member, a name that is not an identifier, a name that matches no function or more than one, and a function of the wrong signature each fail the build with `E-BUILD-MANIFEST`. The text is the same on every driver. The binding is never a silent no-op.

*The colour rule (§3-3.24.1, row PREEMPT-1, APPROVED 2026-10-15).* With the key set the three functions are callees of every region. A `modifier` that is interrupt context (annotated `@interruptSafe` or `@interrupt`) therefore needs all three declared `@interruptSafe`. Otherwise the build fails with `E_INTERRUPT_SAFE_VIOLATION`, which names the modifier, its site (`<file>:<line>`), the first offending function and the key. A program with no interrupt-context `modifier` needs no annotation on them. The lowering applies on every freestanding lane that lowers `synchronized`:
- Stage0's LLVM and C backends;
- the self-hosted `loup-llvm` (both `loup-build` routes);
- `loup-llbe`, which compiles that IR.

Separate compilation (§3-3.21.2) needs nothing more: an object is keyed by its emitted IR, which carries the calls.

### §3-3.22 Freestanding Error Codes

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
| `E_STACK_BUDGET_EXCEEDED` | `stack_check = "enforce"` (§3-3.21.3): an entry's worst-case stack depth plus the interrupt charge exceeds `[freestanding] stack_size`; names the entry, the bytes and the deepest path. The image is removed |
| `E_STACK_UNBOUNDED` | `stack_check = "enforce"` (§3-3.21.3): an entry has no static stack bound (unannotated recursion, an unresolvable indirect call, an unknown frame or asm stack switch, …), or the image has no entry; names the first unbounded site. The image is removed |
| `W_STACK_BUDGET_EXCEEDED` | `stack_check = "report"` (§3-3.21.3): as `E_STACK_BUDGET_EXCEEDED`, reported as a warning; the build succeeds |
| `W_STACK_UNBOUNDED` | `stack_check = "report"` (§3-3.21.3): as `E_STACK_UNBOUNDED`, reported as a warning; the build succeeds |
| `E_OPERATOR_METHOD_LANE` | The freestanding C backend (`--backend c`, Stage0's default freestanding backend) builds a program whose reachable code applies an operator to a `struct` or class operand whose type defines the operator method (§3-2.6.1, "Operator methods"): that lane lowers an operator as the primitive operator on the two words and keeps each struct value in one block per construction site. Names each `Class.method`; build with `--backend llvm` or `--backend llbe` |
| `W_PANIC_HANDLER_UNUSED` | `loup build` of an image whose policy is `halt` or `abort` (an absent key is `halt`) while the linked program declares a `@panic_handler`, which is then dead code (§3-3.6, PANIC-1 (b)); a warning: the build succeeds and the image is unchanged |
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
| `E_FREESTANDING_WEAK` | `weak` field qualifier used in `@mode(freestanding)` — the target lacks the side-table infrastructure required for weak-reference upgrade (§1-8) |
| `E_FREESTANDING_COMPLEX_TRANSCENDENTAL` | Complex transcendental function call (`abs`, `arg`, `polar`, `fromPolar`, `cexp`, `clog`, `csqrt`, complex trig/hyperbolic family) in `@mode(freestanding)` without an explicitly-linked math runtime (§1-4.1.6, §3-3.3) |
| `E_ENTRY_DUPLICATE` | Multiple `@entry` functions |
| `E_ENTRY_NONVOID` | `@entry` has non-`void` return type |
| `E_ENTRY_PARAMS` | `@entry` has parameters |
| `E_ENTRY_NOT_FREESTANDING` | `@entry` outside `@mode(freestanding)` |
| `E_PANIC_HANDLER_SIG` | `@panic_handler` wrong signature |
| `E_NORETURN_UNREACHABLE_CONST` | `unreachable` reached, or a `noreturn` function called, during const evaluation |
| `E_PANIC_HANDLER_MISSING` | `loup build` of an image whose policy is `custom` while the linked program declares no `@panic_handler` (§3-3.6, PANIC-1 (b)); never raised by `loup check` |
| `E_PANIC_HANDLER_DUPLICATE` | Multiple `@panic_handler` functions |
| `E_PANIC_HANDLER_NOT_FREESTANDING` | `@panic_handler` outside `@mode(freestanding)` |
| `E_PANIC_HANDLER_REENTRANT` | `@panic_handler` calls a function that can panic |
| `E_ASM_OPERAND_TYPE` | ASM output operand type incompatible with constraint |
| `E_ASM_NOT_COMPILED` | `asm { }` in `@mode(web.scripted)`, `@mode(host.scripted)`, or `@mode(host.dual)` — `asm { }` is available only in `@mode(web.compiled)` (Wasm form, `@unsafe`), `@mode(host.native)` (native form, `@unsafe`), and `@mode(freestanding)` |
| `E_BACKEND_UNAVAILABLE` | All compiled modes | The driver cannot run the backend `--backend` names, and a build MUST run the lane the flag names rather than silently substituting another (§3-2.2) |
| `E_ESCAPING_BORROW_UNACKNOWLEDGED` | All compiled modes | A borrow that escapes its frame without the required acknowledgment at the call site (§3-2.4) |
| `E_RETIRED_ANNOTATION` | All | Use of an annotation retired from the language; the diagnostic names the replacement. Retired constructs are removed outright rather than deprecated, since Loup has not shipped a stable API (§3-3) |
| `E_ASM_EXPIRED_BORROW` | `borrow` value used as `asm` input after its lifetime has ended |
| `E_ATOMIC_UNALIGNED` | `native.atomic` operation on a naturally-unaligned address |
| `E_VOLATILE_NOT_BORROW` | `volatile` on a non-`borrow` parameter |
| `E_VOLATILE_WRONG_MODE` | `volatile` parameter, or a `Volatile[T]` annotation, outside `@mode(freestanding)` / `@mode(host.native)` (was `E_VOLATILE_NOT_FREESTANDING`, freestanding-only — changes catalog §9.2) |
| `E_VOLATILE_CONTRACT_ERASED` | a plain value passed to a `volatile` parameter, or a volatile-tagged binding passed to a plain one |
| `E_VOLATILE_NOT_REPR` | `Volatile[T]` with non-primitive, non-`@repr(C)` type |
| `E_VOLATILE_ENDIAN_UNDECLARED` | Plain multi-byte `Volatile[T]` in `@mode(freestanding)` with no declared endianness (§3-3.9); advisory lint, promotable to error per package; single-byte `T` exempt |
| `E_VOLATILE_ENDIAN_STRUCT` | Endian-sensitive multi-field `@repr(C)` block accessed as one `Volatile[T]`; requires a `Volatile.view` over an `@interchange` type (§3-3.9) |
| `E_REPR_NOT_STRUCT` | `@repr` on a non-struct type |
| `E_REPR_NOT_NATIVE` | `@repr` in scripted or compiled mode |
| `E_REPR_TRANSPARENT_MULTI_FIELD` | `@repr(transparent)` struct has multiple non-zero-sized fields |
| `E_EXTERN_STRUCT_NOT_REPR_C` | `extern native` struct without `@repr(C)` |
| `E_EXPORT_GENERIC` | a `@cexport` (C ABI) or `@jsexport` of a generic function in a managed mode — its symbol would carry the hidden type-descriptor parameters (§3-2 *Compiler's rule (reified type arguments on the managed lanes)*); freestanding generics are monomorphized |
| `E_GENERIC_NOT_REIFIED` | an operation that needs a type parameter's run-time descriptor (`is`, `as`, `as?`, `==`, `<`, rendering, widening to `Any`) in a method of a `@repr(C)`, `@repr(transparent)` or `@interchange` struct or of a `shared class`, which carry no hidden type-descriptor fields |
| `E_EXTERN_JS_NOT_NATIVE` | `extern js` or `@jsexport` used in `@mode(host.native)` or `@mode(freestanding)` — no JavaScript runtime present |
| `E_ALIGN_NOT_POWER_OF_TWO` | `@align(n)` where `n` is not a power of two |
| `E_ALIGN_TOO_SMALL` | `@align(n)` less than the type's natural ABI alignment |
| `E_SECTION_INVALID_NAME` | `@section` name contains invalid characters |
| `E_SECTION_NOT_FREESTANDING` | `@section` outside `@mode(freestanding)` |
| `E_SECTION_WRONG_MODE` | `@section` on a function or a module-level binding in a file whose declared mode is neither `freestanding` nor `host.native` |
| `E_SECTION_UNSUPPORTED` | a backend that cannot place a module-level binding in a named section (Cranelift) refuses the build, naming each `@section` static (row SECVAR-1) |
| `E_INTERRUPT_NONVOID` | `@interrupt` function non-`void` return type |
| `E_INTERRUPT_DIRECT_CALL` | `@interrupt` function called directly |
| `E_INTERRUPT_ASYNC` | `@interrupt` function declared `async` |
| `E_INTERRUPT_NOT_FREESTANDING` | `@interrupt` outside `@mode(freestanding)` |
| `E_INTERRUPT_FRAME_CONSTRUCT` | User code attempts to construct `InterruptFrame` directly |
| `E_INTERRUPT_CLASS_REQUIRED` | `@interrupt(arch: "s390x")` or `@interrupt(arch: "arm")` without a `class:` (or with `has_error_code:`, which is invalid on both) (§3-3.13) |
| `E_INTERRUPT_CLASS_INVALID` | `class:` on `@interrupt(arch: "s390x")` is not one of `External \| IO \| MachineCheck \| Program \| Restart \| SupervisorCall`; on `@interrupt(arch: "arm")` not one of `IRQ \| FIQ \| SupervisorCall \| Undefined \| PrefetchAbort \| DataAbort`; or `class:` on any other arch (§3-3.13) |
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
| `E_CSS_BUSY` | `Subchannel.start` while a transfer is already in flight on the subchannel (§3-3.26) |
| `E_CSS_PROGRAM_EMPTY` | `ChannelProgram[T]` submitted with no appended CCWs (§3-3.26) |
| `E_S390X_AMODE_SWITCH` | (optional lint) `SAM24`/`SAM31`/mode-changing `BASSM`/`BSM` in an `asm` block outside the `@section(".text.boot")` boot routine (§3-3.2) |
| `E_INTERRUPT_SAFE_VIOLATION` | Non-`@interruptSafe` operation inside an `@interruptSafe` function; or an implementation of an `@interruptSafe` interface method that is not itself `@interruptSafe` (row ISRIFACE-1, §3-3.24.1) |
| `E_INTERRUPT_GUARD_NOT_FREESTANDING` | `InterruptGuard` used outside `@mode(freestanding)` |
| `E_INTERRUPT_GUARD_NESTED` | `InterruptGuard` scopes nested — inner guard re-enables interrupts before outer exits; use save/restore pattern |
| `E_ALLOCATOR_SIG_V16` | `@allocator` return type is not `uint?` — missing `?` makes allocation failure undetectable |
| `E_ONSTACK_NOT_FREESTANDING` | `onstack` binding modifier outside `@mode(freestanding)` (§3-3.17c) |
| `E_ONSTACK_NOT_LOCAL` | `onstack` on a module-scope binding, parameter, or field (§3-3.17c) |
| `E_ONSTACK_NOT_AGGREGATE` | `onstack` on a declaration that materializes no aggregate block (§3-3.17c) |
| `E_ONSTACK_ESCAPES` | An `onstack` block's address escapes its frame (§3-3.17c) |
| `E_ONSTACK_UNMODELED` | The `onstack` placement analysis met an unmodelled instruction in the body (§3-3.17c) |
| `E_FRAME_INSTANCE_ESCAPES` | A frame-held class instance (a local's, a parameter's or a block's temporary) escapes its block (§3-3.17d) |
| `E_RETURN_PROVENANCE_MIXED` | A function returns a fresh class instance on one path and one it does not own on another, or a dispatched method's implementations, or the values of one function type, disagree that way (§3-3.17d) |
| `E_INSTANCE_REASSIGNED_WHILE_SHARED` | A fresh assignment rebuilds a class-typed variable's instance while another name for it is still used (§3-3.17d; Rust E0506) |
| `E_INTERRUPT_SAFE_STAGING` | An aggregate local without `onstack` inside an `@interruptSafe` / `@interrupt` body (§3-3.24.1) |

**Build-pipeline diagnostics.** The codes above are emitted by the compiler front end against source. The freestanding *build* additionally emits link-stage diagnostics, which follow the hyphenated `E-BUILD-*` convention:

| Code | Condition |
|---|---|
| `E-BUILD-IMAGE-SIZE` | Linked image exceeds `[linker].max_image_size` on the default C/LLVM freestanding path (§3-3.21) |
| `E-BUILD-LLBE` | Link-stage failure on the clang-free self-hosted path (`--backend llbe`), including an image over `[linker].max_image_size` (§3-2.2, §3-3.21) |

*(Error codes for cross-mode features introduced in v1.16 — `E_ATOMIC_AWAIT`, `E_ATOMIC_NOT_WASM`, `E_LOCK_ORDER_*`, `E_CROSS_BOUNDARY_CYCLE`, `E_NAKED_NOT_UNSAFE`, `E_PARTIAL_INIT_*`, `E_FIELD_REF_INVALID`, `E_SIGNAL_SAFE_NOT_NATIVE` — are defined in their respective sections: §2-1.7, §3-2.4.13, §3-2.5, §3-3.14, §3-3.17a, §1-18.9, §1-19.16.)*

### §3-3.23 Example — x86_64 Kernel Stub

```loup
@mode(freestanding)

import native.mem
import native.atomic

# ── Hardware layouts ──────────────────────────────────────────────────────

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

# ── UART driver ───────────────────────────────────────────────────────────

let COM1 = Volatile[UartRegs].at(0x3F8)

func serialWrite(s: string): void {
    for (c in s) {
        while (COM1.read().lsr & 0x20 == 0) {}
        COM1.modify(func(r) => r with { data = c as uint8 })
    }
}

# ── CPU helpers ───────────────────────────────────────────────────────────

func readCr2(): uint64 {
    var cr2: uint64 = 0
    asm { "mov rax, cr2"  out: cr2 = "=a"  clobbers: [] }
    return cr2
}

# ── Interrupt handlers ────────────────────────────────────────────────────

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

# ── Panic handler ─────────────────────────────────────────────────────────

@panic_handler
func kernelPanic(msg: string, file: string, line: int): noreturn {
    serialWrite("PANIC: ")
    serialWrite(msg)
    serialWrite("\n")
    asm { "cli" }
    while (true) { asm { "hlt" } }
}

# ── Kernel entry ──────────────────────────────────────────────────────────

func kernelMain(): void {
    serialWrite("Loup kernel v1.17\n")
    # Load IDT, enable interrupts ...
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
delivery = "freestanding"   # v1.21: `delivery`, core §1-13.3 (`target` is its former spelling)
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


### §3-3.24 `@interruptSafe` Annotation and `InterruptGuard`

*(This section is normative. Applies to `@mode(freestanding)` only.)*

#### §3-3.24.1 `@interruptSafe` — Interrupt-Context Safety Annotation

`@interruptSafe` declares that a function may legally be called from an interrupt handler context (invariant **I4** — "no sleeping/blocking in interrupt context"). The compiler enforces two families of constraint on the body of an `@interruptSafe` function, an `@interrupt` ISR entry (§3-3.13, which is implicitly interrupt-safe), or a class/struct **method** annotated `@interruptSafe` (so a driver's interrupt-handler method is checked, not only the free-function path):

1. **No sleeping, blocking, or sleep-allocating constructs.** Heap allocation (`new`, arena `new`), `throw`, `await`, and `spawn` are each `E_INTERRUPT_SAFE_VIOLATION`. These are the operations that can yield, block, or take an allocator lock — none of which is legal with interrupts disabled at an arbitrary preemption point.
2. **The call-graph "color" rule** (see below): an interrupt-context body may only call functions that are themselves `@interruptSafe`.

`@interruptSafe` may also stand on an **interface method signature**, abstract or default (row ISRIFACE-1; core §1-8.8). There it is a contract: every implementation must carry it, and a call through the interface is checked against it (the color rule's interface-dispatch and conformance bullets below).

The compiler also enforces that `@interruptSafe` functions access `static var` bindings only through `native.atomic` operations — direct field reads or writes on a `static var` inside an `@interruptSafe` context are `E_INTERRUPT_SAFE_VIOLATION`.

This annotation closes the interrupt-reentrancy gap: a mutable global accessed from both the main loop and an interrupt handler is a data race that Loup's ownership system does not track by default, and a handler that sleeps or blocks deadlocks the CPU it preempted. `@interruptSafe` makes both constraints statically enforced.

```loup
@mode(freestanding)

static var interruptCount: uint64 = 0

# ✓ @interruptSafe — accesses static var only via native.atomic
@interruptSafe
func onTimerIrq(): void {
    native.atomic.fetchAdd[uint64](
        native.ffi.addrOf(interruptCount),
        1u64
    )
}

# ✗ E_INTERRUPT_SAFE_VIOLATION — direct access to static var
@interruptSafe
func badIrqHandler(): void {
    interruptCount += 1   # not atomic — E_INTERRUPT_SAFE_VIOLATION
}
```

**Staging rule — aggregate locals must be `onstack`.** Freestanding stages an aggregate value through a compiler-chosen block, and unless that block is a frame allocation it is a per-function *static* shared by every invocation — exactly the storage an interrupt can find half-written. There are three producers of such a block, and interrupt-context bodies are checked against all three:

| Producer | Staged in | Rule inside `@interruptSafe` / `@interrupt` |
|---|---|---|
| by-value struct/class parameter or return | `__obj_` | advisory (`W`-severity `E_INTERRUPT_SAFE_VIOLATION`) — pass `borrow`/pointer or a primitive handle |
| **struct or `local class` LOCAL** | `__obj_` | `E_INTERRUPT_SAFE_STAGING` unless declared `onstack` |
| **`buffer[T, N]` LOCAL (allocate form)** | `__bufdata_` | `E_INTERRUPT_SAFE_STAGING` unless declared `onstack` |

**Enum backings are placed automatically, not by `onstack`.** An enum value's `[tag, field…]` block is compiler-chosen rather than a declared local, so it carries no modifier: a backing whose address is proven not to leave the frame is emitted as a **frame allocation**, and one that escapes — returned, most of all — keeps a per-site static, because a frame block that outlives its frame dangles rather than races, which is strictly worse. Both properties are normative for every backend: an escaping backing must NOT be frame-placed, and a proven non-escaping one must NOT be left in a shared static, since in interrupt context or under SMP that static is the §3-3.24.1 hazard with no allocator to fall back on. Backends must agree here — the placement is observable in emitted IR, so a backend that computes the non-escaping set and then declines to use it both reintroduces the hazard and breaks byte-identity against the others.

**The aggregate-type set spans the whole module graph.** Whether a local's type is an aggregate is decided against every struct/class name reachable in the program, not only those the current module declares. `var c: X86Cpu` stages through the same shared static whether `X86Cpu` is declared beside it or imported, so a module-local set would make both the staging rule above and the `onstack` aggregate rule (§3-3.17c) silently *pass* on the imported case — the shape kernels overwhelmingly write, since arch types live in their own module. Two consequences are normative: an imported aggregate local inside an interrupt-context body is `E_INTERRUPT_SAFE_STAGING`, and `onstack` on an imported aggregate is accepted rather than `E_ONSTACK_NOT_AGGREGATE`. The second matters as much as the first: `onstack` is the remedy this rule prescribes, so a narrower set would reject the fix it had just demanded.

The parameter/return row stays advisory because existing kernels marshal by value across ABI boundaries today and the remedy is a signature change. The two *local* rows are errors: the remedy is the one-word `onstack` (§3-3.17c), and the failure they describe — a shared block silently backing what reads as a local — is invisible in the source. The overlay form of `buffer[T, N]` allocates nothing and is exempt.

**Call-graph color rule.** An `@interruptSafe` function (or an `@interrupt` entry) may not call a non-`@interruptSafe` function. Calling one is a hard compile error `E_INTERRUPT_SAFE_VIOLATION` (not a soft lint), so the "color" propagates and the entire reachable call tree is statically interrupt-safe — the headless `@mode(freestanding)` exit criterion "a sleep-in-IRQ attempt fails to compile". The rule is scoped to what can actually be annotated and resolved at check time:

- A direct call to a **user-declared free function** that is not `@interruptSafe` is the violation (e.g. an ISR calling `schedBlock`). The author makes the called leaf interrupt-safe by annotating it `@interruptSafe`, propagating the color down the tree.
- Calls to **builtins / intrinsics / externs** (which are not user-declared and cannot be annotated — e.g. `native.atomic.*`, an inline-`asm` wrapper) are not flagged.
- A class/struct **method** annotated `@interruptSafe` (or `@interrupt`) has its body checked exactly like a free function: the constructs of family 1, the colour rule, and the two LOCAL rows of the staging table. Every method shape counts — instance and `static` methods, `modifier`s of a `synchronized` class, property accessors (`get` / `set`), the members of a template composition (core §1-23.4: the composed type is a struct, and a part carries the annotations of the layer that fills it), and methods declared inside a namespace (loup#989: Stage0 walked class methods only). Both checkers report the same rows (code, line:column, text).
- *Method calls are coloured too (row PREEMPT-1, APPROVED by the maintainer 2026-10-15).* Inside an interrupt-context body (an `@interruptSafe` or `@interrupt` function or method, but not a lambda it defines), a call `recv.m(…)` to a method of one of the program's OWN classes or structs is checked like a free call. The method is resolved on the receiver's static type, then on the class that declares it, and it must be `@interruptSafe` (or `@interrupt`). A method of a standard-library type is not the program's to annotate, so it is not flagged (as a builtin is not). A violation is the error `E_INTERRUPT_SAFE_VIOLATION`, on both checkers, in `loup check` and on every build route.
  - *Rollout (maintainer, 2026-10-15: split rollout).* 1.28.0 shipped the rule as a `W`-severity warning, so that kernels had one release to annotate their methods. From 1.29.0 it is an error; the text no longer carries the "(a warning in 1.28.0, an error from 1.29.0)" tail.
  - **With `[freestanding] preempt_defer` set** (§3-3.21.4) and the callee a non-`@interruptSafe` `modifier` of a `synchronized` class, the error has its own text, because that region would call the preempt_defer hooks from interrupt context, unseen by the hooks' own colour check. It names the call site, the modifier and the key. (This case was an error already in 1.28.0.)
  - **Interface dispatch (row ISRIFACE-1, APPROVED by the maintainer 2026-10-16).** A call `recv.m(…)` through a receiver whose static type is an interface `I` the program declares is checked against `I.m`'s OWN annotation: `@interruptSafe` is valid on an interface method signature, abstract or default (core §1-8.8). An inherited signature is the extending interface's copy, annotation included. A non-`@interruptSafe` `I.m` is the same error as a method call, `E_INTERRUPT_SAFE_VIOLATION` (a `W`-severity warning in 1.28.0, an error from 1.29.0, as above). When `[freestanding] preempt_defer` is set and ANY implementation of `I.m` in the program is a `modifier` of a `synchronized` class, the diagnostic names `I.m` and that implementation (an error already in 1.28.0). A standard-library interface stays unflagged, as a standard-library method does.
  - **Conformance (row ISRIFACE-1).** An implementation of an `@interruptSafe` interface method must itself be `@interruptSafe`: a call through the interface runs it in interrupt context. Otherwise it is `E_INTERRUPT_SAFE_VIOLATION`, an ERROR from day one (no program relied on the annotation before it existed). The implementation is the method a call on the implementing class or struct runs: its own, an inherited one, or the interface's default. The error is reported at the implementing method, or at the implementing type when it inherits the method from a superclass that does not implement the interface itself. An annotated implementation of an unannotated interface method is fine. An `@interruptSafe` DEFAULT method is an `@interruptSafe` method of every class it is synthesized into, so its body is colour-checked like any `@interruptSafe` body. With `preempt_defer` set, an `@interruptSafe` implementation that is a synchronized `modifier` needs `@interruptSafe` hooks (§3-3.21.4), like any interrupt-context modifier.
  - Acquiring a `@lockOrder(N) synchronized class` lock from an interrupt-context body therefore needs its `modifier` annotated `@interruptSafe`, which also makes its body checked.

```loup
@mode(freestanding)

@interruptSafe
func ackIrq(): void { /* ... */ }

func schedBlock(): void { /* may yield — NOT interrupt-safe */ }

# ✓ calls only @interruptSafe functions
@interruptSafe
func onTimerIrq(): void { ackIrq(); }

# ✗ E_INTERRUPT_SAFE_VIOLATION — calls a non-@interruptSafe function
@interruptSafe
func badHandler(): void { schedBlock(); }
```

**Composition with `@lockOrder`.** The color rule and the `@lockOrder` acquisition lattice (§ lock-order family) are orthogonal and independent: an `@interruptSafe` function may acquire a `@lockOrder(N) synchronized class` lock through a `modifier` that is itself `@interruptSafe` (the colour rule covers the method call), and the lattice check (`E_LOCK_ORDER_*`) is unaffected. `@interruptSafe` neither implies nor requires a rank.

`@interrupt`-annotated ISR entry points (§3-3.13) are implicitly `@interruptSafe`: their bodies are held to the same two constraint families above.

#### §3-3.24.2 `InterruptGuard` — Interrupt-Masking Critical Section

`InterruptGuard` implements `Releasable` (§1-11.2) and masks interrupts for the duration of its lexical scope, providing mutual exclusion between the main execution path and interrupt handlers without requiring a runtime mutex. Because `Releasable : Scoped[Self]`, the guard works directly with `with` blocks; the default `scope_exit` calls `release()` to re-enable interrupts.

```loup
namespace native.freestanding;

# `unique class` semantics: no cloning, release-on-drop, move-only —
# aliasing the guard would defeat its mutual-exclusion purpose.
pub unique class InterruptGuard : Any implements Releasable {
  # Disable interrupts (architecture-specific: CLI on x86_64, MSR DAIF on AArch64, CSRCI mstatus.MIE on RISC-V).
  pub static func disable(): InterruptGuard

  # Re-enable interrupts and release the guard (called automatically by `with` block exit).
  pub func release(): void
}
```

Usage with `with`:

```loup
@mode(freestanding)

static var sharedCounter: uint32 = 0

func incrementSafely(): void {
    with (g = InterruptGuard.disable()) {
        # Interrupts are masked — access to sharedCounter is race-free
        sharedCounter += 1
    }   # interrupts re-enabled automatically on with-block exit
}
```

`InterruptGuard` is not reentrant — nesting two `InterruptGuard` scopes results in the inner guard re-enabling interrupts on release before the outer guard exits (`E_INTERRUPT_GUARD_NESTED` lint advisory). When nesting is required, use an interrupt-save/restore pattern instead:

```loup
# Save and restore interrupt state across nested calls (the §3-3.14
# interrupt-mask intrinsics: the token restores exactly what was saved)
let token = irqSaveDisable()
# ... critical section ...
irqRestore(token)
```

`E_INTERRUPT_GUARD_NESTED` is reported for a `with (g = InterruptGuard.disable())` (or `interruptGuardEnter()`) block lexically inside another; it is an advisory (warning), not an error. `release()` restores the interrupt state saved by `disable()` — it re-enables interrupts exactly when they were enabled at `disable()` time.

`InterruptGuard` is available only in `@mode(freestanding)`. Using it outside freestanding mode is `E_INTERRUPT_GUARD_NOT_FREESTANDING`.

---


### §3-3.25 Freestanding Debug Service

*(This section is normative. Applies to `@mode(freestanding)` with `--debug` only.)*

> **Status — implemented.** Portal capture, both transports, the wire protocols,
> `start()` / `poll()`, host-driven activation, the time-travel ring, and
> `loup debug attach` are real and verified end-to-end: a host tool attaches to a
> freestanding kernel booted under QEMU (its UART bridged to a socket), enumerates
> the portals the compiler baked into `.debug_portals`, activates one, and receives
> the target's `ACK`.
>
> **Residual gaps, all named:**
>
> - `traceFlushIntervalUs` has nothing to drive it: freestanding has no portable
>   clock seam, so a *timed* flush cannot be implemented without inventing one.
>   `flushTrace()` (§3-3.25.3) is the explicit alternative: it drains the staging
>   buffer on demand, from an idle tick or before halting. Every other config field
>   is acted on.
> - `CALL_EVENT` / `RETURN_EVENT` (§3-3.25.7) are never emitted: only **explicit**
>   `portal` statements are instrumented. Every function also carries an implicit
>   enter/exit portal pair, but instrumenting those would put a frame write in the
>   prologue of every function in the image — ruinous in an interrupt handler.
> - `loup debug attach --semihosting` is not implemented (it needs a debug-probe
>   channel); `--uart` and `--tcp` work. A SEPARATE trace transport (`--trace-uart`,
>   `--trace-tcp`, `--trace-swo`) opens a second, read-only stream and is supported;
>   without one, trace events are multiplexed onto the control transport by opcode
>   prefix, which is also what a single-UART target should do.
> - **The time-travel ring is sized by the MANIFEST, not the config.** A static BSS
>   array cannot be sized by a *runtime* value, so the capacity comes from
>   `[freestanding] time_travel_frames` (compile time); `timeTravelEnabled` gates
>   writes and `timeTravelRingFrames` is advisory. §3-3.25.9 states this normatively
>   since 2026-11-09.
> - Both freestanding backends emit the service. The C backend emits it inline; the
>   LLVM backend emits the portal call sites into the `.ll` and carries the service
>   body in the companion `.c` it already compiles alongside — one emitter, so the
>   two cannot drift. Verified identical on the wire, byte for byte, against a
>   kernel booted under QEMU.

#### §3-3.25.1 Overview

When `loup build --debug --target freestanding` is invoked and at least one debug channel or ring buffer is configured via `.lppkg`, the compiler synthesizes a freestanding debug service that provides:

- A static **activation table** in BSS: one `atomic uint8` per portal, indexed by compile-time portal ID. All entries are zero-initialized. Portal sites perform a single aligned atomic byte load; a zero value is the fast path (inert). Inactive-portal cost: one aligned atomic load per portal site, no branch.
- A read-only **portal name table** in the `.debug_portals` linker section: maps portal IDs to fully-qualified name strings, source file paths, and line numbers. Baked at link time. Analogous to the static metadata table in `@mode(host.native)`.
- A compiler-emitted **`FreestandingDebugFrame`** value constructed at each active portal site and passed to the trace channel or written to the ring buffer.
- An optional **time-travel ring** (`.debug_ttravel` section) — a compiler-synthesized static circular array of `FreestandingDebugFrame` values for post-hoc replay (§3-3.25.9). This is not a user-instantiable type; it is allocated and managed entirely by the compiler when `timeTravelEnabled = true`.
- An optional **dual-channel debug service** started by calling `debug.freestanding.start()`.

Release builds strip all portal instrumentation, the activation table, the portal name table, the `.debug_ttravel` ring, and the `.debug_ring` fallback ring. No BSS overhead in release.

#### §3-3.25.2 `FreestandingDebugFrame`

```loup
@repr(C)
struct FreestandingDebugFrame {
    pub let eventKind:  uint8;   # 0=Portal, 1=Call, 2=Return
    pub let portalId:   uint32;
    pub let nameOffset: uint32;  # byte offset into .debug_portals name table
    pub let fileOffset: uint32;  # byte offset into .debug_portals file table
    pub let line:       uint32;
    pub let column:     uint32;
    pub let seqNum:     uint32;  # monotonic sequence number; wraps at uint32 max
}
```

No heap allocation. All pointer-like fields are offsets into read-only link-time sections. `TraceLevel` is always `PortalOnly` in freestanding debug builds — full local-variable capture requires a GC heap and is unavailable. `sizeof(FreestandingDebugFrame) = 28` bytes under `@repr(C)` on all supported targets (1 byte `eventKind` + 3 bytes alignment padding + six `uint32` fields).

`seqNum` is a per-portal monotonically incrementing counter maintained in the activation table's extended slot. The host uses it to detect dropped frames on lossy transports.

#### §3-3.25.3 Channel Annotations

Two optional annotations provide the compiler with user-supplied transport implementations. Neither is mandatory; §3-3.25.5 specifies behavior when one or both are absent.

**Transport and configuration types (normative).** These are declared by the
`debug.freestanding` stdlib module; a channel function imports them
(`from debug.freestanding import (FreestandingTraceChannel);`).

**Addresses are plain integers.** Freestanding Loup has no raw-pointer type — an
address is an `int`, the same convention `Volatile[T].at(addr)` (§3-3.9) uses —
and the freestanding ABI is uniformly 64-bit. A transport's `write` therefore
takes the **address** of the frame bytes and their **length**, and returns the
number of bytes accepted. (Earlier revisions of this section wrote these fields as
`fn(buf: borrow[~ch] *uint8, len: uint32): uint32`, which is not expressible in
freestanding Loup and never compiled.)

```loup
# Unidirectional trace transport; returned by an @debug_trace_channel function.
# `write(bufAddr, len)` — `bufAddr` is the address of `len` bytes of frame data;
# returns the number of bytes accepted. It runs in whatever context the portal
# fired in (including an interrupt handler), so it must not block or allocate.
@repr(C)
pub struct FreestandingTraceChannel {
    pub let write: fn(int, int): int;
    pub let flush: Option[fn(): void] = None;   # called at each staging-buffer drain
}

# Bidirectional control transport; returned by an @debug_control_channel function.
@repr(C)
pub struct FreestandingControlChannel {
    pub let read:  fn(int, int): int;
    pub let write: fn(int, int): int;
}

# Selects how the debug service polls the control channel for incoming commands.
enum ControlPollMode {
    Polling;    # call debug.freestanding.poll() periodically from user code
    Interrupt;  # control ISR registered via @interrupt handles incoming bytes
}

# Configuration passed to debug.freestanding.start().
struct FreestandingDebugConfig {
    pub let controlPollMode:      ControlPollMode;
    pub let traceFlushThreshold:  uint32;   # flush when N bytes pending; 0 = flush every event
    pub let traceFlushIntervalUs: uint32;   # flush every N µs; 0 = disable timer flush
    pub let timeTravelEnabled:    bool;     # record into the .debug_ttravel ring (§3-3.25.9)
    pub let timeTravelRingFrames: uint32;   # advisory; the ring's capacity is [freestanding] time_travel_frames
}
```

These types are available exclusively in `--debug` freestanding builds. Referencing them in release builds or in non-freestanding modes is `E_FREESTANDING_MODULE`.

**`@debug_control_channel`**

```loup
from debug.freestanding import (FreestandingControlChannel);

@debug_control_channel
func myControlChannel(): FreestandingControlChannel {
    return FreestandingControlChannel(
        read:  func(bufAddr: int, len: int): int { /* … fill up to len bytes at bufAddr;
                                                      return how many were read (0 = none
                                                      pending) … */ },
        write: func(bufAddr: int, len: int): int { /* … send len bytes from bufAddr … */ }
    );
}
```

Bidirectional. Used for command/response traffic (portal query, activate, deactivate, replay buffer request). Low-volume. Typically backed by UART, semihosting, or a memory-mapped command FIFO.

**`@debug_trace_channel`**

```loup
from debug.freestanding import (FreestandingTraceChannel);

@debug_trace_channel
func myTraceChannel(): FreestandingTraceChannel {
    return FreestandingTraceChannel(
        write: func(bufAddr: int, len: int): int { /* … send len bytes from bufAddr … */ }
    );
}
```

The compiler calls the annotated function **once** — eagerly if `start()` is called,
otherwise lazily on the first portal hit — to obtain the transport, then invokes
`write` with the address and length of the bytes to send. `write` runs in whatever
context the portal fired in (including an interrupt handler), so it must not block
or allocate.

Write-only from the target perspective. Suitable for ITM/SWO over CoreSight, DMA
FIFOs, or any high-throughput unidirectional transport.

**Staging.** `write` is not necessarily called once per event. When
`FreestandingDebugConfig.traceFlushThreshold` is non-zero, events accumulate in a
staging buffer — sized at compile time by `[freestanding] portal_trace_buffer_size`,
default 8192 bytes — and are **drained** in a single `write` call once that many
bytes are pending, or once the next event would not fit. Batching is what lets a
byte-at-a-time transport survive a portal storm: a drain is one transport round-trip
for many events instead of one apiece. Each drained batch is terminated by a
`TRACE_SYNC` record (§3-3.25.7) carrying the last event's sequence number, so a batch
is self-delimiting and the drain boundary is where the host checks for dropped events.

A threshold larger than the buffer is clamped to it. A `portal_trace_buffer_size`
too small to hold one event plus its terminating `TRACE_SYNC` disables staging
entirely, as does the default `traceFlushThreshold` of `0` — in which case each event
is written as it fires and no `TRACE_SYNC` is emitted.

**`flush: Option[fn(): void]`** is optional. If provided, it is called once at the
end of each drain (and after each event when staging is off) — the seam for kicking a
DMA transfer or draining a FIFO that `write` only queued into. Leave it `None` when
`write` delivers synchronously.

**`flushTrace()`** drains the staging buffer on demand:

```loup
from debug.freestanding import (flushTrace);

flushTrace();   # send whatever is staged, right now
```

Staging batches, so the final partial batch would otherwise sit in the buffer until
the next event pushed it past the threshold — and a program that has gone quiet, or
is about to halt, never sends one. Those events would simply be lost. Call
`flushTrace()` before halting, at the end of a capture window, or from an idle tick.
It is a no-op when staging is off or no trace channel is configured, and it calls
`flush` if the channel provides one. (`traceFlushIntervalUs` would drain on a timer
instead, but freestanding has no portable clock seam; see the status notice.)

**Interrupt safety.** The 28-byte frame is staged on the *stack*, so a portal in an ISR
is safe. The transport and the staging buffer are not re-entrant, so a portal event that
fires while either is in use is handled as follows:

- **The transport is mid-write** (an event or a batch is going out). The event is
  **dropped**, and counted. It is not written: injecting a complete record between two
  bytes of the record in flight desynchronizes the host, which reads a self-delimiting
  opcode stream. It is not staged either — the staging buffer may be the very thing
  being transmitted. (Writing it would additionally re-enter the transport, which
  without staging recurses unboundedly.) This hazard does **not** require a shared
  control wire; trace-vs-trace on a dedicated trace wire is sufficient.
- **The service is staging** (copying into the buffer; the wire is idle). The event
  bypasses the buffer and is written immediately, so it is delivered — ahead of the
  batch, carrying its sequence number.
- **`poll()` holds the wire.** The event is deferred into the staging buffer and drained
  when `poll()` releases it (see §3-3.25.8).

Dropped events are observable to the host as gaps in the per-portal sequence numbers.

Both annotations follow the `@panic_handler` error pattern: wrong signature is the `_SIG` error code; multiple definitions is `_DUPLICATE`.

#### §3-3.25.4 Starting the Debug Service

```loup
from debug.freestanding import (FreestandingDebugConfig, ControlPollMode, start, poll);

# Example — polling control, staging trace events and draining every 1 KiB.
start(FreestandingDebugConfig(
    controlPollMode      = ControlPollMode.Polling,
    traceFlushThreshold  = 1024, # drain when 1 KiB is staged; 0 = write every event
    traceFlushIntervalUs = 0,    # NOT YET IMPLEMENTED (no clock seam)
    timeTravelEnabled    = false,
    timeTravelRingFrames = 0
));

# …then service the control channel from a main loop or scheduler tick:
poll();
```

Calling `start()` is **optional**: without it the service still starts lazily on the
first portal event, with default settings — staging off, so every event is written as
it fires. What `start()` adds is eager transport acquisition and explicit
configuration.

Of the config, `controlPollMode` and `traceFlushIntervalUs` are read but not acted
on; the rest are live. See the status notice at the head of §3-3.25.

`debug.freestanding.start()` is available only in `--debug` builds. Calling it in a release build is `E_FREESTANDING_DEBUG_START_RELEASE`.

`controlPollMode`:
- `ControlPollMode.Interrupt` — `poll()` **drains** the channel: it keeps handling commands until no bytes remain. Call it from a control ISR, which the user registers via `@interrupt`. Draining is what makes an ISR correct: the handler runs when the transport signals that bytes have arrived, and on an edge-triggered controller that edge fires once for the whole burst — handling a single command and returning would strand the rest, with no further edge coming to collect them.

`poll()` is re-entrancy-guarded in both modes: a control ISR firing while the main loop is already inside `poll()` returns immediately rather than interleaving a second reader on one byte stream, which would desync it (one reader consuming the other's payload bytes as an opcode). Nothing is lost — the interrupted caller is already reading.
- `ControlPollMode.Polling` — `debug.freestanding.poll()` must be called periodically (from a main loop or cooperative scheduler tick) to service incoming control commands. **`debug.freestanding.poll()` normative behaviour:** reads up to one complete control-channel message per call, dispatches the response (e.g. sends `PORTAL_TABLE` in reply to `QUERY_PORTALS`, activates a portal in reply to `ACTIVATE`), then returns immediately. It is the caller's responsibility to call it often enough that command latency meets the application's requirements. `poll()` is a no-op if no bytes are available on the control channel.

`timeTravelEnabled` — when `true`, and the build compiled a time-travel ring in (`[freestanding] time_travel_frames` > 0, §3-3.25.9), each portal event appends a `FreestandingDebugFrame` to the ring regardless of whether a `@debug_trace_channel` is configured. The host retrieves a snapshot of the ring at any time via `READ_REPLAY_BUFFER` over the control channel (§3-3.25.6). See §3-3.25.9 for full semantics.

#### §3-3.25.5 Channel Fallback Matrix

| `@debug_control_channel` | `@debug_trace_channel` | `portal_ring_size` | Behavior |
|---|---|---|---|
| Provided | Provided | Any | Commands over control; trace events stream over trace channel; time-travel ring available if `timeTravelEnabled` |
| Provided | Absent | > 0 | Commands over control; trace events queued in ring buffer; host retrieves via `READ_TRACE_BUFFER` command |
| Provided | Absent | 0 | Commands over control; trace events discarded; time-travel ring available if `timeTravelEnabled` (ring lives in BSS, retrieved via control channel) |
| Absent | Provided | Any | All portals unconditionally active; events stream over trace channel; no runtime activation control; time-travel ring available if `timeTravelEnabled` |
| Absent | Absent | > 0 | Ring buffer only; JTAG memory-read path; no live host connection. If `timeTravelEnabled = true`, the `.debug_ttravel` ring is also allocated and JTAG-readable, but `READ_REPLAY_BUFFER` is unavailable (no control channel) |
| Absent | Absent | 0 | `E_FREESTANDING_PORTAL_NO_CHANNEL` |

The "always-on trace" configuration (fourth row) is the embedded always-on logging path. Dynamic activation control is unavailable because there is no control channel; every portal fires unconditionally for the duration of the debug build.

#### §3-3.25.6 Control Channel Protocol

Binary protocol over the control channel. All integers little-endian.

**Host → Target:**

| Opcode | Name | Payload |
|---|---|---|
| `0x01` | `QUERY_PORTALS` | — |
| `0x02` | `ACTIVATE` | `portal_id: u32` |
| `0x03` | `DEACTIVATE` | `portal_id: u32` |
| `0x04` | `DEACTIVATE_ALL` | — |
| `0x05` | `READ_TRACE_BUFFER` | `max_bytes: u32` |
| `0x06` | `READ_REPLAY_BUFFER` | `max_frames: u32` — requests time-travel ring contents; when fewer than the live frames, the NEWEST `max_frames` (§3-3.25.9) |

**Target → Host:**

| Opcode | Name | Payload |
|---|---|---|
| `0x81` | `PORTAL_TABLE` | `count: u32`, then `count` × `{id: u32, name_len: u16, name: utf8, file_len: u16, file: utf8, line: u32}` |
| `0x82` | `ACK` | `acked_opcode: u8` |
| `0x83` | `ERR` | `acked_opcode: u8, code: u8` |
| `0x84` | `TRACE_BUFFER_CHUNK` | `len: u16, data: bytes` |
| `0x85` | `REPLAY_BUFFER_CHUNK` | `frame_count: u16`, then `frame_count` × `FreestandingDebugFrame` (§3-3.25.2) |

#### §3-3.25.7 Trace Channel Protocol

Target → host only. All integers little-endian.

| Opcode | Name | Payload |
|---|---|---|
| `0x01` | `PORTAL_EVENT` | `id: u32, file_offset: u32, line: u32, column: u32, seq: u32` |
| `0x02` | `CALL_EVENT` | `id: u32, file_offset: u32, line: u32, column: u32, seq: u32` |
| `0x03` | `RETURN_EVENT` | `id: u32, file_offset: u32, line: u32, column: u32, seq: u32` |
| `0xFF` | `TRACE_SYNC` | `seq: u32` |

`seq` is the per-portal sequence number from `FreestandingDebugFrame.seqNum`. `TRACE_SYNC` **terminates each drained batch** (§3-3.25.3), carrying the last event's sequence number — so a batch is self-delimiting, and the drain boundary is where the host checks for drops. The host tracks expected sequence per portal ID; a gap indicates lost frames. With staging off (the default) events are written one at a time and no `TRACE_SYNC` is emitted.

#### §3-3.25.8 Host Tooling

**Protocol versions.** The byte protocol of §3-3.25.6 is debug wire **version 0**; it is what a freestanding target speaks. Hosted debuggees speak the framed **version 1** of the time-travel protocol (runtime §2-5.3) on their own endpoint. A client knows which version it speaks from the transport it opened (`--uart`, `--tcp` to a target and `--semihosting` are version 0) and never sends a version-1 message to a version-0 target: §3-3.25.6 messages carry no length prefix, so the payload of an unknown opcode would be read as further commands.

The `loup debug attach` command connects to a running freestanding debug service:

```
loup debug attach --uart /dev/ttyUSB0 --baud 115200
loup debug attach --tcp 192.168.1.100:2345
loup debug attach --semihosting                          # ARM/RISC-V via debug probe
loup debug attach --uart /dev/ttyUSB0 --trace-swo /dev/ttyUSB1
```

`--trace-swo` (or `--trace-uart`, `--trace-tcp`) specifies a separate transport for the trace channel when control and trace are physically distinct. When only one transport is specified, it carries both channels multiplexed by opcode prefix.

**Multiplexing is byte-serialized on the target.** When a build declares BOTH a trace channel and a control channel, the compiler cannot see whether their `write` functions reach the same wire — they are user code — so it assumes they might, and serializes the two transmit paths against each other:

- A portal event that fires while a control response is in flight is **deferred** into the trace staging buffer, and drained the moment `poll()` releases the wire.
- `poll()` returns immediately, without consuming a command, while a trace event is mid-transmit. Nothing is lost: the command is still in the transport's receive FIFO.

Without this, a portal firing from an interrupt mid-response splices its 21-byte `PORTAL_EVENT` between two bytes of that response. The host reads a self-delimiting opcode stream, so it then decodes the event's payload as opcodes and desynchronizes — a corrupted session, not merely a lost event.

Deferral needs somewhere to defer TO. If `portal_trace_buffer_size` is `0` (or smaller than one event plus its `TRACE_SYNC`), an event that fires while control holds the wire is **dropped** rather than allowed to corrupt the response, and the host sees the gap in the per-portal sequence numbers. Such a build reports `W-BUILD-DEBUG-NO-DEFER`. After attaching, the host reads the portal name table via `QUERY_PORTALS` and presents the standard portal activation interface.

Time-travel replay is available via `READ_REPLAY_BUFFER` over the control channel when `timeTravelEnabled = true`. The host renders the captured event ring as a portal-level trace timeline with `TraceLevel.PortalOnly` semantics — the same visualization produced by `PortalOnly` time-travel capture in `@mode(host.native)` (the runtime volume's trace history, §2-5.3). Unlike native mode, the ring buffer resides on-target rather than in host memory, making replay available even after a target reset when using a non-volatile ring placement.

#### §3-3.25.9 Time-Travel Replay for Freestanding

*(This section is normative.)*

When a `--debug` build's manifest sets `[freestanding] time_travel_frames = N` with N > 0, the compiler allocates a static circular ring of N `FreestandingDebugFrame` values in the `.debug_ttravel` linker section, `N × sizeof(FreestandingDebugFrame)` bytes of BSS. The capacity is a compile-time value because a static array cannot be sized by a run-time one; `FreestandingDebugConfig.timeTravelRingFrames` is advisory and does not size the ring. `FreestandingDebugConfig.timeTravelEnabled` gates writes into the ring at run time (set by `debug.freestanding.start()`).

**Write path.** Each time an active portal fires, the debug service appends a `FreestandingDebugFrame` to the ring (overwriting the oldest frame when full). This write occurs independently of — and in addition to — any `@debug_trace_channel` emission. The ring is therefore populated even in the trace-only and ring-only configurations from §3-3.25.5. The write is interrupt-safe: the ring uses a lock-free single-producer scheme compatible with `@interruptSafe` portal sites.

**Read path.** The host requests ring contents via the `READ_REPLAY_BUFFER` control command (§3-3.25.6), receiving up to `max_frames` `FreestandingDebugFrame` records in `REPLAY_BUFFER_CHUNK` response messages, in chronological order. When `max_frames` is less than the number of live frames, the target returns the NEWEST `max_frames` frames: the events closest to the present are what a flight recorder is read for (maintainer ruling 2026-11-09; pending implementation — the service as shipped through 1.30.0 returns the oldest; task tt.54 of feature spec `2-runtime-4-time-travel`). The ring state is not disturbed by a read — the target continues appending; the host receives a snapshot.

**Replay semantics.** Freestanding time-travel is `TraceLevel.PortalOnly` — the ring contains call/return/portal events with source locations, but no local-variable state. The host `loup debug attach` session renders the captured event sequence as a portal-level trace timeline. This is the same visualization produced by `TraceLevel.PortalOnly` capture in `@mode(host.native)`, with the distinction that the ring is stored on-target rather than in host memory.

**Zero-overhead when disabled.** When `time_travel_frames` is absent or 0 (the default), no ring is allocated, no write path code is emitted, and BSS is unaffected; the `READ_REPLAY_BUFFER` opcode returns `ERR` with code `0x01` (feature disabled). When a ring is compiled in but `timeTravelEnabled = false`, portal events are not appended and `READ_REPLAY_BUFFER` returns a `REPLAY_BUFFER_CHUNK` of the frames recorded while it was enabled (possibly none).

**Ring size guidance.** At `sizeof(FreestandingDebugFrame) = 28` bytes (7 fields, `@repr(C)` padded), a 256-frame ring occupies 7 KB of BSS. For interrupt-dense kernels with short capture windows, 256–1024 frames is typically sufficient. For extended capture across a full boot sequence, 4096 frames (112 KB) or a ring-and-flush strategy via the trace channel is recommended.

**Interaction with `portal_ring_size`.** `portal_ring_size` (§3-3.21) is the static JTAG-readable fallback ring (readable without a live host). The `.debug_ttravel` time-travel ring is the dynamic ring retrieved via the control channel when `@debug_control_channel` is configured. Both may coexist: the `portal_ring_size` ring stores a JTAG-accessible snapshot; the `.debug_ttravel` ring is the deeper history retrievable via `READ_REPLAY_BUFFER`.

#### §3-3.25.10 Design Notes

*(This section is non-normative.)*

**Why two channels.** Control and trace have fundamentally different traffic profiles. Control is low-volume and requires ACKs; trace is potentially high-volume and unidirectional. Sharing a channel creates back-pressure coupling: a burst of trace events can starve an incoming `ACTIVATE` command. On ARM targets, the natural split is UART for control and ITM/SWO over CoreSight for trace — ITM is hardware-buffered and DMA-friendly.

**Why dynamic activation is preserved.** The principal value of the portal system is surgical, zero-overhead transient capture. Always-on instrumentation obliterates performance in hot paths — interrupt handlers, scheduler ticks, DMA completion routines. Dynamic activation via the control channel preserves the ability to leave all portals dark during normal operation and activate only the portals of interest for a bounded capture window.

**Zero-overhead guarantee.** The activation table check at each portal site is a single aligned atomic byte load. When the byte is zero the fast path falls through with no branch misprediction penalty on any architecture targeted by freestanding mode. This matches the "observationally inert" guarantee specified in §1-6.7.

**Time-travel vs. always-on trace.** Always-on trace via `@debug_trace_channel` streams events to the host in real time. The time-travel ring is a circular buffer on-target: it captures the most recent N events regardless of host connectivity. The two are complementary — use the trace channel for live monitoring during normal operation and the time-travel ring to diagnose what happened immediately before an unexpected halt or reset.

---

### §3-3.26 Channel Subsystem I/O — `native.css` (s390x)

*(This section is normative for `@mode(freestanding)` on `--arch s390x`.)*

*Specified pending implementation — `native.css` is specified in this revision and tracked under `specs/1-bootstrap-5-mainframe-s390x/` (R3). It is the s390x channel analog of `native.dma` (§3-3.20).*

z/Architecture does I/O through the **channel subsystem**, not MMIO + DMA. Software assembles a **CCW channel program** (a chain of channel command words, each pointing at a data area with command/data-chaining flags), arms a **subchannel**, issues **`SSCH`** (Start Subchannel), and the channel executes the program **asynchronously**, signalling completion via an **I/O interruption** whose **IRB/SCSW** (channel + device status, residual count) is retrieved with **`TSCH`** (Test Subchannel). Both the data buffers *and the CCW chain itself* are owned by the channel during execution. `native.css` models this with the existing ownership machinery — `takes`, `unique class`, and the in-flight-borrow check of §3-3.20 — reused wholesale rather than re-implemented.

**Type surface.**

```loup
namespace native.css;

# A CCW chain whose data areas are moved into it (the CPU relinquishes them).
unique class ChannelProgram[T] : Any {
  # Begin building a channel program.
  pub static func build(): ChannelProgramBuilder[T]
  # The builder appends CCWs that `takes` their backing buffers; the move makes
  # the CPU relinquish each buffer. A program submitted with no CCWs is E_CSS_PROGRAM_EMPTY.
}

unique class Subchannel : Any {
  # SSCH: consumes the program; the channel now owns the chain + all its buffers.
  # E_CSS_BUSY if a transfer is already in flight on this subchannel.
  pub func start(takes program: ChannelProgram[T]): PendingIo[T]
}

unique class PendingIo[T] : Any {
  # Called from an @interrupt(arch: "s390x", class: IO) ISR after TSCH.
  # Returns ownership of the chain + buffers ONLY on terminating SCSW status;
  # otherwise the transfer is still in flight and the buffers stay channel-owned.
  pub func complete(irb: borrow Irb): Result[ChannelProgram[T], IoError]
}
```

`Irb` and its embedded `Scsw` are `@interchange(endianness: Big)` views (Volume 4 §4-2; §3-3.9) over the low-core status — the channel/device status bytes and the residual count. `complete` inspects the SCSW status and returns ownership of the program (and therefore its buffers) only when the SCSW reports **terminating** status; otherwise it returns the in-flight `PendingIo`'s error variant and the buffers remain channel-owned.

```loup
enum IoError {
  DeferredStatus;        # status presented but not yet terminating
  UnitCheck;             # device-detected error (sense data available)
  ChannelControlCheck;   # channel-detected hardware error
  # ... further SCSW-derived conditions
}
```

**Invariant I7 (CPU and channel never touch a buffer simultaneously).** `start(takes program)` moves the entire CCW chain and its referenced buffers into the channel subsystem; while the resulting `PendingIo` is live the CPU has **no typed handle** to them — the move consumed `program` — and ownership returns only via `complete(irb)` on terminating status. This is the channel analog of `DmaBuffer`'s `edits` borrow (§3-3.20): "CPU-or-channel, never both," expressed in the channel idiom. Enforcement reuses the **same** in-flight-borrow rejection that `native.dma` uses (the §3-3.20 in-flight-borrow check) — there is no new enforcement code; an attempt to access an in-flight buffer from the CPU is rejected exactly as for `DmaBuffer`.

**Unsafe surface.** The privileged instructions `SSCH`, `TSCH`, `MSCH`, `STSCH`, `CSCH`, and `HSCH` are issued via inline `asm` and are `@unsafe`, **confined to the `native.css` implementation** and wrapped by the `Subchannel`/`ChannelProgram`/`PendingIo` API. Driver code that builds channel programs and completes transfers stays `@unsafe`-free — the same auditable-wrapper pattern as `outb`/`Volatile`/`native.dma`.

**Scope split.**

- **virtio-ccw minimal (KVM-guest path).** virtio-ccw uses a small, fixed set of control CCWs (`CCW_CMD_READ_VQ_CONF`, `CCW_CMD_SET_VQ`, `CCW_CMD_VDEV_RESET`, `CCW_CMD_READ/WRITE_CONF`, `CCW_CMD_SET_IND`, `CCW_CMD_READ/WRITE_FEAT`) to **enumerate and configure** a virtio-ccw device and its virtqueues. After configuration the **data path is ordinary in-memory virtqueues** — no per-packet channel I/O. The minimal `ChannelProgram` need only build these short, mostly-control chains; this is what the KVM-guest path requires.
- **General CCW framework (bare-metal-only).** Arbitrary CCW chains, command/data chaining, suspend/resume, format-0 vs. format-1 CCWs, dynamic redrive, and full IRB interpretation are a **bare-metal-only** superset built on the same primitive — not required for the KVM-guest path.

---

## §3-4 Hardware Backend Lifecycle

*(Non-normative. Full specification moved to the [Loup Packages Reference](loup-packages-reference-v1_12.md).)*

The hardware backend lifecycle (detection, compilation, registration, staleness
policy) is described in the Packages Reference §3-4.
