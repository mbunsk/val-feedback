import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, signInWithGoogle, signOut } from '@/lib/supabase';

interface ValidationFormData {
  idea: string;
  targetCustomer: string;
  problemSolved: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  pendingValidation: ValidationFormData | null;
  signIn: (formData?: ValidationFormData) => Promise<void>;
  signOut: () => Promise<void>;
  clearPendingValidation: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingValidation, setPendingValidation] = useState<ValidationFormData | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change:', event, session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // If user just signed in, check for pending validation in localStorage
      if (event === 'SIGNED_IN' && session?.user) {
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
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (formData?: ValidationFormData) => {
    try {
      if (formData) {
        console.log('Setting pending validation:', formData);
        setPendingValidation(formData);
        // Store in localStorage to persist across OAuth redirect
        localStorage.setItem('pendingValidation', JSON.stringify(formData));
      }
      await signInWithGoogle();
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
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
    session,
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