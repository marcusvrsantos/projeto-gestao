import { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import { Login } from './pages/Login';

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { signed } = useContext(AuthContext);
  return signed ? children : <Navigate to="/" />;
};

const Dashboard = () => {
  const { user, signOut } = useContext(AuthContext);
  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-bold text-slate-800">Bem-vindo, {user?.nome}!</h1>
        <button onClick={signOut} className="mt-6 text-red-600 hover:underline">Sair do Sistema</button>
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
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
