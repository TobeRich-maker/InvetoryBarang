"use client";

import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Grid,
  TextField,
  Switch,
  FormControlLabel,
  Button,
  Box,
  CircularProgress,
  Alert,
  Card,
  CardContent,
} from "@mui/material";
import { Save as SaveIcon } from "@mui/icons-material";
import api from "../../services/api";
import RoleGate from "../../components/RoleGate";

const SystemSettings = () => {
  const [settings, setSettings] = useState({
    app_name: "",
    app_env: "",
    app_debug: false,
    app_url: "",
    database_connection: "",
    mail_mailer: "",
    cache_driver: "",
    session_driver: "",
    queue_connection: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get("/admin/system-settings");
        setSettings(response.data);
      } catch (error) {
        console.error("Failed to fetch settings:", error);
        setError("Failed to fetch system settings. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      await api.post("/admin/system-settings", settings);

      setSuccess("Settings updated successfully");
    } catch (error) {
      console.error("Failed to update settings:", error);
      setError("Failed to update system settings. Please try again later.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <RoleGate
      roles="admin"
      fallback={<Typography>Admin access required</Typography>}
    >
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          System Settings
        </Typography>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 3 }}>
                {success}
              </Alert>
            )}

            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Application Settings
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Application Name"
                      name="app_name"
                      value={settings.app_name}
                      onChange={handleChange}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Application URL"
                      name="app_url"
                      value={settings.app_url}
                      onChange={handleChange}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Environment"
                      name="app_env"
                      value={settings.app_env}
                      onChange={handleChange}
                      margin="normal"
                      disabled
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.app_debug}
                          onChange={handleChange}
                          name="app_debug"
                          color="primary"
                        />
                      }
                      label="Debug Mode"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Database & Services
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Database Connection"
                      name="database_connection"
                      value={settings.database_connection}
                      onChange={handleChange}
                      margin="normal"
                      disabled
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Mail Driver"
                      name="mail_mailer"
                      value={settings.mail_mailer}
                      onChange={handleChange}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Cache Driver"
                      name="cache_driver"
                      value={settings.cache_driver}
                      onChange={handleChange}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Session Driver"
                      name="session_driver"
                      value={settings.session_driver}
                      onChange={handleChange}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Queue Connection"
                      name="queue_connection"
                      value={settings.queue_connection}
                      onChange={handleChange}
                      margin="normal"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Settings"}
              </Button>
            </Box>
          </form>
        )}
      </Container>
    </RoleGate>
  );
};

export default SystemSettings;
