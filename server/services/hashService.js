import crypto from 'crypto';

/**
 * Deterministic SHA-256 payload and document hashing service.
 * All hashes formatted as 0x-prefixed 32-byte hex strings (66 chars) compatible with Solidity bytes32.
 */

export function computeSha256(data) {
  if (typeof data !== 'string' && !Buffer.isBuffer(data)) {
    data = JSON.stringify(sortKeys(data));
  }
  const hash = crypto.createHash('sha256').update(data).digest('hex');
  return `0x${hash}`;
}

export function sortKeys(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(sortKeys);
  }
  return Object.keys(obj)
    .sort()
    .reduce((result, key) => {
      result[key] = sortKeys(obj[key]);
      return result;
    }, {});
}

export function computeRulesHash(bishiData) {
  const payload = {
    name: bishiData.name,
    category: bishiData.category,
    monthlyContribution: Number(bishiData.monthlyContribution || bishiData.contributionAmount),
    totalMembers: Number(bishiData.totalMembers),
    durationMonths: Number(bishiData.durationMonths || bishiData.duration),
    payoutRule: bishiData.payoutRule || bishiData.payoutMechanism,
    organizerId: bishiData.organizer?.id || bishiData.organizerId || 'organizer'
  };
  return computeSha256(payload);
}

export function computeScheduleHash(schedule) {
  const clean = (schedule || []).map(item => ({
    monthNumber: item.monthNumber,
    recipientId: item.recipientId || item.memberId,
    amount: item.amount,
    scheduledDate: item.scheduledDate
  }));
  return computeSha256(clean);
}

export function computeContributionHash(contribution) {
  const payload = {
    bishiId: contribution.bishiId,
    memberId: contribution.memberId,
    amount: Number(contribution.amount),
    periodMonth: Number(contribution.periodMonth),
    paymentMethod: contribution.paymentMethod,
    transactionRef: contribution.transactionRef || ''
  };
  return computeSha256(payload);
}

export function computePayoutHash(payout) {
  const payload = {
    bishiId: payout.bishiId,
    recipientId: payout.recipientId,
    amount: Number(payout.amount),
    monthNumber: Number(payout.monthNumber),
    transactionRef: payout.transactionRef || ''
  };
  return computeSha256(payload);
}

export function computeDocumentHash(contentOrBuffer) {
  return computeSha256(contentOrBuffer);
}

export const hashService = {
  computeSha256,
  sortKeys,
  computeRulesHash,
  computeScheduleHash,
  computeContributionHash,
  computePayoutHash,
  computeDocumentHash
};

export default hashService;
