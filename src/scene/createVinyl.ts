import * as THREE from 'three';
import { CONFIG } from '../config';
import { createGrooveMaterial } from './grooveMaterial';
import type { TextureLoadResult } from '../types';

/**
 * Creates a vinyl record with grooves and center label.
 */
export function createVinyl(coverTexture: TextureLoadResult | null): THREE.Group {
  const group = new THREE.Group();
  const { radius, height, labelRadius } = CONFIG.vinyl;
  
  // Main vinyl cylinder with groove material
  const vinylGeometry = new THREE.CylinderGeometry(radius, radius, height, 64);
  const grooveMaterial = createGrooveMaterial();
  const vinyl = new THREE.Mesh(vinylGeometry, grooveMaterial);
  vinyl.rotation.x = Math.PI / 2; // Lay flat
  group.add(vinyl);
  
  // Center label disc
  const labelGeometry = new THREE.CylinderGeometry(labelRadius, labelRadius, height + 0.0001, 32);
  let labelMaterial: THREE.MeshStandardMaterial;
  
  if (coverTexture) {
    // Use the cover texture for the label (can be blurred later if needed)
    const labelTexture = coverTexture.texture.clone();
    labelTexture.center.set(0.5, 0.5);
    labelTexture.repeat.set(1, 1);
    
    labelMaterial = new THREE.MeshStandardMaterial({
      map: labelTexture,
      roughness: 0.6,
      metalness: 0.2,
    });
    
    // Apply blur effect asynchronously
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d')!;
      // Apply blur effect before drawing
      ctx.filter = 'blur(8px)';
      ctx.drawImage(img, 0, 0, 256, 256);
      const blurredTexture = new THREE.CanvasTexture(canvas);
      blurredTexture.colorSpace = THREE.SRGBColorSpace;
      labelMaterial.map = blurredTexture;
      labelMaterial.needsUpdate = true;
    };
    img.src = coverTexture.imageUrl;
  } else {
    // Solid color fallback
    labelMaterial = new THREE.MeshStandardMaterial({
      color: 0x2a2a2a,
      roughness: 0.6,
      metalness: 0.2,
    });
  }
  
  const label = new THREE.Mesh(labelGeometry, labelMaterial);
  label.rotation.x = Math.PI / 2;
  group.add(label);
  
  return group;
}

