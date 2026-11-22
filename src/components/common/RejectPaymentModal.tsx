import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { ContributionRecord } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatINR } from '../../utils/cryptoSim';

interface RejectPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  contribution: ContributionRecord | null;
}

export const RejectPaymentModal: React.FC<RejectPaymentModalProps> = ({
  isOpen,
  onClose,
  contribution
}) => {
  const { organizerRejectContribution } = useApp();
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !contribution) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!reason.trim() || reason.trim().length < 3) {
      setError('Please provide a reason of at least 3 characters.');
      return;
    }

    try {
      setIsSubmitting(true);
      await organizerRejectContribution(contribution.id, reason.trim());
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to reject contribution');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bottle-950/70 backdrop-blur-sm animate-in fade-in">
      <div 
        className="w-full max-w-md bg-white rounded-3xl shadow-elevated border border-bottle-800/15 overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-bone-600 bg-bottle-900 text-bone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-crimson-400" />
            <h2 className="font-serif font-bold text-base text-bone-100">Reject Payment Submission</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-bone-400 hover:text-bone-100 hover:bg-bottle-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-bone-300/60 border border-bottle-800/10 space-y-1">
            <div className="flex justify-between">
              <span className="text-bottle-800/70">Member:</span>
              <span className="font-bold text-bottle-950">{contribution.memberName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-bottle-800/70">Circle:</span>
              <span className="text-bottle-950">{contribution.bishiName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-bottle-800/70">Amount:</span>
              <span className="font-bold text-emerald-800">{formatINR(contribution.amount)}</span>
            </div>
            {contribution.utr && (
              <div className="flex justify-between">
                <span className="text-bottle-800/70">Submitted UTR:</span>
                <span className="font-mono text-bottle-950">{contribution.utr}</span>
              </div>
            )}
          </div>

          {error && (
            <div className="p-2.5 rounded-xl bg-crimson-50 border border-crimson-200 text-crimson-800 text-xs">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="font-semibold text-bottle-950 block">
              Reason for Rejection <span className="text-crimson-600">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="e.g. UTR reference not reflected in group bank statement. Please verify and resubmit."
              className="w-full p-2.5 rounded-xl border border-bottle-800/20 text-xs focus:outline-none focus:ring-2 focus:ring-bottle-800"
            />
            <p className="text-[10px] text-bottle-800/60">
              The member will receive a notification with this reason and can resubmit with an updated reference.
            </p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl border border-bottle-800/20 text-bottle-950 font-semibold text-xs hover:bg-bone-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 px-4 rounded-xl bg-crimson-700 hover:bg-crimson-800 text-white font-semibold text-xs shadow-subtle disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? 'Rejecting...' : 'Reject Submission'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RejectPaymentModal;
