import { webpack } from "webpack";
import { readFileSync } from "fs";
import config from "./webpack.config";
const compiler = webpack(config);
compiler.run((err, stats) => {
  const file = readFileSync(
    `${stats!.toJson().outputPath!}/${stats!.toJson().assets![0].name}`
  );
  if (
    file.toString() !==
    `(()=>{"use strict";const e=injection-js;class c{constructor(){console.log("DependencyService")}}class n{constructor(e){this.dependencyService=e,console.log("DIService",this.dependencyService)}}n.parameters=[[new e.Inject(c)]],new e.Inject(c),console.log(n)})();`
  ) {
    throw new Error("integration test failed");
  }
});
