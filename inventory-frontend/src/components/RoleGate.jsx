"use client";
import { useAuth } from "../contexts/AuthContext";

/**
 * A component that conditionally renders children based on user role
 *
 * @param {Object} props
 * @param {string|string[]} props.roles - Role(s) required to render children
 * @param {React.ReactNode} props.children - Content to render if user has the role
 * @param {React.ReactNode} props.fallback - Content to render if user doesn't have the role
 * @returns {React.ReactNode}
 */
const RoleGate = ({ roles, children, fallback = null }) => {
  const { currentUser } = useAuth();

  // If no roles are required, render children
  if (!roles || (Array.isArray(roles) && roles.length === 0)) {
    return children;
  }

  // Check if user has any of the required roles
  const hasRequiredRole = Array.isArray(roles)
    ? roles.some((role) => currentUser?.role?.name === role)
    : currentUser?.role?.name === roles;

  // Admin role bypass - admins can see everything
  const isAdmin = currentUser?.role?.name === "admin";

  return isAdmin || hasRequiredRole ? children : fallback;
};

export default RoleGate;
