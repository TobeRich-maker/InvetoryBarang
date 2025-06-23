"use client";

import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import api from "../services/api";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import BlockIcon from "@mui/icons-material/Block";

const AddItemPage = () => {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    kode_barang: "",
    nama_barang: "",
    kategori: "",
    stok: "",
    satuan: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Check if user has permission to add items
  const canAddItems =
    currentUser?.role?.name === "admin" || currentUser?.role?.name === "staff";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!canAddItems) {
      setError("You do not have permission to add items.");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      // Validate stock is a number
      const stockValue = Number.parseInt(formData.stok);
      if (isNaN(stockValue) || stockValue < 0) {
        throw new Error("Stock must be a positive number");
      }

      // Format the data
      const itemData = {
        ...formData,
        stok: stockValue,
      };

      // Submit to API
      await api.post("/barang", itemData);

      // Also create a log entry for the initial stock
      if (stockValue > 0) {
        await api.post("/log-barang", {
          barang_id: 1, // This will be replaced by the actual ID from the response
          tipe: "masuk",
          jumlah: stockValue,
          keterangan: "Initial stock",
          tanggal: new Date().toISOString().split("T")[0],
        });
      }

      setSuccess("Item added successfully!");

      // Reset form
      setFormData({
        kode_barang: "",
        nama_barang: "",
        kategori: "",
        stok: "",
        satuan: "",
      });

      // Redirect after a short delay
      setTimeout(() => {
        navigate("/items");
      }, 2000);
    } catch (err) {
      console.error("Error adding item:", err);
      setError(err.message || "Failed to add item. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!canAddItems) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "70vh",
        }}
      >
        <Card sx={{ maxWidth: 500, width: "100%" }}>
          <CardHeader
            title="Access Denied"
            titleTypographyProps={{ color: "error" }}
          />
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <BlockIcon color="error" sx={{ mr: 1 }} />
              <Typography variant="body1">
                You do not have permission to add inventory items.
              </Typography>
            </Box>
          </CardContent>
          <CardActions>
            <Button variant="contained" onClick={() => navigate("/dashboard")}>
              Back to Dashboard
            </Button>
          </CardActions>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: "auto" }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Add New Item
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Add a new item to your inventory
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader title="Item Details" />
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="kode_barang"
                  name="kode_barang"
                  label="Item Code"
                  value={formData.kode_barang}
                  onChange={handleChange}
                  placeholder="Enter unique item code"
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="nama_barang"
                  name="nama_barang"
                  label="Item Name"
                  value={formData.nama_barang}
                  onChange={handleChange}
                  placeholder="Enter item name"
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="kategori"
                  name="kategori"
                  label="Category"
                  value={formData.kategori}
                  onChange={handleChange}
                  placeholder="Enter category"
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="stok"
                  name="stok"
                  label="Initial Stock"
                  type="number"
                  value={formData.stok}
                  onChange={handleChange}
                  placeholder="Enter quantity"
                  variant="outlined"
                  InputProps={{ inputProps: { min: 0 } }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="satuan"
                  name="satuan"
                  label="Unit"
                  value={formData.satuan}
                  onChange={handleChange}
                  placeholder="e.g., pcs, box, kg"
                  variant="outlined"
                />
              </Grid>
            </Grid>
          </CardContent>
          <CardActions sx={{ justifyContent: "flex-end", p: 2 }}>
            <Button
              variant="outlined"
              onClick={() => navigate("/items")}
              startIcon={<CancelIcon />}
              sx={{ mr: 1 }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isLoading}
              startIcon={
                isLoading ? <CircularProgress size={20} /> : <SaveIcon />
              }
            >
              {isLoading ? "Adding..." : "Add Item"}
            </Button>
          </CardActions>
        </form>
      </Card>
    </Box>
  );
};

export default AddItemPage;
