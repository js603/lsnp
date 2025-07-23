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
  
  // Game settings - text-only mode
  settings: {
    textSpeed: 30, // ms per character
    autoSave: true
  },
  
  // Flags for tracking story branches and events
  flags: {}
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
  ADD_PLAYED_ENDING: 'ADD_PLAYED_ENDING'
  // Audio-related action types removed for text-only mode
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
        
        // 오디오 초기화 코드 제거됨
        
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
  }, [state.isInitialized]);
  
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
      // LLM을 사용하여 초기 장면 생성
      const initialScenePrompt = llmService.fillPromptTemplate(
        llmService.PROMPT_TEMPLATES.GAME_START,
        { LOCATION: '마을' } // 기본 위치
      );
      
      const initialSceneContent = await llmService.generateStoryContent(initialScenePrompt);
      
      // Generate initial choices
      const choices = await llmService.generateChoices(initialSceneContent);
      
      // Create initial scene
      const initialScene = {
        id: 'scene_1',
        content: initialSceneContent,
        choices: choices,
        background: 'village', // Kept for compatibility but not used visually
        mood: 'mysterious'     // Kept for compatibility but not used for audio
      };
      
      dispatch({
        type: ACTION_TYPES.START_NEW_GAME,
        payload: {
          initialScene,
          characters: []
        }
      });
      
      // Navigate to game screen
      window.location.hash = '/game';
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
      const selectedChoice = state.choices[choiceIndex];
      
      // Clear current choices
      dispatch({ type: ACTION_TYPES.SELECT_CHOICE });
      
      // 선택에 기반하여 다음 장면 생성
      const continuePrompt = llmService.fillPromptTemplate(
        llmService.PROMPT_TEMPLATES.CONTINUE_STORY,
        {
          CONTEXT: `${state.currentScene.content}\n\n플레이어가 선택한 항목: "${selectedChoice}"`
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
        background: state.currentScene.background, // Kept for compatibility but not used visually
        mood: state.currentScene.mood // Kept for compatibility but not used for audio
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
      
      // Check for mood changes - still useful for narrative context even in text-only mode
      let mood = state.currentScene.mood;
      if (lowerContent.includes('tense') || lowerContent.includes('scary')) {
        mood = 'tense';
      } else if (lowerContent.includes('revelation') || lowerContent.includes('discover')) {
        mood = 'revelation';
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
    // In text-only mode, we only have text speed and auto-save settings
    dispatch({
      type: ACTION_TYPES.UPDATE_SETTINGS,
      payload: newSettings
    });
  };
  
  const setFlag = (key, value) => {
    dispatch({
      type: ACTION_TYPES.SET_FLAG,
      payload: { key, value }
    });
  };
  
  const setCurrentScreen = (screen) => {
    // Update state for backward compatibility
    dispatch({
      type: ACTION_TYPES.SET_CURRENT_SCREEN,
      payload: screen
    });
  
    // Navigate using window.location.hash
    // This works with HashRouter
    switch (screen) {
      case 'game':
        window.location.hash = '/game';
        break;
      case 'settings':
        window.location.hash = '/settings';
        break;
      case 'credits':
        window.location.hash = '/credits';
        break;
      case 'auth':
        window.location.hash = '/auth';
        break;
      case 'title':
      default:
        window.location.hash = '/';
        break;
    }
  };
  
  const setPlayerName = (name) => {
    dispatch({
      type: ACTION_TYPES.SET_PLAYER_NAME,
      payload: name
    });
  };
  
  // No-op functions for text-only mode
  const playMusic = (musicId) => {
    // No-op implementation for text-only mode
    return;
  };
  
  const playAmbientSound = (description) => {
    // No-op implementation for text-only mode
    return { stop: () => {} };
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