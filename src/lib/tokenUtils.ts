/**
 * Token utilities for ad_id sharing
 * Implements the same token format as the results page: DDMMYYYY + ad_id + HHMMSS
 */

/**
 * Generate a token for ad_id sharing
 * Format: DDMMYYYY + ad_id + HHMMSS
 */
export function generateAdToken(adId: string): string {
  const currentDate = new Date();
  
  // Format date components (DD MM YYYY)
  const day = String(currentDate.getDate()).padStart(2, '0');
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  const year = currentDate.getFullYear();
  
  // Format time components (HH MM SS)
  const hours = String(currentDate.getHours()).padStart(2, '0');
  const minutes = String(currentDate.getMinutes()).padStart(2, '0');
  const seconds = String(currentDate.getSeconds()).padStart(2, '0');
  
  // Generate token: DDMMYYYY + ad_id + HHMMSS
  return `${day}${month}${year}${adId}${hours}${minutes}${seconds}`;
}

/**
 * Parse ad_id from token
 * Extracts ad_id from token format: DDMMYYYY + ad_id + HHMMSS
 */
export function parseAdIdFromToken(token: string): string {
  if (!token || token.length <= 14) {
    return '';
  }
  
  // Extract ad_id from token (remove first 8 chars and last 6 chars)
  return token.substring(8, token.length - 6);
}

/**
 * Generate share URL with token
 */
export function generateShareUrl(adId: string, baseUrl?: string): string {
  const token = generateAdToken(adId);
  const domain = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  return `${domain}/results?token=${token}`;
}

/**
 * Generate share text for the token
 */
export function generateShareText(adId: string): string {
  const currentDate = new Date();
  
  // Format date components (DD MM YYYY)
  const day = String(currentDate.getDate()).padStart(2, '0');
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  const year = currentDate.getFullYear();
  
  // Format time components (HH MM SS)
  const hours = String(currentDate.getHours()).padStart(2, '0');
  const minutes = String(currentDate.getMinutes()).padStart(2, '0');
  const seconds = String(currentDate.getSeconds()).padStart(2, '0');
  
  const shareUrl = generateShareUrl(adId);
  
  return `Check out the ad analysis results shared on ${day}-${month}-${year} at ${hours}:${minutes}:${seconds}: ${shareUrl}`;
}

/**
 * Check if a URL parameter is a token (vs direct ad_id)
 */
export function isTokenParam(param: string | null): boolean {
  return param !== null && param.length > 14;
}

/**
 * Get ad_id from URL parameters (handles both token types and direct ad_id)
 */
export function getAdIdFromUrlParams(searchParams: URLSearchParams): string {
  // Check for share token first (existing functionality)
  const shareToken = searchParams.get('token');
  // Check for internal navigation token
  const adToken = searchParams.get('ad-token');
  const directAdId = searchParams.get('ad_id');
  
  if (shareToken && isTokenParam(shareToken)) {
    return parseAdIdFromToken(shareToken);
  }
  
  if (adToken && isTokenParam(adToken)) {
    return parseAdIdFromToken(adToken);
  }
  
  return directAdId || '';
}
