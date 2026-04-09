import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../core/api/axios';
import { useAuth } from '../../core/context/AuthContext';
import { Lock, Mail } from 'lucide-react';
import { Input, Button, Alert, Card } from '../../core/ui';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const token = response.data.token;
      localStorage.setItem('sensara_token', token);
      login(token);
      navigate('/');
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('E-mail ou senha incorretos.');
      } else {
        setError('Erro ao conectar com o servidor.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <p className="text-3xl font-black tracking-tighter text-red-600 mb-6">SENSARA</p>
      <Card className="w-full max-w-md p-8">
        <h2 className="text-xl font-bold text-gray-900 text-center mb-1">Acesse sua conta</h2>
        <p className="text-sm text-gray-400 text-center mb-6">Gerencie seu perfil ou favoritos.</p>

        {error && <div className="mb-4"><Alert message={error} /></div>}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <Input
            label="E-mail"
            type="email"
            placeholder="seu@email.com"
            icon={<Mail size={16} />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Senha"
            type="password"
            placeholder="••••••••"
            icon={<Lock size={16} />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="flex justify-end -mt-2">
            <a href="#" className="text-xs text-red-500 hover:text-red-600 font-medium">
              Esqueceu a senha?
            </a>
          </div>

          <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
            Entrar
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-gray-400">
          Ainda não tem conta?{' '}
          <a href="/register" className="text-gray-900 hover:text-red-600 font-semibold">
            Cadastre-se
          </a>
        </p>
      </Card>
    </div>
  );
}