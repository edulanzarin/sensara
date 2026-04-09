import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../core/api/axios';
import { useAuth } from '../../core/context/AuthContext';
import { CheckCircle, XCircle, ShieldCheck, Users, CreditCard, ZoomIn, X } from 'lucide-react';
import { Card, Button } from '../../core/ui';

interface VerificationItem {
  companion: { id: string; nickname: string; city: string; state: string; };
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
    if (role !== 'ADMIN') { navigate('/'); return; }
    fetchVerifications();
  }, [role]);

  const fetchVerifications = () => {
    setLoading(true);
    api.get('/admin/verifications/pending')
      .then(res => setVerifications(res.data))
      .catch(() => setVerifications([]))
      .finally(() => setLoading(false));
  };

  const handleReview = async (companionId: string, type: 'selfie' | 'document', status: 'APPROVED' | 'REJECTED') => {
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
    const map: Record<string, { bg: string; text: string; label: string }> = {
      NOT_SUBMITTED: { bg: 'bg-gray-100', text: 'text-gray-500', label: 'Não enviado' },
      PENDING:       { bg: 'bg-yellow-50', text: 'text-yellow-600', label: 'Pendente' },
      APPROVED:      { bg: 'bg-green-50', text: 'text-green-600', label: 'Aprovado' },
      REJECTED:      { bg: 'bg-red-50', text: 'text-red-600', label: 'Reprovado' },
    };
    const s = map[status] ?? map['NOT_SUBMITTED'];
    return (
      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${s.bg} ${s.text}`}>
        {s.label}
      </span>
    );
  };

  return (
    <div className="px-4 py-8 max-w-4xl mx-auto animate-in fade-in">

      {/* Modal zoom */}
      {modalUrl && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setModalUrl(null)}
        >
          <div className="relative max-w-2xl w-full" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setModalUrl(null)}
              className="absolute -top-10 right-0 text-white flex items-center gap-1.5 text-sm hover:text-red-400 transition-colors"
            >
              <X size={16} /> Fechar
            </button>
            <img
              src={modalUrl}
              alt="Visualização"
              className="w-full rounded-2xl max-h-[80vh] object-contain shadow-2xl"
            />
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
          <ShieldCheck size={20} className="text-red-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Painel Admin</h1>
          <p className="text-gray-400 text-sm">Gerenciamento da plataforma Sensara</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('verifications')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
            activeTab === 'verifications' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Users size={15} />
          Verificações
          {verifications.length > 0 && (
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
              activeTab === 'verifications' ? 'bg-white/20 text-white' : 'bg-red-100 text-red-600'
            }`}>
              {verifications.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('plans')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
            activeTab === 'plans' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <CreditCard size={15} />
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
            <Card className="p-12 text-center">
              <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle size={28} className="text-green-500" />
              </div>
              <p className="text-gray-900 font-semibold">Nenhuma verificação pendente</p>
              <p className="text-gray-400 text-sm mt-1">Tudo em dia por aqui.</p>
            </Card>
          ) : (
            verifications.map((item) => (
              <Card key={item.companion.id} className="p-5 space-y-4">

                {/* Info da acompanhante */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-900 font-bold">{item.companion.nickname}</p>
                    <p className="text-gray-400 text-xs">{item.companion.city}, {item.companion.state}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-xs mb-1">Score atual</p>
                    <p className={`text-lg font-black ${
                      item.reliabilityScore === 100 ? 'text-green-600' :
                      item.reliabilityScore >= 50 ? 'text-yellow-500' : 'text-red-500'
                    }`}>
                      {item.reliabilityScore}%
                    </p>
                  </div>
                </div>

                {/* Selfie */}
                {item.selfieStatus === 'PENDING' && (
                  <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      {item.selfieUrl ? (
                        <div
                          className="relative w-20 h-20 flex-shrink-0 cursor-pointer group rounded-xl overflow-hidden border border-gray-200"
                          onClick={() => setModalUrl(`http://localhost:8080${item.selfieUrl}`)}
                        >
                          <img src={`http://localhost:8080${item.selfieUrl}`} alt="Selfie" className="w-full h-full object-cover group-hover:opacity-70 transition-opacity" />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                            <ZoomIn size={20} className="text-white" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-20 h-20 flex-shrink-0 bg-gray-200 rounded-xl flex items-center justify-center">
                          <span className="text-gray-400 text-xs">Sem foto</span>
                        </div>
                      )}
                      <div>
                        <p className="text-gray-900 text-sm font-semibold">Selfie</p>
                        <div className="mt-1">{statusBadge(item.selfieStatus)}</div>
                        {item.selfieUrl && <p className="text-gray-400 text-xs mt-1.5">Clique para ampliar</p>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReview(item.companion.id, 'selfie', 'APPROVED')}
                        disabled={processingId === item.companion.id}
                        className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-bold py-2 rounded-xl transition-colors"
                      >
                        <CheckCircle size={15} /> Aprovar
                      </button>
                      <button
                        onClick={() => handleReview(item.companion.id, 'selfie', 'REJECTED')}
                        disabled={processingId === item.companion.id}
                        className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-bold py-2 rounded-xl transition-colors"
                      >
                        <XCircle size={15} /> Rejeitar
                      </button>
                    </div>
                  </div>
                )}

                {/* Documento */}
                {item.documentStatus === 'PENDING' && (
                  <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      {item.documentUrl ? (
                        <div
                          className="relative w-20 h-20 flex-shrink-0 cursor-pointer group rounded-xl overflow-hidden border border-gray-200"
                          onClick={() => setModalUrl(`http://localhost:8080${item.documentUrl}`)}
                        >
                          <img src={`http://localhost:8080${item.documentUrl}`} alt="Documento" className="w-full h-full object-cover group-hover:opacity-70 transition-opacity" />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                            <ZoomIn size={20} className="text-white" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-20 h-20 flex-shrink-0 bg-gray-200 rounded-xl flex items-center justify-center">
                          <span className="text-gray-400 text-xs">Sem foto</span>
                        </div>
                      )}
                      <div>
                        <p className="text-gray-900 text-sm font-semibold">Documento</p>
                        <div className="mt-1">{statusBadge(item.documentStatus)}</div>
                        {item.documentUrl && <p className="text-gray-400 text-xs mt-1.5">Clique para ampliar</p>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReview(item.companion.id, 'document', 'APPROVED')}
                        disabled={processingId === item.companion.id}
                        className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-bold py-2 rounded-xl transition-colors"
                      >
                        <CheckCircle size={15} /> Aprovar
                      </button>
                      <button
                        onClick={() => handleReview(item.companion.id, 'document', 'REJECTED')}
                        disabled={processingId === item.companion.id}
                        className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-bold py-2 rounded-xl transition-colors"
                      >
                        <XCircle size={15} /> Rejeitar
                      </button>
                    </div>
                  </div>
                )}
              </Card>
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
        <Card key={plan.id} className="p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-gray-900 font-bold text-base">{plan.name}</p>
            <p className="text-red-600 font-black">R$ {plan.price.toFixed(2)}</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              `${plan.maxPhotos} fotos`,
              `${plan.maxVideos} vídeos`,
              `${plan.durationDays} dias`,
              `Prioridade ${plan.priorityLevel}`,
              ...(plan.canPostStories ? ['Stories'] : []),
              ...(plan.hasTopSearchPriority ? ['Topo da busca'] : []),
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs text-gray-500">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-300 flex-shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}