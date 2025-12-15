/**
 * Texture Discovery Utility
 * Discovers and catalogs all available textures in the Textures folder
 */

export interface TextureSet {
  id: string;
  name: string;
  folder: string;
  diffuse: string;      // Base texture (albedo/diffuse)
  normal?: string;     // Normal map
  roughness?: string;   // Roughness map
  metalness?: string;   // Metalness map (if available)
  ao?: string;         // Ambient occlusion (if available)
  height?: string;      // Height/displacement map (if available)
}

let cachedTextures: TextureSet[] | null = null;

/**
 * Clear the texture cache (useful when textures.json is updated)
 */
export function clearTextureCache(): void {
  cachedTextures = null;
}

/**
 * Discover all texture sets from the textures.json file
 */
export async function discoverTextures(): Promise<TextureSet[]> {
  if (cachedTextures) {
    return cachedTextures;
  }
  
  try {
    // Add cache-busting query parameter to ensure fresh data
    const response = await fetch(`/textures.json?t=${Date.now()}`);
    if (response.ok) {
      const data = await response.json();
      cachedTextures = data as TextureSet[];
      console.log(`✅ Loaded ${cachedTextures.length} texture sets from textures.json`);
      return cachedTextures;
    } else {
      console.error('Failed to load textures.json:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('Error loading textures.json:', error);
  }
  
  // Fallback: return empty array
  return [];
}

/**
 * Get texture set by ID
 */
export async function getTextureSet(id: string): Promise<TextureSet | null> {
  const textures = await discoverTextures();
  return textures.find(t => t.id === id.toLowerCase()) || null;
}

/**
 * Get all texture IDs
 */
export async function getAllTextureIds(): Promise<string[]> {
  const textures = await discoverTextures();
  return textures.map(t => t.id);
}

/**
 * Find texture files in a folder (helper for actual file discovery)
 * This would be used if we had a backend API to list files
 */
export function findTextureFiles(folder: string): {
  diffuse?: string;
  normal?: string;
  roughness?: string;
} {
  // This is a placeholder - in a real implementation,
  // you might want to create a JSON file listing all textures
  // or use a backend API to discover files
  
  return {
    diffuse: `${folder}/texture.jpg`,
    normal: `${folder}/normal.png`,
    roughness: `${folder}/roughness.png`,
  };
}

