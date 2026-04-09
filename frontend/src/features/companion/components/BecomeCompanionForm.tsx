import { useState, useRef, useEffect } from 'react';
import { api } from '../../../core/api/axios';
import { Camera, ChevronRight, ChevronLeft, User, MapPin } from 'lucide-react';
import { Input, Select, Textarea, Button, Alert, Card, Field } from '../../../core/ui';

interface FormData {
  nickname: string;
  age: string;
  height: string;
  weight: string;
  ethnicity: string;
  hairColor: string;
  eyeColor: string;
  state: string;
  city: string;
  neighborhood: string;
  whatsapp: string;
  basePrice: string;
  bio: string;
}

const INITIAL_FORM: FormData = {
  nickname: '', age: '', height: '', weight: '',
  ethnicity: '', hairColor: '', eyeColor: '',
  state: '', city: '', neighborhood: '',
  whatsapp: '', basePrice: '', bio: '',
};

const ETHNICITY_OPTIONS = ['Branca', 'Parda', 'Negra', 'Asiática', 'Indígena', 'Outra'].map(v => ({ value: v, label: v }));
const HAIR_OPTIONS = ['Loiro', 'Castanho', 'Preto', 'Ruivo', 'Platinado', 'Colorido'].map(v => ({ value: v, label: v }));
const EYE_OPTIONS = ['Castanho', 'Verde', 'Azul', 'Mel', 'Preto', 'Cinza'].map(v => ({ value: v, label: v }));
const STATES = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];
const STATE_OPTIONS = STATES.map(s => ({ value: s, label: s }));
const STEPS = ['Sobre você', 'Localização', 'Foto de perfil'];

function useCidades(state: string) {
  const [cidades, setCidades] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!state) { setCidades([]); return; }
    setLoading(true);
    fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${state}/municipios?orderBy=nome`)
      .then(res => res.json())
      .then(data => setCidades(data.map((m: any) => m.nome)))
      .catch(() => setCidades([]))
      .finally(() => setLoading(false));
  }, [state]);

  return { cidades, loading };
}

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {STEPS.map((label, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="flex flex-col items-center gap-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              i < current ? 'bg-red-600 text-white' :
              i === current ? 'bg-red-600 text-white ring-2 ring-red-200' :
              'bg-gray-100 text-gray-400'
            }`}>
              {i < current ? '✓' : i + 1}
            </div>
            <span className={`text-[10px] font-medium ${i === current ? 'text-red-500' : 'text-gray-400'}`}>
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`w-10 h-px mb-4 transition-colors ${i < current ? 'bg-red-400' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

interface Props {
  onCancel: () => void;
  onSuccess: () => void;
}

export function BecomeCompanionForm({ onCancel, onSuccess }: Props) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { cidades, loading: loadingCidades } = useCidades(form.state);
  const cityOptions = cidades.map(c => ({ value: c, label: c }));

  const set = (field: keyof FormData) => (value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const setNative = (field: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return setError('Apenas imagens são permitidas.');
    if (file.size > 10 * 1024 * 1024) return setError('A imagem deve ter no máximo 10MB.');
    setError('');
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const validateStep = (): boolean => {
    setError('');
    if (step === 0) {
      if (!form.nickname.trim()) { setError('Nome artístico é obrigatório.'); return false; }
      if (!form.age || Number(form.age) < 18 || Number(form.age) > 70) { setError('Idade deve ser entre 18 e 70 anos.'); return false; }
      if (!form.height) { setError('Altura é obrigatória.'); return false; }
      if (!form.weight) { setError('Peso é obrigatório.'); return false; }
      if (!form.ethnicity) { setError('Etnia é obrigatória.'); return false; }
      if (!form.whatsapp.trim()) { setError('WhatsApp é obrigatório.'); return false; }
      if (!form.basePrice) { setError('Valor base é obrigatório.'); return false; }
    }
    if (step === 1) {
      if (!form.state) { setError('Estado é obrigatório.'); return false; }
      if (!form.city.trim()) { setError('Cidade é obrigatória.'); return false; }
    }
    if (step === 2) {
      if (!photo) { setError('Foto de perfil é obrigatória.'); return false; }
    }
    return true;
  };

  const handleNext = () => { if (validateStep()) setStep(s => s + 1); };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setLoading(true);
    setError('');
    try {
      const userResponse = await api.get('/users/me');
      const userId = userResponse.data.id;

      await api.post(`/companions/${userId}`, {
        nickname: form.nickname,
        age: Number(form.age),
        height: Number(form.height),
        weight: Number(form.weight),
        ethnicity: form.ethnicity,
        hairColor: form.hairColor || null,
        eyeColor: form.eyeColor || null,
        state: form.state,
        city: form.city,
        neighborhood: form.neighborhood || null,
        whatsapp: form.whatsapp,
        basePrice: Number(form.basePrice),
        bio: form.bio || null,
      });

      const formData = new FormData();
      formData.append('file', photo!);
      formData.append('type', 'PHOTO');
      formData.append('isProfilePicture', 'true');
      await api.post(`/companions/${userId}/media`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao criar perfil. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 py-8 max-w-lg mx-auto animate-in fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Criar Perfil</h1>
        <p className="text-gray-400 text-sm mt-1">Preencha suas informações para anunciar no Sensara.</p>
      </div>

      <StepIndicator current={step} />

      <Card className="p-6">

        {/* STEP 0 — Dados pessoais */}
        {step === 0 && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-red-500 mb-1">
              <User size={16} />
              <span className="font-semibold text-sm">Informações Pessoais</span>
            </div>

            <Input label="Nome artístico *" placeholder="Como quer ser chamada" value={form.nickname} onChange={setNative('nickname')} />
            <Input label="Idade *" type="number" placeholder="Ex: 25" min={18} max={70} value={form.age} onChange={setNative('age')} />

            <div className="grid grid-cols-2 gap-3">
              <Input label="Altura (cm) *" type="number" placeholder="165" value={form.height} onChange={setNative('height')} />
              <Input label="Peso (kg) *" type="number" placeholder="60" value={form.weight} onChange={setNative('weight')} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Select label="Etnia *" options={ETHNICITY_OPTIONS} value={form.ethnicity} onChange={set('ethnicity')} placeholder="Selecione" />
              <Select label="Cabelo" options={HAIR_OPTIONS} value={form.hairColor} onChange={set('hairColor')} placeholder="Selecione" />
            </div>

            <Select label="Olhos" options={EYE_OPTIONS} value={form.eyeColor} onChange={set('eyeColor')} placeholder="Selecione" />
            <Input label="WhatsApp *" placeholder="(47) 99999-9999" value={form.whatsapp} onChange={setNative('whatsapp')} />
            <Input label="Valor base (R$) *" type="number" placeholder="Ex: 300" value={form.basePrice} onChange={setNative('basePrice')} />
            <Textarea label="Bio" rows={3} placeholder="Fale um pouco sobre você..." value={form.bio} onChange={setNative('bio')} />
          </div>
        )}

        {/* STEP 1 — Localização */}
        {step === 1 && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-red-500 mb-1">
              <MapPin size={16} />
              <span className="font-semibold text-sm">Localização</span>
            </div>

            <Select
              label="Estado *"
              options={STATE_OPTIONS}
              value={form.state}
              onChange={(value) => { set('state')(value); set('city')(''); }}
              placeholder="Selecione"
            />

            <Select
              label="Cidade *"
              options={cityOptions}
              value={form.city}
              onChange={set('city')}
              placeholder={loadingCidades ? 'Carregando...' : !form.state ? 'Selecione um estado primeiro' : 'Selecione a cidade'}
              disabled={!form.state || loadingCidades}
            />

            <Input label="Bairro" placeholder="Ex: Centro" value={form.neighborhood} onChange={setNative('neighborhood')} />
          </div>
        )}

        {/* STEP 2 — Foto */}
        {step === 2 && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-red-500 mb-1">
              <Camera size={16} />
              <span className="font-semibold text-sm">Foto de Perfil</span>
            </div>

            <p className="text-gray-400 text-sm">Esta será sua foto principal. Use uma foto de boa qualidade.</p>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="aspect-[3/4] max-w-xs mx-auto w-full bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-red-400 hover:bg-red-50 transition-all overflow-hidden group"
            >
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover group-hover:opacity-80 transition-opacity" />
              ) : (
                <div className="flex flex-col items-center gap-3 text-gray-400 group-hover:text-red-400 transition-colors">
                  <Camera size={36} />
                  <span className="text-sm font-medium">Clique para selecionar</span>
                  <span className="text-xs text-gray-300">JPG, PNG até 10MB</span>
                </div>
              )}
            </div>

            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />

            {photo && (
              <p className="text-green-600 text-sm text-center font-medium">✓ {photo.name}</p>
            )}
          </div>
        )}

        {/* Erro */}
        {error && <div className="mt-4"><Alert message={error} /></div>}

        {/* Navegação */}
        <div className="flex justify-between mt-6 gap-3">
          <Button
            variant="secondary"
            size="md"
            onClick={step === 0 ? onCancel : () => setStep(s => s - 1)}
          >
            <ChevronLeft size={16} />
            {step === 0 ? 'Cancelar' : 'Voltar'}
          </Button>

          {step < STEPS.length - 1 ? (
            <Button variant="primary" size="md" onClick={handleNext}>
              Próximo
              <ChevronRight size={16} />
            </Button>
          ) : (
            <Button variant="primary" size="md" loading={loading} onClick={handleSubmit}>
              Criar Perfil
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}