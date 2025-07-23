import React from 'react';
import { useGame } from '../../contexts/GameContext';

/**
 * SettingsScreen component
 * Allows users to adjust game settings like volume, text speed, and auto-save
 */
const SettingsScreen = () => {
  const game = useGame();
  
  const handleVolumeChange = (type, value) => {
    game.updateSettings({
      volume: {
        ...game.settings.volume,
        [type]: parseFloat(value)
      }
    });
  };
  
  const handleTextSpeedChange = (value) => {
    game.updateSettings({
      textSpeed: parseInt(value)
    });
  };
  
  const handleAutoSaveChange = (e) => {
    game.updateSettings({
      autoSave: e.target.checked
    });
  };
  
  return (
    <div 
      className="settings-screen"
      role="region"
      aria-label="설정"
    >
      <h1 id="settings-title">설정</h1>
      
      <div className="settings-group">
        <h2 id="volume-settings">볼륨</h2>
        
        <div className="setting">
          <label htmlFor="master-volume">마스터 볼륨</label>
          <input 
            id="master-volume"
            type="range" 
            min="0" 
            max="1" 
            step="0.1" 
            value={game.settings.volume.master}
            onChange={(e) => handleVolumeChange('master', e.target.value)}
            aria-labelledby="volume-settings"
          />
          <span aria-live="polite">{Math.round(game.settings.volume.master * 100)}%</span>
        </div>
        
        <div className="setting">
          <label htmlFor="music-volume">음악 볼륨</label>
          <input 
            id="music-volume"
            type="range" 
            min="0" 
            max="1" 
            step="0.1" 
            value={game.settings.volume.bgm}
            onChange={(e) => handleVolumeChange('bgm', e.target.value)}
            aria-labelledby="volume-settings"
          />
          <span aria-live="polite">{Math.round(game.settings.volume.bgm * 100)}%</span>
        </div>
        
        <div className="setting">
          <label htmlFor="sfx-volume">효과음 볼륨</label>
          <input 
            id="sfx-volume"
            type="range" 
            min="0" 
            max="1" 
            step="0.1" 
            value={game.settings.volume.sfx}
            onChange={(e) => handleVolumeChange('sfx', e.target.value)}
            aria-labelledby="volume-settings"
          />
          <span aria-live="polite">{Math.round(game.settings.volume.sfx * 100)}%</span>
        </div>
      </div>
      
      <div className="settings-group">
        <h2 id="text-settings">텍스트</h2>
        
        <div className="setting">
          <label htmlFor="text-speed">텍스트 속도</label>
          <input 
            id="text-speed"
            type="range" 
            min="10" 
            max="50" 
            step="5" 
            value={game.settings.textSpeed}
            onChange={(e) => handleTextSpeedChange(e.target.value)}
            aria-labelledby="text-settings"
          />
          <span aria-live="polite">{game.settings.textSpeed}ms</span>
        </div>
      </div>
      
      <div className="settings-group">
        <h2 id="game-settings">게임</h2>
        
        <div className="setting checkbox">
          <label htmlFor="auto-save">
            <input 
              id="auto-save"
              type="checkbox" 
              checked={game.settings.autoSave}
              onChange={handleAutoSaveChange}
              aria-labelledby="game-settings"
            />
            자동 저장
          </label>
        </div>
      </div>
      
      <button 
        className="back-button" 
        onClick={() => game.setCurrentScreen('title')}
        aria-label="타이틀 화면으로 돌아가기"
      >
        타이틀로 돌아가기
      </button>
    </div>
  );
};

export default SettingsScreen;