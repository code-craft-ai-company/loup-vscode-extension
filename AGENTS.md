# Loom VSCode Extension

## Project Description

This repository implements a Visual Studio Code extension providing first-class support for the **Loom programming language** (v1.16). The extension is designed as a TypeScript monorepo with three packages:

| Package | Path | Purpose |
|---|---|---|
| **Extension Client** | `packages/extension/` | VSCode activation, commands, contributed grammars, snippets, status bar, webview panels |
| **Language Server** | `packages/language-server/` | Out-of-process LSP server — diagnostics, completions, hover, navigation, formatting |
| **Debug Adapter** | `packages/debug-adapter/` | DAP server — breakpoints, stepping, variables, portal breakpoints, time-travel debugging |

The extension supports Loom source files (`.loom`) and package manifests (`.lmpkg` / `loom.pkg`).

## Specification Files

- **Language Spec**: [`specs/loom-language-reference-v1_16.md`](specs/loom-language-reference-v1_16.md) — the complete Loom v1.16 language specification. This is the source of truth for all syntax, semantics, types, standard library, and runtime APIs.
- **Packages Spec**: [`specs/loom-packages-reference-v1_10.md`](specs/loom-packages-reference-v1_10.md) — package and extension library reference.
- **Stdlib Spec**: [`specs/loom-stdlib-reference-v1_10.md`](specs/loom-stdlib-reference-v1_10.md) — standard library reference (stub).
- **Testing Spec**: [`specs/loom-testing-reference-v1_10.md`](specs/loom-testing-reference-v1_10.md) — testing framework reference.
- **Implementation Plan**: [`specs/implementation-plan.md`](specs/implementation-plan.md) — architecture proposal, feature breakdown, phased delivery roadmap (P0–P5), and verification plan.

### Key Spec Sections for Extension Development (v1.16)

| Section | Content | Relevance |
|---|---|---|
| §2.5 File Modes | `@mode(scripted|compiled|native|freestanding)` directive | Grammar, completions, diagnostics |
| §3.4 Keywords | Full keyword list, contextual keywords, reserved | Grammar, lexer |
| §3.6 Literals | Integer/float suffixes, `char`/`bytes`/`raw`/interpolated | Grammar |
| §3.7 Operators | Precedence table including `//=`, `consume` | Grammar, operator detection |
| §6 Statements | Blocks, control flow, `defer`, `portal`, `match`, `atomic` | Grammar, snippets |
| §13.0 Namespace | `namespace pkg.module;` file-level declaration | Grammar, imports |
| §13.1 Imports | `from X import`, `prefer compiled`, grouped, relative | Grammar, navigation |
| §13.3 Package Manifest | `.lmpkg` TOML-ish format, `[build]`, `[dev-overrides]` | `loom-pkg` grammar |
| §13.10 Deferred Imports | `from X defer import (...)` for cycle breaking | Grammar |
| §14–§16 Strings & Templates | Multiline, interpolation `{$ $}`, directives `{% %}`, fences | Embedded-language injection |
| §17 Concurrency | `await group`, `atomic {}`, `spawn`, `TaskGroup` | Snippets, debug visualizer |
| §18 FFI | `extern js`, `extern native`, `@jsexport` | Grammar, diagnostics |
| §19 Reactive UI | `ui.root`, signals, `ComponentRegistry`, `View`, `ui` fence | Template fence resolution |
| §20.3 Debugging | Portals, trace events, capture/MCP/browser servers | Debug adapter |
| §21 Standard Library | `core.*`, `io.*`, `net.*`, `data.*`, `web.*`, `sync.*`, `lang.*`, `debug.*`, `structures.*`, `ui.*` | Completions |
| §23.4 Ownership | `reads`/`edits`/`takes`/`shares`, `modifier`, `safe`, `synchronized`, `unique`, `arc`, `consume`, `requires`, `distinct` | Grammar, hover |
| §24 Freestanding Mode | `asm`, `@entry`, `@panic_handler`, `@interrupt`, `@volatile`, `reinterpret`, `size_of` | Grammar, snippets |
| §25 Macros | `macro`/`pub macro`, `quote { }`, `name!(args)` invocation | Grammar, snippets |
| §27 Grammar Excerpts | Formal EBNF productions | Parser, TextMate grammar |

## Agent Instructions

### Coding Style
- **TypeScript** with 2-space indentation throughout
- Use ESLint/Prettier formatting conventions
- Name modules in `camelCase`, components/classes in `PascalCase`, CLI commands in kebab-case
- Keep files focused: one grammar, one provider, or one handler per file

### Important Conventions
- **TextMate grammar scope names** follow the [Naming Conventions](https://macromates.com/manual/en/language_grammars#naming_conventions) standard (e.g., `keyword.control.loom`, `entity.name.function.loom`, `string.quoted.double.loom`)
- **LSP and DAP** use the official `vscode-languageserver` and `@vscode/debugadapter` libraries
- **Template fence injection grammars** must set `embeddedLanguages` in the extension manifest to enable inner language features
- **Loom-specific syntax** like `!{...}` (dynamic fields), `{$ $}` (template expressions), `{% %}` (template directives), `portal`, lifetime labels `~name`, and `macro!(...)` invocations must be highlighted distinctly
- **Mode-aware highlighting** — some constructs (`asm`, `@interrupt`, `@volatile`, `unique`, `borrow`, `consume`) are only valid in specific `@mode(...)` declarations, per §2.5.3. The grammar highlights them unconditionally; diagnostics enforce mode restrictions.

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
2. Open a `.loom` file to verify syntax highlighting
3. Use the Debug Console to check extension activation logs

### Do Not Modify
- Files inside `.venv/` — managed by setup scripts only
- The language specifications under `specs/` — read-only references synced from the upstream `loom` repository
