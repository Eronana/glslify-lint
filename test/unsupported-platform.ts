import { lint, lintSync } from '../src/lib';
import { assert } from 'chai';
import { join } from 'path';
import fs = require('fs');

const readFile = (filename:string) => [
  fs.readFileSync(join(__dirname, 'glsl/', filename)).toString(),
  filename,
] as [string, string];

describe('unsupported platform', () => {
  it('should reject the promise if the platform is unsupported', () => {
    const platform = Object.getOwnPropertyDescriptor(process, 'platform') as PropertyDescriptor;
    const [src, filename] = readFile('good.lib.vert');

    Object.defineProperty(process, 'platform', { value: 'aix' });

    lint(src, filename).then(() => {
      assert.fail('Should not resolve an error');
    }).catch(err => {
      assert.include(err.message, 'Unsupported', 'Errors with unsupported platform');
      Object.defineProperty(process, 'platform', platform);
    });
  });
});
