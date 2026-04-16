import axios from "axios";

const axiosInstance = axios.create({
  // NEXT_PUBLIC_REST_BASE_URL = new REST backend (dev.evraapp.top / api.evraapp.top)
  // Falls back to NEXT_PUBLIC_API_BASE_URL for local dev without the split configured
  baseURL: process.env.NEXT_PUBLIC_REST_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export { axiosInstance, axios };
