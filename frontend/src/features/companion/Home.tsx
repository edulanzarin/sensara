import { useEffect, useState } from 'react';
import { api } from '../../core/api/axios';
import type { Companion, PageResponse } from '../../core/types/companion';
import { MapPin, ShieldCheck, Star } from 'lucide-react';

export function Home() {
  const [companions, setCompanions] = useState<Companion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Chamada PÚBLICA, não requer estar logado
    api.get<PageResponse<Companion>>('/companions')
      .then(response => {
        setCompanions(response.data.content);
      })
      .catch(error => {
        console.error("Erro ao carregar perfis", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      {/* Cabeçalho da Busca */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Acompanhantes em Destaque</h1>
        <p className="text-zinc-400 text-sm">Encontre o perfil ideal perto de você.</p>
      </div>

      {/* Grid de Perfis */}
      {companions.length === 0 ? (
        <div className="text-center py-20 bg-zinc-950 rounded-lg border border-zinc-900">
          <p className="text-zinc-500">Nenhum perfil encontrado no momento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {companions.map(companion => (
            <div 
              key={companion.id} 
              className="bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800 hover:border-red-600/50 transition-colors cursor-pointer group"
            >
              {/* Espaço reservado para a foto (temporário) */}
              <div className="aspect-[3/4] bg-zinc-800 relative">
                {companion.verified && (
                  <div className="absolute top-2 right-2 bg-green-500 text-black text-xs font-bold px-2 py-1 rounded flex items-center gap-1 shadow-lg">
                    <ShieldCheck size={14} /> Verificada
                  </div>
                )}
                {/* Aqui entrará a tag do Plano Diamante no futuro */}
              </div>

              {/* Informações */}
              <div className="p-3">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-white text-lg truncate pr-2 group-hover:text-red-500 transition-colors">
                    {companion.nickname}, {companion.age}
                  </h3>
                  <div className="flex items-center text-yellow-500 text-sm">
                    <Star size={14} className="fill-yellow-500" />
                    <span className="ml-1">5.0</span>
                  </div>
                </div>
                
                <div className="flex items-center text-zinc-400 text-xs mb-2">
                  <MapPin size={12} className="mr-1" />
                  <span className="truncate">{companion.city}, {companion.state}</span>
                </div>

                <div className="text-red-500 font-semibold text-sm">
                  R$ {companion.basePrice?.toFixed(2) || 'A consultar'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}