import { useState } from 'react';
import { Palette, RotateCw, Layers, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';

function EnvironmentPanel() {
  const { environmentConfig, updateEnvironmentConfig } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);

  const handleChange = (key: string, value: number | string | boolean) => {
    updateEnvironmentConfig({ [key]: value });
  };

  const presets = {
    custom: {
      // Custom preset - Final production settings
      backgroundColor: '#ffffff',
      productTiltX: 0,
      productTiltY: 0,
      productTiltZ: 0,
      productHeight: 0.5, // Product above stage - stage below product
      stageOpacity: 0.3,
      stageColor: '#ffffff',
      shadowOpacity: 0.7,
      environmentPreset: undefined,
      environmentIntensity: 0.0, // NO SHINE
      cameraDistance: 4,
      showLightHelpers: false,
    },
    default: {
      backgroundColor: '#ffffff',
      productTiltX: 0,
      productTiltY: 0,
      productTiltZ: 0,
      productHeight: 0.5, // Product above stage - stage below product
      stageOpacity: 0.3,
      stageColor: '#ffffff',
      shadowOpacity: 0.7,
      environmentPreset: undefined,
      environmentIntensity: 0.0, // NO SHINE
      cameraDistance: 4,
      showLightHelpers: false,
    },
    nike: {
      backgroundColor: '#ffffff',
      productTiltX: -8,
      productTiltY: 12,
      productTiltZ: 0,
      productHeight: 0.5, // Product above stage - stage below product
      stageOpacity: 0.4,
      stageColor: '#ffffff',
      shadowOpacity: 0.4, // Soft, subtle shadow like Nike product photos
      environmentPreset: 'studio',
      environmentIntensity: 0.0, // NO SHINE
      cameraDistance: 4,
      showLightHelpers: false,
    },
    tilted: {
      backgroundColor: '#ffffff',
      productTiltX: -12,
      productTiltY: 18,
      productTiltZ: 0,
      productHeight: 0.5, // Product above stage - stage below product
      stageOpacity: 0.3,
      stageColor: '#ffffff',
      shadowOpacity: 0.7,
      environmentPreset: 'studio',
      environmentIntensity: 0.0, // NO SHINE
      cameraDistance: 4,
      showLightHelpers: false,
    },
    dramatic: {
      backgroundColor: '#ffffff',
      productTiltX: -20,
      productTiltY: 25,
      productTiltZ: 5,
      productHeight: 0.5, // Product above stage - stage below product
      stageOpacity: 0.3,
      stageColor: '#ffffff',
      shadowOpacity: 0.7,
      environmentPreset: 'night',
      environmentIntensity: 0.0, // NO SHINE
      cameraDistance: 5,
      showLightHelpers: false,
    },
    flat: {
      backgroundColor: '#ffffff',
      productTiltX: 0,
      productTiltY: 0,
      productTiltZ: 0,
      productHeight: 0.5, // Product above stage - stage below product
      stageOpacity: 0.3,
      stageColor: '#ffffff',
      shadowOpacity: 0.7,
      environmentPreset: 'studio',
      environmentIntensity: 0.0, // NO SHINE
      cameraDistance: 4,
      showLightHelpers: false,
    },
  };

  return (
    <div className="absolute top-20 right-4 z-40">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-3 bg-gray-800/90 hover:bg-gray-700 text-white rounded-lg transition-colors backdrop-blur-sm shadow-lg flex items-center gap-2"
        title="Environment Settings"
      >
        <Layers size={20} />
        {isOpen ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-14 right-0 w-80 bg-white rounded-lg shadow-2xl p-6 space-y-4 max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Layers size={20} className="text-blue-500" />
                Environment Settings
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            {/* Environment Preset Selection */}
            <div className="space-y-2 border-b pb-4">
              <label className="text-sm font-medium text-gray-700">Environment Preset</label>
              <p className="text-xs text-gray-500 mb-2">
                Select an environment preset to control all lighting. All manual lights are disabled.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'studio', label: 'Studio', desc: 'Clean, professional' },
                  { value: 'sunset', label: 'Sunset', desc: 'Warm, golden' },
                  { value: 'dawn', label: 'Dawn', desc: 'Soft, morning' },
                  { value: 'night', label: 'Night', desc: 'Dark, moody' },
                  { value: 'warehouse', label: 'Warehouse', desc: 'Industrial' },
                  { value: 'forest', label: 'Forest', desc: 'Natural, green' },
                  { value: 'apartment', label: 'Apartment', desc: 'Indoor, cozy' },
                  { value: 'city', label: 'City', desc: 'Urban, bright' },
                  { value: 'park', label: 'Park', desc: 'Outdoor, sunny' },
                  { value: 'lobby', label: 'Lobby', desc: 'Elegant, bright' },
                ].map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => handleChange('environmentPreset', preset.value)}
                    className={`
                      px-3 py-2 text-xs rounded transition-colors text-left
                      ${environmentConfig.environmentPreset === preset.value
                        ? 'bg-blue-600 text-white font-medium'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }
                    `}
                    title={preset.desc}
                  >
                    <div className="font-medium">{preset.label}</div>
                    <div className="text-[10px] opacity-75">{preset.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Environment Intensity */}
            <div className="space-y-2 border-b pb-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Environment Intensity</label>
                <span className="text-sm text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded">
                  {(environmentConfig.environmentIntensity ?? 0.5).toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={environmentConfig.environmentIntensity ?? 0.5}
                onChange={(e) => handleChange('environmentIntensity', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>0 (Dark)</span>
                <span>0.5 (Default)</span>
                <span>1.0 (Bright)</span>
              </div>
              <p className="text-xs text-gray-500">
                Controls the brightness of the environment lighting. Higher = brighter scene.
              </p>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleChange('environmentIntensity', 0.0)}
                  className="flex-1 px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                >
                  Off
                </button>
                <button
                  onClick={() => handleChange('environmentIntensity', 0.3)}
                  className="flex-1 px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                >
                  Subtle
                </button>
                <button
                  onClick={() => handleChange('environmentIntensity', 0.5)}
                  className="flex-1 px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                >
                  Default
                </button>
                <button
                  onClick={() => handleChange('environmentIntensity', 1.0)}
                  className="flex-1 px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                >
                  Full
                </button>
              </div>
            </div>

            {/* Camera Distance */}
            <div className="space-y-2 border-b pb-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Camera Distance</label>
                <span className="text-sm text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded">
                  {(environmentConfig.cameraDistance ?? 4).toFixed(1)}
                </span>
              </div>
              <input
                type="range"
                min="2"
                max="10"
                step="0.1"
                value={environmentConfig.cameraDistance ?? 4}
                onChange={(e) => handleChange('cameraDistance', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>2 (Close)</span>
                <span>4 (Default)</span>
                <span>10 (Far)</span>
              </div>
              <p className="text-xs text-gray-500">
                Controls how far the camera is from the model. Higher = further away.
              </p>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleChange('cameraDistance', 3)}
                  className="flex-1 px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => handleChange('cameraDistance', 4)}
                  className="flex-1 px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                >
                  Default
                </button>
                <button
                  onClick={() => handleChange('cameraDistance', 6)}
                  className="flex-1 px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                >
                  Far
                </button>
              </div>
            </div>

            {/* Show Light Helpers */}
            <div className="space-y-2 border-b pb-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Show Light Helpers</label>
                <button
                  onClick={() => handleChange('showLightHelpers', !(environmentConfig.showLightHelpers ?? false))}
                  className={`
                    relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                    ${environmentConfig.showLightHelpers ? 'bg-blue-600' : 'bg-gray-300'}
                  `}
                >
                  <span
                    className={`
                      inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                      ${environmentConfig.showLightHelpers ? 'translate-x-6' : 'translate-x-1'}
                    `}
                  />
                </button>
              </div>
              <p className="text-xs text-gray-500">
                Visualize lights in the scene. Yellow = directional lights, Red = rim light (often causes shine).
                Helps identify which lights are causing reflections.
              </p>
            </div>

            {/* Show Coordinate System */}
            <div className="space-y-2 border-b pb-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Show Coordinate System</label>
                <button
                  onClick={() => handleChange('showCoordinateSystem', !(environmentConfig.showCoordinateSystem ?? false))}
                  className={`
                    relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                    ${environmentConfig.showCoordinateSystem ? 'bg-blue-600' : 'bg-gray-300'}
                  `}
                >
                  <span
                    className={`
                      inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                      ${environmentConfig.showCoordinateSystem ? 'translate-x-6' : 'translate-x-1'}
                    `}
                  />
                </button>
              </div>
              <p className="text-xs text-gray-500">
                Shows a grid plane (horizontal XZ plane) and axes helpers. 
                Red = X axis, Green = Y axis, Blue = Z axis. Helps visualize 3D space and positioning.
              </p>
            </div>

            {/* Presets */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Presets</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => updateEnvironmentConfig(presets.custom)}
                  className="px-3 py-2 text-xs bg-blue-100 hover:bg-blue-200 rounded transition-colors font-medium"
                >
                  ✨ Custom
                </button>
                <button
                  onClick={() => updateEnvironmentConfig(presets.nike)}
                  className="px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                >
                  Nike Style
                </button>
                <button
                  onClick={() => updateEnvironmentConfig(presets.default)}
                  className="px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                >
                  Default
                </button>
                <button
                  onClick={() => updateEnvironmentConfig(presets.tilted)}
                  className="px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                >
                  Tilted
                </button>
                <button
                  onClick={() => updateEnvironmentConfig(presets.dramatic)}
                  className="px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                >
                  Dramatic
                </button>
              </div>
            </div>

            {/* Background Color */}
            <div className="space-y-2 border-t pt-4">
              <div className="flex items-center gap-2 mb-2">
                <Palette size={16} className="text-blue-500" />
                <label className="text-sm font-medium text-gray-700">Background Color</label>
              </div>
              <div className="flex gap-3 items-center">
                <input
                  type="color"
                  value={environmentConfig.backgroundColor}
                  onChange={(e) => handleChange('backgroundColor', e.target.value)}
                  className="w-16 h-10 rounded border-2 border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={environmentConfig.backgroundColor}
                  onChange={(e) => handleChange('backgroundColor', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  placeholder="#ffffff"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleChange('backgroundColor', '#ffffff')}
                  className="flex-1 px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                >
                  White
                </button>
                <button
                  onClick={() => handleChange('backgroundColor', '#f5f5f5')}
                  className="flex-1 px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                >
                  Light Gray
                </button>
                <button
                  onClick={() => handleChange('backgroundColor', '#000000')}
                  className="flex-1 px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                >
                  Black
                </button>
              </div>
            </div>

            {/* Product Tilt - X Axis */}
            <div className="space-y-2 border-t pt-4">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <RotateCw size={16} />
                  Tilt X (Front/Back)
                </label>
                <span className="text-sm text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded">
                  {environmentConfig.productTiltX}°
                </span>
              </div>
              <input
                type="range"
                min="-45"
                max="45"
                step="1"
                value={environmentConfig.productTiltX}
                onChange={(e) => handleChange('productTiltX', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>-45° (Back)</span>
                <span>0° (Level)</span>
                <span>45° (Forward)</span>
              </div>
            </div>

            {/* Product Tilt - Y Axis */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <RotateCw size={16} />
                  Tilt Y (Left/Right)
                </label>
                <span className="text-sm text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded">
                  {environmentConfig.productTiltY}°
                </span>
              </div>
              <input
                type="range"
                min="-45"
                max="45"
                step="1"
                value={environmentConfig.productTiltY}
                onChange={(e) => handleChange('productTiltY', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>-45° (Left)</span>
                <span>0° (Center)</span>
                <span>45° (Right)</span>
              </div>
            </div>

            {/* Product Tilt - Z Axis */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <RotateCw size={16} />
                  Tilt Z (Roll)
                </label>
                <span className="text-sm text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded">
                  {environmentConfig.productTiltZ}°
                </span>
              </div>
              <input
                type="range"
                min="-45"
                max="45"
                step="1"
                value={environmentConfig.productTiltZ}
                onChange={(e) => handleChange('productTiltZ', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>-45°</span>
                <span>0°</span>
                <span>45°</span>
              </div>
            </div>

            {/* Product Height */}
            <div className="space-y-2 border-t pt-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Product Height</label>
                <span className="text-sm text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded">
                  {environmentConfig.productHeight.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={environmentConfig.productHeight}
                onChange={(e) => handleChange('productHeight', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>0 (On Stage)</span>
                <span>0.5 (Default)</span>
                <span>2 (High)</span>
              </div>
            </div>

            {/* Quick Reset Buttons */}
            <div className="flex gap-2 pt-4 border-t">
              <button
                onClick={() => handleChange('productTiltX', 0)}
                className="flex-1 px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              >
                Reset X
              </button>
              <button
                onClick={() => handleChange('productTiltY', 0)}
                className="flex-1 px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              >
                Reset Y
              </button>
              <button
                onClick={() => handleChange('productTiltZ', 0)}
                className="flex-1 px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              >
                Reset Z
              </button>
            </div>

            {/* Stage Opacity */}
            <div className="space-y-2 border-t pt-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Stage Opacity</label>
                <span className="text-sm text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded">
                  {environmentConfig.stageOpacity.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={environmentConfig.stageOpacity}
                onChange={(e) => handleChange('stageOpacity', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>0 (Invisible)</span>
                <span>0.3 (Default)</span>
                <span>1 (Opaque)</span>
              </div>
              <p className="text-xs text-gray-500">
                Controls how visible the stage is. Lower = more transparent, shadows still visible.
              </p>
            </div>

            {/* Stage Color */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Stage Color</label>
              </div>
              <div className="flex gap-3 items-center">
                <input
                  type="color"
                  value={environmentConfig.stageColor}
                  onChange={(e) => handleChange('stageColor', e.target.value)}
                  className="w-16 h-10 rounded border-2 border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={environmentConfig.stageColor}
                  onChange={(e) => handleChange('stageColor', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  placeholder="#ffffff"
                />
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleChange('stageColor', '#ffffff')}
                  className="flex-1 px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                >
                  White
                </button>
                <button
                  onClick={() => handleChange('stageColor', '#f5f5f5')}
                  className="flex-1 px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                >
                  Light Gray
                </button>
                <button
                  onClick={() => handleChange('stageColor', '#e0e0e0')}
                  className="flex-1 px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                >
                  Gray
                </button>
              </div>
            </div>

            {/* Shadow Opacity */}
            <div className="space-y-2 border-t pt-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Shadow Opacity</label>
                <span className="text-sm text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded">
                  {environmentConfig.shadowOpacity.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={environmentConfig.shadowOpacity}
                onChange={(e) => handleChange('shadowOpacity', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>0 (No Shadow)</span>
                <span>0.7 (Default)</span>
                <span>1 (Dark)</span>
              </div>
              <p className="text-xs text-gray-500">
                Controls how dark/visible the shadow appears on the stage. Higher values = more visible on white stage.
              </p>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleChange('shadowOpacity', 0.4)}
                  className="flex-1 px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                >
                  Light
                </button>
                <button
                  onClick={() => handleChange('shadowOpacity', 0.7)}
                  className="flex-1 px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                >
                  Medium
                </button>
                <button
                  onClick={() => handleChange('shadowOpacity', 0.9)}
                  className="flex-1 px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                >
                  Dark
                </button>
              </div>
            </div>

            {/* Reset All */}
            <div className="pt-4 border-t">
              <button
                onClick={() => updateEnvironmentConfig(presets.default)}
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

export default EnvironmentPanel;

