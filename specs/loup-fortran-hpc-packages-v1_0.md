# Loup Fortran & HPC Packages Reference v1.0

**Status:** Draft
**Version:** 1.0.0
**Date:** 2026-05-07
**Scope:** First-party packages and tooling for Fortran migration and modern
  high-performance computing (HPC) on Loup. Covers `loup.fortran.fmt`,
  `loup.fortran.kind`, `loup.fortran.array`, `loup.fortran.io`,
  `loup.fortran.intrinsic`, `loup.blas`, `loup.lapack`, `loup.fftw`,
  `loup.scalapack`, `loup.openmp`, `loup.mpi`, `loup.netcdf`, `loup.hdf5`,
  and `loup.fortran` (the Fortran-to-Loup translator), plus the
  `loup analyze --fortran` impact-analysis toolchain command and platform
  guidance for HPC clusters, Linux x86-64 / AArch64 / Power, and Apple
  Silicon scientific workstations.

**Companion documents:**

- [Loup Language Reference v1.20 — Volume 1: Core Language](loup-language-core-v1_20.md) —
  the language primitives this document builds on (`complex32`, `complex64`,
  `array[T, rank]`, IEEE 754 environment, array section expressions)
- [Loup Language Reference v1.20 — Volume 2: Runtime](loup-language-runtime-v1_20.md) —
  including `for concurrent` (§2-1.11) which is the translation target for
  Fortran's `DO CONCURRENT`
- [Loup Standard Library Reference v1.20](loup-stdlib-reference-v1_20.md) —
  including the `core.complex` (§21.9), `core.array` (§21.10), and
  `core.fpenv` (§21.11) namespaces
- [Loup Packages Reference v1.12](loup-packages-reference-v1_12.md) —
  the general first-party package set this document extends
- [Loup COBOL & Mainframe Packages Reference v1.0.1](loup-cobol-mainframe-packages-v1_0_1.md) —
  the parallel reference for legacy enterprise (mainframe) migration,
  organized identically to this document

**Out of scope for v1.0.** Coarrays (Fortran 2008 `image`-based parallelism)
are not included in v1.0 — the design is recognized and reserved as a future
addition. OpenACC, CUDA Fortran, and IBM XL Fortran proprietary extensions are
also out of scope; users with code that depends on those should target the
same accelerator backends through `loup.tensor` (CUDA, ROCm, Metal, WebGPU)
or wait for a later release that addresses these specifically. Cray-specific
extensions (Cray pointers, Cray-specific intrinsics) are not supported.
Fortran 77 fixed-source-form (column 1–6 labels, column 7 continuation) is
supported by the translator but is not a normative target — modernized
free-form Fortran 90+ is the canonical translation source.

---

## Table of Contents

- [§1 Overview and Layered Architecture](#1-overview-and-layered-architecture)
- [§2 The Migration Story (non-normative)](#2-the-migration-story-non-normative)
- [§3 Numeric and Formatting Packages](#3-numeric-and-formatting-packages)
  - [§3.1 `loup.fortran.fmt` — FORMAT Statement Translation](#31-loupfortranfmt--format-statement-translation)
  - [§3.2 `loup.fortran.kind` — KIND Parameters and Type Selection](#32-loupfortrankind--kind-parameters-and-type-selection)
- [§4 Array and I/O Packages](#4-array-and-io-packages)
  - [§4.1 `loup.fortran.array` — Multi-Dimensional Array Helpers](#41-loupfortranarray--multi-dimensional-array-helpers)
  - [§4.2 `loup.fortran.io` — Fortran-Style I/O](#42-loupfortranio--fortran-style-io)
- [§5 Fortran Intrinsics](#5-fortran-intrinsics)
  - [§5.1 `loup.fortran.intrinsic` — Built-In Procedure Translation](#51-loupfortranintrinsic--built-in-procedure-translation)
- [§6 Numerical Linear Algebra](#6-numerical-linear-algebra)
  - [§6.1 `loup.blas` — Basic Linear Algebra Subprograms](#61-loupblas--basic-linear-algebra-subprograms)
  - [§6.2 `loup.lapack` — LAPACK Bindings](#62-louplapack--lapack-bindings)
  - [§6.3 `loup.fftw` — FFTW Bindings](#63-loupfftw--fftw-bindings)
  - [§6.4 `loup.scalapack` — Distributed Linear Algebra](#64-loupscalapack--distributed-linear-algebra)
- [§7 Parallel Programming](#7-parallel-programming)
  - [§7.1 `loup.openmp` — OpenMP-Style Parallelism](#71-loupopenmp--openmp-style-parallelism)
  - [§7.2 `loup.mpi` — MPI Bindings](#72-loupmpi--mpi-bindings)
- [§8 Scientific Data Formats](#8-scientific-data-formats)
  - [§8.1 `loup.netcdf` — netCDF Bindings](#81-loupnetcdf--netcdf-bindings)
  - [§8.2 `loup.hdf5` — HDF5 Bindings](#82-louphdf5--hdf5-bindings)
- [§9 Translation and Analysis Tooling](#9-translation-and-analysis-tooling)
  - [§9.1 `loup.fortran` — Fortran→Loup Translator](#91-loupfortran--fortranloup-translator)
  - [§9.2 `loup analyze --fortran` — Impact Analysis](#92-loup-analyze---fortran--impact-analysis)
- [§10 Platform Targets](#10-platform-targets)
  - [§10.1 HPC Clusters and SLURM](#101-hpc-clusters-and-slurm)
  - [§10.2 Linux x86-64 / AArch64 / Power](#102-linux-x86-64--aarch64--power)
  - [§10.3 Apple Silicon Workstations](#103-apple-silicon-workstations)
  - [§10.4 Out-of-Scope Targets](#104-out-of-scope-targets)
- [§11 Migration Playbook (non-normative)](#11-migration-playbook-non-normative)

---

## §1 Overview and Layered Architecture

This document specifies the first-party Loup packages and tooling that
together provide a high-fidelity migration path from Fortran 77, Fortran 90,
Fortran 95, Fortran 2003, Fortran 2008, and Fortran 2018 (excluding coarrays)
to Loup — and a first-class HPC environment for new code.

The packages are organized in a layered architecture that mirrors the COBOL
mainframe packages (Loup COBOL & Mainframe Packages Reference §1):

| Layer | Purpose | Packages |
|---|---|---|
| **Type / format** | Numeric kinds, format strings, intrinsic functions | `loup.fortran.fmt`, `loup.fortran.kind`, `loup.fortran.intrinsic` |
| **Storage / I/O** | Multi-dim arrays, formatted/unformatted I/O, NAMELIST | `loup.fortran.array`, `loup.fortran.io` |
| **Numerical** | BLAS, LAPACK, FFTW, distributed linear algebra | `loup.blas`, `loup.lapack`, `loup.fftw`, `loup.scalapack` |
| **Parallel** | OpenMP-style work-sharing, MPI message-passing | `loup.openmp`, `loup.mpi` |
| **Data formats** | netCDF, HDF5 | `loup.netcdf`, `loup.hdf5` |
| **Translation** | Source-to-source translator, impact analysis | `loup.fortran`, `loup analyze --fortran` |

Each layer is independently usable; a project translating only computational
kernels (no Fortran-style I/O) needs only `loup.blas` / `loup.lapack`. A
project translating an entire application typically needs the type, storage,
and tooling layers as a baseline plus whichever numerical/parallel/format
layers it consumes.

**Relation to the language primitives.** The packages build on language-level
features that exist explicitly to support Fortran-style code:

- `complex32`, `complex64` (Language Reference §1-4.1.6) — first-class complex
  types with C99 `_Complex` ABI for direct interop with BLAS/LAPACK/FFTW
  complex routines and Fortran's `complex(kind=4)` / `complex(kind=8)`.
- `array[T, rank]` (Language Reference §1-4.10) — multi-dimensional arrays
  with configurable storage order and index base. `Order.ColumnMajor` matches
  Fortran's storage convention; `base: 1` matches Fortran's default 1-based
  indexing.
- Array section expressions (Language Reference §1-5.9) — mirror Fortran's
  array-slice syntax (`a(1:n, :, 2:8:2)`).
- `for concurrent` (Language Reference §2-1.11) — the translation target for
  `DO CONCURRENT`. Compile-time data-race-freedom analysis and pluggable
  execution strategy.
- Floating-point environment (Language Reference §1-4.1.7) — IEEE 754
  rounding modes, exception flags, and signaling NaN access for code that
  depends on `IEEE_ARITHMETIC` and `IEEE_FEATURES` modules.

**Relation to the COBOL packages.** The two domain-specific package suites
(Fortran/HPC and COBOL/mainframe) target legacy-language migration on the
same Loup runtime. They share infrastructure where applicable (e.g., both
benefit from `@interchange` for byte-precise data formats; both use
`core.fpenv` for floating-point control), but their problem domains diverge
substantially: Fortran emphasizes numerical computation, multi-dimensional
arrays, and SPMD parallelism; COBOL emphasizes record processing, decimal
arithmetic, and transactional integrity. The two suites are independently
versioned and released.

**Versioning.** This document corresponds to v1.0 of the Fortran/HPC packages.
Subsequent revisions will track Fortran standard updates and new
HPC-ecosystem dependencies (e.g., new MPI implementations, new HDF5 versions).
Coarrays are reserved for a future v2.0 that introduces the
`image`-based parallelism model.

---

## §2 The Migration Story (non-normative)

A working Fortran 90+ program is built around three concerns: numerical
correctness (kind parameters, intrinsic semantics, IEEE 754 behavior),
multi-dimensional array manipulation (whole-array operations, slicing, intent
declarations), and parallelism (OpenMP work-sharing, MPI message-passing,
`DO CONCURRENT`). Translating this code to Loup takes each concern in turn.

**Numerical correctness.** Fortran's `KIND` parameters (e.g.,
`real(kind=real64)`, `complex(kind=real32)`) translate to Loup's
fixed-precision primitive types (`float64`, `complex32`). The
`loup.fortran.kind` package provides translation helpers and a
`real(kind: int): Type` reflection function for translated code that
parameterizes types by `KIND`. IEEE 754 environment access (`IEEE_ARITHMETIC`,
`IEEE_FEATURES`) maps to `core.fpenv`. Intrinsic functions (`SIN`, `LOG`,
`MATMUL`, `SUM`, `MAXVAL`, etc.) are provided in `loup.fortran.intrinsic`
with semantics matching the Fortran 2018 standard.

**Multi-dimensional arrays.** Fortran's `dimension(m, n)` declarations
translate to `array[T, 2, order: ColumnMajor, base: 1]`. Whole-array
operations (`a = b + c`) translate directly using Loup's element-wise
operators. `INTENT(IN)` parameters become `borrow` parameters; `INTENT(OUT)`
become out-parameters; `INTENT(INOUT)` become mutable references. The
`loup.fortran.array` package provides Fortran-specific helpers:
multi-dimensional ALLOCATABLE-like dynamic arrays, RESHAPE/PACK/UNPACK with
Fortran's column-major semantics, and array constructors with the
`(/.../) ` and `[...]` syntactic mappings handled by the translator.

**Parallelism.** OpenMP `!$OMP PARALLEL DO` translates to either `for
concurrent` (when the loop is data-parallel and the compiler can verify it)
or to `loup.openmp.parallelDo` (when explicit OpenMP semantics — schedule
clauses, REDUCTION, FIRSTPRIVATE — are needed). MPI calls (`MPI_INIT`,
`MPI_SEND`, `MPI_REDUCE`, ...) translate one-to-one to `loup.mpi`
equivalents. Pure functions called inside `for concurrent` benefit from the
language's `Sendable`-capture analysis and run safely in parallel.

**A small example.** A Fortran routine computing a daxpy (double-precision
ax-plus-y):

```fortran
subroutine daxpy(n, alpha, x, y)
  integer,  intent(in)    :: n
  real(8),  intent(in)    :: alpha
  real(8),  intent(in)    :: x(n)
  real(8),  intent(inout) :: y(n)
  integer :: i
  do concurrent (i = 1:n)
    y(i) = alpha * x(i) + y(i)
  end do
end subroutine daxpy
```

translates to Loup as:

```loup
fn daxpy(n: int, alpha: float64,
         x: borrow array[float64, 1, base: 1],
         y: excl borrow array[float64, 1, base: 1]): void {
    for concurrent (let i in 1..=n) {
        y[i] = alpha * x[i] + y[i];
    }
}
```

For optimal performance, dispatching to BLAS:

```loup
import loup.blas;

fn daxpy(n: int, alpha: float64,
         x: borrow array[float64, 1, base: 1],
         y: excl borrow array[float64, 1, base: 1]): void {
    loup.blas.daxpy(n: n, alpha: alpha, x: x, incx: 1, y: y, incy: 1);
}
```

The translator is conservative: it produces correct, idiomatic Loup code that
preserves the original program's semantics. Performance tuning (replacing
hand-written kernels with BLAS calls, choosing parallelism strategies) is
left to the human reviewer.

---

## §3 Numeric and Formatting Packages

### §3.1 `loup.fortran.fmt` — FORMAT Statement Translation

The `loup.fortran.fmt` package provides translation of Fortran format strings
(`'(A10, I5, F8.3, ES12.4)'`) into Loup format expressions. Format strings
are compiled at runtime; the translator generates a one-time `compileFormat`
call per FORMAT statement.

```loup
namespace loup.fortran.fmt;

pub class Format {
    pub let spec: string;       # canonicalized format spec
    pub func write(buf: bytes, values: list[Any]): int;        # returns bytes written
    pub func read (buf: bytes, types: list[Type]): list[Any];  # returns parsed values
}

pub func compileFormat(spec: string): Format;
```

Supported edit descriptors: `Iw`, `Iw.m`, `Fw.d`, `Ew.d`, `ESw.d`, `ENw.d`,
`Gw.d`, `Aw`, `Lw`, `Tn`, `nX`, `n/`, `Bn`, `On`, `Zn`, `Dw.d`. Repeat counts
(e.g., `3F8.3`), grouping (e.g., `(I5, 2F8.2)`), and the colon (`:`) and
dollar-sign (`$`) suppression descriptors are supported. Unsupported:
`BN`/`BZ` (blank-zero handling) toggles, `S`/`SP`/`SS` (sign-suppress)
toggles — the package raises `FormatNotSupported` for these descriptors and
the translator inserts an explicit error site.

Default rounding mode for `F`, `E`, `ES`, `EN`, `D` descriptors follows
`core.fpenv.currentRoundingMode()` at call time, allowing code translated from
`IEEE_ARITHMETIC`-aware Fortran to retain rounding semantics with
`withRounding(mode, func() { fmt.write(...) })`.

| Code | Condition |
|---|---|
| `E_FORMAT_SYNTAX` | Compile-time error: format spec is malformed |
| `E_FORMAT_DESCRIPTOR_UNSUPPORTED` | Compile-time error: descriptor like `BN`/`BZ` not implemented |
| `FormatRuntimeError` | Runtime: value-type mismatch or buffer too small |

### §3.2 `loup.fortran.kind` — KIND Parameters and Type Selection

Fortran's KIND parameters provide a way to select numeric precision
parametrically; `loup.fortran.kind` provides the Loup equivalent:

```loup
namespace loup.fortran.kind;

# Constants matching Fortran's iso_fortran_env standard kinds
pub let int8   : int = 1;    # selected_int_kind(2)
pub let int16  : int = 2;    # selected_int_kind(4)
pub let int32  : int = 4;    # selected_int_kind(9)
pub let int64  : int = 8;    # selected_int_kind(18)

pub let real32 : int = 4;    # selected_real_kind(6, 37)
pub let real64 : int = 8;    # selected_real_kind(15, 307)

# Compile-time Type selection given a kind value
pub func intType[K: int]: Type;        # K=1 -> int8, K=4 -> int32, K=8 -> int64
pub func realType[K: int]: Type;       # K=4 -> float32, K=8 -> float64
pub func complexType[K: int]: Type;    # K=4 -> complex32, K=8 -> complex64

# `selected_int_kind(R)` and `selected_real_kind(P, R)` analogues
pub func selectedIntKind(decimalDigits: int): int;
pub func selectedRealKind(precision: int, range: int = 0): int;
```

The compile-time type-selection functions (`intType[K]`, `realType[K]`,
`complexType[K]`) require `K` to be a literal integer or
compile-time-evaluable expression; the translator emits these forms when
translating Fortran code that uses KIND parameters in declarations. Runtime
KIND queries return the integer value corresponding to the type's storage
size.

`iso_c_binding` constants (`C_INT`, `C_FLOAT`, `C_DOUBLE_COMPLEX`, etc.) are
provided as additional `int` constants and the `cType[K]` selector covers
the C-interoperable subset.

---

## §4 Array and I/O Packages

### §4.1 `loup.fortran.array` — Multi-Dimensional Array Helpers

While `array[T, rank]` (Language Reference §1-4.10) and `core.array`
(§21.10) provide the foundation, Fortran-style code uses several conventions
that benefit from dedicated helpers:

```loup
namespace loup.fortran.array;
import core.array as ca;

# Allocatable arrays (Fortran ALLOCATABLE) — in Loup these are simply heap
# arrays whose construction is deferred. The helper provides a deferred-
# construction handle whose .allocate(shape:) materializes the array.

pub class Allocatable[T, rank: int,
                      order: ca.Order = ca.Order.ColumnMajor,
                      base:  int       = 1] {
    pub func isAllocated(): bool;
    pub func allocate(shape: list[int]): void;
    pub func deallocate(): void;
    pub func get(): array[T, rank, order: order, base: base];   # fault if not allocated
}

# RESHAPE — Fortran's reshape() with column-major source/destination
pub func reshape[T, rank1: int, rank2: int](
    source: array[T, rank1],
    shape:  list[int],
    pad:    array[T, 1]? = None,                  # values to pad with if source too small
    order:  list[int]? = None,                    # permutation of dimensions
): array[T, rank2];

# PACK — gather elements where MASK is true into a 1-D array
pub func pack[T, rank: int](
    source: array[T, rank],
    mask:   array[bool, rank],
): array[T, 1];

# UNPACK — scatter a 1-D array into a multi-dim array at MASK positions
pub func unpack[T, rank: int](
    source: array[T, 1],
    mask:   array[bool, rank],
    field:  array[T, rank],                       # background values
): array[T, rank];

# SPREAD — broadcast a (rank-1)-D array along a new axis
pub func spread[T, rank: int](
    source: array[T, rank-1],
    axis:   int,
    copies: int,
): array[T, rank];

# CSHIFT, EOSHIFT — circular and end-off shifts
pub func cshift[T, rank: int](source: array[T, rank], shift: int, axis: int = 1): array[T, rank];
pub func eoshift[T, rank: int](source: array[T, rank], shift: int, boundary: T, axis: int = 1): array[T, rank];

# MAXLOC, MINLOC — index of extreme value (1-based for Fortran compatibility)
pub func maxloc[T: Comparable[T], rank: int](a: array[T, rank], dim: int? = None): list[int];
pub func minloc[T: Comparable[T], rank: int](a: array[T, rank], dim: int? = None): list[int];
```

The helpers preserve Fortran's 1-based indexing convention by default
(`MAXLOC`/`MINLOC` return 1-based indices). Functions accept arrays with
either base (`0` or `1`) but document the result-base convention explicitly.

### §4.2 `loup.fortran.io` — Fortran-Style I/O

Fortran I/O (formatted, list-directed, NAMELIST, unformatted, sequential and
direct access) is provided as a dedicated package:

```loup
namespace loup.fortran.io;
import core.fpenv;
import loup.fortran.fmt as fmt;

# Unit-based I/O (Fortran's UNIT= concept)
pub class Unit {
    pub let path:        string;
    pub let access:      AccessMode;          # Sequential | Direct | Stream
    pub let form:        Form;                # Formatted | Unformatted | NamelistDirected
    pub let position:    Position;            # Asis | Rewind | Append
    pub let recordLength: int?;               # for direct access, in bytes

    pub func open(...): Unit;
    pub func close(): void;
    pub func rewind(): void;
    pub func backspace(): void;
    pub func endfile(): void;
    pub func inquire(): UnitStatus;
}

pub enum AccessMode { Sequential; Direct; Stream; }
pub enum Form       { Formatted; Unformatted; NamelistDirected; }
pub enum Position   { Asis; Rewind; Append; }

# READ statement
pub func readFormatted(u: Unit, format: fmt.Format, types: list[Type]): list[Any];
pub func readListDirected(u: Unit, types: list[Type]): list[Any];
pub func readUnformatted[T](u: Unit): T;       # T must be @interchange-annotated
pub func readNamelist(u: Unit, name: string): NamelistGroup;

# WRITE statement
pub func writeFormatted(u: Unit, format: fmt.Format, values: list[Any]): void;
pub func writeListDirected(u: Unit, values: list[Any]): void;
pub func writeUnformatted[T](u: Unit, value: T): void;
pub func writeNamelist(u: Unit, name: string, group: NamelistGroup): void;

# NAMELIST groups — variable-name-keyed mapping
pub class NamelistGroup {
    pub func get(name: string, type: Type): Any;
    pub func set(name: string, value: Any): void;
}
```

**Unformatted file layout.** Fortran unformatted sequential records use a
record-length prefix and suffix (typically 4-byte; some compilers use 8-byte
for large records). The package supports both layouts and detects on `open`
whether the file uses 4- or 8-byte length markers via the `convert:` parameter
(matching Intel and gfortran's `convert='big_endian'`-style conventions).
Endianness conversion is supported via `core.interchange.Endianness` and
`@interchange`-annotated record types.

**NAMELIST.** The Fortran NAMELIST format (named groups with `&groupname` /
`&end` delimiters, comma-separated `var=value` assignments, supporting
multi-dim array initializers like `arr(1:3) = 1, 2, 3`) is parsed and emitted
faithfully. The `NamelistGroup` class provides programmatic access to group
contents.

| Code | Condition |
|---|---|
| `E_FORTRAN_IO_RECORD_LENGTH_MISMATCH` | Direct-access read where requested record number's length does not match `recordLength:` |
| `E_FORTRAN_IO_FORMAT_TYPE_MISMATCH` | Format-type mismatch (e.g., `I` descriptor for a `real` value) |
| `E_FORTRAN_IO_NAMELIST_PARSE` | Namelist file does not parse |
| `E_FORTRAN_EQUIVALENCE_UNSUPPORTED` | Fortran `EQUIVALENCE` declaration encountered where the storage-layout intent is not expressible as an `@interchange` REDEFINES (e.g., overlapping records of incompatible alignment) |
| `FortranIoEndOfFile` | Runtime: read past end of file (Fortran `END=` branch) |
| `FortranIoError` | Runtime: I/O error (Fortran `ERR=` branch); subclasses for record-format errors |

---

## §5 Fortran Intrinsics

### §5.1 `loup.fortran.intrinsic` — Built-In Procedure Translation

This package provides Loup equivalents for Fortran 2018's standard intrinsic
procedures. Where the procedure exists in `core` or `core.array` already
(e.g., `SUM`, `MATMUL`), `loup.fortran.intrinsic` provides a thin wrapper
with the Fortran-canonical name and 1-based indexing convention. Where the
procedure is Fortran-specific (e.g., `BIT_SIZE`, `DIGITS`, `TINY`), it is
implemented directly.

Major categories:

- **Numeric query.** `digits(x)`, `epsilon(x)`, `huge(x)`, `tiny(x)`,
  `precision(x)`, `range(x)`, `radix(x)`, `bit_size(i)`. These map to
  `core.fpenv` `Float` trait members for floating-point types and to
  fixed-width integer constants for integer types.

- **Numeric manipulation.** `abs`, `mod`, `modulo`, `floor`, `ceiling`,
  `nint`, `aint`, `anint`, `dim`, `sign`, `max`, `min` — direct mappings.

- **Bitwise.** `iand`, `ior`, `ieor`, `not`, `ishft`, `ishftc`, `ibits`,
  `ibset`, `ibclr`, `btest`, `popcnt`, `poppar`, `leadz`, `trailz`. Loup's
  bitwise operators handle most; this package adds the named-function forms.

- **Mathematical.** `sin`, `cos`, `tan`, `asin`, `acos`, `atan`, `atan2`,
  `sinh`, `cosh`, `tanh`, `asinh`, `acosh`, `atanh`, `exp`, `log`, `log10`,
  `sqrt`, `cbrt`, `hypot`, `gamma`, `log_gamma`, `bessel_j0`, `bessel_j1`,
  `bessel_jn`, `bessel_y0`, `bessel_y1`, `bessel_yn`, `erf`, `erfc`,
  `erfc_scaled`. Complex variants for the family that admits them.

- **Array.** `sum`, `product`, `maxval`, `minval`, `count`, `any`, `all`,
  `dot_product`, `matmul`, `transpose`, `reshape`, `pack`, `unpack`,
  `spread`, `cshift`, `eoshift`, `merge`, `findloc`, `maxloc`, `minloc` —
  thin wrappers around `core.array` and `loup.fortran.array`.

- **Character.** `len`, `len_trim`, `trim`, `adjustl`, `adjustr`, `index`,
  `scan`, `verify`, `repeat`, `lge`, `lgt`, `lle`, `llt`, `iachar`, `ichar`,
  `achar`, `char`. Operate on Loup `string` values.

- **Type/kind inquiry.** `kind(x)`, `selected_int_kind`, `selected_real_kind`,
  `is_iostat_end`, `is_iostat_eor`. Re-exported from `loup.fortran.kind`
  where relevant.

- **Bit-string-as-integer.** `mvbits`, `dshiftl`, `dshiftr`. Direct mappings.

The package's source style is one Fortran intrinsic per Loup function with
matching name and parameter ordering. The translator emits direct calls
(`loup.fortran.intrinsic.matmul(...)` for `MATMUL(...)`); user-facing code
written from scratch typically uses `core.array.matmul` directly.

---

## §6 Numerical Linear Algebra

### §6.1 `loup.blas` — Basic Linear Algebra Subprograms

`loup.blas` provides bindings to a BLAS implementation. Reference, OpenBLAS,
Intel MKL, AOCL, Apple Accelerate, and Arm Performance Libraries are all
supported as backends; selection is via build-time configuration in the
project's `.lppkg`:

```toml
[blas]
backend = "openblas"          # | "mkl" | "accelerate" | "armpl" | "reference"
threading = "openmp"          # | "pthreads" | "sequential"
interface = "lp64"            # | "ilp64"
```

The package surface mirrors the reference BLAS naming convention with type
prefixes (`s` = `float32`, `d` = `float64`, `c` = `complex32`, `z` =
`complex64`):

```loup
namespace loup.blas;

# Level 1 — vector operations
pub func saxpy(n: int, alpha: float32,
               x: borrow array[float32, 1, base: 1], incx: int,
               y: excl borrow array[float32, 1, base: 1], incy: int): void;
pub func daxpy(n: int, alpha: float64,
               x: borrow array[float64, 1, base: 1], incx: int,
               y: excl borrow array[float64, 1, base: 1], incy: int): void;
pub func caxpy(n: int, alpha: complex32, x: ..., y: ...): void;
pub func zaxpy(n: int, alpha: complex64, x: ..., y: ...): void;

# dot, dotc, dotu, nrm2, asum, iamax, iamin, scal, copy, swap, rot, ...

# Level 2 — matrix-vector
pub func dgemv(trans: char, m: int, n: int, alpha: float64,
               a: borrow array[float64, 2, order: ColumnMajor, base: 1], lda: int,
               x: borrow array[float64, 1, base: 1], incx: int,
               beta: float64,
               y: excl borrow array[float64, 1, base: 1], incy: int): void;

# dger, dsymv, dsbmv, dspmv, dtrmv, dtrsv, dtbmv, dtbsv, dtpmv, dtpsv ...

# Level 3 — matrix-matrix
pub func dgemm(transa: char, transb: char,
               m: int, n: int, k: int,
               alpha: float64,
               a: borrow array[float64, 2, order: ColumnMajor, base: 1], lda: int,
               b: borrow array[float64, 2, order: ColumnMajor, base: 1], ldb: int,
               beta: float64,
               c: excl borrow array[float64, 2, order: ColumnMajor, base: 1], ldc: int): void;

# dsymm, dtrmm, dtrsm, dsyrk, dsyr2k ...
```

All functions accept Loup `array[T, rank, order: ColumnMajor, base: 1]`
parameters and pass the underlying buffer to the BLAS library without
copying. Row-major arrays are also accepted but the implementation transposes
the operation conceptually (`dgemm` on row-major inputs computes
`C^T = A^T B^T`-ordered) — this is documented per function.

**Threading.** When a multi-threaded BLAS backend is active and the calling
context uses `for concurrent` or `loup.openmp.parallelDo`, nested parallelism
is set to one thread on the inner level by default to avoid thread
oversubscription. The `loup.blas.setThreads(n)` function explicitly
configures backend threading.

**ILP64 vs LP64.** When `interface = "ilp64"` is selected, all `int`
parameters are `int64`-wide; this matches MKL's ILP64 builds and recent
OpenBLAS. The `int` type alias used by the package surface is set
appropriately at compile time.

### §6.2 `loup.lapack` — LAPACK Bindings

`loup.lapack` provides bindings to the LAPACK driver and computational
routines. Same backend selection as `loup.blas`:

```toml
[lapack]
backend = "openblas"          # OpenBLAS includes LAPACK by default
```

Naming follows the LAPACK convention (type prefix + computation):

```loup
namespace loup.lapack;

# Linear systems
pub func dgesv(n: int, nrhs: int,
               a: excl borrow array[float64, 2, order: ColumnMajor, base: 1], lda: int,
               ipiv: excl borrow array[int32, 1, base: 1],
               b: excl borrow array[float64, 2, order: ColumnMajor, base: 1], ldb: int): int;
#                                                                                      ^- info return

# dgetrf, dgetri, dgetrs, dposv, dpotrf, dpotri, dpotrs, dsysv ...

# Eigenproblems
pub func dgeev(jobvl: char, jobvr: char, n: int,
               a: excl borrow array[float64, 2, order: ColumnMajor, base: 1], lda: int,
               wr: excl borrow array[float64, 1, base: 1],
               wi: excl borrow array[float64, 1, base: 1],
               vl: excl borrow array[float64, 2, order: ColumnMajor, base: 1], ldvl: int,
               vr: excl borrow array[float64, 2, order: ColumnMajor, base: 1], ldvr: int): int;

# dsyevr, dsyevd, dggev ...

# SVD
pub func dgesvd(jobu: char, jobvt: char, m: int, n: int,
                a: excl borrow array[float64, 2, order: ColumnMajor, base: 1], lda: int,
                s: excl borrow array[float64, 1, base: 1],
                u: excl borrow array[float64, 2, order: ColumnMajor, base: 1], ldu: int,
                vt: excl borrow array[float64, 2, order: ColumnMajor, base: 1], ldvt: int): int;

# QR/QL/RQ/LQ
pub func dgeqrf(...): int;
pub func dorgqr(...): int;
# ...
```

Workspace queries (LAPACK convention: pass `LWORK = -1` and inspect the
returned size) are wrapped in Loup-friendly helpers that allocate workspace
internally:

```loup
pub func dgesvdAuto(jobu: char, jobvt: char, ...): (s: array[float64, 1], u: array[float64, 2], vt: array[float64, 2]);
```

These helpers are the recommended entry points for new code; the raw
`dgesvd`-style functions remain for translated code that explicitly manages
workspace.

### §6.3 `loup.fftw` — FFTW Bindings

```loup
namespace loup.fftw;

pub class Plan[T] {
    pub let direction: Direction;
    pub let kind:      Kind;
    pub let shape:     list[int];
    pub func execute(): void;
    pub func destroy(): void;
}

pub enum Direction { Forward; Backward; }
pub enum Kind {
    ComplexToComplex;
    RealToComplex;        # forward only
    ComplexToReal;        # backward only
    RealToReal;           # DCT/DST family
}

# Out-of-place complex 1-D
pub func planDft1d[T: complex32 | complex64](
    inp:       borrow array[T, 1],
    out: excl borrow array[T, 1],
    direction: Direction,
    flags:     PlanFlags = PlanFlags.Estimate,
): Plan[T];

pub func planDft2d[T](inp: ..., out: ..., direction: ..., flags: ...): Plan[T];
pub func planDft3d[T](...): Plan[T];
pub func planDftNd[T](inp: array[T, rank], out: array[T, rank], direction: ..., flags: ...): Plan[T];

# Real-to-complex / complex-to-real
pub func planDftR2c1d(inp: array[float64, 1], out: array[complex64, 1], flags: ...): Plan[complex64];
# ...

pub class PlanFlags {
    pub static let Estimate:   PlanFlags;
    pub static let Measure:    PlanFlags;
    pub static let Patient:    PlanFlags;
    pub static let Exhaustive: PlanFlags;
    pub static let Wisdom:     PlanFlags;        # load saved wisdom
}
```

The package supports FFTW3 and pocketfft as backends. `Plan` objects manage
the underlying FFTW plan handle; planning/destruction must be paired.
Threaded FFTW is accessed via `loup.fftw.setThreads(n)`.

### §6.4 `loup.scalapack` — Distributed Linear Algebra

`loup.scalapack` provides bindings to ScaLAPACK and PBLAS for distributed-
memory linear algebra, layered on top of `loup.mpi`:

```loup
namespace loup.scalapack;
import loup.mpi;

pub class BLACSGrid {
    pub let nprow: int;
    pub let npcol: int;
    pub let myrow: int;
    pub let mycol: int;
    pub let comm:  mpi.Comm;
    pub func gridExit(): void;
}

pub func blacsGridInit(comm: mpi.Comm, order: char, nprow: int, npcol: int): BLACSGrid;

# Distributed matrix descriptor (DESCA convention)
pub class DescA {
    pub let dtype: int;
    pub let ctxt:  int;
    pub let m:     int;
    pub let n:     int;
    pub let mb:    int;
    pub let nb:    int;
    pub let rsrc:  int;
    pub let csrc:  int;
    pub let lld:   int;
}

pub func descinit(m: int, n: int, mb: int, nb: int,
                  rsrc: int, csrc: int, ictxt: int, lld: int): DescA;

# PDGEMM — distributed double-precision matmul
pub func pdgemm(transa: char, transb: char, m: int, n: int, k: int,
                alpha: float64,
                a: array[float64, 2, order: ColumnMajor, base: 1], ia: int, ja: int, desca: DescA,
                b: array[float64, 2, order: ColumnMajor, base: 1], ib: int, jb: int, descb: DescA,
                beta: float64,
                c: excl borrow array[float64, 2, order: ColumnMajor, base: 1], ic: int, jc: int, descc: DescA): void;

# PDGESV, PDGEEV, PDSYEV, PDGESVD ...
```

The package's surface follows the ScaLAPACK reference closely. Higher-level
distributed-array helpers that hide DESCA bookkeeping are provided in a
separate `loup.scalapack.dist` submodule for new code.

---

## §7 Parallel Programming

### §7.1 `loup.openmp` — OpenMP-Style Parallelism

OpenMP provides a directive-based parallelism model that translated Fortran
code depends on extensively. `loup.openmp` implements the runtime semantics
of OpenMP 5.0 (the subset commonly used in Fortran) as Loup function calls
with annotation-based scope:

```loup
namespace loup.openmp;

# Parallel region — body runs on all threads
pub func parallel[T](
    threads: int? = None,         # None means use OMP_NUM_THREADS
    body:    fn(threadNum: int, threadCount: int): T,
): list[T];                       # one result per thread

# Parallel DO (work-sharing). The range argument is typically a literal
# range expression (`0..n`); any Iterable[int] is accepted.
pub func parallelDo(
    range:    Iterable[int],
    schedule: Schedule = Schedule.Static,
    chunk:    int? = None,
    body:     fn(i: int): void,
): void;

pub enum Schedule {
    Static;
    Dynamic;
    Guided;
    Runtime;       # determined by OMP_SCHEDULE
}

# Reductions
pub func parallelDoReduce[T](
    range:    Iterable[int],
    init:     T,
    op:       fn(a: T, b: T): T,
    body:     fn(i: int): T,
): T;

# Sections
pub func sections(blocks: list[fn(): void]): void;

# Critical / atomic
pub func critical[T](name: string?, body: fn(): T): T;
pub func atomic_(body: fn(): void): void;

# Barriers
pub func barrier(): void;

# Thread-private storage
pub class ThreadPrivate[T] {
    pub func init(): T;            # per-thread initializer
    pub func get(): T;
    pub func set(value: T): void;
}

# Locks
pub class Lock {
    pub func acquire(): void;
    pub func release(): void;
    pub func test(): bool;
}
```

The `parallelDo` family integrates with `for concurrent` (Language Reference
§2-1.11): when the loop body has no OpenMP-specific clauses
(REDUCTION/FIRSTPRIVATE/LASTPRIVATE), the translator emits `for concurrent`
directly; when those clauses are present, it emits a `parallelDo` call with
the equivalent semantics. The two are runtime-compatible — they share the
same thread-pool worker layer.

**Bindings to native libgomp/libomp.** When `loup.openmp` is built with the
`native` backend, the package binds to the host's OpenMP runtime
(`libgomp`, `libomp`, or Intel's `libiomp5`). Environment variables
(`OMP_NUM_THREADS`, `OMP_SCHEDULE`, `OMP_PROC_BIND`) are honored. The
`loup.openmp.runtime` module provides programmatic access to the OpenMP
runtime API (`omp_set_num_threads`, `omp_get_max_threads`, etc.).

### §7.2 `loup.mpi` — MPI Bindings

```loup
namespace loup.mpi;

pub class Comm {
    pub func size(): int;
    pub func rank(): int;
    pub func split(color: int, key: int): Comm;
    pub func free(): void;
}

pub let COMM_WORLD: Comm;
pub let COMM_NULL:  Comm;

# Initialization
pub func init(args: list[string]): void;
pub func finalize(): void;
pub func initialized(): bool;
pub func finalized(): bool;

# Point-to-point
pub func send[T](data: borrow T, dest: int, tag: int, comm: Comm): void;
pub func recv[T](source: int, tag: int, comm: Comm): T;
pub func isend[T](data: borrow T, dest: int, tag: int, comm: Comm): Request;
pub func irecv[T](source: int, tag: int, comm: Comm): RequestRecv[T];
pub func sendrecv[T, U](sendData: borrow T, dest: int, sendTag: int,
                        source: int, recvTag: int, comm: Comm): U;

# Collective
pub func barrier(comm: Comm): void;
pub func bcast[T](data: excl borrow T, root: int, comm: Comm): void;
pub func reduce[T](data: borrow T, op: Op[T], root: int, comm: Comm): T;
pub func allreduce[T](data: borrow T, op: Op[T], comm: Comm): T;
pub func gather[T](data: borrow T, root: int, comm: Comm): list[T]?;     # None on non-root
pub func allgather[T](data: borrow T, comm: Comm): list[T];
pub func scatter[T](data: list[T]?, root: int, comm: Comm): T;
pub func alltoall[T](data: list[T], comm: Comm): list[T];

# Reduction operators
pub enum Op[T] { Sum; Prod; Max; Min; LAnd; LOr; LXor; BAnd; BOr; BXor; Custom(reducer: fn(T, T): T); }

# Request handles for non-blocking ops
pub class Request {
    pub func wait(): void;
    pub func test(): bool;
}

pub class RequestRecv[T] {
    pub func wait(): T;
    pub func test(): T?;
}

# Datatype handling — for any T that is @interchange-annotated, MPI uses
# the auto-derived pack/unpack methods to serialize. Trivially-copyable
# types (primitives, structs of primitives) bypass serialization and use
# MPI_BYTE with the type's size directly.
pub func datatypeOf[T](): MpiDatatype;
```

The package supports MPICH, Open MPI, Intel MPI, and Cray MPICH backends.
Selection is per-project:

```toml
[mpi]
backend = "openmpi"            # | "mpich" | "intel-mpi" | "cray-mpich"
launcher = "mpirun"            # | "srun" | "mpiexec"
```

**Hybrid OpenMP+MPI.** The recommended pattern for hybrid parallelism is
MPI between nodes and OpenMP within a node. `loup.openmp.parallelDo` inside
an MPI process uses the local node's threads; the MPI launcher distributes
processes across nodes via `mpirun -n` or SLURM's `srun --ntasks`.

---

## §8 Scientific Data Formats

### §8.1 `loup.netcdf` — netCDF Bindings

```loup
namespace loup.netcdf;

pub class File {
    pub func open(path: string, mode: OpenMode = OpenMode.Read): File;
    pub func create(path: string, format: Format = Format.Netcdf4): File;
    pub func close(): void;

    pub func defineGroup(name: string): Group;
    pub func rootGroup(): Group;
    pub func sync(): void;
}

pub class Group {
    pub func defineDimension(name: string, length: int?): Dimension;     # None = unlimited
    pub func defineVariable[T](name: string, dims: list[Dimension], options: VarOptions): Variable[T];
    pub func defineAttribute(name: string, value: Any): void;
    pub func subgroup(name: string): Group;
    pub func variable[T](name: string): Variable[T];
    pub func dimension(name: string): Dimension;
}

pub class Variable[T] {
    pub func read(start: list[int]?, count: list[int]?): array[T, _];
    pub func write(start: list[int], data: array[T, _]): void;
    pub func attribute(name: string): Any;
    pub func setAttribute(name: string, value: Any): void;
}

pub class Dimension {
    pub let name:   string;
    pub let length: int;
    pub let unlimited: bool;
}

pub enum OpenMode { Read; ReadWrite; }
pub enum Format   { Classic; Classic64; Netcdf4; Netcdf4Classic; }

pub class VarOptions {
    pub let chunkSizes:  list[int]?;
    pub let compression: Compression;     # None | Deflate(level) | Zstandard(level) | ...
    pub let fletcher32:  bool;
    pub let endianness:  Endianness;
    pub let fillValue:   Any?;
}
```

Backed by the netCDF-C library (which itself can be backed by HDF5 or
netCDF-classic depending on file format). Auto-conversion between
`array[T, rank]` and netCDF variables handles dimension order — netCDF stores
data in row-major (C-style) order; arrays declared as `ColumnMajor` are
transposed during read/write, with a lint advisory recommending the user
declare `RowMajor` to avoid the transpose.

### §8.2 `loup.hdf5` — HDF5 Bindings

```loup
namespace loup.hdf5;

pub class File {
    pub func open(path: string, mode: AccessMode = AccessMode.Read): File;
    pub func create(path: string, options: FileOptions = FileOptions.default()): File;
    pub func close(): void;
    pub func root(): Group;
}

pub class Group {
    pub func openGroup(path: string): Group;
    pub func createGroup(name: string): Group;
    pub func openDataset[T](name: string): Dataset[T];
    pub func createDataset[T](name: string, dims: list[int], options: DatasetOptions): Dataset[T];
    pub func attribute(name: string): Attribute;
    pub func setAttribute(name: string, value: Any): void;
}

pub class Dataset[T] {
    pub func read(start: list[int]?, count: list[int]?): array[T, _];
    pub func write(start: list[int], data: array[T, _]): void;
    pub func resize(newDims: list[int]): void;
    pub func space(): Dataspace;
}

pub class Attribute {
    pub func read[T](): T;
    pub func write[T](value: T): void;
}

pub enum AccessMode { Read; ReadWrite; }

pub class DatasetOptions {
    pub let chunkSizes:    list[int]?;
    pub let compression:   Compression;
    pub let shuffleFilter: bool;
    pub let fletcher32:    bool;
    pub let fillValue:     Any?;
    pub let maxDims:       list[int]?;       # for resizable datasets
}
```

Includes parallel HDF5 (PHDF5) integration when `loup.mpi` is also linked:
`loup.hdf5.openParallel(path, mode, comm: mpi.Comm)` opens a dataset with
collective I/O across an MPI communicator. Native compound types
(`@interchange`-annotated structs) round-trip faithfully to HDF5 compound
datatypes.

---

## §9 Translation and Analysis Tooling

### §9.1 `loup.fortran` — Fortran→Loup Translator

The `loup.fortran` package provides a source-to-source translator for
Fortran 77, Fortran 90/95, Fortran 2003, Fortran 2008, and Fortran 2018
(excluding coarrays). It is used as a CLI command:

```
loup fortran translate input.f90 [--output output.loup]
loup fortran translate-project src/ [--output-project loup-src/]
loup fortran check input.f90              # syntax check; emit diagnostics; no output
loup fortran ast    input.f90             # dump parsed AST as JSON
```

The translator's CLI integrates with the `loup analyze` command (see §9.2)
for project-scale analysis prior to translation.

**Translation strategy.** The translator follows a conservative approach:

1. **Lexical and syntactic.** Fixed-form (Fortran 77) and free-form (90+)
   are both parsed. Continuation lines, statement labels, and computed
   `GO TO` statements are normalized to free-form Loup equivalents
   (block-structured control flow with explicit labels where computed gotos
   require dispatch tables).
2. **Type and KIND.** `INTEGER(KIND=K)`, `REAL(KIND=K)`, `COMPLEX(KIND=K)`,
   `LOGICAL(KIND=K)`, `CHARACTER(LEN=N, KIND=K)` map to Loup primitive types
   per `loup.fortran.kind`.
3. **Arrays.** `dimension(m, n)` declarations become
   `array[T, 2, order: ColumnMajor, base: 1]`. ALLOCATABLE arrays use
   `loup.fortran.array.Allocatable`. POINTER arrays are translated to
   nullable `array[T, rank]?` references with explicit `allocate`/`deallocate`
   sites; strict POINTER aliasing (the `=>` association) is preserved with
   borrow lifetimes.
4. **Modules and procedures.** Fortran modules become Loup namespaces.
   `INTENT(IN)` is `borrow` (the parameter is read-only); `INTENT(INOUT)`
   becomes the `edits` ownership verb on the parameter (§3-2.4.9),
   allowing in-place mutation of the caller's value; `INTENT(OUT)` is
   either an explicit return value (the translator rewrites a procedure
   with one OUT parameter to return that value) or, for procedures with
   multiple OUT parameters, a tuple return. The translator picks the
   simpler form when possible. Internal procedures (CONTAINS) become
   nested functions. Generic interfaces become Loup function overloading
   via tagged-trait dispatch.
5. **OpenMP directives.** `!$OMP PARALLEL`, `!$OMP DO`, `!$OMP CRITICAL`,
   etc., translate to `loup.openmp` calls. `DO CONCURRENT` translates to
   `for concurrent` when the body's data dependencies can be statically
   analyzed; otherwise to `loup.openmp.parallelDo` with
   `Schedule.Static`.
6. **I/O statements.** `READ`, `WRITE`, `OPEN`, `CLOSE`, `INQUIRE`,
   `BACKSPACE`, `REWIND`, `ENDFILE` translate to `loup.fortran.io` calls.
   FORMAT statements compile to `loup.fortran.fmt.compileFormat` at module
   initialization.
7. **MPI calls.** `USE mpi` and `USE mpi_f08` modules are recognized; calls
   like `MPI_INIT`, `MPI_SEND`, `MPI_REDUCE` translate to `loup.mpi`
   equivalents.

**Known unsupported features.**

| Feature | Status |
|---|---|
| Coarrays (`SYNC IMAGES`, `[image]`-indexed access, `co_*` intrinsics) | Reserved for v2.0 (out of scope) |
| Cray pointers | Not supported (deprecated even in vendor compilers) |
| OpenACC directives | Out of scope; use `loup.tensor` for accelerators |
| CUDA Fortran (`attributes(device)`, kernel launches) | Out of scope |
| IBM XL Fortran extensions (`@PROCESS` directives, etc.) | Out of scope |
| `COMMON` blocks (deprecated) | Translated to namespace-scope mutable variables; lint warning emitted |
| `EQUIVALENCE` (deprecated) | Translated using `@interchange` REDEFINES when the storage layout matters; otherwise rejected with `E_FORTRAN_EQUIVALENCE_UNSUPPORTED` |
| Implicit typing (`IMPLICIT INTEGER(I-N)`) | Translated faithfully; lint warning recommends `IMPLICIT NONE` |
| Hollerith constants | Translated to byte-string literals; lint warning |

The translator emits warnings for deprecated and ambiguous constructs; the
`--strict` flag promotes warnings to errors.

### §9.2 `loup analyze --fortran` — Impact Analysis

`loup analyze --fortran <project-path>` scans a Fortran codebase and emits
a structured impact analysis report:

- **Procedure call graph.** Cross-referenced from procedure definitions to
  call sites, including module USE chains and INTERFACE declarations.
- **Module dependency graph.** Used for incremental compilation planning
  and for identifying tightly-coupled module clusters that warrant
  group translation.
- **External library usage.** Identifies BLAS/LAPACK/FFTW/MPI/HDF5/netCDF
  call sites, mapping each to its target Loup package equivalent.
- **OpenMP / MPI density.** Reports the parallelization patterns used,
  flagging non-standard or vendor-specific extensions.
- **Translation risk inventory.** Lists unsupported features encountered
  (coarrays, Cray pointers, vendor extensions) with file/line locations.
- **Migration order recommendation.** Suggests a translation order based
  on the dependency graph (leaves first, modules with most dependencies
  last).

Output formats: `--format json` (machine-consumable), `--format text`
(human-readable), `--format html` (browser-renderable report with
interactive call-graph navigation).

---

## §10 Platform Targets

### §10.1 HPC Clusters and SLURM

Loup HPC binaries are deployed via standard cluster job schedulers. SLURM
integration:

- **Job script template** generated by `loup hpc init <project>` produces a
  `submit.sh` with appropriate `#SBATCH` directives and `srun` launcher
  invocation.
- **`loup.mpi`** with `launcher = "srun"` uses SLURM's PMI for process
  bootstrap, which is the recommended path for SLURM-managed MPI jobs.
- **CPU affinity** is honored from SLURM's `CPU_BIND` settings; `loup.openmp`
  picks up these bindings automatically.

PBS, LSF, and Torque schedulers are also supported via the same template
mechanism.

### §10.2 Linux x86-64 / AArch64 / Power

- **x86-64.** The primary HPC target. AVX, AVX2, AVX-512 (foundation,
  byte/word, conflict-detection, vector-bit-manipulation) are accessible
  through `native.simd` (Language Reference §3-3). MKL, OpenBLAS, and Arm
  Performance Libraries (when running through QEMU) are tested.
- **AArch64.** Native target for ARM-based HPC (Apple Silicon, Ampere,
  Graviton, Fujitsu A64FX). NEON and SVE / SVE2 are accessible. ArmPL is the
  recommended BLAS backend.
- **Power.** Linux on Power9 / Power10 is supported; OpenBLAS provides a
  baseline; ESSL (IBM's library) is supported when present.

### §10.3 Apple Silicon Workstations

Apple M-series chips are fully supported as a development and production
target. `loup.blas` defaults to the Accelerate framework backend on macOS,
which provides AMX/SME-tuned BLAS routines. `loup.fftw` uses pocketfft as
the default backend (Accelerate's vDSP is offered via a separate
`loup.accelerate.dsp` package). MPI on Apple Silicon uses Open MPI.

### §10.4 Out-of-Scope Targets

- **Cray Slingshot / Cray-specific extensions.** Out of scope for v1.0.
  Code that uses Cray pointers, Cray-specific `SHMEM`, or DMAPP must be
  translated manually; the translator emits unsupported-feature errors.
- **NEC SX Aurora.** Not supported.
- **Sunway TaihuLight (SW26010)** and other custom HPC architectures. Not
  supported.
- **GPU offloading via OpenACC, CUDA Fortran, or HIP Fortran.** Out of scope
  for v1.0. Users with GPU-targeted code should use `loup.tensor` for new
  accelerated paths or wait for v2.0.

---

## §11 Migration Playbook (non-normative)

A typical Fortran-to-Loup migration follows this phased approach:

**Phase 1 — Inventory and analysis (1–2 weeks for a 100k-LOC codebase).**

1. Run `loup analyze --fortran` on the entire codebase. Inspect the
   risk inventory and resolve unsupported features (replace Cray pointers,
   isolate coarrays for later migration, etc.).
2. Identify the "hot loops" — the inner numerical kernels — using compiler
   profile data or representative workload runs. These will benefit most
   from explicit BLAS/LAPACK dispatch after translation.
3. Audit external library usage. Confirm that Loup packages exist for all
   external dependencies (BLAS, LAPACK, FFTW, MPI, HDF5, netCDF) and that
   the project's chosen backend is compatible.

**Phase 2 — Leaf-module translation (2–4 weeks).**

1. Translate leaf modules (those with no Fortran dependencies) first using
   `loup fortran translate-project`. Run unit tests against a reference
   Fortran build to verify numerical equivalence.
2. Replace identified hot loops with explicit `loup.blas` / `loup.lapack` /
   `loup.fftw` calls where appropriate. Preserve the original Fortran loop
   in a comment for review.
3. Add `@interchange`-annotated structs for any binary file formats the
   code reads or writes (especially unformatted sequential files, which
   have compiler-specific record-length conventions).

**Phase 3 — Application-level translation (4–12 weeks).**

1. Translate progressively up the dependency graph. Re-run unit tests and
   integration tests after each module batch.
2. Convert Fortran-specific I/O (NAMELIST, formatted, list-directed) to
   `loup.fortran.io` calls. For large parameter files that drive scientific
   simulations, consider migrating to TOML or YAML at this stage.
3. Tune parallelism. `for concurrent` is the recommended target for new
   parallel loops; `loup.openmp.parallelDo` covers loops that need explicit
   OpenMP semantics. MPI calls translate one-to-one and rarely need
   manual review.

**Phase 4 — Validation and performance (2–4 weeks).**

1. Run the full validation suite. For code that depends on bit-exact
   reproducibility, verify under fixed `RoundingMode` and compiler
   optimization level. Document any tolerances required.
2. Benchmark against the reference Fortran build. The expected baseline is
   parity (within 5%) for compute-bound code; overhead is typically in I/O
   and small-message MPI patterns.
3. Tune at hot spots. Profile with `loup profile` and apply the same
   techniques as native HPC tuning: vectorization checks, cache-blocking,
   loop fusion, SIMD intrinsics where critical.

**Phase 5 — Modernization (ongoing).**

1. Replace remaining vestiges of Fortran-specific patterns with idiomatic
   Loup: `Allocatable[T, rank]` becomes ordinary `array[T, rank]` once the
   construction is statically locatable; deferred-initialization
   `allocatable` patterns become non-nullable arrays initialized at
   declaration.
2. Adopt `loup.tensor` for compute that benefits from GPU/TPU acceleration.
   Code that already uses `array[T, rank]` migrates to `Tensor` via the
   `Tensor.fromArray(arr)` constructor (and `tensor.toArray[T, rank]()`
   for materialising results back to an eager array) with minimal
   additional refactoring.
3. Adopt the test, build, and packaging tooling. `loup test` integrates with
   common HPC CI workflows; `loup publish` registers internal packages with
   the organization's local registry.

The expected timeline for a 100,000-line Fortran codebase with active
development is 4–6 months from inventory to production deployment, with
two engineers — one for translation and one for validation. Larger codebases
or those with extensive vendor-specific extensions take proportionally
longer; smaller, modern Fortran 2008+ codebases typically complete in
6–10 weeks.

