# 3D Shoe Customizer - Comprehensive Documentation

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Features](#features)
5. [Setup & Installation](#setup--installation)
6. [Architecture](#architecture)
7. [Key Components](#key-components)
8. [Services & APIs](#services--apis)
9. [Utilities](#utilities)
10. [State Management](#state-management)
11. [Usage Guide](#usage-guide)
12. [AI Integration](#ai-integration)
13. [Mesh Discovery & Customization](#mesh-discovery--customization)
14. [Troubleshooting](#troubleshooting)
15. [Development Guide](#development-guide)

---

## 🎯 Project Overview

A web-based 3D product customizer that allows users to:
- Browse and select 3D shoe models
- Customize individual parts with colors
- Use AI-powered prompts to generate complete designs
- View real-time 3D previews with interactive controls

**Built with**: React, TypeScript, Three.js, React Three Fiber, Zustand, Tailwind CSS

---

## 🛠 Technology Stack

### Core Framework
- **React 18.2.0** - UI framework
- **TypeScript 5.2.2** - Type safety
- **Vite 5.0.8** - Build tool and dev server

### 3D Rendering
- **Three.js 0.158.0** - 3D graphics library
- **@react-three/fiber 8.15.0** - React renderer for Three.js
- **@react-three/drei 9.88.0** - Useful helpers for R3F

### State Management
- **Zustand 4.4.7** - Lightweight state management

### Styling
- **Tailwind CSS 3.3.6** - Utility-first CSS framework
- **Framer Motion 10.16.16** - Animation library

### Routing
- **React Router DOM 6.20.0** - Client-side routing

### Icons
- **Lucide React 0.294.0** - Icon library

### AI Integration
- **Google Gemini API** - AI-powered design suggestions

---

## 📁 Project Structure

```
Hackathon-Nykaa/
├── public/
│   ├── models/              # GLB/GLTF model files
│   │   ├── shoe-1.glb
│   │   ├── ML-9_OS-1.glb
│   │   └── models.json      # Model metadata
│   └── documentation/       # Markdown documentation files
│
├── src/
│   ├── components/
│   │   ├── viewer/          # 3D viewer components
│   │   │   ├── GLTFModel.tsx        # Main 3D model loader
│   │   │   ├── MeshSelector.tsx    # Click-to-select functionality
│   │   │   └── HighlightEffect.tsx  # Visual highlight animation
│   │   │
│   │   ├── customization/   # Customization UI
│   │   │   ├── CustomizationPanel.tsx  # Main panel with tabs
│   │   │   ├── ColorPicker.tsx         # Manual color selection
│   │   │   ├── PromptWriter.tsx        # AI prompt interface
│   │   │   └── NameMappingEditor.tsx   # Edit mesh display names
│   │   │
│   │   └── ui/              # UI components
│   │       ├── Toolbar.tsx           # Top toolbar
│   │       ├── LoadingScreen.tsx     # Loading indicator
│   │       └── MeshInfoPanel.tsx      # Mesh information display
│   │
│   ├── pages/
│   │   ├── HomePage.tsx          # Model selection page
│   │   ├── CustomizePage.tsx     # 3D customizer page
│   │   └── DocumentationPage.tsx # Documentation viewer
│   │
│   ├── store/
│   │   └── useAppStore.ts        # Zustand global state
│   │
│   ├── services/
│   │   └── aiService.ts          # Gemini API integration
│   │
│   ├── utils/
│   │   ├── meshDiscovery.ts      # Discover all meshes in model
│   │   ├── meshAnalyzer.ts       # Analyze mesh properties
│   │   ├── meshNameMapper.ts     # Map generic names to user-friendly
│   │   ├── materialHelpers.ts    # Material customization helpers
│   │   └── promptParser.ts       # Parse user prompts (legacy)
│   │
│   ├── types/
│   │   └── index.ts              # TypeScript type definitions
│   │
│   ├── App.tsx                   # Main app component with routing
│   ├── main.tsx                  # Application entry point
│   └── index.css                 # Global styles
│
├── documentation/                # Project documentation
├── .env                          # Environment variables (API keys)
├── package.json                  # Dependencies and scripts
├── vite.config.ts               # Vite configuration
├── tailwind.config.js           # Tailwind configuration
└── tsconfig.json                # TypeScript configuration
```

---

## ✨ Features

### 1. Model Selection (Home Page)
- Browse available 3D models
- Beautiful animated UI with starry background
- Product cards with images, descriptions, prices
- Click to open customizer

### 2. 3D Viewer
- Load and render GLB/GLTF models
- Interactive camera controls (orbit, zoom, pan)
- Real-time rendering with Three.js
- Professional lighting and environment

### 3. Mesh Selection
- Click on any part of the 3D model to select it
- Visual highlight effect (green glow, 1-second animation)
- Only selected part highlights (not entire model)
- Immediate highlight restoration when selecting new part

### 4. Manual Customization
- Color picker with preset colors
- Custom color input (hex)
- Real-time color application
- Independent part customization (each mesh gets its own material)

### 5. AI-Powered Customization
- Natural language prompts (e.g., "hulk style shoes")
- Gemini AI integration for creative suggestions
- Automatic color mapping to all parts
- Handles duplicate part names (e.g., two buckles)
- Automatic application (no "Apply" button needed)

### 6. Mesh Discovery
- Automatic discovery of all meshes in model
- Extract mesh names, UUIDs, materials
- Map generic names to user-friendly names
- Support for multiple meshes with same name

### 7. Documentation System
- Built-in documentation viewer
- Markdown rendering
- Navigation between docs
- URL-based routing

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js 18+ and npm
- Git (optional)

### Step 1: Install Dependencies
```bash
cd /Users/risha/Documents/Hackathon-Nykaa
npm install
```

### Step 2: Configure Environment
Create `.env` file in project root:
```bash
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

Get API key from: https://makersuite.google.com/app/apikey

### Step 3: Add Models
Place GLB/GLTF files in `public/models/`:
```bash
public/models/
  ├── shoe-1.glb
  ├── your-model.glb
  └── models.json
```

Update `public/models/models.json`:
```json
[
  {
    "id": "your-model",
    "name": "your-model",
    "path": "/models/your-model.glb",
    "displayName": "Your Model Name",
    "description": "Model description",
    "price": "$99.99",
    "category": "Category",
    "colors": ["Black", "White"],
    "thumbnail": "https://..."
  }
]
```

### Step 4: Run Development Server
```bash
npm run dev
```

Server runs on: **http://localhost:3000**

---

## 🏗 Architecture

### Component Hierarchy

```
App
├── BrowserRouter
    ├── HomePage (Route: /)
    │   └── Product cards with model selection
    │
    ├── CustomizePage (Route: /customize?model=...)
    │   ├── Canvas (React Three Fiber)
    │   │   ├── GLTFModel
    │   │   │   ├── MeshSelector
    │   │   │   └── HighlightEffect
    │   │   ├── OrbitControls
    │   │   ├── Lights
    │   │   └── Environment
    │   ├── Toolbar
    │   ├── CustomizationPanel
    │   │   ├── ColorPicker (Manual tab)
    │   │   ├── PromptWriter (AI Prompt tab)
    │   │   └── NameMappingEditor (Names tab)
    │   └── MeshInfoPanel
    │
    └── DocumentationPage (Route: /documentation)
        └── Markdown renderer
```

### Data Flow

1. **Model Loading**:
   ```
   GLTFModel → discoverMeshes() → setMeshInfo() → Store
   ```

2. **Mesh Selection**:
   ```
   User Click → MeshSelector → selectMesh() → Store → HighlightEffect
   ```

3. **Color Customization**:
   ```
   ColorPicker/PromptWriter → updateMeshCustomization() → Store → materialHelpers → 3D Model
   ```

4. **AI Integration**:
   ```
   User Prompt → aiService → Gemini API → Parse Response → Find UUIDs → Apply Colors
   ```

---

## 🔧 Key Components

### 1. GLTFModel (`src/components/viewer/GLTFModel.tsx`)

**Purpose**: Loads and renders 3D GLB/GLTF models

**Key Features**:
- Dynamic model path support (via props)
- Automatic mesh discovery
- Material customization application
- Mesh information extraction

**Props**:
```typescript
interface GLTFModelProps {
  modelPath?: string; // Path to GLB/GLTF file
}
```

**Key Functions**:
- `discoverMeshes()` - Find all meshes in model
- `analyzeAllMeshes()` - Get detailed mesh properties
- `mapMeshNames()` - Convert generic names to user-friendly

### 2. MeshSelector (`src/components/viewer/MeshSelector.tsx`)

**Purpose**: Handles click-to-select functionality

**How it works**:
1. Listens for mouse clicks on canvas
2. Uses raycasting to find intersected mesh
3. Calls `selectMesh()` with mesh UUID
4. Triggers highlight effect

**Key Features**:
- Raycasting for accurate selection
- UUID-based identification
- Immediate selection feedback

### 3. HighlightEffect (`src/components/viewer/HighlightEffect.tsx`)

**Purpose**: Visual feedback when mesh is selected

**How it works**:
1. Temporarily modifies mesh emissive color
2. Animates green glow (fade in/out)
3. Restores original emissive after 1 second
4. Immediately restores previous highlight when new mesh selected

**Key Features**:
- Non-destructive (doesn't clone materials)
- Smooth animation
- Immediate restoration

### 4. CustomizationPanel (`src/components/customization/CustomizationPanel.tsx`)

**Purpose**: Main UI panel for customization options

**Tabs**:
- **Manual**: Color picker for selected mesh
- **AI Prompt**: Natural language design prompts
- **Names**: Edit mesh display names

**Features**:
- Slide-in animation
- Tab-based navigation
- Responsive design

### 5. PromptWriter (`src/components/customization/PromptWriter.tsx`)

**Purpose**: AI-powered design customization

**Key Features**:
- Natural language input
- Gemini API integration
- Automatic color application
- Base name matching for duplicates
- UUID-based color application

**Flow**:
1. User enters prompt
2. Sends to Gemini API with all part names
3. Receives color mappings
4. Automatically finds all matching UUIDs
5. Applies colors to all matching meshes
6. Updates 3D model in real-time

### 6. ColorPicker (`src/components/customization/ColorPicker.tsx`)

**Purpose**: Manual color selection

**Features**:
- Preset color options
- Custom hex color input
- Real-time preview
- Immediate application

---

## 🔌 Services & APIs

### AI Service (`src/services/aiService.ts`)

**Purpose**: Integrate with Google Gemini API

**Key Function**:
```typescript
getDesignFromAI(
  prompt: string,
  availableParts: string[]
): Promise<AIResponse>
```

**Request Format**:
- Endpoint: `gemini-2.5-flash:generateContent`
- Method: POST
- Headers: `X-goog-api-key`
- Body: Structured prompt with all part names

**Response Format**:
```typescript
{
  success: boolean;
  mappings: [
    {
      partName: string;
      color: string; // Hex color
      reason?: string;
    }
  ];
  description?: string;
  error?: string;
}
```

**Error Handling**:
- Network errors
- API quota exceeded
- Invalid responses
- JSON parsing errors

---

## 🛠 Utilities

### 1. Mesh Discovery (`src/utils/meshDiscovery.ts`)

**Purpose**: Discover and catalog all meshes in a 3D model

**Key Functions**:

#### `discoverMeshes(scene: THREE.Object3D)`
- Traverses entire scene
- Finds all Mesh objects
- Creates name map (handles duplicates)
- Returns: `MeshDiscoveryResult`

#### `findAllMeshesByName(discovery, searchName)`
- Finds ALL meshes with matching name
- Uses base name extraction
- Handles variations: "buckle", "buckle_1", "buckle_2"
- Returns: Array of all matching meshes

#### `extractBaseName(name: string)`
- Removes numbers, suffixes, directions
- Examples:
  - "buckle_1" → "buckle"
  - "Buckle_Left" → "buckle"
  - "buckle 2" → "buckle"

### 2. Mesh Analyzer (`src/utils/meshAnalyzer.ts`)

**Purpose**: Detailed analysis of mesh properties

**Key Functions**:
- `analyzeMesh()` - Analyze single mesh
- `analyzeAllMeshes()` - Analyze all meshes
- `getDetailedMeshInfo()` - Get comprehensive mesh data

**Returns**:
- Position, rotation, scale
- Material information
- Parent hierarchy
- Texture information
- Geometry details

### 3. Mesh Name Mapper (`src/utils/meshNameMapper.ts`)

**Purpose**: Map generic names to user-friendly names

**Heuristics Used**:
- Name patterns (part_1, mesh_2, etc.)
- Position-based (Y coordinate)
- Material names
- Parent names
- User data

**Example**:
- "part_1" → "Upper"
- "mesh_2" → "Sole"
- "buckle" → "Buckle"

### 4. Material Helpers (`src/utils/materialHelpers.ts`)

**Purpose**: Apply customizations to mesh materials

**Key Function**:
```typescript
applyCustomizations(
  mesh: THREE.Mesh,
  customization: MeshCustomization
)
```

**Features**:
- Clones materials to avoid affecting other meshes
- Applies color changes
- Preserves original materials
- Handles material arrays

---

## 📊 State Management

### Zustand Store (`src/store/useAppStore.ts`)

**State Structure**:
```typescript
interface AppState {
  gltfModel: THREE.Object3D | null;
  isLoading: boolean;
  error: string | null;
  meshInfo: MeshInfo[];           // All discovered meshes
  selectedMesh: THREE.Mesh | null;
  selectedMeshId: string | null;
  selectedMeshName: string | null;
  meshCustomizations: {            // UUID -> Customization
    [meshId: string]: MeshCustomization;
  };
  showCustomizationPanel: boolean;
  mappedMeshNames: NameMapping[];  // Name mappings
}
```

**Key Actions**:
- `setGLTFModel()` - Set loaded model
- `setMeshInfo()` - Update mesh information
- `selectMesh()` - Select a mesh for customization
- `updateMeshCustomization()` - Apply color to mesh
- `toggleCustomizationPanel()` - Show/hide panel

---

## 📖 Usage Guide

### For End Users

#### 1. Select a Model
1. Go to home page (http://localhost:3000)
2. Browse available models
3. Click on a model card

#### 2. Manual Customization
1. Click on any part of the 3D model
2. Part highlights in green
3. Customization panel opens
4. Select color from picker or enter hex code
5. Color applies immediately

#### 3. AI-Powered Customization
1. Go to "AI Prompt" tab
2. Enter a design prompt (e.g., "hulk style shoes")
3. Click "Generate"
4. AI returns color suggestions
5. Colors apply automatically to all parts
6. Check 3D view to see changes

#### 4. Edit Mesh Names
1. Go to "Names" tab
2. See all mesh names and display names
3. Click edit to change display name
4. Changes reflect in UI

### For Developers

#### Adding a New Model
1. Place GLB file in `public/models/`
2. Update `public/models/models.json`
3. Add entry to `availableModels` in `HomePage.tsx` (if not using JSON)
4. Refresh page

#### Extending AI Prompts
- Edit `src/services/aiService.ts`
- Modify prompt template
- Update response parsing logic

#### Adding Customization Options
- Extend `MeshCustomization` interface in `src/types/index.ts`
- Update `materialHelpers.ts` to handle new options
- Add UI in `CustomizationPanel.tsx`

---

## 🤖 AI Integration

### How It Works

1. **User Input**:
   ```
   Prompt: "hulk style shoes"
   ```

2. **System Preparation**:
   - Extracts all mesh names from model
   - Sends to AI with prompt

3. **AI Processing**:
   ```
   Gemini API receives:
   - User prompt
   - List of all available parts
   - Instructions to return JSON
   ```

4. **AI Response**:
   ```json
   {
     "description": "Hulk-themed green and purple design",
     "mappings": [
       { "partName": "upper", "color": "#00FF00" },
       { "partName": "sole", "color": "#800080" },
       { "partName": "buckle", "color": "#000000" }
     ]
   }
   ```

5. **Color Application**:
   - For each mapping, find all UUIDs matching part name
   - Apply color to all matching UUIDs
   - Update 3D model in real-time

### Base Name Matching

The system uses `extractBaseName()` to group variations:
- "buckle" → finds: "buckle", "buckle_1", "buckle_2", "Buckle_Left"
- All get the same color from AI response

### UUID-Based Application

Colors are applied using UUIDs, not names:
```typescript
updateMeshCustomization(uuid, { color: '#FF0000' });
```

This ensures:
- Generic (works for any model)
- Reliable (UUIDs are unique)
- Handles duplicates (multiple meshes with same name)

---

## 🔍 Mesh Discovery & Customization

### Discovery Process

1. **Model Loads**:
   ```typescript
   GLTFModel → useGLTF() → scene
   ```

2. **Mesh Discovery**:
   ```typescript
   discoverMeshes(scene) → {
     meshes: MeshInfo[],
     meshMap: Map<UUID, MeshInfo>,
     nameMap: Map<name, MeshInfo[]>
   }
   ```

3. **Name Mapping**:
   ```typescript
   analyzeAllMeshes(scene) → mapMeshNames() → NameMapping[]
   ```

4. **Store Update**:
   ```typescript
   setMeshInfo(mappedMeshInfo)
   ```

### Customization Process

1. **User Action**: Select mesh or enter AI prompt

2. **Color Application**:
   ```typescript
   updateMeshCustomization(uuid, { color })
   ```

3. **Material Update**:
   ```typescript
   applyCustomizations(mesh, customization)
   - Clone material if needed
   - Apply color
   - Update mesh
   ```

4. **Rendering**:
   ```typescript
   useFrame() → applyCustomizations() → 3D update
   ```

### Handling Duplicate Names

When AI returns: `{ "partName": "buckle", "color": "#FF0000" }`

1. Extract base name: "buckle"
2. Find all meshes with base name "buckle":
   - "buckle" → UUID: abc123
   - "buckle_1" → UUID: def456
   - "Buckle_Left" → UUID: ghi789
3. Apply color to all UUIDs:
   ```typescript
   updateMeshCustomization('abc123', { color: '#FF0000' });
   updateMeshCustomization('def456', { color: '#FF0000' });
   updateMeshCustomization('ghi789', { color: '#FF0000' });
   ```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. Blank White Page
**Symptoms**: Page loads but shows nothing

**Solutions**:
- Check browser console (F12) for errors
- Verify `npm install` completed successfully
- Check if server is running on correct port
- Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

#### 2. Models Not Loading
**Symptoms**: Model doesn't appear in 3D view

**Solutions**:
- Check file path in `models.json`
- Verify GLB file exists in `public/models/`
- Check browser console for 404 errors
- Ensure GLB file is valid (not corrupted)

#### 3. AI Not Working
**Symptoms**: "Failed to get AI response" error

**Solutions**:
- Check `.env` file exists with `VITE_GEMINI_API_KEY`
- Verify API key is correct (no extra spaces)
- Restart dev server after adding/changing `.env`
- Check browser console for API errors
- Verify API quota not exceeded

#### 4. Colors Not Applying
**Symptoms**: Selected part doesn't change color

**Solutions**:
- Check browser console for errors
- Verify mesh has MeshStandardMaterial
- Check if material is being cloned correctly
- Ensure `updateMeshCustomization` is being called

#### 5. Duplicate Parts Not Colored
**Symptoms**: Only one buckle colors, not both

**Solutions**:
- Check console logs for UUID matching
- Verify `extractBaseName()` is working
- Check if both meshes have same base name
- Review `findAllMeshesByName()` logic

### Debug Commands

```bash
# Check if server is running
lsof -ti:3000

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check Node version
node --version

# Check npm version
npm --version
```

---

## 💻 Development Guide

### Adding New Features

#### 1. Add Texture Support
- Extend `MeshCustomization` interface
- Update `materialHelpers.ts` to handle textures
- Add texture picker UI component
- Update AI service to return texture mappings

#### 2. Add Save/Load Functionality
- Create save format (JSON)
- Add export function
- Add import function
- Store in localStorage or backend

#### 3. Add More Customization Options
- Extend `MeshCustomization` type
- Update material helpers
- Add UI controls
- Update AI service prompt

### Code Style

- **Components**: PascalCase (e.g., `GLTFModel.tsx`)
- **Functions**: camelCase (e.g., `discoverMeshes()`)
- **Types**: PascalCase (e.g., `MeshInfo`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MODEL_PATH`)

### Best Practices

1. **Type Safety**: Always use TypeScript types
2. **Error Handling**: Use try-catch for async operations
3. **Logging**: Use console.log for debugging
4. **State Management**: Use Zustand for global state
5. **Component Structure**: Keep components focused and reusable

### Testing

```bash
# Run linter
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 📝 API Reference

### Store Actions

#### `setGLTFModel(model: THREE.Object3D)`
Sets the loaded 3D model in store.

#### `setMeshInfo(meshInfo: MeshInfo[])`
Updates mesh information array.

#### `selectMesh(mesh: THREE.Mesh | null, meshId: string | null)`
Selects a mesh for customization.

#### `updateMeshCustomization(meshId: string, customization: MeshCustomization)`
Applies customization to a mesh by UUID.

### Utility Functions

#### `discoverMeshes(scene: THREE.Object3D): MeshDiscoveryResult`
Discovers all meshes in a 3D scene.

#### `findAllMeshesByName(discovery: MeshDiscoveryResult, searchName: string): MeshInfo[]`
Finds all meshes matching a name (handles duplicates).

#### `extractBaseName(name: string): string`
Extracts base name from mesh name (removes numbers, suffixes).

#### `applyCustomizations(mesh: THREE.Mesh, customization: MeshCustomization)`
Applies customizations to mesh material.

### AI Service

#### `getDesignFromAI(prompt: string, availableParts: string[]): Promise<AIResponse>`
Calls Gemini API to get design suggestions.

---

## 🎨 UI/UX Features

### Animations
- Fade-in animations for product cards
- Slide-in panel animations
- Highlight pulse effects
- Smooth color transitions

### Responsive Design
- Mobile-friendly layout
- Adaptive grid for product cards
- Touch-friendly controls

### Visual Feedback
- Loading states
- Error messages
- Success indicators
- Color previews

---

## 🔐 Security

### API Keys
- Store in `.env` file (not committed to git)
- `.env` is in `.gitignore`
- Never expose API keys in client code

### Best Practices
- Validate user input
- Sanitize AI responses
- Handle errors gracefully
- Rate limiting (if needed)

---

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

Output: `dist/` directory

### Environment Variables
Set in production:
- `VITE_GEMINI_API_KEY` - Gemini API key

### Server Configuration
- Serve `dist/` directory
- Configure routing for SPA (all routes → index.html)
- Set proper MIME types for GLB files

---

## 📚 Additional Resources

### Documentation Files
- `ARCHITECTURE.md` - System architecture
- `SETUP-AND-RUN.md` - Setup instructions
- `QUICK-START.md` - Quick reference
- `AI-SETUP.md` - AI integration guide
- `ENV-SETUP.md` - Environment setup

### External Links
- [Three.js Documentation](https://threejs.org/docs/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/)
- [Gemini API Docs](https://ai.google.dev/docs)
- [Zustand Docs](https://github.com/pmndrs/zustand)

---

## 🤝 Contributing

### Adding Models
1. Place GLB file in `public/models/`
2. Update `models.json`
3. Test model loads correctly
4. Verify all parts are discoverable

### Reporting Issues
- Check browser console for errors
- Include error messages
- Describe steps to reproduce
- Include model file (if relevant)

---

## 📄 License

This project is part of a hackathon submission.

---

## 👥 Credits

Built with:
- React & TypeScript
- Three.js & React Three Fiber
- Google Gemini AI
- Zustand
- Tailwind CSS

---

**Last Updated**: December 2024
**Version**: 1.0.0

