import * as THREE from 'three';
import { CONFIG } from '../config';

/**
 * Creates a custom shader material for vinyl grooves.
 * Uses procedural noise to create subtle groove patterns.
 */
export function createGrooveMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      grooveCount: { value: CONFIG.vinyl.grooveCount },
    },
    vertexShader: `
      varying vec3 vPosition;
      varying vec3 vNormal;
      
      void main() {
        vPosition = position;
        vNormal = normal;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform float grooveCount;
      varying vec3 vPosition;
      varying vec3 vNormal;
      
      float groovePattern(vec2 uv) {
        float dist = length(uv);
        float angle = atan(uv.y, uv.x);
        float grooves = sin(dist * grooveCount * 2.0 + angle * 5.0) * 0.5 + 0.5;
        return grooves * 0.1 + 0.9; // subtle darkening
      }
      
      void main() {
        vec2 uv = vPosition.xy * 2.0;
        float groove = groovePattern(uv);
        vec3 color = vec3(0.05, 0.05, 0.05) * groove;
        gl_FragColor = vec4(color, 1.0);
      }
    `,
  });
}

