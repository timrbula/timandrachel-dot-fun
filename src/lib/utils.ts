/**
 * Utility functions for the wedding website
 */

import crypto from "crypto";

/**
 * Generate a cryptographically secure random token
 * @returns 64-character hex string
 */
export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Check if a token has expired
 */
export function isTokenExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt;
}

/**
 * Get token expiration time (15 minutes from now)
 */
export function getTokenExpiration(): Date {
  const expiration = new Date();
  expiration.setMinutes(expiration.getMinutes() + 15);
  return expiration;
}

/**
 * Validate token format (64 hex characters)
 */
export function isValidTokenFormat(token: string): boolean {
  return /^[a-f0-9]{64}$/i.test(token);
}

/**
 * Format a date string to a readable format
 */
export function formatDate(
  date: string | Date,
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
  };

  return dateObj.toLocaleDateString("en-US", defaultOptions);
}

/**
 * Format a time string to a readable format
 */
export function formatTime(date: string | Date): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  return dateObj.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Format a date and time together
 */
export function formatDateTime(date: string | Date): string {
  return `${formatDate(date)} at ${formatTime(date)}`;
}

/**
 * Calculate days until the wedding
 */
export function daysUntilWedding(
  weddingDate: Date = new Date("2026-10-09")
): number {
  const today = new Date();
  const timeDiff = weddingDate.getTime() - today.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
  return daysDiff > 0 ? daysDiff : 0;
}

/**
 * Validate email address
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (US format)
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex =
    /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
}

/**
 * Format phone number to (XXX) XXX-XXXX
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);

  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }

  return phone;
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/&/g, "&")
    .replace(/</g, "<")
    .replace(/>/g, ">")
    .replace(/"/g, '"')
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

/**
 * Truncate text to a maximum length
 */
export function truncateText(
  text: string,
  maxLength: number,
  suffix: string = "..."
): string {
  if (text.length <= maxLength) {
    return text;
  }

  return text.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * Generate a random ID
 */
export function generateId(prefix: string = "id"): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Scroll to element smoothly
 */
export function scrollToElement(elementId: string, offset: number = 0): void {
  const element = document.getElementById(elementId);

  if (element) {
    const elementPosition =
      element.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = elementPosition - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  }
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        // Using deprecated execCommand as fallback for older browsers
        // TypeScript doesn't recognize execCommand anymore, but it's still supported in browsers
        const success = (document as any).execCommand("copy");
        textArea.remove();
        return success;
      } catch (error) {
        console.error("Failed to copy:", error);
        textArea.remove();
        return false;
      }
    }
  } catch (error) {
    console.error("Failed to copy:", error);
    return false;
  }
}

/**
 * Get a random item from an array
 */
export function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Shuffle an array
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

/**
 * Constants
 */
export const WEDDING_DATE = new Date("2026-10-09T18:00:00-04:00");
export const VENUE_NAME = "Neptune Room @ Radio Star";
export const VENUE_ADDRESS = "13 Greenpoint Ave, Brooklyn, NY 11222";
export const VENUE_COORDINATES = { lat: 40.7308, lng: -73.9566 };

export const DIETARY_OPTIONS = [
  "None",
  "Vegetarian",
  "Vegan",
  "Gluten-Free",
  "Dairy-Free",
  "Nut Allergy",
  "Other",
] as const;

export const SCHEDULE = [
  {
    time: "6:00 PM",
    event: "Ceremony",
    description: 'Join us as we say "I do!"',
  },
  {
    time: "7:00 PM",
    event: "Cocktail Hour",
    description: "Drinks, appetizers, and mingling!",
  },
  {
    time: "8:00 PM",
    event: "Reception & Dinner",
    description: "Delicious food and heartfelt toasts",
  },
  {
    time: "9:30 PM",
    event: "Dancing",
    description: "Let's get this party started!",
  },
  {
    time: "10:30 PM",
    event: "Cake Cutting",
    description: "Sweet treats time!",
  },
  {
    time: "12:00 AM",
    event: "Last Call",
    description: "All good things must come to an end...",
  },
] as const;

// Made with Bob
