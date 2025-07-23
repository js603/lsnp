import React from 'react';

/**
 * CharacterSilhouette component - Text-only version
 * No visual elements are rendered in text-only mode
 */
const CharacterSilhouette = ({ 
  character, 
  position = 'center', 
  emotion = 'neutral',
  speaking = false,
  entering = false,
  exiting = false,
  size = 'medium'
}) => {
  // In text-only mode, we don't render any visual elements
  return null;
};

export default CharacterSilhouette;