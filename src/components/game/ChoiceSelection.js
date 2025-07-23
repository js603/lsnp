import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

// Choice selection component
const ChoiceSelection = ({ 
  choices = [], 
  onSelect, 
  visible = true,
  className
}) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [animationComplete, setAnimationComplete] = useState(false);

  // Reset animation state when choices change
  useEffect(() => {
    setAnimationComplete(false);
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, choices.length * 200); // Staggered animation timing

    return () => clearTimeout(timer);
  }, [choices]);

  // Handle choice selection
  const handleSelect = (choice, index) => {
    if (onSelect && animationComplete) {
      onSelect(choice, index);
    }
  };

  if (!visible || choices.length === 0) {
    return null;
  }

  return (
    <ChoicesContainer className={className}>
      {choices.map((choice, index) => (
        <ChoiceButton
          key={`choice-${index}`}
          onClick={() => handleSelect(choice, index)}
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
          isHovered={hoveredIndex === index}
          animationDelay={index * 0.2}
          animationComplete={animationComplete}
          disabled={!animationComplete}
        >
          {choice}
        </ChoiceButton>
      ))}
    </ChoicesContainer>
  );
};

// Styled components
const ChoicesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 800px;
  margin-bottom: 2rem;
`;

const ChoiceButton = styled.button`
  background-color: rgba(0, 0, 0, 0.7);
  color: ${props => props.isHovered ? '#ffffff' : '#d0d0d0'};
  border: 1px solid rgba(255, 255, 255, ${props => props.isHovered ? '0.3' : '0.1'});
  border-radius: 8px;
  padding: 1rem 1.5rem;
  font-size: 1.1rem;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Noto Sans', sans-serif;
  position: relative;
  overflow: hidden;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  opacity: ${props => props.animationComplete ? 1 : 0};
  transform: ${props => props.animationComplete ? 'translateY(0)' : 'translateY(20px)'};
  transition: opacity 0.3s ease, transform 0.3s ease, background-color 0.2s ease, color 0.2s ease, border 0.2s ease;
  transition-delay: ${props => props.animationDelay}s;
  
  &:hover, &:focus {
    background-color: rgba(40, 40, 40, 0.9);
    color: #ffffff;
    border-color: rgba(255, 255, 255, 0.5);
    outline: none;
  }
  
  &:active {
    transform: scale(0.98);
  }
  
  /* Add a subtle indicator for the choice */
  &::before {
    content: '•';
    position: absolute;
    left: 0.5rem;
    opacity: ${props => props.isHovered ? 1 : 0};
    transition: opacity 0.2s ease;
  }
  
  /* Disable button styling when animation is not complete */
  &:disabled {
    cursor: default;
    pointer-events: none;
  }
`;

export default ChoiceSelection;