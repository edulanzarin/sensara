import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../core/api/axios';
import { Check, Star, Zap, Crown } from 'lucide-react';
import { Alert, Button } from '../../core/ui';

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

const PLAN_CONFIG: Record<string, {
  icon: React.ReactNode;
  badge: string | null;
  border: string;
  button: string;
  featured: boolean;
}> = {
  'Básico': {
    icon: <Star size={22} className="text-gray-400" />,
    badge: null,
    border: 'border-gray-200',
    button: 'bg-gray-900 hover:bg-gray-800 text-white',
    featured: false,
  },
  'Premium': {
    icon: <Zap size={22} className="text-red-500" />,
    badge: 'Mais popular',
    border: 'border-red-500',
    button: 'bg-red-600 hover:bg-red-700 text-white',
    featured: true,
  },
  'Diamante': {
    icon: <Crown size={22} className="text-yellow-500" />,
    badge: 'Melhor resultado',
    border: 'border-yellow-400',
    button: 'bg-yellow-500 hover:bg-yellow-400 text-black',
    featured: false,
  },
};

export function Plans() {
  const navigate = useNavigate();
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
      const userRes = await api.get('/users/me');
      const companionId = userRes.data.id;
      const checkoutRes = await api.post(`/payments/checkout/${companionId}`, { planId });
      const { checkoutUrl } = checkoutRes.data;
      const gatewayReference = checkoutUrl.split('fake-url-')[1];
      await api.post(`/payments/webhook/mock-approve/${gatewayReference}`);
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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Escolha seu Plano</h1>
        <p className="text-gray-400 text-sm">
          Selecione o plano ideal para turbinar seu perfil e aparecer nas buscas.
        </p>
      </div>

      {error && <div className="mb-6"><Alert message={error} /></div>}

      <div className="flex flex-col gap-4">
        {plans.map(plan => {
          const config = PLAN_CONFIG[plan.name] ?? PLAN_CONFIG['Básico'];
          const isProcessing = processingId === plan.id;

          return (
            <div
              key={plan.id}
              className={`bg-white rounded-2xl border-2 ${config.border} p-5 relative shadow-sm`}
            >
              {/* Badge */}
              {config.badge && (
                <div className={`absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap ${
                  plan.name === 'Diamante'
                    ? 'bg-yellow-500 text-black'
                    : 'bg-red-600 text-white'
                }`}>
                  {config.badge}
                </div>
              )}

              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    plan.name === 'Diamante' ? 'bg-yellow-50' :
                    plan.name === 'Premium' ? 'bg-red-50' : 'bg-gray-100'
                  }`}>
                    {config.icon}
                  </div>
                  <div>
                    <h2 className="text-gray-900 font-bold text-lg leading-none">{plan.name}</h2>
                    <p className="text-gray-400 text-xs mt-0.5">{plan.durationDays} dias</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-gray-900">
                    R$ {plan.price.toFixed(2)}
                  </p>
                  <p className="text-gray-400 text-xs">por mês</p>
                </div>
              </div>

              {/* Features */}
              <div className="flex flex-col gap-2 mb-5 py-4 border-t border-gray-100">
                <Feature text={`Até ${plan.maxPhotos} fotos`} />
                <Feature text={`Até ${plan.maxVideos} vídeos`} />
                <Feature text="Aparece nas buscas" />
                {plan.canPostStories && <Feature text="Stories" />}
                {plan.hasTopSearchPriority && <Feature text="Prioridade no topo das buscas" highlight />}
              </div>

              {/* Botão */}
              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={!!processingId}
                className={`w-full font-bold py-3 rounded-xl transition-colors disabled:opacity-50 text-sm ${config.button}`}
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Processando...
                  </span>
                ) : `Assinar ${plan.name}`}
              </button>
            </div>
          );
        })}
      </div>

      <p className="text-center text-gray-300 text-xs mt-6">
        Pagamento fictício para testes. Integração real em breve.
      </p>
    </div>
  );
}

function Feature({ text, highlight = false }: { text: string; highlight?: boolean }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
        <Check size={10} className="text-green-600" />
      </div>
      <span className={highlight ? 'text-gray-900 font-medium' : 'text-gray-600'}>{text}</span>
    </div>
  );
}