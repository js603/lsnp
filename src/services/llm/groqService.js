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
    // Use a placeholder approach for API keys
    // Users need to provide their own API keys at runtime
    this.mainApiKey = apiKey || process.env.REACT_APP_GROQ_API_MAIN_KEY;
    this.subApiKey = process.env.REACT_APP_GROQ_API_SUB_KEY;
    
    // Check if we're in development mode and use environment variables if available
    if (process.env.NODE_ENV === 'development') {
      if (process.env.REACT_APP_GROQ_API_MAIN_KEY && process.env.REACT_APP_GROQ_API_MAIN_KEY !== 'YOUR_GROQ_API_KEY') {
        this.mainApiKey = process.env.REACT_APP_GROQ_API_MAIN_KEY;
      }
      if (process.env.REACT_APP_GROQ_API_SUB_KEY && process.env.REACT_APP_GROQ_API_SUB_KEY !== 'YOUR_GROQ_API_SUB_KEY') {
        this.subApiKey = process.env.REACT_APP_GROQ_API_SUB_KEY;
      }
    }
    
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
    return `당신은 "비둘기밥의 밤" 이라는 사운드 노벨 미스터리 게임의 스토리 텔러입니다.
    
이것은 "카마이타치의 밤"와 비슷한 긴장된 분위기를 가진 미스터리 게임입니다. 설정은 신비한 사건이 발생하는 폐쇄되고 고립 된 환경입니다.

귀하의 역할은 다음과 같습니다.
1. 서스펜스와 미스터리를 만드는 매력적인 이야기 텍스트 생성
2. 주인공의 내부 사고를 나타내는 각 이야기 세그먼트 후 2-4 선택을 제공합니다.
3. 논리적이고 일관된 방식으로 이야기를 계속하여 플레이어 선택에 응답합니다.
4. 미스터리와 심리적 긴장의 분위기를 유지하십시오
5. 다른 결과로 이어지는 분기 경로를 만듭니다
6. 모든 스토리 요소가 이전 선택과 일치하는지 확인

이야기는 한국어로되어 있어야하며, 미스터리 소설에 적합한 문학적 스타일로 작성되어야합니다.

선택은 주인공의 생각이나 가능한 행동을 나타내는 1 인칭 관점에서 작성되어야합니다.

캐릭터를 깨뜨리거나 당신이 AI라는 것을 인정하지 마십시오. 게임의 스토리 텔러로만 응답하십시오.`;
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