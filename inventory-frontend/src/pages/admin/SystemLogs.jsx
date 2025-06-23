"use client";

import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Box,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import api from "../../services/api";
import RoleGate from "../../components/RoleGate";

const SystemLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/admin/system-logs");
      setLogs(response.data.logs || []);
    } catch (error) {
      console.error("Failed to fetch logs:", error);
      setError("Failed to fetch system logs. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const downloadLogs = () => {
    // Create a blob with the logs data
    const blob = new Blob([logs.join("\n")], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `system-logs-${new Date().toISOString().split("T")[0]}.log`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  // Parse log entries to extract timestamp, level, and message
  const parseLogEntry = (logEntry) => {
    try {
      // This is a simple parser and might need adjustment based on your actual log format
      const match = logEntry.match(/\[(.*?)\] (\w+)\.(\w+): (.*)/);
      if (match) {
        return {
          timestamp: match[1],
          level: match[3],
          message: match[4],
        };
      }
      return {
        timestamp: "Unknown",
        level: "Unknown",
        message: logEntry,
      };
    } catch (e) {
      return {
        timestamp: "Unknown",
        level: "Unknown",
        message: logEntry,
      };
    }
  };

  // Get color based on log level
  const getLevelColor = (level) => {
    switch (level.toLowerCase()) {
      case "error":
        return "error.main";
      case "warning":
        return "warning.main";
      case "info":
        return "info.main";
      case "debug":
        return "text.secondary";
      default:
        return "text.primary";
    }
  };

  return (
    <RoleGate
      roles="admin"
      fallback={<Typography>Admin access required</Typography>}
    >
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          System Logs
        </Typography>

        <Box
          sx={{ mb: 3, display: "flex", justifyContent: "flex-end", gap: 2 }}
        >
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchLogs}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={downloadLogs}
            disabled={loading || logs.length === 0}
          >
            Download Logs
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
            <CircularProgress />
          </Box>
        ) : logs.length === 0 ? (
          <Alert severity="info">No logs found</Alert>
        ) : (
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Timestamp</TableCell>
                  <TableCell>Level</TableCell>
                  <TableCell>Message</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.map((log, index) => {
                  const { timestamp, level, message } = parseLogEntry(log);
                  return (
                    <TableRow key={index}>
                      <TableCell>{timestamp}</TableCell>
                      <TableCell sx={{ color: getLevelColor(level) }}>
                        {level}
                      </TableCell>
                      <TableCell
                        sx={{
                          maxWidth: "500px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {message}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Container>
    </RoleGate>
  );
};

export default SystemLogs;
