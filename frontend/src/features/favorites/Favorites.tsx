import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../core/api/axios';
import { useAuth } from '../../core/context/AuthContext';
import type { Companion } from '../../core/types/companion';
import { MapPin, ShieldCheck, User, Heart } from 'lucide-react';
import { Card, Button } from '../../core/ui';

export function Favorites() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<Companion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    api.get('/favorites')
      .then(res => setFavorites(res.data))
      .catch(() => setFavorites([]))
      .finally(() => setLoading(false));
  }, [token]);

  const handleRemove = async (companionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.delete(`/favorites/${companionId}`);
      setFavorites(prev => prev.filter(c => c.id !== companionId));
    } catch {}
  };

  if (!token) {
    return (
      <div className="px-4 py-8 max-w-lg mx-auto">
        <Card className="p-8 text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart size={32} className="text-red-400" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Faça login para ver seus favoritos</h2>
          <p className="text-gray-400 text-sm mb-6">Salve os perfis que você mais gosta.</p>
          <Button variant="primary" size="lg" onClick={() => navigate('/login')} className="w-full">
            Entrar
          </Button>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-red-600" />
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Meus Favoritos</h1>
        <p className="text-gray-400 text-sm">
          {favorites.length > 0
            ? `${favorites.length} perfil${favorites.length > 1 ? 'is' : ''} salvo${favorites.length > 1 ? 's' : ''}`
            : 'Nenhum perfil salvo ainda'}
        </p>
      </div>

      {favorites.length === 0 ? (
        <Card className="text-center py-20 space-y-3">
          <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
            <Heart size={28} className="text-gray-300" />
          </div>
          <p className="text-gray-400">Você ainda não favoritou nenhum perfil.</p>
          <button
            onClick={() => navigate('/')}
            className="text-red-500 hover:text-red-600 text-sm font-medium transition-colors"
          >
            Explorar perfis
          </button>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {favorites.map(companion => (
            <div
              key={companion.id}
              onClick={() => navigate(`/companions/${companion.id}`)}
              className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-red-200 hover:shadow-md transition-all cursor-pointer group relative"
            >
              {/* Botão remover */}
              <button
                onClick={(e) => handleRemove(companion.id, e)}
                className="absolute top-2 left-2 z-10 bg-white/80 backdrop-blur-sm p-1.5 rounded-full hover:bg-red-50 border border-gray-100 transition-colors shadow-sm"
                title="Remover dos favoritos"
              >
                <Heart size={14} className="text-red-500 fill-red-500" />
              </button>

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