import { Injectable } from "injection-js";
import type DependencyService from "./default";
@Injectable()
export class DIService {
  constructor(private dependencyService: DependencyService) {}
}
