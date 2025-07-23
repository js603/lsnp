// Integration test for 비둘기밥의 밤 (Night of Pigeonweed)
// This file tests the integration of all major components

import StoryManager from '../services/llm/StoryManager';
import audioManager from '../services/audio/audioManager';
import { TextDisplay } from '../components/ui/TextDisplay';
import { CharacterSilhouette } from '../components/ui/CharacterSilhouette';
import { CanvasRenderer } from '../components/ui/CanvasRenderer';

/**
 * This test file verifies that all major components of the game work together properly.
 * It's meant to be run manually during development to check integration.
 * 
 * To run this test:
 * 1. Uncomment the test function at the bottom of this file
 * 2. Add a button in the game UI that calls runIntegrationTest()
 * 3. Click the button and check the console for results
 */

// Mock callback functions
const mockCallbacks = {
  onStoryUpdate: (narrative) => {
    console.log('Story updated:', narrative.substring(0, 50) + '...');
    return true;
  },
  onChoicesUpdate: (choices) => {
    console.log('Choices updated:', choices.map(c => c.text));
    return true;
  },
  onVisualUpdate: (visualDesc) => {
    console.log('Visual updated:', visualDesc.substring(0, 50) + '...');
    return true;
  },
  onAudioUpdate: (audioDesc) => {
    console.log('Audio updated:', audioDesc.substring(0, 50) + '...');
    return true;
  },
  onError: (error) => {
    console.error('Error in StoryManager:', error);
    return false;
  }
};

// Test the StoryManager
const testStoryManager = async () => {
  console.log('Testing StoryManager...');
  
  try {
    const storyManager = new StoryManager();
    storyManager.setCallbacks(mockCallbacks);
    
    // Initialize game
    const initialSegment = await storyManager.initializeGame({
      setting: '폭설이 내리는 고립된 산장',
      time: '한겨울 밤',
      protagonist: '우연히 산장에 묵게 된 여행자',
      characters: [
        { id: 'host', name: '산장 주인', type: 'adult-male' },
        { id: 'guest1', name: '수상한 손님', type: 'adult-female' },
        { id: 'guest2', name: '노인', type: 'elderly' }
      ]
    });
    
    console.log('Initial segment generated:', initialSegment.narrative.substring(0, 100) + '...');
    console.log('Initial choices:', initialSegment.choices.map(c => c.text));
    
    // Test player choice
    if (initialSegment.choices.length > 0) {
      const nextSegment = await storyManager.handlePlayerChoice(initialSegment.choices[0]);
      console.log('Next segment after choice:', nextSegment.narrative.substring(0, 100) + '...');
    }
    
    // Test custom input
    const customSegment = await storyManager.handleCustomInput('주변을 살펴본다');
    console.log('Segment after custom input:', customSegment.narrative.substring(0, 100) + '...');
    
    // Test save/load
    const savedState = storyManager.saveGameState();
    console.log('Game state saved, history length:', savedState.history.length);
    
    const newStoryManager = new StoryManager();
    newStoryManager.setCallbacks(mockCallbacks);
    const loadResult = newStoryManager.loadGameState(savedState);
    console.log('Game state loaded:', loadResult);
    
    return true;
  } catch (error) {
    console.error('StoryManager test failed:', error);
    return false;
  }
};

// Test the AudioManager
const testAudioManager = async () => {
  console.log('Testing AudioManager...');
  
  try {
    // Initialize audio
    await audioManager.initialize();
    console.log('AudioManager initialized');
    
    // Test volume controls
    audioManager.setMasterVolume(-20);
    audioManager.setBgmVolume(-5);
    audioManager.setSfxVolume(0);
    console.log('Volume controls tested');
    
    // Test atmospheric effects
    audioManager.applyAtmosphericEffect(0.7);
    console.log('Atmospheric effects applied');
    
    // Test ambient sound generation
    const ambientSound = await audioManager.generateAmbientSound('비가 내리는 어두운 밤, 바람이 창문을 때리고 있다.');
    console.log('Ambient sound generated');
    
    // Clean up
    if (ambientSound && ambientSound.stop) {
      ambientSound.stop();
    }
    
    return true;
  } catch (error) {
    console.error('AudioManager test failed:', error);
    return false;
  }
};

// Test UI components
const testUIComponents = () => {
  console.log('Testing UI components...');
  
  try {
    // Verify TextDisplay component exists
    if (!TextDisplay) {
      throw new Error('TextDisplay component not found');
    }
    
    // Verify CharacterSilhouette component exists
    if (!CharacterSilhouette) {
      throw new Error('CharacterSilhouette component not found');
    }
    
    // Verify CanvasRenderer component exists
    if (!CanvasRenderer) {
      throw new Error('CanvasRenderer component not found');
    }
    
    console.log('All UI components verified');
    return true;
  } catch (error) {
    console.error('UI components test failed:', error);
    return false;
  }
};

// Run all tests
export const runIntegrationTest = async () => {
  console.log('Starting integration tests for 비둘기밥의 밤...');
  
  const results = {
    storyManager: await testStoryManager(),
    audioManager: await testAudioManager(),
    uiComponents: testUIComponents()
  };
  
  console.log('Integration test results:', results);
  
  if (Object.values(results).every(result => result === true)) {
    console.log('All integration tests passed! The game is ready for play testing.');
    return true;
  } else {
    console.error('Some integration tests failed. Please check the logs for details.');
    return false;
  }
};

// Uncomment to run the test
// runIntegrationTest();