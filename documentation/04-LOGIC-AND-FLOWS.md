# Logic and Flows Documentation

## Application Flow

### 1. Application Initialization Flow

```
1. index.html loads
   ↓
2. main.tsx executes
   ↓
3. ReactDOM.createRoot() mounts App
   ↓
4. App.tsx renders BrowserRouter
   ↓
5. Routes render CustomizePage
   ↓
6. CustomizePage sets up Canvas
   ↓
7. GLTFModel component mounts
   ↓
8. useGLTF hook loads model file
   ↓
9. Model loads → scene object created
   ↓
10. useEffect in GLTFModel:
    - Sets loading state
    - Stores model in global state
    - Logs all meshes to console
    - Builds mesh UUID map
    ↓
11. Model renders in 3D scene
   ↓
12. Loading screen disappears
```

### 2. Mesh Selection Flow

```
User clicks on canvas
   ↓
Mouse event captured
   ↓
Calculate mouse position (NDC coordinates)
   ↓
Create ray from camera through mouse position
   ↓
Raycast against all meshes in scene
   ↓
Find first intersection
   ↓
Extract mesh UUID and name
   ↓
Call selectMesh(mesh, meshId)
   ↓
Store updates:
  - selectedMesh = clicked mesh
  - selectedMeshId = mesh UUID
  - selectedMeshName = mesh name or generated
  - showCustomizationPanel = true
   ↓
HighlightEffect component mounts
   ↓
Animation starts (1 second fade)
   ↓
CustomizationPanel slides in
   ↓
ColorPicker displays for selected mesh
```

### 3. Color Customization Flow

```
User selects color (preset or custom)
   ↓
handleColorSelect() or handleCustomColorChange()
   ↓
updateMeshCustomization(meshId, { color })
   ↓
Zustand store updates:
  meshCustomizations[meshId] = { color: "#..." }
   ↓
GLTFModel useFrame hook runs (60fps)
   ↓
Check if meshId exists in customizations
   ↓
Get mesh from UUID map
   ↓
applyCustomizations(mesh, customization)
   ↓
Clone material if not already cloned
   ↓
Apply color to material
   ↓
material.needsUpdate = true
   ↓
Three.js renders updated material
   ↓
Color change visible in real-time
```

### 4. Material Cloning Logic

**Problem**: Multiple meshes may share the same material. Changing one affects all.

**Solution**: Clone materials before modification.

```
First customization applied to mesh
   ↓
Check if original material stored
   ↓
If not stored:
  - Store original material in WeakMap
  - Clone material (material.clone())
  - Assign cloned material to mesh
   ↓
Apply customization to cloned material
   ↓
Each mesh now has independent material
   ↓
Future customizations use already-cloned material
```

**Implementation**:
- `originalMaterials` WeakMap stores original materials
- Materials cloned only once per mesh
- Cloned materials are independent

### 5. Highlight Animation Logic

```
Mesh selected
   ↓
HighlightEffect component mounts
   ↓
Store original emissive color
   ↓
useFrame hook runs every frame (60fps)
   ↓
Calculate animation progress:
  - time < 0.3s: Fade in (0 → 1)
  - time < 0.7s: Hold (1)
  - time < 1.0s: Fade out (1 → 0)
   ↓
Lerp between original and highlight color
   ↓
Update material.emissive
   ↓
Update material.emissiveIntensity
   ↓
After 1 second: Animation complete
   ↓
Component unmounts (highlight removed)
```

**Color Calculation**:
```typescript
highlightIntensity = calculateIntensity(time)
emissiveColor = lerp(originalColor, greenColor, intensity * 0.5)
emissiveIntensity = intensity * 0.8
```

### 6. Raycasting Algorithm

```
1. Get mouse position in screen coordinates
   ↓
2. Convert to normalized device coordinates (NDC):
   x = (clientX / width) * 2 - 1
   y = -(clientY / height) * 2 + 1
   ↓
3. Create Raycaster instance
   ↓
4. Set ray from camera through mouse position:
   raycaster.setFromCamera(mouse, camera)
   ↓
5. Collect all meshes from scene:
   scene.traverse() → collect Mesh objects
   ↓
6. Intersect ray with meshes:
   raycaster.intersectObjects(meshes, true)
   ↓
7. Get first intersection (closest to camera)
   ↓
8. Extract mesh object from intersection
   ↓
9. Return mesh for selection
```

### 7. State Management Flow

**Zustand Store Structure**:

```typescript
{
  // Model State
  gltfModel: THREE.Object3D | null
  isLoading: boolean
  error: string | null
  
  // Selection State
  selectedMesh: THREE.Mesh | null
  selectedMeshId: string | null
  selectedMeshName: string | null
  
  // Customization State
  meshCustomizations: {
    [meshId: string]: {
      color?: string
      texture?: string
      // ... other properties
    }
  }
  
  // UI State
  showCustomizationPanel: boolean
}
```

**State Updates**:

1. **Model Loading**:
   - `setLoading(true)` → Loading screen shows
   - `setGLTFModel(scene)` → Model stored
   - `setLoading(false)` → Loading screen hides

2. **Mesh Selection**:
   - `selectMesh(mesh, meshId)` → Updates selection state
   - Triggers panel visibility
   - Triggers highlight effect

3. **Customization**:
   - `updateMeshCustomization(meshId, customization)` → Updates specific mesh
   - Triggers material update in next frame

4. **Reset**:
   - `reset()` → Clears all state to initial values

### 8. Rendering Pipeline

```
React Render Cycle
   ↓
CustomizePage renders
   ↓
Canvas component renders
   ↓
Three.js scene setup:
  - Camera positioned
  - Lights added
  - Environment loaded
   ↓
GLTFModel renders:
  - Model primitive added to scene
  - MeshSelector added
   ↓
OrbitControls attached
   ↓
Three.js render loop (60fps):
  1. Update camera (OrbitControls)
  2. Update animations (useFrame hooks)
  3. Apply customizations (GLTFModel useFrame)
  4. Render scene
   ↓
Frame displayed
   ↓
Repeat
```

### 9. Error Handling Flow

```
Model loading fails
   ↓
useGLTF throws error
   ↓
React error boundary catches (if implemented)
   ↓
OR: Error logged to console
   ↓
User sees blank scene or error message
   ↓
Check browser console for details
```

**Current Implementation**:
- Errors logged to console
- No error boundary (can be added)
- Loading state handles async loading

### 10. Customization Persistence

**Current**: Customizations stored in memory (Zustand store)

**Flow**:
```
User customizes mesh
   ↓
Customization stored in meshCustomizations[meshId]
   ↓
Persists during session
   ↓
User selects different mesh
   ↓
Previous customization remains in store
   ↓
User returns to original mesh
   ↓
ColorPicker reads from store
   ↓
Previous color displayed
```

**Future Enhancement**:
- Save to localStorage
- Save to backend
- Export customization data

## Key Algorithms

### 1. Mesh UUID Mapping

```typescript
// Build map when model loads
meshMapRef.current.clear();
scene.traverse((child) => {
  if (child instanceof THREE.Mesh) {
    meshMapRef.current.set(child.uuid, child);
  }
});

// Use map for customization
const mesh = meshMapRef.current.get(meshId);
if (mesh) {
  applyCustomizations(mesh, customization);
}
```

### 2. Material Cloning

```typescript
if (!originalMaterials.has(mesh)) {
  // Store original
  originalMaterials.set(mesh, mesh.material);
  
  // Clone
  if (Array.isArray(mesh.material)) {
    mesh.material = mesh.material.map(mat => mat.clone());
  } else {
    mesh.material = mesh.material.clone();
  }
}
```

### 3. Color Application

```typescript
// Parse hex color
const hexColor = color.startsWith('#') 
  ? color.substring(1) 
  : color;

// Convert to number
const colorNumber = parseInt(hexColor, 16);

// Apply to material
material.color.setHex(colorNumber);
material.needsUpdate = true;
```

## Performance Considerations

1. **Material Cloning**: Only clones once per mesh (cached)
2. **Mesh Map**: Built once on load, reused for lookups
3. **useFrame Optimization**: Only processes meshes with customizations
4. **WeakMap Usage**: Original materials can be garbage collected
5. **Conditional Rendering**: Components only render when needed

## Data Flow Summary

```
User Input
   ↓
Event Handler
   ↓
Store Update (Zustand)
   ↓
Component Re-render
   ↓
useFrame Hook (if needed)
   ↓
Three.js Update
   ↓
Visual Change
```

