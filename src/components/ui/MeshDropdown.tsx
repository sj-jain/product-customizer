import { useState } from 'react';
import { Layers, ChevronDown, ChevronUp, X } from 'lucide-react';
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
    <div className="absolute right-4 z-40" style={{ top: '144px' }}>
      {/* Toggle Button - Matching Environment Panel style */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-3 bg-gray-800/90 hover:bg-gray-700 text-white rounded-lg transition-colors backdrop-blur-sm shadow-lg flex items-center gap-2"
        title={`Available Meshes (${meshInfo.length})`}
      >
        <Layers size={20} />
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {/* Panel - Matching Environment Panel style */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-14 right-0 w-80 bg-white rounded-lg shadow-2xl p-6 space-y-4 max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Layers size={20} className="text-blue-500" />
                Available Meshes
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                  {meshInfo.length}
                </span>
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full"
              >
                <X size={18} />
              </button>
            </div>
            <div className="space-y-1">
              {meshInfo.map((mesh) => (
                <button
                  key={mesh.uuid}
                  onClick={() => handleMeshSelect(mesh.uuid)}
                  className="w-full text-left px-4 py-3 rounded-lg hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-200"
                >
                  <p className="font-medium text-sm text-gray-800">
                    {mesh.displayName || mesh.name}
                  </p>
                  {mesh.name !== mesh.displayName && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      {mesh.name}
                    </p>
                  )}
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

