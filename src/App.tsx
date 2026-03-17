import { HashRouter, Routes, Route, NavLink } from 'react-router-dom';
import { Home as HomeIcon, Fuel, BarChart3, LineChart, MoreHorizontal } from 'lucide-react';
import { Toaster } from 'sonner';
import HomePage from './pages/Home';
import FuelLog from './pages/FuelLog';
import AddRefueling from './pages/AddRefueling';
import Statistics from './pages/Statistics';
import Charts from './pages/Charts';

function MorePage() {
  return (
    <div className="flex items-center justify-center h-full text-[#8e8e93] p-8">
      <p className="text-lg text-center">Mais opcoes em breve...</p>
    </div>
  );
}

const navItems = [
  { to: '/', icon: HomeIcon, label: 'Inicio' },
  { to: '/fuel', icon: Fuel, label: 'Combustivel' },
  { to: '/stats', icon: BarChart3, label: 'Estatisticas' },
  { to: '/charts', icon: LineChart, label: 'Graficos' },
  { to: '/more', icon: MoreHorizontal, label: 'Mais' },
];

export default function App() {
  return (
    <HashRouter>
      <Toaster theme="dark" position="top-center" richColors />
      <div className="flex flex-col h-[100dvh] max-w-[480px] mx-auto bg-[#1a1a1a] relative overflow-hidden">
        {/* Page content */}
        <main className="flex-1 overflow-y-auto pb-[72px]">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/fuel" element={<FuelLog />} />
            <Route path="/add" element={<AddRefueling />} />
            <Route path="/stats" element={<Statistics />} />
            <Route path="/charts" element={<Charts />} />
            <Route path="/more" element={<MorePage />} />
          </Routes>
        </main>

        {/* Bottom navigation */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-[#1c1c1e] border-t border-[#2c2c2e] z-50">
          <div className="flex items-center justify-around h-[72px] px-1 pb-[env(safe-area-inset-bottom)]">
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors ${
                    isActive ? 'text-[#4A9DFF]' : 'text-[#8e8e93]'
                  }`
                }
              >
                <Icon size={22} strokeWidth={1.8} />
                <span className="text-[10px] font-medium">{label}</span>
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </HashRouter>
  );
}
