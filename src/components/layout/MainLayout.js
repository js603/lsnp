import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

/**
 * MainLayout component
 * Provides the main layout structure for the application
 */
const MainLayout = ({ children }) => {
  return (
    <LayoutContainer>
      <Header>
        <Title>비둘기밥의 밤</Title>
        <Nav>
          <NavLink to="/">홈</NavLink>
          <NavLink to="/game">게임</NavLink>
          <NavLink to="/settings">설정</NavLink>
          <NavLink to="/credits">크레딧</NavLink>
        </Nav>
      </Header>
      
      <Main>
        {children}
      </Main>
      
      <Footer>
        <p>© 2025 비둘기밥의 밤 - LLM 기반 사운드 노벨 미스터리 게임</p>
      </Footer>
    </LayoutContainer>
  );
};

// Styled components
const LayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #0a0a0a;
  color: #f0f0f0;
  font-family: 'Noto Sans KR', sans-serif;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #111;
  border-bottom: 1px solid #333;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #f0f0f0;
`;

const Nav = styled.nav`
  display: flex;
  gap: 1.5rem;
`;

const NavLink = styled(Link)`
  color: #ccc;
  text-decoration: none;
  font-size: 1rem;
  transition: color 0.3s ease;
  
  &:hover {
    color: #fff;
  }
`;

const Main = styled.main`
  flex: 1;
  padding: 0;
  display: flex;
  flex-direction: column;
`;

const Footer = styled.footer`
  padding: 1rem;
  text-align: center;
  font-size: 0.8rem;
  color: #777;
  background-color: #111;
  border-top: 1px solid #333;
`;

export default MainLayout;