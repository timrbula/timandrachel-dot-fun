import { useState, useEffect } from "react";
import "./HitCounter.css";

/**
 * Retro-style visitor counter component
 * Displays the total number of visitors to the site
 * Increments count on first visit (uses localStorage to prevent multiple increments)
 */
export default function HitCounter() {
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchAndIncrementCount = async () => {
      try {
        // Check if user has already been counted in this session
        const hasVisited = localStorage.getItem("visitor_counted");

        if (!hasVisited) {
          // Increment the counter
          const incrementResponse = await fetch("/api/counter", {
            method: "POST",
          });

          if (!incrementResponse.ok) {
            throw new Error("Failed to increment counter");
          }

          const incrementData = await incrementResponse.json();
          setCount(incrementData.count);

          // Mark as visited
          localStorage.setItem("visitor_counted", "true");
        } else {
          // Just fetch the current count
          const fetchResponse = await fetch("/api/counter");

          if (!fetchResponse.ok) {
            console.error(fetchResponse);
            throw new Error("Failed to fetch counter");
          }

          const fetchData = await fetchResponse.json();
          setCount(fetchData.count);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error with visitor counter:", err);
        setError(true);
        setLoading(false);
      }
    };

    fetchAndIncrementCount();
  }, []);

  // Format count with leading zeros (e.g., 000123)
  const formatCount = (num: number): string => {
    return num.toString().padStart(6, "0");
  };

  // Split count into individual digits for display
  const getDigits = (num: number): string[] => {
    return formatCount(num).split("");
  };

  if (loading) {
    return (
      <div className="hit-counter">
        <div className="counter-label">Loading visitors...</div>
        <div className="counter-display">
          {[0, 0, 0, 0, 0, 0].map((_, index) => (
            <div key={index} className="counter-digit loading">
              -
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || count === null) {
    return (
      <div className="hit-counter">
        <div className="counter-label">Visitor Counter</div>
        <div className="counter-display">
          {[0, 0, 0, 0, 0, 0].map((_, index) => (
            <div key={index} className="counter-digit error">
              ?
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="hit-counter">
      <div className="counter-label">
        <span className="blink">✨</span> You are visitor #{" "}
        <span className="blink">✨</span>
      </div>
      <div className="counter-display">
        {getDigits(count).map((digit, index) => (
          <div key={index} className="counter-digit">
            {digit}
          </div>
        ))}
      </div>
      <div className="counter-footer">Since December 2025 🎉</div>
    </div>
  );
}

// Made with Bob
