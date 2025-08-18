import React, { useState, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, getDocs, collection } from 'firebase/firestore';
import './App.css';
import LoginScreen from './components/LoginScreen';
import CharacterScreen from './components/CharacterScreen';
import GameScreen from './components/GameScreen';
import { checkAndInitializeDatabase } from './db';

// Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyBNJtmpRWzjobrY556bnHkwbZmpFJqgPX8',
  authDomain: 'text-adventure-game-cb731.firebaseapp.com',
  projectId: 'text-adventure-game-cb731',
  storageBucket: 'text-adventure-game-cb731.appspot.com',
  messagingSenderId: '1092941614820',
  appId: '1:1092941614820:web:5545f36014b73c268026f1',
  measurementId: 'G-FNGF42T1FP',
};

// LLM API Keys
const DEFAULT_KEYS = {
  geminiMainKey: 'AIzaSyDC11rqjU30OJnLjaBFOaazZV0klM5raU8',
  geminiSubKey: 'AIzaSyAhscNjW8GmwKPuKzQ47blCY_bDanR-B84',
  groqKey: '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'
};

// LLM Models
const MODELS = {
  geminiMain: 'gemini-2.0-flash-lite',
  geminiBackup: 'gemini-2.5-flash-lite',
  groq: 'llama3-70b-8192'
};

function App() {
  const [initialized, setInitialized] = useState(false);
  const [db, setDb] = useState(null);
  const [apiKeys, setApiKeys] = useState(DEFAULT_KEYS);
  const [user, setUser] = useState(null);
  const [gameState, setGameState] = useState('login'); // login, character, game
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [gameLog, setGameLog] = useState([]);

  const [allGameData, setAllGameData] = useState({
    skills: [],
    quests: [],
    items: [],
    regions: [],
    classes: [],
    monsters: [],
  });

  useEffect(() => {
    const app = initializeApp(firebaseConfig);
    const firestore = getFirestore(app);
    setDb(firestore);

    checkAndInitializeDatabase(firestore, setLoading, setMessage, setInitialized);
  }, []);

  useEffect(() => {
    const loadAllGameData = async () => {
      if (!db) return;
      setLoading(true);
      setMessage('게임 기본 데이터 로딩 중...');
      try {
        const [skillsSnap, questsSnap, itemsSnap, regionsSnap, classesSnap, monstersSnap] = await Promise.all([
          getDocs(collection(db, 'skills')),
          getDocs(collection(db, 'quests')),
          getDocs(collection(db, 'items')),
          getDocs(collection(db, 'regions')),
          getDocs(collection(db, 'classes')),
          getDocs(collection(db, 'monsters')),
        ]);
        setAllGameData({
            skills: skillsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })),
            quests: questsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })),
            items: itemsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })),
            regions: regionsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })),
            classes: classesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })),
            monsters: monstersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        });
        setMessage('게임 데이터 로드 완료!');
      } catch (error) {
        console.error('Game data loading error:', error);
        setMessage('게임 기본 데이터 로드 오류: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    if (initialized) {
      loadAllGameData();
    }
  }, [db, initialized]);


  const addGameLog = useCallback((message) => {
    setGameLog(prev => [...prev, { id: Date.now(), message, timestamp: new Date() }]);
  }, []);

  const callGroqAPI = useCallback(async (prompt) => {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKeys.groqKey}`,
        },
        body: JSON.stringify({
          model: MODELS.groq,
          messages: [
            {
              role: 'system',
              content: '당신은 판타지 MMORPG의 내러티브를 생성하는 AI 게임 마스터(GM)입니다. 다음 지침을 엄격히 따라주세요: 1. 모든 응답은 한국어로 작성합니다. 2. 플레이어의 행동, 결과, 주변 환경을 생생하고 몰입감 있게 묘사합니다. 3. 전투, 탐험, 아이템 획득, 퀘스트 진행 등 다양한 상황에 맞는 흥미진진한 이야기를 만들어냅니다. 4. 응답은 항상 친절하고 게임 마스터(GM)와 같은 톤을 유지하며, 너무 길지 않게 3~5문장으로 요약합니다.'
            },
            { role: 'user', content: prompt }
          ],
          temperature: 0.8, // 창의적인 묘사를 위해 온도 살짝 올림
          max_tokens: 1024,
        }),
      });
      const data = await response.json();
      if (data.error) {
        console.error('Groq API 오류:', data.error);
        return '죄송합니다. Groq API 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      }
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Groq API 호출 오류:', error);
      return '죄송합니다. 게임 서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.';
    }
  }, [apiKeys.groqKey]);

  const callGeminiBackupAPI = useCallback(async (prompt) => {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/${MODELS.geminiBackup}:generateContent?key=${apiKeys.geminiSubKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, topK: 40, topP: 0.95, maxOutputTokens: 1000 }
        }),
      });
      const data = await response.json();
      if (data.error) {
        console.error('Gemini 백업 API 오류:', data.error);
        return callGroqAPI(prompt);
      }
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Gemini 백업 API 호출 오류:', error);
      return callGroqAPI(prompt);
    }
  }, [apiKeys.geminiSubKey, callGroqAPI]);

  const callGeminiAPI = useCallback(async (prompt) => {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/${MODELS.geminiMain}:generateContent?key=${apiKeys.geminiMainKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, topK: 40, topP: 0.95, maxOutputTokens: 1000 }
        }),
      });
      const data = await response.json();
      if (data.error) {
        console.error('Gemini API 오류:', data.error);
        return callGeminiBackupAPI(prompt);
      }
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Gemini API 호출 오류:', error);
      return callGeminiBackupAPI(prompt);
    }
  }, [apiKeys.geminiMainKey, callGeminiBackupAPI]);

  const renderGameState = () => {
    switch (gameState) {
      case 'login':
        return <LoginScreen 
                  db={db} 
                  setLoading={setLoading} 
                  setMessage={setMessage} 
                  setUser={setUser} 
                  setGameState={setGameState} 
                  loading={loading} 
                  message={message} 
                />;
      case 'character':
        return <CharacterScreen 
                  db={db} 
                  user={user} 
                  setUser={setUser} 
                  setGameState={setGameState} 
                  setLoading={setLoading} 
                  setMessage={setMessage} 
                  loading={loading} 
                  message={message} 
                  addGameLog={addGameLog}
                  callGeminiAPI={callGeminiAPI}
                  allClasses={allGameData.classes}
                  allRegions={allGameData.regions}
                  allItems={allGameData.items}
                />;
      case 'game':
        return <GameScreen 
                  db={db} 
                  user={user} 
                  setGameState={setGameState} 
                  addGameLog={addGameLog} 
                  gameLog={gameLog} 
                  callGeminiAPI={callGeminiAPI} 
                  callGroqAPI={callGroqAPI} 
                  setLoading={setLoading} 
                  setMessage={setMessage} 
                  loading={loading} 
                  message={message} 
                  allGameData={allGameData}
                />;
      default:
        return null;
    }
  }

  return (
    <div className="App">
      <h1>Project TWOW</h1>
      {!initialized || (loading && !user) ? (
        <div className="initializing">
          <p>{message}</p>
          {loading && <div className="spinner"></div>}
        </div>
      ) : (
        renderGameState()
      )}
    </div>
  );
}

export default App;
