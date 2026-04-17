# loom-vscode-extension

Visual Studio Code extension for the [Loom programming language](specs/loom-language-reference-v1_16.md) (v1.16).

## Packages

- `packages/extension` — the VSCode extension: grammars, snippets, language configuration, commands, webview panels.
- `packages/language-server` — Loom LSP server (lexer, parser, diagnostics, completions, hover, navigation, semantic tokens, formatting).
- `packages/debug-adapter` — Loom DAP server (breakpoints, portal breakpoints, time-travel debugging).

## Features

- Syntax highlighting for `.loom` files and `.lmpkg` / `loom.pkg` manifests.
- Grammar covers the full Loom v1.16 surface: `@mode(...)`, `namespace`, ownership verbs (`reads`/`edits`/`takes`/`shares`), `modifier` methods, `safe`/`synchronized`/`atomic`/`unsafe` blocks, `unique`/`arc` bindings, `consume`, `requires … distinct(...)`, macros with `quote { }`, inline `asm { }`, lifetime labels `~name`, and `reinterpret[T,U]` / `size_of[T]` / `align_of[T]` expressions.
- Template fence injections for `html`, `ui`, `css`, `js`, `ts`, `py`, `sql`, `json`, `md`, `sh`, `wgsl`, `metal`, `glsl`, plus a generic catch-all.
- Snippets for common constructs including freestanding stubs (`@entry`, `@panic_handler`, `@interrupt`).
- Launch targets: `cli`, `browser`, `service`, `desktop`, `native`, `wasm`, `node`, `bun`, `deno`, `freestanding`.

## Build

```bash
npm install
npm run build
```

See [AGENTS.md](AGENTS.md) for development conventions.
