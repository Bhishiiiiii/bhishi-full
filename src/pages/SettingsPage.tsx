import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  User, 
  Shield, 
  Lock, 
  Bell, 
  Layers, 
  CheckCircle2, 
  Key,
  Globe
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { currentUser, role, addToast } = useApp();

  const [name, setName] = useState(currentUser.name);
  const [phone, setPhone] = useState(currentUser.phone);
  const [email, setEmail] = useState(currentUser.email);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [whatsappAlerts, setWhatsappAlerts] = useState(true);
  const [anchorFrequency, setAnchorFrequency] = useState('Immediate on Payment');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    addToast('success', 'Profile Updated', 'Personal settings updated successfully.');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in">
      {/* Header */}
      <div className="pb-4 border-b border-bottle-800/10">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-bottle-950">
          Account & Protocol Settings
        </h1>
        <p className="text-xs sm:text-sm text-bottle-800/70 mt-0.5">
          Manage your personal profile, notification preferences, and blockchain notary settings.
        </p>
      </div>

      {/* 1. Personal Profile */}
      <form onSubmit={handleSaveProfile} className="p-6 rounded-2xl bg-white border border-bottle-800/10 shadow-subtle space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-bone-600">
          <User className="w-5 h-5 text-bottle-800" />
          <h2 className="text-base font-serif font-bold text-bottle-950">Personal Information</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-bottle-950 block mb-1">
              Full Legal Name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full text-xs font-medium bg-bone-300 border border-bottle-800/20 rounded-xl p-2.5 text-bottle-950 outline-none focus:border-bottle-800"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-bottle-950 block mb-1">
              Active Role
            </label>
            <input
              type="text"
              disabled
              value={`${role.toUpperCase()}`}
              className="w-full text-xs font-medium bg-bone-400/80 border border-bottle-800/10 rounded-xl p-2.5 text-bottle-800 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-bottle-950 block mb-1">
              Mobile Number (SMS / WhatsApp)
            </label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full text-xs font-mono font-medium bg-bone-300 border border-bottle-800/20 rounded-xl p-2.5 text-bottle-950 outline-none focus:border-bottle-800"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-bottle-950 block mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full text-xs font-medium bg-bone-300 border border-bottle-800/20 rounded-xl p-2.5 text-bottle-950 outline-none focus:border-bottle-800"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-bottle-800 hover:bg-bottle-900 text-bone-200 text-xs font-semibold shadow-subtle transition-all"
          >
            Save Profile Changes
          </button>
        </div>
      </form>

      {/* 2. Security & Verification */}
      <div className="p-6 rounded-2xl bg-white border border-bottle-800/10 shadow-subtle space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-bone-600">
          <Shield className="w-5 h-5 text-bottle-800" />
          <h2 className="text-base font-serif font-bold text-bottle-950">Security & Authentication</h2>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-bone-300/60 border border-bottle-800/10">
            <div>
              <div className="font-semibold text-bottle-950">Two-Factor Authentication (SMS OTP)</div>
              <div className="text-bottle-800/70 text-[11px]">Required for recording payouts and altering group rules</div>
            </div>
            <input
              type="checkbox"
              checked={twoFactorEnabled}
              onChange={e => setTwoFactorEnabled(e.target.checked)}
              className="w-4 h-4 accent-bottle-800 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-bone-300/60 border border-bottle-800/10">
            <div>
              <div className="font-semibold text-bottle-950">Aadhaar / PAN KYC Hash Notarization</div>
              <div className="text-emerald-700 text-[11px] font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Identity Hash Anchored on Consortium
              </div>
            </div>
            <span className="text-[11px] font-mono text-bottle-800/70">KYC Validated</span>
          </div>
        </div>
      </div>

      {/* 3. Blockchain Notary Settings */}
      <div className="p-6 rounded-2xl bg-white border border-bottle-800/10 shadow-subtle space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-bone-600">
          <Layers className="w-5 h-5 text-bottle-800" />
          <h2 className="text-base font-serif font-bold text-bottle-950">Blockchain Anchoring Preferences</h2>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <label className="text-xs font-semibold text-bottle-950 block mb-1">
              Anchoring Trigger Schedule
            </label>
            <select
              value={anchorFrequency}
              onChange={e => setAnchorFrequency(e.target.value)}
              className="w-full text-xs font-medium bg-bone-300 border border-bottle-800/20 rounded-xl p-2.5 text-bottle-950 outline-none"
            >
              <option value="Immediate on Payment">Immediate (Anchor every contribution receipt in real time)</option>
              <option value="Daily Batch">Daily Batch (Consolidate into daily Merkle tree)</option>
              <option value="End of Cycle">Cycle Milestone (Anchor upon complete payout)</option>
            </select>
          </div>

          <div className="p-3.5 rounded-xl bg-bone-400/80 border border-bottle-800/10 text-[11px] text-bottle-900 leading-relaxed">
            Consortium gas fees are automatically sponsored by the central Bishi node. Members never pay cryptocurrency gas fees.
          </div>
        </div>
      </div>
    </div>
  );
};
