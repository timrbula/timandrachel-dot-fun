import { useState, useEffect } from "react";
import "./GuestbookStats.css";

interface GuestbookStatsData {
  totalEntries: number;
  citiesCount: number;
  emojiCount: number;
}

export default function GuestbookStats() {
  const [stats, setStats] = useState<GuestbookStatsData>({
    totalEntries: 0,
    citiesCount: 0,
    emojiCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/guestbook/stats");

      if (!response.ok) {
        throw new Error("Failed to fetch guestbook stats");
      }

      const data = await response.json();
      setStats(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching guestbook stats:", err);
      setError("Failed to load stats");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="guestbook-stats">
        <div className="stats-grid">
          <div className="stat-item">
            <p className="stat-number rainbow-text">⏳</p>
            <p className="stat-label">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="guestbook-stats">
        <div className="stats-error">
          <p>⚠️ {error}</p>
          <button onClick={fetchStats} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="guestbook-stats">
      <div className="stats-grid">
        <div className="stat-item">
          <p className="stat-number rainbow-text">{stats.totalEntries}</p>
          <p className="stat-label">Total Entries</p>
        </div>
        <div className="stat-item">
          <p className="stat-number text-neon">{stats.citiesCount}</p>
          <p className="stat-label">Cities Represented</p>
        </div>
        <div className="stat-item">
          <p className="stat-number text-neon-pink">{stats.emojiCount}</p>
          <p className="stat-label">Emojis Used</p>
        </div>
      </div>
      {stats.totalEntries === 0 && (
        <p className="stats-note">
          <em>Be the first to sign our guestbook! 🚀</em>
        </p>
      )}
    </div>
  );
}

// Made with Bob