uniform mat4 projectionMatrix;
uniform mat4 modelMatrix;
uniform mat4 viewMatrix;

attribute vec4 position;

varying vec4 vPosition;

void main () {
  gl_Position = projectionMatrix * viewMatrix * modelMatrix * position;
  vPosition = position;
}
