import React, { useState, useEffect, useRef } from 'react';

/**
 * BackgroundImage component
 * Handles background image display with transitions and effects
 */
const BackgroundImage = ({ 
  src, 
  alt = 'Background scene', 
  transitionSpeed = 1000,
  effect = 'none',
  brightness = 100,
  blur = 0,
  overlay = 'none'
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentSrc, setCurrentSrc] = useState('');
  const [previousSrc, setPreviousSrc] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const currentImageRef = useRef(null);
  const previousImageRef = useRef(null);
  
  // Handle image source changes with transitions
  useEffect(() => {
    if (!src) {
      setCurrentSrc('');
      setPreviousSrc('');
      setIsLoading(false);
      return;
    }
    
    if (src !== currentSrc && src !== '') {
      // If we already have an image, set up transition
      if (currentSrc) {
        setPreviousSrc(currentSrc);
        setIsTransitioning(true);
        
        // After transition completes, remove previous image
        setTimeout(() => {
          setIsTransitioning(false);
          setPreviousSrc('');
        }, transitionSpeed);
      }
      
      setCurrentSrc(src);
      setIsLoading(true);
    }
  }, [src, currentSrc, transitionSpeed]);
  
  // Handle image load completion
  const handleImageLoad = () => {
    setIsLoading(false);
  };
  
  // Apply visual effects based on props
  const getEffectStyles = () => {
    const styles = {};
    
    // Brightness adjustment
    if (brightness !== 100) {
      styles.filter = `${styles.filter || ''} brightness(${brightness}%)`;
    }
    
    // Blur effect
    if (blur > 0) {
      styles.filter = `${styles.filter || ''} blur(${blur}px)`;
    }
    
    return styles;
  };
  
  // Get overlay element based on overlay type
  const getOverlay = () => {
    switch (overlay) {
      case 'dark':
        return <div className="background-overlay dark"></div>;
      case 'light':
        return <div className="background-overlay light"></div>;
      case 'vignette':
        return <div className="background-overlay vignette"></div>;
      case 'rain':
        return <div className="background-overlay rain"></div>;
      case 'snow':
        return <div className="background-overlay snow"></div>;
      case 'fog':
        return <div className="background-overlay fog"></div>;
      default:
        return null;
    }
  };
  
  // Apply special effects
  const getEffectElement = () => {
    switch (effect) {
      case 'shake':
        return <div className="background-effect shake"></div>;
      case 'pulse':
        return <div className="background-effect pulse"></div>;
      case 'flicker':
        return <div className="background-effect flicker"></div>;
      default:
        return null;
    }
  };
  
  return (
    <div className="background-container">
      {/* Current background image */}
      {currentSrc && (
        <div 
          className={`background-image current ${isLoading ? 'loading' : 'loaded'} ${isTransitioning ? 'transitioning-in' : ''}`}
          style={getEffectStyles()}
        >
          <img 
            ref={currentImageRef}
            src={currentSrc} 
            alt={alt}
            onLoad={handleImageLoad}
          />
        </div>
      )}
      
      {/* Previous background image (for transitions) */}
      {previousSrc && isTransitioning && (
        <div className="background-image previous transitioning-out">
          <img 
            ref={previousImageRef}
            src={previousSrc} 
            alt={alt}
          />
        </div>
      )}
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="background-loading">
          <div className="loading-spinner"></div>
        </div>
      )}
      
      {/* Overlay effect */}
      {getOverlay()}
      
      {/* Special effect */}
      {getEffectElement()}
    </div>
  );
};

export default BackgroundImage;