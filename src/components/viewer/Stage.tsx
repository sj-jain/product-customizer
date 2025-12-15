import { Plane, ContactShadows } from '@react-three/drei';
import { useAppStore } from '../../store/useAppStore';
import * as THREE from 'three';
import { useRef, useEffect } from 'react';

interface StageProps {
  receiveShadow?: boolean;
  useContactShadows?: boolean;
}

function Stage({ receiveShadow = true, useContactShadows = false }: StageProps) {
  const environmentConfig = useAppStore((state) => state.environmentConfig);
  const lightingConfig = useAppStore((state) => state.lightingConfig);
  const planeRef = useRef<THREE.Mesh>(null);
  
  // Ensure the plane receives shadows - explicitly set on the mesh
  useEffect(() => {
    if (planeRef.current && !useContactShadows) {
      // CRITICAL: Enable shadow receiving on the mesh
      planeRef.current.receiveShadow = receiveShadow;
      
      // Ensure material supports shadows
      if (planeRef.current.material) {
        const material = planeRef.current.material as THREE.MeshStandardMaterial;
        // MeshStandardMaterial supports shadows by default
        material.needsUpdate = true;
      }
      
      // Force geometry update for shadow calculations
      if (planeRef.current.geometry) {
        planeRef.current.geometry.computeBoundingBox();
        planeRef.current.geometry.computeBoundingSphere();
      }
    }
  }, [receiveShadow, useContactShadows]);
  
  // Use ContactShadows for Nike-style soft shadows
  if (useContactShadows) {
    return (
      <>
        <Plane
          ref={planeRef}
          args={[20, 20]}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0, 0]}
          receiveShadow={false}
        >
          <meshStandardMaterial
            color={environmentConfig.stageColor}
            roughness={0.9}
            metalness={0.0}
            transparent={true}
            opacity={environmentConfig.stageOpacity}
            visible={true}
            side={THREE.DoubleSide}
          />
        </Plane>
        <ContactShadows
          position={[0, 0.01, 0]} // Slightly above stage to avoid z-fighting
          opacity={environmentConfig.shadowOpacity}
          scale={10}
          blur={2}
          far={10}
          resolution={1024}
          color={lightingConfig.shadowColor}
        />
      </>
    );
  }
  
  return (
    <Plane
      ref={planeRef}
      args={[20, 20]}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0, 0]}
      receiveShadow={receiveShadow}
    >
      <meshStandardMaterial
        color={environmentConfig.stageColor}
        roughness={0.9}
        metalness={0.0}
        transparent={true}
        opacity={environmentConfig.stageOpacity}
        visible={true}
        side={THREE.DoubleSide} // Render both sides to ensure shadows are visible
      />
    </Plane>
  );
}

export default Stage;

