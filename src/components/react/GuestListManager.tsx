import { useState, useEffect, type FormEvent } from "react";
import "./GuestListManager.css";

interface Guest {
  id: string;
  name: string;
  email: string;
  allowPlusOne: boolean;
  plusOneName: string | null;
  invitationSent: boolean;
  invitationSentAt: string | null;
  notes: string | null;
  rsvps: Array<{
    id: string;
    attending: boolean;
    numberOfGuests: number;
    createdAt: string;
  }>;
}

interface GuestFormData {
  name: string;
  email: string;
  allowPlusOne: boolean;
  plusOneName: string;
  invitationSent: boolean;
  notes: string;
}

export default function GuestListManager() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [adminSecret, setAdminSecret] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [formData, setFormData] = useState<GuestFormData>({
    name: "",
    email: "",
    allowPlusOne: false,
    plusOneName: "",
    invitationSent: false,
    notes: "",
  });

  // Check for stored admin secret
  useEffect(() => {
    const stored = localStorage.getItem("adminSecret");
    if (stored) {
      setAdminSecret(stored);
      setIsAuthenticated(true);
      fetchGuests(stored);
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    if (adminSecret.trim()) {
      localStorage.setItem("adminSecret", adminSecret);
      setIsAuthenticated(true);
      fetchGuests(adminSecret);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminSecret");
    setAdminSecret("");
    setIsAuthenticated(false);
    setGuests([]);
  };

  const fetchGuests = async (secret: string) => {
    setLoading(true);
    setError(null);
    try {
      const url = searchQuery
        ? `/api/guests?search=${encodeURIComponent(searchQuery)}`
        : "/api/guests";

      const response = await fetch(url, {
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
        console.error(response);
        throw new Error("Failed to fetch guests");
      }

      const data = await response.json();
      setGuests(data.guests || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load guests");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (isAuthenticated) {
      fetchGuests(adminSecret);
    }
  };

  const handleAddGuest = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch("/api/guests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminSecret}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        console.error(response);
        console.error(data);
        throw new Error(data.error || "Failed to add guest");
      }

      // Reset form and refresh list
      setFormData({
        name: "",
        email: "",
        allowPlusOne: false,
        plusOneName: "",
        invitationSent: false,
        notes: "",
      });
      setShowAddForm(false);
      fetchGuests(adminSecret);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add guest");
    }
  };

  const handleUpdateGuest = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingGuest) return;

    setError(null);

    try {
      const response = await fetch("/api/guests", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminSecret}`,
        },
        body: JSON.stringify({
          id: editingGuest.id,
          ...formData,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        console.error(response);
        console.error(data);
        throw new Error(data.error || "Failed to update guest");
      }

      setEditingGuest(null);
      setFormData({
        name: "",
        email: "",
        allowPlusOne: false,
        plusOneName: "",
        invitationSent: false,
        notes: "",
      });
      fetchGuests(adminSecret);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update guest");
    }
  };

  const handleDeleteGuest = async (id: string) => {
    if (!confirm("Are you sure you want to delete this guest?")) return;

    setError(null);

    try {
      const response = await fetch("/api/guests", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminSecret}`,
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete guest");
      }

      fetchGuests(adminSecret);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete guest");
    }
  };

  const startEdit = (guest: Guest) => {
    setEditingGuest(guest);
    setFormData({
      name: guest.name,
      email: guest.email,
      allowPlusOne: guest.allowPlusOne,
      plusOneName: guest.plusOneName || "",
      invitationSent: guest.invitationSent,
      notes: guest.notes || "",
    });
    setShowAddForm(false);
  };

  const cancelEdit = () => {
    setEditingGuest(null);
    setFormData({
      name: "",
      email: "",
      allowPlusOne: false,
      plusOneName: "",
      invitationSent: false,
      notes: "",
    });
  };

  // Login form
  if (!isAuthenticated) {
    return (
      <div className="guest-manager">
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
    <div className="guest-manager">
      {/* Header Actions */}
      <div className="manager-header geo-box">
        <div className="header-actions">
          <button
            onClick={() => {
              setShowAddForm(!showAddForm);
              setEditingGuest(null);
            }}
            className="geo-button-primary"
          >
            {showAddForm ? "Cancel" : "➕ Add New Guest"}
          </button>
          <button onClick={handleLogout} className="geo-button-warning">
            🔓 Logout
          </button>
        </div>

        {/* Search Bar */}
        <div className="search-bar">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search by name or email..."
            className="search-input"
          />
          <button onClick={handleSearch} className="geo-button-secondary">
            🔍 Search
          </button>
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                fetchGuests(adminSecret);
              }}
              className="geo-button-secondary"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-box geo-box">
          <strong>⚠️ Error:</strong> {error}
        </div>
      )}

      {/* Add/Edit Form */}
      {(showAddForm || editingGuest) && (
        <div className="guest-form geo-box-raised">
          <h3 className="text-neon">
            {editingGuest ? "✏️ Edit Guest" : "➕ Add New Guest"}
          </h3>
          <form onSubmit={editingGuest ? handleUpdateGuest : handleAddGuest}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Name *</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.allowPlusOne}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        allowPlusOne: e.target.checked,
                      })
                    }
                  />
                  Allow Plus-One
                </label>
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.invitationSent}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        invitationSent: e.target.checked,
                      })
                    }
                  />
                  Invitation Sent
                </label>
              </div>
            </div>

            {formData.allowPlusOne && (
              <div className="form-group">
                <label htmlFor="plusOneName">Plus-One Name (Optional)</label>
                <input
                  type="text"
                  id="plusOneName"
                  value={formData.plusOneName}
                  onChange={(e) =>
                    setFormData({ ...formData, plusOneName: e.target.value })
                  }
                  className="form-input"
                  placeholder="Enter plus-one's name if known"
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                className="form-textarea"
                rows={3}
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="geo-button-primary">
                {editingGuest ? "💾 Update Guest" : "➕ Add Guest"}
              </button>
              {editingGuest && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="geo-button-secondary"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Guest List */}
      <div className="guest-list">
        {loading ? (
          <div className="loading-box geo-box text-center">
            <p>⏳ Loading guests...</p>
          </div>
        ) : guests.length === 0 ? (
          <div className="empty-box geo-box text-center">
            <p>No guests found. Add your first guest to get started!</p>
          </div>
        ) : (
          <>
            <div className="guest-stats geo-box">
              <div className="stat">
                <strong>Total Guests:</strong> {guests.length}
              </div>
              <div className="stat">
                <strong>RSVP'd:</strong>{" "}
                {guests.filter((g) => g.rsvps.length > 0).length}
              </div>
              <div className="stat">
                <strong>Attending:</strong>{" "}
                {guests
                  .filter((g) => g.rsvps.length > 0 && g.rsvps[0].attending)
                  .reduce((total, g) => total + (g.rsvps[0].numberOfGuests || 1), 0)}
              </div>
              <div className="stat">
                <strong>Declined:</strong>{" "}
                {
                  guests.filter(
                    (g) => g.rsvps.length > 0 && !g.rsvps[0].attending
                  ).length
                }
              </div>
            </div>

            <div className="guest-grid">
              {guests.map((guest) => (
                <div key={guest.id} className="guest-card geo-box-raised">
                  <div className="guest-header">
                    <h3 className="guest-name">{guest.name}</h3>
                    {guest.rsvps.length > 0 && (
                      <span
                        className={`rsvp-badge ${
                          guest.rsvps[0].attending ? "attending" : "declined"
                        }`}
                      >
                        {guest.rsvps[0].attending ? "✅ Attending" : "❌ Declined"}
                      </span>
                    )}
                  </div>

                  <div className="guest-details">
                    <p>
                      <strong>📧 Email:</strong> {guest.email}
                    </p>
                    <p>
                      <strong>👥 Plus-One:</strong>{" "}
                      {guest.allowPlusOne ? "Yes" : "No"}
                    </p>
                    {guest.allowPlusOne && guest.plusOneName && (
                      <p>
                        <strong>👤 Plus-One Name:</strong> {guest.plusOneName}
                      </p>
                    )}
                    <p>
                      <strong>✉️ Invitation:</strong>{" "}
                      {guest.invitationSent ? "Sent" : "Not Sent"}
                    </p>
                    <p>
                      <strong>📝 Notes:</strong> {guest.notes}
                    </p>
                  </div>

                  <div className="guest-actions">
                    <button
                      onClick={() => startEdit(guest)}
                      className="geo-button-secondary"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDeleteGuest(guest.id)}
                      className="geo-button-warning"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Made with Bob