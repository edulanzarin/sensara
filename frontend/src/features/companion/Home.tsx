import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../core/api/axios';
import type { Companion, PageResponse } from '../../core/types/companion';
import { MapPin, ShieldCheck, User, LocateFixed } from 'lucide-react';
import { Select } from '../../core/ui';

const STATES = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA',
  'MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN',
  'RS','RO','RR','SC','SP','SE','TO'
];

const STATE_OPTIONS = STATES.map(s => ({ value: s, label: s }));

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

export function Home() {
  const [companions, setCompanions] = useState<Companion[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationLoading, setLocationLoading] = useState(false);
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [detectedState, setDetectedState] = useState<string | null>(null);
  const navigate = useNavigate();
  const { cidades, loading: loadingCidades } = useCidades(selectedState);

  const fetchCompanions = (state?: string, city?: string) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (state) params.append('state', state);
    if (city) params.append('city', city);
    api.get<PageResponse<Companion>>(`/companions?${params.toString()}`)
      .then(res => setCompanions(res.data.content))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const detectLocation = () => {
    if (!navigator.geolocation) { fetchCompanions(); return; }
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
      () => { setLocationLoading(false); fetchCompanions(); },
      { timeout: 5000 }
    );
  };

  useEffect(() => { detectLocation(); }, []);

  const handleStateChange = (value: string) => {
    setSelectedState(value);
    setSelectedCity('');
    fetchCompanions(value || undefined);
  };

  const handleCityChange = (value: string) => {
    setSelectedCity(value);
    fetchCompanions(selectedState || undefined, value || undefined);
  };

  const handleClear = () => {
    setSelectedState('');
    setSelectedCity('');
    setDetectedState(null);
    fetchCompanions();
  };

  const cityOptions = cidades.map(c => ({ value: c, label: c }));

  return (
    <div className="px-4 py-6">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Acompanhantes em Destaque</h1>
        <p className="text-gray-400 text-sm">Encontre o perfil ideal perto de você.</p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Estado"
            value={selectedState}
            onChange={handleStateChange}
            options={STATE_OPTIONS}
            placeholder="Todos"
          />
          <Select
            label="Cidade"
            value={selectedCity}
            onChange={handleCityChange}
            options={cityOptions}
            placeholder={loadingCidades ? 'Carregando...' : !selectedState ? 'Selecione estado' : 'Todas'}
            disabled={!selectedState || loadingCidades}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            {detectedState && selectedState === detectedState && (
              <>
                <LocateFixed size={12} className="text-red-500" />
                <span>Localização detectada automaticamente</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            {(selectedState || selectedCity) && (
              <button
                onClick={handleClear}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors font-medium"
              >
                Limpar
              </button>
            )}
            <button
              onClick={detectLocation}
              disabled={locationLoading}
              title="Detectar localização"
              className="flex items-center justify-center w-8 h-8 bg-gray-50 border border-gray-200 hover:border-red-500 hover:text-red-500 text-gray-400 rounded-lg transition-colors disabled:opacity-50"
            >
              <LocateFixed size={15} className={locationLoading ? 'animate-pulse text-red-500' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* Resultados */}
      {loading ? (
        <div className="flex justify-center items-center min-h-[40vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-red-600" />
        </div>
      ) : companions.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 space-y-3">
          <p className="text-gray-400">
            Nenhum perfil encontrado{selectedCity ? ` em ${selectedCity}` : selectedState ? ` em ${selectedState}` : ''}.
          </p>
          {(selectedState || selectedCity) && (
            <button onClick={handleClear} className="text-red-500 hover:text-red-600 text-sm font-medium transition-colors">
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
              className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-red-200 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="aspect-[3/4] bg-gray-100 relative overflow-hidden">
                {companion.profilePictureUrl ? (
                  <img
                    src={`http://localhost:8080${companion.profilePictureUrl}`}
                    alt={companion.nickname}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User size={40} className="text-gray-300" />
                  </div>
                )}
                {companion.reliabilityScore === 100 && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1 shadow">
                    <ShieldCheck size={11} /> Verificada
                  </div>
                )}
              </div>
              <div className="p-3">
                <h3 className="font-bold text-gray-900 text-sm truncate group-hover:text-red-600 transition-colors">
                  {companion.nickname}, {companion.age}
                </h3>
                <div className="flex items-center text-gray-400 text-xs mt-1 mb-2">
                  <MapPin size={11} className="mr-1 flex-shrink-0" />
                  <span className="truncate">{companion.city}, {companion.state}</span>
                </div>
                <p className="text-red-600 font-semibold text-sm">
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