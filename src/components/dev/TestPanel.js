import React, { useState } from 'react';
import styled from 'styled-components';
import { runIntegrationTest } from '../../tests/integration.test';

/**
 * TestPanel component
 * Development tool for testing game components
 * This should only be included in development builds
 */
const TestPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [logMessages, setLogMessages] = useState([]);

  // Capture console logs
  const captureConsole = () => {
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;
    
    const capturedLogs = [];
    
    console.log = (...args) => {
      capturedLogs.push({ type: 'log', message: args.join(' ') });
      originalLog(...args);
    };
    
    console.error = (...args) => {
      capturedLogs.push({ type: 'error', message: args.join(' ') });
      originalError(...args);
    };
    
    console.warn = (...args) => {
      capturedLogs.push({ type: 'warn', message: args.join(' ') });
      originalWarn(...args);
    };
    
    return {
      getLogs: () => [...capturedLogs],
      restore: () => {
        console.log = originalLog;
        console.error = originalError;
        console.warn = originalWarn;
      }
    };
  };

  // Run integration tests
  const handleRunTests = async () => {
    setIsRunning(true);
    setTestResults(null);
    setLogMessages([]);
    
    const console = captureConsole();
    
    try {
      const results = await runIntegrationTest();
      setTestResults(results);
    } catch (error) {
      console.error('Test execution error:', error);
      setTestResults(false);
    } finally {
      setLogMessages(console.getLogs());
      console.restore();
      setIsRunning(false);
    }
  };

  // Toggle panel visibility
  const togglePanel = () => {
    setIsOpen(!isOpen);
  };

  return (
    <TestPanelContainer>
      <ToggleButton onClick={togglePanel}>
        {isOpen ? 'Hide Test Panel' : 'Show Test Panel'}
      </ToggleButton>
      
      {isOpen && (
        <PanelContent>
          <h2>개발자 테스트 패널</h2>
          <p>이 패널은 개발 중에만 사용되며 출시 버전에서는 제거됩니다.</p>
          
          <ButtonContainer>
            <RunButton 
              onClick={handleRunTests} 
              disabled={isRunning}
            >
              {isRunning ? '테스트 실행 중...' : '통합 테스트 실행'}
            </RunButton>
          </ButtonContainer>
          
          {testResults !== null && (
            <ResultsContainer success={testResults}>
              <h3>테스트 결과: {testResults ? '성공' : '실패'}</h3>
              {testResults ? (
                <p>모든 테스트가 성공적으로 완료되었습니다.</p>
              ) : (
                <p>일부 테스트가 실패했습니다. 아래 로그를 확인하세요.</p>
              )}
            </ResultsContainer>
          )}
          
          {logMessages.length > 0 && (
            <LogContainer>
              <h3>테스트 로그</h3>
              <LogList>
                {logMessages.map((log, index) => (
                  <LogItem key={index} type={log.type}>
                    {log.message}
                  </LogItem>
                ))}
              </LogList>
            </LogContainer>
          )}
        </PanelContent>
      )}
    </TestPanelContainer>
  );
};

// Styled components
const TestPanelContainer = styled.div`
  position: fixed;
  bottom: 0;
  right: 0;
  z-index: 9999;
  font-family: 'Courier New', monospace;
`;

const ToggleButton = styled.button`
  background-color: #333;
  color: #fff;
  border: none;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 12px;
  opacity: 0.7;
  
  &:hover {
    opacity: 1;
  }
`;

const PanelContent = styled.div`
  background-color: rgba(0, 0, 0, 0.9);
  color: #ddd;
  padding: 15px;
  width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  border-top: 1px solid #555;
  border-left: 1px solid #555;
  
  h2 {
    margin-top: 0;
    font-size: 18px;
    color: #fff;
  }
  
  h3 {
    font-size: 16px;
    margin-top: 15px;
    margin-bottom: 10px;
  }
  
  p {
    margin: 10px 0;
    font-size: 14px;
  }
`;

const ButtonContainer = styled.div`
  margin: 15px 0;
`;

const RunButton = styled.button`
  background-color: #2a6099;
  color: white;
  border: none;
  padding: 10px 15px;
  cursor: pointer;
  font-weight: bold;
  
  &:hover:not(:disabled) {
    background-color: #3a70a9;
  }
  
  &:disabled {
    background-color: #555;
    cursor: not-allowed;
  }
`;

const ResultsContainer = styled.div`
  background-color: ${props => props.success ? 'rgba(0, 100, 0, 0.2)' : 'rgba(100, 0, 0, 0.2)'};
  padding: 10px;
  border-radius: 4px;
  margin: 15px 0;
  
  h3 {
    color: ${props => props.success ? '#4caf50' : '#f44336'};
    margin-top: 0;
  }
`;

const LogContainer = styled.div`
  margin: 15px 0;
  border-top: 1px solid #444;
  padding-top: 10px;
`;

const LogList = styled.div`
  max-height: 300px;
  overflow-y: auto;
  background-color: #111;
  padding: 10px;
  border-radius: 4px;
  font-size: 12px;
`;

const LogItem = styled.div`
  margin: 5px 0;
  padding: 3px 0;
  color: ${props => {
    switch (props.type) {
      case 'error': return '#ff6b6b';
      case 'warn': return '#ffd166';
      default: return '#a3e7fc';
    }
  }};
  border-bottom: 1px solid #333;
  word-break: break-word;
`;

export default TestPanel;