export type UserRole = 'organizer' | 'member' | 'auditor' | 'admin';

export type GroupCategory = 
  | 'Personal'
  | 'Society'
  | 'Women\'s Group'
  | 'Business'
  | 'Professional'
  | 'Family'
  | 'Community'
  | 'Other';

export type PayoutRuleType = 
  | 'Fixed Schedule'
  | 'Organizer Proposed (Member Approved)'
  | 'Random Draw (Verifiable Seed)'
  | 'Custom Mutual Agreement';

export interface Member {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatar: string;
  role: 'Organizer' | 'Member' | 'Auditor';
  joinedDate: string;
  complianceScore: number; // e.g. 98%
  status: 'Active' | 'Invited' | 'Pending Verification' | 'Suspended';
  assignedPayoutMonth?: number;
  totalContributed: number;
  totalReceived: number;
  verified: boolean;
}

export interface BishiGroup {
  id: string;
  name: string;
  description: string;
  category: GroupCategory;
  monthlyContribution: number;
  frequency: 'Monthly' | 'Weekly' | 'Custom';
  totalMembers: number;
  durationMonths: number;
  currentMonth: number;
  startDate: string;
  organizer: {
    id: string;
    name: string;
    avatar: string;
    phone: string;
  };
  totalPoolPerMonth: number;
  totalCyclePool: number;
  status: 'Active' | 'Completed' | 'Draft' | 'Paused';
  payoutRule: PayoutRuleType;
  visibility: 'Private' | 'Invite-only';
  nextPayoutDate: string;
  nextPayoutRecipient: string;
  contractAddress: string;
  rulesHash: string;
}

export type ContributionStatus = 'Paid' | 'Pending' | 'Late' | 'Verified' | 'Disputed';
export type PaymentMethod = 'UPI' | 'Bank Transfer' | 'Cash' | 'Other';

export interface ContributionRecord {
  id: string;
  bishiId: string;
  bishiName: string;
  memberId: string;
  memberName: string;
  memberAvatar: string;
  periodMonth: number;
  monthName: string;
  amount: number;
  paymentMethod: PaymentMethod;
  transactionRef: string;
  receiptUrl?: string;
  status: ContributionStatus;
  dueDate: string;
  paidDate?: string;
  recordHash: string;
  blockchainTxHash?: string;
  isVerifiedOnChain: boolean;
  notes?: string;
}

export type PayoutStatus = 
  | 'Upcoming' 
  | 'Awaiting Confirmation' 
  | 'Recorded' 
  | 'Recipient Confirmed' 
  | 'Verified' 
  | 'Disputed';

export interface PayoutRecord {
  id: string;
  bishiId: string;
  bishiName: string;
  monthNumber: number;
  monthName: string;
  recipientId: string;
  recipientName: string;
  recipientAvatar: string;
  amount: number;
  scheduledDate: string;
  actualDate?: string;
  status: PayoutStatus;
  paymentMethod?: PaymentMethod;
  transactionRef?: string;
  proofDocumentUrl?: string;
  recordHash: string;
  blockchainTxHash?: string;
  isVerifiedOnChain: boolean;
}

export type LedgerEventType = 
  | 'Bishi Created'
  | 'Member Joined'
  | 'Rules Approved'
  | 'Contribution Recorded'
  | 'Contribution Verified'
  | 'Payout Scheduled'
  | 'Payout Recorded'
  | 'Payout Confirmed'
  | 'Document Uploaded'
  | 'Blockchain Anchor Created'
  | 'Dispute Raised'
  | 'Dispute Resolved';

export interface LedgerEvent {
  id: string;
  bishiId: string;
  bishiName: string;
  timestamp: string;
  eventType: LedgerEventType;
  actor: {
    id: string;
    name: string;
    role: string;
  };
  description: string;
  recordId: string;
  recordHash: string;
  blockNumber?: number;
  blockchainTxHash?: string;
  verificationStatus: 'Verified' | 'Pending' | 'Flagged';
}

export interface DocumentRecord {
  id: string;
  bishiId: string;
  bishiName: string;
  title: string;
  category: 'Agreement' | 'Group Rules' | 'Contribution Receipt' | 'Payout Receipt' | 'Audit Report' | 'Identity Verification';
  uploadedBy: string;
  uploadDate: string;
  fileSize: string;
  version: string;
  sha256Hash: string;
  blockchainAnchored: boolean;
  blockNumber?: number;
  txHash?: string;
  previewUrl?: string;
}

export type DisputeStatus = 'Open' | 'Under Review' | 'Resolved' | 'Rejected';

export interface DisputeRecord {
  id: string;
  bishiId: string;
  bishiName: string;
  category: 'Contribution Record' | 'Payout Discrepancy' | 'Schedule Change' | 'Member Conduct' | 'Document Hash';
  raisedBy: {
    id: string;
    name: string;
    avatar: string;
  };
  raisedDate: string;
  targetRecordId: string;
  targetRecordType: 'Contribution' | 'Payout' | 'Schedule' | 'Document';
  description: string;
  evidenceUrl?: string;
  status: DisputeStatus;
  organizerResponse?: string;
  resolvedDate?: string;
}

export interface BlockchainBlock {
  blockNumber: number;
  timestamp: string;
  hash: string;
  prevHash: string;
  transactionsCount: number;
  recordsAnchored: number;
  validator: string;
  gasUsed: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'contribution' | 'payout' | 'verification' | 'dispute' | 'system';
  read: boolean;
  link?: string;
}
