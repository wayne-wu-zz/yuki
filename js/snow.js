
import GPUComputationRenderer from "./GPUComputationRenderer.js";
import * as THREE from 'three';

import snowFrag from '../shaders/snow.frag';
import snowVert from '../shaders/snow.vert';

import pPosFrag from '../shaders/ppos.frag';
import pVelFrag from '../shaders/pvel.frag';


var WIDTH = 128;
var HEIGHT = 128;
var PARTICLES = WIDTH * HEIGHT;

class Snow {
    constructor(){
        this.gpuCompute = {};
        
        //uniforms
        this.uniforms = {};

        this.variables = {};

        this.mesh;

        this.init();
    }
    
    // Initialize all
    init(){
        this.initComputeRenderer();
        this.initRenderGeometry();
    }

    // Initialize computation
    initComputeRenderer(){
        this.gpuCompute = new GPUComputationRenderer(WIDTH, HEIGHT, this.renderer);

        // Particles
        var pPosition = this.gpuCompute.createTexture(); // particles' position data
        var pVelocity = this.gpuCompute.createTexture(); // particles' velocity data
        this.fillPositionTexture( pPosition ); // initial condition
        // this.fillVelocityTexture( pVelocity ); // initial condition

        // TODO: Grid data

        this.variables.pPosition = this.gpuCompute.addVariable("texturePosition", pPosFrag, pPosition);
        this.variables.pVelocity = this.gpuCompute.addVariable("textureVelocity", pVelFrag, pVelocity);

        this.gpuCompute.setVariableDependencies(this.variables.pPosition, [this.variables.pPosition,  this.variables.pVelocity]); // position depends on position and velocity
        this.gpuCompute.setVariableDependencies( this.variables.pVelocity, [this.variables.pPosition,  this.variables.pVelocity]);

        this.uniforms.pPosition = this.variables.pPosition.material.uniforms;
        this.uniforms.pVelocity = this.variables.pVelocity.material.uniforms;

        // Initialize uniforms
        this.uniforms.pPosition.time = { value: 0.0 };
        this.uniforms.pPosition.dt = { value: 0.0 };

        // TODO: Grid data

        var error = this.gpuCompute.init(); 
        if( error != null ){
            console.error( error );
        }
    }
    
    initRenderGeometry(){
        var points = PARTICLES; 

        var geometry = new THREE.BufferGeometry();

        // Define custom vertex attributes needed in the vertex shader
        var positions = new THREE.BufferAttribute( new Float32Array( points * 3 ), 3);
        var sizes = new THREE.BufferAttribute( new Float32Array( points ), 1);
        var uvs = new THREE.BufferAttribute( new Float32Array( points * 2), 2);
        geometry.addAttribute("position", positions);
        geometry.addAttribute("size", sizes);
        geometry.addAttribute("uv", uvs);

        // TODO: Set attributes

        // set uv for accessing texture in vertex shader
        for( var i = 0; i < PARTICLES ; i++ )
        {
            var x = (i % WIDTH) / WIDTH;
            var y = ~~(i / HEIGHT) / HEIGHT;
            uvs.array[ i * 2 ] = x;
            uvs.array[ i * 2 + 1 ] = y;
        }

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

        // Render Mesh
        //var snowMesh = new THREE.Mesh( geometry, material );
        var snowMesh = new THREE.Points(geometry, material);
        //snowMesh.matrixAutoUpdate = false; 
        //snowMesh.updateMatrix();

        this.mesh = snowMesh;
    }

    fillPositionTexture( texture ) {
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
        var delta = (now - last) / 1000;

        if (delta > 1) delat = 1;
        last = now;

        this.uniforms.pPosition.time.value = now;
        this.uniforms.pVelocity.dt.value = delta;

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
        this.uniforms.render.texturePosition.texture = this.gpuCompute.getCurrentRenderTarget(this.variables.pPosition).texture;
        this.uniforms.render.textureVelocity.texture = this.gpuCompute.getCurrentRenderTarget(this.variables.pVelocity).texture;
    }
}
export default Snow;