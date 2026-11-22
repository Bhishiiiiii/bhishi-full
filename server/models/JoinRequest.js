import mongoose from 'mongoose';

const JoinRequestSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    groupId: { type: String, required: true, index: true },
    groupName: { type: String, required: true },
    userId: { type: String, required: true, index: true },
    userName: { type: String, required: true },
    userEmail: { type: String, default: '' },
    userPhone: { type: String, default: '' },
    userAvatar: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending_review', 'approved', 'rejected', 'more_info_requested'],
      default: 'pending_review',
      index: true
    },
    message: { type: String, default: '' },
    reviewedBy: { type: String },
    reviewedByName: { type: String },
    reviewedAt: { type: Date },
    reviewNote: { type: String }
  },
  { timestamps: true }
);

JoinRequestSchema.index({ groupId: 1, userId: 1 });
JoinRequestSchema.index({ createdAt: -1 });

JoinRequestSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

export const JoinRequest = mongoose.model('JoinRequest', JoinRequestSchema);
export default JoinRequest;
