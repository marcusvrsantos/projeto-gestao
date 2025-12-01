import { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Trash2, X, CheckCircle, AlertCircle } from 'lucide-react';

// Interfaces (Tipos)
interface Colaborador {
  id: string;
  nome: string;
  email: string;
  cargo: string;
  setor?: string;
  cpf?: string;
}

interface Empresa {
  id: string;
  razaoSocial: string;
}

// Interface para controlar nosso novo modal de mensagens
interface MessageModalData {
  show: boolean;
  title: string;
  message: string;
  type: 'success' | 'error';
}

export function Colaboradores() {
  // --- ESTADOS ---
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFormModal, setShowFormModal] = useState(false);

  // Estado para controlar o NOVO Modal de Mensagem (Sucesso/Erro)
  const [msgModal, setMsgModal] = useState<MessageModalData>({ 
    show: false, title: '', message: '', type: 'success' 
  });

  // Form states
  const [nome, setNome] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [empresaId, setEmpresaId] = useState('');
  const [cargo, setCargo] = useState('');
  const [setor, setSetor] = useState('');
  const [departamento, setDepartamento] = useState(''); // Adicionado estado para departamento

  useEffect(() => {
    carregarDados();
  }, []);

  // --- FUNÇÕES AUXILIARES ---

  // Função para mostrar a mensagem bonita
  function showMessage(title: string, message: string, type: 'success' | 'error') {
    setMsgModal({ show: true, title, message, type });
  }

  // Função para fechar a mensagem
  function closeMessage() {
    setMsgModal({ ...msgModal, show: false });
  }

  async function carregarDados() {
    try {
      const [resColab, resEmpresa] = await Promise.all([
        api.get('/colaboradores'),
        api.get('/empresas')
      ]);
      setColaboradores(resColab.data);
      setEmpresas(resEmpresa.data);
      
      if (resEmpresa.data.length > 0) {
        setEmpresaId(resEmpresa.data[0].id);
      }
    } catch (error) {
      console.error("Erro ao carregar", error);
      showMessage('Erro', 'Não foi possível carregar os dados.', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post('/colaboradores', {
        nome, email, cargo, empresaId, cpf, setor,
        // departamento, // Nota: Ainda não salvamos departamento no banco, é só visual por enquanto
        dataNascimento: dataNascimento || null // Envia null se estiver vazio
      });
      
      // Fecha o formulário
      setShowFormModal(false);
      
      // Mostra a mensagem de sucesso BONITA!
      showMessage('Sucesso!', 'Colaborador cadastrado com sucesso.', 'success');

      // Limpa o formulário
      setNome(''); setEmail(''); setCargo(''); setCpf(''); setSetor(''); setDataNascimento(''); setDepartamento('');
      carregarDados();
    } catch (error: any) {
      // Mostra mensagem de erro BONITA!
      const erroMsg = error.response?.data?.error || 'Erro ao salvar';
      showMessage('Atenção', erroMsg, 'error');
    }
  }

  async function handleDeletar(id: string) {
    // Para deletar, o 'confirm' nativo ainda é prático, mas podemos mudar depois
    if (!confirm('Tem certeza que deseja excluir este colaborador?')) return;
    try {
      await api.delete(`/colaboradores/${id}`);
      setColaboradores(colaboradores.filter(c => c.id !== id));
      showMessage('Excluído', 'Colaborador removido com sucesso.', 'success');
    } catch (error) {
      showMessage('Erro', 'Não foi possível excluir o colaborador.', 'error');
    }
  }

  // --- RENDERIZAÇÃO (O que aparece na tela) ---
  return (
    <div className="space-y-6 font-sans">
      {/* Header da Página */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Colaboradores</h1>
          <p className="text-slate-500">Gerencie a equipe e seus acessos.</p>
        </div>
        <button 
          onClick={() => setShowFormModal(true)}
          className="bg-[#A6192E] hover:bg-[#8a1425] text-white px-4 py-2 rounded flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus size={20} />
          Novo Colaborador
        </button>
      </div>

      {/* Tabela de Listagem */}
      <div className="bg-white rounded-lg shadow border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Nome</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Setor / Cargo</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Email / CPF</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {colaboradores.map(colab => (
              <tr key={colab.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <span className="font-medium text-slate-700 block">{colab.nome}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-slate-700 font-medium">{colab.setor || '-'}</div>
                  <div className="text-slate-500 text-xs">{colab.cargo}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-slate-600 text-sm">{colab.email}</div>
                  <div className="text-slate-400 text-xs">{colab.cpf || 'Sem CPF'}</div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleDeletar(colab.id)} className="text-red-400 hover:text-red-600 p-2 transition-colors rounded-full hover:bg-red-50">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {colaboradores.length === 0 && !loading && (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400">Nenhum colaborador encontrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ==================================================================================
          MODAL 1: FORMULÁRIO DE CADASTRO (O que você já tinha aprovado)
      ================================================================================== */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden scale-in-center">
            
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-[#A6192E]">Cadastro de Colaboradores</h2>
              <button onClick={() => setShowFormModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors rounded-full p-1 hover:bg-slate-100">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSalvar} className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-bold text-[#A6192E] mb-2">Nome Completo</label>
                <input required value={nome} onChange={e => setNome(e.target.value)} className="w-full border border-slate-300 p-3 rounded-lg text-slate-700 outline-none focus:border-[#A6192E] focus:ring-1 focus:ring-[#A6192E] transition-all" placeholder="Digite o nome" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-[#A6192E] mb-2">Data de Nascimento</label>
                  <input type="date" value={dataNascimento} onChange={e => setDataNascimento(e.target.value)} className="w-full border border-slate-300 p-3 rounded-lg text-slate-700 outline-none focus:border-[#A6192E] focus:ring-1 focus:ring-[#A6192E] transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#A6192E] mb-2">CPF (opcional)</label>
                  <input value={cpf} onChange={e => setCpf(e.target.value)} className="w-full border border-slate-300 p-3 rounded-lg text-slate-700 outline-none focus:border-[#A6192E] focus:ring-1 focus:ring-[#A6192E] transition-all" placeholder="000.000.000-00" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#A6192E] mb-2">E-mail</label>
                <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border border-slate-300 p-3 rounded-lg text-slate-700 outline-none focus:border-[#A6192E] focus:ring-1 focus:ring-[#A6192E] transition-all" placeholder="Digite o e-mail" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-[#A6192E] mb-2">Empresa/Instituição</label>
                  <select value={empresaId} onChange={e => setEmpresaId(e.target.value)} className="w-full border border-slate-300 p-3 rounded-lg text-slate-700 outline-none focus:border-[#A6192E] focus:ring-1 focus:ring-[#A6192E] transition-all bg-white">
                    {empresas.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.razaoSocial}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#A6192E] mb-2">Cargo</label>
                  <input required value={cargo} onChange={e => setCargo(e.target.value)} className="w-full border border-slate-300 p-3 rounded-lg text-slate-700 outline-none focus:border-[#A6192E] focus:ring-1 focus:ring-[#A6192E] transition-all" placeholder="Digite seu cargo" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                  <label className="block text-sm font-bold text-[#A6192E] mb-2">Setor</label>
                  <input value={setor} onChange={e => setSetor(e.target.value)} className="w-full border border-slate-300 p-3 rounded-lg text-slate-700 outline-none focus:border-[#A6192E] focus:ring-1 focus:ring-[#A6192E] transition-all" placeholder="Setor" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#A6192E] mb-2">Departamento</label>
                   <select value={departamento} onChange={e => setDepartamento(e.target.value)} className="w-full border border-slate-300 p-3 rounded-lg text-slate-700 outline-none focus:border-[#A6192E] focus:ring-1 focus:ring-[#A6192E] transition-all bg-white">
                      <option value="">Selecione (Opcional)</option>
                      <option value="Administrativo">Administrativo</option>
                      <option>Financeiro</option>
                      <option>Operacional</option>
                  </select>
                </div>
              </div>
              
              <div className="pt-6 flex justify-center">
                <button type="submit" className="px-10 py-3 bg-[#900020] text-white font-bold rounded-full hover:bg-[#700018] shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1 active:translate-y-0">
                  Cadastrar
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ==================================================================================
          MODAL 2: MENSAGEM DE SUCESSO/ERRO (O NOVO!)
          Este é o modal que substitui o "alert()" chato.
      ================================================================================== */}
      {msgModal.show && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-fade-in">
          <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl scale-in-center text-center flex flex-col items-center font-sans">
            
            {/* Ícone (Verde para sucesso, Vermelho para erro) */}
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
              msgModal.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
            }`}>
              {msgModal.type === 'success' ? <CheckCircle size={32} /> : <AlertCircle size={32} />}
            </div>
            
            {/* Título e Mensagem */}
            <h3 className="text-xl font-bold text-slate-800 mb-2">{msgModal.title}</h3>
            <p className="text-slate-600 mb-8">{msgModal.message}</p>
            
            {/* Botão de Fechar (No padrão da empresa) */}
            <button 
              onClick={closeMessage}
              className="w-full py-3 bg-[#900020] text-white font-bold rounded-full hover:bg-[#700018] transition-colors shadow-md"
            >
              OK, entendi
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
