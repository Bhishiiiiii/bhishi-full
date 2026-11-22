import express from 'express';
import LedgerEntry from '../models/LedgerEntry.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Get shared activity ledger across communities or filtered by bishiId/groupId, eventType, search
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { bishiId, groupId, eventType, type, search, page = 1, limit = 100 } = req.query;
    const filter = {};

    const targetGroup = groupId || bishiId;
    if (targetGroup && targetGroup !== 'All') filter.bishiId = targetGroup;

    const targetType = type || eventType;
    if (targetType && targetType !== 'All') filter.eventType = targetType;

    if (search) {
      filter.$or = [
        { description: { $regex: search, $options: 'i' } },
        { 'actor.name': { $regex: search, $options: 'i' } },
        { recordHash: { $regex: search, $options: 'i' } },
        { recordId: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [total, events] = await Promise.all([
      LedgerEntry.countDocuments(filter),
      LedgerEntry.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean()
    ]);

    return res.json({
      success: true,
      count: events.length,
      total,
      page: Number(page),
      limit: Number(limit),
      data: events,
      events
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Group-specific chronological shared audit log
router.get('/:groupId', optionalAuth, async (req, res) => {
  try {
    const { groupId } = req.params;
    const { page = 1, limit = 100 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const filter = { bishiId: groupId };

    const [total, events] = await Promise.all([
      LedgerEntry.countDocuments(filter),
      LedgerEntry.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean()
    ]);

    return res.json({
      success: true,
      count: events.length,
      total,
      page: Number(page),
      limit: Number(limit),
      data: events,
      events
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
