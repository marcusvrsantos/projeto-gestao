import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Trash2, DollarSign, Plus, ArrowLeft, FileText, CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react';

interface Despesa {
  id: string;
  descricao: string;
  valor: number;
  categoria: string;
  status: 'PENDENTE' | 'PAGO';
}

interface MessageModalData { show: boolean; title: string; message: string; type: 'success' | 'error'; }
interface ConfirmModalData { show: boolean; id: string | null; }

export function FinanceiroEventos() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [categoria, setCategoria] = useState('');
  const [status, setStatus] = useState('PENDENTE');

  // MODAIS PADRONIZADOS
  const [msgModal, setMsgModal] = useState<MessageModalData>({ show: false, title: '', message: '', type: 'success' });
  const [confirmModal, setConfirmModal] = useState<ConfirmModalData>({ show: false, id: null });

  useEffect(() => { carregarFinanceiro(); }, [id]);

  function showMessage(title: string, message: string, type: 'success' | 'error') {
    setMsgModal({ show: true, title, message, type });
  }
  function closeMessage() { setMsgModal({ ...msgModal, show: false }); }

  async function carregarFinanceiro() {
    try {
      const res = await api.get(`/financeiro/evento/${id}`);
      setDespesas(res.data);
    } catch (error) {
      showMessage('Erro', 'Não foi possível carregar o financeiro.', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleAdicionar(e: React.FormEvent) {
    e.preventDefault();
    if (!descricao || !valor) return showMessage('Atenção', 'Preencha descrição e valor.', 'error');

    try {
      await api.post('/financeiro', {
        eventoId: id,
        descricao,
        valor: parseFloat(valor),
        categoria,
        status
      });
      setDescricao(''); setValor(''); setCategoria(''); setStatus('PENDENTE');
      showMessage('Sucesso', 'Despesa registrada!', 'success');
      carregarFinanceiro();
    } catch (error) {
      showMessage('Erro', 'Erro ao salvar despesa.', 'error');
    }
  }

  function solicitarExclusao(idDespesa: string) {
    setConfirmModal({ show: true, id: idDespesa });
  }

  async function confirmarExclusao() {
    if (!confirmModal.id) return;
    try {
      await api.delete(`/financeiro/${confirmModal.id}`);
      setDespesas(despesas.filter(d => d.id !== confirmModal.id));
      setConfirmModal({ show: false, id: null });
      showMessage('Excluído', 'Despesa removida do orçamento.', 'success');
    } catch (error) {
      setConfirmModal({ show: false, id: null });
      showMessage('Erro', 'Erro ao excluir despesa.', 'error');
    }
  }

  const total = despesas.reduce((acc, d) => acc + d.valor, 0);

  return (
    <div className="space-y-6 font-sans">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/eventos')} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Controle Orçamentário</h1>
            <p className="text-slate-500">Gestão de custos deste evento.</p>
          </div>
        </div>
        <div className="bg-slate-800 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-full"><DollarSign size={20}/></div>
            <div>
                <span className="block text-xs text-slate-300 uppercase font-bold">Total Previsto</span>
                <span className="block text-xl font-bold">R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulário */}
        <div className="bg-white p-6 rounded-lg shadow border border-slate-200 h-fit">
          <h3 className="font-bold text-[#A6192E] mb-4 flex items-center gap-2 border-b pb-2"><Plus size={20}/> Nova Despesa</h3>
          <form onSubmit={handleAdicionar} className="space-y-4">
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Descrição</label>
                <input value={descricao} onChange={e => setDescricao(e.target.value)} className="w-full border border-slate-300 p-2 rounded outline-none focus:border-[#A6192E]" placeholder="Ex: Buffet, Decoração..." />
            </div>
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Valor (R$)</label>
                <input type="number" step="0.01" value={valor} onChange={e => setValor(e.target.value)} className="w-full border border-slate-300 p-2 rounded outline-none focus:border-[#A6192E]" placeholder="0,00" />
            </div>
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Categoria</label>
                <input value={categoria} onChange={e => setCategoria(e.target.value)} className="w-full border border-slate-300 p-2 rounded outline-none focus:border-[#A6192E]" placeholder="Ex: Alimentação" />
            </div>
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Status Pagamento</label>
                <select value={status} onChange={e => setStatus(e.target.value)} className="w-full border border-slate-300 p-2 rounded outline-none focus:border-[#A6192E] bg-white">
                    <option value="PENDENTE">Pendente</option>
                    <option value="PAGO">Pago</option>
                </select>
            </div>
            <button type="submit" className="w-full bg-[#A6192E] hover:bg-[#8a1425] text-white py-3 rounded font-bold shadow-md transition-transform active:scale-95">
                Adicionar Despesa
            </button>
          </form>
        </div>

        {/* Lista */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow border border-slate-200 overflow-hidden">
             <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Item</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Categoria</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Valor</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-right"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {despesas.map(d => (
                    <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-700">{d.descricao}</td>
                        <td className="px-6 py-4 text-slate-500 text-sm">{d.categoria || '-'}</td>
                        <td className="px-6 py-4 font-bold text-slate-700">R$ {d.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        <td className="px-6 py-4">
                            <span className={`text-xs font-bold px-2 py-1 rounded border ${d.status === 'PAGO' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-amber-100 text-amber-700 border-amber-200'}`}>
                                {d.status}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                            <button onClick={() => solicitarExclusao(d.id)} className="text-red-400 hover:text-red-600 p-2"><Trash2 size={18} /></button>
                        </td>
                    </tr>
                    ))}
                    {despesas.length === 0 && !loading && (
                        <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400">Nenhuma despesa lançada.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>

      {/* --- MENSAGEM MODAL --- */}
      {msgModal.show && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] animate-fade-in">
          <div className="bg-white p-8 rounded-2xl w-full max-w-sm shadow-2xl text-center scale-in-center">
             <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto ${msgModal.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
               {msgModal.type === 'success' ? <CheckCircle size={32} /> : <AlertCircle size={32} />}
             </div>
             <h3 className="text-xl font-bold text-slate-800 mb-2">{msgModal.title}</h3>
             <p className="text-slate-600 mb-6">{msgModal.message}</p>
             <button onClick={closeMessage} className="bg-[#A6192E] text-white px-6 py-3 rounded-full w-full font-bold hover:bg-[#8a1425]">OK, entendi</button>
          </div>
        </div>
      )}

      {/* --- CONFIRMAÇÃO MODAL --- */}
      {confirmModal.show && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] animate-fade-in">
          <div className="bg-white p-8 rounded-2xl w-full max-w-sm shadow-2xl text-center scale-in-center border-t-4 border-amber-500">
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-4 mx-auto">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Excluir Despesa?</h3>
            <p className="text-slate-600 mb-6">O valor será removido do cálculo total do orçamento.</p>
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
