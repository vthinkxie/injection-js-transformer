import ts from "typescript";

export function tryGetDecorators(
  node: ts.Node
): readonly ts.Decorator[] | undefined {
  if (typeof ts.getDecorators === "function") {
    // TS 4.8 and later
    return ts.canHaveDecorators(node) ? ts.getDecorators(node) : undefined;
  }

  // TS 4.7 and earlier
  return node.decorators;
}
