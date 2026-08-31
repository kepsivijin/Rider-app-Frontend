import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

export const RoleRoute: React.FC<{ roles: string[]; children: React.ReactNode }> = ({ roles, children }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user && !roles.includes(user.role)) {
    const home = user.role === 'admin' ? '/admin' : user.role === 'driver' ? '/driver' : '/';
    return <Navigate to={home} replace />;
  }
  return <>{children}</>;
};

export function homeForRole(role?: string): string {
  if (role === 'admin') return '/admin';
  if (role === 'driver') return '/driver';
  return '/';
}
