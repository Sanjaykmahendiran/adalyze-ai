// lib/sessionManager.ts
import { v4 as uuidv4 } from "uuid";
import Cookies from "js-cookie";

const SESSION_KEY = "adalyze_session_id";

/**
 * Get or create a session ID in localStorage.
 * Format: adalyze_<12 hex> to match your example.
 */
export function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let sessionId = localStorage.getItem(SESSION_KEY);

  if (!sessionId) {
    // create adalyze_<12 chars>
    sessionId = `adalyze_${uuidv4().replace(/-/g, "").slice(0, 12)}`;
    localStorage.setItem(SESSION_KEY, sessionId);
  }

  return sessionId;
}

/**
 * Clear session data (call on tab close).
 * Removes sessionId from localStorage and all user-related cookies.
 */
export function clearSessionId() {
  if (typeof window === "undefined") return;

  // Remove local session
  localStorage.removeItem(SESSION_KEY);

  // Remove cookies (user info)
  Cookies.remove("email"); 
}
