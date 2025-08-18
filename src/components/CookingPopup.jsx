import React, { useState } from 'react';

function CookingPopup({ 
    character,
    onClose, 
    updateCharacterState,
    addMainLog,
    allRecipes,
    allItems
}) {
    const [message, setMessage] = useState('');

    // 인벤토리에 특정 아이템이 충분히 있는지 확인하는 함수
    const hasEnoughIngredients = (ingredients) => {
        if (!character.inventory) return false;
        return ingredients.every(ing => {
            const itemInInventory = character.inventory.find(i => i.id === ing.itemId);
            return itemInInventory && itemInInventory.quantity >= ing.quantity;
        });
    };

    const handleCook = (recipe) => {
        if (!hasEnoughIngredients(recipe.ingredients)) {
            setMessage('재료가 부족합니다.');
            return;
        }

        let updatedCharacter = { ...character };
        updatedCharacter.inventory = [...updatedCharacter.inventory];

        // 재료 차감
        recipe.ingredients.forEach(ing => {
            const itemIndex = updatedCharacter.inventory.findIndex(i => i.id === ing.itemId);
            updatedCharacter.inventory[itemIndex].quantity -= ing.quantity;
            if (updatedCharacter.inventory[itemIndex].quantity === 0) {
                updatedCharacter.inventory.splice(itemIndex, 1);
            }
        });

        // 결과물 추가
        const resultItemData = allItems.find(i => i.id === recipe.result.itemId);
        if (resultItemData) {
            const existingItemIndex = updatedCharacter.inventory.findIndex(i => i.id === resultItemData.id);
            if (existingItemIndex > -1 && resultItemData.stackable) {
                updatedCharacter.inventory[existingItemIndex].quantity += recipe.result.quantity;
            } else {
                updatedCharacter.inventory.push({ ...resultItemData, quantity: recipe.result.quantity });
            }
            addMainLog(`[요리] ${resultItemData.name} ${recipe.result.quantity}개를 만들었습니다!`);
        }
        
        // TODO: 요리 숙련도 경험치 추가 로직

        updateCharacterState(updatedCharacter);
        setMessage(`${recipe.name}을(를) 성공적으로 만들었습니다.`);
    };

    const availableRecipes = allRecipes.filter(r => r.type === 'cooking');

    return (
        <div className="popup-overlay">
            <div className="popup-container cooking-popup">
                <div className="popup-header">
                    <h3>요리하기</h3>
                    <button onClick={onClose} className="popup-close-btn">X</button>
                </div>
                <div className="popup-content">
                    <div className="recipe-list">
                        {availableRecipes.map(recipe => {
                            const canCook = hasEnoughIngredients(recipe.ingredients);
                            return (
                                <div key={recipe.id} className={`recipe-item ${!canCook ? 'disabled' : ''}`}>
                                    <h5>{recipe.name}</h5>
                                    <p>필요 재료: {
                                        recipe.ingredients.map(ing => {
                                            const item = allItems.find(i => i.id === ing.itemId);
                                            return `${item?.name || '알 수 없는 아이템'} x${ing.quantity}`;
                                        }).join(', ')
                                    }</p>
                                    <button onClick={() => handleCook(recipe)} disabled={!canCook}>요리하기</button>
                                </div>
                            );
                        })}
                    </div>
                    {message && <p className="popup-message">{message}</p>}
                </div>
            </div>
        </div>
    );
}

export default CookingPopup;