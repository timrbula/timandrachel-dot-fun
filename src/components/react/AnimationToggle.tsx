import { useEffect, useState } from 'react';
import './AnimationToggle.css';

const ANIMATION_PREF_KEY = 'animations-enabled';

export default function AnimationToggle() {
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    // Check saved preference on mount
    const saved = localStorage.getItem(ANIMATION_PREF_KEY);
    const enabled = saved === 'true';
    setIsEnabled(enabled);
    
    // Apply initial state
    if (!enabled) {
      document.documentElement.classList.add('no-animations');
    }
  }, []);

  const toggleAnimations = () => {
    const newState = !isEnabled;
    setIsEnabled(newState);
    
    if (newState) {
      document.documentElement.classList.remove('no-animations');
      localStorage.setItem(ANIMATION_PREF_KEY, 'true');
    } else {
      document.documentElement.classList.add('no-animations');
      localStorage.setItem(ANIMATION_PREF_KEY, 'false');
    }
  };

  return (
    <button
      className={`animation-toggle ${!isEnabled ? 'disabled' : ''}`}
      onClick={toggleAnimations}
      aria-label="Toggle animations"
      aria-pressed={isEnabled}
      title="Turn animations on/off"
    >
      <span className="animation-icon">✨</span>
    </button>
  );
}

// Made with Bob
