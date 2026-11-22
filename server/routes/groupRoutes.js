import express from 'express';
import BishiGroup from '../models/BishiGroup.js';
import LedgerEntry from '../models/LedgerEntry.js';
import DocumentRecord from '../models/DocumentRecord.js';
import Notification from '../models/Notification.js';
import { hashService } from '../services/hashService.js';
import { blockchainService } from '../services/blockchainService.js';
import { authenticate, optionalAuth, blockAuditorWrites } from '../middleware/auth.js';

const router = express.Router();

// List all Bishi groups with multi-criteria filtering, pagination & role scoping
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { category, status, search, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (category && category !== 'All') filter.category = category;
    if (status && status !== 'All') filter.status = status;
    if (search) filter.name = { $regex: search, $options: 'i' };

    const skip = (Number(page) - 1) * Number(limit);

    const [total, groups] = await Promise.all([
      BishiGroup.countDocuments(filter),
      BishiGroup.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean()
    ]);

    return res.json({
      success: true,
      count: groups.length,
      total,
      page: Number(page),
      limit: Number(limit),
      data: groups,
      groups
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Get single Bishi group details
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const group = await BishiGroup.findOne({ id: req.params.id }).lean();
    if (!group) {
      return res.status(404).json({ success: false, message: 'Bishi group not found' });
    }
    return res.json({
      success: true,
      data: group,
      group
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Create Bishi via 6-Step Wizard (Protected: Organizer/Admin only, Auditor blocked)
router.post('/', authenticate, blockAuditorWrites, async (req, res) => {
  try {
    const {
      name,
      description,
      category = 'Society',
      monthlyContribution,
      contributionAmount,
      frequency = 'Monthly',
      totalMembers = 10,
      durationMonths,
      duration,
      startDate = '01 Jan 2027',
      payoutRule = 'Fixed Schedule',
      payoutMechanism,
      payoutSchedule = [],
      visibility = 'Invite-only',
      invitedMembers = []
    } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Bishi group name is required' });
    }

    const amountPerMember = Number(monthlyContribution || contributionAmount || 5000);
    const membersCount = Number(totalMembers || 10);
    const cycleDuration = Number(durationMonths || duration || membersCount);
    const selectedPayoutRule = payoutRule || payoutMechanism || 'Fixed Schedule';

    const totalPoolPerMonth = amountPerMember * membersCount;
    const totalCyclePool = totalPoolPerMonth * cycleDuration;

    const newId = `bishi-${Date.now().toString().slice(-4)}`;

    // Compute cryptographic rules and schedule digest
    const rulesHash = hashService.computeRulesHash({
      name,
      category,
      monthlyContribution: amountPerMember,
      totalMembers: membersCount,
      durationMonths: cycleDuration,
      payoutRule: selectedPayoutRule,
      organizer: req.user
    });

    const scheduleHash = hashService.computeScheduleHash(payoutSchedule);

    // Anchor Rules & Payout Schedule onto Ethereum Sepolia via Relayer
    const blockchainAnchor = await blockchainService.anchorRecord(
      newId,
      newId,
      'GROUP_CREATED',
      rulesHash
    );

    // Register lock on schedule
    await blockchainService.registerGroupSchedule(newId, rulesHash, scheduleHash);

    const organizerProfile = {
      id: req.user.id || 'mem-1',
      name: req.user.name || 'Organizer',
      avatar: req.user.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      phone: req.user.phone || '+91 98201 44521'
    };

    const newGroup = new BishiGroup({
      id: newId,
      name,
      description: description || `Community savings circle for ${category} members.`,
      category,
      monthlyContribution: amountPerMember,
      frequency,
      totalMembers: membersCount,
      durationMonths: cycleDuration,
      currentMonth: 1,
      startDate,
      organizer: organizerProfile,
      members: [
        {
          id: organizerProfile.id,
          name: organizerProfile.name,
          phone: organizerProfile.phone,
          email: req.user.email || 'organizer@bishi.network',
          avatar: organizerProfile.avatar,
          role: 'Organizer',
          status: 'Active',
          assignedPayoutMonth: cycleDuration,
          complianceScore: 100,
          joinedDate: 'Today',
          verified: true
        },
        ...invitedMembers.map((m, idx) => ({
          id: `mem-${Date.now().toString().slice(-3)}${idx}`,
          name: m.name,
          phone: m.phone,
          email: `${m.name.toLowerCase().replace(/\s+/g, '.')}@bishi.network`,
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
          role: 'Member',
          status: 'Invited',
          assignedPayoutMonth: idx + 1,
          complianceScore: 100,
          joinedDate: 'Pending',
          verified: false
        }))
      ],
      totalPoolPerMonth,
      totalCyclePool,
      status: 'Active',
      payoutRule: selectedPayoutRule,
      visibility,
      nextPayoutDate: '30 Jan 2027',
      nextPayoutRecipient: invitedMembers[0]?.name || organizerProfile.name,
      contractAddress: blockchainService.contractAddress,
      rulesHash,
      scheduleHash,
      blockchainTxHash: blockchainAnchor.txHash,
      blockNumber: blockchainAnchor.blockNumber,
      isVerifiedOnChain: true,
      inviteCode: `BISHI-${newId.toUpperCase()}`
    });

    await newGroup.save();

    // Create Initial Audit Ledger Entry
    const ledgerEntry = new LedgerEntry({
      id: `evt-${Date.now()}`,
      bishiId: newId,
      bishiName: name,
      timestamp: 'Just now',
      eventType: 'Bishi Created',
      actor: {
        id: organizerProfile.id,
        name: organizerProfile.name,
        role: 'Organizer'
      },
      description: `Bishi group initialized with ₹${amountPerMember.toLocaleString()} contribution & ${selectedPayoutRule}. Rules digest registered.`,
      recordId: newId,
      recordHash: rulesHash,
      blockNumber: blockchainAnchor.blockNumber,
      blockchainTxHash: blockchainAnchor.txHash,
      verificationStatus: 'Verified'
    });
    await ledgerEntry.save();

    // Create Initial Charter in Document Vault
    const charterDoc = new DocumentRecord({
      id: `doc-${Date.now()}`,
      bishiId: newId,
      bishiName: name,
      title: `${name} Charter & Non-Auction Rules`,
      category: 'Agreement',
      uploadedBy: organizerProfile.name,
      uploadDate: 'Today',
      fileSize: '1.2 MB',
      version: 'v1.0',
      sha256Hash: rulesHash,
      blockchainAnchored: true,
      blockNumber: blockchainAnchor.blockNumber,
      txHash: blockchainAnchor.txHash
    });
    await charterDoc.save();

    // Notify members
    const notif = new Notification({
      id: `notif-${Date.now()}`,
      title: 'New Bishi Group Created',
      message: `${name} has been launched and anchored on Ethereum Sepolia.`,
      timestamp: 'Just now',
      type: 'system',
      link: `/bishi/${newId}`
    });
    await notif.save();

    return res.status(201).json({
      success: true,
      message: 'Bishi created and anchored on Ethereum Sepolia',
      bishi: newGroup,
      data: newGroup,
      blockchainAnchor
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to create Bishi', error: err.message });
  }
});

// Member Invite endpoint (Protected: Auditor blocked)
router.post('/:id/invite', authenticate, blockAuditorWrites, async (req, res) => {
  try {
    const { name, phone, email } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ success: false, message: 'Member name and phone required' });
    }

    const group = await BishiGroup.findOne({ id: req.params.id });
    if (!group) {
      return res.status(404).json({ success: false, message: 'Bishi group not found' });
    }

    const newMember = {
      id: `mem-${Date.now().toString().slice(-4)}`,
      name,
      phone,
      email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@bishi.network`,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      role: 'Member',
      status: 'Invited',
      complianceScore: 100,
      joinedDate: 'Pending',
      verified: false
    };

    group.members.push(newMember);
    await group.save();

    // Add ledger record
    const event = new LedgerEntry({
      id: `evt-${Date.now()}`,
      bishiId: group.id,
      bishiName: group.name,
      timestamp: 'Just now',
      eventType: 'Member Joined',
      actor: { id: req.user.id, name: req.user.name, role: req.user.role },
      description: `Dispatched invite to ${name} (${phone}) for ${group.name}.`,
      recordId: newMember.id,
      recordHash: hashService.computeSha256(newMember),
      verificationStatus: 'Pending'
    });
    await event.save();

    return res.json({
      success: true,
      message: `Invitation generated for ${name}`,
      inviteLink: `https://bishi.network/join/${group.id}?code=${group.inviteCode || 'BISHI-INVITE'}`,
      member: newMember,
      data: newMember
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
