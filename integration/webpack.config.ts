import { Configuration } from "webpack";
import { resolve } from "path";
import { Program } from "typescript";
const injectionTransformer = require("../lib/dist/injection-js-transfomer.umd");
const config: Configuration = {
  mode: "production",
  entry: resolve(__dirname, "./index.ts"),
  output: {
    path: resolve(__dirname, "./dist"),
    filename: "[name].js",
  },
  optimization: {
    minimize: true,
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  externals: {
    "injection-js": "injection-js",
  },
  module: {
    rules: [
      {
        test: /.ts$/,
        use: [
          {
            loader: "ts-loader",
            options: {
              configFile: resolve(__dirname, "./tsconfig.json"),
              getCustomTransformers: (program: Program) => {
                return {
                  before: [injectionTransformer(program)],
                };
              },
            },
          },
        ],
      },
    ],
  },
};

export default config;
