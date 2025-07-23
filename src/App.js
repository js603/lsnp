import React, { lazy, Suspense } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
  
  // Render the router with routes for each screen
  // Wrap with Suspense for lazy loading
  return (
    <Router>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/game" element={<GameScreen />} />
          <Route path="/settings" element={<SettingsScreen />} />
          <Route path="/credits" element={<CreditsScreen />} />
          <Route path="/auth" element={<AuthScreen />} />
          <Route path="/" element={<TitleScreen />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Router>
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
