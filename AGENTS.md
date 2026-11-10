# Loup VSCode Extension

## Project Description

This repository implements a Visual Studio Code extension providing first-class support for the **Loup programming language** (v1.20). The extension is designed as a TypeScript monorepo with three packages:

| Package | Path | Purpose |
|---|---|---|
| **Extension Client** | `packages/extension/` | VSCode activation, commands, contributed grammars, snippets, status bar, webview panels |
| **Language Server** | `packages/language-server/` | Out-of-process LSP server — diagnostics, completions, hover, navigation, formatting |
| **Debug Adapter** | `packages/debug-adapter/` | DAP server — breakpoints, stepping, variables, portal breakpoints, time-travel debugging |

The extension supports all five mode-flavored Loup source file extensions (`.loup`, `.lpscr`, `.lpfree`, `.lpweb`, `.lphc`) and package manifests (`.lppkg`, `package.lppkg`, `loup.pkg`).

### Mode-Flavored File Extensions (§1-13.0.0)

| Extension | Role | Allowed `@mode` Declarations | Default Fallback Mode |
|---|---|---|---|
| `.loup` | General source (library or any mode) | Any of the seven modes | `@mode(host.scripted)` |
| `.lpscr` | Host-script or dual-mode file | `host.scripted`, `host.dual`, or omitted | `@mode(host.scripted)` |
| `.lpfree` | Freestanding-exclusive code | `freestanding` or omitted | `@mode(freestanding)` |
| `.lpweb` | Web-hosted-exclusive code | `web.scripted`, `web.compiled`, or omitted | `@mode(web.scripted)` |
| `.lphc` | Host-compiled (native) code | `host.native`, `host.dual`, or omitted | `@mode(host.native)` |
| `.lppkg` | Package manifest (`package.lppkg`) | N/A | N/A |

## Specification Files

- **Volume 1 — Core**: [`specs/loup-language-core-v1_20.md`](specs/loup-language-core-v1_20.md) — Execution modes (7 modes including `portable`), lexical structure (`#` / `##` comments, `//` floor division), types (`complex`, `fixed`, `array[T, rank]`, `noreturn`, `impossible`), control flow (`attempt`, `unreachable`, `if const`), declarations (`const`, `const func`), ownership, safety annotations (`@total`, `@complete`, `@must_resolve`, `@noderef`), composable architecture templates (`template foundation` / `template overlay`), `.lppkg` manifests, and BNF grammar.
- **Volume 2 — Runtime**: [`specs/loup-language-runtime-v1_20.md`](specs/loup-language-runtime-v1_20.md) — Structured concurrency (`await group`, `spawn`, `for concurrent`), channels, FFI, reactive UI (`ui.web`, `ui.desktop`, `loup.ui`), runtime services, portals, and time-travel debugging (`debug.runtime`, `debug.recording`).
- **Volume 3 — Compilation**: [`specs/loup-language-compilation-v1_20.md`](specs/loup-language-compilation-v1_20.md) — Web compilation, host compilation (`host.scripted`, `host.dual`, `host.native`), and freestanding bare-metal compilation (`@mode(freestanding)`).
- **Volume 4 — Data Formats**: [`specs/loup-language-data-v1_20.md`](specs/loup-language-data-v1_20.md) — Serialization (`Serializable`, `Deserializable`) and declarative binary/text interchange (`@interchange`, `@field`, `core.interchange`).
- **Standard Library Reference**: [`specs/loup-stdlib-reference-v1_20.md`](specs/loup-stdlib-reference-v1_20.md) — `core.*`, `io.*`, `net.*`, `data.*`, `sync.*`, `structures.*`, `ui.*`, `debug.*`, `native.*`.
- **Packages Reference**: [`specs/loup-packages-reference-v1_12.md`](specs/loup-packages-reference-v1_12.md) — First-party `loup.*` packages (`loup.log`, `loup.config`, `loup.cli`, `loup.tensor`, `loup.autodiff`, `loup.tpu`, etc.).
- **Domain & Testing References**: [`specs/loup-testing-reference-v1_10.md`](specs/loup-testing-reference-v1_10.md), [`specs/loup-fortran-hpc-packages-v1_0.md`](specs/loup-fortran-hpc-packages-v1_0.md), [`specs/loup-cobol-mainframe-packages-v1_0_1.md`](specs/loup-cobol-mainframe-packages-v1_0_1.md), [`specs/loup-crypto-packages-v0_1.md`](specs/loup-crypto-packages-v0_1.md), [`specs/loup-qualification-plan-v1_0.md`](specs/loup-qualification-plan-v1_0.md).
- **Implementation Plan**: [`specs/implementation-plan.md`](specs/implementation-plan.md) — Architecture proposal, feature breakdown (5 layers), phased delivery roadmap (P0–P5), and verification plan.

## Agent Instructions

### Coding Style
- **TypeScript** with 2-space indentation throughout
- Use ESLint/Prettier formatting conventions
- Name modules in `camelCase`, components/classes in `PascalCase`, CLI commands in kebab-case
- Keep files focused: one grammar, one provider, or one handler per file

### Important Conventions
- **TextMate grammar scope names** follow the [Naming Conventions](https://macromates.com/manual/en/language_grammars#naming_conventions) standard (e.g., `keyword.control.loup`, `entity.name.function.loup`, `string.quoted.double.loup`)
- **LSP and DAP** use the official `vscode-languageserver` and `@vscode/debugadapter` libraries
- **Template fence injection grammars** must set `embeddedLanguages` in the extension manifest to enable inner language features
- **Loup-specific syntax** like `!{...}` (dynamic fields), `{$ $}` (template expressions), `{% %}` (template directives), `@mode(...)`, and `portal` must be highlighted distinctly

### Build & Test
```bash
# Install dependencies
npm install

# Build all packages
npm run build

# Watch mode (extension development)
npm run watch

# Run tests
npm test
```

### Development Workflow
1. Press `F5` in VSCode to launch the Extension Development Host
2. Open a `.loup` (or `.lpscr`, `.lpfree`, `.lpweb`, `.lphc`, `.lppkg`) file to verify syntax highlighting
3. Use the Debug Console to check extension activation logs

### Do Not Modify
- Files inside `.venv/` — managed by setup scripts only
- The normative language specifications in `specs/loup-*.md` — read-only reference
