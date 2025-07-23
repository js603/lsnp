import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

/**
 * HomePage component
 * Landing page for the application
 */
const HomePage = () => {
  return (
    <HomeContainer>
      <Title>비둘기밥의 밤</Title>
      <Subtitle>LLM 기반 사운드 노벨 미스터리 게임</Subtitle>
      
      <Description>
        고립된 환경에서 펼쳐지는 미스터리와 서스펜스가 가득한 이야기를 경험하세요.
        당신의 선택이 이야기의 흐름을 바꾸고, 다양한 결말로 이어집니다.
      </Description>
      
      <ButtonContainer>
        <StartButton to="/game">게임 시작</StartButton>
        <SettingsButton to="/settings">설정</SettingsButton>
        <CreditsButton to="/credits">크레딧</CreditsButton>
      </ButtonContainer>
    </HomeContainer>
  );
};

// Styled components
const HomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  min-height: 80vh;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 3rem;
  margin-bottom: 0.5rem;
  color: #fff;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
`;

const Subtitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 2rem;
  color: #aaa;
  font-weight: 400;
`;

const Description = styled.p`
  max-width: 600px;
  margin-bottom: 3rem;
  line-height: 1.6;
  color: #ccc;
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 300px;
`;

const Button = styled(Link)`
  padding: 1rem;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 500;
  text-align: center;
  transition: all 0.3s ease;
`;

const StartButton = styled(Button)`
  background-color: #5c2a9d;
  color: white;
  
  &:hover {
    background-color: #7c3acd;
  }
`;

const SettingsButton = styled(Button)`
  background-color: #333;
  color: white;
  
  &:hover {
    background-color: #444;
  }
`;

const CreditsButton = styled(Button)`
  background-color: transparent;
  color: #ccc;
  border: 1px solid #444;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

export default HomePage;