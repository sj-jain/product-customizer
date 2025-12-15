import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useAppStore } from '../../store/useAppStore';
import MeshSelector from './MeshSelector';
import { applyCustomizations } from '../../utils/materialHelpers';
import { discoverMeshes } from '../../utils/meshDiscovery';
import { analyzeAllMeshes } from '../../utils/meshAnalyzer';
import { mapMeshNames, applyNameMappings } from '../../utils/meshNameMapper';

interface GLTFModelProps {
  modelPath?: string;
}

function GLTFModel({ modelPath }: GLTFModelProps) {
  // Use provided model path or default to shoe-1.glb
  const MODEL_PATH = modelPath || '/models/shoe-1.glb';
  const { scene } = useGLTF(MODEL_PATH);
  const modelRef = useRef<THREE.Group>(null);
  const { meshCustomizations, setGLTFModel, setLoading, setMeshInfo, setError, reset } = useAppStore();
  const environmentConfig = useAppStore((state) => state.environmentConfig);

  // Reset state when model path changes
  useEffect(() => {
    reset();
  }, [modelPath, reset]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        if (!scene) {
          throw new Error('GLTF scene not available');
        }

        console.log(`\n🔄 Loading model: ${MODEL_PATH}`);
        
        // Calculate bounding box to scale and center the model
        const box = new THREE.Box3().setFromObject(scene);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        
        console.log('📐 Model dimensions (before centering):', {
          size: { x: size.x, y: size.y, z: size.z },
          center: { x: center.x, y: center.y, z: center.z },
          maxDimension: Math.max(size.x, size.y, size.z)
        });
        
        // Calculate scale to fit model within viewport (target size: 3 units)
        const maxDimension = Math.max(size.x, size.y, size.z);
        const targetSize = 3;
        const scale = maxDimension > 0 ? targetSize / maxDimension : 1;
        const clampedScale = Math.max(0.01, Math.min(100, scale));
        
        // CRITICAL: Center the model FIRST, then apply scale
        // This ensures the model's center is at the origin (0,0,0)
        // Step 1: Move the model so its center is at origin
        scene.position.x = -center.x;
        scene.position.y = -center.y;
        scene.position.z = -center.z;
        
        // Step 2: Apply scale (scaling happens around the origin, so center stays at origin)
        scene.scale.multiplyScalar(clampedScale);
        
        // Verify the center is at origin after transformations
        const boxAfter = new THREE.Box3().setFromObject(scene);
        const centerAfter = boxAfter.getCenter(new THREE.Vector3());
        
        // If center is not at origin, adjust position
        if (Math.abs(centerAfter.x) > 0.001 || Math.abs(centerAfter.y) > 0.001 || Math.abs(centerAfter.z) > 0.001) {
          scene.position.x -= centerAfter.x;
          scene.position.y -= centerAfter.y;
          scene.position.z -= centerAfter.z;
          console.log('⚠️ Adjusted position to ensure center at origin:', {
            centerAfter: { x: centerAfter.x, y: centerAfter.y, z: centerAfter.z },
            adjustedPosition: { x: scene.position.x, y: scene.position.y, z: scene.position.z }
          });
        }
        
        if (cancelled) return;

        // Final verification: ensure center is at origin
        const finalBox = new THREE.Box3().setFromObject(scene);
        const finalCenter = finalBox.getCenter(new THREE.Vector3());
        const finalSize = finalBox.getSize(new THREE.Vector3());
        
        console.log('✅ Model scaled and centered:', {
          originalSize: { x: size.x, y: size.y, z: size.z },
          originalCenter: { x: center.x, y: center.y, z: center.z },
          scale: clampedScale,
          finalPosition: { x: scene.position.x, y: scene.position.y, z: scene.position.z },
          finalSize: { x: finalSize.x, y: finalSize.y, z: finalSize.z },
          finalCenter: { x: finalCenter.x, y: finalCenter.y, z: finalCenter.z },
          isCentered: Math.abs(finalCenter.x) < 0.001 && Math.abs(finalCenter.y) < 0.001 && Math.abs(finalCenter.z) < 0.001
        });
        
        if (Math.abs(finalCenter.x) > 0.001 || Math.abs(finalCenter.y) > 0.001 || Math.abs(finalCenter.z) > 0.001) {
          console.warn('⚠️ Model center is not at origin! Center:', finalCenter);
        }
        
        setGLTFModel(scene);
        
        // Discover all meshes and extract their information
        const discovery = discoverMeshes(scene);
        const analyses = analyzeAllMeshes(scene);
        const nameMappings = mapMeshNames(analyses);
        const baseMeshInfo = discovery.meshes.map((info) => ({
          uuid: info.uuid,
          name: info.name,
          displayName: info.displayName,
        }));
        const mappedMeshInfo = applyNameMappings(baseMeshInfo, nameMappings);
        
        setMeshInfo(mappedMeshInfo);

        // Log for debugging
        console.log('=== MESH DISCOVERY ===');
        console.log('Model Path:', MODEL_PATH);
        console.log('Original meshes:', baseMeshInfo);
        console.log('\n=== NAME MAPPINGS ===');
        console.log('Mappings:', nameMappings);
        console.log('\n=== MAPPED MESHES ===');
        console.log('Mapped meshes:', mappedMeshInfo);
        console.log('\n=== DETAILED MESH ANALYSIS ===');
        console.log('Analyses:', analyses);

      } catch (err: any) {
        console.error('❌ Failed to load model', MODEL_PATH, err);
        setError(err?.message || 'Failed to load model');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [scene, MODEL_PATH, setGLTFModel, setLoading, setMeshInfo, setError]);

  // Store mesh UUIDs for applying customizations (both shoes)
  const meshMapRef = useRef<Map<string, THREE.Mesh>>(new Map());

  useEffect(() => {
    if (scene) {
      // Build a map of mesh UUIDs and enable shadows
      meshMapRef.current.clear();
      let shadowCastingMeshes = 0;
      
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          meshMapRef.current.set(child.uuid, child);
          
          // CRITICAL: Enable shadows on all meshes
          child.castShadow = true;
          child.receiveShadow = false; // Meshes don't need to receive shadows, only the stage does
          shadowCastingMeshes++;
          
          // Ensure geometry is properly set up for shadows
          if (child.geometry) {
            child.geometry.computeBoundingBox();
            child.geometry.computeBoundingSphere();
          }
          
          // Ensure materials support shadows and have realistic properties (Nike By You style)
          if (child.material) {
            const materials = Array.isArray(child.material) ? child.material : [child.material];
            materials.forEach((mat) => {
              if (mat instanceof THREE.MeshStandardMaterial) {
                // Set realistic material properties for leather/shoes (Nike By You style)
                // Higher roughness = less shiny, more realistic leather
                if (mat.roughness === undefined || mat.roughness < 0.7) {
                  mat.roughness = 0.8; // Default to realistic leather roughness (0.7-0.9)
                }
                // Lower metalness = non-metallic materials (leather, fabric)
                if (mat.metalness === undefined || mat.metalness > 0.1) {
                  mat.metalness = 0.0; // Leather is not metallic
                }
                mat.needsUpdate = true;
              } else if (mat instanceof THREE.MeshPhongMaterial || 
                         mat instanceof THREE.MeshLambertMaterial) {
                // These materials support shadows by default
                mat.needsUpdate = true;
              } else if (mat instanceof THREE.MeshBasicMaterial) {
                // MeshBasicMaterial doesn't support shadows - convert to MeshStandardMaterial
                console.warn(`Mesh "${child.name}" uses MeshBasicMaterial which doesn't support shadows. Consider using MeshStandardMaterial.`);
              }
            });
          }
        }
      });
      
      console.log(`✅ Shadow setup complete: ${shadowCastingMeshes} meshes configured to cast shadows`);
    }
  }, [scene]);

  // Apply customizations on every frame
  // Only apply to meshes that have customizations - each mesh gets its own cloned material
  useFrame(() => {
    if (scene && Object.keys(meshCustomizations).length > 0) {
      // Apply customizations to specific meshes by UUID
      // Each mesh gets its own cloned material, so changes only affect that specific mesh
      Object.entries(meshCustomizations).forEach(([meshId, customization]) => {
        const mesh = meshMapRef.current.get(meshId);
        if (mesh) {
          // This function clones the material if needed, ensuring only this mesh is affected
          applyCustomizations(mesh, customization);
        }
      });
    }
  });

  if (!scene) return null;

  return (
    <group 
      ref={modelRef}
      // CRITICAL: Model center is at origin (0,0,0) after centering
      // productHeight moves the entire model up, but rotation still happens around origin
      // To keep center at origin for symmetric rotation, we need to adjust the scene position
      // Instead of moving the group up, we move the scene down by productHeight, then rotate
      position={[0, 0, 0]}
      rotation={[
        (environmentConfig.productTiltX * Math.PI) / 180,
        (environmentConfig.productTiltY * Math.PI) / 180,
        (environmentConfig.productTiltZ * Math.PI) / 180,
      ]}
    >
      {/* Primitive object - Model center stays at origin, productHeight applied to scene position */}
      <primitive object={scene} position={[0, environmentConfig.productHeight, 0]} />
      <MeshSelector model={scene} />
    </group>
  );
}

export default GLTFModel;

