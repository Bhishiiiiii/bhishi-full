import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { VerifyHashModal } from '../components/common/VerifyHashModal';
import { 
  ShieldCheck, 
  Layers, 
  Cpu, 
  Search, 
  CheckCircle2, 
  ArrowRight, 
  Clock, 
  FileText,
  Activity
} from 'lucide-react';
import { truncateHash } from '../utils/cryptoSim';

export const BlockchainVerificationPage: React.FC = () => {
  const { blocks, ledgerEvents, documents, contributions } = useApp();

  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [targetHash, setTargetHash] = useState('');
  const [activeNetwork] = useState('Consortium L2 (Polygon Supernet - Mumbai Node)');

  return (
    <div className="space-y-8 animate-in fade-in">
      <VerifyHashModal
        isOpen={verifyModalOpen}
        onClose={() => setVerifyModalOpen(false)}
        initialHash={targetHash}
      />

      {/* Header with Network Live Badge */}
      <div className="p-6 md:p-8 rounded-3xl bg-bottle-900 text-bone-200 border border-bone-500/20 shadow-premium flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-bone-300">
              Demo Blockchain Environment
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-bone-100">
            Web3 Verification & Consortium Explorer
          </h1>
          <p className="text-xs sm:text-sm text-bone-300/80 max-w-xl font-light leading-relaxed">
            Transparent notary layer anchoring community savings charters, contribution references, and non-auction payout settlements.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-bottle-950/90 border border-bone-500/15 space-y-2 text-xs">
          <div className="text-bone-400 text-[11px]">Active Consensus Network</div>
          <div className="font-mono text-gold-400 font-semibold">{activeNetwork}</div>
          <div className="text-[11px] text-bone-400 flex items-center justify-between pt-1 border-t border-bone-500/10">
            <span>Current Height:</span>
            <span className="text-bone-100 font-bold">Block #{blocks[0]?.blockNumber}</span>
          </div>
        </div>
      </div>

      {/* Interactive Hash Verification Banner */}
      <div className="p-6 rounded-2xl bg-white border border-bottle-800/10 shadow-subtle space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-serif font-bold text-bottle-950">Independent Record Verifier</h3>
            <p className="text-xs text-bottle-800/70">
              Input any record hash, receipt SHA-256 digest, or smart contract transaction reference
            </p>
          </div>
          <button
            onClick={() => {
              setTargetHash('0x889a01f2e3d4c5b6a7980123456789abcdef0123456789abcdef0123456789ab');
              setVerifyModalOpen(true);
            }}
            className="px-5 py-2.5 rounded-xl bg-bottle-800 hover:bg-bottle-900 text-bone-200 text-xs font-semibold shadow-subtle flex items-center gap-2 self-start transition-all"
          >
            <ShieldCheck className="w-4 h-4 text-gold-400" />
            <span>Launch Verifier Tool</span>
          </button>
        </div>
      </div>

      {/* 5-Step Visual Verification Flow */}
      <div className="p-6 rounded-2xl bg-bone-400/50 border border-bottle-800/10 shadow-subtle space-y-4">
        <h3 className="text-sm font-serif font-bold text-bottle-950 uppercase tracking-wider font-mono">
          How Verification Works Behind the Scenes
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
          {[
            { step: '1. Group Event', desc: 'Member pays or payout is confirmed.' },
            { step: '2. SHA-256 Digest', desc: 'A deterministic cryptographic digest is computed.' },
            { step: '3. Merkle Aggregation', desc: 'Vouchers aggregated into monthly block trees.' },
            { step: '4. Consortium Anchor', desc: 'Root hash committed to smart contract.' },
            { step: '5. Independent Audit', desc: 'Members verify without trusting any middleman.' }
          ].map((item, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-white border border-bottle-800/10 space-y-1">
              <div className="font-bold text-bottle-950 text-xs">{item.step}</div>
              <p className="text-[11px] text-bottle-800/70 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Blockchain Blocks Feed */}
      <div className="p-6 rounded-2xl bg-white border border-bottle-800/10 shadow-subtle space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-bone-600">
          <div>
            <h3 className="text-base font-serif font-bold text-bottle-950">Recent Consortium Blocks</h3>
            <p className="text-xs text-bottle-800/70">Live state synchronizations on the sidechain</p>
          </div>
          <span className="text-xs font-mono text-bottle-800/60">Average Block Time: 3.2s</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-bone-600 text-[11px] font-semibold uppercase tracking-wider text-bottle-800/70">
                <th className="py-3 px-3">Block Height</th>
                <th className="py-3 px-3">Timestamp</th>
                <th className="py-3 px-3">State Hash</th>
                <th className="py-3 px-3">Anchored Records</th>
                <th className="py-3 px-3">Validator Node</th>
                <th className="py-3 px-3 text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bone-600">
              {blocks.map(block => (
                <tr key={block.blockNumber} className="hover:bg-bone-300/40 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-bottle-950">
                    #{block.blockNumber}
                  </td>
                  <td className="py-3 px-3 text-bottle-800/70">{block.timestamp}</td>
                  <td className="py-3 px-3 font-mono text-bottle-950">
                    {truncateHash(block.hash, 8)}
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-semibold text-bottle-950">{block.recordsAnchored} receipts</span>
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px] text-bottle-800/70">
                    {block.validator}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => {
                        setTargetHash(block.hash);
                        setVerifyModalOpen(true);
                      }}
                      className="text-emerald-700 hover:text-emerald-900 text-xs font-medium flex items-center gap-1 ml-auto"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Inspect</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
