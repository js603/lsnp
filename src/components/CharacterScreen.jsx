import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';

function CharacterScreen({ 
    db, user, setUser, setGameState, setLoading, setMessage, loading, message, addGameLog, callGeminiAPI,
    allClasses, allRegions, allItems
}) {
  const [characters, setCharacters] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newCharName, setNewCharName] = useState('');
  const [selectedClass, setSelectedClass] = useState('');

  useEffect(() => {
    const loadCharacterData = async () => {
      if (!user || !db) return;

      try {
        setLoading(true);
        setMessage('');

        const userRef = doc(db, 'users', user.username);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.characters && userData.characters.length > 0) {
            const charDataPromises = userData.characters.map(charId => getDoc(doc(db, 'characters', charId)));
            const charDocs = await Promise.all(charDataPromises);
            const charData = charDocs
              .filter(charDoc => charDoc.exists())
              .map(charDoc => ({ id: charDoc.id, ...charDoc.data() }));
            setCharacters(charData);
          }
        }
      } catch (error) {
        console.error('Character data loading error:', error);
        setMessage('캐릭터 데이터 로드 오류: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    loadCharacterData();
  }, [user, db, setLoading, setMessage]);

  const handleCreateCharacter = async () => {
    if (!newCharName || !selectedClass) {
      setMessage('캐릭터 이름과 직업을 모두 선택해주세요.');
      return;
    }

    try {
      setLoading(true);
      setMessage('');

      const classData = allClasses.find(c => c.id === selectedClass);
      if (!classData) {
        setMessage('선택한 직업 정보를 찾을 수 없습니다.');
        setLoading(false);
        return;
      }

      const charId = `${user.username}_${newCharName}_${Date.now()}`;
      const characterData = {
        id: charId,
        name: newCharName,
        class: selectedClass,
        level: 1,
        exp: 0,
        expToNextLevel: 100,
        stats: classData.baseStats,
        hp: classData.baseStats.vitality * 10,
        maxHp: classData.baseStats.vitality * 10,
        mp: classData.baseStats.intelligence * 5,
        maxMp: classData.baseStats.intelligence * 5,
        gold: 100,
        inventory: [],
        equipment: {},
        skills: classData.startingSkills || [],
        location: 'starter_village',
        activeQuests: [],
        completedQuests: [],
        createdAt: new Date(),
        lastPlayed: new Date()
      };

      if (classData.startingEquipment && classData.startingEquipment.length > 0) {
        for (const itemId of classData.startingEquipment) {
          const itemData = allItems.find(i => i.id === itemId);
          if (itemData) {
            characterData.inventory.push({ ...itemData, quantity: 1 });
            if (itemData.type === 'equipment') {
              characterData.equipment[itemData.slot] = itemId;
            }
          }
        }
      }

      await setDoc(doc(db, 'characters', charId), characterData);

      const userRef = doc(db, 'users', user.username);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const updatedCharacters = [...(userData.characters || []), charId];
        await setDoc(userRef, { ...userData, characters: updatedCharacters });
        setUser({ ...user, characters: updatedCharacters });
      }

      setCharacters(prev => [...prev, characterData]);
      setIsCreating(false);
      setNewCharName('');
      setSelectedClass('');
      setMessage(`'${newCharName}' 캐릭터가 생성되었습니다!`);
    } catch (error) {
      console.error('Character creation error:', error);
      setMessage('캐릭터 생성 오류: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const selectCharacter = async (character) => {
    try {
      setLoading(true);
      setMessage('');

      const charRef = doc(db, 'characters', character.id);
      await setDoc(charRef, { ...character, lastPlayed: new Date() }, { merge: true });

      setUser({ ...user, currentCharacter: character.id });
      setGameState('game');

      const region = allRegions.find(r => r.id === character.location);
      const locationName = region ? region.name : character.location;

      const characterClass = allClasses.find(c => c.id === character.class);
      const className = characterClass ? characterClass.name : character.class;

      const welcomePrompt = `
        당신은 레벨 ${character.level}의 ${className} '${character.name}'입니다.
        현재 ${locationName}에 있습니다.
        당신의 모험을 시작하는 순간을 묘사해주세요.
        판타지 소설의 한 장면처럼 생생하게 묘사해주세요.
      `;

      const welcomeMessage = await callGeminiAPI(welcomePrompt);
      addGameLog(welcomeMessage);

    } catch (error) {
      console.error('Character selection error:', error);
      setMessage('캐릭터 선택 오류: ' + error.message);
      setLoading(false);
    }
  };

  return (
    <div className="character-screen">
      <h2>캐릭터 선택</h2>
      {message && <p className="status-message">{message}</p>}

      {!isCreating ? (
        <>
          <div className="character-list">
            {characters.length === 0 ? (
              <p>생성된 캐릭터가 없습니다.</p>
            ) : (
              characters.map(char => {
                const characterClass = allClasses.find(c => c.id === char.class);
                const className = characterClass ? characterClass.name : char.class;
                return (
                    <div key={char.id} className="character-item" onClick={() => selectCharacter(char)}>
                        <h3>{char.name} ({className})</h3>
                        <p>레벨: {char.level}</p>
                        <p>마지막 플레이: {char.lastPlayed?.toDate ? new Date(char.lastPlayed.toDate()).toLocaleString() : '정보 없음'}</p>
                    </div>
                );
              })
            )}
          </div>
          <button onClick={() => setIsCreating(true)} disabled={loading}>새 캐릭터 생성</button>
          <button onClick={() => { setUser(null); setGameState('login'); }} disabled={loading}>로그아웃</button>
        </>
      ) : (
        <div className="create-character-form">
          <h3>새 캐릭터 생성</h3>
          <div className="form-group">
            <label htmlFor="newCharName">캐릭터 이름:</label>
            <input
              type="text"
              id="newCharName"
              value={newCharName}
              onChange={(e) => setNewCharName(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="selectedClass">직업 선택:</label>
            <select
              id="selectedClass"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              disabled={loading || !allClasses.length}
            >
              <option value="">-- 직업을 선택하세요 --</option>
              {allClasses.map(cls => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
          </div>
          <button onClick={handleCreateCharacter} disabled={loading}>생성 완료</button>
          <button onClick={() => setIsCreating(false)} disabled={loading}>취소</button>
        </div>
      )}
    </div>
  );
}

export default CharacterScreen;