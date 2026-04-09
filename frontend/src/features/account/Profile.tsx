import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../core/context/AuthContext';
import { LayoutDashboard, LogOut, ChevronRight, Shield, Heart, User } from 'lucide-react';
import { Card, Button } from '../../core/ui';

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
        <Card className="p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="text-gray-400" size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Você não está logado</h2>
          <p className="text-gray-400 text-sm mb-6">Faça login para acessar seu perfil.</p>
          <Button variant="primary" size="lg" onClick={() => navigate('/login')} className="w-full">
            Entrar
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="px-4 py-8 max-w-lg mx-auto space-y-3 animate-in fade-in">

      {/* Header */}
      <Card className="p-5 flex items-center gap-4">
        <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
          <User className="text-gray-400" size={26} />
        </div>
        <div>
          <p className="text-gray-900 font-bold text-base">Minha Conta</p>
          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
            isCompanion
              ? 'bg-red-50 text-red-600'
              : 'bg-gray-100 text-gray-500'
          }`}>
            {isCompanion ? 'Acompanhante' : 'Cliente'}
          </span>
        </div>
      </Card>

      {/* Menu acompanhante */}
      {isCompanion && (
        <Card className="overflow-hidden">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 pt-4 pb-2">
            Acompanhante
          </p>
          <Link
            to="/dashboard"
            className="flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 transition-colors border-t border-gray-100"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
                <LayoutDashboard size={16} className="text-red-500" />
              </div>
              <span className="text-gray-900 text-sm font-medium">Meu Painel</span>
            </div>
            <ChevronRight size={16} className="text-gray-300" />
          </Link>
        </Card>
      )}

      {/* Menu geral */}
      <Card className="overflow-hidden">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 pt-4 pb-2">
          Conta
        </p>

        <Link
          to="/favorites"
          className="flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 transition-colors border-t border-gray-100"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <Heart size={16} className="text-gray-500" />
            </div>
            <span className="text-gray-900 text-sm font-medium">Meus Favoritos</span>
          </div>
          <ChevronRight size={16} className="text-gray-300" />
        </Link>

        <Link
          to="/profile/security"
          className="flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 transition-colors border-t border-gray-100"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <Shield size={16} className="text-gray-500" />
            </div>
            <span className="text-gray-900 text-sm font-medium">Segurança</span>
          </div>
          <ChevronRight size={16} className="text-gray-300" />
        </Link>
      </Card>

      {/* Sair */}
      <Card className="overflow-hidden">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-red-50 transition-colors text-red-500"
        >
          <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
            <LogOut size={16} className="text-red-500" />
          </div>
          <span className="text-sm font-medium">Sair da conta</span>
        </button>
      </Card>

    </div>
  );
}