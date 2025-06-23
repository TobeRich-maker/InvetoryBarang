import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import AddItemPage from "./pages/AddItem";
import ItemsPage from "./pages/ItemsPage";
import Navbar from "./components/Navbar";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import GoodsOutPage from "./pages/GoodsOutPage";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import RolesPage from "./pages/RolePage";
import PermissionsPage from "./pages/PermissionsPage";
import SystemSettings from "./pages/admin/SystemSettings";

// Create a theme
const theme = createTheme({
  palette: {
    primary: {
      main: "#4f46e5",
    },
    secondary: {
      main: "#64748b",
    },
    error: {
      main: "#ef4444",
    },
    warning: {
      main: "#f59e0b",
    },
    success: {
      main: "#10b981",
    },
    background: {
      default: "#f8fafc",
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: "0.375rem",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: "0.5rem",
          boxShadow:
            "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <div className="app">
            <Navbar />
            <main
              style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}
            >
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
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
                    <ProtectedRoute>
                      <ItemsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/add-item"
                  element={
                    <ProtectedRoute>
                      <AddItemPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/goods-out"
                  element={
                    <ProtectedRoute>
                      <GoodsOutPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/analytics"
                  element={
                    <ProtectedRoute>
                      <AnalyticsDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/roles"
                  element={
                    <ProtectedRoute>
                      <RolesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/permissions"
                  element={
                    <ProtectedRoute>
                      <PermissionsPage />
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
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
