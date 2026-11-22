import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { 
  Menu, 
  Search, 
  Bell, 
  Plus, 
  ShieldCheck, 
  ChevronDown,
  AlertCircle,
  Settings,
  LogOut,
  ExternalLink,
  User
} from 'lucide-react';

interface TopbarProps {
  onToggleMobileSidebar: () => void;
  onOpenRecordPayment: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onToggleMobileSidebar, onOpenRecordPayment }) => {
  const { 
    role, 
    currentUser, 
    notifications, 
    unreadNotificationCount, 
    markNotificationAsRead, 
    markAllNotificationsAsRead,
    setCommandPaletteOpen,
    disputes,
    logout 
  } = useApp();
  
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const notifDropdownRef = useRef<HTMLDivElement>(null);

  const openDisputesCount = disputes.filter(d => d.status === 'Open' || d.status === 'Under Review').length;

  const handleLogout = () => {
    logout();
    setProfileDropdownOpen(false);
    navigate('/login');
  };

  // Close dropdowns on outside click & Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setProfileDropdownOpen(false);
        setNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const displayRoleTitle = currentUser.displayRole || 
    (role === 'organizer' ? 'Organizer' : role === 'auditor' ? 'Independent Auditor' : role === 'admin' ? 'Platform Admin' : 'Member');

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
        {/* User Role Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/90 border border-bottle-800/10 shadow-subtle text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
          <span className="font-semibold text-bottle-950">{displayRoleTitle}</span>
        </div>

        {/* Quick Action: Record Payment (Organizer only) */}
        {role === 'organizer' && (
          <button
            onClick={onOpenRecordPayment}
            className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-bottle-800 hover:bg-bottle-900 text-bone-200 text-xs font-semibold shadow-subtle transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-crimson-400" />
            <span>Record Payment</span>
          </button>
        )}

        {/* Notification Dropdown Trigger */}
        <div className="relative" ref={notifDropdownRef}>
          <button
            onClick={() => setNotificationsOpen(prev => !prev)}
            aria-expanded={notificationsOpen}
            aria-label="Notifications"
            className="relative p-2.5 rounded-xl bg-white/80 hover:bg-white text-bottle-800 border border-bottle-800/10 shadow-subtle transition-colors cursor-pointer"
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
                    className="text-[11px] text-bottle-800 hover:text-crimson-700 font-medium cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-bone-600">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-bottle-800/60">No new notifications</div>
                ) : (
                  notifications.map(n => (
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
                  ))
                )}
              </div>

              <div className="px-4 py-2 bg-bone-400/50 border-t border-bone-600 text-center">
                <span className="text-[10px] text-bottle-800/70">Verified consortium alerts</span>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu with Disputes, Settings & Logout */}
        <div className="relative" ref={profileDropdownRef}>
          <button
            onClick={() => setProfileDropdownOpen(prev => !prev)}
            aria-expanded={profileDropdownOpen}
            aria-label="User profile menu"
            className="flex items-center gap-2 p-1.5 md:pr-3 rounded-xl bg-white/80 hover:bg-white border border-bottle-800/10 shadow-subtle transition-all cursor-pointer"
          >
            {currentUser.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-8 h-8 rounded-lg object-cover ring-1 ring-bottle-800/20"
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-bottle-800 text-bone-200 flex items-center justify-center font-bold text-xs">
                {currentUser.name.charAt(0)}
              </div>
            )}
            <div className="hidden md:block text-left">
              <div className="text-xs font-semibold text-bottle-950 leading-tight">{currentUser.name}</div>
              <div className="text-[10px] text-bottle-800/70">{displayRoleTitle}</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-bottle-700 hidden md:block" />
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-elevated border border-bottle-800/15 overflow-hidden z-50 py-1.5 text-xs animate-in fade-in">
              {/* Profile Header */}
              <div className="px-4 py-3 border-b border-bone-600 bg-bone-400/30">
                <div className="font-serif font-bold text-bottle-950 text-sm">{currentUser.name}</div>
                <div className="text-[11px] text-emerald-800 font-semibold mt-0.5">{displayRoleTitle}</div>
                <div className="text-[10px] text-bottle-800/60 font-mono mt-0.5">{currentUser.email || 'user@bishi.network'}</div>
              </div>

              {/* Disputes (Moved from sidebar) */}
              <button
                onClick={() => {
                  navigate('/disputes');
                  setProfileDropdownOpen(false);
                }}
                className="w-full text-left px-4 py-2.5 text-bottle-900 hover:bg-bone-400/60 flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span className="font-medium">Disputes & Inquiries</span>
                </div>
                {openDisputesCount > 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-crimson-100 text-crimson-800 font-bold border border-crimson-200">
                    {openDisputesCount} Active
                  </span>
                )}
              </button>

              {/* Settings (Moved from sidebar) */}
              <button
                onClick={() => {
                  navigate('/settings');
                  setProfileDropdownOpen(false);
                }}
                className="w-full text-left px-4 py-2.5 text-bottle-900 hover:bg-bone-400/60 flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <Settings className="w-4 h-4 text-bottle-700" />
                <span className="font-medium">Profile & Account Settings</span>
              </button>

              {/* Web3 Explorer */}
              <button
                onClick={() => {
                  navigate('/blockchain');
                  setProfileDropdownOpen(false);
                }}
                className="w-full text-left px-4 py-2.5 text-bottle-900 hover:bg-bone-400/60 flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="font-medium">Ethereum Sepolia Explorer</span>
              </button>

              <div className="border-t border-bone-600 my-1"></div>

              <button
                onClick={() => {
                  navigate('/');
                  setProfileDropdownOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-bottle-800/80 hover:bg-bone-400/40 text-[11px] flex items-center gap-2 transition-colors cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5 text-bottle-600" />
                <span>View Public Landing Page</span>
              </button>

              {/* Prominent Vermilion Log Out Button */}
              <div className="pt-1 border-t border-bone-600">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 text-crimson-700 hover:bg-crimson-50 font-bold flex items-center gap-2.5 transition-colors cursor-pointer group"
                >
                  <LogOut className="w-4 h-4 text-crimson-600 group-hover:-translate-x-0.5 transition-transform" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
