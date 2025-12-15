# AI Integration Setup Guide

## Overview

The prompt system now uses **Google Gemini AI** to process natural language prompts and generate creative color schemes for shoe parts.

## How It Works

### Flow Diagram

```
User enters prompt: "hulk style shoes"
    ↓
PromptWriter sends to AI Service
    ↓
AI Service calls Gemini API
    ↓
Gemini processes prompt + available parts
    ↓
Returns structured JSON response:
{
  "description": "Hulk-themed green and purple design",
  "mappings": [
    { "partName": "upper", "color": "#00FF00", "reason": "..." },
    { "partName": "sole", "color": "#800080", "reason": "..." }
  ]
}
    ↓
AI Service parses response
    ↓
PromptWriter displays mappings
    ↓
User clicks "Apply AI Design"
    ↓
System maps part names to mesh UUIDs
    ↓
Colors applied to meshes
    ↓
Rendering system updates visuals
```

## Setup Instructions

### 1. Get Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key

### 2. Configure API Key

**Create a `.env` file in the project root:**

```bash
VITE_GEMINI_API_KEY=your_actual_api_key_here
```

**Example:**
```bash
VITE_GEMINI_API_KEY=AIzaSyAq-9HuOq8Ml10LOwTEg7qRJXBPvi1KoY8
```

**Important:** 
- The `.env` file is already in `.gitignore` - your API key will NOT be committed to git
- Never share your API key publicly
- Restart the dev server after adding the key

### 3. Restart Development Server

After adding the API key, restart the dev server:
```bash
npm run dev
```

## API Response Format

The AI returns a fixed JSON structure:

```json
{
  "description": "Brief description of the design",
  "mappings": [
    {
      "partName": "upper",
      "color": "#FF0000",
      "reason": "Red matches the hulk theme"
    },
    {
      "partName": "sole",
      "color": "#000000",
      "reason": "Black sole for contrast"
    }
  ]
}
```

### Response Fields

- **description**: Overall design description (optional)
- **mappings**: Array of color mappings
  - **partName**: Must match one of the available parts (case-insensitive)
  - **color**: Hex color code (format: #RRGGBB)
  - **reason**: Why this color was chosen (optional)

## How Part Mapping Works

1. **AI Response** contains part names (e.g., "upper", "sole")
2. **System matches** part names to actual mesh names/display names
3. **Finds mesh UUID** for each matched part
4. **Applies color** using `updateMeshCustomization(meshUUID, { color })`
5. **Rendering system** applies colors in real-time

## Example Prompts

- "hulk style shoes" → Green upper, purple accents
- "batman themed design" → Black and dark gray
- "ocean blue color scheme" → Various shades of blue
- "sunset gradient colors" → Orange, red, pink gradients
- "make it look like iron man" → Red and gold

## Error Handling

If API key is missing or invalid:
- Error message displayed in UI
- User can still use manual color picker
- System falls back gracefully

## Security Notes

- **Never commit API keys to git**
- Add `.env` to `.gitignore`
- Use environment variables for production
- API key is exposed in frontend (this is normal for Gemini API)

## Testing Without API Key

If you don't have an API key yet:
1. The system will show an error
2. You can still use the manual color picker
3. Once you add the API key, AI features will work

## Troubleshooting

**"API error: 400"**
- Check API key is correct
- Ensure API key has proper permissions

**"No JSON found in AI response"**
- AI might have returned text instead of JSON
- Check console for full response

**"Could not find mesh for part"**
- Part name in AI response doesn't match mesh names
- Check available parts in the UI
- Update mesh name mappings if needed

