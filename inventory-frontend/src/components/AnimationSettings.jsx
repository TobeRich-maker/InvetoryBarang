"use client";

import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Slider from "@mui/material/Slider";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import SettingsIcon from "@mui/icons-material/Settings";
import CloseIcon from "@mui/icons-material/Close";
import RestoreIcon from "@mui/icons-material/RestoreOutlined";

const AnimationSettings = () => {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState({
    enabled: true,
    speed: 1,
    intensity: 1,
    reducedMotion: false,
  });

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("animationSettings");
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error("Failed to parse animation settings", e);
      }
    }
  }, []);

  // Save settings to localStorage and apply them
  useEffect(() => {
    localStorage.setItem("animationSettings", JSON.stringify(settings));
    applyAnimationSettings(settings);
  }, [settings]);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = (event) => {
    const { name, value, checked } = event.target;
    setSettings((prev) => ({
      ...prev,
      [name]: name === "enabled" || name === "reducedMotion" ? checked : value,
    }));
  };

  const handleReset = () => {
    const defaultSettings = {
      enabled: true,
      speed: 1,
      intensity: 1,
      reducedMotion: false,
    };
    setSettings(defaultSettings);
  };

  // Apply animation settings to CSS variables
  const applyAnimationSettings = (settings) => {
    const root = document.documentElement;
    const speedFactor = settings.enabled ? settings.speed : 0;
    const intensityFactor = settings.enabled ? settings.intensity : 0;
    const reducedMotion = settings.reducedMotion || !settings.enabled;

    // Set CSS variables for animation settings
    root.style.setProperty("--animation-speed", speedFactor.toString());
    root.style.setProperty("--animation-intensity", intensityFactor.toString());
    root.style.setProperty(
      "--animation-reduced-motion",
      reducedMotion ? "reduce" : "no-preference"
    );

    // Apply transition duration based on speed
    const transitionDuration = settings.enabled ? 0.3 / settings.speed : 0;
    root.style.setProperty("--transition-duration", `${transitionDuration}s`);

    // Apply transform scale based on intensity
    const transformScale = settings.enabled
      ? 1 + (settings.intensity - 1) * 0.05
      : 1;
    root.style.setProperty("--transform-scale", transformScale.toString());
  };

  return (
    <>
      <Tooltip title="Animation Settings">
        <IconButton
          onClick={handleOpen}
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
            backgroundColor: "background.paper",
            boxShadow: 2,
            "&:hover": {
              backgroundColor: "grey.100",
            },
            zIndex: 1000,
          }}
        >
          <SettingsIcon />
        </IconButton>
      </Tooltip>

      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="animation-settings-dialog"
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle id="animation-settings-dialog">
          Animation Settings
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mb: 3 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.enabled}
                  onChange={handleChange}
                  name="enabled"
                  color="primary"
                />
              }
              label="Enable Animations"
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography gutterBottom>Animation Speed</Typography>
            <Slider
              value={settings.speed}
              onChange={handleChange}
              name="speed"
              min={0.5}
              max={2}
              step={0.1}
              marks={[
                { value: 0.5, label: "Slow" },
                { value: 1, label: "Normal" },
                { value: 2, label: "Fast" },
              ]}
              valueLabelDisplay="auto"
              disabled={!settings.enabled}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography gutterBottom>Animation Intensity</Typography>
            <Slider
              value={settings.intensity}
              onChange={handleChange}
              name="intensity"
              min={0.5}
              max={1.5}
              step={0.1}
              marks={[
                { value: 0.5, label: "Subtle" },
                { value: 1, label: "Normal" },
                { value: 1.5, label: "Bold" },
              ]}
              valueLabelDisplay="auto"
              disabled={!settings.enabled}
            />
          </Box>

          <Box>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.reducedMotion}
                  onChange={handleChange}
                  name="reducedMotion"
                  color="primary"
                />
              }
              label="Reduced Motion (Accessibility)"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            startIcon={<RestoreIcon />}
            onClick={handleReset}
            color="inherit"
          >
            Reset to Default
          </Button>
          <Button onClick={handleClose} variant="contained">
            Done
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AnimationSettings;
