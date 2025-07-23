import React from 'react';
import styled from 'styled-components';

// Simplified SceneRenderer component for text-only mode
// No actual rendering is performed
const SceneRenderer = ({ 
  sceneDescription, 
  characters = [], 
  mood = 'neutral',
  onRenderComplete = () => {},
  className
}) => {
  // Call onRenderComplete immediately since there's no rendering to wait for
  React.useEffect(() => {
    onRenderComplete();
  }, [onRenderComplete]);
  
  // Return an empty container
  return (
    <EmptyContainer className={className} />
  );
};

// Styled components
const EmptyContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
`;

export default SceneRenderer;