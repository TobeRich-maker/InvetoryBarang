"use client";

import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import api from "../services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Pagination from "@mui/material/Pagination";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import TableChartIcon from "@mui/icons-material/TableChart";
import BarChartIcon from "@mui/icons-material/BarChart";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import ItemModal from "../components/ItemModal";

const ItemsPage = () => {
  const { currentUser } = useContext(AuthContext);
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("table"); // 'table' or 'chart'
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add", "edit", "addStock", "removeStock"
  const [selectedItem, setSelectedItem] = useState(null);

  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });

  // Filter state
  const [filters, setFilters] = useState({
    search: "",
    kategori: "",
    min_stok: "",
    max_stok: "",
    sort_by: "created_at",
    sort_direction: "desc",
  });

  // Check if user has permission to add/edit items
  const canManageItems =
    currentUser?.role?.name === "admin" || currentUser?.role?.name === "staff";

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setIsLoading(true);

        // Build query string from filters
        const queryParams = new URLSearchParams();

        if (filters.search) queryParams.append("search", filters.search);
        if (filters.kategori) queryParams.append("kategori", filters.kategori);
        if (filters.min_stok) queryParams.append("min_stok", filters.min_stok);
        if (filters.max_stok) queryParams.append("max_stok", filters.max_stok);

        queryParams.append("sort_by", filters.sort_by);
        queryParams.append("sort_direction", filters.sort_direction);
        queryParams.append("page", pagination.currentPage);

        // Fetch items with filters
        const response = await api.get(`/barang?${queryParams.toString()}`);

        setItems(response.data.data);
        setPagination({
          currentPage: response.data.pagination.current_page,
          totalPages: response.data.pagination.last_page,
          totalItems: response.data.pagination.total,
        });

        // Set categories for filter dropdown
        if (response.data.filters && response.data.filters.categories) {
          setCategories(response.data.filters.categories);
        }
      } catch (err) {
        console.error("Error fetching items:", err);
        setError("Failed to load items. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchItems();
  }, [filters, pagination.currentPage]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
    // Reset to first page when filters change
    setPagination({
      ...pagination,
      currentPage: 1,
    });
  };

  const handlePageChange = (event, newPage) => {
    setPagination({
      ...pagination,
      currentPage: newPage,
    });
  };

  const handleSortChange = (field) => {
    // If clicking the same field, toggle direction
    const newDirection =
      filters.sort_by === field && filters.sort_direction === "asc"
        ? "desc"
        : "asc";

    setFilters({
      ...filters,
      sort_by: field,
      sort_direction: newDirection,
    });
  };

  const handleViewModeChange = (event, newMode) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  // Prepare data for the bar chart
  const prepareChartData = () => {
    // Create a copy of the items array to avoid direct state mutation
    const itemsCopy = [...items];

    // Sort items by stock in descending order and take top 10 for better visualization
    return itemsCopy
      .sort((a, b) => b.stok - a.stok)
      .slice(0, 10)
      .map((item) => ({
        name:
          item.nama_barang.length > 15
            ? item.nama_barang.substring(0, 15) + "..."
            : item.nama_barang,
        stock: item.stok,
        category: item.kategori,
      }));
  };

  const getStockChipColor = (stock) => {
    if (stock < 10) return "error";
    if (stock < 50) return "warning";
    return "success";
  };

  const handleOpenModal = (mode, item = null) => {
    setModalMode(mode);
    setSelectedItem(item);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    // Reset after a short delay to avoid UI flicker
    setTimeout(() => {
      setSelectedItem(null);
      setModalMode("add");
    }, 300);
  };

  const handleModalSuccess = (updatedData) => {
    // Refresh the items list
    const queryParams = new URLSearchParams();
    if (filters.search) queryParams.append("search", filters.search);
    if (filters.kategori) queryParams.append("kategori", filters.kategori);
    if (filters.min_stok) queryParams.append("min_stok", filters.min_stok);
    if (filters.max_stok) queryParams.append("max_stok", filters.max_stok);
    queryParams.append("sort_by", filters.sort_by);
    queryParams.append("sort_direction", filters.sort_direction);
    queryParams.append("page", pagination.currentPage);

    api
      .get(`/barang?${queryParams.toString()}`)
      .then((response) => {
        setItems(response.data.data);
        setPagination({
          currentPage: response.data.pagination.current_page,
          totalPages: response.data.pagination.last_page,
          totalItems: response.data.pagination.total,
        });
        if (response.data.filters && response.data.filters.categories) {
          setCategories(response.data.filters.categories);
        }
      })
      .catch((err) => {
        console.error("Error refreshing items:", err);
        setError("Failed to refresh items. Please try again later.");
      });
  };

  if (isLoading && items.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          flexWrap: "wrap",
          gap: 2,
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

        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          {canManageItems && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleOpenModal("add")}
              startIcon={<AddCircleIcon />}
            >
              Add New Item
            </Button>
          )}

          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewModeChange}
            aria-label="view mode"
            size="small"
          >
            <ToggleButton value="table" aria-label="table view">
              <TableChartIcon />
            </ToggleButton>
            <ToggleButton value="chart" aria-label="chart view">
              <BarChartIcon />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardHeader title="Filters" />
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Search"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Search items..."
                variant="outlined"
                size="small"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                select
                label="Category"
                name="kategori"
                value={filters.kategori}
                onChange={handleFilterChange}
                variant="outlined"
                size="small"
              >
                <MenuItem value="">All Categories</MenuItem>
                {categories.map((category, index) => (
                  <MenuItem key={index} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <TextField
                  label="Min Stock"
                  name="min_stok"
                  type="number"
                  value={filters.min_stok}
                  onChange={handleFilterChange}
                  variant="outlined"
                  size="small"
                  InputProps={{ inputProps: { min: 0 } }}
                />
                <Typography variant="body2">to</Typography>
                <TextField
                  label="Max Stock"
                  name="max_stok"
                  type="number"
                  value={filters.max_stok}
                  onChange={handleFilterChange}
                  variant="outlined"
                  size="small"
                  InputProps={{ inputProps: { min: 0 } }}
                />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {viewMode === "chart" ? (
        <Card>
          <CardHeader title="Top 10 Items by Stock Level" />
          <CardContent>
            <Box sx={{ height: 400, width: "100%" }}>
              <ResponsiveContainer>
                <BarChart
                  data={prepareChartData()}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 60,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip
                    formatter={(value, name, props) => [value, "Stock"]}
                    labelFormatter={(label) => `Item: ${label}`}
                  />
                  <Legend />
                  <Bar dataKey="stock" fill="#4f46e5" name="Stock Level" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <TableContainer>
            <Table aria-label="inventory items table">
              <TableHead>
                <TableRow>
                  <TableCell>
                    <TableSortLabel
                      active={filters.sort_by === "kode_barang"}
                      direction={filters.sort_direction}
                      onClick={() => handleSortChange("kode_barang")}
                    >
                      Code
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={filters.sort_by === "nama_barang"}
                      direction={filters.sort_direction}
                      onClick={() => handleSortChange("nama_barang")}
                    >
                      Name
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={filters.sort_by === "kategori"}
                      direction={filters.sort_direction}
                      onClick={() => handleSortChange("kategori")}
                    >
                      Category
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="center">
                    <TableSortLabel
                      active={filters.sort_by === "stok"}
                      direction={filters.sort_direction}
                      onClick={() => handleSortChange("stok")}
                    >
                      Stock
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Unit</TableCell>
                  {canManageItems && (
                    <TableCell align="center">Actions</TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {items.length > 0 ? (
                  items.map((item) => (
                    <TableRow
                      key={item.id}
                      sx={{
                        backgroundColor:
                          item.stok < 10 ? "error.lightest" : "inherit",
                        "&:hover": { backgroundColor: "action.hover" },
                      }}
                    >
                      <TableCell>{item.kode_barang}</TableCell>
                      <TableCell>{item.nama_barang}</TableCell>
                      <TableCell>{item.kategori}</TableCell>
                      <TableCell align="center">
                        <Chip
                          label={item.stok}
                          color={getStockChipColor(item.stok)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{item.satuan}</TableCell>
                      {canManageItems && (
                        <TableCell align="center">
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "center",
                              gap: 1,
                            }}
                          >
                            <IconButton
                              size="small"
                              color="primary"
                              title="Edit Item"
                              onClick={() => handleOpenModal("edit", item)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="success"
                              title="Add Stock"
                              onClick={() => handleOpenModal("addStock", item)}
                            >
                              <AddIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              title="Remove Stock"
                              onClick={() =>
                                handleOpenModal("removeStock", item)
                              }
                            >
                              <RemoveIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={canManageItems ? 6 : 5}
                      align="center"
                      sx={{ py: 3 }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        No items found matching your filters.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {pagination.totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
              <Pagination
                count={pagination.totalPages}
                page={pagination.currentPage}
                onChange={handlePageChange}
                color="primary"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </Card>
      )}
      <ItemModal
        open={modalOpen}
        onClose={handleCloseModal}
        mode={modalMode}
        item={selectedItem}
        categories={categories}
        onSuccess={handleModalSuccess}
      />
    </Box>
  );
};

export default ItemsPage;
