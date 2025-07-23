import React, { useEffect, useRef } from 'react';

/**
 * CharacterSilhouette component
 * Renders character silhouettes to maximize player imagination
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
  const silhouetteRef = useRef(null);

  // Apply animations based on props
  useEffect(() => {
    if (!silhouetteRef.current) return;
    
    const element = silhouetteRef.current;
    
    // Reset classes
    element.className = 'character-silhouette';
    
    // Add position class
    element.classList.add(`position-${position}`);
    
    // Add emotion class
    element.classList.add(`emotion-${emotion}`);
    
    // Add size class
    element.classList.add(`size-${size}`);
    
    // Add animation classes
    if (speaking) element.classList.add('speaking');
    if (entering) element.classList.add('entering');
    if (exiting) element.classList.add('exiting');
    
  }, [position, emotion, speaking, entering, exiting, size]);

  // Get silhouette shape based on character type and emotion
  const getSilhouetteShape = () => {
    // Default silhouette is a basic human shape
    if (!character || !character.type) {
      return (
        <svg viewBox="0 0 100 200" className="silhouette-svg">
          <path d="M50,10 C65,10 75,25 75,40 C75,55 65,70 50,70 C35,70 25,55 25,40 C25,25 35,10 50,10 Z" />
          <path d="M30,75 C40,73 60,73 70,75 C75,75 80,80 80,85 L80,180 C80,190 75,195 70,195 L30,195 C25,195 20,190 20,180 L20,85 C20,80 25,75 30,75 Z" />
        </svg>
      );
    }

    // Return specific silhouette based on character type
    switch (character.type) {
      case 'adult-male':
        return (
          <svg viewBox="0 0 100 200" className="silhouette-svg">
            <path d="M50,10 C67,10 80,23 80,40 C80,57 67,70 50,70 C33,70 20,57 20,40 C20,23 33,10 50,10 Z" />
            <path d="M30,75 C40,73 60,73 70,75 C75,75 85,80 85,85 L85,180 C85,190 80,195 75,195 L25,195 C20,195 15,190 15,180 L15,85 C15,80 25,75 30,75 Z" />
          </svg>
        );
      
      case 'adult-female':
        return (
          <svg viewBox="0 0 100 200" className="silhouette-svg">
            <path d="M50,10 C65,10 75,25 75,40 C75,55 65,70 50,70 C35,70 25,55 25,40 C25,25 35,10 50,10 Z" />
            <path d="M30,75 C40,73 60,73 70,75 C80,80 85,100 90,130 C92,150 85,180 80,195 L20,195 C15,180 8,150 10,130 C15,100 20,80 30,75 Z" />
          </svg>
        );
      
      case 'child':
        return (
          <svg viewBox="0 0 100 200" className="silhouette-svg">
            <path d="M50,20 C62,20 70,32 70,45 C70,58 62,70 50,70 C38,70 30,58 30,45 C30,32 38,20 50,20 Z" />
            <path d="M35,75 C42,73 58,73 65,75 C70,75 75,80 75,85 L75,180 C75,190 70,195 65,195 L35,195 C30,195 25,190 25,180 L25,85 C25,80 30,75 35,75 Z" />
          </svg>
        );
        
      case 'elderly':
        return (
          <svg viewBox="0 0 100 200" className="silhouette-svg">
            <path d="M50,10 C65,10 75,25 75,40 C75,55 65,70 50,70 C35,70 25,55 25,40 C25,25 35,10 50,10 Z" />
            <path d="M40,75 C45,73 55,73 60,75 C65,75 70,80 70,85 C75,110 75,140 70,170 L70,180 C70,190 65,195 60,195 L40,195 C35,195 30,190 30,180 L30,170 C25,140 25,110 30,85 C30,80 35,75 40,75 Z" />
          </svg>
        );
        
      default:
        return (
          <svg viewBox="0 0 100 200" className="silhouette-svg">
            <path d="M50,10 C65,10 75,25 75,40 C75,55 65,70 50,70 C35,70 25,55 25,40 C25,25 35,10 50,10 Z" />
            <path d="M30,75 C40,73 60,73 70,75 C75,75 80,80 80,85 L80,180 C80,190 75,195 70,195 L30,195 C25,195 20,190 20,180 L20,85 C20,80 25,75 30,75 Z" />
          </svg>
        );
    }
  };

  // If no character, don't render anything
  if (!character) {
    return null;
  }

  return (
    <div 
      ref={silhouetteRef}
      className={`character-silhouette position-${position} emotion-${emotion} size-${size} ${speaking ? 'speaking' : ''} ${entering ? 'entering' : ''} ${exiting ? 'exiting' : ''}`}
      data-character-id={character.id}
      data-character-name={character.name}
      role="img"
      aria-label={`${character.name || '캐릭터'} ${speaking ? '말하는 중' : ''} ${emotion !== 'neutral' ? emotion : ''}`}
    >
      {getSilhouetteShape()}
      
      {/* Optional character name display */}
      {character.showName && (
        <div 
          className="character-name"
          aria-hidden="true" // Name is already included in the aria-label
        >
          {character.name}
        </div>
      )}
    </div>
  );
};

export default CharacterSilhouette;