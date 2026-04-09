import { Home, Search, Heart, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export function BottomNav() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 w-full h-16 bg-white border-t border-gray-100 flex justify-around items-center z-50 shadow-sm">
      {[
        { to: '/', icon: Home, label: 'Início' },
        { to: '/search', icon: Search, label: 'Busca' },
        { to: '/favorites', icon: Heart, label: 'Favoritos' },
        { to: '/profile', icon: User, label: 'Perfil' },
      ].map(({ to, icon: Icon, label }) => (
        <Link
          key={to}
          to={to}
          className={`flex flex-col items-center gap-1 transition-colors px-6 py-3 rounded-xl ${
            isActive(to) ? 'text-red-600' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <Icon size={22} />
          <span className="text-[10px] font-medium">{label}</span>
        </Link>
      ))}
    </nav>
  );
}