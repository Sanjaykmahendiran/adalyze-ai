// lib/gtm.ts

// TypeScript interface for window with dataLayer
interface WindowWithDataLayer extends Window {
  dataLayer: Record<string, any>[];
}

declare const window: WindowWithDataLayer;

// Get GTM ID from environment variable
export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || "";

/**
 * Track a page view
 * @param url - page URL
 */
export const pageview = (url: string) => {
  if (typeof window !== "undefined" && GTM_ID) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "page_view",
      page_path: url,
    });
  }
};

/**
 * Track a custom event
 * @param eventName - Event name (e.g., 'sign_up', 'purchase')
 * @param params - Event parameters
 */
export const event = (eventName: string, params: Record<string, any> = {}) => {
  if (typeof window !== "undefined" && GTM_ID) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: eventName,
      ...params,
    });
  }
};

/**
 * Track signup event
 * @param method - Signup method (Email, Google, Referral)
 * @param userId - Optional user ID
 */
export const trackSignup = (method: string, userId?: string) => {
  event("sign_up", {
    method: method || "Email",
    ...(userId && { user_id: userId }),
  });
};

/**
 * Track free trial start
 * @param method - Trial method
 * @param userId - Optional user ID
 */
export const trackFreeTrial = (method: string, userId?: string) => {
  event("trial_start", {
    method: method || "Free Trial",
    ...(userId && { user_id: userId }),
  });
};

/**
 * Track purchase event
 * @param value - purchase value
 * @param currency - currency code
 * @param transactionId - optional transaction id
 * @param items - optional items array [{ name, price, quantity }]
 */
export const trackPurchase = (
  value: number,
  currency: string,
  transactionId?: string,
  items?: Array<{ name: string; price: number; quantity: number }>
) => {
  event("purchase", {
    value,
    currency,
    ...(transactionId && { transaction_id: transactionId }),
    ...(items && { items }),
  });
};

/**
 * Track ad upload event
 * @param adId - unique ad identifier
 */
export const trackAdUpload = (adId: string) => {
  event("ad_upload", {
    ad_id: adId,
  });
};

/**
 * Check if GTM is initialized
 */
export const isGTMInitialized = (): boolean => {
  if (typeof window === "undefined") return false;
  return !!(window.dataLayer && Array.isArray(window.dataLayer) && GTM_ID);
};
