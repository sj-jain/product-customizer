import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useAppStore } from '../../store/useAppStore';

/**
 * LightHelper component - Visualizes lights in the scene
 * Shows which lights are active and causing reflections/shine
 */
function LightHelper() {
  const { scene } = useThree();
  const lightingConfig = useAppStore((state) => state.lightingConfig);
  const environmentConfig = useAppStore((state) => state.environmentConfig);
  const helpersRef = useRef<THREE.Object3D[]>([]);

  useEffect(() => {
    // Remove all existing helpers
    helpersRef.current.forEach(helper => {
      scene.remove(helper);
      if (helper instanceof THREE.DirectionalLightHelper || helper instanceof THREE.PointLightHelper) {
        helper.dispose();
      }
    });
    helpersRef.current = [];

    if (!environmentConfig.showLightHelpers) {
      return;
    }

    const helperSize = 0.5;
    const helperColor = 0xffff00; // Yellow for visibility

    // Find lights by traversing the scene
    scene.traverse((object) => {
      if (object instanceof THREE.DirectionalLight) {
        let helper: THREE.DirectionalLightHelper | null = null;
        
        if (object.name === 'keyLight' && lightingConfig.keyLightIntensity > 0) {
          helper = new THREE.DirectionalLightHelper(object, helperSize, helperColor);
          helper.name = 'keyLightHelper';
        } else if (object.name === 'fillLight' && lightingConfig.fillLightIntensity > 0) {
          helper = new THREE.DirectionalLightHelper(object, helperSize, helperColor);
          helper.name = 'fillLightHelper';
        } else if (object.name === 'topLight' && lightingConfig.shadowFromTopLight) {
          helper = new THREE.DirectionalLightHelper(object, helperSize, helperColor);
          helper.name = 'topLightHelper';
        } else if (object.name === 'rimLight' && lightingConfig.rimLightIntensity > 0) {
          helper = new THREE.DirectionalLightHelper(object, helperSize, 0xff0000); // Red for rim light (often causes shine)
          helper.name = 'rimLightHelper';
        }

        if (helper) {
          scene.add(helper);
          helpersRef.current.push(helper);
        }
      } else if (object instanceof THREE.PointLight && object.name === 'pointLight') {
        const helper = new THREE.PointLightHelper(object, helperSize, helperColor);
        helper.name = 'pointLightHelper';
        scene.add(helper);
        helpersRef.current.push(helper);
      }
    });

    return () => {
      helpersRef.current.forEach(helper => {
        scene.remove(helper);
        if (helper instanceof THREE.DirectionalLightHelper || helper instanceof THREE.PointLightHelper) {
          helper.dispose();
        }
      });
      helpersRef.current = [];
    };
  }, [
    lightingConfig.keyLightIntensity,
    lightingConfig.fillLightIntensity,
    lightingConfig.rimLightIntensity,
    lightingConfig.shadowFromTopLight,
    environmentConfig.showLightHelpers,
    scene,
  ]);

  // Update helpers every frame
  useFrame(() => {
    if (environmentConfig.showLightHelpers) {
      helpersRef.current.forEach((helper) => {
        if (helper instanceof THREE.DirectionalLightHelper || helper instanceof THREE.PointLightHelper) {
          helper.update();
        }
      });
    }
  });

  return null;
}

export default LightHelper;

