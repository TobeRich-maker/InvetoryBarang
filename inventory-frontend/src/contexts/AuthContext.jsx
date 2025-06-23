"use client";

import React from "react";
import { createContext, useState, useEffect } from "react";
import api, { authApi, getCsrfToken, checkAuthStatus } from "../services/api";

export const AuthContext = createContext();

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);
        // Check if user is already logged in
        const token = localStorage.getItem("token");
        const user = localStorage.getItem("user");

        if (token && user) {
          // Set the token in the API instance
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

          try {
            // Verify token is still valid by making a request to the user endpoint
            const response = await api.get("/user");

            // Update user data in case it changed
            setCurrentUser(response.data);
            localStorage.setItem("user", JSON.stringify(response.data));
            console.log("User authenticated:", response.data);
          } catch (err) {
            console.error("Token validation failed:", err);

            // If token is invalid or server error, clear storage and redirect to login
            if (
              err.response &&
              (err.response.status === 401 || err.response.status === 500)
            ) {
              console.log(
                "Clearing auth data due to error:",
                err.response?.status
              );
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              setCurrentUser(null);

              // Don't redirect automatically, just clear the auth data
              // window.location.href = "/login";
            }
          }
        }

        // Try to check auth status for debugging
        try {
          await checkAuthStatus();
        } catch (err) {
          console.warn("Auth status check failed:", err);
        }

        setAuthChecked(true);
      } catch (err) {
        console.error("Auth initialization error:", err);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);

      // First, get the CSRF token
      await getCsrfToken();

      // Then make the login request
      const response = await authApi.post("/api/login", { email, password });
      const { user, token } = response.data;

      console.log("Login successful:", {
        user,
        tokenPreview: token.substring(0, 10) + "...",
      });

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Set the token in the API instance
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setCurrentUser(user);

      // Verify the token works by making a test request
      try {
        await checkAuthStatus();
      } catch (err) {
        console.warn("Post-login auth check failed:", err);
      }

      return user;
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err.response?.data?.message ||
          (err.response?.status === 419
            ? "CSRF token mismatch. Please refresh the page and try again."
            : "Login failed. Please check your credentials.")
      );
      throw err;
    }
  };

  const logout = async () => {
    try {
      // Try to logout on the server
      if (currentUser) {
        await api.post("/logout");
      }
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      // Always clear local storage and state
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      delete api.defaults.headers.common["Authorization"];
      setCurrentUser(null);
    }
  };

  // Check if user has a specific permission
  const hasPermission = (permissionName) => {
    if (!currentUser || !currentUser.role) {
      return false;
    }

    // Admin role always has all permissions
    if (currentUser.role.name === "admin") {
      return true;
    }

    if (!currentUser.role.permissions) {
      return false;
    }

    return currentUser.role.permissions.includes(permissionName);
  };

  // Check if user has admin role
  const isAdmin = () => {
    return currentUser?.role?.name === "admin";
  };

  const value = {
    currentUser,
    loading,
    error,
    authChecked,
    login,
    logout,
    hasPermission,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
