precision mediump float;
#pragma glslify:Vec4 = require('./vec4.glsl')

attribute vec2 position;

void main() {
  gl_Position = Vec4(position.x, position.y, 1.0, 1.0);
}
