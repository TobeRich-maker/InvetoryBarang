"use client";

import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import api from "../services/api";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { xs: "90%", sm: 500 },
  maxHeight: "90vh",
  overflow: "auto",
  bgcolor: "background.paper",
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

const ItemModal = ({ open, onClose, mode, item, categories, onSuccess }) => {
  const [formData, setFormData] = useState({
    kode_barang: "",
    nama_barang: "",
    kategori: "",
    stok: "",
    satuan: "",
    jumlah: "1", // For stock operations
    keterangan: "", // For stock operations
    tanggal: new Date().toISOString().split("T")[0], // For stock operations
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Set form data when item changes
  useEffect(() => {
    if (
      item &&
      (mode === "edit" || mode === "addStock" || mode === "removeStock")
    ) {
      setFormData((prev) => ({
        ...prev,
        kode_barang: item.kode_barang || "",
        nama_barang: item.nama_barang || "",
        kategori: item.kategori || "",
        stok: item.stok?.toString() || "",
        satuan: item.satuan || "",
      }));
    } else if (mode === "add") {
      // Reset form for add mode
      setFormData({
        kode_barang: "",
        nama_barang: "",
        kategori: "",
        stok: "0",
        satuan: "",
        jumlah: "1",
        keterangan: "",
        tanggal: new Date().toISOString().split("T")[0],
      });
    }
  }, [item, mode, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      let response;

      if (mode === "add") {
        // Add new item
        response = await api.post("/barang", {
          kode_barang: formData.kode_barang,
          nama_barang: formData.nama_barang,
          kategori: formData.kategori,
          stok: Number.parseInt(formData.stok, 10) || 0,
          satuan: formData.satuan,
        });

        setSuccess("Item added successfully!");
      } else if (mode === "edit") {
        // Edit existing item
        response = await api.put(`/barang/${item.id}`, {
          kode_barang: formData.kode_barang,
          nama_barang: formData.nama_barang,
          kategori: formData.kategori,
          stok: Number.parseInt(formData.stok, 10) || 0,
          satuan: formData.satuan,
        });

        setSuccess("Item updated successfully!");
      } else if (mode === "addStock" || mode === "removeStock") {
        // Add or remove stock
        const stockData = {
          barang_id: item.id,
          tipe: mode === "addStock" ? "masuk" : "keluar",
          jumlah: Number.parseInt(formData.jumlah, 10) || 1,
          keterangan:
            formData.keterangan ||
            (mode === "addStock" ? "Stock addition" : "Stock removal"),
          tanggal: formData.tanggal,
        };

        response = await api.post("/log-barang", stockData);

        setSuccess(
          mode === "addStock"
            ? `Added ${formData.jumlah} ${item.satuan} to inventory`
            : `Removed ${formData.jumlah} ${item.satuan} from inventory`
        );
      }

      // Call the success callback with the updated data
      if (onSuccess && response?.data) {
        onSuccess(response.data);
      }

      // Close modal after a short delay
      setTimeout(() => {
        if (!error) onClose();
      }, 1500);
    } catch (err) {
      console.error("Error in item operation:", err);
      setError(
        err.response?.data?.message ||
          (mode === "removeStock" && err.response?.status === 422
            ? "Not enough stock available"
            : "An error occurred. Please try again.")
      );
    } finally {
      setLoading(false);
    }
  };

  const getModalTitle = () => {
    switch (mode) {
      case "add":
        return "Add New Item";
      case "edit":
        return "Edit Item";
      case "addStock":
        return "Add Stock";
      case "removeStock":
        return "Remove Stock";
      default:
        return "Item Details";
    }
  };

  const getSubmitButtonText = () => {
    if (loading) {
      return mode === "add"
        ? "Adding..."
        : mode === "edit"
        ? "Saving..."
        : "Processing...";
    }
    switch (mode) {
      case "add":
        return "Add Item";
      case "edit":
        return "Save Changes";
      case "addStock":
        return "Add Stock";
      case "removeStock":
        return "Remove Stock";
      default:
        return "Submit";
    }
  };

  const getSubmitButtonIcon = () => {
    if (loading) return <CircularProgress size={20} />;
    switch (mode) {
      case "add":
        return <AddIcon />;
      case "edit":
        return <SaveIcon />;
      case "addStock":
        return <AddIcon />;
      case "removeStock":
        return <RemoveIcon />;
      default:
        return <SaveIcon />;
    }
  };

  return (
    <Modal
      open={open}
      onClose={loading ? null : onClose}
      aria-labelledby="item-modal-title"
    >
      <Box sx={modalStyle}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography id="item-modal-title" variant="h5" component="h2">
            {getModalTitle()}
          </Typography>
          <IconButton onClick={onClose} disabled={loading} aria-label="close">
            <CloseIcon />
          </IconButton>
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

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {/* Fields for Add and Edit modes */}
            {(mode === "add" || mode === "edit") && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Item Code"
                    name="kode_barang"
                    value={formData.kode_barang}
                    onChange={handleChange}
                    disabled={loading || mode === "edit"} // Can't edit code in edit mode
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Item Name"
                    name="nama_barang"
                    value={formData.nama_barang}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Barcode"
                    name="barcode"
                    value={formData.barcode || ""}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder="Enter item barcode"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    select
                    label="Category"
                    name="kategori"
                    value={formData.kategori}
                    onChange={handleChange}
                    disabled={loading}
                  >
                    <MenuItem value="">Select Category</MenuItem>
                    {categories.map((category, index) => (
                      <MenuItem key={index} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    type="number"
                    label="Stock"
                    name="stok"
                    value={formData.stok}
                    onChange={handleChange}
                    disabled={loading}
                    InputProps={{ inputProps: { min: 0 } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Unit"
                    name="satuan"
                    value={formData.satuan}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder="e.g., pcs, box, kg"
                  />
                </Grid>
              </>
            )}

            {/* Fields for Stock Operations */}
            {(mode === "addStock" || mode === "removeStock") && (
              <>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    {item?.nama_barang} - Current Stock: {item?.stok}{" "}
                    {item?.satuan}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    type="number"
                    label={`Quantity to ${
                      mode === "addStock" ? "Add" : "Remove"
                    }`}
                    name="jumlah"
                    value={formData.jumlah}
                    onChange={handleChange}
                    disabled={loading}
                    InputProps={{
                      inputProps: {
                        min: 1,
                        max: mode === "removeStock" ? item?.stok : undefined,
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Date"
                    type="date"
                    name="tanggal"
                    value={formData.tanggal}
                    onChange={handleChange}
                    disabled={loading}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Notes"
                    name="keterangan"
                    value={formData.keterangan}
                    onChange={handleChange}
                    disabled={loading}
                    multiline
                    rows={2}
                    placeholder={`Notes about this ${
                      mode === "addStock" ? "addition" : "removal"
                    }`}
                  />
                </Grid>
              </>
            )}

            <Grid item xs={12} sx={{ mt: 2 }}>
              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
                <Button variant="outlined" onClick={onClose} disabled={loading}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  startIcon={getSubmitButtonIcon()}
                  color={mode === "removeStock" ? "error" : "primary"}
                >
                  {getSubmitButtonText()}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Box>
    </Modal>
  );
};

export default ItemModal;
