import { Injectable } from "injection-js";
import DependencyService from "./default";
@Injectable()
export class DIService {
  constructor(private dependencyService: DependencyService) {}
}
