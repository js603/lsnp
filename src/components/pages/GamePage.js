import React from 'react';
import GameContainer from '../game/GameContainer';
import styled from 'styled-components';

/**
 * GamePage component
 * Wrapper for the GameContainer component
 */
const GamePage = () => {
  return (
    <GamePageContainer>
      <GameContainer />
    </GamePageContainer>
  );
};

// Styled components
const GamePageContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;
  height: 100%;
  overflow: hidden;
`;

export default GamePage;