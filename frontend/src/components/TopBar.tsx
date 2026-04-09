import { LayoutDashboard, LogOut, User, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../core/context/AuthContext';

export function TopBar() {
  const { token, role, isCompanion, logout } = useAuth();

  return (
    <header className="fixed top-0 w-full h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 z-50 shadow-sm">
      <Link to="/" className="text-2xl font-black tracking-tighter text-red-600">
        SENSARA
      </Link>

      <div className="flex items-center gap-2">
        {token ? (
          <>
            {role === 'ADMIN' && (
              <Link
                to="/admin"
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 transition-colors px-4 py-2 rounded-xl font-semibold text-white text-sm"
              >
                <ShieldCheck size={16} />
                <span>Admin</span>
              </Link>
            )}

            {isCompanion && role !== 'ADMIN' && (
              <Link
                to="/dashboard"
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 transition-colors px-4 py-2 rounded-xl font-semibold text-gray-700 text-sm"
              >
                <LayoutDashboard size={16} />
                <span>Painel</span>
              </Link>
            )}

            {!isCompanion && role !== 'ADMIN' && (
              <Link
                to="/dashboard"
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 transition-colors px-4 py-2 rounded-xl font-semibold text-white text-sm"
              >
                Painel
              </Link>
            )}

            <button
              onClick={logout}
              className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-gray-100"
              title="Sair"
            >
              <LogOut size={18} />
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 transition-colors px-4 py-2 rounded-xl font-semibold text-white text-sm"
          >
            <User size={16} />
            <span>Entrar</span>
          </Link>
        )}
      </div>
    </header>
  );
}