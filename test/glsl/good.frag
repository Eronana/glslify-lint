precision mediump float;
#pragma glslify:Vec4 = require('./vec4.glsl')

void main() {
  vec2 cell = step(0.5, fract(gl_FragCoord.xy / 32.0));
  if(cell.x + cell.y == 1.0) {
    discard;
  } else {
    gl_FragColor = Vec4(1., 1., 1., 1.);
  }
}
