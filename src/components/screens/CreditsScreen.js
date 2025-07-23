import React from 'react';
import { useGame } from '../../contexts/GameContext';

/**
 * CreditsScreen component
 * Displays credits and information about the game
 * Includes accessibility features for screen readers
 */
const CreditsScreen = () => {
  const game = useGame();
  
  return (
    <div 
      className="credits-screen"
      role="region"
      aria-label="크레딧"
    >
      <h1 id="credits-title">크레딧</h1>
      
      <div className="credits-section">
        <h2 id="game-info">비둘기밥의 밤 (Night of Pigeonweed)</h2>
        <p>Version 0.1.0 - Alpha</p>
      </div>
      
      <div className="credits-section">
        <h2 id="development-info">개발</h2>
        <p>Created with React, Firebase, and LLM technology</p>
      </div>
      
      <div className="credits-section">
        <h2 id="llm-info">LLM 통합</h2>
        <p>Powered by Groq API and Google Gemini API</p>
      </div>
      
      <div className="credits-section">
        <h2 id="audio-info">오디오</h2>
        <p>Sound effects and music created with Tone.js</p>
      </div>
      
      <div className="credits-section">
        <h2 id="thanks-info">특별 감사</h2>
        <p>To all the players who enjoy this experimental LLM-based sound novel</p>
      </div>
      
      <button 
        className="back-button" 
        onClick={() => game.setCurrentScreen('title')}
        aria-label="타이틀 화면으로 돌아가기"
      >
        타이틀로 돌아가기
      </button>
    </div>
  );
};

export default CreditsScreen;