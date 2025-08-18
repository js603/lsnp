import React, { useState, useEffect } from 'react';

function CharacterStatusPopup({ character, calculatedStats, onClose, onApplyStats }) {
    // Hooks must be called at the top level, so we handle the possibility of `character` being null initially.
    const [localStats, setLocalStats] = useState(character ? { ...character.stats } : {});
    const [pointsToSpend, setPointsToSpend] = useState(character ? character.statPoints || 0 : 0);
    const [spentPoints, setSpentPoints] = useState({
        strength: 0,
        dexterity: 0,
        intelligence: 0,
        vitality: 0,
    });

    // Effect to sync state when the character prop changes (e.g., popup is reopened for the same character after a change).
    useEffect(() => {
        if (character) {
            setLocalStats({ ...character.stats });
            setPointsToSpend(character.statPoints || 0);
            setSpentPoints({ strength: 0, dexterity: 0, intelligence: 0, vitality: 0 });
        }
    }, [character]);

    const handleStatChange = (stat, amount) => {
        if (amount > 0 && pointsToSpend > 0) {
            setLocalStats(prev => ({ ...prev, [stat]: prev[stat] + 1 }));
            setSpentPoints(prev => ({ ...prev, [stat]: prev[stat] + 1 }));
            setPointsToSpend(prev => prev - 1);
        } else if (amount < 0 && spentPoints[stat] > 0) {
            setLocalStats(prev => ({ ...prev, [stat]: prev[stat] - 1 }));
            setSpentPoints(prev => ({ ...prev, [stat]: prev[stat] - 1 }));
            setPointsToSpend(prev => prev + 1);
        }
    };

    const handleApply = () => {
        if (Object.values(spentPoints).some(p => p > 0)) {
            onApplyStats(localStats, pointsToSpend);
        }
    };

    // Guard clause after hooks.
    if (!character || !calculatedStats) {
        return null;
    }

    // Destructure after the guard clause to ensure `character` is not null.
    const {
        name, level, class: className, hp, maxHp, mp, maxMp, exp, expToNextLevel, gold, stats: baseStats
    } = character;

    return (
        <div className="popup-overlay">
            <div className="popup-container character-status-popup" style={{width: '400px'}}>
                <div className="popup-header">
                    <h3>캐릭터 정보</h3>
                    <button onClick={onClose} className="popup-close-btn">X</button>
                </div>
                <div className="popup-content">
                    <h4>{name}</h4>
                    <p><strong>레벨:</strong> {level} | <strong>직업:</strong> {className} | <strong>소지금:</strong> {gold} Gold</p>
                    <hr />
                    <p>HP: {hp} / {maxHp} | MP: {mp} / {maxMp}</p>
                    <p>경험치: {exp} / {expToNextLevel}</p>
                    <hr />
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                            <h5>기본 능력치</h5>
                            {Object.keys(baseStats).map(stat => (
                                <div key={stat} className="stat-row">
                                    <span>{stat.charAt(0).toUpperCase() + stat.slice(1)}: {localStats[stat]}</span>
                                    {(character.statPoints > 0) && (
                                        <div>
                                            <button onClick={() => handleStatChange(stat, -1)} disabled={spentPoints[stat] === 0}>-</button>
                                            <button onClick={() => handleStatChange(stat, 1)} disabled={pointsToSpend === 0}>+</button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div>
                            <h5>최종 능력치 (장비 포함)</h5>
                            <ul>
                                <li>공격력: {calculatedStats.attack || 0}</li>
                                <li>방어력: {calculatedStats.defense || 0}</li>
                                <li>마법력: {calculatedStats.magicPower || 0}</li>
                            </ul>
                        </div>
                    </div>
                    {(character.statPoints > 0) && (
                        <div className="stat-points-section">
                            <hr />
                            <p><strong>남은 스탯 포인트: {pointsToSpend}</strong></p>
                            <button onClick={handleApply} disabled={Object.values(spentPoints).every(p => p === 0)}>
                                능력치 적용
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default CharacterStatusPopup;