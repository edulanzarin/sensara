import { useState, useRef, useEffect } from 'react';
import { api } from '../../../core/api/axios';
import { Camera, ChevronRight, ChevronLeft, User, MapPin } from 'lucide-react';

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

const ETHNICITY_OPTIONS = ['Branca', 'Parda', 'Negra', 'Asiática', 'Indígena', 'Outra'];
const HAIR_OPTIONS = ['Loiro', 'Castanho', 'Preto', 'Ruivo', 'Platinado', 'Colorido'];
const EYE_OPTIONS = ['Castanho', 'Verde', 'Azul', 'Mel', 'Preto', 'Cinza'];
const STATES = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA',
  'MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN',
  'RS','RO','RR','SC','SP','SE','TO'
];

const STEPS = ['Sobre você', 'Localização', 'Foto de perfil'];

// Hook que busca cidades do IBGE pelo estado selecionado
function useCidades(state: string) {
  const [cidades, setCidades] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!state) {
      setCidades([]);
      return;
    }
    setLoading(true);
    fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${state}/municipios?orderBy=nome`)
      .then(res => res.json())
      .then(data => setCidades(data.map((m: any) => m.nome)))
      .catch(() => setCidades([]))
      .finally(() => setLoading(false));
  }, [state]);

  return { cidades, loading };
}

function InputField({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide">{label}</label>
      <input
        {...props}
        className="bg-zinc-900 border border-zinc-800 text-white p-3 rounded focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all"
      />
    </div>
  );
}

function SelectField({ label, options, ...props }: { label: string; options: string[] } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide">{label}</label>
      <select
        {...props}
        className="bg-zinc-900 border border-zinc-800 text-white p-3 rounded focus:outline-none focus:border-red-600 transition-all appearance-none"
      >
        <option value="">Selecione</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {STEPS.map((label, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="flex flex-col items-center gap-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
              i < current ? 'bg-red-600 text-white' :
              i === current ? 'bg-red-600 text-white ring-2 ring-red-400' :
              'bg-zinc-800 text-zinc-500'
            }`}>
              {i < current ? '✓' : i + 1}
            </div>
            <span className={`text-[10px] font-medium ${i === current ? 'text-red-400' : 'text-zinc-600'}`}>
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`w-12 h-px mb-4 transition-colors ${i < current ? 'bg-red-600' : 'bg-zinc-800'}`} />
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

  const set = (field: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, state: e.target.value, city: '' }));
  };

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

  const handleNext = () => {
    if (validateStep()) setStep(s => s + 1);
  };

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
        <h1 className="text-2xl font-black text-white">Criar Perfil</h1>
        <p className="text-zinc-400 text-sm mt-1">Preencha suas informações para anunciar no Sensara.</p>
      </div>

      <StepIndicator current={step} />

      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6">

        {/* STEP 0 — Dados pessoais */}
        {step === 0 && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-red-500 mb-2">
              <User size={18} />
              <span className="font-semibold text-sm">Informações Pessoais</span>
            </div>

            <InputField
              label="Nome artístico *"
              placeholder="Como quer ser chamada"
              value={form.nickname}
              onChange={set('nickname')}
            />
            <InputField
              label="Idade *"
              type="number"
              placeholder="Ex: 25"
              min={18}
              max={70}
              value={form.age}
              onChange={set('age')}
            />
            <div className="grid grid-cols-2 gap-3">
              <InputField label="Altura (cm) *" type="number" placeholder="Ex: 165" value={form.height} onChange={set('height')} />
              <InputField label="Peso (kg) *" type="number" placeholder="Ex: 60" value={form.weight} onChange={set('weight')} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <SelectField label="Etnia *" options={ETHNICITY_OPTIONS} value={form.ethnicity} onChange={set('ethnicity')} />
              <SelectField label="Cabelo" options={HAIR_OPTIONS} value={form.hairColor} onChange={set('hairColor')} />
            </div>
            <SelectField label="Olhos" options={EYE_OPTIONS} value={form.eyeColor} onChange={set('eyeColor')} />
            <InputField
              label="WhatsApp *"
              placeholder="(47) 99999-9999"
              value={form.whatsapp}
              onChange={set('whatsapp')}
            />
            <InputField
              label="Valor base (R$) *"
              type="number"
              placeholder="Ex: 300"
              value={form.basePrice}
              onChange={set('basePrice')}
            />
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Bio</label>
              <textarea
                rows={3}
                placeholder="Fale um pouco sobre você..."
                value={form.bio}
                onChange={set('bio')}
                className="bg-zinc-900 border border-zinc-800 text-white p-3 rounded focus:outline-none focus:border-red-600 resize-none transition-all"
              />
            </div>
          </div>
        )}

        {/* STEP 1 — Localização */}
        {step === 1 && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-red-500 mb-2">
              <MapPin size={18} />
              <span className="font-semibold text-sm">Localização</span>
            </div>

            <SelectField
              label="Estado *"
              options={STATES}
              value={form.state}
              onChange={handleStateChange}
            />

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Cidade *</label>
              <select
                value={form.city}
                onChange={set('city')}
                disabled={!form.state || loadingCidades}
                className="bg-zinc-900 border border-zinc-800 text-white p-3 rounded focus:outline-none focus:border-red-600 transition-all appearance-none disabled:opacity-50"
              >
                <option value="">
                  {loadingCidades
                    ? 'Carregando cidades...'
                    : !form.state
                    ? 'Selecione um estado primeiro'
                    : 'Selecione a cidade'}
                </option>
                {cidades.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <InputField
              label="Bairro"
              placeholder="Ex: Centro"
              value={form.neighborhood}
              onChange={set('neighborhood')}
            />
          </div>
        )}

        {/* STEP 2 — Foto */}
        {step === 2 && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-red-500 mb-2">
              <Camera size={18} />
              <span className="font-semibold text-sm">Foto de Perfil</span>
            </div>

            <p className="text-zinc-400 text-sm">Esta será sua foto principal. Use uma foto de boa qualidade.</p>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="aspect-[3/4] max-w-xs mx-auto w-full bg-zinc-900 border-2 border-dashed border-zinc-700 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-red-600 transition-colors overflow-hidden"
            >
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-3 text-zinc-500">
                  <Camera size={40} />
                  <span className="text-sm font-medium">Clique para selecionar</span>
                  <span className="text-xs">JPG, PNG até 10MB</span>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />

            {photo && (
              <p className="text-green-500 text-sm text-center">✓ {photo.name}</p>
            )}
          </div>
        )}

        {/* Erro */}
        {error && (
          <div className="mt-4 bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded text-sm">
            {error}
          </div>
        )}

        {/* Navegação */}
        <div className="flex justify-between mt-6 gap-3">
          <button
            onClick={step === 0 ? onCancel : () => setStep(s => s - 1)}
            className="flex items-center gap-2 px-4 py-2 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium transition-colors"
          >
            <ChevronLeft size={18} />
            {step === 0 ? 'Cancelar' : 'Voltar'}
          </button>

          {step < STEPS.length - 1 ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2 rounded bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
            >
              Próximo
              <ChevronRight size={18} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 rounded bg-red-600 hover:bg-red-700 text-white font-bold transition-colors disabled:opacity-50"
            >
              {loading ? 'Criando perfil...' : 'Criar Perfil'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}