import { useState, useEffect } from 'react';
import { Settings, RotateCw, Palette, FlipHorizontal, Layers, Mountain } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

interface TextureConfigProps {
  meshId: string;
}

function TextureConfig({ meshId }: TextureConfigProps) {
  const { meshCustomizations, updateMeshCustomization } = useAppStore();
  const customization = meshCustomizations[meshId] || {};
  
  const [scale, setScale] = useState(customization.textureScale ?? 1.0);
  const [tint, setTint] = useState(customization.textureTint ?? '#ffffff');
  const [invert, setInvert] = useState(customization.textureInvert ?? false);
  const [normalIntensity, setNormalIntensity] = useState(customization.normalIntensity ?? 1.0);
  const [displacementIntensity, setDisplacementIntensity] = useState(customization.displacementIntensity ?? 0.0);
  const [roughness, setRoughness] = useState(customization.roughness ?? 0.7); // Default 0.7 for leather (matte)
  const [metalness, setMetalness] = useState(customization.metalness ?? 0.0); // Default 0.0 for leather (non-metallic)

  // Update local state when customization changes
  useEffect(() => {
    if (customization.textureScale !== undefined) {
      setScale(customization.textureScale);
    }
    if (customization.textureTint !== undefined) {
      setTint(customization.textureTint);
    }
    if (customization.textureInvert !== undefined) {
      setInvert(customization.textureInvert);
    }
    if (customization.normalIntensity !== undefined) {
      setNormalIntensity(customization.normalIntensity);
    }
    if (customization.displacementIntensity !== undefined) {
      setDisplacementIntensity(customization.displacementIntensity);
    }
    if (customization.roughness !== undefined) {
      setRoughness(customization.roughness);
    }
    if (customization.metalness !== undefined) {
      setMetalness(customization.metalness);
    }
  }, [customization]);

  const handleScaleChange = (newScale: number) => {
    setScale(newScale);
    updateMeshCustomization(meshId, {
      ...customization,
      textureScale: newScale,
    });
  };

  const handleTintChange = (newTint: string) => {
    setTint(newTint);
    updateMeshCustomization(meshId, {
      ...customization,
      textureTint: newTint,
    });
  };

  const handleInvertToggle = () => {
    const newInvert = !invert;
    setInvert(newInvert);
    // Preserve all existing customizations including color
    updateMeshCustomization(meshId, {
      ...customization,
      textureInvert: newInvert,
    });
    console.log('Texture invert toggled:', newInvert);
  };

  const handleNormalIntensityChange = (newIntensity: number) => {
    setNormalIntensity(newIntensity);
    updateMeshCustomization(meshId, {
      ...customization,
      normalIntensity: newIntensity,
    });
  };

  const handleDisplacementIntensityChange = (newIntensity: number) => {
    setDisplacementIntensity(newIntensity);
    updateMeshCustomization(meshId, {
      ...customization,
      displacementIntensity: newIntensity,
    });
  };

  const handleRoughnessChange = (newRoughness: number) => {
    setRoughness(newRoughness);
    updateMeshCustomization(meshId, {
      ...customization,
      roughness: newRoughness,
    });
  };

  const handleMetalnessChange = (newMetalness: number) => {
    setMetalness(newMetalness);
    updateMeshCustomization(meshId, {
      ...customization,
      metalness: newMetalness,
    });
  };

  // Show invert option even if no texture (for future use)
  // But show message if no texture
  const hasTexture = !!customization.texture;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Settings size={18} className="text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-800">Texture Settings</h3>
      </div>

      {/* Texture Scale */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <RotateCw size={16} />
            Texture Scale
          </label>
          <span className="text-sm text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded">
            {scale.toFixed(2)}x
          </span>
        </div>
        <input
          type="range"
          min="0.1"
          max="5.0"
          step="0.1"
          value={scale}
          onChange={(e) => handleScaleChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>0.1x (Large)</span>
          <span>1.0x (Normal)</span>
          <span>5.0x (Small)</span>
        </div>
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => handleScaleChange(0.5)}
            className="flex-1 px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
          >
            2x
          </button>
          <button
            onClick={() => handleScaleChange(1.0)}
            className="flex-1 px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
          >
            Reset
          </button>
          <button
            onClick={() => handleScaleChange(2.0)}
            className="flex-1 px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
          >
            0.5x
          </button>
        </div>
      </div>

      {/* Color Tint */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Palette size={16} />
            Color Tint
          </label>
        </div>
        <div className="flex gap-3 items-center">
          <input
            type="color"
            value={tint}
            onChange={(e) => handleTintChange(e.target.value)}
            className="w-16 h-10 rounded border-2 border-gray-300 cursor-pointer"
          />
          <input
            type="text"
            value={tint}
            onChange={(e) => handleTintChange(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            placeholder="#ffffff"
          />
        </div>
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => handleTintChange('#ffffff')}
            className="flex-1 px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
          >
            White
          </button>
          <button
            onClick={() => handleTintChange('#ff0000')}
            className="flex-1 px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
          >
            Red
          </button>
          <button
            onClick={() => handleTintChange('#0000ff')}
            className="flex-1 px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
          >
            Blue
          </button>
          <button
            onClick={() => handleTintChange('#ffff00')}
            className="flex-1 px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
          >
            Yellow
          </button>
        </div>
        <p className="text-xs text-gray-500">
          Adjusts the color overlay on the texture. White = no tint.
        </p>
      </div>

      {/* Invert Texture - Show even if no texture for future use */}
      {hasTexture && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <FlipHorizontal size={16} />
              Invert Texture Colors
            </label>
            <button
              onClick={handleInvertToggle}
              className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                ${invert ? 'bg-blue-600' : 'bg-gray-300'}
              `}
            >
              <span
                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                  ${invert ? 'translate-x-6' : 'translate-x-1'}
                `}
              />
            </button>
          </div>
          <p className="text-xs text-gray-500">
            Inverts the texture colors (RGB inversion) for a different look. Useful if texture appears inverted.
          </p>
        </div>
      )}
      
           {/* Normal Map Intensity */}
           {hasTexture && (
             <div className="space-y-2 border-t pt-4">
               <div className="flex items-center justify-between">
                 <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                   <Layers size={16} />
                   Normal Map Intensity
                 </label>
                 <span className="text-sm text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded">
                   {normalIntensity.toFixed(2)}
                 </span>
               </div>
               <input
                 type="range"
                 min="0"
                 max="2"
                 step="0.1"
                 value={normalIntensity}
                 onChange={(e) => handleNormalIntensityChange(parseFloat(e.target.value))}
                 className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
               />
               <div className="flex justify-between text-xs text-gray-500">
                 <span>0 (Flat)</span>
                 <span>1.0 (Normal)</span>
                 <span>2.0 (Strong)</span>
               </div>
               <p className="text-xs text-gray-500">
                 Controls the strength of surface detail from the normal map. Lower values = smoother surface.
               </p>
             </div>
           )}

           {/* Displacement/Height Map Intensity */}
           {hasTexture && (
             <div className="space-y-2 border-t pt-4">
               <div className="flex items-center justify-between">
                 <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                   <Mountain size={16} />
                   Displacement Intensity
                 </label>
                 <span className="text-sm text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded">
                   {displacementIntensity.toFixed(3)}
                 </span>
               </div>
               <input
                 type="range"
                 min="0"
                 max="0.2"
                 step="0.01"
                 value={displacementIntensity}
                 onChange={(e) => handleDisplacementIntensityChange(parseFloat(e.target.value))}
                 className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
               />
               <div className="flex justify-between text-xs text-gray-500">
                 <span>0 (No Height)</span>
                 <span>0.05 (Subtle)</span>
                 <span>0.2 (Strong)</span>
               </div>
               <p className="text-xs text-gray-500">
                 Controls the height/bumpiness of the surface. Lower values = flatter, more realistic. If texture looks too bulging, reduce this.
               </p>
               <div className="flex gap-2 mt-2">
                 <button
                   onClick={() => handleDisplacementIntensityChange(0)}
                   className="flex-1 px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                 >
                   Disable
                 </button>
                 <button
                   onClick={() => handleDisplacementIntensityChange(0.02)}
                   className="flex-1 px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                 >
                   Very Subtle
                 </button>
                 <button
                   onClick={() => handleDisplacementIntensityChange(0.05)}
                   className="flex-1 px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                 >
                   Default
                 </button>
               </div>
             </div>
           )}

           {/* Roughness Control */}
           {hasTexture && (
             <div className="space-y-2 border-t pt-4">
               <div className="flex items-center justify-between">
                 <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                   <Layers size={16} />
                   Roughness
                 </label>
                 <span className="text-sm text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded">
                   {roughness.toFixed(2)}
                 </span>
               </div>
               <input
                 type="range"
                 min="0"
                 max="1"
                 step="0.01"
                 value={roughness}
                 onChange={(e) => handleRoughnessChange(parseFloat(e.target.value))}
                 className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
               />
               <div className="flex justify-between text-xs text-gray-500">
                 <span>0 (Glossy)</span>
                 <span>0.5 (Semi-Matte)</span>
                 <span>1.0 (Matte)</span>
               </div>
               <p className="text-xs text-gray-500">
                 Controls surface shininess. Higher = more matte (better for leather). Lower = more glossy/shiny.
               </p>
               <div className="flex gap-2 mt-2">
                 <button
                   onClick={() => handleRoughnessChange(0.3)}
                   className="flex-1 px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                 >
                   Glossy
                 </button>
                 <button
                   onClick={() => handleRoughnessChange(0.7)}
                   className="flex-1 px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                 >
                   Leather (Default)
                 </button>
                 <button
                   onClick={() => handleRoughnessChange(1.0)}
                   className="flex-1 px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                 >
                   Matte
                 </button>
               </div>
             </div>
           )}

           {/* Metalness Control */}
           {hasTexture && (
             <div className="space-y-2 border-t pt-4">
               <div className="flex items-center justify-between">
                 <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                   <Layers size={16} />
                   Metalness
                 </label>
                 <span className="text-sm text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded">
                   {metalness.toFixed(2)}
                 </span>
               </div>
               <input
                 type="range"
                 min="0"
                 max="1"
                 step="0.01"
                 value={metalness}
                 onChange={(e) => handleMetalnessChange(parseFloat(e.target.value))}
                 className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
               />
               <div className="flex justify-between text-xs text-gray-500">
                 <span>0 (Non-Metallic)</span>
                 <span>0.5 (Semi-Metallic)</span>
                 <span>1.0 (Metallic)</span>
               </div>
               <p className="text-xs text-gray-500">
                 Controls metallic appearance. Leather should be 0 (non-metallic). Higher values make it look like metal.
               </p>
               <div className="flex gap-2 mt-2">
                 <button
                   onClick={() => handleMetalnessChange(0.0)}
                   className="flex-1 px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                 >
                   Leather (Default)
                 </button>
                 <button
                   onClick={() => handleMetalnessChange(0.3)}
                   className="flex-1 px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                 >
                   Slight Shine
                 </button>
                 <button
                   onClick={() => handleMetalnessChange(0.8)}
                   className="flex-1 px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                 >
                   Metallic
                 </button>
               </div>
             </div>
           )}

           {!hasTexture && (
             <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
               <p className="text-sm text-gray-500 text-center">
                 Apply a texture first to configure scale, tint, and invert options
               </p>
             </div>
           )}

           {/* Reset All */}
      <div className="pt-4 border-t">
            <button
              onClick={() => {
                handleScaleChange(1.0);
                handleTintChange('#ffffff');
                setInvert(false);
                handleNormalIntensityChange(1.0);
                handleDisplacementIntensityChange(0.0);
                handleRoughnessChange(0.7);
                handleMetalnessChange(0.0);
                updateMeshCustomization(meshId, {
                  ...customization,
                  textureScale: 1.0,
                  textureTint: '#ffffff',
                  textureInvert: false,
                  normalIntensity: 1.0,
                  displacementIntensity: 0.0,
                  roughness: 0.7,
                  metalness: 0.0,
                });
              }}
              className="w-full px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Reset All Settings
            </button>
      </div>
    </div>
  );
}

export default TextureConfig;

