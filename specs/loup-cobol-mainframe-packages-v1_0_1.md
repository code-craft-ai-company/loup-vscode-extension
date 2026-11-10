# Loup COBOL & Mainframe Packages Reference v1.0.1

**Status:** Draft
**Version:** 1.0.1
**Date:** 2026-05-07
**Scope:** First-party packages and tooling for COBOL migration and mainframe
  modernization on Loup. Covers `loup.pic`, `loup.record`, `loup.vsam.*`,
  `loup.sort`, `loup.batch`, `loup.report`, `loup.date.mainframe`,
  `loup.db.db2`, `loup.mq`, `loup.cics`, `loup.ims`, and `loup.cobol`,
  plus the `loup analyze` impact-analysis toolchain command and platform
  guidance for z/OS Unix System Services and Linux on Z (s390x).

**Changes in v1.0.1:**

- **Cross-reference update.** All references to Language Reference sections
  have been updated from the v1.19 form to the v1.20 volume-prefixed form
  (`§4.1.4.2` → `§1-4.1.4.2`; `§33` → `§4-2`; `§17b` → `§2-2`; etc.).
- **Companion documents.** Now references the four-volume Language Reference
  v1.20, Standard Library Reference v1.20, and Packages Reference v1.12.
- **No semantic changes.** All package APIs, semantics, and behavioral
  contracts are unchanged from v1.0.

**Companion documents:**
- Language Reference v1.20 (four volumes; the language primitives this
  document builds on — `decimal(p, s)`, `@interchange`, `Encoding`,
  `Charset`, `Endianness`, and `Sign` enums, and the `Interchange`
  interface):
  - [Volume 1: Core Language](loup-language-core-v1_20.md)
  - [Volume 2: Runtime](loup-language-runtime-v1_20.md)
  - [Volume 3: Compilation](loup-language-compilation-v1_20.md)
  - [Volume 4: Data Formats](loup-language-data-v1_20.md)
- [Loup Standard Library Reference v1.20](loup-stdlib-reference-v1_20.md) —
  including the `core.numeric` and `core.interchange` namespaces
- [Loup Packages Reference v1.12](loup-packages-reference-v1_12.md) —
  the general first-party package set this document extends

---

## Table of Contents

- [§1 Overview and Layered Architecture](#1-overview-and-layered-architecture)
- [§2 The Migration Story (non-normative)](#2-the-migration-story-non-normative)
- [§3 Numeric and Formatting Packages](#3-numeric-and-formatting-packages)
  - [§3.1 `loup.pic` — PICTURE Clause Formatting](#31-louppic--picture-clause-formatting)
  - [§3.2 `loup.date.mainframe` — Mainframe Date Types](#32-loupdatemainframe--mainframe-date-types)
- [§4 Storage Packages](#4-storage-packages)
  - [§4.1 `loup.record` — Sequential, Relative, and Indexed Files](#41-louprecord--sequential-relative-and-indexed-files)
  - [§4.2 `loup.vsam.local` — VSAM-Compatible Local Storage](#42-loupvsamlocal--vsam-compatible-local-storage)
  - [§4.3 `loup.vsam.zos` — Native z/OS VSAM via FFI](#43-loupvsamzos--native-zos-vsam-via-ffi)
  - [§4.4 `loup.sort` — External Sort and Merge](#44-loupsort--external-sort-and-merge)
- [§5 Batch Processing](#5-batch-processing)
  - [§5.1 `loup.batch` — Checkpoint, Restart, Return Codes, SYSOUT](#51-loupbatch--checkpoint-restart-return-codes-sysout)
- [§6 Reporting](#6-reporting)
  - [§6.1 `loup.report` — Report Writer with Control Breaks](#61-loupreport--report-writer-with-control-breaks)
- [§7 Mainframe Integration](#7-mainframe-integration)
  - [§7.1 `loup.db.db2` — DB2 Connectivity](#71-loupdbdb2--db2-connectivity)
  - [§7.2 `loup.mq` — IBM MQ Client](#72-loupmq--ibm-mq-client)
  - [§7.3 `loup.cics` — CICS Integration](#73-loupcics--cics-integration)
  - [§7.4 `loup.ims` — IMS Connect, DL/I, OTMA](#74-loupims--ims-connect-dli-otma)
- [§8 Translation and Analysis Tooling](#8-translation-and-analysis-tooling)
  - [§8.1 `loup.cobol` — COBOL→Loup Translator](#81-loupcobol--cobolloup-translator)
  - [§8.2 `loup analyze` — Impact Analysis](#82-loup-analyze--impact-analysis)
- [§9 Platform Targets](#9-platform-targets)
  - [§9.1 z/OS Unix System Services](#91-zos-unix-system-services)
  - [§9.2 Linux on Z (s390x)](#92-linux-on-z-s390x)
  - [§9.3 Cross-Development Workflow](#93-cross-development-workflow)
- [§10 Migration Playbook (non-normative)](#10-migration-playbook-non-normative)

---

## §1 Overview and Layered Architecture

This document specifies the first-party packages and tooling that make Loup a credible target for COBOL migration and mainframe modernization. The packages are layered:

```
┌─────────────────────────────────────────────────────────────────┐
│  Translator and analysis tools                                  │
│  (loup.cobol, loup analyze)                                     │
├─────────────────────────────────────────────────────────────────┤
│  Workflow packages                                              │
│  (loup.batch, loup.report, loup.sort)                           │
├─────────────────────────────────────────────────────────────────┤
│  Integration packages                                           │
│  (loup.db.db2, loup.mq, loup.cics, loup.ims, loup.vsam.*)       │
├─────────────────────────────────────────────────────────────────┤
│  Domain primitives                                              │
│  (loup.pic, loup.date.mainframe, loup.record)                   │
├─────────────────────────────────────────────────────────────────┤
│  Language primitives (Language Reference v1.20)                 │
│  (decimal(p, s), @interchange, Encoding, Charset)               │
└─────────────────────────────────────────────────────────────────┘
```

Each layer depends only on layers below it. The bottom is the language reference (v1.20) — `decimal(p, s)`, `@interchange` and `@field` annotations, the `Encoding`, `Charset`, `Endianness`, and `Sign` enums in `core.interchange`, the `Interchange` interface, and the numeric error model. Those are *not* COBOL-specific; they are general type-system and code-generation features used by anyone working with byte-precise external data formats. This document picks up where the language reference leaves off.

**Package naming.** All packages in this document live under the `loup.` namespace and are installed via `loup install` like any other first-party package. They are not built into the runtime. They follow the standard package versioning, ABI stability, and lockfile rules (Language Reference §1-13).

**Availability.** Most packages target `cli`, `service`, and `native` builds on Linux, macOS, and Windows for development and most production deployment. The mainframe-specific subset (`loup.vsam.zos`, `loup.cics`, `loup.ims`) additionally targets z/OS Unix System Services on s390x. The `loup.cobol` translator is a build-time tool and runs anywhere Loup does.

**Maturity classification.** This document marks each package with one of three maturity levels:

- **Stable** — API frozen for the v1.x series; semver guarantees apply.
- **Provisional** — API may change in minor versions based on field experience; suitable for production with awareness.
- **Experimental** — API expected to change; not recommended for production.

---

## §2 The Migration Story (non-normative)

The packages in this document support two distinct customer paths:

**Path A — Modernize with the mainframe.** The customer keeps existing CICS regions, VSAM datasets, and DB2 databases on z/OS. New code is written in Loup on Linux on Z (s390x) or distributed Linux/macOS, calling into the mainframe via `loup.db.db2`, `loup.mq`, `loup.cics` (EXCI client mode), and `loup.ims` (IMS Connect). Existing COBOL is left in place and slowly retired program-by-program. This is the path most large shops want; the language and packages support it fully.

**Path B — Replace the mainframe.** The customer wants to retire the mainframe entirely. Existing COBOL is translated by `loup.cobol`, existing VSAM datasets are migrated to `loup.vsam.local`, existing DB2 schemas migrate to PostgreSQL or another open database, batch jobs migrate to `loup.batch` workflows. This is more ambitious; the packages support most of it, but CICS and IMS hosting are not in scope of this v1.0 document — see §7.3 for the strategic boundary.

Both paths use the same core packages (`loup.pic`, `loup.record`, `loup.batch`, `loup.report`). Path A additionally depends on the integration packages (`loup.db.db2`, `loup.mq`, `loup.cics`, `loup.ims`); Path B additionally depends on `loup.vsam.local` and the translator (`loup.cobol`).

---

## §3 Numeric and Formatting Packages

### §3.1 `loup.pic` — PICTURE Clause Formatting

**Status:** Stable. **Targets:** All.

`loup.pic` provides a formatter for COBOL PICTURE-clause-style display formatting. It exposes a single template fence filter, `pic`, that converts numeric values to strings according to a format string matching COBOL DISPLAY conventions.

```loup
from loup.pic import (pic);

let amount: decimal(11, 2) = -1234567.89d;
let display = i"{$ amount | pic("$$$,$$9.99CR") $}";
#                                "$1,234,567.89CR"
```

**Format string syntax.** The format string follows COBOL editing conventions:

| Symbol | Meaning |
|---|---|
| `9` | Required digit position |
| `Z` | Zero-suppressed digit (replaced with space if leading zero) |
| `*` | Zero-suppressed digit (replaced with `*` if leading zero — check protection) |
| `0` | Literal `0` |
| `.` | Decimal point |
| `,` | Thousands separator |
| `B` | Literal space |
| `$` | Currency symbol; floats with leading-zero suppression when repeated |
| `+` | Sign character; floats when repeated leading; literal trailing |
| `-` | Sign character (only displayed for negative); floats when repeated leading; literal trailing |
| `CR` | Trailing "CR" for negative, two trailing spaces for positive |
| `DB` | Trailing "DB" for negative, two trailing spaces for positive |
| `/` | Literal `/` (for date editing) |

**Direct API.** The filter is sugar for a function call, available directly:

```loup
from loup.pic import (format);

let s = format("$$$,$$9.99CR", amount);   # "$1,234,567.89CR"
```

**Locale-sensitive variants.** `loup.pic` uses ASCII period and comma by default. For European-style formatting (period as thousands separator, comma as decimal), pass a `Locale` value:

```loup
from loup.pic import (format, Locale);

let s = format("ZZ.ZZZ.ZZ9,99", amount, locale: Locale.European);
#                "1.234.567,89"
```

`Locale` is exposed by `loup.pic` as a self-contained enum:

```loup
namespace loup.pic;

pub enum Locale {
    Default;        # ASCII period decimal, ASCII comma thousands
    European;       # ASCII comma decimal, ASCII period thousands
    Custom { decimalMark: char; thousandsMark: char };
}
```

The package deliberately keeps `Locale` self-contained rather than depending on a wider locale framework — PIC formatting is a narrow domain and the three forms above cover the overwhelming majority of real format strings. Programs that need full locale-aware number, date, and currency handling should use a dedicated locale package (out of scope for v1.0).

**Errors.**

| Error | Condition |
|---|---|
| `PicFormatError` | Format string syntax invalid |
| `PicOverflowError` | Value does not fit declared digit positions |

`PicOverflowError` follows the same `OverflowPolicy` set as `decimal(p, s)` (Language Reference §1-4.1.4.2): the formatter accepts a `policy` parameter (`Trap`, `Saturate`, `TruncateHigh`, `Wrap`) defaulting to `Trap`. The `TruncateHigh` policy matches COBOL's `TRUNCATED` clause behavior — high-order digits exceeding the field's declared digit count are silently dropped.

### §3.2 `loup.date.mainframe` — Mainframe Date Types

**Status:** Stable. **Targets:** All.

`loup.date.mainframe` provides parsers and formatters for the date representations common in mainframe systems.

```loup
from loup.date.mainframe import (Julian, PackedDate, GregorianWindow);
from core.time import (Date);

# Julian: 7-digit zoned ("YYYYDDD") or 4-byte packed BCD
let j1: Julian = Julian.parse("2026119");                    # zoned form
let j2: Julian = Julian.parsePacked(b"\x20\x26\x11\x9F");   # packed form
let d:  Date   = j1.toDate();                                  # 2026-04-29
let back: Julian = Julian.fromDate(d);

# Packed dates: 4-byte BCD with year/month/day
let p: PackedDate = PackedDate.parse(b"\x20\x26\x04\x29");
let d2: Date = p.toDate();

# Gregorian with two-digit year and century window
let win = GregorianWindow.new(pivot: 50);     # years 0-49 → 2000s, 50-99 → 1900s
let d3: Date = win.parse("260429");           # 2026-04-29
let d4: Date = win.parse("980415");           # 1998-04-15
```

**Types.**

```loup
namespace loup.date.mainframe;

pub class Julian : Any {
    pub let year:      int;
    pub let dayOfYear: int;     # 1..366

    # Zoned form: 7-digit string "YYYYDDD"
    pub static func parse(s: string): Julian;
    # Packed form: 4-byte BCD, "YYYY DDD F" with sign nibble 0xF (unsigned)
    pub static func parsePacked(input: bytes): Julian;

    pub static func fromDate(d: Date): Julian;
    pub func toDate(): Date;
    pub func toString(): string;        # "YYYYDDD"
    pub func toBytes(): bytes;          # 4-byte BCD
}

pub class PackedDate : Any {
    pub let year:  int;
    pub let month: int;
    pub let day:   int;

    pub static func parse(input: bytes): PackedDate;     # 4-byte unsigned BCD: YYYYMMDD (8 nibbles, no sign)
    pub static func fromDate(d: Date): PackedDate;
    pub func toDate(): Date;
    pub func toBytes(): bytes;
}

pub class GregorianWindow : Any {
    pub static func new(pivot: int): GregorianWindow;
    #   pivot in 0..99 — years 0..pivot-1 map to current century,
    #   years pivot..99 map to previous century

    pub func parse(s: string): Date;             # accepts YYMMDD or DDMMYY etc.
    pub func format(d: Date, pattern: string): string;
}
```

`Julian` and `PackedDate` integrate directly with `@interchange` — declare a field as `Encoding.Bytes` with `len: 4` for packed dates, or `Encoding.Zoned` with `len: 7` for Julian. The parsers may then be invoked on the unpacked bytes (or on the field's `string` value for the zoned form).

---

## §4 Storage Packages

### §4.1 `loup.record` — Sequential, Relative, and Indexed Files

**Status:** Stable. **Targets:** `cli`, `service`, `native`.

`loup.record` provides a record-oriented file abstraction generalizing the sequential, relative, and indexed (KSDS-style) access patterns. It is the platform-neutral foundation that both `loup.vsam.local` and `loup.vsam.zos` build on.

**Three file types.**

```loup
namespace loup.record;

# Sequential — records read or written in declaration order.
pub class SequentialFile[R: Interchange] : Any {
    pub static async func open(path: string, mode: OpenMode): Result[SequentialFile[R], FileStatus];
    pub async func readNext(): Result[Option[R], FileStatus];
    pub async func write(record: R): Result[void, FileStatus];
    pub async func close(): Result[void, FileStatus];
}

# Relative — records addressable by 1-based ordinal.
pub class RelativeFile[R: Interchange] : Any {
    pub static async func open(path: string, mode: OpenMode): Result[RelativeFile[R], FileStatus];
    pub async func read(ordinal: int): Result[Option[R], FileStatus];
    pub async func write(ordinal: int, record: R): Result[void, FileStatus];
    pub async func delete(ordinal: int): Result[void, FileStatus];
    pub async func close(): Result[void, FileStatus];
}

# Indexed (KSDS-equivalent) — records keyed by a declared key field.
pub class IndexedFile[R: Interchange, K: Comparable[K]] : Any {
    pub static async func open(
        path:    string,
        mode:    OpenMode,
        keyOf:   fn(R): K,
    ): Result[IndexedFile[R, K], FileStatus];

    pub async func read(key: K):       Result[Option[R], FileStatus];
    pub async func write(record: R):   Result[void, FileStatus];
    pub async func rewrite(record: R): Result[void, FileStatus];
    pub async func delete(key: K):     Result[bool, FileStatus];     # Ok(true) if deleted, Ok(false) if not present

    # Cursor — analog of COBOL START followed by READ NEXT.
    pub async func startAt(key: K, mode: StartMode): Result[IndexedCursor[R, K], FileStatus];

    pub async func close(): Result[void, FileStatus];
}

pub class IndexedCursor[R: Interchange, K: Comparable[K]] : Any {
    pub async func readNext():  Result[Option[R], FileStatus];
    pub async func readPrior(): Result[Option[R], FileStatus];
    pub func close(): void;
}

pub enum StartMode {
    Equal;            # KEY EQUAL TO
    Greater;          # KEY GREATER THAN
    GreaterOrEqual;   # KEY NOT LESS THAN (the COBOL idiom)
    Less;             # KEY LESS THAN
    LessOrEqual;      # KEY NOT GREATER THAN
    First;            # start at the first record
    Last;             # start at the last record
}

pub enum OpenMode {
    Input;            # OPEN INPUT — read-only access
    Output;           # OPEN OUTPUT — write-only, file truncated to empty on open
    IO;               # OPEN I-O — read and write; required for REWRITE, DELETE, and record-level locking
    Extend;           # OPEN EXTEND — append-only access; positions at end-of-file
}
```

**The `Interchange` constraint.** The record type parameter `R` must be a `struct` or `class` annotated `@interchange` (Language Reference §4-2). The file abstraction uses the auto-derived `pack` and `unpack` methods (formalized as the `core.interchange.Interchange` interface, §4-2.10) to convert between in-memory values and on-disk bytes. This is the bridge between the language's byte-format declaration and the storage layer.

**Result-bearing API.** Every operation that can fail returns `Result[T, FileStatus]`. The success type `T` is `Option[R]` for reads (None when no record matches), `void` for writes and deletes, and the appropriate handle type for `open` and `startAt`. The error type `FileStatus` is the COBOL-compatible status enum below. This shape gives translated COBOL a clean home for `STATUS` checks and gives idiomatic Loup code the `?` propagation operator (`let r = await file.read(key)?;`).

**File status codes.** Operations that fail return file-status-code-compatible error values:

```loup
pub enum FileStatus {
    Ok;                  # "00"
    EndOfFile;           # "10"
    DuplicateKey;        # "22"
    RecordNotFound;      # "23"
    BoundaryViolation;   # "24"
    PermanentError;      # "30" — generic I/O failure
    DeviceFull;          # "34" — device or volume out of space
    LogicalError;        # "41" — open against already-open file
    InvalidKey;          # "44"
    InvalidLengthRecord; # "45"
    # ... full COBOL file-status mapping
}
```

Translated COBOL preserves its existing status-check patterns by inspecting the `Result.Err(status)` arm; idiomatic Loup code uses `?` propagation to bubble file errors up to a handler.

**Access modes and locking.** `OpenMode.Input`, `Output`, `IO`, and `Extend` map directly to COBOL OPEN modes. Record-level locking is supported in `IO` mode for `IndexedFile`; the lock is held until the next operation on the same file or until commit (when integrated with `loup.batch`).

### §4.2 `loup.vsam.local` — VSAM-Compatible Local Storage

**Status:** Provisional. **Targets:** `cli`, `service`, `native`.

`loup.vsam.local` implements `loup.record`'s `IndexedFile`, `RelativeFile`, and `SequentialFile` interfaces on local storage with VSAM-compatible semantics. It exists for two reasons: it lets translated COBOL run on Linux laptops during migration without z/OS access, and it serves as a permanent target for customers retiring their mainframes.

**Storage backend.** `IndexedFile` uses LMDB (memory-mapped B-tree) for primary key access and additional B-tree indexes for alternate keys. `SequentialFile` uses an append-only log. `RelativeFile` uses a fixed-record store with a sparse free-record bitmap. All three are crash-safe via WAL.

**VSAM cluster compatibility.** `loup.vsam.local` accepts the same cluster-definition vocabulary as IDCAMS:

```loup
from loup.vsam.local import (defineCluster, ClusterSpec, FileType);

await defineCluster(ClusterSpec(
    name:          "PRODFILE",
    fileType:      FileType.Ksds,
    keyOffset:     0,
    keyLength:     11,
    recordSize:    84,
    maxRecordSize: 84,
    shareOptions:  (3, 3),       # (crossRegion, crossSystem) — see below
));
```

`shareOptions` is a `(int, int)` tuple holding the `(crossRegion, crossSystem)` values from IDCAMS DEFINE CLUSTER. Each value is in the range 1–4 with the standard VSAM meaning: 1 = single writer with multiple readers; 2 = single writer with no readers concurrently; 3 = caller-managed integrity; 4 = full read integrity but at higher cost. `(3, 3)` is the most common production choice and matches the default produced by translated IDCAMS scripts. See IBM's *VSAM Demystified* or *DFSMS Access Method Services for Catalogs* for the full table.

Cluster definitions are stored in a SQLite catalog colocated with the data files; the `loup vsam` CLI tool inspects and modifies the catalog (analog of IDCAMS LISTCAT, ALTER, DELETE).

**Alternate index support.** Multiple B-tree indexes per cluster, including PATH (alternate-index → base-cluster lookup):

```loup
await defineAlternateIndex(AlternateIndexSpec(
    name:         "PRODFILE.AIX1",
    base:         "PRODFILE",
    keyOffset:    11,
    keyLength:    30,
    unique:       false,        # duplicates permitted
));
```

**Performance.** LMDB-class storage on commodity SSD outperforms VSAM on most workloads. Single-record reads land in single-digit microseconds; batch sequential reads achieve memory bandwidth.

**Limitations.** `loup.vsam.local` does not implement DFSMStvs (transactional VSAM with two-phase commit across CICS regions) or sysplex-coupling-facility-backed RLS. Customers who require those features must run on z/OS with `loup.vsam.zos` — see §4.3.

### §4.3 `loup.vsam.zos` — Native z/OS VSAM via FFI

**Status:** Provisional. **Targets:** `cli`, `service`, `native` (s390x z/OS only).

`loup.vsam.zos` provides direct access to z/OS VSAM datasets via FFI to the IBM DFSMS / IDCAMS APIs. It implements the same `loup.record` interfaces as `loup.vsam.local` so application code is identical between the two; the deployment-time choice is made by the build target and which VSAM driver the project links.

**Coverage.** KSDS, ESDS, RRDS, LDS access modes. Cluster, alternate index, and PATH management. SHAREOPTIONS, RLS (Record-Level Sharing), DFSMStvs (transactional VSAM), and GDG (Generation Data Group) lifecycle. ICF catalog operations via the `loup.vsam.zos.catalog` sub-namespace.

**FFI surface.** Wraps the z/OS Macro Reference services (DEFINE, ALTER, DELETE, REPRO, EXPORT, IMPORT, PRINT) and the runtime VSAM access methods (GET, PUT, ERASE, ENDREQ, GENCB, MODCB, SHOWCB, TESTCB). The FFI is `extern native` on z/OS (Language Reference §2-3.4); structures passed across the boundary are `@repr(C)`.

**z/OS Unix Services integration.** Programs run as USS processes can access traditional VSAM datasets via the BPXWDYN dynamic-allocation interface. `loup.vsam.zos` invokes BPXWDYN to allocate datasets at file-open time and deallocates at close, eliminating the need for explicit JCL DD statements.

**Catalog integration.** Native ICF catalog access for cluster discovery, GDG generation lookups, and alias resolution:

```loup
from loup.vsam.zos.catalog import (lookup, listGdgGenerations);

let info = await lookup("PROD.MASTER.FILE");
print(info.recordSize);
#   84

let generations = await listGdgGenerations("PROD.WEEKLY.GDG");
#   ["PROD.WEEKLY.GDG.G0042V00", "PROD.WEEKLY.GDG.G0041V00", ...]
```

**Deployment model.** A binary built for z/OS USS s390x links against the LE runtime and SVC services. Cross-builds from Linux/macOS workstations are supported via `loup build --target native --arch s390x --os zos` provided the IBM XL C/C++ toolchain header set is on the build path.

### §4.4 `loup.sort` — External Sort and Merge

**Status:** Stable. **Targets:** `cli`, `service`, `native`.

`loup.sort` provides external sort and merge of record files larger than memory, with multi-key sort criteria, stable-equal handling, and input/output procedure callbacks (the modern equivalent of COBOL SORT INPUT PROCEDURE / OUTPUT PROCEDURE).

```loup
from loup.sort import (sort, SortKey, SortOrder);
from loup.record import (SequentialFile);

await sort(
    input:  inputFile,
    output: outputFile,
    keys: [
        SortKey(extractor: func(r) => r.region, order: SortOrder.Ascending),
        SortKey(extractor: func(r) => r.amount, order: SortOrder.Descending),
    ],
    stable: true,
);
```

**With input procedures.** A generator function feeds records into the sort; an output function consumes sorted records:

```loup
await sort.withProcedures(
    inputProcedure:  async gen func(): Iterable[CustomerRecord] {
        for record in upstream {
            if record.active {
                yield record;
            }
        }
    },
    outputProcedure: async func(record: CustomerRecord): void {
        await downstream.write(record);
    },
    keys: [SortKey(extractor: func(r) => r.customerId, order: SortOrder.Ascending)],
);
```

**Algorithm.** Polyphase merge with run generation via in-memory tournament tree. Memory budget is configurable (default: 256 MiB); records overflowing memory spill to temporary files in OS-default temp directory or a configured spill path.

**Merge.** Pre-sorted inputs may be combined with `merge`:

```loup
await merge(
    inputs: [file1, file2, file3],
    output: combined,
    keys: [SortKey(extractor: func(r) => r.timestamp, order: SortOrder.Ascending)],
);
```

**Performance.** On commodity SSD, sustains 100+ MiB/s record throughput for typical 80–200 byte record widths. CPU is rarely the bottleneck; storage bandwidth dominates.

---

## §5 Batch Processing

### §5.1 `loup.batch` — Checkpoint, Restart, Return Codes, SYSOUT

**Status:** Provisional. **Targets:** `cli`, `service`, `native`.

`loup.batch` provides the patterns expected of long-running batch jobs: checkpoint and restart, return-code conventions matching mainframe practice, SYSOUT capture, and structured job-step composition. It does not parse JCL; instead, it provides a Loup-native job-step API that is straightforward for new code and a reasonable target for translated JCL job streams.

**Checkpoint and restart.**

```loup
from loup.batch import (Checkpoint, BatchJob);

@batchJob(name: "WEEKLY_BILLING", restartFrom: env("RESTART_STEP"))
async func main(): int {
    let cp = Checkpoint.openOrCreate("billing.ckpt");

    await BatchStep("LOAD_ACCOUNTS", checkpoint: cp).run(func() {
        # ... read accounts file
    });

    await BatchStep("APPLY_RATES", checkpoint: cp).run(func() {
        # ... apply rates with periodic cp.commit() calls
    });

    await BatchStep("EMIT_INVOICES", checkpoint: cp).run(func() {
        # ... emit invoices
    });

    return 0;
}
```

`Checkpoint` persists step-level progress to a small file. On restart, `restartFrom` skips successfully-completed steps and resumes within the failed step from its last `cp.commit()` point. This handles the dominant failure mode in batch processing: a mid-job crash where redoing successfully-processed records would corrupt or duplicate output.

**Within-step checkpoints.** Long-running steps commit progress periodically:

```loup
await BatchStep("APPLY_RATES", checkpoint: cp).run(func() {
    let cursor = cp.cursor[int]("apply-rates-position", default: 0);
    let records = await accountsFile.openSequential();
    await records.skip(cursor.value);

    var processed = cursor.value;
    while let acct = await records.readNext() {
        applyRate(acct);
        processed += 1;
        if processed % 1000 == 0 {
            cursor.set(processed);
            await cp.commit();
        }
    }
});
```

**Return codes.** `loup.batch` jobs exit with integer return codes following mainframe conventions: 0 success, 4 warning, 8 error, 12 severe error, 16 catastrophic. Macros provide convenience naming:

```loup
from loup.batch import (RC);

return RC.Success;       # 0
return RC.Warning;       # 4
return RC.Error;         # 8
```

**SYSOUT capture.** Batch jobs route their structured output to named SYSOUT streams instead of stdout/stderr:

```loup
from loup.batch import (sysout);

let auditLog = sysout("AUDITLOG");
await auditLog.writeLine(i"Customer {$ id $} updated at {$ timestamp $}");
```

SYSOUT streams are configured at job-launch time — the runner decides whether each named stream goes to a file, an S3 bucket, a Kafka topic, or stdout. This decouples the application from output destination and matches how mainframe jobs route output via SYSOUT DDs.

**Job orchestration.** Multi-step jobs are composed from `BatchStep` values. A `BatchJob` runner manages step ordering, restart selection, and the parent-process integration (signal handling, exit code propagation, log shipping).

---

## §6 Reporting

### §6.1 `loup.report` — Report Writer with Control Breaks

**Status:** Provisional. **Targets:** `cli`, `service`, `native`.

`loup.report` provides the page-break-aware, control-break-driven, automatic-totaling report generation that COBOL's REPORT SECTION handles natively and that most modern languages do not. It is one of the features most-missed by shops migrating away from COBOL.

```loup
from loup.report import (Report, Group, Detail, Total, Aggregator);
from loup.pic    import (pic);

let report = Report.builder("Sales by Region")
    .pageHeader(func(p) => i"Sales Report — Page {$ p.pageNumber $} of {$ p.totalPages $}")
    .groupBy("region", func(r) => r.region)
        .header(func(g) => i"Region: {$ g.key $}")
        .totalField("amount", aggregator: Aggregator.Sum,   format: "$$,$$$,$$9.99")
        .totalField("count",  aggregator: Aggregator.Count, format: "ZZZ,ZZ9")
        .footer(func(g) => i"Region {$ g.key $} subtotal")
    .groupBy("salesperson", func(r) => r.salesperson)
        .header(func(g) => i"  Salesperson: {$ g.key $}")
    .detail(func(r) =>
        i"    {$ r.transactionId | pic("ZZZZZZZ9") $} {$ r.product $}  {$ r.amount | pic("$$,$$$,$$9.99") $}")
    .grandTotal()
    .build();

await report.run(input: salesData, output: reportFile);
```

**Control breaks.** The `groupBy` clauses define hierarchical breaks. As records flow through, `loup.report` detects when a group key changes and invokes group footers (in reverse hierarchical order) followed by the next set of group headers. The `Aggregator` enum has variants `Sum`, `Count`, `Average`, `Min`, `Max`, and `Custom(reducer:)` for user-supplied folding functions; they accumulate per-group and reset at break boundaries.

**Page management.** Reports emit page headers and footers automatically based on a configurable page length (default 60 lines, accommodating standard 66-line pages with margins). Group headers that would split across a page break are reprinted at the top of the new page with a configurable continuation marker.

**Output formats.** The default output is fixed-width text matching mainframe expectations (132 columns, line printer compatible). Alternative drivers produce HTML, PDF, and CSV from the same report definition.

---

## §7 Mainframe Integration

### §7.1 `loup.db.db2` — DB2 Connectivity

**Status:** Provisional. **Targets:** `cli`, `service`, `native`.

`loup.db.db2` is a `loup.db` driver for IBM DB2 (LUW, z/OS, and i variants). It plugs into the existing `loup.db` query interface (Language Reference Packages §13.8) and adds DB2-specific surface for call attach, subsystem connection, and CICS/IMS integration.

```loup
from loup.db import (Pool);
from loup.db.db2 import (Db2Provider);

let pool = await Pool.connect(
    "db2://hostname:50000/SAMPLE",
    provider: Db2Provider.zos,
    maxSize: 20,
);

let rows = await pool.query(
    "SELECT CUST_ID, BALANCE FROM CUSTOMER WHERE STATUS = ?",
    ["A"],
);
```

**Stored procedures and CALL-equivalent invocation.**

```loup
let result = await pool.callProcedure(
    "PROCESS_PAYMENT",
    inParams:  [paymentId, amount],
    outTypes:  [decimal(15, 2), int32],          # declared return shape
);
let (newBalance, statusCode) = result;
```

**z/OS subsystem attach.** When running on z/OS USS, `Db2Provider.zosAttach(subsystem: "DSNV", plan: "MYPLAN")` connects via the DB2 Call Attachment Facility (CAF) without going through DRDA, matching how CICS and batch programs traditionally attach.

**Decimal mapping.** DB2 `DECIMAL(p, s)` columns map directly to Loup `decimal(p, s)` (Language Reference §1-4.1.4.1) with no runtime conversion. This is one of the larger ergonomic wins over Java migrations, where every `DECIMAL` column becomes a `BigDecimal` that requires manual scale management.

**Bind plans and packages.** `loup.db.db2` does not generate or bind DB2 plans — the application is responsible for plan/package management via DB2 admin tooling. The driver assumes plans are bound at deployment time per standard DB2 practice.

### §7.2 `loup.mq` — IBM MQ Client

**Status:** Provisional. **Targets:** `cli`, `service`, `native`.

`loup.mq` is a client for IBM MQ (formerly MQSeries / WebSphere MQ). It supports the message put/get patterns used by enterprise integration: request/reply, publish/subscribe, persistent and non-persistent messaging, transactional units of work, and cluster connectivity.

```loup
from loup.mq import (QueueManager, MessageDescriptor, PutOptions);

let qm = await QueueManager.connect(
    name:    "QM1",
    channel: "SYSTEM.DEF.SVRCONN",
    host:    "mqhost.corp",
    port:    1414,
);

let queue = await qm.openQueue("PAYMENT.REQUEST.QUEUE", forOutput: true);
await queue.put(
    bytes: paymentRequest.pack(),
    descriptor: MessageDescriptor(
        format:        "MQSTR",
        replyToQueue:  "PAYMENT.REPLY.QUEUE",
        correlationId: corrId,
    ),
);
```

**Receiving and reply patterns.**

```loup
let replyQueue = await qm.openQueue("PAYMENT.REPLY.QUEUE", forInput: true);

let msg = await replyQueue.get(
    matchCorrelationId: corrId,
    timeout: 30.seconds(),
);
let reply = PaymentReply.unpack(msg.bytes);
```

**`@interchange` integration.** Messages whose payload is an `@interchange` struct can be put and got directly, with auto-pack/unpack:

```loup
await queue.putInterchange(paymentRequest, descriptor: ...);
let reply: PaymentReply = await replyQueue.getInterchange(matchCorrelationId: corrId);
```

**Transactions.** MQ messages can participate in syncpoint-coordinated transactions:

```loup
let txn = await qm.beginTransaction();
await queueA.put(msgA, transaction: txn);
await queueB.put(msgB, transaction: txn);
await txn.commit();   # or txn.rollback()
```

**Cluster awareness.** Queue manager clusters are supported transparently — applications connect to a gateway QM and the cluster routing handles destination discovery.

### §7.3 `loup.cics` — CICS Integration

**Status:** Provisional. **Targets:** `cli`, `service`, `native`.

`loup.cics` integrates with CICS Transaction Server. The package implements **Path A** (modernize with CICS) — calling CICS transactions from Loup services and being called by CICS programs. It deliberately does not implement Path B (replacing CICS with Loup-hosted equivalents); see the strategic rationale at the end of this section.

**EXCI client.** External CICS Interface — a Loup service running on z/OS or distributed connects to a CICS region and invokes a transaction:

```loup
from loup.cics.exci import (Region);

let cics = await Region.connect("CICSPROD");

let result = await cics.invoke(
    transaction: "PAYMENT",
    program:     "PAYPROG",
    commarea:    paymentRequest,        # @interchange struct, packed automatically
);

let response: PaymentResponse = result.commareaAs(PaymentResponse);
```

**z/OS Connect.** RESTful and JSON API access to CICS via the z/OS Connect EE gateway:

```loup
from loup.cics.zosconnect import (Gateway);

let gw = Gateway.new(baseUrl: "https://zosconnect.corp/api");
let response = await gw.invoke(
    api:     "payments/v1",
    method:  "POST",
    body:    paymentRequest,            # serialized via §4-1 to JSON
);
```

**3270 protocol library.** A library for parsing and emitting 3270 datastreams, used when integrating with terminal-driven CICS applications that have not been wrapped with a service layer:

```loup
from loup.cics.tn3270 import (Session, Field);

let session = await Session.connect("tn3270host", port: 23);
await session.sendKey(Key.Enter);
let screen = await session.readScreen();
let balance = screen.fieldAt(row: 12, col: 30).text;
```

**BMS map parsing.** A build-time tool that ingests existing BMS map source and emits Loup `@interchange` structs corresponding to the map's fields:

```sh
loup cics import-bms ./CICS.MAPS/PAYMENT.bms --output ./src/maps/
```

The output is normal Loup code; the application uses the generated structs as the `commarea` parameter to `cics.invoke` calls or as the typed view over a 3270 session.

**COMMAREA and channel-container.** Both legacy COMMAREA (single byte buffer up to 32 KB) and modern channel-container (multiple named containers per call) are supported. Channel-container is the preferred path for new code:

```loup
let channel = cics.Channel.new("PAYMENT-CHANNEL");
channel.put("REQUEST", paymentRequest);
channel.put("CUSTOMER", customerInfo);

let result = await cics.invokeChannel(
    transaction: "PAYMENT",
    channel:     channel,
);
let response: PaymentResponse = result.get("RESPONSE");
```

**Strategic boundary — what `loup.cics` does not do.** This package does not host CICS application programs in Loup — there is no `EXEC CICS` binding for Loup code to *be* a CICS program. Translated COBOL that contains `EXEC CICS` calls cannot run natively under Loup on z/OS; it must continue to run under CICS, with Loup services calling into it via EXCI or z/OS Connect.

The reason is strategic, not technical. Building a CICS-compatible hosting environment (file control, BMS rendering, pseudo-conversational state, syncpoint coordination, EXEC CICS verb implementations) is a multi-year effort that competes directly with established commercial products (Heirloup, Micro Focus, GTSoftware) for a customer set that has already been priced into those products. The much larger market is shops that want to *keep* CICS but *stop adding new COBOL* — and that market is fully addressed by the EXCI, z/OS Connect, 3270, and BMS-import surface above.

A future `loup.cics.host` package may provide CICS-compatible hosting if customer demand materializes; it is out of scope for v1.0.

### §7.4 `loup.ims` — IMS Connect, DL/I, OTMA

**Status:** Provisional. **Targets:** `cli`, `service`, `native`.

`loup.ims` provides client access to IMS subsystems. Like `loup.cics`, it implements Path A (integrate with IMS) rather than hosting IMS workloads natively.

**IMS Connect.** TCP/IP gateway to IMS transactions:

```loup
from loup.ims.connect import (Gateway);

let ims = await Gateway.connect(host: "imshost.corp", port: 9999);
let response = await ims.submit(
    datastore:   "IMSPROD",
    transaction: "PAYTRAN",
    payload:     paymentRequest,
);
```

**OTMA (Open Transaction Manager Access).** Direct connection to IMS via XCF for higher-throughput integration, primarily used when the Loup service runs on the same z/OS LPAR as IMS:

```loup
from loup.ims.otma import (Client);

let otma = await Client.connect(xcfGroup: "IMSGRP", member: "MYAPP");
let response = await otma.invoke(transaction: "PAYTRAN", payload: ...);
```

**DL/I database access.** Read access to IMS DB hierarchical databases via DL/I calls:

```loup
from loup.ims.dli import (PsbHandle);

let psb = await PsbHandle.schedule("PSBNAME");
let pcb = psb.pcb("DBPCB01");

let segment = await pcb.gu(
    ssa: "ROOTKEY=K001234",
);
```

DL/I support is provisional and limited — most shops with IMS DB workloads have either migrated to DB2 or are on a multi-decade plan to. New IMS DB applications are rare; this package targets read access for migration tooling and reporting, not transactional writes.

---

## §8 Translation and Analysis Tooling

### §8.1 `loup.cobol` — COBOL→Loup Translator

**Status:** Experimental (alpha). **Targets:** Build-time tool.

`loup.cobol` is the COBOL-to-Loup static translator. It is the single highest-leverage piece of tooling in this entire document — without it, no large COBOL shop will move; with it, the conversation changes from "interesting" to "let's pilot."

**Scope.** ANSI 85 COBOL plus IBM Enterprise COBOL extensions. Specifically:

- All COBOL data types: PIC clauses (DISPLAY, COMP, COMP-3, COMP-1, COMP-2, COMP-4, COMP-5), USAGE, OCCURS (fixed and DEPENDING ON), REDEFINES, group items with arbitrary nesting
- All control structures: PERFORM (THRU, TIMES, UNTIL, VARYING), IF-ELSE, EVALUATE (including TRUE/FALSE forms), GO TO (excluding ALTER)
- File I/O: SEQUENTIAL, RELATIVE, INDEXED OPEN/CLOSE/READ/WRITE/REWRITE/DELETE/START with file status checking
- Arithmetic: COMPUTE, ADD, SUBTRACT, MULTIPLY, DIVIDE with ROUNDED, ON SIZE ERROR, GIVING/REMAINDER
- String handling: STRING, UNSTRING, INSPECT, REFERENCE MODIFICATION
- Module structure: COPY (with REPLACING), CALL (USING BY REFERENCE/CONTENT/VALUE), nested programs
- Embedded SQL: `EXEC SQL ... END-EXEC` blocks (translated to `loup.db.db2` calls)
- Embedded CICS: `EXEC CICS ... END-EXEC` blocks (translated to `loup.cics` client calls — only for Path A migration)

**Out of scope (v1.0).**

- ALTER (the GO TO ALTER pair — these are translated as warnings, requiring manual review)
- USE FOR DEBUGGING (declarative debug sections)
- COBOL/370 SORT verb in-program (translated as a guided rewrite to `loup.sort`)
- Object-oriented COBOL (rare; manual rewrite advised)
- Report Writer SECTION (translated to `loup.report` — preview support)

**Translation philosophy.** The translator emits *idiomatic Loup*, not transliteration. Specifically:

- COBOL group items become `@interchange` structs with `@field` annotations matching the original PIC and USAGE
- PERFORM blocks become regular function calls or inlined blocks, depending on usage
- Working-storage items become `var` bindings in module or function scope as appropriate
- File I/O becomes `loup.record` calls with the same logical control flow but Result-typed return values where the original COBOL relied on file status
- Arithmetic with ROUNDED/ON SIZE ERROR becomes `decimal(p, s, rounding:, overflow:)` declarations or per-operation methods
- `OCCURS n TIMES` clauses translate based on context: working-storage and procedure-division items become `array[T, 1, base: 1]` fields with shape `[n]` (Language Reference §1-4.10), preserving COBOL's 1-based indexing convention; OCCURS items inside group items destined for wire-format I/O (records read from or written to files) become `@field(count: n, ...)` with `tuple[T; n]` type per the OCCURS interchange handling (Vol 4 §4-2.7). Multi-level OCCURS in working-storage become higher-rank arrays (`array[T, 2, base: 1]` for two-level, etc., up to rank 7); multi-level OCCURS in record types nest as `tuple[tuple[T; m]; n]`. `OCCURS n TIMES DEPENDING ON` retains its dynamic length via `loup.record`'s variable-length record handling and the `@field(countFrom: "name")` form (§4-2.7), rather than via `array[T, rank]`'s fixed-shape semantics
- Embedded SQL becomes parameterized `loup.db.db2` queries with explicit binding
- COMMENT lines are preserved adjacent to their corresponding Loup code

**Confidence reporting.** The translator emits a per-program confidence score and per-construct line-level annotations:

```sh
loup cobol translate ./cobol/ --output ./src/ --confidence-report report.json
```

The report flags constructs that need human review: ALTER pairs, ambiguous overlapping REDEFINES, dynamic CALL with computed program names, complex EVALUATE with overlapping conditions, and so on. For typical IBM Enterprise COBOL programs, the translator achieves 80%+ mechanical translation; the remaining 20% is the line-by-line annotated review queue.

**Copybook handling.** `COPY` directives are resolved at translation time and the included text is processed inline. Translated copybooks are emitted as Loup modules with the same name and `pub` visibility, importable from translated programs that referenced them via COPY.

**Round-trip determinism.** Translating the same COBOL source with the same translator version produces byte-identical Loup output. This is required for code review workflows where translated output is checked into version control.

**CLI surface.**

```sh
loup cobol translate INPUT_DIR --output OUTPUT_DIR [options]
loup cobol explain FILE.cbl --line N            # show what line N would translate to
loup cobol verify FILE.cbl FILE.loup            # round-trip check (translated → executed → compared)
```

### §8.2 `loup analyze` — Impact Analysis

**Status:** Provisional. **Targets:** Build-time tool, bundled with toolchain.

`loup analyze` produces auditor-grade reports about a Loup codebase: call graphs, field lineage, cross-module dependencies, exception propagation paths, and capability flow. Mainframe shops live by this kind of analysis — every change is preceded by "what else does this touch?" Loup's static type system contains the data; this tool surfaces it.

**Reports produced.**

- **Call graph** — for any function, the full forward and reverse call graph, with cycle detection
- **Field lineage** — for any struct field, every read site and every write site across the entire project, including reads/writes through aliases and references
- **Capability flow** — which functions transitively use which capabilities (`fs`, `net`, `proc`, etc.); useful for security review
- **Exception propagation** — for any function, which exception types may propagate out, traced through all callees
- **Mode boundaries** — for each module, the execution modes it targets and which boundaries it crosses
- **Translation provenance** — for code emitted by `loup.cobol`, the originating COBOL program and line range for each Loup function or block (when available — the translator emits provenance metadata when the `--with-provenance` flag is set)

**CLI.**

```sh
loup analyze callgraph --function MyModule::processPayment --depth 5
loup analyze field-lineage --struct CustomerMaster --field balance
loup analyze capabilities --module BillingService
loup analyze exceptions --function MyModule::main
loup analyze report --output audit-report.html --format html
```

**Output formats.** Plain text (default), JSON for tooling, HTML for human review with collapsible call trees, and Graphviz DOT for visualization.

---

## §9 Platform Targets

### §9.1 z/OS Unix System Services

Loup binaries built for `--target native --arch s390x --os zos` run as USS processes. They have access to:

- The full POSIX subset USS provides
- VSAM and other traditional datasets via BPXWDYN dynamic allocation (used internally by `loup.vsam.zos`)
- DB2 via the CAF interface (`loup.db.db2` with `Db2Provider.zosAttach`)
- IMS via OTMA / XCF (`loup.ims.otma`)
- IBM MQ via the local queue manager bindings (`loup.mq` with `transport: Local`)
- CICS via EXCI (`loup.cics.exci`)

**Build prerequisites.** Cross-compilation from Linux/macOS workstations requires the IBM XL C/C++ toolchain header set on the build path (ships with z/OS Migration Aid CD, or available from IBM as a separate distribution). The `loup build` command checks for the toolchain and reports a clear error if it is missing.

**Deployment.** Built binaries are uploaded to USS via SFTP and executed directly. Installation as a JES batch step uses BPXBATCH or BPXBATSL to invoke the USS binary from JCL.

### §9.2 Linux on Z (s390x)

Linux on Z is a fully supported target via the standard `--target native --arch s390x --os linux` build flags. All packages in this document work identically to their x86_64 equivalents.

Linux on Z is the recommended deployment target for Path A migrations: it runs on the existing System Z hardware, integrates with z/OS resources via TCP/IP (DB2 Connect, MQ client, CICS via EXCI over TCP), and provides modern Linux tooling without the constraints of USS.

### §9.3 Cross-Development Workflow

The recommended development workflow:

1. **Develop and test on a workstation.** Linux, macOS, or Windows. Use `loup.vsam.local` instead of `loup.vsam.zos`. Run unit and integration tests against locally-running databases (PostgreSQL with DB2 syntax mode, ActiveMQ with MQ-compatible API).
2. **Stage on Linux on Z.** Cross-compile to s390x Linux, deploy to a staging instance with VPN access to the production mainframe's DB2 and MQ. Run integration tests against real z/OS resources but with no risk to production CICS / IMS / VSAM.
3. **Deploy to production.** Either Linux on Z (recommended) or USS. Production binaries are byte-identical to staging binaries; only environment configuration differs.

This workflow keeps mainframe access off developer workstations (a common compliance requirement) while enabling fast iteration. The `loup.vsam.local` and z/OS Connect mock servers cover the majority of the development surface.

---

## §10 Migration Playbook (non-normative)

The migration playbook is a separate document that describes how to plan and execute a multi-year COBOL-to-Loup migration. The high-level shape is:

**Phase 1 — Interop (months 0–6).** Stand up Loup services that integrate with existing CICS, DB2, and MQ. No COBOL is touched. New features ship in Loup; existing COBOL continues to ship in COBOL. The goal is operational confidence with the new stack.

**Phase 2 — Translate non-critical (months 6–18).** Run `loup.cobol` against batch jobs, internal utilities, and reporting programs that don't sit on the customer-facing critical path. Run translated and original side-by-side until output matches bit-for-bit; then cut over.

**Phase 3 — Translate critical (months 18–36).** Translate online transactions and high-volume batch. This is where the real risk is. Run shadow traffic in production for at least one full business cycle (often a quarter or a year for tax-affected systems) before cutover.

**Phase 4 — Decommission (months 36+).** Retire the last COBOL programs. Migrate VSAM datasets to `loup.vsam.local` (or keep on z/OS if Linux on Z is the target). Decommission unused mainframe LPARs.

**Risk register.** Mainframe migrations fail for a small number of well-known reasons: (1) underestimating the long tail of obscure programs; (2) insufficient test coverage of original COBOL, leading to undetected behavioral drift in translated code; (3) regulatory or audit dependencies on specific COBOL artifacts; (4) staffing — losing institutional knowledge during the multi-year cutover. The playbook walks through each.

**Performance baselines.** Establish performance baselines before any migration begins. Translated Loup should match or exceed original COBOL throughput for batch jobs and online transactions; document the comparison and be prepared to investigate regressions. Early pilots have shown 2–5× improvements in batch throughput due to better I/O patterns and modern hardware utilization, but exceptional cases exist.

**Workforce.** Loup is learnable in weeks for an experienced developer; in months for someone coming from COBOL with limited modern-language exposure. The translator output is readable enough that COBOL programmers who know how to maintain COBOL can maintain translated Loup with brief training. Hiring new developers into the translated codebase is materially easier than hiring COBOL programmers.

The full playbook is published separately at `loup.dev/migration-playbook` and is updated quarterly as customer experience accumulates.
