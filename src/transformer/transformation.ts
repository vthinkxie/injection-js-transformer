import ts, { Decorator } from "typescript";

import { Visitor } from "./visitor";
import { isTargetDecorator } from "../util/util";
import { TypeScriptReflectionHost } from "../reflection/typescript";
import { Identifiers } from "../util/identifiers";
import { ClassCompilationMap, ImportDeclarationSet } from "./type";
import { tryGetModifiers } from "../util/modifiers";
import { tryGetDecorators } from "../util/decorators";

const NO_DECORATORS = new Set<ts.Decorator>();

/**
 * Visits all classes and performs transformation of corresponding TS nodes based on the
 * compilation results (provided as an argument).
 */
export class TransformationVisitor extends Visitor {
  constructor(
    private classCompilationMap: ClassCompilationMap,
    private importsToPreserve: ImportDeclarationSet,
    private reflector: TypeScriptReflectionHost
  ) {
    super();
  }

  override visitImportDeclaration(node: ts.ImportDeclaration) {
    if (
      ts.isStringLiteral(node.moduleSpecifier) &&
      node.moduleSpecifier.text === Identifiers.module &&
      node.importClause
    ) {
      return this.addInjectImportIfNeeded(node);
    }
    // Preserving an import that's marked as unreferenced (type-only) is tricky in TypeScript.
    //
    // Various approaches have been tried, with mixed success:
    //
    // 1. Using `ts.updateImportDeclaration` does not cause the import to be retained.
    //
    // 2. Using `ts.factory.createImportDeclaration` with the same `ts.ImportClause` causes the
    //    import to correctly be retained, but when emitting CommonJS module format code,
    //    references to the imported value will not match the import variable.
    //
    // 3. Emitting "import * as" imports instead generates the correct import variable, but
    //    references are missing the ".default" access. This happens to work for tsickle code
    //    with goog.module transformations as tsickle strips the ".default" anyway.
    //
    // 4. It's possible to trick TypeScript by setting `ts.NodeFlag.Synthesized` on the import
    //    declaration. This causes the import to be correctly retained and generated, but can
    //    violate invariants elsewhere in the compiler and cause crashes.
    //
    // 5. Using `ts.getMutableClone` seems to correctly preserve the import and correctly
    //    generate references to the import variable across all module types.
    //
    // Therefore, option 5 is the one used here. It seems to be implemented as the correct way
    // to perform option 4, which preserves all the compiler's invariants.
    //
    if (node.importClause && this.importsToPreserve.has(node)) {
      // https://github.com/angular/angular/pull/47167/files#diff-4071f0afefc84baea714dee86aa3395e58e3d0d08c12242be932439622c85a40
      // eslint-disable-next-line
      return ts.getMutableClone(node);
    }
    return node;
  }

  override visitClassDeclaration(
    node: ts.ClassDeclaration
  ): ts.ClassDeclaration {
    // If this class is not registered in the map, it means that it doesn't have target decorators,
    // thus no further processing is required.
    if (!this.classCompilationMap.has(node)) {
      return node;
    }

    const members = [...node.members];

    for (const expression of this.classCompilationMap.get(node)!.expressions) {
      // Translate the expression into TS nodes.
      const exprNode = expression.createExpression();

      // Create a static property declaration for the new field.
      const property = ts.factory.createPropertyDeclaration(
        undefined,
        [ts.factory.createToken(ts.SyntaxKind.StaticKeyword)],
        Identifiers.parameters,
        undefined,
        undefined,
        exprNode
      );

      members.push(property);
    }
    node = ts.factory.updateClassDeclaration(
      node,
      // Remove the decorator which triggered this compilation, leaving the others alone.
      this.nonTargetDecoratorsOnly(node),
      tryGetModifiers(node),
      node.name,
      node.typeParameters,
      node.heritageClauses || [],
      // Map over the class members and remove any target decorators from them.
      members.map((member) => this.stripTargetDecorators(member))
    );
    return node;
  }

  private addInjectImportIfNeeded(
    node: ts.ImportDeclaration
  ): ts.ImportDeclaration {
    const importClause = node.importClause!;
    const namedImports = importClause.namedBindings as ts.NamedImports;
    if (
      !namedImports.elements.some(
        (item) => item.name.text === Identifiers.inject
      )
    ) {
      const injectImportSpec = ts.factory.createImportSpecifier(
        false,
        undefined,
        ts.factory.createIdentifier(Identifiers.inject)
      );
      const newNamedBindings = ts.factory.updateNamedImports(
        namedImports,
        namedImports.elements.concat(injectImportSpec)
      );
      const newImportClause = ts.factory.updateImportClause(
        importClause,
        false,
        importClause.name,
        newNamedBindings
      );
      return ts.factory.updateImportDeclaration(
        node,
        node.decorators,
        tryGetModifiers(node),
        newImportClause,
        node.moduleSpecifier,
        node.assertClause
      );
    } else {
      return node;
    }
  }

  /**
   * Return all decorators on a `Declaration` which are from import module, or an empty set if none
   * are.
   */
  private getTargetDecorators(decl: ts.Declaration): Set<ts.Decorator> {
    const decorators = this.reflector.getDecoratorsOfDeclaration(decl);
    if (decorators === null) {
      return NO_DECORATORS;
    }
    const coreDecorators = decorators
      .filter((dec) => isTargetDecorator(dec))
      .map((dec) => dec.node);
    if (coreDecorators.length > 0) {
      return new Set(coreDecorators);
    } else {
      return NO_DECORATORS;
    }
  }

  /**
   * Given a `ts.Node`, filter the decorators array and return a version containing only non-target
   * decorators.
   *
   * If all decorators are removed (or none existed in the first place), this method returns
   * `undefined`.
   */
  private nonTargetDecoratorsOnly(
    node: ts.Declaration
  ): readonly Decorator[] | undefined {
    const decorators = tryGetDecorators(node);
    // Shortcut if the node has no decorators.
    if (decorators === undefined) {
      return undefined;
    }
    // Build a Set of the decorators on this node from target.
    const coreDecorators = this.getTargetDecorators(node);

    if (coreDecorators.size === decorators.length) {
      // If all decorators are to be removed, return `undefined`.
      return undefined;
    } else if (coreDecorators.size === 0) {
      // If no decorators need to be removed, return the original decorators array.
      return decorators;
    }

    // Filter out the core decorators.
    const filtered = decorators.filter((dec) => !coreDecorators.has(dec));

    // If no decorators survive, return `undefined`. This can only happen if a core decorator is
    // repeated on the node.
    if (filtered.length === 0) {
      return undefined;
    }

    return filtered;
  }

  /**
   * Remove Target decorators from a `ts.Node` in a shallow manner.
   *
   * This will remove decorators from class elements (getters, setters, properties, methods) as well
   * as parameters of constructors.
   */
  private stripTargetDecorators<T extends ts.Node>(node: T): T {
    if (ts.isParameter(node)) {
      // Strip decorators from parameters (probably of the constructor).
      node = ts.factory.updateParameterDeclaration(
        node,
        this.nonTargetDecoratorsOnly(node),
        tryGetModifiers(node),
        node.dotDotDotToken,
        node.name,
        node.questionToken,
        node.type,
        node.initializer
      ) as T & ts.ParameterDeclaration;
    } else if (ts.isMethodDeclaration(node) && node.decorators !== undefined) {
      // Strip decorators of methods.
      node = ts.factory.updateMethodDeclaration(
        node,
        this.nonTargetDecoratorsOnly(node),
        tryGetModifiers(node),
        node.asteriskToken,
        node.name,
        node.questionToken,
        node.typeParameters,
        node.parameters,
        node.type,
        node.body
      ) as T & ts.MethodDeclaration;
    } else if (
      ts.isPropertyDeclaration(node) &&
      node.decorators !== undefined
    ) {
      // Strip decorators of properties.
      node = ts.factory.updatePropertyDeclaration(
        node,
        this.nonTargetDecoratorsOnly(node),
        tryGetModifiers(node),
        node.name,
        node.questionToken,
        node.type,
        node.initializer
      ) as T & ts.PropertyDeclaration;
    } else if (ts.isGetAccessor(node)) {
      // Strip decorators of getters.
      node = ts.factory.updateGetAccessorDeclaration(
        node,
        this.nonTargetDecoratorsOnly(node),
        tryGetModifiers(node),
        node.name,
        node.parameters,
        node.type,
        node.body
      ) as T & ts.GetAccessorDeclaration;
    } else if (ts.isSetAccessor(node)) {
      // Strip decorators of setters.
      node = ts.factory.updateSetAccessorDeclaration(
        node,
        this.nonTargetDecoratorsOnly(node),
        tryGetModifiers(node),
        node.name,
        node.parameters,
        node.body
      ) as T & ts.SetAccessorDeclaration;
    } else if (ts.isConstructorDeclaration(node)) {
      // For constructors, strip decorators of the parameters.
      const parameters = node.parameters.map((param) =>
        this.stripTargetDecorators(param)
      );
      node = ts.factory.updateConstructorDeclaration(
        node,
        node.decorators,
        tryGetModifiers(node),
        parameters,
        node.body
      ) as T & ts.ConstructorDeclaration;
    }
    return node;
  }
}
