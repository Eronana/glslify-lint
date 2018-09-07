# glslify-lint
a transform for glslify that used to lint glsl source

## Note
this package is not available now, the reason is here https://github.com/glslify/glslify/issues/114

## Usage
1. install [glslangValidator](https://www.khronos.org/opengles/sdk/tools/Reference-Compiler/)
2. `npm install glslify-lint`
3. apply transform `glslify-lint` in browserify
  ```bash
  browserify test.js -t [ glslify -p glslify-lint ] > bundle.js
  # or this
  browserify test.js -t [ glslify --post-transform glslify-lint ] > bundle.js
  ```

## TODO
- [ ] publish to npm if glslify is fixed
- [ ] use JS to implement a lint to replace `glslangValidator`
