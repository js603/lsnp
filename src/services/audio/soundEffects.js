import audioManager from './audioManager';

// Sound effect categories
export const SFX_CATEGORIES = {
  UI: 'ui',
  AMBIENT: 'ambient',
  CHARACTER: 'character',
  ENVIRONMENT: 'environment',
  MYSTERY: 'mystery'
};

// Sound effect definitions
// These would normally point to actual audio files
// For now, we'll use placeholders that would be replaced with actual files
export const SOUND_EFFECTS = {
  // UI sounds
  UI_CLICK: {
    id: 'ui_click',
    url: '/assets/audio/ui/click.mp3',
    category: SFX_CATEGORIES.UI,
    volume: -5
  },
  UI_HOVER: {
    id: 'ui_hover',
    url: '/assets/audio/ui/hover.mp3',
    category: SFX_CATEGORIES.UI,
    volume: -10
  },
  UI_CHOICE_APPEAR: {
    id: 'ui_choice_appear',
    url: '/assets/audio/ui/choice_appear.mp3',
    category: SFX_CATEGORIES.UI,
    volume: -8
  },
  UI_CHOICE_SELECT: {
    id: 'ui_choice_select',
    url: '/assets/audio/ui/choice_select.mp3',
    category: SFX_CATEGORIES.UI,
    volume: -5
  },
  UI_TEXT_TYPING: {
    id: 'ui_text_typing',
    url: '/assets/audio/ui/text_typing.mp3',
    category: SFX_CATEGORIES.UI,
    volume: -15,
    loop: true
  },
  
  // Ambient sounds
  AMBIENT_RAIN: {
    id: 'ambient_rain',
    url: '/assets/audio/ambient/rain.mp3',
    category: SFX_CATEGORIES.AMBIENT,
    volume: -10,
    loop: true
  },
  AMBIENT_WIND: {
    id: 'ambient_wind',
    url: '/assets/audio/ambient/wind.mp3',
    category: SFX_CATEGORIES.AMBIENT,
    volume: -12,
    loop: true
  },
  AMBIENT_NIGHT: {
    id: 'ambient_night',
    url: '/assets/audio/ambient/night.mp3',
    category: SFX_CATEGORIES.AMBIENT,
    volume: -15,
    loop: true
  },
  AMBIENT_FIRE: {
    id: 'ambient_fire',
    url: '/assets/audio/ambient/fire.mp3',
    category: SFX_CATEGORIES.AMBIENT,
    volume: -12,
    loop: true
  },
  
  // Character sounds
  CHARACTER_FOOTSTEPS: {
    id: 'character_footsteps',
    url: '/assets/audio/character/footsteps.mp3',
    category: SFX_CATEGORIES.CHARACTER,
    volume: -8
  },
  CHARACTER_GASP: {
    id: 'character_gasp',
    url: '/assets/audio/character/gasp.mp3',
    category: SFX_CATEGORIES.CHARACTER,
    volume: -5
  },
  CHARACTER_SIGH: {
    id: 'character_sigh',
    url: '/assets/audio/character/sigh.mp3',
    category: SFX_CATEGORIES.CHARACTER,
    volume: -7
  },
  
  // Environment sounds
  ENVIRONMENT_DOOR_OPEN: {
    id: 'environment_door_open',
    url: '/assets/audio/environment/door_open.mp3',
    category: SFX_CATEGORIES.ENVIRONMENT,
    volume: -5
  },
  ENVIRONMENT_DOOR_CLOSE: {
    id: 'environment_door_close',
    url: '/assets/audio/environment/door_close.mp3',
    category: SFX_CATEGORIES.ENVIRONMENT,
    volume: -5
  },
  ENVIRONMENT_DRAWER: {
    id: 'environment_drawer',
    url: '/assets/audio/environment/drawer.mp3',
    category: SFX_CATEGORIES.ENVIRONMENT,
    volume: -8
  },
  ENVIRONMENT_GLASS_BREAK: {
    id: 'environment_glass_break',
    url: '/assets/audio/environment/glass_break.mp3',
    category: SFX_CATEGORIES.ENVIRONMENT,
    volume: -3
  },
  
  // Mystery/tension sounds
  MYSTERY_REVEAL: {
    id: 'mystery_reveal',
    url: '/assets/audio/mystery/reveal.mp3',
    category: SFX_CATEGORIES.MYSTERY,
    volume: -5
  },
  MYSTERY_SUSPENSE: {
    id: 'mystery_suspense',
    url: '/assets/audio/mystery/suspense.mp3',
    category: SFX_CATEGORIES.MYSTERY,
    volume: -8,
    loop: true
  },
  MYSTERY_HEARTBEAT: {
    id: 'mystery_heartbeat',
    url: '/assets/audio/mystery/heartbeat.mp3',
    category: SFX_CATEGORIES.MYSTERY,
    volume: -10,
    loop: true
  },
  MYSTERY_JUMPSCARE: {
    id: 'mystery_jumpscare',
    url: '/assets/audio/mystery/jumpscare.mp3',
    category: SFX_CATEGORIES.MYSTERY,
    volume: 0 // Louder for impact
  }
};

// Background music tracks
export const BACKGROUND_MUSIC = {
  MAIN_THEME: {
    id: 'main_theme',
    url: '/assets/audio/music/main_theme.mp3',
    volume: -8
  },
  MYSTERY: {
    id: 'mystery',
    url: '/assets/audio/music/mystery.mp3',
    volume: -10
  },
  TENSION: {
    id: 'tension',
    url: '/assets/audio/music/tension.mp3',
    volume: -8
  },
  REVELATION: {
    id: 'revelation',
    url: '/assets/audio/music/revelation.mp3',
    volume: -8
  },
  ENDING: {
    id: 'ending',
    url: '/assets/audio/music/ending.mp3',
    volume: -8
  }
};

// Helper functions

/**
 * Play a sound effect
 * @param {string} sfxId - The ID of the sound effect to play
 * @param {Object} options - Additional options for playback
 * @returns {Promise} - A promise that resolves when the sound starts playing
 */
export const playSfx = async (sfxId, options = {}) => {
  const sfx = SOUND_EFFECTS[sfxId];
  if (!sfx) {
    console.warn(`Sound effect ${sfxId} not found`);
    return;
  }
  
  return audioManager.playSfx(sfx.id, sfx.url, {
    volume: sfx.volume,
    loop: sfx.loop || false,
    ...options
  });
};

/**
 * Stop a sound effect
 * @param {string} sfxId - The ID of the sound effect to stop
 */
export const stopSfx = (sfxId) => {
  const sfx = SOUND_EFFECTS[sfxId];
  if (!sfx) {
    console.warn(`Sound effect ${sfxId} not found`);
    return;
  }
  
  audioManager.stopSfx(sfx.id);
};

/**
 * Play background music
 * @param {string} musicId - The ID of the music track to play
 * @param {Object} options - Additional options for playback
 * @returns {Promise} - A promise that resolves when the music starts playing
 */
export const playMusic = async (musicId, options = {}) => {
  const music = BACKGROUND_MUSIC[musicId];
  if (!music) {
    console.warn(`Music track ${musicId} not found`);
    return;
  }
  
  return audioManager.playBgm(music.url, {
    volume: music.volume,
    ...options
  });
};

/**
 * Stop the currently playing background music
 * @param {number} fadeOut - Fade out time in seconds
 */
export const stopMusic = (fadeOut = 2) => {
  audioManager.stopBgm(fadeOut);
};

/**
 * Play ambient sound based on scene description
 * @param {string} description - Description of the scene
 * @returns {Object} - Object with stop method to stop the ambient sound
 */
export const playAmbientSound = (description) => {
  return audioManager.generateAmbientSound(description);
};

/**
 * Apply atmospheric effect to audio
 * @param {number} intensity - Intensity of the effect (0-1)
 */
export const applyAtmosphericEffect = (intensity) => {
  audioManager.applyAtmosphericEffect(intensity);
};

// Create a named object for export
const soundEffects = {
  playSfx,
  stopSfx,
  playMusic,
  stopMusic,
  playAmbientSound,
  applyAtmosphericEffect,
  SOUND_EFFECTS,
  BACKGROUND_MUSIC,
  SFX_CATEGORIES,
  audioManager
};

export default soundEffects;