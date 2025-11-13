import axios from "axios";
import Cookies from "js-cookie";

// Queries that should not have token attached
const EXCLUDED_QUERIES = ["login", "register", "eregister", "forgot-password", "addevents"];

/**
 * Get the 'gofor' parameter from axios config
 */
const getGoforParam = (config) => {
  if (config.params?.gofor) {
    return config.params.gofor;
  }
  if (config.url) {
    const urlParams = new URLSearchParams(config.url.split("?")[1] || "");
    return urlParams.get("gofor");
  }
  return null;
};

/**
 * Function to create Axios instances
 */
const createAxiosInstance = (baseURL, headers = {}) => {
  return axios.create({
    baseURL: baseURL || "",
    headers,
    withCredentials: true,
  });
};

/**
 * Main axios instance for tapi.php
 */
export const axiosInstance = createAxiosInstance(process.env.API_BASE_URL || "https://adalyzeai.xyz/App/tapi.php", {
  "Content-Type": "application/json",
});

/**
 * Apply interceptors to axios instance
 */
const applyInterceptors = (instance) => {
  // Request interceptor
  instance.interceptors.request.use(
    (config) => {
      const gofor = getGoforParam(config);
      
      // Only add token if gofor is not in excluded queries
      if (!EXCLUDED_QUERIES.includes(gofor || "")) {
        const token = Cookies.get("authToken");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (!error.config) return Promise.reject(error);

      const gofor = getGoforParam(error.config);

      // Handle token expiration (401 or 403)
      if (error.response && [401, 403].includes(error.response.status)) {
        // Only handle logout if gofor is not in excluded queries
        if (!EXCLUDED_QUERIES.includes(gofor || "")) {
          // Remove token and cookies
          Cookies.remove("authToken");
          Cookies.remove("userId");
          Cookies.remove("email");

          // Redirect to login
          if (typeof window !== "undefined") {
            const currentPath = window.location.pathname;
            if (currentPath !== "/login" && currentPath !== "/register") {
              window.location.href = "/login";
            }
          }
        }
      }
      return Promise.reject(error);
    }
  );
};

// Apply interceptors to axios instance
applyInterceptors(axiosInstance);

export { axios };