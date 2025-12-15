/**
 * Prompt Parser Module
 * 
 * Parses natural language prompts to extract color and part mappings
 * Uses actual mesh names from the GLTF model for accurate matching
 * Example: "make the upper red and sole blue" → { "upper": "#FF0000", "sole": "#0000FF" }
 */

import { MeshInfo } from '../types';

// Color name to hex mapping
const COLOR_MAP: { [key: string]: string } = {
  // Basic colors
  'red': '#FF0000',
  'blue': '#0000FF',
  'green': '#00FF00',
  'yellow': '#FFFF00',
  'orange': '#FFA500',
  'purple': '#800080',
  'pink': '#FFC0CB',
  'brown': '#8B4513',
  'black': '#000000',
  'white': '#FFFFFF',
  'gray': '#808080',
  'grey': '#808080',
  'navy': '#000080',
  'cyan': '#00FFFF',
  'magenta': '#FF00FF',
  'lime': '#00FF00',
  'maroon': '#800000',
  'olive': '#808000',
  'teal': '#008080',
  'silver': '#C0C0C0',
  'gold': '#FFD700',
  'beige': '#F5F5DC',
  'tan': '#D2B48C',
  'burgundy': '#800020',
  'coral': '#FF7F50',
  'salmon': '#FA8072',
  'turquoise': '#40E0D0',
  'indigo': '#4B0082',
  'violet': '#8A2BE2',
  'khaki': '#F0E68C',
  'ivory': '#FFFFF0',
  'cream': '#FFFDD0',
};

// Common part name aliases (fallback if mesh name doesn't match)
const PART_ALIASES: { [key: string]: string[] } = {
  'upper': ['upper', 'top', 'body', 'main', 'shoe body', 'shoe upper'],
  'sole': ['sole', 'bottom', 'base', 'outsole', 'shoe sole'],
  'laces': ['laces', 'lacing', 'shoelaces', 'strings'],
  'heel': ['heel', 'back', 'heel counter'],
  'toe': ['toe', 'toe box', 'front'],
  'tongue': ['tongue', 'shoe tongue'],
  'midsole': ['midsole', 'middle', 'mid'],
  'logo': ['logo', 'brand', 'emblem'],
  'stripes': ['stripes', 'stripe', 'lines'],
  'swoosh': ['swoosh', 'nike swoosh'],
};

export interface ParsedColorMapping {
  [partName: string]: string; // part name -> hex color
}

export interface ParseResult {
  success: boolean;
  mappings: ParsedColorMapping;
  errors: string[];
  warnings: string[];
}

/**
 * Normalize part name - matches against actual mesh names or aliases
 */
function normalizePartName(partName: string, availableMeshes: MeshInfo[]): string | null {
  const lowerPart = partName.toLowerCase().trim();
  
  // First, try to match against actual mesh names from the model
  for (const mesh of availableMeshes) {
    const lowerMeshName = mesh.name.toLowerCase();
    const lowerDisplayName = mesh.displayName.toLowerCase();
    
    // Exact match
    if (lowerMeshName === lowerPart || lowerDisplayName === lowerPart) {
      return mesh.name; // Return actual mesh name
    }
    
    // Partial match
    if (lowerMeshName.includes(lowerPart) || lowerPart.includes(lowerMeshName)) {
      return mesh.name;
    }
    
    // Word-based matching
    const partWords = lowerPart.split(/[\s_-]+/);
    const meshWords = lowerMeshName.split(/[\s_-]+/);
    const hasCommonWord = partWords.some((word) =>
      meshWords.some((meshWord) => word === meshWord || meshWord.includes(word) || word.includes(meshWord))
    );
    if (hasCommonWord) {
      return mesh.name;
    }
  }
  
  // Fallback to aliases if no mesh match found
  for (const [key, aliases] of Object.entries(PART_ALIASES)) {
    if (key === lowerPart || aliases.includes(lowerPart)) {
      // Try to find a mesh that matches this alias
      for (const mesh of availableMeshes) {
        const lowerMeshName = mesh.name.toLowerCase();
        if (lowerMeshName.includes(key) || key.includes(lowerMeshName)) {
          return mesh.name;
        }
      }
      return key; // Return alias as fallback
    }
  }
  
  return null;
}

/**
 * Extract color from text
 */
function extractColor(text: string): string | null {
  const lowerText = text.toLowerCase().trim();
  
  // Check for hex color
  const hexMatch = text.match(/#[0-9A-Fa-f]{6}/);
  if (hexMatch) {
    return hexMatch[0];
  }
  
  // Check for color names
  for (const [colorName, hexValue] of Object.entries(COLOR_MAP)) {
    if (lowerText.includes(colorName)) {
      return hexValue;
    }
  }
  
  return null;
}

/**
 * Parse natural language prompt to extract color and part mappings
 * Uses actual mesh names from the model for accurate matching
 * 
 * Examples:
 * - "make the upper red and sole blue"
 * - "upper: red, sole: blue"
 * - "red upper with blue sole"
 * - "make upper red"
 */
export function parsePrompt(prompt: string, availableMeshes: MeshInfo[] = []): ParseResult {
  const result: ParseResult = {
    success: false,
    mappings: {},
    errors: [],
    warnings: [],
  };

  if (!prompt || prompt.trim().length === 0) {
    result.errors.push('Prompt is empty');
    return result;
  }

  const lowerPrompt = prompt.toLowerCase();
  const mappings: ParsedColorMapping = {};

  // Pattern 1: "make [part] [color]" or "[part] [color]"
  const pattern1 = /(?:make\s+)?(?:the\s+)?(\w+)\s+(\w+)/gi;
  let match;
  while ((match = pattern1.exec(prompt)) !== null) {
    const partName = match[1];
    const colorText = match[2];
    
      const normalizedPart = normalizePartName(partName, availableMeshes);
      const color = extractColor(colorText);
    
    if (normalizedPart && color) {
      mappings[normalizedPart] = color;
    } else if (!normalizedPart) {
      result.warnings.push(`Unknown part: "${partName}"`);
    } else if (!color) {
      result.warnings.push(`Unknown color: "${colorText}"`);
    }
  }

  // Pattern 2: "[part]: [color]" or "[part] = [color]"
  const pattern2 = /(\w+)\s*[:=]\s*(\w+|#[0-9A-Fa-f]{6})/gi;
  while ((match = pattern2.exec(prompt)) !== null) {
    const partName = match[1];
    const colorText = match[2];
    
    const normalizedPart = normalizePartName(partName);
    const color = extractColor(colorText) || (colorText.startsWith('#') ? colorText : null);
    
    if (normalizedPart && color) {
      mappings[normalizedPart] = color;
    } else if (!normalizedPart) {
      result.warnings.push(`Unknown part: "${partName}"`);
    } else if (!color) {
      result.warnings.push(`Unknown color: "${colorText}"`);
    }
  }

  // Pattern 3: "[color] [part]" (e.g., "red upper")
  const pattern3 = /(\w+|#[0-9A-Fa-f]{6})\s+(\w+)/gi;
  while ((match = pattern3.exec(prompt)) !== null) {
    const colorText = match[1];
    const partName = match[2];
    
    const normalizedPart = normalizePartName(partName);
    const color = extractColor(colorText) || (colorText.startsWith('#') ? colorText : null);
    
    if (normalizedPart && color) {
      mappings[normalizedPart] = color;
    }
  }

  // Pattern 4: "and" or "," separated pairs
  const andPattern = /(?:and|,)\s*(?:the\s+)?(\w+)\s+(\w+)/gi;
  while ((match = andPattern.exec(prompt)) !== null) {
    const partName = match[1];
    const colorText = match[2];
    
      const normalizedPart = normalizePartName(partName, availableMeshes);
      const color = extractColor(colorText);
    
    if (normalizedPart && color) {
      mappings[normalizedPart] = color;
    }
  }

  if (Object.keys(mappings).length === 0) {
    result.errors.push('Could not extract any color mappings from prompt');
    return result;
  }

  result.success = true;
  result.mappings = mappings;
  
  return result;
}

/**
 * Get all available part names (from actual meshes or aliases)
 */
export function getAvailableParts(availableMeshes: MeshInfo[] = []): string[] {
  if (availableMeshes.length > 0) {
    // Return actual mesh names from the model
    return availableMeshes.map(m => m.displayName || m.name);
  }
  // Fallback to aliases
  return Object.keys(PART_ALIASES);
}

/**
 * Get all available color names
 */
export function getAvailableColors(): string[] {
  return Object.keys(COLOR_MAP);
}

/**
 * Get color hex value by name
 */
export function getColorByName(colorName: string): string | null {
  return COLOR_MAP[colorName.toLowerCase()] || null;
}

