import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Trash2, Send, Upload, Plus, ArrowLeft, CheckCircle, AlertCircle, AlertTriangle, Mail, FileText } from 'lucide-react';

interface Convidado { id: string; nomeConvidado: string; emailConvidado: string; status: 'PENDENTE' | 'CONFIRMADO' | 'RECUSADO'; token: string; }
interface MessageModalData { show: boolean; title: string; message: string; type: 'success' | 'error'; }

// MODAL DE CONFIRMAÇÃO VERSÁTIL (Pode ser Deletar ou Disparar)
interface ConfirmModalData { 
    show: boolean; 
    action: 'DELETE_GUEST' | 'SEND_EMAILS' | null; // Tipo da ação
    data?: any; // Dados extras (ID para deletar, ou quantidade para enviar)
}

export function ConvidadosEventos() {
  const { id } = useParams(); const navigate = useNavigate();
  const [convidados, setConvidados] = useState<Convidado[]>([]);
  const [novoNome, setNovoNome] = useState(''); const [novoEmail, setNovoEmail] = useState('');
  const [loading, setLoading] = useState(true); const [sending, setSending] = useState(false);

  // MODAIS PADRONIZADOS
  const [msgModal, setMsgModal] = useState<MessageModalData>({ show: false, title: '', message: '', type: 'success' });
  // Novo estado do modal de confirmação versátil
  const [confirmModal, setConfirmModal] = useState<ConfirmModalData>({ show: false, action: null });

  useEffect(() => { carregarConvidados(); }, [id]);

  function showMessage(title: string, message: string, type: 'success' | 'error') {
    setMsgModal({ show: true, title, message, type });
  }
  function closeMessage() { setMsgModal({ ...msgModal, show: false }); }

  async function carregarConvidados() {
    try { const res = await api.get(`/convites/evento/${id}`); setConvidados(res.data); } 
    catch (error) { showMessage('Erro', 'Erro ao carregar lista.', 'error'); } finally { setLoading(false); }
  }

  async function handleAdicionar() {
    if (!novoNome || !novoEmail) return showMessage('Atenção', 'Preencha nome e e-mail.', 'error');
    try {
      await api.post('/convites/adicionar', { eventoId: id, listaPessoas: [{ nome: novoNome, email: novoEmail }] });
      setNovoNome(''); setNovoEmail('');
      // Substitui o alert da imagem 4
      showMessage('Sucesso', 'Convidado adicionado à lista com sucesso!', 'success');
      carregarConvidados();
    } catch (error) { showMessage('Erro', 'Erro ao adicionar convidado.', 'error'); }
  }

  // --- NOVAS FUNÇÕES DE CONTROLE DOS MODAIS ---

  // 1. Solicita Exclusão (Abre Modal Visual)
  function solicitarExclusao(idConvidado: string) {
    setConfirmModal({ show: true, action: 'DELETE_GUEST', data: idConvidado });
  }

  // 2. Solicita Disparo (Abre Modal Visual - Substitui o window.confirm nativo)
  function solicitarDisparo() {
    const pendentes = convidados.filter(c => c.status === 'PENDENTE').length;
    if (pendentes === 0) return showMessage('Aviso', 'Não há convites pendentes para enviar.', 'error');
    setConfirmModal({ show: true, action: 'SEND_EMAILS', data: pendentes });
  }

  // 3. Função Única que executa a ação quando clica "SIM" no modal
  async function handleConfirmAction() {
    setConfirmModal({ ...confirmModal, show: false }); // Fecha o modal primeiro

    if (confirmModal.action === 'DELETE_GUEST' && confirmModal.data) {
        try {
            await api.delete(`/convites/${confirmModal.data}`);
            setConvidados(convidados.filter(c => c.id !== confirmModal.data));
            showMessage('Excluído', 'Convidado removido da lista.', 'success');
        } catch (error) { showMessage('Erro', 'Erro ao remover convidado.', 'error'); }
    } 
    
    else if (confirmModal.action === 'SEND_EMAILS') {
        setSending(true);
        try {
            const res = await api.post('/convites/disparar', { eventoId: id });
            // Substitui os alerts das imagens 1 e 3
            showMessage('Sucesso', res.data.message || 'Convites enviados!', 'success');
            carregarConvidados();
        } catch (error) { showMessage('Erro', 'Falha ao enviar e-mails.', 'error'); } 
        finally { setSending(false); }
    }
    setConfirmModal({ show: false, action: null, data: null }); // Limpa o estado
  }


  function getStatusBadge(status: string) {
    if (status === 'CONFIRMADO') return <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold border border-green-200">Confirmado</span>;
    if (status === 'RECUSADO') return <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-bold border border-red-200">Recusou</span>;
    return <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-bold border border-amber-200">Pendente</span>;
  }

  return (
    <div className="space-y-6 font-sans">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/eventos')} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500"><ArrowLeft size={24} /></button>
          <div><h1 className="text-2xl font-bold text-slate-800">Lista de Convidados</h1><p className="text-slate-500">Gerencie quem vai participar deste evento.</p></div>
        </div>
        {/* Botão agora chama solicitarDisparo */}
        <button onClick={solicitarDisparo} disabled={sending || convidados.filter(c=>c.status==='PENDENTE').length === 0} className="bg-[#A6192E] hover:bg-[#8a1425] disabled:opacity-50 text-white px-6 py-2 rounded flex items-center gap-2 shadow-sm transition-colors">
          <Send size={18} /> {sending ? 'Enviando...' : 'Disparar Convites'}
        </button>
      </div>

      {/* Card de Adição Rápida */}
      <div className="bg-white p-6 rounded-lg shadow border border-slate-200">
        <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><Plus size={20} className="text-[#A6192E]"/> Adicionar Convidado Manualmente</h3>
        <div className="flex gap-4 items-end">
          <div className="flex-1"><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome</label><input value={novoNome} onChange={e => setNovoNome(e.target.value)} className="w-full border border-slate-300 p-2 rounded outline-none focus:border-[#A6192E]" placeholder="Nome do convidado" /></div>
          <div className="flex-1"><label className="block text-xs font-bold text-slate-500 uppercase mb-1">E-mail</label><input value={novoEmail} onChange={e => setNovoEmail(e.target.value)} className="w-full border border-slate-300 p-2 rounded outline-none focus:border-[#A6192E]" placeholder="email@empresa.com" /></div>
          <button onClick={handleAdicionar} className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-2.5 rounded font-bold shadow-sm">Adicionar</button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr><th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Nome</th><th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">E-mail</th><th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase text-center">Status</th><th className="px-6 py-3 text-right">Ações</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {convidados.map(c => (
              <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-700">{c.nomeConvidado}</td>
                <td className="px-6 py-4 text-slate-600">{c.emailConvidado}</td>
                <td className="px-6 py-4 text-center">{getStatusBadge(c.status)}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => solicitarExclusao(c.id)} className="text-red-400 hover:text-red-600 p-2 transition-colors"><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
            {convidados.length === 0 && !loading && (<tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400">Nenhum convidado nesta lista.</td></tr>)}
          </tbody>
        </table>
      </div>

      {/* --- MENSAGEM MODAL (Sucesso/Erro) --- */}
      {msgModal.show && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] animate-fade-in font-sans">
          <div className="bg-white p-8 rounded-2xl w-full max-w-sm shadow-2xl text-center scale-in-center">
             <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto ${msgModal.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>{msgModal.type === 'success' ? <CheckCircle size={32} /> : <AlertCircle size={32} />}</div>
             <h3 className="text-xl font-bold text-slate-800 mb-2">{msgModal.title}</h3>
             <p className="text-slate-600 mb-6 leading-relaxed">{msgModal.message}</p>
             <button onClick={closeMessage} className="bg-[#A6192E] text-white px-6 py-3 rounded-full w-full font-bold hover:bg-[#8a1425] shadow-md">OK, entendi</button>
          </div>
        </div>
      )}

      {/* --- CONFIRMAÇÃO MODAL VERSÁTIL (Excluir OU Disparar) --- */}
      {confirmModal.show && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] animate-fade-in font-sans">
          <div className="bg-white p-8 rounded-2xl w-full max-w-sm shadow-2xl text-center scale-in-center border-t-4 border-amber-500">
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-4 mx-auto">
              {confirmModal.action === 'SEND_EMAILS' ? <Mail size={32} /> : <AlertTriangle size={32} />}
            </div>
            
            <h3 className="text-xl font-bold text-slate-800 mb-2">
                {confirmModal.action === 'SEND_EMAILS' ? 'Disparar Convites?' : 'Remover Convidado?'}
            </h3>
            
            <p className="text-slate-600 mb-6 leading-relaxed">
                {confirmModal.action === 'SEND_EMAILS' 
                    ? `Deseja enviar e-mails para os ${confirmModal.data} convidados pendentes?`
                    : 'Ele não receberá mais atualizações deste evento.'}
            </p>

            <div className="flex gap-3">
              <button onClick={() => setConfirmModal({ show: false, action: null, data: null })} className="flex-1 py-3 border border-slate-300 text-slate-700 font-bold rounded-full hover:bg-slate-50 transition-colors">Cancelar</button>
              <button onClick={handleConfirmAction} className={`flex-1 py-3 text-white font-bold rounded-full shadow-md transition-colors ${confirmModal.action === 'SEND_EMAILS' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'}`}>
                {confirmModal.action === 'SEND_EMAILS' ? 'Sim, Disparar' : 'Sim, Remover'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
