import '../css/main.css';
import * as THREE from 'three';
import SceneManager from './sceneManager.js';

import vert from '../shaders/snow.vert';
import frag from '../shaders/snow.frag';
import Cube from './cube.js';

const canvas = document.getElementById('canvas');
const app = new SceneManager(canvas);

const cube = new Cube(3, 2, 2);
app.scene.add( cube.mesh );

app.animate(() => {
  // remove to stop animation
  cube.updateUniforms();
  cube.mesh.rotation.x += 0.01;
  cube.mesh.rotation.y += 0.01;
});
