import React, { useState, useEffect, useRef } from 'react';

function MiningPopup({ 
    character,
    onClose, 
    updateCharacterState,
    addMainLog,
    location, // 현재 지역 정보
    allItems
}) {
    const [internalLog, setInternalLog] = useState([]);
    const [acquiredItems, setAcquiredItems] = useState([]);
    const [isMining, setIsMining] = useState(false);
    const logEndRef = useRef(null);
    const miningIntervalRef = useRef(null);

    const addLog = (message) => {
        setInternalLog(prev => [...prev, { id: Date.now(), message, timestamp: new Date() }]);
    };

    useEffect(() => {
        if (logEndRef.current) {
            logEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [internalLog]);

    const startMining = () => {
        setIsMining(true);
        addLog('채광을 시작합니다...');
        miningIntervalRef.current = setInterval(() => {
            // 지역에 채광 가능한 자원이 있는지 확인
            const availableOres = location.resources.filter(id => {
                const item = allItems.find(i => i.id === id);
                return item && item.subType === 'mining';
            });

            if (availableOres.length === 0) {
                addLog('이 지역에서는 더 이상 광석을 찾을 수 없습니다.');
                stopMining();
                return;
            }

            // TODO: 캐릭터의 채광 숙련도에 따라 성공 확률 및 획득 아이템 결정 로직 추가
            const successChance = 0.7; // 임시 성공 확률

            if (Math.random() < successChance) {
                const oreId = availableOres[Math.floor(Math.random() * availableOres.length)];
                const oreData = allItems.find(i => i.id === oreId);
                const quantity = 1; // 임시 획득량

                addLog(`[성공] ${oreData.name} ${quantity}개를 획득했습니다!`);
                setAcquiredItems(prev => {
                    const existing = prev.find(i => i.id === oreId);
                    if (existing) {
                        return prev.map(i => i.id === oreId ? { ...i, quantity: i.quantity + quantity } : i);
                    } else {
                        return [...prev, { ...oreData, quantity }];
                    }
                });
            } else {
                addLog('[실패] 광석을 찾지 못했습니다...');
            }

        }, 5000); // 5초마다 채광 시도
    };

    const stopMining = () => {
        setIsMining(false);
        clearInterval(miningIntervalRef.current);
        addLog('채광을 중지합니다.');
    };

    const handleClose = () => {
        if (isMining) {
            stopMining();
        }
        if (acquiredItems.length > 0) {
            const updatedCharacter = { ...character };
            updatedCharacter.inventory = updatedCharacter.inventory || [];

            acquiredItems.forEach(item => {
                if (item.stackable) {
                    const existingItem = updatedCharacter.inventory.find(i => i.id === item.id);
                    if (existingItem) {
                        existingItem.quantity += item.quantity;
                    } else {
                        updatedCharacter.inventory.push(item);
                    }
                } else {
                    // 스택 불가능 아이템 처리 (필요 시)
                    updatedCharacter.inventory.push(item);
                }
            });
            
            const summary = acquiredItems.map(i => `${i.name} x${i.quantity}`).join(', ');
            addMainLog(`[채광 결과] ${summary} 을(를) 획득했습니다.`);
            updateCharacterState(updatedCharacter);
        }
        onClose();
    };

    return (
        <div className="popup-overlay">
            <div className="popup-container mining-popup">
                <div className="popup-header">
                    <h3>채광</h3>
                    <button onClick={handleClose} className="popup-close-btn">X</button>
                </div>
                <div className="popup-content">
                    <div className="mining-log-area">
                        {internalLog.map(log => (
                            <p key={log.id} className="log-entry-small">
                                <span className="log-timestamp">[{new Date(log.timestamp).toLocaleTimeString()}]</span> {log.message}
                            </p>
                        ))}
                        <div ref={logEndRef} />
                    </div>
                    <div className="mining-summary">
                        <h5>획득 아이템</h5>
                        {acquiredItems.length > 0 ? (
                            <ul>
                                {acquiredItems.map(item => (
                                    <li key={item.id}>{item.name}: {item.quantity}개</li>
                                ))}
                            </ul>
                        ) : (
                            <p>아직 획득한 아이템이 없습니다.</p>
                        )}
                    </div>
                    <div className="mining-actions">
                        {!isMining ? (
                            <button onClick={startMining}>채광 시작</button>
                        ) : (
                            <button onClick={stopMining}>채광 중지</button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MiningPopup;