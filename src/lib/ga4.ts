// lib/ga4.ts
// Google Analytics 4 service utilities

// TypeScript interface for window with gtag
interface WindowWithGtag extends Window {
    gtag: (...args: any[]) => void;
    dataLayer: Record<string, any>[];
}

declare const window: WindowWithGtag;

// Get GA4 Measurement ID from environment variable
export const GA4_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || "G-NP47DV1XRN";

/**
 * Check if GA4 is initialized
 */
export const isGA4Initialized = (): boolean => {
    if (typeof window === "undefined") return false;
    return !!(window.gtag && GA4_MEASUREMENT_ID);
};

/**
 * Track a page view
 * @param pagePath - Page path
 * @param pageTitle - Optional page title
 */
export const trackPageView = (pagePath: string, pageTitle?: string) => {
    if (isGA4Initialized()) {
        window.gtag('config', GA4_MEASUREMENT_ID, {
            page_path: pagePath,
            page_title: pageTitle,
        });
    }
};

/**
 * Track a custom event
 * @param eventName - Event name
 * @param parameters - Event parameters
 */
export const trackEvent = (eventName: string, parameters: Record<string, any> = {}) => {
    if (isGA4Initialized()) {
        window.gtag('event', eventName, parameters);
    }
};

/**
 * Track sign up event
 * @param method - Signup method (email, google, etc.)
 * @param userId - Optional user ID
 */
export const trackSignUp = (method: string, userId?: string) => {
    trackEvent('sign_up', {
        method,
        ...(userId && { user_id: userId }),
    });
};

/**
 * Track ad upload event
 * @param adId - Ad identifier
 * @param adType - Type of ad (image, video, etc.)
 * @param fileSize - Optional file size
 */
export const trackAdUpload = (adId: string, adType?: string, fileSize?: number) => {
    trackEvent('ad_upload', {
        ad_id: adId,
        ...(adType && { ad_type: adType }),
        ...(fileSize && { file_size: fileSize }),
    });
};

/**
 * Track analysis requested event
 * @param analysisType - Type of analysis
 * @param adId - Optional ad identifier
 * @param userId - Optional user ID
 */
export const trackAnalysisRequested = (
    analysisType: string,
    adId?: string,
    userId?: string
) => {
    trackEvent('analysis_requested', {
        analysis_type: analysisType,
        ...(adId && { ad_id: adId }),
        ...(userId && { user_id: userId }),
    });
};

/**
 * Track payment success event
 * @param value - Payment value
 * @param currency - Currency code
 * @param transactionId - Transaction ID
 * @param plan - Plan name
 * @param userId - Optional user ID
 */
export const trackPaymentSuccess = (
    value: number,
    currency: string,
    transactionId: string,
    plan: string,
    userId?: string
) => {
    trackEvent('payment_success', {
        value,
        currency,
        transaction_id: transactionId,
        plan,
        ...(userId && { user_id: userId }),
    });
};

/**
 * Track user engagement events
 */
export const trackUserEngagement = {
    /**
     * Track scroll depth
     * @param depth - Scroll depth percentage
     */
    scrollDepth: (depth: number) => {
        trackEvent('scroll', {
            scroll_depth: depth,
        });
    },

    /**
     * Track time on page
     * @param timeInSeconds - Time spent on page
     */
    timeOnPage: (timeInSeconds: number) => {
        trackEvent('engagement_time', {
            engagement_time_msec: timeInSeconds * 1000,
        });
    },

    /**
     * Track file download
     * @param fileName - Name of downloaded file
     * @param fileType - Type of file
     */
    fileDownload: (fileName: string, fileType?: string) => {
        trackEvent('file_download', {
            file_name: fileName,
            ...(fileType && { file_type: fileType }),
        });
    },

    /**
     * Track outbound click
     * @param url - Clicked URL
     * @param linkText - Link text
     */
    outboundClick: (url: string, linkText?: string) => {
        trackEvent('click', {
            event_category: 'outbound',
            event_label: url,
            ...(linkText && { link_text: linkText }),
        });
    },
};

/**
 * Track conversion events
 */
export const trackConversion = {
    /**
     * Track trial start
     * @param plan - Trial plan
     * @param userId - User ID
     */
    trialStart: (plan: string, userId?: string) => {
        trackEvent('trial_start', {
            plan,
            ...(userId && { user_id: userId }),
        });
    },

    /**
     * Track subscription start
     * @param plan - Subscription plan
     * @param value - Plan value
     * @param currency - Currency
     * @param userId - User ID
     */
    subscriptionStart: (plan: string, value: number, currency: string, userId?: string) => {
        trackEvent('subscription_start', {
            plan,
            value,
            currency,
            ...(userId && { user_id: userId }),
        });
    },
};

/**
 * Set user properties
 * @param properties - User properties
 */
export const setUserProperties = (properties: Record<string, any>) => {
    if (isGA4Initialized()) {
        window.gtag('config', GA4_MEASUREMENT_ID, {
            custom_map: properties,
        });
    }
};

/**
 * Set user ID
 * @param userId - User ID
 */
export const setUserId = (userId: string) => {
    if (isGA4Initialized()) {
        window.gtag('config', GA4_MEASUREMENT_ID, {
            user_id: userId,
        });
    }
};
