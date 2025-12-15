/**
 * Mesh Discovery Utility
 * 
 * Discovers and extracts all mesh information from GLTF model
 * Provides mapping between mesh names, IDs, and display names
 */

import * as THREE from 'three';

export interface MeshInfo {
  uuid: string;
  name: string;
  displayName: string;
  mesh: THREE.Mesh;
}

export interface MeshDiscoveryResult {
  meshes: MeshInfo[];
  meshMap: Map<string, MeshInfo>; // UUID -> MeshInfo
  nameMap: Map<string, MeshInfo[]>; // name -> MeshInfo[] (multiple meshes can have same name)
}

/**
 * Discover all meshes in a 3D scene
 */
export function discoverMeshes(scene: THREE.Object3D): MeshDiscoveryResult {
  const meshes: MeshInfo[] = [];
  const meshMap = new Map<string, MeshInfo>();
  const nameMap = new Map<string, MeshInfo[]>();

  scene.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      const name = child.name || `Mesh_${child.uuid.substring(0, 8)}`;
      const displayName = formatDisplayName(name);

      const meshInfo: MeshInfo = {
        uuid: child.uuid,
        name: name,
        displayName: displayName,
        mesh: child,
      };

      meshes.push(meshInfo);
      meshMap.set(child.uuid, meshInfo);

      // Add to name map (handle multiple meshes with same name)
      const lowerName = name.toLowerCase();
      if (!nameMap.has(lowerName)) {
        nameMap.set(lowerName, []);
      }
      nameMap.get(lowerName)!.push(meshInfo);
    }
  });

  return {
    meshes,
    meshMap,
    nameMap,
  };
}

/**
 * Extract base name from mesh name (removes numbers, suffixes, etc.)
 * Examples: "buckle_1" -> "buckle", "buckle 2" -> "buckle", "Buckle_Left" -> "buckle"
 */
export function extractBaseName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[_\s]\d+$/, '') // Remove trailing numbers like "_1", " 2"
    .replace(/[_\s](left|right|top|bottom|front|back|upper|lower)$/i, '') // Remove directional suffixes
    .replace(/[_\s](l|r|t|b|f|u|d)$/i, '') // Remove single letter directional suffixes
    .replace(/[_\s-]+/g, ' ') // Normalize separators
    .trim()
    .split(/\s+/)[0]; // Get first word (base name)
}

/**
 * Format mesh name for display
 */
function formatDisplayName(name: string): string {
  // Convert snake_case or camelCase to Title Case
  return name
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

/**
 * Find mesh by name (fuzzy matching) - returns first match
 */
export function findMeshByName(
  discovery: MeshDiscoveryResult,
  searchName: string
): MeshInfo | null {
  const lowerSearch = searchName.toLowerCase().trim();

  // Exact match
  const exactMatch = discovery.nameMap.get(lowerSearch);
  if (exactMatch && exactMatch.length > 0) {
    return exactMatch[0]; // Return first match
  }

  // Partial match - check if search name contains mesh name or vice versa
  for (const [meshName, meshInfos] of discovery.nameMap.entries()) {
    if (meshName.includes(lowerSearch) || lowerSearch.includes(meshName)) {
      return meshInfos[0];
    }
  }

  // Word-based matching (e.g., "upper_mesh" matches "upper")
  const searchWords = lowerSearch.split(/[\s_-]+/);
  for (const [meshName, meshInfos] of discovery.nameMap.entries()) {
    const meshWords = meshName.split(/[\s_-]+/);
    const hasCommonWord = searchWords.some((word) =>
      meshWords.some((meshWord) => word === meshWord || meshWord.includes(word) || word.includes(meshWord))
    );
    if (hasCommonWord) {
      return meshInfos[0];
    }
  }

  return null;
}

/**
 * Find ALL meshes by name (fuzzy matching) - returns all matches
 * This is important when multiple meshes have the same name (e.g., two buckles)
 * Uses base name matching to group variations like "buckle", "buckle_1", "buckle_2"
 */
export function findAllMeshesByName(
  discovery: MeshDiscoveryResult,
  searchName: string
): MeshInfo[] {
  const lowerSearch = searchName.toLowerCase().trim();
  const searchBaseName = extractBaseName(lowerSearch);
  const results: MeshInfo[] = [];
  const foundUUIDs = new Set<string>(); // Track UUIDs to avoid duplicates

  // Strategy 1: Exact match - return ALL meshes with this exact name
  const exactMatch = discovery.nameMap.get(lowerSearch);
  if (exactMatch && exactMatch.length > 0) {
    exactMatch.forEach(mesh => {
      if (!foundUUIDs.has(mesh.uuid)) {
        results.push(mesh);
        foundUUIDs.add(mesh.uuid);
      }
    });
  }

  // Strategy 2: Base name matching - find all meshes with same base name
  // This handles "buckle", "buckle_1", "buckle_2", "Buckle_Left", etc.
  for (const [meshName, meshInfos] of discovery.nameMap.entries()) {
    const meshBaseName = extractBaseName(meshName);
    
    // Match by base name (most important for duplicates)
    if (meshBaseName === searchBaseName || 
        meshBaseName === lowerSearch ||
        lowerSearch === meshBaseName) {
      meshInfos.forEach(mesh => {
        if (!foundUUIDs.has(mesh.uuid)) {
          results.push(mesh);
          foundUUIDs.add(mesh.uuid);
        }
      });
    }
  }

  // Strategy 3: Partial match - check if search name contains mesh name or vice versa
  for (const [meshName, meshInfos] of discovery.nameMap.entries()) {
    if (meshName.includes(lowerSearch) || lowerSearch.includes(meshName)) {
      meshInfos.forEach(mesh => {
        if (!foundUUIDs.has(mesh.uuid)) {
          results.push(mesh);
          foundUUIDs.add(mesh.uuid);
        }
      });
    }
  }

  // Strategy 4: Word-based matching (e.g., "upper_mesh" matches "upper")
  const searchWords = lowerSearch.split(/[\s_-]+/);
  for (const [meshName, meshInfos] of discovery.nameMap.entries()) {
    const meshWords = meshName.split(/[\s_-]+/);
    const hasCommonWord = searchWords.some((word) =>
      meshWords.some((meshWord) => word === meshWord || meshWord.includes(word) || word.includes(meshWord))
    );
    if (hasCommonWord) {
      meshInfos.forEach(mesh => {
        if (!foundUUIDs.has(mesh.uuid)) {
          results.push(mesh);
          foundUUIDs.add(mesh.uuid);
        }
      });
    }
  }

  return results;
}

/**
 * Find multiple meshes by name pattern
 */
export function findMeshesByPattern(
  discovery: MeshDiscoveryResult,
  pattern: string
): MeshInfo[] {
  const lowerPattern = pattern.toLowerCase().trim();
  const results: MeshInfo[] = [];

  for (const [meshName, meshInfos] of discovery.nameMap.entries()) {
    if (meshName.includes(lowerPattern) || lowerPattern.includes(meshName)) {
      results.push(...meshInfos);
    }
  }

  return results;
}

/**
 * Get all mesh names for display
 */
export function getAllMeshNames(discovery: MeshDiscoveryResult): string[] {
  return Array.from(discovery.nameMap.keys());
}

/**
 * Get all mesh display names
 */
export function getAllMeshDisplayNames(discovery: MeshDiscoveryResult): string[] {
  const displayNames = new Set<string>();
  discovery.meshes.forEach((mesh) => {
    displayNames.add(mesh.displayName);
  });
  return Array.from(displayNames);
}

