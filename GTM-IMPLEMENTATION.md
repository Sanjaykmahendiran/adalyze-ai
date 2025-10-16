# Google Tag Manager (GTM) Implementation Guide

## Overview
This document describes the Google Tag Manager implementation in the Adalyze AI project.

## GTM Configuration

### GTM ID
- **Container ID**: `GTM-54MX8L24`
- **Environment**: Set in `next.config.mjs`
- **Variable**: `NEXT_PUBLIC_GTM_ID`

## Implementation Details

### 1. Core Files

#### `src/lib/gtm.ts`
Main GTM utilities library with the following functions:

- **`pageview(url: string)`** - Track page views automatically
- **`event(eventName: string, params?: object)`** - Track custom events
- **`trackSignup(method: string, userId?: string)`** - Track user signups
- **`trackPurchase(value, currency, transactionId?, items?)`** - Track purchases
- **`trackAnalyze()`** - Track ad analysis actions
- **`isGTMInitialized()`** - Check if GTM is properly loaded

#### `src/app/layout.tsx`
Root layout with GTM initialization:
- GTM script loaded with `afterInteractive` strategy
- Noscript fallback for users with JavaScript disabled

#### `src/app/providers.tsx`
Client-side provider for automatic page view tracking using Next.js router

## Events Currently Tracked

### 1. Page Views
**Event**: `pageview`  
**Trigger**: Automatically on route change  
**Data**: 
```javascript
{
  event: 'pageview',
  page: '/current-path?query=params'
}
```

### 2. User Signup
**Event**: `signup`  
**Trigger**: User registration  
**Location**: `src/app/register/_components/registration-form.tsx`  
**Data**:
```javascript
{
  event: 'signup',
  method: 'Email' | 'Google' | 'Referral'
}
```

### 3. Ad Analysis
**Event**: `analyze`  
**Trigger**: When user analyzes an ad  
**Location**: `src/app/upload/page.tsx`  
**Data**:
```javascript
{
  event: 'analyze'
}
```

### 4. Purchase/Upgrade
**Event**: `purchase`  
**Trigger**: Pro upgrade or credit purchase  
**Locations**: 
- `src/app/pro/page.tsx`
- `src/app/pricing/page.tsx`

**Data**:
```javascript
{
  event: 'purchase',
  value: 999, // Amount
  currency: 'INR' | 'USD',
  transaction_id: 'txn_123' // Optional
}
```

## Testing GTM Implementation

### Method 1: Browser Console
Check GTM implementation directly in the browser:

```javascript
// Check if GTM is loaded
window.dataLayer

// View all tracked events
window.dataLayer.filter(e => e.event)

// Check page view events
window.dataLayer.filter(e => e.event === 'pageview')
```

### Method 2: GTM Preview Mode
1. Go to your GTM dashboard: https://tagmanager.google.com/
2. Select container `GTM-54MX8L24`
3. Click "Preview" button (top right)
4. Enter your website URL
5. Navigate your site and watch events in real-time

### Method 3: Browser DevTools
1. Open DevTools Console
2. Type: `window.dataLayer`
3. Inspect the array of events

### Method 4: GTM Assistant Extension
1. Install "Google Tag Assistant" Chrome extension
2. Click the extension icon while on your site
3. View GTM tags firing in real-time

## Verification Checklist

- [✅] GTM script loads in `<body>` tag
- [✅] GTM ID is properly set in environment (`GTM-54MX8L24`)
- [✅] `window.dataLayer` exists and is an array
- [✅] Page views are tracked automatically on route changes
- [✅] Custom events fire correctly:
  - [✅] signup
  - [✅] analyze
  - [✅] purchase
- [✅] No console errors related to GTM
- [✅] Events visible in GTM Preview mode
- [✅] TypeScript types properly defined

## Common Issues & Solutions

### Issue 1: GTM ID Not Found
**Symptom**: Console shows empty GTM_ID or GTM doesn't load  
**Solution**: Verify `NEXT_PUBLIC_GTM_ID` is set in `next.config.mjs`

### Issue 2: Events Not Appearing
**Symptom**: `window.dataLayer` is empty or missing events  
**Solution**: 
- Check if GTM script loaded (view page source)
- Verify event is actually firing (add console.log)
- Check GTM Preview mode for errors

### Issue 3: TypeScript Errors
**Symptom**: Type errors when using GTM functions  
**Solution**: Import types from `@/lib/gtm`

### Issue 4: Server-Side Rendering Issues
**Symptom**: Errors about `window` not being defined  
**Solution**: All GTM functions check for `typeof window !== "undefined"`

## Best Practices

1. **Always use the provided utility functions** instead of directly pushing to dataLayer
2. **Include meaningful parameters** with events for better analytics
3. **Test in GTM Preview mode** before deploying to production
4. **Use consistent event naming** - lowercase with underscores
5. **Don't track PII** (Personally Identifiable Information) without proper consent
6. **Monitor GTM errors** in production using debug tools

## Adding New Events

To add a new custom event:

1. **Define the event in your component**:
```typescript
import { event } from '@/lib/gtm';

// Track the event
event('custom_event_name', {
  category: 'value',
  action: 'value',
  label: 'value'
});
```

2. **Or create a helper function in `gtm.ts`**:
```typescript
export const trackCustomEvent = (param: string) => {
  event('custom_event_name', { param });
};
```

3. **Configure in GTM Dashboard**:
   - Go to GTM dashboard
   - Create a new trigger for your event
   - Create a new tag (e.g., GA4 Event)
   - Configure and publish

## Performance Considerations

- GTM script uses `strategy="afterInteractive"` to avoid blocking page load
- Minimal impact on Core Web Vitals
- DataLayer operations are non-blocking
- No synchronous tracking calls

## Security

- GTM ID is public (safe to expose)
- No sensitive data should be sent to GTM
- All tracking respects user privacy settings
- Noscript fallback provided for accessibility

## Support & Resources

- GTM Dashboard: https://tagmanager.google.com/
- GTM Documentation: https://developers.google.com/tag-manager
- Container ID: `GTM-54MX8L24`

## Maintenance

### Regular Checks
- [ ] Monthly: Review GTM tags in dashboard
- [ ] Monthly: Check for console errors
- [ ] Quarterly: Verify all events are firing correctly
- [ ] Yearly: Audit tracked events and clean up unused ones

### Updates
When updating GTM implementation:
1. Test in development first
2. Use GTM Preview mode
3. Verify in staging environment
4. Deploy to production
5. Monitor for 24-48 hours

---

**Last Updated**: October 2025  
**GTM Container**: GTM-54MX8L24  
**Status**: ✅ Active and Working

