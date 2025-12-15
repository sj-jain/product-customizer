import React from 'react';
import * as THREE from 'three';

interface LightingSetupProps {
  directionalLight1Intensity?: number;
  directionalLight2Intensity?: number;
  directionalLight3Intensity?: number;
  spotLightIntensity?: number;
  hemisphereLightIntensity?: number;
  showShadows?: boolean;
  shadowMapSize?: number;
}

/**
 * Milanese Shoe Customizer Lighting Setup
 * Complete lighting configuration matching the reference implementation
 */
function LightingSetup({
  directionalLight1Intensity = 0.4,
  directionalLight2Intensity = 0.8,
  directionalLight3Intensity = 0.3,
  spotLightIntensity = 1.0,
  hemisphereLightIntensity = 0.8,
  showShadows = true,
  shadowMapSize = 1024,
}: LightingSetupProps) {
  return (
    <>
      {/* 1. Main Directional Light (Top Right) */}
      <directionalLight 
        name="directionalLight1"
        intensity={directionalLight1Intensity} 
        position={[10, 10, 10]} 
        castShadow={showShadows}
        shadow-mapSize-height={shadowMapSize}
        shadow-mapSize-width={shadowMapSize}
      />

      {/* 2. Fill Light (Bottom) */}
      <directionalLight 
        name="directionalLight2"
        intensity={directionalLight2Intensity} 
        position={[0, -2, 0]} 
      />

      {/* 3. Top-Left Directional Light */}
      <directionalLight 
        name="directionalLight3"
        intensity={directionalLight3Intensity} 
        position={[-10, 10, 10]} 
        castShadow={false}
      />

      {/* 4. Spot Light (Top Down) - Soft, diffused for Nike By You style */}
      <spotLight 
        name="spotLight"
        intensity={spotLightIntensity} 
        angle={0.8} // Wider angle for softer coverage
        penumbra={0.5} // Soft falloff edges for diffused lighting
        position={[0, 1000, 0]} 
        castShadow={showShadows}
      />

      {/* 5. Hemisphere Light (Ambient) */}
      <hemisphereLight 
        name="hemisphereLight"
        intensity={hemisphereLightIntensity} 
        color="white" 
        groundColor="black" 
      />

      {/* 6. Ambient Light (Commented out in original) */}
      {/* <ambientLight intensity={0.5} /> */}
    </>
  );
}

export default LightingSetup;
