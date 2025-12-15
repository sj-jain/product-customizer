/**
 * AI Service for Design Suggestions
 * 
 * Integrates with Gemini API to process natural language prompts
 * and return structured color mappings for shoe parts
 */

export interface AIColorMapping {
  partName: string;  // e.g., "upper", "sole", "laces"
  color: string;     // Hex color code
  reason?: string;   // Why this color was chosen
}

export interface AIResponse {
  success: boolean;
  mappings: AIColorMapping[];
  description?: string;  // Overall design description
  error?: string;
}

/**
 * Call Gemini API to get design suggestions based on prompt
 */
export async function getDesignFromAI(
  prompt: string,
  availableParts: string[]
): Promise<AIResponse> {
  try {
    // Get API key from environment variable
    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!API_KEY || API_KEY === 'YOUR_API_KEY_HERE') {
      throw new Error('Gemini API key not configured. Please set VITE_GEMINI_API_KEY in your .env file');
    }

    // Use the correct Gemini API endpoint
    // Try gemini-2.5-flash (newer, better quota) or gemini-flash-latest (always latest)
    // If quota exceeded, the error will be caught and displayed to user
    const MODEL_NAME = 'gemini-2.5-flash'; // Try newer model first
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent`;

    // Create a structured prompt for the AI
    // List all parts clearly for the AI
    const partsList = availableParts.map((part, index) => `${index + 1}. ${part}`).join('\n');
    
    const systemPrompt = `You are a shoe design expert. The user wants to customize a shoe based on this prompt: "${prompt}"

The shoe has ${availableParts.length} parts that need to be colored. Here is the complete list of ALL parts:

${partsList}

CRITICAL REQUIREMENTS:
1. You MUST provide a color for EVERY SINGLE part listed above (all ${availableParts.length} parts)
2. Do NOT skip any parts
3. Each part must have a unique color that matches the theme "${prompt}"
4. Be creative and ensure the color scheme is cohesive

IMPORTANT: Return ONLY a valid JSON object with this exact structure (no markdown, no code blocks, just pure JSON):
{
  "description": "Brief description of the design",
  "mappings": [
    {
      "partName": "Part Name 1",
      "color": "#FF0000",
      "reason": "Red matches the theme"
    },
    {
      "partName": "Part Name 2",
      "color": "#000000",
      "reason": "Black for contrast"
    }
    ... (continue for ALL ${availableParts.length} parts)
  ]
}

Rules:
- partName must match one of the available parts EXACTLY from the list above (case-insensitive)
- You MUST include ALL ${availableParts.length} parts in your mappings array - no exceptions
- color must be a valid hex color code (format: #RRGGBB)
- Be creative and match the theme!
- Return ONLY the JSON, no other text`;

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': API_KEY,
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: systemPrompt
          }]
        }]
      }),
    });

    if (!response.ok) {
      // Get error details from response
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || errorData.message || response.statusText;
      console.error('API Error Details:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      throw new Error(`API error (${response.status}): ${errorMessage}`);
    }

    const data = await response.json();
    
    // Log full response for debugging
    console.log('AI API Response:', data);
    
    // Extract text from Gemini response
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    if (!responseText) {
      console.error('Empty response from AI:', data);
      throw new Error('Empty response from AI. Check API key and permissions.');
    }
    
    // Try to extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('No JSON found in response. Full text:', responseText);
      throw new Error(`No JSON found in AI response. Response: ${responseText.substring(0, 200)}`);
    }

    let aiResult;
    try {
      aiResult = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError, 'Text:', jsonMatch[0]);
      throw new Error(`Failed to parse AI response as JSON: ${parseError}`);
    }

    // Validate and format response
    const mappings: AIColorMapping[] = [];
    if (aiResult.mappings && Array.isArray(aiResult.mappings)) {
      aiResult.mappings.forEach((mapping: any) => {
        if (mapping.partName && mapping.color) {
          // Ensure color is in hex format
          let color = mapping.color;
          if (!color.startsWith('#')) {
            color = '#' + color;
          }
          mappings.push({
            partName: mapping.partName.toLowerCase(),
            color: color,
            reason: mapping.reason,
          });
        }
      });
    }

    return {
      success: true,
      mappings,
      description: aiResult.description || 'AI-generated design',
    };

  } catch (error: any) {
    console.error('AI API Error Details:', {
      message: error.message,
      stack: error.stack,
      error: error
    });
    
    // Provide more helpful error messages
    let errorMessage = error.message || 'Failed to get AI design suggestions';
    
    if (error.message?.includes('API error')) {
      // API returned an error status
      errorMessage = error.message;
    } else if (error.message?.includes('fetch')) {
      // Network error
      errorMessage = 'Network error. Check your internet connection.';
    } else if (error.message?.includes('JSON')) {
      // JSON parsing error
      errorMessage = 'AI returned invalid response format. Please try again.';
    }
    
    return {
      success: false,
      mappings: [],
      error: errorMessage,
    };
  }
}

/**
 * Fallback: Parse prompt locally if AI is not available
 */
export function parsePromptLocally(
  prompt: string,
  availableParts: string[]
): AIResponse {
  // This is a fallback - you can use the existing promptParser here
  // For now, return empty response
  return {
    success: false,
    mappings: [],
    error: 'AI service not configured. Please set VITE_GEMINI_API_KEY',
  };
}

