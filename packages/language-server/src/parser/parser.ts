// ============================================================================
// Loom Parser — Recursive-descent, error-recovering parser for Loom v0.4
// ============================================================================

import { Lexer, Token, TokenKind } from './lexer.js';
import * as AST from './ast.js';

export class Parser {
  private tokens: Token[] = [];
  private pos = 0;
  private diagnostics: AST.ParseDiagnostic[] = [];
  private source = '';

  parse(source: string): { program: AST.Program; diagnostics: AST.ParseDiagnostic[] } {
    this.source = source;
    const lexer = new Lexer(source);
    this.tokens = lexer.tokenize().filter(
      t => t.kind !== TokenKind.LineComment && t.kind !== TokenKind.BlockComment
    );
    this.pos = 0;
    this.diagnostics = [];

    const statements: AST.Statement[] = [];
    while (!this.isAtEnd()) {
      try {
        const stmt = this.parseStatement();
        if (stmt) statements.push(stmt);
      } catch {
        // Error recovery: skip to next statement boundary
        this.synchronize();
      }
    }

    const program: AST.Program = {
      kind: 'Program',
      statements,
      range: {
        start: { line: 0, column: 0, offset: 0 },
        end: this.currentPos(),
      },
    };

    return { program, diagnostics: this.diagnostics };
  }

  // ---- Statement parsing ----

  private parseStatement(): AST.Statement | null {
    // Skip stray semicolons
    if (this.check(TokenKind.Semicolon)) {
      this.advance();
      return null;
    }

    // Annotations
    if (this.check(TokenKind.At)) {
      return this.parseAnnotatedDeclaration();
    }

    // Declarations with modifiers
    if (this.check(TokenKind.Pub)) {
      return this.parsePubDeclaration();
    }

    const kind = this.current().kind;

    switch (kind) {
      case TokenKind.Let: return this.parseLetDecl();
      case TokenKind.Var: return this.parseVarDecl();
      case TokenKind.Fun: return this.parseFunDecl(false, false);
      case TokenKind.Async: return this.parseAsyncFunDecl(false, false);
      case TokenKind.Class: return this.parseClassDecl(false);
      case TokenKind.Dynamic:
        if (this.peekKind(1) === TokenKind.Class) return this.parseClassDecl(true);
        return this.parseDynamicViewStmt();
      case TokenKind.Enum: return this.parseEnumDecl();
      case TokenKind.Interface: return this.parseInterfaceDecl();
      case TokenKind.From: return this.parseImportStmt();
      case TokenKind.Extern: return this.parseExternDecl();
      case TokenKind.If: return this.parseIfStmt();
      case TokenKind.While: return this.parseWhileStmt();
      case TokenKind.For: return this.parseForStmt();
      case TokenKind.Do: return this.parseDoWhileStmt();
      case TokenKind.Try: return this.parseTryStmt();
      case TokenKind.With: return this.parseWithStmt();
      case TokenKind.Defer: return this.parseDeferStmt();
      case TokenKind.Portal: return this.parsePortalStmt();
      case TokenKind.Match: return this.parseMatchExprAsStmt();
      case TokenKind.Await:
        if (this.peekKind(1) === TokenKind.Group) return this.parseAwaitGroupStmt();
        return this.parseExpressionStmt();
      case TokenKind.Return: return this.parseReturnStmt();
      case TokenKind.Break: return this.parseBreakStmt();
      case TokenKind.Continue: return this.parseContinueStmt();
      case TokenKind.Throw: return this.parseThrowStmt();
      default:
        // Check for labeled loops: identifier followed by ':'
        if (this.check(TokenKind.Identifier) && this.peekKind(1) === TokenKind.Colon) {
          return this.parseLabeledStmt();
        }
        return this.parseExpressionStmt();
    }
  }

  private parseAnnotatedDeclaration(): AST.AnnotatedDecl {
    const start = this.current();
    this.expect(TokenKind.At);
    const annotation = this.expect(TokenKind.Identifier).text;
    const declaration = this.parseStatement()!;
    return {
      kind: 'AnnotatedDecl',
      annotation,
      declaration,
      range: this.rangeFrom(start),
    };
  }

  private parsePubDeclaration(): AST.Statement {
    this.advance(); // consume pub
    if (this.check(TokenKind.Static)) {
      this.advance(); // consume static
      if (this.check(TokenKind.Fun)) return this.parseFunDecl(true, true);
      if (this.check(TokenKind.Async)) return this.parseAsyncFunDecl(true, true);
    }
    if (this.check(TokenKind.Fun)) return this.parseFunDecl(true, false);
    if (this.check(TokenKind.Async)) return this.parseAsyncFunDecl(true, false);
    if (this.check(TokenKind.Let)) return this.parseLetDecl();
    if (this.check(TokenKind.Var)) return this.parseVarDecl();
    // pub field: could be a class member
    return this.parseExpressionStmt();
  }

  private parseLetDecl(): AST.LetDecl {
    const start = this.current();
    this.expect(TokenKind.Let);
    const name = this.expect(TokenKind.Identifier, TokenKind.TypeIdentifier).text;
    const typeAnnotation = this.check(TokenKind.Colon) ? (this.advance(), this.parseTypeExpr()) : undefined;
    const initializer = this.check(TokenKind.Assign) ? (this.advance(), this.parseExpression()) : undefined;
    this.expect(TokenKind.Semicolon);
    return { kind: 'LetDecl', name, typeAnnotation, initializer, range: this.rangeFrom(start) };
  }

  private parseVarDecl(): AST.VarDecl {
    const start = this.current();
    this.expect(TokenKind.Var);
    const name = this.expect(TokenKind.Identifier, TokenKind.TypeIdentifier).text;
    const typeAnnotation = this.check(TokenKind.Colon) ? (this.advance(), this.parseTypeExpr()) : undefined;
    const initializer = this.check(TokenKind.Assign) ? (this.advance(), this.parseExpression()) : undefined;
    this.expect(TokenKind.Semicolon);
    return { kind: 'VarDecl', name, typeAnnotation, initializer, range: this.rangeFrom(start) };
  }

  private parseFunDecl(isPublic: boolean, isStatic: boolean): AST.FunDecl {
    const start = this.current();
    this.expect(TokenKind.Fun);
    const name = this.expect(TokenKind.Identifier, TokenKind.TypeIdentifier).text;
    const typeParams = this.parseOptionalTypeParams();
    this.expect(TokenKind.LeftParen);
    const params = this.parseParamList();
    this.expect(TokenKind.RightParen);
    const returnType = this.check(TokenKind.Colon) ? (this.advance(), this.parseTypeExpr()) : undefined;
    const body = this.parseBlock();
    return { kind: 'FunDecl', name, params, returnType, body, isPublic, isStatic, typeParams, range: this.rangeFrom(start) };
  }

  private parseAsyncFunDecl(isPublic: boolean, isStatic: boolean): AST.AsyncFunDecl {
    const start = this.current();
    this.expect(TokenKind.Async);
    this.expect(TokenKind.Fun);
    const name = this.expect(TokenKind.Identifier, TokenKind.TypeIdentifier).text;
    const typeParams = this.parseOptionalTypeParams();
    this.expect(TokenKind.LeftParen);
    const params = this.parseParamList();
    this.expect(TokenKind.RightParen);
    const returnType = this.check(TokenKind.Colon) ? (this.advance(), this.parseTypeExpr()) : undefined;
    const body = this.parseBlock();
    return { kind: 'AsyncFunDecl', name, params, returnType, body, isPublic, isStatic, typeParams, range: this.rangeFrom(start) };
  }

  private parseClassDecl(isDynamic: boolean): AST.ClassDecl {
    const start = this.current();
    if (isDynamic) this.advance(); // consume 'dynamic'
    this.expect(TokenKind.Class);
    const name = this.expect(TokenKind.TypeIdentifier).text;
    const typeParams = this.parseOptionalTypeParams();
    let superClass: string | undefined;
    if (this.check(TokenKind.Colon)) {
      this.advance();
      superClass = this.expect(TokenKind.TypeIdentifier).text;
    }
    this.expect(TokenKind.LeftBrace);
    const members: AST.Statement[] = [];
    while (!this.check(TokenKind.RightBrace) && !this.isAtEnd()) {
      const mem = this.parseStatement();
      if (mem) members.push(mem);
    }
    this.expect(TokenKind.RightBrace);
    return { kind: 'ClassDecl', name, isDynamic, superClass, members, typeParams, range: this.rangeFrom(start) };
  }

  private parseEnumDecl(): AST.EnumDecl {
    const start = this.current();
    this.expect(TokenKind.Enum);
    const name = this.expect(TokenKind.TypeIdentifier).text;
    const typeParams = this.parseOptionalTypeParams();
    this.expect(TokenKind.LeftBrace);
    const variants: AST.EnumVariant[] = [];
    while (!this.check(TokenKind.RightBrace) && !this.isAtEnd()) {
      const varStart = this.current();
      const varName = this.expect(TokenKind.TypeIdentifier, TokenKind.Identifier).text;
      const fields: AST.Parameter[] = [];
      if (this.check(TokenKind.LeftParen)) {
        this.advance();
        while (!this.check(TokenKind.RightParen) && !this.isAtEnd()) {
          fields.push(this.parseParam());
          if (this.check(TokenKind.Comma)) this.advance();
        }
        this.expect(TokenKind.RightParen);
      }
      variants.push({ kind: 'EnumVariant', name: varName, fields, range: this.rangeFrom(varStart) });
      if (this.check(TokenKind.Comma)) this.advance();
    }
    this.expect(TokenKind.RightBrace);
    return { kind: 'EnumDecl', name, variants, typeParams, range: this.rangeFrom(start) };
  }

  private parseInterfaceDecl(): AST.InterfaceDecl {
    const start = this.current();
    this.expect(TokenKind.Interface);
    const name = this.expect(TokenKind.TypeIdentifier).text;
    const typeParams = this.parseOptionalTypeParams();
    this.expect(TokenKind.LeftBrace);
    const methods: AST.FunDecl[] = [];
    while (!this.check(TokenKind.RightBrace) && !this.isAtEnd()) {
      if (this.check(TokenKind.Fun) || this.check(TokenKind.Pub) || this.check(TokenKind.Static)) {
        const stmt = this.parseStatement();
        if (stmt && stmt.kind === 'FunDecl') methods.push(stmt);
      } else {
        this.advance(); // skip unexpected in interface
      }
    }
    this.expect(TokenKind.RightBrace);
    return { kind: 'InterfaceDecl', name, methods, typeParams, range: this.rangeFrom(start) };
  }

  private parseImportStmt(): AST.ImportStmt | AST.ImportBlockStmt {
    const start = this.current();
    this.expect(TokenKind.From);
    let path = '';
    // Read dotted path (., .., ..|.., package.sub.module)
    while (!this.check(TokenKind.Import) && !this.check(TokenKind.LeftBrace) && !this.isAtEnd()) {
      path += this.advance().text;
    }
    path = path.trim();

    if (this.check(TokenKind.Import)) {
      this.advance();
      this.expect(TokenKind.LeftParen);
      const names = this.parseImportNames();
      this.expect(TokenKind.RightParen);
      this.expect(TokenKind.Semicolon);
      return { kind: 'ImportStmt', path, names, range: this.rangeFrom(start) };
    }

    // Block import: from pkg { module import (Name); ... }
    this.expect(TokenKind.LeftBrace);
    const imports: AST.ImportStmt[] = [];
    while (!this.check(TokenKind.RightBrace) && !this.isAtEnd()) {
      let subPath = '';
      while (!this.check(TokenKind.Import) && !this.check(TokenKind.RightBrace) && !this.isAtEnd()) {
        subPath += this.advance().text;
      }
      subPath = subPath.trim();
      if (this.check(TokenKind.Import)) {
        this.advance();
        this.expect(TokenKind.LeftParen);
        const names = this.parseImportNames();
        this.expect(TokenKind.RightParen);
        this.expect(TokenKind.Semicolon);
        imports.push({ kind: 'ImportStmt', path: subPath, names, range: this.rangeFrom(start) });
      }
    }
    this.expect(TokenKind.RightBrace);
    return { kind: 'ImportBlockStmt', path, imports, range: this.rangeFrom(start) };
  }

  private parseImportNames(): AST.ImportName[] {
    const names: AST.ImportName[] = [];
    while (!this.check(TokenKind.RightParen) && !this.isAtEnd()) {
      const nameStart = this.current();
      const name = this.advance().text;
      let alias: string | undefined;
      if (this.check(TokenKind.As)) {
        this.advance();
        alias = this.advance().text;
      }
      names.push({ kind: 'ImportName', name, alias, range: this.rangeFrom(nameStart) });
      if (this.check(TokenKind.Comma)) this.advance();
    }
    return names;
  }

  private parseExternDecl(): AST.Statement {
    const start = this.current();
    this.expect(TokenKind.Extern);

    if (this.check(TokenKind.Js)) {
      this.advance();
      if (this.check(TokenKind.Fun)) {
        this.advance();
        const name = this.expect(TokenKind.Identifier, TokenKind.TypeIdentifier).text;
        this.expect(TokenKind.LeftParen);
        const params = this.parseParamList();
        this.expect(TokenKind.RightParen);
        this.expect(TokenKind.Colon);
        const returnType = this.parseTypeExpr();
        this.expect(TokenKind.Semicolon);
        return { kind: 'ExternJsFunDecl', name, params, returnType, range: this.rangeFrom(start) };
      }
      if (this.check(TokenKind.Val)) {
        this.advance();
        const name = this.expect(TokenKind.Identifier, TokenKind.TypeIdentifier).text;
        this.expect(TokenKind.Colon);
        const type = this.parseTypeExpr();
        this.expect(TokenKind.Semicolon);
        return { kind: 'ExternJsValDecl', name, type, range: this.rangeFrom(start) };
      }
    }

    if (this.check(TokenKind.Native)) {
      this.advance();
      const library = this.expect(TokenKind.StringLiteral).text.slice(1, -1);
      this.expect(TokenKind.Fun);
      const name = this.expect(TokenKind.Identifier, TokenKind.TypeIdentifier).text;
      this.expect(TokenKind.LeftParen);
      const params = this.parseParamList();
      this.expect(TokenKind.RightParen);
      this.expect(TokenKind.Colon);
      const returnType = this.parseTypeExpr();
      this.expect(TokenKind.Semicolon);
      return { kind: 'ExternNativeFunDecl', library, name, params, returnType, range: this.rangeFrom(start) };
    }

    this.addDiagnostic('Expected "js" or "native" after "extern"', start);
    return this.errorNode(start);
  }

  // ---- Control flow ----

  private parseIfStmt(): AST.IfStmt {
    const start = this.current();
    this.expect(TokenKind.If);
    this.expect(TokenKind.LeftParen);
    const condition = this.parseExpression();
    this.expect(TokenKind.RightParen);
    const consequent = this.parseBlock();
    let alternate: AST.Block | AST.IfStmt | undefined;
    if (this.check(TokenKind.Else)) {
      this.advance();
      if (this.check(TokenKind.If)) {
        alternate = this.parseIfStmt();
      } else {
        alternate = this.parseBlock();
      }
    }
    return { kind: 'IfStmt', condition, consequent, alternate, range: this.rangeFrom(start) };
  }

  private parseWhileStmt(label?: string): AST.WhileStmt {
    const start = this.current();
    this.expect(TokenKind.While);
    this.expect(TokenKind.LeftParen);
    const condition = this.parseExpression();
    this.expect(TokenKind.RightParen);
    const body = this.parseBlock();
    return { kind: 'WhileStmt', condition, body, label, range: this.rangeFrom(start) };
  }

  private parseForStmt(label?: string): AST.ForStmt | AST.ForInStmt | AST.ForAwaitStmt {
    const start = this.current();
    this.expect(TokenKind.For);

    // for await
    if (this.check(TokenKind.Await)) {
      this.advance();
      this.expect(TokenKind.LeftParen);
      const variable = this.expect(TokenKind.Identifier).text;
      this.expect(TokenKind.In);
      const iterable = this.parseExpression();
      this.expect(TokenKind.RightParen);
      const body = this.parseBlock();
      return { kind: 'ForAwaitStmt', variable, iterable, body, label, range: this.rangeFrom(start) };
    }

    this.expect(TokenKind.LeftParen);

    // Determine: for-in vs C-style for
    // Look ahead for `x in expr`
    if ((this.check(TokenKind.Identifier) || this.check(TokenKind.Let)) && this.hasInAhead()) {
      let variable: string;
      if (this.check(TokenKind.Let)) {
        this.advance();
      }
      variable = this.expect(TokenKind.Identifier).text;
      this.expect(TokenKind.In);
      const iterable = this.parseExpression();
      this.expect(TokenKind.RightParen);
      const body = this.parseBlock();
      return { kind: 'ForInStmt', variable, iterable, body, label, range: this.rangeFrom(start) };
    }

    // C-style for
    const init = this.parseStatement()!;
    const condition = this.parseExpression();
    this.expect(TokenKind.Semicolon);
    const step = this.parseExpression();
    this.expect(TokenKind.RightParen);
    const body = this.parseBlock();
    return { kind: 'ForStmt', init, condition, step, body, label, range: this.rangeFrom(start) };
  }

  private hasInAhead(): boolean {
    // Scan ahead from current position to check if there's an 'in' before ')' or ';'
    let i = this.pos;
    // skip let
    if (this.tokens[i]?.kind === TokenKind.Let) i++;
    // skip identifier
    if (this.tokens[i]?.kind === TokenKind.Identifier) i++;
    return this.tokens[i]?.kind === TokenKind.In;
  }

  private parseDoWhileStmt(label?: string): AST.DoWhileStmt {
    const start = this.current();
    this.expect(TokenKind.Do);
    const body = this.parseBlock();
    this.expect(TokenKind.While);
    this.expect(TokenKind.LeftParen);
    const condition = this.parseExpression();
    this.expect(TokenKind.RightParen);
    this.expect(TokenKind.Semicolon);
    return { kind: 'DoWhileStmt', body, condition, label, range: this.rangeFrom(start) };
  }

  private parseTryStmt(): AST.TryStmt {
    const start = this.current();
    this.expect(TokenKind.Try);
    const tryBlock = this.parseBlock();
    const catchClauses: AST.CatchClause[] = [];
    while (this.check(TokenKind.Catch)) {
      const cStart = this.current();
      this.advance();
      this.expect(TokenKind.LeftParen);
      const types: string[] = [];
      types.push(this.advance().text);
      while (this.check(TokenKind.Pipe)) {
        this.advance();
        types.push(this.advance().text);
      }
      let name: string | undefined;
      if (this.check(TokenKind.As)) {
        this.advance();
        name = this.advance().text;
      }
      this.expect(TokenKind.RightParen);
      const body = this.parseBlock();
      catchClauses.push({ kind: 'CatchClause', types, name, body, range: this.rangeFrom(cStart) });
    }
    let finallyBlock: AST.Block | undefined;
    if (this.check(TokenKind.Finally)) {
      this.advance();
      finallyBlock = this.parseBlock();
    }
    return { kind: 'TryStmt', tryBlock, catchClauses, finallyBlock, range: this.rangeFrom(start) };
  }

  private parseWithStmt(): AST.WithStmt {
    const start = this.current();
    this.expect(TokenKind.With);
    this.expect(TokenKind.LeftParen);
    const name = this.expect(TokenKind.Identifier).text;
    this.expect(TokenKind.Assign);
    const resource = this.parseExpression();
    this.expect(TokenKind.RightParen);
    const body = this.parseBlock();
    return { kind: 'WithStmt', name, resource, body, range: this.rangeFrom(start) };
  }

  private parseDeferStmt(): AST.DeferCallStmt | AST.DeferBlockStmt {
    const start = this.current();
    this.expect(TokenKind.Defer);
    if (this.check(TokenKind.LeftBrace)) {
      const body = this.parseBlock();
      return { kind: 'DeferBlockStmt', body, range: this.rangeFrom(start) };
    }
    const expression = this.parseExpression();
    this.expect(TokenKind.Semicolon);
    return { kind: 'DeferCallStmt', expression, range: this.rangeFrom(start) };
  }

  private parsePortalStmt(): AST.PortalStmt {
    const start = this.current();
    this.expect(TokenKind.Portal);
    let name: string;
    if (this.check(TokenKind.StringLiteral)) {
      name = this.advance().text.slice(1, -1);
    } else {
      name = this.advance().text;
    }
    const body = this.parseBlock();
    return { kind: 'PortalStmt', name, body, range: this.rangeFrom(start) };
  }

  private parseAwaitGroupStmt(): AST.AwaitGroupStmt {
    const start = this.current();
    this.expect(TokenKind.Await);
    this.expect(TokenKind.Group);
    const body = this.parseBlock();
    return { kind: 'AwaitGroupStmt', body, range: this.rangeFrom(start) };
  }

  private parseDynamicViewStmt(): AST.DynamicViewStmt {
    const start = this.current();
    this.expect(TokenKind.Dynamic);
    const object = this.parseExpression();
    this.expect(TokenKind.As);
    const alias = this.expect(TokenKind.Identifier).text;
    const body = this.parseBlock();
    return { kind: 'DynamicViewStmt', object, alias, body, range: this.rangeFrom(start) };
  }

  private parseReturnStmt(): AST.ReturnStmt {
    const start = this.current();
    this.expect(TokenKind.Return);
    let value: AST.Expression | undefined;
    if (!this.check(TokenKind.Semicolon) && !this.check(TokenKind.RightBrace)) {
      value = this.parseExpression();
    }
    this.expect(TokenKind.Semicolon);
    return { kind: 'ReturnStmt', value, range: this.rangeFrom(start) };
  }

  private parseBreakStmt(): AST.BreakStmt {
    const start = this.current();
    this.expect(TokenKind.Break);
    const label = this.check(TokenKind.Identifier) ? this.advance().text : undefined;
    this.expect(TokenKind.Semicolon);
    return { kind: 'BreakStmt', label, range: this.rangeFrom(start) };
  }

  private parseContinueStmt(): AST.ContinueStmt {
    const start = this.current();
    this.expect(TokenKind.Continue);
    const label = this.check(TokenKind.Identifier) ? this.advance().text : undefined;
    this.expect(TokenKind.Semicolon);
    return { kind: 'ContinueStmt', label, range: this.rangeFrom(start) };
  }

  private parseThrowStmt(): AST.ThrowStmt {
    const start = this.current();
    this.expect(TokenKind.Throw);
    const value = this.parseExpression();
    this.expect(TokenKind.Semicolon);
    return { kind: 'ThrowStmt', value, range: this.rangeFrom(start) };
  }

  private parseLabeledStmt(): AST.Statement {
    const label = this.expect(TokenKind.Identifier).text;
    this.expect(TokenKind.Colon);
    if (this.check(TokenKind.For)) return this.parseForStmt(label);
    if (this.check(TokenKind.While)) return this.parseWhileStmt(label);
    if (this.check(TokenKind.Do)) return this.parseDoWhileStmt(label);
    this.addDiagnostic('Label must precede a loop statement', this.current());
    return this.parseExpressionStmt();
  }

  private parseExpressionStmt(): AST.ExpressionStmt {
    const start = this.current();
    const expression = this.parseExpression();
    // Some expressions (like match used as statement) don't need semicolons
    if (this.check(TokenKind.Semicolon)) this.advance();
    return { kind: 'ExpressionStmt', expression, range: this.rangeFrom(start) };
  }

  private parseMatchExprAsStmt(): AST.ExpressionStmt {
    const start = this.current();
    const expression = this.parseMatchExpr();
    return { kind: 'ExpressionStmt', expression, range: this.rangeFrom(start) };
  }

  // ---- Expression parsing (Pratt-style precedence climbing) ----

  private parseExpression(): AST.Expression {
    return this.parseAssignment();
  }

  private parseAssignment(): AST.Expression {
    const left = this.parseNullCoalesce();
    if (this.check(TokenKind.Assign)) {
      const start = this.tokens[this.pos - 1] || this.current();
      this.advance();
      const value = this.parseAssignment();
      return { kind: 'AssignExpr', target: left, value, range: this.rangeFrom(start) };
    }
    return left;
  }

  private parseNullCoalesce(): AST.Expression {
    let left = this.parseOr();
    while (this.check(TokenKind.QuestionQuestion)) {
      const start = this.current();
      this.advance();
      const right = this.parseOr();
      left = { kind: 'NullCoalesceExpr', left, right, range: this.rangeFrom(start) };
    }
    return left;
  }

  private parseOr(): AST.Expression {
    let left = this.parseAnd();
    while (this.check(TokenKind.Or)) {
      const start = this.current();
      this.advance();
      const right = this.parseAnd();
      left = { kind: 'BinaryExpr', operator: '||', left, right, range: this.rangeFrom(start) };
    }
    return left;
  }

  private parseAnd(): AST.Expression {
    let left = this.parseEquality();
    while (this.check(TokenKind.And)) {
      const start = this.current();
      this.advance();
      const right = this.parseEquality();
      left = { kind: 'BinaryExpr', operator: '&&', left, right, range: this.rangeFrom(start) };
    }
    return left;
  }

  private parseEquality(): AST.Expression {
    let left = this.parseComparison();
    while (this.check(TokenKind.EqualEqual) || this.check(TokenKind.BangEqual)) {
      const op = this.advance().text;
      const right = this.parseComparison();
      left = { kind: 'BinaryExpr', operator: op, left, right, range: left.range };
    }
    return left;
  }

  private parseComparison(): AST.Expression {
    let left = this.parseAddition();
    while (
      this.check(TokenKind.LessThan) ||
      this.check(TokenKind.LessEqual) ||
      this.check(TokenKind.GreaterThan) ||
      this.check(TokenKind.GreaterEqual)
    ) {
      const op = this.advance().text;
      const right = this.parseAddition();
      left = { kind: 'BinaryExpr', operator: op, left, right, range: left.range };
    }
    return left;
  }

  private parseAddition(): AST.Expression {
    let left = this.parseMultiplication();
    while (this.check(TokenKind.Plus) || this.check(TokenKind.Minus)) {
      const op = this.advance().text;
      const right = this.parseMultiplication();
      left = { kind: 'BinaryExpr', operator: op, left, right, range: left.range };
    }
    return left;
  }

  private parseMultiplication(): AST.Expression {
    let left = this.parseUnary();
    while (this.check(TokenKind.Star) || this.check(TokenKind.Slash) || this.check(TokenKind.Percent)) {
      const op = this.advance().text;
      const right = this.parseUnary();
      left = { kind: 'BinaryExpr', operator: op, left, right, range: left.range };
    }
    return left;
  }

  private parseUnary(): AST.Expression {
    if (this.check(TokenKind.Bang) || this.check(TokenKind.Minus)) {
      const start = this.current();
      const op = this.advance().text;
      const operand = this.parseUnary();
      return { kind: 'UnaryExpr', operator: op, operand, range: this.rangeFrom(start) };
    }
    return this.parsePostfix();
  }

  private parsePostfix(): AST.Expression {
    let expr = this.parsePrimary();

    while (true) {
      if (this.check(TokenKind.LeftParen)) {
        // Function call
        this.advance();
        const args: AST.Expression[] = [];
        while (!this.check(TokenKind.RightParen) && !this.isAtEnd()) {
          args.push(this.parseExpression());
          if (this.check(TokenKind.Comma)) this.advance();
        }
        this.expect(TokenKind.RightParen);
        expr = { kind: 'CallExpr', callee: expr, args, range: expr.range };
      } else if (this.check(TokenKind.Dot)) {
        this.advance();
        const property = this.advance().text;
        expr = { kind: 'MemberExpr', object: expr, property, range: expr.range };
      } else if (this.check(TokenKind.QuestionDot)) {
        this.advance();
        const property = this.advance().text;
        expr = { kind: 'OptionalChainExpr', object: expr, property, range: expr.range };
      } else if (this.check(TokenKind.LeftBracket)) {
        this.advance();
        const index = this.parseExpression();
        this.expect(TokenKind.RightBracket);
        expr = { kind: 'IndexExpr', object: expr, index, range: expr.range };
      } else if (this.check(TokenKind.BangLeftBrace)) {
        this.advance();
        let field: string;
        if (this.check(TokenKind.StringLiteral)) {
          field = this.advance().text.slice(1, -1);
        } else {
          field = this.advance().text;
        }
        this.expect(TokenKind.RightBrace);
        expr = { kind: 'DynamicFieldExpr', object: expr, field, range: expr.range };
      } else if (this.check(TokenKind.Question) && !this.check(TokenKind.QuestionDot) && !this.check(TokenKind.QuestionQuestion)) {
        // Propagation operator (postfix ?)
        this.advance();
        expr = { kind: 'PropagationExpr', expression: expr, range: expr.range };
      } else {
        break;
      }
    }

    return expr;
  }

  private parsePrimary(): AST.Expression {
    const token = this.current();

    switch (token.kind) {
      case TokenKind.IntLiteral:
        this.advance();
        return { kind: 'IntLiteral', value: token.text, range: this.tokenRange(token) };

      case TokenKind.FloatLiteral:
        this.advance();
        return { kind: 'FloatLiteral', value: token.text, range: this.tokenRange(token) };

      case TokenKind.StringLiteral:
        this.advance();
        return { kind: 'StringLiteral', value: token.text, hasInterpolation: token.text.includes('{$'), range: this.tokenRange(token) };

      case TokenKind.MultilineStringLiteral:
        this.advance();
        return { kind: 'StringLiteral', value: token.text, hasInterpolation: false, range: this.tokenRange(token) };

      case TokenKind.TemplateFenceOpen:
        this.advance();
        return { kind: 'TemplateFenceExpr', language: '', format: '', descriptors: {}, content: token.text, range: this.tokenRange(token) };

      case TokenKind.True:
        this.advance();
        return { kind: 'BoolLiteral', value: true, range: this.tokenRange(token) };

      case TokenKind.False:
        this.advance();
        return { kind: 'BoolLiteral', value: false, range: this.tokenRange(token) };

      case TokenKind.Identifier:
        this.advance();
        return { kind: 'Identifier', name: token.text, range: this.tokenRange(token) };

      case TokenKind.TypeIdentifier:
        this.advance();
        return { kind: 'Identifier', name: token.text, range: this.tokenRange(token) };

      case TokenKind.Await: {
        const start = token;
        this.advance();
        const expression = this.parseUnary();
        return { kind: 'AwaitExpr', expression, range: this.rangeFrom(start) };
      }

      case TokenKind.Spawn: {
        const start = token;
        this.advance();
        const expression = this.parseUnary();
        return { kind: 'SpawnExpr', expression, range: this.rangeFrom(start) };
      }

      case TokenKind.Match:
        return this.parseMatchExpr();

      case TokenKind.Fun:
        return this.parseFunExpr();

      case TokenKind.Async:
        if (this.peekKind(1) === TokenKind.Fun) return this.parseAsyncFunExpr();
        this.advance();
        return { kind: 'Identifier', name: 'async', range: this.tokenRange(token) };

      case TokenKind.LeftParen: {
        this.advance();
        const expression = this.parseExpression();
        this.expect(TokenKind.RightParen);
        return { kind: 'GroupExpr', expression, range: expression.range };
      }

      case TokenKind.LeftBracket: {
        // List literal
        const start = token;
        this.advance();
        const elements: AST.Expression[] = [];
        while (!this.check(TokenKind.RightBracket) && !this.isAtEnd()) {
          elements.push(this.parseExpression());
          if (this.check(TokenKind.Comma)) this.advance();
        }
        this.expect(TokenKind.RightBracket);
        return { kind: 'ListLiteral', elements, range: this.rangeFrom(start) };
      }

      case TokenKind.LeftBrace: {
        // Dict literal
        const start = token;
        this.advance();
        const entries: [AST.Expression, AST.Expression][] = [];
        while (!this.check(TokenKind.RightBrace) && !this.isAtEnd()) {
          const key = this.parseExpression();
          this.expect(TokenKind.Colon);
          const value = this.parseExpression();
          entries.push([key, value]);
          if (this.check(TokenKind.Comma)) this.advance();
        }
        this.expect(TokenKind.RightBrace);
        return { kind: 'DictLiteral', entries, range: this.rangeFrom(start) };
      }

      default:
        this.addDiagnostic(`Unexpected token: ${token.text}`, token);
        this.advance();
        return this.errorExpr(token);
    }
  }

  private parseMatchExpr(): AST.MatchExpr {
    const start = this.current();
    this.expect(TokenKind.Match);
    const subject = this.parseExpression();
    this.expect(TokenKind.LeftBrace);
    const arms: AST.MatchArm[] = [];
    while (!this.check(TokenKind.RightBrace) && !this.isAtEnd()) {
      const armStart = this.current();
      const pattern = this.parsePattern();
      let guard: AST.Expression | undefined;
      if (this.check(TokenKind.If)) {
        this.advance();
        this.expect(TokenKind.LeftParen);
        guard = this.parseExpression();
        this.expect(TokenKind.RightParen);
      }
      this.expect(TokenKind.Arrow);
      const body = this.parseExpression();
      if (this.check(TokenKind.Comma)) this.advance();
      arms.push({ kind: 'MatchArm', pattern, guard, body, range: this.rangeFrom(armStart) });
    }
    this.expect(TokenKind.RightBrace);
    return { kind: 'MatchExpr', subject, arms, range: this.rangeFrom(start) };
  }

  private parsePattern(): AST.Pattern {
    const token = this.current();

    // Wildcard
    if (token.text === '_') {
      this.advance();
      return { kind: 'WildcardPattern', range: this.tokenRange(token) };
    }

    // Constructor pattern or identifier pattern
    const name = this.advance().text;
    if (this.check(TokenKind.LeftParen)) {
      this.advance();
      const fields: AST.Pattern[] = [];
      while (!this.check(TokenKind.RightParen) && !this.isAtEnd()) {
        fields.push(this.parsePattern());
        if (this.check(TokenKind.Comma)) this.advance();
      }
      this.expect(TokenKind.RightParen);
      return { kind: 'ConstructorPattern', name, fields, range: this.rangeFrom(token) };
    }

    return { kind: 'IdentifierPattern', name, range: this.tokenRange(token) };
  }

  private parseFunExpr(): AST.FunExpr {
    const start = this.current();
    this.expect(TokenKind.Fun);
    this.expect(TokenKind.LeftParen);
    const params = this.parseParamList();
    this.expect(TokenKind.RightParen);
    const returnType = this.check(TokenKind.Colon) ? (this.advance(), this.parseTypeExpr()) : undefined;
    if (this.check(TokenKind.Arrow)) {
      this.advance();
      const body = this.parseExpression();
      return { kind: 'FunExpr', params, returnType, body, range: this.rangeFrom(start) };
    }
    const body = this.parseBlock();
    return { kind: 'FunExpr', params, returnType, body, range: this.rangeFrom(start) };
  }

  private parseAsyncFunExpr(): AST.AsyncFunExpr {
    const start = this.current();
    this.expect(TokenKind.Async);
    this.expect(TokenKind.Fun);
    this.expect(TokenKind.LeftParen);
    const params = this.parseParamList();
    this.expect(TokenKind.RightParen);
    const returnType = this.check(TokenKind.Colon) ? (this.advance(), this.parseTypeExpr()) : undefined;
    if (this.check(TokenKind.Arrow)) {
      this.advance();
      const body = this.parseExpression();
      return { kind: 'AsyncFunExpr', params, returnType, body, range: this.rangeFrom(start) };
    }
    const body = this.parseBlock();
    return { kind: 'AsyncFunExpr', params, returnType, body, range: this.rangeFrom(start) };
  }

  // ---- Type expressions ----

  private parseTypeExpr(): AST.TypeExpr {
    let type = this.parseBaseType();
    // Optional sugar: T?
    if (this.check(TokenKind.Question)) {
      this.advance();
      type = { kind: 'OptionalType', inner: type, range: type.range };
    }
    return type;
  }

  private parseBaseType(): AST.TypeExpr {
    const token = this.current();

    // Function type: fn(params): ReturnType
    if (this.check(TokenKind.Identifier) && token.text === 'fn') {
      const start = token;
      this.advance();
      this.expect(TokenKind.LeftParen);
      const params: AST.TypeExpr[] = [];
      while (!this.check(TokenKind.RightParen) && !this.isAtEnd()) {
        params.push(this.parseTypeExpr());
        if (this.check(TokenKind.Comma)) this.advance();
      }
      this.expect(TokenKind.RightParen);
      this.expect(TokenKind.Colon);
      const returnType = this.parseTypeExpr();
      return { kind: 'FunctionType', params, returnType, range: this.rangeFrom(start) };
    }

    // Tuple: tuple[T1, T2]
    if (token.text === 'tuple') {
      const start = token;
      this.advance();
      if (this.check(TokenKind.LeftBracket)) {
        this.advance();
        const elements: AST.TypeExpr[] = [];
        while (!this.check(TokenKind.RightBracket) && !this.isAtEnd()) {
          elements.push(this.parseTypeExpr());
          if (this.check(TokenKind.Comma)) this.advance();
        }
        this.expect(TokenKind.RightBracket);
        return { kind: 'TupleType', elements, range: this.rangeFrom(start) };
      }
      return { kind: 'SimpleType', name: 'tuple', range: this.tokenRange(start) };
    }

    // Simple or generic type
    const name = this.advance().text;
    if (this.check(TokenKind.LeftBracket)) {
      const start = token;
      this.advance();
      const args: AST.TypeExpr[] = [];
      while (!this.check(TokenKind.RightBracket) && !this.isAtEnd()) {
        args.push(this.parseTypeExpr());
        if (this.check(TokenKind.Comma)) this.advance();
      }
      this.expect(TokenKind.RightBracket);
      return { kind: 'GenericType', name, args, range: this.rangeFrom(start) };
    }

    return { kind: 'SimpleType', name, range: this.tokenRange(token) };
  }

  // ---- Helpers ----

  private parseBlock(): AST.Block {
    const start = this.current();
    this.expect(TokenKind.LeftBrace);
    const statements: AST.Statement[] = [];
    while (!this.check(TokenKind.RightBrace) && !this.isAtEnd()) {
      const stmt = this.parseStatement();
      if (stmt) statements.push(stmt);
    }
    this.expect(TokenKind.RightBrace);
    return { kind: 'Block', statements, range: this.rangeFrom(start) };
  }

  private parseParamList(): AST.Parameter[] {
    const params: AST.Parameter[] = [];
    while (!this.check(TokenKind.RightParen) && !this.isAtEnd()) {
      params.push(this.parseParam());
      if (this.check(TokenKind.Comma)) this.advance();
    }
    return params;
  }

  private parseParam(): AST.Parameter {
    const start = this.current();
    const name = this.expect(TokenKind.Identifier, TokenKind.TypeIdentifier).text;
    let type: AST.TypeExpr | undefined;
    if (this.check(TokenKind.Colon)) {
      this.advance();
      type = this.parseTypeExpr();
    }
    let defaultValue: AST.Expression | undefined;
    if (this.check(TokenKind.Assign)) {
      this.advance();
      defaultValue = this.parseExpression();
    }
    return { kind: 'Parameter', name, type, defaultValue, range: this.rangeFrom(start) };
  }

  private parseOptionalTypeParams(): string[] | undefined {
    if (!this.check(TokenKind.LeftBracket)) return undefined;
    this.advance();
    const params: string[] = [];
    while (!this.check(TokenKind.RightBracket) && !this.isAtEnd()) {
      params.push(this.advance().text);
      if (this.check(TokenKind.Comma)) this.advance();
    }
    this.expect(TokenKind.RightBracket);
    return params.length > 0 ? params : undefined;
  }

  // ---- Token helpers ----

  private current(): Token {
    return this.tokens[this.pos] || { kind: TokenKind.EOF, text: '', offset: this.source.length, line: 0, column: 0, length: 0 };
  }

  private advance(): Token {
    const token = this.current();
    if (!this.isAtEnd()) this.pos++;
    return token;
  }

  private check(...kinds: TokenKind[]): boolean {
    return kinds.includes(this.current().kind);
  }

  private peekKind(offset: number): TokenKind {
    const idx = this.pos + offset;
    return idx < this.tokens.length ? this.tokens[idx].kind : TokenKind.EOF;
  }

  private expect(...kinds: TokenKind[]): Token {
    if (this.check(...kinds)) {
      return this.advance();
    }
    const token = this.current();
    const expected = kinds.map(k => `'${k}'`).join(' or ');
    this.addDiagnostic(`Expected ${expected} but found '${token.text}'`, token);
    // Create a synthetic token for recovery
    return { kind: kinds[0], text: '', offset: token.offset, line: token.line, column: token.column, length: 0 };
  }

  private isAtEnd(): boolean {
    return this.current().kind === TokenKind.EOF;
  }

  private synchronize(): void {
    this.advance();
    while (!this.isAtEnd()) {
      // After semicolons or before certain keywords, we're at a boundary
      if (this.tokens[this.pos - 1]?.kind === TokenKind.Semicolon) return;
      if (this.tokens[this.pos - 1]?.kind === TokenKind.RightBrace) return;

      const kind = this.current().kind;
      if (
        kind === TokenKind.Fun || kind === TokenKind.Async ||
        kind === TokenKind.Class || kind === TokenKind.Enum ||
        kind === TokenKind.Interface || kind === TokenKind.Let ||
        kind === TokenKind.Var || kind === TokenKind.For ||
        kind === TokenKind.While || kind === TokenKind.If ||
        kind === TokenKind.Return || kind === TokenKind.From ||
        kind === TokenKind.Extern || kind === TokenKind.Portal ||
        kind === TokenKind.At
      ) {
        return;
      }
      this.advance();
    }
  }

  // ---- Diagnostics & ranges ----

  private addDiagnostic(message: string, token: Token): void {
    this.diagnostics.push({
      message,
      range: this.tokenRange(token),
      severity: 'error',
    });
  }

  private tokenRange(token: Token): AST.Range {
    return {
      start: { line: token.line, column: token.column, offset: token.offset },
      end: { line: token.line, column: token.column + token.length, offset: token.offset + token.length },
    };
  }

  private rangeFrom(start: Token): AST.Range {
    const prev = this.tokens[this.pos - 1] || start;
    return {
      start: { line: start.line, column: start.column, offset: start.offset },
      end: { line: prev.line, column: prev.column + prev.length, offset: prev.offset + prev.length },
    };
  }

  private currentPos(): AST.Position {
    const t = this.current();
    return { line: t.line, column: t.column, offset: t.offset };
  }

  private errorNode(start: Token): AST.ErrorNode {
    return {
      kind: 'ErrorNode',
      message: 'Parse error',
      text: start.text,
      range: this.tokenRange(start),
    };
  }

  private errorExpr(token: Token): AST.ErrorNode {
    return {
      kind: 'ErrorNode',
      message: `Unexpected token: ${token.text}`,
      text: token.text,
      range: this.tokenRange(token),
    };
  }
}
