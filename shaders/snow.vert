uniform mat4 projectionMatrix;
uniform mat4 modelMatrix;
uniform mat4 viewMatrix;

// Define float texture here
uniform sampler2D texturePosition; 
uniform sampler2D textureVelocity;

attribute vec4 position;
attribute float size;
attribute vec2 uv;

varying vec4 vPosition;

void main () {
  
  // Access the texture 2D
  vec3 pos = texture2D( texturePosition, uv );

  gl_PointSize = 2.0;
  gl_Position = projectionMatrix * viewMatrix * modelMatrix * pos;
  vPosition = position;
}
