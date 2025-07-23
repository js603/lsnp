// Gemini API service (Secondary LLM)
import { GoogleGenerativeAI } from '@google/generative-ai';

// 자리 표시 자 API 키로 Gemini 클라이언트를 초기화합니다
// 사용자는 런타임에 자체 API 키를 제공해야합니다.
let mainApiKey = 'AIzaSyDC11rqjU30OJnLjaBFOaazZV0klM5raU8';
let subApiKey = 'AIzaSyAhscNjW8GmwKPuKzQ47blCY_bDanR-B84';
let thirdApiKey = 'AIzaSyCH-v67rjijFO_So2mTDj_-qIy2aNJYgz0';

// 우리가 개발 모드에 있는지 확인하고 가능한 경우 환경 변수를 사용하십시오.
if (process.env.NODE_ENV === 'development') {
  if (process.env.REACT_APP_GEMINI_API_MAIN_KEY && process.env.REACT_APP_GEMINI_API_MAIN_KEY !== 'YOUR_GEMINI_API_KEY') {
    mainApiKey = process.env.REACT_APP_GEMINI_API_MAIN_KEY;
  }
  if (process.env.REACT_APP_GEMINI_API_SUB_KEY && process.env.REACT_APP_GEMINI_API_SUB_KEY !== 'YOUR_GEMINI_API_SUB_KEY') {
    subApiKey = process.env.REACT_APP_GEMINI_API_SUB_KEY;
  }
  if (process.env.REACT_APP_GEMINI_API_THIRD_KEY && process.env.REACT_APP_GEMINI_API_THIRD_KEY !== 'YOUR_GEMINI_API_THIRD_KEY') {
    thirdApiKey = process.env.REACT_APP_GEMINI_API_THIRD_KEY;
  }
}

const genAIMain = new GoogleGenerativeAI(mainApiKey);
const genAISub = new GoogleGenerativeAI(subApiKey);
const genAIThird = new GoogleGenerativeAI(thirdApiKey);

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
  // Helper function to create content with a specific client
  const createContent = async (client, clientName) => {
    try {
      const geminiModel = client.getGenerativeModel({ model: model });
      
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
      console.error(`Error generating content with Gemini ${clientName}:`, error);
      throw error;
    }
  };

  // Try main client first, then fall back to sub client, then to third client
  try {
    return await createContent(genAIMain, 'MAIN');
  } catch (mainError) {
    console.warn('Gemini MAIN API failed, falling back to SUB API:', mainError);
    try {
      return await createContent(genAISub, 'SUB');
    } catch (subError) {
      console.warn('Gemini SUB API failed, falling back to THIRD API:', subError);
      try {
        return await createContent(genAIThird, 'THIRD');
      } catch (thirdError) {
        console.error('All Gemini APIs failed:', thirdError);
        throw new Error('Failed to generate content with any available Gemini API');
      }
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
      const geminiModel = client.getGenerativeModel({ model: DEFAULT_MODEL });
      
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
      console.error(`Error generating choices with Gemini ${clientName}:`, error);
      throw error;
    }
  };

  // Try main client first, then fall back to sub client, then to third client
  try {
    return await createChoices(genAIMain, 'MAIN');
  } catch (mainError) {
    console.warn('Gemini MAIN API failed for choices, falling back to SUB API:', mainError);
    try {
      return await createChoices(genAISub, 'SUB');
    } catch (subError) {
      console.warn('Gemini SUB API failed for choices, falling back to THIRD API:', subError);
      try {
        return await createChoices(genAIThird, 'THIRD');
      } catch (thirdError) {
        console.error('All Gemini APIs failed for choices:', thirdError);
        return ['Continue...'];  // Default fallback if all APIs fail
      }
    }
  }
};

// Create a named object for export
const geminiService = {
  generateStoryContent,
  generateChoices,
};

export default geminiService;