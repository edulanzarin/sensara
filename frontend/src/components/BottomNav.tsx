import { Home, Search, Heart, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export function BottomNav() {
  const location = useLocation();

  const isActive = (path: string) =>
    location.pathname === path ? 'text-red-600' : 'text-zinc-500 hover:text-zinc-300';

  return (
    <nav className="fixed bottom-0 w-full h-16 bg-zinc-950 border-t border-zinc-800 flex justify-around items-center z-50 md:hidden">
      <Link to="/" className={`flex flex-col items-center gap-1 ${isActive('/')}`}>
        <Home size={22} />
        <span className="text-[10px] font-medium">Início</span>
      </Link>
      <Link to="/search" className={`flex flex-col items-center gap-1 ${isActive('/search')}`}>
        <Search size={22} />
        <span className="text-[10px] font-medium">Busca</span>
      </Link>
      <Link to="/favorites" className={`flex flex-col items-center gap-1 ${isActive('/favorites')}`}>
        <Heart size={22} />
        <span className="text-[10px] font-medium">Favoritos</span>
      </Link>
      <Link to="/profile" className={`flex flex-col items-center gap-1 ${isActive('/profile')}`}>
        <User size={22} />
        <span className="text-[10px] font-medium">Perfil</span>
      </Link>
    </nav>
  );
}