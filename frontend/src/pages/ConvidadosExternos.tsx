import { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Trash2, User, Mail, Briefcase, Phone, Edit, X, CheckCircle, AlertCircle } from 'lucide-react';

interface Convidado {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  empresa?: string;
  cargo?: string;
}

interface MessageModalData { show: boolean; title: string; message: string; type: 'success' | 'error'; }

export function ConvidadosExternos() {
  const [convidados, setConvidados] = useState<Convidado[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFormModal, setShowFormModal] = useState(false);
  const [msgModal, setMsgModal] = useState<MessageModalData>({ show: false, title: '', message: '', type: 'success' });
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [cargo, setCargo] = useState('');

  useEffect(() => { carregar(); }, []);

  function showMessage(title: string, message: string, type: 'success' | 'error') {
    setMsgModal({ show: true, title, message, type });
  }
  function closeMessage() { setMsgModal({ ...msgModal, show: false }); }

  async function carregar() {
    try {
      const res = await api.get('/convidados-externos');
      setConvidados(res.data);
    } catch (error) { showMessage('Erro', 'Erro ao carregar convidados.', 'error'); } 
    finally { setLoading(false); }
  }

  function handleNovo() {
    setEditingId(null);
    setNome(''); setEmail(''); setTelefone(''); setEmpresa(''); setCargo('');
    setShowFormModal(true);
  }

  function handleEditar(c: Convidado) {
    setEditingId(c.id);
    setNome(c.nome);
    setEmail(c.email);
    setTelefone(c.telefone || '');
    setEmpresa(c.empresa || '');
    setCargo(c.cargo || '');
    setShowFormModal(true);
  }

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload = { nome, email, telefone, empresa, cargo };
      if (editingId) {
        await api.put(`/convidados-externos/${editingId}`, payload);
        showMessage('Atualizado', 'Convidado atualizado com sucesso.', 'success');
      } else {
        await api.post('/convidados-externos', payload);
        showMessage('Sucesso', 'Convidado cadastrado com sucesso.', 'success');
      }
      setShowFormModal(false);
      carregar();
    } catch (error: any) {
      const msg = error.response?.data?.error || 'Erro ao salvar';
      showMessage('Atenção', msg, 'error');
    }
  }

  async function handleDeletar(id: string) {
    if (!confirm('Excluir este convidado?')) return;
    try {
      await api.delete(`/convidados-externos/${id}`);
      setConvidados(convidados.filter(c => c.id !== id));
      showMessage('Excluído', 'Convidado removido.', 'success');
    } catch (error) { showMessage('Erro', 'Não foi possível excluir.', 'error'); }
  }

  return (
    <div className="space-y-6 font-sans">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Convidados Externos</h1>
          <p className="text-slate-500">Cadastro de autoridades, parceiros e clientes VIP.</p>
        </div>
        <button onClick={handleNovo} className="bg-[#A6192E] hover:bg-[#8a1425] text-white px-4 py-2 rounded flex items-center gap-2 transition-colors shadow-sm">
          <Plus size={20} /> Novo Convidado
        </button>
      </div>

      <div className="bg-white rounded-lg shadow border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Nome / Cargo</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Empresa / Org</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Contato</th>
              <th className="px-6 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {convidados.map(c => (
              <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-800 flex items-center gap-2">
                    <User size={16} className="text-slate-400"/> {c.nome}
                  </div>
                  <div className="text-slate-500 text-xs mt-1 ml-6">{c.cargo || 'Cargo não informado'}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Briefcase size={16} className="text-slate-400"/> {c.empresa || '-'}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-slate-600 text-sm">
                    <Mail size={14}/> {c.email}
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 text-xs mt-1">
                    <Phone size={14}/> {c.telefone || '-'}
                  </div>
                </td>
                <td className="px-6 py-4 text-right whitespace-nowrap">
                  <button onClick={() => handleEditar(c)} className="text-blue-500 hover:text-blue-700 p-2"><Edit size={18}/></button>
                  <button onClick={() => handleDeletar(c.id)} className="text-red-400 hover:text-red-600 p-2"><Trash2 size={18}/></button>
                </td>
              </tr>
            ))}
            {convidados.length === 0 && !loading && (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400">Nenhum convidado externo cadastrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl overflow-hidden scale-in-center">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-[#A6192E]">
                {editingId ? 'Editar Convidado' : 'Novo Convidado Externo'}
              </h2>
              <button onClick={() => setShowFormModal(false)} className="text-slate-400 hover:text-slate-600"><X size={24}/></button>
            </div>
            <form onSubmit={handleSalvar} className="p-8 space-y-5">
              <div>
                <label className="block text-sm font-bold text-[#A6192E] mb-2">Nome Completo</label>
                <input required value={nome} onChange={e => setNome(e.target.value)} className="w-full border border-slate-300 p-3 rounded-lg outline-none focus:border-[#A6192E]" placeholder="Nome do convidado" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-[#A6192E] mb-2">E-mail</label>
                  <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border border-slate-300 p-3 rounded-lg outline-none focus:border-[#A6192E]" placeholder="email@exemplo.com" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#A6192E] mb-2">Telefone</label>
                  <input value={telefone} onChange={e => setTelefone(e.target.value)} className="w-full border border-slate-300 p-3 rounded-lg outline-none focus:border-[#A6192E]" placeholder="(00) 00000-0000" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-[#A6192E] mb-2">Empresa / Org</label>
                  <input value={empresa} onChange={e => setEmpresa(e.target.value)} className="w-full border border-slate-300 p-3 rounded-lg outline-none focus:border-[#A6192E]" placeholder="Ex: Prefeitura, Parceiro X" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#A6192E] mb-2">Cargo</label>
                  <input value={cargo} onChange={e => setCargo(e.target.value)} className="w-full border border-slate-300 p-3 rounded-lg outline-none focus:border-[#A6192E]" placeholder="Diretor, Gerente..." />
                </div>
              </div>
              <div className="pt-6 flex justify-center">
                <button type="submit" className="px-10 py-3 bg-[#900020] text-white font-bold rounded-full hover:bg-[#700018] shadow-md transition-all">
                  {editingId ? 'Salvar Alterações' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MSG MODAL */}
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
