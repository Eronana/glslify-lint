import { assert } from 'chai';
const glslify = require('glslify');
const REG_GLSIIFYED = /#define GLSLIFY 1/;

const glslifyOpts = {
  transform: [
    [require('../src'), { post: true }],
  ],
};

describe('glslify-lint passed', () => {
  it('should return shader source with good vert', () => {
    const file = './glsl/good.vert';
    const src:string = glslify(file, null, glslifyOpts);
    assert.isTrue(REG_GLSIIFYED.test(src));
  });

  it('should return shader source with good frag', () => {
    const file = './glsl/good.frag';
    const src:string = glslify(file, null, glslifyOpts);
    assert.isTrue(REG_GLSIIFYED.test(src));
  });
});

describe('glslify-lint unpass', () => {
  it('should throw error with bad vert', () => {
    const file = './glsl/bad.vert';
    assert.throw(() => glslify(file, glslifyOpts));
  });

  it('should throw error with bad frag', () => {
    const file = './glsl/bad.frag';
    assert.throw(() => glslify(file, glslifyOpts));
  });
});

describe('glslify-lint error', () => {
  it('should throw error with bad vert', () => {
    const file = './glsl/bad.txt';
    assert.throw(() => glslify(file, glslifyOpts));
  });
});
