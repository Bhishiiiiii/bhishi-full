import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { PayoutRecord } from '../types';
import { 
  ArrowUpRight, 
  ArrowDownLeft,
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Upload, 
  FileText,
  AlertCircle
} from 'lucide-react';
import { formatINR } from '../utils/cryptoSim';

export const PayoutsPage: React.FC = () => {
  const { payouts, confirmPayout, role, addToast } = useApp();
  const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'completed'>('all');

  const filteredPayouts = payouts.filter(p => {
    if (activeTab === 'upcoming') return p.status === 'Upcoming' || p.status === 'Awaiting Confirmation';
    if (activeTab === 'completed') return p.status === 'Verified' || p.status === 'Recipient Confirmed';
    return true;
  });

  const totalDistributed = payouts
    .filter(p => p.status === 'Verified' || p.status === 'Recipient Confirmed')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-bottle-800/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-bottle-950">
            Payout Schedule & Milestones
          </h1>
          <p className="text-xs sm:text-sm text-bottle-800/70 mt-0.5">
            Transparent rotating disbursements according to agreed non-auction schedules.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-bone-300 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'all' ? 'bg-white text-bottle-950 shadow-sm font-bold' : 'text-bottle-800/70 hover:text-bottle-950'
            }`}
          >
            All Milestones
          </button>
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'upcoming' ? 'bg-white text-bottle-950 shadow-sm font-bold' : 'text-bottle-800/70 hover:text-bottle-950'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'completed' ? 'bg-white text-bottle-950 shadow-sm font-bold' : 'text-bottle-800/70 hover:text-bottle-950'
            }`}
          >
            Completed
          </button>
        </div>
      </div>

      {/* Sub-tabs: Payments & Payouts Unified Access */}
      <div className="flex items-center gap-1.5 p-1 bg-bone-400/80 rounded-2xl border border-bottle-800/10 w-fit">
        <Link
          to="/contributions"
          className="px-4 py-2 rounded-xl text-xs font-semibold text-bottle-800 hover:text-bottle-950 hover:bg-bone-300 transition-all flex items-center gap-2"
        >
          <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
          <span>Member Contributions (Inflow)</span>
        </Link>
        <Link
          to="/payouts"
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-bottle-800 text-bone-200 shadow-sm flex items-center gap-2"
        >
          <ArrowUpRight className="w-3.5 h-3.5 text-crimson-400" />
          <span>Scheduled & Completed Payouts (Outflow)</span>
        </Link>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-bottle-800/10 shadow-subtle">
          <div className="text-xs text-bottle-800/70">Total Payouts Distributed</div>
          <div className="text-2xl font-serif font-bold text-bottle-950 mt-1">{formatINR(totalDistributed)}</div>
          <div className="text-[11px] text-emerald-700 mt-0.5 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> 100% principal handed over
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-bottle-800/10 shadow-subtle">
          <div className="text-xs text-bottle-800/70">Upcoming Cycle Milestones</div>
          <div className="text-2xl font-serif font-bold text-crimson-700 mt-1">
            {payouts.filter(p => p.status === 'Upcoming').length} Scheduled
          </div>
          <div className="text-[11px] text-bottle-800/70 mt-0.5">Pre-agreed non-auction order</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-bottle-800/10 shadow-subtle">
          <div className="text-xs text-bottle-800/70">Recipient Confirmations</div>
          <div className="text-2xl font-serif font-bold text-bottle-950 mt-1">100%</div>
          <div className="text-[11px] text-bottle-800/70 mt-0.5">Signed settlement affidavits</div>
        </div>
      </div>

      {/* Payout Milestones List */}
      <div className="space-y-4">
        {filteredPayouts.map(payout => {
          const isCompleted = payout.status === 'Verified' || payout.status === 'Recipient Confirmed';

          return (
            <div
              key={payout.id}
              className="p-6 rounded-2xl bg-white border border-bottle-800/10 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-bottle-800/20 transition-all"
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-serif font-bold text-lg flex-shrink-0 ${
                  isCompleted ? 'bg-bottle-900 text-bone-200' : 'bg-crimson-50 text-crimson-800 border border-crimson-200'
                }`}>
                  M{payout.monthNumber}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-serif font-bold text-bottle-950">
                      {payout.recipientName}
                    </h3>
                    <span className="text-xs text-bottle-800/60">({payout.bishiName})</span>
                  </div>

                  <div className="text-xs text-bottle-800/75 flex flex-wrap items-center gap-3">
                    <span>Scheduled: {payout.scheduledDate}</span>
                    {payout.actualDate && (
                      <span className="text-emerald-700 font-medium">Settled: {payout.actualDate}</span>
                    )}
                    {payout.transactionRef && (
                      <span className="font-mono text-[11px] text-bottle-800/60">{payout.transactionRef}</span>
                    )}
                  </div>

                  <div className="text-[11px] font-mono text-bottle-800/60 pt-1">
                    State Digest: {payout.recordHash.slice(0, 24)}...
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 self-end md:self-auto">
                <div className="text-right">
                  <div className="text-2xl font-serif font-bold text-bottle-950">
                    {formatINR(payout.amount)}
                  </div>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold mt-1 ${
                    isCompleted 
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}>
                    {payout.status}
                  </span>
                </div>

                {payout.status === 'Upcoming' && role === 'organizer' && (
                  <button
                    onClick={() => confirmPayout(payout.id)}
                    className="px-4 py-2.5 rounded-xl bg-crimson-700 hover:bg-crimson-800 text-bone-100 text-xs font-semibold shadow-subtle transition-all"
                  >
                    Confirm Payout
                  </button>
                )}

                {isCompleted && (
                  <div className="flex items-center gap-1 text-emerald-700 text-xs font-semibold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verified</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
