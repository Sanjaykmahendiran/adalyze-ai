/**
 * Token utilities for ad_id sharing
 * Implements the same token format as the results page: DDMMYYYY + ad_id + _ + user_id + HHMMSS
 * For backward compatibility: DDMMYYYY + ad_id + HHMMSS (old format without user_id)
 */

/**
 * Encode a number to base64url (URL-safe base64)
 */
function encodeNumber(num: string | number): string {
  const numStr = String(num);
  // Convert to base64url (URL-safe base64)
  let base64: string;
  
  if (typeof Buffer !== 'undefined') {
    // Node.js environment (server-side in Next.js)
    base64 = Buffer.from(numStr).toString('base64');
  } else if (typeof btoa !== 'undefined') {
    // Browser environment
    base64 = btoa(numStr);
  } else {
    // Fallback: should not happen in modern environments
    throw new Error('Neither Buffer nor btoa is available');
  }
  
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Decode a base64url string back to a number
 */
function decodeNumber(encoded: string): string {
  try {
    // Convert from base64url to regular base64
    let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    // Add padding if needed
    while (base64.length % 4) {
      base64 += '=';
    }
    
    if (typeof Buffer !== 'undefined') {
      // Node.js environment (server-side in Next.js)
      return Buffer.from(base64, 'base64').toString();
    } else if (typeof atob !== 'undefined') {
      // Browser environment
      return atob(base64);
    } else {
      // Fallback: should not happen in modern environments
      throw new Error('Neither Buffer nor atob is available');
    }
  } catch (error) {
    // If decoding fails, return the original string (for backward compatibility)
    return encoded;
  }
}

/**
 * Generate a token for ad_id sharing
 * Format: encoded(DDMMYYYY) + encoded(ad_id) + _ + encoded(user_id) + encoded(HHMMSS) (new format with user_id)
 * Format: encoded(DDMMYYYY) + encoded(ad_id) + encoded(HHMMSS) (old format without user_id if user_id not provided)
 */
export function generateAdToken(adId: string, userId?: string | number): string {
  const currentDate = new Date();

  // Format date components (DD MM YYYY)
  const day = String(currentDate.getDate()).padStart(2, '0');
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  const year = currentDate.getFullYear();
  const dateStr = `${day}${month}${year}`;

  // Format time components (HH MM SS)
  const hours = String(currentDate.getHours()).padStart(2, '0');
  const minutes = String(currentDate.getMinutes()).padStart(2, '0');
  const seconds = String(currentDate.getSeconds()).padStart(2, '0');
  const timeStr = `${hours}${minutes}${seconds}`;

  // Encode date, adId, and time
  const encodedDate = encodeNumber(dateStr);
  const encodedAdId = encodeNumber(adId);
  const encodedTime = encodeNumber(timeStr);

  // Generate token: encoded(DDMMYYYY) + encoded(ad_id) + _ + encoded(user_id) + encoded(HHMMSS) (if user_id provided)
  // Or: encoded(DDMMYYYY) + encoded(ad_id) + encoded(HHMMSS) (old format if user_id not provided for backward compatibility)
  if (userId !== undefined && userId !== null && String(userId).trim() !== '') {
    const encodedUserId = encodeNumber(userId);
    return `${encodedDate}${encodedAdId}_${encodedUserId}${encodedTime}`;
  }

  // Old format for backward compatibility
  return `${encodedDate}${encodedAdId}${encodedTime}`;
}

/**
 * Parse ad_id from token
 * Extracts ad_id from token format: encoded(DDMMYYYY) + encoded(ad_id) + _ + encoded(user_id) + encoded(HHMMSS) (new format)
 * Or: encoded(DDMMYYYY) + encoded(ad_id) + encoded(HHMMSS) (old format)
 * Decodes the encoded ad_id back to number
 */
export function parseAdIdFromToken(token: string): string {
  if (!token || token.length < 10) {
    // Try old format first for backward compatibility
    return parseAdIdFromTokenOldFormat(token);
  }

  // New format: encoded(DDMMYYYY) + encoded(ad_id) + [_ + encoded(user_id)] + encoded(HHMMSS)
  // We need to decode from both ends to find date and time, then extract the middle part
  
  // Try to decode from the start to find the date (DDMMYYYY format)
  let dateEnd = 0;
  let foundDate = false;
  
  // Try different lengths for encoded date (encoded 8-char date will be ~11-12 chars)
  for (let i = 4; i <= Math.min(16, token.length / 2); i++) {
    try {
      const encodedDate = token.substring(0, i);
      const decodedDate = decodeNumber(encodedDate);
      // Check if decoded date matches DDMMYYYY format (8 digits)
      if (/^\d{8}$/.test(decodedDate)) {
        dateEnd = i;
        foundDate = true;
        break;
      }
    } catch (e) {
      // Continue trying
    }
  }

  // Try to decode from the end to find the time (HHMMSS format)
  let timeStart = token.length;
  let foundTime = false;

  // Try different lengths for encoded time (encoded 6-char time will be ~8-9 chars)
  for (let i = 4; i <= Math.min(16, token.length / 2); i++) {
    try {
      const encodedTime = token.substring(token.length - i);
      const decodedTime = decodeNumber(encodedTime);
      // Check if decoded time matches HHMMSS format (6 digits)
      if (/^\d{6}$/.test(decodedTime)) {
        timeStart = token.length - i;
        foundTime = true;
        break;
      }
    } catch (e) {
      // Continue trying
    }
  }

  // If we found both date and time, extract the middle part
  if (foundDate && foundTime && dateEnd < timeStart) {
    const middlePart = token.substring(dateEnd, timeStart);
    
    // Check if middle part contains underscore (new format with user_id)
    if (middlePart.includes('_')) {
      // Extract encoded ad_id (everything before the underscore)
      const encodedAdId = middlePart.split('_')[0];
      // Decode back to number
      const decoded = decodeNumber(encodedAdId);
      // If decodeNumber returned the original string, check if it's a valid number
      if (decoded === encodedAdId && /^\d+$/.test(encodedAdId)) {
        // It might be an old format unencoded token, return as-is
        return encodedAdId;
      }
      return decoded;
    }

    // Old format: just encoded ad_id in the middle
    const decoded = decodeNumber(middlePart);
    // If decodeNumber returned the original string, it might be an old format token
    if (decoded === middlePart && /^\d+$/.test(middlePart)) {
      // It's an old format unencoded token, return as-is
      return middlePart;
    }
    return decoded;
  }

  // If new format parsing failed, try old format for backward compatibility
  return parseAdIdFromTokenOldFormat(token);
}

/**
 * Parse ad_id from old token format (backward compatibility)
 * Format: DDMMYYYY + ad_id + _ + user_id + HHMMSS (new format)
 * Or: DDMMYYYY + ad_id + HHMMSS (old format)
 */
function parseAdIdFromTokenOldFormat(token: string): string {
  if (!token || token.length <= 14) {
    return '';
  }

  // Check if token has user_id (contains underscore separator)
  const middlePart = token.substring(8, token.length - 6);

  // If middle part contains underscore, it's new format with user_id
  if (middlePart.includes('_')) {
    // Extract ad_id (everything before the underscore)
    const adId = middlePart.split('_')[0];
    // Try to decode, but if it's already a number string, return as-is
    const decoded = decodeNumber(adId);
    if (decoded === adId && /^\d+$/.test(adId)) {
      return adId;
    }
    return decoded;
  }

  // Old format: just ad_id in the middle
  // Try to decode it, but if it fails (old format token), return as-is for backward compatibility
  const decoded = decodeNumber(middlePart);
  // If decodeNumber returned the original string, it might be an old format token
  // Check if it's a valid number (old tokens might have been unencoded)
  if (decoded === middlePart && /^\d+$/.test(middlePart)) {
    // It's an old format unencoded token, return as-is
    return middlePart;
  }
  return decoded;
}

/**
 * Parse user_id from token
 * Extracts user_id from token format: encoded(DDMMYYYY) + encoded(ad_id) + _ + encoded(user_id) + encoded(HHMMSS)
 * Decodes the encoded user_id back to number
 * Returns empty string if user_id not present (old format token)
 */
export function parseUserIdFromToken(token: string): string {
  if (!token || token.length < 10) {
    // Try old format first for backward compatibility
    return parseUserIdFromTokenOldFormat(token);
  }

  // New format: encoded(DDMMYYYY) + encoded(ad_id) + _ + encoded(user_id) + encoded(HHMMSS)
  // We need to decode from both ends to find date and time, then extract the middle part
  
  // Try to decode from the start to find the date (DDMMYYYY format)
  let dateEnd = 0;
  let foundDate = false;
  
  // Try different lengths for encoded date
  for (let i = 4; i <= Math.min(16, token.length / 2); i++) {
    try {
      const encodedDate = token.substring(0, i);
      const decodedDate = decodeNumber(encodedDate);
      // Check if decoded date matches DDMMYYYY format (8 digits)
      if (/^\d{8}$/.test(decodedDate)) {
        dateEnd = i;
        foundDate = true;
        break;
      }
    } catch (e) {
      // Continue trying
    }
  }

  // Try to decode from the end to find the time (HHMMSS format)
  let timeStart = token.length;
  let foundTime = false;

  // Try different lengths for encoded time
  for (let i = 4; i <= Math.min(16, token.length / 2); i++) {
    try {
      const encodedTime = token.substring(token.length - i);
      const decodedTime = decodeNumber(encodedTime);
      // Check if decoded time matches HHMMSS format (6 digits)
      if (/^\d{6}$/.test(decodedTime)) {
        timeStart = token.length - i;
        foundTime = true;
        break;
      }
    } catch (e) {
      // Continue trying
    }
  }

  // If we found both date and time, extract the middle part
  if (foundDate && foundTime && dateEnd < timeStart) {
    const middlePart = token.substring(dateEnd, timeStart);
    
    // Check if middle part contains underscore (new format with user_id)
    if (middlePart.includes('_')) {
      const parts = middlePart.split('_');
      if (parts.length > 1) {
        const encodedUserId = parts[1];
        // Decode back to number
        const decoded = decodeNumber(encodedUserId);
        if (decoded === encodedUserId && /^\d+$/.test(encodedUserId)) {
          return encodedUserId;
        }
        return decoded;
      }
      return '';
    }
  }

  // If new format parsing failed, try old format for backward compatibility
  return parseUserIdFromTokenOldFormat(token);
}

/**
 * Parse user_id from old token format (backward compatibility)
 */
function parseUserIdFromTokenOldFormat(token: string): string {
  if (!token || token.length <= 14) {
    return '';
  }

  const middlePart = token.substring(8, token.length - 6);

  // If middle part contains underscore, extract user_id (everything after the underscore)
  if (middlePart.includes('_')) {
    const parts = middlePart.split('_');
    if (parts.length > 1) {
      const userId = parts[1];
      // Try to decode, but if it's already a number string, return as-is
      const decoded = decodeNumber(userId);
      if (decoded === userId && /^\d+$/.test(userId)) {
        return userId;
      }
      return decoded;
    }
    return '';
  }

  // Old format: no user_id
  return '';
}

/**
 * Generate share URL with token
 */
export function generateShareUrl(adId: string, userId?: string | number, baseUrl?: string): string {
  const token = generateAdToken(adId, userId);
  const domain = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  return `${domain}/results?token=${token}`;
}

/**
 * Generate share text for the token
 */
export function generateShareText(adId: string, userId?: string | number): string {
  const currentDate = new Date();

  // Format date components (DD MM YYYY)
  const day = String(currentDate.getDate()).padStart(2, '0');
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  const year = currentDate.getFullYear();

  // Format time components (HH MM SS)
  const hours = String(currentDate.getHours()).padStart(2, '0');
  const minutes = String(currentDate.getMinutes()).padStart(2, '0');
  const seconds = String(currentDate.getSeconds()).padStart(2, '0');

  const shareUrl = generateShareUrl(adId, userId);

  return `Check out the ad analysis results shared on ${day}-${month}-${year} at ${hours}:${minutes}:${seconds}: ${shareUrl}`;
}

/**
 * Check if a URL parameter is a token (vs direct ad_id)
 */
export function isTokenParam(param: string | null): boolean {
  return param !== null && param.length > 14;
}

/**
 * Extract the date (local) from a token in DDMMYYYY format
 * Handles both new format (encoded date) and old format (plain date)
 */
export function getTokenDate(token: string): Date | null {
  if (!token || token.length < 8) return null;
  
  // Try new format first: decode from the start to find the date
  for (let i = 4; i <= Math.min(16, token.length / 2); i++) {
    try {
      const encodedDate = token.substring(0, i);
      const decodedDate = decodeNumber(encodedDate);
      // Check if decoded date matches DDMMYYYY format (8 digits)
      if (/^\d{8}$/.test(decodedDate)) {
        const day = parseInt(decodedDate.slice(0, 2), 10);
        const month = parseInt(decodedDate.slice(2, 4), 10) - 1; // 0-indexed
        const year = parseInt(decodedDate.slice(4, 8), 10);
        if (Number.isNaN(day) || Number.isNaN(month) || Number.isNaN(year)) continue;
        const date = new Date(year, month, day);
        if (Number.isNaN(date.getTime())) continue;
        return date;
      }
    } catch (e) {
      // Continue trying
    }
  }
  
  // Try old format: plain DDMMYYYY at the start
  if (token.length >= 8 && /^\d{8}/.test(token)) {
    const day = parseInt(token.slice(0, 2), 10);
    const month = parseInt(token.slice(2, 4), 10) - 1; // 0-indexed
    const year = parseInt(token.slice(4, 8), 10);
    if (Number.isNaN(day) || Number.isNaN(month) || Number.isNaN(year)) return null;
    const date = new Date(year, month, day);
    if (Number.isNaN(date.getTime())) return null;
    return date;
  }
  
  return null;
}

/**
 * Determine if a token is older than maxAgeDays (default 7 days)
 */
export function isTokenExpired(token: string, maxAgeDays: number = 7): boolean {
  const tokenDate = getTokenDate(token);
  if (!tokenDate) return false;
  const now = new Date();
  const diffMs = now.getTime() - tokenDate.getTime();
  const maxMs = maxAgeDays * 24 * 60 * 60 * 1000;
  return diffMs > maxMs;
}

/**
 * Get ad_id from URL parameters (handles both token types and direct ad_id)
 */
export function getAdIdFromUrlParams(searchParams: URLSearchParams): string {
  // Check for share token first (existing functionality)
  const shareToken = searchParams.get('token');
  // Check for internal navigation token
  const adToken = searchParams.get('ad-token');
  // Check for top10-token
  const top10Token = searchParams.get('top10-token');
  // Check for trending-token
  const trendingToken = searchParams.get('trending-token');
  const directAdId = searchParams.get('ad_id');

  if (shareToken && isTokenParam(shareToken)) {
    return parseAdIdFromToken(shareToken);
  }

  if (adToken && isTokenParam(adToken)) {
    return parseAdIdFromToken(adToken);
  }

  if (top10Token && isTokenParam(top10Token)) {
    return parseAdIdFromToken(top10Token);
  }

  if (trendingToken && isTokenParam(trendingToken)) {
    return parseAdIdFromToken(trendingToken);
  }

  return directAdId || '';
}

/**
 * CLIENT TOKEN HELPERS
 * Use the same DDMMYYYY + id + HHMMSS format for client tokens
 */

export function generateClientToken(clientId: string): string {
  const currentDate = new Date();
  const day = String(currentDate.getDate()).padStart(2, '0');
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  const year = currentDate.getFullYear();
  const dateStr = `${day}${month}${year}`;
  
  const hours = String(currentDate.getHours()).padStart(2, '0');
  const minutes = String(currentDate.getMinutes()).padStart(2, '0');
  const seconds = String(currentDate.getSeconds()).padStart(2, '0');
  const timeStr = `${hours}${minutes}${seconds}`;
  
  // Encode date, clientId, and time
  const encodedDate = encodeNumber(dateStr);
  const encodedClientId = encodeNumber(clientId);
  const encodedTime = encodeNumber(timeStr);
  return `${encodedDate}${encodedClientId}${encodedTime}`;
}

export function parseClientIdFromToken(token: string): string {
  if (!token || token.length < 10) {
    // Try old format first for backward compatibility
    return parseClientIdFromTokenOldFormat(token);
  }

  // New format: encoded(DDMMYYYY) + encoded(client_id) + encoded(HHMMSS)
  // We need to decode from both ends to find date and time, then extract the middle part
  
  // Try to decode from the start to find the date (DDMMYYYY format)
  let dateEnd = 0;
  let foundDate = false;
  
  // Try different lengths for encoded date
  for (let i = 4; i <= Math.min(16, token.length / 2); i++) {
    try {
      const encodedDate = token.substring(0, i);
      const decodedDate = decodeNumber(encodedDate);
      // Check if decoded date matches DDMMYYYY format (8 digits)
      if (/^\d{8}$/.test(decodedDate)) {
        dateEnd = i;
        foundDate = true;
        break;
      }
    } catch (e) {
      // Continue trying
    }
  }

  // Try to decode from the end to find the time (HHMMSS format)
  let timeStart = token.length;
  let foundTime = false;

  // Try different lengths for encoded time
  for (let i = 4; i <= Math.min(16, token.length / 2); i++) {
    try {
      const encodedTime = token.substring(token.length - i);
      const decodedTime = decodeNumber(encodedTime);
      // Check if decoded time matches HHMMSS format (6 digits)
      if (/^\d{6}$/.test(decodedTime)) {
        timeStart = token.length - i;
        foundTime = true;
        break;
      }
    } catch (e) {
      // Continue trying
    }
  }

  // If we found both date and time, extract the middle part
  if (foundDate && foundTime && dateEnd < timeStart) {
    const encodedClientId = token.substring(dateEnd, timeStart);
    // Decode back to number
    const decoded = decodeNumber(encodedClientId);
    // If decodeNumber returned the original string, it might be an old format token
    if (decoded === encodedClientId && /^\d+$/.test(encodedClientId)) {
      // It's an old format unencoded token, return as-is
      return encodedClientId;
    }
    return decoded;
  }

  // If new format parsing failed, try old format for backward compatibility
  return parseClientIdFromTokenOldFormat(token);
}

/**
 * Parse client_id from old token format (backward compatibility)
 */
function parseClientIdFromTokenOldFormat(token: string): string {
  if (!token || token.length <= 14) {
    return '';
  }
  const clientId = token.substring(8, token.length - 6);
  // Try to decode, but if it's already a number string, return as-is
  const decoded = decodeNumber(clientId);
  if (decoded === clientId && /^\d+$/.test(clientId)) {
    // It's an old format unencoded token, return as-is
    return clientId;
  }
  return decoded;
}

export function getClientIdFromUrlParams(searchParams: URLSearchParams): string {
  const clientToken = searchParams.get('client-token') || searchParams.get('client-token');
  const directClientId = searchParams.get('client_id');

  if (clientToken && isTokenParam(clientToken)) {
    return parseClientIdFromToken(clientToken);
  }

  return directClientId || '';
}