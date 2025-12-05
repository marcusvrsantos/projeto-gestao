import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { CheckCircle, XCircle, Calendar, MapPin, Clock } from 'lucide-react';

interface ConvitePublico {
  id: string;
  nomeConvidado: string;
  status: string;
  evento: {
    nome: string;
    data: string;
    local: string;
    descricao: string;
  };
}

export function ConfirmacaoConvite() {
  const { token } = useParams();
  const [convite, setConvite] = useState<ConvitePublico | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    async function carregar() {
      try {
        // Usa a rota pública criada no backend
        const res = await api.get(`/convites/publico/${token}`);
        setConvite(res.data);
      } catch (error) {
        setErro('Convite inválido ou expirado.');
      } finally {
        setLoading(false);
      }
    }
    carregar();
  }, [token]);

  async function responder(resposta: 'CONFIRMADO' | 'RECUSADO') {
    if (!convite) return;
    try {
      await api.post(`/convites/responder/${token}`, { status: resposta });
      // Atualiza estado local para mostrar a mensagem de sucesso
      setConvite({ ...convite, status: resposta });
    } catch (error) {
      alert('Erro ao processar resposta.');
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-500">Carregando convite...</div>;
  if (erro) return <div className="min-h-screen flex items-center justify-center text-red-500 font-bold">{erro}</div>;
  if (!convite) return null;

  const dataEvento = new Date(convite.evento.data);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 font-sans">
      
      {/* Cartão do Convite */}
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
        
        {/* Cabeçalho Vermelho */}
        <div className="bg-[#A6192E] p-8 text-center">
            <img src="/logo-isg.png" alt="ISG" className="h-16 mx-auto mb-4 object-contain brightness-0 invert" />
            <h1 className="text-white text-2xl font-bold">Você foi convidado!</h1>
            <p className="text-red-100 mt-2">Olá, {convite.nomeConvidado}</p>
        </div>

        <div className="p-8">
            <h2 className="text-2xl font-bold text-slate-800 text-center mb-6">{convite.evento.nome}</h2>
            
            <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-slate-700 bg-slate-50 p-4 rounded-lg">
                    <Calendar className="text-[#A6192E]" />
                    <div>
                        <p className="text-xs text-slate-500 font-bold uppercase">Data</p>
                        <p className="font-medium">{dataEvento.toLocaleDateString()}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 text-slate-700 bg-slate-50 p-4 rounded-lg">
                    <Clock className="text-[#A6192E]" />
                    <div>
                        <p className="text-xs text-slate-500 font-bold uppercase">Horário</p>
                        <p className="font-medium">{dataEvento.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 text-slate-700 bg-slate-50 p-4 rounded-lg">
                    <MapPin className="text-[#A6192E]" />
                    <div>
                        <p className="text-xs text-slate-500 font-bold uppercase">Local</p>
                        <p className="font-medium">{convite.evento.local || 'A definir'}</p>
                    </div>
                </div>
            </div>

            {/* Área de Ação */}
            <div className="text-center">
                {convite.status === 'PENDENTE' && (
                    <div className="space-y-3">
                        <p className="text-slate-600 mb-4">Por favor, confirme sua presença:</p>
                        <div className="grid grid-cols-2 gap-4">
                            <button 
                                onClick={() => responder('RECUSADO')}
                                className="w-full py-3 border border-slate-300 text-slate-600 font-bold rounded-lg hover:bg-slate-50 transition-colors"
                            >
                                Não poderei ir
                            </button>
                            <button 
                                onClick={() => responder('CONFIRMADO')}
                                className="w-full py-3 bg-[#A6192E] text-white font-bold rounded-lg hover:bg-[#8a1425] shadow-lg transition-transform transform hover:-translate-y-1"
                            >
                                Confirmar Presença
                            </button>
                        </div>
                    </div>
                )}

                {convite.status === 'CONFIRMADO' && (
                    <div className="bg-green-50 p-6 rounded-xl border border-green-100">
                        <CheckCircle size={48} className="text-green-500 mx-auto mb-3" />
                        <h3 className="text-xl font-bold text-green-700">Presença Confirmada!</h3>
                        <p className="text-green-600 mt-2">Obrigado. Esperamos por você.</p>
                    </div>
                )}

                {convite.status === 'RECUSADO' && (
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                        <XCircle size={48} className="text-slate-400 mx-auto mb-3" />
                        <h3 className="text-xl font-bold text-slate-600">Que pena!</h3>
                        <p className="text-slate-500 mt-2">Sua resposta foi registrada. Obrigado por avisar.</p>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}
