import { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Trash2, X, CheckCircle, AlertCircle, Search } from 'lucide-react';

// Interfaces
interface Fornecedor {
  id: string;
  nome: string;
  cnpjOuCpf: string;
  categoria: string;
  telefone: string;
  email?: string;
  responsavel?: string;
}

interface MessageModalData {
  show: boolean;
  title: string;
  message: string;
  type: 'success' | 'error';
}

export function Fornecedores() {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFormModal, setShowFormModal] = useState(false);
  
  const [msgModal, setMsgModal] = useState<MessageModalData>({ 
    show: false, title: '', message: '', type: 'success' 
  });

  // Campos do Formulário
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

  function closeMessage() {
    setMsgModal({ ...msgModal, show: false });
  }

  async function carregar() {
    try {
      const res = await api.get('/fornecedores');
      setFornecedores(res.data);
    } catch (error) {
      showMessage('Erro', 'Erro ao carregar lista de fornecedores.', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post('/fornecedores', { 
        nome, 
        cnpjOuCpf: cnpj, 
        categoria: tipoServico, 
        telefone,
        email,
        responsavel
      });
      
      setShowFormModal(false);
      showMessage('Sucesso!', 'Fornecedor cadastrado com sucesso.', 'success');
      
      setNome(''); setCnpj(''); setTipoServico(''); setTelefone(''); setEmail(''); setResponsavel('');
      carregar();
    } catch (error: any) {
      const erroMsg = error.response?.data?.error || 'Erro ao salvar';
      showMessage('Atenção', erroMsg, 'error');
    }
  }

  async function handleDeletar(id: string) {
    if (!confirm('Deseja realmente excluir este fornecedor?')) return;
    try {
      await api.delete(`/fornecedores/${id}`);
      setFornecedores(fornecedores.filter(f => f.id !== id));
      showMessage('Excluído', 'Fornecedor removido com sucesso.', 'success');
    } catch (error) {
      showMessage('Erro', 'Não foi possível excluir o fornecedor.', 'error');
    }
  }

  return (
    <div className="space-y-6 font-sans">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Fornecedores</h1>
          <p className="text-slate-500">Gestão de parceiros e prestadores de serviço.</p>
        </div>
        <button 
          onClick={() => setShowFormModal(true)}
          className="bg-[#A6192E] hover:bg-[#8a1425] text-white px-4 py-2 rounded flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus size={20} /> Novo Fornecedor
        </button>
      </div>

      {/* TABELA ESTILO PLANILHA */}
      <div className="bg-white rounded-lg shadow border border-slate-200 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-100 border-b border-slate-300 text-slate-700">
            <tr>
              <th className="px-4 py-3 text-sm font-semibold border-r border-slate-200 whitespace-nowrap">Razão Social / Nome</th>
              <th className="px-4 py-3 text-sm font-semibold border-r border-slate-200 whitespace-nowrap">Responsável</th>
              <th className="px-4 py-3 text-sm font-semibold border-r border-slate-200 whitespace-nowrap">Telefone</th>
              <th className="px-4 py-3 text-sm font-semibold border-r border-slate-200 whitespace-nowrap">E-mail</th>
              <th className="px-4 py-3 text-sm font-semibold border-r border-slate-200 whitespace-nowrap">CNPJ</th>
              <th className="px-4 py-3 text-sm font-semibold border-r border-slate-200 whitespace-nowrap">Tipo de Serviço</th>
              <th className="px-4 py-3 text-sm font-semibold text-center whitespace-nowrap">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-slate-700 text-sm">
            {fornecedores.map(f => (
              <tr key={f.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 border-r border-slate-100 align-middle">{f.nome}</td>
                <td className="px-4 py-3 border-r border-slate-100 align-middle">{f.responsavel || '-'}</td>
                <td className="px-4 py-3 border-r border-slate-100 align-middle whitespace-nowrap">{f.telefone}</td>
                <td className="px-4 py-3 border-r border-slate-100 align-middle">{f.email || '-'}</td>
                <td className="px-4 py-3 border-r border-slate-100 align-middle font-mono text-xs">{f.cnpjOuCpf}</td>
                <td className="px-4 py-3 border-r border-slate-100 align-middle">{f.categoria || '-'}</td>
                
                <td className="px-4 py-3 text-center align-middle">
                  <button onClick={() => handleDeletar(f.id)} className="text-red-500 hover:text-red-700 p-1" title="Excluir">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
             {fornecedores.length === 0 && !loading && (
              <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-400">Nenhum fornecedor cadastrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL DE CADASTRO */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden scale-in-center">
            
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-[#A6192E]">Novo Fornecedor</h2>
              <button onClick={() => setShowFormModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors rounded-full p-1 hover:bg-slate-100">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSalvar} className="p-8 space-y-5">
              
              {/* Razão Social */}
              <div>
                <label className="block text-sm font-bold text-[#A6192E] mb-2">Razão Social / Nome</label>
                <input required value={nome} onChange={e => setNome(e.target.value)} className="w-full border border-slate-300 p-3 rounded-lg text-slate-700 outline-none focus:border-[#A6192E] focus:ring-1 focus:ring-[#A6192E]" placeholder="Digite a razão social" />
              </div>

              {/* Responsável e Telefone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                   <label className="block text-sm font-bold text-[#A6192E] mb-2">Responsável (se houver)</label>
                   <input value={responsavel} onChange={e => setResponsavel(e.target.value)} className="w-full border border-slate-300 p-3 rounded-lg text-slate-700 outline-none focus:border-[#A6192E] focus:ring-1 focus:ring-[#A6192E]" placeholder="Nome do contato" />
                </div>
                <div>
                   <label className="block text-sm font-bold text-[#A6192E] mb-2">Telefone</label>
                   <input value={telefone} onChange={e => setTelefone(e.target.value)} className="w-full border border-slate-300 p-3 rounded-lg text-slate-700 outline-none focus:border-[#A6192E] focus:ring-1 focus:ring-[#A6192E]" placeholder="(00) 0000-0000" />
                </div>
              </div>

              {/* E-mail e CNPJ */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-[#A6192E] mb-2">E-mail</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border border-slate-300 p-3 rounded-lg text-slate-700 outline-none focus:border-[#A6192E] focus:ring-1 focus:ring-[#A6192E]" placeholder="contato@empresa.com" />
                </div>
                <div>
                   <label className="block text-sm font-bold text-[#A6192E] mb-2">CNPJ</label>
                   <input required value={cnpj} onChange={e => setCnpj(e.target.value)} className="w-full border border-slate-300 p-3 rounded-lg text-slate-700 outline-none focus:border-[#A6192E] focus:ring-1 focus:ring-[#A6192E]" placeholder="00.000.000/0000-00" />
                </div>
              </div>

              {/* Tipo de Serviço */}
              <div>
                <label className="block text-sm font-bold text-[#A6192E] mb-2">Tipo de Serviço</label>
                <input value={tipoServico} onChange={e => setTipoServico(e.target.value)} className="w-full border border-slate-300 p-3 rounded-lg text-slate-700 outline-none focus:border-[#A6192E] focus:ring-1 focus:ring-[#A6192E]" placeholder="Ex: Alimentação, Transporte, Som..." />
              </div>

              <div className="pt-6 flex justify-center">
                <button type="submit" className="px-10 py-3 bg-[#900020] text-white font-bold rounded-full hover:bg-[#700018] shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1">
                  Cadastrar Fornecedor
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL DE MENSAGEM */}
      {msgModal.show && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-fade-in">
          <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl scale-in-center text-center flex flex-col items-center font-sans">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
              msgModal.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
            }`}>
              {msgModal.type === 'success' ? <CheckCircle size={32} /> : <AlertCircle size={32} />}
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">{msgModal.title}</h3>
            <p className="text-slate-600 mb-8">{msgModal.message}</p>
            <button onClick={closeMessage} className="w-full py-3 bg-[#900020] text-white font-bold rounded-full hover:bg-[#700018] transition-colors shadow-md">
              OK, entendi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
