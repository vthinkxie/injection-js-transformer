# TypeScript Transformer for injection-js

![build](https://github.com/vthinkxie/injection-js-transformer/actions/workflows/workflow.yml/badge.svg)
[![codecov](https://codecov.io/gh/vthinkxie/injection-js-transformer/branch/master/graph/badge.svg?token=61PSEDRQpv)](https://codecov.io/gh/vthinkxie/injection-js-transformer)

TypeScript Transformer for [injection-js](https://github.com/mgechev/injection-js), inspired by [angular-cli](https://github.com/angular/angular/tree/main/packages/compiler-cli/src/ngtsc).


## Why need this
1. No more `emitDecoratorMetadata` needed.
2. No more `reflection`, `reflect-metadata` or `core-js` needed.
3. Make your code tree-shakeable.


## How it works
The transformer would convert the following code:

```typescript
import { Injectable, Optional, SkipSelf } from "injection-js";

@Injectable()
export class DependencyService {}

@Injectable()
export class DIService {
  constructor(
    @SkipSelf()
    @Optional()
    private dependencyService: DependencyService
  ) {}
}
```

into 

```typescript
import { Injectable, Optional, SkipSelf, Inject } from "injection-js";
export class DependencyService {
}
export class DIService {
    constructor(private dependencyService: DependencyService) { }
    static parameters = [[new Optional(), new SkipSelf(), new Inject(DependencyService)]];
}
```

## How to use it with webpack

```shell
npm install injection-js-transformer
```

```typescript
import { resolve } from "path";
import { Program } from "typescript";
import injectionTransformer from "injection-js-transformer";

const config = {
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

```


## License
MIT