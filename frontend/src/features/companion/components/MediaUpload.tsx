import { useState, useRef } from 'react';
import { api } from '../../../core/api/axios';
import { UploadCloud, Image as ImageIcon, CheckCircle, XCircle } from 'lucide-react';

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
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // Cria um preview local da imagem
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreview(objectUrl);
      setStatus('idle');
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setStatus('idle');

    // Para envio de arquivos, precisamos usar FormData
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'PHOTO');
    formData.append('isProfilePicture', 'true');

    try {
      // Como o token já está no interceptor do Axios, ele vai automaticamente
      await api.post(`/media/${companionId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setStatus('success');
      onUploadSuccess(); // Avisa o componente pai que o upload terminou
      
      // Limpa o estado após sucesso
      setTimeout(() => {
        setFile(null);
        setPreview(null);
        setStatus('idle');
      }, 3000);
      
    } catch (error) {
      console.error('Erro no upload', error);
      setStatus('error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <ImageIcon className="text-red-500" size={20} />
        Foto de Perfil Principal
      </h3>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Área de Seleção de Arquivo */}
        <div 
          className="w-full md:w-1/2 aspect-square border-2 border-dashed border-zinc-700 rounded-lg flex flex-col items-center justify-center p-4 cursor-pointer hover:border-red-500 hover:bg-zinc-800/50 transition-all group relative overflow-hidden"
          onClick={() => fileInputRef.current?.click()}
        >
          {preview ? (
            <img src={preview} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-40 transition-opacity" />
          ) : (
            <UploadCloud className="text-zinc-500 mb-2 group-hover:text-red-500 transition-colors" size={40} />
          )}
          
          <span className="text-sm text-zinc-400 font-medium z-10 text-center bg-black/60 px-2 py-1 rounded">
            {preview ? 'Clique para trocar' : 'Clique para selecionar uma foto'}
          </span>
          <span className="text-xs text-zinc-600 mt-1 z-10 bg-black/60 px-2 py-1 rounded">PNG, JPG até 5MB</span>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileSelect} 
            accept="image/*" 
            className="hidden" 
          />
        </div>

        {/* Ações e Status */}
        <div className="w-full md:w-1/2 flex flex-col gap-4">
          <p className="text-sm text-zinc-400">
            Esta foto será exibida no seu card na página inicial. Capriche na qualidade e na iluminação para atrair mais cliques.
          </p>

          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className={`w-full font-bold py-3 rounded transition-all flex justify-center items-center gap-2
              ${!file || uploading ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-red-600 text-white hover:bg-red-700 shadow-lg'}
            `}
          >
            {uploading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Enviando...
              </>
            ) : (
              'Salvar Foto de Perfil'
            )}
          </button>

          {status === 'success' && (
            <div className="flex items-center gap-2 text-green-500 bg-green-500/10 p-3 rounded text-sm animate-in fade-in">
              <CheckCircle size={18} />
              Foto atualizada com sucesso!
            </div>
          )}
          
          {status === 'error' && (
            <div className="flex items-center gap-2 text-red-500 bg-red-500/10 p-3 rounded text-sm animate-in fade-in">
              <XCircle size={18} />
              Erro ao enviar foto. Tente novamente.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}