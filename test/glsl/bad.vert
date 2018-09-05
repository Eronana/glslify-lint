precision mediump float;
#pragma glslify:Vec4 = require('./vec4.glsl')

attribute vec2 position;

void main() {
  float a = 1;
  gl_Position = Vec4(position.x, position.y, a, 1.0);
}
