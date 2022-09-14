import { Injectable } from "injection-js";
import { DependencyService } from "./dependency";

@Injectable()
export class DIService {
  constructor(private dependencyService: DependencyService) {
    console.log("DIService", this.dependencyService);
  }
}

@Injectable()
export class DIOtherService {
  constructor(private dependencyService: DependencyService) {
    console.log("DIOtherService", this.dependencyService);
  }
}
