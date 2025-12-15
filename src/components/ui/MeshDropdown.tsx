import { useState } from 'react';
import { Layers, ChevronDown, ChevronUp } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';

function MeshDropdown() {
  const { meshInfo, selectMesh, gltfModel } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);

  if (!gltfModel || meshInfo.length === 0) return null;

  const handleMeshSelect = (meshId: string) => {
    // Find the mesh in the model
    let foundMesh: any = null;
    gltfModel.traverse((child) => {
      if (child instanceof THREE.Mesh && child.uuid === meshId) {
        foundMesh = child;
      }
    });
    
    if (foundMesh) {
      selectMesh(foundMesh, meshId);
    }
  };

  return (
    <div className="fixed right-4 top-20 z-40 bg-white rounded-lg shadow-lg max-w-xs">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-3 flex items-center justify-between hover:bg-gray-50 rounded-t-lg transition-colors"
        title={`Available Meshes (${meshInfo.length})`}
      >
        <div className="flex items-center gap-2">
          <Layers size={20} className="text-blue-600" />
          {isOpen && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              {meshInfo.length}
            </span>
          )}
        </div>
        {isOpen ? <ChevronUp size={18} className="text-gray-500" /> : <ChevronDown size={18} className="text-gray-500" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="max-h-96 overflow-y-auto p-2 space-y-1">
              {meshInfo.map((mesh) => (
                <button
                  key={mesh.uuid}
                  onClick={() => handleMeshSelect(mesh.uuid)}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-200"
                >
                  <p className="font-medium text-sm text-gray-800">
                    {mesh.displayName || mesh.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {mesh.name !== mesh.displayName ? mesh.name : `UUID: ${mesh.uuid.substring(0, 8)}...`}
                  </p>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default MeshDropdown;

