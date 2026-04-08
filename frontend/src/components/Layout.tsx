import { Outlet } from 'react-router-dom';
import { TopBar } from './TopBar';
import { BottomNav } from './BottomNav';

export function Layout() {
  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100 font-sans pb-16 pt-16 md:pb-0">
      <TopBar />
      <main className="max-w-7xl mx-auto w-full">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}