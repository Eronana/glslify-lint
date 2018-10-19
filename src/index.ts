import { lint, lintSync } from './lib';

function glslifyLint (file:string|undefined, src:string, opts:any, done?:(err:any, result?:any) => any):string|void {
  if (done) {
    lint(src, file).then(() => done(null, src)).catch(done);
  } else {
    lintSync(src, file);
    return src;
  }
}
glslifyLint.sync = glslifyLint;

export = glslifyLint;
