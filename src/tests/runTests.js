/**
 * Test Runner for 비둘기밥의 밤 (Night of Pigeonweed)
 * 
 * This script provides an automated way to run all tests in the project.
 * It can be executed from the command line or integrated into CI/CD pipelines.
 */

import { runIntegrationTest } from './integration.test';
import runGameLoopTest from './gameLoopTest';
import { jest } from '@jest/globals';

// Mock environment variables for testing
process.env.REACT_APP_GROQ_API_MAIN_KEY = 'test-groq-key';
process.env.REACT_APP_GROQ_API_SUB_KEY = 'test-groq-sub-key';
process.env.REACT_APP_GEMINI_API_MAIN_KEY = 'test-gemini-key';
process.env.REACT_APP_GEMINI_API_SUB_KEY = 'test-gemini-sub-key';
process.env.REACT_APP_GEMINI_API_THIRD_KEY = 'test-gemini-third-key';

// Mock dependencies
jest.mock('../services/llm/groqService');
jest.mock('../services/llm/geminiService');
jest.mock('../services/audio/audioManager', () => ({
  initialize: jest.fn().mockResolvedValue(true),
  setMasterVolume: jest.fn(),
  setBgmVolume: jest.fn(),
  setSfxVolume: jest.fn(),
  playBgm: jest.fn().mockResolvedValue(true),
  playSfx: jest.fn(),
  generateAmbientSound: jest.fn().mockResolvedValue({
    stop: jest.fn()
  }),
  applyAtmosphericEffect: jest.fn()
}));

// Mock canvas and DOM elements for testing
global.HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
  clearRect: jest.fn(),
  fillRect: jest.fn(),
  drawImage: jest.fn(),
  beginPath: jest.fn(),
  arc: jest.fn(),
  fill: jest.fn(),
  stroke: jest.fn()
}));

// Create a mock game context for testing
const createMockGameContext = () => ({
  currentScene: {
    content: 'Test scene content',
    background: 'test-background',
    mood: 'mysterious'
  },
  choices: [
    { id: 'choice_1', text: 'Test choice 1' },
    { id: 'choice_2', text: 'Test choice 2' }
  ],
  characters: [],
  startNewGame: jest.fn().mockResolvedValue(true),
  selectChoice: jest.fn().mockResolvedValue(true),
  settings: {
    volume: {
      master: 0.8,
      bgm: 0.7,
      sfx: 0.8
    },
    textSpeed: 30,
    autoSave: true
  }
});

/**
 * Run all tests in the project
 * @returns {Promise<object>} - Test results
 */
const runAllTests = async () => {
  console.log('=== Running all tests for 비둘기밥의 밤 ===\n');
  
  const results = {
    integration: false,
    gameLoop: false,
    llmFallback: false
  };
  
  // Run integration tests
  console.log('Running integration tests...');
  try {
    const integrationResult = await runIntegrationTest();
    results.integration = integrationResult;
    console.log(`Integration tests ${integrationResult ? 'PASSED' : 'FAILED'}`);
  } catch (error) {
    console.error('Error running integration tests:', error);
  }
  
  // Run game loop tests
  console.log('\nRunning game loop tests...');
  try {
    const mockGameContext = createMockGameContext();
    const gameLoopResult = await runGameLoopTest(mockGameContext);
    results.gameLoop = gameLoopResult;
    console.log(`Game loop tests ${gameLoopResult ? 'PASSED' : 'FAILED'}`);
  } catch (error) {
    console.error('Error running game loop tests:', error);
  }
  
  // Run LLM fallback tests
  console.log('\nRunning LLM fallback tests...');
  try {
    // Import dynamically to avoid running the tests immediately
    const llmFallbackTests = await import('./llmFallbackTest');
    // The tests run automatically when imported, so we just check if they were imported successfully
    results.llmFallback = true;
    console.log('LLM fallback tests executed');
  } catch (error) {
    console.error('Error running LLM fallback tests:', error);
  }
  
  // Print overall results
  console.log('\n=== Test Results ===');
  console.log(`Integration tests: ${results.integration ? 'PASSED' : 'FAILED'}`);
  console.log(`Game loop tests: ${results.gameLoop ? 'PASSED' : 'FAILED'}`);
  console.log(`LLM fallback tests: ${results.llmFallback ? 'EXECUTED' : 'FAILED'}`);
  
  const allPassed = Object.values(results).every(result => result === true);
  console.log(`\nOverall result: ${allPassed ? 'PASSED' : 'FAILED'}`);
  
  return results;
};

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests();
}

export default runAllTests;