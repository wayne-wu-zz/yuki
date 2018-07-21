import '../css/main.css';
import * as THREE from 'three';

import SceneManager from './sceneManager.js';
import Cube from './cube.js';
import Snow from './snow.js';

const canvas = document.getElementById('canvas');
const app = new SceneManager(canvas);

const cube = new Cube(4, 2, 4);

const snow = new Snow({
  renderer: app.renderer,
  bbox: cube.getBoundingBox(),
  gridWidth: 64
});

app.scene.add( cube.mesh );
app.scene.add( snow.mesh );

app.animate(() => {
  
  snow.update();

});

