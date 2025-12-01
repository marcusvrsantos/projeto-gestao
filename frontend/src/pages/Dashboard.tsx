import { useEffect, useState } from 'react';
import api from '../services/api';
import { Users, Truck, Calendar, DollarSign, ArrowUpRight } from 'lucide-react';

export function Dashboard() {
  const [stats, setStats] = useState({
    colaboradores: 0,
    fornecedores: 0,
    eventos: 0,
    orcamentos: 0
  });

  useEffect(() => {
    // Busca os dados reais assim que a tela abre
    api.get('/dashboard/stats')
      .then(response => {
        setStats(response.data);
      })
      .catch(err => console.error("Erro ao carregar dashboard", err));
  }, []);

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      <h1 className="text-2xl font-bold text-slate-800">Visão Geral</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card Colaboradores */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-sm font-semibold mb-1">Colaboradores</p>
              <h3 className="text-3xl font-bold text-slate-800">{stats.colaboradores}</h3>
            </div>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Users size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-slate-400">
            <span className="text-green-600 flex items-center font-bold mr-1">
              <ArrowUpRight size={12} className="mr-0.5"/> Ativos
            </span>
            na base de dados
          </div>
        </div>

        {/* Card Fornecedores */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-sm font-semibold mb-1">Fornecedores</p>
              <h3 className="text-3xl font-bold text-slate-800">{stats.fornecedores}</h3>
            </div>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Truck size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-slate-400">
            <span className="text-slate-600 font-bold mr-1">Parceiros</span>
            cadastrados
          </div>
        </div>

        {/* Card Eventos (Futuro) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-sm font-semibold mb-1">Eventos</p>
              <h3 className="text-3xl font-bold text-slate-800">{stats.eventos}</h3>
            </div>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Calendar size={24} />
            </div>
          </div>
          <div className="mt-4 text-xs text-slate-400">Agendados no sistema</div>
        </div>

        {/* Card Orçamentos (Futuro) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-sm font-semibold mb-1">Orçamentos</p>
              <h3 className="text-3xl font-bold text-slate-800">R$ 0,00</h3>
            </div>
            <div className="p-2 bg-green-50 text-green-600 rounded-lg">
              <DollarSign size={24} />
            </div>
          </div>
          <div className="mt-4 text-xs text-slate-400">Valor total aprovado</div>
        </div>

      </div>
    </div>
  );
}
