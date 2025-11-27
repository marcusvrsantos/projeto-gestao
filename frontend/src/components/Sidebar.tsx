import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Truck, Calendar, FileText, DollarSign, LogOut } from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export function Sidebar() {
  const { signOut } = useContext(AuthContext);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Users, label: 'Colaboradores', path: '/colaboradores' },
    { icon: Truck, label: 'Fornecedores', path: '/fornecedores' },
    { icon: Calendar, label: 'Eventos', path: '/eventos' },
    { icon: DollarSign, label: 'Orçamentos', path: '/orcamentos' },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen fixed left-0 top-0 border-r border-slate-800">
      {/* Logo Area */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950">
        <span className="text-2xl font-bold text-white tracking-tighter mr-2">ISG</span>
        <span className="text-xs font-semibold text-slate-500 uppercase mt-1">Gestão</span>
      </div>

      {/* Menu Links */}
      <nav className="flex-1 py-6 px-3 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 ${
                isActive 
                  ? 'bg-[#A6192E] text-white shadow-lg' 
                  : 'hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <item.icon size={20} />
            <span className="font-medium text-sm">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={signOut}
          className="flex items-center gap-3 w-full px-3 py-2 text-red-400 hover:bg-slate-800 hover:text-red-300 rounded-md transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium text-sm">Sair do Sistema</span>
        </button>
      </div>
    </aside>
  );
}
