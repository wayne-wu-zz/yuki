uniform float time;
uniform float delta;

void main() {
    // Use uv to access the current index
    vec2 uv = gl_FragCoord.xy / resolution.xy;

    // Get position at the last timestep
    vec3 pos = texture2D( texturePosition, uv ).xyz;
    vec3 vel = texture2D( textureVelocity, uv ).xyz;

    // Write out the new position
    gl_FragColor = vec4( pos, 1.0 );

}