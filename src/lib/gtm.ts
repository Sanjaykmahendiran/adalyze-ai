// lib/gtm.ts

// TypeScript interface for window with dataLayer
interface WindowWithDataLayer extends Window {
  dataLayer: Record<string, any>[];
  gtag: (...args: any[]) => void;
}

declare const window: WindowWithDataLayer;

// Get GTM ID from environment variable
export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || "";

// Get GA4 Measurement ID from environment variable
export const GA4_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || "G-NP47DV1XRN";

/**
 * Track a page view (works with or without cookies)
 * @param url - page URL
 */
export const pageview = (url: string) => {
  if (typeof window !== "undefined") {
    // GTM page view (works without cookies)
    if (GTM_ID) {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "page_view",
        page_path: url,
      });
    }
    
    // GA4 page view (works without cookies when configured with storage: 'none')
    if (window.gtag) {
      window.gtag('config', GA4_MEASUREMENT_ID, {
        page_path: url,
        // Cookie-less configuration (if not already set in initial config)
        anonymize_ip: true,
        storage: 'none',
        client_storage: 'none',
      });
    }
  }
};

/**
 * Track a custom event (works with or without cookies)
 * @param eventName - Event name (e.g., 'sign_up', 'purchase')
 * @param params - Event parameters
 */
export const event = (eventName: string, params: Record<string, any> = {}) => {
  if (typeof window !== "undefined") {
    // GTM event (works without cookies)
    if (GTM_ID) {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: eventName,
        ...params,
      });
    }
    
    // GA4 event (works without cookies when initial config has storage: 'none')
    if (window.gtag) {
      window.gtag('event', eventName, params);
    }
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
 * Track analysis requested event
 * @param analysisType - Type of analysis requested
 * @param adId - Optional ad identifier
 */
export const trackAnalysisRequested = (analysisType: string, adId?: string) => {
  event("analysis_requested", {
    analysis_type: analysisType,
    ...(adId && { ad_id: adId }),
  });
};

/**
 * Track payment success event
 * @param value - Payment value
 * @param currency - Currency code
 * @param transactionId - Transaction ID
 * @param plan - Plan name
 */
export const trackPaymentSuccess = (
  value: number,
  currency: string,
  transactionId: string,
  plan: string
) => {
  event("payment_success", {
    value,
    currency,
    transaction_id: transactionId,
    plan,
  });
};

/**
 * Check if GTM is initialized
 */
export const isGTMInitialized = (): boolean => {
  if (typeof window === "undefined") return false;
  return !!(window.dataLayer && Array.isArray(window.dataLayer) && GTM_ID);
};
