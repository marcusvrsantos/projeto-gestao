import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export function Layout() {
  const { user } = useContext(AuthContext);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Menu Lateral Fixo */}
      <Sidebar />

      {/* Área Principal */}
      <main className="flex-1 ml-64 transition-all duration-300">
        {/* Header Superior */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-700">Visão Geral</h2>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-800">{user?.nome}</p>
              <p className="text-xs text-slate-500 font-mono">{user?.role}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold border border-slate-300">
              {user?.nome?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Conteúdo da Página (Onde vai o Dashboard, Forms, Tabelas) */}
        <div className="p-8 fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
