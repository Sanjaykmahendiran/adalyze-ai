export const API_CONFIG = {
  BASE_URL: 'https://adalyzeai.xyz/App/tapi.php',
  UPLOAD_URL: 'https://adalyzeai.xyz/App/adupl.php',
  VIDEO_UPLOAD_URL: 'https://adalyzeai.xyz/App/vidadupl.php',
  ANALYZE_URL: 'https://adalyzeai.xyz/App/analyze.php',
  AB_ANALYZE_URL: 'https://adalyzeai.xyz/App/abanalyze.php',
  RAZORPAY_URL: 'https://adalyzeai.xyz/App/razorpay.php',
  VERIFY_URL: 'https://adalyzeai.xyz/App/verify.php',
} as const;

export const CONTENT_TYPES = {
  JSON: 'application/json',
  FORM_DATA: 'multipart/form-data',
  URL_ENCODED: 'application/x-www-form-urlencoded',
} as const;