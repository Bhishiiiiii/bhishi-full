import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { 
  LayoutDashboard, 
  CircleDot, 
  CreditCard,
  FileText, 
  ShieldCheck, 
  History,
  LogOut
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onCloseMobile }) => {
  const { logout } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  // 6 Essential, uncluttered navigation items
  const navItems = [
    { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { name: 'My Bishi Groups', path: '/groups', icon: CircleDot },
    { name: 'Payments & Payouts', path: '/contributions', icon: CreditCard, matchPaths: ['/contributions', '/payouts'] },
    { name: 'Activity & Ledger', path: '/ledger', icon: History },
    { name: 'Documents Vault', path: '/documents', icon: FileText },
    { name: 'Blockchain Proofs', path: '/blockchain', icon: ShieldCheck }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-bottle-950/70 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Persistent Sidebar */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-40 w-64 bg-bottle-900 border-r border-bone-500/10 flex flex-col transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand Header */}
        <div className="h-20 px-6 flex items-center justify-between border-b border-bone-500/10 bg-bottle-950/40">
          <NavLink to="/" className="flex items-center gap-3 group">
            {/* Logo Emblem */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-bone-500 to-bone-700 p-0.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full bg-bottle-900 rounded-[10px] flex items-center justify-center">
                <span className="font-serif font-black text-xl text-bone-300 group-hover:scale-105 transition-transform">
                  B
                </span>
              </div>
            </div>
            <div>
              <div className="font-serif text-xl font-bold tracking-wide text-bone-200">
                BISHI
              </div>
              <div className="text-[10px] text-bone-400 font-mono tracking-wider uppercase">
                Community Trust
              </div>
            </div>
          </NavLink>
        </div>

        {/* 6 Essential Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = item.matchPaths 
              ? item.matchPaths.some(p => location.pathname.startsWith(p))
              : location.pathname === item.path;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                className={`
                  flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group
                  ${isActive 
                    ? 'bg-bone-500 text-bottle-950 font-semibold shadow-sm' 
                    : 'text-bone-400 hover:text-bone-100 hover:bg-bottle-800/60'
                  }
                `}
              >
                <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-bottle-950' : 'text-bone-400 group-hover:text-bone-200'}`} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Prominent Vermilion Log Out Button */}
        <div className="p-3 border-t border-bone-500/10 bg-bottle-950/20">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-crimson-600/15 hover:bg-crimson-600/25 text-crimson-400 hover:text-crimson-300 border border-crimson-500/30 transition-all shadow-subtle group cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-crimson-400 group-hover:-translate-x-0.5 transition-transform" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
