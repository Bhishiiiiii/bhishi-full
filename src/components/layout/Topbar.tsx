import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { 
  Menu, 
  Search, 
  Bell, 
  Plus, 
  CreditCard, 
  CheckCircle2, 
  UserCheck, 
  Shield, 
  ExternalLink,
  ChevronDown
} from 'lucide-react';

interface TopbarProps {
  onToggleMobileSidebar: () => void;
  onOpenRecordPayment: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onToggleMobileSidebar, onOpenRecordPayment }) => {
  const { 
    role, 
    setRole, 
    currentUser, 
    notifications, 
    unreadNotificationCount, 
    markNotificationAsRead, 
    markAllNotificationsAsRead,
    setCommandPaletteOpen 
  } = useApp();
  
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const roleOptions: { key: UserRole; label: string; badge: string }[] = [
    { key: 'organizer', label: 'Bishi Organizer', badge: 'Admin' },
    { key: 'member', label: 'Group Member', badge: 'Participant' },
    { key: 'auditor', label: 'Independent Auditor', badge: 'Observer' },
    { key: 'admin', label: 'Platform Admin', badge: 'Super' }
  ];

  return (
    <header className="sticky top-0 z-30 h-20 bg-bone-300/90 backdrop-blur-md border-b border-bottle-800/10 px-4 md:px-8 flex items-center justify-between">
      {/* Left: Mobile Toggle & Quick Search */}
      <div className="flex items-center gap-3 md:gap-4 flex-1">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-bottle-800 hover:bg-bone-400/80 transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Global Search Pill Trigger */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="flex items-center gap-3 px-3.5 py-2 rounded-xl bg-white/80 hover:bg-white text-bottle-800/60 hover:text-bottle-950 border border-bottle-800/10 shadow-subtle text-xs font-medium w-full max-w-xs md:max-w-sm transition-all"
        >
          <Search className="w-4 h-4 text-bottle-700" />
          <span className="truncate">Search Bishi, members, records...</span>
          <kbd className="hidden sm:inline-block ml-auto text-[10px] bg-bone-400 text-bottle-900 px-1.5 py-0.5 rounded border border-bone-600 font-mono">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Role Switcher Pill */}
        <div className="hidden sm:flex items-center bg-white/90 p-1 rounded-xl border border-bottle-800/10 shadow-subtle">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-bottle-800/60 px-2">
            Viewing As:
          </span>
          <select
            value={role}
            onChange={e => setRole(e.target.value as UserRole)}
            className="text-xs font-semibold text-bottle-950 bg-transparent pr-4 py-1 outline-none cursor-pointer"
          >
            {roleOptions.map(r => (
              <option key={r.key} value={r.key}>
                {r.label} ({r.badge})
              </option>
            ))}
          </select>
        </div>

        {/* Quick Action: Record Payment */}
        {role === 'organizer' && (
          <button
            onClick={onOpenRecordPayment}
            className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-bottle-800 hover:bg-bottle-900 text-bone-200 text-xs font-semibold shadow-subtle transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record Payment</span>
          </button>
        )}

        {/* Notification Dropdown Trigger */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(prev => !prev)}
            className="relative p-2.5 rounded-xl bg-white/80 hover:bg-white text-bottle-800 border border-bottle-800/10 shadow-subtle transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-crimson-600 ring-2 ring-white"></span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-elevated border border-bottle-800/15 overflow-hidden z-50 animate-in fade-in">
              <div className="px-4 py-3 border-b border-bone-600 bg-bone-400/50 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-bottle-950">Notifications & Alerts</h4>
                  <p className="text-[10px] text-bottle-800/70">{unreadNotificationCount} unread notices</p>
                </div>
                {unreadNotificationCount > 0 && (
                  <button
                    onClick={markAllNotificationsAsRead}
                    className="text-[11px] text-bottle-800 hover:text-crimson-700 font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-bone-600">
                {notifications.map(n => (
                  <div
                    key={n.id}
                    onClick={() => {
                      markNotificationAsRead(n.id);
                      if (n.link) navigate(n.link);
                      setNotificationsOpen(false);
                    }}
                    className={`p-3 text-xs hover:bg-bone-400/50 cursor-pointer transition-colors ${
                      n.read ? 'opacity-70' : 'bg-bone-300/40 font-medium'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-bottle-950">{n.title}</span>
                      <span className="text-[10px] text-bottle-700/60">{n.timestamp}</span>
                    </div>
                    <p className="text-xs text-bottle-800/80 leading-relaxed">{n.message}</p>
                  </div>
                ))}
              </div>

              <div className="px-4 py-2 bg-bone-400/50 border-t border-bone-600 text-center">
                <span className="text-[10px] text-bottle-800/70">Verified consortium alerts</span>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setProfileDropdownOpen(prev => !prev)}
            className="flex items-center gap-2 p-1.5 md:pr-3 rounded-xl bg-white/80 hover:bg-white border border-bottle-800/10 shadow-subtle transition-all"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-8 h-8 rounded-lg object-cover ring-1 ring-bottle-800/20"
            />
            <div className="hidden md:block text-left">
              <div className="text-xs font-semibold text-bottle-950 leading-tight">{currentUser.name}</div>
              <div className="text-[10px] text-bottle-800/70 capitalize">{role}</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-bottle-700 hidden md:block" />
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-elevated border border-bottle-800/15 overflow-hidden z-50 py-1.5 text-xs">
              <div className="px-4 py-2 border-b border-bone-600">
                <div className="font-semibold text-bottle-950">{currentUser.name}</div>
                <div className="text-[11px] text-bottle-700/70 font-mono">{currentUser.phone}</div>
              </div>
              <button
                onClick={() => {
                  navigate('/settings');
                  setProfileDropdownOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-bottle-900 hover:bg-bone-400/60"
              >
                Profile & Settings
              </button>
              <button
                onClick={() => {
                  navigate('/blockchain');
                  setProfileDropdownOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-bottle-900 hover:bg-bone-400/60"
              >
                Consortium Explorer
              </button>
              <div className="border-t border-bone-600 my-1"></div>
              <button
                onClick={() => {
                  navigate('/');
                  setProfileDropdownOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-crimson-700 hover:bg-crimson-50 font-medium"
              >
                View Public Landing Page
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
