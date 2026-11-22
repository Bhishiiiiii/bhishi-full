import mongoose from 'mongoose';

const DocumentRecordSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    bishiId: { type: String, required: true, index: true },
    bishiName: { type: String, required: true },
    title: { type: String, required: true },
    category: {
      type: String,
      enum: [
        'Agreement',
        'Group Rules',
        'Contribution Receipt',
        'Payout Receipt',
        'Audit Report',
        'Identity Verification'
      ],
      default: 'Agreement'
    },
    uploadedBy: { type: String, required: true },
    uploadDate: { type: String, required: true },
    fileSize: { type: String, default: '1.2 MB' },
    version: { type: String, default: 'v1.0' },
    sha256Hash: { type: String, required: true, index: true },
    blockchainAnchored: { type: Boolean, default: true },
    blockNumber: { type: Number },
    txHash: { type: String },
    previewUrl: { type: String },
    contentPreview: { type: String }
  },
  { timestamps: true }
);

DocumentRecordSchema.index({ bishiId: 1, category: 1 });
DocumentRecordSchema.index({ createdAt: -1 });

DocumentRecordSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

export const DocumentRecord = mongoose.model('DocumentRecord', DocumentRecordSchema);
export default DocumentRecord;
