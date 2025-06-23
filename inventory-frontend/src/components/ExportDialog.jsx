"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import api from "../services/api";

const ExportDialog = ({ open, onClose, type }) => {
  const [exportFormat, setExportFormat] = useState("xlsx");
  const [dateFilter, setDateFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleExport = async () => {
    setIsLoading(true);
    setError("");

    try {
      let url = "";
      const params = new URLSearchParams();
      params.append("format", exportFormat);

      if (type === "transactions") {
        url = `/export/transactions/${
          exportFormat === "pdf" ? "pdf" : "excel"
        }`;
        params.append("filter", dateFilter);

        if (dateFilter === "custom") {
          if (!startDate || !endDate) {
            throw new Error("Please select both start and end dates.");
          }
          params.append("start_date", startDate);
          params.append("end_date", endDate);
        }
      } else {
        url = `/export/items/${exportFormat === "pdf" ? "pdf" : "excel"}`;
      }

      // Use a direct request instead of axios to handle file download
      window.location.href = `${
        api.defaults.baseURL
      }${url}?${params.toString()}`;
      setTimeout(() => {
        setIsLoading(false);
        onClose();
      }, 1000);
    } catch (err) {
      console.error("Export failed:", err);
      setError(err.message || "Export failed. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={!isLoading ? onClose : undefined}
      aria-labelledby="export-dialog-title"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle id="export-dialog-title">
        Export {type === "transactions" ? "Transactions" : "Items"}
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <DialogContentText sx={{ mb: 2 }}>
          Choose the format and parameters for your export.
        </DialogContentText>

        <FormControl component="fieldset" sx={{ mb: 3 }}>
          <RadioGroup
            row
            name="export-format"
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value)}
          >
            <FormControlLabel
              value="xlsx"
              control={<Radio />}
              label="Excel (XLSX)"
            />
            <FormControlLabel value="csv" control={<Radio />} label="CSV" />
            <FormControlLabel value="pdf" control={<Radio />} label="PDF" />
          </RadioGroup>
        </FormControl>

        {type === "transactions" && (
          <Box sx={{ mb: 3 }}>
            <TextField
              select
              fullWidth
              label="Date Filter"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <MenuItem value="all">All Time</MenuItem>
              <MenuItem value="today">Today</MenuItem>
              <MenuItem value="month">This Month</MenuItem>
              <MenuItem value="year">This Year</MenuItem>
              <MenuItem value="custom">Custom Range</MenuItem>
            </TextField>

            {dateFilter === "custom" && (
              <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
                <TextField
                  label="Start Date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
                <TextField
                  label="End Date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          onClick={handleExport}
          variant="contained"
          disabled={
            isLoading || (dateFilter === "custom" && (!startDate || !endDate))
          }
          startIcon={isLoading ? <CircularProgress size={20} /> : null}
        >
          {isLoading ? "Exporting..." : "Export"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExportDialog;
