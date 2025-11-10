/**
 * Login Service
 * Calls /api/auth/login (dedicated route - no gofor parameter exposed)
 * Network tab will show: GET /api/auth/login?email=...&password=...
 * The 'gofor' parameter is handled server-side only
 */
export const login = async (payload: any) => {
  try {
    // Build query parameters - NO gofor parameter (handled server-side)
    const params = new URLSearchParams();
    
    if (payload.nouptoken) {
      params.append('nouptoken', payload.nouptoken);
    }
    
    if (payload.email && payload.password) {
      params.append('email', payload.email);
      params.append('password', payload.password);
    }
    
    if (payload.google_token) {
      params.append('google_token', payload.google_token);
    }

    // ✅ Clean URL - no 'gofor' visible in browser
    const response = await fetch(`/api/auth/login?${params.toString()}`);

    if (!response.ok) { 
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Login Error:", error); 
    throw new Error("Failed to login");
  }
};
