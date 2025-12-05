import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft, UserPlus, Trash2, Mail, CheckCircle, Clock, XCircle, Users, Download, Filter } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Evento { id: string; nome: string; data: string; local: string; status: string; }
interface Convidado { id: string; nomeConvidado: string; emailConvidado: string; status: string; }
interface PessoaDisponivel { id: string; nome: string; email: string; tipo: 'Colaborador' | 'Externo'; empresaNome?: string; }
interface Empresa { id: string; razaoSocial: string; }

export function DetalhesEvento() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [evento, setEvento] = useState<Evento | null>(null);
  const [convites, setConvites] = useState<Convidado[]>([]);
  const [pessoasDisponiveis, setPessoasDisponiveis] = useState<PessoaDisponivel[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [selecionados, setSelecionados] = useState<string[]>([]);
  const [showModalAdd, setShowModalAdd] = useState(false);
  
  // Filtro no Modal
  const [filtroEmpresaModal, setFiltroEmpresaModal] = useState('');

  useEffect(() => {
    carregarEvento();
    carregarConvites();
  }, [id]);

  async function carregarEvento() {
    const res = await api.get('/eventos');
    const evt = res.data.find((e: any) => e.id === id);
    setEvento(evt);
  }

  async function carregarConvites() {
    const res = await api.get(`/convites/${id}`);
    setConvites(res.data);
  }

  async function carregarPessoasDisponiveis() {
    const [resColab, resExt, resEmp] = await Promise.all([
      api.get('/colaboradores'),
      api.get('/convidados-externos'),
      api.get('/empresas')
    ]);

    setEmpresas(resEmp.data);

    const lista: PessoaDisponivel[] = [];
    // Mapeia colaboradores e adiciona o nome da empresa
    resColab.data.forEach((c: any) => {
        const empNome = resEmp.data.find((e: any) => e.id === c.empresaId)?.razaoSocial || 'N/A';
        lista.push({ id: c.id, nome: c.nome, email: c.email, tipo: 'Colaborador', empresaNome: empNome });
    });
    
    // Mapeia externos
    resExt.data.forEach((c: any) => lista.push({ id: c.id, nome: c.nome, email: c.email, tipo: 'Externo', empresaNome: c.empresa || 'Externo' }));
    
    setPessoasDisponiveis(lista);
    setShowModalAdd(true);
  }

  function toggleSelecao(pessoa: PessoaDisponivel) {
    if (selecionados.includes(pessoa.email)) {
      setSelecionados(selecionados.filter(email => email !== pessoa.email));
    } else {
      setSelecionados([...selecionados, pessoa.email]);
    }
  }

  // Seleciona todos que estão visíveis na lista filtrada
  function selecionarTodosFiltrados() {
    const visiveis = pessoasFiltradas.map(p => p.email);
    // Adiciona os visíveis que ainda não estavam selecionados
    const novos = visiveis.filter(email => !selecionados.includes(email));
    setSelecionados([...selecionados, ...novos]);
  }

  async function confirmarAdicao() {
    const pessoasParaAdicionar = pessoasDisponiveis
      .filter(p => selecionados.includes(p.email))
      .map(p => ({ nome: p.nome, email: p.email }));

    if (pessoasParaAdicionar.length === 0) return;

    try {
      await api.post('/convites/adicionar', {
        eventoId: id,
        listaPessoas: pessoasParaAdicionar
      });
      alert('Pessoas adicionadas à lista!');
      setShowModalAdd(false);
      setSelecionados([]);
      carregarConvites();
    } catch (error) {
      alert('Erro ao adicionar convidados.');
    }
  }

  async function removerConvidado(conviteId: string) {
    if(!confirm('Remover da lista?')) return;
    await api.delete(`/convites/${conviteId}`);
    carregarConvites();
  }

  async function dispararEmails() {
    if(!confirm('Deseja enviar e-mail para todos os PENDENTES?')) return;
    try {
      const res = await api.post('/convites/disparar', { eventoId: id });
      alert(res.data.message);
    } catch (error) {
      alert('Erro ao disparar e-mails');
    }
  }
  
  const getBase64ImageFromURL = (url: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.setAttribute('crossOrigin', 'anonymous');
      img.src = url;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => resolve('');
    });
  };

  async function gerarPDF() {
    if (!evento) return;
    const doc = new jsPDF();
    const logoBase64 = await getBase64ImageFromURL('/logo-isg.png');
    
    doc.setFillColor(166, 25, 46);
    doc.rect(0, 0, 210, 28, 'F');
    if (logoBase64) doc.addImage(logoBase64, 'PNG', 10, 4, 35, 20);
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Lista de Presença Oficial', 140, 18);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(evento.nome, 14, 40);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Data: ${new Date(evento.data).toLocaleString()}`, 14, 48);
    doc.text(`Local: ${evento.local || 'Não informado'}`, 14, 54);
    doc.text(`Total de Convidados: ${convites.length}`, 14, 60);

    const dadosTabela = convites.map(c => [c.nomeConvidado, c.emailConvidado, c.status, '___/___  __________']);
    autoTable(doc, {
      startY: 68,
      head: [['Nome do Convidado', 'E-mail', 'Status', 'Assinatura / Check-in']],
      body: dadosTabela,
      headStyles: { fillColor: [166, 25, 46], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      styles: { fontSize: 10 },
    });
    doc.save(`Lista_Presenca_${evento.nome.replace(/ /g, '_')}.pdf`);
  }

  // Lógica de Filtro do Modal
  const pessoasFiltradas = pessoasDisponiveis.filter(p => {
    if (filtroEmpresaModal === '') return true; // Mostra tudo se filtro vazio
    if (filtroEmpresaModal === 'Externos') return p.tipo === 'Externo';
    return p.empresaNome === filtroEmpresaModal;
  });

  if (!evento) return <div>Carregando...</div>;

  return (
    <div className="space-y-6 font-sans">
      <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
        <button onClick={() => navigate('/eventos')} className="text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{evento.nome}</h1>
          <p className="text-slate-500 text-sm flex items-center gap-2">
            {new Date(evento.data).toLocaleString()} • {evento.local}
          </p>
        </div>
        <div className="ml-auto flex gap-2">
           <button onClick={gerarPDF} className="bg-slate-700 hover:bg-slate-800 text-white px-4 py-2 rounded flex items-center gap-2 shadow-sm">
            <Download size={18} /> Baixar Lista
          </button>
           <button onClick={dispararEmails} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2 shadow-sm">
            <Mail size={18} /> Enviar Convites
          </button>
          <button onClick={carregarPessoasDisponiveis} className="bg-[#A6192E] hover:bg-[#8a1425] text-white px-4 py-2 rounded flex items-center gap-2 shadow-sm">
            <UserPlus size={18} /> Adicionar Pessoas
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h3 className="font-bold text-slate-700 flex items-center gap-2">
            <Users size={20}/> Lista de Presença ({convites.length})
          </h3>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 uppercase border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 font-semibold">Nome</th>
              <th className="px-6 py-3 font-semibold">E-mail</th>
              <th className="px-6 py-3 font-semibold">Status</th>
              <th className="px-6 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {convites.map(c => (
              <tr key={c.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-700">{c.nomeConvidado}</td>
                <td className="px-6 py-4 text-slate-500">{c.emailConvidado}</td>
                <td className="px-6 py-4">
                  {c.status === 'CONFIRMADO' && <span className="text-green-600 flex items-center gap-1 font-bold"><CheckCircle size={14}/> Confirmado</span>}
                  {c.status === 'RECUSADO' && <span className="text-red-600 flex items-center gap-1 font-bold"><XCircle size={14}/> Recusado</span>}
                  {c.status === 'PENDENTE' && <span className="text-amber-600 flex items-center gap-1 font-bold"><Clock size={14}/> Pendente</span>}
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => removerConvidado(c.id)} className="text-red-400 hover:text-red-600">
                    <Trash2 size={16}/>
                  </button>
                </td>
              </tr>
            ))}
            {convites.length === 0 && (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400">Ninguém convidado ainda.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModalAdd && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg text-[#A6192E]">Selecionar Convidados</h3>
              <button onClick={() => setShowModalAdd(false)} className="text-slate-400 hover:text-slate-600">Fechar</button>
            </div>
            
            {/* BARRA DE FILTRO E SELEÇÃO EM MASSA */}
            <div className="p-4 bg-white border-b border-slate-100 flex gap-4 items-center">
                <div className="flex items-center gap-2 flex-1">
                    <Filter size={18} className="text-slate-400" />
                    <select 
                        value={filtroEmpresaModal} 
                        onChange={e => setFiltroEmpresaModal(e.target.value)}
                        className="border border-slate-300 rounded p-2 text-sm w-full outline-none focus:border-[#A6192E]"
                    >
                        <option value="">Todas as Unidades</option>
                        {empresas.map(emp => (
                            <option key={emp.id} value={emp.razaoSocial}>{emp.razaoSocial}</option>
                        ))}
                        <option value="Externos">Convidados Externos</option>
                    </select>
                </div>
                <button 
                    onClick={selecionarTodosFiltrados}
                    className="text-sm font-bold text-[#A6192E] hover:bg-red-50 px-3 py-2 rounded transition-colors"
                >
                    Selecionar Todos da Lista
                </button>
            </div>
            
            <div className="p-0 overflow-y-auto flex-1">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-100 text-slate-600 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 w-10"></th>
                    <th className="px-6 py-3">Nome</th>
                    <th className="px-6 py-3">Unidade / Tipo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pessoasFiltradas.map(p => (
                    <tr key={p.email} className={selecionados.includes(p.email) ? "bg-red-50" : "hover:bg-slate-50"}>
                      <td className="px-6 py-3">
                        <input 
                          type="checkbox" 
                          checked={selecionados.includes(p.email)}
                          onChange={() => toggleSelecao(p)}
                          className="w-4 h-4 text-[#A6192E] rounded border-gray-300 focus:ring-[#A6192E]"
                        />
                      </td>
                      <td className="px-6 py-3 font-medium text-slate-700">{p.nome} <span className="text-slate-400 font-normal text-xs ml-2">{p.email}</span></td>
                      <td className="px-6 py-3">
                        <span className="text-xs font-bold text-slate-600">{p.empresaNome || p.tipo}</span>
                      </td>
                    </tr>
                  ))}
                  {pessoasFiltradas.length === 0 && (
                      <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-400">Ninguém encontrado neste filtro.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t bg-white flex justify-end gap-3">
              <span className="self-center text-sm text-slate-500 mr-auto">{selecionados.length} selecionados</span>
              <button onClick={() => setShowModalAdd(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded">Cancelar</button>
              <button onClick={confirmarAdicao} className="px-6 py-2 bg-[#A6192E] text-white font-bold rounded hover:bg-[#8a1425]">
                Adicionar Selecionados
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
