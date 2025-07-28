import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, onSnapshot, collection, getDocs, query } from 'firebase/firestore';

function App() {
  // --- GLOBAL STATE ---
  const [gameState, setGameState] = useState({});
  const [activeCaseData, setActiveCaseData] = useState({});
  const [currentView, setCurrentView] = useState('main');
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  const defaultGameState = {
    activeNPC: null,
    pinnedEvidence: [],
    knowledgeGraph: { nodes: [], edges: [], isConnectMode: false, firstNodeToConnect: null },
    caseSolved: false,
    chatHistory: {},
    analyzedEvidence: []
  };

  // --- MODALS STATE ---
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isBriefingModalOpen, setIsBriefingModalOpen] = useState(false);
  const [isForensicsModalOpen, setIsForensicsModalOpen] = useState(false);
  const [isHintModalOpen, setIsHintModalOpen] = useState(false);
  const [isCharacterInfoModalOpen, setIsCharacterInfoModalOpen] = useState(false);
  const [reportContent, setReportContent] = useState('');
  const [briefingContent, setBriefingContent] = useState('');
  const [forensicsContent, setForensicsContent] = useState('');
  const [hintContent, setHintContent] = useState('');
  const [characterInfoContent, setCharacterInfoContent] = useState('');
  
  // --- CUSTOM PROMPT MODALS STATE ---
  const [isAccusePromptOpen, setIsAccusePromptOpen] = useState(false);
  const [accuseSuspectName, setAccuseSuspectName] = useState('');
  const [isRelationshipPromptOpen, setIsRelationshipPromptOpen] = useState(false);
  const [relationshipType, setRelationshipType] = useState('관련성');
  const [evidenceToConnect, setEvidenceToConnect] = useState(null);

  // --- NOTIFICATION STATE ---
  const [notification, setNotification] = useState({ message: '', type: '' });

  // --- CASE CREATION STATE ---
  const [casePrompt, setCasePrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState('');
  const [difficulty, setDifficulty] = useState('normal'); // 'easy', 'normal', 'hard'
  
  // --- UI/UX SETTINGS STATE ---
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [uiTheme, setUiTheme] = useState(() => {
    // Try to get theme from localStorage, default to 'dark'
    const savedTheme = localStorage.getItem('uiTheme');
    return savedTheme || 'dark';
  });
  
  // Define theme options
  const themeOptions = {
    dark: {
      name: '다크 테마',
      description: '어두운 배경의 기본 테마',
      colors: {
        background: 'bg-gray-900',
        card: 'bg-gray-800',
        cardHover: 'hover:bg-gray-700',
        accent: 'bg-blue-600',
        accentHover: 'hover:bg-blue-700',
        text: 'text-white',
        textSecondary: 'text-gray-400',
        border: 'border-gray-700'
      }
    },
    light: {
      name: '라이트 테마',
      description: '밝은 배경의 테마',
      colors: {
        background: 'bg-gray-100',
        card: 'bg-white',
        cardHover: 'hover:bg-gray-50',
        accent: 'bg-blue-500',
        accentHover: 'hover:bg-blue-600',
        text: 'text-gray-900',
        textSecondary: 'text-gray-600',
        border: 'border-gray-200'
      }
    },
    noir: {
      name: '느와르 테마',
      description: '고전적인 탐정 느와르 스타일',
      colors: {
        background: 'bg-black',
        card: 'bg-gray-900',
        cardHover: 'hover:bg-gray-800',
        accent: 'bg-red-900',
        accentHover: 'hover:bg-red-800',
        text: 'text-gray-300',
        textSecondary: 'text-gray-500',
        border: 'border-gray-800'
      }
    }
  };

  // --- CHAT STATE ---
  const [chatInput, setChatInput] = useState('');
  const [chatLog, setChatLog] = useState([]);

  // --- TAB STATE ---
  const [activeTab, setActiveTab] = useState('people');

  // --- FIREBASE STATE ---
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [appId, setAppId] = useState('default-app-id');

  // --- CASE LIST STATE ---
  const [caseList, setCaseList] = useState([]);

  // --- INITIALIZATION ---
  useEffect(() => {
    const initializeFirebase = async () => {
      try {
        const firebaseConfig = {
          apiKey: 'AIzaSyBNJtmpRWzjobrY556bnHkwbZmpFJqgPX8',
          authDomain: 'text-adventure-game-cb731.firebaseapp.com',
          projectId: 'text-adventure-game-cb731',
          storageBucket: 'text-adventure-game-cb731.appspot.com',
          messagingSenderId: '1092941614820',
          appId: '1:1092941614820:web:5545f36014b73c268026f1',
        };

        const appIdFromEnv = appId;
        setAppId(appIdFromEnv);

        const app = initializeApp(firebaseConfig);
        const firestore = getFirestore(app);
        const fireAuth = getAuth(app);

        setDb(firestore);
        setAuth(fireAuth);

        onAuthStateChanged(fireAuth, user => {
          if (user) {
            setUserId(user.uid);
            setLoading(false);
            setCurrentView('main');
          }
        });

        
        await signInAnonymously(fireAuth);
        
      } catch (error) {
        console.error("Firebase 초기화 실패:", error);
        setLoading(false);
      }
    };

    initializeFirebase();
  }, []);

  // --- HELPER FUNCTIONS ---
  const showNotification = (message, type) => {
    setNotification({ message, type });

    // Auto-hide notification after 3 seconds
    setTimeout(() => {
      setNotification({ message: '', type: '' });
    }, 3000);
  };

  const changeTab = (tabName) => {
    setActiveTab(tabName);
  };

  // --- CASE FUNCTIONS ---
  const loadCaseArchive = async () => {
    if (!db || !appId) return;

    try {
      const casesRef = collection(db, "artifacts", appId, "cases");
      const querySnapshot = await getDocs(query(casesRef));

      if (querySnapshot.empty) {
        setCaseList([]);
        return;
      }

      const cases = [];
      querySnapshot.forEach(doc => {
        cases.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      // Sort cases by creation date (newest first)
      cases.sort((a, b) => {
        // If createdAt doesn't exist, use 0 as default (oldest)
        const dateA = a.createdAt || 0;
        const dateB = b.createdAt || 0;
        return dateB - dateA; // Descending order (newest first)
      });

      setCaseList(cases);
    } catch (error) {
      console.error("사건 목록 로딩 실패:", error);
      showNotification("사건 목록을 불러오는데 실패했습니다.", "error");
    }
  };
  
  const deleteCase = async (caseId) => {
    if (!db || !appId) return;
    
    try {
      // Delete case document from Firestore
      await setDoc(doc(db, "artifacts", appId, "cases", caseId), {
        deleted: true,
        deletedAt: new Date().getTime()
      }, { merge: true });
      
      // Also delete user progress if exists
      if (userId) {
        try {
          await setDoc(doc(db, "artifacts", appId, "users", userId, "progress", caseId), {
            deleted: true,
            deletedAt: new Date().getTime()
          }, { merge: true });
        } catch (error) {
          console.error("사용자 진행 상태 삭제 실패:", error);
          // Continue even if progress deletion fails
        }
      }
      
      // Update local case list
      setCaseList(prevList => prevList.filter(item => item.id !== caseId));
      
      showNotification("사건이 삭제되었습니다.", "success");
    } catch (error) {
      console.error("사건 삭제 실패:", error);
      showNotification("사건을 삭제하는데 실패했습니다.", "error");
    }
  };

  const playCase = async (caseId, caseData) => {
    setActiveCaseData({ ...caseData, id: caseId });

    try {
      const progressRef = doc(db, "artifacts", appId, "users", userId, "progress", caseId);
      const progressSnap = await getDoc(progressRef);

      if (progressSnap.exists()) {
        setGameState(progressSnap.data());
      } else {
        const newGameState = JSON.parse(JSON.stringify(defaultGameState));
        // Add check to ensure characters array exists and has elements
        if (caseData.characters && caseData.characters.length > 0) {
          // Character selection based on difficulty
          const difficulty = caseData.difficulty || 'normal';
          
          if (difficulty === 'easy') {
            // For easy difficulty, select the character most likely to provide useful information
            // (excluding the murderer if possible)
            const groundTruth = caseData.groundTruth || {};
            const murdererId = groundTruth.murdererId;
            
            // Try to find a character with the most evidence or knowledge
            const charactersWithEvidence = caseData.characters.map(char => {
              const evidenceCount = (caseData.evidence || []).filter(e => e.characterId === char.id).length;
              return { ...char, evidenceCount };
            });
            
            // Sort by evidence count (descending) and exclude murderer if possible
            charactersWithEvidence.sort((a, b) => {
              // If one is the murderer and the other isn't, prioritize the non-murderer
              if (a.id === murdererId && b.id !== murdererId) return 1;
              if (a.id !== murdererId && b.id === murdererId) return -1;
              // Otherwise sort by evidence count
              return b.evidenceCount - a.evidenceCount;
            });
            
            // Select the first character after sorting
            newGameState.activeNPC = charactersWithEvidence[0].id;
          } else {
            // For normal and hard difficulty, just select the first character
            newGameState.activeNPC = caseData.characters[0].id;
          }
        } else {
          console.warn("No characters found in case data");
          // Set a default or placeholder value if no characters exist
          newGameState.activeNPC = "default";
        }
        setGameState(newGameState);

        // Show briefing modal
        const briefingText = caseData.briefing ? caseData.briefing.replace(/\n/g, '<br>') : '브리핑 내용이 없습니다.';
                setBriefingContent(`
          <h2 class="text-2xl font-bold text-blue-400 mb-4">사건 브리핑: ${caseData.title || '제목 없음'}</h2>
          <div class="prose prose-invert max-w-none">${briefingText}</div>
        `);

        setIsBriefingModalOpen(true);
      }

      setCurrentView('play');
      initPlayUI(caseData);
    } catch (error) {
      console.error("사건 로딩 실패:", error);
      showNotification("사건을 불러오는데 실패했습니다.", "error");
    }
  };

  const generateAndSaveCase = async () => {
    const theme = casePrompt.trim();
    if (!theme) {
      showNotification("사건 주제를 입력해주세요.", "error");
      return;
    }

    setIsGenerating(true);
    setGenerationStatus("AI가 시나리오를 구상하고 있습니다. 최대 30초가 소요될 수 있습니다.");

    const caseSchema = {
      type: "OBJECT",
      properties: {
        title: { type: "STRING" },
        summary: { type: "STRING" },
        briefing: { type: "STRING" },
        difficulty: { type: "STRING", enum: ["easy", "normal", "hard"] },
        createdAt: { type: "NUMBER" }, // Timestamp for sorting
        groundTruth: {
          type: "OBJECT",
          properties: {
            murdererId: { type: "STRING" },
            motive: { type: "STRING" },
            trick: { type: "STRING" },
            keyEvidenceIds: { type: "ARRAY", items: { type: "STRING" } }
          }
        },
        characters: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              id: { type: "STRING" },
              name: { type: "STRING" },
              role: { type: "STRING" },
              personality: { type: "STRING" },
              intro: { type: "STRING" },
              introEvidenceId: { type: "STRING" }
            }
          }
        },
        evidence: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              id: { type: "STRING" },
              characterId: { type: "STRING" },
              text: { type: "STRING" },
              type: { type: "STRING", enum: ["alibi", "contradiction", "motive", "clue", "physical"] },
              forensicsAnalysis: { type: "STRING" }
            }
          }
        },
        knowledge: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              characterId: { type: "STRING" },
              evidenceId: { type: "STRING" },
              reaction: { type: "STRING" }
            }
          }
        }
      }
    };
    const systemInstruction = {
      parts: [{
        text: `당신은 "살아있는 사건 파일" 스타일의 탐정 RPG 게임 시나리오 전문 작가입니다. 사용자의 주제를 바탕으로 플레이어가 능동적으로 추리해나가는 정교한 미스터리 시나리오를 만들어 주세요.

## "살아있는 사건 파일" 탐정 RPG 핵심 요소
1. 플레이어 주도 서사: 플레이어는 미리 짜인 선택지가 아닌, 자연어 대화와 추리를 통해 진실을 구축해나가는 능동적인 탐정
2. 5단계 게임플레이 루프: 심문(Interrogate) → 추출(Extract) → 교차 검증(Cross-Reference) → 추리(Deduce) → 고발(Accuse)
3. NPC 상호작용: 각 NPC는 고유의 성격, 동기, 비밀, 지식 범위를 가지며, 거짓말하거나 회피할 수 있음
4. 증거 추출과 고정: 플레이어는 NPC 증언에서 중요 정보를 발견하여 '증거로 고정(Pin)'하는 과정이 핵심
5. 교차 검증 메커니즘: 한 NPC에게서 얻은 증거를 다른 NPC에게 제시하여 반응을 확인하는 퍼즐 요소
6. 지식 그래프 구축: 플레이어는 증거 노드들을 논리적 관계로 연결하여 자신만의 추리 지도를 완성해야 함

## 시나리오 구성 지침
- 고립된 배경과 밀실 미스터리 요소 포함 (외딴 섬, 산장, 밀실 등)
- 모든 캐릭터는 뚜렷한 개성, 말투, 복잡한 동기와 비밀을 가진 입체적 인물로 설계
- 피해자(1-2명), 용의자/증인(3-5명), 탐정(플레이어 역할), 조력자 등으로 구성
- 각 NPC는 '알고 있는 사실'과 '모르는 사실'의 경계가 명확하게 정의되어야 함
- 트릭과 단서는 논리적이고 치밀하게 설계하되, 플레이어가 발견할 수 있도록 명확히 제시
- '사건의 진실 바이블'을 기반으로 모든 증거와 증언이 일관성 있게 설계되어야 함

## 증거 유형별 작성 지침
- alibi(알리바이): 범행 시간대 행적 증언, 진실/거짓 알리바이 혼합, 교차 검증 시 모순점 발견 가능
- contradiction(모순): 다른 증거/증언과 충돌하는 내용, 교차 검증을 통해 발견 가능한 명확한 모순점
- motive(동기): 범행 동기 암시/드러내는 증거, 표면적 동기와 실제 동기 구분
- clue(단서): 사건 해결에 도움되는 정보, 다른 증거와 연결하여 새로운 사실 밝힐 수 있는 단서
- physical(물리적 증거): 현장 발견 물리적 증거, 과학적 정확성, 결정적 증거로 활용 가능

## 지식 그래프 설계 지침
- 모든 증거는 다른 증거와 최소 하나 이상의 논리적 연결점을 가져야 함
- 핵심 증거들은 여러 NPC의 증언과 교차 검증될 수 있도록 설계
- 진범을 지목하기 위해서는 동기, 기회, 수단을 모두 증명할 수 있는 증거 체인이 필요

출력은 제공된 JSON 스키마를 완벽하게 준수하는 단일의 유효한 JSON 객체여야 합니다. JSON 객체 전후에 텍스트를 포함하지 말고 \`\`\`json과 같은 마크다운 태그도 포함하지 마십시오. 사용자의 모든 텍스트 내용(제목, 요약, 이름 등)은 한국어로 작성해야 합니다. 이모지 사용은 금지됩니다.`
      }]
    };

    const prompt = `사건 주제: ${theme}.`;
    const payload = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      system_instruction: systemInstruction,
      generationConfig: { responseMimeType: "application/json", responseSchema: caseSchema }
    };

    // Maximum number of retries
    const maxRetries = 2;
    let retryCount = 0;
    let success = false;

    try {
      while (retryCount <= maxRetries && !success) {
        try {
          // If this is a retry, update the status
          if (retryCount > 0) {
            setGenerationStatus(`AI 응답에 문제가 있어 다시 시도 중입니다... (${retryCount}/${maxRetries})`);
          }

          const resultText = await callGeminiAPI(payload);
          let newCase;

          // Parse the JSON response
          newCase = JSON.parse(resultText);
          
          // Additional validation of the case data structure
          if (!newCase.title || !newCase.summary || !newCase.briefing) {
            throw new Error("필수 필드(제목, 요약, 브리핑)가 누락되었습니다.");
          }
          
          if (!newCase.characters || !Array.isArray(newCase.characters) || newCase.characters.length === 0) {
            throw new Error("등장인물 정보가 누락되었습니다.");
          }
          
          if (!newCase.evidence || !Array.isArray(newCase.evidence) || newCase.evidence.length === 0) {
            throw new Error("증거 정보가 누락되었습니다.");
          }
          
          // Check if at least one physical evidence exists
          const hasPhysicalEvidence = newCase.evidence.some(e => e.type === "physical");
          if (!hasPhysicalEvidence) {
            throw new Error("물리적 증거가 누락되었습니다.");
          }

          // If we get here, the case data is valid
          // Add difficulty and timestamp to the case data
          newCase.difficulty = difficulty;
          newCase.createdAt = Date.now();
          
          const caseId = crypto.randomUUID();
          await setDoc(doc(db, "artifacts", appId, "cases", caseId), newCase);

          showNotification("새로운 사건 파일이 생성되어 보관실에 저장되었습니다!", "success");
          setCasePrompt('');
          setCurrentView('archive');
          await loadCaseArchive();
          
          // Mark as successful to exit the retry loop
          success = true;
          
        } catch (error) {
          console.error(`시도 ${retryCount + 1}/${maxRetries + 1} 실패:`, error);
          
          // If we've reached max retries, throw the error to be caught by the outer catch block
          if (retryCount >= maxRetries) {
            throw new Error(`AI가 유효한 사건 데이터를 생성하지 못했습니다: ${error.message}`);
          }
          
          // Otherwise, increment retry count and continue the loop
          retryCount++;
        }
      }
      
      // If we get here and success is still false, it means all retries failed
      if (!success) {
        throw new Error("여러 번 시도했으나 AI가 유효한 사건 데이터를 생성하지 못했습니다. 다른 주제로 다시 시도해보세요.");
      }
      
    } catch (e) {
      console.error("사건 생성 실패:", e);
      showNotification(`사건 생성에 실패했습니다: ${e.message}`, "error");
    } finally {
      setIsGenerating(false);
      setGenerationStatus("");
    }
  };

  // --- API FUNCTIONS ---
  const callGeminiAPI = async (payload) => {
    try {
      const apiKey = "AIzaSyDC11rqjU30OJnLjaBFOaazZV0klM5raU8";
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        let errorDetails = response.statusText;
        try {
          const errorJson = await response.json();
          errorDetails = errorJson.error.message || JSON.stringify(errorJson);
        } catch (e) {}
        throw new Error(`API 요청 실패: ${errorDetails}`);
      }

      const result = await response.json();

      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts) {
        const responseText = result.candidates[0].content.parts[0].text;
        
        // Check if the response is expected to be JSON (based on payload)
        if (payload.generationConfig && payload.generationConfig.responseMimeType === "application/json") {
          // Validate and sanitize the JSON response
          try {
            // More comprehensive emoji detection using regex
            // This covers most emoji ranges including emoticons, symbols, transport, etc.
            const emojiRegex = /[\u{1F000}-\u{1F9FF}\u{2600}-\u{27BF}\u{2B50}\u{2B55}\u{203C}\u{2049}\u{20E3}\u{FE0F}]/u;
            if (emojiRegex.test(responseText)) {
              console.warn("API response contains emojis despite instructions not to use them");
              throw new Error("API 응답에 이모지가 포함되어 있습니다. 다시 시도해주세요.");
            }
            
            // Check for extremely long strings that might indicate an error
            if (responseText.length > 50000) {
              console.warn("API response is extremely long, likely an error");
              throw new Error("API 응답이 너무 깁니다. 다시 시도해주세요.");
            }
            
            // Check for extremely long titles or text (likely indicates an issue)
            try {
              const parsedJson = JSON.parse(responseText);
              
              // Check title length - if it's extremely long, it's probably an error
              if (parsedJson.title && parsedJson.title.length > 200) {
                console.warn("API response contains an extremely long title:", parsedJson.title.substring(0, 100) + "...");
                throw new Error("API 응답의 제목이 너무 깁니다. 다시 시도해주세요.");
              }
              
              // Check for excessive special characters in title
              const specialCharRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
              const specialCharCount = (parsedJson.title.match(specialCharRegex) || []).length;
              if (specialCharCount > 10) {
                console.warn("API response contains too many special characters in title");
                throw new Error("API 응답의 제목에 특수문자가 너무 많습니다. 다시 시도해주세요.");
              }
              
              return responseText;
            } catch (parseError) {
              // If JSON parsing fails, throw a more specific error
              console.error("API returned invalid JSON:", parseError);
              
              // Check if the error is related to an unterminated string
              if (parseError.message.includes("Unterminated string")) {
                throw new Error("API가 완성되지 않은 문자열을 반환했습니다. 다시 시도해주세요.");
              }
              
              // Check if the error is related to unexpected tokens
              if (parseError.message.includes("Unexpected token")) {
                throw new Error("API가 잘못된 형식의 JSON을 반환했습니다. 다시 시도해주세요.");
              }
              
              throw new Error("API가 유효하지 않은 JSON을 반환했습니다. 다시 시도해주세요.");
            }
          } catch (validationError) {
            console.error("JSON validation failed:", validationError);
            throw validationError; // Re-throw the validation error with the specific message
          }
        }
        
        return responseText;
      } else {
        console.error("Unexpected API response:", result);
        return `무슨 말을 해야 할지 모르겠군요.`;
      }
    } catch (error) {
      console.error("LLM API 호출 중 오류 발생:", error);
      return `죄송합니다, 지금은 생각할 수가 없군요. (${error.message})`;
    }
  };

  // --- GAME PLAY FUNCTIONS ---
  const saveGameState = async (gameStateToSave) => {
    if (!db || !userId || !activeCaseData || !activeCaseData.id) {
      console.error("Cannot save game state: missing required data");
      return;
    }

    try {
      const progressRef = doc(db, "artifacts", appId, "users", userId, "progress", activeCaseData.id);
      await setDoc(progressRef, gameStateToSave);
      console.log("Game state saved successfully");
    } catch (error) {
      console.error("Error saving game state:", error);
      showNotification("게임 상태 저장에 실패했습니다.", "error");
    }
  };
  
  const sendMessage = async () => {
    // Don't send empty messages
    if (!chatInput.trim()) return;
    
    // Check if we have an active NPC
    if (!gameState.activeNPC) {
      showNotification("대화할 인물이 선택되지 않았습니다.", "error");
      return;
    }
    
    // Find the active NPC in the case data
    const activeNPC = activeCaseData.characters.find(c => c.id === gameState.activeNPC);
    if (!activeNPC) {
      showNotification("선택된 등장인물을 찾을 수 없습니다.", "error");
      return;
    }
    
    // Create user message object
    const userMessage = {
      id: crypto.randomUUID(),
      sender: "user",
      text: chatInput.trim(),
      timestamp: new Date().toISOString()
    };
    
    // Update chat log with user message
    const updatedChatLog = [...chatLog, userMessage];
    setChatLog(updatedChatLog);
    
    // Clear input field
    setChatInput('');
    
    // Update game state with user message
    const updatedGameState = { ...gameState };
    if (!updatedGameState.chatHistory) {
      updatedGameState.chatHistory = {};
    }
    
    if (!updatedGameState.chatHistory[activeNPC.id]) {
      updatedGameState.chatHistory[activeNPC.id] = [];
    }
    
    updatedGameState.chatHistory[activeNPC.id].push(userMessage);
    setGameState(updatedGameState);
    
    // Save game state with user message
    await saveGameState(updatedGameState);
    
    // Generate NPC response
    try {
      // Show typing indicator
      const typingMessage = {
        id: 'typing',
        sender: 'npc',
        characterId: activeNPC.id,
        text: '...',
        isTyping: true
      };
      setChatLog([...updatedChatLog, typingMessage]);
      
      // Prepare context for the NPC response
      // Use the same character information that's displayed in the UI
      const characterContext = `
당신은 "${activeCaseData.title}" 사건의 등장인물 "${activeNPC.name}"입니다.
당신의 역할: ${activeNPC.role}
당신의 성격: ${activeNPC.personality}
당신의 배경: ${activeNPC.intro || ''}

중요: 당신은 게임 내에서 실제로 구현된 기능만 언급해야 합니다. 혈흔 감식, 경찰에게 증거 제출, 법의학적 분석 등 게임에서 지원하지 않는 기능을 언급하지 마세요. 당신이 할 수 있는 것은 대화를 통한 정보 제공뿐입니다.
`;
      
      // Get recent chat history for context (last 10 messages)
      const recentMessages = updatedGameState.chatHistory[activeNPC.id] || [];
      const chatContext = recentMessages.slice(-10).map(msg => 
        `${msg.sender === 'user' ? '탐정' : activeNPC.name}: ${msg.text}`
      ).join('\n');
      
      // Prepare system instruction
      const systemInstruction = {
        parts: [{
          text: `${characterContext}

사건 정보:
${activeCaseData.summary}

당신은 이 역할에 충실하게 대화해야 합니다. 당신의 성격, 말투, 지식에 맞게 응답하세요.
당신이 모르는 정보에 대해서는 솔직하게 모른다고 하거나, 회피하거나, 거짓말할 수 있습니다.
당신의 응답은 간결하고 자연스러워야 합니다. 대화 형식을 유지하세요.`
        }]
      };
      
      // Prepare user message
      const prompt = `${chatContext}\n\n탐정: ${userMessage.text}\n\n${activeNPC.name}:`;
      
      // Prepare payload for API call
      const payload = {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        system_instruction: systemInstruction
      };
      
      // Call API to generate response
      const responseText = await callGeminiAPI(payload);
      
      // Create NPC response message
      const npcResponse = {
        id: crypto.randomUUID(),
        sender: "npc",
        characterId: activeNPC.id,
        text: responseText,
        timestamp: new Date().toISOString()
      };
      
      // Update chat log with NPC response (remove typing indicator)
      const finalChatLog = updatedChatLog.concat([npcResponse]);
      setChatLog(finalChatLog);
      
      // Update game state with NPC response
      updatedGameState.chatHistory[activeNPC.id].push(npcResponse);
      setGameState(updatedGameState);
      
      // Save updated game state
      await saveGameState(updatedGameState);
      
    } catch (error) {
      console.error("Error generating NPC response:", error);
      
      // Remove typing indicator and show error message
      setChatLog(updatedChatLog);
      
      // Show error notification
      showNotification(`NPC 응답 생성 중 오류가 발생했습니다: ${error.message}`, "error");
    }
  };

  const showCharacterInfo = (characterId) => {
    if (!activeCaseData || !activeCaseData.characters) return;
    
    const character = activeCaseData.characters.find(c => c.id === characterId);
    if (!character) return;
    
    // Generate character info content
    let content = `
      <div class="space-y-4">
        <div class="flex items-center">
          <div class="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl font-bold mr-4">
            ${character.name.charAt(0)}
          </div>
          <div>
            <h2 class="text-2xl font-bold">${character.name}</h2>
            <p class="text-gray-400">${character.role || '역할 정보 없음'}</p>
          </div>
        </div>
        
        <div class="mt-4">
          <h3 class="text-lg font-semibold text-blue-300 mb-2">인물 정보</h3>
          <p>${character.description || '상세 정보가 없습니다.'}</p>
        </div>
        
        <div class="mt-4">
          <h3 class="text-lg font-semibold text-blue-300 mb-2">성격</h3>
          <p>${character.personality || '성격 정보가 없습니다.'}</p>
        </div>
        
        <div class="mt-4">
          <h3 class="text-lg font-semibold text-blue-300 mb-2">관계</h3>
          <ul class="list-disc pl-5 space-y-1">
            ${character.relationships ? 
              Object.entries(character.relationships)
                .map(([relatedId, relationship]) => {
                  const relatedChar = activeCaseData.characters.find(c => c.id === relatedId);
                  return relatedChar ? 
                    `<li><span class="font-medium">${relatedChar.name}</span>: ${relationship}</li>` : '';
                })
                .join('') : 
              '<li>관계 정보가 없습니다.</li>'
            }
          </ul>
        </div>
        
        <div class="mt-4">
          <h3 class="text-lg font-semibold text-blue-300 mb-2">알리바이</h3>
          <p>${character.alibi || '알리바이 정보가 없습니다.'}</p>
        </div>
      </div>
    `;
    
    setCharacterInfoContent(content);
    setIsCharacterInfoModalOpen(true);
  };

  const initPlayUI = (caseData) => {
    // Initialize UI elements for the play view
    if (!caseData || !caseData.characters || caseData.characters.length === 0) {
      console.error("No characters found in case data");
      showNotification("사건 데이터에 등장인물이 없습니다.", "error");
      return;
    }

    // Find the active NPC
    const activeNPCId = gameState.activeNPC;
    const activeNPC = caseData.characters.find(c => c.id === activeNPCId);

    if (!activeNPC) {
      console.error("Active NPC not found in characters list");
      showNotification("선택된 등장인물을 찾을 수 없습니다.", "error");
      return;
    }

    // Generate a character-specific greeting based on character information
    let greeting = "";
    
    // Use the character's description directly as the greeting
    if (activeNPC) {
      // If the character has a description, use it directly
      if (activeNPC.description) {
        greeting = activeNPC.description;
      } else {
        // Fallback if no description is available
        greeting = `${activeNPC.name}`;
        if (activeNPC.role) {
          greeting += `(${activeNPC.role})`;
        }
        greeting += "입니다. 어떤 일로 오셨나요?";
      }
    } else {
      // Fallback if no character is defined
      greeting = "안녕하세요. 어떤 일로 오셨나요?";
    }

    // Initialize chat with the character-specific greeting
    const initialMessage = {
      id: crypto.randomUUID(),
      sender: "npc",
      characterId: activeNPC.id,
      text: greeting,
      timestamp: new Date().toISOString()
    };

    // Set the chat log with the initial message
    setChatLog([initialMessage]);

    // Update chat history in game state
    const updatedGameState = { ...gameState };
    if (!updatedGameState.chatHistory) {
      updatedGameState.chatHistory = {};
    }

    if (!updatedGameState.chatHistory[activeNPC.id]) {
      updatedGameState.chatHistory[activeNPC.id] = [];
    }

    updatedGameState.chatHistory[activeNPC.id].push(initialMessage);
    setGameState(updatedGameState);

    // Save the updated game state to Firestore
    saveGameState(updatedGameState);
  };

  const generateCaseReport = async () => {
    if (gameState.pinnedEvidence && gameState.pinnedEvidence.length === 0) {
      showNotification("보고서를 생성할 증거가 없습니다.", 'info');
      return;
    }

    setIsReportModalOpen(true);
    setReportContent('<p class="animate-pulse">✨ AI가 수사 기록을 검토하고 보고서를 작성하는 중입니다...</p>');

    const getCharacter = (charId) => {
      // Check if characters array exists
      if (!activeCaseData.characters || !Array.isArray(activeCaseData.characters)) {
        console.warn("Characters array is undefined or not an array");
        return { name: "알 수 없는 인물" }; // Return a default object
      }
      // Find character and return default if not found
      return activeCaseData.characters.find(c => c.id === charId) || { name: "알 수 없는 인물" };
    };

    const evidenceText = gameState.pinnedEvidence.map(e =>
        `- ${getCharacter(e.characterId).name}의 증언 (#${e.id}): "${e.text}"`
    ).join("\n");

    const systemInstruction = {
      parts: [{
        text: "당신은 유능한 수사관입니다. 주어진 증거 목록을 바탕으로 현재 사건에 대한 중간 수사 보고서를 객관적인 문체로 작성해주세요. 각 증언을 요약하고, 현재까지 드러난 주요 사실과 의문점을 정리해주세요."
      }]
    };

    const promptText = `[사건명: ${activeCaseData.title}]\n[수집된 증거 목록]\n${evidenceText}`;

    const payload = {
      contents: [{ role: "user", parts: [{ text: promptText }] }],
      system_instruction: systemInstruction
    };

    const report = await callGeminiAPI(payload);
    setReportContent(report.replace(/\n/g, '<br>'));
  };
  
  const generateHint = async () => {
    setIsHintModalOpen(true);
    setHintContent('<p class="animate-pulse">✨ AI가 힌트를 생성하는 중입니다...</p>');
    
    const getCharacter = (charId) => {
      // Check if characters array exists
      if (!activeCaseData.characters || !Array.isArray(activeCaseData.characters)) {
        console.warn("Characters array is undefined or not an array");
        return { name: "알 수 없는 인물" }; // Return a default object
      }
      // Find character and return default if not found
      return activeCaseData.characters.find(c => c.id === charId) || { name: "알 수 없는 인물" };
    };
    
    // Prepare evidence text if available
    let evidenceText = "아직 수집된 증거가 없습니다.";
    if (gameState.pinnedEvidence && gameState.pinnedEvidence.length > 0) {
      evidenceText = gameState.pinnedEvidence.map(e =>
        `- ${getCharacter(e.characterId).name}의 증언 (#${e.id}): "${e.text}"`
      ).join("\n");
    }
    
    // Prepare connections text if available
    let connectionsText = "아직 연결된 증거가 없습니다.";
    if (gameState.knowledgeGraph && gameState.knowledgeGraph.edges && gameState.knowledgeGraph.edges.length > 0) {
      connectionsText = gameState.knowledgeGraph.edges.map(edge => {
        const sourceEvidence = gameState.pinnedEvidence.find(e => e.id === edge.source);
        const targetEvidence = gameState.pinnedEvidence.find(e => e.id === edge.target);
        
        if (!sourceEvidence || !targetEvidence) return null;
        
        const sourceCharacter = activeCaseData.characters?.find(c => c.id === sourceEvidence.characterId);
        const targetCharacter = activeCaseData.characters?.find(c => c.id === targetEvidence.characterId);
        
        const sourceCharacterName = sourceCharacter ? sourceCharacter.name : '알 수 없는 인물';
        const targetCharacterName = targetCharacter ? targetCharacter.name : '알 수 없는 인물';
        
        return `- 관계: ${sourceCharacterName}의 증언과 ${targetCharacterName}의 증언은 "${edge.relationship}" 관계입니다.`;
      }).filter(Boolean).join("\n");
    }
    
    const systemInstruction = {
      parts: [{
        text: "당신은 유능한 탐정의 조수입니다. 현재 수사 중인 사건에 대해 탐정이 놓치고 있는 중요한 단서나 질문해볼 만한 내용을 힌트 형태로 제공해주세요. 직접적인 답을 알려주기보다는 수사 방향을 제시해주세요."
      }]
    };
    
    const promptText = `[사건명: ${activeCaseData.title}]
    
[수집된 증거 목록]
${evidenceText}

[증거 간 연결 관계]
${connectionsText}

현재 수사 상황을 바탕으로, 탐정이 사건을 해결하는 데 도움이 될 만한 힌트 3가지를 제공해주세요. 너무 직접적인 답을 주지 말고, 수사 방향을 제시해주세요.`;
    
    const payload = {
      contents: [{ role: "user", parts: [{ text: promptText }] }],
      system_instruction: systemInstruction
    };
    
    const hint = await callGeminiAPI(payload);
    setHintContent(hint.replace(/\n/g, '<br>'));
  };
  
  // Helper function to process accusation after user confirms
  const processAccusation = async (suspectName) => {
    // Generate accusation report
    setIsReportModalOpen(true);
    setReportContent('<p class="animate-pulse">✨ AI가 고발 결과를 분석하는 중입니다...</p>');
    
    // Prepare evidence summary
    const evidenceText = gameState.pinnedEvidence.map(e => {
      const character = activeCaseData.characters?.find(c => c.id === e.characterId);
      const characterName = character ? character.name : '알 수 없는 인물';
      return `- ${characterName}의 증언: "${e.text}"`;
    }).join("\n");
    
    // Prepare connections summary
    const connectionsText = gameState.knowledgeGraph.edges.map(edge => {
      const sourceEvidence = gameState.pinnedEvidence.find(e => e.id === edge.source);
      const targetEvidence = gameState.pinnedEvidence.find(e => e.id === edge.target);
      
      if (!sourceEvidence || !targetEvidence) return null;
      
      const sourceCharacter = activeCaseData.characters?.find(c => c.id === sourceEvidence.characterId);
      const targetCharacter = activeCaseData.characters?.find(c => c.id === targetEvidence.characterId);
      
      const sourceCharacterName = sourceCharacter ? sourceCharacter.name : '알 수 없는 인물';
      const targetCharacterName = targetCharacter ? targetCharacter.name : '알 수 없는 인물';
      
      return `- 관계: ${sourceCharacterName}의 증언과 ${targetCharacterName}의 증언은 "${edge.relationship}" 관계입니다.`;
    }).filter(Boolean).join("\n");
    
    // Prepare system instruction
    const systemInstruction = {
      parts: [{
        text: "당신은 유능한 판사입니다. 탐정이 제출한 증거와 추리를 바탕으로 범인 지목이 타당한지 판단하고, 최종 판결을 내려주세요. 증거가 충분하다면 유죄를, 그렇지 않다면 무죄를 선고하세요."
      }]
    };
    
    // Prepare prompt
    const promptText = `[사건명: ${activeCaseData.title}]
    
[탐정의 고발]
탐정은 "${suspectName}"을(를) 범인으로 지목했습니다.

[수집된 증거 목록]
${evidenceText}

[증거 간 연결 관계]
${connectionsText}

이 증거들과 추리를 바탕으로 "${suspectName}"이(가) 범인인지 판단하고, 최종 판결을 내려주세요.`;
    
    // Prepare payload
    const payload = {
      contents: [{ role: "user", parts: [{ text: promptText }] }],
      system_instruction: systemInstruction
    };
    
    // Call API to generate verdict
    callGeminiAPI(payload).then(verdict => {
      // Check if the verdict indicates a successful accusation
      const isSuccessful = verdict.includes("유죄") || verdict.includes("범인이 맞습니다") || 
                          verdict.includes("범인으로 인정") || verdict.includes("범인이 분명");
      
      // Update game state to mark case as solved
      const updatedGameState = {
        ...gameState,
        caseSolved: true,
        accusedSuspect: suspectName,
        accusationSuccessful: isSuccessful
      };
      setGameState(updatedGameState);
      saveGameState(updatedGameState);
      
      // Generate ending content based on verdict
      let endingContent = '';
      
      if (isSuccessful) {
        // Successful ending
        endingContent = `
          <div class="text-center mb-6">
            <h1 class="text-3xl font-bold text-green-400 mb-2">사건 해결!</h1>
            <p class="text-xl text-gray-300">축하합니다! 성공적으로 사건을 해결했습니다.</p>
          </div>
        `;
      } else {
        // Failed ending
        endingContent = `
          <div class="text-center mb-6">
            <h1 class="text-3xl font-bold text-red-400 mb-2">사건 미해결</h1>
            <p class="text-xl text-gray-300">아쉽게도 범인을 찾지 못했습니다. 다시 도전해보세요.</p>
          </div>
        `;
      }
      
      // Display verdict with ending
      setReportContent(`
        ${endingContent}
        <h2 class="text-2xl font-bold text-red-400 mb-4">최종 판결</h2>
        <div class="prose prose-invert max-w-none">
          <p class="font-bold">피고발인: ${suspectName}</p>
          <div class="my-4 border-t border-b border-gray-700 py-4">
            ${verdict.replace(/\n/g, '<br>')}
          </div>
          <p class="text-sm text-gray-400 mt-4">이 판결은 탐정이 제출한 증거와 추리를 바탕으로 내려졌습니다.</p>
          ${isSuccessful ? `
          <div class="mt-6 text-center">
            <button 
              class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
              onclick="window.location.href = '#';"
            >
              메인 메뉴로 돌아가기
            </button>
          </div>
          ` : ''}
        </div>
      `);
    }).catch(error => {
      console.error("Error generating verdict:", error);
      setReportContent(`
        <h2 class="text-2xl font-bold text-red-400 mb-4">오류 발생</h2>
        <p>판결을 생성하는 중 오류가 발생했습니다: ${error.message}</p>
      `);
    });
  };
  
  // Helper function to process evidence connection
  const processEvidenceConnection = (relationship) => {
    // Create new edge
    const newEdge = {
      source: gameState.knowledgeGraph.firstNodeToConnect,
      target: evidenceToConnect,
      relationship: relationship
    };
    
    // Check if this connection already exists
    const connectionExists = gameState.knowledgeGraph.edges.some(
      edge => (edge.source === newEdge.source && edge.target === newEdge.target) ||
              (edge.source === newEdge.target && edge.target === newEdge.source)
    );
    
    if (connectionExists) {
      showNotification("이미 연결된 증거입니다.", "info");
    } else {
      // Add new edge
      const updatedGameState = {
        ...gameState,
        knowledgeGraph: {
          ...gameState.knowledgeGraph,
          edges: [...gameState.knowledgeGraph.edges, newEdge],
          firstNodeToConnect: null
        }
      };
      setGameState(updatedGameState);
      saveGameState(updatedGameState);
      showNotification("증거 간 연결이 생성되었습니다.", "success");
    }
  };

  // --- RENDER FUNCTIONS ---
  const renderLoadingOverlay = () => {
    if (!loading) return null;

    return (
        <div className="loading-overlay">
          <i className="fas fa-spinner fa-spin fa-3x text-blue-500"></i>
          <p className="mt-4 text-lg">데이터베이스에 접속하는 중...</p>
        </div>
    );
  };

  const renderNotification = () => {
    if (!notification.message) return null;

    return (
        <div className={`notification ${notification.type === 'success' ? 'bg-green-600' : notification.type === 'error' ? 'bg-red-600' : 'bg-blue-600'}`}
             style={{ opacity: 1, top: '20px' }}>
          {notification.message}
        </div>
    );
  };

  const renderMainMenuView = () => {
    if (currentView !== 'main') return null;

    return (
        <div className="h-screen w-screen flex flex-col items-center justify-center p-4">
          <h1 className="text-5xl font-bold text-blue-400 mb-2">살아있는 사건 파일</h1>
          <p className="text-xl text-gray-300 mb-12">제네시스 엔진</p>
          <div className="space-y-4 w-full max-w-sm">
            <button
                onClick={() => setCurrentView('creation')}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-4 rounded-lg text-lg transition-transform hover:scale-105">
              <i className="fas fa-plus-circle mr-2"></i> 새로운 사건 생성
            </button>
            <button
                onClick={() => {
                  setCurrentView('archive');
                  loadCaseArchive();
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-4 rounded-lg text-lg transition-transform hover:scale-105">
              <i className="fas fa-archive mr-2"></i> 사건 파일 보관실
            </button>
            <button
                onClick={() => setIsSettingsModalOpen(true)}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-4 rounded-lg text-lg transition-transform hover:scale-105">
              <i className="fas fa-cog mr-2"></i> 설정
            </button>
          </div>
          <div className="absolute bottom-4 text-xs text-gray-600">
            {userId ? `탐정 ID: ${userId}` : ''}
          </div>
        </div>
    );
  };

  const renderCreationView = () => {
    if (currentView !== 'creation') return null;

    return (
        <div className="h-screen w-screen flex flex-col items-center justify-center p-4">
          <button
              onClick={() => setCurrentView('main')}
              className="absolute top-5 left-5 text-gray-400 hover:text-white text-2xl">
            &larr; 뒤로가기
          </button>
          <h2 className="text-4xl font-bold mb-8">사건 생성기</h2>
          <div className="w-full max-w-lg bg-gray-800 p-8 rounded-lg shadow-2xl">
            <p className="text-gray-300 mb-4">
              생성하고 싶은 사건의 주제나 키워드를 입력해주세요.<br/>
              (예: 재벌가의 밀실 살인, 사라진 보석의 행방, IT 기업의 스파이 등)
            </p>
            <textarea
                value={casePrompt}
                onChange={(e) => setCasePrompt(e.target.value)}
                className="w-full bg-gray-700 rounded-md p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3">
          </textarea>
            
            <div className="mt-4 mb-4">
              <p className="text-gray-300 mb-2">난이도 설정:</p>
              <div className="flex space-x-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="difficulty"
                    value="easy"
                    checked={difficulty === 'easy'}
                    onChange={() => setDifficulty('easy')}
                    className="mr-2"
                  />
                  <span className="text-green-400">쉬움</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="difficulty"
                    value="normal"
                    checked={difficulty === 'normal'}
                    onChange={() => setDifficulty('normal')}
                    className="mr-2"
                  />
                  <span className="text-yellow-400">보통</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="difficulty"
                    value="hard"
                    checked={difficulty === 'hard'}
                    onChange={() => setDifficulty('hard')}
                    className="mr-2"
                  />
                  <span className="text-red-400">어려움</span>
                </label>
              </div>
            </div>
            
            <button
                onClick={generateAndSaveCase}
                disabled={isGenerating}
                className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg text-lg transition-transform hover:scale-105 disabled:bg-gray-500 disabled:cursor-not-allowed">
              {isGenerating ? (
                  <><i className="fas fa-spinner fa-spin mr-2"></i> AI가 사건 구성 중...</>
              ) : (
                  <><i className="fas fa-magic-wand-sparkles mr-2"></i> 제네시스 엔진 가동</>
              )}
            </button>
            <p className="text-center text-gray-400 text-sm mt-4 h-5">{generationStatus}</p>
          </div>
        </div>
    );
  };

  // State for delete confirmation modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [caseToDelete, setCaseToDelete] = useState(null);

  const renderArchiveView = () => {
    if (currentView !== 'archive') return null;

    return (
        <div className="h-screen w-screen flex flex-col p-4">
          <button
              onClick={() => setCurrentView('main')}
              className="absolute top-5 left-5 text-gray-400 hover:text-white text-2xl">
            &larr; 뒤로가기
          </button>
          <h2 className="text-4xl font-bold mb-8 text-center">사건 파일 보관실</h2>
          <div className="w-full max-w-3xl mx-auto bg-gray-800 p-4 rounded-lg shadow-2xl flex-1 overflow-y-auto">
            {caseList.length === 0 ? (
                <div className="text-center text-gray-400">생성된 사건이 없습니다. 첫 번째 사건을 만들어보세요!</div>
            ) : (
                caseList.map(caseItem => (
                    <div
                        key={caseItem.id}
                        className="bg-gray-700 p-4 rounded-lg mb-3 hover:bg-gray-600 transition-colors relative group">
                      <div 
                        className="cursor-pointer"
                        onClick={() => playCase(caseItem.id, caseItem)}>
                        <h3 className="font-bold text-lg text-blue-300">{caseItem.title}</h3>
                        <p className="text-sm text-gray-400 mt-1">{caseItem.summary}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCaseToDelete(caseItem);
                          setIsDeleteModalOpen(true);
                        }}
                        className="absolute right-4 top-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="사건 삭제">
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                ))
            )}
          </div>
          
          {/* Delete Confirmation Modal */}
          {isDeleteModalOpen && caseToDelete && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full">
                <h3 className="text-xl font-bold mb-4 text-red-400">사건 삭제 확인</h3>
                <p className="mb-6">정말로 "{caseToDelete.title}" 사건을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.</p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600">
                    취소
                  </button>
                  <button
                    onClick={() => {
                      deleteCase(caseToDelete.id);
                      setIsDeleteModalOpen(false);
                      setCaseToDelete(null);
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                    삭제
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
    );
  };

  const renderPlayView = () => {
    if (currentView !== 'play') return null;

    return (
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-4 min-h-screen p-4 pb-8">
          <button
              onClick={() => setCurrentView('archive')}
              className="absolute top-5 left-5 text-gray-400 hover:text-white text-2xl z-20">
            &larr; 보관실로
          </button>

          {/* Left Panel: Main Interaction */}
          <main className="w-full lg:w-3/5 flex flex-col bg-gray-800 rounded-lg shadow-xl min-h-[500px] lg:min-h-[700px]">
            <header className="p-4 border-b border-gray-700 flex items-center justify-between flex-shrink-0">
              {/* NPC header content */}
              {activeCaseData.characters && gameState.activeNPC && (
                <>
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold mr-3">
                      {activeCaseData.characters.find(c => c.id === gameState.activeNPC)?.name.charAt(0) || '?'}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">
                        {activeCaseData.characters.find(c => c.id === gameState.activeNPC)?.name || '알 수 없는 인물'}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {activeCaseData.characters.find(c => c.id === gameState.activeNPC)?.role || '역할 정보 없음'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <button 
                      onClick={() => showCharacterInfo(gameState.activeNPC)}
                      className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-full"
                      title="인물 정보 보기">
                      <i className="fas fa-info-circle"></i>
                    </button>
                  </div>
                </>
              )}
            </header>
            <div className="flex-1 p-4 overflow-y-auto space-y-4" id="chat-container">
              {/* Chat log */}
              {chatLog.map((message, index) => (
                <div 
                  key={message.id || `msg-${index}`} 
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-3/4 rounded-lg p-3 ${
                      message.sender === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : message.isTyping 
                          ? 'bg-gray-700 text-gray-300 animate-pulse' 
                          : 'bg-gray-700 text-white'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-grow">{message.text}</div>
                      {message.sender === 'npc' && !message.isTyping && (
                        <button 
                          className="ml-2 text-gray-400 hover:text-yellow-400 transition-colors"
                          title="증거로 고정"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Check if this evidence is already pinned
                            const isAlreadyPinned = gameState.pinnedEvidence.some(
                              evidence => evidence.id === message.id
                            );
                            
                            if (isAlreadyPinned) {
                              showNotification("이미 증거로 등록된 항목입니다.", "info");
                              return;
                            }
                            
                            // Create evidence object
                            const newEvidence = {
                              id: message.id,
                              text: message.text,
                              characterId: message.characterId,
                              timestamp: message.timestamp,
                              type: "testimony" // Default type for chat evidence
                            };
                            
                            // Add to pinned evidence
                            const updatedGameState = {
                              ...gameState,
                              pinnedEvidence: [...gameState.pinnedEvidence, newEvidence]
                            };
                            
                            // Update state and save
                            setGameState(updatedGameState);
                            saveGameState(updatedGameState);
                            showNotification("증거가 사건 파일에 추가되었습니다.", "success");
                          }}
                        >
                          <i className="fas fa-thumbtack"></i>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <footer className="p-4 border-t border-gray-700 flex-shrink-0">
              <div className="mb-2 flex gap-2 flex-wrap">
                {gameState.pinnedEvidence && gameState.pinnedEvidence.length > 0 && (
                  <>
                    <span className="text-xs text-gray-400">증거 제시:</span>
                    {gameState.pinnedEvidence.map(evidence => {
                      // Find character name
                      const character = activeCaseData.characters?.find(c => c.id === evidence.characterId);
                      const characterName = character ? character.name : '알 수 없는 인물';
                      
                      return (
                        <button
                          key={evidence.id}
                          className="bg-gray-700 hover:bg-gray-600 text-xs rounded px-2 py-1 text-gray-300 hover:text-white transition-colors"
                          title={`${characterName}의 증언: "${evidence.text}"`}
                          onClick={() => {
                            // Set chat input to present this evidence
                            const activeNPC = activeCaseData.characters.find(c => c.id === gameState.activeNPC);
                            if (!activeNPC) return;
                            
                            const evidenceSource = characterName;
                            setChatInput(`${evidenceSource}의 증언에 따르면 "${evidence.text}" 이라고 합니다. 이에 대해 어떻게 생각하시나요?`);
                          }}
                        >
                          <i className="fas fa-file-alt mr-1"></i>
                          {characterName}의 증언 #{evidence.id.substring(0, 4)}
                        </button>
                      );
                    })}
                  </>
                )}
              </div>
              <div className="flex items-center bg-gray-700 rounded-lg">
                <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    className="w-full bg-transparent p-3 focus:outline-none"
                    placeholder="질문을 입력하세요..."/>
                <button 
                    onClick={sendMessage}
                    className="p-3 text-gray-400 hover:text-blue-400 transition-colors">
                  <i className="fas fa-paper-plane"></i>
                </button>
              </div>
            </footer>
          </main>

          {/* Right Panel: Case File */}
          <aside className="w-full lg:w-2/5 flex flex-col bg-gray-800 rounded-lg shadow-xl min-h-[500px] lg:min-h-[700px]">
            <header className="p-4 border-b border-gray-700 flex justify-between items-center flex-shrink-0">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <i className="fas fa-folder-open text-blue-400"></i>
                {activeCaseData.title}
              </h2>
              <div className="flex items-center gap-2">
                <button
                    onClick={generateHint}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold p-2 rounded-full transition-colors w-10 h-10"
                    title="AI 힌트 보기">
                  <i className="fas fa-lightbulb"></i>
                </button>
                <button
                    onClick={generateCaseReport}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold p-2 rounded-full transition-colors w-10 h-10"
                    title="✨ AI 수사 보고서 생성">
                  <i className="fas fa-file-alt"></i>
                </button>
                <button
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors text-sm"
                    title="모든 추리를 끝내고 범인을 고발합니다."
                    onClick={() => {
                      // Check if there are enough connections in the knowledge graph
                      if (!gameState.pinnedEvidence || gameState.pinnedEvidence.length < 3) {
                        showNotification("고발하기 위해서는 최소 3개 이상의 증거가 필요합니다.", "error");
                        return;
                      }
                      
                      if (!gameState.knowledgeGraph.edges || gameState.knowledgeGraph.edges.length < 2) {
                        showNotification("고발하기 위해서는 최소 2개 이상의 증거 연결이 필요합니다.", "error");
                        return;
                      }
                      
                      // Open the custom accusation modal
                      setAccuseSuspectName('');
                      setIsAccusePromptOpen(true);
                    }}
                  >
                  <i className="fas fa-gavel"></i> 고발
                </button>
              </div>
            </header>
            <div className="flex border-b border-gray-700 flex-shrink-0">
              <button
                  onClick={() => changeTab('people')}
                  className={`flex-1 py-2 px-4 text-center font-semibold transition-colors text-sm ${activeTab === 'people' ? 'tab-active' : 'tab-inactive'}`}>
                인물
              </button>
              <button
                  onClick={() => changeTab('evidence')}
                  className={`flex-1 py-2 px-4 text-center font-semibold transition-colors text-sm ${activeTab === 'evidence' ? 'tab-active' : 'tab-inactive'}`}>
                증거
              </button>
              <button
                  onClick={() => changeTab('graph')}
                  className={`flex-1 py-2 px-4 text-center font-semibold transition-colors text-sm ${activeTab === 'graph' ? 'tab-active' : 'tab-inactive'}`}>
                지식 그래프
              </button>
            </div>
            <div className="flex-1 overflow-y-auto relative">
              <div className={`tab-content p-4 space-y-3 ${activeTab === 'people' ? '' : 'hidden'}`}>
                {activeCaseData.characters && activeCaseData.characters.map(character => (
                  <div 
                    key={character.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      gameState.activeNPC === character.id ? 'bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                    onClick={() => {
                      // Update active NPC
                      const updatedGameState = { ...gameState, activeNPC: character.id };
                      setGameState(updatedGameState);
                      
                      // Initialize chat with this character if not already done
                      if (!updatedGameState.chatHistory || !updatedGameState.chatHistory[character.id] || updatedGameState.chatHistory[character.id].length === 0) {
                        // We'll initialize the chat after saving the game state
                        saveGameState(updatedGameState).then(() => {
                          // Create a temporary object that includes the selected character ID
                          // This ensures initPlayUI uses the correct character even if the state update hasn't processed yet
                          const tempGameState = { ...gameState, activeNPC: character.id };
                          
                          // Use the current function scope's character.id to ensure we're using the correct character
                          const selectedCharacter = activeCaseData.characters.find(c => c.id === character.id);
                          if (!selectedCharacter) {
                            console.error("Selected character not found in characters list");
                            showNotification("선택된 등장인물을 찾을 수 없습니다.", "error");
                            return;
                          }
                          
                          // Generate a character-specific greeting based on character information
                          let greeting = "";
                          
                          // Use the character's description directly as the greeting
                          if (selectedCharacter) {
                            // If the character has a description, use it directly
                            if (selectedCharacter.description) {
                              greeting = selectedCharacter.description;
                            } else {
                              // Fallback if no description is available
                              greeting = `${selectedCharacter.name}`;
                              if (selectedCharacter.role) {
                                greeting += `(${selectedCharacter.role})`;
                              }
                              greeting += "입니다. 어떤 일로 오셨나요?";
                            }
                          } else {
                            // Fallback if no character is defined
                            greeting = "안녕하세요. 어떤 일로 오셨나요?";
                          }
                          
                          // Initialize chat with the character-specific greeting
                          const initialMessage = {
                            id: crypto.randomUUID(),
                            sender: "npc",
                            characterId: character.id,
                            text: greeting,
                            timestamp: new Date().toISOString()
                          };
                          
                          // Set the chat log with the initial message
                          setChatLog([initialMessage]);
                          
                          // Update chat history in game state
                          const finalGameState = { ...tempGameState };
                          if (!finalGameState.chatHistory) {
                            finalGameState.chatHistory = {};
                          }
                          
                          if (!finalGameState.chatHistory[character.id]) {
                            finalGameState.chatHistory[character.id] = [];
                          }
                          
                          finalGameState.chatHistory[character.id].push(initialMessage);
                          setGameState(finalGameState);
                          
                          // Save the updated game state to Firestore
                          saveGameState(finalGameState);
                        });
                      } else {
                        // Load existing chat history
                        const characterChatHistory = updatedGameState.chatHistory[character.id] || [];
                        setChatLog(characterChatHistory);
                        // Save the game state after updating the active NPC
                        saveGameState(updatedGameState);
                      }
                    }}
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold mr-3">
                        {character.name.charAt(0) || '?'}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{character.name}</h3>
                        <p className="text-sm text-gray-400">{character.role || '역할 정보 없음'}</p>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-300">
                      {character.intro || '추가 정보 없음'}
                    </div>
                  </div>
                ))}
              </div>
              <div className={`tab-content p-4 space-y-3 ${activeTab === 'evidence' ? '' : 'hidden'}`}>
                {gameState.pinnedEvidence && gameState.pinnedEvidence.length > 0 ? (
                  gameState.pinnedEvidence.map(evidence => {
                    // Find character name
                    const character = activeCaseData.characters?.find(c => c.id === evidence.characterId);
                    const characterName = character ? character.name : '알 수 없는 인물';
                    
                    return (
                      <div key={evidence.id} className="bg-gray-700 rounded-lg p-3 relative">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="text-yellow-400 text-sm font-semibold mb-1">
                              {characterName}의 {evidence.type === "testimony" ? "증언" : "증거"} #{evidence.id.substring(0, 4)}
                            </div>
                            <div className="text-white">{evidence.text}</div>
                            <div className="text-gray-400 text-xs mt-2">
                              {new Date(evidence.timestamp).toLocaleString('ko-KR')}
                            </div>
                          </div>
                          <div className="flex">
                            <button 
                              className="text-gray-400 hover:text-red-400 transition-colors ml-2"
                              title="증거 삭제"
                              onClick={() => {
                                // Remove evidence from pinnedEvidence
                                const updatedGameState = {
                                  ...gameState,
                                  pinnedEvidence: gameState.pinnedEvidence.filter(e => e.id !== evidence.id)
                                };
                                
                                // Update state and save
                                setGameState(updatedGameState);
                                saveGameState(updatedGameState);
                                showNotification("증거가 삭제되었습니다.", "info");
                              }}
                            >
                              <i className="fas fa-trash-alt"></i>
                            </button>
                            <button 
                              className="text-gray-400 hover:text-blue-400 transition-colors ml-2"
                              title="증거 분석"
                              onClick={() => {
                                // Future implementation: Evidence analysis
                                showNotification("증거 분석 기능은 아직 구현되지 않았습니다.", "info");
                              }}
                            >
                              <i className="fas fa-search"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center text-gray-400 py-8">
                    <i className="fas fa-folder-open text-4xl mb-3"></i>
                    <p>수집된 증거가 없습니다.</p>
                    <p className="text-sm mt-2">NPC와의 대화에서 중요한 정보를 발견하면 <i className="fas fa-thumbtack"></i> 아이콘을 클릭하여 증거로 등록하세요.</p>
                  </div>
                )}
              </div>
              <div className={`tab-content h-full w-full ${activeTab === 'graph' ? '' : 'hidden'}`}>
                {/* Control panel for the knowledge graph */}
                <div className="absolute top-2 left-2 z-10 flex flex-col gap-2">
                  <div className="flex gap-2 mb-2">
                    <button
                        className={`${gameState.knowledgeGraph.isConnectMode ? 'bg-blue-600' : 'bg-gray-600 hover:bg-gray-500'} text-white font-bold py-2 px-3 rounded transition-colors`}
                        title={gameState.knowledgeGraph.isConnectMode ? "연결 모드 해제" : "증거 연결 모드"}
                        onClick={() => {
                          const updatedGameState = {
                            ...gameState,
                            knowledgeGraph: {
                              ...gameState.knowledgeGraph,
                              isConnectMode: !gameState.knowledgeGraph.isConnectMode,
                              firstNodeToConnect: null
                            }
                          };
                          setGameState(updatedGameState);
                          saveGameState(updatedGameState);
                          
                          if (!updatedGameState.knowledgeGraph.isConnectMode) {
                            showNotification("연결 모드가 해제되었습니다.", "info");
                          } else {
                            showNotification("연결 모드가 활성화되었습니다. 첫 번째 증거를 선택하세요.", "info");
                          }
                        }}
                    >
                      <i className="fas fa-link"></i>
                      {gameState.knowledgeGraph.isConnectMode && " 연결 중"}
                    </button>
                    {gameState.knowledgeGraph.edges.length > 0 && (
                      <button
                          className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-3 rounded transition-colors"
                          title="모든 연결 삭제"
                          onClick={() => {
                            if (window.confirm("모든 연결을 삭제하시겠습니까?")) {
                              const updatedGameState = {
                                ...gameState,
                                knowledgeGraph: {
                                  ...gameState.knowledgeGraph,
                                  edges: [],
                                  isConnectMode: false,
                                  firstNodeToConnect: null
                                }
                              };
                              setGameState(updatedGameState);
                              saveGameState(updatedGameState);
                              showNotification("모든 연결이 삭제되었습니다.", "info");
                            }
                          }}
                      >
                        <i className="fas fa-trash-alt"></i> 모든 연결 삭제
                      </button>
                    )}
                  </div>
                  
                  {/* Zoom controls */}
                  <div className="bg-gray-800 p-2 rounded-lg shadow-lg flex flex-col items-center">
                    <button
                      className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-1 px-3 rounded mb-1 w-full"
                      title="확대"
                      onClick={() => {
                        // Get the current graph container
                        const graphContainer = document.getElementById('knowledge-graph-container');
                        const graphContent = document.getElementById('knowledge-graph-content');
                        
                        // Get current scale from data attribute or default to 1
                        const currentScale = parseFloat(graphContent.getAttribute('data-scale') || '1');
                        const newScale = Math.min(currentScale + 0.1, 2); // Max zoom 2x
                        
                        // Update scale
                        graphContent.style.transform = `scale(${newScale})`;
                        graphContent.setAttribute('data-scale', newScale.toString());
                        
                        showNotification(`확대: ${Math.round(newScale * 100)}%`, "info");
                      }}
                    >
                      <i className="fas fa-search-plus"></i>
                    </button>
                    <button
                      className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-1 px-3 rounded mb-1 w-full"
                      title="축소"
                      onClick={() => {
                        // Get the current graph container
                        const graphContainer = document.getElementById('knowledge-graph-container');
                        const graphContent = document.getElementById('knowledge-graph-content');
                        
                        // Get current scale from data attribute or default to 1
                        const currentScale = parseFloat(graphContent.getAttribute('data-scale') || '1');
                        const newScale = Math.max(currentScale - 0.1, 0.5); // Min zoom 0.5x
                        
                        // Update scale
                        graphContent.style.transform = `scale(${newScale})`;
                        graphContent.setAttribute('data-scale', newScale.toString());
                        
                        showNotification(`축소: ${Math.round(newScale * 100)}%`, "info");
                      }}
                    >
                      <i className="fas fa-search-minus"></i>
                    </button>
                    <button
                      className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-1 px-3 rounded w-full"
                      title="원래 크기로"
                      onClick={() => {
                        // Get the current graph container
                        const graphContainer = document.getElementById('knowledge-graph-container');
                        const graphContent = document.getElementById('knowledge-graph-content');
                        
                        // Reset scale
                        graphContent.style.transform = 'scale(1)';
                        graphContent.setAttribute('data-scale', '1');
                        
                        showNotification("원래 크기로 복원되었습니다.", "info");
                      }}
                    >
                      <i className="fas fa-sync-alt"></i>
                    </button>
                  </div>
                </div>
                
                {/* Graph container with improved scrolling and zooming */}
                <div id="knowledge-graph-container" className="h-full w-full relative overflow-auto">
                  <div id="knowledge-graph-content" className="relative w-[1000px] h-[1000px] origin-top-left transition-transform duration-200" data-scale="1">
                    <svg id="knowledge-graph-svg" className="absolute top-0 left-0 w-full h-full pointer-events-none">
                      {/* Render edges */}
                      {gameState.knowledgeGraph.edges.map((edge, index) => {
                        // Find the source and target nodes
                        const sourceNode = gameState.pinnedEvidence.find(e => e.id === edge.source);
                        const targetNode = gameState.pinnedEvidence.find(e => e.id === edge.target);
                        
                        // Skip if either node doesn't exist anymore
                        if (!sourceNode || !targetNode) return null;
                        
                        // Calculate source and target positions
                        // This is a simple positioning algorithm - in a real app, you'd use a proper graph layout algorithm
                        const sourceIndex = gameState.pinnedEvidence.findIndex(e => e.id === edge.source);
                        const targetIndex = gameState.pinnedEvidence.findIndex(e => e.id === edge.target);
                        
                        const sourceX = 100 + (sourceIndex % 3) * 300;
                        const sourceY = 100 + Math.floor(sourceIndex / 3) * 200;
                        const targetX = 100 + (targetIndex % 3) * 300;
                        const targetY = 100 + Math.floor(targetIndex / 3) * 200;
                        
                        return (
                          <g key={`edge-${index}`}>
                            <line 
                              x1={sourceX} 
                              y1={sourceY} 
                              x2={targetX} 
                              y2={targetY} 
                              stroke="#4B5563" 
                              strokeWidth="2"
                            />
                            <text 
                              x={(sourceX + targetX) / 2} 
                              y={(sourceY + targetY) / 2} 
                              fill="#9CA3AF" 
                              textAnchor="middle" 
                              dominantBaseline="middle"
                              className="bg-gray-800 px-1"
                            >
                              {edge.relationship || "관계"}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                    
                    {gameState.pinnedEvidence.length === 0 ? (
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-gray-400">
                        <i className="fas fa-project-diagram text-4xl mb-3"></i>
                        <p>지식 그래프를 구성할 증거가 없습니다.</p>
                        <p className="text-sm mt-2">먼저 증거를 수집한 후, 증거 간의 관계를 연결하세요.</p>
                      </div>
                    ) : (
                      gameState.pinnedEvidence.map((evidence, index) => {
                        // Find character name
                        const character = activeCaseData.characters?.find(c => c.id === evidence.characterId);
                        const characterName = character ? character.name : '알 수 없는 인물';
                        
                        // Calculate position - simple grid layout
                        const x = 100 + (index % 3) * 300;
                        const y = 100 + Math.floor(index / 3) * 200;
                        
                        return (
                          <div 
                            key={evidence.id} 
                            className={`absolute bg-gray-700 rounded-lg p-3 w-64 cursor-pointer border-2 ${
                              gameState.knowledgeGraph.firstNodeToConnect === evidence.id 
                                ? 'border-blue-500' 
                                : 'border-transparent hover:border-gray-500'
                            }`}
                            style={{ left: `${x}px`, top: `${y}px` }}
                            onClick={() => {
                              // Handle node click based on connect mode
                              if (gameState.knowledgeGraph.isConnectMode) {
                                if (gameState.knowledgeGraph.firstNodeToConnect === null) {
                                  // Select as first node
                                  const updatedGameState = {
                                    ...gameState,
                                    knowledgeGraph: {
                                      ...gameState.knowledgeGraph,
                                      firstNodeToConnect: evidence.id
                                    }
                                  };
                                  setGameState(updatedGameState);
                                  saveGameState(updatedGameState);
                                  showNotification("첫 번째 증거가 선택되었습니다. 두 번째 증거를 선택하세요.", "info");
                                } else if (gameState.knowledgeGraph.firstNodeToConnect === evidence.id) {
                                  // Deselect if clicking the same node
                                  const updatedGameState = {
                                    ...gameState,
                                    knowledgeGraph: {
                                      ...gameState.knowledgeGraph,
                                      firstNodeToConnect: null
                                    }
                                  };
                                  setGameState(updatedGameState);
                                  saveGameState(updatedGameState);
                                  showNotification("증거 선택이 취소되었습니다.", "info");
                                } else {
                                  // Create connection with second node
                                  // Prompt for relationship type
                                  // Open the custom relationship modal instead of using global prompt()
                                  setRelationshipType('관련성');
                                  setEvidenceToConnect(evidence.id);
                                  setIsRelationshipPromptOpen(true);
                                  return; // Exit early, the rest will be handled by processEvidenceConnection
                                }
                              }
                            }}
                          >
                            <div className="text-yellow-400 text-sm font-semibold mb-1 truncate">
                              {characterName}의 {evidence.type === "testimony" ? "증언" : "증거"} #{evidence.id.substring(0, 4)}
                            </div>
                            <div className="text-white text-sm line-clamp-2">{evidence.text}</div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
            <footer className="p-2 border-t border-gray-700 text-center text-xs text-gray-500">
              {userId ? `탐정 ID: ${userId}` : ''}
            </footer>
          </aside>
        </div>
    );
  };

  const renderModals = () => {
    return (
        <>
          {/* Report Modal */}
          <div className={`modal-overlay ${isReportModalOpen ? 'active' : ''}`}>
            <div className="modal-content">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-green-400">✨ AI 수사 보고서</h2>
                <button onClick={() => setIsReportModalOpen(false)} className="text-gray-400 hover:text-white text-2xl">&times;</button>
              </div>
              <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: reportContent }}></div>
            </div>
          </div>

          {/* Briefing Modal */}
          <div className={`modal-overlay ${isBriefingModalOpen ? 'active' : ''}`}>
            <div className="modal-content">
              <div dangerouslySetInnerHTML={{ __html: briefingContent }}></div>
              <button
                  onClick={() => setIsBriefingModalOpen(false)}
                  className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                수사 시작
              </button>
            </div>
          </div>

          {/* Forensics Modal */}
          <div className={`modal-overlay ${isForensicsModalOpen ? 'active' : ''}`}>
            <div className="modal-content">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-cyan-400">✨ AI 법의학 분석 보고서</h2>
                <button onClick={() => setIsForensicsModalOpen(false)} className="text-gray-400 hover:text-white text-2xl">&times;</button>
              </div>
              <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: forensicsContent }}></div>
            </div>
          </div>
          
          {/* Hint Modal */}
          <div className={`modal-overlay ${isHintModalOpen ? 'active' : ''}`}>
            <div className="modal-content">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-yellow-400">✨ AI 힌트</h2>
                <button onClick={() => setIsHintModalOpen(false)} className="text-gray-400 hover:text-white text-2xl">&times;</button>
              </div>
              <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: hintContent }}></div>
            </div>
          </div>

          {/* Accuse Suspect Prompt Modal */}
          <div className={`modal-overlay ${isAccusePromptOpen ? 'active' : ''}`}>
            <div className="modal-content">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-red-400">범인 지목</h2>
                <button onClick={() => setIsAccusePromptOpen(false)} className="text-gray-400 hover:text-white text-2xl">&times;</button>
              </div>
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">누구를 범인으로 지목하시겠습니까?</label>
                <input 
                  type="text" 
                  value={accuseSuspectName} 
                  onChange={(e) => setAccuseSuspectName(e.target.value)}
                  className="w-full bg-gray-800 text-white border border-gray-700 rounded p-2"
                  placeholder="용의자 이름"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button 
                  onClick={() => setIsAccusePromptOpen(false)} 
                  className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
                >
                  취소
                </button>
                <button 
                  onClick={() => {
                    if (accuseSuspectName.trim()) {
                      setIsAccusePromptOpen(false);
                      const confirmAccuse = window.confirm(`정말로 ${accuseSuspectName}을(를) 범인으로 고발하시겠습니까? 이 결정은 되돌릴 수 없습니다.`);
                      if (confirmAccuse) {
                        // Process accusation (this code will be moved from the original location)
                        processAccusation(accuseSuspectName);
                      }
                    } else {
                      showNotification("범인 이름을 입력해주세요.", "error");
                    }
                  }} 
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                >
                  지목
                </button>
              </div>
            </div>
          </div>

          {/* Character Info Modal */}
          <div className={`modal-overlay ${isCharacterInfoModalOpen ? 'active' : ''}`}>
            <div className="modal-content">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-blue-400">인물 정보</h2>
                <button onClick={() => setIsCharacterInfoModalOpen(false)} className="text-gray-400 hover:text-white text-2xl">&times;</button>
              </div>
              <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: characterInfoContent }}></div>
            </div>
          </div>
          
          {/* Settings Modal */}
          <div className={`modal-overlay ${isSettingsModalOpen ? 'active' : ''}`}>
            <div className="modal-content">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-purple-400">설정</h2>
                <button onClick={() => setIsSettingsModalOpen(false)} className="text-gray-400 hover:text-white text-2xl">&times;</button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-purple-300 mb-3">UI 테마</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(themeOptions).map(([themeKey, theme]) => (
                      <div 
                        key={themeKey}
                        className={`p-4 rounded-lg cursor-pointer border-2 transition-all ${
                          uiTheme === themeKey 
                            ? `border-purple-500 ${theme.colors.card}` 
                            : `border-gray-700 ${theme.colors.card} opacity-70 hover:opacity-100`
                        }`}
                        onClick={() => {
                          setUiTheme(themeKey);
                          localStorage.setItem('uiTheme', themeKey);
                          showNotification(`테마가 '${theme.name}'(으)로 변경되었습니다.`, "success");
                        }}
                      >
                        <div className="flex items-center mb-2">
                          <div className={`w-4 h-4 rounded-full mr-2 ${theme.colors.accent}`}></div>
                          <h4 className="font-medium">{theme.name}</h4>
                        </div>
                        <p className="text-sm text-gray-400">{theme.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-700">
                  <button
                    onClick={() => setIsSettingsModalOpen(false)}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
                  >
                    설정 저장
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Evidence Relationship Prompt Modal */}
          <div className={`modal-overlay ${isRelationshipPromptOpen ? 'active' : ''}`}>
            <div className="modal-content">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-yellow-400">증거 연결</h2>
                <button onClick={() => setIsRelationshipPromptOpen(false)} className="text-gray-400 hover:text-white text-2xl">&times;</button>
              </div>
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">두 증거 사이의 관계를 입력하세요:</label>
                <input 
                  type="text" 
                  value={relationshipType} 
                  onChange={(e) => setRelationshipType(e.target.value)}
                  className="w-full bg-gray-800 text-white border border-gray-700 rounded p-2"
                  placeholder="관련성"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button 
                  onClick={() => setIsRelationshipPromptOpen(false)} 
                  className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
                >
                  취소
                </button>
                <button 
                  onClick={() => {
                    if (relationshipType.trim()) {
                      setIsRelationshipPromptOpen(false);
                      // Process relationship connection (this code will be moved from the original location)
                      processEvidenceConnection(relationshipType);
                    } else {
                      showNotification("관계를 입력해주세요.", "error");
                    }
                  }} 
                  className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
                >
                  연결
                </button>
              </div>
            </div>
          </div>
        </>
    );
  };

  return (
      <div className="bg-gray-900 text-white">
        {renderLoadingOverlay()}
        {renderNotification()}
        {renderMainMenuView()}
        {renderCreationView()}
        {renderArchiveView()}
        {renderPlayView()}
        {renderModals()}
      </div>
  );
}

export default App;