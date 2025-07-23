import React from 'react';
import styled from 'styled-components';

/**
 * CreditsPage component
 * Displays credits and acknowledgments for the game
 */
const CreditsPage = () => {
  return (
    <CreditsContainer>
      <Title>크레딧</Title>
      
      <Section>
        <SectionTitle>개발</SectionTitle>
        <CreditItem>
          <CreditRole>기획 및 개발</CreditRole>
          <CreditName>비둘기밥의 밤 개발팀</CreditName>
        </CreditItem>
      </Section>
      
      <Section>
        <SectionTitle>기술</SectionTitle>
        <CreditItem>
          <CreditRole>프론트엔드</CreditRole>
          <CreditName>React 18.2.0</CreditName>
        </CreditItem>
        <CreditItem>
          <CreditRole>백엔드/데이터베이스</CreditRole>
          <CreditName>Firebase</CreditName>
        </CreditItem>
        <CreditItem>
          <CreditRole>LLM API</CreditRole>
          <CreditName>Groq API (주 LLM)</CreditName>
          <CreditName>Gemini API (보조 LLM)</CreditName>
        </CreditItem>
        <CreditItem>
          <CreditRole>그래픽 렌더링</CreditRole>
          <CreditName>HTML Canvas</CreditName>
        </CreditItem>
        <CreditItem>
          <CreditRole>사운드</CreditRole>
          <CreditName>Web Audio API</CreditName>
        </CreditItem>
      </Section>
      
      <Section>
        <SectionTitle>영감</SectionTitle>
        <CreditItem>
          <CreditName>카마이타치의 밤 (Kamaitachi no Yoru)</CreditName>
          <CreditDescription>
            본 게임은 '카마이타치의 밤'에서 영감을 받아 제작되었습니다.
          </CreditDescription>
        </CreditItem>
      </Section>
      
      <Section>
        <SectionTitle>특별 감사</SectionTitle>
        <CreditItem>
          <CreditName>모든 테스터와 피드백을 제공해 주신 분들</CreditName>
        </CreditItem>
      </Section>
      
      <Copyright>
        © 2025 비둘기밥의 밤 - 모든 권리 보유
      </Copyright>
    </CreditsContainer>
  );
};

// Styled components
const CreditsContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  color: #ddd;
`;

const Title = styled.h2`
  font-size: 2rem;
  margin-bottom: 2rem;
  color: #fff;
  text-align: center;
`;

const Section = styled.div`
  margin-bottom: 2.5rem;
`;

const SectionTitle = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #aaa;
  border-bottom: 1px solid #333;
  padding-bottom: 0.5rem;
`;

const CreditItem = styled.div`
  margin-bottom: 1.5rem;
`;

const CreditRole = styled.div`
  font-size: 1rem;
  color: #888;
  margin-bottom: 0.25rem;
`;

const CreditName = styled.div`
  font-size: 1.1rem;
  color: #fff;
  margin-bottom: 0.25rem;
`;

const CreditDescription = styled.div`
  font-size: 0.9rem;
  color: #aaa;
  margin-top: 0.5rem;
  line-height: 1.5;
`;

const Copyright = styled.div`
  margin-top: 3rem;
  text-align: center;
  font-size: 0.9rem;
  color: #666;
`;

export default CreditsPage;