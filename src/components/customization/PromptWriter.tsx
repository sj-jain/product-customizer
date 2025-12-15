import { useState } from 'react';
import { Send, Sparkles, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { getDesignFromAI, AIColorMapping } from '../../services/aiService';
import { findMeshByName, findAllMeshesByName, extractBaseName } from '../../utils/meshDiscovery';
import * as THREE from 'three';

interface PromptWriterProps {
  onApply?: () => void;
}

function PromptWriter({ onApply }: PromptWriterProps) {
  const [prompt, setPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState<{
    mappings: AIColorMapping[];
    description?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { updateMeshCustomization, gltfModel, meshInfo } = useAppStore();

  // Create mesh discovery result from stored mesh info
  const getMeshDiscovery = () => {
    if (!gltfModel || meshInfo.length === 0) return null;

    const meshMap = new Map<string, any>();
    const nameMap = new Map<string, any[]>();
    const meshes: any[] = [];

    gltfModel.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const info = meshInfo.find(m => m.uuid === child.uuid);
        if (info) {
          const meshInfoObj = {
            uuid: info.uuid,
            name: info.name,
            displayName: info.displayName,
            mesh: child,
          };
          meshes.push(meshInfoObj);
          meshMap.set(child.uuid, meshInfoObj);
          
          const lowerName = info.name.toLowerCase();
          if (!nameMap.has(lowerName)) {
            nameMap.set(lowerName, []);
          }
          nameMap.get(lowerName)!.push(meshInfoObj);
        }
      }
    });

    return { meshMap, nameMap, meshes };
  };

  const handleSubmit = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    if (meshInfo.length === 0) {
      setError('Model not loaded. Please wait for the model to load.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setAiResponse(null);

    try {
      // Get available part names (display names) - ALL parts from the loaded model
      const availableParts = meshInfo.map(m => m.displayName || m.name);

      console.log('=== AI PROMPT REQUEST ===');
      console.log('User Prompt:', prompt);
      console.log(`Total Parts to Color: ${availableParts.length}`);
      console.log('All Parts:', availableParts);

      if (availableParts.length === 0) {
        setError('No parts found in the model. Please wait for the model to load completely.');
        setIsLoading(false);
        return;
      }

      // Call AI service with ALL parts
      const response = await getDesignFromAI(prompt, availableParts);

      console.log('=== AI RESPONSE ===');
      console.log('Response:', response);
      console.log(`Colors received for ${response.mappings?.length || 0} parts`);

      if (response.success) {
        // Verify we got colors for all parts
        if (response.mappings.length < availableParts.length) {
          console.warn(`⚠️ AI returned colors for only ${response.mappings.length} out of ${availableParts.length} parts`);
        } else {
          console.log(`✅ AI returned colors for all ${response.mappings.length} parts`);
        }

        setAiResponse({
          mappings: response.mappings,
          description: response.description,
        });
        setError(null);
        
        // Automatically apply colors immediately after receiving AI response
        // No need to click "Apply" - colors are applied automatically
        setTimeout(() => {
          handleApplyColors(response.mappings);
          // Clear prompt after applying
          setTimeout(() => {
            setPrompt('');
            setAiResponse(null);
          }, 3000); // Clear after 3 seconds so user can see the result
        }, 100); // Small delay to ensure state is updated
      } else {
        const errorMsg = response.error || 'Failed to get AI response';
        console.error('AI Error:', errorMsg);
        setError(errorMsg);
      }
    } catch (err: any) {
      console.error('Unexpected error:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Extract color application logic to a separate function so it can be called automatically
  const handleApplyColors = (mappings: AIColorMapping[]) => {
    if (!gltfModel) {
      console.warn('Model not loaded yet');
      return;
    }

    const discovery = getMeshDiscovery();
    if (!discovery) {
      console.warn('Mesh discovery not available');
      return;
    }

    console.log('\n=== APPLYING COLORS TO ALL PARTS ===');
    console.log(`Total meshes in model: ${meshInfo.length}`);
    console.log(`Colors to apply: ${mappings.length}`);
    console.log(`\n📋 AI Color Mappings:`);
    mappings.forEach(m => {
      console.log(`   "${m.partName}" → ${m.color}`);
    });

    let appliedCount = 0;
    const failedParts: string[] = [];

    // Apply each color mapping from AI response
    // Generic approach: Find all UUIDs for matching part names, then apply color to each UUID
    mappings.forEach((mapping) => {
      const partName = mapping.partName.toLowerCase().trim();
      const color = mapping.color;
      
      console.log(`\n🎨 Processing: "${mapping.partName}" → ${color}`);
      
      // Step 1: Find ALL UUIDs that match this part name (generic, works for any model)
      // Uses base name matching to group variations like "buckle", "buckle_1", "buckle_2"
      const matchingUUIDs = new Set<string>();
      const partBaseName = extractBaseName(partName);
      
      // Strategy 1: Use discovery nameMap with base name matching (handles duplicates)
      const discoveryMatches = findAllMeshesByName(discovery, partName);
      discoveryMatches.forEach(meshInfo => {
        matchingUUIDs.add(meshInfo.uuid);
      });
      
      // Strategy 2: Direct scene traversal - find all meshes by base name matching
      // This ensures we catch all variations: "buckle", "buckle_1", "Buckle_Left", etc.
      gltfModel.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const meshName = child.name || '';
          const meshBaseName = extractBaseName(meshName);
          const meshNameLower = meshName.toLowerCase();
          
          // Match by base name (most important - groups all variations)
          const baseNameMatches = meshBaseName === partBaseName || 
                                  meshBaseName === partName ||
                                  partBaseName === meshBaseName;
          
          // Also check direct name matching
          const directMatches = 
            meshNameLower === partName ||
            meshNameLower.includes(partName) ||
            partName.includes(meshNameLower);
          
          // Word-based matching for variations
          const wordMatches = meshNameLower.split(/[\s_-]+/).some(word => 
            partName.split(/[\s_-]+/).some(pword => 
              word === pword || word.includes(pword) || pword.includes(word)
            )
          );
          
          if (baseNameMatches || directMatches || wordMatches) {
            matchingUUIDs.add(child.uuid);
          }
        }
      });
      
      // Strategy 3: Match by display name from meshInfo (fallback)
      meshInfo.forEach(m => {
        const displayLower = m.displayName.toLowerCase();
        const nameLower = m.name.toLowerCase();
        const nameBaseName = extractBaseName(m.name);
        const displayBaseName = extractBaseName(m.displayName);
        
        if (displayLower === partName || 
            nameLower === partName ||
            displayBaseName === partBaseName ||
            nameBaseName === partBaseName ||
            displayLower.includes(partName) ||
            nameLower.includes(partName) ||
            partName.includes(displayLower) ||
            partName.includes(nameLower)) {
          matchingUUIDs.add(m.uuid);
        }
      });

      // Step 2: Apply color to ALL UUIDs found (this is the key - same color to all matching UUIDs)
      if (matchingUUIDs.size > 0) {
        const uuidArray = Array.from(matchingUUIDs);
        console.log(`   📍 Found ${uuidArray.length} UUID(s) matching "${mapping.partName}":`);
        
        uuidArray.forEach((uuid) => {
          // Apply color using UUID (generic - works for any mesh)
          // Clear texture tint when AI applies color to ensure visibility
          const currentCustomization = useAppStore.getState().meshCustomizations[uuid] || {};
          updateMeshCustomization(uuid, { 
            color: color,
            // Keep texture if exists, but clear tint so AI color is visible
            texture: currentCustomization.texture,
            normalMap: currentCustomization.normalMap,
            roughnessMap: currentCustomization.roughnessMap,
            textureTint: undefined, // Clear tint so AI color shows
          });
          
          // Get mesh info for logging
          const meshInfoMatch = meshInfo.find(m => m.uuid === uuid);
          const meshName = meshInfoMatch?.name || 'Unknown';
          const displayName = meshInfoMatch?.displayName || meshName;
          
          console.log(`      ✅ Applied ${color} to UUID: ${uuid.substring(0, 8)}... (${displayName})`);
          appliedCount++;
        });
        
        console.log(`   ✨ Successfully applied ${color} to ${uuidArray.length} mesh(es) via UUID`);
      } else {
        console.warn(`   ❌ Could not find any mesh for part: "${mapping.partName}"`);
        console.warn(`   Available unique mesh names: ${Array.from(new Set(meshInfo.map(m => m.name))).join(', ')}`);
        failedParts.push(mapping.partName);
      }
    });

    // Ensure all meshes get a color - apply default/theme color to unmatched parts
    if (appliedCount < meshInfo.length && mappings.length > 0) {
      const unmatchedMeshes = meshInfo.filter(mesh => {
        // Check if this mesh was already colored
        return !mappings.some(mapping => {
          const partLower = mapping.partName.toLowerCase();
          const displayLower = mesh.displayName.toLowerCase();
          const nameLower = mesh.name.toLowerCase();
          return displayLower === partLower || 
                 nameLower === partLower ||
                 displayLower.includes(partLower) ||
                 partLower.includes(displayLower);
        });
      });

      if (unmatchedMeshes.length > 0) {
        // Get a theme color from the AI response (use the most common or first color)
        const themeColor = mappings[0]?.color || '#808080';
        
        unmatchedMeshes.forEach(mesh => {
          updateMeshCustomization(mesh.uuid, { color: themeColor });
          console.log(`🎨 Applied theme color ${themeColor} to unmatched part: ${mesh.displayName || mesh.name}`);
        });
        
        console.log(`\n🎨 Applied theme color to ${unmatchedMeshes.length} additional parts`);
      }
    }

    // Log comprehensive summary
    console.log(`\n╔══════════════════════════════════════════════════════════╗`);
    console.log(`║     AI COLOR APPLICATION SUMMARY                        ║`);
    console.log(`╠══════════════════════════════════════════════════════════╣`);
    console.log(`║  Total Parts in Model: ${meshInfo.length.toString().padEnd(38)} ║`);
    console.log(`║  Colors from AI: ${mappings.length.toString().padEnd(42)} ║`);
    console.log(`║  Successfully Applied: ${appliedCount.toString().padEnd(39)} ║`);
    console.log(`║  Total Parts Colored: ${meshInfo.length.toString().padEnd(38)} ║`);
    if (failedParts.length > 0) {
      console.log(`║  ⚠️  Failed to Match: ${failedParts.length.toString().padEnd(38)} ║`);
      console.log(`║     ${failedParts.join(', ').substring(0, 50).padEnd(50)} ║`);
    }
    console.log(`╚══════════════════════════════════════════════════════════╝`);
    
    // Show which parts got which colors
    console.log('\n📋 Applied Colors:');
    const { meshCustomizations } = useAppStore.getState();
    meshInfo.forEach(mesh => {
      const customization = meshCustomizations[mesh.uuid];
      if (customization?.color) {
        console.log(`   ✅ ${(mesh.displayName || mesh.name).padEnd(30)} → ${customization.color}`);
      }
    });
  };

  // Keep the original handleApply for manual apply button (if needed)
  const handleApply = () => {
    if (!aiResponse || !gltfModel) {
      return;
    }

    const discovery = getMeshDiscovery();
    if (!discovery) {
      setError('Model not loaded. Please wait for the model to load.');
      return;
    }

    handleApplyColors(aiResponse.mappings);

    if (onApply) {
      onApply();
    }

    // Clear after applying
    setTimeout(() => {
      setPrompt('');
      setAiResponse(null);
    }, 2000);
  };

  const examplePrompts = [
    'hulk style shoes',
    'make it red and white',
    'batman themed design',
    'ocean blue color scheme',
    'sunset gradient colors',
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={20} className="text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-800">AI Design Prompt</h3>
      </div>

      {/* Prompt Input */}
      <div className="space-y-2">
        <label className="text-sm text-gray-600">Describe your design</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="e.g., hulk style shoes, batman themed, ocean blue"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            onClick={handleSubmit}
            disabled={!prompt.trim() || isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>AI Thinking...</span>
              </>
            ) : (
              <>
                <Send size={16} />
                <span>Generate</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Example Prompts */}
      <div className="space-y-2">
        <p className="text-xs text-gray-500">Example prompts:</p>
        <div className="flex flex-wrap gap-2">
          {examplePrompts.map((example, index) => (
            <button
              key={index}
              onClick={() => {
                setPrompt(example);
              }}
              disabled={isLoading}
              className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors disabled:opacity-50"
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="text-red-600" />
            <span className="text-sm text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* AI Response */}
      {aiResponse && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle size={18} className="text-green-600" />
            <span className="font-semibold text-green-800">AI Design Applied Automatically!</span>
          </div>
          
          {aiResponse.description && (
            <p className="text-sm text-gray-700 mb-3 italic">"{aiResponse.description}"</p>
          )}
          
          {/* Color Mappings */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Applied Colors:</p>
            {aiResponse.mappings.map((mapping, index) => (
              <div key={index} className="flex items-center gap-2 text-sm bg-white p-2 rounded">
                <span className="font-medium text-gray-700 capitalize flex-1">
                  {mapping.partName}:
                </span>
                <div
                  className="w-6 h-6 rounded border-2 border-gray-300"
                  style={{ backgroundColor: mapping.color }}
                />
                <span className="text-gray-600">{mapping.color}</span>
                {mapping.reason && (
                  <span className="text-xs text-gray-500 ml-2">({mapping.reason})</span>
                )}
              </div>
            ))}
          </div>
          
          <p className="text-xs text-gray-500 mt-3 italic">
            Colors have been applied to your model. Check the 3D view to see the changes!
          </p>
        </div>
      )}

      {/* Help Text */}
      <div className="text-xs text-gray-500 space-y-1">
        <p className="font-medium">Available parts:</p>
        <p className="text-gray-400">
          {meshInfo.length > 0 
            ? meshInfo.map(m => m.displayName || m.name).join(', ')
            : 'Loading mesh information...'
          }
        </p>
        <p className="text-gray-400 mt-2">
          💡 Tip: Describe the style or theme you want (e.g., "hulk style", "batman themed", "ocean colors")
        </p>
      </div>
    </div>
  );
}

export default PromptWriter;
