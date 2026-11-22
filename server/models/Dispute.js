import mongoose from 'mongoose';

const DisputeSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    bishiId: { type: String, required: true, index: true },
    bishiName: { type: String, required: true },
    category: {
      type: String,
      enum: [
        'Contribution Record',
        'Payout Discrepancy',
        'Schedule Change',
        'Member Conduct',
        'Document Hash'
      ],
      required: true
    },
    raisedBy: {
      id: { type: String, required: true },
      name: { type: String, required: true },
      avatar: { type: String, default: '' }
    },
    raisedDate: { type: String, required: true },
    targetRecordId: { type: String, required: true },
    targetRecordType: {
      type: String,
      enum: ['Contribution', 'Payout', 'Schedule', 'Document'],
      required: true
    },
    description: { type: String, required: true },
    evidenceUrl: { type: String },
    status: {
      type: String,
      enum: ['Open', 'Under Review', 'Resolved', 'Rejected'],
      default: 'Open',
      index: true
    },
    organizerResponse: { type: String },
    resolvedDate: { type: String }
  },
  { timestamps: true }
);

DisputeSchema.index({ bishiId: 1, status: 1 });
DisputeSchema.index({ createdAt: -1 });

DisputeSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

export const Dispute = mongoose.model('Dispute', DisputeSchema);
export default Dispute;
