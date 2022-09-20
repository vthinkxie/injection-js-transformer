import { Injectable } from "injection-js";
import { DependencyService } from "@other/dependency-service";

@Injectable()
export class DIService {
  constructor(private dependencyService: DependencyService) {}
}
