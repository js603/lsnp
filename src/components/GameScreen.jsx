import React, { useState, useEffect, useRef, useCallback } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import BattlePopup from './BattlePopup';
import InventoryPopup from './InventoryPopup';
import QuestPopup from './QuestPopup';
import SkillPopup from './SkillPopup';

function GameScreen({
  db, user, setGameState, addGameLog, gameLog,
  callGeminiAPI, callGroqAPI,
  setLoading, setMessage, loading, message,
  allGameData // App.jsx에서 모든 게임 데이터를 받음
}) {
  const [currentCharData, setCurrentCharData] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  
  const [showBattlePopup, setShowBattlePopup] = useState(false);
  const [battleMonsterId, setBattleMonsterId] = useState(null);
  const [showInventoryPopup, setShowInventoryPopup] = useState(false);
  const [showQuestPopup, setShowQuestPopup] = useState(false);
  const [showSkillPopup, setShowSkillPopup] = useState(false);

  const { skills, quests, items, regions, classes, monsters } = allGameData;

  const logEndRef = useRef(null);
  const initialLogShown = useRef(false);

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [gameLog]);

  // 현재 캐릭터 데이터 로드
  useEffect(() => {
    const loadCurrentCharacter = async () => {
      if (user && user.currentCharacter && db && regions.length > 0) { // regions 데이터가 로드된 후 실행
        setLoading(true);
        try {
          const charDoc = await getDoc(doc(db, 'characters', user.currentCharacter));
          if (charDoc.exists()) {
            const charData = charDoc.data();
            setCurrentCharData(charData);

            const locationData = regions.find(r => r.id === charData.location);
            if (locationData && !initialLogShown.current) {
              setCurrentLocation(locationData);
              addGameLog(`[위치] ${locationData.name}에 있습니다.`);
              addGameLog(`[정보] ${locationData.description}`);
              initialLogShown.current = true;
            }
          } else {
            setMessage('캐릭터 정보를 찾을 수 없습니다.');
            setGameState('character');
          }
        } catch (error) {
          console.error('Character loading error:', error);
          setMessage('캐릭터 로드 오류: ' + error.message);
        } finally {
          setLoading(false);
        }
      }
    };
    loadCurrentCharacter();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, db, setGameState, regions]); // regions를 의존성 배열에 추가

  const updateCharacterState = useCallback((updatedCharData) => {
    setCurrentCharData(updatedCharData);
  }, []);

  const handleBattleClose = useCallback(() => setShowBattlePopup(false), []);
  const handleInventoryClose = useCallback(() => setShowInventoryPopup(false), []);
  const handleQuestClose = useCallback(() => setShowQuestPopup(false), []);
  const handleSkillClose = useCallback(() => setShowSkillPopup(false), []);

  const handleAction = useCallback(async (actionType) => {
    if (!currentCharData || loading) return;
    const anyPopupOpen = showBattlePopup || showInventoryPopup || showQuestPopup || showSkillPopup;
    if (anyPopupOpen) return;

    switch (actionType) {
      case '탐색':
        setLoading(true);
        addGameLog('[탐색] 주변을 탐색하기 시작합니다...');
        const explorePrompt = `
          ${currentCharData.name}(이)가 ${currentLocation.name} 지역을 탐색합니다.
          이 지역의 환경과 발견한 것들을 5~7문장으로 판타지 소설처럼 생생하게 묘사해주세요.
          몬스터, 아이템, 또는 특별한 장소 발견 등 다양한 가능성을 포함해주세요.
        `;
        const exploreResult = await callGeminiAPI(explorePrompt);
        addGameLog(`[탐색 결과] ${exploreResult}`);

        const eventRoll = Math.random();
        if (eventRoll < 0.5 && currentLocation.monsters?.length > 0) {
          addGameLog('[발견] 탐색 중 몬스터와 마주쳤습니다!');
          const monsterId = currentLocation.monsters[Math.floor(Math.random() * currentLocation.monsters.length)];
          setBattleMonsterId(monsterId);
          setShowBattlePopup(true);
        } else if (eventRoll < 0.8 && currentLocation.resources?.length > 0) {
            const resourceId = currentLocation.resources[Math.floor(Math.random() * currentLocation.resources.length)];
            const resourceData = items.find(item => item.id === resourceId);
            if (resourceData) {
                const quantity = Math.floor(Math.random() * 3) + 1;
                const updatedChar = { ...currentCharData };
                updatedChar.inventory = updatedChar.inventory || [];
                let itemAdded = false;

                if (resourceData.stackable) {
                    const existingItem = updatedChar.inventory.find(i => i.id === resourceId);
                    if (existingItem) {
                        existingItem.quantity += quantity;
                        itemAdded = true;
                    }
                }

                if (!itemAdded) {
                    updatedChar.inventory.push({ ...resourceData, quantity });
                }

                const itemPrompt = `${currentCharData.name}이(가) 탐색 중에 ${resourceData.name} ${quantity}개를 발견하고 획득하는 장면을 2~3문장으로 묘사해주세요.`;
                const itemDescription = await callGeminiAPI(itemPrompt);
                addGameLog(`[발견] ${itemDescription}`);
                addGameLog(`[획득] ${resourceData.name} ${quantity}개를 획득했습니다!`);

                setCurrentCharData(updatedChar);
                await setDoc(doc(db, 'characters', currentCharData.id), updatedChar);
            }
        } else {
          addGameLog('[탐색] 특별한 것을 발견하지 못했습니다.');
        }
        setLoading(false);
        break;

      case '사냥':
        if (currentLocation?.monsters?.length > 0) {
          const monsterId = currentLocation.monsters[Math.floor(Math.random() * currentLocation.monsters.length)];
          setBattleMonsterId(monsterId);
          setShowBattlePopup(true);
        } else {
          addGameLog('이 지역에는 사냥할 몬스터가 없습니다.');
        }
        break;

      case '인벤토리':
        setShowInventoryPopup(true);
        break;

      case '퀘스트':
        setShowQuestPopup(true);
        break;

      case '스킬':
        setShowSkillPopup(true);
        break;

      default:
        addGameLog(`'${actionType}' 액션은 아직 구현되지 않았습니다.`);
        break;
    }
  }, [currentCharData, loading, showBattlePopup, showInventoryPopup, showQuestPopup, showSkillPopup, currentLocation, items, db, addGameLog, callGeminiAPI, setLoading]);
  
  const handleTravel = useCallback(async (regionId) => {
    if (!currentCharData || !currentLocation || loading) return;

    try {
        setLoading(true);
        if (!currentLocation.connectedRegions.includes(regionId)) {
            addGameLog('해당 지역으로 직접 이동할 수 없습니다.');
            return;
        }
        const regionData = regions.find(r => r.id === regionId);
        if (!regionData) {
            addGameLog('지역 정보를 찾을 수 없습니다.');
            return;
        }
        if (regionData.level && regionData.level.min > currentCharData.level) {
            addGameLog(`레벨이 부족하여 해당 지역으로 이동할 수 없습니다. (필요 레벨: ${regionData.level.min})`);
            return;
        }

        const travelPrompt = `
            ${currentCharData.name}이(가) ${currentLocation.name}에서 ${regionData.name}(으)로 이동합니다.
            여행 과정과 도착 장면, 그리고 ${regionData.name}의 풍경을 5~7문장으로 생생하게 묘사해주세요.
        `;
        const travelDescription = await callGeminiAPI(travelPrompt);
        
        const updatedChar = { ...currentCharData, location: regionId };
        await setDoc(doc(db, 'characters', currentCharData.id), updatedChar);
        setCurrentCharData(updatedChar);
        setCurrentLocation(regionData);

        addGameLog(`[이동] ${travelDescription}`);
        addGameLog(`[도착] ${regionData.name}에 도착했습니다.`);

    } catch (error) {
        console.error('Travel error:', error);
        addGameLog('이동 중 오류가 발생했습니다: ' + error.message);
    } finally {
        setLoading(false);
    }
  }, [currentCharData, currentLocation, loading, db, regions, addGameLog, callGeminiAPI, setLoading]);

  const anyPopupOpen = showBattlePopup || showInventoryPopup || showQuestPopup || showSkillPopup;

  if (!currentCharData) {
      return (
        <div className="game-screen">
            <div className="initializing">
                <p>캐릭터 정보 로딩 중...</p>
                <div className="spinner"></div>
            </div>
        </div>
      )
  }

  return (
    <div className="game-screen">
      {showBattlePopup && (
        <BattlePopup 
          db={db}
          character={currentCharData}
          monsterId={battleMonsterId}
          onClose={handleBattleClose}
          updateCharacterState={updateCharacterState}
          addMainLog={addGameLog}
          callGeminiAPI={callGeminiAPI}
          callGroqAPI={callGroqAPI}
          allSkills={skills}
          allItems={items}
          allQuests={quests}
          allClasses={classes}
          allMonsters={monsters}
        />
      )}
      {showInventoryPopup && (
          <InventoryPopup
            db={db}
            character={currentCharData}
            onClose={handleInventoryClose}
            updateCharacterState={updateCharacterState}
            addMainLog={addGameLog}
            callGeminiAPI={callGeminiAPI}
            allItems={items}
          />
      )}
      {showQuestPopup && (
          <QuestPopup
              db={db}
              character={currentCharData}
              onClose={handleQuestClose}
              updateCharacterState={updateCharacterState}
              addMainLog={addGameLog}
              allQuests={quests}
              allItems={items}
              allMonsters={monsters}
          />
      )}
      {showSkillPopup && (
          <SkillPopup
              character={currentCharData}
              onClose={handleSkillClose}
              allSkills={skills}
          />
      )}

      <div className="main-game-container">
        <div className="left-panel">
            <h2>{currentCharData.name}의 모험</h2>
            <div className="game-info">
                <p>레벨: {currentCharData.level} | 직업: {currentCharData.class} | 골드: {currentCharData.gold}</p>
                <p>HP: {currentCharData.hp}/{currentCharData.maxHp} | MP: {currentCharData.mp}/{currentCharData.maxMp}</p>
                <p>경험치: {currentCharData.exp}/{currentCharData.expToNextLevel}</p>
                <p>위치: {currentLocation ? currentLocation.name : '알 수 없음'}</p>
            </div>
            <div className="game-actions">
                <button onClick={() => handleAction('탐색')} disabled={loading || anyPopupOpen}>탐색</button>
                <button onClick={() => handleAction('사냥')} disabled={loading || anyPopupOpen}>사냥</button>
                <button onClick={() => handleAction('휴식')} disabled={loading || anyPopupOpen}>휴식</button>
                <button onClick={() => handleAction('인벤토리')} disabled={loading || anyPopupOpen}>인벤토리</button>
                <button onClick={() => handleAction('퀘스트')} disabled={loading || anyPopupOpen}>퀘스트</button>
                <button onClick={() => handleAction('스킬')} disabled={loading || anyPopupOpen}>스킬</button>
                <div className="travel-actions">
                    <p><strong>이동:</strong></p>
                    {currentLocation?.connectedRegions?.map(regionId => {
                        const targetRegion = regions.find(r => r.id === regionId);
                        return targetRegion && (
                            <button key={regionId} onClick={() => handleTravel(regionId)} disabled={loading || anyPopupOpen}>
                            {targetRegion.name}으로
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>

        <div className="right-panel">
            <div className="game-log">
                {gameLog.map(log => (
                    <p key={log.id} className="log-entry">
                    <span className="log-timestamp">[{new Date(log.timestamp).toLocaleTimeString()}]</span> {log.message}
                    </p>
                ))}
                <div ref={logEndRef} />
            </div>
        </div>
      </div>
      
      <button className="to-char-select-btn" onClick={() => setGameState('character')} disabled={loading || anyPopupOpen}>
        캐릭터 선택 화면으로
      </button>
    </div>
  );
}

export default React.memo(GameScreen);