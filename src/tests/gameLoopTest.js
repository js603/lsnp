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
  console.log('LLM 서비스 테스트 중...');

  try {
    // Test story generation
    const storyPrompt = llmService.fillPromptTemplate(
      llmService.PROMPT_TEMPLATES.GAME_START,
      { LOCATION: '마을' }
    );

    console.log('스토리 프롬프트:', storyPrompt);
    
    const storyContent = await llmService.generateStoryContent(storyPrompt);
    console.log('생성된 스토리 내용:', storyContent);

    if (!storyContent || storyContent.length < 50) {
      console.error('스토리 내용이 너무 짧거나 비어 있습니다');
      return false;
    }
    
    // 선택지 생성 테스트
    const choices = await llmService.generateChoices(storyContent);
    console.log('생성된 선택지:', choices);

    if (!choices || choices.length === 0) {
      console.error('생성된 선택지가 없습니다');
      return false;
    }

    console.log('LLM 서비스 테스트 통과!');
    return true;
  } catch (error) {
    console.error('LLM service test failed:', error);
    return false;
  }
};

// 오디오 서비스 테스트
const testAudioService = async () => {
  console.log('오디오 서비스 테스트 중...');

  try {
    // 오디오 초기화
    await soundEffects.audioManager.initialize();

    // 효과음 재생 테스트
    console.log('UI 클릭 사운드 재생 중...');
    soundEffects.playSfx('UI_CLICK');

    // 잠시 대기
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 배경 음악 재생 테스트
    console.log('메인 테마 재생 중...');
    soundEffects.playMusic('MAIN_THEME', { volume: -15 });

    // 잠시 대기
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 배경 음악 중지 테스트
    console.log('음악 중지 중...');
    soundEffects.stopMusic(1);

    console.log('오디오 서비스 테스트 통과!');
    return true;
  } catch (error) {
    console.error('Audio service test failed:', error);
    return false;
  }
};

// 게임 루프 테스트
const testGameLoop = async (gameContext) => {
  console.log('게임 루프 테스트 중...');

  try {
    if (!gameContext) {
      console.error('게임 컨텍스트를 사용할 수 없습니다');
      return false;
    }

    // 새 게임 시작 테스트
    console.log('새 게임 시작 중...');
    await gameContext.startNewGame();

    if (!gameContext.currentScene) {
      console.error('새 게임 시작 후 현재 장면이 없습니다');
      return false;
    }

    console.log('현재 장면:', gameContext.currentScene);
    
    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 선택지 선택 테스트
    if (gameContext.choices && gameContext.choices.length > 0) {
      console.log('첫 번째 선택지 선택:', gameContext.choices[0]);
      await gameContext.selectChoice(0);

      // 다음 장면 대기
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log('선택 후 새 장면:', gameContext.currentScene);
    } else {
      console.warn('선택할 수 있는 선택지가 없습니다');
    }

    console.log('게임 루프 테스트 통과!');
    return true;
  } catch (error) {
    console.error('Game loop test failed:', error);
    return false;
  }
};

// 모든 테스트 실행
export const runGameLoopTest = async (gameContext) => {
  console.log('게임 루프 테스트 실행 중...');

  const llmResult = await testLlmService();
  const audioResult = await testAudioService();
  const gameLoopResult = await testGameLoop(gameContext);

  console.log('테스트 결과:');
  console.log('- LLM 서비스:', llmResult ? '통과' : '실패');
  console.log('- 오디오 서비스:', audioResult ? '통과' : '실패');
  console.log('- 게임 루프:', gameLoopResult ? '통과' : '실패');

  const allPassed = llmResult && audioResult && gameLoopResult;
  console.log('전체 테스트 결과:', allPassed ? '통과' : '실패');
  
  return allPassed;
};

export default runGameLoopTest;