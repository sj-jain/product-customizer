import * as THREE from 'three';

export interface MeshCustomization {
  color?: string;
  texture?: string;
  normalMap?: string;
  roughnessMap?: string;
  metalnessMap?: string;
  aoMap?: string;            // Ambient occlusion map
  displacementMap?: string;   // Height/displacement map
  // Texture configuration
  textureScale?: number;      // UV scale (1.0 = normal, 2.0 = half size, 0.5 = double size)
  textureTint?: string;        // Color tint overlay (hex color)
  textureInvert?: boolean;     // Invert texture colors
  normalIntensity?: number;    // Normal map intensity (0.0 to 2.0, default 1.0)
  displacementIntensity?: number; // Displacement map intensity (0.0 to 0.5, default 0.0)
  roughness?: number;          // Material roughness value (0.0 to 1.0, default 0.7 for leather)
  metalness?: number;          // Material metalness value (0.0 to 1.0, default 0.0 for leather)
}

export interface CustomizableMesh {
  name: string;
  displayName: string;
  colors?: string[];
  textures?: string[];
  defaultColor?: string;
}

export interface ProductConfig {
  id: string;
  name: string;
  modelPath: string;
  thumbnail?: string;
  customizableMeshes: {
    [meshName: string]: CustomizableMesh;
  };
}

export interface MeshInfo {
  uuid: string;
  name: string;
  displayName: string;
}

export interface LightingConfig {
  // Milanese Lighting Setup - Only these 5 lights are used
  directionalLight1Intensity: number; // Main directional light (top-right) [10, 10, 10]
  directionalLight2Intensity: number; // Fill directional light (bottom) [0, -2, 0]
  directionalLight3Intensity: number; // Top-left directional light [-10, 10, 10]
  spotLightIntensity: number; // Spot light (top-down) [0, 1000, 0]
  hemisphereLightIntensity: number; // Hemisphere light (ambient)
  
  // Shadow configuration
  shadowIntensity: number;
  showShadows: boolean;
  shadowBlur: number;        // Shadow blur radius (0-20)
  shadowMapSize: number;     // Shadow map resolution (512, 1024, 2048, 4096)
  shadowBias: number;       // Shadow bias to prevent shadow acne
  shadowRadius: number;      // Shadow radius for softness
  shadowCameraLeft: number;  // Shadow camera bounds
  shadowCameraRight: number;
  shadowCameraTop: number;
  shadowCameraBottom: number;
  shadowCameraNear: number;
  shadowCameraFar: number;
  shadowColor: string;       // Shadow color (hex)
  environmentIntensity?: number; // Environment/reflection intensity (0.0 to 1.0)
}

export interface EnvironmentConfig {
  backgroundColor: string;
  productTiltX: number;  // Rotation in degrees around X axis
  productTiltY: number;  // Rotation in degrees around Y axis
  productTiltZ: number;  // Rotation in degrees around Z axis
  productHeight: number; // Height above stage
  stageOpacity: number;  // Stage opacity (0.0 to 1.0)
  stageColor: string;    // Stage color (hex)
  shadowOpacity: number; // Shadow opacity/intensity (0.0 to 1.0)
  environmentPreset?: string; // Environment preset name (e.g., "studio", "sunset", "dawn", etc.)
  environmentIntensity?: number; // Environment lighting intensity (0.0 to 1.0)
  cameraDistance?: number; // Camera distance from model (default: 3)
  showLightHelpers?: boolean; // Show visual indicators for lights
  showCoordinateSystem?: boolean; // Toggle visibility of coordinate system (grid + axes)
}

export interface AppState {
  // Model
  gltfModel: any | null;
  isLoading: boolean;
  error: string | null;
  
  // Mesh Discovery
  meshInfo: MeshInfo[]; // All discovered meshes with names and IDs
  
  // Selection
  selectedMesh: THREE.Mesh | null;
  selectedMeshId: string | null;
  selectedMeshName: string | null;
  
  // Customization - keyed by mesh UUID
  meshCustomizations: {
    [meshId: string]: MeshCustomization;
  };
  
  // Lighting
  lightingConfig: LightingConfig;
  
  // Environment
  environmentConfig: EnvironmentConfig;
  
  // UI
  showCustomizationPanel: boolean;
}

