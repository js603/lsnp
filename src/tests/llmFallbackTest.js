/**
 * LLM Fallback Mechanism Test
 * 
 * This script tests the fallback mechanisms of both the GROQ and GEMINI LLM services.
 * It simulates API key failures and verifies that the services properly switch to alternative keys.
 */

import GroqService from '../services/llm/groqService';
import GeminiService from '../services/llm/geminiService';

// Mock environment variables for testing
process.env.REACT_APP_GROQ_API_MAIN_KEY = 'groq-main-key-invalid'; // Invalid key to force fallback
process.env.REACT_APP_GROQ_API_SUB_KEY = 'groq-sub-key-valid'; // Valid key for fallback

process.env.REACT_APP_GEMINI_API_MAIN_KEY = 'gemini-main-key-invalid'; // Invalid key to force fallback
process.env.REACT_APP_GEMINI_API_SUB_KEY = 'gemini-sub-key-invalid'; // Invalid key to force fallback to THIRD
process.env.REACT_APP_GEMINI_API_THIRD_KEY = 'gemini-third-key-valid'; // Valid key for fallback

// Mock the Groq client
jest.mock('groq', () => {
  return {
    Groq: jest.fn().mockImplementation(({ apiKey }) => {
      return {
        chat: {
          completions: {
            create: jest.fn().mockImplementation(async () => {
              // Simulate API key validation
              if (apiKey === 'groq-main-key-invalid') {
                throw new Error('Invalid API key');
              }
              
              // Return mock response for valid key
              return {
                choices: [
                  {
                    message: {
                      content: 'Mock response from GROQ API'
                    }
                  }
                ]
              };
            })
          }
        }
      };
    })
  };
});

// Mock the GoogleGenerativeAI client
jest.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: jest.fn().mockImplementation((apiKey) => {
      return {
        getGenerativeModel: jest.fn().mockImplementation(() => {
          return {
            startChat: jest.fn().mockImplementation(() => {
              return {
                sendMessage: jest.fn().mockImplementation(async () => {
                  // Simulate API key validation
                  if (apiKey === 'gemini-main-key-invalid' || apiKey === 'gemini-sub-key-invalid') {
                    throw new Error('Invalid API key');
                  }
                  
                  // Return mock response for valid key
                  return {
                    response: {
                      text: () => 'Mock response from Gemini API'
                    }
                  };
                })
              };
            }),
            generateContent: jest.fn().mockImplementation(async () => {
              // Simulate API key validation
              if (apiKey === 'gemini-main-key-invalid' || apiKey === 'gemini-sub-key-invalid') {
                throw new Error('Invalid API key');
              }
              
              // Return mock response for valid key
              return {
                response: {
                  text: () => 'Mock response from Gemini API'
                }
              };
            })
          };
        })
      };
    })
  };
});

// Test GROQ service fallback
async function testGroqFallback() {
  console.log('Testing GROQ service fallback mechanism...');
  
  const groqService = new GroqService();
  console.log('Initial API key:', groqService.currentApiKey); // Should be 'main'
  
  try {
    // This should fail with the MAIN key and switch to the SUB key
    const result = await groqService.generateStorySegment({ isNewGame: true });
    console.log('GROQ response received:', result.narrative ? 'Success' : 'Failure');
    console.log('Current API key after fallback:', groqService.currentApiKey); // Should be 'sub'
    
    if (groqService.currentApiKey === 'sub') {
      console.log('✅ GROQ fallback test PASSED: Successfully switched from MAIN to SUB key');
    } else {
      console.log('❌ GROQ fallback test FAILED: Did not switch to SUB key');
    }
  } catch (error) {
    console.error('❌ GROQ fallback test FAILED:', error.message);
  }
}

// Test GEMINI service fallback
async function testGeminiFallback() {
  console.log('\nTesting GEMINI service fallback mechanism...');
  
  const geminiService = new GeminiService();
  console.log('Initial API key:', geminiService.currentApiKey); // Should be 'main'
  
  try {
    // This should fail with the MAIN key, then with the SUB key, and finally succeed with the THIRD key
    const result = await geminiService.generateStorySegment({ isNewGame: true });
    console.log('GEMINI response received:', result.narrative ? 'Success' : 'Failure');
    console.log('Current API key after fallback:', geminiService.currentApiKey); // Should be 'third'
    
    if (geminiService.currentApiKey === 'third') {
      console.log('✅ GEMINI fallback test PASSED: Successfully cascaded from MAIN to SUB to THIRD key');
    } else {
      console.log('❌ GEMINI fallback test FAILED: Did not complete the cascade to THIRD key');
    }
  } catch (error) {
    console.error('❌ GEMINI fallback test FAILED:', error.message);
  }
}

// Run the tests
async function runTests() {
  console.log('=== LLM FALLBACK MECHANISM TESTS ===\n');
  
  await testGroqFallback();
  await testGeminiFallback();
  
  console.log('\n=== TESTS COMPLETED ===');
}

runTests();