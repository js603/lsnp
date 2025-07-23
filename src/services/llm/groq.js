// Groq API service (Main LLM)
import { Groq } from 'groq-sdk';

// Initialize Groq clients with placeholder API keys
// Users need to provide their own API keys at runtime
let mainApiKey = process.env.REACT_APP_GROQ_API_MAIN_KEY;
let subApiKey = process.env.REACT_APP_GROQ_API_SUB_KEY;

// Check if we're in development mode and use environment variables if available
if (process.env.NODE_ENV === 'development') {
  if (process.env.REACT_APP_GROQ_API_MAIN_KEY && process.env.REACT_APP_GROQ_API_MAIN_KEY !== 'YOUR_GROQ_API_KEY') {
    mainApiKey = process.env.REACT_APP_GROQ_API_MAIN_KEY;
  }
  if (process.env.REACT_APP_GROQ_API_SUB_KEY && process.env.REACT_APP_GROQ_API_SUB_KEY !== 'YOUR_GROQ_API_SUB_KEY') {
    subApiKey = process.env.REACT_APP_GROQ_API_SUB_KEY;
  }
}

const groqMain = new Groq({
  apiKey: mainApiKey,
  dangerouslyAllowBrowser: true,
});

const groqSub = new Groq({
  apiKey: subApiKey,
  dangerouslyAllowBrowser: true,
});

// Default model for the game
const DEFAULT_MODEL = 'llama3-70b-8192';

/**
 * Generate story content using Groq API
 * @param {string} prompt - The prompt for story generation
 * @param {string} model - The model to use (defaults to llama3-70b-8192)
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
  // Helper function to create completion with a specific client
  const createCompletion = async (client, clientName) => {
    try {
      const completion = await client.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are a creative storyteller for a sound novel mystery game called "Night of Pigeonweed". Create atmospheric, suspenseful narrative with a focus on mystery and psychological tension. The story takes place in an isolated setting.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        model: model,
        temperature: temperature,
        max_tokens: maxTokens,
      });

      return completion.choices[0]?.message?.content || '';
    } catch (error) {
      console.error(`Error generating content with Groq ${clientName}:`, error);
      throw error;
    }
  };

  // Try main client first, then fall back to sub client
  try {
    return await createCompletion(groqMain, 'MAIN');
  } catch (mainError) {
    console.warn('Groq MAIN API failed, falling back to SUB API:', mainError);
    try {
      return await createCompletion(groqSub, 'SUB');
    } catch (subError) {
      console.error('All Groq APIs failed:', subError);
      throw new Error('Failed to generate content with any available Groq API');
    }
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
  // Helper function to create choices with a specific client
  const createChoices = async (client, clientName) => {
    try {
      const prompt = `Based on the following story context, generate ${numChoices} different choices for the player. Each choice should be a first-person thought or consideration (e.g., "Should I open the door?", "Maybe I should hide and wait?"). Make the choices meaningful and divergent, leading to different possible story paths.\n\nContext: ${currentContext}\n\nChoices:`;
      
      const completion = await client.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are generating player choices for a sound novel mystery game. Create first-person internal thoughts that represent meaningful decision points.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        model: DEFAULT_MODEL,
        temperature: 0.8,
        max_tokens: 256,
      });

      const content = completion.choices[0]?.message?.content || '';
      
      // Parse the choices from the response
      const choices = content
        .split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => line.replace(/^\d+\.\s*/, '').trim()) // Remove numbering
        .filter(line => line.length > 0)
        .slice(0, numChoices);
      
      return choices.length > 0 ? choices : ['Continue...'];
    } catch (error) {
      console.error(`Error generating choices with Groq ${clientName}:`, error);
      throw error;
    }
  };

  // Try main client first, then fall back to sub client
  try {
    return await createChoices(groqMain, 'MAIN');
  } catch (mainError) {
    console.warn('Groq MAIN API failed for choices, falling back to SUB API:', mainError);
    try {
      return await createChoices(groqSub, 'SUB');
    } catch (subError) {
      console.error('All Groq APIs failed for choices:', subError);
      return ['Continue...'];  // Default fallback if all APIs fail
    }
  }
};

// Create a named object for export
const groqService = {
  generateStoryContent,
  generateChoices,
};

export default groqService;