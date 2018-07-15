import * as THREE from 'three';

import vert from '../shaders/snow.vert';
import frag from '../shaders/snow.frag';

class Cube {
  constructor(lengthX = 1, lengthY = 1, lengthZ = 1) {
    this.geometry = {};
    this.material = {};
    this.mesh = {};
    this.startTime = Date.now();

    this.init(lengthX, lengthY, lengthZ);
  }
  init(lengthX, lengthY, lengthZ) {
    this.geometry = new THREE.BoxGeometry(lengthX, lengthY, lengthZ);
    this.material = new THREE.RawShaderMaterial({
      uniforms: {
        uTime: { value: this.getUTime() },
        uResolution: { value: new THREE.Vector2() },
      },
      vertexShader: vert,
      fragmentShader: frag,
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
  }
  // uniforms
  updateUniforms() {
    this.mesh.material.uniforms.uTime.value = this.getUTime();
  }
  getUTime() {
    return (Date.now() - this.startTime) / 1000.0;
  }
}
export default Cube;
