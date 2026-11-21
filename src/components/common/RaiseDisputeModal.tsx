import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DisputeRecord } from '../../types';
import { X, AlertTriangle, ShieldAlert } from 'lucide-react';

interface RaiseDisputeModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetRecordId?: string;
  targetRecordType?: DisputeRecord['targetRecordType'];
}

export const RaiseDisputeModal: React.FC<RaiseDisputeModalProps> = ({
  isOpen,
  onClose,
  targetRecordId = 'cnt-104',
  targetRecordType = 'Contribution'
}) => {
  const { bishis, selectedBishiId, raiseDispute } = useApp();
  const [bishiId, setBishiId] = useState(selectedBishiId);
  const [category, setCategory] = useState<DisputeRecord['category']>('Contribution Record');
  const [recordId, setRecordId] = useState(targetRecordId);
  const [recordType, setRecordType] = useState<DisputeRecord['targetRecordType']>(targetRecordType);
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    raiseDispute({
      bishiId,
      category,
      targetRecordId: recordId,
      targetRecordType: recordType,
      description
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bottle-950/70 backdrop-blur-sm animate-in fade-in">
      <div 
        className="w-full max-w-md bg-white rounded-2xl shadow-elevated border border-bottle-800/15 overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-bone-600 bg-bone-400/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-crimson-100 flex items-center justify-center text-crimson-800">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-serif font-bold text-bottle-950">Raise Formal Query / Dispute</h3>
              <p className="text-xs text-bottle-800/70">Recorded on community audit trail</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-bottle-800/50 hover:text-bottle-950 hover:bg-bone-600/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-bottle-900 block mb-1">
              Select Bishi Community
            </label>
            <select
              value={bishiId}
              onChange={e => setBishiId(e.target.value)}
              className="w-full text-xs font-medium bg-bone-300 border border-bottle-800/20 rounded-xl p-2.5 text-bottle-950 outline-none focus:border-bottle-800"
            >
              {bishis.map(b => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-bottle-900 block mb-1">
                Dispute Category
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as DisputeRecord['category'])}
                className="w-full text-xs font-medium bg-bone-300 border border-bottle-800/20 rounded-xl p-2.5 text-bottle-950 outline-none focus:border-bottle-800"
              >
                <option value="Contribution Record">Contribution Record</option>
                <option value="Payout Discrepancy">Payout Discrepancy</option>
                <option value="Schedule Change">Schedule Change</option>
                <option value="Member Conduct">Member Conduct</option>
                <option value="Document Hash">Document Hash</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-bottle-900 block mb-1">
                Target Record ID
              </label>
              <input
                type="text"
                value={recordId}
                onChange={e => setRecordId(e.target.value)}
                placeholder="e.g. cnt-104 or pay-3"
                className="w-full text-xs font-mono font-medium bg-bone-300 border border-bottle-800/20 rounded-xl p-2.5 text-bottle-950 outline-none focus:border-bottle-800"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-bottle-900 block mb-1">
              Describe Query / Discrepancy
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="State the discrepancy clearly with payment reference or timestamp..."
              className="w-full text-xs font-medium bg-bone-300 border border-bottle-800/20 rounded-xl p-2.5 text-bottle-950 outline-none focus:border-bottle-800"
            />
          </div>

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
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-crimson-700 hover:bg-crimson-800 text-bone-100 shadow-subtle transition-all"
            >
              Submit to Organizer & Ledger
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
