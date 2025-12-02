import { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import { Login } from './pages/Login';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Colaboradores } from './pages/Colaboradores';
import { Fornecedores } from './pages/Fornecedores';
import { Eventos } from './pages/Eventos';
import { Orcamentos } from './pages/Orcamentos'; // <--- Import novo

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
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/colaboradores" element={<Colaboradores />} />
            <Route path="/fornecedores" element={<Fornecedores />} />
            <Route path="/eventos" element={<Eventos />} />
            <Route path="/orcamentos" element={<Orcamentos />} /> {/* <--- Tela Real aqui */}
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
