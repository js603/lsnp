import * as Tone from 'tone';

// Audio Manager for handling all game audio
// NOTE: Temporarily disabled as sound generation/usage is incomplete
class AudioManager {
  constructor() {
    // Stub implementation - all functionality is disabled
    this.initialized = false;
    this.bgmPlayer = null;
    this.sfxPlayers = {};
    this.currentBgm = null;
    this.volume = {
      master: -10, // in decibels
      bgm: 0,      // in decibels, relative to master
      sfx: 0       // in decibels, relative to master
    };
    
    console.log('AudioManager is disabled - sound generation/usage is incomplete');
    
    // Effects
    this.reverb = null;
    this.filter = null;
    
    // Flag to track if we've attempted initialization
    this.initializationAttempted = false;
  }

  // Initialize the audio system - should be called after user interaction
  async initializeAfterUserInteraction() {
    // Stub implementation - functionality is disabled
    if (this.initialized) return true;
    
    this.initialized = true;
    this.initializationAttempted = true;
    console.log('Audio system initialization skipped - sound generation/usage is disabled');
    return true;
  }
  
  // Legacy initialize method - now checks if initialization has been attempted
  async initialize() {
    // Stub implementation - functionality is disabled
    if (this.initialized) return true;
    
    this.initialized = true;
    this.initializationAttempted = true;
    console.log('Audio system initialization skipped - sound generation/usage is disabled');
    return true;
  }

  // Load and play background music
  async playBgm(url, options = {}) {
    // Stub implementation - functionality is disabled
    console.log('BGM playback skipped - sound generation/usage is disabled');
    return;
  }

  // Stop background music
  stopBgm(fadeOut = 2) {
    // Stub implementation - functionality is disabled
    console.log('BGM stop skipped - sound generation/usage is disabled');
    return;
  }

  // Load and play a sound effect
  async playSfx(name, url, options = {}) {
    // Stub implementation - functionality is disabled
    console.log(`SFX playback skipped for ${name} - sound generation/usage is disabled`);
    return;
  }

  // Stop a specific sound effect
  stopSfx(name) {
    // Stub implementation - functionality is disabled
    console.log(`SFX stop skipped for ${name} - sound generation/usage is disabled`);
    return;
  }

  // Set master volume
  setMasterVolume(value) {
    this.volume.master = value;
    Tone.Destination.volume.value = value;
  }

  // Set BGM volume
  setBgmVolume(value) {
    this.volume.bgm = value;
    if (this.bgmPlayer) {
      this.bgmPlayer.volume.value = value;
    }
  }

  // Set SFX volume
  setSfxVolume(value) {
    this.volume.sfx = value;
    // Update all SFX players
    Object.values(this.sfxPlayers).forEach(player => {
      player.volume.value = value;
    });
  }

  // Apply atmospheric effect (e.g., for tension)
  applyAtmosphericEffect(intensity = 0.5) {
    if (!this.initialized) {
      console.warn('Cannot apply atmospheric effect: Audio system not initialized');
      return;
    }
    
    // Adjust filter frequency based on intensity
    const minFreq = 500;
    const maxFreq = 20000;
    const frequency = minFreq + (maxFreq - minFreq) * (1 - intensity);
    
    // Adjust reverb wet level based on intensity
    const minWet = 0.1;
    const maxWet = 0.7;
    const wet = minWet + (maxWet - minWet) * intensity;
    
    // Apply effects
    this.filter.frequency.rampTo(frequency, 1);
    this.reverb.wet.rampTo(wet, 1);
  }

  // Generate ambient sound based on scene description
  async generateAmbientSound(description) {
    // Check if initialized and return early if not
    if (!this.initialized) {
      const initialized = await this.initialize();
      if (!initialized) {
        console.warn('Cannot generate ambient sound: Audio system not initialized');
        return {
          stop: () => {} // Return a dummy stop function to prevent errors
        };
      }
    }
    
    // Create ambient sound based on description
    const synth = new Tone.PolySynth(Tone.FMSynth).connect(this.reverb);
    synth.volume.value = -20;
    
    // Parse description for ambient sound parameters
    const isRaining = description.toLowerCase().includes('rain');
    const isNight = description.toLowerCase().includes('night');
    const isCreepy = description.toLowerCase().includes('creepy') || 
                    description.toLowerCase().includes('scary') ||
                    description.toLowerCase().includes('eerie');
    
    // Set up ambient sound loop
    const loop = new Tone.Loop(time => {
      // Rain sound
      if (isRaining) {
        for (let i = 0; i < 3; i++) {
          const note = Tone.Frequency('C6').transpose(Math.random() * 12);
          synth.triggerAttackRelease(note, 0.05, time + i * 0.1, Math.random() * 0.1);
        }
      }
      
      // Night sound (crickets, etc.)
      if (isNight) {
        if (Math.random() > 0.7) {
          const note = Tone.Frequency('A6').transpose(Math.random() * 5);
          synth.triggerAttackRelease(note, 0.2, time, 0.05);
        }
      }
      
      // Creepy sound
      if (isCreepy) {
        if (Math.random() > 0.9) {
          const note = Tone.Frequency('G2').transpose(Math.random() * 7 - 12);
          synth.triggerAttackRelease(note, 2, time, 0.1);
        }
      }
    }, '8n').start(0);
    
    return {
      stop: () => {
        loop.stop();
        synth.dispose();
      }
    };
  }
}

// Create and export a singleton instance
const audioManager = new AudioManager();
export default audioManager;