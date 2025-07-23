import React, { createContext, useContext, useReducer, useCallback } from 'react';

// Initial error state
const initialState = {
  hasError: false,
  errorType: null,
  errorMessage: '',
  errorDetails: null,
  isVisible: false,
  recoveryOptions: []
};

// Action types
const ACTION_TYPES = {
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  HIDE_ERROR: 'HIDE_ERROR'
};

// Error types
export const ERROR_TYPES = {
  LLM_ERROR: 'LLM_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  AUDIO_ERROR: 'AUDIO_ERROR',
  VISUAL_ERROR: 'VISUAL_ERROR',
  SAVE_ERROR: 'SAVE_ERROR',
  LOAD_ERROR: 'LOAD_ERROR',
  AUTH_ERROR: 'AUTH_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
};

// Error reducer
const errorReducer = (state, action) => {
  switch (action.type) {
    case ACTION_TYPES.SET_ERROR:
      return {
        ...state,
        hasError: true,
        errorType: action.payload.errorType || ERROR_TYPES.UNKNOWN_ERROR,
        errorMessage: action.payload.errorMessage || '알 수 없는 오류가 발생했습니다.',
        errorDetails: action.payload.errorDetails || null,
        isVisible: true,
        recoveryOptions: action.payload.recoveryOptions || []
      };
      
    case ACTION_TYPES.CLEAR_ERROR:
      return initialState;
      
    case ACTION_TYPES.HIDE_ERROR:
      return {
        ...state,
        isVisible: false
      };
      
    default:
      return state;
  }
};

// Create context
const ErrorContext = createContext();

// Error provider component
export const ErrorProvider = ({ children }) => {
  const [state, dispatch] = useReducer(errorReducer, initialState);
  
  // Set error
  const setError = useCallback((errorType, errorMessage, errorDetails = null, recoveryOptions = []) => {
    dispatch({
      type: ACTION_TYPES.SET_ERROR,
      payload: {
        errorType,
        errorMessage,
        errorDetails,
        recoveryOptions
      }
    });
    
    // Log error to console for debugging
    console.error(`Error (${errorType}):`, errorMessage, errorDetails);
  }, []);
  
  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: ACTION_TYPES.CLEAR_ERROR });
  }, []);
  
  // Hide error (keep error state but hide the UI)
  const hideError = useCallback(() => {
    dispatch({ type: ACTION_TYPES.HIDE_ERROR });
  }, []);
  
  // Get user-friendly error message based on error type
  const getUserFriendlyMessage = useCallback((errorType, defaultMessage) => {
    switch (errorType) {
      case ERROR_TYPES.LLM_ERROR:
        return '이야기 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';
        
      case ERROR_TYPES.NETWORK_ERROR:
        return '네트워크 연결에 문제가 있습니다. 인터넷 연결을 확인해 주세요.';
        
      case ERROR_TYPES.AUDIO_ERROR:
        return '오디오 재생 중 오류가 발생했습니다. 브라우저 설정을 확인해 주세요.';
        
      case ERROR_TYPES.VISUAL_ERROR:
        return '화면 렌더링 중 오류가 발생했습니다. 브라우저를 새로고침해 주세요.';
        
      case ERROR_TYPES.SAVE_ERROR:
        return '게임 저장 중 오류가 발생했습니다. 저장 공간이 충분한지 확인해 주세요.';
        
      case ERROR_TYPES.LOAD_ERROR:
        return '게임 불러오기 중 오류가 발생했습니다. 저장 파일이 손상되었을 수 있습니다.';
        
      case ERROR_TYPES.AUTH_ERROR:
        return '로그인 중 오류가 발생했습니다. 계정 정보를 확인해 주세요.';
        
      case ERROR_TYPES.UNKNOWN_ERROR:
      default:
        return defaultMessage || '알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';
    }
  }, []);
  
  // Handle LLM error
  const handleLlmError = useCallback((error, source = 'unknown') => {
    const errorMessage = getUserFriendlyMessage(ERROR_TYPES.LLM_ERROR);
    const errorDetails = {
      source,
      originalError: error.message || String(error),
      timestamp: new Date().toISOString()
    };
    
    const recoveryOptions = [
      {
        label: '다시 시도',
        action: 'retry'
      },
      {
        label: '오프라인 모드로 계속',
        action: 'offline'
      }
    ];
    
    setError(ERROR_TYPES.LLM_ERROR, errorMessage, errorDetails, recoveryOptions);
  }, [getUserFriendlyMessage, setError]);
  
  // Handle network error
  const handleNetworkError = useCallback((error) => {
    const errorMessage = getUserFriendlyMessage(ERROR_TYPES.NETWORK_ERROR);
    const errorDetails = {
      originalError: error.message || String(error),
      timestamp: new Date().toISOString()
    };
    
    const recoveryOptions = [
      {
        label: '다시 시도',
        action: 'retry'
      },
      {
        label: '오프라인 모드로 계속',
        action: 'offline'
      }
    ];
    
    setError(ERROR_TYPES.NETWORK_ERROR, errorMessage, errorDetails, recoveryOptions);
  }, [getUserFriendlyMessage, setError]);
  
  // Handle save/load error
  const handleSaveLoadError = useCallback((error, isLoad = false) => {
    const errorType = isLoad ? ERROR_TYPES.LOAD_ERROR : ERROR_TYPES.SAVE_ERROR;
    const errorMessage = getUserFriendlyMessage(errorType);
    const errorDetails = {
      originalError: error.message || String(error),
      timestamp: new Date().toISOString()
    };
    
    const recoveryOptions = [
      {
        label: '다시 시도',
        action: 'retry'
      },
      {
        label: isLoad ? '새 게임 시작' : '저장하지 않고 계속',
        action: isLoad ? 'new_game' : 'continue'
      }
    ];
    
    setError(errorType, errorMessage, errorDetails, recoveryOptions);
  }, [getUserFriendlyMessage, setError]);
  
  // Provide context value
  const contextValue = {
    ...state,
    setError,
    clearError,
    hideError,
    getUserFriendlyMessage,
    handleLlmError,
    handleNetworkError,
    handleSaveLoadError
  };
  
  return (
    <ErrorContext.Provider value={contextValue}>
      {children}
    </ErrorContext.Provider>
  );
};

// Custom hook for using the error context
export const useError = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
};

export default ErrorContext;