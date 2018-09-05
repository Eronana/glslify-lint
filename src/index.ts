import { lint, lintSync } from './lib';

module.exports = glslifyLint;
module.exports.sync = glslifyLint;

function glslifyLint (file:string, src:string, opts:any, done?:(err:any, result?:any) => any):string|void {
  if (done) {
    lint(file, src).then(() => done(null, src)).catch(done);
  } else {
    lintSync(file, src);
    return src;
  }
}
