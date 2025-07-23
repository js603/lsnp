import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

// Text display component with typewriter effect
const TextDisplay = ({ 
  text, 
  typingSpeed = 30, 
  onComplete = () => {}, 
  instantDisplay = false,
  className
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const textRef = useRef(null);
  const timerRef = useRef(null);
  const charIndexRef = useRef(0);

  // Reset when text changes
  useEffect(() => {
    charIndexRef.current = 0;
    setDisplayedText('');
    setIsComplete(false);
    
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // If instant display is requested, show the entire text immediately
    if (instantDisplay) {
      setDisplayedText(text);
      setIsComplete(true);
      onComplete();
      return;
    }

    // Start the typewriter effect
    timerRef.current = setInterval(() => {
      if (charIndexRef.current < text.length) {
        setDisplayedText(prev => prev + text[charIndexRef.current]);
        charIndexRef.current++;
      } else {
        clearInterval(timerRef.current);
        setIsComplete(true);
        onComplete();
      }
    }, typingSpeed);

    // Clean up on unmount or text change
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [text, typingSpeed, onComplete, instantDisplay]);

  // Handle click to display full text immediately
  const handleClick = () => {
    if (!isComplete) {
      clearInterval(timerRef.current);
      setDisplayedText(text);
      setIsComplete(true);
      onComplete();
    }
  };

  return (
    <TextContainer 
      ref={textRef} 
      onClick={handleClick} 
      className={className}
      isComplete={isComplete}
    >
      {displayedText}
      {!isComplete && <Cursor />}
    </TextContainer>
  );
};

// Styled components
const TextContainer = styled.div`
  background-color: rgba(0, 0, 0, 0.7);
  color: #f0f0f0;
  padding: 1.5rem;
  border-radius: 8px;
  font-size: 1.2rem;
  line-height: 1.6;
  max-width: 800px;
  width: 100%;
  min-height: 150px;
  margin-bottom: 2rem;
  cursor: ${props => props.isComplete ? 'default' : 'pointer'};
  position: relative;
  font-family: 'Noto Serif', serif;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  
  /* Add a subtle border */
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  /* Ensure proper text wrapping */
  white-space: pre-wrap;
  word-wrap: break-word;
`;

const Cursor = styled.span`
  display: inline-block;
  width: 0.6rem;
  height: 1.2rem;
  background-color: #f0f0f0;
  margin-left: 2px;
  animation: blink 1s infinite;
  vertical-align: middle;
  
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }
`;

export default TextDisplay;