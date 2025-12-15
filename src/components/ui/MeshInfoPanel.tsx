import { useState } from 'react';
import { Info, ChevronDown, ChevronUp } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { getDetailedMeshInfo } from '../../utils/meshAnalyzer';
import * as THREE from 'three';

function MeshInfoPanel() {
  const { gltfModel } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMeshIndex, setSelectedMeshIndex] = useState<number | null>(null);

  if (!gltfModel) return null;

  const detailedInfo = getDetailedMeshInfo(gltfModel);

  return (
    <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg z-40 max-w-md">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 flex items-center justify-between hover:bg-gray-50 rounded-t-lg"
      >
        <div className="flex items-center gap-2">
          <Info size={18} />
          <span className="font-semibold">Mesh Information</span>
          <span className="text-xs text-gray-500">({detailedInfo.summary.totalMeshes} meshes)</span>
        </div>
        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      {isOpen && (
        <div className="p-4 border-t max-h-96 overflow-y-auto">
          {/* Summary */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">Summary</h3>
            <div className="text-sm space-y-1">
              <p>Total Meshes: {detailedInfo.summary.totalMeshes}</p>
              <p>Named Meshes: {detailedInfo.summary.namedMeshes}</p>
              <p>Meshes with Parents: {detailedInfo.summary.meshesWithParents}</p>
              <p>Unique Materials: {detailedInfo.summary.uniqueMaterials}</p>
            </div>
          </div>

          {/* Parent Names */}
          {detailedInfo.parentNames.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2 text-sm">Parent Groups:</h3>
              <div className="flex flex-wrap gap-2">
                {detailedInfo.parentNames.map((name, index) => (
                  <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Material Names */}
          {detailedInfo.materialNames.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2 text-sm">Material Names:</h3>
              <div className="flex flex-wrap gap-2">
                {detailedInfo.materialNames.map((name, index) => (
                  <span key={index} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* All Meshes */}
          <div className="space-y-2">
            <h3 className="font-semibold mb-2 text-sm">All Meshes:</h3>
            {detailedInfo.meshes.map((mesh, index) => (
              <div
                key={mesh.uuid}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedMeshIndex === index ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedMeshIndex(selectedMeshIndex === index ? null : index)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{mesh.name || 'Unnamed'}</p>
                    <p className="text-xs text-gray-500">UUID: {mesh.uuid.substring(0, 8)}...</p>
                  </div>
                  {selectedMeshIndex === index ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>

                {selectedMeshIndex === index && (
                  <div className="mt-3 pt-3 border-t space-y-2 text-xs">
                    {mesh.parentName && (
                      <div>
                        <span className="font-medium">Parent:</span> {mesh.parentName}
                      </div>
                    )}
                    {mesh.parentPath.length > 0 && (
                      <div>
                        <span className="font-medium">Path:</span> {mesh.parentPath.join(' → ')}
                      </div>
                    )}
                    {mesh.materialName && (
                      <div>
                        <span className="font-medium">Material:</span> {mesh.materialName} ({mesh.materialType})
                      </div>
                    )}
                    {Object.keys(mesh.textures).length > 0 && (
                      <div>
                        <span className="font-medium">Textures:</span>{' '}
                        {Object.entries(mesh.textures).map(([key, value]) => (
                          <span key={key} className="ml-1">{key}: {value}</span>
                        ))}
                      </div>
                    )}
                    {Object.keys(mesh.userData).length > 0 && (
                      <div>
                        <span className="font-medium">User Data:</span>
                        <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                          {JSON.stringify(mesh.userData, null, 2)}
                        </pre>
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Geometry:</span> {mesh.geometryInfo.vertices} vertices, {mesh.geometryInfo.faces} faces
                    </div>
                    <div>
                      <span className="font-medium">Position:</span> ({mesh.position.x.toFixed(2)}, {mesh.position.y.toFixed(2)}, {mesh.position.z.toFixed(2)})
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default MeshInfoPanel;

