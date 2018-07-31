// Read
uniform sampler2D pPosTexture;
uniform sampler2D pDefGradientTexture;

void main() {
    // Use uv to as the index for particles
    vec2 uv = gl_FragCoord.xy / resolution.xy;

    // Get position at the last timestep
    vec4 pos = texture2D( pPosTexture, uv );

    // Do stuff to the position here

    // Write to gForce
    gl_FragColor = vec4( pos.xyz, 1.0 ); 
}