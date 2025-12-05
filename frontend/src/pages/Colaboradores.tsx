import { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Trash2, X, CheckCircle, AlertCircle, Edit, Building2 } from 'lucide-react';

interface Colaborador {
  id: string;
  nome: string;
  email: string;
  cargo: string;
  setor?: string;
  cpf?: string;
  dataNascimento?: string;
  empresaId: string;
}
interface Empresa { id: string; razaoSocial: string; cnpj: string; }
interface MessageModalData { show: boolean; title: string; message: string; type: 'success' | 'error'; }

export function Colaboradores() {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtro
  const [filtroEmpresa, setFiltroEmpresa] = useState('todas');

  // Modais
  const [showFormModal, setShowFormModal] = useState(false);
  const [showEmpresaModal, setShowEmpresaModal] = useState(false);
  const [msgModal, setMsgModal] = useState<MessageModalData>({ show: false, title: '', message: '', type: 'success' });
  
  // Edição
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Colaborador
  const [nome, setNome] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [empresaId, setEmpresaId] = useState('');
  const [cargo, setCargo] = useState('');
  const [setor, setSetor] = useState('');
  const [departamento, setDepartamento] = useState('');

  // Form Empresa
  const [novaEmpresaNome, setNovaEmpresaNome] = useState('');
  const [novaEmpresaCNPJ, setNovaEmpresaCNPJ] = useState('');

  useEffect(() => { carregarDados(); }, []);

  function showMessage(title: string, message: string, type: 'success' | 'error') {
    setMsgModal({ show: true, title, message, type });
  }
  function closeMessage() { setMsgModal({ ...msgModal, show: false }); }

  async function carregarDados() {
    try {
      const [resColab, resEmpresa] = await Promise.all([
        api.get('/colaboradores'),
        api.get('/empresas')
      ]);
      setColaboradores(resColab.data);
      setEmpresas(resEmpresa.data);
    } catch (error) { showMessage('Erro', 'Não foi possível carregar os dados.', 'error'); } 
    finally { setLoading(false); }
  }

  // --- AÇÕES COLABORADOR ---

  function handleNovo() {
    setEditingId(null);
    setNome(''); setEmail(''); setCargo(''); setCpf(''); setSetor(''); setDataNascimento(''); setDepartamento('');
    if (filtroEmpresa !== 'todas') setEmpresaId(filtroEmpresa);
    else if(empresas.length > 0) setEmpresaId(empresas[0].id);
    setShowFormModal(true);
  }

  function handleEditar(c: Colaborador) {
    setEditingId(c.id);
    setNome(c.nome);
    setEmail(c.email);
    setCargo(c.cargo || '');
    setCpf(c.cpf || '');
    setSetor(c.setor || '');
    setEmpresaId(c.empresaId);
    if (c.dataNascimento) setDataNascimento(c.dataNascimento.split('T')[0]);
    else setDataNascimento('');
    setShowFormModal(true);
  }

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload = { 
        nome, email, cargo, empresaId, cpf, setor, 
        dataNascimento: dataNascimento || null 
      };

      if (editingId) {
        await api.put(`/colaboradores/${editingId}`, payload);
        showMessage('Atualizado', 'Colaborador atualizado.', 'success');
      } else {
        await api.post('/colaboradores', payload);
        showMessage('Sucesso', 'Colaborador cadastrado.', 'success');
      }
      setShowFormModal(false);
      carregarDados();
    } catch (error: any) {
      const erroMsg = error.response?.data?.error || 'Erro ao salvar';
      showMessage('Atenção', erroMsg, 'error');
    }
  }

  async function handleDeletar(id: string) {
    if (!confirm('Excluir este colaborador?')) return;
    try {
      await api.delete(`/colaboradores/${id}`);
      setColaboradores(colaboradores.filter(c => c.id !== id));
      showMessage('Excluído', 'Removido com sucesso.', 'success');
    } catch (error) { showMessage('Erro', 'Erro ao excluir.', 'error'); }
  }

  // --- AÇÕES EMPRESA (NOVA LÓGICA DE LIMPEZA) ---
  
  async function handleSalvarEmpresa(e: React.FormEvent) {
    e.preventDefault();
    try {
        // Remove tudo que não for número
        const cnpjLimpo = novaEmpresaCNPJ.replace(/\D/g, '');

        await api.post('/empresas', { razaoSocial: novaEmpresaNome, cnpj: cnpjLimpo });
        showMessage('Sucesso', 'Nova Unidade de Negócio criada!', 'success');
        setNovaEmpresaNome(''); setNovaEmpresaCNPJ('');
        setShowEmpresaModal(false);
        carregarDados();
    } catch (error: any) {
        // Mostra a mensagem real do backend (ex: "CNPJ já cadastrado")
        const msg = error.response?.data?.error || 'Erro ao criar unidade.';
        showMessage('Erro', msg, 'error');
    }
  }

  const colaboradoresFiltrados = filtroEmpresa === 'todas' 
    ? colaboradores 
    : colaboradores.filter(c => c.empresaId === filtroEmpresa);

  return (
    <div className="space-y-6 font-sans">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Colaboradores por Unidade</h1>
          <p className="text-slate-500">Gerencie a equipe dividida por empresas da Holding.</p>
        </div>
        <div className="flex gap-2">
            <button onClick={() => setShowEmpresaModal(true)} className="bg-slate-700 hover:bg-slate-800 text-white px-4 py-2 rounded flex items-center gap-2 transition-colors shadow-sm">
            <Building2 size={20} /> Nova Unidade
            </button>
            <button onClick={handleNovo} className="bg-[#A6192E] hover:bg-[#8a1425] text-white px-4 py-2 rounded flex items-center gap-2 transition-colors shadow-sm">
            <Plus size={20} /> Novo Colaborador
            </button>
        </div>
      </div>

      <div className="border-b border-slate-200 flex gap-6 overflow-x-auto pb-1">
        <button 
            onClick={() => setFiltroEmpresa('todas')}
            className={`pb-3 text-sm font-bold uppercase tracking-wide border-b-2 transition-colors whitespace-nowrap ${
                filtroEmpresa === 'todas' ? 'border-[#A6192E] text-[#A6192E]' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
        >
            Todas ({colaboradores.length})
        </button>
        {empresas.map(emp => {
            const qtd = colaboradores.filter(c => c.empresaId === emp.id).length;
            return (
                <button 
                    key={emp.id}
                    onClick={() => setFiltroEmpresa(emp.id)}
                    className={`pb-3 text-sm font-bold uppercase tracking-wide border-b-2 transition-colors whitespace-nowrap ${
                        filtroEmpresa === emp.id ? 'border-[#A6192E] text-[#A6192E]' : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                >
                    {emp.razaoSocial} ({qtd})
                </button>
            );
        })}
      </div>

      <div className="bg-white rounded-lg shadow border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Nome</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Unidade / Cargo</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Email / CPF</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {colaboradoresFiltrados.map(colab => {
              const nomeEmpresa = empresas.find(e => e.id === colab.empresaId)?.razaoSocial || 'N/A';
              return (
                <tr key={colab.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                    <span className="font-medium text-slate-700 block">{colab.nome}</span>
                    </td>
                    <td className="px-6 py-4">
                    <div className="text-[#A6192E] font-bold text-xs uppercase mb-1">{nomeEmpresa}</div>
                    <div className="text-slate-500 text-sm">{colab.cargo}</div>
                    </td>
                    <td className="px-6 py-4">
                    <div className="text-slate-600 text-sm">{colab.email}</div>
                    <div className="text-slate-400 text-xs">{colab.cpf || 'Sem CPF'}</div>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                    <button onClick={() => handleEditar(colab)} className="text-blue-500 hover:text-blue-700 p-2"><Edit size={18} /></button>
                    <button onClick={() => handleDeletar(colab.id)} className="text-red-400 hover:text-red-600 p-2"><Trash2 size={18} /></button>
                    </td>
                </tr>
              );
            })}
             {colaboradoresFiltrados.length === 0 && !loading && (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400">Nenhum colaborador nesta unidade.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showFormModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden scale-in-center">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-[#A6192E]">
                {editingId ? 'Editar Colaborador' : 'Novo Colaborador'}
              </h2>
              <button onClick={() => setShowFormModal(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
            </div>
            <form onSubmit={handleSalvar} className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-bold text-[#A6192E] mb-2">Nome Completo</label>
                <input required value={nome} onChange={e => setNome(e.target.value)} className="w-full border border-slate-300 p-3 rounded-lg outline-none focus:border-[#A6192E]" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-[#A6192E] mb-2">Unidade de Negócio</label>
                  <select required value={empresaId} onChange={e => setEmpresaId(e.target.value)} className="w-full border border-slate-300 p-3 rounded-lg outline-none focus:border-[#A6192E] bg-white">
                    <option value="">Selecione a Unidade</option>
                    {empresas.map(emp => <option key={emp.id} value={emp.id}>{emp.razaoSocial}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#A6192E] mb-2">Cargo</label>
                  <input required value={cargo} onChange={e => setCargo(e.target.value)} className="w-full border border-slate-300 p-3 rounded-lg outline-none focus:border-[#A6192E]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-bold text-[#A6192E] mb-2">E-mail</label>
                    <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border border-slate-300 p-3 rounded-lg outline-none focus:border-[#A6192E]" />
                </div>
                 <div>
                    <label className="block text-sm font-bold text-[#A6192E] mb-2">CPF</label>
                    <input value={cpf} onChange={e => setCpf(e.target.value)} className="w-full border border-slate-300 p-3 rounded-lg outline-none focus:border-[#A6192E]" />
                </div>
              </div>
              <div className="pt-6 flex justify-center">
                <button type="submit" className="px-10 py-3 bg-[#900020] text-white font-bold rounded-full hover:bg-[#700018] shadow-md">
                  {editingId ? 'Salvar' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEmpresaModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[55] p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
             <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-[#A6192E]">Nova Unidade de Negócio</h2>
              <button onClick={() => setShowEmpresaModal(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
            </div>
            <form onSubmit={handleSalvarEmpresa} className="p-6 space-y-4">
                <div>
                    <label className="block text-sm font-bold text-[#A6192E] mb-2">Nome da Unidade (Razão Social)</label>
                    <input required value={novaEmpresaNome} onChange={e => setNovaEmpresaNome(e.target.value)} className="w-full border border-slate-300 p-3 rounded-lg outline-none focus:border-[#A6192E]" placeholder="Ex: Holding, Filial Norte..." />
                </div>
                <div>
                    <label className="block text-sm font-bold text-[#A6192E] mb-2">CNPJ</label>
                    <input required value={novaEmpresaCNPJ} onChange={e => setNovaEmpresaCNPJ(e.target.value)} className="w-full border border-slate-300 p-3 rounded-lg outline-none focus:border-[#A6192E]" placeholder="00.000.000/0000-00" />
                </div>
                <button type="submit" className="w-full py-3 bg-[#A6192E] text-white font-bold rounded-lg hover:bg-[#8a1425]">
                  Criar Unidade
                </button>
            </form>
          </div>
        </div>
      )}

      {msgModal.show && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60]">
          <div className="bg-white p-6 rounded-lg text-center max-w-sm">
             <h3 className="font-bold text-lg mb-2">{msgModal.title}</h3>
             <p className="mb-4 text-slate-600">{msgModal.message}</p>
             <button onClick={closeMessage} className="bg-slate-800 text-white px-4 py-2 rounded w-full">OK</button>
          </div>
        </div>
      )}
    </div>
  );
}
