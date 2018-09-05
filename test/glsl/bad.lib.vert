precision mediump float;

attribute vec2 position;

void main() {
  float a = 1;
  gl_Position = vec4(position.x, position.y, a, 1.0);
}
