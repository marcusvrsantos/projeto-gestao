import { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Trash2, X, CheckCircle, AlertCircle, Edit, User, Mail, Briefcase } from 'lucide-react';

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
interface Empresa { id: string; razaoSocial: string; }
interface MessageModalData { show: boolean; title: string; message: string; type: 'success' | 'error'; }

export function Colaboradores() {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFormModal, setShowFormModal] = useState(false);
  const [msgModal, setMsgModal] = useState<MessageModalData>({ show: false, title: '', message: '', type: 'success' });
  
  // Controle de Edição
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [nome, setNome] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [empresaId, setEmpresaId] = useState('');
  const [cargo, setCargo] = useState('');
  const [setor, setSetor] = useState('');
  const [departamento, setDepartamento] = useState('');

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
      if (resEmpresa.data.length > 0 && !empresaId) setEmpresaId(resEmpresa.data[0].id);
    } catch (error) { showMessage('Erro', 'Não foi possível carregar os dados.', 'error'); } 
    finally { setLoading(false); }
  }

  function handleNovo() {
    setEditingId(null);
    setNome(''); setEmail(''); setCargo(''); setCpf(''); setSetor(''); setDataNascimento(''); setDepartamento('');
    if(empresas.length > 0) setEmpresaId(empresas[0].id);
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
    // Data vem ISO (YYYY-MM-DDTHH...), o input date quer YYYY-MM-DD
    if (c.dataNascimento) {
      setDataNascimento(c.dataNascimento.split('T')[0]);
    } else {
      setDataNascimento('');
    }
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
        showMessage('Atualizado', 'Colaborador atualizado com sucesso.', 'success');
      } else {
        await api.post('/colaboradores', payload);
        showMessage('Sucesso', 'Colaborador cadastrado com sucesso.', 'success');
      }
      
      setShowFormModal(false);
      carregarDados();
    } catch (error: any) {
      const erroMsg = error.response?.data?.error || 'Erro ao salvar';
      showMessage('Atenção', erroMsg, 'error');
    }
  }

  async function handleDeletar(id: string) {
    if (!confirm('Tem certeza que deseja excluir este colaborador?')) return;
    try {
      await api.delete(`/colaboradores/${id}`);
      setColaboradores(colaboradores.filter(c => c.id !== id));
      showMessage('Excluído', 'Colaborador removido com sucesso.', 'success');
    } catch (error) {
      showMessage('Erro', 'Não foi possível excluir o colaborador.', 'error');
    }
  }

  return (
    <div className="space-y-6 font-sans">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Colaboradores</h1>
          <p className="text-slate-500">Gerencie a equipe e seus acessos.</p>
        </div>
        <button onClick={handleNovo} className="bg-[#A6192E] hover:bg-[#8a1425] text-white px-4 py-2 rounded flex items-center gap-2 transition-colors shadow-sm">
          <Plus size={20} /> Novo Colaborador
        </button>
      </div>

      <div className="bg-white rounded-lg shadow border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Nome</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Setor / Cargo</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Email / CPF</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {colaboradores.map(colab => (
              <tr key={colab.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <span className="font-medium text-slate-700 block">{colab.nome}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-slate-700 font-medium">{colab.setor || '-'}</div>
                  <div className="text-slate-500 text-xs">{colab.cargo}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-slate-600 text-sm">{colab.email}</div>
                  <div className="text-slate-400 text-xs">{colab.cpf || 'Sem CPF'}</div>
                </td>
                <td className="px-6 py-4 text-right whitespace-nowrap">
                  <button onClick={() => handleEditar(colab)} className="text-blue-500 hover:text-blue-700 p-2 transition-colors">
                    <Edit size={18} />
                  </button>
                  <button onClick={() => handleDeletar(colab.id)} className="text-red-400 hover:text-red-600 p-2 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {colaboradores.length === 0 && !loading && (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400">Nenhum colaborador encontrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showFormModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden scale-in-center">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-[#A6192E]">
                {editingId ? 'Editar Colaborador' : 'Cadastro de Colaboradores'}
              </h2>
              <button onClick={() => setShowFormModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors rounded-full p-1 hover:bg-slate-100">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSalvar} className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-bold text-[#A6192E] mb-2">Nome Completo</label>
                <input required value={nome} onChange={e => setNome(e.target.value)} className="w-full border border-slate-300 p-3 rounded-lg text-slate-700 outline-none focus:border-[#A6192E]" placeholder="Digite o nome" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-[#A6192E] mb-2">Data de Nascimento</label>
                  <input type="date" value={dataNascimento} onChange={e => setDataNascimento(e.target.value)} className="w-full border border-slate-300 p-3 rounded-lg text-slate-700 outline-none focus:border-[#A6192E]" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#A6192E] mb-2">CPF (opcional)</label>
                  <input value={cpf} onChange={e => setCpf(e.target.value)} className="w-full border border-slate-300 p-3 rounded-lg text-slate-700 outline-none focus:border-[#A6192E]" placeholder="000.000.000-00" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-[#A6192E] mb-2">E-mail</label>
                <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border border-slate-300 p-3 rounded-lg text-slate-700 outline-none focus:border-[#A6192E]" placeholder="Digite o e-mail" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-[#A6192E] mb-2">Empresa/Instituição</label>
                  <select value={empresaId} onChange={e => setEmpresaId(e.target.value)} className="w-full border border-slate-300 p-3 rounded-lg text-slate-700 outline-none focus:border-[#A6192E] bg-white">
                    {empresas.map(emp => <option key={emp.id} value={emp.id}>{emp.razaoSocial}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#A6192E] mb-2">Cargo</label>
                  <input required value={cargo} onChange={e => setCargo(e.target.value)} className="w-full border border-slate-300 p-3 rounded-lg text-slate-700 outline-none focus:border-[#A6192E]" placeholder="Digite seu cargo" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                  <label className="block text-sm font-bold text-[#A6192E] mb-2">Setor</label>
                  <input value={setor} onChange={e => setSetor(e.target.value)} className="w-full border border-slate-300 p-3 rounded-lg text-slate-700 outline-none focus:border-[#A6192E]" placeholder="Setor" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#A6192E] mb-2">Departamento</label>
                   <select value={departamento} onChange={e => setDepartamento(e.target.value)} className="w-full border border-slate-300 p-3 rounded-lg text-slate-700 outline-none focus:border-[#A6192E] bg-white">
                      <option value="">Selecione (Opcional)</option>
                      <option value="Administrativo">Administrativo</option>
                      <option value="Financeiro">Financeiro</option>
                      <option value="Operacional">Operacional</option>
                  </select>
                </div>
              </div>
              <div className="pt-6 flex justify-center">
                <button type="submit" className="px-10 py-3 bg-[#900020] text-white font-bold rounded-full hover:bg-[#700018] shadow-md transition-all transform hover:-translate-y-1">
                  {editingId ? 'Salvar Alterações' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {msgModal.show && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60]">
          <div className="bg-white p-6 rounded-lg text-center max-w-sm">
            <div className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center mb-4 ${
              msgModal.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
            }`}>
              {msgModal.type === 'success' ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
            </div>
             <h3 className="font-bold text-lg mb-2">{msgModal.title}</h3>
             <p className="mb-4 text-slate-600">{msgModal.message}</p>
             <button onClick={closeMessage} className="bg-slate-800 text-white px-4 py-2 rounded w-full">OK</button>
          </div>
        </div>
      )}
    </div>
  );
}
