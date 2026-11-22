import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LedgerEventType, LedgerEvent } from '../types';
import { VerifyHashModal } from '../components/common/VerifyHashModal';
import { 
  History, 
  Search, 
  Filter, 
  ShieldCheck, 
  Clock, 
  ArrowDownLeft, 
  ArrowUpRight, 
  FileText,
  AlertCircle,
  X
} from 'lucide-react';
import { truncateHash } from '../utils/cryptoSim';

export const AuditLedgerPage: React.FC = () => {
  const { ledgerEvents, bishis } = useApp();

  const [search, setSearch] = useState('');
  const [eventFilter, setEventFilter] = useState('All');
  const [bishiFilter, setBishiFilter] = useState('All');
  const [selectedEvent, setSelectedEvent] = useState<LedgerEvent | null>(null);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [selectedHash, setSelectedHash] = useState('');

  const eventTypes = [
    'All',
    'Contribution Recorded',
    'Contribution Verified',
    'Payout Scheduled',
    'Payout Confirmed',
    'Blockchain Anchor Created',
    'Dispute Raised',
    'Dispute Resolved'
  ];

  const filteredEvents = ledgerEvents.filter(e => {
    const matchSearch = e.description.toLowerCase().includes(search.toLowerCase()) ||
                        e.actor.name.toLowerCase().includes(search.toLowerCase()) ||
                        e.recordHash.toLowerCase().includes(search.toLowerCase());
    const matchType = eventFilter === 'All' || e.eventType === eventFilter;
    const matchBishi = bishiFilter === 'All' || e.bishiId === bishiFilter;
    return matchSearch && matchType && matchBishi;
  });

  return (
    <div className="space-y-6 animate-in fade-in">
      <VerifyHashModal
        isOpen={verifyModalOpen}
        onClose={() => setVerifyModalOpen(false)}
        initialHash={selectedHash}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-bottle-800/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-bottle-950">
            Activity & Shared Ledger
          </h1>
          <p className="text-xs sm:text-sm text-bottle-800/70 mt-0.5">
            Chronological immutable timeline of all community actions, settlements, and cryptographic anchors.
          </p>
        </div>

        <div className="text-xs text-bottle-800/80 font-mono bg-bone-300 px-3 py-1.5 rounded-xl border border-bottle-800/15">
          {ledgerEvents.length} Verified Entries
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-bottle-800/10 shadow-subtle flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Group Filter */}
          <select
            value={bishiFilter}
            onChange={e => setBishiFilter(e.target.value)}
            className="text-xs font-medium bg-bone-300 border border-bottle-800/15 rounded-xl px-3 py-1.5 text-bottle-950 outline-none"
          >
            <option value="All">All Communities</option>
            {bishis.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>

          {/* Event Type Filter */}
          <select
            value={eventFilter}
            onChange={e => setEventFilter(e.target.value)}
            className="text-xs font-medium bg-bone-300 border border-bottle-800/15 rounded-xl px-3 py-1.5 text-bottle-950 outline-none"
          >
            {eventTypes.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-bottle-700 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search action, actor, record hash..."
            className="w-full text-xs font-medium bg-bone-300 border border-bottle-800/15 rounded-xl pl-9 pr-4 py-1.5 text-bottle-950 outline-none focus:border-bottle-800"
          />
        </div>
      </div>

      {/* Ledger Timeline List */}
      <div className="p-6 rounded-2xl bg-white border border-bottle-800/10 shadow-subtle space-y-4">
        {filteredEvents.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <div className="w-12 h-12 mx-auto rounded-full bg-bone-400 flex items-center justify-center text-bottle-800">
              <History className="w-6 h-6" />
            </div>
            <h3 className="text-base font-serif font-bold text-bottle-950">
              No Ledger Records Found
            </h3>
            <p className="text-xs text-bottle-800/70 max-w-sm mx-auto">
              No audit entries matched your active filters or community circles.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredEvents.map(evt => (
              <div
                key={evt.id}
                onClick={() => setSelectedEvent(evt)}
                className="p-4 rounded-2xl bg-bone-300/40 border border-bottle-800/10 hover:border-bottle-800/30 hover:bg-bone-300/80 transition-all cursor-pointer space-y-2 text-xs"
              >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-bottle-950 text-sm font-serif">
                    {evt.eventType}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-bone-400 text-bottle-900 font-semibold">
                    {evt.bishiName}
                  </span>
                  {(() => {
                    const status = evt.verificationStatus || (
                      evt.eventType.includes('Verified') || evt.eventType.includes('Confirmed') || evt.eventType.includes('Anchor')
                        ? 'Verified'
                        : evt.eventType.includes('Dispute')
                        ? 'Flagged'
                        : 'Pending'
                    );
                    const isFlagged = (status as string) === 'Flagged';
                    const isVerified = (status as string) === 'Verified' || (status as string) === 'Confirmed';
                    const badgeClass = isFlagged
                      ? 'bg-crimson-50 text-crimson-800 border-crimson-300 font-bold'
                      : isVerified
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold'
                      : 'bg-amber-50 text-amber-800 border-amber-300 font-medium';

                    return (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${badgeClass} inline-flex items-center gap-1`}>
                        <span className={`w-1 h-1 rounded-full ${isFlagged ? 'bg-crimson-500' : isVerified ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        {status}
                      </span>
                    );
                  })()}
                </div>
                <span className="text-bottle-800/60 font-mono text-[11px]">{evt.timestamp}</span>
              </div>

              <p className="text-bottle-900 text-xs leading-relaxed">
                {evt.description}
              </p>

              <div className="flex flex-wrap items-center justify-between pt-2 border-t border-bone-600/70 font-mono text-[10px] text-bottle-800/70 gap-2">
                <span>Actor: {evt.actor.name} ({evt.actor.role})</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Hash: {truncateHash(evt.recordHash, 6)}
                </span>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>

      {/* Ledger Item Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bottle-950/70 backdrop-blur-sm animate-in fade-in">
          <div 
            className="w-full max-w-lg bg-white rounded-2xl shadow-elevated border border-bottle-800/15 overflow-hidden flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-bone-600 bg-bottle-900 text-bone-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-serif font-bold text-bone-100">{selectedEvent.eventType}</h3>
                <p className="text-xs text-bone-400 font-mono">Event ID: {selectedEvent.id}</p>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-1 rounded-lg text-bone-400 hover:text-bone-100 hover:bg-bottle-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-bone-300 space-y-2">
                <div className="text-bottle-800/70 font-semibold uppercase text-[10px]">Description</div>
                <p className="text-bottle-950 leading-relaxed font-medium">{selectedEvent.description}</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between py-1.5 border-b border-bone-600">
                  <span className="text-bottle-800/70">Community Circle:</span>
                  <span className="font-semibold text-bottle-950">{selectedEvent.bishiName}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-bone-600">
                  <span className="text-bottle-800/70">Executed By:</span>
                  <span className="font-semibold text-bottle-950">{selectedEvent.actor.name} ({selectedEvent.actor.role})</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-bone-600">
                  <span className="text-bottle-800/70">Timestamp:</span>
                  <span>{selectedEvent.timestamp}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-bone-600 font-mono text-[11px]">
                  <span className="text-bottle-800/70">Block Height:</span>
                  <span className="font-semibold text-bottle-950">#{selectedEvent.blockNumber || 1894201}</span>
                </div>
                <div>
                  <span className="text-bottle-800/70 block mb-1">State Hash Digest:</span>
                  <div className="p-2.5 rounded-lg bg-bone-300 font-mono text-[11px] text-bottle-950 break-all select-all">
                    {selectedEvent.recordHash}
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedEvent(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-bottle-800 hover:bg-bone-400"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedHash(selectedEvent.recordHash);
                    setSelectedEvent(null);
                    setVerifyModalOpen(true);
                  }}
                  className="px-5 py-2 rounded-xl bg-bottle-800 hover:bg-bottle-900 text-bone-200 text-xs font-semibold flex items-center gap-1.5 shadow-subtle"
                >
                  <ShieldCheck className="w-4 h-4 text-gold-400" />
                  <span>Verify On-Chain</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
