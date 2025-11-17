import axios from "axios";
import Cookies from "js-cookie";
import { API_CONFIG } from "../api.config";
import { logoutService } from "../../services/logoutService";

// To avoid multiple refresh calls
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, newToken = null) => {
  failedQueue.forEach((p) => {
    if (error) p.reject(error);
    else p.resolve(newToken);
  });

  failedQueue = [];
};

// ---------------------------
// CREATE AXIOS INSTANCE
// ---------------------------
const axiosInstance = axios.create({
  baseURL: API_CONFIG.DEFAULT_BASE_URL, // https://adalyzeai.xyz/App/tapi.php
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
  },
});

const axiosInstance1 = axios.create({
  baseURL: "https://adalyzeai.xyz/App/api.php", // https://adalyzeai.xyz/App/tapi.php
  timeout: 20000
});

// ---------------------------
// REQUEST INTERCEPTOR
// ---------------------------
axiosInstance.interceptors.request.use(
  (config) => {
    const token = Cookies.get("authToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ---------------------------
// RESPONSE INTERCEPTOR
// ---------------------------
axiosInstance.interceptors.response.use(
  (response) => response, // If successful → return response normally

  async (error) => {
    const originalRequest = error.config;

    // Token expired → backend usually returns status 401
    if (error?.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = Cookies.get("refreshToken");

      // No refresh token → logout immediately
      if (!refreshToken) {
        logoutService();
        return Promise.reject(error);
      }

      // Prevent duplicate refresh requests
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((newToken) => {
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axiosInstance(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // ----------------------------
        // CALL REFRESH TOKEN API
        // ----------------------------
        const refreshResponse = await axios.post(
          API_CONFIG.DEFAULT_BASE_URL,
          {
            gofor: "refresh_token",
            refresh_token: refreshToken,
          }
        );

        const newToken = refreshResponse?.data?.token;

        if (!newToken) throw new Error("Refresh returned no token");

        // Save new token
        Cookies.set("authToken", newToken, { expires: 7 });

        // Update instance default header
        axiosInstance.defaults.headers.Authorization = `Bearer ${newToken}`;

        // Resolve all queued requests
        processQueue(null, newToken);

        isRefreshing = false;

        // Retry the failed request
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);

      } catch (refreshError) {
        // Refresh failed → clear queue → logout
        processQueue(refreshError, null);
        isRefreshing = false;

        logoutService();
        return Promise.reject(refreshError);
      }
    }

    // Any other error → reject normally
    return Promise.reject(error);
  }
);

export { axiosInstance, axiosInstance1, axios };
