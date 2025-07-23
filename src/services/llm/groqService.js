import { Groq } from 'groq-sdk';

/**
 * Groq API Service
 * Handles communication with the Groq API for story generation and choice creation
 * 
 * Features:
 * - API key fallback mechanism: If the MAIN API key fails, the service automatically
 *   switches to the SUB API key to ensure continuous operation.
 * - Error handling: Detailed error logging with information about which API key failed.
 * - Seamless transition: The fallback happens transparently to the calling code.
 */
class GroqService {
  constructor(apiKey) {
    this.mainApiKey = apiKey || process.env.REACT_APP_GROQ_API_MAIN_KEY;
    this.subApiKey = process.env.REACT_APP_GROQ_API_SUB_KEY;
    this.client = new Groq({
      apiKey: this.mainApiKey,
    });
    this.model = 'llama3-70b-8192'; // Default model
    this.systemPrompt = this.getDefaultSystemPrompt();
    this.conversationHistory = [];
    this.maxTokens = 4096;
    this.temperature = 0.7;
    this.currentApiKey = 'main'; // Track which API key is currently in use
  }

  /**
   * Get the default system prompt for the sound novel game
   */
  getDefaultSystemPrompt() {
    return `You are the storyteller for a sound novel mystery game called "비둘기밥의 밤" (Night of Pigeonweed).
    
This is a mystery game with a suspenseful atmosphere similar to "Kamaitachi no Yoru". The setting is a closed, isolated environment where mysterious events occur.

Your role is to:
1. Generate engaging narrative text that creates suspense and mystery
2. Provide 2-4 choices after each narrative segment that represent the protagonist's internal thoughts
3. Respond to player choices by continuing the story in a logical and consistent manner
4. Maintain the atmosphere of mystery and psychological tension
5. Create branching paths that lead to different outcomes
6. Ensure all story elements are consistent with previous choices

The narrative should be in Korean language, written in a literary style appropriate for a mystery novel.

Choices should be written in first-person perspective, representing the protagonist's thoughts or possible actions.

Do not break character or acknowledge that you are an AI. Respond only as the game's storyteller.`;
  }

  /**
   * Set the system prompt
   * @param {string} prompt - The system prompt to set
   */
  setSystemPrompt(prompt) {
    this.systemPrompt = prompt;
  }

  /**
   * Set the model to use
   * @param {string} model - The model name
   */
  setModel(model) {
    this.model = model;
  }

  /**
   * Set the temperature for generation
   * @param {number} temperature - The temperature value (0.0 to 1.0)
   */
  setTemperature(temperature) {
    this.temperature = Math.max(0, Math.min(1, temperature));
  }

  /**
   * Clear the conversation history
   */
  clearConversationHistory() {
    this.conversationHistory = [];
  }

  /**
   * Add a message to the conversation history
   * @param {string} role - The role (system, user, assistant)
   * @param {string} content - The message content
   */
  addToConversationHistory(role, content) {
    this.conversationHistory.push({ role, content });
  }

  /**
   * Switch to the SUB API key
   * @returns {boolean} - True if successfully switched, false if already using SUB key
   */
  switchToSubKey() {
    if (this.currentApiKey === 'sub') {
      console.warn('Already using SUB API key, no fallback available');
      return false;
    }
    
    if (!this.subApiKey) {
      console.warn('No SUB API key available for fallback');
      return false;
    }
    
    console.log('Switching from MAIN to SUB API key due to error');
    this.client = new Groq({
      apiKey: this.subApiKey,
    });
    this.currentApiKey = 'sub';
    return true;
  }

  /**
   * Generate a story segment based on the current state
   * @param {object} gameState - The current game state
   * @param {string} playerInput - The player's input or choice
   * @returns {Promise<object>} - The generated story segment with choices
   */
  async generateStorySegment(gameState, playerInput) {
    // Prepare the prompt based on game state and player input
    let prompt;
    
    if (gameState.isNewGame) {
      // For a new game, include setup information
      prompt = `게임을 시작합니다. 다음 설정에 맞는 미스터리 이야기의 도입부를 생성해주세요:
      
배경: ${gameState.setting || '고립된 산장'}
시간: ${gameState.time || '폭설이 내리는 겨울 밤'}
주인공: ${gameState.protagonist || '주인공은 우연히 이 장소에 오게 된 평범한 사람입니다.'}

도입부와 함께 주인공이 처한 상황과 선택할 수 있는 2-4개의 선택지를 제시해주세요.`;
    } else if (playerInput) {
      // For continuing the story based on player input
      prompt = `플레이어가 다음과 같은 선택을 했습니다: "${playerInput}"
      
이 선택에 따라 이야기를 계속 진행해주세요. 새로운 상황 설명과 함께 2-4개의 새로운 선택지를 제시해주세요.`;
    } else {
      // For generating the next segment without specific input
      prompt = '이야기를 계속 진행하고 새로운 선택지를 제시해주세요.';
    }
    
    // Add the current game state context if available
    if (gameState.currentScene) {
      prompt += `\n\n현재 장면: ${gameState.currentScene}`;
    }
    
    if (gameState.characters && gameState.characters.length > 0) {
      prompt += `\n\n등장 인물: ${gameState.characters.map(c => c.name).join(', ')}`;
    }
    
    // Add to conversation history
    this.addToConversationHistory('user', prompt);
    
    // Try with current API key, fall back to SUB key if needed
    try {
      // Call the Groq API
      const response = await this.client.chat.completions.create({
        messages: [
          { role: 'system', content: this.systemPrompt },
          ...this.conversationHistory
        ],
        model: this.model,
        max_tokens: this.maxTokens,
        temperature: this.temperature,
      });
      
      // Process the response
      const assistantResponse = response.choices[0].message.content;
      this.addToConversationHistory('assistant', assistantResponse);
      
      // Parse the response to extract narrative and choices
      const { narrative, choices } = this.parseResponse(assistantResponse);
      
      return {
        narrative,
        choices,
        rawResponse: assistantResponse,
      };
    } catch (error) {
      console.error(`Error generating story segment with ${this.currentApiKey.toUpperCase()} API key:`, error);
      
      // Try with SUB key if we're currently using MAIN
      if (this.switchToSubKey()) {
        console.log('Retrying with SUB API key');
        try {
          // Retry with the SUB key
          const response = await this.client.chat.completions.create({
            messages: [
              { role: 'system', content: this.systemPrompt },
              ...this.conversationHistory
            ],
            model: this.model,
            max_tokens: this.maxTokens,
            temperature: this.temperature,
          });
          
          // Process the response
          const assistantResponse = response.choices[0].message.content;
          this.addToConversationHistory('assistant', assistantResponse);
          
          // Parse the response to extract narrative and choices
          const { narrative, choices } = this.parseResponse(assistantResponse);
          
          return {
            narrative,
            choices,
            rawResponse: assistantResponse,
          };
        } catch (subError) {
          console.error('Error generating story segment with SUB API key:', subError);
          throw subError; // No more fallbacks available
        }
      } else {
        // No fallback available or already using SUB key
        throw error;
      }
    }
  }
  
  /**
   * Parse the LLM response to extract narrative and choices
   * @param {string} response - The raw LLM response
   * @returns {object} - Object containing narrative and choices
   */
  parseResponse(response) {
    // Default values
    let narrative = response;
    let choices = [];
    
    // Try to extract choices using pattern matching
    // Look for numbered or bulleted lists at the end of the response
    const choicePatterns = [
      /선택지(?:\s*|\s*:\s*|\s*\n\s*)(?:\d+\.\s*(.*?)(?:\n|$))+/gs, // Korean numbered list with "선택지" header
      /(?:\n\s*\d+\.\s*(.*?)(?:\n|$))+$/gs, // Numbered list at the end
      /(?:\n\s*-\s*(.*?)(?:\n|$))+$/gs, // Bulleted list with dashes at the end
      /(?:\n\s*•\s*(.*?)(?:\n|$))+$/gs, // Bulleted list with bullets at the end
    ];
    
    // Try each pattern until we find choices
    for (const pattern of choicePatterns) {
      const match = response.match(pattern);
      if (match) {
        // Extract the choices section
        const choicesSection = match[0];
        
        // Remove the choices section from the narrative
        narrative = response.replace(choicesSection, '').trim();
        
        // Extract individual choices
        const choiceMatches = choicesSection.match(/(?:\d+\.|-|•)\s*(.*?)(?:\n|$)/g);
        if (choiceMatches) {
          choices = choiceMatches.map((choice, index) => {
            // Remove the number/bullet and trim
            const text = choice.replace(/(?:\d+\.|-|•)\s*/, '').trim();
            return {
              id: `choice_${index}`,
              text,
            };
          });
        }
        
        break;
      }
    }
    
    // If no choices were found, try to generate some based on the narrative
    if (choices.length === 0) {
      console.warn('No choices found in response, generating default choices');
      choices = [
        { id: 'choice_continue', text: '계속 진행하기...' },
        { id: 'choice_think', text: '잠시 생각해보기...' },
      ];
    }
    
    return { narrative, choices };
  }
}

export default GroqService;