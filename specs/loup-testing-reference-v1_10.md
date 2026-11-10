# Loup Testing Module Reference v1.10

**Status:** Draft
**Version:** 1.10.0
**Date:** 2026-04-09
**Scope:** `testing` standard library module — test discovery, execution, assertions,
  property-based testing, mocking, dependency injection, markers, feature tags,
  constraints, tandem validators, diagnostics, debugging, configuration, and CLI.

**Related documents:**
- [Loup Language Reference v1.10](loup-language-reference-v1_10.md)
- [Loup Standard Library Reference v1.10](loup-stdlib-reference-v1_10.md)
- [testing module requirements](3-stdlib-5-test/requirements.md)
- [core.waiting design](3-stdlib-2-core-waiting/design.md)

---

## Table of Contents

- [§1 Overview and Architecture](#1-overview-and-architecture)
- [§2 Test Discovery and Collection](#2-test-discovery-and-collection)
- [§3 Expression Parsing](#3-expression-parsing)
- [§4 Dependency Injection System](#4-dependency-injection-system)
- [§5 Declaration and Registration](#5-declaration-and-registration)
- [§6 Constraints](#6-constraints)
- [§7 Markers and Metadata Filtering](#7-markers-and-metadata-filtering)
- [§8 Feature Tagging](#8-feature-tagging)
- [§9 Test Sequencing and Scope Management](#9-test-sequencing-and-scope-management)
- [§10 Sequence Document Generation](#10-sequence-document-generation)
- [§11 Test Execution (TestJob)](#11-test-execution-testjob)
- [§12 Factory Protocol for TestJob Extensibility](#12-factory-protocol-for-testjob-extensibility)
- [§23 CLI Integration (loup test)](#23-cli-integration-loup-test)

---

## §1 Overview and Architecture

The `testing` module is Loup's foundation test framework, shipping with the runtime as part of the standard library. It provides everything needed to write, discover, execute, and report on tests without any external packages.

### §1.1 Design Principles

The framework follows a two-tier architecture:

- **Tier 1 (this module):** Core test execution shipped with the runtime. Handles discovery, sequencing, execution, assertions, property testing, mocking, markers, feature tags, dependency injection, constraints, tandem validators, text output, and CLI integration.
- **Tier 2 (`testing.integration` package):** Deferred to a separate installable package. Adds integration/configuration couplings, build/job/pipeline metadata, HTML rendering, result streaming, progress concentrators, and diagnostic capture.

The `TestJob` is intentionally simple — it handles test discovery → sequence generation → execution → results without requiring job/build/pipeline metadata. An extensible factory protocol allows `testing.integration` to provide an `IntegratedTestJob` with full reporting capabilities.

**`const func` bodies are runtime-testable.** A function declared `const func` (core
§1-7.1) is callable in ordinary runtime contexts with identical observable behaviour —
that is rule 8 of the const-evaluation profile, and it is what makes the profile testable
at all. A test targets a `const func` exactly as it targets any other function; nothing
in this framework distinguishes them, and nothing should, because a `const func` that
behaved differently at run time from compile time would be the defect the rule exists to
forbid. What a test CANNOT do from here is exercise the compile-time evaluator itself:
that is the compiler's, and its evidence obligations are the `CTR-CONST-*` entries of the
qualification plan's §12.4.

### §1.2 Module Structure

```
testing                          # Root module
├── testing.discovery            # TestCollector, TestRef, TestGroup
├── testing.execution            # TestJob, TestSequencer, scope managers
├── testing.results              # ResultCode, ResultNode, TestResult, recorders
├── testing.assertions           # assert_* and verify_* functions
├── testing.expect               # Fluent expect(value) API
├── testing.properties           # @given, Strategy, PropertyRunner
├── testing.mocking              # Mock, Patch, SideEffect
├── testing.markers              # @markCategories, MetaFilter, parsing
├── testing.features             # FeatureTag, FeatureFilter, FeatureMask
├── testing.expressions          # parseTestIncludeExpression
├── testing.tandem               # Validator, LoopingValidator, TimeIntervalValidator
├── testing.injection            # InjectionRegistry, InjectionScope, InjectionMoment
├── testing.constraints          # ConstraintsCatalog, ConstraintsRef
├── testing.runner               # CLI entry point, configuration loading
├── testing.factories            # TestJobFactory protocol
├── testing.debugging            # Breakpoint support, debugger integration
├── testing.timeout              # TestRunTimeoutError, timeout guard
└── testing.diagnostics          # DiagnosticLabel, pre/post-run capture hooks
```

### §1.3 Dependencies

The shipped `testing` module depends on **the prelude only**, plus the `clock_ns`
builtin (`@builtin("clock_ns")`, the platform contract's monotonic clock slot) that
`runTest` times each test with. `debug.assert` — the assertion library whose throws
decide a test's verdict — depends on the prelude only. Neither imports another stdlib
module, and that is a rule, not an accident: the framework and everything it depends
on form the dependency closure of `loup test`, the **exclusion list**
(`docs/loup-test-exclusions.txt`, generated and `--check`ed by
`source/sandboxes/agent/loup_test_closure.py`). Code on that list cannot be tested
with `loup test`, because a defect there could hide its own failures; it is tested by
Loup test programs judged from outside. An import added here would move that module
onto the list and out of `loup test`'s reach, so the closure check fails until the
list is regenerated and the change reviewed.

The dependency table this section used to carry (`core.time`, `core.waiting`,
`core.reflect`, `core.math`, `io.fs`, `io.path`, `data.json`, `structures`) described
the aspirational framework of §2–§12, which has no code (see the status note at §2).

### §1.4 Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                     loup test CLI                        │
├─────────────────────────────────────────────────────────┤
│                      TestJob                             │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │ Discovery │→│  Sequencing  │→│    Execution       │  │
│  │ Collector │  │  Document    │  │  (runtime.compile) │  │
│  └──────────┘  └──────────────┘  └───────────────────┘  │
│       ↓              ↓                    ↓              │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │ Expression│  │  Injection   │  │  Scope Managers   │  │
│  │ Parsing   │  │  Registry    │  │  Session/Module/  │  │
│  └──────────┘  └──────────────┘  │  Setup/Test       │  │
│                                   └───────────────────┘  │
│                         ↓                                │
│              ┌───────────────────┐                        │
│              │ TextResultRecorder │                        │
│              │ (stdout + file)    │                        │
│              └───────────────────┘                        │
├─────────────────────────────────────────────────────────┤
│  Extension: testing.integration (Tier 2)                 │
│  IntegratedTestJob, HtmlRecorder, ProgressConcentrator   │
└─────────────────────────────────────────────────────────┘
```

---

## §2 Test Discovery and Collection

> **Status (2026-10-03): aspirational — §2–§12 are not implemented.** Nothing in the
> tree defines `TestCollector`, `TestSequencer`, `InjectionRegistry`, markers, feature
> tags, constraints, sequence documents or `TestJob`; the implementation tasks that
> once checked them off have no code behind them. The shipped framework is the small
> `testing` surface of §23 (`runTest`, `TestResult`, `TestSummary`, `skipTest`,
> `SkipSignal`, `TestFailure`) plus `debug.assert`. These sections record intent only.
> Building any of them must keep the framework's closure to the prelude (§1.3) or move
> the new dependencies onto the exclusion list deliberately.

The discovery system scans directories for `.loup` test files, imports modules, identifies test functions, applies filters, and builds a hierarchical test tree.

### §2.1 TestCollector

`TestCollector` is the central orchestrator for test discovery.

```loup
pub class TestCollector : Any {
    let root: string;
    let excludes: list[string];
    let metafilters: list[MetaFilter];
    let methodPrefix: string;
    let testModule: Any?;

    var _references: dict[string, TestRef];
    var _importErrors: dict[string, ImportErrorRecord];
    var _testTree: TestGroup?;

    pub static func new(
        root: string,
        excludes: list[string] = [],
        metafilters: list[MetaFilter] = [],
        methodPrefix: string = "test",
        testModule: Any? = none
    ): TestCollector;

    ## Collect test references matching the given include expression.
    ## May be called multiple times with different expressions; results accumulate.
    pub func collectReferences(expression: string): void;

    ## Apply metadata filters, build the final test tree.
    pub func finalizeCollection(): void;

    ## Resolve all parameter origins in the injection registry.
    ## Throws UnknownParameterError if unresolved parameters remain.
    pub func collectInjectionsAndConfigurations(): void;

    # Properties
    pub func testTree(): TestGroup;
    pub func references(): dict[string, TestRef];
    pub func importErrors(): dict[string, ImportErrorRecord];
}
```

**Discovery algorithm:**

1. Parse the include expression via `parseTestIncludeExpression`.
2. Scan the root directory for `.loup` files matching the package/module expressions.
3. Import each module, inspect exported functions, and collect those whose names start with `methodPrefix`.
4. Create a `TestRef` for each matching function.
5. Merge results into the internal reference dictionary.
6. On `finalizeCollection()`, build the test tree, resolve metadata, and apply metadata filters.

### §2.2 TestRef

A lightweight reference to a test function that delays instantiation of test runtime state until execution time.

```loup
pub class TestRef : Any {
    pub let func_ref: func;
    pub let name: string;
    pub let moduleName: string;
    pub let isAsync: bool;
    pub let monikers: list[string];
    pub let pivots: dict[string, Any];
    var _metadata: dict[string, Any]?;
    var _finalized: bool;

    pub static func new(
        func_ref: func,
        name: string,
        moduleName: string,
        isAsync: bool = false,
        monikers: list[string] = [],
        pivots: dict[string, Any] = {}
    ): TestRef;

    pub func metadata(): dict[string, Any]?;
    pub func scopeName(): string;
    pub func finalize(): void;
    pub func isFinalized(): bool;
    pub func isMemberOfMetaset(filters: list[MetaFilter]): bool;
}
```

### §2.3 TestGroup

A hierarchical grouping node in the test tree, mirroring the source code module structure.

```loup
pub class TestGroup : Any {
    pub let name: string;
    pub let package_name: string?;
    var _children: dict[string, TestGroup | TestRef];
    var _metadata: dict[string, Any]?;
    var _finalized: bool;

    pub static func new(name: string, package_name: string? = none): TestGroup;

    pub func addDescendent(testRef: TestRef): void;
    pub func children(): dict[string, TestGroup | TestRef];
    pub func resolveMetadata(): void;
    pub func finalize(): void;
    pub func isFinalized(): bool;
}
```

The test tree root is always a `TestGroup` named `"<session>"`. Intermediate group nodes are created automatically based on the test's module path.

### §2.4 Test Root Discovery

Test roots are directories containing a `__testroot__.loup` marker file. The framework walks up from a module's location to find this marker.

```loup
pub func findTestModuleRoot(modulePath: string): string;
# Walks up the directory tree looking for __testroot__.loup.
# Throws ConfigurationError if the filesystem root is reached.

pub func findTestModuleFullName(modulePath: string, testRoot: string? = none): string;
# Computes the dotted module name relative to the test root's parent.
```

### §2.5 Platform Support Filtering

Directories containing a `__platforms__.loup` file are conditionally included based on platform support. If the file raises `UnsupportedPlatformError` when executed, the directory and its subdirectories are skipped.

### §2.6 Import Error Tracking

| Field | Type | Description |
|---|---|---|
| `moduleName` | `string` | Fully qualified module name |
| `filePath` | `string` | Filesystem path to the module |
| `traceback` | `string` | Formatted traceback string |

Import errors are logged at ERROR level but do not block discovery of other modules.

---

## §3 Expression Parsing

> **Status (2026-10-03): aspirational — not implemented** (see the note at §2).

The expression parser converts test include/exclude strings into structured components for the discovery system.

### §3.1 Expression Format

```
(package).(module)@(testClass)#(testName)
```

Delimiter precedence (right to left): `#` → `@` → `.`

### §3.2 Parser API

```loup
pub func parseTestIncludeExpression(
    expression: string,
    testModule: Any? = none,
    methodPrefix: string = "test"
): (string?, string?, string?, string?);
# Returns: (package, module, testClass, testName)
```

### §3.3 Expression Examples

| Expression | Package | Module | TestClass | TestName |
|---|---|---|---|---|
| `"pkg.mod"` | `"pkg"` | `"mod"` | `none` | `none` |
| `"pkg.sub.mod"` | `"pkg.sub"` | `"mod"` | `none` | `none` |
| `"pkg.mod#test_login"` | `"pkg"` | `"mod"` | `none` | `"test_login"` |
| `"mod"` | `none` | `"mod"` | `none` | `none` |
| `"*"` (module workflow) | `"*"` | `"*"` | `none` | `none` |

### §3.4 Validation Rules

- Test names must start with the configured `methodPrefix` (default: `"test"`). A `ValueError` is thrown otherwise.
- In module workflow (when `testModule` is provided), expressions containing `.`, `@`, or `:` are rejected.
- The wildcard `*` is valid only in module workflow.

---

## §4 Dependency Injection System

> **Status (2026-10-03): aspirational — not implemented** (see the note at §2).

The DI system manages resolution, instantiation, and lifecycle of injectable resources during test execution. It provides a hierarchical scope tree for parameter visibility and supports multiple resource lifespans.

### §4.1 InjectionRegistry

The singleton registry managing all registered sources, origins, and the scope tree.

```loup
pub class InjectionRegistry : Any {
    # Singleton
    static var _instance: InjectionRegistry?;
    pub static func instance(): InjectionRegistry;

    # Source tables
    var _integrationSources: dict[func, IntegrationSource];
    var _resourceSources: dict[func, ResourceSource];
    var _configurationSources: dict[func, ConfigurationSource];
    var _validatorSources: dict[func, ValidatorSource];

    # Scope tree
    var _scopeRoot: InjectionScope;

    # Tracking
    var _unknownParameters: dict[string, list[string]];
    var _referencedIntegrations: dict[func, type];
    var _referencedConfigurations: dict[func, type];

    pub func registerSource(source: IntegrationSource | ResourceSource |
                            ConfigurationSource | ValidatorSource): void;
    pub func lookupResourceSource(sourceFunc: func): Any?;
    pub func lookupValidatorSource(sourceFunc: func): ValidatorSource?;
    pub func registerResourceOrigin(origin: ResourceOrigin): void;
    pub func registerValidatorOrigin(origin: ValidatorOrigin): void;
    pub func lookupResourceScope(scopeName: string): InjectionScope?;
    pub func addImpliedSessionResource(identifier: string): void;
    pub func finalizeStartup(references: dict[string, TestRef]): void;
    pub func renameOriginsFromMain(newOriginName: string): void;
}
```

### §4.2 InjectionScope

A node in the hierarchical scope tree containing parameter and validator originations.

```loup
pub class InjectionScope : Any {
    let name: string;
    var _children: dict[string, InjectionScope];
    var _parameterOriginations: OrderedDictionary[string, ResourceOrigin];
    var _validatorOriginations: OrderedDictionary[string, ValidatorOrigin];
    var _relevant: bool;

    pub func addDescendent(path: string, origin: ResourceOrigin | ValidatorOrigin): void;
    pub func parameterOriginations(): OrderedDictionary[string, ResourceOrigin];
    pub func validatorOriginations(): OrderedDictionary[string, ValidatorOrigin];
    pub func prune(): void;
}
```

### §4.3 ResourceLifespan

```loup
pub enum ResourceLifespan {
    Session;   # Lives for the entire test session
    Package;   # Lives within a module hierarchy
    Test;      # Created and destroyed per test
    Task;      # Lives within a task scope
}
```

### §4.4 Parameter Resolution

Parameters are resolved by walking the scope tree from root to the injection moment:

1. Start at the root scope (`<session>`).
2. Walk down the scope path, accumulating visible parameter originations.
3. At each level, parameters shadow parent-scope parameters with the same identifier.
4. Reserved parameter names (e.g., `"constraints"`) are skipped during resolution.
5. Unresolved parameters are recorded in the `unknownParameters` table.

### §4.5 InjectionMoment

Represents a point in the execution flow where injection occurs.

```loup
pub class InjectionMoment : Any {
    pub let func_ref: func;
    pub let monikers: list[string];
    pub let pivots: dict[string, Any];

    pub func scopeName(): string;
    pub func parameterSignature(): dict[string, type];
    pub func metadata(): dict[string, Any]?;
    pub func isMemberOfMetaset(filters: list[MetaFilter]): bool;
}
```

The `parameterSignature()` method uses `core.reflect` to introspect the function's parameter names and types.

---

## §5 Declaration and Registration

> **Status (2026-10-03): aspirational — not implemented** (see the note at §2).

Annotations (decorators) for declaring test parameters, resource factories, and validator factories.

### §5.1 @resourceFactory

Registers a generator function as a resource factory in the injection registry.

```loup
@resourceFactory(lifespan = ResourceLifespan.Package)
gen func provideDatabase(): Iterable[DatabaseConnection] {
    let conn = DatabaseConnection.connect("test.db");
    yield conn;
    conn.close();
}
```

**Rules:**
- The function must have a return type annotation.
- Generator functions yield the resource; the code after `yield` runs on cleanup.
- Non-generator functions return the resource directly.
- An optional `constraints` parameter enables constraint-based customization.

### §5.2 @parameter

Attaches a resource parameter to a specific test function with `Test` lifespan.

```loup
@parameter(source = provideDatabase, identifier = "db")
func test_query(db: DatabaseConnection): void {
    let result = db.query("SELECT 1");
    assertEqual(result, 1);
}
```

**Rules:**
- The identifier defaults to the source function name if not provided.
- The identifier `"constraints"` is reserved and throws `SemanticError`.
- If constraints are provided but the source function has no `constraints` parameter, throws `SemanticError`.

### §5.3 @validation

Attaches a validator to a specific test function.

```loup
@validation(source = provideLogValidator, suffix = "log_check")
func test_operation(logValidator: LogValidator): void {
    performOperation();
    # logValidator runs in parallel, finalized after test completes
}
```

### §5.4 @integrationFactory / @configurationFactory / @validatorFactory

```loup
# Integration factory — yields an IntegrationCoupling subclass
@integrationFactory(constraints = deviceConstraints)
gen func provideDevice(): Iterable[DeviceIntegration] {
    let device = DeviceIntegration.discover();
    yield device;
    device.disconnect();
}

# Configuration factory — yields a ConfigurationCoupling subclass
@configurationFactory()
gen func provideConfig(): Iterable[TestConfig] {
    let config = TestConfig.load();
    yield config;
}

# Validator factory — returns a ValidatorCoupling subclass
@validatorFactory()
func provideLogValidator(): LogValidator {
    return LogValidator.new();
}
```

### §5.5 Global Parameter Origination

For resources shared across multiple tests at package or session scope:

```loup
# At module level — creates a Package-scoped parameter
from testing.injection import parameter, ResourceLifespan;

parameter(
    source = provideDatabase,
    lifespan = ResourceLifespan.Session,
    identifier = "db"
);
```

**Rules:**
- `ResourceLifespan.Test` is not allowed for global origination (throws `SemanticError`).
- Integration sources default to `Session` lifespan.
- Non-integration sources default to `Package` lifespan.

---

## §6 Constraints

> **Status (2026-10-03): aspirational — not implemented** (see the note at §2).

The constraints system passes configuration parameters and feature requirements from external sources to resource factories.

### §6.1 Constraints Type

```loup
pub class Constraints : Any implements IReadableMap[string, Any] {
    # Dictionary-like container for key-value constraint pairs
    pub static func new(**kwargs: Any): Constraints;

    ## Returns a new dict with original values updated by the provided arguments.
    ## Does NOT modify the original.
    pub func call(**kwargs: Any): dict[string, Any];
}
```

### §6.2 ConstraintsCatalog

Singleton registry for constraint lookup with priority-based resolution.

```loup
pub class ConstraintsCatalog : Any {
    static var _instance: ConstraintsCatalog?;
    pub static func instance(): ConstraintsCatalog;

    var _siteConstraints: dict[string, ConstraintsRef];
    var _overrideConstraints: dict[string, ConstraintsRef];

    pub func addConstraints(
        origin: ConstraintsOrigin,
        scope: string,
        identifier: string,
        constraints: Constraints
    ): string;  # Returns the constraint key

    pub func lookupConstraints(key: string): Constraints?;
    # Override constraints take precedence over site constraints.

    pub func pruneConstraints(keepScopes: list[string]): void;
}
```

### §6.3 ConstraintsOrigin

```loup
pub enum ConstraintsOrigin {
    SiteParameter;      # Default constraints from site configuration (lower priority)
    OverrideParameter;  # Runtime overrides (higher priority)
}
```

### §6.4 FeatureConstraints

```loup
pub class FeatureConstraints : FeatureMask {
    pub let checkout: bool;

    pub static func new(
        requiredFeatures: list[FeatureTag | string]? = none,
        excludedFeatures: list[FeatureTag | string]? = none,
        checkout: bool = false,
        **kwargs: Any
    ): FeatureConstraints;
}
```

### §6.5 Constraint Merging

```loup
pub func mergeConstraints(...constraints: Constraints | dict[string, Any]): Constraints;
# Merges multiple constraint sets. Last value wins for duplicate keys.
```

---

## §7 Markers and Metadata Filtering

> **Status (2026-10-03): aspirational — not implemented** (see the note at §2).

Annotations for tagging tests with categories, keywords, and priority, plus filter types for selecting tests based on metadata.

### §7.1 Marker Annotations

```loup
@markCategories(categories = ["smoke", "regression"])
@markKeywords(keywords = ["login", "auth"])
@markPriority(priority = 1)
func test_user_login(): void {
    # ...
}
```

### §7.2 Module-Level Markers

Applied at module scope, propagating to all tests in the module:

```loup
from testing.markers import markDescendentCategories, markDescendentKeywords;

markDescendentCategories(categories = ["integration"]);
markDescendentKeywords(keywords = ["database"]);
```

### §7.3 MetaFilter Types

| Type | Operator | Description |
|---|---|---|
| `MetaFilterContains` | `~=` | Value contains substring or list member |
| `MetaFilterEquals` | `==` | Value exactly equals target |
| `MetaFilterNotEquals` | `!=` | Value does not equal target |

Each filter has an `include` flag (`+` for include mode, `-` for exclude mode).

### §7.4 Marker Expression Parsing

```loup
pub func parseMarkerExpression(expression: string): MetaFilter;
```

**Expression format:** `(+ | -) <group> (== | ~= | !=) <value>`

| Expression | Mode | Group | Operator | Value |
|---|---|---|---|---|
| `"+category==smoke"` | Include | `category` | Equals | `smoke` |
| `"-keyword~=slow"` | Exclude | `keyword` | Contains | `slow` |
| `"+priority!=low"` | Include | `priority` | NotEquals | `low` |

**Validation:**
- Expression must start with `+` or `-`.
- Must contain a valid operator (`==`, `~=`, `!=`).
- Value component is required.
- Leading/trailing whitespace is stripped.

---

## §8 Feature Tagging

> **Status (2026-10-03): aspirational — not implemented** (see the note at §2).

A hierarchical, type-safe mechanism for categorizing and filtering objects based on feature capabilities.

### §8.1 FeatureTag

```loup
pub class FeatureTag : Any {
    pub static let ID: string;  # Auto-generated from class hierarchy

    # ID is generated from __qualname__: lowercase, dots → slashes
    # e.g., class Connectivity.WiFi → "connectivity/wifi"
}

# Usage: define feature tags as nested classes
class DeviceFeatures {
    class Connectivity : FeatureTag {
        class WiFi : FeatureTag {}
        class Bluetooth : FeatureTag {}
    }
    class Display : FeatureTag {
        class HDR : FeatureTag {}
    }
}
# DeviceFeatures.Connectivity.WiFi.ID == "devicefeatures/connectivity/wifi"
```

### §8.2 FeatureAttachedObject

Mixin that adds feature tag support to any type.

```loup
pub class FeatureAttachedObject : Any {
    var _featureTags: list[string];  # Sorted for efficient lookup

    pub func extendFeatures(features: list[FeatureTag | string]): void;
    pub func featureTags(): frozenset[string];
    pub func hasFeature(tag: FeatureTag | string): bool;
    pub func hasAllFeatures(tags: list[FeatureTag | string]): bool;
    pub func hasAnyFeature(tags: list[FeatureTag | string]): bool;
}
```

### §8.3 FeatureMask and FeatureFilter

```loup
pub class FeatureMask : Any {
    pub let requiredFeatures: list[FeatureTag | string]?;
    pub let excludedFeatures: list[FeatureTag | string]?;
}

pub class FeatureFilter : Any {
    pub let requiredFeatures: list[FeatureTag | string]?;
    pub let excludedFeatures: list[FeatureTag | string]?;

    pub func filter(items: list[FeatureAttachedObject]): list[FeatureAttachedObject];
    # Includes items with ALL required features and NONE of excluded features.
}
```

---

## §9 Test Sequencing and Scope Management

> **Status (2026-10-03): aspirational — not implemented** (see the note at §2).

The sequencer is the central state machine that orchestrates test execution through a hierarchy of scope context managers.

### §9.1 TestSequencer

```loup
pub enum SequencerPhase {
    Initial;
    Discovery;
    Collection;
    Graph;
    Traversal;
}

pub class TestSequencer : Any implements Scoped[TestSequencer] {
    let title: string;
    let testRoot: string;
    let includes: list[string];
    let excludes: list[string];
    let metafilters: list[MetaFilter];

    var _phase: SequencerPhase;
    var _scopeStack: list[(string, string)];  # (scopeName, scopeId)
    var _testTree: TestGroup?;
    var _sequenceDocument: string?;

    pub static func new(
        title: string,
        testRoot: string,
        includes: list[string] = [],
        excludes: list[string] = [],
        metafilters: list[MetaFilter] = []
    ): TestSequencer;

    # Discovery
    pub func discover(testModule: Any? = none): int;
    # Returns count of discovered tests.

    # Sequence document generation
    pub func generateTestrunSequenceDocument(outputFilename: string): void;

    # Execution
    pub func executeTests(runId: string, recorder: ResultRecorder): void;
    # Compiles and executes the sequence document via runtime.compile().

    # Scope management
    pub func enterSessionScopeContext(): SequencerSessionScope;
    pub func enterModuleScopeContext(scopeName: string): SequencerModuleScope;
    pub func enterTestSetupContext(testName: string): SequencerTestSetupScope;
    pub func enterTestScopeContext(testName: string, notables: dict[string, Any]? = none): SequencerTestScope;

    # Scope ID management
    pub func scopeIdCreate(): (string, string);  # (parentId, scopeId)
    pub func scopeIdPush(scopeName: string, scopeId: string): void;
    pub func scopeIdPop(scopeName: string): void;
    pub func getTopScopeId(): string;

    # Tree navigation
    pub func findTreeNodeForScope(scopeName: string): TestGroup | TestRef | none;

    # Properties
    pub func importErrors(): dict[string, ImportErrorRecord];
    pub func references(): dict[string, TestRef];
    pub func testTree(): TestGroup;
    pub func phase(): SequencerPhase;
}
```

### §9.2 Scope Hierarchy

The sequencer manages a four-level scope hierarchy:

```
SessionScope          ← Root scope, entire test run
  └── ModuleScope     ← One per test module
        ├── TestSetupScope  ← Optional, for test-local parameter creation
        │     └── TestScope ← Individual test execution
        └── TestScope       ← Individual test execution (no setup needed)
```

### §9.3 SequencerSessionScope

```loup
pub class SequencerSessionScope : Any implements Scoped[SequencerSessionScope] {
    let sequencer: TestSequencer;
    let recorder: ResultRecorder;
    let rootResult: ResultContainer;
    let scopeName: string;
    let scopeId: string;
    let scopeNode: TestGroup;

    pub func scope_enter(): SequencerSessionScope;
    # Pushes scope ID, logs "SESSION ENTER: {scopeId}"

    pub func scope_exit(error: Option[Any]): bool;
    # On SkipError: marks all descendants as skipped
    # On other exception: marks all descendants as errored
    # Always: finalizes scope node, pops scope ID
}
```

### §9.4 SequencerModuleScope

```loup
pub class SequencerModuleScope : Any implements Scoped[SequencerModuleScope] {
    let sequencer: TestSequencer;
    let recorder: ResultRecorder;
    let scopeName: string;
    var scopeId: string;
    var parentScopeId: string;
    let scopeNode: TestGroup;

    pub func scope_enter(): SequencerModuleScope;
    # Creates scope ID, records TestContainer, logs "MODULE ENTER"

    pub func scope_exit(error: Option[Any]): bool;
    # On SkipError: marks descendants as skipped
    # On other exception: marks descendants as errored
    # Always: finalizes scope node, pops scope ID
}
```

### §9.5 SequencerTestSetupScope

```loup
pub class SequencerTestSetupScope : Any implements Scoped[SequencerTestSetupScope] {
    let sequencer: TestSequencer;
    let recorder: ResultRecorder;
    let testName: string;
    let scopeName: string;  # "setup:{testName}"

    pub func scope_enter(): SequencerTestSetupScope;
    pub func scope_exit(error: Option[Any]): bool;
    # On SkipError: marks the test as skipped
    # On other exception: marks the test as errored
}
```

### §9.6 SequencerTestScope

```loup
pub class SequencerTestScope : Any implements Scoped[SequencerTestScope] {
    let sequencer: TestSequencer;
    let recorder: ResultRecorder;
    let testName: string;
    let notables: dict[string, Any];
    var scopeId: string;
    var parentScopeId: string;
    var result: TestResult;
    var contextIdentifier: string;
    var monikers: list[string];
    var pivots: OrderedDictionary[string, Any];

    pub func scope_enter(): SequencerTestScope;
    # Creates scope ID, creates TestResult, previews with recorder

    pub func scope_exit(error: Option[Any]): bool;
    # SkipError → SKIPPED
    # AssertionError → FAILED
    # Other exception → ERRORED
    # No exception → PASSED
    # Always: finalizes result, records with recorder, pops scope ID
    # Returns true (suppresses exception propagation)

    # Activity tracking
    pub func beginActivity(activityName: string, target: string = "NA",
                           detail: dict[string, Any]? = none): TestActivity;
    pub func markActivity(activityName: string, target: string = "NA",
                          detail: dict[string, Any]? = none): void;
}
```

### §9.7 Context Identifier Generation

For parameterized tests, the context identifier combines the test name with monikers:

```
test_login:admin,valid_creds
```

When notables have a `moniker` property, that value is used. Otherwise, `str(notable)` is used.

### §9.8 Exception Classification

| Exception Type | Result Code | Meaning |
|---|---|---|
| `SkipError` | `SKIPPED` | Test intentionally skipped |
| `AssertionError` | `FAILED` | Test assertion not met (product issue) |
| Any other `Exception` | `ERRORED` | Infrastructure or test code issue |
| No exception | `PASSED` | Test completed successfully |

### §9.9 TestActivity

Records timing information for operations within a test scope.

```loup
pub class TestActivity : Any implements Scoped[TestActivity] {
    pub let activityName: string;
    pub let target: string;
    pub let detail: dict[string, Any]?;
    var _begin: Instant;
    var _end: Instant?;

    pub func scope_enter(): TestActivity;
    pub func scope_exit(error: Option[Any]): bool;
    pub func finalize(): void;
    pub func asDict(): dict[string, Any];
    pub func asJson(indent: int = 4): string;
}
```

---

## §10 Sequence Document Generation

> **Status (2026-10-03): aspirational — not implemented** (see the note at §2).

The sequencer generates an executable Loup source file (the "sequence document") that encodes the test execution order, parameter provisioning, and scope management. This document is then compiled and executed via `runtime.compile()`.

### §10.1 Generation Process

1. **First pass:** Write the document to a temporary file, collecting factory imports and constraint imports.
2. **Second pass:** Read the temporary file, insert collected imports at designated insertion points, write the final document.
3. **Cleanup:** Remove the temporary file.

### §10.2 Document Structure

The generated document contains:

```loup
# Code-generated test sequence document — do not edit manually.

from testing.constraints import ConstraintsCatalog;
from logging import getLogger;

# ------- INSERT CONSTRAINT IMPORTS HERE -------
# ------- INSERT FACTORY IMPORTS HERE -------

let logger = getLogger();
let constraintsCatalog = ConstraintsCatalog.instance();

## Entry point for the test run sequence document.
func session(sequencer: TestSequencer): void {
    with (ssc = sequencer.enterSessionScopeContext()) {
        # Session-level parameter loops
        for (param in sessionFactory()) {
            scope_tests_unit(sequencer, param);
            scope_tests_integration(sequencer, param);
        }
    }
    return;
}

func scope_tests_unit(sequencer: TestSequencer, param: SomeType): void {
    with (msc = sequencer.enterModuleScopeContext("tests.unit")) {
        # Module-level parameter loops
        # Test scope blocks
        # ================ Test Scope: test_example ================
        let testScopeName = "test_example";
        with (tscope = sequencer.enterTestScopeContext(testScopeName)) {
            from tests.unit import test_example;
            test_example(param);
        }
    }
    return;
}
```

### §10.3 Key Differences from Python automojo-testbase

| Aspect | automojo-testbase (Python) | Loup testing |
|---|---|---|
| Module loading | `import_file()` | `runtime.compile()` |
| Signature introspection | `inspect.signature` | `core.reflect.signatureOf` |
| Ordered dictionaries | `collections.OrderedDict` | `structures.OrderedDictionary` |
| Threading events | `threading.Event` | `core.waiting.WaitGate` |
| CLI arguments | `sys.argv` | `runtime.args()` |

### §10.4 Breadth-First Scope Traversal

Scope methods are generated in breadth-first order using a FIFO queue:

1. Generate the `session()` method, collecting child scopes.
2. Pop the first child scope from the queue, generate its method, collect its children.
3. Repeat until the queue is empty.

This ensures parent scopes are defined before child scopes in the output file.

### §10.5 Constraint Lookup Generation

When a factory function's signature includes a `constraints` parameter:

```loup
let constraints = constraintsCatalog.lookupConstraints("scope:identifier");
if (constraints == none) {
    throw RuntimeError("Constraints not found for key: scope:identifier");
}
for (resource in factory(constraints = constraints)) {
    # ...
}
```

### §10.6 Validator Integration

Validators are integrated into test scope code with try/finally blocks:

```loup
with (tscope = sequencer.enterTestScopeContext(testScopeName)) {
    let validator = validatorFactory();
    try {
        validator.attachToTest(tscope, "suffix");
        from tests.unit import test_example;
        test_example(param, validator);
    } finally {
        validator.finalize();
    }
}
```

---

## §11 Test Execution (TestJob)

> **Status (2026-10-03): aspirational — not implemented** (see the note at §2).

`TestJob` is the high-level orchestrator that spans the complete test run lifecycle.

### §11.1 SimpleTestJob

The foundation `TestJob` implementation. No integration metadata, no build/pipeline/job info.

```loup
pub class SimpleTestJob : Any implements Scoped[SimpleTestJob] {
    pub let title: string;
    pub let testRoot: string;
    pub let includes: list[string];
    pub let excludes: list[string];
    pub let metafilters: list[MetaFilter];
    pub let timeout: Duration?;

    var _sequencer: TestSequencer?;
    var _recorder: ResultRecorder?;
    var _importErrors: list[ImportErrorRecord];

    pub static func new(
        title: string = "Test Run",
        testRoot: string,
        includes: list[string] = ["*"],
        excludes: list[string] = [],
        metafilters: list[MetaFilter] = [],
        timeout: Duration? = none,
        testModule: Any? = none
    ): SimpleTestJob;

    ## Full test run lifecycle.
    pub func execute(): int;
    # Returns 0 for all passed/skipped, -1 for failures/errors.

    ## Query mode — discover tests without executing.
    pub func query(): list[TestRef];

    # Lifecycle hooks (overridable)
    pub func begin(): void;
    pub func finalize(): void;

    # Factory methods (overridable)
    pub func createSequencer(): TestSequencer;
    pub func createRecorder(): ResultRecorder;

    # Scoped interface
    pub func scope_enter(): SimpleTestJob;
    pub func scope_exit(error: Option[Any]): bool;

    # Properties
    pub func importErrors(): list[ImportErrorRecord];
}
```

### §11.2 Execution Flow

```
1. begin()
   └── Initialize result recording paths
2. execute()
   ├── createSequencer()
   ├── sequencer.discover()
   │   └── If 0 tests found → log error, return -1
   ├── sequencer.generateTestrunSequenceDocument()
   ├── createRecorder()
   ├── with (recorder) {
   │       sequencer.executeTests(runId, recorder)
   │       // runtime.compile() loads and executes the sequence document
   │   }
   ├── Return 0 (all passed) or -1 (failures/errors)
3. finalize()
   └── Cleanup operations
```

### §11.3 Empty Test Set Handling

When discovery finds zero tests, the `execute()` method logs an error including the include and exclude expressions, then returns -1.

---

## §12 Factory Protocol for TestJob Extensibility

> **Status (2026-10-03): aspirational — not implemented** (see the note at §2).

The factory protocol enables `testing.integration` to substitute an enhanced `TestJob` without modifying the foundation.

### §12.1 TestJobFactory Interface

```loup
pub interface TestJobFactory {
    func createTestJob(config: TestJobConfig): SimpleTestJob;
}

pub struct TestJobConfig {
    title: string;
    testRoot: string;
    includes: list[string];
    excludes: list[string];
    metafilters: list[MetaFilter];
    timeout: Duration?;
    testModule: Any?;
}
```

### §12.2 Default Factory

```loup
pub class DefaultTestJobFactory : Any implements TestJobFactory {
    pub func createTestJob(config: TestJobConfig): SimpleTestJob {
        return SimpleTestJob.new(
            title = config.title,
            testRoot = config.testRoot,
            includes = config.includes,
            excludes = config.excludes,
            metafilters = config.metafilters,
            timeout = config.timeout,
            testModule = config.testModule
        );
    }
}
```

### §12.3 Factory Registration

```loup
# In testing.factories module
var _currentFactory: TestJobFactory = DefaultTestJobFactory();

pub func setTestJobFactory(factory: TestJobFactory): void;
pub func getTestJobFactory(): TestJobFactory;
```

### §12.4 Integration Package Usage

The `testing.integration` package (Tier 2) provides:

```loup
# In testing.integration (separate package, not in stdlib)
pub class IntegratedTestJobFactory : Any implements TestJobFactory {
    pub func createTestJob(config: TestJobConfig): SimpleTestJob {
        return IntegratedTestJob.new(
            # ... config fields plus:
            # buildInfo, pipelineInfo, jobInfo, renderInfo, forwardingInfo
        );
    }
}

# Registration at package init:
from testing.factories import setTestJobFactory;
setTestJobFactory(IntegratedTestJobFactory());
```

---

> **Sections §13–§22 and §24 do not exist, and this document no longer claims they do.**
> Its table of contents promised eleven sections that were never written — Result Model,
> Text Result Recorder, Verification and Assertions, Mocking Framework, Property-Based
> Testing, Tandem Validators, Diagnostics, Test Run Timeout, Debugging Support,
> Configuration, and Extension Points (Integration Package) — and the numbering jumps
> straight from §12 to §23 as a result. Measured 2026-09-09: nothing in the corpus
> references any of them, and the shipped `testing` module is a small surface
> (`skipTest`, `runTest`, `TestResult`, `TestSummary`, `SkipSignal`) with no mocking,
> property-testing or validator machinery to document. The entries were removed rather
> than filled because writing eleven sections of reference text for unbuilt features would
> describe a framework that does not exist — a worse defect than the gap. The titles are
> kept here so the intent is not lost if those features are ever built; the numbers §13–§22
> and §24 are reserved for them.

## §23 CLI Integration (`loup test`)

`loup test` is the default way to test Loup code, except the code on its own
exclusion list (`docs/loup-test-exclusions.txt`, see §1.3): the framework, the runner,
and the front end, interpreter and prelude they run on. Two runners implement it:

- the self-hosted `loup test`, which the `loup` CLI hands to `loup-test`
  (`source/runtime/tools/loup_test/`). It discovers `*_test.lpscr` / `*_test.loup`
  files, runs each with `loup run` (a generated driver runs each arg-less
  `func test_*()` through `testing.runTest`, §23.9), and reads the `ok:` / `FAIL:` /
  `skip:` lines each check prints. `--strict` makes a file that reports nothing, finding no test files, and a
  script-style file without a matching expected output (`<name>.out`) failures. It is
  judged from outside by `loup_test/e2e.sh`, `loup_test/parity.sh` and
  `loup_cli/test_e2e.sh`;
- Stage0's `loup-bootstrap test`, the oracle twin, which drives `runTest` in-process
  as described below. (Implemented: `loup-tools/src/test/`, backed by the embedded
  `testing` + `debug.assert` stdlib modules.)

Both runners compile each test file with the build keys of the package it belongs to
(core §1-13.3, "Every driver defines the closed keys"; v1.21, v21.portable.10): its
`[options]` at their declared defaults and every closed `freestanding.*` / `build.*` /
`target.*` key, `target.*` describing the host. `--option <name>=<value>` (repeatable)
supplies an option value to every test file, validated as `loup build --option` is; the
self-hosted runner passes each test file to `loup run` as `--package-of`, so a driver it
generates elsewhere still reads the test file's package. A module of a dependency the test
file imports reads ITS package's options (core §1-13.3, "A package's options are its own";
v1.21, v21.portable.13): at their declared defaults unless `--option <package>.<name>=<value>`
or the test file's package manifest (`[options."<package>"]`) sets them.

### §23.1 Discovery

A **test** is a top-level function whose name begins with `test_` and that takes
no parameters. Test files are found by the manifest's `test.pattern` (and the
project `tests/` directory), or a single file via `loup test --file <path>`. Each
file is compiled to MIR and its `test_*` functions are collected
(`extract_test_functions`). `gen func` / `async func` tests are detected from the
function shape.

### §23.2 Execution model

For each discovered test, the runner compiles the file **augmented in-memory**
with an injected harness:

```loup
from testing import (runTest, TestResult);
func loupTestHarnessEntry(): TestResult {
    return runTest("<test name>", func(): void { <test_fn>(); });
}
```

It then runs `loupTestHarnessEntry` in a fresh isolated runtime
(`execute_named`), reads back the returned `TestResult`, and maps its
`TestOutcome` to the CLI status. The test body is wrapped in an anonymous `func`
so it is passed to `runTest` as an `fn(): void` value. This is why the framework
— not a parallel reimplementation — defines execution semantics: `runTest`'s
try/catch is what turns a thrown exception into a recorded failure.

Each test runs in its own `IsolatedRuntime` (isolation between tests), under a
wall-clock timeout enforced by the runner, with stdout/stderr captured.

### §23.3 Outcome mapping

| Framework `TestOutcome` | CLI status | Source |
|---|---|---|
| `PASS` | pass | test body returned normally |
| `FAIL` | fail | test body threw (e.g. `debug.assert.expect*` → `AssertionError`); the message is carried through |
| `SKIP` | skipped | `skipTest(reason)` raised `SkipSignal` |

A setup/compile/harness error (the file fails to compile, or top-level code
throws) is reported as a failure distinct from an assertion. v0.6 / v1.16 error
types still receive specialized diagnostic rendering.

### §23.4 Assertions and skip

Test bodies fail by **throwing**. The `debug.assert` helpers (`expect`,
`expectEq`, `expectThrows`, …) throw `AssertionError`; `runTest` catches it and
records FAIL. `testing.skipTest(reason)` raises `SkipSignal`, which `runTest`
catches ahead of the generic handler and records SKIP. `testing.TestFailure(testName,
details)` is an `Exception` whose message is `"<testName>: <details>"` (fields
`testName`, `details`), for helpers that know which test they are checking;
`runTest` records it as a FAIL like any other exception.

`runTest` times each test on the monotonic clock: `TestResult.durationNs` is the
nanoseconds the test took (a skipped test included), and
`TestSummary.totalDurationNs` sums its results' durations.

### §23.5 Reporters

Results render in `pretty` (default), `json`, and `junit` formats with pass /
fail / skip counts; `loup test` exits non-zero if any test fails.

### §23.6 Known limitations

- `gen func` / `async func` tests: the harness currently calls the test as a
  plain `fn(): void`, so a generator's body is not yet driven to exhaustion and
  an async test's `Task` is not yet awaited (the in-process event loop is
  pending). Plain tests are fully supported. (Follow-up: `runGeneratorTest` /
  `runTestAsync` harness variants.)
- The framework `TestResult` preserves a failed test's message but not the
  original exception type, so non-assertion failures are reported under a generic
  type. (Follow-up: carry the thrown type.)
- The CLI's per-test time is its own wall-clock measurement (it includes the
  harness compile), not the framework's `durationNs`.

### §23.7 Freestanding tests (`loup test --freestanding`)

> **Stage0 twin only.** This mode exists in `loup-bootstrap test`, and the self-hosted
> `loup test` never gains it (ruling D3, 2026-10-02): native and freestanding lanes are
> driven as subprocesses from scripted `loup test` suites, so the runner's own closure
> never grows a native backend.

`loup test --freestanding <file>` runs `@mode(freestanding)` (bare-metal/kernel)
tests by compiling them to an actual freestanding binary and booting it under
QEMU — the host in-process path cannot run bare-metal code, and the host
framework's `runTest` is unusable freestanding (it uses `try/catch`, forbidden
by `E_FREESTANDING_EXCEPTIONS`).

**Authoring.** A freestanding test file is:

```loup
@mode(freestanding)
from debug.assert_fs import (expectFs, expectEqFs);

func test_math(): void { expectEqFs(2 + 2, 4, "math"); return; }
```

Tests are the usual `test_*` zero-param functions. Assertions come from
`debug.assert_fs` — **no exceptions**: a failing `expectFs(cond, msg)` /
`expectEqFs(a, b, msg)` sets a module-global fail flag instead of throwing.

**Execution.** For each test file the runner generates a complete freestanding
program — the test file + the `debug.assert_fs` accessors + a generated
`kernelMain` that, per test, resets the fail flag, calls the test, and writes
`<name>: PASS|FAIL` to the COM1 serial port, then a `LOUPTEST-DONE` sentinel and
the QEMU `isa-debug-exit` — plus a boot trampoline. It builds via `loup build`
(freestanding target), boots `qemu-system-x86_64 -kernel … -serial file:… -device
isa-debug-exit`, and parses the serial log back into the normal report. A missing
`LOUPTEST-DONE` (hang/crash) fails the affected tests rather than passing them.

**Scope/limitations.** x86_64 only (the boot scaffold + COM1 serial are
x86-specific; aarch64/PL011 is a follow-up). All a file's tests run in one binary
sequentially (a crash aborts the rest). Failure messages aren't carried over
serial yet (PASS/FAIL only); numeric summaries and richer asserts are follow-ups.
Requires `qemu-system-x86_64` on PATH.

### §23.8 Native tests (`loup test --native`)

> **Stage0 twin only.** This mode exists in `loup-bootstrap test`, and the self-hosted
> `loup test` never gains it (ruling D3, 2026-10-02): native and freestanding lanes are
> driven as subprocesses from scripted `loup test` suites, so the runner's own closure
> never grows a native backend.

`loup test --native <file>` runs `@mode(host.native)` / `@compiled` tests through
the real **native AOT pipeline** — the same `loup build` path the CLI uses
(resolve + typecheck + native LLVM codegen + `clang` link) — rather than the
default in-process interpreter. This exercises the code generator a native
program actually ships through. `--mode host.native` selects the same path.

**Auto-routing in the default run.** A plain `loup test` (no `--native`) also
routes native test files through this pipeline automatically: each discovered
test file whose source carries `@mode(host.native)` — or a bare `@compiled` with
no other `@mode(...)` — is sent to the native path, while every other file
(undecorated, `host.scripted`, `host.dual`, `web.*`) runs in-process as before.
Both sets are merged into one report. The runner prints a one-line note
(`routing N test(s) in M host.native file(s) through the native AOT pipeline`)
when any file is routed. `--native` forces *all* discovered files through the
native path regardless of directive.

**Authoring.** A native test file carries `@mode(host.native)` (or `@compiled`)
and the usual `test_*` zero-param functions. A test *fails by throwing*: any
uncaught exception (e.g. from an assertion helper) marks the test failed; a test
that returns normally passes.

```loup
@mode(host.native)

class TestFail : Exception { pub func init(m: string): void { self.message = m; } }
func check(cond: bool, msg: string): void { if (not cond) { throw TestFail(msg); } }

func test_math(): void { check(2 + 3 == 5, "math"); return; }
```

**Execution.** Each test becomes its **own native binary**: the runner generates
an `@compiled` program = the test file (its leading mode directive normalized to
`@compiled`) + a generated `main` that calls the single test and returns 0. It
builds with `loup build --target native --backend llvm` (the explicit backend is
required — without it the native target delegates to the wasm-packaged-app path),
runs the executable under a `timeout` backstop (coreutils `timeout` on Linux; on
macOS, which ships none, the runner enforces the same deadline in-process and kills
the test), and maps the **process exit code** to a verdict: `0` → pass; `134` → fail (the native runtime's deterministic
uncaught-exception exit — the normal failing-test path); `124` → fail (timeout);
any other nonzero or a signal (e.g. SIGSEGV) → fail (abnormal exit / crash).

One binary per test gives both per-test granularity and true isolation — a
`SIGSEGV` or `abort()` in one test can't take the rest of the run down with it.

The generated `main` does **not** wrap the test in `try/catch`: the managed
native (libc) backend cannot install a catch filter on the built-in base
`Exception` (`E-BUILD-NATIVE: catch type filter on unknown type Exception`), and
the goal is to catch *every* throwable regardless of its concrete type — so the
exception is allowed to propagate uncaught to exit 134 instead.

**Scope/limitations.** Runs on the host architecture (the binary is produced for
this machine via the `libc` foundation); cross-arch native test execution is a
follow-up. One native build + link per test — fast per test (~hundreds of ms) but
linear in test count; sharing one binary across tests needs an argv/env test
selector the native entry ABI doesn't expose yet. Failure detail is the exit-code
class (assertion messages are not yet carried out of the process). Requires a
working `clang` (`$LOUP_CLANG`, else `clang`/`clang-NN`) on the host.

### §23.9 The self-hosted runner: framework driver, corpus cases, limits, lane suites

These are behaviours of `loup-test` (`source/runtime/tools/loup_test/`), added in phase
P1 of the test re-layering. Its judges are `loup_test/e2e.sh` and `loup_test/parity.sh`.

**Driver.** A file of arg-less `func test_*()` runs through a generated driver. The
driver keeps the file's header first and imports `testing.runTest` and
`debug.assert.expect`; the bare `assert(cond, msg)` that tests call is `expect`, unless
the file declares or imports its own `assert`. Each test runs as
`runTest(name, func(): void { test(); })`, so §23.3 decides its outcome: a `skipTest`
is SKIP, and any other exception is FAIL. Per check the driver prints
`ok: <name>` | `FAIL: <name>: <message>` | `skip: <name>: <reason>`, then
`type: <AssertionError|Exception> <name>` after a FAIL, and
`time: <durationNs> <name>`. A file that calls its own `main()` or tests at top level
runs once, as written. A test, a `cases_` function and `main` are found whatever
their declaration modifiers (inline annotations, `pub`, `safe`, `async`, `gen`,
`const`), as Stage0's runner finds every top-level `test_*` function: a
`safe func test_x()` — the form a test takes when it calls a `modifier` method on a
shared object (FIELD-1) — is a test like `func test_x()` (merge 30c; `e2e.sh`
step "declaration modifiers").

**Corpus tests.** `func test_<x>(c: string)` with a sibling
`func cases_<x>(): list[string]` is a corpus test. Each case is its own check,
`test_<x>[<case>]`, and runs in its own process under the case timeout.

**Limits.** The nearest `loup-test.toml` at or above a test file sets the limits for
every test below it. A flag on the command line wins over the file. The file holds
`key = value` lines; `#` comments must be on their own line.

| Key | Meaning |
|---|---|
| `timeout` | Seconds per whole-file job. The default is 60. |
| `case-timeout` | Seconds per corpus case. The default is `timeout`. |
| `max-mem` | MB of address space per run. The default is 4096. |
| `louppath` | `:`-separated roots, relative to the toml. |
| `allow-skip` | The checks `--strict` lets skip (below). It adds to `--allow-skip`. |

**Strict and skips.** A skipped check judged nothing, so under `--strict` it never
counts toward a pass. A file with a skipped check FAILS, whether its other checks
passed or every check skipped, unless the allow-list names that check. The allow-list
is the union of `allow-skip` in the file's `loup-test.toml` and `--allow-skip <names>`.
Each takes comma-separated entries:
- an exact check name (`test_x`, `test_x[<case>]`);
- `<prefix>*`, which matches every check whose name starts with the prefix;
- `*`, which matches every check.

An allowed skip still reports as a skip: the file is SKIP when every check skipped,
else PASS. Without `--strict`, a skip never fails a file.

**Environment.** Every job gets two variables:
- `LOUP_TEST_FILE`: the test file itself.
- `LOUP_TEST_TMP`: a fresh directory, inside the run's scratch directory (by default
  under `~/.cache/loup-test`, never `/tmp`). It is removed after the job.

**Reports.** `--format json` uses Stage0's per-test schema (ruling D4): one result per
check (`name` = `<file>::<check>`, `status`, `duration_ms`, `error {type, message, trace}`),
plus the file verdicts. `junit`'s `<failure type>` is the exception that `runTest`
caught.

**Lane suites (ruling D3).** `loup test` never runs a program on a native or
freestanding lane itself. A suite in `tests/lanes/<lane>_test.lpscr` builds each
corpus program on its lane AS A SUBPROCESS, runs it, and compares the program's stdout
and exit code with its golden. It does this through the `testkit` package
(`source/packages/testkit/`: `lanes`, `golden`, `scratch`, `proc`). testkit is not on
the exclusion list, and `loup_test_closure.py --check` fails if an edge from the
closure reaches it.

A missing lane tool is a SKIP. A tool that fails, or a tool variable that names nothing
executable, is a FAIL. The routine gate of a test root (`tests/lib/loup_test_gate.sh`)
fails on any skip.

**Known limits.**
- The self-hosted interpreter's `exec` does not pass a `sh -c` argument intact, so
  testkit runs every command from a script file.
- Concurrent self-hosted interpreters share their `exec` capture files, so do not run
  tests that call `exec` under `--jobs` greater than 1.
- Stage0's `loup-bootstrap test` does not yet discover corpus tests.
