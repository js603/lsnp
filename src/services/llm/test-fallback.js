// Test script to verify the fallback mechanism for LLM services
// This script simulates API failures and verifies that the fallback mechanism works correctly

// Import the LLM services
import groqService from './groq';
import geminiService from './gemini';
import llmService from './index';

// Test function to verify the GROQ service fallback
const testGroqFallback = async () => {
  console.log('=== Testing GROQ Service Fallback ===');
  
  try {
    // Test generateStoryContent
    console.log('Testing generateStoryContent...');
    const storyContent = await groqService.generateStoryContent('Test prompt for story generation');
    console.log('Story content generated successfully');
    
    // Test generateChoices
    console.log('Testing generateChoices...');
    const choices = await groqService.generateChoices('Test context for choice generation');
    console.log('Choices generated successfully:', choices);
    
    console.log('GROQ service fallback test passed');
  } catch (error) {
    console.error('GROQ service fallback test failed:', error);
  }
};

// Test function to verify the Gemini service fallback
const testGeminiFallback = async () => {
  console.log('=== Testing Gemini Service Fallback ===');
  
  try {
    // Test generateStoryContent
    console.log('Testing generateStoryContent...');
    const storyContent = await geminiService.generateStoryContent('Test prompt for story generation');
    console.log('Story content generated successfully');
    
    // Test generateChoices
    console.log('Testing generateChoices...');
    const choices = await geminiService.generateChoices('Test context for choice generation');
    console.log('Choices generated successfully:', choices);
    
    console.log('Gemini service fallback test passed');
  } catch (error) {
    console.error('Gemini service fallback test failed:', error);
  }
};

// Test function to verify the unified LLM service fallback
const testLlmServiceFallback = async () => {
  console.log('=== Testing Unified LLM Service Fallback ===');
  
  try {
    // Test generateStoryContent with GROQ as preferred service
    console.log('Testing generateStoryContent with GROQ as preferred service...');
    const storyContent1 = await llmService.generateStoryContent('Test prompt for story generation', { preferredService: 'groq' });
    console.log('Story content generated successfully with GROQ');
    
    // Test generateStoryContent with Gemini as preferred service
    console.log('Testing generateStoryContent with Gemini as preferred service...');
    const storyContent2 = await llmService.generateStoryContent('Test prompt for story generation', { preferredService: 'gemini' });
    console.log('Story content generated successfully with Gemini');
    
    // Test generateChoices with GROQ as preferred service
    console.log('Testing generateChoices with GROQ as preferred service...');
    const choices1 = await llmService.generateChoices('Test context for choice generation', { preferredService: 'groq' });
    console.log('Choices generated successfully with GROQ:', choices1);
    
    // Test generateChoices with Gemini as preferred service
    console.log('Testing generateChoices with Gemini as preferred service...');
    const choices2 = await llmService.generateChoices('Test context for choice generation', { preferredService: 'gemini' });
    console.log('Choices generated successfully with Gemini:', choices2);
    
    console.log('Unified LLM service fallback test passed');
  } catch (error) {
    console.error('Unified LLM service fallback test failed:', error);
  }
};

// Run the tests
const runTests = async () => {
  console.log('Starting LLM service fallback tests...');
  
  await testGroqFallback();
  await testGeminiFallback();
  await testLlmServiceFallback();
  
  console.log('All tests completed');
};

// Run the tests when the script is executed
runTests();