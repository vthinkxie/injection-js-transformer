import { Injectable, Self } from "injection-js";

@Injectable()
export class DependencyService {}

@Injectable()
export class DIService {
  constructor(
    @Self()
    private dependencyService: DependencyService
  ) {}
}
