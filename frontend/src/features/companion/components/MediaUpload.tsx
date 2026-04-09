import { useState, useRef } from 'react';
import { api } from '../../../core/api/axios';
import { Camera, CheckCircle, XCircle } from 'lucide-react';
import { Card, Button, Alert } from '../../../core/ui';

interface MediaUploadProps {
  companionId: string;
  onUploadSuccess: () => void;
}

export function MediaUpload({ companionId, onUploadSuccess }: MediaUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setStatus('idle');
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setStatus('idle');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'PHOTO');
    formData.append('isProfilePicture', 'true');

    try {
      await api.post(`/media/${companionId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setStatus('success');
      onUploadSuccess();
      setTimeout(() => {
        setFile(null);
        setPreview(null);
        setStatus('idle');
      }, 3000);
    } catch {
      setStatus('error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
          <Camera size={16} className="text-red-500" />
        </div>
        <h3 className="text-gray-900 font-bold text-sm">Foto de Perfil Principal</h3>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">

        {/* Preview */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="w-full sm:w-40 aspect-square bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-red-400 hover:bg-red-50 transition-all group relative overflow-hidden flex-shrink-0"
        >
          {preview ? (
            <>
              <img
                src={preview}
                alt="Preview"
                className="absolute inset-0 w-full h-full object-cover group-hover:opacity-70 transition-opacity"
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs font-semibold text-white bg-black/60 px-2 py-1 rounded-lg">Trocar foto</span>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 text-gray-400 group-hover:text-red-400 transition-colors">
              <Camera size={28} />
              <span className="text-xs font-medium text-center px-2">Clique para selecionar</span>
              <span className="text-xs text-gray-300">JPG, PNG até 10MB</span>
            </div>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*"
            className="hidden"
          />
        </div>

        {/* Ações */}
        <div className="flex flex-col gap-3 flex-1 justify-between">
          <p className="text-sm text-gray-400 leading-relaxed">
            Esta foto será exibida no seu card na página inicial. Use uma foto de boa qualidade e boa iluminação.
          </p>

          {status === 'success' && (
            <Alert
              message="Foto atualizada com sucesso!"
              variant="success"
            />
          )}

          {status === 'error' && (
            <Alert
              message="Erro ao enviar foto. Tente novamente."
              variant="error"
            />
          )}

          <Button
            variant="primary"
            size="md"
            loading={uploading}
            disabled={!file}
            onClick={handleUpload}
            className="w-full"
          >
            {!uploading && (
              <>
                <CheckCircle size={16} />
                Salvar Foto
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}