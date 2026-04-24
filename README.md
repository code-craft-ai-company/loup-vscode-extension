# loom-vscode-extension

Visual Studio Code extension for the [Loom programming language](specs/loom-language-reference-v1_18.md) (v1.18).

## Packages

- `packages/extension` — the VSCode extension: grammars, snippets, language configuration, commands, webview panels.
- `packages/language-server` — Loom LSP server (lexer, parser, diagnostics, completions, hover, navigation, semantic tokens, formatting).
- `packages/debug-adapter` — Loom DAP server (breakpoints, portal breakpoints, time-travel debugging).

## Features

- Syntax highlighting for `.loom` files and `.lmpkg` / `loom.pkg` manifests.
- Grammar covers the full Loom v1.18 surface: dotted `@mode(web.scripted | web.compiled | host.scripted | host.dual | host.native | freestanding)`, `namespace`, ownership verbs (`reads` / `edits` / `takes` / `shares`), `modifier` methods, `safe` / `synchronized` / `atomic` / `unsafe` blocks, `unique` / `arc` / `local` / `shared` class modifiers, `shared(arena) T(...)` shared-constructor expressions, `consume`, `requires … distinct(...)`, macros with `quote { }`, inline `asm { }`, lifetime labels `~name`, and `reinterpret[T,U]` / `size_of[T]` / `align_of[T]` expressions.
- Serialization annotations (v1.18 §32): `@serializationId`, `@polymorphic`, `@tagged`, `@sealed`, `@serialField`, `@alias`, `@skip`, `@skipIfDefault`, `@sensitive`, `@serialVia`, `@migrateFrom`, `@optional`, `@open`, `@strictSchema`.
- Template fence injections for `html`, `ui`, `css`, `js`, `ts`, `py`, `sql`, `json`, `md`, `sh`, `wgsl`, `metal`, `glsl`, plus a generic catch-all.
- LSP completions for the v1.18 stdlib namespaces (`core.*`, `core.atomic`, `core.serialization`, `sync.shared`, `concurrent`, `io.*`, `net.*`, `data.*`, `web.*`, `ui.*`, `lang.*`, `debug.*`, `structures.*`, `native.*`, `runtime`).
- Snippets for common constructs including shared-memory, serialization, atomics, and freestanding stubs.
- Launch targets: `cli`, `browser`, `service`, `desktop`, `native`, `wasm`, `node`, `bun`, `deno`, `freestanding`.

## Build

```bash
npm install
npm run build
```

See [AGENTS.md](AGENTS.md) for development conventions.
