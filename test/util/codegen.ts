import ts from "typescript";
import injectionTransformer from "../../src";
import { resolve } from "path";

export function codeGenerator(path: string): string {
  const filename = resolve(__dirname, `../${path}`);
  const program = ts.createProgram([filename], {});
  const sourceFile = program.getSourceFile(filename)!;
  const transformer = injectionTransformer(program);
  const { transformed } = ts.transform(sourceFile, [transformer]);
  const printer = ts.createPrinter();
  return printer.printFile(transformed[0]);
}
