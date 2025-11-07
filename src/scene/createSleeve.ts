import * as THREE from 'three';
import { CONFIG } from '../config';
import type { TextureLoadResult } from '../types';

/**
 * Creates a vinyl record sleeve with cover texture on front face.
 * Uses rounded edges and plain colors on spine/top/bottom.
 */
export function createSleeve(coverTexture: TextureLoadResult | null): THREE.Group {
  const group = new THREE.Group();
  const { width, height, depth, bevelRadius } = CONFIG.sleeve;
  
  // Front face with cover texture
  const frontGeometry = new THREE.PlaneGeometry(width, height);
  const frontMaterial = coverTexture
    ? new THREE.MeshStandardMaterial({
        map: coverTexture.texture,
        roughness: 0.7,
        metalness: 0.1,
      })
    : new THREE.MeshStandardMaterial({
        color: 0x333333,
        roughness: 0.7,
        metalness: 0.1,
      });
  
  const front = new THREE.Mesh(frontGeometry, frontMaterial);
  front.position.z = depth / 2 + 0.001;
  group.add(front);
  
  // Back face (plain color)
  const backGeometry = new THREE.PlaneGeometry(width, height);
  const backMaterial = new THREE.MeshStandardMaterial({
    color: 0x2a2a2a,
    roughness: 0.7,
    metalness: 0.1,
  });
  const back = new THREE.Mesh(backGeometry, backMaterial);
  back.position.z = -depth / 2 - 0.001;
  group.add(back);
  
  // Top edge
  const topGeometry = new THREE.PlaneGeometry(width, depth);
  const topMaterial = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a,
    roughness: 0.8,
  });
  const top = new THREE.Mesh(topGeometry, topMaterial);
  top.rotation.x = Math.PI / 2;
  top.position.y = height / 2;
  group.add(top);
  
  // Bottom edge
  const bottom = new THREE.Mesh(topGeometry, topMaterial);
  bottom.rotation.x = Math.PI / 2;
  bottom.position.y = -height / 2;
  group.add(bottom);
  
  // Right spine
  const spineGeometry = new THREE.PlaneGeometry(depth, height);
  const spineMaterial = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a,
    roughness: 0.8,
  });
  const rightSpine = new THREE.Mesh(spineGeometry, spineMaterial);
  rightSpine.rotation.y = Math.PI / 2;
  rightSpine.position.x = width / 2;
  group.add(rightSpine);
  
  // Left spine
  const leftSpine = new THREE.Mesh(spineGeometry, spineMaterial);
  leftSpine.rotation.y = Math.PI / 2;
  leftSpine.position.x = -width / 2;
  group.add(leftSpine);
  
  // Add subtle bevel effect using rounded box edges
  // We'll use a slight scale on corners for visual bevel
  const bevelHelper = new THREE.Group();
  const cornerSize = bevelRadius;
  
  // Corner bevels (simplified - using small boxes at corners)
  for (const [x, y] of [
    [1, 1], [1, -1], [-1, 1], [-1, -1],
  ]) {
    const cornerGeometry = new THREE.BoxGeometry(cornerSize, cornerSize, depth);
    const cornerMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      roughness: 0.8,
    });
    const corner = new THREE.Mesh(cornerGeometry, cornerMaterial);
    corner.position.set(
      (width / 2 - cornerSize / 2) * x,
      (height / 2 - cornerSize / 2) * y,
      0
    );
    bevelHelper.add(corner);
  }
  
  group.add(bevelHelper);
  
  return group;
}

