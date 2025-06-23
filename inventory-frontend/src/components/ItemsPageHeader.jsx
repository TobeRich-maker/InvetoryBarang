"use client";

import { useState } from "react";
import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import Tooltip from "@mui/material/Tooltip";
import ExportDialog from "./ExportDialog";

const ItemsPageHeader = ({ onAddItem }) => {
  const { currentUser } = useContext(AuthContext);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  // Check if user has export permissions
  const canExport =
    currentUser?.role?.name === "admin" || currentUser?.role?.name === "staff";

  // Check if user can add items
  const canAddItems =
    currentUser?.role?.name === "admin" || currentUser?.role?.name === "staff";

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mb: 3,
      }}
    >
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          Inventory Items
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Manage your inventory items
        </Typography>
      </Box>

      <Box sx={{ display: "flex", gap: 2 }}>
        {canExport && (
          <Tooltip title="Export Items">
            <Button
              variant="outlined"
              startIcon={<FileDownloadIcon />}
              onClick={() => setExportDialogOpen(true)}
            >
              Export
            </Button>
          </Tooltip>
        )}

        {canAddItems && (
          <Button
            variant="contained"
            startIcon={<AddCircleIcon />}
            onClick={onAddItem}
          >
            Add Item
          </Button>
        )}
      </Box>

      <ExportDialog
        open={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
        type="items"
      />
    </Box>
  );
};

export default ItemsPageHeader;
