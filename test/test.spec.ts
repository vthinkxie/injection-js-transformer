import { codeGenerator } from "./util/codegen";
import { FatalDiagnosticError } from "../src/decorators/error";
import ts from "typescript";

describe("TypeScript AST Transformer", () => {
  describe("decorator", () => {
    it("should skip-self work", () => {
      const code = codeGenerator("decorator/skip-self.ts");
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

    it("should self work", () => {
      const code = codeGenerator("decorator/self.ts");
      expect(code).toMatchInlineSnapshot(`
      "import { Injectable, Self, Inject } from \"injection-js\";
      export class DependencyService {
      }
      export class DIService {
          constructor(private dependencyService: DependencyService) { }
          static parameters = [[new Self(), new Inject(DependencyService)]];
      }
      "
    `);
    });

    it("should inject work", () => {
      const code = codeGenerator("decorator/inject.ts");
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
      const code = codeGenerator("decorator/null.ts");
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
      const code = codeGenerator("decorator/import.ts");
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
    it("should default export work", () => {
      const code = codeGenerator("decorator/default-export.ts");
      expect(code).toMatchInlineSnapshot(`
      "import { Injectable, Inject } from \"injection-js\";
      import DependencyService from \"./default\";
      export class DIService {
          constructor(private dependencyService: DependencyService) { }
          static parameters = [[new Inject(DependencyService)]];
      }
      "
    `);
    });
  });

  describe("fatal", () => {
    it("should inject as type not work", () => {
      try {
        codeGenerator("fatal/inject-as-type.ts");
      } catch (e) {
        const error = e as FatalDiagnosticError;
        const message = error.message as ts.DiagnosticMessageChain;
        expect(message.messageText).toBe(
          `No suitable injection token for parameter 'dependencyService' of class 'DIService'.`
        );
      }
    });
  });
});
