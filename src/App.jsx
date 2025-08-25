import React, { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

// --- 설정 ---
// Firebase 프로젝트 설정
const firebaseConfig = {
  apiKey: "AIzaSyBNJtmpRWzjobrY556bnHkwbZmpFJqgPX8",
  authDomain: "text-adventure-game-cb731.firebaseapp.com",
  projectId: "text-adventure-game-cb731",
  storageBucket: "text-adventure-game-cb731.appspot.com",
  messagingSenderId: "1092941614820",
  appId: "1:1092941614820:web:5545f36014b73c268026f1",
};

// LLM API 키
const GEMINI_MAIN_KEY = "AIzaSyDC11rqjU30OJnLjaBFOaazZV0klM5raU8";
const GEMINI_BACKUP_KEY = "AIzaSyAhscNjW8GmwKPuKzQ47blCY_bDanR-B84";
const GROQ_API_KEY = "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";

// LLM 모델명
const GEMINI_MAIN_MODEL = "gemini-2.0-flash-lite";
const GEMINI_BACKUP_MODEL = "gemini-2.5-flash-lite";
const GROQ_MODEL = "llama3-70b-8192";

// --- FIREBASE 초기화 ---
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const logsCollectionRef = collection(db, "game_logs");

// --- LLM API 호출기 ---
const generateLlmResponse = async (prompt) => {
  // 1. Gemini Main 시도
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MAIN_MODEL}:generateContent?key=${GEMINI_MAIN_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    if (!response.ok) throw new Error('Gemini Main API 실패');
    const data = await response.json();
    return data.candidates[0].content.parts[0].text.trim();
  } catch (error) {
    console.error("Gemini Main 실패:", error);
    // 2. Gemini Backup 시도
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_BACKUP_MODEL}:generateContent?key=${GEMINI_BACKUP_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      if (!response.ok) throw new Error('Gemini Backup API 실패');
      const data = await response.json();
      return data.candidates[0].content.parts[0].text.trim();
    } catch (backupError) {
      console.error("Gemini Backup 실패:", backupError);
      // 3. Groq 시도
      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messages: [{ role: 'user', content: prompt }],
            model: GROQ_MODEL,
          })
        });
        if (!response.ok) throw new Error('Groq API 실패');
        const data = await response.json();
        return data.choices[0].message.content.trim();
      } catch (groqError) {
        console.error("Groq 실패:", groqError);
        return "모든 AI 모델과의 통신에 실패했습니다. 잠시 후 다시 시도해주세요.";
      }
    }
  }
};

/**
 * LLM 응답에서 JSON 객체 문자열을 추출합니다.
 * 응답에 설명이나 마크다운이 포함되어 있어도 JSON 부분만 안전하게 분리합니다.
 * @param {string} str - LLM으로부터 받은 전체 응답 문자열
 * @returns {string|null} - 추출된 JSON 문자열 또는 null
 */
const extractJsonFromString = (str) => {
  const jsonMatch = str.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return jsonMatch[0];
  }
  return null;
};


function App() {
  const [character, setCharacter] = useState(null);
  const [gamePhase, setGamePhase] = useState('CREATION'); // 게임 단계: 'CREATION'(생성), 'PLAYING'(진행)
  const [creationInput, setCreationInput] = useState('');
  const [log, setLog] = useState([]);
  const [isPlayerTurn, setIsPlayerTurn] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const logEndRef = useRef(null);

  const addLog = useCallback(async (message, sender = 'SYSTEM') => {
    const newLog = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toLocaleTimeString(),
      message,
      sender
    };
    setLog(prev => [...prev, newLog]);
    try {
      await addDoc(logsCollectionRef, {
        message: newLog.message,
        sender: newLog.sender,
        timestamp: newLog.timestamp,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Firebase에 로그 저장 실패: ", error);
    }
  }, []);

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [log]);

  const runCharacterAction = useCallback(async (char) => {
    if (!char) return;
    setIsPlayerTurn(false);
    setIsThinking(true);
    await addLog(`${char.name}이(가) 다음 행동을 고민합니다...`, 'SYSTEM');

    const prompt = `
당신은 텍스트 RPG 속 캐릭터입니다.
세계관: 2025년, 대한민국 서울. 미지의 '크랙'이라는 프로그램 과부하로 차원 붕괴가 일어나, 서울은 폐허가 되고 변이체들이 들끓는 포스트 아포칼립스 세계가 되었습니다. 당신은 이 세계에 떨어진 이세계인입니다.
캐릭터 정보:
- 이름: ${char.name}
- 종족: ${char.race}
- 직업: ${char.class}
- 체력: ${char.hp}/${char.maxHp}
- 정신력: ${char.mental}/${char.maxMental}
- 현재상태: ${char.status}
- 소지품: ${char.inventory.join(', ')}
- 현재위치: ${char.location}

최근 로그 3개:
${log.slice(-3).map(l => `[${l.sender}] ${l.message}`).join('\n')}

위 상황을 바탕으로, 캐릭터의 다음 행동을 한국어로, 1~2개의 짧은 문장으로 서술해주세요.
당신의 행동은 당신의 상태와 주변 환경에 기반해야 합니다.
예시: 무너진 벽에 기대 가쁜 숨을 몰아쉽니다. "여긴... 너무 위험해."
절대로 따옴표나 캐릭터 이름을 포함하지 마세요. 오직 행동 서술만 출력하세요.
`;

    const actionText = await generateLlmResponse(prompt);
    await addLog(actionText, 'CHARACTER');

    setIsThinking(false);
    setTimeout(async () => {
      await addLog('당신은 이 상황에 개입할 수 있습니다. 어떤 유희를 즐기시겠습니까?', 'SYSTEM');
      setIsPlayerTurn(true);
    }, 1000);

  }, [addLog, log]);

  const handleCreateCharacter = async () => {
    if (!creationInput.trim() || isThinking) {
      await addLog("관찰하고 싶은 캐릭터의 특징을 입력해주세요.", "SYSTEM");
      return;
    }
    setIsThinking(true);
    await addLog(`'${creationInput}' 특징을 가진 존재를 탐색합니다...`, "CONSTELLATION");

    const creationPrompt = `
당신은 텍스트 기반 RPG의 창의적인 게임 마스터입니다.
세계관: 2025년 대한민국 서울, 거대한 차원 균열로 인해 포스트 아포칼립스 폐허가 되었습니다. 이 세계는 변이된 생명체와 다른 차원에서 온 존재들로 가득합니다.
'성좌'(플레이어)가 이 혼란스러운 서울에 막 소환된 새로운 캐릭터를 관찰하고 싶어합니다.
성좌가 요청한 캐릭터의 특징은 다음과 같습니다: "${creationInput}"

이 요청을 바탕으로, 독창적인 캐릭터를 생성해주세요. 당신의 답변은 반드시 유효한 단일 JSON 객체여야만 합니다. 텍스트, 설명, 또는 \`\`\`json과 같은 마크다운을 포함하지 마세요. 답변은 반드시 { 로 시작해서 } 로 끝나야 합니다.

JSON 구조는 반드시 다음을 따라야 합니다:
{
  "name": "독특한 한국 또는 판타지 스타일의 이름",
  "race": "판타지 종족 (예: 엘프, 드워프, 인간, 수인) 또는 독창적인 컨셉",
  "class": "캐릭터에 어울리는 직업 또는 클래스 (예: 기사, 마법사, 도적, 약초꾼)",
  "hp": 100,
  "maxHp": 100,
  "mental": 80,
  "maxMental": 100,
  "status": "혼란",
  "inventory": ["기본 무기나 개인적인 장신구와 같은 2-3개의 간단한 시작 아이템 배열"],
  "location": "종로 3가역 폐허",
  "backstory": "서울에 도착하기 전 어떤 인물이었는지 설명하는, 한국어로 된 짧은 한 문장의 배경 이야기"
}
`;
    const responseText = await generateLlmResponse(creationPrompt);
    const jsonString = extractJsonFromString(responseText);

    if (!jsonString) {
      console.error("LLM 응답에서 JSON 추출 실패:", responseText);
      await addLog("캐릭터 생성에 실패했습니다. AI가 유효한 형식의 데이터를 반환하지 않았습니다. 다른 키워드로 다시 시도해주세요.", "SYSTEM");
      setIsThinking(false);
      return;
    }

    try {
      const newCharData = JSON.parse(jsonString);
      setCharacter(newCharData);

      await addLog(`2025년 8월, 서울. 대붕괴 후 10일.`);
      await addLog(`당신의 부름에 응답한 존재는 이세계에서 온 ${newCharData.race}, '${newCharData.name}'입니다.`);
      await addLog(`[배경] ${newCharData.backstory}`, 'SYSTEM');

      setGamePhase('PLAYING');
      setIsThinking(false);

      setTimeout(() => runCharacterAction(newCharData), 3000);
    } catch (e) {
      console.error("JSON 파싱 실패:", e, "JSON 문자열:", jsonString);
      await addLog("캐릭터 생성에 실패했습니다. AI가 반환한 데이터의 구조가 올바르지 않습니다. 다른 키워드로 다시 시도해주세요.", "SYSTEM");
      setIsThinking(false);
    }
  };

  const handleIntervention = useCallback(async (type) => {
    if (!isPlayerTurn || isThinking || !character) return;

    setIsPlayerTurn(false);
    setIsThinking(true);

    let interventionLog = '';
    let characterEffectDescription = '';
    const newCharacterState = { ...character };

    switch (type) {
      case 'blessing':
        interventionLog = `[개입] 당신은 ${character.name}에게 [작은 축복]을 내립니다.`;
        characterEffectDescription = `${character.name}의 몸에 따스한 기운이 감돌며 상처와 피로가 약간 회복됩니다.`;
        newCharacterState.hp = Math.min(character.maxHp, character.hp + 15);
        newCharacterState.mental = Math.min(character.maxMental, character.mental + 10);
        newCharacterState.status = '안정';
        break;
      case 'whisper':
        interventionLog = `[개입] 당신은 ${character.name}의 귓가에 [미래의 파편]을 속삭입니다.`;
        characterEffectDescription = `${character.name}은(는) 정체불명의 목소리에 잠시 혼란스러워했지만, 곧 다가올 위험을 감지한 듯 주변을 더욱 경계하기 시작합니다.`;
        newCharacterState.mental = Math.max(0, character.mental - 5);
        break;
      case 'curse':
        interventionLog = `[개입] 당신은 ${character.name}에게 [사소한 악몽]을 보냅니다.`;
        characterEffectDescription = `갑작스러운 두통과 함께 끔찍한 환영이 ${character.name}의 머릿속을 스쳐 지나갑니다.`;
        newCharacterState.mental = Math.max(0, character.mental - 20);
        newCharacterState.status = '극심한 불안';
        break;
      default:
        setIsThinking(false);
        return;
    }

    await addLog(interventionLog, 'CONSTELLATION');
    setCharacter(newCharacterState);
    await addLog(characterEffectDescription, 'SYSTEM');

    const reactionPrompt = `
당신은 텍스트 RPG 속 캐릭터, ${character.name}입니다.
방금 전, '성좌'라고 불리는 초월적 존재가 당신에게 개입했습니다.

개입 내용: ${interventionLog}
당신이 느낀 것: ${characterEffectDescription}

이 신비하고 불가해한 경험에 대한 당신의 반응을 한국어로, 1~2개의 짧은 문장으로 서술해주세요.
절대로 따옴표나 캐릭터 이름을 포함하지 마세요. 오직 행동 서술만 출력하세요.
`;

    const reactionText = await generateLlmResponse(reactionPrompt);
    await addLog(reactionText, 'CHARACTER');

    setIsThinking(false);

    setTimeout(() => {
      runCharacterAction(newCharacterState);
    }, 2000);
  }, [isPlayerTurn, isThinking, character, addLog, runCharacterAction]);

  const renderCharacterCreation = () => (
      <div className="creation-container">
        <div className="creation-panel">
          <h2>관찰 대상 창조</h2>
          <p>어떤 존재의 이야기를 지켜보시겠습니까?<br />원하는 캐릭터의 특징을 간략하게 서술해주세요.</p>
          <p className="creation-example">(예: 신념을 잃은 성기사, 노래를 사랑하는 엘프, 복수심에 불타는 수인)</p>
          <input
              type="text"
              className="creation-input"
              value={creationInput}
              onChange={(e) => setCreationInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateCharacter()}
              placeholder="캐릭터 특징 입력..."
              disabled={isThinking}
          />
          <button
              className="creation-button"
              onClick={handleCreateCharacter}
              disabled={isThinking}
          >
            {isThinking ? '존재를 빚는 중...' : '새로운 연대기 시작'}
          </button>
          {log.length > 0 && (
              <div className="creation-log">
                {log.map((entry) => (
                    <p key={entry.id} className={`log-entry ${entry.sender.toLowerCase()}`}>
                      <span className="timestamp">[{entry.timestamp}]</span>
                      <span className="sender">[{entry.sender}]</span>
                      <span className="message">{entry.message}</span>
                    </p>
                ))}
                <div ref={logEndRef} />
              </div>
          )}
        </div>
      </div>
  );

  const renderMainGame = () => (
      <main className="game-container">
        <div className="character-status-panel">
          <h2>관찰 대상 정보</h2>
          <div className="status-grid">
            <p><strong>이름:</strong> {character.name}</p>
            <p><strong>종족:</strong> {character.race}</p>
            <p><strong>HP:</strong> <span style={{ color: character.hp < character.maxHp * 0.3 ? 'red' : 'inherit' }}>{character.hp} / {character.maxHp}</span></p>
            <p><strong>정신력:</strong> <span style={{ color: character.mental < character.maxMental * 0.3 ? 'blue' : 'inherit' }}>{character.mental} / {character.maxMental}</span></p>
            <p><strong>상태:</strong> {character.status}</p>
            <p><strong>위치:</strong> {character.location}</p>
          </div>
          <h3>소지품</h3>
          <ul>
            {character.inventory.map((item, index) => (
                <li key={index}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="log-panel">
          <div className="log-window">
            {log.map((entry) => (
                <p key={entry.id} className={`log-entry ${entry.sender.toLowerCase()}`}>
                  <span className="timestamp">[{entry.timestamp}]</span>
                  <span className="sender">[{entry.sender}]</span>
                  <span className="message">{entry.message}</span>
                </p>
            ))}
            <div ref={logEndRef} />
          </div>
          <div className="intervention-panel">
            <h3>성좌 개입 {isThinking && '(AI 생각 중...)'}</h3>
            <div className="intervention-buttons">
              <button onClick={() => handleIntervention('blessing')} disabled={!isPlayerTurn || isThinking}>
                축복 내리기
              </button>
              <button onClick={() => handleIntervention('whisper')} disabled={!isPlayerTurn || isThinking}>
                진실 속삭이기
              </button>
              <button onClick={() => handleIntervention('curse')} disabled={!isPlayerTurn || isThinking}>
                악몽 보내기
              </button>
            </div>
          </div>
        </div>
      </main>
  );

  return (
      <div className="App">
        <header className="app-header">
          <h1>Project: TWOW (The World of Worlds)</h1>
          <p>포스트 아포칼립스 성좌물 ARPG</p>
        </header>
        {gamePhase === 'CREATION' ? renderCharacterCreation() : renderMainGame()}
      </div>
  );
}

export default App; 