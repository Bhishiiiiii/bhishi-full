import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { 
  LayoutDashboard, 
  CircleDot, 
  PlusCircle, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Users, 
  FileText, 
  ShieldCheck, 
  AlertCircle, 
  Settings, 
  History,
  Building2,
  ChevronDown
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onCloseMobile }) => {
  const { role, bishis, selectedBishiId, setSelectedBishiId } = useApp();
  const navigate = useNavigate();

  // Navigation items tailored to roles
  const navItems = [
    { name: 'Overview', path: '/dashboard', icon: LayoutDashboard, roles: ['organizer', 'member', 'auditor', 'admin'] },
    { name: 'My Bishi Groups', path: '/groups', icon: CircleDot, roles: ['organizer', 'member', 'auditor', 'admin'] },
    { name: 'Create Bishi', path: '/create-bishi', icon: PlusCircle, roles: ['organizer', 'admin'] },
    { name: 'Contributions', path: '/contributions', icon: ArrowDownLeft, roles: ['organizer', 'member', 'auditor', 'admin'] },
    { name: 'Payouts', path: '/payouts', icon: ArrowUpRight, roles: ['organizer', 'member', 'auditor', 'admin'] },
    { name: 'Members', path: '/members', icon: Users, roles: ['organizer', 'auditor', 'admin'] },
    { name: 'Activity & Ledger', path: '/ledger', icon: History, roles: ['organizer', 'member', 'auditor', 'admin'] },
    { name: 'Documents Vault', path: '/documents', icon: FileText, roles: ['organizer', 'member', 'auditor', 'admin'] },
    { name: 'Blockchain Proofs', path: '/blockchain', icon: ShieldCheck, roles: ['organizer', 'member', 'auditor', 'admin'] },
    { name: 'Disputes', path: '/disputes', icon: AlertCircle, roles: ['organizer', 'member', 'admin'] },
    { name: 'Settings', path: '/settings', icon: Settings, roles: ['organizer', 'member', 'auditor', 'admin'] }
  ];

  const visibleNav = navItems.filter(item => item.roles.includes(role));

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

        {/* Active Bishi Group Switcher */}
        <div className="p-4 border-b border-bone-500/10">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-bone-400 block mb-1.5 px-1">
            Active Community Circle
          </label>
          <div className="relative">
            <select
              value={selectedBishiId}
              onChange={e => {
                setSelectedBishiId(e.target.value);
                navigate(`/bishi/${e.target.value}`);
              }}
              className="w-full appearance-none bg-bottle-800/90 hover:bg-bottle-800 text-bone-200 text-xs font-medium py-2 px-3 pr-8 rounded-xl border border-bone-500/15 focus:outline-none focus:border-bone-400 cursor-pointer transition-colors"
            >
              {bishis.map(b => (
                <option key={b.id} value={b.id} className="bg-bottle-900 text-bone-200 py-1">
                  {b.name} ({b.category})
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-bone-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
          {visibleNav.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group
                  ${isActive 
                    ? 'bg-bone-500 text-bottle-950 font-semibold shadow-sm' 
                    : 'text-bone-400 hover:text-bone-100 hover:bg-bottle-800/60'
                  }
                `}
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-bottle-950' : 'text-bone-400 group-hover:text-bone-200'}`} />
                    <span>{item.name}</span>
                    {item.name === 'Disputes' && (
                      <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-crimson-800 text-bone-200">
                        1
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Protocol Trust & Demo Network Footer */}
        <div className="p-4 border-t border-bone-500/10 bg-bottle-950/30">
          <div className="flex items-center justify-between text-xs text-bone-400 mb-1.5">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Demo Ledger
            </span>
            <span className="text-[10px] text-bone-400 font-mono">Consortium L2</span>
          </div>
          <div className="text-[10px] text-bone-400 leading-tight">
            Centralized Organizer management with decentralized SHA-256 state anchoring.
          </div>
        </div>
      </aside>
    </>
  );
};
