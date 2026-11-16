/**
 * Global Authentication Context for Supabase Auth and Native FastAPI JWT.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { api } from '../services/apiClient';

export interface UserProfileData {
  id: string;
  email?: string;
  displayName?: string;
  avatarUrl?: string;
  role: string;
}

export interface AuthModalOptions {
  mode?: 'signin' | 'signup';
  prompt?: string;
  returnTab?: string;
  onComplete?: () => void;
}

interface AuthContextType {
  user: UserProfileData | null;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  openAuthModal: (options?: AuthModalOptions) => void;
  authMode: 'signin' | 'signup';
  setAuthMode: (mode: 'signin' | 'signup') => void;
  authPrompt: string | null;
  authReturnTab: string | null;
  signIn: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, pass: string, name?: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  isSupabaseActive: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [authPrompt, setAuthPrompt] = useState<string | null>(null);
  const [authReturnTab, setAuthReturnTab] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const openAuthModal = (options?: AuthModalOptions) => {
    setAuthMode(options?.mode || 'signin');
    setAuthPrompt(options?.prompt || null);
    setAuthReturnTab(options?.returnTab || null);
    setPendingAction(options?.onComplete ? () => options.onComplete : null);
    setIsAuthModalOpen(true);
  };

  useEffect(() => {
    let isMounted = true;

    async function verifyInitialSession() {
      // 1. Check Supabase session if configured with real credentials
      if (isSupabaseConfigured && supabase) {
        try {
          const { data } = await supabase.auth.getSession();
          if (data.session?.user && isMounted) {
            const u = data.session.user;
            setUser({
              id: u.id,
              email: u.email,
              displayName: u.user_metadata?.full_name || u.email?.split('@')[0],
              avatarUrl: u.user_metadata?.avatar_url,
              role: 'user',
            });
          }
        } catch (err) {
          console.warn('Initial Supabase session fetch error:', err);
        }

        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
          if (!isMounted) return;
          if (session?.user) {
            const u = session.user;
            setUser({
              id: u.id,
              email: u.email,
              displayName: u.user_metadata?.full_name || u.email?.split('@')[0],
              avatarUrl: u.user_metadata?.avatar_url,
              role: 'user',
            });
          } else {
            setUser(null);
          }
        });

        if (isMounted) setIsLoading(false);
        return () => {
          authListener.subscription.unsubscribe();
        };
      }

      // 2. Persistent Backend Auth with JWT token verification
      const localToken = localStorage.getItem('teravia_auth_token');
      if (localToken) {
        try {
          const res = await api.getCurrentUserProfile();
          if (res?.is_authenticated && res.user && isMounted) {
            setUser({
              id: res.user.id,
              email: res.user.email,
              displayName: res.user.display_name || res.user.email?.split('@')[0],
              avatarUrl: res.user.avatar_url,
              role: res.user.role || 'user',
            });
          } else if (isMounted) {
            // Token rejected by server
            localStorage.removeItem('teravia_auth_token');
            setUser(null);
          }
        } catch {
          // Token expired or server unreachable
          if (isMounted) {
            localStorage.removeItem('teravia_auth_token');
            setUser(null);
          }
        }
      } else {
        if (isMounted) setUser(null);
      }

      if (isMounted) setIsLoading(false);
    }

    verifyInitialSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const signIn = async (email: string, pass: string) => {
    setIsLoading(true);

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
        if (error) {
          setIsLoading(false);
          return { success: false, error: error.message };
        }
        if (data.user) {
          setUser({
            id: data.user.id,
            email: data.user.email,
            displayName: data.user.user_metadata?.full_name || data.user.email?.split('@')[0],
            avatarUrl: data.user.user_metadata?.avatar_url,
            role: 'user',
          });
        }
        setIsLoading(false);
        setIsAuthModalOpen(false);

        if (pendingAction) {
          try { pendingAction(); } catch (e) { console.warn('Pending action failed:', e); }
          setPendingAction(null);
        }
        if (authReturnTab) {
          window.location.hash = authReturnTab;
          setAuthReturnTab(null);
        }
        setAuthPrompt(null);
        return { success: true };
      } catch (err: any) {
        setIsLoading(false);
        return { success: false, error: err.message || 'Login failed' };
      }
    } else {
      // Backend Native JWT Authentication
      try {
        const res = await api.login(email.trim(), pass);
        if (res && res.access_token) {
          localStorage.setItem('teravia_auth_token', res.access_token);
          const u = res.user;
          setUser({
            id: u.id,
            email: u.email,
            displayName: u.display_name || u.email?.split('@')[0],
            avatarUrl: u.avatar_url,
            role: u.role || 'user',
          });
          setIsLoading(false);
          setIsAuthModalOpen(false);

          if (pendingAction) {
            try { pendingAction(); } catch (e) { console.warn('Pending action failed:', e); }
            setPendingAction(null);
          }
          if (authReturnTab) {
            window.location.hash = authReturnTab;
            setAuthReturnTab(null);
          }
          setAuthPrompt(null);
          return { success: true };
        } else {
          setIsLoading(false);
          return { success: false, error: 'Authentication response was invalid.' };
        }
      } catch (err: any) {
        setIsLoading(false);
        return { success: false, error: err.message || 'Invalid email or password.' };
      }
    }
  };

  const signUp = async (email: string, pass: string, name?: string) => {
    setIsLoading(true);

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password: pass,
          options: {
            data: { full_name: name || email.split('@')[0] },
          },
        });
        if (error) {
          setIsLoading(false);
          return { success: false, error: error.message };
        }
        if (data.user) {
          setUser({
            id: data.user.id,
            email: data.user.email,
            displayName: name || data.user.email?.split('@')[0],
            role: 'user',
          });
        }
        setIsLoading(false);
        setIsAuthModalOpen(false);

        if (pendingAction) {
          try { pendingAction(); } catch (e) { console.warn('Pending action failed:', e); }
          setPendingAction(null);
        }
        if (authReturnTab) {
          window.location.hash = authReturnTab;
          setAuthReturnTab(null);
        }
        setAuthPrompt(null);
        return { success: true };
      } catch (err: any) {
        setIsLoading(false);
        return { success: false, error: err.message || 'Registration failed' };
      }
    } else {
      // Backend Native JWT Registration
      try {
        const res = await api.register(email.trim(), pass, name?.trim());
        if (res && res.access_token) {
          localStorage.setItem('teravia_auth_token', res.access_token);
          const u = res.user;
          setUser({
            id: u.id,
            email: u.email,
            displayName: u.display_name || name || u.email?.split('@')[0],
            avatarUrl: u.avatar_url,
            role: u.role || 'user',
          });
          setIsLoading(false);
          setIsAuthModalOpen(false);

          if (pendingAction) {
            try { pendingAction(); } catch (e) { console.warn('Pending action failed:', e); }
            setPendingAction(null);
          }
          if (authReturnTab) {
            window.location.hash = authReturnTab;
            setAuthReturnTab(null);
          }
          setAuthPrompt(null);
          return { success: true };
        } else {
          setIsLoading(false);
          return { success: false, error: 'Registration response was invalid.' };
        }
      } catch (err: any) {
        setIsLoading(false);
        return { success: false, error: err.message || 'Registration failed. Please try again.' };
      }
    }
  };

  const signOut = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut().catch(() => {});
    }
    await api.logout();
    localStorage.removeItem('teravia_auth_token');
    localStorage.removeItem('teravia_saved_places_v1');
    setUser(null);
    window.location.hash = 'overview';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthModalOpen,
        setIsAuthModalOpen,
        openAuthModal,
        authMode,
        setAuthMode,
        authPrompt,
        authReturnTab,
        signIn,
        signUp,
        signOut,
        isSupabaseActive: isSupabaseConfigured,
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
