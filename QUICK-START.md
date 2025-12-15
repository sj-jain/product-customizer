# Quick Start Guide

## 🚀 Run in 3 Steps

### Step 1: Install Dependencies
```bash
cd /Users/risha/Documents/Hackathon-Nykaa
npm install
```

### Step 2: Add API Key (Optional - for AI features)
```bash
# Create .env file
echo "VITE_GEMINI_API_KEY=your_api_key_here" > .env
```

Get API key from: https://makersuite.google.com/app/apikey

### Step 3: Start Server
```bash
npm run dev
```

## 🌐 Open in Browser

**URL**: http://localhost:3000

## 📁 Project Structure

```
public/models/          ← Place your GLB files here
src/pages/HomePage.tsx ← Home page with product cards
src/pages/CustomizePage.tsx ← 3D customizer
.env                   ← API key (create this file)
```

## ✅ Verify Setup

1. Server running? Check terminal for "Local: http://localhost:3000"
2. Browser shows home page? You should see product cards
3. Models loading? Check browser console (F12) for mesh discovery logs
4. AI working? Enter a prompt like "hulk style shoes" in AI Prompt tab

## 🎯 Usage

1. **Home Page** → Select a shoe model
2. **Customizer Opens** → Click any part to select it
3. **Color Parts**:
   - **Manual**: Use color picker
   - **AI**: Enter prompt like "make buckle red and upper blue"
4. **AI Features**: 
   - Enter design prompt
   - AI returns colors for all parts
   - Click "Apply AI Design" to apply

## 🔧 Troubleshooting

**Blank page?**
- Check browser console (F12) for errors
- Verify `npm install` completed successfully
- Hard refresh: Cmd+Shift+R

**Models not showing?**
- Check `public/models/` has GLB files
- Verify `models.json` is updated
- Check browser console for 404 errors

**AI not working?**
- Check `.env` file exists with API key
- Restart server after adding API key
- Check browser console for API errors

