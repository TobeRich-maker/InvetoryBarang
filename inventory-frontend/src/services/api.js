import axios from "axios";

// Create an instance specifically for authentication that handles CSRF
const authApi = axios.create({
  baseURL: "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest", // Important for Laravel to recognize AJAX requests
  },
  withCredentials: true, // This is crucial for cookies/session to work cross-domain
});

// Regular API instance for authenticated requests
const api = axios.create({
  baseURL: "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log("Request headers:", config.headers); // Tambahkan ini
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 and we haven't already tried to refresh the token
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const token = localStorage.getItem("token");

        if (token) {
          // Only attempt refresh if we have a token
          const refreshResponse = await axios.post(
            "http://localhost:8000/api/refresh-token",
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "X-Requested-With": "XMLHttpRequest",
              },
              withCredentials: true,
            }
          );

          const newToken = refreshResponse.data.token;
          localStorage.setItem("token", newToken);

          // Update the authorization header
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;

          // Retry the original request
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);

        // If refresh fails, log out the user
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        // Use React Router for navigation instead of direct window location change
        // window.location.href = "/login";

        return Promise.reject(refreshError);
      }
    }

    // If the error is still 401 after retry or other errors
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 500)
    ) {
      // For 500 errors, we'll log but not automatically clear auth data
      if (error.response.status === 500) {
        console.error("Server error:", error.response.data);
      } else {
        // For 401 errors, clear auth data
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }

    return Promise.reject(error);
  }
);

// Function to get CSRF cookie before making authentication requests
const getCsrfToken = async () => {
  try {
    await authApi.get("/sanctum/csrf-cookie");
    console.log("CSRF cookie set successfully");
  } catch (error) {
    console.error("Error setting CSRF cookie:", error);
    throw error;
  }
};

// Debug function to check authentication status
const checkAuthStatus = async () => {
  try {
    const token = localStorage.getItem("token");
    console.log(
      "Current token:",
      token ? `${token.substring(0, 10)}...` : "No token"
    );

    const response = await api.get("/test-auth");
    console.log("Auth status:", response.data);
    return response.data;
  } catch (error) {
    console.error("Auth check failed:", error.response?.data || error.message);
    throw error;
  }
};

const apiUrl = "http://localhost:8000/api";

const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return response;
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
};

export {
  api as default,
  authApi,
  getCsrfToken,
  checkAuthStatus,
  fetchWithAuth,
  apiUrl,
};
