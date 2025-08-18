import React, { useState } from 'react';

function NpcPopup({ 
    character,
    onClose,
    npcsInRegion, 
    allQuests,    
    onAcceptQuest, 
    onCompleteQuest, // 퀘스트 완료 함수 추가
    addLog,       
}) {
    const [selectedNpc, setSelectedNpc] = useState(null);

    const handleAcceptQuest = (quest) => {
        onAcceptQuest(quest);
        addLog(`[${selectedNpc.name}]에게 "${quest.title}" 퀘스트를 받았습니다.`);
        setSelectedNpc(null); // NPC 선택 해제하여 UI 갱신
    };

    const handleCompleteQuest = (quest) => {
        onCompleteQuest(quest);
        // 로그 메시지는 onCompleteQuest 내부에서 처리하도록 GameScreen에 위임
        setSelectedNpc(null); // NPC 선택 해제하여 UI 갱신
    };

    // 수락 가능한 퀘스트인지 확인
    const isQuestAvailable = (quest) => {
        if (!quest) return false;
        if (character.level < quest.requiredLevel) return false;
        if (character.activeQuests.some(q => q.id === quest.id)) return false;
        if (character.completedQuests?.includes(quest.id)) return false;
        return true;
    };

    // NPC가 주는 퀘스트 중 완료 가능한 퀘스트 목록을 반환
    const getCompletableQuests = (npc) => {
        if (!npc || !character.activeQuests) return [];
        return character.activeQuests
            .filter(activeQuest => {
                const questData = allQuests.find(q => q.id === activeQuest.id);
                return questData && 
                       questData.giver === npc.id && 
                       activeQuest.status === 'ready_to_complete';
            })
            .map(activeQuest => allQuests.find(q => q.id === activeQuest.id));
    };

    return (
        <div className="popup-overlay">
            <div className="popup-container npc-popup">
                <div className="popup-header">
                    <h3>마을 사람들</h3>
                    <button onClick={onClose} className="popup-close-btn">X</button>
                </div>
                <div className="popup-content-split">
                    <div className="npc-list-area">
                        <h4>이 지역의 NPC</h4>
                        {npcsInRegion.length > 0 ? (
                            <ul className="npc-list">
                                {npcsInRegion.map(npc => (
                                    <li key={npc.id} onClick={() => setSelectedNpc(npc)} className={selectedNpc?.id === npc.id ? 'selected' : ''}>
                                        {npc.name}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>이 지역에는 만날 수 있는 사람이 없습니다.</p>
                        )}
                    </div>
                    <div className="npc-details-area">
                        {selectedNpc ? (
                            (() => {
                                const completableQuests = getCompletableQuests(selectedNpc);
                                const availableQuests = selectedNpc.quests
                                    .map(id => allQuests.find(q => q.id === id))
                                    .filter(q => isQuestAvailable(q));

                                return (
                                    <div className="npc-details">
                                        <h5>{selectedNpc.name}</h5>
                                        <p><em>{selectedNpc.description}</em></p>
                                        <div className="npc-dialogue">
                                            {selectedNpc.dialogue?.map((line, index) => <p key={index}>"{line}"</p>)}
                                        </div>
                                        {selectedNpc.type === 'quest_giver' && (
                                            <div className="npc-quests">
                                                <h6>대화 가능한 퀘스트</h6>
                                                <ul>
                                                    {completableQuests.map(quest => (
                                                        <li key={quest.id} className="quest-completable">
                                                            <span>{quest.title} (완료 가능)</span>
                                                            <button onClick={() => handleCompleteQuest(quest)}>완료</button>
                                                        </li>
                                                    ))}
                                                    {availableQuests.map(quest => (
                                                        <li key={quest.id}>
                                                            <span>{quest.title} (Lv.{quest.level})</span>
                                                            <button onClick={() => handleAcceptQuest(quest)}>수락</button>
                                                        </li>
                                                    ))}
                                                </ul>
                                                {completableQuests.length === 0 && availableQuests.length === 0 && (
                                                    <p>이 NPC와는 더 이상 나눌 이야기가 없습니다.</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })()
                        ) : (
                            <p>대화할 NPC를 선택하세요.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default NpcPopup;