uniform float time;
uniform float delta;

const float PI = 3.1415926535;

//pVelTexture already defined

uniform sampler2D gVelTexture;

void main() {

    vec2 uv = gl_FragCoord.xy / resolution.xy;
    
    vec3 vel = texture2D ( pVelTexture, uv ).xyz;

    // Do stuff here to the velocity
    
    gl_FragColor = vec4( vel, 1.0 );
}