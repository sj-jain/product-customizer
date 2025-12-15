import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import ColorPicker from './ColorPicker';
import TexturePicker from './TexturePicker';
import TextureConfig from './TextureConfig';
import PromptWriter from './PromptWriter';
import NameMappingEditor from './NameMappingEditor';

function CustomizationPanel() {
  const { 
    showCustomizationPanel, 
    selectedMeshName,
    selectedMeshId, 
    toggleCustomizationPanel,
    selectMesh 
  } = useAppStore();
  
  const [activeTab, setActiveTab] = useState<'manual' | 'prompt' | 'names'>('manual');

  const handleClose = () => {
    toggleCustomizationPanel(false);
    selectMesh(null, null);
  };

  return (
    <AnimatePresence>
      {showCustomizationPanel && (
        <motion.div
          initial={{ x: 400 }}
          animate={{ x: 0 }}
          exit={{ x: 400 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="absolute right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 overflow-y-auto"
        >
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Customize</h2>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Selected Mesh Info - Only show for manual mode */}
            {activeTab === 'manual' && selectedMeshId && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Selected Part</p>
                <p className="text-lg font-semibold text-gray-800">
                  {selectedMeshName || 'Unknown'}
                </p>
              </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b">
              <button
                onClick={() => setActiveTab('manual')}
                className={`px-4 py-2 font-medium transition-colors ${
                  activeTab === 'manual'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Manual
              </button>
              <button
                onClick={() => setActiveTab('prompt')}
                className={`px-4 py-2 font-medium transition-colors ${
                  activeTab === 'prompt'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                AI Prompt
              </button>
              <button
                onClick={() => setActiveTab('names')}
                className={`px-4 py-2 font-medium transition-colors ${
                  activeTab === 'names'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Names
              </button>
            </div>

            {/* Customization Options */}
            <div className="space-y-6">
              {activeTab === 'manual' && selectedMeshId && (
                <>
                  <ColorPicker meshId={selectedMeshId} />
                  <div className="border-t pt-6">
                    <TexturePicker meshId={selectedMeshId} />
                  </div>
                  <div className="border-t pt-6">
                    <TextureConfig meshId={selectedMeshId} />
                  </div>
                </>
              )}
              
              {activeTab === 'prompt' && (
                <PromptWriter />
              )}
              
              {activeTab === 'names' && (
                <NameMappingEditor />
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default CustomizationPanel;

