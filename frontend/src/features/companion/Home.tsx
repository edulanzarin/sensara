import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../core/api/axios';
import type { Companion, PageResponse } from '../../core/types/companion';
import { MapPin, ShieldCheck, User, LocateFixed, ChevronDown } from 'lucide-react';

const STATES = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA',
  'MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN',
  'RS','RO','RR','SC','SP','SE','TO'
];

export function Home() {
  const [companions, setCompanions] = useState<Companion[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationLoading, setLocationLoading] = useState(false);
  const [selectedState, setSelectedState] = useState<string>('');
  const [detectedState, setDetectedState] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchCompanions = (state?: string) => {
    setLoading(true);
    const params = state ? `?state=${state}` : '';
    api.get<PageResponse<Companion>>(`/companions${params}`)
      .then(res => setCompanions(res.data.content))
      .catch(err => console.error('Erro ao carregar perfis', err))
      .finally(() => setLoading(false));
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      fetchCompanions();
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { headers: { 'Accept-Language': 'pt-BR' } }
          );
          const data = await res.json();
          const stateCode = data.address?.['ISO3166-2-lvl4']?.replace('BR-', '');
          if (stateCode && STATES.includes(stateCode)) {
            setDetectedState(stateCode);
            setSelectedState(stateCode);
            fetchCompanions(stateCode);
          } else {
            fetchCompanions();
          }
        } catch {
          fetchCompanions();
        } finally {
          setLocationLoading(false);
        }
      },
      () => {
        // Negou permissão — busca tudo
        setLocationLoading(false);
        fetchCompanions();
      },
      { timeout: 5000 }
    );
  };

  useEffect(() => {
    detectLocation();
  }, []);

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const state = e.target.value;
    setSelectedState(state);
    fetchCompanions(state || undefined);
  };

  const handleClearState = () => {
    setSelectedState('');
    setDetectedState(null);
    fetchCompanions();
  };

  return (
    <div className="px-4 py-6">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Acompanhantes em Destaque</h1>
        <p className="text-zinc-400 text-sm">Encontre o perfil ideal perto de você.</p>
      </div>

      {/* Filtro de estado */}
      <div className="flex items-center gap-2 mb-6">
        <div className="relative flex-1">
          <select
            value={selectedState}
            onChange={handleStateChange}
            className="w-full bg-zinc-900 border border-zinc-800 text-white p-3 pr-8 rounded-lg focus:outline-none focus:border-red-600 transition-all appearance-none text-sm"
          >
            <option value="">Todos os estados</option>
            {STATES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
        </div>

        <button
          onClick={detectLocation}
          disabled={locationLoading}
          title="Detectar minha localização"
          className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 hover:border-red-600 text-zinc-300 px-3 py-3 rounded-lg transition-colors disabled:opacity-50"
        >
          <LocateFixed size={18} className={locationLoading ? 'animate-pulse text-red-500' : ''} />
        </button>

        {selectedState && (
          <button
            onClick={handleClearState}
            className="text-xs text-zinc-500 hover:text-red-500 transition-colors px-2"
          >
            Limpar
          </button>
        )}
      </div>

      {/* Info de localização detectada */}
      {detectedState && selectedState === detectedState && (
        <div className="flex items-center gap-1 text-xs text-zinc-500 mb-4">
          <LocateFixed size={12} className="text-red-500" />
          <span>Mostrando perfis em <span className="text-white font-semibold">{detectedState}</span></span>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-red-600" />
        </div>
      ) : companions.length === 0 ? (
        <div className="text-center py-20 bg-zinc-950 rounded-lg border border-zinc-900 space-y-3">
          <p className="text-zinc-500">Nenhum perfil encontrado{selectedState ? ` em ${selectedState}` : ''}.</p>
          {selectedState && (
            <button
              onClick={handleClearState}
              className="text-red-500 hover:text-red-400 text-sm transition-colors"
            >
              Ver todos os estados
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {companions.map(companion => (
            <div
              key={companion.id}
              onClick={() => navigate(`/companions/${companion.id}`)}
              className="bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800 hover:border-red-600/50 transition-colors cursor-pointer group"
            >
              {/* Foto */}
              <div className="aspect-[3/4] bg-zinc-800 relative overflow-hidden">
                {companion.profilePictureUrl ? (
                  <img
                    src={`http://localhost:8080${companion.profilePictureUrl}`}
                    alt={companion.nickname}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User size={40} className="text-zinc-600" />
                  </div>
                )}
                {companion.reliabilityScore === 100 && (
                  <div className="absolute top-2 right-2 bg-green-500 text-black text-xs font-bold px-2 py-1 rounded flex items-center gap-1 shadow-lg">
                    <ShieldCheck size={12} /> Verificada
                  </div>
                )}
              </div>

              {/* Infos */}
              <div className="p-3">
                <h3 className="font-bold text-white text-base truncate group-hover:text-red-500 transition-colors">
                  {companion.nickname}, {companion.age}
                </h3>
                <div className="flex items-center text-zinc-400 text-xs mt-1 mb-2">
                  <MapPin size={11} className="mr-1 flex-shrink-0" />
                  <span className="truncate">{companion.city}, {companion.state}</span>
                </div>
                <p className="text-red-500 font-semibold text-sm">
                  R$ {companion.basePrice?.toFixed(2) ?? 'A consultar'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}