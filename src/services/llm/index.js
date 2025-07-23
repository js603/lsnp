// Unified LLM service with fallback mechanism
import groqService from './groq';
import geminiService from './gemini';

// LLM Service preference
const LLM_PREFERENCE = {
  PRIMARY: 'groq',
  SECONDARY: 'gemini',
};

/**
 * Generate story content using the preferred LLM service with fallback
 * @param {string} prompt - The prompt for story generation
 * @param {Object} options - Additional options
 * @param {string} options.preferredService - The preferred service to use ('groq' or 'gemini')
 * @param {string} options.model - The model to use
 * @param {number} options.temperature - Controls randomness (0-1)
 * @param {number} options.maxTokens - Maximum tokens to generate
 * @returns {Promise<string>} - The generated text
 */
export const generateStoryContent = async (
  prompt,
  options = {}
) => {
  const {
    preferredService = LLM_PREFERENCE.PRIMARY,
    model,
    temperature,
    maxTokens,
  } = options;

  try {
    // Try the preferred service first
    if (preferredService === LLM_PREFERENCE.PRIMARY) {
      try {
        return await groqService.generateStoryContent(prompt, model, temperature, maxTokens);
      } catch (error) {
        console.warn('Primary LLM service failed, falling back to secondary:', error);
        return await geminiService.generateStoryContent(prompt, model, temperature, maxTokens);
      }
    } else {
      try {
        return await geminiService.generateStoryContent(prompt, model, temperature, maxTokens);
      } catch (error) {
        console.warn('Secondary LLM service failed, falling back to primary:', error);
        return await groqService.generateStoryContent(prompt, model, temperature, maxTokens);
      }
    }
  } catch (error) {
    console.error('All LLM services failed:', error);
    throw new Error('Failed to generate story content with any available LLM service');
  }
};

/**
 * Generate choices for the player using the preferred LLM service with fallback
 * @param {string} currentContext - The current story context
 * @param {Object} options - Additional options
 * @param {string} options.preferredService - The preferred service to use ('groq' or 'gemini')
 * @param {number} options.numChoices - Number of choices to generate
 * @returns {Promise<string[]>} - Array of generated choices
 */
export const generateChoices = async (
  currentContext,
  options = {}
) => {
  const {
    preferredService = LLM_PREFERENCE.PRIMARY,
    numChoices = 3,
  } = options;

  try {
    // Try the preferred service first
    if (preferredService === LLM_PREFERENCE.PRIMARY) {
      try {
        return await groqService.generateChoices(currentContext, numChoices);
      } catch (error) {
        console.warn('Primary LLM service failed for choices, falling back to secondary:', error);
        return await geminiService.generateChoices(currentContext, numChoices);
      }
    } else {
      try {
        return await geminiService.generateChoices(currentContext, numChoices);
      } catch (error) {
        console.warn('Secondary LLM service failed for choices, falling back to primary:', error);
        return await groqService.generateChoices(currentContext, numChoices);
      }
    }
  } catch (error) {
    console.error('All LLM services failed for choices:', error);
    return ['Continue...'];
  }
};

// 다양한 게임 시나리오를 위한 프롬프트 템플릿
export const PROMPT_TEMPLATES = {
  GAME_START: `당신은 고립된 환경에서 새로운 미스터리 이야기를 시작하고 있습니다. 분위기가 느껴지는 묘사로 장면을 설정하세요. 주인공이 방금 [LOCATION]에 도착했습니다. 초기 설정, 날씨, 그리고 주인공의 첫인상을 묘사하세요. 긴장감을 조성하기 위해 약간 불안한 무언가로 끝내세요.`,

  CONTINUE_STORY: `이야기를 이어서 진행하세요. 현재 상황은 다음과 같습니다: [CONTEXT]. 신비롭고 긴장감 넘치는 분위기를 유지하면서 내러티브를 더 발전시키세요. 플롯을 진행시키는 미묘한 단서나 발전을 소개하세요.`,

  INVESTIGATE_OBJECT: `주인공이 [OBJECT]를 더 자세히 조사하고 있습니다. 그들이 발견한 것을 자세히 설명하세요. 감각적인 세부 사항과 미스터리에 더해질 수 있는 작은 계시나 힌트를 포함하세요.`,

  ENCOUNTER_CHARACTER: `주인공이 [CHARACTER_NAME]이라는 캐릭터를 만납니다. 이 캐릭터의 외모(플레이어의 상상력을 위해 세부 사항을 최소화하며), 그들의 태도, 그리고 초기 상호작용을 설명하세요. 이 캐릭터는 약간 신비롭게 느껴져야 합니다.`,

  TENSE_MOMENT: `주인공이 [ACTION]하는 긴장된 순간을 만드세요. 페이싱, 환경적 세부 사항, 그리고 주인공의 내면적 생각을 통해 서스펜스를 구축하세요. 판돈을 높이는 예상치 못한 무언가가 일어나야 합니다.`,

  REVELATION: `주인공이 방금 [REVELATION]을 발견했습니다. 그들의 반응과 이것이 상황에 대한 그들의 이해를 어떻게 바꾸는지 설명하세요. 이것은 미스터리를 더 깊게 하는 중요한 플롯 발전이어야 합니다.`,
};

// Replace template placeholders with actual values
export const fillPromptTemplate = (template, replacements) => {
  let filledTemplate = template;
  for (const [key, value] of Object.entries(replacements)) {
    filledTemplate = filledTemplate.replace(`[${key}]`, value);
  }
  return filledTemplate;
};

// Create a named object for export
const llmService = {
  generateStoryContent,
  generateChoices,
  PROMPT_TEMPLATES,
  fillPromptTemplate,
};

export default llmService;