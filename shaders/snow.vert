// Define float texture here
uniform sampler2D texturePosition; 
uniform sampler2D textureVelocity;

//attribute vec4 position;
//attribute float size;
//varying vec4 vPosition;

void main () {
  
  // Access the position data
  vec4 tmpPos = texture2D( texturePosition, uv );
  vec3 pos = tmpPos.xyz;

  gl_PointSize = 2.0;
  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(pos, 1.0);
  
}
