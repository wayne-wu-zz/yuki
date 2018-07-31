
uniform sampler2D pDefGradientTexture;

void main() {
    // Use uv to as the index for particles
    vec2 uv = gl_FragCoord.xy / resolution.xy;

    // Get position at the last timestep
    vec4 tmp = texture2D( pDefGradientTexture, uv );
    vec3 row1 = tmp.xyz;
    float det = tmp.w;


    // Do stuff to the position here

    // Write out the new position
    gl_FragColor = vec4( pos.xyz, 1.0 );
}