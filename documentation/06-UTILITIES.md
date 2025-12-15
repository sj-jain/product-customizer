# Utilities Documentation

## Material Helpers (`src/utils/materialHelpers.ts`)

Utility functions for manipulating Three.js materials and meshes.

---

### `applyCustomizations(mesh, customization)`

**Purpose**: Apply customization properties to a Three.js mesh material

**Parameters**:
- `mesh: THREE.Mesh` - The mesh to customize
- `customization: MeshCustomization` - Customization properties

**Returns**: `void`

**Functionality**:

1. **Material Cloning**:
   - Checks if material has been cloned before (using WeakMap)
   - If not cloned, stores original material and clones it
   - Prevents affecting other meshes that share the same material

2. **Color Application**:
   - Parses hex color string (with or without `#`)
   - Converts to integer
   - Applies to material color
   - Sets `needsUpdate = true` to trigger re-render

3. **Texture Support** (Future):
   - Placeholder for texture application
   - Placeholder for normal maps
   - Placeholder for roughness maps
   - Placeholder for metalness maps

**Code Flow**:
```typescript
1. Check if material exists
2. Check if already cloned (WeakMap lookup)
3. If not cloned:
   - Store original in WeakMap
   - Clone material(s)
4. Handle array of materials or single material
5. For each material:
   - Apply color if provided
   - Apply textures if provided (future)
   - Set needsUpdate = true
```

**Example Usage**:
```typescript
const mesh = // ... get mesh
const customization = { color: "#FF0000" };
applyCustomizations(mesh, customization);
```

**Material Cloning Logic**:
```typescript
// Original materials stored in WeakMap
const originalMaterials = new WeakMap<THREE.Mesh, THREE.Material>();

// First time: clone
if (!originalMaterials.has(mesh)) {
  originalMaterials.set(mesh, mesh.material);
  mesh.material = mesh.material.clone();
}

// Subsequent calls: use already-cloned material
```

**Why Cloning is Important**:
- GLTF models often share materials between meshes
- Without cloning, changing one mesh affects all meshes with same material
- Cloning ensures independent customization per mesh

---

### `getMeshNames(scene)`

**Purpose**: Extract all mesh names from a Three.js scene

**Parameters**:
- `scene: THREE.Object3D` - The scene to traverse

**Returns**: `string[]` - Array of mesh names

**Functionality**:
- Traverses scene recursively
- Finds all Mesh objects
- Extracts names (or generates from UUID if unnamed)
- Returns array of names

**Code Flow**:
```typescript
1. Initialize empty array
2. Traverse scene (recursive)
3. For each child:
   - Check if it's a Mesh
   - Extract name or generate from UUID
   - Add to array
4. Return array
```

**Example Usage**:
```typescript
const scene = // ... get scene
const meshNames = getMeshNames(scene);
console.log('Available meshes:', meshNames);
```

**Output Example**:
```typescript
[
  "Upper",
  "Sole",
  "Laces",
  "mesh_a1b2c3d4",  // Generated name for unnamed mesh
  // ...
]
```

---

## Internal Utilities

### WeakMap for Material Storage

**Location**: Inside `materialHelpers.ts`

**Purpose**: Store original materials before cloning

**Implementation**:
```typescript
const originalMaterials = new WeakMap<THREE.Mesh, THREE.Material | THREE.Material[]>();
```

**Why WeakMap**:
- Allows garbage collection when meshes are removed
- Prevents memory leaks
- Keyed by mesh object (not string)

**Usage**:
```typescript
// Store original
originalMaterials.set(mesh, mesh.material);

// Check if stored
if (originalMaterials.has(mesh)) {
  // Already cloned
}

// Retrieve (if needed)
const original = originalMaterials.get(mesh);
```

---

## Color Parsing

### Hex Color Conversion

**Location**: Inside `applyCustomizations()`

**Purpose**: Convert hex color string to Three.js Color

**Logic**:
```typescript
// Handle with or without #
const hexColor = color.startsWith('#')
  ? color.substring(1)  // Remove #
  : color;

// Parse as integer
const colorNumber = parseInt(hexColor, 16);

// Apply to material
material.color.setHex(colorNumber);
```

**Supported Formats**:
- `"#FF0000"` ✅
- `"FF0000"` ✅
- `"#ff0000"` ✅ (case insensitive)

**Error Handling**:
- Invalid hex strings may result in `NaN`
- Three.js handles invalid colors gracefully
- No explicit error checking (could be added)

---

## Material Type Handling

### Array vs Single Material

**Problem**: Meshes can have single material or array of materials

**Solution**: Normalize to array for processing

```typescript
const materials = Array.isArray(mesh.material)
  ? mesh.material
  : [mesh.material];

materials.forEach((material) => {
  // Process each material
});
```

**Why This Matters**:
- Some GLTF models use multi-material meshes
- Each material in array needs customization
- Ensures consistent processing

---

## Future Utility Functions

### Texture Loading

**Planned**: `loadTexture(path: string): Promise<THREE.Texture>`

```typescript
async function loadTexture(path: string): Promise<THREE.Texture> {
  const loader = new THREE.TextureLoader();
  return new Promise((resolve, reject) => {
    loader.load(path, resolve, undefined, reject);
  });
}
```

### Material Property Helpers

**Planned**: Functions for specific material properties

```typescript
function setRoughness(material: THREE.MeshStandardMaterial, value: number) {
  material.roughness = value;
  material.needsUpdate = true;
}

function setMetalness(material: THREE.MeshStandardMaterial, value: number) {
  material.metalness = value;
  material.needsUpdate = true;
}
```

### Mesh Utilities

**Planned**: Helper functions for mesh operations

```typescript
function findMeshByName(scene: THREE.Object3D, name: string): THREE.Mesh | null {
  let found: THREE.Mesh | null = null;
  scene.traverse((child) => {
    if (child instanceof THREE.Mesh && child.name === name) {
      found = child;
    }
  });
  return found;
}

function getAllMeshes(scene: THREE.Object3D): THREE.Mesh[] {
  const meshes: THREE.Mesh[] = [];
  scene.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      meshes.push(child);
    }
  });
  return meshes;
}
```

---

## Utility Usage Patterns

### In Components

```typescript
import { applyCustomizations } from '../utils/materialHelpers';

// In useFrame hook
useFrame(() => {
  Object.entries(meshCustomizations).forEach(([meshId, customization]) => {
    const mesh = meshMapRef.current.get(meshId);
    if (mesh) {
      applyCustomizations(mesh, customization);
    }
  });
});
```

### In Event Handlers

```typescript
import { getMeshNames } from '../utils/materialHelpers';

// Debug: Log all mesh names
const meshNames = getMeshNames(scene);
console.log('Available meshes:', meshNames);
```

---

## Performance Considerations

1. **Material Cloning**: Only happens once per mesh (cached in WeakMap)
2. **WeakMap Lookup**: O(1) operation, very fast
3. **Color Parsing**: Simple string operations, minimal overhead
4. **Material Updates**: `needsUpdate` flag prevents unnecessary recalculations

---

## Testing Utilities

### Mock Materials

```typescript
// Create test material
const testMaterial = new THREE.MeshStandardMaterial({
  color: 0xffffff
});

// Create test mesh
const testMesh = new THREE.Mesh(
  new THREE.BoxGeometry(),
  testMaterial
);

// Test customization
applyCustomizations(testMesh, { color: "#FF0000" });
```

### Validation

```typescript
// Validate color format
function isValidHexColor(color: string): boolean {
  return /^#?[0-9A-Fa-f]{6}$/.test(color);
}
```

