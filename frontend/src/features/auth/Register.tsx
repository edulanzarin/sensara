import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../core/api/axios';
import { useAuth } from '../../core/context/AuthContext';
import { Mail, Lock } from 'lucide-react';
import { Input, Button, Alert, Card } from '../../core/ui';

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
    delete api.defaults.headers.common['Authorization'];

    try {
      await api.post('/users', { email, password, role: 'CLIENT' });
      const loginResponse = await api.post('/auth/login', { email, password });
      const token = loginResponse.data.token;
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
      <p className="text-3xl font-black tracking-tighter text-red-600 mb-6">SENSARA</p>
      <Card className="w-full max-w-md p-8">
        <h2 className="text-xl font-bold text-gray-900 text-center mb-1">Criar Conta</h2>
        <p className="text-sm text-gray-400 text-center mb-6">Acesse os melhores perfis da sua região.</p>

        {error && <div className="mb-4"><Alert message={error} /></div>}

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
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
            placeholder="Mínimo 6 caracteres"
            icon={<Lock size={16} />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />

          <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full mt-1">
            Cadastrar
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-gray-400">
          Já tem conta?{' '}
          <Link to="/login" className="text-gray-900 hover:text-red-600 font-semibold">
            Faça login
          </Link>
        </p>
      </Card>
    </div>
  );
}