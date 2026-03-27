# Loom Language Specification v0.4

**Status:** Working draft  
**Purpose:** Scripting + code generation with strong typing and first‑class templating

> This revision builds on v0.3 and closes five open problems identified in the v0.3 evaluation:
> **(1) Enum/`Any` boundary** — `match` over `Any`-typed enum values is now precisely specified,
> `system.reflect` gains `Type.variants()` and `VariantInfo` for enum introspection, and the
> boundary coercion rules for enums are made fully explicit; **(2) `await group { spawn }`** — a
> new block statement replaces the API-only `TaskGroup.collect` for heterogeneous parallel work,
> giving structured concurrency a first-class syntactic form; **(3) `ComponentRegistry`** — the
> ambiguous PascalCase scope-scan rule for `html` template fences is replaced by an explicit
> `components=` descriptor key that accepts a `ComponentRegistry` value, making component resolution
> deterministic, composable, and library-friendly; **(4) `@jsexport`** — a new annotation marks
> Loom functions as callable from JavaScript, specifying marshalling, async wrapping, and error
> propagation rules for the inbound FFI direction; **(5) standard library** — four new pure-computation
> modules (`system.text`, `system.json`, `system.time`, `system.collections`) provide the utilities
> every script, service, and generator needs on day one. The grammar is updated throughout.

---
## Design Goals
- **Embeddable syntaxes:** The language is built so that other language syntaxes (Python, TypeScript, HTML, SQL, etc.) are easy to **embed** directly via template literals ("template fences"), with formatting and interpolation.
- **Runs anywhere:** The language is meant to run at **any layer of the stack**—CLI tools, servers, services, and **in the web browser**. A portable bytecode target (e.g., WebAssembly with GC+EH) is anticipated to ensure broad deployability and sandboxing.
- **Type‑forward:** The language emphasizes **types, interfaces, and type safety**. It supports primitives, classes, nominal interfaces, reified generics, sum types, and reflection—balancing safety with dynamic capabilities for scripting and generation workflows.
- **Progressive adoption:** The language is one coherent model, but its tooling and documentation should let users begin with a small script-first surface and adopt advanced features only when needed.
- **Dynamic debuggability:** The runtime is designed to support native tracing, in-process time-travel capture, and remotely activated debugging via named portals and callable entry points.
- **Explicit meaning:** Core syntax avoids "magic fallback" behaviors. Where dynamic behavior exists, it is opt‑in and syntactically explicit.
- **Cross-platform viability:** The language and its toolchain are designed to work uniformly across CLI tools, server applications, and the web browser. Platform-specific capabilities are capability-gated and enforced at build time via platform profiles.

---
## 1) Execution Model
- **Cooperative, single-threaded runtime** with first-class `async`/`await`.
- Async work is represented by `Task[T]` values and scheduled on the host event loop.
- Loom code runs until it reaches an explicit suspension point (`await`) or completes.
- Compiles to **portable bytecode** (e.g., Wasm GC+EH target envisioned; finalization later).
- Evaluation is deterministic between suspension points; external I/O completion order may affect when suspended tasks resume.
- When a debug server or trace hook is active, the runtime may maintain rolling trace history for time-travel debugging.
- Named `portal` statements and callable entry points may activate trace capture for the current task/thread of execution.
- Failures are hard by default; see failure policy below.

---
## 2) Core Syntax: Blocks, Statement Termination, Control Flow

### Blocks & Scope
- **Blocks = Braces:** `{ ... }` introduce lexical scope.
- Declarations are visible after their point of declaration; inner bindings shadow outer.

### Statement Termination
Loom distinguishes **simple statements** and **block statements**:

- **Simple statements end with `;`.**
- **Block statements do not end with `;`.**

Examples:
```text
let x = 1;                 // simple
x = x + 1;                 // simple

if (x > 0) {               // block
  x = x - 1;
}                          // no semicolon here
```

### Conditionals
```text
if (cond1) {
  ...
} else if (cond2) {
  ...
} else {
  ...
}
```
`cond` must be `bool` (compile‑time error if known otherwise; runtime `TypeError` if dynamic and not `bool`).

### Loops
- `while (cond) { ... }`
- `for (init; cond; step) { ... }`
- `for (x in xs) { ... }` (iterates any `Iterable[T]`)
- `do { ... } while (cond);` *(note: this construct includes a trailing `;` as part of its syntax)*

### Named Loops (Labels)
Attach a label immediately before a loop:
```text
outer: for (let i = 0; i < n; i = i + 1) { ... }
outer: while (cond) { ... }
outer: for (x in xs) { ... }
outer: do { ... } while (cond);
```
`break outer;` exits the **labeled** loop.  
`continue outer;` goes to that loop's next iteration (running any `defer`s on the way out).  
Labels have their own namespace; referencing an unknown label is an error.

### `defer` (Scope‑bound Cleanup)
- Runs when the **current lexical block ends** (fallthrough, `return`, `break/continue`, or exception).
- Multiple `defer`s execute **LIFO**.
- In async code, deferred actions may themselves use `await`; scope exit awaits each deferred action to completion in LIFO order.

**Forms:**
```text
defer close(handle);      // call form (simple statement)

defer {                   // block form (block statement)
  log("leaving");
}
```

Exceptions inside a deferred action propagate unless caught by an outer `try { ... } catch { ... }`.

### `with` (Scoped Resource)
```text
with (fh = runtime.fs().open("out.txt")) {
  fh.write("ok");
} // fh is closed at block end
```
(`runtime` is the runtime capability root; see section 10.)

### `portal` (Time-Travel Activation Point)
`portal` is a reserved keyword that injects a named activation point into the program for native tracing and time-travel debugging.

```text
portal request_start {
  ...
}

portal "checkout.enter" {
  ...
}
```

Rules:
- `portal name { ... }` is a block statement.
- `name` may be an identifier or string literal. Portal names are runtime strings.
- Entering the portal means control is about to enter the portal body.
- The portal body executes normally and introduces lexical scope through its enclosed block.
- Duplicate portal names are permitted. A runtime activation by name matches every explicit or implicit portal with that name.
- All conditional activation and single-use behavior is supplied dynamically by the debugger/runtime, not in source code. Portal syntax has no source-level `if` or `once` form.
- If a portal is entered and a matching runtime activation exists, tracing starts for the entering task/thread when the activation condition evaluates to true.
- If the activation condition evaluates to false, the portal is observationally inert and program execution continues unchanged.

#### Callable portals
All callables are implicit portals at entry:

- Named functions and methods have stable portal names based on their fully qualified callable names.
- Anonymous callables may have implementation-defined debug portal names.
- Explicit `portal` statements and implicit callable portals share the same runtime activation registry.

### Async functions and `await`
Loom supports asynchronous functions and explicit suspension via `await`.

```text
async fun buildPage(): Task[string] {
  let userTask = fetchUser();
  let postsTask = fetchPosts();

  let user = await userTask;
  let posts = await postsTask;
  return renderPage(user, posts);
}
```

Rules:
- `async fun name(...): T { ... }` declares a function whose call result is `Task[T]`.
- Calling an async function starts the task immediately and returns its `Task[T]`.
- `await expr` requires `expr` to have type `Task[T]`; it suspends the current async context until the task completes and then evaluates to `T`.
- If the awaited task fails, `await` rethrows that failure at the await site.
- `await` is permitted inside `async fun` bodies, entry scripts, REPL sessions, and async template rendering contexts; imported modules may not suspend during initialization.
- Programs that do not call `Task[T]`-returning APIs remain entirely synchronous; `async`/`await` is intended to be adopted incrementally rather than imposed on all code.
- Loom remains single-threaded at the language level; task interleaving occurs only at explicit suspension points.
- `try`/`catch`, `finally`, `defer`, and lexical scope behave the same across suspension as they do in synchronous code.

### `match` (Pattern Matching)
`match` is an expression that branches on the variant of a sum type (see section 6). The compiler enforces exhaustiveness: every variant of the matched type must be covered, or a wildcard `_` arm must be present.

```text
match expr {
  Pattern1       => expr1,
  Pattern2(x)    => expr2,
  Pattern3(a, b) => expr3,
  _              => exprDefault,
}
```

Rules:
- `match` is an **expression**; all arms must have a compatible type. The result type is the common supertype of all arm expressions, or a compile-time error if no common type exists.
- `match` is a **block statement** (no trailing `;` on the `match` construct itself; when used as the right-hand side of a `let` or assignment, the `;` belongs to the enclosing simple statement, not to `match`).
- Patterns may be:
  - Variant names with no payload: `None`, `Point`
  - Variant names with positional payload bindings: `Some(x)`, `Circle(r)`, `Rect(w, h)`
  - Variant names with named payload bindings: `Circle { radius: r }`
  - Wildcard: `_` (matches anything, binds nothing)
  - Guard: `Some(x) if (x > 0)` — the guard expression must evaluate to `bool`
- Patterns are matched top-to-bottom; the first matching arm executes.
- Bindings introduced in a pattern arm are scoped to that arm's expression only.
- Exhaustiveness is checked at compile time for enum types whose variants are statically known. A `match` over `Any` requires a wildcard arm.
- When `match` is applied to an `Any`-typed value that holds a boxed enum, dispatch proceeds on the actual runtime enum type: each arm pattern is matched against the boxed enum's actual variant. If no arm matches and no wildcard is present, a runtime `MatchError` is thrown. See section 6 for the full enum/`Any` boundary rules.
- Nested patterns are supported: `Ok(Some(x))` matches `Result[Option[T], E]` where the value is `Ok` and the inner `Option` is `Some`.

Example:
```text
let area: float = match shape {
  Circle(r)    => 3.14159 * r * r,
  Rect(w, h)   => w * h,
  Point        => 0.0,
};
```

#### `match` in templates
`match` expressions are permitted inside template inline expressions and directive blocks:

```text
{$ match status { Active => "active", Inactive => "inactive", _ => "unknown" } $}

{% match result %}
  {% Ok(v) => %}
    <p>Result: {$ v $}</p>
  {% Err(e) => %}
    <p class="error">{$ e.message $}</p>
{% end %}
```

---
## 3) Multiline Strings (Text‑First)
- **Delimiters:** `"""( ... )` or `'''( ... )` (descriptor parentheses optional when defaults are used).
- **Left‑Alignment Anchor `P`:** `P` is the exact whitespace (spaces/tabs) **before** the opening triple quotes on its line.
  - **Every content line must start with `P`** → otherwise `E_MLS_ALIGN`.
  - The parser strips exactly **one** `P` prefix from each content line.
  - The newline **after** the opener is **not** included.
  - The closing delimiter line must be exactly `P + """` (or `P + '''`) on its own line.
  - The newline right before the closer is **not** included.
  - A line that equals exactly `P` becomes an empty line in the resulting string.

### Formatting Parameters
- `indent_type`: `"space"` | `"tab"` (default `"space"`). *Unit for `indent`.*
- `indent`: default **no shift**; `+N` adds N units of `indent_type` to each **non‑blank** line; `-N` removes up to N units of that type from **non‑blank** lines.
- `eol`: `"source"` (default) | `"LF"` | `"CRLF"` — normalization applied **after** anchoring/indent.

---
## 4) Templates and Interpolation

Loom provides two text-generation forms:
- **Interpolated strings** for lightweight text output that immediately produce `string`
- **Template fences** for structured, formatter-aware generation that produce a **`system.template.Template` value**

Neither form executes the contained foreign code.

### Interpolated strings
Single-quoted and double-quoted strings may embed inline expressions using the default `{$` / `$}` delimiters:

```text
let greeting = "Hello, {$ name $}";
let path = 'out/{$ fileStem $}.txt';
```

Interpolated strings:
- produce `string`
- use the same inline-expression rendering rules as template fences
- support filters/pipes and trim flags
- do **not** support directives, formatter descriptors, or alternate delimiters
- are surface sugar for a text template rendered immediately with `RenderContext(language="text", format="none")`
- if an embedded expression uses `await`, the enclosing evaluation context must be async
- are the recommended default for everyday text generation and beginner-facing examples

Use template fences when you need block directives, alternate delimiters, or formatter-aware output.

### Template fences
The 4‑backtick wrapper below is only to display triple‑backticks in this document:
````text
```(language):(format)
... content ...
```
````

Fences follow the same anchor `P` alignment rule as multiline strings.

### Descriptors
- `language`: e.g., `py`, `ts`, `js`, `html`, `md`, `sql`, `go`, `rust`, `sh`, ...
- `format`: `prettier`, `black`, `gofmt`, `rustfmt`, `none` (default `none`)
- `indent_type`, `indent`, `eol` with identical semantics to multiline strings.
- `components`: a `system.ui.ComponentRegistry` expression; valid only when `language` is `html`. Enables component tag resolution in the fence body. See section 9 for full rules.

#### Alternative delimiters (meta‑templating)
To support nested/meta templating, a fence may override directive/expression delimiters:

- `stmt_open`, `stmt_close` (default `{%` / `%}`)
- `expr_open`, `expr_close` (default `{$` / `$}`)

Example:
````text
```(html):(format=prettier, stmt_open="[[", stmt_close="]]", expr_open="<<", expr_close=">>")
[[ if (users.isEmpty()) ]]
  <p>No users.</p>
[[ end ]]
```
````

Delimiter requirements:
- Each opener/closer must be non‑empty.
- `stmt_*` delimiters must not equal `expr_*` delimiters.
- Parsers match delimiters **exactly** (no normalization).

### Inline expressions
Using the active `expr_open`/`expr_close` pair:
- `{$ expr $}` inserts the **rendered** result.
- Trim flags: `{$- expr -$}` trims surrounding whitespace/newlines.
- Filters/pipes: `{$ expr | upper | wrap("<b>","</b>") $}`.
- `await` may appear inside inline expressions during async evaluation.

#### Rendering semantics
Inline insertion uses the template's **render context** (`language`, `format`, etc.):

- `Task[T]` values are never auto-awaited; authors must write `await` explicitly.
- Unboxed primitives are accepted directly; template insertion auto-boxes them at the render boundary.
- If the value is a class instance (boxed value) and implements `system.template.Renderable`, its `render(ctx)` is used.
- Otherwise, a default render is used:
  - `string` inserts as-is
  - `bytes` insert as a lossy/explicit encoding only via filters (by default `bytes` insertion is an error unless converted)
  - other primitives render via their associated boxed types (`Int`, `Float`, ...) without requiring authors to call `Int.box`, `Float.box`, etc.
  - other objects render via `Any.render()` default (see section 6)

### Template directives
Using the active `stmt_open`/`stmt_close` pair:
- Directive lines start with `stmt_open` (after anchor `P`) and end with `stmt_close`.
- **Blocks** open with a directive and close by `{% end %}` (or `{% end <n> %}`).
- During async rendering, directive conditions and expressions may use `await`.

Supported control flow:
```text
{% if (cond) %} ... {% elif (cond) %} ... {% else %} ... {% end %}
{% while (cond) %} ... {% end %}
{% for (init; cond; step) %} ... {% end %}
{% for (x in xs) %} ... {% end %}
{% do %} ... {% while (cond) %} ... {% end %}    // do/while emitter
{% match expr %} {% Variant(x) => %} ... {% end %}  // match emitter
```

Named loops:
```text
{% outer: for (let i=0; i<n; i=i+1) %} ... {% end %}
{% break outer %} / {% continue outer %}
```

Try/catch emitter (buffered):
```text
{% try %} ... {% catch (Type | Other as err) %} ... {% finally %} ... {% end %}
```

#### Compute‑only statements (emit nothing)
- Declarations:
  - `{% let x = expr; %}`
  - `{% var acc = 0; %}`
- Explicit side‑effect expressions:
  - `{% do expr; %}`

Bare expression statements in templates are **not permitted**; use `do` to make side effects explicit.

### Escaping
Emit literal delimiter openers by prefixing with backslash:
- `\{%` and `\{$` for the default delimiters
- or, generally, `\` + `stmt_open` / `\` + `expr_open` when alternative delimiters are in effect

### Failure Policy (Templating)
- **Hard fail by default** (evaluation errors, formatter errors, bad descriptors) for both interpolated strings and template fences.
- **Emitter try/catch (buffered):**
  - The `try` body **buffers**; on failure emits **nothing**.
  - An **empty** `catch` body swallows the error (no output).
- **Emitter try/catch** is available only inside template fences.
- `render` and `renderWith` fail if template evaluation reaches `await`; use `renderAsync` or `renderWithAsync` for suspending template evaluation.
- `renderAsync` surfaces failures through the returned failed task; `await` rethrows them at the await site.
- **Uncatchable:** parse/lex errors and alignment violations.

### Template as a value
A template fence produces a value of type `system.template.Template`.

Minimal API sketch:
```text
namespace system.template;

class Template {
  pub language: string;
  pub format: string;

  pub fun render(scope: dict[string, Any]): string;
  pub fun renderWith(ctx: RenderContext, scope: dict[string, Any]): string;
  pub fun renderAsync(scope: dict[string, Any]): Task[string];
  pub fun renderWithAsync(ctx: RenderContext, scope: dict[string, Any]): Task[string];

  // composition
  pub fun concat(other: Template): Template;
}

class RenderContext {
  pub language: string;   // e.g., "html", "sql", "repr"
  pub format: string;     // e.g., "prettier", "none"
}
```

---
## 5) Imports, Packages, and the Native Root Namespace

### Namespace packages
- **Namespace packages (PEP‑420‑like):** dotted names map to directories; segments can be spread across multiple roots.
- First unique file wins; duplicate ambiguity is an error unless disambiguated.

Forms:
```text
from package.sub.module import (Name1, Name2 as Alias2);

from package.sub {
  modulea import (ThingA, Other as OA);
  moduleb.sub import (ThingB);
}

from . {
  modulea import (Foo);
  sub.moduleb import (Bar);
}

from ..|.. {
  packagea.modulea import (Alpha);
  packagea.moduleb import (Beta as B);
}
```

Wildcard `*` imports are disallowed (determinism).

### Package manifest (`loom.pkg`)
Every distributable package or application root must contain a `loom.pkg` manifest file. The manifest declares identity, dependencies, and platform constraints. It is consumed by the toolchain for dependency resolution, lockfile generation, and build-time platform profile enforcement.

```text
# loom.pkg — manifest format (TOML-like, line-oriented)

package   my-app
version   1.4.0
loom      ">=0.4"

[deps]
system.http  = "^2.0"
jsonschema   = "^1.4"
ui-toolkit   = "^0.8"

[dev-deps]
test-runner  = "^3.1"

[target.browser]
exclude system.fs
exclude system.proc

[target.cli]
include system.fs
include system.proc

[target.service]
include system.fs
include system.proc
include system.net
```

Rules:
- `package` names are lowercase, hyphen-separated identifiers.
- `version` follows semantic versioning (`MAJOR.MINOR.PATCH`).
- `loom` specifies the minimum required toolchain version using a version constraint expression.
- Dependency versions use constraint expressions: `^` (compatible), `~` (patch-compatible), `>=`, `<=`, exact, or range.
- A `loom.lock` lockfile is generated by the toolchain and records the exact resolved versions of all transitive dependencies. The lockfile must be committed for applications and is optional for libraries.
- **Platform profiles** (`[target.X]`) declare which `system.*` capability modules are available or excluded for a given target. The compiler enforces these at build time: code that calls a capability excluded from the active target is a compile-time error, not a runtime surprise.
- The default targets defined by the toolchain are `cli`, `browser`, and `service`. Additional targets may be declared.
- A module that does not explicitly restrict its targets may be used on any target; the toolchain infers restrictions from capability usage when possible.
- The pure-computation modules `system.text`, `system.json`, `system.time`, and `system.collections` are available on all targets without restriction and need not appear in `[target.*]` blocks.

### Reserved native root namespace: `system`
All standard library / native APIs live under the reserved root namespace `system`.

- `system` cannot be provided/overridden by user package roots.
- Examples: `system.template`, `system.reflect`, `system.fs`, `system.proc`, `system.net`, `system.debug`, `system.interop`, `system.ui`, `system.text`, `system.json`, `system.time`, `system.collections`.

---
## 6) Types, Primitives, Boxing, Any, Interfaces

### Naming
- **Primitives:** lowercase (`int`, `bool`, `string`, ...)
- **All other types:** PascalCase (`Option[T]`, `Result[T,E]`, `Task[T]`, `Any`, `Type`, `Template`, ...)

### Primitive types (unboxed, passed by value)
Primitives have native implementations and do not inherit from `Any`.

Lowercase names:
- `int`, `float`, `bool`
- `string`, `bytes`
- `list[T]`, `dict[K,V]`, `set[T]`, `tuple[...]`
- (reserved: `fn` for function values)

> "Passed by value" refers to the language's assignment/call semantics. The runtime may use
> efficient representations (handles, copy‑on‑write, etc.) as long as observable semantics match.

### Box types for primitives (boxed, class values)
Each primitive type has an associated boxed class type with a capitalized name, used for:
- class/static methods and metadata
- explicit boxing/unboxing

Examples (illustrative):
```text
class Int   : Any { pub static fun box(x: int): Int;   pub static fun unbox(x: Any): int; }
class Float : Any { pub static fun box(x: float): Float; pub static fun unbox(x: Any): float; }
class Bool  : Any { pub static fun box(x: bool): Bool;  pub static fun unbox(x: Any): bool; }
class String: Any { pub static fun box(x: string): String; pub static fun unbox(x: Any): string; }
class Bytes : Any { pub static fun box(x: bytes): Bytes; pub static fun unbox(x: Any): bytes; }
```

**Boxing is explicit in core language code.** Loom also defines a small set of boundary coercions for templates, dynamic fields, and reflection. These are surface sugar only: they desugar to explicit boxing/unboxing and do not change ordinary assignment, dispatch, or overload resolution.

### `Any` (boxed values)
`Any` is the root type for **boxed values**:
- class instances are `Any`
- boxed primitives (`Int`, `String`, …) are `Any`
- unboxed primitives (`int`, `string`, …) are **not** `Any` unless boxed

All non‑primitive types inherit from `Any`.

### Boundary coercions (surface sugar only)
At specific runtime boundaries, Loom accepts unboxed primitives and enum values for convenience:
- template insertion and interpolated strings auto-box primitive inputs for rendering
- dynamic-field writes auto-box primitive and enum values; reads auto-unbox only when the receiving type is statically known to be a primitive
- reflection writes and invocations auto-box primitive and enum inputs; typed reflection helpers may auto-unbox primitive outputs

Outside these surfaces, boxing and unboxing remain explicit.

### Default rendering on `Any`
All `Any` values support rendering for templates and meta‑output:

```text
namespace system.template;

interface Renderable {
  fun render(ctx: RenderContext): string;
}

class Any {
  // Default representation rendering. Objects may override or implement Renderable explicitly.
  pub fun render(ctx: RenderContext = RenderContext(language="repr", format="none")): string;
}
```

### Classes (non‑primitives)
All non‑primitive types are classes (capitalized). Classes may implement interfaces and carry methods.

### Sum types (`enum`)
Loom supports general sum types declared with the `enum` keyword. An enum defines a closed set of named variants, each optionally carrying a typed payload.

```text
enum Shape {
  Circle(radius: float),
  Rect(w: float, h: float),
  Point,
}

enum Tree[T] {
  Leaf(value: T),
  Node(left: Tree[T], right: Tree[T]),
}
```

Rules:
- Enum names are PascalCase. Variant names are PascalCase.
- Variants with no payload are unit variants (e.g. `Point`).
- Variants with a payload use positional or named fields; a single variant may not mix both styles.
- Enums are nominal types: two enums with identical structure are distinct types.
- Enums may be generic (`enum Tree[T]`).
- Enums are **not** classes and do not inherit from `Any` directly; they are first-class value types.
- Enum declarations are block-level declarations; they are not simple statements and do not take a trailing `;`.

#### Enum/`Any` boundary rules *(clarified in v0.4)*
When an enum value is stored in an `Any`-typed position, the runtime wraps it in a heap-allocated box that preserves the enum's full type identity — its declared type name, type parameters, and active variant. The following rules govern the boundary precisely:

- **Boxing:** assigning an enum value to an `Any`-typed variable, field, or parameter boxes it automatically. No explicit call to a box method is required. The resulting `Any` carries the enum's full type (including generic parameters if any) as its runtime type identity.
- **Unboxing:** extracting an enum value from `Any` requires either `match` (which dispatches on the actual variant; see below) or `system.reflect.as(x, T)` (which returns `Option[T]`). There is no implicit unboxing coercion from `Any` to a named enum type in ordinary assignment.
- **`match` over `Any`:** when `match` is applied to an `Any`-typed expression, dispatch proceeds on the actual boxed enum type at runtime. Each arm pattern is matched against the actual variant. If the boxed value is not an enum at all, or if no arm pattern matches and no wildcard `_` arm is present, a runtime `MatchError` is thrown. Authors must include a wildcard arm when matching `Any`.
- **`typeOf` on a boxed enum:** `system.reflect.typeOf(x)` where `x` is an `Any` holding a boxed enum returns a `Type` value whose `kind` is `"enum"`, whose `name` is the enum's declared name, and whose `params()` returns the instantiated type arguments (if generic).
- **Reflection variants:** `system.reflect.variants(T)` returns the full variant list for an enum type. See the Reflection section for the `VariantInfo` API.
- **Dynamic fields:** `dynamic class` fields that hold enum values follow the same boxing rules as `Any` storage. Reading an enum value back from a dynamic field returns `Any`; the author must use `match` or `system.reflect.as` to recover the typed value.

Example illustrating `match` over `Any`:
```text
fun describe(x: Any): string {
  return match x {
    Circle(r)  => "circle with radius {$ r $}",
    Rect(w, h) => "rect {$ w $}x{$ h $}",
    Point      => "a point",
    _          => "something else",
  };
}
```

#### Built-in enums
`Option[T]` and `Result[T,E]` are built-in enums defined in the `system` namespace but available without an import in all Loom code:

```text
enum Option[T] { Some(T), None }
enum Result[T, E] { Ok(T), Err(E) }
```

### Optionality sugar (`T?`, `?.`, `??`)
As a convenience, the following shorthand forms are available and desugar as shown:

| Sugar | Desugars to |
|---|---|
| `T?` | `Option[T]` |
| `expr?.member` | `match expr { Some(v) => Some(v.member), None => None }` |
| `expr?.method(args)` | `match expr { Some(v) => Some(v.method(args)), None => None }` |
| `expr ?? default` | `match expr { Some(v) => v, None => default }` |

Rules:
- `T?` is syntactic sugar only; the underlying type is always `Option[T]`. Reflection, type errors, and interface checks refer to the desugared form.
- `?.` chains preserve the `Option` wrapper: `a?.b?.c` has type `Option[C]`, not `C`.
- `??` unwraps the `Option`; its right-hand side is evaluated lazily (only if the left-hand side is `None`).
- `?.` and `??` do not interact with `Result[T,E]`; use `match` or `?` propagation for result types.
- These forms are surface sugar and do not introduce new grammar productions beyond what the table above describes; they desugar before type-checking.

Example:
```text
let name: string = user?.profile?.displayName ?? "Anonymous";
let port: int    = config("PORT")?.let(parseInt) ?? 8080;
```

### `Result[T,E]` and the `?` propagation operator
`Result[T,E]` represents a computation that either succeeds with a value of type `T` or fails with an error of type `E`.

```text
fun divide(a: float, b: float): Result[float, string] {
  if (b == 0.0) {
    return Err("division by zero");
  }
  return Ok(a / b);
}
```

#### The `?` operator
The postfix `?` operator propagates errors out of the enclosing function. It may only appear inside a function whose return type is `Result[T, E]` for some `T` and `E`.

```text
expr?
```

Semantics:
- If `expr` evaluates to `Ok(v)`, the expression evaluates to `v`.
- If `expr` evaluates to `Err(e)`, the enclosing function returns `Err(e.into())` immediately.
- `e.into()` invokes `From[E].from(e)` to convert the error to the enclosing function's error type. If the error types match exactly, no conversion is performed. If no `From` implementation exists, it is a compile-time error.

Without `?`:
```text
fun process(path: string): Result[string, AppError] {
  let raw = match readText(path) {
    Ok(s)  => s,
    Err(e) => return Err(AppError.Io(e)),
  };
  let parsed = match parse(raw) {
    Ok(v)  => v,
    Err(e) => return Err(AppError.Parse(e)),
  };
  return Ok(transform(parsed));
}
```

With `?`:
```text
fun process(path: string): Result[string, AppError] {
  let raw    = readText(path)?;
  let parsed = parse(raw)?;
  return Ok(transform(parsed));
}
```

#### The `From[E]` interface
Error conversion for `?` propagation is mediated by the `From[E]` interface:

```text
interface From[E] {
  static fun from(err: E): Self;
}
```

A type `T` implements `From[E]` to declare that it can be constructed from an `E`. When `?` needs to convert `e: E` to the enclosing function's error type `F`, it calls `F.from(e)`. If `E == F`, the identity conversion is used and no `From` implementation is required.

### Dynamic objects (opt‑in)
Dynamic fields are **not** present on all objects. A class must opt in:

```text
dynamic class Foo {
  // declared members...
}
```

A `dynamic class` instance carries an additional hidden field map.

#### Dynamic field interface
Dynamic objects implement:
```text
interface Dynamic {
  pub fun hasField(name: string): bool;
  pub fun getField(name: string): Any;      // throws if missing
  pub fun setField(name: string, value: Any): void;
  pub fun deleteField(name: string): bool;  // true if removed
  pub fun fieldNames(): list[string];
}
```

#### Dynamic field access syntax: `!{...}`
Dynamic field access is explicit and never uses `.`.

- Identifier literal:
  - `obj!{foo}`  ≡  `obj.getField("foo")`
- String literal:
  - `obj!{"foo-bar"}`  ≡  `obj.getField("foo-bar")`

Setting:
```text
obj!{foo} = 123;
```

Rules:
- Assignments through `!{...}` auto-box unboxed primitive right-hand values before calling `setField`. Enum values are also auto-boxed to `Any` on write.
- Reads through `!{...}` auto-unbox boxed primitives only when the receiving context has a statically known primitive type; otherwise the result remains `Any`. Enum values read from dynamic fields return `Any` and must be matched or cast to recover the typed value.
- `!{...}` access requires the left operand to be `Dynamic` (or a subtype known to implement `Dynamic`); otherwise it is a compile-time error (or runtime `TypeError` in fully dynamic contexts).
- `obj.member` **never** falls back to dynamic fields.

Examples:
```text
obj!{count} = 123;        // auto-boxes to Int
let n: int = obj!{count}; // auto-unboxes Int to int
let raw: Any = obj!{count};
```

#### Dynamic view (scoped dot-as-dynamic)
To reduce verbosity while keeping explicit intent, Loom supports a scoped dynamic view:

```text
dynamic obj as dobj {
  let x = dobj.foo;        // same as obj!{foo}
  dobj.foo = 1;            // same as obj.setField("foo", Int.box(1))
}
```

Within the `dynamic ... as ... { ... }` block:
- `dobj.name` is dynamic-field access for identifier `name` (no declared-member resolution).
- Use `obj.name` (the original object) for declared members.

### Interfaces (nominal)
Nominal `interface` construct (explicit `implements`). Not structural protocols.

Native interface examples:
```text
interface Iterable[T]    { fun iter(): Iterator[T]; }
interface Iterator[T]    { fun next(): Option[T]; }  // Some(t) or None
interface KeyLookup[K,V] { fun has(key: K): bool; fun get(key: K): Option[V]; }
interface Readable       { fun read(n: int): bytes; }
interface Writable       { fun write(b: bytes): int; }
interface Closeable      { fun close(): void; }
interface Sized          { fun len(): int; }
interface From[E]        { static fun from(err: E): Self; }
interface AsyncIterable[T] { fun asyncIter(): AsyncIterator[T]; }
interface AsyncIterator[T] { fun next(): Task[Option[T]]; }
```

### Option (uniform optionality)
Optional values are represented as `Option[T]`, also written `T?`.

```text
enum Option[T] { Some(T), None }
```

`T?` is syntactic sugar for `Option[T]`; see the optionality sugar section above.

### Tasks (`Task[T]`)
Asynchronous computations are represented as `Task[T]`.

- Calling an `async fun` returns a `Task[T]`.
- Tasks begin execution immediately when created.
- A task resolves to a value of type `T` or fails with an exception.
- `await` is the only built-in way to extract `T` from `Task[T]`.
- `Task[T]` is a first-class class value (`Any`); it is never implicitly converted to `T`.
- Inserting a `Task[T]` into templates or interpolated strings without `await` is an error.

### Operators & Iteration
- Indexing: `dict[key]`, `list[i]` (primitive semantics).
- Membership: `x in set`, `key in dict`.

#### `len` vs `count`
`len(x)` is only for values with a real, intrinsic length:
- primitives: `string`, `bytes`, `list`, `dict`, `set`, `tuple`
- objects implementing `Sized`

`count(xs)` explicitly iterates:
- `count(xs: Iterable[T]): int` consumes iteration to count items (may be expensive / may not terminate).

### Reflection
Reflection APIs live under `system.reflect` and use `Any`. The signatures below describe the boxed runtime surface; language-level calls may still use the boundary coercions defined above.

- `set` and `invoke` accept unboxed primitive arguments at the API boundary; the runtime boxes them before dispatch.
- `getAs` and `invokeAs` provide typed reads; primitive targets auto-unbox boxed primitive values using the same rules as dynamic fields.

```text
namespace system.reflect;

typeOf(x): Type
is(x, T): bool
as(x, T): Option[T]

Type.name: string
Type.kind: string        // "class" | "enum" | "interface" | "primitive"
Type.params(): list[Type]
Type.super(): Option[Type]
Type.interfaces(): list[Type]
Type.variants(): list[VariantInfo]   // non-empty iff kind == "enum"

class VariantInfo : Any {
  pub name: string;
  pub fields: list[Field];   // empty list for unit variants
}

fields(T): list[Field]
methods(T): list[Method]
constructors(T): list[Constructor]
annotations(T): dict[string, Any]
variants(T): list[VariantInfo]       // equivalent to typeOf(T).variants()

new(T, args...): Any
get(obj, field: string): Any
getAs(obj, field: string, T): T
set(obj, field: string, value: Any): void
invoke(obj, method: string, args...): Any
invokeAs(obj, method: string, T, args...): T
```

`Type.kind` returns `"enum"` for any enum type including `Option[T]` and `Result[T,E]`. `Type.variants()` and the top-level `variants(T)` function are the canonical way to introspect enum structure at runtime; they return an empty list for non-enum types. `VariantInfo.fields` is an empty list for unit variants (e.g. `None`, `Point`) and a non-empty list for payload variants.

---
## 7) Structured Concurrency

The base `Task[T]` model introduced in v0.2 handles single async operations. This section defines structured concurrency primitives that give groups of tasks a shared lifetime, allow cancellation to propagate predictably, and support streaming iteration over async sequences.

### `await group` block *(new in v0.4)*
The `await group` block statement is the primary structured concurrency primitive for spawning heterogeneous concurrent tasks. It opens a group scope, allows arbitrary tasks to be spawned with `spawn`, and suspends until all spawned tasks have completed or been cancelled before the block exits.

```text
async fun loadDashboard(userId: string): Task[Dashboard] {
  let user: User;
  let config: Config;
  let flags: FeatureFlags;

  await group {
    user   = spawn fetchUser(userId);
    config = spawn fetchConfig();
    flags  = spawn fetchFlags(userId);
  }

  return buildDashboard(user, config, flags);
}
```

Rules:
- `await group { ... }` is a block statement. It requires an `async` context.
- `spawn expr` starts `expr` (which must have type `Task[T]`) as a child task owned by the enclosing `await group` scope. `spawn` is an expression; its type is `Task[T]` where `T` is the task's result type.
- The shorthand `binding = spawn expr` is sugar for declaring the binding and awaiting the task when the group closes: the binding receives the resolved `T` value after the group block exits normally.
- All tasks spawned inside the group are owned by that group. They must complete or be cancelled before the `await group` block exits. Storing a spawned `Task[T]` outside the group scope is a compile-time error when statically detectable, and a runtime `LifetimeError` otherwise.
- If any spawned task fails, the group immediately signals cancellation to all other running child tasks, waits for all children to settle, then re-raises the failure at the `await group` site.
- `CancellationError` is thrown at the next `await` point inside a cancelled spawned task. Swallowing `CancellationError` silently inside a spawned task is an anti-pattern.
- `await group` participates in outer `TaskGroup.withTimeout` and `TaskGroup.withCancellation` scopes: a `CancellationError` or `TimeoutError` arriving from an outer scope propagates into the group, cancelling all children.
- `defer` inside an `await group` block runs after all children have settled (success or failure), before the block exits.

Nesting with timeout:
```text
async fun loadWithTimeout(): Task[Dashboard] {
  return await TaskGroup.withTimeout(5000, async fun() {
    let user: User;
    let feeds: list[Feed];

    await group {
      user  = spawn fetchUser("me");
      feeds = spawn fetchFeeds("me");
    }

    return buildDashboard(user, feeds);
  });
}
```

### `TaskGroup` (homogeneous collections)
`TaskGroup` static methods remain available for the common case of running the same operation over a list of inputs.

```text
namespace system;

class TaskGroup {
  // Run body(item) concurrently for each item; collect all results.
  // If any task fails, all remaining tasks are cancelled and the error propagates.
  pub static async fun collect[T, R](
    items: list[T],
    body: async fun(T): R
  ): Task[list[R]];

  // Run all tasks concurrently; return results in completion order via an AsyncIterable.
  pub static fun race[T, R](
    items: list[T],
    body: async fun(T): R
  ): AsyncIterable[R];

  // Run body; cancel and throw TimeoutError if not complete within ms milliseconds.
  pub static async fun withTimeout[T](ms: int, body: async fun(): T): Task[T];

  // Run body with a CancellationToken the caller can signal at any time.
  pub static async fun withCancellation[T](
    body: async fun(token: CancellationToken): T
  ): Task[T];
}

class CancellationToken : Any {
  pub fun cancel(): void;
  pub fun isCancelled(): bool;
}

class TimeoutError      : Any { ... }
class CancellationError : Any { ... }
class LifetimeError     : Any { ... }
```

The `await group` block and `TaskGroup` methods share the same cancellation model and the same `CancellationError` / `TimeoutError` types. `await group` is preferred for heterogeneous tasks; `TaskGroup.collect` is preferred for uniform work over a list.

### Async iterators and `for await`
An `AsyncIterator[T]` produces values of type `T` asynchronously, one at a time. `AsyncIterable[T]` is any value that can produce an `AsyncIterator[T]`.

```text
interface AsyncIterable[T] { fun asyncIter(): AsyncIterator[T]; }
interface AsyncIterator[T] { fun next(): Task[Option[T]]; }
```

`for await` iterates an `AsyncIterable[T]`:

```text
async fun processLines(path: string): Task[void] {
  for await (line in runtime.fs().linesAsync(path)) {
    process(line);
  }
}
```

Rules:
- `for await (x in xs) { ... }` is a block statement that requires an `async` context.
- The loop body may use `await`, `break`, and `continue` normally.
- `break` on a `for await` loop calls `asyncIter().close()` on the iterator if that method exists, allowing the producer to release resources.
- `for await` loops participate in `await group` and `TaskGroup` cancellation: a `CancellationError` thrown inside the loop body propagates normally.
- `for await` loops are permitted in template directives during async rendering:
  ```text
  {% for await (chunk in stream) %}
    {$ chunk $}
  {% end %}
  ```

---
## 8) FFI and Host Interop

Loom provides an explicit foreign function interface (FFI) for calling JavaScript APIs (browser and Node.js) and native shared libraries (CLI/service targets). FFI declarations are opt-in and syntactically visible, consistent with Loom's "explicit meaning" design goal.

All FFI values that cross the boundary without a declared Loom type are typed as `Any`. Calling `.member` on an `Any`-typed FFI value requires either an explicit cast (`system.reflect.as`) or dynamic access via `!{}`. This prevents unsafe assumptions from silently compiling.

### JavaScript interop (`extern js`)
`extern js` declarations bind JavaScript globals, functions, and values for use in Loom code targeting the `browser` or `service` (Node.js) platforms.

```text
// Bind a JS function
extern js fun fetch(url: string, opts: Any): Task[Any];
extern js fun parseInt(s: string, radix: int): int;
extern js fun setTimeout(callback: fn(): void, ms: int): int;

// Bind a JS global value
extern js val document: Any;
extern js val window: Any;
extern js val process: Any;
```

Rules:
- `extern js fun` and `extern js val` are simple declarations (trailing `;`).
- The declared Loom types are trusted and not verified at compile time; a type mismatch produces a runtime error.
- `extern js fun` whose JS implementation returns a Promise is declared with return type `Task[T]`; the runtime wraps the Promise automatically.
- `extern js` declarations are only valid in modules that are not excluded from the active platform target. Using an `extern js` declaration in a module marked `[target.cli]`-only is a compile-time error.
- The `extern js` namespace is flat; the declared name is a Loom identifier in the current scope. Shadowing an existing name is an error.

### Exporting Loom functions to JavaScript (`@jsexport`) *(new in v0.4)*
The `@jsexport` annotation marks a Loom function as callable from JavaScript. This is the inbound FFI direction: JavaScript code calls into Loom.

```text
// Module-level named export
@jsexport
fun onMessage(data: string): void {
  process(data);
}

// Inline closure exported to JS
let handler: fn(Event): void = @jsexport fun(ev: Event) {
  count.set(count.get() + 1);
};

element.addEventListener("click", handler);
```

Rules:
- `@jsexport` may annotate a `fun` or `async fun` declaration at module level, or a `fun` expression (closure).
- The runtime wraps the annotated Loom function in a JS function object. When JS calls it, the runtime marshals each JS argument to the corresponding declared Loom parameter type using the same boundary coercions as `extern js` calls in reverse. A JS argument that cannot be coerced to the declared Loom type produces a runtime `FfiTypeError`.
- If the annotated function is `async fun`, the JS caller receives a `Promise<T>` that resolves to the Loom task's result value when the task completes, or rejects if the task fails.
- Synchronous `@jsexport` functions must not suspend (no `await` inside their body). The compiler enforces this; violation is a compile-time error.
- `@jsexport` functions may not use the `?` propagation operator at the outermost level. Errors must be handled within the function body or propagated via a returned `Result[T,E]` value. For `async fun`, an unhandled exception inside the task causes the returned `Promise` to reject.
- `CancellationError` thrown inside an `@jsexport async fun` causes the returned `Promise` to reject with a JS error carrying the cancellation message. The Loom runtime does not suppress it.
- `@jsexport` is only valid on `browser` and `service` targets; using it on a `cli`-only module is a compile-time error.
- An `@jsexport` function at module level is accessible to JS as a named export of the compiled module's JS representation. The export name matches the Loom identifier exactly.

```text
// Async export: JS receives a Promise
@jsexport
async fun fetchSummary(userId: string): Task[string] {
  let user = await fetchUser(userId);
  return buildSummary(user);
}

// JS: const summary = await fetchSummary("u1");
```

### Typed JS facades (`system.interop`)
`system.interop` provides typed Loom wrappers over common Web and Node.js APIs. These facades should be preferred over raw `extern js` declarations in application code.

```text
namespace system.interop;

// HTTP (browser fetch / Node.js fetch)
class Request  : Any { pub url: string; pub method: string; pub body: Option[bytes]; ... }
class Response : Any {
  pub status: int;
  pub ok: bool;
  pub fun text(): Task[string];
  pub fun json(): Task[Any];
  pub fun bytes(): Task[bytes];
}
fun fetch(url: string): Task[Response];
fun fetch(req: Request): Task[Response];

// Timers
fun setTimeout(ms: int, callback: fn(): void): TimerHandle;
fun clearTimeout(handle: TimerHandle): void;
fun setInterval(ms: int, callback: fn(): void): TimerHandle;
fun clearInterval(handle: TimerHandle): void;

class TimerHandle : Any { ... }

// DOM (browser only — excluded on service/cli targets)
fun querySelector(selector: string): Option[Element];
fun querySelectorAll(selector: string): list[Element];

class Element : Any {
  pub id: string;
  pub className: string;
  pub fun getAttribute(name: string): Option[string];
  pub fun setAttribute(name: string, value: string): void;
  pub fun addEventListener(event: string, handler: fn(Event): void): void;
  pub fun removeEventListener(event: string, handler: fn(Event): void): void;
  pub fun appendChild(child: Element): void;
  pub fun remove(): void;
  pub innerHTML: string;
  pub textContent: string;
}

class Event : Any {
  pub type: string;
  pub fun preventDefault(): void;
  pub fun stopPropagation(): void;
}
```

### Native interop (`extern native`)
`extern native` declarations bind symbols from native shared libraries for use on `cli` and `service` targets.

```text
extern native "libsqlite3" fun sqlite3_open(path: string): NativeHandle;
extern native "libsqlite3" fun sqlite3_close(db: NativeHandle): int;
extern native "libsqlite3" fun sqlite3_exec(
  db: NativeHandle, sql: string, callback: Any, arg: Any, errmsg: Any
): int;
```

Rules:
- `extern native "libname"` specifies the shared library by name (without platform-specific prefix or extension; the runtime resolves `libname.so`, `libname.dylib`, or `libname.dll` as appropriate).
- `NativeHandle` is an opaque type representing a C pointer or handle value. It cannot be inspected or dereferenced in Loom code; it may only be passed to other `extern native` functions.
- `extern native` declarations are only valid on `cli` and `service` targets. They are excluded from `browser` targets at compile time.
- Memory management of native resources is the caller's responsibility; use `defer` to call the corresponding free/close function.
- Passing a Loom `string` to a native function that expects a C string is supported; the runtime provides a null-terminated UTF-8 copy for the duration of the call.

### Runtime interop capability
The `runtime` object gains an `interop()` accessor:

```text
interface Runtime {
  // ... existing methods ...
  fun interop(): system.interop.Interop;
}
```

`system.interop.Interop` provides runtime-level access to the interop layer for dynamic binding and capability inspection; most application code uses the typed facades in `system.interop` directly without going through `runtime.interop()`.

---
## 9) Reactive UI (`system.ui`)

`system.ui` defines the reactive component model for building user interfaces on the `browser` target. The model is signal-based: fine-grained reactive state flows through the component tree without a virtual DOM diffing layer.

`system.ui` is only available on the `browser` target. Using it in a module that is not excluded from `cli` or `service` targets produces a compile-time error unless the module is explicitly restricted in `loom.pkg`.

### Signals
A `Signal[T]` holds a single reactive value. Reading it inside a reactive context (a component's render expression or a `derived` computation) establishes a dependency; writing it invalidates and re-evaluates all dependents.

```text
namespace system.ui;

class Signal[T] : Any {
  pub fun get(): T;
  pub fun set(value: T): void;
  pub fun update(fn: fn(T): T): void;
}

fun signal[T](initial: T): Signal[T];
fun derived[T](compute: fn(): T): Signal[T];
fun effect(fn: fn(): void): EffectHandle;

class EffectHandle : Any {
  pub fun dispose(): void;
}
```

`signal(v)` creates a writable signal with initial value `v`.  
`derived(fn)` creates a read-only signal whose value is recomputed whenever any signal read inside `fn` changes.  
`effect(fn)` runs `fn` immediately and re-runs it whenever any signal read inside it changes. Returns a handle to dispose the effect.

```text
let count   = signal(0);
let doubled = derived(fun() => count.get() * 2);

effect(fun() {
  log("count is now: {$ count.get() $}");
});

count.set(1);   // effect runs; doubled is now 2
count.set(2);   // effect runs; doubled is now 4
```

### `ComponentRegistry` *(new in v0.4)*
A `ComponentRegistry` is an explicit, immutable map from string names to component functions. It is the sole mechanism for making components available inside an `html` template fence. There is no implicit scope scan.

```text
namespace system.ui;

class ComponentRegistry : Any {
  // Construct from a dict literal. Each value must be a function returning View or Task[View].
  // A key that is not a valid PascalCase identifier string is a compile-time warning.
  pub static fun of(entries: dict[string, Any]): ComponentRegistry;

  // Merge two registries. On name collision, the right operand (other) takes precedence.
  pub fun merge(other: ComponentRegistry): ComponentRegistry;

  // Retrieve a component by name; returns None if not registered.
  pub fun get(name: string): Option[Any];
}
```

Building a registry:
```text
from system.ui import (ComponentRegistry, View);
from .counter  import (Counter);
from .header   import (Header);
from .sidebar  import (Sidebar);

pub let registry = ComponentRegistry.of({
  "Counter": Counter,
  "Header":  Header,
  "Sidebar": Sidebar,
});
```

Merging registries from a design system with app-local components:
```text
from "acme-design-system" import (components as acme);
from .components import (registry as local);

// local entries win on collision
let appRegistry = acme.merge(local);
```

### Components
A component is a function that accepts named parameters (its props) and returns a `View`. Components may read signals inside their returned `html` fence; they re-render automatically when any signal they depend on changes.

```text
namespace system.ui;

class View : Any { ... }   // opaque; produced by html template fences with component semantics
```

Components are declared as ordinary functions returning `View`:

```text
from system.ui import (signal, derived, View);

fun Counter(initialValue: int): View {
  let count = signal(initialValue);
  let label = derived(fun() => "Clicked {$ count.get() $} times");

  return ```(html):(none)
    <div class="counter">
      <p>{$ label.get() $}</p>
      <button onclick="{$ fun() { count.set(count.get() + 1); } $}">+</button>
      <button onclick="{$ fun() { count.set(count.get() - 1); } $}">−</button>
    </div>
  ```;
}
```

### Component tag resolution in `html` fences *(clarified in v0.4)*
Component tags are resolved exclusively through the `components` descriptor key. There is no implicit lexical-scope scan.

#### Using the `components` descriptor
An `html` fence that needs to embed component calls must declare a `components` descriptor:

````text
```(html):(components=registry)
<Header title={$ pageTitle $} />
<Counter initialValue={$ 0 $} />
<Sidebar userId={$ userId $} />
```
````

The descriptor value is evaluated in the lexical scope of the enclosing expression, before the fence body is rendered. It must evaluate to a `ComponentRegistry`; any other type is a compile-time error if statically detectable, or a runtime `TypeError`.

#### Tag resolution rules
- **Uppercase-initial tags** in an `html):(components=R)` fence are looked up by exact string match in `R`. If found, the registered value must be a function whose return type is `View` or `Task[View]`; its named parameters are matched to the tag's attributes by name and type-checked. If a registered name is found but its value is not a `View`-returning function, it is a compile-time error. If an uppercase tag is not found in `R`, it is a compile-time error — there is no silent fallback to emitting it as a literal HTML string.
- **Lowercase and hyphenated tag names** are always emitted as literal HTML elements, regardless of the registry.
- **`html` fences without a `components` descriptor** treat all uppercase-initial tags as compile-time errors. There is no implicit scope scan even if matching function names are in scope.
- The `components` descriptor key is only valid when `language` is `html`; using it with any other language descriptor is a compile-time error.

#### Attribute syntax on component tags
Attribute values on component tags are Loom expressions in `{$ ... $}` form:

```text
<Counter initialValue={$ 0 $} />
<Header title={$ "My App" $} onClose={$ fun() { closePanel(); } $} />
```

Boolean attributes (no value) desugar to `attr={$ true $}`:

```text
<Toggle disabled />   // same as <Toggle disabled={$ true $} />
```

Paired component tags (open + close) pass their inner content as a `children: View` parameter if the component function declares one; otherwise inner content is a compile-time error:

```text
<Card title={$ "Info" $}>
  <p>Content here</p>
</Card>
```

#### Module-level registry pattern
The idiomatic pattern for a component module is to export both individual components and a pre-built registry:

```text
// components/index.loom
from .counter import (Counter);
from .header  import (Header);
from .sidebar import (Sidebar);
from system.ui import (ComponentRegistry);

pub let registry = ComponentRegistry.of({
  "Counter": Counter,
  "Header":  Header,
  "Sidebar": Sidebar,
});

pub let (Counter, Header, Sidebar);
```

Third-party component libraries ship their registry as a primary export, enabling consumers to merge it without importing each component individually.

#### Component rules
- Components are not classes; they do not have lifecycle methods. Setup code (creating signals, effects) runs once when the component is first instantiated. Cleanup is handled by `defer` or by disposing `EffectHandle` values.
- Signal reads inside an `html` fence body (including derived signals) automatically establish fine-grained reactive dependencies. Only the DOM nodes that depend on a changed signal are updated; the entire component function does not re-run.
- `async` components are supported: an `async fun` returning `Task[View]` may be registered in a `ComponentRegistry` and used in an `html` fence. The runtime awaits the task before inserting the component output; a loading placeholder may be specified via a future `suspend` directive (see Future Directions).
- Components are composable: a `View` returned by one component may be embedded in another.

### Mounting
The entry point for a browser application mounts a root component into the DOM:

```text
namespace system.ui;

fun mount(component: View, selector: string): MountHandle;
fun mount(component: View, element: system.interop.Element): MountHandle;

class MountHandle : Any {
  pub fun unmount(): void;
}
```

Example entry script:
```text
from system.ui import (mount, ComponentRegistry);
from .components import (registry, App);

// App is also in the registry for use by sub-components
let root = App(title="My App");
mount(root, "#root");
```

### Runtime UI capability
The `runtime` object gains a `ui()` accessor:

```text
interface Runtime {
  // ... existing methods ...
  fun ui(): system.ui.UiRuntime;
}
```

`system.ui.UiRuntime` exposes runtime-level rendering operations (server-side rendering, hydration, snapshot testing) for advanced use cases; typical application code uses `mount` directly.

---
## 10) Runtime Root, Capabilities, and I/O

### Runtime root
A root-level identifier `runtime` is always available. It represents the current runtime instance and its capabilities.

```text
namespace system;

interface Runtime {
  // Script metadata
  fun args(): list[string];
  fun env(name: string): Option[string];

  // Capability reflection
  fun capabilities(): list[string];
  fun has(name: string): bool;

  // Capability access (throws CapabilityError if missing)
  fun fs(): system.fs.Fs;
  fun proc(): system.proc.Proc;
  fun net(): system.net.Net;
  fun debug(): system.debug.DebugRuntime;
  fun interop(): system.interop.Interop;
  fun ui(): system.ui.UiRuntime;            // browser target only
}

class CapabilityError : Any { ... }
```

### Environment access through `runtime`
All environment resources are accessed through `runtime`:

```text
// Filesystem
let fs = runtime.fs();
let data: bytes = fs.read("in.bin");
fs.write("out.bin", data);

// Process execution
let proc = runtime.proc();
let result = proc.run(["echo", "hi"]);

// Networking (capability-gated)
if (runtime.has("net")) {
  let net = runtime.net();
  ...
}

// Debugging (capability-gated)
if (runtime.has("debug")) {
  let dbg = runtime.debug();
  dbg.activatePortal("checkout.enter", Some("total == 0"), true);
}

// JS / native interop (capability-gated)
if (runtime.has("interop")) {
  let interop = runtime.interop();
  ...
}
```

### Async capability methods
Standard capability surfaces provide async entrypoints alongside sync ones when the host supports them:

```text
runtime.fs().readAsync(path): Task[bytes]
runtime.fs().writeAsync(path, data): Task[void]
runtime.fs().linesAsync(path): AsyncIterable[string]
runtime.proc().runAsync(argv): Task[ProcResult]
runtime.net().requestAsync(req): Task[Response]
```

Example:
```text
async fun copyFile(src: string, dst: string): Task[void] {
  let data = await runtime.fs().readAsync(src);
  await runtime.fs().writeAsync(dst, data);
}
```

### Dynamic tracing and time-travel debugging
When the runtime has the `debug` capability and an in-process time-travel server or trace hook is active, Loom supports native tracing of any application without source changes beyond optional explicit `portal` statements.

Portal activation model:

- The runtime maintains an activation registry keyed by portal name.
- Activations may target explicit `portal` statements or implicit callable portals.
- An activation may include:
  - a name
  - an optional condition expression
  - a `once` flag for single-use capture
- The condition expression and `once` flag exist only on the runtime activation request, not in the source-level `portal` syntax.
- Runtime activation conditions are Loom expressions parsed and evaluated in the lexical environment of the target portal/callable entry.
- Runtime activation conditions may refer to visible locals, parameters, `this`, and globals in scope at the activation point.
- If a runtime activation condition fails to parse, the activation request is rejected by the debug subsystem.
- If a runtime activation condition throws during evaluation, that activation attempt is treated as false and the debug subsystem records the evaluation failure without changing application semantics.
- When any matching portal is entered and the activation condition is true, the runtime activates tracing for the entering task/thread and may promote rolling history into a persisted time-travel capture.
- If `once` is true on the runtime activation, the successful capture consumes the activation.

Python-like trace hook support:

- The runtime may install or replace a trace hook dynamically, similar in role to Python's trace function.
- Trace hooks and time-travel servers are layered on the same tracing substrate.
- Trace events include at least: call, return, line, exception, await, resume, portal, and signal (fired when a `Signal[T]` value is written).

Minimal API sketch:
```text
namespace system.debug;

enum TraceEventKind { Call, Return, Line, Exception, Await, Resume, Portal, Signal }
enum TraceServerKind { Capture, Mcp }

class TraceEvent {
  pub kind: TraceEventKind;
  pub portal: Option[string];
  pub callable: Option[string];
  pub file: string;
  pub line: int;
}

interface TraceHook {
  fun onEvent(ev: TraceEvent): void;
}

class PortalActivation {
  pub name: string;
  pub condition: Option[string];
  pub once: bool;
}

class TraceServerHandle : Any {
  pub kind: TraceServerKind;
  pub fun stop(): void;
}

class CaptureServerConfig : Any { ... }
class McpServerConfig : Any { ... }

interface DebugRuntime {
  pub fun tracingAvailable(): bool;
  pub fun tracingActive(): bool;

  pub fun setTraceHook(hook: Option[TraceHook]): Option[TraceHook];

  pub fun activatePortal(name: string, condition: Option[string] = None, once: bool = false): void;
  pub fun deactivatePortal(name: string): void;
  pub fun activePortals(): list[PortalActivation];

  pub fun startCaptureServer(cfg: CaptureServerConfig): TraceServerHandle;
  pub fun startMcpServer(cfg: McpServerConfig): TraceServerHandle;
}
```

Server types:

- **Capture server:** a highly optimized in-process time-travel server for tooling that captures runtime behavior with low overhead and rich event/state history.
- **MCP server:** an in-process MCP-compatible server that exposes dynamic debugging and time-travel operations to agents.

Both server types share the same portal registry, trace history, activation model, and tracing substrate.

### Script prelude
Entry scripts and REPL sessions receive a small prelude for common tasks. These helpers are surface sugar over `runtime` and preserve the same capability checks and failure behavior:

- `args()`  ≡  `runtime.args()`
- `env(name)`  ≡  `runtime.env(name)`
- `readBytes(path)`  ≡  `runtime.fs().read(path)`
- `readText(path)` reads UTF-8 text via `runtime.fs()`
- `writeBytes(path, data)`  ≡  `runtime.fs().write(path, data)`
- `writeText(path, text)` writes UTF-8 text via `runtime.fs()`
- `exec(argv)`  ≡  `runtime.proc().run(argv)`
- `readBytesAsync(path)`  ≡  `runtime.fs().readAsync(path)`
- `readTextAsync(path)` reads UTF-8 text via `runtime.fs().readAsync(path)`
- `writeBytesAsync(path, data)`  ≡  `runtime.fs().writeAsync(path, data)`
- `writeTextAsync(path, text)` writes UTF-8 text via `runtime.fs().writeAsync(path, utf8(text))`
- `execAsync(argv)`  ≡  `runtime.proc().runAsync(argv)`

Examples:
```text
let cfg = readText("loom.json");
let who = env("USER");
let result = exec(["echo", "hi"]);

let asyncCfg = await readTextAsync("loom.json");
```

For onboarding and small scripts, the prelude is the recommended default surface. Beginner-facing examples and generated script templates should prefer these helpers over direct `runtime.fs()`, `runtime.proc()`, and `runtime.net()` access unless the example is specifically teaching capability objects.

### Native modules under `system`
Standard library modules are under `system.*`:
- `system.fs` defines the filesystem capability surface
- `system.proc` defines process execution capability surface
- `system.net` defines networking capability surface
- `system.template` defines templates/rendering
- `system.reflect` defines reflection
- `system.debug` defines tracing, portals, and time-travel debugging
- `system.interop` defines typed facades over JS/native FFI boundaries
- `system.ui` defines the reactive component model for browser targets
- `system.text` defines string utilities *(new in v0.4)*
- `system.json` defines JSON parsing and serialisation *(new in v0.4)*
- `system.time` defines instants, durations, and async sleep *(new in v0.4)*
- `system.collections` defines higher-order collection utilities *(new in v0.4)*

---
## 11) Standard Library *(new in v0.4)*

The four modules in this section are **pure-computation** modules: they perform no I/O and require no capability gate. They are available on all targets (`cli`, `browser`, `service`) without restriction, and need not appear in `[target.*]` blocks in `loom.pkg`.

### `system.text`

```text
namespace system.text;

// Splitting and joining
fun split(s: string, sep: string): list[string];
fun splitN(s: string, sep: string, n: int): list[string]; // at most n parts
fun join(parts: list[string], sep: string): string;

// Trimming
fun trim(s: string): string;
fun trimStart(s: string): string;
fun trimEnd(s: string): string;
fun trimChars(s: string, chars: string): string;

// Searching
fun startsWith(s: string, prefix: string): bool;
fun endsWith(s: string, suffix: string): bool;
fun contains(s: string, sub: string): bool;
fun indexOf(s: string, sub: string): Option[int];
fun lastIndexOf(s: string, sub: string): Option[int];
fun count(s: string, sub: string): int;

// Transformation
fun replace(s: string, from: string, to: string): string;
fun replaceAll(s: string, from: string, to: string): string;
fun toUpper(s: string): string;
fun toLower(s: string): string;
fun capitalize(s: string): string;          // first char upper, rest unchanged
fun padStart(s: string, len: int, ch: string): string;
fun padEnd(s: string, len: int, ch: string): string;
fun repeat(s: string, n: int): string;
fun reverse(s: string): string;

// Parsing
fun parseInt(s: string): Result[int, string];
fun parseInt(s: string, base: int): Result[int, string];
fun parseFloat(s: string): Result[float, string];
fun parseBool(s: string): Result[bool, string];  // "true"/"false"

// Encoding
fun toBytes(s: string): bytes;                   // UTF-8
fun fromBytes(b: bytes): Result[string, string]; // UTF-8 decode; Err on invalid
fun toHex(b: bytes): string;
fun fromHex(s: string): Result[bytes, string];
fun toBase64(b: bytes): string;
fun fromBase64(s: string): Result[bytes, string];
```

### `system.json`

```text
namespace system.json;

// Parsing — returns Any on success; Any may be: string, int, float, bool,
// list[Any], dict[string, Any], or None (for JSON null).
fun parse(s: string): Result[Any, string];

// Serialisation
fun stringify(v: Any): string;                  // compact, no indent
fun stringify(v: Any, indent: int): string;     // pretty-printed with indent spaces

// Typed access helpers — sugar over system.reflect.as
fun getString(v: Any, key: string): Result[string, string];
fun getInt(v: Any, key: string): Result[int, string];
fun getFloat(v: Any, key: string): Result[float, string];
fun getBool(v: Any, key: string): Result[bool, string];
fun getObject(v: Any, key: string): Result[dict[string, Any], string];
fun getArray(v: Any, key: string): Result[list[Any], string];
```

Example:
```text
from system.json import (parse, stringify, getString);

let cfg = parse(readText("config.json"))?;
let host = getString(cfg, "host")?;
let output = stringify(cfg, 2);
```

### `system.time`

```text
namespace system.time;

class Instant : Any {
  // Current wall-clock time
  pub static fun now(): Instant;

  // Construction
  pub static fun fromMillis(ms: int): Instant;
  pub static fun fromIso(s: string): Result[Instant, string];

  // Conversion
  pub fun toMillis(): int;
  pub fun toIso(): string;                  // RFC 3339 / ISO 8601

  // Arithmetic
  pub fun plus(d: Duration): Instant;
  pub fun minus(d: Duration): Instant;
  pub fun durationSince(earlier: Instant): Duration;
  pub fun isBefore(other: Instant): bool;
  pub fun isAfter(other: Instant): bool;
}

class Duration : Any {
  pub millis: int;

  pub static fun ofMillis(ms: int): Duration;
  pub static fun ofSeconds(s: int): Duration;
  pub static fun ofMinutes(m: int): Duration;
  pub static fun ofHours(h: int): Duration;

  pub fun plus(other: Duration): Duration;
  pub fun minus(other: Duration): Duration;
  pub fun toMillis(): int;
  pub fun toSeconds(): float;
}

// Async-safe delay — does not block the event loop
fun sleep(d: Duration): Task[void];
```

Example:
```text
from system.time import (Instant, Duration, sleep);

let start = Instant.now();
await sleep(Duration.ofMillis(500));
let elapsed = Instant.now().durationSince(start);
log("took {$ elapsed.toMillis() $}ms");
```

### `system.collections`

```text
namespace system.collections;

// Transformation
fun map[T, R](xs: list[T], fn: fn(T): R): list[R];
fun flatMap[T, R](xs: list[T], fn: fn(T): list[R]): list[R];
fun filter[T](xs: list[T], fn: fn(T): bool): list[T];
fun filterMap[T, R](xs: list[T], fn: fn(T): Option[R]): list[R];
fun reduce[T, R](xs: list[T], init: R, fn: fn(R, T): R): R;

// Search
fun find[T](xs: list[T], fn: fn(T): bool): Option[T];
fun findIndex[T](xs: list[T], fn: fn(T): bool): Option[int];
fun any[T](xs: list[T], fn: fn(T): bool): bool;
fun all[T](xs: list[T], fn: fn(T): bool): bool;
fun none[T](xs: list[T], fn: fn(T): bool): bool;

// Ordering
fun sortBy[T, K](xs: list[T], key: fn(T): K): list[T];         // ascending
fun sortByDesc[T, K](xs: list[T], key: fn(T): K): list[T];     // descending
fun reverse[T](xs: list[T]): list[T];

// Grouping and partitioning
fun groupBy[T, K](xs: list[T], key: fn(T): K): dict[K, list[T]];
fun partition[T](xs: list[T], fn: fn(T): bool): tuple[list[T], list[T]];
fun zip[A, B](as: list[A], bs: list[B]): list[tuple[A, B]];
fun unzip[A, B](pairs: list[tuple[A, B]]): tuple[list[A], list[B]];

// Set operations
fun unique[T](xs: list[T]): list[T];
fun uniqueBy[T, K](xs: list[T], key: fn(T): K): list[T];
fun flatten[T](xs: list[list[T]]): list[T];
fun chunk[T](xs: list[T], size: int): list[list[T]];

// Generation
fun range(end: int): list[int];                       // 0 .. end-1
fun range(start: int, end: int): list[int];           // start .. end-1
fun range(start: int, end: int, step: int): list[int];
fun repeat[T](value: T, n: int): list[T];
fun tabulate[T](n: int, fn: fn(int): T): list[T];

// Aggregation
fun sum(xs: list[int]): int;
fun sumFloat(xs: list[float]): float;
fun min[T](xs: list[T]): Option[T];
fun max[T](xs: list[T]): Option[T];
fun minBy[T, K](xs: list[T], key: fn(T): K): Option[T];
fun maxBy[T, K](xs: list[T], key: fn(T): K): Option[T];
fun countWhere[T](xs: list[T], fn: fn(T): bool): int;

// Dict utilities
fun mapValues[K, V, R](d: dict[K, V], fn: fn(V): R): dict[K, R];
fun filterKeys[K, V](d: dict[K, V], fn: fn(K): bool): dict[K, V];
fun mergeWith[K, V](a: dict[K, V], b: dict[K, V], fn: fn(V, V): V): dict[K, V];
fun fromEntries[K, V](pairs: list[tuple[K, V]]): dict[K, V];
fun toEntries[K, V](d: dict[K, V]): list[tuple[K, V]];
```

All functions in `system.collections` are pure and do not mutate their inputs.

---
## 12) Failure Policy (Summary)
- **Hard fail by default** for runtime errors (language) and rendering/formatting errors (templates).
- **Language:** `try { ... } catch (Type as err) { ... } finally { ... }` catches synchronous failures and task failures observed by `await`.
- **Result propagation:** the `?` operator propagates `Err` values up the call stack without exceptions; this is the preferred pattern for recoverable, typed errors.
- A task that fails and is never awaited becomes an **unhandled task failure** reported by the runtime.
- **Structured concurrency:** a failing child task in an `await group` block or `TaskGroup` call cancels all siblings; `CancellationError` propagates to the group scope and is re-raised after all children settle.
- **Enum matching over `Any`:** if a `match` expression over an `Any`-typed value finds no matching arm and no wildcard arm is present, a runtime `MatchError` is thrown. Authors must include a wildcard arm when matching `Any`.
- **Tracing/Debugging:** portal misses, false activation conditions, and trace transport/server failures are observational by default and do not change application semantics; invalid activation requests are rejected by the debug subsystem.
- **Templates:** buffered emitter try/catch (`{% try %} ... {% catch ... %} ... {% end %}`)
- **FFI (outbound):** type mismatches at `extern js` or `extern native` call boundaries produce runtime `FfiTypeError` values.
- **FFI (inbound):** a JS argument to a `@jsexport` function that cannot be marshalled to the declared Loom parameter type produces a runtime `FfiTypeError`. For `@jsexport async fun`, an unhandled exception or `CancellationError` causes the returned Promise to reject.
- **Component registry:** an uppercase tag in an `html):(components=R)` fence that is not found in `R` is a compile-time error. Passing a non-`ComponentRegistry` value as the `components` descriptor is a compile-time error (if statically detectable) or a runtime `TypeError`.
- **Uncatchable:** parse/lex errors, alignment violations, and component resolution errors (compile-time).

---
## 13) Grammar Excerpts (Informal)

### Blocks & Statements
```text
Block        ::= "{" Stmt* "}"

Stmt         ::= SimpleStmt ";" | BlockStmt | FunDecl | AsyncFunDecl | EnumDecl

SimpleStmt   ::= Decl | Expr | BreakStmt | ContinueStmt | ReturnStmt | ThrowStmt
               | ImportStmt | DeferCall | PropagateExpr

BlockStmt    ::= IfStmt | WhileStmt | ForStmt | ForInStmt | ForAwaitStmt | DoWhileStmt
               | TryStmt | WithStmt | DeferBlock | DynamicView | PortalStmt | MatchExpr
               | AwaitGroupStmt

DeferCall    ::= "defer" Expr
DeferBlock   ::= "defer" Block
FunDecl      ::= Annotation* "fun" Id "(" ParamList? ")" (":" Type)? Block
AsyncFunDecl ::= Annotation* "async" "fun" Id "(" ParamList? ")" (":" Type)? Block
DynamicView  ::= "dynamic" Expr "as" Id Block
PortalStmt   ::= "portal" PortalName Block
PortalName   ::= Id | StringLiteral
EnumDecl     ::= "enum" Id TypeParams? "{" VariantList "}"
VariantList  ::= Variant ("," Variant)* ","?
Variant      ::= Id | Id "(" FieldList ")" | Id "{" NamedFieldList "}"
Annotation   ::= "@" Id
```

### Structured concurrency
```text
AwaitGroupStmt ::= "await" "group" Block
SpawnExpr      ::= "spawn" Expr
```

`SpawnExpr` may appear as the right-hand side of an assignment or `let`/`var` declaration inside an `AwaitGroupStmt` block. `spawn` is a contextual keyword; it is only valid inside an `await group` block. Outside that context, `spawn` is an ordinary identifier.

### Async functions, await, and for await
```text
AsyncFunDecl  ::= Annotation* "async" "fun" Id "(" ParamList? ")" (":" Type)? Block
AwaitExpr     ::= "await" Expr
ForAwaitStmt  ::= "for" "await" "(" Id "in" Expr ")" Block
```

### Annotations
```text
Annotation   ::= "@" Id
```

Currently defined annotations: `@jsexport`. Additional annotations are reserved for future use. Unknown annotations produce a compile-time warning, not an error, to allow tooling-defined annotations to coexist with language-defined ones.

### Match expression
```text
MatchExpr  ::= "match" Expr "{" MatchArm+ "}"
MatchArm   ::= Pattern ("if" "(" Expr ")")? "=>" Expr ","
Pattern    ::= "_"
             | Id
             | Id "(" PatternList? ")"
             | Id "{" NamedPatternList? "}"
             | "None" | "Some" "(" Pattern ")"
             | "Ok" "(" Pattern ")" | "Err" "(" Pattern ")"
PatternList      ::= Pattern ("," Pattern)*
NamedPatternList ::= Id ":" Pattern ("," Id ":" Pattern)*
```

### Propagation operator
```text
PropagateExpr ::= Expr "?"
```

### Optionality sugar
```text
OptionalType  ::= Type "?"
SafeNav       ::= Expr "?." Id
SafeNavCall   ::= Expr "?." Id "(" ArgList? ")"
NullCoalesce  ::= Expr "??" Expr
```

### Dynamic field access
```text
DynAccess    ::= Expr "!{" Id "}"
              | Expr "!{" StringLiteral "}"
```

### FFI declarations
```text
ExternJs     ::= "extern" "js" "fun" Id "(" ParamList? ")" ":" Type ";"
               | "extern" "js" "val" Id ":" Type ";"
ExternNative ::= "extern" "native" StringLiteral "fun" Id "(" ParamList? ")" ":" Type ";"
```

### Interpolated strings and template fences
```text
InterpolatedString ::= '"' ( StringChar | InlineExpr )* '"'
                     | "'" ( StringChar | InlineExpr )* "'"

TemplateFence   ::= P '```' '(' Language ')' ':' '(' TmplSpec? ')' NL
                    ( RawLine | Directive | Escaped | ComponentTag )*
                    P '```' NL?

TmplSpec        ::= (Key '=' Value) (',' Key '=' Value)*

Directive       ::= P StmtOpen TmplStmt StmtClose
InlineExpr      ::= ExprOpen '-'? Expr '-'? ExprClose

ComponentTag    ::= "<" UpperId (CompAttr)* ("/>" | ">" TmplContent "</" UpperId ">")
CompAttr        ::= LowerId "=" ExprOpen Expr ExprClose
                  | LowerId
UpperId         ::= [A-Z][a-zA-Z0-9_]*
```

`ComponentTag` productions are only active when the `components` descriptor key is present in `TmplSpec`. In all other `html` fences, an uppercase-initial tag name is a compile-time error.

---
## 14) Tooling, Learning, and Future Directions (Non‑normative)
- `loom run path/to/file.loom` is the baseline single-file execution workflow and uses the standard script prelude.
- Unix-style shebang execution is supported for script files.
- The reference toolchain should provide a REPL for exploratory scripting.
- The reference toolchain should provide a formatter and language-server diagnostics that share the parser and rendering rules used by execution.
- `loom build --target browser` / `--target cli` / `--target service` invokes the platform-profile-aware build pipeline and enforces capability restrictions at compile time.
- `loom add <package>` resolves and adds a dependency to `loom.pkg` and updates `loom.lock`.

### Progressive disclosure and learning path
- Loom remains a single language and semantic model; the project should not define separate beginner and advanced dialects.
- The recommended onboarding sequence is:
  - core scripting: declarations, functions, control flow, collections, imports, the script prelude, interpolated strings, and `system.text` / `system.json` / `system.collections`
  - intermediate: `enum` and `match`, `Result[T,E]` and `?`, `T?` / `?.` / `??`, async/await, template fences, `system.time`, and explicit `portal` blocks
  - advanced: structured concurrency (`await group`, `TaskGroup`, `for await`), `system.ui` components, `ComponentRegistry`, FFI (`extern js`, `extern native`, `@jsexport`), reflection, `Type.variants()`, dynamic objects, direct capability objects, and `system.debug`
- Generated project templates should prefer task-focused entry points such as `script`, `cli`, `generator`, `service`, and `webapp` rather than exposing the full runtime surface immediately.
- Beginner-facing materials should teach interpolated strings before template fences, `Option[T]` before `Result[T,E]`, and sync examples before async ones.
- Compiler diagnostics and tooling should explicitly explain when a user crosses into advanced concepts such as async boundaries, structured concurrency scopes, FFI boundaries, `@jsexport`, dynamic access, reflection, or tracing/debug capabilities.

### Future Directions
- **Bytecode target:** standardize on **WebAssembly (GC + Exception Handling)** for sandboxing and browser support; keep a lightweight interpreter for dev loops.
- **Macros/Metaprogramming:** hygienic compile‑time macros and typed quasiquotes.
- **Server-side rendering:** `system.ui` components rendered to static HTML strings on `service` targets, with client-side hydration.
- **Async component loading:** a `suspend` directive for `html` fences that renders a placeholder while an `async` component's `Task[View]` resolves.
- **Async iterators — extended:** additional combinators on `AsyncIterable[T]` (map, filter, take, merge, zip) mirroring the sync collection API in `system.collections`.
- **Structured concurrency — extended:** actor-style mailboxes and supervision trees built on `await group` and `TaskGroup`.
- **Package registry:** a reference registry protocol and hosted registry for the Loom ecosystem.
- **Regex:** a `system.regex` module with a compiled `Regex` type, match groups, and named captures.
- **`system.env`:** a cross-platform environment and configuration module covering dotenv-style file loading, typed config schema validation, and platform detection.

**End of v0.4 draft**