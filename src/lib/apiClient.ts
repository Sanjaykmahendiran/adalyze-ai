import Cookies from "js-cookie";
import { API_CONFIG } from "@/configs/api.config";

// Queries that should not have token attached
const EXCLUDED_QUERIES = ["login", "register",  "eregister", "forgot-password"];

/**
 * Get the 'gofor' parameter from params
 */
function getGoforParam(params: Record<string, string | number> | string): string | null {
  if (typeof params === "string") {
    const urlParams = new URLSearchParams(params.startsWith("?") ? params.slice(1) : params);
    return urlParams.get("gofor");
  }
  return params.gofor ? String(params.gofor) : null;
}

/**
 * Get authorization headers with token
 */
function getAuthHeaders(
  customHeaders?: HeadersInit,
  hasBody?: boolean,
  isFormData?: boolean,
  gofor?: string | null
): Headers {
  const headers = new Headers(customHeaders || {});
  
  // Only add token if gofor is not in excluded queries
  if (!EXCLUDED_QUERIES.includes(gofor || "")) {
    const token = Cookies.get("authToken");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  // Ensure Content-Type is set if not provided, body exists, and it's not FormData
  if (!headers.has("Content-Type") && hasBody && !isFormData) {
    headers.set("Content-Type", "application/json");
  }

  return headers;
}

/**
 * Handle token expiration and logout
 */
function handleTokenExpiration() {
  Cookies.remove("authToken");
  Cookies.remove("userId");
  Cookies.remove("email");

  // Only redirect if we're not already on login/register page
  if (typeof window !== "undefined") {
    const currentPath = window.location.pathname;
    if (currentPath !== "/login" && currentPath !== "/register") {
      window.location.href = "/login";
    }
  }
}

/**
 * Main API client for tapi.php endpoints
 * Automatically adds base URL and Authorization token
 */
export async function apiCall(
  params: Record<string, string | number> | string,
  options: RequestInit = {}
): Promise<Response> {
  // Get gofor parameter to check if token should be excluded
  const gofor = getGoforParam(params);

  // Build URL with query parameters
  let url = API_CONFIG.BASE_URL;
  if (typeof params === "string") {
    // If params is a string, treat it as query string
    url += params.startsWith("?") ? params : `?${params}`;
  } else {
    // If params is an object, build query string
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      queryParams.append(key, String(value));
    });
    url += `?${queryParams.toString()}`;
  }

  const headers = getAuthHeaders(options.headers, false, false, gofor);

  // Make the request
  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle token expiration (401 or 403) - only if not excluded query
  if (response.status === 401 || response.status === 403) {
    if (!EXCLUDED_QUERIES.includes(gofor || "")) {
      handleTokenExpiration();
    }
  }

  return response;
}

/**
 * API client for POST requests to tapi.php
 */
export async function apiPost(
  params: Record<string, any>,
  body?: any,
  options: RequestInit = {}
): Promise<Response> {
  // Get gofor parameter to check if token should be excluded
  const gofor = getGoforParam(params);

  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    queryParams.append(key, String(value));
  });
  const url = `${API_CONFIG.BASE_URL}?${queryParams.toString()}`;

  const headers = getAuthHeaders(options.headers, true, false, gofor);

  const response = await fetch(url, {
    method: "POST",
    ...options,
    headers,
    body: body ? JSON.stringify(body) : options.body,
  });

  // Handle token expiration (401 or 403) - only if not excluded query
  if (response.status === 401 || response.status === 403) {
    if (!EXCLUDED_QUERIES.includes(gofor || "")) {
      handleTokenExpiration();
    }
  }

  return response;
}

/**
 * Generic fetch wrapper with token (for non-tapi.php endpoints)
 * Use this for upload, analyze, razorpay, verify endpoints
 */
export async function apiFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const isFormData = options.body instanceof FormData;
  const headers = getAuthHeaders(options.headers, !!options.body, isFormData, null);

  // For FormData, don't set Content-Type (browser will set it with boundary)
  if (isFormData) {
    headers.delete("Content-Type");
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Always handle token expiration for non-tapi.php endpoints
  if (response.status === 401 || response.status === 403) {
    handleTokenExpiration();
  }

  return response;
}

/**
 * Upload file to adupl.php
 */
export async function uploadFile(
  file: File,
  userId: string,
  options: RequestInit = {}
): Promise<Response> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("user_id", userId);

  return apiFetch(API_CONFIG.UPLOAD_URL, {
    method: "POST",
    ...options,
    body: formData,
  });
}

/**
 * Upload video to vidadupl.php
 */
export async function uploadVideo(
  file: File,
  userId: string,
  options: RequestInit = {}
): Promise<Response> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("user_id", userId);

  return apiFetch(API_CONFIG.VIDEO_UPLOAD_URL, {
    method: "POST",
    ...options,
    body: formData,
  });
}

/**
 * Analyze ad (analyze.php)
 */
export async function analyzeAd(
  data: Record<string, any>,
  options: RequestInit = {}
): Promise<Response> {
  return apiFetch(API_CONFIG.ANALYZE_URL, {
    method: "POST",
    ...options,
    body: JSON.stringify(data),
  });
}

/**
 * A/B Analyze (abanalyze.php)
 */
export async function abAnalyze(
  data: Record<string, any>,
  options: RequestInit = {}
): Promise<Response> {
  return apiFetch(API_CONFIG.AB_ANALYZE_URL, {
    method: "POST",
    ...options,
    body: JSON.stringify(data),
  });
}

/**
 * Razorpay order creation (razorpay.php)
 */
export async function createRazorpayOrder(
  data: Record<string, any>,
  options: RequestInit = {}
): Promise<Response> {
  return apiFetch(API_CONFIG.RAZORPAY_URL, {
    method: "POST",
    ...options,
    body: JSON.stringify(data),
  });
}

/**
 * Verify payment (verify.php)
 */
export async function verifyPayment(
  data: Record<string, any>,
  options: RequestInit = {}
): Promise<Response> {
  return apiFetch(API_CONFIG.VERIFY_URL, {
    method: "POST",
    ...options,
    body: JSON.stringify(data),
  });
}

