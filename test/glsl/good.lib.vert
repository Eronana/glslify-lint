precision mediump float;

attribute vec2 position;

void main() {
  gl_Position = vec4(position.x, position.y, 1.0, 1.0);
}
