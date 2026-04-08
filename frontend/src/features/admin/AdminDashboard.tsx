import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../core/api/axios';
import { useAuth } from '../../core/context/AuthContext';
import { CheckCircle, XCircle, ShieldCheck, Users, CreditCard, ZoomIn } from 'lucide-react';

interface VerificationItem {
  companion: {
    id: string;
    nickname: string;
    city: string;
    state: string;
  };
  selfieStatus: string;
  documentStatus: string;
  selfieUrl: string | null;
  documentUrl: string | null;
  phoneVerified: boolean;
  reliabilityScore: number;
}

export function AdminDashboard() {
  const { role } = useAuth();
  const navigate = useNavigate();
  const [verifications, setVerifications] = useState<VerificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'verifications' | 'plans'>('verifications');
  const [modalUrl, setModalUrl] = useState<string | null>(null);

  useEffect(() => {
    if (role !== 'ADMIN') {
      navigate('/');
      return;
    }
    fetchVerifications();
  }, [role]);

  const fetchVerifications = () => {
    setLoading(true);
    api.get('/admin/verifications/pending')
      .then(res => setVerifications(res.data))
      .catch(() => setVerifications([]))
      .finally(() => setLoading(false));
  };

  const handleReview = async (
    companionId: string,
    type: 'selfie' | 'document',
    status: 'APPROVED' | 'REJECTED'
  ) => {
    setProcessingId(companionId);
    try {
      await api.put(`/admin/verifications/${companionId}/${type}/${status}`);
      fetchVerifications();
    } catch {
      alert('Erro ao processar.');
    } finally {
      setProcessingId(null);
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      NOT_SUBMITTED: 'bg-zinc-800 text-zinc-400',
      PENDING: 'bg-yellow-500/20 text-yellow-400',
      APPROVED: 'bg-green-500/20 text-green-400',
      REJECTED: 'bg-red-500/20 text-red-400',
    };
    const labels: Record<string, string> = {
      NOT_SUBMITTED: 'Não enviado',
      PENDING: 'Pendente',
      APPROVED: 'Aprovado',
      REJECTED: 'Reprovado',
    };
    return (
      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${map[status] ?? map['NOT_SUBMITTED']}`}>
        {labels[status] ?? status}
      </span>
    );
  };

  return (
    <div className="px-4 py-8 max-w-4xl mx-auto animate-in fade-in">

      {/* Modal de zoom */}
      {modalUrl && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={() => setModalUrl(null)}
        >
          <div
            className="relative max-w-2xl w-full"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setModalUrl(null)}
              className="absolute -top-10 right-0 text-white text-sm flex items-center gap-1 hover:text-red-400 transition-colors"
            >
              <XCircle size={18} /> Fechar
            </button>
            <img
              src={modalUrl}
              alt="Visualização"
              className="w-full rounded-xl border border-zinc-700 max-h-[80vh] object-contain"
            />
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <ShieldCheck size={28} className="text-red-500" />
        <div>
          <h1 className="text-2xl font-black text-white">Painel Admin</h1>
          <p className="text-zinc-400 text-sm">Gerenciamento da plataforma Sensara</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('verifications')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'verifications'
              ? 'bg-red-600 text-white'
              : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
          }`}
        >
          <Users size={16} />
          Verificações
          {verifications.length > 0 && (
            <span className="bg-white/20 text-white text-xs px-1.5 py-0.5 rounded-full">
              {verifications.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('plans')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'plans'
              ? 'bg-red-600 text-white'
              : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
          }`}
        >
          <CreditCard size={16} />
          Planos
        </button>
      </div>

      {/* Tab: Verificações */}
      {activeTab === 'verifications' && (
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-red-600" />
            </div>
          ) : verifications.length === 0 ? (
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-12 text-center">
              <CheckCircle size={40} className="text-green-500 mx-auto mb-3" />
              <p className="text-white font-semibold">Nenhuma verificação pendente</p>
              <p className="text-zinc-500 text-sm mt-1">Tudo em dia por aqui.</p>
            </div>
          ) : (
            verifications.map((item) => (
              <div key={item.companion.id} className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 space-y-4">

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-bold">{item.companion.nickname}</p>
                    <p className="text-zinc-500 text-xs">{item.companion.city}, {item.companion.state}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-zinc-400 text-xs mb-1">Score atual</p>
                    <p className={`text-lg font-black ${
                      item.reliabilityScore === 100 ? 'text-green-500' :
                      item.reliabilityScore >= 50 ? 'text-yellow-500' : 'text-red-500'
                    }`}>
                      {item.reliabilityScore}%
                    </p>
                  </div>
                </div>

                {/* Selfie */}
                {item.selfieStatus === 'PENDING' && (
                  <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                    <div className="flex items-start gap-3 mb-3">
                      {item.selfieUrl ? (
                        <div
                          className="relative w-24 h-24 flex-shrink-0 cursor-pointer group"
                          onClick={() => setModalUrl(`http://localhost:8080${item.selfieUrl}`)}
                        >
                          <img
                            src={`http://localhost:8080${item.selfieUrl}`}
                            alt="Selfie"
                            className="w-24 h-24 object-cover rounded-lg border border-zinc-700 group-hover:opacity-70 transition-opacity"
                          />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <ZoomIn size={24} className="text-white" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-24 h-24 flex-shrink-0 bg-zinc-800 rounded-lg border border-zinc-700 flex items-center justify-center">
                          <span className="text-zinc-600 text-xs">Sem foto</span>
                        </div>
                      )}
                      <div>
                        <p className="text-white text-sm font-semibold">Selfie</p>
                        <div className="mt-1">{statusBadge(item.selfieStatus)}</div>
                        {item.selfieUrl && (
                          <p className="text-zinc-600 text-xs mt-2">Clique na foto para ampliar</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReview(item.companion.id, 'selfie', 'APPROVED')}
                        disabled={processingId === item.companion.id}
                        className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-bold py-2 rounded-lg transition-colors"
                      >
                        <CheckCircle size={16} /> Aprovar
                      </button>
                      <button
                        onClick={() => handleReview(item.companion.id, 'selfie', 'REJECTED')}
                        disabled={processingId === item.companion.id}
                        className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-bold py-2 rounded-lg transition-colors"
                      >
                        <XCircle size={16} /> Rejeitar
                      </button>
                    </div>
                  </div>
                )}

                {/* Documento */}
                {item.documentStatus === 'PENDING' && (
                  <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                    <div className="flex items-start gap-3 mb-3">
                      {item.documentUrl ? (
                        <div
                          className="relative w-24 h-24 flex-shrink-0 cursor-pointer group"
                          onClick={() => setModalUrl(`http://localhost:8080${item.documentUrl}`)}
                        >
                          <img
                            src={`http://localhost:8080${item.documentUrl}`}
                            alt="Documento"
                            className="w-24 h-24 object-cover rounded-lg border border-zinc-700 group-hover:opacity-70 transition-opacity"
                          />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <ZoomIn size={24} className="text-white" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-24 h-24 flex-shrink-0 bg-zinc-800 rounded-lg border border-zinc-700 flex items-center justify-center">
                          <span className="text-zinc-600 text-xs">Sem foto</span>
                        </div>
                      )}
                      <div>
                        <p className="text-white text-sm font-semibold">Documento</p>
                        <div className="mt-1">{statusBadge(item.documentStatus)}</div>
                        {item.documentUrl && (
                          <p className="text-zinc-600 text-xs mt-2">Clique na foto para ampliar</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReview(item.companion.id, 'document', 'APPROVED')}
                        disabled={processingId === item.companion.id}
                        className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-bold py-2 rounded-lg transition-colors"
                      >
                        <CheckCircle size={16} /> Aprovar
                      </button>
                      <button
                        onClick={() => handleReview(item.companion.id, 'document', 'REJECTED')}
                        disabled={processingId === item.companion.id}
                        className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-bold py-2 rounded-lg transition-colors"
                      >
                        <XCircle size={16} /> Rejeitar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab: Planos */}
      {activeTab === 'plans' && <PlansTab />}
    </div>
  );
}

function PlansTab() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/plans')
      .then(res => setPlans(res.data))
      .catch(() => setPlans([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-red-600" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {plans.map(plan => (
        <div key={plan.id} className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-white font-bold text-lg">{plan.name}</p>
            <p className="text-red-500 font-black">R$ {plan.price.toFixed(2)}</p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-zinc-400">
            <span>📸 {plan.maxPhotos} fotos</span>
            <span>🎥 {plan.maxVideos} vídeos</span>
            <span>📅 {plan.durationDays} dias</span>
            <span>⭐ Prioridade {plan.priorityLevel}</span>
            {plan.canPostStories && <span>📱 Stories</span>}
            {plan.hasTopSearchPriority && <span>🔝 Topo da busca</span>}
          </div>
        </div>
      ))}
    </div>
  );
}