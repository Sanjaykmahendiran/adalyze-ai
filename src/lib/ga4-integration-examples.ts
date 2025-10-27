// lib/ga4-integration-examples.ts
// Examples of how to integrate GA4 events in your application

import { 
  trackPageView, 
  trackSignUp, 
  trackAdUpload, 
  trackAnalysisRequested, 
  trackPaymentSuccess,
  trackUserEngagement,
  trackConversion,
  setUserId
} from './ga4';

// Example 1: Page View Tracking
// Add this to your page components or use a router event listener
export const trackPageViewExample = (pagePath: string, pageTitle?: string) => {
  trackPageView(pagePath, pageTitle);
};

// Example 2: User Registration/Signup
// Add this to your registration success handler
export const trackUserSignupExample = (method: string, userId: string) => {
  // Set user ID for future events
  setUserId(userId);
  
  // Track signup event
  trackSignUp(method, userId);
  
  // Track trial start if applicable
  trackConversion.trialStart('free_trial', userId);
};

// Example 3: Ad Upload Tracking
// Add this to your file upload success handler
export const trackAdUploadExample = (adId: string, file: File) => {
  const adType = file.type.startsWith('video/') ? 'video' : 
                 file.type.startsWith('image/') ? 'image' : 'other';
  
  trackAdUpload(adId, adType, file.size);
};

// Example 4: Analysis Requested
// Add this when user requests analysis
export const trackAnalysisRequestExample = (analysisType: string, adId?: string, userId?: string) => {
  trackAnalysisRequested(analysisType, adId, userId);
};

// Example 5: Payment Success
// Add this to your payment success handler
export const trackPaymentSuccessExample = (
  value: number,
  currency: string,
  transactionId: string,
  plan: string,
  userId?: string
) => {
  trackPaymentSuccess(value, currency, transactionId, plan, userId);
  
  // Also track subscription start
  trackConversion.subscriptionStart(plan, value, currency, userId);
};

// Example 6: User Engagement Tracking
export const trackUserEngagementExamples = {
  // Track scroll depth (call on scroll events)
  trackScrollDepth: (depth: number) => {
    trackUserEngagement.scrollDepth(depth);
  },

  // Track time on page (call on page unload)
  trackTimeOnPage: (timeInSeconds: number) => {
    trackUserEngagement.timeOnPage(timeInSeconds);
  },

  // Track file downloads
  trackFileDownload: (fileName: string, fileType?: string) => {
    trackUserEngagement.fileDownload(fileName, fileType);
  },

  // Track outbound clicks
  trackOutboundClick: (url: string, linkText?: string) => {
    trackUserEngagement.outboundClick(url, linkText);
  }
};

// Example 7: Integration with existing upload page
export const integrateWithUploadPage = () => {
  // In your upload success handler, replace existing tracking with:
  /*
  // Instead of:
  trackEvent("Single_File_Uploaded", window.location.href, userDetails?.email?.toString())
  
  // Use:
  trackAdUpload(adId, 'image', file.size);
  */
};

// Example 8: Integration with pricing page
export const integrateWithPricingPage = () => {
  // In your payment success handler, replace existing tracking with:
  /*
  // Instead of:
  trackPurchase(value, currency, transactionId, items);
  trackEvent(`Payment_Successful_completed_${plan}`, window.location.href, userDetails?.email?.toString());
  
  // Use:
  trackPaymentSuccess(value, currency, transactionId, plan, userId);
  trackConversion.subscriptionStart(plan, value, currency, userId);
  */
};

// Example 9: Router-based page view tracking
export const setupRouterTracking = () => {
  // Add this to your main layout or app component
  /*
  useEffect(() => {
    const handleRouteChange = (url: string) => {
      trackPageView(url, document.title);
    };

    // For Next.js router events
    router.events.on('routeChangeComplete', handleRouteChange);
    
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router]);
  */
};

// Example 10: Scroll tracking implementation
export const setupScrollTracking = () => {
  // Add this to your main layout
  /*
  useEffect(() => {
    let maxScroll = 0;
    
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = Math.round((scrollTop / scrollHeight) * 100);
      
      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;
        if (maxScroll % 25 === 0) { // Track at 25%, 50%, 75%, 100%
          trackUserEngagement.scrollDepth(maxScroll);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  */
};
