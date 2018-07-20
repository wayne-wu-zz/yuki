
import GPUComputationRenderer from "./GPUComputationRenderer.js";
import * as THREE from 'three';

import snowFrag from '../shaders/snow.frag';
import snowVert from '../shaders/snow.vert';

import pPosFrag from '../shaders/ppos.frag';
import pVelFrag from '../shaders/pvel.frag';


var WIDTH = 128;
var HEIGHT = 128;
var PARTICLES = WIDTH * WIDTH;

class Snow {
    constructor(renderer){
        this.renderer = renderer;
        this.gpuCompute = {};
        
        //uniforms
        this.uniforms = {};

        this.variables = {};

        this.mesh;

        this.now, this.last;

        this.init();
    }
    
    // Initialize all
    init(){
        this.initComputeRenderer();
        this.initRenderGeometry();
    }

    // Initialize computation
    initComputeRenderer(){
        //console.log(this.renderer);
        this.gpuCompute = new GPUComputationRenderer(WIDTH, WIDTH, this.renderer);

        // Particles - prefix p
        var pPosition = this.gpuCompute.createTexture(); // particles' position data
        var pVelocity = this.gpuCompute.createTexture(); // particles' velocity data
        
        this.fillPositionTexture( pPosition ); // initial condition
        this.fillVelocityTexture( pVelocity ); // initial condition

        // TODO: Grid data
        
        this.variables.pPosition = this.gpuCompute.addVariable("texturePosition", pPosFrag, pPosition);
        this.variables.pVelocity = this.gpuCompute.addVariable("textureVelocity", pVelFrag, pVelocity);

        this.gpuCompute.setVariableDependencies(this.variables.pVelocity, [this.variables.pPosition,  this.variables.pVelocity]);
        this.gpuCompute.setVariableDependencies(this.variables.pPosition, [this.variables.pPosition, this.variables.pVelocity]); // position depends on position and velocity


        this.uniforms.pPosition = this.variables.pPosition.material.uniforms;
        this.uniforms.pVelocity = this.variables.pVelocity.material.uniforms;

        // Initialize uniforms
        this.uniforms.pPosition.time = { value: 0.0 };
        this.uniforms.pPosition.dt = { value: 0.0 };

        this.uniforms.pVelocity.time = { value: 0.0 };

        var error = this.gpuCompute.init(); 
        if( error != null ){
            console.error( error );
        }
    }
    
    initRenderGeometry(){
        
        var geometry = new THREE.BufferGeometry();

        // Define custom vertex attributes needed in the vertex shader
        var positions = new THREE.BufferAttribute( new Float32Array( PARTICLES * 3 ), 3);
        var uvs = new THREE.BufferAttribute( new Float32Array( PARTICLES * 2), 2);

        var p = 0;
        for (var i = 0; i < PARTICLES; i++){
            positions.array[ p++ ] = ( Math.random() * 2 - 1 );
            positions.array[ p++ ] = 0;
            positions.array[ p++ ] = ( Math.random() * 2 - 1 );
        }

        p = 0;
        for( var i = 0; i < WIDTH ; i++ )
        {
            for (var j = 0; j < WIDTH; j++)
            {
                uvs.array[ p++ ] = i / (WIDTH - 1);
                uvs.array[ p++ ] = j / (WIDTH - 1);
            }
        }

        geometry.addAttribute("position", positions);
        geometry.addAttribute("uv", uvs);

        // Add any float textures to the render uniforms
        this.uniforms.render = {
            texturePosition: { value: null },
            textureVelocity: { value: null },
            time : { value: 1.0 },
            delta: { value: 0.0 }
        }

        var material = new THREE.ShaderMaterial({
            uniforms: this.uniforms.render,
            vertexShader: snowVert,
            fragmentShader: snowFrag
        });
        material.extensions.drawBuffers = true;

        // Render Mesh
        //var snowMesh = new THREE.Mesh( geometry, material );
        this.mesh = new THREE.Points(geometry, material);
        this.mesh.matrixAutoUpdate = false; 
        this.mesh.updateMatrix();
    }

    fillPositionTexture( texture ) {
        // Initialize the positions of the particles
        var BOUNDS = 800;
        var data = texture.image.data;
        for( var k = 0, kl = data.length; k < kl; k += 4 ){
            var x = Math.random() * BOUNDS - BOUNDS/2;
            var y = Math.random() * BOUNDS - BOUNDS/2; 
            var z = Math.random() * BOUNDS - BOUNDS/2;

            data[k + 0] = x;
            data[k + 1] = y;
            data[k + 2] = z;
            data[k + 3] = 1;
        }
    }

    fillVelocityTexture( texture ) {
        // Initialize the positions of the particles
        var data = texture.image.data;
        for( var k = 0, kl = data.length; k < kl; k += 4 ){
            var x = Math.random();
            var y = Math.random();
            var z = Math.random();

            data[k + 0] = x;
            data[k + 1] = y;
            data[k + 2] = z;
            data[k + 3] = 1;
        }
    }


    updateComputation() {
        var now = performance.now();
        var delta = (this.now - this.last) / 1000;

        if (delta > 1) delat = 1;
        this.last = this.now;

        this.uniforms.pPosition.time.value = this.now;
        this.uniforms.pPosition.dt.value = delta;

        // Runs the computation with the update information
        this.gpuCompute.compute();
    }

    animate() {
        
        requestAnimationFrame( animate );

        render(); 

        stats.update();
    }

    update() {
        this.updateComputation();

        // update textures used in render
        this.uniforms.render.texturePosition.value = this.gpuCompute.getCurrentRenderTarget(this.variables.pPosition).texture;
        this.uniforms.render.textureVelocity.value = this.gpuCompute.getCurrentRenderTarget(this.variables.pVelocity).texture;
    }
}
export default Snow;