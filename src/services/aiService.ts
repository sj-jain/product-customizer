/**
 * AI Service for Design Suggestions
 * 
 * Uses intelligent local response generation (no API keys required)
 * Analyzes prompts and generates appropriate color/texture mappings
 */

import { TextureSet } from '../utils/textureDiscovery';

export interface AIColorMapping {
  partName: string;  // e.g., "upper", "sole", "laces"
  color: string;     // Hex color code
  reason?: string;   // Why this color was chosen
  textureName?: string; // Texture name if texture should be applied
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
  
  // Check if this is a relative change request (darker, lighter, etc.)
  const relativeChange = isRelativeChange(prompt);
  
  // If it's a relative change, modify existing colors instead of creating new ones
  if (relativeChange.type && context?.currentCustomizations) {
    console.log('🔄 Detected relative change:', relativeChange);
    
    // Get current state from context - map by part name
    const currentState = context.currentCustomizations;
    
    // Create a map of part names to their current colors
    // We'll need to match parts to mesh UUIDs - this will be done in the component
    // For now, we'll return a special response that indicates relative change
    
    // Return special response indicating relative change should be applied
    // The component will handle the actual color modification
    return {
      success: true,
      mappings: [], // Empty mappings - component will handle relative changes
      description: `I'll make the ${relativeChange.colorFilter || 'colors'} ${relativeChange.type}!`,
    };
  }
  
  // Detect if user wants textures
  const wantsTextures = /texture|material|fabric|leather|suede|canvas|mesh/i.test(promptLower);
  
  // Extract number of textures user wants (e.g., "only two textures" -> 2)
  const textureCount = extractNumber(promptLower);
  const maxTextures = textureCount && textureCount > 0 ? Math.min(textureCount, availableTextures.length) : availableTextures.length;
  
  // Extract which specific parts user mentioned
  const mentionedParts = extractPartNames(prompt, availableParts);
  
  // Detect theme colors from prompt
  let baseColors: string[] = [];
  
  if (promptLower.includes('hulk')) {
    baseColors = ['#00FF00', '#800080', '#4B0082']; // Green, purple, indigo
  } else if (promptLower.includes('batman')) {
    baseColors = ['#000000', '#FFFF00', '#1C1C1C']; // Black, yellow, dark gray
  } else if (promptLower.includes('ocean') || promptLower.includes('sea')) {
    baseColors = ['#0000FF', '#00CED1', '#87CEEB', '#4682B4']; // Blues
  } else if (promptLower.includes('sunset')) {
    baseColors = ['#FF4500', '#FF6347', '#FFD700', '#FF8C00']; // Oranges and gold
  } else if (promptLower.includes('forest') || promptLower.includes('nature')) {
    baseColors = ['#228B22', '#32CD32', '#8B4513', '#556B2F']; // Greens and brown
  } else if (promptLower.includes('red')) {
    baseColors = ['#FF0000', '#8B0000', '#DC143C', '#B22222'];
  } else if (promptLower.includes('blue')) {
    baseColors = ['#0000FF', '#4169E1', '#1E90FF', '#00BFFF'];
  } else if (promptLower.includes('green')) {
    baseColors = ['#00FF00', '#32CD32', '#228B22', '#90EE90'];
  } else if (promptLower.includes('black') || promptLower.includes('dark')) {
    baseColors = ['#000000', '#1C1C1C', '#2F2F2F', '#363636'];
  } else if (promptLower.includes('white') || promptLower.includes('light')) {
    baseColors = ['#FFFFFF', '#F5F5F5', '#E0E0E0', '#D3D3D3'];
  } else if (promptLower.includes('purple')) {
    baseColors = ['#800080', '#9370DB', '#BA55D3', '#8A2BE2'];
  } else if (promptLower.includes('pink')) {
    baseColors = ['#FF69B4', '#FF1493', '#FFC0CB', '#FFB6C1'];
  } else if (promptLower.includes('yellow') || promptLower.includes('gold')) {
    baseColors = ['#FFFF00', '#FFD700', '#FFA500', '#FF8C00'];
  } else if (promptLower.includes('orange')) {
    baseColors = ['#FFA500', '#FF8C00', '#FF6347', '#FF4500'];
  } else {
    // Default: vibrant colors
    baseColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F'];
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
  
  // Smart texture-to-part mapping based on part characteristics
  const getTextureForPart = (partName: string, index: number): TextureSet | null => {
    if (!wantsTextures || selectedTextures.length === 0) return null;
    
    const partLower = partName.toLowerCase();
    
    // If user mentioned specific parts, prioritize those
    const isMentioned = mentionedParts.some(p => p.toLowerCase() === partLower);
    
    // Match textures to parts based on part characteristics
    if (partLower.includes('sole') || partLower.includes('bottom') || partLower.includes('base') || partLower.includes('outsole')) {
      // Sole parts - prefer rougher/durable textures
      const roughTextures = selectedTextures.filter(t => 
        t.name.toLowerCase().includes('rough') || 
        t.name.toLowerCase().includes('leather') ||
        t.name.toLowerCase().includes('crocodile') ||
        t.name.toLowerCase().includes('calf')
      );
      if (roughTextures.length > 0) {
        return roughTextures[index % roughTextures.length];
      }
    } else if (partLower.includes('upper') || partLower.includes('body') || partLower.includes('main') || partLower.includes('vamp')) {
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
  
  // Generate mappings for all parts
  availableParts.forEach((part, index) => {
    // Cycle through base colors
    const colorIndex = index % baseColors.length;
    let color = baseColors[colorIndex];
    
    // Get appropriate texture for this part
    const selectedTexture = getTextureForPart(part, index);
    
    // Lighten colors for texture tints (if textures are requested)
    if (wantsTextures && selectedTexture) {
      color = lightenColor(color, 0.4); // 40% lighter for texture tints
    }
    
    mappings.push({
      partName: part.toLowerCase(),
      color: color,
      textureName: selectedTexture?.name,
      reason: selectedTexture ? `Applied ${selectedTexture.name} texture` : `Matches ${prompt} theme`,
    });
  });
  
  // Generate user-friendly description
  let description = `I've created a ${prompt} themed design`;
  if (wantsTextures && selectedTextures.length > 0) {
    if (maxTextures && maxTextures < availableTextures.length) {
      description += ` using ${selectedTextures.length} selected texture${selectedTextures.length > 1 ? 's' : ''}`;
    } else {
      const textureCount = mappings.filter(m => m.textureName).length;
      description += ` with textures applied to ${textureCount} parts`;
    }
  }
  description += '! Check out the 3D view to see your customized design.';
  
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
