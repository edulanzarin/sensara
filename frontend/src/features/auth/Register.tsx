import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../core/api/axios';
import { useAuth } from '../../core/context/AuthContext';
import { Mail, Lock } from 'lucide-react';

export function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/users', { email, password, role: 'CLIENT' });

      const loginResponse = await api.post('/auth/login', { email, password });
      const token = loginResponse.data.token;

      // Seta no localStorage ANTES de qualquer coisa
      localStorage.setItem('sensara_token', token);
      
      login(token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao criar conta. E-mail já em uso?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="w-full max-w-md bg-zinc-950 p-8 rounded-xl border border-zinc-800 shadow-2xl">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white">Criar Conta</h2>
          <p className="text-sm text-zinc-400 mt-2">Acesse os melhores perfis da sua região.</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
            <input
              type="email"
              placeholder="E-mail"
              className="w-full bg-zinc-900 border border-zinc-800 text-white p-3 pl-10 rounded focus:outline-none focus:border-red-600 transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
            <input
              type="password"
              placeholder="Senha (mínimo 6 caracteres)"
              className="w-full bg-zinc-900 border border-zinc-800 text-white p-3 pl-10 rounded focus:outline-none focus:border-red-600 transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded mt-2 transition-colors disabled:opacity-50"
          >
            {loading ? 'Processando...' : 'Cadastrar'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-zinc-400">
          Já tem conta? <Link to="/login" className="text-white hover:text-red-500 font-medium">Faça login</Link>
        </div>
      </div>
    </div>
  );
}