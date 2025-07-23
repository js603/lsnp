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
            content: '당신은 "비둘기밥의 밤"이라는 사운드 소설 미스터리 게임의 창의적인 이야기꾼입니다. 미스터리와 심리적 긴장감에 중점을 둔 분위기 있고 긴장감 넘치는 내러티브를 만드세요. 이야기는 고립된 환경에서 진행됩니다.',
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
      const prompt = `다음 이야기 맥락을 기반으로 플레이어를 위한 ${numChoices}개의 서로 다른 선택지를 생성하세요. 각 선택지는 1인칭 생각이나 고려사항이어야 합니다(예: "문을 열어볼까?", "숨어서 기다려볼까?"). 선택지는 의미 있고 서로 다른 이야기 경로로 이어질 수 있도록 다양하게 만드세요.\n\n맥락: ${currentContext}\n\n선택지:`;
      
      const completion = await client.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: '당신은 사운드 소설 미스터리 게임을 위한 플레이어 선택지를 생성하고 있습니다. 의미 있는 결정 지점을 나타내는 1인칭 내면의 생각을 만드세요.',
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