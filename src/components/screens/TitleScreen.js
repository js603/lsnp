import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useGame } from '../../contexts/GameContext';
import GameContainer from '../game/GameContainer';

// Title screen component
const TitleScreen = () => {
  const game = useGame();
  const [showContinue, setShowContinue] = useState(false);
  const [nameInput, setNameInput] = useState(game.playerName || '');
  const [showNameInput, setShowNameInput] = useState(false);
  
  // Check if there's a saved game
  useEffect(() => {
    const savedGame = localStorage.getItem('pigeonweed_save');
    setShowContinue(!!savedGame);
    
    // 오디오 초기화 및 재생 코드 제거됨
  }, []);
  
  // Handle start new game
  const handleStartNewGame = () => {
    if (!nameInput.trim()) {
      setShowNameInput(true);
      return;
    }

    // 오디오 관련 코드 제거
    game.setPlayerName(nameInput);
    game.startNewGame();
  };
  
  // Handle continue game
  const handleContinueGame = () => {
    // 오디오 관련 코드 제거
    game.setCurrentScreen('game');
  };
  
  // Handle name input change
  const handleNameInputChange = (e) => {
    setNameInput(e.target.value);
  };
  
  // Handle name input submit
  const handleNameInputSubmit = (e) => {
    e.preventDefault();
    if (nameInput.trim()) {
      // 오디오 관련 코드 제거
      game.setPlayerName(nameInput);
      handleStartNewGame();
    }
  };
  
  return (
    <GameContainer>
      <TitleContainer>
        <Title>비둘기밥의 밤</Title>
        <Subtitle>비둘기밥의 밤</Subtitle>
        
        {showNameInput ? (
          <NameInputForm onSubmit={handleNameInputSubmit}>
            <NameInputLabel>이름을 입력하세요:</NameInputLabel>
            <NameInput
              type="text"
              value={nameInput}
              onChange={handleNameInputChange}
              autoFocus
              maxLength={20}
              placeholder="당신의 이름..."
            />
            <NameInputButton type="submit">시작</NameInputButton>
          </NameInputForm>
        ) : (
          <MenuContainer>
            <MenuButton onClick={handleStartNewGame}>새 게임</MenuButton>
            {showContinue && (
              <MenuButton onClick={handleContinueGame}>이어하기</MenuButton>
            )}
            <MenuButton onClick={() => {
              game.setCurrentScreen('auth');
            }}>로그인 / 회원가입</MenuButton>
            <MenuButton onClick={() => {
              game.setCurrentScreen('settings');
            }}>설정</MenuButton>
            <MenuButton onClick={() => {
              game.setCurrentScreen('credits');
            }}>제작진</MenuButton>
          </MenuContainer>
        )}
        
        <VersionInfo>v0.1.0 - 알파 버전</VersionInfo>
      </TitleContainer>
    </GameContainer>
  );
};

// Styled components
const TitleContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 2rem;
  background-color: rgba(0, 0, 0, 0.7);
  color: #ffffff;
`;

const Title = styled.h1`
  font-size: 4rem;
  margin-bottom: 0.5rem;
  text-shadow: 0 0 10px rgba(0, 0, 0, 0.8);
  font-family: 'Noto Serif', serif;
  letter-spacing: 2px;
`;

const Subtitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 3rem;
  opacity: 0.8;
  text-shadow: 0 0 5px rgba(0, 0, 0, 0.8);
  font-family: 'Noto Sans', sans-serif;
  font-weight: 300;
`;

const MenuContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 300px;
`;

const MenuButton = styled.button`
  background-color: rgba(0, 0, 0, 0.6);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  padding: 1rem;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: rgba(40, 40, 40, 0.8);
    border-color: rgba(255, 255, 255, 0.6);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }
`;

const NameInputForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 300px;
  margin-bottom: 2rem;
`;

const NameInputLabel = styled.label`
  font-size: 1.2rem;
  text-align: center;
`;

const NameInput = styled.input`
  background-color: rgba(0, 0, 0, 0.6);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  padding: 1rem;
  font-size: 1.2rem;
  
  &:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.6);
    box-shadow: 0 0 8px rgba(255, 255, 255, 0.3);
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const NameInputButton = styled(MenuButton)`
  margin-top: 1rem;
`;

const VersionInfo = styled.div`
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  font-size: 0.8rem;
  opacity: 0.5;
`;

export default TitleScreen;