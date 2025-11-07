import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CONFIG } from '../config';
import { createSleeve } from './createSleeve';
import type { TextureLoadResult } from '../types';

export interface SceneObjects {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;
  sleeve: THREE.Group;
}

/**
 * Creates and sets up the Three.js scene with lighting, camera, and objects.
 */
export function createScene(
  container: HTMLElement,
  coverTexture: TextureLoadResult | null
): SceneObjects {
  // Scene
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(CONFIG.background.color);
  
  // Ensure container has dimensions
  const width = container.clientWidth || 800;
  const height = container.clientHeight || 600;
  
  // Camera
  const camera = new THREE.PerspectiveCamera(
    CONFIG.camera.fov,
    width / height,
    CONFIG.camera.near,
    CONFIG.camera.far
  );
  camera.position.set(...CONFIG.camera.position);
  camera.lookAt(0, 0, 0);
  
  // Renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);
  
  // Lighting
  const { keyLight, rimLight, ambientLight } = CONFIG.lighting;
  
  // Key light
  const keyLightObj = new THREE.DirectionalLight(
    keyLight.color,
    keyLight.intensity
  );
  keyLightObj.position.set(...keyLight.position);
  keyLightObj.castShadow = true;
  keyLightObj.shadow.mapSize.width = 2048;
  keyLightObj.shadow.mapSize.height = 2048;
  keyLightObj.shadow.camera.near = 0.5;
  keyLightObj.shadow.camera.far = 50;
  keyLightObj.shadow.camera.left = -1;
  keyLightObj.shadow.camera.right = 1;
  keyLightObj.shadow.camera.top = 1;
  keyLightObj.shadow.camera.bottom = -1;
  scene.add(keyLightObj);
  
  // Rim light
  const rimLightObj = new THREE.DirectionalLight(
    rimLight.color,
    rimLight.intensity
  );
  rimLightObj.position.set(...rimLight.position);
  scene.add(rimLightObj);
  
  // Ambient light
  const ambientLightObj = new THREE.AmbientLight(
    ambientLight.color,
    ambientLight.intensity
  );
  scene.add(ambientLightObj);
  
  // Orbit controls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 0.3;
  controls.maxDistance = 2;
  
  // Create objects
  const sleeve = createSleeve(coverTexture);
  sleeve.castShadow = true;
  sleeve.receiveShadow = true;
  scene.add(sleeve);
  
  // Handle window resize
  const handleResize = () => {
    if (!container) return;
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  };
  window.addEventListener('resize', handleResize);

  // Animation loop
  const animate = () => {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  };
  animate();
  
  return {
    scene,
    camera,
    renderer,
    controls,
    sleeve,
  };
}

