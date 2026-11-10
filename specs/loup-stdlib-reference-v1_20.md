# Loup Standard Library Reference v1.20

**Status:** Release — current normative reference
**Version:** 1.20.0
**Date:** 2026-05-07
**Supersedes:** 1.19.0
**Scope:** Standard-library modules that ship with the Loup runtime — no
  `loup install` required. Types, functions, and classes in this document
  are available in every execution mode except where a mode restriction is
  explicitly noted.

**Related documents:**
- [Loup Language Reference v1.20 — Volume 1: Core Language](loup-language-core-v1_20.md)
- [Loup Language Reference v1.20 — Volume 2: Runtime](loup-language-runtime-v1_20.md)
- [Loup Language Reference v1.20 — Volume 3: Compilation](loup-language-compilation-v1_20.md)
- [Loup Language Reference v1.20 — Volume 4: Data Formats](loup-language-data-v1_20.md)
- [Loup Packages Reference v1.12](loup-packages-reference-v1_12.md)
- [Loup Fortran HPC Packages v1.0](loup-fortran-hpc-packages-v1_0.md)

**Section numbering convention.** This document continues to use the
internal `§21.N` numbering scheme established in v1.18 — the §21 prefix
identifies stdlib content and is independent of the Language Reference's
volume-prefixed `§V-N` numbering scheme. Cross-references in this document
to Language Reference sections use the v1.20 `§V-N` form (see the
v1.19 → v1.20 change document for the complete translation table).

**Changes from v1.19:**

- **§21.8 `core.interchange` updates.** Three new variants added to the
  `Encoding` enum (Language Reference §4-2.4): `Complex32`, `Complex64`,
  and `Array`. New `Order` enum (`RowMajor`, `ColumnMajor`) added in
  §21.8.7 to parameterize `Encoding.Array` fields and `array[T, rank]`
  type declarations.
- **§21.9 `core.complex` added.** Companion to Language Reference §1-4.1.6.
  Specifies construction, projection, algebraic, and transcendental
  functions over the `complex32` and `complex64` primitive types,
  plus the `ComplexArithmeticError` exception class.
- **§21.10 `core.array` added.** Companion to Language Reference §1-4.10.
  Specifies the `Order` enum (also referenced from §21.8.7), array
  constructors (`zeros`, `ones`, `eye`, `arange`, `linspace`, `fromList`,
  `fromBytes`), reductions (`sum`, `mean`, `argmax`, `argmin`, axis
  reductions), shape manipulation (`reshape`, `transpose`, `permuteAxes`,
  `concat`, `stack`, `split`, `toOrder`), and the `ArrayShapeError`,
  `ArrayIndexError`, and `ArrayShapeErrorKind` types.
- **§21.11 `core.fpenv` added.** Companion to Language Reference §1-4.1.7.
  Specifies the binary IEEE 754 `RoundingMode` enum (distinct from the
  decimal `RoundingMode` of §21.7.1), `withRounding`/`withRoundingAsync`
  scoped rounding, exception flag operations (`exceptionFlags`,
  `clearExceptionFlags`, `saveExceptionFlags`, `restoreExceptionFlags`),
  signaling NaN construction, and additions to the `Float` trait surface
  (IEEE 754 metadata constants, `nextUp`/`nextDown`, `ulpDistance`).
- **§21.12 Freestanding-only namespaces added.** A discoverability summary of
  the `native.*` namespaces and the admissible hosted-module subset available
  under `@mode(freestanding)`, cross-referencing Language Reference §3-3.20 as
  the normative definition. No new API is introduced by this section.
- **§21.22–§21.27 added (stdlib port from the unwired draft tree).** `core.time`
  at nanosecond precision (§21.22), `core.waiting` (§21.23), the `net.http`
  protocol types and request parser (§21.24), `net.addressing` (§21.25),
  `data.query` (§21.26) and the `debug.profiler` span profiler (§21.27), each
  documenting the live module's API and status.
- **§21.28 added (v1.21, ruling MARK-1).** `core.sensitivity`: Helios's
  content-sensitivity marks (`Mark`, `Level`, `Retention`, `Reason`, `OPEN`) and
  `raise`, their join; a `@mode(portable)` module a freestanding unit imports too.

- **§21.14–§21.21 added (stdlib port from the unwired draft tree, 2026-09-30).** `debug.recording`,
  `structures.priority_queue`, `io.streams`, `core.math`'s `abs` / `min` /
  `max` family, `debug.assert`'s `expectSome` and value-naming messages,
  `core.datetime` nanosecond times, `testing.TestFailure` and timed results,
  and the §2-2.11 shared-memory exceptions as built-in classes.

**Note.** This document specifies the stdlib surface normatively introduced
by v1.18 (shared-memory concurrency primitives §2-2, serialization
foundation §4-1), the v1.19 additions to `core.numeric` and
`core.interchange`, and the v1.20 additions for complex numbers,
multi-dimensional arrays, and IEEE 754 environment access. Existing stdlib
modules (`core` primitives, `data.*`, `io.*`, `net.*`, `sync.*` thread
primitives, `web.*`, `ui.*`, `native.*`, `lang.*`, `debug.*`,
`structures.*`) are specified in the Language Reference and in
module-specific chapters; this document collects the recent additions in
one place for implementers.

**Const-callability (v1.21).** No function in this document is declared `const func`
(core §1-7.1), and none is therefore callable from a const context: a `const func` body
or an `if const` condition may call only functions that are themselves `const func`
(`E_CONST_CALLS_NON_CONST`), and const evaluation is interpretation of that closed set.
This is a statement of the shipped surface, not a design limit. The numeric and bit
helpers that shape arithmetic wants at compile time — the integer `min`/`max`/`abs`
family, the power-of-two and bit-width queries — are the natural first candidates, and
when one is promoted its signature here gains the `const` modifier and the promotion is
recorded in the change catalogue for that release. Until then the arithmetic operators,
comparisons, `size_of[T]()`/`align_of[T]()` and the `options.*`/`target.*`/
`freestanding.*` namespaces are the whole of what a const context can reach.

---

## Table of Contents

- [§21.1 `core` — Shared-Memory Types](#211-core--shared-memory-types)
  - [§21.1.1 `Shareable` Marker Trait](#2111-shareable-marker-trait)
  - [§21.1.2 `SharedBuffer[T]`](#2112-sharedbuffert)
  - [§21.1.3 `SharedArray[T]`](#2113-sharedarrayt)
  - [§21.1.4 `SharedArena`](#2114-sharedarena)
  - [§21.1.5 `SharedRef[T]`](#2115-sharedreft)
  - [§21.1.6 `WeakRef[T]` and `SharedWeakRef[T]`](#2116-weakreft-and-sharedweakreft)
- [§21.2 `core.atomic` — Atomic Operations](#212-coreatomic--atomic-operations)
  - [§21.2.1 `Ordering` Enum](#2121-ordering-enum)
  - [§21.2.2 Free Functions on `SharedArray[T]`](#2122-free-functions-on-sharedarrayt)
  - [§21.2.3 `Atomic[T]` Cell](#2123-atomict-cell)
  - [§21.2.4 `Integer`, `Float`, `Numeric` Traits](#2124-integer-float-numeric-traits)
- [§21.3 `sync.shared` — Shared Synchronization Primitives](#213-syncshared--shared-synchronization-primitives)
  - [§21.3.1 `SharedMutex[T]`](#2131-sharedmutext)
  - [§21.3.2 `SharedRwLock[T]`](#2132-sharedrwlockt)
  - [§21.3.3 `SharedCondVar`](#2133-sharedcondvar)
  - [§21.3.4 `SharedSemaphore`](#2134-sharedsemaphore)
  - [§21.3.5 `SharedBarrier`](#2135-sharedbarrier)
  - [§21.3.6 `SharedQueue[T]`](#2136-sharedqueuet)
  - [§21.3.7 `SharedStack[T]`](#2137-sharedstackt)
- [§21.4 `concurrent` — Worker Integration](#214-concurrent--worker-integration)
  - [§21.4.1 `ScriptWorker` Arena Extension](#2141-scriptworker-arena-extension)
  - [§21.4.2 `WorkerChannel` Arena Extension](#2142-workerchannel-arena-extension)
- [§21.5 `runtime` — Shared-Memory Configuration](#215-runtime--shared-memory-configuration)
- [§21.6 `core.serialization` — Serialization Foundation](#216-coreserialization--serialization-foundation)
  - [§21.6.1 `Value` Intermediate Representation](#2161-value-intermediate-representation)
  - [§21.6.2 `Serializable` and `Deserializable` Traits](#2162-serializable-and-deserializable-traits)
  - [§21.6.3 `SerializationAdapter[T]`](#2163-serializationadaptert)
  - [§21.6.4 `FormatDriver` Interface](#2164-formatdriver-interface)
  - [§21.6.5 Convenience Functions](#2165-convenience-functions)
  - [§21.6.6 Configuration Types](#2166-configuration-types)
  - [§21.6.7 Migration Helpers](#2167-migration-helpers)
  - [§21.6.8 `RemoteException` and `StackFrame`](#2168-remoteexception-and-stackframe)
- [§21.7 `core.numeric` — Numeric Error Model](#217-corenumeric--numeric-error-model)
  - [§21.7.1 `RoundingMode` Enum](#2171-roundingmode-enum)
  - [§21.7.2 `OverflowPolicy` Enum](#2172-overflowpolicy-enum)
  - [§21.7.3 `NumericOverflowError`](#2173-numericoverflowerror)
  - [§21.7.4 `NumericDivisionError`](#2174-numericdivisionerror)
- [§21.8 `core.interchange` — External Interchange Formats](#218-coreinterchange--external-interchange-formats)
  - [§21.8.1 `Encoding` Enum](#2181-encoding-enum)
  - [§21.8.2 `Charset` Enum](#2182-charset-enum)
  - [§21.8.3 `Endianness` Enum](#2183-endianness-enum)
  - [§21.8.4 `Sign`, `Padding`, and `Justify` Enums](#2184-sign-padding-and-justify-enums)
  - [§21.8.5 `Interchange` Interface](#2185-interchange-interface)
  - [§21.8.6 `InterchangeError` and `InterchangeErrorKind`](#2186-interchangeerror-and-interchangeerrorkind)
  - [§21.8.7 `Order` Enum](#2187-order-enum)
- [§21.9 `core.complex` — Complex Number Operations](#219-corecomplex--complex-number-operations)
  - [§21.9.1 Construction](#2191-construction)
  - [§21.9.2 Component Projections](#2192-component-projections)
  - [§21.9.3 Algebraic Functions](#2193-algebraic-functions)
  - [§21.9.4 Transcendental Functions](#2194-transcendental-functions)
  - [§21.9.5 Predicates](#2195-predicates)
  - [§21.9.6 `ComplexArithmeticError`](#2196-complexarithmeticerror)
  - [§21.9.7 Availability](#2197-availability)
- [§21.10 `core.array` — Multi-Dimensional Array Operations](#2110-corearray--multi-dimensional-array-operations)
  - [§21.10.1 `Order` Enum](#21101-order-enum)
  - [§21.10.2 Constructors](#21102-constructors)
  - [§21.10.3 Reductions](#21103-reductions)
  - [§21.10.4 Shape Manipulation](#21104-shape-manipulation)
  - [§21.10.5 Errors](#21105-errors)
  - [§21.10.6 Iteration](#21106-iteration)
  - [§21.10.7 Linear Algebra (basic)](#21107-linear-algebra-basic)
  - [§21.10.8 `Sendable`, `Shareable`, and `Numeric`](#21108-sendable-shareable-and-numeric)
- [§21.11 `core.fpenv` — Floating-Point Environment](#2111-corefpenv--floating-point-environment)
  - [§21.11.1 `RoundingMode` Enum](#21111-roundingmode-enum)
  - [§21.11.2 Scoped Rounding](#21112-scoped-rounding)
  - [§21.11.3 Exception Flags](#21113-exception-flags)
  - [§21.11.4 Signaling NaN](#21114-signaling-nan)
  - [§21.11.5 `Float` Trait Members](#21115-float-trait-members)
  - [§21.11.6 Availability](#21116-availability)
- [§21.12 Freestanding-Only Namespaces (`native.*`)](#2112-freestanding-only-namespaces-native)
  - [§21.12.1 Mode Restriction](#21121-mode-restriction)
  - [§21.12.2 Namespace Catalog](#21122-namespace-catalog)
  - [§21.12.3 Hosted Modules Admissible in Freestanding Mode](#21123-hosted-modules-admissible-in-freestanding-mode)
  - [§21.12.4 Where to Look](#21124-where-to-look)
- [§21.13 Entry-Script Prelude](#2113-entry-script-prelude)
- [§21.14 `debug.recording` — Nondeterminism Recording Ring](#2114-debugrecording--nondeterminism-recording-ring)
- [§21.15 `structures.priority_queue` — Binary-Heap Priority Queue](#2115-structurespriority_queue--binary-heap-priority-queue)
- [§21.16 `io.streams` — Byte Streams](#2116-iostreams--byte-streams)
- [§21.17 `core.math` — Magnitude and Extremes](#2117-coremath--magnitude-and-extremes)
- [§21.18 `debug.assert` — Assertion Helpers](#2118-debugassert--assertion-helpers)
- [§21.19 `core.datetime` — Nanosecond Times, Named Offsets](#2119-coredatetime--nanosecond-times-named-offsets)
- [§21.20 `testing` — Timed Results and `TestFailure`](#2120-testing--timed-results-and-testfailure)
- [§21.21 Shared-Memory Runtime Exceptions](#2121-shared-memory-runtime-exceptions)
- [§21.22 `core.time` — Instants and Durations](#2122-coretime--instants-and-durations)
- [§21.23 `core.waiting` — Polling-Based Condition Waiting](#2123-corewaiting--polling-based-condition-waiting)
- [§21.24 `net.http` — HTTP Protocol Types and the MVP Server](#2124-nethttp--http-protocol-types-and-the-mvp-server)
- [§21.25 `net.addressing` — URLs, Hosts and Socket Addresses](#2125-netaddressing--urls-hosts-and-socket-addresses)
- [§21.26 `data.query` — Query Strings and Percent-Encoding](#2126-dataquery--query-strings-and-percent-encoding)
- [§21.27 `debug.profiler` — Span Profiler](#2127-debugprofiler--span-profiler)
- [§21.28 `core.sensitivity` — Content-Sensitivity Marks](#2128-coresensitivity--content-sensitivity-marks)
- [Appendix A: Error and Exception Reference](#appendix-a-error-and-exception-reference)
- [Appendix B: Wasm Opcode Mapping](#appendix-b-wasm-opcode-mapping)
- [Appendix C: Native Atomic Mapping](#appendix-c-native-atomic-mapping)
- [Appendix D: ECS and Game Engine Patterns](#appendix-d-ecs-and-game-engine-patterns)
  - [D.1 Motivation](#d1-motivation)
  - [D.2 Component Storage](#d2-component-storage)
  - [D.3 Archetype Tables](#d3-archetype-tables)
  - [D.4 System Scheduling](#d4-system-scheduling)
  - [D.5 Entity Id Allocation](#d5-entity-id-allocation)
  - [D.6 Worked Example: Minimal ECS Core](#d6-worked-example-minimal-ecs-core)
  - [D.7 Worked Example: MVP Engine Main Loop](#d7-worked-example-mvp-engine-main-loop)
  - [D.8 Further Reading](#d8-further-reading)

---

## §21.1 `core` — Shared-Memory Types

*(This section is normative. Types in this section are part of the `core`
namespace and are available without explicit import in every module.)*

This section specifies the `core` types introduced by v1.18 for shared-memory
concurrency. The semantics defined here are canonical; the Language Reference
§2-2 provides the conceptual overview and cross-references, while this
document is the implementer-facing reference for the precise type signatures
and behaviors.

### §21.1.1 `Shareable` Marker Trait

```loup
namespace core;

pub interface Shareable : Sendable {}
```

See §2-2.2 for normative semantics. The set of implicitly-`Shareable` types
is determined by the compiler at type-analysis time and is not user-extensible
except through:

1. Declaring a `struct` with all-`Shareable` fields (automatic derivation).
2. Declaring an `enum` with all-`Shareable` variant payloads (automatic derivation).
3. Declaring a `shared class` whose fields are all `Shareable` (automatic derivation).

Attempting to write `implements Shareable` on a type that does not satisfy
the derivation rules is a compile-time error (`E_SHAREABLE_DERIVATION_FAILED`).

### §21.1.2 `SharedBuffer[T]`

```loup
namespace core;

pub shared class SharedBuffer[T: Shareable] {
  pub static func create(elementCount: int, arena: SharedRef[SharedArena]? = None): SharedRef[SharedBuffer[T]];
  pub static func fromBytes(bytes: borrow bytes, arena: SharedRef[SharedArena]? = None): SharedRef[SharedBuffer[T]];

  pub let length: int;
  pub let byteLength: int;
  pub let elementSize: int;      # sizeof(T) in bytes

  pub func get(index: int): T;
  pub func set(index: int, value: T): void;

  pub func slice(start: int, end: int): SharedArray[T];
  pub func asArray(): SharedArray[T];

  pub func copyTo(dst: borrow SharedBuffer[T],
                  srcStart: int, dstStart: int, count: int): void;
  pub func fill(value: T, start: int = 0, end: int? = None): void;

  # Return the raw bytes of the buffer. The returned `bytes` value is a copy
  # — mutations to the bytes do not affect the buffer. For in-place access,
  # use SharedArray[uint8] via asArray() or slice().
  pub func snapshot(): bytes;

  # Arena of this buffer (for cross-mode transfer decisions).
  pub func arena(): SharedRef[SharedArena];
}
```

**Element sizing.** `elementSize` is the in-memory size of `T` per the C-ABI
layout rules of §2-2.3. Implementations SHALL make this value available at
compile time when `T` is statically known.

**Bounds checking.** All indexed operations raise `IndexError` on
out-of-range access. The compiler MAY elide bounds checks when the index is
statically provable to be in range, subject to target-specific optimization
levels.

**Snapshot cost.** `snapshot()` performs a full copy of the buffer into a
fresh `bytes` value. For large buffers, prefer `asArray()` / `slice()` to
obtain a zero-copy view.

### §21.1.3 `SharedArray[T]`

```loup
namespace core;

pub shared class SharedArray[T: Shareable] {
  pub let length: int;
  pub let elementSize: int;

  pub func get(index: int): T;
  pub func set(index: int, value: T): void;

  pub func slice(start: int, end: int): SharedArray[T];
  pub func asBuffer(): SharedRef[SharedBuffer[T]];

  # Element-wise iteration. The body runs on the calling thread; it does not
  # parallelize on its own. To parallelize, pair with ScriptWorker or Thread.
  pub func forEach(body: fn(i: int, v: T): void): void;

  # Parallel partition helper — splits the range [0, length) into `n` chunks
  # suitable for distribution across `n` workers. Returns list of (start, end)
  # half-open intervals covering the whole range.
  pub static func partition(length: int, n: int): list[(int, int)];
}
```

**View semantics.** A `SharedArray[T]` is a **non-owning** typed view over a
`SharedBuffer[T]`. Multiple `SharedArray` views may exist over the same
`SharedBuffer`; they share the backing memory but carry independent bounds.
A `SharedArray` holds a strong reference to its underlying `SharedBuffer` —
the buffer is alive at least as long as any view into it.

**Conversion.** `asBuffer()` returns the underlying buffer. If the view
covers the entire buffer, this is a no-copy identity-returning operation.
If the view is a sub-slice, `asBuffer()` currently allocates a fresh buffer
and copies the sub-slice into it; a future revision may allow views to be
promoted to buffers with shared backing if implementation allows.

### §21.1.4 `SharedArena`

```loup
namespace core;

pub shared class SharedArena {
  pub static func create(capacityBytes: int, maxBytes: int? = None): SharedRef[SharedArena];

  pub let capacityBytes: int;
  pub let usedBytes: int;
  pub let maxBytes: int;

  pub func liveBytes(): int;
  pub func compact(): void;

  # Opaque arena identifier — stable for the arena's lifetime.
  # Used for equality comparison and diagnostic logging.
  pub func id(): string;

  # Number of execution contexts (workers, native threads) currently
  # attached to this arena.
  pub func attachmentCount(): int;

  # Best-effort allocation rate sampling — returns bytes allocated per
  # second over the last one-second window. Implementations MAY return 0
  # if not implemented.
  pub func allocationRate(): int;
}
```

See §2-2.5 for normative semantics. The `id()` method returns an
implementation-defined stable string (typically a hash of the arena's
creation-time metadata) usable for equality and logging. Programs must not
assume a specific format.

### §21.1.5 `SharedRef[T]`

`SharedRef[T]` is a **value type** (a struct-like handle), not itself a
`shared class`. It holds an arena-relative offset plus the arena handle and
implements retain/release via the ARC protocol specified in §2-2.7. Value
semantics mean `SharedRef[T]` is copied (with an atomic refcount increment)
when assigned, passed, or returned — matching Rust's `Arc<T>` and Swift's
managed reference semantics.

```loup
namespace core;

# T: shared class is a class-kind bound — see Language Reference §1-12.
pub struct SharedRef[T: shared class] implements Shareable, Sendable {
  # Clone — atomic increment of the target's refcount. O(1).
  pub func clone(): SharedRef[T];

  # Downgrade to a shared-arena weak reference (§21.1.6).
  pub func downgrade(): SharedWeakRef[T];

  # Observational counts (racy — use only for diagnostics).
  pub func strongCount(): int;
  pub func weakCount(): int;

  # Pointer equality — same underlying instance.
  pub func same(other: borrow SharedRef[T]): bool;

  # Arena of the referenced instance (returns a cloned SharedRef[SharedArena]).
  pub func arena(): SharedRef[SharedArena];
}
```

**Value semantics rationale.** `SharedRef[T]` is deliberately a value type
and not itself allocated in the shared arena. Making it a `shared class`
would create an infinite regress (`SharedRef[SharedRef[T]]`) and would also
place the handle itself under atomic refcount traffic, which is unnecessary
overhead since the handle's memory is trivially stack- or register-managed.
Conceptually: the `shared class` lives in the arena; the `SharedRef[T]`
handle lives wherever its holder lives (on the stack of a task, in a field
of another object, in a local variable).

See §2-2.6 for normative semantics.

**`arena()` note.** Returns a cloned `SharedRef[SharedArena]` — the caller
owns a new handle. This is useful when a function needs to allocate a
companion object in the same arena as an existing reference.

### §21.1.6 `WeakRef[T]` and `SharedWeakRef[T]`

Loup provides two weak reference value types, one per class memory
strategy. Both are **value types** — struct-like handles — and are
idiomatically declared via the `weak` field qualifier (§1-8) within class
bodies. The standalone types below are used for locals, parameters, and
generic containers.

```loup
namespace core;

# Weak reference to a local class instance.
# Sendable (by copy) but not Shareable — the referent is thread-local ARC.
pub struct WeakRef[T: local class] implements Sendable {
  # Attempt to promote to a strong reference.
  # Returns None if the referent has been destroyed.
  pub func upgrade(): Option[T];

  pub func strongCount(): int;
  pub func weakCount(): int;
}

# Weak reference to a shared class instance.
# Shareable — may cross thread boundaries freely since the referent is
# shared-arena-resident.
pub struct SharedWeakRef[T: shared class] implements Shareable, Sendable {
  # Attempt to promote to a SharedRef. Returns None if the referent has
  # been destroyed and its refcount side-table entry has been reclaimed.
  pub func upgrade(): Option[SharedRef[T]];

  pub func strongCount(): int;
  pub func weakCount(): int;
}
```

**Field qualifier interaction.** The `weak` field qualifier (§1-8) on a
`local class` field compiles to the local-thread weak-side-table entry,
structurally equivalent to `WeakRef[T]`. The `weak` qualifier on a
`shared class` field compiles to a `SharedWeakRef[T]`. Users rarely need
to declare either `WeakRef` or `SharedWeakRef` explicitly — the `weak`
field qualifier is the idiomatic form.

**Implementation.** `SharedWeakRef[T]` is an entry in the arena's
weak-reference side table (header offset 32; §2-2.5). Upgrade performs
the compare-exchange protocol specified in §2-2.7. `WeakRef[T]` is a
pointer plus generation counter in the local thread's weak-side table;
upgrade reads the counter, checks it against the referent's header, and
returns `Some` only if they match.

---

## §21.2 `core.atomic` — Atomic Operations

*(This section is normative. Imports from `core.atomic` are not required in
Loup scope — the functions are accessible as `core.atomic.atomicLoad`, etc.
Short aliases may be imported explicitly: `from core.atomic import (fetchAdd,
compareExchange);`.)*

### §21.2.1 `Ordering` Enum

```loup
namespace core.atomic;

pub enum Ordering {
  Relaxed;
  Acquire;
  Release;
  AcqRel;
  SeqCst;
}
```

Semantics match C11 / C++11 / Wasm memory model. See §2-2.4 for the mapping
to Wasm and native instructions.

**Ordering validity.** Not all orderings are valid for all operations:

| Operation | Valid orderings |
|---|---|
| `atomicLoad` | `Relaxed`, `Acquire`, `SeqCst` |
| `atomicStore` | `Relaxed`, `Release`, `SeqCst` |
| RMW (`fetchAdd`, etc.) | All five |
| `compareExchange` (success) | All five |
| `compareExchange` (failure) | `Relaxed`, `Acquire`, `SeqCst` |
| `fence` | `Acquire`, `Release`, `AcqRel`, `SeqCst` (not `Relaxed`) |

Passing an invalid ordering is a compile-time error
(`E_INVALID_ATOMIC_ORDERING`) when statically detectable, otherwise a runtime
`ArgumentError`.

### §21.2.2 Free Functions on `SharedArray[T]`

See §2-2.4 for the normative function signatures. This section enumerates
the valid `T` for each function family:

| Function family | Valid `T` |
|---|---|
| `atomicLoad`, `atomicStore`, `exchange`, `compareExchange` | `int8`, `int16`, `int32`, `int64`, `uint8`, `uint16`, `uint32`, `uint64`, `float32`, `float64`, `bool` |
| `fetchAdd`, `fetchSub` | `int8`, `int16`, `int32`, `int64`, `uint8`, `uint16`, `uint32`, `uint64` |
| `fetchAnd`, `fetchOr`, `fetchXor` | `int8`, `int16`, `int32`, `int64`, `uint8`, `uint16`, `uint32`, `uint64`, `bool` |
| `wait`, `notify` | `int32`, `int64`, `uint32`, `uint64` |

Float atomics (`float32`, `float64`) are implemented by bit-casting to the
integer of equivalent width before the atomic operation.

### §21.2.3 `Atomic[T]` Cell

```loup
namespace core.atomic;

# Inline value type — laid out inline when embedded as a field of a
# shared class. See Language Reference §2-2.4 for the rationale.
#
# T must satisfy Shareable AND have a width supported by single-instruction
# atomic operations on the target. The complex types (complex32, complex64)
# satisfy Shareable but exceed atomic-width capabilities on most ISAs;
# instantiating Atomic[complex32] or Atomic[complex64] is E_ATOMIC_COMPLEX
# at compile time. Use a Mutex around a complex-typed cell instead.
pub struct Atomic[T: Shareable] implements Shareable, Sendable {
  pub static func new(initial: T): Atomic[T];

  pub func load(ord: Ordering = SeqCst): T;
  pub func store(value: T, ord: Ordering = SeqCst): void;
  pub func exchange(newValue: T, ord: Ordering = SeqCst): T;
  pub func compareExchange(expected: T, desired: T,
                            successOrd: Ordering = SeqCst,
                            failureOrd: Ordering = Acquire): (bool, T);

  pub func fetchAdd(delta: T, ord: Ordering = SeqCst): T where T: Integer;
  pub func fetchSub(delta: T, ord: Ordering = SeqCst): T where T: Integer;
  pub func fetchAnd(mask: T, ord: Ordering = SeqCst): T where T: Integer;
  pub func fetchOr(mask: T, ord: Ordering = SeqCst): T where T: Integer;
  pub func fetchXor(mask: T, ord: Ordering = SeqCst): T where T: Integer;
}
```

`Atomic[T]` is the ergonomic single-cell form of atomic access. Internally
it is represented as a one-element `SharedArray[T]` plus helper methods.

**Use case.** `Atomic[T]` is idiomatic for fields of `shared class`:

```loup
shared class Counter {
  let value: Atomic[int64];

  new() { this.value = Atomic[int64].new(0); }

  func increment(): int64 { return this.value.fetchAdd(1); }
  func read(): int64 { return this.value.load(); }
}
```

### §21.2.4 `Integer`, `Float`, `Numeric` Traits

The marker trait interfaces `core.Integer`, `core.Float`, and `core.Numeric`
are declared normatively in Language Reference §1-4.0. They are included here
for cross-reference convenience since atomic RMW operations (§21.2.2,
§21.2.3) use `T: Integer` as a type bound.

| Trait | Implementers |
|---|---|
| `core.Integer` | `int8`, `int16`, `int32`, `int64`, `uint8`, `uint16`, `uint32`, `uint64` |
| `core.Float` | `float32`, `float64` |
| `core.Numeric` | union of `Integer` + `Float` + `decimal` fixed-precision variants + `complex32`, `complex64` |

`bigint` implements none of these — it is arbitrary-precision and cannot
participate in fixed-width atomic RMW.

`Float` was a pure marker trait through v1.18. In v1.20 it gains IEEE 754
metadata constants (`radix`, `digits`, `epsilon`, etc.), decomposition, and
ULP/successor methods; see §21.11.5 for the full member set. Existing
`T: Float`-bounded code remains source-compatible — the new members are
opt-in additions.

---

## §21.3 `sync.shared` — Shared Synchronization Primitives

*(This section is normative. All types in this section are `shared class`
allocated in a specific arena.)*

### §21.3.1 `SharedMutex[T]`

```loup
namespace sync.shared;

pub shared class SharedMutex[T: Shareable] {
  pub static func new(initial: T, arena: SharedRef[SharedArena]? = None): SharedRef[SharedMutex[T]];

  pub async func lock(): SharedMutexGuard[T];
  pub func tryLock(): Option[SharedMutexGuard[T]];

  # Combinator form — acquire, call body with a guard, release automatically
  # when body returns. Exceptions thrown in body propagate after release.
  pub async func withLock[R: Sendable](body: fn(guard: SharedMutexGuard[T]): R): R;

  # Acquire even if the lock was poisoned by a prior panic. The caller
  # takes responsibility for validating the protected state.
  pub async func lockRecover(): SharedMutexGuard[T];

  pub let isPoisoned: bool;
}

# Scope-bound guard. `SharedMutexGuard[T]` is a `unique class` — it cannot
# be cloned, aliased, or stored in shared-reachable fields (§3-2.4.7). The
# lock is held for exactly the guard's lifetime; dropping the guard (scope
# exit, explicit release, or being passed to a consuming function with
# `takes guard: SharedMutexGuard[T]`) releases the lock.
#
# Implements `WriteGuard[T]` (Language Reference §1-11.2), which extends
# `ReadGuard[T]` and `Releasable`. Because `Releasable : Scoped[Self]` with
# default `scope_enter`/`scope_exit`, the guard works with `with` blocks
# without further declarations: `with (g = mutex.lock()) { g.set(...) }`.
pub unique class SharedMutexGuard[T: Shareable] : Any implements WriteGuard[T] {
  pub func get(): T;
  pub func set(value: T): void;
  pub func update(fn: fn(T): T): void;

  # Explicit unlock. The guard becomes invalid; further use raises
  # E_GUARD_RELEASED at compile time (when statically detectable) or
  # ReleasedGuardError at runtime. Normally, guards release automatically
  # when the surrounding scope exits.
  pub func release(): void;
}
```

**Poison policy.** If the thread holding a `SharedMutex` panics, the lock
is marked poisoned. Subsequent `lock()` / `tryLock()` calls throw
`PoisonedLockError`. Callers aware of the possibility of inconsistent state
may use `lockRecover()` to acquire despite poisoning.

**Guard scope.** The `MutexGuard[T]` returned by `lock()` is intended to be
used within a narrow lexical scope:

```loup
let guard = await myMutex.lock();
guard.edits(func(edits state: State) {
  state.counter += 1;
  state.history.push(...);
});
# guard goes out of scope here; lock is released automatically
```

The `edits` / `reads` methods take closures rather than returning direct
references to the protected value. This prevents the escape of `edits T`
beyond the locked scope and preserves the borrow checker's exclusivity
invariant.

### §21.3.2 `SharedRwLock[T]`

```loup
namespace sync.shared;

pub shared class SharedRwLock[T: Shareable] {
  pub static func new(initial: T, arena: SharedRef[SharedArena]? = None): SharedRef[SharedRwLock[T]];

  pub async func readLock(): SharedRwReadGuard[T];
  pub async func writeLock(): SharedRwWriteGuard[T];
  pub func tryReadLock(): Option[SharedRwReadGuard[T]];
  pub func tryWriteLock(): Option[SharedRwWriteGuard[T]];

  pub async func withReadLock[R: Sendable](body: fn(guard: SharedRwReadGuard[T]): R): R;
  pub async func withWriteLock[R: Sendable](body: fn(guard: SharedRwWriteGuard[T]): R): R;

  pub let isPoisoned: bool;
}

# Scope-bound read guard — allows multiple concurrent holders.
# `unique class` semantics: no cloning, release-on-drop, move-only.
pub unique class SharedRwReadGuard[T: Shareable] : Any implements ReadGuard[T] {
  pub func get(): T;
  pub func release(): void;
}

# Scope-bound write guard — exclusive access.
# `unique class` semantics: no cloning, release-on-drop, move-only.
pub unique class SharedRwWriteGuard[T: Shareable] : Any implements WriteGuard[T] {
  pub func get(): T;
  pub func set(value: T): void;
  pub func update(fn: fn(T): T): void;
  pub func release(): void;
}
```

**Writer preference.** The default implementation uses writer-preference
scheduling: a pending writer blocks new readers, preventing writer
starvation. Readers already holding the lock complete before the writer
proceeds.

### §21.3.3 `SharedCondVar`

```loup
namespace sync.shared;

pub shared class SharedCondVar {
  pub static func new(arena: SharedRef[SharedArena]? = None): SharedRef[SharedCondVar];

  # `wait` consumes the guard, releases the mutex, blocks until notified,
  # then reacquires the mutex and returns a fresh guard. The `takes` verb
  # (§3-2.4.9) makes the consumption explicit at the call site.
  pub async func wait[T: Shareable](takes guard: SharedMutexGuard[T]): SharedMutexGuard[T];
  pub async func waitTimeout[T: Shareable](takes guard: SharedMutexGuard[T], ms: int): (SharedMutexGuard[T], bool);

  pub func notifyOne(): void;
  pub func notifyAll(): void;
}
```

**Lifecycle of `wait`.** `wait(guard)` releases the mutex associated with
the guard, blocks until a notification is received, then reacquires the
mutex and returns a new guard. The returned guard is the caller's new
binding — the original guard is consumed.

**Spurious wakeups.** As with standard CV semantics, `wait` may return
spuriously. Callers must re-check the predicate in a loop:

```loup
let guard = await myMutex.lock();
while (!conditionMet(guard)) {
  guard = await myCondVar.wait(guard);
}
guard.edits(func(edits state) { /* predicate holds, proceed */ });
```

### §21.3.4 `SharedSemaphore`

```loup
namespace sync.shared;

pub shared class SharedSemaphore {
  pub static func new(count: int, arena: SharedRef[SharedArena]? = None): SharedRef[SharedSemaphore];

  pub async func acquire(): void;
  pub async func acquireN(count: int): void;
  pub func tryAcquire(): bool;
  pub func release(count: int = 1): void;

  pub let availableCount: int;   # observational
}
```

### §21.3.5 `SharedBarrier`

```loup
namespace sync.shared;

pub shared class SharedBarrier {
  pub static func new(parties: int, arena: SharedRef[SharedArena]? = None): SharedRef[SharedBarrier];

  pub async func wait(): BarrierResult;

  # Reset the barrier for a new generation. All currently-waiting threads
  # see BarrierResult.Broken. Useful for cancellation scenarios.
  pub func reset(): void;

  pub let parties: int;
}

pub enum BarrierResult {
  Continue;    # normal return — the barrier released with `parties` arrivals
  Leader;      # as Continue, but this thread is designated the "leader" —
               # exactly one arrival receives Leader per barrier cycle
  Broken;      # the barrier was reset while this thread was waiting
}
```

### §21.3.6 `SharedQueue[T]`

```loup
namespace sync.shared;

pub shared class SharedQueue[T: Shareable] {
  pub static func new(capacity: int, arena: SharedRef[SharedArena]? = None): SharedRef[SharedQueue[T]];

  pub async func send(value: T): void;
  pub async func receive(): T;
  pub func trySend(value: T): bool;
  pub func tryReceive(): Option[T];
  pub func close(): void;

  pub let length: int;
  pub let capacity: int;
  pub let isClosed: bool;
}

pub class QueueClosedError : Exception {}
```

**Semantics.** Bounded MPMC (multi-producer, multi-consumer) channel.
`send` blocks when the queue is full; `receive` blocks when the queue is
empty. `close()` wakes all blocked senders and receivers:

- Blocked `send()` calls throw `QueueClosedError`.
- Blocked `receive()` calls return remaining queued values until drained, then throw `QueueClosedError`.

**Implementation.** A lock-free bounded ring buffer using
compare-exchange on head/tail indices. Contention falls back to
`memory.atomic.wait` / futex-style waiting after an implementation-defined
spin budget.

### §21.3.7 `SharedStack[T]`

```loup
namespace sync.shared;

pub shared class SharedStack[T: Shareable] {
  pub static func new(arena: SharedRef[SharedArena]? = None): SharedRef[SharedStack[T]];

  pub func push(value: T): void;
  pub func pop(): Option[T];

  pub let length: int;   # observational; may be stale under contention
}
```

**Semantics.** Lock-free unbounded stack (Treiber stack). `push` and `pop`
never block — contention is handled via compare-exchange retry loops.

---

## §21.4 `concurrent` — Worker Integration

*(This section is normative. Extensions to the `ScriptWorker` and
`WorkerChannel` types specified in Language Reference §2-1.10.2–§2-1.10.3.)*

### §21.4.1 `ScriptWorker` Arena Extension

```loup
namespace concurrent;

pub class ScriptWorker[M: Sendable] {
  # ... (§2-1.10.2 methods unchanged)

  # Share an arena with this worker. The worker may now allocate in and
  # reference existing objects within this arena. Idempotent — sharing an
  # already-attached arena is a no-op.
  pub func share(arena: SharedRef[SharedArena]): void;

  # Detach an arena from this worker. If the worker has outstanding
  # SharedRef instances into the arena, the arena remains live until those
  # refs are released. Calling detach on an arena not currently shared is
  # an error (E_ARENA_NOT_SHARED).
  pub func detach(arena: SharedRef[SharedArena]): void;

  # Send a SharedRef to the worker without serialization. The worker MUST
  # have the referenced arena attached (via share() or by having created it
  # from within workerMain). Returns before the worker observes the message.
  pub func sendRef[T: shared class](ref: SharedRef[T]): void;

  # Receive a SharedRef sent by the worker via channel.replyRef().
  # Returns None if the worker has terminated and all queued refs are drained.
  pub async func receiveRef[T: shared class](): Option[SharedRef[T]];

  # List arenas currently shared with this worker.
  pub func sharedArenas(): list[SharedRef[SharedArena]];
}
```

### §21.4.2 `WorkerChannel` Arena Extension

```loup
namespace concurrent;

pub class WorkerChannel[T: Sendable] {
  # ... (§2-1.10.3 methods unchanged)

  # Worker-side counterpart to host's receiveRef. Returns None when the
  # host has terminated and all queued refs are drained.
  pub async func receiveRef[S: shared class](): Option[SharedRef[S]];

  # Worker-side counterpart to host's sendRef. The ref's arena must be
  # attached to the host (automatically true for any arena the worker
  # received via receiveRef).
  pub func replyRef[S: shared class](ref: SharedRef[S]): void;
}
```

**Type parameter note.** `sendRef` and `receiveRef` are method-level
generics in `T`/`S`, orthogonal to the channel's `M` parameter. A worker
channel carrying `Sendable` messages may additionally transfer any
`shared class` via these methods, regardless of the channel's primary
message type.

---

## §21.5 `runtime` — Shared-Memory Configuration

*(This section is normative. The `runtime` global is specified in Language
Reference §2-5.1; this section adds the v1.18 shared-memory configuration
methods.)*

```loup
namespace runtime;

# Set the default shared arena for the current execution context. Future
# `shared T()` allocations without an explicit arena argument use this arena.
# Returns the previous default arena.
pub func setDefaultSharedArena(arena: SharedRef[SharedArena]): SharedRef[SharedArena];

# Get the current default shared arena for this context. Lazily creates
# one on first access with implementation-defined default capacity.
pub func defaultSharedArena(): SharedRef[SharedArena];

# Configure default-arena growth parameters used when the runtime
# implicitly creates the default arena. MUST be called before any shared
# allocation in the current context; otherwise throws
# DefaultArenaAlreadyInitializedError.
pub func configureDefaultSharedArena(config: DefaultArenaConfig): void;

pub struct DefaultArenaConfig {
  initialCapacityBytes: int = 16.MiB;
  maxBytes: int? = None;            # None means non-growable at initial capacity
}
```

**Per-context default arena.** Each execution context (main thread,
`ScriptWorker` instance, native thread) has its own default arena pointer.
The pointer is inherited from the spawning context at spawn time. Changing
the default arena in one context does not affect other contexts.

---

## §21.6 `core.serialization` — Serialization Foundation

*(This section is normative. The full serialization foundation is
specified in Language Reference §4-1; this section lists the concrete
stdlib types and functions users import. Types live in the
`core.serialization` namespace. The foundation does not ship any specific
wire format — JSON, MessagePack, CBOR, and similar are separate packages
that implement `FormatDriver`.)*

### §21.6.1 `Value` Intermediate Representation

```loup
namespace core.serialization;

pub enum TemporalKind {
  Instant;
  DateTime;
  Date;
  Time;
  Duration;
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
  Map(list[(Value, Value)]);
  Variant { tag: string; fields: Value };
  Tagged { typeUri: string?; value: Value };
  Temporal { kind: TemporalKind; repr: Value };
}

pub enum ValueKind {
  Null; Bool; Int; UInt; BigInt; Float32; Float64; Decimal;
  String; Bytes; List; Map; Variant; Tagged; Temporal;
}

# Note: Value is Sendable (its variants wrap only Sendable payloads) but
# not Shareable — the List and Map variants carry growable collections that
# cannot be concurrently accessed. Sendable status follows the implicit
# Sendable-for-enums rule in Language Reference §2-1.8.1.

# Value helper methods (all non-throwing; return Option where a type
# assumption could fail).
pub class Value {
  pub func isNull(): bool;
  pub func isScalar(): bool;
  pub func isCollection(): bool;
  pub func kind(): ValueKind;

  pub func asBool(): Option[bool];
  pub func asInt64(): Option[int64];
  pub func asUInt64(): Option[uint64];
  pub func asBigInt(): Option[bigint];
  pub func asFloat32(): Option[float32];
  pub func asFloat64(): Option[float64];
  pub func asDecimal(): Option[decimal];
  pub func asString(): Option[string];
  pub func asBytes(): Option[bytes];
  pub func asList(): Option[list[Value]];
  pub func asMap(): Option[list[(Value, Value)]];
  pub func asVariant(): Option[(string, Value)];  # (tag, fields)
  pub func asTagged(): Option[(string?, Value)];  # (uri, value)

  # Ergonomic accessors for hand-written parsers
  pub func get(key: string): Option[Value];   # Map lookup by string key
  pub func at(index: int): Option[Value];     # List lookup
  pub func path(p: string): Option[Value];    # "a.b.c" dotted path

  # Type predicates returning specific-variant booleans
  pub func isString(): bool;
  pub func isList(): bool;
  pub func isMap(): bool;
}
```

### §21.6.2 `Serializable` and `Deserializable` Traits

```loup
namespace core.serialization;

pub interface Serializable {
  func toValue(): Value;
  func serializationId(): Option[string];
}

pub interface Deserializable {
  static func fromValue(v: Value): Self;
  static func serializationId(): string;
}
```

See Language Reference §4-1.3 for the normative contract. The compiler
auto-derives implementations for classes, structs, and enums whose fields
are all `Serializable` / `Deserializable` (per §4-1.4); the `@manual`
class-level annotation opts out of auto-derivation.

**Primitive implementations.** The stdlib provides `Serializable` and
`Deserializable` implementations for every built-in type:

| Type | `toValue` produces | `fromValue` accepts |
|---|---|---|
| `int8`/`int16`/`int32` | `Value.Int` | `Value.Int` (range-checked) |
| `int64` | `Value.Int` | `Value.Int` |
| `uint8`/`uint16`/`uint32` | `Value.UInt` | `Value.UInt` or `Value.Int` (range-checked) |
| `uint64` | `Value.UInt` | `Value.UInt` or `Value.Int` |
| `bigint` | `Value.BigInt` | `Value.BigInt`, `Value.Int`, or `Value.UInt` |
| `float32` | `Value.Float32` | `Value.Float32` or `Value.Float64` (narrowing checked) |
| `float64` | `Value.Float64` | `Value.Float64` or `Value.Float32` |
| `decimal` | `Value.Decimal` | `Value.Decimal` or `Value.String` (parsed) |
| `bool` | `Value.Bool` | `Value.Bool` |
| `char` | `Value.String` (1-char) | `Value.String` (length-checked) |
| `string` | `Value.String` | `Value.String` |
| `bytes` | `Value.Bytes` | `Value.Bytes` |
| `complex32`/`complex64`/`complex` | `Value.Variant { tag: "complex", fields: Value.Map([("re", ...), ("im", ...)]) }` (real and imaginary parts as `Value.Float32` for `complex32`, `Value.Float64` for `complex64`) | Same shape — `Value.Variant` with tag `"complex"` |
| `array[T, rank]` (where `T: Serializable`) | `Value.Map([("shape", Value.List(...)), ("order", Value.String("RowMajor"\|"ColumnMajor")), ("base", Value.Int), ("data", Value.List(...))])` with `data` flattened in storage order | Same shape — reconstructs the array using indicated `shape`, `order`, and `base` |
| `list[T]` | `Value.List` | `Value.List` |
| `dict[K, V]` | `Value.Map` | `Value.Map` |
| `set[T]` | `Value.List` (deduplicated) | `Value.List` |
| `Option[T]` | `Value.Null` or `T.toValue()` | `Value.Null` → `None`, else `T.fromValue(v)` → `Some(...)` |
| `Result[T, E]` | `Value.Variant` ("Ok" or "Err") | `Value.Variant` |
| `Instant`, `DateTime`, etc. | `Value.Temporal` | `Value.Temporal` |
| Tuples `(A, B, ...)` | `Value.List` (positional) | `Value.List` (length-checked) |

All primitive `fromValue` implementations throw `DeserializationError` on
type-mismatch or range violation; no silent coercion occurs.

### §21.6.3 `SerializationAdapter[T]`

```loup
namespace core.serialization;

pub interface SerializationAdapter[T] {
  static func toValue(value: T): Value;
  static func fromValue(v: Value): T;
}
```

Used with `@serialVia[Adapter]` on fields whose types are not directly
`Serializable` / `Deserializable`. See Language Reference §4-1.3.

### §21.6.4 `FormatDriver` Interface

```loup
namespace core.serialization;

pub interface FormatDriver {
  static func name(): string;
  static func contentType(): string;

  static func encode(value: Value, config: EncodeConfig = EncodeConfig.default()): bytes;
  static func decode(bytes: borrow bytes, config: DecodeConfig = DecodeConfig.default()): Value;
}

# Optional — drivers that support streaming declare this sub-interface.
pub interface StreamingFormat : FormatDriver {
  static func encodeStream(value: Value, writer: io.Writer, config: EncodeConfig): void;
  static func decodeStream(reader: io.Reader, config: DecodeConfig): Value;
}
```

See Language Reference §4-1.10 for driver compliance requirements.

### §21.6.5 Convenience Functions

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

# Diagnostic helper — serialize through a format, immediately deserialize,
# and assert equality. Returns the round-tripped value. Useful in tests.
# For types where equality is not meaningful (e.g. types holding closures),
# callers must use format-specific equality checks.
pub func roundtrip[T: Serializable + Deserializable, D: FormatDriver](
  value: T,
): T;

# Convert to Value without serializing to bytes. Useful for inspecting
# or transforming a value before handing it to a format driver.
pub func toValue[T: Serializable](value: T): Value;

# Convert a Value to a typed value without going through bytes.
pub func fromValue[T: Deserializable](v: Value): T;
```

### §21.6.6 Configuration Types

```loup
namespace core.serialization;

pub struct EncodeConfig {
  pub maxDepth: int = 64;
  pub maxSizeBytes: int = 16.MiB;
  pub pretty: bool = false;
  pub sensitiveMode: SensitiveMode = SensitiveMode.Include;
  pub deterministic: bool = true;

  pub static func default(): EncodeConfig;

  # Common presets
  pub static func forUntrustedOutput(): EncodeConfig;  # Redact sensitive, deterministic
  pub static func forDebugLogging(): EncodeConfig;     # Omit sensitive, pretty, small limits
  pub static func forRpcBody(): EncodeConfig;          # Include sensitive, deterministic
  pub static func forContentAddressed(): EncodeConfig; # Deterministic, compact
}

pub struct DecodeConfig {
  pub maxDepth: int = 64;
  pub maxSizeBytes: int = 16.MiB;
  pub strictSchema: bool = false;
  pub unknownTypeBehavior: UnknownTypeBehavior = UnknownTypeBehavior.RemoteException;

  pub static func default(): DecodeConfig;

  pub static func forUntrustedInput(): DecodeConfig;   # Smaller limits, strict schema
  pub static func forTrustedInternal(): DecodeConfig;  # Larger limits, permissive
}

pub enum SensitiveMode {
  Include;       # serialize normally (flag out-of-band)
  Redact;        # replace with redaction marker
  Omit;          # drop the field entirely
}

pub enum UnknownTypeBehavior {
  RemoteException;       # for BaseException subclasses — default
  Error;                 # throw DeserializationError
  Skip;                  # drop the value (lossy imports)
}
```

### §21.6.7 Migration Helpers

```loup
namespace core.serialization;

# Invoked by the runtime when a type has rolled over its major version.
# User code typically does not call this directly — it is invoked via the
# @migrateFrom annotation's registered function at deserialization time.
pub func migrate[T: Deserializable](
  oldValue: Value,
  oldTypeUri: string,
  fromOld: fn(Value): T,
): T;

# Register a migration function for a type at runtime. Rarely needed — the
# @migrateFrom annotation is the idiomatic form, auto-registering at
# module-init time.
pub func registerMigration(
  newTypeUri: string,
  oldTypeUri: string,
  fromOld: fn(Value): Any,
): void;
```

### §21.6.8 `RemoteException` and `StackFrame`

```loup
namespace core;

pub struct StackFrame implements Serializable, Deserializable {
  pub let module: string;
  pub let function: string;
  pub let file: Option[string];
  pub let line: Option[int];
  pub let column: Option[int];
  pub let functionUri: Option[string];
}

pub class RemoteException : Exception {
  pub let originalTypeUri: string;
  pub let originalFields: dict[string, Any];
  # Inherits: message, cause, stackTrace from BaseException
}
```

See Language Reference §1-18.1 and §4-1.9 for normative semantics.

---

## §21.7 `core.numeric` — Numeric Error Model

*(This section is normative. Full semantics are specified in Language
Reference §1-4.1.4.2; this section lists the concrete stdlib types users
import. Types live in the `core.numeric` namespace.)*

### §21.7.1 `RoundingMode` Enum

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
```

`RoundingMode` parameterizes `decimal(p, s)` arithmetic when scale must
be reduced (Language Reference §1-4.1.4.2). It also appears as a parameter
to per-operation override methods on `decimal(p, s)` (`addRounded`,
`divRounded`, etc.). The enum is `Sendable` (no payloads) and
`Serializable` (auto-derived per §4-1).

### §21.7.2 `OverflowPolicy` Enum

```loup
namespace core.numeric;

pub enum OverflowPolicy {
    Trap;            # raise NumericOverflowError (default)
    Saturate;        # clamp to the type's representable extreme
    Wrap;            # modular wrap at the precision boundary
    TruncateHigh;    # discard high-order digits silently — matches COBOL TRUNCATED
}
```

`OverflowPolicy` parameterizes `decimal(p, s)` when a value will not
fit the declared envelope. It is distinct from `RoundingMode`:
`RoundingMode.Truncate` discards low-order fractional digits, while
`OverflowPolicy.TruncateHigh` discards high-order integer digits. The
language reference's naming-note (§1-4.1.4.2) explains why the names are
deliberately not symmetric.

`OverflowPolicy` is `Sendable` and `Serializable`.

### §21.7.3 `NumericOverflowError`

```loup
namespace core.numeric;

pub class NumericOverflowError : Exception {
    pub let sourceType: string;     # e.g. "decimal(22, 4)" — the wider type
    pub let targetType: string;     # e.g. "decimal(11, 2)" — the narrower binding
    pub let value:      string;     # canonical decimal repr of the offending value
    pub let location:   string;     # diagnostic location: source file, line, expression
}
```

Raised when `OverflowPolicy.Trap` is in effect and a value will not fit
the destination's envelope. Catchable via standard `try/catch`. The
exception is also raised by explicit `into(decimal(p, s))` conversion
when the value will not fit, regardless of any per-binding policy.

`NumericOverflowError` extends `Exception` (Language Reference §1-18.1)
and is implicitly `@polymorphic` (every `BaseException` subclass is —
§4-1.9). It serializes via §4-1 with the four fields above.

### §21.7.4 `NumericDivisionError`

```loup
namespace core.numeric;

pub class NumericDivisionError : Exception {
    pub let dividendType: string;     # e.g. "decimal(11, 2)" — the dividend's type
    pub let dividend:     string;     # canonical decimal repr of the dividend
    pub let location:     string;     # diagnostic location
}
```

Raised by division by zero on `decimal` and `decimal(p, s)` regardless
of `OverflowPolicy` (saturation is not a meaningful response to
division by zero — Language Reference §1-4.1.4.1). Catchable via
standard `try/catch`.

Integer division-by-zero raises a separate `IntegerDivisionError`
(specified in Language Reference §1-4.1) under unchecked arithmetic, or
returns `Option.None` from the `checkedDiv` family.

---

## §21.8 `core.interchange` — External Interchange Formats

*(This section is normative. Full semantics are specified in Language
Reference §4-2; this section lists the concrete stdlib types users
import. Types live in the `core.interchange` namespace.)*

The types in this section parameterize the `@interchange` and `@field`
annotations and form the runtime surface of the auto-derived pack/unpack
methods. They are referenced at compile time (in `@field(encoding: ...,
charset: ...)` declarations) and at runtime (for diagnostic logging and
for code that handles interchange formats generically).

### §21.8.1 `Encoding` Enum

```loup
namespace core.interchange;

pub enum Encoding {
    Text;
    Binary;
    Zoned;
    Comp3;
    Decimal128;
    Float32;
    Float64;
    IbmHexFloat32;
    IbmHexFloat64;
    BoolByte;
    Bytes;
    Nested;
    Complex32;
    Complex64;
    Array;
}
```

Each variant identifies a byte-level encoding scheme. Type-encoding
compatibility, per-encoding `len:` rules, and pack/unpack semantics are
specified in Language Reference §4-2.4.

**Mode availability.** All variants are valid as enum values in any mode.
However, encodings that depend on the decimal runtime — `Zoned`, `Comp3`,
`Decimal128` — cannot be used in `@mode(freestanding)` because `decimal`
and `decimal(p, s)` are themselves unavailable there. The encodings
usable in freestanding are `Binary`, `Float32`, `Float64`,
`IbmHexFloat32`, `IbmHexFloat64`, `BoolByte`, `Bytes`, `Nested`,
`Text` (with non-DBCS charsets only), and `Array` (when the element
encoding is itself usable in freestanding). `Complex32` and `Complex64`
are also usable for basic pack/unpack, but operations consuming the
resulting `complex32`/`complex64` values may require a math runtime
(see §21.9.7). See Language Reference §4-2.1 for
the authoritative subset.

`Encoding` is `Sendable` and `Serializable`.

### §21.8.2 `Charset` Enum

```loup
namespace core.interchange;

pub enum Charset {
    # Single-byte modern
    Ascii;
    Utf8;
    Latin1;             # ISO-8859-1

    # Single-byte EBCDIC — Western Europe / Americas
    Ebcdic037;          # US/Canada (CCSID 37)
    Ebcdic273;          # Germany/Austria (CCSID 273)
    Ebcdic277;          # Denmark/Norway (CCSID 277)
    Ebcdic278;          # Finland/Sweden (CCSID 278)
    Ebcdic280;          # Italy (CCSID 280)
    Ebcdic284;          # Spain/Latin America (CCSID 284)
    Ebcdic285;          # United Kingdom (CCSID 285)
    Ebcdic297;          # France (CCSID 297)
    Ebcdic500;          # International Latin-1 (CCSID 500)
    Ebcdic1047;         # Open Systems Latin-1 (CCSID 1047)

    # Single-byte EBCDIC — with Euro symbol
    Ebcdic1140;         # US/Canada with Euro (CCSID 1140)
    Ebcdic1141;         # Germany/Austria with Euro (CCSID 1141)
    Ebcdic1147;         # France with Euro (CCSID 1147)
    Ebcdic1148;         # International with Euro (CCSID 1148)

    # Single-byte EBCDIC — other
    Ebcdic875;          # Greek (CCSID 875)
    Ebcdic1026;         # Turkish (CCSID 1026)

    # Double-byte EBCDIC (DBCS)
    Ebcdic930;          # Japanese Katakana-Kanji mixed (CCSID 930)
    Ebcdic939;          # Japanese Latin-Kanji mixed (CCSID 939)
    Ebcdic935;          # Simplified Chinese (CCSID 935)
    Ebcdic937;          # Traditional Chinese (CCSID 937)
    Ebcdic933;          # Korean (CCSID 933)
}
```

Conversion tables for each charset live in the runtime; the
`core.interchange.dbcs` sub-namespace exposes the DBCS shift-out / shift-in
machinery and per-CCSID Unicode PUA assignments for vendor-specific UDC
characters (Language Reference §4-2.11).

**Mode availability.** Only `Ascii`, `Utf8`, and `Latin1` are usable in
`@mode(freestanding)` — EBCDIC SBCS and DBCS conversion tables are
not linked in freestanding builds (`E_INTERCHANGE_CHARSET_NOT_AVAILABLE`).

`Charset` is `Sendable` and `Serializable`.

### §21.8.3 `Endianness` Enum

```loup
namespace core.interchange;

pub enum Endianness {
    Big;        # most significant byte first — mainframe and network default
    Little;     # least significant byte first — typical of x86 / ARM
    Native;     # resolves at compile time to the target platform's native order
}
```

Used by `@interchange(endianness:)` and applies to multi-byte primitive
encodings (`Binary`, `Float32`, `Float64`, `IbmHexFloat32`,
`IbmHexFloat64`, `Decimal128`). `Endianness.Native` is rare in
interchange contexts and triggers the `interchange-native-endianness`
lint advisory at the declaration site (Language Reference §4-2.14).

`Endianness` is `Sendable` and `Serializable`.

### §21.8.4 `Sign`, `Padding`, and `Justify` Enums

```loup
namespace core.interchange;

pub enum Sign {
    Unsigned;
    Signed;                # two's complement (Binary), nibble sign (Comp3),
                           # sign-bit (floats and Decimal128)
    LeadingSeparate;       # "+12345" / "-12345" — sign occupies first byte
    TrailingSeparate;      # "12345+" / "12345-" — sign occupies last byte
    LeadingOverpunch;      # sign embedded in the zone half of the first digit byte
    TrailingOverpunch;     # sign embedded in the zone half of the last digit byte
                           # (COBOL default for SIGN clause)
    CrTrailing;            # negatives written as "...CR", positives as "...  "
                           # (financial report convention; both CR and DB indicate negative)
    DbTrailing;            # negatives written as "...DB", positives as "...  "
                           # (alternate financial report convention)
}

pub enum Padding {
    Default;       # Space for Text, Zero for numeric, Null for Bytes — encoding-specific
    Space;         # 0x40 in EBCDIC, 0x20 in ASCII/UTF-8
    Zero;          # 0x30 in both EBCDIC and ASCII
    Null;          # 0x00
    Custom(byte: uint8);
}

pub enum Justify {
    Default;       # Left for Text and Bytes, Right for numeric
    Left;
    Right;
}
```

Sign-encoding compatibility, padding/justify directionality, and the
overpunch byte conventions are specified in Language Reference §4-2.6.

`Sign`, `Padding`, and `Justify` are all `Sendable` and `Serializable`.

### §21.8.5 `Interchange` Interface

```loup
namespace core.interchange;

pub interface Interchange {
    func byteLength(): int;
    static func minByteLength(): int;
    static func unpack(reads input: bytes): Self;
    static func tryUnpack(reads input: bytes): Result[Self, InterchangeError];
    func pack(): bytes;
    func packInto(edits buf: bytes, offset: int = 0): int;
}
```

A struct or class annotated `@interchange` automatically implements this
interface. The implementation is generated by the compiler; user code
cannot implement `Interchange` manually (`E_INTERCHANGE_INTERFACE_MANUAL_IMPL`).
The interface exists to let generic code constrain on it — for example,
`func writeRecord[T: Interchange](r: T): bytes => r.pack()` accepts any
interchange type uniformly.

Full method semantics are specified in Language Reference §4-2.10.

### §21.8.6 `InterchangeError` and `InterchangeErrorKind`

```loup
namespace core.interchange;

pub class InterchangeError : Exception {
    pub let recordType: string;          # type name of the @interchange type (struct or class)
    pub let fieldName:  string?;         # None for whole-record errors
    pub let offset:     int;             # byte offset where the failure occurred
    pub let kind:       InterchangeErrorKind;
}

pub enum InterchangeErrorKind {
    InsufficientBytes;                   # input shorter than expected
    InsufficientCapacity;                # output buffer too small
    InvalidDigit;                        # non-digit byte in zoned/comp3 field
    InvalidSign;                         # sign nibble or overpunch malformed
    DecimalOverflow;                     # value will not fit declared scale
    InvalidEncoding;                     # bytes do not decode in declared charset
    UnexpectedTrailing;                  # strict mode and unmapped trailing bytes
    NestedFailure(cause: InterchangeError);
}
```

Raised by `unpack`, `pack`, and `packInto` on any pack/unpack failure.
`tryUnpack` returns `Result[Self, InterchangeError]` instead of
throwing. `NestedFailure` wraps an inner error from a nested
`Encoding.Nested` field; nested-failure semantics (how outer-frame
fields are populated) are specified in Language Reference §4-2.13.

`InterchangeError` extends `Exception` and is implicitly `@polymorphic`.
`InterchangeErrorKind` is `Sendable` and `Serializable`. `InterchangeError`
serializes via §4-1 with all five fields preserved (the recursive `cause`
in `NestedFailure` serializes by depth-first traversal).

---

### §21.8.7 `Order` Enum

The storage-order enum used by `Encoding.Array` interchange fields is the
same `Order` enum defined in §21.10.1 (`core.array.Order`). It is **not**
redeclared in the `core.interchange` namespace; the same type identity is
shared so that an `Order` value passed to an `@interchange`-annotated
struct's `order:` parameter has the same type as the `order:` parameter
of an `array[T, rank]` type expression. For convenience, `core.interchange`
re-exports the `core.array.Order` enum:

```loup
namespace core.interchange;

pub use core.array.Order;
```

`Order.RowMajor` indicates that the rightmost (last) axis is the fastest-
iterating axis in storage order; `Order.ColumnMajor` indicates that the
leftmost (first) axis is fastest. The choice has no observable effect on
indexed access (`a[i, j]` produces the same value regardless of `order`)
but affects iteration order, byte layout, and FFI compatibility.

`Order` is `Sendable` and `Serializable`.

---

## §21.9 `core.complex` — Complex Number Operations

*(This section is normative. Companion to Language Reference §1-4.1.6. Available
in all modes for basic operations; transcendental functions require a math
runtime that is not linked in `@mode(freestanding)` by default.)*

The `core.complex` namespace provides construction, projection, and
transcendental functions over the `complex32` and `complex64` primitive types.
The complex types themselves are language-defined primitives (Language Reference
§1-4.1.6); this section specifies the standard-library surface that wraps and
extends them.

### §21.9.1 Construction

```loup
namespace core.complex;

# Construct a complex64 from real and imaginary float64 values.
pub func complex(re: float, im: float): complex64;

# Construct a complex32 from real and imaginary float32 values.
pub func complex32(re: float32, im: float32): complex32;

# Polar-form construction: magnitude * (cos(phase) + i*sin(phase))
pub func fromPolar(magnitude: float, phase: float): complex64;
pub func fromPolar32(magnitude: float32, phase: float32): complex32;

# Constants
pub let i:    complex64 = complex(0.0, 1.0);
pub let i32:  complex32 = complex32(0.0f32, 1.0f32);
pub let zero: complex64 = complex(0.0, 0.0);
```

### §21.9.2 Component Projections

The component-projection methods are also available as free functions:

```loup
pub func re(z: complex64): float;
pub func im(z: complex64): float;
pub func re32(z: complex32): float32;
pub func im32(z: complex32): float32;
```

### §21.9.3 Algebraic Functions

```loup
pub func conj(z: complex64): complex64;       # a + bi -> a - bi
pub func abs(z: complex64): float;            # sqrt(re² + im²)
pub func arg(z: complex64): float;            # atan2(im, re), range (-π, π]
pub func norm(z: complex64): float;           # re² + im²
pub func proj(z: complex64): complex64;       # Riemann sphere projection
pub func polar(z: complex64): (mag: float, phase: float);

# Conjugated dot product over complex arrays — sum(conj(a[i]) * b[i]).
# Distinct from `core.array.dot` which is the un-conjugated form
# (sum(a[i] * b[i])) matching BLAS `zdotu` semantics. The conjugated
# form is the inner product on the complex Hilbert space and matches
# BLAS `zdotc` semantics.
pub func dotConj(a: array[complex64, 1], b: array[complex64, 1]): complex64;
pub func dotConj32(a: array[complex32, 1], b: array[complex32, 1]): complex32;

# complex32 variants follow the same convention with a 32 suffix:
pub func conj32(z: complex32): complex32;
pub func abs32(z: complex32): float32;
# ... etc.
```

`abs` and `arg` use IEEE 754 special-value handling per the C99 `cabs`/`carg`
contract: `abs(complex(inf, _))` is `+∞`, `abs(complex(_, nan))` is NaN unless
the other component is infinite.

### §21.9.4 Transcendental Functions

The full complex transcendental family follows the C99 `complex.h` and
ISO/IEC 60559:2020 specifications:

```loup
pub func cexp(z: complex64): complex64;       # exp(z) = e^z
pub func clog(z: complex64): complex64;       # natural log, principal branch
pub func clog10(z: complex64): complex64;     # base-10 log
pub func cpow(base: complex64, exp: complex64): complex64;
pub func csqrt(z: complex64): complex64;      # principal square root

# Trigonometric
pub func csin(z: complex64): complex64;
pub func ccos(z: complex64): complex64;
pub func ctan(z: complex64): complex64;
pub func casin(z: complex64): complex64;
pub func cacos(z: complex64): complex64;
pub func catan(z: complex64): complex64;

# Hyperbolic
pub func csinh(z: complex64): complex64;
pub func ccosh(z: complex64): complex64;
pub func ctanh(z: complex64): complex64;
pub func casinh(z: complex64): complex64;
pub func cacosh(z: complex64): complex64;
pub func catanh(z: complex64): complex64;
```

`complex32` variants of all transcendental functions are provided with a `32`
suffix (`cexp32`, `clog32`, `csin32`, etc.) and operate at single precision.

**Branch cuts.** Multi-valued functions use the principal-branch cuts specified
in C99 §7.3.3 — for example, `clog` has a branch cut along the negative real
axis (continuous from above), and `csqrt` has a branch cut along the negative
real axis (continuous from above). The `core.complex` documentation references
the C99 specification for the exact cut conventions.

### §21.9.5 Predicates

```loup
pub func isFinite(z: complex64): bool;     # both components finite
pub func isInfinite(z: complex64): bool;   # either component is ±∞ and other is not NaN
pub func isNan(z: complex64): bool;        # either component is NaN
pub func isReal(z: complex64): bool;       # im == 0.0 (signed zero counts as zero)
pub func isImaginary(z: complex64): bool;  # re == 0.0
```

### §21.9.6 `ComplexArithmeticError`

```loup
pub class ComplexArithmeticError : Exception {
    pub let operation: string;     # e.g., "clog of zero"
    pub let argument:  string;     # canonical decimal repr of the offending value
}
```

Raised by `clog(0)`, `clog10(0)`, and `casin/cacos/catan` at branch-cut
endpoints when the result is mathematically undefined. Most other transcendental
functions return IEEE 754 special values (`±∞`, `nan`) rather than raising.

### §21.9.7 Availability

| Mode | Construction / Projections / `conj` / `norm` | `abs` / `arg` / `polar` / `fromPolar` | Transcendentals |
|---|---|---|---|
| `host.native`, `host.dual`, `host.scripted` | ✓ | ✓ | ✓ |
| `web.compiled`, `web.scripted` | ✓ | ✓ | ✓ |
| `freestanding` | ✓ | ⚠ requires linked math runtime | ⚠ requires linked math runtime |

In freestanding mode, calling functions that require transcendental floating-
point without an explicitly-linked math runtime is `E_FREESTANDING_COMPLEX_TRANSCENDENTAL`.
Linking a math runtime is performed via the freestanding build's `extern native`
mechanism; see §3-3 (Freestanding Mode) for the protocol.

`Complex32` and `Complex64` interchange encodings are specified in §21.8.1 and
Language Reference §4-2.4.


---

## §21.10 `core.array` — Multi-Dimensional Array Operations

*(This section is normative. Companion to Language Reference §1-4.10. Available
in all modes.)*

The `core.array` namespace provides constructors, reductions, shape
manipulation, and type-conversion functions over the `array[T, rank]` primitive
type.

### §21.10.1 `Order` Enum

```loup
namespace core.array;

pub enum Order {
    RowMajor;
    ColumnMajor;
}
```

`Order` parameterizes the storage layout of `array[T, rank]` values. Used as
both a type parameter (`array[T, rank, order: Order = RowMajor]`) and a runtime
value (e.g., as a `core.interchange.Encoding.Array` field parameter).

`Order` is `Sendable` and `Serializable`.

### §21.10.2 Constructors

```loup
namespace core.array;

# Element-filled arrays
pub func zeros[T: Numeric, rank: int](shape: list[int]): array[T, rank];
pub func ones[T: Numeric, rank: int](shape: list[int]): array[T, rank];
pub func full[T, rank: int](shape: list[int], value: T): array[T, rank];

# Identity matrix (rank 2 only)
pub func eye[T: Numeric](n: int, order: Order = Order.RowMajor): array[T, 2];

# Numeric ranges (rank 1)
pub func arange(start: int, stop: int, step: int = 1): array[int, 1];
pub func linspace(start: float, stop: float, count: int): array[float, 1];
pub func logspace(start: float, stop: float, count: int, base: float = 10.0): array[float, 1];

# From an existing data sequence
pub func fromList[T, rank: int](
    data:  list[T],
    shape: list[int],
    order: Order = Order.RowMajor,
): array[T, rank];

# From raw bytes (mainly for FFI / unformatted I/O). The element bytes are
# interpreted in `endianness:` order; default is `Endianness.Native`. For
# portable cross-platform interchange, callers should specify Big or Little
# explicitly. Multi-byte primitives (`int16` and wider, all floats, complex
# types) follow the declared endianness; one-byte types (`int8`, `uint8`,
# `bool`) are unaffected.
pub func fromBytes[T, rank: int](
    bytes:      bytes,
    shape:      list[int],
    order:      Order = Order.RowMajor,
    endianness: Endianness = Endianness.Native,
): array[T, rank];
```

The `shape` parameter must have length equal to `rank`, with each entry ≥ 0. A
shape with the wrong number of dimensions raises `ArrayShapeError` with kind
`InvalidRank`. A shape with a negative dimension raises `ArrayShapeError`
with kind `DimensionInvalid`. A shape with one or more zero dimensions
produces an empty array (zero total elements); empty arrays are valid
operands for shape manipulation, structural operations, and `sum`/`prod`
(returning 0 / 1 respectively per the empty-reduction rule in §21.10.3),
and raise `ArrayShapeError(kind: EmptyReduction)` for `mean`, `min`, `max`,
`argmin`, and `argmax`.

`fromList` requires `data.length == product(shape)`; otherwise raises
`ArrayShapeError`. `fromBytes` requires
`bytes.length == sizeof(T) * product(shape)`. The `Endianness` enum is
defined in §21.8.3.

### §21.10.3 Reductions

Reductions accept either a scalar reduction (over all elements) or an
axis-reduction returning an array of rank `rank-1`:

```loup
# Whole-array reductions (return scalar)
pub func sum[T: Numeric, rank: int](a: array[T, rank]): T;
pub func mean[T: Numeric, rank: int](a: array[T, rank]): T;
pub func min[T: Numeric + Comparable[T], rank: int](a: array[T, rank]): T;
pub func max[T: Numeric + Comparable[T], rank: int](a: array[T, rank]): T;
pub func prod[T: Numeric, rank: int](a: array[T, rank]): T;

# Axis reductions (return array of rank rank-1)
pub func sumAxis[T: Numeric, rank: int](a: array[T, rank], axis: int): array[T, rank-1];
pub func meanAxis[T: Numeric, rank: int](a: array[T, rank], axis: int): array[T, rank-1];
pub func minAxis[T: Numeric + Comparable[T], rank: int](a: array[T, rank], axis: int): array[T, rank-1];
pub func maxAxis[T: Numeric + Comparable[T], rank: int](a: array[T, rank], axis: int): array[T, rank-1];
pub func prodAxis[T: Numeric, rank: int](a: array[T, rank], axis: int): array[T, rank-1];

# Index-of-extreme reductions
pub func argmax[T: Comparable[T], rank: int](a: array[T, rank]): list[int];   # index tuple
pub func argmin[T: Comparable[T], rank: int](a: array[T, rank]): list[int];
pub func argmaxAxis[T: Comparable[T], rank: int](a: array[T, rank], axis: int): array[int, rank-1];
pub func argminAxis[T: Comparable[T], rank: int](a: array[T, rank], axis: int): array[int, rank-1];

# Boolean reductions
pub func all[rank: int](a: array[bool, rank]): bool;
pub func any[rank: int](a: array[bool, rank]): bool;
pub func count[rank: int](a: array[bool, rank]): int;
```

Complex array reductions: `sum`, `mean`, `prod`, and their `…Axis` variants
work on complex arrays via the complex `+`/`×`/`/` operations. `min`, `max`,
`argmin`, `argmax`, and the `…Axis` variants of those, are statically
unavailable for complex element types — the `T: Comparable[T]` bound is not
satisfied (complex values are not totally ordered; see Language Reference
§1-4.1.6). Attempting to call `min`/`max`/`argmin`/`argmax` with a complex
array argument is a compile-time type error; the runtime error
`E_ARRAY_NOT_ORDERED` covers cases where the type bound is satisfied via
generics but the dynamic element type at instantiation does not admit the
operation.

Reductions on empty arrays raise `ArrayShapeError` with kind `EmptyReduction`,
except `sum` which returns 0 and `prod` which returns 1 (mathematical identity
elements).

**Axis-reduction rank constraints.** The `…Axis` variants require `rank ≥ 2`,
because their return type `array[T, rank-1]` would degenerate to the
unsupported rank-0 form when `rank == 1`. For `rank == 1` arrays, use the
scalar reduction form (`sum`, `mean`, `min`, etc.). Calling an `…Axis`
variant on a rank-1 array is `E_ARRAY_AXIS_RANK_TOO_LOW` at compile time.

### §21.10.4 Shape Manipulation

```loup
# Reshape — total element count must be preserved
pub func reshape[T, rank1: int, rank2: int](
    a:     array[T, rank1],
    shape: list[int],         # must have length rank2
): array[T, rank2];

# Transpose — rank-2 only, swap axes
pub func transpose[T](a: array[T, 2]): array[T, 2];

# Permute axes — generalize transpose to arbitrary rank
pub func permuteAxes[T, rank: int](
    a:    array[T, rank],
    axes: list[int],          # permutation of [0..rank)
): array[T, rank];

# Squeeze — remove axes of length 1. The output rank rank2 must be at
# least 1; squeezing every axis of an all-ones-shaped input is
# E_ARRAY_RANK_RANGE.
pub func squeeze[T, rank: int, rank2: int](a: array[T, rank]): array[T, rank2];

# Unsqueeze — insert an axis of length 1 at the given position. Requires
# rank <= 6 (the result rank rank+1 must remain in 1..=7); applying to a
# rank-7 array is E_ARRAY_RANK_RANGE.
pub func unsqueeze[T, rank: int](a: array[T, rank], axis: int): array[T, rank+1];

# Concatenate along an axis
pub func concat[T, rank: int](
    arrays: list[array[T, rank]],
    axis:   int = 0,
): array[T, rank];

# Stack arrays along a new axis. Requires the input rank rank <= 6 (the
# result rank rank+1 must remain in 1..=7); stacking rank-7 arrays is
# E_ARRAY_RANK_RANGE.
pub func stack[T, rank: int](
    arrays: list[array[T, rank]],
    axis:   int = 0,
): array[T, rank+1];

# Split into sub-arrays along an axis
pub func split[T, rank: int](
    a:      array[T, rank],
    pieces: int,
    axis:   int = 0,
): list[array[T, rank]];

# Order conversion (transpose stride layout)
pub func toOrder[T, rank: int](
    a:     array[T, rank],
    order: Order,
): array[T, rank];

# Index-base reinterpretation. Returns a view sharing the source's storage
# with the index base reinterpreted. Storage is not touched. The destination
# base is a static type-parameter, resolved at compile time from the result
# binding's type ascription:
#   let a0: array[float, 2, base: 0] = rebase(a1);  // a1 is base: 1
# Calling with a result type whose base is other than 0 or 1 is
# E_ARRAY_BASE_RANGE.
pub func rebase[T, rank: int, oldBase: int, newBase: int](
    a:       array[T, rank, base: oldBase],
): array[T, rank, base: newBase];

# Independent copy
pub func copy[T, rank: int](a: array[T, rank]): array[T, rank];
```

### §21.10.5 Errors

```loup
pub class ArrayShapeError : Exception {
    pub let operation:  string;     # operation that failed (e.g., "reshape", "concat")
    pub let actual:     list[int];  # shape encountered
    pub let expected:   string;     # human-readable expectation
    pub let kind:       ArrayShapeErrorKind;
}

pub enum ArrayShapeErrorKind {
    Mismatch;            # operands have non-conformant shapes
    InvalidRank;         # rank requested out of range
    EmptyReduction;      # reduction on an empty array
    InvalidAxis;         # axis index out of range
    InvalidPermutation;  # permuteAxes argument is not a valid permutation
    DimensionInvalid;    # shape contains a negative dimension (zero is allowed; produces empty array)
}

pub class ArrayIndexError : Exception {
    pub let arrayShape: list[int];
    pub let index:      list[int];   # attempted index
    pub let axis:       int?;        # None if index has wrong arity
}
```

Both extend `Exception` (Language Reference §1-18.1) and are catchable.

### §21.10.6 Iteration

```loup
# Iterate elements in storage order
pub func iter[T, rank: int](a: array[T, rank]): Iterable[T];

# Iterate (index, value) pairs in storage order
pub func enumerate[T, rank: int](a: array[T, rank]): Iterable[(list[int], T)];

# Iterate sub-arrays along an axis. Requires rank >= 2 (the result element
# type would degenerate to rank 0 for rank-1 arrays). For rank-1 arrays,
# use `iter()` instead.
pub func iterAxis[T, rank: int](a: array[T, rank], axis: int = 0): Iterable[array[T, rank-1]];
```

The iteration order is the array's storage order: `RowMajor` arrays iterate
the last axis fastest; `ColumnMajor` arrays iterate the first axis fastest.

`iterAxis` produces views (no copy); the caller can modify a sub-array in place
to mutate the source. Calling `iterAxis` on a rank-1 array is
`E_ARRAY_AXIS_RANK_TOO_LOW` at compile time.

**`Iterable[T]` conformance.** `array[T, rank]` implements `Iterable[T]` for any rank, with the desugaring `for (x in a) { ... }` equivalent to `for (x in iter(a)) { ... }` — elements are visited in the array's storage order. This means the for-in loop works directly on multi-dimensional arrays without an explicit `iter()` call, e.g. `for (x in matrix) { sum += x; }` iterates all elements regardless of rank. To iterate sub-arrays instead of elements, use `iterAxis` explicitly. To preserve index information during iteration, use `enumerate`.

### §21.10.7 Linear Algebra (basic)

The `array[T, rank]` type provides linear-algebra operations both as instance
methods (`a.dot(b)`, `a.matmul(b)`, `a.transpose()`) and as free functions in
`core.array`. The two forms are semantically identical — instance method
`a.method(args)` is equivalent to free function `core.array.method(a, args)`.
Both perform sequential implementations. For accelerated implementations,
the `loup.blas` and `loup.lapack` packages provide BLAS/LAPACK-backed
alternatives with the same surface and identical numerical results within
floating-point tolerance.

The free-function form is provided here for non-method-call sites and as
the canonical normative declaration:

```loup
pub func dot[T: Numeric](a: array[T, 1], b: array[T, 1]): T;
pub func matmul[T: Numeric](a: array[T, 2], b: array[T, 2]): array[T, 2];
pub func cross[T: Numeric](a: array[T, 1], b: array[T, 1]): array[T, 1];     # 3-vector cross product
pub func outer[T: Numeric](a: array[T, 1], b: array[T, 1]): array[T, 2];     # outer product
```

The instance method forms (`a.dot(b)`, `a.matmul(b)`, `a.cross(b)`,
`a.outer(b)`) take the same parameters minus the receiver and have the
same return types and the same compile-time bounds.

`cross` requires both inputs to have shape `[3]`; otherwise raises
`ArrayShapeError`.

`dot` requires both inputs to have the same length (rank-1 vectors).
`matmul` requires the inner dimensions to match: for `a` of shape
`[m, k]` and `b` of shape `[k, n]`, the result has shape `[m, n]`.
Mismatched shapes raise `ArrayShapeError` at runtime.

For complex-element arrays, `dot` is the **un-conjugated** complex dot
product (component-wise multiply-and-sum), matching BLAS conventions for
`zdot{u,c}` separation. The conjugated form (`sum(conj(a[i]) * b[i])`)
is available via `core.complex.dotConj` (see §21.9).

### §21.10.8 `Sendable`, `Shareable`, and `Numeric`

`array[T, rank]` is `Sendable` if `T: Sendable` and `Shareable` if `T:
Shareable`. Generic numeric code constrained on `T: Numeric` accepts arrays
where the operations defined are well-defined; ordering-dependent generic code
must additionally constrain on `T: Comparable[T]` or `T: Numeric +
Comparable[T]`.


---

## §21.11 `core.fpenv` — Floating-Point Environment

*(This section is normative. Companion to Language Reference §1-4.1.7.
Available in all modes; behavior is mode-dependent — see Language Reference
§1-4.1.7 for the availability matrix.)*

### §21.11.1 `RoundingMode` Enum

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

This enum is **distinct from** the `core.numeric.RoundingMode` of §21.7.1 which
applies to `decimal(p, s)` arithmetic. The two enums share several variant names
but have different semantics (binary IEEE 754 vs base-10 decimal). Code that
imports both should use qualified names: `core.fpenv.RoundingMode.Upward` vs
`core.numeric.RoundingMode.HalfUp`.

`RoundingMode` is `Sendable` and `Serializable`.

### §21.11.2 Scoped Rounding

```loup
namespace core.fpenv;

# Execute body under the specified rounding mode; restore on exit.
pub func withRounding[T](mode: RoundingMode, body: fn(): T): T;

# Async variant — preserves rounding mode across await boundaries within
# the body's task.
pub async func withRoundingAsync[T](mode: RoundingMode, body: fn(): Task[T]): Task[T];

# Get the currently-active rounding mode.
pub func currentRoundingMode(): RoundingMode;
```

Nested `withRounding` calls compose — the inner call's mode applies until its
body returns, at which point the outer call's mode is restored. Exceptions
unwound from the body trigger the restore in a `defer`-like manner.

### §21.11.3 Exception Flags

```loup
namespace core.fpenv;

pub enum FpFlag {
    Inexact;        # result was rounded
    Underflow;      # result is denormal or zero with fractional underflow
    Overflow;       # result exceeds finite range
    DivideByZero;   # division of finite nonzero by zero
    Invalid;        # operation produces NaN from non-NaN inputs (e.g., sqrt(-1))
}

# Currently-set flags (sticky across operations)
pub func exceptionFlags(): list[FpFlag];

# Convenience: test a single flag
pub func testException(flag: FpFlag): bool;

# Clear flags
pub func clearExceptionFlags(): void;
pub func clearExceptionFlag(flag: FpFlag): void;

# Save and restore the entire flag state
pub func saveExceptionFlags(): list[FpFlag];
pub func restoreExceptionFlags(saved: list[FpFlag]): void;
```

Exception flags are *thread-local* and *task-local* — each thread maintains its
own flag state, and async tasks inherit the calling task's flags at await
boundaries but not at task spawn (a newly-spawned task starts with cleared
flags).

### §21.11.4 Signaling NaN

```loup
namespace core.fpenv;

# Produce a signaling NaN of the target type. T must be float32 or float64.
pub func signalingNan[T](): T;

# Test whether a value is a signaling NaN (vs quiet NaN). For finite values
# or quiet NaN, returns false.
pub func isSignaling[T](value: T): bool;
```

`signalingNan[T]()` produces an IEEE 754 sNaN encoding of type `T`. Once
consumed by an arithmetic operation, the sNaN raises `FpFlag.Invalid` and
becomes a quiet NaN; subsequent operations on the result do not re-raise.

### §21.11.5 `Float` Trait Members

The `Float` trait (§21.2.4) gains the following members in v1.20:

```loup
pub interface Float {
    # ... existing members from v1.18 ...

    # Per-type IEEE 754 metadata (static — same for all instances of the type)
    static let radix:       int;     # 2 for binary IEEE 754
    static let digits:      int;     # significand bits (24 for float32, 53 for float64)
    static let minExponent: int;
    static let maxExponent: int;
    static let epsilon:     Self;    # machine epsilon for the type
    static let tiny:        Self;    # smallest normal positive value
    static let huge:        Self;    # largest finite positive value

    # Decomposition
    pub func mantissa(): (sign: int, mantissa: int, exponent: int);

    # Successor/predecessor in the floating-point ordering (IEEE nextafter)
    pub func nextUp(): Self;
    pub func nextDown(): Self;

    # Distance in ULPs (units in the last place)
    pub func ulpDistance(other: Self): int64;
}
```

The `static let` members are accessed via the type name: `float32.epsilon`,
`float64.huge`, `float32.digits`. Generic code with a `T: Float` bound accesses
them via the type parameter: `T.epsilon`, `T.huge`.

These are added to the trait surface to support numerical algorithms that
require IEEE 754 introspection: stopping criteria for iterative solvers, ULP-
based comparison for testing, and extended-precision arithmetic.

### §21.11.6 Availability

| Mode | `withRounding` effect | Exception flags | sNaN |
|---|---|---|---|
| `host.native`, `host.dual`, `freestanding` | Active — modifies host FP control word | Active | Active |
| `host.scripted` | No-op (runs body unchanged) | Always empty | Returns quiet NaN |
| `web.compiled` | No-op | Always empty | Returns quiet NaN |
| `web.scripted` | No-op | Always empty | Returns quiet NaN |

In modes where the runtime cannot manipulate the host floating-point control
word, the API is provided as a no-op rather than raising an error so that
portable code may use it without conditional compilation. Code requiring
deterministic non-default rounding behavior must compile to native or
freestanding modes.


---

## §21.12 Freestanding-Only Namespaces (`native.*`)

Every module specified elsewhere in this document belongs to the **hosted**
stdlib surface — it assumes a Loup runtime, a heap, and a capability host.
`@mode(freestanding)` (Language Reference §3-3) compiles without any of those,
so the stdlib surface a bare-metal program sees is a different one: a small
permitted subset of the hosted modules, plus a family of **`native.*`
namespaces that exist only in freestanding builds**.

**Normative reference.** Language Reference §3-3.20 ("Available Standard
Library Subset") is the normative definition of this surface: it carries the
full signatures, the `MemoryOrder` enum, the ownership rules, and the module
admissibility rule. This section is a **discoverability summary and
cross-reference only** — it deliberately does not restate the APIs. Where this
section and §3-3.20 disagree, **§3-3.20 governs**.

### §21.12.1 Mode Restriction

- The `native.*` namespaces are importable only from `@mode(freestanding)`
  source, except `native.mem` and `native.atomic`, which §3-3.20 also makes
  available in `@mode(host.native)`. They are not part of the hosted/script
  stdlib surface and have no `host.scripted` or `web.compiled` behavior.
- Conversely, the hosted stdlib modules specified in this document — the
  shared-memory types (§21.1–§21.5), `core.serialization` (§21.6), and the
  `data.*`, `io.*`, `net.*`, `sync.*`, `ui.*`, `web.*`, `core.reflect` families
  — are **unavailable in freestanding mode**. Importing one is
  `E_FREESTANDING_MODULE` (§3-3.22). Only the modules listed in §21.12.3 below
  are admissible.
- Mixing modes across an import edge is rejected at resolve time:
  `E_FREESTANDING_IMPORT_NATIVE`, `E_FREESTANDING_IMPORT_MANAGED`, and
  `E_NATIVE_IMPORT_FREESTANDING` (§3-3.22).

### §21.12.2 Namespace Catalog

| Namespace | Purpose | Status |
|---|---|---|
| `native.mem` | Raw memory operations — `copy`, `zero`, `compare`, and `@allocator`-backed `alloc` / `free` / `tryAlloc` | Implemented (also `host.native`) |
| `native.atomic` | Atomic `load` / `store` / `fetchAdd` / `fetchSub` / `compareExchange`, the compiler `fence`, the hardware `hwFence(MemoryOrder)` barrier, and the freestanding-only interrupt-flag save/restore pair | Partially implemented — `source/stdloup/native_atomic.lphc` (`@mode(host.native)`, x86-64 encodings only) provides the barriers `hwFence()` (full fence, no `MemoryOrder` argument), `hwFenceAcquire()`, `hwFenceRelease()` and `compilerFence()`. The typed `load` / `store` / `fetchAdd` / `fetchSub` / `compareExchange` and `hwFence(MemoryOrder)` do not exist, and `host.native` has no address-based atomics (shared-memory atomics are the `SharedBuffer` methods and `Atomic[T]` of §2-2). The interrupt-flag save/restore pair is the freestanding prelude's `interruptGuardEnter` over the `irqSaveDisable` / `irqRestore` intrinsics (§3-3.14), not this namespace |
| `native.dma` | DMA buffer ownership — `DmaBuffer[T]` / `DmaTransfer[T]`, modelling "CPU **or** controller, never both" with the ownership verbs | Implemented — the exclusive in-flight borrow is enforced by the typechecker (`E_DMA_BUFFER_ACTIVE`) |
| `native.mpu` | MPU stack-guard installation — `installStackGuard` / `removeStackGuard`, `MpuError` | Contract only in freestanding (see below) |
| `native.simd` | SIMD vector types and intrinsics | Specified pending implementation |
| `native.ffi` | C FFI utilities — size/align queries, pointer arithmetic, `PinnedRef`, `OwnedHandle`, `BorrowedHandle` | Specified pending implementation |
| `native.css` | Channel-subsystem I/O — ownership-typed CCW channel programs and subchannels; the channel analog of `native.dma` (§3-3.26) | Specified pending implementation |
| `native.storagekey` | Typed `StorageKey` wrapper over the storage-key instructions | Deferred — not implemented in this revision (§3-3.20) |

**Status legend.**

- **Implemented** — the toolchain lowers the namespace in v1.20; freestanding
  programs may depend on it.
- **Partially implemented** — only the subset the Status cell names lowers;
  the rest of the row is specified pending implementation.
- **Contract only** — the namespace and its signatures are normative, but the
  freestanding implementation is supplied by the target's HAL, not by the
  toolchain. This is the case for `native.mpu`: per §3-3.20, the compiler emits
  no prologue stack probe and ships no freestanding guard-region
  implementation; the bare-metal program maps the guard region in its own
  page/region tables and routes the resulting fault to its panic path, matching
  the `installStackGuard` signature as the contract. In `host.native` mode the
  Loup runtime installs thread-stack guard pages itself and user code need not
  call it.
- **Specified pending implementation** — the namespace is normatively specified
  in §3-3.20, but the v1.20 toolchain ships no lowering for it. Do not write
  code against it yet.
- **Deferred** — named in §3-3.20 as a candidate and explicitly *not*
  implemented in this revision; it is not part of the v1.20 surface.

### §21.12.3 Hosted Modules Admissible in Freestanding Mode

The following modules are the **only** ones outside the `native.*` family that
`@mode(freestanding)` source may import. Each carries freestanding-specific
restrictions that §3-3.20 states normatively; the summaries below are
indicative.

| Module | Freestanding restriction |
|---|---|
| `core.math` | Pure math functions — no heap |
| `core.text` | UTF-8 operations on borrowed slices — no allocation |
| `core.complex` (§21.9) | Basic arithmetic only; the transcendental family requires an explicitly linked math runtime (`E_FREESTANDING_COMPLEX_TRANSCENDENTAL`) |
| `core.array` (§21.10) | Allocating constructors require a registered `@allocator`; transformations over borrowed arrays are heap-free |
| `core.fpenv` (§21.11) | Active surface — `withRounding` issues real hardware FP control-word updates |
| `core.interchange` (§21.8) | Heap-free subset — the derived pack/unpack read and write a caller-provided byte buffer; decimal-runtime, charset-table, and variable-length encodings remain rejected with `E_FREESTANDING_MODULE` |
| `debug.freestanding` | Freestanding debug service — `--debug` builds only; `E_FREESTANDING_MODULE` in release builds (§3-3.25) |

Every other standard library module is unavailable
(`E_FREESTANDING_MODULE`).

### §21.12.4 Where to Look

| Topic | Normative location |
|---|---|
| Full `native.*` signatures, `MemoryOrder`, `DmaBuffer` / `MpuError` | Language Reference §3-3.20 |
| Freestanding mode as a whole (no ARC, no exceptions, no async) | Language Reference §3-3 |
| Freestanding error codes (`E_FREESTANDING_*`) | Language Reference §3-3.22 |
| `Volatile[T]` MMIO and the barrier-after-store pattern | Language Reference §3-3.9 |
| Freestanding build configuration (`[freestanding]` manifest keys) | Language Reference §3-3.21 |


---

## §21.13 Entry-Script Prelude

*(This section is normative. Applies to entry scripts in the hosted script modes and the REPL.)*

When a module is compiled or run as an **entry script** — the file handed directly to the script runner (`loup run` / `loup-bootstrap run`) or a REPL session — the resolver injects the **prelude**: a set of convenience bindings available without any import. The prelude is injected **only** into entry scripts; an imported library module that uses a prelude name without importing it gets an "undefined identifier" diagnostic. Prelude bindings have lower priority than user declarations: a user-declared symbol of the same name silently shadows the prelude binding. The `runtime` capability root is bound in **all** modules, entry or not.

**File and environment helpers** (require the corresponding `runtime` capability; the runner's permission flags — e.g. `--allow-all` — gate them):

```loup
func args(): list[string]                 # positional script arguments (after `--`)
func env(name: string): Option[string]    # environment variable lookup
func readBytes(path: string): bytes
func readText(path: string): string
func writeBytes(path: string, data: bytes): void
func writeText(path: string, data: string): void
func exists(path: string): bool
```

**Process execution:**

```loup
func exec(argv: list[string]): ProcResult      # buffered: captures output
func execShell(cmd: string): int               # via the system shell; stdio inherited
async func execAsync(argv: list[string]): Task[ProcResult]
```

- `exec` runs `argv` directly (no shell) and returns a `ProcResult` with fields `exit_code: int`, `stdout: bytes`, `stderr: bytes` — output is captured, not streamed.
- `execShell` runs `cmd` through the host system shell with the script's stdio **inherited**, so the child's output streams live to the terminal; it blocks until the command completes and returns the child's exit code. It is the intended hook for build drivers and long-running tool invocations.
- **The host system shell (normative).** On Unix hosts it is `sh -c cmd`. On Windows it is `cmd.exe`: the command line `%COMSPEC% /d /s /c "cmd"` (`cmd.exe` when `COMSPEC` is unset or empty) — what the C runtime's `system()` runs, plus `/d` (the registry `AutoRun` commands do not run, so the result does not depend on per-user settings) and `/s` (exactly the outer pair of quotes is stripped, so `cmd` reaches the shell verbatim whatever quotes it contains). `cmd` is therefore written in the host shell's language: a script that must run on both kinds of host either uses `exec` or chooses its command text by host. Output the child writes keeps the child's own line endings (`cmd.exe` built-ins write `\r\n`).
- `exec` starts `argv[0]` directly on every host, with no shell; on Windows the program is found the way `CreateProcess` finds it, through `PATH` with the `.exe` suffix implied, and a `cmd.exe` built-in (`echo`, `dir`, `type`, …) is not a program — spell the shell out: `exec(["cmd", "/c", "echo", "hi"])`.
- `execReplace(cmd: string): int` (prelude; the build driver's tail call) replaces the process with the host shell running `cmd`, so `cmd`'s exit status becomes the process's own and nothing after the call runs; it returns only on failure, with `-1`. Windows has no `exec`: there the shell runs as a child with the inherited stdio (standard output and standard error are flushed first), and the process then exits with the child's status — observably the same, except that the parent's memory stays allocated until the child ends.
- A compiled `host.native` program built on a Windows host (Vol 3 §3-2.1) uses the same host shell and finds an `exec` program the same way; there, as in native programs on Unix hosts, `exec` of a program that cannot be started answers a `ProcResult` with exit code 127, as a shell reports it.
**Asynchronous file I/O:** `readBytesAsync(path): Task[bytes]`, `readTextAsync(path): Task[string]`, `writeBytesAsync(path, data): Task[void]`, `writeTextAsync(path, data): Task[void]`.

**Output and conversion:** `print(value: Any): void` (no newline), `println(value: Any): void`, `printErr(value: Any): void` (§2-5.2: a line to STDERR — `println`'s stderr counterpart, stdout flushed first; loup#513), `exit(code: int): void` (§2-5.2: end the process with `code`, both streams flushed; loup#469), `str(value: Any): string` (generic to-string) — all four render `value` through the §1-16.4 pipeline with `RenderContext(language="text", format="none")`, so `Some(v)` prints as `v`, `None` as the empty string, and an enum variant as its name and payload, exactly as interpolation renders them (loup#343) —, `repr(value: Any): string` (the DIAGNOSTIC renderer of §1-16.4: structural, strings quoted, `Some(v)`/`None`/`Ok(v)`/`Err(e)` spelled out, never throws), `bytesFromInts(values: list[int]): bytes` (each element one byte, clamped to 0..=255), and the numeric conversion functions of §1-4.1.2 (`int8`…`int64`, `uint8`…`uint64`, `float32`, `bigint`, `decimal`) plus the §21.9 complex constructors (`complex`, `re`, `im`, `complexPolar`). (`__render` and `RenderContext` are also injected as the interpolation desugar targets; they are internal and not part of the stable surface.)

**`panic` — unconditional, uncatchable failure.** Available in every mode, entry script or not:

```loup
pub func panic(msg: string): noreturn
```

`panic` reports an unrecoverable condition and does not return. Its return type is `noreturn` (§1-4.4a), which is what lets a call to it end a path without a `return` and stand in a `match` arm beside typed arms.

It is **not** an exception: `panic` does not `throw`, no `catch` arm intercepts it, and `finally` is not a recovery path. In `@mode(freestanding)` it is delivered to the installed `@panic_handler` with `PanicSource.Assertion` (§3-3.6); elsewhere it terminates the program with the message.

> This declaration is stated here because it was previously absent: `panic` was referenced throughout the specification set — including as one of the panic sources §3-3.6 enumerates — with no signature written anywhere, so its return type was a matter of inference. It is `noreturn`.

**Prelude types.** The built-in exception class names of §1-18.1 (`RuntimeError`, `ValueError`, `IndexError`, …) are bound in entry scripts, so a script may `throw RuntimeError("message")` or `catch (ValueError as e)` without imports. An uncaught exception terminates the script with a **nonzero exit status** (the exact code is an implementation detail of the execution path); build scripts use `throw RuntimeError(...)` as their fail-the-build idiom.

---

## §21.14 `debug.recording` — Nondeterminism Recording Ring

*Mode: `@mode(freestanding)` (the module is freestanding; it imports into a
freestanding unit). Source: `source/stdloup/debug_recording.lpfree`.*

The single recording format shared by the F6 recording (`Recording.events`)
and the console C1 time-travel record/replay hooks: a bounded ring of
nondeterminism records per vcore, with a companion byte arena inside the
stream, and no allocator. The four policies are the ones settled in
`docs/internal/helios-f6-c1-recording-stream-decision.md`.

```loup
pub struct NondetRecord { pub var seq: uint64; pub var source: uint32;
                          pub var payload_is_arena: uint32; pub var payload: uint64; }
pub struct RecordStream { pub var vcore: uint32; pub var overflow_policy: uint32;
                          pub var stopped: uint32; pub var segment: uint64;
                          pub var head: uint64; pub var count: uint64;
                          pub var arena: buffer[uint8, 4096]; pub var arena_used: uint64;
                          … }            # ring storage: one column per record field
pub struct TimelineAnchor { pub var epoch: uint64; pub var step: uint64; pub var vcore: uint32; }

pub func rs_capacity(): uint64;          # records per segment (1024)
pub func rs_arena_capacity(): uint64;    # arena bytes (4096)
pub func nondet_syscall(): uint32;  pub func nondet_input(): uint32;
pub func nondet_timer(): uint32;    pub func nondet_sched(): uint32;
pub func overflow_rotate(): uint32; pub func overflow_halt(): uint32;

pub func rs_init(edits rs: RecordStream, vcore: uint32, policy: uint32): void;
pub func rs_record(edits rs: RecordStream, source: uint32, payload: uint64): uint64;
pub func rs_arena_reserve(edits rs: RecordStream, len: uint64): uint64;
pub func rs_record_arena(edits rs: RecordStream, source: uint32, offset: uint64, len: uint64): uint64;
pub func rs_replay(rs: RecordStream, step: uint64): NondetRecord;
pub func rs_anchor(rs: RecordStream, epoch: uint64): TimelineAnchor;
pub func rs_rotate(edits rs: RecordStream): uint64;
pub func rs_full(rs: RecordStream): bool;
pub func rs_stopped(rs: RecordStream): bool;
pub func rs_payload_offset(rec: NondetRecord): uint64;
pub func rs_payload_len(rec: NondetRecord): uint64;
```

- Every operation that changes a stream takes it as an `edits` borrow
  (§3-2.4.9): `rs_record(edits: rs, nondet_syscall(), v)`.
- A record's `seq` is its position in the current segment; `rs_record` and
  `rs_record_arena` return it (`< rs_capacity()`).
- **A full ring never overwrites** (drop-oldest is rejected). Under
  `overflow_rotate()` a record on a full ring is REFUSED — the call returns
  `rs_capacity()` — until the owner snapshots the ring and calls `rs_rotate`,
  which opens the next segment (head, count and arena reset; `segment`
  incremented). Under `overflow_halt()` the full ring also sets `stopped`;
  every later record is refused until `rs_rotate` or `rs_init`.
- An arena-backed record's `payload` is `(offset << 32) | len` with
  `payload_is_arena == 1`. `rs_arena_reserve` returns `rs_arena_capacity()`
  and reserves nothing when `len` bytes do not fit.
- `TimelineAnchor.epoch` is the caller's hardware-witnessed monotonic epoch;
  `step` is the ring head.

---

## §21.15 `structures.priority_queue` — Binary-Heap Priority Queue

*Mode: `host.dual`. Source: `source/stdloup/structures_priority_queue.loup`.*

```loup
pub class PriorityQueue[T] {
    pub func constructor(compare: fn(T, T): int);
    pub func len(): int;
    pub func isEmpty(): bool;
    pub func push(item: T): void;
    pub func peek(): T;            # IndexError when empty
    pub func pop(): T;             # IndexError when empty
    pub func drain(): list[T];     # every item, least first; the queue is left empty
    pub modifier func clear(): void;
}
```

A min-heap under `compare(a, b)`: negative when `a` comes out before `b`,
zero on a tie, positive otherwise (pass a reversed comparator for a max-heap).
`push` / `pop` are O(log n); `peek` / `len` are O(1). Ties come out in no
defined order. `peek` and `pop` on an empty queue raise `IndexError`, as
`first()` / `pop()` on an empty list do (Language Reference §1-3).

*Native status:* class-typed elements on the managed native lanes wait on the generic-class retain fix (design row PQ-1); scalar and string elements work on every lane.

---

## §21.16 `io.streams` — Byte Streams

*Mode: `host.dual`; no capability. Source: `source/stdloup/io_streams.loup`.*

Built on the Language Reference §1-11.2 standard interfaces
`Readable { func read(n: int): bytes; }` and
`Writable { func write(b: bytes): int; }`. A `read(n)` returns at most `n`
bytes, fewer at the end, and an empty `bytes` once the source is exhausted —
it never raises at the end.

```loup
pub class EndOfStreamError : Exception { pub func constructor(message: string); }

pub class ByteReader implements Readable {      # a cursor over a bytes value
    pub func constructor(buffer: bytes);
    pub func remaining(): int;    pub func atEnd(): bool;    pub func position(): int;
    pub modifier func seek(pos: int): void;               # IndexError outside 0..length
    pub modifier func readByte(): int;     pub func peekByte(): int;  # EndOfStreamError at the end
    pub modifier func readBytes(count: int): bytes;       # EndOfStreamError, nothing consumed, if short
    pub modifier func readUntil(delimiter: int): bytes;   # delimiter consumed, not returned
    pub modifier func readAll(): bytes;
    pub modifier func read(n: int): bytes;
}
pub class ByteWriter implements Writable {
    pub func constructor();
    pub func writeByte(b: int): void;            # the low 8 bits
    pub func writeBytes(data: bytes): void;
    pub func writeString(s: string): void;       # UTF-8
    pub func write(b: bytes): int;
    pub func len(): int;  pub func toBytes(): bytes;  pub modifier func clear(): void;
}
pub class ByteBuffer implements Readable, Writable {   # in-memory FIFO
    pub func constructor();
    pub static func new(capacity: int = 64): ByteBuffer;    # capacity is a sizing hint
    pub func write(data: bytes): int;  pub modifier func read(n: int): bytes;
    pub modifier func readAll(): bytes;  pub func length(): int;  pub modifier func reset(): void;
}
pub class BufferedReader implements Readable {
    pub func constructor(inner: Readable, bufSize: int);
    pub static func new(inner: Readable, bufSize: int = 8192): BufferedReader;
    pub modifier func readLine(): Option[string];   # strips "\n" / "\r\n"; None at the end
    pub modifier func read(n: int): bytes;  pub modifier func readAll(): bytes;
}
pub class BufferedWriter implements Writable {
    pub func constructor(inner: Writable, bufSize: int);
    pub static func new(inner: Writable, bufSize: int = 8192): BufferedWriter;
    pub modifier func write(data: bytes): int;      # flushes when bufSize bytes are pending
    pub modifier func writeText(text: string): int; # UTF-8
    pub func pending(): int;  pub modifier func flush(): void;
}
pub class ConcatReader implements Readable { pub func constructor(sources: list[Readable]); pub modifier func read(n: int): bytes; }
pub func concat(sources: list[Readable]): ConcatReader;
pub func copyStream(src: Readable, dst: Writable, chunk: int): int;   # bytes copied
```

`BufferedReader.readLine` decodes each line as UTF-8 (`bytes.toText()`); a
last line without a terminator is returned as is.

---

## §21.17 `core.math` — Magnitude and Extremes

*Additions to the `core.math` surface (`specs/3-stdlib-2-core-math`).*

```loup
pub func abs(x: float): float;
pub func absInt(x: int): int;
pub func min(a: float, b: float): float;
pub func max(a: float, b: float): float;
pub func minInt(a: int, b: int): int;
pub func maxInt(a: int, b: int): int;
```

`abs(-0.0)` is `0.0`. `min` / `max` return NaN when either argument is NaN.
`core.complex` keeps its own `abs(z: complex64): float`; each name resolves
through the module it is imported from (`from core.complex import (abs as cabs)`
beside `from core.math import (abs)`).

---

## §21.18 `debug.assert` — Assertion Helpers

*Mode: `host.dual`. Source: `source/stdloup/debug_assert.loup`.*

```loup
pub class AssertionError : Exception { pub func constructor(message: string); }
pub func expect(condition: bool, message: string): void;
pub func expectEq(actual: Any, expected: Any, context: string): void;
pub func expectNeq(actual: Any, forbidden: Any, context: string): void;
pub func expectSome[T](value: Option[T], context: string): T;
pub func expectContains(items: list[Any], item: Any, context: string): void;
pub func expectThrows(action: fn(): void, context: string): Exception;
pub func expectNear(actual: float, expected: float, tolerance: float, context: string): void;
```

Every failure raises `AssertionError`. The messages name the values, rendered
as `str()` renders them: `"<context>: expected <expected>, got <actual>"`,
`"<context>: value was equal to forbidden <forbidden>"`,
`"<context>: expected Some, got None"`, `"<context>: list does not contain <item>"`.

---

## §21.19 `core.datetime` — Nanosecond Times, Named Offsets

*Additions to `core.datetime` (`specs/3-stdlib-2-core-datetime`).*

```loup
pub static func Timezone.fromOffset(offsetMinutes: int): Timezone;  # named "+05:30", "+00:00", …
pub static func Time.withNanos(hour: int, minute: int, second: int, nanosecond: int): Time;
pub func Time.replaceNanosecond(nanosecond: int): Time;
pub func Time.toNanosOfDay(): int;
pub func DateTime.toISO(): string;                                 # the text of isoformat()
# Time and DateTime gain `pub nanosecond: int`.
```

`nanosecond` is the whole fraction of the second in nanoseconds
(0..999 999 999); `microsecond` is the same fraction truncated to whole
microseconds. Ordering and equality use the nanosecond. `isoformat()` appends
`.ffffff` when the fraction is a non-zero whole number of microseconds and nine
digits otherwise; `fromIsoformat` keeps up to nine fraction digits.

---

## §21.20 `testing` — Timed Results and `TestFailure`

*Additions to the `testing` harness (testing reference §23).*

```loup
pub class TestFailure : Exception {
    pub testName: string;  pub details: string;   # message is "<testName>: <details>"
    pub func constructor(testName: string, details: string);
}
# TestResult.durationNs — monotonic nanoseconds the test took (was always 0).
# TestSummary.totalDurationNs — the sum over its results.
```

---

## §21.21 Shared-Memory Runtime Exceptions

The twelve runtime exceptions of Language Reference §2-2.11 (listed in
Appendix A) are built-in exception classes extending `Exception`: a program
catches each by its own name, throws one by name with a message
(`throw QueueClosedError("closed")`), and reads the fields of those that
carry any. The fields follow the inherited `message` / `stackTrace` / `cause`:

| Exception | Fields |
|---|---|
| `SharedArenaOutOfMemoryError` | `requested_bytes: int`, `arena_capacity_bytes: int` |
| `SharedArenaCorruptedError` | `observed_magic: int` |
| `SharedArenaVersionMismatchError` | `observed_version: int`, `expected_version: int` |
| `AtomicWidthUnsupportedError` | `requested_bits: int` |
| `FinalizerTimeoutError` | `class_name: string`, `timeout_ms: int` |

An arena allocation that cannot be satisfied — `SharedArena.alloc`,
`SharedBuffer.create`, `SharedBuffer.slice`, `Atomic.new`, `Mutex.new`,
`RwLock.new` — raises `SharedArenaOutOfMemoryError` with both fields set. An
instance constructed from a message alone reads `0` / `""` from its fields.
The native lanes have no shared-arena runtime: they raise none of these, and a
native build that constructs one is refused (`E-BUILD-NATIVE`).

---

## §21.22 `core.time` — Instants and Durations

`core.time` holds the portable time values: `Instant` (a point on the UTC wall
clock) and `Duration` (a signed span), both at nanosecond precision, plus
`timeIt` and the async `sleep`. It is a `@mode(host.dual)` module available on
every target; the host-clock companion with guaranteed resolutions and the
blocking `sleepNs` is `system.time` (feature spec `3-stdlib-2-core-time`
Requirement 10). The only host calls are the platform contract's clock slot
(`__loup_system_clock_ns`, `__loup_system_sleep_ns`); everything else —
arithmetic and the ISO-8601 conversions — is Loup.

**Representation (AC-2.1).** Both types hold a value as whole seconds plus a
nanosecond remainder: `secondsPart()` is the FLOOR of the value in seconds and
`nanosPart()` lies in `[0, 1_000_000_000)`, so `-1.5 s` is `(-2, 500_000_000)`.
Two words rather than one nanosecond count, because a single 64-bit nanosecond
count stops at the years 1677 / 2262 while `Instant.fromIso` accepts years 1
through 9999. Every constructor normalizes, so any `(secs, nanos)` pair is
accepted.

**Sign (row DUR-1, amended 2026-10-01).** A `Duration` is signed: every
constructor — the unit factories (`nanoseconds` … `hours`) and the `of*` ones —
accepts either sign, and `minus`, `-` and `durationSince` answer a negative span
when the operands are the other way round (AC-2.6). An API to which a negative
duration means nothing says so at the point of use: `sleep` returns at once, and
a negative `core.waiting` timeout is already expired.

```loup
class Duration implements Add[Duration, Duration], Sub[Duration, Duration],
        Mul[int, Duration], Div[int, Duration], Comparable[Duration], Equatable[Duration] {
  static let ZERO: Duration                       # AC-2.5
  constructor(secs: int, nanos: int)              # any ints; nanos carry into secs
  # Spec unit factories (AC-2.2): any sign (AC-2.6)
  static func nanoseconds(n: int): Duration
  static func microseconds(n: int): Duration
  static func milliseconds(n: int): Duration
  static func seconds(n: int): Duration
  static func minutes(n: int): Duration
  static func hours(n: int): Duration
  # Signed factories
  static func ofNanos(n: int): Duration
  static func ofMicros(us: int): Duration
  static func ofMillis(ms: int): Duration
  static func ofSeconds(s: int): Duration
  static func ofMinutes(m: int): Duration
  static func ofHours(h: int): Duration
  # Representation and accessors (AC-2.4)
  func secondsPart(): int                         # floor seconds
  func nanosPart(): int                           # [0, 1e9)
  func totalNanoseconds(): int                    # exact within about ±292 years
  func totalMilliseconds(): float
  func totalSeconds(): float
  func toMillis(): int                            # truncated toward zero
  get millis(): int                               # toMillis() (was a stored field)
  func toSeconds(): float                         # totalSeconds()
  # Arithmetic (AC-2.3)
  func plus(other: Duration): Duration            # also `+`
  func minus(other: Duration): Duration           # also `-`; may be negative
  func multipliedBy(factor: int): Duration        # also `* int`
  func dividedBy(divisor: int): Duration          # also `/ int`; truncates toward zero
  func negated(): Duration
  func abs(): Duration
  # Predicates and ordering
  func isZero(): bool
  func isNegative(): bool
  func compareTo(other: Duration): int            # `<` `<=` `>` `>=` desugar to it
  operator func ==(other: Duration): bool
}

class Instant implements Add[Duration, Instant], Sub[Instant, Duration],
        Comparable[Instant], Equatable[Instant] {
  constructor(secs: int, nanos: int)              # since the Unix epoch
  static func now(): Instant                      # host WALL clock (realtime), ns where available
  static func epoch(): Instant
  static func fromMillis(ms: int): Instant
  static func fromNanos(ns: int): Instant
  static func fromIso(s: string): Result[Instant, string]   # YYYY-MM-DDTHH:MM:SS[.f+]Z
  func toMillis(): int                            # floor
  func toNanos(): int                             # exact between 1677 and 2262
  func toIso(): string                            # UTC, to the millisecond
  func plus(d: Duration): Instant                 # also `t + d`
  func minus(d: Duration): Instant
  func durationSince(earlier: Instant): Duration  # also `t1 - t0`; signed
  func elapsed(earlier: Instant): Duration        # durationSince
  func isBefore(other: Instant): bool
  func isAfter(other: Instant): bool
  func compareTo(other: Instant): int
  operator func ==(other: Instant): bool
}

func timeIt(action: fn(): void): Duration         # measured on the MONOTONIC clock
async func sleep(d: Duration): Task[void]         # waits at least d; zero/negative returns at once
```

`Instant` has one `-` (instant minus instant → `Duration`); shifting an instant
back is `minus(d)` — a class has one method per operator, so `Sub` cannot be
implemented twice. `Instant.now()` reads the wall clock (the AC-1.1 monotonic
reading is `system.time.monotonicNs()`; `timeIt` uses it). `sleep(d)` is the
platform contract's blocking `sleep_ns` on the interpreters and the Wasm lane,
where `async` runs eagerly; the native lanes refuse a reachable `async`
function at build time (use `system.time.sleepNs`).

**Errors.** `ValueError` from the unit factories on a negative argument;
`fromIso` answers `Err(message)`; `dividedBy(0)` throws as `int` division does.

**Known defect.** `d1 != d2` on two `Duration`s (and `Instant`s) is decided by
object identity on both interpreters, not as the negation of `==` (§1-5; a
compiler defect, not this module's) — write `not (d1 == d2)` until it is fixed.

*Implementation status:* implemented on both interpreters and the native
lanes. Gates: interpreter golden `core_time_ns` (and `core_time_sleep`), Stage0
e2e `loup-runtime/tests/stdlib_port_vb_e2e.rs`, native fixture
`host_native_stdportb_e2e` (+ `loup-cli/tests/native_stdport_e2e.rs`),
`loup-cli/tests/native_time_clocks_e2e.rs`.

---

## §21.23 `core.waiting` — Polling-Based Condition Waiting

`core.waiting` polls a callback (the *looper*) until it answers `true` or a
timeout passes, then gives it ONE final attempt with `ctx.finalAttempt` set
before throwing `TimeoutError` (§1-18.1) with the timing. `WaitContext` is the
wait's configuration and state; `WaitGate` is a flag a waiter blocks on with a
timeout; `WaitingScope` waits for several gates at once. Dual-mode, no
capability. It imports `core.time` (embedded stdlib modules may import one
another, row STDIMP-1), so callers pass their own `Duration`s.

Shape (row WAIT-1): the language has no default arguments, so the spec's
optional parameters are required, in the spec's order — when defaults land
they gain the spec's defaults and existing calls keep compiling; the spec's
trailing `context` parameter is the `…With(looper, context)` variant; an async
looper has its own function (`waitForItAsync`) because one parameter cannot
accept two function types.

```loup
let DEFAULT_WAIT_DELAY: Duration      # 0
let DEFAULT_WAIT_INTERVAL: Duration   # 5 s
let DEFAULT_WAIT_TIMEOUT: Duration    # 60 s

enum WaitState { NotStarted, Running, Completed, TimedOut }

class WaitContext {
  constructor(timeout: Duration)       # interval DEFAULT_WAIT_INTERVAL, delay 0, unnamed, no do-every
  modifier func withInterval(interval: Duration): WaitContext   # builders: mutate and return this
  modifier func withDelay(delay: Duration): WaitContext
  modifier func withWhatFor(whatFor: string): WaitContext
  modifier func withDoEvery(n: int): WaitContext                # n <= 0 disables
  get timeout(): Duration;   get interval(): Duration;  get delay(): Duration
  get whatFor(): Option[string];  get doEvery(): int
  get startTime(): Option[Instant];  get endTime(): Option[Instant];  get nowTime(): Option[Instant]
  get waitState(): WaitState;  get finalAttempt(): bool;  get loopCounter(): int
  get completed(): bool;  get hasTimedOut(): bool;  get elapsed(): Duration
  get isDoEveryInterval(): bool        # doEvery > 0 and loopCounter % doEvery == 0
  modifier func markBegin(): void;  modifier func markComplete(): void;  modifier func markTimeout(): void
  modifier func markTime(): void;   modifier func markFinalAttempt(): void
  modifier func shouldContinue(): bool   # marks the time, counts the loop; Running and not past the deadline
  modifier func extendTimeout(duration: Duration): void   # deadline + duration, finalAttempt cleared, Running
  modifier func reduceDelay(duration: Duration): void     # not below zero
  modifier func continueWaiting(): void
  func formatTimeoutMessage(whatFor: string, detail: list[string]): string
  modifier func createTimeout(whatFor: string, detail: list[string]): TimeoutError   # marks TimedOut
}

async func waitForIt(looper: fn(edits WaitContext): bool, whatFor: string = "",
                     delay: Duration = DEFAULT_WAIT_DELAY, interval: Duration = DEFAULT_WAIT_INTERVAL,
                     timeout: Duration = DEFAULT_WAIT_TIMEOUT): Task[void]   # defaults: ruling DEF-1
async func waitForItWith(looper: fn(edits WaitContext): bool, edits context: WaitContext): Task[void]
async func waitForItAsync(looper: fn(edits WaitContext): Task[bool], whatFor: string = "",
                          delay: Duration = DEFAULT_WAIT_DELAY, interval: Duration = DEFAULT_WAIT_INTERVAL,
                          timeout: Duration = DEFAULT_WAIT_TIMEOUT): Task[void]
async func waitForItAsyncWith(looper: fn(edits WaitContext): Task[bool], edits context: WaitContext): Task[void]
func waitForItSync(looper: fn(edits WaitContext): bool, whatFor: string = "",
                   delay: Duration = DEFAULT_WAIT_DELAY, interval: Duration = DEFAULT_WAIT_INTERVAL,
                   timeout: Duration = DEFAULT_WAIT_TIMEOUT): void
func waitForItSyncWith(looper: fn(edits WaitContext): bool, edits context: WaitContext): void

class WaitGate {
  constructor(message: Option[string], timeout: Option[Duration])
  get message(): Option[string];  get timeout(): Option[Duration]
  modifier func set(): void;  modifier func clear(): void;  func isSet(): bool
  func waitSync(timeout: Option[Duration]): bool        # None: the gate's own; neither: until set
  func waitOrThrowSync(timeout: Option[Duration]): void # TimeoutError "Timeout waiting for gate: <message>"
  async func wait(timeout: Option[Duration]): Task[bool]
  async func waitOrThrow(timeout: Option[Duration]): Task[void]
}

class WaitingScope implements Scoped[WaitingScope] {
  constructor(gates: list[WaitGate])
  func gates(): list[WaitGate]
  func scope_enter(): WaitingScope     # clears every gate
  func scope_exit(error: Option[Any]): bool   # false: an exception propagates
  func waitAllSync(timeout: Option[Duration]): void   # one shared deadline; TimeoutError "Gates not set: a, b"
  async func waitAll(timeout: Option[Duration]): Task[void]
}
```

**Semantics.** A wait sleeps `delay`, marks its start, then loops: call the
looper (true → Completed, return); `shouldContinue()` false → leave the loop;
sleep `interval`. When the deadline has passed it marks the time, sets
`finalAttempt`, calls the looper once more, and on `false` throws
`ctx.createTimeout("", [])` — unless that attempt called `extendTimeout`, which
clears the flag and resumes the loop (Requirement 6). The looper's own
exceptions propagate at once. An empty `whatFor` is "unnamed": the
message names the context's description or "condition" (the spec's derivation
from the looper's name is not implementable — a function value carries no
name). The timeout message is `Timeout waiting for <what>:` then
`    timeout=<s.mmm>s start=<iso> end=<iso> now=<iso> elapsed=<s.mmm>s`, then one
indented line per `detail` entry.

**Blocking.** Every wait blocks the calling thread between polls: the async
forms `await core.time.sleep` (the interpreters and the Wasm lane run async
eagerly), the `Sync` forms and every gate wait call the platform contract's
`sleep_ns` directly; gate waiters look at the flag every millisecond. A
`WaitGate` is a plain flag, task-safe because no lane preempts a task; it is not
`Sendable` — a gate shared between THREADS needs an atomic flag, which the
managed native lanes do not lower yet. The native lanes refuse a reachable
`async` function, so native code uses the `Sync` forms.
The browser refusal of `waitForItSync` (spec Requirement 2.5) is not
implemented: no browser target runtime exists, and `system.env.platform()` is a
host builtin the native lanes cannot link.

**Native lanes.** `WaitContext`, the `Sync` waits, `WaitGate` and
`WaitingScope` compile natively (llvm and the clang-free lane). Cranelift does
not lower the looper's function-typed parameter (loup#546); use
`--backend llvm`.

*Implementation status:* implemented. `TimeoutError` (§1-18.1) is a built-in
exception — constructible and catchable by name, with no import, on every lane
(interpreter golden `timeout_error`; Stage0 native test
`timeout_error_is_a_builtin_exception_natively`). Gates: interpreter golden
`core_waiting` (imports only `core.waiting` — exercises STDIMP-1), Stage0 e2e
`stdlib_port_vb_e2e.rs`, native fixtures `host_native_stdportb_e2e` (waiting bit)
and `host_native_stdimp_e2e` (`core.time` values into and out of
`core.waiting`) on Stage0 llvm, the clang-free lane and the loup-build lane.

---

## §21.24 `net.http` — HTTP Protocol Types and the MVP Server

`net.http` carries the HTTP/1.1 protocol vocabulary of feature spec
`3-stdlib-3-http-server` — `Headers` (Requirement 7), `HttpStatus`
(Requirement 10), `HttpVersion` (Requirement 13), `Request` / `Response`
(Requirements 1, 15, 16, in part) — the wire-format parser and serializer, and a
blocking serial server over `runtime.net()`. Capability-gated like the other
`net.*` modules (not on the browser target). The protocol types and the parser
are pure and dual-mode; `serve` / `handleConnection` need the interpreter's
`net` capability and `system.text`'s host bridge, so the server runs on the
interpreters only. Imports `net.addressing` (query strings) — row STDIMP-1.
`Response.json` takes already-encoded JSON text (row HTTP-1): on the
interpreters pass `system.json.stringify(value)`.

`HttpStatus` and `HttpVersion` are classes with static constants rather than
enums: a Loup enum cannot declare the methods the spec gives them on either
compiler (row HTTP-1). `QueryParams` is `net.addressing.UrlQuery` (§21.25); the
spec's re-export under the name `QueryParams` waits for aliased re-exports
(`pub from m import (X as Y)`), which neither compiler resolves yet.

```loup
func statusReason(code: int): string   # RFC 9110 phrase, or "Unknown"

class HttpStatus implements Equatable[HttpStatus] {
  code: int;  reason: string
  static let CONTINUE, SWITCHING_PROTOCOLS, OK, CREATED, ACCEPTED, NO_CONTENT,
             MOVED_PERMANENTLY, FOUND, SEE_OTHER, NOT_MODIFIED, TEMPORARY_REDIRECT,
             PERMANENT_REDIRECT, BAD_REQUEST, UNAUTHORIZED, FORBIDDEN, NOT_FOUND,
             METHOD_NOT_ALLOWED, CONFLICT, GONE, PAYLOAD_TOO_LARGE, UNPROCESSABLE_ENTITY,
             TOO_MANY_REQUESTS, INTERNAL_SERVER_ERROR, NOT_IMPLEMENTED, BAD_GATEWAY,
             SERVICE_UNAVAILABLE, GATEWAY_TIMEOUT: HttpStatus
  constructor(code: int)
  static func fromCode(code: int): HttpStatus
  func isInformational(): bool;  func isSuccess(): bool;  func isRedirect(): bool
  func isClientError(): bool;    func isServerError(): bool
  func toString(): string        # "200 OK"
  operator func ==(other: HttpStatus): bool   # by code
}

class HttpVersion implements Equatable[HttpVersion] {
  static let HTTP_1_0, HTTP_1_1, HTTP_2, HTTP_3: HttpVersion
  static func fromString(value: string): HttpVersion   # case-insensitive; "HTTP/2.0" = HTTP_2; else ValueError
  func toString(): string        # "HTTP/1.1"
}

class Headers {                  # case-insensitive names, multi-value, original-case spelling
  constructor()
  static func fromDict(fields: dict[string, string]): Headers
  static func fromPairs(fields: list[tuple[string, string]]): Headers
  func get(name: string): Option[string]      # first value
  func getAll(name: string): list[string]
  func set(name: string, value: string): void # the only value; this spelling is kept (7.16)
  func append(name: string, value: string): void
  modifier func delete(name: string): void
  func contains(name: string): bool
  func keys(): list[string];  func values(): list[string]
  func items(): list[tuple[string, string]]   # (name, first value)
  func len(): int;  func copy(): Headers
  func toString(): string        # one "Name: value" line per value
}

class Request {
  method: string                 # upper-cased
  target: string                 # the request target as received
  path: string;  rawQuery: string   # target split at the first "?"; rawQuery still encoded
  version: HttpVersion;  headers: Headers;  body: string
  constructor(method: string, target: string, version: HttpVersion, headers: Headers, body: string)
  get queryParams(): UrlQuery    # parsed once, then the same instance (15.5, 15.18)
  get query(): dict[string, string]   # each key's FIRST value (1.1)
  func header(name: string): Option[string]
  func text(): string;  func contentLength(): int   # UTF-8 bytes
  func toString(): string        # "GET /path"
}

class Response {
  status: int;  contentType: string;  body: string;  headers: Headers
  constructor(status: int, contentType: string, body: string)
  static func text(content: string, status: int = 200): Response    # text/plain; charset=utf-8
  static func json(json: string, status: int = 200): Response       # body = already-encoded JSON
  static func html(content: string, status: int = 200): Response    # text/html; charset=utf-8
  static func empty(status: int = 204): Response
  static func redirect(location: string, status: int = 307): Response   # Location header
  func withHeader(name: string, value: string): Response      # appends; returns this
  get statusObj(): HttpStatus
  func toString(): string        # "200 OK"
}

func ok(body: string): Response;  func html(body: string): Response
func json(body: string): Response;  func notFound(): Response
func status(code: int, body: string): Response
func parseRequest(raw: string): Request
func serializeResponse(resp: Response): string
func handleConnection(sock: TcpSocket, handler: fn(Request): Response): void
func serve(host: string, port: int, handler: fn(Request): Response): void   # never returns
```

**Wire format.** `parseRequest` reads the request line `METHOD TARGET
VERSION`, then the header fields (`Name: value`, surrounding whitespace
trimmed, a repeated name keeps every value, a line without `:` skipped), then
the body after the blank line; CRLF, with bare LF accepted; a missing or unknown
version reads as HTTP/1.1. `serializeResponse` writes the status line, the
`Content-Type` (from `contentType`, when it is non-empty and the headers do
not set one — `Response.empty` / `redirect` have none), every header
field except `Content-Length` / `Connection`, `Content-Length` as the body's
UTF-8 BYTE count, `Connection: close`, and the body. Not yet provided: the
`HttpMethod` enum (the method stays a string), `Cookie`, `MediaType`, `Router`,
`Server` / `ServerConfig`, async handlers, `HttpError`, streaming bodies.

*Implementation status:* the types and the parser on both interpreters and the
native lanes; the server on the interpreters. Gates: interpreter golden
`net_http_types`, Stage0 e2e `stdlib_port_vb_e2e.rs`, native fixture
`host_native_stdportb_e2e`.

---

## §21.25 `net.addressing` — URLs, Hosts and Socket Addresses

Pure parsing and formatting with no I/O and no capability: every type is
available on every target (row ADDR-1 — the feature spec's network-layer gating
of `IpAddr` / `SocketAddr` is per type, and gating is per module). `Url`
follows RFC 3986's generic syntax and keeps its path, query and fragment in
their ENCODED form, so `Url.parse(s).toString()` round-trips; the decoded views
are `pathSegments()` and `queryParams()`. Percent-encoding is `data.query`'s
(§21.26, UTF-8 bytes), which this module imports (row STDIMP-1).

```loup
class AddressingError : Exception { input: string }   # message: "<reason>: <input>"

class IpAddr implements Equatable[IpAddr] {
  static func parse(text: string): IpAddr   # dotted quad (no leading zeros) or RFC 4291 IPv6 text
  static func isValid(text: string): bool
  static func v4(a: int, b: int, c: int, d: int): IpAddr
  func isV4(): bool;  func isV6(): bool
  func octets(): list[int]       # 4 or 16 bytes, network order
  func isLoopback(): bool        # 127/8 or ::1
  func isUnspecified(): bool
  func toString(): string        # IPv6 in RFC 5952 canonical form
}

class SocketAddr implements Equatable[SocketAddr] {
  ip: IpAddr;  port: int
  constructor(ip: IpAddr, port: int)        # AddressingError outside 0-65535
  static func parse(text: string): SocketAddr   # "1.2.3.4:80" or "[::1]:8080"
  func toString(): string
}

class Host implements Equatable[Host] {
  static func parse(text: string): Host     # "[v6]", a dotted quad, or a reg-name (lower-cased)
  get name(): string;  get ip(): Option[IpAddr]
  func isIp(): bool;  func isDomain(): bool
  func toString(): string        # IPv6 bracketed
}

class HostPort implements Equatable[HostPort] {
  host: Host;  port: int
  constructor(host: Host, port: int)
  static func parse(text: string): HostPort # "example.com:443", "[::1]:8080"
  func toString(): string
}

class UrlQuery {                 # ordered decoded (key, value) pairs; keys may repeat
  constructor()
  static func parse(query: string): UrlQuery    # leading "?" skipped; "+" is a space
  func get(key: string): Option[string];  func getAll(key: string): list[string]
  func contains(key: string): bool;  func keys(): list[string]   # distinct, first-appearance order
  func items(): list[tuple[string, string]];  func pairs(): list[tuple[string, string]]
  func len(): int                # distinct keys
  func append(key: string, value: string): void
  modifier func set(key: string, value: string): void    # the only value, at the key's first position
  modifier func remove(key: string): void
  func toString(): string        # form-encoded, no "?"
}

class UrlPath {                  # kept encoded
  constructor(raw: string)
  static func fromSegments(segments: list[string], absolute: bool): UrlPath
  func isAbsolute(): bool
  func segments(): list[string]  # decoded
  func normalize(): UrlPath      # RFC 3986 §5.2.4 remove_dot_segments
  func join(segment: string): UrlPath
  func toString(): string
}

func defaultPort(scheme: string): int   # 80 http/ws, 443 https/wss, 21 ftp, else -1

class Url {
  constructor(scheme: string, userinfo: Option[string], host: Option[Host], port: Option[int],
              path: string, query: Option[string], fragment: Option[string])
  static func parse(text: string): Url      # absolute only; AddressingError otherwise
  get scheme(): string;  get userinfo(): Option[string];  get host(): Option[Host]
  get port(): Option[int];  get path(): string;  get query(): Option[string]
  get fragment(): Option[string]
  func hostName(): string;  func effectivePort(): int
  func urlPath(): UrlPath;  func pathSegments(): list[string];  func queryParams(): UrlQuery
  func origin(): Origin
  func withPath(path: string): Url;  func withQuery(query: string): Url
  func withFragment(fragment: string): Url
  func resolve(reference: string): Url      # RFC 3986 §5.2.2 (strict)
  func toString(): string
  static func encode(component: string): string   # data.query.percentEncode(component, "")
  static func decode(component: string): string   # data.query.percentDecode
}

class Origin implements Equatable[Origin] {
  scheme: string;  host: string;  port: int
  constructor(scheme: string, host: string, port: int)
  static func parse(text: string): Origin
  func toString(): string        # ":port" omitted when it is the scheme's default
}
```

**Errors.** Every parse failure throws `AddressingError` naming the reason and
the input: a missing or invalid scheme, a bad host, a port that is not 1–5
digits or exceeds 65535, an unbracketed IPv6 host where a port follows, two
`::`, an octet out of range or with a leading zero.

*Implementation status:* implemented on both interpreters and the native
lanes. Gates: interpreter golden `net_addressing` (imports only
`net.addressing`, so `data.query` arrives through STDIMP-1), Stage0 e2e
`stdlib_port_vb_e2e.rs`, native fixture `host_native_stdportb_e2e`.

---

## §21.26 `data.query` — Query Strings and Percent-Encoding

A query string is `key=value&key=value` in the
`application/x-www-form-urlencoded` form. Every function works over the UTF-8
BYTES of its input: `%HH` is one byte, so `%C3%A9` decodes to `é` and `é`
encodes to `%C3%A9`; escaped bytes that are not valid UTF-8 decode to U+FFFD.
Pure Loup, dual-mode, every target.

```loup
class QueryParseError : Exception { position: int }   # scalar index of the bad "%"

func percentEncode(s: string, allowed: string): string   # RFC 3986: unreserved + `allowed` ASCII kept; space "%20"
func percentDecode(s: string): string                    # "%HH" a byte; "+" kept
func encodeComponent(s: string): string                  # form: as percentEncode(s, "") but space "+"
func decodeComponent(s: string): string                  # form: "+" a space
func parsePairs(query: string): list[list[string]]       # [[key, value], ...] in order, duplicates kept
func parse(query: string): dict[string, string]          # a repeated key: the LAST value wins
func parseMulti(query: string): dict[string, list[string]]   # every value, in order
func encode(params: dict[string, string]): string        # keys in dict order, no "?"
func encodeMulti(params: dict[string, list[string]]): string # one key=value per value
```

Parsing skips one leading `?`, drops empty pairs (`a=1&&b=2`), and gives a
pair without `=` the empty value. Encoding writes upper-case hex and keeps the
RFC 3986 unreserved characters (`A–Z a–z 0–9 - . _ ~`). Decoding is strict: a
`%` not followed by two hex digits throws `QueryParseError` naming its
position.

*Implementation status:* implemented on both interpreters and the native
lanes. Gates: interpreter golden `data_query`, Stage0 e2e
`stdlib_port_vb_e2e.rs`, native fixture `host_native_stdportb_e2e`.

---

## §21.27 `debug.profiler` — Span Profiler

An in-process INSTRUMENTATION profiler: code marks named spans with
`enter(name)` / `exit()` or `time(name, action)`, and the profiler records per
span name the call count, the TOTAL time (inclusive of nested spans) and the
SELF time (total minus nested spans), and per span PATH (`outer;inner`) the
self time — the folded-stack input of flame-graph tools. The feature spec's
SAMPLING profiler (`Profiler.new(sampleHz)` with timer-driven stack capture)
needs a periodic interrupt and a stack capture no lane provides, so the
report keeps the spec's shape over measured spans instead (row PROF-1).
Dual-mode; time is the monotonic clock in nanoseconds; one profiler per thread
(not synchronized).

```loup
class ProfileSample { name: string; callCount: int; totalNanos: int; selfNanos: int }
class HotEntry { callable: string; selfMs: float; totalMs: float; percentage: float }

class ProfileReport {
  func samples(): list[ProfileSample]     # first-entered order
  func toFlameGraph(): string              # "path selfNanos" lines, paths sorted
  func hotFunctions(n: int): list[HotEntry]   # most self time first (ties by name); % of all self time
}

class Profiler {
  constructor()                           # the host monotonic clock
  static func manual(): Profiler          # a clock that moves only by advanceClock (exact tests)
  modifier func advanceClock(ns: int): void        # no-op on the host clock
  func depth(): int                       # spans entered and not exited
  func enter(name: string): void
  modifier func exit(): void                       # RuntimeError "Profiler.exit: no active span"
  modifier func time(name: string, action: fn(): void): void   # exits even when action throws
  func samples(): list[ProfileSample]     # first-entered order; never-exited spans omitted
  modifier func clear(): void
  modifier func start(): void                      # clear
  func stop(): ProfileReport              # spans still open are not in it
  func report(): string                   # "name: N calls, total=Tns, self=Sns", most total first
}
```

*Implementation status:* implemented on both interpreters and the native
lanes. Gates: interpreter golden `debug_profiler` (manual clock: exact numbers),
Stage0 e2e `stdlib_port_vb_e2e.rs`, native fixture `host_native_stdportb_e2e`.

## §21.28 `core.sensitivity` — Content-Sensitivity Marks

*(v1.21; design rulings MARK-1 and FS-UI, `specs/x-update-v1_20-to-v1_21/design.md`.)*

A `Mark` says how sensitive a piece of content is (`Level`), how long it may be
kept (`Retention`) and why it carries the mark (`Reason`, for audit, never
rendered). It is attached to content, a surface, an input channel or a recall
entry; the Loup Common UI toolkit's signals carry one
(`specs/loup-ui-framework-spec.md`, Part 4 "Sensitivity marks"). The absence of
a mark is `OPEN`. Marks RAISE, never lower: any transform of marked content
carries forward the most restrictive mark of its inputs (Helios design rule
SN-2), and `raise` is that join, so no consumer writes its own. The types and
`OPEN` are exactly Helios's (`specs/helios-content-sensitivity.md` §2 in the
Helios tree), which imports this module instead of keeping its own copy.

The module is `@mode(portable)` (Vol 1 §1-2.4.7): structs, enums, one constant
and pure functions, no heap, so a freestanding unit imports it as a host unit
does (Vol 3 §3-3.20). `OPEN` is a struct constant (Vol 1 §1-6.2, ruling
CONST-AGG-1): compile-time data, every read a copy.

```loup
pub enum Level { Open, Private, Secret }                 # ordered Open < Private < Secret
pub enum Retention { Ephemeral, Session, Persistent }    # ordered Ephemeral < Session < Persistent
pub enum Reason { UserDeclared, SecretInput, Credential, IncognitoScope, PolicyDefault }

pub struct Mark {
    pub let level: Level;
    pub let retention: Retention;
    pub let reason: Reason;
}

pub const OPEN: Mark = Mark(level = Level.Open, retention = Retention.Persistent,
                            reason = Reason.PolicyDefault);

## The most restrictive of two marks: the HIGHER level, the SHORTER retention, and
## the reason of the input with the higher level — of `a` when the levels are equal.
pub func raise(a: Mark, b: Mark): Mark
```

| Level | Meaning |
|---|---|
| `Open` | ordinary content; no restriction |
| `Private` | user-private; not capturable or recallable without an explicit grant |
| `Secret` | credentials and secrets; never persisted, never rendered to a consumer that cannot hold secrets, redacted in every log |

| Retention | Meaning |
|---|---|
| `Ephemeral` | must not outlive the operation that produced it |
| `Session` | dropped at session end |
| `Persistent` | may be retained, subject to the level |

`raise` is idempotent (`raise(m, m) == m`), `OPEN` is its unit on the right
(`raise(m, OPEN) == m`), and neither input's level nor retention is ever
weakened. `Mark` compares structurally (`==`, Vol 1 §1-3.x).

*Implementation status:* implemented on both interpreters, the managed native
lanes and the three freestanding routes. Gates: `loup test`
`source/stdloup/tests/core_sensitivity_test.lpscr` (the self-hosted runner and
Stage0's `test --file`); the FS-UI fixture `tests/freestanding_qemu/core_sensitivity`
(a freestanding unit importing this module and a `@mode(portable)` stand-in for
a `loup.ui` module, on x86_64 QEMU: Stage0 LLVM, Stage0 → loup-llvm → loup-llbe,
and the self-hosted `loup build --backend llbe`).

---

## Appendix A: Error and Exception Reference

The shared-memory subsystem introduces the following error codes (compile-time)
and exception types (runtime):

**Shared-memory and ownership errors (v1.18, Language Reference §1-8, §2-2):**

Compile-time:

| Code | Condition |
|---|---|
| `E_SHARED_FIELD_NOT_SHAREABLE` | Field in `shared class` has non-`Shareable` type |
| `E_UNIQUE_SHARED` | `unique` and `shared` modifiers combined on a class |
| `E_SHARED_DYNAMIC` | `dynamic` and `shared` modifiers combined on a class |
| `E_CLASS_KIND_MISMATCH` | Generic type argument violates a class-kind bound |
| `E_SHAREABLE_LOCAL_CLASS` | `local class` explicitly declares `implements Shareable` |
| `E_SHAREABLE_DERIVATION_FAILED` | `implements Shareable` on type not satisfying derivation |
| `E_INVALID_ATOMIC_ORDERING` | Static-invalid `Ordering` argument (e.g., `Relaxed` for a fence) |
| `E_ATOMIC_WIDTH_UNSUPPORTED` | Atomic op at width unsupported by target ISA |
| `E_ARENA_NOT_SHARED` | `ScriptWorker.detach` on arena not currently attached |
| `E_PARSE_DUAL_STRATEGY` | Class declaration combines `local` and `shared` modifiers |
| `E_SHARED_ON_LOCAL` | `shared` constructor prefix applied to a `local class` type |
| `E_SHARED_MISSING_PREFIX` | `shared class` constructor called without `shared` prefix |
| `E_FREESTANDING_WEAK` | `weak` reference used in `@mode(freestanding)` |
| `E_GUARD_RELEASED` | Use of a `MutexGuard` / `RwReadGuard` / `RwWriteGuard` after explicit `release()` |

Runtime:

| Exception | Thrown when |
|---|---|
| `SharedAllocatorUnavailableError` | Shared allocation on a target without arena support |
| `SharedArenaOutOfMemoryError` | An arena cannot satisfy an allocation; carries `requested_bytes`, `arena_capacity_bytes` (§21.21) |
| `SharedArenaCorruptedError` | Arena header magic/version mismatch at attach time |
| `SharedArenaVersionMismatchError` | Arena ABI version unsupported by attaching toolchain |
| `AtomicWidthUnsupportedError` | Atomic width unsupported at runtime |
| `PoisonedLockError` | Lock acquired after prior holder panicked |
| `QueueClosedError` | Send/receive on a closed `SharedQueue` |
| `ResurrectionError` | Finalizer stored `this` in a reachable location |
| `FinalizerTimeoutError` | Finalizer exceeded implementation-defined time limit |
| `WorkerArenaNotAttachedError` | `sendRef` target worker lacks the referenced arena |
| `DefaultArenaAlreadyInitializedError` | `configureDefaultSharedArena` called after first allocation |
| `ReleasedGuardError` | Use of a released guard (dynamically detected cases) |

These twelve are built-in exception classes (§21.21): each is catchable by its
own name; the field-carrying ones are listed there.

**Serialization errors (v1.18, Language Reference §4-1.13):**

Compile-time:

| Code | Condition |
|---|---|
| `E_FIELD_NOT_SERIALIZABLE` | Field type not `Serializable` (no `@serialVia`, no `@skip`) |
| `E_FIELD_NOT_DESERIALIZABLE` | Field type not `Deserializable` (no `@serialVia`, no `@skip`) |
| `E_SKIP_NO_DEFAULT` | `@skip` on field without default |
| `E_SKIP_BOTH` | `@skip` and `@skipIfDefault` on same field |
| `E_SERIAL_URI_COLLISION` | Duplicate `@serializationId` |
| `E_SERIAL_URI_MALFORMED` | `@serializationId` fails canonical format |
| `E_ADAPTER_TYPE_MISMATCH` | `@serialVia[Adapter]` T mismatch |
| `E_OPEN_NOT_ENUM` | `@open` on non-enum |
| `E_TAGGED_CONFLICT` | Both `@polymorphic` and `@tagged` |
| `E_MIGRATE_FROM_SAME_URI` | `@migrateFrom` self-reference |

Runtime:

| Exception | Thrown when |
|---|---|
| `SerializationError` | `toValue` invariant violation (cycle, adapter failure) |
| `DeserializationError` | Malformed input, schema mismatch, range overflow |
| `UnknownTypeError` | Unknown URI (non-`RemoteException` polymorphism) |
| `CauseTruncatedException` | Exception cause chain truncated at depth limit |
| `UnknownEnumVariant` | Unknown variant in `@open` enum |
| `SecurityError` | Forbidden deserialization (e.g., `SystemExit`) |

**v1.20 numerical errors (Language Reference §1-4.1.6, §1-4.10, §4-2.4):**

Compile-time:

| Code | Condition |
|---|---|
| `E_COMPLEX_NOT_ORDERED` | Ordering operator (`<`, `<=`, `>`, `>=`) applied to a complex value (Language Reference §1-4.1.6) |
| `E_COMPLEX_PRECISION_MISMATCH` | Binary arithmetic combines `complex32` and `complex64` without explicit conversion (§1-4.1.6) |
| `E_COMPLEX_LITERAL_KIND_MISMATCH` | Mixed `complex32` / `complex64` literals in a single literal expression (§1-3.6) |
| `E_FREESTANDING_COMPLEX_TRANSCENDENTAL` | Complex transcendental function call in `@mode(freestanding)` without an explicitly-linked math runtime (§1-4.1.6, §3-3.3) |
| `E_ARRAY_RANK_RANGE` | `array[T, rank]` with rank outside 1–7 (§1-4.10) |
| `E_ARRAY_INDEX_OUT_OF_RANGE` | Index expression outside the array's bounds for the relevant axis (§1-4.10) |
| `E_ARRAY_SHAPE_MISMATCH` | Whole-array operation between arrays of statically-incompatible shapes (§1-4.10) |
| `E_ARRAY_SIZE_LIMIT` | Statically-known total size exceeds configured per-allocation limit (§1-4.10) |
| `E_ARRAY_BASE_RANGE` | `base` parameter is not 0 or 1 (§1-4.10) |
| `E_ARRAY_ORDER_MISMATCH` | Method called on an array with the wrong `order` (e.g., a Fortran-only routine called on `RowMajor`) (§1-4.10) |
| `E_ARRAY_NOT_ORDERED` | Ordering-dependent operation (`min`, `max`, `argmin`, `argmax`, `sort`) applied to an array of an unordered element type, e.g. `array[complex64, _]` (§1-4.10) |
| `E_ARRAY_AXIS_RANK_TOO_LOW` | Axis-reduction operation called on a rank-1 array (result rank would degenerate to 0); use the scalar reduction form instead (§21.10.3) |
| `E_ARRAY_SCALAR_NEGATIVE_BASE_1` | Negative scalar index applied to a `base: 1` array (§1-4.10) |
| `E_ARRAY_INDEX_STEP_ZERO` | Slice step value of 0 (§1-5.9) |
| `E_ARRAY_SECTION_RANK_EXCEEDED` | Array section expression yields a result rank exceeding 7 (§1-5.9) |
| `E_INTERCHANGE_ARRAY_SHAPE_MISMATCH` | `Encoding.Array` `shape:` does not match the field's `array[T, rank]` rank, or computed byte size mismatches declared `len:` (§4-2.4) |
| `E_INTERCHANGE_ARRAY_RANK_EXCEEDED` | `Encoding.Array` declares more than 7 dimensions (§4-2.4) |
| `E_INTERCHANGE_ARRAY_ELEMENT_INCOMPATIBLE` | `Encoding.Array` `element:` encoding incompatible with the array's element type (§4-2.4) |
| `E_FOR_CONCURRENT_BREAK_CONTINUE` | `break` or `continue` inside a `for concurrent` body (§2-1.11) |
| `E_FOR_CONCURRENT_STRATEGY_NOT_AVAILABLE` | `@strategy(...)` used in a mode that does not support that strategy (§2-1.11) |

Runtime:

| Exception | Thrown when |
|---|---|
| `ArrayShapeError` | Operation on `array[T, rank]` violates shape contract; carries `kind: ArrayShapeErrorKind` (§21.10.5) |
| `ArrayIndexError` | Out-of-range indexing on `array[T, rank]`; carries `arrayShape`, `index`, `axis` (§21.10.5) |
| `ComplexArithmeticError` | Mathematically-undefined complex transcendental result (e.g., `clog(0)`) (§21.9.6) |
| `ConcurrentIterationError` | `for concurrent` (Language Reference §2-1.11) iteration body raised an exception; carries `iterationIndex: list[int]` and the original exception as `cause` |
| `IntegerDivisionError` | Integer division or modulo by zero in scripted/compiled mode and on checked native paths (Language Reference §1-5.1, §1-18.1) |

All runtime exceptions extend the standard `Exception` hierarchy (Language
Reference §1-18) and participate in `try`/`catch`.

---

## Appendix B: Wasm Opcode Mapping

*(This appendix is non-normative.)*

The following table shows how `core.atomic` functions lower to Wasm threads
proposal opcodes on Wasm targets:

| Loup function (32-bit variant) | Wasm opcode |
|---|---|
| `atomicLoad[int32]` | `i32.atomic.load` |
| `atomicLoad[int16]` sign-ext | `i32.atomic.load16_s` |
| `atomicLoad[int16]` zero-ext | `i32.atomic.load16_u` |
| `atomicLoad[int8]` sign-ext | `i32.atomic.load8_s` |
| `atomicLoad[int8]` zero-ext | `i32.atomic.load8_u` |
| `atomicStore[int32]` | `i32.atomic.store` |
| `atomicStore[int16]` | `i32.atomic.store16` |
| `atomicStore[int8]` | `i32.atomic.store8` |
| `fetchAdd[int32]` | `i32.atomic.rmw.add` |
| `fetchSub[int32]` | `i32.atomic.rmw.sub` |
| `fetchAnd[int32]` | `i32.atomic.rmw.and` |
| `fetchOr[int32]` | `i32.atomic.rmw.or` |
| `fetchXor[int32]` | `i32.atomic.rmw.xor` |
| `exchange[int32]` | `i32.atomic.rmw.xchg` |
| `compareExchange[int32]` | `i32.atomic.rmw.cmpxchg` |
| `wait[int32]` | `memory.atomic.wait32` |
| `notify` | `memory.atomic.notify` |
| `fence` | `atomic.fence` |

64-bit variants use the `i64.atomic.*` opcode family. Narrow RMW operations
(8-bit, 16-bit) use the `i32.atomic.rmwN.*_u` variants. Float atomics
(`float32`, `float64`) are implemented by bit-casting to `i32` / `i64`
respectively, performing the atomic operation, and bit-casting back.

Complex types (`complex32`, `complex64`) are not atomically representable
on Wasm — their natural width (8 or 16 bytes) exceeds the single-instruction
atomic capabilities of the Wasm threads proposal, and `Atomic[complex32]`
/ `Atomic[complex64]` is `E_ATOMIC_COMPLEX` at compile time (§21.2.3).
Use a `Mutex` around a complex-typed cell instead.

---

## Appendix C: Native Atomic Mapping

*(This appendix is non-normative.)*

On native targets, `core.atomic` functions lower to the target's native
atomic instructions. The table below shows representative lowerings for
three major architectures:

| Loup function (32-bit variant) | x86-64 | ARM64 | C11 equivalent |
|---|---|---|---|
| `atomicLoad(SeqCst)` | `MOV; MFENCE` | `LDAR` | `atomic_load_explicit(_, memory_order_seq_cst)` |
| `atomicLoad(Acquire)` | `MOV` | `LDAR` | `atomic_load_explicit(_, memory_order_acquire)` |
| `atomicLoad(Relaxed)` | `MOV` | `LDR` | `atomic_load_explicit(_, memory_order_relaxed)` |
| `atomicStore(SeqCst)` | `XCHG` | `STLR; DMB ISH` | `atomic_store_explicit(_, _, memory_order_seq_cst)` |
| `atomicStore(Release)` | `MOV` | `STLR` | `atomic_store_explicit(_, _, memory_order_release)` |
| `fetchAdd` | `LOCK XADD` | `LDADDAL` (v8.1) or LL/SC | `atomic_fetch_add_explicit` |
| `compareExchange` | `LOCK CMPXCHG` | `CASAL` (v8.1) or LL/SC | `atomic_compare_exchange_strong_explicit` |
| `wait` | futex (Linux) / `WaitOnAddress` (Win) / `__ulock_wait` (macOS) | same | `pthread_cond_timedwait` (higher-level) |
| `notify` | futex wake / `WakeByAddress*` / `__ulock_wake` | same | `pthread_cond_signal`/`_broadcast` |
| `fence(SeqCst)` | `MFENCE` | `DMB ISH` | `atomic_thread_fence(memory_order_seq_cst)` |

ARM64 with ARMv8.0 (lacking LSE extensions) lowers RMW operations to
LL/SC (`LDXR`/`STXR`) retry loops. ARMv8.1+ uses the atomic instructions
directly (`LDADDAL`, `CASAL`, etc.) for better scalability under contention.

On freestanding targets where no OS is available, `wait` / `notify` use
WFE/SEV instructions on ARM (with a fallback to busy-wait on architectures
without event signalling) or `MONITOR`/`MWAIT` on x86.

Complex types (`complex32`, `complex64`) are not mapped here — their
natural width (8 or 16 bytes) exceeds the single-instruction atomic
capabilities of x86-64 and ARM64 base ISAs (x86-64 has `CMPXCHG16B` for
16-byte compare-exchange but no general 16-byte RMW; ARM64 has `LDXP`/`STXP`
for 16-byte LL/SC but no 16-byte RMW atomics). `Atomic[complex32]` /
`Atomic[complex64]` is `E_ATOMIC_COMPLEX` at compile time (§21.2.3); use a
`Mutex` around a complex-typed cell instead.
---

## Appendix D: ECS and Game Engine Patterns

*(This appendix is non-normative. It documents idiomatic compositions of
Loup primitives for real-time interactive programs — game engines,
simulation tools, visualisation systems, and editor viewports. The
primitives themselves are normatively specified in their referenced
sections; this appendix shows how they combine.)*

### D.1 Motivation

Real-time interactive programs share three structural requirements that
mainstream programming-language defaults do not satisfy:

1. **Dense, cache-friendly data layout.** Per-frame iteration over
   thousands of game entities benefits substantially from contiguous
   arrays of components rather than per-entity object graphs. Linked
   structures with one allocation per entity are 5–50× slower in
   throughput-bound inner loops.

2. **Race-free parallel scheduling.** Multi-core utilisation requires
   running many systems concurrently, but a system writing to a position
   component while another reads it produces a data race. Static
   guarantees about which systems can run in parallel are far more
   reliable than runtime borrow checks or developer discipline.

3. **Iterative development at runtime.** Editor workflows reload
   gameplay code while a scene is paused; live-coding tools modify
   simulation parameters while data is in flight. Restarting the
   process is a productivity tax these programs cannot afford.

The standard architectural answer to (1) and (2) is an **entity component
system (ECS)**: entities are integer ids, components are values stored in
columnar tables, and systems are functions over component queries. ECS
implementations exist for Unity (DOTS), Unreal (Mass Entity), Bevy
(Rust), Flecs (C), and many smaller projects. Each reinvents some pieces
of the runtime that Loup's language and stdlib already provide directly.

The standard architectural answer to (3) is **dynamic compilation plus
state preservation**. Loup's `runtime.compile` (§2-5.1) provides the
dynamic-compilation half today; full hot module replacement (§1-22)
will provide the state-preservation half in a future revision.

This appendix shows how Loup v1.20 primitives compose to address (1) and
(2) with compile-time guarantees, and how the resulting ECS layer
integrates with `native.window`, `native.audio`, and the rasterization
API to form a complete engine main loop.

### D.2 Component Storage

A **component** is a plain-data record describing one aspect of an
entity — position, velocity, sprite, health, AI state. For dense
storage, components are held in `SharedArray[T]` indexed by an internal
column position; the entity's identity is a separate integer that maps
into the column via an indirection table.

```loup
@mode(host.native)

from core import (SharedArray, SharedBuffer, SharedArena, Shareable)

# Components are structs with Shareable fields. The Shareable bound
# makes them automatically derivable for SharedArray storage and
# safely transferable to worker threads (§21.1).
struct Position implements Shareable {
  let x: float32
  let y: float32
  let z: float32
}

struct Velocity implements Shareable {
  let x: float32
  let y: float32
  let z: float32
}

struct Sprite implements Shareable {
  let textureId: uint32       # index into a separate texture cache
  let frame: uint16
  let layer: uint16
}

struct Health implements Shareable {
  let current: int32
  let maximum: int32
}
```

Each component type backs into a `SharedArray[T]` allocated from a
project-wide `SharedArena`. The arena provides O(1) allocation and the
arena-relative offset semantics that make `SharedRef[T]` cheap to copy
across threads (§21.1.4, §21.1.5).

```loup
let arena = SharedArena.create(capacityBytes: 64.MiB)

let positions  = SharedBuffer[Position].create(elementCount: 65536, arena: arena)
let velocities = SharedBuffer[Velocity].create(elementCount: 65536, arena: arena)
let sprites    = SharedBuffer[Sprite].create(elementCount: 65536, arena: arena)
let healths    = SharedBuffer[Health].create(elementCount: 65536, arena: arena)
```

### D.3 Archetype Tables

An **archetype** is the set of component types an entity has. Entities
with identical component sets share an archetype; iterating over
entities with components `(Position, Velocity)` means iterating over
all archetypes whose component set is a superset of `{Position,
Velocity}`.

`unique class` (§3-2.4.7) is the natural archetype container: each
archetype owns its component arrays exclusively, and the compiler
proves no two archetype objects alias each other's storage.

```loup
unique class Archetype : Any {
  pub let id: uint64
  pub let componentTypes: list[string]   # ["Position", "Velocity", "Sprite"]
  pub let count: int                     # live entities in this archetype

  # Each archetype holds SharedRefs into the arena-backed storage.
  # The SharedArray dimensions track `count`, which mutates as entities
  # are added or removed.
  pub var positions:  SharedRef[SharedArray[Position]]?
  pub var velocities: SharedRef[SharedArray[Velocity]]?
  pub var sprites:    SharedRef[SharedArray[Sprite]]?
  pub var healths:    SharedRef[SharedArray[Health]]?

  # Entity ids of the rows in this archetype, parallel to component arrays.
  pub var entityIds: SharedRef[SharedArray[uint64]]

  pub static func new(id: uint64, componentTypes: list[string],
                      capacity: int, arena: SharedRef[SharedArena]): Archetype { ... }
}
```

The world holds a collection of archetypes plus an indirection from
entity id to (archetype id, row index):

```loup
class EntityLocation implements Shareable {
  let archetypeId: uint64
  let row: int
}

class World : Any {
  let arena: SharedRef[SharedArena]
  var archetypes: dict[uint64, Archetype]
  var entityLocations: dict[uint64, EntityLocation]
  var nextEntityId: SharedRef[Atomic[uint64]]
}
```

### D.4 System Scheduling

A **system** is a function that runs once per frame against entities
matching a component query. The system's parameter list declares both
the components it touches and its access mode through Loup's ownership
verbs (§3-2.4.9):

```loup
# Movement system: reads Velocity, edits Position.
# The verbs encode the access pattern at the type level. The scheduler
# uses them to prove that this system and any other system whose
# edit-set is disjoint can run in parallel.
func movementSystem(
    reads vels:  SharedArray[Velocity],
    edits poses: SharedArray[Position],
    dt: float32,
): void {
  # Loop is data-parallel: each row touches only its own column,
  # and reads-vs-edits separation guarantees no aliasing.
  for concurrent (let i in 0..poses.length) {
    let v = vels.get(i)
    let p = poses.get(i)
    poses.set(i, Position(
      x: p.x + v.x * dt,
      y: p.y + v.y * dt,
      z: p.z + v.z * dt,
    ))
  }
}

# Damage tick: edits Health (only). Trivially parallel with movementSystem
# because the edit sets {Position} and {Health} are disjoint.
func damageTickSystem(edits hps: SharedArray[Health], damagePerSec: int32, dt: float32): void {
  let lossPerTick: int32 = (cast[float32](damagePerSec) * dt).round() as int32
  for concurrent (let i in 0..hps.length) {
    let h = hps.get(i)
    hps.set(i, Health(current: h.current - lossPerTick, maximum: h.maximum))
  }
}
```

**Compile-time scheduling**. Given a list of systems and their declared
verb signatures, a scheduler can partition them into parallel-safe
batches at build time. The rule is straightforward: two systems are
parallel-compatible iff their `edits` sets are disjoint, no `edits`
component of one appears as `reads` in the other, and no `takes`
parameter is shared.

```loup
# Build-time scheduler (sketch). Walks the registered system list,
# extracts verb-typed parameters via core.reflect at @entry initialisation,
# and produces an execution order. Systems within a "layer" run in
# parallel via for concurrent; layers run sequentially.
class Scheduler : Any {
  pub static func build(systems: list[SystemDescriptor]): list[list[SystemDescriptor]] { ... }
}
```

The `distinct()` contract (§3-2.4.10) handles the case where a system
takes two arrays of the same component type — e.g., a collision response
system reading one set of positions and editing another:

```loup
func collisionResponse(
    reads queriers: SharedArray[Position],
    edits targets:  SharedArray[Position],
) requires distinct(queriers, targets): void {
  # The requires-clause asserts that queriers and targets refer to
  # disjoint storage. Caller acknowledges this at the call site.
  ...
}
```

A system that violates verb declarations — for example, attempting to
`set` on a `reads` parameter — fails compilation with `E_READS_MUTATION`.
This is the load-bearing safety guarantee: every system that compiles
is provably free of intra-frame data races on the components it
declares.

### D.5 Entity Id Allocation

Entity ids are minted from a process-wide atomic counter. `Atomic[uint64]`
(§21.2.3) provides lock-free fetch-add semantics; thousands of entities
per frame can be created across worker threads without contention.

```loup
class World : Any {
  let nextEntityId: SharedRef[Atomic[uint64]]

  pub func createEntity(): uint64 {
    return self.nextEntityId.fetchAdd(1, Ordering.Relaxed)
  }
}
```

`Ordering.Relaxed` is sufficient because the id is a monotonic counter
whose ordering relative to other memory operations is irrelevant; only
the increment itself must be atomic.

For programs that recycle ids (long-running simulations where ids would
overflow `uint64` over decades — typically only an issue for educational
edge cases), a free list backed by `SharedQueue[uint64]` (§21.3.6)
handles return-to-pool with the same lock-free semantics.

### D.6 Worked Example: Minimal ECS Core

The following code listing assembles the pieces from D.2–D.5 into a
working (if compact) ECS. It is intentionally simplified — production
implementations would add archetype migration on component add/remove,
sparse-set indexing for fast component-presence checks, and tag
components — but the structure shows how Loup primitives compose.

```loup
@mode(host.native)

namespace engine.ecs

from core import (SharedArray, SharedBuffer, SharedArena, SharedRef, Atomic, Ordering, Shareable)

# Component trait — every component implements this for runtime registration.
interface Component : Shareable {
  static func componentName(): string
}

# World holds the arena, all archetypes, and the entity-location map.
class World : Any {
  let arena: SharedRef[SharedArena]
  var archetypes: dict[uint64, Archetype]
  var entityLocations: dict[uint64, EntityLocation]
  let nextEntityId: SharedRef[Atomic[uint64]]
  let nextArchetypeId: SharedRef[Atomic[uint64]]

  pub static func new(arenaCapacityBytes: int = 64.MiB): World {
    return World(
      arena: SharedArena.create(capacityBytes: arenaCapacityBytes),
      archetypes: {},
      entityLocations: {},
      nextEntityId: SharedRef.new(Atomic[uint64].new(1)),
      nextArchetypeId: SharedRef.new(Atomic[uint64].new(1)),
    )
  }

  pub func createEntity(): uint64 {
    return self.nextEntityId.fetchAdd(1, Ordering.Relaxed)
  }

  pub func destroyEntity(id: uint64): void {
    if (let loc = self.entityLocations[id]) {
      # Swap-remove from the archetype's row arrays
      let arch = self.archetypes[loc.archetypeId]
      arch.removeRow(loc.row, self.entityLocations)
      self.entityLocations.remove(id)
    }
  }
}

# Per-archetype storage. unique class proves single ownership of
# the component arrays.
unique class Archetype : Any {
  pub let id: uint64
  pub let componentTypes: list[string]
  pub var count: int
  pub var entityIds: SharedRef[SharedArray[uint64]]
  # Component arrays addressed by componentTypes name; in production
  # this is a small flat array of SharedRefs, not a dict.
  pub var componentArrays: dict[string, SharedRef[SharedArray[Any]]]

  pub func addRow(entityId: uint64, components: dict[string, Any]): int {
    let row = self.count
    self.entityIds.set(row, entityId)
    for (let (name, value) in components) {
      let arr = self.componentArrays[name]
      arr.set(row, value)
    }
    self.count += 1
    return row
  }

  pub modifier func removeRow(row: int, entityLocations: dict[uint64, EntityLocation]): void {
    # Swap-remove: copy the last row into the freed slot, decrement count.
    let last = self.count - 1
    if (row != last) {
      let movedEntity = self.entityIds.get(last)
      self.entityIds.set(row, movedEntity)
      for (let arr in self.componentArrays.values()) {
        arr.set(row, arr.get(last))
      }
      # Update the moved entity's location to its new row
      entityLocations[movedEntity] = EntityLocation(archetypeId: self.id, row: row)
    }
    self.count -= 1
  }
}

struct EntityLocation implements Shareable {
  let archetypeId: uint64
  let row: int
}
```

### D.7 Worked Example: MVP Engine Main Loop

The following is a complete minimal engine main loop combining the ECS
of §D.6, the `native.window` API (§21.35), the rasterization API
(§21.29), and `native.audio` (§21.36). It opens a window, configures a
WebGPU swap chain, advances a tiny simulation, draws each frame, and
handles input — about 120 lines.

```loup
@mode(host.native)

from native.window import (createWindow, WindowConfig, pollEvent, Event, Key)
from native.webgpu import (
  GpuDevice, GpuSurfaceConfiguration, GpuTextureFormat, GpuPresentMode,
  GpuRenderPassDescriptor, GpuColorAttachment, GpuLoadOp, GpuStoreOp,
)
from native.audio import (AudioContext, AudioBuffer, StreamingSourceConfig, StreamingSourceFrom)
from engine.ecs import (World, Position, Velocity)
from core import (SharedArray)

async func main(): Task[void] {
  runtime.configure(RuntimeConfig(asyncExecutor: ExecutorConfig.MultiThreaded))

  # ----- Window and rendering -----
  let window = createWindow(WindowConfig(
    title: "Loup Engine MVP",
    width: 1280,
    height: 720,
  ))
  let surface = window.nativeSurface()
  let device = await GpuDevice.request()
  var surfaceFormat = GpuTextureFormat.Bgra8Unorm
  surface.configure(GpuSurfaceConfiguration(
    device: device,
    format: surfaceFormat,
    width: window.width,
    height: window.height,
    presentMode: GpuPresentMode.Fifo,
  ))

  # ----- Audio -----
  let audio = await AudioContext.create()
  let musicBus = audio.createBus("music")
  musicBus.connect(audio.masterBus)
  let music = audio.createStreamingSource(StreamingSourceConfig(
    source: StreamingSourceFrom.File("assets/ambient.ogg"),
  ))
  music.connect(musicBus)
  music.loop = true
  music.play()

  # ----- ECS -----
  let world = World.new(arenaCapacityBytes: 32.MiB)
  # ... populate `world` with archetypes and entities ...

  # ----- Frame timing -----
  var lastFrameNs: int = core.time.monotonicNs()
  var running: bool = true

  while (running) {
    # Input
    while (let ev = pollEvent()) {
      match ev {
        Event.CloseRequested(_) => { running = false }
        Event.Resized(_, w, h) => {
          surface.configure(GpuSurfaceConfiguration(
            device: device, format: surfaceFormat, width: w, height: h,
            presentMode: GpuPresentMode.Fifo,
          ))
        }
        Event.KeyDown(_, key: Key.Escape, _, _, _) => { running = false }
        _ => {}
      }
    }

    # Simulation step
    let nowNs = core.time.monotonicNs()
    let dt: float32 = cast[float32](nowNs - lastFrameNs) / 1_000_000_000.0
    lastFrameNs = nowNs

    runSystems(world, dt)

    # Render
    let frame = surface.getCurrentTexture()
    let encoder = device.createCommandEncoder()
    let pass = encoder.beginRenderPass(GpuRenderPassDescriptor(
      colorAttachments: [GpuColorAttachment(
        view: frame.view,
        loadOp: GpuLoadOp.Clear,
        storeOp: GpuStoreOp.Store,
        clearValue: [0.05, 0.07, 0.12, 1.0],
      )],
    ))
    drawWorld(pass, world)
    pass.end()
    device.queue.submit([encoder.finish()])
  }

  # Cleanup is automatic via Closeable / ARC, but explicit close for clarity:
  music.stop()
  await audio.suspend()
  audio.close()
  surface.unconfigure()
  surface.close()
  device.close()
  window.close()
}

# `runSystems` invokes registered systems in their scheduled order. A
# production implementation reads the Scheduler.build() output from §D.4.
# Here we sketch the simplest sequential form.
func runSystems(world: World, dt: float32): void {
  for (let arch in world.archetypes.values()) {
    if (let vels = arch.componentArrays["Velocity"]) {
      if (let poses = arch.componentArrays["Position"]) {
        # Reinterpret the type-erased SharedArray[Any] as the typed form.
        # In a production engine this lookup is replaced by typed accessors.
        movementSystem(
          reads:  reinterpret[SharedArray[Any], SharedArray[Velocity]](vels.deref()),
          edits:  reinterpret[SharedArray[Any], SharedArray[Position]](poses.deref()),
          dt:     dt,
        )
      }
    }
  }
}

func movementSystem(
    reads vels:  SharedArray[Velocity],
    edits poses: SharedArray[Position],
    dt: float32,
): void {
  for concurrent (let i in 0..poses.length) {
    let v = vels.get(i)
    let p = poses.get(i)
    poses.set(i, Position(
      x: p.x + v.x * dt,
      y: p.y + v.y * dt,
      z: p.z + v.z * dt,
    ))
  }
}

func drawWorld(pass: GpuRenderPassEncoder, world: World): void {
  # Set pipeline, vertex/index buffers, bind groups for camera + atlas,
  # then issue drawIndexedInstanced for each archetype that has a Sprite
  # column. Pipeline construction is omitted — see §21.29 Render Pipeline.
  ...
}
```

The code shows several Loup-specific properties:

- **One source, three targets.** This file is `@mode(host.native)`, but
  porting it to `@mode(web.compiled)` requires replacing
  `native.window.createWindow` with browser canvas acquisition and the
  surface creation with `GpuSurface.fromCanvas(canvasId)`. The audio,
  rendering, and ECS code is identical across targets. A `@mode(host.dual)`
  variant produces both AOT and JIT builds from the same source.

- **Compile-time race freedom.** The `movementSystem` function declares
  `reads vels` and `edits poses` — the compiler verifies that the function
  body does not write through `vels` and that no two concurrent invocations
  of `movementSystem` could observe the same `poses` array. Adding a
  second system that also `edits poses` and trying to run them in parallel
  would be flagged at scheduler construction time.

- **Portal-debuggable.** Every named function in this listing is an
  implicit portal at entry (§1-6.7). A `loup debug` session can activate
  `engine.ecs.movementSystem`, capture the parameter values across many
  invocations, and step backward through frames via the time-travel ring
  buffer (§2-5.3) to diagnose simulation glitches.

- **Hot-reload-ready.** Replacing the `movementSystem` body via
  `runtime.compile` (§2-5.1) — feeding a new source string into a JIT
  module load — is the v1.20 form of HMR. Full atomic-swap HMR (§1-22)
  will extend this to in-place implementation replacement without
  re-pointering call sites.

### D.8 Further Reading

- **Ownership verbs and disjointness contracts:** §3-2.4.9, §3-2.4.10.
- **Structured concurrency and work-stealing:** §2-1.9 (multi-threaded
  executor), §2-1.11 (`for concurrent`).
- **Shared-memory primitives:** §21.1 (this document).
- **Time-travel debug:** §2-5.3 (Runtime volume), §3-3.25
  (Compilation volume, freestanding variant).
- **Native windowing and audio:** §21.35, §21.36
  ([Loup Packages Reference](loup-packages-reference-v1_12.md)).
- **Rendering pipeline:** §21.29 ([Loup Packages Reference](loup-packages-reference-v1_12.md)).
