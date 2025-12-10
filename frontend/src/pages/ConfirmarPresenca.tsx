import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { CheckCircle, XCircle, Calendar, MapPin, AlertTriangle } from 'lucide-react';
import logoIsg from '../assets/isg-icon-color.png';

interface DadosConvite {
  id: string;
  nomeConvidado: string;
  emailConvidado: string;
  status: 'PENDENTE' | 'CONFIRMADO' | 'RECUSADO';
  evento: {
    nome: string;
    data: string;
    local: string;
    descricao?: string;
  };
}

export function ConfirmarPresenca() {
  const { token } = useParams();
  const [dados, setDados] = useState<DadosConvite | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [respondendo, setRespondendo] = useState(false);

  useEffect(() => {
    async function carregar() {
      try {
        // Rota pública que valida o token e traz os dados
        const response = await api.get(`/convites/publico/${token}`);
        setDados(response.data);
      } catch (err) {
        setErro('Convite inválido ou expirado.');
      } finally {
        setLoading(false);
      }
    }
    carregar();
  }, [token]);

  async function responder(resposta: 'CONFIRMADO' | 'RECUSADO') {
    if (!dados) return;
    setRespondendo(true);
    try {
      await api.post(`/convites/responder/${token}`, { status: resposta });
      // Atualiza o estado local para refletir a mudança na tela imediatamente
      setDados({ ...dados, status: resposta });
    } catch (err) {
      alert('Erro ao enviar resposta. Tente novamente.');
    } finally {
      setRespondendo(false);
    }
  }

  function formatarData(iso: string) {
    return new Date(iso).toLocaleString('pt-BR', { 
      weekday: 'long', day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' 
    });
  }

  // --- TELA DE CARREGAMENTO ---
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 text-slate-500">
      Carregando informações do convite...
    </div>
  );

  // --- TELA DE ERRO (Token inválido) ---
  if (erro || !dados) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 p-4">
      <AlertTriangle size={48} className="text-red-500 mb-4" />
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Link Inválido</h1>
      <p className="text-slate-600">{erro || 'Não foi possível encontrar este convite.'}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-12 px-4 font-sans">
      
      {/* CARD PRINCIPAL */}
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-fade-in scale-in-center">
        
        {/* CABEÇALHO DO EVENTO */}
        <div className="bg-[#A6192E] p-8 text-center text-white">
            <img src={logoIsg} alt="ISG" className="h-12 mx-auto mb-4 brightness-0 invert" />
            <h2 className="text-sm font-bold opacity-80 uppercase tracking-wider mb-2">Você foi convidado para</h2>
            <h1 className="text-3xl font-bold mb-4">{dados.evento.nome}</h1>
            
            <div className="flex flex-col gap-2 text-sm font-medium opacity-90">
                <span className="flex items-center justify-center gap-2">
                    <Calendar size={18} /> {formatarData(dados.evento.data)}
                </span>
                <span className="flex items-center justify-center gap-2">
                    <MapPin size={18} /> {dados.evento.local || 'Local a definir'}
                </span>
            </div>
        </div>

        {/* CONTEÚDO */}
        <div className="p-8 text-center">
            <p className="text-lg text-slate-700 mb-8">
                Olá, <strong>{dados.nomeConvidado}</strong>! <br/>
                {dados.status === 'PENDENTE' 
                    ? 'Por favor, confirme sua presença abaixo.' 
                    : 'Agradecemos por responder ao convite.'}
            </p>

            {/* AÇÕES (Se Pendente) */}
            {dados.status === 'PENDENTE' && (
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button 
                        onClick={() => responder('RECUSADO')}
                        disabled={respondendo}
                        className="flex-1 py-3 px-6 border-2 border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 hover:border-slate-300 transition flex items-center justify-center gap-2"
                    >
                        <XCircle size={20} /> Não poderei ir
                    </button>
                    
                    <button 
                        onClick={() => responder('CONFIRMADO')}
                        disabled={respondendo}
                        className="flex-1 py-3 px-6 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 shadow-lg shadow-green-200 transition transform hover:-translate-y-1 flex items-center justify-center gap-2"
                    >
                        <CheckCircle size={20} /> Confirmar Presença
                    </button>
                </div>
            )}

            {/* FEEDBACK (Se já respondeu) */}
            {dados.status === 'CONFIRMADO' && (
                <div className="bg-green-50 text-green-700 p-6 rounded-xl border border-green-200 flex flex-col items-center animate-fade-in">
                    <CheckCircle size={48} className="mb-2" />
                    <h3 className="text-xl font-bold">Presença Confirmada!</h3>
                    <p className="text-sm mt-1">Sua presença já está na nossa lista. Te esperamos lá!</p>
                    <button onClick={() => responder('RECUSADO')} className="text-xs text-green-600 underline mt-4 hover:text-green-800">
                        Mudei de ideia, desejo cancelar.
                    </button>
                </div>
            )}

            {dados.status === 'RECUSADO' && (
                <div className="bg-slate-100 text-slate-600 p-6 rounded-xl border border-slate-200 flex flex-col items-center animate-fade-in">
                    <XCircle size={48} className="mb-2 text-slate-400" />
                    <h3 className="text-xl font-bold">Convite Recusado</h3>
                    <p className="text-sm mt-1">Que pena que você não poderá comparecer.</p>
                    <button onClick={() => responder('CONFIRMADO')} className="text-xs text-slate-500 underline mt-4 hover:text-slate-700">
                        Mudei de ideia, quero confirmar.
                    </button>
                </div>
            )}
        </div>
      </div>
      
      <p className="mt-8 text-xs text-slate-400">Sistema de Gestão de Eventos • ISG Participações S.A.</p>
    </div>
  );
}