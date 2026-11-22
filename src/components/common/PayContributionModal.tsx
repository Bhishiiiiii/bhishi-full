import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  X, 
  CheckCircle2, 
  Copy, 
  Check, 
  ExternalLink, 
  Smartphone, 
  Building2, 
  Banknote, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  Printer, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { ContributionRecord } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatINR } from '../../utils/cryptoSim';

interface PayContributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  contribution: ContributionRecord | null;
}

export const PayContributionModal: React.FC<PayContributionModalProps> = ({
  isOpen,
  onClose,
  contribution
}) => {
  const { submitPayment, addToast, bishis } = useApp();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1); // 1: Method, 2: Instructions, 3: Submit UTR, 4: Success Receipt
  const [method, setMethod] = useState<'upi' | 'bank_transfer' | 'cash'>('upi');
  const [utr, setUtr] = useState('');
  const [paidDate, setPaidDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setMethod('upi');
      setUtr('');
      setPaidDate(new Date().toISOString().split('T')[0]);
      setNote('');
      setIsSubmitting(false);
      setIsDemoMode(false);
      setValidationError(null);
    }
  }, [isOpen, contribution?.id]);

  if (!isOpen || !contribution) return null;

  // Find matching group to get organizer & payee details
  const group = bishis.find(b => b.id === contribution.bishiId);
  const payee = contribution.groupDetails?.payeeDetails || group?.payeeDetails || {
    upiId: 'sunrisecircle@okbank',
    upiName: group?.organizer.name || 'Group Organizer',
    bankName: 'HDFC Bank',
    accountName: `${group?.name || 'Bishi'} Fund`,
    accountNumber: '5020029384712',
    ifsc: 'HDFC0001234'
  };

  const organizerName = group?.organizer.name || 'Group Organizer';
  const organizerPhone = group?.organizer.phone || '+91 98201 44521';

  // Construct UPI deep-link URL
  const upiId = payee.upiId || 'sunrisecircle@okbank';
  const upiName = encodeURIComponent(payee.upiName || organizerName);
  const upiNote = encodeURIComponent(`${contribution.bishiName} M${contribution.periodMonth}`);
  const upiUrl = `upi://pay?pa=${upiId}&pn=${upiName}&am=${contribution.amount}&cu=INR&tn=${upiNote}`;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSimulateDemo = () => {
    const randomChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let simUtr = 'UPI';
    for (let i = 0; i < 9; i++) {
      simUtr += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
    }
    setUtr(simUtr);
    setIsDemoMode(true);
    setValidationError(null);
    addToast('info', 'Demo UTR Generated', `Filled mock reference: ${simUtr}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const isUtrRequired = method === 'upi' || method === 'bank_transfer';

    if (isUtrRequired) {
      const cleanUtr = utr.trim();
      if (!cleanUtr) {
        setValidationError('12-character UTR / transaction reference is required.');
        return;
      }
      if (!/^[A-Za-z0-9]{12}$/.test(cleanUtr)) {
        setValidationError('UTR must be exactly 12 alphanumeric characters (e.g. UPI8923014921).');
        return;
      }
    }

    try {
      setIsSubmitting(true);
      await submitPayment(contribution.id, {
        paymentMethod: method,
        utr: isUtrRequired ? utr.trim() : undefined,
        paidAt: new Date(paidDate).toISOString(),
        note: note.trim() || undefined
      });
      setStep(4); // Move to success receipt
    } catch (err: any) {
      setValidationError(err.message || 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bottle-950/70 backdrop-blur-sm animate-in fade-in">
      <div 
        className="w-full max-w-lg bg-white rounded-3xl shadow-elevated border border-bottle-800/15 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-bone-600 bg-bottle-900 text-bone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-bottle-800 flex items-center justify-center border border-bone-500/20">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-base text-bone-100">
                {step === 4 ? 'Payment Submission Receipt' : 'Pay Contribution'}
              </h2>
              <p className="text-[11px] text-bone-400 font-mono">
                {contribution.bishiName} • Month {contribution.periodMonth} ({contribution.monthName})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-bone-400 hover:text-bone-100 hover:bg-bottle-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Bar (hidden on receipt) */}
        {step !== 4 && (
          <div className="px-6 py-2.5 bg-bone-400/50 border-b border-bottle-800/10 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                step === 1 ? 'bg-bottle-800 text-bone-200' : 'bg-emerald-700 text-white'
              }`}>
                {step > 1 ? '✓' : '1'}
              </span>
              <span className={step === 1 ? 'font-bold text-bottle-950' : 'text-bottle-800/70'}>
                Method
              </span>
            </div>
            <div className="w-8 h-0.5 bg-bottle-800/20" />
            <div className="flex items-center gap-2">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                step === 2 ? 'bg-bottle-800 text-bone-200' : step > 2 ? 'bg-emerald-700 text-white' : 'bg-bone-600 text-bottle-800'
              }`}>
                {step > 2 ? '✓' : '2'}
              </span>
              <span className={step === 2 ? 'font-bold text-bottle-950' : 'text-bottle-800/70'}>
                Pay Details
              </span>
            </div>
            <div className="w-8 h-0.5 bg-bottle-800/20" />
            <div className="flex items-center gap-2">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                step === 3 ? 'bg-bottle-800 text-bone-200' : 'bg-bone-600 text-bottle-800'
              }`}>
                3
              </span>
              <span className={step === 3 ? 'font-bold text-bottle-950' : 'text-bottle-800/70'}>
                Submit Ref
              </span>
            </div>
          </div>
        )}

        {/* Amount Banner */}
        <div className="px-6 py-3 bg-bottle-950 text-bone-200 flex items-center justify-between text-xs border-b border-bone-500/10">
          <span className="text-bone-400 font-mono uppercase text-[11px]">Due Amount</span>
          <span className="font-serif font-bold text-lg text-emerald-400">
            {formatINR(contribution.amount)}
          </span>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* ── STEP 1: SELECT METHOD ── */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-serif font-bold text-sm text-bottle-950 mb-1">
                  Select Real-World Payment Method
                </h3>
                <p className="text-bottle-800/70 text-[11px] leading-relaxed">
                  Bishi does not hold your funds. You make the payment directly to your group organizer via your regular banking app or cash, then enter your proof of payment for ledger anchoring.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 pt-2">
                {/* Method 1: UPI */}
                <button
                  type="button"
                  onClick={() => setMethod('upi')}
                  className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
                    method === 'upi'
                      ? 'border-bottle-800 bg-bottle-50/60 ring-2 ring-bottle-800/20 shadow-sm'
                      : 'border-bottle-800/15 hover:border-bottle-800/40 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-bottle-900 text-bone-200 flex items-center justify-center">
                      <Smartphone className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <div className="font-bold text-bottle-950 text-xs">UPI App / QR Code</div>
                      <div className="text-[11px] text-bottle-800/70">Google Pay, PhonePe, Paytm, BHIM</div>
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    method === 'upi' ? 'border-bottle-800 bg-bottle-800' : 'border-bottle-800/30'
                  }`}>
                    {method === 'upi' && <div className="w-1.5 h-1.5 rounded-full bg-bone-200" />}
                  </div>
                </button>

                {/* Method 2: Bank Transfer */}
                <button
                  type="button"
                  onClick={() => setMethod('bank_transfer')}
                  className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
                    method === 'bank_transfer'
                      ? 'border-bottle-800 bg-bottle-50/60 ring-2 ring-bottle-800/20 shadow-sm'
                      : 'border-bottle-800/15 hover:border-bottle-800/40 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-bottle-900 text-bone-200 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-gold-400" />
                    </div>
                    <div>
                      <div className="font-bold text-bottle-950 text-xs">Direct Bank Transfer</div>
                      <div className="text-[11px] text-bottle-800/70">IMPS, NEFT, or RTGS directly to group escrow</div>
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    method === 'bank_transfer' ? 'border-bottle-800 bg-bottle-800' : 'border-bottle-800/30'
                  }`}>
                    {method === 'bank_transfer' && <div className="w-1.5 h-1.5 rounded-full bg-bone-200" />}
                  </div>
                </button>

                {/* Method 3: Cash */}
                <button
                  type="button"
                  onClick={() => setMethod('cash')}
                  className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
                    method === 'cash'
                      ? 'border-bottle-800 bg-bottle-50/60 ring-2 ring-bottle-800/20 shadow-sm'
                      : 'border-bottle-800/15 hover:border-bottle-800/40 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-bottle-900 text-bone-200 flex items-center justify-center">
                      <Banknote className="w-5 h-5 text-crimson-400" />
                    </div>
                    <div>
                      <div className="font-bold text-bottle-950 text-xs">In-Person Cash</div>
                      <div className="text-[11px] text-bottle-800/70">Hand physical cash to organizer in community meeting</div>
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    method === 'cash' ? 'border-bottle-800 bg-bottle-800' : 'border-bottle-800/30'
                  }`}>
                    {method === 'cash' && <div className="w-1.5 h-1.5 rounded-full bg-bone-200" />}
                  </div>
                </button>
              </div>

              <div className="pt-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full py-3 px-4 rounded-xl bg-bottle-800 hover:bg-bottle-900 text-bone-200 font-semibold text-xs shadow-subtle flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>Continue to Instructions</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 2: INSTRUCTIONS ── */}
          {step === 2 && (
            <div className="space-y-4">
              {/* Notice */}
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] leading-relaxed flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <strong>Important:</strong> Pay outside Bishi, then enter your reference. Your organizer will verify and confirm it on the Sepolia audit ledger.
                </div>
              </div>

              {/* UPI Mode */}
              {method === 'upi' && (
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-bone-300/40 border border-bottle-800/10">
                    <div className="p-3 bg-white rounded-2xl border border-bottle-800/10 shadow-sm shrink-0">
                      <QRCodeSVG 
                        value={upiUrl}
                        size={120}
                        level="M"
                        includeMargin={false}
                      />
                    </div>
                    <div className="space-y-2 flex-1 w-full text-[11px]">
                      <div>
                        <span className="text-bottle-800/60 uppercase font-mono text-[9px] block">Organizer UPI ID</span>
                        <div className="flex items-center justify-between font-mono font-bold text-bottle-950 bg-white px-2.5 py-1.5 rounded-lg border border-bottle-800/10">
                          <span>{payee.upiId || 'sunrisecircle@okbank'}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(payee.upiId || 'sunrisecircle@okbank', 'upiId')}
                            className="p-1 hover:bg-bone-300 rounded text-bottle-800 transition-colors"
                          >
                            {copiedKey === 'upiId' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <span className="text-bottle-800/60 uppercase font-mono text-[9px] block">Payee Name</span>
                        <span className="font-semibold text-bottle-950">{payee.upiName || organizerName}</span>
                      </div>
                      <div className="pt-1">
                        <a
                          href={upiUrl}
                          className="w-full py-2 px-3 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-[11px] flex items-center justify-center gap-1.5 transition-colors shadow-subtle"
                        >
                          <Smartphone className="w-3.5 h-3.5" />
                          <span>Open UPI App (Mobile)</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Bank Transfer Mode */}
              {method === 'bank_transfer' && (
                <div className="p-4 rounded-2xl bg-bone-300/40 border border-bottle-800/10 space-y-2.5 text-[11px]">
                  <div className="flex justify-between items-center py-1 border-b border-bone-600">
                    <span className="text-bottle-800/70">Bank Name:</span>
                    <span className="font-semibold text-bottle-950">{payee.bankName || 'HDFC Bank'}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-bone-600">
                    <span className="text-bottle-800/70">Account Name:</span>
                    <span className="font-semibold text-bottle-950">{payee.accountName || `${group?.name} Fund`}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-bone-600">
                    <span className="text-bottle-800/70">Account Number:</span>
                    <div className="flex items-center gap-1.5 font-mono font-bold text-bottle-950">
                      <span>{payee.accountNumber || '5020029384712'}</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(payee.accountNumber || '5020029384712', 'acc')}
                        className="p-0.5 hover:bg-bone-400 rounded text-bottle-800"
                      >
                        {copiedKey === 'acc' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-bottle-800/70">IFSC Code:</span>
                    <div className="flex items-center gap-1.5 font-mono font-bold text-bottle-950">
                      <span>{payee.ifsc || 'HDFC0001234'}</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(payee.ifsc || 'HDFC0001234', 'ifsc')}
                        className="p-0.5 hover:bg-bone-400 rounded text-bottle-800"
                      >
                        {copiedKey === 'ifsc' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Cash Mode */}
              {method === 'cash' && (
                <div className="p-4 rounded-2xl bg-bone-300/40 border border-bottle-800/10 space-y-2 text-[11px]">
                  <div className="flex justify-between items-center py-1 border-b border-bone-600">
                    <span className="text-bottle-800/70">Organizer:</span>
                    <span className="font-semibold text-bottle-950">{organizerName}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-bone-600">
                    <span className="text-bottle-800/70">Phone:</span>
                    <span className="font-mono font-bold text-bottle-950">{organizerPhone}</span>
                  </div>
                  <p className="text-bottle-800/80 pt-1 text-[11px] leading-relaxed">
                    Please hand the exact amount of <strong>{formatINR(contribution.amount)}</strong> in cash to the organizer. Once handed over, submit this form so the organizer can countersign your physical voucher.
                  </p>
                </div>
              )}

              {/* Hackathon Demo Simulation Helper */}
              {method !== 'cash' && (
                <div className="p-3 rounded-xl bg-gold-400/10 border border-gold-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-gold-500 shrink-0" />
                    <div>
                      <div className="text-[11px] font-bold text-bottle-950 font-mono">Demo Mode: Simulate External UPI / Bank Payment</div>
                      <div className="text-[10px] text-bottle-800/70">Prefills a realistic 12-char UTR for rapid demo testing</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleSimulateDemo}
                    className="px-2.5 py-1 rounded-lg bg-gold-500 hover:bg-gold-600 text-bottle-950 font-semibold text-[10px] transition-colors shrink-0"
                  >
                    Generate UTR
                  </button>
                </div>
              )}

              {/* Nav buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="py-3 px-4 rounded-xl border border-bottle-800/20 text-bottle-950 font-semibold text-xs hover:bg-bone-400/50 flex items-center gap-1.5 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex-1 py-3 px-4 rounded-xl bg-bottle-800 hover:bg-bottle-900 text-bone-200 font-semibold text-xs shadow-subtle flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>I Have Made the Payment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: SUBMIT CONFIRMATION & UTR ── */}
          {step === 3 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <h3 className="font-serif font-bold text-sm text-bottle-950 mb-1">
                  Enter Payment Confirmation Details
                </h3>
                <p className="text-bottle-800/70 text-[11px]">
                  Provide your transaction reference so your organizer can match and countersign on-chain.
                </p>
              </div>

              {validationError && (
                <div className="p-3 rounded-xl bg-crimson-50 border border-crimson-200 text-crimson-800 text-xs">
                  {validationError}
                </div>
              )}

              {(method === 'upi' || method === 'bank_transfer') && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-bottle-950">
                      UTR / Bank Transaction Reference (12 chars) <span className="text-crimson-600">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleSimulateDemo}
                      className="text-[10px] text-emerald-700 hover:underline flex items-center gap-1 font-mono"
                    >
                      <Sparkles className="w-3 h-3" /> Auto-fill Demo UTR
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={12}
                    value={utr}
                    onChange={e => setUtr(e.target.value.toUpperCase())}
                    placeholder="e.g. UPI8932019481 or 632190842211"
                    className="w-full p-2.5 rounded-xl border border-bottle-800/20 font-mono text-xs uppercase focus:outline-none focus:ring-2 focus:ring-bottle-800"
                  />
                  <div className="text-[10px] text-bottle-800/60 flex justify-between">
                    <span>From your Google Pay / PhonePe / Bank SMS or statement</span>
                    <span>{utr.length}/12 chars</span>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-bottle-950">
                  Payment Date <span className="text-crimson-600">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={paidDate}
                  onChange={e => setPaidDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-bottle-800/20 text-xs focus:outline-none focus:ring-2 focus:ring-bottle-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-bottle-950">
                  Notes for Organizer (Optional)
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="e.g. Sent from Meera HDFC account, or Handed at society meeting"
                  className="w-full p-2.5 rounded-xl border border-bottle-800/20 text-xs focus:outline-none focus:ring-2 focus:ring-bottle-800"
                />
              </div>

              {isDemoMode && (
                <div className="p-2.5 rounded-xl bg-gold-400/10 border border-gold-500/20 text-[10px] text-bottle-900 font-mono">
                  ★ Demo Mode active: Submitting with simulated UTR. The organizer will still need to verify and confirm it on their dashboard.
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setStep(2)}
                  className="py-3 px-4 rounded-xl border border-bottle-800/20 text-bottle-950 font-semibold text-xs hover:bg-bone-400/50 flex items-center gap-1.5 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 px-4 rounded-xl bg-crimson-700 hover:bg-crimson-800 text-white font-semibold text-xs shadow-subtle flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmitting ? 'Submitting to Organizer...' : 'Submit Payment Reference'}</span>
                </button>
              </div>
            </form>
          )}

          {/* ── STEP 4: SUCCESS RECEIPT ── */}
          {step === 4 && (
            <div className="space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>

              <div>
                <h3 className="font-serif font-bold text-base text-bottle-950">
                  Payment Submitted Successfully!
                </h3>
                <p className="text-xs text-bottle-800/70 mt-1">
                  Your reference has been submitted. Status is now <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">Submitted</span> awaiting organizer verification.
                </p>
              </div>

              {/* Printable Receipt Card */}
              <div id="payment-receipt-print" className="p-4 rounded-2xl bg-bone-300/60 border border-bottle-800/10 text-left space-y-2.5 font-mono text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-bone-600">
                  <span className="font-serif font-bold text-sm text-bottle-950">BISHI TRUST RECEIPT</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold">SUBMITTED</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-bottle-800/70">Circle:</span>
                  <span className="font-bold text-bottle-950">{contribution.bishiName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-bottle-800/70">Cycle:</span>
                  <span className="text-bottle-950">Month {contribution.periodMonth} ({contribution.monthName})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-bottle-800/70">Amount Paid:</span>
                  <span className="font-bold text-emerald-800">{formatINR(contribution.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-bottle-800/70">Payment Method:</span>
                  <span className="text-bottle-950 uppercase">{method.replace('_', ' ')}</span>
                </div>
                {utr && (
                  <div className="flex justify-between">
                    <span className="text-bottle-800/70">UTR / Ref:</span>
                    <span className="text-bottle-950 font-bold">{utr}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-bottle-800/70">Submitted On:</span>
                  <span className="text-bottle-950">{new Date().toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-bone-600 text-[10px] text-bottle-800/70">
                  <span>Audit Anchor:</span>
                  <span>Pending Organizer Confirmation</span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handlePrintReceipt}
                  className="py-2.5 px-4 rounded-xl border border-bottle-800/20 text-bottle-950 font-semibold text-xs hover:bg-bone-400 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Receipt</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-bottle-800 hover:bg-bottle-900 text-bone-200 font-semibold text-xs shadow-subtle transition-all cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PayContributionModal;
