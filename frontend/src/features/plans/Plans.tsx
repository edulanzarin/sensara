import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../core/api/axios';
import { useAuth } from '../../core/context/AuthContext';
import { Check, Star, Zap, Crown } from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  price: number;
  durationDays: number;
  maxPhotos: number;
  maxVideos: number;
  canPostStories: boolean;
  hasTopSearchPriority: boolean;
}

const PLAN_ICONS: Record<string, React.ReactNode> = {
  'Básico':    <Star size={24} className="text-zinc-400" />,
  'Premium':   <Zap size={24} className="text-red-400" />,
  'Diamante':  <Crown size={24} className="text-yellow-400" />,
};

const PLAN_STYLES: Record<string, string> = {
  'Básico':   'border-zinc-700',
  'Premium':  'border-red-600',
  'Diamante': 'border-yellow-500',
};

const PLAN_BADGE: Record<string, string | null> = {
  'Básico':   null,
  'Premium':  'Mais popular',
  'Diamante': 'Melhor resultado',
};

export function Plans() {
  const navigate = useNavigate();
  const { isCompanion } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/plans')
      .then(res => setPlans(res.data))
      .catch(() => setError('Erro ao carregar planos.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSubscribe = async (planId: string) => {
    setProcessingId(planId);
    setError('');

    try {
      // 1. Busca o userId
      const userRes = await api.get('/users/me');
      const companionId = userRes.data.id;

      // 2. Cria o checkout (mock)
      const checkoutRes = await api.post(`/payments/checkout/${companionId}`, { planId });
      const { orderId, checkoutUrl } = checkoutRes.data;

      // 3. Aprova automaticamente o pagamento mock
      // Extrai o gatewayReference da checkoutUrl (ex: "...fake-url-MP-abc123" → "MP-abc123")
      const gatewayReference = checkoutUrl.split('fake-url-')[1];
      await api.post(`/payments/webhook/mock-approve/${gatewayReference}`);

      // 4. Sucesso — vai pro painel
      navigate('/dashboard');
      window.location.reload();

    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao processar pagamento.');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-red-600" />
      </div>
    );
  }

  return (
    <div className="px-4 py-8 max-w-2xl mx-auto animate-in fade-in">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-black text-white mb-2">Escolha seu Plano</h1>
        <p className="text-zinc-400 text-sm">
          Selecione o plano ideal para turbinar seu perfil e aparecer nas buscas.
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-6 text-sm text-center">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-4">
        {plans.map(plan => {
          const badge = PLAN_BADGE[plan.name];
          const borderClass = PLAN_STYLES[plan.name] ?? 'border-zinc-700';
          const isProcessing = processingId === plan.id;

          return (
            <div
              key={plan.id}
              className={`bg-zinc-950 border-2 ${borderClass} rounded-xl p-5 relative`}
            >
              {badge && (
                <div className={`absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-full ${
                  plan.name === 'Diamante'
                    ? 'bg-yellow-500 text-black'
                    : 'bg-red-600 text-white'
                }`}>
                  {badge}
                </div>
              )}

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {PLAN_ICONS[plan.name] ?? <Star size={24} className="text-zinc-400" />}
                  <div>
                    <h2 className="text-white font-bold text-lg">{plan.name}</h2>
                    <p className="text-zinc-500 text-xs">{plan.durationDays} dias</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-white">
                    R$ {plan.price.toFixed(2)}
                  </p>
                  <p className="text-zinc-500 text-xs">por mês</p>
                </div>
              </div>

              <div className="flex flex-col gap-2 mb-5">
                <div className="flex items-center gap-2 text-sm text-zinc-300">
                  <Check size={15} className="text-green-500 flex-shrink-0" />
                  <span>Até {plan.maxPhotos} fotos</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-300">
                  <Check size={15} className="text-green-500 flex-shrink-0" />
                  <span>Até {plan.maxVideos} vídeos</span>
                </div>
                {plan.canPostStories && (
                  <div className="flex items-center gap-2 text-sm text-zinc-300">
                    <Check size={15} className="text-green-500 flex-shrink-0" />
                    <span>Stories</span>
                  </div>
                )}
                {plan.hasTopSearchPriority && (
                  <div className="flex items-center gap-2 text-sm text-zinc-300">
                    <Check size={15} className="text-green-500 flex-shrink-0" />
                    <span>Prioridade no topo das buscas</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-zinc-300">
                  <Check size={15} className="text-green-500 flex-shrink-0" />
                  <span>Aparece nas buscas</span>
                </div>
              </div>

              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={!!processingId}
                className={`w-full font-bold py-3 rounded-lg transition-colors disabled:opacity-50 ${
                  plan.name === 'Diamante'
                    ? 'bg-yellow-500 hover:bg-yellow-400 text-black'
                    : plan.name === 'Premium'
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-zinc-800 hover:bg-zinc-700 text-white'
                }`}
              >
                {isProcessing ? 'Processando...' : `Assinar ${plan.name}`}
              </button>
            </div>
          );
        })}
      </div>

      <p className="text-center text-zinc-600 text-xs mt-6">
        Pagamento fictício para testes. Integração real em breve.
      </p>
    </div>
  );
}