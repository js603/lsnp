import React, { useState, useEffect } from 'react';

/**
 * ChoiceSelection component
 * Displays player choices with animations and styling
 */
const ChoiceSelection = ({ choices, onSelect, isVisible = true, customInputEnabled = true }) => {
  const [visibleChoices, setVisibleChoices] = useState([]);
  const [customInput, setCustomInput] = useState('');
  const [isAnimating, setIsAnimating] = useState(true);

  // Animate choices appearing one by one
  useEffect(() => {
    if (!isVisible || !choices || choices.length === 0) {
      setVisibleChoices([]);
      return;
    }

    setIsAnimating(true);
    setVisibleChoices([]);

    // Show choices one by one with a delay
    const showChoices = async () => {
      for (let i = 0; i < choices.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 300));
        setVisibleChoices(prev => [...prev, choices[i]]);
      }
      setIsAnimating(false);
    };

    showChoices();
  }, [choices, isVisible]);

  // Handle choice selection
  const handleChoiceClick = (choice) => {
    if (isAnimating) {
      // If still animating, show all choices immediately
      setVisibleChoices(choices);
      setIsAnimating(false);
      return;
    }

    // Call the onSelect callback with the selected choice
    if (onSelect) {
      onSelect(choice);
    }
  };

  // Handle custom input submission
  const handleCustomInputSubmit = (e) => {
    e.preventDefault();
    if (customInput.trim() && onSelect) {
      onSelect({ id: 'custom', text: customInput, isCustom: true });
      setCustomInput('');
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="choice-selection">
      {/* Choice buttons */}
      <div className="choice-buttons">
        {visibleChoices.map((choice, index) => (
          <button
            key={choice.id || index}
            className={`choice-button ${choice.isUnlocked ? 'unlocked' : ''} ${choice.isNew ? 'new-choice' : ''}`}
            onClick={() => handleChoiceClick(choice)}
            disabled={choice.isLocked}
          >
            <span className="choice-text">{choice.text}</span>
            {choice.isNew && <span className="new-badge">NEW</span>}
          </button>
        ))}
        
        {isAnimating && (
          <button 
            className="choice-button show-all"
            onClick={() => {
              setVisibleChoices(choices);
              setIsAnimating(false);
            }}
          >
            모든 선택지 보기...
          </button>
        )}
      </div>

      {/* Custom input form */}
      {customInputEnabled && !isAnimating && (
        <form className="custom-input-form" onSubmit={handleCustomInputSubmit}>
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="직접 입력하기..."
            className="custom-input"
          />
          <button 
            type="submit" 
            className="custom-input-submit"
            disabled={!customInput.trim()}
          >
            입력
          </button>
        </form>
      )}
    </div>
  );
};

export default ChoiceSelection;