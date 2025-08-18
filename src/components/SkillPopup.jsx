import React, { useState } from 'react';

function SkillPopup({ 
    character,
    onClose,
    allSkills
}) {
    const [selectedSkill, setSelectedSkill] = useState(null);

    const getSkillDetails = (skillId) => {
        return allSkills.find(s => s.id === skillId);
    };

    return (
        <div className="popup-overlay">
            <div className="popup-container skill-popup">
                <div className="popup-header">
                    <h3>기술</h3>
                    <button onClick={onClose} className="popup-close-btn">X</button>
                </div>
                <div className="popup-content-split">
                    <div className="skill-list-area">
                        <h4>보유 기술</h4>
                        {character.skills.length > 0 ? (
                            <ul className="skill-list">
                                {character.skills.map(skillId => {
                                    const skill = getSkillDetails(skillId);
                                    return skill && (
                                        <li key={skill.id} onClick={() => setSelectedSkill(skill)} className={selectedSkill?.id === skill.id ? 'selected' : ''}>
                                            {skill.name}
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <p>아직 배운 기술이 없습니다.</p>
                        )}
                    </div>
                    <div className="skill-details-area">
                        {selectedSkill ? (
                            <div className="skill-details">
                                <h5>{selectedSkill.name}</h5>
                                <p><em>[{selectedSkill.type}]</em></p>
                                <p>{selectedSkill.description}</p>
                                <hr />
                                <p>MP 소모: {selectedSkill.mpCost || 0}</p>
                                <p>쿨타임: {selectedSkill.cooldown || 0}초</p>
                                {selectedSkill.damage && <p>데미지: {selectedSkill.damage.min} - {selectedSkill.damage.max} ({selectedSkill.damage.type})</p>}
                                {selectedSkill.healing && <p>치유량: {selectedSkill.healing.min} - {selectedSkill.healing.max}</p>}
                            </div>
                        ) : (
                            <p>기술을 선택하여 상세 정보를 확인하세요.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SkillPopup;