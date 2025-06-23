"use client";
import { Grid, Paper, Typography, Box } from "@mui/material";
import {
  TrendingUp,
  Warning,
  LocalShipping,
  Category,
} from "@mui/icons-material";
import { motion } from "framer-motion";

const SummaryCard = ({ title, value, icon, color, subtitle }) => {
  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        borderTop: `4px solid ${color}`,
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h6" component="h2" color="text.secondary">
          {title}
        </Typography>
        <Box sx={{ color: color }}>{icon}</Box>
      </Box>
      <Typography variant="h4" component="p" sx={{ mb: 1, fontWeight: "bold" }}>
        {value}
      </Typography>
      {subtitle && (
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      )}
    </Paper>
  );
};

const AnalyticsSummary = ({ data }) => {
  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={3}>
        <motion.div variants={cardVariants}>
          <SummaryCard
            title="Forecasted Demand"
            value={data.totalForecastedDemand}
            subtitle={`Next 30 days (${data.forecastTrend}% ${
              data.forecastTrend >= 0 ? "increase" : "decrease"
            })`}
            icon={<TrendingUp />}
            color="#4caf50"
          />
        </motion.div>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <motion.div variants={cardVariants}>
          <SummaryCard
            title="Items to Reorder"
            value={data.itemsToReorder}
            subtitle={`${data.urgentItems} urgent items`}
            icon={<LocalShipping />}
            color="#ff9800"
          />
        </motion.div>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <motion.div variants={cardVariants}>
          <SummaryCard
            title="Detected Anomalies"
            value={data.anomalyCount}
            subtitle={`Last ${data.anomalyPeriod} days`}
            icon={<Warning />}
            color="#f44336"
          />
        </motion.div>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <motion.div variants={cardVariants}>
          <SummaryCard
            title="Fast Moving Items"
            value={data.fastMovingCount}
            subtitle={`${data.fastMovingPercentage}% of inventory`}
            icon={<Category />}
            color="#2196f3"
          />
        </motion.div>
      </Grid>
    </Grid>
  );
};

export default AnalyticsSummary;
