import { LayoutDashboard, LogOut, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../core/context/AuthContext';

export function TopBar() {
  const { token, isCompanion, logout } = useAuth();

  return (
    <header className="fixed top-0 w-full h-16 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between px-4 z-50">
      <Link to="/" className="text-2xl font-black tracking-tighter text-red-600">
        SENSARA
      </Link>

      {token ? (
        <div className="flex items-center gap-3">
          {isCompanion && (
            <Link
              to="/dashboard"
              className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 transition-colors px-4 py-2 rounded font-semibold text-white text-sm"
            >
              <LayoutDashboard size={18} />
              <span className="hidden md:block">Painel</span>
            </Link>
          )}
          <button
            onClick={logout}
            className="text-zinc-400 hover:text-red-500 transition-colors"
            title="Sair"
          >
            <LogOut size={20} />
          </button>
        </div>
      ) : (
        <Link
          to="/login"
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 transition-colors px-4 py-2 rounded font-semibold text-white text-sm"
        >
          <User size={18} />
          <span className="hidden md:block">Entrar / Cadastrar</span>
        </Link>
      )}
    </header>
  );
}