import React, { lazy, Suspense } from 'react';
import { GameProvider, useGame } from './contexts/GameContext';
import { ErrorProvider } from './contexts/ErrorContext';
import ErrorDisplay from './components/ui/ErrorDisplay';
import './App.css';

// Lazy load screen components
const TitleScreen = lazy(() => import('./components/screens/TitleScreen'));
const GameScreen = lazy(() => import('./components/game/GameScreen'));
const AuthScreen = lazy(() => import('./components/screens/AuthScreen'));
const SettingsScreen = lazy(() => import('./components/screens/SettingsScreen'));
const CreditsScreen = lazy(() => import('./components/screens/CreditsScreen'));

// Loading component for Suspense fallback
const LoadingScreen = () => (
  <div className="loading-screen">
    <div className="loading-spinner"></div>
    <p>로딩 중...</p>
  </div>
);


// Main app content that uses the game context
const AppContent = () => {
  const game = useGame();
  
  // Show loading screen while initializing
  if (!game.isInitialized) {
    return (
      <div className="loading-screen" role="status" aria-live="polite">
        <div className="loading-spinner" aria-hidden="true"></div>
        <p>게임 초기화 중...</p>
      </div>
    );
  }
  
  // Render the appropriate screen based on current screen state
  // Wrap with Suspense for lazy loading
  return (
    <Suspense fallback={<LoadingScreen />}>
      {(() => {
        switch (game.currentScreen) {
          case 'game':
            return <GameScreen />;
          case 'settings':
            return <SettingsScreen />;
          case 'credits':
            return <CreditsScreen />;
          case 'auth':
            return <AuthScreen />;
          case 'title':
          default:
            return <TitleScreen />;
        }
      })()}
    </Suspense>
  );
};

// Main App component
function App() {
  return (
    <div className="App">
      <ErrorProvider>
        <GameProvider>
          <AppContent />
          <ErrorDisplay 
            onRetry={() => window.location.reload()}
            onContinue={(offline) => console.log('Continue in offline mode:', offline)}
            onNewGame={() => {
              const game = document.querySelector('.App').__reactFiber$?.return?.stateNode?.context?.startNewGame;
              if (game) game();
            }}
          />
        </GameProvider>
      </ErrorProvider>
    </div>
  );
}

export default App;