import * as THREE from 'three';
import OrbitControls from 'three-orbit-controls';

const OrbitController = OrbitControls(THREE);

class SceneManager {
  constructor(canvas) {
      this.canvas = canvas;
      this.scene = {};
      this.camera = {};
      this.renderer = {};
      this.controls = {};

      this.init();
  }
  init() {
    this.initScene();
    this.initCamera();
    this.initRenderer();
    this.addOrbitControls()

    // inital resize
    this.resize();

    // window event listeners
    window.addEventListener('resize', () => this.resize());
  }
  animate(callback) {
    callback();
    requestAnimationFrame( () => this.animate(callback) );
    this.renderer.render( this.scene, this.camera );
  }
  initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: false,
      stencil: false
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.setClearColor(0x29233b);

    const dpr = Math.min(1.5, window.devicePixelRatio);
    this.renderer.setPixelRatio(dpr);
  }
  initCamera() {
    const aspectRatio = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 1000);
    this.camera.position.set(0, 0.5, 5);
  }
  initScene() {
    this.scene = new THREE.Scene();
    window.scene = this.scene;
  }
  addOrbitControls() {
    this.controls = new OrbitController(this.camera, this.renderer.domElement);
  }
  resize() {
    const { innerHeight: height, innerWidth: width } = window;
    this.updateProjectionMatrix(width, height);
    this.renderer.setSize(width, height);
  }
  updateProjectionMatrix(width, height) {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }
  disableOrbitControls() {
    this.controls.enable = false;
  }
  setClearColor(hex) {
    this.renderer.setClearColor(hex);
  }
  createGridHelper(size = 10, divisions = 10) {
    const gridHelper = new THREE.GridHelper(size, divisions);
    this.scene.add(gridHelper);
  }
  createAxisHelper(size = 5) {
    const axisHelper = new THREE.AxisHelper(5);
    this.scene.add(axisHelper);
  }
}

export default SceneManager;
