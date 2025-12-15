# Environment Variables Setup

## Create .env File

Create a file named `.env` in the project root directory (`/Users/risha/Documents/Hackathon-Nykaa/`)

## File Content

Copy and paste this into your `.env` file:

```bash
# Gemini API Configuration
# Get your API key from: https://makersuite.google.com/app/apikey
VITE_GEMINI_API_KEY=AIzaSyAq-9HuOq8Ml10LOwTEg7qRJXBPvi1KoY8
```

## What to Provide

### Required Variable:

**`VITE_GEMINI_API_KEY`**
- **What it is**: Your Google Gemini API key
- **Where to get it**: 
  1. Go to https://makersuite.google.com/app/apikey
  2. Sign in with your Google account
  3. Click "Create API Key"
  4. Copy the API key
- **Format**: A long string like `AIzaSyAq-9HuOq8Ml10LOwTEg7qRJXBPvi1KoY8`
- **Current value**: Already provided above (from your curl example)

## Quick Setup

### Option 1: Using Terminal

```bash
cd /Users/risha/Documents/Hackathon-Nykaa
cat > .env << 'EOF'
# Gemini API Configuration
# Get your API key from: https://makersuite.google.com/app/apikey
VITE_GEMINI_API_KEY=AIzaSyAq-9HuOq8Ml10LOwTEg7qRJXBPvi1KoY8
EOF
```

### Option 2: Manual Creation

1. Open your code editor
2. Create a new file named `.env` in the project root
3. Paste the content above
4. Save the file

## Verify Setup

After creating the file, restart your dev server:

```bash
npm run dev
```

The AI features should now work! Try entering a prompt like "hulk style shoes" in the AI Prompt tab.

## Security Notes

- ✅ The `.env` file is already in `.gitignore` - it won't be committed to git
- ✅ Never share your API key publicly
- ✅ If you need to change the key, just update the value in `.env`

## Troubleshooting

**"Gemini API key not configured" error:**
- Make sure `.env` file exists in the project root
- Check the file name is exactly `.env` (not `.env.txt` or `.env.local`)
- Restart the dev server after creating/updating `.env`
- Verify the API key value doesn't have extra spaces

**API errors:**
- Check your API key is valid at https://makersuite.google.com/app/apikey
- Ensure you have API access enabled
- Check browser console for detailed error messages

