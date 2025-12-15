import { Suspense } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Environment } from '@react-three/drei';
import { ArrowLeft } from 'lucide-react';
import GLTFModel from '../components/viewer/GLTFModel';
import LightingSetup from '../components/viewer/LightingSetup';
import LightHelper from '../components/viewer/LightHelper';
import CoordinateSystemHelper from '../components/viewer/CoordinateSystemHelper';
import CameraController from '../components/viewer/CameraController';
import CustomizationPanel from '../components/customization/CustomizationPanel';
import LoadingScreen from '../components/ui/LoadingScreen';
import Toolbar from '../components/ui/Toolbar';
import MeshInfoPanel from '../components/ui/MeshInfoPanel';
import LightingPanel from '../components/ui/LightingPanel';
import EnvironmentPanel from '../components/ui/EnvironmentPanel';
import AIChat from '../components/ai/AIChat';
import CaptureControls from '../components/capture/CaptureControls';
import MeshDropdown from '../components/ui/MeshDropdown';
import { useAppStore } from '../store/useAppStore';

function CustomizePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isLoading = useAppStore((state) => state.isLoading);
  const lightingConfig = useAppStore((state) => state.lightingConfig);
  const environmentConfig = useAppStore((state) => state.environmentConfig);
  
  // Get model path from URL query parameter
  const modelPath = searchParams.get('model') || '/models/shoe-1.glb';

  return (
    <div 
      className="relative w-full h-screen customize-page"
      style={{ backgroundColor: environmentConfig.backgroundColor }}
    >
      {/* Back Button - Professional icon-only button, positioned to avoid overlap with Toolbar */}
      <button
        onClick={() => navigate('/')}
        className="fixed top-4 left-4 z-50 flex items-center justify-center w-10 h-10 bg-white/95 hover:bg-white text-gray-700 hover:text-gray-900 rounded-lg shadow-lg transition-all backdrop-blur-sm border border-gray-200 hover:border-gray-300 hover:shadow-xl group"
        title="Back to Home"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
      </button>

      {/* 3D Canvas */}
      <Canvas
        shadows
        camera={{ 
          position: [8, 10, 0],
          fov: 20
        }}
        style={{ background: environmentConfig.backgroundColor }}
        gl={{ 
          antialias: true,
          preserveDrawingBuffer: true
        }}
        dpr={[1, 2]}
        className="w-full h-full"
      >
        <Suspense fallback={null}>
          
          {/* Camera Controller - Updates camera position based on cameraDistance */}
          <CameraController />
          
          {/* Light Helpers - Visualize which lights are active */}
          <LightHelper />
          
          {/* Coordinate System Helper - Grid plane and axes */}
          <CoordinateSystemHelper show={environmentConfig.showCoordinateSystem ?? false} />
          
          {/* Milanese Lighting Setup */}
          <LightingSetup
            directionalLight1Intensity={lightingConfig.directionalLight1Intensity}
            directionalLight2Intensity={lightingConfig.directionalLight2Intensity}
            directionalLight3Intensity={lightingConfig.directionalLight3Intensity}
            spotLightIntensity={lightingConfig.spotLightIntensity}
            hemisphereLightIntensity={lightingConfig.hemisphereLightIntensity}
            showShadows={lightingConfig.showShadows}
            shadowMapSize={lightingConfig.shadowMapSize}
          />
          
          {/* Environment Preset - Controls all lighting */}
          {environmentConfig.environmentPreset && (
            <Environment 
              preset={environmentConfig.environmentPreset as "apartment" | "city" | "dawn" | "forest" | "lobby" | "night" | "park" | "studio" | "sunset" | "warehouse"}
              background={false}
              environmentIntensity={environmentConfig.environmentIntensity ?? 0.5}
            />
          )}
          
          {/* Contact Shadows for soft shadow on background - Nike By You style */}
          {lightingConfig.showShadows && (
            <ContactShadows
              position={[0, -1.0, 0]} // Lowered well below product to prevent intersection
              opacity={environmentConfig.shadowOpacity}
              scale={10}
              blur={2} // Soft blur for diffused shadow edges
              far={10}
              resolution={1024}
              color={lightingConfig.shadowColor}
            />
          )}
          
          {/* 3D Model */}
          <GLTFModel modelPath={modelPath} />
          
          {/* Camera Controls */}
          <OrbitControls
            minPolarAngle={Math.PI / 12}      // ~15 degrees from top
            maxPolarAngle={Math.PI * 9 / 13}  // ~124.6 degrees from top
            enableZoom={true}
            maxZoom={1}
            enablePan={false}
            target={[0, 0, 0]}
          />
        </Suspense>
      </Canvas>

      {/* UI Overlays */}
      {isLoading && <LoadingScreen />}
      <Toolbar />
      <LightingPanel />
      <EnvironmentPanel />
      <CustomizationPanel />
      <MeshInfoPanel />
      <MeshDropdown />
      <AIChat />
      <CaptureControls />
    </div>
  );
}

export default CustomizePage;
