uniform float time;
uniform float delta;

const float PI = 3.1415926535;

void main() {

    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec3 vel = texture2D ( textureVelocity, uv ).xyz;

    // Do stuff here to the velocity

    gl_FragColor = vec4( vel, 1.0 );
}