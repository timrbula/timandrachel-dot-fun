import { useState, type FormEvent } from "react";
import "./SmsBroadcast.css";

interface SmsSendResult {
  phone: string;
  success: boolean;
  error?: string;
}

interface SmsResponse {
  success: boolean;
  sent: number;
  failed: number;
  total: number;
  results: SmsSendResult[];
}

const MAX_LENGTH = 1600;

export default function SmsBroadcast() {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SmsResponse | null>(null);

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();

    if (!message.trim()) return;

    if (
      !confirm(
        "Are you sure you want to send this text message to all attending guests?"
      )
    ) {
      return;
    }

    setSending(true);
    setError(null);
    setResult(null);

    try {
      const adminSecret = localStorage.getItem("adminSecret") || "";

      const response = await fetch("/api/sms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminSecret}`,
        },
        body: JSON.stringify({ message: message.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send text messages");
      }

      setResult(data);
      setMessage("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to send text messages"
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="sms-broadcast">
      <div className="broadcast-box geo-box-raised">
        <p className="recipient-count">
          This will text every guest marked as <strong>attending</strong> who
          has a phone number on file.
        </p>

        {error && (
          <div className="error-box geo-box">
            <strong>⚠️ Error:</strong> {error}
          </div>
        )}

        {result && (
          <div
            className={`result-box ${
              result.failed === 0 ? "success" : "failure"
            }`}
          >
            <strong>
              {result.failed === 0 ? "✅" : "⚠️"} Sent {result.sent} of{" "}
              {result.total} text messages.
            </strong>
            {result.failed > 0 && (
              <p>{result.failed} message(s) failed to send.</p>
            )}
          </div>
        )}

        <form onSubmit={handleSend}>
          <div className="form-group">
            <label htmlFor="sms-message">Message</label>
            <textarea
              id="sms-message"
              className="form-textarea"
              rows={5}
              maxLength={MAX_LENGTH}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hey! Just a reminder that the wedding is this weekend..."
              required
            />
            <div className="char-count">
              {message.length} / {MAX_LENGTH}
            </div>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="geo-button-primary"
              disabled={sending || !message.trim()}
            >
              {sending ? "📤 Sending..." : "📱 Send Text to All Guests"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Made with Bob
