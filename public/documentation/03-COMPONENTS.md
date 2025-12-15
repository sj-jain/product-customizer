# Components Documentation

## Component Hierarchy

```
App
└── BrowserRouter
    └── Routes
        └── CustomizePage
            ├── Canvas (3D Scene)
            │   ├── PerspectiveCamera
            │   ├── Lights (ambient, directional, point)
            │   ├── Environment
            │   ├── GLTFModel
            │   │   ├── primitive (3D model)
            │   │   └── MeshSelector
            │   │       └── HighlightEffect
            │   └── OrbitControls
            ├── LoadingScreen
            ├── Toolbar
            └── CustomizationPanel
                └── ColorPicker
```

## Core Components

### 1. App (`src/App.tsx`)

**Purpose**: Main application component with routing setup

**Props**: None

**Responsibilities**:
- Setup React Router
- Define application routes
- Root-level routing configuration

**Routes**:
- `/` → CustomizePage
- `/customize` → CustomizePage

**Key Code**:
```tsx
<BrowserRouter>
  <Routes>
    <Route path="/" element={<CustomizePage />} />
    <Route path="/customize" element={<CustomizePage />} />
  </Routes>
</BrowserRouter>
```

---

### 2. CustomizePage (`src/pages/CustomizePage.tsx`)

**Purpose**: Main 3D customization interface page

**Props**: None

**State**: Uses `useAppStore` for loading state

**Responsibilities**:
- Setup 3D Canvas with Three.js
- Configure camera and lighting
- Render 3D model
- Display UI overlays (toolbar, customization panel, loading screen)

**Key Features**:
- Canvas configuration (antialiasing, DPR)
- Camera setup (PerspectiveCamera)
- Lighting setup (ambient, directional, point lights)
- Environment lighting
- OrbitControls for camera manipulation

**Child Components**:
- `GLTFModel` - 3D model renderer
- `LoadingScreen` - Loading indicator
- `Toolbar` - Top toolbar
- `CustomizationPanel` - Right sidebar

---

### 3. GLTFModel (`src/components/viewer/GLTFModel.tsx`)

**Purpose**: Load and render GLTF/GLB 3D models

**Props**: None (uses MODEL_PATH constant)

**State**: 
- Uses `useAppStore` for model state and customizations
- Local refs for model group and mesh map

**Responsibilities**:
- Load GLTF/GLB file using `useGLTF` hook
- Store model in global state
- Log all meshes for debugging
- Apply customizations to meshes
- Render model in scene

**Key Features**:
- Automatic mesh detection and logging
- Mesh UUID mapping for customization
- Real-time customization application via `useFrame`
- Material customization per mesh

**Hooks Used**:
- `useGLTF` - Load 3D model
- `useFrame` - Animation loop for applying customizations
- `useEffect` - Initialize model and build mesh map
- `useRef` - Store model reference and mesh map

**Child Components**:
- `MeshSelector` - Handles mesh selection

---

### 4. MeshSelector (`src/components/viewer/MeshSelector.tsx`)

**Purpose**: Handle mesh selection via raycasting

**Props**:
- `model: THREE.Object3D` - The 3D model to select from

**State**: Uses `useAppStore` for selection state

**Responsibilities**:
- Listen for click events on canvas
- Calculate mouse position in normalized device coordinates
- Cast ray from camera through mouse position
- Find intersected meshes
- Select clicked mesh and update state

**Key Features**:
- Raycasting for 3D object selection
- Mouse position calculation
- Mesh intersection detection
- UUID-based mesh identification
- Console logging for debugging

**Hooks Used**:
- `useThree` - Access Three.js context (camera, gl, raycaster)
- `useEffect` - Setup click event listener
- `useRef` - Store raycaster and mouse position

**Child Components**:
- `HighlightEffect` - Visual feedback for selection

---

### 5. HighlightEffect (`src/components/viewer/HighlightEffect.tsx`)

**Purpose**: Visual highlight effect when mesh is selected

**Props**:
- `mesh: THREE.Mesh` - The mesh to highlight

**State**: Local refs for animation state

**Responsibilities**:
- Animate highlight effect (green glow)
- Fade in (0.3s) → Hold (0.4s) → Fade out (0.3s)
- Total duration: 1 second
- Modify material emissive color

**Key Features**:
- Smooth animation using `useFrame`
- Emissive color modification
- Preserves original material properties
- Automatic cleanup after animation

**Animation Timeline**:
- 0.0s - 0.3s: Fade in (intensity 0 → 1)
- 0.3s - 0.7s: Hold at full intensity
- 0.7s - 1.0s: Fade out (intensity 1 → 0)

**Hooks Used**:
- `useFrame` - Animation loop
- `useEffect` - Initialize and cleanup

---

### 6. CustomizationPanel (`src/components/customization/CustomizationPanel.tsx`)

**Purpose**: Sidebar panel for customization options

**Props**: None

**State**: Uses `useAppStore` for panel visibility and selection

**Responsibilities**:
- Display customization options
- Show selected mesh information
- Animate slide-in/out
- Handle panel close

**Key Features**:
- Slide-in animation from right
- Conditional rendering based on selection
- Display selected mesh name
- Close button functionality

**Animation**:
- Slide from right (x: 400 → 0)
- Spring animation (damping: 25, stiffness: 200)
- Exit animation when closed

**Child Components**:
- `ColorPicker` - Color selection component

**Hooks Used**:
- `useAppStore` - Access state
- `framer-motion` - Animations

---

### 7. ColorPicker (`src/components/customization/ColorPicker.tsx`)

**Purpose**: Color selection interface

**Props**:
- `meshId: string` - UUID of the selected mesh

**State**: 
- Uses `useAppStore` for customizations
- Local state for custom color input

**Responsibilities**:
- Display color picker
- Show preset color options
- Allow custom color input
- Update mesh color in real-time

**Key Features**:
- HTML5 color input
- Text input for hex codes
- 12 preset colors
- Visual feedback for selected color
- Real-time color updates

**Color Options**:
- Black, White, Red, Blue, Green, Yellow, Orange, Pink, Purple, Brown, Gray, Navy

**Hooks Used**:
- `useState` - Local color state
- `useEffect` - Sync color when mesh changes
- `useAppStore` - Update customizations

---

### 8. Toolbar (`src/components/ui/Toolbar.tsx`)

**Purpose**: Top toolbar with action buttons

**Props**: None

**State**: Uses `useAppStore` for reset functionality

**Responsibilities**:
- Display action buttons
- Reset customizations
- Export functionality (placeholder)
- Info button (placeholder)

**Key Features**:
- Reset button (clears all customizations)
- Export button (future feature)
- Info button (future feature)
- Icon-based UI

**Buttons**:
- Reset (RotateCcw icon)
- Export (Download icon)
- Info (Info icon)

---

### 9. LoadingScreen (`src/components/ui/LoadingScreen.tsx`)

**Purpose**: Loading indicator overlay

**Props**: None

**State**: Uses `useAppStore` for loading state

**Responsibilities**:
- Display loading spinner
- Show loading message
- Overlay entire screen

**Key Features**:
- Spinning animation
- Semi-transparent overlay
- Centered content
- Conditional rendering

---

## Component Communication Flow

```
User Action: Click on mesh
    ↓
MeshSelector detects click
    ↓
Raycasting finds intersected mesh
    ↓
selectMesh() updates store
    ↓
HighlightEffect animates highlight
    ↓
CustomizationPanel slides in
    ↓
ColorPicker displays for selected mesh
    ↓
User selects color
    ↓
updateMeshCustomization() updates store
    ↓
GLTFModel useFrame applies customization
    ↓
Material color changes in real-time
```

## Props Flow

```
CustomizePage
  └── GLTFModel (no props, uses MODEL_PATH)
      └── MeshSelector (model: THREE.Object3D)
          └── HighlightEffect (mesh: THREE.Mesh)

CustomizePage
  └── CustomizationPanel (no props, uses store)
      └── ColorPicker (meshId: string)
```

## State Management

All components use `useAppStore` (Zustand) for:
- Model state
- Selection state
- Customization state
- UI state (loading, panel visibility)

No prop drilling needed - components access store directly.

