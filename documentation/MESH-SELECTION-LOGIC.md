# Mesh Selection Logic - Complete Explanation

## Overview

When you click anywhere on the 3D model, the system uses **raycasting** to determine which mesh (3D object part) you clicked on. This document explains the complete flow from mouse click to mesh selection.

---

## Complete Flow Diagram

```
User Clicks on Canvas
    ↓
Mouse Event Captured
    ↓
Calculate Mouse Position (Screen → NDC)
    ↓
Create Ray from Camera Through Mouse Position
    ↓
Collect All Meshes from 3D Model
    ↓
Cast Ray Against All Meshes
    ↓
Find Intersections (if any)
    ↓
Get Closest Intersection (First Result)
    ↓
Extract Mesh Object and UUID
    ↓
Update Global State (Zustand Store)
    ↓
Trigger Visual Feedback (Highlight Effect)
    ↓
Show Customization Panel
```

---

## Step-by-Step Breakdown

### Step 1: Event Listener Setup

**Location**: `src/components/viewer/MeshSelector.tsx`

**Code**:
```typescript
useEffect(() => {
  const handleClick = (event: MouseEvent) => {
    // Selection logic here
  };
  
  gl.domElement.addEventListener('click', handleClick);
  return () => {
    gl.domElement.removeEventListener('click', handleClick);
  };
}, [camera, gl, model, selectMesh]);
```

**What Happens**:
- Component mounts → Event listener attached to canvas element
- Listens for `click` events on the 3D canvas
- Cleanup: Removes listener when component unmounts

**Key Objects**:
- `gl.domElement`: The HTML canvas element where 3D scene is rendered
- `camera`: Three.js camera object (from `useThree` hook)
- `model`: The 3D model scene object

---

### Step 2: Mouse Position Calculation

**Code**:
```typescript
const rect = gl.domElement.getBoundingClientRect();
mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
```

**What Happens**:
1. **Get Canvas Position**: `getBoundingClientRect()` gets canvas position on screen
2. **Convert to Normalized Device Coordinates (NDC)**:
   - X: `-1` (left) to `+1` (right)
   - Y: `-1` (bottom) to `+1` (top)
   - Note: Y is inverted because screen Y increases downward, but 3D Y increases upward

**Example**:
```
Canvas size: 800x600
Click at screen position: (400, 300) - center of canvas

Calculation:
x = ((400 - 0) / 800) * 2 - 1 = 0.0  (center)
y = -((300 - 0) / 600) * 2 + 1 = 0.0  (center)

Result: (0.0, 0.0) in NDC space
```

**Why NDC?**: Three.js uses NDC for raycasting - it's a coordinate system independent of screen size.

---

### Step 3: Ray Creation

**Code**:
```typescript
raycasterRef.current.setFromCamera(mouseRef.current, camera);
```

**What Happens**:
- Creates a **ray** (invisible line) starting from the camera
- Ray passes through the mouse position in 3D space
- Ray extends infinitely into the 3D scene

**Visual Representation**:
```
Camera (Eye)
    |
    |  ← Ray direction
    |
    ↓
Mouse Position (on near plane)
    |
    |  ← Ray continues
    ↓
3D Scene
    |
    ↓
Mesh (if intersection)
```

**Raycaster Object**:
- `THREE.Raycaster`: Three.js utility for ray-object intersection
- Stores ray origin (camera position) and direction
- Can test intersection with any 3D object

---

### Step 4: Collect All Meshes

**Code**:
```typescript
const meshes: THREE.Mesh[] = [];
model.traverse((child) => {
  if (child instanceof THREE.Mesh) {
    meshes.push(child);
  }
});
```

**What Happens**:
1. **Traverse Model**: Recursively walks through entire 3D model tree
2. **Find Meshes**: Checks each child object
3. **Filter Meshes**: Only collects `THREE.Mesh` objects (actual 3D geometry)
4. **Store in Array**: All meshes collected for intersection testing

**Model Structure Example**:
```
Scene (root)
  └── Group
      ├── Mesh (Upper part)
      ├── Mesh (Sole)
      └── Group
          └── Mesh (Laces)
```

**Result**: Array of all mesh objects in the model

**Why Collect All?**: Need to test ray against every mesh to find which one was clicked.

---

### Step 5: Ray-Mesh Intersection

**Code**:
```typescript
const intersections = raycasterRef.current.intersectObjects(meshes, true);
```

**What Happens**:
1. **Test Each Mesh**: Raycaster checks if ray intersects each mesh
2. **Calculate Intersection Points**: If ray hits mesh, calculates:
   - Intersection point (3D coordinates)
   - Distance from camera
   - Face that was hit
   - UV coordinates
3. **Sort by Distance**: Results sorted by distance (closest first)
4. **Return Array**: All intersections returned

**Parameters**:
- `meshes`: Array of meshes to test
- `true`: Recursive flag (also tests child objects)

**Intersection Result Format**:
```typescript
[
  {
    object: THREE.Mesh,      // The mesh that was hit
    point: THREE.Vector3,     // 3D intersection point
    distance: number,         // Distance from camera
    face: THREE.Face,        // Triangle face that was hit
    faceIndex: number,       // Index of face
    // ... more properties
  },
  // ... more intersections (if ray hits multiple meshes)
]
```

**Why Multiple Intersections?**: Ray can pass through multiple meshes (e.g., transparent objects, overlapping meshes).

---

### Step 6: Get Closest Mesh

**Code**:
```typescript
if (intersections.length > 0) {
  const selected = intersections[0].object as THREE.Mesh;
  // ... process selection
}
```

**What Happens**:
- **Check if Any Hits**: `intersections.length > 0` means ray hit something
- **Get First Result**: `intersections[0]` is the closest intersection (sorted by distance)
- **Extract Mesh**: Get the mesh object from intersection result

**Why First Result?**: 
- Intersections are sorted by distance (closest first)
- User wants to select what they see on top
- First intersection = closest to camera = what user clicked on

**Edge Cases**:
- `intersections.length === 0`: Clicked on empty space → Deselect
- Multiple intersections: Use closest one

---

### Step 7: Extract Mesh Information

**Code**:
```typescript
const meshId = selected.uuid;
const meshName = selected.name || `Mesh_${meshId.substring(0, 8)}`;
```

**What Happens**:
1. **Get UUID**: Unique identifier for this mesh (always exists)
2. **Get Name**: Mesh name from GLTF file (may be empty)
3. **Generate Name**: If no name, create one from UUID

**UUID (Universally Unique Identifier)**:
- Format: `"a1b2c3d4-e5f6-7890-abcd-ef1234567890"`
- Guaranteed unique for each mesh
- Used as key for storing customizations

**Mesh Name**:
- From GLTF file (e.g., "Upper", "Sole", "Laces")
- May be empty or undefined
- Used for display in UI

**Example**:
```typescript
// Mesh with name
mesh.name = "Upper"
mesh.uuid = "abc123..."

// Mesh without name
mesh.name = ""
mesh.uuid = "def456..."
meshName = "Mesh_def45678"  // Generated
```

---

### Step 8: Update Global State

**Code**:
```typescript
selectMesh(selected, meshId);
```

**Store Action** (`src/store/useAppStore.ts`):
```typescript
selectMesh: (mesh, meshId) => {
  const meshName = mesh?.name || (meshId ? `Mesh_${meshId.substring(0, 8)}` : null);
  set({ 
    selectedMesh: mesh,           // The actual mesh object
    selectedMeshId: meshId,        // UUID string
    selectedMeshName: meshName,   // Display name
    showCustomizationPanel: true   // Show panel
  });
}
```

**What Happens**:
1. **Store Mesh Object**: Keep reference to selected mesh
2. **Store UUID**: For unique identification
3. **Store Name**: For display in UI
4. **Show Panel**: Automatically open customization panel

**State Updates**:
- All components subscribed to store get notified
- UI updates automatically (React re-render)
- CustomizationPanel shows for selected mesh

---

### Step 9: Visual Feedback

**Location**: `src/components/viewer/HighlightEffect.tsx`

**What Happens**:
- Component receives `selectedMesh` from store
- Animates highlight effect (green glow)
- Duration: 1 second (fade in → hold → fade out)

**Highlight Animation**:
```typescript
// Modify material emissive color
mesh.material.emissive.setHex(0x00ff00);  // Green
mesh.material.emissiveIntensity = 0.8;
```

**Timeline**:
- 0.0s - 0.3s: Fade in (intensity 0 → 1)
- 0.3s - 0.7s: Hold at full intensity
- 0.7s - 1.0s: Fade out (intensity 1 → 0)

---

### Step 10: Show Customization Panel

**Location**: `src/components/customization/CustomizationPanel.tsx`

**What Happens**:
- Panel reads `selectedMeshId` from store
- Slides in from right (animation)
- Shows mesh name and customization options
- ColorPicker component displays for selected mesh

**Panel Content**:
- Selected mesh name
- Color picker
- Custom color input
- Preset color options

---

## Key Concepts

### Raycasting

**Definition**: Technique to determine which 3D object a 2D screen point corresponds to.

**How It Works**:
1. Create ray from camera through screen point
2. Test ray against all 3D objects
3. Find closest intersection
4. Return intersected object

**Why Use It?**:
- Standard technique in 3D graphics
- Works with any 3D geometry
- Handles complex scenes with many objects
- Efficient (Three.js optimized)

### Normalized Device Coordinates (NDC)

**Definition**: Coordinate system where:
- X: -1 (left) to +1 (right)
- Y: -1 (bottom) to +1 (top)
- Z: -1 (near) to +1 (far)

**Why Use NDC?**:
- Independent of screen size
- Works with any resolution
- Standard in 3D graphics
- Required by Three.js raycasting

### Mesh Identification

**UUID vs Name**:
- **UUID**: Always unique, always exists → Used for storage
- **Name**: May be empty → Used for display

**Why UUID?**:
- Guaranteed unique (even if names are same)
- Persistent across sessions
- Reliable for storing customizations
- Works even if GLTF has unnamed meshes

---

## Code Flow Summary

```typescript
// 1. Click event
handleClick(event: MouseEvent) {
  
  // 2. Calculate mouse position
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  
  // 3. Create ray
  raycaster.setFromCamera(mouse, camera);
  
  // 4. Collect meshes
  const meshes = [];
  model.traverse(child => {
    if (child instanceof THREE.Mesh) {
      meshes.push(child);
    }
  });
  
  // 5. Find intersections
  const intersections = raycaster.intersectObjects(meshes, true);
  
  // 6. Get closest mesh
  if (intersections.length > 0) {
    const selected = intersections[0].object;
    const meshId = selected.uuid;
    
    // 7. Update state
    selectMesh(selected, meshId);
  } else {
    // 8. Deselect if no hit
    selectMesh(null, null);
  }
}
```

---

## Edge Cases & Error Handling

### 1. Click on Empty Space
- **Situation**: Ray doesn't hit any mesh
- **Handling**: `intersections.length === 0` → Deselect mesh
- **Result**: Panel closes, no mesh selected

### 2. Multiple Meshes at Same Position
- **Situation**: Ray hits multiple overlapping meshes
- **Handling**: Use first intersection (closest to camera)
- **Result**: Topmost mesh is selected

### 3. Transparent Meshes
- **Situation**: Ray passes through transparent mesh
- **Handling**: Raycaster still detects intersection
- **Result**: Transparent mesh can be selected (may want to filter in future)

### 4. Nested Meshes
- **Situation**: Meshes inside groups
- **Handling**: `traverse()` recursively finds all meshes
- **Result**: All meshes are testable

### 5. Mesh Without Name
- **Situation**: GLTF mesh has no name property
- **Handling**: Generate name from UUID
- **Result**: `Mesh_abc12345` displayed in UI

---

## Performance Considerations

### Optimization Strategies

1. **Mesh Collection**: Done once per click (not every frame)
2. **Raycasting**: Three.js optimized C++ implementation
3. **Intersection Sorting**: Only first result needed (closest)
4. **State Updates**: Only when selection changes

### Potential Improvements

1. **Spatial Indexing**: Use BVH (Bounding Volume Hierarchy) for faster intersection
2. **Mesh Filtering**: Skip invisible or non-selectable meshes
3. **Debouncing**: Prevent rapid selection changes
4. **Caching**: Cache mesh list if model doesn't change

---

## Debugging

### Console Logs

When mesh is selected, console shows:
```javascript
{
  name: "Upper",              // Mesh name
  uuid: "abc123...",          // Unique ID
  mesh: THREE.Mesh,          // Mesh object
  material: THREE.Material   // Material object
}
```

### Visual Debugging

1. **Highlight Effect**: Confirms selection visually
2. **Panel Display**: Shows selected mesh name
3. **Console Logs**: Shows selection details

### Common Issues

1. **No Selection**: Check if meshes are in scene
2. **Wrong Mesh**: Check raycasting calculation
3. **Panel Not Showing**: Check state update
4. **Multiple Selections**: Check intersection sorting

---

## Summary

The mesh selection system uses **raycasting** to determine which 3D object you clicked:

1. **Mouse Click** → Event captured
2. **Position Calculation** → Screen to NDC conversion
3. **Ray Creation** → From camera through mouse position
4. **Mesh Collection** → Find all meshes in scene
5. **Intersection Test** → Ray vs all meshes
6. **Closest Hit** → Get first intersection
7. **State Update** → Store selected mesh
8. **Visual Feedback** → Highlight animation
9. **UI Update** → Show customization panel

This is a standard, efficient approach used in all 3D applications for object selection.

