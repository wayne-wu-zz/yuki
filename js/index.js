import '../css/main.css';
import * as THREE from 'three';
import SceneManager from './sceneManager.js';

import vert from '../shaders/snow.vert';
import frag from '../shaders/snow.frag';

const canvas = document.getElementById('canvas');
const app = new SceneManager(canvas);

// app.addOrbitControls();

const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const material = new THREE.MeshBasicMaterial({ color: 0xff000f, wireframe: true });
const cube = new THREE.Mesh(geometry, material);
app.scene.add( cube );

app.animate(() => {
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
});
