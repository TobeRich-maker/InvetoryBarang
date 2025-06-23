"use client";

import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { checkAuthStatus } from "../services/api";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";

const AuthDebugger = () => {
  const { currentUser } = useContext(AuthContext);
  const [authStatus, setAuthStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const checkAuth = async () => {
    setLoading(true);
    setError(null);
    try {
      const status = await checkAuthStatus();
      setAuthStatus(status);
    } catch (err) {
      setError(err.message || "Failed to check auth status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Authentication Debugger
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2">Current User:</Typography>
        <Typography
          variant="body2"
          component="pre"
          sx={{ p: 1, bgcolor: "grey.100", borderRadius: 1 }}
        >
          {currentUser ? JSON.stringify(currentUser, null, 2) : "Not logged in"}
        </Typography>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2">Stored Token:</Typography>
        <Typography
          variant="body2"
          component="pre"
          sx={{ p: 1, bgcolor: "grey.100", borderRadius: 1 }}
        >
          {token ? `${token.substring(0, 15)}...` : "No token stored"}
        </Typography>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2">Stored User:</Typography>
        <Typography
          variant="body2"
          component="pre"
          sx={{ p: 1, bgcolor: "grey.100", borderRadius: 1 }}
        >
          {storedUser
            ? JSON.stringify(JSON.parse(storedUser), null, 2)
            : "No user stored"}
        </Typography>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2">Auth Status Check:</Typography>
        {loading ? (
          <CircularProgress size={20} sx={{ ml: 1 }} />
        ) : (
          <Typography
            variant="body2"
            component="pre"
            sx={{ p: 1, bgcolor: "grey.100", borderRadius: 1 }}
          >
            {authStatus ? JSON.stringify(authStatus, null, 2) : "Not checked"}
          </Typography>
        )}
      </Box>

      <Button variant="outlined" onClick={checkAuth} disabled={loading}>
        {loading ? "Checking..." : "Check Auth Status"}
      </Button>
    </Paper>
  );
};

export default AuthDebugger;
