import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import api from '../services/api';

interface User {
  id: string;
  nome: string;
  email: string;
  role: string;
}

interface AuthContextData {
  signed: boolean;
  user: User | null;
  signIn: (email: string, senha: string) => Promise<void>;
  signOut: () => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStorageData() {
      const storagedToken = localStorage.getItem('gestao_token');
      const storagedUser = localStorage.getItem('gestao_user');

      if (storagedToken && storagedUser) {
        // REINJETA O TOKEN NO AXIOS AO DAR F5
        api.defaults.headers.common['Authorization'] = `Bearer ${storagedToken}`;
        setUser(JSON.parse(storagedUser));
      }
      setLoading(false);
    }

    loadStorageData();
  }, []);

  async function signIn(email: string, senha: string) {
    const response = await api.post('/auth/login', { email, senha });
    
    const { token, user } = response.data;

    localStorage.setItem('gestao_token', token);
    localStorage.setItem('gestao_user', JSON.stringify(user));

    // INJETA O TOKEN IMEDIATAMENTE APÓS O LOGIN
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    setUser(user);
  }

  function signOut() {
    localStorage.removeItem('gestao_token');
    localStorage.removeItem('gestao_user');
    
    // LIMPA O TOKEN DO CABEÇALHO
    api.defaults.headers.common['Authorization'] = undefined;
    
    setUser(null);
  }

  // ENQUANTO CARREGA O STORAGE, NÃO MOSTRA NADA (OU MOSTRA UM SPINNER)
  if (loading) {
    return null; 
  }

  return (
    <AuthContext.Provider value={{ signed: !!user, user, signIn, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  return context;
}