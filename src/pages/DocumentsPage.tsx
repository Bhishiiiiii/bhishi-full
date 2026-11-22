import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { VerifyHashModal } from '../components/common/VerifyHashModal';
import { DocumentRecord } from '../types';
import { 
  FileText, 
  Upload, 
  ShieldCheck, 
  Lock, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  FileCheck,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { generateSimulatedHash, truncateHash } from '../utils/cryptoSim';
import api from '../services/api';

export const DocumentsPage: React.FC = () => {
  const { documents, bishis, uploadDocument, addToast, role } = useApp();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [selectedHash, setSelectedHash] = useState('');

  // Live Tamper Detection Interactive Demo State
  const defaultText = 'We, the undersigned members of Sunrise Circle, mutually agree that Month 7 payout of ₹20,000 shall be allocated to Sneha Patil without auction discount.';
  const [tamperDocContent, setTamperDocContent] = useState(defaultText);
  const originalAnchorHash = '0x202d1c1595093244e4cd80285b55a44833e6632137c673d33f30ff4e9d29fe8b';

  const [tamperResult, setTamperResult] = useState<{
    matched: boolean;
    status: string;
    storedHash: string;
    liveHash: string;
    message?: string;
  }>({
    matched: true,
    status: 'AUTHENTIC & VERIFIED',
    storedHash: originalAnchorHash,
    liveHash: originalAnchorHash
  });

  const [isVerifyingTamper, setIsVerifyingTamper] = useState(false);

  // Wire live tamper check to POST /api/documents/:id/verify-integrity
  useEffect(() => {
    let active = true;
    setIsVerifyingTamper(true);

    api.verifyDocumentIntegrity('doc-1', tamperDocContent)
      .then(res => {
        if (!active) return;
        setTamperResult({
          matched: res.matched,
          status: res.status,
          storedHash: res.storedHash || originalAnchorHash,
          liveHash: res.liveHash || generateSimulatedHash(tamperDocContent),
          message: res.message
        });
      })
      .catch(() => {
        if (!active) return;
        const computed = generateSimulatedHash(tamperDocContent);
        const isMatched = computed.toLowerCase() === originalAnchorHash.toLowerCase();
        setTamperResult({
          matched: isMatched,
          status: isMatched ? 'AUTHENTIC & VERIFIED' : 'TAMPERED / MISMATCH',
          storedHash: originalAnchorHash,
          liveHash: computed
        });
      })
      .finally(() => {
        if (active) setIsVerifyingTamper(false);
      });

    return () => { active = false; };
  }, [tamperDocContent]);

  const categories = ['All', 'Agreement', 'Group Rules', 'Audit Report'];

  const filteredDocs = documents.filter(d => {
    const matchSearch = d.title.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'All' || d.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const handleSimulatedUpload = async () => {
    await uploadDocument({
      bishiId: bishis[0]?.id || 'bishi-1',
      title: 'Member Acknowledgment Affidavit - Cycle 7',
      category: 'Identity Verification',
      fileSize: '1.1 MB',
      content: 'Affidavit for Cycle 7 member identity and settlement signatures.'
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      <VerifyHashModal
        isOpen={verifyModalOpen}
        onClose={() => setVerifyModalOpen(false)}
        initialHash={selectedHash}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-bottle-800/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-bottle-950">
            Document Vault & Cryptographic Charters
          </h1>
          <p className="text-xs sm:text-sm text-bottle-800/70 mt-0.5">
            Archived agreements, group charters, and independent auditor compliance reports anchored on Sepolia.
          </p>
        </div>

        {(role === 'organizer' || role === 'admin') && (
          <button
            onClick={handleSimulatedUpload}
            className="px-4 py-2.5 rounded-xl bg-bottle-800 hover:bg-bottle-900 text-bone-200 text-xs font-semibold shadow-subtle flex items-center gap-1.5 self-start transition-all"
          >
            <Upload className="w-4 h-4 text-crimson-400" />
            <span>Upload New Charter</span>
          </button>
        )}
      </div>

      {/* LIVE TAMPER DETECTION DEMO */}
      <div className="p-6 md:p-8 rounded-3xl bg-bottle-900 text-bone-200 border border-bone-500/20 shadow-premium space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-bone-500/15">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold-400 mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Interactive Blockchain Tamper Detection Sandbox (Live Express API)</span>
            </div>
            <h3 className="text-lg font-serif font-bold text-bone-100">
              Why Centralized Records Fail & Hash Anchoring Succeeds
            </h3>
          </div>
          <button
            onClick={() => setTamperDocContent(defaultText)}
            className="text-xs text-bone-400 hover:text-bone-200 flex items-center gap-1 self-start"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Text</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 space-y-3">
            <label className="text-xs font-semibold text-bone-300 block">
              Edit the charter text below (try changing ₹20,000 to ₹30,000 or altering a name):
            </label>
            <textarea
              rows={4}
              value={tamperDocContent}
              onChange={e => setTamperDocContent(e.target.value)}
              className="w-full text-xs font-mono bg-bottle-950 border border-bone-500/20 rounded-xl p-3 text-bone-100 outline-none focus:border-gold-400 leading-relaxed"
            />
            <p className="text-[11px] text-bone-400">
              In traditional informal Bishi, an organizer could change a spreadsheet secretly. With blockchain hash anchoring, altering even one space changes the entire SHA-256 fingerprint!
            </p>
          </div>

          <div className="lg:col-span-5 space-y-3">
            <div className="p-4 rounded-xl bg-bottle-950 border border-bone-500/15 space-y-3 text-xs">
              <div>
                <span className="text-[10px] text-bone-400 uppercase font-mono">Sepolia Anchored Digest (Block #1872100):</span>
                <div className="font-mono text-[11px] text-gold-400 break-all mt-0.5">
                  {tamperResult.storedHash}
                </div>
              </div>

              <div>
                <span className="text-[10px] text-bone-400 uppercase font-mono">Calculated Live Document Digest:</span>
                <div className="font-mono text-[11px] text-bone-200 break-all mt-0.5">
                  {tamperResult.liveHash}
                </div>
              </div>

              <div className={`p-2.5 rounded-lg border flex items-center gap-2 font-bold ${
                !tamperResult.matched 
                  ? 'bg-crimson-900/60 border-crimson-500 text-crimson-200' 
                  : 'bg-emerald-950 border-emerald-500 text-emerald-300'
              }`}>
                {isVerifyingTamper ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-bone-300" />
                    <span>Verifying integrity against Ethereum Sepolia...</span>
                  </>
                ) : !tamperResult.matched ? (
                  <>
                    <AlertTriangle className="w-4 h-4 text-crimson-400 flex-shrink-0" />
                    <span>HASH MISMATCH: Unauthorized Alteration Detected!</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>INTEGRITY VERIFIED: Document matches on-chain root</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Document Directory */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  categoryFilter === cat
                    ? 'bg-bottle-800 text-bone-200 shadow-sm'
                    : 'bg-white hover:bg-bone-400/80 text-bottle-800/80 border border-bottle-800/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-bottle-700 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search document title..."
              className="w-full text-xs font-medium bg-white border border-bottle-800/15 rounded-xl pl-9 pr-4 py-1.5 text-bottle-950 outline-none focus:border-bottle-800 shadow-subtle"
            />
          </div>
        </div>

        {filteredDocs.length === 0 ? (
          <div className="p-10 rounded-2xl bg-white border border-bottle-800/10 shadow-subtle text-center text-xs text-bottle-800/70">
            No documents found matching your filter criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredDocs.map(doc => (
              <div
                key={doc.id}
                className="p-6 rounded-2xl bg-white border border-bottle-800/10 shadow-subtle flex flex-col justify-between space-y-4 hover:border-bottle-800/25 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-bottle-800 text-bone-200 flex items-center justify-center font-bold">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-serif font-bold text-bottle-950">{doc.title}</h3>
                        <div className="text-xs text-bottle-800/60">{doc.bishiName} • {doc.category}</div>
                      </div>
                    </div>

                    <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Anchored
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-bone-300/60 border border-bottle-800/10 font-mono text-[11px] text-bottle-900 mt-4 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-bottle-800/60">SHA-256 Digest:</span>
                      <span>{truncateHash(doc.sha256Hash, 8)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-bottle-800/60">Block Height:</span>
                      <span>#{doc.blockNumber}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-bone-600 flex items-center justify-between text-xs">
                  <span className="text-bottle-800/60">Uploaded by {doc.uploadedBy} on {doc.uploadDate}</span>
                  <button
                    onClick={() => {
                      setSelectedHash(doc.sha256Hash);
                      setVerifyModalOpen(true);
                    }}
                    className="font-semibold text-bottle-800 hover:text-crimson-700 flex items-center gap-1"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verify On-Chain</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
