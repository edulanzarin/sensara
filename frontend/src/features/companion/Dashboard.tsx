import { useEffect, useState } from 'react';
import { api } from '../../core/api/axios';
import { useAuth } from '../../core/context/AuthContext';
import { type Companion } from '../../core/types/companion';
import { Star, Camera } from 'lucide-react';
import { BecomeCompanionForm } from './components/BecomeCompanionForm';

export function Dashboard() {
  const { token, isCompanion, setIsCompanion } = useAuth();
  const [profile, setProfile] = useState<Companion | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/companions/me');
      setProfile(response.data);
      setIsCompanion(true);
    } catch {
      setIsCompanion(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchProfile();
  }, [token]);

  if (loading) {
    return <div className="p-8 text-center text-zinc-500">Carregando painel...</div>;
  }

  if (showForm) {
    return (
      <BecomeCompanionForm
        onCancel={() => setShowForm(false)}
        onSuccess={() => {
          setShowForm(false);
          setLoading(true);
          fetchProfile();
        }}
      />
    );
  }

  if (!isCompanion) {
    return (
      <div className="px-4 py-8 max-w-3xl mx-auto animate-in fade-in">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-600/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Camera className="text-red-500" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Quer anunciar no Sensara?</h2>
          <p className="text-zinc-400 mb-8 max-w-lg mx-auto">
            Crie seu perfil agora. É necessário preencher suas informações básicas e enviar pelo menos uma foto de perfil para análise.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
          >
            Tornar-se Acompanhante
          </button>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Star className="text-yellow-500" size={20} /> Meus Favoritos
          </h3>
          <p className="text-zinc-500 text-sm">Você ainda não favoritou nenhum perfil.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-8 max-w-5xl mx-auto space-y-8 animate-in fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Meu Painel</h1>
          <p className="text-zinc-400">Bem-vinda, {profile?.nickname}.</p>
        </div>
      </div>
      <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
        Estatísticas da Acompanhante aqui...
      </div>
    </div>
  );
}