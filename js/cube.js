import * as THREE from 'three';

import vert from '../shaders/snow.vert';
import frag from '../shaders/snow.frag';

class Cube {
  constructor(config) {
    this.geometry = {};
    this.material = {};
    this.mesh = {};
    this.startTime = Date.now();

    this.init(config.dimmensions);
  }
  init(dimmensions) {
    const { x, y, z } = dimmensions;
    this.geometry = new THREE.BoxGeometry(x, y, z);
    this.material = new THREE.MeshBasicMaterial({
      wireframe: true
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
  }
  getBoundingBox() {
    const bbox = new THREE.Box3();
    return bbox.setFromObject(this.mesh);
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
