import mongoose from 'mongoose';

const CollateralAssetSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    joinRequestId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    groupId: { type: String, required: true, index: true },
    assetType: {
      type: String,
      enum: ['property', 'gold', 'vehicle', 'fixed_deposit', 'guarantor_letter', 'other'],
      default: 'property',
      required: true
    },
    description: { type: String, required: true },
    declaredValueINR: { type: Number, required: true },
    fileName: { type: String, required: true },
    mimeType: { type: String, required: true },
    sizeBytes: { type: Number, required: true },
    cloudinaryPublicId: { type: String },
    localFilePath: { type: String },
    sha256Hash: { type: String, required: true, index: true },
    anchorTxHash: { type: String },
    blockNumber: { type: Number },
    anchoredAt: { type: Date }
  },
  { timestamps: true }
);

CollateralAssetSchema.index({ joinRequestId: 1 });
CollateralAssetSchema.index({ groupId: 1, userId: 1 });
CollateralAssetSchema.index({ createdAt: -1 });

CollateralAssetSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

export const CollateralAsset = mongoose.model('CollateralAsset', CollateralAssetSchema);
export default CollateralAsset;
