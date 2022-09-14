import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
const pkg = require("./lib/package.json");
import peerDepsExternal from "rollup-plugin-peer-deps-external";

export default {
  input: "src/index.ts",
  external: ["typescript"],
  output: [
    {
      file: `./lib/${pkg.main}`,
      sourcemap: true,
      name: "injectionJsTransformer",
      format: "umd",
      globals: {
        typescript: "ts",
      },
    },
    {
      file: `./lib/${pkg.module}`,
      sourcemap: true,
      format: "es",
      globals: {
        typescript: "ts",
      },
    },
  ],
  plugins: [
    peerDepsExternal(),
    typescript({
      tsconfig: "tsconfig.lib.build.json",
    }),
    commonjs(),
  ],
};
