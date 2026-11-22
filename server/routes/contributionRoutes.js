import express from 'express';
import Contribution from '../models/Contribution.js';
import BishiGroup from '../models/BishiGroup.js';
import User from '../models/User.js';
import LedgerEntry from '../models/LedgerEntry.js';
import Notification from '../models/Notification.js';
import { hashService } from '../services/hashService.js';
import { blockchainService } from '../services/blockchainService.js';
import { authenticate, optionalAuth, blockAuditorWrites } from '../middleware/auth.js';

const router = express.Router();

// ─── HELPERS ────────────────────────────────────────────────────────────────

function isValidUtr(utr) {
  // 12-character alphanumeric (letters + digits only)
  return /^[A-Za-z0-9]{12}$/.test(utr);
}

function normaliseStatus(s) {
  // Bridge legacy & new statuses for display
  if (!s) return 'Due';
  if (s === 'Paid' || s === 'Verified') return s;
  if (s === 'Pending') return 'Due';
  return s;
}

// ─── GET / — List contributions ─────────────────────────────────────────────
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { bishiId, groupId, memberId, status, periodMonth, page = 1, limit = 50 } = req.query;
    const filter = {};

    const targetGroup = groupId || bishiId;
    if (targetGroup && targetGroup !== 'All') filter.bishiId = targetGroup;
    if (memberId && memberId !== 'All') filter.memberId = memberId;
    if (status && status !== 'All') filter.status = status;
    if (periodMonth) filter.periodMonth = Number(periodMonth);

    if (req.user && req.user.role === 'member' && !memberId && !targetGroup) {
      filter.memberId = req.user.id;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [total, contributions] = await Promise.all([
      Contribution.countDocuments(filter),
      Contribution.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean()
    ]);

    return res.json({
      success: true,
      count: contributions.length,
      total,
      page: Number(page),
      limit: Number(limit),
      data: contributions,
      contributions
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ─── GET /my-dues — Member's outstanding + recent contributions ──────────────
router.get('/my-dues', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    // Find all groups the member belongs to
    const memberGroups = await BishiGroup.find({
      $or: [
        { 'organizer.id': userId },
        { 'members.id': userId }
      ]
    }).lean();

    const groupIds = memberGroups.map(g => g.id);

    // Fetch all contributions for this member across their groups
    const contributions = await Contribution.find({
      memberId: userId,
      bishiId: { $in: groupIds }
    })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    // Enrich with group payee details
    const groupMap = Object.fromEntries(memberGroups.map(g => [g.id, g]));
    const enriched = contributions.map(c => ({
      ...c,
      groupDetails: groupMap[c.bishiId]
        ? {
            name: groupMap[c.bishiId].name,
            payeeDetails: groupMap[c.bishiId].payeeDetails || {}
          }
        : null
    }));

    return res.json({
      success: true,
      count: enriched.length,
      data: enriched,
      contributions: enriched
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch dues', message: err.message });
  }
});

// ─── GET /pending-confirmations — Organizer's submitted payments ─────────────
router.get('/pending-confirmations', authenticate, async (req, res) => {
  try {
    const user = req.user;

    if (!['organizer', 'admin'].includes(user.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only organizers and admins can view pending confirmations.'
      });
    }

    // Find groups this organizer manages
    const myGroups = await BishiGroup.find({ 'organizer.id': user.id }).lean();
    const myGroupIds = myGroups.map(g => g.id);

    // Admin sees all pending confirmations
    const filter = {
      status: 'Submitted',
      ...(user.role === 'organizer' ? { bishiId: { $in: myGroupIds } } : {})
    };

    const pending = await Contribution.find(filter)
      .sort({ submittedAt: 1 })
      .lean();

    return res.json({
      success: true,
      count: pending.length,
      data: pending,
      contributions: pending
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch pending confirmations', message: err.message });
  }
});

// ─── POST /record — Organizer records a payment on behalf of member ──────────
router.post('/record', authenticate, blockAuditorWrites, async (req, res) => {
  try {
    const {
      bishiId,
      groupId,
      memberId,
      amount,
      paymentMethod = 'UPI',
      transactionRef = '',
      periodMonth = 1,
      monthName = 'Current Month',
      notes = ''
    } = req.body;

    const targetBishiId = bishiId || groupId;

    if (!targetBishiId || !memberId || !amount) {
      return res.status(400).json({ success: false, message: 'Missing bishiId, memberId, or amount' });
    }

    const group = await BishiGroup.findOne({ id: targetBishiId });
    const bishiName = group ? group.name : 'Community Bishi';

    const member = await User.findOne({ id: memberId });
    const memberName = member ? member.name : 'Member';
    const memberAvatar = member?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';

    const newId = `cnt-${Date.now().toString().slice(-4)}`;

    const recordHash = hashService.computeContributionHash({
      bishiId: targetBishiId,
      memberId,
      amount: Number(amount),
      periodMonth: Number(periodMonth),
      paymentMethod,
      transactionRef
    });

    const blockchainAnchor = await blockchainService.anchorRecord(
      targetBishiId,
      newId,
      'CONTRIBUTION',
      recordHash
    );

    const newContribution = new Contribution({
      id: newId,
      bishiId: targetBishiId,
      bishiName,
      memberId,
      memberName,
      memberAvatar,
      periodMonth: Number(periodMonth),
      monthName,
      amount: Number(amount),
      paymentMethod,
      transactionRef,
      utr: (transactionRef && transactionRef.replace(/[^A-Za-z0-9]/g, '').substring(0, 12)) || undefined,
      receiptUrl: `https://bishi.network/receipts/rcpt-${Date.now().toString().slice(-6)}.pdf`,
      status: 'Confirmed',
      dueDate: '15th of month',
      paidDate: 'Today',
      confirmedBy: req.user.id,
      confirmedAt: new Date(),
      recordHash,
      blockchainTxHash: blockchainAnchor.txHash,
      blockNumber: blockchainAnchor.blockNumber,
      isVerifiedOnChain: true,
      notes
    });

    await newContribution.save();

    if (member) {
      member.totalContributed = (member.totalContributed || 0) + Number(amount);
      await member.save();
    }

    const ledgerEntry = new LedgerEntry({
      id: `evt-${Date.now()}`,
      bishiId: targetBishiId,
      bishiName,
      timestamp: 'Just now',
      eventType: 'Contribution Recorded',
      actor: { id: req.user.id, name: req.user.name, role: req.user.role },
      description: `Payment of ₹${Number(amount).toLocaleString()} recorded for ${memberName} (${monthName}) via ${paymentMethod}.`,
      recordId: newId,
      recordHash,
      blockNumber: blockchainAnchor.blockNumber,
      blockchainTxHash: blockchainAnchor.txHash,
      verificationStatus: 'Verified'
    });
    await ledgerEntry.save();

    const notif = new Notification({
      id: `notif-${Date.now()}`,
      userId: memberId,
      title: 'Payment Recorded & Anchored',
      message: `₹${Number(amount).toLocaleString()} logged for ${memberName} in ${bishiName}. Proof anchored on Sepolia.`,
      timestamp: 'Just now',
      type: 'contribution',
      link: '/contributions'
    });
    await notif.save();

    return res.status(201).json({
      success: true,
      message: 'Contribution recorded and anchored to blockchain ledger',
      contribution: newContribution,
      data: newContribution,
      blockchainAnchor
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to record contribution', error: err.message });
  }
});

// ─── POST /:id/submit-payment — Member submits proof of payment ──────────────
router.post('/:id/submit-payment', authenticate, blockAuditorWrites, async (req, res) => {
  try {
    const user = req.user;
    const { paymentMethod, utr, paidAt, note } = req.body;

    if (!paymentMethod) {
      return res.status(400).json({ error: 'Validation error', message: 'paymentMethod is required.' });
    }

    const normalised = paymentMethod.toLowerCase();
    const requiresUtr = ['upi', 'bank_transfer', 'bank transfer'].includes(normalised);

    if (requiresUtr) {
      if (!utr) {
        return res.status(400).json({ error: 'Validation error', message: 'UTR is required for UPI and bank transfer payments.' });
      }
      if (!isValidUtr(utr)) {
        return res.status(400).json({ error: 'Validation error', message: 'UTR must be exactly 12 alphanumeric characters.' });
      }

      // Check UTR uniqueness (sparse unique index, but check manually for clear error)
      const existing = await Contribution.findOne({ utr: utr });
      if (existing && existing.id !== req.params.id) {
        return res.status(409).json({ error: 'Duplicate UTR', message: 'This UTR has already been used for another payment submission.' });
      }
    }

    const contribution = await Contribution.findOne({ id: req.params.id });
    if (!contribution) {
      return res.status(404).json({ error: 'Not found', message: 'Contribution record not found.' });
    }

    // Members may only submit their own contribution
    if (user.role === 'member' && contribution.memberId !== user.id) {
      return res.status(403).json({ error: 'Forbidden', message: 'You can only submit payment for your own contributions.' });
    }

    // Only allowed from Due or Rejected
    const allowedStatuses = ['Due', 'Pending', 'Rejected'];
    if (!allowedStatuses.includes(contribution.status)) {
      return res.status(400).json({
        error: 'Invalid status',
        message: `Cannot submit payment for a contribution with status '${contribution.status}'. Allowed: Due, Rejected.`
      });
    }

    contribution.status = 'Submitted';
    contribution.paymentMethod = paymentMethod;
    if (requiresUtr && utr) {
      contribution.utr = utr;
      contribution.transactionRef = utr;
    }
    contribution.paidAt = paidAt ? new Date(paidAt) : new Date();
    contribution.submittedAt = new Date();
    contribution.note = note || '';
    if (paidAt) contribution.paidDate = new Date(paidAt).toLocaleDateString('en-IN');
    contribution.rejectionReason = undefined;

    // Recompute hash with new payment info
    contribution.recordHash = hashService.computeContributionHash({
      bishiId: contribution.bishiId,
      memberId: contribution.memberId,
      amount: contribution.amount,
      periodMonth: contribution.periodMonth,
      paymentMethod,
      transactionRef: utr || ''
    });

    await contribution.save();

    // Notify the organizer
    const group = await BishiGroup.findOne({ id: contribution.bishiId }).lean();
    const organizerId = group?.organizer?.id || 'mem-1';

    const notif = new Notification({
      id: `notif-${Date.now()}`,
      userId: organizerId,
      title: 'Payment Submission — Action Required',
      message: `${contribution.memberName} submitted ₹${contribution.amount.toLocaleString()} for ${contribution.bishiName} (${contribution.monthName}). Please verify and confirm.`,
      timestamp: 'Just now',
      type: 'contribution',
      link: '/contributions'
    });
    await notif.save();

    return res.json({
      success: true,
      message: 'Payment submitted. Awaiting organizer confirmation.',
      contribution,
      data: contribution
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to submit payment', message: err.message });
  }
});

// ─── POST /:id/organizer-confirm — Organizer confirms a submitted payment ────
router.post('/:id/organizer-confirm', authenticate, blockAuditorWrites, async (req, res) => {
  try {
    const user = req.user;

    const contribution = await Contribution.findOne({ id: req.params.id });
    if (!contribution) {
      return res.status(404).json({ error: 'Not found', message: 'Contribution not found.' });
    }

    if (contribution.status !== 'Submitted') {
      return res.status(400).json({
        error: 'Invalid status',
        message: `Only Submitted contributions can be confirmed. Current status: ${contribution.status}`
      });
    }

    // Only the organizer of that group, or admin
    if (user.role !== 'admin') {
      const group = await BishiGroup.findOne({ id: contribution.bishiId }).lean();
      if (!group || group.organizer.id !== user.id) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Only the organizer of this group can confirm payments.'
        });
      }
    }

    contribution.status = 'Confirmed';
    contribution.confirmedBy = user.id;
    contribution.confirmedAt = new Date();
    contribution.isVerifiedOnChain = true;

    // Anchor on blockchain
    if (!contribution.blockchainTxHash) {
      const anchor = await blockchainService.anchorRecord(
        contribution.bishiId,
        contribution.id,
        'CONTRIBUTION',
        contribution.recordHash
      );
      contribution.blockchainTxHash = anchor.txHash;
      contribution.blockNumber = anchor.blockNumber;
    }

    await contribution.save();

    // Ledger entry
    const ledgerEntry = new LedgerEntry({
      id: `evt-${Date.now()}`,
      bishiId: contribution.bishiId,
      bishiName: contribution.bishiName,
      timestamp: 'Just now',
      eventType: 'Contribution Verified',
      actor: { id: user.id, name: user.name, role: user.role },
      description: `Organizer confirmed ₹${contribution.amount.toLocaleString()} payment from ${contribution.memberName} (${contribution.monthName}). Hash anchored on Sepolia.`,
      recordId: contribution.id,
      recordHash: contribution.recordHash,
      blockNumber: contribution.blockNumber,
      blockchainTxHash: contribution.blockchainTxHash,
      verificationStatus: 'Verified'
    });
    await ledgerEntry.save();

    // Notify member
    const memberNotif = new Notification({
      id: `notif-${Date.now() + 1}`,
      userId: contribution.memberId,
      title: 'Payment Confirmed ✓',
      message: `Your ₹${contribution.amount.toLocaleString()} contribution to ${contribution.bishiName} (${contribution.monthName}) has been confirmed and anchored on Ethereum Sepolia.`,
      timestamp: 'Just now',
      type: 'contribution',
      link: '/contributions'
    });
    await memberNotif.save();

    return res.json({
      success: true,
      message: 'Contribution confirmed and anchored on-chain.',
      contribution,
      data: contribution,
      ledgerEntry
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to confirm contribution', message: err.message });
  }
});

// ─── POST /:id/organizer-reject — Organizer rejects a submitted payment ──────
router.post('/:id/organizer-reject', authenticate, blockAuditorWrites, async (req, res) => {
  try {
    const user = req.user;
    const { reason } = req.body;

    if (!reason || reason.trim().length < 3) {
      return res.status(400).json({ error: 'Validation error', message: 'A rejection reason of at least 3 characters is required.' });
    }

    const contribution = await Contribution.findOne({ id: req.params.id });
    if (!contribution) {
      return res.status(404).json({ error: 'Not found', message: 'Contribution not found.' });
    }

    if (contribution.status !== 'Submitted') {
      return res.status(400).json({
        error: 'Invalid status',
        message: `Only Submitted contributions can be rejected. Current status: ${contribution.status}`
      });
    }

    if (user.role !== 'admin') {
      const group = await BishiGroup.findOne({ id: contribution.bishiId }).lean();
      if (!group || group.organizer.id !== user.id) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Only the organizer of this group can reject payments.'
        });
      }
    }

    contribution.status = 'Rejected';
    contribution.rejectionReason = reason.trim();
    contribution.utr = undefined;
    await contribution.save();

    // Notify member
    const memberNotif = new Notification({
      id: `notif-${Date.now()}`,
      userId: contribution.memberId,
      title: 'Payment Submission Rejected',
      message: `Your ₹${contribution.amount.toLocaleString()} payment for ${contribution.bishiName} was not confirmed. Reason: ${reason}. Please resubmit.`,
      timestamp: 'Just now',
      type: 'contribution',
      link: '/contributions'
    });
    await memberNotif.save();

    return res.json({
      success: true,
      message: 'Contribution rejected. Member has been notified.',
      contribution,
      data: contribution
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to reject contribution', message: err.message });
  }
});

// ─── PATCH /:id/confirm — Legacy member-side confirmation (kept for existing tests) ─
router.patch('/:id/confirm', authenticate, blockAuditorWrites, async (req, res) => {
  try {
    const contribution = await Contribution.findOne({ id: req.params.id });
    if (!contribution) {
      return res.status(404).json({ success: false, message: 'Contribution record not found' });
    }

    contribution.status = 'Verified';
    contribution.isVerifiedOnChain = true;

    if (!contribution.blockchainTxHash) {
      const anchor = await blockchainService.anchorRecord(
        contribution.bishiId,
        contribution.id,
        'CONTRIBUTION',
        contribution.recordHash
      );
      contribution.blockchainTxHash = anchor.txHash;
      contribution.blockNumber = anchor.blockNumber;
    }

    await contribution.save();

    const ledgerEntry = new LedgerEntry({
      id: `evt-${Date.now()}`,
      bishiId: contribution.bishiId,
      bishiName: contribution.bishiName,
      timestamp: 'Just now',
      eventType: 'Contribution Verified',
      actor: { id: req.user.id, name: req.user.name, role: req.user.role },
      description: `Payment confirmation countersigned for ${contribution.memberName} (${contribution.monthName}).`,
      recordId: contribution.id,
      recordHash: contribution.recordHash,
      blockNumber: contribution.blockNumber,
      blockchainTxHash: contribution.blockchainTxHash,
      verificationStatus: 'Verified'
    });
    await ledgerEntry.save();

    return res.json({
      success: true,
      message: 'Contribution confirmed and verified on-chain',
      contribution,
      data: contribution
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ─── POST /:id/verify — Explicit verify on-chain ─────────────────────────────
router.post('/:id/verify', authenticate, blockAuditorWrites, async (req, res) => {
  try {
    const contribution = await Contribution.findOne({ id: req.params.id });
    if (!contribution) {
      return res.status(404).json({ success: false, message: 'Contribution not found' });
    }

    const anchor = await blockchainService.anchorRecord(
      contribution.bishiId,
      contribution.id,
      'CONTRIBUTION',
      contribution.recordHash
    );

    contribution.status = 'Verified';
    contribution.isVerifiedOnChain = true;
    contribution.blockchainTxHash = anchor.txHash;
    contribution.blockNumber = anchor.blockNumber;
    await contribution.save();

    return res.json({
      success: true,
      message: `Contribution ${contribution.id} anchored to Sepolia ledger`,
      contribution,
      data: contribution,
      anchor
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
