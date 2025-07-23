import React, { useEffect, useRef } from 'react';
import { useError } from '../../contexts/ErrorContext';

/**
 * ErrorDisplay component
 * Displays user-friendly error messages with recovery options
 * Implements accessibility features for screen readers
 */
const ErrorDisplay = ({ onRetry, onContinue, onNewGame }) => {
  const { 
    hasError, 
    errorType, 
    errorMessage, 
    isVisible, 
    recoveryOptions,
    clearError,
    hideError
  } = useError();
  
  const errorRef = useRef(null);
  
  // Focus the error dialog when it appears
  useEffect(() => {
    if (isVisible && errorRef.current) {
      errorRef.current.focus();
    }
  }, [isVisible]);
  
  // Handle escape key to close the error dialog
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      hideError();
    }
  };
  
  // Handle recovery option selection
  const handleRecoveryOption = (action) => {
    switch (action) {
      case 'retry':
        if (onRetry) onRetry();
        break;
      case 'continue':
        if (onContinue) onContinue();
        break;
      case 'offline':
        // Enable offline mode and continue
        if (onContinue) onContinue(true);
        break;
      case 'new_game':
        if (onNewGame) onNewGame();
        break;
      default:
        // Just clear the error
        break;
    }
    
    clearError();
  };
  
  // If no error or error is hidden, don't render anything
  if (!hasError || !isVisible) {
    return null;
  }
  
  return (
    <div 
      className="error-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="error-title"
      aria-describedby="error-message"
    >
      <div 
        className="error-dialog"
        ref={errorRef}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
      >
        <div className="error-header">
          <h2 id="error-title">오류 발생</h2>
          <button 
            className="close-button"
            onClick={hideError}
            aria-label="닫기"
          >
            ×
          </button>
        </div>
        
        <div className="error-content">
          <div className="error-icon">
            {getErrorIcon(errorType)}
          </div>
          
          <p id="error-message" className="error-message">
            {errorMessage}
          </p>
          
          <div className="recovery-options">
            {recoveryOptions.map((option, index) => (
              <button
                key={`${option.action}-${index}`}
                className="recovery-button"
                onClick={() => handleRecoveryOption(option.action)}
              >
                {option.label}
              </button>
            ))}
            
            {/* Always provide a close option */}
            {recoveryOptions.length === 0 && (
              <button
                className="recovery-button"
                onClick={clearError}
              >
                확인
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to get appropriate icon based on error type
const getErrorIcon = (errorType) => {
  switch (errorType) {
    case 'LLM_ERROR':
      return (
        <svg viewBox="0 0 24 24" width="48" height="48" aria-hidden="true">
          <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
        </svg>
      );
      
    case 'NETWORK_ERROR':
      return (
        <svg viewBox="0 0 24 24" width="48" height="48" aria-hidden="true">
          <path fill="currentColor" d="M19.35 10.04C18.67 6.59 15.64 4 12 4c-1.48 0-2.85.43-4.01 1.17l1.46 1.46C10.21 6.23 11.08 6 12 6c3.04 0 5.5 2.46 5.5 5.5v.5H19c1.66 0 3 1.34 3 3 0 1.13-.64 2.11-1.56 2.62l1.45 1.45C23.16 18.16 24 16.68 24 15c0-2.64-2.05-4.78-4.65-4.96zM3 5.27l2.75 2.74C2.56 8.15 0 10.77 0 14c0 3.31 2.69 6 6 6h11.73l2 2L21 20.73 4.27 4 3 5.27zM7.73 10l8 8H6c-2.21 0-4-1.79-4-4s1.79-4 4-4h1.73z" />
        </svg>
      );
      
    case 'AUDIO_ERROR':
      return (
        <svg viewBox="0 0 24 24" width="48" height="48" aria-hidden="true">
          <path fill="currentColor" d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
        </svg>
      );
      
    case 'SAVE_ERROR':
    case 'LOAD_ERROR':
      return (
        <svg viewBox="0 0 24 24" width="48" height="48" aria-hidden="true">
          <path fill="currentColor" d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z" />
          <path fill="currentColor" d="M12 18c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm1-8h-2V7h2v3z" />
        </svg>
      );
      
    case 'AUTH_ERROR':
      return (
        <svg viewBox="0 0 24 24" width="48" height="48" aria-hidden="true">
          <path fill="currentColor" d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
        </svg>
      );
      
    default:
      return (
        <svg viewBox="0 0 24 24" width="48" height="48" aria-hidden="true">
          <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
        </svg>
      );
  }
};

export default ErrorDisplay;