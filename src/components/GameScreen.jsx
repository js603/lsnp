import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import BattlePopup from './BattlePopup';
import InventoryPopup from './InventoryPopup';
import QuestPopup from './QuestPopup';
import SkillPopup from './SkillPopup';
import NpcPopup from './NpcPopup';
import MiningPopup from './MiningPopup';
import HerbalismPopup from './HerbalismPopup';
import FishingPopup from './FishingPopup';
import CookingPopup from './CookingPopup';
import CharacterStatusPopup from './CharacterStatusPopup';

function GameScreen({
  db, user, setGameState, addGameLog, gameLog,
  callGeminiAPI, callGroqAPI,
  setLoading, setMessage, loading, message,
  allGameData
}) {
  const [currentCharData, setCurrentCharData] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  
  const [showBattlePopup, setShowBattlePopup] = useState(false);
  const [battleMonsterId, setBattleMonsterId] = useState(null);
  const [showInventoryPopup, setShowInventoryPopup] = useState(false);
  const [showQuestPopup, setShowQuestPopup] = useState(false);
  const [showSkillPopup, setShowSkillPopup] = useState(false);
  const [showNpcPopup, setShowNpcPopup] = useState(false);
  const [showMiningPopup, setShowMiningPopup] = useState(false);
  const [showHerbalismPopup, setShowHerbalismPopup] = useState(false);
  const [showFishingPopup, setShowFishingPopup] = useState(false);
  const [showCookingPopup, setShowCookingPopup] = useState(false);
  const [showStatusPopup, setShowStatusPopup] = useState(false);

  const { skills, quests, items, regions, classes, monsters, npcs, recipes } = allGameData;

  const logEndRef = useRef(null);
  const initialLogShown = useRef(false);

  const calculatedStats = useMemo(() => {
    if (!currentCharData || !items) return null;

    const finalStats = { ...currentCharData.stats };
    finalStats.attack = Math.floor(finalStats.strength / 2);
    finalStats.defense = Math.floor(finalStats.vitality / 3);
    finalStats.magicPower = Math.floor(finalStats.intelligence / 2);

    if (currentCharData.equipment) {
        for (const slot in currentCharData.equipment) {
            const itemId = currentCharData.equipment[slot];
            if (itemId) {
                const itemData = items.find(i => i.id === itemId);
                if (itemData && itemData.stats) {
                    for (const stat in itemData.stats) {
                        finalStats[stat] = (finalStats[stat] || 0) + itemData.stats[stat];
                    }
                }
            }
        }
    }
    return finalStats;
  }, [currentCharData, items]);

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [gameLog]);

  useEffect(() => {
    const loadCurrentCharacter = async () => {
      if (user && user.currentCharacter && db && regions.length > 0) {
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
  }, [user, db, setGameState, regions]);

  const updateCharacterState = useCallback(async (updatedCharData) => {
    setCurrentCharData(updatedCharData);
    await setDoc(doc(db, 'characters', updatedCharData.id), updatedCharData);
  }, [db]);

  const handleBattleClose = useCallback(() => setShowBattlePopup(false), []);
  const handleInventoryClose = useCallback(() => setShowInventoryPopup(false), []);
  const handleQuestClose = useCallback(() => setShowQuestPopup(false), []);
  const handleSkillClose = useCallback(() => setShowSkillPopup(false), []);
  const handleNpcClose = useCallback(() => setShowNpcPopup(false), []);
  const handleMiningClose = useCallback(() => setShowMiningPopup(false), []);
  const handleHerbalismClose = useCallback(() => setShowHerbalismPopup(false), []);
  const handleFishingClose = useCallback(() => setShowFishingPopup(false), []);
  const handleCookingClose = useCallback(() => setShowCookingPopup(false), []);
  const handleStatusClose = useCallback(() => setShowStatusPopup(false), []);

  const handleAction = useCallback(async (actionType) => {
    if (!currentCharData || loading) return;
    const anyPopupOpen = showBattlePopup || showInventoryPopup || showQuestPopup || showSkillPopup || showNpcPopup || showMiningPopup || showHerbalismPopup || showFishingPopup || showCookingPopup || showStatusPopup;
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

                updateCharacterState(updatedChar);
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

      case '휴식':
        setLoading(true);
        addGameLog('[휴식] 안전한 곳을 찾아 휴식을 취합니다...');
        const restPrompt = `
            ${currentCharData.name}이(가) ${currentLocation.name}에서 잠시 휴식을 취합니다. 
            주변 풍경과 함께 HP와 MP가 완전히 회복되는 과정을 2~3문장으로 평화롭게 묘사해주세요.
        `;
        const restDescription = await callGeminiAPI(restPrompt);
        addGameLog(`[휴식 결과] ${restDescription}`);

        const restedChar = { 
            ...currentCharData, 
            hp: currentCharData.maxHp, 
            mp: currentCharData.maxMp 
        };
        updateCharacterState(restedChar);
        addGameLog('HP와 MP가 모두 회복되었습니다!');
        setLoading(false);
        break;

      case '채광':
        setShowMiningPopup(true);
        break;

      case '채집':
        setShowHerbalismPopup(true);
        break;

      case '낚시':
        setShowFishingPopup(true);
        break;

      case '요리':
        setShowCookingPopup(true);
        break;

      case '내 정보':
        setShowStatusPopup(true);
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

      case 'NPC 만나기':
        setShowNpcPopup(true);
        break;

      default:
        addGameLog(`'${actionType}' 액션은 아직 구현되지 않았습니다.`);
        break;
    }
  }, [currentCharData, loading, showBattlePopup, showInventoryPopup, showQuestPopup, showSkillPopup, showNpcPopup, showMiningPopup, showHerbalismPopup, showFishingPopup, showCookingPopup, showStatusPopup, currentLocation, items, addGameLog, callGeminiAPI, setLoading, updateCharacterState]);
  
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

  const handleAcceptQuest = useCallback(async (questToAccept) => {
    if (!currentCharData || !questToAccept) return;

    if (currentCharData.activeQuests.some(q => q.id === questToAccept.id)) {
        addGameLog(`이미 진행 중인 퀘스트입니다: "${questToAccept.title}"`);
        return;
    }

    const newActiveQuest = {
        id: questToAccept.id,
        objectives: questToAccept.objectives.map(obj => ({ ...obj, current: 0 }))
    };

    const updatedChar = {
        ...currentCharData,
        activeQuests: [...currentCharData.activeQuests, newActiveQuest]
    };

    try {
        setLoading(true);
        await updateCharacterState(updatedChar);
        addGameLog(`새로운 퀘스트를 시작합니다: "${questToAccept.title}"`);
    } catch (error) {
        console.error("Error accepting quest:", error);
        addGameLog("퀘스트 수락 중 오류가 발생했습니다.");
    } finally {
        setLoading(false);
        setShowNpcPopup(false);
    }
  }, [currentCharData, addGameLog, setLoading, updateCharacterState]);

  const handleCompleteQuest = useCallback(async (questToComplete) => {
    if (!currentCharData || !questToComplete) return;

    const activeQuest = currentCharData.activeQuests.find(q => q.id === questToComplete.id);
    if (!activeQuest || activeQuest.status !== 'ready_to_complete') {
        addGameLog('아직 이 퀘스트를 완료할 수 없습니다.');
        return;
    }

    let updatedChar = { ...currentCharData };
    const rewards = questToComplete.rewards;
    let rewardLogs = [];

    // 보상 지급
    if (rewards.exp) {
        updatedChar.exp += rewards.exp;
        rewardLogs.push(`경험치 ${rewards.exp}`);
    }
    if (rewards.gold) {
        updatedChar.gold += rewards.gold;
        rewardLogs.push(`골드 ${rewards.gold}`);
    }
    if (rewards.items) {
        rewards.items.forEach(rewardItem => {
            const itemData = items.find(i => i.id === rewardItem.id);
            if (itemData) {
                let itemAdded = false;
                if (itemData.stackable) {
                    const existingItem = updatedChar.inventory.find(i => i.id === rewardItem.id);
                    if (existingItem) {
                        existingItem.quantity += rewardItem.quantity;
                        itemAdded = true;
                    }
                }
                if (!itemAdded) {
                    updatedChar.inventory.push({ ...itemData, quantity: rewardItem.quantity });
                }
                rewardLogs.push(`${itemData.name} x${rewardItem.quantity}`);
            }
        });
    }

    // 퀘스트 상태 변경
    updatedChar.activeQuests = updatedChar.activeQuests.filter(q => q.id !== questToComplete.id);
    updatedChar.completedQuests = [...(updatedChar.completedQuests || []), questToComplete.id];

    try {
        setLoading(true);
        await updateCharacterState(updatedChar);
        addGameLog(`[퀘스트 완료] "${questToComplete.title}" 퀘스트를 완료했습니다!`);
        if (rewardLogs.length > 0) {
            addGameLog(`[보상] ${rewardLogs.join(', ')}을(를) 획득했습니다.`);
        }
    } catch (error) {
        console.error("Error completing quest:", error);
        addGameLog("퀘스트 완료 중 오류가 발생했습니다.");
    } finally {
        setLoading(false);
        setShowNpcPopup(false);
    }
  }, [currentCharData, items, addGameLog, setLoading, updateCharacterState]);

  const handleApplyStats = useCallback(async (newStats, remainingPoints) => {
    if (!currentCharData) return;

    const updatedChar = {
        ...currentCharData,
        stats: newStats,
        statPoints: remainingPoints,
        maxHp: Math.floor(newStats.vitality * 10),
        maxMp: Math.floor(newStats.intelligence * 5),
    };

    try {
        setLoading(true);
        await updateCharacterState(updatedChar);
        addGameLog('[정보] 능력치가 성공적으로 적용되었습니다.');
    } catch (error) {
        console.error("Error applying stats:", error);
        addGameLog("능력치 적용 중 오류가 발생했습니다.");
    } finally {
        setLoading(false);
        setShowStatusPopup(false);
    }
  }, [currentCharData, updateCharacterState, addGameLog, setLoading]);

  const anyPopupOpen = showBattlePopup || showInventoryPopup || showQuestPopup || showSkillPopup || showNpcPopup || showMiningPopup || showHerbalismPopup || showFishingPopup || showCookingPopup || showStatusPopup;

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

  const npcsInCurrentRegion = currentLocation ? npcs.filter(npc => npc.location === currentLocation.id) : [];

  return (
    <div className="game-screen">
      {showBattlePopup && (
        <BattlePopup 
          db={db}
          character={currentCharData}
          calculatedStats={calculatedStats}
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
      {showNpcPopup && (
          <NpcPopup
              character={currentCharData}
              onClose={handleNpcClose}
              npcsInRegion={npcsInCurrentRegion}
              allQuests={quests}
              onAcceptQuest={handleAcceptQuest}
              onCompleteQuest={handleCompleteQuest}
              addLog={addGameLog}
          />
      )}
      {showMiningPopup && (
          <MiningPopup
              character={currentCharData}
              onClose={handleMiningClose}
              updateCharacterState={updateCharacterState}
              addMainLog={addGameLog}
              location={currentLocation}
              allItems={items}
          />
      )}
      {showHerbalismPopup && (
          <HerbalismPopup
              character={currentCharData}
              onClose={handleHerbalismClose}
              updateCharacterState={updateCharacterState}
              addMainLog={addGameLog}
              location={currentLocation}
              allItems={items}
          />
      )}
      {showFishingPopup && (
          <FishingPopup
              character={currentCharData}
              onClose={handleFishingClose}
              updateCharacterState={updateCharacterState}
              addMainLog={addGameLog}
              location={currentLocation}
              allItems={items}
          />
      )}
      {showCookingPopup && (
          <CookingPopup
              character={currentCharData}
              onClose={handleCookingClose}
              updateCharacterState={updateCharacterState}
              addMainLog={addGameLog}
              allRecipes={recipes}
              allItems={items}
          />
      )}
      {showStatusPopup && (
          <CharacterStatusPopup
              character={currentCharData}
              calculatedStats={calculatedStats}
              onClose={handleStatusClose}
              onApplyStats={handleApplyStats}
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
                <button onClick={() => handleAction('내 정보')} disabled={loading || anyPopupOpen}>내 정보</button>
                <button onClick={() => handleAction('탐색')} disabled={loading || anyPopupOpen}>탐색</button>
                <button onClick={() => handleAction('사냥')} disabled={loading || anyPopupOpen}>사냥</button>
                <button onClick={() => handleAction('NPC 만나기')} disabled={loading || anyPopupOpen}>NPC 만나기</button>
                <button onClick={() => handleAction('휴식')} disabled={loading || anyPopupOpen}>휴식</button>
                <button onClick={() => handleAction('채광')} disabled={loading || anyPopupOpen}>채광</button>
                <button onClick={() => handleAction('채집')} disabled={loading || anyPopupOpen}>채집</button>
                <button onClick={() => handleAction('낚시')} disabled={loading || anyPopupOpen}>낚시</button>
                <button onClick={() => handleAction('요리')} disabled={loading || anyPopupOpen}>요리</button>
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