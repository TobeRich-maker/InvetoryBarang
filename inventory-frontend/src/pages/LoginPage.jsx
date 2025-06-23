"use client";

import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Paper from "@mui/material/Paper";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";
import LoginIcon from "@mui/icons-material/Login";
import { getCsrfToken } from "../services/api";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // Pre-fetch CSRF token when component mounts
  useEffect(() => {
    getCsrfToken().catch((err) => {
      console.error("Failed to get CSRF token:", err);
      setError(
        "Failed to establish a secure connection. Please refresh the page."
      );
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); // This line is crucial to prevent the default form submission
    setIsLoading(true);
    setError("");

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "calc(100vh - 100px)",
      }}
    >
      <Card sx={{ maxWidth: 450, width: "100%", boxShadow: 3 }}>
        <CardHeader
          title="Welcome Back"
          subheader="Log in to access your inventory dashboard"
          sx={{ textAlign: "center", pb: 0 }}
        />

        {error && (
          <Box sx={{ px: 3, pt: 2 }}>
            <Alert severity="error">{error}</Alert>
          </Box>
        )}

        <CardContent sx={{ pt: 3 }}>
          <form onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isLoading}
              startIcon={
                isLoading ? <CircularProgress size={20} /> : <LoginIcon />
              }
            >
              {isLoading ? "Logging in..." : "Log In"}
            </Button>
          </form>
        </CardContent>

        <Divider />

        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Demo Credentials:
          </Typography>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="body2" gutterBottom>
              <strong>Admin:</strong> admin@example.com / password
            </Typography>
            <Typography variant="body2">
              <strong>Staff:</strong> staff@example.com / password
            </Typography>
          </Paper>
        </Box>
      </Card>
    </Box>
  );
};

export default LoginPage;
