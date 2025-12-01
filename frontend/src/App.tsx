import { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import { Login } from './pages/Login';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard'; // <--- Import Real
import { Colaboradores } from './pages/Colaboradores';
import { Fornecedores } from './pages/Fornecedores';

const PrivateRoute = () => {
  const { signed } = useContext(AuthContext);
  return signed ? <Layout /> : <Navigate to="/" />;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<Dashboard />} /> {/* <--- Componente Real */}
            <Route path="/colaboradores" element={<Colaboradores />} />
            <Route path="/fornecedores" element={<Fornecedores />} />
            <Route path="/eventos" element={<h1 className="text-2xl p-8">Gestão de Eventos (Em breve)</h1>} />
            <Route path="/orcamentos" element={<h1 className="text-2xl p-8">Gestão de Orçamentos (Em breve)</h1>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
