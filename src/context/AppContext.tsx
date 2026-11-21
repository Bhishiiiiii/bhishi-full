import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  UserRole, 
  BishiGroup, 
  Member, 
  ContributionRecord, 
  PayoutRecord, 
  LedgerEvent, 
  DocumentRecord, 
  DisputeRecord, 
  BlockchainBlock, 
  NotificationItem 
} from '../types';
import { 
  INITIAL_MEMBERS, 
  INITIAL_BISHIS, 
  INITIAL_CONTRIBUTIONS, 
  INITIAL_PAYOUTS, 
  INITIAL_LEDGER_EVENTS, 
  INITIAL_DOCUMENTS, 
  INITIAL_DISPUTES, 
  INITIAL_BLOCKS, 
  INITIAL_NOTIFICATIONS 
} from '../data/mockData';
import { generateSimulatedHash, generateTxHash } from '../utils/cryptoSim';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
}

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  currentUser: Member;
  bishis: BishiGroup[];
  selectedBishiId: string;
  setSelectedBishiId: (id: string) => void;
  selectedBishi: BishiGroup | undefined;
  members: Member[];
  contributions: ContributionRecord[];
  payouts: PayoutRecord[];
  ledgerEvents: LedgerEvent[];
  documents: DocumentRecord[];
  disputes: DisputeRecord[];
  blocks: BlockchainBlock[];
  notifications: NotificationItem[];
  unreadNotificationCount: number;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  
  // Actions
  createBishi: (bishiData: Omit<BishiGroup, 'id' | 'contractAddress' | 'rulesHash'>) => BishiGroup;
  recordContribution: (data: {
    bishiId: string;
    memberId: string;
    amount: number;
    paymentMethod: 'UPI' | 'Bank Transfer' | 'Cash' | 'Other';
    transactionRef: string;
    periodMonth: number;
    monthName: string;
    notes?: string;
  }) => void;
  verifyContributionOnChain: (contributionId: string) => void;
  confirmPayout: (payoutId: string, proofRef?: string) => void;
  inviteMember: (bishiId: string, memberData: { name: string; phone: string; email: string }) => void;
  uploadDocument: (docData: {
    bishiId: string;
    title: string;
    category: DocumentRecord['category'];
    fileSize: string;
  }) => void;
  raiseDispute: (disputeData: {
    bishiId: string;
    category: DisputeRecord['category'];
    targetRecordId: string;
    targetRecordType: DisputeRecord['targetRecordType'];
    description: string;
  }) => void;
  resolveDispute: (disputeId: string, responseNote: string, status: 'Resolved' | 'Rejected') => void;
  
  // UI & Search
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  toasts: ToastMessage[];
  addToast: (type: ToastMessage['type'], title: string, message: string) => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('organizer');
  const [bishis, setBishis] = useState<BishiGroup[]>(INITIAL_BISHIS);
  const [selectedBishiId, setSelectedBishiId] = useState<string>('bishi-1');
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [contributions, setContributions] = useState<ContributionRecord[]>(INITIAL_CONTRIBUTIONS);
  const [payouts, setPayouts] = useState<PayoutRecord[]>(INITIAL_PAYOUTS);
  const [ledgerEvents, setLedgerEvents] = useState<LedgerEvent[]>(INITIAL_LEDGER_EVENTS);
  const [documents, setDocuments] = useState<DocumentRecord[]>(INITIAL_DOCUMENTS);
  const [disputes, setDisputes] = useState<DisputeRecord[]>(INITIAL_DISPUTES);
  const [blocks, setBlocks] = useState<BlockchainBlock[]>(INITIAL_BLOCKS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Find active user based on role
  const currentUser: Member = React.useMemo(() => {
    if (role === 'organizer') return members.find(m => m.id === 'mem-1') || members[0];
    if (role === 'member') return members.find(m => m.id === 'mem-2') || members[1];
    if (role === 'auditor') return members.find(m => m.id === 'mem-8') || members[7];
    // admin fallback
    return {
      id: 'admin-1',
      name: 'Central Protocol Admin',
      phone: '+91 99000 00001',
      email: 'admin@bishi.network',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      role: 'Organizer',
      joinedDate: 'Jan 2026',
      complianceScore: 100,
      status: 'Active',
      totalContributed: 0,
      totalReceived: 0,
      verified: true
    };
  }, [role, members]);

  const selectedBishi = bishis.find(b => b.id === selectedBishiId) || bishis[0];

  const addToast = (type: ToastMessage['type'], title: string, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    addToast('info', 'Notifications Cleared', 'All notices marked as read.');
  };

  const unreadNotificationCount = notifications.filter(n => !n.read).length;

  // Create Bishi
  const createBishi = (bishiData: Omit<BishiGroup, 'id' | 'contractAddress' | 'rulesHash'>): BishiGroup => {
    const newId = `bishi-${Date.now().toString().slice(-4)}`;
    const contractAddress = generateSimulatedHash(`contract-${newId}`).slice(0, 42);
    const rulesHash = generateSimulatedHash(`rules-${bishiData.name}-${bishiData.payoutRule}`);
    
    const newBishi: BishiGroup = {
      ...bishiData,
      id: newId,
      contractAddress,
      rulesHash
    };

    setBishis(prev => [newBishi, ...prev]);
    setSelectedBishiId(newId);

    // Add ledger event
    const newEvent: LedgerEvent = {
      id: `evt-${Date.now()}`,
      bishiId: newId,
      bishiName: newBishi.name,
      timestamp: 'Just now',
      eventType: 'Bishi Created',
      actor: { id: currentUser.id, name: currentUser.name, role: currentUser.role },
      description: `Bishi group initialized with ₹${newBishi.monthlyContribution.toLocaleString()} contribution & ${newBishi.payoutRule}. Rules digest registered.`,
      recordId: newId,
      recordHash: rulesHash,
      blockNumber: blocks[0].blockNumber + 1,
      blockchainTxHash: generateTxHash(),
      verificationStatus: 'Verified'
    };
    setLedgerEvents(prev => [newEvent, ...prev]);

    // Create Charter document
    const newDoc: DocumentRecord = {
      id: `doc-${Date.now()}`,
      bishiId: newId,
      bishiName: newBishi.name,
      title: `${newBishi.name} Charter & Non-Auction Rules`,
      category: 'Agreement',
      uploadedBy: currentUser.name,
      uploadDate: 'Today',
      fileSize: '1.2 MB',
      version: 'v1.0',
      sha256Hash: rulesHash,
      blockchainAnchored: true,
      blockNumber: blocks[0].blockNumber + 1,
      txHash: newEvent.blockchainTxHash
    };
    setDocuments(prev => [newDoc, ...prev]);

    addToast('success', 'Bishi Created Successfully', `${newBishi.name} is now ready for member invites.`);
    return newBishi;
  };

  // Record Contribution
  const recordContribution = (data: {
    bishiId: string;
    memberId: string;
    amount: number;
    paymentMethod: 'UPI' | 'Bank Transfer' | 'Cash' | 'Other';
    transactionRef: string;
    periodMonth: number;
    monthName: string;
    notes?: string;
  }) => {
    const member = members.find(m => m.id === data.memberId) || { name: 'Member', avatar: '' };
    const bishi = bishis.find(b => b.id === data.bishiId) || { name: 'Bishi Group' };
    const recordHash = generateSimulatedHash(`${data.bishiId}-${data.memberId}-${data.amount}-${data.transactionRef}`);
    const txHash = generateTxHash();

    const newRecord: ContributionRecord = {
      id: `cnt-${Date.now().toString().slice(-4)}`,
      bishiId: data.bishiId,
      bishiName: bishi.name,
      memberId: data.memberId,
      memberName: member.name,
      memberAvatar: (member as Member).avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      periodMonth: data.periodMonth,
      monthName: data.monthName,
      amount: data.amount,
      paymentMethod: data.paymentMethod,
      transactionRef: data.transactionRef,
      receiptUrl: `https://bishi.network/receipts/rcpt-${Date.now().toString().slice(-6)}.pdf`,
      status: 'Paid',
      dueDate: '15th of month',
      paidDate: 'Today',
      recordHash,
      blockchainTxHash: txHash,
      isVerifiedOnChain: false,
      notes: data.notes
    };

    setContributions(prev => [newRecord, ...prev]);

    // Ledger event
    const newEvent: LedgerEvent = {
      id: `evt-${Date.now()}`,
      bishiId: data.bishiId,
      bishiName: bishi.name,
      timestamp: 'Just now',
      eventType: 'Contribution Recorded',
      actor: { id: currentUser.id, name: currentUser.name, role: currentUser.role },
      description: `Payment of ₹${data.amount.toLocaleString()} recorded for ${member.name} (${data.monthName}) via ${data.paymentMethod}.`,
      recordId: newRecord.id,
      recordHash,
      verificationStatus: 'Pending'
    };
    setLedgerEvents(prev => [newEvent, ...prev]);

    addToast('success', 'Payment Recorded', `₹${data.amount.toLocaleString()} logged for ${member.name}.`);
  };

  // Verify Contribution on Chain
  const verifyContributionOnChain = (contributionId: string) => {
    const target = contributions.find(c => c.id === contributionId);
    if (!target) return;

    const blockNum = blocks[0].blockNumber + 1;
    const tx = target.blockchainTxHash || generateTxHash();

    setContributions(prev => prev.map(c => 
      c.id === contributionId 
        ? { ...c, status: 'Verified', isVerifiedOnChain: true, blockchainTxHash: tx }
        : c
    ));

    const newEvent: LedgerEvent = {
      id: `evt-${Date.now()}`,
      bishiId: target.bishiId,
      bishiName: target.bishiName,
      timestamp: 'Just now',
      eventType: 'Contribution Verified',
      actor: { id: currentUser.id, name: currentUser.name, role: currentUser.role },
      description: `Cryptographic state verification anchored in Block #${blockNum} for ${target.memberName}.`,
      recordId: target.id,
      recordHash: target.recordHash,
      blockNumber: blockNum,
      blockchainTxHash: tx,
      verificationStatus: 'Verified'
    };
    setLedgerEvents(prev => [newEvent, ...prev]);

    addToast('success', 'Blockchain Verified', `Record ${target.id} anchored to consortium ledger.`);
  };

  // Confirm Payout
  const confirmPayout = (payoutId: string, proofRef?: string) => {
    const target = payouts.find(p => p.id === payoutId);
    if (!target) return;

    const tx = generateTxHash();
    const blockNum = blocks[0].blockNumber + 1;

    setPayouts(prev => prev.map(p => 
      p.id === payoutId 
        ? { 
            ...p, 
            status: 'Verified', 
            actualDate: 'Today', 
            isVerifiedOnChain: true,
            blockchainTxHash: tx,
            transactionRef: proofRef || 'IMPS/SETTLED-TODAY'
          }
        : p
    ));

    const newEvent: LedgerEvent = {
      id: `evt-${Date.now()}`,
      bishiId: target.bishiId,
      bishiName: target.bishiName,
      timestamp: 'Just now',
      eventType: 'Payout Confirmed',
      actor: { id: currentUser.id, name: currentUser.name, role: currentUser.role },
      description: `Payout milestone of ₹${target.amount.toLocaleString()} verified & confirmed for ${target.recipientName}.`,
      recordId: target.id,
      recordHash: target.recordHash,
      blockNumber: blockNum,
      blockchainTxHash: tx,
      verificationStatus: 'Verified'
    };
    setLedgerEvents(prev => [newEvent, ...prev]);

    addToast('success', 'Payout Milestone Confirmed', `₹${target.amount.toLocaleString()} distributed to ${target.recipientName}.`);
  };

  // Invite Member
  const inviteMember = (bishiId: string, memberData: { name: string; phone: string; email: string }) => {
    const newMember: Member = {
      id: `mem-${Date.now().toString().slice(-4)}`,
      name: memberData.name,
      phone: memberData.phone,
      email: memberData.email,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      role: 'Member',
      joinedDate: 'Pending',
      complianceScore: 100,
      status: 'Invited',
      totalContributed: 0,
      totalReceived: 0,
      verified: false
    };

    setMembers(prev => [...prev, newMember]);
    addToast('info', 'Invitation Dispatched', `Invite link sent to ${memberData.name} via WhatsApp/Email.`);
  };

  // Upload Document
  const uploadDocument = (docData: {
    bishiId: string;
    title: string;
    category: DocumentRecord['category'];
    fileSize: string;
  }) => {
    const bishi = bishis.find(b => b.id === docData.bishiId);
    const hash = generateSimulatedHash(`doc-${docData.title}-${Date.now()}`);
    const tx = generateTxHash();

    const newDoc: DocumentRecord = {
      id: `doc-${Date.now().toString().slice(-4)}`,
      bishiId: docData.bishiId,
      bishiName: bishi?.name || 'Community Bishi',
      title: docData.title,
      category: docData.category,
      uploadedBy: currentUser.name,
      uploadDate: 'Today',
      fileSize: docData.fileSize,
      version: 'v1.0',
      sha256Hash: hash,
      blockchainAnchored: true,
      blockNumber: blocks[0].blockNumber + 1,
      txHash: tx
    };

    setDocuments(prev => [newDoc, ...prev]);

    const newEvent: LedgerEvent = {
      id: `evt-${Date.now()}`,
      bishiId: docData.bishiId,
      bishiName: bishi?.name || 'Community Bishi',
      timestamp: 'Just now',
      eventType: 'Document Uploaded',
      actor: { id: currentUser.id, name: currentUser.name, role: currentUser.role },
      description: `New document "${docData.title}" archived in vault. Cryptographic SHA-256 fingerprint generated.`,
      recordId: newDoc.id,
      recordHash: hash,
      blockNumber: blocks[0].blockNumber + 1,
      blockchainTxHash: tx,
      verificationStatus: 'Verified'
    };
    setLedgerEvents(prev => [newEvent, ...prev]);

    addToast('success', 'Document Fingerprinted', `${docData.title} uploaded and hash anchored.`);
  };

  // Raise Dispute
  const raiseDispute = (disputeData: {
    bishiId: string;
    category: DisputeRecord['category'];
    targetRecordId: string;
    targetRecordType: DisputeRecord['targetRecordType'];
    description: string;
  }) => {
    const bishi = bishis.find(b => b.id === disputeData.bishiId);
    const newDispute: DisputeRecord = {
      id: `dsp-${Date.now().toString().slice(-4)}`,
      bishiId: disputeData.bishiId,
      bishiName: bishi?.name || 'Community Bishi',
      category: disputeData.category,
      raisedBy: {
        id: currentUser.id,
        name: currentUser.name,
        avatar: currentUser.avatar
      },
      raisedDate: 'Today',
      targetRecordId: disputeData.targetRecordId,
      targetRecordType: disputeData.targetRecordType,
      description: disputeData.description,
      status: 'Open'
    };

    setDisputes(prev => [newDispute, ...prev]);

    const newEvent: LedgerEvent = {
      id: `evt-${Date.now()}`,
      bishiId: disputeData.bishiId,
      bishiName: bishi?.name || 'Community Bishi',
      timestamp: 'Just now',
      eventType: 'Dispute Raised',
      actor: { id: currentUser.id, name: currentUser.name, role: currentUser.role },
      description: `Formal query registered regarding ${disputeData.targetRecordType} ${disputeData.targetRecordId}.`,
      recordId: newDispute.id,
      recordHash: generateSimulatedHash(newDispute.id),
      verificationStatus: 'Flagged'
    };
    setLedgerEvents(prev => [newEvent, ...prev]);

    addToast('warning', 'Dispute Registered', 'The organizer has been notified for formal review.');
  };

  // Resolve Dispute
  const resolveDispute = (disputeId: string, responseNote: string, status: 'Resolved' | 'Rejected') => {
    setDisputes(prev => prev.map(d => 
      d.id === disputeId 
        ? { ...d, status, organizerResponse: responseNote, resolvedDate: 'Today' }
        : d
    ));

    const newEvent: LedgerEvent = {
      id: `evt-${Date.now()}`,
      bishiId: selectedBishiId,
      bishiName: selectedBishi?.name || 'Community Bishi',
      timestamp: 'Just now',
      eventType: 'Dispute Resolved',
      actor: { id: currentUser.id, name: currentUser.name, role: currentUser.role },
      description: `Dispute ${disputeId} closed with status "${status}". Audit response logged.`,
      recordId: disputeId,
      recordHash: generateSimulatedHash(`resolution-${disputeId}`),
      verificationStatus: 'Verified'
    };
    setLedgerEvents(prev => [newEvent, ...prev]);

    addToast('info', `Dispute ${status}`, 'Audit ledger updated with resolution note.');
  };

  // Global keydown for Cmd+K command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <AppContext.Provider value={{
      role,
      setRole,
      currentUser,
      bishis,
      selectedBishiId,
      setSelectedBishiId,
      selectedBishi,
      members,
      contributions,
      payouts,
      ledgerEvents,
      documents,
      disputes,
      blocks,
      notifications,
      unreadNotificationCount,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      createBishi,
      recordContribution,
      verifyContributionOnChain,
      confirmPayout,
      inviteMember,
      uploadDocument,
      raiseDispute,
      resolveDispute,
      commandPaletteOpen,
      setCommandPaletteOpen,
      toasts,
      addToast,
      removeToast
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
