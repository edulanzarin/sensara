import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../core/api/axios';
import { useAuth } from '../../core/context/AuthContext';
import { type Companion } from '../../core/types/companion';
import { MapPin, ShieldCheck, ChevronLeft, Ruler, Weight, Eye, Palette, Users, Heart } from 'lucide-react';
import { Card } from '../../core/ui';

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white flex-shrink-0">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

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
    } catch {}
    finally { setTogglingFavorite(false); }
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
        <p className="text-gray-400 text-lg">Perfil não encontrado.</p>
        <button onClick={() => navigate(-1)} className="text-red-500 hover:text-red-600 text-sm font-medium">
          Voltar
        </button>
      </div>
    );
  }

  const scoreColor = companion.reliabilityScore === 100 ? 'text-green-600'
    : companion.reliabilityScore >= 50 ? 'text-yellow-500' : 'text-gray-400';

  const scoreBarColor = companion.reliabilityScore === 100 ? 'bg-green-500'
    : companion.reliabilityScore >= 50 ? 'bg-yellow-400' : 'bg-red-400';

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in">

      {/* Foto — full width no mobile, centralizada e arredondada no desktop */}
      <div className="w-full md:max-w-2xl md:mx-auto md:px-4 md:pt-6">
        <div className="relative w-full bg-gray-100 overflow-hidden md:rounded-2xl" style={{ height: 'min(75vh, 560px)' }}>
          {companion.profilePictureUrl ? (
            <img
              src={`http://localhost:8080${companion.profilePictureUrl}`}
              alt={companion.nickname}
              className="w-full h-full object-cover object-center"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <Users size={64} className="text-gray-300" />
            </div>
          )}

          {/* Botão voltar */}
          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm text-gray-700 p-2 rounded-full hover:bg-white transition-colors shadow-sm"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Botão favoritar */}
          <button
            onClick={handleToggleFavorite}
            disabled={togglingFavorite}
            className="absolute top-4 left-14 bg-white/80 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors shadow-sm disabled:opacity-50"
            title={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          >
            <Heart size={20} className={isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-500'} />
          </button>

          {/* Badge verificada */}
          {companion.reliabilityScore === 100 && (
            <div className="absolute top-4 right-4 bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow">
              <ShieldCheck size={13} /> Verificada
            </div>
          )}

          {/* Badge score parcial */}
          {companion.reliabilityScore > 0 && companion.reliabilityScore < 100 && (
            <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm text-gray-700 text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm">
              🛡️ {companion.reliabilityScore}% confiável
            </div>
          )}

          {/* Overlay nome */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
            <h1 className="text-3xl font-black text-white">{companion.nickname}, {companion.age}</h1>
            <div className="flex items-center text-white/80 text-sm mt-1 gap-1">
              <MapPin size={14} />
              <span>
                {companion.neighborhood ? `${companion.neighborhood}, ` : ''}
                {companion.city} - {companion.state}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo — sempre centralizado */}
      <div className="px-4 py-6 space-y-4">

        {/* Preço e WhatsApp */}
        <Card className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">A partir de</p>
              <p className="text-2xl font-black text-red-600">
                R$ {companion.basePrice?.toFixed(2) ?? 'A consultar'}
              </p>
            </div>
            <button
              onClick={handleWhatsApp}
              className="flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-3 px-4 sm:px-6 rounded-xl transition-colors text-sm flex-shrink-0"
            >
              <WhatsAppIcon />
              <span>WhatsApp</span>
            </button>
          </div>
        </Card>

        {/* Score */}
        {companion.reliabilityScore > 0 && (
          <Card className="p-4 flex items-center gap-4">
            <div className="flex flex-col items-center min-w-[52px]">
              <span className={`text-2xl font-black ${scoreColor}`}>
                {companion.reliabilityScore}%
              </span>
              <span className="text-gray-400 text-xs">Confiável</span>
            </div>
            <div className="flex-1">
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all ${scoreBarColor}`}
                  style={{ width: `${companion.reliabilityScore}%` }}
                />
              </div>
              <p className="text-gray-400 text-xs mt-1.5">
                {companion.reliabilityScore === 100 ? 'Identidade totalmente verificada'
                  : companion.reliabilityScore >= 40 ? 'Identidade parcialmente verificada'
                  : 'Verificação pendente'}
              </p>
            </div>
          </Card>
        )}

        {/* Bio */}
        {!!companion.bio && (
          <Card className="p-4">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Sobre mim</h2>
            <p className="text-gray-700 text-sm leading-relaxed">{companion.bio}</p>
          </Card>
        )}

        {/* Características */}
        <Card className="p-4">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Características</h2>
          <div className="grid grid-cols-2 gap-3">
            {!!companion.height && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Ruler size={14} className="text-gray-400" />
                </div>
                <span>{companion.height} cm</span>
              </div>
            )}
            {!!companion.weight && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Weight size={14} className="text-gray-400" />
                </div>
                <span>{companion.weight} kg</span>
              </div>
            )}
            {!!companion.ethnicity && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users size={14} className="text-gray-400" />
                </div>
                <span>{companion.ethnicity}</span>
              </div>
            )}
            {!!companion.hairColor && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Palette size={14} className="text-gray-400" />
                </div>
                <span>Cabelo {companion.hairColor.toLowerCase()}</span>
              </div>
            )}
            {!!companion.eyeColor && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Eye size={14} className="text-gray-400" />
                </div>
                <span>Olhos {companion.eyeColor.toLowerCase()}</span>
              </div>
            )}
          </div>
        </Card>

        <p className="text-center text-gray-300 text-xs pb-2">
          {companion.profileViews} visualizações
        </p>

      </div>
    </div>
  );
}