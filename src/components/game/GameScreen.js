import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useGame } from '../../contexts/GameContext';
import GameContainer from './GameContainer';
import TextDisplay from './TextDisplay';
import ChoiceSelection from './ChoiceSelection';
// SceneRenderer and CharacterSilhouette are still imported but won't render anything in text-only mode
import SceneRenderer from './SceneRenderer';
import CharacterSilhouette from '../ui/CharacterSilhouette';
import soundEffects from '../../services/audio/soundEffects';

// Main game screen component
const GameScreen = () => {
  const game = useGame();
  const [textDisplayComplete, setTextDisplayComplete] = useState(false);
  const [typingSound, setTypingSound] = useState(null);
  
  // Handle text display completion
  const handleTextDisplayComplete = () => {
    setTextDisplayComplete(true);
    
    // Stop typing sound if playing
    if (typingSound) {
      typingSound.stop();
      setTypingSound(null);
    }
  };
  
  // Handle choice selection
  const handleChoiceSelect = (choice, index) => {
    setTextDisplayComplete(false);
    game.selectChoice(index);
  };
  
  // Reset state when scene changes
  useEffect(() => {
    setTextDisplayComplete(false);
    
    // Dummy typing sound object
    if (game.currentScene) {
      setTypingSound({ stop: () => {} });
    }
    
    // Clean up
    return () => {
      if (typingSound) {
        typingSound.stop();
      }
    };
  }, [game.currentScene]);
  
  // If no current scene, show loading
  if (!game.currentScene) {
    return (
      <GameContainer>
        <LoadingContainer>
          <LoadingSpinner />
          <LoadingText>이야기 불러오는 중...</LoadingText>
        </LoadingContainer>
      </GameContainer>
    );
  }
  
  return (
    <GameContainer>
      {/* Scene renderer is kept for compatibility but doesn't render anything in text-only mode */}
      <SceneRenderer 
        sceneDescription={game.currentScene.content}
        characters={game.characters}
        mood={game.currentScene.mood}
      />
      
      {/* Character silhouettes are kept for compatibility but don't render anything in text-only mode */}
      {game.characters.map(character => (
        <CharacterSilhouette
          key={character.id}
          character={character}
          position={character.position}
          emotion={character.emotion || 'neutral'}
          size={character.size || 'medium'}
        />
      ))}
      
      {/* Game UI */}
      <GameUI>
        {/* Text display */}
        <TextDisplay
          text={game.currentScene.content}
          typingSpeed={game.settings.textSpeed}
          onComplete={handleTextDisplayComplete}
          instantDisplay={game.isLoading}
        />
        
        {/* Choice selection */}
        <ChoiceSelection
          choices={game.currentScene.choices}
          onSelect={handleChoiceSelect}
          visible={textDisplayComplete && !game.isLoading}
        />
      </GameUI>
      
      {/* Loading overlay */}
      {game.isLoading && (
        <LoadingOverlay>
          <LoadingSpinner />
        </LoadingOverlay>
      )}
      
      {/* Game controls */}
      <GameControls>
        <ControlButton onClick={() => game.setCurrentScreen('settings')}>
          설정
        </ControlButton>
        <ControlButton onClick={() => game.setCurrentScreen('title')}>
          메인 메뉴
        </ControlButton>
      </GameControls>
    </GameContainer>
  );
};

// Styled components
const GameUI = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 10;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #ffffff;
`;

const LoadingText = styled.div`
  margin-top: 1rem;
  font-size: 1.2rem;
  font-family: 'Noto Sans', sans-serif;
`;

const LoadingSpinner = styled.div`
  width: 50px;
  height: 50px;
  border: 5px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #ffffff;
  animation: spin 1s ease-in-out infinite;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
`;

const GameControls = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  gap: 0.5rem;
  z-index: 20;
`;

const ControlButton = styled.button`
  background-color: rgba(0, 0, 0, 0.7);
  color: #d0d0d0;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: rgba(40, 40, 40, 0.9);
    color: #ffffff;
    border-color: rgba(255, 255, 255, 0.5);
  }
`;

export default GameScreen;