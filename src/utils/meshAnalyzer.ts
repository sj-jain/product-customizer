/**
 * Mesh Analyzer Utility
 * 
 * Analyzes GLTF meshes to extract all available information
 * that can help identify which part of the shoe each mesh represents
 */

import * as THREE from 'three';

export interface MeshAnalysis {
  uuid: string;
  name: string;
  parentName: string | null;
  parentPath: string[];
  materialName: string | null;
  materialType: string | null;
  userData: any;
  geometryInfo: {
    vertices: number;
    faces: number;
    type: string;
  };
  position: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  visible: boolean;
  layers: number;
  // Texture information
  textures: {
    map?: string;
    normalMap?: string;
    roughnessMap?: string;
    metalnessMap?: string;
  };
}

/**
 * Analyze a single mesh to extract all identifying information
 */
export function analyzeMesh(mesh: THREE.Mesh, scene: THREE.Object3D): MeshAnalysis {
  // Get parent hierarchy
  const parentPath: string[] = [];
  let current: THREE.Object3D | null = mesh.parent;
  while (current && current !== scene) {
    if (current.name) {
      parentPath.unshift(current.name);
    }
    current = current.parent;
  }

  // Get material information
  const material = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
  const materialName = material?.name || null;
  const materialType = material ? material.constructor.name : null;

  // Get texture information
  const textures: any = {};
  if (material instanceof THREE.MeshStandardMaterial) {
    if (material.map) textures.map = material.map.name || 'texture';
    if (material.normalMap) textures.normalMap = material.normalMap.name || 'normal';
    if (material.roughnessMap) textures.roughnessMap = material.roughnessMap.name || 'roughness';
    if (material.metalnessMap) textures.metalnessMap = material.metalnessMap.name || 'metalness';
  }

  // Get geometry information
  const geometry = mesh.geometry;
  const geometryInfo = {
    vertices: geometry.attributes.position?.count || 0,
    faces: geometry.index ? geometry.index.count / 3 : geometry.attributes.position.count / 3,
    type: geometry.constructor.name,
  };

  // Get transform information
  const position = {
    x: mesh.position.x,
    y: mesh.position.y,
    z: mesh.position.z,
  };

  const scale = {
    x: mesh.scale.x,
    y: mesh.scale.y,
    z: mesh.scale.z,
  };

  const rotation = {
    x: mesh.rotation.x,
    y: mesh.rotation.y,
    z: mesh.rotation.z,
  };

  return {
    uuid: mesh.uuid,
    name: mesh.name || `Mesh_${mesh.uuid.substring(0, 8)}`,
    parentName: mesh.parent?.name || null,
    parentPath: parentPath,
    materialName: materialName,
    materialType: materialType,
    userData: mesh.userData,
    geometryInfo: geometryInfo,
    position: position,
    scale: scale,
    rotation: rotation,
    visible: mesh.visible,
    layers: mesh.layers.mask,
    textures: textures,
  };
}

/**
 * Analyze all meshes in a scene
 */
export function analyzeAllMeshes(scene: THREE.Object3D): MeshAnalysis[] {
  const analyses: MeshAnalysis[] = [];

  scene.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      analyses.push(analyzeMesh(child, scene));
    }
  });

  return analyses;
}

/**
 * Get all unique parent names (group names)
 */
export function getParentNames(scene: THREE.Object3D): string[] {
  const parentNames = new Set<string>();

  scene.traverse((child) => {
    if (child instanceof THREE.Mesh && child.parent) {
      if (child.parent.name) {
        parentNames.add(child.parent.name);
      }
    }
  });

  return Array.from(parentNames);
}

/**
 * Get all material names
 */
export function getMaterialNames(scene: THREE.Object3D): string[] {
  const materialNames = new Set<string>();

  scene.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      const material = Array.isArray(child.material) ? child.material[0] : child.material;
      if (material?.name) {
        materialNames.add(material.name);
      }
    }
  });

  return Array.from(materialNames);
}

/**
 * Find meshes by parent name
 */
export function findMeshesByParent(scene: THREE.Object3D, parentName: string): THREE.Mesh[] {
  const meshes: THREE.Mesh[] = [];

  scene.traverse((child) => {
    if (child instanceof THREE.Mesh && child.parent?.name === parentName) {
      meshes.push(child);
    }
  });

  return meshes;
}

/**
 * Find meshes by material name
 */
export function findMeshesByMaterial(scene: THREE.Object3D, materialName: string): THREE.Mesh[] {
  const meshes: THREE.Mesh[] = [];

  scene.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      const material = Array.isArray(child.material) ? child.material[0] : child.material;
      if (material?.name === materialName) {
        meshes.push(child);
      }
    }
  });

  return meshes;
}

/**
 * Get detailed mesh information for debugging
 */
export function getDetailedMeshInfo(scene: THREE.Object3D): {
  meshes: MeshAnalysis[];
  parentNames: string[];
  materialNames: string[];
  summary: {
    totalMeshes: number;
    namedMeshes: number;
    meshesWithParents: number;
    uniqueMaterials: number;
  };
} {
  const analyses = analyzeAllMeshes(scene);
  const parentNames = getParentNames(scene);
  const materialNames = getMaterialNames(scene);

  const summary = {
    totalMeshes: analyses.length,
    namedMeshes: analyses.filter(m => m.name && !m.name.startsWith('Mesh_')).length,
    meshesWithParents: analyses.filter(m => m.parentName).length,
    uniqueMaterials: materialNames.length,
  };

  return {
    meshes: analyses,
    parentNames,
    materialNames,
    summary,
  };
}

