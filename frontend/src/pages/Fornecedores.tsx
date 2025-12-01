import { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Trash2, Truck, Phone, FileText } from 'lucide-react';

interface Fornecedor {
  id: string;
  nome: string;
  cnpjOuCpf: string;
  categoria: string;
  telefone: string;
}

export function Fornecedores() {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [showModal, setShowModal] = useState(false);

  // Form
  const [nome, setNome] = useState('');
  const [cnpjOuCpf, setCnpjOuCpf] = useState('');
  const [categoria, setCategoria] = useState('');
  const [telefone, setTelefone] = useState('');

  useEffect(() => { carregar(); }, []);

  async function carregar() {
    const res = await api.get('/fornecedores');
    setFornecedores(res.data);
  }

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post('/fornecedores', { nome, cnpjOuCpf, categoria, telefone });
      alert('Fornecedor salvo!');
      setShowModal(false);
      setNome(''); setCnpjOuCpf(''); setCategoria(''); setTelefone('');
      carregar();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao salvar');
    }
  }

  async function handleDeletar(id: string) {
    if (confirm('Excluir este fornecedor?')) {
      await api.delete(`/fornecedores/${id}`);
      setFornecedores(fornecedores.filter(f => f.id !== id));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Fornecedores</h1>
          <p className="text-slate-500">Gestão de parceiros e prestadores de serviço.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-[#A6192E] hover:bg-[#8a1425] text-white px-4 py-2 rounded flex items-center gap-2">
          <Plus size={20} /> Novo Fornecedor
        </button>
      </div>

      <div className="bg-white rounded-lg shadow border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Razão Social / Nome</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Documento (CNPJ/CPF)</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Categoria</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Telefone</th>
              <th className="px-6 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {fornecedores.map(f => (
              <tr key={f.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-700 flex items-center gap-2">
                  <Truck size={16} className="text-slate-400"/> {f.nome}
                </td>
                <td className="px-6 py-4 text-slate-600 font-mono text-sm">{f.cnpjOuCpf}</td>
                <td className="px-6 py-4"><span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold">{f.categoria || 'Geral'}</span></td>
                <td className="px-6 py-4 text-slate-500 text-sm">{f.telefone}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleDeletar(f.id)} className="text-red-400 hover:text-red-600"><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
             {fornecedores.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400">Nenhum fornecedor cadastrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Novo Fornecedor</h2>
            <form onSubmit={handleSalvar} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Nome / Razão Social</label>
                <input required value={nome} onChange={e => setNome(e.target.value)} className="w-full border p-2 rounded outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ex: Buffet Delícia Ltda" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">CNPJ ou CPF</label>
                <input required value={cnpjOuCpf} onChange={e => setCnpjOuCpf(e.target.value)} className="w-full border p-2 rounded outline-none focus:ring-2 focus:ring-blue-500" placeholder="Apenas números" />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700">Categoria</label>
                  <input value={categoria} onChange={e => setCategoria(e.target.value)} className="w-full border p-2 rounded outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ex: Alimentação" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700">Telefone</label>
                  <input value={telefone} onChange={e => setTelefone(e.target.value)} className="w-full border p-2 rounded outline-none focus:ring-2 focus:ring-blue-500" placeholder="(00) 0000-0000" />
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
