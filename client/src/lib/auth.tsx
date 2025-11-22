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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [, navigate] = useLocation();

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        // Validate token by making a test request
        fetch('/api/campaigns', {
          headers: {
            'Authorization': `Bearer ${storedToken}`,
          },
        })
          .then((res) => {
            if (res.ok) {
              setToken(storedToken);
              setUser(parsedUser);
            } else {
              // Token is invalid, clear storage
              localStorage.removeItem('token');
              localStorage.removeItem('user');
            }
          })
          .catch(() => {
            // Network error or invalid token
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          });
      } catch (error) {
        // Invalid user data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  const login = (newUser: User, newToken: string) => {
    setUser(newUser);
    setToken(newToken);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    
    // Navigate based on role
    if (newUser.role === 'ADMIN') {
      navigate('/admin');
    } else if (newUser.role === 'DONOR') {
      navigate('/donor');
    } else if (newUser.role === 'VOLUNTEER') {
      navigate('/volunteer');
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const value = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!token && !!user,
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
