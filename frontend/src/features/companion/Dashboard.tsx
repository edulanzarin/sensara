import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../core/api/axios';
import { useAuth } from '../../core/context/AuthContext';
import { type Companion } from '../../core/types/companion';
import { Star, Camera, Zap, BarChart3 } from 'lucide-react';
import { BecomeCompanionForm } from './components/BecomeCompanionForm';
import { VerificationSection } from './components/VerificationSection';
import { Card, Button } from '../../core/ui';

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
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-red-600" />
      </div>
    );
  }

  if (showForm) {
    return (
      <BecomeCompanionForm
        onCancel={() => setShowForm(false)}
        onSuccess={() => { setShowForm(false); setLoading(true); fetchProfile(); }}
      />
    );
  }

  // --- TELA DE CLIENTE ---
  if (!isCompanion) {
    return (
      <div className="px-4 py-8 max-w-2xl mx-auto space-y-6 animate-in fade-in">
        <Card className="p-8 text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Camera className="text-red-500" size={30} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Quer anunciar no Sensara?</h2>
          <p className="text-gray-400 text-sm mb-8 max-w-sm mx-auto">
            Crie seu perfil agora. Preencha suas informações básicas e envie pelo menos uma foto de perfil.
          </p>
          <Button variant="primary" size="lg" onClick={() => setShowForm(true)} className="w-full">
            Tornar-se Acompanhante
          </Button>
        </Card>

        <div>
          <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Star className="text-yellow-500" size={18} /> Meus Favoritos
          </h3>
          <Card className="p-6 text-center">
            <p className="text-gray-400 text-sm">Você ainda não favoritou nenhum perfil.</p>
            <button
              onClick={() => navigate('/')}
              className="text-red-500 hover:text-red-600 text-sm font-medium mt-2 transition-colors"
            >
              Explorar perfis
            </button>
          </Card>
        </div>
      </div>
    );
  }

  // --- TELA DE ACOMPANHANTE ---
  return (
    <div className="px-4 py-8 max-w-3xl mx-auto space-y-4 animate-in fade-in">

      {/* Header */}
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-gray-900">Meu Painel</h1>
        <p className="text-gray-400 text-sm">Bem-vinda, {profile?.nickname}.</p>
      </div>

      {/* Banner de plano */}
      {activePlan ? (
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-0.5">Plano ativo</p>
            <p className="text-gray-900 font-bold">{activePlan.name}</p>
          </div>
          <button
            onClick={() => navigate('/plans')}
            className="text-xs text-red-500 hover:text-red-600 font-medium transition-colors"
          >
            Trocar plano
          </button>
        </Card>
      ) : (
        <div className="bg-red-600 rounded-2xl p-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-white font-bold mb-0.5">Perfil não está visível</p>
            <p className="text-red-200 text-sm">Assine um plano para aparecer nas buscas.</p>
          </div>
          <button
            onClick={() => navigate('/plans')}
            className="flex-shrink-0 flex items-center gap-2 bg-white hover:bg-red-50 text-red-600 font-bold py-2 px-4 rounded-xl transition-colors text-sm"
          >
            <Zap size={15} /> Ver planos
          </button>
        </div>
      )}

      {/* Verificação */}
      <VerificationSection />

      {/* Estatísticas placeholder */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={18} className="text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-900">Estatísticas</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Visualizações', value: profile?.profileViews ?? 0 },
            { label: 'Favoritos', value: '—' },
            { label: 'Cliques', value: '—' },
          ].map(stat => (
            <div key={stat.label} className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </Card>

    </div>
  );
}