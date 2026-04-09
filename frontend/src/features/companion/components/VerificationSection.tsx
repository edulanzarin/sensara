import { useEffect, useRef, useState } from 'react';
import { api } from '../../../core/api/axios';
import { ShieldCheck, Camera, FileText, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import { Card, Alert, Button } from '../../../core/ui';

interface VerificationData {
  selfieStatus: string;
  documentStatus: string;
  reliabilityScore: number;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  NOT_SUBMITTED: { label: 'Não enviado', color: 'text-gray-400',   icon: <AlertCircle size={14} /> },
  PENDING:       { label: 'Em análise',  color: 'text-yellow-500', icon: <Clock size={14} /> },
  APPROVED:      { label: 'Aprovado',    color: 'text-green-500',  icon: <CheckCircle size={14} /> },
  REJECTED:      { label: 'Reprovado',   color: 'text-red-500',    icon: <XCircle size={14} /> },
};

function ScoreRing({ score }: { score: number }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score === 100 ? '#22c55e' : score >= 50 ? '#eab308' : '#ef4444';
  const trackColor = score === 100 ? '#dcfce7' : score >= 50 ? '#fef9c3' : '#fee2e2';

  return (
    <div className="relative w-20 h-20 flex items-center justify-center flex-shrink-0">
      <svg className="absolute" width="80" height="80" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={radius} fill="none" stroke={trackColor} strokeWidth="7" />
        <circle
          cx="40" cy="40" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="7"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 40 40)"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div className="flex flex-col items-center">
        <span className="text-base font-black text-gray-900">{score}%</span>
        <span className="text-[9px] text-gray-400 font-medium">Score</span>
      </div>
    </div>
  );
}

function UploadItem({
  label, description, status, icon, onUpload, uploading,
}: {
  label: string;
  description: string;
  status: string;
  icon: React.ReactNode;
  onUpload: (file: File) => void;
  uploading: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG['NOT_SUBMITTED'];
  const canUpload = status === 'NOT_SUBMITTED' || status === 'REJECTED';

  const statusBg: Record<string, string> = {
    NOT_SUBMITTED: 'bg-gray-100',
    PENDING: 'bg-yellow-50',
    APPROVED: 'bg-green-50',
    REJECTED: 'bg-red-50',
  };

  return (
    <div className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-xl">
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 ${statusBg[status] ?? 'bg-gray-100'} rounded-lg flex items-center justify-center flex-shrink-0 text-gray-500`}>
          {icon}
        </div>
        <div>
          <p className="text-gray-900 font-semibold text-sm">{label}</p>
          <p className="text-gray-400 text-xs mt-0.5 hidden sm:block">{description}</p>
          <div className={`flex items-center gap-1 mt-0.5 text-xs font-medium ${config.color}`}>
            {config.icon}
            {config.label}
          </div>
        </div>
      </div>

      {canUpload && (
        <Button
          variant="primary"
          size="sm"
          loading={uploading}
          onClick={() => fileRef.current?.click()}
          className="flex-shrink-0"
        >
          {uploading ? '' : 'Enviar'}
        </Button>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => {
          const file = e.target.files?.[0];
          if (file) onUpload(file);
        }}
      />
    </div>
  );
}

export function VerificationSection() {
  const [data, setData] = useState<VerificationData | null>(null);
  const [uploadingSelfie, setUploadingSelfie] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [error, setError] = useState('');

  const fetchVerification = () => {
    api.get('/companions/me/verification')
      .then(res => setData(res.data))
      .catch(() => setData({ selfieStatus: 'NOT_SUBMITTED', documentStatus: 'NOT_SUBMITTED', reliabilityScore: 0 }));
  };

  useEffect(() => { fetchVerification(); }, []);

  const handleUpload = async (type: 'selfie' | 'document', file: File) => {
    setError('');
    if (type === 'selfie') setUploadingSelfie(true);
    else setUploadingDocument(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      await api.post(`/companions/me/verification/${type}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      fetchVerification();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao enviar arquivo.');
    } finally {
      if (type === 'selfie') setUploadingSelfie(false);
      else setUploadingDocument(false);
    }
  };

  if (!data) return null;

  return (
    <Card className="p-5 space-y-4">

      {/* Header */}
      <div className="flex items-center gap-4">
        <ScoreRing score={data.reliabilityScore} />
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck
              size={16}
              className={data.reliabilityScore === 100 ? 'text-green-500' : 'text-gray-400'}
            />
            <h3 className="text-gray-900 font-bold text-sm">Verificação de Identidade</h3>
          </div>
          <p className="text-gray-400 text-xs leading-relaxed">
            {data.reliabilityScore === 100
              ? <span className="text-green-600 font-semibold">Perfil 100% verificado! Badge exibido no seu perfil.</span>
              : 'Envie sua selfie e documento para ganhar o badge de verificada.'}
          </p>
        </div>
      </div>

      {error && <Alert message={error} />}

      <div className="space-y-2">
        <UploadItem
          label="Selfie"
          description="Foto do seu rosto claramente visível. +50% de confiabilidade."
          status={data.selfieStatus}
          icon={<Camera size={18} />}
          onUpload={file => handleUpload('selfie', file)}
          uploading={uploadingSelfie}
        />
        <UploadItem
          label="Documento"
          description="RG, CNH ou Passaporte. +50% de confiabilidade."
          status={data.documentStatus}
          icon={<FileText size={18} />}
          onUpload={file => handleUpload('document', file)}
          uploading={uploadingDocument}
        />
      </div>

      {/* Legenda */}
      <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-gray-100">
        {[
          { score: '0%',   label: 'Sem verificação',      color: 'bg-red-400' },
          { score: '50%',  label: 'Selfie aprovada',       color: 'bg-yellow-400' },
          { score: '50%',  label: 'Documento aprovado',    color: 'bg-yellow-400' },
          { score: '100%', label: 'Totalmente verificada', color: 'bg-green-500' },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${item.color}`} />
            <span className="text-gray-400 text-xs">{item.score} — {item.label}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}