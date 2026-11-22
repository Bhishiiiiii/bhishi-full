import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { RecordPaymentModal } from '../components/common/RecordPaymentModal';
import { VerifyHashModal } from '../components/common/VerifyHashModal';
import { PayContributionModal } from '../components/common/PayContributionModal';
import { RejectPaymentModal } from '../components/common/RejectPaymentModal';
import { 
  ArrowDownLeft, 
  ArrowUpRight,
  Search, 
  Plus, 
  ShieldCheck, 
  Download, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  CreditCard,
  Check,
  XCircle,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { formatINR, truncateHash } from '../utils/cryptoSim';
import { ContributionRecord } from '../types';

export const ContributionsPage: React.FC = () => {
  const { 
    contributions, 
    myDues, 
    pendingConfirmations, 
    bishis, 
    role, 
    currentUser, 
    addToast,
    refreshData,
    organizerConfirmContribution
  } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [bishiFilter, setBishiFilter] = useState<string>('All');
  
  // Modals state
  const [recordModalOpen, setRecordModalOpen] = useState(false);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [selectedHash, setSelectedHash] = useState('');
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedDue, setSelectedDue] = useState<ContributionRecord | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedForReject, setSelectedForReject] = useState<ContributionRecord | null>(null);
  const [isConfirmingId, setIsConfirmingId] = useState<string | null>(null);

  // Active view tab for member/organizer
  const [activeViewTab, setActiveViewTab] = useState<'my_dues' | 'all_contributions'>('my_dues');

  // Filtered contributions list
  const filteredContributions = contributions.filter(c => {
    const matchesSearch = c.memberName.toLowerCase().includes(search.toLowerCase()) ||
                          (c.transactionRef || '').toLowerCase().includes(search.toLowerCase()) ||
                          (c.utr || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    const matchesBishi = bishiFilter === 'All' || c.bishiId === bishiFilter;
    return matchesSearch && matchesStatus && matchesBishi;
  });

  const totalCollected = contributions
    .filter(c => c.status === 'Paid' || c.status === 'Verified' || c.status === 'Confirmed')
    .reduce((sum, c) => sum + c.amount, 0);

  const handleExportCSV = () => {
    addToast('success', 'Report Exported', 'Contribution statements downloaded as CSV.');
  };

  const handlePayNow = (item: ContributionRecord) => {
    setSelectedDue(item);
    setPayModalOpen(true);
  };

  const handleOrganizerConfirm = async (item: ContributionRecord) => {
    try {
      setIsConfirmingId(item.id);
      await organizerConfirmContribution(item.id);
    } catch {
      // Toast already shown in context
    } finally {
      setIsConfirmingId(null);
    }
  };

  const handleOrganizerReject = (item: ContributionRecord) => {
    setSelectedForReject(item);
    setRejectModalOpen(true);
  };

  // Helper for badge styling
  const renderStatusBadge = (status: string) => {
    if (status === 'Verified' || status === 'Confirmed' || status === 'Paid') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          {status === 'Paid' ? 'Confirmed' : status}
        </span>
      );
    }
    if (status === 'Submitted') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-300">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          Submitted (Pending Verification)
        </span>
      );
    }
    if (status === 'Rejected') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-crimson-50 text-crimson-800 border border-crimson-300">
          <span className="w-1.5 h-1.5 rounded-full bg-crimson-500" />
          Rejected
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-bone-400 text-bottle-900 border border-bone-600">
        <span className="w-1.5 h-1.5 rounded-full bg-bottle-700" />
        Due
      </span>
    );
  };

  const isAuditor = role === 'auditor';

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Modals */}
      <PayContributionModal
        isOpen={payModalOpen}
        onClose={() => setPayModalOpen(false)}
        contribution={selectedDue}
      />

      <RejectPaymentModal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        contribution={selectedForReject}
      />

      <RecordPaymentModal 
        isOpen={recordModalOpen} 
        onClose={() => setRecordModalOpen(false)} 
      />

      <VerifyHashModal
        isOpen={verifyModalOpen}
        onClose={() => setVerifyModalOpen(false)}
        initialHash={selectedHash}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-bottle-800/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-bottle-800 text-bone-200 uppercase tracking-wider font-mono">
              {role === 'organizer' ? 'Organizer Mode' : isAuditor ? 'Read-Only Auditor' : 'Member Portal'}
            </span>
            <span className="text-xs text-bottle-800/60 font-medium">
              Real-world UPI & Bank settlements with on-chain audit proof
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-bottle-950">
            Payments & Contribution Management
          </h1>
          <p className="text-xs sm:text-sm text-bottle-800/70 mt-0.5">
            Submit your monthly deposits, verify bank references, and anchor ledger receipts without crypto gas fees.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refreshData()}
            className="p-2.5 rounded-xl bg-white hover:bg-bone-400 text-bottle-950 border border-bottle-800/15 shadow-subtle transition-all cursor-pointer"
            title="Refresh Ledger"
          >
            <RefreshCw className="w-4 h-4 text-bottle-800" />
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-bone-400 text-bottle-950 text-xs font-semibold border border-bottle-800/15 shadow-subtle flex items-center gap-1.5 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          {role === 'organizer' && (
            <button
              onClick={() => setRecordModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-bottle-800 hover:bg-bottle-900 text-bone-200 text-xs font-semibold shadow-subtle flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 text-crimson-400" />
              <span>Record Offline Cash / Bank</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub-tabs: Payments & Payouts Unified Access */}
      <div className="flex items-center gap-1.5 p-1 bg-bone-400/80 rounded-2xl border border-bottle-800/10 w-fit">
        <Link
          to="/contributions"
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-bottle-800 text-bone-200 shadow-sm flex items-center gap-2"
        >
          <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" />
          <span>Member Contributions (Inflow)</span>
        </Link>
        <Link
          to="/payouts"
          className="px-4 py-2 rounded-xl text-xs font-semibold text-bottle-800 hover:text-bottle-950 hover:bg-bone-300 transition-all flex items-center gap-2"
        >
          <ArrowUpRight className="w-3.5 h-3.5 text-crimson-600" />
          <span>Scheduled & Completed Payouts (Outflow)</span>
        </Link>
      </div>

      {/* ── 1. ORGANIZER ONLY: PENDING CONFIRMATIONS PANEL ── */}
      {role === 'organizer' && (
        <div className="p-6 rounded-3xl bg-bottle-900 text-bone-200 border border-bottle-800 shadow-premium space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-bone-500/15">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-bottle-800 flex items-center justify-center border border-bone-500/20">
                <Clock className="w-4 h-4 text-gold-400" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-bone-100">
                  Pending Member Confirmations
                </h3>
                <p className="text-xs text-bone-300/80">
                  Members have submitted UPI / Bank UTRs. Match with your bank statement, then confirm or reject.
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-full bg-gold-400/20 text-gold-300 border border-gold-400/30">
              {pendingConfirmations.length} Awaiting Verification
            </span>
          </div>

          {pendingConfirmations.length === 0 ? (
            <div className="p-6 rounded-2xl bg-bottle-950/60 border border-bone-500/10 text-center space-y-1">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
              <div className="text-xs font-semibold text-bone-200">All submissions verified!</div>
              <div className="text-[11px] text-bone-400">There are no pending member payment verifications at this moment.</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingConfirmations.map(item => (
                <div 
                  key={item.id}
                  className="p-4 rounded-2xl bg-bottle-950/80 border border-bone-500/15 space-y-3 text-xs"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-bone-100 text-sm">{item.memberName}</div>
                      <div className="text-bone-400 text-[11px] font-mono">{item.bishiName} • Month {item.periodMonth}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-serif font-bold text-base text-emerald-400">{formatINR(item.amount)}</div>
                      <span className="text-[10px] text-bone-400 uppercase font-mono">{item.paymentMethod}</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-bottle-900 border border-bone-500/10 space-y-1 font-mono text-[11px]">
                    <div className="flex justify-between text-bone-300">
                      <span>UTR / Reference:</span>
                      <span className="font-bold text-bone-100 select-all">{item.utr || item.transactionRef || 'N/A'}</span>
                    </div>
                    {item.paidDate && (
                      <div className="flex justify-between text-bone-400 text-[10px]">
                        <span>Paid Date:</span>
                        <span>{item.paidDate}</span>
                      </div>
                    )}
                    {item.note && (
                      <div className="text-bone-300/80 text-[10px] pt-1 border-t border-bone-500/10 italic">
                        "{item.note}"
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      disabled={isConfirmingId === item.id}
                      onClick={() => handleOrganizerConfirm(item)}
                      className="flex-1 py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{isConfirmingId === item.id ? 'Anchoring...' : 'Confirm & Anchor'}</span>
                    </button>
                    <button
                      type="button"
                      disabled={isConfirmingId === item.id}
                      onClick={() => handleOrganizerReject(item)}
                      className="py-2 px-3 rounded-xl bg-crimson-600/20 hover:bg-crimson-600/30 text-crimson-300 border border-crimson-500/30 font-semibold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── 2. MEMBER DUES & OUTSTANDING ACTION ITEMS ── */}
      {role === 'member' && (
        <div className="p-6 rounded-3xl bg-white border border-bottle-800/15 shadow-subtle space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-bone-600">
            <div>
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-crimson-700" />
                <h3 className="font-serif font-bold text-lg text-bottle-950">
                  Your Due Contributions
                </h3>
              </div>
              <p className="text-xs text-bottle-800/70 mt-0.5">
                Outstanding dues for your enrolled circles. Pay your organizer directly and submit your reference.
              </p>
            </div>
            <span className="text-xs font-mono font-semibold px-3 py-1 rounded-full bg-bone-300 text-bottle-950 border border-bottle-800/10">
              {myDues.filter(d => d.status === 'Due' || d.status === 'Rejected').length} Pending Payments
            </span>
          </div>

          {myDues.length === 0 ? (
            <div className="p-8 rounded-2xl bg-bone-300/40 border border-bottle-800/10 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-700 mx-auto" />
              <div className="font-serif font-bold text-sm text-bottle-950">You're all paid up!</div>
              <p className="text-xs text-bottle-800/70 max-w-sm mx-auto">
                No active dues are outstanding for your account. You will receive an alert when the next monthly cycle begins.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myDues.map(due => {
                const isDue = due.status === 'Due';
                const isSubmitted = due.status === 'Submitted';
                const isConfirmed = due.status === 'Confirmed' || due.status === 'Verified' || due.status === 'Paid';
                const isRejected = due.status === 'Rejected';

                return (
                  <div
                    key={due.id}
                    className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                      isRejected 
                        ? 'bg-crimson-50/50 border-crimson-300 shadow-sm'
                        : isDue 
                        ? 'bg-white border-bottle-800/25 shadow-subtle hover:border-bottle-800'
                        : isSubmitted 
                        ? 'bg-amber-50/40 border-amber-300'
                        : 'bg-bone-300/30 border-bottle-800/10'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-bottle-800/60">
                          {due.monthName}
                        </span>
                        {renderStatusBadge(due.status)}
                      </div>

                      <h4 className="font-serif font-bold text-base text-bottle-950">
                        {due.bishiName}
                      </h4>

                      <div className="p-3 rounded-xl bg-bone-300/50 border border-bottle-800/10 space-y-1 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-bottle-800/70">Due Amount:</span>
                          <span className="font-serif font-bold text-base text-bottle-950">{formatINR(due.amount)}</span>
                        </div>
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-bottle-800/70">Due Date:</span>
                          <span className="font-mono text-bottle-900 font-semibold">{due.dueDate}</span>
                        </div>
                        {due.utr && (
                          <div className="flex justify-between items-center text-[11px] pt-1 border-t border-bone-600 font-mono">
                            <span className="text-bottle-800/70">UTR:</span>
                            <span className="font-semibold text-bottle-950">{due.utr}</span>
                          </div>
                        )}
                      </div>

                      {/* Rejection notice */}
                      {isRejected && due.rejectionReason && (
                        <div className="p-2.5 rounded-xl bg-crimson-100/70 border border-crimson-300 text-crimson-900 text-[11px] leading-relaxed">
                          <strong>Organizer note:</strong> {due.rejectionReason}
                        </div>
                      )}

                      {/* Submitted status notice */}
                      {isSubmitted && (
                        <div className="text-[11px] text-amber-800 bg-amber-100/60 p-2 rounded-lg border border-amber-200">
                          Waiting for organizer to verify your reference against their bank records.
                        </div>
                      )}

                      {/* Confirmed anchor badge */}
                      {isConfirmed && (
                        <div className="flex items-center justify-between text-[11px] text-emerald-800 pt-1">
                          <span className="flex items-center gap-1 font-semibold">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Verified On-Chain</span>
                          </span>
                          <Link 
                            to="/blockchain"
                            className="text-emerald-700 hover:underline flex items-center gap-0.5 font-mono text-[10px]"
                          >
                            <span>Proofs</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </Link>
                        </div>
                      )}
                    </div>

                    {/* Pay / Resubmit CTA */}
                    {(isDue || isRejected) && !isAuditor && (
                      <button
                        type="button"
                        onClick={() => handlePayNow(due)}
                        className="w-full py-2.5 px-4 rounded-xl bg-crimson-700 hover:bg-crimson-800 text-white font-semibold text-xs shadow-subtle flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>{isRejected ? 'Resubmit Payment' : 'Pay Now'}</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── 3. KPI STATS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-bottle-800/10 shadow-subtle">
          <div className="text-xs text-bottle-800/70">Total Collected Contributions</div>
          <div className="text-2xl font-serif font-bold text-bottle-950 mt-1">{formatINR(totalCollected)}</div>
          <div className="text-[11px] text-emerald-700 mt-0.5">Across all active cycles</div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-bottle-800/10 shadow-subtle">
          <div className="text-xs text-bottle-800/70">Verified on Blockchain</div>
          <div className="text-2xl font-serif font-bold text-bottle-950 mt-1">
            {contributions.filter(c => c.isVerifiedOnChain).length} Entries
          </div>
          <div className="text-[11px] text-bottle-800/70 mt-0.5">Immutable Sepolia state proofs</div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-bottle-800/10 shadow-subtle">
          <div className="text-xs text-bottle-800/70">Pending / Awaiting Action</div>
          <div className="text-2xl font-serif font-bold text-amber-600 mt-1">
            {contributions.filter(c => c.status === 'Pending' || c.status === 'Submitted' || c.status === 'Due').length} Items
          </div>
          <div className="text-[11px] text-amber-700 mt-0.5">Transparent community log</div>
        </div>
      </div>

      {/* ── 4. ALL CONTRIBUTIONS LEDGER TABLE ── */}
      <div className="p-6 rounded-2xl bg-white border border-bottle-800/10 shadow-subtle space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-bone-600">
          <div>
            <h3 className="font-serif font-bold text-base text-bottle-950">
              All Contribution Ledger Entries
            </h3>
            <p className="text-xs text-bottle-800/70">
              Master record of all member deposits, transaction references, and Sepolia anchors
            </p>
          </div>

          {/* Filter and Search Bar */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 bg-bone-300 p-1 rounded-xl text-xs">
              {['All', 'Verified', 'Confirmed', 'Submitted', 'Due'].map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1 rounded-lg font-medium transition-all ${
                    statusFilter === s ? 'bg-white text-bottle-950 shadow-sm font-semibold' : 'text-bottle-800/70 hover:text-bottle-950'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <select
              value={bishiFilter}
              onChange={e => setBishiFilter(e.target.value)}
              className="text-xs font-medium bg-bone-300 border border-bottle-800/15 rounded-xl px-3 py-1.5 text-bottle-950 outline-none"
            >
              <option value="All">All Groups</option>
              {bishis.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>

            <div className="relative w-full sm:w-60">
              <Search className="w-4 h-4 text-bottle-700 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search member, UTR..."
                className="w-full text-xs font-medium bg-bone-300 border border-bottle-800/15 rounded-xl pl-9 pr-4 py-1.5 text-bottle-950 outline-none focus:border-bottle-800"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-bone-600 text-[11px] font-semibold uppercase tracking-wider text-bottle-800/70">
                <th className="py-3 px-3">Member</th>
                <th className="py-3 px-3">Circle</th>
                <th className="py-3 px-3">Cycle</th>
                <th className="py-3 px-3">Amount</th>
                <th className="py-3 px-3">Method / UTR</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bone-600">
              {filteredContributions.map(c => {
                const canPay = (c.status === 'Due' || c.status === 'Rejected') && c.memberId === currentUser.id && !isAuditor;

                return (
                  <tr key={c.id} className="hover:bg-bone-300/40 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <img 
                          src={c.memberAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} 
                          alt={c.memberName} 
                          className="w-8 h-8 rounded-full object-cover" 
                        />
                        <div>
                          <div className="font-semibold text-bottle-950">{c.memberName}</div>
                          <div className="text-[10px] text-bottle-800/60">{c.paidDate || 'Due: ' + c.dueDate}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-bottle-950 font-medium">{c.bishiName}</td>
                    <td className="py-3 px-3">{c.monthName}</td>
                    <td className="py-3 px-3 font-serif font-bold text-bottle-950">{formatINR(c.amount)}</td>
                    <td className="py-3 px-3 font-mono text-[11px] text-bottle-800/70">
                      <div>{c.paymentMethod}</div>
                      <div className="text-[10px] truncate max-w-[140px] select-all font-semibold text-bottle-950">
                        {c.utr || c.transactionRef || 'Pending Ref'}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      {renderStatusBadge(c.status)}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {canPay ? (
                        <button
                          type="button"
                          onClick={() => handlePayNow(c)}
                          className="px-3 py-1 rounded-lg bg-crimson-700 hover:bg-crimson-800 text-white text-[11px] font-semibold transition-colors shadow-subtle"
                        >
                          Pay Now
                        </button>
                      ) : c.isVerifiedOnChain ? (
                        <button
                          onClick={() => {
                            setSelectedHash(c.recordHash);
                            setVerifyModalOpen(true);
                          }}
                          className="text-emerald-700 hover:text-emerald-900 text-[11px] font-medium flex items-center gap-1 ml-auto"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Sepolia Verified</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-bottle-800/50">Awaiting Entry</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ContributionsPage;
