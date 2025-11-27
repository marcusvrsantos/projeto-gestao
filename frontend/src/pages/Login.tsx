import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom'; // <--- Import novo
import { AuthContext } from '../contexts/AuthContext';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export function Login() {
  const { signIn } = useContext(AuthContext);
  const navigate = useNavigate(); // <--- Hook de navegação
  
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await signIn(email, senha);
      // Se chegou aqui, deu sucesso!
      navigate('/dashboard'); // <--- A MÁGICA: Manda para o Dashboard
    } catch (err: any) {
      console.error(err);
      const mensagemReal = err.response?.data?.error || "Falha na conexão ou credenciais inválidas";
      setError(mensagemReal);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa] font-sans">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-[400px]">
        
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center mb-4">
            <span className="text-4xl font-bold text-gray-800 tracking-tighter mr-2">ISG</span>
            <svg className="w-8 h-8 text-[#A6192E]" viewBox="0 0 24 24" fill="currentColor">
               <path d="M2 2h20v20H2z" fill="none"/>
               <path d="M3 13h8V3H3v10zm2-8h4v6H5V5zm10 6h8V3h-8v8zm2-6h4v4h-4V5zM3 21h8v-6H3v6zm2-4h4v2H5v-2zm10 4h8v-8h-8v8zm2-6h4v4h-4v-4z"/>
            </svg>
          </div>
          <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Participações S.A.</span>
          <h2 className="text-center text-gray-600 text-sm px-4 leading-relaxed">
            Insira suas credenciais da empresa <br/>
            ISG Participações para acessar o <strong className="font-bold text-gray-800">TOTVS Identity.</strong>
          </h2>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Usuário</label>
            <input 
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="shadow-sm appearance-none border border-gray-300 rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              placeholder="E-mail ou nome de usuário"
              required
            />
          </div>

          <div className="relative">
            <label className="block text-gray-700 text-sm font-bold mb-2">Senha</label>
            <input 
              type={mostrarSenha ? "text" : "password"}
              value={senha}
              onChange={e => setSenha(e.target.value)}
              className="shadow-sm appearance-none border border-gray-300 rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors pr-10"
              placeholder="Digite sua senha"
              required
            />
            <button
              type="button"
              onClick={() => setMostrarSenha(!mostrarSenha)}
              className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600"
            >
              {mostrarSenha ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {error && <p className="text-red-500 text-xs text-center bg-red-50 p-2 rounded border border-red-100 font-mono">{error}</p>}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#545454] hover:bg-[#3F3F3F] text-white font-bold py-3 px-4 rounded transition duration-200 flex justify-center items-center"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
