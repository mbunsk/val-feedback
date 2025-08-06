import React, { createContext, useContext, useEffect, useState } from 'react';

interface AuthenticatedUser {
  id: string;
  googleId: string | null;
  email: string;
  name: string;
  avatar: string | null;
  createdAt: Date | null;
}

interface ValidationFormData {
  idea: string;
  targetCustomer: string;
  problemSolved: string;
}

interface AuthContextType {
  user: AuthenticatedUser | null;
  loading: boolean;
  pendingValidation: ValidationFormData | null;
  signIn: (formData?: ValidationFormData) => Promise<void>;
  signOut: () => Promise<void>;
  clearPendingValidation: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingValidation, setPendingValidation] = useState<ValidationFormData | null>(null);

  // Check authentication status on mount and after page load
  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/user', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const userData = await response.json();
        console.log('User authenticated:', userData.email);
        setUser(userData);
        
        // Check for pending validation if user just signed in
        const storedValidation = localStorage.getItem('pendingValidation');
        if (storedValidation) {
          try {
            const validationData = JSON.parse(storedValidation);
            console.log('Restoring pending validation from localStorage:', validationData);
            setPendingValidation(validationData);
          } catch (error) {
            console.error('Error parsing stored validation:', error);
            localStorage.removeItem('pendingValidation');
          }
        }
      } else {
        console.log('User not authenticated');
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
    
    // Check auth status when page becomes visible (after OAuth redirect)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkAuthStatus();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const signIn = async (formData?: ValidationFormData) => {
    try {
      if (formData) {
        console.log('Setting pending validation:', formData);
        setPendingValidation(formData);
        // Store in localStorage to persist across OAuth redirect
        localStorage.setItem('pendingValidation', JSON.stringify(formData));
      }
      
      // Redirect to Google OAuth
      window.location.href = '/auth/google';
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const handleSignOut = async () => {
    try {
      // Redirect to logout endpoint
      window.location.href = '/auth/logout';
      setPendingValidation(null); // Clear pending validation on sign out
      localStorage.removeItem('pendingValidation'); // Clear from localStorage too
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const clearPendingValidation = () => {
    console.log('Clearing pending validation');
    setPendingValidation(null);
    localStorage.removeItem('pendingValidation');
  };

  const value = {
    user,
    loading,
    pendingValidation,
    signIn,
    signOut: handleSignOut,
    clearPendingValidation,
  };

  return (
    <AuthContext.Provider value={value}>
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