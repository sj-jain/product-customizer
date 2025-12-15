# 3D Shoe Customizer

A web-based 3D product customizer built with React, Three.js, and AI integration. Customize shoe models with manual color selection or AI-powered design prompts.

![3D Customizer](https://img.shields.io/badge/3D-Customizer-blue)
![React](https://img.shields.io/badge/React-18.2.0-61DAFB)
![Three.js](https://img.shields.io/badge/Three.js-0.158.0-000000)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-3178C6)

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Add API key to .env
echo "VITE_GEMINI_API_KEY=your_key_here" > .env

# Start development server
npm run dev
```

Open **http://localhost:3000** in your browser.

## ✨ Features

- 🎨 **3D Model Viewer** - Interactive GLB/GLTF model rendering
- 🖱️ **Click-to-Select** - Select individual parts by clicking
- 🎨 **Manual Color Picker** - Choose colors for each part
- 🤖 **AI-Powered Design** - Generate designs with natural language prompts
- 🔄 **Automatic Application** - Colors apply automatically from AI
- 📦 **Multiple Models** - Support for multiple shoe models
- 🎯 **Smart Matching** - Handles duplicate part names automatically

## 📖 Documentation

- **[Complete Documentation](./PROJECT-DOCUMENTATION.md)** - Comprehensive project guide
- **[Quick Start Guide](./QUICK-START.md)** - Get started in 3 steps
- **[Setup Instructions](./SETUP-AND-RUN.md)** - Detailed setup guide
- **[AI Integration](./AI-SETUP.md)** - AI setup and usage

## 🛠 Tech Stack

- **React 18** + **TypeScript** - UI Framework
- **Three.js** + **React Three Fiber** - 3D Rendering
- **Zustand** - State Management
- **Tailwind CSS** - Styling
- **Google Gemini AI** - AI Design Suggestions

## 📁 Project Structure

```
src/
├── components/     # React components
├── pages/         # Page components
├── store/         # State management
├── services/      # AI service
├── utils/         # Utility functions
└── types/         # TypeScript types
```

## 🎯 Usage

### Manual Customization
1. Click on any part of the 3D model
2. Select color from picker
3. Color applies immediately

### AI Customization
1. Go to "AI Prompt" tab
2. Enter prompt: "hulk style shoes"
3. Click "Generate"
4. Colors apply automatically!

## 🔧 Configuration

### Add Models
1. Place GLB files in `public/models/`
2. Update `public/models/models.json`
3. Refresh page

### API Key
Get Gemini API key from: https://makersuite.google.com/app/apikey

Add to `.env`:
```
VITE_GEMINI_API_KEY=your_key_here
```

## 📝 Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run linter
```

## 🐛 Troubleshooting

**Blank page?** Check browser console (F12) for errors

**Models not loading?** Verify file paths in `models.json`

**AI not working?** Check `.env` file has correct API key

See [Troubleshooting Guide](./PROJECT-DOCUMENTATION.md#troubleshooting) for more.

## 📚 Learn More

- [Three.js Docs](https://threejs.org/docs/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/)
- [Gemini API](https://ai.google.dev/docs)

## 📄 License

Hackathon Project

---

**Made with ❤️ using React, Three.js, and AI**
