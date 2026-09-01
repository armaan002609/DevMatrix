import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'member' | 'admin';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async (session: Session | null) => {
      if (!session?.user) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, name, email, role')
          .eq('id', session.user.id)
          .single();

        if (error) throw error;
        
        if (data) {
          setUser({ id: data.id, name: data.name, email: data.email, role: data.role as 'member' | 'admin' });
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      fetchProfile(session);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      fetchProfile(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = (userData: User) => setUser(userData);
  
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
