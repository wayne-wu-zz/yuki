
uniform sampler2D gVelTexture;
uniform sampler2D gForceTexture;

void main() {
    // Use uv to as the index for particles
    vec2 uv = gl_FragCoord.xy / resolution.xy;

    // Get position at the last timestep
    vec4 pos = texture2D( gVelTexture, uv );

    // Do stuff to the position here

    // Write out the new position
    gl_FragColor = vec4( pos.xyz, 1.0 );
}