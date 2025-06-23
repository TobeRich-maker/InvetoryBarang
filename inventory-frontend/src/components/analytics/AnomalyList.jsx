"use client";

import React, { useState } from "react";
import {
  Paper,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  LinearProgress,
} from "@mui/material";
import {
  Warning,
  TrendingUp,
  TrendingDown,
  CalendarToday,
  InfoOutlined,
} from "@mui/icons-material";

const AnomalyList = ({ data }) => {
  const [timeRange, setTimeRange] = useState("30");
  const [anomalyType, setAnomalyType] = useState("all");

  const handleTimeRangeChange = (event) => setTimeRange(event.target.value);
  const handleAnomalyTypeChange = (event) => setAnomalyType(event.target.value);

  const filteredAnomalies = data.anomalies.filter((anomaly) => {
    const withinTimeRange =
      Number.parseInt(timeRange) === 0 ||
      new Date(anomaly.date) >=
        new Date(Date.now() - Number.parseInt(timeRange) * 24 * 60 * 60 * 1000);
    const matchesType = anomalyType === "all" || anomaly.type === anomalyType;
    return withinTimeRange && matchesType;
  });

  const getAnomalyIcon = (type) => {
    switch (type) {
      case "surge":
        return <TrendingUp color="error" />;
      case "drop":
        return <TrendingDown color="warning" />;
      default:
        return <Warning color="info" />;
    }
  };

  const getAnomalySeverityColor = (zScore) => {
    const absZ = Math.abs(zScore);
    if (absZ >= 3) return "error";
    if (absZ >= 2) return "warning";
    return "info";
  };

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString();

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" component="h2" gutterBottom>
        Anomaly Detection
      </Typography>

      {/* Penjelasan untuk pengguna */}
      <Box
        sx={{
          bgcolor: "#e3f2fd",
          border: "1px solid #90caf9",
          borderRadius: 2,
          p: 2,
          mb: 3,
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{ color: "#1976d2", fontWeight: 600 }}
        >
          <InfoOutlined
            fontSize="small"
            sx={{ verticalAlign: "middle", mr: 1 }}
          />
          Apa itu Anomali?
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Anomali adalah kejadian yang menyimpang dari pola permintaan atau
          transaksi yang biasa terjadi. Sistem menggunakan metode statistik
          bernama <strong>Z-Score</strong> untuk mendeteksi lonjakan atau
          penurunan tak wajar:
        </Typography>
        <ul style={{ paddingLeft: 16, color: "#424242", fontSize: "0.9rem" }}>
          <li>
            <strong>Surge:</strong> permintaan tiba-tiba <em>sangat tinggi</em>
          </li>
          <li>
            <strong>Drop:</strong> permintaan tiba-tiba <em>sangat rendah</em>
          </li>
        </ul>
        <Typography variant="body2" sx={{ mt: 1 }} color="text.secondary">
          <strong>Z-Score</strong> menunjukkan tingkat penyimpangan dari
          rata-rata. Nilai Z-Score tinggi (misalnya 3.2) berarti kejadian
          tersebut sangat tidak normal.
        </Typography>
      </Box>

      {/* Kartu Ringkasan */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card variant="outlined">
            <CardContent>
              <Typography color="text.secondary">Total Anomalies</Typography>
              <Typography variant="h5">
                {data.summary.totalAnomalies}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card variant="outlined">
            <CardContent>
              <Typography color="text.secondary">Surge Anomalies</Typography>
              <Typography variant="h5">
                {data.summary.surgeAnomalies}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card variant="outlined">
            <CardContent>
              <Typography color="text.secondary">Drop Anomalies</Typography>
              <Typography variant="h5">{data.summary.dropAnomalies}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filter */}
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <FormControl sx={{ minWidth: 150 }} size="small">
          <InputLabel id="time-range-label">Time Range</InputLabel>
          <Select
            labelId="time-range-label"
            id="time-range"
            value={timeRange}
            label="Time Range"
            onChange={handleTimeRangeChange}
          >
            <MenuItem value="7">Last 7 days</MenuItem>
            <MenuItem value="30">Last 30 days</MenuItem>
            <MenuItem value="90">Last 90 days</MenuItem>
            <MenuItem value="0">All time</MenuItem>
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 150 }} size="small">
          <InputLabel id="anomaly-type-label">Anomaly Type</InputLabel>
          <Select
            labelId="anomaly-type-label"
            id="anomaly-type"
            value={anomalyType}
            label="Anomaly Type"
            onChange={handleAnomalyTypeChange}
          >
            <MenuItem value="all">All types</MenuItem>
            <MenuItem value="surge">Surge</MenuItem>
            <MenuItem value="drop">Drop</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* List Anomali */}
      <List>
        {filteredAnomalies.map((anomaly, index) => (
          <React.Fragment key={anomaly.id}>
            {index > 0 && <Divider component="li" />}
            <ListItem alignItems="flex-start">
              <ListItemIcon>{getAnomalyIcon(anomaly.type)}</ListItemIcon>
              <ListItemText
                primary={
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="subtitle1">
                      {anomaly.itemName}
                    </Typography>
                    <Chip
                      icon={<CalendarToday fontSize="small" />}
                      label={formatDate(anomaly.date)}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                }
                secondary={
                  <>
                    <Typography
                      component="span"
                      variant="body2"
                      color="text.primary"
                    >
                      {anomaly.description}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                      <Typography variant="body2" sx={{ mr: 1 }}>
                        Severity:
                      </Typography>
                      <Box sx={{ width: "60%", mr: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(Math.abs(anomaly.zScore) * 20, 100)}
                          color={getAnomalySeverityColor(anomaly.zScore)}
                        />
                      </Box>
                      <Chip
                        label={`Z: ${anomaly.zScore.toFixed(2)}`}
                        size="small"
                        color={getAnomalySeverityColor(anomaly.zScore)}
                      />
                    </Box>
                  </>
                }
              />
            </ListItem>
          </React.Fragment>
        ))}

        {/* Tampilkan jika kosong */}
        {filteredAnomalies.length === 0 && (
          <ListItem>
            <ListItemText
              primary="No anomalies found"
              secondary="No unusual patterns detected for the selected filters"
            />
          </ListItem>
        )}
      </List>
    </Paper>
  );
};

export default AnomalyList;
