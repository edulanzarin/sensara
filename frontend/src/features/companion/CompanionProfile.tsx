import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../core/api/axios';
import { useAuth } from '../../core/context/AuthContext';
import { type Companion } from '../../core/types/companion';
import {
  MapPin, ShieldCheck, MessageCircle, ChevronLeft,
  Ruler, Weight, Eye, Palette, Users, Heart
} from 'lucide-react';

export function CompanionProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [companion, setCompanion] = useState<Companion | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [togglingFavorite, setTogglingFavorite] = useState(false);

  useEffect(() => {
    if (!id) return;

    api.get(`/companions/${id}`)
      .then(res => setCompanion(res.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));

    if (token) {
      api.get(`/favorites/${id}/status`)
        .then(res => setIsFavorite(res.data.isFavorite))
        .catch(() => {});
    }
  }, [id, token]);

  const handleWhatsApp = () => {
    const phone = companion?.whatsapp?.replaceAll(/\D/g, '') ?? '';
    window.open(`https://wa.me/55${phone}`, '_blank');
  };

  const handleToggleFavorite = async () => {
    if (!token) { navigate('/login'); return; }
    setTogglingFavorite(true);
    try {
      if (isFavorite) {
        await api.delete(`/favorites/${id}`);
        setIsFavorite(false);
      } else {
        await api.post(`/favorites/${id}`);
        setIsFavorite(true);
      }
    } catch {
      // ignora
    } finally {
      setTogglingFavorite(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-red-600" />
      </div>
    );
  }

  if (notFound || !companion) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4">
        <p className="text-zinc-400 text-lg">Perfil não encontrado.</p>
        <button onClick={() => navigate(-1)} className="text-red-500 hover:text-red-400 text-sm">
          Voltar
        </button>
      </div>
    );
  }

  const scoreColor = companion.reliabilityScore === 100
    ? 'text-green-500'
    : companion.reliabilityScore >= 50
    ? 'text-yellow-500'
    : 'text-zinc-400';

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in">

      {/* Foto principal */}
      <div className="relative aspect-[3/4] max-h-[70vh] bg-zinc-900 overflow-hidden">
        {companion.profilePictureUrl ? (
          <img
            src={`http://localhost:8080${companion.profilePictureUrl}`}
            alt={companion.nickname}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-zinc-800">
            <Users size={64} className="text-zinc-600" />
          </div>
        )}

        {/* Botão voltar */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm text-white p-2 rounded-full hover:bg-black/70 transition-colors"
        >
          <ChevronLeft size={22} />
        </button>

        {/* Botão favoritar */}
        <button
          onClick={handleToggleFavorite}
          disabled={togglingFavorite}
          className="absolute top-4 left-14 bg-black/50 backdrop-blur-sm p-2 rounded-full hover:bg-black/70 transition-colors disabled:opacity-50"
          title={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        >
          <Heart
            size={22}
            className={isFavorite ? 'text-red-500 fill-red-500' : 'text-white'}
          />
        </button>

        {/* Badge verificada */}
        {companion.reliabilityScore === 100 && (
          <div className="absolute top-4 right-4 bg-green-500 text-black text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
            <ShieldCheck size={14} /> Verificada
          </div>
        )}

        {/* Badge score */}
        {companion.reliabilityScore > 0 && companion.reliabilityScore < 100 && (
          <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
            🛡️ {companion.reliabilityScore}% confiável
          </div>
        )}

        {/* Overlay com nome */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6">
          <h1 className="text-3xl font-black text-white">
            {companion.nickname}, {companion.age}
          </h1>
          <div className="flex items-center text-zinc-300 text-sm mt-1 gap-1">
            <MapPin size={14} />
            <span>
              {companion.neighborhood ? `${companion.neighborhood}, ` : ''}
              {companion.city} - {companion.state}
            </span>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="px-4 py-6 space-y-6">

        {/* Preço e CTA */}
        <div className="flex items-center justify-between bg-zinc-950 border border-zinc-800 rounded-xl p-4">
          <div>
            <p className="text-zinc-500 text-xs uppercase tracking-wide">A partir de</p>
            <p className="text-2xl font-black text-red-500">
              R$ {companion.basePrice?.toFixed(2) ?? 'A consultar'}
            </p>
          </div>
          <button
            onClick={handleWhatsApp}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl transition-colors"
          >
            <MessageCircle size={20} />
            WhatsApp
          </button>
        </div>

        {/* Score de confiabilidade */}
        {companion.reliabilityScore > 0 && (
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex items-center gap-4">
            <div className="flex flex-col items-center">
              <span className={`text-2xl font-black ${scoreColor}`}>
                {companion.reliabilityScore}%
              </span>
              <span className="text-zinc-500 text-xs">Confiável</span>
            </div>
            <div className="flex-1">
              <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all ${
                    companion.reliabilityScore === 100 ? 'bg-green-500' :
                    companion.reliabilityScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${companion.reliabilityScore}%` }}
                />
              </div>
              <p className="text-zinc-500 text-xs mt-1">
                {companion.reliabilityScore === 100
                  ? 'Identidade totalmente verificada'
                  : companion.reliabilityScore >= 40
                  ? 'Identidade parcialmente verificada'
                  : 'Verificação pendente'}
              </p>
            </div>
          </div>
        )}

        {/* Bio */}
        {!!companion.bio && (
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
            <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">Sobre mim</h2>
            <p className="text-zinc-300 text-sm leading-relaxed">{companion.bio}</p>
          </div>
        )}

        {/* Características */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-4">Características</h2>
          <div className="grid grid-cols-2 gap-3">
            {!!companion.height && (
              <div className="flex items-center gap-2 text-sm text-zinc-300">
                <Ruler size={16} className="text-zinc-500 flex-shrink-0" />
                <span>{companion.height} cm</span>
              </div>
            )}
            {!!companion.weight && (
              <div className="flex items-center gap-2 text-sm text-zinc-300">
                <Weight size={16} className="text-zinc-500 flex-shrink-0" />
                <span>{companion.weight} kg</span>
              </div>
            )}
            {!!companion.ethnicity && (
              <div className="flex items-center gap-2 text-sm text-zinc-300">
                <Users size={16} className="text-zinc-500 flex-shrink-0" />
                <span>{companion.ethnicity}</span>
              </div>
            )}
            {!!companion.hairColor && (
              <div className="flex items-center gap-2 text-sm text-zinc-300">
                <Palette size={16} className="text-zinc-500 flex-shrink-0" />
                <span>Cabelo {companion.hairColor.toLowerCase()}</span>
              </div>
            )}
            {!!companion.eyeColor && (
              <div className="flex items-center gap-2 text-sm text-zinc-300">
                <Eye size={16} className="text-zinc-500 flex-shrink-0" />
                <span>Olhos {companion.eyeColor.toLowerCase()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Visualizações */}
        <p className="text-center text-zinc-600 text-xs">
          {companion.profileViews} visualizações
        </p>

      </div>
    </div>
  );
}