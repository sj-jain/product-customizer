# Complete Setup and Run Guide

## Prerequisites

- Node.js (v18 or higher recommended)
- npm (comes with Node.js)
- A code editor (VS Code recommended)

## Step 1: Check Node.js Installation

```bash
node --version
npm --version
```

If not installed, download from: https://nodejs.org/

## Step 2: Navigate to Project Directory

```bash
cd /Users/risha/Documents/Hackathon-Nykaa
```

## Step 3: Install Dependencies

```bash
npm install
```

This will install all required packages:
- React
- Three.js
- React Three Fiber
- Zustand
- Tailwind CSS
- And all other dependencies

## Step 4: Set Up Gemini API Key

1. Get your API key from: https://makersuite.google.com/app/apikey
2. Create a `.env` file in the project root:

```bash
# Create .env file
touch .env
```

3. Add your API key to `.env`:

```bash
VITE_GEMINI_API_KEY=your_actual_api_key_here
```

Replace `your_actual_api_key_here` with your actual Gemini API key.

## Step 5: Add Your GLB/GLTF Models

1. Place your model files in `public/models/` directory:
   ```bash
   public/models/
     ├── shoe-1.glb
     ├── ML-9_OS-1.glb
     └── models.json
   ```

2. Update `public/models/models.json` with your model information:
   ```json
   [
     {
       "id": "shoe-1",
       "name": "shoe-1",
       "path": "/models/shoe-1.glb",
       "displayName": "Shoe Model 1",
       "description": "Your description",
       "price": "$129.99",
       "category": "Running",
       "colors": ["Black", "White", "Blue"],
       "thumbnail": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop"
     }
   ]
   ```

3. Update `src/pages/HomePage.tsx` to include your models in the `availableModels` array (if not using JSON).

## Step 6: Run the Development Server

```bash
npm run dev
```

The server will start on **http://localhost:3000**

## Step 7: Access the Application

1. Open your browser
2. Go to: **http://localhost:3000**
3. You should see:
   - Home page with product cards
   - Click any product to open the customizer
   - Use AI prompts or manual color picker

## Available URLs

- **Home Page**: http://localhost:3000/
- **Customizer**: http://localhost:3000/customize?model=/models/shoe-1.glb
- **Documentation**: http://localhost:3000/documentation

## Troubleshooting

### Port 3000 Already in Use

If port 3000 is busy, you can:
1. Kill the process: `lsof -ti:3000 | xargs kill -9`
2. Or change port in `vite.config.ts`:
   ```typescript
   server: {
     port: 3001, // Change to any available port
   }
   ```

### Dependencies Not Installing

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### API Key Not Working

1. Check `.env` file exists in project root
2. Verify API key is correct (no extra spaces)
3. Restart dev server after adding/changing `.env`
4. Check browser console for API errors

### Blank White Page

1. Open browser console (F12)
2. Check for JavaScript errors
3. Verify all files are loading (Network tab)
4. Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

### Models Not Loading

1. Check model files are in `public/models/` directory
2. Verify file paths in `models.json` are correct
3. Check browser console for 404 errors
4. Ensure GLB/GLTF files are valid

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## Project Structure

```
Hackathon-Nykaa/
├── public/
│   ├── models/          # Place GLB/GLTF files here
│   │   ├── shoe-1.glb
│   │   ├── models.json
│   │   └── ...
│   └── documentation/   # Documentation files
├── src/
│   ├── components/      # React components
│   ├── pages/          # Page components
│   ├── store/          # Zustand state management
│   ├── services/       # AI service
│   ├── utils/          # Utility functions
│   └── types/          # TypeScript types
├── .env                # Environment variables (create this)
├── package.json        # Dependencies
└── vite.config.ts     # Vite configuration
```

## Quick Start Checklist

- [ ] Node.js installed
- [ ] Navigated to project directory
- [ ] Ran `npm install`
- [ ] Created `.env` file with Gemini API key
- [ ] Added GLB models to `public/models/`
- [ ] Updated `models.json` with model info
- [ ] Ran `npm run dev`
- [ ] Opened http://localhost:3000 in browser

## Features Available

1. **Home Page**: Browse available shoe models
2. **3D Customizer**: 
   - Click parts to select
   - Manual color picker
   - AI prompt system (requires API key)
3. **Documentation**: Project documentation

## Need Help?

- Check browser console (F12) for errors
- Check terminal for build/compilation errors
- Verify all dependencies are installed
- Ensure API key is set correctly

