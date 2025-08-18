import React, { useState, useEffect, useRef } from 'react';

function HerbalismPopup({ 
    character,
    onClose, 
    updateCharacterState,
    addMainLog,
    location, // 현재 지역 정보
    allItems
}) {
    const [internalLog, setInternalLog] = useState([]);
    const [acquiredItems, setAcquiredItems] = useState([]);
    const [isGathering, setIsGathering] = useState(false);
    const logEndRef = useRef(null);
    const gatheringIntervalRef = useRef(null);

    const addLog = (message) => {
        setInternalLog(prev => [...prev, { id: Date.now(), message, timestamp: new Date() }]);
    };

    useEffect(() => {
        if (logEndRef.current) {
            logEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [internalLog]);

    const startGathering = () => {
        setIsGathering(true);
        addLog('약초 채집을 시작합니다...');
        gatheringIntervalRef.current = setInterval(() => {
            const availableHerbs = location.resources.filter(id => {
                const item = allItems.find(i => i.id === id);
                // 'alchemy' 타입의 재료를 약초로 간주합니다. (향후 'herbalism' 타입으로 확장 가능)
                return item && item.type === 'material' && item.subType === 'alchemy';
            });

            if (availableHerbs.length === 0) {
                addLog('이 지역에서는 더 이상 약초를 찾을 수 없습니다.');
                stopGathering();
                return;
            }

            // TODO: 캐릭터의 약초채집 숙련도에 따라 성공 확률 및 획득 아이템 결정 로직 추가
            const successChance = 0.8; // 임시 성공 확률

            if (Math.random() < successChance) {
                const herbId = availableHerbs[Math.floor(Math.random() * availableHerbs.length)];
                const herbData = allItems.find(i => i.id === herbId);
                const quantity = 1; // 임시 획득량

                addLog(`[성공] ${herbData.name} ${quantity}개를 채집했습니다!`);
                setAcquiredItems(prev => {
                    const existing = prev.find(i => i.id === herbId);
                    if (existing) {
                        return prev.map(i => i.id === herbId ? { ...i, quantity: i.quantity + quantity } : i);
                    } else {
                        return [...prev, { ...herbData, quantity }];
                    }
                });
            } else {
                addLog('[실패] 약초를 찾지 못했습니다...');
            }

        }, 5000); // 5초마다 채집 시도
    };

    const stopGathering = () => {
        setIsGathering(false);
        clearInterval(gatheringIntervalRef.current);
        addLog('채집을 중지합니다.');
    };

    const handleClose = () => {
        if (isGathering) {
            stopGathering();
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
            addMainLog(`[채집 결과] ${summary} 을(를) 획득했습니다.`);
            updateCharacterState(updatedCharacter);
        }
        onClose();
    };

    return (
        <div className="popup-overlay">
            <div className="popup-container herbalism-popup">
                <div className="popup-header">
                    <h3>약초 채집</h3>
                    <button onClick={handleClose} className="popup-close-btn">X</button>
                </div>
                <div className="popup-content">
                    <div className="herbalism-log-area">
                        {internalLog.map(log => (
                            <p key={log.id} className="log-entry-small">
                                <span className="log-timestamp">[{new Date(log.timestamp).toLocaleTimeString()}]</span> {log.message}
                            </p>
                        ))}
                        <div ref={logEndRef} />
                    </div>
                    <div className="herbalism-summary">
                        <h5>획득한 약초</h5>
                        {acquiredItems.length > 0 ? (
                            <ul>
                                {acquiredItems.map(item => (
                                    <li key={item.id}>{item.name}: {item.quantity}개</li>
                                ))}
                            </ul>
                        ) : (
                            <p>아직 획득한 약초가 없습니다.</p>
                        )}
                    </div>
                    <div className="herbalism-actions">
                        {!isGathering ? (
                            <button onClick={startGathering}>채집 시작</button>
                        ) : (
                            <button onClick={stopGathering}>채집 중지</button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HerbalismPopup;