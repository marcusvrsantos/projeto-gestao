import { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import { Login } from './pages/Login';
import { Layout } from './components/Layout';
import { Colaboradores } from './pages/Colaboradores'; // <--- Import novo

const PrivateRoute = () => {
  const { signed } = useContext(AuthContext);
  return signed ? <Layout /> : <Navigate to="/" />;
};

const Dashboard = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <h3 className="text-slate-500 text-sm font-medium mb-2">Total Colaboradores</h3>
        <p className="text-3xl font-bold text-slate-800">1</p>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/colaboradores" element={<Colaboradores />} /> {/* <--- Rota nova */}
            <Route path="/fornecedores" element={<h1 className="text-2xl">Gestão de Fornecedores</h1>} />
            <Route path="/eventos" element={<h1 className="text-2xl">Gestão de Eventos</h1>} />
            <Route path="/orcamentos" element={<h1 className="text-2xl">Gestão de Orçamentos</h1>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}