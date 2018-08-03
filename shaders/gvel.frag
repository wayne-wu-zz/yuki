uniform sampler2D pPosTexture;
uniform sampler2D pVelTexture;

void main() {
    // Use uv to as the index for particles
    vec2 uv = gl_FragCoord.xy / resolution.xy;

    // Get position at the last timestep
    vec4 pos = texture2D( pPosTexture, uv );
    vec4 vel = texture2D( pVelTexture, uv );

    // Do stuff to the position here

    // Write out the new position
    gl_FragColor = vec4( pos.xyz, 1.0 );
}