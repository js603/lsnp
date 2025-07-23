import React, { useRef, useEffect, useState } from 'react';
import styled from 'styled-components';
import { useCanvasRenderer } from '../../services/canvas/canvasRenderer';
import llmService from '../../services/llm';

// Scene renderer component that integrates canvas with LLM
const SceneRenderer = ({ 
  sceneDescription, 
  characters = [], 
  mood = 'neutral',
  onRenderComplete = () => {},
  className
}) => {
  const canvasRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isRendering, setIsRendering] = useState(false);
  const renderer = useCanvasRenderer(canvasRef, dimensions.width, dimensions.height);
  
  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (canvasRef.current) {
        const { clientWidth, clientHeight } = canvasRef.current.parentElement;
        setDimensions({
          width: clientWidth,
          height: clientHeight
        });
      }
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
  
  // Render scene when description changes
  useEffect(() => {
    if (!sceneDescription || !renderer || dimensions.width === 0) return;
    
    const renderScene = async () => {
      setIsRendering(true);
      
      try {
        // Generate visual directives from scene description using LLM
        const visualDirectives = await generateVisualDirectives(sceneDescription, mood);
        
        // Render background based on directives
        renderer.drawBackgroundScene(sceneDescription, {
          palette: visualDirectives.palette,
          complexity: visualDirectives.complexity,
          mood: mood
        });
        
        // Render characters
        characters.forEach(character => {
          renderer.drawSilhouette(
            character.description,
            character.position,
            {
              size: character.size || 100,
              opacity: character.opacity || 0.8,
              color: character.color || '#000000'
            }
          );
        });
        
        // Apply any special effects
        if (visualDirectives.effects && visualDirectives.effects.length > 0) {
          for (const effect of visualDirectives.effects) {
            await renderer.drawEffect(effect.description, {
              intensity: effect.intensity || 0.5,
              duration: effect.duration || 2000,
              color: effect.color || '#ffffff'
            });
          }
        }
        
        onRenderComplete();
      } catch (error) {
        console.error('Error rendering scene:', error);
      } finally {
        setIsRendering(false);
      }
    };
    
    renderScene();
  }, [sceneDescription, characters, mood, dimensions, renderer, onRenderComplete]);
  
  return (
    <CanvasContainer className={className} isRendering={isRendering}>
      <canvas ref={canvasRef} />
      {isRendering && <LoadingIndicator />}
    </CanvasContainer>
  );
};

// Generate visual directives from scene description using LLM
const generateVisualDirectives = async (sceneDescription, mood) => {
  try {
    // Default values in case LLM fails
    const defaultDirectives = {
      palette: ['#1a1a2e', '#16213e', '#0f3460', '#e94560'],
      complexity: 0.5,
      effects: []
    };
    
    // Skip LLM call if description is too short
    if (!sceneDescription || sceneDescription.length < 10) {
      return defaultDirectives;
    }
    
    // Prompt for the LLM to generate visual directives
    const prompt = `
      Based on the following scene description, generate visual directives for rendering the scene.
      The mood of the scene is: ${mood}.
      
      Scene description: "${sceneDescription}"
      
      Respond with a JSON object containing:
      1. A color palette (array of 4 hex colors: sky, ground, middle, accent)
      2. Complexity value (0.0 to 1.0)
      3. Optional array of visual effects (each with description, intensity, duration, color)
      
      Example format:
      {
        "palette": ["#1a1a2e", "#16213e", "#0f3460", "#e94560"],
        "complexity": 0.7,
        "effects": [
          {
            "description": "flash",
            "intensity": 0.5,
            "duration": 2000,
            "color": "#ffffff"
          }
        ]
      }
    `;
    
    // Call LLM service
    const response = await llmService.generateStoryContent(prompt, {
      temperature: 0.3, // Lower temperature for more consistent results
      maxTokens: 256    // Small response size
    });
    
    // Parse JSON response
    try {
      // Find JSON object in response
      const jsonMatch = response.match(/\{[\s\S]*}/);
      if (jsonMatch) {
        const directives = JSON.parse(jsonMatch[0]);
        
        // Validate palette
        if (!directives.palette || !Array.isArray(directives.palette) || directives.palette.length < 4) {
          directives.palette = defaultDirectives.palette;
        }
        
        // Validate complexity
        if (typeof directives.complexity !== 'number' || directives.complexity < 0 || directives.complexity > 1) {
          directives.complexity = defaultDirectives.complexity;
        }
        
        // Validate effects
        if (!directives.effects || !Array.isArray(directives.effects)) {
          directives.effects = [];
        }
        
        return directives;
      }
    } catch (parseError) {
      console.error('Error parsing LLM response:', parseError);
    }
    
    // Return default directives if parsing fails
    return defaultDirectives;
  } catch (error) {
    console.error('Error generating visual directives:', error);
    return {
      palette: ['#1a1a2e', '#16213e', '#0f3460', '#e94560'],
      complexity: 0.5,
      effects: []
    };
  }
};

// Styled components
const CanvasContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  
  canvas {
    width: 100%;
    height: 100%;
    display: block;
  }
  
  opacity: ${props => props.isRendering ? 0.7 : 1};
  transition: opacity 0.5s ease;
`;

const LoadingIndicator = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 50px;
  height: 50px;
  border: 5px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #ffffff;
  animation: spin 1s ease-in-out infinite;
  
  @keyframes spin {
    to { transform: translate(-50%, -50%) rotate(360deg); }
  }
`;

export default SceneRenderer;