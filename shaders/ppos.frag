uniform float time;
uniform float dt;

void main() {
    // Use uv to as the index for particles
    vec2 uv = gl_FragCoord.xy / resolution.xy;

    // Get position at the last timestep
    vec4 pos = texture2D( pPosTexture, uv );

    // Write out the new position
    gl_FragColor = vec4( pos.xyz, 1.0 );
}