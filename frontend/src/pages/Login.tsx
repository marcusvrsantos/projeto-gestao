import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import logoIsg from '../assets/isg-icon-color.png'; // <--- Importe a imagem aqui

export function Login() {
  const { signIn, loading } = useAuth(); // Usando o loading do contexto que criamos
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    
    try {
      await signIn(email, senha);
      navigate('/dashboard'); // Ou para onde você quiser redirecionar
    } catch (err) {
      setError('Credenciais inválidas. Verifique e tente novamente.');
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        
        {/* --- ÁREA DO CABEÇALHO (LOGO + TÍTULO) --- */}
        <div className="flex flex-col items-center mb-8 text-center">
          {/* Logo Nova */}
          <img 
            src={logoIsg} 
            alt="Logo ISG" 
            className="w-20 h-20 mb-4 object-contain" 
          />
          
          {/* Nome da Empresa */}
          <h1 className="text-2xl font-bold text-slate-700 mb-4">
            ISG Participações S.A.
          </h1>

          {/* Subtítulo / Instrução Atualizado */}
          <p className="text-slate-500 text-sm">
            Insira suas credenciais da <br/>
            ISG Participações para acessar o <strong className="text-slate-800">Sistema de Gestão de Eventos</strong>.
          </p>
        </div>

        {/* --- FORMULÁRIO --- */}
        <form onSubmit={handleLogin} className="space-y-4">
          
          {/* Input Usuário */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Usuário</label>
            <input 
              type="text" 
              placeholder="E-mail ou nome de usuário"
              className="w-full border border-slate-300 rounded p-3 text-slate-700 focus:outline-none focus:border-red-800 focus:ring-1 focus:ring-red-800 transition"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          {/* Input Senha */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Senha</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Digite sua senha"
                className="w-full border border-slate-300 rounded p-3 text-slate-700 focus:outline-none focus:border-red-800 focus:ring-1 focus:ring-red-800 transition pr-10"
                value={senha}
                onChange={e => setSenha(e.target.value)}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error && <span className="text-red-600 text-sm block text-center">{error}</span>}

          {/* Botão Entrar */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#4A4A4A] hover:bg-[#333] text-white font-bold py-3 rounded transition-colors disabled:opacity-70 mt-4"
          >
            {loading ? 'Acessando...' : 'Entrar'}
          </button>

        </form>
      </div>
    </div>
  );
}