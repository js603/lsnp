import GroqService from './groqService';
import GeminiService from './geminiService';

/**
 * StoryManager
 * Coordinates between LLM services and game components
 * Manages story generation, game state, and player choices
 */
class StoryManager {
  constructor() {
    // Initialize LLM services
    this.groqService = new GroqService();
    this.geminiService = new GeminiService();
    
    // Game state
    this.gameState = {
      isNewGame: true,
      currentScene: null,
      setting: null,
      time: null,
      protagonist: null,
      characters: [],
      history: [],
      completedBranches: [],
      unlockedChoices: [],
      gameCompleted: false,
    };
    
    // Callback functions
    this.callbacks = {
      onStoryUpdate: null,
      onChoicesUpdate: null,
      onVisualUpdate: null,
      onAudioUpdate: null,
      onError: null,
    };
    
    // LLM selection strategy
    this.primaryLLM = 'groq'; // 'groq' or 'gemini'
    this.useFallback = true;
  }
  
  /**
   * Set callback functions
   * @param {object} callbacks - Object containing callback functions
   */
  setCallbacks(callbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }
  
  /**
   * Set the primary LLM to use
   * @param {string} llm - The LLM to use ('groq' or 'gemini')
   */
  setPrimaryLLM(llm) {
    if (llm === 'groq' || llm === 'gemini') {
      this.primaryLLM = llm;
    } else {
      console.error(`Invalid LLM: ${llm}. Must be 'groq' or 'gemini'.`);
    }
  }
  
  /**
   * Set whether to use fallback LLM if primary fails
   * @param {boolean} useFallback - Whether to use fallback
   */
  setUseFallback(useFallback) {
    this.useFallback = useFallback;
  }
  
  /**
   * Initialize a new game with custom settings
   * @param {object} settings - Game settings
   */
  initializeGame(settings = {}) {
    // Reset game state
    this.gameState = {
      isNewGame: true,
      currentScene: null,
      setting: settings.setting || '고립된 산장',
      time: settings.time || '폭설이 내리는 겨울 밤',
      protagonist: settings.protagonist || '주인공은 우연히 이 장소에 오게 된 평범한 사람입니다.',
      characters: settings.characters || [],
      history: [],
      completedBranches: [],
      unlockedChoices: [],
      gameCompleted: false,
    };
    
    // Reset LLM conversation history
    this.groqService.clearConversationHistory();
    this.geminiService.clearConversationHistory();
    
    // Generate initial story segment
    return this.generateNextStorySegment();
  }
  
  /**
   * Generate the next story segment
   * @param {string} playerChoice - The player's choice text (optional)
   * @returns {Promise<object>} - The generated story segment
   */
  async generateNextStorySegment(playerChoice = null) {
    try {
      // Add player choice to history if provided
      if (playerChoice) {
        this.gameState.history.push({
          type: 'choice',
          content: playerChoice,
          timestamp: new Date().toISOString(),
        });
      }
      
      // Generate story segment using primary LLM
      let storySegment;
      try {
        if (this.primaryLLM === 'groq') {
          storySegment = await this.groqService.generateStorySegment(this.gameState, playerChoice);
        } else {
          storySegment = await this.geminiService.generateStorySegment(this.gameState, playerChoice);
        }
      } catch (error) {
        // If primary LLM fails and fallback is enabled, try the other LLM
        if (this.useFallback) {
          console.warn(`Primary LLM (${this.primaryLLM}) failed, falling back to secondary LLM.`);
          if (this.primaryLLM === 'groq') {
            storySegment = await this.geminiService.generateStorySegment(this.gameState, playerChoice);
          } else {
            storySegment = await this.groqService.generateStorySegment(this.gameState, playerChoice);
          }
        } else {
          throw error;
        }
      }
      
      // Update game state
      this.gameState.isNewGame = false;
      this.gameState.currentScene = storySegment.narrative;
      
      // Add story segment to history
      this.gameState.history.push({
        type: 'narrative',
        content: storySegment.narrative,
        timestamp: new Date().toISOString(),
      });
      
      // Check for unlocked choices
      const enhancedChoices = this.enhanceChoices(storySegment.choices);
      
      // Notify callbacks
      if (this.callbacks.onStoryUpdate) {
        this.callbacks.onStoryUpdate(storySegment.narrative);
      }
      
      if (this.callbacks.onChoicesUpdate) {
        this.callbacks.onChoicesUpdate(enhancedChoices);
      }
      
      // Generate visual and audio descriptions
      this.generateVisualDescription(storySegment.narrative);
      this.generateAudioDescription(storySegment.narrative);
      
      return {
        narrative: storySegment.narrative,
        choices: enhancedChoices,
      };
    } catch (error) {
      console.error('Error generating story segment:', error);
      if (this.callbacks.onError) {
        this.callbacks.onError(error);
      }
      throw error;
    }
  }
  
  /**
   * Enhance choices with additional metadata
   * @param {Array} choices - The raw choices from LLM
   * @returns {Array} - Enhanced choices with metadata
   */
  enhanceChoices(choices) {
    return choices.map(choice => {
      // Check if this choice was previously unlocked
      const isUnlocked = this.gameState.unlockedChoices.some(
        unlocked => unlocked.text === choice.text
      );
      
      // Check if this is a new choice that wasn't available before
      const isNew = isUnlocked && !this.gameState.history.some(
        item => item.type === 'choice' && item.content === choice.text
      );
      
      return {
        ...choice,
        isUnlocked,
        isNew,
      };
    });
  }
  
  /**
   * Generate visual description for the current scene
   * @param {string} sceneDescription - The current scene description
   */
  async generateVisualDescription(sceneDescription) {
    try {
      // Use Gemini for visual descriptions as it's better suited for this task
      const visualDescription = await this.geminiService.generateVisualDescription(sceneDescription);
      
      if (this.callbacks.onVisualUpdate) {
        this.callbacks.onVisualUpdate(visualDescription);
      }
      
      return visualDescription;
    } catch (error) {
      console.error('Error generating visual description:', error);
      if (this.callbacks.onError) {
        this.callbacks.onError(error);
      }
    }
  }
  
  /**
   * Generate audio description for the current scene
   * @param {string} sceneDescription - The current scene description
   */
  async generateAudioDescription(sceneDescription) {
    try {
      // Extract mood from scene description
      const mood = this.extractMoodFromScene(sceneDescription);
      
      // Use Gemini for audio descriptions
      const audioDescription = await this.geminiService.generateAudioDescription(sceneDescription, mood);
      
      if (this.callbacks.onAudioUpdate) {
        this.callbacks.onAudioUpdate(audioDescription);
      }
      
      return audioDescription;
    } catch (error) {
      console.error('Error generating audio description:', error);
      if (this.callbacks.onError) {
        this.callbacks.onError(error);
      }
    }
  }
  
  /**
   * Extract mood from scene description
   * @param {string} sceneDescription - The scene description
   * @returns {string} - The extracted mood
   */
  extractMoodFromScene(sceneDescription) {
    // List of mood keywords to look for
    const moodKeywords = {
      '긴장감': ['긴장', '불안', '초조', '위험', '공포', '두려움'],
      '신비로움': ['신비', '미스터리', '수수께끼', '의문', '이상한'],
      '우울함': ['우울', '슬픔', '절망', '어둠', '비통', '침울'],
      '평온함': ['평온', '고요', '조용', '평화', '안정'],
      '흥분': ['흥분', '열정', '격렬', '격정', '격앙'],
    };
    
    // Count occurrences of mood keywords
    const moodCounts = {};
    for (const [mood, keywords] of Object.entries(moodKeywords)) {
      moodCounts[mood] = 0;
      for (const keyword of keywords) {
        const regex = new RegExp(keyword, 'g');
        const matches = sceneDescription.match(regex);
        if (matches) {
          moodCounts[mood] += matches.length;
        }
      }
    }
    
    // Find the mood with the highest count
    let dominantMood = '긴장감'; // Default mood
    let highestCount = 0;
    
    for (const [mood, count] of Object.entries(moodCounts)) {
      if (count > highestCount) {
        highestCount = count;
        dominantMood = mood;
      }
    }
    
    return dominantMood;
  }
  
  /**
   * Handle player choice
   * @param {object} choice - The choice object selected by the player
   * @returns {Promise<object>} - The next story segment
   */
  async handlePlayerChoice(choice) {
    return this.generateNextStorySegment(choice.text);
  }
  
  /**
   * Handle custom player input
   * @param {string} input - The custom text input from the player
   * @returns {Promise<object>} - The next story segment
   */
  async handleCustomInput(input) {
    return this.generateNextStorySegment(input);
  }
  
  /**
   * Get the current game state
   * @returns {object} - The current game state
   */
  getGameState() {
    return { ...this.gameState };
  }
  
  /**
   * Save the current game state
   * @returns {object} - The saved game state
   */
  saveGameState() {
    const savedState = {
      ...this.gameState,
      timestamp: new Date().toISOString(),
    };
    
    return savedState;
  }
  
  /**
   * Load a saved game state
   * @param {object} savedState - The saved game state to load
   */
  loadGameState(savedState) {
    if (!savedState) {
      console.error('Invalid saved state');
      return false;
    }
    
    this.gameState = { ...savedState };
    
    // Reset LLM conversation history
    this.groqService.clearConversationHistory();
    this.geminiService.clearConversationHistory();
    
    // Rebuild conversation history from game history
    const narratives = this.gameState.history.filter(item => item.type === 'narrative');
    const choices = this.gameState.history.filter(item => item.type === 'choice');
    
    // Rebuild conversation history for both LLMs
    for (let i = 0; i < narratives.length; i++) {
      const narrative = narratives[i];
      
      // Add user message (choice) if available
      if (i > 0 && choices[i - 1]) {
        this.groqService.addToConversationHistory('user', choices[i - 1].content);
        this.geminiService.addToConversationHistory('user', { parts: [{ text: choices[i - 1].content }] });
      }
      
      // Add assistant message (narrative)
      this.groqService.addToConversationHistory('assistant', narrative.content);
      this.geminiService.addToConversationHistory('model', { parts: [{ text: narrative.content }] });
    }
    
    // Notify callbacks
    if (this.callbacks.onStoryUpdate) {
      this.callbacks.onStoryUpdate(this.gameState.currentScene);
    }
    
    return true;
  }
}

export default StoryManager;