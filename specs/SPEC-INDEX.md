# Loup Spec Index — Ordered by Layer and Dependency

## Layer 1 — Foundation (Rust, zero workspace deps)

| # | Spec | Description |
|---|---|---|
| 01 | `2-runtime-1-value-kernel` | Value carrier enum, heap objects, type metadata |
| 02 | `2-runtime-1-failure-and-exceptions` | Exception construction, throw/propagation, cleanup |
| 03 | `2-runtime-1-task-scheduler` | Cooperative event loop, Task[T] lifecycle |
| 04 | `1-bootstrap-1-parser` | Lexer and recursive-descent parser |
| 05 | `1-bootstrap-1-hir-and-mir` | HIR/MIR intermediate representations |

## Layer 2 — Compiler Pipeline + Runtime + Language + Stdlib Foundation

### Compiler
| # | Spec | Description |
|---|---|---|
| 06 | `1-bootstrap-2-name-resolution-and-imports` | Module graph, import resolution |
| 07 | `1-bootstrap-2-typechecker` | Full type system, inference |

### Runtime
| # | Spec | Description |
|---|---|---|
| 08 | `2-runtime-2-capability-host` | Runtime root, permission model |
| 09 | `2-runtime-2-module-cache` | Module Wasm cache |
| 10 | `2-runtime-2-origination-dunders` | __module__, __name__, __file__ |
| 11 | `2-runtime-2-base-exception-hierarchy` | BaseException/Exception hierarchy, signal handling |

### Language
| # | Spec | Description |
|---|---|---|
| 12 | `1-bootstrap-2-templates-and-interpolation` | Template fences, interpolation |
| 13 | `1-bootstrap-2-operator-overloading` | Operator overloading |
| 14 | `1-bootstrap-2-structs` | Struct types |
| 15 | `1-bootstrap-2-enums-and-matching` | Enums and pattern matching |
| 16 | `1-bootstrap-2-closures-and-generators` | Closures and generators |
| 17 | `1-bootstrap-2-destructuring` | Destructuring |
| 18 | `1-bootstrap-2-classes-advanced` | Advanced class features |
| 19 | `1-bootstrap-2-concurrency` | Async/await, TaskGroup |
| 20 | `1-bootstrap-2-expanded-numerics` | Fixed-width integers, bigint, decimal (v1.20: complex32/complex64) |
| 21 | `1-bootstrap-2-char-type` | char type |
| 109 | `1-bootstrap-2-complex-numbers` | **v1.20 new** — complex32 / complex64 primitives, literal syntax, ABI |
| 110 | `1-bootstrap-2-multi-dimensional-arrays` | **v1.20 new** — `array[T, rank, order, base]` primitive |
| 111 | `1-bootstrap-2-floating-point-environment` | **v1.20 new** — IEEE 754 environment (RoundingMode, flags) |
| 112 | `1-bootstrap-2-array-section-expressions` | **v1.20 new** — slice syntax `a[1:5, :, 2:8:2]` |
| 113 | `1-bootstrap-2-for-concurrent-parallelism` | **v1.20 new** — `for concurrent` statement + race checks |
| 114 | `1-bootstrap-2-interchange-array-encoding` | **v1.20 new** — `Encoding.Array` + `Order` enum in interchange |
| 127 | `1-bootstrap-2-fixed-and-handlers` | **v1.21 UI** — the `fixed` primitive (Q32.32) with FIXED-SEM's semantics on every lane, `no_float` permits it, stdlib `core.fixed`; and T-6 handler lowering (named function + typed capture struct, stable symbol paths). Status: specified / unimplemented (P6) |

### Stdlib (Layer 2)
| # | Spec | Description |
|---|---|---|
| 22 | `3-stdlib-2-script-prelude` | Script prelude (args, env, readText, print) |
| 23 | `3-stdlib-2-core-math` | core.math (sin, cos, sqrt, etc.) |
| 24 | `3-stdlib-2-io-path` | io.path (join, resolve, dirname) |
| 25 | `3-stdlib-2-debug-assert` | debug.assert (assert, expect) |
| 26 | `3-stdlib-2-core-time` | core.time (Instant, Duration, sleep, strftime) |
| 27 | `3-stdlib-2-core-datetime` | core.datetime (Date, Time, DateTime, Timezone) |
| 28 | `3-stdlib-2-core-shlex` | core.shlex (split, quote, join) |
| 29 | `3-stdlib-2-logging` | loup.log (Logger, Appender, Layout) |
| 30 | `3-stdlib-2-core-waiting` | core.waiting (waitForIt, WaitGate, WaitingScope) |
| 31 | `3-stdlib-2-loup-config` | loup.config (configuration management — ships with stdlib) |
| 32 | `3-stdlib-2-factories` | Factory protocols |
| 115 | `3-stdlib-2-core-complex` | **v1.20 new** — `core.complex` (Complex32/Complex64, polar/rect, conj, abs) |
| 116 | `3-stdlib-2-core-array` | **v1.20 new** — `core.array` (constructors, shape, reshape, transpose) |
| 117 | `3-stdlib-2-core-fpenv` | **v1.20 new** — `core.fpenv` (RoundingMode get/set, scoped helpers, flag inspection) |
| 125 | `3-stdlib-2-core-uuid` | `core.uuid` (RFC 9562 v4/v7 generation, parse/format, over the `runtime.entropy()` seam) |

### Tooling (Layer 2)
| # | Spec | Description |
|---|---|---|
| 33 | `1-bootstrap-2-source-runner` | loup run (source runner) |

## Layer 3 — Backend + Stdlib Modules + Tooling

### Backend
| # | Spec | Description |
|---|---|---|
| 34 | `1-bootstrap-3-wasm-codegen` | Wasm code generation |

### Language
| # | Spec | Description |
|---|---|---|
| 35 | `1-bootstrap-3-compiled-mode` | @compiled directive |
| 36 | `1-bootstrap-3-macros` | Macro system |
| 37 | `1-bootstrap-3-lifetime-system` | Lifetime parameters, borrow, ARC |
| 128 | `1-bootstrap-3-mode-portable` | **v1.21 UI** — `@mode(portable)`, the seventh execution mode: the PORTABLE-SUBSET, compiled in the importer's mode; PSTORE (owned `buffer[T, N]` fields on every lane the toolkit runs); own-size blocks for leaf classes on the freestanding routes. Status: specified / unimplemented (P1a) |
| 129 | `1-bootstrap-3-ui-runtime-rows` | **v1.21 UI** — RT-UI (`runtime.ui.desktop()`, the built-in `DesktopGrant`, the manifest `[permissions]` list), RUNLOOP-1 (`runtime.executor.turn` / `wakeHandle`) and SIG-LIB's retirement of both reactive interceptions, on the Stage0 interpreter, the twin interpreter and managed native. Status: specified / unimplemented (P1b, P1c) |

### Packaging
| # | Spec | Description |
|---|---|---|
| 38 | `4-packages-3-native-packaging` | Native packaging |
| 39 | `4-packages-3-lppkg-manifest` | .lppkg manifest |
| 39a | `release-distribution` | Official per-platform toolchain archives: layout, relocation, smoke test, CI workflows |

### Runtime
| # | Spec | Description |
|---|---|---|
| 40 | `2-runtime-3-debug-portals-and-tracing` | Debug portals, trace events |
| 40c | `2-runtime-4-debug-wire` | Debug wire v1 codec, client / server, the fake debuggee and the MCP trace tools (`source/runtime/debug/wire`, `tools/loup_mcp/trace_*`) |
| 40b | `2-runtime-4-trace-library` | The `.ltrace` trace library (capture model, store, format, indexes, points) and the trace query language implementation (`source/runtime/debug/trace`, `…/query`) |
| 40a | `2-runtime-4-time-travel` | Language-level time-travel protocol: recording at every nondeterministic seam, replay, seek, reverse execution, provenance, fork, the debug wire (Draft rev. 2, 2026-11-09) |

### Concurrency
| # | Spec | Description |
|---|---|---|
| 41 | `2-runtime-3-os-threads` | OS thread parallelism |
| 42 | `2-runtime-3-multithreaded-executor` | Work-stealing executor |

### Stdlib (Layer 3)
| # | Spec | Description |
|---|---|---|
| 43 | `3-stdlib-3-reflect-and-inspect` | core.reflect, core.inspect |
| 44 | `3-stdlib-3-io-modules` | io.fs, io.proc |
| 45 | `3-stdlib-3-multi-threading` | sync.thread, sync.mutex, sync.atomic |
| 46 | `3-stdlib-3-http-server` | net.http |
| 47 | `3-stdlib-3-websocket` | net.ws |
| 48 | `3-stdlib-3-simd` | native.simd |
| 49 | `3-stdlib-3-css` | web.css |
| 50 | `3-stdlib-3-structures` | structures.* (CaseInsensitiveDictionary, etc.) |
| 51 | `3-stdlib-3-data-csv` | data.csv |
| 52 | `3-stdlib-3-data-toml` | data.toml |
| 53 | `3-stdlib-3-data-xml` | data.xml |
| 54 | `3-stdlib-3-data-yaml` | data.yaml |
| 55 | `3-stdlib-3-data-ini` | data.ini |
| 55a | `3-stdlib-3-data-query` | data.query (URL query strings, UTF-8 percent-encoding) |
| 56 | `3-stdlib-3-io-streams` | io.streams |
| 57 | `3-stdlib-3-net-tcp` | net.tcp |
| 57a | `3-stdlib-3-net-addressing` | net.addressing (Url, UrlQuery, Host, IpAddr, SocketAddr) |
| 58 | `3-stdlib-3-net-tls` | net.tls |
| 59 | `3-stdlib-3-net-dns` | net.dns |
| 60 | `3-stdlib-3-net-tcp-tls-dns` | net.tcp, net.tls, net.dns (combined) |
| 61 | `3-stdlib-3-sync-channel` | sync.channel |
| 62 | `3-stdlib-3-sync-semaphore` | sync.semaphore |
| 63 | `3-stdlib-3-debug-profiler` | debug.profiler (span profiler; design row PROF-1) |
| 126 | `3-stdlib-3-debug-recording` | debug.recording — the F6 × console C1 nondeterminism recording ring (freestanding) |

### Tooling (Layer 3)
| # | Spec | Description |
|---|---|---|
| 64 | `1-bootstrap-3-formatter-and-diagnostics` | loup fmt, diagnostics |
| 65 | `1-bootstrap-3-test-and-package-tool` | loup test, loup build, loup pkg |
| 66 | `1-bootstrap-3-louppath` | LOUPPATH search path |
| 67 | `1-bootstrap-3-project-local-cache` | Project-local cache |

### Application Framework (Layer 3)
| # | Spec | Description |
|---|---|---|
| 68 | `3-stdlib-3-thisapp` | Application presence/config |
| 69 | `3-stdlib-3-cli` | loup.cli (CLI argument parsing) |
| 70 | `3-stdlib-3-testing` | testing (foundation test framework) |

## Layer 4 — Self-Hosting Migration

| # | Spec | Description |
|---|---|---|
| 71 | `1-bootstrap-4-stdlib-migration` | Stdlib migration from Rust to Loup |
| 72 | `1-bootstrap-4-tooling-migration` | Tooling migration to Loup |
| 72a | `1-bootstrap-4-loup-mcp-tools` | `loup mcp` toolchain tools (check, run, test, fmt, spec_lookup, example_search) on loup.mcp; TTD/MCP roadmap P6.2, readiness RR-D4 |
| 73 | `1-bootstrap-4-compiler-frontend-migration` | Compiler frontend migration |

## Layer 5 — Advanced Features (Web, UI, Native, FFI, GPU)

### Web
| # | Spec | Description |
|---|---|---|
| 74 | `3-stdlib-5-web-dom` | web.dom |
| 75 | `3-stdlib-5-web-storage` | web.storage |
| 76 | `3-stdlib-5-web-workers` | web.workers |
| 77 | `3-stdlib-5-web-components` | Web Components |

### UI
| # | Spec | Description |
|---|---|---|
| 78 | `3-stdlib-5-reactive-core` | ui (Signal, View, mount). **Status (M11): signals superseded by `loup.ui.signal` (SIG-LIB); `View` front end only** |
| 79 | `3-stdlib-5-web-backend` | ui.web. **Status (M11): stub adapters only; deferred (ruled 2026-11-03), the way paved; to be re-specified over the backend contract** |
| 80 | `3-stdlib-5-desktop-backend` | ui.desktop. **Status (M11): superseded by `4-packages-6-loup-ui-backend` + `-loup-ui-desktop`** |
| 81 | `3-stdlib-5-ui-fence` | ui fence layout primitives. **Status (M11): front end only; lowers to the tree literal in P10** |
| 82 | `3-stdlib-5-ui-animation` | ui.animation. **Status (M11): superseded by the UI core's animation sampler** |

### Native/FFI
| # | Spec | Description |
|---|---|---|
| 83 | `1-bootstrap-5-native-compilation` | Native compilation (LLVM/Cranelift). Status: managed native **LLVM (text) backend implemented** (MIR→`.ll`→clang, ARC object lifecycle), including **native exception handling** (§3-2 `@mode(host.native)`) — `throw`/`try`/`catch`/`finally` via a sentinel-propagation model (no libunwind, all-i64 clang backend): local + cross-function propagation, subtype catch matching, `finally`, deterministic uncaught exit (134), and **ARC release on every unwind path** (direct throw, cross-frame propagation, nested re-throw, sibling + catch/finally-interior handlers), all verified end-to-end (clang-executed) + via the real `loup build`. The **Cranelift backend** (`--backend cranelift`, pure-Rust `cranelift-*` library; MIR→CLIF→object→clang link) is implemented through **Phase 2 (value types)**. Phase 1 = the Tier-1 compute set (arithmetic incl. unsigned-64 intrinsics, comparisons, operator-dispatch, logic/bitwise/shift, casts, locals, direct + cross-function calls, all CFG terminators). Phase 2 adds the value-type layer over the **shared `StructLayouts` backing-block + type-id-slot model** (identical to the C/LLVM backends): module globals (`LoadGlobal`/`StoreGlobal`/`LoadGlobalAddr` → writable data objects), enums (`NewEnum`/`EnumDiscriminant`/`EnumDestructure`), structs (`NewObject`/`GetField`/`SetField`/`StructCopy`), and buffers (`MakeBuffer`/`Index`/`SetIndex`) — each backing block a per-(fn,dest) Cranelift data object. **Verified:** module globals + enums (construct + `match`) end-to-end via the real `loup build --target native --backend cranelift`; structs (construct/read + `SetField` mutation) + buffers via hand-built-MIR unit tests (hosted link→run). **Phase 2c** adds **strings** (literals + `len`): `run_cranelift_build` links `companion_runtime_c()` (the struct-ABI string runtime + `__loup_runtime_strslice_*` pointer-ABI wrappers); a `Const String` materializes a static byte blob + a 16-byte `loup_str_slice` descriptor filled at runtime by `__loup_runtime_strslice_init`, and `CallVirtual "len"` → `__loup_runtime_strslice_len` — verified `"hello".len()` → 5 with `--backend cranelift` = `--backend llvm` (the string imports are declared only when the program uses string literals, so string-free objects stay self-contained). `iter`/`next` and string-from-non-literal `len` are follow-ups. Also fixed in this layer: a pre-existing **front-end resolve bug** where `name = value` named-argument labels (lowered as `Assignment { target: VarRef }`) were scope-resolved as identifiers, breaking every `Struct(field = v)` constructor in the full build/run pipeline across **all** backends (`resolve_call_arg_expr`, mirroring the typechecker). **Value-semantics scope (`type_is_value_copied`):** the Cranelift route was flipped to `NativeArc` lowering, and the anti-aliasing `StructCopy` (previously freestanding-only) now also fires under managed-native — but **only for genuine value types**. A `struct` is value-copied on every static-backing target (`Freestanding | NativeArc`, via `uses_static_object_backing()`), with a `module_function_returns` map resolving struct-returning calls whose `type_slot` is unresolved at MIR-lowering time. A bare/`local class`, however, is an **ARC reference type** (§1-8.1.1 — local heap, refcounted; strong references observe each other's mutations), so it is value-copied ONLY under freestanding (genuine value blocks there) and **never under managed ARC** — copying it would break reference aliasing (`let b = a`, mutate-through-arg), an adversarial-review-confirmed regression that an earlier over-broad version of this fix introduced. **Phase 3a increment 1 (managed reference-class heap allocation — LLVM, landed):** the `local class` factory-aliasing case (two `make(): Box` → 40 not 30) was a heap-allocation problem, not a copy problem — a `local class` is an ARC reference type, so managed construction now routes to `NewSharedObject` (heap `loup_arc_alloc`, distinct per execution) instead of static `NewObject`. Fixed at the lowering layer (`collect_shared_class_types` includes `local` classes under `is_arc()`; the constructor-sugar arm emits `NewSharedObject`), so LLVM is fixed for free: factory→30, mutate-through-arg→99, combined→129. **Exception classes are EXCLUDED** (transitively subtyping `Exception`/`BaseException`) — the native EH handles VALUE exceptions only, so they keep the static `NewObject` model. **Cranelift** fails loudly (E-BUILD-NATIVE) on `NewSharedObject` until its heap arm lands. **ARC lifecycle (leak CLOSED):** factory results (`let a = make()`) and direct constructor sugar (`let a = Box(10)`) for managed reference classes now register as ARC owners → scope-exit `ArcRelease` (verified `loup_arc_live()==0`; the generic consume-on-return path prevents double-free). **Cranelift ARC heap arm (DONE — Phase 3a COMPLETE, both backends at parity):** Cranelift now heap-allocates managed reference classes too — `NewSharedObject` → `loup_arc_alloc` (24-byte header), header-offset `GetField`/`SetField`, `Retain`/`Release` → `loup_arc_retain`/`loup_arc_release`, and ARC programs link `managed_runtime_c()`. `shared_regs` = the backend-independent `shared_object_regs` dataflow ∪ the lowering-recorded `module.shared_field_receivers` (the authoritative receiver set, covering shared *parameters* like `bump(x: Box)` the dataflow misses). The loud guard is removed. Verified `--backend cranelift` = `--backend llvm`: factory→30, mutate-through-arg→99, alias→77, combined→129, 100-iteration construct loop→86 (no double-free); ARC-free programs unchanged. **Cranelift native exceptions (first increment):** the managed sentinel-propagation EH model (mirroring LLVM) — `__loup_exc_value`/`__loup_exc_active` sentinels (the latter exported strong, runtime weak fallback), `Throw` publishes + jumps to the in-frame catch dispatch (`build_eh_handler_map`, hoisted `pub(crate)`), `CaptureException` + `TypeCheck` (value type-id slot) filter, catch-body entry clears the flag, EH programs link `managed_runtime_c()` (the `LIBC_ENTRY_C` destructor → exit 134 on uncaught). Verified throw + local catch → 42, parity with `--backend llvm` (via a managed-pipeline test harness). **Cranelift cross-call propagation + `finally` (Task 5 — DONE):** a may-throw user `Call` (a callee in the module's `defined` set; runtime/intrinsic helpers skip it) now emits a **post-call EH check** — load `__loup_exc_active`, `brif` to a fresh `uw` (unwind) block or a `co` (continuation) block. Because the Cranelift `FunctionBuilder` already tracks the current insertion block, `switch_to_block(co)` after the split routes the rest of the MIR block + its terminator into `co` with **no manual cursor threading** (the structural win over the LLVM text backend, which splices `eh_co_N` labels by hand). The `uw` block first releases the call site's `unwind_releases[(block,instr_idx)]` reference-class owners via `loup_arc_release` — cross-frame ARC cleanup so a throwing scope's `shared` objects don't leak as the exception propagates *through* the frame — then jumps to the innermost enclosing catch dispatch (`eh_handler`, with `phi_args` for the synthetic `uw→dispatch` edge) or, with no in-frame handler, sentinel-returns (the flag stays raised for the caller's own post-call check). `uw`/`co` are sealed at creation (single known predecessor each). `finally` blocks already routed correctly (ordinary MIR blocks the normal + catch paths flow into). Verified `--backend cranelift` = `--backend llvm` (in-crate managed harness: `emit_object`→`managed_runtime_c` link→execute): cross-call throw caught → 55, `finally` on the exception path → 105, and four cross-frame ARC leak-balance scenarios all → `loup_arc_live()==0` (caught-locally, propagate-out via sentinel-return, no-double-free on the non-throwing path, multiple owners + alias). The end-to-end native build pipeline is independently confirmed (a trivial `@compiled func main(): int { return 42 }` builds + runs → 42 on both backends). **Managed-native EH + value-types now verified END-TO-END through the REAL CLI (typecheck-included).** Earlier the EH/ARC proofs ran only through the in-crate codegen harness (`run_managed_prod`), which lowers parse→HIR→MIR→object and SKIPS `typecheck::typecheck()` — so it never exercised §1-18.1 error-class validation, `E_THROW_NOT_EXCEPTION`, or `E_OVERRIDE_REQUIRED`. A new `loup_tools` integration test (`build_native_eh_e2e.rs`) drives the production `orchestrator::build()` (the function `loup build` itself calls — full resolve + typecheck + codegen + clang link) for a throw/catch-across-a-call program and RUNS the binary on both backends → 55. Manually confirmed end-to-end on both backends: cross-call throw caught → 55, catch-by-base (subtype expansion) → 55, `finally` on the exception path → 105, uncaught → 134, struct distinct copies → 30, struct field-set → 7. **Front-end ergonomics — GAP 1 (Exception availability) FIXED.** `Exception`/`BaseException` are now compiler-provided **built-in typecheck named types** (`register_exception_base_types` in `typecheck/builtins.rs`, sentinel ids `BUILTIN_ID_EXCEPTION`/`BUILTIN_ID_BASE_EXCEPTION`, modeled on the capability-handle pattern), carrying the three §1-18.1 inherited fields (`message: string`, `cause: Option[Any]`, `stackTrace: list[Any]`) as mutable members. A user error program now writes the NATURAL form — `class MyErr : Exception { func init(d){ self.message = d; ... } }; throw MyErr(...); try/catch` — with NO locally-redeclared base, and it builds + runs → 55 through the real CLI on both backends (two new `build_native_eh_e2e.rs` tests). Deliberately NOT done via HIR injection (which would make script-mode `register_user_classes` `replace()` the runtime's built-in `EXCEPTION_META`, clobbering the 42-strong exception hierarchy); the typecheck-only path leaves codegen (name-based `class_subtypes_exception`) and the script-mode runtime untouched — full workspace regression green (574 suites/0 failed/9744 tests). §1-18.1 spec updated with the built-in-availability note. **Constructors FIXED (`new(){ this.x = ... }` runs everywhere).** The canonical constructor form `new(params) { this.x = ... }` (§1-8.4) was un-typecheckable on EVERY backend: the typecheck `Constructor` arm left `current_method_name` unset (`<unknown>`), so the field-write modifier exemption (constructor names `{"constructor","init","<init>"}`) didn't fire and `this.x = v` raised `E_MODIFIER_REQUIRED`. With no valid `new(){}`, class construction created an object but ran NO init logic — verified `class D { var x; new(){ this.x = 77 } } D().x` was 0 on cranelift, llvm, AND the interpreter (the lowering + all three backends already execute a constructor body; they just never got a valid one). Fixed: the `Constructor` arm now sets `current_method_name="constructor"` around the body check (mirroring the `Method` arm). Now `new(){ this.x=77 }`→77, computed args `new(n){ this.x=n+100 }`→`D(5).x==105`, multi-field, empty ctors, and exception-subclass `new()` all run on the interpreter + both native backends. NOTE `func init` remains an ORDINARY method (never auto-called by construction) — only `new()` is a constructor. **Remaining front-end limitations (deferred):** (3) `super.method()` and an explicit `self` parameter are rejected by the bootstrap parser (so the stdlib's `pub func init(self,…){ super.init(…) }` canonical-spec form does NOT parse through this front-end — stdlib is compiled by a different path), which combined with the no-override-on-`init` rule means base+leaf can't both declare `init` and subclasses can't chain base init in `@compiled host.native` today. Struct construction requires named args (`Pt(x = v)`). Runtime introspection like `loup_arc_live()` is not exposed to user `@compiled` programs (ARC leak-balance stays harness-verified). **Script-mode (MIR interpreter) user-class inheritance + exceptions FIXED (a multi-fix arc).** Three bugs compounded: (i) `build_class_metadata` (`loup-runtime/user_type_registry.rs`) built each class meta from OWN fields only + hardcoded `supertype: ANY_META` → inherited fields had no slot → "no field X on type"; now flattens parent fields + links the real parent, registering classes in dependency order via a fixpoint. (ii) `catch (E as e)` lowered a `StoreLocal` to the binding slot but never registered the binding name→slot in `local_slots`, so the body's `e` resolved to the slot-0 stub = `None` ("GetField on non-Boxed: None"); now registered clause-scoped like `let`/`match` (shared lowering, native EH unaffected). (iii) the built-in `EXCEPTION_META`/`BASE_EXCEPTION_META` carry NO `FieldInfo` (their `[message,trace_id,cause]` object slots are read by hardcoded index in the Rust accessors, never declared), so a user `class MyErr : Exception` flattened zero inherited fields and `e.message` failed; `build_class_metadata` now SYNTHESIZES the three §1-18.1 base fields (`message`/`cause`/`stackTrace`, matching the typecheck/native inherited layout) when the parent is the empty built-in exception root. With constructors now running (above), verified via `loup run`: non-exception inheritance, a user `class MyErr : Exception { new(m){ this.message=m; this.detail=m } }` reading inherited `e.message` + own `e.detail` in a catch, and a multi-field subclass all work (`risky(false)`→"computed-ok"; `risky(true)`→"caught[validation]: input was bad"). The interpreter's synthesized order (message,cause,stackTrace) differs from the built-in `exception_new` object order (message,trace_id,cause), but access is by NAME so it's internally consistent; that 3-way `exception_new` / leaf-meta / typecheck inconsistency is pre-existing and only affects the Rust accessors on *user* exceptions (a narrow uncaught-formatting edge). **CANONICAL EXCEPTION FIELD LAYOUT — unified across interpreter + native (3 stages, landed).** The model had a 3-way inconsistency (`exception_new` objects `[message@0, trace_id@1, cause@2]`; empty/mismatched declared metas; typecheck/native `[message,cause,stackTrace]`). Now every layer aligns on the canonical physical order = `exception_new`'s `[message@0, stackTrace(trace)@1, cause@2]` (leaving loup-core construction + accessors + serialization untouched; access is by NAME so it's observably order-independent). **Stage 1 (native):** `lower_mir` registers the three §1-18.1 base fields on every exception subclass's `StructLayout` (the global-slot field-index), so writing/reading inherited `this.message`/`e.message` on a `class X : Exception` now works on ALL native backends — this FIXED the prior gap where llvm errored `E-BUILD-NATIVE: write field 'message' not in layout` and cranelift SEGFAULTED on read (verified `e.message.len()+50`→55 on both; two new `build_native_eh_e2e` `new()`-ctor tests that actually exercise the inherited write+read). **Stages 2-3 (script):** `BASE_EXCEPTION_META` declares the 3 base fields; the interpreter `GetField`/`SetField` walk the supertype chain (`resolve_field_index`) so built-in exceptions inherit them; the interpreter's synthesized subclass order is corrected to `[message, stackTrace, cause]`; and `exception_stack_trace`/`exception_cause` are DEFENSIVE (a user exception built via `new` may leave the stackTrace/cause slot unset → return empty/`None` instead of panic). Built-in exception construction + accessors on built-ins are unchanged. **Remaining script-mode runtime gaps (separate follow-ups):** uncaught exceptions panic the interpreter (rc=101) rather than a clean exit; `1/0` in a `try` panics instead of throwing a catchable `IntegerDivisionError`; reading an INHERITED field on a CAUGHT BUILT-IN exception (catch a `TypeError`, read `e.message`) still fails (the leaf built-in metas have empty/mismatched `fields`). **Managed struct construction (FIXED, both backends):** struct constructor sugar `Pair(a=3, b=4)` lowered to a bodiless `Call` (LLVM link error / Cranelift segfault); now a struct constructor-sugar arm emits static `NewObject` (structs are value types), placing named args in declared field order (out-of-order `Pair(b=4,a=3)` works) + default padding — also unblocking struct value-semantics end-to-end (factory → distinct copies). **Managed value collections (Cranelift — DONE):** `list`/`dict`/`tuple` support plus all twelve list/dict ops (`get`/`push`/`len`/`for-in`/`slice`/`pop`/`concat`/`contains`/`keys`/`values`/`remove`) and tuple `t.N`, with G-ARC scope-exit reclaim — shallow `__loup_*_free` + the same static single-owner container-of-container deep-free, verified `loup_coll_live()`/`loup_tuple_live()==0` per category and ASan/UBSan-clean (shared conservative safe-leak floor; no LLVM-style Phase-2 returns-owned reclaim, so a call-result collection is safely leaked). Commits 84bbd4df (list), 56ca011d (dict), 0030d1a1 (untyped-dict inference), e7b13385 (ops+tuple). **Pending:** Cranelift freestanding boot (blocked on inline-asm: Cranelift emits objects directly with no `call asm` escape hatch), and the broader Phase-3 runtime surface (async/tasks, UI/signals, FFI, weak refs, LTO/output-types) — managed ARC + exceptions are DONE (see above). Note: freestanding mode (§3-3) does **not** support exceptions (`E_FREESTANDING_EXCEPTIONS`); the managed/hosted EH/ARC status above is the managed native target only. **Freestanding aarch64 (LLVM text backend, `--backend llvm`) — freestanding aarch64 asks 17–20 (loup 1.20.3):** the aarch64 build target + datalayout/triple (Ask 17) and arch-correct inline asm (Ask 18, no x86 `.intel_syntax` wrapper) landed earlier; **1.20.3 adds** (19B) arch-aware asm operand register constraints — aarch64 `in:`/`out:` operands map `x0`→`{x0}` (x86 `dx`→`{rdx}` unchanged), via `aarch64_register`/`llvm_asm_constraint`; (20) **interface/vtable dispatch** — `iface.method()` (`@ifacecall:<I>:<m>`) lowers to the same type-id `switch` over implementers the C backend uses (`emit_interface_dispatch`: load self's type-id slot → switch → `call @<Type>__<method>`), replacing the undefined `_ifacecall_*` link error; (19A) **self-contained freestanding string constants** — the `{ptr,len}` slice descriptor is initialized with two inline stores instead of an external `__loup_runtime_strslice_init` call, removing the runtime symbol from the boot path and staying PIC-safe (Ask-12 zero-reloc; static-init was rejected for that reason). The `_main_`-injection half of 19A is WONTFIX (both C and LLVM backends inject `_main_` into the boot-entry-callee identically — Ask-16, required for module-global init). The self-host LLVM front-end port (`source/runtime/compiler/codegen/codegen_llvm.loup`) tracks these byte-identically via the differential parity harness (38 checks). |
| 124 | `1-bootstrap-5-mainframe-s390x` | **new** — Bare-metal IBM Z (s390x) freestanding target: arch backend, PSW interrupt model, channel-subsystem I/O (native.css), endianness-aware Volatile, build plumbing — KVM-on-Z guest (virtio-ccw) + bare-metal. Status: **specified / unimplemented**. |
| 84 | `1-bootstrap-5-c-interop` | C header interop |
| 85 | `3-stdlib-5-js-interop` | lang.interop.js |
| 86 | `3-stdlib-5-native-interop` | lang.interop.native |
| 87 | `3-stdlib-5-thread-safety` | @threadSafe, ThreadSafeHandle |
| 88 | `3-stdlib-5-native-ffi` | native.ffi |
| 89 | `3-stdlib-5-native-mem` | native.mem |
| 90 | `3-stdlib-5-lang-interop-native` | lang.interop.native |
| 91 | `3-stdlib-5-lang-macro` | lang.macro |
| 130 | `1-bootstrap-5-hosted-ui-toolchain` | **v1.21 UI** — toolchain for the hosted UI backends, re-derived after the macOS AppKit work (link keys and `addressOf` C callbacks already landed): `@repr(C)` struct results and large struct arguments on both LLVM emitters, a Windows check, the main-thread rule, and G5 (UI dev intrinsics in the natively built interpreter). Status: specified / unimplemented (P12) |

### GPU/Tensor/TPU
| # | Spec | Description |
|---|---|---|
| 92 | `1-bootstrap-5-gpu-fence-descriptors` | GPU fence descriptors. **Status (M11): front end only (parse and interpolation types; nothing lowers, gates or runs)** |
| 93 | `3-stdlib-5-loup-tensor` | loup.tensor |
| 94 | `3-stdlib-5-native-webgpu` | native.webgpu (v1.20: rasterization pipeline; was compute-only). **Status (M11): not implemented** |
| 95 | `3-stdlib-5-native-gpu` | native.gpu. **Status (M11): not implemented** |
| 96 | `3-stdlib-5-loup-autodiff` | loup.autodiff |
| 97 | `3-stdlib-5-native-hal` | native.hal |
| 98 | `3-stdlib-5-native-tpu` | native.tpu |
| 99 | `3-stdlib-5-loup-tpu` | loup.tpu |

### Application Framework (Layer 5)
| # | Spec | Description |
|---|---|---|
| 100 | `3-stdlib-5-debug-browser` | debug.browser |

### Tooling (Layer 5)
| # | Spec | Description |
|---|---|---|
| 101 | `1-bootstrap-5-web-security-hardening` | Web security |
| 102 | `1-bootstrap-5-hardware-management` | Hardware management commands |
| 103 | `1-bootstrap-5-debug-server-bootstrap` | Debug server bootstrap |
| 118 | `1-bootstrap-5-fortran-frontend` | **v1.20 new** — Fortran 77/90/2018 lexer, AST, semantic analysis, Loup-source emitter |
| 119 | `3-stdlib-5-native-window` | **v1.20 new** — `native.window` (bare OS window, event loop, present surface). **Status (M11): superseded by `4-packages-6-loup-ui-backend` + `-loup-ui-desktop`; never implemented; the folder's design maps every name to its home** |
| 120 | `3-stdlib-5-native-audio` | **v1.20 new** — `native.audio` (mixer / voice graph / sample playback) |

## Layer 6 — Packages (require loup install)

| # | Spec | Description |
|---|---|---|
| 104 | `4-packages-6-loup-schema` | loup.schema (runtime schema validation) |
| 105 | `4-packages-6-loup-http` | loup.http (HTTP client/middleware) |
| 106 | `4-packages-6-loup-cache` | loup.cache (caching abstractions) |
| 106a | `4-packages-6-loup-mcp` | loup.mcp (JSON-RPC 2.0 + MCP server core, tool registry, transports; TTD/MCP roadmap P6.1) |
| 107 | `4-packages-6-loup-ai` | loup.ai (LLM orchestration) |
| 108 | `4-packages-6-loup-queue` | loup.queue (message queue) |
| 121 | `4-packages-6-loup-fortran` | **v1.20 new** — `loup.fortran.{fmt,kind,intrinsic,array,io}` translator-output type/format packages |
| 122 | `4-packages-6-loup-numerical-algebra` | **v1.20 new** — BLAS / LAPACK / FFTW / ScaLAPACK bindings |
| 123 | `4-packages-6-loup-hpc-parallel` | **v1.20 new** — OpenMP / MPI / NetCDF / HDF5 bindings |
| 131 | `4-packages-6-loup-ui-core` | **Loup Common UI** (edition-bundled, M16) — `loup.ui.core` with `loup.ui.fixed`, `loup.ui.signal`, `loup.ui.mem`: portable numerics, signals, element store, Tier 1 layout, step-driven frame clock, input, focus, keymap, animation sampler, projection, `Ports`, budgets. Status: specified / unimplemented (P2–P3) |
| 132 | `4-packages-6-loup-ui-paint` | **Loup Common UI** (edition-bundled, M16) — `loup.ui.paint`: display list, integer rasteriser, damage; inflate and PNG. Status: specified / unimplemented (P3, P9) |
| 133 | `4-packages-6-loup-ui-text` | **Loup Common UI** (edition-bundled, M16) — `loup.ui.text`: faces (a struct of function values), the atlas face, TrueType faces with Tier-A shaping, UAX #29/#14/#9, paragraphs, editing, the Helios subset face. Status: specified / unimplemented (P3, P9) |
| 134 | `4-packages-6-loup-ui-backend` | **Loup Common UI** (edition-bundled, M16) — `loup.ui.backend`: the backend contract, the headless oracle, Helios (L0/L1), Wayland, macOS, Win32; one window is a valid host; the browser host is deferred with the way paved. Status: specified / unimplemented (P3, P4, P8, P13, P14) |
| 135 | `4-packages-6-loup-ui-controls` | **Loup Common UI** (edition-bundled, M16) — `loup.ui`: controls, theme, platform defaults, keymap, clipboard model, raster icons (Tier 2/3 containers build on it). Status: specified / unimplemented (P3–P5, P9) |
| 136 | `4-packages-6-loup-ui-desktop` | **Loup Common UI** (edition-bundled, M16) — `loup.ui.desktop`: the app-facing desktop API re-specifying Vol 2 §2-4.8 over the backend hosts (dialogs as requests; Tray behind a false flag; print cut). Status: specified / unimplemented (P8b, P13, P14) |

## Notes

- **`webworks` (first-party web application framework, `source/packages/webworks/`) is DE-SCOPED from the v1.20 release** (decision 2026-06-22; see `v1_20-release-roadmap.md` G5). It is deferred, not deleted — the source, tests, and per-package spec folders remain in-tree. It is hard-blocked on the stdlib server transport (`#46 3-stdlib-3-http-server` / `#47 3-stdlib-3-websocket`, unimplemented; runtime TCP is a stub) and a residual dialect migration (32/193 files: 476 `pub use`, 13 `fn`, 3 `impl`) + a package manifest. Re-scope once #46/#47 land on a real TCP capability.
- The number prefix now reflects strict layer ordering: Layer 1 (01-05), Layer 2 (06-33), Layer 3 (34-70), Layer 4 (71-73), Layer 5 (74-103), Layer 6 (104-108)
- The layer tag in the folder name (e.g., `-2-`, `-3-`, `-5-`) indicates the dependency layer
- Within a layer, specs are grouped by category (compiler → runtime → language → stdlib → tooling) and ordered by implementation sequence
- Within a layer, specs can be implemented in any order unless they have explicit dependencies

## Language References

**v1.20 (current normative).** Split into four volumes:

- [`loup-language-core-v1_20.md`](./loup-language-core-v1_20.md) — **Vol 1 (Core).** Types, expressions, statements, classes, generics, grammar.
- [`loup-language-runtime-v1_20.md`](./loup-language-runtime-v1_20.md) — **Vol 2 (Runtime).** Concurrency, FFI, UI, capabilities.
- [`loup-language-compilation-v1_20.md`](./loup-language-compilation-v1_20.md) — **Vol 3 (Compilation).** Web, native, freestanding, hardware backends.
- [`loup-language-data-v1_20.md`](./loup-language-data-v1_20.md) — **Vol 4 (Data Formats).** Serialization, interchange.

Companion docs:

- [`loup-stdlib-reference-v1_20.md`](./loup-stdlib-reference-v1_20.md) — Stdlib v1.20 (supersedes v1.19).
- [`loup-packages-reference-v1_12.md`](./loup-packages-reference-v1_12.md) — Packages v1.12 (supersedes v1.11).
- [`loup-fortran-hpc-packages-v1_0.md`](./loup-fortran-hpc-packages-v1_0.md) — Fortran/HPC packages reference (v1.0; new in v1.20).
- [`loup-cobol-mainframe-packages-v1_0_1.md`](./loup-cobol-mainframe-packages-v1_0_1.md) — COBOL/mainframe packages reference (v1.0.1).
- [`loup-crypto-packages-v0_1.md`](./loup-crypto-packages-v0_1.md) — Cryptography packages reference (`loup.crypto.*`; v0.1 Draft — pure-Loup, KAT-gated; architecture ratified, implementation not started).
- [`loup-qualification-plan-v1_0.md`](./loup-qualification-plan-v1_0.md) — **Toolchain Qualification Plan v1.0** (authored 2026-09-09). Qualified scope and tool classes (T1/T2/T3), the `QP-n` requirements, the Language Safe Subset and its reserved `E_LSS_*` codes, build attestation, and the `CTR-<AREA>-NNN` register. Read its §1.4 and §8.1 first: it marks every requirement **[implemented]**, **[partial]** or **[planned]**, and four of eleven have no evidence yet. Not a certification.
- [`loup-ui-framework-spec.md`](./loup-ui-framework-spec.md) — **Loup Common UI Framework Specification** (normative, ruling M1, 2026-11-02): Part 0 render core, Parts 1–5 layout, containers, declaration model, drag and drop.
- [`loup-ui-backend-contract.md`](./loup-ui-backend-contract.md) — UI backend contract (`loup.ui.backend`), a companion to the framework spec.
- [`loup-ui-controls-theme.md`](./loup-ui-controls-theme.md) — minimal controls and theme, a companion to the framework spec.
- [`loup-ui-warp-reconciliation.md`](./loup-ui-warp-reconciliation.md) — the Warp reconciliation note (ruled 2026-11-02/03): the framework is the base, Warp an opt-in assurance profile.
- [`loup-ui-framework-architecture-v1_0.md`](./loup-ui-framework-architecture-v1_0.md) — Warp v1.0, **superseded in part** (M1): normative only as the opt-in assurance profile defined in the reconciliation note.

Migration catalogs + meta-specs:

- [`loup-changes-v1_19-to-v1_20.md`](./loup-changes-v1_19-to-v1_20.md) — Normative diff catalog between v1.19 and v1.20.
- [`loup-changes-v1_20-to-v1_21.md`](./loup-changes-v1_20-to-v1_21.md) — **Normative diff catalog for the v1.20 → v1.21 cascade.** No renumbering table: LCP-10 ruled the changes land as in-place amendments to the v1.20 documents, so the catalogue exists because the diff must exist regardless of the version label. Read §4 for the breaking changes (`#` comments and `//` floor division, no implicit numeric promotion, `const` means compile-time, `@panic_handler` returns `noreturn`, zero-variant enums illegal, no ternary).
- [`x-update-v1_20-to-v1_21/`](./x-update-v1_20-to-v1_21/) — Meta-spec and ROADMAP for aligning the specification set with the two on-tree proposals: [`loup-proposal-zig-highlighted-gaps.md`](./loup-proposal-zig-highlighted-gaps.md) (LCP-2026-001: const-evaluation profile, `[options]` + `if const`, error return traces; allocator-as-parameter deferred; `errdefer` optional) and [`loup-proposal-divergence-v1_0.md`](./loup-proposal-divergence-v1_0.md) (`noreturn` / `unreachable` / `impossible`). Phase 0 = the designer's rulings (gates every edit); Phases 2–6 = section-level spec edits per volume; Phase 7 = change catalog `loup-changes-v1_20-to-v1_21.md` + verifier; Phase 8 = `v21.<feature>.N` implementation tasks queued in 16 feature folders (both lanes). Status (2026-09-09): **Phase 0 complete — every LCP, SQ, DV and BV item is ruled or discharged**; Phase 1 recorded (`phase1-findings.md`), including the BV-6 collision re-run; Phases 2–5 volume text **substantially landed**; `loup-qualification-plan-v1_0.md` **commissioned and present**, which discharged BV-7. No blocking gap remains: what is left is Phase 6 (the divergence text), the §1-2.6 matrix rows and §1-19 grammar productions, and Phase 7's change catalog.
- [`x-update-v1_19-to-v1_20/`](./x-update-v1_19-to-v1_20/) — Meta-spec coordinating v1.19 → v1.20 cascade into per-feature folders. Six new Language folders, three new Stdlib folders, two new Stdlib platform folders, one new Bootstrap-layer (Fortran frontend) folder, three new Packages folders — see "v1.20 New Feature Folders" table below.

Historical references (preserved):

- [`117-to-118-detailed-summary-changes.md`](./117-to-118-detailed-summary-changes.md) — Diff catalog v1.17 → v1.18.
- [`1_16-1_17-differences.md`](./1_16-1_17-differences.md) — Diff catalog v1.16 → v1.17.
- [`x-update-117-to-118/`](./x-update-117-to-118/) — Meta-spec for the v1.18 cascade. Five new feature folders: `1-bootstrap-2-unified-memory-model`, `1-bootstrap-2-shared-memory-concurrency`, `3-stdlib-3-sync-shared`, `3-stdlib-2-core-serialization`, `4-packages-3-shared-class-abi`.
- [`x-update-v1_18-to-v1_19/`](./x-update-v1_18-to-v1_19/) — Meta-spec for the v1.19 cascade. v1.18/v1.19 language and stdlib refs were consolidated and superseded by the v1.20 four-volume split (no longer in repo).
- [`v1_19-release-readiness.md`](./v1_19-release-readiness.md) — v1.19 release-gate index (closed).
- [`v1-17-meta-spec/`](./v1-17-meta-spec/) — Historical meta-spec for the v1.17 cascade (preserved; do not edit).
- [`v1-13-meta-spec/`](./v1-13-meta-spec/) — Historical meta-spec for the v1.13 cascade (preserved; do not edit).

## v1.18 New Feature Folders

| Folder | Scope |
|---|---|
| `1-bootstrap-2-unified-memory-model` | Unified ARC model, `local class` / `shared class` modifiers, class-kind bounds, Integer/Float/Numeric marker interfaces (§4.0, §8.1.1, §12) |
| `1-bootstrap-2-shared-memory-concurrency` | `Shareable`, `SharedBuffer[T]`, `SharedArray[T]`, `core.atomic`, `SharedArena`, `SharedRef[T]`, cross-mode ABI, worker integration (§17b) |
| `3-stdlib-3-sync-shared` | `SharedMutex[T]`, `SharedRwLock[T]`, `SharedCondVar`, `SharedSemaphore`, `SharedBarrier`, `SharedQueue[T]`, `SharedStack[T]` and guard types (§17b.8, Stdlib §21.3) |
| `3-stdlib-2-core-serialization` | `Value` IR, `Serializable`/`Deserializable`, auto-derivation, URIs, polymorphism, evolution, exception serialization, FormatDriver (§32) |
| `4-packages-3-shared-class-abi` | `shared_abi_version`, BLAKE3 fingerprinting, cross-package compatibility (Packages Reference §13.5b) |

## v1.20 New Feature Folders

Created by [`x-update-v1_19-to-v1_20/`](./x-update-v1_19-to-v1_20/) Phase 2b. Sources cited as §-references into [`loup-changes-v1_19-to-v1_20.md`](./loup-changes-v1_19-to-v1_20.md) and the Fortran companion.

| Folder | Layer | Scope |
|---|---|---|
| `1-bootstrap-2-complex-numbers` | 2 | `complex32` / `complex64` primitives + literal syntax + C99 `_Complex` ABI (§3.1, §3.4, §3.7, §3.9) |
| `1-bootstrap-2-multi-dimensional-arrays` | 2 | `array[T, rank, order, base]` primitive + interchange + array descriptor ABI (§3.3, §3.7, §3.9) |
| `1-bootstrap-2-floating-point-environment` | 2 | IEEE 754 environment: `RoundingMode`, flags, scoped helpers (§3.2) |
| `1-bootstrap-2-array-section-expressions` | 2 | Slice syntax `a[1:5, :, 2:8:2]`, rank-resolution, view lowering (§3.5) |
| `1-bootstrap-2-for-concurrent-parallelism` | 2 | `for concurrent` statement + race checks + `@strategy` + `@scheduler` (§3.6, §3.10) |
| `1-bootstrap-2-interchange-array-encoding` | 2 | `Encoding.Array` variants, `Order` enum, base-index metadata (§3.7) |
| `1-bootstrap-5-fortran-frontend` | 5 | Fortran 77/90/2018 lexer / AST / semantic analysis / Loup-source emitter (Fortran companion §"Translator") |
| `3-stdlib-2-core-complex` | 2 | `core.complex` API surface — `Complex32` / `Complex64`, polar/rect, conjugate, magnitude (§4.1, Stdlib §21.9) |
| `3-stdlib-2-core-array` | 2 | `core.array` API surface — constructors, shape, reshape, transpose (§4.2, Stdlib §21.10) |
| `3-stdlib-2-core-fpenv` | 2 | `core.fpenv` API surface — get/set rounding mode, scoped helpers, flag inspection (§4.3, Stdlib §21.11) |
| `3-stdlib-5-native-window` | 5 | `native.window` — bare OS window, event loop, present surface (§4.6, Packages §21.35). Superseded (M11) by the UI backend contract |
| `3-stdlib-5-native-audio` | 5 | `native.audio` — mixer / voice graph / sample playback (§4.7, Packages §21.36) |
| `4-packages-6-loup-fortran` | 6 | `loup.fortran.{fmt,kind,intrinsic,array,io}` — translator-output type/format packages (Fortran companion §"Type/Format" + §"Storage/I/O") |
| `4-packages-6-loup-numerical-algebra` | 6 | `loup.blas` / `loup.lapack` / `loup.fftw` / `loup.scalapack` (Fortran companion §"Numerical") |
| `4-packages-6-loup-hpc-parallel` | 6 | `loup.openmp` / `loup.mpi` / `loup.netcdf` / `loup.hdf5` (Fortran companion §"Parallel" + §"Data Formats") |

v1.20 also extends four existing folders (no new triplet, just appended v1.20 sections): `1-bootstrap-2-expanded-numerics` (complex types), `3-stdlib-3-multi-threading` (SharedArray complex elements), `3-stdlib-3-simd` (SIMD complex elements), `3-stdlib-5-native-webgpu` (rasterization pipeline).

## Loup Common UI Feature Folders (v1.21 UI program, 2026-11)

Created for the Loup Common UI program (`specs/loup-ui-framework-spec.md`, normative per ruling M1; the Warp
architecture reconciled as an opt-in assurance profile in `specs/loup-ui-warp-reconciliation.md`; program status in
`status/ui-program.md`). The language rows are ruled in `x-update-v1_20-to-v1_21` (FS-UI, PORT-1, MARK-1, SIG-LIB,
RT-UI, RUNLOOP-1 ruled 2026-11-03; FIXED-SEM approved 2026-11-03, ratified after Helios answers HA-9). The old UI
folders (`3-stdlib-5-reactive-core`, `-ui-fence`, `-desktop-backend`, `-web-backend`, `-ui-animation`,
`-native-window`) and the GPU folders `1-bootstrap-5-gpu-fence-descriptors`, `3-stdlib-5-native-webgpu` and
`3-stdlib-5-native-gpu` carry M11 status blocks (superseded, front end only, or deferred).

| # | Folder | Layer | Scope | Phase |
|---|---|---|---|---|
| 127 | `1-bootstrap-2-fixed-and-handlers` | 2 | `fixed` (Q32.32), FIXED-SEM, `core.fixed`; T-6 handler lowering | P6 |
| 128 | `1-bootstrap-3-mode-portable` | 3 | `@mode(portable)`, PORTABLE-SUBSET, PSTORE, own-size blocks | P1a |
| 129 | `1-bootstrap-3-ui-runtime-rows` | 3 | RT-UI, RUNLOOP-1 and SIG-LIB on the lanes | P1b, P1c |
| 130 | `1-bootstrap-5-hosted-ui-toolchain` | 5 | struct results, Windows check, main-thread rule, G5 | P12 |
| 131 | `4-packages-6-loup-ui-core` | 6 | core, fixed, signal, mem | P2–P3 |
| 132 | `4-packages-6-loup-ui-paint` | 6 | display list, rasteriser, damage, PNG | P3, P9 |
| 133 | `4-packages-6-loup-ui-text` | 6 | faces, shaping, segmentation, bidi, editing | P3, P9 |
| 134 | `4-packages-6-loup-ui-backend` | 6 | contract, headless, helios, wayland, macos, win32 | P3–P14 |
| 135 | `4-packages-6-loup-ui-controls` | 6 | controls, theme, keymap, clipboard, icons | P3–P5, P9 |
| 136 | `4-packages-6-loup-ui-desktop` | 6 | app-facing desktop API (Vol 2 §2-4.8 re-spec) | P8b, P13, P14 |

`core.sensitivity` (MARK-1) is a stdlib module and gets no folder of its own: it is tracked in `x-update-v1_20-to-v1_21`
(task `v21.p10.4`), the stdlib reference §21.28 and `docs/stdlib-status.md`. P10 (tree literals, `component`,
`machine`, `TreeData`, `Store[T]`) gets its folder with its draft entry; until then `machine` is an open point of
`4-packages-6-loup-ui-core`.

## Mainframe — Bare-Metal IBM Z (s390x) Feature Folder

| Folder | Layer | Group | Status | Scope |
|---|---|---|---|---|
| `1-bootstrap-5-mainframe-s390x` | 5 | bootstrap-compiler (native / hardware backends) | **specified / unimplemented** | Bare-metal IBM Z (s390x / z/Architecture) freestanding target: big-endian `EM_S390` arch backend, PSW-based interrupt model (interruption classes + `LPSWE` return), channel-subsystem I/O primitive (`native.css.ChannelProgram[T]`, ownership-typed `takes`-move), endianness-aware `Volatile` (`Volatile.view` / `Volatile[T, Big\|Little\|Native]`), AMODE-64 discipline, storage-key/DAT HAL boundaries, and build/target plumbing. Covers both the **KVM-on-Z guest** (virtio-ccw, minimal CSS) and **bare-metal** (full CSS, storage keys, own DAT) profiles. |

Sits in Layer 5 alongside `1-bootstrap-5-native-compilation` (#83) and `1-bootstrap-5-hardware-management` (#102) as a bootstrap-compiler native/hardware backend (registered as #124 above).

**Normative spec home.** Adds content to Language Reference **Volume 3 (Compilation)** — `loup-language-compilation-v1_20.md` — §3-3.2 (target declaration), §3-3.9 (`Volatile`), §3-3.13 (`@interrupt`), §3-3.20 (`native.mpu` / storage keys), §3-3.21 (freestanding manifest), §3-3.22, plus a **new §3-3.26 (Channel Subsystem I/O)**. This content is marked specified-pending-implementation and cross-referenced to the feature folder.

**Originating analysis.** [`loup-s390x-language-prerequisites.md`](./loup-s390x-language-prerequisites.md) (the §7 `LF-S390X-NN` prerequisite entries).

**Distinction from `loup-cobol-mainframe-packages-v1_0_1.md`.** That companion is **application-level COBOL/copybook interop** running on *hosted* modes — it is NOT a bare-metal Z target. `1-bootstrap-5-mainframe-s390x` is a z/Architecture **kernel runtime / freestanding compilation target**. The only shared mechanism is `@interchange` (Volume 4 §4-2), which already serves both.
