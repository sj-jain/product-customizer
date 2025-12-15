import { useAppStore } from '../../store/useAppStore';
import { useState, useEffect } from 'react';

interface ColorPickerProps {
  meshId: string;
}

// Predefined color options - you can customize these
const COLOR_OPTIONS = [
  { name: 'Black', value: '#000000' },
  { name: 'White', value: '#FFFFFF' },
  { name: 'Red', value: '#FF0000' },
  { name: 'Blue', value: '#0000FF' },
  { name: 'Green', value: '#00FF00' },
  { name: 'Yellow', value: '#FFFF00' },
  { name: 'Orange', value: '#FFA500' },
  { name: 'Pink', value: '#FFC0CB' },
  { name: 'Purple', value: '#800080' },
  { name: 'Brown', value: '#8B4513' },
  { name: 'Gray', value: '#808080' },
  { name: 'Navy', value: '#000080' },
];

function ColorPicker({ meshId }: ColorPickerProps) {
  const { meshCustomizations, updateMeshCustomization } = useAppStore();
  const currentColor = meshCustomizations[meshId]?.color || '#000000';
  const [customColor, setCustomColor] = useState(currentColor);

  // Sync color when mesh changes or customization updates
  useEffect(() => {
    const color = meshCustomizations[meshId]?.color || '#000000';
    setCustomColor(color);
  }, [meshId, meshCustomizations]);

  const handleColorSelect = (color: string) => {
    updateMeshCustomization(meshId, { color });
    setCustomColor(color);
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setCustomColor(color);
    updateMeshCustomization(meshId, { color });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Color</h3>
      
      {/* Custom Color Picker */}
      <div className="space-y-2">
        <label className="text-sm text-gray-600">Custom Color</label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={customColor}
            onChange={handleCustomColorChange}
            className="w-16 h-16 rounded-lg border-2 border-gray-300 cursor-pointer"
          />
          <input
            type="text"
            value={customColor}
            onChange={handleCustomColorChange}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="#000000"
          />
        </div>
      </div>

      {/* Preset Colors */}
      <div className="space-y-2">
        <label className="text-sm text-gray-600">Preset Colors</label>
        <div className="grid grid-cols-6 gap-2">
          {COLOR_OPTIONS.map((color) => (
            <button
              key={color.value}
              onClick={() => handleColorSelect(color.value)}
              className={`w-12 h-12 rounded-lg border-2 transition-all ${
                currentColor.toLowerCase() === color.value.toLowerCase()
                  ? 'border-blue-500 ring-2 ring-blue-300 scale-110'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              style={{ backgroundColor: color.value }}
              title={color.name}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default ColorPicker;

