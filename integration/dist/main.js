(()=>{"use strict";const e=injection-js;class c{constructor(){console.log("DependencyService")}}class n{constructor(e){this.dependencyService=e,console.log("DIService",this.dependencyService)}}n.parameters=[[new e.Inject(c)]],new e.Inject(c),console.log(n)})();