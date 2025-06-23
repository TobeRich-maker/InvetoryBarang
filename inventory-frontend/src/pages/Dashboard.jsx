"use client";

import { useState, useEffect, useContext } from "react";
import { Link as RouterLink } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import api from "../services/api";
import {
  PieChart,
  Pie,
  Cell,
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
import Alert from "@mui/material/Alert";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";
import ItemModal from "../components/ItemModal";

import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import InventoryIcon from "@mui/icons-material/Inventory";
import CategoryIcon from "@mui/icons-material/Category";
import WarningIcon from "@mui/icons-material/Warning";
import AuthDebugger from "../components/AuthDebugger";

const Dashboard = () => {
  const { currentUser } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalItems: 0,
    totalCategories: 0,
    lowStockItems: 0,
    recentActivity: [],
  });
  const [categoryData, setCategoryData] = useState([]);
  const [stockData, setStockData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDebugger, setShowDebugger] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedItem, setSelectedItem] = useState(null);

  const COLORS = [
    "#6E5849",
    "#A4997D",
    "#90A19D",
    "#E0C097",
    "#D9CAB3",
    "#B5BFA1",
    "#ACD8AA",
    "#F1E3D3",
  ];

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const items = (await api.get("/barang")).data.data || [];
      const categories = (await api.get("/categories")).data || [];
      const stockSummary =
        (await api.get("/categories/stock-summary")).data || [];
      const categoryChartData = stockSummary.map((c) => ({
        name: c.kategori || "Uncategorized",
        value: c.item_count,
      }));
      const stockChartData = stockSummary.map((c) => ({
        name: c.kategori || "Uncategorized",
        stock: c.total_stock,
      }));
      const recentLogs =
        (await api.get("/log-barang?per_page=5")).data.data || [];
      const lowStock = items.filter((i) => i.stok < 10).length;
      setCategoryData(categoryChartData);
      setStockData(stockChartData);
      setStats({
        totalItems: items.length,
        totalCategories: categories.length,
        lowStockItems: lowStock,
        recentActivity: recentLogs,
      });
    } catch (err) {
      setError(
        `Failed to load dashboard data: ${
          err.response?.data?.message || err.message
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            bgcolor: "background.paper",
            p: 1.5,
            border: "1px solid #f0f0f0",
            borderRadius: 1,
          }}
        >
          <Typography variant="subtitle2">{`${payload[0].name}: ${payload[0].value}`}</Typography>
        </Box>
      );
    }
    return null;
  };

  const handleOpenModal = (mode, item = null) => {
    setModalMode(mode);
    setSelectedItem(item);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setTimeout(() => {
      setSelectedItem(null);
      setModalMode("add");
    }, 300);
  };

  const handleModalSuccess = () => fetchDashboardData();

  if (isLoading) {
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
    <Box sx={{ flexGrow: 1 }} className="fade-in">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4">Dashboard</Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Welcome, {currentUser?.name || "User"}!
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          This dashboard provides a summary of your inventory data, including
          items, categories, and stock levels.
        </Typography>
        <Button
          variant="text"
          size="small"
          onClick={() => setShowDebugger(!showDebugger)}
          sx={{ mt: 1 }}
        >
          {showDebugger ? "Hide" : "Show"} Auth Debugger
        </Button>
      </Box>

      {showDebugger && <AuthDebugger />}
      {error && (
        <Alert severity="error" sx={{ mt: 2, mb: 4 }}>
          {error}
        </Alert>
      )}

      <Typography variant="h6" sx={{ mb: 1 }}>
        Inventory Overview
      </Typography>
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
          Kartu-kartu ini menampilkan statistik cepat tentang
          <strong>
            total barang, kategori barang, dan produk yang stoknya menipis
          </strong>
        </Typography>
        <ul
          style={{
            paddingLeft: "1.25rem",
            marginTop: 4,
            marginBottom: 0,
            color: "#616161",
          }}
        ></ul>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        These cards show quick statistics of your total items, item categories,
        and products that are low in stock.
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }} className="staggered-children">
        {/* Statistic Cards */}
        {[
          {
            title: "All Items",
            icon: <InventoryIcon sx={{ mr: 1 }} />,
            value: stats.totalItems,
            link: "/items",
            label: "View all items",
          },
          {
            title: "Item Categories",
            icon: <CategoryIcon sx={{ mr: 1 }} />,
            value: stats.totalCategories,
            link: "/items",
            label: "View item categories",
          },
          {
            title: "Low Stock",
            icon: <WarningIcon color="error" sx={{ mr: 1 }} />,
            value: stats.lowStockItems,
            link: "/items?min_stok=0&max_stok=10",
            label: "View low stock items",
          },
        ].map((card, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Card className="hover-lift">
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  {card.icon}
                  <Typography variant="h6">{card.title}</Typography>
                </Box>
                <Typography variant="h3" sx={{ mb: 1, fontWeight: 700 }}>
                  {card.value}
                </Typography>
                <Button
                  component={RouterLink}
                  to={card.link}
                  size="small"
                  sx={{ textTransform: "none" }}
                >
                  {card.label}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}

        <Grid item xs={12} sm={6} md={3}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Manage Inventory Fast
          </Typography>
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
              Gunakan tombol aksi cepat di bawah ini untuk menambahkan barang
              baru atau menuju ke halaman manajemen barang.
            </Typography>
            <ul
              style={{
                paddingLeft: "1.25rem",
                marginTop: 4,
                marginBottom: 0,
                color: "#616161",
              }}
            ></ul>
          </Box>
          <Card className="hover-lift">
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Quick Actions
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Button
                  variant="contained"
                  onClick={() => handleOpenModal("add")}
                  size="small"
                  startIcon={<AddCircleOutlineIcon />}
                >
                  Add New Item
                </Button>
                <Button
                  variant="outlined"
                  component={RouterLink}
                  to="/items"
                  size="small"
                >
                  Manage Items
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="h6" sx={{ mb: 1 }}>
        Inventory Distribution
      </Typography>
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
          Representasi visual dari barang-barang Anda yang dikelompokkan
          berdasarkan kategori dan total stok yang tersedia."
        </Typography>
        <ul
          style={{
            paddingLeft: "1.25rem",
            marginTop: 4,
            marginBottom: 0,
            color: "#616161",
          }}
        ></ul>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }} className="staggered-children">
        {[
          {
            title: "Items by Category",
            data: categoryData,
            chart: (data) => (
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#000"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {data.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            ),
          },
          {
            title: "Stock by Category",
            data: stockData,
            chart: (data) => (
              <BarChart
                data={data}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="stock" name="Total Stock">
                  {data.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            ),
          },
        ].map(({ title, data, chart }, i) => (
          <Grid item xs={12} md={6} key={i}>
            <Card className="hover-lift">
              <CardHeader title={title} />
              <CardContent>
                {data.length > 0 ? (
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      {chart(data)}
                    </ResponsiveContainer>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: 300,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      No data available
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Typography variant="h6" sx={{ px: 2, pt: 3 }}>
        Latest Inventory Changes
      </Typography>
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
          Bagian ini menampilkan aktivitas inventaris terbaru — termasuk barang
          yang ditambahkan atau dihapus oleh pengguna.
        </Typography>
        <ul
          style={{
            paddingLeft: "1.25rem",
            marginTop: 4,
            marginBottom: 0,
            color: "#616161",
          }}
        ></ul>
      </Box>

      <Card className="hover-lift fade-in">
        <CardHeader title="Recent Activity" />
        <CardContent>
          {stats.recentActivity.length > 0 ? (
            <List>
              {stats.recentActivity.map((log, idx) => (
                <Box key={log.id}>
                  <ListItem>
                    <ListItemIcon>
                      {log.tipe === "masuk" ? (
                        <ArrowUpwardIcon color="success" />
                      ) : (
                        <ArrowDownwardIcon color="error" />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography>
                          {log.tipe === "masuk" ? "Added" : "Removed"}{" "}
                          {log.jumlah} {log.barang?.satuan} of{" "}
                          <strong>{log.barang?.nama_barang}</strong>
                        </Typography>
                      }
                      secondary={`By ${log.user?.name} on ${new Date(
                        log.tanggal
                      ).toLocaleDateString()}`}
                    />
                  </ListItem>
                  {idx < stats.recentActivity.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          ) : (
            <Box sx={{ py: 4, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                No recent activity found.
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      <ItemModal
        open={modalOpen}
        onClose={handleCloseModal}
        mode={modalMode}
        item={selectedItem}
        categories={categoryData.map((c) => c.name)}
        onSuccess={handleModalSuccess}
      />
    </Box>
  );
};

export default Dashboard;
