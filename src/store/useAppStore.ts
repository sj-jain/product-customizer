import { create } from 'zustand';
import * as THREE from 'three';
import { AppState, MeshCustomization, MeshInfo, LightingConfig, EnvironmentConfig } from '../types';

interface AppStore extends AppState {
  setGLTFModel: (model: any) => void;
  setMeshInfo: (meshInfo: MeshInfo[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  selectMesh: (mesh: THREE.Mesh | null, meshId: string | null) => void;
  updateMeshCustomization: (meshId: string, customization: MeshCustomization) => void;
  toggleCustomizationPanel: (show: boolean) => void;
  updateLightingConfig: (config: Partial<LightingConfig>) => void;
  updateEnvironmentConfig: (config: Partial<EnvironmentConfig>) => void;
  reset: () => void;
}

const initialState: AppState = {
  gltfModel: null,
  isLoading: false,
  error: null,
  meshInfo: [],
  selectedMesh: null,
  selectedMeshId: null,
  selectedMeshName: null,
  meshCustomizations: {},
      lightingConfig: {
        // Nike By You Style Lighting - Soft, diffused, realistic
        // Increased ambient/fill lighting to make dark colors visible
        directionalLight1Intensity: 0.35, // Main directional light (top-right) - increased for better visibility
        directionalLight2Intensity: 0.7, // Fill directional light (bottom) - increased to illuminate dark colors
        directionalLight3Intensity: 0.3, // Top-left directional light - balanced fill from opposite side
        spotLightIntensity: 0.4, // Spot light (top-down) - increased for better overall illumination
        hemisphereLightIntensity: 1.5, // Hemisphere light (ambient) - increased to make dark colors visible
        
        // Shadow configuration - Nike style soft shadows
        shadowIntensity: 0.4, // Shadow intensity - lighter for subtle shadows
        showShadows: true, // Enable shadows
        shadowBlur: 2, // Shadow blur radius - softer edges (ContactShadows blur)
        shadowMapSize: 1024, // Shadow map resolution
        shadowBias: -0.0001, // Shadow bias
        shadowRadius: 1, // Shadow radius for softness
        shadowCameraLeft: -15, // Shadow camera bounds
        shadowCameraRight: 15,
        shadowCameraTop: 15,
        shadowCameraBottom: -15,
        shadowCameraNear: 0.1,
        shadowCameraFar: 50,
        shadowColor: '#888888', // Shadow color - lighter gray for subtle shadows
        environmentIntensity: 0.0, // Environment/reflection intensity - NO SHINE
      },
      environmentConfig: {
        backgroundColor: '#ffffff',
        productTiltX: 0, // No tilt by default
        productTiltY: 0, // No tilt by default
        productTiltZ: 0, // No tilt by default
        productHeight: 0.5, // Product height above shadow plane - ensures stage is below product
        stageOpacity: 0.4, // Slightly more visible stage
        stageColor: '#ffffff',
        shadowOpacity: 0.3, // Softer, more subtle shadow (Nike style) - lighter for realism
        environmentPreset: undefined, // No environment preset by default
        environmentIntensity: 0.0, // NO SHINE - Environment disabled
        cameraDistance: 4, // Default camera distance (further from model)
        showLightHelpers: false, // Don't show light helpers by default
        showCoordinateSystem: false, // Don't show coordinate system by default
      },
  showCustomizationPanel: false,
};

export const useAppStore = create<AppStore>((set) => ({
  ...initialState,
  
  setGLTFModel: (model) => set({ gltfModel: model }),
  
  setMeshInfo: (meshInfo) => set({ meshInfo }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  setError: (error) => set({ error }),
  
  selectMesh: (mesh, meshId) => {
    // Get display name from meshInfo if available, otherwise use mesh name
    set((state) => {
      const meshInfo = state.meshInfo.find(m => m.uuid === meshId);
      const meshName = meshInfo?.displayName || mesh?.name || (meshId ? `Mesh_${meshId.substring(0, 8)}` : null);
      
      return {
        selectedMesh: mesh, 
        selectedMeshId: meshId,
        selectedMeshName: meshName,
        showCustomizationPanel: mesh !== null 
      };
    });
  },
  
  updateMeshCustomization: (meshId, customization) =>
    set((state) => ({
      meshCustomizations: {
        ...state.meshCustomizations,
        [meshId]: {
          ...state.meshCustomizations[meshId],
          ...customization,
        },
      },
    })),
  
  toggleCustomizationPanel: (show) => 
    set({ showCustomizationPanel: show }),
  
  updateLightingConfig: (config) =>
    set((state) => ({
      lightingConfig: {
        ...state.lightingConfig,
        ...config,
      },
    })),
  
  updateEnvironmentConfig: (config) =>
    set((state) => ({
      environmentConfig: {
        ...state.environmentConfig,
        ...config,
      },
    })),
  
  reset: () => set(initialState),
}));

