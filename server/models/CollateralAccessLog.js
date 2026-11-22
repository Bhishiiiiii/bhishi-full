import mongoose from 'mongoose';

const CollateralAccessLogSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    assetId: { type: String, required: true, index: true },
    joinRequestId: { type: String, index: true },
    accessedBy: { type: String, required: true, index: true },
    accessedByName: { type: String, required: true },
    accessedByRole: { type: String, required: true },
    action: { type: String, default: 'view_url_generated' },
    ip: { type: String, default: '' },
    userAgent: { type: String, default: '' }
  },
  { timestamps: true }
);

CollateralAccessLogSchema.index({ assetId: 1, createdAt: -1 });

CollateralAccessLogSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

export const CollateralAccessLog = mongoose.model('CollateralAccessLog', CollateralAccessLogSchema);
export default CollateralAccessLog;
