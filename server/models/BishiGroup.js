import mongoose from 'mongoose';

const BishiGroupSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    category: {
      type: String,
      enum: [
        'Personal',
        'Society',
        "Women's Group",
        'Business',
        'Professional',
        'Family',
        'Community',
        'Other'
      ],
      default: 'Society'
    },
    monthlyContribution: { type: Number, required: true },
    frequency: {
      type: String,
      enum: ['Monthly', 'Weekly', 'Custom'],
      default: 'Monthly'
    },
    totalMembers: { type: Number, required: true },
    durationMonths: { type: Number, required: true },
    currentMonth: { type: Number, default: 1 },
    startDate: { type: String, required: true },
    organizer: {
      id: { type: String, required: true },
      name: { type: String, required: true },
      avatar: { type: String, default: '' },
      phone: { type: String, default: '' }
    },
    members: [
      {
        id: String,
        name: String,
        phone: String,
        email: String,
        avatar: String,
        role: { type: String, default: 'Member' },
        status: { type: String, default: 'Active' },
        assignedPayoutMonth: Number,
        complianceScore: { type: Number, default: 100 },
        joinedDate: String,
        verified: { type: Boolean, default: true }
      }
    ],
    totalPoolPerMonth: { type: Number, required: true },
    totalCyclePool: { type: Number, required: true },
    status: {
      type: String,
      enum: ['Active', 'Completed', 'Draft', 'Paused'],
      default: 'Active'
    },
    payoutRule: {
      type: String,
      enum: [
        'Fixed Schedule',
        'Organizer Proposed (Member Approved)',
        'Random Draw (Verifiable Seed)',
        'Custom Mutual Agreement'
      ],
      default: 'Fixed Schedule'
    },
    visibility: {
      type: String,
      enum: ['Private', 'Invite-only'],
      default: 'Invite-only'
    },
    nextPayoutDate: { type: String, default: '' },
    nextPayoutRecipient: { type: String, default: '' },
    contractAddress: {
      type: String,
      default: '0x892a014a51e605d3b6a98711ef84b01e3b52601a'
    },
    rulesHash: { type: String, required: true },
    scheduleHash: { type: String },
    blockchainTxHash: { type: String },
    blockNumber: { type: Number },
    isVerifiedOnChain: { type: Boolean, default: true },
    inviteCode: { type: String },
    // Organizer payee details for member payment instructions
    payeeDetails: {
      upiId: { type: String, default: '' },
      upiName: { type: String, default: '' },
      bankName: { type: String, default: '' },
      accountName: { type: String, default: '' },
      accountNumber: { type: String, default: '' },
      ifsc: { type: String, default: '' }
    }
  },
  { timestamps: true }
);

BishiGroupSchema.index({ 'organizer.id': 1 });
BishiGroupSchema.index({ 'members.id': 1 });
BishiGroupSchema.index({ status: 1 });
BishiGroupSchema.index({ createdAt: -1 });

BishiGroupSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

export const BishiGroup = mongoose.model('BishiGroup', BishiGroupSchema);
export default BishiGroup;
