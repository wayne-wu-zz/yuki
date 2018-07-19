uniform float time;
uniform float dt;

void main() {
    // Use uv to access the current index
    vec2 uv = gl_FragCoord.xy / resolution.xy;

    // Get position at the last timestep
    vec4 pos = texture2D( texturePosition, uv );
    ///vec3 vel = texture2D( textureVelocity, uv ).xyz;

    // Write out the new position
    gl_FragColor = vec4( pos.xyz, 1.0 );
}