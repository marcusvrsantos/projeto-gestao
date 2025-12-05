import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Truck, Calendar, DollarSign, LogOut, UserPlus } from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export function Sidebar() {
  const { signOut } = useContext(AuthContext);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Início', path: '/dashboard' },
    { icon: Users, label: 'Colaboradores', path: '/colaboradores' },
    { icon: UserPlus, label: 'Convidados', path: '/convidados-externos' },
    { icon: Truck, label: 'Fornecedores', path: '/fornecedores' },
    { icon: Calendar, label: 'Eventos', path: '/eventos' },
    { icon: DollarSign, label: 'Orçamentos', path: '/orcamentos' },
  ];

  return (
    <aside className="w-64 bg-[#A6192E] text-white flex flex-col h-screen fixed left-0 top-0 shadow-xl z-20">
      
      {/* Área da Logo (Imagem) */}
      <div className="h-24 flex items-center justify-center px-6 border-b border-[#8a1425]">
        <img 
          src="/logo-isg.png" 
          alt="ISG Participações S.A." 
          className="h-16 w-auto object-contain"
        />
      </div>

      <nav className="flex-1 py-6 px-4 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium text-sm ${
                isActive 
                  ? 'bg-[#700018] text-white shadow-md translate-x-1' 
                  : 'text-red-100 hover:bg-[#8a1425] hover:text-white'
              }`
            }
          >
            <item.icon size={20} strokeWidth={1.5} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-[#8a1425]">
        <button onClick={signOut} className="flex items-center gap-3 w-full px-4 py-3 text-red-100 hover:bg-[#8a1425] hover:text-white rounded-lg transition-colors text-sm font-medium">
          <LogOut size={20} strokeWidth={1.5} />
          <span>Sair do Sistema</span>
        </button>
      </div>
    </aside>
  );
}
