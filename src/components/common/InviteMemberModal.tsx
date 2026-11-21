import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, UserPlus, QrCode, Link as LinkIcon, Share2, Copy, Check } from 'lucide-react';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  bishiId?: string;
}

export const InviteMemberModal: React.FC<InviteMemberModalProps> = ({ isOpen, onClose, bishiId }) => {
  const { bishis, inviteMember, selectedBishiId, addToast } = useApp();
  const targetBishiId = bishiId || selectedBishiId;
  const currentBishi = bishis.find(b => b.id === targetBishiId) || bishis[0];

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+91 ');
  const [email, setEmail] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const inviteUrl = `https://bishi.network/join/${targetBishiId}?ref=inv_${Date.now().toString().slice(-6)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    addToast('success', 'Link Copied', 'Invitation link copied to clipboard.');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    inviteMember(targetBishiId, {
      name,
      phone,
      email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@member.in`
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bottle-950/70 backdrop-blur-sm animate-in fade-in">
      <div 
        className="w-full max-w-md bg-white rounded-2xl shadow-elevated border border-bottle-800/15 overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-bone-600 bg-bone-400/50 flex items-center justify-between">
          <div>
            <h3 className="text-base font-serif font-bold text-bottle-950">Invite Trusted Member</h3>
            <p className="text-xs text-bottle-800/70">To {currentBishi.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-bottle-800/50 hover:text-bottle-950 hover:bg-bone-600/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-bottle-900 block mb-1">
              Member Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Pooja Hegde"
              className="w-full text-xs font-medium bg-bone-300 border border-bottle-800/20 rounded-xl p-2.5 text-bottle-950 outline-none focus:border-bottle-800"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-bottle-900 block mb-1">
              Mobile Number (WhatsApp SMS Invite)
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full text-xs font-mono font-medium bg-bone-300 border border-bottle-800/20 rounded-xl p-2.5 text-bottle-950 outline-none focus:border-bottle-800"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-bottle-900 block mb-1">
              Email Address (Optional)
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="pooja.hegde@domain.in"
              className="w-full text-xs font-medium bg-bone-300 border border-bottle-800/20 rounded-xl p-2.5 text-bottle-950 outline-none focus:border-bottle-800"
            />
          </div>

          {/* Quick Share Link & QR Box */}
          <div className="pt-2 border-t border-bone-600">
            <label className="text-[11px] font-semibold text-bottle-800 uppercase tracking-wider block mb-2">
              Or Share Invitation Passcode
            </label>
            <div className="flex items-center gap-2 p-2 bg-bone-400/80 rounded-xl border border-bottle-800/10">
              <input
                type="text"
                readOnly
                value={inviteUrl}
                className="bg-transparent text-[11px] font-mono text-bottle-900 flex-1 outline-none truncate"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-2.5 py-1 bg-white hover:bg-bone-300 text-bottle-950 rounded-lg text-xs font-medium border border-bottle-800/15 flex items-center gap-1 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-bottle-800 hover:bg-bone-400 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-bottle-800 hover:bg-bottle-900 text-bone-200 shadow-subtle transition-all flex items-center gap-2"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Send Invitation Notice</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
