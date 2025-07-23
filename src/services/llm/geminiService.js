import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Gemini API Service
 * Handles communication with the Google Gemini API as a secondary LLM
 * 
 * Features:
 * - Enhanced API key fallback mechanism: If the MAIN API key fails, the service automatically
 *   switches to the SUB API key. If the SUB key also fails, it switches to the THIRD API key.
 *   This triple-redundancy ensures maximum reliability and continuous operation.
 * - Cascading fallback: The service tries each API key in sequence (MAIN → SUB → THIRD)
 *   only when necessary, preserving API usage quotas.
 * - Detailed error handling: Comprehensive error logging with information about which API key
 *   failed and at what stage.
 * - Seamless transition: The fallback happens transparently to the calling code, ensuring
 *   uninterrupted game flow.
 */
class GeminiService {
  constructor(apiKey) {
    // Use a placeholder approach for API keys
    // Users need to provide their own API keys at runtime
    this.mainApiKey = apiKey || process.env.REACT_APP_GEMINI_API_MAIN_KEY;
    this.subApiKey = process.env.REACT_APP_GEMINI_API_SUB_KEY;
    this.thirdApiKey = process.env.REACT_APP_GEMINI_API_THIRD_KEY;
    
    // Check if we're in development mode and use environment variables if available
    if (process.env.NODE_ENV === 'development') {
      if (process.env.REACT_APP_GEMINI_API_MAIN_KEY && process.env.REACT_APP_GEMINI_API_MAIN_KEY !== 'YOUR_GEMINI_API_KEY') {
        this.mainApiKey = process.env.REACT_APP_GEMINI_API_MAIN_KEY;
      }
      if (process.env.REACT_APP_GEMINI_API_SUB_KEY && process.env.REACT_APP_GEMINI_API_SUB_KEY !== 'YOUR_GEMINI_API_SUB_KEY') {
        this.subApiKey = process.env.REACT_APP_GEMINI_API_SUB_KEY;
      }
      if (process.env.REACT_APP_GEMINI_API_THIRD_KEY && process.env.REACT_APP_GEMINI_API_THIRD_KEY !== 'YOUR_GEMINI_API_THIRD_KEY') {
        this.thirdApiKey = process.env.REACT_APP_GEMINI_API_THIRD_KEY;
      }
    }
    
    this.genAI = new GoogleGenerativeAI(this.mainApiKey);
    this.model = 'gemini-1.5-pro'; // Default model
    this.systemPrompt = this.getDefaultSystemPrompt();
    this.conversationHistory = [];
    this.temperature = 0.7;
    this.topK = 40;
    this.topP = 0.95;
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
   * Switch to the SUB API key
   * @returns {boolean} - True if successfully switched, false if already using SUB key or no SUB key available
   */
  switchToSubKey() {
    if (this.currentApiKey === 'sub' || this.currentApiKey === 'third') {
      console.warn(`Already using ${this.currentApiKey.toUpperCase()} API key, cannot switch to SUB`);
      return false;
    }
    
    if (!this.subApiKey) {
      console.warn('No SUB API key available for fallback');
      return false;
    }
    
    console.log('Switching from MAIN to SUB API key due to error');
    this.genAI = new GoogleGenerativeAI(this.subApiKey);
    this.currentApiKey = 'sub';
    return true;
  }

  /**
   * Switch to the THIRD API key
   * @returns {boolean} - True if successfully switched, false if already using THIRD key or no THIRD key available
   */
  switchToThirdKey() {
    if (this.currentApiKey === 'third') {
      console.warn('Already using THIRD API key, no further fallback available');
      return false;
    }
    
    if (!this.thirdApiKey) {
      console.warn('No THIRD API key available for fallback');
      return false;
    }
    
    console.log(`Switching from ${this.currentApiKey.toUpperCase()} to THIRD API key due to error`);
    this.genAI = new GoogleGenerativeAI(this.thirdApiKey);
    this.currentApiKey = 'third';
    return true;
  }

  /**
   * Initialize a new conversation with the model
   * @returns {object} - The conversation object
   */
  async initializeConversation() {
    let lastError = null;
    
    // Try with current API key
    try {
      const model = this.genAI.getGenerativeModel({ model: this.model });
      const chat = model.startChat({
        history: [
          {
            role: 'user',
            parts: [{ text: 'Please act as a storyteller for a sound novel mystery game.' }],
          },
          {
            role: 'model',
            parts: [{ text: 'I will act as the storyteller for the sound novel mystery game "비둘기밥의 밤" (Night of Pigeonweed). How would you like to begin the story?' }],
          },
        ],
        generationConfig: {
          temperature: this.temperature,
          topK: this.topK,
          topP: this.topP,
        },
      });
      
      return chat;
    } catch (error) {
      console.error(`Error initializing Gemini conversation with ${this.currentApiKey.toUpperCase()} API key:`, error);
      lastError = error;
      
      // Try with SUB key if we're currently using MAIN
      if (this.switchToSubKey()) {
        try {
          const model = this.genAI.getGenerativeModel({ model: this.model });
          const chat = model.startChat({
            history: [
              {
                role: 'user',
                parts: [{ text: 'Please act as a storyteller for a sound novel mystery game.' }],
              },
              {
                role: 'model',
                parts: [{ text: 'I will act as the storyteller for the sound novel mystery game "비둘기밥의 밤" (Night of Pigeonweed). How would you like to begin the story?' }],
              },
            ],
            generationConfig: {
              temperature: this.temperature,
              topK: this.topK,
              topP: this.topP,
            },
          });
          
          return chat;
        } catch (subError) {
          console.error('Error initializing Gemini conversation with SUB API key:', subError);
          lastError = subError;
          
          // Try with THIRD key if SUB key failed
          if (this.switchToThirdKey()) {
            try {
              const model = this.genAI.getGenerativeModel({ model: this.model });
              const chat = model.startChat({
                history: [
                  {
                    role: 'user',
                    parts: [{ text: 'Please act as a storyteller for a sound novel mystery game.' }],
                  },
                  {
                    role: 'model',
                    parts: [{ text: 'I will act as the storyteller for the sound novel mystery game "비둘기밥의 밤" (Night of Pigeonweed). How would you like to begin the story?' }],
                  },
                ],
                generationConfig: {
                  temperature: this.temperature,
                  topK: this.topK,
                  topP: this.topP,
                },
              });
              
              return chat;
            } catch (thirdError) {
              console.error('Error initializing Gemini conversation with THIRD API key:', thirdError);
              throw thirdError; // No more fallbacks available
            }
          }
        }
      }
      
      // If we get here, all fallbacks failed or weren't available
      throw lastError;
    }
  }

  /**
   * Generate a story segment based on the current state
   * @param {object} gameState - The current game state
   * @param {string} playerInput - The player's input or choice
   * @returns {Promise<object>} - The generated story segment with choices
   */
  async generateStorySegment(gameState, playerInput) {
    // Prepare the prompt based on game state and player input
    let prompt = '';
    
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
    
    let lastError = null;
    
    // Try with current API key
    try {
      // Initialize the model
      const model = this.genAI.getGenerativeModel({ model: this.model });
      
      // Create a chat session with the system prompt
      const chat = model.startChat({
        history: [
          {
            role: 'user',
            parts: [{ text: this.systemPrompt }],
          },
          {
            role: 'model',
            parts: [{ text: 'I understand my role as the storyteller for "비둘기밥의 밤". I will create an engaging mystery narrative with appropriate choices in Korean language.' }],
          },
          ...this.conversationHistory,
        ],
        generationConfig: {
          temperature: this.temperature,
          topK: this.topK,
          topP: this.topP,
        },
      });
      
      // Send the prompt to the model
      const result = await chat.sendMessage(prompt);
      const response = result.response;
      const responseText = response.text();
      
      // Add to conversation history
      this.conversationHistory.push(
        { role: 'user', parts: [{ text: prompt }] },
        { role: 'model', parts: [{ text: responseText }] }
      );
      
      // Parse the response to extract narrative and choices
      const { narrative, choices } = this.parseResponse(responseText);
      
      return {
        narrative,
        choices,
        rawResponse: responseText,
      };
    } catch (error) {
      console.error(`Error generating story segment with ${this.currentApiKey.toUpperCase()} API key:`, error);
      lastError = error;
      
      // Try with SUB key if we're currently using MAIN
      if (this.switchToSubKey()) {
        try {
          // Initialize the model with SUB key
          const model = this.genAI.getGenerativeModel({ model: this.model });
          
          // Create a chat session with the system prompt
          const chat = model.startChat({
            history: [
              {
                role: 'user',
                parts: [{ text: this.systemPrompt }],
              },
              {
                role: 'model',
                parts: [{ text: 'I understand my role as the storyteller for "비둘기밥의 밤". I will create an engaging mystery narrative with appropriate choices in Korean language.' }],
              },
              ...this.conversationHistory,
            ],
            generationConfig: {
              temperature: this.temperature,
              topK: this.topK,
              topP: this.topP,
            },
          });
          
          // Send the prompt to the model
          const result = await chat.sendMessage(prompt);
          const response = result.response;
          const responseText = response.text();
          
          // Add to conversation history
          this.conversationHistory.push(
            { role: 'user', parts: [{ text: prompt }] },
            { role: 'model', parts: [{ text: responseText }] }
          );
          
          // Parse the response to extract narrative and choices
          const { narrative, choices } = this.parseResponse(responseText);
          
          return {
            narrative,
            choices,
            rawResponse: responseText,
          };
        } catch (subError) {
          console.error('Error generating story segment with SUB API key:', subError);
          lastError = subError;
          
          // Try with THIRD key if SUB key failed
          if (this.switchToThirdKey()) {
            try {
              // Initialize the model with THIRD key
              const model = this.genAI.getGenerativeModel({ model: this.model });
              
              // Create a chat session with the system prompt
              const chat = model.startChat({
                history: [
                  {
                    role: 'user',
                    parts: [{ text: this.systemPrompt }],
                  },
                  {
                    role: 'model',
                    parts: [{ text: 'I understand my role as the storyteller for "비둘기밥의 밤". I will create an engaging mystery narrative with appropriate choices in Korean language.' }],
                  },
                  ...this.conversationHistory,
                ],
                generationConfig: {
                  temperature: this.temperature,
                  topK: this.topK,
                  topP: this.topP,
                },
              });
              
              // Send the prompt to the model
              const result = await chat.sendMessage(prompt);
              const response = result.response;
              const responseText = response.text();
              
              // Add to conversation history
              this.conversationHistory.push(
                { role: 'user', parts: [{ text: prompt }] },
                { role: 'model', parts: [{ text: responseText }] }
              );
              
              // Parse the response to extract narrative and choices
              const { narrative, choices } = this.parseResponse(responseText);
              
              return {
                narrative,
                choices,
                rawResponse: responseText,
              };
            } catch (thirdError) {
              console.error('Error generating story segment with THIRD API key:', thirdError);
              throw thirdError; // No more fallbacks available
            }
          }
        }
      }
      
      // If we get here, all fallbacks failed or weren't available
      throw lastError;
    }
  }
  
  /**
   * Generate visual description for a scene
   * @param {string} sceneDescription - Description of the current scene
   * @returns {Promise<string>} - Detailed visual description for rendering
   * 
   * NOTE: Temporarily disabled as image generation/usage is incomplete
   */
  async generateVisualDescription(sceneDescription) {
    // Stub implementation - functionality is disabled
    console.log('Visual description generation skipped - image generation/usage is disabled');
    return "Visual description generation is disabled";
  }
  
  /**
   * Generate audio description for a scene
   * @param {string} sceneDescription - Description of the current scene
   * @param {string} mood - The mood of the scene
   * @returns {Promise<object>} - Audio parameters for Web Audio API
   * 
   * NOTE: Temporarily disabled as sound generation/usage is incomplete
   */
  async generateAudioDescription(sceneDescription, mood) {
    // Stub implementation - functionality is disabled
    console.log('Audio description generation skipped - sound generation/usage is disabled');
    return {
      rawDescription: "Audio description generation is disabled",
      params: { mood: mood || 'neutral' }
    };
  }
  
  /**
   * Parse audio description text into parameters for Web Audio API
   * @param {string} description - The audio description text
   * @returns {object} - Parsed audio parameters
   */
  parseAudioDescription(description) {
    // Default parameters
    const params = {
      backgroundMusic: {
        type: 'ambient',
        tempo: 60,
        instruments: ['piano'],
        volume: 5,
      },
      soundEffects: [],
      volume: {
        master: 7,
        music: 5,
        effects: 7,
      },
      frequency: {
        low: 100,
        high: 5000,
      },
      effects: [],
    };
    
    // Extract background music info
    const bgMusicMatch = description.match(/배경음악:([^\n]+)/);
    if (bgMusicMatch) {
      const bgMusicDesc = bgMusicMatch[1].trim();
      
      // Extract tempo
      const tempoMatch = bgMusicDesc.match(/(\d+)\s*bpm/i);
      if (tempoMatch) {
        params.backgroundMusic.tempo = parseInt(tempoMatch[1]);
      }
      
      // Extract instruments
      const instrumentMatches = bgMusicDesc.match(/피아노|바이올린|첼로|기타|드럼|신디사이저|오르간/g);
      if (instrumentMatches) {
        params.backgroundMusic.instruments = instrumentMatches;
      }
    }
    
    // Extract sound effects
    const sfxMatch = description.match(/효과음:([^\n]+)/);
    if (sfxMatch) {
      const sfxDesc = sfxMatch[1].trim();
      const sfxList = sfxDesc.split(',').map(sfx => sfx.trim());
      params.soundEffects = sfxList;
    }
    
    // Extract volume
    const volumeMatch = description.match(/음량:([^\n]+)/);
    if (volumeMatch) {
      const volumeDesc = volumeMatch[1].trim();
      const volumeValue = parseInt(volumeDesc.match(/\d+/));
      if (!isNaN(volumeValue)) {
        params.volume.master = volumeValue;
      }
    }
    
    return params;
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

export default GeminiService;