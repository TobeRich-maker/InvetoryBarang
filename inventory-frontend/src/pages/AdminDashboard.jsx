"use client";

import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
} from "@mui/material";
import {
  Settings as SettingsIcon,
  Security as SecurityIcon,
  Storage as StorageIcon,
  Build as BuildIcon,
  BugReport as BugReportIcon,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import RoleGate from "../components/RoleGate";

const AdminDashboard = () => {
  const { hasPermission } = useAuth();
  const navigate = useNavigate();
  const [systemStats, setSystemStats] = useState({
    users: 0,
    roles: 0,
    permissions: 0,
    items: 0,
    transactions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSystemStats = async () => {
      try {
        const response = await api.get("/admin/system-stats");
        setSystemStats(response.data);
      } catch (error) {
        console.error("Failed to fetch system stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSystemStats();
  }, []);

  const adminFeatures = [
    {
      title: "User Management",
      description: "Manage users, assign roles, and reset passwords",
      icon: <SecurityIcon fontSize="large" />,
      path: "/admin/users",
      permission: "manage_users",
    },
    {
      title: "Role Management",
      description: "Create and configure roles with specific permissions",
      icon: <SettingsIcon fontSize="large" />,
      path: "/roles",
      permission: "manage_roles",
    },
    {
      title: "System Settings",
      description: "Configure global system settings and preferences",
      icon: <BuildIcon fontSize="large" />,
      path: "/admin/settings",
      permission: "manage_settings",
    },
    {
      title: "Database Management",
      description: "View database status and run maintenance operations",
      icon: <StorageIcon fontSize="large" />,
      path: "/admin/database",
      permission: "manage_system",
    },
    {
      title: "System Logs",
      description: "View application logs and error reports",
      icon: <BugReportIcon fontSize="large" />,
      path: "/admin/logs",
      permission: "view_logs",
    },
  ];

  return (
    <RoleGate
      roles="admin"
      fallback={<Typography>Admin access required</Typography>}
    >
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Admin Dashboard
        </Typography>

        <Box sx={{ mb: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                System Overview
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body1">
                    Users: {systemStats.users}
                  </Typography>
                  <Typography variant="body1">
                    Roles: {systemStats.roles}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body1">
                    Items: {systemStats.items}
                  </Typography>
                  <Typography variant="body1">
                    Transactions: {systemStats.transactions}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body1">
                    Permissions: {systemStats.permissions}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>

        <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
          Admin Features
        </Typography>

        <Grid container spacing={3}>
          {adminFeatures.map((feature) => (
            <Grid item xs={12} sm={6} md={4} key={feature.title}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: 3,
                    cursor: "pointer",
                  },
                }}
                onClick={() => navigate(feature.path)}
              >
                <CardContent
                  sx={{
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                  }}
                >
                  <Box sx={{ mb: 2, color: "primary.main" }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </RoleGate>
  );
};

export default AdminDashboard;
