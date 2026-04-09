import { Outlet } from 'react-router-dom';
import { TopBar } from './TopBar';
import { BottomNav } from './BottomNav';

export function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans pb-16 pt-16">
      <TopBar />
      <main className="w-full">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}