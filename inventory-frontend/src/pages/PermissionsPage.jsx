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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
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

const PermissionsPage = () => {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentPermission, setCurrentPermission] = useState(null);
  const [permissionData, setPermissionData] = useState({
    name: "",
    display_name: "",
    description: "",
    group: "",
  });
  const [groups, setGroups] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Check if user has permission to manage roles
  const canManagePermissions =
    user?.role?.permissions?.some((p) => p.name === "manage_roles") || false;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetchWithAuth(`${apiUrl}/permissions`);

        if (response.ok) {
          const data = await response.json();
          setPermissions(data);

          // Extract unique groups
          const uniqueGroups = [
            ...new Set(data.map((p) => p.group).filter(Boolean)),
          ];
          setGroups(uniqueGroups);
        } else {
          throw new Error("Failed to fetch permissions");
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

  const handleOpenDialog = (permission = null) => {
    if (permission) {
      setCurrentPermission(permission);
      setPermissionData({
        name: permission.name,
        display_name: permission.display_name,
        description: permission.description || "",
        group: permission.group || "",
      });
    } else {
      setCurrentPermission(null);
      setPermissionData({
        name: "",
        display_name: "",
        description: "",
        group: "",
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentPermission(null);
    setPermissionData({
      name: "",
      display_name: "",
      description: "",
      group: "",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPermissionData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSavePermission = async () => {
    try {
      if (!permissionData.name.trim() || !permissionData.display_name.trim()) {
        setSnackbar({
          open: true,
          message: "Name and Display Name are required",
          severity: "error",
        });
        return;
      }

      const method = currentPermission ? "PUT" : "POST";
      const url = currentPermission
        ? `${apiUrl}/permissions/${currentPermission.id}`
        : `${apiUrl}/permissions`;

      const response = await fetchWithAuth(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(permissionData),
      });

      if (response.ok) {
        const savedPermission = await response.json();

        if (currentPermission) {
          setPermissions(
            permissions.map((p) =>
              p.id === savedPermission.id ? savedPermission : p
            )
          );
        } else {
          setPermissions([...permissions, savedPermission]);
        }

        // Update groups if needed
        if (permissionData.group && !groups.includes(permissionData.group)) {
          setGroups([...groups, permissionData.group]);
        }

        setSnackbar({
          open: true,
          message: `Permission ${
            currentPermission ? "updated" : "created"
          } successfully`,
          severity: "success",
        });

        handleCloseDialog();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save permission");
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: `Error: ${err.message}`,
        severity: "error",
      });
    }
  };

  const handleDeletePermission = async (permission) => {
    if (
      !window.confirm(
        `Are you sure you want to delete the permission "${permission.display_name}"?`
      )
    ) {
      return;
    }

    try {
      const response = await fetchWithAuth(
        `${apiUrl}/permissions/${permission.id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setPermissions(permissions.filter((p) => p.id !== permission.id));
        setSnackbar({
          open: true,
          message: "Permission deleted successfully",
          severity: "success",
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete permission");
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: `Error: ${err.message}`,
        severity: "error",
      });
    }
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
        <Typography variant="h4">Permission Management</Typography>
        {canManagePermissions && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Permission
          </Button>
        )}
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Display Name</TableCell>
              <TableCell>Group</TableCell>
              <TableCell>Description</TableCell>
              {canManagePermissions && (
                <TableCell align="right">Actions</TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {permissions.map((permission) => (
              <TableRow key={permission.id}>
                <TableCell>{permission.id}</TableCell>
                <TableCell>{permission.name}</TableCell>
                <TableCell>{permission.display_name}</TableCell>
                <TableCell>{permission.group}</TableCell>
                <TableCell>{permission.description}</TableCell>
                {canManagePermissions && (
                  <TableCell align="right">
                    <Tooltip title="Edit Permission">
                      <IconButton
                        color="primary"
                        onClick={() => handleOpenDialog(permission)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Permission">
                      <IconButton
                        color="error"
                        onClick={() => handleDeletePermission(permission)}
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

      {/* Permission Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {currentPermission ? "Edit Permission" : "Add Permission"}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Permission Name"
            fullWidth
            value={permissionData.name}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="display_name"
            label="Display Name"
            fullWidth
            value={permissionData.display_name}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="description"
            label="Description"
            fullWidth
            multiline
            rows={2}
            value={permissionData.description}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="group-label">Group</InputLabel>
            <Select
              labelId="group-label"
              name="group"
              value={permissionData.group}
              onChange={handleInputChange}
              label="Group"
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {groups.map((group) => (
                <MenuItem key={group} value={group}>
                  {group}
                </MenuItem>
              ))}
              <MenuItem value="__new__">
                <em>+ Add New Group</em>
              </MenuItem>
            </Select>
          </FormControl>
          {permissionData.group === "__new__" && (
            <TextField
              margin="dense"
              name="group"
              label="New Group Name"
              fullWidth
              value=""
              onChange={handleInputChange}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSavePermission}
            variant="contained"
            color="primary"
          >
            Save
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

export default PermissionsPage;
