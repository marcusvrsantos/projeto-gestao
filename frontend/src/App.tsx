import { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import { Login } from './pages/Login';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Colaboradores } from './pages/Colaboradores';
import { Fornecedores } from './pages/Fornecedores';
import { Eventos } from './pages/Eventos';
import { EventoDetalhes } from './pages/EventoDetalhes'; // Verifique se está em 'pages' ou 'components'
import { Orcamentos } from './pages/Orcamentos';
import { ConvidadosExternos } from './pages/ConvidadosExternos';

// AJUSTE: Importando com o nome do arquivo que criamos
import { ConfirmarPresenca } from './pages/ConfirmarPresenca'; 

const PrivateRoute = () => {
  const { signed } = useContext(AuthContext);
  // Se estiver carregando (loading), idealmente mostraria um spinner aqui, mas assim funciona
  return signed ? <Layout /> : <Navigate to="/" />;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* --- Rotas Públicas (Qualquer um acessa) --- */}
          <Route path="/" element={<Login />} />
          
          {/* Rota do Convite: O token na URL define quem é o convidado */}
          <Route path="/confirmar/:token" element={<ConfirmarPresenca />} />

          {/* --- Rotas Privadas (Só logado acessa) --- */}
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/colaboradores" element={<Colaboradores />} />
            <Route path="/convidados-externos" element={<ConvidadosExternos />} />
            <Route path="/fornecedores" element={<Fornecedores />} />
            <Route path="/eventos" element={<Eventos />} />
            <Route path="/eventos/:id" element={<EventoDetalhes />} />
            <Route path="/orcamentos" element={<Orcamentos />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}