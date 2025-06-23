"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";
import DemandForecastChart from "../components/analytics/DemandForecastChart";
import ProcurementTable from "../components/analytics/ProcurementTable";
import AnomalyList from "../components/analytics/AnomalyList";
import MovementClassification from "../components/analytics/MovementClassification";
import AnalyticsSummary from "../components/analytics/AnalyticsSummary";
import api from "../services/api";

const AnalyticsDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [openInfoModal, setOpenInfoModal] = useState(false);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const response = await api.get("/analytics/dashboard");

      if (response.data.success && response.data.data) {
        setAnalyticsData(response.data.data);
      } else {
        setAnalyticsData(response.data);
      }

      setError(null);
    } catch (err) {
      console.error("Error fetching analytics data:", err);
      setError(
        err.response?.data?.message ||
          "Failed to load analytics data. Please try again later."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAnalyticsData();
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          variants={itemVariants}
          className="flex justify-between items-center"
        >
          <Typography variant="h4" component="h1" gutterBottom>
            Inventory Analytics Dashboard
          </Typography>

          <Box>
            <Button
              variant="outlined"
              startIcon={<RefreshCw size={16} />}
              onClick={handleRefresh}
              disabled={loading || refreshing}
              sx={{ mb: 2, mr: 2 }}
            >
              {refreshing ? "Refreshing..." : "Refresh Data"}
            </Button>
            <Button
              variant="outlined"
              onClick={() => setOpenInfoModal(true)}
              sx={{ mb: 2 }}
            >
              Lihat Proses Data
            </Button>
          </Box>
        </motion.div>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        ) : analyticsData ? (
          <>
            <motion.div variants={itemVariants}>
              <AnalyticsSummary data={analyticsData.summary} />
            </motion.div>

            <motion.div variants={itemVariants}>
              <Paper sx={{ mt: 3 }}>
                <Tabs
                  value={activeTab}
                  onChange={handleTabChange}
                  indicatorColor="primary"
                  textColor="primary"
                  variant="fullWidth"
                >
                  <Tab label="Demand Forecast" />
                  <Tab label="Procurement" />
                  <Tab label="Anomalies" />
                  <Tab label="Item Classification" />
                </Tabs>
              </Paper>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Box sx={{ mt: 3 }}>
                {activeTab === 0 && analyticsData.forecasts && (
                  <DemandForecastChart data={analyticsData.forecasts} />
                )}
                {activeTab === 1 && analyticsData.procurement && (
                  <ProcurementTable data={analyticsData.procurement} />
                )}
                {activeTab === 2 && analyticsData.anomalies && (
                  <AnomalyList data={analyticsData.anomalies} />
                )}
                {activeTab === 3 && analyticsData.movement && (
                  <MovementClassification data={analyticsData.movement} />
                )}
              </Box>
            </motion.div>
          </>
        ) : (
          <Alert severity="warning" sx={{ mt: 2 }}>
            No analytics data available.
          </Alert>
        )}

        {/* Modal Penjelasan Proses Data */}
        <Dialog
          open={openInfoModal}
          onClose={() => setOpenInfoModal(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Proses Pemrosesan Data
            <Button
              onClick={() => setOpenInfoModal(false)}
              sx={{ position: "absolute", right: 16, top: 16 }}
            >
              <CloseIcon />
            </Button>
          </DialogTitle>
          <DialogContent dividers>
            <Typography variant="body1" gutterBottom>
              Data pada dashboard ini diambil dari transaksi harian barang yang
              dicatat selama 90 hari terakhir, mencakup barang masuk dan keluar.
            </Typography>
            <Typography variant="body1" gutterBottom>
              Sistem menghitung rata-rata permintaan harian dari data historis
              dan menerapkan metode <strong>Exponential Smoothing</strong> untuk
              memprediksi permintaan selama 30 hari ke depan.
            </Typography>
            <Typography variant="body1" gutterBottom>
              Selain itu, sistem juga mendeteksi anomali dalam pola permintaan,
              mengklasifikasikan jenis pergerakan barang (cepat, sedang, lambat,
              atau dead stock), serta memberikan rekomendasi pengadaan untuk
              menghindari kehabisan stok.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenInfoModal(false)} variant="contained">
              Tutup
            </Button>
          </DialogActions>
        </Dialog>
      </motion.div>
    </Container>
  );
};

export default AnalyticsDashboard;
