import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    password: { type: String, required: true },
    avatar: {
      type: String,
      default: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
    },
    role: {
      type: String,
      enum: ['organizer', 'member', 'auditor', 'admin'],
      default: 'member'
    },
    displayRole: {
      type: String,
      enum: ['Organizer', 'Member', 'Auditor', 'Platform Admin'],
      default: 'Member'
    },
    joinedDate: { type: String, default: 'Jan 2026' },
    complianceScore: { type: Number, default: 100 },
    status: {
      type: String,
      enum: ['Active', 'Invited', 'Pending Verification', 'Suspended'],
      default: 'Active'
    },
    assignedPayoutMonth: { type: Number },
    totalContributed: { type: Number, default: 0 },
    totalReceived: { type: Number, default: 0 },
    verified: { type: Boolean, default: true },
    walletAddress: { type: String, default: '0x892a014a51e605d3b6a98711ef84b01e3b52601a' }
  },
  { timestamps: true }
);

UserSchema.index({ role: 1 });
UserSchema.index({ createdAt: -1 });

// Hash password before save
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

export const User = mongoose.model('User', UserSchema);
export default User;
