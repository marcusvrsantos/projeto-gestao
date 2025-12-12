import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  Users, Truck, Calendar, DollarSign, ArrowUpRight, 
  MapPin, Clock, ChevronRight 
} from 'lucide-react';

interface Stats {
  colaboradores: number;
  fornecedores: number;
  eventos: number;
  orcamentos: number;
}

interface Evento {
  id: string;
  nome: string;
  data: string;
  local?: string;
  status: string;
}

export function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({
    colaboradores: 0,
    fornecedores: 0,
    eventos: 0,
    orcamentos: 0
  });
  
  const [proximosEventos, setProximosEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarDados() {
      try {
        // 1. Busca Estatísticas Gerais
        const resStats = await api.get('/dashboard/stats');
        setStats(resStats.data);

        // 2. Busca e Filtra os Próximos Eventos
        const resEventos = await api.get('/eventos');
        const todosEventos: Evento[] = resEventos.data;
        
        const hoje = new Date();
        hoje.setHours(0,0,0,0); // Zera hora para comparar apenas data

        const futuros = todosEventos
          .filter(e => {
            const dataEvento = new Date(e.data);
            return dataEvento >= hoje && e.status !== 'CANCELADO';
          })
          .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime()) // Ordena do mais próximo ao mais distante
          .slice(0, 5); // Pega apenas os 5 primeiros

        setProximosEventos(futuros);
      } catch (err) {
        console.error("Erro ao carregar dashboard:", err);
      } finally {
        setLoading(false);
      }
    }

    carregarDados();
  }, []);

  // Formata dia e mês para o "calendário" visual
  function getDateParts(iso: string) {
    const d = new Date(iso);
    return {
      dia: d.getDate(),
      mes: d.toLocaleString('pt-BR', { month: 'short' }).toUpperCase(),
      hora: d.toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };
  }

  // Formata moeda (para o card de orçamentos)
  const valorOrcamentos = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.orcamentos);

  if (loading) return <div className="p-8 text-center text-slate-500">Carregando painel...</div>;

  return (
    <div className="space-y-8 animate-fade-in font-sans pb-10">
      
      {/* --- CABEÇALHO --- */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Visão Geral</h1>
        <p className="text-slate-500 text-sm">Acompanhe os principais indicadores do sistema.</p>
      </div>
      
      {/* --- CARDS DE ESTATÍSTICAS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card Colaboradores */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wide mb-1">Colaboradores</p>
              <h3 className="text-3xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{stats.colaboradores}</h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 transition-transform">
              <Users size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-slate-400 font-medium">
            <span className="text-green-600 flex items-center font-bold mr-1 bg-green-50 px-1.5 py-0.5 rounded">
              <ArrowUpRight size={12} className="mr-0.5"/> Ativos
            </span>
            na base de dados
          </div>
        </div>

        {/* Card Fornecedores */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wide mb-1">Fornecedores</p>
              <h3 className="text-3xl font-bold text-slate-800 group-hover:text-amber-600 transition-colors">{stats.fornecedores}</h3>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl group-hover:scale-110 transition-transform">
              <Truck size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-slate-400 font-medium">
            <span className="text-slate-600 font-bold mr-1 bg-slate-100 px-1.5 py-0.5 rounded">Parceiros</span>
            cadastrados
          </div>
        </div>

        {/* Card Eventos */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group cursor-pointer" onClick={() => navigate('/eventos')}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wide mb-1">Eventos</p>
              <h3 className="text-3xl font-bold text-slate-800 group-hover:text-[#A6192E] transition-colors">{stats.eventos}</h3>
            </div>
            <div className="p-3 bg-red-50 text-[#A6192E] rounded-xl group-hover:scale-110 transition-transform">
              <Calendar size={24} />
            </div>
          </div>
          <div className="mt-4 text-xs text-slate-400 font-medium">Agendados no sistema</div>
        </div>

        {/* Card Orçamentos */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wide mb-1">Orçamentos</p>
              {/* Agora formata o valor se vier do banco, ou mostra 0,00 */}
              <h3 className="text-2xl font-bold text-slate-800 group-hover:text-green-600 transition-colors">{valorOrcamentos}</h3>
            </div>
            <div className="p-3 bg-green-50 text-green-600 rounded-xl group-hover:scale-110 transition-transform">
              <DollarSign size={24} />
            </div>
          </div>
          <div className="mt-4 text-xs text-slate-400 font-medium">Valor total aprovado</div>
        </div>
      </div>

      {/* --- NOVA SEÇÃO: PRÓXIMOS EVENTOS --- */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="font-bold text-slate-800 flex items-center gap-2">
                <Calendar className="text-[#A6192E]" size={20}/> Próximos Eventos
            </h2>
            <button onClick={() => navigate('/eventos')} className="text-xs font-bold text-slate-500 hover:text-[#A6192E] flex items-center gap-1 transition-colors">
                Ver todos <ChevronRight size={14}/>
            </button>
        </div>
        
        <div className="divide-y divide-slate-50">
            {proximosEventos.length > 0 ? (
                proximosEventos.map(evento => {
                    const { dia, mes, hora } = getDateParts(evento.data);
                    return (
                        <div 
                            key={evento.id} 
                            onClick={() => navigate(`/eventos/${evento.id}`)}
                            className="p-4 flex items-center gap-4 hover:bg-red-50/50 transition cursor-pointer group"
                        >
                            {/* Bloco de Data */}
                            <div className="flex flex-col items-center justify-center w-12 h-12 bg-slate-100 rounded-lg group-hover:bg-[#A6192E] group-hover:text-white transition-colors duration-300">
                                <span className="text-lg font-bold leading-none">{dia}</span>
                                <span className="text-[10px] font-bold uppercase leading-none mt-0.5">{mes}</span>
                            </div>

                            {/* Detalhes */}
                            <div className="flex-1">
                                <h4 className="text-slate-800 font-bold group-hover:text-[#A6192E] transition-colors">{evento.nome}</h4>
                                <div className="flex items-center gap-4 mt-1">
                                    <span className="text-xs text-slate-500 flex items-center gap-1">
                                        <Clock size={12}/> {hora}
                                    </span>
                                    <span className="text-xs text-slate-500 flex items-center gap-1">
                                        <MapPin size={12}/> {evento.local || 'Local a definir'}
                                    </span>
                                </div>
                            </div>

                            {/* Seta e Status */}
                            <div className="text-right">
                                <span className={`text-[10px] px-2 py-1 rounded-full font-bold border ${evento.status === 'CONFIRMADO' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                                    {evento.status}
                                </span>
                            </div>
                        </div>
                    );
                })
            ) : (
                <div className="p-8 text-center text-slate-400 text-sm">
                    Nenhum evento agendado para os próximos dias.
                    <br/>
                    <button onClick={() => navigate('/eventos')} className="text-[#A6192E] font-bold hover:underline mt-2">Agendar novo evento</button>
                </div>
            )}
        </div>
      </div>

    </div>
  );
}