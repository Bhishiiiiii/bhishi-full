import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  Users, 
  CircleDot, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Clock, 
  ShieldCheck, 
  Plus, 
  AlertCircle,
  Calendar,
  CheckCircle2,
  FileCheck,
  ChevronRight,
  TrendingUp,
  CreditCard
} from 'lucide-react';
import { formatINR, formatShortINR, truncateHash } from '../utils/cryptoSim';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export const DashboardOverview: React.FC = () => {
  const { 
    role, 
    currentUser, 
    bishis, 
    contributions, 
    payouts, 
    ledgerEvents, 
    members,
    setSelectedBishiId 
  } = useApp();

  const navigate = useNavigate();

  // Aggregate stats
  const activeBishis = bishis.filter(b => b.status === 'Active');
  const totalPooledReserves = bishis.reduce((acc, b) => acc + b.totalPoolPerMonth, 0);
  const totalContributionsRecorded = contributions
    .filter(c => c.status === 'Verified' || c.status === 'Paid')
    .reduce((acc, c) => acc + c.amount, 0);
  const totalPayoutsDistributed = payouts
    .filter(p => p.status === 'Verified' || p.status === 'Recipient Confirmed')
    .reduce((acc, p) => acc + p.amount, 0);

  const pendingContributions = contributions.filter(c => c.status === 'Pending').length;

  // Monthly trends data for Recharts
  const chartData = [
    { month: 'Jun', contributions: 820000, payouts: 640000 },
    { month: 'Jul', contributions: 890000, payouts: 720000 },
    { month: 'Aug', contributions: 990000, payouts: 820000 },
    { month: 'Sep', contributions: 1120000, payouts: 920000 },
    { month: 'Oct', contributions: 1420000, payouts: 1240000 },
    { month: 'Nov', contributions: 1940000, payouts: 1820000 }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-bottle-800/10">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-bottle-800 text-bone-200 uppercase tracking-wider font-mono">
              Role: {role}
            </span>
            <span className="text-xs text-bottle-800/60 font-medium">
              Consortium Block #1894201 Synced
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-bottle-950">
            Good afternoon, {currentUser.name}
          </h1>
          <p className="text-xs sm:text-sm text-bottle-800/75 mt-0.5">
            Here's what's happening across your active Bishi communities and verified ledgers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {role === 'organizer' && (
            <Link
              to="/create-bishi"
              className="px-4 py-2.5 rounded-xl bg-bottle-800 hover:bg-bottle-900 text-bone-200 text-xs font-semibold shadow-subtle flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4 text-crimson-400" />
              <span>Create New Bishi</span>
            </Link>
          )}
          <Link
            to="/blockchain"
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-bone-400/80 text-bottle-950 text-xs font-semibold border border-bottle-800/15 shadow-subtle flex items-center gap-1.5 transition-all"
          >
            <ShieldCheck className="w-4 h-4 text-bottle-700" />
            <span>Verify Records</span>
          </Link>
        </div>
      </div>

      {/* 2. Key Financial Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-5 rounded-2xl bg-white border border-bottle-800/10 shadow-subtle">
          <div className="flex items-center justify-between text-xs font-medium text-bottle-700/80 mb-2">
            <span>Active Bishi Groups</span>
            <CircleDot className="w-4 h-4 text-bottle-800" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-bottle-950">
            {activeBishis.length}
          </div>
          <div className="text-[11px] text-bottle-800/70 mt-1 flex items-center gap-1">
            <span className="text-emerald-700 font-semibold">{members.length} members</span> participating
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-bottle-800/10 shadow-subtle">
          <div className="flex items-center justify-between text-xs font-medium text-bottle-700/80 mb-2">
            <span>Monthly Pooled Funds</span>
            <TrendingUp className="w-4 h-4 text-bottle-800" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-bottle-950">
            {formatShortINR(totalPooledReserves)}
          </div>
          <div className="text-[11px] text-bottle-800/70 mt-1">
            Across 5 rotating circles
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-bottle-800/10 shadow-subtle">
          <div className="flex items-center justify-between text-xs font-medium text-bottle-700/80 mb-2">
            <span>Total Payouts Distributed</span>
            <ArrowUpRight className="w-4 h-4 text-crimson-700" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-bottle-950">
            {formatShortINR(totalPayoutsDistributed)}
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> 100% Non-auction settlements
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-bottle-800/10 shadow-subtle">
          <div className="flex items-center justify-between text-xs font-medium text-bottle-700/80 mb-2">
            <span>Pending Contributions</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-bottle-950">
            {pendingContributions}
          </div>
          <div className="text-[11px] text-amber-700 font-medium mt-1">
            Reminders dispatched
          </div>
        </div>
      </div>

      {/* 3. Active Bishi Groups Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-serif font-bold text-bottle-950">Active Bishi Communities</h2>
            <p className="text-xs text-bottle-800/70">Centralized groups under your management and participation</p>
          </div>
          <Link
            to="/groups"
            className="text-xs font-semibold text-bottle-800 hover:text-crimson-700 flex items-center gap-1"
          >
            <span>View All ({bishis.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bishis.slice(0, 3).map(bishi => {
            const progressPercent = Math.round((bishi.currentMonth / bishi.durationMonths) * 100);

            return (
              <div
                key={bishi.id}
                onClick={() => {
                  setSelectedBishiId(bishi.id);
                  navigate(`/bishi/${bishi.id}`);
                }}
                className="p-6 rounded-2xl bg-white border border-bottle-800/10 shadow-subtle hover:shadow-premium hover:border-bottle-800/25 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-bone-400 text-bottle-900">
                      {bishi.category}
                    </span>
                    <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      {bishi.status}
                    </span>
                  </div>

                  <h3 className="text-base font-serif font-bold text-bottle-950 group-hover:text-bottle-800 transition-colors mb-1">
                    {bishi.name}
                  </h3>
                  <p className="text-xs text-bottle-800/75 line-clamp-2 leading-relaxed mb-4">
                    {bishi.description}
                  </p>

                  {/* Financial & Cycle Metrics */}
                  <div className="p-3.5 rounded-xl bg-bone-300/60 border border-bottle-800/10 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-bottle-800/70">Monthly Pool:</span>
                      <span className="font-bold text-bottle-950">{formatINR(bishi.totalPoolPerMonth)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-bottle-800/70">Contribution:</span>
                      <span className="text-bottle-950 font-medium">{formatINR(bishi.monthlyContribution)}/member</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-bottle-800/70">Next Payout:</span>
                      <span className="text-crimson-700 font-semibold">{bishi.nextPayoutDate}</span>
                    </div>
                    <div className="flex justify-between text-[11px] pt-1 border-t border-bone-600 text-bottle-800/70">
                      <span>Recipient:</span>
                      <span className="font-medium text-bottle-950">{bishi.nextPayoutRecipient}</span>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="pt-4 mt-4 border-t border-bone-600">
                  <div className="flex items-center justify-between text-[11px] mb-1.5">
                    <span className="text-bottle-800/70">Cycle Timeline</span>
                    <span className="font-mono font-semibold text-bottle-950">
                      Month {bishi.currentMonth} of {bishi.durationMonths} ({progressPercent}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-bone-400 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-bottle-800 rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Chart & Activity Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Financial Volume Trends */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-white border border-bottle-800/10 shadow-subtle space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-bone-600">
            <div>
              <h3 className="text-base font-serif font-bold text-bottle-950">Monthly Savings & Distribution Trend</h3>
              <p className="text-xs text-bottle-800/70">Aggregated contributions vs payout settlements</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-bottle-800"></span> Contributions
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-crimson-600"></span> Payouts
              </span>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorContrib" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#123C32" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#123C32" stopOpacity={0.05}/>
                  </linearGradient>
                  <linearGradient id="colorPayout" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#A3313D" stopOpacity={0.7}/>
                    <stop offset="95%" stopColor="#A3313D" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#123C32" opacity={0.6} fontSize={11} />
                <YAxis stroke="#123C32" opacity={0.6} fontSize={10} tickFormatter={val => `₹${val / 100000}L`} />
                <Tooltip 
                  formatter={(val: number) => formatINR(val)}
                  contentStyle={{ backgroundColor: '#123C32', color: '#F3EBDD', borderRadius: '12px', border: 'none', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="contributions" stroke="#123C32" strokeWidth={2} fillOpacity={1} fill="url(#colorContrib)" />
                <Area type="monotone" dataKey="payouts" stroke="#A3313D" strokeWidth={2} fillOpacity={1} fill="url(#colorPayout)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Recent Ledger & Verification Stream */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-white border border-bottle-800/10 shadow-subtle space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-bone-600">
            <div>
              <h3 className="text-base font-serif font-bold text-bottle-950">Verified Ledger Stream</h3>
              <p className="text-xs text-bottle-800/70">Immutable cryptographic record events</p>
            </div>
            <Link to="/ledger" className="text-xs font-semibold text-bottle-800 hover:text-crimson-700">
              Full Ledger
            </Link>
          </div>

          <div className="space-y-3">
            {ledgerEvents.slice(0, 4).map(evt => (
              <div 
                key={evt.id}
                className="p-3 rounded-xl bg-bone-300/40 border border-bottle-800/10 hover:bg-bone-300/80 transition-colors text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-bottle-950">{evt.eventType}</span>
                  <span className="text-[10px] text-bottle-800/60">{evt.timestamp}</span>
                </div>
                <p className="text-bottle-800/80 leading-relaxed text-[11px]">
                  {evt.description}
                </p>
                <div className="flex items-center justify-between pt-1 border-t border-bone-600/60 font-mono text-[10px] text-bottle-800/70">
                  <span>Record: {evt.recordId}</span>
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    Block #{evt.blockNumber || 1894201}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
