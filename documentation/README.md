# Documentation Index

Welcome to the comprehensive documentation for the 3D Product Customizer application.

## Documentation Structure

This documentation is organized into the following sections:

### 1. [File System Structure](/documentation/01-FILE-SYSTEM)
- Complete project file structure
- Directory organization
- Configuration files
- Entry points
- Build output

### 2. [Dependencies](/documentation/02-DEPENDENCIES)
- All project dependencies
- Purpose and usage of each package
- Dependency relationships
- Installation instructions
- Version management

### 3. [Components](/documentation/03-COMPONENTS)
- Complete component documentation
- Component hierarchy
- Props and responsibilities
- Component communication
- State management usage

### 4. [Logic and Flows](/documentation/04-LOGIC-AND-FLOWS)
- Application initialization flow
- Mesh selection flow
- Color customization flow
- Material cloning logic
- Highlight animation logic
- Raycasting algorithm
- State management flow
- Rendering pipeline

### 5. [State Management](/documentation/05-STATE-MANAGEMENT)
- Zustand store structure
- State interface
- Store actions
- Usage patterns
- State flow examples
- Optimization techniques

### 6. [Utilities](/documentation/06-UTILITIES)
- Material helper functions
- Color parsing
- Material cloning
- Mesh utilities
- Performance considerations

### 7. [Types](/documentation/07-TYPES)
- TypeScript type definitions
- Interface documentation
- Type usage patterns
- Three.js types
- Type safety benefits

## Quick Reference

### Key Concepts

- **Mesh Selection**: Uses raycasting to detect clicked meshes
- **Material Cloning**: Ensures independent customization per mesh
- **UUID Identification**: Each mesh identified by unique UUID
- **State Management**: Zustand for global state
- **3D Rendering**: React Three Fiber + Three.js

### Key Files

- `src/App.tsx` - Main application component
- `src/pages/CustomizePage.tsx` - 3D customization page
- `src/components/viewer/GLTFModel.tsx` - Model loader
- `src/components/viewer/MeshSelector.tsx` - Selection handler
- `src/store/useAppStore.ts` - State management
- `src/utils/materialHelpers.ts` - Material utilities

### Key Components

1. **GLTFModel**: Loads and renders 3D models
2. **MeshSelector**: Handles mesh selection via raycasting
3. **HighlightEffect**: Visual feedback for selection
4. **CustomizationPanel**: Sidebar with customization options
5. **ColorPicker**: Color selection interface

## Getting Started

1. Read [File System Structure](/documentation/01-FILE-SYSTEM) to understand the project layout
2. Read [Dependencies](/documentation/02-DEPENDENCIES) to understand required packages
3. Read [Components](/documentation/03-COMPONENTS) to understand the component architecture
4. Read [Logic and Flows](/documentation/04-LOGIC-AND-FLOWS) to understand how everything works together

## Architecture Overview

```
User Interaction
    ↓
Event Handler
    ↓
State Update (Zustand)
    ↓
Component Re-render
    ↓
Three.js Update (useFrame)
    ↓
Visual Change
```

## Technology Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Three.js** - 3D graphics
- **React Three Fiber** - React renderer for Three.js
- **Zustand** - State management
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Vite** - Build tool

## Common Tasks

### Adding a New Customization Option

1. Update `MeshCustomization` interface in `src/types/index.ts`
2. Add UI component in `src/components/customization/`
3. Update `applyCustomizations()` in `src/utils/materialHelpers.ts`
4. Add to `CustomizationPanel` component

### Adding a New Mesh Selection Method

1. Modify `MeshSelector.tsx` to add new selection logic
2. Update state management if needed
3. Add visual feedback if required

### Adding Texture Support

1. Create texture loader utility
2. Update `MeshCustomization` type
3. Add texture selector component
4. Update `applyCustomizations()` function

## Troubleshooting

### Model Not Loading
- Check file path in `GLTFModel.tsx`
- Verify file exists in `public/models/`
- Check browser console for errors

### Meshes Not Selectable
- Check browser console for mesh detection logs
- Verify raycasting is working
- Check mesh has proper geometry

### Colors Not Applying
- Verify material is `MeshStandardMaterial`
- Check material cloning is working
- Verify color format is correct hex

## Future Enhancements

- Texture support (normal, roughness, metalness maps)
- Product configuration system
- Save/load customizations
- Export customized models
- Gemini AI integration for design suggestions
- Multiple product support
- User accounts and saved designs

## Contributing

When adding new features:

1. Update relevant documentation files
2. Add TypeScript types if needed
3. Update component documentation
4. Document new flows and logic
5. Update this README if structure changes

## Additional Resources

- [Three.js Documentation](https://threejs.org/docs/)
- [React Three Fiber Documentation](https://docs.pmnd.rs/react-three-fiber/)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [GLTF Specification](https://www.khronos.org/gltf/)

---

**Last Updated**: 2024
**Version**: 1.0.0

