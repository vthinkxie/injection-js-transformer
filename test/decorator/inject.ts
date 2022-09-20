import { Inject, Injectable } from "injection-js";

@Injectable()
export class DependencyNewService {}

@Injectable()
export class DependencyService {}

@Injectable()
export class DIService {
  constructor(
    @Inject(DependencyNewService)
    private dependencyService: DependencyService
  ) {}
}
