import { useState, useEffect, type FormEvent, type ChangeEvent } from "react";
import { isValidEmail } from "../../lib/utils";
import "./RSVPForm.css";

interface RSVPData {
  id: string;
  guest_name: string;
  guest_email: string;
  attending: boolean;
  plus_one: boolean;
  plus_one_name: string | null;
  dietary_restrictions: string | null;
  song_requests: string | null;
  special_accommodations: string | null;
  number_of_guests: number;
}

interface FormData {
  name: string;
  email: string;
  attending: "yes" | "no" | "";
  plusOne: boolean;
  plusOneName: string;
  dietaryRestrictions: string;
  songRequests: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  attending?: string;
  plusOneName?: string;
}

interface RSVPEditFormProps {
  token: string;
}

export default function RSVPEditForm({ token }: RSVPEditFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    attending: "",
    plusOne: false,
    plusOneName: "",
    dietaryRestrictions: "",
    songRequests: "",
    message: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Load existing RSVP data
  useEffect(() => {
    async function loadRSVP() {
      try {
        const response = await fetch(
          `/api/rsvp-verify-token?token=${encodeURIComponent(token)}`
        );
        const data = await response.json();

        if (!response.ok || !data.valid) {
          setLoadError(data.error || "Failed to load RSVP data");
          return;
        }

        const rsvp: RSVPData = data.rsvp;

        // Populate form with existing data
        setFormData({
          name: rsvp.guest_name,
          email: rsvp.guest_email,
          attending: rsvp.attending ? "yes" : "no",
          plusOne: rsvp.plus_one,
          plusOneName: rsvp.plus_one_name || "",
          dietaryRestrictions: rsvp.dietary_restrictions || "",
          songRequests: rsvp.song_requests || "",
          message: rsvp.special_accommodations || "",
        });
      } catch (error) {
        console.error("Error loading RSVP:", error);
        setLoadError("Failed to load RSVP data. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadRSVP();
  }, [token]);

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
        // Clear plus one name if unchecking plus one
        ...(name === "plusOne" && !checked ? { plusOneName: "" } : {}),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear error for this field
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

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Please enter your name";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Please enter your email";
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Attending validation
    if (!formData.attending) {
      newErrors.attending = "Please let us know if you can attend";
    }

    // Plus one name validation
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

    // Validate form
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/rsvp", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: token,
          guest_name: formData.name.trim(),
          guest_email: formData.email.trim().toLowerCase(),
          attending: formData.attending === "yes",
          plus_one: formData.plusOne,
          plus_one_name: formData.plusOneName.trim() || null,
          dietary_restrictions: formData.dietaryRestrictions.trim() || null,
          song_requests: formData.songRequests.trim() || null,
          special_accommodations: formData.message.trim() || null,
          number_of_guests: formData.plusOne ? 2 : 1,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update RSVP");
      }

      // Success!
      setSubmitted(true);
    } catch (error) {
      console.error("Error updating RSVP:", error);
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again or contact us directly."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="rsvp-form-loading">
        <div className="loading-spinner">⏳</div>
        <p>Loading your RSVP...</p>
      </div>
    );
  }

  // Load error state
  if (loadError) {
    return (
      <div className="rsvp-form-error">
        <p className="error-text">⚠️ {loadError}</p>
      </div>
    );
  }

  // Success state
  if (submitted) {
    return (
      <div className="rsvp-form-success">
        <div className="success-icon">🎉</div>
        <h3 className="success-title">RSVP Updated!</h3>
        <p className="success-message">
          Your RSVP has been successfully updated. Check your email for
          confirmation!
        </p>
        <p className="success-note">
          We can't wait to celebrate with you! 💕
        </p>
        <div className="success-actions">
          <a href="/" className="geo-button-primary">
            🏠 Back to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <form className="rsvp-form" onSubmit={handleSubmit}>
      {/* Info Notice */}
      <div className="form-notice">
        <p>
          ℹ️ You're editing your existing RSVP. Make any changes you need and
          click "Update RSVP" when you're done.
        </p>
      </div>

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
          placeholder="Jane Doe"
          disabled={submitting}
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

      {/* Email Field (Read-only) */}
      <div className="form-group">
        <label htmlFor="email" className="form-label required">
          Email Address
        </label>
        <input
          type="email"
          id="email"
          name="email"
          className="form-input"
          value={formData.email}
          disabled={true}
          aria-required="true"
          title="Email cannot be changed"
        />
        <span className="form-help">
          📧 Email cannot be changed for security reasons
        </span>
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
              disabled={submitting}
              aria-required="true"
            />
            <span className="radio-text">
              ✅ Yes, I'll be there! 🎉
            </span>
          </label>
          <label className="radio-label">
            <input
              type="radio"
              name="attending"
              value="no"
              checked={formData.attending === "no"}
              onChange={() => handleRadioChange("no")}
              disabled={submitting}
              aria-required="true"
            />
            <span className="radio-text">
              ❌ Sorry, I can't make it 😢
            </span>
          </label>
        </div>
        {errors.attending && (
          <span className="form-error">{errors.attending}</span>
        )}
      </div>

      {/* Plus One Checkbox */}
      {formData.attending === "yes" && (
        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="plusOne"
              checked={formData.plusOne}
              onChange={handleChange}
              disabled={submitting}
            />
            <span className="checkbox-text">
              👥 I'm bringing a plus-one
            </span>
          </label>
        </div>
      )}

      {/* Plus One Name (conditional) */}
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
            placeholder="John Doe"
            disabled={submitting}
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
            🍽️ Dietary Restrictions or Allergies
          </label>
          <textarea
            id="dietaryRestrictions"
            name="dietaryRestrictions"
            className="form-textarea"
            value={formData.dietaryRestrictions}
            onChange={handleChange}
            placeholder="Let us know about any dietary needs"
            rows={3}
            disabled={submitting}
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
            disabled={submitting}
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
          disabled={submitting}
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
        <button
          type="submit"
          className="submit-button geo-button-primary"
          disabled={submitting}
        >
          {submitting ? (
            <>
              <span className="spinner">⏳</span> Updating...
            </>
          ) : (
            <>
              ✨ Update RSVP ✨
            </>
          )}
        </button>
      </div>

      {/* Required Fields Note */}
      <p className="form-note">
        <span className="required-indicator">*</span> Required fields
      </p>
    </form>
  );
}

// Made with Bob