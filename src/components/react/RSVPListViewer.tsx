import { useState, useEffect } from "react";
import "./RSVPListViewer.css";

interface RSVP {
  id: string;
  createdAt: string;
  guestName: string;
  guestEmail: string;
  attending: boolean;
  plusOne: boolean;
  plusOneName?: string | null;
  dietaryRestrictions?: string | null;
  plusOneDietaryRestrictions?: string | null;
  songRequests?: string | null;
  specialAccommodations?: string | null;
  numberOfGuests: number;
}

export default function RSVPListViewer() {
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adminSecret, setAdminSecret] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [filterAttending, setFilterAttending] = useState<"all" | "yes" | "no">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "name">("date");

  // Check for stored admin secret
  useEffect(() => {
    const stored = localStorage.getItem("adminSecret");
    if (stored) {
      setAdminSecret(stored);
      setIsAuthenticated(true);
      fetchRsvps(stored);
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminSecret.trim()) {
      localStorage.setItem("adminSecret", adminSecret);
      setIsAuthenticated(true);
      fetchRsvps(adminSecret);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminSecret");
    setAdminSecret("");
    setIsAuthenticated(false);
    setRsvps([]);
  };

  const fetchRsvps = async (secret: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/rsvp", {
        headers: {
          Authorization: `Bearer ${secret}`,
        },
      });

      if (response.status === 401) {
        setError("Invalid admin secret");
        handleLogout();
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch RSVPs");
      }

      const data = await response.json();
      setRsvps(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load RSVPs");
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort RSVPs
  const filteredRsvps = rsvps
    .filter((rsvp) => {
      if (filterAttending === "yes" && !rsvp.attending) return false;
      if (filterAttending === "no" && rsvp.attending) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          rsvp.guestName.toLowerCase().includes(query) ||
          rsvp.guestEmail.toLowerCase().includes(query) ||
          (rsvp.plusOneName && rsvp.plusOneName.toLowerCase().includes(query))
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "date") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else {
        return a.guestName.localeCompare(b.guestName);
      }
    });

  // Calculate statistics
  const stats = {
    total: rsvps.length,
    attending: rsvps.filter((r) => r.attending).length,
    declined: rsvps.filter((r) => !r.attending).length,
    totalGuests: rsvps
      .filter((r) => r.attending)
      .reduce((sum, r) => sum + r.numberOfGuests, 0),
    withPlusOne: rsvps.filter((r) => r.attending && r.plusOne).length,
    dietaryRestrictions: rsvps.filter(
      (r) => r.attending && (r.dietaryRestrictions || r.plusOneDietaryRestrictions)
    ).length,
    songRequests: rsvps.filter((r) => r.attending && r.songRequests).length,
    withMessages: rsvps.filter(
      (r) => r.specialAccommodations
    ).length,
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Login form
  if (!isAuthenticated) {
    return (
      <div className="rsvp-viewer">
        <div className="login-box geo-box-raised">
          <h2 className="text-center text-neon">🔐 Admin Login</h2>
          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label htmlFor="adminSecret">Admin Secret:</label>
              <input
                type="password"
                id="adminSecret"
                value={adminSecret}
                onChange={(e) => setAdminSecret(e.target.value)}
                placeholder="Enter admin secret"
                className="form-input"
                required
              />
            </div>
            <button type="submit" className="geo-button-primary">
              Login
            </button>
          </form>
          {error && <div className="error-message">{error}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="rsvp-viewer">
      {/* Header */}
      <div className="viewer-header geo-box">
        <div className="header-actions">
          <button
            onClick={() => fetchRsvps(adminSecret)}
            className="geo-button-primary"
          >
            🔄 Refresh
          </button>
          <button onClick={handleLogout} className="geo-button-warning">
            🔓 Logout
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-box geo-box">
          <strong>⚠️ Error:</strong> {error}
        </div>
      )}

      {/* Statistics */}
      <div className="stats-grid geo-box">
        <div className="stat-card">
          <div className="stat-value text-neon">{stats.total}</div>
          <div className="stat-label">Total RSVPs</div>
        </div>
        <div className="stat-card">
          <div className="stat-value text-neon-green">{stats.attending}</div>
          <div className="stat-label">Attending</div>
        </div>
        <div className="stat-card">
          <div className="stat-value text-neon-pink">{stats.declined}</div>
          <div className="stat-label">Declined</div>
        </div>
        <div className="stat-card">
          <div className="stat-value text-cyan">{stats.totalGuests}</div>
          <div className="stat-label">Total Guests</div>
        </div>
        <div className="stat-card">
          <div className="stat-value text-neon">{stats.withPlusOne}</div>
          <div className="stat-label">With Plus-One</div>
        </div>
        <div className="stat-card">
          <div className="stat-value text-neon-green">{stats.dietaryRestrictions}</div>
          <div className="stat-label">Dietary Restrictions</div>
        </div>
        <div className="stat-card">
          <div className="stat-value text-neon-pink">{stats.songRequests}</div>
          <div className="stat-label">Song Requests</div>
        </div>
        <div className="stat-card">
          <div className="stat-value text-cyan">{stats.withMessages}</div>
          <div className="stat-label">With Messages</div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-bar geo-box">
        <div className="filter-group">
          <label>Filter by Status:</label>
          <select
            value={filterAttending}
            onChange={(e) => setFilterAttending(e.target.value as any)}
            className="filter-select"
          >
            <option value="all">All RSVPs</option>
            <option value="yes">Attending Only</option>
            <option value="no">Declined Only</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="filter-select"
          >
            <option value="date">Date (Newest First)</option>
            <option value="name">Name (A-Z)</option>
          </select>
        </div>

        <div className="filter-group search-group">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or email..."
            className="search-input"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="clear-button"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* RSVP List */}
      <div className="rsvp-list">
        {loading ? (
          <div className="loading-box geo-box text-center">
            <p>⏳ Loading RSVPs...</p>
          </div>
        ) : filteredRsvps.length === 0 ? (
          <div className="empty-box geo-box text-center">
            <p>
              {rsvps.length === 0
                ? "No RSVPs yet. Waiting for guests to respond!"
                : "No RSVPs match your filters."}
            </p>
          </div>
        ) : (
          <div className="rsvp-grid">
            {filteredRsvps.map((rsvp) => (
              <div
                key={rsvp.id}
                className={`rsvp-card geo-box-raised ${
                  rsvp.attending ? "attending" : "declined"
                }`}
              >
                <div className="rsvp-header">
                  <h3 className="rsvp-name">{rsvp.guestName}</h3>
                  <span
                    className={`rsvp-status-badge ${
                      rsvp.attending ? "status-attending" : "status-declined"
                    }`}
                  >
                    {rsvp.attending ? "✅ Attending" : "❌ Declined"}
                  </span>
                </div>

                <div className="rsvp-details">
                  <div className="detail-row">
                    <span className="detail-icon">📧</span>
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">{rsvp.guestEmail}</span>
                  </div>

                  <div className="detail-row">
                    <span className="detail-icon">📅</span>
                    <span className="detail-label">RSVP'd:</span>
                    <span className="detail-value">
                      {formatDate(rsvp.createdAt)}
                    </span>
                  </div>

                  <div className="detail-row">
                    <span className="detail-icon">👥</span>
                    <span className="detail-label">Guests:</span>
                    <span className="detail-value">{rsvp.numberOfGuests}</span>
                  </div>

                  {rsvp.plusOne && (
                    <div className="detail-row">
                      <span className="detail-icon">👤</span>
                      <span className="detail-label">Plus-One:</span>
                      <span className="detail-value">
                        {rsvp.plusOneName || "Not specified"}
                      </span>
                    </div>
                  )}

                  {rsvp.dietaryRestrictions && (
                    <div className="detail-row detail-full">
                      <span className="detail-icon">🥗</span>
                      <span className="detail-label">Dietary:</span>
                      <span className="detail-value">
                        {rsvp.dietaryRestrictions}
                      </span>
                    </div>
                  )}

                  {rsvp.plusOneDietaryRestrictions && (
                    <div className="detail-row detail-full">
                      <span className="detail-icon">🥗</span>
                      <span className="detail-label">Plus-One Dietary:</span>
                      <span className="detail-value">
                        {rsvp.plusOneDietaryRestrictions}
                      </span>
                    </div>
                  )}

                  {rsvp.songRequests && (
                    <div className="detail-row detail-full">
                      <span className="detail-icon">🎵</span>
                      <span className="detail-label">Song Requests:</span>
                      <span className="detail-value">{rsvp.songRequests}</span>
                    </div>
                  )}

                  {rsvp.specialAccommodations && (
                    <div className="detail-row detail-full">
                      <span className="detail-icon">💕</span>
                      <span className="detail-label">Message:</span>
                      <span className="detail-value">
                        {rsvp.specialAccommodations}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer with result count */}
      {!loading && filteredRsvps.length > 0 && (
        <div className="results-footer geo-box text-center">
          Showing {filteredRsvps.length} of {rsvps.length} RSVPs
        </div>
      )}
    </div>
  );
}
