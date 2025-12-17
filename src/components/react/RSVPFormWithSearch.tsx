import { useState, type FormEvent, type ChangeEvent } from "react";
import { isValidEmail } from "../../lib/utils";
import "./RSVPForm.css";

interface FormData {
  name: string;
  email: string;
  attending: "yes" | "no" | "";
  plusOne: boolean;
  plusOneName: string;
  dietaryRestrictions: string;
  plusOneDietaryRestrictions: string;
  songRequests: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  attending?: string;
  plusOneName?: string;
}

interface GuestInfo {
  id: string;
  name: string;
  email: string;
  allowPlusOne: boolean;
  plusOneName: string | null;
  maxGuests: number;
  hasRSVPd: boolean;
  rsvpStatus: "attending" | "declined" | null;
}

export default function RSVPFormWithSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [guestInfo, setGuestInfo] = useState<GuestInfo | null>(null);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [existingRSVP, setExistingRSVP] = useState<any>(null);
  const [viewingRSVP, setViewingRSVP] = useState(false);
  const [lookupEmail, setLookupEmail] = useState("");
  const [lookingUp, setLookingUp] = useState(false);
  const [showLookup, setShowLookup] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    attending: "",
    plusOne: false,
    plusOneName: "",
    dietaryRestrictions: "",
    plusOneDietaryRestrictions: "",
    songRequests: "",
    message: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Handle RSVP lookup by email - Request magic link
  const handleLookup = async (e: FormEvent) => {
    e.preventDefault();
    if (!lookupEmail.trim()) return;

    setLookingUp(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/rsvp-modify-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: lookupEmail.trim().toLowerCase(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Show success message
        setExistingRSVP({ email: lookupEmail.trim() });
        setViewingRSVP(true);
        setShowLookup(false);
      } else {
        setSubmitError(data.error || "Failed to send magic link. Please try again.");
      }
    } catch (error) {
      console.error("Lookup error:", error);
      setSubmitError("Error requesting magic link. Please try again.");
    } finally {
      setLookingUp(false);
    }
  };

  // Handle guest search
  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    setSearchPerformed(true);
    setGuestInfo(null);
    setShowForm(false);
    setEditMode(false);
    setSearchError(null);

    try {
      const response = await fetch(
        `/api/guest-search?q=${encodeURIComponent(searchQuery.trim())}`
      );

      if (response.status === 429) {
        const data = await response.json();
        setSearchError(
          `Too many search attempts. Please wait ${data.retryAfter} seconds and try again.`
        );
        setSearching(false);
        setSearchPerformed(false); // Don't show "No invitation found" for rate limit errors
        return;
      }

      const data = await response.json();

      if (data.found && data.guest) {
        setGuestInfo(data.guest);
        // Pre-fill form with guest info
        setFormData((prev) => ({
          ...prev,
          name: data.guest.name,
          email: data.guest.email,
          plusOneName: data.guest.plusOneName || "",
        }));
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setSearching(false);
    }
  };

  // Handle input changes
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
        ...(name === "plusOne" && !checked ? { plusOneName: "" } : {}),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  // Handle radio button changes
  const handleRadioChange = (value: "yes" | "no") => {
    setFormData((prev) => ({
      ...prev,
      attending: value,
    }));

    if (errors.attending) {
      setErrors((prev) => ({
        ...prev,
        attending: undefined,
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

    if (!formData.email.trim()) {
      newErrors.email = "Please enter your email";
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.attending) {
      newErrors.attending = "Please let us know if you can attend";
    }

    if (formData.plusOne && !formData.plusOneName.trim()) {
      newErrors.plusOneName = "Please enter your plus-one's name";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const method = editMode ? "PUT" : "POST";
      const response = await fetch("/api/rsvp", {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          guest_name: formData.name.trim(),
          guest_email: formData.email.trim().toLowerCase(),
          attending: formData.attending === "yes",
          plus_one: formData.plusOne,
          plus_one_name: formData.plusOneName.trim() || null,
          dietary_restrictions: formData.dietaryRestrictions.trim() || null,
          plus_one_dietary_restrictions: formData.plusOneDietaryRestrictions.trim() || null,
          song_requests: formData.songRequests.trim() || null,
          special_accommodations: formData.message.trim() || null,
          number_of_guests: formData.plusOne ? 2 : 1,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error(response);
        console.error(data);
        throw new Error(data.error || `Failed to ${editMode ? "update" : "submit"} RSVP`);
      }

      setSubmitted(true);

      setTimeout(() => {
        const successElement = document.getElementById("success-message");
        const successText = document.getElementById("success-message-text");
        if (successElement) {
          if (successText) {
            successText.textContent = editMode
              ? "Your RSVP has been updated successfully!"
              : "Your RSVP has been received!";
          }
          successElement.style.display = "block";
          successElement.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);
    } catch (error) {
      console.error(`Error ${editMode ? "updating" : "submitting"} RSVP:`, error);
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again or contact us directly."
      );

      setTimeout(() => {
        const errorElement = document.getElementById("error-message");
        if (errorElement) {
          errorElement.style.display = "block";
          errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return null;
  }

  return (
    <div className="rsvp-form-container">

      {/* Guest Search Section */}
      {!editMode && !showLookup && (
        <div className="guest-search-section">
          <h3 className="search-title">🔍 Find Your Invitation</h3>
          <p className="search-description">
            Search by your full name (exactly as on invitation) or email address
          </p>
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter your name or email..."
              className="search-input"
              disabled={searching}
            />
            <button
              type="submit"
              className="geo-button-secondary"
              disabled={searching || !searchQuery.trim()}
            >
              {searching ? "Searching..." : "🔍 Search"}
            </button>
          </form>

          {/* Rate Limit Error - Show inside search box */}
          {searchError && (
            <div className="submit-error" style={{ marginTop: "1rem" }}>
              <strong>⚠️</strong> {searchError}
            </div>
          )}

        {/* Search Results */}
        {searchPerformed && !searching && (
          <div className="search-results">
            {guestInfo ? (
              <div className="guest-found geo-box-neon">
                <h4 className="text-neon">✅ Invitation Found!</h4>
                <p>
                  <strong>Name:</strong> {guestInfo.name}
                </p>
                {guestInfo.allowPlusOne && (
                  <p className="plus-one-notice">
                    👥 You're welcome to bring a plus-one!
                    {guestInfo.plusOneName && (
                      <span style={{ display: "block", marginTop: "0.5rem" }}>
                        Plus-One: <strong>{guestInfo.plusOneName}</strong>
                      </span>
                    )}
                  </p>
                )}
                {guestInfo.hasRSVPd ? (
                  <div className="already-rsvpd">
                    <p className="text-neon-pink">
                      ✨ You've already RSVP'd!
                    </p>
                    <p>
                      Status:{" "}
                      {guestInfo.rsvpStatus === "attending"
                        ? "✅ Attending"
                        : "❌ Declined"}
                    </p>
                    <p className="contact-note">
                      Need to update your RSVP? Look below!
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowForm(true)}
                    className="geo-button-primary"
                  >
                    📝 Continue to RSVP
                  </button>
                )}
              </div>
            ) : (
              <div className="guest-not-found geo-box">
                <h4 className="text-neon">❓ No Invitation Found</h4>
                <p>
                  We couldn't find an invitation with that name or email.
                </p>
                <p>Contact us if you think this is an error!</p>
              </div>
            )}
          </div>
        )}
        </div>
      )}

      {/* RSVP Form */}
      {showForm && (
        <form className="rsvp-form" onSubmit={handleSubmit}>
          <div className="form-divider"></div>
          
          {editMode && (
            <div className="edit-mode-notice geo-box-neon">
              <p className="text-neon">✏️ Editing Mode - Update your RSVP below</p>
            </div>
          )}

          {/* Name Field */}
          <div className="form-group">
            <label htmlFor="name" className="form-label required">
              Your Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className={`form-input ${errors.name ? "error" : ""}`}
              value={formData.name}
              onChange={handleChange}
              placeholder="Ur Name"
              disabled={loading}
              aria-required="true"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "name-error" : undefined}
            />
            {errors.name && (
              <span id="name-error" className="form-error">
                {errors.name}
              </span>
            )}
          </div>

          {/* Email Field */}
          <div className="form-group">
            <label htmlFor="email" className="form-label required">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className={`form-input ${errors.email ? "error" : ""}`}
              value={formData.email}
              onChange={handleChange}
              placeholder="rose@rachelandtim.fun"
              disabled={loading || editMode}
              aria-required="true"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
            />
            {errors.email && (
              <span id="email-error" className="form-error">
                {errors.email}
              </span>
            )}
            {editMode && (
              <p className="form-note">Email cannot be changed when editing</p>
            )}
          </div>

          {/* Attending Radio Buttons */}
          <div className="form-group">
            <label className="form-label required">Will you be attending?</label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="attending"
                  value="yes"
                  checked={formData.attending === "yes"}
                  onChange={() => handleRadioChange("yes")}
                  disabled={loading}
                  aria-required="true"
                />
                <span className="radio-text">✅ Yes, I'll be there! 🎉</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="attending"
                  value="no"
                  checked={formData.attending === "no"}
                  onChange={() => handleRadioChange("no")}
                  disabled={loading}
                  aria-required="true"
                />
                <span className="radio-text">❌ Sorry, I can't make it 😢</span>
              </label>
            </div>
            {errors.attending && (
              <span className="form-error">{errors.attending}</span>
            )}
          </div>

          {/* Plus One Checkbox */}
          {formData.attending === "yes" && guestInfo?.allowPlusOne && (
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="plusOne"
                  checked={formData.plusOne}
                  onChange={handleChange}
                  disabled={loading || (guestInfo ? !guestInfo.allowPlusOne : false)}
                />
                <span className="checkbox-text">👥 I'm bringing a plus-one</span>
              </label>
              {guestInfo && !guestInfo.allowPlusOne && (
                <p className="form-note">
                  Your invitation is for one guest only.
                </p>
              )}
            </div>
          )}

          {/* Plus One Name */}
          {formData.attending === "yes" && formData.plusOne && (
            <div className="form-group">
              <label htmlFor="plusOneName" className="form-label required">
                Plus-One's Name
              </label>
              <input
                type="text"
                id="plusOneName"
                name="plusOneName"
                className={`form-input ${errors.plusOneName ? "error" : ""}`}
                value={formData.plusOneName}
                onChange={handleChange}
                placeholder="Ur Name"
                disabled={loading}
                aria-required="true"
                aria-invalid={!!errors.plusOneName}
                aria-describedby={
                  errors.plusOneName ? "plusOneName-error" : undefined
                }
              />
              {errors.plusOneName && (
                <span id="plusOneName-error" className="form-error">
                  {errors.plusOneName}
                </span>
              )}
            </div>
          )}

          {/* Dietary Restrictions */}
          {formData.attending === "yes" && (
            <div className="form-group">
              <label htmlFor="dietaryRestrictions" className="form-label">
                🍽️ Your Dietary Restrictions or Allergies
              </label>
              <textarea
                id="dietaryRestrictions"
                name="dietaryRestrictions"
                className="form-textarea"
                value={formData.dietaryRestrictions}
                onChange={handleChange}
                placeholder="Let us know about any dietary needs"
                rows={3}
                disabled={loading}
              />
            </div>
          )}

          {/* Plus One Dietary Restrictions */}
          {formData.attending === "yes" && formData.plusOne && (
            <div className="form-group">
              <label htmlFor="plusOneDietaryRestrictions" className="form-label">
                🍽️ Plus-One's Dietary Restrictions or Allergies
              </label>
              <textarea
                id="plusOneDietaryRestrictions"
                name="plusOneDietaryRestrictions"
                className="form-textarea"
                value={formData.plusOneDietaryRestrictions}
                onChange={handleChange}
                placeholder="Let us know about your plus-one's dietary needs"
                rows={3}
                disabled={loading}
              />
            </div>
          )}

          {/* Song Requests */}
          {formData.attending === "yes" && (
            <div className="form-group">
              <label htmlFor="songRequests" className="form-label">
                🎵 Song Requests
              </label>
              <textarea
                id="songRequests"
                name="songRequests"
                className="form-textarea"
                value={formData.songRequests}
                onChange={handleChange}
                placeholder="Help us build the perfect playlist :)"
                rows={3}
                disabled={loading}
              />
            </div>
          )}

          {/* Message to Couple */}
          <div className="form-group">
            <label htmlFor="message" className="form-label">
              💕 Message to the Couple
            </label>
            <textarea
              id="message"
              name="message"
              className="form-textarea"
              value={formData.message}
              onChange={handleChange}
              placeholder="Share your well wishes, special requests, or anything else you'd like us to know..."
              rows={4}
              disabled={loading}
            />
          </div>

          {/* Submit Error */}
          {submitError && (
            <div className="submit-error">
              <strong>⚠️ Error:</strong> {submitError}
            </div>
          )}

          {/* Submit Button */}
          <div className="form-actions">
            {editMode && (
              <button
                type="button"
                className="submit-button geo-button-secondary"
                onClick={() => {
                  setEditMode(false);
                  setShowForm(false);
                  setViewingRSVP(true);
                }}
                disabled={loading}
                style={{ marginRight: "1rem" }}
              >
                ❌ Cancel
              </button>
            )}
            <button
              type="submit"
              className="submit-button geo-button-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner">⏳</span> {editMode ? "Updating..." : "Submitting..."}
                </>
              ) : (
                <>{editMode ? "✨ Update RSVP ✨" : "✨ Submit RSVP ✨"}</>
              )}
            </button>
          </div>

          {/* Required Fields Note */}
          <p className="form-note">
            <span className="required-indicator">*</span> Required fields
          </p>
        </form>
      )}
            {/* Modify Existing RSVP Section */}
      {!showForm && (
        <div className="modify-rsvp-section">
          <div className="modify-box geo-box-neon">
            <h3 className="text-neon">✏️ Modify Your RSVP</h3>
            <p>Already RSVP'd? Enter your email to update your response:</p>
            <form onSubmit={handleLookup} className="search-form">
              <input
                type="email"
                value={lookupEmail}
                onChange={(e) => setLookupEmail(e.target.value)}
                placeholder="Enter your email address..."
                className="search-input"
                disabled={lookingUp}
              />
              <button
                type="submit"
                className="geo-button-primary"
                disabled={lookingUp || !lookupEmail.trim()}
              >
                {lookingUp ? "Looking up..." : "🔍 Find My RSVP"}
              </button>
            </form>
            {submitError && !existingRSVP && (
              <div className="submit-error" style={{ marginTop: "1rem" }}>
                <strong>⚠️</strong> {submitError}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Magic Link Sent Message */}
      {existingRSVP && viewingRSVP && !editMode && !submitted && (
        <div className="existing-rsvp-info geo-box-neon">
          <h4 className="text-neon-pink">📧 Check Your Email!</h4>
          <div style={{ marginTop: "1rem" }}>
            <p>
              We've sent a secure link to <strong>{existingRSVP.email}</strong>
            </p>
            <p style={{ marginTop: "1rem" }}>
              Click the link in your email to edit your RSVP. The link will expire in 15 minutes for security.
            </p>
            <p style={{ marginTop: "1rem", fontSize: "0.9rem", color: "var(--color-cyan)" }}>
              💡 Didn't receive it? Check your spam folder or try again.
            </p>
          </div>
          <button
            onClick={() => {
              setExistingRSVP(null);
              setViewingRSVP(false);
              setLookupEmail("");
            }}
            className="geo-button-secondary"
            style={{ marginTop: "1rem" }}
          >
            🔙 Back
          </button>
        </div>
      )}
    </div>
  );
}

// Made with Bob