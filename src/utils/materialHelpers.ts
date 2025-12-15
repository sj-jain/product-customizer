import * as THREE from 'three';
import { MeshCustomization } from '../types';

// Store original materials to avoid modifying shared materials
const originalMaterials = new WeakMap<THREE.Mesh, THREE.Material | THREE.Material[]>();

// Store loaded textures to avoid reloading
const textureCache = new Map<string, THREE.Texture>();
// Store inverted versions of textures
const invertedTextureCache = new Map<string, THREE.Texture>();

// Track previous texture for each mesh to detect texture changes
const previousTextures = new WeakMap<THREE.Mesh, string | null>();

// Track if texture was just changed - prevents color from being reapplied immediately
const textureJustChanged = new WeakMap<THREE.Mesh, boolean>();

// OPTIMIZATION: Single TextureLoader instance (reuse instead of creating new one every frame)
const textureLoader = new THREE.TextureLoader();

// OPTIMIZATION: Track last customization state to avoid unnecessary updates
const lastCustomizations = new WeakMap<THREE.Mesh, {
  textureScale?: number;
  textureInvert?: boolean;
  normalIntensity?: number;
  displacementIntensity?: number;
  roughness?: number;
  metalness?: number;
}>();

// OPTIMIZATION: Track loading textures to prevent duplicate loads
const loadingTextures = new Set<string>();

export function applyCustomizations(
  mesh: THREE.Mesh,
  customization: MeshCustomization
) {
  if (!mesh.material) return;

  // IMPORTANT: Clone material if not already cloned (to avoid affecting other meshes)
  // This ensures each mesh has its own independent material
  if (!originalMaterials.has(mesh)) {
    // Store original material before cloning
    originalMaterials.set(mesh, mesh.material);
    
    // Clone the material(s) - this creates a new material instance
    if (Array.isArray(mesh.material)) {
      mesh.material = mesh.material.map(mat => mat.clone());
    } else {
      mesh.material = mesh.material.clone();
    }
  }

  // Handle multiple materials (array)
  const materials = Array.isArray(mesh.material)
    ? mesh.material
    : [mesh.material];

  materials.forEach((material) => {
    if (material instanceof THREE.MeshStandardMaterial) {
      // Track texture changes - detect if texture changed
      const previousTexture = previousTextures.get(mesh) || null;
      const currentTexture = customization.texture || null;
      const textureChanged = previousTexture !== currentTexture;
      
      // Check if texture was just changed (prevents color reapplication)
      const wasJustChanged = textureJustChanged.get(mesh) || false;
      
      // CRITICAL: When texture is applied or changed, ALWAYS reset color to white FIRST
      // This ensures texture shows its original colors, removing any previous color
      if (textureChanged && customization.texture) {
        // Texture changed - reset color to white IMMEDIATELY to show original texture colors
        // This happens BEFORE texture is applied to ensure clean state
        material.color.setHex(0xffffff);
        // Mark that texture was just changed - prevents color from being reapplied
        textureJustChanged.set(mesh, true);
      } else if (!textureChanged && wasJustChanged) {
        // Texture is now stable (not changed this frame) - clear the "just changed" flag
        // This allows color to be applied in future frames if user changes color
        textureJustChanged.set(mesh, false);
      }
      
      // Apply textures FIRST - when texture is applied/changed, reset color to white for true texture colors
      // OPTIMIZATION: Reuse single TextureLoader instance instead of creating new one
      
      if (customization.texture) {
        // Update previous texture tracking AFTER resetting color (if texture changed)
        if (textureChanged) {
          previousTextures.set(mesh, currentTexture);
        }
        
        // Check cache first
        if (textureCache.has(customization.texture)) {
          const cachedTexture = textureCache.get(customization.texture)!;
          material.map = cachedTexture;
          
          // OPTIMIZATION: Only update filtering if not already set (avoid redundant updates)
          if (cachedTexture.minFilter !== THREE.LinearMipmapLinearFilter) {
            cachedTexture.minFilter = THREE.LinearMipmapLinearFilter;
            cachedTexture.magFilter = THREE.LinearFilter;
            cachedTexture.generateMipmaps = true;
            cachedTexture.anisotropy = 16;
            cachedTexture.needsUpdate = true;
          }
          
          // IMPORTANT: Textures have their own colors from PNG files - use original colors
          // Only apply color tint if user explicitly wants to tint (via textureTint property)
          // Do NOT apply customization.color to textures - textures have their own color mapping
          if (!textureChanged && !wasJustChanged && customization.textureTint) {
            // User explicitly wants to tint the texture - apply textureTint
            const tintColor = new THREE.Color(customization.textureTint);
            material.color.copy(tintColor);
            material.needsUpdate = true;
          } else {
            // No tint requested - ensure color is white to show original texture colors from PNG
            if (material.color.getHex() !== 0xffffff) {
              material.color.setHex(0xffffff);
              material.needsUpdate = true;
            }
          }
        } else {
          // OPTIMIZATION: Prevent duplicate loads of the same texture
          const textureUrl = customization.texture;
          if (!loadingTextures.has(textureUrl)) {
            loadingTextures.add(textureUrl);
            
            textureLoader.load(
              textureUrl,
              (texture) => {
                loadingTextures.delete(textureUrl);
                
                // Set texture wrapping
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                
                // IMPORTANT: Set texture filtering for smooth, high-quality rendering
                texture.minFilter = THREE.LinearMipmapLinearFilter; // Smooth minification
                texture.magFilter = THREE.LinearFilter; // Smooth magnification
                texture.generateMipmaps = true; // Enable mipmaps for better quality
                texture.anisotropy = 16; // Maximum anisotropy for crisp textures at angles
                
                // Apply texture scale to diffuse map
                const scale = customization.textureScale ?? 1.0;
                texture.repeat.set(scale, scale);
                
                textureCache.set(textureUrl, texture);
                material.map = texture;
                
                // Note: Normal and roughness maps will get scale applied below
                
                // IMPORTANT: Textures have their own colors from PNG files - use original colors
                // Check again if texture changed (might have changed during async load)
                const currentTextureAfterLoad = customization.texture || null;
                const textureStillChanged = previousTextures.get(mesh) !== currentTextureAfterLoad;
                const wasJustChangedInCallback = textureJustChanged.get(mesh) || false;
                
                if (textureStillChanged) {
                  // Texture changed during load - ensure color is white to show original PNG colors
                  material.color.setHex(0xffffff);
                  previousTextures.set(mesh, currentTextureAfterLoad);
                  textureJustChanged.set(mesh, true);
                } else if (!wasJustChangedInCallback && customization.textureTint) {
                  // User explicitly wants to tint the texture - apply textureTint
                  const tintColor = new THREE.Color(customization.textureTint);
                  material.color.copy(tintColor);
                } else {
                  // No tint requested - ensure color is white to show original texture colors from PNG
                  material.color.setHex(0xffffff);
                }
                
                material.needsUpdate = true;
              },
              undefined,
              (error) => {
                loadingTextures.delete(textureUrl);
                console.error('Error loading texture:', customization.texture, error);
              }
            );
          }
        }
      } else {
        // No texture - remove texture and apply color directly to material
        material.map = null;
        
        // Check if texture was removed (had texture before, now doesn't)
        const hadTexture = previousTexture !== null;
        if (hadTexture) {
          // Texture was removed - clear the "just changed" flag
          textureJustChanged.set(mesh, false);
        }
        
        // Update previous texture tracking (texture removed)
        previousTextures.set(mesh, null);
        
        if (customization.color) {
          const hexColor = customization.color.startsWith('#')
            ? customization.color.substring(1)
            : customization.color;
          material.color.setHex(parseInt(hexColor, 16));
        } else {
          material.color.setHex(0xffffff);
        }
      }
      
      // Update previous texture tracking if texture exists and hasn't been tracked yet
      if (customization.texture && !textureChanged) {
        previousTextures.set(mesh, currentTexture);
      }
      
      // OPTIMIZATION: Apply texture configuration (scale, tint, invert) only when values change
      // Track last customization state to avoid redundant updates every frame
      const lastCustom = lastCustomizations.get(mesh) || {};
      let needsMaterialUpdate = false;
      
      // IMPORTANT: Apply scale to ALL texture maps (diffuse, normal, roughness) for alignment
      if (customization.textureScale !== undefined && lastCustom.textureScale !== customization.textureScale) {
        const scale = customization.textureScale;
        
        // Apply scale to diffuse map (main texture)
        if (material.map) {
          material.map.repeat.set(scale, scale);
          material.map.needsUpdate = true;
        }
        
        // Apply scale to normal map
        if (material.normalMap) {
          material.normalMap.repeat.set(scale, scale);
          material.normalMap.needsUpdate = true;
        }
        
        // Apply scale to roughness map
        if (material.roughnessMap) {
          material.roughnessMap.repeat.set(scale, scale);
          material.roughnessMap.needsUpdate = true;
        }
        
        // Apply scale to metalness map (if exists)
        if (material.metalnessMap) {
          material.metalnessMap.repeat.set(scale, scale);
          material.metalnessMap.needsUpdate = true;
        }
        
        // Apply scale to AO map (if exists)
        if (material.aoMap) {
          material.aoMap.repeat.set(scale, scale);
          material.aoMap.needsUpdate = true;
        }
        
        // Apply scale to displacement map (if exists)
        if (material.displacementMap) {
          material.displacementMap.repeat.set(scale, scale);
          material.displacementMap.needsUpdate = true;
        }
        
        lastCustom.textureScale = scale;
        needsMaterialUpdate = true;
      }
      
      // IMPORTANT: Textures have their own colors from PNG files - use original colors
      // Only apply textureTint if user explicitly wants to tint, otherwise show original PNG colors
      if (material.map && !textureChanged && !wasJustChanged) {
        // Texture exists and is stable
        if (customization.textureTint !== undefined && customization.textureTint !== null) {
          // User explicitly set textureTint - apply it as tint
          const tintColor = new THREE.Color(customization.textureTint);
          material.color.copy(tintColor);
          needsMaterialUpdate = true;
        } else {
          // No tint requested - ensure color is white to show original texture colors from PNG
          // Only update if it's not already white to avoid redundant updates
          if (material.color.getHex() !== 0xffffff) {
            material.color.setHex(0xffffff);
            needsMaterialUpdate = true;
          }
        }
        // NOTE: customization.color is NOT applied to textures - textures use their own color mapping from PNG files
      }
      
      // OPTIMIZATION: Apply invert only when invert state changes
      if (customization.textureInvert !== undefined && 
          lastCustom.textureInvert !== customization.textureInvert && 
          material.map && 
          customization.texture) {
        const textureKey = customization.texture;
        const invertKey = `${textureKey}_inverted`;
        
        if (customization.textureInvert) {
          // Check if inverted version is cached
          if (invertedTextureCache.has(invertKey)) {
            const invertedTexture = invertedTextureCache.get(invertKey)!;
            const scale = customization.textureScale ?? 1.0;
            invertedTexture.repeat.set(scale, scale);
            material.map = invertedTexture;
            // Also update normal and roughness maps with same scale
            if (material.normalMap) {
              material.normalMap.repeat.set(scale, scale);
              material.normalMap.needsUpdate = true;
            }
            if (material.roughnessMap) {
              material.roughnessMap.repeat.set(scale, scale);
              material.roughnessMap.needsUpdate = true;
            }
            needsMaterialUpdate = true;
          } else if (material.map.image) {
            // OPTIMIZATION: Create inverted version asynchronously to avoid blocking UI
            requestIdleCallback(() => {
              const originalTexture = material.map;
              if (!originalTexture || !originalTexture.image) return;
              
              const canvas = document.createElement('canvas');
              canvas.width = originalTexture.image.width || 256;
              canvas.height = originalTexture.image.height || 256;
              const ctx = canvas.getContext('2d')!;
              
              // Draw original texture
              ctx.drawImage(originalTexture.image, 0, 0);
              
              // Get image data and invert
              const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
              const data = imageData.data;
              
              for (let i = 0; i < data.length; i += 4) {
                data[i] = 255 - data[i];     // Red
                data[i + 1] = 255 - data[i + 1]; // Green
                data[i + 2] = 255 - data[i + 2]; // Blue
                // Alpha stays the same
              }
              
              ctx.putImageData(imageData, 0, 0);
              
              // Create new texture from inverted canvas
              const invertedTexture = new THREE.CanvasTexture(canvas);
              invertedTexture.wrapS = THREE.RepeatWrapping;
              invertedTexture.wrapT = THREE.RepeatWrapping;
              invertedTexture.minFilter = THREE.LinearMipmapLinearFilter;
              invertedTexture.magFilter = THREE.LinearFilter;
              invertedTexture.generateMipmaps = true;
              invertedTexture.anisotropy = 16;
              const scale = customization.textureScale ?? 1.0;
              invertedTexture.repeat.set(scale, scale);
              
              invertedTextureCache.set(invertKey, invertedTexture);
              material.map = invertedTexture;
              material.needsUpdate = true;
            }, { timeout: 100 });
          }
        } else {
          // Use original texture
          const originalTexture = textureCache.get(textureKey);
          if (originalTexture) {
            const scale = customization.textureScale ?? 1.0;
            originalTexture.repeat.set(scale, scale);
            material.map = originalTexture;
            // Also update normal and roughness maps with same scale
            if (material.normalMap) {
              material.normalMap.repeat.set(scale, scale);
              material.normalMap.needsUpdate = true;
            }
            if (material.roughnessMap) {
              material.roughnessMap.repeat.set(scale, scale);
              material.roughnessMap.needsUpdate = true;
            }
            needsMaterialUpdate = true;
          }
        }
        
        lastCustom.textureInvert = customization.textureInvert;
      }

      if (customization.normalMap) {
        if (textureCache.has(customization.normalMap)) {
          const cachedTexture = textureCache.get(customization.normalMap)!;
          material.normalMap = cachedTexture;
          // Apply scale to cached normal map (only if changed)
          if (customization.textureScale !== undefined && lastCustom.textureScale !== customization.textureScale) {
            cachedTexture.repeat.set(customization.textureScale, customization.textureScale);
            cachedTexture.needsUpdate = true;
          }
          // Use customizable normal intensity, default to 1.0 (only update if changed)
          const normalIntensity = customization.normalIntensity ?? 1.0;
          if (lastCustom.normalIntensity !== normalIntensity) {
            material.normalScale = new THREE.Vector2(normalIntensity, normalIntensity);
            needsMaterialUpdate = true;
            lastCustom.normalIntensity = normalIntensity;
          }
        } else {
          // OPTIMIZATION: Prevent duplicate loads
          const normalMapUrl = customization.normalMap;
          if (!loadingTextures.has(normalMapUrl)) {
            loadingTextures.add(normalMapUrl);
            textureLoader.load(
            customization.normalMap,
              (texture) => {
                loadingTextures.delete(normalMapUrl);
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                texture.minFilter = THREE.LinearMipmapLinearFilter;
                texture.magFilter = THREE.LinearFilter;
                texture.generateMipmaps = true;
                texture.anisotropy = 16;
                // Apply same scale as diffuse map
                const scale = customization.textureScale ?? 1.0;
                texture.repeat.set(scale, scale);
                textureCache.set(normalMapUrl, texture);
                material.normalMap = texture;
                // Use customizable normal intensity, default to 1.0
                const normalIntensity = customization.normalIntensity ?? 1.0;
                material.normalScale = new THREE.Vector2(normalIntensity, normalIntensity);
                material.needsUpdate = true;
              },
              undefined,
              (error) => {
                loadingTextures.delete(normalMapUrl);
                console.error('Error loading normal map:', customization.normalMap, error);
              }
            );
          }
        }
      } else {
        material.normalMap = null;
      }

      if (customization.roughnessMap) {
        if (textureCache.has(customization.roughnessMap)) {
          const cachedTexture = textureCache.get(customization.roughnessMap)!;
          material.roughnessMap = cachedTexture;
          // Apply scale to cached roughness map (only if changed)
          if (customization.textureScale !== undefined && lastCustom.textureScale !== customization.textureScale) {
            cachedTexture.repeat.set(customization.textureScale, customization.textureScale);
            cachedTexture.needsUpdate = true;
          }
        } else {
          // OPTIMIZATION: Prevent duplicate loads
          const roughnessMapUrl = customization.roughnessMap;
          if (!loadingTextures.has(roughnessMapUrl)) {
            loadingTextures.add(roughnessMapUrl);
            textureLoader.load(
            customization.roughnessMap,
              (texture) => {
                loadingTextures.delete(roughnessMapUrl);
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                texture.minFilter = THREE.LinearMipmapLinearFilter;
                texture.magFilter = THREE.LinearFilter;
                texture.generateMipmaps = true;
                texture.anisotropy = 16;
                // Apply same scale as diffuse map
                const scale = customization.textureScale ?? 1.0;
                texture.repeat.set(scale, scale);
                textureCache.set(roughnessMapUrl, texture);
                material.roughnessMap = texture;
                material.needsUpdate = true;
              },
              undefined,
              (error) => {
                loadingTextures.delete(roughnessMapUrl);
                console.error('Error loading roughness map:', customization.roughnessMap, error);
              }
            );
          }
        }
      } else {
        material.roughnessMap = null;
      }

      if (customization.metalnessMap) {
        if (textureCache.has(customization.metalnessMap)) {
          const cachedTexture = textureCache.get(customization.metalnessMap)!;
          material.metalnessMap = cachedTexture;
          // Apply scale to cached metalness map (only if changed)
          if (customization.textureScale !== undefined && lastCustom.textureScale !== customization.textureScale) {
            cachedTexture.repeat.set(customization.textureScale, customization.textureScale);
            cachedTexture.needsUpdate = true;
          }
        } else {
          // OPTIMIZATION: Prevent duplicate loads
          const metalnessMapUrl = customization.metalnessMap;
          if (!loadingTextures.has(metalnessMapUrl)) {
            loadingTextures.add(metalnessMapUrl);
            textureLoader.load(
            customization.metalnessMap,
              (texture) => {
                loadingTextures.delete(metalnessMapUrl);
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                texture.minFilter = THREE.LinearMipmapLinearFilter;
                texture.magFilter = THREE.LinearFilter;
                texture.generateMipmaps = true;
                texture.anisotropy = 16;
                // Apply same scale as diffuse map
                const scale = customization.textureScale ?? 1.0;
                texture.repeat.set(scale, scale);
                textureCache.set(metalnessMapUrl, texture);
                material.metalnessMap = texture;
                material.needsUpdate = true;
              },
              undefined,
              (error) => {
                loadingTextures.delete(metalnessMapUrl);
                console.error('Error loading metalness map:', customization.metalnessMap, error);
              }
            );
          }
        }
      } else {
        material.metalnessMap = null;
      }

      // OPTIMIZATION: Apply roughness value only when changed
      if (customization.roughness !== undefined && lastCustom.roughness !== customization.roughness) {
        material.roughness = customization.roughness;
        // If roughness map exists, it will be multiplied by this value
        // For leather, we want higher roughness (0.7-1.0) for matte look
        needsMaterialUpdate = true;
        lastCustom.roughness = customization.roughness;
      }

      // OPTIMIZATION: Apply metalness value only when changed
      if (customization.metalness !== undefined && lastCustom.metalness !== customization.metalness) {
        material.metalness = customization.metalness;
        // For leather, we want 0 metalness (non-metallic)
        needsMaterialUpdate = true;
        lastCustom.metalness = customization.metalness;
      }

      // Apply Ambient Occlusion (AO) Map for realistic shadows in crevices
      if (customization.aoMap) {
        if (textureCache.has(customization.aoMap)) {
          const cachedTexture = textureCache.get(customization.aoMap)!;
          material.aoMap = cachedTexture;
          // Apply scale to cached AO map (only if changed)
          if (customization.textureScale !== undefined && lastCustom.textureScale !== customization.textureScale) {
            cachedTexture.repeat.set(customization.textureScale, customization.textureScale);
            cachedTexture.needsUpdate = true;
          }
          material.aoMapIntensity = 1.0; // Full AO intensity for realistic shadows
        } else {
          // OPTIMIZATION: Prevent duplicate loads
          const aoMapUrl = customization.aoMap;
          if (!loadingTextures.has(aoMapUrl)) {
            loadingTextures.add(aoMapUrl);
            textureLoader.load(
            customization.aoMap,
              (texture) => {
                loadingTextures.delete(aoMapUrl);
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                texture.minFilter = THREE.LinearMipmapLinearFilter;
                texture.magFilter = THREE.LinearFilter;
                texture.generateMipmaps = true;
                texture.anisotropy = 16;
                // Apply same scale as diffuse map
                const scale = customization.textureScale ?? 1.0;
                texture.repeat.set(scale, scale);
                textureCache.set(aoMapUrl, texture);
                material.aoMap = texture;
                material.aoMapIntensity = 1.0; // Full AO intensity for realistic shadows
                material.needsUpdate = true;
              },
              undefined,
              (error) => {
                loadingTextures.delete(aoMapUrl);
                console.error('Error loading AO map:', customization.aoMap, error);
              }
            );
          }
        }
      } else {
        material.aoMap = null;
      }

      // Apply Displacement/Height Map for realistic surface detail
      if (customization.displacementMap) {
        if (textureCache.has(customization.displacementMap)) {
          const cachedTexture = textureCache.get(customization.displacementMap)!;
          material.displacementMap = cachedTexture;
          // Apply scale to cached displacement map (only if changed)
          if (customization.textureScale !== undefined && lastCustom.textureScale !== customization.textureScale) {
            cachedTexture.repeat.set(customization.textureScale, customization.textureScale);
            cachedTexture.needsUpdate = true;
          }
          // Use customizable displacement intensity, default to 0 (only update if changed)
          const displacementIntensity = customization.displacementIntensity ?? 0.0;
          if (lastCustom.displacementIntensity !== displacementIntensity) {
            material.displacementScale = displacementIntensity; // Displacement intensity
            material.displacementBias = -displacementIntensity * 0.5; // Center the displacement
            needsMaterialUpdate = true;
            lastCustom.displacementIntensity = displacementIntensity;
          }
        } else {
          // OPTIMIZATION: Prevent duplicate loads
          const displacementMapUrl = customization.displacementMap;
          if (!loadingTextures.has(displacementMapUrl)) {
            loadingTextures.add(displacementMapUrl);
            textureLoader.load(
            customization.displacementMap,
              (texture) => {
                loadingTextures.delete(displacementMapUrl);
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                texture.minFilter = THREE.LinearMipmapLinearFilter;
                texture.magFilter = THREE.LinearFilter;
                texture.generateMipmaps = true;
                texture.anisotropy = 16;
                // Apply same scale as diffuse map
                const scale = customization.textureScale ?? 1.0;
                texture.repeat.set(scale, scale);
                textureCache.set(displacementMapUrl, texture);
                material.displacementMap = texture;
                // Use customizable displacement intensity, default to subtle value
                const displacementIntensity = customization.displacementIntensity ?? 0.0;
                material.displacementScale = displacementIntensity; // Subtle displacement for realistic detail
                material.displacementBias = -displacementIntensity * 0.5; // Center the displacement
                material.needsUpdate = true;
              },
              undefined,
              (error) => {
                loadingTextures.delete(displacementMapUrl);
                console.error('Error loading displacement map:', customization.displacementMap, error);
              }
            );
          }
        }
      } else {
        material.displacementMap = null;
      }

      // OPTIMIZATION: Only update material if something actually changed
      if (needsMaterialUpdate) {
        material.needsUpdate = true;
      }
      
      // Store last customization state for next frame comparison
      lastCustomizations.set(mesh, {
        ...lastCustom,
        textureScale: customization.textureScale,
        textureInvert: customization.textureInvert,
        normalIntensity: customization.normalIntensity,
        displacementIntensity: customization.displacementIntensity,
        roughness: customization.roughness,
        metalness: customization.metalness,
      });
    }
  });
}

export function getMeshNames(scene: THREE.Object3D): string[] {
  const meshNames: string[] = [];
  scene.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      const name = child.name || `mesh_${child.uuid}`;
      meshNames.push(name);
    }
  });
  return meshNames;
}

