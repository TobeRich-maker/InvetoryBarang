"use client";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Navbar from "./Navbar";
import { Box, Typography, Container, Paper } from "@mui/material";

const ProtectedRoute = ({
  children,
  requiredPermission = null,
  adminOnly = false,
}) => {
  const { currentUser, loading, authChecked, hasPermission, isAdmin } =
    useAuth();

  // 1. Loading state
  if (loading || !authChecked) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h5" gutterBottom>
            Loading...
          </Typography>
          <Typography>
            Please wait while we authenticate your session.
          </Typography>
        </Paper>
      </Container>
    );
  }

  // 2. Not logged in
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // 3. Admin only page check
  if (adminOnly && !isAdmin()) {
    return (
      <>
        <Navbar />
        <Container maxWidth="sm" sx={{ mt: 8 }}>
          <Paper sx={{ p: 4, textAlign: "center", bgcolor: "error.light" }}>
            <Typography variant="h5" gutterBottom>
              Access Denied
            </Typography>
            <Typography>Only administrators can access this page.</Typography>
          </Paper>
        </Container>
      </>
    );
  }

  // 4. Permission-based access (if not admin)
  if (requiredPermission && !isAdmin() && !hasPermission(requiredPermission)) {
    return (
      <>
        <Navbar />
        <Container maxWidth="sm" sx={{ mt: 8 }}>
          <Paper sx={{ p: 4, textAlign: "center", bgcolor: "error.light" }}>
            <Typography variant="h5" gutterBottom>
              Access Denied
            </Typography>
            <Typography>
              You need the "{requiredPermission}" permission to access this
              page.
            </Typography>
          </Paper>
        </Container>
      </>
    );
  }

  // 5. Access granted
  return (
    <>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        {children}
      </Box>
    </>
  );
};

export default ProtectedRoute;

// OLD CODE

// "use client";
// import { Navigate } from "react-router-dom";
// import { useAuth } from "../contexts/AuthContext";
// import Navbar from "./Navbar";
// import { Box, Typography, Container, Paper } from "@mui/material";

// const ProtectedRoute = ({
//   children,
//   requiredPermission = null,
//   adminOnly = false,
// }) => {
//   const { currentUser, loading, authChecked, hasPermission, isAdmin } =
//     useAuth();

//   // Show loading state
//   if (loading || !authChecked) {
//     return (
//       <Container maxWidth="sm" sx={{ mt: 8 }}>
//         <Paper sx={{ p: 4, textAlign: "center" }}>
//           <Typography variant="h5" component="h1" gutterBottom>
//             Loading...
//           </Typography>
//           <Typography variant="body1">
//             Please wait while we authenticate your session.
//           </Typography>
//         </Paper>
//       </Container>
//     );
//   }

//   // If not logged in, redirect to login
//   if (!currentUser) {
//     return <Navigate to="/login" replace />;
//   }

//   // If admin only and user is admin, allow access
//   if (adminOnly && isAdmin()) {
//     return (
//       <>
//         <Navbar />
//         <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
//           {children}
//         </Box>
//       </>
//     );
//   }

//   // If admin only and user is not admin, show access denied
//   if (adminOnly && !isAdmin()) {
//     return (
//       <>
//         <Navbar />
//         <Container maxWidth="sm" sx={{ mt: 8 }}>
//           <Paper sx={{ p: 4, textAlign: "center", bgcolor: "error.light" }}>
//             <Typography variant="h5" component="h1" gutterBottom>
//               Access Denied
//             </Typography>
//             <Typography variant="body1">
//               Only administrators can access this page.
//             </Typography>
//           </Paper>
//         </Container>
//       </>
//     );
//   }

//   // If permission is required and user is admin, allow access
//   if (requiredPermission && isAdmin()) {
//     return (
//       <>
//         <Navbar />
//         <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
//           {children}
//         </Box>
//       </>
//     );
//   }

//   // If permission is required and user doesn't have it, show access denied
//   if (requiredPermission && !hasPermission(requiredPermission)) {
//     return (
//       <>
//         <Navbar />
//         <Container maxWidth="sm" sx={{ mt: 8 }}>
//           <Paper sx={{ p: 4, textAlign: "center", bgcolor: "error.light" }}>
//             <Typography variant="h5" component="h1" gutterBottom>
//               Access Denied
//             </Typography>
//             <Typography variant="body1">
//               You need the "{requiredPermission}" permission to access this
//               page.
//             </Typography>
//           </Paper>
//         </Container>
//       </>
//     );
//   }

//   // If authenticated, render the protected content with navbar
//   return (
//     <>
//       <Navbar />
//       <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
//         {children}
//       </Box>
//     </>
//   );
// };

// export default ProtectedRoute;
