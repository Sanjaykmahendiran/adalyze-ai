export const API_CONFIG = {
    DEFAULT_BASE_URL: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api.php`,
  } as const;
  
  export const CONTENT_TYPES = {
    JSON: 'application/json',
    FORM_DATA: 'multipart/form-data',
    URL_ENCODED: 'application/x-www-form-urlencoded',
  } as const;