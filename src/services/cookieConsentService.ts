import { getSessionId } from "@/lib/sessionManager";
import Cookies from "js-cookie";

export interface CookieConsentData {
  necessary: number;
  analytics: number;
  marketing: number;
}

export interface CookieConsentPayload {
  gofor: "addconsent";
  cookie_id: string;
  user_id?: number;
  consent: CookieConsentData;
}

export interface GetConsentResponse {
  status: string;
  data?: {
    id: number;
    cookie_id: string;
    user_id: number;
    consent_json: CookieConsentData;
    consent_string: string | null;
    ip: string;
    user_agent: string;
    created_at: string;
  };
  message?: string;
}

export interface AddConsentResponse {
  status: string;
  cookie_id: string;
  message: string;
}

/**
 * Generate a unique cookie ID for the user
 * Format: adalyze_<12 hex chars> (same as session ID)
 */
export function generateCookieId(): string {
  return getSessionId();
}

/**
 * Get cookie ID from cookies (preferred) or generate new one
 */
export function getCookieId(): string {
  if (typeof window === "undefined") return generateCookieId();
  
  // First try to get from cookies (from addconsent response)
  const savedCookieId = Cookies.get('cookie_id');
  if (savedCookieId) {
    return savedCookieId;
  }
  
  // Fallback to generating new one
  return generateCookieId();
}

/**
 * Save cookie ID to cookies
 */
export function saveCookieId(cookieId: string): void {
  if (typeof window === "undefined") return;
  Cookies.set('cookie_id', cookieId, { expires: 365 }); // Save for 1 year
}

/**
 * Get user ID from cookies
 * Returns undefined if user is not authenticated
 */
export function getUserId(): number | undefined {
  if (typeof window === "undefined") return undefined;
  
  const userId = Cookies.get('userId');
  
  // Return user_id if available, otherwise return undefined for anonymous users
  return userId ? parseInt(userId, 10) : undefined;
}

/**
 * Send cookie consent data to the API
 */
export async function sendCookieConsent(consent: CookieConsentData): Promise<AddConsentResponse> {
  try {
    const cookieId = generateCookieId();
    const userId = getUserId();
    
    const payload = {
      cookie_id: cookieId,
      consent,
      ...(userId && { user_id: userId })
    };

    console.log("Sending cookie consent:", payload);

    const response = await fetch("https://adalyzeai.xyz/App/api.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ gofor: "addconsent", ...payload }),
    });

    const result: AddConsentResponse = await response.json();
    
    // If successful, save the cookie_id from response to cookies
    if (result.status === "success" && result.cookie_id) {
      saveCookieId(result.cookie_id);
      console.log("Cookie ID saved:", result.cookie_id);
    }

    return result;
  } catch (error) {
    console.error("Cookie consent API error:", error);
    throw new Error("Failed to send cookie consent");
  }
}

/**
 * Get existing consent data from the API
 */
export async function getCookieConsent(cookieId?: string): Promise<GetConsentResponse | null> {
  try {
    // Use provided cookieId, or get from cookies, or generate new one
    const id = cookieId || getCookieId();
    
    const response = await fetch("https://adalyzeai.xyz/App/api.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ gofor: "getconsent", cookie_id: id }),
    });

    return await response.json();
  } catch (error) {
    console.error("Get cookie consent API error:", error);
    return null;
  }
}

/**
 * Check if cookie_id exists in cookies
 */
export function hasCookieId(): boolean {
  if (typeof window === "undefined") return false;
  return !!Cookies.get('cookie_id');
}

/**
 * Check if user has already given consent
 */
export async function hasExistingConsent(): Promise<boolean> {
  try {
    // First check if we have a cookie_id
    if (!hasCookieId()) {
      return false;
    }
    
    const consentData = await getCookieConsent();
    
    // If status is "empty", no consent record found - should ask for cookies
    if (consentData?.status === "empty") {
      return false;
    }
    
    // If status is "success" and has consent data, user has given consent
    return consentData?.status === "success" && !!consentData?.data?.consent_json;
  } catch (error) {
    console.error("Error checking existing consent:", error);
    return false;
  }
}

/**
 * Get existing consent preferences
 */
export async function getExistingConsent(): Promise<CookieConsentData | null> {
  try {
    const consentData = await getCookieConsent();
    
    // If status is "empty", no consent record found
    if (consentData?.status === "empty") {
      return null;
    }
    
    // If status is "success" and has consent data, return it
    if (consentData?.status === "success" && consentData?.data?.consent_json) {
      return consentData.data.consent_json;
    }
    
    return null;
  } catch (error) {
    console.error("Error getting existing consent:", error);
    return null;
  }
}

/**
 * Create consent data based on user choices
 */
export function createConsentData(
  necessary: boolean = true,
  analytics: boolean = false,
  marketing: boolean = false
): CookieConsentData {
  return {
    necessary: necessary ? 1 : 0,
    analytics: analytics ? 1 : 0,
    marketing: marketing ? 1 : 0,
  };
}
