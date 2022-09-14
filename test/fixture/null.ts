import { Injectable } from "injection-js";

@Injectable()
export class DependencyService {}

@Injectable()
export class DIService {
  constructor(private dependencyService: DependencyService | null) {}
}
