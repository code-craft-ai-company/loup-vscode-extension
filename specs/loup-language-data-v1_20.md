# Loup Language Reference v1.20 — Volume 4: Data Formats

**Status:** Release — current normative reference
**Version:** 1.20.0
**Date:** 2026-05-07
**Supersedes:** 1.19.0
**Scope:** Serialization foundation (trait-based, format-agnostic) and external interchange formats (byte-precise external data formats: COBOL records, FIX, ISO 8583, EDI, hardware register maps).

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

*Semantic additions in this volume.*

- **§4-2.4.** Three new `Encoding` enum variants: `Complex32` (8-byte IEEE 754
  single-precision complex, two `float32`s in declared endianness),
  `Complex64` (16-byte double-precision complex), and `Array` (parameterized
  multi-dimensional array with `element:`, `shape:`, and `order:` parameters).
  The auto-derived pack/unpack methods handle order conversion automatically
  when the in-memory `array[T, rank]` order differs from the declared wire
  format order, enabling zero-modification interop with column-major Fortran
  unformatted-file layouts and BLAS/LAPACK datasets.
- **§4-2.13.** Four new compile-time error codes:
  `E_INTERCHANGE_COMPLEX_LEN_MISMATCH`,
  `E_INTERCHANGE_ARRAY_SHAPE_MISMATCH`,
  `E_INTERCHANGE_ARRAY_ELEMENT_INCOMPATIBLE`, and
  `E_INTERCHANGE_ARRAY_RANK_EXCEEDED`.

---

## Table of Contents

- [§4-1 Serialization Foundation](#4-1-serialization-foundation)
  - [§4-1.1 Overview and Design Principles](#4-11-overview-and-design-principles)
  - [§4-1.2 The `Value` Intermediate Representation](#4-12-the-value-intermediate-representation)
  - [§4-1.3 `Serializable` and `Deserializable` Traits](#4-13-serializable-and-deserializable-traits)
  - [§4-1.4 Auto-Derivation Rules](#4-14-auto-derivation-rules)
  - [§4-1.5 Type Identity and URIs](#4-15-type-identity-and-uris)
  - [§4-1.6 Polymorphic Serialization](#4-16-polymorphic-serialization)
  - [§4-1.7 Field-Level Annotations](#4-17-field-level-annotations)
  - [§4-1.8 Evolution and Compatibility Rules](#4-18-evolution-and-compatibility-rules)
  - [§4-1.9 Exception Serialization](#4-19-exception-serialization)
  - [§4-1.10 Format Driver Protocol](#4-110-format-driver-protocol)
  - [§4-1.11 Security Model](#4-111-security-model)
  - [§4-1.12 Interaction with `Sendable`, `Shareable`, and `shared class`](#4-112-interaction-with-sendable-shareable-and-shared-class)
  - [§4-1.13 Error Codes](#4-113-error-codes)
- [§4-2 External Interchange Formats](#4-2-external-interchange-formats)
  - [§4-2.1 Overview and Design Principles](#4-21-overview-and-design-principles)
  - [§4-2.2 The `@interchange` Annotation](#4-22-the-interchange-annotation)
  - [§4-2.3 The `@field` Annotation](#4-23-the-field-annotation)
  - [§4-2.4 Encoding Enum](#4-24-encoding-enum)
  - [§4-2.5 Charset Enum](#4-25-charset-enum)
  - [§4-2.6 Endianness, Sign, Padding, and Justification Enums](#4-26-endianness-sign-padding-and-justification-enums)
  - [§4-2.7 OCCURS — Fixed and Variable Arrays](#4-27-occurs--fixed-and-variable-arrays)
  - [§4-2.8 REDEFINES — Field Overlays](#4-28-redefines--field-overlays)
  - [§4-2.9 Bit-Level Fields](#4-29-bit-level-fields)
  - [§4-2.10 The `Interchange` Interface and Generated Methods](#4-210-the-interchange-interface-and-generated-methods)
  - [§4-2.11 DBCS and Multibyte Charset Handling](#4-211-dbcs-and-multibyte-charset-handling)
  - [§4-2.12 Interaction with §4-1 Serialization](#4-212-interaction-with-4-1-serialization)
  - [§4-2.13 Error Codes](#4-213-error-codes)
  - [§4-2.14 Lint Advisories](#4-214-lint-advisories)

---

## §4-1 Serialization Foundation

*(This section is normative. It specifies the foundational contracts that
wire-format packages (JSON, MessagePack, CBOR, Protobuf, etc.) and RPC
libraries build upon. This section does NOT specify any particular wire
format — those are shipped as separate packages. It also does NOT specify
an RPC protocol — that is left to future work. The goal of this chapter is
to fix the shape of the serialization surface so that all future
serialization work in the Loup ecosystem is interoperable.)*

**Const evaluation and this volume (v1.21).** No serialization surface in §4-1 or §4-2 is
const-callable: none is declared `const func`, and a const context may call only
`const func`s (`E_CONST_CALLS_NON_CONST`). A format encoder or decoder marked
`const func` in a future release would be a change to that function's signature,
recorded in the change catalogue for its release; nothing is so marked in v1.21.

### §4-1.1 Overview and Design Principles

Loup's serialization foundation rests on six design principles:

1. **Trait-based, not reflection-based.** Types opt into serialization by
   implementing `Serializable` and/or `Deserializable`. The compiler can
   auto-derive implementations from type declarations (§4-1.4) but never
   serializes a type that has not been marked. This eliminates the entire
   class of deserialization-as-code-execution vulnerabilities that have
   plagued reflection-based systems.

2. **Format-agnostic intermediate representation.** Every `Serializable`
   type knows how to produce a `Value` (§4-1.2) — a tagged union covering the
   information categories that every reasonable wire format supports. Each
   format driver knows how to lower `Value` to its bytes. This decouples
   type authors from format authors.

3. **Strict composition.** A type is `Serializable` only if all of its
   serialized fields are `Serializable`. There is no "best effort" or
   silent field omission. If a class contains a field of a non-serializable
   type, the class author must either mark the field `@skip`, provide a
   manual `toValue`/`fromValue` implementation, or wrap the field in a
   serializable adapter type.

4. **Polymorphism preserves identity.** A value serialized as a subclass
   of its declared type can be reconstructed as that subclass, provided the
   receiver has registered the subclass as `Deserializable`. The default
   is structural (declared-type fields only); polymorphism is opt-in via
   `@polymorphic` or `@tagged(...)`. `BaseException` and all its subclasses
   are implicitly `@polymorphic` — this is a language-level guarantee.

5. **Evolution is explicit.** Adding a field with a default, adding an
   enum variant, and renaming-with-alias are all forward-compatible. Every
   other change is explicitly breaking, and the type author must bump the
   type's URI major version (§4-1.5) to reflect that.

6. **Security by construction.** Deserialization can only construct types
   registered as `Deserializable`. Unknown type URIs produce controlled
   errors, never silent fallbacks. Input size and depth are bounded by the
   format driver. No field initializers or constructors run during
   deserialization except the explicit deserialization path.

**Scope.** The foundation specifies:

- The `Value` intermediate representation
- The `Serializable` / `Deserializable` traits
- Auto-derivation rules for classes, structs, enums
- Type URI format and the `@serializationId` annotation
- Polymorphism via `@polymorphic` and `@tagged`
- Field-level annotations
- Compatibility rules for type evolution
- The Exception serialization contract including `RemoteException`
- The format driver protocol
- The security model

The foundation does NOT specify:

- Any specific wire format (JSON, MessagePack, etc. — these are packages)
- Streaming or chunked serialization (future work)
- Schema languages (IDLs) or cross-language code generation (future work)
- RPC semantics, versioning, or transports (future work)

### §4-1.2 The `Value` Intermediate Representation

Every `Serializable` type converts to and from a value of type `core.serialization.Value`:

```loup
namespace core.serialization;

pub enum TemporalKind {
  Instant;          # moment in time (UTC)
  DateTime;         # calendar date + time with offset
  Date;             # calendar date (no time)
  Time;             # time of day (no date)
  Duration;         # elapsed time (signed)
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
  Map(list[(Value, Value)]);              # ordered — preserves insertion order
  Variant { tag: string; fields: Value }; # enum-with-payload
  Tagged { typeUri: string?; value: Value }; # optional type identity
  Temporal { kind: TemporalKind; repr: Value }; # calendar types
}
```

**Design notes:**

- **No `Any`.** Serialization of `Any` requires explicit `@polymorphic` with a concrete type registry; there is no wildcard escape.
- **Distinct `Float32` / `Float64`.** Some formats (Protobuf, CBOR) distinguish these; preserving the distinction avoids precision loss on round-trip.
- **Distinct `Int` / `UInt` / `BigInt`.** Arbitrary-precision integers are first-class — no "string-encoded integer" kludge is permitted at this layer.
- **`Decimal` is first-class.** Financial systems require exact decimal semantics; a float-based representation would silently corrupt values.
- **`Bytes` is first-class.** Binary blobs must not be string-encoded at this layer (formats may base64 them as they see fit).
- **`Map` preserves order.** JSON objects nominally don't, but every major JSON library does preserve insertion order, and deterministic serialization matters for content-addressed storage, cryptographic signing, and cache keys.
- **`Variant` separates tag from payload.** This matches the enum memory model and serializes cleanly to tagged wire representations (Protobuf `oneof`, JSON `{"type": "...", "payload": ...}`, etc.).
- **`Tagged` optionally carries a type URI.** Used by `@polymorphic` types; absent for structurally-serialized types.
- **`Temporal` is structured.** Date/time types are infamously mishandled in serialization. A structured representation prevents "accidentally a string" bugs and enables format-appropriate encoding (RFC 3339 for JSON, numeric nanoseconds for Protobuf, native `tag 0/1` for CBOR).

**Helper methods:**

```loup
namespace core.serialization;

pub class Value {
  # Type predicates
  pub func isNull(): bool;
  pub func isScalar(): bool;    # primitives only (no collections/variants)
  pub func isCollection(): bool; # List, Map
  pub func kind(): ValueKind;

  # Safe accessors — return Option, never throw
  pub func asBool(): Option[bool];
  pub func asInt64(): Option[int64];
  pub func asFloat64(): Option[float64];
  pub func asString(): Option[string];
  pub func asBytes(): Option[bytes];
  pub func asList(): Option[list[Value]];
  pub func asMap(): Option[list[(Value, Value)]];

  # Path navigation for ergonomic access (e.g. for hand-written parsers)
  pub func get(key: string): Option[Value];   # Map lookup
  pub func at(index: int): Option[Value];     # List lookup
  pub func path(path: string): Option[Value]; # "a.b.c" dotted notation
}

pub enum ValueKind {
  Null; Bool; Int; UInt; BigInt; Float32; Float64; Decimal;
  String; Bytes; List; Map; Variant; Tagged; Temporal;
}
```

### §4-1.3 `Serializable` and `Deserializable` Traits

Two trait interfaces form the core contract:

```loup
namespace core.serialization;

pub interface Serializable {
  # Convert this value to a Value. MUST be pure (no side effects) and
  # deterministic (same input produces same output). MUST NOT throw
  # under normal conditions; any failure indicates a programming error
  # and the implementation MUST raise SerializationError.
  func toValue(): Value;

  # The type URI of this instance's dynamic type (§4-1.5). For non-
  # polymorphic types, MAY return None; for @polymorphic types MUST
  # return the correct URI for the instance's dynamic type.
  func serializationId(): Option[string];
}

pub interface Deserializable {
  # Construct an instance of this type from a Value. MUST be pure and
  # idempotent: fromValue(x.toValue()) SHALL produce a value equivalent
  # to x for all x of this type.
  #
  # Throws DeserializationError on schema mismatch, field mismatch,
  # or any violation of the type's invariants.
  static func fromValue(v: Value): Self;

  # The type URI this type deserializes. Used by polymorphic dispatch
  # (§4-1.6) to locate the deserializer for a given incoming type URI.
  static func serializationId(): string;
}
```

**Self-type in `Deserializable`.** `Self` refers to the implementing
type. The compiler dispatches every call site to the concrete
implementation's `fromValue`, never to a synthetic interface-level
function — the same mechanism that powers `From[E].from(err: E): Self`
(§1-11.2) and `Interchange.unpack(reads input: bytes): Self` (§4-2.10).

**Symmetry.** A type MAY implement `Serializable` without `Deserializable`
(write-only, e.g. log records with constructor-computed fields that
cannot be round-tripped). A type MAY implement `Deserializable` without
`Serializable` (read-only, e.g. parsing an external format where
serialization is handled separately). A type that implements both is
called **round-trip serializable** and its implementations MUST satisfy
the idempotence rule above.

**Compile-time strict composition.** If a class declares
`implements Serializable` and contains a serialized field of a type that is
not `Serializable`, the compiler emits `E_FIELD_NOT_SERIALIZABLE` pointing
at the offending field. The type author resolves this by one of:

- Marking the field `@skip` (it will not be serialized; deserialization
  uses the field's default).
- Providing a `@serialVia[Adapter]` annotation pointing at a
  `SerializationAdapter[T]` that converts the field's type to a
  `Serializable` type.
- Making the field's type `Serializable`.
- Writing a manual `toValue()` implementation and using `@manual` on the
  class declaration to opt out of auto-derivation.

The same rule applies to `Deserializable`. A class cannot silently ship
with partially-working serialization.

**Serialization adapters.** For fields whose types are not directly
`Serializable` (e.g., external types from packages the author doesn't own),
users provide adapters:

```loup
namespace core.serialization;

pub interface SerializationAdapter[T] {
  static func toValue(value: T): Value;
  static func fromValue(v: Value): T;
}

# Usage:
class PaymentRecord implements Serializable, Deserializable {
  let id: string;
  let amount: decimal;
  @serialVia[LegacyTimestampAdapter]
  let createdAt: LegacyTimestamp;  # not Serializable on its own
}

class LegacyTimestampAdapter implements SerializationAdapter[LegacyTimestamp] {
  static func toValue(value: LegacyTimestamp): Value {
    return Value.Int(value.epochMillis);
  }
  static func fromValue(v: Value): LegacyTimestamp {
    match v {
      Value.Int(ms) => return LegacyTimestamp.fromEpochMillis(ms);
      _ => throw DeserializationError("expected integer for LegacyTimestamp");
    }
  }
}
```

Adapters are the clean escape hatch for third-party types and legacy
integrations, and they preserve strict composition at the type-checker level.

**Built-in implementations.** The following types implement `Serializable`
and `Deserializable` automatically without an explicit `implements` clause:

- All primitive types: `int8`–`int64`, `uint8`–`uint64`, `bigint`, `float32`,
  `float64`, `decimal` (arbitrary-precision and fixed-precision variants),
  `complex32`, `complex64`, `bool`, `char`, `string`, `bytes`. Each maps to
  the corresponding `Value` variant (e.g., `int32` → `Value.Int`,
  `complex64` → `Value.Variant { tag: "complex", fields: Value.Map([("re", ...), ("im", ...)]) }`).
- All built-in collections: `list[T]`, `dict[K, V]`, `set[T]`, `tuple[...]`
  conditionally on their type arguments being `Serializable` /
  `Deserializable` per §4-1.4's generic-types rule.
- `array[T, rank]` (§1-4.10) conditionally on `T: Serializable`. Serializes
  as `Value.Map([("shape", Value.List([...])), ("order", Value.String("RowMajor"|"ColumnMajor")), ("base", Value.Int(0|1)), ("data", Value.List([...]))])`,
  with `data` flattened in the array's storage order. Deserialization
  reconstructs the array using the indicated shape, order, and base.
- `Option[T]`, `Result[T, E]` per §4-1.4.
- All standard exception classes — `Exception`, `IoError`, `TimeoutError`,
  `ArrayShapeError`, `ArrayIndexError`, `ComplexArithmeticError`, etc. — per
  the exception-serialization contract of §4-1.9.

User-defined classes and structs require an explicit `implements Serializable`
or `implements Deserializable` declaration to opt in (the compiler does not
infer this).

### §4-1.4 Auto-Derivation Rules

For the common case — classes and structs whose fields are all
`Serializable` / `Deserializable` — the compiler auto-derives the trait
implementations when the type declares `implements Serializable`,
`implements Deserializable`, or both:

```loup
class User implements Serializable, Deserializable {
  let id: string;
  let email: string;
  let createdAt: Instant;
  let roles: list[string];
}
# No explicit toValue / fromValue required — compiler generates both.
```

**Derivation output for classes and structs.** The generated `toValue()`
produces a `Value.Map` whose entries are `(Value.String(fieldName),
fieldValue.toValue())` in source-declaration order. Fields marked `@skip`
are excluded. Fields marked `@alias("wireName")` use the alias as their key.
`@skipIfDefault` fields are omitted when equal to their declared default.

The generated `fromValue()` matches the incoming `Value.Map` entries
against the type's fields and invokes the field types' `fromValue`
methods. Unknown keys are handled per §4-1.8. Missing required keys throw
`DeserializationError`.

**Derivation output for enums.** Enum variants with no payload serialize
as `Value.String(variantName)`. Variants with a payload serialize as
`Value.Variant { tag: variantName, fields: payloadAsValue }`. Enum
derivation automatically handles both cases and produces the matching
`fromValue`.

**Derivation output for tuples.** A tuple `(A, B, C)` where A, B, C are
all `Serializable` serializes as `Value.List([a.toValue(), b.toValue(),
c.toValue()])`. Deserialization reverses this.

**Derivation output for `Option[T]` and `Result[T, E]`.** `None` serializes
as `Value.Null`; `Some(v)` serializes as `v.toValue()`. `Ok(v)` serializes
as `Value.Variant { tag: "Ok"; fields: v.toValue() }`; `Err(e)` as
`Value.Variant { tag: "Err"; fields: e.toValue() }`.

**Derivation for `shared class`.** A `shared class` whose fields are all
`Serializable` may opt into auto-derivation via `implements Serializable`
identically to `local class`. The `toValue()` output is byte-compatible
with a structurally-equivalent `local class` — serialization is
memory-strategy-agnostic (see §4-1.12). `shared class` instances are
auto-derived as `Shareable` separately from `Serializable`; the two traits
are orthogonal.

**Inheritance.** When a class inherits from a class that implements
`Serializable`, the subclass's auto-derived `toValue` includes the
superclass's serialized fields first (in declaration order), followed by
the subclass's own fields. For polymorphic dispatch, the subclass's
`serializationId()` returns the subclass's URI.

**Generic types.** A generic class can be conditionally serializable —
`Box[T]` implements `Serializable` if and only if `T` does. This mirrors
the conditional-`Sendable` mechanism (§2-1.8.1). Declare the conditional
implementation with a `where` clause:

```loup
class Box[T] : Any
  implements Serializable   where T: Serializable,
  implements Deserializable where T: Deserializable
{
  pub let value: T;
  new(value: T) { this.value = value; }
}
```

Under the conditional implementation:

- `Box[int]` is `Serializable` and `Deserializable` (int satisfies both).
- `Box[User]` is `Serializable`/`Deserializable` iff `User` is.
- `Box[LocalFileHandle]` is neither, if `LocalFileHandle` is not serializable.

**Conditional-trait declaration syntax.** The `implements` clause on a
generic type may be constrained by `where` to apply only for certain type
argument combinations:

```loup
class Box[T] implements Serializable where T: Serializable,
                    implements Deserializable where T: Deserializable {
  pub let value: T;
  new(value: T) { this.value = value; }
}
```

Each `implements` clause may carry its own `where` constraint. A type
argument that satisfies the constraint participates in that implementation;
one that does not, does not. This is resolved at compile time when the
generic is instantiated.

Stdlib generic container types (`list[T]`, `dict[K, V]`, `set[T]`,
`Option[T]`, `Result[T, E]`, tuples, `SharedRef[T]`, `Atomic[T]`) all have
pre-declared conditional `Serializable` / `Deserializable` implementations
of this form — no user declaration is needed to serialize a `list[User]`
or a `SharedRef[Config]` once `User` / `Config` are themselves serializable.

**Opt-out from auto-derivation.** A class with `@manual` on its declaration
retains the `implements Serializable` declaration but does not get an
auto-derived body; the user must provide `toValue`/`fromValue` manually.

### §4-1.5 Type Identity and URIs

Every polymorphic type has a **type URI** — a globally unique, version-
scoped name that identifies the type on the wire. The canonical form is:

```
<package-name>/<module-path>/<type-name>@<major-version>
```

**Examples:**
- `loup.http/errors/HttpConnectionError@2`
- `myapp/models/User@1`
- `loup.stdlib/core/Option@1`

**Field meanings:**

- `<package-name>` — the package name from `.lppkg`. For stdlib types,
  this is `loup.stdlib`. For user-project types with no published package
  (running locally), this is `_local_` followed by the first 16 lowercase
  hex characters of SHA-256 applied to the absolute path of the project's
  `.lppkg` file — e.g., `_local_3a7b9c2d4e6f1a8b`. This prevents URI
  collisions when developers share serialized data across machines with
  independent projects, at the cost of a URI that changes if the project
  moves on disk. Packages that eventually publish (assign a real package
  name) become wire-incompatible with their `_local_*` predecessor — this
  is intentional; users who need wire stability across the publish boundary
  declare `@serializationId` explicitly from the start.
- `<module-path>` — dotted path from package root to the declaring module,
  e.g. `errors` for a module at `src/errors.loup` or `net.http.errors` for
  nested modules.
- `<type-name>` — the declared type name.
- `<major-version>` — a monotonically increasing integer matching the
  type's major-version number. Starts at 1. Bumped when a breaking change
  is made to the type (per §4-1.8).

**Automatic URIs.** The compiler automatically assigns a type URI to
every `Serializable` type with major-version 1. Users bump the version
explicitly when making breaking changes (see §4-1.8).

**Explicit URIs via `@serializationId`.** Users can override a type's URI
for cross-language interop or for renaming a type without breaking
wire compatibility:

```loup
@serializationId("com.example.auth/User@3")
class User implements Serializable, Deserializable {
  # ...
}
```

The explicit URI must match the canonical format (package/module/name@version)
and must be unique within the project. The compiler emits
`E_SERIAL_URI_COLLISION` if two types declare the same URI.

**URI stability rules.**

- The URI MUST NOT change for non-breaking edits (adding an optional field
  with a default, renaming a field with `@alias`, reordering fields).
- The URI's major-version MUST be bumped for breaking edits (removing a
  field, renaming without alias, changing a field's type incompatibly).
- A type that rolls out with multiple coexisting versions publishes both
  URIs and deserialization logic for both — typically by declaring the
  old type `@deprecated` and providing a migration function.

**URI resolution.** When a deserializer receives a `Value.Tagged` with a
URI, it consults its type registry to find the matching `Deserializable`
implementation. The registry is populated at compile time from all
`Deserializable` declarations visible to the compiled module. A URI with
no registered handler is handled per the polymorphism rules (§4-1.6) — for
exceptions, it becomes `RemoteException`; for other polymorphic families,
it produces `UnknownTypeError`.

### §4-1.6 Polymorphic Serialization

The default serialization behavior is **structural**: a value's static
(declared) type determines what gets serialized. A `list[Exception]`
with `IoError` and `TimeoutError` elements would, under structural rules,
lose the subclass distinction.

**Polymorphic types** carry their dynamic type identity on the wire. A
type opts into polymorphism in one of two ways:

**`@polymorphic` annotation.** Placed on a class declaration, marks the
class and all its subclasses as polymorphic. Serialized instances are
wrapped in `Value.Tagged` carrying the dynamic type's URI:

```loup
@polymorphic
class Shape implements Serializable, Deserializable {
  let color: string;
}

class Circle : Shape {
  let radius: float64;
}

class Rectangle : Shape {
  let width: float64;
  let height: float64;
}
```

A `list[Shape]` containing a `Circle` and a `Rectangle` serializes as:

```
Value.List([
  Value.Tagged {
    typeUri: "myapp/shapes/Circle@1",
    value: Value.Map([("color", "red"), ("radius", 5.0)])
  },
  Value.Tagged {
    typeUri: "myapp/shapes/Rectangle@1",
    value: Value.Map([("color", "blue"), ("width", 3.0), ("height", 4.0)])
  }
])
```

Deserialization dispatches on the URI to reconstruct the correct subclass.

**`@tagged(discriminator)` annotation.** Places the type tag inside the
serialized `Value.Map` as a named field rather than wrapping in
`Value.Tagged`. This matches how many wire formats (Protobuf `oneof`,
JSON discriminated unions) conventionally represent polymorphism:

```loup
@tagged("kind")
class Event implements Serializable, Deserializable {
  let timestamp: Instant;
}

class LoginEvent : Event {
  let userId: string;
}
```

A `LoginEvent` under `@tagged("kind")` serializes as:

```
Value.Map([
  ("kind", "myapp/events/LoginEvent@1"),
  ("timestamp", Value.Temporal { ... }),
  ("userId", "u123")
])
```

The `@tagged` form is friendlier for JSON consumers; the `@polymorphic`
form is more efficient for binary formats with native tagging.

**Implicit polymorphism for `BaseException`.** All `BaseException`
subclasses are implicitly `@polymorphic`. This is a language-level rule
that cannot be overridden — exceptions always carry their dynamic type on
the wire. See §4-1.9 for details.

**Sealed polymorphism.** Enum types are implicitly polymorphic without
annotation: their variant tag IS the dynamic type identity. No `@polymorphic`
is needed.

**Registry bounds for deserialization.** A `@polymorphic` family's
deserialization registry includes exactly those subclasses registered as
`Deserializable` at the receiver's compile time. An incoming URI not in
the registry is `UnknownTypeError` (for user types) or produces
`RemoteException` (for `BaseException` subclasses).

**Closed polymorphism with `sealed`.** Users may declare a polymorphic
hierarchy `sealed` (§1-8.3.2) to indicate that all valid subclasses are
known at compile time. Deserialization of an unknown URI in a sealed
hierarchy is a hard error (`DeserializationError`), not an unknown-type
fallback. Sealed hierarchies are appropriate for internal data models;
open hierarchies are appropriate for protocols designed for third-party
extension.

### §4-1.7 Field-Level Annotations

The following annotations control per-field serialization behavior:

**`@serialField(name: string)`** — Alias for `@alias`; overrides the wire
name of a field. Useful for matching external schemas or legacy data.

```loup
class User implements Serializable, Deserializable {
  @serialField("user_id")
  let id: string;

  @serialField("email_address")
  let email: string;
}
```

**`@alias(name: string, ...)`** — One or more additional names the
deserializer accepts for a field. The primary serialized name remains the
field's declared name (unless `@serialField` also applies). Used during
schema migrations.

```loup
class User implements Serializable, Deserializable {
  @alias("username", "user_name")    # accepts both on read
  let name: string;                   # writes as "name"
}
```

**`@skip`** — The field is not serialized. On deserialization the field
receives its declared default. A field marked `@skip` with no default
causes `E_SKIP_NO_DEFAULT` at compile time.

**`@skipIfDefault`** — The field is omitted from serialization when its
value equals the declared default. Useful for reducing wire size for
optional-ish fields.

**`@sensitive`** — Marks a field as containing sensitive data (passwords,
tokens, PII). Format drivers SHOULD redact sensitive fields in debug
output; compliant drivers MUST provide a mode flag to serialize or omit
them entirely. The default mode is **include-and-mark**: the field is
serialized normally, but the format driver attaches out-of-band metadata
flagging it. Drivers targeting logging or debugging contexts SHOULD
replace sensitive values with a redacted marker. RPC bodies sent across
network boundaries SHALL include them unless the caller opts into
sensitivity-aware serialization.

**`@serialVia[Adapter]`** — Specifies a serialization adapter for the
field (§4-1.3). The adapter converts the field's non-serializable type to
and from a `Value`.

**`@deprecated(reason: string)`** — Marks a field as deprecated. Does not
affect serialization behavior but emits a lint warning when the field is
accessed and a note in generated schema documents.

**`@optional`** — On a required-looking field (one without a declared
default), treats the field as optional for deserialization — missing
inputs produce an implicit `None` (for `Option[T]` fields) or the type's
zero value. Should be rare; prefer declaring defaults.

**Annotation interaction.**

- `@skip` and `@skipIfDefault` are mutually exclusive (`E_SKIP_BOTH`).
- `@alias` and `@serialField` may coexist; `@serialField` sets the primary
  name and `@alias` adds additional accepted names for reads.
- `@sensitive` is independent of and composes with all other annotations.

### §4-1.8 Evolution and Compatibility Rules

The foundation specifies the following changes and their compatibility
status:

| Change | Compatibility | Versioning |
|---|---|---|
| Add a field with a default | Forward- and backward-compatible | No URI bump; `@since` SHOULD be documented |
| Add a field without a default | Breaking | Major URI bump required |
| Remove a field | Breaking (old receivers miss it) | Major URI bump required |
| Rename a field (without alias) | Breaking | Major URI bump required |
| Rename a field (with `@alias` to old name) | Forward- and backward-compatible | No URI bump |
| Change a field's type to a compatible type (`int32` → `int64`, `string` → `string?`) | Forward-compatible (old senders work; new receivers OK) | No URI bump if documented |
| Change a field's type to an incompatible type | Breaking | Major URI bump required |
| Add an enum variant | Breaking for receivers that don't handle unknown variants | Major URI bump unless enum is `@open` (see below) |
| Remove an enum variant | Breaking (new receivers can't handle old values) | Major URI bump |
| Mark a field `@deprecated` | Non-breaking | No URI bump |
| Mark a field `@skip` | Breaking (previously-serialized data is now lost on round-trip) | Major URI bump |
| Change a polymorphism annotation (`@polymorphic` ↔ `@tagged`) | Breaking | Major URI bump |

**`@open` enums.** An enum may be marked `@open` to declare that new
variants may be added in future versions without a URI bump. Receivers
handling an unknown variant of an `@open` enum produce an
`UnknownEnumVariant` wrapper value (accessible via `match`); the message
remains deserializable. Most user enums should NOT be `@open`; protocol
enums designed for extension SHOULD be.

**Default-fallback behavior.** For fields added with defaults, if an old
serialized value doesn't contain the field, the deserializer inserts the
default. If a new serialized value contains a field that the deserializer's
type doesn't know about, the behavior depends on `@strictSchema`:

- Without `@strictSchema`, unknown fields are silently ignored (the
  default — permissive).
- With `@strictSchema`, unknown fields produce
  `DeserializationError`. Appropriate for cryptographic or financial
  contexts where extra fields may signal tampering or bugs.

**Migration helpers.** The stdlib provides `core.serialization.migrate`:

```loup
namespace core.serialization;

pub func migrate[T: Deserializable](
  oldValue: Value,
  oldTypeUri: string,
  fromOld: fn(Value): T,
): T;
```

`migrate` is invoked when a type has rolled over its major version and a
receiver encounters a serialized value with the old URI. The author of
the new type registers a migration function via `@migrateFrom`:

```loup
@serializationId("myapp/User@2")
@migrateFrom("myapp/User@1", migrateUserV1)
class User implements Serializable, Deserializable {
  let id: string;
  let fullName: string;   # was "name" in v1
}

func migrateUserV1(oldValue: Value): User {
  let m = oldValue.asMap()!;
  let id = m.findKey("id").asString()!;
  let name = m.findKey("name").asString()!;
  return User(id: id, fullName: name);
}
```

Multiple `@migrateFrom` annotations chain: v3 can specify migrations from
v2 and from v1 separately. The runtime picks the most specific match.

### §4-1.9 Exception Serialization

*(This subsection is normative.)*

All `BaseException` subclasses have a mandatory serialization contract.
Exception serialization preserves dynamic type, message, cause chain, and
symbolic stack trace across any process or language boundary.

**Contract.** Every `BaseException` subclass is implicitly
`@polymorphic`. The auto-derived `toValue()` produces a `Value.Tagged`
with:

- `typeUri` — the exception's type URI (per §4-1.5).
- `value` — a `Value.Map` containing the following keys in this order:
  - `"message"` — `Value.String`
  - `"cause"` — either `Value.Null` or a nested serialized exception (recursively)
  - `"stackTrace"` — a `Value.List` of serialized `StackFrame` entries
  - Any additional user-declared fields, serialized per their types

**StackFrame serialization.** `StackFrame` is a struct:

```loup
namespace core;

pub struct StackFrame implements Serializable, Deserializable {
  pub let module: string;          # e.g. "myapp.http.client"
  pub let function: string;         # e.g. "sendRequest"
  pub let file: Option[string];     # absolute path on originating machine
  pub let line: Option[int];
  pub let column: Option[int];
  pub let functionUri: Option[string];  # stable function identity (if available)
}
```

Serialization preserves frames symbolically — no machine-specific data
(process ID, absolute memory addresses) crosses the boundary. Receivers
can re-resolve `functionUri` against their own source maps if desired.

**`RemoteException` — the unknown-URI fallback.** When a deserializer
encounters a `Value.Tagged` whose `typeUri` refers to a `BaseException`
subclass that is not registered as `Deserializable` on the receiver, it
produces a `RemoteException` instance:

```loup
namespace core;

pub class RemoteException : Exception {
  pub let originalTypeUri: string;
  pub let originalFields: dict[string, Any];
  # Inherited: message (from BaseException), cause, stackTrace
}
```

`RemoteException` carries:

- `originalTypeUri` — the URI the sender attached.
- `originalFields` — every serialized field that wasn't reconstructed into
  a known field on `RemoteException`'s class (as deserialized `Value`
  converted to `Any`).
- The standard `message`, `cause`, and `stackTrace` inherited from
  `BaseException` — which ARE always reconstructed because they are part
  of the root exception contract.

This design means: **a Loup receiver can always debug a remote exception
even from a language or package it has never heard of.** The type URI tells
it what was thrown, the message tells it why, the cause chain shows the
upstream failure, and the stack trace shows where it came from.
`RemoteException` can itself be caught in normal `try`/`catch`; callers
match on `originalTypeUri` if they need to branch on specific remote types.

**Cause chain preservation.** A `BaseException` with a non-null `cause`
serializes the cause recursively. The cause may itself be a
`BaseException` (nested exception) or a non-exception value (arbitrary
`Serializable` caused-by annotation). Deeply-nested cause chains are
bounded by the format driver's depth limit (§4-1.11); exceeding the limit
truncates the chain and appends a synthetic `CauseTruncatedException` at
the deepest point.

**Receiver rewriting of stack traces.** Receivers MAY rewrite the
`stackTrace` frames upon receipt to mark them as remotely-sourced, prepend
frames showing the local call site that received the exception, or
otherwise aid debugging. This MUST be done in a non-destructive way — the
original frames MUST remain identifiable (e.g. by a `remote: bool` flag
added to each frame in a receiver-specific way, not specified normatively).

**Security implications.** Because `RemoteException` instantiation is
purely data-driven — no code path runs from the sender's side — there is
no deserialization-as-code-execution surface even when receiving
exceptions from fully untrusted senders.

**Non-catchable BaseException subclasses.** `SystemExit`,
`KeyboardInterrupt`, and `GeneratorExit` are serializable under this
contract (they are `BaseException` subclasses) but deserializing them into
a running program produces a `SecurityError` — allowing a remote endpoint
to inject a `SystemExit` into a local process would be a vulnerability.
The intent of these types is local-process lifecycle signaling, not cross-
boundary transport. Applications that legitimately need to propagate these
across boundaries do so by wrapping them in a regular `Exception`
subclass.

### §4-1.10 Format Driver Protocol

A **format driver** is a type that converts between `Value` and a specific
wire format (JSON, MessagePack, CBOR, etc.). Format drivers live in
separate packages (e.g., `loup.format.json`); the language foundation
specifies only the interface they implement.

```loup
namespace core.serialization;

pub interface FormatDriver {
  # Driver identity — stable name used in content-type headers, debug output.
  static func name(): string;
  static func contentType(): string;   # e.g. "application/json"

  # Serialize a Value to the driver's wire format.
  # MUST respect the config's limits (§4-1.11).
  static func encode(value: Value, config: EncodeConfig = EncodeConfig.default()): bytes;

  # Deserialize a Value from the driver's wire format.
  # MUST reject inputs exceeding the config's limits with DeserializationError.
  static func decode(bytes: borrow bytes, config: DecodeConfig = DecodeConfig.default()): Value;
}

# Optional sub-interface for drivers that support streaming I/O. A driver
# opts into streaming by implementing both FormatDriver and StreamingFormat.
# All drivers MUST provide the non-streaming FormatDriver form; streaming is
# the optional capability.
pub interface StreamingFormat : FormatDriver {
  # Encode to a writer incrementally. Implementations SHOULD avoid materializing
  # the full encoded bytes in memory.
  static func encodeStream(value: Value, writer: io.Writer, config: EncodeConfig): void;

  # Decode from a reader incrementally. Implementations SHOULD avoid buffering
  # the full input in memory beyond the configured maxSizeBytes.
  static func decodeStream(reader: io.Reader, config: DecodeConfig): Value;
}

pub struct EncodeConfig {
  pub maxDepth: int = 64;
  pub maxSizeBytes: int = 16.MiB;
  pub pretty: bool = false;              # format-dependent; may be ignored
  pub sensitiveMode: SensitiveMode = SensitiveMode.Include;
  pub deterministic: bool = true;        # sort map keys, normalize encoding
}

pub struct DecodeConfig {
  pub maxDepth: int = 64;
  pub maxSizeBytes: int = 16.MiB;
  pub strictSchema: bool = false;
  pub unknownTypeBehavior: UnknownTypeBehavior = UnknownTypeBehavior.RemoteException;
}

pub enum SensitiveMode {
  Include;       # serialize sensitive values normally (flagged out-of-band)
  Redact;        # replace with a redaction marker
  Omit;          # drop sensitive fields entirely
}

pub enum UnknownTypeBehavior {
  RemoteException;       # for @polymorphic BaseException hierarchies
  Error;                 # throw DeserializationError (sealed hierarchies)
  Skip;                  # drop the value (appropriate for lossy imports)
}
```

**Convenience functions.** The stdlib provides top-level helpers that
accept a driver as a generic parameter:

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

pub func roundtrip[T: Serializable + Deserializable, D: FormatDriver](
  value: T,
): T;   # diagnostic — serialize + deserialize; useful for testing
```

Example:

```loup
from loup.format.json import (JsonFormat);
from core.serialization import (serialize, deserialize);

let user = User(id: "u42", email: "alice@example.com");
let wire: bytes = serialize[User, JsonFormat](user);
let back: User = deserialize[User, JsonFormat](wire);
```

**Format driver compliance.** A format driver package declares compliance
with the foundation by declaring `implements FormatDriver` on its driver
type and passing the foundation's conformance test suite (published as
part of the Loup toolchain). A compliant driver guarantees:

- Round-trip fidelity for all `Value` variants the format can natively represent.
- Deterministic output when `deterministic: true` is specified (same input produces byte-identical output across platforms, architectures, and Loup versions).
- Depth and size limits are enforced and produce clean errors on violation.
- Sensitive-field handling honors the `SensitiveMode` configuration.

### §4-1.11 Security Model

The serialization foundation commits to the following security properties:

**Opt-in deserialization.** A type is constructible from serialized data
only if it has been declared `Deserializable` and is registered in the
deserialization target's compile-time type graph. No reflection-based
fallback exists.

**No code execution during deserialization.** The `fromValue` contract
explicitly forbids:

- Invoking user-declared constructors that have side effects beyond field
  initialization.
- Running field initializer expressions (auto-derived `fromValue` sets
  fields by direct assignment, not by re-running declared defaults).
- Triggering module initialization as a side effect of type resolution.
- Performing I/O, spawning tasks, or acquiring locks.

Manual `fromValue` implementations that violate these rules are
recommended to be rejected by linting; the compiler emits
`W_IMPURE_FROMVALUE` advisory warnings when it detects such calls in a
`fromValue` body.

**Resource bounds.** Format drivers enforce:

- **Maximum depth** — the deepest nesting level of `Value.List`,
  `Value.Map`, `Value.Variant`, `Value.Tagged`. Default 64. Exceeded
  inputs produce `DeserializationError`.
- **Maximum size** — the total byte count of the input. Default 16 MiB.
  Exceeded inputs produce `DeserializationError`.
- **Per-field size** — drivers MAY enforce per-string / per-bytes length
  limits, though the foundation does not require a specific value.

All limits are configurable per decode call. Applications accepting
untrusted input SHOULD tune these down aggressively; applications
round-tripping internal data MAY raise them for known-bounded payloads.

**Polymorphism registry.** A polymorphic type's deserialization registry
is populated from the compile-time type graph of the deserializing module.
Types not visible at compile time cannot be deserialized. Dynamic type
registration is not supported — this closes the attack vector where an
attacker causes code to be loaded that registers a malicious type.

**Unknown URI handling.** For `BaseException` subclasses,
`RemoteException` is the data-only fallback. For other polymorphic
families, the behavior is `DeserializationError` (default) or the
user-chosen `UnknownTypeBehavior`. In no case can an unknown URI cause
arbitrary code to run.

**Cycle detection.** Deserialization tracks visited values; cyclic `Value`
inputs produce `DeserializationError`. Serialization detects cycles in
the source object graph and either uses a `WeakRef` escape hatch (for
types declaring it) or raises `SerializationError`.

**Integer range checks.** When a wire-format value exceeds the range of
the target type (e.g., a wire `int64` being deserialized into an `int32`
field), the deserializer produces `DeserializationError` rather than
silently truncating.

**Floating-point edge cases.** NaN, positive infinity, and negative
infinity round-trip losslessly when the format supports them. Formats
without native infinity/NaN representation (strict JSON) MUST either
reject these values on encode (default) or accept an explicit opt-in
configuration to encode them as strings — the choice is per-driver and
documented.

### §4-1.12 Interaction with `Sendable`, `Shareable`, and `shared class`

`Serializable` is **independent** of `Sendable` and `Shareable`. A type
may be:

- `Serializable` only — safe to put on a wire but not to transfer across
  threads in-memory (unusual, but possible — e.g., types holding
  thread-local handles that serialize cleanly via adapters).
- `Sendable` only — safe to transfer across threads by copy but not to
  put on an external wire (e.g., types containing `extern native` handles).
- `Shareable` only — safe to share across threads by reference but not to
  put on an external wire (e.g., types containing `SharedMutex`).
- Any combination of the above.

The language does NOT imply any of these traits from any other. Each
trait is opt-in and independently checkable.

**`shared class` and serialization.** A `shared class` MAY implement
`Serializable` and `Deserializable`. When it does, **the wire format goes
through the normal `Value` intermediate representation** — the normative
cross-mode ABI layout (§2-2.7) is an in-process memory contract and is
NOT used as a wire format. This keeps serialization format-independent
and layout-independent; wire data can be round-tripped through modes and
processes that have different `shared class` ABI versions.

A `shared class`'s `toValue()` produces `Value.Map` entries for its
fields in declaration order (same as `local class`). The atomic refcount,
weakcount, type descriptor, vtable pointer, and other header fields are
NOT serialized — they are reconstructed on deserialization into the
receiver's local arena. Deserialization constructs a new `SharedRef[T]` in
the receiver's default arena (or an explicitly-specified arena); the
receiver and sender do not share the same arena memory.

**`SharedRef[T]` as a `Serializable` type.** `SharedRef[T]` is conditionally
`Serializable`: `SharedRef[T]` is `Serializable` if and only if `T` is
`Serializable`. The compiler emits this conditional implementation
automatically, matching the pattern used for `Sendable` on generic types.

**`SharedRef[T]` field semantics.** A field of type `SharedRef[T]` in a
`Serializable` class serializes the pointed-to instance by value. On
deserialization, a fresh `SharedRef[T]` is constructed in the receiver's
arena. Receivers handling many instances should pool allocations in a
dedicated arena configured before the deserialization call.

**Cycles involving shared references.** If a `shared class` contains fields
that form a reference cycle via `SharedRef[T]`, serialization detects the
cycle per §4-1.11 and either uses a `WeakRef` escape hatch (when the cycle
is broken by a `weak` field) or raises `SerializationError`. The serializer
does NOT emit in-wire backreference markers — the `Value` intermediate
representation has no identity concept; every occurrence of an object in
the source graph produces an independent serialized copy. This means
non-cyclic shared-reference sharing (two paths in the graph reaching the
same instance) produces two independent copies on the wire, which
deserialize into two distinct instances on the receiver. Programs that
depend on receiver-side identity preservation MUST use a higher-level
protocol (e.g. a content-addressed dedup layer) above the foundation.

### §4-1.13 Error Codes

**Compile-time errors:**

| Code | Condition |
|---|---|
| `E_FIELD_NOT_SERIALIZABLE` | Field in `Serializable` class has type not implementing `Serializable` (and no `@serialVia` adapter, no `@skip`) |
| `E_FIELD_NOT_DESERIALIZABLE` | Field in `Deserializable` class has type not implementing `Deserializable` (and no `@serialVia` adapter, no `@skip`) |
| `E_SKIP_NO_DEFAULT` | `@skip` annotation on a field with no declared default |
| `E_SKIP_BOTH` | Field has both `@skip` and `@skipIfDefault` |
| `E_SERIAL_URI_COLLISION` | Two types declare the same `@serializationId` |
| `E_SERIAL_URI_MALFORMED` | `@serializationId` value does not match the canonical URI format |
| `E_ADAPTER_TYPE_MISMATCH` | `@serialVia[Adapter]` where Adapter's `T` doesn't match the field type |
| `E_OPEN_NOT_ENUM` | `@open` applied to a non-enum type |
| `E_TAGGED_CONFLICT` | Both `@polymorphic` and `@tagged(...)` applied to the same type |
| `E_MIGRATE_FROM_SAME_URI` | `@migrateFrom` references the declaring type's own URI |

**Runtime errors:**

| Exception | Thrown when |
|---|---|
| `SerializationError` | A `toValue` implementation detected an invariant violation (cycle not handled, adapter failure, etc.) |
| `DeserializationError` | Wire input is malformed, exceeds limits, has schema mismatch, or violates invariants |
| `UnknownTypeError` | Incoming type URI not registered in a non-`RemoteException`-configured polymorphic family |
| `CauseTruncatedException` | Synthetic exception inserted at the end of a truncated exception cause chain |
| `SecurityError` | Deserialization attempted a forbidden operation (e.g., reconstructing `SystemExit`) |
| `UnknownEnumVariant` | Unknown variant received for an `@open` enum; exposed via `match` |

---

## §4-2 External Interchange Formats

*(This section is normative.)*

### §4-2.1 Overview and Design Principles

The `@interchange` annotation declares that the annotated type's byte layout is dictated by an external specification. The compiler auto-derives `pack` and `unpack` methods that convert between the typed Loup value and a `bytes` representation conforming to the declared layout.

This is the mechanism Loup provides for fixed-format external data: COBOL records and copybooks, FIX and SWIFT financial messages, ISO 8583 transaction messages, X12 and EDIFACT EDI segments, hardware register maps, network packet formats, and any other situation where the application does not get to choose the byte representation.

**Distinction from §4-1 Serialization.** The §4-1 Serialization Foundation specifies trait-based encoding via format drivers (JSON, MessagePack, CBOR, etc.) where the format choice is internal to the application and the wire format is itself a Loup-defined contract. §4-2 specifies external interchange where the format is dictated by something outside Loup — a regulatory specification, a legacy mainframe layout, an industry protocol document, or a hardware datasheet. The two systems serve different purposes and may be applied to the same type independently:

- A `Trade` type may be `@serialField`-annotated for §4-1 JSON encoding to an internal database **and** `@interchange`-annotated for §4-2 FIX-protocol encoding to a counterparty.
- §4-1 produces self-describing wire formats with type-identity URIs and schema evolution rules. §4-2 produces opaque byte streams with no type metadata — the receiver must already know the layout.

**Design principles.**

1. **Byte-level fidelity.** The generated pack/unpack code reproduces the external specification exactly, including padding, sign placement, encoding boundaries, and bit ordering. There is no "approximately correct" mode.
2. **Compile-time validation.** Layout consistency — total length, field offsets, REDEFINES coverage, OCCURS DEPENDING ON references — is checked at compile time. Errors at runtime are reserved for genuine input-data problems (insufficient bytes, invalid digits, bad encoding).
3. **Auditability.** Every encoding directive is greppable by name (`Comp3`, `Ebcdic1047`, `LeadingOverpunch`). A reviewer auditing a translated COBOL copybook can verify field-by-field correspondence with the original.
4. **No special compiler magic outside this section.** `@interchange` and `@field` are ordinary annotations consumed by the compiler's annotation-processing pass. The `Encoding` and `Charset` enums in `core.interchange` are ordinary types whose variants drive code generation; user code may reference them at runtime for diagnostic and tooling purposes.

**Applicable to structs and classes.** `@interchange` may be applied to any `struct` or `class` declaration. Pack and unpack methods operate on field *values*, not on memory addresses, so the in-memory layout does not need to mirror the wire layout. A class with reference semantics, heap header, and ARC machinery is just as packable as a `@repr(packed)` struct — the auto-derived methods walk the fields and emit/consume bytes in declared order. Applying `@interchange` to a class enables natural use in collections (`list[CustomerMaster]`) and identity-based equality where appropriate.

**Independence from `@repr(packed)`.** `@repr(packed)` is a separate, optional annotation that controls in-memory layout for zero-copy memory-mapping or FFI scenarios. It is not required by `@interchange` and addresses a different concern. Users who want both byte-format conversion *and* zero-copy mmap access apply both annotations.

**Availability.** `@interchange` is valid in `@mode(host.scripted)`, `@mode(host.dual)`, `@mode(host.native)`, `@mode(web.compiled)`, and `@mode(freestanding)`. It is **not** valid in `@mode(web.scripted)` (`E_INTERCHANGE_NOT_AVAILABLE`) — the JIT pipeline does not generate the auto-derived pack/unpack methods at module-load time. Modules that require `@interchange` and target the browser must compile to `@mode(web.compiled)`.

In `@mode(freestanding)`, encodings that depend on the decimal runtime — `Zoned`, `Comp3`, `Decimal128` — are unavailable because `decimal` and `decimal(p, s)` are themselves unavailable in freestanding (§1-4.1.4). The encodings that remain available are `Binary`, `Float32`, `Float64`, `IbmHexFloat32`, `IbmHexFloat64`, `BoolByte`, `Bytes`, `Nested`, `Text` (the last only with non-DBCS charsets, since DBCS conversion tables also require runtime support), and the v1.20 additions `Complex32`, `Complex64`, and `Array` (the last when the per-element encoding is itself usable in freestanding). Note that pack/unpack of `Complex32`/`Complex64` is purely byte-rearrangement and is heap-free and runtime-free; operations performed *on* the resulting `complex32`/`complex64` values may still require a math runtime per §1-4.1.6 if they invoke transcendentals.

### §4-2.2 The `@interchange` Annotation

`@interchange` is a struct-level or class-level annotation. It declares the annotated type as an external interchange format and triggers compiler generation of the pack/unpack surface specified in §4-2.10. The annotated type automatically implements the `core.interchange.Interchange` interface (§4-2.10).

**Parameters.**

```loup
@interchange(
    endianness: Endianness = Big,
    charset:    Charset    = Utf8,
    length:     int?       = None,
    strict:     bool       = true,
)
```

| Parameter | Type | Default | Meaning |
|---|---|---|---|
| `endianness` | `Endianness` | `Big` | Byte order for multi-byte primitive encodings (`Binary`, `Float32`, `Float64`, `IbmHexFloat32`, `IbmHexFloat64`, `Decimal128`). Big-endian is the mainframe and network-protocol default. |
| `charset` | `Charset` | `Utf8` | Default character set for `Text` and `Zoned` fields that do not declare their own. Inherited by every field that omits an explicit `charset:`. |
| `length` | `int?` | `None` | Optional total length of the record in bytes. When present, the compiler verifies that the sum of field lengths exactly equals this value. A mismatch is `E_INTERCHANGE_LENGTH_MISMATCH`. May not be combined with variable-length types (those containing a `countFrom:` field) — `E_INTERCHANGE_VARIABLE_LENGTH_DECLARED`. |
| `strict` | `bool` | `true` | When `true`, unmapped trailing bytes in input cause `unpack` to throw `InterchangeError`. When `false`, trailing bytes are silently ignored. |

**Compile-time validation.** When a type is annotated `@interchange`, the compiler performs all of the compile-time checks listed in §4-2.13. The most common failures are: every field must carry an `@field` annotation; field encodings must be compatible with their Loup types; declared `length:` must match the sum of field lengths; `redefines:` and `countFrom:` references must resolve to previously-declared fields; field digit capacity must not exceed the Loup type's representable range. See §4-2.13 for the full list with conditions.

**Example.**

```loup
@interchange(charset: Ebcdic1047, length: 83)
struct CustomerMaster {
    @field(len: 11, encoding: Zoned, sign: TrailingOverpunch)
    var customerId: int64;

    @field(len: 30)
    var name: string;

    @field(len: 6, encoding: Comp3, scale: 2, sign: Signed)
    var balance: decimal(11, 2);

    @field(len: 8, encoding: Binary, sign: Signed)
    var lastUpdated: int64;

    @field(len: 4, encoding: Binary)
    var statusCode: uint32;

    @field(len: 24)
    var notes: string;
}
```

The compiler verifies 11 + 30 + 6 + 8 + 4 + 24 = 83, matching the declared `length: 83`. Each field's `Encoding` is checked against its Loup type. `customerId` declared as `int64` with `Encoding.Zoned` is valid; declared as `string` with `Encoding.Zoned` would be `E_INTERCHANGE_TYPE_MISMATCH`. The `balance` field uses `sign: Signed` because `Encoding.Comp3` carries its sign in a nibble of the rightmost byte (§4-2.4) and does not support overpunch or separate-sign forms.

### §4-2.3 The `@field` Annotation

`@field` is a field-level annotation. It declares the byte-level encoding of a single field within an `@interchange` type (struct or class).

**Parameters.**

```loup
@field(
    offset:    int?         = None,
    len:       int,
    encoding:  Encoding?    = None,
    charset:   Charset?     = None,
    scale:     int          = 0,
    sign:      Sign         = Unsigned,
    padding:   Padding      = Default,
    justify:   Justify      = Default,
    count:     int?         = None,
    countFrom: string?      = None,
    redefines: string?      = None,
    bitOffset: int?         = None,
    bits:      int?         = None,
    element:   Encoding?    = None,    # Encoding.Array fields only — see §4-2.4
    shape:     list[int]?   = None,    # Encoding.Array fields only — see §4-2.4
    order:     Order?       = None,    # Encoding.Array fields only — defaults to RowMajor
)
```

| Parameter | Type | Default | Meaning |
|---|---|---|---|
| `offset` | `int?` | auto | Byte offset from start of record. When omitted, the compiler places the field immediately after its predecessor. Required for `redefines:` and for fields that intentionally leave a gap from the prior field. |
| `len` | `int?` | (see below) | Field length in bytes. For non-array fields, the on-the-wire length of the single value. For `count:` (fixed array) and `countFrom:` (variable array) fields, the per-element length; total bytes is `len * count` or `len * runtimeCount`. Required for all encodings except `Encoding.Nested`, where it may be omitted (the nested type's `byteLength()` is used); when present on `Nested`, it must equal the nested type's declared `length:`. |
| `encoding` | `Encoding?` | inferred | Byte encoding. When omitted, inferred from the field's Loup type per §4-2.4. Explicit declaration is required when the inference is ambiguous (e.g., an `int64` field that could be either `Binary` or `Zoned`). |
| `charset` | `Charset?` | inherit | Character set for `Text` and `Zoned` encodings. When omitted, inherits from the containing type's `@interchange(charset:)`. |
| `scale` | `int` | 0 | Number of implied decimal places for `Zoned`, `Comp3`, and `Binary` integer encodings used to represent fixed-point decimal values. The field's Loup type must be `decimal(p, s)` with `s == scale`, or an integer type. |
| `sign` | `Sign` | `Unsigned` | Sign representation. Encoding-specific; see §4-2.6. |
| `padding` | `Padding` | `Default` | Padding byte for short text fields. `Default` resolves to `Space` for `Text`, `Zero` for numeric encodings. |
| `justify` | `Justify` | `Default` | Direction of justification within the field. `Default` resolves to `Left` for `Text`, `Right` for numeric encodings. |
| `count` | `int?` | None | Fixed array length (OCCURS n TIMES). See §4-2.7. |
| `countFrom` | `string?` | None | Variable-length array driven by another field (OCCURS DEPENDING ON). See §4-2.7. |
| `redefines` | `string?` | None | Name of a previously-declared field whose bytes this field overlays. See §4-2.8. |
| `bitOffset` | `int?` | None | Bit offset (from start of record) for a bit-level field. Mutually exclusive with `offset:`. See §4-2.9. |
| `bits` | `int?` | None | Bit-level field length. Mutually exclusive with `len:`. See §4-2.9. |
| `element` | `Encoding?` | None | (Array fields only.) Per-element encoding when `encoding:` is `Array`. Required for `Encoding.Array`; rejected for any other encoding. See §4-2.4. |
| `shape` | `list[int]?` | None | (Array fields only.) Compile-time-constant list of dimension sizes when `encoding:` is `Array`. List length must equal the field's `array[T, rank]` rank. Required for `Encoding.Array`; rejected for any other encoding. See §4-2.4. |
| `order` | `Order?` | `RowMajor` | (Array fields only.) Storage order for the on-the-wire layout when `encoding:` is `Array`. Permitted only on `Encoding.Array` fields. See §4-2.4. |

**Auto-offset.** When `offset:` is omitted, the field is placed immediately after the preceding field's last byte. Mixing auto-offset and explicit `offset:` declarations is permitted; the compiler computes auto-offsets relative to the most recent explicit anchor.

**Encoding inference.** When `encoding:` is omitted, the compiler infers the encoding from the field's Loup type:

| Loup type | Inferred Encoding |
|---|---|
| `string` | `Text` |
| `bytes` | `Bytes` |
| `bool` | `BoolByte` |
| `int8`/`int16`/`int32`/`int64`/`uint8`/`uint16`/`uint32`/`uint64` | `Binary` |
| `float32` | `Float32` |
| `float64` | `Float64` |
| `complex32` | `Complex32` |
| `complex64`, `complex` | `Complex64` |
| `decimal(p, s)` | `Zoned` (chosen for round-tripping clarity; `Comp3` requires explicit declaration) |
| `array[T, rank]` | `Array` (with `element:` inferred from `T` per the same table, and `shape:` taken from the type if statically known; otherwise both are required as explicit `@field` parameters) |
| Struct or class annotated `@interchange` | `Nested` |

Inference is conservative. When the inference would produce an unintended encoding (e.g., a `int64` field that should encode as zoned decimal rather than binary), explicit declaration is required.

**Type-encoding compatibility matrix.** The full matrix is given in §4-2.4.

### §4-2.4 Encoding Enum

The `Encoding` enum lives in `core.interchange`. Its variants drive code generation for the `pack` and `unpack` methods.

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

**`Text`.** A character string encoded in the field's declared `charset`. Compatible Loup type: `string`. Padding follows `padding:` and `justify:` policies. For ASCII / UTF-8 / Latin-1 charsets, `len:` is in bytes and the string must fit (`InterchangeError.InsufficientCapacity` on pack if it does not). For DBCS charsets, `len:` must be even and the runtime handles shift-out / shift-in marker bytes (`SO` 0x0E, `SI` 0x0F) per §4-2.11.

**`Binary`.** A fixed-width two's-complement (signed) or unsigned integer in the containing type's declared `endianness`. Compatible Loup types: any fixed-width integer (`int8`..`int64`, `uint8`..`uint64`), or `decimal(p, s)` with a declared `scale:`. `len:` must equal `sizeof(T)` for the declared Loup type (`E_INTERCHANGE_BINARY_LEN_MISMATCH`). When `scale:` is declared, the integer is interpreted as a fixed-point decimal value with that many implied decimal places — the Loup field type must be `decimal(p, scale)` with sufficient precision to hold the unscaled integer's range, and `len:` must be wide enough to hold that integer (`E_INTERCHANGE_FIELD_RANGE_EXCEEDS_TYPE` otherwise).

**`Zoned`.** COBOL DISPLAY format — one digit per byte, with the sign embedded per the `sign:` policy. Compatible Loup types: any fixed-width integer or `decimal(p, s)`. `len:` is the number of digit positions; for signed encodings with `LeadingSeparate` or `TrailingSeparate` sign, `len:` includes the sign character byte. The digit bytes are encoded in the field's declared `charset` — for EBCDIC charsets, '0'–'9' are 0xF0–0xF9; for ASCII, 0x30–0x39. Overpunch sign placement (the COBOL default) modifies the zone half of the leading or trailing digit byte to encode sign.

When the Loup field type is `decimal(p, s)`, the field's `scale:` parameter must equal `s`; the encoded digits represent the unscaled integer value (i.e., the decimal value times 10^s). For example, a `decimal(11, 2)` field with `len: 11, scale: 2, sign: TrailingOverpunch` encodes the value 12345.67 as eleven digit bytes representing the integer 1234567 with sign overpunched on the rightmost byte; on unpack, the integer is divided by 100 to recover the decimal value.

**`Comp3`.** Packed BCD format — two decimal digits per byte, with a sign nibble in the low half of the rightmost byte. Compatible Loup types: any fixed-width integer or `decimal(p, s)`. `len:` is in bytes; the number of representable digits is `(len * 2) − 1`. The sign nibble values are 0xC (positive), 0xD (negative), and 0xF (unsigned, alternative — the EBCDIC convention). The field's `sign:` parameter must be one of `Unsigned`, `Signed`, or omitted (`Comp3` does not support separate-sign or overpunch — `E_INTERCHANGE_SIGN_INCOMPATIBLE`).

When the Loup field type is `decimal(p, s)`, the field's `scale:` parameter must equal `s`; the encoded digits represent the unscaled integer value as for `Zoned`. For example, a `decimal(11, 2)` value of 12345.67 encodes in `Comp3` with `len: 6, scale: 2` as six bytes (twelve nibbles) packing the eleven digit nibbles `00001234567` followed by the sign nibble `x`, yielding the byte sequence `00 00 12 34 56 7x`.

**`Decimal128`.** IEEE 754-2019 decimal128 raw 16-byte form. Compatible Loup type: `decimal` (arbitrary-precision) or `decimal(p, s)` with sufficient precision. `len:` must be 16 (`E_INTERCHANGE_DECIMAL128_LEN`). Endianness follows the containing type's declared `endianness`. This encoding is uncommon in legacy formats but appears in some modern financial protocols.

**`Complex32`.** IEEE 754 single-precision complex — two contiguous `float32` values, real part first, imaginary part second, each in the containing type's declared `endianness`. `len:` must be 8. Compatible Loup type: `complex32`. Layout matches the C99 `float _Complex` ABI for FFI.

**`Complex64`.** IEEE 754 double-precision complex — two contiguous `float64` values, real then imaginary, in declared `endianness`. `len:` must be 16. Compatible Loup types: `complex64`, `complex` (alias). Layout matches the C99 `double _Complex` ABI.

**`Array`.** A multi-dimensional array of homogeneous elements with declared shape, element encoding, and storage order. The field type must be `array[T, rank]` (§1-4.10) where `T` is compatible with the array's `element:` encoding. Required parameters: `element:` (an `Encoding` value naming the per-element encoding), `shape:` (a list of integer dimension sizes), `order:` (`Order.RowMajor` or `Order.ColumnMajor`, default `RowMajor`). The total `len:` is computed as `(product of shape) * sizeof(element_encoding)` and must equal the declared `len:` if both are specified (`E_INTERCHANGE_ARRAY_SHAPE_MISMATCH` on mismatch).

The array's `base:` type parameter (§1-4.10) is **not part of the wire format** — the bytes for `array[T, rank, base: 0]` and `array[T, rank, base: 1]` of identical shape and order are byte-identical. Pack/unpack interprets the data through whatever base the field's declared Loup type carries. This means a Fortran-translated module declaring an `@field` of type `array[float, 1, base: 1]` and a C-style module declaring `array[float, 1]` (default base 0) can interchange the same byte stream — each side reads the elements according to its own base convention. There is no `base:` `@field` parameter; base is purely a type-system attribute, never serialized.

```loup
@interchange(endianness: Big, length: 96)
struct Spectrum {
    @field(len: 8, encoding: Float64)
    var frequency: float64;

    @field(len: 88, encoding: Array, element: Float64,
           shape: [11], order: RowMajor)
    var amplitudes: array[float64, 1];
}
```

When the in-memory `array[T, rank]` value's `order` differs from the field's declared `order`, the auto-derived pack/unpack methods perform stride conversion automatically, transposing the bytes during the conversion. This enables a Loup struct using row-major arrays to interoperate with a Fortran-defined wire format using column-major arrays without manual transposition.

`Encoding.Array` supports nested arrays of records: when `element` is itself `Encoding.Nested(T)` for some `@interchange`-annotated type `T`, the array elements are recursively packed and unpacked using `T`'s auto-derived methods. Multi-dimensional arrays of records are supported up to the rank limit (7 dimensions).

The `shape:` parameter must be a compile-time-constant list of non-negative integers. Variable-shape arrays are not supported by `Encoding.Array` directly; for variable-length 1-D arrays, use `Encoding.Nested` with a wrapper struct that has a `count:` or `countFrom:` field on its data member (§4-2.7). Dimension-rank exceeding 7 is `E_INTERCHANGE_ARRAY_RANK_EXCEEDED`. An array element encoding incompatible with the array's element type is `E_INTERCHANGE_ARRAY_ELEMENT_INCOMPATIBLE`.

**`Float32`.** IEEE 754 single-precision binary float. `len:` must be 4. Compatible Loup type: `float32`.

**`Float64`.** IEEE 754 double-precision binary float. `len:` must be 8. Compatible Loup type: `float64`.

**`IbmHexFloat32`.** IBM System/360 hexadecimal floating-point, single-precision (COBOL `COMP-1`). `len:` must be 4. Compatible Loup type: `float32`. The runtime converts to/from IEEE 754 on pack/unpack with the precision loss inherent to the format. Provided for legacy mainframe interop.

**`IbmHexFloat64`.** IBM System/360 hexadecimal floating-point, double-precision (COBOL `COMP-2`). `len:` must be 8. Compatible Loup type: `float64`. Same caveats as `IbmHexFloat32`.

**`BoolByte`.** Single-byte boolean. `len:` must be 1. Compatible Loup type: `bool`. On unpack, a 0x00 byte produces `false` and any non-zero byte produces `true`. On pack, `false` produces 0x00 and `true` produces 0x01.

**`Bytes`.** Pass-through — the bytes of the field appear unchanged in the packed and unpacked forms. Compatible Loup type: `bytes`. Used for opaque payloads, checksums, and reserved regions.

On unpack, exactly `len:` bytes are read into a freshly-allocated `bytes` value of length `len:`. On pack, if the in-memory `bytes` value is shorter than `len:`, the trailing bytes of the field are filled per the field's `padding:` policy (default for `Bytes` is `Null` — 0x00). If the value is longer than `len:`, packing raises `InterchangeError` with kind `InsufficientCapacity`. To write a variable-length opaque payload, use a `countFrom:` companion field (§4-2.7).

**`Nested`.** The field type is itself a struct or class annotated `@interchange`. The nested type's auto-derived `pack` and `unpack` methods are called recursively. `len:` may be omitted; when present, it is verified against the nested type's declared `length:` if that is present.

A `Nested` field whose nested type is itself variable-length (contains a `countFrom:` field) is permitted, but the outer type then becomes variable-length too and inherits the rule of §4-2.7 prohibiting an `@interchange(length:)` declaration. The `byteLength()` instance method walks the nested values to compute the total. A variable-length nested type may be used in a `count:` array, in which case `len:` may not be declared on the outer field (each element's length is determined by the nested instance's runtime content).

**Compatibility matrix.**

| Encoding | Compatible Loup types |
|---|---|
| `Text` | `string` |
| `Binary` | `int8`..`int64`, `uint8`..`uint64`, `decimal(p, s)` (with `scale:`) |
| `Zoned` | `int8`..`int64`, `uint8`..`uint64`, `decimal(p, s)` |
| `Comp3` | `int8`..`int64`, `uint8`..`uint64`, `decimal(p, s)` |
| `Decimal128` | `decimal`, `decimal(p, s)` |
| `Float32` | `float32` |
| `Float64` | `float64` |
| `IbmHexFloat32` | `float32` |
| `IbmHexFloat64` | `float64` |
| `BoolByte` | `bool` |
| `Bytes` | `bytes` |
| `Nested` | any struct or class annotated `@interchange` |
| `Complex32` | `complex32` |
| `Complex64` | `complex64`, `complex` |
| `Array` | `array[T, rank]` (with element encoding compatible to `T`) |

A type-encoding pair not in this table is `E_INTERCHANGE_TYPE_MISMATCH`.

### §4-2.5 Charset Enum

The `Charset` enum lives in `core.interchange`. Its variants identify the character encoding for `Text` and `Zoned` fields.

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

    # Double-byte EBCDIC (DBCS) — see §4-2.11
    Ebcdic930;          # Japanese Katakana-Kanji mixed (CCSID 930)
    Ebcdic939;          # Japanese Latin-Kanji mixed (CCSID 939)
    Ebcdic935;          # Simplified Chinese (CCSID 935)
    Ebcdic937;          # Traditional Chinese (CCSID 937)
    Ebcdic933;          # Korean (CCSID 933)
}
```

**Charset-encoding compatibility.** A `Charset` is valid only on `Encoding.Text` and `Encoding.Zoned` fields. Declaring a charset on any other encoding is `E_INTERCHANGE_CHARSET_INCOMPATIBLE`.

**Default charset.** Fields that omit `charset:` inherit from the containing type's `@interchange(charset:)`. The type-level default is `Utf8`. A type that uses `Encoding.Zoned` without an explicit charset will trigger the `interchange-charset-default` lint advisory (§4-2.14) — zoned decimal is overwhelmingly an EBCDIC convention and the default is almost always wrong for it.

**EBCDIC code page distinctions.** Code pages 037, 1047, 500, and 1140 differ from one another in only a handful of byte positions (notably the square brackets, currency symbols, and a few punctuation marks). These differences are subtle and a frequent source of corruption in mainframe migrations. Every translated copybook should explicitly declare the code page that the source mainframe uses; never rely on defaults.

**Round-tripping.** All single-byte EBCDIC charsets in this enum round-trip through Unicode losslessly — the runtime's encoding tables map every code point in each charset to a unique Unicode scalar value and back. The only exceptions are the DBCS charsets (§4-2.11), where vendor-specific extensions outside the published CCSID may not round-trip; see that section for details.

**Future variants.** Additional code pages may be added in future minor versions. Adding an enum variant is source-compatible provided users do not pattern-match exhaustively against `Charset` in their own code (which is discouraged anyway).

**Mode availability.** All `Charset` variants are valid declarations in any mode where `@interchange` itself is available (§4-2.1). However, EBCDIC SBCS and DBCS conversion at runtime requires the `core.interchange` runtime tables, which are not linked in `@mode(freestanding)`. Programs in freestanding mode that declare an EBCDIC charset emit `E_INTERCHANGE_CHARSET_NOT_AVAILABLE` at compile time; only `Ascii`, `Utf8`, and `Latin1` are usable in freestanding.

### §4-2.6 Endianness, Sign, Padding, and Justification Enums

The auxiliary enums in `core.interchange` parameterize `@interchange` and `@field`. They are ordinary enums that appear as type arguments and method parameters; user code may match against them at runtime for diagnostic purposes.

```loup
namespace core.interchange;

pub enum Endianness {
    Big;        # most significant byte first — mainframe and network default
    Little;     # least significant byte first — typical of x86 / ARM
    Native;     # resolves at compile time to the target platform's native order
}
```

`Endianness.Native` is rare in interchange contexts (the whole point of an interchange format is platform-independent byte order) but is provided for memory-mapped scenarios where the format is consumed only by the producing host. `@interchange(endianness: Native)` produces a non-portable record; the `interchange-native-endianness` lint advisory is emitted at the declaration.

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
```

**Sign-encoding compatibility.**

| Encoding | Valid `Sign` values |
|---|---|
| `Binary` | `Unsigned`, `Signed` |
| `Zoned` | `Unsigned`, `LeadingSeparate`, `TrailingSeparate`, `LeadingOverpunch`, `TrailingOverpunch`, `CrTrailing`, `DbTrailing` |
| `Comp3` | `Unsigned`, `Signed` |
| `Decimal128` | `Signed` (sign is part of the IEEE 754 representation) |
| `Float32`, `Float64`, `IbmHexFloat32`, `IbmHexFloat64` | `Signed` (sign is part of the float representation) |
| `Text`, `BoolByte`, `Bytes`, `Nested` | (sign not applicable) |

A combination not in this table is `E_INTERCHANGE_SIGN_INCOMPATIBLE`.

**Overpunch byte values.** For EBCDIC charsets, the high nibble of an overpunched digit byte changes from 0xF (unsigned digit) to 0xC (positive) or 0xD (negative). For ASCII charsets, overpunch sign uses the upper-nibble convention defined in IBM's "Signed Numerics in Display Format" specification (e.g., '0'–'9' map to 0x30–0x39 unsigned; '{' (0x7B) is +0; 'A'–'I' (0x41–0x49) are +1 to +9; '}' (0x7D) is −0; 'J'–'R' (0x4A–0x52) are −1 to −9). The runtime handles both conventions automatically based on the field's declared charset.

**`CrTrailing` and `DbTrailing` semantics.** Both `CrTrailing` and `DbTrailing` indicate negative values via a trailing two-character suffix; positives carry a two-space suffix. They are alternate notations for the same accounting concept (a negative entry on a debit-natured account ledger), and a particular format will use one or the other but not both. `len:` must include the two-character suffix region.

On pack, a `CrTrailing` field writes "CR" for negative and two spaces for positive; `DbTrailing` writes "DB" for negative and two spaces for positive.

On unpack with `strict: true` (default), a `CrTrailing` field recognizes only "CR" as the negative indicator — a "DB" suffix in the input raises `InterchangeError.InvalidSign`. `DbTrailing` symmetrically recognizes only "DB". This catches format-mismatch bugs at the producer/consumer boundary. With `strict: false`, both suffixes are accepted as negative regardless of the declared variant; this is the lenient mode for ingesting legacy data of inconsistent provenance. In both modes, two trailing spaces always indicate positive, and any other two trailing bytes raise `InterchangeError.InvalidSign`.

```loup
namespace core.interchange;

pub enum Padding {
    Default;       # Space for Text, Zero for numeric, Null for Bytes — encoding-specific
    Space;         # 0x40 in EBCDIC, 0x20 in ASCII/UTF-8
    Zero;          # 0x30 in both EBCDIC and ASCII
    Null;          # 0x00
    Custom(byte: uint8);
}

pub enum Justify {
    Default;       # Left for Text and Bytes, Right for numeric — encoding-specific
    Left;
    Right;
}
```

`Padding.Default` resolves to `Space` for `Text` fields, `Zero` for numeric fields (`Zoned`, `Comp3`, `Binary` with `scale:`), and `Null` for `Bytes` fields. `Justify.Default` resolves to `Left` for `Text` and `Bytes`, `Right` for numeric fields. Explicit declarations override the defaults.

**Padding/justify directionality.** When the encoded content is shorter than the declared `len:`, the placement is determined by `justify:`:

- `justify: Left` — content is written starting at the low-byte (offset 0) end of the field; padding bytes fill from the end of the content to the high-byte end.
- `justify: Right` — padding bytes fill from offset 0 toward the content; the content is written so its last byte coincides with the high-byte end of the field.

The padding byte itself comes from the `padding:` policy. On unpack, padding bytes are stripped per the same direction — left-justified text has trailing padding stripped, right-justified numeric has leading padding stripped.

`Padding.Custom(byte)` is permitted for any encoding but is rarely needed; the standard padding bytes cover almost all real formats.

### §4-2.7 OCCURS — Fixed and Variable Arrays

The `count:` and `countFrom:` parameters declare repeating fields. They are mutually exclusive — a field carrying both is `E_INTERCHANGE_COUNT_CONFLICT`.

**Fixed arrays (`count:`).** `count: n` declares that the field holds exactly `n` consecutive values of the declared type. The Loup field type must be `tuple[T; n]` for a fixed-size array, where `T` is the element type:

```loup
@interchange(charset: Ebcdic1047)
struct WeeklyTotals {
    @field(len: 4, count: 7, encoding: Comp3, scale: 2)
    var dayTotals: tuple[decimal(7, 2); 7];     # 7 × 4 bytes = 28 bytes
}
```

The total field length is `len * count` bytes. The compiler verifies the tuple type's element count matches `count:` (`E_INTERCHANGE_COUNT_TYPE_MISMATCH`).

**Variable arrays (`countFrom:`).** `countFrom: "fieldName"` declares that the field holds a variable number of consecutive values, with the count taken at runtime from the value of the named field. The Loup field type must be `list[T]`:

```loup
@interchange(charset: Ebcdic1047)
struct OrderRecord {
    @field(len: 4, encoding: Binary)
    var lineCount: uint32;

    @field(len: 80, countFrom: "lineCount")
    var lines: list[OrderLine];                  # OrderLine is itself @interchange
}
```

The named field must exist (`E_INTERCHANGE_COUNT_FROM_UNKNOWN`), must be declared earlier in the record (`E_INTERCHANGE_COUNT_FROM_ORDER`), and must have an integer type (`E_INTERCHANGE_COUNT_FROM_TYPE`). The total field length is dynamic — `len * runtimeCount` bytes.

**Variable-length types.** A type containing a `countFrom:` field is itself variable-length. Its `byteLength()` method (§4-2.10) walks the value's runtime contents at every call to compute the total length, rather than returning a constant-folded literal as it does for fixed-length types. Its `length:` parameter on `@interchange` may not be declared (`E_INTERCHANGE_VARIABLE_LENGTH_DECLARED`).

**Nested arrays.** Arrays of arrays are permitted using nested `@interchange` types:

```loup
@interchange
struct Quarter {
    @field(len: 4, count: 13, encoding: Comp3, scale: 2)
    var weeks: tuple[decimal(7, 2); 13];
}

@interchange(length: 208)
struct Year {
    @field(count: 4, encoding: Nested)
    var quarters: tuple[Quarter; 4];             # 4 × 52 bytes = 208 bytes
}
```

**Pack ordering (normative).** `count:` and `countFrom:` arrays are packed contiguously in element index order, with no gap, padding, or framing between elements. For arrays of `Encoding.Nested`, each element contributes exactly its own `byteLength()` bytes; the next element begins at the immediately following byte offset. This rule is recursive — nested arrays-of-arrays expand depth-first in declaration order. The total array byte length is `sum(byteLength(element_i) for i in 0..count)` for variable-length nested types, or simply `len * count` for fixed-length elements.

**Relationship to `Encoding.Array` (v1.20).** OCCURS-style fixed/variable arrays (this section) and `Encoding.Array` (§4-2.4) are distinct mechanisms with different use cases:

- **OCCURS (`count:` / `countFrom:`)** is for *flat sequences* of homogeneous fields — the standard COBOL idiom of repeating a same-shaped record N times. The Loup field type is `tuple[T; n]` (fixed) or `list[T]` (variable). Element packing is fully byte-flat with no shape metadata.
- **`Encoding.Array`** (v1.20) is for *multi-dimensional* arrays where the wire format carries a declared shape and storage order. The Loup field type is `array[T, rank]`. Order conversion (row/column-major) happens automatically.

For 1-D arrays of fixed-shape primitives, both forms can express the same byte layout. Use OCCURS for legacy COBOL records and use `Encoding.Array` for new code, BLAS/LAPACK-style numerical interchange, and translated Fortran unformatted I/O.

### §4-2.8 REDEFINES — Field Overlays

`redefines: "fieldName"` declares that the annotated field shares bytes with a previously-declared field. The two fields occupy the same offset and length but interpret the bytes differently — typical of COBOL records where a single byte region carries multiple alternate views.

```loup
@interchange(charset: Ebcdic1047)
struct PolicyRecord {
    @field(len: 4)
    var recordType: string;                      # "AUTO" or "HOME"

    @field(len: 80)
    var rawPayload: bytes;                       # primary slot

    @field(offset: 4, len: 80, redefines: "rawPayload")
    var autoView: AutoPolicyDetails;             # alternate interpretation

    @field(offset: 4, len: 80, redefines: "rawPayload")
    var homeView: HomePolicyDetails;             # another alternate
}
```

**Compile-time validation.**

1. The `redefines:` target must exist (`E_INTERCHANGE_REDEFINES_UNKNOWN`).
2. The redefining field's `offset:` must equal the target's offset (`E_INTERCHANGE_REDEFINES_SHAPE`).
3. The redefining field's `len:` must equal the target's length (same error code).
4. Multiple fields may redefine the same target; each must independently satisfy the offset/length match.
5. A redefining field's bytes are not counted toward the record's total `length:` — only the primary field is counted.

**Runtime semantics.** All redefining fields and their target reference the same underlying bytes. Reading `autoView` returns the bytes interpreted as `AutoPolicyDetails`; reading `homeView` interprets the same bytes as `HomePolicyDetails`. Writing `autoView` updates the bytes; subsequent reads of `homeView` see the new bytes interpreted as `HomePolicyDetails` (which may produce nonsensical or invalid values — the runtime does not validate alternate interpretations on write).

**Selecting the active overlay.** The language deliberately does not provide a `discriminant:` parameter that would auto-select the active overlay based on another field's value. Real-world discriminators range from "the first 4 bytes of the record" to "byte 17 of the embedded header.subheader struct equals 'X'." Encoding such logic in an annotation conflates layout with business logic and does not generalize. Callers select the active interpretation in normal Loup code, typically by branching on a discriminator field with `match`:

```loup
match record.recordType {
    "AUTO" => processAuto(record.autoView),
    "HOME" => processHome(record.homeView),
    other  => throw UnknownPolicyType(other),
}
```

### §4-2.9 Bit-Level Fields

Bit-level fields are declared with `bitOffset:` and `bits:` instead of `offset:` and `len:`. They are used for protocols that pack flags or small integer values into individual bits — CAN bus messages, MIL-STD-1553 buses, some DICOM elements, ISO 8583 bitmap fields, hardware register maps with packed flag bytes.

```loup
@interchange(endianness: Big)
struct StatusByte {
    @field(bitOffset: 0, bits: 3)
    var priority: uint8;                         # bits 0–2 (high-order in big-endian)

    @field(bitOffset: 3, bits: 1)
    var urgent: bool;                            # bit 3

    @field(bitOffset: 4, bits: 4)
    var reasonCode: uint8;                       # bits 4–7 (low-order)
}
```

**Bit ordering.** Within each byte, bits are numbered MSB-first when `endianness: Big` and LSB-first when `endianness: Little`. `bitOffset: 0` is the most significant bit of the first byte for big-endian, the least significant bit for little-endian. This matches the conventions of major protocol specifications.

**Cross-byte fields.** A bit-level field may span byte boundaries. The runtime emits the appropriate shift/mask sequence; for big-endian, multi-byte bit fields read as a single integer with the bits in reading order. For example, a 12-bit field starting at `bitOffset: 4` of a big-endian record occupies the low 4 bits of byte 0 and all 8 bits of byte 1, read as a 12-bit unsigned integer.

**Compatibility with byte-aligned fields.** Bit-level fields and byte-aligned fields may coexist in the same type, but the boundary between them must be byte-aligned. The compiler verifies that byte-aligned fields begin at a bit offset that is a multiple of 8 and that bit-level regions end at a byte boundary (`E_INTERCHANGE_BIT_ALIGNMENT`).

**`bits:` value range.** `bits:` must be in the range 1..64. Larger bit fields are not supported — use multiple byte-aligned fields or a `Bytes` encoding.

**Loup type compatibility.** Bit-level fields must use unsigned integer types (`uint8`, `uint16`, `uint32`, `uint64`) or `bool`. The unsigned integer must be wide enough to hold `bits:` bits without truncation:

| `bits:` | Required Loup type |
|---|---|
| 1 | `bool` or `uint8` |
| 2..8 | `uint8` (or wider) |
| 9..16 | `uint16` (or wider) |
| 17..32 | `uint32` (or wider) |
| 33..64 | `uint64` |

A type narrower than required is `E_INTERCHANGE_BIT_TYPE_NARROW`.

### §4-2.10 The `Interchange` Interface and Generated Methods

A type annotated `@interchange` automatically implements the `Interchange` interface in `core.interchange`:

```loup
namespace core.interchange;

pub interface Interchange {
    # Length of this specific value's packed representation, in bytes.
    # For fixed-length types, this returns a constant for every instance.
    # For variable-length types (containing a countFrom: field), this
    # returns the runtime-dependent length.
    func byteLength(): int;

    # Static minimum length — the byte count for a value with all
    # variable-length sections empty. For fixed-length types, this
    # equals byteLength() for any instance.
    static func minByteLength(): int;

    # Pack and unpack.
    static func unpack(reads input: bytes): Self;
    static func tryUnpack(reads input: bytes): Result[Self, InterchangeError];
    func pack(): bytes;
    func packInto(edits buf: bytes, offset: int = 0): int;
}
```

The interface is implemented exclusively by compiler-generated code. User types cannot implement `Interchange` manually (`E_INTERCHANGE_INTERFACE_MANUAL_IMPL`); the interface exists so generic code may constrain on it (`func processRecord[T: Interchange](r: T): bytes => r.pack()`).

**`byteLength()`.** Always an instance method. For fixed-length types (no `countFrom:` field), the implementation is a constant-folded literal; the optimizer typically inlines callers to a constant. For variable-length types, the implementation walks the `countFrom:` fields and computes the total at runtime.

**`minByteLength()`.** Static method returning the byte count of the smallest valid packed representation. For fixed-length types, this equals `byteLength()` of any instance. For variable-length types, it is the byte count when every variable-length section has count 0. Used by I/O code to size minimum read buffers.

**`unpack(input)`.** Parses `input` as a value of the implementing type. The input must be exactly `byteLength()` bytes for fixed-length types, or at least the runtime length for variable-length types (extra trailing bytes follow the type's `strict:` policy). Throws `InterchangeError` on any failure: insufficient bytes, invalid digits, unrecognized sign, decimal overflow, charset decode failure, nested-type failure.

**`tryUnpack(input)`.** Same as `unpack` but returns `Result[Self, InterchangeError]` instead of throwing. Use this when parse failures are expected and not exceptional.

**`pack()`.** Serializes the value to a freshly-allocated `bytes` value. The result has length equal to `byteLength()`. Pack failures (a string too long for its field, a decimal that doesn't fit declared scale, a `countFrom:` mismatch) throw `InterchangeError`.

**`packInto(buf, offset)`.** Writes the packed representation into `buf` starting at `offset` and returns the number of bytes written. The buffer must have at least `byteLength()` bytes available starting from `offset` — short buffers produce `InterchangeError.InsufficientCapacity`. This is the high-throughput primitive: a batch job writing 10 million records reuses a single buffer rather than allocating per record. The `edits` verb on the `buf` parameter declares exclusive mutable access for the duration of the call (§3-2.4.9), letting the caller reuse the buffer between calls without aliasing concerns.

**Performance.** The auto-generated code is straight-line byte manipulation with no heap allocation for fixed-length types (apart from the result `bytes` of `pack()` itself). Variable-length types allocate per `list[T]` field. Native-target benchmarks of typical 1KB-class records achieve sub-microsecond pack/unpack latency on modern hardware.

### §4-2.11 DBCS and Multibyte Charset Handling

Double-byte EBCDIC charsets (`Ebcdic930`, `Ebcdic939`, `Ebcdic935`, `Ebcdic937`, `Ebcdic933`) encode each character as two bytes within mixed-content runs delimited by shift-out (`SO`, 0x0E) and shift-in (`SI`, 0x0F) marker bytes. A mixed-content string in a DBCS charset has the structure:

```
[single-byte text] SO [double-byte text] SI [single-byte text] SO [double-byte text] SI ...
```

The `SO` and `SI` markers are part of the byte stream and count toward the field's `len:`. A pure single-byte string has no markers; a pure double-byte string has one `SO` at the start and one `SI` at the end.

**Field length constraints.** A `Text` field with a DBCS charset must declare `len:` such that the field can hold an integral number of characters including the markers. The compiler does not enforce a specific minimum because the marker count depends on the runtime content, but a `len:` that cannot hold any valid encoding (e.g., `len: 1`) is `E_INTERCHANGE_DBCS_LEN_TOO_SMALL`.

**Mixed-mode round-tripping.** The runtime preserves the marker placement of the input on unpack and re-emits markers in the same positions on pack. Round-tripping a string through unpack and then pack produces the identical byte sequence unless the Loup-side string has been modified.

**Vendor-specific extensions.** Some mainframe shops use vendor-specific extensions to the published CCSIDs (notably IBM's User-Defined Characters, UDC). Characters in the UDC range are passed through unchanged byte-for-byte but may not have a defined Unicode mapping. The runtime represents UDC characters as code points in the Basic Multilingual Plane Private Use Area, U+E000–U+F8FF. The mapping is deterministic per CCSID — the same UDC byte sequence in the same charset always produces the same PUA code point. Round-tripping is lossless within Loup but may not interoperate with non-Loup consumers of the Unicode form. The exact per-CCSID PUA assignments are published in the `core.interchange.dbcs` runtime tables.

**`Zoned` encoding with DBCS charsets.** Not supported. Zoned decimal is fundamentally a single-byte-per-digit format. A `Zoned` field with a DBCS `charset` is `E_INTERCHANGE_ZONED_DBCS`.

### §4-2.12 Interaction with §4-1 Serialization

A type may carry both `@interchange` (§4-2) and `Serializable` / `Deserializable` (§4-1) — they describe orthogonal concerns. `@interchange` describes the byte layout of an external format; `Serializable` describes the abstract value structure for §4-1 format drivers (JSON, MessagePack, CBOR, etc.).

```loup
@interchange(charset: Ebcdic1047, length: 83)
class CustomerMaster : Any implements Serializable, Deserializable {
    @field(len: 11, encoding: Zoned, sign: TrailingOverpunch)
    @serialField(name: "customer_id")
    var customerId: int64;
    # ...
}
```

In this configuration, `pack()` produces an EBCDIC byte record matching the mainframe layout, while `serialize[CustomerMaster, JsonFormat](...)` produces a JSON document for an internal API. The two methods consume the same in-memory value but emit independent wire formats.

**Field annotations are independent.** `@field` (§4-2) and `@serialField` / `@sensitive` / `@alias` / `@skipIfDefault` (§4-1) coexist on the same field with no interaction — each annotation system reads only its own annotations.

**`SerializationAdapter` for hybrid scenarios.** A field whose `@interchange` Loup type does not directly implement `Serializable` (e.g., a fixed-precision decimal whose §4-1 representation requires specific scale handling) may use a `SerializationAdapter` (§4-1.3) to bridge. The adapter operates on the in-memory value, not the packed bytes — `@interchange` and §4-1 do not chain through one another.

**No cross-format conversion.** There is no built-in operation that converts `@interchange` packed bytes to a §4-1 format value or vice versa. Such conversions are application-level: unpack with §4-2, then serialize with §4-1, or deserialize with §4-1, then pack with §4-2.

### §4-2.13 Error Codes

**Compile-time errors.**

| Code | Condition |
|---|---|
| `E_INTERCHANGE_NOT_AVAILABLE` | `@interchange` used in `@mode(web.scripted)` |
| `E_INTERCHANGE_FIELD_MISSING` | Field of `@interchange` type has no `@field` annotation |
| `E_INTERCHANGE_LENGTH_MISMATCH` | Sum of field lengths does not equal declared `length:` |
| `E_INTERCHANGE_OVERLAP` | Two non-`redefines` fields occupy overlapping bytes |
| `E_INTERCHANGE_TYPE_MISMATCH` | Field's `Encoding` is not compatible with its Loup type |
| `E_INTERCHANGE_CHARSET_INCOMPATIBLE` | Field declares `charset:` on an encoding that does not use a charset |
| `E_INTERCHANGE_SIGN_INCOMPATIBLE` | Field's `Sign` value is not valid for its `Encoding` |
| `E_INTERCHANGE_FIELD_RANGE_EXCEEDS_TYPE` | Field's declared digit capacity (derived from `len:`, `sign:`, and encoding) exceeds the Loup type's representable range — e.g., `len: 50, encoding: Zoned` on an `int32` would require 50 decimal digits but `int32` represents at most 10 |
| `E_INTERCHANGE_REDEFINES_UNKNOWN` | `redefines:` target field does not exist or is declared after this field |
| `E_INTERCHANGE_REDEFINES_SHAPE` | Redefining field's offset or length differs from target |
| `E_INTERCHANGE_COUNT_CONFLICT` | Field declares both `count:` and `countFrom:` |
| `E_INTERCHANGE_COUNT_FROM_UNKNOWN` | `countFrom:` target field does not exist |
| `E_INTERCHANGE_COUNT_FROM_ORDER` | `countFrom:` target field is declared after this field |
| `E_INTERCHANGE_COUNT_FROM_TYPE` | `countFrom:` target field is not an integer type |
| `E_INTERCHANGE_COUNT_TYPE_MISMATCH` | `count:` does not match the tuple type's element count |
| `E_INTERCHANGE_VARIABLE_LENGTH_DECLARED` | Type contains `countFrom:` field but declares `length:` |
| `E_INTERCHANGE_BINARY_LEN_MISMATCH` | `Binary` encoding `len:` does not equal `sizeof(T)` for the declared Loup type, or for `decimal(p, s)` with `Binary` and `scale:`, the integer width specified by `len:` is insufficient to hold the unscaled value's range |
| `E_INTERCHANGE_DECIMAL128_LEN` | `Decimal128` field `len:` is not 16 |
| `E_INTERCHANGE_BIT_ALIGNMENT` | Byte-aligned field at non-byte-boundary or bit field crossing into byte region |
| `E_INTERCHANGE_BIT_TYPE_NARROW` | Bit field's Loup type is too narrow for declared `bits:` |
| `E_INTERCHANGE_DBCS_LEN_TOO_SMALL` | Text field with DBCS charset has `len:` too small for any valid encoding |
| `E_INTERCHANGE_ZONED_DBCS` | `Zoned` encoding combined with DBCS charset |
| `E_INTERCHANGE_CHARSET_NOT_AVAILABLE` | EBCDIC SBCS or DBCS charset declared in `@mode(freestanding)`, where the runtime conversion tables are not linked. Only `Ascii`, `Utf8`, and `Latin1` are usable in freestanding (§4-2.5) |
| `E_INTERCHANGE_INTERFACE_MANUAL_IMPL` | User code attempts to manually implement `core.interchange.Interchange` (this interface is implementable only by `@interchange`-driven compiler generation) |
| `E_INTERCHANGE_COMPLEX_LEN_MISMATCH` | `Complex32` field `len:` is not 8, or `Complex64` field `len:` is not 16 |
| `E_INTERCHANGE_ARRAY_SHAPE_MISMATCH` | `Array` field `shape:` does not match the field's `array[T, rank]` type's compile-time rank, or the computed array byte size does not match the declared `len:` |
| `E_INTERCHANGE_ARRAY_ELEMENT_INCOMPATIBLE` | `Array` field's `element:` encoding is not compatible with the array's element type `T` per the per-encoding compatibility matrix |
| `E_INTERCHANGE_ARRAY_RANK_EXCEEDED` | `Array` field declares more than 7 dimensions in `shape:` |

**Runtime errors.**

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

`InterchangeError` extends `Exception` (§1-18.1) and is catchable. Its fields are all `pub` and immutable, suitable for diagnostic logging.

**Nested-failure semantics.** When a pack or unpack fails inside a nested type, the runtime constructs an `InterchangeError` at the *outer* type's frame whose `kind` is `NestedFailure(cause:)` and whose `cause` is the inner error. The outer error's fields describe the outer-frame context:

- `recordType` is the outer type name (the struct or class containing the nested field).
- `fieldName` is the name of the outer field of `Encoding.Nested` from which the nested call originated.
- `offset` is the byte offset within the outer record where the nested field begins.

The full causal chain may be walked by traversing `cause` recursively until reaching an `InterchangeErrorKind` other than `NestedFailure`. For deeply nested structures, this produces a stack-like trace from the outermost type down to the innermost field where the actual failure occurred. The chain is finite — a runtime invariant ensures no `cause` cycles.

### §4-2.14 Lint Advisories

**`interchange-charset-default`.** Emitted at the type declaration when an `@interchange` type uses the default `Utf8` charset and at least one field uses `Encoding.Zoned`. Zoned decimal is overwhelmingly an EBCDIC convention; the combination is almost always a missing `charset:` parameter.

**`interchange-gap`.** Emitted at the type declaration when there are unmapped bytes between fields. Gaps are common in legacy formats (reserved regions, padding for hardware DMA alignment) but are also a frequent source of bugs. Promote to error per project with `// loup:error(interchange-gap)`.

**`interchange-redundant-charset`.** Emitted at a `@field` declaration when the field's explicit `charset:` matches the containing type's default. The `charset:` parameter has no effect and may be deleted for clarity.

**`interchange-binary-with-charset`.** Emitted when a `Binary` field declares `charset:`. Charset is meaningless for binary integer encodings; the parameter is ignored.

**`interchange-native-endianness`.** Emitted when an `@interchange` type declares `endianness: Native`. The whole purpose of an interchange format is platform-independent byte order; using `Native` produces a record that is non-portable across architectures. Suppress per declaration with `// loup:allow(interchange-native-endianness)` when the format is genuinely host-local (e.g., an mmap'd cache file consumed only by the producing process).

**`interchange-padding-fixed-width`.** Emitted when a `padding:` parameter appears on a fixed-width binary encoding (`Binary` without `scale:`, `Float32`, `Float64`, `IbmHexFloat32`, `IbmHexFloat64`, `Decimal128`, `BoolByte`). These encodings have no shorter-than-`len:` content and the parameter is silently ignored. Justify is similarly meaningless on these encodings; the same advisory covers `justify:` on fixed-width binary fields.

