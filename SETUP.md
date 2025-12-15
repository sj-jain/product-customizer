# Quick Setup Guide

## What I Need From You

### 1. Your GLTF/GLB File
- Place your GLTF or GLB file in: `public/models/`
- Example: `public/models/shoe.gltf` or `public/models/shoe.glb`

### 2. Update the Model Path
After placing your file, edit `src/components/viewer/GLTFModel.tsx`:
```typescript
const MODEL_PATH = '/models/your-filename.gltf'; // Change this line
```

### 3. Your Texture Files (Optional for now)
- Place texture files in: `public/textures/`
- We'll integrate texture support next

## Installation Steps

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Place your GLTF file:**
   - Copy your GLTF/GLB file to `public/models/`
   - Update the MODEL_PATH in `src/components/viewer/GLTFModel.tsx`

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   - The app will open at `http://localhost:3000`

## How It Works

1. **Model Loading**: The GLTF file loads automatically when the page opens
2. **Mesh Detection**: All meshes in your model are automatically detected
3. **Selection**: Click on any part of the 3D model to select it
4. **Highlight**: Selected part glows green for 1 second
5. **Customization**: A panel opens on the right with color options
6. **Color Change**: Select a color to change the selected part

## Finding Your Mesh Names

When you load the model, open the browser console (F12). You'll see logs like:
```
Found mesh: upper_mesh
Found mesh: sole_mesh
Found mesh: laces_mesh
```

These are the mesh names you can use for customization. The app automatically detects all meshes, so you can click on any part to customize it.

## Current Features

✅ GLTF/GLB file loading
✅ 3D model rendering
✅ Interactive mesh selection (click to select)
✅ Visual highlight effect (1-second green glow)
✅ Color picker with preset colors
✅ Custom color input
✅ Real-time color changes

## Next Steps (After Testing)

Once you've tested with your GLTF file, we can:
1. Add texture support (normal, roughness, metalness maps)
2. Create a configuration file for specific mesh customization options
3. Add more customization features
4. Integrate Gemini AI for design suggestions

## Troubleshooting

**Model not showing?**
- Check the file path in `GLTFModel.tsx`
- Ensure file is in `public/models/` directory
- Check browser console for errors

**Can't select meshes?**
- Check browser console - it will show all detected meshes
- Some GLTF files have meshes nested in groups - the app handles this automatically

**Colors not changing?**
- Ensure the mesh has a MeshStandardMaterial
- Check browser console for errors

