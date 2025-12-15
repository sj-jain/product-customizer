import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface HighlightEffectProps {
  mesh: THREE.Mesh;
}

// Track currently highlighted mesh to restore previous one immediately
let currentHighlightedMesh: THREE.Mesh | null = null;

// Store original emissive properties for each mesh
const originalEmissiveColors = new WeakMap<THREE.Mesh, THREE.Color>();
const originalEmissiveIntensities = new WeakMap<THREE.Mesh, number>();

function HighlightEffect({ mesh }: HighlightEffectProps) {
  const highlightIntensityRef = useRef(0);
  const timeRef = useRef(0);

  useEffect(() => {
    // If there's a previously highlighted mesh, restore it immediately
    if (currentHighlightedMesh && currentHighlightedMesh !== mesh) {
      restoreMeshEmissive(currentHighlightedMesh);
    }

    // Set this as the current highlighted mesh
    currentHighlightedMesh = mesh;

    // Get the material (handle both single and array)
    const material = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
    
    if (material instanceof THREE.MeshStandardMaterial) {
      // Store original emissive properties if not already stored
      if (!originalEmissiveColors.has(mesh)) {
        originalEmissiveColors.set(mesh, material.emissive.clone());
        originalEmissiveIntensities.set(mesh, material.emissiveIntensity);
      }
    }

    // Reset animation
    highlightIntensityRef.current = 0;
    timeRef.current = 0;

    // Schedule restoration after 1 second (animation duration)
    const timeoutId = setTimeout(() => {
      restoreMeshEmissive(mesh);
    }, 1000);

    // Cleanup: Restore emissive when component unmounts or mesh changes
    return () => {
      if (currentHighlightedMesh === mesh) {
        currentHighlightedMesh = null;
      }
      clearTimeout(timeoutId);
      // If unmounting before 1 second, restore immediately
      restoreMeshEmissive(mesh);
    };
  }, [mesh]);

  useFrame((_state, delta) => {
    const material = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
    
    if (material instanceof THREE.MeshStandardMaterial) {
      timeRef.current += delta;
      
      // Animate highlight: fade in for 0.3s, hold for 0.4s, fade out for 0.3s
      if (timeRef.current < 0.3) {
        // Fade in
        highlightIntensityRef.current = timeRef.current / 0.3;
      } else if (timeRef.current < 0.7) {
        // Hold
        highlightIntensityRef.current = 1;
      } else if (timeRef.current < 1.0) {
        // Fade out
        highlightIntensityRef.current = 1 - (timeRef.current - 0.7) / 0.3;
      } else {
        // Done - remove highlight
        highlightIntensityRef.current = 0;
      }

      // Get original emissive properties
      const originalEmissive = originalEmissiveColors.get(mesh) || new THREE.Color(0x000000);
      const originalIntensity = originalEmissiveIntensities.get(mesh) || 0;

      // Apply highlight color (green glow) - temporarily modify emissive
      const highlightColor = new THREE.Color(0x00ff00);
      material.emissive.lerpColors(
        originalEmissive,
        highlightColor,
        highlightIntensityRef.current * 0.5
      );
      material.emissiveIntensity = originalIntensity + (highlightIntensityRef.current * 0.8);
      material.needsUpdate = true;
    }
  });

  return null;
}

// Helper function to restore mesh emissive properties
function restoreMeshEmissive(mesh: THREE.Mesh) {
  const material = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
  
  if (material instanceof THREE.MeshStandardMaterial) {
    const originalEmissive = originalEmissiveColors.get(mesh);
    const originalIntensity = originalEmissiveIntensities.get(mesh);
    
    if (originalEmissive) {
      material.emissive.copy(originalEmissive);
    }
    if (originalIntensity !== undefined) {
      material.emissiveIntensity = originalIntensity;
    }
    material.needsUpdate = true;
    
    // Clean up stored values
    originalEmissiveColors.delete(mesh);
    originalEmissiveIntensities.delete(mesh);
  }
}

export default HighlightEffect;
