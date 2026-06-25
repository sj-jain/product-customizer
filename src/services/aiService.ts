/**
 * AI Service for Design Suggestions
 * 
 * Uses intelligent local response generation (no API keys required)
 * Analyzes prompts and generates appropriate color/texture mappings
 */

import { TextureSet } from '../utils/textureDiscovery';

export interface AIColorMapping {
  partName: string;  // e.g., "upper", "sole", "laces"
  color?: string;     // Hex color code (optional - can be removed)
  reason?: string;   // Why this color was chosen
  textureName?: string; // Texture name if texture should be applied
  action?: 'add' | 'remove' | 'change'; // Action to perform
  removeColor?: boolean; // If true, remove color
  removeTexture?: boolean; // If true, remove texture
}

export interface AIResponse {
  success: boolean;
  mappings: AIColorMapping[];
  description?: string;  // Overall design description (user-friendly, no technical details)
  error?: string;
}

export interface ConversationContext {
  previousMappings?: AIColorMapping[];  // Previous design state
  conversationHistory?: string[];       // Recent conversation messages
  currentCustomizations?: { [meshId: string]: { color?: string; texture?: string } }; // Current state
}

/**
 * Generate intelligent design response locally based on prompt analysis
 * This works without any API and provides good results
 * Now supports conversation context and relative changes
 */
export async function getDesignFromAI(
  prompt: string,
  availableParts: string[],
  availableTextures: TextureSet[] = [],
  context?: ConversationContext
): Promise<AIResponse> {
  try {
    // Use intelligent local response generation (works without API)
    return generateIntelligentResponse(prompt, availableParts, availableTextures, context);
  } catch (error: any) {
    console.error('AI Service Error:', error);
    return {
      success: false,
      mappings: [],
      error: error.message || 'Failed to generate design suggestions',
    };
  }
}

/**
 * Extract number from text (e.g., "two textures" -> 2, "only 3" -> 3)
 */
function extractNumber(text: string): number | null {
  const numberWords: { [key: string]: number } = {
    'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
    'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
    '1': 1, '2': 2, '3': 3, '4': 4, '5': 5,
    '6': 6, '7': 7, '8': 8, '9': 9, '10': 10
  };
  
  const lowerText = text.toLowerCase();
  
  // Check for number words
  for (const [word, num] of Object.entries(numberWords)) {
    if (lowerText.includes(` ${word} `) || lowerText.includes(` ${word},`) || 
        lowerText.startsWith(`${word} `) || lowerText.endsWith(` ${word}`)) {
      return num;
    }
  }
  
  // Check for numeric patterns
  const numericMatch = lowerText.match(/(\d+)\s*(?:texture|material|fabric|color|part)/i);
  if (numericMatch) {
    return parseInt(numericMatch[1], 10);
  }
  
  return null;
}

/**
 * Extract which parts user wants to customize from prompt
 */
function extractPartNames(prompt: string, availableParts: string[]): string[] {
  const promptLower = prompt.toLowerCase();
  const mentionedParts: string[] = [];
  
  // Check each available part to see if it's mentioned
  availableParts.forEach(part => {
    const partLower = part.toLowerCase();
    const partWords = partLower.split(/[\s_-]+/);
    
    // Check if any word from part name is mentioned
    partWords.forEach(word => {
      if (word.length > 2 && promptLower.includes(word)) {
        mentionedParts.push(part);
      }
    });
    
    // Also check full part name
    if (promptLower.includes(partLower)) {
      if (!mentionedParts.includes(part)) {
        mentionedParts.push(part);
      }
    }
  });
  
  return mentionedParts;
}

/**
 * Darken a color by blending with black
 */
function darkenColor(hex: string, percent: number = 0.3): string {
  hex = hex.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  const newR = Math.round(r * (1 - percent));
  const newG = Math.round(g * (1 - percent));
  const newB = Math.round(b * (1 - percent));
  
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}

/**
 * Check if a color is similar to a target color (for selective changes)
 */
function isColorSimilar(color1: string, color2: string, threshold: number = 0.3): boolean {
  const c1 = color1.replace('#', '');
  const c2 = color2.replace('#', '');
  
  const r1 = parseInt(c1.substring(0, 2), 16);
  const g1 = parseInt(c1.substring(2, 4), 16);
  const b1 = parseInt(c1.substring(4, 6), 16);
  
  const r2 = parseInt(c2.substring(0, 2), 16);
  const g2 = parseInt(c2.substring(2, 4), 16);
  const b2 = parseInt(c2.substring(4, 6), 16);
  
  // Calculate color distance (normalized)
  const distance = Math.sqrt(
    Math.pow(r1 - r2, 2) + Math.pow(g1 - r2, 2) + Math.pow(b1 - b2, 2)
  ) / (255 * Math.sqrt(3));
  
  return distance < threshold;
}

/**
 * Detect if prompt is asking for relative changes (darker, lighter, brighter, etc.)
 */
function isRelativeChange(prompt: string): { type: 'darker' | 'lighter' | 'brighter' | null; colorFilter?: string } {
  const lower = prompt.toLowerCase();
  
  // Check for relative change keywords
  if (lower.includes('darker') || lower.includes('more dark') || lower.includes('darken')) {
    // Check if specific color mentioned
    const colorMatch = lower.match(/(?:make|change|the)\s+(?:the\s+)?(red|blue|green|yellow|purple|pink|orange|black|white|gray|grey)\s+/);
    return { type: 'darker', colorFilter: colorMatch ? colorMatch[1] : undefined };
  }
  
  if (lower.includes('lighter') || lower.includes('more light') || lower.includes('lighten')) {
    const colorMatch = lower.match(/(?:make|change|the)\s+(?:the\s+)?(red|blue|green|yellow|purple|pink|orange|black|white|gray|grey)\s+/);
    return { type: 'lighter', colorFilter: colorMatch ? colorMatch[1] : undefined };
  }
  
  if (lower.includes('brighter') || lower.includes('more bright')) {
    const colorMatch = lower.match(/(?:make|change|the)\s+(?:the\s+)?(red|blue|green|yellow|purple|pink|orange|black|white|gray|grey)\s+/);
    return { type: 'brighter', colorFilter: colorMatch ? colorMatch[1] : undefined };
  }
  
  return { type: null };
}

/**
 * Detect action verbs in prompt (add, remove, change)
 */
function detectAction(prompt: string): { action: 'add' | 'remove' | 'change' | null; target: 'color' | 'texture' | 'all' | null } {
  const lower = prompt.toLowerCase();
  
  // Check for remove
  if (lower.includes('remove') || lower.includes('delete') || lower.includes('clear')) {
    if (lower.includes('texture') || lower.includes('material')) {
      return { action: 'remove', target: 'texture' };
    } else if (lower.includes('color') || lower.includes('colour')) {
      return { action: 'remove', target: 'color' };
    } else {
      return { action: 'remove', target: 'all' };
    }
  }
  
  // Check for add
  if (lower.includes('add') || lower.includes('apply') || lower.includes('put')) {
    if (lower.includes('texture') || lower.includes('material') || lower.includes('leather') || lower.includes('fabric')) {
      return { action: 'add', target: 'texture' };
    } else if (lower.includes('color') || lower.includes('colour') || /red|blue|green|yellow|black|white|purple|pink|orange/i.test(lower)) {
      return { action: 'add', target: 'color' };
    } else {
      return { action: 'add', target: 'all' };
    }
  }
  
  // Check for change
  if (lower.includes('change') || lower.includes('modify') || lower.includes('update') || lower.includes('switch')) {
    if (lower.includes('texture') || lower.includes('material') || lower.includes('leather') || lower.includes('fabric')) {
      return { action: 'change', target: 'texture' };
    } else if (lower.includes('color') || lower.includes('colour')) {
      return { action: 'change', target: 'color' };
    } else if (lower.includes('everything') || lower.includes('all')) {
      return { action: 'change', target: 'all' };
    } else {
      return { action: 'change', target: 'all' }; // Default to change all
    }
  }
  
  return { action: null, target: null };
}

/**
 * Generate intelligent response locally based on prompt analysis
 * This works without any API and provides good results
 * Now includes texture selection logic - intelligently maps textures to parts based on user intent
 * Supports conversation context and relative changes
 */
function generateIntelligentResponse(
  prompt: string,
  availableParts: string[],
  availableTextures: TextureSet[] = [],
  context?: ConversationContext
): AIResponse {
  const mappings: AIColorMapping[] = [];
  const promptLower = prompt.toLowerCase();
  
  // Detect action (add, remove, change)
  const detectedAction = detectAction(prompt);
  console.log('🎯 Detected action:', detectedAction);
  
  // Check if this is a relative change request (darker, lighter, etc.)
  const relativeChange = isRelativeChange(prompt);
  
  // If it's a relative change, modify existing colors instead of creating new ones
  if (relativeChange.type && context?.currentCustomizations) {
    console.log('🔄 Detected relative change:', relativeChange);
    
    // Return special response indicating relative change should be applied
    // The component will handle the actual color modification
    return {
      success: true,
      mappings: [], // Empty mappings - component will handle relative changes
      description: `I'll make the ${relativeChange.colorFilter || 'colors'} ${relativeChange.type}!`,
    };
  }
  
  // Handle REMOVE actions
  if (detectedAction.action === 'remove') {
    if (detectedAction.target === 'texture') {
      // Remove textures from all parts
      availableParts.forEach((part) => {
        mappings.push({
          partName: part.toLowerCase(),
          removeTexture: true,
          action: 'remove',
          reason: 'Remove texture as requested',
        });
      });
      return {
        success: true,
        mappings,
        description: 'I\'ve removed all textures from the design.',
      };
    } else if (detectedAction.target === 'color') {
      // Remove colors from all parts
      availableParts.forEach((part) => {
        mappings.push({
          partName: part.toLowerCase(),
          removeColor: true,
          action: 'remove',
          reason: 'Remove color as requested',
        });
      });
      return {
        success: true,
        mappings,
        description: 'I\'ve removed all colors from the design.',
      };
    } else {
      // Remove everything
      availableParts.forEach((part) => {
        mappings.push({
          partName: part.toLowerCase(),
          removeColor: true,
          removeTexture: true,
          action: 'remove',
          reason: 'Remove all customizations as requested',
        });
      });
      return {
        success: true,
        mappings,
        description: 'I\'ve removed all customizations from the design.',
      };
    }
  }
  
  // Detect if user wants textures - check for texture-related keywords
  // Include specific texture names like "moorland", "grain", etc.
  const wantsTextures = /texture|material|fabric|leather|suede|canvas|mesh|crocodile|calf|weave|moorland|grain/i.test(promptLower);
  
  // Extract specific texture name from prompt (e.g., "crocodile leather", "leather", "fabric", "moorland grain")
  const extractTextureName = (prompt: string, availableTextures: TextureSet[]): string | null => {
    const lower = prompt.toLowerCase();
    
    // First, try to find exact or partial matches in available texture names
    // This handles cases like "add moorland grain" -> finds "Moorland Grain" texture
    for (const texture of availableTextures) {
      const textureNameLower = texture.name.toLowerCase();
      
      // Check if the entire texture name is mentioned (e.g., "moorland grain")
      if (lower.includes(textureNameLower)) {
        return texture.name;
      }
      
      // Check if texture name or parts of it are mentioned in prompt
      const textureWords = textureNameLower.split(/[\s_-]+/);
      const promptWords = lower.split(/[\s_-]+/);
      
      // Check if all significant words from texture name are in prompt
      const significantWords = textureWords.filter(word => word.length > 2);
      const matchingWords = significantWords.filter(word => 
        promptWords.some(pword => pword.includes(word) || word.includes(pword))
      );
      
      // If most significant words match, it's likely the right texture
      if (significantWords.length > 0 && matchingWords.length >= Math.ceil(significantWords.length * 0.7)) {
        return texture.name;
      }
      
      // Also check individual words (for cases like "moorland" matching "Moorland Grain")
      if (textureWords.some(word => word.length > 3 && lower.includes(word))) {
        return texture.name;
      }
    }
    
    // Check for generic texture types (fallback)
    if (lower.includes('crocodile')) {
      const crocodileTexture = availableTextures.find(t => t.name.toLowerCase().includes('crocodile'));
      if (crocodileTexture) return crocodileTexture.name;
      return 'crocodile';
    }
    if (lower.includes('leather') && !lower.includes('crocodile')) {
      const leatherTexture = availableTextures.find(t => t.name.toLowerCase().includes('leather'));
      if (leatherTexture) return leatherTexture.name;
      return 'leather';
    }
    if (lower.includes('fabric')) {
      const fabricTexture = availableTextures.find(t => t.name.toLowerCase().includes('fabric'));
      if (fabricTexture) return fabricTexture.name;
      return 'fabric';
    }
    if (lower.includes('suede')) {
      const suedeTexture = availableTextures.find(t => t.name.toLowerCase().includes('suede'));
      if (suedeTexture) return suedeTexture.name;
      return 'suede';
    }
    if (lower.includes('canvas')) {
      const canvasTexture = availableTextures.find(t => t.name.toLowerCase().includes('canvas'));
      if (canvasTexture) return canvasTexture.name;
      return 'canvas';
    }
    if (lower.includes('moorland')) {
      const moorlandTexture = availableTextures.find(t => t.name.toLowerCase().includes('moorland'));
      if (moorlandTexture) return moorlandTexture.name;
    }
    if (lower.includes('grain')) {
      const grainTexture = availableTextures.find(t => t.name.toLowerCase().includes('grain'));
      if (grainTexture) return grainTexture.name;
    }
    
    return null;
  };
  
  const requestedTextureName = extractTextureName(prompt, availableTextures);
  
  // Extract number of textures user wants (e.g., "only two textures" -> 2)
  const textureCount = extractNumber(promptLower);
  const maxTextures = textureCount && textureCount > 0 ? Math.min(textureCount, availableTextures.length) : availableTextures.length;
  
  // Extract which specific parts user mentioned
  const mentionedParts = extractPartNames(prompt, availableParts);
  
  // Detect colors from prompt - prioritize explicit color mentions
  let baseColors: string[] = [];
  let explicitColor: string | null = null;
  
  // Check for explicit color mentions first
  if (promptLower.includes('yellow') || promptLower.includes('gold')) {
    explicitColor = '#FFFF00';
    baseColors = ['#FFFF00', '#FFD700', '#FFA500', '#FF8C00'];
  } else if (promptLower.includes('red')) {
    explicitColor = '#FF0000';
    baseColors = ['#FF0000', '#8B0000', '#DC143C', '#B22222'];
  } else if (promptLower.includes('blue')) {
    explicitColor = '#0000FF';
    baseColors = ['#0000FF', '#4169E1', '#1E90FF', '#00BFFF'];
  } else if (promptLower.includes('green')) {
    explicitColor = '#00FF00';
    baseColors = ['#00FF00', '#32CD32', '#228B22', '#90EE90'];
  } else if (promptLower.includes('black') || promptLower.includes('dark')) {
    explicitColor = '#000000';
    baseColors = ['#000000', '#1C1C1C', '#2F2F2F', '#363636'];
  } else if (promptLower.includes('white') || promptLower.includes('light')) {
    explicitColor = '#FFFFFF';
    baseColors = ['#FFFFFF', '#F5F5F5', '#E0E0E0', '#D3D3D3'];
  } else if (promptLower.includes('purple')) {
    explicitColor = '#800080';
    baseColors = ['#800080', '#9370DB', '#BA55D3', '#8A2BE2'];
  } else if (promptLower.includes('pink')) {
    explicitColor = '#FF69B4';
    baseColors = ['#FF69B4', '#FF1493', '#FFC0CB', '#FFB6C1'];
  } else if (promptLower.includes('orange')) {
    explicitColor = '#FFA500';
    baseColors = ['#FFA500', '#FF8C00', '#FF6347', '#FF4500'];
  } else if (promptLower.includes('hulk')) {
    baseColors = ['#00FF00', '#800080', '#4B0082']; // Green, purple, indigo
  } else if (promptLower.includes('batman')) {
    baseColors = ['#000000', '#FFFF00', '#1C1C1C']; // Black, yellow, dark gray
  } else if (promptLower.includes('ocean') || promptLower.includes('sea')) {
    baseColors = ['#0000FF', '#00CED1', '#87CEEB', '#4682B4']; // Blues
  } else if (promptLower.includes('sunset')) {
    baseColors = ['#FF4500', '#FF6347', '#FFD700', '#FF8C00']; // Oranges and gold
  } else if (promptLower.includes('forest') || promptLower.includes('nature')) {
    baseColors = ['#228B22', '#32CD32', '#8B4513', '#556B2F']; // Greens and brown
  } else {
    // If no color mentioned and textures are requested, use neutral colors
    if (wantsTextures) {
      baseColors = ['#FFFFFF', '#F5F5F5', '#E0E0E0']; // Neutral/white for textures
    } else {
      // Default: vibrant colors
      baseColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F'];
    }
  }
  
  // Smart texture selection: Intelligently select and map textures based on user intent
  const selectTextures = (): TextureSet[] => {
    if (!wantsTextures || availableTextures.length === 0) return [];
    
    // If user specified a number, use only that many textures
    const selectedTextures: TextureSet[] = [];
    
    if (maxTextures < availableTextures.length) {
      // User wants limited textures - select diverse ones
      // Try to get different types of textures
      const leatherTextures = availableTextures.filter(t => 
        t.name.toLowerCase().includes('leather') || 
        t.name.toLowerCase().includes('calf') ||
        t.name.toLowerCase().includes('crocodile')
      );
      const fabricTextures = availableTextures.filter(t => 
        t.name.toLowerCase().includes('fabric') ||
        t.name.toLowerCase().includes('weave') ||
        t.name.toLowerCase().includes('moorland')
      );
      const otherTextures = availableTextures.filter(t => 
        !leatherTextures.includes(t) && !fabricTextures.includes(t)
      );
      
      // Select diverse textures
      if (leatherTextures.length > 0 && selectedTextures.length < maxTextures) {
        selectedTextures.push(leatherTextures[0]);
      }
      if (fabricTextures.length > 0 && selectedTextures.length < maxTextures) {
        selectedTextures.push(fabricTextures[0]);
      }
      // Fill remaining slots
      let remaining = maxTextures - selectedTextures.length;
      const allOther = [...leatherTextures.slice(1), ...fabricTextures.slice(1), ...otherTextures];
      for (let i = 0; i < remaining && i < allOther.length; i++) {
        selectedTextures.push(allOther[i]);
      }
      
      // If still not enough, add from all textures
      if (selectedTextures.length < maxTextures) {
        availableTextures.forEach(t => {
          if (selectedTextures.length < maxTextures && !selectedTextures.includes(t)) {
            selectedTextures.push(t);
          }
        });
      }
    } else {
      // Use all textures or a good selection
      selectedTextures.push(...availableTextures.slice(0, Math.min(10, availableTextures.length)));
    }
    
    return selectedTextures.slice(0, maxTextures);
  };
  
  const selectedTextures = selectTextures();
  
  // Check if a part is a sole part (should only get colors, no textures)
  const isSolePart = (partName: string): boolean => {
    const partLower = partName.toLowerCase();
    return partLower.includes('sole') || 
           partLower.includes('outsole') || 
           partLower.includes('midsole') ||
           partLower.includes('bottom') || 
           partLower.includes('base');
  };
  
  // Smart texture-to-part mapping based on user request and part characteristics
  const getTextureForPart = (partName: string, index: number): TextureSet | null => {
    // IMPORTANT: Sole parts should NEVER get textures, only colors
    if (isSolePart(partName)) {
      return null; // No texture for sole parts
    }
    
    if (!wantsTextures || selectedTextures.length === 0) return null;
    
    const partLower = partName.toLowerCase();
    
    // If user requested a specific texture name, try to find and use it
    if (requestedTextureName) {
      const matchingTexture = selectedTextures.find(t => 
        t.name.toLowerCase().includes(requestedTextureName.toLowerCase())
      );
      if (matchingTexture) {
        return matchingTexture; // Use requested texture for all parts
      }
    }
    
    // If user mentioned specific parts, prioritize those
    const isMentioned = mentionedParts.some(p => p.toLowerCase() === partLower);
    
    // Match textures to parts based on part characteristics
    if (partLower.includes('upper') || partLower.includes('body') || partLower.includes('main') || partLower.includes('vamp')) {
      // Upper parts - prefer smoother/main textures
      const mainTextures = selectedTextures.filter(t => 
        !t.name.toLowerCase().includes('rough') &&
        !t.name.toLowerCase().includes('sole')
      );
      if (mainTextures.length > 0) {
        return mainTextures[index % mainTextures.length];
      }
    } else if (partLower.includes('lace') || partLower.includes('string')) {
      // Laces - prefer fabric textures
      const fabricTextures = selectedTextures.filter(t => 
        t.name.toLowerCase().includes('fabric') ||
        t.name.toLowerCase().includes('weave')
      );
      if (fabricTextures.length > 0) {
        return fabricTextures[0]; // Use same texture for all laces
      }
    }
    
    // Default: distribute textures evenly across parts
    // If user mentioned specific parts, give them priority textures
    if (isMentioned && selectedTextures.length > 0) {
      return selectedTextures[0]; // First texture for mentioned parts
    }
    
    return selectedTextures[index % selectedTextures.length];
  };
  
  // Dark colors for soles (realistic sole colors)
  const soleColors = ['#1a1a1a', '#2d2d2d', '#3a3a3a', '#4a4a4a', '#000000', '#1f1f1f']; // Dark grays and black
  
  // Generate mappings for all parts
  availableParts.forEach((part, index) => {
    const partLower = part.toLowerCase();
    const isSole = isSolePart(part);
    
    // For sole parts: use dark colors only, no textures
    let color: string;
    if (isSole) {
      // Sole parts get dark colors
      if (explicitColor) {
        // If explicit color is mentioned, darken it for sole
        color = darkenColor(explicitColor, 0.6); // Make it much darker
      } else {
        // Use dark sole colors
        const soleColorIndex = index % soleColors.length;
        color = soleColors[soleColorIndex];
      }
    } else {
      // Non-sole parts: use explicit color if mentioned, otherwise cycle through base colors
      const colorIndex = index % baseColors.length;
      color = explicitColor || baseColors[colorIndex];
    }
    
    // Get appropriate texture for this part (will be null for sole parts)
    const selectedTexture = getTextureForPart(part, index);
    
    // Determine action
    let action: 'add' | 'remove' | 'change' = detectedAction.action || 'change';
    if (detectedAction.action === null) {
      // If no explicit action, infer from context
      if (context?.currentCustomizations && Object.keys(context.currentCustomizations).length > 0) {
        action = 'change'; // If there are existing customizations, it's a change
      } else {
        action = 'add'; // If no customizations, it's an add
      }
    }
    
    // Lighten colors for texture tints (if textures are requested and part is not sole)
    if (wantsTextures && selectedTexture && !isSole) {
      // If explicit color mentioned, use it as tint; otherwise use neutral
      if (explicitColor) {
        color = lightenColor(color, 0.4); // 40% lighter for texture tints
      } else {
        color = '#FFFFFF'; // White/neutral for textures without color specification
      }
    }
    
    mappings.push({
      partName: partLower,
      color: color,
      textureName: selectedTexture?.name,
      action: action,
      reason: isSole 
        ? `Applied dark color to sole (no texture)` 
        : selectedTexture 
        ? `Applied ${selectedTexture.name} texture` 
        : (explicitColor ? `Applied ${explicitColor} color` : `Matches ${prompt} theme`),
    });
  });
  
  // Generate user-friendly description based on what was requested
  let description = '';
  const actionVerb = detectedAction.action === 'add' ? 'added' : 
                     detectedAction.action === 'remove' ? 'removed' : 
                     detectedAction.action === 'change' ? 'changed' : 'applied';
  
  if (requestedTextureName && wantsTextures) {
    // User requested specific texture
    const textureFound = availableTextures.find(t => 
      t.name.toLowerCase().includes(requestedTextureName.toLowerCase())
    );
    if (textureFound) {
      description = `I've ${actionVerb} ${textureFound.name} texture`;
      if (explicitColor) {
        description += ` with ${explicitColor} tint`;
      }
      description += ' to all parts';
    } else {
      description = `I've ${actionVerb} ${requestedTextureName} texture to all parts`;
    }
  } else if (wantsTextures && selectedTextures.length > 0) {
    if (maxTextures && maxTextures < availableTextures.length) {
      description = `I've ${actionVerb} ${selectedTextures.length} selected texture${selectedTextures.length > 1 ? 's' : ''}`;
    } else {
      const textureCount = mappings.filter(m => m.textureName).length;
      description = `I've ${actionVerb} textures to ${textureCount} parts`;
    }
  } else if (explicitColor) {
    description = `I've ${actionVerb} ${explicitColor} color to all parts`;
  } else if (detectedAction.action === 'change' && promptLower.includes('everything')) {
    description = `I've changed everything as requested`;
  } else {
    description = `I've ${actionVerb} your design changes`;
  }
  
  description += '! Check out the 3D view to see your customized design.';
  
  console.log('🤖 AI Response:', {
    prompt,
    requestedTextureName,
    explicitColor,
    wantsTextures,
    mappingsCount: mappings.length,
    selectedTexturesCount: selectedTextures.length,
  });
  
  return {
    success: true,
    mappings,
    description,
  };
}

/**
 * Lighten a color by blending with white
 */
function lightenColor(hex: string, percent: number = 0.3): string {
  hex = hex.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  const newR = Math.round(r + (255 - r) * percent);
  const newG = Math.round(g + (255 - g) * percent);
  const newB = Math.round(b + (255 - b) * percent);
  
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}

/**
 * Fallback: Parse prompt locally if AI is not available
 */
export function parsePromptLocally(
  prompt: string,
  availableParts: string[]
): AIResponse {
  // This is a fallback - you can use the existing promptParser here
  // For now, return empty response
  return {
    success: false,
    mappings: [],
    error: 'AI service not available',
  };
}
