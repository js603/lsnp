import React, { useState, useEffect, useRef } from 'react';
import { doc, setDoc } from 'firebase/firestore';

function InventoryPopup({ 
    db,
    character,
    onClose,
    updateCharacterState,
    addMainLog,
    callGeminiAPI
}) {
    const [player, setPlayer] = useState(JSON.parse(JSON.stringify(character)));
    const [selectedItem, setSelectedItem] = useState(null);
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

    const handleUseItem = async (item) => {
        if (!item) return;

        let updatedPlayer = { ...player };
        let used = false;
        let logMessage = '';

        if (item.type === 'consumable' && item.effect) {
            switch (item.effect.type) {
                case 'heal':
                    const healAmount = item.effect.amount || 0;
                    if (updatedPlayer.hp >= updatedPlayer.maxHp) {
                        addLog('체력이 이미 가득 차 있습니다.');
                        return;
                    }
                    const actualHeal = Math.min(healAmount, updatedPlayer.maxHp - updatedPlayer.hp);
                    updatedPlayer.hp += actualHeal;
                    logMessage = `${item.name}을(를) 사용하여 체력이 ${actualHeal}만큼 회복되었습니다. (현재 HP: ${updatedPlayer.hp})`;
                    used = true;
                    break;
                case 'mana':
                    const manaAmount = item.effect.amount || 0;
                     if (updatedPlayer.mp >= updatedPlayer.maxMp) {
                        addLog('마나가 이미 가득 차 있습니다.');
                        return;
                    }
                    const actualMana = Math.min(manaAmount, updatedPlayer.maxMp - updatedPlayer.mp);
                    updatedPlayer.mp += actualMana;
                    logMessage = `${item.name}을(를) 사용하여 마나가 ${actualMana}만큼 회복되었습니다. (현재 MP: ${updatedPlayer.mp})`;
                    used = true;
                    break;
                default:
                    logMessage = `${item.name}을(를) 사용했지만, 아무 일도 일어나지 않았습니다.`;
                    break;
            }
        } else if (item.type === 'equipment') {
            // 장비 장착 로직
            logMessage = await equipItem(item, updatedPlayer);
            used = true; // equipItem handles player state update internally for now
        } else {
            addLog(`${item.name}은(는) 사용할 수 없는 아이템입니다.`);
            return;
        }

        if (used) {
            // 아이템 수량 감소 또는 제거
            const itemIndex = updatedPlayer.inventory.findIndex(i => i.id === item.id);
            if (itemIndex > -1) {
                if (updatedPlayer.inventory[itemIndex].quantity > 1) {
                    updatedPlayer.inventory[itemIndex].quantity -= 1;
                } else {
                    updatedPlayer.inventory.splice(itemIndex, 1);
                }
            }
            setPlayer(updatedPlayer);
            addLog(logMessage);
            setSelectedItem(null); // 선택 해제
        }
    };

    const equipItem = async (itemToEquip, currentPlayer) => {
        let updatedPlayer = { ...currentPlayer };
        updatedPlayer.equipment = updatedPlayer.equipment || {};

        // 장착 조건 확인
        if (itemToEquip.requiredLevel && updatedPlayer.level < itemToEquip.requiredLevel) {
            return `레벨이 부족하여 ${itemToEquip.name}을(를) 장착할 수 없습니다. (필요 레벨: ${itemToEquip.requiredLevel})`;
        }

        // 기존 장비 해제
        const currentEquippedItemId = updatedPlayer.equipment[itemToEquip.slot];
        if (currentEquippedItemId) {
            const itemIndex = updatedPlayer.inventory.findIndex(i => i.id === currentEquippedItemId);
            if (itemIndex > -1) {
                updatedPlayer.inventory[itemIndex].quantity += 1;
            } else {
                 // 인벤토리에 없던 아이템이면 찾아서 추가해야함 (allItems 필요)
                 // 지금 구조에서는 allItems가 없으므로 단순화
                 const oldEquipData = character.inventory.find(i => i.id === currentEquippedItemId) || character.equipment[itemToEquip.slot];
                 if(oldEquipData) updatedPlayer.inventory.push({ ...oldEquipData, quantity: 1 });
            }
        }

        // 새 장비 장착
        updatedPlayer.equipment[itemToEquip.slot] = itemToEquip.id;
        
        const equipPrompt = `${updatedPlayer.name}이(가) ${itemToEquip.name}을(를) 장착했습니다. 장비가 빛나며 몸에 맞게 변하는 모습을 2~3문장으로 묘사해주세요.`;
        const equipDescription = await callGeminiAPI(equipPrompt);
        
        return `[장착] ${equipDescription}`;
    };

    const handleDropItem = (item) => {
        if (!item) return;
        let updatedPlayer = { ...player };
        updatedPlayer.inventory = updatedPlayer.inventory.filter(i => i.id !== item.id);
        setPlayer(updatedPlayer);
        addLog(`${item.name}을(를) 버렸습니다.`);
        setSelectedItem(null);
    };

    const handleClose = async () => {
        try {
            await setDoc(doc(db, 'characters', player.id), player);
            updateCharacterState(player);
            addMainLog('인벤토리를 정리했습니다.');
            onClose();
        } catch (error) {
            console.error("Error saving character state:", error);
            addMainLog('캐릭터 상태 저장 중 오류가 발생했습니다.');
            onClose(); // 일단 닫기
        }
    };

    return (
        <div className="popup-overlay">
            <div className="popup-container inventory-popup">
                <div className="popup-header">
                    <h3>인벤토리</h3>
                    <button onClick={handleClose} className="popup-close-btn">X</button>
                </div>
                <div className="popup-content-split">
                    <div className="inventory-list-area">
                        <h4>아이템 목록</h4>
                        {player.inventory.length === 0 ? (
                            <p>인벤토리가 비어있습니다.</p>
                        ) : (
                            <ul className="inventory-list">
                                {player.inventory.map((item, index) => (
                                    <li key={`${item.id}-${index}`} onClick={() => setSelectedItem(item)} className={selectedItem?.id === item.id ? 'selected' : ''}>
                                        {item.name} {item.quantity > 1 ? `(${item.quantity})` : ''}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <div className="inventory-details-area">
                        {selectedItem ? (
                            <div className="item-details">
                                <h5>{selectedItem.name}</h5>
                                <p><em>{selectedItem.type === 'equipment' ? `[${selectedItem.subType}]` : `[${selectedItem.type}]`}</em></p>
                                <p>{selectedItem.description}</p>
                                <div className="item-actions">
                                    <button onClick={() => handleUseItem(selectedItem)}>사용</button>
                                    <button onClick={() => handleDropItem(selectedItem)}>버리기</button>
                                </div>
                            </div>
                        ) : (
                            <p>아이템을 선택하세요.</p>
                        )}
                        <div className="inventory-log-area">
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

export default InventoryPopup;