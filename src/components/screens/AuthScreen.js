import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useGame } from '../../contexts/GameContext';
import GameContainer from '../game/GameContainer';
import authService from '../../services/firebase/authService';
import soundEffects from '../../services/audio/soundEffects';

// Authentication screen component
const AuthScreen = () => {
  const game = useGame();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Play background music
  useEffect(() => {
    // Play title music if not already playing
    if (game.currentBgm !== 'MAIN_THEME') {
      soundEffects.playMusic('MAIN_THEME', { volume: -12 });
    }
    
    // Apply subtle atmospheric effect
    soundEffects.applyAtmosphericEffect(0.3);
    
    // Clean up
    return () => {
      soundEffects.applyAtmosphericEffect(0);
    };
  }, [game.currentBgm]);
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      if (isLogin) {
        // Login
        await authService.login(email, password);
        
        // Set player name from display name
        const user = authService.getCurrentUser();
        if (user && user.displayName) {
          game.setPlayerName(user.displayName);
        }
        
        // Return to title screen
        game.setCurrentScreen('title');
      } else {
        // Register
        await authService.register(email, password, displayName);
        
        // Set player name
        game.setPlayerName(displayName);
        
        // Return to title screen
        game.setCurrentScreen('title');
      }
      
      // Play success sound
      soundEffects.playSfx('UI_CLICK');
    } catch (error) {
      console.error('Authentication error:', error);
      setError(getErrorMessage(error));
      
      // Play error sound
      soundEffects.playSfx('UI_CHOICE_SELECT');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Get user-friendly error message
  const getErrorMessage = (error) => {
    const errorCode = error.code;
    
    switch (errorCode) {
      case 'auth/invalid-email':
        return '유효하지 않은 이메일 주소입니다.';
      case 'auth/user-disabled':
        return '이 계정은 비활성화되었습니다.';
      case 'auth/user-not-found':
        return '해당 이메일로 등록된 계정을 찾을 수 없습니다.';
      case 'auth/wrong-password':
        return '비밀번호가 올바르지 않습니다.';
      case 'auth/email-already-in-use':
        return '이미 사용 중인 이메일입니다.';
      case 'auth/weak-password':
        return '비밀번호가 너무 약합니다. 최소 6자 이상 사용해주세요.';
      default:
        return '오류가 발생했습니다. 다시 시도해주세요.';
    }
  };
  
  // Toggle between login and register forms
  const toggleForm = () => {
    setIsLogin(!isLogin);
    setError('');
    soundEffects.playSfx('UI_CLICK');
  };
  
  return (
    <GameContainer backgroundImage="/assets/images/title_bg.jpg">
      <AuthContainer>
        <Title>{isLogin ? '로그인' : '회원가입'}</Title>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        <AuthForm onSubmit={handleSubmit}>
          <FormField>
            <FormLabel>이메일</FormLabel>
            <FormInput
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </FormField>
          
          <FormField>
            <FormLabel>비밀번호</FormLabel>
            <FormInput
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </FormField>
          
          {!isLogin && (
            <FormField>
              <FormLabel>닉네임</FormLabel>
              <FormInput
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                disabled={isLoading}
                maxLength={20}
              />
            </FormField>
          )}
          
          <FormButton type="submit" disabled={isLoading}>
            {isLoading ? '처리 중...' : isLogin ? '로그인' : '회원가입'}
          </FormButton>
        </AuthForm>
        
        <ToggleFormText>
          {isLogin ? "계정이 없으신가요?" : "이미 계정이 있으신가요?"}
          <ToggleFormButton type="button" onClick={toggleForm} disabled={isLoading}>
            {isLogin ? '회원가입' : '로그인'}
          </ToggleFormButton>
        </ToggleFormText>
        
        <BackButton onClick={() => game.setCurrentScreen('title')} disabled={isLoading}>
          메인으로 돌아가기
        </BackButton>
      </AuthContainer>
    </GameContainer>
  );
};

// Styled components
const AuthContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 2rem;
  background-color: rgba(0, 0, 0, 0.7);
  color: #ffffff;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 2rem;
  text-shadow: 0 0 10px rgba(0, 0, 0, 0.8);
  font-family: 'Noto Serif', serif;
  letter-spacing: 2px;
`;

const ErrorMessage = styled.div`
  background-color: rgba(255, 0, 0, 0.2);
  border: 1px solid rgba(255, 0, 0, 0.5);
  color: #ff6666;
  padding: 0.75rem 1rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
  width: 100%;
  max-width: 300px;
  text-align: center;
`;

const AuthForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  max-width: 300px;
  margin-bottom: 1.5rem;
`;

const FormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const FormLabel = styled.label`
  font-size: 1rem;
`;

const FormInput = styled.input`
  background-color: rgba(0, 0, 0, 0.6);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  padding: 0.75rem;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.6);
    box-shadow: 0 0 8px rgba(255, 255, 255, 0.3);
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const FormButton = styled.button`
  background-color: rgba(0, 0, 0, 0.6);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  padding: 0.75rem;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 0.5rem;
  
  &:hover:not(:disabled) {
    background-color: rgba(40, 40, 40, 0.8);
    border-color: rgba(255, 255, 255, 0.6);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const ToggleFormText = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
  font-size: 0.9rem;
`;

const ToggleFormButton = styled.button`
  background: none;
  border: none;
  color: #66aaff;
  cursor: pointer;
  font-size: 0.9rem;
  text-decoration: underline;
  padding: 0;
  
  &:hover:not(:disabled) {
    color: #99ccff;
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const BackButton = styled.button`
  background-color: rgba(0, 0, 0, 0.4);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background-color: rgba(40, 40, 40, 0.6);
    border-color: rgba(255, 255, 255, 0.4);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

export default AuthScreen;