import * as Tone from 'tone';

// Audio Manager for handling all game audio
class AudioManager {
  constructor() {
    this.initialized = false;
    this.bgmPlayer = null;
    this.sfxPlayers = {};
    this.currentBgm = null;
    this.volume = {
      master: -10, // in decibels
      bgm: 0,      // in decibels, relative to master
      sfx: 0       // in decibels, relative to master
    };
    
    // Effects
    this.reverb = null;
    this.filter = null;
    
    // Flag to track if we've attempted initialization
    this.initializationAttempted = false;
  }

  // Initialize the audio system - should be called after user interaction
  async initializeAfterUserInteraction() {
    if (this.initialized) return true;
    
    try {
      // Start audio context (must be triggered by user interaction)
      await Tone.start();
      
      // Set up master volume
      Tone.Destination.volume.value = this.volume.master;
      
      // Create effects
      this.reverb = new Tone.Reverb({
        decay: 2.5,
        wet: 0.2
      }).toDestination();
      
      this.filter = new Tone.Filter({
        type: 'lowpass',
        frequency: 20000,
        Q: 1
      }).connect(this.reverb);
      
      // Create BGM player
      this.bgmPlayer = new Tone.Player({
        url: '',
        loop: true,
        volume: this.volume.bgm,
        fadeIn: 1,
        fadeOut: 1
      }).connect(this.filter);
      
      this.initialized = true;
      this.initializationAttempted = true;
      console.log('Audio system initialized successfully after user interaction');
      return true;
    } catch (error) {
      this.initializationAttempted = true;
      console.error('Failed to initialize audio system:', error);
      return false;
    }
  }
  
  // Legacy initialize method - now checks if initialization has been attempted
  async initialize() {
    if (this.initialized) return true;
    
    // If we've already attempted initialization, don't try again
    // This prevents repeated errors in the console
    if (this.initializationAttempted) {
      console.warn('Audio initialization was previously attempted but failed. Call initializeAfterUserInteraction() after a user gesture.');
      return false;
    }
    
    console.warn('Audio initialization should happen after user interaction. Call initializeAfterUserInteraction() after a user gesture.');
    return false;
  }

  // Load and play background music
  async playBgm(url, options = {}) {
    // Check if initialized and return early if not
    if (!this.initialized) {
      const initialized = await this.initialize();
      if (!initialized) {
        console.warn('Cannot play background music: Audio system not initialized');
        return;
      }
    }
    
    const { 
      fadeIn = 2, 
      fadeOut = 2,
      volume = this.volume.bgm,
      loop = true
    } = options;
    
    try {
      // If there's already music playing, fade it out
      if (this.bgmPlayer.state === 'started') {
        this.bgmPlayer.volume.rampTo(-60, fadeOut);
        
        // Wait for fade out
        await new Promise(resolve => setTimeout(resolve, fadeOut * 1000));
        this.bgmPlayer.stop();
      }
      
      // Set up new music
      this.bgmPlayer.volume.value = -60; // Start silent
      this.bgmPlayer.loop = loop;
      this.bgmPlayer.load(url);
      
      // Wait for buffer to load
      await new Promise(resolve => {
        this.bgmPlayer.onstop = resolve;
        this.bgmPlayer.onload = () => {
          this.bgmPlayer.start();
          this.bgmPlayer.volume.rampTo(volume, fadeIn);
          this.currentBgm = url;
          resolve();
        };
      });
      
      console.log(`Playing BGM: ${url}`);
    } catch (error) {
      console.error('Failed to play background music:', error);
    }
  }

  // Stop background music
  stopBgm(fadeOut = 2) {
    if (!this.initialized) {
      console.warn('Cannot stop background music: Audio system not initialized');
      return;
    }
    
    if (!this.bgmPlayer) return;
    
    this.bgmPlayer.volume.rampTo(-60, fadeOut);
    setTimeout(() => {
      this.bgmPlayer.stop();
      this.currentBgm = null;
    }, fadeOut * 1000);
  }

  // Load and play a sound effect
  async playSfx(name, url, options = {}) {
    // Check if initialized and return early if not
    if (!this.initialized) {
      const initialized = await this.initialize();
      if (!initialized) {
        console.warn(`Cannot play sound effect ${name}: Audio system not initialized`);
        return;
      }
    }
    
    const {
      volume = this.volume.sfx,
      loop = false,
      playbackRate = 1,
      onload = null,
      onend = null
    } = options;
    
    try {
      // Create player if it doesn't exist
      if (!this.sfxPlayers[name]) {
        this.sfxPlayers[name] = new Tone.Player({
          url,
          volume,
          loop,
          playbackRate,
          onload,
          onend
        }).connect(this.reverb);
      }
      
      // If already loaded, play immediately
      if (this.sfxPlayers[name].loaded) {
        this.sfxPlayers[name].start();
      } else {
        // Otherwise, load and then play
        this.sfxPlayers[name].load(url);
        this.sfxPlayers[name].onstop = onend;
        this.sfxPlayers[name].onload = () => {
          if (onload) onload();
          this.sfxPlayers[name].start();
        };
      }
      
      console.log(`Playing SFX: ${name}`);
    } catch (error) {
      console.error(`Failed to play sound effect ${name}:`, error);
    }
  }

  // Stop a specific sound effect
  stopSfx(name) {
    if (!this.initialized) {
      console.warn(`Cannot stop sound effect ${name}: Audio system not initialized`);
      return;
    }
    
    if (!this.sfxPlayers[name]) return;
    
    this.sfxPlayers[name].stop();
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