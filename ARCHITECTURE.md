# 3D Product Customizer Architecture

## Project Overview
A web-based 3D product customizer similar to Nike By You, allowing users to:
- Select products from a landing page
- View and interact with 3D models (GLTF/GLB)
- Select mesh parts with visual highlighting
- Customize selected parts (colors, textures, materials)
- Future: AI-powered design suggestions via Gemini API

---

## Technology Stack

### Frontend Framework
- **React** (with TypeScript) - Component-based UI
- **Next.js** (optional) - For routing and SSR if needed, or React with React Router

### 3D Rendering
- **Three.js** - Core 3D rendering engine
- **@react-three/fiber** - React renderer for Three.js
- **@react-three/drei** - Useful helpers and abstractions
- **gltfjsx** (optional) - Generate React components from GLTF files

### State Management
- **Zustand** or **Context API** - For global state (selected mesh, customization options, etc.)

### Styling
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - For smooth animations and transitions

### File Handling
- **GLTF/GLB Loader** - Built-in Three.js GLTFLoader

---

## Architecture Components

### 1. Landing Page (`/`)
**Purpose**: Product selection interface

**Components**:
- `ProductGrid` - Displays available products
- `ProductCard` - Individual product card with thumbnail
- Navigation to dashboard with product ID

**Features**:
- Grid/list view of products
- Product thumbnails
- Click to navigate to customization dashboard

---

### 2. Dashboard/3D Viewer (`/customize/:productId`)
**Purpose**: Main 3D customization interface

**Components**:

#### A. 3D Canvas Container
- `Canvas` (from @react-three/fiber) - Main 3D rendering container
- `Scene` - Three.js scene setup
- `Camera` - Perspective camera with controls
- `Lights` - Ambient, directional, and point lights
- `GLTFModel` - Component to load and display GLTF/GLB files

#### B. Model Loader
- `useGLTF` hook - Load GLTF/GLB files
- Error handling for failed loads
- Loading states and progress indicators

#### C. Interaction System
- `MeshSelector` - Raycasting for mesh selection
- `HighlightManager` - Manages highlight effects on selected meshes
- `OrbitControls` - Camera controls (zoom, pan, rotate)

#### D. Customization Panel
- `CustomizationSidebar` - Side panel with options
- `ColorPicker` - Color selection for materials
- `TextureSelector` - Texture/material options
- `PartList` - List of customizable parts

#### E. UI Overlays
- `LoadingScreen` - Shows while model loads
- `Toolbar` - Reset, export, save options
- `InfoPanel` - Product information

---

## Data Flow

```
Landing Page
    ↓ (User selects product)
Dashboard Route (/customize/:productId)
    ↓
Load GLTF/GLB File
    ↓
Parse Model Structure
    ↓ (Extract mesh names, materials)
Initialize State
    ↓
Render 3D Scene
    ↓
User Interaction (Click on mesh)
    ↓
Raycast Detection
    ↓
Highlight Selected Mesh
    ↓
Show Customization Options
    ↓
Apply Changes (Color/Texture)
    ↓
Update 3D Model
```

---

## State Management Structure

```typescript
interface AppState {
  // Product
  currentProduct: Product | null;
  gltfModel: GLTF | null;
  
  // Selection
  selectedMesh: THREE.Mesh | null;
  selectedMeshName: string | null;
  
  // Customization
  meshCustomizations: {
    [meshName: string]: {
      color?: string;
      texture?: string;
      material?: string;
    };
  };
  
  // UI
  isLoading: boolean;
  showCustomizationPanel: boolean;
  cameraPosition: THREE.Vector3;
}
```

---

## Key Features Implementation

### 1. GLTF/GLB Loading
- Use `useGLTF` from @react-three/drei
- Support both GLTF and GLB formats
- Handle loading states and errors
- Extract mesh information for customization

### 2. Mesh Selection & Highlighting
- **Raycasting**: Cast ray from camera through mouse position
- **Intersection Detection**: Find intersected mesh
- **Highlight Effect**: 
  - Option 1: Outline effect using `OutlineEffect` from drei
  - Option 2: Change material emissive color temporarily
  - Option 3: Add wireframe overlay
- **Animation**: Fade in/out highlight (1 second duration)

### 3. Customization System
- **Material Mapping**: Map mesh names to customizable properties
- **Color Customization**: 
  - Create new material with selected color
  - Preserve other material properties (roughness, metalness)
- **Texture Customization**:
  - Load texture images
  - Apply to material maps (diffuse, normal, etc.)

### 4. Mesh Metadata
- Store customization options per mesh in a config file
- Example structure:
```json
{
  "meshName": "shoe_upper",
  "customizable": true,
  "options": {
    "colors": ["#000000", "#FFFFFF", "#FF0000"],
    "textures": ["leather", "canvas", "mesh"],
    "defaultColor": "#000000"
  }
}
```

---

## File Structure

```
/
├── public/
│   ├── models/          # GLTF/GLB files
│   │   ├── product1.glb
│   │   └── product2.gltf
│   └── textures/        # Texture images
│
├── src/
│   ├── components/
│   │   ├── landing/
│   │   │   ├── ProductGrid.tsx
│   │   │   └── ProductCard.tsx
│   │   ├── viewer/
│   │   │   ├── CanvasContainer.tsx
│   │   │   ├── GLTFModel.tsx
│   │   │   ├── MeshSelector.tsx
│   │   │   ├── HighlightEffect.tsx
│   │   │   └── OrbitControls.tsx
│   │   ├── customization/
│   │   │   ├── CustomizationPanel.tsx
│   │   │   ├── ColorPicker.tsx
│   │   │   ├── TextureSelector.tsx
│   │   │   └── PartList.tsx
│   │   └── ui/
│   │       ├── LoadingScreen.tsx
│   │       └── Toolbar.tsx
│   │
│   ├── hooks/
│   │   ├── useModelLoader.ts
│   │   ├── useMeshSelection.ts
│   │   └── useCustomization.ts
│   │
│   ├── store/
│   │   └── useAppStore.ts        # Zustand store
│   │
│   ├── config/
│   │   └── productConfig.ts      # Mesh customization configs
│   │
│   ├── utils/
│   │   ├── gltfHelpers.ts
│   │   └── materialHelpers.ts
│   │
│   ├── types/
│   │   └── index.ts
│   │
│   ├── App.tsx
│   ├── pages/
│   │   ├── LandingPage.tsx
│   │   └── CustomizePage.tsx
│   └── main.tsx
│
├── package.json
└── README.md
```

---

## Implementation Steps

### Phase 1: Project Setup
1. Initialize React + TypeScript project
2. Install dependencies (Three.js, React Three Fiber, etc.)
3. Setup Tailwind CSS
4. Configure routing (React Router)

### Phase 2: Landing Page
1. Create product data structure
2. Build ProductGrid component
3. Build ProductCard component
4. Implement navigation to dashboard

### Phase 3: 3D Viewer Foundation
1. Setup Canvas component
2. Configure camera and lights
3. Implement basic GLTF loader
4. Display 3D model in scene
5. Add OrbitControls for camera manipulation

### Phase 4: Interaction System
1. Implement raycasting for mesh selection
2. Add click event handlers
3. Create highlight effect system
4. Add animation for highlight (1 second fade)

### Phase 5: Customization System
1. Create customization panel UI
2. Implement color picker
3. Add material modification logic
4. Create texture selector (if needed)
5. Map customization options to meshes

### Phase 6: State Management
1. Setup Zustand store
2. Connect selection to state
3. Connect customization to state
4. Persist customizations

### Phase 7: Polish & Enhancement
1. Add loading states
2. Error handling
3. Responsive design
4. Performance optimization
5. Export/save functionality

### Phase 8: Future - Gemini Integration
1. Setup Gemini API client
2. Create prompt interface
3. Parse Gemini response for design properties
4. Map properties to mesh customizations
5. Apply AI-generated customizations

---

## Technical Considerations

### Performance
- Use `useMemo` for expensive calculations
- Implement LOD (Level of Detail) if needed
- Optimize texture sizes
- Use `useFrame` efficiently for animations

### Accessibility
- Keyboard navigation support
- Screen reader friendly
- High contrast mode support

### Browser Compatibility
- WebGL support detection
- Fallback for unsupported browsers
- Mobile device optimization

### Error Handling
- GLTF load failures
- Missing mesh configurations
- Invalid customization values
- Network errors

---

## Future Enhancements

1. **Gemini AI Integration**
   - Natural language to design conversion
   - Prompt: "Make it red with white stripes"
   - Parse response and apply to meshes

2. **Advanced Features**
   - Pattern application
   - Logo/text placement
   - Material properties (roughness, metalness)
   - Multiple product views
   - Save/load customizations
   - Share designs

3. **Backend Integration**
   - Save customizations to database
   - User accounts
   - Design gallery
   - Order processing

---

## Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "three": "^0.158.0",
    "@react-three/fiber": "^8.15.0",
    "@react-three/drei": "^9.88.0",
    "zustand": "^4.4.7",
    "framer-motion": "^10.16.16",
    "tailwindcss": "^3.3.6"
  },
  "devDependencies": {
    "@types/three": "^0.158.3",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.3.3",
    "vite": "^5.0.8"
  }
}
```

---

## Next Steps

1. Review and approve this architecture
2. Initialize project with dependencies
3. Start with Phase 1 (Project Setup)
4. Iterate through phases sequentially
5. Test each phase before moving to next

