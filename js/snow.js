
//import pos0frag from '../shaders/pos0.frag';

class Snow {
    constructor(renderer){
        this.renderer = renderer;
        this.gpuCompute = {};
    }

    // Initialize computation
    init(){
        this.gpuCompute = new GPUComputationRenderer(1024, 1024, this.renderer);

        // Particles
        var pos0 = this.gpuCompute.createTexture(); // particles' position data
        var vel0 = this.gpuCompute.createTexture(); // particles' velocity data
        var pos0Var = this.gpuCompute.addVariable("texturePos0", pos0frag, pos0);
        var vel0Var = this.gpuCompute.addVariable("textureVel0", vel0frag, vel0);

        // TODO: Grid data

        // Dependencies
        this.gpuCompute.setVariableDependencies(pos0, [pos0, vel0]); // position depends on position and velocity
        this.gpuCompute.setVariableDependencies(vel0, [vel0, pos0]);
    }

    // Run this every timestep
    update(){
        //TODO: update uniforms? 

        this.gpuCompute.compute();
    }

    // Returns the position data of the particles at the current timestep
    getPositionData(){
        return this.gpuCompute.getCurrentRenderTarget(pos0Var).texture;
    }

}