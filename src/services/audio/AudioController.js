import audioManager from './audioManager';

/**
 * AudioController - Text-only version
 * All audio functionality has been removed
 */
class AudioController {
  constructor() {
    this.audioManager = audioManager;
    this.initialized = true;
    this.currentMood = 'neutral';
    
    console.log('AudioController is disabled - game is now text-only mode');
  }
  
  /**
   * Initialize the audio controller - no-op implementation
   */
  async initialize() {
    return true;
  }
  
  /**
   * Process LLM-generated audio description - no-op implementation
   * @param {object} audioDescription - The audio description from LLM
   * @param {string} sceneText - The scene text for context
   */
  async processAudioDescription(audioDescription, sceneText) {
    return;
  }
  
  /**
   * Extract mood from text - simplified implementation that still works for text-only mode
   * @param {string} text - The text to analyze
   * @returns {string} - The extracted mood
   */
  extractMoodFromText(text) {
    // List of mood keywords to look for
    const moodKeywords = {
      '긴장감': ['긴장', '불안', '초조', '위험', '공포', '두려움', '무서움', '놀람'],
      '신비로움': ['신비', '미스터리', '수수께끼', '의문', '이상한', '기묘한', '알 수 없는'],
      '우울함': ['우울', '슬픔', '절망', '어둠', '비통', '침울', '쓸쓸함', '외로움'],
      '평온함': ['평온', '고요', '조용', '평화', '안정', '차분', '편안함'],
      '흥분': ['흥분', '열정', '격렬', '격정', '격앙', '흥미', '놀라움', '기쁨'],
    };
    
    // Count occurrences of mood keywords
    const moodCounts = {};
    for (const [mood, keywords] of Object.entries(moodKeywords)) {
      moodCounts[mood] = 0;
      for (const keyword of keywords) {
        const regex = new RegExp(keyword, 'g');
        const matches = text.match(regex);
        if (matches) {
          moodCounts[mood] += matches.length;
        }
      }
    }
    
    // Find the mood with the highest count
    let dominantMood = 'neutral'; // Default mood
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
   * Apply audio effects based on mood - no-op implementation
   * @param {string} mood - The mood to apply
   */
  applyMoodEffects(mood) {
    return;
  }
  
  /**
   * Play background music based on mood - no-op implementation
   * @param {string} mood - The current mood
   */
  async playMoodBasedBgm(mood) {
    return;
  }
  
  /**
   * Generate ambient sounds based on scene description - no-op implementation
   * @param {string} sceneText - The scene text
   */
  async generateSceneAmbience(sceneText) {
    return { stop: () => {} };
  }
  
  /**
   * Play sound effects based on scene keywords - no-op implementation
   * @param {string} sceneText - The scene text
   */
  playSoundEffectsFromScene(sceneText) {
    return;
  }
  
  /**
   * Play a specific sound effect - no-op implementation
   * @param {string} sfxName - The name of the sound effect
   */
  playSoundEffect(sfxName) {
    return;
  }
  
  /**
   * Set master volume - no-op implementation
   * @param {number} volume - Volume in decibels (typically -60 to 0)
   */
  setMasterVolume(volume) {
    return;
  }
  
  /**
   * Set BGM volume - no-op implementation
   * @param {number} volume - Volume in decibels (typically -60 to 0)
   */
  setBgmVolume(volume) {
    return;
  }
  
  /**
   * Set SFX volume - no-op implementation
   * @param {number} volume - Volume in decibels (typically -60 to 0)
   */
  setSfxVolume(volume) {
    return;
  }
  
  /**
   * Stop all audio - no-op implementation
   */
  stopAll() {
    return;
  }
}

// Create and export a singleton instance
const audioController = new AudioController();
export default audioController;