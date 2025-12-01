import { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Trash2, Search, User, Briefcase, Mail } from 'lucide-react';

interface Colaborador {
  id: string;
  nome: string;
  email: string;
  cargo: string;
}

interface Empresa {
  id: string;
  razaoSocial: string;
}

export function Colaboradores() {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form states
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [cargo, setCargo] = useState('');
  const [empresaId, setEmpresaId] = useState('');

  // Carrega dados ao abrir a tela
  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      const [resColab, resEmpresa] = await Promise.all([
        api.get('/colaboradores'),
        api.get('/empresas')
      ]);
      setColaboradores(resColab.data);
      setEmpresas(resEmpresa.data);
      
      // Seleciona a primeira empresa automaticamente (ISG)
      if (resEmpresa.data.length > 0) {
        setEmpresaId(resEmpresa.data[0].id);
      }
    } catch (error) {
      console.error("Erro ao carregar dados", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post('/colaboradores', {
        nome,
        email,
        cargo,
        empresaId
      });
      alert('Colaborador cadastrado com sucesso!');
      setShowModal(false);
      setNome(''); setEmail(''); setCargo(''); // Limpa form
      carregarDados(); // Recarrega a lista
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao salvar');
    }
  }

  async function handleDeletar(id: string) {
    if (!confirm('Tem certeza que deseja excluir?')) return;
    try {
      await api.delete(`/colaboradores/${id}`);
      setColaboradores(colaboradores.filter(c => c.id !== id));
    } catch (error) {
      alert('Erro ao excluir');
    }
  }

  return (
    <div className="space-y-6">
      {/* Header da Página */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Colaboradores</h1>
          <p className="text-slate-500">Gerencie a equipe da ISG e seus acessos.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-[#A6192E] hover:bg-[#8a1425] text-white px-4 py-2 rounded flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Novo Colaborador
        </button>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-lg shadow border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Nome</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Cargo</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Email</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {colaboradores.map(colab => (
              <tr key={colab.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                    <User size={16} />
                  </div>
                  <span className="font-medium text-slate-700">{colab.nome}</span>
                </td>
                <td className="px-6 py-4 text-slate-600">{colab.cargo}</td>
                <td className="px-6 py-4 text-slate-500">{colab.email}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleDeletar(colab.id)} className="text-red-400 hover:text-red-600 p-2">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {colaboradores.length === 0 && !loading && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                  Nenhum colaborador encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Cadastro */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Novo Colaborador</h2>
            <form onSubmit={handleSalvar} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
                <div className="relative">
                   <User className="absolute left-3 top-2.5 text-slate-400 h-5 w-5" />
                   <input required value={nome} onChange={e => setNome(e.target.value)} className="w-full pl-10 border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ex: João Silva" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">E-mail Corporativo</label>
                <div className="relative">
                   <Mail className="absolute left-3 top-2.5 text-slate-400 h-5 w-5" />
                   <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-10 border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" placeholder="joao@isg.com.br" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cargo</label>
                <div className="relative">
                   <Briefcase className="absolute left-3 top-2.5 text-slate-400 h-5 w-5" />
                   <input required value={cargo} onChange={e => setCargo(e.target.value)} className="w-full pl-10 border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ex: Analista Financeiro" />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6 justify-end">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-[#A6192E] text-white rounded hover:bg-[#8a1425]">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
