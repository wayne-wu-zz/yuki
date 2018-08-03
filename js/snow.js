
import GPUComputationRenderer from "./GPUComputationRenderer.js";
import * as THREE from 'three';

// Import shaders
import snowFrag from '../shaders/snow.frag';
import snowVert from '../shaders/snow.vert';

import pPosFrag from '../shaders/ppos.frag';
import pVelFrag from '../shaders/pvel.frag';
import pDefGradientFrag from '../shaders/pdefgradient.frag';

import gForceFrag from '../shaders/gforce.frag';
import gVelFrag from '../shaders/gvel.frag';
import gVel2Frag from '../shaders/gvel2.frag';


var GRIDSIZE = 0.1;

class Snow {
    constructor({renderer, bbox, gridWidth}){
        this.renderer = renderer;
        this.bbox = bbox;
        this.gridWidth = gridWidth || 64;
        this.particlesNum = gridWidth*gridWidth;

        this.gpuCompute = {};
        
        //uniforms
        this.uniforms = {};

        this.variables = {};

        this.shaders = {};
        this.rendertargets = {};
        this.textures = {};

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
        this.gpuCompute = new GPUComputationRenderer(this.gridWidth, this.gridWidth, this.renderer);

        // Particles - prefix p
        var tex = this.textures;
        
        tex.pPosition = this.gpuCompute.createTexture(); // particles' position data + volume
        tex.pVelocity = this.gpuCompute.createTexture(); // particles' velocity data + mass
        
        // Each row of the matrix will be stored as one texture
        // tex.pDefGradient1 = this.gpuCompute.createTexture();
        // tex.pDefGradient2 = this.gpuCompute.createTexture();
        // tex.pDefGradient3 = this.gpuCompute.createTexture();
        tex.pDefGradient = this.gpuCompute.createTexture(this.gridWidth, 3* this.gridWidth);

        // Grid - prefix g
        var size = this.bbox.getSize();
        var xNum = size.x / GRIDSIZE;
        var yNum = size.y / GRIDSIZE;
        var zNum = size.z / GRIDSIZE;
        var texSizeX = xNum * Math.ceil(Math.sqrt(zNum));
        var texSizeY = yNum * Math.ceil(Math.sqrt(zNum));
        tex.gVelocity = this.createTexture( texSizeX, texSizeY );
        tex.gForce = this.createTexture( texSizeX, texSizeY ); 

        this.fillPositionTexture( tex.pPosition ); // initial condition
        this.fillVelocityTexture( tex.pVelocity ); // initial condition
        this.fillDeformationGradient( tex.pDefGradient );

        var shaders = this.shaders;
        var rt = this.rendertargets;

        shaders.gVelShader = this.gpuCompute.createShaderMaterial( gVelFrag, { 
            pPosTexture : { value: null },
            pVelTexture : { value: null }
        } );
        shaders.gForceShader = this.gpuCompute.createShaderMaterial( gForceFrag, {
            pPosTexture : { value: null }, 
            pDefGradientTexture : { value: null }
        } );
        shaders.gVel2Shader = this.gpuCompute.createShaderMaterial( gVel2Frag, {
            gVelTexture : { value: null },
            gForceTexture : { value: null }
        })
        shaders.pDefGradientShader = this.gpuCompute.createShaderMaterial( pDefGradientFrag, {
            gVelTexture : { value: null },
            pPosTexture: { value: null },
            pDefGradientTexture : { value: null }
        })

        rt.gVelRT = this.gpuCompute.createRenderTarget( texSizeX, texSizeY );
        rt.gForceRT = this.gpuCompute.createRenderTarget( texSizeX, texSizeY );
        rt.gVel2RT = this.gpuCompute.createRenderTarget( texSizeX, texSizeY );
        rt.pDefGradRT = this.gpuCompute.createRenderTarget( this.gridWidth, 3*this.gridWidth );

        this.variables.pPosition = this.gpuCompute.addVariable("pPosTexture", pPosFrag, tex.pPosition);
        this.variables.pVelocity = this.gpuCompute.addVariable("pVelTexture", pVelFrag, tex.pVelocity);

        this.gpuCompute.setVariableDependencies(this.variables.pVelocity, [this.variables.pPosition]);
        this.gpuCompute.setVariableDependencies(this.variables.pPosition, [this.variables.pPosition, this.variables.pVelocity]); // position depends on position and velocity

        this.uniforms.pPosition = this.variables.pPosition.material.uniforms;
        this.uniforms.pVelocity = this.variables.pVelocity.material.uniforms;

        // Initialize uniforms
        this.uniforms.pVelocity.gVelTexture = { value: null }
        this.uniforms.pVelocity.dt = { value: 0.0 };

        this.uniforms.pPosition.dt = { value: 0.0 };

        this.uniforms.gVelFrag.gridSize = { valeu: 0.0 };

        var error = this.gpuCompute.init(); 
        if( error != null ){
            console.error( error );
        }
    }

    compute(){

        // Read: Update textures (data)
        this.shaders.gVelShader.uniforms.pPosTexture = this.textures.pPosition;
        this.shaders.gVelShader.uniforms.pVelTexture = this.textures.pVelocity;
        this.gpuCompute.doRenderTarget( this.shaders.gVelShader, this.rendertargets.gVelRT);
        this.textures.gVelocity = this.rendertargets.gVelRT.texture;

        this.shaders.gForceShader.uniforms.pPosTexture = this.textures.pPosition;
        this.shaders.gForceShader.uniforms.pDefGradientTexture = this.textures.pDefGradient;
        this.gpuCompute.doRenderTarget( this.textures.gForce, this.rendertargets.gForceRT );
        this.textures.gForce = this.rendertargets.gForceRT.texture;

        this.shaders.gVel2Shader.uniforms.gVelTexture = this.textures.gVelocity;
        this.shaders.gVel2Shader.uniforms.gForceTexture = this.textures.gForce;
        this.gpuCompute.renderTexture(this.textures.gVelocity, this.rendertargets.gVel2RT);
        this.textures.gVelocity = this.rendertargets.gVel2RT.texture;

        this.shaders.pDefGradientShader.uniforms.gVelTexture = this.textures.gVelocity;
        this.shaders.pDefGradientShader.uniforms.pPosTexture = this.textures.pPosition;
        this.shaders.pDefGradientShader.uniforms.pDefGradientTexture = this.textures.pDefGradient;
        this.gpuCompute.renderTexture(this.textures.pDefGradient, this.rendertargets.pDefGradRT);
        this.textures.pDefGradient = this.rendertargets.pDefGradRT.texture;

        // Update uniforms for pPosition, pVelocity
        this.uniforms.pVelocity.gVelTexture = this.textures.gVelocity;

        this.gpuCompute.compute();
    }
    
    createTexture( sizeX, sizeY ){
        var a = new Float32Array( sizeX * sizeY * 4 );
		var texture = new THREE.DataTexture( a, sizeX, sizeY, THREE.RGBAFormat, THREE.FloatType );
		texture.needsUpdate = true;
        return texture;
    }

    initRenderGeometry(){
        
        var geometry = new THREE.BufferGeometry();

        // Define custom vertex attributes needed in the vertex shader
        var positions = new THREE.BufferAttribute( new Float32Array( this.particlesNum * 3 ), 3);
        var uvs = new THREE.BufferAttribute( new Float32Array( this.particlesNum * 2), 2);

        var p = 0;
        for (var i = 0; i < this.particlesNum; i++){
            positions.array[ p++ ] = ( Math.random() * 2 - 1 );
            positions.array[ p++ ] = 0;
            positions.array[ p++ ] = ( Math.random() * 2 - 1 );
        }

        p = 0;
        for( var i = 0; i < this.gridWidth; i++ )
        {
            for (var j = 0; j < this.gridWidth; j++)
            {
                uvs.array[ p++ ] = i / (this.gridWidth - 1);
                uvs.array[ p++ ] = j / (this.gridWidth - 1);
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
        this.mesh = new THREE.Points( geometry, material );
        this.mesh.matrixAutoUpdate = false; 
        this.mesh.updateMatrix();
    }

    fillPositionTexture( texture ) {
        // Initialize the positions of the particles
        var min = this.bbox.min;
        var max = this.bbox.max;
        var data = texture.image.data;
        for( var k = 0, kl = data.length; k < kl; k += 4 ){
            var x = THREE.Math.mapLinear(Math.random(), 0, 1, min.x, max.x);
            var y = THREE.Math.mapLinear(Math.random(), 0, 1, min.y, max.y);
            var z = THREE.Math.mapLinear(Math.random(), 0, 1, min.z, max.z);

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
            var x = 0;//Math.random();
            var y = 0;//Math.random();
            var z = 0;//Math.random();

            data[k + 0] = x;
            data[k + 1] = y;
            data[k + 2] = z;
            data[k + 3] = 1;
        }
    }

    fillDeformationGradient( texture ){
        var data = texture.image.data;
        var n = this.particlesNum;
        for( var k = 0, kl = n; k < kl; k ++){
            data[k + 0] = 1;
            data[k + 1] = 0;
            data[k + 2] = 0;
            data[k + 3] = 1;
            data[k + n - 1 + 0] = 0;
            data[k + n - 1 + 1] = 1;
            data[k + n - 1 + 2] = 0;
            data[k + n - 1 + 3] = 1;
            data[k + 2*n - 1 + 0] = 0;
            data[k + 2*n - 1 + 1] = 0;
            data[k + 2*n - 1 + 2] = 1;
            data[k + 2*n - 1 + 3] = 1;
        }
    }

    updateComputation() {
        this.now = performance.now();
        var delta = (this.now - this.last) / 1000;

        if (delta > 1) delat = 1;
        this.last = this.now;

        this.uniforms.pPosition.time.value = this.now;
        this.uniforms.pPosition.dt.value = delta;

        this.uniforms.pVelocity.time.value = this.now;
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
        this.compute();

        // update textures used in render
        this.uniforms.render.texturePosition.value = this.gpuCompute.getCurrentRenderTarget(this.variables.pPosition).texture;
        this.uniforms.render.textureVelocity.value = this.gpuCompute.getCurrentRenderTarget(this.variables.pVelocity).texture;
    }
}
export default Snow;