/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from "typescript";

export class FatalDiagnosticError {
  constructor(
    readonly node: ts.Node,
    readonly message: string | ts.DiagnosticMessageChain,
    readonly relatedInformation?: ts.DiagnosticRelatedInformation[]
  ) {}
}

export function makeRelatedInformation(
  node: ts.Node,
  messageText: string
): ts.DiagnosticRelatedInformation {
  node = ts.getOriginalNode(node);
  return {
    category: ts.DiagnosticCategory.Message,
    code: 0,
    file: node.getSourceFile(),
    start: node.getStart(),
    length: node.getWidth(),
    messageText,
  };
}
