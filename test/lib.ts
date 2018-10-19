import { lint, lintSync, ShaderStage } from '../src/lib';
import { assert, use } from 'chai';
import fs = require('fs');
import { join } from 'path';
use(require('chai-as-promised'));

const readFile = (filename:string) => [
  fs.readFileSync(join(__dirname, 'glsl/', filename)).toString(),
  filename,
] as [string, string];

describe('lint', () => {
  it('should return true with good vert', async () => {
    assert.isUndefined(await lint(...readFile('good.lib.vert')));
  });
  it('should return true with good frag', async () => {
    assert.isUndefined(await lint(...readFile('good.lib.frag')));
  });
  it('should throw errors with bad vert', () => {
    assert.isRejected(lint(...readFile('bad.lib.vert')));
  });
  it('should throw errors with bad frag', () => {
    assert.isRejected(lint(...readFile('bad.lib.frag')));
  });
  it('should return false without shader file', () => {
    assert.isRejected(lint(...readFile('bad.txt')));
  });
  it('should return false with bad stage', () => {
    assert.isRejected(lint('a', 'b', 'c' as ShaderStage));
  });
});

describe('lintSync', () => {
  it('should return true with good vert', () => {
    assert.isUndefined(lintSync(...readFile('good.lib.vert')));
  });
  it('should return true with good frag', () => {
    assert.isUndefined(lintSync(...readFile('good.lib.frag')));
  });
  it('should throw errors with bad vert', () => {
    assert.throw(() => lintSync(...readFile('bad.lib.vert')));
  });
  it('should return false without shader file', () => {
    assert.throw(() => lintSync(...readFile('bad.txt')));
  });
  it('should return false with bad stage', () => {
    assert.throw(() => lintSync('a', 'b', 'c' as ShaderStage));
  });
});
