import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { authService } from '../services/auth';
import { supabase, isSupabaseConfigured } from '../services/supabase';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<UserProfile>;
  signUp: (email: string, password: string, fullName: string) => Promise<UserProfile>;
  signOut: () => Promise<void>;
  updateProfile: (updates: { full_name?: string }) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const configured = isSupabaseConfigured();

  useEffect(() => {
    // 1. Initial check: restore local or Supabase session
    const initAuth = async () => {
      try {
        if (configured) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            // Fetch name from metadata or profiles
            const name = session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User';
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              full_name: name,
              created_at: session.user.created_at,
            });
          } else {
            // Check fallback saved user in local storage
            const localSaved = localStorage.getItem('chronovault_user');
            if (localSaved) {
              setUser(JSON.parse(localSaved));
            }
          }
        } else {
          const localSaved = localStorage.getItem('chronovault_user');
          if (localSaved) {
            setUser(JSON.parse(localSaved));
          }
        }
      } catch (err) {
        console.error('Error restoring session:', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // 2. Setup active auth state listener if Supabase is configured
    if (configured) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (event === 'SIGNED_IN' && session?.user) {
            const name = session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User';
            const userProfile: UserProfile = {
              id: session.user.id,
              email: session.user.email || '',
              full_name: name,
              created_at: session.user.created_at,
            };
            setUser(userProfile);
            localStorage.setItem('chronovault_user', JSON.stringify(userProfile));
          } else if (event === 'SIGNED_OUT') {
            setUser(null);
            localStorage.removeItem('chronovault_user');
          }
        }
      );

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [configured]);

  const signIn = async (email: string, password: string) => {
    const loggedUser = await authService.signIn(email, password);
    setUser(loggedUser);
    return loggedUser;
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const newUser = await authService.signUp(email, password, fullName);
    setUser(newUser);
    return newUser;
  };

  const signOut = async () => {
    await authService.signOut();
    setUser(null);
  };

  const updateProfile = async (updates: { full_name?: string }) => {
    if (!user) return;
    await authService.updateProfile(user.id, updates);
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
  };

  const updatePassword = async (password: string) => {
    await authService.updatePassword(password);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isConfigured: configured,
        signIn,
        signUp,
        signOut,
        updateProfile,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
