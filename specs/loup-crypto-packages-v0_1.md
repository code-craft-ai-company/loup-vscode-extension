# Loup Cryptography Packages Reference v0.1

**Status:** Draft — architecture ratified, implementation not started.
**Version:** 0.1.0
**Date:** 2026-06-11
**Scope:** The first-party, **pure-Loup** cryptography package family under
`loup.crypto.*` — symmetric primitives, public-key cryptography, X.509/PKIX,
the sans-I/O TLS and SSH protocol engines, and code signing.

Companion document to the Loup Language Reference v1.20 (Volumes 1–4), the
Stdlib Reference v1.20, and the Packages Reference v1.12. This document uses
`§N.M` for its own headings and `§V-N.M` when referencing the language volumes
(e.g. `§1-18.1`). It is a Draft and **graduates to Release alongside its
implementation**, phase by phase (§19).

> ⚠ **From-scratch cryptography — read §20 first.** This library implements
> cryptographic algorithms in Loup source from scratch. It has had **no
> third-party cryptographic audit**. It MUST NOT be assumed free of side
> channels or implementation flaws. Constant-time execution and memory
> zeroization are, on the Wasm/GC target, presently **unverified and may be
> unachievable** (§20). Correctness is gated on published test vectors (§19);
> assurance against side-channel and misuse classes is a *roadmap*, not a v0.1
> guarantee.

---

## §1 Overview, scope, and the four hard decisions

`loup.crypto.*` is a single auditable cryptography codebase that runs anywhere
Loup runs — native (cli/service/desktop), web (Wasm), and (for the subset that
needs no big-integer arithmetic) freestanding. It supersedes the four-function
`loup.crypto` sketch in Packages Reference v1.12 (those functions are retained
as sugar over this object model, §5.7; the "no encryption or key exchange"
caveat is lifted).

Four architectural decisions are **normative constraints** on everything below.

1. **Pure Loup.** Every cryptographic transform is implemented in Loup source.
   There is **no FFI** to OpenSSL, BoringSSL, RustCrypto, or libsodium. Those
   projects are *references for algorithm logic only*. The trust basis for
   correctness is **published known-answer test vectors** (NIST CAVP/ACVP, RFC
   appendices, Project Wycheproof, and project-shipped KATs), wired into a
   conformance gate (§19).

2. **One host seam: entropy.** True randomness cannot be pure computation, so a
   single capability-gated entropy source (`runtime.entropy()`, the new
   `CAP_ENTROPY` capability, §10.2) seeds a pure-Loup DRBG (NIST SP 800-90A,
   §10.4). *Every other transform is pure* and capability-free. Randomness is
   **injected** into consumers (keygen, nonce generation, signing, ephemeral
   KEX), never pulled — so the whole family is deterministically testable
   against KATs with a seeded DRBG (§10.7).

3. **Sans-I/O protocols.** The TLS (§16) and SSH (§17) engines are state
   machines that **consume and produce byte buffers** and surface typed events;
   the caller owns the transport (native socket, browser WebTransport/WebSocket,
   in-memory test pipe) and the clock. Identical protocol code runs on every
   target. This is the rustls / python-`h11` / `hyper-h2` model.

4. **Capability model.** Cryptographic primitives need **no capability** (pure
   compute). Only the entropy seed (`CAP_ENTROPY`) and any transport/clock/
   filesystem the *caller* supplies are capability-gated, through the existing
   runtime root (§2-runtime-2).

**Out of scope for v0.1** (stated loudly so the gaps are not silent): post-
quantum algorithm *bodies* (ML-KEM/ML-DSA — codepoints reserved, §App.B); TLS
1.2 non-AEAD suites and TLS resumption/PSK/0-RTT (§16.12); SSH SFTP as a
built-in subsystem (the channel layer supports it, the file protocol is a
separate package); OS keychain / system-trust-store integration
(`TrustStore.withSystemRoots`, a platform capability, §15); hardware-token /
PKCS#11 backends. Public-key **encryption** (`loup.crypto.pke`, RSA-OAEP/ECIES)
is **in scope** and lands in Phase 2 (§App.B note — its absence was the single
largest parity gap the design review caught).

---

## §2 Design axioms — the misuse-resistance mandate

The owner's requirement — *"sound abstractions and objects that make crypto easy
to understand and use"* — is made concrete as five axioms. They are the lens for
every type in this document.

1. **AEAD-by-default; raw modes are quarantined.** The ergonomic surface exposes
   only authenticated encryption (`Aead`, §5.2). Unauthenticated block/stream
   modes exist only behind the lower `BlockCipher`/`StreamCipher` traits in
   `loup.crypto.lowlevel`, importing which is **audit-visible** and gate-able by
   project manifest (§2a). There is **no `ECB` mode object anywhere, ever** — a
   permanent, named exclusion alongside RC4/CBC-with-encryption (§App.B).

2. **Parse, don't validate.** Keys, certificates, nonces, signatures, and OIDs
   are obtained only through a parsing constructor that returns a fully-typed,
   already-validated value or throws. A `PublicKey` cannot exist unless its
   point/parameters were validated at construction (on-curve, subgroup, exponent
   range). There is no "validate these `bytes`, then keep using the `bytes`"
   path.

3. **Types make misuse a compile error.** `Nonce[Aes256Gcm]` is not assignable
   to `Nonce[ChaCha20Poly1305]`; a `PrivateKey[Ed25519]` cannot stand in for a
   `PrivateKey[EcdsaP256]`; a `Tag` cannot be silently truncated. Algorithm
   identity is carried at the type level, binding key → nonce → tag widths.

4. **Secrets are zeroizing, non-printable, constant-time-compared.** All
   confidential material is held in `SecretBytes` (§5.4, §7), which refuses to
   render in `toString`/format/log, compares only via constant-time equality,
   and wipes its backing store on scope exit on a **best-effort** basis (§7.1,
   §20 — the honest caveat).

5. **Typed config, not flag soup.** Every options-bearing constructor takes one
   typed config/builder value (`Pbkdf2Params`, `AeadOptions`, `VerifyPolicy`),
   never a positional pile of `bool`/`int`. Defaults are the safe choice;
   insecure choices require an explicitly-named opt-in method
   (`.withRandomNonce()`, `.allowLegacySha1Verify()`).

### §2a Honest note on `@unsafe` quarantine

The raw-cipher quarantine uses `@unsafe("raw-cipher: …")` (§3-2.4.6). Be
precise: in Loup, `@unsafe` is a **programmer-asserted** safety claim that
*bypasses* compiler verification — a speed-bump and an audit-grep target, **not
an access wall**. The actual misuse barriers v0.1 can enforce are: (a) raw
`BlockCipher.encryptBlock` consumes/returns a single 16-byte `Block` type, never
`bytes`, so ad-hoc ECB requires writing a visibly suspicious loop; (b) there is
no `ECB` object at all; (c) a `W_RAW_CIPHER` lint fires on any `loup.crypto.
lowlevel` import, and a project-manifest `crypto.denyLowlevel = true` switch
turns that import into a compile error. The security framing is: *AEAD is the
only thing on the easy path; everything else requires an import a reviewer and CI
will see.*

---

## §3 Cross-target strategy and the host-seam inventory

The pure-Loup + sans-I/O design means **one codebase across all targets**. Only
four host seams exist, and only the first is intrinsic to cryptography:

| Seam | Who owns it | Resolution |
|---|---|---|
| **Entropy** | `CAP_ENTROPY` capability (§10.2) | OS `getrandom`/`getentropy`/`BCryptGenRandom`/WASI `random_get`/WebCrypto `getRandomValues`/`RDSEED`; seeded-deterministic in tests. The **only** crypto host dependency. |
| **Transport** | Caller (sans-I/O, §16/§17) | Native socket, browser WebTransport/WebSocket, in-memory test pipe. The engine never touches it. |
| **Clock** | Caller (injected `Clock`) | Certificate validity windows, OCSP/CRL freshness, timestamp tokens. Never read implicitly. |
| **Filesystem** | Caller (loads bytes) | Trust stores, key files, `known_hosts` — the library parses bytes the caller supplied via `runtime.fs()`. |

**Per-target availability.** `loup.crypto.core`, `hash`, `xof`, `mac`, `cipher`,
`aead`, `kdf`, `encoding` are available everywhere including freestanding. The
big-integer layer (`math`) and everything above it (`sign`, `kex`, `pke`,
`pkcs`, `x509`, `tls`, `ssh`, `codesign`) require `bigint` and are **excluded on
freestanding** by a `.lppkg` feature flag at compile time. On the browser, the
entropy seam resolves to WebCrypto and there are no raw sockets — browser TLS
verification runs the sans-I/O engine over a WebTransport/WebSocket byte stream,
or the app uses platform TLS via `fetch` (§16.11).

---

## §4 Maturity, conformance, and versioning

Each algorithm carries a maturity level gated on test vectors (§19):

- **Stable** — passes its published correctness KATs (CAVP/RFC) **and** its
  Project Wycheproof robustness suite, on native **and** Wasm, bit-identically.
- **Provisional** — passes correctness KATs; robustness or a target pending.
- **Experimental** — implemented, KATs not yet wired or not yet green.

`AlgorithmId` (§6) is a **closed enum**: adding an algorithm is a versioned,
exhaustive-match-breaking change (deliberately, so consumers re-audit). All
crypto output is deterministic given identical input + injected RNG (CLAUDE.md
gotcha #2), which is what makes KAT replay across Stage0/1/2 bit-reproducible.

---

## §5 The object model — `loup.crypto.core` (the spine)

`loup.crypto.core` is the single foundation every other module consumes. It
defines no algorithm bodies — only the trait hierarchy, the material/key types,
typed algorithm identity, the error model, and the constant-time primitives.
Zero capability except where an `Rng` is injected.

### §5.1 Cross-cutting markers

```loup
namespace loup.crypto.core;

## A primitive that reports the typed algorithm identity it realizes (§6),
## so registry/audit code names it without a stringly-typed switch.
pub interface Algorithmic {
    pub func algorithm(): AlgorithmId;
}

## A primitive whose security depends on secret internal state that MUST be
## wiped. Implementors hold state in SecretBytes and implement Finalizable
## (§1-8.9); this marker lets `with`/scope tooling recognize them.
pub interface Zeroizing : Finalizable {
    ## Idempotent, best-effort wipe of all secret internal state (§7.1).
    pub func zeroize(): void;
}
```

### §5.2 Primitive trait hierarchy

`Hash`, `Xof`, `Mac`, `Aead`, `BlockCipher`, `StreamCipher`, `Signer`,
`Verifier`, `KeyAgreement`, `KeyEncapsulation`, `Kdf`, `PasswordKdf`, `Rng`,
`Drbg`. Two contracts are universal:

- **Verify throws, never returns `bool`** for the single-bit primitive surface
  (MAC/AEAD/signature): a `false` is too easy to ignore. Authentication failure
  raises `VerificationFailure` (§8), constant-time-to-failure, with no plaintext
  released. (For *multi-valued* verdicts — X.509 path validation, JWS, TLS cert
  checks — §5.2a uses a non-ignorable verdict object instead; a bare throw there
  invites catch-all swallowing.)
- **Seal/open are AEAD.** `Aead.seal(key, nonce, aad, plaintext) -> Ciphertext`
  and `Aead.open(...) -> bytes`; the typed `Nonce[A]` and key-usage budget
  (§5.5) make nonce reuse hard.

```loup
pub interface Hash : Algorithmic {
    pub func update(data: bytes): void;     # incremental
    pub func finalize(): Digest;            # consumes pending state
    pub static func oneShot(data: bytes): Digest;
}

pub interface Aead : Algorithmic {
    pub func seal(key: SymmetricKey, nonce: Nonce[Self], aad: bytes, plaintext: bytes): Ciphertext[Self];
    ## Throws VerificationFailure (constant-time) on tag mismatch; no plaintext on failure.
    pub func open(key: SymmetricKey, nonce: Nonce[Self], aad: bytes, ct: Ciphertext[Self]): bytes;
}

pub interface Signer : Algorithmic {
    pub func sign(key: PrivateKey, message: bytes, rng: Rng): Signature;
}
pub interface Verifier : Algorithmic {
    ## Throws SignatureInvalid on failure; never returns bool.
    pub func verify(key: PublicKey, message: bytes, sig: Signature): void;
}
```

### §5.2a Non-ignorable verdicts (multi-valued verification)

For path validation / JWS / TLS certificate checks, the correct answer is a
structured verdict the caller must policy-decide (valid / valid-but-revocation-
unknown / expired / untrusted-root / name-mismatch). These return a **sealed
enum verdict with no `ok` Boolean**, forcing an exhaustive `match`; the validated
identity lives only in the success arm:

```loup
pub enum CertVerdict {
    Trusted(VerifiedChain),                 # identity available only here
    Expired(CertId),
    UntrustedRoot(CertId),
    NameMismatch(string),
    RevocationUnknown(VerifiedChain),       # a POLICY decision, not a hard fail
    Revoked(CertId, RevocationReason),
    PathInvalid(PathError)
}
```

This shape is used uniformly by `x509` (§15), `codesign` (§18), and `tls.verify`
(§16.10).

### §5.4 Material and key types

`SecretBytes` (zeroizing, non-printable, ct-compared), `SymmetricKey`,
`PrivateKey`/`PublicKey`/`KeyPair` (algorithm-tagged), `SharedSecret` (no
`asKey`/`.bytes` escape — its **only** consumer is a `Kdf`, §14), `Salt`, `Prk`.
A `PublicKey` is validated at parse (§2 axiom 2).

### §5.5 Nonces, IVs, and the key-usage budget

`Nonce[A]`, `Iv[A]`, `CounterNonceSequence`, `RandomNonceSource`. Three reuse
barriers, with the review's required upgrade:

- **Typed key-usage budget.** `SymmetricKey` carries a usage counter; `Aead.seal`
  decrements it and throws `KeyUsageExhausted` at the algorithm limit (2³² for
  96-bit-random AES-GCM per SP 800-38D §8.3 / RFC 8446 §5.5). A single
  `(key, nonce)` collision in GCM is catastrophic (forgery + key recovery), so
  this is a first-class typed limit, not a TLS-only footnote.
- **Random-nonce GCM is opt-in.** The default AEAD API steers to nonce-misuse-
  resistant constructions (`Aes256GcmSiv`, `XChaCha20Poly1305`). Plain 96-bit-
  random AES-GCM requires an explicit `.withRandomNonce()` acknowledgment.
- **Counter exhaustion is terminal.** `CounterNonceSequence` throws
  `NonceExhausted` at wrap — never silently reuses a counter.

### §5.7 The facade

`loup.crypto` re-specifies the v1.12 sugar over this model:
`sha256(data) ≡ Sha256.oneShot(data).bytes`,
`constantTimeEqual(a, b) ≡ ct.bytesEq(a, b)`,
`randomBytes(n) ≡ Rng.system().bytes(n)`, plus `sha512`, `blake3`, `hmacSha256`,
`hmacSha512`. `loup.crypto.lowlevel` re-exports the raw ciphers behind the §2a
gate.

---

## §6 Typed algorithm identification

`AlgorithmId` is the closed enum of every v0.1 algorithm plus `RESERVED`
post-quantum codepoints. `Oid` is parse-don't-validate. The `Algorithm` registry
bridges names/OIDs ↔ ids and answers `isAead`/`isHash`/`securityStrengthBits`/
`isAllowed(policy)`. `CryptoPolicy` ∈ {`Modern`, `Fips_140_3`, `Legacy`,
`Custom`} selects which ids are permitted (e.g. `Modern` forbids SHA-1 signing).

---

## §7 Secret hygiene and constant-time discipline

### §7.1 `SecretBytes` — what v0.1 actually delivers (honest)

`SecretBytes` holds confidential material and on scope exit (`del`, `with`-block
close, ARC finalize) overwrites its backing store via a public `core` wipe API.
**What this does and does not guarantee** (the review's blocker fix):

- **Native (ARC) / freestanding:** deterministic overwrite at scope exit.
- **Wasm / GC targets:** wiping is **best-effort and may be ineffective** — a
  compacting collector can copy the buffer before any `finalize()` runs, and a
  pure-Loup store can be elided by the backend. v0.1 does **not** claim memory
  erasure on these targets. See §20.

The non-elidable-store codegen contract, the `E_CT_SECRET_BRANCH` secret-taint
lint, and the `@constant_time` MIR audit pass that a *guaranteed* version would
need **do not exist in the language today** and are filed as forward
dependencies (§App.A), not assumed by this spec.

### §7.2 Constant-time primitives — `loup.crypto.core.ct`

`bytesEq`, `isZero`, `compareBE`, `select`, `condCopy`, and a `Choice` mask type.
These are written without secret-dependent branches or indices **at the source
level**. Whether the backend preserves that property is **unverified** on Wasm in
v0.1 (§20).

---

## §8 Error model — oracle-resistant

`CryptoError : Exception` (§1-18) is the root. Three subtrees:

- **Security events:** `VerificationFailure` → `AuthFailure` / `SignatureInvalid`
  / `MacMismatch` / `PasswordMismatch`. **One non-revealing surface**, constant-
  time-to-failure, **no plaintext on failure**, and *never* reveals which check
  failed (defeats padding/MAC oracles).
- **Usage errors:** descriptive, public-structure-only (wrong key size, etc.).
- **Parse/material errors:** `CryptoParseError` → `InvalidKey` / `InvalidPoint` /
  `InvalidEncoding`; `EntropyUnavailable` / `EntropyExhausted` /
  `HealthTestFailed` / `DrbgUninstantiated`.

Protocol error taxonomies (TLS `bad_record_mac`, SSH `MacVerificationFailed`)
are **refinements** of this hierarchy, not parallel ones, and honor "reveal
nothing about which check failed." The §19.4 KAT harness asserts negative
vectors raise the correct error *category* — so the error model is itself
conformance-gated.

---

## §9 Big-integer and field arithmetic — `loup.crypto.math`

The substrate under RSA/ECDSA/EdDSA/ECDH/DH. **Load-bearing two-substrate rule:**

- **Public math** (keygen, signature *verification*, parameter validation) uses
  variable-time `bigint` (§1-bootstrap-2-expanded-numerics) — fast, simple, and
  the values are public.
- **Secret math** (private-key modexp, ECDSA/EdDSA/ECDH scalar multiplication,
  the X25519 ladder) uses a fixed-width Montgomery `FieldElement` with constant-
  time structure, RSA blinding, and deterministic nonces (RFC 6979 / EdDSA).

Fixed-width integers are spelled `UIntN[LIMBS: int]` — a **value generic** over
`int`, matching the `array[T, rank, base: int]` precedent (§1-4.10). (The review
corrected an earlier `UIntN[const LIMBS]` — Loup has no `const` generic keyword.)
Width aliases: `type U256 = UIntN[4]` … `type U4096 = UIntN[64]`. Open question
(§App.C): confirm value-generic monomorphization supports the Montgomery code; if
not, fall back to runtime-`LIMBS`, which has stated perf/constant-time costs.

Modules: `uint` (schoolbook+Karatsuba, ct select/swap), `modular` (Montgomery/
Barrett/Solinas `ModulusCtx`, `FieldElement`, `SecretScalar`, `pow` vs
`powSecret`), `gcd` (Euclid/Stein, `modInverse`, Jacobi, Tonelli-Shanks),
`prime` (Miller-Rabin per FIPS 186-5 tables, Baillie-PSW, safe/RSA/DSA prime
gen, FFDHE named groups — consumes an *injected* `RandomSource`), `crt`
(RSA-CRT, Garner), the curve layer (`weierstrass` complete formulas for NIST +
secp256k1; `montgomery` X25519/X448 ladder + clamp; `edwards` Ed25519/Ed448),
and `codec` (I2OSP/OS2IP, SEC1 point, RFC 7748/8032 — parse-don't-validate with
**non-optional** on-curve + subgroup checks, so invalid-curve/small-subgroup
rejection is implemented **once** and inherited by X.509, keys, TLS, and SSH).

**Side-channel posture (phased, honest):** Phase 2 ships *correct-first* with
ct structure, blinding, and deterministic nonces, with a documented timing-leak
caveat. Phase 5 hardens to verified constant-time (Bernstein–Yang safegcd,
per-backend `dudect`/`ct-verif` CI gate). See §20.

---

## §10 Entropy and the CSPRNG — `loup.crypto.random` (the single seam)

Layered per SP 800-90C: caller → `Rng` facade → `Drbg` → `EntropySource` →
`runtime.entropy` (`CAP_ENTROPY`).

- **§10.2 `CAP_ENTROPY`** — a **new** capability, amending the Volume 2 §2-5.1
  runtime-root surface. Granted by default on all non-freestanding profiles;
  deny-able. The **only** new capability the family introduces.

  **Status: IMPLEMENTED** (bootstrap Stage0). `runtime.entropy()` returns a
  stateless `system.entropy.Entropy` handle exposing `bytes(count: int):
  bytes` and `int(): int`. It is in the default permission set alongside
  `fs`/`proc`, removed by `--deny-all`, and re-grantable with
  `--allow-entropy`. `bytes` rejects negative counts and requests above the
  per-call host limit (1 MiB) — beyond that, seed a DRBG (§10.4), which is
  the documented pattern. Nothing above this seam consumes host randomness.
- **§10.3 Backends** — `getrandom`/`getentropy`/`BCryptGenRandom`/WASI
  `random_get`/WebCrypto/`RDSEED` (RDSEED not RDRAND, for true reseed entropy),
  plus a seeded-deterministic source for tests. **No silent weak fallback** — if
  the host source is unavailable, fail closed (`EntropyUnavailable`).

  **Status: PARTIAL.** Shipped: `getrandom(2)` on Linux/Android and
  `getentropy(2)` on the BSD family, each falling back to `/dev/urandom` —
  which is the *same kernel pool*, reached only when the syscall is filtered
  or absent, not a weakening — and `BCryptGenRandom` with the system-preferred
  RNG on Windows (no fallback there). If no source is usable the call fails with
  `EntropyUnavailable`; there is deliberately no time-seeded substitute,
  because a weak source that reports success cannot be detected by callers.
  Not yet shipped: WASI, WebCrypto, `RDSEED` reseed, and
  the seeded-deterministic test source (which per §10.7 is a distinct type
  layered above this seam, never a weakening of it).
- **§10.4 DRBG** — pure-Loup SP 800-90A: **HMAC-DRBG** (default — side-channel-
  friendlier in software, matches RFC 6979 reuse), **CTR-DRBG**, Hash-DRBG
  (Phase 5, for CAVP DRBGVS/FIPS posture). Strength bookkeeping, reseed
  intervals, SP 800-90B RCT/APT health tests.
- **§10.5 `Rng` facade** — `system()`, `systemPredictionResistant()`, `of(drbg)`,
  `deterministic(seed)`; unbiased `intRange`/`bigintBelow` by rejection sampling;
  SP 800-133 rule that keygen demands an `Rng`.

  **Status: IMPLEMENTED** (`random/rng.loup`). Shipped as free constructors
  rather than statics — `systemRng()`, `systemPredictionResistantRng()`,
  `rngOf(state, kind)`, `rngFromEntropy(...)`, `deterministicRng(seed)` — with
  `bytes`, `reseed`, `reseedFromSystem`, `reseedAfterFork`, `intBelow`,
  `intRange` and `bigintBelow` on the object. `rngOf` selects among all three
  §10.4 cores. A live `Rng` reseeds from the host every 2^20 draws;
  a prediction-resistant one before every draw. A non-live `Rng` *refuses*
  `reseedFromSystem` rather than silently acquiring a host source, which would
  destroy the reproducibility its callers depend on. Not yet enforced: the
  SP 800-133 rule that keygen demands an `Rng` — key generation still accepts
  caller-supplied bytes.
- **§10.7 Deterministic test mode** — `DeterministicRng` is a distinct type fed by
  `SeededEntropySource`; a production lint flags its use outside tests. This is
  what lets RFC 8448 / SSH-transcript / RFC 6979 replays be bit-reproducible.

  **Status: PARTIAL.** `DeterministicRng` is a distinct type, so a live and a
  seeded generator are not interchangeable at a call site. The production lint
  is **not** implemented — it is compiler work, and until it exists the type
  distinction is the only thing separating a test seed from production use.
- **§10.8 Fork-safety (honest limitation).** Pure Loup **cannot detect `fork()`**;
  a forked child reusing cached DRBG state produces identical ephemeral keys and
  nonces (catastrophic). v0.1 requires the application to call
  `Rng.reseedAfterFork()` post-fork; automatic fork-safety needs a host
  fork/pid signal that would widen the seam, deferred and documented, not
  hand-waved.

  **Status: IMPLEMENTED as specified** — `reseedAfterFork()` exists and pulls
  fresh host entropy. The limitation stands: nothing detects the fork, so an
  application that forgets the call gets a child reproducing the parent's
  keystream.

---

## §11–§14 Primitives, ciphers, KDFs, public key (summary; inventory in §App.B)

- **§11 Hash / XOF / MAC** — `loup.crypto.hash` (SHA-2 incl. SHA-512/224 &
  /256, SHA-3, BLAKE2b/2s, BLAKE3; SHA-1 & MD5 **verify/legacy-only**, §App.B),
  `loup.crypto.xof` (SHAKE128/256, cSHAKE, BLAKE3-XOF), `loup.crypto.mac` (HMAC,
  CMAC, Poly1305, KMAC, **GMAC**). FIPS 180-4/202, RFC 7693, BLAKE3 spec, FIPS
  198-1/RFC 2104, RFC 4493/SP 800-38B, RFC 8439, SP 800-185.
- **§12 Symmetric / AEAD** — `loup.crypto.cipher` (AES, ChaCha20 — lowlevel-
  quarantined, §2a) and `loup.crypto.aead` (AES-128/256-GCM, AES-256-GCM-SIV,
  AES-CCM, ChaCha20-Poly1305, XChaCha20-Poly1305, AES-KW/KWP). FIPS 197, SP
  800-38A/C/D/F, RFC 8439/8452/3394, RFC 5116. Nonce typing + key-usage budget
  per §5.5.
- **§13 KDF** — `loup.crypto.kdf`: HKDF (+ HKDF-Expand-Label for TLS 1.3),
  KBKDF (SP 800-108), SP 800-56C two-step + **SP 800-56A Concat-KDF** +
  **ANSI-X9.63-KDF** (ECIES/IKE), and password KDFs PBKDF2 / scrypt / Argon2id
  with **pinned OWASP/RFC 9106 minimum default params** and a compile-time floor
  lint. RFC 5869, SP 800-108/56A/56C, RFC 8018/7914/9106.
- **§14 Signatures & key agreement** — `loup.crypto.sign` (Ed25519/Ed448 with
  **ph/ctx context variants** per RFC 8032 §5.1, ECDSA P-256/384/521 with RFC
  6979 deterministic nonces, RSASSA-PSS, RSASSA-PKCS1-v1.5) and
  `loup.crypto.kex` (X25519/X448, ECDH P-curves; `SharedSecret` must flow through
  a `Kdf`). FIPS 186-5, RFC 8032/8017/6979/7748, SEC1, SP 800-56A.
- **§14a Public-key encryption — `loup.crypto.pke`** (Phase 2; the review's
  major gap). RSA-OAEP (mandatory; MGF1 + typed label; **constant-time-to-
  failure decryption** that defeats Manger's attack), RSAES-PKCS1-v1.5
  **decrypt** quarantined behind lowlevel with a Bleichenbacher-mitigation note,
  and ECIES / sealed-box as the modern key-transport path (HPKE RFC 9180 hybrid
  reserved for Phase 5). RFC 8017 §7.

---

## §15 Encoding and certificate/key formats

This section specifies the **encoding + X.509 certificate** domain in full: the
four strictly-stacked modules `loup.crypto.encoding`, `loup.crypto.pkcs`,
`loup.crypto.x509`, and `loup.crypto.x509.verify`. It is the *parse / build /
validate* half of the family — it operates on **byte buffers only**, performs
**no I/O** (the revocation *fetch* is the caller's transport, §15.4.6), and
needs **no capability** except the caller-injected `Clock` (validity windows)
and `runtime.entropy` (only when *building* an OCSP nonce, CSR, or serial).
Everything here obeys the §2 axioms — parse-don't-validate everywhere, typed
algorithm identity, and the §5.2a non-Boolean verdict for the verifier.

At a glance (each layer detailed in the subsection cited):

- **`loup.crypto.encoding`** (§15.1) — Base16/32/64/64url (RFC 4648), PEM label
  registry (RFC 7468, strict armor), **strict canonical DER** reader/writer
  (X.690 — BER ambiguity rejected; bounded against length-overflow,
  deep-nesting, non-canonical-integer attacks). Parse-don't-validate typed DER
  value model. This is the **hardened parse boundary** (§15.1.5).
- **`loup.crypto.pkcs`** (§15.2) — PKCS#1 (RFC 8017 App.A), PKCS#8 unencrypted +
  EncryptedPrivateKeyInfo via PBES2 (RFC 5958/5208; passphrase-wrong vs
  malformed-structure must not be timing-distinguishable, §15.2.5), SPKI
  (RFC 5280/5480/8410), SEC1 (RFC 5915), the OpenSSH private/public key formats,
  JWK (RFC 7517/7518/8037), CMS/PKCS#7 SignedData (RFC 5652, consumed by §18).
- **`loup.crypto.x509`** (§15.3) — `Certificate` / `CertificateChain` /
  `CertificationRequest` (PKCS#10), the extension model (BasicConstraints,
  KeyUsage, ExtendedKeyUsage, SubjectAltName, AKI/SKI, NameConstraints,
  CRLDistributionPoints, AuthorityInfoAccess, CertificatePolicies), all
  parse-don't-validate. RFC 5280.
- **`loup.crypto.x509.verify`** (§15.4) — the full **RFC 5280 §6
  path-validation** algorithm: `TrustStore`/`TrustAnchor`, signature chain,
  validity windows (injected `Clock`), name constraints, basicConstraints/
  pathLen, KeyUsage/EKU, basic policy processing; revocation via **CRL**
  (RFC 5280 §5) and **OCSP** (RFC 6960) parsing + response-checking (network
  fetch is the caller's). Hostname matching per **RFC 6125 / RFC 9525**
  (SAN-primary, CN deprecated) is owned here; the TLS engine passes `serverName`
  through (§16). The `Verifier` is configured with a `TrustStore` + typed
  `VerifyPolicy` (purpose = TLS-server/TLS-client/code-signing/…, revocation
  mode, clock) and returns the §5.2a `CertVerdict` — **never a bool** (§15.4.3).
  Validation corpus: Project Wycheproof X.509 + ECDSA/DSA-verify suites, the
  NIST **PKITS** path-validation corpus, real-CA-root interop (§15.4.9).

The dependency arrows run strictly downward and onto the §5 spine; no layer
reaches upward, and the encoding layer (the part adversaries feed hostile bytes
to) knows only byte structure — never a key, a secret, or a certificate type:

```
loup.crypto.core  (§5: SecretBytes, PrivateKey/PublicKey, AlgorithmId, Oid, CryptoError)
        ▲  used by every layer
loup.crypto.encoding        ← §15.1   (no crypto math; pure byte structure)
        ▲
loup.crypto.pkcs            ← §15.2   (encoding + core keys)
        ▲
loup.crypto.x509            ← §15.3   (encoding + pkcs + core)
        ▲
loup.crypto.x509.verify     ← §15.4   (x509 + core signature verify + injected Clock)
```

### §15.0 Domain-wide contracts

Three contracts bind every type in §15 and are stated once here:

1. **Parse-don't-validate is structural, not advisory.** No type in this domain
   exposes an `isValidX(bytes): bool` predicate. The only ingress to a
   `Certificate`, `Spki`, `PrivateKey`, etc. is a parsing constructor returning
   the fully-typed value or throwing `CryptoParseError` (§8). Holding the value
   *is* the proof of structural well-formedness; holding a `CertVerdict.Trusted`
   (§5.2a) is the proof of path validity. Parsed values are deeply immutable
   (`own`-constructed, no mutators), and their constructors are private — you
   cannot fabricate a "validated" object from already-trusted fields.
2. **The encoding boundary is the only place attacker bytes are decoded.**
   `loup.crypto.encoding` (§15.1) turns hostile buffers into bounded, canonical,
   typed values once, at the edge. §15.2–§15.4 consume only those typed outputs;
   they never re-scan raw bytes. This keeps the trusted parsing core small and
   free of secrets.
3. **Errors are layered refinements of §8, never a parallel hierarchy.**
   Structural failures are `CryptoParseError → InvalidEncoding` (the codec
   layer) and `InvalidKey`/`InvalidPoint` (the key layer); certificate semantics
   and path failures are carried in the §5.2a `CertVerdict` arms and the
   `PathError` it contains (§15.4.3). Signature-check failures inside the chain
   route through the §8 constant-time `SignatureInvalid` surface. The §19.4 KAT
   harness asserts negative vectors raise the correct *category* — so this
   domain's error model is itself conformance-gated.

---

### §15.1 `loup.crypto.encoding` — the hardened encoding boundary

Governing: ITU-T X.690 (BER/CER/DER), RFC 7468 (PEM), RFC 4648 (base16/base64).
This module is the **trusted parsing boundary** (§15.0.2): no cryptographic
math, no key material — only byte structure. Its job is to turn
attacker-controlled buffers into typed, bounded, **canonical-DER-only** values
and to *reject* everything that is legal BER but not DER (§15.1.3). It is
available on every target including freestanding (§3) since it needs no
`bigint` for its base/PEM surface (the DER `INTEGER → bigint` path requires
`bigint`, so on freestanding the DER reader is available but `Der.Integer`
construction is feature-gated alongside `math`, §3).

#### §15.1.1 Binary text encodings — base64 / base64url / base16

Governing: RFC 4648. Vectors: RFC 4648 §10.

```loup
namespace loup.crypto.encoding;

pub enum Base64Variant { standard, urlSafe }     # RFC 4648 §4 vs §5

pub func base64Encode(data: bytes, variant: Base64Variant = standard, pad: bool = true): string;
pub func base64Decode(text: string, variant: Base64Variant = standard): bytes;  # throws InvalidEncoding
pub func base32Encode(data: bytes, pad: bool = true): string;                   # RFC 4648 §6
pub func base32Decode(text: string): bytes;
pub func hexEncode(data: bytes, upper: bool = false): string;
pub func hexDecode(text: string): bytes;
```

Strictness is the security property; every decoder is strict:

- `base64Decode` rejects out-of-alphabet characters, internal whitespace (the
  *raw* decoder is strict — PEM line-folding is handled by §15.1.4, not here),
  bad padding, **and non-zero bits in the final partial group** (RFC 4648 §3.5
  "canonical encoding": a decoder MUST reject `=`/`==` groups whose discarded
  bits are set). Non-canonical base64 is a real malleability source, so it is
  refused, not normalized.
- `urlSafe` uses `-`/`_` and (with `pad=false`) omits `=`, per JWS/JWK
  conventions (RFC 7515 §2). The JWK reader (§15.2.7) always calls
  `base64Decode(text, urlSafe)` *and* additionally rejects any `=`.
- `hexDecode` requires even length and `[0-9a-fA-F]`; it rejects `0x` prefixes
  and separators.

These are leaf utilities; none read entropy or the clock.

#### §15.1.2 The typed DER value model

A parsed DER document is a tree of `Der` values — a sealed enum (§1-7) with one
variant per ASN.1 type the family needs. The enum is the parse-don't-validate
carrier: a `Der.Integer` *is* a canonically-encoded integer; nothing re-checks
it downstream.

```loup
pub enum Der {
    Boolean(bool),                          # X.690 §8.2 / §11.1
    Integer(bigint),                        # §8.3 / §11.3 — canonical minimal two's-complement
    BitString(BitStr),                      # §8.6 — unused-bit count + bytes
    OctetString(bytes),                     # §8.7
    Null,                                   # §8.8
    Oid(Oid),                               # §8.19 — bridges to §6 (Oid is parse-don't-validate)
    Utf8String(string),                     # §8.21 (tag 12)
    PrintableString(string),                # restricted alphabet (tag 19)
    Ia5String(string),                      # IA5/ASCII (tag 22)
    UtcTime(UtcTime),                       # §11.8 — PKIX-profiled (§15.1.6)
    GeneralizedTime(GenTime),               # §11.7 — PKIX-profiled (§15.1.6)
    Sequence(list[Der]),                    # §8.9 (ordered)
    Set(list[Der]),                         # §8.11 — DER SET/SET OF ordering already enforced
    Tagged(TagClass, int, TagForm, TaggedContent),  # context/app/private tagged
    Unknown(Tag, bytes),                    # recognized-but-not-modeled UNIVERSAL — never dropped
}

pub struct BitStr { pub unusedBits: int; pub data: bytes; }    # unusedBits ∈ 0..=7
pub enum TagClass { universal, application, context, private }
pub enum TagForm  { primitive, constructed }
pub struct Tag { pub class: TagClass; pub constructed: bool; pub number: int; }
pub enum TaggedContent {
    parsed(Der),    # EXPLICIT tagging: inner TLV decoded
    raw(bytes),     # IMPLICIT tagging: content kept verbatim for the schema layer
}
```

Design notes (each closes a concrete bug class):

- **`Integer` is `bigint`, always.** ASN.1 integers are unbounded; a fixed
  width would truncate serial numbers and RSA moduli. The reader enforces
  canonical minimal encoding (§15.1.3) *before* constructing the `bigint`.
- **`BitString` carries explicit `unusedBits`** — the SPKI public-key bits and
  the `KeyUsage` flag bits need the exact count; collapsing it corrupts both.
- **`Set` preserves order, but the reader has already enforced DER SET OF
  ordering** (§15.1.3), so schema code can rely on it.
- **`Tagged` keeps class + number** — X.509 is full of context-tagged optionals
  (`[0] version`, `[3] extensions`, the `GeneralName` choices); implicit content
  is preserved raw for the schema layer to reinterpret.
- **`Unknown` never silently drops data** — an unrecognized universal tag
  surfaces so the schema layer decides (reject-if-critical vs ignore). Silence
  is how parser-differential attacks get in.

#### §15.1.3 The DER reader — strict canonical decoding

```loup
pub struct DerLimits {
    pub maxDepth: int = 64;             # §15.1.5 nesting bound
    pub maxLength: int = 0;             # 0 ⇒ len(input); never larger than input
    pub maxElements: int = 1_000_000;   # total TLV count bound
}

pub func derParse(input: bytes, limits: DerLimits = DerLimits()): Der;   # throws InvalidEncoding
# Cursor form for the schema layer: parse exactly one element, return it + bytes consumed.
pub func derParseOne(input: bytes, at: int, limits: DerLimits): (Der, int);
```

`derParse` decodes **exactly one** top-level element and requires it consume the
**entire** input — any trailing byte is rejected (an X.509 document is exactly
one `Certificate`; trailing data is a known smuggling vector). The reader
enforces the full DER canonical-form rule set (X.690 §10/§11) and **rejects**
every encoding that is legal BER but not DER, with `InvalidEncoding`:

| # | Rejected non-canonical form | X.690 ref |
|---|---|---|
| 1 | **Indefinite-length** (`0x80` length + end-of-contents) | §8.1.3.6, §10.1 |
| 2 | **Non-minimal definite length** (long form where short suffices; leading-zero length octets) | §10.1 |
| 3 | **Constructed encoding of a string/OCTET STRING** that DER requires primitive | §10.2 |
| 4 | **Non-minimal INTEGER** (superfluous leading `0x00`/`0xFF`) | §8.3.2 |
| 5 | **BOOLEAN** TRUE octet other than `0xFF` | §11.1 |
| 6 | **BIT STRING** with non-zero unused trailing bits on named bits, unused-bits > 7, or unused-bits ≠ 0 on an empty string | §11.2 |
| 7 | **SET OF** members not sorted by their DER encoding | §11.6 |
| 8 | **SET** components not in canonical tag order | §11.5 |
| 9 | **OID** sub-identifier with a leading `0x80` (non-minimal base-128) or unterminated final byte | §8.19 |
| 10 | **UTCTime/GeneralizedTime** not in canonical Zulu form (§15.1.6) | §11.7/§11.8 |
| 11 | **Length exceeding remaining input**, `maxLength`, or the int range | §8.1.3 |
| 12 | **Tag number** in non-minimal high-tag-number form | §8.1.2 |

Rejecting non-canonical BER is itself a security property: it eliminates an
entire class of **parser-differential / signature-malleability** attacks where
two parsers disagree on one byte string's meaning, and it makes the
"two encodings, one semantic value" malleability Wycheproof targets impossible.
Acceptance of indefinite-length and constructed-string BER has been the root of
multiple real CVEs; this reader refuses both.

#### §15.1.4 The DER writer and PEM strict armor

```loup
pub func derEncode(value: Der): bytes;       # always canonical DER, never BER

pub class DerBuilder {                        # fluent canonical builder
    pub func sequence(body: fn(DerBuilder): void): DerBuilder;
    pub func set(body: fn(DerBuilder): void): DerBuilder;    # sorts SET OF by encoding
    pub func integer(v: bigint): DerBuilder;
    pub func oid(v: Oid): DerBuilder;
    pub func bitString(unusedBits: int, data: bytes): DerBuilder;
    pub func octetString(data: bytes): DerBuilder;
    pub func explicit(tag: int, body: fn(DerBuilder): void): DerBuilder;
    pub func implicit(tag: int, body: fn(DerBuilder): void): DerBuilder;
    pub func finish(): bytes;
}
```

The writer can emit **only** canonical DER — there is no BER option. It computes
minimal lengths, sorts `SET OF` by encoded bytes (X.690 §11.6), normalizes
INTEGER to minimal two's-complement, and emits times in canonical Zulu form.
This guarantees the round-trip invariant `derParse(derEncode(v)) == v` (the
property §19.4 asserts).

**PEM** (RFC 7468, the *strict* profile):

```loup
pub struct PemBlock { pub label: PemLabel; pub der: bytes; }   # explanatory text + RFC-1421 headers ignored/rejected

pub enum PemLabel {                          # the closed label registry (RFC 7468 §4)
    certificate,          # "CERTIFICATE"            §5.1
    certificateRequest,   # "CERTIFICATE REQUEST"    §7
    x509Crl,              # "X509 CRL"               §6
    publicKey,            # "PUBLIC KEY" (SPKI)      §13
    privateKey,           # "PRIVATE KEY" (PKCS#8)   §10
    encryptedPrivateKey,  # "ENCRYPTED PRIVATE KEY"  §11
    rsaPrivateKey,        # "RSA PRIVATE KEY" (PKCS#1, legacy)
    rsaPublicKey,         # "RSA PUBLIC KEY"  (PKCS#1, legacy)
    ecPrivateKey,         # "EC PRIVATE KEY"  (SEC1, legacy)
    opensshPrivateKey,    # "OPENSSH PRIVATE KEY"
    cms,                  # "CMS"                    §9
    other(string),        # unknown labels surfaced, never guessed
}

pub func pemParse(text: string): list[PemBlock];                   # throws InvalidEncoding
pub func pemParseOne(text: string, expect: PemLabel): PemBlock;    # parse-don't-validate ingress
pub func pemEncode(label: PemLabel, der: bytes): string;           # strict, 64-column
```

Strict-armor rules (each a real interop/security concern): the BEGIN/END labels
**must match** (a `BEGIN CERTIFICATE` closed by `END PRIVATE KEY` is rejected,
RFC 7468 §2); the body is decoded with §15.1.1's canonical-base64 rule; RFC-1421
`Proc-Type:`/`DEK-Info:` headers are **rejected, not skipped** — the
OpenSSL-legacy encrypted-PEM (`DEK-Info`, often MD5-KDF, unauthenticated) format
is **deliberately unsupported**: encrypted keys MUST use PKCS#8
`ENCRYPTED PRIVATE KEY` (§15.2.5). `pemParseOne` returns exactly one block of
the expected label or throws — the typed ingress for higher layers, which always
know what they expect. PEM here is purely armor/transport; it never interprets
the inner DER.

#### §15.1.5 DER parser hardening (the attack surface)

DER parsing is the classic remote attack surface: attacker-controlled,
recursive, length-prefixed. This reader is hardened on every known axis and
carries an explicit bound:

- **Length-field overflow.** The long-form length accumulates into a checked
  integer; any length that does not fit the platform integer, exceeds bytes
  remaining, or exceeds `maxLength` is rejected **before any allocation**. The
  parser never sizes a buffer from an unvalidated length field (the canonical
  "declared 4 GB, 8 bytes present" DoS). Every content read is bounds-checked
  against the *enclosing* element's remaining length, not just the outer input.
- **Deep / unbounded nesting.** Recursion depth is bounded by `maxDepth`
  (default 64; X.509 needs a handful). Depth is tracked explicitly and failure
  is `InvalidEncoding`, never a native stack overflow.
- **Element-count cap.** `maxElements` bounds total TLV count so millions of
  empty elements cannot exhaust memory/time. With the depth bound, total work is
  linear in input size.
- **No quadratic re-scans.** The cursor API (`derParseOne` + consumed count)
  walks a SEQUENCE in one forward pass; lengths are read once.
- **Integer/OID canonicalization at the boundary** (table rows 4, 9) — no higher
  layer ever sees a non-canonical integer or OID, closing signature-malleability
  via alternative encodings.
- **No panics on malformed input — ever.** Every malformed input is a typed
  `InvalidEncoding`, never a panic/abort; verified by the §19 adversarial corpus.

**Guarantee:** for any input of length *n*, `derParse` runs in **O(*n*) time and
O(*n*) space, terminates, and yields a canonical `Der` tree or throws
`InvalidEncoding`.** That bound is the security contract §15.2–§15.4 rely on.

#### §15.1.6 Time types — PKIX-profiled UTCTime / GeneralizedTime

Governing: X.690 §11.7/§11.8 narrowed by RFC 5280 §4.1.2.5.

```loup
pub struct UtcTime { pub instant: Instant; }   # YYMMDDHHMMSSZ
pub struct GenTime { pub instant: Instant; }   # YYYYMMDDHHMMSSZ
```

RFC 5280 narrows X.690's permissive time forms (itself a hardening measure):
`UTCTime` is exactly `YYMMDDHHMMSSZ` (seconds always present, always Zulu, no
fractional seconds, no offset; `YY ≥ 50 ⇒ 19YY`, `YY < 50 ⇒ 20YY`);
`GeneralizedTime` is exactly `YYYYMMDDHHMMSSZ` (fractional seconds forbidden in
certificates). Any non-Zulu, offset, fractional, or missing-seconds form is
rejected; calendar validity is checked while constructing the `Instant`. The
certificate parser (§15.3.1) additionally enforces the §4.1.2.5 boundary —
dates through 2049 MUST be `UTCTime`, 2050+ MUST be `GeneralizedTime`.

---

### §15.2 `loup.crypto.pkcs` — key serialization

Governing: RFC 8017 (PKCS#1), RFC 5958 / 5208 (PKCS#8), RFC 5280 §4.1.2.7 +
RFC 5480 + RFC 8410 (SPKI), RFC 5915 + SEC1 v2 (EC), RFC 7517 / 7518 / 8037
(JWK), OpenSSH `PROTOCOL.key` + RFC 4253/4716, RFC 5652 (CMS). This module maps
byte buffers ↔ the §5.4 key types (`PrivateKey`/`PublicKey`, algorithm-tagged).
It performs **no key arithmetic** — it extracts/serializes parameters and
constructs the typed key, which validates its own invariants in §5/§9
(on-curve, subgroup, exponent range — §2 axiom 2). Every importer is
parse-don't-validate; there is no untyped "raw key params" struct.

| Format | Type | Key types | Governing | Vector source |
|---|---|---|---|---|
| **SPKI** | `Spki` | RSA, EC, Ed25519/448, X25519/448, DSA | RFC 5280 §4.1.2.7, 5480, 8410 | Wycheproof, RFC, CA roots |
| **PKCS#1** | `Pkcs1Public`/`Pkcs1Private` | RSA only | RFC 8017 App.A | RFC 8017 App.C, OpenSSL |
| **SEC1** | `Sec1Private` | EC private only | RFC 5915, SEC1 v2 | RFC 5915, Wycheproof |
| **PKCS#8** plain | `Pkcs8` | all (alg-tagged inner) | RFC 5958/5208 | Wycheproof, OpenSSL |
| **PKCS#8** encrypted | `EncryptedPkcs8` | all, under PBES2 | RFC 5958 §3, 8018 | OpenSSL-produced |
| **OpenSSH** priv/pub | `OpenSshPrivateKey`/`OpenSshPublicKey` | RSA, ECDSA, Ed25519 | `PROTOCOL.key`, RFC 4253/4716 | ssh-keygen round-trip |
| **JWK** | `Jwk`/`JwkSet` | RSA, EC, OKP, oct | RFC 7517/7518/8037 | RFC 7517 App, Wycheproof |
| **CMS** | (in §18) | — | RFC 5652 | — |

#### §15.2.1 SubjectPublicKeyInfo / SPKI

Governing: RFC 5280 §4.1.2.7; RFC 4055 (RSA), RFC 5480 (EC), RFC 8410 (Edwards/
Montgomery). The canonical public-key container for the whole PKI and the form
embedded in every certificate.

```
SubjectPublicKeyInfo ::= SEQUENCE { algorithm AlgorithmIdentifier, subjectPublicKey BIT STRING }
```

```loup
pub struct Spki { /* opaque; constructed only by parse/from */ }
impl Spki {
    pub static func parse(der: bytes): Spki;          # throws InvalidKey/InvalidEncoding
    pub static func fromPem(pem: string): Spki;
    pub func publicKey(): PublicKey;                  # the typed §5.4 key (already validated)
    pub func algorithm(): AlgorithmId;
    pub func toDer(): bytes;
    pub func toPem(): string;                         # "PUBLIC KEY"
}
impl PublicKey { pub func toSpki(): Spki; }           # bridge back to §5
```

The parser reads `AlgorithmIdentifier`, resolves it via the §6 OID bridge to an
`AlgorithmId`, and dispatches the `subjectPublicKey` BIT STRING to the
algorithm-specific decoder: **RSA** (`rsaEncryption`) → DER `RSAPublicKey`
(§15.2.2), parameters MUST be `NULL` (RFC 4055); **EC** (`id-ecPublicKey`) →
named-curve OID in the parameters (RFC 5480), the BIT STRING is the EC point
(point-on-curve delegated to §9); **Edwards/Montgomery** (RFC 8410: Ed25519
1.3.101.112, Ed448 .113, X25519 .110, X448 .111) → parameters **absent** (not
NULL — a real interop rule), BIT STRING is the raw key; **DSA** (RFC 3279) →
`p,q,g` parameters. An algorithm-vs-inner-key disagreement throws `InvalidKey`.

#### §15.2.2 PKCS#1 — RSA keys

Governing: RFC 8017 Appendix A.1. Vectors: RFC 8017 App.C; OpenSSL.

```
RSAPublicKey  ::= SEQUENCE { modulus INTEGER, publicExponent INTEGER }
RSAPrivateKey ::= SEQUENCE { version, modulus, publicExponent, privateExponent,
                             prime1, prime2, exponent1, exponent2, coefficient, otherPrimeInfos OPTIONAL }
```

```loup
pub struct Pkcs1Public  { /* opaque */ }
pub struct Pkcs1Private { /* opaque */ }
impl Pkcs1Public  { pub static func parse(der: bytes): Pkcs1Public; pub func publicKey(): PublicKey; pub func toDer(): bytes; }
impl Pkcs1Private { pub static func parse(der: bytes): Pkcs1Private; pub func privateKey(): PrivateKey; pub func toDer(): bytes; }
```

PKCS#1 is RSA-only. The `RSAPrivateKey` CRT parameters (`prime1/2`,
`exponent1/2`, `coefficient`) are secret and are loaded straight into the §5.4
`PrivateKey`'s `SecretBytes`-backed store (zeroizing, §7.1) — never copied into
ordinary `bytes` that linger. Legacy PEM labels `RSA PRIVATE KEY` /
`RSA PUBLIC KEY` map here; modern callers are steered to PKCS#8 (§15.2.4) and
SPKI (§15.2.1).

#### §15.2.3 SEC1 — EC private keys

Governing: RFC 5915 / SEC1 v2 §C.4. Vectors: RFC 5915, Wycheproof EC keys.

```
ECPrivateKey ::= SEQUENCE { version INTEGER {ecPrivkeyVer1(1)}, privateKey OCTET STRING,
                            parameters [0] ECParameters OPTIONAL, publicKey [1] BIT STRING OPTIONAL }
```

```loup
pub struct Sec1Private { /* opaque */ }
impl Sec1Private { pub static func parse(der: bytes): Sec1Private; pub func privateKey(): PrivateKey; pub func toDer(): bytes; }
```

The `privateKey` OCTET STRING is the secret scalar → `SecretBytes`. The
named-curve comes from the `[0]` parameters (or, when SEC1 is the inner key of a
PKCS#8 wrapper, from the outer PKCS#8 `AlgorithmIdentifier` per RFC 5915,
§15.2.4). The optional `[1] publicKey` is cross-checked against the scalar by §9
if present. Legacy PEM label `EC PRIVATE KEY`.

#### §15.2.4 PKCS#8 — PrivateKeyInfo (unencrypted)

Governing: RFC 5958 (obsoletes RFC 5208). Vectors: Wycheproof, OpenSSL.

```
OneAsymmetricKey ::= SEQUENCE {           -- a.k.a. PrivateKeyInfo
    version INTEGER, privateKeyAlgorithm AlgorithmIdentifier, privateKey OCTET STRING,
    attributes [0] IMPLICIT Attributes OPTIONAL, publicKey [1] IMPLICIT BIT STRING OPTIONAL }  -- v2
```

```loup
pub struct Pkcs8 { /* opaque */ }
impl Pkcs8 {
    pub static func parse(der: bytes): Pkcs8;
    pub static func fromPem(pem: string): Pkcs8;
    pub func privateKey(): PrivateKey;       # algorithm-tagged §5.4 key
    pub func algorithm(): AlgorithmId;
    pub func toDer(): bytes;
    pub func toPem(): string;                # "PRIVATE KEY"
}
impl PrivateKey { pub func toPkcs8(): bytes; }   # bridge back to §5
```

PKCS#8 is the **universal, algorithm-tagged** private-key container and the
preferred form. The parser resolves `privateKeyAlgorithm` via the §6 OID bridge,
then decodes the inner `privateKey` OCTET STRING with the algorithm's decoder:
RSA → PKCS#1 `RSAPrivateKey` (§15.2.2); EC → SEC1 `ECPrivateKey` (§15.2.3, curve
from the outer parameters); Ed25519/Ed448/X25519/X448 → the raw key OCTET STRING
(RFC 8410 §7 — note the *double* OCTET STRING wrapping for Edwards keys, a real
gotcha the reader handles). The inner secret lands in `SecretBytes`.

#### §15.2.5 PKCS#8 — EncryptedPrivateKeyInfo (PBES2) — the timing-safety note

Governing: RFC 5958 §3 + RFC 8018 (PBES2/PBKDF2) + RFC 7914 (scrypt). Vectors:
OpenSSL-produced encrypted PKCS#8 (known passphrase) **plus** corrupted-
ciphertext negatives.

```
EncryptedPrivateKeyInfo ::= SEQUENCE { encryptionAlgorithm AlgorithmIdentifier, encryptedData OCTET STRING }
PBES2-params ::= SEQUENCE { keyDerivationFunc AlgorithmIdentifier, encryptionScheme AlgorithmIdentifier }
```

```loup
pub struct EncryptedPkcs8 { /* opaque — holds structure only, no secret yet */ }
impl EncryptedPkcs8 {
    pub static func parse(der: bytes): EncryptedPkcs8;       # structure only; cannot fail on a wrong passphrase
    pub static func fromPem(pem: string): EncryptedPkcs8;
    # A DISTINCT, secret-consuming step. Every failure mode is ONE opaque outcome.
    pub func decrypt(passphrase: SecretBytes): Pkcs8;        # throws KeyDecryptFailed (single variant)
}
```

`parse` validates only **structure** (the PBES2 params, KDF/cipher OIDs, salt,
iteration count) — it never touches the passphrase. `decrypt` is the sensitive
operation, and this is the **single most important misuse note in the key
layer** (the §1/§2 mandate made concrete):

> `decrypt` MUST NOT leak — via timing **or** via the error value — whether the
> **passphrase was wrong** versus whether the **decrypted structure was
> malformed**.

The design enforces this, consistent with the §8 oracle-resistant model:

- The only error `decrypt` raises is `KeyDecryptFailed` — **no** sub-variant,
  **no** field, **no** message distinguishing "bad padding" vs "bad passphrase"
  vs "good decrypt but inner DER is garbage." All three collapse to one value.
- The KDF (PBKDF2/scrypt) runs to completion regardless; the iteration count
  comes from the parsed parameters and is not short-circuited.
- An authenticated cipher (AES-GCM) fails its tag check **constant-time** inside
  §5/§8; a CBC scheme is decrypted and the padding check is **folded into the
  inner-DER structural parse as one non-branching outcome**, so a padding-oracle
  cannot distinguish "pad wrong" from "structure wrong" (the classic Vaudenay
  padding oracle is denied — there is no PKCS#7-padding-specific error).
- On success the recovered inner `PrivateKeyInfo` is handed to `Pkcs8` and the
  intermediate plaintext buffer is zeroized (§7.1).

Because the safe-to-be-specific structural check (`parse`) and the
secret-dependent operation (`decrypt`) are *separate methods*, malformed-
structure errors surface from `parse` as ordinary `InvalidEncoding`, while the
secret operation has exactly one indistinguishable failure. The OpenSSL-legacy
`DEK-Info` encrypted-PEM is not accepted (§15.1.4) — PBES2 is the only supported
encrypted-key path.

#### §15.2.6 OpenSSH private and public key formats

Governing: OpenSSH `PROTOCOL.key` (the `openssh-key-v1` private format),
RFC 4253 §6.6 + RFC 4716 (public). Vectors: `ssh-keygen` round-trips for RSA,
ECDSA (nistp256/384/521), Ed25519.

```loup
pub struct OpenSshPublicKey  { /* opaque */ }
pub struct OpenSshPrivateKey { /* opaque */ }
impl OpenSshPublicKey {
    pub static func parse(line: string): OpenSshPublicKey;   # "ssh-ed25519 AAAA... comment"
    pub func publicKey(): PublicKey;  pub func comment(): string;  pub func toLine(): string;
}
impl OpenSshPrivateKey {
    pub static func parse(pem: string): OpenSshPrivateKey;   # "OPENSSH PRIVATE KEY"
    pub func decrypt(passphrase: SecretBytes): OpenSshPrivateKey;  # same opaque contract as §15.2.5
    pub func privateKey(): PrivateKey;  pub func publicKey(): PublicKey;
}
```

The OpenSSH public format is **not** ASN.1 — it is the SSH length-prefixed
`string`/`mpint` wire encoding (RFC 4251 §5) base64-wrapped with an algorithm-
name prefix. Its parser decodes that wire format directly, through a separate
length-prefixed reader that shares §15.1.5's bounds discipline (every SSH
`uint32` length is checked against remaining input *before* use). The private
`openssh-key-v1` format wraps the key in a check-int-guarded block; when
passphrase-protected it uses bcrypt-pbkdf (§13) + a cipher, and `decrypt` obeys
the **same opaque-failure contract as §15.2.5** (the duplicated check-int is the
integrity signal; mismatch ⇒ the single `KeyDecryptFailed`). The SSH engine
(§17) consumes these types directly for `known_hosts`/`authorized_keys`.

#### §15.2.7 JWK — JSON Web Key

Governing: RFC 7517 (JWK) + RFC 7518 (JWA) + RFC 8037 (OKP). Vectors: RFC 7517
App.A/C, Wycheproof JWK suites.

```loup
pub struct Jwk    { /* opaque */ }
pub struct JwkSet { pub keys: list[Jwk]; }     # RFC 7517 §5
impl Jwk {
    pub static func parse(json: string): Jwk;
    pub func keyType(): AlgorithmId;  pub func isPrivate(): bool;
    pub func publicKey(): PublicKey;  pub func privateKey(): PrivateKey;   # throws if public-only
    pub func toJson(includePrivate: bool = false): string;
}
impl JwkSet { pub static func parse(json: string): JwkSet; }
```

The web-interop format. The reader uses `core.json` to parse, then maps `kty`:
**RSA** (RFC 7518 §6.3) `n,e` public / `d,p,q,dp,dq,qi` private — all
**base64url, unpadded** big-endian integers (§15.1.1, reject `=`); **EC** (§6.2)
`crv` (`P-256`/`P-384`/`P-521`), `x,y`, and `d`; **OKP** (RFC 8037) `crv`
(`Ed25519`/`Ed448`/`X25519`/`X448`), `x`, `d`; **oct** (§6.4) a symmetric key —
`k` → `SecretBytes`, yielding a §5.4 `SymmetricKey`, not a `PrivateKey`. Private
components land in `SecretBytes`. `toJson` emits **public params only** unless
`includePrivate` is set, so a JWK is never accidentally serialized with its `d`.
Advisory metadata (`kid`, `use`, `key_ops`, `alg`) is preserved but never
overrides the cryptographic type, which comes from `kty`/`crv` (this also blocks
the JWS `alg`-confusion class — cf. §18's algorithm pinning).

#### §15.2.8 The unified import facade

Callers frequently have "a key, in some format." A small facade dispatches on
the PEM label (closed registry, §15.1.4) when armored or on the DER structure
when raw — but never *guesses* destructively and never weakens any parser's
strictness:

```loup
pub func importPrivateKey(input: bytes): PrivateImport;
pub func importPublicKey(input: bytes): PublicKey;        # SPKI / PKCS#1 / OpenSSH / JWK

pub enum PrivateImport {
    plain(PrivateKey),                  # PKCS#8 / PKCS#1 / SEC1 / OpenSSH (unencrypted)
    encrypted(EncryptedKeyHandle),      # needs a passphrase; caller calls .decrypt
}
pub struct EncryptedKeyHandle { pub func decrypt(passphrase: SecretBytes): PrivateKey; }  # KeyDecryptFailed
```

An **encrypted** key is surfaced as a *distinct variant* rather than silently
prompting or failing — the caller must explicitly provide the passphrase,
preserving the §15.2.5 opaque-failure boundary. There is no "auto-decrypt with
empty passphrase" misfeature.

---

### §15.3 `loup.crypto.x509` — certificate objects

Governing: RFC 5280 (PKIX certificate & CRL profile), RFC 2986 (PKCS#10).
Everything here is **parse-don't-validate**: a parsed object is structurally
well-formed by construction. *Semantic* trust (signature, validity, policy) is
§15.4's job, never L2's.

#### §15.3.1 Certificate and TbsCertificate

```
Certificate ::= SEQUENCE { tbsCertificate TBSCertificate, signatureAlgorithm AlgorithmIdentifier, signatureValue BIT STRING }
TBSCertificate ::= SEQUENCE { version [0] EXPLICIT Version DEFAULT v1, serialNumber CertificateSerialNumber,
    signature AlgorithmIdentifier, issuer Name, validity Validity, subject Name, subjectPublicKeyInfo SubjectPublicKeyInfo,
    issuerUniqueID [1] IMPLICIT BIT STRING OPTIONAL, subjectUniqueID [2] IMPLICIT BIT STRING OPTIONAL,
    extensions [3] EXPLICIT Extensions OPTIONAL }
```

```loup
namespace loup.crypto.x509;

pub struct Certificate { /* immutable, own-constructed by parse */ }
impl Certificate {
    pub static func parse(der: bytes): Certificate;     # throws InvalidEncoding
    pub static func fromPem(pem: string): Certificate;
    pub func tbs(): TbsCertificate;
    pub func signatureAlgorithm(): AlgorithmId;
    pub func signatureValue(): bytes;
    # The EXACT DER bytes of the tbsCertificate field, retained verbatim from the
    # input. §15.4 verifies the signature over THESE bytes — never a re-encoding —
    # so a non-canonical-but-accepted quirk in a real cert cannot cause a mismatch.
    pub func tbsDer(): bytes;
    pub func toDer(): bytes;                  # original input bytes verbatim
    pub func fingerprintSha256(): bytes;      # digest of toDer(), via §11
}
pub struct TbsCertificate { /* … */ }
impl TbsCertificate {
    pub func version(): CertVersion;          # v1 | v2 | v3
    pub func serialNumber(): bigint;          # positive, ≤ 20 octets (RFC 5280 §4.1.2.2)
    pub func issuer(): Name;  pub func subject(): Name;
    pub func validity(): Validity;
    pub func subjectPublicKeyInfo(): loup.crypto.pkcs.Spki;
    pub func extensions(): Extensions;
    pub func innerSignatureAlgorithm(): AlgorithmId;
}
pub struct Validity { pub notBefore: Instant; pub notAfter: Instant; }
pub enum CertVersion { v1, v2, v3 }
```

Boundary rules enforced at parse (RFC 5280 §4.1): the DER reader rejects all
non-canonical encoding first; `serialNumber` is a positive `bigint` (negative/
zero flagged per §4.1.2.2; the value — including the leading zero that keeps it
positive — round-trips exactly); the **inner** `TBSCertificate.signature`
`AlgorithmIdentifier` MUST equal the **outer** `Certificate.signatureAlgorithm`
(§4.1.2.3 — a real signature-substitution hardening rule), else `InvalidEncoding`;
`version` MUST be v3 if extensions are present (§4.1.2.1); and the
`tbsCertificate` byte range is captured as a sub-slice for later **exact-bytes**
signature verification — the parser never relies on re-encoding the TBS to
reconstruct what was signed.

#### §15.3.2 Distinguished Names and GeneralName

Governing: RFC 5280 §4.1.2.4 (Name), §4.2.1.6 (GeneralName / SAN).

```loup
pub struct Name { pub rdns: list[Rdn]; }
impl Name { pub func toRfc4514(): string; }       # canonical string form (RFC 4514)
pub struct Rdn { pub attrs: list[AttributeTypeAndValue]; }
pub struct AttributeTypeAndValue { pub type: Oid; pub value: Der; }

pub enum GeneralName {                            # RFC 5280 §4.2.1.6
    rfc822Name(string),                           # [1] email
    dnsName(string),                              # [2] DNS — the identity TLS cares about
    directoryName(Name),                          # [4]
    uniformResourceIdentifier(string),            # [6] URI
    ipAddress(bytes),                             # [7] 4 or 16 octets
    registeredId(Oid),                            # [8]
    otherName(Oid, Der),                          # [0]
    other(Tag, bytes),                            # x400Address [3] / ediPartyName [5] etc.
}
```

`Name` comparison for the path-validation "issuer == subject" linkage uses the
RFC 5280 §7.1 name-matching rules (case-folding of `PrintableString`, whitespace
collapse), implemented as a canonical normalization so two encodings of the same
name compare equal. `GeneralName.dnsName`/`ipAddress` feed hostname verification
(§15.4.7) and name constraints (§15.4.4).

#### §15.3.3 The extension model

Governing: RFC 5280 §4.2. Each extension is `{ extnID, critical, extnValue }`.
The model is **parse-don't-validate** and **closed**: recognized extensions are
fully typed; an unrecognized **critical** extension forces a hard outcome.

```loup
pub struct Extensions {
    pub func get[E: KnownExtension](): Option[E];   # typed lookup
    pub func all(): list[RawExtension];
    pub func unrecognizedCritical(): list[Oid];     # §15.4 fails if non-empty
}
pub struct RawExtension { pub id: Oid; pub critical: bool; pub value: bytes; }

# BasicConstraints — §4.2.1.9  (2.5.29.19)
pub struct BasicConstraints { pub ca: bool; pub pathLenConstraint: Option[int]; }
# KeyUsage — §4.2.1.3  (2.5.29.15) — a typed bitset, not raw bits
pub struct KeyUsage {
    pub digitalSignature: bool; pub nonRepudiation: bool; pub keyEncipherment: bool;
    pub dataEncipherment: bool;  pub keyAgreement: bool;   pub keyCertSign: bool;
    pub cRLSign: bool;           pub encipherOnly: bool;   pub decipherOnly: bool;
}
# ExtendedKeyUsage — §4.2.1.12  (2.5.29.37)
pub enum ExtKeyPurpose { serverAuth, clientAuth, codeSigning, emailProtection, timeStamping, ocspSigning, anyExtendedKeyUsage, other(Oid) }
pub struct ExtendedKeyUsage { pub purposes: list[ExtKeyPurpose]; }
# SubjectAltName / IssuerAltName — §4.2.1.6 / §4.2.1.7  (2.5.29.17 / .18)
pub struct SubjectAltName { pub names: list[GeneralName]; }
# AuthorityKeyIdentifier — §4.2.1.1  (2.5.29.35)
pub struct AuthorityKeyId { pub keyIdentifier: Option[bytes]; pub authorityCertIssuer: Option[list[GeneralName]]; pub authorityCertSerialNumber: Option[bigint]; }
# SubjectKeyIdentifier — §4.2.1.2  (2.5.29.14)
pub struct SubjectKeyId { pub keyIdentifier: bytes; }
# NameConstraints — §4.2.1.10  (2.5.29.30)
pub struct NameConstraints { pub permittedSubtrees: list[GeneralSubtree]; pub excludedSubtrees: list[GeneralSubtree]; }
pub struct GeneralSubtree { pub base: GeneralName; pub minimum: int; pub maximum: Option[int]; }
# CRLDistributionPoints — §4.2.1.13  (2.5.29.31)
pub struct CrlDistributionPoints { pub points: list[DistributionPoint]; }
pub struct DistributionPoint { pub distributionPoint: Option[DistributionPointName]; pub reasons: Option[ReasonFlags]; pub crlIssuer: Option[list[GeneralName]]; }
# AuthorityInfoAccess — §4.2.2.1  (1.3.6.1.5.5.7.1.1)
pub struct AuthorityInfoAccess { pub descriptions: list[AccessDescription]; }
pub struct AccessDescription { pub method: Oid; pub location: GeneralName; }   # id-ad-ocsp → OCSP URL (§15.4.6); id-ad-caIssuers → issuer-fetch URL (caller's transport)
# CertificatePolicies — §4.2.1.4  (2.5.29.32)
pub struct CertificatePolicies { pub policies: list[PolicyInformation]; }
pub struct PolicyInformation { pub policyIdentifier: Oid; pub qualifiers: list[PolicyQualifier]; }
```

The **critical-extension rule** (RFC 5280 §4.2): an extension marked
`critical=TRUE` whose OID the library does not recognize MUST cause path
validation to **reject** the certificate. `unrecognizedCritical()` surfaces
exactly that set; §15.4.4 fails if it is non-empty for any path certificate.
Non-critical unrecognized extensions are preserved as `RawExtension` and ignored,
never dropped. This is parse-don't-validate applied to extensibility: *unknown +
critical* is a typed, unmissable failure, not a silent pass.

#### §15.3.4 CertificateChain

```loup
pub struct CertificateChain { pub certs: list[Certificate]; }   # [0] = end-entity, ascending toward (excluding) the anchor
impl CertificateChain {
    pub static func parsePemBundle(pem: string): CertificateChain;
    pub func endEntity(): Certificate;
}
```

A `CertificateChain` is an **ordered, structurally-parsed** list carrying **no
trust claim** — precisely the distinction from a `VerifiedChain` (§5.2a /
§15.4.3), which only the `Verifier` can mint. `parsePemBundle` reads a
concatenated PEM bundle (the common TLS server-chain file shape). The chain need
not be perfectly ordered or complete; §15.4.4's path-building step reconstructs
and reorders using AKI/SKI and name matching.

#### §15.3.5 CertificationRequest (PKCS#10 CSR)

Governing: RFC 2986. Vectors: OpenSSL-produced CSRs, Wycheproof.

```
CertificationRequest ::= SEQUENCE { certificationRequestInfo CertificationRequestInfo, signatureAlgorithm AlgorithmIdentifier, signature BIT STRING }
CertificationRequestInfo ::= SEQUENCE { version, subject Name, subjectPKInfo SubjectPublicKeyInfo, attributes [0] Attributes }
```

```loup
pub struct CertificationRequest { /* … */ }
impl CertificationRequest {
    pub static func parse(der: bytes): CertificationRequest;
    pub static func fromPem(pem: string): CertificationRequest;
    pub func subject(): Name;
    pub func publicKey(): loup.crypto.pkcs.Spki;
    pub func requestedExtensions(): Extensions;    # via the extensionRequest attribute
    # A CSR signature is PROOF OF POSSESSION of the private key. Parsing does NOT
    # check it; verification is explicit and returns the §5.2a-style verdict, never bool.
    pub func verifyProofOfPossession(): CsrVerdict;
    pub static func build(params: CsrBuildParams, signingKey: PrivateKey, rng: Rng): CertificationRequest;
}
pub enum CsrVerdict { Valid(loup.crypto.pkcs.Spki), SignatureInvalid, UnsupportedAlgorithm(Oid) }
```

A CSR is self-signed with the requesting key; that signature proves possession
of the private key for `subjectPKInfo`. `parse` checks only structure;
`verifyProofOfPossession` checks the self-signature (constant-time, via §14) and
returns a typed verdict — matching the parse-don't-validate stance. CSR
*construction* (`build`) is the one spot in L2 needing the entropy seam (the
signature nonce, via the injected `Rng`, §10); parsing and verification need
none.

---

### §15.4 `loup.crypto.x509.verify` — certificate path validation

Governing: RFC 5280 §6 (path-validation algorithm), §5 (CRL profile), RFC 6960
(OCSP), RFC 6125 / RFC 9525 (service-identity / hostname). This is the trust
core. Everything below is parse-don't-validate: the only "yes" is the typed
`CertVerdict.Trusted(VerifiedChain)` (§5.2a); every other outcome is a structured
verdict arm naming what happened.

#### §15.4.1 TrustStore and trust anchors

```loup
namespace loup.crypto.x509.verify;

pub struct TrustAnchor { /* name + key (+ optional name constraints) — RFC 5280 §6.1.1(d) */ }
impl TrustAnchor {
    pub static func fromCertificate(cert: Certificate): TrustAnchor;
    pub func subject(): Name;  pub func publicKey(): PublicKey;  pub func nameConstraints(): Option[NameConstraints];
}
pub struct TrustStore { /* … */ }
impl TrustStore {
    pub static func empty(): TrustStore;
    pub func add(anchor: TrustAnchor): void;
    pub func addPemBundle(pem: string): int;             # returns count added
    pub func findBySubject(name: Name): list[TrustAnchor];   # path terminator lookup
    # withSystemRoots is a PLATFORM CAPABILITY (OS trust store), out of v0.1 scope (§1) — listed for forward shape only.
}
```

A trust anchor is fundamentally a **subject name + public key** (+ optional name
constraints), per RFC 5280 §6.1.1(d) — a self-signed root certificate is the
common carrier, but the anchor is the name+key, not "a certificate we blindly
trust." The `TrustStore` is an **explicit object passed to the `Verifier`** —
there is **no ambient/global trust store** (that would be ambient authority, a
§4 capability violation). The application decides what to trust by constructing
the store (from an OS bundle it read via *its own* `CAP_FS`, from a pinned
in-binary set, etc.).

#### §15.4.2 VerifyPolicy

```loup
pub enum VerifyPurpose {                     # drives the EKU/KeyUsage checks (§15.4.4)
    tlsServer,       # EKU serverAuth; KU digitalSignature/keyEncipherment/keyAgreement
    tlsClient,       # EKU clientAuth
    codeSigning,     # EKU codeSigning  (consumed by §18)
    emailProtection, # EKU emailProtection
    ocspSigning,     # EKU ocspSigning
    custom(list[ExtKeyPurpose]),
    any,             # no EKU constraint (NOT recommended for TLS)
}
pub enum RevocationMode {
    disabled,            # do not check revocation
    checkSuppliedOnly,   # check only material already in hand (e.g. stapled OCSP)
    softFail,            # try; tolerate "unavailable" (recorded in the verdict)
    hardFail,            # require a definitive good status; "unavailable" ⇒ reject
}
pub struct VerifyPolicy {
    pub purpose: VerifyPurpose;
    pub revocation: RevocationMode = RevocationMode.softFail;
    pub clock: Clock;                         # INJECTED time capability (§3) — never the ambient wall clock
    pub maxPathLength: int = 16;              # hard cap independent of pathLenConstraint
    pub requiredPolicies: list[Oid] = [];     # initial-policy-set (RFC 5280 §6.1.1(c))
    pub legacyCnFallback: bool = false;       # §15.4.7 — discouraged; off in production
    pub revocationProvider: Option[RevocationProvider];   # caller's transport (§15.4.6)
    pub host: Option[ReferenceIdentity];      # §15.4.7 hostname check, if applicable
}
pub enum ReferenceIdentity { dnsName(string), ipAddress(bytes) }   # RFC 6125 / RFC 9525
```

The policy bundles **what we verify for** (`purpose`), **how hard to check
revocation** (`revocation` + the caller's `revocationProvider`), **what time it
is** (`clock` — an injected capability, never ambient), and the **identity to
match** (`host`). It is a §2-axiom-5 typed config, not flag soup; defaults are
the safe choice and insecure choices (`any`, `legacyCnFallback`) are
explicitly named.

#### §15.4.3 The Verifier and the verdict

```loup
pub struct Verifier { /* … */ }
impl Verifier {
    pub static func new(trust: TrustStore, policy: VerifyPolicy): Verifier;
    # The one and only verification entry point. Returns the §5.2a non-Boolean verdict.
    pub func verify(chain: CertificateChain): CertVerdict;
}
pub struct VerifiedChain { /* the proof object — constructed ONLY by the Verifier */ }
impl VerifiedChain {
    pub func endEntity(): Certificate;  pub func anchor(): TrustAnchor;
    pub func path(): list[Certificate];           # EE → … → issued-by-anchor
    pub func verifiedAt(): Instant;               # the single clock reading used
    pub func verifiedFor(): VerifyPurpose;
    pub func validForHost(): Option[ReferenceIdentity];   # present iff the §15.4.7 host check ran & passed
    pub func revocationOutcome(): RevocationOutcome;       # good | notChecked | softFailed
}
# PathError (carried by CertVerdict.PathInvalid) NAMES the failed §6 check, for diagnostics:
pub enum PathError {
    untrustedRoot,            # no path terminates at a TrustStore anchor
    signatureInvalid(int),    # chain index whose signature failed
    pathLenExceeded,          # basicConstraints pathLenConstraint / policy.maxPathLength
    notACa(int),              # an issuer lacked BasicConstraints cA=TRUE
    keyUsageViolation(int),   # a required KeyUsage bit / EKU purpose absent
    nameConstraintViolation,  # subject/SAN excluded or not permitted
    policyError,              # certificate-policy processing failed
    unknownCriticalExtension(int, Oid),   # a critical extension was not recognized
    revocationUnavailable(int),           # required revocation status unobtainable
    malformed(int),           # structural failure at a chain index (cause: InvalidEncoding)
}
```

This is the heart of the misuse-resistant design and the resolution of the
"typed verified result, not a boolean" requirement. Per **§5.2a**, multi-valued
certificate verdicts return a **sealed enum** the caller must exhaustively
`match` — *not* a bare `bool` (too easy to ignore) and *not* a bare throw (which
"invites catch-all swallowing"). The success identity (`VerifiedChain`) lives
**only** in the `CertVerdict.Trusted` arm, so a caller cannot obtain the verified
identity without having matched success. The verdict maps as:

| `CertVerdict` arm (§5.2a) | Meaning | Carries |
|---|---|---|
| `Trusted(VerifiedChain)` | full §6 + policy success | the proof object (identity only here) |
| `Expired(CertId)` | validity-window failure | which cert |
| `UntrustedRoot(CertId)` | no anchor terminates the path | which cert |
| `NameMismatch(string)` | RFC 6125 identity check failed | the attempted name |
| `Revoked(CertId, RevocationReason)` | CRL/OCSP says revoked | reason + (in the CertId) time |
| `RevocationUnknown(VerifiedChain)` | path valid, revocation unobtained (a **policy** call) | the proof + a soft-fail note |
| `PathInvalid(PathError)` | a specific §6 check failed | the **named** check (table above) |

`VerifiedChain` additionally records *which time*, *which purpose*, and *which
host* it was verified for — so a chain verified for `tlsClient` cannot be reused
as `tlsServer`, and a host-checked result cannot be reused for a different host.
The detail/opacity split the TLS/SSH consumer needs is §15.4.8.

#### §15.4.4 The RFC 5280 §6 algorithm, step by step

`verify` implements RFC 5280 §6.1 (basic path validation) then §6.3 (CRL
processing) and the OCSP equivalent. Each step maps to its §6 clause and the
`PathError`/verdict it can yield:

1. **Path construction (§6.1 setup).** Order/reconstruct the supplied chain into
   `EE = cert[0] … cert[k]` where `cert[k]` is issued by a `TrustStore` anchor,
   using subject/issuer name matching (§15.3.2) + AKI/SKI hints (§15.3.3). No
   path to an anchor ⇒ `UntrustedRoot`. Length is capped at
   `policy.maxPathLength` **independent** of any `pathLenConstraint` (defense in
   depth) ⇒ `PathInvalid(pathLenExceeded)`.
2. **Initialize state (§6.1.2).** `valid_policy_tree` ← initial policy set
   (`requiredPolicies` or `any-policy`); `permitted_subtrees` ← unbounded;
   `excluded_subtrees` ← ∅; the `explicit_policy`/`policy_mapping`/
   `inhibit_anyPolicy` counters per the initial settings; `working_public_key` ←
   anchor key; `working_issuer_name` ← anchor subject.
3. **For each cert from the anchor down toward the EE (§6.1.3 basic
   processing):**
   - **(a) Signature (§6.1.3(a)(1)).** Verify `cert.signatureValue` over
     `cert.tbsDer()` (the **retained exact bytes**, §15.3.1) using
     `working_public_key`, via the §14 constant-time `Verifier.verify` (§8: a
     failure raises `SignatureInvalid` internally and becomes
     `PathInvalid(signatureInvalid(i))`). The algorithm must be acceptable to
     the active `CryptoPolicy` (§6 — no SHA-1/MD5 signing under `Modern`).
   - **(b) Validity (§6.1.3(a)(2)).** Read `now = policy.clock.now()` **once** at
     the start of `verify` and use that single `Instant` for the whole path
     (consistent + reproducible). `now < notBefore` or `now > notAfter` ⇒
     `Expired(certId)` (the `Expired` arm covers both, with the offending
     instant in the `CertId`).
   - **(c) Revocation (§6.1.3(a)(3), expanded §6.3 / OCSP).** Per
     `policy.revocation` — §15.4.5/§15.4.6 — yielding `Revoked`,
     `RevocationUnknown`, or `PathInvalid(revocationUnavailable(i))`.
   - **(d) Issuer linkage (§6.1.3(a)(4)).** `cert.issuer` must equal
     `working_issuer_name` under §7.1 name matching.
   - **(e) Name constraints (§6.1.3(b)/(c), §6.1.4(g)).** Update
     `permitted`/`excluded` subtrees from this cert's `NameConstraints` and check
     the subject and every SAN `GeneralName` (DNS, IP-CIDR, directoryName,
     rfc822 — each with its §4.2.1.10 rule). Excluded, or outside permitted ⇒
     `NameMismatch`/`PathInvalid(nameConstraintViolation)`.
   - **(f) Policy (§6.1.3(d–f), §6.1.4).** Intersect this cert's
     `CertificatePolicies` into `valid_policy_tree`; apply mappings and the
     `explicit_policy`/`inhibit_anyPolicy`/`policy_mapping` counters. Required
     explicit policy with an empty tree ⇒ `PathInvalid(policyError)`. (Basic
     policy processing per the profile, implemented to the PKITS policy set.)
   - **(g) Critical extensions (§6.1.4(n)/§6.1.5(f)).**
     `unrecognizedCritical()` non-empty ⇒
     `PathInvalid(unknownCriticalExtension(i, oid))`.
4. **Intermediate (CA) constraints, every non-leaf cert (§6.1.4(k)/(l)/(m)):**
   `BasicConstraints.ca` MUST be TRUE for an issuing cert (else
   `PathInvalid(notACa(i))` — the check whose absence caused the historic "any
   leaf can mint certs" Web-PKI break); decrement the working `max_path_length`
   and enforce each CA's `pathLenConstraint` ⇒ `PathInvalid(pathLenExceeded)`; a
   CA cert that has a `KeyUsage` MUST assert `keyCertSign` (else
   `PathInvalid(keyUsageViolation(i))`).
5. **Wrap-up on the EE (§6.1.5) + purpose checks.** The EE's `KeyUsage` +
   `ExtendedKeyUsage` must permit `policy.purpose` (e.g. `tlsServer` ⇒ EKU
   `serverAuth` per policy + consistent KU); a missing required bit/purpose ⇒
   `PathInvalid(keyUsageViolation(0))`. The EKU-chaining rule (an intermediate
   that constrains EKU must include the purpose) is enforced down the path.
6. **Hostname / service identity (§15.4.7), iff `policy.host` is set.** Match the
   reference identity against the EE SAN per RFC 6125 / RFC 9525; mismatch ⇒
   `NameMismatch(host)`.
7. **Mint the witness.** All checks passed ⇒ build `VerifiedChain` (recording
   `verifiedAt = now`, `verifiedFor`, the host, the revocation outcome) and
   return `CertVerdict.Trusted(...)` — the **only** place a `VerifiedChain` is
   created.

The algorithm reads the clock exactly once, performs every signature check via
the §14/§8 constant-time verifier, and never short-circuits a security check on
attacker-controlled timing.

#### §15.4.5 Revocation — CRL parsing and checking (sans-I/O)

Governing: RFC 5280 §5 + §6.3. **The library parses + checks CRL bytes; the
caller fetches them** (§3 transport seam).

```
CertificateList ::= SEQUENCE { tbsCertList TBSCertList, signatureAlgorithm AlgorithmIdentifier, signatureValue BIT STRING }
```

```loup
pub struct CertificateList { /* … */ }
impl CertificateList {
    pub static func parse(der: bytes): CertificateList;
    pub func issuer(): Name;  pub func thisUpdate(): Instant;  pub func nextUpdate(): Option[Instant];
    pub func crlNumber(): Option[bigint];          # §5.2.3
    pub func isDelta(): bool;                        # §5.2.4 deltaCRLIndicator
    pub func status(serial: bigint): CrlEntryStatus;
}
pub enum CrlEntryStatus { notListed, revoked(RevocationReason, Instant) }

# The caller's transport. The library CALLS this to OBTAIN bytes; the fetch
# implementation is the caller's. With disabled/checkSuppliedOnly it is never called.
pub interface RevocationProvider {
    pub func fetchCrl(distributionPoint: GeneralName): bytes;
    pub func fetchOcsp(request: bytes, responder: GeneralName): bytes;
}
```

The CRL **check** logic (run by the `Verifier` per `policy.revocation`):
(1) source the CRL from the cert's `CrlDistributionPoints` (§15.3.3) →
`revocationProvider.fetchCrl(url)` for the bytes (or already-supplied bytes in
`checkSuppliedOnly`); (2) **parse** them (`CertificateList.parse`, bounded like
every DER parse, §15.1.5); (3) **verify the CRL signature** over `tbsCertList`
using the CRL issuer's key (the cert's issuer, or an indirectly-authorized CRL
issuer per §5.2.6/§6.3), constant-time via §14 — a bad signature ⇒ the CRL is
ignored as if absent; (4) check **scope + freshness** (issuer match,
`issuingDistributionPoint` §5.2.5 scope, and `thisUpdate ≤ now ≤ nextUpdate`
using the policy clock); (5) **status** — listed ⇒ `Revoked(reason, date)`
(reason codes per §5.3.1 preserved; `certificateHold` is a removable state); not
listed, in-scope, fresh ⇒ "good." `RevocationMode` governs "could not get a
fresh valid CRL": `hardFail` ⇒ `PathInvalid(revocationUnavailable(i))`;
`softFail` ⇒ proceed with `RevocationUnknown`/`RevocationOutcome.softFailed`;
`disabled`/`checkSuppliedOnly` ⇒ never fetch.

#### §15.4.6 Revocation — OCSP parsing and checking (sans-I/O)

Governing: RFC 6960. **The library builds the request bytes and checks the
response bytes; the caller POSTs/receives.**

```loup
pub struct OcspRequest { /* … */ }
impl OcspRequest {
    pub static func build(target: Certificate, issuer: Certificate, rng: Rng): OcspRequest;  # rng for the nonce (§10)
    pub func toDer(): bytes;                        # caller POSTs this (application/ocsp-request)
    pub func nonce(): bytes;                        # retained to match the response
}
pub struct OcspResponse { /* … */ }
impl OcspResponse {
    pub static func parse(der: bytes): OcspResponse;
    pub func responseStatus(): OcspResponseStatus;  # successful | malformed | tryLater | …
    pub func check(target: Certificate, issuer: Certificate, expectedNonce: Option[bytes], now: Instant): OcspStatus;
}
pub enum OcspStatus { good, revoked(RevocationReason, Instant), unknown }
```

The OCSP **check** logic (RFC 6960 §3.2 signed-response acceptance):
(1) `responseStatus` must be `successful`, else unavailable; (2) **CertID match**
— the response's issuer-name-hash, issuer-key-hash, serial must match
`(target, issuer)`, **recomputed by the library**, never trusted from the
response; (3) **signer authorization (§4.2.2.2 / §2.6)** — the responder is
authorized iff it is the issuing CA itself **or** a delegated responder whose
cert is signed by the issuing CA **and** carries EKU `ocspSigning`
(`id-kp-OCSPSigning`); the library verifies that delegated-responder cert
(constant-time, §14) before trusting it; (4) **freshness** — `thisUpdate ≤ now`
and (when present) `now ≤ nextUpdate`, policy clock; (5) **nonce** — if one was
sent it MUST match the response's nonce extension (§4.4.1, anti-replay), else the
response is rejected as unavailable; (6) **status** — `good` ⇒ proceed; `revoked`
⇒ `Revoked`; `unknown` ⇒ unavailable. **Stapling:** under
`RevocationMode.checkSuppliedOnly`, a TLS-stapled OCSP response (passed in by the
§16 caller, never fetched here) is checked by exactly this `check` path — the
common, low-latency, privacy-preserving deployment.

#### §15.4.7 Hostname / service-identity verification

Governing: RFC 6125 and its successor RFC 9525; SAN/CN handling per RFC 5280
§4.2.1.6. Runs in §15.4.4 step 6 when `policy.host` is set (TLS-server purposes).
The rules, in order:

1. **SAN is authoritative; CN is deprecated and ignored when SAN is present.**
   Per RFC 6125 §6.4.4 / RFC 9525 §6.3 and modern Web-PKI practice, if the EE has
   *any* relevant-type `SubjectAltName`, identity is matched **only** against the
   SAN; the Subject `commonName` is **not** consulted for DNS identity. (Trusting
   CN in the presence of SAN is a long-standing authentication-bypass class.)
2. **CN fallback is off by default.** With *no* DNS SAN at all, the library by
   default treats the cert as having no DNS identity (⇒ `NameMismatch`) rather
   than falling back to CN. `policy.legacyCnFallback` (default false, discouraged)
   re-enables the RFC 6125 §6.4.4 fallback for ancient certs; production TLS
   leaves it off — modern CABF-issued certs always carry SAN.
3. **DNS matching (RFC 6125 §6.4 / RFC 9525 §6.4–6.5).** Case-insensitive label
   comparison. **Wildcards** are constrained: a *single* `*` in the *left-most*
   label matches a *single* label only — `*.example.com` matches `a.example.com`,
   **not** `example.com`, **not** `a.b.example.com`, never the public-suffix apex;
   an embedded `f*o.example.com` is rejected; IDN/U-labels are A-label-normalized
   before comparison.
4. **IP matching.** A reference `ipAddress` matches **only** an `iPAddress` SAN
   with byte-equal address (never a DNS SAN, never CN); IPv4/IPv6 compared as raw
   octets.

On success `VerifiedChain.validForHost()` records the matched identity, so the
type proves "valid *for this host*," not merely "valid" — a caller cannot
accidentally accept a chain verified for a different name. The §16 TLS engine
passes its `serverName` straight through as `policy.host`; the §17 SSH engine
does host-key (not certificate-hostname) verification and does not use this path
except for OpenSSH host certificates.

#### §15.4.8 Diagnostic detail vs the opaque wire alert

The design tension: operators need to know *which* §6 check failed (so the
verdict's `PathInvalid(PathError)` arm **names** it, §15.4.3), but a TLS/SSH peer
must learn **nothing** beyond "rejected" (so the verifier is not an oracle for an
on-path attacker). The resolution is a two-faced verdict, consistent with §8's
"reveal nothing about which check failed":

```loup
impl CertVerdict {
    pub func isTrusted(): bool;                  # total, but discards the reason
    pub func diagnostic(): string;               # detailed, human-facing — LOCAL LOGS ONLY
    pub func alertCategory(): AlertCategory;     # COARSE, intentionally lossy — wire-facing
}
pub enum AlertCategory { badCertificate, certificateExpired, certificateRevoked, unknownCa, certificateUnknown }  # → TLS alert codes
```

Guidance for consumers: **local diagnostics/logs** use the verdict arm and
`.diagnostic()` (full detail, never leaves the host); the **wire / remote peer**
maps through `.alertCategory()` — many distinct arms collapse to the same coarse
bucket so a peer cannot distinguish "expired" from "revoked" from "name
mismatch." The recommendation for maximum misuse-resistance is that the §16/§17
layer treat **all** certificate failures as one opaque alert
(`bad_certificate`/`certificate_unknown`) and rely on local logs for specifics —
exactly so the handshake does not become a discrimination oracle. The detailed
arm exists for diagnostics; only the collapsed category crosses back to a remote
peer. This is the final expression of the family's governing value: the **type
carries the proof** (`Trusted(VerifiedChain)` or nothing), the **diagnostic
carries the detail** (locally), and the **alert category carries the opacity**
(to the peer).

#### §15.4.9 Test-vector and interop strategy for §15 (refines §19)

The §15 domain's correctness is pinned to **published vectors**, layered to
match §15.1–§15.4 (this refines the family-wide §19 catalog):

- **§15.1 codec** — base64/hex against RFC 4648 §10; DER canonicalization against
  a hand-curated **non-canonical BER corpus** (every reject row of §15.1.3,
  derived from X.690 §8/§10/§11) — each MUST be rejected with `InvalidEncoding`;
  the overflow/deep-nesting/element-count corpus (§15.1.5) MUST fail bounded,
  never hang/OOM/crash.
- **§15.2 keys** — RFC 8017 App.C, RFC 5915, RFC 7517 App, OpenSSH round-trips,
  Wycheproof key vectors; each importer checked both ways (recover known
  parameters + `parse(encode(k)) == k`). PBES2 `decrypt` against OpenSSL-produced
  encrypted PKCS#8 (known passphrase) **and** deliberately-corrupted ciphertext
  (the single opaque `KeyDecryptFailed`).
- **§15.3 / §15.4 X.509** — the three external oracles the family mandates, all
  vendored with provenance (§19.3) and replayed offline/deterministically with an
  injected `Clock`:
  1. **Project Wycheproof `x509_*` and ECDSA/DSA/RSA signature-verification JSON
     suites** — imported verbatim; the harness reads each vector's
     `valid`/`invalid`/`acceptable` and asserts agreement. Wycheproof targets the
     exact edge cases that break naive parsers (BER-vs-DER signature encodings,
     `(r,s)` integer canonicalization, oversized/negative/zero parameters,
     malformed `AlgorithmIdentifier`s, historical CVE classes); §15.1.3's strict
     canonical posture is what lands the `acceptable`/`invalid` BER cases on the
     rejecting side.
  2. **NIST PKITS (Public Key Interoperability Test Suite)** — the authoritative
     external oracle for the §6 *path-validation* algorithm: certificate paths +
     CRLs for signature chains, expired/not-yet-valid, name-constraint trees,
     basicConstraints/path-length, key-usage, policy processing, and revocation,
     each with a **documented expected outcome** and a **fixed validation time**.
     The harness loads each test's anchor/intermediate(s)/EE/CRLs, runs
     `Verifier.verify` with the PKITS `Instant`, and asserts the expected verdict
     *and*, on expected failure, the **matching `PathError`/verdict arm** (the
     named check). PKITS is how we prove the algorithm is the algorithm.
  3. **Real-world CA root interop** — a version-pinned snapshot of real CA roots
     (the OS/browser-trust-store kind) plus captured real server chains, validated
     end-to-end: cross-signed intermediates, SHA-256 vs legacy hashes, ECDSA
     P-256/P-384 and RSA-2048/4096 chains, Ed25519 roots (RFC 8410). This catches
     the gap between "passes synthetic vectors" and "works against the actual
     Web PKI." The snapshot is refreshed deliberately so tests stay deterministic
     (CLAUDE.md gotcha #2; §19.6).

All vectors are committed; the clock is injected so validation time is fixed per
vector; no §15 test reads the wall clock or the network — so the whole suite runs
in the sandboxed (no-fs/no-net) context and replays bit-identically across
Stage0/1/2.

---

## §16 Sans-I/O TLS 1.3 engine — `loup.crypto.tls`

A four-method sans-I/O `Connection` (`ClientConnection`/`ServerConnection`):
feed incoming bytes, drain outgoing bytes, read decrypted application data,
pull the next typed `TlsEvent` (handshake-complete, app-data, alert,
want-more-bytes). TLS 1.3 (RFC 8446) is primary; TLS 1.2 AEAD-only interop and
resumption/PSK/0-RTT are Phase 5 (§16.12). Covers the handshake (ClientHello/
ServerHello, key share, X25519/P-256 ECDHE, Certificate + CertificateVerify,
Finished), the **key schedule** (HKDF-Expand-Label over §13), the record layer
(AES-GCM, ChaCha20-Poly1305, TLS-1.3 nonce construction, automatic `KeyUpdate`
at key-usage limits, §5.5), alerts (`TlsError → AlertDescription`), ALPN, SNI,
and optional client-cert auth. Certificate verification **plugs into §15** — zero
ASN.1 in the TLS layer. **Browser reality (§16.11):** a browser app verifies
connections by running this engine over a WebTransport/WebSocket byte stream, or
uses platform TLS via `fetch`. Conformance: **RFC 8448** trace replay byte-
identically (every record *and* every intermediate secret) under the
deterministic test DRBG; live OpenSSL/BoringSSL interop both directions; a
tlsfuzzer-style negative corpus must produce the exact expected alert with no
crash/hang/leak under random fragmentation.

---

## §17 Sans-I/O SSH engine (client + server) — `loup.crypto.ssh`

A uniform `Progress`/`SansIoEngine` contract with DoS bounds, covering the full
stack. **Transport** (RFC 4253): version exchange, binary packet protocol, KEX
(curve25519-sha256, ecdh-sha2-nistp256/384/521, diffie-hellman-group14/16/18),
host keys (ssh-ed25519, rsa-sha2-256/512 per RFC 8332, ecdsa), ciphers/MACs
(chacha20-poly1305@openssh.com, aes-gcm@openssh.com per RFC 5647, AES-CTR + HMAC-
SHA2-ETM per RFC 6668), **strict-KEX / Terrapin (CVE-2023-48795) mitigation
default-on**. **Authentication** (RFC 4252/4256): publickey (two-phase), password,
keyboard-interactive, none; agent-backed signing. **Connection** (RFC 4254):
channels, sessions, exec/shell/subsystem, port forwarding, engine-enforced window/
flow control. **Key formats:** the OpenSSH private (bcrypt-pbkdf) + public key
formats, OpenSSH certificates, `authorized_keys`/`known_hosts`, SHA-256
fingerprints, and the **ssh-agent protocol (both directions)**. Ergonomic
`Client` (host-key verification against `known_hosts`, auth methods, channel
open) and `Server` (host key, auth callbacks, channel handlers) facades sit over
the sans-I/O core and a `ByteDuplex` transport. Conformance: per-KEX exchange-
hash + key-derivation KATs (RFC 8731/5656/8268/3526), the openssh AEAD framings'
KATs across multi-packet sequences (IV-reuse guard), bcrypt-pbkdf KATs, byte-
identical transcript replay against real OpenSSH, and live interop against real
`sshd`/`ssh` across the (KEX × cipher × MAC × host-key × auth-method) matrix.

---

## §18 Code signing and verification — `loup.crypto.codesign` (first vertical)

The lowest-protocol-complexity end-to-end vertical: it exercises hash +
signature + ASN.1 + certificate + DRBG with no live protocol state machine. A
`Signer`/`Verifier` object pair over a typed `SignatureAlg`, returning the §5.2a
non-bool verdict carrying signer identity + signing time. Containers: CMS/PKCS#7
SignedData (detached + attached, RFC 5652), JWS/JWT (RFC 7515/7519/7797 — typed
alg, **`alg:none` banned, and the verifier pins the EXPECTED algorithm/key-type
up front** to block RS256↔HS256 confusion), and a raw `SignedManifest`. A
canonical `Manifest`/`canonicalBytes` gives deterministic multi-file signing;
signing-cert chains validate through §15; RFC 3161/5816 timestamping gives
signature longevity past cert expiry. The existing `.lppkg.sig` publisher+
registry scheme (Packages Reference §1-13.4) is reproduced as a KAT — over its
**defined signature preimages** (tarball bytes; `tarball_sha256 ‖ publisher_sig`)
with a pinned canonical-JSON (RFC 8785/JCS) sidecar serialization so "byte-for-
byte" is well-defined.

---

## §19 Test-vector validation — the KAT harness (the spine of trust)

The trust basis for a from-scratch library. `loup.crypto.vectors` (the vendored
corpus) + `loup.crypto.testing` (the harness), wired into the Loup testing
framework (`@test`/`@resource`/`@marker`).

- **§19.1 Conformance gate.** No primitive reaches **Stable** until its published
  KATs pass in a **required, branch-protected CI job**, on native **and** Wasm,
  bit-identically. Red blocks merge.
- **§19.2 Vector catalog.** **Correctness oracle:** NIST CAVP/ACVP + RFC
  appendices. **Robustness oracle:** Project Wycheproof JSON suites. Plus
  project KATs (BLAKE3 `test_vectors.json`, RFC 8448 TLS traces, OpenSSH
  transcripts).
- **§19.3 Vendoring.** Each vector file is committed with provenance: upstream
  URL + SHA-256 + SPDX + import date. CI is offline/deterministic; a
  `tools/crypto-vectors` updater re-fetches and re-pins.
- **§19.4 Harness.** `Kat`/`KatCase`/`VectorSource` schema; `.rsp` / Wycheproof-
  JSON / RFC-inline loaders; a tri-state `runKats` engine (valid / invalid /
  acceptable). **Negative vectors assert the correct error *category*** (§8) —
  so the error model itself is conformance-gated.
- **§19.6 Determinism.** Every randomized test injects a seeded DRBG (§10.7); no
  test touches the live entropy seam, so KAT replay is bit-reproducible across
  Stage0/1/2.

---

## §20 Threat model and honest limitations (read this)

This section deliberately under-promises. A from-scratch, pure-language crypto
library compiled to varied backends cannot make the guarantees a mature C
library with hand-tuned asm and decades of audit makes.

- **No third-party audit.** v0.1 has had none. Do not deploy it as your only line
  of defense for high-value secrets without an independent review.
- **Constant-time is unverified, and on Wasm/GC possibly unachievable.** The
  `ct` primitives and the Montgomery secret-math path are written constant-time
  **at the source level**, but no Loup backend machine-verifies that property
  today. On a managed/GC Wasm runtime, timing behavior is outside this library's
  control. Until a backend passes a `dudect`/`ct-verif` gate (Phase 5), every
  secret-dependent operation on that backend is **`@timingUnverified`**.
- **Zeroization is best-effort.** Deterministic only under native ARC /
  freestanding. On GC/Wasm a buffer may be copied before `finalize()` runs and a
  store may be elided; v0.1 does **not** claim memory erasure there (§7.1).
- **`bigint` is variable-time** — confined to public math by the two-substrate
  rule (§9); never used for secret scalars.
- **No hardware acceleration** — no AES-NI/PCLMULQDQ/SHA-ext; v0.1 is correctness-
  first, performance-second.
- **Forward compiler dependencies (§App.A)** — the *guaranteed* (vs best-effort)
  versions of secret zeroization and constant-time enforcement require net-new
  core-language/compiler features (a non-elidable-store intrinsic, a secret-taint
  lint `E_CT_SECRET_BRANCH`, a `@constant_time` MIR audit pass). Those are filed
  as separate core-language change requests and are **not presupposed** by this
  spec.

The assurance *story* (safegcd, per-backend statistical timing gates in CI, the
KAT-gated maturity ladder, deterministic-DRBG transcript replay sharing one code
path with production) is in the roadmap (§App.D). The assurance *claims* for v0.1
are "structured best-effort, pending audit and compiler support" — not "contract-
guaranteed."

---

## Appendix A — Forward dependencies on the bootstrap compiler

These are **not** v0.1 features; they are core-language change requests the
*hardened* crypto posture (Phase 5) depends on, filed separately so this Draft
companion does not silently mandate unbuilt compiler machinery:

1. **Non-elidable secret store** — a `secureZero`/volatile-store intrinsic that
   survives dead-store elimination on every backend.
2. **`E_CT_SECRET_BRANCH` secret-taint lint** — flags a secret-dependent branch
   or array index; advisory in v0.1, ERROR when the pass ships.
3. **`@constant_time` MIR audit pass** — verifies a marked function has no
   secret-dependent control flow / memory access.

### Error codes this package introduces

| Code | Mode | Condition |
|---|---|---|
| `E_CT_SECRET_BRANCH` | All | A branch condition or array index depends on a value the secret-taint analysis marks secret, so its timing is observable. **Advisory in v0.1; ERROR when the analysis pass ships** (Phase 5 of the roadmap above) |

This is the package's only code, and it is defined here rather than in a language
volume because the analysis that raises it belongs to the crypto package's toolchain
surface, not to the language. It is recorded now, ahead of the implementation, so the
name is allocated and the promotion from advisory to error is a change of severity
rather than the introduction of a new diagnostic.

## Appendix B — OpenSSL parity matrix (auditable "all of them")

Every libcrypto EVP family is classified by **tier** (§4 maturity is orthogonal):
**MUST** (modern, blessed, top-level), **SHOULD** (first-class interop),
**LEGACY-VERIFY** (deprecated; verify/decrypt-only, policy-gated, quarantined),
**EXCLUDE** (named refusal — no module, no shim). A **LOWLEVEL** marker means the
algorithm is sound but unauthenticated/footgun-prone and lives under a `lowlevel`
submodule that never appears in the prelude (§2a). Each algorithm in the source
inventory carries a published test-vector source (CAVP/ACVP, RFC appendix, Project
Wycheproof — *mandatory wherever a Wycheproof group exists* — CCTV, or originating-
project KATs); the per-algorithm vector table is maintained alongside the
implementation.

**Digests** (`hash`): SHA-224/256/384/512 **MUST**; SHA-512/224, SHA-512/256
**SHOULD**; SHA3-224/256/384/512 + SHAKE128/256 **MUST**, cSHAKE **SHOULD**;
BLAKE2b/2s **MUST**, BLAKE3 **SHOULD** (honors the v1.12 core-set promise; not an
OpenSSL EVP digest); SM3, RIPEMD-160 **SHOULD**; **SHA-1, MD5 LEGACY-VERIFY**
(verify-context only, no prelude one-shot); MD4/MD2 **EXCLUDE**.

**MACs** (`mac`): HMAC-SHA-2/SHA-3 **MUST**, HMAC-SHA-1/MD5 **LEGACY-VERIFY**;
KMAC128/256 **MUST**; CMAC **MUST**; GMAC, SipHash, UMAC (SSH) **SHOULD**;
Poly1305 **MUST**.

**Block ciphers + modes** (`cipher`): AES-128/192/256 core **MUST**; Camellia,
SM4, ARIA **SHOULD**; CTR, AES-KW/KWP, XTS first-class; **CBC/CFB/OFB SHOULD but
LOWLEVEL-quarantined**; **raw-ECB-as-easy-path EXCLUDE** (only a named block-level
primitive for internal/KAT use).

**AEAD** (`aead`, the blessed encryption surface): AES-128/256-GCM, AES-CCM,
ChaCha20-Poly1305 **MUST**; AES-GCM-SIV, XChaCha20-Poly1305 **SHOULD**. Stream:
ChaCha20 **MUST**, XChaCha20 **SHOULD** (raw keystream, building blocks).

**KDF / password** (`kdf`): HKDF (+ Expand-Label) **MUST**, PBKDF2 **MUST**,
Argon2id **MUST**; scrypt, Argon2i/d, bcrypt, KBKDF (SP 800-108), Concat/SSKDF
(SP 800-56A/C), X9.63-KDF, SSH-KDF **SHOULD**.

**Signatures** (`sign`): RSASSA-PSS, ECDSA (P-256/384/521, RFC 6979 deterministic),
Ed25519 **MUST**; Ed25519ph/ctx, Ed448/ph, ECDSA-secp256k1, SM2 **SHOULD**;
RSASSA-PKCS1-v1.5 verify **LEGACY-VERIFY** (sign behind a `@deprecated` opt-in);
**finite-field DSA signing EXCLUDE** (verify omitted too — cleaner than a
quarantined verifier).

**Public-key encryption** (`pubkey`/`pke`): RSA-OAEP **MUST** (constant-time,
Manger-resistant); HPKE (RFC 9180, sans-I/O) **MUST**; ECIES/sealed-box **SHOULD**;
RSAES-PKCS1-v1.5 **decrypt** **LEGACY-VERIFY** (synthetic-plaintext, Bleichenbacher-
countermeasure; Wycheproof oracle group mandatory); new PKCS1-v1.5 **encryption
EXCLUDE**.

**Key agreement** (`kex`): ECDH P-256/384/521, X25519 **MUST**; ECDH P-224 /
secp256k1 / brainpool, X448, FFDHE (RFC 7919) **SHOULD**. Curves (`ec`): P-256/384/
521, Curve25519/Edwards25519 **MUST**; P-224, secp256k1, brainpool, Curve448/
Edwards448 **SHOULD** — all constant-time (Montgomery ladder; unified/complete
Weierstrass formulas).

**OTP** (`otp`): HOTP (RFC 4226), TOTP (RFC 6238) **SHOULD**.

**DRBG** (`random`): Hash-DRBG, HMAC-DRBG, CTR-DRBG **MUST** (SP 800-90A, CAVP/ACVP
DRBG vectors).

**Post-quantum** (`pq`, phased, hybrid-first, behind a `pq` feature flag): ML-KEM
(FIPS 203) — first consumer surface is the hybrid **X25519MLKEM768**; ML-DSA (FIPS
204); SLH-DSA (FIPS 205, the low-new-math-risk anchor since it is pure hash). XMSS/
LMS stateful-hash signatures deliberately deferred (one-time-state reuse is hostile
to the value-semantics posture).

### Named refusals (on the record — no module, no shim, no `@unsafe` escape)

| Refused | Rationale |
|---|---|
| **3DES/TDEA, DES** | 64/56-bit — Sweet32 / brute-force; NIST-disallowed. |
| **RC4** | Keystream biases (RFC 7465 prohibits). |
| **RC2, Blowfish, CAST5** | 64-bit block (Sweet32); export-era/legacy. (bcrypt's internal Blowfish-derived function stays inside `kdf.bcrypt` only.) |
| **MD2, MD4** | Broken/obsolete. |
| **raw-ECB-as-easy-path** | Leaks plaintext structure; no whole-message ECB convenience exists. |
| **Finite-field DSA signing** | Nonce-reuse-fragile, dead in practice; migrated to ECDSA/EdDSA. |
| **New RSAES-PKCS1-v1.5 ciphertext** | Bleichenbacher class; decrypt-only retained for existing ciphertext. |
| **SSLv3 / TLS 1.0 / TLS 1.1** | POODLE/BEAST; RFC 8996. The TLS engine is TLS 1.3-only in v0.1. |

## Appendix C — Open questions

1. Value-generic monomorphization for `UIntN[LIMBS: int]` Montgomery code (§9).
2. Whether `CAP_ENTROPY` is default-granted or default-denied on the `service`
   profile.
3. Fork-detection seam vs mandatory `reseedAfterFork()` (§10.8).
4. `.lppkg.sig` sidecar: adopt RFC 8785 JCS, or KAT only the signature preimages
   (§18) — coordinate with the Packages Reference owner.

## Appendix D — Phased roadmap (KAT-gated)

| Phase | Scope | Gate |
|---|---|---|
| **1** | `core` object model + `random` (CAP_ENTROPY + HMAC/CTR-DRBG) + hash/xof/mac/kdf(HKDF) + cipher/aead(AES-GCM, ChaCha20-Poly1305) + the KAT harness + facade | Every Phase-1 primitive passes its published KATs (CAVP SHS/AES/GCM, FIPS 202, RFC 7693/8439/4231/5869, CAVP DRBGVS) bit-identically on native **and** Wasm; Wycheproof robustness suites green; no test touches live entropy. RED-blocks-merge. |
| **2** | `math` (two-substrate) + `sign`/`kex`/**`pke`** + password KDFs + `encoding`/`pkcs`/`x509` + **`codesign`** (first vertical) | PK KATs (RFC 8032 §7, CAVP ECDSA + RFC 6979, CAVP RSA + RFC 8017, RFC 7748 incl. 1M-iter, CAVP KAS-ECC, RFC 6070/7914/9106); SEC1/RFC8032 decoders reject every Wycheproof invalid-curve/small-subgroup case; X.509 valid-chain accepts & tampered/expired/wrong-host/unknown-CA rejects with correct verdict; codesign reproduces a real `.lppkg.sig` over its defined preimages; CMS/JWS round-trip. Bit-identical native vs Wasm. |
| **3** | `tls` (TLS 1.3 sans-I/O) + remaining AEADs | RFC 8448 trace replay byte-identical incl. every intermediate secret under the deterministic DRBG; live OpenSSL/BoringSSL interop both directions per suite/group; tlsfuzzer negatives produce exact alerts with no crash/hang/leak. |
| **4** | `ssh` (client + server) + key/agent formats | Per-KEX exchange-hash/key-derivation KATs (RFC 8731/5656/8268/3526); openssh AEAD-framing KATs (IV-reuse guard); bcrypt-pbkdf KATs; byte-identical transcript replay vs real OpenSSH; live interop across the full algorithm matrix; key round-trip + fingerprint agreement + real ssh-agent. |
| **5** | Hardening + breadth + PQ readiness | Per-feature: safegcd constant-time + `dudect` gate; `E_CT_SECRET_BRANCH` promoted to error; ML-KEM/ML-DSA vs FIPS 203/204; GCM-SIV vs RFC 8452; TLS 1.2 + resumption/0-RTT; HPKE. Promotion to **Stable** requires correctness KATs **and** Wycheproof green. |

---

*End of Draft v0.1. This document is the architecture of record; per-algorithm
signature detail and the full §App.B parity table are filled in as each phase is
implemented and its KAT gate goes green.*
