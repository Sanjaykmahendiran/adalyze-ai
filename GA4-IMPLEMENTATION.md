# Google Analytics 4 (GA4) Implementation Guide

## Overview
This document outlines the complete GA4 implementation for Adalyze AI, including measurement ID configuration, enhanced measurement setup, and key event tracking.

## Configuration

### 1. Environment Variables
Add the following environment variables to your `.env.local` file:

```env
NEXT_PUBLIC_GA4_MEASUREMENT_ID=G-NP47DV1XRN
NEXT_PUBLIC_GTM_ID=your_gtm_id_here
```

### 2. GA4 Measurement ID
- **Current ID**: `G-NP47DV1XRN`
- **Configuration**: Set via environment variable `NEXT_PUBLIC_GA4_MEASUREMENT_ID`
- **Fallback**: Defaults to `G-NP47DV1XRN` if environment variable is not set

## Enhanced Measurement Features

The following enhanced measurement features are enabled:

- ✅ **Scrolls**: Tracks scroll depth
- ✅ **Outbound Clicks**: Tracks clicks to external sites
- ✅ **Site Search**: Tracks search queries
- ✅ **Video Engagement**: Tracks video interactions
- ✅ **File Downloads**: Tracks file download events
- ✅ **Page Changes**: Tracks SPA navigation
- ✅ **Form Interactions**: Tracks form submissions

## Key Events Implementation

### 1. Page View (`page_view`)
**Automatic**: Enabled by default with `send_page_view: true`
**Manual**: Use `trackPageView(pagePath, pageTitle)` for custom tracking

### 2. Sign Up (`sign_up`)
```typescript
import { trackSignUp } from '@/lib/ga4';

// Track user registration
trackSignUp('email', userId);
trackSignUp('google', userId);
```

### 3. Ad Upload (`ad_upload`)
```typescript
import { trackAdUpload } from '@/lib/ga4';

// Track ad uploads
trackAdUpload(adId, 'image', fileSize);
trackAdUpload(adId, 'video', fileSize);
```

### 4. Analysis Requested (`analysis_requested`)
```typescript
import { trackAnalysisRequested } from '@/lib/ga4';

// Track analysis requests
trackAnalysisRequested('performance_analysis', adId, userId);
trackAnalysisRequested('competitor_analysis', adId, userId);
```

### 5. Payment Success (`payment_success`)
```typescript
import { trackPaymentSuccess } from '@/lib/ga4';

// Track successful payments
trackPaymentSuccess(99.99, 'USD', transactionId, 'Pro Plan', userId);
```

## Implementation Files

### Core Files
- `src/lib/ga4.ts` - Main GA4 service utilities
- `src/lib/gtm.ts` - Updated GTM integration with GA4 support
- `src/app/layout.tsx` - GA4 script configuration

### Integration Examples
- `src/lib/ga4-integration-examples.ts` - Implementation examples
- `GA4-IMPLEMENTATION.md` - This documentation

## Integration Points

### 1. Upload Page (`src/app/upload/page.tsx`)
**Current**: Uses `trackEvent("Single_File_Uploaded", ...)`
**Recommended**: Replace with `trackAdUpload(adId, adType, fileSize)`

### 2. Pricing Page (`src/app/pricing/page.tsx`)
**Current**: Uses `trackPurchase()` and `trackEvent("Payment_Successful_completed_...")`
**Recommended**: Replace with `trackPaymentSuccess()` and `trackConversion.subscriptionStart()`

### 3. Registration Flow
**Current**: Uses `trackEvent("Register_completed", ...)`
**Recommended**: Add `trackSignUp(method, userId)` and `setUserId(userId)`

## User Engagement Tracking

### Scroll Depth Tracking
```typescript
import { trackUserEngagement } from '@/lib/ga4';

// Track scroll depth (25%, 50%, 75%, 100%)
trackUserEngagement.scrollDepth(75);
```

### Time on Page
```typescript
// Track time spent on page
trackUserEngagement.timeOnPage(120); // 2 minutes
```

### File Downloads
```typescript
// Track file downloads
trackUserEngagement.fileDownload('report.pdf', 'pdf');
```

### Outbound Clicks
```typescript
// Track external link clicks
trackUserEngagement.outboundClick('https://example.com', 'Learn More');
```

## Conversion Tracking

### Trial Start
```typescript
import { trackConversion } from '@/lib/ga4';

trackConversion.trialStart('free_trial', userId);
```

### Subscription Start
```typescript
trackConversion.subscriptionStart('Pro Plan', 99.99, 'USD', userId);
```

## User Properties

### Set User ID
```typescript
import { setUserId } from '@/lib/ga4';

// Set user ID for all future events
setUserId(userId);
```

### Set User Properties
```typescript
import { setUserProperties } from '@/lib/ga4';

// Set custom user properties
setUserProperties({
  user_type: 'premium',
  signup_method: 'google',
  plan: 'pro'
});
```

## Data Streams Configuration

### Web Data Stream
1. **Stream Name**: Adalyze AI Web
2. **Website URL**: https://adalyze.app
3. **Enhanced Measurement**: Enabled
4. **Events**: All key events configured

### Mobile App Data Stream (if applicable)
1. **Stream Name**: Adalyze AI Mobile
2. **Platform**: iOS/Android
3. **Enhanced Measurement**: Enabled

## Event Parameters

### Standard Parameters
- `user_id`: User identifier
- `session_id`: Session identifier
- `page_path`: Current page path
- `page_title`: Current page title

### Custom Parameters
- `ad_id`: Ad identifier
- `ad_type`: Type of ad (image, video, carousel)
- `analysis_type`: Type of analysis requested
- `plan`: Subscription plan name
- `method`: Signup method
- `value`: Monetary value
- `currency`: Currency code
- `transaction_id`: Payment transaction ID

## Testing & Validation

### 1. GA4 Debug View
- Enable debug mode in GA4
- Use Google Tag Assistant
- Verify events in real-time reports

### 2. Browser Console Testing
```javascript
// Test GA4 initialization
console.log('GA4 Initialized:', window.gtag !== undefined);

// Test event tracking
gtag('event', 'test_event', { test_parameter: 'test_value' });
```

### 3. Network Tab Verification
- Check for GA4 requests to `google-analytics.com`
- Verify measurement ID in requests
- Confirm event parameters are sent

## Best Practices

### 1. Event Naming
- Use snake_case for event names
- Be descriptive and consistent
- Follow GA4 recommended event names

### 2. Parameter Naming
- Use snake_case for parameter names
- Keep parameter names consistent
- Use meaningful parameter values

### 3. User Privacy
- Respect user consent
- Implement cookie consent
- Follow GDPR/CCPA guidelines

### 4. Performance
- Load GA4 asynchronously
- Use proper script loading strategy
- Minimize impact on page load

## Troubleshooting

### Common Issues

1. **Events not appearing in GA4**
   - Check measurement ID
   - Verify script loading
   - Check browser console for errors

2. **Enhanced measurement not working**
   - Verify configuration in GA4
   - Check for conflicting scripts
   - Ensure proper script placement

3. **Custom events not tracking**
   - Verify event names
   - Check parameter format
   - Test with debug mode

### Debug Commands
```javascript
// Check GA4 status
console.log('GA4 Status:', window.gtag ? 'Loaded' : 'Not loaded');

// Check dataLayer
console.log('DataLayer:', window.dataLayer);

// Test event
gtag('event', 'debug_test', { debug: true });
```

## Migration from Universal Analytics

### Key Changes
1. **Event Structure**: GA4 uses different event structure
2. **Parameter Names**: Some parameters have changed
3. **Measurement ID**: Different from tracking ID
4. **Enhanced Measurement**: New features available

### Migration Checklist
- [ ] Update measurement ID
- [ ] Update event tracking code
- [ ] Test all key events
- [ ] Verify enhanced measurement
- [ ] Update documentation
- [ ] Train team on new implementation

## Support & Resources

### Documentation
- [GA4 Documentation](https://developers.google.com/analytics/devguides/collection/ga4)
- [Enhanced Measurement](https://support.google.com/analytics/answer/9216061)
- [Event Parameters](https://developers.google.com/analytics/devguides/collection/ga4/events)

### Tools
- [Google Tag Assistant](https://tagassistant.google.com/)
- [GA4 Debug View](https://support.google.com/analytics/answer/7201382)
- [Google Analytics Debugger](https://chrome.google.com/webstore/detail/google-analytics-debugger/jnkmfdileelhofjcijamephohjechhna)

## Next Steps

1. **Review Implementation**: Check all integration points
2. **Test Events**: Verify all key events are working
3. **Monitor Data**: Check GA4 reports for data flow
4. **Optimize**: Fine-tune based on data insights
5. **Document**: Update team documentation
6. **Train**: Educate team on new tracking system
