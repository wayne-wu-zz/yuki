// Define float texture here
uniform sampler2D texturePosition; 
uniform sampler2D textureVelocity;

//attribute vec4 position;
attribute float size;
attribute vec2 reference;

//varying vec4 vPosition;

void main () {
  
  // Access the texture 2D
  vec4 pos = texture2D( texturePosition, reference );
  //vec4 pos = vec4(1.0, 10.0, 1.0, 1.0);

  gl_PointSize = 10.0;
  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(pos.xyz, 1.0);
  //vPosition = position;
}
