# Loom VSCode Extension

## Project Description

This repository implements a Visual Studio Code extension providing first-class support for the **Loom programming language** (v0.4). The extension is designed as a TypeScript monorepo with three packages:

| Package | Path | Purpose |
|---|---|---|
| **Extension Client** | `packages/extension/` | VSCode activation, commands, contributed grammars, snippets, status bar, webview panels |
| **Language Server** | `packages/language-server/` | Out-of-process LSP server — diagnostics, completions, hover, navigation, formatting |
| **Debug Adapter** | `packages/debug-adapter/` | DAP server — breakpoints, stepping, variables, portal breakpoints, time-travel debugging |

The extension supports Loom source files (`.loom`) and package manifests (`loom.pkg`).

## Specification Files

- **Language Spec**: [`specs/Loom-Language-Spec-v0.4.md`](specs/Loom-Language-Spec-v0.4.md) — the complete Loom v0.4 language specification. This is the source of truth for all syntax, semantics, types, standard library, and runtime APIs.
- **Implementation Plan**: [`specs/implementation-plan.md`](specs/implementation-plan.md) — architecture proposal, feature breakdown (5 layers), phased delivery roadmap (P0–P5), and verification plan.

### Key Spec Sections for Extension Development

| Section | Content | Relevance |
|---|---|---|
| §2 Core Syntax | Blocks, control flow, `defer`, `portal`, `match` | TextMate grammar, snippets |
| §3 Multiline Strings | `"""(...)` / `'''(...)` with alignment anchor `P` | Grammar, error detection |
| §4 Templates | Template fences, interpolation `{$ $}`, directives `{% %}` | Embedded language injection |
| §5 Imports & Packages | `from ... import`, `loom.pkg` manifest format | `loom.pkg` grammar, completions |
| §6 Types | Primitives, boxing, `Any`, enums, interfaces, `Option[T]`, `Result[T,E]` | Type display, completions |
| §7 Structured Concurrency | `await group`, `spawn`, `TaskGroup`, `for await` | Snippets, debug visualizer |
| §8 FFI | `extern js`, `extern native`, `@jsexport` | Grammar, diagnostics |
| §9 Reactive UI | `system.ui`, signals, `ComponentRegistry`, `View` | Template fence resolution |
| §10 Runtime & Debugging | `system.debug`, portals, trace events, capture/MCP servers | Debug adapter |
| §11 Standard Library | `system.text`, `system.json`, `system.time`, `system.collections` | Completions |
| §13 Grammar Excerpts | Informal BNF productions | Parser, TextMate grammar |

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
- **Loom-specific syntax** like `!{...}` (dynamic fields), `{$ $}` (template expressions), `{% %}` (template directives), and `portal` must be highlighted distinctly

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
- The language specification in `specs/Loom-Language-Spec-v0.4.md` — read-only reference
