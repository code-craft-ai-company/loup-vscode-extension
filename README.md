# Loup for Visual Studio Code

First-class language support for the **Loup programming language (v1.20)**, including syntax highlighting across all execution-mode file extensions, an out-of-process Language Server (LSP), a Debug Adapter (DAP), portal breakpoints, and time-travel debugging.

## Supported File Extensions

Loup v1.20 defines five mode-flavored source file extensions (§1-13.0.0) plus the package manifest extension (§1-13.3):

| Extension | Description | Allowed `@mode` Declarations | Default Fallback Mode |
|---|---|---|---|
| `.loup` | General Loup source file (library or any mode) | Any of the seven modes | `@mode(host.scripted)` |
| `.lpscr` | Host-script or dual-mode source file | `host.scripted`, `host.dual`, or omitted | `@mode(host.scripted)` |
| `.lpfree` | Freestanding bare-metal source file | `freestanding` or omitted | `@mode(freestanding)` |
| `.lpweb` | Web-hosted source file | `web.scripted`, `web.compiled`, or omitted | `@mode(web.scripted)` |
| `.lphc` | Host-compiled native source file | `host.native`, `host.dual`, or omitted | `@mode(host.native)` |
| `.lppkg` | Package manifest (`package.lppkg` / `loup.pkg`) | — | — |

## Features

- **Syntax Highlighting**: Complete TextMate grammar for Loup v1.20:
  - Seven execution modes: `@mode(web.scripted)`, `@mode(web.compiled)`, `@mode(host.scripted)`, `@mode(host.dual)`, `@mode(host.native)`, `@mode(freestanding)`, and `@mode(portable)`
  - Ownership & concurrency: `borrow`, `excl borrow`, `unique`, `onstack`, `consume`, `lifetime ~name`, `~static`, `noescape fn`, `reads`, `edits`, `takes`, `shares`, `modifier`, `safe`, `synchronized`, `atomic`, `await group`, `spawn`, `for concurrent`
  - Error handling & totality: `Option[T]`, `Result[T, E]`, `attempt`, `unreachable`, `noreturn`, `impossible`, `@total`, `@complete`, `@must_resolve`, `@noderef`
  - Numeric & scientific computing: fixed-width integers (`i8`–`u64`), `bigint` (`n`), `float32`/`float64` (`f32`/`f64`), `decimal` (`d`), `complex`/`complex32`/`complex64` (`i`/`i32`/`i64`), `fixed`, and rank-typed `array[T, rank]`
  - Compile-time evaluation & architecture templates: `const`, `const func`, `if const`, `template foundation`, `template overlay ... onto ...`, `part`
  - Strings & templates: `i"..."` interpolated strings (`{$ $}`), `r"..."` raw strings, `b"..."` bytes literals, `c"..."` char literals, multiline strings (`"""` / `'''`), and template fences with embedded language injection (HTML, CSS, JS, TS, Python, SQL, JSON, Markdown, Shell)
  - Comments: `#` single-line comments, `##` documentation comments, `/* ... */` block comments (`//` is floor division)
- **Package Manifests (`.lppkg`)**: Syntax highlighting, dependency tree view, and task auto-detection for `package.lppkg` and `loup.pkg`
- **Language Server (LSP)**: Diagnostics, context-aware completions (`@mode`, annotations, `core.*` / `io.*` / `net.*` / `data.*` / `sync.*` / `structures.*` / `ui.*` / `debug.*` / `native.*` / `loup.*` stdlib & packages), hover docs, outline symbols, go-to-definition, folding, semantic tokens, formatting, quick-fix code actions, and signature help
- **Debugging (DAP)**: Launch/attach debugging, portal breakpoints, structured concurrency task group visualizer, and time-travel trace capture & replay (`.loup-trace`)

## Development

```bash
# Install dependencies
npm install

# Build all packages
npm run build

# Watch mode
npm run watch

# Run tests
npm test
```

Press **F5** in VSCode to launch the Extension Development Host and open [`samples/showcase.loup`](samples/showcase.loup) or [`samples/package.lppkg`](samples/package.lppkg) to verify.

## Architecture

| Package | Description |
|---|---|
| `packages/extension` | VSCode extension client (activation, grammar, snippets, status bar, commands, views) |
| `packages/language-server` | LSP server (lexer, parser, symbol table, diagnostics, completions, hover, navigation) |
| `packages/debug-adapter` | DAP server (breakpoints, stepping, portal breakpoints, time-travel trace integration) |
