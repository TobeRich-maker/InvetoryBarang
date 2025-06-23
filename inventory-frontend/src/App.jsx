import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import theme from "./theme/theme";

// Pages
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import ItemsPage from "./pages/ItemsPage";
import AddItemPage from "./pages/AddItemPage";
import LandingPage from "./pages/LandingPage";
import RolesPage from "./pages/RolesPage";
import PermissionsPage from "./pages/PermissionsPage";
import GoodsOutPage from "./pages/GoodsOutPage";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import SystemLogs from "./pages/admin/SystemLogs";
import SystemSettings from "./pages/admin/SystemSettings";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/items"
              element={
                <ProtectedRoute requiredPermission="view_items">
                  <ItemsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/add-item"
              element={
                <ProtectedRoute requiredPermission="manage_items">
                  <AddItemPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/roles"
              element={
                <ProtectedRoute requiredPermission="manage_roles">
                  <RolesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/permissions"
              element={
                <ProtectedRoute requiredPermission="manage_roles">
                  <PermissionsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/goods-out"
              element={
                <ProtectedRoute requiredPermission="manage_transactions">
                  <GoodsOutPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute requiredPermission="view_reports">
                  <AnalyticsDashboard />
                </ProtectedRoute>
              }
            />

            {/* Admin routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredPermission="manage_system">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/logs"
              element={
                <ProtectedRoute requiredPermission="manage_system">
                  <SystemLogs />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <ProtectedRoute requiredPermission="manage_system">
                  <SystemSettings />
                </ProtectedRoute>
              }
            />

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
