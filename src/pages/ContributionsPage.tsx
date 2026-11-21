import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { RecordPaymentModal } from '../components/common/RecordPaymentModal';
import { VerifyHashModal } from '../components/common/VerifyHashModal';
import { 
  ArrowDownLeft, 
  Search, 
  Filter, 
  Plus, 
  ShieldCheck, 
  Download, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  FileText
} from 'lucide-react';
import { formatINR, truncateHash } from '../utils/cryptoSim';

export const ContributionsPage: React.FC = () => {
  const { contributions, bishis, members, verifyContributionOnChain, role, addToast } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [bishiFilter, setBishiFilter] = useState<string>('All');
  const [recordModalOpen, setRecordModalOpen] = useState(false);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [selectedHash, setSelectedHash] = useState('');

  const filteredContributions = contributions.filter(c => {
    const matchesSearch = c.memberName.toLowerCase().includes(search.toLowerCase()) ||
                          c.transactionRef.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    const matchesBishi = bishiFilter === 'All' || c.bishiId === bishiFilter;
    return matchesSearch && matchesStatus && matchesBishi;
  });

  const totalCollected = contributions
    .filter(c => c.status === 'Paid' || c.status === 'Verified')
    .reduce((sum, c) => sum + c.amount, 0);

  const handleExportCSV = () => {
    addToast('success', 'Report Exported', 'Contribution statements downloaded as CSV.');
  };

  return (
    <div className="space-y-6 animate-in fade-in">
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
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-bottle-950">
            Contribution Management
          </h1>
          <p className="text-xs sm:text-sm text-bottle-800/70 mt-0.5">
            Track member monthly deposits, verify bank references, and anchor ledger receipts.
          </p>
        </div>

        <div className="flex items-center gap-3">
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
              className="px-4 py-2.5 rounded-xl bg-bottle-800 hover:bg-bottle-900 text-bone-200 text-xs font-semibold shadow-subtle flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4 text-crimson-400" />
              <span>Record Payment</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats */}
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
          <div className="text-[11px] text-bottle-800/70 mt-0.5">Immutable state proofs</div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-bottle-800/10 shadow-subtle">
          <div className="text-xs text-bottle-800/70">Pending / Late Reminders</div>
          <div className="text-2xl font-serif font-bold text-amber-600 mt-1">
            {contributions.filter(c => c.status === 'Pending' || c.status === 'Late').length} Members
          </div>
          <div className="text-[11px] text-amber-700 mt-0.5">WhatsApp alerts dispatched</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-bottle-800/10 shadow-subtle flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-bone-300 p-1 rounded-xl text-xs">
            {['All', 'Verified', 'Paid', 'Pending'].map(s => (
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

          {/* Group Filter */}
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
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-bottle-700 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search member, UTR reference..."
            className="w-full text-xs font-medium bg-bone-300 border border-bottle-800/15 rounded-xl pl-9 pr-4 py-1.5 text-bottle-950 outline-none focus:border-bottle-800"
          />
        </div>
      </div>

      {/* Table */}
      <div className="p-6 rounded-2xl bg-white border border-bottle-800/10 shadow-subtle">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-bone-600 text-[11px] font-semibold uppercase tracking-wider text-bottle-800/70">
                <th className="py-3 px-3">Member</th>
                <th className="py-3 px-3">Bishi Group</th>
                <th className="py-3 px-3">Cycle Month</th>
                <th className="py-3 px-3">Amount</th>
                <th className="py-3 px-3">Channel / UTR</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Blockchain State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bone-600">
              {filteredContributions.map(c => (
                <tr key={c.id} className="hover:bg-bone-300/40 transition-colors">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2.5">
                      <img src={c.memberAvatar} alt={c.memberName} className="w-8 h-8 rounded-full object-cover" />
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
                    <div className="text-[10px] truncate max-w-[140px]">{c.transactionRef || 'Pending Ref'}</div>
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
                    {c.isVerifiedOnChain ? (
                      <button
                        onClick={() => {
                          setSelectedHash(c.recordHash);
                          setVerifyModalOpen(true);
                        }}
                        className="text-emerald-700 hover:text-emerald-900 text-[11px] font-medium flex items-center gap-1 ml-auto"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Verified Anchor</span>
                      </button>
                    ) : c.status === 'Paid' && role === 'organizer' ? (
                      <button
                        onClick={() => verifyContributionOnChain(c.id)}
                        className="px-2.5 py-1 bg-bottle-800 hover:bg-bottle-900 text-bone-200 rounded-lg text-[11px] font-medium transition-colors"
                      >
                        Anchor on Chain
                      </button>
                    ) : (
                      <span className="text-[11px] text-bottle-800/50">Awaiting Entry</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
