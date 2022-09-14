import { OutputExpression } from "../decorators/expression";
import { DependencyMetadata } from "../decorators/factory";
import ts from "typescript";

export interface CompilationResult {
  expressions: OutputExpression[];
}

export type ImportDeclarationSet = Set<ts.ImportDeclaration>;

export type ClassCompilationMap = Map<ts.ClassDeclaration, CompilationResult>;
