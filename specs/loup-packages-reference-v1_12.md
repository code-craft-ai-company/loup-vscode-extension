# Loup Packages Reference v1.12

**Status:** Release — current normative reference
**Version:** 1.12.0
**Date:** 2026-05-07
**Supersedes:** 1.11.0
**Scope:** Packages that require `loup install`, depend on external hardware
  backends compiled separately, or are maintained on a cadence independent of
  the core language runtime: `loup.tensor`, `loup.autodiff`, `loup.tpu`,
  `loup.ai`, `loup.db`, `loup.bench`, `loup.format`,
  `native.gpu`, `native.tpu`, `native.hal`; package registry specification;
  hardware management tooling; hardware backend lifecycle.

**Changes from v1.11:**

- **Section number migration.** All references to language-reference sections
  have been updated from the v1.19 form (`§17b`, `§32`, etc.) to the v1.20
  volume-prefixed form (`§2-2`, `§4-1`, etc.). Internal package-reference
  section numbers (e.g., `§13.5`, `§21.28`) have been re-prefixed to follow
  their parent volume — `§13.5` becomes `§1-13.5` (extension of Volume 1
  §1-13) and `§21.28` is preserved (stdlib continuation; see stdlib
  reference for §21.X numbering).
- **Related documents.** Updated to reference the four-volume Language
  Reference v1.20 (Core / Runtime / Compilation / Data Formats) and the
  Standard Library Reference v1.20.

**Changes from v1.10:**

- **§1-13.5b (new).** Shared-class ABI versioning rules for packages exporting
  `shared class` declarations. Establishes the package-manifest ABI-version
  field, the cross-mode ABI compatibility matrix, and installation-time
  verification of `shared class` ABI compatibility.
- **§21.28 `loup.tensor` note.** `Tensor` values now expose `asSharedArray()`
  and `fromSharedArray()` zero-copy converters for interop with
  `SharedArray[T]` (Language Reference §2-2.3) when the backend is CPU.
- **Appendix C.** New v1.18 stdlib types (`SharedArena`, `SharedRef[T]`,
  `SharedMutex[T]`, `SharedRwLock[T]`, `SharedQueue[T]`, `Atomic[T]`,
  `SharedBarrier`, `SharedSemaphore`, `SharedCondVar`, `SharedStack[T]`)
  are listed for cross-reference. These live in the stdlib, not in
  packages — the appendix notes them with their stdlib section references.

**Related documents:**
- [Loup Language Reference v1.20 — Volume 1: Core Language](loup-language-core-v1_20.md)
- [Loup Language Reference v1.20 — Volume 2: Runtime](loup-language-runtime-v1_20.md)
- [Loup Language Reference v1.20 — Volume 3: Compilation](loup-language-compilation-v1_20.md)
- [Loup Language Reference v1.20 — Volume 4: Data Formats](loup-language-data-v1_20.md)
- [Loup Standard Library Reference v1.20](loup-stdlib-reference-v1_20.md)

---

## Table of Contents

  - [§1-13.3b Build Options (`[options]`)](#1-133b-build-options-options)
  - [§1-13.4b Per-Profile Provider Selection](#1-134b-per-profile-provider-selection)
  - [§1-13.4e Separate Compilation (`[build] separate`)](#1-134e-separate-compilation-build-separate)
  - [§1-13.4f Run-Time Permissions (`[permissions] grant`)](#1-134f-run-time-permissions-permissions-grant)
  - [§1-13.5 Package Registry](#1-135-package-registry)
  - [§1-13.5b Shared-Class ABI Versioning for Packages](#1-135b-shared-class-abi-versioning-for-packages)
  - [§1-13.8 Core Package Set](#1-138-core-package-set)
- [§21.28 `loup.tensor` — High-Level Tensor Operations](#2128-louptensor--high-level-tensor-operations)
- [§21.29 `native.webgpu` — WebGPU API Facade](#2129-nativewebgpu--webgpu-api-facade)
- [§21.30 `native.gpu` — Low-Level GPU Kernel Dispatch](#2130-nativegpu--low-level-gpu-kernel-dispatch)
  - [§21.30.1 CUDA Backend Specification](#21301-cuda-backend-specification)
  - [§21.30.2 Typed Kernel Binding](#21302-typed-kernel-binding)
  - [§21.30.3 GPU Profiling API](#21303-gpu-profiling-api)
  - [§21.30.4 `GpuBuffer` ↔ `loup.tensor.Tensor` Bridge](#21304-gpubuffer--louptensortensor-bridge)
- [§21.31 `loup.autodiff` — Automatic Differentiation](#2131-loupautodiff--automatic-differentiation)
- [§21.32 `native.hal` — Hardware Abstraction Layer](#2132-nativehal--hardware-abstraction-layer)
  - [§21.32.1 `AcceleratorDevice` Interface](#21321-acceleratordevice-interface)
  - [§21.32.2 `AcceleratorBuffer[T]` Interface](#21322-acceleratorbuffert-interface)
  - [§21.32.3 `AcceleratorFeatures` — Feature Inspection](#21323-acceleratorfeatures--feature-inspection)
  - [§21.32.4 `DeviceDescriptor` and `DeviceRegistry`](#21324-devicedescriptor-and-deviceregistry)
  - [§21.32.5 `DevicePool` — Multi-Device Management](#21325-devicepool--multi-device-management)
  - [§21.32.6 `hardware.lock` File Format](#21326-hardwarelock-file-format)
- [§21.33 `native.tpu` — Low-Level TPU Dispatch](#2133-nativetpu--low-level-tpu-dispatch)
  - [§21.33.1 `TpuDevice`](#21331-tpudevice)
  - [§21.33.2 `TpuBuffer[T]`](#21332-tpubuffert)
  - [§21.33.3 `TpuKernel` and StableHLO Fence Descriptors](#21333-tpukernel-and-stablehlo-fence-descriptors)
  - [§21.33.4 `TpuStream`](#21334-tpustream)
  - [§21.33.5 Supported TPU Variants](#21335-supported-tpu-variants)
- [§21.34 `loup.tpu` — High-Level TPU Integration](#2134-louptpu--high-level-tpu-integration)
- [§21.35 `native.window` — Native Windowing and Surface](#2135-nativewindow--native-windowing-and-surface)
  - [§21.35.1 Gamepad Subsystem](#21351-gamepad-subsystem)
  - [§21.35.2 Clipboard](#21352-clipboard)
  - [§21.35.3 Platform Backend Mapping](#21353-platform-backend-mapping)
  - [§21.35.4 Error Codes](#21354-error-codes)
  - [§21.35.5 Engine Use Patterns (non-normative)](#21355-engine-use-patterns-non-normative)
- [§21.36 `native.audio` — Audio Mixer and Voice Graph](#2136-nativeaudio--audio-mixer-and-voice-graph)
  - [§21.36.1 Platform Backend Mapping](#21361-platform-backend-mapping)
  - [§21.36.2 Error Codes](#21362-error-codes)
  - [§21.36.3 Engine Use Patterns (non-normative)](#21363-engine-use-patterns-non-normative)
  - [§1-20.9 Hardware Management Commands](#1-209-hardware-management-commands)
- [§3-4 Hardware Backend Lifecycle](#3-4-hardware-backend-lifecycle)
  - [§3-4.1 Overview](#3-41-overview)
  - [§3-4.2 Backend Package Structure](#3-42-backend-package-structure)
  - [§3-4.3 `build.loup` — Backend Compilation Script](#3-43-buildloup--backend-compilation-script)
  - [§3-4.4 Installation Flow](#3-44-installation-flow)
  - [§3-4.5 Recompilation Triggers](#3-45-recompilation-triggers)
  - [§3-4.6 Multi-Backend Coexistence](#3-46-multi-backend-coexistence)
  - [§3-4.7 CI / Containerised Environments](#3-47-ci--containerised-environments)

---

### §1-13.3b Build Options (`[options]`)

*(This section is normative. It extends core §1-13.3, which defines the `[options]`
manifest section; the text here states the schema in one place and how it composes with
the other selection mechanisms of this reference. Where the two disagree, core §1-13.3
governs.)*

A package declares its own build axes in `[options]`. Each key is an option name; its
value is a table with a finite, enumerated `values` list and an optional `default`:

```toml
[options]
tls       = { values = ["off", "mbedtls", "wolfssl"], default = "off" }
log_level = { values = ["none", "error", "info", "trace"], default = "error" }
device    = { values = ["stm32f4", "stm32h7"] }   # no default — must be supplied
```

**Schema.**

| Field | Required | Meaning |
|---|---|---|
| `values` | yes | non-empty list of string literals; the option's whole domain |
| `default` | no | one of `values`; absent means the option MUST be supplied at build time |

An `[options]` entry whose table has no `values` array is not a declaration: it SETS
the options of the package it names, `<name> = "<value>"` each (core §1-13.3, "A
package's options are its own", v1.21, v21.portable.13). Only the root manifest's
settings apply:

```toml
[options."loup.ui"]      # the package `loup.ui` (a dependency); `[options.loup.ui]` is the same
budget = "small"         # one of the values `loup.ui` declares for its option `budget`
```

- The domain is closed: no open strings, no integers, no domain computed by a `const
  func`. That keeps the configuration space countable, which is what makes coverage over
  configurations a finite obligation (qualification plan §3.2, `CTR-OPT-*`).
- Values are supplied with `--option <name>=<value>`, repeatable, on `loup build`,
  `loup-build`, `loup run` and `loup test` (core §1-13.3). An undeclared name is
  `E_OPTION_UNKNOWN`; a value outside the domain is `E_OPTION_VALUE_INVALID`; an option
  with no default that is not supplied is `E_OPTION_UNSET`. All three are
  manifest/command-line errors reported before any module is compiled.
- A package's options are read by that package's OWN modules (v1.21, v21.portable.13):
  the root's by the root's modules, a dependency's by the dependency's, each at its
  declared default unless the build sets it with `--option <package>.<name>=<value>` or
  the root manifest's `[options."<package>"]` (the command line winning). A setting is
  checked against the package it names before any module is compiled
  (`E_OPTION_UNKNOWN`, `E_OPTION_VALUE_INVALID`); a dependency's option with no default
  that the build leaves unset is `E_OPTION_UNSET` when a module of that package is
  compiled. Core §1-13.3 states which package a setting names and how it is found.
- Source reads an option as `options.<name>` inside an `if const` condition (core §1-6.3);
  the value is a string compared against a literal from the domain. Every branch is
  type-checked; only the selected branch is lowered.
- The resolved option vector — the values set for dependencies' options included — is
  part of the build's identity: it is recorded in the attestation under `--profile
  safety` (qualification plan §5.1.3) and participates in the build cache key, so two
  builds that differ only in an option never share an artifact.

**Composition with this reference's other mechanisms (non-overlapping by construction).**

| Mechanism | Selects | Decided by | When |
|---|---|---|---|
| `[options]` / `if const` | code inside a module | the author's declared axis | compile time, per build |
| `[target.X]` | dependency set per target triple | the target | dependency resolution |
| `[profile.X]` provider selection (§1-13.4b) | which package satisfies an interface | the profile | dependency resolution |
| `prefer compiled` | source vs. compiled artifact of one package | the consumer | artifact selection |

None of these reads or writes another's decision. In particular an `[options]` value
cannot change the dependency set — a dependency needed only under one option value is
declared unconditionally and its use guarded by `if const` — and no `[target.X]` or
`[profile.X]` entry can set an option, because an option is supplied on the command line,
by the ROOT manifest's `[options."<package>"]` for a dependency's option (v1.21,
v21.portable.13), or by its default, and nowhere else. This is what LCP §4.4 means by non-overlapping: a
reader who knows which mechanism made a decision knows where it was made.

**Const-callability of package APIs.** No function exported by a package in this
reference is declared `const func` in v1.21, so none is callable from a const context
(`E_CONST_CALLS_NON_CONST`); the stdlib reference's "Const-callability" note applies
verbatim to package APIs. `[options]` values themselves ARE readable from const contexts
— that is their purpose — which is the one compile-time surface a package contributes.

### §1-13.4b Per-Profile Provider Selection

Arch, board, backend and test-harness differences are resolved by **which
provider package the build sees** — not by conditional compilation. Loup has no
`#if` and no `@cfg`: the selection happens at the package boundary, so generic
code cannot observe the target it is being built for.

A manifest MAY declare, per build profile, which declared dependency supplies a
given **import name**:

```toml
[deps]
hal_x86 = { path = "../hal/x86_64" }
hal_arm = { path = "../hal/aarch64" }

[profile.x86-virt]
provides.hal_arch = "hal_x86"

[profile.aarch64-virt]
provides.hal_arch = "hal_arm"
```

Generic code then writes `from hal_arch import (...)` and never names an arch;
`loup build --profile aarch64-virt` decides which package that is. Swapping the
target is one manifest line and a rebuild.

**Rules.**

- `provides.<import-name> = "<dep-name>"`. The key is the name the CONSUMER
  imports; the value names a dependency declared in `[deps]`/`[dependencies]`.
  Keying by import name is what lets a provider package be called anything
  (`hal.x86_64`, `hal_arm`, a stub) while the consumer's import text stays fixed.
- A provider entry naming a dependency that is not declared, or whose path does
  not exist, SHALL be diagnosed. It SHALL NOT silently fall through to whatever
  else the search path offers.
- A `--profile` naming a profile the manifest does not declare SHALL be refused,
  so a typo cannot quietly build the default configuration. `debug` and
  `release` remain valid without declaration — they name the OPTIMISATION
  profile. A named profile builds at `release` optimisation unless it says
  otherwise; its purpose is provider selection.
- A profile selects providers only for the build it names. With no provider
  named for an import, that import does not resolve — generic code cannot see a
  provider unless a profile supplies one, which is what makes this a
  package-boundary mechanism rather than a hidden default.
- Provider selection takes precedence over the ordinary dependency search path,
  so a profile's choice wins over a directory that happens to share the import
  name.

### §1-13.4c Path Dependencies and Declared Imports

A path dependency (`libb = { path = "../libb" }`, or `libb = "../libb"`, under
`[dependencies]` or its alias `[deps]`) makes the dependency's modules
importable by the dependency's NAME, rooted at the dependency's own **package
source root** — the directory of the entry its manifest names:
`from libb.bmod import (...)` finds `../libb/src/bmod.loup` when `libb`'s entry
is `src/…`. The spellings rooted at the dependency directory itself
(`from bmod import`) and at its parent (`from libb.bmod import` with the module
at `../libb/libb/bmod.loup`) resolve too. Every driver honours this — the
hosted and freestanding lanes of `loup-bootstrap build`, the self-hosted
`loup-build` orchestrator, and the self-hosted `loup build` in-process kernel
route — so a declared dependency never needs `LOUPPATH` (loup#462, loup#525).

**Path dependencies are transitive (loup#525).** The packages a build can
import from are the **path-dependency closure** of the root package: the root
manifest's path entries, then — breadth first — each dependency's OWN path
entries, resolved against THAT dependency's directory. A dependency may
therefore import a package its own manifest declares whether or not the root
declares it, and a dependency whose modules sit under its own `src/` resolves
from any importer (root or dependency) exactly as it does from the root. Each
dependency directory is visited once. When two manifests bind the same NAME to
different directories, the first binding in that order names the dotted import
prefix (the root's entries come first, so a root's choice of provider wins over
a dependency's); both directories remain search roots for their unprefixed
spellings. An inherited `LOUPPATH` keeps precedence over the closure's roots,
and the toolchain's bundled package root (core §1-13.9) follows them all.
Registry (non-path) entries are not part of the closure.

**Namespaced path dependencies (ruling PATH-1, loup#792).** A dependency whose
name is dotted (`"loup.webworks" = { path = "../packages/loup/webworks" }`, or
the same as TOML dotted keys) names its package's OWN directory, which must end
with the name's directory spellings (core §1-13.3, `E_PACKAGE_LOCATION`). Such
a dependency contributes the ROOT that directory sits under (`../packages`), not
the directory and its parent: its modules resolve by the dependency's full name
(`from loup.webworks.routing import`), per package, exactly as under a
`LOUPPATH` root (core §1-13.9). Every driver applies this (Stage0's
orchestrator and `check`; the self-hosted `loup-build` and in-process `loup
build`). A single-segment dependency keeps the three spellings above.

**`[build] strict_deps = true`.** An import that resolves into ANOTHER package —
a module whose nearest enclosing manifest is not the importing module's — SHALL
name a package the IMPORTING package's manifest declares, by name or by path;
otherwise the build fails with `E_IMPORT_UNDECLARED`, naming both packages and
the manifest to amend. A dependency's own imports are held to ITS manifest, so
`libb` importing `libc` fails while only the root declares `libc`. The rule
applies however the module was found — an inherited `LOUPPATH` or the
toolchain's bundled package root (core §1-13.9) makes a package resolvable,
never declared — and to the whole closure: a transitive dependency
satisfies `strict_deps` for the package that declares it, not for the root. Off by default: without the key, resolution is
unchanged. Keeping implementation modules private to their package (only an
interface module importable from outside) is a separate, open design question.

| Code | Condition |
|---|---|
| `E_IMPORT_UNDECLARED` | With `[build] strict_deps = true`, an import from the package into ANOTHER package names a package its manifest does not declare (by name or by path) |

### §1-13.4d Exported Modules

A package may name the modules other packages can import:

```toml
[exports]
modules = ["api", "net.http"]
```

Each entry is a module's dotted path relative to the package's source root (the
directory of `[build] entry`; the package root when there is no entry). When the
section is present, an import that resolves into the package from OUTSIDE it —
from a module whose nearest manifest is a different package (the ownership rule
of §1-13.4c) — must name one of the listed modules, else the build fails with
`E_IMPORT_PRIVATE_MODULE`, naming both packages, the module, and the exported
list. Imports within the package are unrestricted, so an exported module may
re-export (`pub from impl import (f)`) or use its private siblings. Without the
section every module is importable (unchanged). The rule is always on: the
section itself is the opt-in. Every build driver applies it (Stage0's
orchestrator; the self-hosted `loup-build` over the edges `loup-llvm` records;
`loup-build`'s freestanding kernel route over the edges the whole-program front half
of `loup-llvm --merged` resolves — the driver `loup build` ran in-process until the D1
cut, loup#525). (loup#512;
ruling PKG-1.)

| Code | Condition |
|---|---|
| `E_IMPORT_PRIVATE_MODULE` | An import from another package names a module the target package's `[exports] modules` does not list |

### §1-13.4e Separate Compilation (`[build] separate`)

```toml
[build]
delivery = "freestanding"   # v1.21: `delivery`, core §1-13.3 (`target` is its former spelling)
separate = true      # default false; --separate / --no-separate override it
```

A freestanding build with `separate = true` compiles each **package**'s share of
the program to its own object, caches it, and links the image from every
package's object; an unchanged package's object is reused by the next build
(loup#470). The package boundary is the ownership rule of §1-13.4c — a module
belongs to the package whose manifest is nearest above it — with modules that
have no manifest above them belonging to the root package, and prelude/stdlib
code to one shared unit.

Only the `.ll` → object step is per package. The type check, the whole-program
freestanding analyses (`@interruptSafe` colouring, `@lockOrder`, `@panic_handler`
discovery), MIR lowering and dead-code elimination all still run over the whole
module graph on every build, so a package boundary never hides a violation and
the image contains exactly the functions a whole-program build would. Objects
live in `<project>/.loup-cache/objects/`, keyed by the SHA-256 of the unit's exact
text, the exact compile flags (arch, profile/`-O`, float ABI, target features),
the backend tool's identity and the toolchain version; `--no-cache` recompiles
everything, and deleting the directory is always safe. The key's precise
contents, the partitioning guarantees and the lanes that support it (the LLVM
lanes, `--backend llvm` and `--backend llbe`, in both drivers — the C backend
refuses) are normative in Volume 3 §3-3.21.2.

Off by default: without the key the build is the whole-program build, unchanged.

### §1-13.4f Run-Time Permissions (`[permissions] grant`)

*(This section is normative. New in v1.21: ruling RT-UI, with the Loup Common UI program's decision M30, ruled
2026-11-03. It extends core §1-13.3.)*

A built program's run-time permission set comes from the manifest of the package being built:

```toml
[permissions]
grant = ["fs", "proc", "net", "ui", "ui.desktop", "debug", "thread"]
```

- **The names** are permission names, the capability names `runtime.has(name)` and `runtime.capabilities()` report
  (Runtime §2-5.1): `"fs"`, `"proc"`, `"net"`, `"http"`, `"ws"`, `"ui"`, `"ui.desktop"`, `"debug"`, `"thread"`,
  `"eval"`, `"entropy"` and the rest of the runtime's list. A name that is not a permission is a manifest error,
  reported before any module is compiled.
- **The list is the whole set.** When `grant` is present the program holds exactly the listed permissions. When the
  key is absent the set is the `native` profile's, which does not include `"ui.desktop"`; a program that wants a
  desktop UI backend lists it, together with every default it still needs.
- **The root package decides.** Only the manifest of the package being built is read. A dependency's `[permissions]`
  does not apply to a program that imports it, so a library cannot widen the program it is linked into (lead ruling,
  2026-11-03).
- **Compiled in, narrowed at launch.** The set is compiled into the binary as a constant that the runtime's
  capability checks read. At launch, `LOUP_DENY=<name>[,<name>…]` removes names from it; it can never add one.
- **Denial.** A call that needs a permission the program does not hold raises `CapabilityError` (core §1-18.1); for
  `runtime.ui.desktop()` that is the only way to a hosted UI backend (Runtime §2-4.8, `loup-ui-backend-contract.md`
  §B.10).
- **Not the delivery shape.** `[delivery.X]` (core §1-13.3) decides which capability modules a build may import;
  `[permissions] grant` decides what the built program may do when it runs. Neither sets the other.
- **`loup run`** does not read the key: it uses the `cli` profile adjusted by `--allow-*`, `--deny-*` and
  `--allow-all` (Runtime §2-5.1). **Freestanding** builds have no `runtime` (Runtime §2-5.1), so the key has no meaning
  there.
- **The stated limit.** The set gates the runtime's capability path, not the language: a program that declares its own
  `extern native` functions is outside it, as it already is for `runtime.fs`.

Implementation: task `v21.uirt.7` (`loup_build` and Stage0's build orchestrator).

### §1-13.5 Package Registry

> **Release status (v1.20): registry-based installation is NOT yet available.** The reference registry
> (`registry.loup-lang.org`), the Loup Registry Protocol, and the network paths of `loup add` / `loup install`
> / `loup publish` are specified but not yet implemented. In v1.20, `loup install` is a recognized command
> that validates the project manifest and **succeeds for a project with no external dependencies** (there is
> nothing to fetch — the idempotence contract holds trivially); a project that **declares dependencies**
> receives a clear "registry-based package installation is not yet available in this release" message and a
> nonzero exit, rather than a silent no-op. The rest of this section describes the target design.

The Loup ecosystem defines a registry protocol for publishing, discovering, and fetching packages.

**Reference registry.** The canonical public registry is hosted at `https://registry.loup-lang.org`. The `loup add`, `loup install`, and `loup publish` commands use this registry by default. An alternative registry may be specified in `.lppkg`:

```toml
[registry]
url = "https://my-org-registry.example.com"
```

Self-hosted registries must implement the Loup Registry Protocol (LRP), a REST API whose schema is published at `https://registry.loup-lang.org/schema/lrp/v1`. Both hosted and self-hosted instances are first-class — the toolchain does not privilege the reference registry.

**Package lifecycle:**

- `loup publish` uploads a package tarball and its `loup.lock` to the registry. Publishing requires authentication via `loup auth login`.
- `loup add <package>[@version]` resolves the package, adds it to `.lppkg`, and updates `loup.lock`. After resolution, it runs `loup install` for the newly added package only.
- `loup install` installs all dependencies from `loup.lock`, then precompiles each installed package's source to a cached Wasm artifact (see §1-20.7). Install is idempotent — packages whose cached artifacts are already up-to-date are not recompiled.
- `loup install --no-precompile` installs source only, skipping Wasm precompilation. Useful in CI environments where startup latency is not a concern.
- `loup install --offline` resolves only from the local package cache; fails if any required package is absent.
- `loup install --locked` errors if `loup.lock` would need updating; intended for CI.
- Yanking marks a version unavailable to new `loup add` resolutions but does not break existing `loup.lock` references.
- Deprecation emits a warning on `loup install` without blocking installation.

**Naming rules:**

- Package names are one or more `.`-joined segments, each a lowercase, hyphen-separated identifier: `my-package`, `json-schema`, and the namespaced `acme.http-tools` (core §1-13.3). A segment's directory and import spelling replaces `-` with `_`; a namespaced package lives at its name's path (`acme/http_tools/`).
- The `loup.` namespace prefix is reserved for first-party packages — the Core Package Set (see §1-13.8). User packages cannot use `loup.` as a prefix (`E_PACKAGE_RESERVED_NAME`).
- The stdlib namespaces (`core`, `io`, `data`, `net`, `sync`, `web`, `ui`, `native`, `lang`, `debug`) are reserved for the standard library (see §1-13.6).
- Version constraints follow semantic versioning: `^` (compatible with MAJOR), `~` (compatible with MAJOR.MINOR), `>=`, `<=`, exact, or range.
- A `loup.lock` lockfile records exact resolved versions of all transitive dependencies. The lockfile is committed to version control for applications and gitignored for libraries.

**Package signing and verification.**

*(This subsection is normative.)*

Loup packages use a dual-signature scheme to provide both publisher identity and content integrity guarantees.

**Signing model.** Every package published to any Loup registry MUST carry two signatures:

1. **Publisher signature** — an Ed25519 signature over the package tarball, made with the publisher's private key. Establishes authorship and non-repudiation.
2. **Registry countersignature** — a second Ed25519 signature added by the registry over the package tarball plus the publisher signature. Establishes that the registry received and logged the exact artifact being installed.

Both signatures are stored in a `.lppkg.sig` sidecar alongside the package tarball in the registry. The sidecar format is:

```
# <package>-<version>.lppkg.sig — JSON, UTF-8
{
  "package":              "loup.http",
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

- Publishers generate an Ed25519 keypair with `loup auth keygen`. The public key is uploaded to the registry during `loup auth login` and associated with the publisher account. A publisher may register multiple keys (e.g., one per machine or CI environment). Key rotation is performed with `loup auth keygen --rotate`.
- The registry maintains a transparency log of all published packages and their signatures. The log is append-only and publicly auditable.
- Key revocation is performed through the registry API (web interface or `loup auth revoke-key <key-id>`). Revoked keys invalidate all signatures made after the revocation timestamp. Packages signed before revocation remain valid unless the registry operator explicitly yanks them.

**Verification during install.**

`loup install` performs the following checks for every package:

1. Download the package tarball and its `.lppkg.sig` sidecar.
2. Compute SHA-256 of the tarball; compare to `tarball_sha256` in the sidecar. Abort if mismatch.
3. Fetch the publisher's Ed25519 public key from the registry (or local key cache). Verify `publisher_sig` over the tarball. Abort if invalid.
4. Fetch the registry's Ed25519 public key (pinned in the toolchain distribution). Verify `registry_sig`. Abort if invalid.
5. Optionally: check the transparency log to confirm the package is listed (requires network; skipped with `--offline`).

If any check fails, installation is aborted and an error is reported. There is no `--skip-verify` flag — signature verification is unconditional.

**`loup install --trust-key <key-id>`** — Trust an additional publisher key for the duration of this install (useful for private registries that use a self-managed key not bundled with the toolchain). The key must be reachable from the configured registry.

**Pinning for self-hosted registries.** When using a private registry, operators configure the registry's public key in the project's `.lppkg`:

```toml
[registry]
url     = "https://my-org-registry.example.com"
key_id  = "abc123..."   # hex fingerprint of the registry's Ed25519 public key
```

`loup install` pins to this key for packages resolved from the configured registry URL. The key is verified against the registry's well-known endpoint (`/.well-known/loup-registry-key`) on first use and cached locally.

**Local packages and `[dev-overrides]`.** Packages installed via `loup link` or `[dev-overrides]` are **not** signature-verified — they are local filesystem sources under the developer's direct control. The toolchain emits an advisory note when such packages are loaded.


---

### §1-13.5b Shared-Class ABI Versioning for Packages

*(This section is normative. Applies to any package — first-party `loup.*`
or third-party — that exports `shared class` declarations in its public API.
Language Reference §2-2.7 specifies the cross-mode ABI contract itself;
this section specifies how packages declare compliance and how the installer
verifies compatibility.)*

**Disambiguation: shared-class ABI vs. serialization wire format.** The
shared-class ABI (§2-2.7, this section's subject) is an **in-process memory
layout contract** — it governs how `shared class` instances are laid out
in shared-arena memory so that multiple execution contexts (JIT-compiled
Wasm, AOT-compiled native) can read and write the same objects without
marshalling. This is orthogonal to the **serialization wire format**
(Language Reference §4-1) which governs how values are converted to and
from a format-agnostic `Value` representation for transport across process,
host, or language boundaries.

A `shared class` MAY implement `Serializable` and `Deserializable` — when
it does, its wire form goes through the normal `Value` intermediate
representation (§4-1.12), NOT through the shared-class ABI layout. A
package's `shared_abi_version` field (below) pins its in-process memory
layout; a type's `@serializationId` URI (Language Reference §4-1.5) pins
its wire-format identity. These are independent concerns — a package may
change its serialization URI without changing its shared-class ABI
(breaking wire compatibility but preserving in-process interop) or vice
versa.

**Motivation.** The Language Reference normatively fixes the memory layout,
header format, refcount protocol, and vtable conventions of every `shared
class` (§2-2.7). Because two compilers — the JIT (Wasm GC+EH) and the AOT
(native) pipelines — must produce bit-identical representations of the same
class, and because packages can be installed and consumed across major
versions of the Loup toolchain, every package that exports a `shared class`
declares which ABI revision it was built against. The installer refuses to
load a package whose ABI revision is incompatible with the current runtime
toolchain.

**Manifest declaration.** A package manifest (`.lppkg`) that exports one or
more `shared class` declarations in its public API SHALL declare a
`shared_abi_version` field in the `[package]` section:

```toml
[package]
name = "loup.graph-store"
version = "1.2.0"
shared_abi_version = 1
```

The `shared_abi_version` value matches the ABI version from the arena header
(§2-2.5): v1.18 defines ABI version 1. Future Loup major revisions may
introduce ABI version 2; packages carry over unmodified if they do not
declare `shared_abi_version`, but are required to declare it if they export
any `shared class`.

**Installation check.** At `loup install` time, for each package declaring
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

**Determining the ABI version of a package.** The `loup publish` command
invokes the compiler in an ABI-fingerprinting mode that:

1. Enumerates all `shared class` declarations in the package's public API.
2. Computes each class's layout, header, and vtable fingerprint per §2-2.7.
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
  bump. The version-negotiation rules of the package registry (§1-13.5)
  prevent inadvertent downgrades.
- Adding a `shared class` to a public API is a minor version change.
- Removing a `shared class` from a public API is a major version change.

**Hardware-backend packages.** Hardware-backend packages (`native.gpu`,
`native.tpu`, `native.hal`, third-party `loup.backend.*`) may export
`shared class` types for cross-mode buffer and device-handle interop. These
packages are subject to the same ABI-version rules as general packages,
with one addition: the hardware-backend ABI version is augmented by the
hardware-driver version from `hardware.lock` (§21.32.6), such that a
`shared class GpuBuffer` declared in `loup.backend.cuda` has a composite
compatibility key of `(shared_abi_version, cuda_driver_version)`.

**`loup.lock` recording.** The resolved `shared_abi_version` of each
installed package is recorded in `loup.lock` for auditability:

```
[[package]]
name = "loup.graph-store"
version = "1.2.0"
shared_abi_version = 1
checksum = "sha256:..."
```

Subsequent `loup install --locked` runs verify that the lockfile's recorded
ABI version matches the installed package's declared version — detecting
manifest tampering between lockfile generation and install.

**Error codes:**

| Code | Condition |
|---|---|
| `E_SHARED_ABI_INCOMPATIBLE` | Package declares ABI version not supported by toolchain |
| `E_SHARED_ABI_FINGERPRINT_MISMATCH` | Publishing detected a `shared class` whose layout doesn't match declared ABI version |
| `E_SHARED_ABI_CROSS_PACKAGE` | Two packages with different ABI versions attempt to exchange `shared class` values |
| `E_SHARED_ABI_LOCK_MISMATCH` | `loup install --locked` detected lockfile ABI version doesn't match manifest |

---

### §1-13.8 Core Package Set

*(This section is normative with respect to package naming and API contracts; implementations are non-normative.)*

The **core package set** comprises first-party packages maintained by the Loup project under the reserved `loup.` namespace prefix. Core packages are available on the reference registry and are versioned independently of the toolchain. They are not built into the runtime (stdlib namespaces) but are stable, well-maintained, and officially supported.

**`loup.cli`** — Command-line argument parsing. Available on `cli` and `native` targets.

```loup
from loup.cli import (Cli, Arg, Flag);

let cli = Cli.new("mytool", version="1.0.0")
  .arg(Arg.new("input").help("Input file path"))
  .flag(Flag.new("verbose", short="v").help("Enable verbose output"))
  .flag(Flag.new("output", short="o").takesValue(true).help("Output file"));

let matches = cli.parse(args());
let inputPath = matches.get("input");
let verbose   = matches.flag("verbose");
```

**`loup.crypto`** — Cryptographic primitives. Available on all targets.

```loup
from loup.crypto import (sha256, hmacSha256, randomBytes, constantTimeEqual);

let hash    = sha256(data);                    # bytes → bytes
let mac     = hmacSha256(key, message);        # bytes, bytes → bytes
let nonce   = randomBytes(16);                 # int → bytes
let safe    = constantTimeEqual(a, b);         # bytes, bytes → bool (timing-safe)
```

Provides: `sha256`, `sha512`, `blake3` (hash functions); `hmacSha256`, `hmacSha512` (MACs); `randomBytes` (CSPRNG); `constantTimeEqual` (timing-safe comparison).

> **The full `loup.crypto.*` family** — symmetric/AEAD, public-key (signatures,
> encryption, key agreement), X.509/PKIX, the sans-I/O TLS and SSH engines, and
> code signing — is specified in the companion document
> [Loup Cryptography Packages v0.1](loup-crypto-packages-v0_1.md) (Draft). That
> document supersedes this paragraph: the four functions above are re-specified
> there as sugar over a typed, misuse-resistant object model, and the "no
> encryption or key exchange" scope note is lifted. The family is **pure Loup**
> (no FFI; correctness gated on published test vectors) with a single entropy
> host seam, and is delivered in KAT-gated phases.

**`loup.ui`** *(v1.21)* — The Loup Common UI toolkit. Its portable core (`loup.ui.core`, `loup.ui.fixed`,
`loup.ui.signal`, …) is available on all targets and in every mode, freestanding included; `loup.ui.desktop` and the
other host backends only in the host modes. Specified in the companion document
[Loup UI framework](loup-ui-framework-spec.md) (Draft), with [the backend contract](loup-ui-backend-contract.md) and
[the controls and theme](loup-ui-controls-theme.md); in-tree at `source/packages/loup/ui/`.

**`loup.db`** — Database abstraction. Available on `cli`, `service`, `native` targets.

```loup
from loup.db import (Pool);

let pool = await Pool.connect("postgresql://localhost/mydb", maxSize=10);
let rows = await pool.query(
  "SELECT id, name FROM users WHERE active = $1",
  [true]
);
for (row in rows) {
  print(i"{$ row.get("name") $}");
}
```

Provides a driver-agnostic query interface (`Pool.connect`, `pool.query`, `pool.execute`, `pool.transaction`). Driver implementations (`loup.db.postgres`, `loup.db.sqlite`, `loup.db.mysql`) are separate packages that plug into `loup.db` via the driver protocol.

**Availability summary:**

| Package | Targets | Compiled Mode |
|---|---|---|
| `loup.cli` | `cli`, `native` | Yes |
| `loup.crypto` | All | Yes |
| `loup.ui` | All (the portable core; `loup.ui.desktop` host modes only) | Yes |
| `loup.db` | `cli`, `service`, `native` | Yes |
| `loup.ai` | All | Yes |

**Companion-document packages (v1.20).** Two companion package documents
extend the core package set with domain-specific package families. These
packages are first-party (under the `loup.` namespace) but are documented
in their respective companion references rather than this document, due to
their large surface and specialized domain:

| Package family | Domain | Reference |
|---|---|---|
| `loup.fortran.*`, `loup.blas`, `loup.lapack`, `loup.fftw`, `loup.scalapack`, `loup.openmp`, `loup.mpi`, `loup.netcdf`, `loup.hdf5` | High-performance computing, scientific data formats, Fortran porting | [Loup Fortran HPC Packages v1.0](loup-fortran-hpc-packages-v1_0.md) |
| `loup.pic`, `loup.date.mainframe`, `loup.record`, `loup.vsam.*`, `loup.batch`, `loup.report`, `loup.db.db2`, `loup.mq`, `loup.cics`, `loup.ims` | Enterprise mainframe, COBOL porting, IBM z/OS integration | [Loup COBOL & Mainframe Packages v1.0.1](loup-cobol-mainframe-packages-v1_0_1.md) |
| `loup.crypto.*` (hash, mac, cipher, aead, kdf, sign, kex, pubkey/pke, ec, x509, pkcs, encoding, tls, ssh, codesign, random, otp, pq) | Cryptography — pure-Loup primitives, public-key, X.509/PKIX, sans-I/O TLS & SSH, code signing | [Loup Cryptography Packages v0.1](loup-crypto-packages-v0_1.md) (Draft) |
| `loup.ui.*` (core, fixed, signal, …, desktop) *(v1.21)* | The Loup Common UI toolkit: portable core, layout, rendering, controls, host backends | [Loup UI framework](loup-ui-framework-spec.md) (Draft) |

These follow the same packaging conventions, registry, and `.lppkg` rules
specified in this document, plus all sit under `loup.*` and are subject to
the reserved-namespace rule (Language Reference §1-13.6).



**`loup.tensor`** — High-level typed tensor operations with automatic backend dispatch (CPU SIMD, WebGPU, CUDA via FFI, Metal via FFI). Available on all targets; GPU dispatch requires the relevant backend capability. See §21.28.

**`loup.autodiff`** — Reverse-mode automatic differentiation over `loup.tensor` computation graphs. Available on all targets. See §21.31.

**`loup.ai`** — LLM orchestration. Available on all targets.

```loup
from loup.ai import (Client, Message, Role, Tool, ToolResult);
from loup.ai.anthropic import (AnthropicProvider);

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

Key APIs: `Client.new(provider)`, `client.complete(...)` for single-turn completions, `client.stream(...)` returning `AsyncIterable[TextDelta]` for streaming, `client.completeWithTools(...)` for tool use, `StructuredOutput[T]` for typed structured outputs backed by JSON Schema. Provider sub-packages (`loup.ai.anthropic`, `loup.ai.openai`, `loup.ai.gemini`, `loup.ai.ollama`) implement the provider protocol and are installed as separate packages.

Core packages follow the same `prefer compiled` pattern as stdlib modules — they ship precompiled Wasm artifacts alongside their source in the registry, enabling zero-JIT-overhead imports when installed via `loup install`.


---

## §21.28 `loup.tensor` — High-Level Tensor Operations

*(This section is normative. Available on all targets. GPU/TPU dispatch requires a capable backend; falls back to CPU SIMD if unavailable.)*

`loup.tensor` provides a high-level, typed tensor abstraction over multi-dimensional numeric arrays. Operations are lazy — they build a computation graph that is dispatched to the best available backend at evaluation time. Users never write GPU or TPU kernels to use `loup.tensor`. The hardware abstraction layer (`native.hal`, §21.32) provides the device discovery and dispatch foundation.

```loup
namespace loup.tensor;

# Backend enumeration — controls where evaluation is dispatched.
# For brand-agnostic code, prefer Backend.Auto and let the HAL select the best
# available device. Use explicit variants only when targeting a specific capability.
enum Backend {
  Auto;     # HAL selects best available: CUDA > Metal > Vulkan > TPU > WebGPU > SIMD > Scalar
  Cpu;      # force CPU (SIMD-optimised via native.simd)
  WebGpu;   # force WebGPU (browser or native with WebGPU support)
  Cuda;     # force NVIDIA CUDA (requires loup.backend.cuda)
  Metal;    # force Apple Metal (macOS/iOS only; requires loup.backend.metal)
  Vulkan;   # force Vulkan compute (AMD/Intel/NVIDIA; requires loup.backend.vulkan)
  Tpu;      # force TPU dispatch via PJRT (requires loup.backend.tpu.* variant)
  PjRt;     # force generic PJRT plugin backend (covers non-Cloud TPU hardware)
  Device(id: string);  # target a specific device by HAL device ID (e.g. "accelerator:1")
}

# Tensor element dtype.
# Float16 and BFloat16 are the standard dtypes for mixed-precision ML inference
# and training. BFloat16 is the native dtype for Google TPUs and NVIDIA Ampere+.
# Int8/UInt8 are provided for quantised inference. Use Float32 for general compute.
enum DType {
  Float32;    # IEEE 754 single precision — general-purpose default
  Float64;    # IEEE 754 double precision
  Float16;    # IEEE 754 half precision — inference, NVIDIA/AMD/Apple
  BFloat16;   # Brain float (1s + 8e + 7m) — training, TPU native, Ampere+
  Int8;       # Signed 8-bit integer — quantised inference
  UInt8;      # Unsigned 8-bit integer — quantised inference, image pixels
  Int32;      # Signed 32-bit integer
  Int64;      # Signed 64-bit integer
  Bool;       # Boolean
}

# Shape is a list of positive integers. -1 means "infer this dimension."
type Shape = list[int];

class Tensor : Any implements Renderable {
  pub let dtype: DType;
  pub let shape: Shape;
  pub let backend: Backend;

  # Constructors
  pub static func zeros(shape: Shape, dtype: DType = DType.Float32, backend: Backend = Backend.Auto): Tensor;
  pub static func ones(shape: Shape, dtype: DType = DType.Float32, backend: Backend = Backend.Auto): Tensor;
  pub static func from(data: list[Any], shape: Shape, dtype: DType = DType.Float32): Tensor;
  pub static func arange(start: float, stop: float, step: float = 1.0, dtype: DType = DType.Float32): Tensor;
  pub static func linspace(start: float, stop: float, n: int, dtype: DType = DType.Float32): Tensor;
  pub static func rand(shape: Shape, dtype: DType = DType.Float32, backend: Backend = Backend.Auto): Tensor;
  pub static func randn(shape: Shape, dtype: DType = DType.Float32, backend: Backend = Backend.Auto): Tensor;
  pub static func eye(n: int, dtype: DType = DType.Float32): Tensor;

  # Shape manipulation
  pub func reshape(shape: Shape): Tensor;
  pub func flatten(): Tensor;
  pub func squeeze(axis: int?): Tensor;
  pub func unsqueeze(axis: int): Tensor;
  pub func transpose(axes: list[int]? = None): Tensor;
  pub func permute(axes: list[int]): Tensor;

  # Slicing and indexing
  pub func slice(axis: int, start: int, stop: int, step: int = 1): Tensor;
  pub func gather(axis: int, indices: Tensor): Tensor;
  pub func scatter(axis: int, indices: Tensor, src: Tensor): Tensor;

  # Element-wise operations (all return new lazy Tensor)
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

  # Activation functions
  pub func relu(): Tensor;
  pub func sigmoid(): Tensor;
  pub func tanh(): Tensor;
  pub func gelu(): Tensor;
  pub func softmax(axis: int = -1): Tensor;
  pub func logSoftmax(axis: int = -1): Tensor;

  # Reduction operations
  pub func sum(axis: int? = None, keepDims: bool = false): Tensor;
  pub func mean(axis: int? = None, keepDims: bool = false): Tensor;
  pub func max(axis: int? = None, keepDims: bool = false): Tensor;
  pub func min(axis: int? = None, keepDims: bool = false): Tensor;
  pub func argmax(axis: int): Tensor;
  pub func argmin(axis: int): Tensor;

  # Linear algebra
  pub func matmul(other: Tensor): Tensor;
  pub func dot(other: Tensor): Tensor;

  # Type conversion
  pub func to(dtype: DType): Tensor;
  pub func toBackend(backend: Backend): Tensor;

  # Evaluation — executes the computation graph on the target backend
  pub func eval(): Tensor;
  pub async func evalAsync(): Task[Tensor];

  # Data extraction (triggers eval if not already evaluated)
  pub func toList(): list[Any];
  pub func toBytes(): bytes;        # raw little-endian buffer
  pub func item(): float;           # single-element tensor to scalar

  # Utility
  pub func shape(): Shape;
  pub func size(): int;             # total number of elements
  pub func rank(): int;             # number of dimensions
  pub func isEvaluated(): bool;

  # Multi-device placement
  pub func device(): native.hal.AcceleratorDevice;
  pub func toDevice(device: native.hal.AcceleratorDevice): Tensor;
  pub async func toDeviceAsync(device: native.hal.AcceleratorDevice): Task[Tensor];

  # Zero-copy bridge — returns the raw AcceleratorBuffer backing evaluated data.
  # Triggers eval() if not already evaluated. The buffer is invalidated if the
  # tensor is re-evaluated; do not hold references across eval() calls.
  pub func rawBuffer(): native.hal.AcceleratorBuffer[bytes];

  # Pinned memory — marks host-side storage as page-locked for fast DMA.
  pub func pin(): Tensor;
  pub func isPinned(): bool;

  # Type-safe constructor — replaces the Any-typed from() overload.
  # list[T] must be a flat list of numeric values matching dtype.
  pub static func fromTyped[T](data: list[T], shape: Shape, dtype: DType): Tensor;

  # v1.20 array[T, rank] interop. Constructs a Tensor from the eager
  # multi-dimensional array primitive (Language Reference §1-4.10). The
  # tensor's shape is taken from the array's runtime shape; the dtype is
  # inferred from T (`float32` → `DType.Float32`, `float64` →
  # `DType.Float64`, `int8` → `DType.Int8`, etc.). Element types without
  # a matching DType variant (e.g. `decimal`, `complex32`, `complex64`,
  # `bigint`) produce `E_TENSOR_DTYPE_UNSUPPORTED` at compile time. The
  # data is copied into the tensor's storage; the source array is not
  # referenced after construction.
  pub static func fromArray[T, rank: int](
      a:       array[T, rank],
      backend: Backend = Backend.Auto,
  ): Tensor;

  # Materialises an evaluated tensor's data into a v1.20 `array[T, rank]`.
  # The element type T must match the tensor's dtype (`DType.Float32`
  # requires `T = float32`, etc.) — mismatches produce
  # `E_TENSOR_DTYPE_MISMATCH` at compile time when statically known, or
  # at runtime otherwise. The type-parameter `rank` must equal the
  # tensor's runtime rank (`shape.length`) — a mismatch raises
  # `TensorShapeError` at runtime. The output array is base-0 row-major;
  # higher-base or column-major outputs are obtained by composing with
  # `core.array.rebase` (§21.10.4) or `core.array.toOrder` (§21.10.4)
  # after materialisation. If the tensor is not yet evaluated, `eval()`
  # is invoked first.
  pub func toArray[T, rank: int](): array[T, rank];
}

# Free functions operating on tensors
func matmul(a: Tensor, b: Tensor): Tensor;
func concat(tensors: list[Tensor], axis: int = 0): Tensor;
func stack(tensors: list[Tensor], axis: int = 0): Tensor;
func split(t: Tensor, sections: int | list[int], axis: int = 0): list[Tensor];
func where(condition: Tensor, x: Tensor, y: Tensor): Tensor;
func broadcast(a: Tensor, b: Tensor): (Tensor, Tensor);   # broadcast to common shape
```

**Backend dispatch.** When `eval()` is called, the runtime queries the `DeviceRegistry` (§21.32.4) and selects the backend in priority order: CUDA → Metal → Vulkan → TPU → WebGPU → CPU SIMD → scalar CPU. The programmer can override by constructing tensors with an explicit `backend` or `Backend.Device(id)` argument, or by calling `toBackend(...)` before evaluation.

**Multi-device tensors.** A `Tensor` carries a `device` field that identifies which accelerator holds its evaluated data. Tensors on different devices cannot be directly operated on — the programmer must move tensors to the same device first using `toDevice(device)`. Cross-device moves trigger an asynchronous memory transfer; `toDeviceAsync(device)` makes this explicit.

**Zero-copy bridge to `native.gpu` / `native.tpu`.** `Tensor.rawBuffer()` returns the `AcceleratorBuffer[bytes]` backing the tensor's evaluated data without copying. This allows custom GPU or TPU kernels (§21.30, §21.33) to consume `loup.tensor` outputs directly. Calling `rawBuffer()` on an un-evaluated tensor triggers `eval()` first.

**Pinned memory.** `Tensor.pin()` marks the tensor's host-side backing store as pinned (page-locked) memory, enabling faster DMA transfers to GPU/TPU. Pinned allocation is limited — use only for tensors that are frequently transferred. Pinned memory is a no-op on targets without GPU/TPU backends.

**Mixed-precision helpers:**

```loup
# Cast to BFloat16 for TPU training, Float16 for GPU inference
let bf16Weights = weights.to(DType.BFloat16);
let fp16Activations = activations.to(DType.Float16);

# Device placement
let device = DeviceRegistry.default().preferredDevice(Backend.Tpu);
let tpuTensor = myTensor.toDevice(device);

# Inspect which device a tensor lives on
print(tpuTensor.device().descriptor().model);  # e.g. "Google TPU v4"
```

**Compile-time errors.**

| Code | Condition |
|---|---|
| `E_TENSOR_DTYPE_UNSUPPORTED` | `Tensor.fromArray` called with an `array[T, rank]` whose element type `T` does not have a corresponding `DType` variant (e.g., `decimal`, `complex32`, `complex64`, `bigint`) |
| `E_TENSOR_DTYPE_MISMATCH` | `Tensor.toArray[T, rank]` called with a `T` that does not match the tensor's runtime `dtype` (statically detected when the `dtype` is a compile-time constant, otherwise raised as `TensorDTypeError` at runtime) |

**Error types.**

```loup
class TensorShapeError : Exception { pub let expected: Shape; pub let actual: Shape; }
class TensorDTypeError : Exception { pub let expected: DType; pub let actual: DType; }
class TensorBackendError : Exception { pub let backend: Backend; pub let reason: string; }
```

---



## §21.29 `native.webgpu` — WebGPU API Facade

*(This section is normative. Available on all targets.)*

`native.webgpu` provides typed Loup facades over the WebGPU API, enabling GPU-accelerated compute and rendering from both browser (Wasm) and native contexts. It is the lower-level WebGPU API layer beneath `native.gpu` and `loup.tensor`.

## Architecture

### WebGPU API Facade

The module wraps the W3C WebGPU API with typed Loup classes and structs. On browser targets, these map directly to JavaScript WebGPU objects via `extern js`. On native targets, they wrap a native WebGPU implementation (e.g., wgpu-native, Dawn).

### Core Types

```loup
namespace native.webgpu;

class GpuAdapter : Any {
  pub let name: string;
  pub let features: list[string];
  pub let isFallbackAdapter: bool;
  pub async func requestDevice(desc: GpuDeviceDescriptor? = None): Task[GpuDevice];
}

class GpuDevice : Any implements native.hal.AcceleratorDevice, Closeable {

  # AcceleratorDevice implementation
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
- **Native:** Classes wrap a native WebGPU implementation (wgpu-native or Dawn). The native library is linked at compile time via `loup build --feature webgpu`.

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

```loup
class GpuUnavailableError : Exception { pub let reason: string; }
class GpuOutOfMemoryError  : Exception { pub let requested: int; }
class GpuValidationError   : Exception { pub let source: string; }
class GpuTimestampError    : Exception { pub let reason: string; }
```

### Texture Views

```loup
class GpuTextureView : Any implements Closeable {
  pub let texture: GpuTexture;
  pub let format: GpuTextureFormat;
  pub let dimension: GpuTextureViewDimension;
  pub let baseMipLevel: int;
  pub let mipLevelCount: int;
  pub let baseArrayLayer: int;
  pub let arrayLayerCount: int;
  pub func close(): void;
}

struct GpuTextureViewDescriptor {
  format: GpuTextureFormat? = None;       # defaults to texture format
  dimension: GpuTextureViewDimension? = None;
  baseMipLevel: int = 0;
  mipLevelCount: int? = None;             # None = all remaining levels
  baseArrayLayer: int = 0;
  arrayLayerCount: int? = None;           # None = all remaining layers
  label: string = "";
}

enum GpuTextureViewDimension {
  D1; D2; D2Array; Cube; CubeArray; D3;
}
```

A `GpuTextureView` is obtained from `texture.createView(desc)` and is the
addressable handle used as a binding source for sampling, a color or
depth/stencil attachment in a render pass, and a transfer destination. Views
do not own the underlying texture storage — closing a view releases the view
handle; the texture remains live until its own `close()` is called.

### Surface and Swap Chain

```loup
class GpuSurface : Any implements Closeable {
  # The window or canvas this surface presents to. Returned by
  # native.window.Window.nativeSurface() (§21.35) on native targets, or by
  # GpuSurface.fromCanvas(canvasId) on browser targets.
  pub let width: int;
  pub let height: int;
  pub func configure(cfg: GpuSurfaceConfiguration): void;
  pub func unconfigure(): void;

  # Acquire the next swap-chain texture for rendering. Returns the texture
  # and a presentation token. Throws GpuSurfaceLostError if the surface is
  # no longer presentable (window minimized, device lost, etc.).
  pub func getCurrentTexture(): GpuSurfaceTexture;

  # Browser-only constructor; native is via native.window.
  pub static func fromCanvas(canvasId: string): GpuSurface;

  pub func close(): void;
}

struct GpuSurfaceConfiguration {
  device: GpuDevice;
  format: GpuTextureFormat;                  # typically Bgra8Unorm or Rgba8Unorm
  usage: int = GpuTextureUsage.RenderAttachment;
  width: int;
  height: int;
  presentMode: GpuPresentMode = GpuPresentMode.Fifo;
  alphaMode: GpuAlphaMode = GpuAlphaMode.Opaque;
  viewFormats: list[GpuTextureFormat] = [];
}

struct GpuSurfaceTexture {
  texture: GpuTexture;
  view: GpuTextureView;
  suboptimal: bool;             # true if presentation would be suboptimal
                                # (e.g., window resized but surface not yet reconfigured)
}

enum GpuPresentMode {
  Fifo;            # vsync, no tearing — universally supported
  FifoRelaxed;     # vsync with late-frame relaxation
  Immediate;       # no vsync, may tear
  Mailbox;         # triple-buffered, no tearing, low latency
}

enum GpuAlphaMode {
  Opaque;          # alpha ignored
  PreMultiplied;
  PostMultiplied;
  Inherit;         # platform default
}

enum GpuTextureUsage {
  CopySrc          = 0x01;
  CopyDst          = 0x02;
  TextureBinding   = 0x04;
  StorageBinding   = 0x08;
  RenderAttachment = 0x10;
}

class GpuSurfaceLostError : Exception { pub let reason: string; }
```

**Present model.** After encoding render commands targeting
`surfaceTexture.view`, submit the resulting command buffer through the device
queue. The texture is presented automatically when the next swap-chain
acquire occurs or when `queue.onSubmittedWorkDone()` resolves and the surface
becomes ready — there is no explicit `present()` call. This matches the WebGPU
spec; native implementations bridge to platform-specific present APIs
(`vkQueuePresentKHR`, `IDXGISwapChain::Present`, `[CAMetalLayer nextDrawable]`)
under the hood.

**Resize handling.** When the underlying window resizes, the application
SHOULD call `surface.configure(cfg)` with the new dimensions before the next
`getCurrentTexture()` call. Calling `getCurrentTexture()` with a stale
configuration sets `suboptimal = true` in the returned struct but does not
throw — the application may choose to render the frame anyway and reconfigure
on the next iteration.

### Render Pipeline

```loup
class GpuRenderPipeline : Any implements Closeable {
  pub let label: string;
  pub func getBindGroupLayout(index: int): GpuBindGroupLayout;
  pub func close(): void;
}

class GpuPipelineLayout : Any implements Closeable {
  pub let label: string;
  pub func close(): void;
}

struct GpuPipelineLayoutDescriptor {
  bindGroupLayouts: list[GpuBindGroupLayout];
  label: string = "";
}

struct GpuRenderPipelineDescriptor {
  vertex: GpuVertexState;                       # required
  fragment: GpuFragmentState? = None;           # None = depth-only pass
  primitive: GpuPrimitiveState = GpuPrimitiveState();
  depthStencil: GpuDepthStencilState? = None;
  multisample: GpuMultisampleState = GpuMultisampleState();
  layout: GpuPipelineLayout? = None;            # None = "auto" layout
  label: string = "";
}

struct GpuVertexState {
  module: GpuShaderModule;
  entryPoint: string = "main";
  buffers: list[GpuVertexBufferLayout] = [];
  constants: dict[string, float] = {};          # shader override constants
}

struct GpuFragmentState {
  module: GpuShaderModule;
  entryPoint: string = "main";
  targets: list[GpuColorTargetState];
  constants: dict[string, float] = {};
}

struct GpuVertexBufferLayout {
  arrayStride: int;                             # bytes between elements
  stepMode: GpuVertexStepMode = GpuVertexStepMode.Vertex;
  attributes: list[GpuVertexAttribute];
}

struct GpuVertexAttribute {
  format: GpuVertexFormat;
  offset: int;                                  # byte offset within the element
  shaderLocation: int;                          # @location(N) in WGSL
}

enum GpuVertexStepMode { Vertex; Instance; }

enum GpuVertexFormat {
  Uint8x2; Uint8x4; Sint8x2; Sint8x4;
  Unorm8x2; Unorm8x4; Snorm8x2; Snorm8x4;
  Uint16x2; Uint16x4; Sint16x2; Sint16x4;
  Unorm16x2; Unorm16x4; Snorm16x2; Snorm16x4;
  Float16x2; Float16x4;
  Float32; Float32x2; Float32x3; Float32x4;
  Uint32; Uint32x2; Uint32x3; Uint32x4;
  Sint32; Sint32x2; Sint32x3; Sint32x4;
}

struct GpuColorTargetState {
  format: GpuTextureFormat;
  blend: GpuBlendState? = None;                 # None = no blending
  writeMask: int = 0xF;                         # RGBA bitmask
}

struct GpuBlendState {
  color: GpuBlendComponent;
  alpha: GpuBlendComponent;

  # Common preset constructors
  pub static func replace(): GpuBlendState;     # no blending (default-like)
  pub static func alphaBlending(): GpuBlendState;  # src*srcA + dst*(1-srcA)
  pub static func premultipliedAlpha(): GpuBlendState;
  pub static func additive(): GpuBlendState;
}

struct GpuBlendComponent {
  operation: GpuBlendOperation = GpuBlendOperation.Add;
  srcFactor: GpuBlendFactor = GpuBlendFactor.One;
  dstFactor: GpuBlendFactor = GpuBlendFactor.Zero;
}

enum GpuBlendOperation { Add; Subtract; ReverseSubtract; Min; Max; }

enum GpuBlendFactor {
  Zero; One;
  Src; OneMinusSrc; SrcAlpha; OneMinusSrcAlpha; SrcAlphaSaturated;
  Dst; OneMinusDst; DstAlpha; OneMinusDstAlpha;
  Constant; OneMinusConstant;
}

struct GpuPrimitiveState {
  topology: GpuPrimitiveTopology = GpuPrimitiveTopology.TriangleList;
  stripIndexFormat: GpuIndexFormat? = None;     # required iff topology is *Strip
  frontFace: GpuFrontFace = GpuFrontFace.Ccw;
  cullMode: GpuCullMode = GpuCullMode.None;
  unclippedDepth: bool = false;                 # requires "depth-clip-control" feature
}

enum GpuPrimitiveTopology {
  PointList; LineList; LineStrip; TriangleList; TriangleStrip;
}

enum GpuIndexFormat { Uint16; Uint32; }
enum GpuFrontFace { Ccw; Cw; }
enum GpuCullMode { None; Front; Back; }

struct GpuDepthStencilState {
  format: GpuTextureFormat;                     # Depth24Plus, Depth32Float, etc.
  depthWriteEnabled: bool = false;
  depthCompare: GpuCompareFunction = GpuCompareFunction.Always;
  stencilFront: GpuStencilFaceState = GpuStencilFaceState();
  stencilBack: GpuStencilFaceState = GpuStencilFaceState();
  stencilReadMask: int = 0xFF;
  stencilWriteMask: int = 0xFF;
  depthBias: int = 0;
  depthBiasSlopeScale: float = 0.0;
  depthBiasClamp: float = 0.0;
}

struct GpuStencilFaceState {
  compare: GpuCompareFunction = GpuCompareFunction.Always;
  failOp: GpuStencilOperation = GpuStencilOperation.Keep;
  depthFailOp: GpuStencilOperation = GpuStencilOperation.Keep;
  passOp: GpuStencilOperation = GpuStencilOperation.Keep;
}

enum GpuCompareFunction {
  Never; Less; Equal; LessEqual; Greater; NotEqual; GreaterEqual; Always;
}

enum GpuStencilOperation {
  Keep; Zero; Replace; Invert;
  IncrementClamp; DecrementClamp;
  IncrementWrap; DecrementWrap;
}

struct GpuMultisampleState {
  count: int = 1;                               # 1 (no MSAA) or 4
  mask: int = 0xFFFFFFFF;
  alphaToCoverageEnabled: bool = false;
}
```

**Device factory methods (extension to §21.29 Core Types).** The device gains
the following factories for the render path:

```loup
class GpuDevice {
  # existing compute/buffer/texture factories elided

  pub func createPipelineLayout(desc: GpuPipelineLayoutDescriptor): GpuPipelineLayout;
  pub func createRenderPipeline(desc: GpuRenderPipelineDescriptor): GpuRenderPipeline;
  pub async func createRenderPipelineAsync(desc: GpuRenderPipelineDescriptor): Task[GpuRenderPipeline];

  # Surface configuration is delegated to GpuSurface.configure(cfg), where
  # cfg.device is this device. The method exists here as a convenience
  # alias that fills cfg.device before forwarding.
  pub func configureSurface(surface: GpuSurface, cfg: GpuSurfaceConfiguration): void;
}
```

### Render Pass Encoder

```loup
class GpuRenderPassEncoder : Any {
  pub func setPipeline(pipeline: GpuRenderPipeline): void;

  pub func setBindGroup(index: int, bindGroup: GpuBindGroup,
                        dynamicOffsets: list[int] = []): void;

  pub func setVertexBuffer(slot: int, buffer: GpuBuffer,
                           offset: int = 0, size: int? = None): void;

  pub func setIndexBuffer(buffer: GpuBuffer, format: GpuIndexFormat,
                          offset: int = 0, size: int? = None): void;

  # Draw calls. Counts are in vertices/indices, not bytes.
  pub func draw(vertexCount: int, instanceCount: int = 1,
                firstVertex: int = 0, firstInstance: int = 0): void;

  pub func drawIndexed(indexCount: int, instanceCount: int = 1,
                       firstIndex: int = 0, baseVertex: int = 0,
                       firstInstance: int = 0): void;

  # Indirect draws. `indirectBuffer` must be created with the IndirectDraw
  # usage flag and contain a 4xuint32 / 5xuint32 argument struct at the
  # specified offset.
  pub func drawIndirect(indirectBuffer: GpuBuffer, indirectOffset: int): void;
  pub func drawIndexedIndirect(indirectBuffer: GpuBuffer, indirectOffset: int): void;

  # Viewport and scissor are part of pipeline state by default; these
  # override per-pass.
  pub func setViewport(x: float, y: float, width: float, height: float,
                       minDepth: float = 0.0, maxDepth: float = 1.0): void;
  pub func setScissorRect(x: int, y: int, width: int, height: int): void;
  pub func setBlendConstant(color: list[float]): void;       # RGBA, length 4
  pub func setStencilReference(reference: int): void;

  # Debug groups and markers — affect captures in RenderDoc, Xcode,
  # PIX, and the Loup MCP debug bridge.
  pub func pushDebugGroup(label: string): void;
  pub func popDebugGroup(): void;
  pub func insertDebugMarker(label: string): void;

  pub func end(): void;
}

struct GpuRenderPassDescriptor {
  colorAttachments: list[GpuColorAttachment];
  depthStencilAttachment: GpuDepthStencilAttachment? = None;
  occlusionQuerySet: GpuQuerySet? = None;
  timestampWrites: GpuRenderPassTimestampWrites? = None;
  label: string = "";
}

struct GpuColorAttachment {
  view: GpuTextureView;                        # typically surfaceTexture.view
  resolveTarget: GpuTextureView? = None;       # MSAA resolve destination
  loadOp: GpuLoadOp;
  storeOp: GpuStoreOp;
  clearValue: list[float] = [0.0, 0.0, 0.0, 1.0];  # RGBA, used iff loadOp = Clear
}

struct GpuDepthStencilAttachment {
  view: GpuTextureView;
  depthLoadOp: GpuLoadOp? = None;
  depthStoreOp: GpuStoreOp? = None;
  depthClearValue: float = 1.0;
  depthReadOnly: bool = false;
  stencilLoadOp: GpuLoadOp? = None;
  stencilStoreOp: GpuStoreOp? = None;
  stencilClearValue: int = 0;
  stencilReadOnly: bool = false;
}

enum GpuLoadOp { Load; Clear; }
enum GpuStoreOp { Store; Discard; }

struct GpuRenderPassTimestampWrites {
  querySet: GpuQuerySet;
  beginningOfPassWriteIndex: int? = None;
  endOfPassWriteIndex: int? = None;
}
```

**Command encoder extension.** The `GpuCommandEncoder` class gains a
`beginRenderPass` method that returns a `GpuRenderPassEncoder`:

```loup
class GpuCommandEncoder {
  # existing methods elided
  pub func beginRenderPass(desc: GpuRenderPassDescriptor): GpuRenderPassEncoder;
  pub func copyBufferToTexture(src: GpuBufferCopyView, dst: GpuTextureCopyView,
                               copySize: GpuExtent3D): void;
  pub func copyTextureToBuffer(src: GpuTextureCopyView, dst: GpuBufferCopyView,
                               copySize: GpuExtent3D): void;
  pub func copyTextureToTexture(src: GpuTextureCopyView, dst: GpuTextureCopyView,
                                copySize: GpuExtent3D): void;
}

struct GpuBufferCopyView {
  buffer: GpuBuffer;
  offset: int = 0;
  bytesPerRow: int? = None;
  rowsPerImage: int? = None;
}

struct GpuTextureCopyView {
  texture: GpuTexture;
  mipLevel: int = 0;
  origin: GpuOrigin3D = GpuOrigin3D();
  aspect: GpuTextureAspect = GpuTextureAspect.All;
}

struct GpuExtent3D { width: int; height: int = 1; depthOrArrayLayers: int = 1; }
struct GpuOrigin3D { x: int = 0; y: int = 0; z: int = 0; }

enum GpuTextureAspect { All; StencilOnly; DepthOnly; }
```

### Pipeline Creation — Render Path

A complete render frame on a native or browser target follows this sequence:

1. **Once at startup:** acquire a `GpuSurface` from `native.window.Window.nativeSurface()` (native) or `GpuSurface.fromCanvas(canvasId)` (browser); call `surface.configure(cfg)` with the device, format, and dimensions.
2. **Once per pipeline:** create shader modules (`device.createShaderModule(wgslSource)`), optionally a pipeline layout (`device.createPipelineLayout(...)`), then `device.createRenderPipeline(...)` or `createRenderPipelineAsync(...)`.
3. **Per frame:** call `surface.getCurrentTexture()` to acquire the swap-chain texture; create a command encoder; `beginRenderPass` with a `GpuRenderPassDescriptor` whose first color attachment targets the surface texture's view; set the pipeline, bind groups, vertex/index buffers; issue draw calls; call `end()` on the pass; finish the encoder; submit the command buffer to the queue.

**Cross-target consistency.** The same render-pipeline code compiles to browser and native targets unchanged. On `--target browser`, classes wrap JavaScript WebGPU objects via `extern js`; on `--target native`, they wrap a native WebGPU implementation (wgpu-native, Dawn) linked at compile time via `loup build --feature webgpu`. Shader sources written in `wgsl` template fences (§1-16.8.1) are valid on both paths.

**Render path on non-WebGPU native backends.** When `loup build --gpu-backend metal|vulkan|cuda`, the render pipeline API routes to the selected backend through the `loup.backend.*` packages (§3-4.2). The CUDA backend exposes the render API only for interop scenarios (e.g., CUDA-decoded video frame display); CUDA is not a general-purpose rendering backend and most rendering code SHOULD target `wgpu`, `metal`, or `vulkan` directly.

### Error Types — Render Path

The following error types extend the existing `native.webgpu` exception hierarchy:

```loup
class GpuSurfaceLostError    : Exception { pub let reason: string; }
class GpuPipelineCreationError : Exception {
  pub let stage: string;        # "vertex" | "fragment" | "linking"
  pub let log: string;
}
class GpuRenderPassError     : Exception { pub let reason: string; }
```

`GpuValidationError` (already defined) is thrown for general WebGPU validation failures including malformed `GpuRenderPipelineDescriptor` values, mismatched vertex buffer layouts, and incompatible attachment formats.

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

`native.gpu` provides the runtime types for GPU compute fences (§1-16.8). It is the low-level layer beneath `loup.tensor` and is intended for programmers who need direct GPU kernel control. Most users should prefer `loup.tensor`.

```loup
namespace native.gpu;

# The compiled product of a gpu compute fence (§1-16.8).
# Constructed via GpuKernel.compile(fence_value, constants).
class GpuKernel : Any {
  pub let label: string;
  pub let source: string;         # the shader source after constant substitution
  pub let shaderLanguage: string; # "wgsl" | "metal" | "glsl"

  # Compile a shader fence into a kernel. Throws GpuCompileError on failure.
  pub static func compile(
    source: string,             # typically produced by a wgsl/metal/glsl fence
    constants: dict[string, Any] = {},
    label: string = "",
  ): GpuKernel;
}

# A typed GPU buffer — thin wrapper over native.webgpu.GpuBuffer or CUDA device memory
class GpuBuffer[T] : Any implements Closeable {
  pub let size: int;             # element count
  pub let byteSize: int;         # size * sizeof(T)

  pub static func alloc(size: int, backend: string = "auto"): GpuBuffer[T];
  pub static func fromBytes(data: bytes, backend: string = "auto"): GpuBuffer[T];

  pub async func copyToHost(): Task[list[T]];
  pub async func copyFromHost(data: list[T]): Task[void];
  pub func close(): void;
}

# Dispatch a compiled kernel over a grid of workgroups.
# buffers are bound in declaration order (binding = 0, 1, 2, ...).
async func dispatch(
  kernel: GpuKernel,
  grid: list[int],               # [x] or [x, y] or [x, y, z] workgroup counts
  buffers: list[GpuBuffer[Any]],
  label: string = "",
): Task[void];

# Error types
class GpuCompileError : Exception { pub let shaderSource: string; pub let log: string; }
class GpuDispatchError : Exception { pub let kernel: string; }
```

**Relationship to §21.29 and §21.32.** `native.gpu` uses `native.webgpu.GpuDevice` internally when the target backend is WebGPU (default). On CUDA targets it routes through the `loup.backend.cuda` binding (§3-4.2). On Metal targets it routes through `loup.backend.metal`. On Vulkan targets it routes through `loup.backend.vulkan`. The programmer selects the backend at compile time via `loup build --gpu-backend wgpu|cuda|metal|vulkan` (default: `wgpu`) **or** at runtime via `DeviceRegistry` (§21.32.4) for adaptive backend selection.

`GpuBuffer[T]` in `native.gpu` implements `AcceleratorBuffer[T]` (§21.32.2), making it interchangeable with `TpuBuffer[T]` at the HAL interface level. `native.webgpu.GpuBuffer` (unparameterized) is a lower-level WebGPU API object; obtain a `native.gpu.GpuBuffer[T]` view over it via `GpuBuffer.fromWebGpu(rawBuf, elementCount)`.

---

### §21.30.1 CUDA Backend Specification

*(This sub-section is normative for `loup build --gpu-backend cuda` on `--target native` only.)*

The CUDA backend is provided by the `loup.backend.cuda` package (§3-4.2). It exposes the following surface, which the `native.gpu` API delegates to when CUDA is the selected backend:

```loup
namespace native.gpu.cuda;

# CUDA stream — enables concurrent kernel execution and async memory copies.
# Equivalent to cudaStream_t. Multiple streams can run concurrently on one device.
class CudaStream : Any implements Closeable {
  pub static func new(device: int = 0, nonBlocking: bool = false): CudaStream;
  pub func synchronize(): void;      # blocks host until all stream ops complete
  pub async func synchronizeAsync(): Task[void];
  pub func close(): void;
}

# CUDA device management
class CudaDevice : Any {
  pub static func count(): int;              # number of CUDA-capable GPUs
  pub static func get(index: int): CudaDevice;
  pub static func current(): CudaDevice;
  pub static func setCurrent(index: int): void;

  pub let index: int;
  pub let name: string;                      # e.g. "NVIDIA GeForce RTX 4090"
  pub let vramBytes: int;                    # total VRAM
  pub let computeCapability: (int, int);     # major, minor (e.g. (8, 9) for Ada)
  pub let multiprocessorCount: int;
  pub let clockRateKhz: int;
  pub let warpSize: int;                     # always 32 on current hardware

  pub func memoryInfo(): (int, int);         # (freeBytes, totalBytes)
  pub func synchronize(): void;
}

# Pinned (page-locked) host memory — required for async device↔host transfers.
# Automatically freed when the PinnedBuffer is closed or garbage-collected.
class CudaHostBuffer[T] : Any implements Closeable, AcceleratorBuffer[T] {
  pub static func alloc(count: int): CudaHostBuffer[T];
  pub static func fromList(data: list[T]): CudaHostBuffer[T];
  pub func toList(): list[T];
  pub func close(): void;
}

# CUDA kernel launch parameters
struct CudaLaunchConfig {
  gridDim: (int, int, int) = (1, 1, 1);     # grid dimensions in blocks
  blockDim: (int, int, int) = (256, 1, 1);  # block dimensions in threads
  sharedMemBytes: int = 0;                   # dynamic shared memory per block
  stream: CudaStream? = None;               # None = default stream
}

# Dispatch a compiled kernel with explicit CUDA launch parameters.
# Used when the standard workgroup-based dispatch is insufficient.
async func dispatchCuda(
  kernel: GpuKernel,
  config: CudaLaunchConfig,
  buffers: list[GpuBuffer[Any]],
  label: string = "",
): Task[void];

# Peer-to-peer access between CUDA devices (NVLink / PCIe P2P)
func enablePeerAccess(srcDevice: int, dstDevice: int): void;
func disablePeerAccess(srcDevice: int, dstDevice: int): void;
func canAccessPeer(srcDevice: int, dstDevice: int): bool;

# Async device-to-device copy (within same or across P2P-enabled devices)
async func copyDeviceToDevice[T](
  src: GpuBuffer[T],
  dst: GpuBuffer[T],
  stream: CudaStream? = None,
): Task[void];
```

**CUDA kernel compilation.** `wgsl` fences are not valid with the CUDA backend — use `glsl` (GLSL-to-SPIR-V-to-PTX via LLVM NVPTX) or supply raw PTX via `extern native`. A future `ptx` fence descriptor is planned (§1-21).

---

### §21.30.2 Typed Kernel Binding

*(This sub-section replaces the untyped `list[GpuBuffer[Any]]` dispatch interface.)*

v1.6 dispatched kernels with `list[GpuBuffer[Any]]`, losing type safety at the call site. v1.7 introduces `GpuKernelBinding` to declare the expected buffer types up front:

```loup
namespace native.gpu;

# Declare the typed buffer layout for a kernel.
# Each entry names a binding slot and its element type.
# The compiler checks that buffers passed to dispatch() match the declared types.
class GpuKernelBinding : Any {
  pub static func new(): GpuKernelBinding;

  # Declare a read-write storage buffer at binding slot `index`.
  pub func rwBuffer[T](index: int, label: string = ""): GpuKernelBinding;
  # Declare a read-only storage buffer at binding slot `index`.
  pub func roBuffer[T](index: int, label: string = ""): GpuKernelBinding;
  # Declare a uniform buffer at binding slot `index`.
  pub func uniformBuffer[T](index: int, label: string = ""): GpuKernelBinding;
}

# Type-safe dispatch. buffers are matched to binding slots in declaration order.
# A compile-time error is emitted if the buffer element types do not match the binding.
async func dispatchTyped(
  kernel: GpuKernel,
  binding: GpuKernelBinding,
  grid: list[int],
  buffers: list[AcceleratorBuffer[Any]],   # AcceleratorBuffer[T] matches binding[T]
  label: string = "",
): Task[void];

# Legacy untyped dispatch retained for compatibility.
# Use dispatchTyped for new code — the type safety prevents silent buffer mismatches.
async func dispatch(
  kernel: GpuKernel,
  grid: list[int],
  buffers: list[GpuBuffer[Any]],
  label: string = "",
): Task[void];
```

**Example — typed dispatch:**

```loup
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

```loup
namespace native.gpu;

struct GpuTimingResult {
  label: string;
  durationNs: int;    # kernel execution time in nanoseconds
  startNs: int;       # absolute GPU timestamp at start (if available)
  endNs: int;         # absolute GPU timestamp at end (if available)
}

class GpuProfiler : Any implements Closeable {
  # Create a profiler attached to a device. Profiling adds overhead; disable
  # in production builds via --no-gpu-profile or by not creating a GpuProfiler.
  pub static func new(device: native.webgpu.GpuDevice? = None): GpuProfiler;

  # Wrap an async dispatch with timing. Returns a Task that resolves after
  # the kernel completes and timing data is read back from the device.
  pub func profile[T](label: string, body: fn(): Task[T]): Task[(T, GpuTimingResult)];

  # Return all collected timing results since last reset.
  pub func results(): list[GpuTimingResult];
  pub func reset(): void;
  pub func close(): void;
}
```

**Example — profiling a kernel:**

```loup
@compiled
from native.gpu import (GpuProfiler);

let profiler = GpuProfiler.new();
let (_, timing) = await profiler.profile("vectorAdd", async func() {
  await dispatchTyped(addKernel, binding, [n / 256], [outBuf, aBuf, bBuf]);
});
print("Kernel took {$ timing.durationNs / 1_000_000 $} ms");
```

---

### §21.30.4 `GpuBuffer` ↔ `loup.tensor.Tensor` Bridge

```loup
namespace native.gpu;

# Transfer ownership of a Tensor's underlying GPU allocation into a typed GpuBuffer[T].
# The Tensor must already be evaluated (eval() called) and must reside on a GPU device.
# Ownership of the device allocation is transferred to the returned GpuBuffer — the
# caller must not access `t` after this call. Subsequent Tensor operations that
# reference the same data must be constructed from the GpuBuffer via bufferToTensor.
# Throws TensorError if the Tensor is unevaluated or does not reside on a GPU device.
#
# For a non-destructive scoped view (recommended), use withTensorBuffer or
# withTensorBufferAsync below.
func tensorToBuffer[T](t: loup.tensor.Tensor): GpuBuffer[T];

# Execute `body` with a typed GpuBuffer[T] view over `t`'s GPU allocation.
# `t` retains ownership of the device allocation for the duration of `body`.
# The GpuBuffer is invalidated when `body` returns and must not be stored beyond it.
# Preferred over tensorToBuffer when the Tensor is still needed after the view.
func withTensorBuffer[T, R](
  t: loup.tensor.Tensor,
  body: fn(GpuBuffer[T]): R,
): R;
async func withTensorBufferAsync[T, R](
  t: loup.tensor.Tensor,
  body: fn(GpuBuffer[T]): Task[R],
): Task[R];

# Wrap a GpuBuffer[T] as a read-only loup.tensor.Tensor.
# shape must match the buffer element count.
func bufferToTensor[T](
  buf: GpuBuffer[T],
  shape: loup.tensor.Shape,
  dtype: loup.tensor.DType,
): loup.tensor.Tensor;
```

**Bridge to `native.webgpu.GpuBuffer`:**

```loup
# Wrap a raw native.webgpu.GpuBuffer as a typed native.gpu.GpuBuffer[T].
pub static func fromWebGpu[T](raw: native.webgpu.GpuBuffer, elementCount: int): GpuBuffer[T];

# Unwrap to native.webgpu.GpuBuffer for use with the WebGPU command encoder.
pub func toWebGpu(): native.webgpu.GpuBuffer;
```

---


---

## §21.31 `loup.autodiff` — Automatic Differentiation

*(This section is normative. Available on all targets. GPU dispatch for gradient computation uses `loup.tensor` backend dispatch.)*

`loup.autodiff` provides reverse-mode automatic differentiation (backpropagation) over `loup.tensor` computation graphs. It is designed for machine learning model training. Users who only need inference should use `loup.tensor` directly without `loup.autodiff`.

```loup
namespace loup.autodiff;

# A parameter tensor that participates in gradient computation.
# Wraps a Tensor and records operations in the computation graph.
class Variable : Any {
  pub let data: loup.tensor.Tensor;
  pub var grad: loup.tensor.Tensor?;    # populated after backward() is called
  pub let requiresGrad: bool;

  pub static func new(
    data: loup.tensor.Tensor,
    requiresGrad: bool = true,
    label: string = "",
  ): Variable;

  # Variable supports all Tensor operations — each creates a new Variable
  # with the operation recorded in the graph.
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
  pub func reshape(shape: loup.tensor.Shape): Variable;

  # Backward pass — computes gradients for all Variables with requiresGrad=true
  # that contributed to this Variable. Must be called on a scalar Variable
  # (a Variable whose underlying Tensor has exactly one element).
  # Throws AutodiffError if called on a non-scalar Variable or if the computation
  # graph is empty (no operations recorded since the last zeroGrad() call).
  pub func backward(): void;
  pub async func backwardAsync(): Task[void];

  # Zero out gradients accumulated in this Variable and all its dependencies.
  pub func zeroGrad(): void;

  # Detach from the computation graph — produces a plain Tensor copy
  pub func detach(): loup.tensor.Tensor;
}

# Higher-order gradient function — computes the gradient of a scalar-valued function
# with respect to a list of Variable inputs.
#
# Returns a function that, when called with inputs, returns the gradient list.
#
# Example:
#   let gradFn = grad(func(x: Variable): Variable => x.mul(x).sum());
#   let [dLdx] = gradFn([Variable.new(myTensor)]);
#
func grad(
  fn: fn(list[Variable]): Variable,
  argnums: list[int]? = None,     # which arguments to differentiate; None = all
): fn(list[Variable]): list[loup.tensor.Tensor];

# Optimisers — update Variable parameters in-place using accumulated gradients
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

# Loss functions (return scalar Variable)
func mseLoss(pred: Variable, target: Variable): Variable;
func crossEntropyLoss(logits: Variable, labels: loup.tensor.Tensor): Variable;
func binaryCrossEntropyLoss(pred: Variable, target: Variable): Variable;

# Differentiability contract. An operation is differentiable if it is expressed
# entirely in terms of Variable methods. Custom operations must provide a
# forward function and a backward function (the vector-Jacobian product).
class CustomOp : Any {
  # Override to implement the forward pass.
  pub func forward(inputs: list[loup.tensor.Tensor]): loup.tensor.Tensor;

  # Override to implement the backward pass (VJP).
  # grad_output is the upstream gradient; return one gradient per input.
  pub func backward(grad_output: loup.tensor.Tensor): list[loup.tensor.Tensor];

  # Apply this operation to Variable inputs, registering it in the graph.
  pub func apply(inputs: list[Variable]): Variable;
}

# AutodiffError — thrown by backward() on non-scalar Variable or empty graph
class AutodiffError : Exception {
  pub let variableShape: list[int]?;  # shape of the non-scalar variable, if applicable
}

# ── Additional optimisers ────────────────────────────────────────────────────

class RMSpropOptimizer : Optimizer {
  pub static func new(lr: float = 0.01, alpha: float = 0.99, eps: float = 1e-8,
                      weightDecay: float = 0.0, momentum: float = 0.0): RMSpropOptimizer;
}

class AdamWOptimizer : Optimizer {
  # AdamW decouples weight decay from the gradient update (Loshchilov & Hutter 2019).
  pub static func new(lr: float = 0.001, beta1: float = 0.9, beta2: float = 0.999,
                      eps: float = 1e-8, weightDecay: float = 0.01): AdamWOptimizer;
}

# ── Additional loss functions ────────────────────────────────────────────────

func l1Loss(pred: Variable, target: Variable): Variable;
func huberLoss(pred: Variable, target: Variable, delta: float = 1.0): Variable;
func klDivLoss(input: Variable, target: Variable): Variable;         # KL divergence
func cosineEmbeddingLoss(x1: Variable, x2: Variable, y: Variable): Variable;

# ── No-gradient context ──────────────────────────────────────────────────────

# Execute `body` without recording operations in the autograd graph.
# Equivalent to PyTorch's torch.no_grad() context manager.
# Variables created or operated on inside body do not participate in backward().
# Use for inference passes, validation loops, and metric computation.
func withNoGrad[T](body: fn(): T): T;
func withNoGradAsync[T](body: fn(): Task[T]): Task[T];

# ── Gradient checkpointing ───────────────────────────────────────────────────

# Re-computes intermediate activations during backward pass instead of storing them.
# Trades compute for memory — essential for training large models that exceed VRAM.
# Equivalent to PyTorch's torch.utils.checkpoint.checkpoint.
#
# fn: the forward function to checkpoint; inputs: its Variable inputs.
# During forward, fn is run normally. During backward, fn is re-run to obtain
# the activations needed for gradient computation.
#
# Constraint: fn must be deterministic (same output for same inputs).
# Non-deterministic operations (e.g. dropout with random state) require
# manual RNG state saving — see checkpointWithRng.
func checkpoint(fn: fn(list[Variable]): Variable, inputs: list[Variable]): Variable;
async func checkpointAsync(fn: fn(list[Variable]): Task[Variable], inputs: list[Variable]): Task[Variable];

# Checkpoint with explicit RNG state capture for non-deterministic operations.
func checkpointWithRng(
  fn: fn(list[Variable]): Variable,
  inputs: list[Variable],
  rngState: loup.tensor.Tensor,    # opaque RNG state tensor; obtain via captureRngState()
): Variable;

func captureRngState(backend: loup.tensor.Backend = loup.tensor.Backend.Auto): loup.tensor.Tensor;
func restoreRngState(state: loup.tensor.Tensor): void;

# ── Automatic Mixed Precision (AMP) ─────────────────────────────────────────

# GradScaler manages loss scaling for Float16/BFloat16 training.
# Loss scaling prevents gradient underflow when using reduced-precision dtypes.
# BFloat16 typically does not require scaling (wider exponent range); use it
# with GradScaler.noOp() or skip scaling entirely for BFloat16 workloads.
class GradScaler : Any {
  pub static func new(
    initScale: float = 65536.0,   # initial loss scale factor
    growthFactor: float = 2.0,    # scale multiplier after growthInterval clean steps
    backoffFactor: float = 0.5,   # scale multiplier after an inf/NaN gradient step
    growthInterval: int = 2000,   # steps between scale increases
    enabled: bool = true,         # false = identity (no-op scaling for BFloat16)
  ): GradScaler;

  # Returns a no-op scaler suitable for BFloat16 training on TPUs.
  pub static func noOp(): GradScaler;

  # Scale the loss before backward(). Returns loss * current scale.
  pub func scale(loss: Variable): Variable;

  # Unscale gradients and check for inf/NaN. Must call before optimizer.step().
  # Returns true if gradients are finite; false if inf/NaN was detected.
  pub func unscaleAndCheck(params: list[Variable]): bool;

  # Step the optimizer if gradients are finite; skip otherwise.
  # Automatically calls unscaleAndCheck.
  pub func step(optimizer: Optimizer, params: list[Variable]): void;

  # Update the scale factor based on the results of the last step.
  pub func update(): void;

  pub let currentScale: float;
  pub let isEnabled: bool;
}

# ── Mixed-precision training example ────────────────────────────────────────
#
# from loup.tensor  import (Tensor, DType, Backend);
# from loup.autodiff import (Variable, AdamWOptimizer, crossEntropyLoss, GradScaler,
#                            withNoGradAsync, checkpoint);
#
# let scaler = GradScaler.new();
# let opt    = AdamWOptimizer.new(lr=3e-4);
#
# async func trainStep(xBatch: Tensor, yBatch: Tensor): Task[float] {
#   opt.zeroGrad([w1, w2]);
#   // Cast inputs to Float16 for faster GPU matmul; model weights stay Float32
#   let x = Variable.new(xBatch.to(DType.Float16), requiresGrad=false);
#   let logits = checkpoint(forward, [x]);     // checkpoint saves activation memory
#   let loss   = crossEntropyLoss(logits, yBatch);
#   let scaled = scaler.scale(loss);
#   await scaled.backwardAsync();
#   scaler.step(opt, [w1, w2]);
#   scaler.update();
#   return loss.detach().item();
# }
#
# async func evalStep(xBatch: Tensor): Task[Tensor] {
#   return await withNoGradAsync(async func() {
#     let x = Variable.new(xBatch.to(DType.Float16), requiresGrad=false);
#     return forward(x).data;
#   });
# }
```

**Example — two-layer MLP forward and backward pass:**

```loup
from loup.tensor  import (Tensor, DType);
from loup.autodiff import (Variable, AdamOptimizer, crossEntropyLoss);

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

`native.hal` is the hardware abstraction layer for accelerator-agnostic compute. It provides a unified interface over GPUs (all vendors and APIs), TPUs, and other accelerators. Code written against `native.hal` is brand-agnostic: the same Loup program runs on NVIDIA, AMD, Apple, Intel, and Google TPU hardware without modification. Backend-specific capabilities are accessible via feature flags (§21.32.3) without breaking the abstraction.

```loup
namespace native.hal;

# An opaque representation of a tensor computation graph submitted to an accelerator.
# `ComputeGraph` values are produced internally by `loup.tensor` when operations are
# enqueued on a device-backed Tensor. Users do not construct `ComputeGraph` values
# directly — they are produced by `loup.tensor` and consumed by `AcceleratorDevice`.
class ComputeGraph : Any {
  pub let opCount: int;            # number of operations in the graph
  pub let inputCount: int;         # number of input buffers required
  pub let outputCount: int;        # number of output buffers produced
  pub let label: string;           # debug label, derived from source location
}
```

---

### §21.32.1 `AcceleratorDevice` Interface

`AcceleratorDevice` is the universal handle for any compute accelerator. Both `native.webgpu.GpuDevice` and `native.tpu.TpuDevice` implement this interface.

```loup
namespace native.hal;

# Universal handle for a compute accelerator (GPU or TPU).
interface AcceleratorDevice {
  # Descriptor for this device (read-only).
  func descriptor(): AcceleratorDescriptor;

  # Feature flags for this device.
  func features(): AcceleratorFeatures;

  # Memory availability. Returns advisory figures on some platforms.
  func memoryInfo(): AcceleratorMemoryInfo;

  # Submit a tensor computation graph to this device.
  # loup.tensor uses this interface internally.
  func submitGraph(graph: ComputeGraph): Task[void];

  # Whether this device is currently available (not lost/disconnected).
  func isAvailable(): bool;

  # Wait until all submitted work on this device is complete.
  func waitIdle(): Task[void];
}

# Backed by native.webgpu.GpuDevice, native.tpu.TpuDevice, or a CPU emulation.
# native.webgpu.GpuDevice and native.tpu.TpuDevice both explicitly declare
# `implements AcceleratorDevice` in their respective sections (§21.29, §21.32.1).
# Interface satisfaction in Loup is always nominal — there is no implicit or
# structural satisfaction. See §1-11.1.
```

---

### §21.32.2 `AcceleratorBuffer[T]` Interface

`AcceleratorBuffer[T]` is the unified buffer type. `native.gpu.GpuBuffer[T]` and `native.tpu.TpuBuffer[T]` both implement it.

```loup
namespace native.hal;

interface AcceleratorBuffer[T] : Closeable {
  # Number of elements of type T.
  func size(): int;

  # Byte size of the buffer.
  func byteSize(): int;

  # Device this buffer is allocated on.
  func device(): AcceleratorDevice;

  # Copy buffer contents to host as a list.
  func copyToHost(): Task[list[T]];

  # Upload data from host list, overwriting buffer contents.
  func copyFromHost(data: list[T]): Task[void];

  # Zero-copy read access to the buffer's raw bytes. Only available on devices where
  # `AcceleratorFeatures.hasUnifiedMemory()` is `true` (e.g. Apple Silicon, many
  # integrated GPUs, some TPU configurations). On discrete GPUs and Cloud TPUs this
  # method throws `CapabilityError` at runtime — use `copyToHost()` instead.
  # The returned `bytes` reference is valid only while this buffer is live;
  # retaining it past `close()` is undefined behaviour on unified-memory targets.
  func rawBytes(): bytes;

  # Whether the buffer is still valid (not closed/freed).
  func isValid(): bool;

  func close(): void;
}
```

---

### §21.32.3 `AcceleratorFeatures` — Feature Inspection

`AcceleratorFeatures` provides a structured, brand-agnostic API for inspecting hardware capabilities. Feature names are standardised across vendors; vendor-specific features use a namespaced string form.

```loup
namespace native.hal;

class AcceleratorFeatures : Any {
  # Standardised capability tests (brand-agnostic):
  pub func hasFp16(): bool;         # native Float16 compute (not emulated)
  pub func hasBf16(): bool;         # native BFloat16 compute
  pub func hasInt8(): bool;         # native Int8 compute (quantised inference)
  pub func hasInt4(): bool;         # native Int4 support (NVIDIA Hopper+ / TPU v5)
  pub func hasTensorCores(): bool;  # matrix-multiply accelerator hardware
  pub func hasNvlink(): bool;       # GPU-to-GPU NVLink interconnect
  pub func hasPeerAccess(): bool;   # P2P device memory access to other devices
  pub func hasUnifiedMemory(): bool;# CPU/GPU share physical memory (Apple Silicon, some TPUs)
  pub func hasRayTracing(): bool;   # hardware ray tracing (GPU only)

  # Feature query by standardised string flag:
  #   "fp16", "bf16", "int8", "int4", "tensor_cores", "nvlink",
  #   "peer_access", "unified_memory", "ray_tracing",
  #   "tpu.megacore", "tpu.hbm2", "tpu.hbm3", "tpu.ici"
  pub func has(feature: string): bool;

  # Vendor-namespaced feature query (not standardised, may differ across versions):
  #   "cuda.sm_89", "cuda.cooperative_groups", "metal.family7",
  #   "tpu.v4", "tpu.topology_2x2x4", "vulkan.subgroup_size_64"
  pub func hasVendor(feature: string): bool;

  # All features as a list of standardised flag strings.
  pub func standardFlags(): list[string];

  # All vendor-specific flags.
  pub func vendorFlags(): list[string];
}
```

---

### §21.32.4 `DeviceDescriptor` and `DeviceRegistry`

`DeviceDescriptor` is the read-only metadata struct for an accelerator. `DeviceRegistry` is the runtime database of all installed and detected hardware.

```loup
namespace native.hal;

# Hardware kind
enum AcceleratorKind { Gpu; Tpu; Cpu; }

# Vendor identifier — normalised regardless of driver string variations.
enum VendorId {
  Nvidia;     # NVIDIA Corporation
  Amd;        # Advanced Micro Devices
  Intel;      # Intel Corporation
  Apple;      # Apple Inc. (Apple Silicon GPU/Neural Engine)
  Google;     # Google LLC (Cloud TPU, Coral Edge TPU)
  Qualcomm;   # Qualcomm (Adreno GPU, Hexagon NPU)
  Arm;        # Arm Holdings (Mali GPU)
  Unknown;    # unrecognised vendor
}

struct AcceleratorDescriptor {
  id: string;              # unique stable ID within this installation: "accelerator:0"
  kind: AcceleratorKind;
  vendor: VendorId;
  model: string;           # human-readable model name: "NVIDIA GeForce RTX 4090"
  driverVersion: string;   # vendor driver version string
  deviceMemoryBytes: int;  # VRAM / HBM / unified memory size
  backendPackage: string;  # e.g. "loup.backend.cuda", "loup.backend.tpu.cloud"
  backendVersion: string;  # installed backend package version
  computeUnits: int;       # SM count (GPU) or core count (TPU/CPU)
  clockRateKhz: int;       # peak clock rate (advisory)
  pciBusId: string?;       # "0000:01:00.0" — absent for integrated/virtual devices
}

struct AcceleratorMemoryInfo {
  totalBytes: int;
  freeBytes: int;
  usedBytes: int;
}

class DeviceRegistry : Any {
  # Singleton registry initialised from hardware.lock on first access.
  pub static func default(): DeviceRegistry;

  # All detected and installed devices, in hardware.lock order.
  pub func list(): list[AcceleratorDevice];

  # Filter by kind or vendor.
  pub func listGpus(): list[AcceleratorDevice];
  pub func listTpus(): list[AcceleratorDevice];
  pub func listByVendor(vendor: VendorId): list[AcceleratorDevice];

  # Look up by stable ID from hardware.lock.
  pub func get(id: string): Option[AcceleratorDevice];

  # Return the highest-priority device for a given backend hint.
  # If backend is Backend.Auto, applies HAL priority order.
  pub func preferredDevice(backend: loup.tensor.Backend = loup.tensor.Backend.Auto): AcceleratorDevice;

  # Return the preferred device for the given tensor dtype.
  # e.g. preferredDeviceForDtype(DType.BFloat16) returns a TPU or Ampere+ GPU.
  pub func preferredDeviceForDtype(dtype: loup.tensor.DType): AcceleratorDevice;

  # True if any device with the given backend is available.
  pub func hasBackend(backend: loup.tensor.Backend): bool;

  # Re-scan hardware.lock. Call after loup hardware detect / loup hardware compile.
  pub func refresh(): void;

  # Descriptors for all registered devices.
  pub func descriptors(): list[AcceleratorDescriptor];
}
```

**Example — brand-agnostic device selection:**

```loup
from native.hal import (DeviceRegistry);
from loup.tensor import (Tensor, DType, Backend);

let registry = DeviceRegistry.default();

# Prefer TPU if available; fall back to GPU; final fallback is CPU.
let device = registry.preferredDevice(Backend.Tpu)
          ?? registry.preferredDevice(Backend.Auto);

# Log what we got — same code regardless of hardware
print("Using: {$ device.descriptor().vendor $} {$ device.descriptor().model $}");
print("BF16:  {$ device.features().hasBf16() $}");
print("VRAM:  {$ device.descriptor().deviceMemoryBytes / 1_073_741_824 $} GB");

# Place tensors on it
let x = Tensor.randn([1024, 1024]).toDevice(device);
let y = Tensor.randn([1024, 1024]).toDevice(device);
let z = x.matmul(y).eval();
```

---

### §21.32.5 `DevicePool` — Multi-Device Management

`DevicePool` manages a set of devices for data-parallel workloads. It does not automatically shard tensors — that is the programmer's responsibility. It provides a structured way to submit independent work items to multiple devices concurrently.

```loup
namespace native.hal;

class DevicePool : Any {
  # Create a pool containing all devices matching the filter.
  pub static func allGpus(): DevicePool;
  pub static func allTpus(): DevicePool;
  pub static func all(): DevicePool;     # GPUs + TPUs, HAL priority order
  pub static func from(devices: list[AcceleratorDevice]): DevicePool;

  pub let devices: list[AcceleratorDevice];
  pub let size: int;

  # Submit `count` work items, one per device. body(device, index) is called
  # for each device in parallel. Returns a list of results in device order.
  pub func scatter[T: Sendable](
    count: int,
    body: fn(AcceleratorDevice, int): Task[T],
  ): Task[list[T]];

  # Scatter a list of data items — one item per device.
  pub func scatterData[T: Sendable, R: Sendable](
    data: list[T],
    body: fn(AcceleratorDevice, T): Task[R],
  ): Task[list[R]];

  # Wait for all devices to be idle.
  pub func waitAll(): Task[void];
}
```

**Example — data-parallel inference across all GPUs:**

```loup
from native.hal import (DevicePool);

let pool = DevicePool.allGpus();
print("Running across {$ pool.size $} GPUs");

# Split a batch across GPUs and collect results
let batchShards: list[Tensor] = splitBatch(fullBatch, pool.size);

let results = await pool.scatterData(batchShards, async func(device, shard) {
  let x = shard.toDevice(device);
  return await withNoGradAsync(async func() => forward(x).data);
});

let combined = concat(results, axis=0);
```

---

### §21.32.6 `hardware.lock` File Format

`hardware.lock` is a TOML file written by `loup hardware detect` (§1-20.9) and read by `DeviceRegistry.default()`. It records the currently compiled hardware backends and their associated device metadata. It is committed to version control **only** for reproducible CI environments; most projects should `.gitignore` it and regenerate on each machine.

```toml
# hardware.lock — generated by `loup hardware detect`
# DO NOT edit manually.

schema_version = "1.0"
loup_version   = "1.9.0"
detected_at    = "2026-04-08T12:00:00Z"

[[devices]]
id              = "accelerator:0"
kind            = "Gpu"
vendor          = "Nvidia"
model           = "NVIDIA GeForce RTX 4090"
driver_version  = "545.29.06"
device_memory_bytes = 25769803776
backend_package = "loup.backend.cuda"
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
backend_package = "loup.backend.vulkan"
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
backend_package = "loup.backend.tpu.cloud"
backend_version = "0.4.2"
compiled_at     = "2026-04-08T12:02:00Z"
compute_units   = 2          # MegaCore count
clock_rate_khz  = 1050000
features        = ["bf16", "int8", "tpu.megacore", "tpu.hbm2", "tpu.ici"]
```

**Stale detection.** `DeviceRegistry` considers a backend stale and emits a warning when:
- `loup_version` in `hardware.lock` differs from the running Loup version.
- The `backend_package` version does not match the installed package version in `loup.lock`.
- The device listed in `hardware.lock` is no longer physically present (detected via driver probe).

Run `loup hardware compile --force` to regenerate stale entries.

---


---

## §21.33 `native.tpu` — Low-Level TPU Dispatch

*(This section is normative. Available on `@compiled --target native` only. Requires `loup.backend.tpu.*` to be installed (§3-4.3).)*

`native.tpu` provides typed Loup facades for direct TPU kernel authoring and device management. Most users should use `loup.tensor` with `Backend.Tpu` instead. Use `native.tpu` when you need direct XLA/StableHLO control, custom TPU kernels, or explicit TPU memory management.

```loup
namespace native.tpu;
```

---

### §21.33.1 `TpuDevice`

`TpuDevice` implements `native.hal.AcceleratorDevice` and represents a single logical TPU device (which may be a Cloud TPU slice, an Edge TPU chip, or a PJRT device).

```loup
namespace native.tpu;

class TpuDevice : Any implements native.hal.AcceleratorDevice {
  # Device metadata
  pub func descriptor(): native.hal.AcceleratorDescriptor;
  pub func features(): native.hal.AcceleratorFeatures;
  pub func memoryInfo(): native.hal.AcceleratorMemoryInfo;
  pub func isAvailable(): bool;
  pub func waitIdle(): Task[void];

  # HBM/device memory statistics (advisory on some TPU generations)
  pub func hbmTotalBytes(): int;
  pub func hbmFreeBytes(): int;

  # Platform type — use for conditional feature paths, not for primary dispatch logic
  pub let platform: TpuPlatform;

  # Enumerate all available TPU devices visible to this process.
  pub static func list(): list[TpuDevice];
  pub static func get(index: int): TpuDevice;

  # Compile a StableHLO or HLO program for this device.
  pub func compile(program: TpuProgram): Task[TpuKernel];

  # Synchronize all pending TPU operations to this device.
  pub func synchronize(): Task[void];
}

# TPU hardware platform — use feature flags (AcceleratorFeatures) for branching;
# use TpuPlatform only when platform identity is essential (e.g. libtpu vs. PJRT API surface).
enum TpuPlatform {
  CloudV2;    # Google Cloud TPU v2 (128 GiB HBM total, systolic)
  CloudV3;    # Google Cloud TPU v3 (256 GiB HBM total, bf16)
  CloudV4;    # Google Cloud TPU v4 (MegaCore, 32 GiB HBM per chip)
  CloudV5;    # Google Cloud TPU v5 (int4/int8, 96 GiB HBM per chip)
  CoralEdge;  # Google Coral Edge TPU (4 TOPS, 8 MB on-chip SRAM)
  PjRt;       # Generic PJRT plugin (covers third-party TPU-like accelerators)
  Unknown;
}
```

---

### §21.33.2 `TpuBuffer[T]`

`TpuBuffer[T]` implements `native.hal.AcceleratorBuffer[T]` and represents a typed tensor allocated in TPU HBM (or Edge TPU SRAM).

```loup
namespace native.tpu;

class TpuBuffer[T] : Any implements native.hal.AcceleratorBuffer[T] {
  # AcceleratorBuffer[T] implementation
  pub func size(): int;
  pub func byteSize(): int;
  pub func device(): native.hal.AcceleratorDevice;
  pub func copyToHost(): Task[list[T]];
  pub func copyFromHost(data: list[T]): Task[void];
  pub func rawBytes(): bytes;
  pub func isValid(): bool;
  pub func close(): void;

  # Allocate an uninitialised buffer on `device`.
  pub static func alloc(size: int, device: TpuDevice): TpuBuffer[T];

  # Allocate and fill from host data.
  pub static func fromList(data: list[T], device: TpuDevice): Task[TpuBuffer[T]];

  # Wrap a loup.tensor.Tensor's evaluated TPU buffer without copying.
  # The Tensor must already be evaluated on `device`.
  pub static func fromTensor(t: loup.tensor.Tensor): TpuBuffer[T];

  # Create a loup.tensor view over this buffer.
  pub func toTensor(shape: loup.tensor.Shape, dtype: loup.tensor.DType): loup.tensor.Tensor;
}
```

---

### §21.33.3 `TpuKernel` and StableHLO Fence Descriptors

TPU kernels are compiled from StableHLO (the stable serialisation format for XLA computations) or from its predecessor HLO text format.

```loup
namespace native.tpu;

# A pre-compiled TPU executable — the result of TpuDevice.compile().
class TpuKernel : Any {
  pub let label: string;

  # Execute the kernel asynchronously on the specified stream.
  # inputs: input TpuBuffer list in argument order.
  # returns: output TpuBuffer list in result order.
  pub func run(
    inputs: list[native.hal.AcceleratorBuffer[Any]],
    stream: TpuStream? = None,
    label: string = "",
  ): Task[list[TpuBuffer[Any]]];
}

# A compilation unit: StableHLO or HLO module text.
class TpuProgram : Any {
  pub let source: string;
  pub let format: TpuProgramFormat;
  pub let label: string;

  pub static func fromStableHlo(source: string, label: string = ""): TpuProgram;
  pub static func fromHlo(source: string, label: string = ""): TpuProgram;
}

enum TpuProgramFormat { StableHlo; Hlo; }

# Compile errors
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

**`stablehlo` and `hlo` fence descriptors.** Two GPU-compute-fence-style descriptors are provided for authoring TPU programs inline in Loup source. These produce `TpuProgram` values rather than `string` templates.

```loup
# stablehlo fence — produces a TpuProgram value directly (format=StableHlo).
# Assign directly; do NOT wrap in TpuProgram.fromStableHlo() — that constructor
# accepts a string, but the fence already evaluates to a TpuProgram.
# {$ expr $} interpolations inject compile-time integer or float constants.
let addProg: TpuProgram = ```(stablehlo):(none)
  func.func @add(%arg0: tensor<1024xf32>, %arg1: tensor<1024xf32>)
      -> tensor<1024xf32> {
    %0 = stablehlo.add %arg0, %arg1 : tensor<1024xf32>
    func.return %0 : tensor<1024xf32>
  }
```;

# Compile and run on the first available TPU:
let tpu    = TpuDevice.list()[0];
let kernel = await tpu.compile(addProg);
let result = await kernel.run([aBuffer, bBuffer]);
```

**Rules for StableHLO fences:**
- Only compile-time constant `int`, `float32`, and `bool` expressions are valid in `{$ expr $}` interpolations.
- Fence bodies must be valid StableHLO (v1.7+ uses StableHLO 1.0 serialisation).
- Syntax errors in the fence body are reported at `loup build --check` time; runtime compilation failure throws `TpuCompileError`.
- The `hlo` descriptor follows the same rules but accepts the older HLO text format.

---

### §21.33.4 `TpuStream`

`TpuStream` sequences TPU operations to enable pipelining between compute and memory transfer, equivalent to a CUDA stream on TPU.

```loup
namespace native.tpu;

class TpuStream : Any implements Closeable {
  pub static func new(device: TpuDevice, label: string = ""): TpuStream;

  # Block host until all stream operations complete.
  pub func synchronize(): Task[void];

  # Enqueue an async host-to-device copy on this stream.
  pub func enqueueCopyToDevice[T](src: list[T], dst: TpuBuffer[T]): Task[void];

  # Enqueue an async device-to-host copy on this stream.
  pub func enqueueCopyToHost[T](src: TpuBuffer[T]): Task[list[T]];

  pub func close(): void;
}
```

---

### §21.33.5 Supported TPU Variants

| Variant | `TpuPlatform` | Backend package | Notes |
|---|---|---|---|
| Google Cloud TPU v2/v3/v4/v5 | `CloudV2`–`CloudV5` | `loup.backend.tpu.cloud` | Requires `libtpu` or TPU PJRT plugin; available on GCP |
| Google Coral Edge TPU | `CoralEdge` | `loup.backend.tpu.coral` | USB/PCIe; requires `libedgetpu`; 4 TOPS; Int8 only |
| Generic PJRT device | `PjRt` | `loup.backend.tpu.pjrt` | Third-party TPU-like accelerators via the PJRT C API |

**Edge TPU constraint.** `CoralEdge` devices only support `DType.Int8` and `DType.UInt8` inference. Attempting to dispatch `Float32` or `BFloat16` operations to a Coral device produces a `TpuDispatchError` at runtime (or a compile-time warning if the dtype is statically known).

---


---

## §21.34 `loup.tpu` — High-Level TPU Integration

*(This section is normative. Available on all targets; TPU dispatch requires `loup.backend.tpu.*`.)*

`loup.tpu` integrates the `loup.tensor` / `loup.autodiff` pipeline with TPU hardware via `native.tpu`. Its primary purpose is to make `loup.tensor` operations run on TPUs transparently — most users need only set `Backend.Tpu` and call `eval()`. Direct `loup.tpu` imports are only needed for advanced TPU-specific control (multi-slice topology, TPU-specific dtypes, PJRT plugin management).

```loup
namespace loup.tpu;

# ── Backend integration ──────────────────────────────────────────────────────

# Ensure the TPU backend is initialised. Called automatically by loup.tensor
# when Backend.Tpu is first used; exposed here for explicit lifecycle control.
func init(platform: native.tpu.TpuPlatform = native.tpu.TpuPlatform.PjRt): void;

# ── Topology — multi-slice / pod-slice TPU configurations ───────────────────

# Represents a TPU pod slice topology (e.g. 2x2x4 on Cloud TPU v4).
class TpuTopology : Any {
  pub let shape: list[int];       # e.g. [2, 2, 4]
  pub let totalChips: int;        # product of shape dimensions
  pub let interchipLinks: string; # "ici" | "dcn" | "none"

  pub static func detect(): Option[TpuTopology];
  pub static func fromShape(shape: list[int]): TpuTopology;
}

# ── PJRT plugin management ────────────────────────────────────────────────────

# Load a PJRT C API plugin from a shared library path.
# Used for third-party accelerators and future TPU generations.
# The plugin must implement the PJRT C API 0.40+ interface.
func loadPjRtPlugin(path: string, options: dict[string, string] = {}): void;
func listPjRtPlugins(): list[string];   # paths of loaded plugins

# ── Utility ──────────────────────────────────────────────────────────────────

# BFloat16 is the native dtype for TPU and should be preferred over Float16
# for training workloads. This helper casts a tensor to BFloat16 and ensures
# it is placed on a TPU-capable device.
func toBf16OnTpu(t: loup.tensor.Tensor, device: native.hal.AcceleratorDevice? = None): loup.tensor.Tensor;
```

**TPU-first training example using `loup.tensor` + `loup.autodiff`:**

```loup
from loup.tensor  import (Tensor, DType, Backend);
from loup.autodiff import (Variable, AdamWOptimizer, crossEntropyLoss, GradScaler);
from native.hal   import (DeviceRegistry);

# ── Device selection — brand-agnostic ──────────────────────────────────────
let registry = DeviceRegistry.default();
let device   = registry.preferredDevice(Backend.Tpu);
              # Falls back to GPU if no TPU, then CPU

print("Accelerator: {$ device.descriptor().model $}");
print("BFloat16:    {$ device.features().hasBf16() $}");

# ── Model weights — BFloat16 for TPU, Float32 fallback ────────────────────
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

### §1-20.9 Hardware Management Commands

*(This section is non-normative.)*

The `loup hardware` command group manages accelerator backend detection, compilation, and registration. These commands are run on the developer's machine (or in a CI/CD environment with physical hardware) to build the native backend binaries that `DeviceRegistry` loads at runtime.

```
loup hardware detect
```
Scans the system for installed GPUs and TPUs. Updates `hardware.lock` with all detected devices and their available backend packages. Does not compile any backends — run `loup hardware compile` after detection to build them.

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
loup hardware list
```
Display all devices in `hardware.lock` with their compilation status:

```
accelerator:0  GPU  NVIDIA  RTX 4090       loup.backend.cuda    12.3.1  ✓ compiled
accelerator:1  GPU  AMD     RX 7900 XTX    loup.backend.vulkan  1.3.0   ✓ compiled
accelerator:2  TPU  Google  Cloud TPU v4   loup.backend.tpu.cloud 0.4.2 ✓ compiled
```

`!` marks a stale backend (backend package version changed since `hardware.lock` was written).
`?` marks a device that was in `hardware.lock` but is no longer detected.

---

```
loup hardware compile [--device <id>] [--force] [--backend <package>]
```
Compile backend binaries for all detected devices (or a specific device by `hardware.lock` id).

- `--device accelerator:0` — compile only the named device.
- `--force` — recompile even if the compiled artifact is already up-to-date.
- `--backend loup.backend.cuda` — compile the named backend package specifically.
- `--jobs N` — parallel compilation (default: number of CPU cores).

Compilation:
1. Reads `hardware.lock` to find which backend package applies to each device.
2. Fetches the backend package from the registry if not installed.
3. Runs the backend package's `build.loup` script (§3-4.2), which invokes the vendor SDK (CUDA Toolkit, Vulkan SDK, etc.) to produce `.so`/`.dylib`/`.dll` artifacts.
4. Validates the artifacts by probing `DeviceRegistry` against them.
5. Updates `hardware.lock` with the new `compiled_at` timestamp and `backend_version`.

---

```
loup hardware add <backend-package>[@version]
```
Manually install a specific backend package without requiring `loup hardware detect`. Useful for installing a backend for hardware that is not physically present (e.g. preparing a Docker image for deployment to a TPU host).

```sh
loup hardware add loup.backend.tpu.cloud@0.4.2
loup hardware add loup.backend.cuda@12.3.1
loup hardware add loup.backend.tpu.coral
```

After `add`, run `loup hardware compile --backend <package>` to build the artifacts.

---

```
loup hardware remove <backend-package>
```
Uninstall a backend package and remove its entries from `hardware.lock`.

---

```
loup hardware status
```
Print a diagnostic summary:
- Loup version and `hardware.lock` schema version.
- Total devices detected, compiled, and stale.
- Whether `DeviceRegistry.default()` will succeed.
- Any devices present in the system that are not in `hardware.lock` (hint to run `detect`).

---

**Environment variables:**

| Variable | Effect |
|---|---|
| `LOUP_HARDWARE_LOCK` | Override path to `hardware.lock` (default: `.loup/hardware.lock`) |
| `PJRT_PLUGIN_PATH` | Colon-separated paths to PJRT C API plugin shared libraries |
| `LOUP_GPU_BACKEND` | Override default GPU backend: `wgpu`, `cuda`, `metal`, `vulkan` |
| `LOUP_TPU_BACKEND` | Override TPU backend: `cloud`, `coral`, `pjrt` |
| `LOUP_ACCELERATOR_DISABLE` | Comma-separated device IDs to exclude from `DeviceRegistry` |


---

---

## §21.35 `native.window` — Native Windowing and Surface

> **Superseded (v1.21; Loup Common UI program decision M11, ruled 2026-11-03).** `native.window` was never
> implemented, and the UI backend contract replaces it: a window, its events and its pixels are WindowHost,
> EventSource and the surface of `loup-ui-backend-contract.md` (§B.6, §B.2, §B.4), reached only through
> `runtime.ui.desktop()` (Runtime §2-4.8), and the application's window is `loup.ui.desktop.Window`. The text below is
> the v1.20 design, kept for reference and not part of v1 conformance. `specs/3-stdlib-5-native-window/design.md` maps
> each of its names to its home, or records that it has none in v1. One code survives:
> `E_WINDOW_NOT_MAIN_THREAD` (§21.35.4) is what a macOS or Windows backend's `open(grant)` returns off the main
> thread (`specs/1-bootstrap-5-hosted-ui-toolchain/`).

*(This section is normative. Available on `@mode(host.native)`, `@mode(host.dual)` (native side), and `@mode(web.compiled)` (with a canvas-backed surface). Not available in `@mode(host.scripted)` standalone, `@mode(freestanding)`, or `@mode(web.scripted)`.)*

`native.window` provides bare OS windows and the surface handles needed to drive WebGPU swap chains, without coupling to the retained-mode UI system in `ui.desktop` (§2-4.8). It is the runtime layer beneath game engines, real-time visualisation tools, video-decoded compositors, and any program that needs a window plus a swap chain.

**Distinction from `ui.desktop.Window`.** `ui.desktop.Window` is a *retained-mode UI mount target* — it is created by `ui.desktop.createWindow` and accepts a `View` via `mount(view, window)`. `native.window.Window` is a *bare OS window* with no view, no widget tree, no automatic redraws, and no event-loop integration with the UI signal graph. The two types do not interconvert; an application that wants both retained-mode UI and a custom render surface within one window must use `ui.desktop.Window` and the implementation-defined desktop backend's Canvas primitive (§2-4.6), accepting whatever rendering technology the backend selects. *(Superseded in v1.21: Runtime §2-4.8 no longer has an implementation-defined renderer, and the `ui` fence's `Canvas` has no v1 element, §2-4.6.)*

```loup
namespace native.window;

pub class Window : Any implements Closeable {
  pub var title: string;
  pub let id: int;                      # stable id within the process

  # Dimensions: physical pixels. dpiScale lets the program compute logical
  # size = width / dpiScale.
  pub let width: int;
  pub let height: int;
  pub let dpiScale: float;

  pub var resizable: bool;
  pub var fullscreen: bool;
  pub var visible: bool;

  # Acquire a WebGPU surface backed by this window. The surface remains
  # valid for the lifetime of the window; closing either invalidates the
  # pair. On browser targets, this method is unavailable — use
  # GpuSurface.fromCanvas(canvasId) directly.
  pub func nativeSurface(): native.webgpu.GpuSurface;

  # Window manipulation
  pub func setSize(width: int, height: int): void;
  pub func setMinSize(width: int, height: int): void;
  pub func setMaxSize(width: int, height: int): void;
  pub func setCursorVisible(visible: bool): void;
  pub func setCursorGrabbed(grabbed: bool): void;
  pub func setIcon(rgba: bytes, width: int, height: int): void;
  pub func requestRedraw(): void;

  # Synchronous redraw fence: returns after the next vsync interval on
  # the platform's primary display. Used to align CPU-side simulation
  # with the display refresh when not using a swap chain.
  pub async func waitForVsync(): Task[void];

  pub func close(): void;
}

pub struct WindowConfig {
  title: string = "Loup Application";
  width: int = 1280;
  height: int = 720;
  minWidth: int? = None;
  minHeight: int? = None;
  maxWidth: int? = None;
  maxHeight: int? = None;
  resizable: bool = true;
  fullscreen: bool = false;
  visible: bool = true;
  decorations: bool = true;
  transparent: bool = false;             # requires platform support
  alwaysOnTop: bool = false;
  position: WindowPosition = WindowPosition.Centered;
  iconRgba: bytes? = None;               # optional initial icon
  iconWidth: int = 0;
  iconHeight: int = 0;
}

pub enum WindowPosition {
  Centered;
  At(x: int, y: int);
  Default;                               # window-manager default placement
}

pub func createWindow(cfg: WindowConfig = WindowConfig()): Window;

# Process-wide event loop facilities.
#
# Loup does not impose an event-loop architecture. The two supported
# patterns are:
#
#   1. Polling — pollEvent() returns Some(ev) if an event is queued,
#      None otherwise. Suitable for tight render loops where the program
#      always advances regardless of input.
#
#   2. Blocking — waitEvent() suspends until an event is available.
#      Suitable for UI-driven applications and editor tools.
#
# Both pull from the same per-process queue. On native targets, OS-specific
# message pumps are run on whichever thread first calls into `native.window`;
# that thread is the "main thread" for the lifetime of the process. Window
# creation and event polling on non-main threads is a runtime error
# (E_WINDOW_NOT_MAIN_THREAD).
pub func pollEvent(): Option[Event];
pub async func waitEvent(): Task[Event];
pub func pumpEvents(): void;             # drain all queued events without returning them
pub func postWakeup(): void;             # wake a parked waitEvent() from any thread
```

### Event Model

```loup
pub enum Event {
  # Window lifecycle
  CloseRequested(windowId: int);
  Resized(windowId: int, width: int, height: int);
  Moved(windowId: int, x: int, y: int);
  FocusGained(windowId: int);
  FocusLost(windowId: int);
  ScaleChanged(windowId: int, dpiScale: float);
  RedrawRequested(windowId: int);

  # Keyboard
  KeyDown(windowId: int, key: Key, scancode: int, modifiers: KeyModifiers, repeat: bool);
  KeyUp(windowId: int, key: Key, scancode: int, modifiers: KeyModifiers);
  TextInput(windowId: int, text: string);

  # Mouse
  MouseMoved(windowId: int, x: float, y: float, dx: float, dy: float);
  MouseDown(windowId: int, button: MouseButton, x: float, y: float, modifiers: KeyModifiers);
  MouseUp(windowId: int, button: MouseButton, x: float, y: float, modifiers: KeyModifiers);
  MouseWheel(windowId: int, dx: float, dy: float);
  MouseEntered(windowId: int);
  MouseLeft(windowId: int);

  # Touch (mobile and touchscreen)
  TouchBegan(windowId: int, fingerId: int, x: float, y: float);
  TouchMoved(windowId: int, fingerId: int, x: float, y: float);
  TouchEnded(windowId: int, fingerId: int, x: float, y: float);
  TouchCancelled(windowId: int, fingerId: int);

  # Gamepad (see §21.35.1 below)
  GamepadConnected(gamepadId: int, name: string);
  GamepadDisconnected(gamepadId: int);
  GamepadButton(gamepadId: int, button: GamepadButton, pressed: bool);
  GamepadAxis(gamepadId: int, axis: GamepadAxis, value: float);

  # Custom user-posted event
  UserEvent(payload: int);
}

pub struct KeyModifiers {
  shift: bool = false;
  ctrl: bool = false;
  alt: bool = false;
  meta: bool = false;                    # Cmd on macOS, Win on Windows, Super on X11
}

pub enum MouseButton { Left; Right; Middle; X1; X2; Other(button: int); }

pub enum Key {
  # Letters and digits
  A; B; C; D; E; F; G; H; I; J; K; L; M; N; O; P; Q; R; S; T; U; V; W; X; Y; Z;
  Num0; Num1; Num2; Num3; Num4; Num5; Num6; Num7; Num8; Num9;

  # Function keys
  F1; F2; F3; F4; F5; F6; F7; F8; F9; F10; F11; F12;

  # Editing and navigation
  Escape; Enter; Tab; Backspace; Space; Delete; Insert; Home; End; PageUp; PageDown;
  ArrowUp; ArrowDown; ArrowLeft; ArrowRight;

  # Modifier keys (also reflected in KeyModifiers)
  ShiftLeft; ShiftRight; ControlLeft; ControlRight;
  AltLeft; AltRight; MetaLeft; MetaRight;

  # Punctuation
  Minus; Equals; LeftBracket; RightBracket; Backslash; Semicolon; Apostrophe;
  Comma; Period; Slash; Backtick;

  # Numpad
  Numpad0; Numpad1; Numpad2; Numpad3; Numpad4; Numpad5; Numpad6; Numpad7; Numpad8; Numpad9;
  NumpadDecimal; NumpadAdd; NumpadSubtract; NumpadMultiply; NumpadDivide; NumpadEnter;

  # Lock and system
  CapsLock; NumLock; ScrollLock; PrintScreen; Pause;

  # Unknown / platform-specific
  Unknown(scancode: int);
}
```

### §21.35.1 Gamepad Subsystem

```loup
pub enum GamepadButton {
  A; B; X; Y;                            # face buttons (Xbox layout naming)
  LeftBumper; RightBumper;
  LeftTrigger; RightTrigger;             # digital threshold trigger; use Axis for analog
  Back; Start; Guide;
  LeftStick; RightStick;                 # stick click
  DPadUp; DPadDown; DPadLeft; DPadRight;
  Other(button: int);
}

pub enum GamepadAxis {
  LeftStickX; LeftStickY;
  RightStickX; RightStickY;
  LeftTrigger; RightTrigger;             # 0.0..1.0
  Other(axis: int);
}

pub class Gamepad : Any {
  pub let id: int;
  pub let name: string;
  pub let isConnected: bool;
  pub func axis(axis: GamepadAxis): float;     # current value
  pub func isPressed(button: GamepadButton): bool;
  pub func setRumble(lowFreq: float, highFreq: float, durationMs: int): void;
}

pub func connectedGamepads(): list[Gamepad];
pub func gamepad(id: int): Option[Gamepad];
```

### §21.35.2 Clipboard

```loup
pub func clipboardText(): string?;             # None if clipboard empty or non-text
pub func setClipboardText(text: string): void;
```

### §21.35.3 Platform Backend Mapping

| Target | Window backend | Surface mapping |
|---|---|---|
| `linux` (`x86_64`, `aarch64`) | Wayland (`xdg-shell`) preferred, X11 (`xcb`) fallback | `VkSurfaceKHR` via `wgpu-native` |
| `macos` (`x86_64`, `arm64`) | Cocoa (`NSWindow`) | `CAMetalLayer` via `wgpu-native` Metal backend |
| `windows` (`x86_64`) | Win32 (`HWND`) | `VkSurfaceKHR` (Vulkan) or `IDXGISwapChain` (D3D12) via `wgpu-native` |
| `ios`, `android` | Platform-native view (`UIView` / `ANativeWindow`) | Metal / Vulkan via `wgpu-native` |
| `browser` (Wasm) | HTML `<canvas>` referenced by id | `GPUCanvasContext` via WebGPU API |

The Wayland/X11 selection on Linux is at runtime; programs that require a specific protocol should set the environment variable `LOUP_WINDOW_BACKEND=wayland|x11`. Falling back to X11 emits an `info`-level log message.

### §21.35.4 Error Codes

| Code | Condition |
|---|---|
| `E_WINDOW_NOT_MAIN_THREAD` | `createWindow` or `pollEvent` called from a non-main thread |
| `E_WINDOW_BACKEND_UNAVAILABLE` | No supported window backend present (e.g., no display server on a headless Linux host) |
| `E_WINDOW_SURFACE_LOST` | `nativeSurface()` called after the window was closed |
| `E_WINDOW_INVALID_ICON` | `iconRgba` size does not match `iconWidth * iconHeight * 4` |
| `E_WINDOW_DPISCALE_UNAVAILABLE` | `dpiScale` queried on a platform that does not expose per-window scale |

`E_WINDOW_NOT_MAIN_THREAD` is a runtime error (`WindowError` extends `RuntimeError`, §1-18.1). The other error codes correspond to specific `WindowError` subclasses with descriptive payload fields.

### §21.35.5 Engine Use Patterns (non-normative)

Two patterns are common in real-time programs built on `native.window`:

**Frame-paced render loop (game / visualization):**

```loup
let window = createWindow(WindowConfig(title: "Loup Engine Demo", width: 1920, height: 1080))
let surface = window.nativeSurface()
let device = await native.webgpu.GpuDevice.request()
surface.configure(GpuSurfaceConfiguration(device: device, format: GpuTextureFormat.Bgra8Unorm,
                                          width: window.width, height: window.height))

var running = true
while (running) {
  # Drain queued events
  while (let ev = pollEvent()) {
    match ev {
      Event.CloseRequested(_) => { running = false; }
      Event.Resized(_, w, h) => {
        surface.configure(GpuSurfaceConfiguration(device: device, format: GpuTextureFormat.Bgra8Unorm,
                                                  width: w, height: h))
      }
      Event.KeyDown(_, key: Key.Escape, _, _, _) => { running = false; }
      _ => {}
    }
  }

  let frame = surface.getCurrentTexture()
  let encoder = device.createCommandEncoder()
  let pass = encoder.beginRenderPass(GpuRenderPassDescriptor(
    colorAttachments: [GpuColorAttachment(view: frame.view, loadOp: GpuLoadOp.Clear,
                                          storeOp: GpuStoreOp.Store,
                                          clearValue: [0.1, 0.1, 0.15, 1.0])]
  ))
  # ... pass.setPipeline, draw, etc ...
  pass.end()
  device.queue.submit([encoder.finish()])
}
```

**Event-driven loop (editor / tool):** use `waitEvent()` instead of `pollEvent()` and skip the frame-paced rendering when no events have arrived. This is the preferred pattern for tools whose visible state is static between user actions, since it reduces idle CPU and GPU load.

---

---

## §21.36 `native.audio` — Audio Mixer and Voice Graph

*(This section is normative. Available on `@mode(host.native)`, `@mode(host.dual)`, `@mode(web.scripted)`, and `@mode(web.compiled)`. Not available in `@mode(freestanding)` — embedded audio backends are vendor-specific and out of scope for this module.)*

`native.audio` provides a typed facade over platform audio APIs for low-latency sample playback, mixer-bus routing, and basic 3D spatialization. It is engine-grade — sufficient for games, music software, and interactive media — but does not attempt to be a full DAW-class audio engine; advanced DSP (convolution reverb, FFT analysis, ladder filters, plugin hosting) is left to third-party packages built on top of it.

### Architecture

The module exposes a graph-of-nodes model rooted in a single `AudioContext`. The default graph topology is:

```
   AudioSource → ... → AudioBus → ... → AudioBus → context.masterBus → output
                            ↑                ↑
                       (sends to)      (3D positioning via AudioListener)
```

Sources are the leaves (sample players and streaming decoders), buses are intermediate mixing nodes, and the master bus is the single root. Programs may build deeper graphs (e.g., separate `sfx`, `music`, `voice` buses fed into `master`) or flatter ones (single bus) as needed.

### Core Types

```loup
namespace native.audio;

pub class AudioContext : Any implements Closeable {
  pub let sampleRate: int;                       # typically 44100 or 48000
  pub let bufferSize: int;                       # device buffer in frames
  pub let outputChannels: int;                   # 2 (stereo) on most platforms
  pub let listener: AudioListener;
  pub let masterBus: AudioBus;
  pub let state: AudioContextState;

  pub static async func create(cfg: AudioContextConfig = AudioContextConfig()): Task[AudioContext];

  # Lifecycle
  pub async func suspend(): Task[void];
  pub async func resume(): Task[void];
  pub func close(): void;

  # Factory methods
  pub async func decodeAudioData(data: bytes): Task[AudioBuffer];
  pub func createSource(buffer: AudioBuffer): AudioSource;
  pub func createStreamingSource(source: StreamingSourceConfig): StreamingSource;
  pub func createBus(label: string = ""): AudioBus;

  # Process-wide clock — monotonically increasing audio-domain time in
  # seconds. Used for sample-accurate scheduling (source.start(when)).
  pub func currentTime(): float;
}

pub struct AudioContextConfig {
  preferredSampleRate: int? = None;             # None = device default
  preferredBufferSize: int? = None;             # None = device default (low-latency)
  preferredOutputChannels: int = 2;
  latencyHint: AudioLatencyHint = AudioLatencyHint.Interactive;
}

pub enum AudioLatencyHint {
  Interactive;                                   # games, real-time mixing — ~10-30 ms
  Balanced;                                      # general media playback — ~30-100 ms
  Playback;                                      # long-form playback — ~100+ ms
}

pub enum AudioContextState { Suspended; Running; Closed; }
```

### Sample Buffers

```loup
pub class AudioBuffer : Any implements Closeable {
  pub let sampleRate: int;
  pub let channels: int;
  pub let frameCount: int;                       # frames per channel
  pub let durationSec: float;                    # frameCount / sampleRate

  # Static constructors
  pub static async func fromBytes(ctx: AudioContext, data: bytes): Task[AudioBuffer];
  pub static async func fromFile(ctx: AudioContext, path: string): Task[AudioBuffer];

  # Raw PCM construction. `channelData` length must equal `channels`; each
  # inner array must have `frameCount` elements. Samples are float32 in
  # [-1.0, 1.0] range; values outside this range will clip.
  pub static func fromPcm(
      ctx: AudioContext,
      sampleRate: int,
      channelData: list[array[float32, 1]],
  ): AudioBuffer;

  # Read-back. Returns a copy of one channel's samples.
  pub func getChannelData(channel: int): array[float32, 1];

  pub func close(): void;
}
```

Supported decode formats are at minimum WAV (PCM, IEEE float), Ogg Vorbis, and FLAC. MP3, AAC, and Opus are platform-dependent — `decodeAudioData` returns `Some(buffer)` if the format is supported and throws `AudioDecodeError` otherwise. The set of supported formats per platform is queryable via `AudioContext.supportedFormats(): set[string]`.

### Sample-Playback Sources

```loup
pub class AudioSource : Any implements Closeable {
  pub let buffer: AudioBuffer;
  pub let state: AudioSourceState;

  # Routing
  pub func connect(bus: AudioBus): void;
  pub func disconnect(): void;

  # Playback control
  pub func start(whenSec: float = 0.0, offsetSec: float = 0.0,
                 durationSec: float? = None): void;
  pub func stop(whenSec: float = 0.0): void;
  pub func pause(): void;
  pub func resume(): void;

  # Per-source state (all values may be set before start() and updated
  # while playing; changes interpolate over a short ramp to avoid clicks)
  pub var gain: float;                           # linear; 1.0 = unity
  pub var pitch: float;                          # 1.0 = unity; 2.0 = octave up
  pub var loop: bool;
  pub var loopStart: float;                      # in seconds within buffer
  pub var loopEnd: float;                        # 0.0 = end of buffer
  pub var pan: float;                            # -1.0 (left) to 1.0 (right), 0 = center

  # 3D positioning. None = 2D (uses pan only); Some(p) = 3D (uses spatializer)
  pub var panner: AudioPanner?;

  # Event callbacks
  pub var onEnded: fn(): void;

  pub func close(): void;
}

pub enum AudioSourceState { Initial; Playing; Paused; Stopped; }
```

The `start(whenSec, offsetSec, durationSec)` parameters provide sample-accurate scheduling:

- `whenSec = 0.0` plays immediately; `whenSec > currentTime()` schedules a future start.
- `offsetSec` skips into the buffer (e.g., `offsetSec = 1.5` plays from 1.5 s in).
- `durationSec` plays at most that many seconds; `None` plays the full remaining buffer (or loops, if `loop = true`).

A single `AudioSource` is "one-shot" — `start()` can be called at most once per source instance; subsequent calls throw `AudioSourceStateError`. To replay the same buffer, create a new `AudioSource` from the same `AudioBuffer` (the buffer is shared by reference; sources are cheap).

### Streaming Sources

```loup
pub class StreamingSource : Any implements Closeable {
  pub let state: AudioSourceState;
  pub func connect(bus: AudioBus): void;
  pub func disconnect(): void;
  pub func play(): void;
  pub func pause(): void;
  pub func stop(): void;
  pub var gain: float;
  pub var loop: bool;
  pub var panner: AudioPanner?;
  pub var onEnded: fn(): void;
  pub func close(): void;
}

pub struct StreamingSourceConfig {
  # Either source from a file path (decoded on-the-fly by the audio thread),
  # a network URL (decoded as the stream arrives), or a custom decoder
  # callback that returns audio data on demand.
  source: StreamingSourceFrom;
  bufferAheadSec: float = 2.0;                   # decoded look-ahead
}

pub enum StreamingSourceFrom {
  File(path: string);
  Url(url: string);
  Callback(decode: async fn(offsetFrames: int, maxFrames: int): Task[array[float32, 1]]);
}
```

Streaming sources are appropriate for long-form audio (music, dialogue, ambient loops > 30 s) where loading the full buffer into RAM is wasteful. They incur slightly higher CPU than sample sources due to ongoing decode work.

### Mixer Buses

```loup
pub class AudioBus : Any implements Closeable {
  pub let label: string;

  pub var gain: float;                           # master gain for the bus
  pub var pan: float;                            # stereo pan for the bus output

  # Routing — every bus has exactly one output destination; the master bus
  # has no destination (it routes to the device).
  pub func connect(destination: AudioBus): void;
  pub func disconnect(): void;

  # Sends — additional auxiliary routes from this bus to others, with their
  # own per-send gain. Common pattern: a "reverb" bus receives sends from
  # multiple source buses with different send gains.
  pub func addSend(destination: AudioBus, gain: float): SendHandle;
  pub func removeSend(handle: SendHandle): void;

  # Mute/solo state
  pub var muted: bool;

  # Metering — most-recent peak and RMS levels per output channel.
  # Updated by the audio thread at sub-frame granularity; reads are
  # wait-free.
  pub func peakLevel(): list[float];             # per-channel peak in [0, 1]
  pub func rmsLevel(): list[float];              # per-channel RMS in [0, 1]

  pub func close(): void;
}

pub class SendHandle : Any {
  pub var gain: float;
}
```

### 3D Spatialization

```loup
pub class AudioListener : Any {
  pub var position: list[float];                 # [x, y, z], default [0, 0, 0]
  pub var forward: list[float];                  # [x, y, z], default [0, 0, -1]
  pub var up: list[float];                       # [x, y, z], default [0, 1, 0]
  pub var velocity: list[float];                 # [x, y, z], default [0, 0, 0] — for Doppler
}

pub class AudioPanner : Any {
  pub var position: list[float];                 # source position [x, y, z]
  pub var velocity: list[float];                 # for Doppler
  pub var model: AudioDistanceModel;
  pub var refDistance: float;                    # default 1.0
  pub var maxDistance: float;                    # default 10000.0
  pub var rolloffFactor: float;                  # default 1.0
  pub var coneInnerAngle: float;                 # degrees, default 360 (omni)
  pub var coneOuterAngle: float;                 # degrees, default 360
  pub var coneOuterGain: float;                  # default 0.0
  pub var dopplerEnabled: bool;                  # default true
  pub var hrtfEnabled: bool;                     # default false; CPU-heavier
}

pub enum AudioDistanceModel { Linear; Inverse; Exponential; }
```

Distance models follow the WebAudio specification: `Linear` provides
`1 - rolloffFactor * (d - refDistance) / (maxDistance - refDistance)`,
`Inverse` provides `refDistance / (refDistance + rolloffFactor * (d - refDistance))`,
and `Exponential` provides `(d / refDistance)^(-rolloffFactor)` where
`d = max(distance, refDistance)`.

### §21.36.1 Platform Backend Mapping

| Target | Audio backend | Default low-latency buffer |
|---|---|---|
| `linux` | PipeWire preferred, PulseAudio fallback, ALSA direct (last resort) | ~10 ms |
| `macos`, `ios` | CoreAudio (`AudioUnit` / `AVAudioEngine`) | ~5-10 ms |
| `windows` | WASAPI exclusive (lowest latency) or shared mode | ~10-20 ms |
| `android` | AAudio (preferred), OpenSL ES (fallback) | ~15-30 ms |
| `browser` | Web Audio API (`AudioContext` + `AudioWorklet`) | ~20-40 ms |

`LOUP_AUDIO_BACKEND` overrides Linux backend selection (`pipewire`, `pulse`, `alsa`). On Windows, `LOUP_AUDIO_MODE=exclusive` requests exclusive WASAPI; the default is shared mode for compatibility.

### §21.36.2 Error Codes

| Code | Condition |
|---|---|
| `E_AUDIO_DEVICE_UNAVAILABLE` | No usable audio output device on the host |
| `E_AUDIO_FORMAT_UNSUPPORTED` | `decodeAudioData` invoked with an unsupported format |
| `E_AUDIO_SOURCE_STATE` | `start()` called on a non-Initial source, or other illegal transition |
| `E_AUDIO_BUS_CYCLE` | `bus.connect(dest)` would introduce a routing cycle |
| `E_AUDIO_BUFFER_DRAINED` | Custom streaming callback returned an empty buffer before reaching the declared frame count |
| `E_AUDIO_CONTEXT_CLOSED` | Operation invoked on a closed `AudioContext` |

The first three are exception subclasses: `AudioDeviceUnavailableError`,
`AudioDecodeError`, `AudioSourceStateError`. The remaining are
runtime errors (`AudioError` extends `RuntimeError`, §1-18.1).

### §21.36.3 Engine Use Patterns (non-normative)

```loup
from native.audio import (AudioContext, AudioBuffer)

async func main(): Task[void] {
  let audio = await AudioContext.create()

  # Three buses: sfx, music, voice — all routed to master.
  let sfxBus = audio.createBus("sfx")
  let musicBus = audio.createBus("music")
  let voiceBus = audio.createBus("voice")
  sfxBus.connect(audio.masterBus)
  musicBus.connect(audio.masterBus)
  voiceBus.connect(audio.masterBus)

  # Music track (streaming).
  let music = audio.createStreamingSource(StreamingSourceConfig(
    source: StreamingSourceFrom.File("assets/track.ogg"),
  ))
  music.connect(musicBus)
  music.loop = true
  music.play()

  # SFX (one-shot, fully-loaded).
  let zap = await AudioBuffer.fromFile(audio, "assets/zap.wav")
  func playZap(positionXyz: list[float]): void {
    let source = audio.createSource(zap)
    source.connect(sfxBus)
    source.panner = AudioPanner(position: positionXyz)
    source.start()
    source.onEnded = func() { source.close(); }    # free promptly
  }

  # ... game loop ...
}
```

---

## §3-4 Hardware Backend Lifecycle

*(This section is non-normative.)*

This section describes how Loup discovers, compiles, and manages hardware accelerator backends across installation, development, and deployment. The goal is that developers write brand-agnostic compute code using `loup.tensor`, `native.hal`, and `DeviceRegistry` — and the toolchain handles everything below that API boundary.

---

### §3-4.1 Overview

Loup separates two concerns:

1. **The language spec** (`native.hal`, `native.gpu`, `native.tpu`, `loup.tensor`) — vendor-neutral interfaces defined in this document.
2. **Backend packages** (`loup.backend.*`) — first-party packages, each wrapping a vendor SDK, that are compiled after install to produce native shared libraries.

This separation means the Loup compiler itself has no CUDA, Metal, Vulkan, or TPU dependency. Backend packages are ordinary Loup packages that happen to contain a `build.loup` build script and vendor-specific bindings. They are installed via `loup add` and compiled via `loup hardware compile`.

---

### §3-4.2 Backend Package Structure

Each backend package follows this layout:

```
loup.backend.cuda/
  loup.backend.cuda.lppkg       # package manifest
  build.loup                    # hardware compilation script (see §3-4.3)
  src/
    bindings.loup               # @compiled Loup bindings over the CUDA C API
    device.loup                 # CudaDevice, CudaStream, etc.
  lib/
    prebuilt/                   # prebuilt artifacts for common platforms (optional)
      linux_x86_64/
        libloup_backend_cuda.so
      linux_aarch64/
        libloup_backend_cuda.so
```

The `loup.backend.cuda.lppkg` manifest includes a `[hardware]` section:

```toml
[package]
name    = "loup.backend.cuda"
version = "12.3.1"

[hardware]
kind    = "Gpu"
vendor  = "Nvidia"
# Detection probe: shell command that exits 0 if hardware is present.
probe   = "nvidia-smi --query-gpu=name --format=csv,noheader"
# SDK requirement: minimum CUDA Toolkit version.
sdk_min = "12.0"
sdk_env = "CUDA_HOME"         # environment variable pointing to SDK root
build_requires = ["nvcc"]     # tools required on PATH for build.loup
```

---

### §3-4.3 `build.loup` — Backend Compilation Script

`build.loup` is a standard Loup script (§1-2.1 scripted mode) invoked by `loup hardware compile`. It has access to the `loup.cli` script prelude and the `loup.build` module (a future first-party package providing compilation helpers).

```loup
#!/usr/bin/env loup
# build.loup for loup.backend.cuda

from loup.build import (cc, nvcc, link, outDir, sdkPath);
from loup.cli   import (exec, env, args, print);

let cudaHome = sdkPath("CUDA_HOME") ?? "/usr/local/cuda";
let outPath  = outDir();

# Compile the CUDA helper object
nvcc(
  src: "src/loup_cuda_helpers.cu",
  out: i"{$ outPath $}/loup_cuda_helpers.o",
  flags: ["-O3", "-arch=sm_80", "--ptxas-options=-v"],
  includeDirs: [i"{$ cudaHome $}/include"],
);

# Compile the Loup binding source to native
cc(
  src: "src/bindings.loup",
  out: i"{$ outPath $}/bindings.o",
  flags: ["--target", "native", "@compiled"],
);

# Link into a shared library
link(
  objects: [
    i"{$ outPath $}/loup_cuda_helpers.o",
    i"{$ outPath $}/bindings.o",
  ],
  out: i"{$ outPath $}/libloup_backend_cuda.so",
  libs: ["cudart", "cublas", "cufft"],
  libDirs: [i"{$ cudaHome $}/lib64"],
);

print(i"loup.backend.cuda compiled successfully → {$ outPath $}/libloup_backend_cuda.so");
```

`loup hardware compile` executes `build.loup` in a sandboxed subprocess with access only to the filesystem paths declared in the `[hardware]` section's `sdk_env`. The resulting shared library path is recorded in `hardware.lock`.

---

### §3-4.4 Installation Flow

Standard installation on a machine with a CUDA GPU:

```sh
# 1. Install the Loup project dependencies (language packages, not hardware backends)
loup install

# 2. Detect installed hardware and update hardware.lock
loup hardware detect

# 3. Compile backends for all detected hardware
loup hardware compile

# 4. Verify
loup hardware status
# accelerator:0  GPU  NVIDIA  RTX 4090  loup.backend.cuda  12.3.1  ✓ compiled
```

Backends for hardware not present on the machine are skipped. Backend packages are added to `loup.lock` only if `loup add loup.backend.cuda` is called explicitly, or if a project's `.lppkg` declares them as dev-dependencies:

```toml
[dev-dependencies]
"loup.backend.cuda"  = "^12"
"loup.backend.vulkan" = "^1.3"
"loup.backend.tpu.cloud" = "^0.4"
```

When `dev-dependencies` include backend packages, `loup install` downloads their source. `loup hardware compile` then builds them if the corresponding hardware is present.

---

### §3-4.5 Recompilation Triggers

`loup hardware compile` should be re-run when:

- **New hardware is added** — a new GPU is installed in the system; run `loup hardware detect` then `loup hardware compile`.
- **Backend package is updated** — `loup update loup.backend.cuda` updates the source; `loup hardware compile` rebuilds.
- **Loup toolchain is updated** — ABI version bumps in the Loup runtime may require backend recompilation. The toolchain emits a warning at startup if `hardware.lock` was produced by a different Loup version.
- **SDK is updated** — a CUDA Toolkit or libtpu update may expose new features; manual `loup hardware compile --force` is recommended after SDK upgrades.

`DeviceRegistry.default()` logs a warning (not an error) when `hardware.lock` is stale. The stale backend continues to function unless the ABI has changed, in which case `DeviceRegistry` marks the device as `!stale` and excludes it from `AcceleratorDevice` dispatch.

---

### §3-4.6 Multi-Backend Coexistence

A single Loup installation can have multiple GPU backends compiled simultaneously. The `DeviceRegistry` exposes all of them. The HAL priority order (CUDA → Metal → Vulkan → TPU → WebGPU → SIMD) is the default `Backend.Auto` tie-breaking rule; it can be overridden per-tensor via `Backend.Device(id)`.

Example `hardware.lock` for a heterogeneous workstation:

```toml
[[devices]]
id = "accelerator:0"
kind = "Gpu"; vendor = "Nvidia"; model = "RTX 4090"
backend_package = "loup.backend.cuda"
features = ["fp16", "bf16", "int8", "tensor_cores"]

[[devices]]
id = "accelerator:1"
kind = "Gpu"; vendor = "Amd"; model = "RX 7900 XTX"
backend_package = "loup.backend.vulkan"
features = ["fp16", "bf16", "int8"]

[[devices]]
id = "accelerator:2"
kind = "Tpu"; vendor = "Google"; model = "Coral Edge TPU"
backend_package = "loup.backend.tpu.coral"
features = ["int8"]
```

```loup
from native.hal import (DeviceRegistry, VendorId);
from loup.tensor import (DType, Backend);

let registry = DeviceRegistry.default();

# Route Float32 matmul to the NVIDIA GPU
let nvidiaGpu = registry.listByVendor(VendorId.Nvidia)[0];
let result    = bigTensor.toDevice(nvidiaGpu).matmul(weights).eval();

# Route Int8 inference to the Coral Edge TPU
let coral     = registry.listTpus()[0];
let quantised = inputTensor.to(DType.Int8).toDevice(coral);
let output    = quantised.matmul(int8Weights).eval();
```

---

### §3-4.7 CI / Containerised Environments

In CI environments without physical GPU hardware, backend packages can be installed without compilation (`loup install --no-hardware`), and `DeviceRegistry.default()` will return only a CPU backend. This allows CI to run tests that use `loup.tensor` via CPU fallback without requiring GPU hardware in the CI runner.

For GPU CI (e.g. GitHub Actions with NVIDIA-hosted runners, Google Cloud Build with TPU workers):

```yaml
# .github/workflows/gpu.yml (example — non-normative)
- run: loup install
- run: loup hardware detect
- run: loup hardware compile
- run: loup test --gpu
```

For Docker images intended for GPU deployment, the backend can be pre-compiled and baked into the image:

```dockerfile
FROM loup-runtime:1.7
RUN loup add loup.backend.cuda@12.3 &&     loup hardware add loup.backend.cuda &&     loup hardware compile --backend loup.backend.cuda
```

The resulting image contains the compiled `libloup_backend_cuda.so` and a `hardware.lock` with a placeholder device entry (no real device detected, but the compiled artifact is present). `DeviceRegistry` will detect the actual CUDA GPU at container runtime and activate the compiled backend.


---


---

## Appendix C: Package Type Index

Types defined in packages that require `loup install`.

### Standard Library Types

|---|---|---|
| `Tensor` | `loup.tensor` | §21.28 |
| `DType` | `loup.tensor` | §21.28 |
| `Backend` | `loup.tensor` | §21.28 |
| `TensorShapeError` | `loup.tensor` | §21.28 |
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
| `GradScaler` | `loup.autodiff` | §21.31 |
| `AutodiffError` | `loup.autodiff` | §21.31 |
| `AdamWOptimizer` | `loup.autodiff` | §21.31 |
| `RMSpropOptimizer` | `loup.autodiff` | §21.31 |
| `TpuTopology` | `loup.tpu` | §21.34 |
| `TensorBackendError` | `loup.tensor` | §21.28 |
| `GpuDevice` | `native.webgpu` | §21.29 |
| `GpuBuffer` | `native.webgpu` / `native.gpu` | §21.29, §21.30 |
| `GpuKernel` | `native.gpu` | §21.30 |
| `GpuQueue` | `native.webgpu` | §21.29 |
| `GpuCommandEncoder` | `native.webgpu` | §21.29 |
| `GpuCompileError` | `native.gpu` | §21.30 |
| `GpuUnavailableError` | `native.webgpu` | §21.29 |
| `Variable` | `loup.autodiff` | §21.31 |
| `Optimizer` | `loup.autodiff` | §21.31 |
| `ComputeGraph` | `native.hal` | §21.32 |
| `AdamOptimizer` | `loup.autodiff` | §21.31 |
| `SgdOptimizer` | `loup.autodiff` | §21.31 |
| `CustomOp` | `loup.autodiff` | §21.31 |
| `GpuRenderPipeline` | `native.webgpu` | §21.29 |
| `GpuPipelineLayout` | `native.webgpu` | §21.29 |
| `GpuRenderPassEncoder` | `native.webgpu` | §21.29 |
| `GpuSurface` | `native.webgpu` | §21.29 |
| `GpuSurfaceTexture` | `native.webgpu` | §21.29 |
| `Window` | `native.window` | §21.35 |
| `WindowConfig` | `native.window` | §21.35 |
| `Event` | `native.window` | §21.35 |
| `Key` | `native.window` | §21.35 |
| `Gamepad` | `native.window` | §21.35.1 |
| `AudioContext` | `native.audio` | §21.36 |
| `AudioBuffer` | `native.audio` | §21.36 |
| `AudioSource` | `native.audio` | §21.36 |
| `StreamingSource` | `native.audio` | §21.36 |
| `AudioBus` | `native.audio` | §21.36 |
| `AudioListener` | `native.audio` | §21.36 |
| `AudioPanner` | `native.audio` | §21.36 |

### v1.18 Standard-Library Types (Cross-Reference)

The following types live in the standard library (no `loup install` required)
but are listed here for cross-reference convenience since packages frequently
export types using them. Full specifications are in the
[Loup Standard Library Reference v1.20](loup-stdlib-reference-v1_20.md).

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
must carry a `shared_abi_version` manifest field per §1-13.5b.



