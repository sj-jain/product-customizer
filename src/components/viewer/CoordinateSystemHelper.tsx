import { useRef, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface CoordinateSystemHelperProps {
  show: boolean;
}

/**
 * Coordinate System Helper - Shows grid plane and axes
 */
function CoordinateSystemHelper({ show }: CoordinateSystemHelperProps) {
  const { scene } = useThree();
  const gridHelperRef = useRef<THREE.GridHelper | null>(null);
  const axesHelperRef = useRef<THREE.AxesHelper | null>(null);

  useEffect(() => {
    // Remove existing helpers
    if (gridHelperRef.current) {
      scene.remove(gridHelperRef.current);
      gridHelperRef.current.dispose();
      gridHelperRef.current = null;
    }
    if (axesHelperRef.current) {
      scene.remove(axesHelperRef.current);
      axesHelperRef.current.dispose();
      axesHelperRef.current = null;
    }

    if (show) {
      // Grid Helper - Horizontal plane (XZ plane)
      // Size: 20x20, divisions: 20, color1: gray, color2: darker gray
      const gridHelper = new THREE.GridHelper(20, 20, 0x888888, 0x444444);
      gridHelper.position.y = 0; // Horizontal plane at Y=0
      scene.add(gridHelper);
      gridHelperRef.current = gridHelper;

      // Axes Helper - Shows X (red), Y (green), Z (blue) axes
      // Size: 5 units
      const axesHelper = new THREE.AxesHelper(5);
      scene.add(axesHelper);
      axesHelperRef.current = axesHelper;
    }

    return () => {
      if (gridHelperRef.current) {
        scene.remove(gridHelperRef.current);
        gridHelperRef.current.dispose();
        gridHelperRef.current = null;
      }
      if (axesHelperRef.current) {
        scene.remove(axesHelperRef.current);
        axesHelperRef.current.dispose();
        axesHelperRef.current = null;
      }
    };
  }, [show, scene]);

  return null;
}

export default CoordinateSystemHelper;

