"use client";
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Divider,
} from "@mui/material";
import { Link } from "react-router-dom";
import TokenDebugger from "../components/TokenDebugger";
import LoginTest from "../components/LoginTest";
import AuthDebugger from "../components/AuthDebugger";

const AuthDiagnosticPage = () => {
  const clearAllStorage = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Authentication Diagnostic
        </Typography>
        <Typography variant="body1" paragraph>
          This page helps diagnose authentication issues with your application.
        </Typography>

        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <Button variant="contained" color="error" onClick={clearAllStorage}>
            Clear All Storage
          </Button>
          <Button variant="outlined" component={Link} to="/login">
            Go to Login
          </Button>
          <Button variant="outlined" component={Link} to="/dashboard">
            Go to Dashboard
          </Button>
        </Box>
      </Paper>

      <TokenDebugger />
      <LoginTest />
      <AuthDebugger />

      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Troubleshooting Steps
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Typography variant="subtitle1" gutterBottom>
          1. Clear Browser Storage
        </Typography>
        <Typography variant="body2" paragraph>
          Use the "Clear All Storage" button above to reset all localStorage and
          sessionStorage.
        </Typography>

        <Typography variant="subtitle1" gutterBottom>
          2. Test Direct Login
        </Typography>
        <Typography variant="body2" paragraph>
          Use the Direct Login Test to bypass the normal login flow and directly
          test the API.
        </Typography>

        <Typography variant="subtitle1" gutterBottom>
          3. Check CORS Settings
        </Typography>
        <Typography variant="body2" paragraph>
          Ensure your Laravel CORS configuration allows credentials and has the
          correct origins.
        </Typography>

        <Typography variant="subtitle1" gutterBottom>
          4. Verify Sanctum Configuration
        </Typography>
        <Typography variant="body2" paragraph>
          Check that your Sanctum configuration has the correct stateful
          domains.
        </Typography>

        <Typography variant="subtitle1" gutterBottom>
          5. Check Network Requests
        </Typography>
        <Typography variant="body2" paragraph>
          Use browser developer tools to inspect network requests and ensure the
          token is being sent.
        </Typography>
      </Paper>
    </Container>
  );
};

export default AuthDiagnosticPage;
