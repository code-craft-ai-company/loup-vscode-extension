// ============================================================================
// Loup package manifest (.lppkg / loup.pkg) — a reader for the dependency view.
// No `vscode` import, so it can be tested on its own.
// ============================================================================

export interface PackageDep {
  name: string;
  version: string;
  isDev: boolean;
  isOverride?: boolean;
  path?: string;
  git?: string;
}

export interface TargetProfile {
  name: string;
  includes: string[];
  excludes: string[];
}

export interface ParsedManifest {
  packageName: string;
  version: string;
  loupVersion?: string;
  sharedAbiVersion?: string;
  mode?: string;
  deps: PackageDep[];
  devDeps: PackageDep[];
  devOverrides: PackageDep[];
  targets: TargetProfile[];
}

/** The line without its `#` comment. A `#` inside a quoted string is kept. */
export function stripComment(line: string): string {
  let quote = '';
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quote) {
      if (ch === '\\') i++;
      else if (ch === quote) quote = '';
    } else if (ch === '"' || ch === "'") {
      quote = ch;
    } else if (ch === '#') {
      return line.slice(0, i);
    }
  }
  return line;
}

export function parseManifest(content: string): ParsedManifest {
  const result: ParsedManifest = {
    packageName: 'unnamed',
    version: '0.0.0',
    deps: [],
    devDeps: [],
    devOverrides: [],
    targets: [],
  };

  let currentSection = '';
  let currentTarget: TargetProfile | null = null;

  for (const rawLine of content.split(/\r?\n/)) {
    const line = stripComment(rawLine).trim();
    if (!line) continue;

    // Section header
    const secMatch = line.match(/^\[([^\]]+)\]$/);
    if (secMatch) {
      if (currentTarget) {
        result.targets.push(currentTarget);
        currentTarget = null;
      }
      currentSection = secMatch[1].trim();
      if (currentSection.startsWith('target.') || currentSection.startsWith('delivery.')) {
        currentTarget = {
          name: currentSection.replace(/^(target|delivery)\./, ''),
          includes: [],
          excludes: [],
        };
      }
      continue;
    }

    // Top-level keys (both `package my-app` and `name = "my-app"` syntax)
    if (!currentSection) {
      const pkgMatch = line.match(/^(?:package|name)\s*(?:=\s*|\s)"?([^\s"]+)"?/);
      if (pkgMatch) { result.packageName = pkgMatch[1]; continue; }
      const verMatch = line.match(/^version\s*(?:=\s*|\s)"?([^\s"]+)"?/);
      if (verMatch) { result.version = verMatch[1]; continue; }
      const loupMatch = line.match(/^loup\s*(?:=\s*|\s)"?([^"]+)"?/);
      if (loupMatch) { result.loupVersion = loupMatch[1].trim(); continue; }
      const abiMatch = line.match(/^shared_abi_version\s*(?:=\s*|\s)(\S+)/);
      if (abiMatch) { result.sharedAbiVersion = abiMatch[1]; continue; }
    }

    if (currentSection === 'build') {
      const modeMatch = line.match(/^mode\s*=\s*"([^"]+)"/);
      if (modeMatch) { result.mode = modeMatch[1]; continue; }
    }

    // Deps (`[deps]` or `[dependencies]`)
    if (currentSection === 'deps' || currentSection === 'dependencies') {
      const dep = parseDep(line, false);
      if (dep) result.deps.push(dep);
    } else if (currentSection === 'dev-deps' || currentSection === 'dev-dependencies') {
      const dep = parseDep(line, true);
      if (dep) result.devDeps.push(dep);
    } else if (currentSection === 'dev-overrides') {
      const dep = parseDep(line, true);
      if (dep) {
        dep.isOverride = true;
        result.devOverrides.push(dep);
      }
    } else if (currentTarget) {
      // `include = ["io.fs", …]` (a TOML array, §1-13.3). The bare `include io.fs`
      // of earlier spec revisions is not valid TOML; it is still listed here so
      // an old manifest shows what it meant.
      const listMatch = line.match(/^(include|exclude)\s*=\s*\[(.*)\]\s*$/);
      const bareMatch = line.match(/^(include|exclude)\s+([A-Za-z0-9_.]+)\s*$/);
      const names = listMatch
        ? Array.from(listMatch[2].matchAll(/"([^"]*)"|'([^']*)'/g), (q) => q[1] ?? q[2])
        : bareMatch
          ? [bareMatch[2]]
          : [];
      const kind = listMatch?.[1] ?? bareMatch?.[1];
      if (kind === 'include') currentTarget.includes.push(...names);
      if (kind === 'exclude') currentTarget.excludes.push(...names);
    }
  }

  if (currentTarget) {
    result.targets.push(currentTarget);
  }

  return result;
}

function parseDep(line: string, isDev: boolean): PackageDep | null {
  // Simple: name = "^1.0"
  const simpleMatch = line.match(/^"?([a-zA-Z0-9_.-]+)"?\s*=\s*"([^"]+)"/);
  if (simpleMatch) {
    return { name: simpleMatch[1], version: simpleMatch[2], isDev };
  }
  // Table: name = { path = "...", git = "..." }
  const tableMatch = line.match(/^"?([a-zA-Z0-9_.-]+)"?\s*=\s*\{(.+)\}/);
  if (tableMatch) {
    const inner = tableMatch[2];
    const pathMatch = inner.match(/path\s*=\s*"([^"]+)"/);
    const gitMatch = inner.match(/git\s*=\s*"([^"]+)"/);
    const verMatch = inner.match(/version\s*=\s*"([^"]+)"/);
    return {
      name: tableMatch[1],
      version: verMatch?.[1] || (pathMatch ? `path:${pathMatch[1]}` : gitMatch ? `git:${gitMatch[1]}` : '*'),
      isDev,
      path: pathMatch?.[1],
      git: gitMatch?.[1],
    };
  }
  return null;
}

