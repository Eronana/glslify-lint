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

const DEFAULT_STAGE = 'frag';
const isVert = (s:string) => /(\{|\s)gl_Position\s*=/.test(s);
const isFrag = (s:string) => /(\{|\s)(gl_FragColor|gl_FragData)\s*=/.test(s);

export type ShaderStage = typeof shaderStages[0];

function getShaderStage (src:string, filename?:string, stage?:ShaderStage) {
  if (stage && (shaderStages.includes(stage))) {
    return stage;
  }
  if (filename) {
    const ext = extname(filename).substr(1) as ShaderStage;
    if (shaderStages.includes(ext)) {
      return ext;
    }
  }
  if (isVert(src)) {
    return 'vert';
  }
  if (isFrag(src)) {
    return 'frag';
  }
  return DEFAULT_STAGE;
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

function getErrors (src:string, errors:string, filename?:string) {
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
      return s.replace(ERROR_REGEX, `${chalk.bgRed.white('$1')}: ${filename || '{snippet}'}[$2, $3]: `)
        + '\n' + getCodeSnippet(srcs, parseInt(m[3]));

    })
    .join('\n');
}

export const lint = (src:string, filename?:string, stage?:ShaderStage) => new Promise<void>((resolve, reject) => {
  let errors = '';
  const proc = spawn('glslangValidator', ['--stdin', '-S', getShaderStage(src, filename, stage)], {
    stdio: ['pipe', 'pipe', 'ignore'],
  }).on('exit', code => {
    if (code === 0) {
      resolve();
    } else {
      errors = getErrors(src, errors, filename);
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

export const lintSync = (src:string, filename?:string, stage?:ShaderStage) => {
  const {status, error, stdout } = spawnSync('glslangValidator', ['--stdin', '-S', getShaderStage(src, filename, stage)], {
    input: src,
    stdio: ['pipe', 'pipe', 'ignore'],
  });
  if (error) {
    throw error;
  }
  if (status !== 0) {
    if (stdout) {
      throw new Error(getErrors(src, stdout.toString(), filename));
    } else {
      throw new Error(ERR_NO_OUTPUT);
    }
  }
};
