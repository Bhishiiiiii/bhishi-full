import express from 'express';
import Payout from '../models/Payout.js';
import BishiGroup from '../models/BishiGroup.js';
import User from '../models/User.js';
import LedgerEntry from '../models/LedgerEntry.js';
import Notification from '../models/Notification.js';
import { hashService } from '../services/hashService.js';
import { blockchainService } from '../services/blockchainService.js';
import { authenticate, optionalAuth, blockAuditorWrites } from '../middleware/auth.js';

const router = express.Router();

// Get payouts list with multi-criteria filtering, pagination & role scoping
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { bishiId, groupId, status, recipientId, page = 1, limit = 50 } = req.query;
    const filter = {};

    const targetGroup = groupId || bishiId;
    if (targetGroup && targetGroup !== 'All') filter.bishiId = targetGroup;
    if (status && status !== 'All') filter.status = status;
    if (recipientId) filter.recipientId = recipientId;

    // Role-based scoping for authenticated members if not explicitly querying
    if (req.user && req.user.role === 'member' && !recipientId && !targetGroup) {
      filter.recipientId = req.user.id;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [total, payouts] = await Promise.all([
      Payout.countDocuments(filter),
      Payout.find(filter)
        .sort({ monthNumber: 1 })
        .skip(skip)
        .limit(Number(limit))
        .lean()
    ]);

    return res.json({
      success: true,
      count: payouts.length,
      total,
      page: Number(page),
      limit: Number(limit),
      data: payouts,
      payouts
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Organizer records payout milestone disbursement (Protected: Auditor blocked)
router.post('/:id/record', authenticate, blockAuditorWrites, async (req, res) => {
  try {
    const { paymentMethod = 'Bank Transfer', transactionRef = '', proofDocumentUrl = '', actualDate = 'Today' } = req.body;
    const payout = await Payout.findOne({ id: req.params.id });

    if (!payout) {
      return res.status(404).json({ success: false, message: 'Payout milestone not found' });
    }

    payout.status = 'Recorded';
    payout.paymentMethod = paymentMethod;
    payout.transactionRef = transactionRef || `BANK/REF-${Date.now().toString().slice(-6)}`;
    payout.proofDocumentUrl = proofDocumentUrl || `https://bishi.network/payouts/proof-${payout.id}.pdf`;
    payout.actualDate = actualDate;

    // Recompute payout record hash with disbursement details
    payout.recordHash = hashService.computePayoutHash({
      bishiId: payout.bishiId,
      recipientId: payout.recipientId,
      amount: payout.amount,
      monthNumber: payout.monthNumber,
      transactionRef: payout.transactionRef
    });

    await payout.save();

    const ledgerEntry = new LedgerEntry({
      id: `evt-${Date.now()}`,
      bishiId: payout.bishiId,
      bishiName: payout.bishiName,
      timestamp: 'Just now',
      eventType: 'Payout Recorded',
      actor: { id: req.user.id, name: req.user.name, role: req.user.role },
      description: `Disbursement of ₹${payout.amount.toLocaleString()} recorded for ${payout.recipientName} via ${paymentMethod}.`,
      recordId: payout.id,
      recordHash: payout.recordHash,
      verificationStatus: 'Pending'
    });
    await ledgerEntry.save();

    return res.json({
      success: true,
      message: `Disbursement recorded for ${payout.recipientName}`,
      payout,
      data: payout
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Recipient confirms payout receipt (Protected: Auditor blocked)
router.patch('/:id/recipient-confirm', authenticate, blockAuditorWrites, async (req, res) => {
  try {
    const { proofRef } = req.body;
    const payout = await Payout.findOne({ id: req.params.id });

    if (!payout) {
      return res.status(404).json({ success: false, message: 'Payout record not found' });
    }

    payout.status = 'Recipient Confirmed';
    payout.actualDate = 'Today';
    payout.isVerifiedOnChain = true;
    if (proofRef) payout.transactionRef = proofRef;

    // Anchor verified payout milestone proof on Ethereum Sepolia
    const blockchainAnchor = await blockchainService.anchorRecord(
      payout.bishiId,
      payout.id,
      'PAYOUT_CONFIRMED',
      payout.recordHash
    );

    payout.blockchainTxHash = blockchainAnchor.txHash;
    payout.blockNumber = blockchainAnchor.blockNumber;
    await payout.save();

    // Increment recipient's totalReceived counter
    const recipient = await User.findOne({ id: payout.recipientId });
    if (recipient) {
      recipient.totalReceived = (recipient.totalReceived || 0) + payout.amount;
      await recipient.save();
    }

    // Add immutable ledger entry
    const ledgerEntry = new LedgerEntry({
      id: `evt-${Date.now()}`,
      bishiId: payout.bishiId,
      bishiName: payout.bishiName,
      timestamp: 'Just now',
      eventType: 'Payout Confirmed',
      actor: { id: req.user.id, name: req.user.name, role: req.user.role },
      description: `Recipient acknowledged receipt of ₹${payout.amount.toLocaleString()} with on-chain settlement proof.`,
      recordId: payout.id,
      recordHash: payout.recordHash,
      blockNumber: blockchainAnchor.blockNumber,
      blockchainTxHash: blockchainAnchor.txHash,
      verificationStatus: 'Verified'
    });
    await ledgerEntry.save();

    // Create Notification
    const notif = new Notification({
      id: `notif-${Date.now()}`,
      title: 'Payout Milestone Confirmed & Anchored',
      message: `₹${payout.amount.toLocaleString()} received by ${payout.recipientName}. Block #${blockchainAnchor.blockNumber} committed.`,
      timestamp: 'Just now',
      type: 'payout',
      link: '/payouts'
    });
    await notif.save();

    return res.json({
      success: true,
      message: 'Payout confirmed and proof anchored to Ethereum Sepolia',
      payout,
      data: payout,
      blockchainAnchor
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
