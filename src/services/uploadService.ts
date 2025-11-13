import axios from "axios";
import Cookies from "js-cookie";

const uploadService = axios.create({
  timeout: 30000, // uploads can be slow
});

// Add Authorization token for uploads as well
uploadService.interceptors.request.use(
  (config) => {
    const token = Cookies.get("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default uploadService;
