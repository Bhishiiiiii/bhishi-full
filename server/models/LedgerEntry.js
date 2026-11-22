import mongoose from 'mongoose';

const LedgerEntrySchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    bishiId: { type: String, required: true, index: true },
    bishiName: { type: String, required: true },
    timestamp: { type: String, required: true },
    eventType: {
      type: String,
      enum: [
        'Bishi Created',
        'Member Joined',
        'Rules Approved',
        'Contribution Recorded',
        'Contribution Verified',
        'Payout Scheduled',
        'Payout Recorded',
        'Payout Confirmed',
        'Document Uploaded',
        'Blockchain Anchor Created',
        'Dispute Raised',
        'Dispute Resolved'
      ],
      required: true,
      index: true
    },
    actor: {
      id: { type: String, required: true },
      name: { type: String, required: true },
      role: { type: String, required: true }
    },
    description: { type: String, required: true },
    recordId: { type: String, required: true, index: true },
    recordHash: { type: String, required: true, index: true },
    blockNumber: { type: Number },
    blockchainTxHash: { type: String },
    verificationStatus: {
      type: String,
      enum: ['Verified', 'Pending', 'Flagged'],
      default: 'Verified'
    }
  },
  { timestamps: true }
);

LedgerEntrySchema.index({ bishiId: 1, createdAt: -1 });
LedgerEntrySchema.index({ createdAt: -1 });

LedgerEntrySchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

export const LedgerEntry = mongoose.model('LedgerEntry', LedgerEntrySchema);
export default LedgerEntry;
