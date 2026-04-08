import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../core/context/AuthContext';
import { LayoutDashboard, LogOut, ChevronRight, Shield, Heart, User } from 'lucide-react';

export function Profile() {
  const { token, role, isCompanion, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!token) {
    return (
      <div className="px-4 py-8 max-w-lg mx-auto">
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="text-zinc-400" size={32} />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Você não está logado</h2>
          <p className="text-zinc-400 text-sm mb-6">Faça login para acessar seu perfil.</p>
          <Link
            to="/login"
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg transition-colors inline-block"
          >
            Entrar
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-8 max-w-lg mx-auto space-y-4 animate-in fade-in">

      {/* Header */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 flex items-center gap-4">
        <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center flex-shrink-0">
          <User className="text-zinc-400" size={28} />
        </div>
        <div>
          <p className="text-white font-bold text-lg">Minha Conta</p>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            isCompanion
              ? 'bg-red-600/20 text-red-400'
              : 'bg-zinc-800 text-zinc-400'
          }`}>
            {isCompanion ? 'Acompanhante' : 'Cliente'}
          </span>
        </div>
      </div>

      {/* Menu acompanhante */}
      {isCompanion && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide px-4 pt-4 pb-2">
            Acompanhante
          </p>
          <Link
            to="/dashboard"
            className="flex items-center justify-between px-4 py-3 hover:bg-zinc-900 transition-colors border-t border-zinc-800"
          >
            <div className="flex items-center gap-3">
              <LayoutDashboard size={18} className="text-red-500" />
              <span className="text-white text-sm font-medium">Meu Painel</span>
            </div>
            <ChevronRight size={16} className="text-zinc-500" />
          </Link>
        </div>
      )}

      {/* Menu geral */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide px-4 pt-4 pb-2">
          Conta
        </p>

        <Link
          to="/favorites"
          className="flex items-center justify-between px-4 py-3 hover:bg-zinc-900 transition-colors border-t border-zinc-800"
        >
          <div className="flex items-center gap-3">
            <Heart size={18} className="text-zinc-400" />
            <span className="text-white text-sm font-medium">Meus Favoritos</span>
          </div>
          <ChevronRight size={16} className="text-zinc-500" />
        </Link>

        <Link
          to="/profile/security"
          className="flex items-center justify-between px-4 py-3 hover:bg-zinc-900 transition-colors border-t border-zinc-800"
        >
          <div className="flex items-center gap-3">
            <Shield size={18} className="text-zinc-400" />
            <span className="text-white text-sm font-medium">Segurança</span>
          </div>
          <ChevronRight size={16} className="text-zinc-500" />
        </Link>
      </div>

      {/* Sair */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-900 transition-colors text-red-500"
        >
          <LogOut size={18} />
          <span className="text-sm font-medium">Sair da conta</span>
        </button>
      </div>

    </div>
  );
}