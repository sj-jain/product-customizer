# State Management Documentation

## Overview

The application uses **Zustand** for global state management. Zustand is a lightweight, unopinionated state management library that provides a simple API for managing application state.

## Store Location

**File**: `src/store/useAppStore.ts`

## State Structure

### Complete State Interface

```typescript
interface AppState {
  // Model State
  gltfModel: THREE.Object3D | null;
  isLoading: boolean;
  error: string | null;
  
  // Selection State
  selectedMesh: THREE.Mesh | null;
  selectedMeshId: string | null;        // UUID for unique identification
  selectedMeshName: string | null;       // Display name
  
  // Customization State
  meshCustomizations: {
    [meshId: string]: MeshCustomization;
  };
  
  // UI State
  showCustomizationPanel: boolean;
}
```

### MeshCustomization Interface

```typescript
interface MeshCustomization {
  color?: string;           // Hex color code (e.g., "#FF0000")
  texture?: string;         // Texture file path (future)
  normalMap?: string;      // Normal map path (future)
  roughnessMap?: string;   // Roughness map path (future)
  metalnessMap?: string;   // Metalness map path (future)
}
```

## Store Actions

### 1. `setGLTFModel(model: any)`

**Purpose**: Store the loaded GLTF model scene

**Usage**:
```typescript
setGLTFModel(scene);
```

**When Called**: After GLTF file loads successfully

**Updates**:
- `gltfModel`: The Three.js scene object

---

### 2. `setLoading(loading: boolean)`

**Purpose**: Control loading state

**Usage**:
```typescript
setLoading(true);  // Show loading screen
setLoading(false); // Hide loading screen
```

**When Called**: 
- Before model loading starts
- After model loads
- During async operations

**Updates**:
- `isLoading`: Boolean flag

---

### 3. `setError(error: string | null)`

**Purpose**: Store error messages

**Usage**:
```typescript
setError("Failed to load model");
setError(null); // Clear error
```

**When Called**: When errors occur (currently not fully implemented)

**Updates**:
- `error`: Error message string or null

---

### 4. `selectMesh(mesh: THREE.Mesh | null, meshId: string | null)`

**Purpose**: Select a mesh for customization

**Usage**:
```typescript
selectMesh(clickedMesh, mesh.uuid);
selectMesh(null, null); // Deselect
```

**When Called**: 
- When user clicks on a mesh
- When user closes customization panel

**Updates**:
- `selectedMesh`: The Three.js mesh object
- `selectedMeshId`: UUID string for unique identification
- `selectedMeshName`: Display name (from mesh.name or generated)
- `showCustomizationPanel`: Automatically set to `true` if mesh selected

**Logic**:
```typescript
const meshName = mesh?.name || (meshId ? `Mesh_${meshId.substring(0, 8)}` : null);
```

---

### 5. `updateMeshCustomization(meshId: string, customization: MeshCustomization)`

**Purpose**: Update customization for a specific mesh

**Usage**:
```typescript
updateMeshCustomization(mesh.uuid, { color: "#FF0000" });
updateMeshCustomization(mesh.uuid, { 
  color: "#0000FF",
  texture: "/textures/leather.jpg"
});
```

**When Called**: 
- When user selects a color
- When user applies a texture (future)
- When user changes any customization option

**Updates**:
- `meshCustomizations[meshId]`: Merges new customization with existing

**Merging Logic**:
```typescript
{
  ...state.meshCustomizations[meshId],
  ...customization  // New values override old ones
}
```

---

### 6. `toggleCustomizationPanel(show: boolean)`

**Purpose**: Control panel visibility

**Usage**:
```typescript
toggleCustomizationPanel(true);  // Show panel
toggleCustomizationPanel(false); // Hide panel
```

**When Called**: 
- When user closes panel
- When user selects/deselects mesh (automatic)

**Updates**:
- `showCustomizationPanel`: Boolean flag

---

### 7. `reset()`

**Purpose**: Reset all state to initial values

**Usage**:
```typescript
reset();
```

**When Called**: When user clicks "Reset" button

**Updates**: All state properties reset to initial values

## Using the Store in Components

### Basic Usage

```typescript
import { useAppStore } from '../store/useAppStore';

function MyComponent() {
  // Get specific state
  const isLoading = useAppStore((state) => state.isLoading);
  
  // Get action
  const setLoading = useAppStore((state) => state.setLoading);
  
  // Use in component
  if (isLoading) {
    return <LoadingSpinner />;
  }
}
```

### Multiple State Values

```typescript
// Option 1: Multiple selectors
const isLoading = useAppStore((state) => state.isLoading);
const selectedMesh = useAppStore((state) => state.selectedMesh);

// Option 2: Single selector (more efficient)
const { isLoading, selectedMesh } = useAppStore((state) => ({
  isLoading: state.isLoading,
  selectedMesh: state.selectedMesh
}));
```

### Actions

```typescript
// Get action
const selectMesh = useAppStore((state) => state.selectMesh);

// Use action
const handleClick = (mesh: THREE.Mesh) => {
  selectMesh(mesh, mesh.uuid);
};
```

## State Flow Examples

### Example 1: Loading a Model

```
1. Component calls setLoading(true)
   → isLoading = true
   → LoadingScreen renders

2. useGLTF loads model
   → Model loads successfully

3. Component calls setGLTFModel(scene)
   → gltfModel = scene object

4. Component calls setLoading(false)
   → isLoading = false
   → LoadingScreen hides
```

### Example 2: Selecting and Customizing a Mesh

```
1. User clicks mesh
   → selectMesh(mesh, mesh.uuid) called
   → selectedMesh = mesh
   → selectedMeshId = "uuid-123"
   → selectedMeshName = "Upper"
   → showCustomizationPanel = true

2. CustomizationPanel renders
   → Reads selectedMeshName from store
   → Displays "Upper"

3. ColorPicker renders
   → Reads meshCustomizations["uuid-123"] from store
   → Shows current color (or default)

4. User selects color "#FF0000"
   → updateMeshCustomization("uuid-123", { color: "#FF0000" }) called
   → meshCustomizations["uuid-123"] = { color: "#FF0000" }

5. GLTFModel useFrame hook
   → Reads meshCustomizations from store
   → Finds mesh by UUID
   → Applies color to material
   → Visual update in 3D scene
```

### Example 3: Switching Between Meshes

```
1. Mesh A selected
   → selectedMeshId = "uuid-A"
   → meshCustomizations["uuid-A"] = { color: "#FF0000" }

2. User clicks Mesh B
   → selectMesh(meshB, "uuid-B") called
   → selectedMeshId = "uuid-B"
   → selectedMeshName = "Sole"
   → showCustomizationPanel = true (still)

3. ColorPicker updates
   → Reads meshCustomizations["uuid-B"]
   → Shows default color (no customization yet)

4. Mesh A customization preserved
   → meshCustomizations["uuid-A"] still exists
   → Color still applied to Mesh A

5. User selects color for Mesh B
   → meshCustomizations["uuid-B"] = { color: "#0000FF" }
   → Both meshes now have different colors
```

## State Persistence

### Current Implementation

- **In-Memory Only**: State persists during session
- **Lost on Refresh**: State resets when page reloads
- **Per-Mesh**: Each mesh's customization stored independently

### Future Enhancements

1. **LocalStorage Persistence**:
```typescript
// Save to localStorage
localStorage.setItem('customizations', JSON.stringify(meshCustomizations));

// Load from localStorage
const saved = localStorage.getItem('customizations');
if (saved) {
  meshCustomizations = JSON.parse(saved);
}
```

2. **Backend Persistence**:
- Save customizations to database
- Load user's saved designs
- Share designs with others

3. **Export/Import**:
- Export customization data as JSON
- Import saved customizations
- Share via URL parameters

## State Optimization

### Selective Subscriptions

Zustand automatically optimizes re-renders. Components only re-render when their selected state changes:

```typescript
// Component only re-renders when isLoading changes
const isLoading = useAppStore((state) => state.isLoading);

// Component re-renders when ANY state changes (not recommended)
const state = useAppStore();
```

### Best Practices

1. **Select Only What You Need**:
```typescript
// ✅ Good - only subscribes to isLoading
const isLoading = useAppStore((state) => state.isLoading);

// ❌ Bad - subscribes to all state changes
const state = useAppStore();
```

2. **Use Actions, Don't Mutate**:
```typescript
// ✅ Good - use action
updateMeshCustomization(meshId, { color: "#FF0000" });

// ❌ Bad - direct mutation
meshCustomizations[meshId] = { color: "#FF0000" };
```

3. **Derive State When Possible**:
```typescript
// Derive from existing state
const hasCustomizations = Object.keys(meshCustomizations).length > 0;
```

## Store Initialization

```typescript
const initialState: AppState = {
  gltfModel: null,
  isLoading: false,
  error: null,
  selectedMesh: null,
  selectedMeshId: null,
  selectedMeshName: null,
  meshCustomizations: {},
  showCustomizationPanel: false,
};
```

Store is created with `create()` and initialized with `initialState`. All components share the same store instance.

