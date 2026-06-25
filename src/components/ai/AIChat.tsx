import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { getDesignFromAI, AIColorMapping, ConversationContext } from '../../services/aiService';
import { discoverTextures, TextureSet } from '../../utils/textureDiscovery';
import { findMeshByName, findAllMeshesByName, extractBaseName } from '../../utils/meshDiscovery';
import * as THREE from 'three';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  mappings?: AIColorMapping[];
  description?: string;
}

interface AIChatProps {
  onApply?: () => void;
}

function AIChat({ onApply }: AIChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { updateMeshCustomization, gltfModel, meshInfo, meshCustomizations } = useAppStore();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Get available textures
  const [availableTextures, setAvailableTextures] = useState<TextureSet[]>([]);
  
  useEffect(() => {
    discoverTextures().then(textures => {
      setAvailableTextures(textures);
    });
  }, []);

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

  // Utility to lighten a color
  const lightenColor = (hex: string, percent: number = 0.3): string => {
    // Remove # if present
    hex = hex.replace('#', '');
    
    // Parse RGB
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    // Lighten by blending with white
    const newR = Math.round(r + (255 - r) * percent);
    const newG = Math.round(g + (255 - g) * percent);
    const newB = Math.round(b + (255 - b) * percent);
    
    // Convert back to hex
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  };

  // Check if prompt mentions texture or color keywords
  const hasTextureKeywords = (text: string): boolean => {
    const textureKeywords = ['texture', 'material', 'fabric', 'leather', 'suede', 'canvas', 'mesh'];
    const lowerText = text.toLowerCase();
    return textureKeywords.some(keyword => lowerText.includes(keyword));
  };

  const hasColorKeywords = (text: string): boolean => {
    const colorKeywords = ['color', 'colour', 'tint', 'shade', 'hue'];
    const lowerText = text.toLowerCase();
    return colorKeywords.some(keyword => lowerText.includes(keyword));
  };

  // Detect if user is asking for design changes vs casual conversation
  const isDesignRequest = (text: string): boolean => {
    const lowerText = text.toLowerCase().trim();
    
    // Casual greetings and questions (don't apply changes)
    const casualPhrases = [
      'hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening',
      'how are you', 'what can you do', 'help', 'thanks', 'thank you',
      'what', 'how', 'why', 'when', 'where', 'who',
      '?', 'explain', 'tell me', 'describe', 'show me'
    ];
    
    // Check if it's just a casual phrase
    if (casualPhrases.some(phrase => lowerText === phrase || lowerText.startsWith(phrase + ' ') || lowerText.endsWith(' ' + phrase))) {
      return false;
    }
    
    // Design request keywords
    const designKeywords = [
      'make', 'change', 'apply', 'set', 'use', 'create', 'design', 'customize',
      'color', 'colour', 'texture', 'material', 'fabric', 'leather',
      'red', 'blue', 'green', 'black', 'white', 'yellow', 'purple', 'pink',
      'hulk', 'batman', 'ocean', 'sunset', 'forest', 'nature',
      'style', 'theme', 'look', 'appearance'
    ];
    
    // Check if it contains design-related keywords
    return designKeywords.some(keyword => lowerText.includes(keyword));
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    if (meshInfo.length === 0) {
      const errorMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Model not loaded yet. Please wait for the model to load.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const userPrompt = input.trim();
      const isDesignChange = isDesignRequest(userPrompt);
      
      // Get available part names
      const availableParts = meshInfo.map(m => m.displayName || m.name);
      
      if (isDesignChange) {
        // Build conversation context from history and current state
        const conversationHistory = messages
          .slice(-5) // Last 5 messages for context
          .map(msg => `${msg.role}: ${msg.content}`);
        
        // Get current customizations state
        const currentCustomizations: { [meshId: string]: { color?: string; texture?: string } } = {};
        Object.entries(meshCustomizations).forEach(([meshId, customization]) => {
          currentCustomizations[meshId] = {
            color: customization.color,
            texture: customization.texture,
          };
        });
        
        // Get previous mappings from last assistant message
        const lastAssistantMessage = [...messages].reverse().find(msg => msg.role === 'assistant' && msg.mappings);
        const previousMappings = lastAssistantMessage?.mappings;
        
        const context: ConversationContext = {
          conversationHistory,
          currentCustomizations,
          previousMappings,
        };
        
        // User is asking for design changes - process with AI
        const response = await getDesignFromAI(
          userPrompt,
          availableParts,
          availableTextures,
          context
        );

        if (response.success) {
          // Check if this is a relative change request
          const isRelativeChangeRequest = /darker|lighter|brighter|more dark|more light|more bright/i.test(userPrompt);
          
          if (isRelativeChangeRequest && response.mappings.length === 0) {
            // Handle relative changes - modify existing colors
            handleRelativeChanges(userPrompt, context);
            
            const assistantMessage: ChatMessage = {
              id: (Date.now() + 1).toString(),
              role: 'assistant',
              content: response.description || 'I\'ve adjusted the colors as requested!',
              timestamp: new Date(),
              mappings: [],
              description: response.description,
            };
            
            setMessages(prev => [...prev, assistantMessage]);
          } else {
            // Normal design changes
            let assistantContent = response.description || 'I\'ve applied your design changes!';
            
            // Add friendly message about what was done
            if (hasTextureKeywords(userPrompt)) {
              assistantContent += ' I\'ve applied textures with lighter tints to match your request.';
            } else if (hasColorKeywords(userPrompt)) {
              assistantContent += ' I\'ve applied colors to all parts of your design.';
            } else {
              assistantContent += ' Check out the 3D view to see your customized design!';
            }

            const assistantMessage: ChatMessage = {
              id: (Date.now() + 1).toString(),
              role: 'assistant',
              content: assistantContent,
              timestamp: new Date(),
              mappings: response.mappings,
              description: response.description,
            };

            setMessages(prev => [...prev, assistantMessage]);

            // Automatically apply changes only when design is requested
            setTimeout(() => {
              handleApplyChanges(response.mappings, userPrompt);
            }, 100);
          }
        } else {
          const errorMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: `Sorry, I encountered an error: ${response.error || 'Unknown error'}. Please try again.`,
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, errorMessage]);
        }
      } else {
        // Casual conversation - respond conversationally without applying changes
        const casualResponse = getCasualResponse(userPrompt, availableParts, availableTextures);
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: casualResponse,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error: any) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Sorry, something went wrong: ${error.message || 'Unknown error'}. Please try again.`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle relative color changes (darker, lighter, brighter)
  const handleRelativeChanges = (prompt: string, context: ConversationContext) => {
    if (!gltfModel || !context.currentCustomizations) return;
    
    const promptLower = prompt.toLowerCase();
    const discovery = getMeshDiscovery();
    if (!discovery) return;
    
    // Detect change type
    let changeType: 'darker' | 'lighter' | 'brighter' | null = null;
    let colorFilter: string | undefined = undefined;
    
    if (promptLower.includes('darker') || promptLower.includes('more dark') || promptLower.includes('darken')) {
      changeType = 'darker';
      const colorMatch = promptLower.match(/(?:make|change|the)\s+(?:the\s+)?(red|blue|green|yellow|purple|pink|orange|black|white|gray|grey)\s+/);
      colorFilter = colorMatch ? colorMatch[1] : undefined;
    } else if (promptLower.includes('lighter') || promptLower.includes('more light') || promptLower.includes('lighten')) {
      changeType = 'lighter';
      const colorMatch = promptLower.match(/(?:make|change|the)\s+(?:the\s+)?(red|blue|green|yellow|purple|pink|orange|black|white|gray|grey)\s+/);
      colorFilter = colorMatch ? colorMatch[1] : undefined;
    } else if (promptLower.includes('brighter') || promptLower.includes('more bright')) {
      changeType = 'brighter';
      const colorMatch = promptLower.match(/(?:make|change|the)\s+(?:the\s+)?(red|blue|green|yellow|purple|pink|orange|black|white|gray|grey)\s+/);
      colorFilter = colorMatch ? colorMatch[1] : undefined;
    }
    
    if (!changeType) return;
    
    // Color filter map for matching
    const filterColorMap: { [key: string]: string[] } = {
      'red': ['#FF0000', '#8B0000', '#DC143C', '#B22222', '#FF6B6B'],
      'green': ['#00FF00', '#32CD32', '#228B22', '#90EE90', '#4ECDC4'],
      'blue': ['#0000FF', '#4169E1', '#1E90FF', '#00BFFF', '#45B7D1'],
      'yellow': ['#FFFF00', '#FFD700', '#FFA500', '#FF8C00', '#F7DC6F'],
      'purple': ['#800080', '#9370DB', '#BA55D3', '#8A2BE2'],
      'pink': ['#FF69B4', '#FF1493', '#FFC0CB', '#FFB6C1'],
      'orange': ['#FFA500', '#FF8C00', '#FF6347', '#FF4500', '#FFA07A'],
      'black': ['#000000', '#1C1C1C', '#2F2F2F', '#363636'],
      'white': ['#FFFFFF', '#F5F5F5', '#E0E0E0', '#D3D3D3'],
    };
    
    // Apply relative changes to all meshes with customizations
    Object.entries(context.currentCustomizations).forEach(([meshId, customization]) => {
      if (!customization.color) return; // Skip if no color
      
      const currentColor = customization.color;
      let shouldModify = true;
      
      // If color filter specified, check if current color matches
      if (colorFilter) {
        const filterColors = filterColorMap[colorFilter.toLowerCase()] || [];
        shouldModify = filterColors.some(fc => {
          // Simple color similarity check
          const c1 = currentColor.replace('#', '');
          const c2 = fc.replace('#', '');
          const r1 = parseInt(c1.substring(0, 2), 16);
          const g1 = parseInt(c1.substring(2, 4), 16);
          const b1 = parseInt(c1.substring(4, 6), 16);
          const r2 = parseInt(c2.substring(0, 2), 16);
          const g2 = parseInt(c2.substring(2, 4), 16);
          const b2 = parseInt(c2.substring(4, 6), 16);
          
          // Calculate color distance
          const distance = Math.sqrt(
            Math.pow(r1 - r2, 2) + Math.pow(g1 - g2, 2) + Math.pow(b1 - b2, 2)
          ) / (255 * Math.sqrt(3));
          
          return distance < 0.4; // Threshold for color similarity
        });
      }
      
      if (shouldModify) {
        let newColor = currentColor;
        
        if (changeType === 'darker') {
          newColor = darkenColor(currentColor, 0.3);
        } else if (changeType === 'lighter') {
          newColor = lightenColor(currentColor, 0.3);
        } else if (changeType === 'brighter') {
          newColor = lightenColor(currentColor, 0.2);
        }
        
        // Update the mesh customization
        const currentCustomization = useAppStore.getState().meshCustomizations[meshId] || {};
        updateMeshCustomization(meshId, {
          ...currentCustomization,
          color: newColor,
        });
        
        console.log(`🎨 Applied relative change to mesh ${meshId.substring(0, 8)}: ${currentColor} → ${newColor}`);
      }
    });
  };

  const handleApplyChanges = async (mappings: AIColorMapping[], prompt: string) => {
    if (!gltfModel) {
      console.warn('❌ handleApplyChanges: gltfModel is null');
      return;
    }

    const discovery = getMeshDiscovery();
    if (!discovery) {
      console.warn('❌ handleApplyChanges: discovery is null');
      return;
    }

    console.log('🎨 handleApplyChanges called:', {
      mappingsCount: mappings.length,
      mappings: mappings,
      prompt: prompt,
      meshInfoCount: meshInfo.length,
    });

    const useTextures = hasTextureKeywords(prompt);
    // Always allow colors to be applied - textures are optional
    const useColors = true; // Always apply colors, even if textures are mentioned
    
    console.log('🎨 Application settings:', {
      useTextures,
      useColors,
      availableTexturesCount: availableTextures.length,
      mappingsCount: mappings.length,
    });

    // If texture keywords present, select appropriate textures
    let selectedTextures: Map<string, TextureSet> = new Map();
    if (useTextures && availableTextures.length > 0) {
      // First, check if there's a common texture name across all mappings
      const commonTextureName = mappings.length > 0 && mappings[0].textureName 
        ? mappings[0].textureName 
        : null;
      
      // Use texture names from AI response if provided
      mappings.forEach((mapping, index) => {
        if (mapping.textureName) {
          // Try exact match first
          let texture = availableTextures.find(t => 
            t.name.toLowerCase() === mapping.textureName!.toLowerCase()
          );
          
          // If not found, try partial match (e.g., "crocodile" matches "crocodile leather")
          if (!texture) {
            const textureNameLower = mapping.textureName.toLowerCase();
            texture = availableTextures.find(t => {
              const tNameLower = t.name.toLowerCase();
              return tNameLower.includes(textureNameLower) || textureNameLower.includes(tNameLower);
            });
          }
          
          // If still not found, try word-based matching
          if (!texture) {
            const textureWords = mapping.textureName.toLowerCase().split(/[\s_-]+/);
            texture = availableTextures.find(t => {
              const tNameLower = t.name.toLowerCase();
              return textureWords.some(word => word.length > 3 && tNameLower.includes(word));
            });
          }
          
          if (texture) {
            selectedTextures.set(mapping.partName.toLowerCase(), texture);
            console.log(`  📦 Found texture "${texture.name}" for part "${mapping.partName}" (matched "${mapping.textureName}")`);
          } else {
            // Fallback: use index-based selection
            const textureIndex = index % availableTextures.length;
            selectedTextures.set(mapping.partName.toLowerCase(), availableTextures[textureIndex]);
            console.log(`  📦 Using fallback texture "${availableTextures[textureIndex].name}" for part "${mapping.partName}" (could not find "${mapping.textureName}")`);
          }
        } else if (useTextures && commonTextureName) {
          // If one mapping has a texture name, use it for all parts
          let texture = availableTextures.find(t => 
            t.name.toLowerCase().includes(commonTextureName.toLowerCase())
          );
          if (texture) {
            selectedTextures.set(mapping.partName.toLowerCase(), texture);
          } else {
            const textureIndex = index % availableTextures.length;
            selectedTextures.set(mapping.partName.toLowerCase(), availableTextures[textureIndex]);
          }
        } else if (useTextures) {
          // If textures are requested but not specified, use index-based selection
          const textureIndex = index % availableTextures.length;
          selectedTextures.set(mapping.partName.toLowerCase(), availableTextures[textureIndex]);
          console.log(`  📦 Using default texture "${availableTextures[textureIndex].name}" for part "${mapping.partName}"`);
        }
      });
    }

    // Apply changes to meshes
    let totalApplied = 0;
    mappings.forEach((mapping) => {
      const partName = mapping.partName.toLowerCase().trim();
      const matchingUUIDs = new Set<string>();
      const partBaseName = extractBaseName(partName);

      console.log(`\n🔍 Processing mapping: "${mapping.partName}" → Color: ${mapping.color}${mapping.textureName ? `, Texture: ${mapping.textureName}` : ''}`);

      // Find matching meshes
      const discoveryMatches = findAllMeshesByName(discovery, partName);
      discoveryMatches.forEach(meshInfo => {
        matchingUUIDs.add(meshInfo.uuid);
        console.log(`  ✅ Found via discovery: ${meshInfo.displayName || meshInfo.name} (${meshInfo.uuid.substring(0, 8)}...)`);
      });

      gltfModel.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const meshName = child.name || '';
          const meshBaseName = extractBaseName(meshName);
          const meshNameLower = meshName.toLowerCase();
          const foundMeshInfo = meshInfo.find(m => m.uuid === child.uuid);
          const meshDisplayName = foundMeshInfo?.displayName || meshName;
          const meshDisplayNameLower = meshDisplayName.toLowerCase();
          
          const baseNameMatches = meshBaseName === partBaseName || 
                                  meshBaseName === partName ||
                                  partBaseName === meshBaseName;
          
          const directMatches = 
            meshNameLower === partName ||
            meshDisplayNameLower === partName ||
            meshNameLower.includes(partName) ||
            meshDisplayNameLower.includes(partName) ||
            partName.includes(meshNameLower) ||
            partName.includes(meshDisplayNameLower);
          
          if (baseNameMatches || directMatches) {
            matchingUUIDs.add(child.uuid);
            console.log(`  ✅ Found via traversal: ${meshDisplayName} (${child.uuid.substring(0, 8)}...)`);
          }
        }
      });

      console.log(`  📊 Total UUIDs found for "${mapping.partName}": ${matchingUUIDs.size}`);

      // Apply to all matching UUIDs
      matchingUUIDs.forEach((uuid) => {
        const currentCustomization = useAppStore.getState().meshCustomizations[uuid] || {};
        
        // Handle REMOVE actions
        if (mapping.removeTexture || mapping.removeColor) {
          const updates: any = { ...currentCustomization };
          
          if (mapping.removeTexture) {
            console.log(`  🗑️ Removing texture from UUID: ${uuid.substring(0, 8)}...`);
            updates.texture = undefined;
            updates.normalMap = undefined;
            updates.roughnessMap = undefined;
            updates.metalnessMap = undefined;
            updates.aoMap = undefined;
            updates.displacementMap = undefined;
            updates.textureTint = undefined;
          }
          
          if (mapping.removeColor) {
            console.log(`  🗑️ Removing color from UUID: ${uuid.substring(0, 8)}...`);
            updates.color = undefined;
          }
          
          updateMeshCustomization(uuid, updates);
          totalApplied++;
          return;
        }
        
        // Handle ADD/CHANGE actions
        // Priority: If texture is specified and available, apply texture with color tint
        // Otherwise, apply color only
        if (useTextures && selectedTextures.has(partName)) {
          // Apply texture with lighter tint
          const texture = selectedTextures.get(partName)!;
          const lighterTint = mapping.color ? lightenColor(mapping.color, 0.4) : '#FFFFFF'; // 40% lighter or white
          
          console.log(`  🎨 ${mapping.action || 'Applying'} texture "${texture.name}" with tint ${lighterTint} to UUID: ${uuid.substring(0, 8)}...`);
          
          updateMeshCustomization(uuid, {
            ...currentCustomization,
            texture: texture.diffuse,
            normalMap: texture.normal,
            roughnessMap: texture.roughness,
            metalnessMap: texture.metalness,
            aoMap: texture.ao,
            displacementMap: texture.height,
            textureTint: lighterTint, // Lighter tint
            color: undefined, // Clear color when texture is applied
          });
          totalApplied++;
        } else if (mapping.color) {
          // Apply color only
          console.log(`  🎨 ${mapping.action || 'Applying'} color ${mapping.color} to UUID: ${uuid.substring(0, 8)}...`);
          
          updateMeshCustomization(uuid, {
            ...currentCustomization,
            color: mapping.color,
            // Only clear texture if explicitly changing (not adding to existing)
            ...(mapping.action === 'change' && !useTextures ? { texture: undefined, textureTint: undefined } : {}),
          });
          totalApplied++;
        }
      });
    });

    console.log(`\n✅ Total customizations applied: ${totalApplied} out of ${mappings.length} mappings`);

    if (onApply) {
      onApply();
    }
  };

  // Generate conversational response for casual chat
  const getCasualResponse = (prompt: string, availableParts: string[], availableTextures: TextureSet[]): string => {
    const lowerPrompt = prompt.toLowerCase();
    
    // Greetings
    if (/^(hi|hello|hey|good morning|good afternoon|good evening)/i.test(prompt)) {
      return `Hello! 👋 I'm your AI design assistant. How can I help you customize your design today?`;
    }
    
    // Help requests
    if (/help|what can you do|how|what/i.test(lowerPrompt)) {
      const textureList = availableTextures.slice(0, 10).map(t => t.name).join(', ');
      return `I can help you customize your design! Here's what I can do:

🎨 **Colors**: Tell me colors you want (e.g., "make it red and blue", "hulk style")
🖼️ **Textures**: Ask for textures (e.g., "apply leather texture", "use only 2 textures")
🎯 **Themes**: Request themes (e.g., "batman style", "ocean colors")
📊 **Smart Selection**: I understand quantities (e.g., "use only two textures", "apply 3 materials")
🔄 **Relative Changes**: I remember context! Try "make it darker" or "make green lighter"

**Available parts**: ${availableParts.length} parts
${availableParts.length <= 10 ? `(${availableParts.join(', ')})` : `(${availableParts.slice(0, 5).join(', ')}, ...)`}

**Available textures**: ${availableTextures.length} textures
${availableTextures.length <= 10 ? `(${textureList})` : `(${textureList}, ...)`}

Just tell me what you'd like to change!`;
    }
    
    // Thanks
    if (/thank|thanks/i.test(lowerPrompt)) {
      return `You're welcome! 😊 Feel free to ask me to customize your design anytime.`;
    }
    
    // Default casual response
    return `Hi! I'm here to help you customize your design. What would you like to change?`;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={`fixed left-4 bottom-4 z-50 flex flex-col ${isMinimized ? 'w-80' : 'w-96'} bg-white rounded-lg shadow-2xl transition-all duration-300`}>
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg cursor-pointer"
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <div className="flex items-center gap-2">
          <Sparkles size={20} />
          <h3 className="font-semibold">AI Design Assistant</h3>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsMinimized(!isMinimized);
          }}
          className="text-white hover:text-gray-200 transition-colors"
        >
          {isMinimized ? '↑' : '↓'}
        </button>
      </div>

      {/* Chat Messages */}
      {!isMinimized && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-96 bg-gray-50">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <Bot size={32} className="mx-auto mb-2 text-gray-400" />
              <p className="text-sm">Start chatting with AI to customize your design!</p>
            </div>
          ) : (
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                      <Bot size={16} className="text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-800 border border-gray-200'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className={`text-xs mt-1 ${message.role === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {message.role === 'user' && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center">
                      <User size={16} className="text-white" />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          )}
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                <Bot size={16} className="text-white" />
              </div>
              <div className="bg-white border border-gray-200 rounded-lg px-4 py-2">
                <Loader2 size={16} className="animate-spin text-blue-600" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Input Area */}
      {!isMinimized && (
        <div className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
          {/* Welcome Suggestions - Only show before first message */}
          {messages.length === 0 && (
            <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs font-medium text-blue-900 mb-2">💡 Try saying:</p>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• "use only two textures for this shoe"</li>
                <li>• "make the upper red and sole blue"</li>
                <li>• "apply leather texture to the body"</li>
              </ul>
            </div>
          )}
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Describe your design..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AIChat;

