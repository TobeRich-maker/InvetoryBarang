"use client";
import { useAuth } from "../contexts/AuthContext";

const PermissionGate = ({
  permissions,
  children,
  fallback = null,
  requireAll = false,
}) => {
  const { hasPermission, isAdmin } = useAuth();

  // Admin role always has access to everything
  if (isAdmin()) {
    return children;
  }

  // Convert single permission to array
  const permissionArray = Array.isArray(permissions)
    ? permissions
    : [permissions];

  // Check permissions based on requireAll flag
  const hasAccess = requireAll
    ? permissionArray.every((permission) => hasPermission(permission))
    : permissionArray.some((permission) => hasPermission(permission));

  return hasAccess ? children : fallback;
};

export default PermissionGate;
