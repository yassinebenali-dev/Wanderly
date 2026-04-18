import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiRequest, getToken, setToken, removeToken } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: number;
  email: string;
  display_name?: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const token = getToken();
    if (token) {
      apiRequest('/auth/verify')
        .then((data) => setUser(data.user))
        .catch(() => removeToken())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      const data = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, display_name: displayName }),
      });
      setToken(data.token);
      setUser(data.user);
      return { error: null };
    } catch (err: any) {
      return { error: { message: err.message } };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setToken(data.token);
      setUser(data.user);

      // Check for pending save after login
      const pending = localStorage.getItem('wanderly_pending_save');
      if (pending) {
        try {
          const { destination, recommendations, budget, interests } = JSON.parse(pending);
          await apiRequest('/saved', {
            method: 'POST',
            body: JSON.stringify({ destination, budget, interests, recommendations }),
          });
          localStorage.removeItem('wanderly_pending_save');
          toast({
            title: 'Trip saved!',
            description: `${destination} has been saved to your destinations`,
          });
          localStorage.setItem('wanderly_redirect_destination', destination);
        } catch {
          localStorage.removeItem('wanderly_pending_save');
        }
      }

      return { error: null };
    } catch (err: any) {
      return { error: { message: err.message } };
    }
  };

  const signOut = async () => {
    removeToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}