"use client";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Button,
  Tooltip,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  alpha,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  AddCircle as AddCircleIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  AdminPanelSettings as AdminIcon,
  LocalShipping as ShippingIcon,
  InsertChart as AnalyticsIcon,
  SupervisorAccount as SuperAdminIcon,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import "../styles/Navbar.css";
import { motion } from "framer-motion";

const Navbar = () => {
  const { currentUser, logout, hasPermission, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = async () => {
    handleCloseUserMenu();
    await logout();
    navigate("/login");
  };

  const toggleDrawer = (open) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }
    setDrawerOpen(open);
  };

  const drawerItems = [
    {
      text: "Dashboard",
      icon: <DashboardIcon />,
      link: "/dashboard",
      show: true,
    },
    {
      text: "Items",
      icon: <InventoryIcon />,
      link: "/items",
      show: isAdmin() || hasPermission("view_items"),
    },
    {
      text: "Add Item",
      icon: <AddCircleIcon />,
      link: "/add-item",
      show: isAdmin() || hasPermission("manage_items"),
    },
    {
      text: "Goods Out",
      icon: <ShippingIcon />,
      link: "/goods-out",
      show: isAdmin() || hasPermission("manage_transactions"),
    },
    {
      text: "Analytics",
      icon: <AnalyticsIcon />,
      link: "/analytics",
      show: isAdmin() || hasPermission("view_reports"),
    },
    {
      text: "Role Management",
      icon: <AdminIcon />,
      link: "/roles",
      show: isAdmin() || hasPermission("manage_roles"),
    },
    {
      text: "Permission Management",
      icon: <SettingsIcon />,
      link: "/permissions",
      show: isAdmin() || hasPermission("manage_roles"),
    },
    {
      text: "System Administration",
      icon: <SuperAdminIcon />,
      link: "/admin",
      show: isAdmin() || hasPermission("manage_system"),
    },
  ];

  const drawer = (
    <Box
      sx={{
        width: 280,
        background: "linear-gradient(to bottom, #1a237e, #283593)",
        color: "white",
        height: "100%",
      }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Sistem Pengadaan Barang
        </Typography>
      </Box>
      <List sx={{ pt: 2 }}>
        {drawerItems
          .filter((item) => item.show)
          .map((item) => (
            <ListItem
              button
              key={item.text}
              component={Link}
              to={item.link}
              sx={{
                my: 0.5,
                mx: 1,
                borderRadius: 1,
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.1)",
                },
              }}
            >
              <ListItemIcon sx={{ color: "white", minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
      </List>
      <Divider sx={{ backgroundColor: "rgba(255,255,255,0.1)", my: 2 }} />
      <List>
        <ListItem
          button
          onClick={handleLogout}
          sx={{
            my: 0.5,
            mx: 1,
            borderRadius: 1,
            "&:hover": {
              backgroundColor: "rgba(255,255,255,0.1)",
            },
          }}
        >
          <ListItemIcon sx={{ color: "white", minWidth: 40 }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <AppBar
        position="static"
        sx={{
          background: "linear-gradient(90deg, #1a237e 0%, #283593 100%)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <IconButton
              size="large"
              edge="start"
              aria-label="menu"
              onClick={toggleDrawer(true)}
              sx={{
                mr: 2,
                color: "white",
                "&:hover": {
                  backgroundColor: alpha("#ffffff", 0.1),
                },
              }}
            >
              <MenuIcon />
            </IconButton>

            <Typography
              variant="h6"
              noWrap
              component={Link}
              to="/dashboard"
              sx={{
                mr: 2,
                display: { xs: "none", md: "flex" },
                fontWeight: 700,
                color: "white",
                textDecoration: "none",
                letterSpacing: ".5px",
              }}
            >
              Sistem Pengadaan Barang
            </Typography>

            <Typography
              variant="h6"
              noWrap
              component={Link}
              to="/dashboard"
              sx={{
                mr: 2,
                display: { xs: "flex", md: "none" },
                flexGrow: 1,
                fontWeight: 700,
                color: "white",
                textDecoration: "none",
              }}
            >
              Inventory
            </Typography>

            <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
              {drawerItems
                .filter((item) => item.show)
                .map((item) => (
                  <motion.div
                    key={item.text}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      component={Link}
                      to={item.link}
                      sx={{
                        my: 2,
                        mx: 0.5,
                        color: "white",
                        display: "block",
                        position: "relative",
                        "&:after": {
                          content: '""',
                          position: "absolute",
                          width: "0",
                          height: "2px",
                          bottom: "8px",
                          left: "50%",
                          backgroundColor: "white",
                          transition: "all 0.3s ease",
                          transform: "translateX(-50%)",
                        },
                        "&:hover:after": {
                          width: "60%",
                        },
                      }}
                    >
                      {item.text}
                    </Button>
                  </motion.div>
                ))}
            </Box>

            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title="Open settings">
                <IconButton
                  onClick={handleOpenUserMenu}
                  sx={{
                    p: 0,
                    border: "2px solid rgba(255,255,255,0.2)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      border: "2px solid rgba(255,255,255,0.5)",
                    },
                  }}
                >
                  <Avatar
                    alt={currentUser?.name}
                    src="/static/images/avatar/2.jpg"
                    sx={{ width: 36, height: 36 }}
                  />
                </IconButton>
              </Tooltip>
              <Menu
                sx={{
                  mt: "45px",
                  "& .MuiPaper-root": {
                    borderRadius: 2,
                    boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
                    overflow: "visible",
                    "&:before": {
                      content: '""',
                      display: "block",
                      position: "absolute",
                      top: 0,
                      right: 14,
                      width: 10,
                      height: 10,
                      bgcolor: "background.paper",
                      transform: "translateY(-50%) rotate(45deg)",
                      zIndex: 0,
                    },
                  },
                }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                <MenuItem onClick={handleCloseUserMenu} sx={{ minWidth: 150 }}>
                  <Typography textAlign="center">Profile</Typography>
                </MenuItem>
                {(isAdmin() || hasPermission("manage_system")) && (
                  <MenuItem
                    onClick={() => {
                      handleCloseUserMenu();
                      navigate("/admin");
                    }}
                    sx={{ minWidth: 150 }}
                  >
                    <Typography textAlign="center">
                      System Administration
                    </Typography>
                  </MenuItem>
                )}
                <MenuItem onClick={handleLogout} sx={{ minWidth: 150 }}>
                  <Typography textAlign="center">Logout</Typography>
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        sx={{
          "& .MuiDrawer-paper": {
            boxShadow: "4px 0 20px rgba(0,0,0,0.15)",
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Navbar;
