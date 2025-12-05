import { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import { Login } from './pages/Login';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Colaboradores } from './pages/Colaboradores';
import { Fornecedores } from './pages/Fornecedores';
import { Eventos } from './pages/Eventos';
import { DetalhesEvento } from './pages/DetalhesEvento';
import { Orcamentos } from './pages/Orcamentos';
import { ConvidadosExternos } from './pages/ConvidadosExternos';
import { ConfirmacaoConvite } from './pages/ConfirmacaoConvite'; // <--- Import

const PrivateRoute = () => {
  const { signed } = useContext(AuthContext);
  return signed ? <Layout /> : <Navigate to="/" />;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/" element={<Login />} />
          <Route path="/confirmar/:token" element={<ConfirmacaoConvite />} /> {/* <--- Nova Rota Pública */}

          {/* Rotas Privadas (Exigem Login) */}
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/colaboradores" element={<Colaboradores />} />
            <Route path="/convidados-externos" element={<ConvidadosExternos />} />
            <Route path="/fornecedores" element={<Fornecedores />} />
            <Route path="/eventos" element={<Eventos />} />
            <Route path="/eventos/:id" element={<DetalhesEvento />} />
            <Route path="/orcamentos" element={<Orcamentos />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
