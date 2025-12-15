import { useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useAppStore } from '../../store/useAppStore';
import HighlightEffect from './HighlightEffect';

interface MeshSelectorProps {
  model: THREE.Object3D;
}

function MeshSelector({ model }: MeshSelectorProps) {
  const { camera, gl } = useThree();
  const { selectMesh, selectedMesh } = useAppStore();
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      // Calculate mouse position in normalized device coordinates
      const rect = gl.domElement.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      // Update raycaster
      raycasterRef.current.setFromCamera(mouseRef.current, camera);

      // Find intersections
      const meshes: THREE.Mesh[] = [];
      model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          meshes.push(child);
        }
      });

      const intersections = raycasterRef.current.intersectObjects(meshes, true);

      if (intersections.length > 0) {
        const selected = intersections[0].object as THREE.Mesh;
        // Use UUID for unique identification, fallback to name if available
        const meshId = selected.uuid;
        const meshName = selected.name || `Mesh_${meshId.substring(0, 8)}`;
        
        console.log('Selected mesh:', {
          name: meshName,
          uuid: meshId,
          mesh: selected,
          material: selected.material
        });
        selectMesh(selected, meshId);
      } else {
        selectMesh(null, null);
      }
    };

    gl.domElement.addEventListener('click', handleClick);
    return () => {
      gl.domElement.removeEventListener('click', handleClick);
    };
  }, [camera, gl, model, selectMesh]);

  return selectedMesh ? <HighlightEffect mesh={selectedMesh} /> : null;
}

export default MeshSelector;

