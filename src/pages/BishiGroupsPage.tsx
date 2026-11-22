import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { GroupCategory } from '../types';
import { 
  Search, 
  Plus, 
  CircleDot, 
  Users, 
  Calendar, 
  ArrowRight, 
  ShieldCheck,
  TrendingUp,
  Filter
} from 'lucide-react';
import { formatINR, formatShortINR } from '../utils/cryptoSim';

export const BishiGroupsPage: React.FC = () => {
  const { bishis, setSelectedBishiId, role, currentUser } = useApp();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Filter circles where current user is actually enrolled or an organizer
  const myBishis = bishis.filter(b => {
    if (role === 'admin' || role === 'auditor') return true;
    if (role === 'organizer') {
      return b.organizer?.id === currentUser?.id || b.organizer?.name === currentUser?.name;
    }
    return b.members?.some(m => m.id === currentUser?.id || m.email === currentUser?.email);
  });

  // Default to 'my' if user has circles or is organizer; default to 'all' if user has 0 circles
  const [activeTab, setActiveTab] = useState<'my' | 'all'>(() => {
    if (role === 'admin' || role === 'auditor') return 'all';
    return myBishis.length > 0 ? 'my' : 'all';
  });

  const categories = ['All', 'Society', "Women's Group", 'Business', 'Family', 'Professional'];

  const displayedSource = activeTab === 'my' ? myBishis : bishis;

  const filteredBishis = displayedSource.filter(b => {
    const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'All' || b.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-bottle-800/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-bottle-950">
            {activeTab === 'my' ? 'My Bishi Communities' : 'Explore Community Circles'}
          </h1>
          <p className="text-xs sm:text-sm text-bottle-800/70 mt-0.5">
            {activeTab === 'my'
              ? 'Manage your rotating savings circles, view pool progress, and audit schedules.'
              : 'Browse transparent community circles with cryptographic non-auction rules on Sepolia.'}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          {role === 'organizer' && (
            <Link
              to="/create-bishi"
              className="px-4 py-2.5 rounded-xl bg-bottle-800 hover:bg-bottle-900 text-bone-200 text-xs font-semibold shadow-subtle flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4 text-crimson-400" />
              <span>Create New Bishi</span>
            </Link>
          )}
        </div>
      </div>

      {/* Tabs: My Circles vs Explore All Circles */}
      <div className="flex items-center justify-between border-b border-bottle-800/10 pb-2 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('my')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'my'
                ? 'bg-bottle-800 text-bone-200 shadow-sm'
                : 'bg-white hover:bg-bone-400/80 text-bottle-800/80 border border-bottle-800/10'
            }`}
          >
            My Circles ({myBishis.length})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'all'
                ? 'bg-bottle-800 text-bone-200 shadow-sm'
                : 'bg-white hover:bg-bone-400/80 text-bottle-800/80 border border-bottle-800/10'
            }`}
          >
            Explore All Circles ({bishis.length})
          </button>
        </div>

        {activeTab === 'my' && myBishis.length === 0 && (
          <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full font-medium">
            Not enrolled in any circle yet
          </span>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-bottle-800 text-bone-200 shadow-sm'
                  : 'bg-white hover:bg-bone-400/80 text-bottle-800/80 border border-bottle-800/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Box */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-bottle-700 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search Bishi circles..."
            className="w-full text-xs font-medium bg-white border border-bottle-800/15 rounded-xl pl-9 pr-4 py-2 text-bottle-950 outline-none focus:border-bottle-800 shadow-subtle"
          />
        </div>
      </div>

      {/* Groups Grid or Empty State */}
      {filteredBishis.length === 0 ? (
        <div className="p-10 rounded-2xl bg-white border border-bottle-800/10 shadow-subtle text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-bone-400 flex items-center justify-center text-bottle-800">
            <CircleDot className="w-6 h-6" />
          </div>
          <h3 className="text-base font-serif font-bold text-bottle-950">
            {activeTab === 'my' ? 'No Enrolled Circles Found' : 'No Community Circles Matched'}
          </h3>
          <p className="text-xs text-bottle-800/70 max-w-md mx-auto leading-relaxed">
            {activeTab === 'my'
              ? "You haven't joined any Bishi circles yet. Explore all verified communities to view rules and request membership."
              : "Try adjusting your category filter or search query."}
          </p>
          {activeTab === 'my' && (
            <button
              onClick={() => setActiveTab('all')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-bottle-800 hover:bg-bottle-900 text-bone-200 text-xs font-semibold shadow-subtle transition-all cursor-pointer"
            >
              <span>Explore All Circles ({bishis.length})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBishis.map(bishi => {
            const progressPercent = Math.round((bishi.currentMonth / bishi.durationMonths) * 100);
            const isUserEnrolled = bishi.organizer?.id === currentUser?.id || 
              bishi.members?.some(m => m.id === currentUser?.id || m.email === currentUser?.email);

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
                    <div className="flex items-center gap-1.5">
                      {isUserEnrolled ? (
                        <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-300">
                          Enrolled
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-bottle-800/70 bg-bone-300 px-2 py-0.5 rounded-full border border-bone-500/30">
                          Open Circle
                        </span>
                      )}
                      <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        {bishi.status}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-base font-serif font-bold text-bottle-950 group-hover:text-bottle-800 transition-colors mb-1">
                    {bishi.name}
                  </h3>
                  <p className="text-xs text-bottle-800/75 line-clamp-2 leading-relaxed mb-4">
                    {bishi.description}
                  </p>

                  {/* Financial Summary */}
                  <div className="p-3.5 rounded-xl bg-bone-300/60 border border-bottle-800/10 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-bottle-800/70">Monthly Pool:</span>
                      <span className="font-bold text-bottle-950">{formatINR(bishi.totalPoolPerMonth)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-bottle-800/70">Contribution:</span>
                      <span className="text-bottle-950 font-medium">{formatINR(bishi.monthlyContribution)}/mo</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-bottle-800/70">Next Payout:</span>
                      <span className="text-crimson-700 font-semibold">{bishi.nextPayoutDate}</span>
                    </div>
                    <div className="flex justify-between text-[11px] pt-1 border-t border-bone-600 text-bottle-800/70">
                      <span>Members:</span>
                      <span className="font-medium text-bottle-950">{bishi.totalMembers} Enrolled</span>
                    </div>
                  </div>
                </div>

                {/* Progress */}
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
      )}
    </div>
  );
};
