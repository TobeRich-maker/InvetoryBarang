"use client";

import { useState } from "react";
import {
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Search, Warning, Info, CheckCircle } from "@mui/icons-material";

const ProcurementTable = ({ data }) => {
  // State untuk pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // State untuk fitur pencarian dan filter
  const [searchTerm, setSearchTerm] = useState("");
  const [urgencyFilter, setUrgencyFilter] = useState("all");

  // Fungsi pagination
  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Fungsi input pencarian & filter urgensi
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };
  const handleUrgencyFilterChange = (event) => {
    setUrgencyFilter(event.target.value);
    setPage(0);
  };

  // Komponen visual untuk menampilkan tingkat urgensi
  const getUrgencyChip = (urgency) => {
    switch (urgency) {
      case "high":
        return (
          <Chip icon={<Warning />} label="High" color="error" size="small" />
        );
      case "medium":
        return (
          <Chip icon={<Info />} label="Medium" color="warning" size="small" />
        );
      case "low":
        return (
          <Chip
            icon={<CheckCircle />}
            label="Low"
            color="success"
            size="small"
          />
        );
      default:
        return <Chip label={urgency} size="small" />;
    }
  };

  // ✨ 1. Transformasi data dari backend (snake_case → camelCase)
  const mappedItems = data.items.map((item) => ({
    id: item.item_id,
    name: item.item_name,
    category: item.category,
    currentStock: item.current_stock,
    forecastedNeed: item.forecast_30_days,
    recommendedPurchase: item.recommended_purchase,
    urgency: item.urgency,
  }));

  // ✨ 2. Filtering berdasarkan input pengguna (search dan urgency)
  const filteredItems = mappedItems.filter((item) => {
    const name = item.name?.toLowerCase() ?? "";
    const category = item.category?.toLowerCase() ?? "";
    const matchesSearch =
      name.includes(searchTerm.toLowerCase()) ||
      category.includes(searchTerm.toLowerCase());
    const matchesUrgency =
      urgencyFilter === "all" || item.urgency === urgencyFilter;

    return matchesSearch && matchesUrgency;
  });

  // ✨ 3. Pagination hasil filter
  const paginatedItems = filteredItems.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Paper sx={{ p: 3 }}>
      {/* ✨ Penjelasan tentang tabel */}
      <Box
        sx={{
          mb: 3,
          p: 2,
          borderRadius: 2,
          bgcolor: "#f9fbe7",
          border: "1px solid #e6ee9c",
        }}
      >
        <Typography
          variant="subtitle1"
          gutterBottom
          sx={{ fontWeight: 600, color: "#827717" }}
        >
          📦 Apa yang Anda Lihat di Sini?
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Tabel <strong>rekomendasi pembelian</strong> ini menampilkan barang
          yang perlu dipertimbangkan untuk dipesan ulang dalam 30 hari ke depan.
        </Typography>
        <Typography variant="body2" sx={{ color: "#827717", fontWeight: 500 }}>
          Dihitung berdasarkan:
        </Typography>
        <ul
          style={{
            paddingLeft: "1.25rem",
            marginTop: 4,
            marginBottom: 0,
            color: "#616161",
          }}
        >
          <li>
            <strong>Stok saat ini</strong>
          </li>
          <li>
            <strong>Prediksi permintaan</strong> 30 hari ke depan
          </li>
          <li>
            <strong>Stok pengaman</strong> untuk menghindari kehabisan
          </li>
        </ul>
      </Box>

      {/* ✨ Search & Filter UI */}
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <TextField
          label="Search items"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{ flexGrow: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
        <FormControl sx={{ minWidth: 150 }} size="small">
          <InputLabel id="urgency-filter-label">Urgency</InputLabel>
          <Select
            labelId="urgency-filter-label"
            id="urgency-filter"
            value={urgencyFilter}
            label="Urgency"
            onChange={handleUrgencyFilterChange}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="high">High</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="low">Low</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* ✨ Tabel utama */}
      <TableContainer>
        <Table sx={{ minWidth: 650 }} aria-label="procurement table">
          <TableHead>
            <TableRow>
              <TableCell>Item Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell align="right">Current Stock</TableCell>
              <TableCell align="right">Forecasted Need (30 days)</TableCell>
              <TableCell align="right">Recommended Purchase</TableCell>
              <TableCell>Urgency</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell align="right">{item.currentStock}</TableCell>
                <TableCell align="right">{item.forecastedNeed}</TableCell>
                <TableCell align="right">{item.recommendedPurchase}</TableCell>
                <TableCell>{getUrgencyChip(item.urgency)}</TableCell>
              </TableRow>
            ))}
            {paginatedItems.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Tidak ada data yang sesuai dengan filter kamu 🙁
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ✨ Pagination UI */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredItems.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

export default ProcurementTable;
