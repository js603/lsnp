import React, { useState, useEffect, useRef } from 'react';
import { doc, setDoc } from 'firebase/firestore';

function QuestPopup({ 
    db,
    character,
    onClose,
    updateCharacterState,
    addMainLog,
    allQuests,
    allMonsters, // GameScreen에서 전달받음
    allItems     // GameScreen에서 전달받음
}) {
    const [player, setPlayer] = useState(JSON.parse(JSON.stringify(character)));
    const [selectedQuest, setSelectedQuest] = useState(null);
    const [internalLog, setInternalLog] = useState([]);
    const logEndRef = useRef(null);

    const addLog = (message) => {
        setInternalLog(prev => [...prev, { id: Date.now(), message, timestamp: new Date() }]);
    };

    useEffect(() => {
        if (logEndRef.current) {
            logEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [internalLog]);

    const handleAbandonQuest = (questId) => {
        if (!questId) return;

        const questToAbandon = allQuests.find(q => q.id === questId);
        if (!questToAbandon) return;

        let updatedPlayer = { ...player };
        updatedPlayer.activeQuests = updatedPlayer.activeQuests.filter(q => q.id !== questId);
        
        setPlayer(updatedPlayer);
        addLog(`"${questToAbandon.title}" 퀘스트를 포기했습니다.`);
        setSelectedQuest(null);
    };

    const handleClose = async () => {
        try {
            if (JSON.stringify(player) !== JSON.stringify(character)) {
                await setDoc(doc(db, 'characters', player.id), player);
                updateCharacterState(player);
                addMainLog('퀘스트 목록을 갱신했습니다.');
            }
            onClose();
        } catch (error) {
            console.error("Error saving character state:", error);
            addMainLog('캐릭터 상태 저장 중 오류가 발생했습니다.');
            onClose();
        }
    };

    const getQuestDetails = (quest) => {
        const questData = allQuests.find(q => q.id === quest.id);
        if (!questData) return null;
        
        const objectives = questData.objectives.map((obj, index) => {
            const progress = quest.objectives?.[index] || { current: 0 };
            let targetName = obj.targetId;
            if (obj.type === 'kill' && allMonsters) {
                const monster = allMonsters.find(m => m.id === obj.targetId);
                if (monster) targetName = monster.name;
            } else if (obj.type === 'collect' && allItems) {
                const item = allItems.find(i => i.id === obj.targetId);
                if (item) targetName = item.name;
            }
            return { ...obj, ...progress, targetName };
        });

        return { ...questData, objectives };
    };

    useEffect(() => {
        if (player.activeQuests.length > 0) {
            const firstQuestDetails = getQuestDetails(player.activeQuests[0]);
            setSelectedQuest(firstQuestDetails);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="popup-overlay">
            <div className="popup-container quest-popup">
                <div className="popup-header">
                    <h3>퀘스트 기록</h3>
                    <button onClick={handleClose} className="popup-close-btn">X</button>
                </div>
                <div className="popup-content-split">
                    <div className="quest-list-area">
                        <h4>진행 중인 퀘스트</h4>
                        {player.activeQuests.length > 0 ? (
                            <ul className="quest-list">
                                {player.activeQuests.map(quest => {
                                    const questData = allQuests.find(q => q.id === quest.id);
                                    return questData && (
                                        <li key={quest.id} onClick={() => setSelectedQuest(getQuestDetails(quest))} className={selectedQuest?.id === quest.id ? 'selected' : ''}>
                                            {questData.title}
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <p>진행 중인 퀘스트가 없습니다.</p>
                        )}
                    </div>
                    <div className="quest-details-area">
                        {selectedQuest ? (
                            <div className="quest-details">
                                <h5>{selectedQuest.title}</h5>
                                <p><em>(레벨 {selectedQuest.level} 퀘스트)</em></p>
                                <p>{selectedQuest.description}</p>
                                <h6>목표:</h6>
                                <ul className="quest-objectives">
                                    {selectedQuest.objectives.map((obj, index) => (
                                        <li key={index}>
                                            {obj.type === 'kill' && `[사냥] ${obj.targetName} (${obj.current}/${obj.count})`}
                                            {obj.type === 'collect' && `[수집] ${obj.targetName} (${obj.current}/${obj.count})`}
                                        </li>
                                    ))}
                                </ul>
                                <div className="quest-actions">
                                    <button onClick={() => handleAbandonQuest(selectedQuest.id)}>포기</button>
                                </div>
                            </div>
                        ) : (
                            <p>퀘스트를 선택하세요.</p>
                        )}
                         <div className="quest-log-area">
                             {internalLog.map(log => (
                                <p key={log.id} className="log-entry-small">
                                    <span className="log-timestamp">[{new Date(log.timestamp).toLocaleTimeString()}]</span> {log.message}
                                </p>
                            ))}
                            <div ref={logEndRef} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default QuestPopup;