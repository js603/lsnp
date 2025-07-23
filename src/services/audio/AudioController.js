import audioManager from './audioManager';

/**
 * AudioController
 * Integrates the AudioManager with the StoryManager for LLM-directed audio
 * Interprets LLM audio descriptions and translates them to audio parameters
 * 
 * NOTE: Temporarily disabled as sound generation/usage is incomplete
 */
class AudioController {
  constructor() {
    this.audioManager = audioManager;
    this.currentAmbientSound = null;
    this.currentMood = 'neutral';
    this.initialized = false;
    
    console.log('AudioController is disabled - sound generation/usage is incomplete');
    
    // Map of mood keywords to audio parameters
    this.moodAudioMap = {
      '긴장감': {
        filter: { frequency: 800, type: 'lowpass' },
        reverb: { wet: 0.6, decay: 3 },
        intensity: 0.8,
        bgmOptions: { volume: -15 }
      },
      '신비로움': {
        filter: { frequency: 2000, type: 'bandpass' },
        reverb: { wet: 0.4, decay: 4 },
        intensity: 0.5,
        bgmOptions: { volume: -12 }
      },
      '우울함': {
        filter: { frequency: 1200, type: 'lowpass' },
        reverb: { wet: 0.3, decay: 5 },
        intensity: 0.6,
        bgmOptions: { volume: -18 }
      },
      '평온함': {
        filter: { frequency: 5000, type: 'lowpass' },
        reverb: { wet: 0.2, decay: 2 },
        intensity: 0.2,
        bgmOptions: { volume: -10 }
      },
      '흥분': {
        filter: { frequency: 3000, type: 'highpass' },
        reverb: { wet: 0.3, decay: 1.5 },
        intensity: 0.7,
        bgmOptions: { volume: -8 }
      },
      'neutral': {
        filter: { frequency: 20000, type: 'lowpass' },
        reverb: { wet: 0.2, decay: 2 },
        intensity: 0.3,
        bgmOptions: { volume: -10 }
      }
    };
    
    // Map of scene keywords to sound effects
    this.sceneToSoundMap = {
      '비': 'rain',
      '천둥': 'thunder',
      '바람': 'wind',
      '문': 'door',
      '발걸음': 'footsteps',
      '비명': 'scream',
      '웃음': 'laugh',
      '전화': 'phone',
      '시계': 'clock',
      '유리': 'glass',
      '물': 'water'
    };
    
    // Base paths for audio files
    this.audioPaths = {
      bgm: 'assets/audio/bgm/',
      sfx: 'assets/audio/sfx/',
    };
    
    // Map of moods to background music
    this.moodToBgmMap = {
      '긴장감': 'tension.mp3',
      '신비로움': 'mystery.mp3',
      '우울함': 'melancholy.mp3',
      '평온함': 'calm.mp3',
      '흥분': 'excitement.mp3',
      'neutral': 'neutral.mp3'
    };
  }
  
  /**
   * Initialize the audio controller
   */
  async initialize() {
    // Stub implementation - functionality is disabled
    if (this.initialized) return;
    
    this.initialized = true;
    console.log('Audio controller initialization skipped - sound generation/usage is disabled');
  }
  
  /**
   * Process LLM-generated audio description
   * @param {object} audioDescription - The audio description from LLM
   * @param {string} sceneText - The scene text for context
   */
  async processAudioDescription(audioDescription, sceneText) {
    // Stub implementation - functionality is disabled
    if (!this.initialized) {
      await this.initialize();
    }
    
    console.log('Audio description processing skipped - sound generation/usage is disabled');
  }
  
  /**
   * Extract mood from text using keyword analysis
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
   * Apply audio effects based on mood
   * @param {string} mood - The mood to apply
   */
  applyMoodEffects(mood) {
    const moodSettings = this.moodAudioMap[mood] || this.moodAudioMap.neutral;
    
    // Apply atmospheric effect intensity
    this.audioManager.applyAtmosphericEffect(moodSettings.intensity);
    
    // Set volumes based on mood
    if (moodSettings.bgmOptions && moodSettings.bgmOptions.volume !== undefined) {
      this.audioManager.setBgmVolume(moodSettings.bgmOptions.volume);
    }
  }
  
  /**
   * Play background music based on mood
   * @param {string} mood - The current mood
   */
  async playMoodBasedBgm(mood) {
    const bgmFile = this.moodToBgmMap[mood] || this.moodToBgmMap.neutral;
    const bgmPath = `${this.audioPaths.bgm}${bgmFile}`;
    
    // Only change BGM if mood has changed significantly
    if (this.audioManager.currentBgm !== bgmPath) {
      const moodSettings = this.moodAudioMap[mood] || this.moodAudioMap.neutral;
      await this.audioManager.playBgm(bgmPath, moodSettings.bgmOptions);
    }
  }
  
  /**
   * Generate ambient sounds based on scene description
   * @param {string} sceneText - The scene text
   */
  async generateSceneAmbience(sceneText) {
    // Stop current ambient sound if playing
    if (this.currentAmbientSound) {
      this.currentAmbientSound.stop();
      this.currentAmbientSound = null;
    }
    
    // Generate new ambient sound
    this.currentAmbientSound = await this.audioManager.generateAmbientSound(sceneText);
  }
  
  /**
   * Play sound effects based on scene keywords
   * @param {string} sceneText - The scene text
   */
  playSoundEffectsFromScene(sceneText) {
    // Check for keywords in the scene text
    for (const [keyword, sfxName] of Object.entries(this.sceneToSoundMap)) {
      if (sceneText.includes(keyword)) {
        const sfxPath = `${this.audioPaths.sfx}${sfxName}.mp3`;
        this.audioManager.playSfx(sfxName, sfxPath);
      }
    }
  }
  
  /**
   * Play a specific sound effect
   * @param {string} sfxName - The name of the sound effect
   */
  playSoundEffect(sfxName) {
    const sfxPath = `${this.audioPaths.sfx}${sfxName}.mp3`;
    this.audioManager.playSfx(sfxName, sfxPath);
  }
  
  /**
   * Set master volume
   * @param {number} volume - Volume in decibels (typically -60 to 0)
   */
  setMasterVolume(volume) {
    this.audioManager.setMasterVolume(volume);
  }
  
  /**
   * Set BGM volume
   * @param {number} volume - Volume in decibels (typically -60 to 0)
   */
  setBgmVolume(volume) {
    this.audioManager.setBgmVolume(volume);
  }
  
  /**
   * Set SFX volume
   * @param {number} volume - Volume in decibels (typically -60 to 0)
   */
  setSfxVolume(volume) {
    this.audioManager.setSfxVolume(volume);
  }
  
  /**
   * Stop all audio
   */
  stopAll() {
    // Stop background music
    this.audioManager.stopBgm();
    
    // Stop ambient sound
    if (this.currentAmbientSound) {
      this.currentAmbientSound.stop();
      this.currentAmbientSound = null;
    }
  }
}

// Create and export a singleton instance
const audioController = new AudioController();
export default audioController;