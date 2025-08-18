import React, { useState, useEffect, useRef } from 'react';

function FishingPopup({ 
    character,
    onClose, 
    updateCharacterState,
    addMainLog,
    location, // 현재 지역 정보
    allItems
}) {
    const [internalLog, setInternalLog] = useState([]);
    const [acquiredItems, setAcquiredItems] = useState([]);
    const [isFishing, setIsFishing] = useState(false);
    const logEndRef = useRef(null);
    const fishingIntervalRef = useRef(null);

    const addLog = (message) => {
        setInternalLog(prev => [...prev, { id: Date.now(), message, timestamp: new Date() }]);
    };

    useEffect(() => {
        if (logEndRef.current) {
            logEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [internalLog]);

    const startFishing = () => {
        setIsFishing(true);
        addLog('낚시를 시작합니다...');
        fishingIntervalRef.current = setInterval(() => {
            const availableFish = location.resources.filter(id => {
                const item = allItems.find(i => i.id === id);
                return item && item.subType === 'fishing';
            });

            if (availableFish.length === 0) {
                addLog('이곳에서는 물고기가 더 이상 잡히지 않는 것 같습니다.');
                stopFishing();
                return;
            }

            // TODO: 캐릭터의 낚시 숙련도에 따라 성공 확률 및 획득 아이템 결정 로직 추가
            const successChance = 0.6; // 임시 성공 확률

            if (Math.random() < successChance) {
                const fishId = availableFish[Math.floor(Math.random() * availableFish.length)];
                const fishData = allItems.find(i => i.id === fishId);
                const quantity = 1; // 임시 획득량

                addLog(`[성공] ${fishData.name} ${quantity}마리를 낚았습니다!`);
                setAcquiredItems(prev => {
                    const existing = prev.find(i => i.id === fishId);
                    if (existing) {
                        return prev.map(i => i.id === fishId ? { ...i, quantity: i.quantity + quantity } : i);
                    } else {
                        return [...prev, { ...fishData, quantity }];
                    }
                });
            } else {
                addLog('[실패] 물고기가 미끼를 물지 않았습니다...');
            }

        }, 7000); // 7초마다 낚시 시도
    };

    const stopFishing = () => {
        setIsFishing(false);
        clearInterval(fishingIntervalRef.current);
        addLog('낚시를 중지합니다.');
    };

    const handleClose = () => {
        if (isFishing) {
            stopFishing();
        }
        if (acquiredItems.length > 0) {
            const updatedCharacter = { ...character };
            updatedCharacter.inventory = updatedCharacter.inventory || [];

            acquiredItems.forEach(item => {
                const existingItem = updatedCharacter.inventory.find(i => i.id === item.id);
                if (existingItem) {
                    existingItem.quantity += item.quantity;
                } else {
                    updatedCharacter.inventory.push(item);
                }
            });
            
            const summary = acquiredItems.map(i => `${i.name} x${i.quantity}`).join(', ');
            addMainLog(`[낚시 결과] ${summary} 을(를) 획득했습니다.`);
            updateCharacterState(updatedCharacter);
        }
        onClose();
    };

    return (
        <div className="popup-overlay">
            <div className="popup-container fishing-popup">
                <div className="popup-header">
                    <h3>낚시</h3>
                    <button onClick={handleClose} className="popup-close-btn">X</button>
                </div>
                <div className="popup-content">
                    <div className="fishing-log-area">
                        {internalLog.map(log => (
                            <p key={log.id} className="log-entry-small">
                                <span className="log-timestamp">[{new Date(log.timestamp).toLocaleTimeString()}]</span> {log.message}
                            </p>
                        ))}
                        <div ref={logEndRef} />
                    </div>
                    <div className="fishing-summary">
                        <h5>잡은 물고기</h5>
                        {acquiredItems.length > 0 ? (
                            <ul>
                                {acquiredItems.map(item => (
                                    <li key={item.id}>{item.name}: {item.quantity}마리</li>
                                ))}
                            </ul>
                        ) : (
                            <p>아직 잡은 물고기가 없습니다.</p>
                        )}
                    </div>
                    <div className="fishing-actions">
                        {!isFishing ? (
                            <button onClick={startFishing}>낚시 시작</button>
                        ) : (
                            <button onClick={stopFishing}>낚시 중지</button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default FishingPopup;