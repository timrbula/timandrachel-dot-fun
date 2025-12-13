import { useState } from 'react';
import FlappyWedding from './FlappyWedding';
import Leaderboard from './Leaderboard';
import './GameTabs.css';

const GameTabs = () => {
  const [activeTab, setActiveTab] = useState<'game' | 'leaderboard'>('game');

  return (
    <div className="game-tabs">
      <div className="tabs-header">
        <button
          className={`tab-button ${activeTab === 'game' ? 'active' : ''}`}
          onClick={() => setActiveTab('game')}
        >
          🎮 Play Game
        </button>
        <button
          className={`tab-button ${activeTab === 'leaderboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('leaderboard')}
        >
          🏆 Leaderboard
        </button>
      </div>
      
      <div className="tabs-content">
        {activeTab === 'game' && (
          <div className="tab-panel">
            <FlappyWedding onScoreSubmitted={() => setActiveTab('leaderboard')} />
          </div>
        )}
        {activeTab === 'leaderboard' && (
          <div className="tab-panel">
            <Leaderboard />
          </div>
        )}
      </div>
    </div>
  );
};

export default GameTabs;

// Made with Bob