import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types/cloudforge';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, fullName?: string) => Promise<void>;
  loginWithOAuth: (provider: 'google' | 'github') => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      if (isSupabaseConfigured && supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || 'developer@cloudforge.app',
            full_name: session.user.user_metadata?.full_name || 'CloudForge Developer',
            avatar_url: session.user.user_metadata?.avatar_url,
            created_at: session.user.created_at
          });
          localStorage.setItem('cloudforge_token', session.user.id);
          localStorage.setItem('cloudforge_email', session.user.email || '');
        } else {
          checkLocalSession();
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
          if (session?.user) {
            setUser({
              id: session.user.id,
              email: session.user.email || 'developer@cloudforge.app',
              full_name: session.user.user_metadata?.full_name || 'CloudForge Developer',
              avatar_url: session.user.user_metadata?.avatar_url,
              created_at: session.user.created_at
            });
            localStorage.setItem('cloudforge_token', session.user.id);
            localStorage.setItem('cloudforge_email', session.user.email || '');
          } else {
            setUser(null);
            localStorage.removeItem('cloudforge_token');
            localStorage.removeItem('cloudforge_email');
          }
        });

        setLoading(false);
        return () => subscription.unsubscribe();
      } else {
        checkLocalSession();
        setLoading(false);
      }
    }

    initAuth();
  }, []);

  function checkLocalSession() {
    const savedToken = localStorage.getItem('cloudforge_token');
    const savedEmail = localStorage.getItem('cloudforge_email');
    const savedName = localStorage.getItem('cloudforge_name');

    if (savedToken && savedEmail) {
      setUser({
        id: savedToken,
        email: savedEmail,
        full_name: savedName || 'CloudForge Developer',
        created_at: new Date().toISOString()
      });
    } else {
      setUser(null);
    }
  }

  const login = async (email: string, pass: string) => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (error) throw error;
      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email || email,
          full_name: data.user.user_metadata?.full_name || email.split('@')[0],
          created_at: data.user.created_at
        });
        localStorage.setItem('cloudforge_token', data.user.id);
        localStorage.setItem('cloudforge_email', data.user.email || email);
      }
    } else {
      // Local Auth session mode
      const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const name = email.split('@')[0];
      const newUser: UserProfile = {
        id: userId,
        email,
        full_name: name.charAt(0).toUpperCase() + name.slice(1),
        created_at: new Date().toISOString()
      };
      setUser(newUser);
      localStorage.setItem('cloudforge_token', userId);
      localStorage.setItem('cloudforge_email', email);
      localStorage.setItem('cloudforge_name', newUser.full_name || '');
    }
  };

  const register = async (email: string, pass: string, fullName?: string) => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: { data: { full_name: fullName } }
      });
      if (error) throw error;
      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email || email,
          full_name: fullName || email.split('@')[0],
          created_at: data.user.created_at
        });
        localStorage.setItem('cloudforge_token', data.user.id);
        localStorage.setItem('cloudforge_email', data.user.email || email);
      }
    } else {
      const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const newUser: UserProfile = {
        id: userId,
        email,
        full_name: fullName || email.split('@')[0],
        created_at: new Date().toISOString()
      };
      setUser(newUser);
      localStorage.setItem('cloudforge_token', userId);
      localStorage.setItem('cloudforge_email', email);
      localStorage.setItem('cloudforge_name', newUser.full_name || '');
    }
  };

  const loginWithOAuth = async (provider: 'google' | 'github') => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: window.location.origin }
      });
      if (error) throw error;
    } else {
      const userId = `usr_oauth_${provider}_${Date.now()}`;
      const email = `developer_${provider}@cloudforge.app`;
      const newUser: UserProfile = {
        id: userId,
        email,
        full_name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} Developer`,
        created_at: new Date().toISOString()
      };
      setUser(newUser);
      localStorage.setItem('cloudforge_token', userId);
      localStorage.setItem('cloudforge_email', email);
      localStorage.setItem('cloudforge_name', newUser.full_name || '');
    }
  };

  const logout = () => {
    if (isSupabaseConfigured && supabase) {
      supabase.auth.signOut().catch(() => {});
    }
    setUser(null);
    localStorage.removeItem('cloudforge_token');
    localStorage.removeItem('cloudforge_email');
    localStorage.removeItem('cloudforge_name');
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      register,
      loginWithOAuth,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
