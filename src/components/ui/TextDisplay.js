import React, { useState, useEffect, useRef } from 'react';

/**
 * TextDisplay component
 * Handles the display of text with typewriter effect and styling
 * Includes accessibility features for screen readers and keyboard navigation
 */
const TextDisplay = ({ text, speed = 30, onComplete }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const textRef = useRef(null);
  const timerRef = useRef(null);

  // Typewriter effect
  useEffect(() => {
    // Reset when text changes
    setDisplayedText('');
    setIsComplete(false);
    
    if (!text) return;
    
    let currentIndex = 0;
    
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // Start typewriter effect
    timerRef.current = setInterval(() => {
      if (isPaused) return;
      
      if (currentIndex < text.length) {
        setDisplayedText(prev => prev + text[currentIndex]);
        currentIndex++;
      } else {
        clearInterval(timerRef.current);
        setIsComplete(true);
        if (onComplete) onComplete();
      }
    }, speed);
    
    // Cleanup
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [text, speed, isPaused, onComplete]);

  // Handle click to speed up or complete text display
  const handleClick = () => {
    if (!isComplete) {
      // If not complete, show all text immediately
      clearInterval(timerRef.current);
      setDisplayedText(text);
      setIsComplete(true);
      if (onComplete) onComplete();
    } else {
      // If already complete, notify parent component (e.g., to show choices)
      if (onComplete) onComplete();
    }
  };

  // Handle keyboard events
  const handleKeyDown = (e) => {
    // Space or Enter to advance text
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleClick();
    }
    
    // 'P' key to toggle pause
    if (e.key === 'p' || e.key === 'P') {
      e.preventDefault();
      togglePause();
    }
  };

  // Toggle pause
  const togglePause = () => {
    setIsPaused(prev => !prev);
  };

  return (
    <div 
      className="text-display"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      ref={textRef}
      tabIndex={0}
      role="region"
      aria-label="게임 텍스트"
      aria-live="polite"
    >
      <p className="novel-text">
        {displayedText}
        {!isComplete && <span className="text-cursor" aria-hidden="true">_</span>}
      </p>
      
      {/* Optional controls */}
      <div className="text-controls" aria-label="텍스트 컨트롤">
        <button 
          className="text-control-button"
          onClick={(e) => {
            e.stopPropagation();
            togglePause();
          }}
          aria-label={isPaused ? "텍스트 재생" : "텍스트 일시 정지"}
          aria-pressed={isPaused}
        >
          {isPaused ? '▶️' : '⏸️'}
        </button>
      </div>
    </div>
  );
};

export default TextDisplay;