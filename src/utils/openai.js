// utils/openai.js - Real OpenAI API Integration
export class OpenAIService {
    constructor(apiKey) {
      this.apiKey = apiKey;
      this.baseURL = 'https://api.openai.com/v1';
    }
  
    async validateApiKey() {
      try {
        const response = await fetch(`${this.baseURL}/models`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        });
  
        if (response.ok) {
          return { valid: true };
        } else {
          const error = await response.json();
          return { valid: false, error: error.error?.message || 'Invalid API key' };
        }
      } catch (error) {
        return { valid: false, error: 'Network error' };
      }
    }
  
    async analyzeImage(base64Image, prompt) {
      try {
        const response = await fetch(`${this.baseURL}/chat/completions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: "gpt-4o", // Latest vision model
            messages: [
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: prompt
                  },
                  {
                    type: "image_url",
                    image_url: {
                      url: base64Image
                    }
                  }
                ]
              }
            ],
            max_tokens: 500,
            temperature: 0.7
          })
        });
  
        const data = await response.json();
        
        if (response.ok) {
          return JSON.parse(data.choices[0].message.content);
        } else {
          throw new Error(data.error?.message || 'API call failed');
        }
      } catch (error) {
        console.error('OpenAI API Error:', error);
        throw error;
      }
    }
  
    async filterMeaningfulImage(base64Image) {
      const prompt = `
        Analyze this image and determine if it contains meaningful visual content or is just a simple icon/thumbnail.
  
        Consider MEANINGFUL:
        - Photographs of people, places, objects, scenes
        - Artwork, illustrations, drawings, paintings
        - Screenshots with substantial content
        - Charts, graphs, diagrams with data
        - Complex designs or compositions
  
        Consider NOT meaningful (skip these):
        - Simple icons or logos
        - Small thumbnails or previews  
        - Basic geometric shapes
        - UI elements like buttons
        - Low resolution or pixelated images
        - Single-color or gradient backgrounds
  
        Respond ONLY with valid JSON:
        {
          "meaningful": true/false,
          "reason": "brief explanation why",
          "confidence": 0.0-1.0,
          "imageType": "photo/artwork/screenshot/icon/etc"
        }
      `;
  
      return await this.analyzeImage(base64Image, prompt);
    }
  
    async generatePrompts(base64Image) {
      const prompt = `
        Analyze this image and create detailed AI prompts for generating similar content.
  
        Generate prompts optimized for different AI platforms:
  
        1. TEXT-TO-IMAGE: Perfect for DALL-E 3, Midjourney, Stable Diffusion
        2. TEXT-TO-VIDEO: Optimized for Runway ML, Pika Labs, Gen-2
        3. CREATIVE ENHANCED: Artistic interpretation for creative exploration
  
        Focus on:
        - Visual style and artistic technique
        - Composition and framing
        - Lighting, shadows, and mood
        - Color palette and contrast
        - Subject matter and context
        - Camera angle and perspective
        - Textures and materials
        - Atmosphere and emotion
  
        Respond ONLY with valid JSON:
        {
          "imagePrompt": "detailed text-to-image prompt (50-100 words)",
          "videoPrompt": "detailed text-to-video prompt with motion (50-100 words)", 
          "creativePrompt": "enhanced artistic interpretation prompt (50-100 words)",
          "tags": ["relevant", "descriptive", "tags"],
          "style": "art style description",
          "mood": "emotional tone/atmosphere",
          "colors": ["dominant", "color", "palette"],
          "lighting": "lighting description",
          "composition": "composition type",
          "quality": "suggested quality parameters"
        }
      `;
  
      return await this.analyzeImage(base64Image, prompt);
    }
  
    // Cost calculation helper
    calculateCost(imageCount, tokensUsed) {
      // GPT-4o Vision pricing (as of 2024)
      const costPerImage = 0.00765; // per image
      const costPerToken = 0.00003; // per output token
      
      return (imageCount * costPerImage) + (tokensUsed * costPerToken);
    }
  }
  
  // Usage in App.js
  export const createOpenAIService = (apiKey) => {
    return new OpenAIService(apiKey);
  };
  
  // Error handling wrapper
  export const handleOpenAIError = (error) => {
    if (error.message.includes('rate_limit')) {
      return 'Rate limit exceeded. Please wait and try again.';
    } else if (error.message.includes('insufficient_quota')) {
      return 'Insufficient quota. Please check your OpenAI billing.';
    } else if (error.message.includes('invalid_api_key')) {
      return 'Invalid API key. Please check your OpenAI API key.';
    } else {
      return `API Error: ${error.message}`;
    }
  };