import { ReactNode } from 'react';
import { Redirect } from 'wouter';
import { useAuth } from '@/lib/auth';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect to user's default dashboard based on their role
    if (user.role === 'ADMIN') {
      return <Redirect to="/admin" />;
    } else if (user.role === 'DONOR') {
      return <Redirect to="/donor" />;
    } else if (user.role === 'VOLUNTEER') {
      return <Redirect to="/volunteer" />;
    }
  }

  return <>{children}</>;
}
