import mongoose from 'mongoose';

const PayoutSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    bishiId: { type: String, required: true, index: true },
    bishiName: { type: String, required: true },
    monthNumber: { type: Number, required: true },
    monthName: { type: String, required: true },
    recipientId: { type: String, required: true, index: true },
    recipientName: { type: String, required: true },
    recipientAvatar: { type: String, default: '' },
    amount: { type: Number, required: true },
    scheduledDate: { type: String, required: true },
    actualDate: { type: String },
    status: {
      type: String,
      enum: [
        'Upcoming',
        'Awaiting Confirmation',
        'Recorded',
        'Recipient Confirmed',
        'Verified',
        'Disputed'
      ],
      default: 'Upcoming',
      index: true
    },
    paymentMethod: {
      type: String,
      enum: ['UPI', 'Bank Transfer', 'Cash', 'Other']
    },
    transactionRef: { type: String },
    proofDocumentUrl: { type: String },
    recordHash: { type: String, required: true, index: true },
    blockchainTxHash: { type: String },
    blockNumber: { type: Number },
    isVerifiedOnChain: { type: Boolean, default: false }
  },
  { timestamps: true }
);

PayoutSchema.index({ bishiId: 1, recipientId: 1 });
PayoutSchema.index({ monthNumber: 1 });
PayoutSchema.index({ createdAt: -1 });

PayoutSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

export const Payout = mongoose.model('Payout', PayoutSchema);
export default Payout;
