import * as THREE from 'three';
import type { TextureLoadResult } from '../types';

/**
 * Fetches an image and creates a Three.js texture with CORS-safe settings.
 * Uses blob URL to enable canvas export.
 */
export async function fetchCover(imageUrl: string): Promise<TextureLoadResult> {
  try {
    // Fetch image as blob to handle CORS
    const response = await fetch(imageUrl, { mode: 'cors' });
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    
    // Load texture from blob URL
    const texture = await new Promise<THREE.Texture>((resolve, reject) => {
      const loader = new THREE.TextureLoader();
      loader.load(
        objectUrl,
        (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.flipY = false;
          resolve(texture);
        },
        undefined,
        (error) => {
          reject(error);
        }
      );
    });
    
    return { texture, imageUrl: objectUrl };
  } catch (error) {
    console.error('Error fetching cover:', error);
    throw error;
  }
}

