import { Injectable, Optional, SkipSelf } from "injection-js";

@Injectable()
export class DependencyService {}

@Injectable()
export class DIService {
  constructor(
    @Optional()
    @SkipSelf()
    private dependencyService: DependencyService
  ) {}
}
