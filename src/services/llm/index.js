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

// Prompt templates for different game scenarios
export const PROMPT_TEMPLATES = {
  GAME_START: `You are starting a new mystery story in an isolated setting. Set the scene with atmospheric description. The protagonist has just arrived at [LOCATION]. Describe the initial setting, the weather, and the protagonist's first impressions. End with something slightly unsettling to create tension.`,
  
  CONTINUE_STORY: `Continue the story from where we left off. The current situation is: [CONTEXT]. Develop the narrative further, maintaining the mysterious and suspenseful atmosphere. Introduce subtle clues or developments that advance the plot.`,
  
  INVESTIGATE_OBJECT: `The protagonist is examining [OBJECT] more closely. Describe what they discover in detail. Include sensory details and possibly a small revelation or hint that adds to the mystery.`,
  
  ENCOUNTER_CHARACTER: `The protagonist encounters a character named [CHARACTER_NAME]. Describe this character's appearance (keeping details minimal to allow player imagination), their demeanor, and the initial interaction. This character should feel slightly mysterious.`,
  
  TENSE_MOMENT: `Create a tense moment where the protagonist [ACTION]. Build suspense through pacing, environmental details, and the protagonist's internal thoughts. Something unexpected should happen that raises the stakes.`,
  
  REVELATION: `The protagonist has just discovered [REVELATION]. Describe their reaction and how this changes their understanding of the situation. This should be a significant plot development that deepens the mystery.`,
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