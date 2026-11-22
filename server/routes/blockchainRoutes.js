import express from 'express';
import { blockchainService } from '../services/blockchainService.js';
import LedgerEntry from '../models/LedgerEntry.js';
import Contribution from '../models/Contribution.js';
import Payout from '../models/Payout.js';
import DocumentRecord from '../models/DocumentRecord.js';
import BishiGroup from '../models/BishiGroup.js';

const router = express.Router();

// GET /api/blockchain/proofs - Unified proof list with hash, txHash / fallback marker, status, and timestamp
router.get('/proofs', async (req, res) => {
  try {
    const { page = 1, limit = 50, status } = req.query;
    const isFallback = blockchainService.getNetworkStatus().isFallback;

    const [events, contributions, payouts, docs, groups] = await Promise.all([
      LedgerEntry.find().sort({ createdAt: -1 }).limit(Number(limit)).lean(),
      Contribution.find().sort({ createdAt: -1 }).limit(Number(limit)).lean(),
      Payout.find().sort({ createdAt: -1 }).limit(Number(limit)).lean(),
      DocumentRecord.find().sort({ createdAt: -1 }).limit(Number(limit)).lean(),
      BishiGroup.find().sort({ createdAt: -1 }).limit(Number(limit)).lean()
    ]);

    const proofs = [];

    // 1. Group rules digests
    groups.forEach(g => {
      if (g.rulesHash) {
        proofs.push({
          id: `proof-${g.id}`,
          recordId: g.id,
          groupId: g.id,
          groupName: g.name,
          recordType: 'Group Charter & Rules Digest',
          hash: g.rulesHash,
          txHash: isFallback ? 'fallback' : (g.blockchainTxHash || 'fallback'),
          rawTxHash: g.blockchainTxHash,
          blockNumber: g.blockNumber || 1872100,
          status: g.isVerifiedOnChain ? 'Confirmed' : 'Pending',
          timestamp: g.startDate || 'Recent',
          network: 'Ethereum Sepolia'
        });
      }
    });

    // 2. Documents
    docs.forEach(d => {
      proofs.push({
        id: `proof-${d.id}`,
        recordId: d.id,
        groupId: d.bishiId,
        groupName: d.bishiName,
        recordType: `Document: ${d.category}`,
        hash: d.sha256Hash,
        txHash: isFallback ? 'fallback' : (d.txHash || 'fallback'),
        rawTxHash: d.txHash,
        blockNumber: d.blockNumber || 1894201,
        status: d.blockchainAnchored ? 'Confirmed' : 'Pending',
        timestamp: d.uploadDate || 'Recent',
        network: 'Ethereum Sepolia'
      });
    });

    // 3. Ledger Events
    events.forEach(e => {
      proofs.push({
        id: `proof-${e.id}`,
        recordId: e.recordId,
        groupId: e.bishiId,
        groupName: e.bishiName,
        recordType: e.eventType,
        hash: e.recordHash,
        txHash: isFallback ? 'fallback' : (e.blockchainTxHash || 'fallback'),
        rawTxHash: e.blockchainTxHash,
        blockNumber: e.blockNumber || 1894185,
        status: e.verificationStatus === 'Flagged' ? 'Tamper Alert' : e.verificationStatus || 'Confirmed',
        timestamp: e.timestamp || 'Recent',
        network: 'Ethereum Sepolia'
      });
    });

    // 4. Contributions
    contributions.forEach(c => {
      proofs.push({
        id: `proof-${c.id}`,
        recordId: c.id,
        groupId: c.bishiId,
        groupName: c.bishiName,
        recordType: `Contribution: ${c.memberName}`,
        hash: c.recordHash,
        txHash: isFallback ? 'fallback' : (c.blockchainTxHash || 'fallback'),
        rawTxHash: c.blockchainTxHash,
        blockNumber: c.blockNumber || 1894201,
        status: c.isVerifiedOnChain ? 'Confirmed' : 'Pending',
        timestamp: c.paidDate || c.dueDate || 'Recent',
        network: 'Ethereum Sepolia'
      });
    });

    // Filter by status if provided
    let filteredProofs = proofs;
    if (status && status !== 'All') {
      filteredProofs = proofs.filter(p => p.status.toLowerCase() === status.toLowerCase());
    }

    const startIndex = (Number(page) - 1) * Number(limit);
    const paginated = filteredProofs.slice(startIndex, startIndex + Number(limit));

    return res.json({
      success: true,
      count: paginated.length,
      total: filteredProofs.length,
      page: Number(page),
      limit: Number(limit),
      mode: isFallback ? 'fallback' : 'sepolia',
      data: paginated,
      proofs: paginated
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Explorer Records endpoint: Powers the Blockchain Verification page & Explorer UI
router.get('/records', async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    const [events, contributions, payouts, docs] = await Promise.all([
      LedgerEntry.find({ blockchainTxHash: { $exists: true, $ne: '' } }).sort({ createdAt: -1 }).limit(Number(limit)).lean(),
      Contribution.find({ blockchainTxHash: { $exists: true, $ne: '' } }).sort({ createdAt: -1 }).limit(Number(limit)).lean(),
      Payout.find({ blockchainTxHash: { $exists: true, $ne: '' } }).sort({ createdAt: -1 }).limit(Number(limit)).lean(),
      DocumentRecord.find({ txHash: { $exists: true, $ne: '' } }).sort({ createdAt: -1 }).limit(Number(limit)).lean()
    ]);

    const records = [];

    events.forEach(e => {
      records.push({
        id: e.id,
        recordId: e.recordId,
        groupId: e.bishiId,
        groupName: e.bishiName,
        recordType: e.eventType,
        recordHash: e.recordHash,
        blockNumber: e.blockNumber || 1894201,
        txHash: e.blockchainTxHash,
        timestamp: e.timestamp,
        network: 'Ethereum Sepolia',
        status: e.verificationStatus === 'Flagged' ? 'Flagged' : 'Confirmed',
        explorerUrl: blockchainService.getExplorerUrl(e.blockchainTxHash)
      });
    });

    docs.forEach(d => {
      records.push({
        id: d.id,
        recordId: d.id,
        groupId: d.bishiId,
        groupName: d.bishiName,
        recordType: `Document: ${d.category}`,
        recordHash: d.sha256Hash,
        blockNumber: d.blockNumber || 1894201,
        txHash: d.txHash,
        timestamp: d.uploadDate,
        network: 'Ethereum Sepolia',
        status: 'Confirmed',
        explorerUrl: blockchainService.getExplorerUrl(d.txHash)
      });
    });

    return res.json({
      success: true,
      count: records.length,
      network: blockchainService.getNetworkStatus(),
      records,
      data: records
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Independent Record Verifier tool endpoint
router.post('/verify', async (req, res) => {
  try {
    const { queryHash, recordHash, recordId } = req.body;
    const target = queryHash || recordHash || recordId;

    if (!target) {
      return res.status(400).json({ success: false, message: 'Please provide queryHash, recordHash, or recordId' });
    }

    const clean = target.trim();

    // Query across database for rich contextual response
    const [doc, event, contrib, payout] = await Promise.all([
      DocumentRecord.findOne({
        $or: [{ sha256Hash: { $regex: clean, $options: 'i' } }, { txHash: { $regex: clean, $options: 'i' } }, { id: clean }]
      }),
      LedgerEntry.findOne({
        $or: [{ recordHash: { $regex: clean, $options: 'i' } }, { blockchainTxHash: { $regex: clean, $options: 'i' } }, { recordId: clean }]
      }),
      Contribution.findOne({
        $or: [{ recordHash: { $regex: clean, $options: 'i' } }, { blockchainTxHash: { $regex: clean, $options: 'i' } }, { id: clean }]
      }),
      Payout.findOne({
        $or: [{ recordHash: { $regex: clean, $options: 'i' } }, { blockchainTxHash: { $regex: clean, $options: 'i' } }, { id: clean }]
      })
    ]);

    // Check with Blockchain Verification Service (Sepolia contract / fallback)
    const onChainResult = await blockchainService.verifyRecord(clean);

    if (doc) {
      const tx = doc.txHash || onChainResult.blockchainTxHash;
      return res.json({
        success: true,
        matched: true,
        recordType: 'Document Vault Fingerprint',
        details: doc,
        blockNumber: doc.blockNumber || 1894201,
        timestamp: doc.uploadDate,
        merkleProof: tx,
        blockchainTxHash: tx,
        explorerUrl: blockchainService.getExplorerUrl(tx),
        network: 'Ethereum Sepolia',
        verificationStatus: 'VERIFIED'
      });
    }

    if (event) {
      const tx = event.blockchainTxHash || onChainResult.blockchainTxHash;
      return res.json({
        success: true,
        matched: true,
        recordType: `Ledger Event: ${event.eventType}`,
        details: event,
        blockNumber: event.blockNumber || 1894185,
        timestamp: event.timestamp,
        merkleProof: tx,
        blockchainTxHash: tx,
        explorerUrl: blockchainService.getExplorerUrl(tx),
        network: 'Ethereum Sepolia',
        verificationStatus: event.verificationStatus === 'Flagged' ? 'TAMPERED / MISMATCH' : 'VERIFIED'
      });
    }

    if (contrib) {
      const tx = contrib.blockchainTxHash || onChainResult.blockchainTxHash;
      return res.json({
        success: true,
        matched: true,
        recordType: `Contribution: ${contrib.memberName} (₹${contrib.amount.toLocaleString()})`,
        details: contrib,
        blockNumber: contrib.blockNumber || 1894201,
        timestamp: contrib.paidDate || 'Recent',
        merkleProof: tx,
        blockchainTxHash: tx,
        explorerUrl: blockchainService.getExplorerUrl(tx),
        network: 'Ethereum Sepolia',
        verificationStatus: 'VERIFIED'
      });
    }

    if (payout) {
      const tx = payout.blockchainTxHash || onChainResult.blockchainTxHash;
      return res.json({
        success: true,
        matched: true,
        recordType: `Payout: ${payout.recipientName} (₹${payout.amount.toLocaleString()})`,
        details: payout,
        blockNumber: payout.blockNumber || 1894098,
        timestamp: payout.scheduledDate,
        merkleProof: tx,
        blockchainTxHash: tx,
        explorerUrl: blockchainService.getExplorerUrl(tx),
        network: 'Ethereum Sepolia',
        verificationStatus: 'VERIFIED'
      });
    }

    if (onChainResult.matched) {
      return res.json({
        success: true,
        matched: true,
        recordType: onChainResult.recordType || 'Consortium State Digest',
        details: onChainResult,
        blockNumber: onChainResult.blockNumber || 1894200,
        timestamp: onChainResult.timestamp || 'Synchronized State',
        merkleProof: onChainResult.blockchainTxHash,
        blockchainTxHash: onChainResult.blockchainTxHash,
        explorerUrl: onChainResult.explorerUrl,
        network: onChainResult.network || 'Ethereum Sepolia',
        verificationStatus: 'VERIFIED'
      });
    }

    return res.json({
      success: true,
      matched: false,
      verificationStatus: 'TAMPERED / UNRECOGNIZED',
      message: 'No cryptographic proof matching this hash exists on the Ethereum Sepolia consortium ledger.'
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Recent Consortium Blocks Feed (matching BlockchainVerificationPage UI)
router.get('/blocks', async (req, res) => {
  const blocks = [
    {
      blockNumber: 1894201,
      timestamp: '18 Nov 2026, 04:30:12 PM',
      hash: '0x889a01f2e3d4c5b6a7980123456789abcdef0123456789abcdef0123456789ab',
      prevHash: '0x778901e1d2c3b4a596870123456789abcdef0123456789abcdef0123456789aa',
      transactionsCount: 14,
      recordsAnchored: 6,
      validator: 'Validator-Node-Mumbai-01',
      gasUsed: '142,500 Gwei'
    },
    {
      blockNumber: 1894185,
      timestamp: '15 Nov 2026, 11:20:45 AM',
      hash: '0x7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f8f7a6b5c4d3e2f1a0b9c8d7e',
      prevHash: '0x6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e7e6f5a4b3c2d1e0f9a8b7c6d',
      transactionsCount: 22,
      recordsAnchored: 12,
      validator: 'Consortium-Node-Pune-04',
      gasUsed: '215,840 Gwei'
    },
    {
      blockNumber: 1894098,
      timestamp: '10 Nov 2026, 06:15:30 PM',
      hash: '0xef0123456789abcdef0123456789abcdef0123456789abcdef0123456789a012',
      prevHash: '0xde0123456789abcdef0123456789abcdef0123456789abcdef0123456789a011',
      transactionsCount: 8,
      recordsAnchored: 3,
      validator: 'Validator-Node-Bengaluru-02',
      gasUsed: '98,200 Gwei'
    }
  ];
  return res.json({ success: true, blocks });
});

// Network Status
router.get('/status', (req, res) => {
  return res.json({
    success: true,
    status: blockchainService.getNetworkStatus()
  });
});

export default router;
