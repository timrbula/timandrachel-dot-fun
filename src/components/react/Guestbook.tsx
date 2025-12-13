import { useState, useEffect, type FormEvent, type ChangeEvent } from "react";
import { formatDate } from "../../lib/utils";
import "./Guestbook.css";

interface GuestbookEntry {
  id: string;
  created_at: string;
  name: string;
  message: string;
  location?: string;
}

interface FormData {
  name: string;
  location: string;
  message: string;
}

interface FormErrors {
  name?: string;
  message?: string;
}

const EMOJIS = ["💕", "🎉", "✨", "💒", "🥂", "💐", "🎊", "🌟", "💖", "🎈"];

export default function Guestbook() {
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    location: "",
    message: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Fetch guestbook entries
  const fetchEntries = async (pageNum: number = 1) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/guestbook?page=${pageNum}&limit=10`);

      if (!response.ok) {
        throw new Error("Failed to fetch guestbook entries");
      }

      const data = await response.json();

      if (pageNum === 1) {
        setEntries(data.entries);
      } else {
        setEntries((prev) => [...prev, ...data.entries]);
      }

      setHasMore(data.hasMore);
      setError(null);
    } catch (err) {
      console.error("Error fetching guestbook entries:", err);
      setError("Failed to load guestbook entries. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Load entries on mount
  useEffect(() => {
    fetchEntries(1);
  }, []);

  // Handle input changes
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Please enter your name";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Please enter a message";
    } else if (formData.message.trim().length < 5) {
      newErrors.message = "Message must be at least 5 characters";
    } else if (formData.message.trim().length > 500) {
      newErrors.message = "Message must be less than 500 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(false);

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/guestbook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          location: formData.location.trim() || null,
          message: formData.message.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit entry");
      }

      // Success!
      setSubmitSuccess(true);
      setFormData({
        name: "",
        location: "",
        message: "",
      });

      // Refresh entries to show new one (if approved immediately)
      setTimeout(() => {
        fetchEntries(1);
        setSubmitSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Error submitting guestbook entry:", error);
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Load more entries
  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchEntries(nextPage);
  };

  return (
    <div className="guestbook">
      {/* Sign Guestbook Form */}
      <section className="guestbook-form-section">
        <h3 className="section-title">
          <span className="emoji">✍️</span> Sign Our Guestbook{" "}
          <span className="emoji">✍️</span>
        </h3>

        <form className="guestbook-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="gb-name" className="form-label required">
                Your Name
              </label>
              <input
                type="text"
                id="gb-name"
                name="name"
                className={`form-input ${errors.name ? "error" : ""}`}
                value={formData.name}
                onChange={handleChange}
                placeholder="Jane Doe"
                disabled={submitting}
                maxLength={100}
              />
              {errors.name && <span className="form-error">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="gb-location" className="form-label">
                Location (Optional)
              </label>
              <input
                type="text"
                id="gb-location"
                name="location"
                className="form-input"
                value={formData.location}
                onChange={handleChange}
                placeholder="Brooklyn, NY"
                disabled={submitting}
                maxLength={100}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="gb-message" className="form-label required">
              Your Message
            </label>
            <textarea
              id="gb-message"
              name="message"
              className={`form-textarea ${errors.message ? "error" : ""}`}
              value={formData.message}
              onChange={handleChange}
              placeholder="Share your congratulations, memories, or well wishes..."
              rows={4}
              disabled={submitting}
              maxLength={500}
            />
            <div className="char-count">
              {formData.message.length} / 500 characters
            </div>
            {errors.message && (
              <span className="form-error">{errors.message}</span>
            )}
          </div>

          {submitError && (
            <div className="submit-error">
              <strong>⚠️ Error:</strong> {submitError}
            </div>
          )}

          {submitSuccess && (
            <div className="submit-success">
              <strong>✅ Success!</strong> Your message has been submitted and
              will appear after approval!
            </div>
          )}

          <button
            type="submit"
            className="submit-button"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span className="spinner">⏳</span> Submitting...
              </>
            ) : (
              <>✨ Sign Guestbook ✨</>
            )}
          </button>
        </form>
      </section>

      {/* Guestbook Entries */}
      <section className="guestbook-entries-section">
        <h3 className="section-title">
          <span className="emoji">📖</span> Messages from Our Guests{" "}
          <span className="emoji">📖</span>
        </h3>

        {loading && entries.length === 0 ? (
          <div className="loading-state">
            <div className="spinner-large">⏳</div>
            <p>Loading messages...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p className="error-icon">⚠️</p>
            <p>{error}</p>
            <button onClick={() => fetchEntries(1)} className="retry-button">
              Try Again
            </button>
          </div>
        ) : entries.length === 0 ? (
          <div className="empty-state">
            <p className="empty-icon">📝</p>
            <p>No messages yet. Be the first to sign our guestbook!</p>
          </div>
        ) : (
          <>
            <div className="entries-grid">
              {entries.map((entry, index) => (
                <div key={entry.id} className="entry-card">
                  <div className="entry-header">
                    <div className="entry-emoji">
                      {EMOJIS[index % EMOJIS.length]}
                    </div>
                    <div className="entry-meta">
                      <div className="entry-name">{entry.name}</div>
                      {entry.location && (
                        <div className="entry-location">📍 {entry.location}</div>
                      )}
                    </div>
                  </div>
                  <div className="entry-message">{entry.message}</div>
                  <div className="entry-date">
                    {formatDate(entry.created_at, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                </div>
              ))}
            </div>

            {hasMore && (
              <div className="load-more-container">
                <button
                  onClick={loadMore}
                  className="load-more-button"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner">⏳</span> Loading...
                    </>
                  ) : (
                    <>📚 Load More Messages</>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

// Made with Bob
