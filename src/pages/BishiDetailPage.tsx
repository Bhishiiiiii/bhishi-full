import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { CommunityCircle3D } from '../components/3d/CommunityCircle3D';
import { RecordPaymentModal } from '../components/common/RecordPaymentModal';
import { InviteMemberModal } from '../components/common/InviteMemberModal';
import { VerifyHashModal } from '../components/common/VerifyHashModal';
import { 
  Users, 
  ArrowDownLeft, 
  ArrowUpRight, 
  History, 
  FileText, 
  ShieldCheck, 
  Settings, 
  LayoutDashboard,
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  ExternalLink,
  Copy,
  AlertCircle,
  FileCheck
} from 'lucide-react';
import { formatINR, truncateHash } from '../utils/cryptoSim';

export const BishiDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { 
    role, 
    bishis, 
    members, 
    contributions, 
    payouts, 
    ledgerEvents, 
    documents, 
    confirmPayout, 
    verifyContributionOnChain,
    addToast 
  } = useApp();

  const bishi = bishis.find(b => b.id === id) || bishis[0];

  const [activeTab, setActiveTab] = useState<
    'overview' | 'members' | 'contributions' | 'payouts' | 'ledger' | 'documents' | 'blockchain' | 'settings'
  >('overview');

  const [recordPaymentModalOpen, setRecordPaymentModalOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [verifyHashModalOpen, setVerifyHashModalOpen] = useState(false);
  const [selectedHashForVerification, setSelectedHashForVerification] = useState('');

  // Group-specific records
  const groupContributions = contributions.filter(c => c.bishiId === bishi.id);
  const groupPayouts = payouts.filter(p => p.bishiId === bishi.id);
  const groupEvents = ledgerEvents.filter(e => e.bishiId === bishi.id);
  const groupDocs = documents.filter(d => d.bishiId === bishi.id);

  const tabs = [
    { key: 'overview', label: 'Overview', icon: LayoutDashboard },
    { key: 'members', label: `Members (${bishi.totalMembers})`, icon: Users },
    { key: 'contributions', label: 'Contributions', icon: ArrowDownLeft },
    { key: 'payouts', label: 'Payout Schedule', icon: ArrowUpRight },
    { key: 'ledger', label: 'Shared Ledger', icon: History },
    { key: 'documents', label: 'Documents', icon: FileText },
    { key: 'blockchain', label: 'Blockchain Proofs', icon: ShieldCheck },
    { key: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Modals */}
      <RecordPaymentModal 
        isOpen={recordPaymentModalOpen}
        onClose={() => setRecordPaymentModalOpen(false)}
        preselectedBishiId={bishi.id}
      />

      <InviteMemberModal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        bishiId={bishi.id}
      />

      <VerifyHashModal
        isOpen={verifyHashModalOpen}
        onClose={() => setVerifyHashModalOpen(false)}
        initialHash={selectedHashForVerification}
      />

      {/* 1. Group Header Card */}
      <div className="p-6 md:p-8 rounded-3xl bg-bottle-900 text-bone-200 border border-bone-500/20 shadow-premium relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-bottle-800 text-bone-300 border border-bone-500/20">
                {bishi.category}
              </span>
              <span className="text-xs font-medium text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                {bishi.status}
              </span>
              <span className="text-xs text-bone-400 font-mono hidden sm:inline-block">
                Rules Hash: {truncateHash(bishi.rulesHash, 4)}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-bone-100">
              {bishi.name}
            </h1>
            <p className="text-xs sm:text-sm text-bone-300/80 max-w-2xl font-light leading-relaxed">
              {bishi.description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {role === 'organizer' && (
              <button
                onClick={() => setRecordPaymentModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-bone-200 hover:bg-white text-bottle-950 text-xs font-semibold shadow-subtle flex items-center gap-2 transition-all"
              >
                <Plus className="w-4 h-4 text-crimson-700" />
                <span>Record Payment</span>
              </button>
            )}
            <button
              onClick={() => setInviteModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-bottle-800 hover:bg-bottle-700 text-bone-200 text-xs font-semibold border border-bone-500/20 flex items-center gap-1.5 transition-all"
            >
              <Users className="w-4 h-4" />
              <span>Invite</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Bar inside header */}
        <div className="mt-6 pt-6 border-t border-bone-500/15 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <div className="text-bone-400 text-[11px]">Monthly Contribution</div>
            <div className="text-lg font-serif font-bold text-bone-100">{formatINR(bishi.monthlyContribution)}</div>
          </div>
          <div>
            <div className="text-bone-400 text-[11px]">Monthly Payout Pool</div>
            <div className="text-lg font-serif font-bold text-gold-400">{formatINR(bishi.totalPoolPerMonth)}</div>
          </div>
          <div>
            <div className="text-bone-400 text-[11px]">Progress</div>
            <div className="text-lg font-serif font-bold text-bone-100">Month {bishi.currentMonth}/{bishi.durationMonths}</div>
          </div>
          <div>
            <div className="text-bone-400 text-[11px]">Payout Rule</div>
            <div className="text-sm font-semibold text-crimson-300">{bishi.payoutRule}</div>
          </div>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-bottle-800/10 text-xs font-semibold">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
                isActive 
                  ? 'bg-bottle-800 text-bone-200 shadow-sm' 
                  : 'text-bottle-800/70 hover:text-bottle-950 hover:bg-bone-400/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Tab Contents */}

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Interactive 3D Community Circle */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-base font-serif font-bold text-bottle-950">3D Community Savings Circle</h3>
                <p className="text-xs text-bottle-800/70">Interactive member nodes connected to the central rotating pool</p>
              </div>
              <span className="text-xs font-mono bg-bone-400 px-2 py-1 rounded text-bottle-900">
                Next Payout: {bishi.nextPayoutRecipient}
              </span>
            </div>
            <CommunityCircle3D bishi={bishi} members={members} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Next Scheduled Payout Card */}
            <div className="p-6 rounded-2xl bg-white border border-bottle-800/10 shadow-subtle space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-bone-600">
                <span className="text-xs font-bold text-bottle-950 uppercase tracking-wider font-mono">
                  Upcoming Payout Milestone
                </span>
                <span className="text-xs font-semibold text-crimson-700 bg-crimson-50 px-2.5 py-0.5 rounded-full border border-crimson-200">
                  {bishi.nextPayoutDate}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <img
                  src="https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150"
                  alt="Recipient"
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-crimson-600/30"
                />
                <div>
                  <div className="text-lg font-serif font-bold text-bottle-950">{bishi.nextPayoutRecipient}</div>
                  <div className="text-xs text-bottle-800/70">Assigned Payout Recipient (Month 7)</div>
                  <div className="text-sm font-bold text-bottle-900 mt-1 font-mono">
                    Pool Amount: {formatINR(bishi.totalPoolPerMonth)}
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-bone-300 text-xs text-bottle-800/80 leading-relaxed">
                Agreed in initial charter. Upon collection of all 10 member contributions, organizer executes bank settlement and uploads verification receipt.
              </div>
            </div>

            {/* Quick Rules & Governance */}
            <div className="p-6 rounded-2xl bg-white border border-bottle-800/10 shadow-subtle space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-bone-600">
                <span className="text-xs font-bold text-bottle-950 uppercase tracking-wider font-mono">
                  Rules & Trust Layer
                </span>
                <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Immutable
                </span>
              </div>

              <div className="space-y-2 text-xs text-bottle-800/80">
                <div className="flex justify-between py-1 border-b border-bone-600">
                  <span>Payout Mechanism:</span>
                  <span className="font-semibold text-bottle-950">{bishi.payoutRule}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-bone-600">
                  <span>Bidding or Auction Discount:</span>
                  <span className="font-semibold text-emerald-700">0% (Strictly Non-Auction)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-bone-600">
                  <span>Smart Contract Digest:</span>
                  <span className="font-mono text-bottle-950">{truncateHash(bishi.contractAddress, 6)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Last Blockchain Anchor:</span>
                  <span className="font-semibold text-bottle-950">Block #1894201</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedHashForVerification(bishi.rulesHash);
                  setVerifyHashModalOpen(true);
                }}
                className="w-full py-2.5 rounded-xl bg-bone-400 hover:bg-bone-500 text-bottle-950 text-xs font-semibold border border-bottle-800/10 transition-colors flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4 text-bottle-800" />
                <span>Verify Group Charter Hash</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MEMBERS */}
      {activeTab === 'members' && (
        <div className="p-6 rounded-2xl bg-white border border-bottle-800/10 shadow-subtle space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-bone-600">
            <div>
              <h3 className="text-base font-serif font-bold text-bottle-950">Enrolled Member Directory</h3>
              <p className="text-xs text-bottle-800/70">All participants in {bishi.name}</p>
            </div>
            <button
              onClick={() => setInviteModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-bottle-800 hover:bg-bottle-900 text-bone-200 text-xs font-semibold flex items-center gap-1.5 self-start"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Invite New Member</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-bone-600 text-[11px] font-semibold uppercase tracking-wider text-bottle-800/70">
                  <th className="py-3 px-3">Member</th>
                  <th className="py-3 px-3">Role</th>
                  <th className="py-3 px-3">Payout Month</th>
                  <th className="py-3 px-3">Contributed</th>
                  <th className="py-3 px-3">Compliance</th>
                  <th className="py-3 px-3">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bone-600">
                {members.map(m => (
                  <tr key={m.id} className="hover:bg-bone-300/40 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <img src={m.avatar} alt={m.name} className="w-8 h-8 rounded-full object-cover" />
                        <div>
                          <div className="font-semibold text-bottle-950">{m.name}</div>
                          <div className="text-[11px] text-bottle-800/60 font-mono">{m.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                        m.role === 'Organizer' ? 'bg-bottle-900 text-bone-200' : 'bg-bone-400 text-bottle-900'
                      }`}>
                        {m.role}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-medium">
                      {m.assignedPayoutMonth ? (
                        <span className="text-bottle-950 font-semibold">Month #{m.assignedPayoutMonth}</span>
                      ) : (
                        <span className="text-bottle-800/50">Observer</span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-semibold text-bottle-950">
                      {formatINR(m.totalContributed)}
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-emerald-700 font-semibold">{m.complianceScore}%</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Verified</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CONTRIBUTIONS */}
      {activeTab === 'contributions' && (
        <div className="p-6 rounded-2xl bg-white border border-bottle-800/10 shadow-subtle space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-bone-600">
            <div>
              <h3 className="text-base font-serif font-bold text-bottle-950">Monthly Contributions Log</h3>
              <p className="text-xs text-bottle-800/70">Period payments with verified reference vouchers</p>
            </div>
            {role === 'organizer' && (
              <button
                onClick={() => setRecordPaymentModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-bottle-800 hover:bg-bottle-900 text-bone-200 text-xs font-semibold flex items-center gap-1.5 self-start"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Record Payment</span>
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-bone-600 text-[11px] font-semibold uppercase tracking-wider text-bottle-800/70">
                  <th className="py-3 px-3">Member</th>
                  <th className="py-3 px-3">Month</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-3">Channel / Ref</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bone-600">
                {groupContributions.map(c => (
                  <tr key={c.id} className="hover:bg-bone-300/40 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <img src={c.memberAvatar} alt={c.memberName} className="w-7 h-7 rounded-full object-cover" />
                        <span className="font-semibold text-bottle-950">{c.memberName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">{c.monthName}</td>
                    <td className="py-3 px-3 font-semibold text-bottle-950">{formatINR(c.amount)}</td>
                    <td className="py-3 px-3 font-mono text-[11px] text-bottle-800/70">
                      {c.transactionRef || 'Pending Submission'}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                        c.status === 'Verified' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                        c.status === 'Paid' ? 'bg-blue-100 text-blue-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {c.status === 'Paid' && !c.isVerifiedOnChain && role === 'organizer' && (
                        <button
                          onClick={() => verifyContributionOnChain(c.id)}
                          className="px-2.5 py-1 bg-bottle-800 hover:bg-bottle-900 text-bone-200 rounded-lg text-[11px] font-medium transition-colors"
                        >
                          Anchor on Chain
                        </button>
                      )}
                      {c.isVerifiedOnChain && (
                        <button
                          onClick={() => {
                            setSelectedHashForVerification(c.recordHash);
                            setVerifyHashModalOpen(true);
                          }}
                          className="text-emerald-700 hover:text-emerald-900 text-[11px] font-medium flex items-center gap-1 ml-auto"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>View Proof</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: PAYOUT SCHEDULE */}
      {activeTab === 'payouts' && (
        <div className="p-6 rounded-2xl bg-white border border-bottle-800/10 shadow-subtle space-y-4">
          <div className="pb-3 border-b border-bone-600">
            <h3 className="text-base font-serif font-bold text-bottle-950">Agreed Non-Auction Payout Rotation</h3>
            <p className="text-xs text-bottle-800/70">
              Predetermined payout sequence agreed by all members before cycle commencement
            </p>
          </div>

          <div className="space-y-3">
            {groupPayouts.map(p => (
              <div 
                key={p.id}
                className="p-4 rounded-2xl bg-bone-300/40 border border-bottle-800/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-bottle-900 text-bone-200 font-serif font-bold text-base flex items-center justify-center flex-shrink-0">
                    M{p.monthNumber}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-bottle-950 flex items-center gap-2">
                      <span>{p.recipientName}</span>
                      <span className="text-[10px] text-bottle-800/60 font-normal">({p.monthName})</span>
                    </div>
                    <div className="text-xs text-bottle-800/70 mt-0.5">
                      Scheduled Date: {p.scheduledDate} {p.actualDate && `• Settled: ${p.actualDate}`}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-auto">
                  <div className="text-right">
                    <div className="text-base font-serif font-bold text-bottle-950">{formatINR(p.amount)}</div>
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${
                      p.status === 'Verified' ? 'bg-emerald-100 text-emerald-800' :
                      p.status === 'Upcoming' ? 'bg-amber-100 text-amber-800' :
                      'bg-bottle-800 text-bone-200'
                    }`}>
                      {p.status}
                    </span>
                  </div>

                  {p.status === 'Upcoming' && role === 'organizer' && (
                    <button
                      onClick={() => confirmPayout(p.id)}
                      className="px-3 py-1.5 rounded-xl bg-crimson-700 hover:bg-crimson-800 text-bone-100 text-xs font-semibold shadow-subtle transition-all"
                    >
                      Confirm Payout
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: SHARED LEDGER */}
      {activeTab === 'ledger' && (
        <div className="p-6 rounded-2xl bg-white border border-bottle-800/10 shadow-subtle space-y-4">
          <div className="pb-3 border-b border-bone-600">
            <h3 className="text-base font-serif font-bold text-bottle-950">Chronological Shared Ledger</h3>
            <p className="text-xs text-bottle-800/70">Cryptographic audit log of all events inside {bishi.name}</p>
          </div>

          <div className="space-y-3">
            {groupEvents.map(evt => (
              <div 
                key={evt.id}
                className="p-4 rounded-xl bg-bone-300/40 border border-bottle-800/10 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-bottle-950">{evt.eventType}</span>
                  <span className="text-bottle-800/60 font-mono text-[10px]">{evt.timestamp}</span>
                </div>
                <p className="text-bottle-800/80 leading-relaxed">{evt.description}</p>
                <div className="flex flex-wrap items-center justify-between pt-2 border-t border-bone-600 font-mono text-[10px] text-bottle-800/70 gap-2">
                  <span>Actor: {evt.actor.name} ({evt.actor.role})</span>
                  <span className="text-emerald-700 font-semibold">
                    Hash: {truncateHash(evt.recordHash, 6)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: DOCUMENTS */}
      {activeTab === 'documents' && (
        <div className="p-6 rounded-2xl bg-white border border-bottle-800/10 shadow-subtle space-y-4">
          <div className="pb-3 border-b border-bone-600">
            <h3 className="text-base font-serif font-bold text-bottle-950">Group Charter & Document Vault</h3>
            <p className="text-xs text-bottle-800/70">Archived mutual agreements, payout rules, and auditor reports</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {groupDocs.map(doc => (
              <div key={doc.id} className="p-4 rounded-2xl bg-bone-300/50 border border-bottle-800/10 space-y-3 text-xs">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-bottle-800 text-bone-200 flex items-center justify-center">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-bottle-950">{doc.title}</h4>
                      <span className="text-[10px] text-bottle-800/60">{doc.category} • {doc.fileSize}</span>
                    </div>
                  </div>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-semibold">
                    Anchored
                  </span>
                </div>

                <div className="p-2 rounded-lg bg-white border border-bottle-800/10 font-mono text-[10px] text-bottle-900 truncate">
                  SHA-256: {doc.sha256Hash}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-bottle-800/60">Uploaded by {doc.uploadedBy}</span>
                  <button
                    onClick={() => {
                      setSelectedHashForVerification(doc.sha256Hash);
                      setVerifyHashModalOpen(true);
                    }}
                    className="text-bottle-800 hover:text-crimson-700 font-semibold text-[11px]"
                  >
                    Check Integrity
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: BLOCKCHAIN */}
      {activeTab === 'blockchain' && (
        <div className="p-6 rounded-2xl bg-bottle-900 text-bone-200 border border-bone-500/20 shadow-premium space-y-6">
          <div className="pb-3 border-b border-bone-500/15">
            <span className="text-[10px] font-mono uppercase tracking-widest text-bone-400 block mb-1">
              Consortium Verification Proofs
            </span>
            <h3 className="text-xl font-serif font-bold text-bone-100">Smart Contract Anchor State</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-bottle-950/80 border border-bone-500/10 space-y-2">
              <span className="text-bone-400 text-[11px]">Contract Address</span>
              <div className="font-mono text-bone-100 break-all">{bishi.contractAddress}</div>
            </div>
            <div className="p-4 rounded-xl bg-bottle-950/80 border border-bone-500/10 space-y-2">
              <span className="text-bone-400 text-[11px]">Rules Digest (Root)</span>
              <div className="font-mono text-gold-400 break-all">{bishi.rulesHash}</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-bone-500/10 border border-bone-500/15 text-xs text-bone-300 leading-relaxed">
            <strong>Consensus Guarantee:</strong> This smart contract anchors the group rules, payout sequence, and periodic contribution digests. Once deployed, the central organizer cannot modify past records without causing a cryptographic state fork.
          </div>
        </div>
      )}

      {/* TAB 8: SETTINGS */}
      {activeTab === 'settings' && (
        <div className="p-6 rounded-2xl bg-white border border-bottle-800/10 shadow-subtle space-y-4">
          <div className="pb-3 border-b border-bone-600">
            <h3 className="text-base font-serif font-bold text-bottle-950">Group Governance & Administration</h3>
            <p className="text-xs text-bottle-800/70">Organizer rules and emergency protections</p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-bone-300/60 border border-bottle-800/10 flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-bottle-950">Emergency Group Pause</h4>
                <p className="text-bottle-800/70 text-[11px]">Temporarily suspend contribution collection in case of dispute</p>
              </div>
              <button className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold">
                Pause Group
              </button>
            </div>

            <div className="p-4 rounded-xl bg-bone-300/60 border border-bottle-800/10 flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-bottle-950">Export Complete Audit Dossier</h4>
                <p className="text-bottle-800/70 text-[11px]">Download cryptographically countersigned PDF statement</p>
              </div>
              <button 
                onClick={() => addToast('info', 'Dossier Downloaded', 'Audit report saved.')}
                className="px-3.5 py-1.5 rounded-lg bg-bottle-800 hover:bg-bottle-900 text-bone-200 font-semibold"
              >
                Export Audit PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
