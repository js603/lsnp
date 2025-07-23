import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

/**
 * SettingsPage component
 * Allows users to configure game settings
 */
const SettingsPage = () => {
  // Settings state
  const [settings, setSettings] = useState({
    textSpeed: 30, // ms per character
    bgmVolume: 70, // percentage
    sfxVolume: 80, // percentage
    autoSave: true,
    fullscreen: false,
    language: 'ko', // ko, en
  });

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('gameSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Save settings to localStorage when changed
  useEffect(() => {
    localStorage.setItem('gameSettings', JSON.stringify(settings));
  }, [settings]);

  // Handle setting changes
  const handleChange = (setting, value) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  // Handle checkbox changes
  const handleCheckboxChange = (setting) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  return (
    <SettingsContainer>
      <Title>설정</Title>
      
      <SettingsGroup>
        <SettingLabel>텍스트 속도</SettingLabel>
        <RangeContainer>
          <span>느림</span>
          <RangeInput 
            type="range" 
            min="10" 
            max="100" 
            value={settings.textSpeed} 
            onChange={(e) => handleChange('textSpeed', parseInt(e.target.value))}
          />
          <span>빠름</span>
        </RangeContainer>
        <SettingValue>{100 - settings.textSpeed}%</SettingValue>
      </SettingsGroup>
      
      <SettingsGroup>
        <SettingLabel>배경음악 볼륨</SettingLabel>
        <RangeContainer>
          <span>0%</span>
          <RangeInput 
            type="range" 
            min="0" 
            max="100" 
            value={settings.bgmVolume} 
            onChange={(e) => handleChange('bgmVolume', parseInt(e.target.value))}
          />
          <span>100%</span>
        </RangeContainer>
        <SettingValue>{settings.bgmVolume}%</SettingValue>
      </SettingsGroup>
      
      <SettingsGroup>
        <SettingLabel>효과음 볼륨</SettingLabel>
        <RangeContainer>
          <span>0%</span>
          <RangeInput 
            type="range" 
            min="0" 
            max="100" 
            value={settings.sfxVolume} 
            onChange={(e) => handleChange('sfxVolume', parseInt(e.target.value))}
          />
          <span>100%</span>
        </RangeContainer>
        <SettingValue>{settings.sfxVolume}%</SettingValue>
      </SettingsGroup>
      
      <SettingsGroup>
        <CheckboxContainer>
          <CheckboxInput 
            type="checkbox" 
            checked={settings.autoSave} 
            onChange={() => handleCheckboxChange('autoSave')}
            id="autoSave"
          />
          <CheckboxLabel htmlFor="autoSave">자동 저장</CheckboxLabel>
        </CheckboxContainer>
      </SettingsGroup>
      
      <SettingsGroup>
        <CheckboxContainer>
          <CheckboxInput 
            type="checkbox" 
            checked={settings.fullscreen} 
            onChange={() => handleCheckboxChange('fullscreen')}
            id="fullscreen"
          />
          <CheckboxLabel htmlFor="fullscreen">전체 화면</CheckboxLabel>
        </CheckboxContainer>
      </SettingsGroup>
      
      <SettingsGroup>
        <SettingLabel>언어</SettingLabel>
        <SelectInput 
          value={settings.language} 
          onChange={(e) => handleChange('language', e.target.value)}
        >
          <option value="ko">한국어</option>
          <option value="en">English</option>
        </SelectInput>
      </SettingsGroup>
      
      <ButtonContainer>
        <ResetButton onClick={() => {
          const defaultSettings = {
            textSpeed: 30,
            bgmVolume: 70,
            sfxVolume: 80,
            autoSave: true,
            fullscreen: false,
            language: 'ko',
          };
          setSettings(defaultSettings);
        }}>
          기본값으로 재설정
        </ResetButton>
      </ButtonContainer>
    </SettingsContainer>
  );
};

// Styled components
const SettingsContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
`;

const Title = styled.h2`
  font-size: 2rem;
  margin-bottom: 2rem;
  color: #fff;
  text-align: center;
`;

const SettingsGroup = styled.div`
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #333;
`;

const SettingLabel = styled.div`
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  color: #ddd;
`;

const SettingValue = styled.div`
  font-size: 0.9rem;
  color: #aaa;
  text-align: right;
`;

const RangeContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  color: #888;
  font-size: 0.8rem;
`;

const RangeInput = styled.input`
  flex: 1;
  height: 5px;
  -webkit-appearance: none;
  background: #333;
  border-radius: 5px;
  outline: none;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 15px;
    height: 15px;
    border-radius: 50%;
    background: #5c2a9d;
    cursor: pointer;
  }
  
  &::-moz-range-thumb {
    width: 15px;
    height: 15px;
    border-radius: 50%;
    background: #5c2a9d;
    cursor: pointer;
    border: none;
  }
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
`;

const CheckboxInput = styled.input`
  margin-right: 0.5rem;
  cursor: pointer;
`;

const CheckboxLabel = styled.label`
  color: #ddd;
  cursor: pointer;
`;

const SelectInput = styled.select`
  width: 100%;
  padding: 0.5rem;
  background-color: #222;
  color: #ddd;
  border: 1px solid #444;
  border-radius: 4px;
  outline: none;
  
  &:focus {
    border-color: #5c2a9d;
  }
`;

const ButtonContainer = styled.div`
  margin-top: 2rem;
  text-align: center;
`;

const ResetButton = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: #333;
  color: #ddd;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: #444;
  }
`;

export default SettingsPage;