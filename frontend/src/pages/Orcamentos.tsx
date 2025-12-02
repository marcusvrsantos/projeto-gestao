import { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Trash2, Mail, DollarSign, FileText, Send, X, CheckCircle, AlertCircle } from 'lucide-react';

interface Orcamento {
  id: string;
  valor: number;
  status: 'PENDENTE' | 'APROVADO' | 'REJEITADO';
  formaPagto?: string;
  fornecedor: { nome: string };
  evento: { nome: string; data: string };
}
interface Fornecedor { id: string; nome: string; email?: string }
interface Evento { id: string; nome: string }

export function Orcamentos() {
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [msgModal, setMsgModal] = useState({ show: false, title: '', message: '', type: 'success' });

  // Estado do valor agora é string para aceitar formatação (R$ 1.000,00)
  const [valor, setValor] = useState('');
  const [formaPagto, setFormaPagto] = useState('');
  const [status, setStatus] = useState('PENDENTE');
  const [selectedEvento, setSelectedEvento] = useState('');
  const [selectedFornecedor, setSelectedFornecedor] = useState('');

  const [emailBody, setEmailBody] = useState('');

  useEffect(() => { carregarDados(); }, []);

  async function carregarDados() {
    try {
      const [resOrc, resForn, resEvt] = await Promise.all([
        api.get('/orcamentos'),
        api.get('/fornecedores'),
        api.get('/eventos')
      ]);
      setOrcamentos(resOrc.data);
      setFornecedores(resForn.data);
      setEventos(resEvt.data);
    } catch (error) {
      console.error(error);
    }
  }

  // --- FUNÇÕES DE FORMATAÇÃO (NOVO) ---

  // Formata número para exibição (ex: 3000 -> R$ 3.000,00)
  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  };

  // Mascara o input enquanto você digita
  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // 1. Remove tudo que não é dígito
    value = value.replace(/\D/g, "");

    // 2. Converte para número e divide por 100 (para considerar os centavos)
    const numberValue = Number(value) / 100;

    // 3. Formata de volta para BRL string
    setValor(numberValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  };

  // Limpa a formatação para enviar ao Banco (ex: "3.000,00" -> 3000.00)
  const limparValorParaSalvar = (valorFormatado: string) => {
    if (!valorFormatado) return 0;
    // Remove pontos de milhar e troca vírgula decimal por ponto
    const limpo = valorFormatado.replace(/\./g, '').replace(',', '.');
    return parseFloat(limpo);
  };

  // --- AÇÕES ---

  async function handleRegistrar(e: React.FormEvent) {
    e.preventDefault();
    try {
      // Converte o texto formatado para número puro antes de enviar
      const valorNumero = limparValorParaSalvar(valor);

      await api.post('/orcamentos', {
        valor: valorNumero,
        formaPagto,
        status,
        eventoId: selectedEvento,
        fornecedorId: selectedFornecedor
      });
      setShowRegisterModal(false);
      carregarDados();
      setMsgModal({ show: true, title: 'Sucesso', message: 'Orçamento registrado!', type: 'success' });
      setValor(''); setFormaPagto('');
    } catch (error) {
      setMsgModal({ show: true, title: 'Erro', message: 'Falha ao registrar orçamento.', type: 'error' });
    }
  }

  async function handleEnviarEmail(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post('/orcamentos/solicitar', {
        fornecedorId: selectedFornecedor,
        eventoId: selectedEvento,
        mensagemPersonalizada: emailBody
      });
      setShowEmailModal(false);
      setMsgModal({ show: true, title: 'E-mail Enviado', message: 'Solicitação enviada!', type: 'success' });
      setEmailBody('');
    } catch (error: any) {
      const msg = error.response?.data?.error || 'Erro ao enviar e-mail.';
      setMsgModal({ show: true, title: 'Erro', message: msg, type: 'error' });
    }
  }

  function openEmailModal() {
    if(!selectedFornecedor || !selectedEvento) {
      setMsgModal({ show: true, title: 'Atenção', message: 'Selecione um Evento e Fornecedor.', type: 'error' });
      return;
    }
    const forn = fornecedores.find(f => f.id === selectedFornecedor);
    const evt = eventos.find(e => e.id === selectedEvento);
    const template = `Olá ${forn?.nome},\n\nGostaríamos de solicitar um orçamento para o evento "${evt?.nome}".\n\nAtt,\nEquipe ISG.`;
    setEmailBody(template);
    setShowEmailModal(true);
  }

  return (
    <div className="space-y-6 font-sans">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Orçamentos</h1>
          <p className="text-slate-500">Controle financeiro e solicitações de cotação.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={openEmailModal} className="bg-slate-700 hover:bg-slate-800 text-white px-4 py-2 rounded flex items-center gap-2 shadow-sm transition-colors">
            <Mail size={18} /> Solicitar Cotação
          </button>
          <button onClick={() => setShowRegisterModal(true)} className="bg-[#A6192E] hover:bg-[#8a1425] text-white px-4 py-2 rounded flex items-center gap-2 shadow-sm transition-colors">
            <Plus size={18} /> Registrar Proposta
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex gap-4 items-end">
        <div className="flex-1">
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Evento</label>
          <select value={selectedEvento} onChange={e => setSelectedEvento(e.target.value)} className="w-full border p-2 rounded text-sm bg-white">
            <option value="">Selecione um evento...</option>
            {eventos.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Fornecedor</label>
          <select value={selectedFornecedor} onChange={e => setSelectedFornecedor(e.target.value)} className="w-full border p-2 rounded text-sm bg-white">
            <option value="">Selecione um fornecedor...</option>
            {fornecedores.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase">
            <tr>
              <th className="px-6 py-3 font-semibold">Evento / Fornecedor</th>
              <th className="px-6 py-3 font-semibold">Valor</th>
              <th className="px-6 py-3 font-semibold">Pagamento</th>
              <th className="px-6 py-3 font-semibold">Status</th>
              <th className="px-6 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {orcamentos.map(orc => (
              <tr key={orc.id} className="hover:bg-slate-50">
                <td className="px-6 py-4">
                  <div className="font-bold">{orc.evento.nome}</div>
                  <div className="text-xs text-slate-500">{orc.fornecedor.nome}</div>
                </td>
                <td className="px-6 py-4 font-mono font-medium text-slate-800">
                  {formatarMoeda(Number(orc.valor))}
                </td>
                <td className="px-6 py-4">{orc.formaPagto || '-'}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold border ${
                    orc.status === 'APROVADO' ? 'bg-green-100 text-green-700 border-green-200' :
                    orc.status === 'REJEITADO' ? 'bg-red-100 text-red-700 border-red-200' :
                    'bg-amber-100 text-amber-700 border-amber-200'
                  }`}>
                    {orc.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => { 
                     api.delete(`/orcamentos/${orc.id}`).then(carregarDados); 
                  }} className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
            {orcamentos.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400">Nenhum orçamento registrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL 1: REGISTRAR VALOR */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in">
            <div className="p-6 border-b flex justify-between">
              <h3 className="font-bold text-[#A6192E]">Registrar Proposta</h3>
              <button onClick={() => setShowRegisterModal(false)}><X size={20}/></button>
            </div>
            <form onSubmit={handleRegistrar} className="p-6 space-y-4">
              {!selectedEvento || !selectedFornecedor ? (
                <div className="text-amber-600 bg-amber-50 p-3 rounded text-sm">
                  Selecione o Evento e o Fornecedor nos filtros acima antes de registrar.
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Valor (R$)</label>
                    <div className="relative">
                       <span className="absolute left-3 top-2.5 text-slate-500 font-bold">R$</span>
                       <input 
                          type="text" 
                          required 
                          value={valor} 
                          onChange={handleValorChange} 
                          className="w-full border p-2 pl-10 rounded font-mono text-lg text-slate-700" 
                          placeholder="0,00"
                       />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Forma de Pagamento</label>
                    <input value={formaPagto} onChange={e => setFormaPagto(e.target.value)} className="w-full border p-2 rounded" placeholder="Ex: 30 dias"/>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Status</label>
                    <select value={status} onChange={e => setStatus(e.target.value)} className="w-full border p-2 rounded bg-white">
                      <option value="PENDENTE">Pendente</option>
                      <option value="APROVADO">Aprovado</option>
                      <option value="REJEITADO">Rejeitado</option>
                    </select>
                  </div>
                  <button type="submit" className="w-full py-2 bg-[#A6192E] text-white rounded font-bold hover:bg-[#8a1425]">Salvar</button>
                </>
              )}
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ENVIAR EMAIL */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in">
            <div className="p-6 border-b flex justify-between bg-slate-50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2"><Mail size={20}/> Solicitar Orçamento</h3>
              <button onClick={() => setShowEmailModal(false)}><X size={20}/></button>
            </div>
            <form onSubmit={handleEnviarEmail} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mensagem (Editável)</label>
                <textarea 
                  rows={8} 
                  value={emailBody} 
                  onChange={e => setEmailBody(e.target.value)} 
                  className="w-full border p-3 rounded text-sm text-slate-700 font-sans leading-relaxed focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowEmailModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded">Cancelar</button>
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 flex items-center gap-2">
                  <Send size={16}/> Enviar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {msgModal.show && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60]">
          <div className="bg-white p-6 rounded-lg text-center max-w-sm shadow-xl">
             <div className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center mb-4 ${
               msgModal.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
             }`}>
               {msgModal.type === 'success' ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
             </div>
             <h3 className="font-bold text-lg mb-2 text-slate-800">{msgModal.title}</h3>
             <p className="mb-6 text-slate-600 text-sm">{msgModal.message}</p>
             <button onClick={() => setMsgModal({ ...msgModal, show: false })} className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-2 rounded-full w-full transition-colors">OK</button>
          </div>
        </div>
      )}
    </div>
  );
}
