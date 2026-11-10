// ============================================================================
// Loup Symbol Table — Scope resolver for go-to-definition and references
// ============================================================================

import * as AST from '../parser/ast.js';

export interface SymbolInfo {
  name: string;
  kind: SymbolKind;
  range: AST.Range;
  selectionRange: AST.Range;
  type?: string;
  children?: SymbolInfo[];
  scope?: Scope;
}

export enum SymbolKind {
  Function = 'Function',
  AsyncFunction = 'AsyncFunction',
  GenFunction = 'GenFunction',
  AsyncGenFunction = 'AsyncGenFunction',
  Class = 'Class',
  Enum = 'Enum',
  EnumVariant = 'EnumVariant',
  Struct = 'Struct',
  Interface = 'Interface',
  TypeAlias = 'TypeAlias',
  Macro = 'Macro',
  Variable = 'Variable',
  Parameter = 'Parameter',
  Portal = 'Portal',
  ExternFunction = 'ExternFunction',
  ExternValue = 'ExternValue',
  Import = 'Import',
  Field = 'Field',
  Operator = 'Operator',
  Namespace = 'Namespace',
}

export interface Scope {
  parent?: Scope;
  symbols: Map<string, SymbolInfo>;
  children: Scope[];
}

export class SymbolTable {
  private rootScope: Scope = { symbols: new Map(), children: [] };

  build(program: AST.Program): SymbolInfo[] {
    const symbols: SymbolInfo[] = [];
    for (const stmt of program.statements) {
      const sym = this.collectSymbol(stmt, this.rootScope);
      if (sym) symbols.push(sym);
    }
    return symbols;
  }

  getRoot(): Scope {
    return this.rootScope;
  }

  findSymbol(name: string, scope?: Scope): SymbolInfo | undefined {
    let current = scope || this.rootScope;
    while (current) {
      const sym = current.symbols.get(name);
      if (sym) return sym;
      current = current.parent!;
    }
    return undefined;
  }

  private collectSymbol(stmt: AST.Statement, scope: Scope): SymbolInfo | null {
    switch (stmt.kind) {
      case 'FunDecl': {
        const sym: SymbolInfo = {
          name: stmt.name,
          kind: stmt.isOperator ? SymbolKind.Operator : SymbolKind.Function,
          range: stmt.range,
          selectionRange: stmt.nameRange ?? stmt.range,
          type: this.formatFunType(stmt),
          children: [],
        };
        scope.symbols.set(stmt.name, sym);
        // Recurse into body
        const childScope = this.createChildScope(scope);
        for (const p of stmt.params) {
          childScope.symbols.set(p.name, {
            name: p.name,
            kind: SymbolKind.Parameter,
            range: p.range,
            selectionRange: p.nameRange ?? p.range,
            type: p.type ? this.formatType(p.type) : undefined,
          });
        }
        for (const bodyStmt of stmt.body.statements) {
          const childSym = this.collectSymbol(bodyStmt, childScope);
          if (childSym) sym.children!.push(childSym);
        }
        return sym;
      }

      case 'AsyncFunDecl': {
        const sym: SymbolInfo = {
          name: stmt.name,
          kind: SymbolKind.AsyncFunction,
          range: stmt.range,
          selectionRange: stmt.nameRange ?? stmt.range,
          type: this.formatAsyncFunType(stmt),
          children: [],
        };
        scope.symbols.set(stmt.name, sym);
        const childScope = this.createChildScope(scope);
        for (const p of stmt.params) {
          childScope.symbols.set(p.name, {
            name: p.name,
            kind: SymbolKind.Parameter,
            range: p.range,
            selectionRange: p.nameRange ?? p.range,
            type: p.type ? this.formatType(p.type) : undefined,
          });
        }
        for (const bodyStmt of stmt.body.statements) {
          const childSym = this.collectSymbol(bodyStmt, childScope);
          if (childSym) sym.children!.push(childSym);
        }
        return sym;
      }

      case 'ClassDecl': {
        const sym: SymbolInfo = {
          name: stmt.name,
          kind: SymbolKind.Class,
          range: stmt.range,
          selectionRange: stmt.nameRange ?? stmt.range,
          children: [],
        };
        scope.symbols.set(stmt.name, sym);
        const childScope = this.createChildScope(scope);
        for (const member of stmt.members) {
          const childSym = this.collectSymbol(member, childScope);
          if (childSym) sym.children!.push(childSym);
        }
        return sym;
      }

      case 'EnumDecl': {
        const sym: SymbolInfo = {
          name: stmt.name,
          kind: SymbolKind.Enum,
          range: stmt.range,
          selectionRange: stmt.nameRange ?? stmt.range,
          children: stmt.variants.map(v => ({
            name: v.name,
            kind: SymbolKind.EnumVariant,
            range: v.range,
            selectionRange: v.range,
          })),
        };
        scope.symbols.set(stmt.name, sym);
        return sym;
      }

      case 'InterfaceDecl': {
        const sym: SymbolInfo = {
          name: stmt.name,
          kind: SymbolKind.Interface,
          range: stmt.range,
          selectionRange: stmt.nameRange ?? stmt.range,
          children: stmt.methods.map(m => ({
            name: m.name,
            kind: SymbolKind.Function,
            range: m.range,
            selectionRange: m.nameRange ?? m.range,
            type: this.formatFunType(m),
          })),
        };
        scope.symbols.set(stmt.name, sym);
        return sym;
      }

      case 'LetDecl':
      case 'VarDecl': {
        const typeStr = stmt.typeAnnotation ? this.formatType(stmt.typeAnnotation) : undefined;
        let mainSym: SymbolInfo | undefined;
        
        const extractNames = (pattern: AST.DestructPattern) => {
          if (pattern.kind === 'IdentifierPattern') {
            const sym: SymbolInfo = {
              name: pattern.name,
              kind: SymbolKind.Variable,
              range: stmt.range,
              selectionRange: pattern.range,
              type: typeStr,
            };
            scope.symbols.set(pattern.name, sym);
            if (!mainSym) mainSym = sym;
          } else if (pattern.kind === 'TuplePattern' || pattern.kind === 'ListPattern') {
            pattern.elements.forEach(extractNames);
            if (pattern.rest) {
              const sym: SymbolInfo = { name: pattern.rest, kind: SymbolKind.Variable, range: stmt.range, selectionRange: stmt.range };
              scope.symbols.set(pattern.rest, sym);
            }
          } else if (pattern.kind === 'DictPattern') {
            pattern.fields.forEach(f => {
              const name = f.alias || f.key;
              const sym: SymbolInfo = { name, kind: SymbolKind.Variable, range: stmt.range, selectionRange: stmt.range };
              scope.symbols.set(name, sym);
            });
            if (pattern.rest) {
              const sym: SymbolInfo = { name: pattern.rest, kind: SymbolKind.Variable, range: stmt.range, selectionRange: stmt.range };
              scope.symbols.set(pattern.rest, sym);
            }
          }
        };

        extractNames(stmt.pattern);
        return mainSym || { name: '_', kind: SymbolKind.Variable, range: stmt.range, selectionRange: stmt.range };
      }

      case 'PortalStmt': {
        const sym: SymbolInfo = {
          name: stmt.name,
          kind: SymbolKind.Portal,
          range: stmt.range,
          selectionRange: stmt.range,
        };
        scope.symbols.set(`portal:${stmt.name}`, sym);
        return sym;
      }

      case 'ExternJsFunDecl': {
        const sym: SymbolInfo = {
          name: stmt.name,
          kind: SymbolKind.ExternFunction,
          range: stmt.range,
          selectionRange: stmt.nameRange ?? stmt.range,
          type: `extern js func`,
        };
        scope.symbols.set(stmt.name, sym);
        return sym;
      }

      case 'ExternJsValDecl': {
        const sym: SymbolInfo = {
          name: stmt.name,
          kind: SymbolKind.ExternValue,
          range: stmt.range,
          selectionRange: stmt.nameRange ?? stmt.range,
          type: `extern js val`,
        };
        scope.symbols.set(stmt.name, sym);
        return sym;
      }

      case 'ExternNativeFunDecl': {
        const sym: SymbolInfo = {
          name: stmt.name,
          kind: SymbolKind.ExternFunction,
          range: stmt.range,
          selectionRange: stmt.nameRange ?? stmt.range,
          type: `extern native "${stmt.library}" func`,
        };
        scope.symbols.set(stmt.name, sym);
        return sym;
      }

      case 'ImportStmt': {
        for (const n of stmt.names) {
          scope.symbols.set(n.alias || n.name, {
            name: n.alias || n.name,
            kind: SymbolKind.Import,
            range: n.range,
            selectionRange: n.range,
          });
        }
        return null;
      }

      case 'ReExportStmt': {
        for (const n of stmt.names) {
          scope.symbols.set(n.alias || n.name, {
            name: n.alias || n.name,
            kind: SymbolKind.Import,
            range: n.range,
            selectionRange: n.range,
          });
        }
        return null;
      }

      case 'GenFunDecl': {
        const sym: SymbolInfo = {
          name: stmt.name,
          kind: SymbolKind.GenFunction,
          range: stmt.range,
          selectionRange: stmt.nameRange ?? stmt.range,
          type: this.formatGenFunType(stmt),
          children: [],
        };
        scope.symbols.set(stmt.name, sym);
        const childScope = this.createChildScope(scope);
        for (const p of stmt.params) {
          childScope.symbols.set(p.name, {
            name: p.name,
            kind: SymbolKind.Parameter,
            range: p.range,
            selectionRange: p.nameRange ?? p.range,
            type: p.type ? this.formatType(p.type) : undefined,
          });
        }
        for (const bodyStmt of stmt.body.statements) {
          const childSym = this.collectSymbol(bodyStmt, childScope);
          if (childSym) sym.children!.push(childSym);
        }
        return sym;
      }

      case 'AsyncGenFunDecl': {
        const sym: SymbolInfo = {
          name: stmt.name,
          kind: SymbolKind.AsyncGenFunction,
          range: stmt.range,
          selectionRange: stmt.nameRange ?? stmt.range,
          type: this.formatAsyncGenFunType(stmt),
          children: [],
        };
        scope.symbols.set(stmt.name, sym);
        const childScope = this.createChildScope(scope);
        for (const p of stmt.params) {
          childScope.symbols.set(p.name, {
            name: p.name,
            kind: SymbolKind.Parameter,
            range: p.range,
            selectionRange: p.nameRange ?? p.range,
            type: p.type ? this.formatType(p.type) : undefined,
          });
        }
        for (const bodyStmt of stmt.body.statements) {
          const childSym = this.collectSymbol(bodyStmt, childScope);
          if (childSym) sym.children!.push(childSym);
        }
        return sym;
      }

      case 'StructDecl': {
        const sym: SymbolInfo = {
          name: stmt.name,
          kind: SymbolKind.Struct,
          range: stmt.range,
          selectionRange: stmt.nameRange ?? stmt.range,
          children: stmt.fields.map(f => ({
            name: f.name,
            kind: SymbolKind.Field,
            range: f.range,
            selectionRange: f.range,
            type: this.formatType(f.type),
          })),
        };
        scope.symbols.set(stmt.name, sym);
        // Add method children
        const childScope = this.createChildScope(scope);
        for (const method of stmt.methods) {
          const methodSym = this.collectSymbol(method, childScope);
          if (methodSym) sym.children!.push(methodSym);
        }
        return sym;
      }

      case 'TypeAliasDecl': {
        const sym: SymbolInfo = {
          name: stmt.name,
          kind: SymbolKind.TypeAlias,
          range: stmt.range,
          selectionRange: stmt.nameRange ?? stmt.range,
          type: `type ${stmt.name} = ${this.formatType(stmt.value)}`,
        };
        scope.symbols.set(stmt.name, sym);
        return sym;
      }

      case 'MacroDecl': {
        const sym: SymbolInfo = {
          name: stmt.name,
          kind: SymbolKind.Macro,
          range: stmt.range,
          selectionRange: stmt.nameRange ?? stmt.range,
          type: `macro ${stmt.name}(${stmt.params.map(p => p.name).join(', ')})`,
          children: [],
        };
        scope.symbols.set(stmt.name, sym);
        return sym;
      }

      case 'ExternNativeValDecl': {
        const sym: SymbolInfo = {
          name: stmt.name,
          kind: SymbolKind.ExternValue,
          range: stmt.range,
          selectionRange: stmt.nameRange ?? stmt.range,
          type: `extern native "${stmt.library}" val`,
        };
        scope.symbols.set(stmt.name, sym);
        return sym;
      }

      case 'NamespaceDecl': {
        // `namespace a.b;` only names the file; `namespace a.b { ... }` holds declarations.
        if (!stmt.body) return null;
        const sym: SymbolInfo = {
          name: stmt.name,
          kind: SymbolKind.Namespace,
          range: stmt.range,
          selectionRange: stmt.range,
          children: [],
        };
        for (const inner of stmt.body) {
          const childSym = this.collectSymbol(inner, scope);
          if (childSym) sym.children!.push(childSym);
        }
        return sym;
      }

      case 'AnnotatedDecl':
        return stmt.declaration ? this.collectSymbol(stmt.declaration, scope) : null;

      default:
        return null;
    }
  }

  private createChildScope(parent: Scope): Scope {
    const child: Scope = { parent, symbols: new Map(), children: [] };
    parent.children.push(child);
    return child;
  }

  private formatFunType(fun: AST.FunDecl): string {
    const params = fun.params
      .map(p => p.type ? `${p.name}: ${this.formatType(p.type)}` : p.name)
      .join(', ');
    const ret = fun.returnType ? `: ${this.formatType(fun.returnType)}` : '';
    return `func(${params})${ret}`;
  }

  private formatAsyncFunType(fun: AST.AsyncFunDecl): string {
    const params = fun.params
      .map(p => p.type ? `${p.name}: ${this.formatType(p.type)}` : p.name)
      .join(', ');
    const ret = fun.returnType ? `: ${this.formatType(fun.returnType)}` : '';
    return `async func(${params})${ret}`;
  }

  private formatGenFunType(fun: AST.GenFunDecl): string {
    const params = fun.params
      .map(p => p.type ? `${p.name}: ${this.formatType(p.type)}` : p.name)
      .join(', ');
    const ret = fun.returnType ? `: ${this.formatType(fun.returnType)}` : '';
    return `gen func(${params})${ret}`;
  }

  private formatAsyncGenFunType(fun: AST.AsyncGenFunDecl): string {
    const params = fun.params
      .map(p => p.type ? `${p.name}: ${this.formatType(p.type)}` : p.name)
      .join(', ');
    const ret = fun.returnType ? `: ${this.formatType(fun.returnType)}` : '';
    return `async gen func(${params})${ret}`;
  }

  formatType(type: AST.TypeExpr): string {
    switch (type.kind) {
      case 'SimpleType': return type.name;
      case 'GenericType': return `${type.name}[${type.args.map(a => this.formatType(a)).join(', ')}]`;
      case 'FunctionType': return `fn(${type.params.map(p => this.formatType(p)).join(', ')}): ${this.formatType(type.returnType)}`;
      case 'AsyncFunctionType': return `async fn(${type.params.map(p => this.formatType(p)).join(', ')}): ${this.formatType(type.returnType)}`;
      case 'OptionalType': return `${this.formatType(type.inner)}?`;
      case 'UnionType': return type.members.map(m => this.formatType(m)).join(' | ');
      case 'TupleType': return `tuple[${type.elements.map(e => this.formatType(e)).join(', ')}]`;
    }
  }
}
