# Loom Standard Library Reference v1.18

**Status:** Release
**Version:** 1.18.0
**Date:** 2026-04-20
**Supersedes:** 1.10.0 (placeholder)
**Scope:** Standard-library modules that ship with the Loom runtime — no
  `loom install` required. Types, functions, and classes in this document
  are available in every execution mode except where a mode restriction is
  explicitly noted.

**Related documents:**
- [Loom Language Reference v1.18](loom-language-reference-v1_18.md)
- [Loom Packages Reference v1.11](loom-packages-reference-v1_11.md)

**Note.** This document specifies the stdlib surface normatively introduced
by v1.18 — specifically the shared-memory concurrency primitives (§17b of
the Language Reference) and the serialization foundation (§32 of the
Language Reference). Existing stdlib modules (`core` primitives, `data.*`,
`io.*`, `net.*`, `sync.*` thread primitives, `web.*`, `ui.*`, `native.*`,
`lang.*`, `debug.*`, `structures.*`) are specified in the Language Reference
and in module-specific chapters; this document collects the v1.18 additions
in one place for implementers.

---

## Table of Contents

- [§21.1 `core` — Shared-Memory Types](#211-core--shared-memory-types)
  - [§21.1.1 `Shareable` Marker Trait](#2111-shareable-marker-trait)
  - [§21.1.2 `SharedBuffer[T]`](#2112-sharedbuffert)
  - [§21.1.3 `SharedArray[T]`](#2113-sharedarrayt)
  - [§21.1.4 `SharedArena`](#2114-sharedarena)
  - [§21.1.5 `SharedRef[T]`](#2115-sharedreft)
  - [§21.1.6 `WeakRef[T]` (Shared Extension)](#2116-weakref-t-shared-extension)
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
- [Appendix A: Error and Exception Reference](#appendix-a-error-and-exception-reference)
- [Appendix B: Wasm Opcode Mapping](#appendix-b-wasm-opcode-mapping)
- [Appendix C: Native Atomic Mapping](#appendix-c-native-atomic-mapping)

---

## §21.1 `core` — Shared-Memory Types

*(This section is normative. Types in this section are part of the `core`
namespace and are available without explicit import in every module.)*

This section specifies the `core` types introduced by v1.18 for shared-memory
concurrency. The semantics defined here are canonical; the Language Reference
§17b provides the conceptual overview and cross-references, while this
document is the implementer-facing reference for the precise type signatures
and behaviors.

### §21.1.1 `Shareable` Marker Trait

```loom
namespace core;

pub interface Shareable extends Sendable {}
```

See §17b.2 for normative semantics. The set of implicitly-`Shareable` types
is determined by the compiler at type-analysis time and is not user-extensible
except through:

1. Declaring a `struct` with all-`Shareable` fields (automatic derivation).
2. Declaring an `enum` with all-`Shareable` variant payloads (automatic derivation).
3. Declaring a `shared class` whose fields are all `Shareable` (automatic derivation).

Attempting to write `implements Shareable` on a type that does not satisfy
the derivation rules is a compile-time error (`E_SHAREABLE_DERIVATION_FAILED`).

### §21.1.2 `SharedBuffer[T]`

```loom
namespace core;

pub shared class SharedBuffer[T: Shareable] {
  pub static func create(elementCount: int, arena: SharedRef[SharedArena]? = None): SharedRef[SharedBuffer[T]];
  pub static func fromBytes(bytes: borrow bytes, arena: SharedRef[SharedArena]? = None): SharedRef[SharedBuffer[T]];

  pub let length: int;
  pub let byteLength: int;
  pub let elementSize: int;      // sizeof(T) in bytes

  pub func get(index: int): T;
  pub func set(index: int, value: T): void;

  pub func slice(start: int, end: int): SharedArray[T];
  pub func asArray(): SharedArray[T];

  pub func copyTo(dst: borrow SharedBuffer[T],
                  srcStart: int, dstStart: int, count: int): void;
  pub func fill(value: T, start: int = 0, end: int? = None): void;

  // Return the raw bytes of the buffer. The returned `bytes` value is a copy
  // — mutations to the bytes do not affect the buffer. For in-place access,
  // use SharedArray[uint8] via asArray() or slice().
  pub func snapshot(): bytes;

  // Arena of this buffer (for cross-mode transfer decisions).
  pub func arena(): SharedRef[SharedArena];
}
```

**Element sizing.** `elementSize` is the in-memory size of `T` per the C-ABI
layout rules of §17b.3. Implementations SHALL make this value available at
compile time when `T` is statically known.

**Bounds checking.** All indexed operations raise `IndexError` on
out-of-range access. The compiler MAY elide bounds checks when the index is
statically provable to be in range, subject to target-specific optimization
levels.

**Snapshot cost.** `snapshot()` performs a full copy of the buffer into a
fresh `bytes` value. For large buffers, prefer `asArray()` / `slice()` to
obtain a zero-copy view.

### §21.1.3 `SharedArray[T]`

```loom
namespace core;

pub shared class SharedArray[T: Shareable] {
  pub let length: int;
  pub let elementSize: int;

  pub func get(index: int): T;
  pub func set(index: int, value: T): void;

  pub func slice(start: int, end: int): SharedArray[T];
  pub func asBuffer(): SharedRef[SharedBuffer[T]];

  // Element-wise iteration. The body runs on the calling thread; it does not
  // parallelize on its own. To parallelize, pair with ScriptWorker or Thread.
  pub func forEach(body: fn(i: int, v: T): void): void;

  // Parallel partition helper — splits the range [0, length) into `n` chunks
  // suitable for distribution across `n` workers. Returns list of (start, end)
  // half-open intervals covering the whole range.
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

```loom
namespace core;

pub shared class SharedArena {
  pub static func create(capacityBytes: int, maxBytes: int? = None): SharedRef[SharedArena];

  pub let capacityBytes: int;
  pub let usedBytes: int;
  pub let maxBytes: int;

  pub func liveBytes(): int;
  pub func compact(): void;

  // Opaque arena identifier — stable for the arena's lifetime.
  // Used for equality comparison and diagnostic logging.
  pub func id(): string;

  // Number of execution contexts (workers, native threads) currently
  // attached to this arena.
  pub func attachmentCount(): int;

  // Best-effort allocation rate sampling — returns bytes allocated per
  // second over the last one-second window. Implementations MAY return 0
  // if not implemented.
  pub func allocationRate(): int;
}
```

See §17b.5 for normative semantics. The `id()` method returns an
implementation-defined stable string (typically a hash of the arena's
creation-time metadata) usable for equality and logging. Programs must not
assume a specific format.

### §21.1.5 `SharedRef[T]`

`SharedRef[T]` is a **value type** (a struct-like handle), not itself a
`shared class`. It holds an arena-relative offset plus the arena handle and
implements retain/release via the ARC protocol specified in §17b.7. Value
semantics mean `SharedRef[T]` is copied (with an atomic refcount increment)
when assigned, passed, or returned — matching Rust's `Arc<T>` and Swift's
managed reference semantics.

```loom
namespace core;

// T: shared class is a class-kind bound — see Language Reference §12.
pub struct SharedRef[T: shared class] implements Shareable, Sendable {
  // Clone — atomic increment of the target's refcount. O(1).
  pub func clone(): SharedRef[T];

  // Downgrade to a shared-arena weak reference (§21.1.6).
  pub func downgrade(): SharedWeakRef[T];

  // Observational counts (racy — use only for diagnostics).
  pub func strongCount(): int;
  pub func weakCount(): int;

  // Pointer equality — same underlying instance.
  pub func same(other: borrow SharedRef[T]): bool;

  // Arena of the referenced instance (returns a cloned SharedRef[SharedArena]).
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

See §17b.6 for normative semantics.

**`arena()` note.** Returns a cloned `SharedRef[SharedArena]` — the caller
owns a new handle. This is useful when a function needs to allocate a
companion object in the same arena as an existing reference.

### §21.1.6 `WeakRef[T]` and `SharedWeakRef[T]`

Loom provides two weak reference value types, one per class memory
strategy. Both are **value types** — struct-like handles — and are
idiomatically declared via the `weak` field qualifier (§8) within class
bodies. The standalone types below are used for locals, parameters, and
generic containers.

```loom
namespace core;

// Weak reference to a local class instance.
// Sendable (by copy) but not Shareable — the referent is thread-local ARC.
pub struct WeakRef[T: local class] implements Sendable {
  // Attempt to promote to a strong reference.
  // Returns None if the referent has been destroyed.
  pub func upgrade(): Option[T];

  pub func strongCount(): int;
  pub func weakCount(): int;
}

// Weak reference to a shared class instance.
// Shareable — may cross thread boundaries freely since the referent is
// shared-arena-resident.
pub struct SharedWeakRef[T: shared class] implements Shareable, Sendable {
  // Attempt to promote to a SharedRef. Returns None if the referent has
  // been destroyed and its refcount side-table entry has been reclaimed.
  pub func upgrade(): Option[SharedRef[T]];

  pub func strongCount(): int;
  pub func weakCount(): int;
}
```

**Field qualifier interaction.** The `weak` field qualifier (§8) on a
`local class` field compiles to the local-thread weak-side-table entry,
structurally equivalent to `WeakRef[T]`. The `weak` qualifier on a
`shared class` field compiles to a `SharedWeakRef[T]`. Users rarely need
to declare either `WeakRef` or `SharedWeakRef` explicitly — the `weak`
field qualifier is the idiomatic form.

**Implementation.** `SharedWeakRef[T]` is an entry in the arena's
weak-reference side table (header offset 32; §17b.5). Upgrade performs
the compare-exchange protocol specified in §17b.7. `WeakRef[T]` is a
pointer plus generation counter in the local thread's weak-side table;
upgrade reads the counter, checks it against the referent's header, and
returns `Some` only if they match.

---

## §21.2 `core.atomic` — Atomic Operations

*(This section is normative. Imports from `core.atomic` are not required in
Loom scope — the functions are accessible as `core.atomic.atomicLoad`, etc.
Short aliases may be imported explicitly: `from core.atomic import (fetchAdd,
compareExchange);`.)*

### §21.2.1 `Ordering` Enum

```loom
namespace core.atomic;

pub enum Ordering {
  Relaxed;
  Acquire;
  Release;
  AcqRel;
  SeqCst;
}
```

Semantics match C11 / C++11 / Wasm memory model. See §17b.4 for the mapping
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

See §17b.4 for the normative function signatures. This section enumerates
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

```loom
namespace core.atomic;

// Inline value type — laid out inline when embedded as a field of a
// shared class. See Language Reference §17b.4 for the rationale.
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

```loom
shared class Counter {
  let value: Atomic[int64];

  new() { this.value = Atomic[int64].new(0); }

  func increment(): int64 { return this.value.fetchAdd(1); }
  func read(): int64 { return this.value.load(); }
}
```

### §21.2.4 `Integer`, `Float`, `Numeric` Traits

The marker trait interfaces `core.Integer`, `core.Float`, and `core.Numeric`
are declared normatively in Language Reference §4.0. They are included here
for cross-reference convenience since atomic RMW operations (§21.2.2,
§21.2.3) use `T: Integer` as a type bound.

| Trait | Implementers |
|---|---|
| `core.Integer` | `int8`, `int16`, `int32`, `int64`, `uint8`, `uint16`, `uint32`, `uint64` |
| `core.Float` | `float32`, `float64` |
| `core.Numeric` | union of `Integer` + `Float` + `decimal` variants |

`bigint` implements none of these — it is arbitrary-precision and cannot
participate in fixed-width atomic RMW.

---

## §21.3 `sync.shared` — Shared Synchronization Primitives

*(This section is normative. All types in this section are `shared class`
allocated in a specific arena.)*

### §21.3.1 `SharedMutex[T]`

```loom
namespace sync.shared;

pub shared class SharedMutex[T: Shareable] {
  pub static func new(initial: T, arena: SharedRef[SharedArena]? = None): SharedRef[SharedMutex[T]];

  pub async func lock(): SharedMutexGuard[T];
  pub func tryLock(): Option[SharedMutexGuard[T]];

  // Combinator form — acquire, call body with a guard, release automatically
  // when body returns. Exceptions thrown in body propagate after release.
  pub async func withLock[R: Sendable](body: fn(guard: SharedMutexGuard[T]): R): R;

  // Acquire even if the lock was poisoned by a prior panic. The caller
  // takes responsibility for validating the protected state.
  pub async func lockRecover(): SharedMutexGuard[T];

  pub let isPoisoned: bool;
}

// Scope-bound guard. `SharedMutexGuard[T]` is a `unique class` — it cannot
// be cloned, aliased, or stored in shared-reachable fields (§23.4.7). The
// lock is held for exactly the guard's lifetime; dropping the guard (scope
// exit, explicit release, or being passed to a consuming function with
// `takes guard: SharedMutexGuard[T]`) releases the lock.
//
// The `Scoped[T]` interface (defined at Language Reference §17.8.2 alongside
// the existing `MutexGuard[T]`) standardises the `get`/`set`/`update`/
// `release` surface shared by all scope-bound guard types — `SharedMutexGuard[T]`,
// `SharedRwReadGuard[T]`, `SharedRwWriteGuard[T]`, and the non-shared
// `MutexGuard[T]` / `RwLockReadGuard[T]` / `RwLockWriteGuard[T]`.
pub unique class SharedMutexGuard[T: Shareable] : Any implements Scoped[T] {
  pub func get(): T;
  pub func set(value: T): void;
  pub func update(fn: fn(T): T): void;

  // Explicit unlock. The guard becomes invalid; further use raises
  // E_GUARD_RELEASED at compile time (when statically detectable) or
  // ReleasedGuardError at runtime. Normally, guards release automatically
  // when the surrounding scope exits.
  pub func release(): void;
}
```

**Poison policy.** If the thread holding a `SharedMutex` panics, the lock
is marked poisoned. Subsequent `lock()` / `tryLock()` calls throw
`PoisonedLockError`. Callers aware of the possibility of inconsistent state
may use `lockRecover()` to acquire despite poisoning.

**Guard scope.** The `MutexGuard[T]` returned by `lock()` is intended to be
used within a narrow lexical scope:

```loom
let guard = await myMutex.lock();
guard.edits(func(edits state: State) {
  state.counter += 1;
  state.history.push(...);
});
// guard goes out of scope here; lock is released automatically
```

The `edits` / `reads` methods take closures rather than returning direct
references to the protected value. This prevents the escape of `edits T`
beyond the locked scope and preserves the borrow checker's exclusivity
invariant.

### §21.3.2 `SharedRwLock[T]`

```loom
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

// Scope-bound read guard — allows multiple concurrent holders.
// `unique class` semantics: no cloning, release-on-drop, move-only.
pub unique class SharedRwReadGuard[T: Shareable] : Any implements Scoped[T] {
  pub func get(): T;
  pub func release(): void;
}

// Scope-bound write guard — exclusive access.
// `unique class` semantics: no cloning, release-on-drop, move-only.
pub unique class SharedRwWriteGuard[T: Shareable] : Any implements Scoped[T] {
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

```loom
namespace sync.shared;

pub shared class SharedCondVar {
  pub static func new(arena: SharedRef[SharedArena]? = None): SharedRef[SharedCondVar];

  // `wait` consumes the guard, releases the mutex, blocks until notified,
  // then reacquires the mutex and returns a fresh guard. The `takes` verb
  // (§23.4.9) makes the consumption explicit at the call site.
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

```loom
let guard = await myMutex.lock();
while (!conditionMet(guard)) {
  guard = await myCondVar.wait(guard);
}
guard.edits(func(edits state) { /* predicate holds, proceed */ });
```

### §21.3.4 `SharedSemaphore`

```loom
namespace sync.shared;

pub shared class SharedSemaphore {
  pub static func new(count: int, arena: SharedRef[SharedArena]? = None): SharedRef[SharedSemaphore];

  pub async func acquire(): void;
  pub async func acquireN(count: int): void;
  pub func tryAcquire(): bool;
  pub func release(count: int = 1): void;

  pub let availableCount: int;   // observational
}
```

### §21.3.5 `SharedBarrier`

```loom
namespace sync.shared;

pub shared class SharedBarrier {
  pub static func new(parties: int, arena: SharedRef[SharedArena]? = None): SharedRef[SharedBarrier];

  pub async func wait(): BarrierResult;

  // Reset the barrier for a new generation. All currently-waiting threads
  // see BarrierResult.Broken. Useful for cancellation scenarios.
  pub func reset(): void;

  pub let parties: int;
}

pub enum BarrierResult {
  Continue;    // normal return — the barrier released with `parties` arrivals
  Leader;      // as Continue, but this thread is designated the "leader" —
               // exactly one arrival receives Leader per barrier cycle
  Broken;      // the barrier was reset while this thread was waiting
}
```

### §21.3.6 `SharedQueue[T]`

```loom
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

```loom
namespace sync.shared;

pub shared class SharedStack[T: Shareable] {
  pub static func new(arena: SharedRef[SharedArena]? = None): SharedRef[SharedStack[T]];

  pub func push(value: T): void;
  pub func pop(): Option[T];

  pub let length: int;   // observational; may be stale under contention
}
```

**Semantics.** Lock-free unbounded stack (Treiber stack). `push` and `pop`
never block — contention is handled via compare-exchange retry loops.

---

## §21.4 `concurrent` — Worker Integration

*(This section is normative. Extensions to the `ScriptWorker` and
`WorkerChannel` types specified in Language Reference §17.10.2–§17.10.3.)*

### §21.4.1 `ScriptWorker` Arena Extension

```loom
namespace concurrent;

class ScriptWorker[M: Sendable] {
  // ... (§17.10.2 methods unchanged)

  // Share an arena with this worker. The worker may now allocate in and
  // reference existing objects within this arena. Idempotent — sharing an
  // already-attached arena is a no-op.
  pub func share(arena: SharedRef[SharedArena]): void;

  // Detach an arena from this worker. If the worker has outstanding
  // SharedRef instances into the arena, the arena remains live until those
  // refs are released. Calling detach on an arena not currently shared is
  // an error (E_ARENA_NOT_SHARED).
  pub func detach(arena: SharedRef[SharedArena]): void;

  // Send a SharedRef to the worker without serialization. The worker MUST
  // have the referenced arena attached (via share() or by having created it
  // from within workerMain). Returns before the worker observes the message.
  pub func sendRef[T: shared class](ref: SharedRef[T]): void;

  // Receive a SharedRef sent by the worker via channel.replyRef().
  // Returns None if the worker has terminated and all queued refs are drained.
  pub async func receiveRef[T: shared class](): Option[SharedRef[T]];

  // List arenas currently shared with this worker.
  pub func sharedArenas(): list[SharedRef[SharedArena]];
}
```

### §21.4.2 `WorkerChannel` Arena Extension

```loom
namespace concurrent;

class WorkerChannel[T: Sendable] {
  // ... (§17.10.3 methods unchanged)

  // Worker-side counterpart to host's receiveRef. Returns None when the
  // host has terminated and all queued refs are drained.
  pub async func receiveRef[S: shared class](): Option[SharedRef[S]];

  // Worker-side counterpart to host's sendRef. The ref's arena must be
  // attached to the host (automatically true for any arena the worker
  // received via receiveRef).
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
Reference §20.1; this section adds the v1.18 shared-memory configuration
methods.)*

```loom
namespace runtime;

// Set the default shared arena for the current execution context. Future
// `shared T()` allocations without an explicit arena argument use this arena.
// Returns the previous default arena.
pub func setDefaultSharedArena(arena: SharedRef[SharedArena]): SharedRef[SharedArena];

// Get the current default shared arena for this context. Lazily creates
// one on first access with implementation-defined default capacity.
pub func defaultSharedArena(): SharedRef[SharedArena];

// Configure default-arena growth parameters used when the runtime
// implicitly creates the default arena. MUST be called before any shared
// allocation in the current context; otherwise throws
// DefaultArenaAlreadyInitializedError.
pub func configureDefaultSharedArena(config: DefaultArenaConfig): void;

pub struct DefaultArenaConfig {
  initialCapacityBytes: int = 16.MiB;
  maxBytes: int? = None;            // None means non-growable at initial capacity
}
```

**Per-context default arena.** Each execution context (main thread,
`ScriptWorker` instance, native thread) has its own default arena pointer.
The pointer is inherited from the spawning context at spawn time. Changing
the default arena in one context does not affect other contexts.

---

## §21.6 `core.serialization` — Serialization Foundation

*(This section is normative. The full serialization foundation is
specified in Language Reference §32; this section lists the concrete
stdlib types and functions users import. Types live in the
`core.serialization` namespace. The foundation does not ship any specific
wire format — JSON, MessagePack, CBOR, and similar are separate packages
that implement `FormatDriver`.)*

### §21.6.1 `Value` Intermediate Representation

```loom
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

// Note: Value is Sendable (its variants wrap only Sendable payloads) but
// not Shareable — the List and Map variants carry growable collections that
// cannot be concurrently accessed. Sendable status follows the implicit
// Sendable-for-enums rule in Language Reference §17.8.1.

// Value helper methods (all non-throwing; return Option where a type
// assumption could fail).
class Value {
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
  pub func asVariant(): Option[(string, Value)];  // (tag, fields)
  pub func asTagged(): Option[(string?, Value)];  // (uri, value)

  // Ergonomic accessors for hand-written parsers
  pub func get(key: string): Option[Value];   // Map lookup by string key
  pub func at(index: int): Option[Value];     // List lookup
  pub func path(p: string): Option[Value];    // "a.b.c" dotted path

  // Type predicates returning specific-variant booleans
  pub func isString(): bool;
  pub func isList(): bool;
  pub func isMap(): bool;
}
```

### §21.6.2 `Serializable` and `Deserializable` Traits

```loom
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

See Language Reference §32.3 for the normative contract. The compiler
auto-derives implementations for classes, structs, and enums whose fields
are all `Serializable` / `Deserializable` (per §32.4); the `@manual`
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

```loom
namespace core.serialization;

pub interface SerializationAdapter[T] {
  static func toValue(value: T): Value;
  static func fromValue(v: Value): T;
}
```

Used with `@serialVia[Adapter]` on fields whose types are not directly
`Serializable` / `Deserializable`. See Language Reference §32.3.

### §21.6.4 `FormatDriver` Interface

```loom
namespace core.serialization;

pub interface FormatDriver {
  static func name(): string;
  static func contentType(): string;

  static func encode(value: Value, config: EncodeConfig = EncodeConfig.default()): bytes;
  static func decode(bytes: borrow bytes, config: DecodeConfig = DecodeConfig.default()): Value;
}

// Optional — drivers that support streaming declare this sub-interface.
pub interface StreamingFormat : FormatDriver {
  static func encodeStream(value: Value, writer: io.Writer, config: EncodeConfig): void;
  static func decodeStream(reader: io.Reader, config: DecodeConfig): Value;
}
```

See Language Reference §32.10 for driver compliance requirements.

### §21.6.5 Convenience Functions

```loom
namespace core.serialization;

pub func serialize[T: Serializable, D: FormatDriver](
  value: T,
  config: EncodeConfig = EncodeConfig.default(),
): bytes;

pub func deserialize[T: Deserializable, D: FormatDriver](
  bytes: borrow bytes,
  config: DecodeConfig = DecodeConfig.default(),
): T;

// Diagnostic helper — serialize through a format, immediately deserialize,
// and assert equality. Returns the round-tripped value. Useful in tests.
// For types where equality is not meaningful (e.g. types holding closures),
// callers must use format-specific equality checks.
pub func roundtrip[T: Serializable + Deserializable, D: FormatDriver](
  value: T,
): T;

// Convert to Value without serializing to bytes. Useful for inspecting
// or transforming a value before handing it to a format driver.
pub func toValue[T: Serializable](value: T): Value;

// Convert a Value to a typed value without going through bytes.
pub func fromValue[T: Deserializable](v: Value): T;
```

### §21.6.6 Configuration Types

```loom
namespace core.serialization;

pub struct EncodeConfig {
  pub maxDepth: int = 64;
  pub maxSizeBytes: int = 16.MiB;
  pub pretty: bool = false;
  pub sensitiveMode: SensitiveMode = SensitiveMode.Include;
  pub deterministic: bool = true;

  pub static func default(): EncodeConfig;

  // Common presets
  pub static func forUntrustedOutput(): EncodeConfig;  // Redact sensitive, deterministic
  pub static func forDebugLogging(): EncodeConfig;     // Omit sensitive, pretty, small limits
  pub static func forRpcBody(): EncodeConfig;          // Include sensitive, deterministic
  pub static func forContentAddressed(): EncodeConfig; // Deterministic, compact
}

pub struct DecodeConfig {
  pub maxDepth: int = 64;
  pub maxSizeBytes: int = 16.MiB;
  pub strictSchema: bool = false;
  pub unknownTypeBehavior: UnknownTypeBehavior = UnknownTypeBehavior.RemoteException;

  pub static func default(): DecodeConfig;

  pub static func forUntrustedInput(): DecodeConfig;   // Smaller limits, strict schema
  pub static func forTrustedInternal(): DecodeConfig;  // Larger limits, permissive
}

pub enum SensitiveMode {
  Include;       // serialize normally (flag out-of-band)
  Redact;        // replace with redaction marker
  Omit;          // drop the field entirely
}

pub enum UnknownTypeBehavior {
  RemoteException;       // for BaseException subclasses — default
  Error;                 // throw DeserializationError
  Skip;                  // drop the value (lossy imports)
}
```

### §21.6.7 Migration Helpers

```loom
namespace core.serialization;

// Invoked by the runtime when a type has rolled over its major version.
// User code typically does not call this directly — it is invoked via the
// @migrateFrom annotation's registered function at deserialization time.
pub func migrate[T: Deserializable](
  oldValue: Value,
  oldTypeUri: string,
  fromOld: fn(Value): T,
): T;

// Register a migration function for a type at runtime. Rarely needed — the
// @migrateFrom annotation is the idiomatic form, auto-registering at
// module-init time.
pub func registerMigration(
  newTypeUri: string,
  oldTypeUri: string,
  fromOld: fn(Value): Any,
): void;
```

### §21.6.8 `RemoteException` and `StackFrame`

```loom
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
  // Inherits: message, cause, stackTrace from BaseException
}
```

See Language Reference §26.1 and §32.9 for normative semantics.

---

## Appendix A: Error and Exception Reference

The shared-memory subsystem introduces the following error codes (compile-time)
and exception types (runtime):

**Shared-memory and ownership errors (v1.18, Language Reference §8, §17b):**

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
| `SharedArenaOutOfMemoryError` | Arena reached `maxBytes` and cannot satisfy allocation |
| `SharedArenaCorruptedError` | Arena header magic/version mismatch at attach time |
| `SharedArenaVersionMismatchError` | Arena ABI version unsupported by attaching toolchain |
| `AtomicWidthUnsupportedError` | Atomic width unsupported at runtime |
| `PoisonedLockError` | Lock acquired after prior holder panicked |
| `QueueClosedError` | Send/receive on a closed `SharedQueue` |
| `ResurrectionError` | Finalizer stored `this` in a reachable location |
| `FinalizerTimeoutError` | Finalizer exceeded implementation-defined time limit |
| `WorkerArenaNotAttachedError` | `sendRef` target worker lacks the referenced arena |
| `DefaultArenaAlreadyInitializedError` | `configureDefaultSharedArena` called after first allocation |

**Serialization errors (v1.18, Language Reference §32.13):**

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

All runtime exceptions extend the standard `Exception` hierarchy (Language
Reference §26) and participate in `try`/`catch`.

---

## Appendix B: Wasm Opcode Mapping

*(This appendix is non-normative.)*

The following table shows how `core.atomic` functions lower to Wasm threads
proposal opcodes on Wasm targets:

| Loom function (32-bit variant) | Wasm opcode |
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

---

## Appendix C: Native Atomic Mapping

*(This appendix is non-normative.)*

On native targets, `core.atomic` functions lower to the target's native
atomic instructions. The table below shows representative lowerings for
three major architectures:

| Loom function (32-bit variant) | x86-64 | ARM64 | C11 equivalent |
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
