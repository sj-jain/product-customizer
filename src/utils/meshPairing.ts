import * as THREE from 'three';

/**
 * Creates a mesh pairing map that links corresponding meshes between left and right shoes
 * Based on mesh names, pairs meshes that represent the same part (e.g., "sole" pairs with "sole")
 */
export function createMeshPairs(
  leftMeshes: THREE.Mesh[],
  rightMeshes: THREE.Mesh[]
): Map<string, string> {
  const pairs = new Map<string, string>();
  
  // Create a map of right mesh names to their UUIDs
  const rightMeshMap = new Map<string, THREE.Mesh>();
  rightMeshes.forEach((mesh) => {
    const baseName = extractBaseName(mesh.name);
    if (!rightMeshMap.has(baseName)) {
      rightMeshMap.set(baseName, mesh);
    }
  });
  
  // Pair left meshes with right meshes based on base name
  leftMeshes.forEach((leftMesh) => {
    const baseName = extractBaseName(leftMesh.name);
    const rightMesh = rightMeshMap.get(baseName);
    
    if (rightMesh) {
      // Pair left -> right
      pairs.set(leftMesh.uuid, rightMesh.uuid);
      // Pair right -> left (bidirectional)
      pairs.set(rightMesh.uuid, leftMesh.uuid);
    }
  });
  
  return pairs;
}

/**
 * Extracts the base name from a mesh name, removing suffixes like "_L", "_R", "_left", "_right", "_1", etc.
 */
function extractBaseName(name: string): string {
  if (!name) return '';
  
  // Remove common left/right suffixes
  let baseName = name
    .replace(/_L$/i, '')
    .replace(/_R$/i, '')
    .replace(/_left$/i, '')
    .replace(/_right$/i, '')
    .replace(/_l$/i, '')
    .replace(/_r$/i, '');
  
  // Remove numeric suffixes like "_1", "_2", etc. (but keep numbers in the middle)
  baseName = baseName.replace(/_(\d+)$/, '');
  
  // Normalize to lowercase for comparison
  return baseName.toLowerCase().trim();
}

/**
 * Gets the paired mesh UUID for a given mesh UUID
 */
export function getPairedMeshId(meshId: string, pairs: Map<string, string>): string | null {
  return pairs.get(meshId) || null;
}

/**
 * Gets all paired mesh IDs (including the original)
 */
export function getAllPairedMeshIds(meshId: string, pairs: Map<string, string>): string[] {
  const pairedIds = [meshId];
  const pairedId = pairs.get(meshId);
  if (pairedId && pairedId !== meshId) {
    pairedIds.push(pairedId);
  }
  return pairedIds;
}

