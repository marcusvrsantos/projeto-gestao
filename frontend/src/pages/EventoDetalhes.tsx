import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  ArrowLeft, Calendar, MapPin, Users, Mail, Plus, Trash2, 
  CheckCircle, AlertCircle, AlertTriangle, Filter, X 
} from 'lucide-react'; // Removi o 'Search' que não estava sendo usado

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
  empresaNome?: string;
  tipo?: string;
}

interface Empresa { id: string; razaoSocial: string; }

interface MessageModalData { show: boolean; title: string; message: string; type: 'success' | 'error'; }
interface ConfirmModalData { show: boolean; action: 'DELETE' | 'SEND' | null; data?: any; }

export function EventoDetalhes() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [evento, setEvento] = useState<Evento | null>(null);
  const [convidados, setConvidados] = useState<Convidado[]>([]);
  // Mantive o nome no plural aqui
  const [pessoasDisponiveis, setPessoasDisponiveis] = useState<PessoaDisponivel[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedPessoas, setSelectedPessoas] = useState<string[]>([]);
  const [filtroUnidade, setFiltroUnidade] = useState('todas');
  const [showAddModal, setShowAddModal] = useState(false);
  const [sending, setSending] = useState(false);

  // ... outros estados
  const [viewMode, setViewMode] = useState<'LIST' | 'CREATE'>('LIST'); // Controla se vê a lista ou o formulário
  const [newGuest, setNewGuest] = useState({ nome: '', email: '', empresa: '' }); // Dados do formulário

  const [msgModal, setMsgModal] = useState<MessageModalData>({ show: false, title: '', message: '', type: 'success' });
  const [confirmModal, setConfirmModal] = useState<ConfirmModalData>({ show: false, action: null });

  useEffect(() => { carregarTudo(); }, [id]);

async function carregarTudo() {
    setLoading(true);
    console.log("--- ATUALIZANDO DADOS ---");

    try {
      // 1. Carrega Evento
      const resEv = await api.get(`/eventos/${id}`);
      setEvento(resEv.data);

    // 2. TENTA CARREGAR OS DADOS SECUNDÁRIOS (Colaboradores + Externos)
    try {
        // Chamamos as 3 rotas: Empresas, Colaboradores e a SUA rota de Externos
        const [resEmp, resColab, resExt] = await Promise.all([
            api.get('/empresas'),
            api.get('/colaboradores'),
            api.get('/convidados-externos') // <--- CORRIGIDO: Nome exato que está no server.ts
        ]);
        setEmpresas(resEmp.data);

        // --- TRATAMENTO DOS INTERNOS (Colaboradores) ---
        const internos = resColab.data.map((c: any) => ({
            id: c.id,
            nome: c.nome,
            email: c.email,
            tipo: 'INTERNO', // Marcador visual (opcional)
            empresaNome: resEmp.data.find((e: any) => e.id === c.empresaId)?.razaoSocial || 'Interno'
        }));

        // --- TRATAMENTO DOS EXTERNOS (Convidados) ---
        const externos = resExt.data.map((e: any) => ({
            id: e.id,
            nome: e.nome,
            email: e.email,
            tipo: 'EXTERNO', // Marcador visual
            // Se o externo tiver o campo 'empresa', usa ele. Se não, exibe "Externo"
            empresaNome: e.empresa || 'Convidado Externo'
        }));

        // JUNTA AS DUAS LISTAS EM UMA SÓ
        // O sort garante que fiquem em ordem alfabética, misturando internos e externos
        const listaCompleta = [...internos, ...externos].sort((a, b) => a.nome.localeCompare(b.nome));
        
        setPessoasDisponiveis(listaCompleta);

    } catch (err) {
        console.warn("⚠️ Aviso: Falha ao carregar listas de pessoas (internos ou externos).", err);
    }

      // 3. CARREGA CONVITES (Com Blindagem de Dados)
      try {
        const resConv = await api.get(`/convites/evento/${id}`);
        console.log("📦 Convites que vieram da API:", resConv.data); // <--- OLHE ISSO NO F12
        
        // ADAPTADOR: Previne erro se o backend mandar nomes diferentes
        const listaFormatada = resConv.data.map((item: any) => ({
            id: item.id,
            // Tenta pegar 'nomeConvidado', se não existir pega 'nome', se não 'name'
            nomeConvidado: item.nomeConvidado || item.nome || item.name || 'Sem nome',
            // Tenta pegar 'emailConvidado', se não existir pega 'email'
            emailConvidado: item.emailConvidado || item.email || 'Sem email',
            status: item.status
        }));

        setConvidados(listaFormatada);
      } catch (err) {
        console.warn("Nenhum convite encontrado ou erro na API.", err);
        setConvidados([]);
      }

    } catch (error: any) {
      console.error("Erro geral:", error);
    } finally {
      setLoading(false);
    }
  }

  function toggleSelection(pessoaId: string) {
    if (selectedPessoas.includes(pessoaId)) {
      setSelectedPessoas(selectedPessoas.filter(sid => sid !== pessoaId));
    } else {
      setSelectedPessoas([...selectedPessoas, pessoaId]);
    }
  }

  function toggleSelectAll() {
    const filtradas = getPessoasFiltradas();
    const idsFiltrados = filtradas.map(p => p.id);
    const allSelected = idsFiltrados.every(fid => selectedPessoas.includes(fid));
    
    if (allSelected) {
      setSelectedPessoas(selectedPessoas.filter(sid => !idsFiltrados.includes(sid)));
    } else {
      const novos = [...selectedPessoas];
      idsFiltrados.forEach(fid => { if(!novos.includes(fid)) novos.push(fid); });
      setSelectedPessoas(novos);
    }
  }

  function getPessoasFiltradas() {
    // 1. Remove quem já foi convidado
    let lista = pessoasDisponiveis.filter(p => !convidados.some(c => c.emailConvidado === p.email));
    
    // 2. Lógica do Dropdown
    if (filtroUnidade === 'externos') {
        // Se selecionou "Convidados Externos", filtra pela tag que criamos
        return lista.filter(p => p.tipo === 'EXTERNO');
    }

    if (filtroUnidade !== 'todas') {
      // Se selecionou uma empresa específica (ISG, etc)
      const emp = empresas.find(e => e.id === filtroUnidade);
      // Filtra pelo nome da empresa
      if (emp) lista = lista.filter(p => p.empresaNome === emp.razaoSocial);
    }
    
    return lista;
  }

  async function handleAdicionarSelecionados() {
    if (selectedPessoas.length === 0) return;
    
    const selecionados = pessoasDisponiveis.filter(p => selectedPessoas.includes(p.id));
    
    // Verifique se o seu Back-end espera 'listaPessoas' ou 'convidados'
    const payload = {
      eventoId: id,
      listaPessoas: selecionados.map(p => ({ nome: p.nome, email: p.email }))
    };

    try {
      // 1. Envia para o banco
      await api.post('/convites/adicionar', payload);
      
      // 2. Limpa a seleção visual
      setShowAddModal(false);
      setSelectedPessoas([]);
      
      // 3. AGUARDA recarregar a lista do servidor (O pulo do gato 🐱)
      await carregarTudo();
      
      setMsgModal({ show: true, title: 'Sucesso', message: `${selecionados.length} pessoas adicionadas!`, type: 'success' });
    } catch (error) {
      console.error("Erro ao adicionar:", error);
      setMsgModal({ show: true, title: 'Erro', message: 'Falha ao adicionar pessoas.', type: 'error' });
    }
  }

  function solicitarExclusao(conviteId: string) {
    setConfirmModal({ show: true, action: 'DELETE', data: conviteId });
  }

  function solicitarEnvio() {
    const pendentes = convidados.filter(c => c.status === 'PENDENTE').length;
    if (pendentes === 0) {
      setMsgModal({ show: true, title: 'Aviso', message: 'Não há convites pendentes.', type: 'error' });
      return;
    }
    setConfirmModal({ show: true, action: 'SEND', data: pendentes });
  }

  async function handleConfirmAction() {
    setConfirmModal({ ...confirmModal, show: false });

    if (confirmModal.action === 'DELETE') {
      try {
        await api.delete(`/convites/${confirmModal.data}`);
        setConvidados(convidados.filter(c => c.id !== confirmModal.data));
        setMsgModal({ show: true, title: 'Excluído', message: 'Convidado removido da lista.', type: 'success' });
      } catch (err: any) { // CORREÇÃO 3: Adicionado tipagem : any
        setMsgModal({ show: true, title: 'Erro', message: 'Erro ao remover convidado.', type: 'error' });
      }
    }

    if (confirmModal.action === 'SEND') {
      setSending(true);
      try {
        const res = await api.post('/convites/disparar', { eventoId: id });
        carregarTudo();
        setMsgModal({ show: true, title: 'Sucesso', message: res.data.message || 'Convites enviados!', type: 'success' });
      } catch (err: any) { // CORREÇÃO 3: Adicionado tipagem : any
        setMsgModal({ show: true, title: 'Erro', message: 'Falha ao enviar e-mails.', type: 'error' });
      } finally { 
        setSending(false); 
      }
    }
    setConfirmModal({ show: false, action: null, data: null });
  }

  function formatarData(iso: string) {
    if(!iso) return '-';
    try {
        return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
    } catch { return iso; }
  }

  if (loading) return <div className="p-8 text-center text-slate-500">Carregando detalhes...</div>;
  
  if (!evento) return (
    <div className="p-10 flex flex-col items-center justify-center text-center">
        <AlertTriangle size={48} className="text-red-500 mb-4"/>
        <h2 className="text-2xl font-bold text-slate-800">Evento não encontrado</h2>
        <p className="text-slate-500 mb-6">Não foi possível carregar o evento ID: {id}</p>
        <button onClick={() => navigate('/eventos')} className="px-6 py-2 bg-slate-800 text-white rounded font-bold hover:bg-slate-900">Voltar para Lista</button>
    </div>
  );

  async function handleCreateGuest(e: React.FormEvent) {
    e.preventDefault();
    if(!newGuest.nome || !newGuest.email) return;

    try {
      // 1. Salva no banco
      const res = await api.post('/convidados-externos', newGuest);
      const criado = res.data;

      // 2. Formata para o padrão visual da sua lista
      const novoNaLista: PessoaDisponivel = {
        id: criado.id,
        nome: criado.nome,
        email: criado.email,
        empresaNome: criado.empresa || 'Convidado Externo',
        tipo: 'EXTERNO'
      };

      // 3. Adiciona na lista visual e JÁ DEIXA SELECIONADO ✅
      setPessoasDisponiveis(prev => [...prev, novoNaLista]);
      setSelectedPessoas(prev => [...prev, criado.id]);
      
      // 4. Volta para a lista e limpa o form
      setViewMode('LIST');
      setNewGuest({ nome: '', email: '', empresa: '' });
      setFiltroUnidade('externos'); // Opcional: muda o filtro para mostrar o novo
      
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao criar convidado.');
    }
  }

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
            <button 
                onClick={solicitarEnvio}
                disabled={sending || convidados.filter(c => c.status === 'PENDENTE').length === 0}
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

      {/* TABELA DE CONVIDADOS */}
      <div className="bg-white rounded-lg shadow border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-slate-700 flex items-center gap-2"><Users size={20}/> Lista de Presença ({convidados.length})</h3>
        </div>
        <table className="w-full text-left">
            <thead className="bg-white border-b border-slate-100 text-xs font-bold text-slate-500 uppercase">
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
                            {c.status === 'RECUSADO' && <span className="text-red-600 font-bold flex items-center gap-1"><AlertCircle size={14} className="rotate-45"/> Recusado</span>}
                        </td>
                        <td className="px-6 py-4 text-right">
                            <button onClick={() => solicitarExclusao(c.id)} className="text-red-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors">
                                <Trash2 size={18}/>
                            </button>
                        </td>
                    </tr>
                ))}
                {convidados.length === 0 && (
                    <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-400">Nenhum convidado adicionado.</td></tr>
                )}
            </tbody>
        </table>
      </div>

{/* --- MODAL INTELIGENTE (LISTA + CADASTRO) --- */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
            <div className="bg-white rounded-xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[90vh] scale-in-center overflow-hidden">
                
                {/* CABEÇALHO DO MODAL */}
                <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                    <div className="flex items-center gap-3">
                        {viewMode === 'CREATE' && (
                            <button onClick={() => setViewMode('LIST')} className="p-1 hover:bg-slate-200 rounded-full transition">
                                <ArrowLeft size={20} className="text-slate-500"/>
                            </button>
                        )}
                        <h2 className="text-xl font-bold text-[#A6192E]">
                            {viewMode === 'LIST' ? 'Selecionar Convidados' : 'Novo Convidado Externo'}
                        </h2>
                    </div>
                    <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600"><X size={24}/></button>
                </div>
                
                {/* --- MODO 1: LISTA DE SELEÇÃO --- */}
                {viewMode === 'LIST' && (
                    <>
                        <div className="p-4 bg-white border-b border-slate-200 flex flex-col sm:flex-row items-center gap-4">
                            <div className="flex items-center gap-2 flex-1 w-full">
                                <Filter size={20} className="text-slate-400"/>
                                <select className="flex-1 border border-slate-300 rounded p-2 outline-none focus:border-[#A6192E]" value={filtroUnidade} onChange={e => setFiltroUnidade(e.target.value)}>
                                    <option value="todas">Todas as Unidades</option>
                                    <option value="externos">Convidados Externos</option>
                                    {empresas.map(e => <option key={e.id} value={e.id}>{e.razaoSocial}</option>)}
                                </select>
                            </div>
                            
                            <div className="flex items-center gap-3 w-full sm:w-auto justify-between">
                                <button onClick={toggleSelectAll} className="text-[#A6192E] font-bold text-sm hover:underline whitespace-nowrap">
                                    Selecionar Todos
                                </button>
                                {/* BOTÃO PARA IR PRO MODO CADASTRO */}
                                <button onClick={() => setViewMode('CREATE')} className="bg-slate-800 text-white px-3 py-1.5 rounded text-sm font-bold hover:bg-slate-900 flex items-center gap-2">
                                    <Plus size={16}/> Novo Externo
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-2 min-h-[300px]">
                            <table className="w-full text-left">
                                <thead className="bg-white sticky top-0 z-10 shadow-sm">
                                    <tr><th className="px-4 py-2 w-10"></th><th className="px-4 py-2 text-xs font-bold text-slate-500 uppercase">Nome</th><th className="px-4 py-2 text-xs font-bold text-slate-500 uppercase">Origem</th></tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {getPessoasFiltradas().map(p => (
                                        <tr key={p.id} className={`hover:bg-slate-50 cursor-pointer ${selectedPessoas.includes(p.id) ? 'bg-red-50' : ''}`} onClick={() => toggleSelection(p.id)}>
                                            <td className="px-4 py-3 text-center"><input type="checkbox" checked={selectedPessoas.includes(p.id)} readOnly className="w-5 h-5 text-[#A6192E] rounded border-slate-300 focus:ring-[#A6192E]"/></td>
                                            <td className="px-4 py-3 font-bold text-slate-700">{p.nome} <span className="block text-xs font-normal text-slate-500">{p.email}</span></td>
                                            <td className="px-4 py-3 text-sm text-slate-600 flex items-center gap-2">
                                                {p.tipo === 'EXTERNO' ? <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-[10px] font-bold">EXT</span> : <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px] font-bold">INT</span>}
                                                {p.empresaNome}
                                            </td>
                                        </tr>
                                    ))}
                                    {getPessoasFiltradas().length === 0 && (<tr><td colSpan={3} className="p-12 text-center text-slate-400">Ninguém encontrado com este filtro.</td></tr>)}
                                </tbody>
                            </table>
                        </div>

                        <div className="p-4 border-t border-slate-200 flex justify-between items-center bg-slate-50">
                            <span className="text-slate-600 font-medium">{selectedPessoas.length} selecionados</span>
                            <button onClick={handleAdicionarSelecionados} disabled={selectedPessoas.length === 0} className="px-6 py-2 bg-[#A6192E] hover:bg-[#8a1425] disabled:opacity-50 text-white font-bold rounded shadow-md transition-colors">
                                Adicionar Selecionados
                            </button>
                        </div>
                    </>
                )}

                {/* --- MODO 2: FORMULÁRIO DE CADASTRO --- */}
                {viewMode === 'CREATE' && (
                    <form onSubmit={handleCreateGuest} className="p-8 flex flex-col gap-4 animate-fade-in">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Nome Completo *</label>
                            <input autoFocus type="text" className="w-full border border-slate-300 rounded p-2 focus:border-[#A6192E] outline-none" 
                                value={newGuest.nome} onChange={e => setNewGuest({...newGuest, nome: e.target.value})} placeholder="Ex: João da Silva" required />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">E-mail *</label>
                            <input type="email" className="w-full border border-slate-300 rounded p-2 focus:border-[#A6192E] outline-none" 
                                value={newGuest.email} onChange={e => setNewGuest({...newGuest, email: e.target.value})} placeholder="Ex: joao@gmail.com" required />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Empresa / Organização (Opcional)</label>
                            <input type="text" className="w-full border border-slate-300 rounded p-2 focus:border-[#A6192E] outline-none" 
                                value={newGuest.empresa} onChange={e => setNewGuest({...newGuest, empresa: e.target.value})} placeholder="Ex: Fornecedor XYZ" />
                        </div>

                        <div className="pt-4 flex justify-end gap-3">
                            <button type="button" onClick={() => setViewMode('LIST')} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded font-bold">Cancelar</button>
                            <button type="submit" className="px-6 py-2 bg-slate-800 text-white hover:bg-slate-900 rounded font-bold shadow-lg flex items-center gap-2">
                                <CheckCircle size={18}/> Salvar e Selecionar
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
      )}

      {/* --- MENSAGEM GLOBAL --- */}
      {msgModal.show && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[70] animate-fade-in font-sans">
          <div className="bg-white p-8 rounded-2xl w-full max-w-sm shadow-2xl text-center scale-in-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto ${msgModal.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              {msgModal.type === 'success' ? <CheckCircle size={32} /> : <AlertCircle size={32} />}
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">{msgModal.title}</h3>
            <p className="text-slate-600 mb-6 leading-relaxed">{msgModal.message}</p>
            <button onClick={() => setMsgModal({ ...msgModal, show: false })} className="w-full py-3 bg-[#900020] text-white font-bold rounded-full hover:bg-[#700018] shadow-md">OK, entendi</button>
          </div>
        </div>
      )}

      {/* --- CONFIRMAÇÃO --- */}
      {confirmModal.show && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[70] animate-fade-in font-sans">
          <div className="bg-white p-8 rounded-2xl w-full max-w-sm shadow-2xl text-center scale-in-center border-t-4 border-amber-500">
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-4 mx-auto">
              {confirmModal.action === 'SEND' ? <Mail size={32} /> : <AlertTriangle size={32} />}
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">{confirmModal.action === 'SEND' ? 'Disparar Convites?' : 'Remover da Lista?'}</h3>
            <p className="text-slate-600 mb-6 leading-relaxed">{confirmModal.action === 'SEND' ? `Deseja enviar e-mails para todos os ${confirmModal.data} convidados pendentes?` : 'Tem certeza que deseja excluir este convidado da lista?'}</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmModal({ show: false, action: null })} className="flex-1 py-3 border border-slate-300 text-slate-700 font-bold rounded-full hover:bg-slate-50 transition-colors">Cancelar</button>
              <button onClick={handleConfirmAction} className={`flex-1 py-3 text-white font-bold rounded-full shadow-md transition-colors ${confirmModal.action === 'SEND' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'}`}>{confirmModal.action === 'SEND' ? 'Sim, Enviar' : 'Sim, Remover'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}