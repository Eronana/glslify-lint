import { spawn, spawnSync } from 'child_process';
import { extname } from 'path';
import chalk from 'chalk';

const shaderStages =
(<T extends string>(...args:T[]) => args)(
  'vert',
  'frag',
  'conf',
  'tesc',
  'tese',
  'geom',
  'comp',
);

export type ShaderStage = typeof shaderStages[0];

function getShaderStage (filename:string, stage?:ShaderStage) {
  if (stage) {
    if (!shaderStages.includes(stage)) {
      throw new Error(`invalid stage: ${stage}`);
    }
    return stage;
  } else {
    const ext = extname(filename).substr(1) as ShaderStage;
    if (!shaderStages.includes(ext)) {
      throw new Error(`Cannot recognize stage from filename: ${filename}`);
    }
    return ext;
  }
}
const ERR_NO_OUTPUT = 'exit code is not zero, and no output';
const ERROR_REGEX = /^(.*?): (\d+):(\d+): /;
const CODE_SNIPPET_RANGE = 2;
function getCodeSnippet (srcs:string[], line:number) {
  const padLen = (line + 1 + CODE_SNIPPET_RANGE).toString().length;
  const ss:string[] = [];
  for (let i = Math.max(1, line - CODE_SNIPPET_RANGE), end = Math.min(srcs.length, line + CODE_SNIPPET_RANGE); i <= end; i++) {
    let s = i.toString().padStart(padLen) + '| ' + srcs[i - 1];
    if (i === line) {
      s = chalk.red(s);
    }
    ss.push(s);
  }
  return ss.join('\n');
}
function getErrors (filename:string, src:string, errors:string) {
  const srcs = src.split('\n');
  return errors
    .replace(/^\s*stdin\s*/, '')
    .trim()
    .split('\n')
    .map(s => {
      const m = s.match(ERROR_REGEX);
      if (!m) {
        return s;
      }
      return s.replace(ERROR_REGEX, `${chalk.bgRed.white('$1')}: ${filename}[$2, $3]: `)
        + '\n' + getCodeSnippet(srcs, parseInt(m[3]));

    })
    .join('\n');
}

export const lint = (filename:string, src:string, stage?:ShaderStage) => new Promise<void>((resolve, reject) => {
  try {
    stage = getShaderStage(filename, stage);
  } catch (e) {
    return reject(e);
  }
  let errors = '';
  const proc = spawn('glslangValidator', ['--stdin', '-S', stage], {
    stdio: ['pipe', 'pipe', 'ignore'],
  }).on('exit', code => {
    if (code === 0) {
      resolve();
    } else {
      errors = getErrors(filename, src, errors);
      if (errors) {
        reject(new Error(errors));
      } else {
        reject(new Error(ERR_NO_OUTPUT));
      }
    }
  }).on('error', reject);
  proc.stdout.on('data', chunk => errors += chunk);
  proc.stdin.write(src);
  proc.stdin.end();
});

export const lintSync = (filename:string, src:string, stage?:ShaderStage) => {
  stage = getShaderStage(filename, stage);
  const {status, error, stdout } = spawnSync('glslangValidator', ['--stdin', '-S', stage], {
    input: src,
    stdio: ['pipe', 'pipe', 'ignore'],
  });
  if (error) {
    throw error;
  }
  if (status !== 0) {
    if (stdout) {
      throw new Error(getErrors(filename, src, stdout.toString()));
    } else {
      throw new Error(ERR_NO_OUTPUT);
    }
  }
};
