import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Member } from '../types';
import { InviteMemberModal } from '../components/common/InviteMemberModal';
import { 
  Users, 
  Search, 
  UserPlus, 
  ShieldCheck, 
  CheckCircle2, 
  Calendar, 
  ArrowDownLeft, 
  ArrowUpRight, 
  X,
  Phone,
  Mail
} from 'lucide-react';
import { formatINR } from '../utils/cryptoSim';

export const MembersPage: React.FC = () => {
  const { members, contributions, payouts, role } = useApp();
  const [search, setSearch] = useState('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.phone.includes(search) ||
    m.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in">
      <InviteMemberModal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-bottle-800/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-bottle-950">
            Community Members
          </h1>
          <p className="text-xs sm:text-sm text-bottle-800/70 mt-0.5">
            Directory of enrolled circle participants, compliance ratings, and payment tracking.
          </p>
        </div>

        {role === 'organizer' && (
          <button
            onClick={() => setInviteModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-bottle-800 hover:bg-bottle-900 text-bone-200 text-xs font-semibold shadow-subtle flex items-center gap-1.5 self-start transition-all"
          >
            <UserPlus className="w-4 h-4 text-crimson-400" />
            <span>Invite Member</span>
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-bottle-700 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search member by name, phone, email..."
            className="w-full text-xs font-medium bg-white border border-bottle-800/15 rounded-xl pl-9 pr-4 py-2 text-bottle-950 outline-none focus:border-bottle-800 shadow-subtle"
          />
        </div>

        <div className="text-xs text-bottle-800/70 font-medium">
          Showing {filteredMembers.length} active participants
        </div>
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredMembers.map(member => (
          <div
            key={member.id}
            onClick={() => setSelectedMember(member)}
            className="p-5 rounded-2xl bg-white border border-bottle-800/10 shadow-subtle hover:shadow-premium hover:border-bottle-800/25 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                  member.role === 'Organizer' 
                    ? 'bg-bottle-900 text-bone-200' 
                    : member.role === 'Auditor'
                    ? 'bg-gold-500/20 text-bottle-900'
                    : 'bg-bone-400 text-bottle-900'
                }`}>
                  {member.role}
                </span>

                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {member.complianceScore}% Score
                </span>
              </div>

              <div className="text-center py-2">
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-16 h-16 rounded-2xl object-cover mx-auto ring-2 ring-bottle-800/20 shadow-sm"
                />
                <h3 className="text-base font-serif font-bold text-bottle-950 mt-2.5">
                  {member.name}
                </h3>
                <p className="text-[11px] text-bottle-800/60 font-mono mt-0.5">{member.phone}</p>
              </div>

              <div className="p-3 rounded-xl bg-bone-300/60 border border-bottle-800/10 space-y-1.5 text-xs mt-3">
                <div className="flex justify-between">
                  <span className="text-bottle-800/70">Payout Month:</span>
                  <span className="font-semibold text-bottle-950">
                    {member.assignedPayoutMonth ? `Month #${member.assignedPayoutMonth}` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-bottle-800/70">Contributed:</span>
                  <span className="font-semibold text-bottle-950">{formatINR(member.totalContributed)}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-bone-600 text-center text-[11px] font-semibold text-bottle-800 hover:text-crimson-700">
              View Profile & Ledger History
            </div>
          </div>
        ))}
      </div>

      {/* Member Profile Drawer Modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-bottle-950/60 backdrop-blur-sm animate-in fade-in">
          <div 
            className="w-full max-w-md h-full bg-white shadow-elevated border-l border-bottle-800/15 overflow-y-auto p-6 space-y-6 flex flex-col justify-between"
            onClick={e => e.stopPropagation()}
          >
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-bone-600">
                <span className="text-xs font-mono uppercase tracking-wider text-bottle-800/60">
                  Member Dossier
                </span>
                <button
                  onClick={() => setSelectedMember(null)}
                  className="p-1 rounded-lg text-bottle-800/60 hover:text-bottle-950 hover:bg-bone-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Profile Card */}
              <div className="pt-4 text-center space-y-3">
                <img
                  src={selectedMember.avatar}
                  alt={selectedMember.name}
                  className="w-20 h-20 rounded-2xl object-cover mx-auto ring-4 ring-bottle-800/10 shadow-md"
                />
                <div>
                  <h2 className="text-xl font-serif font-bold text-bottle-950">
                    {selectedMember.name}
                  </h2>
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-bottle-800 text-bone-200 mt-1">
                    {selectedMember.role}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-bottle-800/70">
                  <div className="flex items-center justify-center gap-1.5 font-mono">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{selectedMember.phone}</span>
                  </div>
                  <div className="flex items-center justify-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" />
                    <span>{selectedMember.email}</span>
                  </div>
                </div>
              </div>

              {/* Financial Metrics */}
              <div className="grid grid-cols-2 gap-3 pt-4">
                <div className="p-3.5 rounded-xl bg-bone-300 border border-bottle-800/10 text-xs">
                  <div className="text-bottle-800/70">Total Contributed</div>
                  <div className="text-base font-serif font-bold text-bottle-950 mt-0.5">
                    {formatINR(selectedMember.totalContributed)}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-bone-300 border border-bottle-800/10 text-xs">
                  <div className="text-bottle-800/70">Total Received</div>
                  <div className="text-base font-serif font-bold text-crimson-800 mt-0.5">
                    {formatINR(selectedMember.totalReceived)}
                  </div>
                </div>
              </div>

              {/* Compliance & Verification */}
              <div className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                <div className="flex items-center justify-between font-bold">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Consortium Identity Verified
                  </span>
                  <span>{selectedMember.complianceScore}% Score</span>
                </div>
                <div className="text-[11px] text-emerald-800 leading-relaxed">
                  Member has signed mutual ROSCA consent, verified Aadhaar/PAN record hashes, and maintains 100% on-time payment track record.
                </div>
              </div>

              {/* Recent Member Contributions */}
              <div className="mt-6 space-y-2">
                <h4 className="text-xs font-bold text-bottle-950 uppercase tracking-wider">
                  Payment History in Active Circles
                </h4>
                <div className="space-y-2">
                  {contributions
                    .filter(c => c.memberId === selectedMember.id)
                    .slice(0, 3)
                    .map(c => (
                      <div key={c.id} className="p-2.5 rounded-xl bg-bone-300/60 border border-bottle-800/10 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-semibold text-bottle-950">{c.monthName}</div>
                          <div className="text-[10px] text-bottle-800/60 font-mono">{c.transactionRef}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-bottle-950">{formatINR(c.amount)}</div>
                          <span className="text-[10px] text-emerald-700 font-semibold">{c.status}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-bone-600">
              <button
                onClick={() => setSelectedMember(null)}
                className="w-full py-2.5 rounded-xl bg-bottle-800 hover:bg-bottle-900 text-bone-200 text-xs font-semibold transition-colors"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
