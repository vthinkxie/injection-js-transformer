import { codeGenerator } from "./util/codegen";

describe("codegen", () => {
  it("should decorator work", () => {
    const code = codeGenerator("decorator.ts");
    expect(code).toMatchInlineSnapshot(`
      "import { Injectable, Optional, SkipSelf, Inject } from \"injection-js\";
      export class DependencyService {
      }
      export class DIService {
          constructor(private dependencyService: DependencyService) { }
          static parameters = [[new Optional(), new SkipSelf(), new Inject(DependencyService)]];
      }
      "
    `);
  });

  it("should inject work", () => {
    const code = codeGenerator("inject.ts");
    expect(code).toMatchInlineSnapshot(`
      "import { Inject, Injectable } from \"injection-js\";
      export class DependencyNewService {
      }
      export class DependencyService {
      }
      export class DIService {
          constructor(private dependencyService: DependencyService) { }
          static parameters = [[new Inject(DependencyNewService)]];
      }
      "
    `);
  });

  it("should null work", () => {
    const code = codeGenerator("null.ts");
    expect(code).toMatchInlineSnapshot(`
      "import { Injectable, Inject } from \"injection-js\";
      export class DependencyService {
      }
      export class DIService {
          constructor(private dependencyService: DependencyService | null) { }
          static parameters = [[new Inject(DependencyService)]];
      }
      "
    `);
  });
  it("should import work", () => {
    const code = codeGenerator("import.ts");
    expect(code).toMatchInlineSnapshot(`
      "import { Injectable, Inject } from \"injection-js\";
      import { DependencyService } from \"@other/dependency-service\";
      export class DIService {
          constructor(private dependencyService: DependencyService) { }
          static parameters = [[new Inject(DependencyService)]];
      }
      "
    `);
  });
});
