// ============================================================================
// Loom AST Node Types — v0.6
// ============================================================================

export interface Position {
  line: number;
  column: number;
  offset: number;
}

export interface Range {
  start: Position;
  end: Position;
}

// Base node
export interface AstNode {
  kind: string;
  range: Range;
}

// --- Top-level declarations ---

export interface Program extends AstNode {
  kind: 'Program';
  statements: Statement[];
  isCompiled?: boolean;
}

export type Statement =
  | LetDecl
  | VarDecl
  | FunDecl
  | AsyncFunDecl
  | GenFunDecl
  | AsyncGenFunDecl
  | ClassDecl
  | EnumDecl
  | StructDecl
  | InterfaceDecl
  | TypeAliasDecl
  | ImportStmt
  | ImportBlockStmt
  | ReExportStmt
  | ExternJsFunDecl
  | ExternJsValDecl
  | ExternNativeFunDecl
  | ExternNativeValDecl
  | MacroDecl
  | IfStmt
  | WhileStmt
  | ForStmt
  | ForInStmt
  | ForAwaitStmt
  | DoWhileStmt
  | TryStmt
  | WithStmt
  | DeferCallStmt
  | DeferBlockStmt
  | PortalStmt
  | MatchExpr
  | AwaitGroupStmt
  | DynamicViewStmt
  | DelStmt
  | GlobalDecl
  | NonlocalDecl
  | YieldStmt
  | YieldFromStmt
  | ReturnStmt
  | BreakStmt
  | ContinueStmt
  | ThrowStmt
  | ExpressionStmt
  | AnnotatedDecl
  | ErrorNode;

// --- Destructuring ---

export type DestructPattern = IdentifierPattern | TuplePattern | ListPattern | DictPattern;

export interface IdentifierPattern extends AstNode {
  kind: 'IdentifierPattern';
  name: string;
}

export interface TuplePattern extends AstNode {
  kind: 'TuplePattern';
  elements: DestructPattern[];
  rest?: string;
}

export interface ListPattern extends AstNode {
  kind: 'ListPattern';
  elements: DestructPattern[];
  rest?: string;
}

export interface DictPattern extends AstNode {
  kind: 'DictPattern';
  fields: DictDestructField[];
  rest?: string;
}

export interface DictDestructField extends AstNode {
  kind: 'DictDestructField';
  key: string;
  alias?: string;
  defaultValue?: Expression;
}

// --- Declarations ---

export interface LetDecl extends AstNode {
  kind: 'LetDecl';
  pattern: DestructPattern;
  typeAnnotation?: TypeExpr;
  initializer?: Expression;
}

export interface VarDecl extends AstNode {
  kind: 'VarDecl';
  pattern: DestructPattern;
  typeAnnotation?: TypeExpr;
  initializer?: Expression;
}

export interface FunDecl extends AstNode {
  kind: 'FunDecl';
  name: string;
  params: Parameter[];
  returnType?: TypeExpr;
  body: Block;
  isPublic: boolean;
  isStatic: boolean;
  isAbstract: boolean;
  isOperator: boolean;
  typeParams?: string[];
}

export interface AsyncFunDecl extends AstNode {
  kind: 'AsyncFunDecl';
  name: string;
  params: Parameter[];
  returnType?: TypeExpr;
  body: Block;
  isPublic: boolean;
  isStatic: boolean;
  isAbstract: boolean;
  typeParams?: string[];
}

export interface GenFunDecl extends AstNode {
  kind: 'GenFunDecl';
  name: string;
  params: Parameter[];
  returnType?: TypeExpr;
  body: Block;
  isPublic: boolean;
  isStatic: boolean;
  typeParams?: string[];
}

export interface AsyncGenFunDecl extends AstNode {
  kind: 'AsyncGenFunDecl';
  name: string;
  params: Parameter[];
  returnType?: TypeExpr;
  body: Block;
  isPublic: boolean;
  isStatic: boolean;
  typeParams?: string[];
}

export interface ClassDecl extends AstNode {
  kind: 'ClassDecl';
  name: string;
  isDynamic: boolean;
  isAbstract: boolean;
  superClass?: string;
  implements?: string[];
  members: Statement[];
  typeParams?: string[];
}

export interface EnumDecl extends AstNode {
  kind: 'EnumDecl';
  name: string;
  variants: EnumVariant[];
  typeParams?: string[];
}

export interface EnumVariant extends AstNode {
  kind: 'EnumVariant';
  name: string;
  fields: Parameter[];
}

export interface StructDecl extends AstNode {
  kind: 'StructDecl';
  name: string;
  fields: StructField[];
  methods: (FunDecl | AsyncFunDecl)[];
  implements?: string[];
  typeParams?: string[];
}

export interface StructField extends AstNode {
  kind: 'StructField';
  name: string;
  type: TypeExpr;
  defaultValue?: Expression;
  qualifier?: 'weak' | 'unowned' | 'borrow';
}

export interface InterfaceDecl extends AstNode {
  kind: 'InterfaceDecl';
  name: string;
  methods: FunDecl[];
  typeParams?: string[];
}

export interface TypeAliasDecl extends AstNode {
  kind: 'TypeAliasDecl';
  name: string;
  typeParams?: string[];
  value: TypeExpr;
}

export interface MacroDecl extends AstNode {
  kind: 'MacroDecl';
  name: string;
  params: Parameter[];
  body: Block;
}

export interface AnnotatedDecl extends AstNode {
  kind: 'AnnotatedDecl';
  annotation: string;
  declaration: Statement;
}

// --- Control flow ---

export interface Block extends AstNode {
  kind: 'Block';
  statements: Statement[];
}

export interface IfStmt extends AstNode {
  kind: 'IfStmt';
  condition: Expression;
  consequent: Block;
  alternate?: Block | IfStmt;
}

export interface WhileStmt extends AstNode {
  kind: 'WhileStmt';
  condition: Expression;
  body: Block;
  label?: string;
}

export interface ForStmt extends AstNode {
  kind: 'ForStmt';
  init: Statement;
  condition: Expression;
  step: Expression;
  body: Block;
  label?: string;
}

export interface ForInStmt extends AstNode {
  kind: 'ForInStmt';
  pattern: DestructPattern;
  iterable: Expression;
  body: Block;
  label?: string;
}

export interface ForAwaitStmt extends AstNode {
  kind: 'ForAwaitStmt';
  pattern: DestructPattern;
  iterable: Expression;
  body: Block;
  label?: string;
}

export interface DoWhileStmt extends AstNode {
  kind: 'DoWhileStmt';
  body: Block;
  condition: Expression;
  label?: string;
}

export interface TryStmt extends AstNode {
  kind: 'TryStmt';
  tryBlock: Block;
  catchClauses: CatchClause[];
  finallyBlock?: Block;
}

export interface CatchClause extends AstNode {
  kind: 'CatchClause';
  types: string[];
  name?: string;
  body: Block;
}

export interface WithStmt extends AstNode {
  kind: 'WithStmt';
  bindings: WithBinding[];
  body: Block;
}

export interface WithBinding extends AstNode {
  kind: 'WithBinding';
  name: string;
  resource: Expression;
}

export interface DeferCallStmt extends AstNode {
  kind: 'DeferCallStmt';
  expression: Expression;
}

export interface DeferBlockStmt extends AstNode {
  kind: 'DeferBlockStmt';
  body: Block;
}

export interface PortalStmt extends AstNode {
  kind: 'PortalStmt';
  name: string;
  body: Block;
}

export interface AwaitGroupStmt extends AstNode {
  kind: 'AwaitGroupStmt';
  body: Block;
}

export interface DynamicViewStmt extends AstNode {
  kind: 'DynamicViewStmt';
  object: Expression;
  alias: string;
  body: Block;
}

export interface DelStmt extends AstNode {
  kind: 'DelStmt';
  target: Expression;
}

export interface GlobalDecl extends AstNode {
  kind: 'GlobalDecl';
  name: string;
}

export interface NonlocalDecl extends AstNode {
  kind: 'NonlocalDecl';
  name: string;
}

export interface YieldStmt extends AstNode {
  kind: 'YieldStmt';
  value?: Expression;
}

export interface YieldFromStmt extends AstNode {
  kind: 'YieldFromStmt';
  iterable: Expression;
}

export interface ReturnStmt extends AstNode {
  kind: 'ReturnStmt';
  value?: Expression;
}

export interface BreakStmt extends AstNode {
  kind: 'BreakStmt';
  label?: string;
}

export interface ContinueStmt extends AstNode {
  kind: 'ContinueStmt';
  label?: string;
}

export interface ThrowStmt extends AstNode {
  kind: 'ThrowStmt';
  value: Expression;
  from?: Expression;
}

export interface ExpressionStmt extends AstNode {
  kind: 'ExpressionStmt';
  expression: Expression;
}

// --- Imports ---

export interface ImportStmt extends AstNode {
  kind: 'ImportStmt';
  path: string;
  names: ImportName[];
  preferCompiled?: boolean;
}

export interface ImportBlockStmt extends AstNode {
  kind: 'ImportBlockStmt';
  path: string;
  imports: ImportStmt[];
}

export interface ImportName extends AstNode {
  kind: 'ImportName';
  name: string;
  alias?: string;
}

export interface ReExportStmt extends AstNode {
  kind: 'ReExportStmt';
  path: string;
  names: ImportName[];
}

// --- FFI ---

export interface ExternJsFunDecl extends AstNode {
  kind: 'ExternJsFunDecl';
  name: string;
  params: Parameter[];
  returnType: TypeExpr;
}

export interface ExternJsValDecl extends AstNode {
  kind: 'ExternJsValDecl';
  name: string;
  type: TypeExpr;
}

export interface ExternNativeFunDecl extends AstNode {
  kind: 'ExternNativeFunDecl';
  library: string;
  name: string;
  params: Parameter[];
  returnType: TypeExpr;
}

export interface ExternNativeValDecl extends AstNode {
  kind: 'ExternNativeValDecl';
  library: string;
  name: string;
  type: TypeExpr;
}

// --- Expressions ---

export type Expression =
  | IntLiteral
  | FloatLiteral
  | StringLiteralExpr
  | BytesLiteralExpr
  | BoolLiteral
  | NoneLiteral
  | IdentifierExpr
  | BinaryExpr
  | UnaryExpr
  | CallExpr
  | MemberExpr
  | IndexExpr
  | SliceExpr
  | AssignExpr
  | CompoundAssignExpr
  | AwaitExpr
  | SpawnExpr
  | MatchExpr
  | FunExpr
  | AsyncFunExpr
  | ListLiteral
  | DictLiteral
  | SetLiteral
  | TupleLiteral
  | ComprehensionExpr
  | TemplateFenceExpr
  | InterpolatedStringExpr
  | DynamicFieldExpr
  | OptionalChainExpr
  | NullCoalesceExpr
  | TernaryExpr
  | PropagationExpr
  | SpreadExpr
  | BoxExpr
  | CastExpr
  | IsExpr
  | InstanceofExpr
  | TypeofExpr
  | NewExpr
  | MacroInvocationExpr
  | GroupExpr
  | ErrorNode;

export interface IntLiteral extends AstNode {
  kind: 'IntLiteral';
  value: string;
}

export interface FloatLiteral extends AstNode {
  kind: 'FloatLiteral';
  value: string;
}

export interface StringLiteralExpr extends AstNode {
  kind: 'StringLiteral';
  value: string;
  hasInterpolation: boolean;
}

export interface BytesLiteralExpr extends AstNode {
  kind: 'BytesLiteral';
  value: string;
}

export interface BoolLiteral extends AstNode {
  kind: 'BoolLiteral';
  value: boolean;
}

export interface NoneLiteral extends AstNode {
  kind: 'NoneLiteral';
}

export interface IdentifierExpr extends AstNode {
  kind: 'Identifier';
  name: string;
}

export interface BinaryExpr extends AstNode {
  kind: 'BinaryExpr';
  operator: string;
  left: Expression;
  right: Expression;
}

export interface UnaryExpr extends AstNode {
  kind: 'UnaryExpr';
  operator: string;
  operand: Expression;
}

export interface CallExpr extends AstNode {
  kind: 'CallExpr';
  callee: Expression;
  args: Expression[];
  typeArgs?: TypeExpr[];
}

export interface MemberExpr extends AstNode {
  kind: 'MemberExpr';
  object: Expression;
  property: string;
}

export interface IndexExpr extends AstNode {
  kind: 'IndexExpr';
  object: Expression;
  index: Expression;
  optional?: boolean;
}

export interface SliceExpr extends AstNode {
  kind: 'SliceExpr';
  object: Expression;
  start?: Expression;
  end?: Expression;
  step?: Expression;
  optional?: boolean;
}

export interface AssignExpr extends AstNode {
  kind: 'AssignExpr';
  target: Expression;
  value: Expression;
}

export interface CompoundAssignExpr extends AstNode {
  kind: 'CompoundAssignExpr';
  operator: string;
  target: Expression;
  value: Expression;
}

export interface AwaitExpr extends AstNode {
  kind: 'AwaitExpr';
  expression: Expression;
}

export interface SpawnExpr extends AstNode {
  kind: 'SpawnExpr';
  expression: Expression;
}

export interface MatchExpr extends AstNode {
  kind: 'MatchExpr';
  subject: Expression;
  arms: MatchArm[];
}

export interface MatchArm extends AstNode {
  kind: 'MatchArm';
  pattern: Pattern;
  guard?: Expression;
  body: Expression;
}

export type Pattern =
  | WildcardPattern
  | IdentifierPattern
  | ConstructorPattern
  | NestedPattern;

export interface WildcardPattern extends AstNode {
  kind: 'WildcardPattern';
}

export interface IdentifierPattern extends AstNode {
  kind: 'IdentifierPattern';
  name: string;
}

export interface ConstructorPattern extends AstNode {
  kind: 'ConstructorPattern';
  name: string;
  fields: Pattern[];
}

export interface NestedPattern extends AstNode {
  kind: 'NestedPattern';
  outer: string;
  inner: Pattern;
}

export interface FunExpr extends AstNode {
  kind: 'FunExpr';
  params: Parameter[];
  returnType?: TypeExpr;
  body: Block | Expression;
  captureList?: CaptureItem[];
}

export interface AsyncFunExpr extends AstNode {
  kind: 'AsyncFunExpr';
  params: Parameter[];
  returnType?: TypeExpr;
  body: Block | Expression;
  captureList?: CaptureItem[];
}

export interface CaptureItem extends AstNode {
  kind: 'CaptureItem';
  qualifier: 'weak' | 'unowned';
  name: string;
}

export interface ListLiteral extends AstNode {
  kind: 'ListLiteral';
  elements: Expression[];
}

export interface DictLiteral extends AstNode {
  kind: 'DictLiteral';
  entries: [Expression, Expression][];
}

export interface SetLiteral extends AstNode {
  kind: 'SetLiteral';
  elements: Expression[];
}

export interface TupleLiteral extends AstNode {
  kind: 'TupleLiteral';
  elements: Expression[];
}

export interface ComprehensionExpr extends AstNode {
  kind: 'ComprehensionExpr';
  resultKind: 'list' | 'dict' | 'set';
  body: Expression;
  pattern: DestructPattern;
  iterable: Expression;
  condition?: Expression;
}

export interface TemplateFenceExpr extends AstNode {
  kind: 'TemplateFenceExpr';
  language: string;
  format?: string;
  descriptors: Record<string, string>;
  content: string;
  fenceLength?: number; // v0.7: number of backticks (3+)
  exprOpen?: string; // v0.7: custom expression open delimiter (replaces {$ when nested)
  exprClose?: string; // v0.7: custom expression close delimiter (replaces $} when nested)
}

export interface InterpolatedStringExpr extends AstNode {
  kind: 'InterpolatedStringExpr';
  parts: (string | Expression)[];
}

export interface DynamicFieldExpr extends AstNode {
  kind: 'DynamicFieldExpr';
  object: Expression;
  field: string;
}

export interface OptionalChainExpr extends AstNode {
  kind: 'OptionalChainExpr';
  object: Expression;
  property: string;
}

export interface NullCoalesceExpr extends AstNode {
  kind: 'NullCoalesceExpr';
  left: Expression;
  right: Expression;
}

export interface TernaryExpr extends AstNode {
  kind: 'TernaryExpr';
  condition: Expression;
  consequent: Expression;
  alternate: Expression;
}

export interface PropagationExpr extends AstNode {
  kind: 'PropagationExpr';
  expression: Expression;
}

export interface SpreadExpr extends AstNode {
  kind: 'SpreadExpr';
  operator: '*' | '**';
  expression: Expression;
}

export interface BoxExpr extends AstNode {
  kind: 'BoxExpr';
  expression: Expression;
}

export interface CastExpr extends AstNode {
  kind: 'CastExpr';
  expression: Expression;
  targetType: TypeExpr;
  safe: boolean; // true for `as?`, false for `as`
}

export interface IsExpr extends AstNode {
  kind: 'IsExpr';
  expression: Expression;
  targetType: TypeExpr;
}

export interface InstanceofExpr extends AstNode {
  kind: 'InstanceofExpr';
  expression: Expression;
  targetType: TypeExpr;
}

export interface TypeofExpr extends AstNode {
  kind: 'TypeofExpr';
  expression: Expression;
}

export interface NewExpr extends AstNode {
  kind: 'NewExpr';
  className: string;
  typeArgs?: TypeExpr[];
  args: Expression[];
}

export interface MacroInvocationExpr extends AstNode {
  kind: 'MacroInvocationExpr';
  name: string;
  args: Expression[];
}

export interface GroupExpr extends AstNode {
  kind: 'GroupExpr';
  expression: Expression;
}

// --- Type expressions ---

export type TypeExpr =
  | SimpleType
  | GenericType
  | FunctionType
  | AsyncFunctionType
  | OptionalType
  | UnionType
  | TupleType;

export interface SimpleType extends AstNode {
  kind: 'SimpleType';
  name: string;
}

export interface GenericType extends AstNode {
  kind: 'GenericType';
  name: string;
  args: TypeExpr[];
}

export interface FunctionType extends AstNode {
  kind: 'FunctionType';
  params: TypeExpr[];
  returnType: TypeExpr;
  isNoescape?: boolean;
}

export interface AsyncFunctionType extends AstNode {
  kind: 'AsyncFunctionType';
  params: TypeExpr[];
  returnType: TypeExpr;
}

export interface OptionalType extends AstNode {
  kind: 'OptionalType';
  inner: TypeExpr;
}

export interface UnionType extends AstNode {
  kind: 'UnionType';
  members: TypeExpr[];
}

export interface TupleType extends AstNode {
  kind: 'TupleType';
  elements: TypeExpr[];
}

// --- Shared ---

export interface Parameter extends AstNode {
  kind: 'Parameter';
  name: string;
  type?: TypeExpr;
  defaultValue?: Expression;
  qualifier?: 'weak' | 'unowned' | 'borrow';
}

// --- Error recovery ---

export interface ErrorNode extends AstNode {
  kind: 'ErrorNode';
  message: string;
  text: string;
}

// --- Diagnostic ---

export interface ParseDiagnostic {
  message: string;
  range: Range;
  severity: 'error' | 'warning' | 'info';
}
