"use client";

import { useState, useEffect } from "react";
import {
  Paper,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const DemandForecastChart = ({ data }) => {
  const [selectedItem, setSelectedItem] = useState("");
  const [chartData, setChartData] = useState([]);
  const [itemStats, setItemStats] = useState(null);

  useEffect(() => {
    if (data && data.items && data.items.length > 0) {
      setSelectedItem(data.items[0].id);
    }
  }, [data]);

  useEffect(() => {
    if (selectedItem !== null && data && Array.isArray(data.items)) {
      const item = data.items.find((item) => item.id === selectedItem);
      if (item) {
        const historical = item.historical_data.map((entry) => ({
          date: entry.date,
          actual: entry.quantity_out,
        }));

        const forecast = item.forecast_data.map((entry) => ({
          date: entry.date,
          forecast: entry.forecast,
        }));

        const allDates = [...historical, ...forecast];
        const merged = {};

        for (const entry of allDates) {
          if (!merged[entry.date]) {
            merged[entry.date] = { date: entry.date };
          }
          if (entry.actual !== undefined) {
            merged[entry.date].actual = entry.actual;
          }
          if (entry.forecast !== undefined) {
            merged[entry.date].forecast = entry.forecast;
          }
        }

        const mergedData = Object.values(merged);

        setChartData(mergedData);

        setItemStats({
          name: item.item_name,
          currentStock: item.current_stock,
          avgDailyDemand: item.avg_daily_demand,
          stdDevDemand: item.std_deviation,
          daysRemaining: item.days_remaining,
          totalForecastedDemand: item.total_forecast_demand,
        });
      }
    }
  }, [selectedItem, data]);

  const handleItemChange = (event) => {
    setSelectedItem(event.target.value);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h6" component="h2">
          Demand Forecast (30 Days)
        </Typography>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="item-select-label">Select Item</InputLabel>
          <Select
            labelId="item-select-label"
            id="item-select"
            value={selectedItem}
            label="Select Item"
            onChange={handleItemChange}
          >
            {data &&
              data.items &&
              data.items.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.name}
                </MenuItem>
              ))}
          </Select>
        </FormControl>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Grafik ini menampilkan data permintaan historis (garis ungu) dan hasil
        prediksi permintaan selama 30 hari ke depan (garis hijau putus-putus)
        berdasarkan metode *exponential smoothing*. Data diambil dari catatan
        transaksi keluar barang dalam 90 hari terakhir.
      </Typography>

      {itemStats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Stok Saat Ini
                </Typography>
                <Typography variant="h5" component="div">
                  {itemStats.currentStock} unit
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Rata-rata Permintaan Harian
                </Typography>
                <Typography variant="h5" component="div">
                  {itemStats.avgDailyDemand.toFixed(2)} unit
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Estimasi Hari Tersisa
                </Typography>
                <Typography variant="h5" component="div">
                  {itemStats.daysRemaining.toFixed(0)} hari
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Box sx={{ height: 400, mt: 3 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              interval="preserveStartEnd"
            />
            <YAxis />
            <Tooltip
              labelFormatter={(value) =>
                `Tanggal: ${new Date(value).toLocaleDateString()}`
              }
              formatter={(value, name) => [
                value,
                name === "actual" ? "Permintaan Aktual" : "Prediksi Permintaan",
              ]}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#8884d8"
              name="Aktual"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 8 }}
            />
            <Line
              type="monotone"
              dataKey="forecast"
              stroke="#82ca9d"
              name="Prediksi"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>

      {itemStats && (
        <Box sx={{ mt: 3 }}>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="body2" color="text.secondary">
            Prediksi menunjukkan total permintaan sekitar{" "}
            <strong>{itemStats.totalForecastedDemand} unit</strong> selama 30
            hari ke depan untuk <strong>{itemStats.name}</strong>. Variasi
            permintaan harian memiliki deviasi standar{" "}
            <strong>{itemStats.stdDevDemand.toFixed(2)} unit</strong>.
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default DemandForecastChart;
