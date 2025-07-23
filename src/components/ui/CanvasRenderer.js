import React, { useRef, useEffect, useState } from 'react';
import styled from 'styled-components';

/**
 * CanvasRenderer component
 * Handles dynamic graphics rendering based on LLM instructions
 * 
 * @param {Object} props
 * @param {string} props.instructions - LLM-generated instructions for rendering
 * @param {number} props.width - Canvas width
 * @param {number} props.height - Canvas height
 * @param {string} props.backgroundColor - Background color for the canvas
 * @param {boolean} props.animate - Whether to animate the rendering
 * @param {function} props.onRenderComplete - Callback when rendering is complete
 */
const CanvasRenderer = ({ 
  instructions = '',
  width = 800,
  height = 600,
  backgroundColor = '#111111',
  animate = true,
  onRenderComplete = () => {}
}) => {
  const canvasRef = useRef(null);
  const [isRendering, setIsRendering] = useState(false);
  const [renderComplete, setRenderComplete] = useState(false);
  
  // Parse and execute LLM instructions for rendering
  useEffect(() => {
    if (!instructions || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Reset canvas
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);
    
    // Start rendering
    setIsRendering(true);
    setRenderComplete(false);
    
    // Parse instructions and render
    const renderInstructions = async () => {
      try {
        // Split instructions into commands
        const commands = parseInstructions(instructions);
        
        // Execute each command with optional animation delay
        for (let i = 0; i < commands.length; i++) {
          const command = commands[i];
          executeCommand(ctx, command);
          
          // Add delay between commands if animation is enabled
          if (animate && i < commands.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 50));
          }
        }
        
        // Rendering complete
        setIsRendering(false);
        setRenderComplete(true);
        onRenderComplete();
      } catch (error) {
        console.error('Error rendering canvas instructions:', error);
        setIsRendering(false);
      }
    };
    
    renderInstructions();
  }, [instructions, width, height, backgroundColor, animate, onRenderComplete]);
  
  // Parse LLM instructions into executable commands
  const parseInstructions = (instructionsText) => {
    // Split by lines and filter out empty lines
    const lines = instructionsText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    
    // Parse each line into a command object
    return lines.map(line => {
      // Check for command type
      if (line.startsWith('draw:')) {
        return parseDrawCommand(line.substring(5).trim());
      } else if (line.startsWith('text:')) {
        return parseTextCommand(line.substring(5).trim());
      } else if (line.startsWith('image:')) {
        return parseImageCommand(line.substring(6).trim());
      } else if (line.startsWith('clear')) {
        return { type: 'clear' };
      } else {
        // Default to treating as draw command
        return parseDrawCommand(line);
      }
    });
  };
  
  // Parse draw commands (shapes, lines, etc.)
  const parseDrawCommand = (command) => {
    // Rectangle: rect x y width height color
    if (command.startsWith('rect')) {
      const parts = command.substring(4).trim().split(' ');
      return {
        type: 'rect',
        x: parseFloat(parts[0]) || 0,
        y: parseFloat(parts[1]) || 0,
        width: parseFloat(parts[2]) || 100,
        height: parseFloat(parts[3]) || 100,
        color: parts[4] || '#ffffff'
      };
    }
    
    // Circle: circle x y radius color
    if (command.startsWith('circle')) {
      const parts = command.substring(6).trim().split(' ');
      return {
        type: 'circle',
        x: parseFloat(parts[0]) || 0,
        y: parseFloat(parts[1]) || 0,
        radius: parseFloat(parts[2]) || 50,
        color: parts[3] || '#ffffff'
      };
    }
    
    // Line: line x1 y1 x2 y2 color width
    if (command.startsWith('line')) {
      const parts = command.substring(4).trim().split(' ');
      return {
        type: 'line',
        x1: parseFloat(parts[0]) || 0,
        y1: parseFloat(parts[1]) || 0,
        x2: parseFloat(parts[2]) || 100,
        y2: parseFloat(parts[3]) || 100,
        color: parts[4] || '#ffffff',
        width: parseFloat(parts[5]) || 1
      };
    }
    
    // Default to a simple point
    return {
      type: 'point',
      x: 0,
      y: 0,
      color: '#ffffff'
    };
  };
  
  // Parse text commands
  const parseTextCommand = (command) => {
    // Extract text content (everything after the first space)
    const firstSpaceIndex = command.indexOf(' ');
    if (firstSpaceIndex === -1) return { type: 'text', text: command, x: 10, y: 30, color: '#ffffff', size: 16 };
    
    // Check for position and styling parameters
    const params = command.substring(0, firstSpaceIndex).split(',');
    const text = command.substring(firstSpaceIndex + 1);
    
    return {
      type: 'text',
      text: text,
      x: parseFloat(params[0]) || 10,
      y: parseFloat(params[1]) || 30,
      color: params[2] || '#ffffff',
      size: parseFloat(params[3]) || 16
    };
  };
  
  // Parse image commands
  const parseImageCommand = (command) => {
    // Format: image: url x y width height
    const parts = command.split(' ');
    return {
      type: 'image',
      url: parts[0],
      x: parseFloat(parts[1]) || 0,
      y: parseFloat(parts[2]) || 0,
      width: parseFloat(parts[3]) || 100,
      height: parseFloat(parts[4]) || 100
    };
  };
  
  // Execute a single rendering command
  const executeCommand = (ctx, command) => {
    switch (command.type) {
      case 'rect':
        ctx.fillStyle = command.color;
        ctx.fillRect(command.x, command.y, command.width, command.height);
        break;
        
      case 'circle':
        ctx.beginPath();
        ctx.arc(command.x, command.y, command.radius, 0, Math.PI * 2);
        ctx.fillStyle = command.color;
        ctx.fill();
        break;
        
      case 'line':
        ctx.beginPath();
        ctx.moveTo(command.x1, command.y1);
        ctx.lineTo(command.x2, command.y2);
        ctx.strokeStyle = command.color;
        ctx.lineWidth = command.width;
        ctx.stroke();
        break;
        
      case 'text':
        ctx.font = `${command.size}px Arial`;
        ctx.fillStyle = command.color;
        ctx.fillText(command.text, command.x, command.y);
        break;
        
      case 'image':
        // Load and draw image
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, command.x, command.y, command.width, command.height);
        };
        img.src = command.url;
        break;
        
      case 'clear':
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, width, height);
        break;
        
      default:
        console.warn('Unknown command type:', command.type);
    }
  };
  
  return (
    <CanvasContainer>
      <Canvas 
        ref={canvasRef} 
        width={width} 
        height={height}
        className={`${isRendering ? 'rendering' : ''} ${renderComplete ? 'complete' : ''}`}
      />
      {isRendering && (
        <RenderingIndicator>
          Rendering...
        </RenderingIndicator>
      )}
    </CanvasContainer>
  );
};

// Styled components
const CanvasContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
`;

const Canvas = styled.canvas`
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  
  &.rendering {
    opacity: 0.8;
  }
  
  &.complete {
    opacity: 1;
  }
  
  transition: opacity 0.3s ease;
`;

const RenderingIndicator = styled.div`
  position: absolute;
  bottom: 10px;
  right: 10px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 12px;
`;

export default CanvasRenderer;