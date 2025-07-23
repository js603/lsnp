import React, { createContext, useContext, useReducer, useEffect } from 'react';
import llmService from '../services/llm';
import soundEffects from '../services/audio/soundEffects';
import authService from '../services/firebase/authService';
import dataService from '../services/firebase/dataService';

// Initial game state
const initialState = {
  // Game status
  isLoading: false,
  isInitialized: false,
  currentScreen: 'title', // 'title', 'game', 'settings', 'credits'
  
  // Story state
  currentScene: null,
  sceneHistory: [],
  choices: [],
  characters: [],
  
  // Player state
  playerName: '',
  playedEndings: [],
  
  // Game settings
  settings: {
    textSpeed: 30, // ms per character
    volume: {
      master: 0.8,
      bgm: 0.7,
      sfx: 0.8
    },
    autoSave: true
  },
  
  // Flags for tracking story branches and events
  flags: {},
  
  // Current background music and ambient sounds
  currentBgm: null,
  currentAmbient: null
};

// Action types
const ACTION_TYPES = {
  SET_LOADING: 'SET_LOADING',
  INITIALIZE_GAME: 'INITIALIZE_GAME',
  SET_CURRENT_SCREEN: 'SET_CURRENT_SCREEN',
  SET_PLAYER_NAME: 'SET_PLAYER_NAME',
  START_NEW_GAME: 'START_NEW_GAME',
  ADVANCE_SCENE: 'ADVANCE_SCENE',
  SELECT_CHOICE: 'SELECT_CHOICE',
  SET_CHOICES: 'SET_CHOICES',
  UPDATE_CHARACTERS: 'UPDATE_CHARACTERS',
  SET_FLAG: 'SET_FLAG',
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',
  LOAD_GAME: 'LOAD_GAME',
  PLAY_MUSIC: 'PLAY_MUSIC',
  PLAY_AMBIENT: 'PLAY_AMBIENT',
  ADD_PLAYED_ENDING: 'ADD_PLAYED_ENDING'
};

// Game reducer
const gameReducer = (state, action) => {
  switch (action.type) {
    case ACTION_TYPES.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };
      
    case ACTION_TYPES.INITIALIZE_GAME:
      return {
        ...state,
        isInitialized: true
      };
      
    case ACTION_TYPES.SET_CURRENT_SCREEN:
      return {
        ...state,
        currentScreen: action.payload
      };
      
    case ACTION_TYPES.SET_PLAYER_NAME:
      return {
        ...state,
        playerName: action.payload
      };
      
    case ACTION_TYPES.START_NEW_GAME:
      return {
        ...initialState,
        isInitialized: true,
        currentScreen: 'game',
        playerName: state.playerName,
        settings: state.settings,
        playedEndings: state.playedEndings,
        currentScene: action.payload.initialScene,
        characters: action.payload.characters || []
      };
      
    case ACTION_TYPES.ADVANCE_SCENE:
      return {
        ...state,
        currentScene: action.payload.scene,
        sceneHistory: [...state.sceneHistory, state.currentScene],
        choices: action.payload.choices || [],
        characters: action.payload.characters || state.characters
      };
      
    case ACTION_TYPES.SELECT_CHOICE:
      return {
        ...state,
        choices: [] // Clear choices after selection
      };
      
    case ACTION_TYPES.SET_CHOICES:
      return {
        ...state,
        choices: action.payload
      };
      
    case ACTION_TYPES.UPDATE_CHARACTERS:
      return {
        ...state,
        characters: action.payload
      };
      
    case ACTION_TYPES.SET_FLAG:
      return {
        ...state,
        flags: {
          ...state.flags,
          [action.payload.key]: action.payload.value
        }
      };
      
    case ACTION_TYPES.UPDATE_SETTINGS:
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload
        }
      };
      
    case ACTION_TYPES.LOAD_GAME:
      return {
        ...action.payload,
        isLoading: false,
        isInitialized: true
      };
      
    case ACTION_TYPES.PLAY_MUSIC:
      return {
        ...state,
        currentBgm: action.payload
      };
      
    case ACTION_TYPES.PLAY_AMBIENT:
      return {
        ...state,
        currentAmbient: action.payload
      };
      
    case ACTION_TYPES.ADD_PLAYED_ENDING:
      return {
        ...state,
        playedEndings: [...state.playedEndings, action.payload]
      };
      
    default:
      return state;
  }
};

// Create context
const GameContext = createContext();

// Game provider component
export const GameProvider = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  
  // Initialize game on mount
  useEffect(() => {
    const initializeGame = async () => {
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });
      
      try {
        // Load saved game if available
        const savedGame = localStorage.getItem('pigeonweed_save');
        if (savedGame) {
          try {
            const parsedSave = JSON.parse(savedGame);
            dispatch({ type: ACTION_TYPES.LOAD_GAME, payload: parsedSave });
          } catch (error) {
            console.error('Error loading saved game:', error);
          }
        }
        
        // Note: Audio initialization is now deferred until user interaction
        // We'll initialize it in TitleScreen.js when a button is clicked
        
        // Still set volume settings so they're ready when audio is initialized
        // These won't cause errors even if audio isn't initialized yet
        soundEffects.audioManager.setMasterVolume(state.settings.volume.master * 20 - 20); // Convert 0-1 to -20-0 dB
        soundEffects.audioManager.setBgmVolume(state.settings.volume.bgm * 20 - 20);
        soundEffects.audioManager.setSfxVolume(state.settings.volume.sfx * 20 - 20);
        
        dispatch({ type: ACTION_TYPES.INITIALIZE_GAME });
      } catch (error) {
        console.error('Error initializing game:', error);
      } finally {
        dispatch({ type: ACTION_TYPES.SET_LOADING, payload: false });
      }
    };
    
    if (!state.isInitialized) {
      initializeGame();
    }
  }, [state.isInitialized, state.settings.volume]);
  
  // Auto-save game when state changes
  useEffect(() => {
    if (state.isInitialized && state.settings.autoSave && state.currentScreen === 'game') {
      const saveGame = async () => {
        try {
          // Create a copy of the state without certain properties
          const stateToSave = { ...state };
          delete stateToSave.isLoading;
          
          // Check if user is logged in
          const isLoggedIn = authService.isLoggedIn();
          
          if (isLoggedIn) {
            // Save to Firebase if logged in
            await dataService.saveGame('auto', stateToSave);
            console.log('Game saved to Firebase');
          } else {
            // Fall back to localStorage if not logged in
            localStorage.setItem('pigeonweed_save', JSON.stringify(stateToSave));
            console.log('Game saved to localStorage');
          }
        } catch (error) {
          console.error('Error saving game:', error);
          
          // Fall back to localStorage if Firebase save fails
          try {
            const stateToSave = { ...state };
            delete stateToSave.isLoading;
            localStorage.setItem('pigeonweed_save', JSON.stringify(stateToSave));
            console.log('Game saved to localStorage (fallback)');
          } catch (fallbackError) {
            console.error('Error saving game to localStorage:', fallbackError);
          }
        }
      };
      
      saveGame();
    }
  }, [state]);
  
  // Game actions
  const startNewGame = async () => {
    dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });
    
    try {
      // Play UI sound
      soundEffects.playSfx('UI_CLICK');
      
      // Generate initial scene using LLM
      const initialScenePrompt = llmService.fillPromptTemplate(
        llmService.PROMPT_TEMPLATES.GAME_START,
        { LOCATION: '마을' } // Default location
      );
      
      const initialSceneContent = await llmService.generateStoryContent(initialScenePrompt);
      
      // Generate initial choices
      const choices = await llmService.generateChoices(initialSceneContent);
      
      // Create initial scene
      const initialScene = {
        id: 'scene_1',
        content: initialSceneContent,
        choices: choices,
        background: 'village',
        mood: 'mysterious'
      };
      
      // Start background music
      soundEffects.playMusic('MAIN_THEME');
      
      dispatch({
        type: ACTION_TYPES.START_NEW_GAME,
        payload: {
          initialScene,
          characters: []
        }
      });
    } catch (error) {
      console.error('Error starting new game:', error);
    } finally {
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: false });
    }
  };
  
  const selectChoice = async (choiceIndex) => {
    if (state.choices.length === 0 || choiceIndex >= state.choices.length) return;
    
    dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });
    
    try {
      // Play UI sound
      soundEffects.playSfx('UI_CHOICE_SELECT');
      
      const selectedChoice = state.choices[choiceIndex];
      
      // Clear current choices
      dispatch({ type: ACTION_TYPES.SELECT_CHOICE });
      
      // Generate next scene based on the choice
      const continuePrompt = llmService.fillPromptTemplate(
        llmService.PROMPT_TEMPLATES.CONTINUE_STORY,
        {
          CONTEXT: `${state.currentScene.content}\n\nThe player chose: "${selectedChoice}"`
        }
      );
      
      const nextSceneContent = await llmService.generateStoryContent(continuePrompt);
      
      // Generate new choices
      const newChoices = await llmService.generateChoices(nextSceneContent);
      
      // Create next scene
      const nextScene = {
        id: `scene_${state.sceneHistory.length + 2}`,
        content: nextSceneContent,
        choices: newChoices,
        background: state.currentScene.background, // Inherit background for now
        mood: state.currentScene.mood // Inherit mood for now
      };
      
      // Check for special keywords in the scene to update game state
      const lowerContent = nextSceneContent.toLowerCase();
      
      // Check for character appearances
      const characters = [...state.characters];
      
      // Example: Detect new characters or character movements
      if (lowerContent.includes('enters') || lowerContent.includes('appears')) {
        // This is a simplified example - in a real game, you'd use more sophisticated NLP
        // to detect character appearances and positions
        const newCharacter = {
          id: `character_${characters.length + 1}`,
          description: 'A mysterious figure',
          position: 'right'
        };
        
        characters.push(newCharacter);
      }
      
      // Check for mood changes
      let mood = state.currentScene.mood;
      if (lowerContent.includes('tense') || lowerContent.includes('scary')) {
        mood = 'tense';
        soundEffects.playMusic('TENSION');
        soundEffects.applyAtmosphericEffect(0.7);
      } else if (lowerContent.includes('revelation') || lowerContent.includes('discover')) {
        mood = 'revelation';
        soundEffects.playMusic('REVELATION');
        soundEffects.applyAtmosphericEffect(0.3);
      }
      
      // Update the next scene with new mood
      nextScene.mood = mood;
      
      // Advance to the next scene
      dispatch({
        type: ACTION_TYPES.ADVANCE_SCENE,
        payload: {
          scene: nextScene,
          choices: newChoices,
          characters
        }
      });
    } catch (error) {
      console.error('Error processing choice:', error);
    } finally {
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: false });
    }
  };
  
  const updateSettings = (newSettings) => {
    dispatch({
      type: ACTION_TYPES.UPDATE_SETTINGS,
      payload: newSettings
    });
    
    // Update audio settings if they changed
    if (newSettings.volume) {
      if (newSettings.volume.master !== undefined) {
        soundEffects.audioManager.setMasterVolume(newSettings.volume.master * 20 - 20);
      }
      if (newSettings.volume.bgm !== undefined) {
        soundEffects.audioManager.setBgmVolume(newSettings.volume.bgm * 20 - 20);
      }
      if (newSettings.volume.sfx !== undefined) {
        soundEffects.audioManager.setSfxVolume(newSettings.volume.sfx * 20 - 20);
      }
    }
  };
  
  const setFlag = (key, value) => {
    dispatch({
      type: ACTION_TYPES.SET_FLAG,
      payload: { key, value }
    });
  };
  
  const setCurrentScreen = (screen) => {
    // Play UI sound
    soundEffects.playSfx('UI_CLICK');
    
    dispatch({
      type: ACTION_TYPES.SET_CURRENT_SCREEN,
      payload: screen
    });
  };
  
  const setPlayerName = (name) => {
    dispatch({
      type: ACTION_TYPES.SET_PLAYER_NAME,
      payload: name
    });
  };
  
  const playMusic = (musicId, options = {}) => {
    soundEffects.playMusic(musicId, options);
    
    dispatch({
      type: ACTION_TYPES.PLAY_MUSIC,
      payload: musicId
    });
  };
  
  const playAmbientSound = (description) => {
    const ambient = soundEffects.playAmbientSound(description);
    
    dispatch({
      type: ACTION_TYPES.PLAY_AMBIENT,
      payload: description
    });
    
    return ambient;
  };
  
  const addPlayedEnding = (endingId) => {
    if (!state.playedEndings.includes(endingId)) {
      dispatch({
        type: ACTION_TYPES.ADD_PLAYED_ENDING,
        payload: endingId
      });
    }
  };
  
  // Provide context value
  const contextValue = {
    ...state,
    startNewGame,
    selectChoice,
    updateSettings,
    setFlag,
    setCurrentScreen,
    setPlayerName,
    playMusic,
    playAmbientSound,
    addPlayedEnding
  };
  
  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
};

// Custom hook for using the game context
export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

export default GameContext;