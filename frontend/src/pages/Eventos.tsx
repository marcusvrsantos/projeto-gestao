import { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Trash2, Calendar, MapPin, X, CheckCircle, AlertCircle, Edit } from 'lucide-react';

interface Evento {
  id: string;
  nome: string;
  data: string;
  local?: string;
  descricao?: string;
  status: 'AGENDADO' | 'REALIZADO' | 'CANCELADO';
}
interface MessageModalData { show: boolean; title: string; message: string; type: 'success' | 'error'; }

export function Eventos() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFormModal, setShowFormModal] = useState(false);
  const [msgModal, setMsgModal] = useState<MessageModalData>({ show: false, title: '', message: '', type: 'success' });
  
  // Edição
  const [editingId, setEditingId] = useState<string | null>(null);

  const [nome, setNome] = useState('');
  const [dataHora, setDataHora] = useState('');
  const [local, setLocal] = useState('');
  const [descricao, setDescricao] = useState('');
  const [status, setStatus] = useState('AGENDADO');

  useEffect(() => { carregar(); }, []);

  function showMessage(title: string, message: string, type: 'success' | 'error') {
    setMsgModal({ show: true, title, message, type });
  }
  function closeMessage() { setMsgModal({ ...msgModal, show: false }); }

  async function carregar() {
    try {
      const res = await api.get('/eventos');
      setEventos(res.data);
    } catch (error) { showMessage('Erro', 'Erro ao carregar eventos.', 'error'); } 
    finally { setLoading(false); }
  }

  function handleNovo() {
    setEditingId(null);
    setNome(''); setDataHora(''); setLocal(''); setDescricao(''); setStatus('AGENDADO');
    setShowFormModal(true);
  }

  function handleEditar(ev: Evento) {
    setEditingId(ev.id);
    setNome(ev.nome);
    const d = new Date(ev.data);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    const formatted = d.toISOString().slice(0, 16);
    setDataHora(formatted);

    setLocal(ev.local || '');
    setDescricao(ev.descricao || '');
    setStatus(ev.status);
    setShowFormModal(true);
  }

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload = { 
        nome, data: dataHora, local, descricao, status 
      };

      if (editingId) {
        await api.put(`/eventos/${editingId}`, payload);
        showMessage('Atualizado', 'Evento atualizado com sucesso.', 'success');
      } else {
        await api.post('/eventos', payload);
        showMessage('Sucesso', 'Evento agendado com sucesso.', 'success');
      }
      
      setShowFormModal(false);
      carregar();
    } catch (error: any) {
      const erroMsg = error.response?.data?.error || 'Erro ao salvar';
      showMessage('Atenção', erroMsg, 'error');
    }
  }

  async function handleDeletar(id: string) {
    if (!confirm('Excluir este evento?')) return;
    try {
      await api.delete(`/eventos/${id}`);
      setEventos(eventos.filter(e => e.id !== id));
      showMessage('Excluído', 'Evento removido.', 'success');
    } catch (error) {
      showMessage('Erro', 'Não foi possível excluir.', 'error');
    }
  }

  function formatarData(isoString: string) {
    const data = new Date(isoString);
    return data.toLocaleString('pt-BR', { 
      day: '2-digit', month: '2-digit', year: 'numeric', 
      hour: '2-digit', minute: '2-digit' 
    });
  }

  function getStatusColor(st: string) {
    if (st === 'REALIZADO') return 'bg-green-100 text-green-700 border-green-200';
    if (st === 'CANCELADO') return 'bg-red-100 text-red-700 border-red-200';
    return 'bg-blue-100 text-blue-700 border-blue-200';
  }

  return (
    <div className="space-y-6 font-sans">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Gestão de Eventos</h1>
          <p className="text-slate-500">Agenda corporativa e controle de atividades.</p>
        </div>
        <button onClick={handleNovo} className="bg-[#A6192E] hover:bg-[#8a1425] text-white px-4 py-2 rounded flex items-center gap-2 transition-colors shadow-sm">
          <Plus size={20} /> Novo Evento
        </button>
      </div>

      <div className="bg-white rounded-lg shadow border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Evento</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Data / Status</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Local</th>
              <th className="px-6 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {eventos.map(ev => (
              <tr key={ev.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-800 text-base">{ev.nome}</div>
                  <div className="text-slate-500 text-sm mt-1 line-clamp-1">{ev.descricao || 'Sem descrição'}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-slate-700 font-medium">
                    <Calendar size={16} className="text-slate-400"/>
                    {formatarData(ev.data)}
                  </div>
                  <span className={`inline-block mt-2 px-2 py-0.5 rounded text-xs font-bold border ${getStatusColor(ev.status)}`}>
                    {ev.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-slate-600">
                    <MapPin size={16} className="text-slate-400"/>
                    {ev.local || 'A definir'}
                  </div>
                </td>
                <td className="px-6 py-4 text-right whitespace-nowrap">
                  <button onClick={() => handleEditar(ev)} className="text-blue-500 hover:text-blue-700 p-2 transition-colors">
                    <Edit size={18} />
                  </button>
                  <button onClick={() => handleDeletar(ev.id)} className="text-red-400 hover:text-red-600 p-2 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {eventos.length === 0 && !loading && (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400">Nenhum evento agendado.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showFormModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden scale-in-center">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-[#A6192E]">
                {editingId ? 'Editar Evento' : 'Novo Evento'}
              </h2>
              <button onClick={() => setShowFormModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors rounded-full p-1 hover:bg-slate-100">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSalvar} className="p-8 space-y-5">
              <div>
                <label className="block text-sm font-bold text-[#A6192E] mb-2">Nome do Evento</label>
                <input required value={nome} onChange={e => setNome(e.target.value)} className="w-full border border-slate-300 p-3 rounded-lg text-slate-700 outline-none focus:border-[#A6192E]" placeholder="Ex: Festa de Fim de Ano" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                   <label className="block text-sm font-bold text-[#A6192E] mb-2">Data e Hora</label>
                   <input required type="datetime-local" value={dataHora} onChange={e => setDataHora(e.target.value)} className="w-full border border-slate-300 p-3 rounded-lg text-slate-700 outline-none focus:border-[#A6192E]" />
                </div>
                <div>
                   <label className="block text-sm font-bold text-[#A6192E] mb-2">Local</label>
                   <div className="relative">
                     <MapPin className="absolute left-3 top-3 text-slate-400 h-5 w-5" />
                     <input value={local} onChange={e => setLocal(e.target.value)} className="w-full pl-10 border border-slate-300 p-3 rounded-lg text-slate-700 outline-none focus:border-[#A6192E]" placeholder="Sala de Reuniões / Externo" />
                   </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-[#A6192E] mb-2">Status</label>
                <select value={status} onChange={e => setStatus(e.target.value)} className="w-full border border-slate-300 p-3 rounded-lg text-slate-700 outline-none focus:border-[#A6192E] bg-white">
                  <option value="AGENDADO">Agendado</option>
                  <option value="REALIZADO">Realizado</option>
                  <option value="CANCELADO">Cancelado</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-[#A6192E] mb-2">Descrição / Observações</label>
                <textarea rows={3} value={descricao} onChange={e => setDescricao(e.target.value)} className="w-full border border-slate-300 p-3 rounded-lg text-slate-700 outline-none focus:border-[#A6192E]" placeholder="Detalhes importantes sobre o evento..." />
              </div>
              <div className="pt-6 flex justify-center">
                <button type="submit" className="px-10 py-3 bg-[#900020] text-white font-bold rounded-full hover:bg-[#700018] shadow-md transition-all transform hover:-translate-y-1">
                  {editingId ? 'Salvar Alterações' : 'Agendar Evento'}
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
