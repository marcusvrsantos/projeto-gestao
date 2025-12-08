import { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Trash2, X, CheckCircle, AlertCircle, Edit, AlertTriangle } from 'lucide-react';

interface Fornecedor {
  id: string;
  nome: string;
  cnpjOuCpf: string;
  categoria: string;
  telefone: string;
  email?: string;
  responsavel?: string;
}

interface MessageModalData { show: boolean; title: string; message: string; type: 'success' | 'error'; }
interface ConfirmModalData { show: boolean; id: string | null; }

export function Fornecedores() {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFormModal, setShowFormModal] = useState(false);
  
  // MODAIS VISUAIS (Substituem window.alert e window.confirm)
  const [msgModal, setMsgModal] = useState<MessageModalData>({ show: false, title: '', message: '', type: 'success' });
  const [confirmModal, setConfirmModal] = useState<ConfirmModalData>({ show: false, id: null });

  const [editingId, setEditingId] = useState<string | null>(null);

  // Form
  const [nome, setNome] = useState('');
  const [responsavel, setResponsavel] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [tipoServico, setTipoServico] = useState('');

  useEffect(() => { carregar(); }, []);

  function showMessage(title: string, message: string, type: 'success' | 'error') {
    setMsgModal({ show: true, title, message, type });
  }
  function closeMessage() { setMsgModal({ ...msgModal, show: false }); }

  async function carregar() {
    try {
      const res = await api.get('/fornecedores');
      setFornecedores(res.data);
    } catch (error) { showMessage('Erro', 'Erro ao carregar lista.', 'error'); } 
    finally { setLoading(false); }
  }

  function handleNovo() {
    setEditingId(null);
    setNome(''); setResponsavel(''); setTelefone(''); setEmail(''); setCnpj(''); setTipoServico('');
    setShowFormModal(true);
  }

  function handleEditar(f: Fornecedor) {
    setEditingId(f.id);
    setNome(f.nome);
    setResponsavel(f.responsavel || '');
    setTelefone(f.telefone || '');
    setEmail(f.email || '');
    setCnpj(f.cnpjOuCpf);
    setTipoServico(f.categoria || '');
    setShowFormModal(true);
  }

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload = { nome, cnpjOuCpf: cnpj, categoria: tipoServico, telefone, email, responsavel };

      if (editingId) {
        await api.put(`/fornecedores/${editingId}`, payload);
        showMessage('Atualizado', 'Dados atualizados com sucesso.', 'success');
      } else {
        await api.post('/fornecedores', payload);
        showMessage('Sucesso', 'Fornecedor cadastrado!', 'success');
      }
      
      setShowFormModal(false);
      carregar();
    } catch (error: any) {
      const erroMsg = error.response?.data?.error || 'Erro ao salvar';
      showMessage('Atenção', erroMsg, 'error');
    }
  }

  // 1. O usuário clica na lixeira -> Abre o Modal de Confirmação
  function solicitarExclusao(id: string) {
    setConfirmModal({ show: true, id });
  }

  // 2. O usuário clica em "SIM" no Modal -> Executa a exclusão
  async function confirmarExclusao() {
    if (!confirmModal.id) return;
    try {
      await api.delete(`/fornecedores/${confirmModal.id}`);
      setFornecedores(fornecedores.filter(f => f.id !== confirmModal.id));
      setConfirmModal({ show: false, id: null }); // Fecha modal
      showMessage('Excluído', 'Fornecedor removido.', 'success');
    } catch (error) {
      setConfirmModal({ show: false, id: null });
      showMessage('Erro', 'Não foi possível excluir.', 'error');
    }
  }

  return (
    <div className="space-y-6 font-sans">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Fornecedores</h1>
          <p className="text-slate-500">Gestão de parceiros e prestadores de serviço.</p>
        </div>
        <button onClick={handleNovo} className="bg-[#A6192E] hover:bg-[#8a1425] text-white px-4 py-2 rounded flex items-center gap-2 shadow-sm">
          <Plus size={20} /> Novo Fornecedor
        </button>
      </div>

      <div className="bg-white rounded-lg shadow border border-slate-200 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-100 border-b border-slate-300 text-slate-700">
            <tr>
              <th className="px-4 py-3 text-sm font-semibold border-r border-slate-200">Razão Social</th>
              <th className="px-4 py-3 text-sm font-semibold border-r border-slate-200">Telefone</th>
              <th className="px-4 py-3 text-sm font-semibold border-r border-slate-200">CNPJ</th>
              <th className="px-4 py-3 text-sm font-semibold text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-slate-700 text-sm">
            {fornecedores.map(f => (
              <tr key={f.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 border-r border-slate-100 align-middle">
                    <span className="block font-medium">{f.nome}</span>
                    <span className="text-xs text-slate-500">{f.categoria}</span>
                </td>
                <td className="px-4 py-3 border-r border-slate-100 align-middle whitespace-nowrap">{f.telefone}</td>
                <td className="px-4 py-3 border-r border-slate-100 align-middle font-mono text-xs">{f.cnpjOuCpf}</td>
                <td className="px-4 py-3 text-center align-middle whitespace-nowrap">
                  <button onClick={() => handleEditar(f)} className="text-blue-500 hover:text-blue-700 p-1 mr-2"><Edit size={16} /></button>
                  {/* Chama a função que abre o modal, não o confirm nativo */}
                  <button onClick={() => solicitarExclusao(f.id)} className="text-red-500 hover:text-red-700 p-1"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
             {fornecedores.length === 0 && !loading && (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400">Nenhum fornecedor cadastrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL DE FORMULÁRIO */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden scale-in-center">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-[#A6192E]">{editingId ? 'Editar Fornecedor' : 'Novo Fornecedor'}</h2>
              <button onClick={() => setShowFormModal(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
            </div>
            <form onSubmit={handleSalvar} className="p-8 space-y-5">
              <div>
                <label className="block text-sm font-bold text-[#A6192E] mb-2">Razão Social / Nome</label>
                <input required value={nome} onChange={e => setNome(e.target.value)} className="w-full border border-slate-300 p-3 rounded-lg outline-none focus:border-[#A6192E]" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><label className="block text-sm font-bold text-[#A6192E] mb-2">Responsável</label><input value={responsavel} onChange={e => setResponsavel(e.target.value)} className="w-full border border-slate-300 p-3 rounded-lg outline-none focus:border-[#A6192E]" /></div>
                <div><label className="block text-sm font-bold text-[#A6192E] mb-2">Telefone</label><input value={telefone} onChange={e => setTelefone(e.target.value)} className="w-full border border-slate-300 p-3 rounded-lg outline-none focus:border-[#A6192E]" /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><label className="block text-sm font-bold text-[#A6192E] mb-2">E-mail</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border border-slate-300 p-3 rounded-lg outline-none focus:border-[#A6192E]" /></div>
                <div><label className="block text-sm font-bold text-[#A6192E] mb-2">CNPJ</label><input required value={cnpj} onChange={e => setCnpj(e.target.value)} className="w-full border border-slate-300 p-3 rounded-lg outline-none focus:border-[#A6192E]" /></div>
              </div>
              <div><label className="block text-sm font-bold text-[#A6192E] mb-2">Tipo de Serviço</label><input value={tipoServico} onChange={e => setTipoServico(e.target.value)} className="w-full border border-slate-300 p-3 rounded-lg outline-none focus:border-[#A6192E]" /></div>
              <div className="pt-6 flex justify-center">
                <button type="submit" className="px-10 py-3 bg-[#900020] text-white font-bold rounded-full hover:bg-[#700018] shadow-md">
                  {editingId ? 'Salvar Alterações' : 'Cadastrar Fornecedor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL DE MENSAGEM (Novo Alert) --- */}
      {msgModal.show && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] animate-fade-in">
          <div className="bg-white p-8 rounded-2xl w-full max-w-sm shadow-2xl text-center scale-in-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto ${msgModal.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              {msgModal.type === 'success' ? <CheckCircle size={32} /> : <AlertCircle size={32} />}
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">{msgModal.title}</h3>
            <p className="text-slate-600 mb-6">{msgModal.message}</p>
            <button onClick={closeMessage} className="w-full py-3 bg-[#900020] text-white font-bold rounded-full hover:bg-[#700018]">OK, entendi</button>
          </div>
        </div>
      )}

      {/* --- MODAL DE CONFIRMAÇÃO (Novo Confirm) --- */}
      {confirmModal.show && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] animate-fade-in">
          <div className="bg-white p-8 rounded-2xl w-full max-w-sm shadow-2xl text-center scale-in-center border-t-4 border-amber-500">
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-4 mx-auto">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Tem certeza?</h3>
            <p className="text-slate-600 mb-6">Você está prestes a excluir este registro. Esta ação não pode ser desfeita.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmModal({ show: false, id: null })} className="flex-1 py-3 border border-slate-300 text-slate-700 font-bold rounded-full hover:bg-slate-50">Cancelar</button>
              <button onClick={confirmarExclusao} className="flex-1 py-3 bg-red-600 text-white font-bold rounded-full hover:bg-red-700 shadow-md">Sim, Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
