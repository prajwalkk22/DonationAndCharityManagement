import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocation } from 'wouter';
import type { User } from '@shared/schema';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isDonor: boolean;
  isVolunteer: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [, navigate] = useLocation();

  // Restore login state from localStorage
  useEffect(() => {
    async function restoreAuth() {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);

          // Validate the token by calling a protected endpoint
          const res = await fetch('/api/campaigns', {
            headers: {
              'Authorization': `Bearer ${storedToken}`,
            },
          });

          if (res.ok) {
            setToken(storedToken);
            setUser(parsedUser);
          } else {
            // Token invalid → clear localStorage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        } catch {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }

      setLoading(false);
    }

    restoreAuth();
  }, []);

  // Login function
  const login = (newUser: User, newToken: string) => {
    setUser(newUser);
    setToken(newToken);

    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));

    // Navigate based on user role
    if (newUser.role === 'ADMIN') {
      navigate('/admin');
    } else if (newUser.role === 'DONOR') {
      navigate('/donor');
    } else if (newUser.role === 'VOLUNTEER') {
      navigate('/volunteer');
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    loading,
    isAuthenticated: !!token && !!user && !loading,
    isAdmin: user?.role === 'ADMIN',
    isDonor: user?.role === 'DONOR',
    isVolunteer: user?.role === 'VOLUNTEER',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
