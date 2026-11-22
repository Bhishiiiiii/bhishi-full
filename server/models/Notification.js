import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, default: 'all', index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    timestamp: { type: String, required: true },
    type: {
      type: String,
      enum: ['contribution', 'payout', 'verification', 'dispute', 'system'],
      default: 'system'
    },
    read: { type: Boolean, default: false },
    link: { type: String }
  },
  { timestamps: true }
);

NotificationSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

export const Notification = mongoose.model('Notification', NotificationSchema);
export default Notification;
