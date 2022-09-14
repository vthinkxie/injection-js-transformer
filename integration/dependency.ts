import { Injectable } from "injection-js";

@Injectable()
export class DependencyService {
  constructor() {
    console.log("DependencyService");
  }
}
