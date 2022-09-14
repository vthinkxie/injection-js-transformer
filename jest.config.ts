import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
  preset: "ts-jest",
  testEnvironment: "node",
  collectCoverage: true,
  coverageReporters: ["lcov", "html"],
  testRegex: "/test/.*\\.spec\\.ts$",
  collectCoverageFrom: ["src/**/*"],
};

export default config;
