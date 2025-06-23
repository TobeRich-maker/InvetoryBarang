"use client";

import { useState } from "react";
import {
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
} from "@mui/material";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const MovementClassification = ({ data }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [categoryFilter, setCategoryFilter] = useState("all");

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCategoryFilterChange = (event) => {
    setCategoryFilter(event.target.value);
    setPage(0);
  };

  const getMovementChip = (classification) => {
    switch (classification) {
      case "Fast Moving":
        return <Chip label={classification} color="success" size="small" />;
      case "Medium Moving":
        return <Chip label={classification} color="primary" size="small" />;
      case "Slow Moving":
        return <Chip label={classification} color="warning" size="small" />;
      case "Dead Stock":
        return <Chip label={classification} color="error" size="small" />;
      default:
        return <Chip label={classification} size="small" />;
    }
  };

  const filteredItems = data.items.filter((item) => {
    return categoryFilter === "all" || item.classification === categoryFilter;
  });

  const paginatedItems = filteredItems.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Colors for pie chart
  const COLORS = ["#4caf50", "#2196f3", "#ff9800", "#f44336"];

  // Prepare data for pie chart
  const pieData = [
    { name: "Fast Moving", value: data.summary.fastMovingCount },
    { name: "Medium Moving", value: data.summary.mediumMovingCount },
    { name: "Slow Moving", value: data.summary.slowMovingCount },
    { name: "Dead Stock", value: data.summary.deadStockCount },
  ];

  const scatterData = data.items
    .filter(
      (item) => item.transactionFrequency > 0 && item.transactionVolume > 0
    )
    .map((item) => ({
      x: item.transactionFrequency,
      y: item.transactionVolume,
      z: 10,
      name: item.name,
      classification: item.classification,
    }));

  // Group scatter data by classification
  const fastMoving = scatterData.filter(
    (item) => item.classification === "Fast Moving"
  );
  const mediumMoving = scatterData.filter(
    (item) => item.classification === "Medium Moving"
  );
  const slowMoving = scatterData.filter(
    (item) => item.classification === "Slow Moving"
  );
  const deadStock = scatterData.filter(
    (item) => item.classification === "Dead Stock"
  );

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            backgroundColor: "#fff",
            padding: "10px",
            border: "1px solid #ccc",
          }}
        >
          <p style={{ margin: 0 }}>
            <strong>{payload[0].payload.name}</strong>
          </p>
          <p style={{ margin: 0 }}>Frequency: {payload[0].payload.x}</p>
          <p style={{ margin: 0 }}>Volume: {payload[0].payload.y}</p>
          <p style={{ margin: 0 }}>
            Classification: {payload[0].payload.classification}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" component="h2" gutterBottom>
        Item Movement Classification
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={5}>
          <Card variant="outlined" sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Distribution by Movement Class
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={7}>
          <Card variant="outlined" sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Transaction Frequency vs. Volume
              </Typography>
              <Box sx={{ height: 300 }}>
                {scatterData.length === 0 ? (
                  <Box
                    sx={{
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "gray",
                    }}
                  >
                    <Typography variant="body2">
                      Tidak ada data transaksi yang dapat ditampilkan.
                    </Typography>
                  </Box>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart
                      margin={{
                        top: 20,
                        right: 20,
                        bottom: 20,
                        left: 20,
                      }}
                    >
                      <CartesianGrid />
                      <XAxis
                        type="number"
                        dataKey="x"
                        name="Frequency"
                        unit=" txns"
                      />
                      <YAxis
                        type="number"
                        dataKey="y"
                        name="Volume"
                        unit=" units"
                      />
                      <ZAxis type="number" dataKey="z" range={[60, 400]} />
                      <Tooltip
                        cursor={{ strokeDasharray: "3 3" }}
                        content={<CustomTooltip />}
                      />
                      <Legend />
                      <Scatter
                        name="Fast Moving"
                        data={fastMoving}
                        fill="#4caf50"
                      />
                      <Scatter
                        name="Medium Moving"
                        data={mediumMoving}
                        fill="#2196f3"
                      />
                      <Scatter
                        name="Slow Moving"
                        data={slowMoving}
                        fill="#ff9800"
                      />
                      <Scatter
                        name="Dead Stock"
                        data={deadStock}
                        fill="#f44336"
                      />
                    </ScatterChart>
                  </ResponsiveContainer>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="subtitle1">
            Item Classification Details
          </Typography>
          <FormControl sx={{ minWidth: 200 }} size="small">
            <InputLabel id="category-filter-label">Filter by Class</InputLabel>
            <Select
              labelId="category-filter-label"
              id="category-filter"
              value={categoryFilter}
              label="Filter by Class"
              onChange={handleCategoryFilterChange}
            >
              <MenuItem value="all">All Classes</MenuItem>
              <MenuItem value="Fast Moving">Fast Moving</MenuItem>
              <MenuItem value="Medium Moving">Medium Moving</MenuItem>
              <MenuItem value="Slow Moving">Slow Moving</MenuItem>
              <MenuItem value="Dead Stock">Dead Stock</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <TableContainer>
          <Table sx={{ minWidth: 650 }} aria-label="item classification table">
            <TableHead>
              <TableRow>
                <TableCell>Item Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell align="right">Transaction Frequency</TableCell>
                <TableCell align="right">Transaction Volume</TableCell>
                <TableCell align="right">Days Since Last Transaction</TableCell>
                <TableCell>Classification</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedItems.map((item) => (
                <TableRow
                  key={item.id}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {item.name}
                  </TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell align="right">
                    {item.transactionFrequency}
                  </TableCell>
                  <TableCell align="right">{item.transactionVolume}</TableCell>
                  <TableCell align="right">
                    {item.daysSinceLastTransaction}
                  </TableCell>
                  <TableCell>{getMovementChip(item.classification)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredItems.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Box>
    </Paper>
  );
};

export default MovementClassification;
