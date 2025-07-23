// Gemini API service (Secondary LLM)
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);

// Default model for the game
const DEFAULT_MODEL = 'gemini-1.5-pro';

/**
 * Generate story content using Gemini API
 * @param {string} prompt - The prompt for story generation
 * @param {string} model - The model to use (defaults to gemini-1.5-pro)
 * @param {number} temperature - Controls randomness (0-1)
 * @param {number} maxTokens - Maximum tokens to generate
 * @returns {Promise<string>} - The generated text
 */
export const generateStoryContent = async (
  prompt,
  model = DEFAULT_MODEL,
  temperature = 0.7,
  maxTokens = 1024
) => {
  try {
    const geminiModel = genAI.getGenerativeModel({ model: model });
    
    const result = await geminiModel.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `You are a creative storyteller for a sound novel mystery game called "Night of Pigeonweed". Create atmospheric, suspenseful narrative with a focus on mystery and psychological tension. The story takes place in an isolated setting.

${prompt}`
            }
          ]
        }
      ],
      generationConfig: {
        temperature: temperature,
        maxOutputTokens: maxTokens,
      },
    });

    return result.response.text();
  } catch (error) {
    console.error('Error generating content with Gemini:', error);
    throw error;
  }
};

/**
 * Generate choices for the player
 * @param {string} currentContext - The current story context
 * @param {number} numChoices - Number of choices to generate (default: 3)
 * @returns {Promise<string[]>} - Array of generated choices
 */
export const generateChoices = async (
  currentContext,
  numChoices = 3
) => {
  try {
    const geminiModel = genAI.getGenerativeModel({ model: DEFAULT_MODEL });
    
    const prompt = `You are generating player choices for a sound novel mystery game. Create first-person internal thoughts that represent meaningful decision points.

Based on the following story context, generate ${numChoices} different choices for the player. Each choice should be a first-person thought or consideration (e.g., "Should I open the door?", "Maybe I should hide and wait?"). Make the choices meaningful and divergent, leading to different possible story paths.

Context: ${currentContext}

Choices:`;

    const result = await geminiModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 256,
      },
    });

    const content = result.response.text();
    
    // Parse the choices from the response
    const choices = content
      .split('\n')
      .filter(line => line.trim().length > 0)
      .map(line => line.replace(/^\d+\.\s*/, '').trim()) // Remove numbering
      .filter(line => line.length > 0)
      .slice(0, numChoices);
    
    return choices.length > 0 ? choices : ['Continue...'];
  } catch (error) {
    console.error('Error generating choices with Gemini:', error);
    return ['Continue...'];
  }
};

export default {
  generateStoryContent,
  generateChoices,
};