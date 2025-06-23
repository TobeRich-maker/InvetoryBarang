"use client";

import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import Snackbar from "@mui/material/Snackbar";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

// Icons
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import FileDownloadIcon from "@mui/icons-material/FileDownload";

import BarcodeScanner from "../components/BarcodeScanner";
import ExportDialog from "../components/ExportDialog";
import api from "../services/api";

const GoodsOutPage = () => {
  const { currentUser } = useContext(AuthContext);
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [barcodeError, setBarcodeError] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [confirmDialog, setConfirmDialog] = useState({ open: false });
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  // Check if user has permissions
  const canManageTransactions =
    currentUser?.role?.name === "admin" || currentUser?.role?.name === "staff";
  const canExport =
    currentUser?.role?.name === "admin" || currentUser?.role?.name === "staff";

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const response = await api.get("/barang");
        setItems(response.data.data);
      } catch (err) {
        console.error("Error fetching items:", err);
        setSnackbar({
          open: true,
          message: "Failed to load items. Please refresh the page.",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  const handleBarcodeScanned = async (barcode) => {
    try {
      setBarcodeError("");
      setLoading(true);

      const response = await api.get(`/barcode/${barcode}`);
      const item = response.data;

      // Check if item is in stock
      if (item.stok <= 0) {
        setBarcodeError(`Item "${item.nama_barang}" is out of stock.`);
        return;
      }

      // Check if item is already in cart
      const existingItemIndex = cartItems.findIndex(
        (cartItem) => cartItem.id === item.id
      );

      if (existingItemIndex >= 0) {
        // Update quantity of existing item
        const updatedCart = [...cartItems];
        updatedCart[existingItemIndex].quantity += 1;
        setCartItems(updatedCart);
      } else {
        // Add new item to cart
        setCartItems([
          ...cartItems,
          {
            id: item.id,
            kode_barang: item.kode_barang,
            nama_barang: item.nama_barang,
            satuan: item.satuan,
            harga: item.harga || 0,
            quantity: 1,
            stock: item.stok,
          },
        ]);
      }

      setSnackbar({
        open: true,
        message: `Added ${item.nama_barang} to cart`,
        severity: "success",
      });
    } catch (err) {
      console.error("Barcode scan error:", err);
      setBarcodeError(`Barcode "${barcode}" not found in the system.`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!selectedItem) return;

    const item = items.find(
      (item) => item.id === Number.parseInt(selectedItem)
    );

    if (!item) return;

    // Check if quantity is valid
    if (quantity <= 0) {
      setSnackbar({
        open: true,
        message: "Please enter a valid quantity.",
        severity: "error",
      });
      return;
    }

    // Check if item has enough stock
    if (quantity > item.stok) {
      setSnackbar({
        open: true,
        message: `Not enough stock. Available: ${item.stok} ${item.satuan}`,
        severity: "error",
      });
      return;
    }

    // Check if item is already in cart
    const existingItemIndex = cartItems.findIndex(
      (cartItem) => cartItem.id === item.id
    );

    if (existingItemIndex >= 0) {
      // Update quantity of existing item
      const updatedCart = [...cartItems];
      updatedCart[existingItemIndex].quantity += quantity;

      // Check if updated quantity exceeds stock
      if (updatedCart[existingItemIndex].quantity > item.stok) {
        setSnackbar({
          open: true,
          message: `Cannot add more than available stock (${item.stok} ${item.satuan})`,
          severity: "error",
        });
        return;
      }

      setCartItems(updatedCart);
    } else {
      // Add new item to cart
      setCartItems([
        ...cartItems,
        {
          id: item.id,
          kode_barang: item.kode_barang,
          nama_barang: item.nama_barang,
          satuan: item.satuan,
          harga: item.harga || 0,
          quantity: quantity,
          stock: item.stok,
        },
      ]);
    }

    // Reset form
    setSelectedItem("");
    setQuantity(1);

    setSnackbar({
      open: true,
      message: `Added ${item.nama_barang} to cart`,
      severity: "success",
    });
  };

  const handleQuantityChange = (itemId, amount) => {
    const updatedCart = cartItems.map((item) => {
      if (item.id === itemId) {
        const newQuantity = item.quantity + amount;
        // Ensure quantity is at least 1 and doesn't exceed stock
        if (newQuantity >= 1 && newQuantity <= item.stock) {
          return { ...item, quantity: newQuantity };
        }
      }
      return item;
    });

    setCartItems(updatedCart);
  };

  const handleRemoveItem = (itemId) => {
    setCartItems(cartItems.filter((item) => item.id !== itemId));
  };

  const calculateTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.quantity * item.harga,
      0
    );
  };

  const handleSubmitTransaction = async () => {
    if (cartItems.length === 0) {
      setSnackbar({
        open: true,
        message: "Please add items to the cart before submitting.",
        severity: "error",
      });
      return;
    }

    setConfirmDialog({
      open: true,
      title: "Confirm Transaction",
      content:
        "Are you sure you want to process this transaction? This will reduce stock levels.",
      onConfirm: processTransaction,
    });
  };

  const processTransaction = async () => {
    setConfirmDialog({ open: false });
    setSubmitLoading(true);

    try {
      // Process each item in the cart
      for (const item of cartItems) {
        await api.post("/log-barang", {
          barang_id: item.id,
          tipe: "keluar",
          jumlah: item.quantity,
          keterangan: notes || "Goods out transaction",
          tanggal: new Date().toISOString().split("T")[0],
        });
      }

      // Clear cart
      setCartItems([]);
      setNotes("");

      setSnackbar({
        open: true,
        message: "Transaction processed successfully!",
        severity: "success",
      });

      // Refresh items to get updated stock levels
      const response = await api.get("/barang");
      setItems(response.data.data);
    } catch (err) {
      console.error("Transaction error:", err);
      setSnackbar({
        open: true,
        message: "Failed to process transaction. Please try again.",
        severity: "error",
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
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
            Goods Out / Sales
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Process outgoing inventory transactions
          </Typography>
        </Box>

        {canExport && (
          <Button
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            onClick={() => setExportDialogOpen(true)}
          >
            Export Transactions
          </Button>
        )}
      </Box>

      {!canManageTransactions ? (
        <Alert severity="warning" sx={{ mb: 3 }}>
          You do not have permission to process transactions.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <Card>
              <CardHeader title="Select Items" />
              <CardContent>
                {barcodeError && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {barcodeError}
                  </Alert>
                )}

                <Box sx={{ mb: 3 }}>
                  <BarcodeScanner onBarcodeScanned={handleBarcodeScanned} />
                </Box>

                <Typography variant="subtitle2" sx={{ mb: 2 }}>
                  Or add items manually:
                </Typography>

                <Grid container spacing={2} alignItems="flex-end">
                  <Grid item xs={12} md={5}>
                    <TextField
                      select
                      fullWidth
                      label="Select Item"
                      value={selectedItem}
                      onChange={(e) => setSelectedItem(e.target.value)}
                      disabled={loading}
                    >
                      <MenuItem value="">Select an item</MenuItem>
                      {items.map((item) => (
                        <MenuItem
                          key={item.id}
                          value={item.id}
                          disabled={item.stok <= 0}
                        >
                          {item.nama_barang} ({item.stok} {item.satuan}{" "}
                          available)
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid item xs={12} sm={4} md={3}>
                    <TextField
                      type="number"
                      label="Quantity"
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(Number.parseInt(e.target.value) || 0)
                      }
                      inputProps={{ min: 1 }}
                      disabled={loading || !selectedItem}
                      fullWidth
                    />
                  </Grid>

                  <Grid item xs={12} sm={8} md={4}>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={handleAddToCart}
                      disabled={loading || !selectedItem || quantity <= 0}
                      fullWidth
                    >
                      Add to Cart
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Card sx={{ mt: 3 }}>
              <CardHeader title="Transaction Notes" />
              <CardContent>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Notes"
                  placeholder="Enter notes about this transaction"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={5}>
            <Card>
              <CardHeader
                title="Transaction Cart"
                subheader={`${cartItems.length} unique items`}
              />
              <CardContent>
                {cartItems.length === 0 ? (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ textAlign: "center", py: 4 }}
                  >
                    No items in cart yet. Scan a barcode or add items manually.
                  </Typography>
                ) : (
                  <TableContainer component={Paper} sx={{ mb: 3 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Item</TableCell>
                          <TableCell align="center">Quantity</TableCell>
                          <TableCell align="right">Unit Price</TableCell>
                          <TableCell align="right">Total</TableCell>
                          <TableCell></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {cartItems.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              <Typography
                                variant="body2"
                                noWrap
                                sx={{ maxWidth: 150 }}
                              >
                                {item.nama_barang}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                display="block"
                              >
                                {item.kode_barang}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  gap: 0.5,
                                }}
                              >
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    handleQuantityChange(item.id, -1)
                                  }
                                  disabled={item.quantity <= 1}
                                >
                                  <RemoveIcon fontSize="small" />
                                </IconButton>
                                <Typography>
                                  {item.quantity} {item.satuan}
                                </Typography>
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    handleQuantityChange(item.id, 1)
                                  }
                                  disabled={item.quantity >= item.stock}
                                >
                                  <AddIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            </TableCell>
                            <TableCell align="right">
                              {item.harga.toLocaleString()}
                            </TableCell>
                            <TableCell align="right">
                              {(item.quantity * item.harga).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <IconButton
                                size="small"
                                onClick={() => handleRemoveItem(item.id)}
                                color="error"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Typography variant="subtitle1">Total:</Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {calculateTotal().toLocaleString()}
                  </Typography>
                </Box>

                <Button
                  variant="contained"
                  color="primary"
                  startIcon={
                    submitLoading ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <SaveIcon />
                    )
                  }
                  disabled={cartItems.length === 0 || submitLoading}
                  fullWidth
                  size="large"
                  onClick={handleSubmitTransaction}
                >
                  {submitLoading ? "Processing..." : "Process Transaction"}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Export Dialog */}
      <ExportDialog
        open={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
        type="transactions"
      />

      {/* Snackbar for messages */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false })}
      >
        <DialogTitle>{confirmDialog.title}</DialogTitle>
        <DialogContent>
          <DialogContentText>{confirmDialog.content}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConfirmDialog({ open: false })}
            disabled={submitLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmDialog.onConfirm}
            variant="contained"
            color="primary"
            disabled={submitLoading}
            startIcon={submitLoading ? <CircularProgress size={20} /> : null}
          >
            {submitLoading ? "Processing..." : "Confirm"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GoodsOutPage;
