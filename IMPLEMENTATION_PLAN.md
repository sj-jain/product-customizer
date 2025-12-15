# Implementation Plan - Step by Step

## Quick Start Flow

```
┌─────────────────┐
│  Landing Page   │
│  (Product Grid) │
└────────┬────────┘
         │
         │ User selects product
         ▼
┌─────────────────┐
│  Dashboard      │
│  /customize/:id │
└────────┬────────┘
         │
         │ Load GLTF/GLB
         ▼
┌─────────────────┐
│  3D Canvas      │
│  (Three.js)     │
└────────┬────────┘
         │
         │ User clicks mesh
         ▼
┌─────────────────┐
│  Raycast        │
│  Detection      │
└────────┬────────┘
         │
         │ Highlight mesh (1s)
         ▼
┌─────────────────┐
│  Show Options   │
│  (Side Panel)   │
└────────┬────────┘
         │
         │ User customizes
         ▼
┌─────────────────┐
│  Update Model   │
│  (Apply Changes)│
└─────────────────┘
```

---

## Detailed Implementation Steps

### Step 1: Project Initialization ✅
- [x] Create architecture document
- [ ] Initialize React + TypeScript project
- [ ] Install all dependencies
- [ ] Setup Tailwind CSS
- [ ] Configure Vite/Webpack
- [ ] Setup folder structure

### Step 2: Landing Page
- [ ] Create product data mockup
- [ ] Build ProductCard component
- [ ] Build ProductGrid component
- [ ] Add routing setup
- [ ] Style landing page
- [ ] Add product thumbnails

### Step 3: 3D Viewer Setup
- [ ] Create Canvas component
- [ ] Setup Three.js scene
- [ ] Configure camera (PerspectiveCamera)
- [ ] Add lighting (Ambient + Directional)
- [ ] Create GLTFModel component
- [ ] Implement GLTF/GLB loader
- [ ] Add loading states
- [ ] Test with sample GLTF file

### Step 4: Camera Controls
- [ ] Add OrbitControls
- [ ] Configure zoom limits
- [ ] Configure rotation limits
- [ ] Add pan functionality
- [ ] Smooth camera transitions

### Step 5: Mesh Selection
- [ ] Implement raycasting system
- [ ] Add click event handler
- [ ] Detect mesh intersections
- [ ] Log selected mesh info
- [ ] Store selection in state

### Step 6: Highlight System
- [ ] Create highlight effect component
- [ ] Implement outline effect OR emissive highlight
- [ ] Add 1-second fade animation
- [ ] Remove highlight after animation
- [ ] Handle multiple mesh selection

### Step 7: Customization Panel
- [ ] Create sidebar component
- [ ] Show/hide based on selection
- [ ] Display selected mesh name
- [ ] Create ColorPicker component
- [ ] Create TextureSelector component
- [ ] Add customization options list

### Step 8: Material Customization
- [ ] Create material modification function
- [ ] Implement color change
- [ ] Preserve material properties
- [ ] Apply changes to mesh
- [ ] Update state with customizations

### Step 9: Configuration System
- [ ] Create product config structure
- [ ] Map mesh names to options
- [ ] Define customizable properties
- [ ] Load config per product
- [ ] Validate customization options

### Step 10: State Management
- [ ] Setup Zustand store
- [ ] Add product state
- [ ] Add selection state
- [ ] Add customization state
- [ ] Connect components to store

### Step 11: Polish & Testing
- [ ] Add error boundaries
- [ ] Improve loading UX
- [ ] Add reset functionality
- [ ] Responsive design
- [ ] Performance optimization
- [ ] Cross-browser testing

### Step 12: Future - Gemini Integration
- [ ] Setup Gemini API client
- [ ] Create prompt input UI
- [ ] Parse Gemini response
- [ ] Extract design properties
- [ ] Map to mesh customizations
- [ ] Apply AI suggestions

---

## Key Code Patterns

### GLTF Loading Pattern
```typescript
import { useGLTF } from '@react-three/drei';

function GLTFModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}
```

### Raycasting Pattern
```typescript
import { useThree } from '@react-three/fiber';
import { Raycaster, Vector2 } from 'three';

function useMeshSelection() {
  const { camera, scene, gl } = useThree();
  const raycaster = new Raycaster();
  const mouse = new Vector2();
  
  const handleClick = (event: MouseEvent) => {
    // Calculate mouse position
    // Cast ray
    // Find intersections
    // Return selected mesh
  };
}
```

### Highlight Pattern
```typescript
// Option 1: Emissive highlight
mesh.material.emissive.setHex(0x00ff00);
mesh.material.emissiveIntensity = 0.5;

// Option 2: Outline effect
import { Outline } from '@react-three/drei';
<mesh>
  <Outline visible={isSelected} />
</mesh>
```

---

## Testing Checklist

- [ ] GLTF file loads correctly
- [ ] Model displays in scene
- [ ] Camera controls work (zoom, rotate, pan)
- [ ] Click selects correct mesh
- [ ] Highlight appears and fades
- [ ] Customization panel shows correct options
- [ ] Color changes apply correctly
- [ ] Multiple parts can be customized
- [ ] State persists during session
- [ ] Responsive on mobile devices
- [ ] Performance is smooth (60fps)

---

## Sample Product Config

```typescript
export const productConfigs = {
  product1: {
    modelPath: '/models/product1.glb',
    customizableMeshes: {
      'upper_mesh': {
        name: 'Upper',
        colors: ['#000000', '#FFFFFF', '#FF0000', '#0000FF'],
        textures: ['leather', 'canvas'],
        defaultColor: '#000000'
      },
      'sole_mesh': {
        name: 'Sole',
        colors: ['#FFFFFF', '#000000', '#FFA500'],
        defaultColor: '#FFFFFF'
      }
    }
  }
};
```

---

## Ready to Start?

Once you approve the architecture, we'll begin with:
1. Project setup (Vite + React + TypeScript)
2. Installing dependencies
3. Creating the basic folder structure
4. Building the landing page
5. Implementing the 3D viewer

Let me know if you'd like any changes to the architecture before we start coding!

