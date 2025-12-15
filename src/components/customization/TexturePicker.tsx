import { useState, useEffect } from 'react';
import { Image, Loader2, X } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { discoverTextures, TextureSet } from '../../utils/textureDiscovery';

interface TexturePickerProps {
  meshId: string;
}

function TexturePicker({ meshId }: TexturePickerProps) {
  const { updateMeshCustomization, meshCustomizations } = useAppStore();
  const [textures, setTextures] = useState<TextureSet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTextureId, setSelectedTextureId] = useState<string | null>(null);
  const [previewErrors, setPreviewErrors] = useState<Set<string>>(new Set());

  // Check if mesh has texture applied
  useEffect(() => {
    const customization = meshCustomizations[meshId];
    if (customization?.texture) {
      // Find which texture is applied
      const appliedTexture = textures.find(t => t.diffuse === customization.texture);
      setSelectedTextureId(appliedTexture?.id || null);
    } else {
      setSelectedTextureId(null);
    }
  }, [meshId, meshCustomizations, textures]);

  useEffect(() => {
    const loadTextures = async () => {
      setIsLoading(true);
      try {
        const textureList = await discoverTextures();
        setTextures(textureList);
      } catch (error) {
        console.error('Error loading textures:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTextures();
  }, []);

  const handleSelectTexture = (textureSet: TextureSet) => {
    setSelectedTextureId(textureSet.id);
    
    // Get current customization to preserve color
    const currentCustomization = useAppStore.getState().meshCustomizations[meshId] || {};
    
    // Apply ALL texture maps from the texture set for realistic rendering
    // Preserve color so it can tint the texture
    // When texture is applied, clear color to show original texture colors
    // User can then add color to tint the texture if desired
    updateMeshCustomization(meshId, {
      ...currentCustomization,
      texture: textureSet.diffuse,
      normalMap: textureSet.normal,
      roughnessMap: textureSet.roughness,
      metalnessMap: textureSet.metalness,
      color: undefined, // Clear color when texture is applied to show original texture colors
      aoMap: textureSet.ao,              // Ambient occlusion for realistic shadows
      displacementMap: textureSet.height, // Height/displacement for surface detail
    });

    console.log('Applied texture set with all maps:', {
      meshId,
      textureSet: textureSet.name,
      diffuse: textureSet.diffuse,
      normal: textureSet.normal,
      roughness: textureSet.roughness,
      metalness: textureSet.metalness,
      ao: textureSet.ao,
      height: textureSet.height,
    });
  };

  const handleRemoveTexture = () => {
    setSelectedTextureId(null);
    
    // Get current customization to preserve color
    const currentCustomization = useAppStore.getState().meshCustomizations[meshId] || {};
    
    // Remove all texture maps but keep color
    updateMeshCustomization(meshId, {
      ...currentCustomization,
      texture: undefined,
      normalMap: undefined,
      roughnessMap: undefined,
      metalnessMap: undefined,
      aoMap: undefined,
      displacementMap: undefined,
      textureScale: 1.0, // Default scale to 1.0
      textureTint: undefined,
      textureInvert: undefined,
    });

    console.log('Removed texture from mesh:', meshId);
  };

  const handleImageError = (textureId: string) => {
    setPreviewErrors((prev) => new Set(prev).add(textureId));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 size={24} className="animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading textures...</span>
      </div>
    );
  }

  if (textures.length === 0) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          No textures available. Please check that textures.json exists.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Image size={20} className="text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">Select Texture</h3>
        </div>
        {selectedTextureId && (
          <button
            onClick={handleRemoveTexture}
            className="px-3 py-1.5 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
          >
            Remove Texture
          </button>
        )}
      </div>

      {/* Blank/No Texture Option */}
      <div
        onClick={handleRemoveTexture}
        className={`
          relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all mb-3
          ${!selectedTextureId 
            ? 'border-blue-600 ring-2 ring-blue-300' 
            : 'border-gray-200 hover:border-gray-300'
          }
        `}
      >
        <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
          <div className="text-center">
            <Image size={32} className="text-gray-400 mx-auto mb-2" />
            <p className="text-xs font-medium text-gray-600">No Texture</p>
            <p className="text-xs text-gray-400">Solid Color Only</p>
          </div>
        </div>
        <div className="p-2 bg-white">
          <p className="text-xs font-medium text-gray-800">Remove Texture</p>
        </div>
        {!selectedTextureId && (
          <div className="absolute top-2 right-2 bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
            ✓
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
        {textures.map((textureSet) => {
          const hasError = previewErrors.has(textureSet.id);
          const isSelected = selectedTextureId === textureSet.id;

          return (
            <div
              key={textureSet.id}
              onClick={() => handleSelectTexture(textureSet)}
              className={`
                relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all
                ${isSelected 
                  ? 'border-blue-600 ring-2 ring-blue-300' 
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
            >
              {/* Preview Image */}
              <div className="aspect-square bg-gray-100 flex items-center justify-center">
                {hasError ? (
                  <div className="text-center p-4">
                    <Image size={32} className="text-gray-400 mx-auto mb-2" />
                    <p className="text-xs text-gray-500">{textureSet.name}</p>
                  </div>
                ) : (
                  <img
                    src={textureSet.diffuse}
                    alt={textureSet.name}
                    className="w-full h-full object-cover"
                    onError={() => handleImageError(textureSet.id)}
                  />
                )}
              </div>

              {/* Texture Info */}
              <div className="p-2 bg-white">
                <p className="text-xs font-medium text-gray-800 truncate">
                  {textureSet.name}
                </p>
                <div className="flex gap-1 mt-1">
                  {textureSet.normal && (
                    <span className="text-xs text-gray-500" title="Normal Map">N</span>
                  )}
                  {textureSet.roughness && (
                    <span className="text-xs text-gray-500" title="Roughness Map">R</span>
                  )}
                  {textureSet.metalness && (
                    <span className="text-xs text-gray-500" title="Metalness Map">M</span>
                  )}
                  {textureSet.ao && (
                    <span className="text-xs text-gray-500" title="Ambient Occlusion">AO</span>
                  )}
                  {textureSet.height && (
                    <span className="text-xs text-gray-500" title="Height/Displacement Map">H</span>
                  )}
                </div>
              </div>

              {/* Selected Indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2 bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                  ✓
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedTextureId && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">Applied:</span>{' '}
            {textures.find(t => t.id === selectedTextureId)?.name}
          </p>
        </div>
      )}
    </div>
  );
}

export default TexturePicker;

