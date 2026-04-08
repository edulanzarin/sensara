import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../core/api/axios';
import { useAuth } from '../../core/context/AuthContext';
import { type Companion } from '../../core/types/companion';
import { Star, Camera, Zap } from 'lucide-react';
import { BecomeCompanionForm } from './components/BecomeCompanionForm';
import { VerificationSection } from './components/VerificationSection';

interface ActivePlan {
  name: string;
  endsAt: string;
}

export function Dashboard() {
  const { token, isCompanion, setIsCompanion } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Companion | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [activePlan, setActivePlan] = useState<ActivePlan | null>(null);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/companions/me');
      setProfile(response.data);
      setIsCompanion(true);

      // Busca plano ativo
      try {
        const userRes = await api.get('/users/me');
        const subRes = await api.get(`/companions/${userRes.data.id}/subscription`);
        setActivePlan(subRes.data);
      } catch {
        setActivePlan(null);
      }

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
        onSuccess={() => { setShowForm(false); setLoading(true); fetchProfile(); }}
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
    <div className="px-4 py-8 max-w-5xl mx-auto space-y-6 animate-in fade-in">
      <div>
        <h1 className="text-2xl font-black text-white">Meu Painel</h1>
        <p className="text-zinc-400">Bem-vinda, {profile?.nickname}.</p>
      </div>

      {activePlan ? (
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="text-zinc-400 text-xs uppercase tracking-wide mb-1">Plano ativo</p>
            <p className="text-white font-bold">{activePlan.name}</p>
          </div>
          <button
            onClick={() => navigate('/plans')}
            className="text-xs text-red-500 hover:text-red-400 transition-colors"
          >
            Trocar plano
          </button>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-red-950 to-zinc-950 border border-red-800 rounded-xl p-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-white font-bold mb-1">Seu perfil ainda não está visível</p>
            <p className="text-zinc-400 text-sm">Assine um plano para aparecer nas buscas.</p>
          </div>
          <button
            onClick={() => navigate('/plans')}
            className="flex-shrink-0 flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm"
          >
            <Zap size={16} /> Ver planos
          </button>
        </div>
      )}

      <VerificationSection />

      <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
        Estatísticas da Acompanhante aqui...
      </div>
    </div>
  );
}