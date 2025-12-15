# Dependencies Documentation

## Core Dependencies

### React Ecosystem

#### `react` (^18.2.0)
- **Purpose**: Core React library for building UI components
- **Usage**: Component framework, hooks, JSX
- **Key Features Used**:
  - Functional components
  - Hooks (useState, useEffect, useRef)
  - Component composition

#### `react-dom` (^18.2.0)
- **Purpose**: React DOM renderer
- **Usage**: Rendering React components to the DOM
- **Key Features Used**:
  - `createRoot` API
  - DOM mounting

#### `react-router-dom` (^6.20.0)
- **Purpose**: Client-side routing
- **Usage**: Navigation between pages
- **Key Features Used**:
  - `BrowserRouter` for routing
  - `Routes` and `Route` for route definitions
  - Navigation between landing and customize pages

### 3D Rendering

#### `three` (^0.158.0)
- **Purpose**: Core 3D graphics library
- **Usage**: 3D scene, meshes, materials, cameras, lights
- **Key Features Used**:
  - `THREE.Scene` - 3D scene container
  - `THREE.Mesh` - 3D mesh objects
  - `THREE.MeshStandardMaterial` - PBR materials
  - `THREE.Raycaster` - Raycasting for selection
  - `THREE.Vector2`, `THREE.Vector3` - Vector math
  - `THREE.Color` - Color manipulation
  - `THREE.PerspectiveCamera` - Camera setup

#### `@react-three/fiber` (^8.15.0)
- **Purpose**: React renderer for Three.js
- **Usage**: Declarative 3D scene setup
- **Key Features Used**:
  - `<Canvas>` - 3D rendering container
  - `useFrame` - Animation loop hook
  - `useThree` - Access Three.js context
  - JSX syntax for 3D objects

#### `@react-three/drei` (^9.88.0)
- **Purpose**: Useful helpers and abstractions for React Three Fiber
- **Usage**: Pre-built components and hooks
- **Key Features Used**:
  - `useGLTF` - GLTF/GLB file loader hook
  - `OrbitControls` - Camera controls component
  - `PerspectiveCamera` - Camera component
  - `Environment` - Environment lighting

### State Management

#### `zustand` (^4.4.7)
- **Purpose**: Lightweight state management library
- **Usage**: Global application state
- **Key Features Used**:
  - `create` - Store creation
  - Store hooks for component access
  - State updates and subscriptions

### UI & Styling

#### `framer-motion` (^10.16.16)
- **Purpose**: Animation library for React
- **Usage**: Smooth animations and transitions
- **Key Features Used**:
  - `motion.div` - Animated div component
  - `AnimatePresence` - Exit animations
  - Spring animations for panel slide-in

#### `tailwindcss` (^3.3.6)
- **Purpose**: Utility-first CSS framework
- **Usage**: Styling components
- **Key Features Used**:
  - Utility classes for layout
  - Responsive design utilities
  - Color and spacing utilities

#### `lucide-react` (^0.294.0)
- **Purpose**: Icon library
- **Usage**: UI icons (X, RotateCcw, Download, Info)
- **Key Features Used**:
  - Icon components for buttons and UI elements

## Development Dependencies

### Build Tools

#### `vite` (^5.0.8)
- **Purpose**: Fast build tool and dev server
- **Usage**: Development server, HMR, production builds
- **Key Features**:
  - Fast HMR (Hot Module Replacement)
  - Optimized production builds
  - ES modules support

#### `@vitejs/plugin-react` (^4.2.1)
- **Purpose**: Vite plugin for React
- **Usage**: React JSX transformation, HMR support

### TypeScript

#### `typescript` (^5.2.2)
- **Purpose**: Type-safe JavaScript
- **Usage**: Type checking, IntelliSense
- **Configuration**: `tsconfig.json`

#### `@types/react` (^18.2.43)
- **Purpose**: TypeScript definitions for React
- **Usage**: Type support for React APIs

#### `@types/react-dom` (^18.2.17)
- **Purpose**: TypeScript definitions for React DOM
- **Usage**: Type support for React DOM APIs

#### `@types/three` (^0.158.3)
- **Purpose**: TypeScript definitions for Three.js
- **Usage**: Type support for Three.js APIs

### Linting & Code Quality

#### `eslint` (^8.55.0)
- **Purpose**: JavaScript/TypeScript linter
- **Usage**: Code quality and consistency

#### `@typescript-eslint/eslint-plugin` (^6.14.0)
- **Purpose**: ESLint plugin for TypeScript
- **Usage**: TypeScript-specific linting rules

#### `@typescript-eslint/parser` (^6.14.0)
- **Purpose**: ESLint parser for TypeScript
- **Usage**: Parse TypeScript code for linting

#### `eslint-plugin-react-hooks` (^4.6.0)
- **Purpose**: ESLint rules for React hooks
- **Usage**: Enforce React hooks best practices

#### `eslint-plugin-react-refresh` (^0.4.5)
- **Purpose**: ESLint plugin for React Fast Refresh
- **Usage**: Support for React Fast Refresh

### CSS Processing

#### `postcss` (^8.4.32)
- **Purpose**: CSS post-processor
- **Usage**: Process Tailwind CSS

#### `autoprefixer` (^10.4.16)
- **Purpose**: PostCSS plugin for vendor prefixes
- **Usage**: Automatic browser prefixing

## Dependency Relationships

```
React Ecosystem
├── react (core)
├── react-dom (rendering)
└── react-router-dom (routing)

3D Rendering Stack
├── three (core 3D library)
├── @react-three/fiber (React renderer)
└── @react-three/drei (helpers)

State Management
└── zustand (global state)

UI & Styling
├── tailwindcss (CSS framework)
├── framer-motion (animations)
└── lucide-react (icons)

Build Tools
├── vite (bundler)
└── @vitejs/plugin-react (React support)

TypeScript
├── typescript (compiler)
└── @types/* (type definitions)
```

## Installation

All dependencies are installed via npm:

```bash
npm install
```

This reads `package.json` and installs all listed dependencies to `node_modules/`.

## Version Management

- **`package.json`**: Defines dependency versions (using `^` for minor updates)
- **`package-lock.json`**: Locks exact versions for reproducible installs

## Key Dependencies for Core Features

### 3D Model Loading
- `@react-three/drei` → `useGLTF` hook

### Mesh Selection
- `three` → `Raycaster` class
- `@react-three/fiber` → `useThree` hook

### Material Customization
- `three` → `MeshStandardMaterial` class
- Material cloning for independent customization

### State Management
- `zustand` → Global store for app state

### UI Animations
- `framer-motion` → Panel slide animations

### Styling
- `tailwindcss` → Component styling

