// soundEffects.js
// Text-only version - all audio functionality removed

// Empty categories for compatibility
const SFX_CATEGORIES = {
  UI: 'ui',
  AMBIENT: 'ambient',
  CHARACTER: 'character',
  ENVIRONMENT: 'environment',
  MYSTERY: 'mystery',
};

// Dummy audio manager object
const audioManager = {
  initialize: () => Promise.resolve(),
  initializeAfterUserInteraction: () => Promise.resolve(),
  isInitialized: () => true,
  shutdown: () => {},
  setMasterVolume: () => {},
  setBgmVolume: () => {},
  setSfxVolume: () => {},
  generateAmbientSound: () => ({ stop: () => {} }),
  playSfx: () => ({ stop: () => {} }),
  stopSfx: () => {},
  playBgm: () => ({ stop: () => {} }),
  stopBgm: () => {},
  applyAtmosphericEffect: () => {}
};

// Empty sound effects object for compatibility
const SOUND_EFFECTS = {};

// Empty background music object for compatibility
export const BACKGROUND_MUSIC = {};

// 더미 함수들
const playSfx = async (sfxId, options = {}) => {
  return { stop: () => {} };
};

const stopSfx = (sfxId) => {
  // 더미 함수
};

const playMusic = async (musicId, options = {}) => {
  return { stop: () => {} };
};

const stopMusic = (fadeOut = 2) => {
  // 더미 함수
};

const playAmbientSound = (description) => {
  return { stop: () => {} };
};

const applyAtmosphericEffect = (intensity) => {
  // 더미 함수
};

// 통합된 오디오 서비스 객체
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