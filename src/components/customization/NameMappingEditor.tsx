import { useState, useEffect } from 'react';
import { Edit2, Save, X, RefreshCw } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { NameMapping } from '../../utils/meshNameMapper';
import { analyzeAllMeshes } from '../../utils/meshAnalyzer';
import { mapMeshNames, applyNameMappings } from '../../utils/meshNameMapper';

function NameMappingEditor() {
  const { gltfModel, meshInfo, setMeshInfo } = useAppStore();
  const [mappings, setMappings] = useState<NameMapping[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    if (gltfModel && meshInfo.length > 0) {
      // Analyze meshes and create mappings
      const analyses = analyzeAllMeshes(gltfModel);
      const newMappings = mapMeshNames(analyses);
      setMappings(newMappings);
    }
  }, [gltfModel, meshInfo]);

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setEditValue(mappings[index].displayName);
  };

  const handleSave = (index: number) => {
    const newMappings = [...mappings];
    newMappings[index].displayName = editValue.trim();
    setMappings(newMappings);
    setEditingIndex(null);
    
    // Apply updated mappings
    const updatedMeshInfo = applyNameMappings(meshInfo, newMappings);
    setMeshInfo(updatedMeshInfo);
  };

  const handleCancel = () => {
    setEditingIndex(null);
    setEditValue('');
  };

  const handleRegenerate = () => {
    if (gltfModel) {
      const analyses = analyzeAllMeshes(gltfModel);
      const newMappings = mapMeshNames(analyses);
      setMappings(newMappings);
      const updatedMeshInfo = applyNameMappings(meshInfo, newMappings);
      setMeshInfo(updatedMeshInfo);
    }
  };

  if (mappings.length === 0) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-500">
        <p>No mesh mappings available. Load a model first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Mesh Name Mappings</h3>
        <button
          onClick={handleRegenerate}
          className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors flex items-center gap-1"
        >
          <RefreshCw size={14} />
          Regenerate
        </button>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {mappings.map((mapping, index) => (
          <div
            key={mapping.originalName}
            className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
          >
            <div className="flex-1">
              <p className="text-xs text-gray-500">{mapping.originalName}</p>
              {editingIndex === index ? (
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') handleSave(index);
                    if (e.key === 'Escape') handleCancel();
                  }}
                  className="w-full mt-1 px-2 py-1 border border-blue-500 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  autoFocus
                />
              ) : (
                <p className="font-medium text-gray-800">{mapping.displayName}</p>
              )}
              {mapping.category && (
                <span className="text-xs text-blue-600">({mapping.category})</span>
              )}
            </div>
            <div className="flex gap-1">
              {editingIndex === index ? (
                <>
                  <button
                    onClick={() => handleSave(index)}
                    className="p-1 text-green-600 hover:bg-green-100 rounded"
                    title="Save"
                  >
                    <Save size={16} />
                  </button>
                  <button
                    onClick={handleCancel}
                    className="p-1 text-red-600 hover:bg-red-100 rounded"
                    title="Cancel"
                  >
                    <X size={16} />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => handleEdit(index)}
                  className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                  title="Edit"
                >
                  <Edit2 size={16} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-500">
        Click edit to change display names. These names will be used in the UI and prompt system.
      </p>
    </div>
  );
}

export default NameMappingEditor;

