import { useState } from 'react';
import { Sun, Moon, Lightbulb, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';

function LightingPanel() {
  const { lightingConfig, updateLightingConfig } = useAppStore();
  const environmentConfig = useAppStore((state) => state.environmentConfig);
  const [isOpen, setIsOpen] = useState(false);

  const handleChange = (key: string, value: number | boolean | string) => {
    updateLightingConfig({ [key]: value });
  };

  const presets = {
    default: {
      // Nike By You Style - Soft, diffused, realistic lighting
      // Increased ambient/fill lighting to make dark colors visible
      directionalLight1Intensity: 0.35,
      directionalLight2Intensity: 0.7,
      directionalLight3Intensity: 0.3,
      spotLightIntensity: 0.4,
      hemisphereLightIntensity: 1.5,
      shadowIntensity: 0.4,
      showShadows: true,
      shadowBlur: 2,
      shadowMapSize: 1024,
      shadowBias: -0.0001,
      shadowRadius: 1,
      shadowCameraLeft: -15,
      shadowCameraRight: 15,
      shadowCameraTop: 15,
      shadowCameraBottom: -15,
      shadowCameraNear: 0.1,
      shadowCameraFar: 50,
      shadowColor: '#888888',
      environmentIntensity: 0.0,
    },
      bright: {
        directionalLight1Intensity: 0.6,
        directionalLight2Intensity: 1.0,
        directionalLight3Intensity: 0.5,
        spotLightIntensity: 1.2,
        hemisphereLightIntensity: 1.0,
      shadowIntensity: 0.8,
      showShadows: true,
      shadowBlur: 12,
      shadowMapSize: 1024,
      shadowBias: -0.0001,
      shadowRadius: 10,
      shadowCameraLeft: -15,
      shadowCameraRight: 15,
      shadowCameraTop: 15,
      shadowCameraBottom: -15,
      shadowCameraNear: 0.1,
      shadowCameraFar: 50,
      shadowColor: '#4a4a4a',
      environmentIntensity: 0.0,
    },
      soft: {
        directionalLight1Intensity: 0.3,
        directionalLight2Intensity: 0.6,
        directionalLight3Intensity: 0.25,
        spotLightIntensity: 0.7,
        hemisphereLightIntensity: 0.6,
      shadowIntensity: 0.5,
      showShadows: true,
      shadowBlur: 18,
      shadowMapSize: 1024,
      shadowBias: -0.0001,
      shadowRadius: 15,
      shadowCameraLeft: -15,
      shadowCameraRight: 15,
      shadowCameraTop: 15,
      shadowCameraBottom: -15,
      shadowCameraNear: 0.1,
      shadowCameraFar: 50,
      shadowColor: '#666666',
      environmentIntensity: 0.0,
    },
  };

  return (
    <div className="absolute top-4 right-4 z-40" style={{ top: '16px' }}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-3 bg-gray-800/90 hover:bg-gray-700 text-white rounded-lg transition-colors backdrop-blur-sm shadow-lg flex items-center gap-2"
        title="Lighting Settings"
      >
        <Sun size={20} />
        {isOpen ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-14 right-0 w-80 bg-white rounded-lg shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Lightbulb size={20} className="text-yellow-500" />
                Lighting Settings
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            {/* All Lights Overview - Milanese Setup */}
            <div className="space-y-2 border-b pb-4 mb-4">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Lightbulb size={16} className="text-yellow-500" />
                Active Lights Overview
              </label>
              <div className="space-y-2 text-xs">
                {/* Directional Light 1 (Top Right) */}
                <div className={`flex items-center justify-between p-2 rounded ${lightingConfig.directionalLight1Intensity > 0 ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50 border border-gray-200'}`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${lightingConfig.directionalLight1Intensity > 0 ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                    <span className="font-medium">Directional Light 1 (Top Right)</span>
                    <span className="text-gray-500">(10, 10, 10)</span>
                  </div>
                  <span className="font-mono text-gray-600">
                    {lightingConfig.directionalLight1Intensity.toFixed(2)}
                    {lightingConfig.showShadows && <span className="ml-2 text-green-600">● Shadows</span>}
                  </span>
                </div>

                {/* Directional Light 2 (Bottom Fill) */}
                <div className={`flex items-center justify-between p-2 rounded ${lightingConfig.directionalLight2Intensity > 0 ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${lightingConfig.directionalLight2Intensity > 0 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className="font-medium">Directional Light 2 (Bottom Fill)</span>
                    <span className="text-gray-500">(0, -2, 0)</span>
                  </div>
                  <span className="font-mono text-gray-600">
                    {lightingConfig.directionalLight2Intensity.toFixed(2)}
                  </span>
                </div>

                {/* Directional Light 3 (Top Left) */}
                <div className={`flex items-center justify-between p-2 rounded ${lightingConfig.directionalLight3Intensity > 0 ? 'bg-orange-50 border border-orange-200' : 'bg-gray-50 border border-gray-200'}`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${lightingConfig.directionalLight3Intensity > 0 ? 'bg-orange-500' : 'bg-gray-300'}`}></div>
                    <span className="font-medium">Directional Light 3 (Top Left)</span>
                    <span className="text-gray-500">(-10, 10, 10)</span>
                  </div>
                  <span className="font-mono text-gray-600">
                    {lightingConfig.directionalLight3Intensity.toFixed(2)}
                  </span>
                </div>

                {/* Spot Light (Top Down) */}
                <div className={`flex items-center justify-between p-2 rounded ${lightingConfig.spotLightIntensity > 0 ? 'bg-purple-50 border border-purple-200' : 'bg-gray-50 border border-gray-200'}`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${lightingConfig.spotLightIntensity > 0 ? 'bg-purple-500' : 'bg-gray-300'}`}></div>
                    <span className="font-medium">Spot Light (Top Down)</span>
                    <span className="text-gray-500">(0, 1000, 0)</span>
                  </div>
                  <span className="font-mono text-gray-600">
                    {lightingConfig.spotLightIntensity.toFixed(2)}
                    {lightingConfig.showShadows && <span className="ml-2 text-green-600">● Shadows</span>}
                  </span>
                </div>

                {/* Hemisphere Light (Ambient) */}
                <div className={`flex items-center justify-between p-2 rounded ${lightingConfig.hemisphereLightIntensity > 0 ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50 border border-gray-200'}`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${lightingConfig.hemisphereLightIntensity > 0 ? 'bg-yellow-500' : 'bg-gray-300'}`}></div>
                    <span className="font-medium">Hemisphere Light (Ambient)</span>
                    <span className="text-gray-500 text-[10px]">(sky/ground)</span>
                  </div>
                  <span className="font-mono text-gray-600">
                    {lightingConfig.hemisphereLightIntensity.toFixed(2)}
                  </span>
                </div>

                {/* Environment */}
                {(environmentConfig.environmentIntensity ?? 0) > 0 && (
                  <div className={`flex items-center justify-between p-2 rounded bg-indigo-50 border border-indigo-200`}>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                      <span className="font-medium">Environment ({environmentConfig.environmentPreset || 'none'})</span>
                      <span className="text-gray-500 text-[10px]">(can cause shine)</span>
                    </div>
                    <span className="font-mono text-gray-600">
                      {(environmentConfig.environmentIntensity ?? 0).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                💡 Shows only the 5 lights currently in use (Milanese setup)
              </p>
            </div>

            {/* Presets */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Presets</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => updateLightingConfig(presets.default)}
                  className="px-3 py-2 text-xs bg-blue-100 hover:bg-blue-200 rounded transition-colors font-medium"
                >
                  ✨ Default
                </button>
                <button
                  onClick={() => updateLightingConfig(presets.bright)}
                  className="px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                >
                  Bright
                </button>
                <button
                  onClick={() => updateLightingConfig(presets.soft)}
                  className="px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                >
                  Soft
                </button>
              </div>
            </div>

            {/* Shadows Toggle */}
            <div className="flex items-center justify-between py-2 border-t">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Moon size={16} />
                Shadows
              </label>
              <button
                onClick={() => handleChange('showShadows', !lightingConfig.showShadows)}
                className={`
                  relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                  ${lightingConfig.showShadows ? 'bg-blue-600' : 'bg-gray-300'}
                `}
              >
                <span
                  className={`
                    inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                    ${lightingConfig.showShadows ? 'translate-x-6' : 'translate-x-1'}
                  `}
                />
              </button>
            </div>

            {/* Milanese Lighting Controls - Only the 4 lights in use */}
            
            {/* Directional Light 1 (Top Right) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Directional Light 1 (Top Right)</label>
                <span className="text-sm text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded">
                  {lightingConfig.directionalLight1Intensity.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={lightingConfig.directionalLight1Intensity}
                onChange={(e) => handleChange('directionalLight1Intensity', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <p className="text-xs text-gray-500">Position: (10, 10, 10) - Casts shadows</p>
            </div>

            {/* Directional Light 2 (Bottom Fill) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Directional Light 2 (Bottom Fill)</label>
                <span className="text-sm text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded">
                  {lightingConfig.directionalLight2Intensity.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={lightingConfig.directionalLight2Intensity}
                onChange={(e) => handleChange('directionalLight2Intensity', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <p className="text-xs text-gray-500">Position: (0, -2, 0) - Fill light from bottom</p>
            </div>

            {/* Directional Light 3 (Top Left) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Directional Light 3 (Top Left)</label>
                <span className="text-sm text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded">
                  {lightingConfig.directionalLight3Intensity.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={lightingConfig.directionalLight3Intensity}
                onChange={(e) => handleChange('directionalLight3Intensity', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <p className="text-xs text-gray-500">Position: (-10, 10, 10) - Fill light from top-left</p>
            </div>

            {/* Spot Light (Top Down) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Spot Light (Top Down)</label>
                <span className="text-sm text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded">
                  {lightingConfig.spotLightIntensity.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={lightingConfig.spotLightIntensity}
                onChange={(e) => handleChange('spotLightIntensity', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <p className="text-xs text-gray-500">Position: (0, 1000, 0) - Casts shadows</p>
            </div>

            {/* Hemisphere Light (Ambient) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Hemisphere Light (Ambient)</label>
                <span className="text-sm text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded">
                  {lightingConfig.hemisphereLightIntensity.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={lightingConfig.hemisphereLightIntensity}
                onChange={(e) => handleChange('hemisphereLightIntensity', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <p className="text-xs text-gray-500">Sky/ground ambient lighting</p>
            </div>

            {/* Shadow Controls */}
            {lightingConfig.showShadows && (
              <>
                {/* Shadow Intensity */}
                <div className="space-y-2 border-t pt-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Shadow Intensity</label>
                    <span className="text-sm text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded">
                      {lightingConfig.shadowIntensity.toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={lightingConfig.shadowIntensity}
                    onChange={(e) => handleChange('shadowIntensity', parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>

                {/* Shadow Blur */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Shadow Blur</label>
                    <span className="text-sm text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded">
                      {lightingConfig.shadowBlur}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    step="1"
                    value={lightingConfig.shadowBlur}
                    onChange={(e) => handleChange('shadowBlur', parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>

                {/* Shadow Color */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Shadow Color</label>
                  </div>
                  <div className="flex gap-3 items-center">
                    <input
                      type="color"
                      value={lightingConfig.shadowColor}
                      onChange={(e) => handleChange('shadowColor', e.target.value)}
                      className="w-16 h-10 rounded border-2 border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={lightingConfig.shadowColor}
                      onChange={(e) => handleChange('shadowColor', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                      placeholder="#000000"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Reset Button */}
            <div className="pt-4 border-t">
              <button
                onClick={() => updateLightingConfig(presets.default)}
                className="w-full px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Reset to Default
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default LightingPanel;
