# Loup Toolchain Qualification Plan v1.0

**Document status.** Authored 2026-09-09. This is the document that
`loup-proposal-zig-highlighted-gaps.md` §10, `loup-proposal-divergence-v1_0.md` §11,
`loup-ui-framework-architecture-v1_0.md` §12 and the v1.20→v1.21 roadmap have been citing
by section number since before it existed. It was commissioned by ruling `v21.p0.5` to
discharge **BV-7**, the last blocking verification on the v1.21 cascade.

**Read §1.4 first.** This plan separates what it *requires* from what the toolchain
*does today*, and says which is which in every section. A qualification plan that asserts
unimplemented behaviour as fact is worse than no plan, because it converts an open task
into a false record. Every requirement below is marked **[implemented]**, **[partial]** or
**[planned]**, measured against the tree on the date shown.

**Applicability.** Loup is not certified, and this plan does not certify it. It states the
requirements the toolchain must meet for a user to qualify it as a T3 software tool under
IEC 61508-3 §7.4.4 (or an equivalent clause of ISO 26262-8 §11 or DO-330), the evidence
the project undertakes to produce, and the obligations that fall on the user rather than
on this project. See §10.

- [§1 Purpose, scope and standing](#1-purpose-scope-and-standing)
- [§1.1 Purpose](#11-purpose)
- [§1.2 What this plan is not](#12-what-this-plan-is-not)
- [§1.3 Standing and change control](#13-standing-and-change-control)
- [§1.4 Status of the requirements in this version](#14-status-of-the-requirements-in-this-version)
- [§2 Terminology and normative references](#2-terminology-and-normative-references)
- [§2.1 Terms](#21-terms)
- [§2.2 Normative references](#22-normative-references)
- [§3 Toolchain scope](#3-toolchain-scope)
- [§3.1 Components and tool classes](#31-components-and-tool-classes)
- [§3.2 Restrictions on qualified scope](#32-restrictions-on-qualified-scope)
- [§3.3 Determinism and reproducible builds](#33-determinism-and-reproducible-builds)
- [§3.4 Debug artifacts and qualified release builds](#34-debug-artifacts-and-qualified-release-builds)
- [§4 Requirements on the toolchain](#4-requirements-on-the-toolchain)
- [§4.1 QP-1 — the Language Safe Subset](#41-qp-1--the-language-safe-subset)
- [§4.2 QP-2 — implementation-defined behaviour annex](#42-qp-2--implementation-defined-behaviour-annex)
- [§4.3 QP-3 — specification change control](#43-qp-3--specification-change-control)
- [§4.4 QP-4 — the error catalogue and its validation obligation](#44-qp-4--the-error-catalogue-and-its-validation-obligation)
- [§4.5 QP-5 — two-lane equivalence](#45-qp-5--two-lane-equivalence)
- [§4.6 QP-6 — diagnostic soundness](#46-qp-6--diagnostic-soundness)
- [§4.7 QP-7 — target parameterization](#47-qp-7--target-parameterization)
- [§4.8 QP-8 — the const-evaluation profile](#48-qp-8--the-const-evaluation-profile)
- [§5 Build provenance and attestation](#5-build-provenance-and-attestation)
- [§5.1 The build attestation record](#51-the-build-attestation-record)
- [§5.2 Reproducibility evidence](#52-reproducibility-evidence)
- [§5.3 Provenance of the toolchain itself](#53-provenance-of-the-toolchain-itself)
- [§6 Verification approach](#6-verification-approach)
- [§6.1 Evidence classes](#61-evidence-classes)
- [§6.2 Requirement-to-evidence map](#62-requirement-to-evidence-map)
- [§7 The Compiler Validation Suite](#7-the-compiler-validation-suite)
- [§7.1 Composition](#71-composition)
- [§7.2 The per-code obligation](#72-the-per-code-obligation)
- [§7.3 Coverage accounting](#73-coverage-accounting)
- [§8 Limitations, defects and deviations](#8-limitations-defects-and-deviations)
- [§8.1 Known limitations at v1.0](#81-known-limitations-at-v10)
- [§8.2 Reporting a tool defect](#82-reporting-a-tool-defect)
- [§8.3 The deviations register](#83-the-deviations-register)
- [§9 Qualification of the self-hosted lane](#9-qualification-of-the-self-hosted-lane)
- [§9.1 Why there are two lanes](#91-why-there-are-two-lanes)
- [§9.2 Byte-identity as evidence](#92-byte-identity-as-evidence)
- [§9.3 What byte-identity does not prove](#93-what-byte-identity-does-not-prove)
- [§10 Division of responsibility](#10-division-of-responsibility)
- [§10.1 What this project supplies](#101-what-this-project-supplies)
- [§10.2 What the user must do](#102-what-the-user-must-do)
- [§11 Reserved error codes](#11-reserved-error-codes)
- [§12 Certification Test Requirements](#12-certification-test-requirements)
- [§12.1 Metadata required of every CTR](#121-metadata-required-of-every-ctr)
- [§12.2 Governing principle — anti-vacuity](#122-governing-principle--anti-vacuity)
- [§12.3 Areas](#123-areas)
- [§12.4 The register](#124-the-register)

---

## §1 Purpose, scope and standing

### §1.1 Purpose

This plan states:

1. Which parts of the Loup toolchain are **in qualified scope** and which are permanently
   out (§3).
2. The **requirements** the in-scope parts must meet, as numbered `QP-n` obligations (§4).
3. The **evidence** the project undertakes to produce for each, and where that evidence
   lives in the repository (§6, §7).
4. The **Certification Test Requirements** — `CTR-<AREA>-NNN` — that constitute the
   evidence obligations a language or toolchain change creates (§12).
5. The **division of responsibility** between this project and a user pursuing
   certification of a product built with Loup (§10).

A tool qualification argument answers one question: *if this tool is wrong, what stops the
error from reaching the product undetected?* Everything in this plan is subordinate to
that question. Requirements that do not bear on it do not belong here.

### §1.2 What this plan is not

- **Not a certificate.** No independent assessment has been performed. Nothing in this
  document may be represented as a certification, an approval, or a claim of compliance.
- **Not a safety case for a product.** A product's safety case is the user's, and it
  subsumes far more than the toolchain. This plan supplies one input to it.
- **Not a statement that Loup is fit for safety-related use today.** §8.1 records the
  limitations that bear on that judgement. They are substantial.
- **Not a substitute for the language specification.** Where this plan and a language
  volume disagree about language semantics, the volume governs and the disagreement is a
  defect in this plan.

### §1.3 Standing and change control

This document is a **companion** in the sense of `SPEC-INDEX.md`: normative for the
qualification argument, subordinate to the four language volumes for language semantics.

It is amended in place under the convention of §4.3. Amendments that change a `QP-n`
requirement, the §3.2 scope boundary, or a `CTR` pass criterion SHALL record the date and
the reason in the section itself, in the style used throughout this document, so that an
assessor reading a single section can see what changed and why without diffing.

### §1.4 Status of the requirements in this version

Measured against the tree on **2026-09-09**.

| Marker | Meaning |
|---|---|
| **[implemented]** | The requirement is met and there is a gate in the repository that fails if it stops being met. |
| **[partial]** | Some of the requirement is met and gated; the rest is named explicitly. |
| **[planned]** | The requirement is stated but nothing implements it. It is a commitment, not a description. |

**The three largest [planned] items, stated plainly because they are load-bearing and
their absence is easy to miss:**

- **`--profile safety` does not exist.** It is referenced by both proposals and by this
  plan as the switch that activates the Language Safe Subset. Measured 2026-09-09: no
  language volume defines it, and the `--profile` flag the build tools accept selects a
  build profile (`debug`/`release`), not a safety profile. Every requirement predicated on
  `--profile safety` is therefore **[planned]**, including the whole of §4.1.
- **No build attestation record is produced.** §5.1's fields are a specification of a
  record that nothing writes yet.
- **No `E_LSS_*` diagnostic is implemented.** §11 reserves the family; §4.1 defines the
  rules; nothing enforces them.

What *is* implemented is the evidence machinery: a two-lane compiler with byte-identity
gates, a generated error catalogue, and a gate record. §6 is the honest part of this plan,
and it is honest because it describes things that run.

---

## §2 Terminology and normative references

### §2.1 Terms

| Term | Definition |
|---|---|
| **QTC** | *Qualified Toolchain Configuration.* A specific set of toolchain components at specific versions, invoked with a specific set of options, for which qualification evidence exists. Evidence attaches to a QTC, never to "Loup" in the abstract. |
| **T1 / T2 / T3** | Tool classes in the sense of IEC 61508-4 §3.2.11. **T1** produces no output contributing to the executable (editors, formatters, documentation generators, debug portals). **T2** verifies but cannot introduce a defect into the executable, though it can fail to reveal one (test harnesses, static checks). **T3** generates output that contributes directly to the executable (the compiler, the backends, the linker driver). Only T3 components require the full argument of §4; T2 components require the argument of §7.3 (that a failure to detect is bounded); T1 components require only exclusion evidence (§3.4). |
| **LSS** | *Language Safe Subset.* The restriction of Loup admitted under `--profile safety` (§4.1). |
| **CVS** | *Compiler Validation Suite.* The body of tests that exercises the compiler against the specification, including one test per error code (§7). |
| **CTR** | *Certification Test Requirement.* A numbered, individually citable obligation stating what must be demonstrated, on what corpus, with what pass criterion (§12). |
| **Anti-vacuity** | The property that a test can fail. A test that passes both when the mechanism under test works and when it is absent demonstrates nothing. See §12.2. |
| **Seeded defect** | A deliberate fault introduced into an input to demonstrate that a test discriminates: the defect-present run must fail and the defect-absent run must pass. |
| **Qualified release build** | A build produced by a QTC under the options recorded in its attestation record, from which every T1 artifact has been excluded (§3.4). |
| **Lane** | One of the two compiler implementations the project maintains: the Rust **bootstrap lane** (Stage0) and the **self-hosted lane** written in Loup. See §9. |

### §2.2 Normative references

The language volumes, which govern all language semantics:

- `loup-language-core-v1_20.md` (Volume 1, `§1-*`)
- `loup-language-runtime-v1_20.md` (Volume 2, `§2-*`)
- `loup-language-compilation-v1_20.md` (Volume 3, `§3-*`)
- `loup-language-data-v1_20.md` (Volume 4, `§4-*`)

Companions bearing on this plan: `loup-stdlib-reference-v1_20.md`,
`loup-packages-reference-v1_12.md`, `loup-testing-reference-v1_10.md`,
`loup-ui-framework-architecture-v1_0.md`.

Generated artifacts this plan cites *instead of* quoting figures, per §4.4:
`docs/error-codes.md`, `docs/stdlib-status.md`.

---

## §3 Toolchain scope

### §3.1 Components and tool classes

| Component | Role | Class | In qualified scope |
|---|---|---|---|
| `loup` (driver / CLI) | Drives parse → resolve → typecheck → HIR → MIR and dispatches to a backend | T3 | Yes |
| `loup-bootstrap` | The Rust bootstrap compiler (Stage0) | T3 | Yes — as the lane that builds the self-hosted lane (§9) |
| `loup-llvm` | MIR → LLVM IR | T3 | Yes |
| `loup-llbe` | Multi-architecture native backend, clang-free path | T3 | Yes |
| `loup-build` | Project build orchestrator | T3 | Yes — it selects inputs and options, so it can alter the executable |
| `loup-test` | Test runner | T2 | Yes, under §7.3 |
| `loup-fmt` | Formatter | T1 | No — it rewrites source, but its output is re-parsed by a T3 tool, and a formatting defect that changes semantics is caught as a source diff |
| `loup-doc`, `loup-export-headers`, `loup-import-headers` | Documentation and FFI header interchange | T1 | No, except `import-headers`: a wrong imported declaration *does* reach the executable, so it is **T3 when its output is compiled**, and a qualified build SHALL treat generated headers as source subject to review |
| Debug portals, `.debug_ring`, the MCP debug server | Debug and trace egress | T1 | No — and excluded by §3.4 |

**The `import-headers` carve-out is deliberate.** Every other T1 tool produces artifacts a
human reads. `import-headers` produces declarations a compiler believes. Classifying it T1
on the grounds that it is "just interchange" would be the exact error this table exists to
prevent.

### §3.2 Restrictions on qualified scope

**(1) Compiled modes are in scope.** `@mode(host.native)`, `@mode(host.dual)` and
`@mode(freestanding)` are the modes for which qualification evidence is produced.

**(2) General scripted and JIT execution is permanently out of scope.**
`@mode(host.scripted)`, `@mode(web.scripted)`, `loup run` and the REPL execute through an
interpreter and, where available, a JIT. Neither is qualifiable on any timescale this
project will commit to: the JIT generates code at run time from inputs not present at
build time, which defeats the reproducibility argument of §3.3 at its root. **JIT is
permanently out.** This is not a scheduling statement.

**(3) The const-evaluation profile is IN scope, as a restricted profile of the compiler
(T3).**

> **Amendment recorded at authoring, 2026-09-09.** Earlier drafts of this plan's §3.2 —
> quoted by `loup-proposal-zig-highlighted-gaps.md` §10.1 — stated (2) in a form that
> also excluded const evaluation, on the grounds that it reuses the scripting semantics.
> Proposal A's const-evaluation profile does reuse those *semantics*, but it does not
> reuse the *JIT backend*, and it runs inside the compiler's trust boundary: its results
> become part of the executable. Excluding it would place executable-determining
> computation outside qualified scope, which is the opposite of what (2) exists to
> achieve. It is therefore in scope as a restricted T3 profile, restricted by the rules of
> §4.8. The distinction that matters is **interpretation of a closed feature set with a
> bounded resource budget**, not "scripting versus compilation".
>
> **Scope of this inclusion (DV-11, ruled 2026-09-09): BROAD.** It covers const-evaluated
> diagnostics *generally*, not only those belonging to Proposal A. A later feature that
> produces a diagnostic from const evaluation is in scope by this clause and needs no
> further amendment. Ruling narrowly would have made the amendment history the
> specification.

**(4) A qualified build uses one lane.** Both lanes (§9) are in scope as *tools*, but a
given qualified build is produced by one of them, named in its attestation record (§5.1.3).
Cross-lane byte-identity is evidence about the tools; it is not a licence to mix them
within a build.

### §3.3 Determinism and reproducible builds

**QP-0 (governing).** A QTC SHALL produce **bit-identical output** from identical inputs,
identical options and identical target selection, independent of the host that runs it,
the wall-clock time, the filesystem layout of the build directory, and the number of
parallel jobs. **[partial]**

This is the requirement every other requirement in this plan leans on. If a build is not
reproducible, no evidence gathered about one build transfers to another, and the whole
argument collapses to "we tested a binary once".

**Cross-reference to the const-evaluation profile.** §4.8's rules 1–4 exist to preserve
this requirement, and §4.8 is where the dependency is discharged: const evaluation is
interpretation-only, target-parameterized rather than host-parameterized, deterministically
ordered, and bounded. An assessor reading §3.3 must read §4.8 with it — a compile-time
evaluator is the most direct route by which host state can leak into an executable.

**Status.** Byte-identity of the compiler's own MIR across the two lanes is gated
(`stage1_selfcompile_e2e`, `freestanding_parity_e2e`, the `.ll` identity gates). Full
build reproducibility across hosts and build directories is **not** yet gated: it is
**[planned]**, and `CTR-REPRO-001` is its obligation.

### §3.4 Debug artifacts and qualified release builds

**QP-9.** Every T1 debug artifact SHALL be absent from a qualified release build, and its
absence SHALL be evidenced rather than asserted. **[partial]**

Covered artifacts: debug portals and the portal ring (`.debug_ring`, `portal_ring_size`),
`@debug_trace_channel` egress, the MCP debug server, and — per Proposal C — error return
trace instrumentation, which is `--debug`-only by construction and stripped in release.

The evidence is a **negative** one, which is why it needs stating: a test that a feature is
present passes when the build is misconfigured to include it. The obligation is
`CTR-TRACE-002` (§12.4): a qualified release build of a program that would carry trace
instrumentation in a debug build contains none, demonstrated by inspecting the artifact,
with a debug build of the same source as the discriminating control.

---

## §4 Requirements on the toolchain

Each requirement is `QP-n`, individually citable. `QP-0` is in §3.3 because it is a scope
property rather than a toolchain behaviour.

### §4.1 QP-1 — the Language Safe Subset

**QP-1.** Under `--profile safety`, the compiler SHALL reject the constructs enumerated
below, each with the `E_LSS_*` code named in §11. **[planned]** — see §1.4; the switch
does not exist yet, so nothing in this section is enforced today.

The LSS is a restriction of the language, not a dialect of it. Every program admitted by
the LSS is a Loup program with identical semantics; the subset only removes constructs
whose *evidence cost* is disproportionate to their value in a safety-related unit.

**(1) Unjustified unsafety.** `@unsafe` without a justification string is rejected
(`E_LSS_UNSAFE_UNJUSTIFIED`). The dangerous construct remains reachable; what the LSS
requires is that it leave an auditable record. This is the pattern §3-3.14 already uses for
`@naked` and §3-3.18 for `reinterpret`.

**(2) Unbounded resource acquisition.** In a safety-related unit:

- **(2a)** Unbounded recursion, where the compiler cannot establish a bound.
- **(2b)** Unbounded iteration whose termination the compiler cannot establish, *other
  than* a deliberate non-terminating loop in a `noreturn` function — an idle loop and a
  panic handler are the intended shapes, and rejecting them would be an error.
- **(2c)** Dynamically-sized stack allocation.
- **(2d)** **Heap allocation after the initialization phase on freestanding targets**,
  gated through `@allocator` policy. This is the rule
  `loup-proposal-zig-highlighted-gaps.md` §6.3 anticipates, and the proposal's observation
  stands: the rule is far easier to state, enforce and evidence when allocation is scoped
  to a named region than when everything routes through one global allocator. Until
  Proposal D lands (deferred by LCP-9 to a dedicated pass after v1.21), (2d) is enforceable
  only in its coarse form — *no allocation at all after init* — and the fine-grained,
  per-region form is **[planned]** against that design pass.

**(3) Unhandled panic paths.** A panic that can reach a freestanding target with no
`@panic_handler` installed is rejected (`E_LSS_PANIC_UNHANDLED`). Note that this is a
stronger requirement than §3-3.6's `E_PANIC_HANDLER_MISSING`, which fires only under
`--panic=custom`.

**(4) Assumed-unreachable code.** The assuming form of `unreachable` — the form that
permits the compiler to assume the point is not reached rather than trapping — is rejected
(`E_LSS_UNREACHABLE_ASSUME`). **This rule is reserved, not active:** DV-3 deferred the
assuming form itself, so there is nothing to reject. The code is reserved in §11 so that
the rule and the feature land together if the feature ever ships. The asserting form —
Loup's default and only current spelling — traps in every profile including
`--profile safety`, and is unrestricted.

**On the temptation to make the LSS a language-wide rule.** "No hidden control flow" as a
whole-language prohibition is incompatible with ARC, exceptions and operator overloading,
all of which are load-bearing elsewhere. The LSS is the correct venue for that discipline
precisely because it is opt-in per build.

### §4.2 QP-2 — implementation-defined behaviour annex

**QP-2.** Every point of implementation-defined behaviour in a T3 component SHALL appear in
the Implementation-Defined Behaviour Annex of `loup-language-compilation-v1_20.md`, with
the value chosen by the QTC recorded. **[partial]**

**Const-evaluation budgets: latitude deliberately closed.** The fuel and allocation budgets
that bound const evaluation (§4.8 rule 6) are **normatively fixed**, overridable only in a
closed `[const_eval]` manifest section, and are **never implementation-defined** (LCP-2,
ruled 2026-09-06). They are recorded here as a point of latitude the project deliberately
declined to take, rather than as an annex entry, because an assessor scanning the annex for
build-varying behaviour should not find them there and then have to work out that they do
not vary.

### §4.3 QP-3 — specification change control

**QP-3.** A specification change SHALL be applied **in place**, across every affected
document, in one pass. **[implemented]**

Loup has not shipped a stable release. Deprecation notices, errata sections and
compatibility shims are therefore not appropriate: an outdated construct is removed
outright. The recurring failure mode this convention exists to prevent is a feature added
in one volume and not reflected in its companions — which is why every proposal in this
repository carries a cross-document impact table and why `spec-verify.py` exists.

**No version bump before implementation begins.** A change is applied in place to the
current version's documents; the version number advances when a release is cut, not when a
proposal is accepted. LCP-10 confirmed this convention for the v1.21 cascade.

### §4.4 QP-4 — the error catalogue and its validation obligation

**QP-4.** Every diagnostic the compiler can emit SHALL be defined in exactly one normative
table, SHALL be reachable from a stated grammar or semantic rule, and SHALL have at least
one CVS test that provokes **exactly that code**. **[partial]**

**The count is generated, never quoted — including here.** The live figure is in
[`docs/error-codes.md`](../docs/error-codes.md), generated by
`source/sandboxes/agent/error_codes.py` with `--check` wired into CI. This section
deliberately does **not** state it, and neither should anything citing this section: read
the file.

> The first draft of this section did quote it — "398 codes", measured the morning it was
> written. By that evening the figure was 413, because the same day's work defined fifteen
> more. A number that goes stale inside one day is the argument for this rule, not an
> exception to it.

> **Amendment recorded at authoring, 2026-09-09 (BV-1).** Earlier drafts of this section
> asserted a maintained invariant of **365** codes. Measurement found that figure had no
> source anywhere in the tree, and that three different figures were circulating in prose —
> 357, 365 and 378 — none of them generated, all of them stale by the time they were read.
> Quoting a count in prose is what created the drift; generating it is what makes a
> post-change delta mean anything. The invariant is now *the file is current*, checkable by
> `error_codes.py --check`, rather than *the number is 365*.

**Each new code is a cost, not free surface.** Adding a diagnostic adds a CVS obligation
under this requirement. A proposal that can express a rule with an existing code should.
This is the reasoning that ruled DV-9 to one code rather than two for compile-time
divergence, and that declined a separate code for a non-evaluable `if const` condition in
favour of the existing `E_CONST_NOT_EVALUABLE`.

**Six codes are currently implemented but defined in no volume table** — the divergence
family (`E_NORETURN_POSITION`, `E_NORETURN_FALLTHROUGH`, `E_NORETURN_RETURNS`,
`E_NORETURN_UNREACHABLE_CODE`, `E_IMPOSSIBLE_POSITION`, `E_VOID_POSITION`). The
implementation landed ahead of the specification text deliberately, slice by slice; the
text is the v1.21 roadmap's Phase 6. Until it lands, `spec-verify.py` reports these as
mentioned-but-never-defined, and that report is correct: this section's requirement is not
met for them yet. They are listed in §8.1 rather than hidden.

`E_NORETURN_UNREACHABLE_CONST` is a seventh such mention, and a different case: it is
neither defined nor implemented, because DV-9 measured that it has **no reachable
instance** until const evaluation admits calls. It is named here so that the obligation
exists before the reachable instance does — `CTR-CONST-004`.

### §4.5 QP-5 — two-lane equivalence

**QP-5.** A behaviour change SHALL land on both lanes in the same batch, and the lane
parity gates SHALL be green at every landing. **[implemented]** — see §9.

### §4.6 QP-6 — diagnostic soundness

**QP-6.** The compiler SHALL NOT accept a program it cannot compile correctly, and SHALL
NOT fail silently. Specifically: a diagnostic produced by any front end SHALL reach the
user; a backend that cannot lower a construct SHALL refuse the build rather than emit
code that omits it; and an exit code of 0 SHALL mean the requested artifact was produced.
**[partial]**

This requirement is here because the project has violated it in ways that were invisible
until measured: a front end that discarded every parser diagnostic and compiled broken
source at exit 0; a backend whose unlowered construct vanished through dead-code
elimination at exit 0. Both were fixed, both now have gates. The requirement is stated as
a standing obligation because the failure mode recurs by nature — silence is the default
behaviour of a missing case.

### §4.7 QP-7 — target parameterization

**QP-7.** Every property that varies by target — integer widths, endianness, alignment,
`@repr` layout, `size_of`/`align_of` results, floating-point rounding — SHALL resolve
against the **build target**, never the compiler host, in every phase including const
evaluation. **[implemented]** for the compilation phases; **[partial]** for const
evaluation, gated by `CTR-CONST-002`.

### §4.8 QP-8 — the const-evaluation profile

**QP-8.** The const-evaluation profile SHALL satisfy all of the following. Each is
load-bearing; none is stylistic. **[implemented]** except where noted.

1. **Interpretation only.** Const evaluation SHALL NOT use JIT code generation, and its
   result SHALL NOT depend on which host performs the evaluation. This is what preserves
   §3.3.
2. **Target-parameterized.** Per QP-7.
3. **Deterministic iteration.** Iteration order over any collection reachable from a
   `const func` SHALL be deterministic.
4. **Bounded allocation.** Allocation during const evaluation SHALL be bounded, with
   `E_CONST_ALLOC_EXCEEDED` on exhaustion.
5. **Closed feature set.** The constructs admitted in a `const func` body SHALL be an
   enumerated set; anything outside it is `E_CONST_FORBIDDEN_CONSTRUCT`.
6. **Fuel-bounded.** Evaluation SHALL terminate within a fixed fuel budget, with
   `E_CONST_FUEL_EXHAUSTED` on exhaustion. Non-termination is thereby a decidable build
   outcome rather than a compiler hang.
7. **Purity.** A `const func` SHALL NOT read or write module-scope mutable state
   (`E_CONST_MUTABLE_STATE`), and SHALL NOT call a non-`const` function
   (`E_CONST_CALLS_NON_CONST`).
8. **Runtime callability.** A `const func` SHALL be callable in ordinary runtime contexts
   with identical observable behaviour.

**Diagnostics produced during const evaluation are in qualified scope** by §3.2(3), broadly
— including those a later feature introduces.

---

## §5 Build provenance and attestation

### §5.1 The build attestation record

#### §5.1.1 When it is produced

**QP-10.** A build under `--profile safety` SHALL emit an attestation record alongside its
artifacts. **[planned]** — nothing writes one today (§1.4).

#### §5.1.2 Form

The record SHALL be a machine-readable file, diffable as text, emitted to a path derived
from the artifact path so that a record cannot be silently paired with the wrong artifact.

#### §5.1.3 Recorded fields

| Field | Why it is in the record |
|---|---|
| Toolchain component versions, each with its build identity | Evidence attaches to a QTC (§2.1), and a QTC is exactly this list |
| Which lane produced the build (§3.2(4)) | Two lanes are two tools |
| Target triple and every target-derived parameter that affected layout | QP-7's outputs, so an assessor need not re-derive them |
| The complete option vector passed to the driver and to each backend | The options are part of the QTC |
| **The resolved build-option vector** — every `[options]` name with the value selected, including those taken from a manifest `default` | Proposal B §4.3(4). A build's configuration is otherwise unrecoverable from its artifact, and `if const` makes configuration semantically load-bearing: two builds of the same source with different option vectors are different programs |
| Source identity: content hashes of every compiled input, including generated headers (§3.1) | The `import-headers` carve-out is worthless if generated declarations are not in the record |
| The active profile, and the LSS rules in force | §4.1 |
| Presence or absence of each T1 artifact class | §3.4's negative evidence, recorded rather than asserted |

**Options taken from a default are recorded as resolved values, not as "default".** A
manifest default that changes between two builds would otherwise leave two identical-looking
records describing two different programs.

### §5.2 Reproducibility evidence

The obligation is `CTR-REPRO-001` (§12.4). Its pass criterion is bit-identity of the
artifact across hosts and build directories, not merely across two runs on one machine —
the second demonstrates far less and is easy to mistake for the first.

### §5.3 Provenance of the toolchain itself

A T3 tool built by another T3 tool inherits its predecessor's defects. Loup's chain is
`loup-bootstrap` (Rust) → the self-hosted `loup`, `loup-llvm`, `loup-llbe` → a self-rebuild
that reproduces the same artifacts.

**QP-11.** The bootstrap chain SHALL be reproducible from source, and the self-rebuild step
SHALL produce output identical to the artifact that performed it. **[implemented]** for the
compiler's merged MIR, which is the gated form of this property (§9.2).

---

## §6 Verification approach

### §6.1 Evidence classes

| Class | What it is | What it can and cannot support |
|---|---|---|
| **Gate** | An automated check in the repository that fails the build or the release when a property stops holding | The strongest class here. A gate is evidence only for the property it discriminates — see §12.2 |
| **Measurement** | A recorded observation, with the command that reproduces it and the date | Supports a claim about a point in time. Decays; must be re-run and re-dated |
| **Ruling** | A recorded decision with its rationale | Establishes intent, never behaviour. A ruling is not evidence that anything works |
| **Assertion** | A claim in prose with no command behind it | Not evidence. Present in this plan only where marked **[planned]**, and marked so it cannot be mistaken for the others |

The distinction between measurement and gate is the one most often collapsed, and
collapsing it is how a project comes to believe a property holds long after it stopped.

### §6.2 Requirement-to-evidence map

| Requirement | Evidence today | Class |
|---|---|---|
| QP-0 (§3.3) determinism | Cross-lane MIR byte-identity gates; `.ll` identity gates | Gate (partial — host-to-host reproducibility not covered) |
| QP-1 (§4.1) LSS | — | None; **[planned]** |
| QP-2 (§4.2) IDB annex | Annex in Volume 3; budgets fixed by ruling | Ruling + measurement |
| QP-3 (§4.3) change control | `spec-verify.py`, `error_codes.py --check` | Gate |
| QP-4 (§4.4) error catalogue | `docs/error-codes.md` generated + `--check`; negative-parity probe corpus | Gate (partial — not yet one test per code) |
| QP-5 (§4.5) two-lane equivalence | Parity, negative-parity, four-lane sweep, install gates | Gate |
| QP-6 (§4.6) diagnostic soundness | Per-defect gates from each recurrence | Gate (partial — no general property test) |
| QP-7 (§4.7) target parameterization | Freestanding boot gates; multi-arch encoder gates | Gate (partial for const eval) |
| QP-8 (§4.8) const profile | Const-evaluation probe corpus, both lanes | Gate |
| QP-9 (§3.4) debug exclusion | — | None; **[planned]** |
| QP-10 (§5.1) attestation | — | None; **[planned]** |
| QP-11 (§5.3) bootstrap provenance | Stage0/Stage1 merged-MIR byte-identity | Gate |

**Four of eleven requirements have no evidence at all.** That is the honest state of this
plan at v1.0, and it is why §1.2 says what it says.

---

## §7 The Compiler Validation Suite

### §7.1 Composition

The CVS is not a separate artifact to be built; it is the existing body of gates, named as
a set so it can be cited: the lane-parity corpora, the negative-parity probe corpus (one
probe per diagnostic, both lanes, expected code recorded in the probe), the four-lane sweep,
the freestanding boot nets, the identity gates, and the per-crate unit suites.

**QP-12.** The CVS SHALL be run in full before a release, and its record SHALL be part of
the release evidence. **[implemented]** — the gate record in `v1_20-release-readiness.md`
is that record.

### §7.2 The per-code obligation

QP-4 requires one CVS test per error code, provoking exactly that code. The negative-parity
probe corpus is the realisation: each probe carries its expected code in a header comment
and is run on both lanes.

**Current coverage is partial and the gap is known rather than estimated.** The corpus does
not yet cover every code in `docs/error-codes.md`. Closing it is mechanical and is tracked
as `CTR-CVS-001`.

### §7.3 Coverage accounting

A T2 component cannot introduce a defect but can fail to reveal one. The argument required
of the CVS is therefore bounded-detection-failure: for each requirement in §4, either the
CVS discriminates it (a seeded defect fails the suite) or the requirement is listed in §8.1
as undetected. There is no third category, and "we believe it works" is not one.

---

## §8 Limitations, defects and deviations

### §8.1 Known limitations at v1.0

Measured 2026-09-09. These are the limitations that bear on qualification; the release
notes carry the full list.

1. **No `--profile safety`, hence no LSS enforcement** (§1.4, §4.1).
2. **No attestation record** (§5.1).
3. **Host-to-host build reproducibility is ungated** (§3.3).
4. **Per-code CVS coverage is incomplete** (§7.2).
5. **The standard library is partial.** See `docs/stdlib-status.md`, generated. A
   safety-related unit must assume a namespace is absent until that table says otherwise.
6. **Target maturity is uneven.** x86_64 and aarch64 are exercised end to end, including
   booting real kernels under QEMU on aarch64. Other architectures are encoder-validated
   only. An encoder-validated target is not a qualified target.
7. **The self-hosted parser does not accept every module in the tree.** The limitation is
   reported honestly at the point of failure (a diagnostic and a non-zero exit), not
   silently — but it is a completeness limit on the self-hosted lane.
8. **Wasm modes are experimental** and are not in qualified scope by §3.2(1) in any case.
9. **Six implemented diagnostics are defined in no normative table** (§4.4). Their rules
   are enforced on both lanes and gated; what is missing is the specification text that
   makes them citable, which is the v1.21 roadmap's Phase 6. Until then QP-4 is not met
   for them, and a user relying on one of those diagnostics is relying on behaviour that
   is gated but not specified.

### §8.2 Reporting a tool defect

A defect in a T3 component that could cause the tool to produce a wrong executable is
reported as a repository issue with: the minimal source that reproduces it, the QTC
(component versions and full option vector), the observed and expected behaviour, and the
lane. A defect that is not reproducible from source is not yet a report.

**Every accepted T3 defect creates two obligations:** the fix, and a gate that fails on the
pre-fix binary and passes on the post-fix one. A fix without a discriminating gate is not
complete, because nothing then prevents the recurrence it was supposed to end.

### §8.3 The deviations register

A user may build with a QTC option set that departs from a requirement here. Such a
deviation SHALL be recorded in the user's own evidence with the requirement deviated from,
the reason, and the compensating measure. This plan does not grant deviations; it defines
the vocabulary for recording them.

---

## §9 Qualification of the self-hosted lane

### §9.1 Why there are two lanes

Loup is implemented twice: once in Rust (`loup-bootstrap`, the Stage0 lane) and once in
Loup (the self-hosted lane). Two independent implementations of one specification are an
unusually strong verification asset — a disagreement between them is a defect in at least
one, detectable without an oracle.

The project treats them as one obligation: a behaviour change lands on both in the same
batch (QP-5), and a probe that discriminates on one lane is run on both.

### §9.2 Byte-identity as evidence

The strongest gate the project has is byte-identity of the merged MIR produced by the two
lanes over the compiler's own source tree. It is a strong property because it is
*exhaustive over that corpus*: not a sample of behaviours but every construct the corpus
contains, compared in full, with any divergence failing the gate.

### §9.3 What byte-identity does not prove

Byte-identity proves the two lanes **agree**. It does not prove either is **right**.

The project has measured this distinction the hard way: both lanes have produced
byte-identical output that was wrong on both, and a lane-parity gate is structurally
incapable of catching that. Byte-identity must therefore always be paired with evidence of
a different kind — a run gate, a boot gate, a probe with an expected value — and a
specification claim resting on parity alone is not supported.

Two further limits, recorded because each cost a real defect:

- **A gate measures one switch setting.** Every gate that runs with a feature switch off
  says nothing about the behaviour with it on. A change that adds a switch adds a gate
  fragment with the switch on, in the same batch.
- **A gate that is not run is not a gate.** Suites outside the main loop have been red for
  multiple commits while every other gate was green. The CVS is run per batch (§7.1), not
  per release.

---

## §10 Division of responsibility

### §10.1 What this project supplies

The specification set; the two implementations; the gates named in §6.2 and §7.1; the
generated catalogues (`docs/error-codes.md`, `docs/stdlib-status.md`); the CTR register
(§12); and the honest limitation list of §8.1.

### §10.2 What the user must do

Select and freeze a QTC. Establish that the constructs their product uses are covered by
CVS evidence, and treat those that are not as their own verification obligation. Perform
their own tool-impact analysis: which of §8.1's limitations touch their product, and what
compensates. Produce and retain build attestation records once §5.1 is implemented, and
until then record the equivalent information by their own means.

**A user pursuing certification today should read §1.4 and §8.1 as the answer to whether
this toolchain is ready for that, and the answer those two sections give is no.**

---

## §11 Reserved error codes

Codes reserved to the qualification plan. They are defined here rather than in a language
volume because they are properties of a *build profile*, not of the language: the same
program is legal Loup and illegal under `--profile safety`.

| Code | Mode | Condition |
|---|---|---|
| `E_LSS_UNSAFE_UNJUSTIFIED` | `--profile safety` | `@unsafe` with no justification string (§4.1(1)) |
| `E_LSS_UNBOUNDED_RECURSION` | `--profile safety` | Recursion with no compiler-establishable bound (§4.1(2a)) |
| `E_LSS_UNBOUNDED_ITERATION` | `--profile safety` | Iteration with no establishable termination, outside a `noreturn` function (§4.1(2b)) |
| `E_LSS_DYNAMIC_STACK_ALLOC` | `--profile safety` | Dynamically-sized stack allocation (§4.1(2c)) |
| `E_LSS_HEAP_AFTER_INIT` | `--profile safety`, freestanding | Heap allocation after the initialization phase (§4.1(2d)) |
| `E_LSS_PANIC_UNHANDLED` | `--profile safety`, freestanding | A reachable panic path with no `@panic_handler` installed (§4.1(3)) |
| `E_LSS_UNREACHABLE_ASSUME` | `--profile safety` | The assuming form of `unreachable` (§4.1(4)) — **reserved, inactive**: DV-3 deferred the feature |

**None of these is implemented** (§1.4). They are reserved so that the family is stable and
so that a collision check against this table means something — which is precisely how
`loup-proposal-zig-highlighted-gaps.md` §1.3 uses it.

---

## §12 Certification Test Requirements

### §12.1 Metadata required of every CTR

Every CTR SHALL carry, in this order:

1. **Identifier** — `CTR-<AREA>-NNN`, permanent once assigned. A retired CTR keeps its
   number and is marked retired; numbers are never reused.
2. **Requirement traced** — the `QP-n` or specification section it evidences. A CTR that
   traces to nothing is not a certification test.
3. **Corpus** — what it runs on, precisely enough to reconstruct.
4. **Pass criterion** — the observable outcome, stated so that "it passed" is checkable by
   someone who did not write it.
5. **Discrimination** — what makes it capable of failing (§12.2). For a compile-time
   rejection test this is inherent; for anything else it must be stated.
6. **Status** — implemented, partial or planned, with the gate that realises it when one
   exists.

### §12.2 Governing principle — anti-vacuity

**A test that cannot fail is not evidence.** Every CTR SHALL be shown to discriminate: a
seeded defect in its subject makes it fail, and the same run without the defect passes.

The failure mode this principle exists to prevent is specific and common: a test that
exercises a mechanism's *presence* rather than its *effect*. A test that a compiler emits a
trap instruction demonstrates that the compiler emits a trap instruction. Only a paired
defect-present / defect-absent run demonstrates that the trap discriminates.

Compile-time rejection tests are self-discriminating: the code either fires or it does not.
Run-time and absence tests are not, and they carry the seeded-defect obligation explicitly.

### §12.3 Areas

| Area | Subject |
|---|---|
| `AN` | Static analyses of the compiler — reachability, definite assignment, completion |
| `LANG` | Language rules: typing, positions, exhaustiveness |
| `EXEC` | Runtime behaviour of compiled programs |
| `CONST` | The const-evaluation profile (§4.8) |
| `OPT` | Build options and `if const` |
| `TRACE` | Error return traces |
| `LSS` | Language Safe Subset rules (§4.1) |
| `REPRO` | Reproducibility and provenance |
| `CVS` | Coverage of the validation suite itself |
| `UI` | Warp / UI framework obligations |

### §12.4 The register

Status is measured 2026-09-09. **[planned]** means no gate realises it yet.

| CTR | Traces | Corpus | Pass criterion | Status |
|---|---|---|---|---|
| `CTR-AN-001` | QP-6 | Programs with statically-detectable dead code after diverging statements | The diagnostic identifies the offending statement, not the enclosing block | implemented |
| `CTR-AN-002` | QP-6, §4.1(3) | A corpus of **statically unreachable panic sites**, seeded | Each seeded reachable site is reported; each genuinely unreachable site is not. The seeded/unseeded pair is the discrimination | planned |
| `CTR-LANG-001` | §6.1 divergence | `noreturn` functions, half with a normally-completing path | Every fall-through rejected with `E_NORETURN_FALLTHROUGH`; zero false positives on the diverging half | implemented |
| `CTR-LANG-002` | §6.4 divergence | Statements following `noreturn`-typed expression statements | `E_NORETURN_UNREACHABLE_CODE` on every instance; the diagnostic names the statement | implemented |
| `CTR-LANG-003` | §6.1 divergence | `noreturn` in each prohibited position | `E_NORETURN_POSITION` in every case | implemented |
| `CTR-LANG-004` | §6B.2 divergence | `impossible` in each prohibited position, plus the legal type-argument positions | `E_IMPOSSIBLE_POSITION` for each prohibited case; accepted in variant-payload type-argument position | implemented |
| `CTR-LANG-005` | §6B.3 divergence | `match` on `Result[T, impossible]` with the `Err` arm omitted; **negative half:** the same `match` on `Result[T, DecodeError]` | Accepted with no `E_MATCH_NONEXHAUSTIVE`; the negative half still rejected. The negative half is what shows the carve-out did not disable the rule | implemented |
| `CTR-EXEC-001` | §7.1 divergence | One program reaching an `unreachable`, built under every profile including `--release` and `--profile safety` | Panic in every configuration, `PanicSource.Unreachable` delivered where a handler is installed. **Seeded-defect toggle required:** a defect-present run reaches the `unreachable` and traps; a defect-absent run of the same binary does not | partial — the trap is gated on both lanes and the distinct `PanicSource.Unreachable` discriminant landed 2026-09-09 (DV-5); the seeded-defect toggle across every profile is still owed |
| `CTR-CONST-001` | QP-8(1), QP-0 | Const-evaluated programs run on differing hosts | Identical outputs, bit for bit | planned |
| `CTR-CONST-002` | QP-7, QP-8(2) | Const evaluation of layout and width queries across host/target pairs where they differ | Results resolve against the target; a host-resolved result fails the test | partial |
| `CTR-CONST-003` | QP-8(6) | A non-terminating `const func` | `E_CONST_FUEL_EXHAUSTED`, as a build outcome, within a bounded time | implemented |
| `CTR-CONST-004` | §3.2(3), DV-9 | Const-evaluated paths reaching `unreachable` under varying build options | `E_NORETURN_UNREACHABLE_CONST` on every reaching configuration; no diagnostic on non-reaching ones | planned — no reachable instance until const evaluation admits calls |
| `CTR-OPT-001` | Proposal B §4.3(1) | A type error deliberately placed in a **non-selected** `if const` branch | The error is diagnosed. **This is the anti-vacuity case for the whole proposal:** without the seeded defect the rule is untested ceremony | implemented |
| `CTR-OPT-002` | Proposal B §4.3(2,3) | Option values outside a declared domain, and a defaultless option left unsupplied | `E_OPTION_VALUE_INVALID` and `E_OPTION_UNSET` respectively | implemented |
| `CTR-OPT-003` | QP-10, §5.1.3 | A `--profile safety` build with a non-default option vector | The resolved vector appears in the attestation record, with defaults resolved to values | planned |
| `CTR-TRACE-001` | Proposal C | A `?` propagation chain in a debug build | The trace records each propagation site; the error's value and type are unchanged by capture | implemented |
| `CTR-TRACE-002` | QP-9, §3.4 | A qualified release build of a program that carries trace instrumentation in debug | No instrumentation present in the release artifact; the debug build of the same source is the discriminating control | planned |
| `CTR-LSS-001` | §4.1(1) | `@unsafe` with and without a justification | `E_LSS_UNSAFE_UNJUSTIFIED` for the unjustified form only | planned |
| `CTR-LSS-002` | §4.1(2d) | Freestanding allocation before and after the initialization phase | `E_LSS_HEAP_AFTER_INIT` for the post-init case only | planned |
| `CTR-LSS-003` | §4.1(4) | The assuming form of `unreachable` under `--profile safety` | `E_LSS_UNREACHABLE_ASSUME` | planned — omitted while DV-3's deferral stands |
| `CTR-REPRO-001` | QP-0, §5.2 | One project built on differing hosts and in differing build directories | Bit-identical artifacts | planned |
| `CTR-CVS-001` | QP-4 | The full code catalogue against the probe corpus | Every code in `docs/error-codes.md` has at least one probe provoking exactly it | partial — MEASURED 2026-09-10 by `error_codes.py --coverage` (`docs/error-code-coverage.md`): of 503 defined codes, 253 are raised by an implementation and 184 are named by a test, probe or fragment; **71 are raised but never tested** (the burn-down list) and 250 are defined by a specification and raised by nothing. Presence is a lower bound; absence is exact. First burn-down batch and its measured defects: `x-update-v1_20-to-v1_21/cvs-batch1-findings.md`; the codes nothing raises, sorted for decision: `docs/error-code-triage.md` |
| `CTR-UI-TOTALITY` | UI framework §4.4.4 | `machine` declarations | Totality enforced; `E_UI_MACHINE_INCOMPLETE` on an incomplete machine | see UI framework |
| `CTR-UI-PROJECTION` | UI framework | Requirements projections | Projection matches the declared machine | see UI framework |
| `CTR-UI-SOLVER-DETERMINISM` | QP-0 | Layout solver runs | Identical inputs, identical layout | see UI framework |
| `CTR-UI-RESTORE` | UI framework | State restoration | Restored state equals saved state | see UI framework |
| `CTR-UI-CAPABILITY` | UI framework | Capability gating | Ungranted capability is refused | see UI framework |
| `CTR-UI-EQUIVALENCE` | UI framework | Photon migration | Migrated component behaves equivalently | see UI framework |

**On the `NNN` placeholders in the two proposals.** Both proposals wrote `CTR-<AREA>-NNN`
because the highest assigned number in each area could not be read from a document that did
not exist. This register assigns them. A proposal drafted after this document cites a real
number or requests the next one; it does not reintroduce `NNN`.
