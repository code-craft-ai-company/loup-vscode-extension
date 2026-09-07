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
- [§13 Result Model](#13-result-model)
- [§14 Text Result Recorder](#14-text-result-recorder)
- [§15 Verification and Assertions](#15-verification-and-assertions)
- [§16 Mocking Framework](#16-mocking-framework)
- [§17 Property-Based Testing](#17-property-based-testing)
- [§18 Tandem Validators](#18-tandem-validators)
- [§19 Diagnostics](#19-diagnostics)
- [§20 Test Run Timeout](#20-test-run-timeout)
- [§21 Debugging Support](#21-debugging-support)
- [§22 Configuration](#22-configuration)
- [§23 CLI Integration (loup test)](#23-cli-integration-loup-test)
- [§24 Extension Points (Integration Package)](#24-extension-points-integration-package)

---

## §1 Overview and Architecture

The `testing` module is Loup's foundation test framework, shipping with the runtime as part of the standard library. It provides everything needed to write, discover, execute, and report on tests without any external packages.

### §1.1 Design Principles

The framework follows a two-tier architecture:

- **Tier 1 (this module):** Core test execution shipped with the runtime. Handles discovery, sequencing, execution, assertions, property testing, mocking, markers, feature tags, dependency injection, constraints, tandem validators, text output, and CLI integration.
- **Tier 2 (`testing.integration` package):** Deferred to a separate installable package. Adds integration/configuration couplings, build/job/pipeline metadata, HTML rendering, result streaming, progress concentrators, and diagnostic capture.

The `TestJob` is intentionally simple — it handles test discovery → sequence generation → execution → results without requiring job/build/pipeline metadata. An extensible factory protocol allows `testing.integration` to provide an `IntegratedTestJob` with full reporting capabilities.

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

The `testing` module depends on the following stdlib modules:

| Dependency | Usage |
|---|---|
| `core.time` | `Duration`, `Instant` for timing and timeouts |
| `core.waiting` | `WaitGate`, `waitForIt` for tandem validators and polling |
| `core.reflect` | Function signature introspection for injection |
| `core.math` | Random number generation for property testing |
| `io.fs` | File system scanning for test discovery |
| `io.path` | Path manipulation for module resolution |
| `data.json` | JSON serialization for result recording |
| `structures` | `OrderedDictionary` for ordered result data |

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

    /// Collect test references matching the given include expression.
    /// May be called multiple times with different expressions; results accumulate.
    pub func collectReferences(expression: string): void;

    /// Apply metadata filters, build the final test tree.
    pub func finalizeCollection(): void;

    /// Resolve all parameter origins in the injection registry.
    /// Throws UnknownParameterError if unresolved parameters remain.
    pub func collectInjectionsAndConfigurations(): void;

    // Properties
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
// Walks up the directory tree looking for __testroot__.loup.
// Throws ConfigurationError if the filesystem root is reached.

pub func findTestModuleFullName(modulePath: string, testRoot: string? = none): string;
// Computes the dotted module name relative to the test root's parent.
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
// Returns: (package, module, testClass, testName)
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

The DI system manages resolution, instantiation, and lifecycle of injectable resources during test execution. It provides a hierarchical scope tree for parameter visibility and supports multiple resource lifespans.

### §4.1 InjectionRegistry

The singleton registry managing all registered sources, origins, and the scope tree.

```loup
pub class InjectionRegistry : Any {
    // Singleton
    static var _instance: InjectionRegistry?;
    pub static func instance(): InjectionRegistry;

    // Source tables
    var _integrationSources: dict[func, IntegrationSource];
    var _resourceSources: dict[func, ResourceSource];
    var _configurationSources: dict[func, ConfigurationSource];
    var _validatorSources: dict[func, ValidatorSource];

    // Scope tree
    var _scopeRoot: InjectionScope;

    // Tracking
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
    Session;   // Lives for the entire test session
    Package;   // Lives within a module hierarchy
    Test;      // Created and destroyed per test
    Task;      // Lives within a task scope
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
    // logValidator runs in parallel, finalized after test completes
}
```

### §5.4 @integrationFactory / @configurationFactory / @validatorFactory

```loup
// Integration factory — yields an IntegrationCoupling subclass
@integrationFactory(constraints = deviceConstraints)
gen func provideDevice(): Iterable[DeviceIntegration] {
    let device = DeviceIntegration.discover();
    yield device;
    device.disconnect();
}

// Configuration factory — yields a ConfigurationCoupling subclass
@configurationFactory()
gen func provideConfig(): Iterable[TestConfig] {
    let config = TestConfig.load();
    yield config;
}

// Validator factory — returns a ValidatorCoupling subclass
@validatorFactory()
func provideLogValidator(): LogValidator {
    return LogValidator.new();
}
```

### §5.5 Global Parameter Origination

For resources shared across multiple tests at package or session scope:

```loup
// At module level — creates a Package-scoped parameter
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

The constraints system passes configuration parameters and feature requirements from external sources to resource factories.

### §6.1 Constraints Type

```loup
pub class Constraints : Any implements IReadableMap[string, Any] {
    // Dictionary-like container for key-value constraint pairs
    pub static func new(**kwargs: Any): Constraints;

    /// Returns a new dict with original values updated by the provided arguments.
    /// Does NOT modify the original.
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
    ): string;  // Returns the constraint key

    pub func lookupConstraints(key: string): Constraints?;
    // Override constraints take precedence over site constraints.

    pub func pruneConstraints(keepScopes: list[string]): void;
}
```

### §6.3 ConstraintsOrigin

```loup
pub enum ConstraintsOrigin {
    SiteParameter;      // Default constraints from site configuration (lower priority)
    OverrideParameter;  // Runtime overrides (higher priority)
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
// Merges multiple constraint sets. Last value wins for duplicate keys.
```

---

## §7 Markers and Metadata Filtering

Annotations for tagging tests with categories, keywords, and priority, plus filter types for selecting tests based on metadata.

### §7.1 Marker Annotations

```loup
@markCategories(categories = ["smoke", "regression"])
@markKeywords(keywords = ["login", "auth"])
@markPriority(priority = 1)
func test_user_login(): void {
    // ...
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

A hierarchical, type-safe mechanism for categorizing and filtering objects based on feature capabilities.

### §8.1 FeatureTag

```loup
pub class FeatureTag : Any {
    pub static let ID: string;  // Auto-generated from class hierarchy

    // ID is generated from __qualname__: lowercase, dots → slashes
    // e.g., class Connectivity.WiFi → "connectivity/wifi"
}

// Usage: define feature tags as nested classes
class DeviceFeatures {
    class Connectivity : FeatureTag {
        class WiFi : FeatureTag {}
        class Bluetooth : FeatureTag {}
    }
    class Display : FeatureTag {
        class HDR : FeatureTag {}
    }
}
// DeviceFeatures.Connectivity.WiFi.ID == "devicefeatures/connectivity/wifi"
```

### §8.2 FeatureAttachedObject

Mixin that adds feature tag support to any type.

```loup
pub class FeatureAttachedObject : Any {
    var _featureTags: list[string];  // Sorted for efficient lookup

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
    // Includes items with ALL required features and NONE of excluded features.
}
```

---

## §9 Test Sequencing and Scope Management

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
    var _scopeStack: list[(string, string)];  // (scopeName, scopeId)
    var _testTree: TestGroup?;
    var _sequenceDocument: string?;

    pub static func new(
        title: string,
        testRoot: string,
        includes: list[string] = [],
        excludes: list[string] = [],
        metafilters: list[MetaFilter] = []
    ): TestSequencer;

    // Discovery
    pub func discover(testModule: Any? = none): int;
    // Returns count of discovered tests.

    // Sequence document generation
    pub func generateTestrunSequenceDocument(outputFilename: string): void;

    // Execution
    pub func executeTests(runId: string, recorder: ResultRecorder): void;
    // Compiles and executes the sequence document via runtime.compile().

    // Scope management
    pub func enterSessionScopeContext(): SequencerSessionScope;
    pub func enterModuleScopeContext(scopeName: string): SequencerModuleScope;
    pub func enterTestSetupContext(testName: string): SequencerTestSetupScope;
    pub func enterTestScopeContext(testName: string, notables: dict[string, Any]? = none): SequencerTestScope;

    // Scope ID management
    pub func scopeIdCreate(): (string, string);  // (parentId, scopeId)
    pub func scopeIdPush(scopeName: string, scopeId: string): void;
    pub func scopeIdPop(scopeName: string): void;
    pub func getTopScopeId(): string;

    // Tree navigation
    pub func findTreeNodeForScope(scopeName: string): TestGroup | TestRef | none;

    // Properties
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
    // Pushes scope ID, logs "SESSION ENTER: {scopeId}"

    pub func scope_exit(error: Option[Any]): bool;
    // On SkipError: marks all descendants as skipped
    // On other exception: marks all descendants as errored
    // Always: finalizes scope node, pops scope ID
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
    // Creates scope ID, records TestContainer, logs "MODULE ENTER"

    pub func scope_exit(error: Option[Any]): bool;
    // On SkipError: marks descendants as skipped
    // On other exception: marks descendants as errored
    // Always: finalizes scope node, pops scope ID
}
```

### §9.5 SequencerTestSetupScope

```loup
pub class SequencerTestSetupScope : Any implements Scoped[SequencerTestSetupScope] {
    let sequencer: TestSequencer;
    let recorder: ResultRecorder;
    let testName: string;
    let scopeName: string;  // "setup:{testName}"

    pub func scope_enter(): SequencerTestSetupScope;
    pub func scope_exit(error: Option[Any]): bool;
    // On SkipError: marks the test as skipped
    // On other exception: marks the test as errored
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
    // Creates scope ID, creates TestResult, previews with recorder

    pub func scope_exit(error: Option[Any]): bool;
    // SkipError → SKIPPED
    // AssertionError → FAILED
    // Other exception → ERRORED
    // No exception → PASSED
    // Always: finalizes result, records with recorder, pops scope ID
    // Returns true (suppresses exception propagation)

    // Activity tracking
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

The sequencer generates an executable Loup source file (the "sequence document") that encodes the test execution order, parameter provisioning, and scope management. This document is then compiled and executed via `runtime.compile()`.

### §10.1 Generation Process

1. **First pass:** Write the document to a temporary file, collecting factory imports and constraint imports.
2. **Second pass:** Read the temporary file, insert collected imports at designated insertion points, write the final document.
3. **Cleanup:** Remove the temporary file.

### §10.2 Document Structure

The generated document contains:

```loup
// Code-generated test sequence document — do not edit manually.

from testing.constraints import ConstraintsCatalog;
from logging import getLogger;

// ------- INSERT CONSTRAINT IMPORTS HERE -------
// ------- INSERT FACTORY IMPORTS HERE -------

let logger = getLogger();
let constraintsCatalog = ConstraintsCatalog.instance();

/// Entry point for the test run sequence document.
func session(sequencer: TestSequencer): void {
    with (ssc = sequencer.enterSessionScopeContext()) {
        // Session-level parameter loops
        for (param in sessionFactory()) {
            scope_tests_unit(sequencer, param);
            scope_tests_integration(sequencer, param);
        }
    }
    return;
}

func scope_tests_unit(sequencer: TestSequencer, param: SomeType): void {
    with (msc = sequencer.enterModuleScopeContext("tests.unit")) {
        // Module-level parameter loops
        // Test scope blocks
        // ================ Test Scope: test_example ================
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
    // ...
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

    /// Full test run lifecycle.
    pub func execute(): int;
    // Returns 0 for all passed/skipped, -1 for failures/errors.

    /// Query mode — discover tests without executing.
    pub func query(): list[TestRef];

    // Lifecycle hooks (overridable)
    pub func begin(): void;
    pub func finalize(): void;

    // Factory methods (overridable)
    pub func createSequencer(): TestSequencer;
    pub func createRecorder(): ResultRecorder;

    // Scoped interface
    pub func scope_enter(): SimpleTestJob;
    pub func scope_exit(error: Option[Any]): bool;

    // Properties
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
// In testing.factories module
var _currentFactory: TestJobFactory = DefaultTestJobFactory();

pub func setTestJobFactory(factory: TestJobFactory): void;
pub func getTestJobFactory(): TestJobFactory;
```

### §12.4 Integration Package Usage

The `testing.integration` package (Tier 2) provides:

```loup
// In testing.integration (separate package, not in stdlib)
pub class IntegratedTestJobFactory : Any implements TestJobFactory {
    pub func createTestJob(config: TestJobConfig): SimpleTestJob {
        return IntegratedTestJob.new(
            // ... config fields plus:
            // buildInfo, pipelineInfo, jobInfo, renderInfo, forwardingInfo
        );
    }
}

// Registration at package init:
from testing.factories import setTestJobFactory;
setTestJobFactory(IntegratedTestJobFactory());
```

---
