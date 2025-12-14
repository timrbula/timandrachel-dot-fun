import { useEffect, useState } from 'react';
import './Leaderboard.css';

interface LeaderboardEntry {
  id: string;
  rank: number;
  name: string;
  score: number;
  created_at: string;
}

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/game-scores');
      
      if (!response.ok) {
        console.error(response);
        throw new Error('Failed to fetch leaderboard');
      }
      
      const data = await response.json();
      setLeaderboard(data.leaderboard || []);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getMedalEmoji = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `${rank}.`;
    }
  };

  if (loading) {
    return (
      <div className="leaderboard geo-box-neon">
        <h2 className="leaderboard-title text-rainbow">🏆 Top 10 Leaderboard 🏆</h2>
        <div className="leaderboard-loading">
          <p>Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="leaderboard geo-box-neon">
        <h2 className="leaderboard-title text-rainbow">🏆 Top 10 Leaderboard 🏆</h2>
        <div className="leaderboard-error">
          <p>{error}</p>
          <button className="geo-button geo-button-primary" onClick={fetchLeaderboard}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <div className="leaderboard geo-box-neon">
        <h2 className="leaderboard-title text-rainbow">🏆 Top 10 Leaderboard 🏆</h2>
        <div className="leaderboard-empty">
          <p>No scores yet! Be the first to make the leaderboard!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="leaderboard geo-box-neon">
      <h2 className="leaderboard-title text-rainbow">🏆 Top 10 Leaderboard 🏆</h2>
      <div className="leaderboard-table">
        <div className="leaderboard-header">
          <div className="leaderboard-col-rank">Rank</div>
          <div className="leaderboard-col-name">Player</div>
          <div className="leaderboard-col-score">Score</div>
          <div className="leaderboard-col-date">Date</div>
        </div>
        {leaderboard.map((entry) => (
          <div 
            key={entry.id} 
            className={`leaderboard-row ${entry.rank <= 3 ? 'leaderboard-row-top3' : ''}`}
          >
            <div className="leaderboard-col-rank">
              <span className="leaderboard-rank">{getMedalEmoji(entry.rank)}</span>
            </div>
            <div className="leaderboard-col-name">
              <span className="leaderboard-name">{entry.name}</span>
            </div>
            <div className="leaderboard-col-score">
              <span className="leaderboard-score">{entry.score}</span>
            </div>
            <div className="leaderboard-col-date">
              <span className="leaderboard-date">{formatDate(entry.created_at)}</span>
            </div>
          </div>
        ))}
      </div>
      <button 
        className="geo-button geo-button-secondary leaderboard-refresh" 
        onClick={fetchLeaderboard}
      >
        🔄 Refresh
      </button>
    </div>
  );
};

export default Leaderboard;

// Made with Bob