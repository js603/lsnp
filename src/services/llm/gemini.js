// Gemini API service (Secondary LLM)
import { GoogleGenerativeAI } from '@google/generative-ai';

// 자리 표시 자 API 키로 Gemini 클라이언트를 초기화합니다
// 사용자는 런타임에 자체 API 키를 제공해야합니다.
let mainApiKey = process.env.REACT_APP_GEMINI_API_MAIN_KEY;
let subApiKey = process.env.REACT_APP_GEMINI_API_SUB_KEY;
let thirdApiKey = process.env.REACT_APP_GEMINI_API_THIRD_KEY;

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
                text: `당신은 "비둘기밥의 밤"이라는 사운드 소설 미스터리 게임의 창의적인 이야기꾼입니다. 미스터리와 심리적 긴장감에 중점을 둔 분위기 있고 긴장감 넘치는 이야기를 만드세요. 이야기는 고립된 환경에서 진행됩니다.

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
      
      const prompt = `당신은 사운드 소설 미스터리 게임을 위한 플레이어 선택지를 생성하고 있습니다. 의미 있는 결정 지점을 나타내는 1인칭 내면의 생각을 만드세요.

다음 이야기 맥락을 기반으로 플레이어를 위한 ${numChoices}개의 서로 다른 선택지를 생성하세요. 각 선택지는 1인칭 생각이나 고려사항이어야 합니다(예: "문을 열어볼까?", "숨어서 기다려볼까?"). 선택지는 의미 있고 서로 다른 이야기 경로로 이어질 수 있도록 다양하게 만드세요.

맥락: ${currentContext}

선택지:`;

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