import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PaymentMethod } from '../../types';
import { X, CheckCircle, Upload, AlertCircle } from 'lucide-react';
import { formatINR } from '../../utils/cryptoSim';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedBishiId?: string;
  preselectedMemberId?: string;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  onClose,
  preselectedBishiId,
  preselectedMemberId
}) => {
  const { bishis, members, recordContribution } = useApp();

  const [bishiId, setBishiId] = useState(preselectedBishiId || bishis[0]?.id || 'bishi-1');
  const [memberId, setMemberId] = useState(preselectedMemberId || members[1]?.id || 'mem-2');
  const [amount, setAmount] = useState<number>(2000);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [transactionRef, setTransactionRef] = useState(`UPI/${Math.floor(100000000000 + Math.random() * 900000000000)}/HDFC`);
  const [periodMonth, setPeriodMonth] = useState(7);
  const [monthName, setMonthName] = useState('November 2026');
  const [notes, setNotes] = useState('Payment verified with bank statement & SMS acknowledgment.');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const currentBishi = bishis.find(b => b.id === bishiId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await recordContribution({
        bishiId,
        memberId,
        amount: Number(amount),
        paymentMethod,
        transactionRef,
        periodMonth,
        monthName,
        notes
      });
    } catch (err) {
      console.warn('Record contribution failed:', err);
    } finally {
      setIsSubmitting(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bottle-950/70 backdrop-blur-sm animate-in fade-in">
      <div 
        className="w-full max-w-lg bg-white rounded-2xl shadow-elevated border border-bottle-800/15 overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-bone-600 bg-bone-400/50 flex items-center justify-between">
          <div>
            <h3 className="text-base font-serif font-bold text-bottle-950">Record Member Contribution</h3>
            <p className="text-xs text-bottle-800/70">Centralized accounting with verifiable receipt</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-bottle-800/50 hover:text-bottle-950 hover:bg-bone-600/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Important Regulatory / Prototype Notice */}
          <div className="p-3 rounded-xl bg-bone-400/80 border border-bottle-800/10 text-[11px] text-bottle-900 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-bottle-700 flex-shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Simulated Recordkeeping:</strong> Recording this entry adds a cryptographic record to the shared community ledger. It documents an external payment settled via UPI, NEFT, or Cash.
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Bishi Group */}
            <div>
              <label className="text-xs font-semibold text-bottle-900 block mb-1">
                Bishi Group
              </label>
              <select
                value={bishiId}
                onChange={e => {
                  setBishiId(e.target.value);
                  const b = bishis.find(x => x.id === e.target.value);
                  if (b) setAmount(b.monthlyContribution);
                }}
                className="w-full text-xs font-medium bg-bone-300 border border-bottle-800/20 rounded-xl p-2.5 text-bottle-950 outline-none focus:border-bottle-800"
              >
                {bishis.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Member */}
            <div>
              <label className="text-xs font-semibold text-bottle-900 block mb-1">
                Member
              </label>
              <select
                value={memberId}
                onChange={e => setMemberId(e.target.value)}
                className="w-full text-xs font-medium bg-bone-300 border border-bottle-800/20 rounded-xl p-2.5 text-bottle-950 outline-none focus:border-bottle-800"
              >
                {members.filter(m => m.role === 'Member').map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.phone})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Amount */}
            <div>
              <label className="text-xs font-semibold text-bottle-900 block mb-1">
                Amount Paid (INR)
              </label>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(Number(e.target.value))}
                required
                className="w-full text-xs font-medium bg-bone-300 border border-bottle-800/20 rounded-xl p-2.5 text-bottle-950 outline-none focus:border-bottle-800"
              />
            </div>

            {/* Payment Method */}
            <div>
              <label className="text-xs font-semibold text-bottle-900 block mb-1">
                Payment Channel
              </label>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full text-xs font-medium bg-bone-300 border border-bottle-800/20 rounded-xl p-2.5 text-bottle-950 outline-none focus:border-bottle-800"
              >
                <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                <option value="Bank Transfer">Bank Transfer (IMPS / NEFT / RTGS)</option>
                <option value="Cash">Physical Cash Receipt</option>
                <option value="Other">Other Verified Medium</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Month Period */}
            <div>
              <label className="text-xs font-semibold text-bottle-900 block mb-1">
                Cycle Month
              </label>
              <input
                type="text"
                value={monthName}
                onChange={e => setMonthName(e.target.value)}
                className="w-full text-xs font-medium bg-bone-300 border border-bottle-800/20 rounded-xl p-2.5 text-bottle-950 outline-none focus:border-bottle-800"
              />
            </div>

            {/* Reference */}
            <div>
              <label className="text-xs font-semibold text-bottle-900 block mb-1">
                UTR / Reference No.
              </label>
              <input
                type="text"
                value={transactionRef}
                onChange={e => setTransactionRef(e.target.value)}
                placeholder="e.g. UPI/632190842211"
                required
                className="w-full text-xs font-mono font-medium bg-bone-300 border border-bottle-800/20 rounded-xl p-2.5 text-bottle-950 outline-none focus:border-bottle-800"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-semibold text-bottle-900 block mb-1">
              Internal Verification Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full text-xs font-medium bg-bone-300 border border-bottle-800/20 rounded-xl p-2.5 text-bottle-950 outline-none focus:border-bottle-800"
            />
          </div>

          {/* Simulated File Upload Preview */}
          <div className="p-3 border-2 border-dashed border-bottle-800/20 rounded-xl text-center bg-bone-300/40 hover:bg-bone-300 transition-colors cursor-pointer">
            <Upload className="w-4 h-4 mx-auto text-bottle-700 mb-1" />
            <div className="text-xs font-medium text-bottle-950">Attach Bank Screenshot or Cash Voucher</div>
            <div className="text-[10px] text-bottle-800/60 mt-0.5">PNG, JPG, PDF up to 5MB (Simulated)</div>
          </div>

          {/* Submit Action */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-bottle-800 hover:bg-bone-400 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-bottle-800 hover:bg-bottle-900 text-bone-200 shadow-subtle transition-all flex items-center gap-2"
            >
              {isSubmitting ? 'Hashing & Logging...' : 'Record & Fingerprint Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
