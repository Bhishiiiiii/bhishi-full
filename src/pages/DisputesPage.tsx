import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { RaiseDisputeModal } from '../components/common/RaiseDisputeModal';
import { DisputeRecord } from '../types';
import { 
  AlertTriangle, 
  ShieldAlert, 
  Plus, 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  X,
  ChevronRight
} from 'lucide-react';

export const DisputesPage: React.FC = () => {
  const { disputes, resolveDispute, role } = useApp();
  const [raiseModalOpen, setRaiseModalOpen] = useState(false);
  const [selectedDispute, setSelectedDispute] = useState<DisputeRecord | null>(null);
  const [resolutionNote, setResolutionNote] = useState('');

  const handleResolve = (status: 'Resolved' | 'Rejected') => {
    if (!selectedDispute) return;
    resolveDispute(selectedDispute.id, resolutionNote || 'Reviewed and reconciled against ledger evidence.', status);
    setSelectedDispute(null);
    setResolutionNote('');
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <RaiseDisputeModal
        isOpen={raiseModalOpen}
        onClose={() => setRaiseModalOpen(false)}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-bottle-800/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-bottle-950">
            Dispute & Query Resolution
          </h1>
          <p className="text-xs sm:text-sm text-bottle-800/70 mt-0.5">
            Transparent dispute management for contribution vouchers, schedule discrepancies, and ledger audits.
          </p>
        </div>

        <button
          onClick={() => setRaiseModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-crimson-700 hover:bg-crimson-800 text-bone-100 text-xs font-semibold shadow-subtle flex items-center gap-1.5 self-start transition-all"
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Raise Formal Query</span>
        </button>
      </div>

      {/* Disputes List */}
      <div className="space-y-4">
        {disputes.map(disp => (
          <div
            key={disp.id}
            className="p-6 rounded-2xl bg-white border border-bottle-800/10 shadow-subtle space-y-4 hover:border-bottle-800/25 transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs font-bold text-bottle-900 bg-bone-400 px-2.5 py-0.5 rounded-lg">
                  {disp.id}
                </span>
                <span className="text-sm font-serif font-bold text-bottle-950">
                  {disp.category}
                </span>
                <span className="text-xs text-bottle-800/60">({disp.bishiName})</span>
              </div>

              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold self-start sm:self-auto ${
                disp.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' :
                disp.status === 'Under Review' ? 'bg-blue-100 text-blue-800' :
                'bg-amber-100 text-amber-800'
              }`}>
                {disp.status}
              </span>
            </div>

            <p className="text-xs text-bottle-900 leading-relaxed font-medium">
              {disp.description}
            </p>

            <div className="flex flex-wrap items-center justify-between text-xs text-bottle-800/70 pt-2 border-t border-bone-600 gap-2">
              <div className="flex items-center gap-2">
                <img src={disp.raisedBy.avatar} alt={disp.raisedBy.name} className="w-5 h-5 rounded-full object-cover" />
                <span>Raised by <strong>{disp.raisedBy.name}</strong> on {disp.raisedDate}</span>
              </div>

              {role === 'organizer' && disp.status !== 'Resolved' && (
                <button
                  onClick={() => setSelectedDispute(disp)}
                  className="px-3 py-1.5 rounded-lg bg-bottle-800 hover:bg-bottle-900 text-bone-200 text-xs font-semibold transition-all"
                >
                  Respond & Resolve
                </button>
              )}

              {disp.organizerResponse && (
                <div className="w-full p-3 rounded-xl bg-bone-300 text-[11px] text-bottle-900 mt-2">
                  <strong>Organizer Resolution:</strong> {disp.organizerResponse}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Resolution Modal */}
      {selectedDispute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bottle-950/70 backdrop-blur-sm animate-in fade-in">
          <div 
            className="w-full max-w-md bg-white rounded-2xl shadow-elevated border border-bottle-800/15 overflow-hidden flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-bone-600 bg-bottle-900 text-bone-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-serif font-bold text-bone-100">Dispute Resolution</h3>
                <p className="text-xs text-bone-400 font-mono">{selectedDispute.id}</p>
              </div>
              <button
                onClick={() => setSelectedDispute(null)}
                className="p-1 rounded-lg text-bone-400 hover:text-bone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-bone-300 text-bottle-900 leading-relaxed">
                <strong>Member Query:</strong> {selectedDispute.description}
              </div>

              <div>
                <label className="text-xs font-semibold text-bottle-900 block mb-1">
                  Organizer Audit Note & Resolution
                </label>
                <textarea
                  rows={3}
                  value={resolutionNote}
                  onChange={e => setResolutionNote(e.target.value)}
                  placeholder="Explain reconciliation, bank counter-slip verification, or corrective action..."
                  className="w-full text-xs font-medium bg-bone-300 border border-bottle-800/20 rounded-xl p-2.5 text-bottle-950 outline-none focus:border-bottle-800"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => handleResolve('Rejected')}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-crimson-700 hover:bg-crimson-50"
                >
                  Reject Query
                </button>
                <button
                  type="button"
                  onClick={() => handleResolve('Resolved')}
                  className="px-5 py-2 rounded-xl bg-bottle-800 hover:bg-bottle-900 text-bone-200 text-xs font-semibold shadow-subtle"
                >
                  Mark Reconciled & Resolved
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
