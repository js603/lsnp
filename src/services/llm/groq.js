// Groq API service (Main LLM)
import { Groq } from 'groq-sdk';

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.REACT_APP_GROQ_API_KEY,
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
  try {
    const completion = await groq.chat.completions.create({
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
    console.error('Error generating content with Groq:', error);
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
    const prompt = `Based on the following story context, generate ${numChoices} different choices for the player. Each choice should be a first-person thought or consideration (e.g., "Should I open the door?", "Maybe I should hide and wait?"). Make the choices meaningful and divergent, leading to different possible story paths.\n\nContext: ${currentContext}\n\nChoices:`;
    
    const completion = await groq.chat.completions.create({
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
    console.error('Error generating choices with Groq:', error);
    return ['Continue...'];
  }
};

export default {
  generateStoryContent,
  generateChoices,
};