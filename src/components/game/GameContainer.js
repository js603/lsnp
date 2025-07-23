import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';

// Game container component - main interface for the game
const GameContainer = ({ children, backgroundImage }) => {
  const containerRef = useRef(null);

  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      // We keep the function for resize handling but don't store dimensions
      // since they're not used elsewhere in the component
    };

    // Initial dimensions
    updateDimensions();

    // Add event listener for window resize
    window.addEventListener('resize', updateDimensions);

    // Clean up
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  return (
    <Container ref={containerRef}>
      <BackgroundLayer backgroundImage={backgroundImage} />
      <ContentLayer>{children}</ContentLayer>
    </Container>
  );
};

// Styled components
const Container = styled.div`
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const BackgroundLayer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: ${props => props.backgroundImage ? `url(${props.backgroundImage})` : 'none'};
  background-size: cover;
  background-position: center;
  filter: brightness(0.7); /* Darken the background for better text readability */
  transition: background-image 1s ease-in-out;
  
  /* Fallback background if no image is provided */
  background-color: ${props => props.backgroundImage ? 'transparent' : '#121212'};
`;

const ContentLayer = styled.div`
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end; /* Position content at the bottom */
  align-items: center;
  padding: 2rem;
  box-sizing: border-box;
`;

export default GameContainer;