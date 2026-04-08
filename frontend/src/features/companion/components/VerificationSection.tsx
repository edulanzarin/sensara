import { useEffect, useRef, useState } from 'react';
import { api } from '../../../core/api/axios';
import { ShieldCheck, Camera, FileText, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';

interface VerificationData {
  selfieStatus: string;
  documentStatus: string;
  reliabilityScore: number;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  NOT_SUBMITTED: { label: 'Não enviado', color: 'text-zinc-500', icon: <AlertCircle size={16} /> },
  PENDING:       { label: 'Em análise',  color: 'text-yellow-500', icon: <Clock size={16} /> },
  APPROVED:      { label: 'Aprovado',    color: 'text-green-500',  icon: <CheckCircle size={16} /> },
  REJECTED:      { label: 'Reprovado',   color: 'text-red-500',    icon: <XCircle size={16} /> },
};

function ScoreRing({ score }: { score: number }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score === 100 ? '#22c55e' : score >= 50 ? '#eab308' : '#ef4444';

  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <svg className="absolute" width="96" height="96" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r={radius} fill="none" stroke="#27272a" strokeWidth="8" />
        <circle
          cx="48" cy="48" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 48 48)"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div className="flex flex-col items-center">
        <span className="text-xl font-black text-white">{score}%</span>
        <span className="text-[10px] text-zinc-500">Score</span>
      </div>
    </div>
  );
}

function UploadItem({
  label,
  description,
  status,
  icon,
  onUpload,
  uploading,
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

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center flex-shrink-0 text-zinc-400">
            {icon}
          </div>
          <div>
            <p className="text-white font-semibold text-sm">{label}</p>
            <p className="text-zinc-500 text-xs mt-0.5">{description}</p>
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${config.color}`}>
              {config.icon}
              {config.label}
            </div>
          </div>
        </div>

        {canUpload && (
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex-shrink-0 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors"
          >
            {uploading ? '...' : 'Enviar'}
          </button>
        )}
      </div>

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
      .catch(() => setData({
        selfieStatus: 'NOT_SUBMITTED',
        documentStatus: 'NOT_SUBMITTED',
        reliabilityScore: 0,
      }));
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
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 space-y-4">

      {/* Header com score */}
      <div className="flex items-center gap-5">
        <ScoreRing score={data.reliabilityScore} />
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck size={18} className={data.reliabilityScore === 100 ? 'text-green-500' : 'text-zinc-500'} />
            <h3 className="text-white font-bold">Verificação de Identidade</h3>
          </div>
          <p className="text-zinc-400 text-xs leading-relaxed">
            {data.reliabilityScore === 100
              ? <span className="text-green-500 font-semibold">Perfil 100% verificado! Badge exibido no seu perfil.</span>
              : 'Envie sua selfie e documento para ganhar o badge de verificada.'}
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg text-xs">
          {error}
        </div>
      )}

      <UploadItem
        label="Selfie"
        description="Foto do seu rosto claramente visível. +50% de confiabilidade."
        status={data.selfieStatus}
        icon={<Camera size={20} />}
        onUpload={file => handleUpload('selfie', file)}
        uploading={uploadingSelfie}
      />

      <UploadItem
        label="Documento"
        description="RG, CNH ou Passaporte. +50% de confiabilidade."
        status={data.documentStatus}
        icon={<FileText size={20} />}
        onUpload={file => handleUpload('document', file)}
        uploading={uploadingDocument}
      />

      {/* Legenda */}
      <div className="grid grid-cols-2 gap-2 pt-2">
        {[
          { score: '0%',   label: 'Sem verificação',     color: 'bg-red-500' },
          { score: '50%',  label: 'Selfie aprovada',      color: 'bg-yellow-500' },
          { score: '50%',  label: 'Documento aprovado',   color: 'bg-yellow-500' },
          { score: '100%', label: 'Totalmente verificada', color: 'bg-green-500' },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${item.color}`} />
            <span className="text-zinc-500 text-xs">{item.score} — {item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}