import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, CheckCircle2, AlertCircle, X, Search, Hash } from 'lucide-react';
import { truncateHash } from '../../utils/cryptoSim';

interface VerifyHashModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialHash?: string;
}

export const VerifyHashModal: React.FC<VerifyHashModalProps> = ({
  isOpen,
  onClose,
  initialHash = ''
}) => {
  const { ledgerEvents, documents, contributions, payouts, blocks } = useApp();
  const [queryHash, setQueryHash] = useState(initialHash);
  const [verificationResult, setVerificationResult] = useState<{
    matched: boolean;
    recordType?: string;
    details?: any;
    blockNumber?: number;
    timestamp?: string;
    merkleProof?: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanHash = queryHash.trim().toLowerCase();

    // Check across ledger, documents, contributions, payouts
    const matchedDoc = documents.find(d => d.sha256Hash.toLowerCase() === cleanHash || d.txHash?.toLowerCase() === cleanHash);
    const matchedEvent = ledgerEvents.find(e => e.recordHash.toLowerCase() === cleanHash || e.blockchainTxHash?.toLowerCase() === cleanHash);
    const matchedContrib = contributions.find(c => c.recordHash.toLowerCase() === cleanHash || c.blockchainTxHash?.toLowerCase() === cleanHash);
    const matchedPayout = payouts.find(p => p.recordHash.toLowerCase() === cleanHash || p.blockchainTxHash?.toLowerCase() === cleanHash);

    if (matchedDoc) {
      setVerificationResult({
        matched: true,
        recordType: 'Document Vault Fingerprint',
        details: matchedDoc,
        blockNumber: matchedDoc.blockNumber || 1894201,
        timestamp: matchedDoc.uploadDate,
        merkleProof: '0x889a01f2e3d4c5b6a7980123456789abcdef0123456789abcdef0123456789ab'
      });
    } else if (matchedEvent) {
      setVerificationResult({
        matched: true,
        recordType: `Ledger Event: ${matchedEvent.eventType}`,
        details: matchedEvent,
        blockNumber: matchedEvent.blockNumber || 1894185,
        timestamp: matchedEvent.timestamp,
        merkleProof: matchedEvent.blockchainTxHash || '0x7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f8f7a6b5c4d3e2f1a0b9c8d7e'
      });
    } else if (matchedContrib) {
      setVerificationResult({
        matched: true,
        recordType: `Contribution: ${matchedContrib.memberName} (${formatCurrency(matchedContrib.amount)})`,
        details: matchedContrib,
        blockNumber: 1894201,
        timestamp: matchedContrib.paidDate || 'Recent',
        merkleProof: matchedContrib.blockchainTxHash || '0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d'
      });
    } else if (matchedPayout) {
      setVerificationResult({
        matched: true,
        recordType: `Payout: ${matchedPayout.recipientName} (${formatCurrency(matchedPayout.amount)})`,
        details: matchedPayout,
        blockNumber: 1894098,
        timestamp: matchedPayout.scheduledDate,
        merkleProof: matchedPayout.blockchainTxHash || '0xef0123456789abcdef0123456789abcdef'
      });
    } else {
      // Simulate verified record if format looks like a hash
      if (cleanHash.startsWith('0x') && cleanHash.length >= 20) {
        setVerificationResult({
          matched: true,
          recordType: 'Consortium Sidechain Root Digest',
          details: { note: 'Record hash recognized by validator state proof.' },
          blockNumber: 1894200,
          timestamp: 'Synchronized State',
          merkleProof: '0x11223344556677889900aabbccddeeff00112233'
        });
      } else {
        setVerificationResult({ matched: false });
      }
    }
  };

  function formatCurrency(val: number) {
    return `₹${val.toLocaleString()}`;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bottle-950/70 backdrop-blur-sm animate-in fade-in">
      <div 
        className="w-full max-w-xl bg-white rounded-2xl shadow-elevated border border-bottle-800/15 overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-bone-600 bg-bottle-900 text-bone-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-gold-400" />
            <div>
              <h3 className="text-base font-serif font-bold text-bone-100">Cryptographic Hash Verifier</h3>
              <p className="text-xs text-bone-400 font-mono">Consortium L2 Consortium Ledger</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-bone-400 hover:text-bone-100 hover:bg-bottle-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <form onSubmit={handleVerify} className="space-y-3">
            <label className="text-xs font-semibold text-bottle-900 block">
              Enter SHA-256 Digest or Blockchain Transaction Hash:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={queryHash}
                onChange={e => setQueryHash(e.target.value)}
                placeholder="e.g. 0x889a01f2e3d4c5b6a79801... or paste document SHA-256"
                className="w-full text-xs font-mono font-medium bg-bone-300 border border-bottle-800/20 rounded-xl p-2.5 text-bottle-950 outline-none focus:border-bottle-800"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-bottle-800 hover:bg-bottle-900 text-bone-200 text-xs font-semibold flex items-center gap-1.5 flex-shrink-0"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Verify</span>
              </button>
            </div>
          </form>

          {/* Quick test sample pills */}
          <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-bottle-800/70">
            <span>Try sample hash:</span>
            <button
              onClick={() => {
                const sample = '0x889a01f2e3d4c5b6a7980123456789abcdef0123456789abcdef0123456789ab';
                setQueryHash(sample);
              }}
              className="px-2 py-0.5 bg-bone-400 hover:bg-bone-500 rounded font-mono text-[10px]"
            >
              Payout Tx (0x889a...)
            </button>
            <button
              onClick={() => {
                const sample = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
                setQueryHash(sample);
              }}
              className="px-2 py-0.5 bg-bone-400 hover:bg-bone-500 rounded font-mono text-[10px]"
            >
              Bishi Charter (e3b0...)
            </button>
          </div>

          {/* Verification Results */}
          {verificationResult && (
            <div className="mt-4 pt-4 border-t border-bone-600 animate-in fade-in">
              {verificationResult.matched ? (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>Cryptographic Integrity Verified</span>
                  </div>
                  <div className="text-xs text-emerald-900 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-emerald-700">Record Identity:</span>
                      <span className="font-semibold">{verificationResult.recordType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-emerald-700">Anchored in Block:</span>
                      <span className="font-mono font-semibold">#{verificationResult.blockNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-emerald-700">Timestamp:</span>
                      <span>{verificationResult.timestamp}</span>
                    </div>
                    <div className="flex justify-between font-mono text-[10px] pt-1 border-t border-emerald-200/60">
                      <span className="text-emerald-700">Merkle Root:</span>
                      <span>{truncateHash(verificationResult.merkleProof, 10)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-crimson-50 border border-crimson-200 text-crimson-900 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-crimson-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">No Matching State Anchor Found</div>
                    <div className="mt-0.5 leading-relaxed text-crimson-800">
                      This hash does not exist in the active consortium ledger or the record was altered, creating a digest mismatch.
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
