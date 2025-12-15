# Complete Flow Analysis - Click to Color Selection

This document traces the exact execution flow from clicking a part to selecting colors and clicking another part.

---

## Scenario 1: Clicking on a Part of the Shoe

### Step 1: Mouse Click Event
**Location**: `src/components/viewer/MeshSelector.tsx` - `handleClick` function

**What Happens**:
```typescript
// User clicks on canvas
event: MouseEvent → handleClick(event)
```

### Step 2: Calculate Mouse Position
**Code**: Lines 19-22 in `MeshSelector.tsx`

```typescript
const rect = gl.domElement.getBoundingClientRect();
mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
```

**Result**: Mouse position converted to Normalized Device Coordinates (NDC)
- X: -1 (left) to +1 (right)
- Y: -1 (bottom) to +1 (top)

### Step 3: Create Ray from Camera
**Code**: Line 25 in `MeshSelector.tsx`

```typescript
raycasterRef.current.setFromCamera(mouseRef.current, camera);
```

**Result**: Ray created from camera through mouse position in 3D space

### Step 4: Collect All Meshes
**Code**: Lines 28-33 in `MeshSelector.tsx`

```typescript
const meshes: THREE.Mesh[] = [];
model.traverse((child) => {
  if (child instanceof THREE.Mesh) {
    meshes.push(child);
  }
});
```

**Result**: Array of all mesh objects in the 3D model

### Step 5: Ray-Mesh Intersection
**Code**: Line 35 in `MeshSelector.tsx`

```typescript
const intersections = raycasterRef.current.intersectObjects(meshes, true);
```

**Result**: Array of intersections sorted by distance (closest first)

### Step 6: Extract Selected Mesh
**Code**: Lines 37-49 in `MeshSelector.tsx`

```typescript
if (intersections.length > 0) {
  const selected = intersections[0].object as THREE.Mesh;
  const meshId = selected.uuid;  // e.g., "abc123-def456-..."
  const meshName = selected.name || `Mesh_${meshId.substring(0, 8)}`;
  
  console.log('Selected mesh:', { name, uuid, mesh, material });
  selectMesh(selected, meshId);
}
```

**Result**: 
- `selected`: The THREE.Mesh object that was clicked
- `meshId`: UUID string (unique identifier)
- `meshName`: Display name or generated name

### Step 7: Update Zustand Store
**Location**: `src/store/useAppStore.ts` - `selectMesh` function (Lines 35-43)

```typescript
selectMesh: (mesh, meshId) => {
  const meshName = mesh?.name || (meshId ? `Mesh_${meshId.substring(0, 8)}` : null);
  set({ 
    selectedMesh: mesh,           // THREE.Mesh object
    selectedMeshId: meshId,        // UUID string
    selectedMeshName: meshName,   // Display name
    showCustomizationPanel: true   // Show panel
  });
}
```

**State Updated**:
```typescript
{
  selectedMesh: THREE.Mesh,        // The actual mesh object
  selectedMeshId: "abc123...",     // UUID string
  selectedMeshName: "Upper",        // Display name
  showCustomizationPanel: true      // Panel visible
}
```

**Where Stored**: Zustand store (in-memory, global state)

### Step 8: React Re-render Triggered
**What Happens**:
- All components subscribed to store get notified
- Components re-render with new state

### Step 9: HighlightEffect Component Mounts
**Location**: `src/components/viewer/MeshSelector.tsx` - Line 61

```typescript
return selectedMesh ? <HighlightEffect mesh={selectedMesh} /> : null;
```

**Result**: `HighlightEffect` component renders with selected mesh

### Step 10: HighlightEffect useEffect Runs
**Location**: `src/components/viewer/HighlightEffect.tsx` - Lines 22-81

**What Happens**:

1. **Check Previous Highlight** (Lines 23-26):
```typescript
if (currentHighlightedMesh && currentHighlightedMesh !== mesh) {
  restoreMeshMaterial(currentHighlightedMesh);  // Restore previous immediately
}
```

2. **Set Current Highlight** (Line 29):
```typescript
currentHighlightedMesh = mesh;  // Track this mesh
```

3. **Clone Material** (Lines 32-63):
```typescript
if (!highlightMaterialCache.has(mesh)) {
  const originalMaterial = mesh.material;
  const clonedMaterial = originalMaterial.clone();  // Clone for highlighting
  
  // Store in cache
  highlightMaterialCache.set(mesh, {
    originalMaterial: originalMaterial,
    clonedMaterial: clonedMaterial,
    originalEmissive: ...,
    originalIntensity: ...
  });
  
  mesh.material = clonedMaterial;  // Apply cloned material
}
```

**Result**: 
- Previous mesh material restored (if any)
- Current mesh material cloned
- Cloned material applied to mesh

### Step 11: Highlight Animation Starts
**Location**: `src/components/viewer/HighlightEffect.tsx` - `useFrame` hook (Lines 83-119)

**What Happens** (runs every frame at 60fps):
```typescript
useFrame((state, delta) => {
  timeRef.current += delta;  // Accumulate time
  
  // Calculate intensity based on time
  if (time < 0.3s) intensity = fade in
  else if (time < 0.7s) intensity = 1 (hold)
  else if (time < 1.0s) intensity = fade out
  else intensity = 0 (done)
  
  // Apply green glow
  material.emissive.lerpColors(original, green, intensity * 0.5);
  material.emissiveIntensity = original + (intensity * 0.8);
});
```

**Result**: Mesh glows green, fades in/out over 1 second

### Step 12: CustomizationPanel Renders
**Location**: `src/components/customization/CustomizationPanel.tsx`

**What Happens**:
- Reads `showCustomizationPanel` and `selectedMeshId` from store
- Panel slides in from right (Framer Motion animation)
- Displays selected mesh name
- Renders `ColorPicker` component

### Step 13: ColorPicker Component Renders
**Location**: `src/components/customization/ColorPicker.tsx` - Lines 24-33

**What Happens**:
```typescript
const { meshCustomizations, updateMeshCustomization } = useAppStore();
const currentColor = meshCustomizations[meshId]?.color || '#000000';
const [customColor, setCustomColor] = useState(currentColor);

// Sync when mesh changes
useEffect(() => {
  const color = meshCustomizations[meshId]?.color || '#000000';
  setCustomColor(color);
}, [meshId, meshCustomizations]);
```

**Result**: 
- Reads current color for this mesh from store
- If no color set, defaults to '#000000'
- Displays color picker UI

---

## Scenario 2: Selecting a Color

### Step 1: User Clicks Color
**Location**: `src/components/customization/ColorPicker.tsx`

**Options**:
- Click preset color button (Line 77)
- Change custom color input (Line 40)

### Step 2: Color Handler Executes
**Code**: Lines 35-44 in `ColorPicker.tsx`

```typescript
// For preset colors
const handleColorSelect = (color: string) => {
  updateMeshCustomization(meshId, { color });
  setCustomColor(color);
};

// For custom color input
const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const color = e.target.value;
  setCustomColor(color);
  updateMeshCustomization(meshId, { color });
};
```

### Step 3: Update Store
**Location**: `src/store/useAppStore.ts` - `updateMeshCustomization` (Lines 45-54)

```typescript
updateMeshCustomization: (meshId, customization) =>
  set((state) => ({
    meshCustomizations: {
      ...state.meshCustomizations,
      [meshId]: {
        ...state.meshCustomizations[meshId],
        ...customization,  // Merge new color
      },
    },
  }))
```

**State Updated**:
```typescript
{
  meshCustomizations: {
    "abc123...": { color: "#FF0000" },  // Selected mesh
    // ... other meshes with customizations
  }
}
```

### Step 4: GLTFModel useFrame Hook Detects Change
**Location**: `src/components/viewer/GLTFModel.tsx` - Lines 49-59

**What Happens** (runs every frame at 60fps):
```typescript
useFrame(() => {
  if (scene && Object.keys(meshCustomizations).length > 0) {
    Object.entries(meshCustomizations).forEach(([meshId, customization]) => {
      const mesh = meshMapRef.current.get(meshId);  // Get mesh by UUID
      if (mesh) {
        applyCustomizations(mesh, customization);  // Apply color
      }
    });
  }
});
```

### Step 5: applyCustomizations Function Executes
**Location**: `src/utils/materialHelpers.ts` - Lines 7-60

**What Happens**:

1. **Check if Material Already Cloned** (Lines 14-23):
```typescript
if (!originalMaterials.has(mesh)) {
  originalMaterials.set(mesh, mesh.material);  // Store original
  
  // Clone material
  if (Array.isArray(mesh.material)) {
    mesh.material = mesh.material.map(mat => mat.clone());
  } else {
    mesh.material = mesh.material.clone();
  }
}
```

2. **Apply Color** (Lines 33-38):
```typescript
if (customization.color) {
  const hexColor = customization.color.startsWith('#')
    ? customization.color.substring(1)
    : customization.color;
  material.color.setHex(parseInt(hexColor, 16));
  material.needsUpdate = true;
}
```

**Result**: 
- Material cloned (if not already)
- Color applied to material
- Material updated in 3D scene
- Color change visible immediately

---

## Scenario 3: Clicking Another Part Immediately

### Step 1: New Click Event
**Same as Scenario 1, Steps 1-6**

### Step 2: New Mesh Selected
**Location**: `src/components/viewer/MeshSelector.tsx` - Line 49

```typescript
selectMesh(newMesh, newMeshId);  // New mesh selected
```

### Step 3: Store Updates
**Location**: `src/store/useAppStore.ts` - `selectMesh` function

**State Updated**:
```typescript
{
  selectedMesh: newMesh,          // NEW mesh object
  selectedMeshId: "xyz789...",    // NEW UUID
  selectedMeshName: "Sole",       // NEW name
  showCustomizationPanel: true    // Still true
}
```

**Previous State** (still in store):
```typescript
{
  meshCustomizations: {
    "abc123...": { color: "#FF0000" },  // Previous mesh color preserved
    // ... other customizations
  }
}
```

### Step 4: HighlightEffect for Previous Mesh Unmounts
**Location**: `src/components/viewer/HighlightEffect.tsx` - Cleanup function (Lines 70-80)

**What Happens**:
```typescript
return () => {
  if (currentHighlightedMesh === mesh) {
    currentHighlightedMesh = null;
  }
  // Restore after 1 second
  setTimeout(() => {
    restoreMeshMaterial(mesh);  // Restore original material
  }, 1000);
};
```

**But Also**: New HighlightEffect detects previous mesh (Lines 23-26):
```typescript
if (currentHighlightedMesh && currentHighlightedMesh !== mesh) {
  restoreMeshMaterial(currentHighlightedMesh);  // IMMEDIATELY restore previous
}
```

**Result**: 
- Previous mesh highlight stops immediately
- Previous mesh material restored
- Previous mesh color customization preserved (if any)

### Step 5: New HighlightEffect Mounts
**Same as Scenario 1, Steps 9-11**

**What Happens**:
- New mesh material cloned
- New mesh highlight animation starts
- Previous highlight stopped

### Step 6: CustomizationPanel Updates
**Location**: `src/components/customization/CustomizationPanel.tsx`

**What Happens**:
- Reads new `selectedMeshId` from store
- Updates displayed mesh name
- `ColorPicker` re-renders with new `meshId`

### Step 7: ColorPicker Updates
**Location**: `src/components/customization/ColorPicker.tsx` - useEffect (Lines 30-33)

**What Happens**:
```typescript
useEffect(() => {
  const color = meshCustomizations[meshId]?.color || '#000000';
  setCustomColor(color);  // Update to new mesh's color (or default)
}, [meshId, meshCustomizations]);
```

**Result**: 
- If new mesh has customization: Shows that color
- If new mesh has no customization: Shows default '#000000'

---

## Complete State Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    ZUSTAND STORE STATE                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  selectedMesh: THREE.Mesh | null                             │
│  selectedMeshId: string | null                               │
│  selectedMeshName: string | null                             │
│  showCustomizationPanel: boolean                             │
│                                                               │
│  meshCustomizations: {                                       │
│    [meshId: string]: {                                        │
│      color?: string,                                          │
│      texture?: string,                                        │
│      ...                                                      │
│    }                                                          │
│  }                                                            │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### State Changes Timeline

**Click Part 1 (Upper)**:
```
selectedMesh: UpperMesh
selectedMeshId: "abc123"
selectedMeshName: "Upper"
meshCustomizations: {}  // Empty
```

**Select Color Red**:
```
selectedMesh: UpperMesh
selectedMeshId: "abc123"
meshCustomizations: {
  "abc123": { color: "#FF0000" }
}
```

**Click Part 2 (Sole)**:
```
selectedMesh: SoleMesh          // Changed
selectedMeshId: "xyz789"         // Changed
selectedMeshName: "Sole"         // Changed
meshCustomizations: {
  "abc123": { color: "#FF0000" },  // Preserved!
  "xyz789": {}                      // New (empty)
}
```

---

## Key Storage Locations

### 1. Selected Mesh
**Stored In**: Zustand store (`useAppStore`)
- `selectedMesh`: THREE.Mesh object (in-memory reference)
- `selectedMeshId`: UUID string (persistent identifier)
- `selectedMeshName`: Display name

**Persistence**: In-memory only (lost on page refresh)

### 2. Mesh Customizations
**Stored In**: Zustand store (`useAppStore`)
- `meshCustomizations`: Object keyed by mesh UUID
- Each entry: `{ color?: string, texture?: string, ... }`

**Persistence**: In-memory only (lost on page refresh)

### 3. Material Cloning (Highlight)
**Stored In**: `HighlightEffect.tsx` - `highlightMaterialCache` WeakMap
- Key: THREE.Mesh object
- Value: `{ originalMaterial, clonedMaterial, originalEmissive, originalIntensity }`

**Persistence**: Temporary (cleared after 1 second or when new mesh selected)

### 4. Material Cloning (Customization)
**Stored In**: `materialHelpers.ts` - `originalMaterials` WeakMap
- Key: THREE.Mesh object
- Value: Original material (before cloning)

**Persistence**: Permanent (until mesh is removed)

### 5. Mesh UUID Map
**Stored In**: `GLTFModel.tsx` - `meshMapRef` (useRef)
- Key: UUID string
- Value: THREE.Mesh object

**Persistence**: Rebuilt when model loads

---

## Function Execution Order

### When Clicking a Part:

1. `handleClick` (MeshSelector) - Mouse event handler
2. `selectMesh` (useAppStore) - Update store
3. `HighlightEffect.useEffect` - Setup highlight
4. `HighlightEffect.useFrame` - Animate highlight (60fps)
5. `CustomizationPanel` render - Show panel
6. `ColorPicker` render - Show color picker

### When Selecting a Color:

1. `handleColorSelect` or `handleCustomColorChange` (ColorPicker)
2. `updateMeshCustomization` (useAppStore) - Update store
3. `GLTFModel.useFrame` - Detect change (60fps)
4. `applyCustomizations` (materialHelpers) - Apply color

### When Clicking Another Part:

1. `handleClick` (MeshSelector) - New click
2. `selectMesh` (useAppStore) - Update store
3. `HighlightEffect.useEffect` (new) - Setup new highlight
   - Immediately calls `restoreMeshMaterial` (previous)
4. `HighlightEffect.useEffect` (old) - Cleanup (unmount)
5. `CustomizationPanel` re-render - Update panel
6. `ColorPicker` re-render - Update color picker

---

## Important Notes

### Material Cloning Strategy

**Two Separate Systems**:

1. **Highlight System** (`HighlightEffect.tsx`):
   - Clones material temporarily
   - Restores after 1 second
   - Independent of customization

2. **Customization System** (`materialHelpers.ts`):
   - Clones material permanently
   - Never restores (keeps customization)
   - Independent of highlight

**Why Two Systems?**:
- Highlight is temporary (1 second)
- Customization is permanent (until reset)
- They don't interfere with each other

### UUID vs Mesh Object

- **UUID**: Used for storage and lookup (persistent identifier)
- **Mesh Object**: Used for direct manipulation (in-memory reference)

**Why Both?**:
- UUID: Survives re-renders, used as keys
- Mesh Object: Direct access for material manipulation

### State Persistence

**Current**: All state in-memory (Zustand store)
- Lost on page refresh
- Lost on navigation away

**Future Enhancement**: Could add localStorage persistence

---

## Summary

1. **Click Part** → Store updates → Highlight starts → Panel shows
2. **Select Color** → Store updates → Color applied → Visual change
3. **Click Another Part** → Previous highlight stops → New highlight starts → Panel updates

All state stored in Zustand store, accessed by components via hooks.

