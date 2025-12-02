import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Truck, Calendar, DollarSign, LogOut } from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export function Sidebar() {
  const { signOut } = useContext(AuthContext);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Início', path: '/dashboard' },
    { icon: Users, label: 'Colaboradores', path: '/colaboradores' },
    { icon: Truck, label: 'Fornecedores', path: '/fornecedores' },
    { icon: Calendar, label: 'Eventos', path: '/eventos' },
    { icon: DollarSign, label: 'Orçamentos', path: '/orcamentos' },
  ];

  return (
    <aside className="w-64 bg-[#A6192E] text-white flex flex-col h-screen fixed left-0 top-0 shadow-xl z-20">
      
      {/* Área da Logo */}
      <div className="h-24 flex items-center px-6 border-b border-[#8a1425]">
        {/* Aqui simulamos a logo com texto/svg, mas você pode por <img src="/logo.png" /> depois */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-1">
             <span className="text-4xl font-bold tracking-tighter">ISG</span>
             {/* Ícone representando o gráfico da logo */}
             <svg className="w-8 h-8 text-white opacity-90" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2 2h20v20H2z" fill="none"/>
                <path d="M3 13h8V3H3v10zm2-8h4v6H5V5zm10 6h8V3h-8v8zm2-6h4v4h-4V5zM3 21h8v-6H3v6zm2-4h4v2H5v-2zm10 4h8v-8h-8v8zm2-6h4v4h-4v-4z"/>
             </svg>
          </div>
          <span className="text-[10px] font-medium tracking-widest uppercase opacity-80">Participações S.A.</span>
        </div>
      </div>

      {/* Menu Links */}
      <nav className="flex-1 py-6 px-4 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium text-sm ${
                isActive 
                  ? 'bg-[#700018] text-white shadow-md translate-x-1' // Ativo: Vermelho Escuro
                  : 'text-red-100 hover:bg-[#8a1425] hover:text-white' // Normal
              }`
            }
          >
            <item.icon size={20} strokeWidth={1.5} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-[#8a1425]">
        <button 
          onClick={signOut}
          className="flex items-center gap-3 w-full px-4 py-3 text-red-100 hover:bg-[#8a1425] hover:text-white rounded-lg transition-colors text-sm font-medium"
        >
          <LogOut size={20} strokeWidth={1.5} />
          <span>Sair do Sistema</span>
        </button>
      </div>
    </aside>
  );
}
