import { ReactNode } from 'react';
import { Redirect } from 'wouter';
import { useAuth } from '@/lib/auth';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user, loading } = useAuth();

  // ⛔ Wait until auth is restored
  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  // ❌ Not authenticated → redirect
  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  // ❌ Role not allowed → send user to their dashboard
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    if (user.role === 'ADMIN') return <Redirect to="/admin" />;
    if (user.role === 'DONOR') return <Redirect to="/donor" />;
    if (user.role === 'VOLUNTEER') return <Redirect to="/volunteer" />;
  }

  // ✔ Authenticated
  return <>{children}</>;
}
