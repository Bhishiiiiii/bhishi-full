import mongoose from 'mongoose';

const ContributionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    bishiId: { type: String, required: true, index: true },
    bishiName: { type: String, required: true },
    memberId: { type: String, required: true, index: true },
    memberName: { type: String, required: true },
    memberAvatar: { type: String, default: '' },
    periodMonth: { type: Number, required: true },
    monthName: { type: String, required: true },
    amount: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ['UPI', 'Bank Transfer', 'Cash', 'Other', 'upi', 'bank_transfer', 'cash'],
      default: 'UPI'
    },
    transactionRef: { type: String, default: '' },
    // New payment-lifecycle fields
    utr: { type: String },                         // 12-char alphanumeric UTR/UPI ref
    paidAt: { type: Date },                        // when member says they paid
    submittedAt: { type: Date },                   // when submit-payment was called
    confirmedBy: { type: String },                 // organizer userId
    confirmedAt: { type: Date },
    rejectionReason: { type: String },
    note: { type: String },
    receiptUrl: { type: String },
    status: {
      type: String,
      // Legacy: Paid, Pending, Late, Verified, Disputed
      // New lifecycle: Due, Submitted, Confirmed, Rejected
      enum: ['Paid', 'Pending', 'Late', 'Verified', 'Disputed', 'Due', 'Submitted', 'Confirmed', 'Rejected'],
      default: 'Due',
      index: true
    },
    dueDate: { type: String, required: true },
    paidDate: { type: String },
    recordHash: { type: String, required: true, index: true },
    blockchainTxHash: { type: String },
    blockNumber: { type: Number },
    isVerifiedOnChain: { type: Boolean, default: false },
    notes: { type: String }
  },
  { timestamps: true }
);

ContributionSchema.index({ bishiId: 1, memberId: 1 });
ContributionSchema.index({ createdAt: -1 });
ContributionSchema.index({ utr: 1 }, { unique: true, sparse: true });

ContributionSchema.pre('save', function (next) {
  if (this.utr === '') {
    this.utr = undefined;
  }
  next();
});

ContributionSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

export const Contribution = mongoose.model('Contribution', ContributionSchema);
export default Contribution;
