# Texture Quality Guide

## What Makes Textures Smooth and Perfect

### Current Implementation ✅

The system now includes:

1. **High-Quality Filtering**
   - `minFilter: LinearMipmapLinearFilter` - Smooth texture when viewed from distance
   - `magFilter: LinearFilter` - Smooth texture when viewed up close
   - `generateMipmaps: true` - Creates multiple resolution versions for better quality
   - `anisotropy: 16` - Maximum sharpness at viewing angles

2. **Proper Texture Wrapping**
   - `wrapS: RepeatWrapping` - Texture repeats horizontally
   - `wrapT: RepeatWrapping` - Texture repeats vertically

3. **Texture Configuration**
   - Scale control (0.1x to 5.0x)
   - Color tinting
   - Inversion support

### Additional Improvements You Can Make

#### 1. Texture Resolution
- **Current**: Uses texture files as-is
- **Better**: Ensure textures are at least 1024x1024 or 2048x2048 pixels
- **Best**: Use 4K (4096x4096) for high-end models

#### 2. Texture Format
- **Current**: Supports JPG and PNG
- **Better**: Use PNG for textures with transparency
- **Best**: Consider WebP for better compression

#### 3. UV Mapping
- **Current**: Uses model's existing UV mapping
- **Better**: Ensure your GLTF/GLB models have proper UV unwrapping
- **Best**: Use professional UV mapping tools

#### 4. Material Properties
- **Current**: Uses MeshStandardMaterial
- **Better**: Adjust roughness and metalness for realistic look
- **Best**: Use physically-based rendering (PBR) materials

#### 5. Lighting
- **Current**: Basic lighting setup
- **Better**: Add environment maps (HDRI) for realistic reflections
- **Best**: Use image-based lighting (IBL)

### Technical Details

#### Texture Filtering Explained

- **Minification Filter** (`minFilter`): How texture looks when smaller than original
  - `LinearMipmapLinearFilter`: Best quality, smooth at all distances
  
- **Magnification Filter** (`magFilter`): How texture looks when larger than original
  - `LinearFilter`: Smooth, no pixelation
  
- **Mipmaps**: Pre-generated smaller versions of texture
  - Improves performance and quality
  - Reduces aliasing (jagged edges)
  
- **Anisotropic Filtering** (`anisotropy`): Sharpness at viewing angles
  - Value: 1-16 (16 = maximum quality)
  - Prevents texture blur when viewed at angles

### Troubleshooting Texture Quality

#### Textures Look Blurry
1. Check texture resolution (should be 1024x1024 minimum)
2. Verify mipmaps are generated (check console logs)
3. Ensure anisotropy is set to 16
4. Check if texture is being scaled too much

#### Textures Look Pixelated
1. Increase texture resolution
2. Ensure `magFilter` is `LinearFilter`
3. Check texture scale (lower scale = more detail)

#### Textures Don't Show
1. Check file paths in `textures.json`
2. Verify texture files exist in `public/Textures/`
3. Check browser console for loading errors
4. Ensure material supports textures (MeshStandardMaterial)

#### Textures Look Washed Out
1. Adjust color tint (set to white for no tint)
2. Check lighting setup
3. Adjust material roughness/metalness
4. Verify texture file isn't corrupted

### Best Practices

1. **Texture Size**: Use power-of-2 dimensions (256, 512, 1024, 2048, 4096)
2. **File Format**: PNG for quality, JPG for smaller file size
3. **Compression**: Balance quality vs file size
4. **UV Mapping**: Ensure proper unwrapping in 3D software
5. **Normal Maps**: Use high-quality normal maps for detail
6. **Roughness Maps**: Essential for realistic materials

### Future Enhancements

- [ ] Texture compression (KTX2, Basis)
- [ ] Automatic texture optimization
- [ ] Texture streaming for large files
- [ ] Custom shader support
- [ ] Real-time texture painting
- [ ] Texture baking tools

