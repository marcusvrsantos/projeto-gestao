import { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Trash2, X, CheckCircle, AlertCircle, Edit, Building2, AlertTriangle } from 'lucide-react';

interface Colaborador { id: string; nome: string; email: string; cargo: string; setor?: string; cpf?: string; dataNascimento?: string; empresaId: string; }
interface Empresa { id: string; razaoSocial: string; cnpj: string; }

// Interfaces dos Modais
interface MessageModalData { show: boolean; title: string; message: string; type: 'success' | 'error'; }
interface ConfirmModalData { show: boolean; id: string | null; }

export function Colaboradores() {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroEmpresa, setFiltroEmpresa] = useState('todas');
  const [showFormModal, setShowFormModal] = useState(false);
  const [showEmpresaModal, setShowEmpresaModal] = useState(false);
  
  // ESTADOS DOS MODAIS VISUAIS
  const [msgModal, setMsgModal] = useState<MessageModalData>({ show: false, title: '', message: '', type: 'success' });
  // Adicionado estado para confirmação visual
  const [confirmModal, setConfirmModal] = useState<ConfirmModalData>({ show: false, id: null });

  const [editingId, setEditingId] = useState<string | null>(null);
  // Form States
  const [nome, setNome] = useState(''); const [dataNascimento, setDataNascimento] = useState(''); const [cpf, setCpf] = useState(''); const [email, setEmail] = useState(''); const [empresaId, setEmpresaId] = useState(''); const [cargo, setCargo] = useState(''); const [setor, setSetor] = useState(''); const [departamento, setDepartamento] = useState('');
  // Nova Empresa States
  const [novaEmpresaNome, setNovaEmpresaNome] = useState(''); const [novaEmpresaCNPJ, setNovaEmpresaCNPJ] = useState('');

  useEffect(() => { carregarDados(); }, []);

  function showMessage(title: string, message: string, type: 'success' | 'error') {
    setMsgModal({ show: true, title, message, type });
  }
  function closeMessage() { setMsgModal({ ...msgModal, show: false }); }

  async function carregarDados() {
    try {
      const [resColab, resEmpresa] = await Promise.all([ api.get('/colaboradores'), api.get('/empresas') ]);
      setColaboradores(resColab.data); setEmpresas(resEmpresa.data);
    } catch (error) { showMessage('Erro', 'Não foi possível carregar os dados.', 'error'); } 
    finally { setLoading(false); }
  }

  function handleNovo() {
    setEditingId(null); setNome(''); setEmail(''); setCargo(''); setCpf(''); setSetor(''); setDataNascimento(''); setDepartamento('');
    if (filtroEmpresa !== 'todas') setEmpresaId(filtroEmpresa); else if(empresas.length > 0) setEmpresaId(empresas[0].id);
    setShowFormModal(true);
  }

  function handleEditar(c: Colaborador) {
    setEditingId(c.id); setNome(c.nome); setEmail(c.email); setCargo(c.cargo || ''); setCpf(c.cpf || ''); setSetor(c.setor || ''); setDepartamento(c.setor || ''); setEmpresaId(c.empresaId);
    if (c.dataNascimento) setDataNascimento(c.dataNascimento.split('T')[0]); else setDataNascimento('');
    setShowFormModal(true);
  }

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload = { nome, email, cargo, empresaId, cpf, setor, dataNascimento: dataNascimento ? dataNascimento : undefined };
      if (editingId) {
        await api.put(`/colaboradores/${editingId}`, payload);
        showMessage('Atualizado', 'Colaborador atualizado com sucesso!', 'success');
      } else {
        await api.post('/colaboradores', payload);
        showMessage('Sucesso', 'Colaborador cadastrado com sucesso!', 'success');
      }
      setShowFormModal(false); carregarDados();
    } catch (error: any) {
      showMessage('Atenção', error.response?.data?.error || 'Erro ao salvar.', 'error');
    }
  }

  // 1. Substitui o confirm nativo por abrir o modal visual
  function solicitarExclusao(id: string) {
    setConfirmModal({ show: true, id });
  }

  // 2. Executa a exclusão se clicar em SIM no modal visual
  async function confirmarExclusao() {
    if (!confirmModal.id) return;
    try {
      await api.delete(`/colaboradores/${confirmModal.id}`);
      setColaboradores(colaboradores.filter(c => c.id !== confirmModal.id));
      setConfirmModal({ show: false, id: null }); // Fecha modal de pergunta
      showMessage('Excluído', 'Colaborador removido com sucesso.', 'success'); // Abre modal de sucesso (igual a imagem 0)
    } catch (error) {
      setConfirmModal({ show: false, id: null });
      showMessage('Erro', 'Não foi possível excluir.', 'error');
    }
  }

  async function handleSalvarEmpresa(e: React.FormEvent) {
    e.preventDefault();
    try {
        const cnpjLimpo = novaEmpresaCNPJ.replace(/\D/g, '');
        await api.post('/empresas', { razaoSocial: novaEmpresaNome, cnpj: cnpjLimpo });
        setShowEmpresaModal(false); setNovaEmpresaNome(''); setNovaEmpresaCNPJ('');
        showMessage('Sucesso', 'Nova Unidade de Negócio criada!', 'success');
        carregarDados();
    } catch (error: any) { showMessage('Atenção', error.response?.data?.error || 'Erro ao criar unidade.', 'error'); }
  }

  const colaboradoresFiltrados = filtroEmpresa === 'todas' ? colaboradores : colaboradores.filter(c => c.empresaId === filtroEmpresa);

  return (
    <div className="space-y-6 font-sans">
      <div className="flex justify-between items-center">
        <div><h1 className="text-2xl font-bold text-slate-800">Colaboradores por Unidade</h1><p className="text-slate-500">Gerencie a equipe dividida por empresas da Holding.</p></div>
        <div className="flex gap-2">
            <button onClick={() => setShowEmpresaModal(true)} className="bg-slate-700 hover:bg-slate-800 text-white px-4 py-2 rounded flex items-center gap-2 shadow-sm"><Building2 size={20} /> Nova Unidade</button>
            <button onClick={handleNovo} className="bg-[#A6192E] hover:bg-[#8a1425] text-white px-4 py-2 rounded flex items-center gap-2 shadow-sm"><Plus size={20} /> Novo Colaborador</button>
        </div>
      </div>

      <div className="border-b border-slate-200 flex gap-6 overflow-x-auto pb-1">
        <button onClick={() => setFiltroEmpresa('todas')} className={`pb-3 text-sm font-bold uppercase tracking-wide border-b-2 transition-colors whitespace-nowrap ${filtroEmpresa === 'todas' ? 'border-[#A6192E] text-[#A6192E]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>Todas ({colaboradores.length})</button>
        {empresas.map(emp => {
            const qtd = colaboradores.filter(c => c.empresaId === emp.id).length;
            return (<button key={emp.id} onClick={() => setFiltroEmpresa(emp.id)} className={`pb-3 text-sm font-bold uppercase tracking-wide border-b-2 transition-colors whitespace-nowrap ${filtroEmpresa === emp.id ? 'border-[#A6192E] text-[#A6192E]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>{emp.razaoSocial} ({qtd})</button>);
        })}
      </div>

      <div className="bg-white rounded-lg shadow border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr><th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Nome</th><th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Unidade / Cargo</th><th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Email / CPF</th><th className="px-6 py-3 text-right">Ações</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {colaboradoresFiltrados.map(colab => (
                <tr key={colab.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4"><span className="font-medium text-slate-700 block">{colab.nome}</span></td>
                    <td className="px-6 py-4"><div className="text-[#A6192E] font-bold text-xs uppercase mb-1">{empresas.find(e => e.id === colab.empresaId)?.razaoSocial || 'N/A'}</div><div className="text-slate-500 text-sm">{colab.cargo}</div></td>
                    <td className="px-6 py-4"><div className="text-slate-600 text-sm">{colab.email}</div><div className="text-slate-400 text-xs">{colab.cpf || 'Sem CPF'}</div></td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                    <button onClick={() => handleEditar(colab)} className="text-blue-500 hover:text-blue-700 p-2"><Edit size={18} /></button>
                    {/* Botão agora chama a função que abre o modal visual */}
                    <button onClick={() => solicitarExclusao(colab.id)} className="text-red-400 hover:text-red-600 p-2"><Trash2 size={18} /></button>
                    </td>
                </tr>
            ))}
             {colaboradoresFiltrados.length === 0 && !loading && (<tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400">Nenhum colaborador nesta unidade.</td></tr>)}
          </tbody>
        </table>
      </div>

      {/* MODAIS DE FORMULÁRIO (Mantidos iguais) */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden scale-in-center overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-slate-100"><h2 className="text-xl font-bold text-[#A6192E]">{editingId ? 'Editar Colaborador' : 'Novo Colaborador'}</h2><button onClick={() => setShowFormModal(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button></div>
            <form onSubmit={handleSalvar} className="p-8 space-y-5">
              <div><label className="block text-sm font-bold text-[#A6192E] mb-2">Nome Completo</label><input required value={nome} onChange={e => setNome(e.target.value)} className="w-full border border-slate-300 p-3 rounded-lg outline-none focus:border-[#A6192E]" /></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div><label className="block text-sm font-bold text-[#A6192E] mb-2">Unidade de Negócio</label><select required value={empresaId} onChange={e => setEmpresaId(e.target.value)} className="w-full border border-slate-300 p-3 rounded-lg outline-none focus:border-[#A6192E] bg-white"><option value="">Selecione a Unidade</option>{empresas.map(emp => <option key={emp.id} value={emp.id}>{emp.razaoSocial}</option>)}</select></div>
                <div><label className="block text-sm font-bold text-[#A6192E] mb-2">Cargo</label><input required value={cargo} onChange={e => setCargo(e.target.value)} className="w-full border border-slate-300 p-3 rounded-lg outline-none focus:border-[#A6192E]" /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div><label className="block text-sm font-bold text-[#A6192E] mb-2">E-mail</label><input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border border-slate-300 p-3 rounded-lg outline-none focus:border-[#A6192E]" /></div>
                <div><label className="block text-sm font-bold text-[#A6192E] mb-2">CPF</label><input value={cpf} onChange={e => setCpf(e.target.value)} className="w-full border border-slate-300 p-3 rounded-lg outline-none focus:border-[#A6192E]" /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                 <div className="col-span-1"><label className="block text-sm font-bold text-[#A6192E] mb-2">Data Nascimento</label><input type="date" value={dataNascimento} onChange={e => setDataNascimento(e.target.value)} className="w-full border border-slate-300 p-3 rounded-lg outline-none focus:border-[#A6192E]" /></div>
                 <div className="col-span-1"><label className="block text-sm font-bold text-[#A6192E] mb-2">Setor</label><input value={setor} onChange={e => setSetor(e.target.value)} className="w-full border border-slate-300 p-3 rounded-lg outline-none focus:border-[#A6192E]" placeholder="Ex: TI" /></div>
                 <div className="col-span-1"><label className="block text-sm font-bold text-[#A6192E] mb-2">Departamento</label><input value={departamento} onChange={e => setDepartamento(e.target.value)} className="w-full border border-slate-300 p-3 rounded-lg outline-none focus:border-[#A6192E]" placeholder="Ex: Suporte" /></div>
              </div>
              <div className="pt-4 flex justify-center"><button type="submit" className="px-10 py-3 bg-[#900020] text-white font-bold rounded-full hover:bg-[#700018] shadow-md">{editingId ? 'Salvar' : 'Cadastrar'}</button></div>
            </form>
          </div>
        </div>
      )}
      {showEmpresaModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[55] p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
             <div className="flex justify-between items-center p-6 border-b border-slate-100"><h2 className="text-xl font-bold text-[#A6192E]">Nova Unidade de Negócio</h2><button onClick={() => setShowEmpresaModal(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button></div>
            <form onSubmit={handleSalvarEmpresa} className="p-6 space-y-4">
                <div><label className="block text-sm font-bold text-[#A6192E] mb-2">Nome da Unidade (Razão Social)</label><input required value={novaEmpresaNome} onChange={e => setNovaEmpresaNome(e.target.value)} className="w-full border border-slate-300 p-3 rounded-lg outline-none focus:border-[#A6192E]" placeholder="Ex: Holding, Filial Norte..." /></div>
                <div><label className="block text-sm font-bold text-[#A6192E] mb-2">CNPJ</label><input required value={novaEmpresaCNPJ} onChange={e => setNovaEmpresaCNPJ(e.target.value)} className="w-full border border-slate-300 p-3 rounded-lg outline-none focus:border-[#A6192E]" placeholder="00.000.000/0000-00" /></div>
                <button type="submit" className="w-full py-3 bg-[#A6192E] text-white font-bold rounded-lg hover:bg-[#8a1425]">Criar Unidade</button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL DE MENSAGEM PADRÃO ISG (Sucesso/Erro) --- */}
      {msgModal.show && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] animate-fade-in">
          <div className="bg-white p-8 rounded-2xl w-full max-w-sm shadow-2xl text-center scale-in-center font-sans">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto ${msgModal.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              {msgModal.type === 'success' ? <CheckCircle size={32} /> : <AlertCircle size={32} />}
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">{msgModal.title}</h3>
            <p className="text-slate-600 mb-6 leading-relaxed">{msgModal.message}</p>
            <button onClick={closeMessage} className="w-full py-3 bg-[#900020] text-white font-bold rounded-full hover:bg-[#700018] transition-colors shadow-md">OK, entendi</button>
          </div>
        </div>
      )}

      {/* --- MODAL DE CONFIRMAÇÃO PADRÃO ISG (Substitui a imagem 2) --- */}
      {confirmModal.show && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] animate-fade-in font-sans">
          <div className="bg-white p-8 rounded-2xl w-full max-w-sm shadow-2xl text-center scale-in-center border-t-4 border-amber-500">
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-4 mx-auto">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Excluir Colaborador?</h3>
            <p className="text-slate-600 mb-6 leading-relaxed">Tem certeza que deseja remover este registro do sistema?</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmModal({ show: false, id: null })} className="flex-1 py-3 border border-slate-300 text-slate-700 font-bold rounded-full hover:bg-slate-50 transition-colors">Cancelar</button>
              <button onClick={confirmarExclusao} className="flex-1 py-3 bg-red-600 text-white font-bold rounded-full hover:bg-red-700 shadow-md transition-colors">Sim, Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
