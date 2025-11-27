import { createContext, useState, useEffect, ReactNode } from 'react';
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
}

export const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Ao abrir o app, recupera os dados salvos
    const storagedToken = localStorage.getItem('gestao_token');
    const storagedUser = localStorage.getItem('gestao_user');

    if (storagedToken && storagedUser) {
      setUser(JSON.parse(storagedUser));
    }
  }, []);

  async function signIn(email: string, senha: string) {
    const response = await api.post('/auth/login', { email, senha });
    
    const { token, user } = response.data;

    localStorage.setItem('gestao_token', token);
    localStorage.setItem('gestao_user', JSON.stringify(user));
    setUser(user);
  }

  function signOut() {
    localStorage.removeItem('gestao_token');
    localStorage.removeItem('gestao_user');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ signed: !!user, user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
