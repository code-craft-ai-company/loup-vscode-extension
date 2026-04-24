# Loom Packages Reference v1.11

**Status:** Release
**Version:** 1.11.0
**Date:** 2026-04-20
**Supersedes:** 1.10.0
**Scope:** Packages that require `loom install`, depend on external hardware
  backends compiled separately, or are maintained on a cadence independent of
  the core language runtime: `loom.tensor`, `loom.autodiff`, `loom.tpu`,
  `loom.ai`, `loom.db`, `loom.bench`, `loom.format`,
  `native.gpu`, `native.tpu`, `native.hal`; package registry specification;
  hardware management tooling; hardware backend lifecycle.

**Changes from v1.10:**

- **§13.5b (new).** Shared-class ABI versioning rules for packages exporting
  `shared class` declarations. Establishes the package-manifest ABI-version
  field, the cross-mode ABI compatibility matrix, and installation-time
  verification of `shared class` ABI compatibility.
- **§21.28 `loom.tensor` note.** `Tensor` values now expose `asSharedArray()`
  and `fromSharedArray()` zero-copy converters for interop with
  `SharedArray[T]` (Language Reference §17b.3) when the backend is CPU.
- **Appendix C.** New v1.18 stdlib types (`SharedArena`, `SharedRef[T]`,
  `SharedMutex[T]`, `SharedRwLock[T]`, `SharedQueue[T]`, `Atomic[T]`,
  `SharedBarrier`, `SharedSemaphore`, `SharedCondVar`, `SharedStack[T]`)
  are listed for cross-reference. These live in the stdlib, not in
  packages — the appendix notes them with their stdlib section references.

**Related documents:**
- [Loom Language Reference v1.18](loom-language-reference-v1_18.md)
- [Loom Standard Library Reference v1.18](loom-stdlib-reference-v1_18.md)

---

## Table of Contents

- [§13.5 Package Registry](#135-package-registry)
- [§13.5b Shared-Class ABI Versioning for Packages](#135b-shared-class-abi-versioning-for-packages)
- [§13.8 Core Package Set (`loom.*`)](#138-core-package-set)
- [§21.28 `loom.tensor` — High-Level Tensor Operations](#2128-loomtensor--high-level-tensor-operations)
- [§21.29 `native.webgpu` — WebGPU API Facade](#2129-nativewebgpu--webgpu-api-facade)
- [§21.30 `native.gpu` — Low-Level GPU Kernel Dispatch](#2130-nativegpu--low-level-gpu-kernel-dispatch)
- [§21.31 `loom.autodiff` — Automatic Differentiation](#2131-loomautodiff--automatic-differentiation)
- [§21.32 `native.hal` — Hardware Abstraction Layer](#2132-nativehal--hardware-abstraction-layer)
- [§21.33 `native.tpu` — Low-Level TPU Dispatch](#2133-nativetpu--low-level-tpu-dispatch)
- [§21.34 `loom.tpu` — High-Level TPU Integration](#2134-loomtpu--high-level-tpu-integration)
- [§27.9 Hardware Management Commands](#279-hardware-management-commands)
- [§30 Hardware Backend Lifecycle](#30-hardware-backend-lifecycle)
- [Appendix C: Package Type Index](#appendix-c-package-type-index)

---

### §13.5 Package Registry

The Loom ecosystem defines a registry protocol for publishing, discovering, and fetching packages.

**Reference registry.** The canonical public registry is hosted at `https://registry.loom-lang.org`. The `loom add`, `loom install`, and `loom publish` commands use this registry by default. An alternative registry may be specified in `.lmpkg`:

```toml
[registry]
url = "https://my-org-registry.example.com"
```

Self-hosted registries must implement the Loom Registry Protocol (LRP), a REST API whose schema is published at `https://registry.loom-lang.org/schema/lrp/v1`. Both hosted and self-hosted instances are first-class — the toolchain does not privilege the reference registry.

**Package lifecycle:**

- `loom publish` uploads a package tarball and its `loom.lock` to the registry. Publishing requires authentication via `loom auth login`.
- `loom add <package>[@version]` resolves the package, adds it to `.lmpkg`, and updates `loom.lock`. After resolution, it runs `loom install` for the newly added package only.
- `loom install` installs all dependencies from `loom.lock`, then precompiles each installed package's source to a cached Wasm artifact (see §27.7). Install is idempotent — packages whose cached artifacts are already up-to-date are not recompiled.
- `loom install --no-precompile` installs source only, skipping Wasm precompilation. Useful in CI environments where startup latency is not a concern.
- `loom install --offline` resolves only from the local package cache; fails if any required package is absent.
- `loom install --locked` errors if `loom.lock` would need updating; intended for CI.
- Yanking marks a version unavailable to new `loom add` resolutions but does not break existing `loom.lock` references.
- Deprecation emits a warning on `loom install` without blocking installation.

**Naming rules:**

- Package names are lowercase, hyphen-separated identifiers: `my-package`, `json-schema`.
- The `loom.` namespace prefix is reserved for first-party packages (see §13.8). User packages cannot use `loom.` as a prefix.
- The stdlib namespaces (`core`, `io`, `data`, `net`, `sync`, `web`, `ui`, `native`, `lang`, `debug`) are reserved for the standard library (see §13.6).
- Version constraints follow semantic versioning: `^` (compatible with MAJOR), `~` (compatible with MAJOR.MINOR), `>=`, `<=`, exact, or range.
- A `loom.lock` lockfile records exact resolved versions of all transitive dependencies. The lockfile is committed to version control for applications and gitignored for libraries.

**Package signing and verification.**

*(This subsection is normative.)*

Loom packages use a dual-signature scheme to provide both publisher identity and content integrity guarantees.

**Signing model.** Every package published to any Loom registry MUST carry two signatures:

1. **Publisher signature** — an Ed25519 signature over the package tarball, made with the publisher's private key. Establishes authorship and non-repudiation.
2. **Registry countersignature** — a second Ed25519 signature added by the registry over the package tarball plus the publisher signature. Establishes that the registry received and logged the exact artifact being installed.

Both signatures are stored in a `.lmpkg.sig` sidecar alongside the package tarball in the registry. The sidecar format is:

```
# <package>-<version>.lmpkg.sig — JSON, UTF-8
{
  "package":              "loom.http",
  "version":              "2.1.0",
  "tarball_sha256":       "<hex>",
  "publisher_key_id":     "<hex fingerprint of publisher Ed25519 public key>",
  "publisher_sig":        "<base64url Ed25519 signature over tarball bytes>",
  "registry_key_id":      "<hex fingerprint of registry Ed25519 public key>",
  "registry_sig":         "<base64url Ed25519 signature over tarball_sha256 || publisher_sig>",
  "signed_at":            "<ISO 8601 UTC timestamp>"
}
```

**Key management.**

- Publishers generate an Ed25519 keypair with `loom auth keygen`. The public key is uploaded to the registry during `loom auth login` and associated with the publisher account. A publisher may register multiple keys (e.g., one per machine or CI environment). Key rotation is performed with `loom auth keygen --rotate`.
- The registry maintains a transparency log of all published packages and their signatures. The log is append-only and publicly auditable.
- Key revocation is performed through the registry API (web interface or `loom auth revoke-key <key-id>`). Revoked keys invalidate all signatures made after the revocation timestamp. Packages signed before revocation remain valid unless the registry operator explicitly yanks them.

**Verification during install.**

`loom install` performs the following checks for every package:

1. Download the package tarball and its `.lmpkg.sig` sidecar.
2. Compute SHA-256 of the tarball; compare to `tarball_sha256` in the sidecar. Abort if mismatch.
3. Fetch the publisher's Ed25519 public key from the registry (or local key cache). Verify `publisher_sig` over the tarball. Abort if invalid.
4. Fetch the registry's Ed25519 public key (pinned in the toolchain distribution). Verify `registry_sig`. Abort if invalid.
5. Optionally: check the transparency log to confirm the package is listed (requires network; skipped with `--offline`).

If any check fails, installation is aborted and an error is reported. There is no `--skip-verify` flag — signature verification is unconditional.

**`loom install --trust-key <key-id>`** — Trust an additional publisher key for the duration of this install (useful for private registries that use a self-managed key not bundled with the toolchain). The key must be reachable from the configured registry.

**Pinning for self-hosted registries.** When using a private registry, operators configure the registry's public key in the project's `.lmpkg`:

```toml
[registry]
url     = "https://my-org-registry.example.com"
key_id  = "abc123..."   # hex fingerprint of the registry's Ed25519 public key
```

`loom install` pins to this key for packages resolved from the configured registry URL. The key is verified against the registry's well-known endpoint (`/.well-known/loom-registry-key`) on first use and cached locally.

**Local packages and `[dev-overrides]`.** Packages installed via `loom link` or `[dev-overrides]` are **not** signature-verified — they are local filesystem sources under the developer's direct control. The toolchain emits an advisory note when such packages are loaded.


---

### §13.5b Shared-Class ABI Versioning for Packages

*(This section is normative. Applies to any package — first-party `loom.*`
or third-party — that exports `shared class` declarations in its public API.
Language Reference §17b.7 specifies the cross-mode ABI contract itself;
this section specifies how packages declare compliance and how the installer
verifies compatibility.)*

**Disambiguation: shared-class ABI vs. serialization wire format.** The
shared-class ABI (§17b.7, this section's subject) is an **in-process memory
layout contract** — it governs how `shared class` instances are laid out
in shared-arena memory so that multiple execution contexts (JIT-compiled
Wasm, AOT-compiled native) can read and write the same objects without
marshalling. This is orthogonal to the **serialization wire format**
(Language Reference §32) which governs how values are converted to and
from a format-agnostic `Value` representation for transport across process,
host, or language boundaries.

A `shared class` MAY implement `Serializable` and `Deserializable` — when
it does, its wire form goes through the normal `Value` intermediate
representation (§32.12), NOT through the shared-class ABI layout. A
package's `shared_abi_version` field (below) pins its in-process memory
layout; a type's `@serializationId` URI (Language Reference §32.5) pins
its wire-format identity. These are independent concerns — a package may
change its serialization URI without changing its shared-class ABI
(breaking wire compatibility but preserving in-process interop) or vice
versa.

**Motivation.** The Language Reference normatively fixes the memory layout,
header format, refcount protocol, and vtable conventions of every `shared
class` (§17b.7). Because two compilers — the JIT (Wasm GC+EH) and the AOT
(native) pipelines — must produce bit-identical representations of the same
class, and because packages can be installed and consumed across major
versions of the Loom toolchain, every package that exports a `shared class`
declares which ABI revision it was built against. The installer refuses to
load a package whose ABI revision is incompatible with the current runtime
toolchain.

**Manifest declaration.** A package manifest (`.lmpkg`) that exports one or
more `shared class` declarations in its public API SHALL declare a
`shared_abi_version` field in the `[package]` section:

```toml
[package]
name = "loom.graph-store"
version = "1.2.0"
shared_abi_version = 1
```

The `shared_abi_version` value matches the ABI version from the arena header
(§17b.5): v1.18 defines ABI version 1. Future Loom major revisions may
introduce ABI version 2; packages carry over unmodified if they do not
declare `shared_abi_version`, but are required to declare it if they export
any `shared class`.

**Installation check.** At `loom install` time, for each package declaring
a `shared_abi_version`:

1. The installer reads the declared ABI version.
2. The installer consults the current toolchain's list of supported ABI
   versions (a compile-time constant in the installer binary).
3. If the declared ABI version is not in the supported list, installation
   aborts with `E_SHARED_ABI_INCOMPATIBLE` and a remediation message:
   *"Package X was built against shared-class ABI version N; this toolchain
   supports versions {M, M+1, ...}. Upgrade or downgrade the toolchain, or
   contact the package author for an ABI-compatible release."*
4. If the declared ABI version is supported but is not the toolchain's
   preferred (newest) version, installation emits an advisory note recording
   that the package is being loaded at a legacy ABI version.

**Determining the ABI version of a package.** The `loom publish` command
invokes the compiler in an ABI-fingerprinting mode that:

1. Enumerates all `shared class` declarations in the package's public API.
2. Computes each class's layout, header, and vtable fingerprint per §17b.7.
3. Cross-checks these against the toolchain's current ABI version.
4. Writes the resulting `shared_abi_version` to the published manifest.

Publishing fails (`E_SHARED_ABI_FINGERPRINT_MISMATCH`) if the fingerprinter
detects a `shared class` whose layout does not match the toolchain's ABI
version — this guards against a toolchain bug producing silently
incompatible packages.

**Package public-API surface.** A `shared class` declaration is "in the
public API" if it is declared `pub` (visible outside the module) OR if it
appears in the signature of any `pub` function, method, field, or type
alias in the package. Private `shared class` declarations used only
internally do not affect the package's `shared_abi_version`.

**Cross-package interop.** Two packages installed in the same project that
both declare `shared_abi_version = N` are ABI-compatible — their `shared
class` instances can be freely interchanged via `SharedRef[T]`. Packages
declaring different ABI versions produce `E_SHARED_ABI_CROSS_PACKAGE` if
their `shared class` types flow between each other; the project must be
rebuilt against a single ABI version.

**Stability guarantees.**

- Within a single ABI version, `shared class` layouts defined in a package
  are stable across package versions. A package at v1.2.0 declaring `class
  Vertex { x: float64; y: float64; z: float64; }` has the same layout in
  v1.2.1, v1.3.0, etc., because the field list is unchanged.
- Changing a `shared class`'s field list, field order, or field types in a
  public API is a **breaking change** requiring a major package version
  bump. The version-negotiation rules of the package registry (§13.5)
  prevent inadvertent downgrades.
- Adding a `shared class` to a public API is a minor version change.
- Removing a `shared class` from a public API is a major version change.

**Hardware-backend packages.** Hardware-backend packages (`native.gpu`,
`native.tpu`, `native.hal`, third-party `loom.backend.*`) may export
`shared class` types for cross-mode buffer and device-handle interop. These
packages are subject to the same ABI-version rules as general packages,
with one addition: the hardware-backend ABI version is augmented by the
hardware-driver version from `hardware.lock` (§21.32.6), such that a
`shared class GpuBuffer` declared in `loom.backend.cuda` has a composite
compatibility key of `(shared_abi_version, cuda_driver_version)`.

**`loom.lock` recording.** The resolved `shared_abi_version` of each
installed package is recorded in `loom.lock` for auditability:

```
[[package]]
name = "loom.graph-store"
version = "1.2.0"
shared_abi_version = 1
checksum = "sha256:..."
```

Subsequent `loom install --locked` runs verify that the lockfile's recorded
ABI version matches the installed package's declared version — detecting
manifest tampering between lockfile generation and install.

**Error codes:**

| Code | Condition |
|---|---|
| `E_SHARED_ABI_INCOMPATIBLE` | Package declares ABI version not supported by toolchain |
| `E_SHARED_ABI_FINGERPRINT_MISMATCH` | Publishing detected a `shared class` whose layout doesn't match declared ABI version |
| `E_SHARED_ABI_CROSS_PACKAGE` | Two packages with different ABI versions attempt to exchange `shared class` values |
| `E_SHARED_ABI_LOCK_MISMATCH` | `loom install --locked` detected lockfile ABI version doesn't match manifest |

---

### §13.8 Core Package Set

*(This section is normative with respect to package naming and API contracts; implementations are non-normative.)*

The **core package set** comprises first-party packages maintained by the Loom project under the reserved `loom.` namespace prefix. Core packages are available on the reference registry and are versioned independently of the toolchain. They are not built into the runtime (stdlib namespaces) but are stable, well-maintained, and officially supported.

**`loom.cli`** — Command-line argument parsing. Available on `cli` and `native` targets.

```loom
from loom.cli import (Cli, Arg, Flag);

let cli = Cli.new("mytool", version="1.0.0")
  .arg(Arg.new("input").help("Input file path"))
  .flag(Flag.new("verbose", short="v").help("Enable verbose output"))
  .flag(Flag.new("output", short="o").takesValue(true).help("Output file"));

let matches = cli.parse(args());
let inputPath = matches.get("input");
let verbose   = matches.flag("verbose");
```

**`loom.crypto`** — Cryptographic primitives. Available on all targets.

```loom
from loom.crypto import (sha256, hmacSha256, randomBytes, constantTimeEqual);

let hash    = sha256(data);                    // bytes → bytes
let mac     = hmacSha256(key, message);        // bytes, bytes → bytes
let nonce   = randomBytes(16);                 // int → bytes
let safe    = constantTimeEqual(a, b);         // bytes, bytes → bool (timing-safe)
```

Provides: `sha256`, `sha512`, `blake3` (hash functions); `hmacSha256`, `hmacSha512` (MACs); `randomBytes` (CSPRNG); `constantTimeEqual` (timing-safe comparison). Does not provide encryption or key exchange — those are out of scope for the core set.

**`loom.db`** — Database abstraction. Available on `cli`, `service`, `native` targets.

```loom
from loom.db import (Pool);

let pool = await Pool.connect("postgresql://localhost/mydb", maxSize=10);
let rows = await pool.query(
  "SELECT id, name FROM users WHERE active = $1",
  [true]
);
for (row in rows) {
  print(i"{$ row.get("name") $}");
}
```

Provides a driver-agnostic query interface (`Pool.connect`, `pool.query`, `pool.execute`, `pool.transaction`). Driver implementations (`loom.db.postgres`, `loom.db.sqlite`, `loom.db.mysql`) are separate packages that plug into `loom.db` via the driver protocol.

**Availability summary:**

| Package | Targets | Compiled Mode |
|---|---|---|
| `loom.cli` | `cli`, `native` | Yes |
| `loom.crypto` | All | Yes |
| `loom.db` | `cli`, `service`, `native` | Yes |
| `loom.ai` | All | Yes |



**`loom.tensor`** — High-level typed tensor operations with automatic backend dispatch (CPU SIMD, WebGPU, CUDA via FFI, Metal via FFI). Available on all targets; GPU dispatch requires the relevant backend capability. See §21.28.

**`loom.autodiff`** — Reverse-mode automatic differentiation over `loom.tensor` computation graphs. Available on all targets. See §21.31.

**`loom.ai`** — LLM orchestration. Available on all targets.

```loom
from loom.ai import (Client, Message, Role, Tool, ToolResult);
from loom.ai.anthropic import (AnthropicProvider);

let provider = AnthropicProvider.fromEnv();
let client   = Client.new(provider);

let response = await client.complete(
  model  = "claude-opus-4-6",
  system = "You are a helpful assistant.",
  messages = [
    Message(role=Role.User, content=```(text):(none)
      Summarize the following document in three bullet points:
      {$ document $}
    ```)
  ]
);

print(response.text);
```

Key APIs: `Client.new(provider)`, `client.complete(...)` for single-turn completions, `client.stream(...)` returning `AsyncIterable[TextDelta]` for streaming, `client.completeWithTools(...)` for tool use, `StructuredOutput[T]` for typed structured outputs backed by JSON Schema. Provider sub-packages (`loom.ai.anthropic`, `loom.ai.openai`, `loom.ai.gemini`, `loom.ai.ollama`) implement the provider protocol and are installed as separate packages.

Core packages follow the same `prefer compiled` pattern as stdlib modules — they ship precompiled Wasm artifacts alongside their source in the registry, enabling zero-JIT-overhead imports when installed via `loom install`.


---

## §21.28 `loom.tensor` — High-Level Tensor Operations

*(This section is normative. Available on all targets. GPU/TPU dispatch requires a capable backend; falls back to CPU SIMD if unavailable.)*

`loom.tensor` provides a high-level, typed tensor abstraction over multi-dimensional numeric arrays. Operations are lazy — they build a computation graph that is dispatched to the best available backend at evaluation time. Users never write GPU or TPU kernels to use `loom.tensor`. The hardware abstraction layer (`native.hal`, §21.32) provides the device discovery and dispatch foundation.

```loom
namespace loom.tensor;

// Backend enumeration — controls where evaluation is dispatched.
// For brand-agnostic code, prefer Backend.Auto and let the HAL select the best
// available device. Use explicit variants only when targeting a specific capability.
enum Backend {
  Auto;     // HAL selects best available: CUDA > Metal > Vulkan > TPU > WebGPU > SIMD > Scalar
  Cpu;      // force CPU (SIMD-optimised via native.simd)
  WebGpu;   // force WebGPU (browser or native with WebGPU support)
  Cuda;     // force NVIDIA CUDA (requires loom.backend.cuda)
  Metal;    // force Apple Metal (macOS/iOS only; requires loom.backend.metal)
  Vulkan;   // force Vulkan compute (AMD/Intel/NVIDIA; requires loom.backend.vulkan)
  Tpu;      // force TPU dispatch via PJRT (requires loom.backend.tpu.* variant)
  PjRt;     // force generic PJRT plugin backend (covers non-Cloud TPU hardware)
  Device(id: string);  // target a specific device by HAL device ID (e.g. "accelerator:1")
}

// Tensor element dtype.
// Float16 and BFloat16 are the standard dtypes for mixed-precision ML inference
// and training. BFloat16 is the native dtype for Google TPUs and NVIDIA Ampere+.
// Int8/UInt8 are provided for quantised inference. Use Float32 for general compute.
enum DType {
  Float32;    // IEEE 754 single precision — general-purpose default
  Float64;    // IEEE 754 double precision
  Float16;    // IEEE 754 half precision — inference, NVIDIA/AMD/Apple
  BFloat16;   // Brain float (1s + 8e + 7m) — training, TPU native, Ampere+
  Int8;       // Signed 8-bit integer — quantised inference
  UInt8;      // Unsigned 8-bit integer — quantised inference, image pixels
  Int32;      // Signed 32-bit integer
  Int64;      // Signed 64-bit integer
  Bool;       // Boolean
}

// Shape is a list of positive integers. -1 means "infer this dimension."
type Shape = list[int];

class Tensor : Any implements Renderable {
  pub let dtype: DType;
  pub let shape: Shape;
  pub let backend: Backend;

  // Constructors
  pub static func zeros(shape: Shape, dtype: DType = DType.Float32, backend: Backend = Backend.Auto): Tensor;
  pub static func ones(shape: Shape, dtype: DType = DType.Float32, backend: Backend = Backend.Auto): Tensor;
  pub static func from(data: list[Any], shape: Shape, dtype: DType = DType.Float32): Tensor;
  pub static func arange(start: float, stop: float, step: float = 1.0, dtype: DType = DType.Float32): Tensor;
  pub static func linspace(start: float, stop: float, n: int, dtype: DType = DType.Float32): Tensor;
  pub static func rand(shape: Shape, dtype: DType = DType.Float32, backend: Backend = Backend.Auto): Tensor;
  pub static func randn(shape: Shape, dtype: DType = DType.Float32, backend: Backend = Backend.Auto): Tensor;
  pub static func eye(n: int, dtype: DType = DType.Float32): Tensor;

  // Shape manipulation
  pub func reshape(shape: Shape): Tensor;
  pub func flatten(): Tensor;
  pub func squeeze(axis: int?): Tensor;
  pub func unsqueeze(axis: int): Tensor;
  pub func transpose(axes: list[int]? = None): Tensor;
  pub func permute(axes: list[int]): Tensor;

  // Slicing and indexing
  pub func slice(axis: int, start: int, stop: int, step: int = 1): Tensor;
  pub func gather(axis: int, indices: Tensor): Tensor;
  pub func scatter(axis: int, indices: Tensor, src: Tensor): Tensor;

  // Element-wise operations (all return new lazy Tensor)
  pub func add(other: Tensor): Tensor;
  pub func sub(other: Tensor): Tensor;
  pub func mul(other: Tensor): Tensor;
  pub func div(other: Tensor): Tensor;
  pub func pow(exponent: float): Tensor;
  pub func neg(): Tensor;
  pub func abs(): Tensor;
  pub func sqrt(): Tensor;
  pub func exp(): Tensor;
  pub func log(): Tensor;
  pub func clamp(min: float, max: float): Tensor;

  // Activation functions
  pub func relu(): Tensor;
  pub func sigmoid(): Tensor;
  pub func tanh(): Tensor;
  pub func gelu(): Tensor;
  pub func softmax(axis: int = -1): Tensor;
  pub func logSoftmax(axis: int = -1): Tensor;

  // Reduction operations
  pub func sum(axis: int? = None, keepDims: bool = false): Tensor;
  pub func mean(axis: int? = None, keepDims: bool = false): Tensor;
  pub func max(axis: int? = None, keepDims: bool = false): Tensor;
  pub func min(axis: int? = None, keepDims: bool = false): Tensor;
  pub func argmax(axis: int): Tensor;
  pub func argmin(axis: int): Tensor;

  // Linear algebra
  pub func matmul(other: Tensor): Tensor;
  pub func dot(other: Tensor): Tensor;

  // Type conversion
  pub func to(dtype: DType): Tensor;
  pub func toBackend(backend: Backend): Tensor;

  // Evaluation — executes the computation graph on the target backend
  pub func eval(): Tensor;
  pub async func evalAsync(): Task[Tensor];

  // Data extraction (triggers eval if not already evaluated)
  pub func toList(): list[Any];
  pub func toBytes(): bytes;        // raw little-endian buffer
  pub func item(): float;           // single-element tensor to scalar

  // Utility
  pub func shape(): Shape;
  pub func size(): int;             // total number of elements
  pub func rank(): int;             // number of dimensions
  pub func isEvaluated(): bool;

  // Multi-device placement
  pub func device(): native.hal.AcceleratorDevice;
  pub func toDevice(device: native.hal.AcceleratorDevice): Tensor;
  pub async func toDeviceAsync(device: native.hal.AcceleratorDevice): Task[Tensor];

  // Zero-copy bridge — returns the raw AcceleratorBuffer backing evaluated data.
  // Triggers eval() if not already evaluated. The buffer is invalidated if the
  // tensor is re-evaluated; do not hold references across eval() calls.
  pub func rawBuffer(): native.hal.AcceleratorBuffer[bytes];

  // Pinned memory — marks host-side storage as page-locked for fast DMA.
  pub func pin(): Tensor;
  pub func isPinned(): bool;

  // Type-safe constructor — replaces the Any-typed from() overload.
  // list[T] must be a flat list of numeric values matching dtype.
  pub static func fromTyped[T](data: list[T], shape: Shape, dtype: DType): Tensor;
}

// Free functions operating on tensors
func matmul(a: Tensor, b: Tensor): Tensor;
func concat(tensors: list[Tensor], axis: int = 0): Tensor;
func stack(tensors: list[Tensor], axis: int = 0): Tensor;
func split(t: Tensor, sections: int | list[int], axis: int = 0): list[Tensor];
func where(condition: Tensor, x: Tensor, y: Tensor): Tensor;
func broadcast(a: Tensor, b: Tensor): (Tensor, Tensor);   // broadcast to common shape
```

**Backend dispatch.** When `eval()` is called, the runtime queries the `DeviceRegistry` (§21.32.4) and selects the backend in priority order: CUDA → Metal → Vulkan → TPU → WebGPU → CPU SIMD → scalar CPU. The programmer can override by constructing tensors with an explicit `backend` or `Backend.Device(id)` argument, or by calling `toBackend(...)` before evaluation.

**Multi-device tensors.** A `Tensor` carries a `device` field that identifies which accelerator holds its evaluated data. Tensors on different devices cannot be directly operated on — the programmer must move tensors to the same device first using `toDevice(device)`. Cross-device moves trigger an asynchronous memory transfer; `toDeviceAsync(device)` makes this explicit.

**Zero-copy bridge to `native.gpu` / `native.tpu`.** `Tensor.rawBuffer()` returns the `AcceleratorBuffer[bytes]` backing the tensor's evaluated data without copying. This allows custom GPU or TPU kernels (§21.30, §21.33) to consume `loom.tensor` outputs directly. Calling `rawBuffer()` on an un-evaluated tensor triggers `eval()` first.

**Pinned memory.** `Tensor.pin()` marks the tensor's host-side backing store as pinned (page-locked) memory, enabling faster DMA transfers to GPU/TPU. Pinned allocation is limited — use only for tensors that are frequently transferred. Pinned memory is a no-op on targets without GPU/TPU backends.

**Mixed-precision helpers:**

```loom
// Cast to BFloat16 for TPU training, Float16 for GPU inference
let bf16Weights = weights.to(DType.BFloat16);
let fp16Activations = activations.to(DType.Float16);

// Device placement
let device = DeviceRegistry.default().preferredDevice(Backend.Tpu);
let tpuTensor = myTensor.toDevice(device);

// Inspect which device a tensor lives on
print(tpuTensor.device().descriptor().model);  // e.g. "Google TPU v4"
```

**Error types.**

```loom
class TensorShapeError : Exception { pub let expected: Shape; pub let actual: Shape; }
class TensorDTypeError : Exception { pub let expected: DType; pub let actual: DType; }
class TensorBackendError : Exception { pub let backend: Backend; pub let reason: string; }
```

---



## §21.29 `native.webgpu` — WebGPU API Facade

*(This section is normative. Available on all targets.)*

`native.webgpu` provides typed Loom facades over the WebGPU API, enabling GPU-accelerated compute and rendering from both browser (Wasm) and native contexts. It is the lower-level WebGPU API layer beneath `native.gpu` and `loom.tensor`.

## Architecture

### WebGPU API Facade

The module wraps the W3C WebGPU API with typed Loom classes and structs. On browser targets, these map directly to JavaScript WebGPU objects via `extern js`. On native targets, they wrap a native WebGPU implementation (e.g., wgpu-native, Dawn).

### Core Types

```loom
namespace native.webgpu;

class GpuAdapter : Any {
  pub let name: string;
  pub let features: list[string];
  pub let isFallbackAdapter: bool;
  pub async func requestDevice(desc: GpuDeviceDescriptor? = None): Task[GpuDevice];
}

class GpuDevice : Any implements native.hal.AcceleratorDevice, Closeable {

  // AcceleratorDevice implementation
  pub func descriptor(): native.hal.AcceleratorDescriptor;
  pub func features(): native.hal.AcceleratorFeatures;
  pub func memoryInfo(): native.hal.AcceleratorMemoryInfo;
  pub func submitGraph(graph: native.hal.ComputeGraph): Task[void];
  pub func isAvailable(): bool;
  pub func waitIdle(): Task[void];
  pub let adapter: GpuAdapter;
  pub let limits: dict[string, int];
  pub let queue: GpuQueue;

  pub func createBuffer(desc: GpuBufferDescriptor): GpuBuffer;
  pub async func createBufferWithData[T](data: list[T], usage: GpuBufferUsage): Task[GpuBuffer];
  pub func createShaderModule(code: string): GpuShaderModule;
  pub func createComputePipeline(desc: GpuComputePipelineDescriptor): GpuComputePipeline;
  pub func createBindGroupLayout(entries: list[GpuBindGroupLayoutEntry]): GpuBindGroupLayout;
  pub func createBindGroup(layout: GpuBindGroupLayout, entries: list[GpuBindGroupEntry]): GpuBindGroup;
  pub func createCommandEncoder(): GpuCommandEncoder;
  pub func createTexture(desc: GpuTextureDescriptor): GpuTexture;
  pub func createSampler(desc: GpuSamplerDescriptor = GpuSamplerDescriptor()): GpuSampler;
  pub func close(): void;
  pub async func waitForIdle(): Task[void];
  pub static async func request(options: GpuRequestAdapterOptions? = None): Task[GpuDevice];
}

enum GpuBufferUsage {
  Storage = 0x80; Uniform = 0x40; CopySrc = 0x04; CopyDst = 0x08;
  MapRead = 0x01; MapWrite = 0x02;
}

class GpuBuffer : Any implements Closeable {
  pub let size: int;
  pub let usage: int;
  pub async func mapRead(): Task[bytes];
  pub async func mapWrite(data: bytes): Task[void];
  pub func close(): void;
}

class GpuQueue : Any {
  pub func submit(commandBuffers: list[GpuCommandBuffer]): void;
  pub async func onSubmittedWorkDone(): Task[void];
  pub func writeBuffer(buf: GpuBuffer, offset: int, data: bytes): void;
}

class GpuCommandEncoder : Any {
  pub func beginComputePass(label: string = ""): GpuComputePassEncoder;
  pub func finish(): GpuCommandBuffer;
  pub func copyBufferToBuffer(src: GpuBuffer, srcOffset: int,
                              dst: GpuBuffer, dstOffset: int, size: int): void;
}

class GpuComputePassEncoder : Any {
  pub func setPipeline(pipeline: GpuComputePipeline): void;
  pub func setBindGroup(index: int, bindGroup: GpuBindGroup): void;
  pub func dispatchWorkgroups(x: int, y: int = 1, z: int = 1): void;
  pub func end(): void;
}
```

### Browser vs Native WebGPU Paths

- **Browser:** Classes wrap JavaScript WebGPU objects via `extern js` bindings. `GpuDevice.request()` calls `navigator.gpu.requestAdapter()`.
- **Native:** Classes wrap a native WebGPU implementation (wgpu-native or Dawn). The native library is linked at compile time via `loom build --feature webgpu`.

### Buffer Management

- `GpuBufferDescriptor` specifies size, usage flags, and optional mapped-at-creation.
- `GpuBufferUsage` is a type-safe bitmask enum (was incorrectly typed as `int` in v1.6).
- Buffer mapping is async: `mapRead()` and `mapWrite()` return `Task`.

### Pipeline Creation

1. Create shader module from WGSL source: `device.createShaderModule(code)`
2. Define bind group layout: `device.createBindGroupLayout(entries)`
3. Create compute pipeline: `device.createComputePipeline(desc)`
4. Create bind group with buffer bindings: `device.createBindGroup(layout, entries)`
5. Encode and dispatch: `encoder.beginComputePass()` → `setPipeline` → `setBindGroup` → `dispatchWorkgroups` → `end` → `encoder.finish()` → `queue.submit()`

### Texture Types

Texture support enables vision ML preprocessing, generative image pipelines, and rendering workloads:
- `GpuTextureFormat`: 8 standard formats (RGBA, depth, BGRA variants)
- `GpuTextureDimension`: 1D, 2D, 3D
- `GpuTexture`: created via `device.createTexture()`, provides `createView()` and `close()`
- `GpuSampler`: filtering and addressing modes for texture sampling

### Error Types

```loom
class GpuUnavailableError : Exception { pub let reason: string; }
class GpuOutOfMemoryError  : Exception { pub let requested: int; }
class GpuValidationError   : Exception { pub let source: string; }
class GpuTimestampError    : Exception { pub let reason: string; }
```

## Design Decisions

- Typed `GpuBufferUsage` enum replaces raw `int` bitmask for type safety
- Async buffer mapping matches the WebGPU spec's async model
- `GpuDevice.request()` provides a single entry point for both browser and native
- Texture types included for ML preprocessing and rendering workloads
- Memory introspection is advisory on some platforms (e.g., macOS Metal)
- Multiple command queues supported for compute/transfer overlap


---

---

## §21.30 `native.gpu` — Low-Level GPU Kernel Dispatch

*(This section is normative. Available on `@compiled --target native` only. Using on other targets is a compile-time error.)*

`native.gpu` provides the runtime types for GPU compute fences (§16.8). It is the low-level layer beneath `loom.tensor` and is intended for programmers who need direct GPU kernel control. Most users should prefer `loom.tensor`.

```loom
namespace native.gpu;

// The compiled product of a gpu compute fence (§16.8).
// Constructed via GpuKernel.compile(fence_value, constants).
class GpuKernel : Any {
  pub let label: string;
  pub let source: string;         // the shader source after constant substitution
  pub let shaderLanguage: string; // "wgsl" | "metal" | "glsl"

  // Compile a shader fence into a kernel. Throws GpuCompileError on failure.
  pub static func compile(
    source: string,             // typically produced by a wgsl/metal/glsl fence
    constants: dict[string, Any] = {},
    label: string = "",
  ): GpuKernel;
}

// A typed GPU buffer — thin wrapper over native.webgpu.GpuBuffer or CUDA device memory
class GpuBuffer[T] : Any implements Closeable {
  pub let size: int;             // element count
  pub let byteSize: int;         // size * sizeof(T)

  pub static func alloc(size: int, backend: string = "auto"): GpuBuffer[T];
  pub static func fromBytes(data: bytes, backend: string = "auto"): GpuBuffer[T];

  pub async func copyToHost(): Task[list[T]];
  pub async func copyFromHost(data: list[T]): Task[void];
  pub func close(): void;
}

// Dispatch a compiled kernel over a grid of workgroups.
// buffers are bound in declaration order (binding = 0, 1, 2, ...).
async func dispatch(
  kernel: GpuKernel,
  grid: list[int],               // [x] or [x, y] or [x, y, z] workgroup counts
  buffers: list[GpuBuffer[Any]],
  label: string = "",
): Task[void];

// Error types
class GpuCompileError : Exception { pub let shaderSource: string; pub let log: string; }
class GpuDispatchError : Exception { pub let kernel: string; }
```

**Relationship to §21.29 and §21.32.** `native.gpu` uses `native.webgpu.GpuDevice` internally when the target backend is WebGPU (default). On CUDA targets it routes through the `loom.backend.cuda` binding (§30.2). On Metal targets it routes through `loom.backend.metal`. On Vulkan targets it routes through `loom.backend.vulkan`. The programmer selects the backend at compile time via `loom build --gpu-backend wgpu|cuda|metal|vulkan` (default: `wgpu`) **or** at runtime via `DeviceRegistry` (§21.32.4) for adaptive backend selection.

`GpuBuffer[T]` in `native.gpu` implements `AcceleratorBuffer[T]` (§21.32.2), making it interchangeable with `TpuBuffer[T]` at the HAL interface level. `native.webgpu.GpuBuffer` (unparameterized) is a lower-level WebGPU API object; obtain a `native.gpu.GpuBuffer[T]` view over it via `GpuBuffer.fromWebGpu(rawBuf, elementCount)`.

---

### §21.30.1 CUDA Backend Specification

*(This sub-section is normative for `loom build --gpu-backend cuda` on `--target native` only.)*

The CUDA backend is provided by the `loom.backend.cuda` package (§30.2). It exposes the following surface, which the `native.gpu` API delegates to when CUDA is the selected backend:

```loom
namespace native.gpu.cuda;

// CUDA stream — enables concurrent kernel execution and async memory copies.
// Equivalent to cudaStream_t. Multiple streams can run concurrently on one device.
class CudaStream : Any implements Closeable {
  pub static func new(device: int = 0, nonBlocking: bool = false): CudaStream;
  pub func synchronize(): void;      // blocks host until all stream ops complete
  pub async func synchronizeAsync(): Task[void];
  pub func close(): void;
}

// CUDA device management
class CudaDevice : Any {
  pub static func count(): int;              // number of CUDA-capable GPUs
  pub static func get(index: int): CudaDevice;
  pub static func current(): CudaDevice;
  pub static func setCurrent(index: int): void;

  pub let index: int;
  pub let name: string;                      // e.g. "NVIDIA GeForce RTX 4090"
  pub let vramBytes: int;                    // total VRAM
  pub let computeCapability: (int, int);     // major, minor (e.g. (8, 9) for Ada)
  pub let multiprocessorCount: int;
  pub let clockRateKhz: int;
  pub let warpSize: int;                     // always 32 on current hardware

  pub func memoryInfo(): (int, int);         // (freeBytes, totalBytes)
  pub func synchronize(): void;
}

// Pinned (page-locked) host memory — required for async device↔host transfers.
// Automatically freed when the PinnedBuffer is closed or garbage-collected.
class CudaHostBuffer[T] : Any implements Closeable, AcceleratorBuffer[T] {
  pub static func alloc(count: int): CudaHostBuffer[T];
  pub static func fromList(data: list[T]): CudaHostBuffer[T];
  pub func toList(): list[T];
  pub func close(): void;
}

// CUDA kernel launch parameters
struct CudaLaunchConfig {
  gridDim: (int, int, int) = (1, 1, 1);     // grid dimensions in blocks
  blockDim: (int, int, int) = (256, 1, 1);  // block dimensions in threads
  sharedMemBytes: int = 0;                   // dynamic shared memory per block
  stream: CudaStream? = None;               // None = default stream
}

// Dispatch a compiled kernel with explicit CUDA launch parameters.
// Used when the standard workgroup-based dispatch is insufficient.
async func dispatchCuda(
  kernel: GpuKernel,
  config: CudaLaunchConfig,
  buffers: list[GpuBuffer[Any]],
  label: string = "",
): Task[void];

// Peer-to-peer access between CUDA devices (NVLink / PCIe P2P)
func enablePeerAccess(srcDevice: int, dstDevice: int): void;
func disablePeerAccess(srcDevice: int, dstDevice: int): void;
func canAccessPeer(srcDevice: int, dstDevice: int): bool;

// Async device-to-device copy (within same or across P2P-enabled devices)
async func copyDeviceToDevice[T](
  src: GpuBuffer[T],
  dst: GpuBuffer[T],
  stream: CudaStream? = None,
): Task[void];
```

**CUDA kernel compilation.** `wgsl` fences are not valid with the CUDA backend — use `glsl` (GLSL-to-SPIR-V-to-PTX via LLVM NVPTX) or supply raw PTX via `extern native`. A future `ptx` fence descriptor is planned (§29).

---

### §21.30.2 Typed Kernel Binding

*(This sub-section replaces the untyped `list[GpuBuffer[Any]]` dispatch interface.)*

v1.6 dispatched kernels with `list[GpuBuffer[Any]]`, losing type safety at the call site. v1.7 introduces `GpuKernelBinding` to declare the expected buffer types up front:

```loom
namespace native.gpu;

// Declare the typed buffer layout for a kernel.
// Each entry names a binding slot and its element type.
// The compiler checks that buffers passed to dispatch() match the declared types.
class GpuKernelBinding : Any {
  pub static func new(): GpuKernelBinding;

  // Declare a read-write storage buffer at binding slot `index`.
  pub func rwBuffer[T](index: int, label: string = ""): GpuKernelBinding;
  // Declare a read-only storage buffer at binding slot `index`.
  pub func roBuffer[T](index: int, label: string = ""): GpuKernelBinding;
  // Declare a uniform buffer at binding slot `index`.
  pub func uniformBuffer[T](index: int, label: string = ""): GpuKernelBinding;
}

// Type-safe dispatch. buffers are matched to binding slots in declaration order.
// A compile-time error is emitted if the buffer element types do not match the binding.
async func dispatchTyped(
  kernel: GpuKernel,
  binding: GpuKernelBinding,
  grid: list[int],
  buffers: list[AcceleratorBuffer[Any]],   // AcceleratorBuffer[T] matches binding[T]
  label: string = "",
): Task[void];

// Legacy untyped dispatch retained for compatibility.
// Use dispatchTyped for new code — the type safety prevents silent buffer mismatches.
async func dispatch(
  kernel: GpuKernel,
  grid: list[int],
  buffers: list[GpuBuffer[Any]],
  label: string = "",
): Task[void];
```

**Example — typed dispatch:**

```loom
@compiled
from native.gpu import (GpuKernel, GpuBuffer, GpuKernelBinding, dispatchTyped);

let WGSIZE: int = 256;

let addKernel = GpuKernel.compile(```(wgsl):(none)
  @group(0) @binding(0) var<storage, read_write> out: array<f32>;
  @group(0) @binding(1) var<storage, read>       a  : array<f32>;
  @group(0) @binding(2) var<storage, read>       b  : array<f32>;
  @compute @workgroup_size({$ WGSIZE $})
  fn main(@builtin(global_invocation_id) gid: vec3u) {
    let i = gid.x;
    if (i < arrayLength(&out)) { out[i] = a[i] + b[i]; }
  }
```, constants={ WGSIZE: WGSIZE });

let binding = GpuKernelBinding.new()
  .rwBuffer[float32](0, "out")
  .roBuffer[float32](1, "a")
  .roBuffer[float32](2, "b");

let outBuf = GpuBuffer[float32].alloc(n);
let aBuf   = GpuBuffer[float32].fromBytes(aData);
let bBuf   = GpuBuffer[float32].fromBytes(bData);

await dispatchTyped(addKernel, binding, [n / WGSIZE], [outBuf, aBuf, bBuf]);
```

---

### §21.30.3 GPU Profiling API

```loom
namespace native.gpu;

struct GpuTimingResult {
  label: string;
  durationNs: int;    // kernel execution time in nanoseconds
  startNs: int;       // absolute GPU timestamp at start (if available)
  endNs: int;         // absolute GPU timestamp at end (if available)
}

class GpuProfiler : Any implements Closeable {
  // Create a profiler attached to a device. Profiling adds overhead; disable
  // in production builds via --no-gpu-profile or by not creating a GpuProfiler.
  pub static func new(device: native.webgpu.GpuDevice? = None): GpuProfiler;

  // Wrap an async dispatch with timing. Returns a Task that resolves after
  // the kernel completes and timing data is read back from the device.
  pub func profile[T](label: string, body: fn(): Task[T]): Task[(T, GpuTimingResult)];

  // Return all collected timing results since last reset.
  pub func results(): list[GpuTimingResult];
  pub func reset(): void;
  pub func close(): void;
}
```

**Example — profiling a kernel:**

```loom
@compiled
from native.gpu import (GpuProfiler);

let profiler = GpuProfiler.new();
let (_, timing) = await profiler.profile("vectorAdd", async func() {
  await dispatchTyped(addKernel, binding, [n / 256], [outBuf, aBuf, bBuf]);
});
print("Kernel took {$ timing.durationNs / 1_000_000 $} ms");
```

---

### §21.30.4 `GpuBuffer` ↔ `loom.tensor.Tensor` Bridge

```loom
namespace native.gpu;

// Transfer ownership of a Tensor's underlying GPU allocation into a typed GpuBuffer[T].
// The Tensor must already be evaluated (eval() called) and must reside on a GPU device.
// Ownership of the device allocation is transferred to the returned GpuBuffer — the
// caller must not access `t` after this call. Subsequent Tensor operations that
// reference the same data must be constructed from the GpuBuffer via bufferToTensor.
// Throws TensorError if the Tensor is unevaluated or does not reside on a GPU device.
//
// For a non-destructive scoped view (recommended), use withTensorBuffer or
// withTensorBufferAsync below.
func tensorToBuffer[T](t: loom.tensor.Tensor): GpuBuffer[T];

// Execute `body` with a typed GpuBuffer[T] view over `t`'s GPU allocation.
// `t` retains ownership of the device allocation for the duration of `body`.
// The GpuBuffer is invalidated when `body` returns and must not be stored beyond it.
// Preferred over tensorToBuffer when the Tensor is still needed after the view.
func withTensorBuffer[T, R](
  t: loom.tensor.Tensor,
  body: fn(GpuBuffer[T]): R,
): R;
async func withTensorBufferAsync[T, R](
  t: loom.tensor.Tensor,
  body: fn(GpuBuffer[T]): Task[R],
): Task[R];

// Wrap a GpuBuffer[T] as a read-only loom.tensor.Tensor.
// shape must match the buffer element count.
func bufferToTensor[T](
  buf: GpuBuffer[T],
  shape: loom.tensor.Shape,
  dtype: loom.tensor.DType,
): loom.tensor.Tensor;
```

**Bridge to `native.webgpu.GpuBuffer`:**

```loom
// Wrap a raw native.webgpu.GpuBuffer as a typed native.gpu.GpuBuffer[T].
pub static func fromWebGpu[T](raw: native.webgpu.GpuBuffer, elementCount: int): GpuBuffer[T];

// Unwrap to native.webgpu.GpuBuffer for use with the WebGPU command encoder.
pub func toWebGpu(): native.webgpu.GpuBuffer;
```

---


---

## §21.31 `loom.autodiff` — Automatic Differentiation

*(This section is normative. Available on all targets. GPU dispatch for gradient computation uses `loom.tensor` backend dispatch.)*

`loom.autodiff` provides reverse-mode automatic differentiation (backpropagation) over `loom.tensor` computation graphs. It is designed for machine learning model training. Users who only need inference should use `loom.tensor` directly without `loom.autodiff`.

```loom
namespace loom.autodiff;

// A parameter tensor that participates in gradient computation.
// Wraps a Tensor and records operations in the computation graph.
class Variable : Any {
  pub let data: loom.tensor.Tensor;
  pub var grad: loom.tensor.Tensor?;    // populated after backward() is called
  pub let requiresGrad: bool;

  pub static func new(
    data: loom.tensor.Tensor,
    requiresGrad: bool = true,
    label: string = "",
  ): Variable;

  // Variable supports all Tensor operations — each creates a new Variable
  // with the operation recorded in the graph.
  pub func add(other: Variable): Variable;
  pub func sub(other: Variable): Variable;
  pub func mul(other: Variable): Variable;
  pub func div(other: Variable): Variable;
  pub func matmul(other: Variable): Variable;
  pub func relu(): Variable;
  pub func sigmoid(): Variable;
  pub func softmax(axis: int = -1): Variable;
  pub func sum(axis: int? = None, keepDims: bool = false): Variable;
  pub func mean(axis: int? = None, keepDims: bool = false): Variable;
  pub func reshape(shape: loom.tensor.Shape): Variable;

  // Backward pass — computes gradients for all Variables with requiresGrad=true
  // that contributed to this Variable. Must be called on a scalar Variable
  // (a Variable whose underlying Tensor has exactly one element).
  // Throws AutodiffError if called on a non-scalar Variable or if the computation
  // graph is empty (no operations recorded since the last zeroGrad() call).
  pub func backward(): void;
  pub async func backwardAsync(): Task[void];

  // Zero out gradients accumulated in this Variable and all its dependencies.
  pub func zeroGrad(): void;

  // Detach from the computation graph — produces a plain Tensor copy
  pub func detach(): loom.tensor.Tensor;
}

// Higher-order gradient function — computes the gradient of a scalar-valued function
// with respect to a list of Variable inputs.
//
// Returns a function that, when called with inputs, returns the gradient list.
//
// Example:
//   let gradFn = grad(func(x: Variable): Variable => x.mul(x).sum());
//   let [dLdx] = gradFn([Variable.new(myTensor)]);
//
func grad(
  fn: fn(list[Variable]): Variable,
  argnums: list[int]? = None,     // which arguments to differentiate; None = all
): fn(list[Variable]): list[loom.tensor.Tensor];

// Optimisers — update Variable parameters in-place using accumulated gradients
class Optimizer : Any {
  pub func step(params: list[Variable]): void;
  pub func zeroGrad(params: list[Variable]): void;
}

class SgdOptimizer : Optimizer {
  pub static func new(lr: float = 0.01, momentum: float = 0.0, weightDecay: float = 0.0): SgdOptimizer;
}

class AdamOptimizer : Optimizer {
  pub static func new(lr: float = 0.001, beta1: float = 0.9, beta2: float = 0.999,
                      eps: float = 1e-8, weightDecay: float = 0.0): AdamOptimizer;
}

// Loss functions (return scalar Variable)
func mseLoss(pred: Variable, target: Variable): Variable;
func crossEntropyLoss(logits: Variable, labels: loom.tensor.Tensor): Variable;
func binaryCrossEntropyLoss(pred: Variable, target: Variable): Variable;

// Differentiability contract. An operation is differentiable if it is expressed
// entirely in terms of Variable methods. Custom operations must provide a
// forward function and a backward function (the vector-Jacobian product).
class CustomOp : Any {
  // Override to implement the forward pass.
  pub func forward(inputs: list[loom.tensor.Tensor]): loom.tensor.Tensor;

  // Override to implement the backward pass (VJP).
  // grad_output is the upstream gradient; return one gradient per input.
  pub func backward(grad_output: loom.tensor.Tensor): list[loom.tensor.Tensor];

  // Apply this operation to Variable inputs, registering it in the graph.
  pub func apply(inputs: list[Variable]): Variable;
}

// AutodiffError — thrown by backward() on non-scalar Variable or empty graph
class AutodiffError : Exception {
  pub let variableShape: list[int]?;  // shape of the non-scalar variable, if applicable
}

// ── Additional optimisers ────────────────────────────────────────────────────

class RMSpropOptimizer : Optimizer {
  pub static func new(lr: float = 0.01, alpha: float = 0.99, eps: float = 1e-8,
                      weightDecay: float = 0.0, momentum: float = 0.0): RMSpropOptimizer;
}

class AdamWOptimizer : Optimizer {
  // AdamW decouples weight decay from the gradient update (Loshchilov & Hutter 2019).
  pub static func new(lr: float = 0.001, beta1: float = 0.9, beta2: float = 0.999,
                      eps: float = 1e-8, weightDecay: float = 0.01): AdamWOptimizer;
}

// ── Additional loss functions ────────────────────────────────────────────────

func l1Loss(pred: Variable, target: Variable): Variable;
func huberLoss(pred: Variable, target: Variable, delta: float = 1.0): Variable;
func klDivLoss(input: Variable, target: Variable): Variable;         // KL divergence
func cosineEmbeddingLoss(x1: Variable, x2: Variable, y: Variable): Variable;

// ── No-gradient context ──────────────────────────────────────────────────────

// Execute `body` without recording operations in the autograd graph.
// Equivalent to PyTorch's torch.no_grad() context manager.
// Variables created or operated on inside body do not participate in backward().
// Use for inference passes, validation loops, and metric computation.
func withNoGrad[T](body: fn(): T): T;
func withNoGradAsync[T](body: fn(): Task[T]): Task[T];

// ── Gradient checkpointing ───────────────────────────────────────────────────

// Re-computes intermediate activations during backward pass instead of storing them.
// Trades compute for memory — essential for training large models that exceed VRAM.
// Equivalent to PyTorch's torch.utils.checkpoint.checkpoint.
//
// fn: the forward function to checkpoint; inputs: its Variable inputs.
// During forward, fn is run normally. During backward, fn is re-run to obtain
// the activations needed for gradient computation.
//
// Constraint: fn must be deterministic (same output for same inputs).
// Non-deterministic operations (e.g. dropout with random state) require
// manual RNG state saving — see checkpointWithRng.
func checkpoint(fn: fn(list[Variable]): Variable, inputs: list[Variable]): Variable;
async func checkpointAsync(fn: fn(list[Variable]): Task[Variable], inputs: list[Variable]): Task[Variable];

// Checkpoint with explicit RNG state capture for non-deterministic operations.
func checkpointWithRng(
  fn: fn(list[Variable]): Variable,
  inputs: list[Variable],
  rngState: loom.tensor.Tensor,    // opaque RNG state tensor; obtain via captureRngState()
): Variable;

func captureRngState(backend: loom.tensor.Backend = loom.tensor.Backend.Auto): loom.tensor.Tensor;
func restoreRngState(state: loom.tensor.Tensor): void;

// ── Automatic Mixed Precision (AMP) ─────────────────────────────────────────

// GradScaler manages loss scaling for Float16/BFloat16 training.
// Loss scaling prevents gradient underflow when using reduced-precision dtypes.
// BFloat16 typically does not require scaling (wider exponent range); use it
// with GradScaler.noOp() or skip scaling entirely for BFloat16 workloads.
class GradScaler : Any {
  pub static func new(
    initScale: float = 65536.0,   // initial loss scale factor
    growthFactor: float = 2.0,    // scale multiplier after growthInterval clean steps
    backoffFactor: float = 0.5,   // scale multiplier after an inf/NaN gradient step
    growthInterval: int = 2000,   // steps between scale increases
    enabled: bool = true,         // false = identity (no-op scaling for BFloat16)
  ): GradScaler;

  // Returns a no-op scaler suitable for BFloat16 training on TPUs.
  pub static func noOp(): GradScaler;

  // Scale the loss before backward(). Returns loss * current scale.
  pub func scale(loss: Variable): Variable;

  // Unscale gradients and check for inf/NaN. Must call before optimizer.step().
  // Returns true if gradients are finite; false if inf/NaN was detected.
  pub func unscaleAndCheck(params: list[Variable]): bool;

  // Step the optimizer if gradients are finite; skip otherwise.
  // Automatically calls unscaleAndCheck.
  pub func step(optimizer: Optimizer, params: list[Variable]): void;

  // Update the scale factor based on the results of the last step.
  pub func update(): void;

  pub let currentScale: float;
  pub let isEnabled: bool;
}

// ── Mixed-precision training example ────────────────────────────────────────
//
// from loom.tensor  import (Tensor, DType, Backend);
// from loom.autodiff import (Variable, AdamWOptimizer, crossEntropyLoss, GradScaler,
//                            withNoGradAsync, checkpoint);
//
// let scaler = GradScaler.new();
// let opt    = AdamWOptimizer.new(lr=3e-4);
//
// async func trainStep(xBatch: Tensor, yBatch: Tensor): Task[float] {
//   opt.zeroGrad([w1, w2]);
//   // Cast inputs to Float16 for faster GPU matmul; model weights stay Float32
//   let x = Variable.new(xBatch.to(DType.Float16), requiresGrad=false);
//   let logits = checkpoint(forward, [x]);     // checkpoint saves activation memory
//   let loss   = crossEntropyLoss(logits, yBatch);
//   let scaled = scaler.scale(loss);
//   await scaled.backwardAsync();
//   scaler.step(opt, [w1, w2]);
//   scaler.update();
//   return loss.detach().item();
// }
//
// async func evalStep(xBatch: Tensor): Task[Tensor] {
//   return await withNoGradAsync(async func() {
//     let x = Variable.new(xBatch.to(DType.Float16), requiresGrad=false);
//     return forward(x).data;
//   });
// }
```

**Example — two-layer MLP forward and backward pass:**

```loom
from loom.tensor  import (Tensor, DType);
from loom.autodiff import (Variable, AdamOptimizer, crossEntropyLoss);

let w1 = Variable.new(Tensor.randn([784, 128]));
let w2 = Variable.new(Tensor.randn([128, 10]));
let opt = AdamOptimizer.new(lr=0.001);

func forward(x: Variable): Variable {
  return x.matmul(w1).relu().matmul(w2);
}

async func trainStep(xBatch: Tensor, yBatch: Tensor): Task[float] {
  opt.zeroGrad([w1, w2]);
  let x = Variable.new(xBatch, requiresGrad=false);
  let logits = forward(x);
  let loss = crossEntropyLoss(logits, yBatch);
  await loss.backwardAsync();
  opt.step([w1, w2]);
  return loss.detach().item();
}
```


---


---

## §21.32 `native.hal` — Hardware Abstraction Layer

*(This section is normative. Available on all targets that support `@compiled --target native`. On Wasm/browser targets, the HAL exposes only `Backend.WebGpu` and `Backend.Cpu` devices.)*

`native.hal` is the hardware abstraction layer for accelerator-agnostic compute. It provides a unified interface over GPUs (all vendors and APIs), TPUs, and other accelerators. Code written against `native.hal` is brand-agnostic: the same Loom program runs on NVIDIA, AMD, Apple, Intel, and Google TPU hardware without modification. Backend-specific capabilities are accessible via feature flags (§21.32.3) without breaking the abstraction.

```loom
namespace native.hal;

// An opaque representation of a tensor computation graph submitted to an accelerator.
// `ComputeGraph` values are produced internally by `loom.tensor` when operations are
// enqueued on a device-backed Tensor. Users do not construct `ComputeGraph` values
// directly — they are produced by `loom.tensor` and consumed by `AcceleratorDevice`.
class ComputeGraph : Any {
  pub let opCount: int;            // number of operations in the graph
  pub let inputCount: int;         // number of input buffers required
  pub let outputCount: int;        // number of output buffers produced
  pub let label: string;           // debug label, derived from source location
}
```

---

### §21.32.1 `AcceleratorDevice` Interface

`AcceleratorDevice` is the universal handle for any compute accelerator. Both `native.webgpu.GpuDevice` and `native.tpu.TpuDevice` implement this interface.

```loom
namespace native.hal;

// Universal handle for a compute accelerator (GPU or TPU).
interface AcceleratorDevice {
  // Descriptor for this device (read-only).
  func descriptor(): AcceleratorDescriptor;

  // Feature flags for this device.
  func features(): AcceleratorFeatures;

  // Memory availability. Returns advisory figures on some platforms.
  func memoryInfo(): AcceleratorMemoryInfo;

  // Submit a tensor computation graph to this device.
  // loom.tensor uses this interface internally.
  func submitGraph(graph: ComputeGraph): Task[void];

  // Whether this device is currently available (not lost/disconnected).
  func isAvailable(): bool;

  // Wait until all submitted work on this device is complete.
  func waitIdle(): Task[void];
}

// Backed by native.webgpu.GpuDevice, native.tpu.TpuDevice, or a CPU emulation.
// native.webgpu.GpuDevice and native.tpu.TpuDevice both explicitly declare
// `implements AcceleratorDevice` in their respective sections (§21.29, §21.32.1).
// Interface satisfaction in Loom is always nominal — there is no implicit or
// structural satisfaction. See §11.1.
```

---

### §21.32.2 `AcceleratorBuffer[T]` Interface

`AcceleratorBuffer[T]` is the unified buffer type. `native.gpu.GpuBuffer[T]` and `native.tpu.TpuBuffer[T]` both implement it.

```loom
namespace native.hal;

interface AcceleratorBuffer[T] : Closeable {
  // Number of elements of type T.
  func size(): int;

  // Byte size of the buffer.
  func byteSize(): int;

  // Device this buffer is allocated on.
  func device(): AcceleratorDevice;

  // Copy buffer contents to host as a list.
  func copyToHost(): Task[list[T]];

  // Upload data from host list, overwriting buffer contents.
  func copyFromHost(data: list[T]): Task[void];

  // Zero-copy read access to the buffer's raw bytes. Only available on devices where
  // `AcceleratorFeatures.hasUnifiedMemory()` is `true` (e.g. Apple Silicon, many
  // integrated GPUs, some TPU configurations). On discrete GPUs and Cloud TPUs this
  // method throws `CapabilityError` at runtime — use `copyToHost()` instead.
  // The returned `bytes` reference is valid only while this buffer is live;
  // retaining it past `close()` is undefined behaviour on unified-memory targets.
  func rawBytes(): bytes;

  // Whether the buffer is still valid (not closed/freed).
  func isValid(): bool;

  func close(): void;
}
```

---

### §21.32.3 `AcceleratorFeatures` — Feature Inspection

`AcceleratorFeatures` provides a structured, brand-agnostic API for inspecting hardware capabilities. Feature names are standardised across vendors; vendor-specific features use a namespaced string form.

```loom
namespace native.hal;

class AcceleratorFeatures : Any {
  // Standardised capability tests (brand-agnostic):
  pub func hasFp16(): bool;         // native Float16 compute (not emulated)
  pub func hasBf16(): bool;         // native BFloat16 compute
  pub func hasInt8(): bool;         // native Int8 compute (quantised inference)
  pub func hasInt4(): bool;         // native Int4 support (NVIDIA Hopper+ / TPU v5)
  pub func hasTensorCores(): bool;  // matrix-multiply accelerator hardware
  pub func hasNvlink(): bool;       // GPU-to-GPU NVLink interconnect
  pub func hasPeerAccess(): bool;   // P2P device memory access to other devices
  pub func hasUnifiedMemory(): bool;// CPU/GPU share physical memory (Apple Silicon, some TPUs)
  pub func hasRayTracing(): bool;   // hardware ray tracing (GPU only)

  // Feature query by standardised string flag:
  //   "fp16", "bf16", "int8", "int4", "tensor_cores", "nvlink",
  //   "peer_access", "unified_memory", "ray_tracing",
  //   "tpu.megacore", "tpu.hbm2", "tpu.hbm3", "tpu.ici"
  pub func has(feature: string): bool;

  // Vendor-namespaced feature query (not standardised, may differ across versions):
  //   "cuda.sm_89", "cuda.cooperative_groups", "metal.family7",
  //   "tpu.v4", "tpu.topology_2x2x4", "vulkan.subgroup_size_64"
  pub func hasVendor(feature: string): bool;

  // All features as a list of standardised flag strings.
  pub func standardFlags(): list[string];

  // All vendor-specific flags.
  pub func vendorFlags(): list[string];
}
```

---

### §21.32.4 `DeviceDescriptor` and `DeviceRegistry`

`DeviceDescriptor` is the read-only metadata struct for an accelerator. `DeviceRegistry` is the runtime database of all installed and detected hardware.

```loom
namespace native.hal;

// Hardware kind
enum AcceleratorKind { Gpu; Tpu; Cpu; }

// Vendor identifier — normalised regardless of driver string variations.
enum VendorId {
  Nvidia;     // NVIDIA Corporation
  Amd;        // Advanced Micro Devices
  Intel;      // Intel Corporation
  Apple;      // Apple Inc. (Apple Silicon GPU/Neural Engine)
  Google;     // Google LLC (Cloud TPU, Coral Edge TPU)
  Qualcomm;   // Qualcomm (Adreno GPU, Hexagon NPU)
  Arm;        // Arm Holdings (Mali GPU)
  Unknown;    // unrecognised vendor
}

struct AcceleratorDescriptor {
  id: string;              // unique stable ID within this installation: "accelerator:0"
  kind: AcceleratorKind;
  vendor: VendorId;
  model: string;           // human-readable model name: "NVIDIA GeForce RTX 4090"
  driverVersion: string;   // vendor driver version string
  deviceMemoryBytes: int;  // VRAM / HBM / unified memory size
  backendPackage: string;  // e.g. "loom.backend.cuda", "loom.backend.tpu.cloud"
  backendVersion: string;  // installed backend package version
  computeUnits: int;       // SM count (GPU) or core count (TPU/CPU)
  clockRateKhz: int;       // peak clock rate (advisory)
  pciBusId: string?;       // "0000:01:00.0" — absent for integrated/virtual devices
}

struct AcceleratorMemoryInfo {
  totalBytes: int;
  freeBytes: int;
  usedBytes: int;
}

class DeviceRegistry : Any {
  // Singleton registry initialised from hardware.lock on first access.
  pub static func default(): DeviceRegistry;

  // All detected and installed devices, in hardware.lock order.
  pub func list(): list[AcceleratorDevice];

  // Filter by kind or vendor.
  pub func listGpus(): list[AcceleratorDevice];
  pub func listTpus(): list[AcceleratorDevice];
  pub func listByVendor(vendor: VendorId): list[AcceleratorDevice];

  // Look up by stable ID from hardware.lock.
  pub func get(id: string): Option[AcceleratorDevice];

  // Return the highest-priority device for a given backend hint.
  // If backend is Backend.Auto, applies HAL priority order.
  pub func preferredDevice(backend: loom.tensor.Backend = loom.tensor.Backend.Auto): AcceleratorDevice;

  // Return the preferred device for the given tensor dtype.
  // e.g. preferredDeviceForDtype(DType.BFloat16) returns a TPU or Ampere+ GPU.
  pub func preferredDeviceForDtype(dtype: loom.tensor.DType): AcceleratorDevice;

  // True if any device with the given backend is available.
  pub func hasBackend(backend: loom.tensor.Backend): bool;

  // Re-scan hardware.lock. Call after loom hardware detect / loom hardware compile.
  pub func refresh(): void;

  // Descriptors for all registered devices.
  pub func descriptors(): list[AcceleratorDescriptor];
}
```

**Example — brand-agnostic device selection:**

```loom
from native.hal import (DeviceRegistry);
from loom.tensor import (Tensor, DType, Backend);

let registry = DeviceRegistry.default();

// Prefer TPU if available; fall back to GPU; final fallback is CPU.
let device = registry.preferredDevice(Backend.Tpu)
          ?? registry.preferredDevice(Backend.Auto);

// Log what we got — same code regardless of hardware
print("Using: {$ device.descriptor().vendor $} {$ device.descriptor().model $}");
print("BF16:  {$ device.features().hasBf16() $}");
print("VRAM:  {$ device.descriptor().deviceMemoryBytes / 1_073_741_824 $} GB");

// Place tensors on it
let x = Tensor.randn([1024, 1024]).toDevice(device);
let y = Tensor.randn([1024, 1024]).toDevice(device);
let z = x.matmul(y).eval();
```

---

### §21.32.5 `DevicePool` — Multi-Device Management

`DevicePool` manages a set of devices for data-parallel workloads. It does not automatically shard tensors — that is the programmer's responsibility. It provides a structured way to submit independent work items to multiple devices concurrently.

```loom
namespace native.hal;

class DevicePool : Any {
  // Create a pool containing all devices matching the filter.
  pub static func allGpus(): DevicePool;
  pub static func allTpus(): DevicePool;
  pub static func all(): DevicePool;     // GPUs + TPUs, HAL priority order
  pub static func from(devices: list[AcceleratorDevice]): DevicePool;

  pub let devices: list[AcceleratorDevice];
  pub let size: int;

  // Submit `count` work items, one per device. body(device, index) is called
  // for each device in parallel. Returns a list of results in device order.
  pub func scatter[T: Sendable](
    count: int,
    body: fn(AcceleratorDevice, int): Task[T],
  ): Task[list[T]];

  // Scatter a list of data items — one item per device.
  pub func scatterData[T: Sendable, R: Sendable](
    data: list[T],
    body: fn(AcceleratorDevice, T): Task[R],
  ): Task[list[R]];

  // Wait for all devices to be idle.
  pub func waitAll(): Task[void];
}
```

**Example — data-parallel inference across all GPUs:**

```loom
from native.hal import (DevicePool);

let pool = DevicePool.allGpus();
print("Running across {$ pool.size $} GPUs");

// Split a batch across GPUs and collect results
let batchShards: list[Tensor] = splitBatch(fullBatch, pool.size);

let results = await pool.scatterData(batchShards, async func(device, shard) {
  let x = shard.toDevice(device);
  return await withNoGradAsync(async func() => forward(x).data);
});

let combined = concat(results, axis=0);
```

---

### §21.32.6 `hardware.lock` File Format

`hardware.lock` is a TOML file written by `loom hardware detect` (§27.9) and read by `DeviceRegistry.default()`. It records the currently compiled hardware backends and their associated device metadata. It is committed to version control **only** for reproducible CI environments; most projects should `.gitignore` it and regenerate on each machine.

```toml
# hardware.lock — generated by `loom hardware detect`
# DO NOT edit manually.

schema_version = "1.0"
loom_version   = "1.9.0"
detected_at    = "2026-04-08T12:00:00Z"

[[devices]]
id              = "accelerator:0"
kind            = "Gpu"
vendor          = "Nvidia"
model           = "NVIDIA GeForce RTX 4090"
driver_version  = "545.29.06"
device_memory_bytes = 25769803776
backend_package = "loom.backend.cuda"
backend_version = "12.3.1"
compiled_at     = "2026-04-08T12:00:00Z"
compute_units   = 128
clock_rate_khz  = 2520000
pci_bus_id      = "0000:01:00.0"
features        = ["fp16", "bf16", "int8", "int4", "tensor_cores", "nvlink"]

[[devices]]
id              = "accelerator:1"
kind            = "Gpu"
vendor          = "Amd"
model           = "AMD Radeon RX 7900 XTX"
driver_version  = "23.40.2"
device_memory_bytes = 25769803776
backend_package = "loom.backend.vulkan"
backend_version = "1.3.0"
compiled_at     = "2026-04-08T12:01:00Z"
compute_units   = 96
clock_rate_khz  = 2500000
pci_bus_id      = "0000:03:00.0"
features        = ["fp16", "bf16", "int8"]

[[devices]]
id              = "accelerator:2"
kind            = "Tpu"
vendor          = "Google"
model           = "Google TPU v4"
driver_version  = "libtpu-1.10.0"
device_memory_bytes = 34359738368
backend_package = "loom.backend.tpu.cloud"
backend_version = "0.4.2"
compiled_at     = "2026-04-08T12:02:00Z"
compute_units   = 2          # MegaCore count
clock_rate_khz  = 1050000
features        = ["bf16", "int8", "tpu.megacore", "tpu.hbm2", "tpu.ici"]
```

**Stale detection.** `DeviceRegistry` considers a backend stale and emits a warning when:
- `loom_version` in `hardware.lock` differs from the running Loom version.
- The `backend_package` version does not match the installed package version in `loom.lock`.
- The device listed in `hardware.lock` is no longer physically present (detected via driver probe).

Run `loom hardware compile --force` to regenerate stale entries.

---


---

## §21.33 `native.tpu` — Low-Level TPU Dispatch

*(This section is normative. Available on `@compiled --target native` only. Requires `loom.backend.tpu.*` to be installed (§30.3).)*

`native.tpu` provides typed Loom facades for direct TPU kernel authoring and device management. Most users should use `loom.tensor` with `Backend.Tpu` instead. Use `native.tpu` when you need direct XLA/StableHLO control, custom TPU kernels, or explicit TPU memory management.

```loom
namespace native.tpu;
```

---

### §21.33.1 `TpuDevice`

`TpuDevice` implements `native.hal.AcceleratorDevice` and represents a single logical TPU device (which may be a Cloud TPU slice, an Edge TPU chip, or a PJRT device).

```loom
namespace native.tpu;

class TpuDevice : Any implements native.hal.AcceleratorDevice {
  // Device metadata
  pub func descriptor(): native.hal.AcceleratorDescriptor;
  pub func features(): native.hal.AcceleratorFeatures;
  pub func memoryInfo(): native.hal.AcceleratorMemoryInfo;
  pub func isAvailable(): bool;
  pub func waitIdle(): Task[void];

  // HBM/device memory statistics (advisory on some TPU generations)
  pub func hbmTotalBytes(): int;
  pub func hbmFreeBytes(): int;

  // Platform type — use for conditional feature paths, not for primary dispatch logic
  pub let platform: TpuPlatform;

  // Enumerate all available TPU devices visible to this process.
  pub static func list(): list[TpuDevice];
  pub static func get(index: int): TpuDevice;

  // Compile a StableHLO or HLO program for this device.
  pub func compile(program: TpuProgram): Task[TpuKernel];

  // Synchronize all pending TPU operations to this device.
  pub func synchronize(): Task[void];
}

// TPU hardware platform — use feature flags (AcceleratorFeatures) for branching;
// use TpuPlatform only when platform identity is essential (e.g. libtpu vs. PJRT API surface).
enum TpuPlatform {
  CloudV2;    // Google Cloud TPU v2 (128 GiB HBM total, systolic)
  CloudV3;    // Google Cloud TPU v3 (256 GiB HBM total, bf16)
  CloudV4;    // Google Cloud TPU v4 (MegaCore, 32 GiB HBM per chip)
  CloudV5;    // Google Cloud TPU v5 (int4/int8, 96 GiB HBM per chip)
  CoralEdge;  // Google Coral Edge TPU (4 TOPS, 8 MB on-chip SRAM)
  PjRt;       // Generic PJRT plugin (covers third-party TPU-like accelerators)
  Unknown;
}
```

---

### §21.33.2 `TpuBuffer[T]`

`TpuBuffer[T]` implements `native.hal.AcceleratorBuffer[T]` and represents a typed tensor allocated in TPU HBM (or Edge TPU SRAM).

```loom
namespace native.tpu;

class TpuBuffer[T] : Any implements native.hal.AcceleratorBuffer[T] {
  // AcceleratorBuffer[T] implementation
  pub func size(): int;
  pub func byteSize(): int;
  pub func device(): native.hal.AcceleratorDevice;
  pub func copyToHost(): Task[list[T]];
  pub func copyFromHost(data: list[T]): Task[void];
  pub func rawBytes(): bytes;
  pub func isValid(): bool;
  pub func close(): void;

  // Allocate an uninitialised buffer on `device`.
  pub static func alloc(size: int, device: TpuDevice): TpuBuffer[T];

  // Allocate and fill from host data.
  pub static func fromList(data: list[T], device: TpuDevice): Task[TpuBuffer[T]];

  // Wrap a loom.tensor.Tensor's evaluated TPU buffer without copying.
  // The Tensor must already be evaluated on `device`.
  pub static func fromTensor(t: loom.tensor.Tensor): TpuBuffer[T];

  // Create a loom.tensor view over this buffer.
  pub func toTensor(shape: loom.tensor.Shape, dtype: loom.tensor.DType): loom.tensor.Tensor;
}
```

---

### §21.33.3 `TpuKernel` and StableHLO Fence Descriptors

TPU kernels are compiled from StableHLO (the stable serialisation format for XLA computations) or from its predecessor HLO text format.

```loom
namespace native.tpu;

// A pre-compiled TPU executable — the result of TpuDevice.compile().
class TpuKernel : Any {
  pub let label: string;

  // Execute the kernel asynchronously on the specified stream.
  // inputs: input TpuBuffer list in argument order.
  // returns: output TpuBuffer list in result order.
  pub func run(
    inputs: list[native.hal.AcceleratorBuffer[Any]],
    stream: TpuStream? = None,
    label: string = "",
  ): Task[list[TpuBuffer[Any]]];
}

// A compilation unit: StableHLO or HLO module text.
class TpuProgram : Any {
  pub let source: string;
  pub let format: TpuProgramFormat;
  pub let label: string;

  pub static func fromStableHlo(source: string, label: string = ""): TpuProgram;
  pub static func fromHlo(source: string, label: string = ""): TpuProgram;
}

enum TpuProgramFormat { StableHlo; Hlo; }

// Compile errors
class TpuCompileError : Exception {
  pub let source: string;
  pub let log: string;
}
class TpuDispatchError : Exception {
  pub let kernel: string;
  pub let reason: string;
}
class TpuUnavailableError : Exception {
  pub let reason: string;
}
```

**`stablehlo` and `hlo` fence descriptors.** Two GPU-compute-fence-style descriptors are provided for authoring TPU programs inline in Loom source. These produce `TpuProgram` values rather than `string` templates.

```loom
// stablehlo fence — produces a TpuProgram value directly (format=StableHlo).
// Assign directly; do NOT wrap in TpuProgram.fromStableHlo() — that constructor
// accepts a string, but the fence already evaluates to a TpuProgram.
// {$ expr $} interpolations inject compile-time integer or float constants.
let addProg: TpuProgram = ```(stablehlo):(none)
  func.func @add(%arg0: tensor<1024xf32>, %arg1: tensor<1024xf32>)
      -> tensor<1024xf32> {
    %0 = stablehlo.add %arg0, %arg1 : tensor<1024xf32>
    func.return %0 : tensor<1024xf32>
  }
```;

// Compile and run on the first available TPU:
let tpu    = TpuDevice.list()[0];
let kernel = await tpu.compile(addProg);
let result = await kernel.run([aBuffer, bBuffer]);
```

**Rules for StableHLO fences:**
- Only compile-time constant `int`, `float32`, and `bool` expressions are valid in `{$ expr $}` interpolations.
- Fence bodies must be valid StableHLO (v1.7+ uses StableHLO 1.0 serialisation).
- Syntax errors in the fence body are reported at `loom build --check` time; runtime compilation failure throws `TpuCompileError`.
- The `hlo` descriptor follows the same rules but accepts the older HLO text format.

---

### §21.33.4 `TpuStream`

`TpuStream` sequences TPU operations to enable pipelining between compute and memory transfer, equivalent to a CUDA stream on TPU.

```loom
namespace native.tpu;

class TpuStream : Any implements Closeable {
  pub static func new(device: TpuDevice, label: string = ""): TpuStream;

  // Block host until all stream operations complete.
  pub func synchronize(): Task[void];

  // Enqueue an async host-to-device copy on this stream.
  pub func enqueueCopyToDevice[T](src: list[T], dst: TpuBuffer[T]): Task[void];

  // Enqueue an async device-to-host copy on this stream.
  pub func enqueueCopyToHost[T](src: TpuBuffer[T]): Task[list[T]];

  pub func close(): void;
}
```

---

### §21.33.5 Supported TPU Variants

| Variant | `TpuPlatform` | Backend package | Notes |
|---|---|---|---|
| Google Cloud TPU v2/v3/v4/v5 | `CloudV2`–`CloudV5` | `loom.backend.tpu.cloud` | Requires `libtpu` or TPU PJRT plugin; available on GCP |
| Google Coral Edge TPU | `CoralEdge` | `loom.backend.tpu.coral` | USB/PCIe; requires `libedgetpu`; 4 TOPS; Int8 only |
| Generic PJRT device | `PjRt` | `loom.backend.tpu.pjrt` | Third-party TPU-like accelerators via the PJRT C API |

**Edge TPU constraint.** `CoralEdge` devices only support `DType.Int8` and `DType.UInt8` inference. Attempting to dispatch `Float32` or `BFloat16` operations to a Coral device produces a `TpuDispatchError` at runtime (or a compile-time warning if the dtype is statically known).

---


---

## §21.34 `loom.tpu` — High-Level TPU Integration

*(This section is normative. Available on all targets; TPU dispatch requires `loom.backend.tpu.*`.)*

`loom.tpu` integrates the `loom.tensor` / `loom.autodiff` pipeline with TPU hardware via `native.tpu`. Its primary purpose is to make `loom.tensor` operations run on TPUs transparently — most users need only set `Backend.Tpu` and call `eval()`. Direct `loom.tpu` imports are only needed for advanced TPU-specific control (multi-slice topology, TPU-specific dtypes, PJRT plugin management).

```loom
namespace loom.tpu;

// ── Backend integration ──────────────────────────────────────────────────────

// Ensure the TPU backend is initialised. Called automatically by loom.tensor
// when Backend.Tpu is first used; exposed here for explicit lifecycle control.
func init(platform: native.tpu.TpuPlatform = native.tpu.TpuPlatform.PjRt): void;

// ── Topology — multi-slice / pod-slice TPU configurations ───────────────────

// Represents a TPU pod slice topology (e.g. 2x2x4 on Cloud TPU v4).
class TpuTopology : Any {
  pub let shape: list[int];       // e.g. [2, 2, 4]
  pub let totalChips: int;        // product of shape dimensions
  pub let interchipLinks: string; // "ici" | "dcn" | "none"

  pub static func detect(): Option[TpuTopology];
  pub static func fromShape(shape: list[int]): TpuTopology;
}

// ── PJRT plugin management ────────────────────────────────────────────────────

// Load a PJRT C API plugin from a shared library path.
// Used for third-party accelerators and future TPU generations.
// The plugin must implement the PJRT C API 0.40+ interface.
func loadPjRtPlugin(path: string, options: dict[string, string] = {}): void;
func listPjRtPlugins(): list[string];   // paths of loaded plugins

// ── Utility ──────────────────────────────────────────────────────────────────

// BFloat16 is the native dtype for TPU and should be preferred over Float16
// for training workloads. This helper casts a tensor to BFloat16 and ensures
// it is placed on a TPU-capable device.
func toBf16OnTpu(t: loom.tensor.Tensor, device: native.hal.AcceleratorDevice? = None): loom.tensor.Tensor;
```

**TPU-first training example using `loom.tensor` + `loom.autodiff`:**

```loom
from loom.tensor  import (Tensor, DType, Backend);
from loom.autodiff import (Variable, AdamWOptimizer, crossEntropyLoss, GradScaler);
from native.hal   import (DeviceRegistry);

// ── Device selection — brand-agnostic ──────────────────────────────────────
let registry = DeviceRegistry.default();
let device   = registry.preferredDevice(Backend.Tpu);
              // Falls back to GPU if no TPU, then CPU

print("Accelerator: {$ device.descriptor().model $}");
print("BFloat16:    {$ device.features().hasBf16() $}");

// ── Model weights — BFloat16 for TPU, Float32 fallback ────────────────────
let dtype = device.features().hasBf16() ? DType.BFloat16 : DType.Float32;

let w1 = Variable.new(Tensor.randn([784, 256], dtype=dtype).toDevice(device));
let w2 = Variable.new(Tensor.randn([256, 10],  dtype=dtype).toDevice(device));
let opt    = AdamWOptimizer.new(lr=3e-4, weightDecay=0.01);
let scaler = device.features().hasBf16() ? GradScaler.noOp() : GradScaler.new();

func forward(x: Variable): Variable {
  return x.matmul(w1).relu().matmul(w2);
}

async func trainStep(xBatch: Tensor, yBatch: Tensor): Task[float] {
  opt.zeroGrad([w1, w2]);
  let x      = Variable.new(xBatch.to(dtype).toDevice(device), requiresGrad=false);
  let logits = forward(x);
  let loss   = crossEntropyLoss(logits, yBatch.toDevice(device));
  let scaled = scaler.scale(loss);
  await scaled.backwardAsync();
  scaler.step(opt, [w1, w2]);
  scaler.update();
  return loss.detach().item();
}
```



---


---

### §27.9 Hardware Management Commands

*(This section is non-normative.)*

The `loom hardware` command group manages accelerator backend detection, compilation, and registration. These commands are run on the developer's machine (or in a CI/CD environment with physical hardware) to build the native backend binaries that `DeviceRegistry` loads at runtime.

```
loom hardware detect
```
Scans the system for installed GPUs and TPUs. Updates `hardware.lock` with all detected devices and their available backend packages. Does not compile any backends — run `loom hardware compile` after detection to build them.

Internally, detection:
1. Probes the CUDA driver (`libcuda.so`) for NVIDIA devices.
2. Probes Vulkan instance extensions for AMD, Intel, and other Vulkan-capable GPUs.
3. Probes the Metal API (macOS/iOS) for Apple Silicon GPU.
4. Probes `libtpu.so` or the TPU PJRT plugin for Google Cloud TPUs.
5. Probes `libedgetpu.so` for Coral Edge TPU devices.
6. Probes any PJRT plugins registered via `PJRT_PLUGIN_PATH` environment variable.
7. Falls back to CPU with SIMD if no accelerator backends are available.

---

```
loom hardware list
```
Display all devices in `hardware.lock` with their compilation status:

```
accelerator:0  GPU  NVIDIA  RTX 4090       loom.backend.cuda    12.3.1  ✓ compiled
accelerator:1  GPU  AMD     RX 7900 XTX    loom.backend.vulkan  1.3.0   ✓ compiled
accelerator:2  TPU  Google  Cloud TPU v4   loom.backend.tpu.cloud 0.4.2 ✓ compiled
```

`!` marks a stale backend (backend package version changed since `hardware.lock` was written).
`?` marks a device that was in `hardware.lock` but is no longer detected.

---

```
loom hardware compile [--device <id>] [--force] [--backend <package>]
```
Compile backend binaries for all detected devices (or a specific device by `hardware.lock` id).

- `--device accelerator:0` — compile only the named device.
- `--force` — recompile even if the compiled artifact is already up-to-date.
- `--backend loom.backend.cuda` — compile the named backend package specifically.
- `--jobs N` — parallel compilation (default: number of CPU cores).

Compilation:
1. Reads `hardware.lock` to find which backend package applies to each device.
2. Fetches the backend package from the registry if not installed.
3. Runs the backend package's `build.loom` script (§30.2), which invokes the vendor SDK (CUDA Toolkit, Vulkan SDK, etc.) to produce `.so`/`.dylib`/`.dll` artifacts.
4. Validates the artifacts by probing `DeviceRegistry` against them.
5. Updates `hardware.lock` with the new `compiled_at` timestamp and `backend_version`.

---

```
loom hardware add <backend-package>[@version]
```
Manually install a specific backend package without requiring `loom hardware detect`. Useful for installing a backend for hardware that is not physically present (e.g. preparing a Docker image for deployment to a TPU host).

```sh
loom hardware add loom.backend.tpu.cloud@0.4.2
loom hardware add loom.backend.cuda@12.3.1
loom hardware add loom.backend.tpu.coral
```

After `add`, run `loom hardware compile --backend <package>` to build the artifacts.

---

```
loom hardware remove <backend-package>
```
Uninstall a backend package and remove its entries from `hardware.lock`.

---

```
loom hardware status
```
Print a diagnostic summary:
- Loom version and `hardware.lock` schema version.
- Total devices detected, compiled, and stale.
- Whether `DeviceRegistry.default()` will succeed.
- Any devices present in the system that are not in `hardware.lock` (hint to run `detect`).

---

**Environment variables:**

| Variable | Effect |
|---|---|
| `LOOM_HARDWARE_LOCK` | Override path to `hardware.lock` (default: `.loom/hardware.lock`) |
| `PJRT_PLUGIN_PATH` | Colon-separated paths to PJRT C API plugin shared libraries |
| `LOOM_GPU_BACKEND` | Override default GPU backend: `wgpu`, `cuda`, `metal`, `vulkan` |
| `LOOM_TPU_BACKEND` | Override TPU backend: `cloud`, `coral`, `pjrt` |
| `LOOM_ACCELERATOR_DISABLE` | Comma-separated device IDs to exclude from `DeviceRegistry` |


---


---

## §30 Hardware Backend Lifecycle

*(This section is non-normative.)*

This section describes how Loom discovers, compiles, and manages hardware accelerator backends across installation, development, and deployment. The goal is that developers write brand-agnostic compute code using `loom.tensor`, `native.hal`, and `DeviceRegistry` — and the toolchain handles everything below that API boundary.

---

### §30.1 Overview

Loom separates two concerns:

1. **The language spec** (`native.hal`, `native.gpu`, `native.tpu`, `loom.tensor`) — vendor-neutral interfaces defined in this document.
2. **Backend packages** (`loom.backend.*`) — first-party packages, each wrapping a vendor SDK, that are compiled after install to produce native shared libraries.

This separation means the Loom compiler itself has no CUDA, Metal, Vulkan, or TPU dependency. Backend packages are ordinary Loom packages that happen to contain a `build.loom` build script and vendor-specific bindings. They are installed via `loom add` and compiled via `loom hardware compile`.

---

### §30.2 Backend Package Structure

Each backend package follows this layout:

```
loom.backend.cuda/
  loom.backend.cuda.lmpkg       # package manifest
  build.loom                    # hardware compilation script (see §30.3)
  src/
    bindings.loom               # @compiled Loom bindings over the CUDA C API
    device.loom                 # CudaDevice, CudaStream, etc.
  lib/
    prebuilt/                   # prebuilt artifacts for common platforms (optional)
      linux_x86_64/
        libloom_backend_cuda.so
      linux_aarch64/
        libloom_backend_cuda.so
```

The `loom.backend.cuda.lmpkg` manifest includes a `[hardware]` section:

```toml
[package]
name    = "loom.backend.cuda"
version = "12.3.1"

[hardware]
kind    = "Gpu"
vendor  = "Nvidia"
# Detection probe: shell command that exits 0 if hardware is present.
probe   = "nvidia-smi --query-gpu=name --format=csv,noheader"
# SDK requirement: minimum CUDA Toolkit version.
sdk_min = "12.0"
sdk_env = "CUDA_HOME"         # environment variable pointing to SDK root
build_requires = ["nvcc"]     # tools required on PATH for build.loom
```

---

### §30.3 `build.loom` — Backend Compilation Script

`build.loom` is a standard Loom script (§2.1 scripted mode) invoked by `loom hardware compile`. It has access to the `loom.cli` script prelude and the `loom.build` module (a future first-party package providing compilation helpers).

```loom
#!/usr/bin/env loom
// build.loom for loom.backend.cuda

from loom.build import (cc, nvcc, link, outDir, sdkPath);
from loom.cli   import (exec, env, args, print);

let cudaHome = sdkPath("CUDA_HOME") ?? "/usr/local/cuda";
let outPath  = outDir();

// Compile the CUDA helper object
nvcc(
  src: "src/loom_cuda_helpers.cu",
  out: i"{$ outPath $}/loom_cuda_helpers.o",
  flags: ["-O3", "-arch=sm_80", "--ptxas-options=-v"],
  includeDirs: [i"{$ cudaHome $}/include"],
);

// Compile the Loom binding source to native
cc(
  src: "src/bindings.loom",
  out: i"{$ outPath $}/bindings.o",
  flags: ["--target", "native", "@compiled"],
);

// Link into a shared library
link(
  objects: [
    i"{$ outPath $}/loom_cuda_helpers.o",
    i"{$ outPath $}/bindings.o",
  ],
  out: i"{$ outPath $}/libloom_backend_cuda.so",
  libs: ["cudart", "cublas", "cufft"],
  libDirs: [i"{$ cudaHome $}/lib64"],
);

print(i"loom.backend.cuda compiled successfully → {$ outPath $}/libloom_backend_cuda.so");
```

`loom hardware compile` executes `build.loom` in a sandboxed subprocess with access only to the filesystem paths declared in the `[hardware]` section's `sdk_env`. The resulting shared library path is recorded in `hardware.lock`.

---

### §30.4 Installation Flow

Standard installation on a machine with a CUDA GPU:

```sh
# 1. Install the Loom project dependencies (language packages, not hardware backends)
loom install

# 2. Detect installed hardware and update hardware.lock
loom hardware detect

# 3. Compile backends for all detected hardware
loom hardware compile

# 4. Verify
loom hardware status
# accelerator:0  GPU  NVIDIA  RTX 4090  loom.backend.cuda  12.3.1  ✓ compiled
```

Backends for hardware not present on the machine are skipped. Backend packages are added to `loom.lock` only if `loom add loom.backend.cuda` is called explicitly, or if a project's `.lmpkg` declares them as dev-dependencies:

```toml
[dev-dependencies]
"loom.backend.cuda"  = "^12"
"loom.backend.vulkan" = "^1.3"
"loom.backend.tpu.cloud" = "^0.4"
```

When `dev-dependencies` include backend packages, `loom install` downloads their source. `loom hardware compile` then builds them if the corresponding hardware is present.

---

### §30.5 Recompilation Triggers

`loom hardware compile` should be re-run when:

- **New hardware is added** — a new GPU is installed in the system; run `loom hardware detect` then `loom hardware compile`.
- **Backend package is updated** — `loom update loom.backend.cuda` updates the source; `loom hardware compile` rebuilds.
- **Loom toolchain is updated** — ABI version bumps in the Loom runtime may require backend recompilation. The toolchain emits a warning at startup if `hardware.lock` was produced by a different Loom version.
- **SDK is updated** — a CUDA Toolkit or libtpu update may expose new features; manual `loom hardware compile --force` is recommended after SDK upgrades.

`DeviceRegistry.default()` logs a warning (not an error) when `hardware.lock` is stale. The stale backend continues to function unless the ABI has changed, in which case `DeviceRegistry` marks the device as `!stale` and excludes it from `AcceleratorDevice` dispatch.

---

### §30.6 Multi-Backend Coexistence

A single Loom installation can have multiple GPU backends compiled simultaneously. The `DeviceRegistry` exposes all of them. The HAL priority order (CUDA → Metal → Vulkan → TPU → WebGPU → SIMD) is the default `Backend.Auto` tie-breaking rule; it can be overridden per-tensor via `Backend.Device(id)`.

Example `hardware.lock` for a heterogeneous workstation:

```toml
[[devices]]
id = "accelerator:0"
kind = "Gpu"; vendor = "Nvidia"; model = "RTX 4090"
backend_package = "loom.backend.cuda"
features = ["fp16", "bf16", "int8", "tensor_cores"]

[[devices]]
id = "accelerator:1"
kind = "Gpu"; vendor = "Amd"; model = "RX 7900 XTX"
backend_package = "loom.backend.vulkan"
features = ["fp16", "bf16", "int8"]

[[devices]]
id = "accelerator:2"
kind = "Tpu"; vendor = "Google"; model = "Coral Edge TPU"
backend_package = "loom.backend.tpu.coral"
features = ["int8"]
```

```loom
from native.hal import (DeviceRegistry, VendorId);
from loom.tensor import (DType, Backend);

let registry = DeviceRegistry.default();

// Route Float32 matmul to the NVIDIA GPU
let nvidiaGpu = registry.listByVendor(VendorId.Nvidia)[0];
let result    = bigTensor.toDevice(nvidiaGpu).matmul(weights).eval();

// Route Int8 inference to the Coral Edge TPU
let coral     = registry.listTpus()[0];
let quantised = inputTensor.to(DType.Int8).toDevice(coral);
let output    = quantised.matmul(int8Weights).eval();
```

---

### §30.7 CI / Containerised Environments

In CI environments without physical GPU hardware, backend packages can be installed without compilation (`loom install --no-hardware`), and `DeviceRegistry.default()` will return only a CPU backend. This allows CI to run tests that use `loom.tensor` via CPU fallback without requiring GPU hardware in the CI runner.

For GPU CI (e.g. GitHub Actions with NVIDIA-hosted runners, Google Cloud Build with TPU workers):

```yaml
# .github/workflows/gpu.yml (example — non-normative)
- run: loom install
- run: loom hardware detect
- run: loom hardware compile
- run: loom test --gpu
```

For Docker images intended for GPU deployment, the backend can be pre-compiled and baked into the image:

```dockerfile
FROM loom-runtime:1.7
RUN loom add loom.backend.cuda@12.3 &&     loom hardware add loom.backend.cuda &&     loom hardware compile --backend loom.backend.cuda
```

The resulting image contains the compiled `libloom_backend_cuda.so` and a `hardware.lock` with a placeholder device entry (no real device detected, but the compiled artifact is present). `DeviceRegistry` will detect the actual CUDA GPU at container runtime and activate the compiled backend.


---


---

## Appendix C: Package Type Index

Types defined in packages that require `loom install`.

### Standard Library Types

|---|---|---|
| `Tensor` | `loom.tensor` | §21.28 |
| `DType` | `loom.tensor` | §21.28 |
| `Backend` | `loom.tensor` | §21.28 |
| `TensorShapeError` | `loom.tensor` | §21.28 |
| `AcceleratorDevice` | `native.hal` | §21.32.1 |
| `AcceleratorBuffer[T]` | `native.hal` | §21.32.2 |
| `AcceleratorFeatures` | `native.hal` | §21.32.3 |
| `AcceleratorDescriptor` | `native.hal` | §21.32.4 |
| `AcceleratorMemoryInfo` | `native.hal` | §21.32.4 |
| `DeviceRegistry` | `native.hal` | §21.32.4 |
| `DevicePool` | `native.hal` | §21.32.5 |
| `AcceleratorKind` | `native.hal` | §21.32.4 |
| `VendorId` | `native.hal` | §21.32.4 |
| `TpuDevice` | `native.tpu` | §21.33.1 |
| `TpuBuffer[T]` | `native.tpu` | §21.33.2 |
| `TpuKernel` | `native.tpu` | §21.33.3 |
| `TpuProgram` | `native.tpu` | §21.33.3 |
| `TpuStream` | `native.tpu` | §21.33.4 |
| `TpuPlatform` | `native.tpu` | §21.33.1 |
| `TpuCompileError` | `native.tpu` | §21.33.3 |
| `GpuMemoryInfo` | `native.webgpu` | §21.29 |
| `GpuTexture` | `native.webgpu` | §21.29 |
| `GpuTextureView` | `native.webgpu` | §21.29 |
| `GpuSampler` | `native.webgpu` | §21.29 |
| `GpuTimestampQuerySet` | `native.webgpu` | §21.29 |
| `GpuProfiler` | `native.gpu` | §21.30.3 |
| `GpuTimingResult` | `native.gpu` | §21.30.3 |
| `GpuKernelBinding` | `native.gpu` | §21.30.2 |
| `CudaDevice` | `native.gpu.cuda` | §21.30.1 |
| `CudaStream` | `native.gpu.cuda` | §21.30.1 |
| `GradScaler` | `loom.autodiff` | §21.31 |
| `AutodiffError` | `loom.autodiff` | §21.31 |
| `AdamWOptimizer` | `loom.autodiff` | §21.31 |
| `RMSpropOptimizer` | `loom.autodiff` | §21.31 |
| `TpuTopology` | `loom.tpu` | §21.34 |
| `TensorBackendError` | `loom.tensor` | §21.28 |
| `GpuDevice` | `native.webgpu` | §21.29 |
| `GpuBuffer` | `native.webgpu` / `native.gpu` | §21.29, §21.30 |
| `GpuKernel` | `native.gpu` | §21.30 |
| `GpuQueue` | `native.webgpu` | §21.29 |
| `GpuCommandEncoder` | `native.webgpu` | §21.29 |
| `GpuCompileError` | `native.gpu` | §21.30 |
| `GpuUnavailableError` | `native.webgpu` | §21.29 |
| `Variable` | `loom.autodiff` | §21.31 |
| `Optimizer` | `loom.autodiff` | §21.31 |
| `ComputeGraph` | `native.hal` | §21.32 |
| `AdamOptimizer` | `loom.autodiff` | §21.31 |
| `SgdOptimizer` | `loom.autodiff` | §21.31 |
| `CustomOp` | `loom.autodiff` | §21.31 |

### v1.18 Standard-Library Types (Cross-Reference)

The following types live in the standard library (no `loom install` required)
but are listed here for cross-reference convenience since packages frequently
export types using them. Full specifications are in the
[Loom Standard Library Reference v1.18](loom-stdlib-reference-v1_18.md).

| Type | Namespace | Stdlib Reference |
|---|---|---|
| `Shareable` | `core` | §21.1.1 |
| `SharedBuffer[T]` | `core` | §21.1.2 |
| `SharedArray[T]` | `core` | §21.1.3 |
| `SharedArena` | `core` | §21.1.4 |
| `SharedRef[T]` | `core` | §21.1.5 |
| `WeakRef[T]` (shared extension) | `core` | §21.1.6 |
| `Ordering` | `core.atomic` | §21.2.1 |
| `Atomic[T]` | `core.atomic` | §21.2.3 |
| `Integer` (trait) | `core` | §21.2.4 |
| `SharedMutex[T]` / `MutexGuard[T]` | `sync.shared` | §21.3.1 |
| `SharedRwLock[T]` / `RwReadGuard[T]` / `RwWriteGuard[T]` | `sync.shared` | §21.3.2 |
| `SharedCondVar` | `sync.shared` | §21.3.3 |
| `SharedSemaphore` | `sync.shared` | §21.3.4 |
| `SharedBarrier` / `BarrierResult` | `sync.shared` | §21.3.5 |
| `SharedQueue[T]` | `sync.shared` | §21.3.6 |
| `SharedStack[T]` | `sync.shared` | §21.3.7 |

Packages that export `SharedRef[T]` for a `T: shared class` they declare
must carry a `shared_abi_version` manifest field per §13.5b.



