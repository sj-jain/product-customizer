# Adding Models to the Customizer

This guide explains how to add new 3D models to the customizer.

## Quick Steps

1. **Place your model file** in this directory (`public/models/`)
   - Supported formats: `.glb` or `.gltf`
   - Example: `MyProduct.glb`

2. **Add entry to `models.json`**
   - Open `models.json` in this directory
   - Add a new object with your model information

3. **Refresh the page**
   - The new model will appear on the home page automatically

## models.json Format

```json
{
  "id": "unique-id",              // Unique identifier (no spaces, lowercase)
  "name": "model-name",           // Model file name without extension
  "path": "/models/ModelFile.glb", // Path to model file (must start with /models/)
  "displayName": "Product Name",   // Display name shown on card
  "description": "Product description...", // Description text
  "price": "$99.99",              // Price string
  "category": "Category Name",    // Category (e.g., "Shoes", "Accessories", "Apparel")
  "colors": ["Black", "White"],   // Available color options
  "thumbnail": "https://..."      // Image URL for product card
}
```

## Example Entry

```json
{
  "id": "my-product",
  "name": "MyProduct",
  "path": "/models/MyProduct.glb",
  "displayName": "My Awesome Product",
  "description": "A fantastic customizable product with premium features.",
  "price": "$79.99",
  "category": "Accessories",
  "colors": ["Black", "Navy", "Red"],
  "thumbnail": "https://images.unsplash.com/photo-1234567890?w=400&h=400&fit=crop"
}
```

## Current Models

The system currently supports:
- ✅ GLB files (binary GLTF)
- ✅ GLTF files (text-based GLTF)
- ✅ Multiple models simultaneously
- ✅ Automatic mesh discovery
- ✅ Dynamic loading from JSON

## Tips

1. **File Naming**: Use descriptive names without spaces (e.g., `Product-Name.glb`)
2. **Thumbnails**: Use Unsplash or similar services for placeholder images
3. **Categories**: Keep categories consistent (e.g., "Shoes", "Accessories", "Apparel")
4. **Colors**: List available color options for the product
5. **Paths**: Always use `/models/` prefix in the path

## Testing

After adding a model:
1. Check that the file exists in `public/models/`
2. Verify JSON syntax is correct (use a JSON validator)
3. Refresh the home page
4. Click on the new product card
5. Verify the model loads in the customizer

## Troubleshooting

**Model doesn't appear?**
- Check JSON syntax (commas, brackets)
- Verify file path is correct
- Check browser console for errors

**Model doesn't load?**
- Verify file format is `.glb` or `.gltf`
- Check file isn't corrupted
- Ensure path in JSON matches actual file name

**Model loads but can't customize?**
- Check browser console for mesh discovery logs
- Verify model has meshes (not just empty groups)
- Ensure meshes have materials

## Need Help?

Check the main documentation:
- [PROJECT-DOCUMENTATION.md](../../PROJECT-DOCUMENTATION.md)
- [SETUP-AND-RUN.md](../../SETUP-AND-RUN.md)
