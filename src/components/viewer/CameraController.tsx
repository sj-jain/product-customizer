import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useAppStore } from '../../store/useAppStore';

/**
 * CameraController - Dynamically updates camera position based on cameraDistance
 */
function CameraController() {
  const { camera } = useThree();
  const cameraDistance = useAppStore((state) => state.environmentConfig.cameraDistance ?? 4);

  useEffect(() => {
    if (camera instanceof THREE.PerspectiveCamera) {
      // Calculate new position maintaining the same angle
      // Original position was [8, 10, 0] at distance ~12.8
      // Scale proportionally based on cameraDistance
      const baseDistance = 12.8; // Approximate distance of [8, 10, 0]
      const scale = cameraDistance / 4; // 4 was the default cameraDistance
      const scaledDistance = baseDistance * scale;
      
      // Maintain the same direction vector [8, 10, 0] normalized, then scale
      const direction = new THREE.Vector3(8, 10, 0).normalize();
      const newPosition = direction.multiplyScalar(scaledDistance);
      
      camera.position.set(newPosition.x, newPosition.y, newPosition.z);
      camera.updateProjectionMatrix();
    }
  }, [camera, cameraDistance]);

  return null;
}

export default CameraController;

