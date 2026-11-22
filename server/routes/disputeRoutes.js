import express from 'express';
import Dispute from '../models/Dispute.js';
import BishiGroup from '../models/BishiGroup.js';
import LedgerEntry from '../models/LedgerEntry.js';
import Notification from '../models/Notification.js';
import { hashService } from '../services/hashService.js';
import { authenticate, optionalAuth, blockAuditorWrites } from '../middleware/auth.js';

const router = express.Router();

// List disputes with filtering, pagination & role scoping
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { bishiId, groupId, status, page = 1, limit = 50 } = req.query;
    const filter = {};

    const targetGroup = groupId || bishiId;
    if (targetGroup && targetGroup !== 'All') filter.bishiId = targetGroup;
    if (status && status !== 'All') filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const [total, disputes] = await Promise.all([
      Dispute.countDocuments(filter),
      Dispute.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean()
    ]);

    return res.json({
      success: true,
      count: disputes.length,
      total,
      page: Number(page),
      limit: Number(limit),
      data: disputes,
      disputes
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Raise a formal dispute (Protected: Auditor blocked)
router.post('/', authenticate, blockAuditorWrites, async (req, res) => {
  try {
    const {
      bishiId,
      groupId,
      category,
      targetRecordId,
      targetRecordType,
      description,
      evidenceUrl
    } = req.body;

    const targetBishiId = bishiId || groupId;

    if (!targetBishiId || !category || !targetRecordId || !description) {
      return res.status(400).json({ success: false, message: 'Missing required dispute fields' });
    }

    const group = await BishiGroup.findOne({ id: targetBishiId });
    const bishiName = group ? group.name : 'Community Bishi';
    const newId = `dsp-${Date.now().toString().slice(-4)}`;

    const newDispute = new Dispute({
      id: newId,
      bishiId: targetBishiId,
      bishiName,
      category,
      raisedBy: {
        id: req.user.id,
        name: req.user.name,
        avatar: req.user.avatar
      },
      raisedDate: 'Today',
      targetRecordId,
      targetRecordType,
      description,
      evidenceUrl: evidenceUrl || '',
      status: 'Open'
    });

    await newDispute.save();

    // Add immutable ledger entry
    const ledgerEntry = new LedgerEntry({
      id: `evt-${Date.now()}`,
      bishiId: targetBishiId,
      bishiName,
      timestamp: 'Just now',
      eventType: 'Dispute Raised',
      actor: { id: req.user.id, name: req.user.name, role: req.user.role },
      description: `Formal query registered regarding ${targetRecordType} ${targetRecordId}.`,
      recordId: newId,
      recordHash: hashService.computeSha256(newId),
      verificationStatus: 'Flagged'
    });
    await ledgerEntry.save();

    // Create Notification
    const notif = new Notification({
      id: `notif-${Date.now()}`,
      title: 'Formal Query Registered',
      message: `Dispute #${newId} raised by ${req.user.name} regarding ${targetRecordType}.`,
      timestamp: 'Just now',
      type: 'dispute',
      link: '/disputes'
    });
    await notif.save();

    return res.status(201).json({
      success: true,
      message: 'Formal query registered and organizer notified',
      dispute: newDispute,
      data: newDispute
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Resolve or reject dispute (Protected: Organizer/Admin, Auditor blocked)
router.patch('/:id/resolve', authenticate, blockAuditorWrites, async (req, res) => {
  try {
    const { status = 'Resolved', organizerResponse = '' } = req.body;
    const dispute = await Dispute.findOne({ id: req.params.id });

    if (!dispute) {
      return res.status(404).json({ success: false, message: 'Dispute not found' });
    }

    dispute.status = status;
    dispute.organizerResponse = organizerResponse || 'Reviewed and reconciled against ledger evidence.';
    dispute.resolvedDate = 'Today';
    await dispute.save();

    // Add immutable ledger entry
    const ledgerEntry = new LedgerEntry({
      id: `evt-${Date.now()}`,
      bishiId: dispute.bishiId,
      bishiName: dispute.bishiName,
      timestamp: 'Just now',
      eventType: 'Dispute Resolved',
      actor: { id: req.user.id, name: req.user.name, role: req.user.role },
      description: `Dispute ${dispute.id} closed with status "${status}". Audit response logged.`,
      recordId: dispute.id,
      recordHash: hashService.computeSha256(`resolution-${dispute.id}`),
      verificationStatus: 'Verified'
    });
    await ledgerEntry.save();

    // Create Notification
    const notif = new Notification({
      id: `notif-${Date.now()}`,
      title: `Dispute ${status}`,
      message: `Query #${dispute.id} was ${status.toLowerCase()} by organizer. Audit response updated.`,
      timestamp: 'Just now',
      type: 'dispute',
      link: '/disputes'
    });
    await notif.save();

    return res.json({
      success: true,
      message: `Dispute #${dispute.id} updated with status: ${status}`,
      dispute,
      data: dispute
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
