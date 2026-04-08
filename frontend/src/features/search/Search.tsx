import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../core/api/axios';
import type { Companion, PageResponse } from '../../core/types/companion';
import { MapPin, ShieldCheck, User, SlidersHorizontal, X } from 'lucide-react';

// Hook de cidades do IBGE (mesmo do formulário)
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

const STATES = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA',
  'MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN',
  'RS','RO','RR','SC','SP','SE','TO'
];

const ETHNICITY_OPTIONS = ['Branca', 'Parda', 'Negra', 'Asiática', 'Indígena', 'Outra'];

interface Filters {
  state: string;
  city: string;
  minAge: string;
  maxAge: string;
  maxPrice: string;
  ethnicity: string;
}

const INITIAL_FILTERS: Filters = {
  state: '', city: '', minAge: '', maxAge: '', maxPrice: '', ethnicity: '',
};

function hasActiveFilters(f: Filters) {
  return Object.values(f).some(v => v !== '');
}

export function Search() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<Filters>(INITIAL_FILTERS);
  const [companions, setCompanions] = useState<Companion[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [totalResults, setTotalResults] = useState(0);

  const { cidades, loading: loadingCidades } = useCidades(filters.state);

  const set = (field: keyof Filters) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = e.target.value;
      setFilters(prev => ({
        ...prev,
        [field]: value,
        // reseta cidade ao trocar estado
        ...(field === 'state' ? { city: '' } : {}),
      }));
    };

  const buildParams = () => {
    const params = new URLSearchParams();
    if (filters.state) params.append('state', filters.state);
    if (filters.city) params.append('city', filters.city);
    if (filters.minAge) params.append('minAge', filters.minAge);
    if (filters.maxAge) params.append('maxAge', filters.maxAge);
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
    if (filters.ethnicity) params.append('ethnicity', filters.ethnicity);
    params.append('size', '20');
    return params.toString();
  };

  const handleSearch = async () => {
    setLoading(true);
    setSearched(true);
    setShowFilters(false);
    try {
      const res = await api.get<PageResponse<Companion>>(`/companions?${buildParams()}`);
      setCompanions(res.data.content);
      setTotalResults(res.data.totalElements);
    } catch {
      setCompanions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFilters(INITIAL_FILTERS);
    setCompanions([]);
    setSearched(false);
    setShowFilters(true);
    setTotalResults(0);
  };

  return (
    <div className="px-4 py-6 max-w-3xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Busca</h1>
        <div className="flex items-center gap-2">
          {hasActiveFilters(filters) && (
            <button
              onClick={handleClear}
              className="flex items-center gap-1 text-xs text-zinc-400 hover:text-red-500 transition-colors"
            >
              <X size={14} /> Limpar
            </button>
          )}
          <button
            onClick={() => setShowFilters(v => !v)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              showFilters ? 'bg-red-600 text-white' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            }`}
          >
            <SlidersHorizontal size={16} />
            Filtros
          </button>
        </div>
      </div>

      {/* Painel de filtros */}
      {showFilters && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 mb-6 space-y-4 animate-in fade-in">

          {/* Localização */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Estado</label>
              <select
                value={filters.state}
                onChange={set('state')}
                className="bg-zinc-900 border border-zinc-800 text-white p-3 rounded focus:outline-none focus:border-red-600 transition-all appearance-none text-sm"
              >
                <option value="">Todos</option>
                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Cidade</label>
              <select
                value={filters.city}
                onChange={set('city')}
                disabled={!filters.state || loadingCidades}
                className="bg-zinc-900 border border-zinc-800 text-white p-3 rounded focus:outline-none focus:border-red-600 transition-all appearance-none disabled:opacity-50 text-sm"
              >
                <option value="">
                  {loadingCidades ? 'Carregando...' : !filters.state ? 'Selecione estado' : 'Todas'}
                </option>
                {cidades.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Idade */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Idade</label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                placeholder="Mínima"
                min={18}
                max={70}
                value={filters.minAge}
                onChange={set('minAge')}
                className="bg-zinc-900 border border-zinc-800 text-white p-3 rounded focus:outline-none focus:border-red-600 transition-all text-sm"
              />
              <input
                type="number"
                placeholder="Máxima"
                min={18}
                max={70}
                value={filters.maxAge}
                onChange={set('maxAge')}
                className="bg-zinc-900 border border-zinc-800 text-white p-3 rounded focus:outline-none focus:border-red-600 transition-all text-sm"
              />
            </div>
          </div>

          {/* Preço máximo */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Valor máximo (R$)</label>
            <input
              type="number"
              placeholder="Ex: 500"
              value={filters.maxPrice}
              onChange={set('maxPrice')}
              className="bg-zinc-900 border border-zinc-800 text-white p-3 rounded focus:outline-none focus:border-red-600 transition-all text-sm"
            />
          </div>

          {/* Etnia */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Etnia</label>
            <select
              value={filters.ethnicity}
              onChange={set('ethnicity')}
              className="bg-zinc-900 border border-zinc-800 text-white p-3 rounded focus:outline-none focus:border-red-600 transition-all appearance-none text-sm"
            >
              <option value="">Todas</option>
              {ETHNICITY_OPTIONS.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>

          {/* Botão buscar */}
          <button
            onClick={handleSearch}
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </div>
      )}

      {/* Resultados */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-red-600" />
        </div>
      )}

      {!loading && searched && (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-zinc-400 text-sm">
              <span className="text-white font-semibold">{totalResults}</span> resultado{totalResults !== 1 ? 's' : ''} encontrado{totalResults !== 1 ? 's' : ''}
            </p>
            {!showFilters && (
              <button
                onClick={() => setShowFilters(true)}
                className="flex items-center gap-1 text-xs text-red-500 hover:text-red-400 transition-colors"
              >
                <SlidersHorizontal size={13} /> Editar filtros
              </button>
            )}
          </div>

          {companions.length === 0 ? (
            <div className="text-center py-16 bg-zinc-950 rounded-xl border border-zinc-800">
              <p className="text-zinc-500 mb-2">Nenhum perfil encontrado.</p>
              <p className="text-zinc-600 text-sm">Tente ajustar os filtros.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {companions.map(companion => (
                <div
                  key={companion.id}
                  onClick={() => navigate(`/companions/${companion.id}`)}
                  className="bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800 hover:border-red-600/50 transition-colors cursor-pointer group"
                >
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
                    {companion.verified && (
                      <div className="absolute top-2 right-2 bg-green-500 text-black text-xs font-bold px-2 py-1 rounded flex items-center gap-1 shadow-lg">
                        <ShieldCheck size={12} /> Verificada
                      </div>
                    )}
                  </div>

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
        </>
      )}
    </div>
  );
}