// Simple test script for the core gameplay loop
import llmService from '../services/llm';
import soundEffects from '../services/audio/soundEffects';

/**
 * This is a simple test script to verify that the core gameplay loop works as expected.
 * It tests the integration between the LLM service, the game context, and the UI components.
 * 
 * To run this test, you would typically:
 * 1. Import it in a component or create a test button
 * 2. Call runGameLoopTest() when the button is clicked
 * 3. Check the console for test results
 * 
 * Note: This is a simplified test and not a comprehensive test suite.
 * In a production environment, you would use a proper testing framework like Jest.
 */

// Test the LLM service
const testLlmService = async () => {
  console.log('Testing LLM service...');
  
  try {
    // Test story generation
    const storyPrompt = llmService.fillPromptTemplate(
      llmService.PROMPT_TEMPLATES.GAME_START,
      { LOCATION: '마을' }
    );
    
    console.log('Story prompt:', storyPrompt);
    
    const storyContent = await llmService.generateStoryContent(storyPrompt);
    console.log('Generated story content:', storyContent);
    
    if (!storyContent || storyContent.length < 50) {
      console.error('Story content is too short or empty');
      return false;
    }
    
    // Test choice generation
    const choices = await llmService.generateChoices(storyContent);
    console.log('Generated choices:', choices);
    
    if (!choices || choices.length === 0) {
      console.error('No choices generated');
      return false;
    }
    
    console.log('LLM service test passed!');
    return true;
  } catch (error) {
    console.error('LLM service test failed:', error);
    return false;
  }
};

// Test the audio service
const testAudioService = async () => {
  console.log('Testing audio service...');
  
  try {
    // Initialize audio
    await soundEffects.audioManager.initialize();
    
    // Test playing a sound effect
    console.log('Playing UI click sound...');
    soundEffects.playSfx('UI_CLICK');
    
    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test playing background music
    console.log('Playing main theme...');
    soundEffects.playMusic('MAIN_THEME', { volume: -15 });
    
    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test stopping background music
    console.log('Stopping music...');
    soundEffects.stopMusic(1);
    
    console.log('Audio service test passed!');
    return true;
  } catch (error) {
    console.error('Audio service test failed:', error);
    return false;
  }
};

// Test the game loop
const testGameLoop = async (gameContext) => {
  console.log('Testing game loop...');
  
  try {
    if (!gameContext) {
      console.error('Game context is not available');
      return false;
    }
    
    // Test starting a new game
    console.log('Starting new game...');
    await gameContext.startNewGame();
    
    if (!gameContext.currentScene) {
      console.error('No current scene after starting new game');
      return false;
    }
    
    console.log('Current scene:', gameContext.currentScene);
    
    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test selecting a choice
    if (gameContext.choices && gameContext.choices.length > 0) {
      console.log('Selecting first choice:', gameContext.choices[0]);
      await gameContext.selectChoice(0);
      
      // Wait for the next scene
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('New scene after choice:', gameContext.currentScene);
    } else {
      console.warn('No choices available to select');
    }
    
    console.log('Game loop test passed!');
    return true;
  } catch (error) {
    console.error('Game loop test failed:', error);
    return false;
  }
};

// Run all tests
export const runGameLoopTest = async (gameContext) => {
  console.log('Running game loop tests...');
  
  const llmResult = await testLlmService();
  const audioResult = await testAudioService();
  const gameLoopResult = await testGameLoop(gameContext);
  
  console.log('Test results:');
  console.log('- LLM service:', llmResult ? 'PASSED' : 'FAILED');
  console.log('- Audio service:', audioResult ? 'PASSED' : 'FAILED');
  console.log('- Game loop:', gameLoopResult ? 'PASSED' : 'FAILED');
  
  const allPassed = llmResult && audioResult && gameLoopResult;
  console.log('Overall test result:', allPassed ? 'PASSED' : 'FAILED');
  
  return allPassed;
};

export default runGameLoopTest;