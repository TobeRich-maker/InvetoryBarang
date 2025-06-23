"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  IconButton,
  Chip,
  Tooltip,
  CircularProgress,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { fetchWithAuth, apiUrl } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

const RolesPage = () => {
  const { user } = useAuth();
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [groupedPermissions, setGroupedPermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openPermissionDialog, setOpenPermissionDialog] = useState(false);
  const [currentRole, setCurrentRole] = useState(null);
  const [roleName, setRoleName] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Check if user has permission to manage roles
  const canManageRoles =
    user?.role?.permissions?.some((p) => p.name === "manage_roles") || false;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [rolesResponse, permissionsResponse] = await Promise.all([
          fetchWithAuth(`${apiUrl}/roles`),
          fetchWithAuth(`${apiUrl}/permissions-grouped`),
        ]);

        if (rolesResponse.ok && permissionsResponse.ok) {
          const rolesData = await rolesResponse.json();
          const permissionsData = await permissionsResponse.json();

          setRoles(rolesData);
          setGroupedPermissions(permissionsData);

          // Flatten permissions for selection
          const allPermissions = [];
          Object.values(permissionsData).forEach((group) => {
            group.forEach((permission) => {
              allPermissions.push(permission);
            });
          });
          setPermissions(allPermissions);
        } else {
          throw new Error("Failed to fetch data");
        }
      } catch (err) {
        setError(err.message);
        setSnackbar({
          open: true,
          message: `Error: ${err.message}`,
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleOpenDialog = (role = null) => {
    if (role) {
      setCurrentRole(role);
      setRoleName(role.name);
    } else {
      setCurrentRole(null);
      setRoleName("");
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentRole(null);
    setRoleName("");
  };

  const handleOpenPermissionDialog = (role) => {
    setCurrentRole(role);
    setSelectedPermissions(role.permissions.map((p) => p.id));
    setOpenPermissionDialog(true);
  };

  const handleClosePermissionDialog = () => {
    setOpenPermissionDialog(false);
    setCurrentRole(null);
    setSelectedPermissions([]);
  };

  const handleSaveRole = async () => {
    try {
      if (!roleName.trim()) {
        setSnackbar({
          open: true,
          message: "Role name cannot be empty",
          severity: "error",
        });
        return;
      }

      const method = currentRole ? "PUT" : "POST";
      const url = currentRole
        ? `${apiUrl}/roles/${currentRole.id}`
        : `${apiUrl}/roles`;

      const response = await fetchWithAuth(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: roleName }),
      });

      if (response.ok) {
        const savedRole = await response.json();

        if (currentRole) {
          setRoles(roles.map((r) => (r.id === savedRole.id ? savedRole : r)));
        } else {
          setRoles([...roles, savedRole]);
        }

        setSnackbar({
          open: true,
          message: `Role ${currentRole ? "updated" : "created"} successfully`,
          severity: "success",
        });

        handleCloseDialog();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save role");
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: `Error: ${err.message}`,
        severity: "error",
      });
    }
  };

  const handleDeleteRole = async (role) => {
    if (
      !window.confirm(
        `Are you sure you want to delete the role "${role.name}"?`
      )
    ) {
      return;
    }

    try {
      const response = await fetchWithAuth(`${apiUrl}/roles/${role.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setRoles(roles.filter((r) => r.id !== role.id));
        setSnackbar({
          open: true,
          message: "Role deleted successfully",
          severity: "success",
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete role");
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: `Error: ${err.message}`,
        severity: "error",
      });
    }
  };

  const handleSavePermissions = async () => {
    try {
      const response = await fetchWithAuth(
        `${apiUrl}/roles/${currentRole.id}/permissions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ permissions: selectedPermissions }),
        }
      );

      if (response.ok) {
        const updatedRole = await response.json();
        setRoles(roles.map((r) => (r.id === updatedRole.id ? updatedRole : r)));

        setSnackbar({
          open: true,
          message: "Permissions updated successfully",
          severity: "success",
        });

        handleClosePermissionDialog();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update permissions");
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: `Error: ${err.message}`,
        severity: "error",
      });
    }
  };

  const handleTogglePermission = (permissionId) => {
    setSelectedPermissions((prev) => {
      if (prev.includes(permissionId)) {
        return prev.filter((id) => id !== permissionId);
      } else {
        return [...prev, permissionId];
      }
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4">Role Management</Typography>
        {canManageRoles && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Role
          </Button>
        )}
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Permissions</TableCell>
              {canManageRoles && <TableCell align="right">Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {roles.map((role) => (
              <TableRow key={role.id}>
                <TableCell>{role.id}</TableCell>
                <TableCell>{role.name}</TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {role.permissions.slice(0, 5).map((permission) => (
                      <Chip
                        key={permission.id}
                        label={permission.display_name}
                        size="small"
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    ))}
                    {role.permissions.length > 5 && (
                      <Chip
                        label={`+${role.permissions.length - 5} more`}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>
                </TableCell>
                {canManageRoles && (
                  <TableCell align="right">
                    <Tooltip title="Edit Permissions">
                      <IconButton
                        color="primary"
                        onClick={() => handleOpenPermissionDialog(role)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit Role">
                      <IconButton
                        color="secondary"
                        onClick={() => handleOpenDialog(role)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Role">
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteRole(role)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Role Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{currentRole ? "Edit Role" : "Add Role"}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Role Name"
            fullWidth
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveRole} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Permissions Dialog */}
      <Dialog
        open={openPermissionDialog}
        onClose={handleClosePermissionDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Permissions for {currentRole?.name}</DialogTitle>
        <DialogContent>
          {Object.entries(groupedPermissions).map(([group, perms]) => (
            <Box key={group} sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                {group}
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {perms.map((permission) => (
                  <Chip
                    key={permission.id}
                    label={permission.display_name}
                    onClick={() => handleTogglePermission(permission.id)}
                    color={
                      selectedPermissions.includes(permission.id)
                        ? "primary"
                        : "default"
                    }
                    variant={
                      selectedPermissions.includes(permission.id)
                        ? "filled"
                        : "outlined"
                    }
                    sx={{ mb: 1 }}
                  />
                ))}
              </Box>
            </Box>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePermissionDialog}>Cancel</Button>
          <Button
            onClick={handleSavePermissions}
            variant="contained"
            color="primary"
          >
            Save Permissions
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RolesPage;
