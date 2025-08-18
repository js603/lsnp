import React, { useState, useEffect, useRef } from 'react';
import { doc, setDoc } from 'firebase/firestore';

function BattlePopup({ 
    db, 
    character, 
    calculatedStats, // GameScreen으로부터 계산된 최종 스탯을 받음
    monsterId, 
    onClose, 
    updateCharacterState, 
    callGeminiAPI, 
    callGroqAPI,
    addMainLog,
    allSkills,
    allItems,
    allQuests,
    allClasses,
    allMonsters
}) {
    const [battleLog, setBattleLog] = useState([]);
    const [monster, setMonster] = useState(null);
    const [player, setPlayer] = useState(JSON.parse(JSON.stringify(character)));
    const [battleState, setBattleState] = useState('active');
    const [actionCooldown, setActionCooldown] = useState(false);
    const logEndRef = useRef(null);
    const setupComplete = useRef(false);

    const addBattleLog = (message) => {
        const logEntry = { id: Date.now(), message, timestamp: new Date() };
        setBattleLog(prev => [...prev, logEntry]);
    };
    
    useEffect(() => {
        if (logEndRef.current) {
            logEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [battleLog]);

    useEffect(() => {
        if (setupComplete.current) return;

        const setupBattle = async () => {
            const monsterDataFromDb = allMonsters.find(m => m.id === monsterId);
            if (!monsterDataFromDb) {
                addBattleLog('오류: 몬스터 정보를 찾을 수 없습니다.');
                setTimeout(() => onClose(), 2000);
                return;
            }
            
            const monsterData = { ...monsterDataFromDb, currentHp: monsterDataFromDb.hp };
            setMonster(monsterData);

            const encounterPrompt = `
                ${player.name}(레벨 ${player.level})이(가) ${monsterData.name}을(를) 발견했습니다. 
                전투가 시작되는 장면을 3~5문장으로 생생하게 묘사해주세요.
            `;
            const encounterDescription = await callGeminiAPI(encounterPrompt);
            addBattleLog(`[전투 시작] ${encounterDescription}`);
        };

        setupBattle();
        setupComplete.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [monsterId]);

    const handleClose = (result) => {
        onClose(result);
    };

    const executeBattleAction = async (skillId = null) => {
        if (!monster || battleState !== 'active' || actionCooldown) return;
        setActionCooldown(true);

        try {
            let playerDamage = 0;
            let actionDescription = '';
            let updatedPlayer = { ...player };

            if (skillId) {
                const skillUsed = allSkills.find(s => s.id === skillId);
                if (!skillUsed || (updatedPlayer.mp < skillUsed.mpCost)) {
                    addBattleLog(skillUsed ? `MP가 부족하여 ${skillUsed.name}을(를) 사용할 수 없습니다.` : "알 수 없는 스킬입니다.");
                    setActionCooldown(false);
                    return;
                }

                updatedPlayer.mp -= skillUsed.mpCost;
                
                const baseDamage = Math.floor(Math.random() * (skillUsed.damage.max - skillUsed.damage.min + 1)) + skillUsed.damage.min;
                let statBonus = 0;
                if (skillUsed.damage.type === 'physical') {
                    statBonus = calculatedStats.attack || 0;
                } else {
                    statBonus = calculatedStats.magicPower || 0;
                }
                playerDamage = baseDamage + statBonus;

                const skillPrompt = `
                    ${player.name}(이)가 ${monster.name}에게 ${skillUsed.name} 스킬을 사용하는 장면과 ${playerDamage}의 데미지를 주는 과정을 3~5문장으로 짧고 임팩트 있게 묘사해주세요.
                `;
                actionDescription = await callGroqAPI(skillPrompt);
            } else { // Basic Attack
                playerDamage = Math.floor(Math.random() * 5) + (calculatedStats.attack || 3);
                const attackPrompt = `
                    ${player.name}(이)가 ${monster.name}에게 기본 공격으로 ${playerDamage}의 데미지를 입히는 장면을 2~3문장으로 묘사해주세요.
                `;
                actionDescription = await callGroqAPI(attackPrompt);
            }

            setPlayer(updatedPlayer);

            const updatedMonster = { ...monster, currentHp: Math.max(0, monster.currentHp - playerDamage) };
            setMonster(updatedMonster);

            addBattleLog(`[공격] ${actionDescription}`);
            addBattleLog(`[결과] ${monster.name}에게 ${playerDamage}의 데미지를 입혔습니다! (남은 HP: ${updatedMonster.currentHp}/${monster.hp})`);

            if (updatedMonster.currentHp <= 0) {
                await handleBattleVictory(updatedPlayer);
                return;
            }

            setTimeout(() => monsterCounterAttack(updatedMonster, updatedPlayer), 1500);

        } catch (error) {
            console.error('Battle action error:', error);
            addBattleLog('전투 액션 처리 중 오류가 발생했습니다.');
            setActionCooldown(false);
        }
    };

    const monsterCounterAttack = async (currentMonsterState, currentPlayerState) => {
        try {
            if (battleState !== 'active') return;

            const monsterDamage = Math.floor(Math.random() * 3) + currentMonsterState.attack;
            const defense = calculatedStats.defense || 0; // 계산된 최종 방어력 사용
            const reducedDamage = Math.max(1, monsterDamage - defense);
            const updatedPlayer = { ...currentPlayerState, hp: Math.max(0, currentPlayerState.hp - reducedDamage) };
            
            setPlayer(updatedPlayer);

            const counterPrompt = `
                ${currentMonsterState.name}이(가) ${currentPlayerState.name}에게 반격하여 ${reducedDamage}의 데미지를 입히는 장면을 2~3문장으로 묘사해주세요.
            `;
            const counterDescription = await callGroqAPI(counterPrompt);

            addBattleLog(`[반격] ${counterDescription}`);
            addBattleLog(`[결과] ${currentMonsterState.name}에게 ${reducedDamage}의 데미지를 받았습니다! (남은 HP: ${updatedPlayer.hp}/${updatedPlayer.maxHp})`);

            if (updatedPlayer.hp <= 0) {
                await handleBattleDefeat(updatedPlayer);
                return;
            }
            
            setActionCooldown(false);

        } catch (error) {
            console.error('Monster counter attack error:', error);
            addBattleLog('몬스터 반격 처리 중 오류가 발생했습니다.');
            setActionCooldown(false);
        }
    };

    const handleBattleVictory = async (finalPlayerState) => {
        setBattleState('victory');
        let updatedChar = { ...finalPlayerState };
    
        const expGained = monster.exp;
        const goldGained = Math.floor(Math.random() * (monster.level * 10)) + monster.level * 5;
    
        const victoryPrompt = `${player.name}이(가) ${monster.name}을(를) 쓰러뜨렸습니다! 전투 승리 장면과 ${player.name}의 기분을 3~5문장으로 생생하게 묘사해주세요.`;
        const victoryDescription = await callGeminiAPI(victoryPrompt);
        addBattleLog(`[승리] ${victoryDescription}`);
        addBattleLog(`[보상] 경험치 ${expGained}점과 골드 ${goldGained}개를 획득했습니다!`);
    
        updatedChar.exp += expGained;
        updatedChar.gold += goldGained;
    
        let levelUps = 0;
        while (updatedChar.exp >= updatedChar.expToNextLevel) {
            levelUps++;
            updatedChar.level += 1;
            updatedChar.exp -= updatedChar.expToNextLevel;
            updatedChar.expToNextLevel = Math.floor(updatedChar.expToNextLevel * 1.5);
            updatedChar.maxHp = Math.floor(updatedChar.stats.vitality * 10);
            updatedChar.maxMp = Math.floor(updatedChar.stats.intelligence * 5);
            updatedChar.hp = updatedChar.maxHp;
            updatedChar.mp = updatedChar.maxMp;
        }
    
        if (levelUps > 0) {
            const statPointsGained = levelUps * 5;
            updatedChar.statPoints = (updatedChar.statPoints || 0) + statPointsGained;
            const levelUpPrompt = `${updatedChar.name}이(가) 레벨 ${updatedChar.level}로 올랐습니다! 레벨업 장면을 2~3문장으로 영웅적으로 묘사해주세요.`;
            const levelUpDescription = await callGeminiAPI(levelUpPrompt);
            addBattleLog(`[레벨업!] ${levelUpDescription}`);
            addMainLog(`레벨 ${updatedChar.level} 달성! 스탯 포인트 ${statPointsGained}개를 획득했습니다! '내 정보'에서 분배할 수 있습니다.`);
        }
    
        const itemsAcquired = [];
        if (monster.drops) {
            for (const drop of monster.drops) {
                if (Math.random() <= drop.chance) {
                    const quantity = Math.floor(Math.random() * (drop.maxQuantity - drop.minQuantity + 1)) + drop.minQuantity;
                    if (quantity > 0) {
                        const itemData = allItems.find(i => i.id === drop.itemId);
                        if (itemData) {
                            itemsAcquired.push({ ...itemData, quantity });
                            let itemAdded = false;
                            if (itemData.stackable) {
                                const existingItem = updatedChar.inventory.find(i => i.id === drop.itemId);
                                if (existingItem) {
                                    existingItem.quantity += quantity;
                                    itemAdded = true;
                                }
                            }
                            if (!itemAdded) {
                                updatedChar.inventory.push({ ...itemData, quantity });
                            }
                            addBattleLog(`[획득] ${itemData.name} ${quantity}개를 획득했습니다!`);
                        }
                    }
                }
            }
        }

        if (updatedChar.activeQuests?.length > 0) {
            const questLogMessages = [];
            for (const questProgress of updatedChar.activeQuests) {
                if (questProgress.status === 'ready_to_complete') continue;

                const questData = allQuests.find(q => q.id === questProgress.id);
                if (!questData) continue;

                let questUpdated = false;
                questData.objectives.forEach((objective, j) => {
                    if (objective.type === 'kill' && objective.targetId === monster.id) {
                        const current = questProgress.objectives[j].current || 0;
                        if (current < objective.count) {
                            questProgress.objectives[j].current = current + 1;
                            questUpdated = true;
                            questLogMessages.push(`[퀘스트] "${questData.title}" - ${monster.name} 처치 (${current + 1}/${objective.count})`);
                        }
                    }
                    if (objective.type === 'collect') {
                        const itemJustAcquired = itemsAcquired.find(item => item.id === objective.targetId);
                        if (itemJustAcquired) {
                            const current = questProgress.objectives[j].current || 0;
                            if (current < objective.count) {
                                const newProgress = Math.min(objective.count, current + itemJustAcquired.quantity);
                                questProgress.objectives[j].current = newProgress;
                                questUpdated = true;
                                questLogMessages.push(`[퀘스트] "${questData.title}" - ${itemJustAcquired.name} 수집 (${newProgress}/${objective.count})`);
                            }
                        }
                    }
                });

                if (questUpdated) {
                    const isComplete = questData.objectives.every((obj, j) => (questProgress.objectives[j]?.current || 0) >= obj.count);
                    if (isComplete) {
                        questProgress.status = 'ready_to_complete';
                        addMainLog(`[퀘스트 목표 달성] "${questData.title}"의 모든 목표를 달성했습니다! 퀘스트를 준 NPC에게 돌아가 보상을 받으세요.`);
                    }
                }
            }
            questLogMessages.forEach(msg => addBattleLog(msg));
        }

        setPlayer(updatedChar);
        updateCharacterState(updatedChar);
        await setDoc(doc(db, 'characters', updatedChar.id), updatedChar);
        addMainLog(`[전투 승리] ${monster.name}을(를) 물리치고 경험치 ${expGained}, 골드 ${goldGained}를 획득했습니다.`);
    };

    const handleBattleDefeat = async (finalPlayerState) => {
        setBattleState('defeat');
        const defeatPrompt = `
            ${player.name}이(가) ${monster.name}에게 패배했습니다. 전투 패배 장면과 ${player.name}의 상태를 3~5문장으로 묘사해주세요.
        `;
        const defeatDescription = await callGeminiAPI(defeatPrompt);
        addBattleLog(`[패배] ${defeatDescription}`);

        const goldLoss = Math.floor(player.gold * 0.1);
        const updatedChar = {
            ...finalPlayerState,
            hp: 1,
            gold: Math.max(0, player.gold - goldLoss)
        };
        
        addBattleLog(`[패널티] ${goldLoss}골드를 잃었습니다. 체력이 1로 회복되었습니다.`);
        
        setPlayer(updatedChar);
        updateCharacterState(updatedChar);
        await setDoc(doc(db, 'characters', updatedChar.id), updatedChar);
        addMainLog(`[전투 패배] ${monster.name}에게 패배하여 ${goldLoss}골드를 잃었습니다.`);
    };

    const handleFlee = () => {
        addBattleLog(`${player.name}이(가) 전투에서 도망쳤습니다!`);
        addMainLog(`${monster.name}과의 전투에서 도망쳤습니다.`);
        handleClose({ status: 'fled' });
    };

    if (!monster) {
        return (
            <div className="popup-overlay">
                <div className="popup-container"><p>전투 준비 중...</p></div>
            </div>
        );
    }

    return (
        <div className="popup-overlay">
            <div className="popup-container battle-popup">
                <div className="popup-header">
                    <h3>{monster.name} (Lv.{monster.level}) 와(과)의 전투</h3>
                    {(battleState === 'victory' || battleState === 'defeat') && 
                        <button onClick={() => handleClose({ status: battleState })} className="popup-close-btn">X</button>
                    }
                </div>
                <div className="popup-content">
                    <div className="battle-log-area">
                        {battleLog.map(log => (
                            <p key={log.id} className="log-entry">
                                <span className="log-timestamp">[{new Date(log.timestamp).toLocaleTimeString()}]</span> {log.message}
                            </p>
                        ))}
                        <div ref={logEndRef} />
                    </div>

                    {battleState === 'active' && (
                        <div className="battle-ui">
                            <div className="battle-participants">
                                <div className="participant-info player-info">
                                    <h4>{player.name} (Lv.{player.level})</h4>
                                    <div className="hp-bar"><div className="hp-fill" style={{ width: `${(player.hp / player.maxHp) * 100}%` }}></div><span>{player.hp}/{player.maxHp} HP</span></div>
                                    <div className="mp-bar"><div className="mp-fill" style={{ width: `${(player.mp / player.maxMp) * 100}%` }}></div><span>{player.mp}/{player.maxMp} MP</span></div>
                                </div>
                                <div className="participant-info monster-info">
                                    <h4>{monster.name} (Lv.{monster.level})</h4>
                                    <div className="hp-bar"><div className="hp-fill" style={{ width: `${(monster.currentHp / monster.hp) * 100}%` }}></div><span>{monster.currentHp}/{monster.hp} HP</span></div>
                                </div>
                            </div>
                            <div className="battle-actions">
                                <button onClick={() => executeBattleAction(null)} disabled={actionCooldown}>기본 공격</button>
                                {player.skills.map(skillId => {
                                    const skill = allSkills.find(s => s.id === skillId);
                                    return skill && (
                                        <button key={skill.id} onClick={() => executeBattleAction(skill.id)} disabled={actionCooldown || player.mp < skill.mpCost}>
                                            {skill.name} (MP {skill.mpCost})
                                        </button>
                                    );
                                })}
                                <button onClick={handleFlee} disabled={actionCooldown}>도망치기</button>
                            </div>
                        </div>
                    )}

                    {battleState === 'victory' && (
                        <div className="battle-result victory">
                            <h4>승리!</h4>
                            <p>전투에서 승리했습니다! 획득한 보상을 확인하세요.</p>
                            <button onClick={() => handleClose({ status: 'victory' })}>확인</button>
                        </div>
                    )}
                    {battleState === 'defeat' && (
                        <div className="battle-result defeat">
                            <h4>패배...</h4>
                            <p>전투에서 패배했습니다. 마을로 돌아가 재정비하세요.</p>
                            <button onClick={() => handleClose({ status: 'defeat' })}>확인</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default BattlePopup;