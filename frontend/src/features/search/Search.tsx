import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../core/api/axios';
import type { Companion, PageResponse } from '../../core/types/companion';
import { MapPin, ShieldCheck, User, SlidersHorizontal, X } from 'lucide-react';
import { Select, Input, Button, Card } from '../../core/ui';

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

const STATE_OPTIONS = STATES.map(s => ({ value: s, label: s }));
const ETHNICITY_OPTIONS = ['Branca', 'Parda', 'Negra', 'Asiática', 'Indígena', 'Outra'].map(e => ({ value: e, label: e }));

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

export function Search() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<Filters>(INITIAL_FILTERS);
  const [companions, setCompanions] = useState<Companion[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [totalResults, setTotalResults] = useState(0);

  const { cidades, loading: loadingCidades } = useCidades(filters.state);
  const cityOptions = cidades.map(c => ({ value: c, label: c }));

  const setField = (field: keyof Filters) => (value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
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

  const hasFilters = Object.values(filters).some(v => v !== '');

  return (
    <div className="px-4 py-6 max-w-3xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-gray-900">Busca</h1>
        <div className="flex items-center gap-2">
          {hasFilters && (
            <button
              onClick={handleClear}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors font-medium"
            >
              <X size={13} /> Limpar
            </button>
          )}
          <button
            onClick={() => setShowFilters(v => !v)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
              showFilters ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <SlidersHorizontal size={15} />
            Filtros
          </button>
        </div>
      </div>

      {/* Painel de filtros */}
      {showFilters && (
        <Card className="p-5 mb-5 space-y-4">

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Estado"
              value={filters.state}
              onChange={setField('state')}
              options={STATE_OPTIONS}
              placeholder="Todos"
            />
            <Select
              label="Cidade"
              value={filters.city}
              onChange={setField('city')}
              options={cityOptions}
              placeholder={loadingCidades ? 'Carregando...' : !filters.state ? 'Selecione estado' : 'Todas'}
              disabled={!filters.state || loadingCidades}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Idade mínima"
              type="number"
              placeholder="18"
              min={18}
              max={70}
              value={filters.minAge}
              onChange={e => setField('minAge')(e.target.value)}
            />
            <Input
              label="Idade máxima"
              type="number"
              placeholder="70"
              min={18}
              max={70}
              value={filters.maxAge}
              onChange={e => setField('maxAge')(e.target.value)}
            />
          </div>

          <Input
            label="Valor máximo (R$)"
            type="number"
            placeholder="Ex: 500"
            value={filters.maxPrice}
            onChange={e => setField('maxPrice')(e.target.value)}
          />

          <Select
            label="Etnia"
            value={filters.ethnicity}
            onChange={setField('ethnicity')}
            options={ETHNICITY_OPTIONS}
            placeholder="Todas"
          />

          <Button variant="primary" size="lg" loading={loading} onClick={handleSearch} className="w-full">
            Buscar
          </Button>
        </Card>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-red-600" />
        </div>
      )}

      {/* Resultados */}
      {!loading && searched && (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-500 text-sm">
              <span className="text-gray-900 font-semibold">{totalResults}</span> resultado{totalResults !== 1 ? 's' : ''} encontrado{totalResults !== 1 ? 's' : ''}
            </p>
            {!showFilters && (
              <button
                onClick={() => setShowFilters(true)}
                className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 font-medium transition-colors"
              >
                <SlidersHorizontal size={13} /> Editar filtros
              </button>
            )}
          </div>

          {companions.length === 0 ? (
            <Card className="text-center py-16 space-y-2">
              <p className="text-gray-400">Nenhum perfil encontrado.</p>
              <p className="text-gray-300 text-sm">Tente ajustar os filtros.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-2 gap-4">
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
        </>
      )}
    </div>
  );
}