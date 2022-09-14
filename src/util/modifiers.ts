import ts from "typescript";

export function tryGetModifiers(
  node: ts.Node
): readonly ts.Modifier[] | undefined {
  if (typeof ts.getModifiers === "function") {
    // TS 4.8 and later
    return ts.canHaveModifiers(node) ? ts.getModifiers(node) : undefined;
  }

  // TS 4.7 and earlier
  // NOTE: Returns original array if every node was a `Modifier`, since the `update` methods on `NodeFactory`
  // use reference equality.
  return ts.visitNodes(
    node.modifiers,
    (node) => (ts.isModifier(node) ? node : undefined),
    ts.isModifier
  ) as readonly ts.Modifier[] | undefined;
}
