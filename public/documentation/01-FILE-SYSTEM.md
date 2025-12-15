# File System Structure

## Project Root

```
Hackathon-Nykaa/
├── documentation/          # Documentation files
├── public/                 # Static assets
│   ├── models/            # GLTF/GLB 3D model files
│   └── textures/          # Texture files (normal, roughness, etc.)
├── src/                    # Source code
│   ├── components/        # React components
│   ├── pages/             # Page components
│   ├── store/             # State management
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   ├── App.tsx            # Main app component
│   ├── main.tsx           # Application entry point
│   └── index.css          # Global styles
├── node_modules/          # Dependencies (auto-generated)
├── .gitignore            # Git ignore rules
├── index.html            # HTML entry point
├── package.json          # Project dependencies and scripts
├── package-lock.json     # Locked dependency versions
├── tsconfig.json         # TypeScript configuration
├── tsconfig.node.json    # TypeScript config for Node.js
├── vite.config.ts        # Vite build configuration
├── tailwind.config.js    # Tailwind CSS configuration
├── postcss.config.js     # PostCSS configuration
├── ARCHITECTURE.md       # High-level architecture
├── IMPLEMENTATION_PLAN.md # Implementation steps
├── SETUP.md              # Setup instructions
└── README.md             # Project overview
```

## Source Code Structure (`src/`)

### Components (`src/components/`)

```
components/
├── customization/        # Customization UI components
│   ├── ColorPicker.tsx   # Color selection component
│   └── CustomizationPanel.tsx  # Main customization sidebar
├── ui/                   # General UI components
│   ├── LoadingScreen.tsx # Loading indicator
│   └── Toolbar.tsx       # Top toolbar with actions
└── viewer/               # 3D viewer components
    ├── GLTFModel.tsx     # GLTF/GLB model loader and renderer
    ├── MeshSelector.tsx   # Mesh selection via raycasting
    └── HighlightEffect.tsx # Visual highlight effect
```

### Pages (`src/pages/`)

```
pages/
└── CustomizePage.tsx     # Main 3D customization page
```

### State Management (`src/store/`)

```
store/
└── useAppStore.ts        # Zustand store for global state
```

### Types (`src/types/`)

```
types/
└── index.ts             # TypeScript type definitions
```

### Utilities (`src/utils/`)

```
utils/
└── materialHelpers.ts   # Material manipulation utilities
```

## Public Assets (`public/`)

### Models (`public/models/`)

- **Purpose**: Store GLTF/GLB 3D model files
- **Current File**: `ML-9_OS-1.glb`
- **Usage**: Referenced in `GLTFModel.tsx` via `/models/filename.glb`

### Textures (`public/textures/`)

- **Purpose**: Store texture files (normal maps, roughness maps, etc.)
- **Status**: Prepared for future texture support
- **Usage**: Will be loaded and applied to materials

## Configuration Files

### `package.json`
- Defines project dependencies and scripts
- Scripts: `dev`, `build`, `lint`, `preview`

### `vite.config.ts`
- Vite bundler configuration
- React plugin setup
- Server configuration (port 3000)

### `tsconfig.json`
- TypeScript compiler options
- Strict mode enabled
- React JSX support

### `tailwind.config.js`
- Tailwind CSS configuration
- Content paths for purging unused styles

### `postcss.config.js`
- PostCSS plugins (Tailwind, Autoprefixer)

## Entry Points

1. **`index.html`**: HTML entry point, loads `main.tsx`
2. **`src/main.tsx`**: React application entry, renders `App.tsx`
3. **`src/App.tsx`**: Main app component with routing

## Build Output

- **`dist/`**: Production build output (generated on `npm run build`)
- **`.vite/`**: Vite cache directory (auto-generated)

