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
    this.initRenderer();
    this.initCamera();
    this.initScene();

    // inital resize
    this.resize();

    // window event listeners
    window.addEventListener('resize', () => this.resize());
  }
  initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: false,
      stencil: false
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x29233b);

    const dpr = Math.min(1.5, window.devicePixelRatio);
    this.renderer.setPixelRatio(dpr);
  }
  initCamera() {
    const aspectRatio = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.01, 100);
    this.camera.position.set(0, 1, -3);
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

    this.renderer.setSize(width, height);
    this.updateProjectionMatrix();
    this.camera.updateProjectionMatrix(width, height);
  }
  updateProjectionMatrix(width, height) {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }
  disableOrbitControls() {
    this.controls.enable = false;
  }

  // uniforms
  getUTime() {
    return (Date.now() - this.startTime) / 1000.0;
  }
}

export default SceneManager;
