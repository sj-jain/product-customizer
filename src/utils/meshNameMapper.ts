/**
 * Mesh Name Mapper
 * 
 * Maps generic mesh names (like "part_1", "mesh_001") to user-friendly names
 * Uses position, parent, material, and other properties to intelligently guess part names
 */

import * as THREE from 'three';
import { MeshAnalysis } from './meshAnalyzer';

export interface NameMapping {
  originalName: string;
  displayName: string;
  category?: string; // e.g., "upper", "sole", "laces"
}

// Common name patterns and their mappings
const NAME_PATTERNS: { pattern: RegExp; category: string; displayName: string }[] = [
  { pattern: /part[_\s]?1|mesh[_\s]?1|object[_\s]?1/i, category: 'upper', displayName: 'Upper' },
  { pattern: /part[_\s]?2|mesh[_\s]?2|object[_\s]?2/i, category: 'sole', displayName: 'Sole' },
  { pattern: /part[_\s]?3|mesh[_\s]?3|object[_\s]?3/i, category: 'laces', displayName: 'Laces' },
  { pattern: /part[_\s]?4|mesh[_\s]?4|object[_\s]?4/i, category: 'heel', displayName: 'Heel' },
  { pattern: /part[_\s]?5|mesh[_\s]?5|object[_\s]?5/i, category: 'toe', displayName: 'Toe' },
  { pattern: /part[_\s]?6|mesh[_\s]?6|object[_\s]?6/i, category: 'tongue', displayName: 'Tongue' },
  { pattern: /part[_\s]?7|mesh[_\s]?7|object[_\s]?7/i, category: 'midsole', displayName: 'Midsole' },
  { pattern: /part[_\s]?8|mesh[_\s]?8|object[_\s]?8/i, category: 'logo', displayName: 'Logo' },
];

// Position-based heuristics (Y position typically indicates vertical position)
const POSITION_HEURISTICS = {
  upper: { minY: 0.3, maxY: 2.0 }, // Upper parts are typically higher
  sole: { minY: -0.5, maxY: 0.3 },  // Sole is at the bottom
  midsole: { minY: 0.0, maxY: 0.5 }, // Midsole is in the middle
};

// Material name patterns
const MATERIAL_PATTERNS: { pattern: RegExp; category: string }[] = [
  { pattern: /upper|top|body|main/i, category: 'upper' },
  { pattern: /sole|bottom|base|outsole/i, category: 'sole' },
  { pattern: /lace|string/i, category: 'laces' },
  { pattern: /heel|back/i, category: 'heel' },
  { pattern: /toe|front/i, category: 'toe' },
  { pattern: /tongue/i, category: 'tongue' },
  { pattern: /mid|middle/i, category: 'midsole' },
  { pattern: /logo|brand|emblem/i, category: 'logo' },
];

// Parent name patterns
const PARENT_PATTERNS: { pattern: RegExp; category: string }[] = [
  { pattern: /upper|top|body|main/i, category: 'upper' },
  { pattern: /sole|bottom|base/i, category: 'sole' },
  { pattern: /lace|string/i, category: 'laces' },
  { pattern: /heel|back/i, category: 'heel' },
  { pattern: /toe|front/i, category: 'toe' },
  { pattern: /tongue/i, category: 'tongue' },
  { pattern: /mid|middle/i, category: 'midsole' },
  { pattern: /logo|brand/i, category: 'logo' },
];

/**
 * Guess part category based on mesh properties
 */
function guessCategory(meshAnalysis: MeshAnalysis): string | null {
  const name = meshAnalysis.name.toLowerCase();
  const materialName = (meshAnalysis.materialName || '').toLowerCase();
  const parentName = (meshAnalysis.parentName || '').toLowerCase();
  const parentPath = meshAnalysis.parentPath.map(p => p.toLowerCase()).join(' ');

  // Check name patterns
  for (const { pattern, category } of NAME_PATTERNS) {
    if (pattern.test(name)) {
      return category;
    }
  }

  // Check material name
  for (const { pattern, category } of MATERIAL_PATTERNS) {
    if (pattern.test(materialName)) {
      return category;
    }
  }

  // Check parent name
  for (const { pattern, category } of PARENT_PATTERNS) {
    if (pattern.test(parentName) || pattern.test(parentPath)) {
      return category;
    }
  }

  // Check position (Y coordinate)
  const y = meshAnalysis.position.y;
  if (y >= POSITION_HEURISTICS.upper.minY && y <= POSITION_HEURISTICS.upper.maxY) {
    return 'upper';
  }
  if (y >= POSITION_HEURISTICS.sole.minY && y <= POSITION_HEURISTICS.sole.maxY) {
    return 'sole';
  }
  if (y >= POSITION_HEURISTICS.midsole.minY && y <= POSITION_HEURISTICS.midsole.maxY) {
    return 'midsole';
  }

  return null;
}

/**
 * Generate display name from category
 */
function getDisplayNameFromCategory(category: string): string {
  const categoryMap: { [key: string]: string } = {
    'upper': 'Upper',
    'sole': 'Sole',
    'laces': 'Laces',
    'heel': 'Heel',
    'toe': 'Toe',
    'tongue': 'Tongue',
    'midsole': 'Midsole',
    'logo': 'Logo',
    'stripes': 'Stripes',
    'swoosh': 'Swoosh',
  };
  return categoryMap[category] || category.charAt(0).toUpperCase() + category.slice(1);
}

/**
 * Map mesh names to user-friendly names
 */
export function mapMeshNames(analyses: MeshAnalysis[]): NameMapping[] {
  const mappings: NameMapping[] = [];
  const categoryCounts: { [category: string]: number } = {};

  analyses.forEach((analysis) => {
    const originalName = analysis.name;
    let displayName = originalName;
    let category: string | null = null;

    // If name is already descriptive, use it
    if (!/^(part|mesh|object)[_\s]?\d+$/i.test(originalName)) {
      // Name seems descriptive, format it nicely
      displayName = formatDisplayName(originalName);
      mappings.push({ originalName, displayName });
      return;
    }

    // Try to guess category
    category = guessCategory(analysis);

    if (category) {
      // Count how many meshes have this category
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      const count = categoryCounts[category];
      
      // If multiple meshes have same category, add number
      if (count > 1) {
        displayName = `${getDisplayNameFromCategory(category)} ${count}`;
      } else {
        displayName = getDisplayNameFromCategory(category);
      }
    } else {
      // Fallback: use formatted original name
      displayName = formatDisplayName(originalName);
    }

    mappings.push({
      originalName,
      displayName,
      category: category || undefined,
    });
  });

  return mappings;
}

/**
 * Format display name (convert snake_case, camelCase to Title Case)
 */
function formatDisplayName(name: string): string {
  return name
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Create a mapping configuration that can be saved/edited
 */
export function createNameMappingConfig(analyses: MeshAnalysis[]): {
  mappings: NameMapping[];
  config: string; // JSON string for saving
} {
  const mappings = mapMeshNames(analyses);
  const config = JSON.stringify(mappings, null, 2);
  
  return { mappings, config };
}

/**
 * Apply name mappings to mesh info
 */
export function applyNameMappings(
  meshInfo: { uuid: string; name: string; displayName: string }[],
  mappings: NameMapping[]
): { uuid: string; name: string; displayName: string }[] {
  return meshInfo.map((info) => {
    const mapping = mappings.find(m => m.originalName === info.name);
    if (mapping) {
      return {
        ...info,
        displayName: mapping.displayName,
      };
    }
    return info;
  });
}

