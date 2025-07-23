// Audio Manager - Text-only version (all audio functionality removed)
class AudioManager {
  constructor() {
    // No-op implementation - all functionality is removed
    this.initialized = true;
    this.initializationAttempted = true;
    
    console.log('AudioManager is disabled - game is now text-only mode');
  }

  // Initialize the audio system - no-op implementation
  async initializeAfterUserInteraction() {
    return true;
  }
  
  // Legacy initialize method - no-op implementation
  async initialize() {
    return true;
  }

  // Load and play background music - no-op implementation
  async playBgm(url, options = {}) {
    return;
  }

  // Stop background music - no-op implementation
  stopBgm(fadeOut = 2) {
    return;
  }

  // Load and play a sound effect - no-op implementation
  async playSfx(name, url, options = {}) {
    return;
  }

  // Stop a specific sound effect - no-op implementation
  stopSfx(name) {
    return;
  }

  // Set master volume - no-op implementation
  setMasterVolume(value) {
    return;
  }

  // Set BGM volume - no-op implementation
  setBgmVolume(value) {
    return;
  }

  // Set SFX volume - no-op implementation
  setSfxVolume(value) {
    return;
  }

  // Apply atmospheric effect - no-op implementation
  applyAtmosphericEffect(intensity = 0.5) {
    return;
  }

  // Generate ambient sound - no-op implementation
  async generateAmbientSound(description) {
    return {
      stop: () => {} // Return a dummy stop function to prevent errors
    };
  }
}

// Create and export a singleton instance
const audioManager = new AudioManager();
export default audioManager;