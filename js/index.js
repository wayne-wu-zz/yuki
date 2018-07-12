import '../css/main.css';
import SceneManager from './sceneManager.js';

import vert from '../shaders/snow.vert';
import frag from '../shaders/snow.frag';

const canvas = document.getElementById('canvas');
const { camera, renderer, scene } = new SceneManager(canvas);
