import React, { useState, useEffect } from 'react';
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
  Activity,
  ExternalLink
} from 'lucide-react';
import { truncateHash } from '../utils/cryptoSim';
import api from '../services/api';

export const BlockchainVerificationPage: React.FC = () => {
  const { blocks, ledgerEvents, documents, contributions, blockchainStatus, isBackendConnected, blockchainProofs } = useApp();

  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [targetHash, setTargetHash] = useState('');
  const [liveStatus, setLiveStatus] = useState<any>(blockchainStatus);

  useEffect(() => {
    api.getBlockchainStatus()
      .then(res => {
        if (res?.status) setLiveStatus(res.status);
      })
      .catch(err => {
        console.warn('Could not fetch live blockchain status, using cached state:', err);
      });
  }, []);

  const isLiveSepolia = liveStatus?.rpcConnected === true;
  const currentHeight = liveStatus?.currentBlockHeight || blocks[0]?.blockNumber || 1894201;
  const contractAddress = liveStatus?.contractAddress || '0x892a014a51e605d3b6a98711ef84b01e3b52601a';

  return (
    <div className="space-y-8 animate-in fade-in">
      <VerifyHashModal
        isOpen={verifyModalOpen}
        onClose={() => setVerifyModalOpen(false)}
        initialHash={targetHash}
      />

      {/* Header with Live Network Status Badge */}
      <div className="p-6 md:p-8 rounded-3xl bg-bottle-900 text-bone-200 border border-bone-500/20 shadow-premium flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`w-2.5 h-2.5 rounded-full ${isLiveSepolia ? 'bg-emerald-400' : 'bg-gold-400'} animate-pulse`}></span>
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-bone-200">
              {isLiveSepolia ? 'LIVE_SEPOLIA' : 'FALLBACK_SIMULATION'} Mode
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-bottle-950 text-gold-400 font-mono border border-bone-500/20">
              Ethereum Sepolia Testnet
            </span>
            {isBackendConnected && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 font-mono border border-emerald-500/30">
                API Live :5001
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-bone-100">
            Web3 Verification & Consortium Explorer
          </h1>
          <p className="text-xs sm:text-sm text-bone-300/80 max-w-xl font-light leading-relaxed">
            Transparent notary layer anchoring community savings charters, contribution references, and non-auction payout settlements onto Ethereum Sepolia.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-bottle-950/90 border border-bone-500/15 space-y-2 text-xs min-w-[260px]">
          <div className="flex items-center justify-between text-bone-400 text-[11px]">
            <span>Relayer Engine:</span>
            <span className={`font-mono font-bold ${isLiveSepolia ? 'text-emerald-400' : 'text-gold-400'}`}>
              {isLiveSepolia ? 'LIVE_SEPOLIA' : 'FALLBACK_SIMULATION'}
            </span>
          </div>
          <div className="font-mono text-bone-200 font-semibold flex items-center justify-between text-[11px]">
            <span>Contract:</span>
            <a
              href={`https://sepolia.etherscan.io/address/${contractAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold-400 hover:underline flex items-center gap-1 font-mono text-[11px]"
            >
              <span>{truncateHash(contractAddress, 5)}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <div className="text-[11px] text-bone-400 flex items-center justify-between pt-1 border-t border-bone-500/10">
            <span>Block Height:</span>
            <span className="text-bone-100 font-bold font-mono">Block #{currentHeight}</span>
          </div>
          <div className="text-[11px] text-bone-400 flex items-center justify-between">
            <span>Anchored Records:</span>
            <span className="text-emerald-400 font-bold font-mono">
              {liveStatus?.totalAnchoredRecords || (ledgerEvents.length + documents.length)} Verified
            </span>
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
            { step: '3. Relayer Aggregation', desc: 'Vouchers aggregated into batch state trees.' },
            { step: '4. Sepolia Anchor', desc: 'Hash committed to BishiTrustLedger.sol.' },
            { step: '5. Independent Audit', desc: 'Members verify on Etherscan without crypto wallets.' }
          ].map((item, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-white border border-bottle-800/10 space-y-1">
              <div className="font-bold text-bottle-950 text-xs">{item.step}</div>
              <p className="text-[11px] text-bottle-800/70 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Live Blockchain Proofs Table */}
      <div className="p-6 rounded-2xl bg-white border border-bottle-800/10 shadow-subtle space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-bone-600">
          <div>
            <h3 className="text-base font-serif font-bold text-bottle-950">Live Anchored Proofs on Sepolia</h3>
            <p className="text-xs text-bottle-800/70">Cryptographic audit anchors retrieved from the live verification ledger</p>
          </div>
          <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 font-semibold">
            {blockchainProofs?.length || 0} Anchors Synced
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-bone-600 text-[11px] font-semibold uppercase tracking-wider text-bottle-800/70">
                <th className="py-3 px-3">Record Type</th>
                <th className="py-3 px-3">State Digest / Hash</th>
                <th className="py-3 px-3">Sepolia Tx / Anchor</th>
                <th className="py-3 px-3">Timestamp</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bone-600">
              {(blockchainProofs && blockchainProofs.length > 0 ? blockchainProofs : []).map((proof: any, idx: number) => {
                const status = proof.status || 'Confirmed';
                const isFlagged = status === 'Flagged' || status === 'Tamper Alert';
                const isConfirmed = status === 'Confirmed' || status === 'Verified';

                const statusBadgeClass = isFlagged
                  ? 'bg-crimson-50 text-crimson-800 border-crimson-300 font-bold'
                  : isConfirmed
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold'
                  : 'bg-amber-50 text-amber-800 border-amber-300 font-medium';

                const txDisplay = proof.txHash === 'fallback' 
                  ? 'Deterministic Relayer Anchor' 
                  : (proof.txHash ? truncateHash(proof.txHash, 6) : 'Anchored');

                return (
                  <tr key={proof.id || proof.hash || idx} className="hover:bg-bone-400/30 transition-colors">
                    <td className="py-3 px-3 font-medium text-bottle-950">
                      <div>{proof.recordType || 'Audit Milestone'}</div>
                      {proof.groupName && (
                        <span className="text-[10px] text-bottle-800/60 font-mono">{proof.groupName}</span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono text-bottle-900 text-[11px]">
                      {truncateHash(proof.hash, 8)}
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px]">
                      {proof.txHash && proof.txHash !== 'fallback' ? (
                        <a
                          href={`https://sepolia.etherscan.io/tx/${proof.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-700 hover:underline flex items-center gap-1"
                        >
                          <span>{txDisplay}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-bottle-800/70">{txDisplay}</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-bottle-800/80 text-[11px]">
                      {proof.timestamp}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] border ${statusBadgeClass}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isFlagged ? 'bg-crimson-500' : isConfirmed ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                        {status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => {
                          setTargetHash(proof.hash);
                          setVerifyModalOpen(true);
                        }}
                        className="px-3 py-1 rounded-lg bg-bottle-800 hover:bg-bottle-900 text-bone-200 text-[11px] font-semibold transition-all inline-flex items-center gap-1 shadow-subtle cursor-pointer"
                      >
                        <ShieldCheck className="w-3 h-3 text-gold-400" />
                        <span>Verify</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Blockchain Blocks Feed */}
      <div className="p-6 rounded-2xl bg-white border border-bottle-800/10 shadow-subtle space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-bone-600">
          <div>
            <h3 className="text-base font-serif font-bold text-bottle-950">Recent Consortium Blocks</h3>
            <p className="text-xs text-bottle-800/70">Live state synchronizations on Ethereum Sepolia</p>
          </div>
          <span className="text-xs font-mono text-bottle-800/60">Average Block Time: 12.0s</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-bone-600 text-[11px] font-semibold uppercase tracking-wider text-bottle-800/70">
                <th className="py-3 px-3">Block Height</th>
                <th className="py-3 px-3">Timestamp</th>
                <th className="py-3 px-3">State Hash</th>
                <th className="py-3 px-3">Anchored Records</th>
                <th className="py-3 px-3">Relayer Node</th>
                <th className="py-3 px-3 text-right">Gas Sponsored</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bone-600">
              {blocks.map(block => (
                <tr key={block.blockNumber} className="hover:bg-bone-400/30 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-bottle-950">
                    #{block.blockNumber}
                  </td>
                  <td className="py-3 px-3 text-bottle-800/80">
                    {block.timestamp}
                  </td>
                  <td className="py-3 px-3 font-mono text-bottle-800 text-[11px]">
                    {truncateHash(block.hash, 8)}
                  </td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-semibold border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      {block.recordsAnchored} records
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px] text-bottle-800/70">
                    {block.validator}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-[11px] text-bottle-800/80">
                    {block.gasUsed}
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
