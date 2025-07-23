import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useGame } from '../../contexts/GameContext';
import GameContainer from './GameContainer';
import TextDisplay from './TextDisplay';
import ChoiceSelection from './ChoiceSelection';
import SceneRenderer from './SceneRenderer';
import CharacterSilhouette from '../ui/CharacterSilhouette';
import soundEffects from '../../services/audio/soundEffects';

// Main game screen component
const GameScreen = () => {
  const game = useGame();
  const [textDisplayComplete, setTextDisplayComplete] = useState(false);
  const [sceneRenderComplete, setSceneRenderComplete] = useState(false);
  const [typingSound, setTypingSound] = useState(null);
  
  // Handle text display completion
  const handleTextDisplayComplete = () => {
    setTextDisplayComplete(true);
    
    // Stop typing sound if playing
    if (typingSound) {
      soundEffects.stopSfx('UI_TEXT_TYPING');
      setTypingSound(null);
    }
    
    // Play choice appear sound if there are choices
    if (game.currentScene?.choices?.length > 0) {
      soundEffects.playSfx('UI_CHOICE_APPEAR');
    }
  };
  
  // Handle scene render completion
  const handleSceneRenderComplete = () => {
    setSceneRenderComplete(true);
  };
  
  // Handle choice selection
  const handleChoiceSelect = (choice, index) => {
    setTextDisplayComplete(false);
    setSceneRenderComplete(false);
    game.selectChoice(index);
  };
  
  // Reset state when scene changes
  useEffect(() => {
    setTextDisplayComplete(false);
    setSceneRenderComplete(false);
    
    // Play typing sound
    if (game.currentScene) {
      const sound = soundEffects.playSfx('UI_TEXT_TYPING', { loop: true });
      setTypingSound(sound);
    }
    
    // Clean up
    return () => {
      if (typingSound) {
        soundEffects.stopSfx('UI_TEXT_TYPING');
      }
    };
  }, [game.currentScene]);
  
  // If no current scene, show loading
  if (!game.currentScene) {
    return (
      <GameContainer>
        <LoadingContainer>
          <LoadingSpinner />
          <LoadingText>Loading story...</LoadingText>
        </LoadingContainer>
      </GameContainer>
    );
  }
  
  return (
    <GameContainer>
      {/* Scene renderer for background */}
      <SceneRenderer 
        sceneDescription={game.currentScene.content}
        characters={game.characters}
        mood={game.currentScene.mood}
        onRenderComplete={handleSceneRenderComplete}
      />
      
      {/* Character silhouettes */}
      {game.characters.map(character => (
        <CharacterSilhouette
          key={character.id}
          position={character.position}
          emotion={character.emotion || 'neutral'}
          size={character.size || 'medium'}
          opacity={character.opacity || 0.8}
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
          Settings
        </ControlButton>
        <ControlButton onClick={() => game.setCurrentScreen('title')}>
          Main Menu
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