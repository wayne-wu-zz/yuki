import '../css/main.css';
import * as THREE from 'three';

import SceneManager from './sceneManager.js';
import Cube from './cube.js';
import Snow from './snow.js';

const canvas = document.getElementById('canvas');
const app = new SceneManager(canvas);

const cube = new Cube(3, 2, 2);

const snow = new Snow();

//app.scene.add( cube.mesh );
app.scene.add( snow.mesh );

app.animate(() => {
  
  snow.update();
  //cube.updateUniforms();

  // remove to stop animation
  //cube.mesh.rotation.x += 0.01;
  //cube.mesh.rotation.y += 0.01;
});

