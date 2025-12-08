import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  ArrowLeft, Calendar, MapPin, Users, Mail, Plus, Trash2, 
  CheckCircle, AlertCircle, AlertTriangle, Search, X, Filter 
} from 'lucide-react';

// --- INTERFACES ---
interface Evento {
  id: string;
  nome: string;
  data: string;
  local?: string;
  descricao?: string;
  status: string;
}

interface Convidado {
  id: string;
  nomeConvidado: string;
  emailConvidado: string;
  status: 'PENDENTE' | 'CONFIRMADO' | 'RECUSADO';
}

interface PessoaDisponivel {
  id: string;
  nome: string;
  email: string;
  empresaNome?: string; // Para o filtro de unidade
}

interface Empresa { id: string; razaoSocial: string; }

// --- MODAIS PADRÃO ISG ---
interface MessageModalData { show: boolean; title: string; message: string; type: 'success' | 'error'; }
interface ConfirmModalData { show: boolean; action: 'DELETE' | 'SEND' | null; data?: any; }

export function EventoDetalhes() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Estados de Dados
  const [evento, setEvento] = useState<Evento | null>(null);
  const [convidados, setConvidados] = useState<Convidado[]>([]);
  const [pessoasDisponiveis, setPessoasDisponiveis] = useState<PessoaDisponivel[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados de Ação
  const [selectedPessoas, setSelectedPessoas] = useState<string[]>([]);
  const [filtroUnidade, setFiltroUnidade] = useState('todas');
  const [showAddModal, setShowAddModal] = useState(false);
  const [sending, setSending] = useState(false);

  // Estados dos Modais Visuais (Substitutos dos Alerts)
  const [msgModal, setMsgModal] = useState<MessageModalData>({ show: false, title: '', message: '', type: 'success' });
  const [confirmModal, setConfirmModal] = useState<ConfirmModalData>({ show: false, action: null });

  useEffect(() => {
    carregarTudo();
  }, [id]);

  async function carregarTudo() {
    try {
      const [resEv, resConv, resEmp, resColab] = await Promise.all([
        api.get(`/eventos/${id}`),
        api.get(`/convites/evento/${id}`),
        api.get('/empresas'),
        api.get('/colaboradores') // Assumindo que essa rota retorna todos os colaboradores para adicionar
      ]);
      
      setEvento(resEv.data);
      setConvidados(resConv.data);
      setEmpresas(resEmp.data);
      
      // Prepara lista de pessoas disponíveis (mapeando dados de colaboradores)
      const pessoas: PessoaDisponivel[] = resColab.data.map((c: any) => ({
        id: c.id,
        nome: c.nome,
        email: c.email,
        empresaNome: resEmp.data.find((e: any) => e.id === c.empresaId)?.razaoSocial || 'Outra'
      }));
      setPessoasDisponiveis(pessoas);
      
    } catch (error) {
      showMessage('Erro', 'Falha ao carregar detalhes do evento.', 'error');
    } finally {
      setLoading(false);
    }
  }

  // --- FUNÇÕES AUXILIARES ---
  function showMessage(title: string, message: string, type: 'success' | 'error') {
    setMsgModal({ show: true, title, message, type });
  }

  function formatarData(iso: string) {
    return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
  }

  // --- LÓGICA DE ADICIONAR PESSOAS (Substitui Alert da img 133854) ---
  function toggleSelection(pessoaId: string) {
    if (selectedPessoas.includes(pessoaId)) {
      setSelectedPessoas(selectedPessoas.filter(id => id !== pessoaId));
    } else {
      setSelectedPessoas([...selectedPessoas, pessoaId]);
    }
  }

  function toggleSelectAll() {
    const filtradas = getPessoasFiltradas();
    const idsFiltrados = filtradas.map(p => p.id);
    
    const allSelected = idsFiltrados.every(id => selectedPessoas.includes(id));
    
    if (allSelected) {
      // Remove apenas os visíveis da seleção
      setSelectedPessoas(selectedPessoas.filter(id => !idsFiltrados.includes(id)));
    } else {
      // Adiciona os visíveis que faltam
      const novos = [...selectedPessoas];
      idsFiltrados.forEach(id => { if(!novos.includes(id)) novos.push(id); });
      setSelectedPessoas(novos);
    }
  }

  function getPessoasFiltradas() {
    let lista = pessoasDisponiveis;
    // Remove quem já é convidado
    const emailsConvidados = convidados.map(c => c.emailConvidado);
    lista = lista.filter(p => !emailsConvidados.includes(p.email));

    if (filtroUnidade !== 'todas') {
      // Aqui assumo que você tem o nome da empresa ou ID. 
      // Ajuste conforme seu backend. O exemplo usa o nome mapeado.
      const emp = empresas.find(e => e.id === filtroUnidade);
      if (emp) lista = lista.filter(p => p.empresaNome === emp.razaoSocial);
    }
    return lista;
  }

  async function handleAdicionarSelecionados() {
    if (selectedPessoas.length === 0) return;
    
    const selecionados = pessoasDisponiveis.filter(p => selectedPessoas.includes(p.id));
    const payload = {
      eventoId: id,
      listaPessoas: selecionados.map(p => ({ nome: p.nome, email: p.email }))
    };

    try {
      await api.post('/convites/adicionar', payload);
      setShowAddModal(false);
      setSelectedPessoas([]);
      carregarTudo();
      // AQUI: Substitui o alert("Pessoas adicionadas!") por Modal Visual
      showMessage('Sucesso', `${selecionados.length} pessoas adicionadas à lista!`, 'success');
    } catch (error) {
      showMessage('Erro', 'Falha ao adicionar pessoas.', 'error');
    }
  }

  // --- LÓGICA DE EXCLUSÃO (Substitui Confirm da img 133827) ---
  function solicitarExclusao(conviteId: string) {
    setConfirmModal({ show: true, action: 'DELETE', data: conviteId });
  }

  // --- LÓGICA DE ENVIO (Substitui Confirm da img 133927) ---
  function solicitarEnvio() {
    const pendentes = convidados.filter(c => c.status === 'PENDENTE').length;
    if (pendentes === 0) return showMessage('Aviso', 'Não há convites pendentes.', 'error');
    setConfirmModal({ show: true, action: 'SEND', data: pendentes });
  }

  // --- AÇÃO CONFIRMADA ---
  async function handleConfirmAction() {
    setConfirmModal({ ...confirmModal, show: false }); // Fecha pergunta

    if (confirmModal.action === 'DELETE') {
      try {
        await api.delete(`/convites/${confirmModal.data}`);
        setConvidados(convidados.filter(c => c.id !== confirmModal.data));
        // AQUI: Modal Visual de Sucesso
        showMessage('Excluído', 'Convidado removido da lista.', 'success');
      } catch (err) { showMessage('Erro', 'Não foi possível remover.', 'error'); }
    }

    if (confirmModal.action === 'SEND') {
      setSending(true);
      try {
        const res = await api.post('/convites/disparar', { eventoId: id });
        carregarTudo();
        // AQUI: Modal Visual de Sucesso (Substitui alert da img 133944)
        showMessage('Sucesso', res.data.message || 'Convites enviados!', 'success');
      } catch (err) { showMessage('Erro', 'Falha ao enviar e-mails.', 'error'); }
      finally { setSending(false); }
    }
  }

  if (loading) return <div className="p-8 text-center text-slate-500">Carregando evento...</div>;
  if (!evento) return <div className="p-8 text-center text-slate-500">Evento não encontrado.</div>;

  const pendentesCount = convidados.filter(c => c.status === 'PENDENTE').length;

  return (
    <div className="font-sans space-y-6">
      {/* HEADER */}
      <div className="flex items-center gap-4 border-b border-slate-200 pb-6">
        <button onClick={() => navigate('/eventos')} className="p-2 hover:bg-slate-200 rounded-full transition text-slate-500">
          <ArrowLeft size={24} />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-slate-800">{evento.nome}</h1>
          <div className="flex items-center gap-6 mt-2 text-slate-500 text-sm">
            <span className="flex items-center gap-1"><Calendar size={16}/> {formatarData(evento.data)}</span>
            <span className="flex items-center gap-1"><MapPin size={16}/> {evento.local || 'Local a definir'}</span>
            <span className={`px-2 py-0.5 rounded text-xs font-bold border ${evento.status === 'REALIZADO' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-blue-100 text-blue-700 border-blue-200'}`}>
              {evento.status}
            </span>
          </div>
        </div>
        
        <div className="flex gap-2">
            <button className="px-4 py-2 border border-slate-300 text-slate-700 font-bold rounded hover:bg-slate-50 flex items-center gap-2">
                <Search size={18}/> Baixar Lista
            </button>
            <button 
                onClick={solicitarEnvio}
                disabled={sending || pendentesCount === 0}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded flex items-center gap-2 shadow-sm transition-colors"
            >
                <Mail size={18}/> {sending ? 'Enviando...' : 'Enviar Convites'}
            </button>
            <button 
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-[#A6192E] hover:bg-[#8a1425] text-white font-bold rounded flex items-center gap-2 shadow-sm transition-colors"
            >
                <Plus size={18}/> Adicionar Pessoas
            </button>
        </div>
      </div>

      {/* LISTA DE CONVIDADOS */}
      <div className="bg-white rounded-lg shadow border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-slate-700 flex items-center gap-2"><Users size={20}/> Lista de Presença ({convidados.length})</h3>
            <span className="text-xs font-bold text-slate-400 uppercase">Gerenciar Convidados</span>
        </div>
        <table className="w-full text-left">
            <thead className="bg-white border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                    <th className="px-6 py-3">Nome</th>
                    <th className="px-6 py-3">E-mail</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Ações</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
                {convidados.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-700">{c.nomeConvidado}</td>
                        <td className="px-6 py-4 text-slate-500">{c.emailConvidado}</td>
                        <td className="px-6 py-4">
                            {c.status === 'CONFIRMADO' && <span className="text-green-600 font-bold flex items-center gap-1"><CheckCircle size={14}/> Confirmado</span>}
                            {c.status === 'PENDENTE' && <span className="text-amber-600 font-bold flex items-center gap-1"><AlertCircle size={14}/> Pendente</span>}
                            {c.status === 'RECUSADO' && <span className="text-red-600 font-bold flex items-center gap-1"><X size={14}/> Recusado</span>}
                        </td>
                        <td className="px-6 py-4 text-right">
                            <button onClick={() => solicitarExclusao(c.id)} className="text-red-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors" title="Remover da lista">
                                <Trash2 size={18}/>
                            </button>
                        </td>
                    </tr>
                ))}
                {convidados.length === 0 && (
                    <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-400">Nenhum convidado adicionado ainda.</td></tr>
                )}
            </tbody>
        </table>
      </div>

      {/* --- MODAL DE SELEÇÃO DE PESSOAS (Substitui o da img 133854) --- */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
            <div className="bg-white rounded-xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[90vh] scale-in-center">
                <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-[#A6192E]">Selecionar Convidados</h2>
                        <p className="text-slate-500 text-sm">Escolha colaboradores para adicionar à lista deste evento.</p>
                    </div>
                    <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">Fechar</button>
                </div>
                
                {/* Filtros */}
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center gap-4">
                    <Filter size={20} className="text-slate-400"/>
                    <select 
                        className="flex-1 border border-slate-300 rounded p-2 outline-none focus:border-[#A6192E]"
                        value={filtroUnidade}
                        onChange={e => setFiltroUnidade(e.target.value)}
                    >
                        <option value="todas">Todas as Unidades</option>
                        {empresas.map(e => <option key={e.id} value={e.id}>{e.razaoSocial}</option>)}
                    </select>
                    <button onClick={toggleSelectAll} className="text-[#A6192E] font-bold text-sm hover:underline whitespace-nowrap">
                        Selecionar Todos da Lista
                    </button>
                </div>

                {/* Lista com Checkboxes */}
                <div className="flex-1 overflow-y-auto p-2">
                    <table className="w-full text-left">
                        <thead className="bg-white sticky top-0 z-10">
                            <tr>
                                <th className="px-4 py-2 w-10"></th>
                                <th className="px-4 py-2 text-xs font-bold text-slate-500 uppercase">Nome</th>
                                <th className="px-4 py-2 text-xs font-bold text-slate-500 uppercase">Unidade / Tipo</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {getPessoasFiltradas().map(p => (
                                <tr key={p.id} className={`hover:bg-slate-50 transition-colors cursor-pointer ${selectedPessoas.includes(p.id) ? 'bg-red-50' : ''}`} onClick={() => toggleSelection(p.id)}>
                                    <td className="px-4 py-3 text-center">
                                        <input 
                                            type="checkbox" 
                                            checked={selectedPessoas.includes(p.id)}
                                            onChange={() => {}} // Gerenciado pelo onClick da TR
                                            className="w-5 h-5 text-[#A6192E] rounded border-slate-300 focus:ring-[#A6192E]"
                                        />
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="font-bold text-slate-700">{p.nome}</div>
                                        <div className="text-slate-500 text-xs">{p.email}</div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{p.empresaNome}</td>
                                </tr>
                            ))}
                            {getPessoasFiltradas().length === 0 && (
                                <tr><td colSpan={3} className="p-8 text-center text-slate-400">Nenhuma pessoa encontrada com os filtros atuais.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 border-t border-slate-200 flex justify-between items-center bg-slate-50 rounded-b-xl">
                    <span className="text-slate-600 font-medium">{selectedPessoas.length} selecionados</span>
                    <div className="flex gap-3">
                        <button onClick={() => setShowAddModal(false)} className="px-6 py-2 text-slate-600 hover:text-slate-800 font-bold">Cancelar</button>
                        <button 
                            onClick={handleAdicionarSelecionados}
                            disabled={selectedPessoas.length === 0}
                            className="px-6 py-2 bg-[#A6192E] hover:bg-[#8a1425] disabled:opacity-50 text-white font-bold rounded shadow-md transition-colors"
                        >
                            Adicionar Selecionados
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* --- MENSAGEM GLOBAL PADRÃO ISG (Sucesso/Erro) --- */}
      {msgModal.show && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[70] animate-fade-in font-sans">
          <div className="bg-white p-8 rounded-2xl w-full max-w-sm shadow-2xl text-center scale-in-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto ${msgModal.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              {msgModal.type === 'success' ? <CheckCircle size={32} /> : <AlertCircle size={32} />}
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">{msgModal.title}</h3>
            <p className="text-slate-600 mb-6 leading-relaxed">{msgModal.message}</p>
            <button onClick={() => setMsgModal({ ...msgModal, show: false })} className="w-full py-3 bg-[#900020] text-white font-bold rounded-full hover:bg-[#700018] shadow-md transition-transform active:scale-95">
                OK, entendi
            </button>
          </div>
        </div>
      )}

      {/* --- CONFIRMAÇÃO PADRÃO ISG (Excluir ou Enviar) --- */}
      {confirmModal.show && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[70] animate-fade-in font-sans">
          <div className="bg-white p-8 rounded-2xl w-full max-w-sm shadow-2xl text-center scale-in-center border-t-4 border-amber-500">
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-4 mx-auto">
              {confirmModal.action === 'SEND' ? <Mail size={32} /> : <AlertTriangle size={32} />}
            </div>
            
            <h3 className="text-xl font-bold text-slate-800 mb-2">
                {confirmModal.action === 'SEND' ? 'Confirmar Envio?' : 'Remover da Lista?'}
            </h3>
            
            <p className="text-slate-600 mb-6 leading-relaxed">
                {confirmModal.action === 'SEND' 
                    ? `Deseja enviar convites para ${confirmModal.data} pessoas pendentes?`
                    : 'Esta pessoa não receberá mais notificações deste evento.'}
            </p>

            <div className="flex gap-3">
              <button onClick={() => setConfirmModal({ show: false, action: null })} className="flex-1 py-3 border border-slate-300 text-slate-700 font-bold rounded-full hover:bg-slate-50 transition-colors">
                Cancelar
              </button>
              <button onClick={handleConfirmAction} className={`flex-1 py-3 text-white font-bold rounded-full shadow-md transition-colors ${confirmModal.action === 'SEND' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'}`}>
                {confirmModal.action === 'SEND' ? 'Sim, Enviar' : 'Sim, Remover'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
