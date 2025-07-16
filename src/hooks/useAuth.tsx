import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authAPI, getAuthToken } from '../lib/api';

interface User {
  id_user: string;
  username: string;
  role: 'User' | 'Admin';
  last_login?: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: User | null;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const checkAuth = async () => {
      console.log('Checking authentication...');
      const token = getAuthToken();
      
      if (!token) {
        console.log('No token found, user not authenticated');
        setLoading(false);
        return;
      }
      
      try {
        console.log('Token found, verifying with server...');
        const userData = await authAPI.getCurrentUser();
        console.log('User authenticated:', userData);
        setUser(userData);
      } catch (error) {
        console.error('Authentication check failed:', error);
        // User not logged in or token expired
        authAPI.logout();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      console.log('Attempting login for:', username);
      const response = await authAPI.login(username, password);
      console.log('Login response:', response);
      setUser(response.user);
      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Login failed' };
    }
  };

  const logout = async () => {
    console.log('Logging out...');
    authAPI.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      userProfile: user, // For compatibility with existing code
      login, 
      logout, 
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}