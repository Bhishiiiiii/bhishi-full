import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  UserRole, 
  BishiGroup, 
  Member, 
  ContributionRecord, 
  PaymentMethod,
  PayoutRecord, 
  LedgerEvent, 
  DocumentRecord, 
  DisputeRecord, 
  BlockchainBlock, 
  NotificationItem 
} from '../types';
import api, { BlockchainProof } from '../services/api';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
}

export interface BlockchainNetworkStatus {
  network: string;
  chainId: number;
  contractAddress: string;
  rpcConnected: boolean;
  currentBlockHeight: number;
  totalAnchoredRecords: number;
  relayerAddress: string;
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
  blockchainProofs: BlockchainProof[];
  notifications: NotificationItem[];
  unreadNotificationCount: number;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  
  // Live Backend & Blockchain connectivity
  isBackendConnected: boolean;
  blockchainStatus: BlockchainNetworkStatus | null;
  refreshData: () => Promise<void>;
  isInitialLoading: boolean;
  overviewStats: any;
  overviewChartData: Array<{ month: string; contributions: number; payouts: number }>;
  myDues: ContributionRecord[];
  pendingConfirmations: ContributionRecord[];

  // Authentication & Session
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<any>;
  registerUser: (data: { name: string; email: string; password: string; phone: string; role?: 'member' | 'organizer' }) => Promise<any>;
  quickDemoLogin: (roleKey: 'organizer' | 'member' | 'auditor') => Promise<any>;
  logout: () => void;

  // Actions
  createBishi: (bishiData: Omit<BishiGroup, 'id' | 'contractAddress' | 'rulesHash'>) => Promise<BishiGroup>;
  recordContribution: (data: {
    bishiId: string;
    memberId: string;
    amount: number;
    paymentMethod: PaymentMethod;
    transactionRef: string;
    periodMonth: number;
    monthName: string;
    notes?: string;
  }) => Promise<void>;
  verifyContributionOnChain: (contributionId: string) => Promise<void>;
  submitPayment: (id: string, data: { paymentMethod: string; utr?: string; paidAt?: string; note?: string }) => Promise<void>;
  organizerConfirmContribution: (id: string) => Promise<void>;
  organizerRejectContribution: (id: string, reason: string) => Promise<void>;
  confirmPayout: (payoutId: string, proofRef?: string) => Promise<void>;
  inviteMember: (bishiId: string, memberData: { name: string; phone: string; email?: string }) => Promise<void>;
  uploadDocument: (docData: {
    bishiId: string;
    title: string;
    category: DocumentRecord['category'];
    fileSize: string;
    content?: string;
  }) => Promise<void>;
  raiseDispute: (disputeData: {
    bishiId: string;
    category: DisputeRecord['category'];
    targetRecordId: string;
    targetRecordType: DisputeRecord['targetRecordType'];
    description: string;
    evidenceUrl?: string;
  }) => Promise<void>;
  resolveDispute: (disputeId: string, responseNote: string, status: 'Resolved' | 'Rejected') => Promise<void>;
  
  // UI & Search
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  toasts: ToastMessage[];
  addToast: (type: ToastMessage['type'], title: string, message: string) => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<UserRole>('organizer');
  const [bishis, setBishis] = useState<BishiGroup[]>([]);
  const [selectedBishiId, setSelectedBishiId] = useState<string>('bishi-1');
  const [members, setMembers] = useState<Member[]>([]);
  const [contributions, setContributions] = useState<ContributionRecord[]>([]);
  const [payouts, setPayouts] = useState<PayoutRecord[]>([]);
  const [ledgerEvents, setLedgerEvents] = useState<LedgerEvent[]>([]);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [disputes, setDisputes] = useState<DisputeRecord[]>([]);
  const [blocks, setBlocks] = useState<BlockchainBlock[]>([]);
  const [blockchainProofs, setBlockchainProofs] = useState<BlockchainProof[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);
  const [blockchainStatus, setBlockchainStatus] = useState<BlockchainNetworkStatus | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [overviewStats, setOverviewStats] = useState<any>(null);
  const [overviewChartData, setOverviewChartData] = useState<Array<{ month: string; contributions: number; payouts: number }>>([]);
  const [myDues, setMyDues] = useState<ContributionRecord[]>([]);
  const [pendingConfirmations, setPendingConfirmations] = useState<ContributionRecord[]>([]);

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('bishi_auth_token');
      const loggedOut = localStorage.getItem('bishi_logged_out');
      return Boolean(token && loggedOut !== 'true');
    }
    return false;
  });

  const [currentUserState, setCurrentUserState] = useState<Member | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('bishi_user');
        if (stored) return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    return null;
  });

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
  };

  const currentUser: Member = React.useMemo(() => {
    if (currentUserState) return currentUserState;
    if (members.length > 0) {
      if (role === 'organizer') return members.find(m => m.id === 'mem-1') || members[0];
      if (role === 'member') return members.find(m => m.id === 'mem-2') || members[0];
      if (role === 'auditor') return members.find(m => m.id === 'mem-8') || members[0];
    }
    return {
      id: 'mem-1',
      name: 'Ananya Deshmukh',
      phone: '+91 98201 44521',
      email: 'ananya.d@sunrise-circle.in',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      role: 'Organizer',
      displayRole: 'Organizer',
      joinedDate: 'Jan 2026',
      complianceScore: 100,
      status: 'Active',
      totalContributed: 14000,
      totalReceived: 0,
      verified: true
    };
  }, [currentUserState, role, members]);

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
    api.markNotificationRead(id).catch(() => {});
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    addToast('info', 'Notifications Cleared', 'All notices marked as read.');
    api.markAllNotificationsRead().catch(() => {});
  };

  const unreadNotificationCount = notifications.filter(n => !n.read).length;

  // Refresh live data from backend API
  const refreshData = async () => {
    try {
      const [
        groupsRes,
        contribsRes,
        payoutsRes,
        ledgerRes,
        docsRes,
        disputesRes,
        blocksRes,
        proofsRes,
        usersRes,
        notifsRes,
        statusRes,
        overviewRes,
        duesRes,
        pendingRes
      ] = await Promise.allSettled([
        api.getGroups(),
        api.getContributions(),
        api.getPayouts(),
        api.getLedger(),
        api.getDocuments(),
        api.getDisputes(),
        api.getBlocks(),
        api.getBlockchainProofs(),
        api.getUsers(),
        api.getNotifications(),
        api.getBlockchainStatus(),
        api.getDashboardOverview(),
        api.getMyDues().catch(() => ({ success: false, dues: [] })),
        api.getPendingConfirmations().catch(() => ({ success: false, pending: [] }))
      ]);

      let anySuccess = false;

      if (groupsRes.status === 'fulfilled' && groupsRes.value?.groups) {
        setBishis(groupsRes.value.groups);
        if (groupsRes.value.groups.length > 0 && !selectedBishiId) {
          setSelectedBishiId(groupsRes.value.groups[0].id);
        }
        anySuccess = true;
      }
      if (contribsRes.status === 'fulfilled' && contribsRes.value?.contributions) {
        setContributions(contribsRes.value.contributions);
        anySuccess = true;
      }
      if (duesRes.status === 'fulfilled' && (duesRes.value as any)?.dues) {
        setMyDues((duesRes.value as any).dues);
      }
      if (pendingRes.status === 'fulfilled' && (pendingRes.value as any)?.pending) {
        setPendingConfirmations((pendingRes.value as any).pending);
      }
      if (payoutsRes.status === 'fulfilled' && payoutsRes.value?.payouts) {
        setPayouts(payoutsRes.value.payouts);
        anySuccess = true;
      }
      if (ledgerRes.status === 'fulfilled' && ledgerRes.value?.events) {
        setLedgerEvents(ledgerRes.value.events);
        anySuccess = true;
      }
      if (docsRes.status === 'fulfilled' && docsRes.value?.documents) {
        setDocuments(docsRes.value.documents);
        anySuccess = true;
      }
      if (disputesRes.status === 'fulfilled' && disputesRes.value?.disputes) {
        setDisputes(disputesRes.value.disputes);
        anySuccess = true;
      }
      if (blocksRes.status === 'fulfilled' && blocksRes.value?.blocks) {
        setBlocks(blocksRes.value.blocks);
        anySuccess = true;
      }
      if (proofsRes.status === 'fulfilled' && proofsRes.value?.proofs) {
        setBlockchainProofs(proofsRes.value.proofs);
        anySuccess = true;
      }
      if (usersRes.status === 'fulfilled' && usersRes.value?.users) {
        setMembers(usersRes.value.users);
        anySuccess = true;
      }
      if (notifsRes.status === 'fulfilled' && notifsRes.value?.notifications) {
        setNotifications(notifsRes.value.notifications);
        anySuccess = true;
      }
      if (statusRes.status === 'fulfilled' && statusRes.value?.status) {
        setBlockchainStatus(statusRes.value.status);
        anySuccess = true;
      }
      if (overviewRes.status === 'fulfilled' && overviewRes.value?.stats) {
        setOverviewStats(overviewRes.value.stats);
        if (overviewRes.value.chartData) {
          setOverviewChartData(overviewRes.value.chartData);
        }
        anySuccess = true;
      }

      setIsBackendConnected(anySuccess);
    } catch (err) {
      console.warn('Backend fetch failed:', err);
      setIsBackendConnected(false);
    } finally {
      setIsInitialLoading(false);
    }
  };

  // Mount effect: Verify token session with /api/auth/me
  useEffect(() => {
    const initializeAuth = async () => {
      const token = api.getToken();
      const isExplicitlyLoggedOut = typeof window !== 'undefined' && localStorage.getItem('bishi_logged_out') === 'true';

      if (token && !isExplicitlyLoggedOut) {
        try {
          const res = await api.getCurrentUser();
          if (res?.user) {
            setCurrentUserState(res.user);
            setRoleState(res.user.role as UserRole);
            setIsAuthenticated(true);
            await refreshData();
            return;
          }
        } catch {
          // Token expired or invalid
          api.clearToken();
          setIsAuthenticated(false);
          setCurrentUserState(null);
        }
      } else {
        setIsAuthenticated(false);
        setCurrentUserState(null);
      }
      setIsInitialLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await api.login(email, password);
      if (res && res.user) {
        setCurrentUserState(res.user);
        if (res.user.role) {
          setRoleState(res.user.role as UserRole);
        }
        setIsAuthenticated(true);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('bishi_logged_out');
          localStorage.setItem('bishi_user', JSON.stringify(res.user));
        }
        await refreshData();
        addToast('success', 'Logged In', `Welcome back, ${res.user.name}`);
        return res;
      }
    } catch (err: any) {
      addToast('error', 'Login Failed', err.message || 'Invalid email or password');
      throw err;
    }
  };

  const registerUser = async (data: { name: string; email: string; password: string; phone: string; role?: 'member' | 'organizer' }) => {
    try {
      const res = await api.register(data);
      if (res && res.user) {
        setCurrentUserState(res.user);
        if (res.user.role) {
          setRoleState(res.user.role as UserRole);
        }
        setIsAuthenticated(true);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('bishi_logged_out');
          localStorage.setItem('bishi_user', JSON.stringify(res.user));
        }
        await refreshData();
        addToast('success', 'Account Created', `Welcome to Bishi, ${res.user.name}`);
        return res;
      }
    } catch (err: any) {
      addToast('error', 'Registration Failed', err.message || 'Registration error');
      throw err;
    }
  };

  const quickDemoLogin = async (roleKey: 'organizer' | 'member' | 'auditor') => {
    let email = 'ananya.d@sunrise-circle.in';
    if (roleKey === 'member') email = 'meera.joshi@pune-ventures.com';
    if (roleKey === 'auditor') email = 'raman.audits@consortium-verify.in';

    try {
      const res = await api.login(email, 'password123');
      if (res && res.user) {
        setCurrentUserState(res.user);
        setRoleState(roleKey);
        setIsAuthenticated(true);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('bishi_logged_out');
          localStorage.setItem('bishi_user', JSON.stringify(res.user));
        }
        await refreshData();
        addToast('success', 'Demo Login Active', `Authenticated as ${res.user.name} (${res.user.displayRole || res.user.role})`);
        return res;
      }
    } catch (err: any) {
      addToast('error', 'Demo Login Failed', err.message || 'Demo authentication failed');
      throw err;
    }
  };

  const logout = () => {
    api.clearToken();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('bishi_user');
      localStorage.setItem('bishi_logged_out', 'true');
    }
    setIsAuthenticated(false);
    setCurrentUserState(null);
    setBishis([]);
    setContributions([]);
    setPayouts([]);
    setLedgerEvents([]);
    setDocuments([]);
    setDisputes([]);
    setMyDues([]);
    setPendingConfirmations([]);
    setOverviewStats(null);
    addToast('info', 'Logged Out', 'Your session has been securely closed.');
  };

  // Actions wired directly to Live API
  const createBishi = async (bishiData: Omit<BishiGroup, 'id' | 'contractAddress' | 'rulesHash'>): Promise<BishiGroup> => {
    try {
      const res = await api.createBishi(bishiData);
      if (res && res.bishi) {
        setSelectedBishiId(res.bishi.id);
        await refreshData();
        addToast('success', 'Bishi Anchored on Sepolia', `${res.bishi.name} created and registered.`);
        return res.bishi;
      }
      throw new Error('Failed to create Bishi group');
    } catch (err: any) {
      addToast('error', 'Creation Failed', err.message || 'Error creating Bishi group');
      throw err;
    }
  };

  const recordContribution = async (data: {
    bishiId: string;
    memberId: string;
    amount: number;
    paymentMethod: PaymentMethod;
    transactionRef: string;
    periodMonth: number;
    monthName: string;
    notes?: string;
  }) => {
    try {
      const res = await api.recordContribution(data);
      if (res && res.contribution) {
        await refreshData();
        addToast('success', 'Payment Recorded & Anchored', `₹${data.amount.toLocaleString()} logged and anchored on Sepolia.`);
        return;
      }
      throw new Error('Failed to record contribution');
    } catch (err: any) {
      addToast('error', 'Record Payment Failed', err.message || 'Error recording payment');
      throw err;
    }
  };

  const verifyContributionOnChain = async (contributionId: string) => {
    try {
      const res = await api.confirmContribution(contributionId);
      if (res && res.contribution) {
        await refreshData();
        addToast('success', 'Blockchain Verified', `Record ${contributionId} verified on Sepolia.`);
        return;
      }
      throw new Error('Failed to verify contribution');
    } catch (err: any) {
      addToast('error', 'Verification Failed', err.message || 'Error verifying contribution');
      throw err;
    }
  };

  const submitPayment = async (id: string, data: { paymentMethod: string; utr?: string; paidAt?: string; note?: string }) => {
    try {
      const res = await api.submitPayment(id, data);
      if (res && res.success) {
        await refreshData();
        addToast('success', 'Payment Submitted', 'Your payment reference has been submitted. Awaiting organizer confirmation.');
        return;
      }
      throw new Error(res?.message || 'Failed to submit payment');
    } catch (err: any) {
      addToast('error', 'Payment Submission Failed', err.message || 'Error submitting payment');
      throw err;
    }
  };

  const organizerConfirmContribution = async (id: string) => {
    try {
      const res = await api.organizerConfirmContribution(id);
      if (res && res.success) {
        await refreshData();
        addToast('success', 'Contribution Confirmed', 'Payment verified and cryptographic hash anchored on Sepolia.');
        return;
      }
      throw new Error(res?.message || 'Failed to confirm contribution');
    } catch (err: any) {
      addToast('error', 'Confirmation Failed', err.message || 'Error confirming payment');
      throw err;
    }
  };

  const organizerRejectContribution = async (id: string, reason: string) => {
    try {
      const res = await api.organizerRejectContribution(id, reason);
      if (res && res.success) {
        await refreshData();
        addToast('info', 'Payment Rejected', 'Submission rejected. Member has been notified to resubmit.');
        return;
      }
      throw new Error(res?.message || 'Failed to reject contribution');
    } catch (err: any) {
      addToast('error', 'Rejection Failed', err.message || 'Error rejecting payment');
      throw err;
    }
  };

  const confirmPayout = async (payoutId: string, proofRef?: string) => {
    try {
      const res = await api.confirmPayout(payoutId, proofRef);
      if (res && res.payout) {
        await refreshData();
        addToast('success', 'Payout Milestone Confirmed', `Disbursement confirmed and anchored on Sepolia.`);
        return;
      }
      throw new Error('Failed to confirm payout');
    } catch (err: any) {
      addToast('error', 'Payout Confirmation Failed', err.message || 'Error confirming payout');
      throw err;
    }
  };

  const inviteMember = async (bishiId: string, memberData: { name: string; phone: string; email?: string }) => {
    try {
      const res = await api.inviteMember(bishiId, memberData);
      if (res && res.member) {
        await refreshData();
        addToast('info', 'Invitation Dispatched', `Invite link sent to ${memberData.name}.`);
        return;
      }
      throw new Error('Failed to invite member');
    } catch (err: any) {
      addToast('error', 'Invitation Failed', err.message || 'Error inviting member');
      throw err;
    }
  };

  const uploadDocument = async (docData: {
    bishiId: string;
    title: string;
    category: DocumentRecord['category'];
    fileSize: string;
    content?: string;
  }) => {
    try {
      const res = await api.uploadDocument(docData);
      if (res && res.document) {
        await refreshData();
        addToast('success', 'Document Fingerprinted', `${docData.title} uploaded and hash anchored on Sepolia.`);
        return;
      }
      throw new Error('Failed to upload document');
    } catch (err: any) {
      addToast('error', 'Upload Failed', err.message || 'Error uploading document');
      throw err;
    }
  };

  const raiseDispute = async (disputeData: {
    bishiId: string;
    category: DisputeRecord['category'];
    targetRecordId: string;
    targetRecordType: DisputeRecord['targetRecordType'];
    description: string;
    evidenceUrl?: string;
  }) => {
    try {
      const res = await api.raiseDispute(disputeData);
      if (res && res.dispute) {
        await refreshData();
        addToast('warning', 'Dispute Registered', 'The organizer has been notified for formal review.');
        return;
      }
      throw new Error('Failed to raise dispute');
    } catch (err: any) {
      addToast('error', 'Dispute Error', err.message || 'Error registering dispute');
      throw err;
    }
  };

  const resolveDispute = async (disputeId: string, responseNote: string, status: 'Resolved' | 'Rejected') => {
    try {
      const res = await api.resolveDispute(disputeId, responseNote, status);
      if (res && res.dispute) {
        await refreshData();
        addToast('info', `Dispute ${status}`, 'Audit ledger updated with resolution note.');
        return;
      }
      throw new Error('Failed to resolve dispute');
    } catch (err: any) {
      addToast('error', 'Resolution Error', err.message || 'Error updating dispute');
      throw err;
    }
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
      blockchainProofs,
      notifications,
      unreadNotificationCount,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      isBackendConnected,
      blockchainStatus,
      refreshData,
      isInitialLoading,
      overviewStats,
      overviewChartData,
      myDues,
      pendingConfirmations,
      isAuthenticated,
      login,
      registerUser,
      quickDemoLogin,
      logout,
      createBishi,
      recordContribution,
      verifyContributionOnChain,
      submitPayment,
      organizerConfirmContribution,
      organizerRejectContribution,
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
