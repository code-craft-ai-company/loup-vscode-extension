# Loup Language Reference v1.20 — Volume 2: Runtime

**Status:** Release — current normative reference
**Version:** 1.20.0
**Date:** 2026-05-07
**Supersedes:** 1.19.0
**Scope:** Concurrency (async, actors, threads), shared-memory concurrency, FFI and host interop, reactive UI, runtime root and capabilities.

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
- [Loup UI Framework Specification](loup-ui-framework-spec.md), with its companions the [UI Backend Contract](loup-ui-backend-contract.md) and [Minimal Controls and Theme](loup-ui-controls-theme.md) — normative for §2-4 since v1.21

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

- **§2-1.11 (new).** `for concurrent` parallel iteration form. Translation
  target for Fortran `DO CONCURRENT`; first-class form for parallel-friendly
  numerical code. Compile-time guarantees of data-race freedom via index
  disjointness analysis and `Sendable` capture restrictions. Implementation
  is permitted to choose sequential, SIMD, thread-pool, or accelerator
  dispatch; explicit `@strategy(...)` annotations override the default.

---

## Table of Contents

- [§2-1 Concurrency](#2-1-concurrency)
  - [§2-1.1 `async`/`await`](#2-11-asyncawait)
  - [§2-1.2 `await group`](#2-12-await-group)
  - [§2-1.3 `TaskGroup`](#2-13-taskgroup)
  - [§2-1.4 Async Iterators and `for await`](#2-14-async-iterators-and-for-await)
  - [§2-1.5 Async Iterator Combinators](#2-15-async-iterator-combinators)
  - [§2-1.6 Actors and Supervision](#2-16-actors-and-supervision)
  - [§2-1.7 `atomic {}` — Cooperative Atomicity Scope](#2-17-atomic---cooperative-atomicity-scope)
  - [§2-1.7b `weak` References in Concurrent Contexts](#2-17b-weak-references-in-concurrent-contexts)
  - [§2-1.8 OS Thread Parallelism (`--target native`)](#2-18-os-thread-parallelism---target-native)
    - [§2-1.8.1 `Sendable` Interface](#2-181-sendable-interface)
    - [§2-1.8.2 Shared Mutable State: `Mutex[T]`, `RwLock[T]`, `Atomic[T]`](#2-182-shared-mutable-state-mutext-rwlockt-atomict)
    - [§2-1.8.3 `Thread` and `ThreadHandle`](#2-183-thread-and-threadhandle)
    - [§2-1.8.4 `ThreadPool`](#2-184-threadpool)
    - [§2-1.8.5 Restrictions](#2-185-restrictions)
  - [§2-1.9 Multi-Threaded Async Executor](#2-19-multi-threaded-async-executor)
    - [§2-1.9.1 `ExecutorConfig` and `RuntimeConfig`](#2-191-executorconfig-and-runtimeconfig)
    - [§2-1.9.2 Work-Stealing Executor Semantics](#2-192-work-stealing-executor-semantics)
    - [§2-1.9.3 `spawnBlocking` — Blocking Work Bridge](#2-193-spawnblocking--blocking-work-bridge)
    - [§2-1.9.4 Task Sendability Rules (Multi-Threaded Executor)](#2-194-task-sendability-rules-multi-threaded-executor)
    - [§2-1.9.5 `@concurrent` Annotation](#2-195-concurrent-annotation)
    - [§2-1.9.6 Actor Isolation in Multi-Threaded Contexts](#2-196-actor-isolation-in-multi-threaded-contexts)
    - [§2-1.9.7 Thread-Local Storage (`ThreadLocal[T]`)](#2-197-thread-local-storage-threadlocalt)
    - [§2-1.9.8 Task-Local Storage (`TaskLocal[T]`)](#2-198-task-local-storage-tasklocalt)
    - [§2-1.9.9 Executor Hand-off (`runtime.executor`)](#2-199-executor-hand-off-runtimeexecutor)
  - [§2-1.10 Script-Mode Parallelism](#2-110-script-mode-parallelism)
    - [§2-1.10.1 `spawnBlocking` in Scripted Mode](#2-1101-spawnblocking-in-scripted-mode)
    - [§2-1.10.2 `ScriptWorker` — Isolated Worker Instances](#2-1102-scriptworker--isolated-worker-instances)
    - [§2-1.10.3 `WorkerChannel[T]` — Typed Message Channel](#2-1103-workerchannelt--typed-message-channel)
    - [§2-1.10.4 Serialization Contract](#2-1104-serialization-contract)
    - [§2-1.10.5 Worker Scope Restrictions](#2-1105-worker-scope-restrictions)
  - [§2-1.11 `for concurrent` — Parallel Iteration](#2-111-for-concurrent--parallel-iteration)
- [§2-2 Shared-Memory Concurrency](#2-2-shared-memory-concurrency)
  - [§2-2.1 Overview and Mode Availability](#2-21-overview-and-mode-availability)
  - [§2-2.2 `Shareable` Marker Trait](#2-22-shareable-marker-trait)
  - [§2-2.3 `SharedBuffer[T]` and `SharedArray[T]`](#2-23-sharedbuffert-and-sharedarrayt)
  - [§2-2.4 `core.atomic` — Atomic Operations](#2-24-coreatomic--atomic-operations)
  - [§2-2.5 `SharedArena` and Allocation](#2-25-sharedarena-and-allocation)
  - [§2-2.6 `SharedRef[T]` and `shared class`](#2-26-sharedreft-and-shared-class)
  - [§2-2.7 Cross-Mode ABI Contract](#2-27-cross-mode-abi-contract)
  - [§2-2.8 Shared Synchronization Primitives](#2-28-shared-synchronization-primitives)
  - [§2-2.9 Ownership Verbs and Shared Types](#2-29-ownership-verbs-and-shared-types)
  - [§2-2.10 Worker Integration](#2-210-worker-integration)
  - [§2-2.11 Error Codes](#2-211-error-codes)
- [§2-3 FFI and Host Interop](#2-3-ffi-and-host-interop)
  - [§2-3.1 JavaScript Interop (`extern js`)](#2-31-javascript-interop-extern-js)
  - [§2-3.2 `@jsexport`](#2-32-jsexport)
  - [§2-3.3 Typed JS Facades (`lang.interop.js`)](#2-33-typed-js-facades-langinteropjs)
  - [§2-3.4 Native Interop (`extern native`)](#2-34-native-interop-extern-native)
    - [§2-3.4.1 `native.ffi.ptrAdd` — Raw Pointer Arithmetic](#2-341-nativeffiptradd--raw-pointer-arithmetic)
  - [§2-3.5 FFI Thread Safety (`@unsafe("threadSafe: ...")`, `ThreadSafeHandle`)](#2-35-ffi-thread-safety-unsafethreadsafe--threadsafehandle)
    - [§2-3.5.1 `@unsafe("threadSafe: ...")` Annotation](#2-351-unsafethreadsafe--annotation)
    - [§2-3.5.2 `ThreadSafeHandle`](#2-352-threadsafehandle)
- [§2-4 Reactive UI (`ui`)](#2-4-reactive-ui-ui)
  - [§2-4.1 Signals](#2-41-signals)
  - [§2-4.2 Components and `ComponentRegistry`](#2-42-components-and-componentregistry)
  - [§2-4.3 Mounting (Universal)](#2-43-mounting-universal)
  - [§2-4.4 `View` Type](#2-44-view-type)
  - [§2-4.5 Async Component Loading](#2-45-async-component-loading)
  - [§2-4.6 `ui` Fence — Cross-Platform Layout Primitives](#2-46-ui-fence--cross-platform-layout-primitives)
  - [§2-4.7 Web Backend (`ui.web`)](#2-47-web-backend-uiweb)
  - [§2-4.8 Desktop Backend (`ui.desktop`)](#2-48-desktop-backend-uidesktop)
  - [§2-4.9 Cross-Platform Example](#2-49-cross-platform-example)
  - [§2-4.10 Web Components](#2-410-web-components)
    - [§2-4.10.1 Declaring a Web Component](#2-4101-declaring-a-web-component)
    - [§2-4.10.2 `@webcomponent` Rules](#2-4102-webcomponent-rules)
    - [§2-4.10.3 `@attribute` Rules](#2-4103-attribute-rules)
    - [§2-4.10.4 Shadow DOM and Slots](#2-4104-shadow-dom-and-slots)
    - [§2-4.10.5 CSS Inside Web Components](#2-4105-css-inside-web-components)
    - [§2-4.10.6 Using Web Components in Fences](#2-4106-using-web-components-in-fences)
    - [§2-4.10.7 Bootstrap Registration](#2-4107-bootstrap-registration)
- [§2-5 Runtime Root and Capabilities](#2-5-runtime-root-and-capabilities)
  - [§2-5.1 `runtime` Object](#2-51-runtime-object)
  - [§2-5.2 Script Prelude](#2-52-script-prelude)
  - [§2-5.3 Dynamic Tracing and Time-Travel Debugging](#2-53-dynamic-tracing-and-time-travel-debugging)

---

## §2-1 Concurrency

*(This section is normative. This chapter covers async/await, structured concurrency, actors, OS-thread parallelism, the multi-threaded async executor, and script-mode parallelism. Shared-memory concurrency — the `Shareable` trait, `SharedBuffer[T]`, `SharedRef[T]`, `shared class`, atomics, and shared synchronization primitives — is specified separately in §2-2.)*

**Const evaluation and this volume (v1.21).** No construct in §2-1 or §2-2 is reachable
from a const context. This needs no per-construct rule: a `const func` body may call only
other `const func`s (`E_CONST_CALLS_NON_CONST`), `async`/`await`, spawning, channels,
atomics and the shared-memory primitives are all runtime operations that no `const func`
declares, and the const-evaluation profile (core §1-7.1) is interpretation of that closed
set with no I/O, no threads and no clock. Writing `await` inside a `const func` is
therefore rejected as a non-const-expression before any question of scheduling arises.

### §2-1.1 `async`/`await`

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

### §2-1.2 `await group`

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

### §2-1.3 `TaskGroup`

`TaskGroup` provides static methods for homogeneous concurrent work:

```
pub class TaskGroup {
  pub static async func collect[T, R](items: list[T], body: async fn(T): R): Task[list[R]];
  pub static func race[T, R](items: list[T], body: async fn(T): R): AsyncIterable[R];
  pub static async func withTimeout[T](ms: int, body: async fn(): T): Task[T];
  pub static async func withCancellation[T](body: async fn(token: CancellationToken): T): Task[T];

  # Bounded concurrency — at most `n` body invocations run simultaneously.
  # Throws TaskQueueFullError if the internal work queue reaches capacity (see §2-5.1).
  pub static async func collectBounded[T, R](items: list[T], maxConcurrency: int, body: async fn(T): R): Task[list[R]];
}

pub class CancellationToken : Any {
  pub func cancel(): void;
  pub func isCancelled(): bool;
}
```

- `collect` runs `body` concurrently for each item and collects results. If any task fails, all remaining are cancelled.
- `race` returns results in completion order via `AsyncIterable[R]`.
- `withTimeout` cancels and throws `TimeoutError` if not complete within `ms` milliseconds.
- `withCancellation` provides a `CancellationToken` the caller can signal.

### §2-1.4 Async Iterators and `for await`

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

### §2-1.5 Async Iterator Combinators

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

### §2-1.6 Actors and Supervision

Actors provide sequential message processing with supervision:

**`Actor[M]`** processes messages of type `M` sequentially from a mailbox:

```
pub class Actor[M] : Any {
  # Create and start an actor.  `handler` is called once per message in
  # delivery order; it runs inside a dedicated structured-concurrency child
  # task and must not itself await indefinitely between messages.
  pub static async func spawn(handler: async fn(msg: M): Task[void]): Task[Actor[M]];

  # Simplified synchronous-handler overload for actors that do not need await.
  pub static async func spawn(handler: fn(msg: M): void): Task[Actor[M]];

  pub func send(msg: M): void;
  pub async func ask[R](msg: M): Task[R];

  # Request orderly shutdown: no new messages are accepted; in-flight
  # messages drain before the actor task exits.
  pub func stop(): void;
}
```

- `Actor.spawn(handler)` starts the actor in a new child task and returns an `Actor[M]` handle. The call must be `await`-ed inside an `async` context (the actor runs for the lifetime of its enclosing `await group` or until `stop()` is called).
- `actor.send(msg)` delivers a message asynchronously. Messages are processed sequentially in send order.
- `actor.ask(msg)` sends a message and returns a `Task[R]` that resolves with the response. The `handler` must reply via the implicit `ActorContext` (see below) or the `Task[R]` never resolves.
- `actor.stop()` signals orderly shutdown; the handler finishes the current message, then the actor task exits.

**`ActorContext`** is an implicit value available inside the handler body for replying to `ask` calls:

```
# Full actor example
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
  let total = await counter.ask(CounterMsg.GetCount);  # 2
  counter.stop();
}
```

```
pub class ActorContext : Any {
  # Reply to the current ask() call. No-op if called from a send()-originated invocation.
  # Only the first reply is delivered; subsequent calls on the same invocation are ignored.
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

### §2-1.7 `atomic {}` — Cooperative Atomicity Scope

*(This section is normative. Applies to `@mode(web.scripted)`, `@mode(web.compiled)`, `@mode(host.scripted)`, and `@mode(host.dual)` per §1-2.6.)*

An `atomic {}` block guarantees that no suspension point occurs within its lexical scope. It is the primary mechanism for closing TOCTOU (time-of-check/time-of-use) races in cooperative async code: all statements between the opening and closing brace execute without interleaving from other tasks.

**Semantics.** The compiler rejects `await` expressions, `for await` loops, and `spawn` statements inside an `atomic {}` block (`E_ATOMIC_AWAIT`). No call to a function declared `async` is permitted inside `atomic {}` unless it is statically proven to not contain any suspension point — in practice, only `safe func` and non-`async` functions are permitted. The cooperative scheduler does not preempt within an `atomic {}` block; other tasks do not run until the block exits.

```loup
# Without atomic {}: TOCTOU window between check and act
if (cache.has(key)) {
  await expensiveOperation()   # another task may evict key here
  return cache.get(key)        # key may be gone — returns None unexpectedly
}

# With atomic {}: check and act are uninterruptible
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

**`atomic {}` is not a mutex.** It does not prevent interleaving across OS threads — for that, use `synchronized` (§3-2.4.13) or `Mutex[T]` (§2-1.8.2). `atomic {}` requires a cooperatively-scheduled environment: it prevents interleaving only by statically forbidding suspension points (`await`, `for await`, `spawn`, calls to `async func` not proven suspension-free) inside the block. In `@mode(host.dual)`, which may host OS threads, the compiler enforces the same no-suspension rule — OS threads are orthogonal to `atomic {}`, which only coordinates cooperative scheduling within a single logical task.

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

**Task queue exhaustion (normative).** Spawning tasks in an unbounded loop without awaiting results can exhaust available memory. The runtime enforces a configurable maximum pending-task queue depth via `runtime.configure` (§2-5.1). When the queue is full, further `spawn` operations throw `TaskQueueFullError` (§1-18.1). The default limit is `0` (unlimited); set a positive `maxTaskQueueDepth` in `RuntimeConfig` to bound the queue. Use `TaskGroup.collectBounded` (§2-1.3) as the preferred pattern for high-throughput task production.

---

### §2-1.7b `weak` References in Concurrent Contexts

On the native ARC target, `weak` references interact with concurrency as follows:

- A `weak` field read in one task may yield `None` if the referent was released concurrently. ARC weak reference zeroing is atomic — this is not a data race.
- `Actor[M]` supervision trees that hold bidirectional parent↔child references should use `weak` for the child-to-parent reference to avoid retain cycles: the parent owns the child (strong reference), the child back-references the parent (weak reference).
- `await group` child tasks hold a strong reference to the group's scope for the duration of the task. Storing a spawned task handle in a `weak` field is permitted; the reference will be `None` once the task completes.
- *(Struck in v1.21, ruling SIG-LIB.)* v1.20 asked `effect()` closures that reference their `EffectHandle` to use `[weak handle]` captures. Signal and effect handles are now indices into a store (§2-4.1), so such a closure makes no reference cycle.

On GC runtimes (scripted/Wasm), `weak` references behave consistently — the GC may collect the referent, after which reads return `None`. No additional concurrency rules apply since the runtime is cooperatively single-threaded.

### §2-1.8 OS Thread Parallelism (`--target native`)

*(This section is normative. Genuine OS-thread PARALLELISM applies only to `@mode(host.dual)` and `@mode(host.native)` files. The OS-thread constructs in this section — `Mutex[T]`, `RwLock[T]`, `Thread`, `ThreadPool` — are compile-time errors in `@mode(web.compiled)` files targeting Wasm, and `E_FREESTANDING_RUNTIME` in `@mode(freestanding)` files.*

***`Atomic[T]` and the `core.atomic` surface are the exception, and their availability is governed by §2-2's mode-availability matrix, not by this section.** The matrix marks `core.atomic` present in ALL SIX modes, and §2-2 item 3 specifies that atomics map directly to Wasm `atomic.*` opcodes on Wasm targets — so restricting them to `@mode(host.native)`/`@mode(freestanding)` here would contradict the section that defines the shared-memory model and names the opcodes. Earlier revisions of this note implied that narrower rule and the import resolver implemented it; the matrix wins. What atomics do NOT provide on a single-threaded mode is parallelism: a read-modify-write is indivisible there because nothing else can run during it, not because a hardware atomic instruction was issued. The `Ordering` argument is what carries meaning once a mode has real threads.)*

*(**Scripted mode provides this API surface on a single-threaded backend.** The types are bound and usable — this is not a stub: `lock()` cannot fail to acquire when there is one thread, `tryLock()` reports contention, the re-entrant-lock `LifetimeError` trap is fully detectable, and `Thread.spawn` runs its body. What scripted mode does NOT provide is overlap: bodies run at their spawn site, so fan-out-then-join is correct while anything requiring two bodies to make progress simultaneously — a barrier across threads, a producer/consumer handshake — hangs rather than working. Each subsection records its own narrowings under "Implemented surface". This is deliberate: the API is what the OS-thread backend will implement, so code written against it keeps working unchanged when that backend lands.)*

*Compiler's rule (threads on a runtime without a scheduler).* A native program linked
against a runtime that has no scheduler — the Loup-authored libOS on its emulated (QEMU)
seam (one CPU, no preemption) — gets scripted mode's single-threaded backend:
`Thread.spawn` / `spawnWith` run the body at the spawn site, `join` returns its
result, and a lock is never contended. The libOS on Linux runs genuine OS threads
(clone, futex-based locks, per-thread TLS), as the C runtime does (ruling THR-1,
loup#641).

Loup's cooperative async runtime runs on a single OS thread by default. For CPU-bound workloads on `--target native`, true parallelism is available via OS threads using the primitives in this section. For parallelizing async work itself across cores, see §2-1.9 (Multi-Threaded Async Executor). OS thread primitives are a lower-level interface intended for compute-heavy work and synchronous blocking operations.

#### §2-1.8.1 `Sendable` Interface

`Sendable` is a marker interface indicating that a type is safe to transfer across thread boundaries:

```loup
namespace core;

pub interface Sendable {}
```

**Implicit `Sendable` implementations.** The following types are implicitly `Sendable` without an explicit `implements Sendable` declaration:

- All primitive types: the integer types (`int`, `int8`/`16`/`32`/`64`, `uint`, `uint8`/`16`/`32`/`64`, `bigint`), the floating-point types (`float`, `float32`, `float64`, `decimal`), the complex types (`complex`, `complex32`, `complex64`), and `bool`, `char`, `string`, `bytes`.
- `array[T, rank]` when `T` is `Sendable` (§1-4.10); the array's underlying storage is transferred or value-copied, with no shared aliasing.
- All enum types whose variant payloads are all `Sendable`.
- All struct types whose fields are all `Sendable`, **except** structs that declare a `[lifetime ~name]` parameter or that contain any `borrow[~name]` field — such structs are implicitly non-`Sendable` regardless of the `Sendable`-ness of their field types. Explicitly declaring `implements Sendable` on a lifetime-parameterized struct is `E_SENDABLE_LIFETIME`.
- All enum types whose variant payloads are all `Sendable`, **except** enums that declare a `[lifetime ~name]` parameter or that contain `borrow[~name]` variant payloads — these are implicitly non-`Sendable` for the same reason.
- `Option[T]` and `Result[T, E]` when `T` and `E` are `Sendable`.
- `list[T]`, `set[T]`, `dict[K, V]` when all type arguments are `Sendable`. (Note: the collection itself is a value copy when passed across threads; mutations after transfer are not visible to the sender.)
- `Mutex[T]`, `RwLock[T]`, and `Atomic[T]` (see §2-1.8.2), regardless of `T`.
- Closures whose captured values are all `Sendable` are themselves `Sendable`.

**Explicit `Sendable` with structural verification.** Classes must explicitly declare `implements Sendable`. The compiler does not infer `Sendable` for classes. When a class declares `implements Sendable`, the compiler performs **structural `Sendable` verification**: every `var` field must be of type `Mutex[T]`, `RwLock[T]`, or `Atomic[T]`. `let` fields are exempt — immutable fields are inherently safe to share across threads regardless of type. The one exception to this rule is `synchronized` classes: a class that declares both `synchronized` and `implements Sendable` is exempt from the `var` field restriction — the per-instance mutex provides equivalent thread safety (§3-2.4.13).

A `var` field of any other type — including `Sendable` types such as `int` or `string` — on a class declaring `implements Sendable` is a compile-time error (`E_SENDABLE_UNPROTECTED_VAR`). Even `Sendable` value types are unsafe as unprotected `var` fields because two threads could simultaneously read-modify-write the field, producing a data race.

```loup
@mode(host.native)

# COMPILE ERROR — unprotected var field
class UnsafeCounter : Any implements Sendable {
  var count: int = 0;   # E_SENDABLE_UNPROTECTED_VAR
}

# OK — all mutable state behind Mutex
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

To opt out of structural verification when the compiler cannot see the synchronization mechanism — for example, when safety is ensured by an external lock or protocol — annotate the class with `@unsafe("sendable: <reason>")` (see §3-2.4.6). The `@unsafe` annotation is the explicit, auditable record of the programmer's assertion.

```loup
@mode(web.compiled)

# OK — programmer asserts external synchronization via @unsafe
@unsafe("sendable: access is serialized by the event loop; no concurrent mutation occurs")
class LegacyState : Any implements Sendable {
  var value: int = 0;
}
```

**Error codes.**

| Code | Meaning |
|---|---|
| `E_SENDABLE_UNPROTECTED_VAR` | Class declares `implements Sendable` but has a `var` field not of type `Mutex[T]`, `RwLock[T]`, or `Atomic[T]`; suppressed for `synchronized` classes (§3-2.4.13) |
| `E_NON_SENDABLE_CAPTURE` | A closure passed to `Thread.spawn`, `Thread.spawnWith` or `ThreadPool.run` captures a binding whose type is not `Sendable` |

**Non-`Sendable` types.** Types not implementing `Sendable` may not cross thread boundaries. Attempting to capture a non-`Sendable` value in a `Thread.spawn` closure is a compile-time error (`E_NON_SENDABLE_CAPTURE`).

**Diagnosable subset.** `Sendable`-ness is decided from the capture's *declared* type. Where a capture's type cannot be determined statically the capture is ACCEPTED — the rule under-approximates rather than rejecting valid programs, so a program that compiles today keeps compiling. A capture is rejected when its type resolves to a `class` that does not declare `implements Sendable`, which §2-1.8.1 makes definitive: classes are never implicitly `Sendable`. Captures typed by a primitive, collection, struct, enum, `Option`/`Result`, or a `Sendable`-declaring class (including `Mutex[T]`, `RwLock[T]`, `Atomic[T]`) are accepted, as are captures whose type is not statically known.

A capture of an `excl borrow` binding by the same three functions is `E_EXCL_BORROW_THREAD_CAPTURE` (§3-2.4.1.1) regardless of the captured type's `Sendable`-ness — exclusivity cannot survive a thread boundary.

> **Enforcement status (v1.20).** Both rules in this subsection are normative,
> but neither is uniformly enforced:
>
> - **`E_SENDABLE_UNPROTECTED_VAR` is emitted by the self-hosted compiler only.**
>   `class C implements Sendable { var count: int = 0; }` is rejected by Stage1
>   and ACCEPTED by the Rust bootstrap compiler, which has no production
>   emission site for the code (its unit tests exercise a model of the rule
>   written inside the test file, not the compiler).
> - **The `Sendable` capture rule is enforced for the diagnosable subset above.**
>   Both compilers emit `E_NON_SENDABLE_CAPTURE` for a capture whose declared
>   type is a `class` without `implements Sendable`. A capture whose type is not
>   statically determinable is accepted, so the rule does not yet reject every
>   program the normative text forbids.
> - **`E_EXCL_BORROW_THREAD_CAPTURE` is enforced by both compilers.** It reached
>   that state late: the arm existed for a long time while three separate things
>   kept it unreachable — the Rust bootstrap could not parse an `excl borrow`
>   parameter at all (§3-2.4.1.1), BOTH compilers' parameter lowering discarded
>   the modifier immediately after recognising it, and the capture analysis
>   walked only statements, never a function's parameter list, which is where
>   this rule's subject lives.
>
> Until the remaining cases land, the data-race-freedom guarantee at the end of
> §2-1.8.5 rests partly on the programmer.

#### §2-1.8.2 Shared Mutable State: `Mutex[T]`, `RwLock[T]`, `Atomic[T]`

```loup
namespace sync.thread;

# `unique class` semantics: no cloning, release-on-drop, move-only.
# Releasing the guard via scope exit, explicit `release()`, or being
# passed as `takes guard: MutexGuard[T]` releases the lock.
pub unique class MutexGuard[T] : Any implements WriteGuard[T] {
  pub func get(): T;
  pub func set(value: T): void;
  pub func update(fn: fn(T): T): void;
  pub func release(): void;
}

pub class Mutex[T] : Any implements Sendable {
  pub static func new(initial: T): Mutex[T];
  pub func lock(): MutexGuard[T];
  pub func tryLock(): Option[MutexGuard[T]];
  pub async func lockAsync(): Task[MutexGuard[T]];
  pub func withLock[R](body: fn(MutexGuard[T]): R): R;
  pub func tryWithLock[R](body: fn(MutexGuard[T]): R): Option[R];
}

# `unique class` semantics: no cloning, release-on-drop, move-only.
pub unique class RwLockReadGuard[T] : Any implements ReadGuard[T] {
  pub func get(): T;
  pub func release(): void;
}

# `unique class` semantics: no cloning, release-on-drop, move-only.
pub unique class RwLockWriteGuard[T] : Any implements WriteGuard[T] {
  pub func get(): T;
  pub func set(value: T): void;
  pub func update(fn: fn(T): T): void;
  pub func release(): void;
}

pub class RwLock[T] : Any implements Sendable {
  pub static func new(initial: T): RwLock[T];
  pub func readLock(): RwLockReadGuard[T];
  pub func writeLock(): RwLockWriteGuard[T];
  pub func tryReadLock(): Option[RwLockReadGuard[T]];
  pub func tryWriteLock(): Option[RwLockWriteGuard[T]];
  pub func withRead[R](body: fn(RwLockReadGuard[T]): R): R;
  pub func withWrite[R](body: fn(RwLockWriteGuard[T]): R): R;
}

pub class Atomic[T] : Any implements Sendable {
  # T is restricted to int8, int16, int32, int64, uint8–uint64, float32,
  # float64, or bool. Complex types (complex32, complex64) are not
  # permitted — their natural width (8 or 16 bytes) exceeds single-
  # instruction atomic capabilities on most ISAs. Use a Mutex around a
  # complex-typed cell instead. Attempting to instantiate Atomic[complex64]
  # is E_ATOMIC_COMPLEX at compile time.
  pub static func new(initial: T): Atomic[T];
  pub func load(): T;
  pub func store(value: T): void;
  pub func swap(value: T): T;
  pub func compareExchange(expected: T, desired: T): bool;
  pub func fetchAdd(delta: T): T;   # numeric T only
  pub func fetchSub(delta: T): T;
  pub func fetchAnd(mask: T): T;    # integer T only
  pub func fetchOr(mask: T): T;
  pub func fetchXor(mask: T): T;
}
```

All operations on `Atomic[T]` use sequentially-consistent memory ordering. Weaker orderings are not exposed.

**Implemented surface (v1.20).** Bound today, values as `int`:

```
Mutex:  static new(initial) · lock() · tryLock() · withLock(body) ·
        tryWithLock(body) · isLocked()
RwLock: static new(initial) · readLock() · writeLock() · tryReadLock() ·
        tryWriteLock() · withRead(body) · withWrite(body) · readerCount() ·
        isLocked()
Guards: get() · release(); set(value) on MutexGuard / RwLockWriteGuard only —
        RwLockReadGuard is read-only, which is the distinction that makes
        RwLock worth having over Mutex.
```

- **Atomicity rests on the execution model, not OS primitives.** The
  interpreter is single-threaded, so `lock()` cannot fail to acquire except
  re-entrantly — which this section already defines as a `LifetimeError` trap,
  and which is raised rather than deadlocking. `tryLock()` returns `None` on a
  held lock. When threads land, the internal lock becomes a real OS
  mutex/rwlock and this surface is what it implements.
- **Guards are released explicitly or by the scoped forms**, not on drop.
  There is no drop tracking, so a forgotten `release()` surfaces as a
  `LifetimeError` on the next acquire — LOUD, rather than the silent deadlock a
  real mutex would give. `withLock`/`withRead`/`withWrite` release whether the
  body returns or throws.
- **Using a guard after `release()` is a `LifetimeError`**, approximating the
  `unique class` move-only semantics that are otherwise unrepresentable.
- **The scoped forms acquire as the plain ones do** (loup#729). `withLock` /
  `withRead` / `withWrite` return the BODY's result and never decline: on a lock
  THIS thread holds they raise the same `LifetimeError` as `lock()` /
  `readLock()` / `writeLock()`, and on another thread's hold they block.
  Declining is `tryWithLock`'s job — it answers `None` without running its body.
  (The interpreters and both Wasm hosts used to map the scoped forms to the
  `try*` acquisitions, answering `None` with the body unrun.)
- *Compiler's rule (lifetime faults are catchable on every lane, loup#730).* A
  §2-1.8 lifetime fault — a re-entrant or self-deadlocking acquire, a guard used
  after `release()`, `set()` through a read guard, a second `join()`, a `join()`
  after `detach()`, `ThreadPool.run` after `shutdown()` — is a catchable
  `LifetimeError` carrying the interpreters' message, on the native lanes too.
  A native runtime cannot build the exception (its type id and layout are the
  program's), so a call that can fault is ARMED: the runtime records the fault
  and returns, and the call site raises the `LifetimeError` — or, in a module
  with no handler, stops with the uncaught `LifetimeError: <message>` line and
  exit 1, as an unarmed runtime does (ruling RTF-1).
- **The scoped forms take a lambda whose guard parameter should be annotated**
  (`withLock(func(g: MutexGuard[int]) => g.get())`). An unannotated parameter
  leaves the receiver's type unknown, and a zero-argument `.get()` is
  indistinguishable from reactive signal access on a lane that still intercepts
  the reactive method names (ruling SIG-LIB retires that interception, §2-4.1).
- **`isLocked()` / `readerCount()` are additions**, not in the listing above:
  without drop-based release the lock state is otherwise unobservable, which
  would make the types untestable.
- **`lockAsync` is absent** — it returns a `Task`, and there is no event loop
  to suspend on. `update(fn)` is likewise deferred.
- The types stay **generic** (`Mutex[T]`) even though values are `int`, because
  §17.8.1 requires a `var` field on a `Sendable` class to be `Mutex[T]`,
  `RwLock[T]` or `Atomic[T]`. Stage0 previously knew none of the three, so that
  rule named types the bootstrap compiler did not have.

`Mutex[T]` and `RwLock[T]` implement `Sendable` unconditionally. Their internal lock is a native OS mutex/rwlock. Re-entrant locking (acquiring the same lock from within a `withLock`/`withRead`/`withWrite` callback) is a `LifetimeError` trap in debug builds and undefined behaviour in release builds.

`Mutex[T]` and `RwLock[T]` are in the `sync.thread` module. Their internal lock is a native OS mutex/rwlock under `@mode(host.dual)` and `@mode(host.native)`; **in scripted mode they are backed by the single-threaded execution model** described in the section preamble and in the implemented-surface note above, which is why the re-entrant-lock trap is raised rather than deadlocking there. `Atomic[T]` and the `core.atomic` operations are available in **all modes**, matching §2-2's mode-availability matrix (which marks `core.atomic` ✓ in all six) rather than the narrower restriction this sentence previously stated. What availability MEANS differs by mode, and the distinction is the whole point: under `@mode(host.dual)` / `@mode(host.native)` the operations carry real inter-thread ordering guarantees, which is what the `Ordering` argument is for. On the scripted runtime and both Wasm runtimes execution is single-threaded — `Thread.spawnWith` runs its body at the spawn site — so a read-modify-write is indivisible because nothing else can run during it, and a `fence` has nothing to order against. The operations are therefore semantically correct everywhere, but they do not create parallelism on a mode that has none, and code must not read their availability as a concurrency guarantee. For bare-metal multi-core synchronisation use `Atomic[T]` directly or the `native.atomic` functions (§3-3.20). Using `Mutex[T]` or `RwLock[T]` in `@mode(freestanding)` is `E_FREESTANDING_RUNTIME`; in `@mode(web.compiled)` targeting Wasm they are unavailable.

#### §2-1.8.3 `Thread` and `ThreadHandle`

```loup
namespace sync.thread;

pub class Thread : Any {
  # Spawn a new OS thread running `body`.
  # All values captured by `body` must implement Sendable — compile-time enforced.
  pub static func spawn(body: fn(): void): Thread;

  # Spawn and return a value. T must be Sendable.
  pub static func spawnWith[T: Sendable](body: fn(): T): ThreadHandle[T];

  # Block the calling thread until this thread completes.
  pub func join(): void;

  # Detach the thread; join() is no longer valid after this.
  pub func detach(): void;

  pub static func current(): Thread;
  pub static func sleep(ms: int): void;
  pub static func hardwareConcurrency(): int;

  pub let name: Option[string];
}

pub class ThreadHandle[T: Sendable] : Any {
  pub func join(): T;
  pub func detach(): void;
}

*Compiler's rule (a spawned thread's context, loup#714 / loup#768).* A spawned
thread runs with its program's grants and shares its handles: `runtime`, every
capability a thread acquired (`runtime.fs()`, `runtime.net()`, …) and every
handle derived from one (a file, a socket, a listener) are usable from every
thread of the process, wherever they were made — a thread-per-connection server
accepts on one thread and serves the socket on another. A body's uncaught throw
is raised by `join()`; on a lane that runs the body at the spawn site the throw
is KEPT and raised by `join()` all the same. A failure of the runtime itself
inside a body (an interpreter defect, never a Loup throw) is raised by `join()`
as a `RuntimeError` naming it — never a hang.
```

**Sendable enforcement.** The compiler inspects the free variables of the closure passed to `Thread.spawn` or `Thread.spawnWith`. If any captured variable's type does not implement `Sendable`, the compiler emits a compile-time error naming the non-`Sendable` captures. This is the primary mechanism preventing data races.

**`borrow[~label]` capture restriction.** Closures passed to `Thread.spawn` or `Thread.spawnWith` may not capture any `borrow[~label]` binding (`E_BORROW_THREAD_CAPTURE`). Because lifetime-parameterized structs are implicitly non-`Sendable`, the `Sendable` check prevents most cases; this rule additionally covers direct captures of `borrow[~label]` values that are not wrapped in a struct.

**Example — parallel chunk processing:**

```loup
@mode(host.native)

from sync.thread import (Thread, Mutex);

func parallelSum(chunks: list[list[int]]): int {
  let total = Mutex.new(0);   # Mutex[int] is Sendable

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

**Interaction with ARC.** ARC retain/release operations are atomic (see §3-2.4), making it safe to share strong references across threads. Closures passed to `Thread.spawn` retain their captured objects; the retain count is decremented when the closure completes or the `Thread` is joined. `weak` references may read `None` if the referent is released on another thread — ARC zeroing is atomic and always produces either a valid `None` or a valid pointer.

**Interaction with `async`/`await`.** OS threads and async tasks are separate execution models. A thread may not `await` async tasks. An async task may not call `Thread.spawn` directly (compile-time error in async context). To run thread-parallel work from an async context, use `ThreadPool.run` (§2-1.8.4).

**Implemented surface (v1.20).** Bound today, values as `int`:

```
Thread:        static spawn(body) · spawnWith(body) · current() · sleep(ms) ·
               hardwareConcurrency(); join() · detach(); let name: Option[string]
ThreadHandle:  join() · detach()
```

- **The body runs at the SPAWN SITE, eagerly.** This is the model the
  interpreter already uses for `spawnBlocking` (§2-1.10.1) and for async calls:
  the work runs to completion synchronously and its value plays the
  already-resolved `Task` that `await` unwraps. Eager rather than
  deferred-to-`join` is forced, not chosen: `detach()` means `join()` may never
  be called, so a deferred body would be silently discarded.
- **Fan-out then join is correct** — every body runs, in spawn order, and every
  `join()` observes its result. What is absent is overlap; see the section
  preamble for what that rules out.
- **A throw inside a body surfaces at the spawn site**, not at `join()`. Real
  threads deliver it at `join`, but there is no drop tracking, so a deferred
  exception on a handle that is never joined would be lost entirely. Loud at the
  wrong point beats silent — the same trade §2-1.8.2's guards make.
- **`join()` twice, or after `detach()`, is a `LifetimeError`.** This section
  spells out only the after-detach case; double-join is undefined in pthreads
  and unrepresentable in Rust (`JoinHandle::join` consumes `self`). Faulting
  matches the use-after-`release()` rule the guards already set, and keeps a real
  bug loud rather than returning a stale value.
- **`Thread.sleep(ms)` really sleeps** under the Rust host; the self-hosted
  interpreter accepts and validates it but does not block, having no clock seam.
  With one thread and nothing else able to progress, the delay is unobservable
  either way. Negative durations throw on both.
- **`hardwareConcurrency()` reports the host's real core count** under the Rust
  host and a fixed `1` in the self-hosted interpreter. It answers a property of
  the machine, not of this backend, so sizing a pool by it keeps working
  unchanged when the OS-thread backend lands.

#### §2-1.8.4 `ThreadPool`

```loup
namespace sync.thread;

pub class ThreadPool : Any implements Sendable {
  pub static func new(size: int): ThreadPool;
  pub static func withHardwareConcurrency(): ThreadPool;

  # Submit work to the pool. Returns a Task[T] that resolves when complete.
  # This is the bridge between the async event loop and OS thread parallelism.
  pub func run[T: Sendable](body: fn(): T): Task[T];

  pub func shutdown(): void;
}
```

`ThreadPool.run` submits work to the pool and returns a `Task[T]` that resolves when the work completes. An async function can `await pool.run(heavyWork)` to offload CPU work to a thread without blocking the event loop.

**Implemented surface (v1.20).** Bound today: `static new(size)` ·
`static withHardwareConcurrency()` · `run(body)` · `shutdown()` · `size()`.

- **`run` yields the body's value directly.** The listing types it `Task[T]`;
  the interpreter's `await` is a passthrough over an already-resolved task, so
  `await pool.run(f)` and `pool.run(f)` both give `T`. That is the existing
  async model, not a new narrowing.
- **`run` after `shutdown()` is a `LifetimeError`, not a silent no-op.** A pool
  that accepts work it will never perform is the exact failure this surface
  exists to prevent; the implementation it replaced returned success while
  discarding the closure.
- **`shutdown()` is idempotent** — all submitted work has already run, so there
  is nothing to drain and a second call is not an error.
- **`size()` is an addition**, not in the listing above: without it a pool's
  configured width is unobservable, which would make the type untestable. Same
  reasoning as `isLocked()` in §2-1.8.2.
- **`new(size)` rejects a non-positive size.**

*Compiler's rule (a non-positive pool size).* `ThreadPool.new(size)` with
`size <= 0` raises a catchable `RuntimeError` whose message is
`ThreadPool.new: size must be positive`, on every lane — both interpreters, both
Wasm hosts and every native backend. A native backend checks the size before it
creates the pool; where no handler can catch the error the program stops with the
uncaught-exception line and status 1, as for any uncaught exception (ruling POOL-1,
loup#634).

*Compiler's rule (one text per §2-1.8 fault).* Every lane — both interpreters,
both Wasm hosts, the native C runtime and the libOS — reports each §2-1.8 lifetime
or concurrency fault with the SAME message, byte for byte: `join()` after
`detach()` is `LifetimeError` "join() on a detached thread — §2-1.8.3 makes join
invalid after detach()"; a second `join()` "join() on an already-joined thread — a
thread may be joined at most once"; `detach()` after `join()` "detach() on an
already-joined thread"; `run` after `shutdown()` "ThreadPool.run after shutdown() —
the work would never be performed"; `lock()` on a `Mutex` this thread holds
"Mutex.lock: the lock is already held by THIS thread — re-entrant locking
(§2-1.8.2), which deadlocks a real mutex, or a guard that was never released.";
`readLock()` on an `RwLock` this thread write-holds "RwLock.readLock: the lock is
write-held by THIS thread; acquiring a read lock here would deadlock a real rwlock
(§2-1.8.2)"; `writeLock()` on one it holds "RwLock.writeLock: the lock is
write-held by THIS thread; …" or "RwLock.writeLock: the lock is read-held by THIS
thread; acquiring a write lock here would deadlock a real rwlock (§2-1.8.2)"; any
use of a guard after `release()` "the guard has already been released; §2-1.8.2
guards are move-only and unusable after release"; `set()` through a read guard (a
backstop — the checker refuses it) "set() through a read guard"; and
`Thread.sleep(ms)` with `ms < 0` is a `RuntimeError` "Thread.sleep: negative
duration". A native lane detects the self-deadlocking `RwLock` acquires and the
use of a released guard in every build (loud rather than undefined), and checks a
negative sleep ahead of the runtime call as it checks a pool size — catchable where
a handler can catch it; its other faults are raised inside the runtime and stop the
program with the uncaught line and status 1 (the runtime-to-native-EH bridge is a
recorded gap). Pinned on every lane by `tests/lifetime_texts` (ruling LTXT-1,
loup#692).

**`borrow[~label]` capture restriction.** Closures passed to `ThreadPool.run` may not capture any `borrow[~label]` binding (`E_BORROW_THREAD_CAPTURE`). The pool work item runs on a separate OS thread and may outlive the calling frame, invalidating any lifetime-labeled borrow. Plain `borrow` captures are separately prevented by the existing `Sendable` requirement on the closure's captured types.

```loup
@mode(host.native)

from sync.thread import (ThreadPool);

let pool = ThreadPool.withHardwareConcurrency();

async func renderAllFrames(frames: list[Frame]): Task[list[bytes]] {
  return await TaskGroup.collect(frames, async func(frame) {
    return await pool.run(func() => frame.render());  # CPU work on thread
  });
}
```

#### §2-1.8.5 Restrictions

| Restriction | Reason |
|---|---|
| Non-`Sendable` captures in `Thread.spawn` / `spawnWith` closures | Prevents data races — compile-time error |
| `await` inside thread body closures | Async tasks are event-loop-bound — compile-time error |
| `core.inspect` inside thread bodies | Live runtime registry is not thread-safe — compile-time error |
| `dynamic class` instances crossing thread boundaries | Dynamic fields are not thread-safe — non-`Sendable` by default |
| `Thread`, `ThreadPool`, `Mutex`, `RwLock` in `@mode(freestanding)` | OS threads unavailable — compile-time error (`E_FREESTANDING_RUNTIME`). **Neither scripted mode nor compiled-mode Wasm is restricted**: both bind the full API on the single-threaded backend (see the preamble). On Wasm the surface reaches the host through the `loup_*` shim (`call_dynamic` intrinsics + `method_dispatch`), implemented by BOTH the Rust wasmtime host and the pure-Loup engine, verified three-way against the interpreter — including the arena's raw offsets and catchable `LifetimeError` |
| Bodies making progress simultaneously in scripted mode — a barrier across spawned threads, a producer/consumer handshake, spinning on another thread's flag | Bodies run at their spawn site, so such a program hangs rather than working. Fan-out-then-join is correct. Not a compile-time error: undecidable statically |
| `Atomic[T]` | Available in every mode: `@mode(host.native)`, `@mode(freestanding)`, scripted, and compiled-mode Wasm (via the shim; single-threaded semantics off-native) |
| `spawnBlocking` in scripted mode or Wasm targets | Available — backed by host thread pool; see §2-1.10.1 |
| `native.simd` and `Vec[T, N]` outside `@mode(host.native)` or `@mode(freestanding)` | SIMD intrinsics require native code generation |
| `@vectorize` in `@mode(host.scripted)` | Auto-vectorization hint ignored — JIT does not honour compile-time SIMD hints; compile-time lint advisory |

**Data race freedom guarantee.** Any program that passes all compile-time `Sendable` checks is free of data races on objects visible to `core.reflect`. The guarantee does not extend to `extern native` objects accessed from multiple threads — native thread safety is the FFI caller's responsibility.



---

### §2-1.9 Multi-Threaded Async Executor

*(This section is normative. Executor configuration (`RuntimeConfig`, `ExecutorConfig`, work-stealing executor, `@concurrent`, actor isolation, `ThreadLocal[T]`) applies to `@mode(host.dual)` and `@mode(host.native)` — the only modes with OS threads (§1-2.6). `spawnBlocking` is available in all non-freestanding modes — see §2-1.10.1. `TaskLocal[T]` is available in all non-freestanding modes. `TaskLocal[T]` is not available in `@mode(freestanding)` — there is no async task scheduler to bind task-local storage to.)*

The default Loup async executor is a cooperative, single-threaded event loop. For programs that require true parallel execution of async tasks across CPU cores, the executor may be reconfigured to a **work-stealing multi-threaded model** via the `RuntimeConfig` API.

#### §2-1.9.1 `ExecutorConfig` and `RuntimeConfig`

```loup
namespace runtime;

enum ExecutorConfig {
  SingleThreaded;                    # Default — cooperative, single OS thread
  MultiThreaded(workers: int);       # Explicit worker count
  MultiThreaded;                     # Defaults to Thread.hardwareConcurrency()
}

struct RuntimeConfig {
  asyncExecutor:     ExecutorConfig = ExecutorConfig.SingleThreaded;
  blockingPoolSize:  int = 512;    # Max threads in the blocking pool (§2-1.9.3)
  maxTaskQueueDepth: int = 0;      # 0 = unlimited; positive value caps pending spawn queue (§2-5.1)
}

# Configure the runtime. Must be called before any await expression evaluates.
# Typically the first call in main(). Calling after the event loop starts
# throws RuntimeConfigError.
func configure(config: RuntimeConfig): void;
```

**Single-threaded (default).** `ExecutorConfig.SingleThreaded` preserves the cooperative, single-threaded model exactly as specified in §1-2.1. No additional `Sendable` constraints are applied to async task captures — the executor is deterministic and race-free by construction.

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
  # Must be the first statement — before any await
  runtime.configure(RuntimeConfig(
    asyncExecutor: ExecutorConfig.MultiThreaded,
  ));

  # From this point, spawned async tasks run on any worker thread
  let results = await TaskGroup.collect(urls, async func(url) => fetch(url));
}
```

`runtime.configure` is a top-level call that SHALL appear before any `await` expression in the entry point. The compiler emits a warning if `await` precedes `runtime.configure` in the same function. At runtime, calling `runtime.configure` after the event loop has started is a `RuntimeConfigError`.

#### §2-1.9.2 Work-Stealing Executor Semantics

When `ExecutorConfig.MultiThreaded` is active:

- **Task distribution.** Tasks spawned via `spawn`, `TaskGroup.collect`, and `async func` calls are placed on the spawning thread's local task queue. Idle worker threads steal tasks from peer queues.
- **Cooperative scheduling.** Each worker cooperatively schedules tasks at `await` points. A task does not preempt another task on the same worker.
- **Thread affinity.** There is no guaranteed affinity between a task and a specific worker thread. A task may resume on a different worker after an `await` — this is the fundamental reason `Sendable` constraints apply (§2-1.9.4).
- **Completion ordering.** Tasks within a single `await group` or `TaskGroup.collect` call complete in arbitrary order, as in single-threaded mode. Result assembly is handled by the structured concurrency primitives.
- **Sendability enforcement.** In multi-threaded executor mode, async task captures are subject to `Sendable` constraints at the call site (§2-1.9.4).

#### §2-1.9.3 `spawnBlocking` — Blocking Work Bridge

```loup
namespace sync.thread;

# Runs `body` on the dedicated blocking thread pool.
# Returns a Task[T] that resolves when body completes.
# T must be Sendable so the result can cross back to the async executor.
# Available on all targets including scripted mode and Wasm (see §2-1.10.1).
func spawnBlocking[T: Sendable](body: fn(): T): Task[T];

# Variant with timeout (ms). Throws BlockingTimeoutError if body does not
# complete within the allotted milliseconds.
func spawnBlockingWithTimeout[T: Sendable](ms: int, body: fn(): T): Task[T];

class BlockingTimeoutError : Exception {
  pub let timeoutMs: int;
}
```

`spawnBlocking` runs a synchronous closure on a **blocking thread pool** that is separate from the async executor's worker threads. This prevents CPU-bound or synchronous blocking work from stalling the event loop.

**Blocking pool sizing.** The pool is sized by `RuntimeConfig.blockingPoolSize` (default 512). Threads are created on demand and reused. If all threads are occupied and the pool is at capacity, `spawnBlocking` enqueues the work and the calling task suspends until a thread is available.

**Availability.** `spawnBlocking` is available in `@mode(web.scripted)`, `@mode(web.compiled)` (Wasm), `@mode(host.scripted)`, `@mode(host.dual)`, and `@mode(host.native)`. It is **not available** in `@mode(freestanding)` — there is no async event loop to suspend. See §2-1.10.1 for scripted-mode and Wasm-specific semantics. In all available modes it offloads synchronous work off the async event loop and is the recommended path for any operation that could block for more than ~1 ms.

**`ThreadPool` vs `spawnBlocking`.** `ThreadPool` (§2-1.8.4) is a manually-managed pool with explicit lifecycle, suitable when the program controls pool sizing and shutdown timing. `spawnBlocking` uses the runtime-managed blocking pool and is the recommended default for ad-hoc blocking work.

**Error semantics.** If `body` throws an exception, the exception propagates from the `await spawnBlocking(...)` call site as if thrown directly in the async context.

**Example:**

```loup
@mode(host.native)

from sync.thread import (spawnBlocking);

async func processImage(path: string): Task[bytes] {
  let raw = await runtime.fs.readAsync(path);
  # encode() is CPU-bound synchronous work — offload to blocking pool
  let encoded = await spawnBlocking(func() => encode(raw));
  return encoded;
}
```

**`spawnBlocking` error codes:**

| Code | Condition |
|---|---|
| `E_BLOCKING_CAPTURE` | Non-`Sendable` type captured by a `spawnBlocking` closure |
| `E_AWAIT_IN_BLOCKING` | `await` expression used inside a `spawnBlocking` body closure |

#### §2-1.9.4 Task Sendability Rules (Multi-Threaded Executor)

The executor mode determines whether `Sendable` constraints apply to async task closures:

**Rule 1 — Single-threaded executor.** In `SingleThreaded` executor mode, async task closures (the body of `spawn`, `async func` calls, `TaskGroup.collect` callbacks) may capture any type. No `Sendable` constraint is imposed.

**Rule 2 — Multi-threaded executor.** In `MultiThreaded` executor mode, async task closures SHALL only capture values whose types implement `Sendable`. A non-`Sendable` capture at a `spawn` or `async func` call site is a compile-time error naming the offending captured variables.

```loup
@mode(host.native)

# In MultiThreaded executor mode:
let sharedCache: Cache = Cache.new();   # Cache does not implement Sendable

async func fetch(): Task[void] {
  let data = await spawn download();          # OK: captures nothing non-Sendable
  let r = await spawn process(sharedCache);   # ERROR: Cache is not Sendable
}
```

**Rule 3 — Binary-level enforcement.** The executor mode is a property of the binary, determined by the `runtime.configure()` call in the entry point. The compiler enforces Rule 2 for all async captures in `@mode(host.native)` files when the program is configured for `MultiThreaded` execution. `@mode(freestanding)` has no async executor and Rule 3 does not apply.

**Rule 4 — `@concurrent` forces Sendable regardless of mode.** Functions annotated `@concurrent` (§2-1.9.5) are always subject to `Sendable` capture constraints, regardless of the active executor mode.

#### §2-1.9.5 `@concurrent` Annotation

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

#### §2-1.9.6 Actor Isolation in Multi-Threaded Contexts

The `Actor[M]` model (§2-1.6) is inherently safe in multi-threaded executor contexts without changes to the actor API.

**Rule: Actors are implicitly `Sendable`.** `Actor[M]` instances implement `Sendable` unconditionally. The actor's internal state is accessed only from the actor's serial message handler, which processes one message at a time on a single thread at a time regardless of which worker is executing. This makes `Actor[M]` a safe island of serial state within a concurrent executor.

**Rule: Non-`Sendable` state may be held inside actors.** Because the message handler is serial, actor-private state does not need to implement `Sendable`. Non-`Sendable` types may be used freely as internal actor state.

**Rule: Message types must be `Sendable` in multi-threaded mode.** Messages sent via `Actor[M].send(msg)` or `Actor[M].ask(msg)` cross thread boundaries (from the sender's worker to the actor's handler). When `ExecutorConfig.MultiThreaded` is active, `M` must implement `Sendable`. This is enforced at the call sites of `send` and `ask` — compile-time error if `M` is not `Sendable`.

```loup
@mode(host.native)

# Internal state does not need to be Sendable — stays inside the actor
class LocalState : Any {
  var counter: int = 0;
}

# Messages DO need to be Sendable — they cross thread boundaries
enum CounterMsg {
  Increment;
  Reset;
}

# CounterMsg is implicitly Sendable (all-unit enum with no non-Sendable payloads)
# so Actor[CounterMsg] is valid in MultiThreaded executor mode.
```

In `SingleThreaded` executor mode, `M` has no `Sendable` constraint. The restriction is imposed only when the active executor is `MultiThreaded`.

#### §2-1.9.7 Thread-Local Storage (`ThreadLocal[T]`)

```loup
namespace sync.thread;

# Available in @mode(host.dual) and @mode(host.native); compile-time error in
# @mode(web.scripted), @mode(web.compiled), @mode(host.scripted), and @mode(freestanding).
pub class ThreadLocal[T] : Any {
  # Creates a new ThreadLocal. `init` is called once per OS thread on first access.
  pub static func new(init: fn(): T): ThreadLocal[T];

  # Returns this thread's value, initializing lazily on first call.
  pub func get(): T;

  # Replaces this thread's value.
  pub func set(value: T): void;

  # Resets to uninitialized; `init` will be called on next `get()`.
  pub func reset(): void;
}
```

`ThreadLocal[T]` is implicitly `Sendable` regardless of `T`, because the `T` value is never shared across threads — each OS thread holds an independent instance.

**Semantics:**

- `get()` in an async task body returns the value for the **OS worker thread** currently executing the task, not the task itself. In a multi-threaded executor, a task may observe different thread-local values if it resumes on a different worker after an `await`. If thread-following semantics are required, use `TaskLocal[T]` (§2-1.9.8).
- `get()` in a `spawnBlocking` body returns the value for the blocking pool thread executing the closure.
- Thread-local values are destroyed when the OS thread exits.

**Use cases:** Per-thread allocator scratch buffers, PRNG state, thread-specific profiling contexts.

#### §2-1.9.8 Task-Local Storage (`TaskLocal[T]`)

```loup
namespace runtime;

# Available on all targets including Wasm and scripted mode.
pub class TaskLocal[T] : Any {
  pub static func new(): TaskLocal[T];

  # Installs `value` for the current task and all child tasks spawned within `body`.
  # Returns a Task[R] that resolves with body's result.
  pub func withValue[R](value: T, body: async fn(): R): Task[R];

  # Returns the value set by the nearest enclosing withValue() in this task's
  # ancestry, or None if not set.
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
    await processStep1();        # requestId.get() == Some(id)
    await processStep2();        # still Some(id), even after a thread hop

    await TaskGroup.collect(subTasks, async func(task) {
      print(requestId.get()!);   # inherited by child tasks
      await task.execute();
    });
  });
}
```

`TaskLocal[T]` is the primary mechanism for propagating request-scoped context (trace IDs, authentication principals, locale settings) through async server applications without explicit parameter threading.

#### §2-1.9.9 Executor Hand-off (`runtime.executor`)

**New in v1.21 (ruling RUNLOOP-1).** A UI backend owns its platform's main loop, or is driven by it, and has to let
ready tasks run without starving input and without blocking while work is ready. §2-1.9.1 configures the executor;
this subsection is the one entry point that turns it from outside.

```
# On the runtime root (§2-5.1), a property like every capability sub-namespace:
let executor: lang.executor.ExecutorControl;

interface ExecutorControl {
  # Run ready tasks until none is ready or budgetNs of wall time is spent (checked between tasks).
  func turn(budgetNs: int): ExecutorTurn;
  # What a blocking platform wait must also wake on, or None when the lane has nothing to wait for.
  func wakeHandle(): Option[WakeHandle];
}
struct ExecutorTurn { ran: int; ready: int; nextTimerNs: Option[int]; }   # ready: tasks still ready after the turn
opaque class WakeHandle : Any { }   # an fd on POSIX, a HANDLE on Windows; read only by a backend's sys module
```

- **Per-lane answers.** Stage0's interpreter runs its scheduler inside `turn`. The self-hosted interpreter runs `async`
  eagerly, so nothing is ever pending: `turn` answers `{0, 0, None}` and `wakeHandle` answers `None`. Managed native has
  no scheduler and refuses reachable `async`, so it gives the same constant answers. A lane that later gains a
  scheduler implements the two calls, and no backend changes.
- **The loop belongs to the backend, and its contract is the order of the steps:** `executor.turn`, read and record
  inputs, the UI core's `step`, present. A native desktop backend (Wayland, macOS, Win32) wraps the steps in its
  platform wait, which also wakes on `wakeHandle()` and has a zero timeout while `ready > 0`. A host that drives the
  loop through callbacks (a browser page, for the deferred browser host of §2-4.7) runs the same steps in the same order
  from each callback and never blocks; while `ready > 0` it requests another callback, and it does not use
  `wakeHandle()`. `specs/loup-ui-backend-contract.md` §B.3 gives both forms.
- The UI core and the `loup.ui.*` packages never block, wait or start a thread; only a backend's own `sys` module waits.
- `runtime.executor` needs no permission, because it grants nothing. In `@mode(freestanding)` there is no `runtime`
  (§2-5.1), and the Helios backend's loop has no executor.
- The interface's namespace (`lang.executor`), and whether `WakeHandle` is an opaque class or a second built-in type,
  are fixed when the row is implemented (backend contract §B.14, item 1).


---

### §2-1.10 Script-Mode Parallelism

*(This section is normative. All constructs in this section are available in scripted mode and on all Wasm targets. `ScriptWorker` and `WorkerChannel[T]` are additionally available in `@mode(web.compiled)` Wasm targets and in `@mode(host.native)` via an embedded Wasm runtime (see §1-2.6). They are not available in `@mode(freestanding)`, which has no async or thread primitives; use `native.atomic` and `InterruptGuard` (§3-3.20, §3-3.24) instead.)*

Loup's scripted runtime executes cooperatively on a single thread by default (§1-2.1). Four mechanisms provide parallelism within the scripted and Wasm execution environments:

- **`spawnBlocking`** (§2-1.10.1) — offloads synchronous CPU-bound closures to a host-managed blocking thread pool.
- **`ScriptWorker`** (§2-1.10.2) — spawns an isolated Wasm instance with its own heap, communicating via `Sendable`-typed message channels.
- **Shared-memory concurrency** (§2-2) — `SharedBuffer[T]`, `SharedRef[T]`, `shared class`, atomics, and shared synchronization primitives enable zero-copy cross-thread data access on top of the Wasm threads proposal's shared linear memory and `atomic.*` opcodes.
- **`for concurrent`** (§2-1.11) — parallel iteration over an integer range or array. In scripted modes, the default strategy is sequential; `@strategy(simd)` is available in `@mode(web.compiled)` (lowering to Wasm SIMD) but not in JIT/scripted modes. `@strategy(threadPool)` requires Wasm threads support in the host environment.

These four mechanisms are complementary: `spawnBlocking` is for short synchronous compute tasks that return a single value; `ScriptWorker` is for long-running or stateful parallel workloads that require bidirectional communication; the §2-2 shared-memory model is for data that must be concurrently read/written by multiple workers without copy overhead; and `for concurrent` is for embarrassingly-parallel index-bound iteration where the compiler can statically prove disjointness.

#### §2-1.10.1 `spawnBlocking` in Scripted Mode

`spawnBlocking` is declared in `sync.thread` (§2-1.9.3) and is available on all targets. This subsection specifies its behaviour specifically in scripted mode and Wasm targets.

**Host thread pool.** On browser targets (`--target browser`), `spawnBlocking` dispatches the closure to the browser's dedicated worker thread pool managed by the Loup runtime bootstrap. On non-browser Wasm and scripted CLI targets, the runtime maintains a native OS thread pool equivalent to the `--target native` blocking pool, sized by the host runtime configuration (default 512 threads; not configurable via `RuntimeConfig` in scripted mode).

**Sendable constraint.** The closure passed to `spawnBlocking` SHALL only capture values whose types implement `Sendable`. Captured values are serialized for transfer to the blocking thread and the return value `T` is serialized back. The serialization mechanism is the same structured-clone protocol used by `ScriptWorker` channels (§2-1.10.4). A closure capturing a non-`Sendable` type is a compile-time error (`E_BLOCKING_CAPTURE`).

**GC object restriction.** The body of a `spawnBlocking` closure executes in an environment where the Loup GC heap of the calling script is not accessible. GC-managed objects (classes, closures, `list`, `dict`, `set`) may only be passed if they are `Sendable` and are therefore serialized by value. Mutable class instances are not `Sendable` by default; only classes explicitly declaring `implements Sendable` (with appropriate internal synchronization) may cross the boundary.

**No `await` inside `spawnBlocking`.** The body closure is synchronous. `await` expressions inside `spawnBlocking` are a compile-time error (`E_AWAIT_IN_BLOCKING`).

**Example — CPU-bound work in scripted mode:**

```loup
from sync.thread import (spawnBlocking);

async func compressData(raw: bytes): Task[bytes] {
  # compress() is synchronous and CPU-bound — offload to blocking pool
  let compressed = await spawnBlocking(func() => compress(raw));
  return compressed;
}
```

**Equivalence.** `spawnBlocking` in scripted mode is semantically equivalent to its `--target native` form (§2-1.9.3). The only difference is the backing implementation: native OS threads on `--target native`, host thread pool on Wasm/scripted.

#### §2-1.10.2 `ScriptWorker` — Isolated Worker Instances

`ScriptWorker` provides true parallelism in scripted and Wasm environments by spawning an isolated Loup Wasm instance with its own GC heap. Workers communicate with the host script exclusively through typed `WorkerChannel[T]` message channels. Because workers do not share a heap, all values transferred across the channel must implement `Sendable` and are serialized by copy (§2-1.10.4).

```loup
namespace concurrent;

# Spawns a new isolated Wasm worker instance running the module at `modulePath`.
# `modulePath` must be a string literal resolvable at compile time.
# The worker's entry point is the exported `async func workerMain(channel: WorkerChannel[M]): Task[void]`.
# M must implement Sendable.
pub class ScriptWorker[M: Sendable] : Any {
  pub static async func spawn(modulePath: string): Task[ScriptWorker[M]];

  # Send a message to the worker. Returns immediately; delivery is asynchronous.
  # Throws WorkerTerminatedError if the worker has already exited.
  pub func send(msg: M): void;

  # Receive the next message sent by the worker via channel.reply().
  # Suspends until a message is available or the worker exits.
  # Returns None when the worker has terminated and all queued replies are drained.
  pub async func receive(): Task[Option[M]];

  # Wait for the worker to exit cleanly (workerMain returns).
  # Throws WorkerPanicError if the worker threw an unhandled exception.
  pub async func join(): Task[void];

  # Signal the worker to terminate. Pending messages are discarded.
  # It is not an error to terminate an already-terminated worker.
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
# host.loup
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
# worker.loup
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

#### §2-1.10.3 `WorkerChannel[T]` — Typed Message Channel

`WorkerChannel[T]` is the worker-side counterpart to `ScriptWorker[T]`. It is only accessible inside a worker module's `workerMain` function.

```loup
namespace concurrent;

# Available only inside a worker entry point (workerMain parameter).
# T must implement Sendable.
pub class WorkerChannel[T: Sendable] : Any {
  # Receive the next message from the host. Returns None when the host has
  # called terminate() or the host script exits.
  pub async func receive(): Task[Option[T]];

  # Send a reply message to the host.
  # Throws WorkerTerminatedError if the host has terminated the channel.
  pub func reply(msg: T): void;

  # Close the channel from the worker side. The host's receive() will drain
  # any queued replies and then return None.
  pub func close(): void;
}
```

`WorkerChannel[T]` may not be stored as a module-level `var` or captured in a `Thread.spawn` closure. It is valid only within the dynamic extent of `workerMain`. Attempting to store it outside `workerMain` is a compile-time error (`E_CHANNEL_ESCAPE`).

#### §2-1.10.4 Serialization Contract

All values transferred across a `ScriptWorker` channel or through `spawnBlocking` are serialized by the **Loup structured transfer protocol**, which is defined as follows:

**Transfer rules:**

| Type | Transfer behaviour |
|---|---|
| `int`, `float`, `bool`, `string`, `bytes` | Copied by value; no allocation on the receiving side shares memory with the sender. |
| `complex32`, `complex64`, `complex` (§1-4.1.6) | Copied by value (8-byte or 16-byte copy). Independent values on each side. |
| `array[T, rank]` (§1-4.10) where `T` is `Sendable` | Storage is value-copied. Independent storage on each side; shape, order, and base are preserved. Slicing into a partial view *before* transfer copies only the viewed elements (the destination receives a contiguous independent array, not a view). |
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

#### §2-1.10.5 Worker Scope Restrictions

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
| Shared arenas (§2-2) | ✅ | A worker may attach to arenas shared via `ScriptWorker.share(arena)`. |



### §2-1.11 `for concurrent` — Parallel Iteration

`for concurrent` is a control flow form for declaring data-parallel iteration over arrays and integer ranges. It expresses *intent for parallel execution* — the runtime is permitted (but not required) to dispatch iterations to a thread pool, vectorize them with `native.simd`, offload them to an accelerator, or execute them sequentially. The choice is implementation-defined and may depend on iteration count, target mode, target architecture, and runtime profiling.

`for concurrent` is the translation target for Fortran's `DO CONCURRENT` and serves as a first-class form for parallel-friendly numerical code.

**Syntax.**

```loup
for concurrent (let i in 0..n) {
    c[i] = a[i] + b[i];
}

for concurrent (let i in 0..m, let j in 0..n) {
    c[i, j] = a[i, j] * b[i, j];
}

for concurrent (let i in 1..=n) {
    process(items[i]);
}
```

The header may declare one or more loop variables, each with its own range. Multi-variable headers iterate the Cartesian product of the ranges; the runtime is free to schedule any iteration order, including parallel scheduling across all variables simultaneously.

**Range types.** The range expression must be:

- An integer range literal: `start..stop` (half-open, exclusive of `stop`) or `start..=stop` (inclusive of `stop`).
- An `Iterable[int]` value whose elements are the iteration indices, where the runtime can prove (via type analysis or the implicit specialization for built-in range types) that the iteration is finite and indices are statically bounded.
- An integer-typed array (1-D), iterating its elements (rare; usually a range is more efficient).

The bounds of each range are evaluated **once** at loop entry; subsequent mutations to the variables holding bounds do not affect the iteration. Non-integer ranges or ranges with non-positive step are `E_FOR_CONCURRENT_RANGE_INVALID`.

**Body restrictions.** The loop body is subject to compile-time restrictions that ensure data-race freedom:

1. **No shared mutable state.** Local variables declared inside the body are per-iteration. Captures from the enclosing scope must be either:
   - Immutable (`let` bindings), or
   - `array[T, rank]` values where the body's writes (across all iterations) are to non-overlapping indices, verified by the compiler's index analysis (see "Index disjointness verification" below), or
   - `Atomic[T]` cells (§2-1.8.2), or
   - `SharedRef[T]` values (§2-2.6) with explicit atomic operations.

   Writing to a non-`Atomic`, non-`Shared`, non-array captured `var` is `E_FOR_CONCURRENT_SHARED_MUT`.

2. **Body closures must be `Sendable`.** Captures must satisfy the same `Sendable` rules as `Thread.spawn` closures (§2-1.8). `borrow[~label]`-typed captures are prohibited (`E_FOR_CONCURRENT_BORROW_LABEL`).

3. **No `await` inside the body.** `for concurrent` is synchronous; iterations execute on worker threads or vector lanes that are not bound to the async event loop. `await` inside a `for concurrent` body is `E_FOR_CONCURRENT_AWAIT`.

4. **No `break` or `continue`.** Iterations may execute in any order or in parallel; `break` would have no well-defined meaning. `break` and `continue` inside `for concurrent` are `E_FOR_CONCURRENT_BREAK_CONTINUE`. Use a sequential `for` loop or a parallel reduction primitive (`array.any`, `array.all` over a boolean array; `array.argmin` / `array.argmax` for index-of-extreme; see §21.10.3) when early termination or first-match semantics are required.

5. **No exceptions propagating out of the body.** A `for concurrent` body that throws an exception is observed as `ConcurrentIterationError` at the loop's exit point, with the original exception attached as `cause`. The first exception thrown by any iteration is the propagated cause; subsequent iterations may continue, complete, or be cancelled at the implementation's discretion.

**Index disjointness verification.** When the body writes to an `array[T, rank]` indexed by the loop variable(s), the compiler performs a static check that the writes across iterations cannot collide. The check is conservative: it accepts forms that are obviously disjoint and rejects forms that are obviously not, with a "consult the docs" guidance for ambiguous cases.

Accepted disjoint forms:

```loup
for concurrent (let i in 0..n) {
    c[i] = ...;            # distinct i → distinct c[i]
}

for concurrent (let i in 0..m, let j in 0..n) {
    c[i, j] = ...;         # distinct (i, j) pairs
}

for concurrent (let i in 0..n) {
    c[i, 0] = ...;         # distinct i; column 0 only
    c[i, 1] = ...;
}
```

Rejected (likely race) forms:

```loup
for concurrent (let i in 0..n) {
    c[i % m] = ...;        # E_FOR_CONCURRENT_INDEX_NONDISJOINT
}

for concurrent (let i in 0..n) {
    c[indices[i]] = ...;   # E_FOR_CONCURRENT_INDEX_NONDISJOINT
                           # (could be made safe with @assume(distinct(indices)))
}
```

Indirect indexing (`c[indices[i]]`) and modular indexing (`c[i % m]`) are conservatively rejected. The `@assume(distinct(...))` annotation acknowledges programmer responsibility for indirect-index disjointness:

```loup
@assume(distinct(indices))
for concurrent (let i in 0..n) {
    c[indices[i]] = ...;   # accepted; programmer asserts indices are unique
}
```

`@assume(distinct(arr))` is a `for concurrent`-local annotation: it asserts that the named binding's element values are pairwise distinct, suppressing the disjointness check for index expressions that read from `arr`. The annotation has effect only on the immediately following `for concurrent` statement. It is treated as an `@unsafe` assertion — incorrect use causes data races and is undefined behaviour. The corresponding `@unsafe` reasoning model is specified in §3-2.4.6.

**Reductions.** `for concurrent` does not support direct reductions (e.g., `total += a[i]`); reductions require either an accumulator with explicit atomic semantics or a separate parallel reduction primitive. The clean form for reductions:

```loup
import core.array as arr;
let total = arr.sum(a);                    # parallel reduction, vendor-tuned

# Or with explicit atomic accumulator:
import core.atomic;
let total = core.atomic.Atomic[float](0.0);
for concurrent (let i in 0..n) {
    total.fetchAdd(a[i]);
}
let result = total.load();
```

Atomic-cell reductions are correct but slower than purpose-built reduction primitives because every iteration synchronizes; the parallel sum primitive uses tree reductions to limit synchronization to log(n) rather than n events.

**Implementation choice.** The compiler and runtime select an implementation strategy from:

- **Sequential loop.** When iteration count is small, when the target lacks parallelism (e.g., `@mode(web.scripted)` without workers), or when the body is too short for parallelization to amortize overhead.
- **SIMD vectorization.** When iterations are independent, the body uses only operations that map to vector instructions, and `@mode(host.native)` or `@mode(freestanding)` is the build mode.
- **Thread pool dispatch.** When iteration count is large enough to amortize thread overhead and `@mode(host.dual)` or `@mode(host.native)` provides OS threads.
- **Accelerator dispatch.** When the body operates on `loup.tensor.Tensor` values or `array[T, rank]` values that have been bound to a HAL device, and the body's operations are expressible as accelerator kernels.

The choice is not user-visible by default. To force a specific strategy, annotate the loop:

```loup
@strategy(sequential)        for concurrent (let i in 0..n) { ... }
@strategy(simd)              for concurrent (let i in 0..n) { ... }
@strategy(threadPool)        for concurrent (let i in 0..n) { ... }
@strategy(threadPool(threads: 4))  for concurrent (let i in 0..n) { ... }
@strategy(accelerator)       for concurrent (let i in 0..n) { ... }
```

`@strategy(simd)` requires AOT compilation: `@mode(host.native)`, `@mode(host.dual)`, `@mode(web.compiled)`, or `@mode(freestanding)`. In `host.dual`, SIMD is available only via the AOT pipeline. In `web.compiled`, SIMD lowers to Wasm SIMD instructions (gated on the target browser supporting them). Applying `@strategy(simd)` in a JIT/scripted mode is `E_FOR_CONCURRENT_STRATEGY_NOT_AVAILABLE`. `@strategy(threadPool)` requires `@mode(host.native)` or `@mode(host.dual)`; in `web.compiled` it requires the host environment to provide Wasm threads; in `@mode(freestanding)` it requires a user-supplied scheduler registered via `@scheduler` (§3-3.16a). Without an available thread pool in any of these modes, applying `@strategy(threadPool)` is `E_FOR_CONCURRENT_STRATEGY_NOT_AVAILABLE`. `@strategy(accelerator)` requires the body to be expressible as an accelerator kernel and the array values to be bound to a HAL device (§21.32) or to be `loup.tensor.Tensor` values; the strategy is unavailable in modes without HAL support and is `E_FOR_CONCURRENT_STRATEGY_NOT_AVAILABLE` otherwise. Mismatched strategy/mode combinations are diagnosed at compile time.

**Termination semantics.** The loop completes when all iterations have completed. A `for concurrent` loop is *not* an async construct — control returns to the calling function only after the last iteration has finished. To run a `for concurrent` block without blocking the caller's thread, wrap it in `pool.run(...)` or `spawnBlocking(...)`:

```loup
async func processAsync(data: array[float, 1]): Task[void] {
    await pool.run(func() {
        for concurrent (let i in 0..data.shape[0]) {
            data[i] = transform(data[i]);
        }
    });
}
```

**Availability.**

| Mode | Behaviour |
|---|---|
| `host.native` | Full support — sequential, SIMD, thread-pool, and accelerator strategies all available |
| `host.dual` | Full support — SIMD only via the AOT pipeline |
| `host.scripted` | Sequential only — `@strategy(simd)` and `@strategy(threadPool)` are `E_FOR_CONCURRENT_STRATEGY_NOT_AVAILABLE` |
| `web.compiled` | Sequential and SIMD (via Wasm SIMD) — thread-pool requires Wasm threads which are gated on the host environment |
| `web.scripted` | Sequential only |
| `freestanding` | Sequential and SIMD — thread-pool requires user-supplied scheduler |

In all modes, the *semantics* are identical: any data race in the body would be undefined behaviour, and the compiler's static checks ensure none occur. The strategy choice affects performance only.

**Grammar.** A new `ForConcurrentStmt` production is added in §1-19.18 (Syntactic Grammar — v1.20 Additions) and reachable from `BlockStmt` in §1-19.4:

```ebnf
ForConcurrentStmt ::= "for" "concurrent" "(" ConcurrentBindingList ")" Block
ConcurrentBindingList ::= ConcurrentBinding { "," ConcurrentBinding }
ConcurrentBinding ::= "let" Identifier "in" Range
```

The `Range` non-terminal is defined alongside the v1.20 grammar additions in §1-19.18.

| Code | Mode | Condition |
|---|---|---|
| `E_FOR_CONCURRENT_RANGE_INVALID` | All | Range bound is non-integer or step is non-positive |
| `E_FOR_CONCURRENT_SHARED_MUT` | All | Body writes to non-array, non-`Atomic`, non-`Shared` captured `var` |
| `E_FOR_CONCURRENT_BORROW_LABEL` | All | Body captures a `borrow[~label]`-typed value |
| `E_FOR_CONCURRENT_AWAIT` | All | `await` expression appears inside the body |
| `E_FOR_CONCURRENT_BREAK_CONTINUE` | All | `break` or `continue` appears inside the body |
| `E_FOR_CONCURRENT_INDEX_NONDISJOINT` | All | Index analysis cannot prove disjointness; use `@assume(distinct(...))` if assertion is correct |
| `E_FOR_CONCURRENT_STRATEGY_NOT_AVAILABLE` | All | `@strategy(...)` annotation requests a strategy not supported in the build mode |


---

---

## §2-2 Shared-Memory Concurrency

*(This section is normative.)*

This section specifies Loup's shared-memory concurrency model: mechanisms by
which multiple execution contexts — worker Wasm instances, native OS threads,
and a mixture of both — operate on the same underlying memory without copying.
The model complements the message-passing primitives of §2-1.10 and the native
OS-thread primitives of §2-1.8–§2-1.9; it is not a replacement for either.

### §2-2.1 Overview and Mode Availability

Shared-memory concurrency in Loup rests on five layered primitives:

1. **The `Shareable` marker trait** (§2-2.2) — identifies types whose values may be simultaneously accessed by multiple execution contexts.
2. **`SharedBuffer[T]` and `SharedArray[T]`** (§2-2.3) — flat, typed views over shared linear memory for POD data (numeric arrays, byte buffers, fixed-size structs).
3. **`core.atomic` operations** (§2-2.4) — atomic load, store, read-modify-write, and compare-exchange primitives mapping directly to Wasm `atomic.*` opcodes on Wasm targets and to platform atomic instructions on native targets.
4. **`SharedRef[T]` and `shared class`** (§2-2.5–§2-2.6) — atomic reference-counted handles to objects allocated in a shared arena. `shared class` has a normatively specified layout and vtable enabling cross-mode interop (§2-2.7).
5. **Shared synchronization primitives** (§2-2.8) — `SharedMutex[T]`, `SharedRwLock[T]`, `SharedCondVar`, `SharedSemaphore`, `SharedBarrier`, and `SharedQueue[T]`, built on atomics and the Wasm threads proposal's `memory.atomic.wait` / `memory.atomic.notify` primitives (or platform equivalents).

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
   satisfying the arena header contract (§2-2.5) AND the target platform
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
primitives in this section. The cross-mode ABI contract (§2-2.7) guarantees
that a `shared class` compiled via the JIT pipeline and the AOT native pipeline
produces byte-identical memory layouts, enabling a scripted caller and a native
callee to operate on the same arena-allocated object without marshalling.

### §2-2.2 `Shareable` Marker Trait

`Shareable` is a marker interface indicating that a type is safe for simultaneous
access by multiple execution contexts:

```
namespace core;

pub interface Shareable : Sendable {}
```

`Shareable` is a strict subset of `Sendable` (§2-1.8.1): every `Shareable` type
is also `Sendable`, but not every `Sendable` type is `Shareable`. `Sendable`
permits transfer across a thread boundary by value copy; `Shareable` permits
simultaneous reference from multiple threads to the same memory.

**Implicit `Shareable` implementations.** The following types are implicitly
`Shareable` without an explicit `implements Shareable` declaration:

- All primitive types whose in-memory representation is a fixed-width value: `int8`, `int16`, `int32`, `int64`, `uint8`, `uint16`, `uint32`, `uint64`, `float32`, `float64`, `complex32`, `complex64`, `bool`, `char`.
- `array[T, rank]` (§1-4.10) when `T` is `Shareable` and the array's storage is itself shared (`SharedArray[T]`-backed) or is borrowed by reference. A locally-owned `array[T, rank]` is `Sendable` but not `Shareable` — only the shared-storage form qualifies.
- All `struct` types whose fields are all `Shareable`, provided the struct does not declare a `[lifetime ~name]` parameter and contains no `borrow[~name]` fields.
- All `enum` types whose variant payloads are all `Shareable`, with the same lifetime restrictions as structs.
- `SharedRef[T]` for any `T` that is a `shared class`.
- `SharedBuffer[T]` and `SharedArray[T]` for any `T` that is `Shareable`.
- Fixed-size arrays `T[N]` where `T` is `Shareable`.
- `Atomic[T]` (§2-2.4) for primitive `T`.

**Non-`Shareable` types.** The following types are not `Shareable` and cannot
be fields of a `shared class` or elements of `SharedArray[T]`:

- `string` (internally GC-managed with a mutable representation in some backends).
- `list[T]`, `dict[K,V]`, `set[T]` — the built-in growable collections.
- `local class` instances and references to them.
- Closures (`fn(...): T` with captured environment) that capture non-`Shareable` values.
- `Task[T]` (async task handles are scheduler-bound).
- `WorkerChannel[T]` (bound to `workerMain` scope per §2-1.10.3).

To share a string across threads, copy it into a `SharedArray[char]` or wrap
it in a `shared class StringHandle { chars: SharedArray[char]; }`. To share a
growable collection, use the shared collection types in §2-2.8 (`SharedQueue[T]`,
`SharedStack[T]`).

**Explicit opt-in.** A class may explicitly declare `implements Shareable` only
if it is a `shared class` — a `local class` cannot implement `Shareable`. The
compiler enforces this at the class declaration:

```
shared class LockFreeCounter implements Shareable {   # OK — shared class can
  let count: Atomic[int64];
  new() { this.count = Atomic[int64].new(0); }
  func increment(): int64 { return this.count.fetchAdd(1); }
}

local class FooLocal implements Shareable {   # E_SHAREABLE_LOCAL_CLASS
  ...
}
```

A `shared class` with all-`Shareable` fields implicitly implements `Shareable`;
the explicit declaration is optional but permitted for documentation.

### §2-2.3 `SharedBuffer[T]` and `SharedArray[T]`

`SharedBuffer[T]` and `SharedArray[T]` provide flat, typed views over shared
linear memory for plain-old-data.

```
namespace core;

# A raw shared memory region of `byteLength` bytes, divisible into typed
# views. The underlying bytes are allocated in a SharedArrayBuffer (Wasm)
# or mmap'd shared region (native). The buffer is reference-counted; the
# backing memory is freed when all SharedBuffer handles and all views into
# it are dropped.
pub shared class SharedBuffer[T: Shareable] {
  pub static func create(elementCount: int,
                          arena: SharedRef[SharedArena]? = None): SharedRef[SharedBuffer[T]];
  pub static func fromBytes(bytes: borrow bytes,
                             arena: SharedRef[SharedArena]? = None): SharedRef[SharedBuffer[T]];

  pub let length: int;                 # element count
  pub let byteLength: int;             # length * sizeof(T)
  pub let elementSize: int;            # sizeof(T) in bytes

  pub func get(index: int): T;         # atomic on index boundaries when T is primitive
  pub func set(index: int, value: T): void;

  pub func slice(start: int, end: int): SharedArray[T];   # non-owning view
  pub func asArray(): SharedArray[T];                     # full-range view

  # Bulk transfer. Copies memory atomically word-by-word; does not provide
  # cross-element atomicity (use a SharedMutex for that).
  pub func copyTo(dst: borrow SharedBuffer[T],
                   srcStart: int, dstStart: int, count: int): void;
  pub func fill(value: T, start: int = 0, end: int? = None): void;

  # Return the raw bytes of the buffer as a fresh `bytes` value (full copy).
  # For zero-copy access, use asArray() or slice() instead.
  pub func snapshot(): bytes;

  # Arena of this buffer — useful for cross-mode transfer decisions.
  pub func arena(): SharedRef[SharedArena];
}

# A non-owning typed view over a SharedBuffer. Multiple SharedArray views may
# exist over the same underlying SharedBuffer. Views carry their own bounds
# but share the backing memory.
pub shared class SharedArray[T: Shareable] {
  pub let length: int;
  pub let elementSize: int;            # sizeof(T) in bytes

  pub func get(index: int): T;
  pub func set(index: int, value: T): void;

  pub func slice(start: int, end: int): SharedArray[T];
  pub func asBuffer(): SharedRef[SharedBuffer[T]];   # recover the underlying buffer

  # Element-wise iteration. The body runs on the calling thread; it does not
  # parallelize on its own. To parallelize, pair with `partition` and spawn
  # a `ScriptWorker` or `Thread` per chunk.
  pub func forEach(body: fn(i: int, v: T): void): void;

  # Splits the range [0, length) into `n` chunks suitable for distribution
  # across `n` workers. Returns half-open intervals (start, end) covering
  # the whole range.
  pub static func partition(length: int, n: int): list[(int, int)];
}
```

**Implemented surface (v1.20).** The listing above is the target shape. What is
bound in the language today is narrower, in ways that do not change the
representation:

```
# SharedArena is a required, explicit argument, and the element width is
# given directly rather than inferred from `T`.
pub static func create(arena: SharedArena, elementCount: int, elementSize: int): SharedBuffer;

pub func length(): int;          pub func elementSize(): int;
pub func byteLength(): int;      pub func offset(): int;
pub func get(index: int): int;   pub func set(index: int, value: int): void;
pub func fill(value: int): void; pub func slice(start: int, end: int): SharedBuffer;
```

- **No `[T]` yet.** Builtin types carry no generic parameters, so `create` takes
  `elementSize` explicitly. Permitted widths are the portable set — 1, 2, 4, 8
  bytes — which is exactly the set `core.atomic` (§2-2.4) supports at 8/16/32/64
  bits. The width is what the storage and the atomics key on, so `[T]` layers on
  later as sugar without changing any stored bytes.
- **Values are `int`.** `Shareable` includes floats, but storing them needs an
  agreed bit encoding per width, which belongs with the `Shareable` derivation.
- **`length`/`byteLength`/`elementSize` are methods, not `let` fields**, for the
  same reason as §2-2.5's arena accessors.
- **`slice` returns a `SharedBuffer`, not a `SharedArray[T]`** — it is already a
  non-owning view over the parent's bytes, which is `SharedArray`'s defining
  property; the separate type is a naming distinction pending `[T]`.
- **`offset()` is an addition**, not in the listing above: `core.atomic`
  addresses linear memory, and an index is only meaningful with the base.
- **Not yet present:** `fromBytes`, `copyTo`, `snapshot`, `asArray`, `arena`,
  `forEach`, `partition`, and the `SharedArray[T]` type itself. `create` returns
  a handle rather than `SharedRef[SharedBuffer[T]]` because `SharedRef` (§2-2.6)
  does not exist.

**Access semantics (non-atomic).** The `get` and `set` methods on
`SharedBuffer[T]` and `SharedArray[T]` perform **non-atomic** loads and stores
when `T` is a primitive wider than the target's natural atomic width. For
race-free access to a specific element across threads, use the methods in
§2-2.4 (`atomicLoad`, `atomicStore`, etc.) which take a `SharedArray[T]` and
an index as arguments.

**Bounds checking.** All indexed accesses are bounds-checked. Out-of-range
access throws `IndexError` at runtime. The compiler MAY elide bounds checks
when the index is statically provable to be in range.

**Endianness.** Multi-byte primitives in `SharedBuffer[T]` are stored
**little-endian** on every target, matching the §2-2.5 arena header that
describes the region holding them.

Earlier drafts specified native endianness here. That contradicted §2-2.5: the
header is a cross-mode ABI contract written little-endian unconditionally, so a
big-endian target would have produced a region whose header and payload
disagreed. It is also unimplementable for the primary use case — a shared region
is meant to be readable from both native code and Wasm, and Wasm linear memory
is little-endian by definition, so a native-endian payload written on a
big-endian host would be unreadable from the Wasm side of the same region.

On little-endian targets (x86-64, aarch64, riscv, Wasm) the two rules coincide
and nothing observable changes. On big-endian targets (s390x) the buffer stores
little-endian and the host byte-swaps. Programs that want the target's native
byte order in memory should use `Volatile[T, Big]` / `Volatile[T, Little]`
(§3-3.9), which makes the order explicit at the access site.

**Layout.** `SharedBuffer[T]` for primitive `T` uses the natural alignment
of `T` (aligned on `sizeof(T)` boundaries). For `struct` `T`, the layout
follows the `@repr(C)` rules — field order, natural alignment, and trailing
padding as specified by the target C ABI.

### §2-2.4 `core.atomic` — Atomic Operations

The `core.atomic` namespace provides atomic operations on `SharedArray[T]`
indices and on `Atomic[T]` cell wrappers.

```
namespace core.atomic;

# Memory ordering parameter — semantics match C11 and Wasm.
pub enum Ordering {
  Relaxed;         # no ordering constraint
  Acquire;         # no prior ops can be reordered after
  Release;         # no subsequent ops can be reordered before
  AcqRel;          # Acquire + Release (RMW ops only)
  SeqCst;          # sequential consistency (default for all ops unless specified)
}

# Atomic load. T must be one of: int8, int16, int32, int64, uint8, uint16,
# uint32, uint64, float32, float64, bool. Complex types (complex32, complex64)
# are not supported as atomic-cell types — their natural width (8 or 16 bytes)
# exceeds single-instruction atomic capabilities on most ISAs. Calling any
# `core.atomic` operation with a complex-typed `SharedArray[T]` is
# `E_ATOMIC_COMPLEX` at compile time. Use a Mutex or RwLock around a
# complex-typed cell instead.
pub func atomicLoad[T: Shareable](arr: borrow SharedArray[T], index: int,
                                    ord: Ordering = SeqCst): T;

pub func atomicStore[T: Shareable](arr: borrow SharedArray[T], index: int,
                                     value: T, ord: Ordering = SeqCst): void;

# Read-modify-write operations. Return the old value.
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

# Compare-and-swap. Succeeds if current value == expected; stores `desired`
# on success. Returns (success, actualValue).
pub func compareExchange[T: Shareable](arr: borrow SharedArray[T], index: int,
                                        expected: T, desired: T,
                                        successOrd: Ordering = SeqCst,
                                        failureOrd: Ordering = Acquire):
                                        (bool, T);

# Wait/notify — block until the value at `index` differs from `expected`.
# `timeoutMs` of None means wait indefinitely; 0 means poll without blocking.
# Returns: Ok if woken by notify, Timeout if timed out, NotEqual if value
# already differed.
pub enum WaitResult { Ok; Timeout; NotEqual; }

pub func wait[T: Integer + Shareable](arr: borrow SharedArray[T], index: int,
                                       expected: T, timeoutMs: int? = None): WaitResult;

# Wake up to `count` waiters blocked on (arr, index). Returns the number
# actually woken. `count = -1` wakes all.
pub func notify[T: Integer + Shareable](arr: borrow SharedArray[T], index: int,
                                         count: int = 1): int;

# Memory fences — order prior/subsequent operations without data operation.
pub func fence(ord: Ordering): void;

# Atomic cell — a single-element shared atomic of type T. Implemented as
# an inline value type (struct-like) so it can be embedded directly as a
# field of a shared class without an extra level of indirection.
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
  pub func fetchOr (mask: T, ord: Ordering = SeqCst): T where T: Integer;
  pub func fetchXor(mask: T, ord: Ordering = SeqCst): T where T: Integer;
}
```

**Implemented surface (v1.20).** The listing above is the target shape. What is
bound today is narrower, and bound as METHODS on `SharedBuffer` rather than free
functions:

```
pub func atomicLoad(index: int): int;
pub func atomicStore(index: int, value: int): void;
pub func atomicExchange(index: int, operand: int): int;   # returns the OLD value
pub func atomicFetchAdd(index: int, operand: int): int;   # ditto, all five
pub func atomicFetchSub(index: int, operand: int): int;
pub func atomicFetchAnd(index: int, operand: int): int;
pub func atomicFetchOr (index: int, operand: int): int;
pub func atomicFetchXor(index: int, operand: int): int;
pub func atomicCompareExchange(index: int, expected: int, desired: int): (bool, int);
```

> **Not the same operation as `atomicCompareExchangeU64`/`U32` (§3-3.4.2).** The
> freestanding intrinsics of that name take a byte **address** rather than an
> element index, carry an explicit memory `order`, and return a bare `1`/`0`
> success flag — *not* the `(bool, int)` pair returned here, and never the
> observed value. Code moving between managed and freestanding code must not
> carry the return shape across.


- **Methods, not free functions over `borrow SharedArray[T]`.** That type does
  not exist (§2-2.3), `borrow` is not expressible on a builtin receiver, and
  binding names as generic as `fetchAdd`/`exchange` into the prelude — the only
  namespace both the bootstrap and self-hosted compilers agree on — would be a
  poor trade. The receiver supplies what `arr` did.
- **Every operation is `SeqCst`, and the `Ordering` parameter is absent rather
  than partial.** Each signature above declares `ord: Ordering = SeqCst`, and
  the language has no default arguments today. Rather than ship a half-usable
  `Ordering` surface, the strongest ordering is used unconditionally. **This
  narrowing is safe by construction**: `SeqCst` is this section's own default
  and the strongest guarantee, so a program written against it stays correct
  when weaker orderings become expressible — the cost is performance, never
  correctness. `Ordering` and `fence` are therefore not yet bound.
- **Atomicity currently rests on the execution model, not on hardware.** The
  interpreter is single-threaded, so a read-modify-write cannot be interleaved
  and these operations are genuinely atomic with respect to any observer that
  exists. When threads land they must lower to the instructions in the mapping
  tables below; that is a codegen change at the call site, and this surface is
  what it will implement.
- **Values wrap at the element width**, matching a real atomic of that width:
  the store truncates and the returned "old" value is what was stored. At width
  8 the value spans the register, so a wrap surfaces as the `int`
  reinterpretation of the unsigned result.
- **`compareExchange` compares `expected` at the element width.** Comparing the
  raw argument would make CAS unsatisfiable on narrow buffers — a stored `uint8`
  can never equal an expected `256`, so a caller that read the truncated value
  back would retry forever.
- **`wait`/`notify` are deliberately absent.** Both are meaningful only with
  more than one thread: `wait` could return `NotEqual` or block forever with
  nothing able to wake it. An API that can only fail is worse than none.
- **`Atomic[T]` is bound**, with the cell methods spelled without the `atomic`
  prefix (the receiver already says it is atomic):

```
pub static func new(initial: int): Atomic;
pub func load(): int;                       pub func store(value: int): void;
pub func exchange(operand: int): int;       # returns the OLD value, as do all
pub func fetchAdd(operand: int): int;       # five fetch* operations
pub func fetchSub(operand: int): int;
pub func fetchAnd(operand: int): int;
pub func fetchOr (operand: int): int;
pub func fetchXor(operand: int): int;
pub func compareExchange(expected: int, desired: int): (bool, int);
```

  The TYPE keeps its `[T]` parameter even though values are integers, because
  §17.8.1 requires a `var` field on a `Sendable` class to be `Mutex[T]`,
  `RwLock[T]` or `Atomic[T]` — so both `Atomic[int]` and `Atomic[bool]` must
  annotate. `Atomic[bool]` stores 0/1. Cells are 8 bytes wide regardless of `T`.

  `new` takes no arena, so cells are allocated from the **per-context default
  arena** (§2-2.5 `IS_DEFAULT`), created lazily on first use with a fixed
  capacity; exhausting it raises the same catchable out-of-memory error as any
  other arena. Giving each cell its own region would spend a 64-byte header on
  8 bytes of payload.

  §2-2.4 calls `Atomic[T]` a value type laid out inline in an enclosing
  `shared class`. That is a native-layout property; here a cell is a handle,
  which is observationally identical for load/store/RMW.

  **`Mutex[T]` and `RwLock[T]` are bound too** — see §2-1.8.2, which is their
  normative home. An earlier revision of this note said a single-threaded mutex
  would be actively misleading; that was too strong, and §2-1.8.2 shows why:
  `lock()` always succeeding is *correct* with one thread, `tryLock()` reporting
  contention is observable, and this section's own re-entrant-lock
  `LifetimeError` trap is fully detectable — a real bug class that deadlocks a
  native build. What genuinely cannot work single-threaded is blocking until
  another thread releases, which cannot arise with one thread. That is the
  distinction from `wait`/`notify`, where blocking IS the whole semantic.

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

### §2-2.5 `SharedArena` and Allocation

`SharedArena` is the memory region in which `shared class` instances,
`SharedBuffer[T]` backing stores, and synchronization-primitive state live.
Arenas are the unit of cross-context memory sharing: two execution contexts
(workers, native threads, native modules in the same process) share data by
attaching to the same arena.

```
namespace core;

# A handle to a shared memory region. Reference-counted itself — the arena
# is freed when the last SharedArena handle AND all objects allocated within
# it are dropped.
pub shared class SharedArena {
  # Create a new shared arena.
  # - `capacityBytes` — initial size (rounded up to the Wasm page boundary of 64 KiB).
  # - `maxBytes` — maximum size the arena may grow to; None means "same as capacity".
  # The arena grows automatically up to maxBytes when allocation pressure requires.
  pub static func create(capacityBytes: int, maxBytes: int? = None): SharedRef[SharedArena];

  pub let capacityBytes: int;
  pub let usedBytes: int;
  pub let maxBytes: int;   # matches capacityBytes if non-growable

  # Bytes allocated and not yet freed. Changes as shared classes are allocated
  # and released within this arena.
  pub func liveBytes(): int;

  # Force compaction of the arena's free list. Does not move live objects;
  # only coalesces free regions. Optional — the allocator runs this opportunistically.
  pub func compact(): void;

  # Opaque arena identifier — stable for the arena's lifetime. Used for
  # equality comparison and diagnostic logging.
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

**Arena header.** Every shared arena begins with a fixed-layout header that
both JIT-compiled and AOT-compiled code parse identically:

```
Offset  Size  Field                    Description
---------------------------------------------------------------------------
 0      8     magic                    "LOUPARNA" (0x414E52414D4F4F4C LE)
 8      4     version                  ABI version; see §2-2.7
12      4     flags                    see the flag table below
16      8     size                     total arena size in bytes
24      8     freeListRoot0            head of size-class 0's free list
32      8     freeListRoot1            head of size-class 1's free list
40      8     bumpPointer              next unallocated offset
48      8     weakSideTable            offset of the weak-reference side table
56      8     lockWord                 arena rwlock (growth + free-list CAS)
64      ...   (allocator-managed)
```

The header is exactly 64 bytes and 64-byte (cache-line) aligned, so the
allocator's hot words do not straddle a line under concurrent access.

Flags: bit 0 = `IS_DEFAULT`, bit 1 = `IS_PRIMORDIAL`, bit 2 = `IS_READ_ONLY`.

> **Corrected 2026-07-29.** This table previously described a different layout
> (a 4-byte `"LOUP"` magic, then `capacityBytes`/`usedBytes`/`freeListRoot`/
> `weakTableRoot`/`metadataRoot`/`refcount`/`flags`). That layout was never
> implemented and was internally inconsistent with this section's own prose,
> which requires growth to be "coordinated across all attached contexts via an
> arena-internal rwlock on the header" — the old table had no lock word, and no
> bump pointer for the allocator it also mandates. The layout above is the one
> `loup_core::arena` implements, `codegen_wasm::shared_arena_layout` pins
> against it, the cross-mode ABI test asserts, and
> `specs/1-bootstrap-2-shared-memory-concurrency/design.md` specifies. Two
> free-list roots rather than one because the allocator is segregated by size
> class (below).

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
transferred to a `ScriptWorker` (§2-1.10.2) via `ScriptWorker.share(arena)`,
after which the worker's attached arena is the same memory region. Similarly,
a native thread spawned via `Thread.spawn` (§2-1.8) inherits the spawning
thread's attached arenas. Detachment is automatic when the context exits.

**Module-level initialization.** The main execution context's default shared
arena is created lazily on first `shared` allocation, including allocations
performed during module-level top-level statement execution (§1-2.4.3 for
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

### §2-2.6 `SharedRef[T]` and `shared class`

`SharedRef[T]` is the ref-counted handle to a `shared class` instance. It is
Loup's analogue to Rust's `Arc<T>` with a stable cross-mode ABI.

**On the `T` parameter.** `SharedRef[T]` accepts a type parameter `T` that
MUST be a `shared class` type. The bound `T: shared class` is a v1.18
**class-kind bound** — a new form of generic bound (§1-12) that constrains
`T` to a specific class memory strategy. Class-kind bounds are distinct
from trait bounds: they restrict which *declarations* of `T` are allowed
(which is decidable at compile time from the type's declaration form),
not which *interfaces* `T` implements. Other class-kind bounds are
`T: local class` and `T: class` (matches either). Class-kind bounds may
be combined with trait bounds via `+`: `T: shared class + Serializable`.

```
namespace core;

# Value type, not itself a shared class — see §21.1.5 rationale.
pub struct SharedRef[T: shared class] implements Shareable, Sendable {
  # Clone — increments the atomic refcount and returns a new handle
  # to the same instance. Runs in O(1).
  pub func clone(): SharedRef[T];

  # Downgrade to a weak reference. `SharedWeakRef[T]` is the shared-arena
  # weak reference type; see §1-8 (weak field qualifier) and the Loup
  # Standard Library Reference §21.1.6 for the full contract.
  pub func downgrade(): SharedWeakRef[T];

  # Strong reference count (observational only; inherently racy — use for
  # diagnostics, not logic).
  pub func strongCount(): int;

  # Weak reference count (observational only).
  pub func weakCount(): int;

  # Pointer equality — true iff both handles refer to the same instance.
  pub func same(other: borrow SharedRef[T]): bool;

  # Arena of the referenced instance (returns a cloned SharedRef[SharedArena]).
  pub func arena(): SharedRef[SharedArena];
}
```

**Allocation syntax.** A `shared class` instance is allocated by calling the
class's constructor with the `shared` keyword prefix, optionally naming an
arena:

```
# Allocate in the default arena for the current context.
let v: SharedRef[Vertex] = shared Vertex(1.0, 2.0, 3.0);

# Allocate in a specific arena.
let myArena = SharedArena.create(16.MiB);
let v2: SharedRef[Vertex] = shared(myArena) Vertex(4.0, 5.0, 6.0);
```

The `shared` prefix is a compile-time marker, not a runtime expression.
`shared Vertex(...)` evaluates to a `SharedRef[Vertex]`, not to a bare
`Vertex`. There is no way to obtain a non-refcounted reference to a `shared
class` instance except via `borrow` (§2-2.9).

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
reference, matching the ARC-equivalent contract of §1-8.1.1.

**Cross-thread access.** Multiple threads may simultaneously hold
`SharedRef[T]` handles to the same instance. Simultaneous read access is
always safe. Simultaneous mutation of a field without synchronization is a
data race and produces undefined behavior unless the field type is an
`Atomic[T]` or unless access is gated by a `SharedMutex`/`SharedRwLock`.
Loup's borrow checker enforces this statically via the ownership verbs
(§2-2.9).

**Cycle handling.** `SharedRef[T]` does not automatically collect cycles.
Users must break cycles with `WeakRef[T]`. The specification explicitly does
not mandate a cycle collector for shared objects; implementations SHOULD
document whether they provide one as a diagnostic aid.

### §2-2.7 Cross-Mode ABI Contract

*(This subsection is normative.)*

The cross-mode ABI is the set of layout and protocol rules that both the
JIT (Wasm) and AOT (native) compilers honor when compiling `shared
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

### §2-2.8 Shared Synchronization Primitives

The following primitives build on `core.atomic` and the wait/notify operations
of §2-2.4. All are `shared class` types allocated in a specific arena.

```
namespace sync.shared;

# Mutex guarding a single shared value. `lock()` returns a scope-bound
# guard implementing `Scoped[T]`; the lock is held for the guard's lifetime.
pub shared class SharedMutex[T: Shareable] {
  pub static func new(initial: T, arena: SharedRef[SharedArena]? = None): SharedRef[SharedMutex[T]];

  # Acquire exclusive access. Blocks until the lock is acquired.
  pub async func lock(): SharedMutexGuard[T];

  # Non-blocking attempt. Returns None if the lock is held.
  pub func tryLock(): Option[SharedMutexGuard[T]];

  # Combinator form — acquire, call body with a guard, release automatically
  # when body returns. Exceptions thrown in body propagate after release.
  pub async func withLock[R: Sendable](body: fn(guard: SharedMutexGuard[T]): R): R;

  # Acquire even if the lock was poisoned by a prior panic. The caller takes
  # responsibility for validating the protected state.
  pub async func lockRecover(): SharedMutexGuard[T];

  pub let isPoisoned: bool;
}

# Scope-bound guard returned by `lock()`. `unique class` semantics: no
# cloning, release-on-drop, move-only. The lock is held for exactly the
# guard's lifetime — dropping the guard (scope exit, explicit `release()`,
# or being passed to a consuming function with `takes guard:
# SharedMutexGuard[T]`) releases the lock.
#
# Implements `WriteGuard[T]` (§1-11.2), which extends `ReadGuard[T]` and
# `Releasable`. Because `Releasable : Scoped[Self]` with default
# `scope_enter`/`scope_exit`, the guard works with `with` blocks
# without further declarations: `with (g = mutex.lock()) { g.set(...) }`.
pub unique class SharedMutexGuard[T: Shareable] : Any implements WriteGuard[T] {
  pub func get(): T;
  pub func set(value: T): void;
  pub func update(fn: fn(T): T): void;

  # Explicit unlock. The guard becomes invalid; further use raises
  # `E_GUARD_RELEASED` at compile time (when statically detectable) or
  # `ReleasedGuardError` at runtime. Normally guards release automatically
  # when the surrounding scope exits.
  pub func release(): void;
}

# Reader-writer lock. Many readers or one writer, not both.
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

# Scope-bound read guard — allows multiple concurrent holders. `unique class`
# semantics: no cloning, release-on-drop, move-only.
pub unique class SharedRwReadGuard[T: Shareable] : Any implements ReadGuard[T] {
  pub func get(): T;
  pub func release(): void;
}

# Scope-bound write guard — exclusive access. `unique class` semantics: no
# cloning, release-on-drop, move-only.
pub unique class SharedRwWriteGuard[T: Shareable] : Any implements WriteGuard[T] {
  pub func get(): T;
  pub func set(value: T): void;
  pub func update(fn: fn(T): T): void;
  pub func release(): void;
}

# Condition variable — for waiting on a predicate over the protected state.
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

# Counting semaphore.
pub shared class SharedSemaphore {
  pub static func new(count: int, arena: SharedRef[SharedArena]? = None): SharedRef[SharedSemaphore];

  pub async func acquire(): void;
  pub async func acquireN(count: int): void;
  pub func tryAcquire(): bool;
  pub func release(count: int = 1): void;

  pub let availableCount: int;   # observational
}

# Barrier — n threads each call wait(); they all proceed together.
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

# Multi-producer, multi-consumer channel. Lock-free internally.
pub shared class SharedQueue[T: Shareable] {
  pub static func new(capacity: int, arena: SharedRef[SharedArena]? = None): SharedRef[SharedQueue[T]];

  pub async func send(value: T): void;          # blocks if full
  pub async func receive(): T;                  # blocks if empty
  pub func trySend(value: T): bool;
  pub func tryReceive(): Option[T];
  pub func close(): void;                       # wakes all waiters; future sends fail

  pub let length: int;                          # observational
  pub let capacity: int;
  pub let isClosed: bool;
}

pub class QueueClosedError : Exception {}
```

**Lock ordering.** When a program acquires multiple shared locks, the
`@lockOrder(n)` annotation (§3-2.4) applies to `SharedMutex` and
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

### §2-2.9 Ownership Verbs and Shared Types

The existing ownership verbs (§3-2.4) apply to `SharedRef[T]` and `shared
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
  let nodes: SharedArray[SharedRef[Node]] = guard.get();
  for i in 0..<nodes.length {
    let node = nodes.get(i);          # one retain at index
    processNode(borrow node);          # zero refcount traffic inside loop
  }
  # guard releases automatically at end-of-scope
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

### §2-2.10 Worker Integration

`ScriptWorker` (§2-1.10.2) is extended with arena-sharing methods:

```
namespace concurrent;

# Extension to ScriptWorker[M] — methods in this section appear on the
# same class defined in §2-1.10.2.
pub class ScriptWorker[M: Sendable] {
  # Share an arena with this worker. The worker's default shared arena is
  # augmented with this arena; the worker may allocate in it and reference
  # existing objects within it. Idempotent — sharing an already-attached
  # arena is a no-op.
  pub func share(arena: SharedRef[SharedArena]): void;

  # Detach an arena from this worker. If the worker has outstanding
  # SharedRef instances into the arena, the arena remains live until those
  # refs are released. Calling detach on an arena not currently shared is
  # an error (E_ARENA_NOT_SHARED).
  pub func detach(arena: SharedRef[SharedArena]): void;

  # Send a SharedRef to the worker without serialization. The worker must
  # have access to the referenced object's arena (via share() or by creating
  # the arena itself).
  pub func sendRef[T: shared class](ref: SharedRef[T]): void;

  # Receive a SharedRef sent by the worker via channel.replyRef().
  pub async func receiveRef[T: shared class](): Option[SharedRef[T]];

  # List arenas currently shared with this worker.
  pub func sharedArenas(): list[SharedRef[SharedArena]];
}

pub class WorkerChannel[T: Sendable] {
  # Worker-side counterpart to host's sendRef/receiveRef.
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

### §2-2.11 Error Codes

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
| `E_ATOMIC_COMPLEX` | `Atomic[T]` instantiated with a complex type (`complex32`, `complex64`), or `core.atomic` free function called on a `SharedArray[T]` whose element type is a complex type; use a `Mutex` around the cell instead |
| `E_BORROW_THREAD_CAPTURE` | `borrow T` captured in a cross-thread closure (existing; now applies to shared refs too) |
| `E_CLASS_KIND_MISMATCH` | Generic type argument violates a class-kind bound (e.g., `T: shared class` receives a `local class`) |
| `E_GUARD_RELEASED` | Use of a `SharedMutexGuard` / `SharedRwReadGuard` / `SharedRwWriteGuard` after `release()` (statically-detectable cases) |
| `E_ARENA_NOT_SHARED` | `ScriptWorker.detach(arena)` called for an arena not currently shared with the worker |
| `E_PARSE_DUAL_STRATEGY` | Class declaration includes both `local` and `shared` memory-strategy modifiers (mutually exclusive) |
| `E_SHARED_ON_LOCAL` | `shared` constructor prefix applied to a non-`shared class` type (§2-2) |
| `E_SHARED_MISSING_PREFIX` | Constructor for a `shared class` invoked without the required `shared` prefix (§2-2) |

| Runtime error | Condition |
|---|---|
| `WorkerArenaNotAttachedError` | `sendRef` target worker lacks the referenced arena |
| `PoisonedLockError` | Acquired a `SharedMutex` / `SharedRwLock` poisoned by a prior panic |
| `QueueClosedError` | Send/receive on a closed `SharedQueue` |
| `ResurrectionError` | Finalizer stored `this` in a reachable location |
| `FinalizerTimeoutError` | Finalizer exceeded implementation-defined time limit |
| `ReleasedGuardError` | Use of a released guard (dynamically-detected cases) |
| `SharedAllocatorUnavailableError` | Shared allocation on a target without arena support |
| `SharedArenaOutOfMemoryError` | An arena cannot satisfy an allocation (`SharedArena.alloc`, `SharedBuffer.create` / `slice`, `Atomic.new`, `Mutex.new`, `RwLock.new`); carries `requested_bytes: int`, `arena_capacity_bytes: int` |
| `SharedArenaCorruptedError` | Arena header magic mismatch at attach time; carries `observed_magic: int` |
| `SharedArenaVersionMismatchError` | Arena ABI version unsupported; carries `observed_version: int`, `expected_version: int` |
| `AtomicWidthUnsupportedError` | Atomic width unsupported at run time; carries `requested_bits: int` |
| `DefaultArenaAlreadyInitializedError` | `configureDefaultSharedArena` after the default arena exists |

Each of these twelve is a built-in exception class extending `Exception`
(stdlib reference §21.21): catchable by its own name, constructible by name
with a message (its own fields then read `0` / `""`), and raised by the runtime
with its fields set. `FinalizerTimeoutError` carries `class_name: string`,
`timeout_ms: int`. The native lanes have no shared-arena runtime: they raise
none of them, and a native build that constructs one is refused
(`E-BUILD-NATIVE`).

---

## §2-3 FFI and Host Interop

*(This section is normative.)*

Loup provides an explicit foreign function interface for calling JavaScript APIs and native shared libraries. FFI declarations are opt-in and syntactically visible.

### §2-3.1 JavaScript Interop (`extern js`)

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
- `extern js` declarations are only valid on `browser`, `node`, `bun`, and `deno` targets (i.e. targets where a JavaScript runtime is present). Using `extern js` in `@mode(host.native)` or `@mode(freestanding)` files is a compile-time error (`E_EXTERN_JS_NOT_NATIVE`, defined in §3-3.22).

**SharedArrayBuffer aliasing (normative).** Any `extern js` declaration that accepts or returns a typed array (e.g., `Uint8Array`, `Float32Array`) backed by a `SharedArrayBuffer` MUST carry `@unsafe("sharedMemory: <reason>")` at the declaration site. The reason string SHALL document which Loup tasks or workers share the buffer and the synchronization protocol used. Without this annotation, the compiler treats the buffer as exclusively owned by the Loup side. Concurrent access by JS code to memory also accessed by Loup constitutes a data race outside Loup's ownership model.

`lang.interop.js` provides `SharedView[T]` as a safe wrapper for `SharedArrayBuffer` access — all reads and writes go through `native.atomic`-backed operations, making the shared-memory protocol explicit at the type level:

```loup
from lang.interop.js import (SharedView);

# Safe: all accesses are atomic
let view = SharedView[uint32].fromBuffer(sharedBuf)
view.store(0, 42u32)
let val = view.load(0)   # returns uint32
```

Raw `extern js` declarations of `SharedArrayBuffer`-backed types must use `@unsafe("sharedMemory: ...")` and are subject to the programmer's own synchronization discipline.

### §2-3.2 `@jsexport`

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

### §2-3.3 Typed JS Facades (`lang.interop.js`)

`lang.interop.js` provides typed wrappers over common Web and Node.js APIs:

```
namespace lang.interop.js;

# HTTP
pub class Request  : Any { pub let url: string; pub let method: string; pub let body: Option[bytes]; }
pub class Response : Any {
  pub let status: int;
  pub let ok: bool;
  pub func text(): Task[string];
  pub func json(): Task[Any];
  pub func bytes(): Task[bytes];
}
pub func fetch(target: string | Request): Task[Response];

# Timers
pub func setTimeout(ms: int, callback: fn(): void): TimerHandle;
pub func clearTimeout(handle: TimerHandle): void;
pub func setInterval(ms: int, callback: fn(): void): TimerHandle;
pub func clearInterval(handle: TimerHandle): void;
pub class TimerHandle : Any { }

# DOM (browser only)
pub func querySelector(selector: string): Option[Element];
pub func querySelectorAll(selector: string): list[Element];
pub class Element : Any {
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
pub class Event : Any {
  pub let type: string;
  pub func preventDefault(): void;
  pub func stopPropagation(): void;
}
```

DOM facades are restricted to the `browser` target. Typed facades are recommended over raw `extern js` declarations.

### §2-3.4 Native Interop (`extern native`)

```
extern native "libsqlite3" func sqlite3_open(path: string): NativeHandle;
extern native "libsqlite3" func sqlite3_close(db: NativeHandle): int;
```

**Rules:**

- `extern native "libname"` specifies the shared library by name (without platform-specific prefix/extension; the runtime resolves `libname.so`, `libname.dylib`, `libname.dll`).
- `NativeHandle` is an opaque built-in type for C pointers — cannot be inspected, dereferenced, or constructed in Loup code. Its definition is compiler-internal: `@repr(C) struct NativeHandle { /* opaque */ }`. Values of type `NativeHandle` are only obtained from `extern native` function return values or by calling `OwnedHandle.inner()` / `BorrowedHandle.inner()`. `NativeHandle` is implicitly non-`Sendable`; cross-thread use requires `@unsafe("threadSafe: ...")` (§2-3.5).
- `extern native` is valid in `@mode(host.native)` (all native targets: `native`, `cli`, `service`, `desktop`) and `@mode(freestanding)`. It is not available in `@mode(host.scripted)` or `@mode(web.compiled)` Wasm targets — there is no native ABI at the Wasm GC boundary (`E_EXTERN_JS_NOT_NATIVE` does not apply here; using `extern native` in a Wasm target is `E_EXTERN_NATIVE_WASM`).
- Passing a Loup `string` to a native function expecting a C string provides a null-terminated UTF-8 copy for the duration of the call.
- Memory management of native resources is the caller's responsibility; use `defer` for cleanup.
- All `extern native` function parameters that receive `borrow` or `borrow[~label]` values are implicitly `noescape`. The compiler verifies that no `borrow[~label]` value escapes the native call. A native function that requires the pointer to outlive the call must be annotated `@unsafe("escapingBorrow: <reason>")` at the declaration site; every call site must also carry `@unsafe("escapingBorrow: <reason>")` to acknowledge that the caller asserts the borrowed value outlives the native call. See §3-2.4.6.

**Linking the named library (compiler's rule).** A native build links the library of every `extern native` declaration the program CALLS (a declaration nothing calls links nothing), on both native drivers (Stage0 and the self-hosted `loup-build`), after the program's own inputs:

| Library string | Link |
|---|---|
| `"sqlite3"`, `"libsqlite3"` | `-lsqlite3` (a leading `lib` is dropped) |
| `"Name.framework"` | `-framework Name` on an Apple host; nothing elsewhere |
| `"c"`, `"m"`, `"pthread"`, `"dl"`, `"System"` (with or without `lib`) | nothing: every hosted link has them |

A library string with a character outside `[A-Za-z0-9_.+-]`, or a leading `-`, is a build error naming it. Libraries a program needs but calls no function from — the usual case for Objective-C frameworks, whose classes are found by name at run time — are named in the manifest's `[delivery.native]` table (`link`, `link_path`, `framework`; §3-2.8).

**`@symbol("c_name")` — binding a declaration to another C symbol (compiler's rule).** By default an `extern native` declaration binds the C symbol of its own name. `@symbol("c_name")` binds `c_name` instead: Loup code calls the declaration by its Loup name, and the linker sees `c_name`. Several declarations may bind one symbol, each with its own signature, and each call is made with its declaration's signature — the form a variadic-by-convention entry point needs, such as the Objective-C runtime's `objc_msgSend`, which every message calls with the method's own signature:

```loup
@symbol("objc_msgSend") extern native "objc" func msg(recv: int, sel: int): int;
@symbol("objc_msgSend") extern native "objc" func msgD(recv: int, sel: int, v: float): int;
@symbol("objc_msgSend") extern native "objc" func msgRetD(recv: int, sel: int): float;
```

The argument is one string literal that is a C identifier (`[A-Za-z_][A-Za-z0-9_]*`); anything else is `E_ANNOTATION_ARGS`. `@symbol` is valid on an `extern native` declaration only (`E_ANNOTATION_TARGET` elsewhere; on a function, "'@symbol' can only be applied to extern native declarations").

**Interpreted execution.** Neither interpreter (`loup run` on Stage0 or on the self-hosted `loup`) executes an `extern native` call: a program that calls one is built (`loup build --target native`) and run. A native function receives a C function pointer to a Loup function through `addressOf(f)` (§3-3.4.2).

---

| Code | Mode | Condition |
|---|---|---|
| `E_EXTERN_NATIVE_WASM` | web.scripted, web.compiled, host.scripted | `extern native` declaration in a file targeting Wasm — no native ABI at the Wasm GC boundary |
| `E_EXTERN_STRUCT_NOT_REPR_C` | host.dual, host.native, freestanding | Struct parameter or return type in `extern native` signature is not annotated `@repr(C)` |
| `E_EXTERN_ARRAY_ELEMENT_INCOMPATIBLE` | host.dual, host.native, freestanding | `array[T, rank]` parameter or return type in `extern native` signature has an element type `T` that is not compatible with the declared C type at that position (e.g., passing `array[complex64, 1]` to a function expecting `*double`) |

**`@repr(C)` requirement for struct parameters.** Any Loup `struct` type passed to or returned from an `extern native` function MUST be annotated `@repr(C)`. Without `@repr(C)`, the compiler cannot guarantee that the Loup struct layout matches the C ABI layout expected by the native function, which would produce silent data corruption. A struct without `@repr(C)` used in an `extern native` signature is `E_EXTERN_STRUCT_NOT_REPR_C`. This requirement applies in all compiled modes (`@mode(web.compiled)` Wasm targets are exempt since C structs are not valid Wasm types; the requirement applies to `@mode(host.native)` and `@mode(freestanding)`).

**v1.20 type marshalling at the native boundary (normative).** The v1.20 numeric and array types map to the C ABI as follows:

| Loup type | C ABI representation |
|---|---|
| `complex32` | C99 `float _Complex` (8 bytes) — two consecutive `float`s in declared platform endianness, real part first. Compatible with C99 `_Complex` and Fortran `complex(kind=4)` |
| `complex64`, `complex` | C99 `double _Complex` (16 bytes) — two consecutive `double`s, real part first. Compatible with C99 `_Complex` and Fortran `complex(kind=8)` |
| `array[T, rank]` (passed by `borrow`) | Pointer to first element + per-axis stride array. The exact ABI depends on the native function's expected calling convention; the compiler emits a 3-pointer struct (`{data: *T, shape: *uint64, strides: *int64}`) when calling routines that accept descriptors, and a bare pointer with implicit row-major layout (with explicit shape arguments) for legacy BLAS/LAPACK signatures that take pointer-and-leading-dimension forms. The choice is determined by the native function's declared parameter types — a parameter typed `array[T, rank]` (with a known rank) emits the descriptor form; a parameter typed `borrow T` paired with explicit `int` dimension parameters emits the bare-pointer form |
| `array[T, rank]` (passed by value) | Copied to a freshly-allocated buffer; the native function receives a pointer to that buffer. The buffer is freed on return. Generally inadvisable for large arrays |

For BLAS/LAPACK and Fortran-style numerical libraries, declare parameters as `borrow array[T, rank]` and pass them in column-major order using the `Order.ColumnMajor` storage attribute on the source array. The `loup.blas` and `loup.lapack` packages (Fortran HPC reference §6.1, §6.2) provide declared-strict-Fortran-ABI bindings.

**Note:** Passing an array of `complex32`/`complex64` to a native function that expects a real-typed array is `E_EXTERN_ARRAY_ELEMENT_INCOMPATIBLE` at compile time. Element-type compatibility at the FFI boundary is verified statically by the compiler from the declared Loup and C types.

**Nullable return types — `NativeHandle?` (normative).** An `extern native` function declaration whose return type is `NativeHandle?` (optional `NativeHandle`) maps a null pointer return to `None` automatically. A non-optional `NativeHandle` return maps null to a runtime `NullHandleError` (§1-18.1). The compiler enforces the distinction at the declaration site:

```loup
# Null → None: caller uses ?.  pattern-matching
extern native "libsqlite3" func sqlite3_open(path: string): NativeHandle?

# Null → NullHandleError at runtime (legacy C APIs that document "never null")
extern native "libfoo" func foo_create(): NativeHandle
```

`NullHandleError` extends `RuntimeError` (§1-18.1) and is catchable.

**`PinnedRef[T]` — ARC-pinned lifetime anchor for FFI (normative).** `PinnedRef[T]` holds a strong ARC retain specifically to prevent collection while a native library holds a raw pointer to the object. The constructor increments `strong_count`; `release()` decrements it. `rawPtr()` requires `@unsafe` to acknowledge the transition out of Loup's ownership model:

```loup
namespace native.ffi;

pub class PinnedRef[T] : Any {
  # Increment strong_count; object will not be collected while pin lives.
  pub static func new(value: T): PinnedRef[T]

  # Raw pointer for native calls. @unsafe — pointer is valid only while pin is live.
  @unsafe("pin: pointer is valid only while this PinnedRef is not released")
  pub func rawPtr(): uint

  # Decrement strong_count. Subsequent rawPtr() calls are invalid.
  pub func release(): void
}
```

Usage pattern:

```loup
let pin = PinnedRef.new(myObject)
someNativeLib_register(pin.rawPtr())   # ✓ — object pinned
# ... later:
pin.release()                          # ARC retain dropped
```

**`OwnedHandle` and `BorrowedHandle` — FFI heap ownership types (normative).** These types in `native.ffi` encode ownership intent at the type level, replacing the informal comment convention:

```loup
namespace native.ffi;

# OwnedHandle: this side is responsible for freeing the resource.
# Move-only (unique semantics): cannot be aliased.
# finalize() calls the registered @deallocator automatically.
unique class OwnedHandle : Any {
  pub static func wrap(raw: NativeHandle): OwnedHandle
  pub func inner(): NativeHandle
  pub func release(): void   # explicit early release; after this, inner() is invalid
}

# BorrowedHandle: this side does NOT own the resource and must not free it.
# ARC-managed; the underlying C pointer is valid for the handle's lifetime.
class BorrowedHandle : Any {
  pub static func wrap(raw: NativeHandle): BorrowedHandle
  pub func inner(): NativeHandle
}
```

A C library function that allocates (e.g., `sqlite3_open`) should be declared to return `OwnedHandle`; one that lends a pointer (e.g., `sqlite3_db_handle`) should return `BorrowedHandle`. The type-level distinction eliminates the double-free and forget-to-free classes of bug at declaration time.

#### §2-3.4.1 `native.ffi.ptrAdd` — Raw Pointer Arithmetic

*(This section is normative. Applies to `@mode(host.native)` and `@mode(freestanding)`.)*

`native.ffi.ptrAdd` performs raw address arithmetic on `uint`-typed pointer values. It is the single supported mechanism for offsetting raw addresses at the FFI boundary and requires `@unsafe` at each call site because offset validity cannot be checked statically:

```loup
namespace native.ffi;

# Add a byte offset to a raw address. Requires @unsafe acknowledgment at
# every call site.
@unsafe("ptr: caller ensures the offset does not escape the allocation")
func ptrAdd(base: uint, offset: uint64): uint
```

`ptrAdd` does not dereference, allocate, or validate. It is pointer-width integer arithmetic surfaced as a named function so that call sites are greppable for audit. Callers MUST carry `@unsafe("ptr: <reason>")` at the acknowledgment position (§3-2.4.6).

`size_of[T]()` and `align_of[T]()` — the typical companions for computing element offsets — are specified in §3-3.4.1 and are available in both `@mode(host.native)` and `@mode(freestanding)`.

### §2-3.5 FFI Thread Safety (`@unsafe("threadSafe: ...")`, `ThreadSafeHandle`)

*(This section is normative. Applies to `@mode(host.native)` and `@mode(freestanding)`.)*

Native libraries accessed via `extern native` vary widely in their thread-safety properties. The FFI layer provides two constructs for expressing and enforcing thread safety of native handles: the `@unsafe("threadSafe: ...")` annotation (§3-2.4.6) and the `ThreadSafeHandle` wrapper type.

#### §2-3.5.1 `@unsafe("threadSafe: ...")` Annotation

```loup
# Declares that the external function is safe to call concurrently from multiple threads.
# This is a programmer assertion — use @unsafe to make the assertion auditable.
@unsafe("threadSafe: libpq pq_exec is documented as thread-safe when using separate connections")
extern native "libpq" func pq_exec(conn: NativeHandle, query: string): NativeHandle;
```

`@unsafe("threadSafe: <reason>")` on an `extern native` declaration:

- Marks the function as safe to call from any OS thread.
- Allows the function to be called from `Thread.spawn` closures and `spawnBlocking` bodies without triggering a non-`Sendable` capture error on the handle argument.
- Is a **programmer assertion** via the unified `@unsafe` surface (§3-2.4.6) — the compiler trusts the declaration. If the underlying library is not actually thread-safe, data races and undefined behaviour are the programmer's responsibility.
- The required reason string documents the basis for the thread-safety claim, making the assertion greppable and auditable.

Without `@unsafe("threadSafe: ...")`, an `extern native` function is assumed non-thread-safe. Its `NativeHandle` arguments are non-`Sendable` by default and may not cross thread boundaries.

Thread-safety assertions on `extern native` declarations use `@unsafe("threadSafe: <reason>")`.

#### §2-3.5.2 `ThreadSafeHandle`

```loup
namespace native.ffi;

# A Sendable wrapper for a NativeHandle the programmer asserts is thread-safe.
# Implements Sendable, allowing it to cross thread and task boundaries.
pub class ThreadSafeHandle : Any implements Sendable {
  # Wraps a NativeHandle. Programmer asserts the underlying resource is thread-safe.
  pub static func wrap(handle: NativeHandle): ThreadSafeHandle;

  # Unwraps the underlying NativeHandle for use in native calls.
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

## §2-4 Reactive UI (`ui`)

*(This section is normative.)*

**Re-pointed in v1.21** (UI program decision M20, with M23, M25 and M29, and the language rulings SIG-LIB, RT-UI and
RUNLOOP-1, all ruled by the maintainer 2026-11-03; recorded in `specs/loup-changes-v1_20-to-v1_21.md` §3.12). This
section is a normative bridge: it says what `ui` is, where each concern is specified, what is deferred, and how a
program acquires a desktop backend. It no longer specifies a UI model of its own. The v1.20 text it replaces, a
reactive engine built into every runtime with an implementation-defined desktop renderer that could use
platform-native widgets, is superseded. Subsection numbers are unchanged, so every reference to a §2-4 subsection still
resolves; each subsection says where its subject is now specified.

**What `ui` is.** Loup's UI is the Loup Common UI framework, the package family `loup.ui.*`. It is specified by
`specs/loup-ui-framework-spec.md` ("the framework spec"; normative, UI program decision M1, ruled 2026-11-02) and its
two companion documents, `specs/loup-ui-backend-contract.md` ("the backend contract", §B.n; the package
`loup.ui.backend`) and `specs/loup-ui-controls-theme.md` (§C.n; the package `loup.ui.controls`). Where this section and
those documents disagree, they govern.

- **A library, not a runtime subsystem** (ruling SIG-LIB). No lane's runtime contains a reactive engine, and no
  compiler gives a UI name special treatment (§2-4.1).
- **One portable core.** Signals, the element store, layout, paint, text, input, animation and the semantic projection
  are written once in `@mode(portable)` and run unchanged on every lane, Helios's freestanding units included (framework
  spec Part 0 §0.1). The core never blocks, waits or starts a thread; it advances only when a backend calls its `step`.
- **Backends.** A backend connects the core to one platform (backend contract §B.0): headless (the test oracle), Helios,
  Wayland, macOS and Win32. Every backend lays out and renders the same element tree with the core's own layout and
  rasteriser, so geometry is identical on every backend (framework spec Part 1, Determinism contract). No backend
  renders `ui` content with platform-native widgets.

**The name `ui`.** The stdlib name `ui` is kept as a documented alias of the package family (lead ruling,
2026-11-03): `ui` names the signal API of §2-4.1, the fence's `ComponentRegistry` and `ui.primitives` (§2-4.2), the
mounting API of §2-4.3 and `View`; `ui.desktop` names
`loup.ui.desktop` (§2-4.8); `ui.web` stays reserved for the deferred browser host (§2-4.7). The alias is a hosted
convenience. In `@mode(freestanding)` the name `ui` stays unavailable (`E_FREESTANDING_UI`, §3-3.3, as ruling FS-UI
amends it), and freestanding and portable code import the `loup.ui.*` packages by their own names.

**Where each concern is specified.**

| Concern | Specified by |
|---|---|
| Signals, `derived`, `effect`, batching, tracking, ownership, sensitivity marks | §2-4.1; framework spec Part 4, "Signals" |
| Tree literals, components, handlers, commands, the canonical data form `TreeData`, identity | framework spec Part 4; the `component` declaration and tree-literal syntax land with the tree-literal draft entry (UI program phase P10) |
| The `ui` fence | §2-4.6: surface syntax that lowers to the tree literal and `TreeData` |
| `View`, mounting | §2-4.3, §2-4.4 |
| Layout, the containers, the frame clock, determinism | framework spec Parts 1–3 |
| Rendering, text, hit testing, focus, input routing, animation, the semantic projection, `Ports` | framework spec Part 0 |
| Drag and drop, clipboard payloads | framework spec Part 5; `specs/loup-ui-controls-theme.md` §C.6 |
| Controls and theme | `specs/loup-ui-controls-theme.md` |
| Backends, the run loop and the executor hand-off, windows, menus, dialogs, notifications, accessibility bridges | `specs/loup-ui-backend-contract.md`; §2-1.9.9 |
| The app-facing desktop API (`ui.desktop`) | §2-4.8; backend contract §B.6, §B.8 |
| How a program acquires a hosted backend | §2-4.8 (`runtime.ui.desktop()`, `DesktopGrant`); §2-5.1; backend contract §B.10 |
| Live development, time travel, the agent protocol | framework spec Part 4 |

The UI program's phases (P1–P17) are listed in `status/ui-program.md`.

**Availability.** The core packages are `@mode(portable)` and importable from every mode. `loup.ui.desktop` and the
alias `ui` are hosted: `@mode(host.scripted)`, `@mode(host.dual)` and `@mode(host.native)`. A desktop backend needs the
permission `"ui.desktop"` (§2-4.8, §2-5.1); the headless backend needs none, so `loup test` suites drive UI headlessly
(backend contract §B.12). A Helios application is a freestanding unit with no `runtime`: it drives the core through the
Helios backend (backend contract §B.11).

**Deferred and cut.** The in-browser host is deferred with the way paved (ruled 2026-11-03; UI program decision M25):
§2-4.7 (`ui.web`) and §2-4.10 (Web Components) keep their v1.20 text, marked deferred, and are not part of v1
conformance. The paving is a step-driven core that a page's callbacks can drive, one window as a valid host, and no
thread or blocking wait in portable code (backend contract §B.0, §B.1, §B.3.4; `specs/loup-ui-warp-reconciliation.md`
§9.2). Async component loading (§2-4.5) is deferred with it. Print dialogs (M23) and the tray (M29) are cut from v1
(§2-4.8).

### §2-4.1 Signals

**Library signals (v1.21, ruling SIG-LIB).** Signals are library code in the package `loup.ui.signal`, written in the
portable subset. The v1.20 names are kept, so that this volume, the framework spec and Helios say the same thing (Helios
`specs/DESKTOP-SHELL.md` D-20):

- `Signal[T]` is a writable cell. It is a **struct handle**, an index plus a generation into the signal store owned by
  the UI instance that created it. It is not the v1.20 `class Signal[T] : Any`. `s.get()` reads it, tracked inside a
  tracking scope; `s.set(v)` and `s.update(f)` write it.
- `signal(initial)` creates a writable signal, `derived(compute)` a read-only signal computed from others, and
  `effect(fn)` a reaction that returns an `EffectHandle`, whose `dispose()` ends it.
- `batch` applies a group of writes as one batch.

What they mean is framework spec Part 4, "Signals": tracking, batching and glitch freedom, binding to the tree,
ownership and disposal, and sensitivity marks (ruling MARK-1). The package fixes the exact signatures
(`specs/4-packages-6-loup-ui-core/`, phase P2). This section fixes the names, the representation and four rules:

1. **No name is intercepted.** A call to `signal`, `derived`, `effect` or `mount` is an ordinary call, resolved through
   the program's imports; without an import, the name is the ordinary unresolved-name error. A call of `.get()`,
   `.set(v)`, `.update(f)` or `.dispose()` is an ordinary method call on its receiver. The v1.20 compilers lowered these
   names to dedicated instructions whatever the callee; both compilers retire that (task `v21.uirt.11`).
2. **Write rules are run-time checks first.** A write the rules forbid (inside a `derived` body, or during measure or
   arrange) is refused as an error `Result`, never as an exception. Static checks, and the tracked-read sugar (a bare
   signal reference in a fence's `{$ … $}` or a tree-literal property reads it, tracked), come with compiler support
   for the blessed library in phase P10.
3. **No ARC rule.** A handle is an index, so an `effect` closure that captures its own `EffectHandle` makes no
   reference cycle. The v1.20 rule that such closures use `[weak handle]` captures under ARC is struck (also §2-1.7b).
4. **Modes.** `loup.ui.signal` is `@mode(portable)`, importable from every mode, freestanding included; in hosted modes
   it is also reachable through the alias `ui` (§2-4).

```
from ui import (signal, derived, effect);   # or: from loup.ui.signal import (signal, derived, effect);

let count = signal(0);
let doubled = derived(func() => count.get() * 2);

effect(func() {
  log(i"count is now: {$ count.get() $}");
});

count.set(1);   # when the batch commits, the effect runs again and doubled reads 2
```

### §2-4.2 Components and `ComponentRegistry`

**Where components are specified (v1.21, decision M20).** Components are framework spec Part 4, "Tree literals"
(Components, Handlers): a component is a function from properties to a tree, components compose, and a component
instance appears in `TreeData` as a node whose type is the component. The `component` declaration, `commands { }` and
the lowering of a handler to a named function plus a capture struct (Helios `specs/DESKTOP-SHELL.md` D-21) land with
the tree-literal draft entry and handler lowering (UI program phases P10 and P6). Until then a component is a function
returning `View`, as below. Of the v1.20 text that follows:

- **Kept, as the front end that exists** (`specs/3-stdlib-5-ui-fence/`): the `components=` fence descriptor,
  `ComponentRegistry`, the tag-resolution rules and their three codes. Whether the fence keeps a run-time registry once
  it lowers to the tree literal, where every reference is a resolved symbol (framework spec Part 4, Tree literals,
  "Rules and decisions"), is decided by the tree-literal draft entry (P10).
- **Deferred:** async components (`Task[View]`), with §2-4.5; the `html`-fence event-handler compilation and
  web-component tags, with the browser host (§2-4.7, §2-4.10).

Components are functions returning `View`. `signal` must be imported from the `ui` module; the `components` fence descriptor requires a `ComponentRegistry` value to be in scope:

```loup
@mode(host.scripted)

from ui import (signal, ComponentRegistry);
import ui.primitives;   # Row, Column, Text, Button, Image, Slot

# Module-level registry registers built-in primitives:
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

`View` is the type of a `ui` or `html` fence's result and of a component's (§2-4.4, which supersedes the v1.20 description of a `View` as a tree that the active rendering backend materialises into pixels or DOM nodes).

**`ComponentRegistry`:**

```
pub class ComponentRegistry : Any {
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
- Hyphenated tags are first looked up in the `ComponentRegistry`. If the matched entry is a `@webcomponent` class (§2-4.10), the tag is treated as a web component invocation: attribute values are mapped to the component's `@attribute` fields, and the element is emitted as a custom element tag in HTML output. If no registry match is found: in `html` fences the tag is emitted as literal HTML; in `ui` fences it is a compile-time error.
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
- Async components (`async func` returning `Task[View]`) are supported. *(Deferred in v1.21 with §2-4.5.)*
- When a registered value in a `ComponentRegistry` is not a function returning `View` or `Task[View]` (`E_COMPONENT_NOT_VIEW`), and is not a `@webcomponent` class, the compiler emits a compile-time error.

**Event handler compilation in `html` fences.** *(Web; deferred in v1.21 with §2-4.7.)* Event handler attributes (`onclick`, `oninput`, `onchange`, `onsubmit`, `onkeydown`, `onfocus`, `onblur`, and all other `on*` attributes) in `html` fences accept Loup callable values typed as `fn(): void` or `fn(Event): void`. They do **not** produce inline JavaScript handler strings.

The compiler transforms event handler attribute bindings:

```
// Source written by the developer:
<button onclick={$ func() { count.set(count.get() + 1); } $}>+</button>

// Compiled output (what reaches the DOM):
<button data-loup-ev="click:__ev_7f3a2b">+</button>
```

The compiler assigns a stable, deterministic event slot ID (content-addressed from the closure's source location and module path) and registers the handler in the Wasm module's event table. After the Wasm module loads, the Loup runtime wires all `data-loup-ev` elements via `addEventListener` — no inline JavaScript is emitted. See §1-20.6 for the bootstrap sequence.

Passing a literal JavaScript string as an event handler value is a **compile-time error** (`E_INLINE_JS_EVENT_HANDLER`):

```
// COMPILE-TIME ERROR: inline JavaScript string not permitted
<button onclick="count++">bad</button>

// Correct: Loup callable
<button onclick={$ func() { count.update(func(n) => n + 1); } $}>+</button>
```

This design requires no `'unsafe-inline'` in the Content Security Policy `script-src` directive.

| Code | Mode | Condition |
|---|---|---|
| `E_INLINE_JS_EVENT_HANDLER` | web.scripted, web.compiled | Event handler attribute value is a literal JavaScript string (e.g. `onclick="count++"`) rather than a Loup closure |

### §2-4.3 Mounting (Universal)

**Mounting (v1.21, decision M20).** Mounting attaches a `View` to a window: it creates that window's UI instance (one
per window, framework spec Part 0 §0.3) and instantiates the view's tree into it once. `mount` and `MountHandle` belong
to `loup.ui.desktop` (§2-4.8). They work over every backend that package drives, including the headless backend, which
needs no permission (backend contract §B.12).

```
func mount(component: View, target: MountTarget): MountHandle;

class MountHandle : Any {
  pub func unmount(): void;   # detaches the tree, which disposes everything it owns (framework spec Part 4, Ownership and disposal)
}

opaque class MountTarget : Any {}   # a built-in opaque type
```

A `MountTarget` value is one of:

- a `Window` value (`loup.ui.desktop.Window`, §2-4.8), accepted by implicit coercion;
- `runtime.ui.rootMount()`, a target that denotes the program's primary window. It creates nothing. The first `mount`
  on it opens the primary window, and `loup.ui.desktop` acquires the backend for it through `runtime.ui.desktop()`
  (§2-4.8), so a denied permission raises `CapabilityError` from that `mount` (lead ruling, 2026-11-03);
- a `"#selector"` string or an `Element` value: browser targets only, deferred with §2-4.7.

A Helios application has no `runtime` and no `mount`: it creates its UI instance and drives it through the Helios
backend directly (backend contract §B.11).

### §2-4.4 `View` Type

**`View` (v1.21, decision M20).** `View` is the static type of a `ui` fence, a tree literal and a component's result,
and it remains a built-in opaque type. What evaluating one constructs, and what it means, is framework spec Part 4: its
meaning is its canonical data form, `TreeData` ("Canonical data form"), and once mounted the tree is retained and
updated in place by fine-grained reactivity ("Scope", decision 2; "Binding to the tree"). The v1.20 sentence that
`View` values are immutable descriptions which the rendering backend materialises is superseded: no backend rebuilds
or diffs a tree.

### §2-4.5 Async Component Loading

**Deferred (v1.21, decision M20 and ruling RUNLOOP-1).** The core never awaits, and managed native has no scheduler and
refuses reachable `async` (§2-1.9.9), so `suspend` and `Task[View]` components are not in v1. In `loup.ui`, an
asynchronous result enters as a recorded input (backend contract §B.2, `Async`), is written to a signal, and a view
shows its fallback with an ordinary `{% if %}` on that signal. `{% suspend %}` is not among v1's fence directives
(§2-4.6). The text below is the v1.20 design, kept for the deferred browser host (§2-4.7), whose platform has an event
loop of its own (lead ruling, 2026-11-03).

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

### §2-4.6 `ui` Fence — Cross-Platform Layout Primitives

**The fence is surface syntax (v1.21, decision M20; Helios `specs/DESKTOP-SHELL.md` D-20).** The `ui` template fence
(`language=ui`) is surface syntax for a tree. It lowers to the tree literal and its canonical data form, `TreeData`
(framework spec Part 4, "Tree literals" and "Canonical data form"), so a fence-authored view and a literal-authored view
are the same tree with the same node identities. It produces a `View` (§2-4.4). No HTML-specific semantics apply inside
a `ui` fence. Where the lowering needs a decision the framework spec has not made yet, the tree-literal draft entry
(phase P10) makes it; until then the fence is the front end that exists (`specs/3-stdlib-5-ui-fence/`, front end only).

**`ui` fence syntax:**

````
```(ui):(components=registry)
<Column spacing={$ 12 $}>
  <Text>Hello {$ name $}</Text>
  <Button onclick={$ handler $}>
    <Text>Submit</Text>
  </Button>
</Column>
```
````

**Primitive names (v1.21, decision M20; D-20).** The v1.20 primitive names are kept, and each is an alias of a
framework element. Its properties, defaults and units are the element's: lengths are `Length` (Q32.32 device-independent
units, framework spec Part 1, "Core types"), and colours are theme roles or API `Color` values (Part 0 §0.2.3). The
v1.20 signatures, with `int` lengths, `float` slider values and a `Color { r, g, b, a }` struct, and their supporting
types (`Axis`, `Alignment`, `ImageFit`, `TextStyle`, `Insets`, `Color`, `SelectOption[T]`) are superseded by the property
types of the elements below (Part 1, "Core types" and "Universal element properties"; `specs/loup-ui-controls-theme.md`
§C.2). The v1.20 attribute names in the third column are kept as fence spellings; the tree-literal draft entry (P10)
maps them onto the elements' properties.

| Fence name | Framework element | v1.20 attributes | Specified by |
|---|---|---|---|
| `Row`, `Column` | `Linear`, horizontal and vertical | `spacing`, `alignment` | Part 1, "Linear (Row, Column)" |
| `Stack` | `Overlay` (`Stack` is its accepted alias) | `alignment` | Part 1, "Overlay" |
| `Scroll` | `Scroll` | `axis` | Part 1, "Scroll" |
| `Spacer`, `Padding` | the `Spacer` and `Padding` wrappers | `size`; `insets` | Part 1, "Single-child wrappers" |
| `Text` | `Text` | `style` | §C.2.1 |
| `Button` | `Button` | `onclick`, `disabled` | §C.2.3 |
| `Image` | `Image` | `src`, `alt`, `fit` | §C.2.6 |
| `Icon` | `Icon` | `name`, `size`, `color` | §C.2.5 |
| `TextField` | `TextField` | `value`, `placeholder`, `multiline` | §C.2.4 |
| `Checkbox`, `Slider`, `Select` | `CheckBox`, `Slider`, `Select` | `checked`, `label`; `value`, `min`, `max`, `step`; `value`, `options` | §C.7 (phase P5) |
| `Divider` | a separator control | `axis`, `color` | the control library after the minimal set (phase P5) |
| `Canvas` | none in v1 | `width`, `height`, `draw` | a custom-drawn leaf is `SurfaceHost` (Part 1, "Foreign-content leaves"), cut from v1 (UI program decision M21) |
| `Slot` | a slot | `name` | below |

**Rendering contract (v1.21; supersedes the v1.20 contract).** Every backend lays out and renders a fence's tree with
the core (framework spec Parts 0 and 1). Geometry is identical on every backend, not merely equivalent (Part 1,
"Determinism contract"). No backend maps a primitive to a platform widget or to HTML elements. Platform conventions
(scrollbar placement, button and focus appearance, keymaps) come from the theme and the backend's SystemSettings, not
from the platform's widgets (`specs/loup-ui-controls-theme.md` §C.4; backend contract §B.5). `Slot` is valid only inside
the `render()` method of a `@webcomponent` class (§2-4.10, deferred) and is a compile-time error elsewhere
(`E_SLOT_NOT_WEBCOMPONENT`); a component's named slots (framework spec Part 4, Components; `TreeData`'s `Slot`) are
specified by the tree-literal draft entry (P10), which settles what `Slot` means outside a web component.

**Directives (v1.21; UI program decision M12).** In v1 a `ui` fence admits the directives `TreeData` can express:
`{% if %}`, `{% for %}` over a collection, `{% match %}` (as an `if` chain) and slots. The other §1-16.2 directives
(`{% let %}`, `{% try %}`, `{% suspend %}`, `{% while %}` and the C-style `{% for %}`) would lower to opaque code
references (`specs/loup-ui-warp-reconciliation.md` §4.4) and are not in v1. Whether the fence admits them later is
the tree-literal draft entry's decision (P10).

### §2-4.7 Web Backend (`ui.web`)

**Deferred (v1.21; the in-browser host was ruled deferred with the way paved on 2026-11-03, UI program decision M25).**
This subsection is the v1.20 design, kept unedited as the starting point for a browser host. It is not part of v1
conformance. When the browser host is scheduled it is re-specified as a backend over
`specs/loup-ui-backend-contract.md`: a host the page drives through callbacks (§B.3.4), a valid single-window host
(§B.1), and the grant name `"ui.web"` (§B.10.1). Wherever the text below presumes that `ui` primitives map to DOM
elements or that a reactive engine runs in the browser runtime, framework spec Parts 0 and 4 supersede it. What the base
keeps true meanwhile is `specs/loup-ui-warp-reconciliation.md` §9.2.

*(Available on `browser` and `service` targets.)*

**`html` fence integration.** The `html` fence (§1-16) continues to work as the web-enrichment path. Components using `html` fences compile only on `browser`/`service` targets.

**`renderToString` (SSR):**

```
namespace ui.web;

pub struct RenderToStringOptions {
  stateIntegrity: bool = false;  // if true, add data-integrity SHA-256 hash attribute
}

pub func renderToString(component: View,
                   options: RenderToStringOptions = RenderToStringOptions()): SafeHtml;
```

`renderToString` renders a component tree to static HTML on `service` targets. The return type is `SafeHtml` (§1-16.6.7) — the output has passed through the full context-aware escaping pipeline and may be embedded in another HTML context without further escaping or double-encoding.

**`hydrate`:**

```
pub func hydrate(component: View, selector: string): MountHandle;
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
  # Serializes state to JSON with < and > escaped as < / >.
  # The output SHALL NOT contain the literal byte sequence </ in any case variant.
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

`'wasm-unsafe-eval'` permits Wasm module evaluation, which is required by all Wasm-based applications and is a narrower permission than `'unsafe-eval'` (which also permits `eval()` and `new Function()`). The absence of `'unsafe-inline'` is ensured by the `data-loup-ev` event handler compilation model (§2-4.2).

**`mount` (web form):**

```
func mount(component: View, selector: string): MountHandle;
func mount(component: View, element: Element): MountHandle;
```

### §2-4.8 Desktop Backend (`ui.desktop`)

*(Hosted modes: `@mode(host.scripted)`, `@mode(host.dual)` and `@mode(host.native)`.)*

**Re-specified as `loup.ui.desktop` (v1.21; decision M20, with M23 and M29; rulings RT-UI and RUNLOOP-1).**
`ui.desktop` is the package `loup.ui.desktop`, the app-facing desktop API. It is implemented over the hosts of
`specs/loup-ui-backend-contract.md`: WindowHost (§B.6), DisplayInfo (§B.4), MenuHost, DialogHost and Notifier (§B.8).
Every v1.20 name is kept, and the table below gives each one its home; the declarations follow it. The package's design
is `specs/4-packages-6-loup-ui-desktop/`. The v1.20 statement that the desktop rendering backend is implementation-defined
and may use Skia, WebGPU or platform-native widgets is struck: every backend renders the toolkit's tree with the core
(§2-4).

**Acquiring a backend (ruling RT-UI).** A hosted backend is reachable only through `runtime.ui.desktop()` and the
`DesktopGrant` it returns:

```
let grant: DesktopGrant = runtime.ui.desktop();   # checks the permission "ui.desktop"; denial raises CapabilityError
```

`loup.ui.desktop` makes this call itself the first time one of the names below needs a backend, and passes the grant to
the platform backend's `sys.open(grant)` (backend contract §B.10.1). A backend's FFI is private to its `sys` module, so
an application never holds it. `DesktopGrant` is a compiler built-in opaque type: it has no constructor, literal,
members or zero value; `runtime.ui.desktop()` is its only producer; it may appear only as a parameter or result type, as
the type of a local binding, as an `Option` payload, or as an `is`/`as` target; it is not FFI-legal, and it is not
available in `@mode(freestanding)` or in portable code. Its full definition, the closed list of positions, its two
diagnostics and the forging routes the list closes are backend contract §B.10.4–§B.10.7. The headless backend needs no
grant (§B.12). On Stage0's Cranelift and Wasm lanes no desktop backend exists: `runtime.ui.desktop()` always raises
`CapabilityError` there, and no grant value ever exists.

**Names and their homes.**

| v1.20 name | Home in `loup.ui.desktop` | Over | Notes |
|---|---|---|---|
| `Window` (`title`, `width`, `height`, `minWidth`, `minHeight`, `resizable`, `fullscreen`, `visible`; `close`, `minimize`, `maximize`, `focus`, `setIcon`) | `desktop/window` | WindowHost | Each window has its own UI instance and surface. Setting a property is a host request; reading one returns the state the backend last reported as a recorded input (`WindowResized`, `WindowState`; §B.2). `visible` and `focus()` are WindowHost `setVisible(bool)` and `activate()`, each answering `Unsupported` where the platform cannot honour it (§B.6; lead ruling, 2026-11-03) |
| `WindowConfig` (`title`, `width`, `height`, `minWidth`, `minHeight`, `resizable`, `centered`), `createWindow(cfg)` | `desktop/window` | WindowHost `open` | `centered` is honoured only where the backend's `windowPosition` flag is true; elsewhere the platform places the window (§B.1, §B.6). On a single-surface host (`windowsMax = 1`) a second window opens as an in-tree sheet or overlay, not an error |
| `mount(component, window)` | `desktop/window` | the core's `Ui.create` and `ui.step` | §2-4.3 |
| `MenuBar`; `Menu` (`title`, `addItem`, `addSeparator`, `addSubmenu`); `MenuItem` (`label`, `enabled`, `checked`, `shortcut`, `onclick`); `setMenuBar(window, menuBar)` | `desktop/menu` | MenuHost | A menu is a model whose items each name a command (framework spec Part 0 §0.9.4). Activation arrives as a recorded `Command` input, never as a direct closure call from the platform. `onclick` keeps its name and is the handler of the command its item names; `shortcut` is that command's default chord, which the keymap may override (lead ruling, 2026-11-03). Without a menu host, menus are drawn in the window (§B.1) |
| `Tray` (`setIcon`, `setTooltip`, `setMenu`, `show`, `hide`, `destroy`); `createTray()` | `desktop/tray` | none in v1 | Cut from v1 (decision M29). The names stay; the new `trayAvailable(): bool` is false in v1, and `createTray()` raises `CapabilityError` (§2-5.1) |
| `FileDialogOptions`, `FileFilter` | `desktop/dialog` | DialogHost | Unchanged |
| `openFileDialog`, `openFilesDialog`, `saveFileDialog`, `openDirectoryDialog`, `alertDialog`, `confirmDialog` | `desktop/dialog` | DialogHost | Requests, not `async` functions (below). No print dialog exists in v1 (decision M23); DialogHost keeps the slot |
| `ScreenInfo` (`width`, `height`, `dpr`); `screen()` | `desktop/screen` | DisplayInfo (§B.4) | `screen()` moves from `UiRuntime` to the package (M20 names it among the package's API), because the display it reports is the backend's |
| `UiRuntime` (`backend`, `rootMount()`) | the runtime root, `runtime.ui` (§2-5.1) | — | `backend` gains `"helios"`; `UiRuntime` gains `desktop()` (RT-UI); `rootMount()` returns a target that names the primary window (§2-4.3) |

Notifications are new in `loup.ui.desktop` (`desktop/notify`, over Notifier, §B.8): requests whose actions arrive as
recorded inputs.

**Dialogs are requests (ruling RUNLOOP-1's dialog half, with decision M20).** The v1.20 dialogs were `async` functions.
Managed native has no scheduler and refuses reachable `async`, and the core never awaits (§2-1.9.9), so each dialog is a
request whose answer arrives as a recorded input (§B.2, `DialogResult`) in a later frame and sets the request's
`result` signal once, in that frame's State phase. An effect or a binding on `result` reacts to it. `result` reads
`None` while the dialog is open; a cancelled file dialog answers `Some(None)` (or `Some([])` for `openFilesDialog`).
Without a dialog host, `alertDialog` and `confirmDialog` are toolkit sheets with the same request API, and the file
dialogs answer `Unsupported` (§B.1). The v1.20 `Task` forms survive only as an adapter over the request,
`DialogRequest[T].task(): Task[T]`, which completes when `result` is set. It is usable only where
`runtime.executor.turn` runs a scheduler (Stage0's interpreter today), and on managed native a reachable call is refused
like any reachable `async` (the adapter's name: lead ruling, 2026-11-03).

**The declarations** (`namespace loup.ui.desktop`, reached as `ui.desktop` through the alias):

```
namespace loup.ui.desktop;

pub class Window : Any {
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
  centered: bool = true;      # honoured only with the backend's windowPosition flag
}

func createWindow(cfg: WindowConfig): Window;
func mount(component: View, window: Window): MountHandle;   # §2-4.3

pub class MenuBar : Any { ... }

pub class Menu : Any {
  pub let title: string;
  pub func addItem(item: MenuItem): void;
  pub func addSeparator(): void;
  pub func addSubmenu(menu: Menu): void;
}

pub class MenuItem : Any {
  pub let label: string;
  pub var enabled: bool = true;
  pub var checked: bool = false;
  pub var shortcut: string?;   # the default chord of the item's command
  pub let onclick: fn(): void; # the handler of the item's command
}

func setMenuBar(window: Window, menuBar: MenuBar): void;

class Tray : Any {                # cut from v1 (M29): never constructed
  pub func setIcon(path: string): void;
  pub func setTooltip(text: string): void;
  pub func setMenu(menu: Menu): void;
  pub func show(): void;
  pub func hide(): void;
  pub func destroy(): void;
}
func trayAvailable(): bool;       # false in v1
func createTray(): Tray;          # raises CapabilityError in v1

struct FileDialogOptions {
  title: string?;
  defaultPath: string?;
  filters: list[FileFilter] = [];
}
struct FileFilter { name: string; extensions: list[string]; }

struct DialogRequest[T] {
  id: RequestId;
  result: Signal[Option[T]];      # None while open; set once by the DialogResult input
  pub func task(): Task[T];       # the adapter: only where a scheduler runs
}
enum AlertClosed { Closed }

func openFileDialog(options: FileDialogOptions = FileDialogOptions()): DialogRequest[Option[string]];
func openFilesDialog(options: FileDialogOptions = FileDialogOptions()): DialogRequest[list[string]];
func saveFileDialog(options: FileDialogOptions = FileDialogOptions()): DialogRequest[Option[string]];
func openDirectoryDialog(options: FileDialogOptions = FileDialogOptions()): DialogRequest[Option[string]];
func alertDialog(title: string, message: string): DialogRequest[AlertClosed];
func confirmDialog(title: string, message: string): DialogRequest[bool];

struct ScreenInfo {
  width: int;
  height: int;
  dpr: float;    # device pixel ratio: DisplayInfo.scale
}
func screen(): ScreenInfo;        # the primary display
```

**`runtime.ui` namespace** (on the runtime root, §2-5.1):

```
interface UiRuntime {
  pub let backend: string;              # "dom" | "desktop" | "headless" | "helios"   ("dom": the deferred browser host)
  pub func rootMount(): MountTarget;    # names the primary window; creates nothing (§2-4.3)
  pub func desktop(): DesktopGrant;     # v1.21, ruling RT-UI: checks "ui.desktop"; denial raises CapabilityError
}
```

`runtime.ui.rootMount()` names the primary window on a desktop host; on the deferred browser host it is `"#root"`
(§2-4.7). Either way it enables target-agnostic entry points (§2-4.9).

**`native.window`.** The bare-window package of the packages reference §21.35 is superseded by the backend contract
(UI program decision M11): a window, its events and its pixels are WindowHost, EventSource and the surface (backend
contract §B.2, §B.4, §B.6), reached through `runtime.ui.desktop()`. §21.35 carries the status note, and
`specs/3-stdlib-5-native-window/design.md` maps each of its names to its home. There is one `Window` type, this one.

### §2-4.9 Cross-Platform Example

**v1.21 (decision M20).** The example is unchanged except for its entry-point comment and closing sentence: `ui` is
the alias of §2-4, and `mount` is `loup.ui.desktop`'s (§2-4.3).

```
# app.loup — shared, uses only ui and ui fence
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

# Entry point — the same on every desktop backend
mount(TodoApp(), runtime.ui.rootMount());
```

This file compiles and runs unchanged on every desktop backend (Wayland, macOS, Win32) and on the headless backend,
with identical geometry on each (§2-4.6, rendering contract). The first `mount` acquires the desktop backend, so the
program needs the permission `"ui.desktop"` (§2-4.8, §2-5.1). It was also written to run on `browser` and `service`
targets; that host is deferred (§2-4.7). Desktop-specific features (native menus, file dialogs) are opt-in through
`ui.desktop` (§2-4.8).


### §2-4.10 Web Components

**Deferred (v1.21), with the browser host (§2-4.7; UI program decision M25).** This subsection and its seven
subsections are the v1.20 design, kept unedited and not part of v1 conformance. They are re-specified over
`specs/loup-ui-backend-contract.md` when the browser host is scheduled. Their diagnostics stay defined.

*(This section is normative. Available on `browser` target only.)*

Loup provides first-class support for the W3C Custom Elements v1 standard via the `@webcomponent` annotation and the `WebComponentLifecycle` interface (§1-11.2). A `@webcomponent` class compiles to a `customElements.define()` registration in the browser bootstrap (§1-20.6).

#### §2-4.10.1 Declaring a Web Component

```loup
from ui import (signal, View);
from web.dom import (ShadowRoot);

@webcomponent("my-counter")
class CounterElement implements WebComponentLifecycle {

  # Observed attributes — declared with @attribute
  @attribute var label: string = "Count";
  @attribute var step: int = 1;

  # Internal reactive state
  let count = signal(0);

  override func connected(): void {
    # called when element is inserted into the document
  }

  override func disconnected(): void {
    # called when element is removed from the document
  }

  override func attributeChanged(name: string, oldValue: string?, newValue: string?): void {
    # @attribute fields are updated automatically before this fires
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

#### §2-4.10.2 `@webcomponent` Rules

- The annotation argument must be a compile-time string literal that is a valid Custom Elements tag name: it must contain at least one hyphen and consist only of ASCII lowercase letters, digits, hyphens, periods, and underscores. The compiler SHALL reject invalid tag names.
- The class must declare a `func render(): View` method. The absence of `render()` is a compile-time error.
- The `@webcomponent` annotation is only valid on `browser` target. Using it on other targets is a compile-time error.
- Duplicate tag name registrations within a compilation unit are a compile-time error.
- `@webcomponent` is only valid in `@mode(web.scripted)` and `@mode(web.compiled)` files (per §1-2.6). A `@webcomponent` class in `@mode(host.scripted)`, `@mode(host.dual)`, `@mode(host.native)`, or `@mode(freestanding)` files is a compile-time error (`E_WEBCOMPONENT_NOT_WEB`).

**`@webcomponent` error codes:**

| Code | Condition |
|---|---|
| `E_WEBCOMPONENT_NOT_WEB` | `@webcomponent` class declared outside `@mode(web.scripted)` or `@mode(web.compiled)` |

#### §2-4.10.3 `@attribute` Rules

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

#### §2-4.10.4 Shadow DOM and Slots

Every `@webcomponent` class renders into an open shadow root created automatically by the runtime. The shadow root is accessible via `this.shadowRoot: ShadowRoot` (the `ShadowRoot` type is provided by the web-DOM runtime).

`<Slot>` (in `ui` fences) or `<slot>` (in `html` fences) maps to the browser's native `<slot>` element. Named slots use `<Slot name="footer" />` or `<slot name="footer"></slot>`. Slot elements are only valid inside the `render()` method of a `@webcomponent` class; their use elsewhere is a compile-time error (`E_SLOT_NOT_WEBCOMPONENT`).

| Code | Mode | Condition |
|---|---|---|
| `E_SLOT_NOT_WEBCOMPONENT` | All | `<Slot>` or `<slot>` used outside the `render()` method of a `@webcomponent` class |

#### §2-4.10.5 CSS Inside Web Components

`css` fences used inside `render()` are attached to the shadow root via Constructable Stylesheets rather than the document `<head>`. Hash-scoped class name mangling is suppressed (see §1-16.7.1). The shadow boundary provides native encapsulation.

```loup
func render(): View {
  let styles = ```(css)
    .button { background: navy; color: white; padding: 8px 16px; }
  ```;  # attached to shadow root, not document head

  return ```(ui)
    <Button class={styles.button} onclick={$ handleClick $}>
      <Text>Go</Text>
    </Button>
  ```;
}
```

#### §2-4.10.6 Using Web Components in Fences

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

Attribute values in web component tags follow the same escaping rules as regular HTML attributes (§1-16.6.3). Non-`@attribute` properties are a compile-time error (`E_ATTRIBUTE_NOT_WEBCOMPONENT`) in this context.

#### §2-4.10.7 Bootstrap Registration

The Loup runtime registers all `@webcomponent` classes via `customElements.define()` during bootstrap step 6 (§1-20.6), before `mount()` is called. Registration order follows source declaration order within each module and dependency order across modules.

## §2-5 Runtime Root and Capabilities

*(This section is normative.)*

### §2-5.1 `runtime` Object

A root-level identifier `runtime` is available in scope in all non-freestanding modes: `@mode(web.scripted)`, `@mode(web.compiled)`, `@mode(host.scripted)`, `@mode(host.dual)`, and `@mode(host.native)`. In `@mode(freestanding)`, the Loup runtime is not linked and `runtime` is **not available** — using it is a compile-time error (`E_FREESTANDING_RUNTIME`). Bare-metal entry points interact with hardware directly using `@entry`, `asm { }`, and the `native.mem` / `native.atomic` modules (§3-3).

```
interface Runtime {
  func args(): list[string];
  func env(name: string): Option[string];
  func capabilities(): list[string];
  func has(name: string): bool;
  func compile(source: string): Module;
  func compile(source: string, options: CompileOptions): Module;

  # Configure the runtime executor, blocking pool, and task queue.
  # Must be called before any await expression evaluates; throws RuntimeConfigError
  # if called after the event loop starts. See §2-1.9.1 for RuntimeConfig fields.
  func configure(config: RuntimeConfig): void;

  # Capability sub-namespaces (accessed as properties, not method calls)
  let fs: io.fs.Fs;
  let proc: io.proc.Proc;
  let net: net.net.Net;
  let debug: debug.DebugRuntime;
  let interop: lang.interop.js.Interop;
  let ui: ui.UiRuntime;              # §2-4.8; desktop() checks "ui.desktop" (v1.21, ruling RT-UI)

  # The executor hand-off a UI backend's loop turns (§2-1.9.9; v1.21, ruling
  # RUNLOOP-1). It grants nothing, so it needs no permission.
  let executor: lang.executor.ExecutorControl;

  # Host entropy seam (`CAP_ENTROPY`). The single source of
  # non-deterministic bytes in the language; every cryptographic
  # transform above it is pure. Granted by default on all
  # non-freestanding profiles and deny-able (`--deny-all`,
  # `--allow-entropy`). Fails closed: if the host source is
  # unavailable the call raises rather than substituting a
  # predictable generator. See the crypto packages spec §10.
  func entropy(): Entropy;
}

interface Entropy {
  # Exactly `count` cryptographically-secure random bytes, or an
  # error. `count` must be non-negative and within the host request
  # limit; draw a DRBG from this seed for longer keystreams.
  func bytes(count: int): bytes;
  # A uniformly-random non-negative integer.
  func int(): int;
}

class CompileOptions {
  ## Optional module name for diagnostics and `__module__` dunder.
  pub let name: string = "<dynamic>";
  ## Whether to type-check the module (default: true).
  pub let typeCheck: bool = true;
}
```

`Module` is the built-in type for compiled modules (full declaration in §1-2.3): it carries `__name__`, `__file__`, `__execmode__` introspection properties and the reflection methods `exports()`, `get(name)`, `has(name)`, and `call(name, args)`.

**`runtime.configure` — task queue depth (normative).** The `runtime.configure` call (§2-1.9.1) accepts a `RuntimeConfig` value. The `maxTaskQueueDepth: int` field caps the pending spawn queue: when the queue already contains `maxTaskQueueDepth` entries, further `spawn` operations throw `TaskQueueFullError` (§1-18.1). The default value `0` means unlimited. Set a positive value to bound memory usage under heavy task production; the runtime's release notes MUST document the platform-specific default behaviour.

```loup
runtime.configure(RuntimeConfig(maxTaskQueueDepth: 10_000))
```

Capability sub-namespaces are properties on `runtime`: `runtime.fs.open(path)`, not `runtime.fs().open(path)`.

If a capability is not available on the current platform target, calling any method on the capability object throws `CapabilityError`.

**`runtime.ui` and the permission `"ui.desktop"` (v1.21, ruling RT-UI).** `runtime.ui.desktop()` checks the permission
`"ui.desktop"` and returns a `DesktopGrant`, the only way to a hosted UI backend (§2-4.8); `"ui"` stays the permission
of the universal core. Under `loup run` the permission set is the `cli` profile, which does not grant `"ui.desktop"`,
adjusted by `--allow-*`, `--deny-*` and `--allow-all` (`--allow-ui-desktop` grants it). A built program's set comes
from its package manifest, a list `[permissions] grant = [...]` that defaults to the `native` profile (which does not
grant `"ui.desktop"`); it is compiled into the binary as a constant and narrowed at launch by `LOUP_DENY=<names>`, which
can never widen it (packages reference §1-13.4f; backend contract §B.10.3). Denial raises `CapabilityError` (§1-18.1). The check gates the
toolkit's path, not the language: a program that declares its own `extern native` functions is outside capability
gating, as it already is for `runtime.fs`.

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

let result = mod.call("greet", ["world"]);   # "Hello, world!"
let sum = mod.call("add", [1, 2]);           # 3
let names = mod.exports();                    # ["greet", "add"]
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

### §2-5.2 Script Prelude

Entry scripts and REPL sessions receive convenience helpers as surface sugar over `runtime`:

| Helper | Equivalent |
|---|---|
| `print(value)` | Write `value` rendered as a string to stdout, with NO trailing newline (`println` adds one; stdlib reference §21.13; ruling RT-3). Accepts any `Renderable` value or primitive. `runtime.proc.stdout.write(value.render(...))` |
| `printErr(value)` | Write `value` rendered as a string to STDERR, followed by a newline — the stderr counterpart of `println` (ruling RT-3). Standard output is flushed first, so the two streams keep program order on a terminal. Every lane: both interpreters, both native lanes (`__loup_system_io_eprintln`: the managed C runtime and the libOS, a `write` to fd 2), and Wasm (`loup_capability.io.eprintln`, which like `io.print`/`io.println` needs no grant) (loup#513) |
| `exit(code)` | End the process now with `code` (an `int`) as its exit status (loup#469). Output already written is kept — standard output and standard error are flushed first — and nothing after the call runs. A `throw` that escapes always ends a script with status 1; tools that report distinct statuses use `exit`. Every lane: both interpreters, both native lanes (`__loup_system_proc_exit`: libc `exit` in the managed C runtime, `__loup_system_exit` in the libOS), and Wasm (`loup_capability.proc.exit`, no grant needed) |
| `readLine()` | Read one line from stdin (blocking); returns `string?` — `None` at EOF. `runtime.proc.stdin.readLine()` |
| `args()` | `runtime.args()` |
| `env(name)` | `runtime.env(name)` |
| `readBytes(path)` | `runtime.fs.read(path)` |
| `readText(path)` | UTF-8 read via `runtime.fs` |
| `writeBytes(path, data)` | `runtime.fs.write(path, data)` |
| `writeText(path, text)` | UTF-8 write via `runtime.fs` |
| `exec(argv)` | `runtime.proc.run(argv)` — starts `argv[0]` directly, no shell, on every host |
| `execShell(cmd)` | `cmd` through the host system shell, stdio inherited, returns the exit code — `sh -c` on Unix, `%COMSPEC% /d /s /c "cmd"` on Windows (stdlib reference §21.13) |
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

### §2-5.3 Dynamic Tracing and Time-Travel Debugging

The runtime maintains an activation registry for portals:

```
namespace debug;

enum TraceEventKind { Call, Return, Line, Exception, Await, Resume, Portal, Signal,
                      Seam, Output, Sched, Write, Gap, Bookmark }   # second row: the time-travel protocol (below)

class TraceEvent {
  pub let kind: TraceEventKind;
  pub let portal: Option[string];
  pub let callable: Option[string];
  pub let file: string;
  pub let line: int;
  pub let step: int;     # lane-local position in the execution (time-travel protocol)
  pub let task: int;     # the task, actor, worker or thread that performed it; 0 = main
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
  # Time-travel protocol (below).
  pub func recordingMode(): RecordingMode;
  pub func saveRecording(path: string): void;      # also requires "fs"; throws TraceError
  pub func bookmark(name: string, note: Option[string] = None): void;
  pub func clearRecording(portal: Option[string] = None): int;   # discards captures (all, or one portal's); returns the count
}

enum RecordingMode { Off, Armed, Full }

struct Grant {
  pub let rights: list[string];      # "observe" | "drive" | "change" | "travel" | "sensitive"
  pub let scope: string;             # surface, NodeId subtree or signal pattern; "*" = the whole program
  pub let expiresAtNs: Option[int];
}

struct CaptureServerConfig {
  pub let capacity: int = 10000;     # live events retained
  pub let grant: Grant;
}

enum McpTransport { Stdio, LocalSocket(path: string) }

struct McpServerConfig {
  pub let transport: McpTransport;   # in-program default: LocalSocket
  pub let profile: string = "default";
  pub let maxResponseBytes: int = 65536;
  pub let grant: Grant;
}

interface TraceServerHandle {
  pub func stop(): void;
}

interface CaptureServer {            # points are anchors (`portal#n`, `exception#n`, `frame#n`, a bookmark) or steps
  pub func seek(point: string): void;
  pub func checkpoints(): list[string];
  pub func why(expr: string, point: string, depth: int): list[TraceEvent];
  pub func watch(selector: string): Stream[TraceEvent];
  pub func bisect(predicate: string, from: string, to: string): Option[string];
  pub func fork(point: string, patch: Patch): TraceBranch;   # throws ForkRefused
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
  pub let line: int;           # -1 if source map unavailable
  pub let column: int;         # -1 if source map unavailable
  pub let callable: string;    # always present from static metadata or core.reflect
  pub let execMode: string;    # one of the six __execmode__ strings (§1-2.2): "web.scripted", "web.compiled", "host.scripted", "host.dual", "host.native", "freestanding"
  pub let traceLevel: TraceLevel;
  pub func locals(): dict[string, Any];  # populated only when traceLevel == Full
}

enum TraceLevel {
  Full,       # all events: line, locals, callables. Interpreted or --debug compiled.
  PortalOnly, # portal activation + call/return only. Release compiled with portals.
  Opaque,     # single boundary Call/Return frame only. Release compiled, no portals.
}
```

**Static metadata table.** When a compiled module is loaded, it registers a static metadata table with the runtime host before any function in the module can be called. This table contains:

- The fully-qualified names of all exported functions, methods, and explicit portal blocks.
- The parameter types and return types for each callable (for compiled-mode condition type-checking).
- Whether each callable has an explicit portal declaration.
- The source file and module name (baked at compile time).

The runtime uses the metadata table to populate `TraceEvent.callable` for compiled frames using the same string representation as `core.reflect.callableName`. Portal names are therefore consistent whether accessed from scripted or native contexts.

**Boundary crossing semantics.** When execution crosses from scripted (GC) code into a native (ARC) function call:

1. A `Call` trace event fires. `callable` is populated from the compiled module's metadata table.
2. The frame's `execMode` is set to the AOT mode string (`"host.native"`, `"web.compiled"`, or the AOT side of `"host.dual"`).
3. `traceLevel` is set based on the compiled module's build mode: `Full` if built with `--debug`; `PortalOnly` if built in release mode with explicit portal blocks; `Opaque` if built in release mode with no portal blocks.
4. Trace events continue appending to the shared ring buffer.

When returning from compiled to interpreted code, a `Return` event fires (callable from metadata table), and subsequent events resume at `traceLevel=Full` in the interpreted context.

**Opaque frames.** When an interpreted caller calls an opaque compiled function, the ring buffer receives a synthetic boundary `Call` event followed by a synthetic `Return` event after completion. The interior is invisible to the time-travel recorder — equivalent to stepping over a native C library in a conventional debugger.

**Reflection integration.** `TraceEvent.callable` is populated via `core.reflect.callableName`, which is available in all modes including `@mode(web.compiled)`. This eliminates the dependency on `core.inspect` for trace event population.

**Time-travel protocol** *(specified 2026-11-09, pending implementation — feature spec `2-runtime-4-time-travel`, roadmap `docs/loup-ttd-mcp-agent-roadmap.md`)*. The trace history above is the live layer of Loup's time-travel protocol, which applies to every mode except `freestanding` (whose subset is §3-3.25.9 and `debug.recording`). Every member of `DebugRuntime` requires the `"debug"` permission.

- **Captures.** Time-travel data is stored only while time travel is armed AND an activated portal has been entered. A **capture** begins when an activated portal is entered and ends when that activation exits. It holds a checkpoint taken at entry and, for the portal's extent, the value delivered at every nondeterministic seam: the capability host (every `runtime` member, §2-5.1), the platform clock, `extern native` calls (return value and declared out-parameters), the executor's turn budget (§2-1.9.9), weak-reference and finaliser outcomes, timers and worker messages, host imports, and every scheduling decision. Inside a capture, threads are serialised onto one core, switching at synchronisation operations, atomics, blocking calls and a per-lane step quantum recorded with the capture. A seam a lane cannot record is reported as a gap, never ignored. Outside a capture nothing is stored, and a seam or portal site costs one flag check. The runtime's capture store holds any number of captures, sparse in time; at its bound it evicts whole captures, oldest first. Every named callable has an implicit portal, so activating the entry portal captures a whole execution.
- **Defaults.** `loup run` and `loup test` are armed by default, with a capture store bounded at 10 minutes or 256 MiB, whichever comes first; with no portal activated they store nothing. `--portal <name>` activates a portal; `--record[=<file>]` arms time travel and activates the entry portal; `--no-record` turns it off. When an uncaught exception ends a run that holds captures, they are saved and the report names the file; `loup test` captures each test function and saves a failing test's capture. A built program captures only when built with `--record` and armed for the session.
- **Clearing.** `clearRecording` (and the `clear` operation of every debug front end, the MCP interface included) discards captures, all or selected, without disturbing the program, its portal activations or the armed state; it never deletes a saved trace file.
- **Replay.** A capture replays from its own checkpoint. A replay answers every seam from the recording, never repeats an effect, and reconstructs `Full`-fidelity events (`Line`, `Write`, locals) for code built at that fidelity. A replay that asks for a value the recording does not hold, or whose output differs, raises `ReplayDiverged` (core §1-18.1). A trace is checked against the program's source identity; a mismatch raises `TraceError`. Steps are local to the replaying lane; traces store anchors.
- **Operations on a replay** (within a capture). Seek; reverse step, next, finish and continue; `last` (the previous write of a location) and `why` (its causal chain); retroactive logpoints; queries, assertions and `bisect` in one predicate language whose `where` clauses are Loup expressions; trace comparison; and `fork`, which replays recorded seam values against changed code under a sandbox: an unmatched effect raises `ForkRefused`.
- **Sensitivity.** A `Secret` value never appears in clear in an exported trace, a checkpoint or a tool response; a replay without the session key substitutes its shape and raises `ReplayDiverged` if control flow then differs.



---
