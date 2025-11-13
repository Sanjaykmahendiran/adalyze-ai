export const API_CONFIG = {
  DEFAULT_BASE_URL: "https://adalyzeai.xyz/App/tapi.php",

  // Upload / External APIs
  UPLOAD_IMAGE: "https://adalyzeai.xyz/App/adupl.php",
  UPLOAD_VIDEO: "https://adalyzeai.xyz/App/vidadupl.php",

  // Analysis APIs
  ANALYZE_IMAGE: "https://adalyzeai.xyz/App/analyze.php",
  ANALYZE_AB: "https://adalyzeai.xyz/App/abanalyze.php",

  // Payment APIs
  RAZORPAY: "https://adalyzeai.xyz/App/razorpay.php",
  VERIFY_PAYMENT: "https://adalyzeai.xyz/App/verify.php",
} as const;

export const CONTENT_TYPES = {
  JSON: "application/json",
  FORM_DATA: "multipart/form-data",
  URL_ENCODED: "application/x-www-form-urlencoded",
} as const;

