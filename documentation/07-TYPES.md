# Type Definitions Documentation

## Overview

All TypeScript type definitions are located in `src/types/index.ts`. This file exports all interfaces and types used throughout the application.

## Type Definitions

### `MeshCustomization`

**Purpose**: Defines customization properties for a mesh

**Location**: `src/types/index.ts`

**Definition**:
```typescript
export interface MeshCustomization {
  color?: string;           // Hex color code (e.g., "#FF0000")
  texture?: string;         // Texture file path (future)
  normalMap?: string;        // Normal map texture path (future)
  roughnessMap?: string;    // Roughness map texture path (future)
  metalnessMap?: string;    // Metalness map texture path (future)
}
```

**Properties**:
- All properties are optional (`?`)
- `color`: String hex code with or without `#`
- `texture`: Path to diffuse texture (future feature)
- `normalMap`: Path to normal map texture (future feature)
- `roughnessMap`: Path to roughness map texture (future feature)
- `metalnessMap`: Path to metalness map texture (future feature)

**Usage**:
```typescript
const customization: MeshCustomization = {
  color: "#FF0000"
};

// Or with multiple properties
const fullCustomization: MeshCustomization = {
  color: "#0000FF",
  texture: "/textures/leather.jpg",
  normalMap: "/textures/leather_normal.jpg"
};
```

---

### `CustomizableMesh`

**Purpose**: Defines configuration for a customizable mesh part

**Location**: `src/types/index.ts`

**Definition**:
```typescript
export interface CustomizableMesh {
  name: string;                    // Internal mesh name
  displayName: string;             // User-friendly display name
  colors?: string[];               // Available color options
  textures?: string[];            // Available texture options
  defaultColor?: string;           // Default color value
}
```

**Properties**:
- `name`: Internal identifier (matches mesh name in GLTF)
- `displayName`: Shown to user in UI
- `colors`: Array of available hex colors (optional)
- `textures`: Array of available texture names (optional)
- `defaultColor`: Default hex color (optional)

**Usage**:
```typescript
const upperMesh: CustomizableMesh = {
  name: "upper_mesh",
  displayName: "Upper",
  colors: ["#000000", "#FFFFFF", "#FF0000"],
  textures: ["leather", "canvas"],
  defaultColor: "#000000"
};
```

**Future Use**: This type will be used for product configuration files that define which meshes can be customized and what options are available.

---

### `ProductConfig`

**Purpose**: Defines configuration for a product

**Location**: `src/types/index.ts`

**Definition**:
```typescript
export interface ProductConfig {
  id: string;                     // Product identifier
  name: string;                   // Product display name
  modelPath: string;              // Path to GLTF/GLB file
  thumbnail?: string;             // Thumbnail image path (optional)
  customizableMeshes: {
    [meshName: string]: CustomizableMesh;
  };
}
```

**Properties**:
- `id`: Unique product identifier
- `name`: Product name for display
- `modelPath`: Relative path to 3D model file
- `thumbnail`: Optional thumbnail image
- `customizableMeshes`: Object mapping mesh names to customization configs

**Usage**:
```typescript
const productConfig: ProductConfig = {
  id: "shoe-001",
  name: "Running Shoe",
  modelPath: "/models/shoe.glb",
  thumbnail: "/thumbnails/shoe.jpg",
  customizableMeshes: {
    "upper_mesh": {
      name: "upper_mesh",
      displayName: "Upper",
      colors: ["#000000", "#FFFFFF"],
      defaultColor: "#000000"
    },
    "sole_mesh": {
      name: "sole_mesh",
      displayName: "Sole",
      colors: ["#FFFFFF", "#000000"],
      defaultColor: "#FFFFFF"
    }
  }
};
```

**Future Use**: This will be used for product configuration files that define available products and their customization options.

---

### `AppState`

**Purpose**: Defines the complete application state structure

**Location**: `src/types/index.ts`

**Definition**:
```typescript
export interface AppState {
  // Model
  gltfModel: any | null;
  isLoading: boolean;
  error: string | null;
  
  // Selection
  selectedMesh: THREE.Mesh | null;
  selectedMeshId: string | null;
  selectedMeshName: string | null;
  
  // Customization
  meshCustomizations: {
    [meshId: string]: MeshCustomization;
  };
  
  // UI
  showCustomizationPanel: boolean;
}
```

**Properties**:

#### Model State
- `gltfModel`: Three.js scene object (loaded GLTF model)
- `isLoading`: Boolean flag for loading state
- `error`: Error message string or null

#### Selection State
- `selectedMesh`: Currently selected Three.js mesh object
- `selectedMeshId`: UUID string for unique mesh identification
- `selectedMeshName`: Display name for selected mesh

#### Customization State
- `meshCustomizations`: Object mapping mesh UUIDs to customization objects

#### UI State
- `showCustomizationPanel`: Boolean flag for panel visibility

**Usage**: This interface is used by the Zustand store to type the application state.

---

## Three.js Types

The application also uses types from the `three` package:

### `THREE.Mesh`
- Three.js mesh object
- Contains geometry and material
- Used for 3D model parts

### `THREE.Object3D`
- Base class for all 3D objects
- Used for scene and model containers

### `THREE.MeshStandardMaterial`
- PBR (Physically Based Rendering) material
- Supports color, textures, roughness, metalness
- Used for material customization

### `THREE.Vector2`
- 2D vector for mouse coordinates
- Used in raycasting

### `THREE.Vector3`
- 3D vector for positions
- Used for camera and object positions

### `THREE.Raycaster`
- Raycasting utility
- Used for mesh selection

### `THREE.Color`
- Color representation
- Used for material colors

---

## Type Usage Patterns

### Component Props

```typescript
interface ColorPickerProps {
  meshId: string;
}

function ColorPicker({ meshId }: ColorPickerProps) {
  // Component implementation
}
```

### Store State

```typescript
const { selectedMesh, selectedMeshId } = useAppStore((state) => ({
  selectedMesh: state.selectedMesh,      // THREE.Mesh | null
  selectedMeshId: state.selectedMeshId   // string | null
}));
```

### Function Parameters

```typescript
function applyCustomizations(
  mesh: THREE.Mesh,
  customization: MeshCustomization
): void {
  // Function implementation
}
```

### Event Handlers

```typescript
const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const color = e.target.value;  // string
  updateMeshCustomization(meshId, { color });
};
```

---

## Type Safety Benefits

1. **Compile-Time Checking**: TypeScript catches type errors before runtime
2. **IntelliSense**: Auto-completion in IDEs
3. **Refactoring Safety**: Changes propagate through type system
4. **Documentation**: Types serve as inline documentation
5. **Error Prevention**: Prevents common mistakes (wrong property names, etc.)

---

## Future Type Additions

### Texture Configuration

```typescript
export interface TextureConfig {
  name: string;
  path: string;
  type: 'diffuse' | 'normal' | 'roughness' | 'metalness';
}
```

### Animation State

```typescript
export interface AnimationState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
}
```

### Export Configuration

```typescript
export interface ExportConfig {
  format: 'gltf' | 'glb' | 'obj';
  includeTextures: boolean;
  quality: 'low' | 'medium' | 'high';
}
```

---

## Type Import Pattern

```typescript
// Import types
import { MeshCustomization, AppState } from '../types';

// Import Three.js types
import * as THREE from 'three';

// Use in code
const customization: MeshCustomization = {
  color: "#FF0000"
};
```

---

## Type Guards

### Checking Mesh Type

```typescript
if (object instanceof THREE.Mesh) {
  // TypeScript knows object is THREE.Mesh here
  object.material = newMaterial;
}
```

### Checking Material Type

```typescript
if (material instanceof THREE.MeshStandardMaterial) {
  // TypeScript knows material is MeshStandardMaterial
  material.color.setHex(0xff0000);
}
```

---

## Common Type Patterns

### Nullable Types

```typescript
selectedMesh: THREE.Mesh | null;
```

### Optional Properties

```typescript
color?: string;  // Optional property
```

### Index Signatures

```typescript
meshCustomizations: {
  [meshId: string]: MeshCustomization;
};
```

### Union Types

```typescript
error: string | null;
```

